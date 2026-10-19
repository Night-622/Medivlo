/** Mire seeps (WORLD.md §1.4): flag-driven spawn zones around seep points. Terrain is painted in chunkGen. */
import type { FlagCond, RegionDef, SpawnZone, Tier } from '@/core';

export const MIRE_FLAG = 'world.mire_level';

export function seepCondition(minLevel: number): FlagCond | undefined {
  return minLevel <= 0 ? undefined : { flag: MIRE_FLAG, op: '>=', value: minLevel };
}

export function seepZones(r: RegionDef): { zone: SpawnZone; tier: Tier }[] {
  return (r.seeps ?? [])
    .filter((s) => s.spawnTable)
    .map((s) => ({
      tier: r.tier,
      zone: {
        id: `zone:${s.id}`,
        table: s.spawnTable!,
        area: { x: s.at[0] - s.radius - 2, y: s.at[1] - s.radius - 2, w: s.radius * 2 + 5, h: s.radius * 2 + 5 },
        maxAlive: 3,
        respawnSec: 300,
        leash: s.radius + 8,
        when: seepCondition(s.minLevel),
      },
    }));
}
