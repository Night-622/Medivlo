/** Discovery (WORLD.md §2.5): fog-of-war chunks, landmarks, region entry. Emits the matching events. */
import { CHUNK_TILES, Game, TILE_SIZE, WORLD_CHUNKS_H, WORLD_CHUNKS_W, bus, type LandmarkDef } from '@/core';

const BITS = WORLD_CHUNKS_W * WORLD_CHUNKS_H;

function decode(s: string): Uint8Array {
  const out = new Uint8Array(Math.ceil(BITS / 8));
  if (!s) return out;
  try {
    const bin = atob(s);
    for (let i = 0; i < Math.min(bin.length, out.length); i++) out[i] = bin.charCodeAt(i);
  } catch { /* corrupt save: start fresh */ }
  return out;
}

function encode(b: Uint8Array): string {
  let s = '';
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s);
}

export class Discovery {
  private bits = decode(Game.state.world.discoveredChunks);
  private inside = new Set<string>();
  private lastChunk = '';
  private region: string | null = null;

  /**
   * @param landmarks landmarks of the current context (overworld or instance floor)
   * @param overworld fog of war and regions only apply on the overworld
   */
  constructor(private landmarks: LandmarkDef[], private overworld: boolean, private regionAt: (tx: number, ty: number) => string) {}

  isChunkDiscovered(cx: number, cy: number): boolean {
    if (cx < 0 || cy < 0 || cx >= WORLD_CHUNKS_W || cy >= WORLD_CHUNKS_H) return false;
    const i = cy * WORLD_CHUNKS_W + cx;
    return (this.bits[i >> 3] & (1 << (i & 7))) !== 0;
  }

  update(px: number, py: number): void {
    const tx = Math.floor(px / TILE_SIZE), ty = Math.floor(py / TILE_SIZE);
    const w = Game.state.world;

    if (this.overworld) {
      const cx = Math.floor(tx / CHUNK_TILES), cy = Math.floor(ty / CHUNK_TILES);
      const ck = `${cx},${cy}`;
      if (ck !== this.lastChunk) {
        this.lastChunk = ck;
        let changed = false;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const x = cx + dx, y = cy + dy;
          if (x < 0 || y < 0 || x >= WORLD_CHUNKS_W || y >= WORLD_CHUNKS_H || this.isChunkDiscovered(x, y)) continue;
          const i = y * WORLD_CHUNKS_W + x;
          this.bits[i >> 3] |= 1 << (i & 7);
          changed = true;
        }
        if (changed) w.discoveredChunks = encode(this.bits);
      }
      const region = this.regionAt(tx, ty);
      if (region && region !== this.region) {
        const prev = this.region;
        this.region = region;
        if (!w.visitedRegions.includes(region)) w.visitedRegions.push(region);
        bus.emit('region:entered', { regionId: region, prevRegionId: prev });
      }
    }

    for (const l of this.landmarks) {
      const near = Math.hypot(l.at[0] + 0.5 - px / TILE_SIZE, l.at[1] + 0.5 - py / TILE_SIZE) <= l.discoverRadius;
      const was = this.inside.has(l.id);
      if (near && !was) {
        this.inside.add(l.id);
        if (!w.discoveredLandmarks.includes(l.id)) {
          w.discoveredLandmarks.push(l.id);
          bus.emit('landmark:discovered', { landmarkId: l.id });
        }
        bus.emit('landmark:entered', { landmarkId: l.id });
      } else if (!near && was) {
        this.inside.delete(l.id);
        bus.emit('landmark:left', { landmarkId: l.id });
      }
    }
  }
}
