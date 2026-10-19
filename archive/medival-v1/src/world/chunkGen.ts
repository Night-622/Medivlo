/** Chunk generation pipeline (WORLD.md §3.3). Pure: no Phaser, so it can move to a worker later. */
import { CHUNK_TILES, Collision, WORLD_SEED, evalCondition, type BiomeId, type WorldObject } from '@/core';
import { baseTile } from './biomes';
import { SEA, WorldModel } from './model';
import { hash01 } from './noise';
import { activeObjects, activeRasters, distToSeg, KEEP, SOFT, type Raster } from './overlays';
import { T, canopyFor, tileInfo } from './tiles';
import { seepCondition } from './seeps';
import { LAYERS, type ChunkData, type OverlayDef, type RouteDef } from './types';

const N = CHUNK_TILES;
const AREA = N * N;
/** Ground laid by routes or water; soft overlay ops never paint over these. */
const ROUTE_GROUND = new Set<number>([T.ROAD, T.BRIDGE, T.OLD_ROAD, T.DIRT, T.SHALLOWS, T.DEEP_WATER, T.MIRE, T.MUD]);

/** Source of chunks for the ChunkManager: the overworld or an instance floor. */
export interface ChunkProvider {
  readonly widthChunks: number;
  readonly heightChunks: number;
  /** Playable extent in tiles (camera bounds). */
  readonly widthTiles: number;
  readonly heightTiles: number;
  build(cx: number, cy: number): ChunkData;
  regionAt(tx: number, ty: number): string;
  biomeAt(tx: number, ty: number): BiomeId;
}

function emptyChunk(cx: number, cy: number, region: string): ChunkData {
  const mk = () => new Int16Array(AREA).fill(-1);
  return {
    cx, cy, region,
    ground: new Int16Array(AREA), detail: mk(), deco: mk(), overhead: mk(),
    collision: new Uint8Array(AREA), objects: [], mini: new Uint32Array(AREA),
  };
}

/** Stamp overlay rasters onto a chunk; returns the extra collision bits it contributed. */
function stamp(c: ChunkData, def: OverlayDef, extra: Uint8Array): void {
  const rasters: Raster[] = activeRasters(def);
  const ox = def.origin[0] - c.cx * N;
  const oy = def.origin[1] - c.cy * N;
  for (let ly = 0; ly < N; ly++) {
    const ry = ly - oy;
    if (ry < 0 || ry >= def.size[1]) continue;
    for (let lx = 0; lx < N; lx++) {
      const rx = lx - ox;
      if (rx < 0 || rx >= def.size[0]) continue;
      const i = ly * N + lx;
      const ri = ry * def.size[0] + rx;
      if (def.noScatter) { c.deco[i] = -1; c.overhead[i] = -1; }
      for (const r of rasters) {
        for (const layer of LAYERS) {
          const v = r.layers[layer][ri];
          if (v === KEEP) continue;
          if (v >= SOFT) { if (!ROUTE_GROUND.has(c.ground[i])) c[layer][i] = v - SOFT; }
          else c[layer][i] = v;
        }
        extra[i] |= r.collision[ri];
      }
    }
  }
  const x0 = c.cx * N, y0 = c.cy * N;
  for (const o of activeObjects(def)) {
    if (o.at[0] >= x0 && o.at[0] < x0 + N && o.at[1] >= y0 && o.at[1] < y0 + N) c.objects.push(o);
  }
}

function rasteriseRoute(c: ChunkData, rt: RouteDef): void {
  if (rt.when && !evalCondition(rt.when)) return;
  const x0 = c.cx * N, y0 = c.cy * N;
  const rad = rt.width / 2;
  const water = rt.kind === 'river' || rt.kind === 'stream';
  for (let s = 0; s < rt.points.length - 1; s++) {
    const [ax, ay] = rt.points[s];
    const [bx, by] = rt.points[s + 1];
    for (let ly = 0; ly < N; ly++) for (let lx = 0; lx < N; lx++) {
      const tx = x0 + lx, ty = y0 + ly;
      const d = distToSeg(tx + 0.5, ty + 0.5, ax, ay, bx, by);
      if (d > rad + (rt.kind === 'river' ? 1.5 : 0)) continue;
      const i = ly * N + lx;
      if (water) {
        c.deco[i] = -1; c.overhead[i] = -1;
        c.ground[i] = d > rad ? T.SHALLOWS : rt.kind === 'stream' ? T.SHALLOWS : T.DEEP_WATER;
        if (rt.kind === 'river' && d > rad - 1 && d <= rad) c.ground[i] = T.SHALLOWS;
      } else if (rt.kind === 'ley') {
        if (c.detail[i] < 0 && hash01(tx, ty, 99) < 0.5) c.detail[i] = T.LEY_VEIN;
      } else {
        const g = c.ground[i];
        c.ground[i] = g === T.DEEP_WATER || g === T.SHALLOWS ? T.BRIDGE : rt.kind === 'old-road' ? T.OLD_ROAD : rt.kind === 'track' ? T.DIRT : T.ROAD;
        c.deco[i] = -1;
        if (c.overhead[i] === T.CANOPY || c.overhead[i] === T.PINE_CANOPY) c.overhead[i] = -1;
      }
    }
  }
}

/** Trunks get a canopy on the tile above; collision and minimap colours are derived from layers. */
function finish(c: ChunkData, extra: Uint8Array): void {
  for (let i = 0; i < AREA; i++) {
    const can = canopyFor(c.deco[i]);
    if (can >= 0 && i >= N && c.overhead[i - N] < 0) c.overhead[i - N] = can;
  }
  for (let i = 0; i < AREA; i++) {
    let bits = extra[i] | tileInfo(c.ground[i]).collision;
    if (c.detail[i] >= 0) bits |= tileInfo(c.detail[i]).collision;
    if (c.deco[i] >= 0) bits |= tileInfo(c.deco[i]).collision;
    c.collision[i] = bits;
    const top = c.overhead[i] >= 0 ? c.overhead[i] : c.deco[i] >= 0 ? c.deco[i] : c.ground[i];
    const info = tileInfo(top);
    c.mini[i] = info.mini ?? info.color;
  }
}

export class OverworldProvider implements ChunkProvider {
  readonly widthChunks: number;
  readonly heightChunks: number;
  get widthTiles(): number { return this.widthChunks * N; }
  get heightTiles(): number { return this.heightChunks * N; }

  constructor(readonly model: WorldModel) {
    this.widthChunks = model.layout.cells[0].length * model.layout.cellChunks;
    this.heightChunks = model.layout.cells.length * model.layout.cellChunks;
  }

  regionAt(tx: number, ty: number): string { return this.model.regionAt(tx, ty)?.id ?? ''; }
  biomeAt(tx: number, ty: number): BiomeId { return this.model.biomeAt(tx, ty); }

  build(cx: number, cy: number): ChunkData {
    const m = this.model;
    const c = emptyChunk(cx, cy, m.regionOfChunk(cx, cy)?.id ?? '');
    const x0 = cx * N, y0 = cy * N;
    for (let ly = 0; ly < N; ly++) for (let lx = 0; lx < N; lx++) {
      const tx = x0 + lx, ty = y0 + ly;
      const i = ly * N + lx;
      const code = m.codeAt(tx, ty);
      if (code === SEA) { c.ground[i] = T.DEEP_WATER; continue; }
      const region = m.regionByCode.get(code);
      if (!region) { c.ground[i] = T.GRASS; continue; }
      // Shore: sand where the sea is within 3 tiles.
      const shore = m.codeAt(tx + 3, ty) === SEA || m.codeAt(tx - 3, ty) === SEA || m.codeAt(tx, ty + 3) === SEA || m.codeAt(tx, ty - 3) === SEA;
      if (shore) { c.ground[i] = T.SAND; continue; }
      const fields = {
        e: m.elev.fbm(tx, ty, 4, 160),
        m: m.moist.fbm(tx, ty, 3, 120),
        d: m.detail.fbm(tx, ty, 2, 40),
        f: m.frost.fbm(tx, ty, 2, 24),
        r: hash01(tx, ty, WORLD_SEED),
      };
      const b = baseTile(m.biomeFor(region, tx, ty), fields, region.frost);
      c.ground[i] = b.ground;
      c.deco[i] = b.deco;
    }
    paintSeeps(c, m);
    const ix = m.chunkIndex(cx, cy);
    for (const rt of ix.routes.filter((r) => r.kind === 'river' || r.kind === 'stream')) rasteriseRoute(c, rt);
    for (const rt of ix.routes.filter((r) => !(r.kind === 'river' || r.kind === 'stream'))) rasteriseRoute(c, rt);
    paintGates(c, m);
    const extra = new Uint8Array(AREA);
    for (const o of ix.overlays) stamp(c, o, extra);
    finish(c, extra);
    return c;
  }
}

/** A single instance floor: void everywhere except its overlay. */
export class InstanceProvider implements ChunkProvider {
  readonly widthChunks: number;
  readonly heightChunks: number;
  get widthTiles(): number { return this.overlay.origin[0] + this.overlay.size[0]; }
  get heightTiles(): number { return this.overlay.origin[1] + this.overlay.size[1]; }

  constructor(private overlay: OverlayDef, private regionId: string, private biome: BiomeId) {
    this.widthChunks = Math.ceil((overlay.origin[0] + overlay.size[0]) / N);
    this.heightChunks = Math.ceil((overlay.origin[1] + overlay.size[1]) / N);
  }

  regionAt(): string { return this.regionId; }
  biomeAt(): BiomeId { return this.biome; }

  build(cx: number, cy: number): ChunkData {
    const c = emptyChunk(cx, cy, this.regionId);
    c.ground.fill(T.VOID);
    const extra = new Uint8Array(AREA);
    stamp(c, this.overlay, extra);
    finish(c, extra);
    return c;
  }
}

/** Objects in a chunk of a given kind (helper for scenes). */
export function objectsOfKind(c: ChunkData, kind: WorldObject['kind']): WorldObject[] {
  return c.objects.filter((o) => o.kind === kind);
}

/** Collision value used outside the provider's bounds. */
export const OUT_OF_BOUNDS = Collision.SOLID | Collision.BLOCK_SIGHT;

/** Mire seeps: black pools with pale reeds, present while world.mire_level >= minLevel. */
function paintSeeps(c: ChunkData, m: WorldModel): void {
  const x0 = c.cx * N, y0 = c.cy * N;
  for (const r of m.regions.values()) for (const s of r.seeps ?? []) {
    const [sx, sy] = s.at;
    if (sx + s.radius + 2 < x0 || sx - s.radius - 2 >= x0 + N || sy + s.radius + 2 < y0 || sy - s.radius - 2 >= y0 + N) continue;
    if (!evalCondition(seepCondition(s.minLevel))) continue;
    for (let ly = 0; ly < N; ly++) for (let lx = 0; lx < N; lx++) {
      const tx = x0 + lx, ty = y0 + ly;
      const d = Math.hypot(tx - sx, ty - sy) + (hash01(tx, ty, 404) - 0.5) * 2;
      if (d > s.radius + 1.5) continue;
      const i = ly * N + lx;
      c.ground[i] = d <= s.radius ? T.MIRE : T.MUD;
      c.deco[i] = d > s.radius - 1 && hash01(ty, tx, 405) < 0.3 ? T.REEDS : -1;
      c.overhead[i] = -1;
    }
  }
}

/** Wall tile for a closed region border, by the region's biome. */
function gateTile(biome: BiomeId): number {
  switch (biome) {
    case 'old-growth': case 'temperate-forest': case 'marsh': case 'mirelands': return T.THICKET;
    case 'alpine': case 'tundra': case 'glacier': case 'ash-desert': case 'canyon': case 'desert': return T.TOR;
    default: return T.WALL_STONE;
  }
}

/**
 * Region gates (WORLD.md §2.3): while a region's `gate` condition is false, a 3-tile wall runs along the inside
 * of its land borders (thicket, tors or border walls by biome). Overlays stamped afterwards add the set pieces.
 */
function paintGates(c: ChunkData, m: WorldModel): void {
  const closed = new Map<string, number>();
  for (const r of m.regions.values()) if (r.gate && r.layoutCode && !evalCondition(r.gate)) closed.set(r.layoutCode, gateTile(r.biome));
  if (!closed.size) return;
  const x0 = c.cx * N, y0 = c.cy * N;
  // Cheap reject: no closed region within reach of this chunk.
  let near = false;
  for (const [dx, dy] of [[-4, -4], [N + 4, -4], [-4, N + 4], [N + 4, N + 4], [N / 2, N / 2]]) if (closed.has(m.codeAt(x0 + dx, y0 + dy))) near = true;
  if (!near && !closed.has(m.codeAtChunk(c.cx, c.cy))) return;
  for (let ly = 0; ly < N; ly++) for (let lx = 0; lx < N; lx++) {
    const tx = x0 + lx, ty = y0 + ly;
    const code = m.codeAt(tx, ty);
    const wall = closed.get(code);
    if (wall === undefined) continue;
    const edge = [[3, 0], [-3, 0], [0, 3], [0, -3]].some(([dx, dy]) => {
      const o = m.codeAt(tx + dx, ty + dy);
      return o !== code && o !== SEA;
    });
    if (!edge) continue;
    const i = ly * N + lx;
    c.deco[i] = c.ground[i] === T.DEEP_WATER ? -1 : wall;
    c.overhead[i] = -1;
  }
}
