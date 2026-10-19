/**
 * Kingsvale instances (Claude 4: 10-act1-spec): Haldren Keep (throne room), Haldren Cathedral (vestry),
 * the undercity (Quiet Hand den) and Cinderhold's hall. Instance-local tile coords.
 */
import type { FlagCond } from '@/core';
import { T } from '@/world/tiles';
import type { InstanceDef, OverlayDef } from '@/world/types';
import { anchor, book, fire, interior, lm, table } from '../_builders';
import { haldrenAt } from '../overlays/haldren';

const RESTORED: FlagCond = { flag: 'act1.cinderhold_restored' };
const CROWN: FlagCond = { any: [{ not: { flag: 'act1.ruler' } }, { flag: 'act1.ruler', op: '==', value: 'aldith' }] };
const PROTECTOR: FlagCond = { flag: 'act1.ruler', op: '==', value: 'harrow' };
/** Martial law under the Order of the Wick. */
const WICK: FlagCond = { flag: 'act1.ruler', op: '==', value: 'wick' };

const keep = interior('haldren-keep', 'Haldren Keep', 22, 18, haldrenAt(11, 17), {
  floor: T.STONE_FLOOR, wall: T.WALL_STONE, tier: 2,
  ops: [
    { op: 'fill', layer: 'detail', rect: [10, 3, 2, 12], tile: T.FLOWERS },
    { op: 'fill', layer: 'deco', rect: [10, 2, 2, 1], tile: T.ALTAR },
    table(3, 6, 4), table(15, 6, 4), table(3, 10, 4), table(15, 10, 4),
  ],
  variants: [
    { when: CROWN, ops: [{ op: 'fill', layer: 'deco', rect: [7, 2, 1, 1], tile: T.BANNER_CROWN }, { op: 'fill', layer: 'deco', rect: [14, 2, 1, 1], tile: T.BANNER_CROWN }] },
    { when: PROTECTOR, ops: [{ op: 'fill', layer: 'deco', rect: [7, 2, 1, 1], tile: T.BANNER_PROTECTOR }, { op: 'fill', layer: 'deco', rect: [14, 2, 1, 1], tile: T.BANNER_PROTECTOR }] },
    { when: WICK, ops: [{ op: 'fill', layer: 'deco', rect: [7, 2, 1, 1], tile: T.BANNER_WICK }, { op: 'fill', layer: 'deco', rect: [14, 2, 1, 1], tile: T.BANNER_WICK }] },
  ],
  objects: [anchor('throne-room', [11, 5]), book('ballad-of-the-northern-pass', [19, 3], 'The Ballad of the Northern Pass')],
  landmarks: [lm('throne-room', 'The Throne Room', [11, 6], 'city', 7)],
});

const cathedral = interior('haldren-cathedral', 'Cathedral of Haldren', 20, 22, haldrenAt(52, 18), {
  floor: T.STONE_FLOOR, wall: T.WALL_STONE, tier: 2,
  ops: [
    { op: 'fill', layer: 'deco', rect: [9, 2, 2, 1], tile: T.ALTAR },
    table(3, 8, 5), table(12, 8, 5), table(3, 11, 5), table(12, 11, 5), table(3, 14, 5), table(12, 14, 5),
    // The vestry, east of the altar.
    { op: 'fill', layer: 'deco', rect: [14, 1, 1, 5], tile: T.WALL_STONE },
    { op: 'fill', layer: 'deco', rect: [14, 4, 1, 1], tile: T.DOOR },
  ],
  objects: [
    { id: 'obj:wick-ledger', kind: 'interactable', at: [17, 2], props: { name: 'Wick ledger', label: 'Read' } },
    book('lives-of-the-lightsworn', [2, 3], 'Lives of the Lightsworn'),
    book('proclamation-of-the-snuffing', [5, 2], 'Proclamation of the Snuffing'),
  ],
});

const undercityOverlay: OverlayDef = {
  id: 'overlay:haldren-undercity',
  origin: [0, 0],
  size: [40, 28],
  encoding: 'ops',
  ops: [
    { op: 'fill', layer: 'ground', rect: [2, 22, 36, 3], tile: T.STONE_FLOOR },
    { op: 'fill', layer: 'ground', rect: [2, 4, 3, 21], tile: T.STONE_FLOOR },
    { op: 'fill', layer: 'ground', rect: [2, 4, 24, 3], tile: T.STONE_FLOOR },
    { op: 'fill', layer: 'ground', rect: [6, 12, 24, 2], tile: T.SHALLOWS },
    { op: 'fill', layer: 'ground', rect: [26, 2, 12, 12], tile: T.WOOD_FLOOR },
    { op: 'fill', layer: 'ground', rect: [26, 14, 3, 9], tile: T.STONE_FLOOR },
    table(29, 5, 4), table(29, 9, 4),
    { op: 'scatter', rect: [2, 2, 36, 24], tiles: [T.RUBBLE], density: 0.03, seed: 91 },
    { op: 'collide', rect: [0, 0, 40, 28], bits: 64 },
  ],
  objects: [
    { id: 'obj:haldren-undercity-exit', kind: 'door', at: [36, 23], props: { target: 'overworld', label: 'Climb up' } },
    anchor('quiet-hand-den', [33, 7]),
    fire('obj:quiet-hand-brazier', [35, 3], 'Brazier'),
  ],
};
const undercity: InstanceDef = {
  id: 'instance:haldren-undercity', kind: 'dungeon', name: 'The Undercity', tier: 2, biome: 'dungeon-ruin',
  exit: haldrenAt(42, 36),
  floors: [{
    id: 'f1', overlay: 'overlay:haldren-undercity', entrances: { main: [35, 23] }, spawnZones: [],
    landmarks: [lm('quiet-hand-den', 'The Quiet Hand', [32, 8], 'camp', 7)],
  }],
};

const cinderhold = interior('cinderhold', 'Cinderhold', 26, 20, [1064, 671], {
  floor: T.STONE_FLOOR, wall: T.WALL_STONE, tier: 2, kind: 'dungeon',
  ops: [
    { op: 'scatter', rect: [1, 1, 24, 18], tiles: [T.RUBBLE, T.ASH], density: 0.08, seed: 92 },
    { op: 'fill', layer: 'deco', rect: [12, 2, 2, 1], tile: T.ALTAR },
  ],
  variants: [{ when: RESTORED, ops: [{ op: 'clear', layer: 'deco', rect: [1, 3, 24, 15] }, { op: 'ellipse', layer: 'detail', rect: [8, 4, 10, 8], tile: T.LEY_VEIN }] }],
  objects: [
    { id: 'obj:cinderhold-brazier', kind: 'interactable', at: [13, 5], props: { name: 'The great brazier', label: 'Examine' } },
    anchor('cinderhold-hall', [10, 8], RESTORED),
    fire('obj:cinderhold-hearth', [4, 4], 'Hearth', RESTORED),
    book('on-the-orrin-works', [22, 3], 'On the Orrin Works', RESTORED),
    { id: 'obj:dream-brazier', kind: 'interactable', at: [16, 5], when: RESTORED, props: { name: 'The dream-brazier', label: 'Gaze into' } },
  ],
  landmarks: [lm('cinderhold-hall', 'Hall of the Emberwardens', [13, 9], 'ruin', 8)],
  spawnZones: [{
    id: 'zone:cinderhold-hall', table: 'spawn:cinderhold-shades', area: { x: 3, y: 6, w: 20, h: 10 },
    maxAlive: 3, respawnSec: 0, leash: 16, when: { not: RESTORED },
  }],
});

export default [...keep, ...cathedral, undercityOverlay, undercity, ...cinderhold];
