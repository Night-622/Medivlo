// QA (Claude 7): can the game point a new player at every objective? For each class campaign (and the shared
// Concordia/Heart quests), every non-hidden objective's places, as questMarkers() picks them (objectivePlaces, else
// fallbackPlace: Claude 4), must resolve on the map with questPlace (Claude 2, from the overworld); npc:* through the NPC's home.
// Unresolvable objectives show no marker (map, minimap, Show on map): the player only has the tracker text.
// Node only (narrative engine + world markers, no browser).
//   node tools/e2e/qa-objective-markers.mjs [--class a,b] [--act act1|act2|act3|all] [--verbose]
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const dir = mkdtempSync(join(tmpdir(), 'qa-obj-markers-'));
const entry = join(dir, 'entry.ts');
writeFileSync(entry, String.raw`
import { Registry } from '@/core';
import type { QuestDef, NpcDef } from '@/core';
import { CAMPAIGNS } from '@/narrative/engine/classes';
import { warmMarkers } from '@/world/hc/spawns';
import { questPlace } from '@/world/hc/questPlaces';
import { objectivePlaces, fallbackPlace } from '@/narrative/client/markers';
const ONLY = (process.env.QA_CLASS ?? '').split(',').filter(Boolean);
const ACT = process.env.QA_ACT || 'act1';
const VERBOSE = process.env.QA_VERBOSE === '1';
const quests = Registry.all('quest') as QuestDef[];
while (warmMarkers()); // index every space first (questPlace peeks the index)
const where = (id: string | undefined) => (id ? questPlace(id) : null);
const npcHome = (id: string) => (Registry.tryGet('npc', id) as NpcDef | undefined)?.home;
const shared = { id: 'shared (cc-/heart-)', match: (q: QuestDef) => /^quest:(cc|heart)-/.test(q.id) };
const rows = [...CAMPAIGNS.map((c) => ({ id: c.id, match: (q: QuestDef) => q.id.startsWith('quest:' + c.id + '-') })), shared];
for (const c of rows) {
  if (ONLY.length && !ONLY.includes(c.id) && !(c === shared && ONLY.includes('shared'))) continue;
  const mine = quests.filter((q) => c.match(q) && !q.id.endsWith('-first-steps') && (ACT === 'all' || q.act === ACT)); // First Steps teaches keys, not places
  if (!mine.length) continue;
  let n = 0; const miss: string[] = []; const byKind: Record<string, number> = {};
  for (const q of mine) for (const s of q.stages) for (const o of s.objectives) {
    if (o.hidden) continue;
    n++;
    const kind = ['talk', 'kill', 'collect', 'reach', 'interact', 'when'].find((k) => k in o) ?? '?';
    // exactly what questMarkers() hands the map (Claude 4): the objective's own places, else the stage/quest fallback;
    // npc:* places are drawn at the NPC (resolved here through its home)
    const own = objectivePlaces(o);
    const places = own.length ? own : [fallbackPlace(q, s.id)].filter((p): p is string => !!p);
    const resolve = (p: string) => (p.startsWith('npc:') ? where(npcHome(p)) : where(p));
    const ok = places.length > 0 && places.every((p) => !!resolve(p));
    if (!ok) { miss.push(q.id + '/' + s.id + '/' + o.id + ' [' + kind + '] ' + o.text + ' → ' + (places.join(', ') || 'no place')); byKind[kind] = (byKind[kind] ?? 0) + 1; }
  }
  const pass = miss.length === 0;
  console.log((pass ? 'PASS ' : 'FAIL ') + c.id + ': ' + (n - miss.length) + '/' + n + ' ' + ACT + ' objectives can be pointed at' + (pass ? '' : ' :: no place for ' + JSON.stringify(byKind)));
  if (!pass && VERBOSE) for (const x of miss) console.log('    ' + x);
  console.log('ROW ' + (pass ? 1 : 0));
}
`);
const out = join(dir, 'entry.mjs');
let res = '';
try {
  execFileSync(process.execPath, ['tools/narrative/build.mjs', entry, 'full'], { env: { ...process.env, OUT: out }, stdio: ['ignore', 'ignore', 'inherit'] });
  res = execFileSync(process.execPath, [out], {
    env: { ...process.env, QA_CLASS: arg('class', ''), QA_ACT: arg('act', 'act1'), QA_VERBOSE: process.argv.includes('--verbose') ? '1' : '0' },
    encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'pipe'],
  });
} catch (e) { res = `${e.stdout ?? ''}\nFAIL harness :: ${String(e.message).split('\n')[0]}`; }
for (const l of res.split('\n')) if (/^(PASS|FAIL|    )/.test(l)) console.log(l);
const rows = [...res.matchAll(/^ROW (\d)/gm)].map((m) => Number(m[1]));
const passed = rows.filter(Boolean).length;
console.log(`\n${passed}/${rows.length || 1} passed`);
process.exit(rows.length && passed === rows.length ? 0 : 1);
