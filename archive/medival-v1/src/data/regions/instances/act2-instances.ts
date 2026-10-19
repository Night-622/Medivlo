/**
 * Act II instances (Claude 4: 11-act2-spec). Instance-local coords. Boss arenas are ~12×12; boss-zone clears set
 * `world.cleared.<zoneId>`, which reveals each Ember.
 */
import type { WorldObject } from '@/core';
import { T } from '@/world/tiles';
import type { InstanceDef, OverlayDef } from '@/world/types';
import { anchor, fire, interior, lm, table } from '../_builders';

const stairs = (inst: string, id: string, at: [number, number], floor: string, entrance: string, label: string): WorldObject =>
  ({ id, kind: 'door', at, props: { target: inst, floor, entrance, label } });
const exit = (id: string, at: [number, number], label = 'Leave'): WorldObject => ({ id, kind: 'door', at, props: { target: 'overworld', label } });
const floorOverlay = (id: string, w: number, h: number, ops: OverlayDef['ops'], objects: WorldObject[], variants?: OverlayDef['variants']): OverlayDef =>
  ({ id: `overlay:${id}`, origin: [0, 0], size: [w, h], encoding: 'ops', ops, objects, variants });

// ---------------------------------------------------------------- Cathedral of the Brand (Solenne)
const CATH = 'instance:cathedral-of-the-brand';
const cathedral = floorOverlay('cathedral-of-the-brand', 44, 34, [
  { op: 'fill', layer: 'ground', rect: [2, 2, 40, 30], tile: T.STONE_FLOOR },
  { op: 'frame', layer: 'deco', thickness: 2, jitter: 0, tile: T.WALL_STONE },
  { op: 'fill', layer: 'deco', rect: [29, 2, 1, 20], tile: T.WALL_STONE },
  { op: 'fill', layer: 'deco', rect: [29, 10, 1, 2], tile: T.DOOR },
  { op: 'fill', layer: 'deco', rect: [13, 3, 4, 2], tile: T.ALTAR },
  { op: 'ellipse', layer: 'detail', rect: [10, 2, 10, 6], tile: T.ASH },
  table(5, 12, 7), table(18, 12, 7), table(5, 16, 7), table(18, 16, 7), table(5, 20, 7), table(18, 20, 7),
  { op: 'fill', layer: 'deco', rect: [30, 22, 12, 1], tile: T.WALL_STONE },
  { op: 'fill', layer: 'deco', rect: [35, 22, 2, 1], tile: T.DOOR },
  { op: 'fill', layer: 'deco', rect: [3, 24, 8, 1], tile: T.WALL_STONE },
  { op: 'fill', layer: 'deco', rect: [10, 24, 1, 7], tile: T.WALL_STONE },
  { op: 'fill', layer: 'deco', rect: [10, 27, 1, 2], tile: T.DOOR },
], [
  exit('obj:cathedral-of-the-brand-exit', [22, 31]),
  { id: 'obj:dead-brand', kind: 'interactable', at: [15, 5], props: { name: 'The dead Brand', label: 'Look upon' } },
  { id: 'obj:suspect-ottavia-desk', kind: 'interactable', at: [6, 27], props: { name: 'Deacon Ottavia’s desk', label: 'Search' } },
  { id: 'obj:suspect-caius-cell', kind: 'interactable', at: [3, 29], props: { name: 'Brother Caius’s cell', label: 'Search' } },
  { id: 'obj:ysolde-journal', kind: 'interactable', at: [38, 4], props: { name: 'A worn journal', label: 'Read' } },
  { id: 'obj:suspect-ilse-reliquary', kind: 'interactable', at: [32, 4], props: { name: 'Sister Ilse’s reliquary', label: 'Search' } },
  anchor('cathedral-of-the-brand', [22, 9]),
  anchor('keepers-quarters', [35, 8]),
  stairs(CATH, 'obj:undercroft-door', [39, 29], 'undercroft', 'main', 'Descend to the undercroft'),
]);
// Companion quest (Hesta, quest:the-snuffed-candles): the Emberwarden archive under the cathedral.
const undercroft = floorOverlay('cathedral-undercroft', 28, 18, [
  { op: 'fill', layer: 'ground', rect: [2, 2, 24, 14], tile: T.STONE_FLOOR },
  { op: 'frame', layer: 'deco', thickness: 2, jitter: 0, tile: T.WALL_STONE },
  { op: 'scatter', rect: [3, 9, 22, 6], tiles: [T.GRAVE], density: 0.08, seed: 281 },
], [
  stairs(CATH, 'obj:cathedral-undercroft-up', [24, 14], 'f1', 'from-undercroft', 'Ascend'),
  { id: 'obj:warden-archive-chest-1', kind: 'interactable', at: [5, 4], props: { name: 'Emberwarden archive chest', label: 'Open' } },
  { id: 'obj:warden-archive-chest-2', kind: 'interactable', at: [13, 4], props: { name: 'Emberwarden archive chest', label: 'Open' } },
  { id: 'obj:warden-archive-chest-3', kind: 'interactable', at: [21, 4], props: { name: 'Emberwarden archive chest', label: 'Open' } },
]);
const cathedralInst: InstanceDef = {
  id: CATH, kind: 'interior', name: 'Cathedral of the Brand', tier: 3, biome: 'interior', exit: [580, 1211],
  floors: [{
    id: 'f1', overlay: 'overlay:cathedral-of-the-brand', entrances: { main: [22, 29], 'from-undercroft': [38, 28] }, spawnZones: [],
    landmarks: [lm('cathedral-of-the-brand', 'Cathedral of the Brand', [15, 9], 'shrine', 9), lm('keepers-quarters', 'The Keepers’ Quarters', [35, 8], 'poi', 5)],
  }, { id: 'undercroft', overlay: 'overlay:cathedral-undercroft', entrances: { main: [23, 13] }, spawnZones: [] }],
};

const court = interior('hierophant-court', 'The Hierophant’s Court', 24, 18, [561, 1237], {
  floor: T.STONE_FLOOR, wall: T.WALL_STONE, tier: 3,
  ops: [{ op: 'fill', layer: 'deco', rect: [11, 2, 2, 1], tile: T.ALTAR }, table(4, 7, 5), table(15, 7, 5), { op: 'fill', layer: 'detail', rect: [11, 3, 2, 12], tile: T.FLOWERS }],
  objects: [anchor('hierophant-court', [12, 5])],
  landmarks: [lm('hierophant-court', 'The Hierophant’s Court', [12, 7], 'city', 7)],
});

// ---------------------------------------------------------------- Valcastre (the Inquisition)
const VAL = 'instance:valcastre';
const valHall = floorOverlay('valcastre-hall', 30, 24, [
  { op: 'fill', layer: 'ground', rect: [2, 2, 26, 20], tile: T.STONE_FLOOR },
  { op: 'frame', layer: 'deco', thickness: 2, jitter: 0, tile: T.WALL_STONE },
  { op: 'fill', layer: 'deco', rect: [8, 3, 1, 1], tile: T.BANNER_WICK },
  { op: 'fill', layer: 'deco', rect: [21, 3, 1, 1], tile: T.BANNER_WICK },
  table(6, 8, 6), table(18, 8, 6),
], [exit('obj:valcastre-exit', [15, 21]), stairs(VAL, 'obj:valcastre-cells-stairs', [26, 4], 'cells', 'main', 'Descend to the cells')]);
const valCells = floorOverlay('valcastre-cells', 32, 20, [
  { op: 'fill', layer: 'ground', rect: [2, 8, 28, 4], tile: T.STONE_FLOOR },
  ...[3, 9, 15, 21].flatMap((x) => [
    { op: 'fill' as const, layer: 'ground' as const, rect: [x, 2, 5, 5] as [number, number, number, number], tile: T.STONE_FLOOR },
    { op: 'fill' as const, layer: 'ground' as const, rect: [x, 13, 5, 5] as [number, number, number, number], tile: T.STONE_FLOOR },
    { op: 'fill' as const, layer: 'deco' as const, rect: [x, 7, 5, 1] as [number, number, number, number], tile: T.FENCE },
    { op: 'fill' as const, layer: 'deco' as const, rect: [x, 12, 5, 1] as [number, number, number, number], tile: T.FENCE },
  ]),
  { op: 'fill', layer: 'ground', rect: [27, 2, 3, 6], tile: T.STONE_FLOOR },
], [
  stairs(VAL, 'obj:valcastre-hall-stairs', [28, 3], 'hall', 'from-cells', 'Ascend'),
  { id: 'obj:valcastre-cell-door', kind: 'interactable', at: [11, 12], props: { name: 'Cell door', label: 'Open' } },
  anchor('valcastre-cells', [17, 10]),
]);
const valInst: InstanceDef = {
  id: VAL, kind: 'dungeon', name: 'Valcastre', tier: 3, biome: 'dungeon-ruin', exit: [832, 1323],
  floors: [
    { id: 'hall', overlay: 'overlay:valcastre-hall', entrances: { main: [15, 19], 'from-cells': [25, 5] },
      landmarks: [lm('valcastre', 'Valcastre', [15, 12], 'dungeon', 8)], spawnZones: [] },
    { id: 'cells', overlay: 'overlay:valcastre-cells', entrances: { main: [27, 5] },
      landmarks: [lm('valcastre-cells', 'The Cells of Valcastre', [16, 10], 'dungeon', 8)], spawnZones: [] },
  ],
};

// ---------------------------------------------------------------- Korrath-under-Stone (Orrun great hold)
const KOR = 'instance:korrath-under-stone';
const korHalls = floorOverlay('korrath-halls', 40, 30, [
  { op: 'fill', layer: 'ground', rect: [2, 2, 36, 26], tile: T.STONE_FLOOR },
  { op: 'frame', layer: 'deco', thickness: 2, jitter: 0, tile: T.WALL_STONE },
  { op: 'fill', layer: 'deco', rect: [18, 3, 4, 1], tile: T.ALTAR },
  { op: 'fill', layer: 'detail', rect: [19, 4, 2, 20], tile: T.LEY_VEIN },
  table(5, 8, 8), table(27, 8, 8), table(5, 14, 8), table(27, 14, 8),
], [
  exit('obj:korrath-exit', [20, 27]),
  stairs(KOR, 'obj:korrath-deeps-stairs', [36, 25], 'deeps', 'main', 'Descend to the deeps'),
  anchor('thane-hall', [20, 6]),
  { id: 'obj:new-nail-anvil', kind: 'interactable', at: [6, 4], props: { name: 'The great anvil', label: 'Examine' } },
  { id: 'obj:thane-runeforge', kind: 'interactable', at: [33, 4], props: { station: 'runeforge', name: 'the Thane’s runeforge', label: 'Work' } },
  fire('obj:korrath-hearth', [3, 25], 'Great hearth'),
]);
const korDeeps = floorOverlay('korrath-deeps', 36, 26, [
  { op: 'fill', layer: 'ground', rect: [2, 2, 32, 22], tile: T.ROCK_FLOOR },
  { op: 'frame', layer: 'deco', thickness: 2, jitter: 2, tile: T.TOR },
  { op: 'scatter', rect: [3, 3, 30, 20], tiles: [T.RUBBLE], density: 0.05, seed: 251 },
], [stairs(KOR, 'obj:korrath-halls-stairs', [33, 22], 'halls', 'from-deeps', 'Ascend')],
[{ when: { flag: 'act2.korrath_flooded' }, ops: [{ op: 'fill', layer: 'ground', rect: [2, 2, 26, 22], tile: T.SHALLOWS }, { op: 'ellipse', layer: 'ground', rect: [6, 6, 14, 12], tile: T.DEEP_WATER }] }]);
const korInst: InstanceDef = {
  id: KOR, kind: 'dungeon', name: 'Korrath-under-Stone', tier: 3, biome: 'dungeon-mine', exit: [960, 310],
  floors: [
    { id: 'halls', overlay: 'overlay:korrath-halls', entrances: { main: [20, 25], 'from-deeps': [35, 23] },
      landmarks: [lm('thane-hall', 'The Thane’s Hall', [20, 10], 'city', 9)], spawnZones: [] },
    { id: 'deeps', overlay: 'overlay:korrath-deeps', entrances: { main: [32, 21] }, spawnZones: [
      { id: 'zone:korrath-deeps', table: 'spawn:korrath-deeps', area: { x: 4, y: 4, w: 24, h: 16 }, maxAlive: 4, respawnSec: 600, leash: 18 },
    ] },
  ],
};

// ---------------------------------------------------------------- Vault of the Nine Nails
const vault = floorOverlay('vault-of-nine-nails', 36, 30, [
  { op: 'ellipse', layer: 'ground', rect: [2, 2, 32, 26], tile: T.STONE_FLOOR },
  { op: 'ellipse', layer: 'detail', rect: [8, 6, 20, 18], tile: T.LEY_VEIN },
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
    const a = (i / 9) * Math.PI * 2;
    return { op: 'fill' as const, layer: 'deco' as const, rect: [Math.round(18 + Math.cos(a) * 11), Math.round(15 + Math.sin(a) * 9), 1, 1] as [number, number, number, number], tile: T.STANDING_STONE };
  }),
], [
  exit('obj:vault-exit', [18, 26]),
  { id: 'obj:empty-socket', kind: 'interactable', at: [29, 15], props: { name: 'The empty socket', label: 'Examine' } },
  { id: 'obj:ember-of-the-deep', kind: 'interactable', at: [18, 15], when: { flag: 'world.cleared.zone:vault-guardian' }, props: { name: 'Ember of the Deep', label: 'Take' } },
  // Act III: the Heartforge gate beneath the Vault (Brannoch opens it).
  anchor('heartforge-gate', [6, 15]),
  { id: 'obj:heartforge-seal', kind: 'interactable', at: [6, 12], props: { name: 'The Heartforge seal', label: 'Examine' } },
  { id: 'obj:heartforge-gate-door', kind: 'door', at: [4, 14], when: { flag: 'act3.heartforge_unsealed' }, props: { target: 'instance:heartforge', floor: 'anvil', entrance: 'main', label: 'Descend into the Heartforge' } },
]);
const vaultInst: InstanceDef = {
  id: 'instance:vault-of-nine-nails', kind: 'dungeon', name: 'The Vault of the Nine Nails', tier: 3, biome: 'dungeon-ruin', exit: [1344, 314],
  floors: [{
    id: 'f1', overlay: 'overlay:vault-of-nine-nails', entrances: { main: [18, 24] },
    landmarks: [lm('vault-of-nine-nails', 'The Vault of the Nine Nails', [18, 18], 'dungeon', 9), lm('the-empty-socket', 'The Empty Socket', [28, 15], 'poi', 4), lm('heartforge-gate', 'The Heartforge Gate', [6, 14], 'dungeon', 5)],
    spawnZones: [{ id: 'zone:vault-guardian', table: 'spawn:vault-guardian', area: { x: 12, y: 9, w: 12, h: 12 }, maxAlive: 1, respawnSec: 0, leash: 14 }],
  }],
};

// ---------------------------------------------------------------- Skelvik Hall
const skelvikHall = interior('skelvik-hall', 'Skelvik Hall', 26, 16, [321, 189], {
  tier: 4, ops: [table(4, 5, 18), table(4, 10, 18), { op: 'fill', layer: 'deco', rect: [12, 2, 2, 1], tile: T.ALTAR }],
  objects: [anchor('skelvik-hall', [13, 4]), fire('obj:skelvik-longfire', [13, 8], 'Longfire')],
  landmarks: [lm('skelvik-hall', 'Skelvik Hall', [13, 7], 'city', 7)],
});

// ---------------------------------------------------------------- Gull Rock Hall (the Ember auction)
const GULL = 'instance:gull-rock-hall';
const gullHall = floorOverlay('gull-rock-hall', 32, 22, [
  { op: 'fill', layer: 'ground', rect: [2, 2, 28, 18], tile: T.WOOD_FLOOR },
  { op: 'frame', layer: 'deco', thickness: 2, jitter: 0, tile: T.WALL_STONE },
  table(6, 6, 6), table(20, 6, 6), table(6, 11, 6), table(20, 11, 6),
  { op: 'fill', layer: 'deco', rect: [14, 3, 4, 1], tile: T.STALL },
], [exit('obj:gull-rock-hall-exit', [16, 19]), stairs(GULL, 'obj:auction-vault-stairs', [28, 4], 'vault', 'main', 'Down to the vault'), anchor('gull-rock-hall', [16, 8])]);
const gullVault = floorOverlay('auction-vault', 20, 16, [
  { op: 'fill', layer: 'ground', rect: [2, 2, 16, 12], tile: T.STONE_FLOOR },
  { op: 'frame', layer: 'deco', thickness: 2, jitter: 0, tile: T.WALL_STONE },
  { op: 'fill', layer: 'deco', rect: [9, 3, 2, 1], tile: T.ALTAR },
], [
  stairs(GULL, 'obj:auction-vault-up', [16, 12], 'hall', 'from-vault', 'Back up'),
  { id: 'obj:auction-vault-lock', kind: 'interactable', at: [10, 5], props: { name: 'The vault lock', label: 'Examine' } },
]);
const gullInst: InstanceDef = {
  id: GULL, kind: 'interior', name: 'Gull Rock Hall', tier: 3, biome: 'interior', exit: [56, 439],
  floors: [
    { id: 'hall', overlay: 'overlay:gull-rock-hall', entrances: { main: [16, 17], 'from-vault': [27, 5] }, spawnZones: [],
      landmarks: [lm('gull-rock-hall', 'Gull Rock Hall', [16, 10], 'city', 8)] },
    { id: 'vault', overlay: 'overlay:auction-vault', entrances: { main: [15, 11] }, spawnZones: [],
      landmarks: [lm('auction-vault', 'The Auction Vault', [10, 8], 'poi', 6)] },
  ],
};

// ---------------------------------------------------------------- Ruins of Qadir (the Glass Throne)
const qadir = floorOverlay('ruins-of-qadir', 40, 34, [
  { op: 'fill', layer: 'ground', rect: [2, 2, 36, 30], tile: T.ASH },
  { op: 'frame', layer: 'deco', thickness: 2, jitter: 2, tile: T.WALL_STONE },
  { op: 'ellipse', layer: 'ground', rect: [12, 4, 16, 14], tile: T.ICE },
  { op: 'fill', layer: 'deco', rect: [19, 4, 2, 1], tile: T.ALTAR },
  { op: 'scatter', rect: [3, 18, 34, 12], tiles: [T.RUBBLE, T.DEAD_TREE], density: 0.05, seed: 261 },
], [
  exit('obj:ruins-of-qadir-exit', [20, 31]),
  anchor('glass-throne', [20, 7]),
  { id: 'obj:ember-of-the-glass', kind: 'interactable', at: [20, 5], when: { flag: 'world.cleared.zone:glass-throne-boss' }, props: { name: 'Ember of the Glass', label: 'Take' } },
  // Act III: the King's Stair beneath Qadir (the Qasiri way into the Heartforge).
  { id: 'obj:kings-stair-door', kind: 'door', at: [34, 6], when: { flag: 'act3.heartforge_unsealed' }, props: { target: 'instance:heartforge', floor: 'anvil', entrance: 'main', label: 'Descend the King’s Stair' } },
]);
const qadirInst: InstanceDef = {
  id: 'instance:ruins-of-qadir', kind: 'dungeon', name: 'The Ruins of Qadir', tier: 4, biome: 'dungeon-ruin', exit: [1719, 1087],
  floors: [{
    id: 'f1', overlay: 'overlay:ruins-of-qadir', entrances: { main: [20, 29] },
    landmarks: [lm('glass-throne', 'The Glass Throne', [20, 11], 'dungeon', 9), lm('kings-stair', 'The King’s Stair', [34, 7], 'dungeon', 5)],
    spawnZones: [
      { id: 'zone:qadir-ruins', table: 'spawn:cinder-flats', area: { x: 4, y: 18, w: 32, h: 10 }, maxAlive: 4, respawnSec: 0, leash: 16 },
      { id: 'zone:glass-throne-boss', table: 'spawn:ashwyrm', area: { x: 14, y: 5, w: 12, h: 12 }, maxAlive: 1, respawnSec: 0, leash: 16 },
    ],
  }],
};

export default [
  cathedral, undercroft, cathedralInst, ...court, valHall, valCells, valInst, korHalls, korDeeps, korInst,
  vault, vaultInst, ...skelvikHall, gullHall, gullVault, gullInst, qadir, qadirInst,
];
