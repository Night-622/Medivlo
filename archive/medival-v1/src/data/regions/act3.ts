/**
 * Act III "The Heartforge" world (Claude 4: 14-act3-spec): the Mirelands (the Hollow Sea, open on
 * `act3.breach_open`), the Heartforge (instance-only region) and the siege of Haldren (`act3.siege_active`).
 */
import type { FlagCond, RegionDef } from '@/core';
import { T } from '@/world/tiles';
import type { OverlayDef, OverlayOp } from '@/world/types';
import { anchor, door, lm } from './_builders';
import { haldrenAt as H } from './overlays/haldren';

const SIEGE: FlagCond = { flag: 'act3.siege_active' };

// ---------------------------------------------------------------- The Mirelands
const SHORE: [number, number] = [1420, 1012];
const ROAD: [number, number][] = [[1392, 1050], SHORE, [1470, 950], [1520, 880], [1560, 820], [1590, 790]];
const memories: [number, number][] = [[1434, 996], [1458, 966], [1486, 930], [1508, 900], [1532, 866], [1550, 840], [1574, 810]];

const mirelandShore: OverlayDef = {
  id: 'overlay:mireland-shore', origin: [1404, 998], size: [30, 26], encoding: 'ops', noScatter: true,
  ops: [
    { op: 'ellipse', layer: 'ground', rect: [0, 0, 30, 26], tile: T.ASH, soft: true },
    { op: 'scatter', rect: [0, 0, 30, 26], ellipse: true, tiles: [T.DEAD_TREE, T.REEDS], density: 0.06, seed: 301 },
  ],
  objects: [anchor('mireland-shore', [16, 14])],
};

const unmadeRoad: OverlayDef = {
  id: 'overlay:unmade-road', origin: [1400, 780], size: [200, 240], encoding: 'ops', ops: [],
  objects: memories.map(([x, y], i) => ({ id: `obj:dream-memory-${i + 1}`, kind: 'interactable' as const, at: [x - 1400, y - 780] as [number, number], props: { name: 'A drowned memory', label: 'Touch' } })),
};

const drownedCathedralIsle: OverlayDef = {
  id: 'overlay:drowned-cathedral-isle', origin: [1574, 752], size: [34, 34], encoding: 'ops', noScatter: true,
  ops: [
    { op: 'ellipse', layer: 'ground', rect: [0, 0, 34, 34], tile: T.ASH },
    { op: 'building', rect: [7, 4, 20, 18], wall: T.WALL_STONE, floor: T.MIRE, roof: -1, doorAt: 10 },
    { op: 'ellipse', layer: 'detail', rect: [10, 23, 14, 8], tile: T.LEY_VEIN },
    { op: 'fill', layer: 'ground', rect: [15, 22, 4, 12], tile: T.OLD_ROAD },
  ],
  objects: [door('obj:drowned-cathedral-door', [17, 21], 'instance:drowned-cathedral', 'the Drowned Cathedral')],
};

const mirelands: RegionDef = {
  id: 'region:mirelands', name: 'The Mirelands', tier: 5, innerTierBonus: 0.3, layoutCode: 'M',
  description: 'The Hollow Sea, where the world has unforged: inverted rain, pale reeds, black water. Ysolde’s seat lies at its heart.',
  biome: 'mirelands', frost: 0, mapColor: 0x221b22, gate: { flag: 'act3.breach_open' },
  overlays: ['overlay:mireland-shore', 'overlay:unmade-road', 'overlay:drowned-cathedral-isle'],
  landmarks: [
    lm('mireland-shore', 'The Mireland Shore', [1420, 1012], 'poi', 9),
    lm('the-unmade-road', 'The Unmade Road', [1510, 900], 'poi', 12),
    lm('drowned-cathedral-isle', 'The Drowned Cathedral', [1591, 777], 'dungeon', 12),
    lm('the-breach', 'The Breach', [1430, 1000], 'poi', 12),
  ],
  spawnZones: [{ id: 'zone:unmade-road', table: 'spawn:unmade-road', area: { x: 1440, y: 800, w: 140, h: 190 }, maxAlive: 5, respawnSec: 180, leash: 22 }],
};

/** The way in from the Black Seep (Greywater) to the Mireland shore and on to the Drowned Cathedral. */
export const UNMADE_ROAD = ROAD;

// ---------------------------------------------------------------- The Heartforge (instance-only)
const heartforge: RegionDef = {
  id: 'region:heartforge', name: 'The Heartforge', tier: 5, innerTierBonus: 0, layoutCode: '',
  description: 'The furnace at the world’s core beneath the Ironspine, where the god Orr’s heart still burns.',
  biome: 'cavern', frost: 0, mapColor: 0xe07a2a, gate: { flag: 'act3.heartforge_unsealed' },
  landmarks: [], spawnZones: [], overlays: [],
};

// ---------------------------------------------------------------- The siege of Haldren (Kingsvale variant)
const FIRES: [number, number][] = [[40, 36], [40, 52], [40, 68], [60, 34], [80, 34], [104, 40], [104, 56], [104, 72], [60, 92], [84, 92]];
const CAMPS: [number, number][] = [[6, 6], [120, 10], [10, 100], [118, 104]];
const siege: OverlayDef = {
  id: 'overlay:haldren-siege', origin: [760, 640], size: [144, 124], encoding: 'ops', ops: [],
  variants: [{
    when: SIEGE,
    ops: [
      ...FIRES.map(([x, y]): OverlayOp => ({ op: 'fill', layer: 'deco', rect: [x, y, 1, 1], tile: T.CAMPFIRE })),
      ...CAMPS.flatMap(([x, y]): OverlayOp[] => [
        { op: 'ellipse', layer: 'ground', rect: [x, y, 16, 12], tile: T.MIRE },
        { op: 'fill', layer: 'deco', rect: [x + 3, y + 3, 3, 2], tile: T.TENT },
        { op: 'fill', layer: 'deco', rect: [x + 9, y + 6, 3, 2], tile: T.TENT },
      ]),
    ],
  }],
};

/** Act III places inside Haldren: the river gate (east wall) and the lower city (south-west quarter). */
const haldrenAct3: OverlayDef = {
  id: 'overlay:haldren-act3', origin: H(0, 0), size: [64, 56], encoding: 'ops',
  ops: [{ op: 'fill', layer: 'deco', rect: [62, 38, 2, 4], tile: T.BARRICADE }],
  objects: [
    anchor('haldren-river-gate', [59, 40]), anchor('lower-city', [20, 50]),
    { id: 'obj:haldren-great-lantern', kind: 'interactable', at: [32, 20], props: { name: 'The great lantern of Haldren', label: 'Look up at' } },
  ],
};

export const act3KingsvaleLandmarks = [
  lm('haldren-river-gate', 'The River Gate', H(60, 40), 'poi', 5),
  lm('lower-city', 'The Lower City', H(18, 49), 'poi', 8),
];

export default [mirelands, mirelandShore, unmadeRoad, drownedCathedralIsle, heartforge, siege, haldrenAct3];
