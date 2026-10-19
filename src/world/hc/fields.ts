/**
 * Precomputed fields for generators: distance-to-line rasters (roads, rivers) and per-chunk corner caches,
 * so chunk builds stay within budget. Pure.
 */
import { CHUNK_TILES } from '@/core/constants';

type P2 = [number, number];

/** Distance (in tiles, capped at `cap`) from every corner to the nearest of a set of segments. */
export class DistanceField {
  private d: Float32Array;
  constructor(readonly w: number, readonly h: number, segments: [P2, P2][], readonly cap = 8) {
    this.d = new Float32Array((w + 1) * (h + 1)).fill(cap);
    for (const [a, b] of segments) {
      const x0 = Math.max(0, Math.floor(Math.min(a[0], b[0]) - cap)), x1 = Math.min(w, Math.ceil(Math.max(a[0], b[0]) + cap));
      const y0 = Math.max(0, Math.floor(Math.min(a[1], b[1]) - cap)), y1 = Math.min(h, Math.ceil(Math.max(a[1], b[1]) + cap));
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const v = distToSeg(x, y, a[0], a[1], b[0], b[1]);
        const i = y * (w + 1) + x;
        if (v < this.d[i]) this.d[i] = v;
      }
    }
  }

  at(x: number, y: number): number {
    const xi = Math.round(x), yi = Math.round(y);
    if (xi < 0 || yi < 0 || xi > this.w || yi > this.h) return this.cap;
    return this.d[yi * (this.w + 1) + xi];
  }
}

export const segmentsOf = (line: P2[]): [P2, P2][] => line.slice(1).map((p, i) => [line[i], p]);

/** Lazily computed corner classes per chunk (corners shared at chunk borders are computed per chunk, identically). */
/** numeric key for a block / chunk (coordinates stay well inside ±32k) */
const key = (x: number, y: number) => (x + 32768) * 65536 + (y + 32768);

/**
 * Corner classes cached per 32×32 block. Hot (every tile of every build asks several times), so: numeric keys,
 * a last-block fast path, no allocation on a hit.
 */
export class CornerCache {
  private blocks = new Map<number, Uint8Array>();
  private lastKey = NaN;
  private last: Uint8Array | null = null;
  constructor(private compute: (cx: number, cy: number) => number, private max = 256) {}

  get(cx: number, cy: number): number {
    const N = CHUNK_TILES;
    const bx = Math.floor(cx / N), by = Math.floor(cy / N);
    const k = key(bx, by);
    let b = k === this.lastKey ? this.last : this.blocks.get(k);
    if (!b) {
      b = new Uint8Array(N * N);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) b[y * N + x] = this.compute(bx * N + x, by * N + y);
      this.blocks.set(k, b);
      if (this.blocks.size > this.max) this.blocks.delete(this.blocks.keys().next().value!);
    }
    this.lastKey = k; this.last = b;
    return b[(cy - by * N) * N + (cx - bx * N)];
  }
}

/** Memoised per-chunk results (placements, region blocks), small LRU with numeric keys and a last-hit fast path. */
export class ChunkMemo<T> {
  private m = new Map<number, T>();
  private lastKey = NaN;
  private last: T | undefined;
  constructor(private compute: (cx: number, cy: number) => T, private max = 128) {}
  get(cx: number, cy: number): T {
    const k = key(cx, cy);
    if (k === this.lastKey) return this.last!;
    let v = this.m.get(k);
    if (v === undefined) {
      v = this.compute(cx, cy);
      this.m.set(k, v);
      if (this.m.size > this.max) this.m.delete(this.m.keys().next().value!);
    }
    this.lastKey = k; this.last = v;
    return v;
  }
}

/** Distance from a point to a segment. */
export function distToSeg(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const vx = bx - ax, vy = by - ay;
  const len2 = vx * vx + vy * vy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / len2));
  const dx = px - (ax + t * vx), dy = py - (ay + t * vy);
  return Math.sqrt(dx * dx + dy * dy);
}
