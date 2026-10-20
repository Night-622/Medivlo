/**
 * Route camps (Claude 2, for Claude 3's per-class XP spread, 2026-10-20): Act II/III class threads differ hugely in how
 * many encounters their walks pass (Samurai 207 kill slots vs Sparkwright 495 in Act II), because some threads stay
 * near Brindlecross and others cross Morvane. This adds small camps along the sparse classes' own class-thread walks,
 * where a walk goes a long way with nothing in reach, until each act's total reaches TARGET × the median. Only on ground
 * that is the class's own: at most OTHERS other classes' walks (any act, any quest) pass within reach, so a camp on a
 * trunk road everyone walks doesn't raise every class at once.
 *   ENTRY=tools/playthrough/routeCamps.ts OUT=<file> node tools/playthrough/build.mjs && node <file> gen
 * Writes src/data/regions/hc/routeCamps.gen.ts (deterministic); spawns.ts stocks them at the region's band.
 * Then regenerate the Concordia bands (concordiaBands.ts gen) and re-check (checks.ts bands-concordia).
 */
import { writeFileSync } from 'node:fs';
import { spaceRuntime } from '@/world/hc/spaces';
import { SpaceQuery } from '@/world/hc/runtime';
import { ROUTE_CAMP_CAP, spawnZones } from '@/world/hc/spawns';
import { actWalks, AGGRO_TILES, type ActQuestWalk } from './walks';

const TARGET = 0.9; // of the act's median kill slots
const GAP = 30; // tiles of open walk between route camps
const OTHERS = 2; // at most this many other classes may walk past a route camp
const CELL = 8; // coverage grid (tiles)
const rt = spaceRuntime('concordia'), g = rt.gen as unknown as { zoneRule(x: number, y: number): string; cornerAt(x: number, y: number): number };
const q = new SpaceQuery(rt, () => ({ hour: 12, phase: 'day' }) as never);
const zones = spawnZones('concordia').filter((z) => !z.id.startsWith('camp:route-'));
const cap = new Map(spawnZones('concordia').map((z) => [z.id, z.cap]));
// kill slots with fast travel (the figure the pacing target uses)
const slots = (qs: ActQuestWalk[]) => qs.reduce((a, x) => a + x.ftZones.filter((id) => !id.startsWith('camp:route-')).reduce((b, id) => b + (cap.get(id) ?? 0), 0), 0);

const placed: { id: string; at: [number, number] }[] = [];
const covered = (p: [number, number]) =>
  zones.some((z) => Math.hypot(p[0] - z.at[0], p[1] - z.at[1]) <= z.r + AGGRO_TILES + 4) || placed.some((c) => Math.hypot(p[0] - c.at[0], p[1] - c.at[1]) <= GAP * 0.8);
/** a spot beside the walk for a camp: off the path, on wild ground, not in water */
function spotBeside(path: [number, number][], i: number): [number, number] | null {
  const a = path[Math.max(0, i - 2)], b = path[Math.min(path.length - 1, i + 2)], p = path[i];
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
  for (const side of [1, -1]) for (const off of [5, 4, 6, 3]) {
    const s: [number, number] = [Math.round(p[0] - (dy / l) * off * side), Math.round(p[1] + (dx / l) * off * side)];
    if (q.isWalkable(s[0], s[1]) && g.zoneRule(s[0], s[1]) === 'wild' && g.cornerAt(s[0], s[1]) !== 2) return s;
  }
  return null;
}

const out: string[] = [];
const byAct = { act2: actWalks('act2', undefined, true), act3: actWalks('act3', undefined, true) };
/** which classes walk within reach of each grid cell (every quest of both acts) */
const cover = new Map<string, Set<string>>();
const cellOf = (x: number, y: number) => `${Math.floor(x / CELL)},${Math.floor(y / CELL)}`;
for (const walks of Object.values(byAct)) for (const w of walks) for (const x of w.quests) for (const p of [...(x.path ?? []), ...(x.ftPath ?? [])]) {
  const r = Math.ceil(AGGRO_TILES / CELL);
  for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
    const k = cellOf(p[0] + i * CELL, p[1] + j * CELL);
    if (!cover.has(k)) cover.set(k, new Set());
    cover.get(k)!.add(w.cls);
  }
}
const ownGround = (p: [number, number], cls: string) => [...(cover.get(cellOf(p[0], p[1])) ?? [])].filter((c) => c !== cls).length <= OTHERS;
for (const act of ['act2', 'act3'] as const) {
  const walks = byAct[act];
  const totals = walks.map((w) => [w.cls, slots(w.quests)] as const).sort((a, b) => a[1] - b[1]);
  const median = totals[Math.floor(totals.length / 2)][1], target = Math.round(median * TARGET);
  out.push(`${act}: median ${median}, target ${target}`);
  for (const [cls, total] of totals) {
    let deficit = target - total, k = 0;
    if (deficit <= 0) continue;
    const thread = walks.find((w) => w.cls === cls)!.quests.filter((x) => x.campaign === cls && x.ftPath?.length);
    for (const x of thread) {
      let open = 0;
      const path = x.ftPath!;
      for (let i = 1; i < path.length && deficit > 0; i++) {
        open = covered(path[i]) ? 0 : open + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
        if (open < GAP || !ownGround(path[i], cls)) continue;
        const s = spotBeside(path, i);
        if (!s) continue;
        placed.push({ id: `camp:route-${act}-${cls}-${++k}`, at: s });
        deficit -= ROUTE_CAMP_CAP;
        open = 0;
      }
      if (deficit <= 0) break;
    }
    out.push(`  ${cls} ${total} → +${k} camps (~+${k * ROUTE_CAMP_CAP})${deficit > 0 ? `, still ${deficit} short (its thread has no more open road)` : ''}`);
  }
}
const rows = placed.map((c) => `  { id: '${c.id}', at: [${c.at[0]}, ${c.at[1]}] },`);
writeFileSync('src/data/regions/hc/routeCamps.gen.ts', `/**
 * GENERATED by tools/playthrough/routeCamps.ts gen (Claude 2): do not edit. Small camps along the sparse classes'
 * Act II/III class-thread walks (open stretches with nothing in reach), so every class's acts carry a similar
 * number of encounters. Stocked by src/world/hc/spawns.ts at the band of the region they stand in.
 */
export const ROUTE_CAMPS: { id: string; at: [number, number] }[] = [
${rows.join('\n')}
];
`);
console.log(out.join('\n'));
console.log(`wrote ${placed.length} route camps to src/data/regions/hc/routeCamps.gen.ts`);
