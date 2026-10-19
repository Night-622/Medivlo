/**
 * Brindlecross (WORLD.md §5.2). Overlay-local coords; crossroads at (28, 24). The Pilgrim's Road runs N–S at x≈28,
 * the Varn Causeway east from the crossroads, and the Brindle crosses diagonally SW→NE.
 * NPC anchors sit outside the buildings; Claude 4's NPC schedules use the landmark positions in aldermoor.ts.
 */
import { T } from '@/world/tiles';
import type { OverlayDef } from '@/world/types';
import type { WorldObject } from '@/core';
import { VIL } from '../_valley';

const door = (id: string, at: [number, number], target: string, name: string): WorldObject =>
  ({ id, kind: 'door', at, props: { target, entrance: 'main', name } });
const anchor = (landmark: string, at: [number, number]): WorldObject =>
  ({ id: `npc-anchor:${landmark}`, kind: 'npc-anchor', at, props: { landmark: `landmark:${landmark}` } });

const brindlecross: OverlayDef = {
  id: 'overlay:brindlecross',
  origin: VIL(0, 0),
  size: [56, 48],
  encoding: 'ops',
  noScatter: true,
  ops: [
    { op: 'ellipse', layer: 'ground', rect: [-6, -4, 68, 56], tile: T.GRASS, soft: true },
    // Village green with the remembrance pyre.
    { op: 'ellipse', layer: 'ground', rect: [11, 15, 15, 7], tile: T.GRASS_DARK, soft: true },
    { op: 'scatter', rect: [11, 15, 15, 7], ellipse: true, tiles: [T.FLOWERS], density: 0.12, seed: 31 },
    // Buildings: [x, y, w, h], door in the south wall at doorAt.
    { op: 'building', rect: [8, 8, 12, 8], wall: T.WALL_WOOD, floor: T.WOOD_FLOOR, roof: T.ROOF_THATCH, doorAt: 6 },   // Guttered Candle
    { op: 'building', rect: [33, 4, 10, 8], wall: T.WALL_STONE, floor: T.STONE_FLOOR, roof: T.ROOF_SLATE, doorAt: 4 }, // chapel
    { op: 'building', rect: [36, 32, 12, 8], wall: T.WALL_STONE, floor: T.WOOD_FLOOR, roof: T.ROOF_SLATE, doorAt: 5 }, // elder hall
    { op: 'building', rect: [6, 22, 9, 6], wall: T.WALL_STONE, floor: T.STONE_FLOOR, roof: T.ROOF_SLATE, doorAt: 4 },  // smithy
    { op: 'building', rect: [8, 36, 8, 6], wall: T.WALL_WOOD, floor: T.WOOD_FLOOR, roof: T.ROOF_THATCH, doorAt: 3 },   // Oswin's mill
    { op: 'building', rect: [0, 28, 6, 5], wall: T.WALL_WOOD, floor: T.WOOD_FLOOR, roof: T.ROOF_THATCH, doorAt: 2 },   // Hollis cottage
    { op: 'building', rect: [44, 18, 5, 4], wall: T.WALL_WOOD, floor: T.DIRT, roof: T.ROOF_THATCH, doorAt: 2 },       // woodshed
    // Smithy anvil + forge glow, chapel graveyard, fences.
    { op: 'fill', layer: 'deco', rect: [15, 25, 1, 1], tile: T.ROCK },
    { op: 'scatter', rect: [44, 4, 10, 10], tiles: [T.GRAVE], density: 0.18, seed: 32 },
    { op: 'line', layer: 'deco', points: [[43, 2], [55, 2], [55, 14]], width: 1, tile: T.FENCE },
    { op: 'scatter', rect: [0, 0, 56, 48], tiles: [T.BUSH, T.FLOWERS, T.TREE], density: 0.015, seed: 33 },
  ],
  objects: [
    { id: 'obj:remembrance-pyre', kind: 'interactable', at: [22, 17], props: { name: 'Remembrance Pyre' } },
    { id: 'obj:woodshed-tinder', kind: 'interactable', at: [46, 23], props: { name: 'Tinder', label: 'Take' } },
    { id: 'obj:waystone-brindlecross', kind: 'waystone', at: [24, 13], props: { name: 'Brindlecross', label: 'Touch' } },
    { id: 'obj:brindlecross-signpost', kind: 'sign', at: [31, 21], props: { name: 'Signpost' } },
    { id: 'obj:coalbrook-forge', kind: 'interactable', at: [16, 26], props: { station: 'forge', name: 'the forge', label: 'Work' } },
    door('obj:guttered-candle-door', [14, 15], 'instance:guttered-candle', 'the Guttered Candle'),
    door('obj:chapel-door', [37, 11], 'instance:brindlecross-chapel', 'the Chapel'),
    door('obj:elder-hall-door', [41, 39], 'instance:elder-hall', 'the Elder Hall'),
    door('obj:oswin-mill-door', [11, 41], 'instance:oswin-mill', "Oswin's Mill"),
    door('obj:hollis-cottage-door', [2, 32], 'instance:hollis-cottage', 'Hollis Cottage'),
    anchor('brindlecross-green', [12, 21]),
    anchor('brindlecross-chapel', [39, 12]),
    anchor('guttered-candle', [16, 16]),
    anchor('coalbrook-smithy', [12, 28]),
    anchor('oswin-mill', [13, 42]),
    anchor('elder-hall', [43, 40]),
    anchor('hollis-cottage', [4, 33]),
    anchor('brindlecross-woodshed', [47, 23]),
  ],
};

export default brindlecross;
