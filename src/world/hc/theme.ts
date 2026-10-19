/**
 * Tile themes and the deterministic tile registry. A theme names the art frames for each surface; a recoloured
 * frame is named `rc:<school>:<base frame>` and baked at runtime by the renderer from the base frame.
 * Every client builds the same registry from the same theme list, so tile indices never go over the network.
 */
import { Corner } from './autotile';
import type { SchoolId } from './types';

export type Surface = 'grass' | 'flowers' | 'cobble' | 'farm' | 'crops' | 'wheat' | 'floor' | 'wall' | 'walltop' | 'bridge';

export interface Palette {
  /** frame names per surface (variants picked by hash) */
  surfaces: Record<Surface, string[]>;
  /** 16-frame corner autotiles; frame = prefix + mask */
  path: string;
  water: string;
  /** minimap colours */
  mini: { ground: number; path: number; water: number; floor: number; wall: number; cliff: number };
}

const VILLAGE: Palette = {
  surfaces: {
    grass: ['v_grass_0', 'v_grass_1', 'v_grass_2', 'v_grass_3'],
    flowers: ['v_flowers_0', 'v_flowers_1'],
    cobble: ['v_cobble_0', 'v_cobble_1'],
    farm: ['v_farmland'], crops: ['v_crops'], wheat: ['v_wheat'],
    floor: ['d_floor_a', 'd_floor_b'],
    wall: ['d_wall', 'd_wall_moss', 'd_wall_crack'],
    // solid wall mass seen from above (interiors); faces use `wall`
    walltop: ['d_wall_top'],
    bridge: ['v_bridge'],
  },
  path: 'v_path_',
  water: 'v_water_',
  mini: { ground: 0x5ccc55, path: 0xd4c8a8, water: 0x2a96d8, floor: 0x3a6585, wall: 0x4b3c82, cliff: 0x8a82a0 },
};

const FOREST: Palette = {
  ...VILLAGE,
  surfaces: { ...VILLAGE.surfaces, grass: ['f_floor_0', 'f_floor_1', 'f_leaves', 'f_roots'], flowers: ['f_leaves'] },
  path: 'f_path_',
  mini: { ...VILLAGE.mini, ground: 0x25806a, path: 0x5a4a3a },
};

/** Palette ids: base 'village' | 'forest', or `rc:<school>` (village art recoloured to a realm). */
export type PaletteId = 'village' | 'forest' | `rc:${SchoolId}`;

function recolored(school: SchoolId, mini: Palette['mini']): Palette {
  const rc = (n: string) => `rc:${school}:${n}`;
  const map = (xs: string[]) => xs.map(rc);
  const s = VILLAGE.surfaces;
  return {
    surfaces: {
      grass: map(s.grass), flowers: map(s.flowers), cobble: map(s.cobble), farm: map(s.farm), crops: map(s.crops),
      wheat: map(s.wheat), floor: map(s.floor), wall: map(s.wall), walltop: map(s.walltop), bridge: map(s.bridge),
    },
    path: rc('v_path_'),
    water: rc('v_water_'),
    mini,
  };
}

/**
 * Palette by id. Realm minimap colours come from the realm palette (passed in, since this module is data-free);
 * the defaults are the village ones.
 */
export function paletteOf(id: PaletteId, mini?: Partial<Palette['mini']>): Palette {
  if (id === 'village') return VILLAGE;
  if (id === 'forest') return FOREST;
  return recolored(id.slice(3) as SchoolId, { ...VILLAGE.mini, ...mini });
}

/** All frame names a palette can emit, in a fixed order. */
export function paletteFrames(p: Palette): string[] {
  const out: string[] = [];
  for (const k of Object.keys(p.surfaces).sort() as Surface[]) out.push(...p.surfaces[k]);
  for (let m = 0; m < 16; m++) out.push(p.path + m, p.water + m);
  return out;
}

/**
 * Tile registry for a space: index → frame name. Index 0 is reserved for "void" (outside the map).
 * Built from an ordered palette list, so it is identical on every client.
 */
export class TileRegistry {
  readonly names: string[] = ['void'];
  private index = new Map<string, number>([['void', 0]]);

  constructor(readonly palettes: Palette[]) {
    for (const p of palettes) for (const n of paletteFrames(p)) this.add(n);
  }

  add(name: string): number {
    let i = this.index.get(name);
    if (i === undefined) { i = this.names.length; this.names.push(name); this.index.set(name, i); }
    return i;
  }

  id(name: string): number {
    const i = this.index.get(name);
    if (i === undefined) throw new Error(`[world] tile "${name}" not in registry`);
    return i;
  }
}

/** Minimap colour class per corner class (renderer maps to palette.mini). */
export const CORNER_MINI: Record<number, keyof Palette['mini']> = {
  [Corner.GROUND]: 'ground', [Corner.PATH]: 'path', [Corner.WATER]: 'water',
  [Corner.CLIFF]: 'cliff', [Corner.FLOOR]: 'floor', [Corner.WALL]: 'wall',
};
