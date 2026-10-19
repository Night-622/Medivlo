/**
 * Start-area threat check (Claude 3, with Claude 2's spawn zones): for each class start waystone, every ambient
 * spawn zone within reach, how close its creatures can stand to the waystone and to the opening roads, and its
 * level band and size. Run: node tools/e2e/sim/run.mjs starts [school]
 */
import { TILE_SIZE } from '@/core';
import { REALMS, spaceRuntime } from '@/world/hc/spaces';
import { spawnZones } from '@/world/hc/spawns';
import type { RealmGen } from '@/world/hc/realmGen';
import { creature } from '@/systems/rules/creatures';

type P2 = [number, number];
const ACTIVE = 48; // tiles: spawns.ts ACTIVE_TILES
const segDist = (p: P2, a: P2, b: P2) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2));
  return Math.hypot(p[0] - a[0] - dx * t, p[1] - a[1] - dy * t);
};

const only = process.argv[3];
const rows: string[] = [];
let worst = Infinity;
for (const r of REALMS) {
  if (!r.school || (only && r.school !== only)) continue;
  const space = r.space;
  const gen = spaceRuntime(space).gen as RealmGen;
  const zones = spawnZones(space);
  const aggroT = Math.max(240, ...zones.flatMap((z) => z.pool).map((id) => creature(id)?.ai.aggro ?? 240)) / TILE_SIZE;
  for (const ws of gen.waystones.filter((w) => !w.id.endsWith('-gate'))) {
    const side = ws.id.endsWith('capital') ? 'capital' : 'frontier';
    const hub = gen.zones.get(`zone:${gen.school}-${side}-1`)!;
    // the opening path: the hub's roads out to zone 2 (first quests run there: way-2, then the zone)
    const z2 = gen.zones.get(`zone:${gen.school}-${side}-2`)!;
    const opening: [P2, P2][] = [[ws.at as P2, hub], [hub, z2]];
    for (const z of zones) {
      const d = Math.hypot(z.at[0] - ws.at[0], z.at[1] - ws.at[1]);
      if (d > ACTIVE + z.r) continue;
      const fromWs = Math.max(0, d - z.r);
      const fromPath = Math.max(0, Math.min(...opening.map(([a, b]) => segDist(z.at, a, b))) - z.r);
      const reach = fromPath - aggroT; // ≤ 0: a creature standing in the zone sees a hero on the opening path
      if (z.level[0] <= 3) worst = Math.min(worst, fromWs);
      rows.push(`${ws.id.padEnd(20)} ${z.id.padEnd(30)} L${z.level.join('-').padEnd(6)} cap ${String(z.cap).padEnd(2)} ${z.elite ? 'elite' : '     '}`
        + ` fromWs ${fromWs.toFixed(1).padStart(5)}t  fromPath ${fromPath.toFixed(1).padStart(5)}t  ${reach <= 0 ? 'ON PATH' : `clear by ${reach.toFixed(1)}t`}${z.patrol ? ' (patrol)' : ''}`);
    }
  }
  rows.push(`  aggro reach in ${r.school}: ${aggroT.toFixed(1)} tiles`);
}
console.log(rows.join('\n'));
console.log(`nearest L≤3 zone edge to any start waystone: ${worst.toFixed(1)} tiles`);
