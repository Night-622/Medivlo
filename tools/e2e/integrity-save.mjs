#!/usr/bin/env node
/**
 * Integrity checks for saves (src/firebase/SaveService.ts), in Node with in-memory Firebase. Owner: Claude 6.
 *
 *   node tools/e2e/integrity-save.mjs        exit 0 = all pass
 *
 * Each check is a bug that once shipped: one malformed slot crashed the title menu; an older save missing a key
 * threw in the world and map; on a shared browser, one account's local hero loaded over another account's cloud
 * hero; a failed cloud upload wasn't retried for a minute.
 */
import { build } from 'esbuild';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const out = join(here, 'out', 'integrity', 'save.mjs');
mkdirSync(dirname(out), { recursive: true });
const fake = join(here, 'integrity', 'fake-firebase.mjs');
await build({
  entryPoints: [join(here, 'integrity', 'save-entry.ts')], bundle: true, platform: 'node', format: 'esm', outfile: out,
  tsconfig: join(root, 'tsconfig.json'), logLevel: 'warning',
  alias: { 'firebase/app': fake, 'firebase/auth': fake, 'firebase/firestore': fake },
  define: { 'import.meta.env': JSON.stringify({ DEV: true, VITE_FIREBASE_API_KEY: 'k', VITE_FIREBASE_PROJECT_ID: 'p' }) },
});

globalThis.localStorage = { s: {}, getItem(k) { return this.s[k] ?? null; }, setItem(k, v) { this.s[k] = String(v); }, removeItem(k) { delete this.s[k]; }, clear() { this.s = {}; } };
Object.defineProperty(globalThis.localStorage, 's', { enumerable: false, writable: true, value: {} });
const { fakeAuth, fakeDb } = await import(pathToFileURL(fake).href);
const m = await import(pathToFileURL(out).href);
const { SaveService } = m;
const warn = console.warn; console.warn = () => {};

let fails = 0;
const check = (name, ok, detail = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`); if (!ok) fails++; };
const hero = (slot, name, uid) => { const s = m.createNewGameState(slot); s.player.name = name; s.player.hero = { classId: 'warden' }; if (uid) s.meta.ownerUid = uid; return s; };
const putLocal = (slot, v) => localStorage.setItem(`hollowcrown.save.${slot}`, typeof v === 'string' ? v : JSON.stringify(v));
const putCloud = (uid, slot, s) => fakeDb.docs.set(`users/${uid}/saves/${slot}`, { game: 'hollowcrown', json: JSON.stringify(s), updatedAt: s.meta.updatedAt });
const reset = async (uid) => { localStorage.s = {}; fakeDb.docs.clear(); fakeDb.failWrites = false; fakeAuth.reset(uid ? { uid, isAnonymous: false } : null, 5); await fakeAuth.ready; };

// 0. a failed cloud upload is retried on the next autosave (first: the throttle is module state)
await reset('me');
fakeDb.failWrites = true;
let cloudFlags = [];
const off = m.bus.on('game:saved', (e) => cloudFlags.push(e.cloud));
await SaveService.save(hero(0, 'Net'), { auto: true });
fakeDb.failWrites = false;
await SaveService.save(hero(0, 'Net'), { auto: true });
off();
check('a failed cloud autosave is retried next time (not throttled for a minute)', cloudFlags[0] === false && cloudFlags[1] === true, JSON.stringify(cloudFlags));

// 1. a malformed slot must not take the menus down
await reset('me');
putLocal(0, hero(0, 'Ada'));
putLocal(1, { meta: { slot: 1 } });
putLocal(2, 'not json {');
let list = null, err = null;
try { list = SaveService.listLocal(); } catch (e) { err = e; }
check('listLocal survives malformed slots', !err && list?.[0]?.name === 'Ada' && list[1] === null && list[2] === null, err?.message ?? '');
try { list = await SaveService.list(); } catch (e) { err = e; }
check('list (cloud) survives malformed slots', !err && list?.[0]?.name === 'Ada' && list[1] === null);
check('load of a malformed slot is null, not a throw', (await SaveService.load(1).catch(() => 'threw')) === null);

// 2. an older save missing keys newer code reads
await reset('me');
const old = hero(0, 'Old');
delete old.world.foundRegions; delete old.narrative.ext; delete old.world.location.space;
putLocal(0, old);
const loaded = await SaveService.load(0);
check('older save gets missing keys filled', Array.isArray(loaded?.world.foundRegions) && typeof loaded?.narrative.ext === 'object' && loaded?.world.location.space === '', JSON.stringify({ fr: loaded?.world.foundRegions, ext: loaded?.narrative.ext }));
check('filling keeps saved values', loaded?.player.name === 'Old' && loaded?.narrative.trackedQuest === null);

// 3. accounts sharing a browser
await reset('bob');
const alice = hero(0, 'Alice'); alice.meta.updatedAt = Date.now() + 60_000; // newer than Bob's cloud copy
alice.meta.ownerUid = 'alice';
putLocal(0, alice);
const bob = hero(0, 'Bob'); bob.meta.ownerUid = 'bob';
putCloud('bob', 0, bob);
check("another account's newer local hero doesn't load over this account's cloud hero", (await SaveService.load(0))?.player.name === 'Bob');
check("…and the menus don't offer it", SaveService.listLocal()[0] === null && (await SaveService.list())[0]?.name === 'Bob');
await reset('bob');
putLocal(0, alice);
check('a hero from another account is adopted when this account has none in that slot', (await SaveService.load(0))?.player.name === 'Alice' && (await SaveService.list())[0]?.name === 'Alice');
const s = hero(2, 'Stamp');
await SaveService.save(s);
check('saving stamps the owner', s.meta.ownerUid === 'bob' && JSON.parse(localStorage.getItem('hollowcrown.save.2')).meta.ownerUid === 'bob');

// 5. "newest" across devices is the save counter, not the device clock
await reset('me');
const ahead = hero(0, 'ClockAhead', 'me'); ahead.meta.rev = 3; ahead.meta.updatedAt = Date.now() + 3_600_000; // a device whose clock runs an hour fast
putLocal(0, ahead);
const played = hero(0, 'PlayedMore', 'me'); played.meta.rev = 5; played.meta.updatedAt = Date.now() - 60_000;
putCloud('me', 0, played);
fakeDb.docs.get('users/me/saves/0').rev = 5;
check('a device whose clock runs ahead (lower rev) does not win', (await SaveService.load(0))?.player.name === 'PlayedMore' && (await SaveService.list())[0]?.name === 'PlayedMore');
const legacy = hero(1, 'Legacy', 'me'); delete legacy.meta.rev; legacy.meta.updatedAt = Date.now() - 10_000;
putLocal(1, legacy);
const newer1 = hero(1, 'Newer', 'me'); newer1.meta.rev = 1; newer1.meta.updatedAt = Date.now() - 20_000;
putCloud('me', 1, newer1); fakeDb.docs.get('users/me/saves/1').rev = 1;
check('a save from before the counter counts as rev 0', (await SaveService.load(1))?.player.name === 'Newer');
const r = hero(2, 'Counter', 'me'); r.meta.rev = 7;
await SaveService.save(r);
check('every save adds 1 to the counter, and the cloud copy carries it', r.meta.rev === 8 && fakeDb.docs.get('users/me/saves/2')?.rev === 8, JSON.stringify({ rev: r.meta.rev, cloud: fakeDb.docs.get('users/me/saves/2')?.rev }));

// 6. offline: Firestore never settles a write and reads hang; nothing may wait on it (Save, Quit to title, Load)
await reset('me');
SaveService.cloudTimeoutMs = 300;
fakeDb.offline = true;
const off6 = hero(0, 'Offline', 'me');
let t6 = Date.now();
await SaveService.save(off6);
const saveMs = Date.now() - t6;
check('offline: a save returns (local copy written) instead of hanging on the cloud', saveMs < 2000 && JSON.parse(localStorage.getItem('hollowcrown.save.0')).player.name === 'Offline', `${saveMs} ms`);
t6 = Date.now();
const ld = await SaveService.load(0);
const ls = await SaveService.list();
check('offline: load and the Load screen list come back with the local copy', Date.now() - t6 < 2000 && ld?.player.name === 'Offline' && ls[0]?.name === 'Offline', `${Date.now() - t6} ms`);
fakeDb.offline = false;
await SaveService.save(off6);
check('back online: the next save reaches the cloud', !!fakeDb.docs.get('users/me/saves/0'));
SaveService.cloudTimeoutMs = 8000;

console.warn = warn;
console.log(fails ? `\nintegrity-save: ${fails} FAILED` : '\nintegrity-save: ALL PASS');
process.exit(fails ? 1 : 0);
