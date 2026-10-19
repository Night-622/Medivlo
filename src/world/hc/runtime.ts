/**
 * Per-space runtime shared by the authority (simulation, public-realm server) and clients (rendering): a chunk
 * cache over a SpaceGen plus the WorldQuery (AABB resolver, raycast, A*). Pure: no Phaser.
 */
import { CHUNK_TILES, Collision, TILE_SIZE, type BiomeId, type TimePhase, type WorldQuery } from '@/core';
import { buildChunk, type HcChunk, type SpaceGen, type ZoneRule } from './space';

const N = CHUNK_TILES;
const BLOCK_MOVE = Collision.SOLID | Collision.WATER;
const MAX_STEP = 12;

export class SpaceRuntime {
  private cache = new Map<string, HcChunk>();

  /** @param keep chunks kept in the LRU cache (the renderer pins its live chunks on top of this) */
  constructor(readonly gen: SpaceGen, private keep = 96) {}

  get id(): string { return this.gen.id; }
  get widthChunks(): number { return Math.ceil(this.gen.widthTiles / N); }
  get heightChunks(): number { return Math.ceil(this.gen.heightTiles / N); }

  inBounds(cx: number, cy: number): boolean {
    return cx >= 0 && cy >= 0 && cx < this.widthChunks && cy < this.heightChunks;
  }

  /** Chunk data, built on demand (or only if cached when `build` is false). */
  chunk(cx: number, cy: number, build = true): HcChunk | undefined {
    if (!this.inBounds(cx, cy)) return undefined;
    const k = `${cx},${cy}`;
    let c = this.cache.get(k);
    if (c) { this.cache.delete(k); this.cache.set(k, c); return c; }
    if (!build) return undefined;
    c = buildChunk(this.gen, cx, cy);
    this.cache.set(k, c);
    while (this.cache.size > this.keep) this.cache.delete(this.cache.keys().next().value!);
    return c;
  }

  /** Take a chunk built elsewhere (the client's chunk worker); false if this space already has it. */
  adopt(c: HcChunk): boolean {
    if (c.space !== this.id || !this.inBounds(c.cx, c.cy)) return false;
    const k = `${c.cx},${c.cy}`;
    if (this.cache.has(k)) return false;
    this.cache.set(k, c);
    while (this.cache.size > this.keep) this.cache.delete(this.cache.keys().next().value!);
    return true;
  }

  /** Collision bits at a tile, building its chunk if needed (the authority simulates anywhere a player is). */
  collisionAt(tx: number, ty: number): number {
    const cx = Math.floor(tx / N), cy = Math.floor(ty / N);
    const c = this.chunk(cx, cy);
    if (!c) return Collision.SOLID | Collision.BLOCK_SIGHT;
    return c.collision[(ty - cy * N) * N + (tx - cx * N)];
  }
}

/** WorldQuery for one space. `clock` supplies the time of day (the world clock is shared by all spaces). */
export class SpaceQuery implements WorldQuery {
  constructor(readonly rt: SpaceRuntime, private clock: () => { hour: number; phase: TimePhase }) {}

  tileAt(tx: number, ty: number): { collision: number; region: string } | null {
    if (tx < 0 || ty < 0 || tx >= this.rt.gen.widthTiles || ty >= this.rt.gen.heightTiles) return null;
    return { collision: this.rt.collisionAt(tx, ty), region: this.rt.gen.regionAt(tx, ty) };
  }

  private blocked(tx: number, ty: number): boolean {
    return (this.rt.collisionAt(tx, ty) & BLOCK_MOVE) !== 0 || !!this.rt.gen.blockedAt?.(tx, ty);
  }

  isWalkable(tx: number, ty: number): boolean { return !this.blocked(tx, ty); }

  private speedAt(x: number, y: number): number {
    const bits = this.rt.collisionAt(Math.floor(x / TILE_SIZE), Math.floor(y / TILE_SIZE));
    if (bits & Collision.SLOW) return 0.6;
    return bits & Collision.NO_SPAWN ? 1.1 : 1; // paths are a little quicker
  }

  private boxBlocked(cx: number, cy: number, w: number, h: number): boolean {
    const x0 = Math.floor((cx - w / 2) / TILE_SIZE), x1 = Math.floor((cx + w / 2 - 0.001) / TILE_SIZE);
    const y0 = Math.floor((cy - h / 2) / TILE_SIZE), y1 = Math.floor((cy + h / 2 - 0.001) / TILE_SIZE);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (this.blocked(tx, ty)) return true;
    return false;
  }

  moveAndCollide(x: number, y: number, dx: number, dy: number, w: number, h: number): { x: number; y: number } {
    const k = this.speedAt(x, y);
    dx *= k; dy *= k;
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / MAX_STEP));
    const sx = dx / steps, sy = dy / steps;
    for (let i = 0; i < steps; i++) {
      if (sx !== 0) {
        const nx = x + sx;
        if (!this.boxBlocked(nx, y, w, h)) x = nx;
        else if (sx > 0) x = Math.max(x, Math.floor((nx + w / 2) / TILE_SIZE) * TILE_SIZE - w / 2 - 0.01);
        else x = Math.min(x, (Math.floor((nx - w / 2) / TILE_SIZE) + 1) * TILE_SIZE + w / 2 + 0.01);
      }
      if (sy !== 0) {
        const ny = y + sy;
        if (!this.boxBlocked(x, ny, w, h)) y = ny;
        else if (sy > 0) y = Math.max(y, Math.floor((ny + h / 2) / TILE_SIZE) * TILE_SIZE - h / 2 - 0.01);
        else y = Math.min(y, (Math.floor((ny - h / 2) / TILE_SIZE) + 1) * TILE_SIZE + h / 2 + 0.01);
      }
    }
    return { x, y };
  }

  raycast(x0: number, y0: number, x1: number, y1: number, mask: number): { hit: boolean; x: number; y: number } {
    const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / (TILE_SIZE / 4)));
    for (let i = 1; i <= steps; i++) {
      const x = x0 + ((x1 - x0) * i) / steps, y = y0 + ((y1 - y0) * i) / steps;
      if (this.rt.collisionAt(Math.floor(x / TILE_SIZE), Math.floor(y / TILE_SIZE)) & mask) return { hit: true, x, y };
    }
    return { hit: false, x: x1, y: y1 };
  }

  findPath(from: [number, number], to: [number, number], maxNodes = 4000): [number, number][] | null {
    if (this.blocked(to[0], to[1])) return null;
    const W = 8192;
    const key = (x: number, y: number) => y * W + x;
    const hf = (x: number, y: number) => { const dx = Math.abs(x - to[0]), dy = Math.abs(y - to[1]); return Math.max(dx, dy) + 0.414 * Math.min(dx, dy); };
    const g = new Map<number, number>([[key(from[0], from[1]), 0]]);
    const came = new Map<number, number>();
    const open = new MinHeap();
    open.push(key(from[0], from[1]), hf(from[0], from[1]));
    const goal = key(to[0], to[1]);
    let expanded = 0;
    while (open.size) {
      const cur = open.pop();
      if (cur === goal) {
        const path: [number, number][] = [];
        for (let k: number | undefined = cur; k !== undefined; k = came.get(k)) path.push([k % W, Math.floor(k / W)]);
        return path.reverse();
      }
      if (++expanded > maxNodes) return null;
      const cx = cur % W, cy = Math.floor(cur / W), gc = g.get(cur)!;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = cx + dx, ny = cy + dy;
        if (this.blocked(nx, ny) || (dx && dy && (this.blocked(cx + dx, cy) || this.blocked(cx, cy + dy)))) continue;
        const nk = key(nx, ny), ng = gc + (dx && dy ? 1.414 : 1);
        if (ng < (g.get(nk) ?? Infinity)) { g.set(nk, ng); came.set(nk, cur); open.push(nk, ng + hf(nx, ny)); }
      }
    }
    return null;
  }

  regionAt(tx: number, ty: number): string { return this.rt.gen.regionAt(tx, ty); }
  /** Legacy biome hook (Phase 1 type); the Hollow Crown keys enemies by region instead. */
  biomeAt(): BiomeId { return 'plains'; }
  timeOfDay(): { hour: number; phase: TimePhase } { return this.clock(); }
  zoneRule(tx: number, ty: number): ZoneRule { return this.rt.gen.zoneRule(tx, ty); }
}

class MinHeap {
  private k: number[] = [];
  private p: number[] = [];
  get size(): number { return this.k.length; }
  push(key: number, pri: number): void {
    const k = this.k, p = this.p;
    let i = k.length;
    k.push(key); p.push(pri);
    while (i > 0) {
      const par = (i - 1) >> 1;
      if (p[par] <= p[i]) break;
      [k[par], k[i]] = [k[i], k[par]]; [p[par], p[i]] = [p[i], p[par]];
      i = par;
    }
  }
  pop(): number {
    const k = this.k, p = this.p, top = k[0];
    const lk = k.pop()!, lp = p.pop()!;
    if (k.length) {
      k[0] = lk; p[0] = lp;
      for (let i = 0; ;) {
        const l = i * 2 + 1, r = l + 1;
        let m = i;
        if (l < k.length && p[l] < p[m]) m = l;
        if (r < k.length && p[r] < p[m]) m = r;
        if (m === i) break;
        [k[m], k[i]] = [k[i], k[m]]; [p[m], p[i]] = [p[i], p[m]];
        i = m;
      }
    }
    return top;
  }
}

/** Staged warm-up per chunk: each stage fills one generator cache (region block, corner block, placements). */
const stages = new WeakMap<SpaceRuntime, Map<string, number>>();

function warmStage(r: SpaceRuntime, cx: number, cy: number): void {
  let m = stages.get(r);
  if (!m) stages.set(r, (m = new Map()));
  const k = `${cx},${cy}`, i = m.get(k) ?? 0, g = r.gen;
  // the chunk reads the corner grid up to (cx+1, cy+1)·N, so it touches 2×2 blocks
  const pts: [number, number][] = [[cx * N, cy * N], [(cx + 1) * N, cy * N], [cx * N, (cy + 1) * N], [(cx + 1) * N, (cy + 1) * N]]
    .map(([x, y]) => [Math.min(x, g.widthTiles - 1), Math.min(y, g.heightTiles - 1)] as [number, number]);
  if (i < 4) g.regionAt(pts[i][0], pts[i][1]);
  else if (i < 8) g.cornerAt(pts[i - 4][0], pts[i - 4][1]);
  else if (i === 8) g.placements(cx, cy);
  else { r.chunk(cx, cy); m.delete(k); return; }
  m.set(k, i + 1);
}

/**
 * Warm the nearest missing chunk round the players, one cache stage per call (authority stepper): generation
 * never lands on movement or spawning, and no tick pays for more than one block of it.
 */
export function prewarm(rt: (space: string) => SpaceRuntime, players: { space: string; x: number; y: number }[], radius = 1): void {
  for (const p of players) {
    const r = rt(p.space);
    const cx = Math.floor(p.x / TILE_SIZE / N), cy = Math.floor(p.y / TILE_SIZE / N);
    let best: [number, number, number] | null = null;
    for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
      const x = cx + dx, y = cy + dy, d = dx * dx + dy * dy;
      if (r.inBounds(x, y) && !r.chunk(x, y, false) && (!best || d < best[2])) best = [x, y, d];
    }
    if (best) { warmStage(r, best[0], best[1]); return; } // one stage per tick in total
  }
}
