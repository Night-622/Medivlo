#!/usr/bin/env node
/**
 * Co-op HOST message fuzzing (Node, no browser). Owner: Claude 6.
 *
 *   node tools/e2e/integrity-host-fuzz.mjs [--msgs 6000] [--seed 1]      exit 0 = no failures
 *
 * Builds a real co-op host (HostNet + systems, world and narrative authorities, as WorldV2Scene/createHero do) with
 * a fake WebRTC link, seats an honest guest, then feeds a hostile guest's junk (tools/e2e/integrity/junk.mjs) through
 * the real link handler while the sim steps. A failure is: a throw out of the transport handler (uncaught in a
 * browser), a sim stepper throwing (the host's world breaks for everyone), the host's own hero, character or save
 * changed by a guest, or the honest guest losing its seat or its snapshots. Handler throws that the net layer
 * catches are listed per handler (each is a missing shape check for that handler's owner).
 */
import { build } from 'esbuild';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { makeJunk } from './integrity/junk.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const out = join(here, 'out', 'integrity', 'host.mjs');
mkdirSync(dirname(out), { recursive: true });
const fake = join(here, 'integrity', 'fake-firebase.mjs');
await build({
  entryPoints: [join(here, 'integrity', 'host-entry.ts')], bundle: true, platform: 'node', format: 'esm', outfile: out,
  tsconfig: join(root, 'tsconfig.json'), logLevel: 'error',
  alias: { 'firebase/app': fake, 'firebase/auth': fake, 'firebase/firestore': fake },
  define: { 'import.meta.env': JSON.stringify({ DEV: false }) },
});

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const MSGS = Number(arg('msgs', 6000));
let fails = 0;
const check = (name, ok, detail = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${String(detail).slice(0, 300)})` : ''}`); if (!ok) fails++; };

globalThis.localStorage = { s: {}, getItem(k) { return this.s[k] ?? null; }, setItem(k, v) { this.s[k] = String(v); }, removeItem(k) { delete this.s[k]; } };
const pcs = [];
globalThis.RTCPeerConnection = class { constructor() { this.connectionState = 'new'; pcs.push(this); } close() { this.connectionState = 'closed'; this.onconnectionstatechange?.(); } createDataChannel() {} };
// classify what the authority logs: caught handler throws (findings) vs stepper throws (failures)
const caught = new Map(), stepper = new Map();
const note = (map, k, msg) => { const e = map.get(k) ?? { n: 0, msg }; e.n++; map.set(k, e); };
const origWarn = console.warn, origErr = console.error;
console.warn = (...a) => { const s = a.map((x) => (x instanceof Error ? `${x.message}` : String(x))).join(' '); const m = s.match(/\[net\] (?:client )?'([^']+)' handler threw/); if (m) note(caught, m[1], s.slice(0, 160)); };
console.error = (...a) => { const s = a.map((x) => (x instanceof Error ? `${x.message} ${x.stack?.split('\n')[1]?.trim() ?? ''}` : String(x))).join(' '); const m = s.match(/stepper "([^"]+)" threw/); if (m) note(stepper, m[1], s.slice(0, 220)); else if (/\[bus\] handler/.test(s)) note(caught, `bus: ${s.match(/"([^"]+)"/)?.[1] ?? '?'}`, s.slice(0, 160)); };

const m = await import(pathToFileURL(out).href);
const { host, onPeer, hostId } = await m.makeHost();

const sent = [];
function link(peerId) {
  onPeer(peerId, { send() {}, onMessage() { return () => {}; }, close() {} });
  const pc = pcs.at(-1);
  const mk = (label) => ({ label, readyState: 'open', send: (s) => sent.push({ to: peerId, type: JSON.parse(s).type }) });
  const rel = mk('rel'), fast = mk('fast');
  pc.ondatachannel({ channel: rel }); pc.ondatachannel({ channel: fast });
  const say = (data) => rel.onmessage({ data: typeof data === 'string' ? data : JSON.stringify(data) });
  say({ type: 'hello', playerId: peerId, name: peerId, classId: 'warden', level: 3, firstVisit: false });
  return { say };
}
const step = (ms = 100) => { for (let t = 0; t < ms; t += 1000 / 30) m.sim.advance(1000 / 30); };
const players = () => m.Services.get('combat').players();
const fin = (v) => typeof v === 'number' && Number.isFinite(v);

step(500);
const honest = link('guest-honest');
honest.say({ type: 'loadout', data: m.newCharacter('warden') });
step(500);
const hostHero = () => players().find((p) => p.playerId === hostId);
const before = { hero: structuredClone(hostHero() ?? null), char: JSON.stringify(m.Game.state.character ?? null), quests: JSON.stringify(m.Game.state.narrative.quests), waystones: JSON.stringify(m.Game.state.world.waystones) };
check('host and honest guest seated', !!before.hero && players().some((p) => p.playerId === 'guest-honest'), players().map((p) => p.playerId).join(','));

const reached = {};
for (const t of ['act', 'loadout', 'duel', 'vote', 'chat', 'interact', 'dialogue:continue']) m.Services.get('net').onClient(t, (_msg, from) => { if (from === 'guest-bad') reached[t] = (reached[t] ?? 0) + 1; });
const bad = link('guest-bad');
const { raw } = makeJunk(Number(arg('seed', 1)), 'guest-honest');
let thrown = 0, firstThrow = '';
// the per-player rate limits would drop almost all of a burst: move the wall clock 200 ms per message so every
// message reaches its handler (the limits themselves are tested in integrity-net)
const realNow = Date.now; let skew = 0; Date.now = () => realNow() + skew;
let seq = 0;
for (let i = 0; i < MSGS; i++) {
  skew += 200;
  try { bad.say(raw()); } catch (e) { thrown++; firstThrow ||= `${e.message}`; }
  if (i % 25 === 0) { honest.say({ type: 'input', frames: [{ seq: ++seq, t: seq * 33, move: { x: 0, y: 0 }, aim: { x: 0, y: 0 }, buttons: 0, target: null }] }); step(100); }
}
sent.length = 0;
step(1000);
console.warn = origWarn; console.error = origErr;

console.log(`info: hostile messages that reached a handler: ${JSON.stringify(reached)}`);
check('the hostile guest reached the handlers (the fuzz is real)', (reached.act ?? 0) > 300 && (reached.loadout ?? 0) > 100, JSON.stringify(reached));
check('no throw escapes the host transport (uncaught in a browser)', thrown === 0, `${thrown} × ${firstThrow}`);
check('no sim stepper broke (the host world stays up for everyone)', stepper.size === 0, [...stepper].map(([k, v]) => `${k} ×${v.n}: ${v.msg}`).join(' || '));
const after = hostHero();
check("the host's hero is intact (finite, same space, didn't move)", !!after && fin(after.x) && fin(after.y) && fin(after.hp) && after.space === before.hero?.space && Math.hypot(after.x - before.hero.x, after.y - before.hero.y) < 1, JSON.stringify(after ?? null).slice(0, 160));
check("a guest can't change the host's character, quests or waystones", JSON.stringify(m.Game.state.character ?? null) === before.char && JSON.stringify(m.Game.state.narrative.quests) === before.quests && JSON.stringify(m.Game.state.world.waystones) === before.waystones);
const seat = host.session().members.find((x) => x.playerId === 'guest-honest');
check('the honest guest keeps its seat and its snapshots', !!seat?.connected && sent.filter((s) => s.to === 'guest-honest' && s.type === 'snapshot').length >= 10, `connected ${seat?.connected}, snapshots ${sent.filter((s) => s.to === 'guest-honest' && s.type === 'snapshot').length}`);
if (caught.size) {
  console.log('\ninfo: handler throws the net layer caught (missing shape checks, by handler):');
  for (const [k, v] of [...caught].sort((a, b) => b[1].n - a[1].n)) console.log(`  ${k} ×${v.n}: ${v.msg}`);
}
console.log(fails ? `\nintegrity-host-fuzz: ${fails} FAILED` : '\nintegrity-host-fuzz: ALL PASS');
process.exit(fails ? 1 : 0);
