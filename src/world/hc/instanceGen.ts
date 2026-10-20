/**
 * Instances (`inst:*`): lairs, barrows, the drowned nave, the citadel. A deterministic snake of rooms joined by
 * corridors in the abbey floor/wall tiles (recoloured per school), lit by sconces and candelabra. Room 1 holds
 * the exit door back to the outdoor door; the last room is the boss room (altar, lair set pieces, a boss
 * trigger the authority spawns from). Pure.
 */
import { CHUNK_TILES, TILE_SIZE, type WorldObject } from '@/core';
import { HC_CAMPAIGN_BOSSES, HC_LAIR1 } from '@/data/enemies/hc/campaign';
import { HC_HAZARDS } from '@/data/enemies/hc/hazards';
import { hash01, hash32 } from './noise';
import { Corner } from './autotile';
import { setPieceArt } from './setPieces';
import type { SpaceGen, ZoneRule } from './space';
import { paletteOf, TileRegistry, type Palette, type PaletteId, type Surface } from './theme';
import type { SetPieceDef } from './types';
import type { Placement } from './village';
import { classGated } from './classGate';

const N = CHUNK_TILES;
const CELL_W = 20, CELL_H = 16, COLS = 4, ROWS = 3;
/** hazard art per kind (Claude 3's HC_HAZARDS `art`) */
const HAZARD_ART: Record<string, string> = { stone: 'f_runestone', vent: 'd_crystal', light: 'd_candelabra', pillar: 'd_pillar', cover: 'd_pew' };
/** bosses whose vents the hero turns against them (F = rewire) */
const TURN_ROOMS = new Set(['cb_volta-sterne', 'cb_konrad', 'cb_seraphine-cold']);

export interface InstanceDef {
  id: string;
  name: string;
  palette: PaletteId;
  /** rooms on the main path (entry … boss); side rooms are added to fill the grid */
  rooms: number;
  /** where the exit door returns to (space + tile) */
  exit: { space: string; at: [number, number] } | null;
  boss?: { creature: string; level: number };
  /** a second boss that wakes once the first is cleared (the Hollow King after the Black Concord) */
  boss2?: { creature: string; level: number };
  /** set pieces that live inside (half-stones, relics) */
  pieces: SetPieceDef[];
  /** drowned interiors get kelp and puddles */
  drowned?: boolean;
  /** the lair's theme text (02-realms.md): picks the layout style and props */
  theme?: string;
  /** pack level when there is no boss (optional caves) */
  level?: number;
  /** a Morvane region's cave: its packs come from that region's creatures */
  region?: string;
  /** a boss-less end room (optional caves): a rare cache `obj:<base>-cache` and a find `obj:<base>-find` */
  finale?: { base: string; name: string };
}

/** Layout style from the theme text: caves are irregular, halls square with pillars, wet lairs get pools. */
export interface LairStyle { cave: boolean; hall: boolean; water: boolean; nest: boolean }
export function lairStyle(theme = '', drowned = false): LairStyle {
  const t = theme.toLowerCase();
  return {
    cave: /cave|hollow|tunnel|burrow|root|mine|quarry|crypt|den|warren|grotto|pit|lode|seam|undercroft|bog|barrow|gully/.test(t),
    hall: /hall|archive|vault|library|cloister|theatre|salle|fort|keep|chapel|temple|tower|palace|house|engine|foundry|works|exchange/.test(t),
    water: drowned || /drown|cistern|bog|sea|tarn|marsh|flood|lake|pool|spring|reef|wreck|ford|sewer|lava|kiln|forge|magma/.test(t),
    nest: /nest|roost|eyrie|aerie|lair of|hive/.test(t),
  };
}

/** The boss of a class lair: lair 1 = the realm mini canon gives this class (HC_LAIR1), lair 2 = its own boss, lair 3 = nemesis I. */
export function lairBoss(school: string, side: 'capital' | 'frontier', n: number, className?: string): { creature: string; level: number } {
  const level = [0, 6, 10, 13][n] ?? 10;
  if (n === 1) return { creature: HC_LAIR1[className?.toLowerCase() ?? ''] ?? `bx_${school}_${side === 'capital' ? 3 : 4}`, level };
  const slot = n === 2 ? 'lair2' : 'nemesis';
  const cb = HC_CAMPAIGN_BOSSES.find((b) => b.classId === className?.toLowerCase() && b.slot === slot);
  return { creature: cb?.id ?? `bx_${school}_5`, level };
}

/**
 * The class lair a boss fights in (quest markers for kill objectives, Claude 4's objectivePlaces): `school`/`side`/
 * `className` of the campaign whose realm side holds the lair (CAMPAIGNS), as spaces.ts builds the lairs. null: not
 * one of that side's lair bosses (Sentinels, gate and Morvane bosses have their own places).
 */
export function bossLair(creature: string, school: string, side: 'capital' | 'frontier', className: string): string | null {
  for (const n of [1, 2, 3]) if (lairBoss(school, side, n, className).creature === creature) return `inst:${school}-${side}-lair-${n}`;
  return null;
}

interface Room { x: number; y: number; w: number; h: number; shape: 'rect' | 'ellipse' | 'cave' }

/** A pack of the lair's creatures in one room: spawned once per visit (side rooms: elite; the heart room: an ambush on entry). */
export interface LairPack { id: string; room: Room; cap: number; elite?: boolean; ambush?: boolean }

export class InstanceGen implements SpaceGen {
  readonly id: string;
  readonly widthTiles: number;
  readonly heightTiles: number;
  readonly registry: TileRegistry;
  readonly rooms: Room[] = [];
  /** dead-end side rooms (chests, codex, elite packs) */
  readonly branches: Room[] = [];
  readonly packs: LairPack[] = [];
  /** the middle room of the main path: its ambush and the story hook `area:<slug>-heart` */
  heart: Room | null = null;
  private palette: Palette;
  private floor: Uint8Array;
  private water: Uint8Array;
  readonly style: LairStyle;
  private fixed = new Map<string, Placement[]>();
  private objs = new Map<string, WorldObject[]>();

  constructor(readonly def: InstanceDef) {
    this.id = def.id;
    this.palette = paletteOf(def.palette);
    this.registry = new TileRegistry([this.palette]);
    const rows = Math.min(ROWS, Math.ceil((def.rooms + 2) / COLS));
    this.widthTiles = COLS * CELL_W + 4;
    this.heightTiles = rows * CELL_H + 4;
    this.floor = new Uint8Array(this.widthTiles * this.heightTiles);
    this.water = new Uint8Array(this.widthTiles * this.heightTiles);
    this.style = lairStyle(def.theme, def.drowned);
    this.carve();
    this.furnish();
  }

  /** the entrance spot (tile) inside room 1 */
  get entrance(): [number, number] { const r = this.rooms[0]; return [r.x + Math.floor(r.w / 2), r.y + r.h - 3]; }
  /** chest loot level (Claude 3 rolls it): the instance's packs, two under its boss */
  get lootLevel(): number { return this.def.level ?? Math.max(1, (this.def.boss?.level ?? 3) - 2); }
  get bossRoom(): Room { return this.rooms[this.rooms.length - 1]; }

  private carve(): void {
    const seed = hash32(this.id.length, this.id.charCodeAt(5) ?? 0, this.id.charCodeAt(this.id.length - 1));
    const cell = (i: number): [number, number] => { const row = Math.floor(i / COLS); return [row % 2 ? COLS - 1 - (i % COLS) : i % COLS, row]; }; // snake
    const n = Math.min(this.def.rooms, COLS * ROWS - 1);
    for (let i = 0; i < n; i++) {
      const [col, row] = cell(i);
      const last = i === n - 1;
      const w = last ? CELL_W - 3 : 9 + Math.floor(hash01(i, seed, 1) * 7), h = last ? CELL_H - 3 : 7 + Math.floor(hash01(seed, i, 2) * 5);
      const x = 2 + col * CELL_W + Math.floor((CELL_W - w) / 2), y = 2 + row * CELL_H + Math.floor((CELL_H - h) / 2);
      // the entry room is plain and safe; the boss room is a round arena; the rest follow the lair's style
      const shape: Room['shape'] = i === 0 ? 'rect' : last ? 'ellipse' : this.style.cave ? 'cave' : this.style.hall ? 'rect' : hash01(i, seed, 3) < 0.5 ? 'rect' : 'ellipse';
      const room: Room = { x, y, w, h, shape };
      this.rooms.push(room);
      this.carveRoom(room, seed + i);
      if (i > 0) this.corridor(this.rooms[i - 1], room);
    }
    // side rooms (up to 3): free grid cells after the main path, each a dead end off a neighbouring main room
    // (above, then beside, then below), never off the entry (safe) room or the boss arena (a side trip must not
    // wake the boss early)
    const rowsUsed = Math.floor((this.heightTiles - 4) / CELL_H);
    const roomAt = (c: number, r: number) => this.rooms.find((x) => Math.floor((x.x - 2) / CELL_W) === c && Math.floor((x.y - 2) / CELL_H) === r);
    for (let i = n; i < COLS * rowsUsed && this.branches.length < 3; i++) {
      const [col, row] = cell(i);
      const above = [[col, row - 1], [col - 1, row], [col + 1, row], [col, row + 1]]
        .map(([c, r]) => (c >= 0 && c < COLS && r >= 0 ? roomAt(c, r) : undefined))
        .find((r) => r && r !== this.rooms[0] && r !== this.rooms[n - 1]);
      if (!above) continue;
      const w = 8 + Math.floor(hash01(i, seed, 4) * 4), h = 6 + Math.floor(hash01(seed, i, 5) * 3);
      const room: Room = { x: 2 + col * CELL_W + Math.floor((CELL_W - w) / 2), y: 2 + row * CELL_H + Math.floor((CELL_H - h) / 2), w, h, shape: this.style.cave ? 'cave' : 'rect' };
      this.branches.push(room);
      this.carveRoom(room, seed + i * 7);
      this.corridor(above, room);
    }
    if (this.style.water) this.rooms.forEach((r, i) => { if (i > 0) this.pools(r, seed + i); });
    // packs: every main room between entry and boss; elites in side rooms; an ambush in the heart room
    this.heart = this.rooms.length > 3 ? this.rooms[Math.floor(this.rooms.length / 2)] : null;
    const slug = this.id.slice(5);
    this.rooms.forEach((r, i) => {
      if (i === 0 || i === this.rooms.length - 1) return;
      const ambush = r === this.heart;
      this.packs.push({ id: `pack:${slug}:${i}`, room: r, cap: ambush ? 5 : 2 + Math.floor(hash01(i, seed, 6) * 2), ambush, elite: ambush });
    });
    this.branches.forEach((r, i) => this.packs.push({ id: `pack:${slug}:side-${i}`, room: r, cap: 2, elite: true }));
  }

  private carveRoom(r: Room, seed: number): void {
    if (r.shape === 'rect') { this.fill(r.x, r.y, r.w, r.h); return; }
    const cx = r.x + (r.w - 1) / 2, cy = r.y + (r.h - 1) / 2;
    for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) {
      const dx = (x - cx) / (r.w / 2), dy = (y - cy) / (r.h / 2);
      // caves: a wobbly edge from a hash per 8 directions
      const a = Math.floor(((Math.atan2(dy, dx) + Math.PI) / (Math.PI * 2)) * 8) % 8;
      const edge = r.shape === 'cave' ? 0.72 + hash01(a, seed, 11) * 0.28 : 1;
      if (dx * dx + dy * dy <= edge * edge) this.floor[y * this.widthTiles + x] = 1;
    }
    // a cross through the centre keeps every shape connected to its corridors
    this.fill(Math.round(cx) - 1, r.y + 1, 3, r.h - 2);
    this.fill(r.x + 1, Math.round(cy) - 1, r.w - 2, 3);
  }

  /** one or two pools in a room's corners, never on the centre cross (the way through stays dry) */
  private pools(r: Room, seed: number): void {
    const cx = r.x + (r.w >> 1), cy = r.y + (r.h >> 1);
    const n = 1 + Math.floor(hash01(seed, r.x, 21) * 2);
    for (let k = 0; k < n; k++) {
      const qx = hash01(seed, k, 22) < 0.5 ? -1 : 1, qy = hash01(k, seed, 23) < 0.5 ? -1 : 1;
      const px = cx + qx * Math.max(3, (r.w >> 2) + 1), py = cy + qy * Math.max(3, (r.h >> 2) + 1), rad = 1.4 + hash01(seed, k, 24);
      for (let y = Math.floor(py - rad); y <= py + rad; y++) for (let x = Math.floor(px - rad); x <= px + rad; x++) {
        if (Math.hypot(x - px, y - py) > rad || Math.abs(x - cx) <= 2 || Math.abs(y - cy) <= 2) continue;
        if (this.isFloor(x, y) && this.isFloor(x - 1, y) && this.isFloor(x + 1, y) && this.isFloor(x, y - 1) && this.isFloor(x, y + 1)) this.water[y * this.widthTiles + x] = 1;
      }
    }
  }

  private fill(x: number, y: number, w: number, h: number): void {
    for (let ty = y; ty < y + h; ty++) for (let tx = x; tx < x + w; tx++) this.floor[ty * this.widthTiles + tx] = 1;
  }

  /** an L-shaped 3-wide corridor between room centres */
  private corridor(a: Room, b: Room): void {
    const ax = a.x + (a.w >> 1), ay = a.y + (a.h >> 1), bx = b.x + (b.w >> 1), by = b.y + (b.h >> 1);
    this.fill(Math.min(ax, bx) - 1, ay - 1, Math.abs(bx - ax) + 3, 3);
    this.fill(bx - 1, Math.min(ay, by) - 1, 3, Math.abs(by - ay) + 3);
  }

  /** tiles already holding a prop or a usable object */
  private held = new Set<number>();

  /**
   * The nearest tile to `want` inside room `r` where a prop can stand with a usable tile in front of it (both dry
   * floor, neither taken), off the room's centre cross (corridors run through it). Shaped rooms have rock corners.
   */
  private spotIn(r: Room, want: [number, number], front = true): [number, number] {
    const cx = r.x + (r.w >> 1), cy = r.y + (r.h >> 1), W = this.widthTiles;
    const ok = (x: number, y: number) => this.isFloor(x, y) && !this.water[y * W + x] && !this.held.has(y * W + x);
    let best: [number, number] = want, bd = Infinity;
    for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) {
      if (Math.abs(x - cx) <= 1 || Math.abs(y - cy) <= 1) continue;
      if (!ok(x, y) || (front && !ok(x, y + 1))) continue;
      const d = (x - want[0]) ** 2 + (y - want[1]) ** 2;
      if (d < bd) { bd = d; best = [x, y]; }
    }
    this.held.add(best[1] * W + best[0]);
    if (front) this.held.add((best[1] + 1) * W + best[0]);
    return best;
  }

  private isFloor(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.widthTiles && y < this.heightTiles && this.floor[y * this.widthTiles + x] === 1;
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

  private art(tx: number, ty: number, art: string, key: string): void {
    this.put({ art, x: tx * TILE_SIZE + 16, y: ty * TILE_SIZE + 28, key });
  }

  private furnish(): void {
    const d = this.def, school = d.palette.startsWith('rc:') ? d.palette.slice(3) : null;
    const rc = (a: string) => (school ? `rc:${school}:${a}` : a);
    this.rooms.forEach((r, i) => {
      // sconces on the top wall, pillars in big rooms, bones and kelp about
      for (let x = r.x + 2; x < r.x + r.w - 1; x += 4) this.art(x, r.y, 'd_sconce', `sc${i},${x}`);
      if (r.shape === 'rect' && r.w >= 12 && r.h >= 9) for (const [dx, dy] of [[2, 2], [r.w - 3, 2], [2, r.h - 3], [r.w - 3, r.h - 3]]) this.art(r.x + dx, r.y + dy, rc('d_pillar'), `pl${i},${dx},${dy}`);
      // a few props in the room's style, along the bottom wall (clear of the centre cross)
      const kit = this.style.water ? ['d_kelp', 'd_bones'] : this.style.nest ? ['f_log', 'v_haystack', 'd_bones'] : this.style.cave ? ['f_mushrooms', 'f_stump', rc('d_crystal')] : this.style.hall ? ['d_pew', 'd_candelabra'] : ['d_bones'];
      for (let k = 0; k < 2; k++) {
        if (hash01(i, r.x + k, 7) > 0.7) continue;
        const x = r.x + 1 + Math.floor(hash01(r.y, i + k * 7, 8) * (r.w - 2)), y = r.y + r.h - 2;
        if (Math.abs(x - (r.x + (r.w >> 1))) > 1 && this.isFloor(x, y) && !this.water[y * this.widthTiles + x]) this.art(x, y, kit[(i + k) % kit.length], `kit${i},${k}`);
      }
      if (i > 0 && i < this.rooms.length - 1 && hash01(i, r.w, 9) < 0.45) {
        const at = this.spotIn(r, [r.x + r.w - 2, r.y + 1]);
        this.art(at[0], at[1], 'd_chest', `ch${i}`);
        this.obj({ id: `obj:${d.id.slice(5)}-chest-${i}`, kind: 'chest', at: [at[0], at[1] + 1], props: { name: 'Chest', label: 'Open', level: this.lootLevel, rarity: 'common' } });
      }
    });
    // side rooms: a chest each, the first one a codex find (Claude 4: dialogue:obj-<slug>-codex)
    this.branches.forEach((r, i) => {
      const [cx, cy] = this.spotIn(r, [r.x + (r.w >> 1), r.y + 1]);
      this.art(cx, cy, i === 0 ? 'd_chest_rare' : 'd_chest', `side-ch${i}`);
      this.obj({ id: `obj:${d.id.slice(5)}-side-${i + 1}`, kind: 'chest', at: [cx, cy + 1], props: { name: 'Chest', label: 'Open', level: this.lootLevel, rarity: i === 0 ? 'rare' : 'common' } });
      if (i === 0) {
        const [kx, ky] = this.spotIn(r, [r.x + 1, r.y + r.h - 2]);
        this.art(kx, ky, 'f_runestone', 'codex');
        this.obj({ id: `obj:${d.id.slice(5)}-codex`, kind: 'interactable', at: [kx, ky + 1], props: { name: 'Old writing', label: 'Read' } });
      }
    });
    // room 1: the way out
    const [ex, ey] = this.entrance;
    this.art(ex, ey + 2, rc('d_arch'), 'exit-arch');
    if (d.exit) {
      this.obj({ id: `obj:${d.id.slice(5)}-exit`, kind: 'door', at: [ex, ey + 1],
        props: { target: `space:${d.exit.space}`, x: d.exit.at[0], y: d.exit.at[1], name: 'The way out', label: 'Leave' } });
    }
    // the boss room: altar, candelabra, set pieces, and the boss trigger
    const b = this.bossRoom, cx = b.x + (b.w >> 1), cy = b.y + 3;
    if (d.finale) {
      // an optional cave's end: what it was hiding, no altar
      const [ax, ay] = this.spotIn(b, [cx - 2, cy]), [fx, fy] = this.spotIn(b, [cx + 4, cy + 2]);
      this.art(ax, ay, 'd_chest_rare', 'cache');
      this.obj({ id: `obj:${d.finale.base}-cache`, kind: 'chest', at: [ax, ay + 1], props: { name: 'Chest', label: 'Open', level: this.lootLevel, rarity: 'rare' } });
      this.art(fx, fy, 'f_runestone', 'find');
      this.obj({ id: `obj:${d.finale.base}-find`, kind: 'interactable', at: [fx, fy + 1], props: { name: d.finale.name, label: 'Search' } });
      return;
    }
    this.art(cx, cy, rc('d_altar'), 'altar');
    this.art(cx - 3, cy, 'd_candelabra', 'cand-l');
    this.art(cx + 3, cy, 'd_candelabra', 'cand-r');
    // pieces noted "rooms" (trapped archivists, a trail of clues): one per main room on the way in
    const inRooms = d.pieces.filter((p) => /\brooms\b/.test(p.note));
    inRooms.forEach((p, i) => {
      // spread evenly from the first room after the entry to the last before the boss (the last piece by its door)
      const span = Math.max(0, this.rooms.length - 3), k = inRooms.length;
      const r = this.rooms[1 + (k > 1 ? Math.round((i * span) / (k - 1)) : 0)];
      const at = this.spotIn(r, [r.x + 2 + (i * 2) % Math.max(1, r.w - 4), r.y + 1], false);
      const name = p.id.replace(/^[a-z]+:/, '').replace(/-\d+$/, '').replace(/-/g, ' ');
      this.obj({ id: p.id, kind: 'interactable', at, props: { name, label: 'Examine' } });
    });
    d.pieces.filter((p) => !inRooms.includes(p)).forEach((p, i) => {
      const at: [number, number] = i === 0 ? [cx, cy + 1] : [b.x + 2 + ((i * 3) % (b.w - 4)), b.y + b.h - 3];
      if (i > 0) this.art(at[0], at[1] - 1, setPieceArt(p.id, school ?? 'umbral'), p.id);
      const name = p.id.replace(/^[a-z]+:/, '').replace(/-/g, ' ');
      if (p.id.startsWith('landmark:')) this.obj({ id: p.id, kind: 'trigger', at: [at[0] - 1, at[1] - 1], size: [3, 3], props: { name, landmark: true } });
      else this.obj({ id: p.id, kind: 'interactable', at, props: { name, label: /halfstone/.test(p.id) ? 'Take the half-stone' : 'Examine' } });
    });
    this.hazards(b);
    if (d.boss) {
      this.obj({ id: `boss:${d.id.slice(5)}`, kind: 'trigger', at: [b.x, b.y], size: [b.w, b.h],
        props: { boss: d.boss.creature, level: d.boss.level, x: cx, y: cy + 4 } });
    }
    if (d.boss && d.boss2) {
      this.obj({ id: `boss:${d.id.slice(5)}-2`, kind: 'trigger', at: [b.x, b.y], size: [b.w, b.h],
        props: { boss: d.boss2.creature, level: d.boss2.level, x: cx, y: cy + 2, after: `boss:${d.id.slice(5)}` } });
    }
  }

  /** Claude 3's arena hazards (HC_HAZARDS by boss): evenly on a ring at ~60% of the arena, never on the entry line. */
  private hazards(b: Room): void {
    const boss = this.def.boss?.creature;
    const list = boss ? HC_HAZARDS[boss] : undefined;
    if (!list) return;
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    const prev = this.rooms[this.rooms.length - 2];
    const entry = prev ? Math.atan2(prev.y + prev.h / 2 - cy, prev.x + prev.w / 2 - cx) : Math.PI / 2;
    const total = list.reduce((n, h) => n + h.count, 0);
    let k = 0;
    for (const h of list) for (let i = 0; i < h.count; i++, k++) {
      // spread over the circle, skipping a 60° wedge facing the way in
      const a = entry + Math.PI / 6 + ((k + 0.5) / total) * (Math.PI * 2 - Math.PI / 3);
      const tx = Math.round(cx + Math.cos(a) * b.w * 0.3), ty = Math.round(cy + Math.sin(a) * b.h * 0.3);
      this.art(tx, ty, HAZARD_ART[h.art] ?? 'f_runestone', `hz${k}`);
      const label = h.kind === 'vent' ? (TURN_ROOMS.has(boss!) ? 'Rewire' : 'Douse') : h.kind === 'pillar' ? 'Break' : h.kind === 'light' ? 'Light' : h.kind === 'anchor' ? 'Brace' : 'Use';
      this.obj({ id: `hz:${this.id.slice(5)}:${k + 1}`, kind: 'interactable', at: [tx, ty + 1],
        props: { name: label, label, hazard: h.kind, r: h.r ?? 40, ...(h.charges !== undefined ? { charges: h.charges } : {}) } });
    }
  }

  cornerAt(x: number, y: number): number {
    // a corner is floor when the tile it centres is floor (half-tile offset, as everywhere)
    if (this.water[y * this.widthTiles + x]) return Corner.WATER;
    return this.isFloor(x, y) ? Corner.FLOOR : Corner.WALL;
  }

  paletteAt(): Palette { return this.palette; }
  /** wall faces where the floor is just below (a visual tile spans down to the next row), dark tops elsewhere */
  surfaceAt(tx: number, ty: number): Surface { return this.isFloor(tx, ty) ? 'floor' : this.isFloor(tx, ty + 1) || this.isFloor(tx + 1, ty + 1) ? 'wall' : 'walltop'; }
  placements(cx: number, cy: number): Placement[] { return this.fixed.get(`${cx},${cy}`) ?? []; }
  objects(cx: number, cy: number): WorldObject[] { return this.objs.get(`${cx},${cy}`) ?? []; }
  regionAt(tx: number, ty: number): string {
    const r = this.heart;
    return r && tx >= r.x && ty >= r.y && tx < r.x + r.w && ty < r.y + r.h ? `area:${this.id.slice(5)}-heart` : this.id;
  }

  zoneRule(tx: number, ty: number): ZoneRule {
    const r = this.rooms[0];
    return tx >= r.x && ty >= r.y && tx < r.x + r.w && ty < r.y + r.h ? 'safe' : 'wild';
  }
}
