/**
 * Kingsvale set pieces outside Haldren (Claude 4: 10-act1-spec): the refugee camp, Cinderhold on its crag
 * (rekindled when `act1.cinderhold_restored`) and the Aelthi arch at the Thornwall. Overlay-local coords.
 */
import { T } from '@/world/tiles';
import type { OverlayDef } from '@/world/types';
import { anchor, book, door, fire, waystone } from '../_builders';

const RESTORED = { flag: 'act1.cinderhold_restored' };

const refugeeCamp: OverlayDef = {
  id: 'overlay:refugee-camp',
  origin: [806, 744],
  size: [24, 18],
  encoding: 'ops',
  noScatter: true,
  ops: [
    { op: 'ellipse', layer: 'ground', rect: [0, 0, 24, 18], tile: T.MUD, soft: true },
    ...([[2, 3], [8, 2], [15, 3], [3, 10], [16, 11]] as const).map(([x, y]) => ({ op: 'fill' as const, layer: 'deco' as const, rect: [x, y, 3, 2] as [number, number, number, number], tile: T.TENT })),
    { op: 'scatter', rect: [1, 1, 22, 16], tiles: [T.RUBBLE, T.FENCE], density: 0.03, seed: 81 },
  ],
  objects: [
    fire('obj:refugee-campfire', [11, 9]),
    anchor('refugee-camp', [9, 11]),
  ],
};

const cinderhold: OverlayDef = {
  id: 'overlay:cinderhold-crag',
  origin: [1046, 652],
  size: [36, 32],
  encoding: 'ops',
  noScatter: true,
  ops: [
    { op: 'ellipse', layer: 'deco', rect: [0, 0, 36, 32], tile: T.TOR },
    { op: 'ellipse', layer: 'deco', rect: [4, 4, 28, 24], tile: -1 },
    { op: 'ellipse', layer: 'ground', rect: [4, 4, 28, 24], tile: T.ROCK_FLOOR },
    { op: 'fill', layer: 'deco', rect: [16, 26, 4, 6], tile: -1 },
    { op: 'fill', layer: 'ground', rect: [16, 26, 4, 6], tile: T.OLD_ROAD },
    { op: 'building', rect: [10, 6, 16, 12], wall: T.WALL_STONE, floor: T.STONE_FLOOR, roof: -1, doorAt: 8 },
    { op: 'scatter', rect: [5, 5, 26, 22], tiles: [T.RUBBLE, T.ASH], density: 0.07, seed: 82 },
  ],
  objects: [door('obj:cinderhold-door', [18, 17], 'instance:cinderhold', 'Cinderhold')],
  variants: [{
    when: RESTORED,
    ops: [{ op: 'ellipse', layer: 'detail', rect: [12, 18, 12, 8], tile: T.LEY_VEIN }, { op: 'fill', layer: 'deco', rect: [12, 19, 1, 1], tile: T.BANNER_CROWN }],
    objects: [fire('obj:cinderhold-watchfire', [20, 21], 'Watchfire'), waystone('cinderhold', [15, 22], 'Cinderhold')],
  }],
};

/** The Aelthi arch where the King's woods meet the Thornwall (the hedge itself is the Ylwen region gate). */
const thornwall: OverlayDef = {
  id: 'overlay:thornwall',
  origin: [642, 752],
  size: [14, 16],
  encoding: 'ops',
  noScatter: true,
  ops: [
    { op: 'ellipse', layer: 'ground', rect: [0, 0, 14, 16], tile: T.GRASS_DARK, soft: true },
    { op: 'fill', layer: 'deco', rect: [1, 4, 1, 1], tile: T.STANDING_STONE },
    { op: 'fill', layer: 'deco', rect: [1, 10, 1, 1], tile: T.STANDING_STONE },
    { op: 'fill', layer: 'detail', rect: [1, 5, 1, 5], tile: T.LEY_VEIN },
  ],
  objects: [fire('obj:cadocs-fire', [8, 8], "Cadoc's fire"), anchor('thornwall', [6, 7]), book('lament-for-ys', [10, 4], 'Lament for Ys')],
};

export default [refugeeCamp, cinderhold, thornwall];
