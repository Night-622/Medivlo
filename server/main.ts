/**
 * The Hollow Crown public-realm server (Cloud Run). Owner: Claude 1.
 *   GET  /health            → ok
 *   GET  /realms            → [{ id, name, rule, players, max }]
 *   WS   /realm/:id?token=  → join (token = Firebase ID token; DEV_AUTH=1 accepts "dev:<uid>:<name>")
 * Each realm runs dist-server/realm.js in its own vm context (isolated game singletons), ticked at 30 Hz.
 * Empty realms are torn down after 60 s. Up to 8 players per realm.
 */
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { WebSocketServer, type WebSocket } from 'ws';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { loadSave } from './realm-load';

type RealmRule = 'peaceful' | 'duels' | 'arena' | 'ffa';
interface RealmDef { id: string; name: string; rule: RealmRule; space: string; maxPlayers: number; trustedSaves?: boolean }
interface RealmApi {
  attach(p: { playerId: string; name: string; classId: string; level: number }, send: (json: string) => void, saved?: { character: unknown; playtimeSec: number }): { ok: true } | { ok: false; reason: string; log?: string };
  detach(playerId: string): void; receive(playerId: string, json: string): void; tick(dt: number): void;
  count(): number; full(): boolean; testProvider?(): void;
}

const PORT = Number(process.env.PORT ?? 8080);
const PROJECT = process.env.FIREBASE_PROJECT_ID ?? 'medivlo';
const DEV_AUTH = process.env.DEV_AUTH === '1';
const TEST_PROVIDER = process.env.REALM_TEST_PROVIDER === '1';
/** Seat each player's SAVED hero (read from their own cloud save) instead of trusting their loadout. On in
 * production; DEV_AUTH (local tests) keeps the loadout path unless REALM_LOAD_SAVES=1. */
const LOAD_SAVES = process.env.REALM_LOAD_SAVES ? process.env.REALM_LOAD_SAVES === '1' : !DEV_AUTH;

/** Fixed realm catalogue (REBUILD.md: Peaceful / Duels / Arena / Free-for-all). Spaces per Claude 2. */
const REALMS: RealmDef[] = [
  { id: 'brindlecross-peaceful', name: 'Brindlecross Square', rule: 'peaceful', space: 'concordia', maxPlayers: 8 },
  { id: 'concordia-duels', name: 'Concordia Duelling Grounds', rule: 'duels', space: 'concordia', maxPlayers: 8 },
  { id: 'stone-court-arena', name: 'The Stone Court', rule: 'arena', space: 'arena:stone-court', maxPlayers: 8 },
  { id: 'cinderreach-ffa', name: 'Cinderreach Wilds', rule: 'ffa', space: 'realm:ash', maxPlayers: 8 },
];

const here = dirname(fileURLToPath(import.meta.url));
const realmCode = new vm.Script(readFileSync(join(here, 'realm.js'), 'utf8'), { filename: 'realm.js' });
const live = new Map<string, { api: RealmApi; timer: NodeJS.Timeout; emptySince: number | null }>();
/** One connection per account: a second join (another tab or device) replaces the first. uid → leave(). */
const seats = new Map<string, (reason: string) => void>();

function spawnRealm(def: RealmDef): RealmApi {
  const t0 = performance.now();
  const ctx = vm.createContext({
    console, setTimeout, clearTimeout, setInterval, clearInterval, queueMicrotask, structuredClone,
    performance, crypto: globalThis.crypto, TextEncoder, TextDecoder, URL, Date, Math, JSON,
  });
  (ctx as { globalThis?: unknown }).globalThis = ctx;
  realmCode.runInContext(ctx);
  const api = (ctx as unknown as { __createRealm(cfg: RealmDef): RealmApi }).__createRealm({ ...def, trustedSaves: LOAD_SAVES });
  if (TEST_PROVIDER) api.testProvider?.();
  let last = performance.now();
  let slowLogged = 0;
  const timer = setInterval(() => {
    const now = performance.now();
    try { api.tick(now - last); }
    catch (e) { if (Date.now() - slowLogged > 5000) { slowLogged = Date.now(); console.error(`[realm] ${def.id}: tick failed`, e); } }
    last = now;
    const took = performance.now() - now;
    if (took > 50 && Date.now() - slowLogged > 5000) { slowLogged = Date.now(); console.warn(`[realm] ${def.id}: slow tick ${took.toFixed(0)} ms (budget 33)`); }
  }, 1000 / 30);
  live.set(def.id, { api, timer, emptySince: null });
  console.log(`[realm] up: ${def.id} (${def.rule}, ${def.space}) in ${(performance.now() - t0).toFixed(0)} ms`);
  return api;
}

// Realms are built once at boot (building one blocks the event loop for seconds, which would freeze every other
// realm mid-game) and live as long as the instance; Cloud Run's scale-to-zero frees idle instances. Optional
// IDLE_TEARDOWN_MS tears empty realms down (they are rebuilt on the next join).
const IDLE_TEARDOWN_MS = Number(process.env.IDLE_TEARDOWN_MS ?? 0);
if (IDLE_TEARDOWN_MS > 0) setInterval(() => {
  for (const [id, r] of live) {
    if (r.api.count() > 0) { r.emptySince = null; continue; }
    r.emptySince ??= Date.now();
    if (Date.now() - r.emptySince > IDLE_TEARDOWN_MS) { clearInterval(r.timer); live.delete(id); console.log(`[realm] down: ${id}`); }
  }
}, 10_000);

const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
async function verify(token: string): Promise<{ uid: string; name?: string }> {
  if (DEV_AUTH && token.startsWith('dev:')) {
    // dev:<uid>:<name>[:<delayMs>]: the delay stands in for a cold JWKS fetch (tools/e2e/realm-server.mjs)
    const [, uid, name, delay] = token.split(':');
    if (Number(delay) > 0) await new Promise((r) => setTimeout(r, Math.min(5000, Number(delay))));
    return { uid, name };
  }
  const { payload } = await jwtVerify(token, JWKS, { issuer: `https://securetoken.google.com/${PROJECT}`, audience: PROJECT });
  return { uid: String(payload.sub), name: typeof payload.name === 'string' ? payload.name : undefined };
}

const http = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.url === '/health') { res.end('ok'); return; }
  // what this server understands; clients ask first, so a new client still works against an older deployed server
  if (req.url === '/caps') { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ helloToken: true })); return; }
  if (req.url === '/realms') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(REALMS.map((r) => ({ id: r.id, name: r.name, rule: r.rule, space: r.space, players: live.get(r.id)?.api.count() ?? 0, max: r.maxPlayers }))));
    return;
  }
  res.statusCode = 404; res.end();
});

const wss = new WebSocketServer({ noServer: true, maxPayload: 64 * 1024 });
http.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url ?? '/', 'http://x');
  const m = url.pathname.match(/^\/realm\/([a-z0-9-]+)$/);
  const def = m ? REALMS.find((r) => r.id === m[1]) : undefined;
  if (!def) { socket.destroy(); return; }
  wss.handleUpgrade(req, socket, head, (ws) => void onJoin(ws, def, url.searchParams.get('token') ?? ''));
});

/**
 * The Firebase ID token comes in the hello (`token`), so it never sits in a URL (request logs keep URLs). Older
 * clients put it in the query string (`?token=`); both are accepted.
 */
async function onJoin(ws: WebSocket, def: RealmDef, queryToken: string): Promise<void> {
  const kick = (reason: string) => { if (ws.readyState === ws.OPEN) ws.send(JSON.stringify({ type: 'kick', reason })); ws.close(); };
  // Listen before any await: the client sends its hello on open, and a cold JWKS fetch in verify() can take longer
  // than that (the hello used to be emitted with no listener and the join hung). The first message is the hello;
  // anything after it is queued until the player is attached, so nothing is lost.
  let deliver: ((d: string) => void) | undefined;
  const queued: string[] = [];
  let onHello: (d: string | null) => void = () => undefined;
  const first = new Promise<string | null>((r) => { onHello = r; });
  let helloSeen = false;
  ws.on('message', (d) => {
    const s = String(d);
    if (!helloSeen) { helloSeen = true; onHello(s); }
    else if (deliver) deliver(s);
    else if (queued.length < 240) queued.push(s);
  });
  const helloTimer = setTimeout(() => onHello(null), 10_000);
  ws.once('close', () => onHello(null));
  // a query token starts verifying at once (a cold JWKS fetch overlaps the wait for the hello)
  const early = queryToken ? verify(queryToken) : null;
  early?.catch(() => undefined); // awaited below
  const helloMsg = await first;
  clearTimeout(helloTimer);
  if (helloMsg === null) { kick('The realm did not hear from you in time'); return; }
  let hello: { name?: unknown; classId?: unknown; level?: unknown; token?: unknown; slot?: unknown };
  try { hello = JSON.parse(helloMsg); } catch { kick('Bad hello'); return; }
  if (!hello || typeof hello !== 'object') { kick('Bad hello'); return; }
  const token = queryToken || (typeof hello.token === 'string' ? hello.token : '');
  let who: { uid: string; name?: string };
  try { who = await (early ?? verify(token)); }
  catch { kick('Sign in again to play online'); return; }
  // gone while we verified: its 'close' already fired, so attaching now would leave a ghost seat nobody frees
  if (ws.readyState !== ws.OPEN) return;
  let saved: { character: unknown; playtimeSec: number } | undefined;
  if (LOAD_SAVES) {
    const r = await loadSave(PROJECT, who.uid, Number(hello.slot), token);
    if (!r.ok) { console.log(`[realm] ${def.id}: refused ${who.uid}: ${r.log}`); kick(r.reason); return; }
    if (ws.readyState !== ws.OPEN) return;
    saved = { character: r.character, playtimeSec: r.playtimeSec };
  }
  seats.get(who.uid)?.('You joined from another window'); // detaches the old seat before the new one attaches
  let api: RealmApi;
  try { api = live.get(def.id)?.api ?? spawnRealm(def); }
  catch (e) { console.error(`[realm] ${def.id}: failed to start`, e); kick('That realm is unavailable right now'); return; }
  // bounded: these go to every player in the realm in each session update
  const level = Math.max(1, Math.min(99, Math.floor(Number(hello.level)) || 1));
  const seat = api.attach({ playerId: who.uid, name: String(hello.name ?? who.name ?? 'Wanderer').slice(0, 16), classId: String(hello.classId ?? '').slice(0, 32), level }, (json) => { if (ws.readyState === ws.OPEN) ws.send(json); }, saved);
  if (!seat.ok) { if (seat.log) console.log(`[realm] ${def.id}: refused ${who.uid}: ${seat.log}`); kick(seat.reason); return; }
  console.log(`[realm] ${def.id}: + ${who.uid} (${api.count()} in)`);
  let budget = 120; // messages per second, per player
  const refill = setInterval(() => { budget = 120; }, 1000);
  deliver = (s) => {
    if (--budget < 0) return;
    try { api.receive(who.uid, s); } catch (e) { console.warn(`[realm] ${def.id}: bad message from ${who.uid}`, e); }
  };
  for (const s of queued.splice(0)) deliver(s);
  let left = false;
  const leave = (code: string) => {
    if (left) return;
    left = true;
    clearInterval(refill);
    if (seats.get(who.uid) === kickOut) seats.delete(who.uid);
    api.detach(who.uid);
    console.log(`[realm] ${def.id}: - ${who.uid} (${code}, ${api.count()} in)`);
  };
  const kickOut = (reason: string) => { deliver = undefined; leave('replaced'); kick(reason); };
  seats.set(who.uid, kickOut);
  ws.on('close', (code) => leave(`close ${code}`));
}

// One broken realm must never take the others down (Cloud Run would restart and drop every player).
process.on('uncaughtException', (e) => console.error('[server] uncaught', e));
process.on('unhandledRejection', (e) => console.error('[server] unhandled rejection', e));

// Profiling: EXIT_AFTER=<ms> exits cleanly so `node --cpu-prof` writes its profile.
if (process.env.EXIT_AFTER) setTimeout(() => process.exit(0), Number(process.env.EXIT_AFTER));

// Build every realm before accepting players (startup cost is paid once, never mid-game).
for (const def of REALMS) {
  try { spawnRealm(def); } catch (e) { console.error(`[realm] ${def.id}: failed to start at boot`, e); }
}

http.listen(PORT, () => console.log(`[server] The Hollow Crown realms on :${PORT}${DEV_AUTH ? ' (DEV_AUTH)' : ''}`));
