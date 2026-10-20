// Two tabs in one headless Chrome: tab A hosts (HostNet + LocalSignaling), tab B joins by code (GuestNet).
// Checks: WebRTC connects, welcome/session, snapshot reaches guest, chat both ways, a party vote resolves.
// Usage: node tools/e2e/coop-loopback.mjs [baseUrl]
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { acquireChrome, CHROME_PATH } from './chrome-lock.mjs';
const BASE = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'http://localhost:5199';
const PORT = 9339;
await acquireChrome('coop-loopback'); // one headless Chrome at a time across all agents (tools/e2e/chrome-lock.mjs)
const chrome = spawn(CHROME_PATH, ['--headless=new', '--mute-audio', '--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', `--remote-debugging-port=${PORT}`, `--user-data-dir=${mkdtempSync(join(process.env.SCRATCH ?? tmpdir(), 'cdp-'))}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function page(url) {
  const t = await (await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
  let id = 0; const pending = new Map();
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d.result ?? d); pending.delete(d.id); }
    if (d.method === 'Runtime.exceptionThrown') console.log('EXC', JSON.stringify(d.params.exceptionDetails).slice(0, 400)); };
  const send = (method, params = {}) => { const i = ++id; ws.send(JSON.stringify({ id: i, method, params })); return new Promise((r) => pending.set(i, r)); };
  await send('Runtime.enable');
  const ev = async (expr) => { const r = await send('Runtime.evaluate', { expression: `(async () => (${expr}))()`, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 500)); return r.result?.value; };
  return { ev, close: () => ws.close() };
}
const results = [];
const check = (name, ok, detail = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`); };
try {
  for (let i = 0; i < 40; i++) { await sleep(250); try { await fetch(`http://127.0.0.1:${PORT}/json/version`); break; } catch {} }
  const A = await page(`${BASE}/?scene=MainMenu`), B = await page(`${BASE}/?scene=MainMenu`);
  await sleep(15000);
  const code = await A.ev(`(async () => {
    const coop = await import('/src/net/coop/index.ts');
    const host = new coop.HostNet(new coop.LocalSignaling(), 'host-uid', { name: 'Hosty', classId: 'warden', level: 5, worldSeed: 42,
      hostInSafeZone: () => true, hasVisited: () => false, markVisited: () => {} });
    host.addProvider({ name: 'test', collect: (viewer) => [{ id: 'e:1', kind: 'enemy', def: 'bx_wolf', space: 'realm:rime', x: 10, y: 20, facing: 's', anim: 'idle', hp: 50, maxHp: 60, data: { viewer } }] });
    window.__host = host; window.__hostChats = []; window.__hostActs = [];
    host.on('chat', (m) => window.__hostChats.push(m.text));
    host.onClient('act', (m, from) => window.__hostActs.push([from, m.action]));
    return await host.open();
  })()`);
  check('host opened a room', typeof code === 'string' && code.length === 6, code);
  const joined = await B.ev(`(async () => {
    const coop = await import('/src/net/coop/index.ts');
    const g = await coop.GuestNet.join(new coop.LocalSignaling(), ${JSON.stringify(code)}, { playerId: 'guest-uid', name: 'Gus', classId: 'arcanist', level: 3, firstVisit: true });
    window.__guest = g; window.__snaps = []; window.__guestChats = []; window.__votes = [];
    g.addConsumer({ kinds: ['enemy'], apply: (ents) => window.__snaps.push(ents) });
    g.on('chat', (m) => window.__guestChats.push(m.text));
    g.on('vote:open', (m) => { window.__votes.push(m.vote.voteId); g.send({ type: 'vote', voteId: m.vote.voteId, choice: 1 }); });
    return { members: g.session().members.map((m) => m.name), seed: g.worldSeed, auth: g.isAuthority() };
  })()`);
  check('guest joined by code', JSON.stringify(joined.members) === '["Hosty","Gus"]' && joined.seed === 42 && joined.auth === false, JSON.stringify(joined));
  await A.ev(`(() => { window.__host.flush(2, 66); return 1; })()`);
  await sleep(800);
  const snap = await B.ev(`window.__snaps.at(-1)`);
  check('snapshot reached guest (per-viewer)', !!snap && snap[0]?.id === 'e:1' && snap[0]?.data?.viewer === 'guest-uid', JSON.stringify(snap));
  await B.ev(`(() => { window.__guest.send({ type: 'chat', text: 'hello host' }); window.__guest.send({ type: 'act', domain: 'world', action: 'travel', args: { waystone: 'ws_1' } }); return 1; })()`);
  await sleep(800);
  const hostSaw = await A.ev(`({ chats: window.__hostChats, acts: window.__hostActs })`);
  check('host received chat + act with sender', hostSaw.chats.includes('hello host') && JSON.stringify(hostSaw.acts) === '[["guest-uid","travel"]]', JSON.stringify(hostSaw));
  const guestChats = await B.ev(`window.__guestChats`);
  check('chat broadcast back to guest', guestChats.includes('hello host'), JSON.stringify(guestChats));
  const voteResult = await A.ev(`(async () => {
    const p = window.__host.openVote({ sessionId: 's1', audience: 'all', dialogueId: 'dialogue:test', nodeId: 'n1', choices: [{ index: 0, text: 'A', allowed: 'all' }, { index: 1, text: 'B', allowed: 'all' }] }, 8000);
    setTimeout(() => window.__host.send({ type: 'vote', voteId: [...window.__host['votes'].keys()][0], choice: 0 }), 300);
    return await p;
  })()`);
  check('2-player vote: 1–1 tie broken by host', voteResult === 0, String(voteResult));
  A.close(); B.close();
} catch (e) { check('harness', false, String(e).slice(0, 600)); }
finally { chrome.kill(); const f = results.filter((x) => !x).length; console.log(`\n${results.length - f}/${results.length} passed`); process.exit(f ? 1 : 0); }
