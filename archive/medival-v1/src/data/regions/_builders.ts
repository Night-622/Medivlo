/** Shared builders for region data (no default export: not a registry def). */
import type { FlagCond, LandmarkDef, SpawnZone, Tier, WorldObject } from '@/core';
import { T } from '@/world/tiles';
import type { InstanceDef, OverlayDef, OverlayOp } from '@/world/types';

export interface InteriorOpts {
  floor?: number;
  wall?: number;
  tier?: Tier;
  ops?: OverlayOp[];
  objects?: WorldObject[];
  variants?: OverlayDef['variants'];
  landmarks?: LandmarkDef[];
  spawnZones?: SpawnZone[];
  kind?: InstanceDef['kind'];
}

/** A one-room interior: floor, walls, an exit door centred on the south wall, plus furnishings. */
export function interior(key: string, name: string, w: number, h: number, exit: [number, number], opts: InteriorOpts = {}): [OverlayDef, InstanceDef] {
  const cx = Math.floor(w / 2);
  const overlay: OverlayDef = {
    id: `overlay:${key}`,
    origin: [0, 0],
    size: [w, h],
    encoding: 'ops',
    ops: [
      { op: 'fill', layer: 'ground', rect: [1, 1, w - 2, h - 2], tile: opts.floor ?? T.WOOD_FLOOR },
      { op: 'frame', layer: 'deco', thickness: 1, jitter: 0, tile: opts.wall ?? T.WALL_WOOD },
      { op: 'collide', rect: [0, 0, w, h], bits: 64 },
      { op: 'fill', layer: 'deco', rect: [cx, h - 1, 1, 1], tile: T.DOOR },
      ...(opts.ops ?? []),
    ],
    objects: [{ id: `obj:${key}-exit`, kind: 'door', at: [cx, h - 2], props: { target: 'overworld', label: 'Leave' } }, ...(opts.objects ?? [])],
    variants: opts.variants,
  };
  const inst: InstanceDef = {
    id: `instance:${key}`, kind: opts.kind ?? 'interior', name, tier: opts.tier ?? 1, biome: 'interior', exit,
    floors: [{ id: 'f1', overlay: overlay.id, entrances: { main: [cx, h - 3] }, spawnZones: opts.spawnZones ?? [], landmarks: opts.landmarks }],
  };
  return [overlay, inst];
}

/** A row of tables / pews / counters. */
export const table = (x: number, y: number, w = 2): OverlayOp => ({ op: 'fill', layer: 'deco', rect: [x, y, w, 1], tile: T.FENCE });

export const lm = (id: string, name: string, at: [number, number], icon: LandmarkDef['icon'], discoverRadius = 6): LandmarkDef =>
  ({ id: `landmark:${id}`, name, at, icon, discoverRadius });

export const anchor = (landmark: string, at: [number, number], when?: FlagCond): WorldObject =>
  ({ id: `npc-anchor:${landmark}`, kind: 'npc-anchor', at, when, props: { landmark: `landmark:${landmark}` } });

export const door = (id: string, at: [number, number], target: string, name: string, extra: Record<string, string> = {}): WorldObject =>
  ({ id, kind: 'door', at, props: { target, entrance: 'main', name, ...extra } });

export const book = (key: string, at: [number, number], name: string, when?: FlagCond): WorldObject =>
  ({ id: `obj:book-${key}`, kind: 'lore', at, when, props: { lore: `lore:book-${key}`, name, label: 'Read' } });

/** Rest point (emits world:rest). */
export const fire = (id: string, at: [number, number], name = 'Campfire', when?: FlagCond): WorldObject =>
  ({ id, kind: 'interactable', at, when, props: { name, rest: true } });

/** Waystone (WORLD.md §2.4): touch to unlock, then fast-travel to it from the world map. */
export const waystone = (key: string, at: [number, number], name: string, when?: FlagCond): WorldObject =>
  ({ id: `obj:waystone-${key}`, kind: 'waystone', at, when, props: { name, label: 'Touch' } });
