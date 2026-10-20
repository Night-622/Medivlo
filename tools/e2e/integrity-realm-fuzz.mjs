#!/usr/bin/env node
/**
 * Realm server message fuzzing (Node). Owner: Claude 6.
 *
 *   node server/build.mjs && node tools/e2e/integrity-realm-fuzz.mjs [--msgs 10000] [--seed 1]
 *
 * Starts its own DEV_AUTH realm server (own port), seats one honest player, then three hostile clients (own
 * processes, each replaying a pool of 300 varied junk messages at thousands a second) send
 * malformed messages as fast as they can: every client message type with junk payloads (wrong types, 60 KB
 * strings, huge arrays, NaN-ish and out-of-range numbers, real and made-up action names), raw garbage and
 * deep-nested JSON. Expected: the server stays up, the realm never fails a tick, the honest player keeps getting
 * snapshots (no gap over 1.5 s) and its hero stays finite and where it was, and the server's memory stays bounded.
 */
import { spawn, execFileSync } from 'node:child_process';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const MSGS = Number(arg('msgs', 10000));
let seed = Number(arg('seed', 1)) >>> 0;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const PORT = 8790 + Math.floor(Math.random() * 40);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fails = 0;
const check = (name, ok, detail = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${String(detail).slice(0, 300)})` : ''}`); if (!ok) fails++; };

const junkNum = () => pick([0, -1, 1e308, -1e308, 2 ** 53, 0.5, -0.0001, 1e-320, 'NaN', 'Infinity', null, '1', [], {}]);
const junkStr = () => pick(['', 'x', 'p:uid-honest', 'uid-honest', 'e:test', 'w_sword_wood', 'i_hp_s', 'ws:rime-capital', 'x'.repeat(60_000), '\u0000￿', '__proto__', 'constructor', 42, null, [], {}]);
const junk = (d = 0) => (d > 2 ? junkNum() : pick([junkNum, junkStr, () => Array.from({ length: d === 0 ? pick([0, 3, 5000]) : pick([0, 3]) }, () => junk(d + 1)), () => ({ a: junk(d + 1), __proto__: junk(d + 1), uid: junkStr(), x: junkNum() })])());
const ACTIONS = ['buy', 'sell', 'travel', 'respawn', 'rune', 'upgrade', 'reroll', 'imbue', 'transfer', 'craft', 'salvage', 'equip', 'unequip', 'use', 'drop', 'pickup', 'dialogue-close', 'hazard', 'revive', 'door', 'waystone', 'nonsense'];
const TYPES = ['input', 'vote', 'chat', 'hello', 'bye', 'loadout', 'duel', 'dialogue:continue', 'interact', 'act', 'state:request', 'snapshot', 'welcome', '__proto__', 'x'];
function message() {
  const t = pick(TYPES);
  const m = { type: t };
  switch (t) {
    case 'input': m.frames = pick([junk(), Array.from({ length: pick([1, 60, 3000]) }, () => ({ seq: junkNum(), t: junkNum(), move: { x: junkNum(), y: junkNum() }, aim: pick([junk(), { x: junkNum(), y: junkNum() }]), buttons: junkNum(), target: pick(['', 'e:test', 'x'.repeat(200), null, 7]) }))]); break;
    case 'act': m.domain = pick(['world', 'systems', 'narrative', junkStr()]); m.action = pick([...ACTIONS, junkStr()]); m.args = pick([junk(), { uid: junkStr(), spell: junkStr(), rune: junkStr(), remove: pick([true, 'false', 1]), affix: junkNum(), school: junkStr(), from: junkStr(), qty: junkNum(), npc: junkStr(), id: junkStr(), x: junkNum(), y: junkNum() }, undefined]); break;
    case 'loadout': m.data = pick([junk(), { classId: junkStr(), level: junkNum(), gold: junkNum(), inventory: junk(), equipment: junk(), tree: junk(), hotbar: junk(), runes: junk() }]); break;
    case 'vote': m.voteId = junkStr(); m.choice = junkNum(); break;
    case 'chat': m.text = junkStr(); break;
    case 'duel': m.target = junkStr(); m.accept = pick([true, false, junkNum()]); break;
    case 'dialogue:continue': m.sessionId = junkStr(); break;
    case 'interact': m.target = junkStr(); break;
    default: Object.assign(m, { payload: junk(), playerId: junkStr() });
  }
  return m;
}
function raw() {
  const r = rnd();
  if (r < 0.05) return 'not json {{';
  if (r < 0.08) return '['.repeat(5000) + ']'.repeat(5000); // deep nesting
  if (r < 0.10) return JSON.stringify({ type: 'act', domain: 'systems', action: 'buy', args: JSON.parse('{"a":' + '{"a":'.repeat(800) + '1' + '}'.repeat(800) + '}') });
  if (r < 0.12) return 'x'.repeat(63_000);
  let s;
  try { s = JSON.stringify(message()); } catch { return "x".repeat(2000); } // too big to even encode: the 64 KB frame cap stops it anyway
  return s.length > 64_000 ? s.slice(0, 64_000) : s;
}

// ───────── child role: one hostile client (its own process, so generating junk never stalls the honest player) ─────────
if (arg('bad', null)) {
  const port = Number(arg('port', 0)), uid = arg('bad', '');
  seed = (seed + uid.length * 7919 + uid.charCodeAt(uid.length - 1)) >>> 0;
  const ws = new WebSocket(`ws://localhost:${port}/realm/brindlecross-peaceful`);
  await new Promise((r) => { ws.onopen = r; ws.onerror = r; });
  ws.send(JSON.stringify({ type: 'hello', playerId: '', name: uid, classId: 'warden', level: 3, firstVisit: false, token: `dev:${uid}:${uid}` }));
  await sleep(500);
  let n = 0;
  // a pool of varied junk, replayed fast: thousands of messages a second, far past every rate limit
  const pool = Array.from({ length: 300 }, raw);
  for (let i = 0; i < MSGS && ws.readyState === 1; i++) { ws.send(pool[i % pool.length]); n++; if (i % 400 === 0) await sleep(5); }
  await sleep(300); ws.close(); await sleep(200); process.stdout.write(`sent ${n}
`, () => process.exit(0));
}

const srv = spawn(process.execPath, ['dist-server/main.mjs'], { env: { ...process.env, PORT: String(PORT), DEV_AUTH: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
let log = ''; srv.stdout.on('data', (d) => (log += d)); srv.stderr.on('data', (d) => (log += d));
const memMb = () => {
  try {
    if (process.platform === 'win32') { const row = execFileSync('tasklist', ['/FI', `PID eq ${srv.pid}`, '/FO', 'CSV', '/NH']).toString(); return Number(row.split('","')[4]?.replace(/[^\d]/g, '') ?? 0) / 1024; }
    return Number(execFileSync('ps', ['-o', 'rss=', '-p', String(srv.pid)]).toString().trim()) / 1024;
  } catch { return 0; }
};

const connect = (uid, name) => new Promise((resolve) => {
  const ws = new WebSocket(`ws://localhost:${PORT}/realm/brindlecross-peaceful`);
  const c = { ws, welcome: null, snaps: [], gaps: [], last: 0, closed: false };
  ws.onopen = () => ws.send(JSON.stringify({ type: 'hello', playerId: '', name, classId: 'warden', level: 3, firstVisit: false, token: `dev:${uid}:${name}` }));
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.type === 'welcome') { c.welcome = m; resolve(c); }
    if (m.type === 'snapshot') { const now = Date.now(); if (c.last) c.gaps.push(now - c.last); c.last = now; c.snaps.push(m.snap); }
  };
  ws.onclose = () => { c.closed = true; resolve(c); };
  setTimeout(() => resolve(c), 15000);
});

try {
  for (let i = 0; i < 720; i++) { await sleep(250); try { if ((await fetch(`http://localhost:${PORT}/health`)).ok) break; } catch {} }
  const honest = await connect('uid-honest', 'Honest');
  honest.ws.send(JSON.stringify({ type: 'loadout', data: { classId: 'warden', body: 0, level: 3, xp: 0, gold: 20, inventory: [], equipment: {}, cosmetics: { back: 0, neck: 0, face: 0, extra: 0, dye: 0, headwear: 0 }, tree: {}, bonusPoints: 0, hotbar: [null, null, null, null], legendariesSeen: [], waystone: null } }));
  await sleep(1500);
  const me = () => honest.snaps.at(-1)?.entities.find((e) => e.kind === 'player' && String(e.id).includes('uid-honest'));
  const before = me();
  check('honest player seated', !!honest.welcome && !!before, JSON.stringify(before ?? null).slice(0, 120));
  const mem0 = memMb();
  honest.gaps.length = 0;
  const t0 = Date.now();
  // three hostile clients, each in its own process, far over the 120 msgs/s budget
  const outs = await Promise.all([1, 2, 3].map((i) => new Promise((resolve) => {
    const ch = spawn(process.execPath, [process.argv[1], '--bad', `uid-bad${i}`, '--port', String(PORT), '--msgs', String(MSGS), '--seed', String(seed + i)], { stdio: ['ignore', 'pipe', 'pipe'] });
    let o = ''; ch.stdout.on('data', (d) => (o += d)); ch.stderr.on('data', (d) => (o += d));
    ch.on('exit', () => resolve(o));
  })));
  const sent = outs.reduce((a, o) => a + Number(o.match(/sent (\d+)/)?.[1] ?? 0), 0);
  await sleep(2500);
  const secs = (Date.now() - t0) / 1000;
  const mem1 = memMb();
  check('server alive after the flood', (await fetch(`http://localhost:${PORT}/health`).then((r) => r.ok).catch(() => false)), `${sent} messages in ${secs.toFixed(1)} s`);
  const maxGap = Math.max(0, ...honest.gaps);
  check('the honest player kept getting snapshots (no gap over 1.5 s)', honest.gaps.length > secs * 8 && maxGap < 1500, `${honest.gaps.length} snapshots in ${secs.toFixed(1)} s, max gap ${maxGap} ms`);
  const after = me();
  const fin = (v) => typeof v === 'number' && Number.isFinite(v);
  check("the honest hero is intact (finite, same space, didn't move)", !!after && fin(after.x) && fin(after.y) && fin(after.hp) && after.space === before?.space && Math.hypot(after.x - before.x, after.y - before.y) < 1, JSON.stringify(after ?? null).slice(0, 160));
  const tickFails = (log.match(/tick failed/g) ?? []).length, uncaught = (log.match(/\[server\] (uncaught|unhandled)/g) ?? []).length;
  check('the realm never failed a tick, nothing uncaught', !tickFails && !uncaught, `tick failed ×${tickFails}, uncaught ×${uncaught}; ${log.split('\n').filter((l) => /tick failed|uncaught|unhandled/.test(l)).slice(0, 2).join(' | ')}`);
  check('server memory stays bounded', !mem0 || mem1 - mem0 < 150, `${mem0.toFixed(0)} → ${mem1.toFixed(0)} MB`);
  const slow = (log.match(/slow tick/g) ?? []).length;
  console.log(`info: slow-tick warnings ×${slow}, bad-message warnings ×${(log.match(/bad message/g) ?? []).length}`);
  honest.ws.close();
} catch (e) { check('harness', false, String(e)); }
finally { srv.kill(); await sleep(300); } // let sockets finish closing (libuv asserts on Windows otherwise)
console.log(fails ? `\nintegrity-realm-fuzz: ${fails} FAILED` : '\nintegrity-realm-fuzz: ALL PASS');
process.exit(fails ? 1 : 0);
