/**
 * The Drowned Abbey of Saint Wenna (WORLD.md §5.5), T1 dungeon: nave → crypt → reliquary.
 * Instance-local tile coords. Spawn compositions are Claude 4's; enemies are Claude 3's.
 */
import type { WorldObject } from '@/core';
import { T } from '@/world/tiles';
import type { InstanceDef, OverlayDef } from '@/world/types';
import { WEN } from '../_valley';

const ABBEY = 'instance:drowned-abbey';
const BOSS_DOWN = { flag: 'world.cleared.zone:abbey-reliquary' };
const stairs = (id: string, at: [number, number], floor: string, entrance: string, label: string): WorldObject =>
  ({ id, kind: 'door', at, props: { target: ABBEY, floor, entrance, label } });

const nave: OverlayDef = {
  id: 'overlay:abbey-f1',
  origin: [0, 0],
  size: [40, 34],
  encoding: 'ops',
  ops: [
    { op: 'fill', layer: 'ground', rect: [2, 2, 36, 30], tile: T.STONE_FLOOR },
    { op: 'frame', layer: 'deco', thickness: 2, jitter: 0, tile: T.WALL_STONE },
    { op: 'fill', layer: 'ground', rect: [2, 13, 36, 5], tile: T.DEEP_WATER },
    { op: 'fill', layer: 'ground', rect: [2, 12, 36, 1], tile: T.SHALLOWS },
    { op: 'fill', layer: 'ground', rect: [2, 18, 36, 1], tile: T.SHALLOWS },
    { op: 'fill', layer: 'deco', rect: [18, 3, 4, 2], tile: T.ALTAR },
    { op: 'fill', layer: 'deco', rect: [6, 23, 9, 1], tile: T.FENCE },
    { op: 'fill', layer: 'deco', rect: [25, 23, 9, 1], tile: T.FENCE },
    { op: 'fill', layer: 'deco', rect: [6, 26, 9, 1], tile: T.FENCE },
    { op: 'fill', layer: 'deco', rect: [25, 26, 9, 1], tile: T.FENCE },
    { op: 'scatter', rect: [3, 3, 34, 28], tiles: [T.RUBBLE, T.REEDS], density: 0.04, seed: 61 },
    { op: 'fill', layer: 'deco', rect: [20, 32, 1, 1], tile: T.DOOR },
  ],
  objects: [
    { id: 'obj:abbey-exit', kind: 'door', at: [20, 31], props: { target: 'overworld', label: 'Leave' } },
    { id: 'obj:abbey-floodgate-lever', kind: 'lever', at: [3, 21], props: { flag: 'world.lever.abbey-floodgate', name: 'Floodgate Lever' } },
    { id: 'obj:wenna-bell', kind: 'lore', at: [20, 6], props: { name: 'Bell of Saint Wenna' } },
    // Companion quest (Anselm, quest:a-lantern-for-the-road): the rite of reconsecration.
    { id: 'obj:abbey-altar', kind: 'interactable', at: [17, 5], props: { name: 'Saint Wenna’s altar', label: 'Kneel at' } },
    { id: 'obj:abbey-rite-font', kind: 'interactable', at: [8, 6], props: { name: 'Dry font', label: 'Kneel at' } },
    { id: 'obj:abbey-rite-roll', kind: 'interactable', at: [32, 6], props: { name: 'Roll of the Sisters', label: 'Read' } },
    { id: 'obj:abbey-rite-lamp', kind: 'interactable', at: [26, 9], props: { name: 'Sanctuary lamp', label: 'Light' } },
    stairs('obj:abbey-stairs-down', [35, 4], 'f2', 'top', 'Descend'),
  ],
  variants: [
    { when: { flag: 'world.lever.abbey-floodgate' },
      ops: [{ op: 'fill', layer: 'ground', rect: [2, 12, 36, 7], tile: T.MUD }, { op: 'scatter', rect: [2, 12, 36, 7], tiles: [T.REEDS, T.RUBBLE], density: 0.06, seed: 62 }] },
  ],
};

const crypt: OverlayDef = {
  id: 'overlay:abbey-f2',
  origin: [0, 0],
  size: [44, 32],
  encoding: 'ops',
  ops: [
    { op: 'fill', layer: 'ground', rect: [2, 2, 40, 4], tile: T.STONE_FLOOR },
    { op: 'fill', layer: 'ground', rect: [2, 2, 4, 28], tile: T.STONE_FLOOR },
    { op: 'fill', layer: 'ground', rect: [2, 26, 40, 4], tile: T.STONE_FLOOR },
    { op: 'fill', layer: 'ground', rect: [38, 2, 4, 28], tile: T.STONE_FLOOR },
    { op: 'fill', layer: 'ground', rect: [14, 10, 16, 12], tile: T.STONE_FLOOR },
    { op: 'fill', layer: 'ground', rect: [20, 6, 4, 4], tile: T.STONE_FLOOR },
    { op: 'fill', layer: 'ground', rect: [20, 22, 4, 4], tile: T.STONE_FLOOR },
    { op: 'fill', layer: 'ground', rect: [31, 13, 4, 2], tile: T.STONE_FLOOR },
    { op: 'fill', layer: 'ground', rect: [33, 11, 4, 6], tile: T.WOOD_FLOOR },
    { op: 'fill', layer: 'ground', rect: [30, 15, 1, 1], tile: T.STONE_FLOOR },
    { op: 'fill', layer: 'ground', rect: [30, 13, 1, 2], tile: T.STONE_FLOOR },
    { op: 'scatter', rect: [2, 2, 40, 1], tiles: [T.GRAVE], density: 0.3, seed: 63 },
    { op: 'scatter', rect: [2, 29, 40, 1], tiles: [T.GRAVE], density: 0.3, seed: 64 },
    { op: 'scatter', rect: [14, 10, 16, 12], tiles: [T.REEDS], density: 0.08, seed: 65 },
  ],
  objects: [
    stairs('obj:abbey-stairs-up', [3, 4], 'f1', 'from-crypt', 'Ascend'),
    stairs('obj:abbey-stairs-down-2', [40, 28], 'f3', 'top', 'Descend'),
    { id: 'obj:reed-cocoon-1', kind: 'interactable', at: [4, 16], props: { name: 'Reed cocoon', label: 'Cut open' } },
    { id: 'obj:reed-cocoon-2', kind: 'interactable', at: [39, 8], props: { name: 'Reed cocoon', label: 'Cut open' } },
    { id: 'obj:reed-cocoon-3', kind: 'interactable', at: [26, 20], props: { name: 'Reed cocoon', label: 'Cut open' } },
    { id: 'obj:bound-tobin', kind: 'interactable', at: [22, 14], when: { not: { flag: 'prologue.tobin_fate' } }, props: { name: 'Tobin', label: 'Free' } },
    { id: 'obj:abbey-crypt-chest', kind: 'chest', at: [35, 12], props: { lootTable: 'loot:abbey-crypt', name: 'Reliquary chest' } },
  ],
};

const reliquary: OverlayDef = {
  id: 'overlay:abbey-f3',
  origin: [0, 0],
  size: [32, 28],
  encoding: 'ops',
  ops: [
    { op: 'ellipse', layer: 'ground', rect: [2, 2, 28, 24], tile: T.STONE_FLOOR },
    { op: 'ellipse', layer: 'detail', rect: [11, 6, 10, 8], tile: T.LEY_VEIN },
    { op: 'fill', layer: 'deco', rect: [15, 6, 2, 1], tile: T.ALTAR },
    { op: 'fill', layer: 'deco', rect: [8, 8, 1, 1], tile: T.STANDING_STONE },
    { op: 'fill', layer: 'deco', rect: [23, 8, 1, 1], tile: T.STANDING_STONE },
    { op: 'fill', layer: 'deco', rect: [8, 18, 1, 1], tile: T.STANDING_STONE },
    { op: 'fill', layer: 'deco', rect: [23, 18, 1, 1], tile: T.STANDING_STONE },
  ],
  objects: [
    stairs('obj:abbey-stairs-up-2', [16, 24], 'f2', 'from-reliquary', 'Ascend'),
    { id: 'obj:fallen-ember', kind: 'interactable', at: [16, 8], when: BOSS_DOWN, props: { name: 'Fallen Ember', label: 'Take' } },
    { id: 'obj:abbey-shortcut', kind: 'door', at: [26, 13], when: BOSS_DOWN, props: { target: 'overworld', label: 'Climb out' } },
  ],
};

const abbey: InstanceDef = {
  id: ABBEY,
  kind: 'dungeon',
  name: 'The Drowned Abbey',
  tier: 1,
  biome: 'dungeon-crypt',
  exit: WEN(47, 47),
  floors: [
    {
      id: 'f1', overlay: 'overlay:abbey-f1',
      entrances: { main: [20, 29], 'from-crypt': [34, 6] },
      landmarks: [{ id: 'landmark:abbey-nave', name: 'The Nave', at: [20, 22], discoverRadius: 8, icon: 'ruin', instance: ABBEY }],
      spawnZones: [
        { id: 'zone:abbey-nave-thralls', table: 'spawn:abbey-nave-thralls', area: { x: 4, y: 20, w: 32, h: 6 }, maxAlive: 4, respawnSec: 0, leash: 20 },
        { id: 'zone:abbey-nave-dead', table: 'spawn:abbey-nave-dead', area: { x: 4, y: 4, w: 32, h: 7 }, maxAlive: 3, respawnSec: 0, leash: 20 },
      ],
    },
    {
      id: 'f2', overlay: 'overlay:abbey-f2',
      entrances: { top: [4, 5], 'from-reliquary': [39, 27] },
      landmarks: [{ id: 'landmark:abbey-crypt', name: 'The Crypt', at: [22, 16], discoverRadius: 8, icon: 'dungeon', instance: ABBEY }],
      spawnZones: [
        { id: 'zone:abbey-crypt', table: 'spawn:abbey-crypt', area: { x: 14, y: 10, w: 16, h: 12 }, maxAlive: 5, respawnSec: 0, leash: 18 },
      ],
    },
    {
      id: 'f3', overlay: 'overlay:abbey-f3',
      entrances: { top: [16, 22] },
      landmarks: [{ id: 'landmark:abbey-reliquary', name: 'The Reliquary', at: [16, 12], discoverRadius: 8, icon: 'shrine', instance: ABBEY }],
      spawnZones: [
        { id: 'zone:abbey-reliquary', table: 'spawn:abbey-reliquary', area: { x: 10, y: 7, w: 12, h: 8 }, maxAlive: 1, respawnSec: 0, leash: 16 },
      ],
    },
  ],
};

export default [nave, crypt, reliquary, abbey];
