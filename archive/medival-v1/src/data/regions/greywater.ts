/**
 * Greywater Marsh (Act I, Chapter 3 "The Drowning of Varn"). Landmark ids are Claude 4's (10-act1-spec).
 * Varn's floodgates stay shut until `act1.varn_assault`; the town itself is the instance `instance:drowned-varn`.
 */
import type { RegionDef } from '@/core';
import { T } from '@/world/tiles';
import type { OverlayDef } from '@/world/types';
import { anchor, door, fire, lm, waystone } from './_builders';

const ASSAULT = { flag: 'act1.varn_assault' };

/** Varn's drowned walls on the west edge of the marsh; overlay-local, origin (1166, 960). */
const varn: OverlayDef = {
  id: 'overlay:varn',
  origin: [1166, 960],
  size: [48, 44],
  encoding: 'ops',
  noScatter: true,
  ops: [
    { op: 'fill', layer: 'ground', rect: [2, 2, 44, 40], tile: T.SHALLOWS },
    { op: 'ellipse', layer: 'ground', rect: [10, 8, 28, 26], tile: T.DEEP_WATER },
    { op: 'frame', layer: 'deco', thickness: 2, jitter: 0, tile: T.WALL_STONE, gaps: [{ side: 'w', at: 30, width: 4 }] },
    { op: 'building', rect: [6, 4, 8, 6], wall: T.WALL_STONE, floor: T.STONE_FLOOR, roof: -1, doorAt: 3 },
    { op: 'building', rect: [32, 6, 10, 8], wall: T.WALL_STONE, floor: T.STONE_FLOOR, roof: -1, doorAt: 4 },
    { op: 'building', rect: [30, 30, 12, 9], wall: T.WALL_STONE, floor: T.STONE_FLOOR, roof: T.ROOF_SLATE, doorAt: 6 },
    { op: 'scatter', rect: [2, 2, 44, 40], tiles: [T.REEDS, T.RUBBLE, T.DEAD_TREE], density: 0.05, seed: 101 },
    { op: 'fill', layer: 'ground', rect: [0, 28, 6, 5], tile: T.OLD_ROAD },
  ],
  objects: [{ id: 'obj:varn-floodgate-wheel', kind: 'interactable', at: [0, 27], props: { name: 'Floodgate wheel', label: 'Turn' } }],
  variants: [
    { when: { not: ASSAULT }, ops: [{ op: 'fill', layer: 'deco', rect: [0, 28, 2, 5], tile: T.BARRICADE }] },
    { when: ASSAULT, objects: [door('obj:varn-gate-door', [2, 30], 'instance:drowned-varn', 'Varn', { label: 'Enter' })], ops: [] },
  ],
};

const fenwick: OverlayDef = {
  id: 'overlay:fenwick-stilts',
  origin: [1236, 1066],
  size: [30, 24],
  encoding: 'ops',
  noScatter: true,
  ops: [
    { op: 'fill', layer: 'ground', rect: [0, 0, 30, 24], tile: T.SHALLOWS },
    { op: 'line', layer: 'ground', points: [[0, 8], [28, 8]], width: 2, tile: T.BRIDGE },
    { op: 'line', layer: 'ground', points: [[14, 2], [14, 22]], width: 2, tile: T.BRIDGE },
    ...([[2, 1], [18, 1], [2, 12], [18, 12], [8, 15]] as const).map(([x, y]) => ({
      op: 'building' as const, rect: [x, y, 7, 5] as [number, number, number, number], wall: T.WALL_WOOD, floor: T.WOOD_FLOOR, roof: T.ROOF_THATCH, doorAt: 3,
    })),
    { op: 'fill', layer: 'ground', rect: [10, 9, 8, 4], tile: T.WOOD_FLOOR },
    { op: 'scatter', rect: [0, 0, 30, 24], tiles: [T.REEDS], density: 0.08, seed: 102 },
  ],
  objects: [fire('obj:fenwick-firepit', [14, 11], 'Smoke-pit'), anchor('fenwick-stilts', [12, 10]), waystone('fenwick', [16, 10], 'Fenwick')],
};

const reedTemple: OverlayDef = {
  id: 'overlay:reed-temple-isle',
  origin: [1290, 1110],
  size: [24, 22],
  encoding: 'ops',
  noScatter: true,
  ops: [
    { op: 'ellipse', layer: 'ground', rect: [0, 0, 24, 22], tile: T.MARSH },
    { op: 'ellipse', layer: 'deco', rect: [0, 0, 24, 22], tile: T.REEDS },
    { op: 'ellipse', layer: 'deco', rect: [4, 4, 16, 14], tile: -1 },
    { op: 'building', rect: [7, 5, 10, 8], wall: T.THICKET, floor: T.MARSH, roof: T.ROOF_THATCH, doorAt: 5 },
    { op: 'fill', layer: 'deco', rect: [11, 13, 3, 9], tile: -1 },
    { op: 'fill', layer: 'ground', rect: [11, 13, 3, 9], tile: T.BRIDGE },
  ],
  objects: [door('obj:reed-temple-door', [12, 12], 'instance:reed-temple', 'the Reed Temple')],
};

const tobinsReeds: OverlayDef = {
  id: 'overlay:tobins-reeds',
  origin: [1212, 1022],
  size: [16, 14],
  encoding: 'ops',
  noScatter: true,
  ops: [
    { op: 'ellipse', layer: 'ground', rect: [0, 0, 16, 14], tile: T.MARSH },
    { op: 'scatter', rect: [0, 0, 16, 14], ellipse: true, tiles: [T.REEDS], density: 0.4, seed: 103 },
    { op: 'ellipse', layer: 'deco', rect: [5, 4, 6, 6], tile: -1 },
    { op: 'ellipse', layer: 'ground', rect: [6, 3, 5, 3], tile: T.SHALLOWS },
  ],
  objects: [anchor('tobins-reeds', [8, 7]), { id: 'obj:quiet-water', kind: 'interactable', at: [8, 5], props: { name: 'Still black water', label: 'Look into' } }],
};

/** Companion quest (Maren, quest:the-hunters-oath): Brother Sallow's trail from Fenwick toward the reed isles. Objects only. */
const sallowTrail: OverlayDef = {
  id: 'overlay:sallow-trail',
  origin: [1260, 1086],
  size: [36, 30],
  encoding: 'ops',
  ops: [],
  objects: [
    { id: 'obj:sallow-trail-1', kind: 'interactable', at: [6, 6], props: { name: 'Reed-priest’s tracks', label: 'Examine' } },
    { id: 'obj:sallow-trail-2', kind: 'interactable', at: [18, 14], props: { name: 'Torn prayer-ribbon', label: 'Examine' } },
    { id: 'obj:sallow-trail-3', kind: 'interactable', at: [28, 24], props: { name: 'Fresh ashes', label: 'Examine' } },
  ],
};

/** The Black Seep: anchors for Nhal and the Act III heart (quest:the-breach). Objects only. */
const blackSeep: OverlayDef = {
  id: 'overlay:black-seep',
  origin: [1324, 1068],
  size: [40, 42],
  encoding: 'ops',
  ops: [],
  // The Breach (Act II–III): at world.mire_level 4 the seep tears open into the Hollow Sea.
  variants: [{
    when: { flag: 'world.mire_level', op: '>=', value: 4 },
    ops: [
      { op: 'ellipse', layer: 'ground', rect: [0, 0, 40, 42], tile: T.MIRE },
      { op: 'ellipse', layer: 'deco', rect: [0, 0, 40, 42], tile: -1 },
      { op: 'scatter', rect: [0, 0, 40, 42], ellipse: true, tiles: [T.DEAD_TREE, T.REEDS], density: 0.06, seed: 271 },
      { op: 'ellipse', layer: 'detail', rect: [14, 14, 12, 12], tile: T.LEY_VEIN },
    ],
  }],
  objects: [
    anchor('black-seep', [20, 33]),
    { id: 'obj:black-seep-heart', kind: 'interactable', at: [20, 20], props: { name: 'The heart of the Seep', label: 'Reach in' } },
  ],
};

const greywater: RegionDef = {
  id: 'region:greywater-marsh',
  name: 'Greywater Marsh',
  description: 'Fens and reed-sea east of Aldermoor, where the Mire seeps worst; drowned Varn and the Drowned Choir.',
  tier: 2,
  innerTierBonus: 0.5,
  layoutCode: 'G',
  biome: 'marsh',
  frost: 0.2,
  mapColor: 0x48563a,
  faction: 'faction:drowned-choir',
  gate: { flag: 'prologue.complete' },
  overlays: ['overlay:varn', 'overlay:fenwick-stilts', 'overlay:reed-temple-isle', 'overlay:tobins-reeds', 'overlay:black-seep', 'overlay:sallow-trail'],
  landmarks: [
    lm('varn-causeway-end', 'End of the Causeway', [1156, 994], 'poi', 7),
    lm('varn-gates', 'The Gates of Varn', [1163, 990], 'ruin', 8),
    lm('fenwick-stilts', 'Fenwick', [1250, 1076], 'village', 10),
    lm('black-seep', 'The Black Seep', [1344, 1088], 'poi', 10),
    lm('tobins-reeds', "Tobin's Reeds", [1220, 1029], 'poi', 6),
  ],
  // The Mire spreads as world.mire_level rises (Claude 4 raises it across the acts).
  seeps: [
    { id: 'seep:black-seep', at: [1344, 1088], radius: 6, minLevel: 0, spawnTable: 'spawn:black-seep' },
    { id: 'seep:greywater-north', at: [1220, 860], radius: 3, minLevel: 1, spawnTable: 'spawn:black-seep' },
    { id: 'seep:greywater-reeds', at: [1300, 960], radius: 4, minLevel: 2, spawnTable: 'spawn:black-seep' },
    { id: 'seep:fenwick-edge', at: [1270, 1110], radius: 3, minLevel: 3 },
    { id: 'seep:greywater-east', at: [1390, 1000], radius: 5, minLevel: 3, spawnTable: 'spawn:black-seep' },
    { id: 'seep:varn-moat', at: [1200, 1040], radius: 3, minLevel: 4, spawnTable: 'spawn:black-seep' },
    { id: 'seep:causeway', at: [1110, 1000], radius: 3, minLevel: 4 },
  ],
  spawnZones: [
    { id: 'zone:varn-causeway', table: 'spawn:varn-causeway', area: { x: 1110, y: 990, w: 50, h: 30 }, maxAlive: 3, respawnSec: 240, leash: 18, when: { not: ASSAULT } },
    { id: 'zone:reed-isles', table: 'spawn:reed-isles', area: { x: 1270, y: 1090, w: 60, h: 50 }, maxAlive: 4, respawnSec: 240, leash: 20 },
    { id: 'zone:greywater-fens', table: 'spawn:greywater-fens', area: { x: 1180, y: 800, w: 200, h: 180 }, maxAlive: 4, respawnSec: 200, leash: 20 },
  ],
};

export default [greywater, varn, fenwick, reedTemple, tobinsReeds, blackSeep, sallowTrail];
