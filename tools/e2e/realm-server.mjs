// Starts dist-server/main.mjs (DEV_AUTH, test provider) and checks: realm list, two players join, per-viewer
// snapshots, chat broadcast + profanity mask, realm count, leave. Usage: node server/build.mjs && node tools/e2e/realm-server.mjs
import { spawn } from 'node:child_process';
const PORT = 8787, BASE = `http://localhost:${PORT}`;
const srv = spawn('node', ['dist-server/main.mjs'], { env: { ...process.env, PORT: String(PORT), DEV_AUTH: '1', REALM_TEST_PROVIDER: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
let log = ''; srv.stdout.on('data', (d) => (log += d)); srv.stderr.on('data', (d) => (log += d));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = []; const check = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'} ${n}${d ? ' :: ' + d : ''}`); };
function client(uid, name, delayMs = 0, extra) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${PORT}/realm/brindlecross-peaceful?token=dev:${uid}:${name}${delayMs ? `:${delayMs}` : ''}`);
    const c = { ws, msgs: [], snaps: [], chats: [] };
    ws.onopen = () => { ws.send(JSON.stringify({ type: 'hello', playerId: '', name, classId: 'warden', level: 3, firstVisit: false })); if (extra) ws.send(JSON.stringify(extra)); };
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
  // A real Firebase token verifies against a remote JWKS: the first verify can take seconds, and the hello (sent on
  // open) must not be lost meanwhile. dev:<uid>:<name>:<ms> delays verify; a chat sent right after the hello is queued.
  const t0 = Date.now();
  const c = await client('uid-c', 'Cy', 1500, { type: 'chat', text: 'early bird' });
  check('slow token verify: hello kept, player welcomed', !!c.welcome && Date.now() - t0 >= 1400, `${Date.now() - t0} ms`);
  await sleep(600);
  check('messages sent during verify are delivered after join', c.chats.includes('early bird'), JSON.stringify(c.chats));
  c.ws.close(); await sleep(300);
  // one seat per account: the same uid joining again (a second tab or device) replaces the older connection
  const d1 = await client('uid-d', 'Di');
  let kicked = null; d1.ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.type === 'kick') kicked = m.reason; });
  const d2 = await client('uid-d', 'Di');
  await sleep(500);
  const seated = (await (await fetch(`${BASE}/realms`)).json()).find((r) => r.id === 'brindlecross-peaceful').players;
  check('same account joining twice replaces the older connection', !!d2.welcome && !!kicked && seated === 1, `kick "${kicked}", players ${seated}`);
  d2.ws.close(); await sleep(300);
  // ID token in the hello, not the URL (request logs keep URLs); the query string still works for older clients
  const caps = await (await fetch(`${BASE}/caps`)).json().catch(() => null);
  check('server advertises hello tokens', caps?.helloToken === true, JSON.stringify(caps));
  const raw = (query, hello) => new Promise((resolve) => {
    const ws = new WebSocket(`ws://localhost:${PORT}/realm/brindlecross-peaceful${query}`);
    const r = { ws, welcome: null, kick: null, chats: [] };
    ws.onopen = () => ws.send(JSON.stringify({ type: 'hello', playerId: '', classId: 'warden', level: 3, firstVisit: false, ...hello }));
    ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.type === 'welcome') { r.welcome = m; resolve(r); } if (m.type === 'kick') { r.kick = m.reason; resolve(r); } if (m.type === 'chat') r.chats.push(m.text); };
    ws.onclose = () => resolve(r);
    setTimeout(() => resolve(r), 8000);
  });
  const e1 = await raw('', { name: 'Eve', token: 'dev:uid-e:Eve' });
  check('token in the hello joins', e1.welcome?.you === 'uid-e', e1.kick ?? '');
  const n1 = await raw('', { name: 'Nobody' });
  check('no token at all is refused', !n1.welcome && /sign in/i.test(n1.kick ?? ''), n1.kick ?? 'no kick');
  const long = await raw('', { name: 'Lux', token: 'dev:uid-l:Lux', classId: 'x'.repeat(5000), level: 1e9 });
  const me = long.welcome?.session.members.find((x) => x.playerId === 'uid-l');
  check('hello fields are bounded', me && me.classId.length <= 32 && me.level <= 99, JSON.stringify({ cls: me?.classId.length, lvl: me?.level }));
  // chat flood: every line goes to everyone, so one player's burst is capped
  for (let i = 0; i < 15; i++) long.ws.send(JSON.stringify({ type: 'chat', text: `spam ${i}` }));
  await sleep(800);
  const got = e1.chats.filter((t) => t.startsWith('spam')).length;
  check('a chat flood is capped (burst of 5)', got >= 1 && got <= 6, `${got} of 15 delivered`);
  e1.ws.close(); long.ws.close(); await sleep(400);
  // gone while the token verified: no ghost seat
  const g = new WebSocket(`ws://localhost:${PORT}/realm/brindlecross-peaceful?token=dev:uid-g:Gus:1200`);
  g.onopen = () => { g.send(JSON.stringify({ type: 'hello', playerId: '', name: 'Gus', classId: 'warden', level: 1, firstVisit: false })); setTimeout(() => g.close(), 100); };
  await sleep(2200);
  const ghost = (await (await fetch(`${BASE}/realms`)).json()).find((r) => r.id === 'brindlecross-peaceful').players;
  check('leaving during a slow verify leaves no ghost seat', ghost === 0, `players ${ghost}`);
} catch (e) { check('harness', false, String(e)); }
finally {
  srv.kill(); const f = results.filter((x) => !x).length;
  if (f) console.log('--- server log ---\n' + log.slice(-2500));
  console.log(`\n${results.length - f}/${results.length} passed`); process.exit(f ? 1 : 0);
}
