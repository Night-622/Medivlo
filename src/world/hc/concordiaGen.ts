/**
 * Concordia's Morvane (docs/world/HOLLOW-CROWN-WORLD.md §2), generated from the handoff's map.js: 11 polygon
 * regions on the ocean (1 map px = 4 tiles), the river Wend, the coach roads, the Abbey lake, mountains and
 * volcanoes, the 10 villages stamped 1:1, the 11 waystones, and the Heart sealed until `story.heart_open`. Pure.
 */
import { CHUNK_TILES, MAGIC_SCHOOLS, MARTIAL_SCHOOLS, TILE_SIZE, WORLD_SEED, evalCondition, type WorldObject } from '@/core';
import { hash01, hash2, Simplex2 } from './noise';
import { ChunkMemo, CornerCache, DistanceField, segmentsOf } from './fields';
import { Corner } from './autotile';
import type { SpaceGen, ZoneRule } from './space';
import { paletteOf, TileRegistry, type Palette, type PaletteId, type Surface } from './theme';
import type { MorvaneRegionDef, Polyline, VillageDef, WaystoneDef } from './types';
import { type Placement, villageOrigin, villagePlacements, villageRoad, VIL_H, VIL_W } from './village';
import { artSize } from './footprints';
import { placeConcordiaPlaces } from './concordiaPlaces';
import { OPT_KINDS, optionalName, type OptKind } from '@/data/regions/hc/optionalAreas';
import { classGated } from './classGate';

const N = CHUNK_TILES;
export const HEART_OPEN = { flag: 'story.heart_open' } as const;
/** Gate Circle radius (tiles) */
const GATE_R = 10;

/** Region → palette and scatter. */
const REGION_STYLE: Record<string, { palette: PaletteId; trees: string[]; density: number; pond: number; mountains?: number }> = {
  'region:alder': { palette: 'village', trees: ['f_pine', 'v_hedge', 'f_fern'], density: 0.025, pond: 0.86 },
  'region:road': { palette: 'village', trees: ['f_pine', 'f_stump'], density: 0.02, pond: 0.9 },
  'region:gloam': { palette: 'forest', trees: ['f_gloamtree', 'f_pine', 'f_pine', 'f_fern', 'f_mushrooms'], density: 0.18, pond: 0.86 },
  'region:briar': { palette: 'village', trees: ['f_bramble', 'f_deadtree', 'f_toadstool'], density: 0.08, pond: 0.66 },
  'region:abbey': { palette: 'village', trees: ['f_fern', 'f_pine', 'd_kelp'], density: 0.03, pond: 0.84 },
  'region:frost': { palette: 'rc:rime', trees: ['f_pine', 'f_pine', 'f_stump'], density: 0.07, pond: 0.88, mountains: 0.66 },
  'region:ash': { palette: 'rc:ash', trees: ['f_deadtree', 'f_log'], density: 0.04, pond: 0.74, mountains: 0.72 },
  'region:gilded': { palette: 'rc:radiance', trees: ['d_pillar', 'f_runestone', 'f_pine'], density: 0.03, pond: 0.9 },
  'region:storm': { palette: 'rc:storm', trees: ['f_runestone', 'f_pine', 'f_deadtree'], density: 0.05, pond: 0.88, mountains: 0.7 },
  'region:marsh': { palette: 'forest', trees: ['f_deadtree', 'f_mushrooms', 'f_toadstool'], density: 0.06, pond: 0.6 },
  'region:heart': { palette: 'rc:umbral', trees: ['f_deadtree', 'd_crystal'], density: 0.05, pond: 0.9, mountains: 0.68 },
};

function inPoly(x: number, y: number, poly: [number, number][]): boolean {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

export interface ConcordiaData {
  regions: MorvaneRegionDef[];
  villages: VillageDef[];
  waystones: WaystoneDef[];
  river: Polyline;
  roads: Polyline[];
  scale: number;
  mapW: number;
  mapH: number;
}

export class ConcordiaGen implements SpaceGen {
  readonly id = 'concordia';
  readonly widthTiles: number;
  readonly heightTiles: number;
  readonly registry: TileRegistry;
  private palettes = new Map<string, Palette>();
  private fixed = new Map<string, Placement[]>();
  private objs = new Map<string, WorldObject[]>();
  /** tiles kept clear of scatter and later set pieces (fixed placements, places) */
  private taken: Uint8Array;
  private paved: [number, number, number, number][] = [];
  private warp = new Simplex2(WORLD_SEED ^ 0xc0c0);
  private ponds = new Simplex2(WORLD_SEED ^ 0x9e9e);
  private fields = new Simplex2(WORLD_SEED ^ 0x7171);
  /** Abbey lake (world tiles): centre and radii; the Drowned Bell's island sits in it */
  readonly lake = { cx: 286 * 4, cy: 108 * 4, rx: 30 * 4, ry: 15 * 4 };
  /** The Concord Citadel at the Heart (world tiles) */
  readonly citadel: [number, number] = [216 * 4, 44 * 4];
  /** The Gate Circle on the moor above Brindlecross: every realm gate opens here (04-concordia.md) */
  readonly gateCircle: [number, number] = [616, 668];
  /** Morvane waystones plus the Gate Circle's */
  readonly waystones: WaystoneDef[];
  /** optional areas (PACING pass 2): three per region but the Heart, deep off the roads */
  /** story trigger zones from campaign extras (`area:` ids): id → centre, radius */
  readonly triggers = new Map<string, { at: [number, number]; r: number }>();
  readonly optional = new Map<string, { kind: OptKind; region: string; at: [number, number]; r: number }>();
  private roadField: DistanceField;
  private riverField: DistanceField;
  private corners = new CornerCache((x, y) => this.computeCorner(x, y));
  private memo = new ChunkMemo((cx, cy) => this.computePlacements(cx, cy));
  /** region index + 1 per tile, cached per chunk (0 = ocean) */
  private regionBlocks = new ChunkMemo((bx, by) => this.computeRegionBlock(bx, by), 256);

  constructor(readonly data: ConcordiaData) {
    this.polyBoxes = data.regions.map((r) => [r, r.polys.map((p) => {
      const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]);
      return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), p] as [number, number, number, number, [number, number][]];
    })]);
    this.widthTiles = data.mapW * data.scale;
    this.heightTiles = data.mapH * data.scale;
    this.taken = new Uint8Array(this.widthTiles * this.heightTiles);
    const brind = data.villages.find((v) => v.id === 'vil:brind');
    const [gx, gy] = this.gateCircle;
    // a path from the Gate Circle down to Brindlecross's north road
    const toBrind: Polyline = brind ? [[gx, gy + GATE_R + 1], [villageOrigin(brind)[0] + 12, villageOrigin(brind)[1]]] : [];
    // the processional way: from the end of the north road, through the Weeping Wall, up to the Citadel
    const way: Polyline = [[800, 368], [806, 300], [812, 252], [840, 222], [864, 192]];
    this.roadField = new DistanceField(this.widthTiles, this.heightTiles, [...data.roads, toBrind, way].flatMap(segmentsOf));
    // a village's waystone stands just past the east end of its high street, not on the well in the middle
    const moved = data.waystones.map((w): WaystoneDef => {
      const v = data.villages.find((x) => x.at[0] === w.at[0] && x.at[1] === w.at[1]);
      return v ? { ...w, at: [villageOrigin(v)[0] + VIL_W + 1, villageOrigin(v)[1] + 5] } : w;
    });
    this.waystones = [...moved, { id: 'ws:gate-circle', name: 'The Gate Circle', space: 'concordia', region: 'region:alder', at: [gx + 3, gy + 2] },
      // the old waystone outside the Weeping Wall that Sela wakes in Act III (Claude 4)
      { id: 'ws:heart-camp', name: "The Bearers' Camp", space: 'concordia', region: this.regionAtMap(810 / data.scale, 274 / data.scale)?.id ?? 'region:heart', at: [810, 274] }];
    this.riverField = new DistanceField(this.widthTiles, this.heightTiles, segmentsOf(data.river));
    const ids: PaletteId[] = ['village', 'forest', 'rc:rime', 'rc:ash', 'rc:radiance', 'rc:storm', 'rc:umbral'];
    this.registry = new TileRegistry(ids.map((id) => paletteOf(id)));
    for (const r of data.regions) {
      const st = REGION_STYLE[r.id];
      const base = paletteOf(st?.palette ?? 'village');
      this.palettes.set(r.id, { ...base, mini: { ...base.mini, ground: r.colors[0] } });
    }
    this.placeFixed();
  }

  private put(p: Placement): void {
    const k = `${Math.floor(p.x / TILE_SIZE / N)},${Math.floor((p.y - 1) / TILE_SIZE / N)}`;
    if (!this.fixed.has(k)) this.fixed.set(k, []);
    this.fixed.get(k)!.push(p);
  }

  private obj(o: WorldObject): void {
    const k = `${Math.floor(o.at[0] / N)},${Math.floor(o.at[1] / N)}`;
    if (!this.objs.has(k)) this.objs.set(k, []);
    this.objs.get(k)!.push(classGated(o)); // other classes' story objects stay inert (classGate.ts)
  }

  private placeFixed(): void {
    for (const v of this.data.villages) {
      for (const p of villagePlacements(v)) this.put(p);
    }
    for (const w of this.waystones) this.mark(w.at[0] - 4, w.at[1] - 4, 9, 10); // a clearing for arrivals
    for (const w of this.waystones) {
      this.put({ art: 'v_waystone', x: w.at[0] * TILE_SIZE + 16, y: w.at[1] * TILE_SIZE + 28, key: w.id });
      this.obj({ id: w.id, kind: 'waystone', at: w.at, props: { name: w.name, label: 'Wake' } });
    }
    this.placeGateCircle();
    // the Drowned Bell on its island in the Abbey lake
    const bx = this.lake.cx * TILE_SIZE, by = this.lake.cy * TILE_SIZE;
    this.put({ art: 'd_bell', x: bx, y: by, key: 'drowned-bell' });
    this.obj({ id: 'obj:drowned-bell', kind: 'interactable', at: [this.lake.cx, this.lake.cy], props: { name: 'The Drowned Bell', label: 'Ring' } });
    // the Concord Citadel and its gates (sealed with the Heart)
    const [qx, qy] = this.citadel;
    this.put({ art: 'lm:citadel:concordia', x: qx * TILE_SIZE + 16, y: qy * TILE_SIZE, key: 'concord-citadel' });
    this.obj({ id: 'obj:concord-citadel-gate', kind: 'door', at: [qx, qy], when: HEART_OPEN,
      props: { target: 'inst:concord-citadel', entrance: 'main', name: 'The Concord Citadel', label: 'Enter' } });
    this.reserveAll();
    this.placeOptional();
    placeConcordiaPlaces({
      villages: this.data.villages, waystones: this.waystones, river: this.data.river, lake: this.lake,
      regionAt: (x, y) => this.regionAt(x, y), cornerAt: (x, y) => this.cornerAt(x, y),
      free: (x, y, w, h, heart) => this.free(x, y, w, h, heart),
      keep: ([x, y, w, h], pave) => { this.mark(x, y, w, h); if (pave) this.paved.push([x, y, w, h]); },
      put: (p) => this.put(p), obj: (o) => this.obj(o),
      area: (id, at, r) => this.triggers.set(id, { at, r }),
      find: (id) => { for (const list of this.objs.values()) { const o = list.find((x) => x.id === id); if (o) return [o.at[0], o.at[1]]; } return null; },
    });
  }

  /**
   * Ruins, caves and lookouts per region: hashed samples inside the region's polygons (map px, cheap), kept when
   * well off every road, 20+ off villages and 40+ from the region's other two, then a free 9×9 check.
   */
  private placeOptional(): void {
    const S = this.data.scale;
    for (const r of this.data.regions) {
      if (r.id === 'region:heart') continue;
      const slugR = r.id.slice(7), got: [number, number][] = [];
      const box = this.polyBoxes.find(([x]) => x === r)![1];
      for (let i = 0; i < 900 && got.length < OPT_KINDS.length; i++) {
        const [x0, y0, x1, y1, poly] = box[i % box.length];
        const mx = x0 + hash01(i, r.id.length, 71) * (x1 - x0), my = y0 + hash01(r.id.length, i, 72) * (y1 - y0);
        if (!inPoly(mx, my, poly)) continue;
        const tx = Math.floor(mx * S), ty = Math.floor(my * S);
        // the road field is capped at 8 tiles: the centre and four probes 10 out must all be at the cap
        if ([[0, 0], [10, 0], [-10, 0], [0, 10], [0, -10]].some(([dx, dy]) => this.roadDist(tx + dx + 0.5, ty + dy + 0.5) < 8) || this.village(tx, ty, 20) || this.inLake(tx, ty, 6) || this.inGateCircle(tx, ty, 10)) continue;
        if (got.some(([gx, gy]) => Math.hypot(gx - tx, gy - ty) < 40)) continue;
        if (this.regionRaw(tx, ty)?.id !== r.id || !this.free(tx - 4, ty - 4, 9, 9)) continue;
        got.push([tx, ty]);
      }
      got.forEach(([x, y], k) => {
        const kind = OPT_KINDS[k], base = `${slugR}-${kind}`, name = optionalName(`area:${base}`)!.name;
        this.optional.set(`area:${base}`, { kind, region: r.id, at: [x, y], r: kind === 'ruin' ? 8 : kind === 'cave' ? 6 : 5 });
        const pal = REGION_STYLE[r.id]?.palette ?? 'village';
        const rc = (a: string) => (pal.startsWith('rc:') ? `${pal}:${a}` : a);
        const art = (a: string, tx: number, ty: number, key: string) => this.put({ art: a, x: tx * TILE_SIZE + 16, y: ty * TILE_SIZE + 28, key: `${base}-${key}` });
        if (kind === 'ruin') {
          art(rc('f_ruin_arch'), x, y - 1, 'arch');
          art('d_pillar', x - 4, y, 'p1'); art('d_pillar', x + 4, y, 'p2'); art('d_pillar', x - 3, y + 3, 'p3');
          art('d_bones', x - 1, y + 4, 'bones');
          art('d_chest', x, y + 2, 'cache');
          // level: the ruin pack's band in force for this host when opened (interact.ts); the handoff band as a fallback
          this.obj({ id: `obj:${base}-cache`, kind: 'chest', at: [x, y + 3], props: { name: 'Chest', label: 'Open', level: regionLevels(r)[1], band: `pack:${base}`, rarity: 'rare' } });
          art('f_runestone', x + 3, y + 3, 'find');
          this.obj({ id: `obj:${base}-find`, kind: 'interactable', at: [x + 3, y + 4], props: { name, label: 'Search' } });
        } else if (kind === 'cave') {
          art(rc('d_arch'), x, y, 'mouth');
          art('f_roots', x - 2, y, 'r1'); art('f_roots', x + 2, y + 1, 'r2'); art('f_mushrooms', x - 2, y + 2, 'm');
          this.obj({ id: `obj:${base}-door`, kind: 'door', at: [x, y + 1], props: { target: `inst:${base}`, entrance: 'main', name, label: 'Enter' } });
        } else {
          art('f_runestone', x + 1, y - 1, 'stone');
          art('v_bench', x - 1, y, 'bench');
          this.obj({ id: `obj:${base}-find`, kind: 'interactable', at: [x, y + 1], props: { name, label: 'Look out', lookout: true } });
        }
        this.mark(x - 4, y - 3, 9, 8);
      });
    }
  }

  /** Twelve school arches in a ring (each a door home for that school's hero once their gate is open). */
  private placeGateCircle(): void {
    const [gx, gy] = this.gateCircle;
    this.obj({ id: 'landmark:gate-circle', kind: 'trigger', at: [gx - GATE_R, gy - GATE_R], size: [GATE_R * 2 + 1, GATE_R * 2 + 1], props: { name: 'The Gate Circle', landmark: true } });
    [...MAGIC_SCHOOLS, ...MARTIAL_SCHOOLS].forEach((school, i) => {
      const a = -Math.PI / 2 + (i / 12) * Math.PI * 2;
      const ax = Math.round(gx + Math.cos(a) * (GATE_R - 1)), ay = Math.round(gy + Math.sin(a) * (GATE_R - 2));
      this.put({ art: `rc:${school}:d_arch`, x: ax * TILE_SIZE + 16, y: (ay + 1) * TILE_SIZE, key: `arch-${school}` });
      this.obj({ id: `obj:arch-${school}`, kind: 'door', at: [ax, ay + 1], when: { flag: 'story.gate_open' },
        props: { target: `space:realm:${school}`, entrance: `ws:${school}-gate`, school, name: `The ${school[0].toUpperCase()}${school.slice(1)} arch`, label: 'Go home' } });
    });
  }

  private mark(x: number, y: number, w: number, h: number): void {
    for (let ty = Math.max(0, y); ty < Math.min(this.heightTiles, y + h); ty++) {
      for (let tx = Math.max(0, x); tx < Math.min(this.widthTiles, x + w); tx++) this.taken[ty * this.widthTiles + tx] = 1;
    }
  }

  /** Mark every fixed placement so far (lower body + 1-tile margin). */
  private reserveAll(): void {
    for (const list of this.fixed.values()) for (const p of list) {
      const s = artSize(p.art);
      const x0 = Math.floor((p.x - s.w / 2) / TILE_SIZE) - 1, y0 = Math.floor((p.y - s.h * 0.6) / TILE_SIZE) - 1;
      this.mark(x0, y0, Math.ceil(s.w / TILE_SIZE) + 2, Math.ceil((s.h * 0.6) / TILE_SIZE) + 2);
    }
  }

  /** Free ground for a set piece: land, plain ground corners, off roads, villages, the lake and taken tiles. */
  private free(x: number, y: number, w: number, h: number, heart = false): boolean {
    if (x < 2 || y < 2 || x + w >= this.widthTiles - 2 || y + h >= this.heightTiles - 2) return false;
    for (let ty = y; ty < y + h; ty++) for (let tx = x; tx < x + w; tx++) {
      if (this.taken[ty * this.widthTiles + tx] || this.village(tx, ty, 1) || this.inGateCircle(tx, ty, 2) || this.inLake(tx, ty, 1)) return false;
      if (this.cornerAt(tx, ty) !== Corner.GROUND || this.roadDist(tx + 0.5, ty + 0.5) < 2) return false;
      const r = this.regionAtTile(tx, ty);
      if (!r || (r.id === 'region:heart') !== heart) return false;
    }
    return true;
  }

  private inGateCircle(x: number, y: number, grow = 0): boolean {
    return Math.hypot(x - this.gateCircle[0], (y - this.gateCircle[1]) * 1.25) <= GATE_R + grow;
  }

  /** The Weeping Wall's gate tiles stay shut until story.heart_open (checked at query time, on the authority's flags). */
  blockedAt(tx: number, ty: number): boolean {
    const r = this.regionAtTile(tx, ty);
    if (r?.id !== 'region:heart' || this.roadDist(tx, ty) >= 2.5 || !this.heartWall(tx, ty, r)) return false;
    try { return !evalCondition(HEART_OPEN); } catch { return true; } // no game state (bare server): sealed
  }

  // ---------------------------------------------------------------- lookup
  /** Region at a map-px position (first match in map.js order), or null for the ocean. */
  regionAtMap(mx: number, my: number): MorvaneRegionDef | null {
    // bounding boxes first: this runs for every tile of every region block (hot)
    for (const [r, polys] of this.polyBoxes) {
      for (const [x0, y0, x1, y1, p] of polys) if (mx >= x0 && my >= y0 && mx <= x1 && my <= y1 && inPoly(mx, my, p)) return r;
    }
    return null;
  }

  private polyBoxes: [MorvaneRegionDef, [number, number, number, number, [number, number][]][]][] = [];

  private regionAtTile(tx: number, ty: number): MorvaneRegionDef | null {
    if (tx < 0 || ty < 0 || tx >= this.widthTiles || ty >= this.heightTiles) return null;
    const bx = Math.floor(tx / N), by = Math.floor(ty / N);
    const v = this.regionBlocks.get(bx, by)[(ty - by * N) * N + (tx - bx * N)];
    return v ? this.data.regions[v - 1] : null;
  }

  private computeRegionBlock(bx: number, by: number): Uint8Array {
    const out = new Uint8Array(N * N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const r = this.regionRaw(bx * N + x, by * N + y);
      out[y * N + x] = r ? this.data.regions.indexOf(r) + 1 : 0;
    }
    return out;
  }

  private regionRaw(tx: number, ty: number): MorvaneRegionDef | null {
    const s = this.data.scale;
    const wx = this.warp.noise(tx / 30, ty / 30) * 1.2, wy = this.warp.noise(ty / 30 + 50, tx / 30) * 1.2;
    return this.regionAtMap((tx + 0.5) / s + wx, (ty + 0.5) / s + wy);
  }

  /** village origins, computed once (this check runs several times per tile) */
  private vrects: [number, number, VillageDef][] | null = null;

  private village(tx: number, ty: number, pad = 0): VillageDef | null {
    const rs = (this.vrects ??= this.data.villages.map((v) => [...villageOrigin(v), v] as [number, number, VillageDef]));
    for (let i = 0; i < rs.length; i++) {
      const [ox, oy, v] = rs[i];
      if (tx >= ox - pad && ty >= oy - pad && tx < ox + VIL_W + pad && ty < oy + VIL_H + pad) return v;
    }
    return null;
  }

  private roadDist(x: number, y: number): number {
    return this.roadField.at(x, y);
  }

  private inLake(x: number, y: number, grow = 0): boolean {
    const L = this.lake;
    return ((x - L.cx) / (L.rx + grow)) ** 2 + ((y - L.cy) / (L.ry + grow)) ** 2 <= 1;
  }

  private onBellIsland(x: number, y: number): boolean {
    return Math.hypot(x - this.lake.cx, (y - this.lake.cy) * 1.4) < 6;
  }

  /**
   * The Weeping Wall: a permanent cliff band round the Heart (geometry only, so terrain never depends on flags).
   * The processional way passes through one gap, closed by the gate until story.heart_open (see blockedAt).
   */
  private heartWall(x: number, y: number, r: MorvaneRegionDef | null): boolean {
    if (r?.id !== 'region:heart') return false;
    const s = this.data.scale;
    for (const [dx, dy] of [[3, 0], [-3, 0], [0, 3], [0, -3]]) {
      const o = this.regionAtMap((x + dx) / s, (y + dy) / s);
      if (o && o.id !== 'region:heart') return true;
    }
    return false;
  }

  cornerAt(cx: number, cy: number): number {
    return this.corners.get(cx, cy);
  }

  private computeCorner(cx: number, cy: number): number {
    const r = this.regionAtTile(Math.min(cx, this.widthTiles - 1), Math.min(cy, this.heightTiles - 1));
    if (!r) return Corner.WATER;
    const v = this.village(cx, cy);
    if (v) {
      const [ox, oy] = villageOrigin(v);
      return villageRoad(cx - ox, cy - oy) ? Corner.PATH : Corner.GROUND;
    }
    if (this.inGateCircle(cx, cy, 3)) return Corner.GROUND;
    if (this.heartWall(cx, cy, r) && this.roadDist(cx, cy) >= 2.5) return Corner.CLIFF;
    const road = this.roadDist(cx, cy);
    if (road < 1.6) return Corner.PATH;
    if (this.riverField.at(cx, cy) < 3) return Corner.WATER;
    if (this.inLake(cx, cy)) return this.onBellIsland(cx, cy) ? Corner.GROUND : Corner.WATER;
    const st = REGION_STYLE[r.id];
    if (!st || this.village(cx, cy, 6) || road < 5) return Corner.GROUND;
    if (st.mountains && this.fields.fbm(cx, cy, 3, 34) > st.mountains) return Corner.CLIFF;
    if (this.ponds.fbm(cx, cy, 3, 24) > st.pond) return Corner.WATER;
    return Corner.GROUND;
  }

  paletteAt(tx: number, ty: number): Palette {
    const r = this.regionAtTile(tx, ty);
    return (r && this.palettes.get(r.id)) ?? this.palettes.get('region:alder')!;
  }

  surfaceAt(tx: number, ty: number): Surface {
    for (const [x, y, w, h] of this.paved) if (tx >= x && ty >= y && tx < x + w && ty < y + h) return 'cobble';
    if (this.inGateCircle(tx, ty)) return 'cobble';
    if (this.village(tx, ty)) return hash01(tx, ty, 5) < 0.1 ? 'flowers' : 'grass';
    const r = this.regionAtTile(tx, ty);
    const f = this.fields.fbm(tx + 400, ty, 2, 16);
    if (r?.id === 'region:alder' && f > 0.66) return (['farm', 'crops', 'wheat'] as const)[Math.floor(hash01(tx >> 3, ty >> 3, 9) * 3)];
    if (r?.id === 'region:gilded' && f > 0.6) return 'cobble';
    return f < 0.3 ? 'flowers' : 'grass';
  }

  placements(cx: number, cy: number): Placement[] {
    return this.memo.get(cx, cy);
  }

  placementsNear(cx: number, cy: number): Placement[] {
    return this.fixed.get(`${cx},${cy}`) ?? [];
  }

  private computePlacements(cx: number, cy: number): Placement[] {
    const out = [...(this.fixed.get(`${cx},${cy}`) ?? [])];
    for (let ly = 0; ly < N; ly++) for (let lx = 0; lx < N; lx++) {
      const tx = cx * N + lx, ty = cy * N + ly;
      const r = this.regionAtTile(tx, ty);
      const st = r && REGION_STYLE[r.id];
      if (!st) continue;
      const dens = st.density * (0.3 + this.fields.fbm(tx + 900, ty, 2, 28) * 1.5);
      if (hash2(tx, ty, 41) >= dens) continue;
      if (this.taken[ty * this.widthTiles + tx]) continue;
      if (this.inGateCircle(tx, ty, 4)) continue;
      if (this.village(tx, ty, 3) || this.roadDist(tx + 0.5, ty + 0.5) < 3.5 || this.inLake(tx, ty, 3)) continue;
      if (this.cornerAt(tx, ty) !== Corner.GROUND || this.cornerAt(tx + 1, ty + 1) !== Corner.GROUND) continue;
      const art = st.trees[Math.floor(hash2(ty, tx, 42) * st.trees.length)];
      const pal = st.palette.startsWith('rc:') ? `${st.palette}:${art}` : art;
      out.push({ art: pal, x: tx * TILE_SIZE + 16, y: ty * TILE_SIZE + 28, key: `t${tx},${ty}` });
    }
    return out;
  }

  objects(cx: number, cy: number): WorldObject[] {
    return this.objs.get(`${cx},${cy}`) ?? [];
  }

  regionAt(tx: number, ty: number): string {
    for (const [id, o] of this.optional) if ((tx - o.at[0]) ** 2 + (ty - o.at[1]) ** 2 <= o.r * o.r) return id;
    // overlapping story triggers (two classes' banter on a shared road): the nearest centre wins
    let tid = '', td = Infinity;
    for (const [id, o] of this.triggers) { const d = (tx - o.at[0]) ** 2 + (ty - o.at[1]) ** 2; if (d <= o.r * o.r && d < td) { td = d; tid = id; } }
    if (tid) return tid;
    return this.regionAtTile(tx, ty)?.id ?? '';
  }

  /** Safe: villages and towns (+4 tiles) and 6 tiles round every waystone; everything else is wild. */
  zoneRule(tx: number, ty: number): ZoneRule {
    if (this.village(tx, ty, 4)) return 'safe';
    for (const w of this.waystones) if ((tx - w.at[0]) ** 2 + (ty - w.at[1]) ** 2 <= 36) return 'safe';
    return 'wild';
  }

  /** Village id at a tile, for discovery and the map. */
  villageAt(tx: number, ty: number): string | null {
    return this.village(tx, ty)?.id ?? null;
  }
}

/** A Morvane region's ground palette (its optional cave is drawn in it). */
export const regionPalette = (id: string): PaletteId => REGION_STYLE[id]?.palette ?? 'village';

/** A Morvane region's level band ("6–10" → [6, 10]). */
export function regionLevels(r: MorvaneRegionDef): [number, number] {
  const [lo, hi] = r.levels.split(/[–-]/).map((x) => parseInt(x, 10));
  return [lo || 1, hi || (lo || 1) + 4];
}

