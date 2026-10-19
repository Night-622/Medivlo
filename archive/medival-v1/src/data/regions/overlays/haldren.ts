/**
 * Haldren, royal capital of the Haldmarch (Claude 4: 09-regions, 10-act1-spec). Walled city, overlay-local coords;
 * origin (800, 676), 64×56. Gates: north (King’s Way to Dun Korrath), west (King’s Way to Brackhaven),
 * south (Pilgrim’s Road to Aldermoor). Banners follow `act1.ruler`: crown (unset or aldith), harrow, or wick.
 */
import type { FlagCond } from '@/core';
import { T } from '@/world/tiles';
import type { OverlayDef, OverlayOp } from '@/world/types';
import { anchor, door, waystone } from '../_builders';

export const HALDREN: [number, number] = [800, 676];
const H = (x: number, y: number): [number, number] => [HALDREN[0] + x, HALDREN[1] + y];
export { H as haldrenAt };

const CROWN: FlagCond = { any: [{ not: { flag: 'act1.ruler' } }, { flag: 'act1.ruler', op: '==', value: 'aldith' }] };
const PROTECTOR: FlagCond = { flag: 'act1.ruler', op: '==', value: 'harrow' };
/** Martial law under the Order of the Wick. */
const WICK: FlagCond = { flag: 'act1.ruler', op: '==', value: 'wick' };
const BANNERS: [number, number][] = [[29, 3], [35, 3], [29, 52], [35, 52], [3, 25], [3, 31], [21, 18], [42, 18]];
const banners = (tile: number): OverlayOp[] => BANNERS.map(([x, y]) => ({ op: 'fill', layer: 'deco', rect: [x, y, 1, 1], tile }));

const house = (x: number, y: number, roof: number = T.ROOF_THATCH): OverlayOp =>
  ({ op: 'building', rect: [x, y, 7, 6], wall: T.WALL_WOOD, floor: T.WOOD_FLOOR, roof, doorAt: 3 });

const haldren: OverlayDef = {
  id: 'overlay:haldren',
  origin: HALDREN,
  size: [64, 56],
  encoding: 'ops',
  noScatter: true,
  ops: [
    { op: 'fill', layer: 'ground', rect: [2, 2, 60, 52], tile: T.DIRT, soft: true },
    { op: 'frame', layer: 'deco', thickness: 2, jitter: 0, tile: T.WALL_STONE,
      gaps: [{ side: 'n', at: 32, width: 4 }, { side: 's', at: 32, width: 4 }, { side: 'w', at: 28, width: 4 }] },
    // Cobbled streets and the market square.
    { op: 'fill', layer: 'ground', rect: [30, 0, 5, 56], tile: T.OLD_ROAD },
    { op: 'fill', layer: 'ground', rect: [0, 26, 64, 5], tile: T.OLD_ROAD },
    { op: 'fill', layer: 'ground', rect: [20, 18, 24, 18], tile: T.OLD_ROAD },
    // Haldren Keep (NW) and the cathedral (NE).
    { op: 'building', rect: [3, 3, 16, 13], wall: T.WALL_STONE, floor: T.STONE_FLOOR, roof: T.ROOF_SLATE, doorAt: 8 },
    { op: 'building', rect: [44, 3, 16, 14], wall: T.WALL_STONE, floor: T.STONE_FLOOR, roof: T.ROOF_SLATE, doorAt: 8 },
    // Houses.
    house(3, 18), house(12, 18), house(46, 19, T.ROOF_SLATE), house(54, 19),
    house(3, 33), house(12, 33, T.ROOF_SLATE), house(3, 43), house(12, 43),
    house(46, 33), house(54, 33, T.ROOF_SLATE), house(46, 43), house(54, 43),
    // Market stalls and the Wick checkpoint at the south gate.
    { op: 'fill', layer: 'deco', rect: [23, 21, 3, 1], tile: T.STALL },
    { op: 'fill', layer: 'deco', rect: [38, 21, 3, 1], tile: T.STALL },
    { op: 'fill', layer: 'deco', rect: [23, 33, 3, 1], tile: T.STALL },
    { op: 'fill', layer: 'deco', rect: [38, 33, 3, 1], tile: T.STALL },
    { op: 'fill', layer: 'deco', rect: [27, 49, 2, 1], tile: T.BARRICADE },
    { op: 'fill', layer: 'deco', rect: [36, 49, 2, 1], tile: T.BARRICADE },
    { op: 'collide', rect: [0, 0, 64, 56], bits: 64 },
  ],
  objects: [
    door('obj:haldren-keep-door', [11, 15], 'instance:haldren-keep', 'Haldren Keep'),
    door('obj:haldren-cathedral-door', [52, 16], 'instance:haldren-cathedral', 'the Cathedral'),
    door('obj:haldren-undercity-grate', [42, 34], 'instance:haldren-undercity', 'the undercity', { label: 'Climb down' }),
    { id: 'obj:haldren-forge', kind: 'interactable', at: [40, 23], props: { station: 'forge', name: 'the forge', label: 'Work' } },
    { id: 'obj:haldren-runeforge', kind: 'interactable', at: [43, 23], props: { station: 'runeforge', name: 'the runeforge', label: 'Work' } },
    waystone('haldren', [26, 24], 'Haldren'),
    { id: 'obj:haldren-notices', kind: 'sign', at: [33, 24], props: { name: 'Proclamations' } },
    anchor('haldren-gate', [33, 50]),
    anchor('haldren-market', [30, 27]),
    anchor('haldren-cathedral', [50, 18]),
  ],
  variants: [
    { when: CROWN, ops: banners(T.BANNER_CROWN) },
    { when: PROTECTOR, ops: banners(T.BANNER_PROTECTOR) },
    { when: WICK, ops: banners(T.BANNER_WICK) },
  ],
};

export default haldren;
