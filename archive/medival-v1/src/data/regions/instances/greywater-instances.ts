/**
 * Greywater dungeons (Claude 4: 10-act1-spec; bosses are Claude 3's): drowned Varn (market → hall, boss
 * Aldwin Varn) and the Reed Temple (boss the Reed-Mother). Boss arenas are ~12×12. Instance-local coords.
 */
import type { WorldObject } from '@/core';
import { T } from '@/world/tiles';
import type { InstanceDef, OverlayDef } from '@/world/types';
import { anchor, book, fire, lm } from '../_builders';

const VARN = 'instance:drowned-varn';
const ALDWIN_DOWN = { flag: 'world.cleared.zone:varn-hall-boss' };
const MOTHER_DOWN = { flag: 'world.cleared.zone:reed-temple-boss' };
const stairs = (id: string, at: [number, number], floor: string, entrance: string, label: string): WorldObject =>
  ({ id, kind: 'door', at, props: { target: VARN, floor, entrance, label } });

const varnMarket: OverlayDef = {
  id: 'overlay:varn-market',
  origin: [0, 0],
  size: [44, 34],
  encoding: 'ops',
  ops: [
    { op: 'fill', layer: 'ground', rect: [2, 2, 40, 30], tile: T.OLD_ROAD },
    { op: 'frame', layer: 'deco', thickness: 2, jitter: 0, tile: T.WALL_STONE },
    { op: 'ellipse', layer: 'ground', rect: [8, 8, 28, 16], tile: T.SHALLOWS },
    { op: 'ellipse', layer: 'ground', rect: [14, 12, 16, 8], tile: T.DEEP_WATER },
    { op: 'fill', layer: 'ground', rect: [20, 2, 4, 30], tile: T.BRIDGE },
    { op: 'fill', layer: 'deco', rect: [5, 5, 3, 1], tile: T.STALL },
    { op: 'fill', layer: 'deco', rect: [35, 5, 3, 1], tile: T.STALL },
    { op: 'fill', layer: 'deco', rect: [5, 27, 3, 1], tile: T.STALL },
    { op: 'scatter', rect: [3, 3, 38, 28], tiles: [T.RUBBLE, T.REEDS, T.DEAD_TREE], density: 0.05, seed: 111 },
  ],
  objects: [
    { id: 'obj:drowned-varn-exit', kind: 'door', at: [22, 31], props: { target: 'overworld', label: 'Leave' } },
    stairs('obj:varn-hall-stairs', [22, 3], 'hall', 'main', 'Enter the hall'),
    fire('obj:varn-market-brazier', [4, 30], 'Guttering brazier'),
  ],
};

const varnHall: OverlayDef = {
  id: 'overlay:varn-hall',
  origin: [0, 0],
  size: [30, 28],
  encoding: 'ops',
  ops: [
    { op: 'fill', layer: 'ground', rect: [2, 2, 26, 24], tile: T.STONE_FLOOR },
    { op: 'frame', layer: 'deco', thickness: 2, jitter: 0, tile: T.WALL_STONE },
    { op: 'fill', layer: 'ground', rect: [9, 6, 12, 12], tile: T.SHALLOWS },
    { op: 'fill', layer: 'deco', rect: [14, 3, 2, 1], tile: T.ALTAR },
    { op: 'fill', layer: 'deco', rect: [8, 3, 1, 1], tile: T.BANNER_PROTECTOR },
    { op: 'fill', layer: 'deco', rect: [21, 3, 1, 1], tile: T.BANNER_PROTECTOR },
  ],
  objects: [
    stairs('obj:varn-hall-exit', [15, 25], 'market', 'from-hall', 'Back to the market'),
    anchor('varn-hall', [15, 8]),
    { id: 'obj:ember-of-the-fen', kind: 'interactable', at: [15, 4], when: ALDWIN_DOWN, props: { name: 'Ember of the Fen', label: 'Take' } },
    book('varn-charter', [4, 4], 'The Charter of Varn'),
  ],
};

const varnInstance: InstanceDef = {
  id: VARN, kind: 'dungeon', name: 'Drowned Varn', tier: 2, biome: 'dungeon-ruin',
  exit: [1169, 990],
  floors: [
    {
      id: 'market', overlay: 'overlay:varn-market', entrances: { main: [22, 29], 'from-hall': [22, 5] },
      landmarks: [lm('varn-market', 'The Drowned Market', [22, 16], 'ruin', 10)],
      spawnZones: [
        { id: 'zone:varn-market-knights', table: 'spawn:varn-knights', area: { x: 4, y: 4, w: 36, h: 8 }, maxAlive: 3, respawnSec: 0, leash: 18 },
        { id: 'zone:varn-market-choir', table: 'spawn:varn-choir', area: { x: 4, y: 22, w: 36, h: 8 }, maxAlive: 4, respawnSec: 0, leash: 18 },
      ],
    },
    {
      id: 'hall', overlay: 'overlay:varn-hall', entrances: { main: [15, 23] },
      landmarks: [lm('varn-hall', 'Hall of the Drowned Lord', [15, 12], 'dungeon', 8)],
      spawnZones: [{ id: 'zone:varn-hall-boss', table: 'spawn:aldwin-varn', area: { x: 9, y: 6, w: 12, h: 12 }, maxAlive: 1, respawnSec: 0, leash: 14 }],
    },
  ],
};

const reedTempleOverlay: OverlayDef = {
  id: 'overlay:reed-temple',
  origin: [0, 0],
  size: [30, 32],
  encoding: 'ops',
  ops: [
    { op: 'fill', layer: 'ground', rect: [2, 2, 26, 28], tile: T.MARSH },
    { op: 'frame', layer: 'deco', thickness: 2, jitter: 0, tile: T.THICKET },
    { op: 'fill', layer: 'ground', rect: [13, 18, 4, 12], tile: T.BRIDGE },
    { op: 'ellipse', layer: 'ground', rect: [9, 3, 12, 12], tile: T.SHALLOWS },
    { op: 'fill', layer: 'deco', rect: [14, 3, 2, 1], tile: T.ALTAR },
    { op: 'scatter', rect: [3, 15, 24, 14], tiles: [T.REEDS], density: 0.12, seed: 112 },
  ],
  objects: [
    { id: 'obj:reed-temple-exit', kind: 'door', at: [15, 29], props: { target: 'overworld', label: 'Leave' } },
    { id: 'obj:harrow-letters', kind: 'interactable', at: [4, 5], props: { name: 'Bundle of letters', label: 'Take' } },
    { id: 'obj:reed-temple-shrine', kind: 'interactable', at: [15, 4], when: MOTHER_DOWN, props: { name: 'Drowned shrine', label: 'Examine' } },
    anchor('reed-temple', [15, 9]),
  ],
};

const reedTemple: InstanceDef = {
  id: 'instance:reed-temple', kind: 'dungeon', name: 'The Reed Temple', tier: 2, biome: 'dungeon-ruin',
  exit: [1302, 1124],
  floors: [{
    id: 'f1', overlay: 'overlay:reed-temple', entrances: { main: [15, 27] },
    landmarks: [lm('reed-temple', 'The Reed Temple', [15, 16], 'dungeon', 10)],
    spawnZones: [
      { id: 'zone:reed-temple-choir', table: 'spawn:reed-temple-choir', area: { x: 3, y: 16, w: 24, h: 10 }, maxAlive: 4, respawnSec: 0, leash: 16 },
      { id: 'zone:reed-temple-boss', table: 'spawn:reed-mother', area: { x: 9, y: 3, w: 12, h: 12 }, maxAlive: 1, respawnSec: 0, leash: 14 },
    ],
  }],
};

export default [varnMarket, varnHall, varnInstance, reedTempleOverlay, reedTemple];
