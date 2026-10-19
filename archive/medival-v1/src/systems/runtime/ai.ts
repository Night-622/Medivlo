/**
 * Enemy steering behaviours (SYSTEMS.md §8.2). Returns a desired unit direction (or null to hold).
 */
import { Collision } from '@/core';
import type { WorldQuery } from '@/core';
import { TILE_SIZE } from '@/core';
import { angleTo, dist } from './Actor';

export interface SteerInput {
  x: number; y: number;
  tx: number; ty: number;          // player
  behaviors: readonly string[];
  pref: readonly [number, number];
  packIndex: number;
  packSize: number;
  strafeDir: 1 | -1;
  retreating: boolean;
  fleeing: boolean;
}

export interface Vec { x: number; y: number }

const norm = (x: number, y: number): Vec | null => {
  const l = Math.hypot(x, y);
  return l < 1e-3 ? null : { x: x / l, y: y / l };
};

export function steer(i: SteerInput): { dir: Vec | null; speedMult: number } {
  const d = dist(i.x, i.y, i.tx, i.ty);
  const toward = norm(i.tx - i.x, i.ty - i.y);
  if (!toward) return { dir: null, speedMult: 1 };
  const away = { x: -toward.x, y: -toward.y };
  const side = { x: -toward.y * i.strafeDir, y: toward.x * i.strafeDir };
  const has = (b: string) => i.behaviors.includes(b);
  const [lo, hi] = i.pref;

  if (i.fleeing) return { dir: away, speedMult: 1.1 };
  if (i.retreating) return { dir: norm(away.x + side.x * 0.5, away.y + side.y * 0.5), speedMult: 0.8 };

  if (has('kite')) {
    if (d < lo) return { dir: norm(away.x + side.x * 0.4, away.y + side.y * 0.4), speedMult: 1 };
    if (d > hi) return { dir: toward, speedMult: 1 };
    return { dir: side, speedMult: 0.5 };
  }

  if ((has('packHunt') || has('flank')) && i.packSize > 1 && d < hi * 3) {
    // surround: each pack member aims for its own angle around the player
    const base = angleTo(i.tx, i.ty, i.x, i.y);
    const slot = base + ((i.packIndex - (i.packSize - 1) / 2) * Math.PI) / Math.max(2, i.packSize);
    const r = (lo + hi) / 2;
    const gx = i.tx + Math.cos(slot) * r, gy = i.ty + Math.sin(slot) * r;
    const dir = norm(gx - i.x, gy - i.y);
    if (dir && dist(i.x, i.y, gx, gy) > 12) return { dir, speedMult: 1 };
  }

  if (d > hi) return { dir: toward, speedMult: 1 };
  if (d < lo * 0.6) return { dir: away, speedMult: 0.6 };
  if (has('strafe') || has('flank') || has('packHunt')) return { dir: side, speedMult: 0.45 };
  return { dir: null, speedMult: 1 };
}

/** line of sight (px) */
export function canSee(world: WorldQuery | undefined, x0: number, y0: number, x1: number, y1: number): boolean {
  if (!world) return true;
  return !world.raycast(x0, y0, x1, y1, Collision.SOLID | Collision.BLOCK_SIGHT).hit;
}

export function walkClear(world: WorldQuery | undefined, x0: number, y0: number, x1: number, y1: number): boolean {
  if (!world) return true;
  return !world.raycast(x0, y0, x1, y1, Collision.SOLID).hit;
}

/** A* via WorldQuery; returns world-px waypoints (tile centres), excluding the start tile */
export function pathTo(world: WorldQuery | undefined, x0: number, y0: number, x1: number, y1: number): Vec[] | null {
  if (!world) return null;
  const t = (v: number) => Math.floor(v / TILE_SIZE);
  const p = world.findPath([t(x0), t(y0)], [t(x1), t(y1)], 600);
  if (!p || p.length < 2) return null;
  return p.slice(1).map(([tx, ty]) => ({ x: tx * TILE_SIZE + TILE_SIZE / 2, y: ty * TILE_SIZE + TILE_SIZE / 2 }));
}
