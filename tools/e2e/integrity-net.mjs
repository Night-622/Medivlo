#!/usr/bin/env node
/**
 * Integrity checks for accounts, co-op signalling and transports, in Node (no browser, no network). Owner: Claude 6.
 * Bundles the real src/net + src/firebase code with esbuild, with Firebase swapped for in-memory fakes that model
 * the SDK's auth start-up and the project's Firestore rule for co-op knocks (tools/e2e/integrity/fake-firebase.mjs).
 *
 *   node tools/e2e/integrity-net.mjs        exit 0 = all pass
 *
 * Each check is a bug that once shipped: a restored email account replaced by a guest; a co-op guest who could
 * never rejoin a session on real Firestore; a rejoin disconnected by the old link dying late; a blocked player
 * joining under a made-up id; a voluntary leave reported as a kick; one throwing 'act' handler starving the rest.
 */
import { build } from 'esbuild';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const out = join(here, 'out', 'integrity', 'net.mjs');
mkdirSync(dirname(out), { recursive: true });
const fake = join(here, 'integrity', 'fake-firebase.mjs');
await build({
  entryPoints: [join(here, 'integrity', 'net-entry.ts')], bundle: true, platform: 'node', format: 'esm', outfile: out,
  tsconfig: join(root, 'tsconfig.json'), logLevel: 'warning',
  alias: { 'firebase/app': fake, 'firebase/auth': fake, 'firebase/firestore': fake },
  define: { 'import.meta.env': JSON.stringify({ DEV: true, VITE_FIREBASE_API_KEY: 'k', VITE_FIREBASE_PROJECT_ID: 'p' }) },
});

// ───────── browser stand-ins ─────────
globalThis.localStorage = { s: {}, getItem(k) { return this.s[k] ?? null; }, setItem(k, v) { this.s[k] = String(v); }, removeItem(k) { delete this.s[k]; } };
const pcs = [];
globalThis.RTCPeerConnection = class { constructor() { this.connectionState = 'new'; pcs.push(this); } close() { this.connectionState = 'closed'; this.onconnectionstatechange?.(); } createDataChannel() {} };
class FakeWS {
  static OPEN = 1; static last = null;
  constructor(url) { this.url = url; this.readyState = 0; this.sent = []; FakeWS.last = this; setTimeout(() => { this.readyState = 1; this.onopen?.(); }, 1); }
  send(s) {
    this.sent.push(s);
    if (JSON.parse(s).type === 'hello') setTimeout(() => this.onmessage?.({ data: JSON.stringify({ type: 'welcome', you: 'p1', role: 'server-client', worldSeed: 1, session: { kind: 'public', sessionId: 'r', joinCode: null, realmRule: 'peaceful', maxPlayers: 8, members: [] } }) }), 1);
  }
  close() { if (this.readyState === 3) return; this.readyState = 3; setTimeout(() => this.onclose?.({ code: 1000 }), 1); }
}
globalThis.WebSocket = FakeWS;
let realmCaps = null; // what GET /caps answers (null = an older server without it)
globalThis.fetch = async (url) => (String(url).endsWith('/caps') && realmCaps ? { ok: true, json: async () => realmCaps } : { ok: false, json: async () => null });

const { fakeAuth, fakeDb } = await import(pathToFileURL(fake).href);
const m = await import(pathToFileURL(out).href);
const tick = (ms = 20) => new Promise((r) => setTimeout(r, ms));

let fails = 0;
const check = (name, ok, detail = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`); if (!ok) fails++; };

// ───────── 1. accounts: ensureUser never replaces a restored account ─────────
fakeAuth.reset({ uid: 'email-user', isAnonymous: false }, 40);
let u = await m.ensureUser();
check('ensureUser keeps a restored email/username account', u.uid === 'email-user' && fakeAuth.signUps === 0 && fakeAuth.currentUser.uid === 'email-user', `got ${u.uid}, sign-ups ${fakeAuth.signUps}`);
fakeAuth.reset({ uid: 'anon-old', isAnonymous: true }, 10);
u = await m.ensureUser();
check('ensureUser reuses a restored guest', u.uid === 'anon-old' && fakeAuth.signUps === 0);
fakeAuth.reset(null, 10);
u = await m.ensureUser();
check('ensureUser signs a new player in as a guest', u.isAnonymous && fakeAuth.signUps === 1);

// ───────── 2. Firestore signalling: a guest can knock again on the same room ─────────
{
  const sig = new m.FirestoreSignaling(fakeDb);
  const peers = [];
  await sig.host('ROOM01', 'host-uid', (id, ch) => { const got = []; ch.onMessage((x) => got.push(x)); peers.push({ id, ch, got }); });
  await tick();
  const g1 = await sig.join('ROOM01', 'guest-uid');
  await tick();
  g1.send({ t: 'offer', sdp: 'first' });
  await tick();
  check('first knock reaches the host', peers.length === 1 && peers[0].got.some((x) => x.sdp === 'first'));
  peers[0].ch.send({ t: 'answer', sdp: 'stale-answer' }); // the guest never reads this one (connection dropped)
  g1.close();
  await tick();
  let err = null, g2 = null;
  try { g2 = await sig.join('ROOM01', 'guest-uid'); } catch (e) { err = e; }
  await tick();
  check('rejoin is allowed by the rules (no update of the knock)', !err && fakeDb.denied.length === 0, err?.message ?? '');
  check('rejoin reaches the host as a new peer', peers.length === 2);
  const g2got = [];
  g2?.onMessage((x) => g2got.push(x));
  g2?.send({ t: 'offer', sdp: 'second' });
  await tick();
  check('only the new host channel reads the new offer', peers[1]?.got.some((x) => x.sdp === 'second') && !peers[0].got.some((x) => x.sdp === 'second'));
  check('the new guest channel gets no stale answer', !g2got.some((x) => x.sdp === 'stale-answer'));
}

// ───────── 2b. local signalling (dev + every e2e run): the same rejoin by code ─────────
{
  const hostSig = new m.LocalSignaling(), guestSig = new m.LocalSignaling();
  const peers = [];
  const close = await hostSig.host('LOCAL1', 'h', (id, ch) => { const got = []; ch.onMessage((x) => got.push(x)); peers.push({ id, ch, got }); });
  const g1 = await guestSig.join('LOCAL1', 'guest-l');
  await tick(1300); // the guest knocks again every second until welcomed: repeats must not open more channels
  g1.send({ t: 'offer', sdp: 'one' });
  await tick(30);
  check('local: first knock reaches the host once', peers.length === 1 && peers[0].got.some((x) => x.sdp === 'one'), `peers ${peers.length}`);
  let err = null, g2 = null;
  try { g2 = await guestSig.join('LOCAL1', 'guest-l'); } catch (e) { err = e; }
  await tick(30);
  check('local: the same guest can knock again (rejoin by code)', !err && peers.length === 2, err?.message ?? `peers ${peers.length}`);
  g1.send({ t: 'offer', sdp: 'stale' });
  g2?.send({ t: 'offer', sdp: 'two' });
  await tick(30);
  check('local: only the new attempt reaches the new channel', !!peers[1]?.got.some((x) => x.sdp === 'two') && !peers[1]?.got.some((x) => x.sdp === 'stale'));
  g1.close(); g2?.close(); close();
}

// ───────── 3. HostNet: rejoin, stale links, identity, isolation ─────────
{
  let onPeer;
  const sig = { host: async (_c, _h, fn) => { onPeer = fn; return () => {}; } };
  const host = new m.HostNet(sig, 'host-local', { name: 'Host', classId: 'warden', level: 5, worldSeed: 1, hostInSafeZone: () => true, hasVisited: () => true, markVisited: () => {} });
  await host.open('ABCDEF');
  const sent = [];
  const join = (peerId, playerId = peerId) => {
    onPeer(peerId, { send() {}, onMessage() { return () => {}; }, close() {} });
    const pc = pcs.at(-1);
    const mk = (label) => ({ label, readyState: 'open', send: (s) => sent.push({ to: playerId, label, type: JSON.parse(s).type }) });
    const rel = mk('rel'), fast = mk('fast');
    pc.ondatachannel({ channel: rel }); pc.ondatachannel({ channel: fast });
    rel.onmessage({ data: JSON.stringify({ type: 'hello', playerId, name: playerId, classId: 'warden', level: 3, firstVisit: false }) });
    return { pc, rel };
  };
  const connected = (id) => host.session().members.some((x) => x.playerId === id && x.connected);

  const a1 = join('guest-a');
  join('guest-a'); // reconnect while the old connection is still up
  a1.pc.connectionState = 'failed'; a1.pc.onconnectionstatechange();
  sent.length = 0; host.flush(2, 66);
  check('old link dying late keeps the rejoined guest connected', connected('guest-a') && sent.some((s) => s.to === 'guest-a' && s.type === 'snapshot'));

  join('guest-b'); join('guest-c');
  const c2 = join('guest-c');
  check('a rejoin into a full party replaces its own seat', connected('guest-c') && host.session().members.filter((x) => x.connected).length === 4);

  m.Social.block('griefer', 'Griefer');
  join('griefer', 'made-up-id');
  check('a hello must match the signalling identity (blocked player under a made-up id)', !connected('made-up-id'));

  let hit = 0;
  host.onClient('act', () => { throw new Error('malformed'); });
  host.onClient('act', () => { hit++; });
  const warn = console.warn; console.warn = () => {};
  c2.rel.onmessage({ data: JSON.stringify({ type: 'act', domain: 'world', action: 'x' }) });
  console.warn = warn;
  check('a throwing client handler does not starve the others', hit === 1);
  sent.length = 0;
  const cPc = c2.pc;
  host.close();
  const closedAtOnce = cPc.connectionState === 'closed';
  await tick(450);
  check('ending a session sends the reason before closing the connection', sent.some((s) => s.type === 'kick') && !closedAtOnce && cPc.connectionState === 'closed', JSON.stringify({ kick: sent.some((s) => s.type === 'kick'), closedAtOnce, later: cPc.connectionState }));
}

// ───────── 4. leaving on purpose is not a kick ─────────
{
  let kicks = 0;
  const off = m.bus.on('net:kicked', () => kicks++);
  const net = await m.RealmNet.connect('http://realm.test', 'r', 'dev:x:y', { name: 'A', classId: 'warden', level: 1 });
  net.leave();
  await tick();
  check('leaving a realm does not raise net:kicked', kicks === 0, `kicks ${kicks}`);
  await m.RealmNet.connect('http://realm.test', 'r', 'dev:x:y', { name: 'A', classId: 'warden', level: 1 });
  FakeWS.last.close(); // the server drops us
  await tick();
  check('a dropped realm connection still raises net:kicked', kicks === 1, `kicks ${kicks}`);
  off();
  const tokenAt = async () => {
    const n = await m.RealmNet.connect('http://realm.test', 'r', 'secret-id-token', { name: 'A', classId: 'warden', level: 1 });
    const hello = FakeWS.last.sent.map((s) => JSON.parse(s)).find((x) => x.type === 'hello');
    const where = { url: FakeWS.last.url.includes('secret-id-token'), hello: hello?.token === 'secret-id-token' };
    n.leave();
    return where;
  };
  realmCaps = { helloToken: true };
  const now = await tokenAt();
  check('the realm ID token goes in the hello, not the URL', now.hello && !now.url, JSON.stringify(now));
  realmCaps = null;
  const old = await tokenAt();
  check('an older realm server (no /caps) still gets the token in the URL', old.url && !old.hello, JSON.stringify(old));
}

// ───────── 5. state syncs registered after the join (guest world clock) ─────────
{
  const net = await m.RealmNet.connect('http://realm.test', 'r', 'dev:x:y', { name: 'A', classId: 'warden', level: 1 });
  const ws = FakeWS.last;
  ws.onmessage({ data: JSON.stringify({ type: 'state', blocks: { 'world-clock': { hour: 5 } } }) });
  const got = [];
  ws.sent.length = 0;
  net.addStateSync({ name: 'world-clock', collect: () => null, apply: (v) => got.push(v) });
  net.addStateSync({ name: 'other', collect: () => null, apply: () => {} });
  await tick(5);
  const asks = ws.sent.filter((s) => JSON.parse(s).type === 'state:request').length;
  check('a late state sync gets the last block at once', got[0]?.hour === 5, JSON.stringify(got));
  check('…and asks the authority once for fresh blocks', asks === 1, `requests ${asks}`);
  net.leave();

  let onPeer;
  const host = new m.HostNet({ host: async (_c, _h, fn) => { onPeer = fn; return () => {}; } }, 'host-local', { name: 'H', classId: 'warden', level: 5, worldSeed: 1, hostInSafeZone: () => true, hasVisited: () => true, markVisited: () => {} });
  await host.open('SYNC01');
  host.addStateSync({ name: 'world-clock', collect: () => ({ hour: 7 }), apply: () => {} });
  const states = [];
  onPeer('guest-s', { send() {}, onMessage() { return () => {}; }, close() {} });
  const pc = pcs.at(-1);
  const mk = (label) => ({ label, readyState: 'open', send: (s) => { const x = JSON.parse(s); if (x.type === 'state') states.push(x.blocks); } });
  const rel = mk('rel'), fast = mk('fast');
  pc.ondatachannel({ channel: rel }); pc.ondatachannel({ channel: fast });
  rel.onmessage({ data: JSON.stringify({ type: 'hello', playerId: 'guest-s', name: 'S', classId: 'warden', level: 1, firstVisit: false }) });
  rel.onmessage({ data: JSON.stringify({ type: 'state:request' }) });
  rel.onmessage({ data: JSON.stringify({ type: 'state:request' }) });
  check('the host answers a state request with fresh blocks, at most once a second', states.length === 2 && states[1]['world-clock']?.hour === 7, `state msgs ${states.length}`);
  host.close();
}

// ───────── 6. per-player rates (duel requests are replicated to everyone: 1 msg → N events) ─────────
{
  let onPeer;
  const host = new m.HostNet({ host: async (_c, _h, fn) => { onPeer = fn; return () => {}; } }, 'host-r', { name: 'H', classId: 'warden', level: 5, worldSeed: 1, hostInSafeZone: () => true, hasVisited: () => true, markVisited: () => {} });
  await host.open('RATE01');
  let acts = 0, duels = 0, ownActs = 0;
  host.onClient('act', (_msg, from) => { if (from === 'host-r') ownActs++; else acts++; });
  host.onClient('duel', () => { duels++; });
  onPeer('guest-r', { send() {}, onMessage() { return () => {}; }, close() {} });
  const pc = pcs.at(-1);
  const mk = (label) => ({ label, readyState: 'open', send() {} });
  const rel = mk('rel'), fast = mk('fast');
  pc.ondatachannel({ channel: rel }); pc.ondatachannel({ channel: fast });
  rel.onmessage({ data: JSON.stringify({ type: 'hello', playerId: 'guest-r', name: 'R', classId: 'warden', level: 1, firstVisit: false }) });
  for (let i = 0; i < 60; i++) rel.onmessage({ data: JSON.stringify({ type: 'act', domain: 'systems', action: 'buy', args: {} }) });
  for (let i = 0; i < 10; i++) rel.onmessage({ data: JSON.stringify({ type: 'duel', target: 'host-r' }) });
  for (let i = 0; i < 60; i++) host.send({ type: 'act', domain: 'systems', action: 'buy', args: {} });
  check('a burst of acts from one remote is capped (30), the host is never limited', acts === 30 && ownActs === 60, `remote ${acts}/60, host ${ownActs}/60`);
  check('duel request spam is capped (3)', duels === 3, `${duels}/10`);
  host.close();
}

console.log(fails ? `\nintegrity-net: ${fails} FAILED` : '\nintegrity-net: ALL PASS');
process.exit(fails ? 1 : 0);
