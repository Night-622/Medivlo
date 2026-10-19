/**
 * Chapter 2 instances (Claude 4: 10-act1-spec): the Ossuary of Saint Calder, the King-Barrows (with the
 * River-Under shrine on the deepest floor), the Old Nail shaft (the Sunken Nail) and the Salt Exchange.
 */
import type { WorldObject } from '@/core';
import { T } from '@/world/tiles';
import type { InstanceDef, OverlayDef } from '@/world/types';
import { book, fire, interior, lm, table } from '../_builders';

const BARROWS = 'instance:king-barrows';
const stairs = (id: string, at: [number, number], floor: string, entrance: string, label: string): WorldObject =>
  ({ id, kind: 'door', at, props: { target: BARROWS, floor, entrance, label } });

const ossuary = interior('ossuary-of-saint-calder', 'Ossuary of Saint Calder', 18, 14, [576, 1089], {
  floor: T.STONE_FLOOR, wall: T.WALL_STONE, tier: 2,
  ops: [
    { op: 'fill', layer: 'deco', rect: [2, 2, 1, 8], tile: T.GRAVE },
    { op: 'fill', layer: 'deco', rect: [15, 2, 1, 8], tile: T.GRAVE },
    { op: 'fill', layer: 'deco', rect: [8, 2, 2, 1], tile: T.ALTAR },
    table(5, 6, 3), table(10, 6, 3),
  ],
  objects: [book('grey-monk-ossuary-rule', [12, 3], 'The Ossuary Rule'), fire('obj:ossuary-candles', [5, 3], 'Votive candles')],
});

const barrowsUpper: OverlayDef = {
  id: 'overlay:king-barrows-f1', origin: [0, 0], size: [36, 28], encoding: 'ops',
  ops: [
    { op: 'fill', layer: 'ground', rect: [2, 2, 32, 4], tile: T.ROCK_FLOOR },
    { op: 'fill', layer: 'ground', rect: [16, 2, 4, 24], tile: T.ROCK_FLOOR },
    { op: 'fill', layer: 'ground', rect: [2, 12, 32, 4], tile: T.ROCK_FLOOR },
    { op: 'fill', layer: 'ground', rect: [2, 2, 4, 14], tile: T.ROCK_FLOOR },
    { op: 'fill', layer: 'ground', rect: [30, 2, 4, 22], tile: T.ROCK_FLOOR },
    { op: 'fill', layer: 'ground', rect: [24, 20, 10, 6], tile: T.STONE_FLOOR },
    { op: 'scatter', rect: [2, 2, 32, 1], tiles: [T.GRAVE], density: 0.35, seed: 141 },
    { op: 'scatter', rect: [2, 15, 32, 1], tiles: [T.GRAVE], density: 0.35, seed: 142 },
  ],
  objects: [
    { id: 'obj:king-barrows-exit', kind: 'door', at: [18, 25], props: { target: 'overworld', label: 'Leave' } },
    stairs('obj:king-barrows-down', [32, 23], 'deep', 'main', 'Descend'),
  ],
};

const barrowsDeep: OverlayDef = {
  id: 'overlay:king-barrows-f2', origin: [0, 0], size: [30, 26], encoding: 'ops',
  ops: [
    { op: 'ellipse', layer: 'ground', rect: [2, 2, 26, 22], tile: T.ROCK_FLOOR },
    { op: 'fill', layer: 'ground', rect: [2, 9, 26, 3], tile: T.DEEP_WATER },
    { op: 'fill', layer: 'ground', rect: [13, 9, 4, 3], tile: T.BRIDGE },
    { op: 'fill', layer: 'ground', rect: [2, 8, 26, 1], tile: T.SHALLOWS },
    { op: 'fill', layer: 'ground', rect: [2, 12, 26, 1], tile: T.SHALLOWS },
    { op: 'fill', layer: 'deco', rect: [14, 3, 2, 1], tile: T.ALTAR },
    { op: 'ellipse', layer: 'detail', rect: [10, 2, 10, 6], tile: T.LEY_VEIN },
  ],
  objects: [
    stairs('obj:king-barrows-up', [15, 21], 'upper', 'from-deep', 'Ascend'),
    { id: 'obj:river-under-shrine', kind: 'interactable', at: [15, 4], props: { name: 'The River-Under shrine', label: 'Kneel' } },
  ],
};

const barrows: InstanceDef = {
  id: BARROWS, kind: 'dungeon', name: 'The King-Barrows', tier: 2, biome: 'dungeon-crypt', exit: [448, 963],
  floors: [
    {
      id: 'upper', overlay: 'overlay:king-barrows-f1', entrances: { main: [18, 23], 'from-deep': [31, 21] },
      spawnZones: [{ id: 'zone:king-barrows-upper', table: 'spawn:barrow-wights', area: { x: 2, y: 2, w: 32, h: 14 }, maxAlive: 4, respawnSec: 0, leash: 16 }],
    },
    {
      id: 'deep', overlay: 'overlay:king-barrows-f2', entrances: { main: [15, 19] },
      landmarks: [lm('river-under-shrine', 'The River-Under Shrine', [15, 5], 'shrine', 7)],
      spawnZones: [{ id: 'zone:king-barrows-deep', table: 'spawn:barrow-wights', area: { x: 4, y: 14, w: 22, h: 6 }, maxAlive: 3, respawnSec: 0, leash: 14 }],
    },
  ],
};

const nailShaft: OverlayDef = {
  id: 'overlay:old-nail-shaft-f1', origin: [0, 0], size: [40, 30], encoding: 'ops',
  ops: [
    { op: 'fill', layer: 'ground', rect: [18, 22, 4, 7], tile: T.ROCK_FLOOR },
    { op: 'line', layer: 'ground', points: [[20, 22], [8, 16], [8, 6], [20, 4], [32, 8], [32, 18]], width: 4, tile: T.ROCK_FLOOR },
    { op: 'ellipse', layer: 'ground', rect: [24, 14, 14, 12], tile: T.ROCK_FLOOR },
    { op: 'ellipse', layer: 'detail', rect: [27, 16, 8, 8], tile: T.LEY_VEIN },
    { op: 'scatter', rect: [2, 2, 36, 26], tiles: [T.RUBBLE], density: 0.04, seed: 151 },
    { op: 'fill', layer: 'deco', rect: [30, 19, 2, 1], tile: T.ALTAR },
  ],
  objects: [
    { id: 'obj:old-nail-shaft-exit', kind: 'door', at: [20, 27], props: { target: 'overworld', label: 'Climb out' } },
    { id: 'obj:broken-nail', kind: 'interactable', at: [31, 20], props: { name: 'The broken Nail', label: 'Examine' } },
  ],
};

const nailInstance: InstanceDef = {
  id: 'instance:old-nail-shaft', kind: 'dungeon', name: 'The Old Nail Shaft', tier: 2, biome: 'dungeon-mine', exit: [1196, 598],
  floors: [{
    id: 'f1', overlay: 'overlay:old-nail-shaft-f1', entrances: { main: [20, 25] },
    landmarks: [lm('sunken-nail', 'The Sunken Nail', [31, 21], 'dungeon', 8)],
    spawnZones: [{ id: 'zone:old-nail-wraiths', table: 'spawn:rust-wraiths', area: { x: 4, y: 3, w: 32, h: 16 }, maxAlive: 4, respawnSec: 0, leash: 16 }],
  }],
};

const saltExchange = interior('salt-exchange', 'The Salt Exchange', 20, 14, [330, 819], {
  floor: T.WOOD_FLOOR, wall: T.WALL_STONE, tier: 2,
  ops: [table(3, 4, 6), table(11, 4, 6), table(3, 8, 6), table(11, 8, 6)],
  objects: [book('salt-exchange-ledger', [17, 2], 'Ledger of the Salt Exchange')],
});

export default [...ossuary, barrowsUpper, barrowsDeep, barrows, nailShaft, nailInstance, ...saltExchange];
