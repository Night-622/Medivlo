/**
 * Act II "The Seven Embers" regions (Claude 4: 11-act2-spec): the Lantern Coast, the Ironspine, the Frostreach,
 * the Saltreach Isles, Sunscar and the Cinder Wastes. Positions are world tiles; overlays are overlay-local.
 */
import type { FlagCond, RegionDef, WorldObject } from '@/core';
import { T } from '@/world/tiles';
import type { OverlayDef, OverlayOp } from '@/world/types';
import { anchor, door, fire, lm, waystone } from './_builders';

const SHIP: FlagCond = { flag: 'act2.ship_passage' };
const house = (x: number, y: number, roof: number = T.ROOF_SLATE, wall: number = T.WALL_STONE): OverlayOp =>
  ({ op: 'building', rect: [x, y, 7, 6], wall, floor: T.STONE_FLOOR, roof, doorAt: 3 });
const ring = (cx: number, cy: number, r: number, n: number, tile: number = T.STANDING_STONE): OverlayOp[] => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * Math.PI * 2;
  return { op: 'fill', layer: 'deco', rect: [Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r * 0.8), 1, 1], tile } as OverlayOp;
});
const tents = (spots: [number, number][]): OverlayOp[] => spots.map(([x, y]) => ({ op: 'fill', layer: 'deco', rect: [x, y, 3, 2], tile: T.TENT }));
/** A boat object that ferries the player to another overworld tile. */
const boat = (id: string, at: [number, number], to: [number, number], name: string, when?: FlagCond): WorldObject =>
  ({ id, kind: 'door', at, when, props: { target: 'tp', toX: to[0], toY: to[1], name, label: 'Sail to' } });

// ================================================================ Lantern Coast
const solenne: OverlayDef = {
  id: 'overlay:solenne', origin: [548, 1188], size: [64, 56], encoding: 'ops', noScatter: true,
  ops: [
    { op: 'fill', layer: 'ground', rect: [2, 2, 60, 52], tile: T.SNOW, soft: true },
    { op: 'frame', layer: 'deco', thickness: 2, jitter: 0, tile: T.WALL_STONE, gaps: [{ side: 'e', at: 28, width: 4 }] },
    { op: 'fill', layer: 'ground', rect: [2, 26, 62, 5], tile: T.OLD_ROAD },
    { op: 'fill', layer: 'ground', rect: [28, 6, 8, 22], tile: T.OLD_ROAD },
    { op: 'building', rect: [20, 4, 24, 18], wall: T.WALL_STONE, floor: T.STONE_FLOOR, roof: T.ROOF_SLATE, doorAt: 12 },
    { op: 'building', rect: [4, 34, 18, 14], wall: T.WALL_STONE, floor: T.STONE_FLOOR, roof: T.ROOF_SLATE, doorAt: 9 },
    house(4, 6), house(4, 16), house(48, 6), house(48, 16), house(26, 36), house(36, 36), house(48, 36), house(26, 45), house(48, 45),
    { op: 'scatter', rect: [2, 2, 60, 52], tiles: [T.DRIFT], density: 0.04, seed: 201 },
    { op: 'collide', rect: [0, 0, 64, 56], bits: 64 },
  ],
  objects: [
    door('obj:cathedral-of-the-brand-door', [32, 21], 'instance:cathedral-of-the-brand', 'the Cathedral of the Brand'),
    door('obj:hierophant-court-door', [13, 47], 'instance:hierophant-court', 'the Hierophant’s Court'),
    waystone('solenne', [40, 29], 'Solenne'),
    fire('obj:solenne-brazier', [36, 25], 'Pilgrims’ brazier'),
  ],
};

const pilgrimCamp: OverlayDef = {
  id: 'overlay:pilgrim-camp', origin: [622, 1204], size: [18, 18], encoding: 'ops', noScatter: true,
  ops: [{ op: 'ellipse', layer: 'ground', rect: [0, 0, 18, 18], tile: T.MUD, soft: true }, ...tents([[2, 2], [10, 3], [3, 11], [11, 12]])],
  objects: [fire('obj:pilgrim-campfire', [9, 9]), anchor('pilgrim-camp', [7, 10])],
};

const valcastre: OverlayDef = {
  id: 'overlay:valcastre-crag', origin: [812, 1290], size: [40, 36], encoding: 'ops', noScatter: true,
  ops: [
    { op: 'ellipse', layer: 'deco', rect: [0, 0, 40, 36], tile: T.TOR },
    { op: 'ellipse', layer: 'deco', rect: [4, 4, 32, 28], tile: -1 },
    { op: 'ellipse', layer: 'ground', rect: [4, 4, 32, 28], tile: T.SNOW },
    { op: 'fill', layer: 'deco', rect: [18, 30, 4, 6], tile: -1 },
    { op: 'fill', layer: 'ground', rect: [18, 28, 4, 8], tile: T.OLD_ROAD },
    { op: 'building', rect: [10, 6, 20, 16], wall: T.WALL_STONE, floor: T.STONE_FLOOR, roof: T.ROOF_SLATE, doorAt: 10 },
    { op: 'fill', layer: 'deco', rect: [12, 23, 1, 1], tile: T.BANNER_WICK },
    { op: 'fill', layer: 'deco', rect: [27, 23, 1, 1], tile: T.BANNER_WICK },
  ],
  objects: [door('obj:valcastre-door', [20, 21], 'instance:valcastre', 'Valcastre')],
};

const lanternCoast: RegionDef = {
  id: 'region:lantern-coast', name: 'The Lantern Coast', tier: 3, innerTierBonus: 0.4, layoutCode: 'L',
  description: 'The warm imperial south, snowbound now: Solenne and its dark Cathedral of the Brand, and the Inquisition at Valcastre.',
  biome: 'coast', subBiomes: [{ biome: 'farmland', weight: 0.6 }, { biome: 'coast', weight: 0.4 }],
  frost: 0.6, mapColor: 0xd9c9a0, faction: 'faction:lanternate', gate: { flag: 'act1.complete' },
  overlays: ['overlay:solenne', 'overlay:pilgrim-camp', 'overlay:valcastre-crag'],
  landmarks: [
    lm('wick-tollgate', 'The Wick Toll-gate', [968, 1143], 'poi', 6),
    lm('solenne', 'Solenne', [580, 1216], 'city', 14),
    lm('solenne-gate', 'The Gate of Solenne', [614, 1216], 'poi', 6),
    lm('pilgrim-camp', 'The Pilgrim Camp', [631, 1214], 'camp', 7),
    lm('valcastre-crag', 'Valcastre', [832, 1314], 'dungeon', 10),
  ],
  spawnZones: [{ id: 'zone:lantern-roads', table: 'spawn:lantern-roads', area: { x: 640, y: 1170, w: 240, h: 120 }, maxAlive: 3, respawnSec: 240, leash: 20 }],
};

// ================================================================ The Ironspine
const korrathGate: OverlayDef = {
  id: 'overlay:korrath-under-stone', origin: [940, 290], size: [40, 32], encoding: 'ops', noScatter: true,
  ops: [
    { op: 'fill', layer: 'deco', rect: [0, 0, 40, 18], tile: T.TOR },
    { op: 'fill', layer: 'deco', rect: [12, 10, 16, 8], tile: T.WALL_STONE },
    { op: 'fill', layer: 'deco', rect: [18, 17, 4, 1], tile: T.DOOR },
    { op: 'fill', layer: 'ground', rect: [16, 18, 8, 14], tile: T.OLD_ROAD },
    { op: 'fill', layer: 'deco', rect: [14, 18, 1, 1], tile: T.BANNER_CROWN },
    { op: 'fill', layer: 'deco', rect: [25, 18, 1, 1], tile: T.BANNER_CROWN },
  ],
  objects: [door('obj:korrath-under-stone-door', [20, 18], 'instance:korrath-under-stone', 'Korrath-under-Stone'), waystone('korrath', [26, 22], 'Korrath-under-Stone')],
};

const nineNails: OverlayDef = {
  id: 'overlay:nine-nails-approach', origin: [1328, 300], size: [32, 28], encoding: 'ops', noScatter: true,
  ops: [
    { op: 'fill', layer: 'deco', rect: [0, 0, 32, 12], tile: T.TOR },
    { op: 'fill', layer: 'deco', rect: [10, 6, 12, 6], tile: T.WALL_STONE },
    { op: 'fill', layer: 'deco', rect: [14, 11, 4, 1], tile: T.DOOR },
    { op: 'ellipse', layer: 'detail', rect: [8, 12, 16, 10], tile: T.LEY_VEIN },
    ...ring(16, 18, 9, 9, T.STANDING_STONE),
  ],
  objects: [door('obj:vault-of-nine-nails-door', [16, 12], 'instance:vault-of-nine-nails', 'the Vault of the Nine Nails')],
};

const trueIronSeam: OverlayDef = {
  id: 'overlay:true-iron-seam', origin: [1140, 366], size: [24, 18], encoding: 'ops', noScatter: true,
  ops: [
    { op: 'fill', layer: 'deco', rect: [0, 0, 24, 6], tile: T.TOR },
    { op: 'fill', layer: 'ground', rect: [0, 6, 24, 12], tile: T.ROCK_FLOOR },
    { op: 'fill', layer: 'detail', rect: [2, 5, 20, 1], tile: T.LEY_VEIN },
  ],
  objects: [
    { id: 'obj:true-iron-vein-1', kind: 'interactable', at: [5, 6], props: { name: 'True-iron vein', label: 'Mine' } },
    { id: 'obj:true-iron-vein-2', kind: 'interactable', at: [12, 6], props: { name: 'True-iron vein', label: 'Mine' } },
    { id: 'obj:true-iron-vein-3', kind: 'interactable', at: [19, 6], props: { name: 'True-iron vein', label: 'Mine' } },
  ],
};

const northPassCamp: OverlayDef = {
  id: 'overlay:north-pass-camp', origin: [694, 266], size: [20, 18], encoding: 'ops', noScatter: true,
  ops: [{ op: 'ellipse', layer: 'ground', rect: [0, 0, 20, 18], tile: T.SNOW, soft: true }, ...tents([[2, 2], [12, 2], [3, 11]])],
  objects: [fire('obj:north-pass-fire', [10, 9], 'Hrothi fire'), anchor('north-pass-camp', [8, 11])],
};

const ironspine: RegionDef = {
  id: 'region:ironspine', name: 'The Ironspine', tier: 3, innerTierBonus: 0.6, layoutCode: 'I',
  description: 'The Spine of Orr: the Orrun great hold Korrath-under-Stone and the Vault of the Nine Nails that pin the Mire down.',
  biome: 'alpine', frost: 0.7, mapColor: 0x77736a, faction: 'faction:iron-concord', gate: { flag: 'act1.korrath_gate_open' },
  overlays: ['overlay:korrath-under-stone', 'overlay:nine-nails-approach', 'overlay:true-iron-seam', 'overlay:north-pass-camp'],
  landmarks: [
    lm('korrath-under-stone', 'Korrath-under-Stone', [960, 314], 'city', 12),
    lm('nine-nails-approach', 'The Nine Nails', [1344, 318], 'dungeon', 10),
    lm('true-iron-seam', 'The True-Iron Seam', [1152, 374], 'poi', 7),
    lm('north-pass-camp', 'North Pass Camp', [703, 276], 'camp', 8),
  ],
  spawnZones: [
    { id: 'zone:ironspine-heights', table: 'spawn:ironspine-heights', area: { x: 1000, y: 300, w: 300, h: 150 }, maxAlive: 4, respawnSec: 240, leash: 22 },
    { id: 'zone:north-pass', table: 'spawn:north-pass', area: { x: 680, y: 260, w: 200, h: 120 }, maxAlive: 3, respawnSec: 240, leash: 22 },
  ],
};

// ================================================================ The Frostreach
const skelvik: OverlayDef = {
  id: 'overlay:skelvik', origin: [296, 170], size: [48, 40], encoding: 'ops', noScatter: true,
  ops: [
    { op: 'fill', layer: 'ground', rect: [0, 0, 48, 40], tile: T.SNOW, soft: true },
    { op: 'building', rect: [16, 6, 18, 12], wall: T.WALL_WOOD, floor: T.WOOD_FLOOR, roof: T.ROOF_THATCH, doorAt: 9 },
    house(3, 4, T.ROOF_THATCH, T.WALL_WOOD), house(38, 4, T.ROOF_THATCH, T.WALL_WOOD), house(3, 24, T.ROOF_THATCH, T.WALL_WOOD), house(38, 24, T.ROOF_THATCH, T.WALL_WOOD),
    { op: 'fill', layer: 'ground', rect: [22, 18, 4, 22], tile: T.DIRT },
    { op: 'scatter', rect: [0, 0, 48, 40], tiles: [T.DRIFT], density: 0.05, seed: 211 },
  ],
  objects: [
    door('obj:skelvik-hall-door', [25, 17], 'instance:skelvik-hall', 'Skelvik Hall'),
    waystone('skelvik', [29, 22], 'Skelvik'),
    anchor('skelvik', [21, 21]),
    fire('obj:skelvik-firepit', [20, 24], 'Longfire'),
  ],
};

const wolfMoot: OverlayDef = {
  id: 'overlay:wolf-moot-stones', origin: [1202, 76], size: [28, 26], encoding: 'ops', noScatter: true,
  ops: [{ op: 'ellipse', layer: 'ground', rect: [0, 0, 28, 26], tile: T.SNOW, soft: true }, ...ring(14, 13, 10, 12), { op: 'fill', layer: 'deco', rect: [13, 12, 2, 1], tile: T.ALTAR }],
  objects: [{ id: 'obj:wolf-ember-shrine', kind: 'interactable', at: [14, 11], props: { name: 'The wolf-shrine', label: 'Examine' } }, anchor('wolf-moot-stones', [14, 16])],
};

const frostreach: RegionDef = {
  id: 'region:frostreach', name: 'The Frostreach', tier: 4, innerTierBonus: 0.5, layoutCode: 'F',
  description: 'Tundra and fjords beyond the Ironspine, where the Long Winter is worst: the Hrothi clans, Skelvik, the Wolf-Moot.',
  biome: 'tundra', subBiomes: [{ biome: 'tundra', weight: 0.7 }, { biome: 'glacier', weight: 0.3 }],
  frost: 0.9, mapColor: 0xdfe6ea, faction: 'faction:wolf-moot', gate: { flag: 'act2.northpass_open' },
  overlays: ['overlay:skelvik', 'overlay:wolf-moot-stones'],
  landmarks: [lm('skelvik', 'Skelvik', [320, 192], 'city', 12), lm('wolf-moot-stones', 'The Wolf-Moot', [1216, 89], 'shrine', 10)],
  spawnZones: [{ id: 'zone:frostreach-wilds', table: 'spawn:frostreach-wilds', area: { x: 400, y: 60, w: 700, h: 180 }, maxAlive: 4, respawnSec: 240, leash: 24 }],
};

// ================================================================ The Saltreach Isles (reached only by ship)
const gullRock: OverlayDef = {
  id: 'overlay:gull-rock', origin: [36, 416], size: [48, 40], encoding: 'ops', noScatter: true,
  ops: [
    { op: 'ellipse', layer: 'ground', rect: [0, 0, 44, 40], tile: T.SAND },
    { op: 'ellipse', layer: 'ground', rect: [4, 4, 36, 32], tile: T.GRASS },
    { op: 'building', rect: [10, 8, 20, 14], wall: T.WALL_STONE, floor: T.WOOD_FLOOR, roof: T.ROOF_SLATE, doorAt: 10 },
    { op: 'fill', layer: 'ground', rect: [20, 22, 3, 8], tile: T.OLD_ROAD },
    { op: 'fill', layer: 'ground', rect: [36, 26, 12, 3], tile: T.BRIDGE },
    { op: 'fill', layer: 'deco', rect: [9, 23, 1, 1], tile: T.BANNER_PROTECTOR },
  ],
  objects: [
    door('obj:gull-rock-hall-door', [20, 21], 'instance:gull-rock-hall', 'Gull Rock Hall'),
    boat('obj:gull-rock-ferry', [46, 27], [268, 827], 'Brackhaven'),
    boat('obj:tide-temple-boat', [38, 30], [72, 892], 'the drowned tide-temple'),
    waystone('gull-rock', [24, 28], 'Gull Rock'),
  ],
};

const tideTemple: OverlayDef = {
  id: 'overlay:drowned-tide-temple', origin: [44, 860], size: [40, 36], encoding: 'ops', noScatter: true,
  ops: [
    { op: 'ellipse', layer: 'ground', rect: [0, 0, 40, 36], tile: T.SAND },
    { op: 'ellipse', layer: 'ground', rect: [8, 4, 24, 20], tile: T.SHALLOWS },
    { op: 'building', rect: [12, 6, 16, 12], wall: T.WALL_STONE, floor: T.SHALLOWS, roof: -1, doorAt: 8 },
    { op: 'scatter', rect: [4, 2, 32, 30], tiles: [T.RUBBLE, T.REEDS], density: 0.05, seed: 221 },
    { op: 'fill', layer: 'ground', rect: [26, 30, 10, 3], tile: T.BRIDGE },
  ],
  objects: [boat('obj:tide-temple-return', [30, 31], [82, 444], 'Gull Rock'), anchor('drowned-tide-temple', [20, 22])],
};

const isles: RegionDef = {
  id: 'region:saltreach-isles', name: 'The Saltreach Isles', tier: 3, innerTierBonus: 0.4, layoutCode: 'P',
  description: 'Storm-wracked isles of the corsair Salt League: Gull Rock, where Embers are sold, and the drowned tide-temples of Saela.',
  biome: 'island', frost: 0.25, mapColor: 0x6a8a6a, faction: 'faction:salt-league', gate: SHIP,
  overlays: ['overlay:gull-rock', 'overlay:drowned-tide-temple'],
  landmarks: [lm('gull-rock', 'Gull Rock', [58, 436], 'city', 12), lm('drowned-tide-temple', 'The Drowned Tide-Temple', [64, 874], 'ruin', 10)],
  spawnZones: [{ id: 'zone:tide-temple', table: 'spawn:tide-temple', area: { x: 50, y: 862, w: 30, h: 26 }, maxAlive: 3, respawnSec: 300, leash: 16 }],
};

// ================================================================ Sunscar
const zahrun: OverlayDef = {
  id: 'overlay:zahrun', origin: [1064, 1320], size: [48, 44], encoding: 'ops', noScatter: true,
  ops: [
    { op: 'ellipse', layer: 'ground', rect: [0, 0, 48, 44], tile: T.SAND, soft: true },
    { op: 'ellipse', layer: 'ground', rect: [16, 14, 16, 14], tile: T.SHALLOWS },
    { op: 'ellipse', layer: 'ground', rect: [19, 17, 10, 8], tile: T.DEEP_WATER },
    { op: 'scatter', rect: [12, 10, 24, 22], ellipse: true, tiles: [T.PINE, T.BUSH], density: 0.12, seed: 231 },
    house(4, 4, T.ROOF_THATCH, T.WALL_STONE), house(12, 2, T.ROOF_THATCH, T.WALL_STONE), house(30, 2, T.ROOF_THATCH, T.WALL_STONE),
    house(38, 6, T.ROOF_THATCH, T.WALL_STONE), house(4, 32, T.ROOF_THATCH, T.WALL_STONE), house(36, 32, T.ROOF_THATCH, T.WALL_STONE),
    ...tents([[8, 20], [36, 20], [20, 36]]),
  ],
  objects: [anchor('zahrun', [24, 31]), waystone('zahrun', [28, 33], 'Zahrun'), fire('obj:zahrun-hearth', [16, 34], 'Caravan hearth')],
};

const cindermotherTent: OverlayDef = {
  id: 'overlay:cindermother-tent', origin: [1198, 1280], size: [20, 18], encoding: 'ops', noScatter: true,
  ops: [
    { op: 'ellipse', layer: 'ground', rect: [0, 0, 20, 18], tile: T.SAND, soft: true },
    { op: 'fill', layer: 'deco', rect: [5, 3, 10, 6], tile: T.TENT },
    { op: 'fill', layer: 'detail', rect: [8, 10, 4, 2], tile: T.LEY_VEIN },
  ],
  objects: [anchor('cindermother-tent', [10, 11]), fire('obj:cindermother-fire', [14, 12], 'Oracle-fire')],
};

const sunscar: RegionDef = {
  id: 'region:sunscar', name: 'Sunscar', tier: 3, innerTierBonus: 0.5, layoutCode: 'U',
  description: 'Southern dunes and red canyons of the Qasiri caravans; the oasis-city Zahrun and the Cindermother’s tent.',
  biome: 'desert', subBiomes: [{ biome: 'desert', weight: 0.6 }, { biome: 'canyon', weight: 0.4 }],
  frost: 0.15, mapColor: 0xc98a4e, faction: 'faction:qasiri',
  overlays: ['overlay:zahrun', 'overlay:cindermother-tent'],
  landmarks: [lm('zahrun', 'Zahrun', [1088, 1344], 'city', 14), lm('cindermother-tent', 'The Cindermother’s Tent', [1208, 1291], 'shrine', 7)],
  spawnZones: [{ id: 'zone:sunscar-dunes', table: 'spawn:sunscar-dunes', area: { x: 920, y: 1170, w: 460, h: 200 }, maxAlive: 4, respawnSec: 240, leash: 22 }],
};

// ================================================================ The Cinder Wastes
const qadirGates: OverlayDef = {
  id: 'overlay:qadir-gates', origin: [1696, 1064], size: [44, 40], encoding: 'ops', noScatter: true,
  ops: [
    { op: 'fill', layer: 'ground', rect: [0, 0, 44, 40], tile: T.ASH, soft: true },
    { op: 'frame', layer: 'deco', thickness: 2, jitter: 3, tile: T.WALL_STONE, gaps: [{ side: 'w', at: 24, width: 4 }] },
    { op: 'building', rect: [14, 8, 18, 14], wall: T.WALL_STONE, floor: T.STONE_FLOOR, roof: -1, doorAt: 9 },
    { op: 'scatter', rect: [2, 2, 40, 36], tiles: [T.RUBBLE, T.DEAD_TREE], density: 0.06, seed: 241 },
    { op: 'fill', layer: 'ground', rect: [0, 22, 24, 5], tile: T.OLD_ROAD },
  ],
  objects: [door('obj:ruins-of-qadir-door', [23, 21], 'instance:ruins-of-qadir', 'the Ruins of Qadir')],
};

const ashenCamp: OverlayDef = {
  id: 'overlay:ashen-creed-camp', origin: [1590, 1170], size: [20, 18], encoding: 'ops', noScatter: true,
  ops: [{ op: 'ellipse', layer: 'ground', rect: [0, 0, 20, 18], tile: T.ASH, soft: true }, ...tents([[2, 2], [12, 3], [6, 11]])],
  objects: [anchor('ashen-creed-camp', [10, 9]), fire('obj:ashen-creed-fire', [14, 10], 'Creed fire')],
};

const cinderWastes: RegionDef = {
  id: 'region:cinder-wastes', name: 'The Cinder Wastes', tier: 4, innerTierBonus: 0.5, layoutCode: 'C',
  description: 'Black dunes and glass flats burned by the Ashen Kings of Qadir; the Ashen Creed hides among the ruins.',
  biome: 'ash-desert', frost: 0.1, mapColor: 0x4a4644, faction: 'faction:ashen-creed', gate: { flag: 'act2.ashroad_known' },
  overlays: ['overlay:qadir-gates', 'overlay:ashen-creed-camp'],
  landmarks: [
    lm('ash-road-end', 'End of the Ash Road', [1690, 1090], 'poi', 8),
    lm('qadir-gates', 'The Gates of Qadir', [1698, 1088], 'ruin', 8),
    lm('ruins-of-qadir', 'Ruins of Qadir', [1718, 1078], 'dungeon', 12),
    lm('ashen-creed-camp', 'Ashen Creed Camp', [1600, 1179], 'camp', 8),
  ],
  spawnZones: [{ id: 'zone:cinder-flats', table: 'spawn:cinder-flats', area: { x: 1420, y: 1000, w: 300, h: 200 }, maxAlive: 4, respawnSec: 240, leash: 22 }],
};

export default [
  lanternCoast, solenne, pilgrimCamp, valcastre,
  ironspine, korrathGate, nineNails, trueIronSeam, northPassCamp,
  frostreach, skelvik, wolfMoot,
  isles, gullRock, tideTemple,
  sunscar, zahrun, cindermotherTent,
  cinderWastes, qadirGates, ashenCamp,
];
