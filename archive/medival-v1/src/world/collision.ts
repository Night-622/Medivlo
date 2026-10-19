/** WorldQuery implementation (WORLD.md §4.2): AABB-vs-grid resolver, raycast, A*. Registered as Services.world. */
import { CHUNK_TILES, Collision, TILE_SIZE, type BiomeId, type TimePhase, type WorldQuery } from '@/core';
import type { ChunkManager } from './ChunkManager';
import { T } from './tiles';
import type { WorldClock } from './WorldClock';

const BLOCK_MOVE = Collision.SOLID | Collision.WATER;
const N = CHUNK_TILES;
const MAX_STEP = 12;

export class WorldQueryImpl implements WorldQuery {
  constructor(private chunks: ChunkManager, private clock: WorldClock) {}

  tileAt(tx: number, ty: number): { collision: number; region: string } | null {
    const c = this.chunks.data(Math.floor(tx / N), Math.floor(ty / N), false);
    if (!c) return null;
    return { collision: c.collision[(ty - c.cy * N) * N + (tx - c.cx * N)], region: c.region };
  }

  private groundAt(tx: number, ty: number): number {
    const c = this.chunks.data(Math.floor(tx / N), Math.floor(ty / N), false);
    return c ? c.ground[(ty - c.cy * N) * N + (tx - c.cx * N)] : -1;
  }

  private blocked(tx: number, ty: number): boolean {
    const bits = this.chunks.collisionAt(tx, ty);
    return bits === null || (bits & BLOCK_MOVE) !== 0;
  }

  isWalkable(tx: number, ty: number): boolean { return !this.blocked(tx, ty); }

  /** Terrain speed multiplier at a pixel position. */
  speedAt(x: number, y: number): number {
    const tx = Math.floor(x / TILE_SIZE), ty = Math.floor(y / TILE_SIZE);
    const bits = this.chunks.collisionAt(tx, ty) ?? 0;
    if (bits & Collision.SLOW) return 0.6;
    const g = this.groundAt(tx, ty);
    return g === T.ROAD || g === T.OLD_ROAD || g === T.BRIDGE ? 1.15 : 1;
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
    const dist = Math.hypot(x1 - x0, y1 - y0);
    const steps = Math.max(1, Math.ceil(dist / (TILE_SIZE / 4)));
    for (let i = 1; i <= steps; i++) {
      const x = x0 + ((x1 - x0) * i) / steps, y = y0 + ((y1 - y0) * i) / steps;
      const bits = this.chunks.collisionAt(Math.floor(x / TILE_SIZE), Math.floor(y / TILE_SIZE));
      if (bits === null || (bits & mask) !== 0) return { hit: true, x, y };
    }
    return { hit: false, x: x1, y: y1 };
  }

  findPath(from: [number, number], to: [number, number], maxNodes = 4000): [number, number][] | null {
    if (this.blocked(to[0], to[1])) return null;
    const key = (x: number, y: number) => y * 8192 + x;
    const h = (x: number, y: number) => {
      const dx = Math.abs(x - to[0]), dy = Math.abs(y - to[1]);
      return Math.max(dx, dy) + 0.414 * Math.min(dx, dy);
    };
    const g = new Map<number, number>([[key(from[0], from[1]), 0]]);
    const came = new Map<number, number>();
    const open = new MinHeap();
    open.push(key(from[0], from[1]), h(from[0], from[1]));
    const goal = key(to[0], to[1]);
    let expanded = 0;
    while (open.size) {
      const cur = open.pop();
      if (cur === goal) {
        const path: [number, number][] = [];
        for (let k: number | undefined = cur; k !== undefined; k = came.get(k)) path.push([k % 8192, Math.floor(k / 8192)]);
        return path.reverse();
      }
      if (++expanded > maxNodes) return null;
      const cx = cur % 8192, cy = Math.floor(cur / 8192);
      const gc = g.get(cur)!;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = cx + dx, ny = cy + dy;
        if (this.blocked(nx, ny)) continue;
        if (dx && dy && (this.blocked(cx + dx, cy) || this.blocked(cx, cy + dy))) continue;
        const nk = key(nx, ny);
        const ng = gc + (dx && dy ? 1.414 : 1);
        if (ng < (g.get(nk) ?? Infinity)) {
          g.set(nk, ng);
          came.set(nk, cur);
          open.push(nk, ng + h(nx, ny));
        }
      }
    }
    return null;
  }

  regionAt(tx: number, ty: number): string { return this.chunks.provider.regionAt(tx, ty); }
  biomeAt(tx: number, ty: number): BiomeId { return this.chunks.provider.biomeAt(tx, ty); }
  timeOfDay(): { hour: number; phase: TimePhase } { return this.clock.current; }
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
    const k = this.k, p = this.p;
    const top = k[0];
    const lk = k.pop()!, lp = p.pop()!;
    if (k.length) {
      k[0] = lk; p[0] = lp;
      let i = 0;
      for (;;) {
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
