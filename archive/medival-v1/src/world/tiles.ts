/** Tile catalogue: ids, collision bits, colours (WORLD.md §4.1–4.2). Pure data; the atlas is drawn by tileset.ts. */
import { Collision } from '@/core';

const { SOLID, WATER, BLOCK_SIGHT, SLOW, HAZARD, NO_SPAWN } = Collision;

export type TileStyle = 'flat' | 'speckle' | 'grass' | 'water' | 'stripes' | 'brick' | 'planks' | 'trunk' | 'canopy'
  | 'rock' | 'bush' | 'roof' | 'stone' | 'cross' | 'fire' | 'door' | 'vein' | 'reeds' | 'flowers' | 'banner';

export interface TileInfo {
  name: string;
  color: number;
  /** Minimap colour; defaults to `color`. */
  mini?: number;
  collision: number;
  style: TileStyle;
}

/** Tile ids are atlas indices. Keep in order; append only. */
export const T = {
  VOID: 0,
  GRASS: 1, GRASS_DARK: 2, HEATH: 3, DIRT: 4, ROAD: 5, MUD: 6, SAND: 7, SNOW: 8,
  ROCK_FLOOR: 9, SHALLOWS: 10, DEEP_WATER: 11, MIRE: 12, STONE_FLOOR: 13, WOOD_FLOOR: 14, FIELD: 15,
  ASH: 16, ICE: 17, BRIDGE: 18, OLD_ROAD: 19, MARSH: 20,
  TREE: 21, PINE: 22, BUSH: 23, ROCK: 24, TOR: 25, WALL_STONE: 26, WALL_WOOD: 27, FENCE: 28,
  BARRICADE: 29, STANDING_STONE: 30, REEDS: 31, DRIFT: 32, DOOR: 33, FLOWERS: 34, LEY_VEIN: 35,
  GRAVE: 36, CAMPFIRE: 37, CANOPY: 38, PINE_CANOPY: 39, ROOF_THATCH: 40, ROOF_SLATE: 41,
  RUBBLE: 42, DEAD_TREE: 43, CHEST: 44, SIGN: 45, LEVER: 46, ALTAR: 47, WAYSTONE: 48, THICKET: 49,
  BANNER_CROWN: 50, BANNER_PROTECTOR: 51, STALL: 52, TENT: 53, BANNER_WICK: 54,
} as const;
export type TileId = (typeof T)[keyof typeof T];

const I: Record<number, TileInfo> = {
  [T.VOID]: { name: 'void', color: 0x0e0b08, collision: SOLID | BLOCK_SIGHT | NO_SPAWN, style: 'flat' },
  [T.GRASS]: { name: 'grass', color: 0x4f6b34, collision: 0, style: 'grass' },
  [T.GRASS_DARK]: { name: 'grass-dark', color: 0x3c5429, collision: 0, style: 'grass' },
  [T.HEATH]: { name: 'heath', color: 0x6a5562, mini: 0x74606a, collision: 0, style: 'flowers' },
  [T.DIRT]: { name: 'dirt', color: 0x7a5f3e, collision: 0, style: 'speckle' },
  [T.ROAD]: { name: 'road', color: 0x9a8461, collision: NO_SPAWN, style: 'speckle' },
  [T.MUD]: { name: 'mud', color: 0x4d3b28, collision: SLOW, style: 'speckle' },
  [T.SAND]: { name: 'sand', color: 0xc9b37e, collision: 0, style: 'speckle' },
  [T.SNOW]: { name: 'snow', color: 0xdfe6ea, collision: 0, style: 'speckle' },
  [T.ROCK_FLOOR]: { name: 'rock-floor', color: 0x6b665c, collision: 0, style: 'stone' },
  [T.SHALLOWS]: { name: 'shallows', color: 0x4f7f8f, collision: SLOW, style: 'water' },
  [T.DEEP_WATER]: { name: 'deep-water', color: 0x24485e, collision: WATER | NO_SPAWN, style: 'water' },
  [T.MIRE]: { name: 'mire', color: 0x14110f, mini: 0x221b22, collision: SLOW | HAZARD | NO_SPAWN, style: 'reeds' },
  [T.STONE_FLOOR]: { name: 'stone-floor', color: 0x56534c, collision: 0, style: 'stone' },
  [T.WOOD_FLOOR]: { name: 'wood-floor', color: 0x6e4f31, collision: NO_SPAWN, style: 'planks' },
  [T.FIELD]: { name: 'field', color: 0x8c7a3f, collision: 0, style: 'stripes' },
  [T.ASH]: { name: 'ash', color: 0x4a4644, collision: 0, style: 'speckle' },
  [T.ICE]: { name: 'ice', color: 0xa8cad8, collision: 0, style: 'flat' },
  [T.BRIDGE]: { name: 'bridge', color: 0x7d5b38, collision: NO_SPAWN, style: 'planks' },
  [T.OLD_ROAD]: { name: 'old-road', color: 0x807a6c, collision: 0, style: 'stone' },
  [T.MARSH]: { name: 'marsh', color: 0x48563a, collision: SLOW, style: 'reeds' },

  [T.TREE]: { name: 'tree', color: 0x4a3420, mini: 0x2c4220, collision: SOLID | BLOCK_SIGHT, style: 'trunk' },
  [T.PINE]: { name: 'pine', color: 0x3f2d1c, mini: 0x22381f, collision: SOLID | BLOCK_SIGHT, style: 'trunk' },
  [T.BUSH]: { name: 'bush', color: 0x37532b, collision: BLOCK_SIGHT | SLOW, style: 'bush' },
  [T.ROCK]: { name: 'rock', color: 0x7c776d, collision: SOLID, style: 'rock' },
  [T.TOR]: { name: 'tor', color: 0x5b574f, mini: 0x4a463f, collision: SOLID | BLOCK_SIGHT | NO_SPAWN, style: 'rock' },
  [T.WALL_STONE]: { name: 'wall-stone', color: 0x77736a, collision: SOLID | BLOCK_SIGHT | NO_SPAWN, style: 'brick' },
  [T.WALL_WOOD]: { name: 'wall-wood', color: 0x6a4a2c, collision: SOLID | BLOCK_SIGHT | NO_SPAWN, style: 'planks' },
  [T.FENCE]: { name: 'fence', color: 0x8a6a44, collision: SOLID, style: 'planks' },
  [T.BARRICADE]: { name: 'barricade', color: 0x5e4026, mini: 0xb04a2a, collision: SOLID | NO_SPAWN, style: 'cross' },
  [T.STANDING_STONE]: { name: 'standing-stone', color: 0x9a968c, collision: SOLID, style: 'stone' },
  [T.REEDS]: { name: 'reeds', color: 0x8a8a5a, collision: BLOCK_SIGHT, style: 'reeds' },
  [T.DRIFT]: { name: 'drift', color: 0xeef2f4, collision: SLOW, style: 'speckle' },
  [T.DOOR]: { name: 'door', color: 0x3a2414, mini: 0xd4a646, collision: NO_SPAWN, style: 'door' },
  [T.FLOWERS]: { name: 'flowers', color: 0xb86a8a, collision: 0, style: 'flowers' },
  [T.LEY_VEIN]: { name: 'ley-vein', color: 0xe07a2a, collision: 0, style: 'vein' },
  [T.GRAVE]: { name: 'grave', color: 0x8d8a82, collision: SOLID, style: 'cross' },
  [T.CAMPFIRE]: { name: 'campfire', color: 0xe08a2a, collision: SOLID | NO_SPAWN, style: 'fire' },
  [T.CANOPY]: { name: 'canopy', color: 0x3d5a2a, collision: 0, style: 'canopy' },
  [T.PINE_CANOPY]: { name: 'pine-canopy', color: 0x2a4426, collision: 0, style: 'canopy' },
  [T.ROOF_THATCH]: { name: 'roof-thatch', color: 0xa88a4a, collision: 0, style: 'roof' },
  [T.ROOF_SLATE]: { name: 'roof-slate', color: 0x4a5058, collision: 0, style: 'roof' },
  [T.RUBBLE]: { name: 'rubble', color: 0x6a655c, collision: SLOW, style: 'rock' },
  [T.DEAD_TREE]: { name: 'dead-tree', color: 0x3a3230, collision: SOLID, style: 'trunk' },
  [T.CHEST]: { name: 'chest', color: 0x8a5a2a, mini: 0xd4a646, collision: SOLID, style: 'planks' },
  [T.SIGN]: { name: 'sign', color: 0x9a7a4a, collision: SOLID, style: 'planks' },
  [T.LEVER]: { name: 'lever', color: 0x6a6a72, collision: SOLID, style: 'cross' },
  [T.ALTAR]: { name: 'altar', color: 0xbab4a4, collision: SOLID, style: 'stone' },
  [T.WAYSTONE]: { name: 'waystone', color: 0x6a8aa8, mini: 0x8ac0e8, collision: SOLID, style: 'vein' },
  [T.THICKET]: { name: 'thicket', color: 0x26361c, mini: 0x1c2a16, collision: SOLID | BLOCK_SIGHT | NO_SPAWN, style: 'bush' },
  [T.BANNER_CROWN]: { name: 'banner-crown', color: 0x2a52a8, mini: 0xd4a646, collision: Collision.SOLID, style: 'banner' },
  [T.BANNER_PROTECTOR]: { name: 'banner-protector', color: 0x9b2c2c, mini: 0xc94545, collision: Collision.SOLID, style: 'banner' },
  [T.STALL]: { name: 'stall', color: 0xb98550, collision: SOLID, style: 'planks' },
  [T.TENT]: { name: 'tent', color: 0x8a7857, collision: SOLID | BLOCK_SIGHT, style: 'roof' },
  [T.BANNER_WICK]: { name: 'banner-wick', color: 0x0e0b08, mini: 0xd4a646, collision: Collision.SOLID, style: 'banner' },
};

export const TILE_COUNT = Object.keys(I).length;

export function tileInfo(id: number): TileInfo {
  return I[id] ?? I[T.VOID];
}

/** Canopy tile drawn above a trunk tile, or -1. */
export function canopyFor(trunk: number): number {
  if (trunk === T.TREE) return T.CANOPY;
  if (trunk === T.PINE) return T.PINE_CANOPY;
  return -1;
}
