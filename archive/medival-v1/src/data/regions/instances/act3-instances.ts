/**
 * Act III instances (Claude 4: 14-act3-spec): the Drowned Cathedral (Ysolde's seat in the Mirelands) and the
 * Heartforge (the Anvil of Ribs → the Heart of Orr). The Heartforge is entered from the Vault of the Nine Nails
 * (`landmark:heartforge-gate`) or from beneath Qadir (`landmark:kings-stair`); see act2-instances.ts.
 */
import type { WorldObject } from '@/core';
import { T } from '@/world/tiles';
import type { InstanceDef, OverlayDef } from '@/world/types';
import { anchor, lm } from '../_builders';

const HF = 'instance:heartforge';
const stairs = (id: string, at: [number, number], floor: string, entrance: string, label: string): WorldObject =>
  ({ id, kind: 'door', at, props: { target: HF, floor, entrance, label } });

const drownedCathedral: OverlayDef = {
  id: 'overlay:drowned-cathedral', origin: [0, 0], size: [36, 34], encoding: 'ops',
  ops: [
    { op: 'fill', layer: 'ground', rect: [2, 2, 32, 30], tile: T.MIRE },
    { op: 'frame', layer: 'deco', thickness: 2, jitter: 2, tile: T.WALL_STONE },
    { op: 'fill', layer: 'ground', rect: [16, 6, 4, 26], tile: T.OLD_ROAD },
    { op: 'ellipse', layer: 'ground', rect: [10, 3, 16, 10], tile: T.DEEP_WATER },
    { op: 'fill', layer: 'ground', rect: [16, 3, 4, 5], tile: T.STONE_FLOOR },
    { op: 'fill', layer: 'deco', rect: [17, 3, 2, 1], tile: T.ALTAR },
    { op: 'scatter', rect: [3, 14, 30, 16], tiles: [T.REEDS, T.DEAD_TREE], density: 0.06, seed: 311 },
  ],
  objects: [
    { id: 'obj:drowned-cathedral-exit', kind: 'door', at: [18, 31], props: { target: 'overworld', label: 'Leave' } },
    anchor('drowned-cathedral', [18, 6]),
  ],
};

const drownedCathedralInst: InstanceDef = {
  id: 'instance:drowned-cathedral', kind: 'dungeon', name: 'The Drowned Cathedral', tier: 5, biome: 'dungeon-ruin', exit: [1591, 775],
  floors: [{
    id: 'f1', overlay: 'overlay:drowned-cathedral', entrances: { main: [18, 29] },
    landmarks: [lm('drowned-cathedral', 'Ysolde’s Seat', [18, 8], 'dungeon', 9)],
    spawnZones: [{ id: 'zone:drowned-cathedral', table: 'spawn:unmade-road', area: { x: 4, y: 14, w: 28, h: 14 }, maxAlive: 4, respawnSec: 0, leash: 18 }],
  }],
};

const anvil: OverlayDef = {
  id: 'overlay:heartforge-anvil', origin: [0, 0], size: [40, 32], encoding: 'ops',
  ops: [
    { op: 'ellipse', layer: 'ground', rect: [2, 2, 36, 28], tile: T.ROCK_FLOOR },
    { op: 'ellipse', layer: 'detail', rect: [8, 6, 24, 20], tile: T.LEY_VEIN },
    // The Anvil of Ribs: a giant's ribcage of iron.
    ...[8, 12, 16, 22, 26, 30].map((x) => ({ op: 'fill' as const, layer: 'deco' as const, rect: [x, 9, 1, 3] as [number, number, number, number], tile: T.TOR })),
    { op: 'fill', layer: 'deco', rect: [18, 14, 4, 2], tile: T.ALTAR },
  ],
  objects: [
    { id: 'obj:heartforge-exit', kind: 'door', at: [20, 28], props: { target: 'overworld', label: 'Climb out' } },
    stairs('obj:heartforge-down', [20, 4], 'heart', 'main', 'Descend to the heart'),
  ],
};

const heart: OverlayDef = {
  id: 'overlay:heartforge-heart', origin: [0, 0], size: [32, 30], encoding: 'ops',
  ops: [
    { op: 'ellipse', layer: 'ground', rect: [2, 2, 28, 26], tile: T.ASH },
    { op: 'ellipse', layer: 'detail', rect: [6, 6, 20, 18], tile: T.LEY_VEIN },
    { op: 'ellipse', layer: 'ground', rect: [13, 4, 6, 5], tile: T.STONE_FLOOR },
  ],
  objects: [
    stairs('obj:heartforge-up', [16, 26], 'anvil', 'from-heart', 'Ascend'),
    anchor('heart-of-orr', [16, 9]),
    { id: 'obj:heartfire', kind: 'interactable', at: [16, 6], props: { name: 'The Heartfire', label: 'Reach for' } },
  ],
};

const heartforge: InstanceDef = {
  id: HF, kind: 'dungeon', name: 'The Heartforge', tier: 5, biome: 'cavern', exit: [1344, 314],
  floors: [
    {
      id: 'anvil', overlay: 'overlay:heartforge-anvil', entrances: { main: [20, 26], 'from-heart': [20, 6] },
      landmarks: [lm('the-anvil-of-ribs', 'The Anvil of Ribs', [20, 16], 'dungeon', 10)],
      spawnZones: [
        { id: 'zone:anvil-sentinels', table: 'spawn:anvil-of-ribs-sentinels', area: { x: 6, y: 16, w: 28, h: 8 }, maxAlive: 2, respawnSec: 0, leash: 18 },
        { id: 'zone:anvil-drowned', table: 'spawn:anvil-of-ribs-drowned', area: { x: 6, y: 6, w: 28, h: 6 }, maxAlive: 3, respawnSec: 0, leash: 18 },
      ],
    },
    {
      id: 'heart', overlay: 'overlay:heartforge-heart', entrances: { main: [16, 24] },
      landmarks: [lm('heart-of-orr', 'The Heart of Orr', [16, 12], 'dungeon', 9)],
      spawnZones: [{ id: 'zone:heart-of-orr-boss', table: 'spawn:nhal-risen', area: { x: 10, y: 10, w: 12, h: 12 }, maxAlive: 1, respawnSec: 0, leash: 16 }],
    },
  ],
};

export default [drownedCathedral, drownedCathedralInst, anvil, heart, heartforge];
