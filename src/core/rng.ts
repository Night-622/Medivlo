/** Seedable RNG (mulberry32). Use `rng` for gameplay rolls; create your own `Rng(seed)` for deterministic tests. */
export class Rng {
  private s: number;
  constructor(seed = Date.now() >>> 0) { this.s = seed >>> 0; }

  /** float in [0, 1) */
  next(): number {
    let t = (this.s = (this.s + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  /** float in [min, max) */
  range(min: number, max: number): number { return min + (max - min) * this.next(); }
  /** integer in [min, max] inclusive */
  int(min: number, max: number): number { return Math.floor(this.range(min, max + 1)); }
  chance(p: number): boolean { return this.next() < p; }
  pick<T>(arr: readonly T[]): T { return arr[Math.floor(this.next() * arr.length)]; }
  weighted<T extends { weight: number }>(arr: readonly T[]): T {
    const total = arr.reduce((a, x) => a + x.weight, 0);
    let roll = this.next() * total;
    for (const x of arr) if ((roll -= x.weight) < 0) return x;
    return arr[arr.length - 1];
  }
  get seed(): number { return this.s; }
  set seed(v: number) { this.s = v >>> 0; }
}

/** Shared gameplay RNG. Reseed for reproducible runs/tests. */
export const rng = new Rng();
