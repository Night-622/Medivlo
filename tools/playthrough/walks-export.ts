/**
 * Act II / III walk export for Claude 3's XP projection (tools/e2e/sim/xp-project.ts). Bundle with build.mjs:
 *   ENTRY=tools/playthrough/walks-export.ts OUT=<file> node tools/playthrough/build.mjs && node <file> [act2|act3|both] [classes]
 * Writes tools/playthrough/out/act2-walks.json / act3-walks.json:
 *   { [classId]: [{ quest, type, campaign, order, expected, zones: [{ id, level, elite, cap }], lairs }] }
 * (Act I is bands.ts export: out/act1-walks.json.) Concordia's bands are fixed per zone, so `level` is the zone's own.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnZones } from '@/world/hc/spawns';
import { actWalks } from './walks';

const [which = 'both', only] = process.argv.slice(2);
const zones = new Map(spawnZones('concordia').map((z) => [z.id, z]));
mkdirSync('tools/playthrough/out', { recursive: true });
for (const act of (which === 'both' ? ['act2', 'act3'] : [which]) as ('act2' | 'act3')[]) {
  const t0 = Date.now();
  const out: Record<string, unknown[]> = {};
  for (const w of actWalks(act, only?.split(','))) {
    out[w.cls] = w.quests.map((q) => ({
      ...q,
      zones: q.zones.map((id) => { const z = zones.get(id)!; return { id, level: z.level, elite: !!z.elite, cap: z.cap }; }),
    }));
  }
  const file = `tools/playthrough/out/${act}-walks.json`;
  writeFileSync(file, JSON.stringify(out, null, 1) + '\n');
  const n = Object.values(out).map((q) => q.length);
  console.log(`wrote ${file}: ${n.length} classes, ${Math.min(...n)}–${Math.max(...n)} quests each (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}
