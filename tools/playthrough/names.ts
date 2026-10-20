/**
 * Place-name agreement (Claude 2, Claude 1's gate from the 2026-10-21 naming pass): every place phrase the quest,
 * journal and dialogue text uses ("to the X", "at X", "past the X"…) that names a map place must name it as the map
 * does. The map vocabulary: waystones, Morvane regions and villages, realms and capitals, areas and zones, optional
 * areas, landmark names in every realm and Concordia, instance names (lairs, caves, Sentinel lairs).
 *   exact          the phrase is a map name (a leading "the" and a trailing possessive ’s / ’ ignored)
 *   common noun    it differs only in case: prose may lowercase a generic word ("the Heart camp" for The Heart Camp,
 *                  "the Spire stair"); documented in docs/world/HOLLOW-CROWN-WORLD.md §10.9, passes
 *   NEAR MISS      a multi-word phrase one or two letters off a map name, or the same letters with a space moved
 *                  ("Abbey Shore" for Abbeyshore): a rename that drifted, FAILS. Single words are skipped ("Guild"
 *                  beside the map's "Guile" is a different word). ALLOW lists any deliberate exception.
 *   ENTRY=tools/playthrough/checks.ts OUT=<file> node tools/playthrough/build.mjs && node <file> names
 */
import { CHUNK_TILES, Game, Registry, createNewGameState, type QuestDef } from '@/core';
import { AREAS, REALMS, allWaystones, instanceDef, spaceRuntime } from '@/world/hc/spaces';
import { MORVANE_REGIONS, MORVANE_VILLAGES } from '@/data/regions/hc/morvane';
import { mapMarkers } from '@/world/hc/overview';
import { SENTINELS } from '@/data/regions/hc/sentinels';

/** deliberate near-misses (text phrase, lowercase) that are not drift */
const ALLOW = new Set<string>([]);

Game.set(createNewGameState());
Registry.load();

// ───────────── the map's names ─────────────
const vocab = new Map<string, string>(); // lowercase, no leading "the" → as the map writes it
const add = (n: string | undefined) => { if (!n) return; const k = n.replace(/^the /i, '').trim(); if (k.length > 2) vocab.set(k.toLowerCase(), k); };
for (const w of allWaystones()) add(w.name);
for (const r of MORVANE_REGIONS) add(r.name);
for (const v of MORVANE_VILLAGES) add(v.name);
for (const r of REALMS) { add(r.name); add(r.capital); }
for (const a of AREAS) { add(a.title); a.zones.forEach((z) => add(z.name)); }
for (const s of [...REALMS.filter((r) => r.school).map((r) => r.space), 'concordia']) {
  for (const m of mapMarkers(s)) if (m.kind === 'optional' || m.kind === 'zone') add(m.name);
  const g = spaceRuntime(s).gen;
  for (let cy = 0; cy < Math.ceil(g.heightTiles / CHUNK_TILES); cy++) for (let cx = 0; cx < Math.ceil(g.widthTiles / CHUNK_TILES); cx++) for (const o of g.objects(cx, cy)) {
    if (o.id.startsWith('landmark:') && typeof o.props?.name === 'string') add(o.props.name);
    const t = o.props?.target;
    if (typeof t === 'string' && t.startsWith('inst:')) add(instanceDef(t)?.name);
  }
}
for (const s of SENTINELS) add(instanceDef(s.inst)?.name);

// ───────────── the text ─────────────
const texts: [string, string][] = [];
for (const q of Registry.all('quest') as QuestDef[]) {
  texts.push([q.id, q.name]);
  for (const s of q.stages) { texts.push([`${q.id}#${s.id}`, s.journal]); for (const o of s.objectives) texts.push([`${q.id}#${s.id}/${o.id}`, o.text]); }
}
for (const d of Registry.all('dialogue') as { id: string; nodes?: Record<string, { text: string; choices?: { text: string }[] }> }[]) {
  for (const [k, n] of Object.entries(d.nodes ?? {})) { texts.push([`${d.id}:${k}`, n.text]); for (const c of n.choices ?? []) texts.push([`${d.id}:${k}`, c.text]); }
}

const lev = (a: string, b: string): number => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
};
const PLACE = /\b(?:to|at|in|into|from|through|past|near|beyond|toward|towards|across|under|over|by|of|on|round|around|up|down)\s+(?:the\s+)?((?:[A-Z][\w’'-]*)(?:\s+(?:of\s+the\s+|of\s+|the\s+)?[A-Z][\w’'-]*)*(?:\s+[a-z]+)?)/g;
const bare = (p: string) => p.replace(/[’']s?$/, '').trim();

let exact = 0, common = 0;
const near = new Map<string, { n: number; at: string; map: string }>();
for (const [at, t] of texts) for (const m of (t ?? '').matchAll(PLACE)) {
  const full = bare(m[1]), core = bare(full.replace(/\s+[a-z]+$/, '')); // with and without a trailing lowercase noun
  const hit = [full, core].map((c) => [c, vocab.get(c.toLowerCase())] as const).find(([, v]) => v);
  if (hit) { if (hit[0] === hit[1]) exact++; else common++; continue; }
  const k = core.toLowerCase();
  if (!/\s/.test(core) || k.length < 6 || ALLOW.has(k)) continue;
  for (const [vk, vl] of vocab) {
    const d = lev(k, vk);
    const spaced = k.replace(/\s/g, '') === vk.replace(/\s/g, '');
    if ((d > 0 && d <= Math.max(1, Math.floor(vk.length / 6))) || spaced) {
      const e = near.get(core) ?? { n: 0, at, map: vl };
      e.n++;
      near.set(core, e);
      break;
    }
  }
}
for (const [p, e] of [...near].sort((a, b) => b[1].n - a[1].n)) console.log(`NEAR MISS "${p}" ×${e.n} → the map's "${e.map}"  e.g. ${e.at}`);
console.log(near.size ? `names: ${near.size} place phrases near-miss a map name (rename one side, or ALLOW it)`
  : `names: ${vocab.size} map names; ${exact} exact and ${common} common-noun uses in the text, 0 near-misses`);
if (near.size) process.exitCode = 1;
