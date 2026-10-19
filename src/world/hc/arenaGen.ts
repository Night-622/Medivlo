/**
 * Arena spaces for arena public realms (`arena:<id>`): a small walled ground with a paved fighting ring
 * (zoneRule 'arena') and stands around it ('safe'). First: arena:stone-court, the old embassy square of
 * Brindlecross where the twelve bearers meet. Pure.
 */
import { CHUNK_TILES, TILE_SIZE, type WorldObject } from '@/core';
import { hash01 } from './noise';
import { Corner } from './autotile';
import type { SpaceGen, ZoneRule } from './space';
import { paletteOf, TileRegistry, type Palette, type Surface } from './theme';
import type { WaystoneDef } from './types';
import type { Placement } from './village';

const N = CHUNK_TILES;

export interface ArenaDef { id: `arena:${string}`; name: string; w: number; h: number; ring: number }

export const ARENAS: ArenaDef[] = [
  { id: 'arena:stone-court', name: 'The Stone Court', w: 64, h: 48, ring: 13 },
];

export class ArenaGen implements SpaceGen {
  readonly id: string;
  readonly widthTiles: number;
  readonly heightTiles: number;
  readonly registry: TileRegistry;
  readonly waystones: WaystoneDef[];
  private palette: Palette = paletteOf('village');
  private cx: number;
  private cy: number;
  private fixed = new Map<string, Placement[]>();
  private objs = new Map<string, WorldObject[]>();

  constructor(readonly def: ArenaDef) {
    this.id = def.id;
    this.widthTiles = def.w;
    this.heightTiles = def.h;
    this.registry = new TileRegistry([this.palette]);
    this.cx = Math.floor(def.w / 2);
    this.cy = Math.floor(def.h / 2);
    this.waystones = [{ id: `ws:${def.id.slice(6)}`, name: def.name, space: def.id, region: def.id, at: [this.cx, this.cy + def.ring + 6], startsLit: true }];
    this.placeFixed();
  }

  /** distance from the ring centre in ring radii (y squashed so the ring reads as a circle on screen) */
  private ringDist(x: number, y: number): number { return Math.hypot(x - this.cx, (y - this.cy) * 1.3) / this.def.ring; }

  private put(p: Placement): void {
    const k = `${Math.floor(p.x / TILE_SIZE / N)},${Math.floor((p.y - 1) / TILE_SIZE / N)}`;
    if (!this.fixed.has(k)) this.fixed.set(k, []);
    this.fixed.get(k)!.push(p);
  }

  private obj(o: WorldObject): void {
    const k = `${Math.floor(o.at[0] / N)},${Math.floor(o.at[1] / N)}`;
    if (!this.objs.has(k)) this.objs.set(k, []);
    this.objs.get(k)!.push(o);
  }

  private placeFixed(): void {
    const R = this.def.ring;
    // twelve standing stones round the ring, lamps on the stands, benches facing in
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const x = this.cx + Math.cos(a) * (R + 1.5), y = this.cy + (Math.sin(a) * (R + 1.5)) / 1.3;
      this.put({ art: 'f_runestone', x: x * TILE_SIZE + 16, y: y * TILE_SIZE + 28, key: `stone${i}` });
      const lx = this.cx + Math.cos(a + 0.26) * (R + 5), ly = this.cy + (Math.sin(a + 0.26) * (R + 5)) / 1.3;
      this.put({ art: i % 2 ? 'v_bench' : 'v_lamp', x: lx * TILE_SIZE + 16, y: ly * TILE_SIZE + 28, key: `stand${i}` });
    }
    for (const w of this.waystones) {
      this.put({ art: 'v_waystone', x: w.at[0] * TILE_SIZE + 16, y: w.at[1] * TILE_SIZE + 28, key: w.id });
      this.obj({ id: w.id, kind: 'waystone', at: w.at, props: { name: w.name, label: 'Wake' } });
    }
    this.obj({ id: `landmark:${this.def.id.slice(6)}`, kind: 'trigger', at: [this.cx - R, this.cy - R], size: [R * 2 + 1, R * 2 + 1], props: { name: this.def.name, landmark: true } });
  }

  cornerAt(x: number, y: number): number {
    if (x <= 1 || y <= 1 || x >= this.widthTiles - 1 || y >= this.heightTiles - 1) return Corner.WALL;
    return this.ringDist(x, y) <= 1 ? Corner.FLOOR : Corner.GROUND;
  }

  paletteAt(): Palette { return this.palette; }

  surfaceAt(tx: number, ty: number): Surface {
    const d = this.ringDist(tx, ty);
    if (d <= 1.15) return 'cobble';
    return hash01(tx, ty, 3) < 0.15 ? 'flowers' : 'grass';
  }

  placements(cx: number, cy: number): Placement[] { return this.fixed.get(`${cx},${cy}`) ?? []; }
  objects(cx: number, cy: number): WorldObject[] { return this.objs.get(`${cx},${cy}`) ?? []; }
  regionAt(): string { return this.def.id; }

  /** The paved ring is the arena; the stands around it are safe. */
  zoneRule(tx: number, ty: number): ZoneRule { return this.ringDist(tx, ty) <= 1 ? 'arena' : 'safe'; }
}
