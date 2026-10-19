/** Overlay rasterising and stamping (WORLD.md §3.4). Pure; no Phaser. */
import { evalCondition, type WorldObject } from '@/core';
import { hash01 } from './noise';
import { canopyFor } from './tiles';
import { LAYERS, type LayerName, type OverlayDef, type OverlayOp } from './types';

/** -2 = untouched (keep what's below), -1 = cleared, >= 0 tile id. */
export const KEEP = -2;
/** Added to a raster value to mark it "soft" (skipped over route tiles when stamped). */
export const SOFT = 0x2000;

export interface Raster {
  w: number;
  h: number;
  layers: Record<LayerName, Int16Array>;
  collision: Uint8Array;
}

function blank(w: number, h: number): Raster {
  const mk = () => new Int16Array(w * h).fill(KEEP);
  return { w, h, layers: { ground: mk(), detail: mk(), deco: mk(), overhead: mk() }, collision: new Uint8Array(w * h) };
}

function smoothJitter(pos: number, seed: number): number {
  const a = Math.floor(pos / 4);
  const t = (pos % 4) / 4;
  return hash01(a, seed) * (1 - t) + hash01(a + 1, seed) * t;
}

function applyOp(r: Raster, op: OverlayOp): void {
  const { w, h } = r;
  const soft = op.soft || op.op === 'scatter';
  const set = (layer: LayerName, x: number, y: number, tile: number) => {
    if (x >= 0 && y >= 0 && x < w && y < h) r.layers[layer][y * w + x] = soft && tile >= 0 ? tile + SOFT : tile;
  };
  switch (op.op) {
    case 'fill':
    case 'clear': {
      const [x0, y0, rw, rh] = op.rect;
      const tile = op.op === 'fill' ? op.tile : -1;
      for (let y = y0; y < y0 + rh; y++) for (let x = x0; x < x0 + rw; x++) set(op.layer, x, y, tile);
      break;
    }
    case 'ellipse': {
      const [x0, y0, rw, rh] = op.rect;
      const cx = x0 + rw / 2, cy = y0 + rh / 2;
      for (let y = y0; y < y0 + rh; y++) for (let x = x0; x < x0 + rw; x++) {
        const dx = (x + 0.5 - cx) / (rw / 2), dy = (y + 0.5 - cy) / (rh / 2);
        if (dx * dx + dy * dy <= 1) set(op.layer, x, y, op.tile);
      }
      break;
    }
    case 'line': {
      const rad = op.width / 2;
      for (let i = 0; i < op.points.length - 1; i++) {
        const [ax, ay] = op.points[i];
        const [bx, by] = op.points[i + 1];
        const minX = Math.floor(Math.min(ax, bx) - rad), maxX = Math.ceil(Math.max(ax, bx) + rad);
        const minY = Math.floor(Math.min(ay, by) - rad), maxY = Math.ceil(Math.max(ay, by) + rad);
        for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
          if (distToSeg(x + 0.5, y + 0.5, ax, ay, bx, by) <= rad) set(op.layer, x, y, op.tile);
        }
      }
      break;
    }
    case 'frame': {
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const sides: [('n' | 's' | 'e' | 'w'), number, number][] = [['n', y, x], ['s', h - 1 - y, x], ['w', x, y], ['e', w - 1 - x, y]];
        for (const [side, depth, along] of sides) {
          const band = op.thickness + Math.round(op.jitter * smoothJitter(along, side.charCodeAt(0)));
          if (depth >= band) continue;
          const gap = op.gaps?.some((g) => g.side === side && Math.abs(along - g.at) <= g.width / 2);
          if (!gap) { set(op.layer, x, y, op.tile); break; }
        }
      }
      break;
    }
    case 'building': {
      const [x0, y0, bw, bh] = op.rect;
      for (let y = y0; y < y0 + bh; y++) for (let x = x0; x < x0 + bw; x++) {
        const edge = x === x0 || y === y0 || x === x0 + bw - 1 || y === y0 + bh - 1;
        set('ground', x, y, op.floor);
        set('deco', x, y, edge ? op.wall : -1);
        set('overhead', x, y, y < y0 + bh - 1 ? op.roof : -1);
      }
      set('deco', x0 + op.doorAt, y0 + bh - 1, 33 /* T.DOOR */);
      break;
    }
    case 'scatter': {
      const [x0, y0, rw, rh] = op.rect;
      for (let y = y0; y < y0 + rh; y++) for (let x = x0; x < x0 + rw; x++) {
        if (op.ellipse) {
          const ex = (x + 0.5 - x0 - rw / 2) / (rw / 2), ey = (y + 0.5 - y0 - rh / 2) / (rh / 2);
          if (ex * ex + ey * ey > 1) continue;
        }
        if (hash01(x, y, op.seed) >= op.density) continue;
        const tile = op.tiles[Math.floor(hash01(y, x, op.seed + 1) * op.tiles.length)];
        set('deco', x, y, tile);
        const can = canopyFor(tile);
        if (can >= 0 && y > 0) set('overhead', x, y - 1, can);
      }
      break;
    }
    case 'collide': {
      const [x0, y0, rw, rh] = op.rect;
      for (let y = Math.max(0, y0); y < Math.min(h, y0 + rh); y++) for (let x = Math.max(0, x0); x < Math.min(w, x0 + rw); x++) {
        r.collision[y * w + x] |= op.bits;
      }
      break;
    }
  }
}

export function distToSeg(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const vx = bx - ax, vy = by - ay;
  const len2 = vx * vx + vy * vy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / len2));
  const dx = px - (ax + t * vx), dy = py - (ay + t * vy);
  return Math.sqrt(dx * dx + dy * dy);
}

const rasterCache = new Map<string, Raster>();

function rasterFor(def: OverlayDef, key: string, ops: OverlayOp[]): Raster {
  let r = rasterCache.get(key);
  if (!r) {
    r = blank(def.size[0], def.size[1]);
    for (const op of ops) applyOp(r, op);
    rasterCache.set(key, r);
  }
  return r;
}

/** Rasters to stamp for the current flags: base first, then every active variant in order. */
export function activeRasters(def: OverlayDef): Raster[] {
  const out = [rasterFor(def, def.id, def.ops)];
  def.variants?.forEach((v, i) => { if (evalCondition(v.when)) out.push(rasterFor(def, `${def.id}#${i}`, v.ops)); });
  return out;
}

/** Objects of an overlay in absolute world tiles, filtered by flags. */
export function activeObjects(def: OverlayDef): WorldObject[] {
  const all = [...(def.objects ?? [])];
  def.variants?.forEach((v) => { if (v.objects && evalCondition(v.when)) all.push(...v.objects); });
  return all
    .filter((o) => evalCondition(o.when))
    .map((o) => ({ ...o, at: [o.at[0] + def.origin[0], o.at[1] + def.origin[1]] as [number, number] }));
}

/** Flag keys referenced anywhere in an overlay (for invalidation on flag:changed). */
export function referencedFlags(def: OverlayDef, into: Set<string>): void {
  const walk = (c: unknown): void => {
    if (!c || typeof c !== 'object') return;
    const o = c as Record<string, unknown>;
    if (typeof o.flag === 'string') into.add(o.flag);
    for (const k of ['all', 'any']) if (Array.isArray(o[k])) (o[k] as unknown[]).forEach(walk);
    if (o.not) walk(o.not);
  };
  def.variants?.forEach((v) => { walk(v.when); v.objects?.forEach((o) => walk(o.when)); });
  def.objects?.forEach((o) => walk(o.when));
}

export { LAYERS };
