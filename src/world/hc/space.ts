/**
 * Space generators and the generic chunk builder (docs/world/HOLLOW-CROWN-WORLD.md §1, §4, §5). A space is a
 * deterministic function of the world seed and flags: every client builds identical chunks. Pure, no Phaser.
 */
import { CHUNK_TILES, Collision, TILE_SIZE, type WorldObject } from '@/core';
import { hash32 } from './noise';
import { Corner, cornersIn, maskOf } from './autotile';
import { footprintBoxes } from './footprints';
import { CORNER_MINI, type Palette, type Surface, type TileRegistry } from './theme';
import type { Placement } from './village';

export type ZoneRule = 'safe' | 'arena' | 'wild';
const N = CHUNK_TILES;

export interface SpaceGen {
  readonly id: string;
  readonly widthTiles: number;
  readonly heightTiles: number;
  readonly registry: TileRegistry;
  /** terrain class on the corner grid (0..width, 0..height) */
  cornerAt(cx: number, cy: number): number;
  /** palette and surface for a tile (frames for surfaces and autotiles) */
  paletteAt(tx: number, ty: number): Palette;
  surfaceAt(tx: number, ty: number): Surface;
  /** sprites whose anchor lies in chunk (cx, cy), world px */
  placements(cx: number, cy: number): Placement[];
  /** the subset of chunk (cx, cy)'s placements that can reach into a neighbour (buildings); scatter excluded.
   *  Lets a cold chunk stamp neighbour footprints without generating the neighbours' scatter. */
  placementsNear?(cx: number, cy: number): Placement[];
  /** interactables, doors, waystones, npc anchors in chunk (cx, cy), world tiles */
  objects(cx: number, cy: number): WorldObject[];
  regionAt(tx: number, ty: number): string;
  /** extra, flag-driven blocking on top of chunk collision (sealed gates); checked at query time */
  blockedAt?(tx: number, ty: number): boolean;
  zoneRule(tx: number, ty: number): ZoneRule;
}

export interface HcChunk {
  space: string;
  cx: number;
  cy: number;
  /** registry index per tile */
  ground: Uint16Array;
  collision: Uint8Array;
  /** minimap colour per tile */
  mini: Uint32Array;
  placements: Placement[];
  objects: WorldObject[];
}

const pick = <T>(xs: T[], h: number): T => xs[h % xs.length];

/** Frame name for tile (tx, ty) from its four corners. Priority: water → cliff/wall → path → surface. */
export function tileFrame(gen: SpaceGen, tx: number, ty: number, tl: number, tr: number, bl: number, br: number): string {
  const p = gen.paletteAt(tx, ty);
  const h = hash32(tx, ty, 77);
  const wm = maskOf(tl, tr, bl, br, Corner.WATER);
  if (wm) return p.water + wm;
  if (cornersIn(maskOf(tl, tr, bl, br, Corner.CLIFF)) >= 2) return pick(p.surfaces.cobble, h);
  if (cornersIn(maskOf(tl, tr, bl, br, Corner.WALL)) >= 2) return pick(p.surfaces[gen.surfaceAt(tx, ty) === 'walltop' ? 'walltop' : 'wall'], h);
  const pm = maskOf(tl, tr, bl, br, Corner.PATH);
  if (pm) return p.path + pm;
  if (tl === Corner.FLOOR || br === Corner.FLOOR) return pick(p.surfaces.floor, h);
  return pick(p.surfaces[gen.surfaceAt(tx, ty)], h);
}

/**
 * Terrain collision for logical tile (tx, ty). With the handoff's half-tile offset, corner (tx, ty) sits at the
 * centre of logical tile (tx, ty), so its class IS that tile's terrain.
 */
export function terrainBits(corner: number, surface: Surface): number {
  if (surface === 'bridge') return 0;
  if (corner === Corner.WATER) return Collision.WATER | Collision.NO_SPAWN;
  if (corner === Corner.CLIFF || corner === Corner.WALL) return Collision.SOLID | Collision.BLOCK_SIGHT | Collision.NO_SPAWN;
  if (corner === Corner.PATH) return Collision.NO_SPAWN;
  return 0;
}

/** Mark tiles covered by a placement's footprint (≥ 40% of a tile, or the box centre) as solid. */
function stampFootprint(c: HcChunk, p: Placement): void {
  const x0 = c.cx * N * TILE_SIZE, y0 = c.cy * N * TILE_SIZE;
  for (const [bx, by, bw, bh] of footprintBoxes(p.art)) {
    const L = p.x + bx, T = p.y + by, R = L + bw, B = T + bh;
    const ccx = Math.floor((L + R) / 2 / TILE_SIZE), ccy = Math.floor((T + B) / 2 / TILE_SIZE);
    for (let ty = Math.floor(T / TILE_SIZE); ty <= Math.floor((B - 0.01) / TILE_SIZE); ty++) {
      for (let tx = Math.floor(L / TILE_SIZE); tx <= Math.floor((R - 0.01) / TILE_SIZE); tx++) {
        const lx = tx - c.cx * N, ly = ty - c.cy * N;
        if (lx < 0 || ly < 0 || lx >= N || ly >= N) continue;
        const ox = Math.min(R, (tx + 1) * TILE_SIZE) - Math.max(L, tx * TILE_SIZE);
        const oy = Math.min(B, (ty + 1) * TILE_SIZE) - Math.max(T, ty * TILE_SIZE);
        if (ox * oy >= 0.4 * TILE_SIZE * TILE_SIZE || (tx === ccx && ty === ccy)) {
          c.collision[ly * N + lx] |= Collision.SOLID | Collision.NO_SPAWN;
        }
      }
    }
  }
  void x0; void y0;
}

/** Build one chunk: tiles, terrain + footprint collision, minimap colours, placements and objects. */
export function buildChunk(gen: SpaceGen, cx: number, cy: number): HcChunk {
  const A = N * N;
  const c: HcChunk = {
    space: gen.id, cx, cy, ground: new Uint16Array(A), collision: new Uint8Array(A), mini: new Uint32Array(A),
    placements: gen.placements(cx, cy), objects: gen.objects(cx, cy),
  };
  // corner grid for this chunk (N+1)²
  const corners = new Uint8Array((N + 1) * (N + 1));
  for (let y = 0; y <= N; y++) for (let x = 0; x <= N; x++) corners[y * (N + 1) + x] = gen.cornerAt(cx * N + x, cy * N + y);
  for (let ly = 0; ly < N; ly++) for (let lx = 0; lx < N; lx++) {
    const tx = cx * N + lx, ty = cy * N + ly, i = ly * N + lx;
    if (tx >= gen.widthTiles || ty >= gen.heightTiles) { c.collision[i] = Collision.SOLID | Collision.NO_SPAWN; continue; }
    const tl = corners[ly * (N + 1) + lx], tr = corners[ly * (N + 1) + lx + 1];
    const bl = corners[(ly + 1) * (N + 1) + lx], br = corners[(ly + 1) * (N + 1) + lx + 1];
    const surface = gen.surfaceAt(tx, ty);
    c.ground[i] = gen.registry.id(tileFrame(gen, tx, ty, tl, tr, bl, br));
    c.collision[i] = terrainBits(tl, surface);
    c.mini[i] = gen.paletteAt(tx, ty).mini[CORNER_MINI[tl] ?? 'ground'];
  }
  // footprints: this chunk's placements plus neighbours' (large buildings reach across borders)
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const list = dx === 0 && dy === 0 ? c.placements : gen.placementsNear?.(cx + dx, cy + dy) ?? gen.placements(cx + dx, cy + dy);
    for (const p of list) stampFootprint(c, p);
  }
  for (const p of c.placements) {
    const lx = Math.floor(p.x / TILE_SIZE) - cx * N, ly = Math.floor((p.y - 1) / TILE_SIZE) - cy * N;
    if (lx >= 0 && ly >= 0 && lx < N && ly < N && (c.collision[ly * N + lx] & Collision.SOLID)) c.mini[ly * N + lx] = 0x6e3a22;
  }
  return c;
}
