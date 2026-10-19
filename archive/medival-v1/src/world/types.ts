/** World-internal data shapes (WORLD.md §2.2, §3.4, §3.7). Shared world contracts live in src/core/types.ts. */
import type { BiomeId, FlagCond, LandmarkDef, SpawnZone, Tier, WorldObject } from '@/core';

export type LayerName = 'ground' | 'detail' | 'deco' | 'overhead';
export const LAYERS: readonly LayerName[] = ['ground', 'detail', 'deco', 'overhead'];

/** 64×48 region grid, authored at cell resolution (cellChunks × cellChunks chunks per character). */
export interface WorldLayoutDef {
  id: `layout:${string}`;
  cellChunks: number;
  /** One string per row; each character is a RegionDef.layoutCode, '~' = open sea. */
  cells: string[];
}

export interface RouteDef {
  id: `route:${string}`;
  kind: 'road' | 'old-road' | 'track' | 'river' | 'stream' | 'ley';
  width: number;
  points: [number, number][];
  when?: FlagCond;
}

/**
 * Paint operations for authoring overlays in TypeScript (`encoding: 'ops'`).
 * Coordinates are relative to the overlay origin, in tiles. Ops with `soft: true` (and every scatter)
 * never paint over roads, bridges or water laid by routes.
 */
export type OverlayOp = (
  | { op: 'fill'; layer: LayerName; rect: [number, number, number, number]; tile: number }
  | { op: 'ellipse'; layer: LayerName; rect: [number, number, number, number]; tile: number }
  | { op: 'line'; layer: LayerName; points: [number, number][]; width: number; tile: number }
  /** Jagged border band of `tile` around the overlay rect, except at gaps (side + centre offset + width). */
  | { op: 'frame'; layer: LayerName; thickness: number; jitter: number; tile: number;
      gaps?: { side: 'n' | 's' | 'e' | 'w'; at: number; width: number }[] }
  /** Walled building with floor, roof (overhead) and a door gap on the south wall. */
  | { op: 'building'; rect: [number, number, number, number]; wall: number; floor: number; roof: number; doorAt: number }
  /** Seeded decoration scatter inside rect (trees add a canopy above the trunk). */
  | { op: 'scatter'; rect: [number, number, number, number]; tiles: number[]; density: number; seed: number; ellipse?: boolean }
  | { op: 'collide'; rect: [number, number, number, number]; bits: number }
  /** Clear a layer in rect (sets tiles back to "empty"). */
  | { op: 'clear'; layer: LayerName; rect: [number, number, number, number] }
) & { soft?: boolean };

export interface OverlayVariant { when: FlagCond; ops: OverlayOp[]; objects?: WorldObject[] }

export interface OverlayDef {
  id: `overlay:${string}`;
  origin: [number, number];
  size: [number, number];
  encoding: 'ops';
  /** Remove procedural deco/overhead under the overlay before stamping. */
  noScatter?: boolean;
  ops: OverlayOp[];
  /** Object positions are overlay-relative. */
  objects?: WorldObject[];
  variants?: OverlayVariant[];
}

export interface InstanceFloor {
  id: string;
  overlay: `overlay:${string}`;
  spawnZones: SpawnZone[];
  landmarks?: LandmarkDef[];
  entrances: Record<string, [number, number]>;
}

export interface InstanceDef {
  id: `instance:${string}`;
  kind: 'interior' | 'dungeon';
  name: string;
  tier: Tier;
  biome: BiomeId;
  floors: InstanceFloor[];
  /** Overworld tile the player returns to. */
  exit: [number, number];
}

/** Fully built chunk (WORLD.md §3.5). Arrays are CHUNK_TILES² long; -1 = empty. */
export interface ChunkData {
  cx: number;
  cy: number;
  region: string;
  ground: Int16Array;
  detail: Int16Array;
  deco: Int16Array;
  overhead: Int16Array;
  collision: Uint8Array;
  /** Objects whose `at` (absolute tiles) falls in this chunk, filtered by current flags. */
  objects: WorldObject[];
  /** Per-tile minimap colour (0xRRGGBB). */
  mini: Uint32Array;
}
