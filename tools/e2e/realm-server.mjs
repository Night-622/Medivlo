// Starts dist-server/main.mjs (DEV_AUTH, test provider) and checks: realm list, two players join, per-viewer
// snapshots, chat broadcast + profanity mask, realm count, leave. Usage: node server/build.mjs && node tools/e2e/realm-server.mjs
import { spawn } from 'node:child_process';
const PORT = 8787, BASE = `http://localhost:${PORT}`;
const srv = spawn('node', ['dist-server/main.mjs'], { env: { ...process.env, PORT: String(PORT), DEV_AUTH: '1', REALM_TEST_PROVIDER: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
let log = ''; srv.stdout.on('data', (d) => (log += d)); srv.stderr.on('data', (d) => (log += d));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = []; const check = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'} ${n}${d ? ' :: ' + d : ''}`); };
function client(uid, name) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${PORT}/realm/brindlecross-peaceful?token=dev:${uid}:${name}`);
    const c = { ws, msgs: [], snaps: [], chats: [] };
    ws.onopen = () => ws.send(JSON.stringify({ type: 'hello', playerId: '', name, classId: 'warden', level: 3, firstVisit: false }));
    ws.onmessage = (e) => { const m = JSON.parse(e.data); c.msgs.push(m.type); if (m.type === 'snapshot') c.snaps.push(m.snap); if (m.type === 'chat') c.chats.push(m.text); if (m.type === 'welcome') { c.welcome = m; resolve(c); } if (m.type === 'kick') reject(new Error(m.reason)); };
    ws.onerror = () => reject(new Error('ws error'));
    setTimeout(() => reject(new Error('timeout')), 10000);
  });
}
try {
  for (let i = 0; i < 720; i++) { await sleep(250); try { if ((await fetch(`${BASE}/health`)).ok) break; } catch {} } // realms build at boot (up to 3 min under load)
  const list = await (await fetch(`${BASE}/realms`)).json();
  check('realm list', Array.isArray(list) && list.length === 4 && list.some((r) => r.rule === 'ffa'), list.map((r) => `${r.id}:${r.rule}`).join(','));
  const a = await client('uid-a', 'Ana'), b = await client('uid-b', 'Bo');
  check('two players welcomed', a.welcome.role === 'server-client' && b.welcome.you === 'uid-b');
  await sleep(1200);
  const sa = a.snaps.at(-1), sb = b.snaps.at(-1);
  check('per-viewer snapshots at ~15 Hz', a.snaps.length >= 10 && sa?.entities[0]?.data?.viewer === 'uid-a' && sb?.entities[0]?.data?.viewer === 'uid-b', `a=${a.snaps.length} snaps`);
  const sess = a.msgs.includes('session');
  check('session updates', sess);
  a.ws.send(JSON.stringify({ type: 'chat', text: 'hello shit realm' }));
  await sleep(500);
  check('chat broadcast with profanity masked', b.chats.includes('hello s*** realm') && a.chats.includes('hello s*** realm'), JSON.stringify(b.chats));
  // Systems authority (Claude 3): a loadout spawns the player's combat entity, visible to everyone in the realm.
  a.ws.send(JSON.stringify({ type: 'loadout', data: { classId: 'warden', body: 0, level: 3, xp: 0, gold: 20, inventory: [], equipment: {}, cosmetics: { back: 0, neck: 0, face: 0, extra: 0, dye: 0, headwear: 0 }, tree: {}, bonusPoints: 0, hotbar: [null, null, null, null], legendariesSeen: [], waystone: null } }));
  await sleep(800);
  const seen = (c) => c.snaps.at(-1)?.entities.find((e) => e.kind === 'player' && (e.id === 'uid-a' || e.data?.pid === 'uid-a' || String(e.id).includes('uid-a')));
  check('systems: loadout spawns a player both clients see, inside the realm space', !!seen(a) && !!seen(b) && seen(b).space === 'concordia', JSON.stringify(seen(b) ?? b.snaps.at(-1)?.entities.map((e) => e.kind + ':' + e.id)).slice(0, 200));
  const count = (await (await fetch(`${BASE}/realms`)).json()).find((r) => r.id === 'brindlecross-peaceful').players;
  check('realm reports 2 players', count === 2, String(count));
  a.ws.close(); b.ws.close(); await sleep(500);
  const after = (await (await fetch(`${BASE}/realms`)).json()).find((r) => r.id === 'brindlecross-peaceful').players;
  check('players leave cleanly', after === 0, String(after));
} catch (e) { check('harness', false, String(e)); }
finally {
  srv.kill(); const f = results.filter((x) => !x).length;
  if (f) console.log('--- server log ---\n' + log.slice(-2500));
  console.log(`\n${results.length - f}/${results.length} passed`); process.exit(f ? 1 : 0);
}
