/**
 * Act II / III walk export for Claude 3's XP projection (tools/e2e/sim/xp-project.ts). Bundle with build.mjs:
 *   ENTRY=tools/playthrough/walks-export.ts OUT=<file> node tools/playthrough/build.mjs && node <file> [act2|act3|both] [classes]
 * Writes tools/playthrough/out/act2-walks.json / act3-walks.json:
 *   { [classId]: [{ quest, type, campaign, order, expected, zones: [{ id, level, elite, cap }], zonesWalk: [...], lairs }] }
 * zones: with waystone fast travel (walks.ts FT_LEG); zonesWalk: the same quest on foot everywhere.
 * (Act I is bands.ts export: out/act1-walks.json.) `level`/`elite` are the band in force for that class at that point:
 * Concordia bands follow the host's Act II/III main quests (concordiaBands.gen.ts), counted across both acts.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnZones, zoneEliteAt, zoneLevelAt } from '@/world/hc/spawns';
import { actWalks } from './walks';

const [which = 'both', only] = process.argv.slice(2);
const zones = new Map(spawnZones('concordia').map((z) => [z.id, z]));
mkdirSync('tools/playthrough/out', { recursive: true });
// mains (main + class quests) done before each quest, counted through Act II then Act III, per class
const isMain = (t: string) => t === 'main' || t === 'class';
const act2Mains = new Map<string, number>();
for (const act of (which === 'both' ? ['act2', 'act3'] : [which]) as ('act2' | 'act3')[]) {
  const t0 = Date.now();
  const out: Record<string, unknown[]> = {};
  for (const w of actWalks(act, only?.split(','))) {
    let before = act === 'act3' ? act2Mains.get(w.cls) ?? actWalks('act2', [w.cls])[0].quests.filter((q) => isMain(q.type)).length : 0;
    out[w.cls] = w.quests.map((q) => {
      const done = (_c: string | undefined, step: number) => step <= before;
      const band = (id: string) => { const z = zones.get(id)!; return { id, level: zoneLevelAt(z, done, w.cls), elite: zoneEliteAt(z, done, w.cls), cap: z.cap }; };
      const { ftZones, ...rest } = q;
      const row = { ...rest, zones: ftZones.map(band), zonesWalk: q.zones.map(band) };
      if (isMain(q.type)) before++;
      return row;
    });
    if (act === 'act2') act2Mains.set(w.cls, before);
  }
  const file = `tools/playthrough/out/${act}-walks.json`;
  writeFileSync(file, JSON.stringify(out, null, 1) + '\n');
  const n = Object.values(out).map((q) => q.length);
  console.log(`wrote ${file}: ${n.length} classes, ${Math.min(...n)}–${Math.max(...n)} quests each (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}
