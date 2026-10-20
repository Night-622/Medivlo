/**
 * School realm generator (docs/world/HOLLOW-CROWN-WORLD.md §3): a 384×256-tile island in its realm's palette with
 * the capital (west), the frontier (east), the realm gate arena (centre-north), 4 zones + 3 lair entrances per
 * area, roads, ponds and per-school scatter. Deterministic and pure.
 */
import { CHUNK_TILES, TILE_SIZE, WORLD_SEED, type WorldObject } from '@/core';
import { hash01, hash2, Simplex2 } from './noise';
import { ChunkMemo, CornerCache, DistanceField } from './fields';
import { Corner } from './autotile';
import type { SpaceGen, ZoneRule } from './space';
import { paletteOf, TileRegistry, type Palette, type Surface } from './theme';
import type { AreaDef, RealmDef, SchoolId, SetPieceDef, VillageDef, WaystoneDef } from './types';
import { artSize } from './footprints';
import { placeSetPieces } from './setPieces';
import { OPT_KINDS, optionalName, type OptKind } from '@/data/regions/hc/optionalAreas';
import { type Placement, villageDoorRects, villageOrigin, villagePlacements, villageRoad, VIL_H, VIL_W, slug } from './village';
import { classGated } from './classGate';

export const REALM_W = 384;
export const REALM_H = 256;
const N = CHUNK_TILES;

type P2 = [number, number];
const HUB = { capital: [96, 132] as P2, frontier: [288, 132] as P2 };
const CROSS: P2 = [192, 136];
export const GATE: P2 = [192, 40];
/** Zone centres and lair entrances for the capital side; the frontier side mirrors them on x. */
const ZONES: P2[] = [[96, 132], [50, 62], [140, 66], [86, 208]];
const LAIRS: P2[] = [[36, 100], [150, 206], [60, 186]];
/** optional areas (capital half; the frontier mirrors): off the roads, searched outward for free land */
const OPTIONAL: Record<OptKind, { at: P2; r: number }> = { ruin: { at: [112, 22], r: 8 }, cave: { at: [18, 226], r: 6 }, view: { at: [14, 150], r: 5 } };
/** pack level per optional area: a step above the zone nearest it (ruin by zone 3, cave by zone 4) */
export const OPTIONAL_LEVEL: Record<OptKind, number> = { ruin: 8, cave: 12, view: 0 };
const mirror = ([x, y]: P2): P2 => [REALM_W - x, y];

/** Per-school flavour: scatter props, density and pond threshold (lower = more water). */
const FLAVOUR: Record<SchoolId, { trees: string[]; density: number; pond: number; farms: boolean; fort: boolean }> = {
  ash: { trees: ['f_deadtree', 'f_stump', 'f_log'], density: 0.05, pond: 0.72, farms: false, fort: false },
  rime: { trees: ['f_pine', 'f_pine', 'f_stump'], density: 0.09, pond: 0.74, farms: false, fort: true },
  storm: { trees: ['f_pine', 'f_deadtree', 'f_runestone'], density: 0.06, pond: 0.8, farms: false, fort: false },
  radiance: { trees: ['f_pine', 'v_hedge', 'f_fern'], density: 0.05, pond: 0.8, farms: true, fort: true },
  umbral: { trees: ['f_gloamtree', 'f_deadtree', 'f_mushrooms'], density: 0.1, pond: 0.76, farms: false, fort: false },
  verdant: { trees: ['f_gloamtree', 'f_pine', 'f_fern', 'f_toadstool'], density: 0.16, pond: 0.76, farms: false, fort: false },
  blade: { trees: ['f_pine', 'f_fern', 'v_hedge'], density: 0.08, pond: 0.74, farms: true, fort: false },
  iron: { trees: ['f_deadtree', 'f_stump', 'f_runestone'], density: 0.05, pond: 0.82, farms: false, fort: true },
  fist: { trees: ['f_pine', 'f_runestone', 'f_fern'], density: 0.07, pond: 0.8, farms: true, fort: false },
  hunt: { trees: ['f_gloamtree', 'f_pine', 'f_pine', 'f_log'], density: 0.14, pond: 0.78, farms: false, fort: false },
  guile: { trees: ['f_bramble', 'f_deadtree', 'v_hedge'], density: 0.06, pond: 0.7, farms: false, fort: false },
  song: { trees: ['f_pine', 'f_fern', 'f_toadstool', 'v_flowerbed'], density: 0.07, pond: 0.78, farms: true, fort: false },
};

export const GATE_NAMES: Record<SchoolId, string> = {
  ash: 'the Cinder Gate', rime: 'the White Gate', storm: 'the Copper Gate', radiance: 'the Dawn Gate', umbral: 'the Dusk Gate',
  verdant: 'the Thorn Gate', blade: 'the Edge Gate', iron: 'the Iron Gate', fist: 'the Stair Gate', hunt: 'the Antler Gate',
  guile: 'the Pawned Gate', song: 'the Lyre Gate',
};

function capitalVillage(realm: RealmDef, school: SchoolId, at: P2): VillageDef {
  return {
    id: `vil:${school}-capital`, name: realm.capital, space: realm.space, region: `area:${school}-capital`, at, tiles: realm.id, capital: true,
    places: [
      [`lm:${realm.arch}:${school}`, realm.landmark, `${school[0].toUpperCase()}${school.slice(1)} school`, null],
      ['b_inn', 'Inn', 'Rest · Rumours', null], ['b_smithy', 'Smithy', 'Weapons · Armour', null], ['b_teahouse', 'Tea room', 'Food', null],
      ['b_house_tall', 'Townhouse', 'Homes', null], ['b_stall', 'Market', 'Trade', null], ['b_pub', 'Tavern', 'Rumours', null],
      ['b_house_stone', 'Stone house', 'Homes', null],
    ],
  };
}

function frontierVillage(realm: RealmDef, school: SchoolId, area: AreaDef | undefined, at: P2): VillageDef {
  const fort = FLAVOUR[school].fort;
  return {
    id: `vil:${school}-frontier`, name: area?.zones[0]?.name ?? area?.title ?? 'Frontier', space: realm.space, region: `area:${school}-frontier`, at,
    tiles: realm.id,
    places: fort
      ? [['c_gate', 'Gatehouse', 'The march', null], ['c_tower', 'Watchtower', 'Lookout', null], ['b_smithy', 'Forge', 'Weapons · Armour', null], ['b_training', 'Drill yard', 'Bounties', null], ['b_stall', 'Quartermaster', 'Trade', null]]
      : [['b_training', 'Muster yard', 'Bounties', null], ['b_inn', 'Waystation', 'Rest · Rumours', null], ['b_smithy', 'Forge', 'Weapons · Armour', null], ['b_stall', 'Trader', 'Trade', null], ['b_house_stone', 'Hut', 'Homes', null]],
  };
}

export class RealmGen implements SpaceGen {
  readonly id: string;
  readonly widthTiles = REALM_W;
  readonly heightTiles = REALM_H;
  readonly registry: TileRegistry;
  readonly palette: Palette;
  readonly school: SchoolId;
  readonly villages: VillageDef[];
  readonly waystones: WaystoneDef[];
  /** zone id → centre (world tiles) */
  readonly zones = new Map<string, P2>();
  private roads: [P2, P2][] = [];
  /** patrol routes (PACING pass 4): a stretch of each road out to a zone or a lair, walked by an elite-led pack */
  readonly patrols: { id: string; a: P2; b: P2; zone: number }[] = [];
  /** the roads out (hub → zones, zones → lairs, the climb to the gate) with the zone whose band they share */
  readonly routes: { id: string; a: P2; b: P2; zone: number }[] = [];
  private fixed = new Map<string, Placement[]>();
  private objs = new Map<string, WorldObject[]>();
  /** tiles taken by fixed placements (scatter and set pieces keep clear) */
  private reserved = new Uint8Array(REALM_W * REALM_H);
  /** lair-interior set pieces by instance id (half-stones, relics) for the lair builders */
  readonly lairPieces: Map<string, SetPieceDef[]>;
  /** optional areas (PACING pass 2): id → kind, side, centre tile, radius */
  /** story trigger zones from set pieces (`area:` ids): id → centre, radius */
  readonly triggers = new Map<string, { at: P2; r: number }>();
  readonly optional = new Map<string, { kind: OptKind; side: 'capital' | 'frontier'; at: P2; r: number }>();
  private warp: Simplex2;
  private ponds: Simplex2;
  private fields: Simplex2;
  private roadField!: DistanceField;
  private corners = new CornerCache((x, y) => this.computeCorner(x, y));
  private memo = new ChunkMemo((cx, cy) => this.computePlacements(cx, cy));

  constructor(readonly realm: RealmDef, areas: AreaDef[], pieces: SetPieceDef[] = []) {
    this.school = realm.school as SchoolId;
    this.id = realm.space;
    this.palette = paletteOf(`rc:${this.school}`, { ground: realm.colors[1], path: realm.colors[0], water: realm.colors[2] });
    this.registry = new TileRegistry([this.palette]);
    const seed = WORLD_SEED ^ (this.school.charCodeAt(0) * 7919 + this.school.length * 104729);
    this.warp = new Simplex2(seed);
    this.ponds = new Simplex2(seed ^ 0x55aa);
    this.fields = new Simplex2(seed ^ 0x1234);
    const S = this.school;
    const capArea = areas.find((a) => a.id === `area:${S}-capital`);
    const froArea = areas.find((a) => a.id === `area:${S}-frontier`);
    this.villages = [capitalVillage(realm, S, HUB.capital), frontierVillage(realm, S, froArea, HUB.frontier)];
    this.waystones = realmWaystones(realm, areas);
    // roads: hubs ↔ cross ↔ gate, hubs → zones, zones → lairs
    const road = (a: P2, b: P2) => this.roads.push([a, b]);
    road(HUB.capital, CROSS); road(CROSS, HUB.frontier); road(CROSS, [GATE[0], GATE[1] + 14]);
    this.routes.push({ id: 'gate-road', a: CROSS, b: [GATE[0], GATE[1] + 18], zone: 4 });
    for (const [side, m] of [['capital', (p: P2) => p], ['frontier', mirror]] as const) {
      const hub = HUB[side];
      // the far 40–80% of each road: clear of the hub village and of the zone's own spawns
      const patrol = (id: string, a: P2, b: P2, zone: number) => {
        const at = (t: number): P2 => [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t)];
        this.patrols.push({ id: `${side}-${id}`, a: at(0.4), b: at(0.8), zone });
        this.routes.push({ id: `${side}-${id}`, a, b, zone });
      };
      ZONES.slice(1).forEach((z, i) => { road(hub, m(z)); this.zones.set(`zone:${S}-${side}-${i + 2}`, m(z)); patrol(`z${i + 2}`, hub, m(z), i + 2); });
      this.zones.set(`zone:${S}-${side}-1`, hub);
      LAIRS.forEach((l, i) => { road(m(ZONES[[1, 3, 3][i]]), m(l)); patrol(`l${i + 1}`, m(ZONES[[1, 3, 3][i]]), m(l), [2, 4, 4][i]); });
    }
    this.roadField = new DistanceField(REALM_W, REALM_H, this.roads);
    this.placeFixed(capArea, froArea);
    this.placeOptional();
    // the gate seal is part of the gate itself (placeFixed)
    this.lairPieces = this.placeSetPieces(pieces.filter((p) => p.area.startsWith(`area:${S}-`) && p.id !== `obj:${S}-gate-seal`));
  }

  private put(p: Placement): void {
    this.reserve(p);
    const k = `${Math.floor(p.x / TILE_SIZE / N)},${Math.floor((p.y - 1) / TILE_SIZE / N)}`;
    if (!this.fixed.has(k)) this.fixed.set(k, []);
    this.fixed.get(k)!.push(p);
  }

  private obj(o: WorldObject): void {
    const k = `${Math.floor(o.at[0] / N)},${Math.floor(o.at[1] / N)}`;
    if (!this.objs.has(k)) this.objs.set(k, []);
    this.objs.get(k)!.push(classGated(o)); // other classes' story objects stay inert (classGate.ts)
  }

  private placeFixed(capArea?: AreaDef, froArea?: AreaDef): void {
    const S = this.school;
    for (const v of this.villages) {
      for (const p of villagePlacements(v)) this.put(p);
      // a landmark at each village building's door (Claude 4 hangs NPCs and services on them; the centre if unplaced)
      const doors = villageDoorRects(v);
      v.places.forEach((p, i) => this.obj({ id: `landmark:${v.id.slice(4)}-${slug(p[1])}`, kind: 'trigger', at: doors[i]?.at ?? [v.at[0], v.at[1]], size: doors[i]?.size ?? [1, 1], props: { label: p[1] } }));
    }
    // keep a clearing round every waystone: arrivals and respawns stand here (no pine on top of the hero)
    for (const w of this.waystones) {
      for (let y = w.at[1] - 4; y <= w.at[1] + 5; y++) for (let x = w.at[0] - 4; x <= w.at[0] + 4; x++) {
        if (x >= 0 && y >= 0 && x < REALM_W && y < REALM_H) this.reserved[y * REALM_W + x] = 1;
      }
    }
    for (const w of this.waystones) {
      this.put({ art: 'v_waystone', x: w.at[0] * TILE_SIZE + 16, y: w.at[1] * TILE_SIZE + 28, key: w.id });
      this.obj({ id: w.id, kind: 'waystone', at: w.at, props: { name: w.name, label: 'Wake' } });
    }
    // the realm gate: a sealed arch weeping black tears, crystals either side
    const gx = GATE[0] * TILE_SIZE, gy = GATE[1] * TILE_SIZE;
    this.put({ art: 'rc:umbral:d_arch', x: gx + 16, y: gy + 8, key: `${S}-gate-arch` });
    this.put({ art: 'd_crystal', x: gx - 80, y: gy + 20, key: `${S}-gate-c1` });
    this.put({ art: 'd_crystal', x: gx + 112, y: gy + 20, key: `${S}-gate-c2` });
    this.obj({ id: `obj:${S}-gate-seal`, kind: 'interactable', at: [GATE[0], GATE[1] + 1], props: { name: GATE_NAMES[S], label: 'Examine' } });
    // the realm boss fights in the gate arena while the hero's I-10 stage is on (story.gate_fight, Claude 4)
    this.obj({ id: `boss:${S}-gate`, kind: 'trigger', at: [GATE[0] - 21, GATE[1] - 13], size: [43, 30], when: { flag: 'story.gate_fight' },
      props: { boss: `bx_${S}_5`, level: 14, x: GATE[0], y: GATE[1] + 9 } });
    this.obj({ id: `obj:${S}-gate-way`, kind: 'door', at: [GATE[0] + 1, GATE[1] + 1], when: { flag: 'story.act', op: '>=', value: 2 },
      props: { target: 'space:concordia', entrance: 'ws:gate-circle', name: 'The Gate Circle', label: 'Pass through' } });
    // lair entrances
    for (const [side, area, m] of [['capital', capArea, (p: P2) => p], ['frontier', froArea, mirror]] as const) {
      LAIRS.forEach((l, i) => {
        const [lx, ly] = m(l);
        const id = `inst:${S}-${side}-lair-${i + 1}`;
        this.put({ art: `rc:${S}:f_ruin_arch`, x: lx * TILE_SIZE + 16, y: ly * TILE_SIZE, key: id });
        this.obj({ id: `obj:${S}-${side}-lair-${i + 1}-door`, kind: 'door', at: [lx, ly], props: { target: id, entrance: 'main', name: area?.lairs[i]?.name ?? 'Lair', label: 'Enter' } });
      });
    }
  }

  /** Ruins, caves and lookouts off the roads: the nearest free 9×9 of land to each spot, outward. */
  private placeOptional(): void {
    const S = this.school;
    const free = (cx: number, cy: number) => {
      for (let y = cy - 4; y <= cy + 4; y++) for (let x = cx - 4; x <= cx + 4; x++) {
        if (x < 3 || y < 3 || x >= REALM_W - 3 || y >= REALM_H - 3 || this.reserved[y * REALM_W + x]) return false;
        if (!this.land(x, y) || this.cornerAt(x, y) === Corner.WATER || this.inVillage(x, y, 3) || this.nearGate(x, y)) return false;
      }
      return this.roadDist(cx + 0.5, cy + 0.5) >= 6;
    };
    for (const side of ['capital', 'frontier'] as const) {
      for (const kind of OPT_KINDS) {
        const [ox, oy] = side === 'capital' ? OPTIONAL[kind].at : mirror(OPTIONAL[kind].at);
        let at: P2 | null = null;
        for (let r = 0; r < 40 && !at; r += 2) {
          for (let a = 0; a < 16 && !at; a++) {
            const x = Math.round(ox + Math.cos((a / 16) * Math.PI * 2) * r), y = Math.round(oy + Math.sin((a / 16) * Math.PI * 2) * r);
            if (free(x, y)) at = [x, y];
            if (r === 0) break;
          }
        }
        if (!at) continue;
        const [x, y] = at, base = `${S}-${side}-${kind}`, name = optionalName(`area:${base}`)!.name;
        this.optional.set(`area:${base}`, { kind, side, at, r: OPTIONAL[kind].r });
        const art = (a: string, tx: number, ty: number, key: string) => this.put({ art: a, x: tx * TILE_SIZE + 16, y: ty * TILE_SIZE + 28, key: `${base}-${key}` });
        if (kind === 'ruin') {
          art(`rc:${S}:f_ruin_arch`, x, y - 1, 'arch');
          art('d_pillar', x - 4, y, 'p1'); art('d_pillar', x + 4, y, 'p2'); art('d_pillar', x - 3, y + 3, 'p3');
          art('d_bones', x - 1, y + 4, 'bones');
          art('d_chest', x, y + 2, 'cache');
          // level: the ruin pack's band in force when opened (interact.ts); OPTIONAL_LEVEL if that can't be read
          this.obj({ id: `obj:${base}-cache`, kind: 'chest', at: [x, y + 3], props: { name: 'Chest', label: 'Open', level: OPTIONAL_LEVEL.ruin, band: `pack:${base}`, rarity: 'rare' } });
          art('f_runestone', x + 3, y + 3, 'find');
          this.obj({ id: `obj:${base}-find`, kind: 'interactable', at: [x + 3, y + 4], props: { name, label: 'Search' } });
        } else if (kind === 'cave') {
          art(`rc:${S}:d_arch`, x, y, 'mouth');
          art('f_roots', x - 2, y, 'r1'); art('f_roots', x + 2, y + 1, 'r2'); art('f_mushrooms', x - 2, y + 2, 'm');
          this.obj({ id: `obj:${base}-door`, kind: 'door', at: [x, y + 1], props: { target: `inst:${base}`, entrance: 'main', name, label: 'Enter' } });
        } else {
          art('f_runestone', x + 1, y - 1, 'stone');
          art('v_bench', x - 1, y, 'bench');
          this.obj({ id: `obj:${base}-find`, kind: 'interactable', at: [x, y + 1], props: { name, label: 'Look out', lookout: true } });
        }
        // keep the clearing open: no scatter inside the area
        for (let ty = y - 3; ty <= y + 4; ty++) for (let tx = x - 4; tx <= x + 4; tx++) this.reserved[ty * REALM_W + tx] = 1;
      }
    }
  }

  /** Mark a placement's lower body (plus a 1-tile margin) as taken. */
  private reserve(p: Placement): void {
    const s = artSize(p.art);
    const x0 = Math.floor((p.x - s.w / 2) / TILE_SIZE) - 1, x1 = Math.floor((p.x + s.w / 2) / TILE_SIZE) + 1;
    const y0 = Math.floor((p.y - s.h * 0.6) / TILE_SIZE) - 1, y1 = Math.floor(p.y / TILE_SIZE) + 1;
    for (let y = Math.max(0, y0); y <= Math.min(REALM_H - 1, y1); y++) {
      for (let x = Math.max(0, x0); x <= Math.min(REALM_W - 1, x1); x++) this.reserved[y * REALM_W + x] = 1;
    }
  }

  private placeSetPieces(pieces: SetPieceDef[]): Map<string, SetPieceDef[]> {
    const S = this.school;
    return placeSetPieces({
      school: S,
      anchor: (side, where) => {
        const [kind, n] = where.split('-');
        const m = side === 'capital' ? (p: P2) => p : mirror;
        if (kind === 'zone') return this.zones.get(`zone:${S}-${side}-${n}`) ?? null;
        if (kind === 'lair') return LAIRS[Number(n) - 1] ? m(LAIRS[Number(n) - 1]) : null;
        // way-N: halfway along the road from the hub out to zone N (beats on the walk, not in town or in the zone)
        if (kind === 'way') {
          const z = this.zones.get(`zone:${S}-${side}-${n}`), hub = HUB[side];
          return z ? [Math.round((hub[0] + z[0]) / 2), Math.round((hub[1] + z[1]) / 2)] : null;
        }
        // road: halfway up the road from the crossroads to the gate, on this side of it (wayside shrines, the climb)
        if (kind === 'road') return [CROSS[0] + (side === 'capital' ? -5 : 5), Math.round((CROSS[1] + GATE[1] + 14) / 2)];
        return [GATE[0] + (side === 'capital' ? -12 : 12), GATE[1] + 12];
      },
      free: (tx, ty, w, h, gate) => {
        for (let y = ty; y < ty + h; y++) for (let x = tx; x < tx + w; x++) {
          if (x < 2 || y < 2 || x >= REALM_W - 2 || y >= REALM_H - 2 || this.reserved[y * REALM_W + x]) return false;
          if (!this.land(x, y) || this.cornerAt(x, y) === Corner.WATER || this.inVillage(x, y, 1)) return false;
          if (this.roadDist(x + 0.5, y + 0.5) < 2 || (!gate && this.nearGate(x, y))) return false;
        }
        return true;
      },
      put: (p) => this.put(p),
      obj: (o) => this.obj(o),
      area: (id, at, r) => this.triggers.set(id, { at, r }),
      find: (id) => { for (const list of this.objs.values()) { const o = list.find((x) => x.id === id); if (o) return [o.at[0], o.at[1]]; } return null; },
    }, pieces);
  }

  // ---------------------------------------------------------------- terrain
  /** village origins, computed once (this check runs several times per tile) */
  private vrects: [number, number, VillageDef][] | null = null;

  private inVillage(tx: number, ty: number, pad = 0): VillageDef | null {
    const rs = (this.vrects ??= this.villages.map((v) => [...villageOrigin(v), v] as [number, number, VillageDef]));
    for (let i = 0; i < rs.length; i++) {
      const [ox, oy, v] = rs[i];
      if (tx >= ox - pad && ty >= oy - pad && tx < ox + VIL_W + pad && ty < oy + VIL_H + pad) return v;
    }
    return null;
  }

  private land(x: number, y: number): boolean {
    const w = this.warp.noise(x / 40, y / 40) * 0.12;
    const nx = (x - REALM_W / 2) / (REALM_W / 2 - 10), ny = (y - REALM_H / 2) / (REALM_H / 2 - 10);
    return nx ** 4 + ny ** 4 + w < 0.82;
  }

  private roadDist(x: number, y: number): number {
    return this.roadField.at(x, y);
  }

  private nearGate(x: number, y: number): boolean {
    return Math.abs(x - GATE[0]) < 22 && y > GATE[1] - 14 && y < GATE[1] + 18;
  }

  cornerAt(cx: number, cy: number): number {
    return this.corners.get(cx, cy);
  }

  private computeCorner(cx: number, cy: number): number {
    if (!this.land(cx, cy)) return Corner.WATER;
    const v = this.inVillage(cx, cy);
    if (v) {
      const [ox, oy] = villageOrigin(v);
      return villageRoad(cx - ox, cy - oy) ? Corner.PATH : Corner.GROUND;
    }
    const rd = this.roadDist(cx, cy);
    if (rd < 1.6) return Corner.PATH;
    if (this.nearGate(cx, cy)) return Corner.GROUND;
    if (rd > 5 && !this.inVillage(cx, cy, 6) && this.ponds.fbm(cx, cy, 3, 26) > FLAVOUR[this.school].pond) return Corner.WATER;
    return Corner.GROUND;
  }

  paletteAt(): Palette { return this.palette; }

  surfaceAt(tx: number, ty: number): Surface {
    if (this.nearGate(tx, ty)) return 'cobble';
    if (this.inVillage(tx, ty)) return hash01(tx, ty, 5) < 0.12 ? 'flowers' : 'grass';
    const f = this.fields.fbm(tx, ty, 2, 18);
    if (FLAVOUR[this.school].farms) {
      const dc = Math.hypot(tx - HUB.capital[0], ty - HUB.capital[1]);
      if (dc > 15 && dc < 34 && f > 0.6) return (['farm', 'crops', 'wheat'] as const)[Math.floor(hash01(tx >> 3, ty >> 3, 9) * 3)];
    }
    return f < 0.3 ? 'flowers' : 'grass';
  }

  // ---------------------------------------------------------------- contents
  placements(cx: number, cy: number): Placement[] {
    return this.memo.get(cx, cy);
  }

  placementsNear(cx: number, cy: number): Placement[] {
    return this.fixed.get(`${cx},${cy}`) ?? [];
  }

  private computePlacements(cx: number, cy: number): Placement[] {
    const out = [...(this.fixed.get(`${cx},${cy}`) ?? [])];
    const fl = FLAVOUR[this.school];
    for (let ly = 0; ly < N; ly++) for (let lx = 0; lx < N; lx++) {
      const tx = cx * N + lx, ty = cy * N + ly;
      if (tx < 2 || ty < 2 || tx >= REALM_W - 2 || ty >= REALM_H - 2) continue;
      const dens = fl.density * (0.4 + this.fields.fbm(tx + 900, ty, 2, 30) * 1.4);
      if (hash2(tx, ty, 31) >= dens) continue;
      if (!this.land(tx, ty) || !this.land(tx + 1, ty + 1) || this.roadDist(tx + 0.5, ty + 0.5) < 3.5) continue;
      if (this.reserved[ty * REALM_W + tx] || this.inVillage(tx, ty, 3) || this.nearGate(tx, ty) || this.cornerAt(tx, ty) === Corner.WATER || this.cornerAt(tx + 1, ty + 1) === Corner.WATER) continue;
      const art = fl.trees[Math.floor(hash2(ty, tx, 32) * fl.trees.length)];
      out.push({ art: `rc:${this.school}:${art}`, x: tx * TILE_SIZE + 16, y: ty * TILE_SIZE + 28, key: `t${tx},${ty}` });
    }
    return out;
  }

  objects(cx: number, cy: number): WorldObject[] {
    return this.objs.get(`${cx},${cy}`) ?? [];
  }

  regionAt(tx: number, ty: number): string {
    if (this.nearGate(tx, ty)) return `area:${this.school}-gate`;
    for (const [id, o] of this.optional) if ((tx - o.at[0]) ** 2 + (ty - o.at[1]) ** 2 <= o.r * o.r) return id;
    // overlapping story triggers (two classes' banter on a shared road): the nearest centre wins
    let tid = '', td = Infinity;
    for (const [id, o] of this.triggers) { const d = (tx - o.at[0]) ** 2 + (ty - o.at[1]) ** 2; if (d <= o.r * o.r && d < td) { td = d; tid = id; } }
    if (tid) return tid;
    let best = '', bd = 26;
    for (const [id, [x, y]] of this.zones) { const d = Math.hypot(tx - x, ty - y); if (d < bd) { bd = d; best = id; } }
    if (best) return best;
    return tx < REALM_W / 2 ? `area:${this.school}-capital` : `area:${this.school}-frontier`;
  }

  /** The area (start area or gate) a tile belongs to, regardless of zone. */
  areaAt(tx: number, ty: number): string {
    if (this.nearGate(tx, ty)) return `area:${this.school}-gate`;
    return tx < REALM_W / 2 ? `area:${this.school}-capital` : `area:${this.school}-frontier`;
  }

  /** Safe: villages and capitals (+4 tiles) and 6 tiles round every waystone; everything else is wild. */
  zoneRule(tx: number, ty: number): ZoneRule {
    if (this.inVillage(tx, ty, 4)) return 'safe';
    for (const w of this.waystones) if ((tx - w.at[0]) ** 2 + (ty - w.at[1]) ** 2 <= 36) return 'safe';
    return 'wild';
  }
}

/** A school realm's three waystones (cheap: no generator needed). */
export function realmWaystones(realm: RealmDef, areas: AreaDef[]): WaystoneDef[] {
  const S = realm.school as SchoolId;
  const froArea = areas.find((a) => a.id === `area:${S}-frontier`);
  return [
    { id: `ws:${S}-capital`, name: realm.capital, space: realm.space, region: `area:${S}-capital`, at: [HUB.capital[0] + 15, HUB.capital[1] + 2], startsLit: true },
    { id: `ws:${S}-frontier`, name: froArea?.title ?? 'Frontier', space: realm.space, region: `area:${S}-frontier`, at: [HUB.frontier[0] - 15, HUB.frontier[1] + 2], startsLit: true },
    { id: `ws:${S}-gate`, name: GATE_NAMES[S], space: realm.space, region: `area:${S}-gate`, at: [GATE[0], GATE[1] + 16] },
  ];
}
