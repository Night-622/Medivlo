/** Builds the WorldMapSource (src/ui/map/WorldMap.ts) from the world model, fog bitset and game state. */
import { evalCondition, Game, Services, type LandmarkDef } from '@/core';
import type { FogState, WorldMapPin, WorldMapSource } from '@/ui/map/WorldMap';
import type { Discovery } from './discovery';
import { WORLD_TILES_H, WORLD_TILES_W, type WorldModel } from './model';

/** Board 8j region fills, by layout code (palette tokens). */
const REGION_FILL: Record<string, number> = {
  F: 0xe8d9b5, I: 0x7b756b, S: 0xb9a57c, P: 0x7e8a3a, Y: 0x1f4021, O: 0x566170, K: 0x4f9d4a,
  G: 0x2f6f6a, M: 0x3a1c5c, C: 0x8c3a10, W: 0x347035, A: 0xb98550, L: 0xe8d9b5, U: 0xebc969,
};
const PIN_FOR: Partial<Record<LandmarkDef['icon'], WorldMapPin['kind']>> = { village: 'town', city: 'town', dungeon: 'dungeon', waystone: 'waystone' };

/** Fast travel takes one in-game hour per this many tiles (a walking pace with rests). */
const TILES_PER_HOUR = 150;
/** Fast-travel fare (Claude 1): 10 gold plus 5 per in-game hour. */
const travelGold = (hours: number): number => 10 + 5 * hours;

export function buildWorldMapSource(
  model: WorldModel,
  discovery: Discovery,
  questLandmarks: () => string[],
  playerTile: () => [number, number],
  travel: { blocked(): string | null; go(id: string, hours: number): void },
): WorldMapSource {
  const hoursTo = (at: [number, number]): number => {
    const [px, py] = playerTile();
    return Math.max(1, Math.ceil(Math.hypot(at[0] - px, at[1] - py) / TILES_PER_HOUR));
  };
  const cells = model.layout.cells;
  const n = model.layout.cellChunks * 32;
  // Centroids and cell neighbours per region code.
  const centroid = new Map<string, [number, number, number]>();
  const neighbours = new Map<string, Set<string>>();
  cells.forEach((row, r) => [...row].forEach((code, c) => {
    if (code === '~') return;
    const acc = centroid.get(code) ?? [0, 0, 0];
    centroid.set(code, [acc[0] + c * n + n / 2, acc[1] + r * n + n / 2, acc[2] + 1]);
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const other = cells[r + dr]?.[c + dc];
      if (other && other !== '~' && other !== code) {
        if (!neighbours.has(code)) neighbours.set(code, new Set());
        neighbours.get(code)!.add(other);
      }
    }
  }));
  const regions = [...model.regions.values()].filter((r) => r.layoutCode && centroid.has(r.layoutCode));
  const landmarks = regions.flatMap((r) => r.landmarks);
  const landmarkAt = (id: string): [number, number] | null => {
    const l = landmarks.find((x) => x.id === id);
    if (l) return l.at;
    for (const inst of model.instances.values()) if (inst.floors.some((f) => f.landmarks?.some((x) => x.id === id))) return inst.exit;
    return null;
  };
  const stateOf = (code: string): FogState => {
    const visited = new Set(Game.state.world.visitedRegions.map((id) => model.regions.get(id)?.layoutCode));
    if (visited.has(code)) return 'explored';
    for (const v of visited) if (v && neighbours.get(v)?.has(code)) return 'seen';
    return 'hidden';
  };

  return {
    widthTiles: WORLD_TILES_W,
    heightTiles: WORLD_TILES_H,
    codeAt: (tx, ty) => model.codeAt(tx, ty),
    chunkDiscovered: (cx, cy) => discovery.isChunkDiscovered(cx, cy),
    regions: () => regions.map((r) => {
      const [x, y, k] = centroid.get(r.layoutCode)!;
      return { code: r.layoutCode, name: r.name, tier: r.tier, color: REGION_FILL[r.layoutCode] ?? r.mapColor, state: stateOf(r.layoutCode), at: [x / k, y / k] as [number, number] };
    }),
    routes: () => model.routes.filter((r) => evalCondition(r.when)),
    pins: () => {
      const out: WorldMapPin[] = [];
      const known = Game.state.world.discoveredLandmarks;
      for (const l of landmarks) {
        const kind = PIN_FOR[l.icon];
        if (kind && known.includes(l.id)) out.push({ tx: l.at[0], ty: l.at[1], kind });
      }
      for (const id of questLandmarks()) {
        const at = landmarkAt(id);
        if (at) out.push({ tx: at[0], ty: at[1], kind: 'quest' });
      }
      const [px, py] = playerTile();
      out.push({ tx: px, ty: py, kind: 'player' });
      return out;
    },
    waystones: () => model.waystones().map((w) => ({
      id: w.id, name: w.name, tx: w.at[0], ty: w.at[1], region: w.region?.name ?? '', tier: w.region?.tier ?? 1,
      unlocked: Game.state.world.waystones.includes(w.id),
    })),
    travelBlocked: () => travel.blocked(),
    travelHours: (id) => { const w = model.waystones().find((x) => x.id === id); return w ? hoursTo(w.at) : 0; },
    travelCost: (id) => {
      const w = model.waystones().find((x) => x.id === id);
      const eco = Services.tryGet('economy');
      if (!w || !eco) return { gold: 0, affordable: true };
      const gold = travelGold(hoursTo(w.at));
      return { gold, affordable: eco.gold() >= gold };
    },
    travel: (id) => {
      const w = model.waystones().find((x) => x.id === id);
      if (!w) return;
      const hours = hoursTo(w.at);
      const eco = Services.tryGet('economy');
      if (eco && !eco.spend(travelGold(hours), `fast travel to ${w.name}`)) return;
      travel.go(id, hours);
    },
    current: () => {
      const [px, py] = playerTile();
      const r = model.regionAt(px, py);
      if (!r) return null;
      let total = 0, seen = 0;
      cells.forEach((row, rr) => [...row].forEach((code, c) => {
        if (code !== r.layoutCode) return;
        for (let y = 0; y < model.layout.cellChunks; y++) for (let x = 0; x < model.layout.cellChunks; x++) {
          total++;
          if (discovery.isChunkDiscovered(c * model.layout.cellChunks + x, rr * model.layout.cellChunks + y)) seen++;
        }
      }));
      const known = Game.state.world.discoveredLandmarks;
      return { name: r.name, tier: r.tier, explored: total ? seen / total : 0, found: [r.landmarks.filter((l) => known.includes(l.id)).length, r.landmarks.length] };
    },
  };
}
