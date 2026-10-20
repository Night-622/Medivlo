#!/usr/bin/env node
/**
 * Save-load fuzzing (Node, in-memory Firebase). Owner: Claude 6.
 *
 *   node tools/e2e/integrity-fuzz.mjs [--runs 3000] [--seed 1]      exit 0 = no failures
 *
 * Takes three real saves (new game, mid-Act I, end-game) and corrupts them at random: dropped keys, wrong types,
 * null, Infinity, huge arrays, unknown item ids, old versions, truncated or garbage JSON. Each goes through the
 * real path: SaveService.load (sane → migrate → fillDefaults → migrateCharacter) and the systems sanitizeLoadout.
 * A failure is any throw, a returned save without the shape the game reads, or a sanitised character that isn't
 * valid. An unreadable save must come back as null (the menus then say "That save could not be read").
 */
import { build } from 'esbuild';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const out = join(here, 'out', 'integrity', 'fuzz.mjs');
mkdirSync(dirname(out), { recursive: true });
const fake = join(here, 'integrity', 'fake-firebase.mjs');
await build({
  entryPoints: [join(here, 'integrity', 'fuzz-entry.ts')], bundle: true, platform: 'node', format: 'esm', outfile: out,
  tsconfig: join(root, 'tsconfig.json'), logLevel: 'warning',
  alias: { 'firebase/app': fake, 'firebase/auth': fake, 'firebase/firestore': fake },
  define: { 'import.meta.env': JSON.stringify({ DEV: true }) }, // no Firebase config: local saves only
});

globalThis.localStorage = { s: {}, getItem(k) { return this.s[k] ?? null; }, setItem(k, v) { this.s[k] = String(v); }, removeItem(k) { delete this.s[k]; } };
const m = await import(pathToFileURL(out).href);
const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const RUNS = Number(arg('runs', 3000));
let seed = Number(arg('seed', 1)) >>> 0;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
const pick = (a) => a[Math.floor(rnd() * a.length)];

// ───────── three real saves ─────────
const kit = m.kitFor('warden');
const piece = Object.values(m.HC_PIECES).flat().find((p) => p?.id)?.id ?? Object.keys(m.HC_PIECES)[0];
let uidN = 0;
const inst = (base, ilvl, qty = 1, extra = {}) => ({ uid: `f${++uidN}`, base, ilvl, qty, ...extra });
function fixture(kind) {
  const s = m.createNewGameState(0);
  s.player.name = 'Fuzz';
  s.player.hero = { classId: 'warden', look: { skin: 1, hair: 2, hc: 3, eyes: 0, ec: 1, mouth: 0, mark: 0, body: 0 }, outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } };
  s.character = m.newCharacter('warden', 0);
  if (kind === 'new') return s;
  const L = kind === 'mid' ? 8 : 40;
  Object.assign(s.character, { level: L, xp: 10, gold: kind === 'mid' ? 640 : 98_000, bonusPoints: kind === 'mid' ? 2 : 12 });
  s.character.inventory = [inst(kit.startWeapon, L), inst('i_hp_s', 1, 5), ...(kind === 'end' ? Array.from({ length: 40 }, (_, i) => inst(i % 2 ? piece : kit.startWeapon, L, 1, { rarity: 'rare', upgrade: 3 })) : [])];
  s.character.equipment = { main: inst(kit.startWeapon, L) };
  s.world.location = { space: kind === 'mid' ? 'realm:rime' : 'concordia', instance: 'overworld', x: 1234, y: 5678, facing: 'e' };
  s.world.waystones = ['ws:rime-capital', 'ws:rime-frontier'];
  s.world.foundRegions = ['region:aldermoor'];
  s.narrative.quests = { 'quest:rime-1': { stage: 'go', objectives: { a: 1 } }, 'quest:rime-2': { stage: 'done', objectives: {} } };
  s.narrative.trackedQuest = 'quest:rime-1';
  s.flags = { ...s.flags, 'story.sentinel.rime': true, 'trust.npc_odo': 3 };
  s.meta.playtimeSec = kind === 'mid' ? 9000 : 70_000;
  s.meta.rev = kind === 'mid' ? 40 : 900;
  return s;
}
const bases = ['new', 'mid', 'end'].map(fixture);

// ───────── mutations ─────────
const paths = (o, p = [], acc = []) => {
  if (o && typeof o === 'object') for (const k of Object.keys(o)) { acc.push([...p, k]); if (acc.length < 4000) paths(o[k], [...p, k], acc); }
  return acc;
};
const junk = () => pick([null, 0, -1, 1e308, -1e308, '', 'x', 'NaN', true, false, [], {}, [1, 'a', null], { a: { b: 1 } }, 'quest:none', 'i_not_an_item', 1.5, 2 ** 53, -0.0001]);
function mutate(base) {
  const s = structuredClone(base);
  const n = 1 + Math.floor(rnd() * 4);
  for (let i = 0; i < n; i++) {
    const ps = paths(s);
    if (!ps.length) break;
    const p = pick(ps);
    const parent = p.slice(0, -1).reduce((o, k) => o?.[k], s);
    if (!parent || typeof parent !== 'object') continue;
    const k = p.at(-1);
    switch (Math.floor(rnd() * 7)) {
      case 0: delete parent[k]; break;
      case 1: parent[k] = junk(); break;
      case 2: parent[k] = Array.from({ length: 2000 + Math.floor(rnd() * 20000) }, () => junk()); break;
      case 3: if (typeof parent[k] === 'string') parent[k] = parent[k] + '_unknown'; else parent[k] = 'i_unknown_base'; break;
      case 4: if (typeof parent[k] === 'number') parent[k] = pick([-parent[k], parent[k] * 1e9, Number.MAX_SAFE_INTEGER, 0.5]); else delete parent[k]; break;
      case 5: parent[k] = Array.isArray(parent[k]) ? {} : typeof parent[k] === 'object' ? [] : { nested: parent[k] }; break;
      default: if (s.meta && typeof s.meta === 'object') s.meta.version = pick([0, -1, 999, '2']);
    }
  }
  let text = JSON.stringify(s);
  const r = rnd();
  if (r < 0.03) text = text.slice(0, Math.floor(rnd() * text.length)); // truncated write
  else if (r < 0.05) text = text.replace(/"ilvl":\d+/, '"ilvl":1e999'); // Infinity after parse
  else if (r < 0.06) text = pick(['', 'null', '[]', '"save"', '{}', '0', '{"meta":null}']);
  return text;
}

// ───────── invariants (what the game reads right after a load) ─────────
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const finite = (v) => typeof v === 'number' && Number.isFinite(v);
function shapeProblems(s) {
  const p = [];
  if (!isObj(s.meta) || !finite(s.meta.slot) || !finite(s.meta.updatedAt) || !finite(s.meta.playtimeSec)) p.push('meta');
  if (!isObj(s.player) || typeof s.player.name !== 'string' || !isObj(s.player.progression) || !isObj(s.player.inventory)) p.push('player');
  if (!isObj(s.world) || !isObj(s.world.location) || typeof s.world.location.space !== 'string' || !finite(s.world.location.x) || !finite(s.world.location.y)) p.push('world.location');
  for (const k of ['waystones', 'foundRegions', 'discoveredLandmarks', 'visitedRegions']) if (isObj(s.world) && !Array.isArray(s.world[k])) p.push(`world.${k}`);
  if (isObj(s.world) && !isObj(s.world.objectState)) p.push('world.objectState');
  if (!isObj(s.narrative) || !isObj(s.narrative.quests) || !Array.isArray(s.narrative.codexUnlocked) || !isObj(s.narrative.ext)) p.push('narrative');
  if (!isObj(s.flags)) p.push('flags');
  return p;
}
function charProblems(c) {
  const p = [];
  if (!Number.isInteger(c.level) || c.level < 1 || c.level > 40) p.push(`level ${c.level}`);
  if (!finite(c.gold) || c.gold < 0) p.push(`gold ${c.gold}`);
  if (!finite(c.xp) || c.xp < 0) p.push('xp');
  if (!Array.isArray(c.inventory)) p.push('inventory');
  else if (c.inventory.length > 200) p.push(`inventory ${c.inventory.length}`);
  else for (const it of c.inventory) if (!isObj(it) || typeof it.base !== 'string' || typeof it.uid !== 'string' || !finite(it.qty) || it.qty < 1 || !finite(it.ilvl)) { p.push(`item ${JSON.stringify(it).slice(0, 60)}`); break; }
  if (!isObj(c.equipment)) p.push('equipment');
  if (!isObj(c.tree)) p.push('tree');
  if (!Array.isArray(c.hotbar) || c.hotbar.length !== 4) p.push('hotbar');
  return p;
}

// ───────── run ─────────
const fails = new Map(); // kind → { n, example }
const fail = (kind, example) => { const f = fails.get(kind) ?? { n: 0, example }; f.n++; fails.set(kind, f); };

// an honest save must come back as it was (repairs only ever touch broken values)
for (const [i, base] of bases.entries()) {
  localStorage.s = { 'hollowcrown.save.0': JSON.stringify(base) };
  const st = await m.SaveService.load(0);
  const same = !!st && ['world', 'narrative', 'character', 'player', 'flags'].every((k) => JSON.stringify(st[k]) === JSON.stringify(base[k]));
  if (!same) fail(`honest ${['new', 'mid', 'end'][i]} save changed on load`, JSON.stringify(st?.world ?? null).slice(0, 200));
}
const warn = console.warn; console.warn = () => {};
let nulls = 0, seated = 0;
for (let i = 0; i < RUNS; i++) {
  const base = bases[i % bases.length];
  const text = mutate(base);
  localStorage.s = { 'hollowcrown.save.0': text };
  let st = null;
  try { st = await m.SaveService.load(0); } catch (e) { fail(`load threw: ${e.message.slice(0, 80)}`, text.slice(0, 200)); continue; }
  try { m.SaveService.listLocal(); } catch (e) { fail(`listLocal threw: ${e.message.slice(0, 80)}`, text.slice(0, 200)); }
  if (!st) { nulls++; continue; }
  const sp = shapeProblems(st);
  if (sp.length) fail(`loaded save missing shape: ${sp.join(', ')}`, text.slice(0, 200));
  if (st.character !== undefined) {
    let c;
    try { c = m.sanitizeLoadout(st.character); } catch (e) { fail(`sanitizeLoadout threw: ${e.message.slice(0, 80)}`, JSON.stringify(st.character).slice(0, 200)); continue; }
    if (c) { seated++; const cp = charProblems(c); if (cp.length) fail(`sanitised character invalid: ${cp[0].split(' ')[0]}`, cp.join('; ').slice(0, 200)); }
  }
}
console.warn = warn;

console.log(`${RUNS} corrupted saves: ${nulls} unreadable (null), ${RUNS - nulls} loaded, ${seated} characters sanitised and seated`);
for (const [kind, f] of [...fails].sort((a, b) => b[1].n - a[1].n)) console.log(`FAIL  ${kind}  ×${f.n}\n      e.g. ${f.example}`);
console.log(fails.size ? `\nintegrity-fuzz: ${fails.size} failure kinds` : '\nintegrity-fuzz: ALL PASS');
process.exit(fails.size ? 1 : 0);
