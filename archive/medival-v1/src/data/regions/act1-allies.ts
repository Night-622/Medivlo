/**
 * Act I Chapter 2 "Allies in the Cold" regions (Claude 4: 10-act1-spec): the Witherdowns, the Ironspine
 * Foothills, the Saltreach Coast and Ylwen Deepwood. Positions are world tiles; overlays are overlay-local.
 */
import type { RegionDef } from '@/core';
import { T } from '@/world/tiles';
import type { OverlayDef, OverlayOp } from '@/world/types';
import { anchor, door, fire, lm, waystone } from './_builders';

const KORRATH_OPEN = { flag: 'act1.korrath_gate_open' };
const house = (x: number, y: number, roof: number = T.ROOF_THATCH): OverlayOp =>
  ({ op: 'building', rect: [x, y, 7, 6], wall: T.WALL_WOOD, floor: T.WOOD_FLOOR, roof, doorAt: 3 });
const stones = (cx: number, cy: number, r: number, n: number): OverlayOp[] => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * Math.PI * 2;
  return { op: 'fill', layer: 'deco', rect: [Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r * 0.8), 1, 1], tile: T.STANDING_STONE } as OverlayOp;
});

// ---------------------------------------------------------------- Witherdowns
const ossuary: OverlayDef = {
  id: 'overlay:ossuary-grounds', origin: [560, 1072], size: [32, 28], encoding: 'ops', noScatter: true,
  ops: [
    { op: 'ellipse', layer: 'ground', rect: [0, 0, 32, 28], tile: T.GRASS, soft: true },
    { op: 'building', rect: [8, 4, 16, 12], wall: T.WALL_STONE, floor: T.STONE_FLOOR, roof: T.ROOF_SLATE, doorAt: 8 },
    { op: 'scatter', rect: [2, 16, 28, 10], tiles: [T.GRAVE], density: 0.12, seed: 121 },
    { op: 'fill', layer: 'ground', rect: [15, 16, 3, 12], tile: T.OLD_ROAD },
  ],
  objects: [
    door('obj:ossuary-door', [16, 15], 'instance:ossuary-of-saint-calder', 'the Ossuary'),
    anchor('ossuary-of-saint-calder', [13, 18]),
    fire('obj:ossuary-lamp', [19, 18], 'Grey lamp'),
    waystone('ossuary', [24, 22], 'Ossuary of Saint Calder'),
  ],
};

const kingBarrows: OverlayDef = {
  id: 'overlay:king-barrows', origin: [432, 944], size: [32, 28], encoding: 'ops', noScatter: true,
  ops: [
    { op: 'ellipse', layer: 'ground', rect: [0, 0, 32, 28], tile: T.GRASS, soft: true },
    { op: 'ellipse', layer: 'deco', rect: [9, 4, 14, 14], tile: T.TOR },
    { op: 'fill', layer: 'deco', rect: [15, 16, 2, 3], tile: -1 },
    { op: 'fill', layer: 'ground', rect: [15, 16, 2, 10], tile: T.OLD_ROAD },
    { op: 'ellipse', layer: 'deco', rect: [1, 2, 6, 5], tile: T.TOR },
    { op: 'ellipse', layer: 'deco', rect: [25, 3, 6, 5], tile: T.TOR },
    { op: 'ellipse', layer: 'deco', rect: [3, 19, 6, 5], tile: T.TOR },
    ...stones(16, 14, 13, 10),
  ],
  objects: [door('obj:king-barrows-door', [16, 17], 'instance:king-barrows', 'the King-Barrows')],
};

const witherdowns: RegionDef = {
  id: 'region:witherdowns', name: 'The Witherdowns', tier: 2, innerTierBonus: 0.5, layoutCode: 'W',
  description: 'Chalk barrow-downs of the old Haldish kings, kept by the Grey Monks of Morrow; the dead are restless.',
  biome: 'downs', frost: 0.35, mapColor: 0x7d8a5a,
  overlays: ['overlay:ossuary-grounds', 'overlay:king-barrows'],
  landmarks: [
    lm('ossuary-of-saint-calder', 'Ossuary of Saint Calder', [576, 1090], 'shrine', 9),
    lm('king-barrows', 'The King-Barrows', [448, 966], 'dungeon', 10),
  ],
  spawnZones: [
    { id: 'zone:barrow-downs', table: 'spawn:barrow-downs', area: { x: 404, y: 920, w: 90, h: 80 }, maxAlive: 3, respawnSec: 240, leash: 18 },
    { id: 'zone:witherdowns-wolves', table: 'spawn:kingsvale-fields', area: { x: 520, y: 960, w: 200, h: 160 }, maxAlive: 3, respawnSec: 200, leash: 20 },
  ],
};

// ---------------------------------------------------------------- Ironspine Foothills
const dunKorrath: OverlayDef = {
  id: 'overlay:dun-korrath-gate', origin: [936, 512], size: [48, 44], encoding: 'ops', noScatter: true,
  ops: [
    { op: 'fill', layer: 'ground', rect: [0, 0, 48, 44], tile: T.ROCK_FLOOR, soft: true },
    { op: 'fill', layer: 'deco', rect: [0, 0, 48, 10], tile: T.TOR },
    { op: 'fill', layer: 'deco', rect: [16, 6, 16, 4], tile: T.WALL_STONE },
    { op: 'fill', layer: 'deco', rect: [22, 9, 4, 1], tile: T.DOOR },
    { op: 'fill', layer: 'ground', rect: [22, 10, 4, 34], tile: T.OLD_ROAD },
    { op: 'building', rect: [4, 14, 12, 9], wall: T.WALL_STONE, floor: T.STONE_FLOOR, roof: T.ROOF_SLATE, doorAt: 6 },
    { op: 'building', rect: [32, 14, 12, 9], wall: T.WALL_STONE, floor: T.STONE_FLOOR, roof: T.ROOF_SLATE, doorAt: 6 },
    { op: 'building', rect: [4, 28, 10, 8], wall: T.WALL_STONE, floor: T.STONE_FLOOR, roof: T.ROOF_SLATE, doorAt: 5 },
    { op: 'fill', layer: 'deco', rect: [32, 28, 3, 1], tile: T.STALL },
    { op: 'fill', layer: 'deco', rect: [38, 28, 3, 1], tile: T.STALL },
    { op: 'collide', rect: [0, 10, 48, 34], bits: 64 },
  ],
  objects: [
    anchor('dun-korrath-gate', [26, 13]),
    { id: 'obj:korrath-forge', kind: 'interactable', at: [30, 24], props: { station: 'forge', name: 'the Orrun forge', label: 'Work' } },
    { id: 'obj:korrath-runeforge', kind: 'interactable', at: [18, 24], props: { station: 'runeforge', name: 'the Orrun runeforge', label: 'Work' } },
    fire('obj:korrath-brazier', [24, 30], 'Gate brazier'),
    waystone('dun-korrath', [28, 32], 'Dun Korrath-Gate'),
  ],
  // The great door opens into the Ironspine once the Thane-Speaker allows it.
  variants: [{ when: KORRATH_OPEN, ops: [{ op: 'fill', layer: 'deco', rect: [22, 0, 4, 10], tile: -1 }, { op: 'fill', layer: 'ground', rect: [22, 0, 4, 10], tile: T.OLD_ROAD }] }],
};

const grimmasForge: OverlayDef = {
  id: 'overlay:grimmas-forge', origin: [1098, 578], size: [20, 16], encoding: 'ops', noScatter: true,
  ops: [
    { op: 'ellipse', layer: 'ground', rect: [0, 0, 20, 16], tile: T.ROCK_FLOOR, soft: true },
    { op: 'building', rect: [5, 2, 10, 7], wall: T.WALL_STONE, floor: T.STONE_FLOOR, roof: T.ROOF_SLATE, doorAt: 5 },
    { op: 'fill', layer: 'deco', rect: [16, 6, 1, 1], tile: T.ROCK },
  ],
  objects: [
    anchor('grimmas-forge', [9, 11], { not: { flag: 'act1.nails_kept' } }),
    { id: 'obj:grimmas-anvil', kind: 'interactable', at: [15, 10], props: { station: 'runeforge', name: "Grimma's runeforge", label: 'Work' } },
  ],
};

const nailShaft: OverlayDef = {
  id: 'overlay:old-nail-shaft', origin: [1188, 586], size: [18, 16], encoding: 'ops', noScatter: true,
  ops: [
    { op: 'ellipse', layer: 'deco', rect: [0, 0, 18, 12], tile: T.TOR },
    { op: 'fill', layer: 'deco', rect: [8, 8, 2, 4], tile: -1 },
    { op: 'fill', layer: 'ground', rect: [8, 8, 2, 8], tile: T.RUBBLE },
    { op: 'fill', layer: 'detail', rect: [4, 3, 1, 4], tile: T.LEY_VEIN },
  ],
  objects: [door('obj:old-nail-shaft-door', [8, 9], 'instance:old-nail-shaft', 'the Old Nail shaft', { label: 'Descend' })],
};

/** Companion quest (Grimma, quest:iron-remembers): an Orrin giant knelt in stone on the slope. */
const kneelingFather: OverlayDef = {
  id: 'overlay:kneeling-father', origin: [1038, 590], size: [22, 20], encoding: 'ops', noScatter: true,
  ops: [
    { op: 'ellipse', layer: 'ground', rect: [0, 0, 22, 20], tile: T.ROCK_FLOOR, soft: true },
    { op: 'ellipse', layer: 'deco', rect: [6, 2, 10, 10], tile: T.TOR },
    { op: 'fill', layer: 'deco', rect: [4, 10, 4, 3], tile: T.TOR },
    { op: 'fill', layer: 'deco', rect: [14, 10, 4, 3], tile: T.TOR },
    { op: 'fill', layer: 'detail', rect: [10, 12, 2, 4], tile: T.LEY_VEIN },
  ],
  objects: [{ id: 'obj:kneeling-father-heart', kind: 'interactable', at: [11, 12], props: { name: 'The Orrin’s chest-plate', label: 'Examine' } }],
};

const foothills: RegionDef = {
  id: 'region:ironspine-foothills', name: 'The Ironspine Foothills', tier: 2, innerTierBonus: 0.5, layoutCode: 'O',
  description: 'Mining towns and Orrin giant ruins on the southern slopes of the Spine of Orr; the Orrun trade-gate.',
  biome: 'plains', subBiomes: [{ biome: 'plains', weight: 0.55 }, { biome: 'alpine', weight: 0.45 }],
  frost: 0.45, mapColor: 0x6b665c, faction: 'faction:iron-concord',
  overlays: ['overlay:dun-korrath-gate', 'overlay:grimmas-forge', 'overlay:old-nail-shaft', 'overlay:kneeling-father'],
  landmarks: [
    lm('dun-korrath-gate', 'Dun Korrath-Gate', [960, 540], 'city', 12),
    lm('grimmas-forge', "Grimma's Forge", [1108, 589], 'poi', 7),
    lm('old-nail-shaft', 'The Old Nail Shaft', [1197, 599], 'dungeon', 7),
    lm('kneeling-father', 'The Kneeling Father', [1049, 606], 'ruin', 8),
  ],
  spawnZones: [
    { id: 'zone:kneeling-father', table: 'spawn:rust-wraiths', area: { x: 1034, y: 588, w: 30, h: 26 }, maxAlive: 2, respawnSec: 600, leash: 16 },
    { id: 'zone:nail-slopes', table: 'spawn:nail-slopes', area: { x: 1160, y: 560, w: 70, h: 70 }, maxAlive: 3, respawnSec: 240, leash: 18 },
    { id: 'zone:foothill-wolves', table: 'spawn:kingsvale-fields', area: { x: 700, y: 540, w: 220, h: 90 }, maxAlive: 3, respawnSec: 200, leash: 20 },
  ],
};

// ---------------------------------------------------------------- Saltreach Coast
const brackhaven: OverlayDef = {
  id: 'overlay:brackhaven', origin: [262, 800], size: [84, 56], encoding: 'ops', noScatter: true,
  ops: [
    { op: 'fill', layer: 'ground', rect: [30, 2, 52, 52], tile: T.SAND, soft: true },
    { op: 'fill', layer: 'ground', rect: [30, 24, 52, 4], tile: T.OLD_ROAD },
    { op: 'fill', layer: 'ground', rect: [54, 2, 4, 52], tile: T.OLD_ROAD },
    // Piers out into the sea.
    { op: 'fill', layer: 'ground', rect: [2, 14, 30, 3], tile: T.BRIDGE },
    { op: 'fill', layer: 'ground', rect: [2, 25, 30, 3], tile: T.BRIDGE },
    { op: 'fill', layer: 'ground', rect: [2, 38, 30, 3], tile: T.BRIDGE },
    { op: 'fill', layer: 'deco', rect: [4, 13, 6, 1], tile: T.FENCE },
    { op: 'building', rect: [60, 6, 16, 12], wall: T.WALL_STONE, floor: T.STONE_FLOOR, roof: T.ROOF_SLATE, doorAt: 8 },
    house(34, 4), house(43, 4), house(34, 31, T.ROOF_SLATE), house(43, 31), house(34, 42), house(43, 42, T.ROOF_SLATE),
    house(61, 31), house(70, 31), house(61, 42), house(70, 42, T.ROOF_SLATE),
    { op: 'fill', layer: 'deco', rect: [36, 19, 3, 1], tile: T.STALL },
    { op: 'fill', layer: 'deco', rect: [46, 19, 3, 1], tile: T.STALL },
    { op: 'collide', rect: [30, 0, 54, 56], bits: 64 },
  ],
  objects: [
    door('obj:salt-exchange-door', [68, 17], 'instance:salt-exchange', 'the Salt Exchange'),
    anchor('salt-exchange', [65, 20]),
    fire('obj:brackhaven-brazier', [40, 27], 'Harbour brazier'),
    waystone('brackhaven', [50, 22], 'Brackhaven'),
    { id: 'obj:brackhaven-ferry', kind: 'door', at: [3, 15], when: { flag: 'act2.ship_passage' }, props: { target: 'tp', toX: 82, toY: 443, name: 'Gull Rock', label: 'Sail to' } },
  ],
};

const saltreachCoast: RegionDef = {
  id: 'region:saltreach-coast', name: 'Saltreach Coast', tier: 2, innerTierBonus: 0.4, layoutCode: 'S',
  description: 'Cliffs, beaches and the free port of Brackhaven, held by the Salt League since the War of the Two Lanterns.',
  biome: 'coast', subBiomes: [{ biome: 'coast', weight: 0.7 }, { biome: 'beach', weight: 0.3 }],
  frost: 0.25, mapColor: 0xc9b37e, faction: 'faction:salt-league',
  overlays: ['overlay:brackhaven'],
  landmarks: [
    lm('brackhaven-docks', 'Brackhaven', [272, 827], 'city', 12),
    lm('salt-exchange', 'The Salt Exchange', [330, 820], 'poi', 6),
  ],
  spawnZones: [{ id: 'zone:coast-road', table: 'spawn:kingsway-bandits', area: { x: 330, y: 870, w: 60, h: 60 }, maxAlive: 3, respawnSec: 240, leash: 20 }],
};

// ---------------------------------------------------------------- Ylwen Deepwood
const caerYlwen: OverlayDef = {
  id: 'overlay:caer-ylwen', origin: [424, 680], size: [48, 48], encoding: 'ops', noScatter: true,
  ops: [
    { op: 'ellipse', layer: 'ground', rect: [0, 0, 48, 48], tile: T.GRASS_DARK, soft: true },
    { op: 'scatter', rect: [0, 0, 48, 48], ellipse: true, tiles: [T.TREE, T.TREE, T.PINE], density: 0.22, seed: 131 },
    { op: 'ellipse', layer: 'deco', rect: [10, 10, 28, 28], tile: -1 },
    { op: 'ellipse', layer: 'overhead', rect: [10, 10, 28, 28], tile: -1 },
    { op: 'ellipse', layer: 'ground', rect: [14, 14, 20, 20], tile: T.WOOD_FLOOR },
    { op: 'fill', layer: 'ground', rect: [22, 34, 4, 14], tile: T.DIRT },
    { op: 'fill', layer: 'deco', rect: [22, 34, 4, 14], tile: -1 },
    ...stones(24, 24, 9, 8),
  ],
  objects: [anchor('caer-ylwen', [24, 22]), fire('obj:caer-ylwen-fire', [27, 26], 'Aelthi hearth'), waystone('caer-ylwen', [21, 27], 'Caer Ylwen')],
};

const groveOfAntlers: OverlayDef = {
  id: 'overlay:grove-of-antlers', origin: [548, 768], size: [24, 24], encoding: 'ops', noScatter: true,
  ops: [
    { op: 'ellipse', layer: 'ground', rect: [0, 0, 24, 24], tile: T.GRASS, soft: true },
    { op: 'scatter', rect: [2, 2, 20, 20], ellipse: true, tiles: [T.FLOWERS], density: 0.2, seed: 132 },
    ...stones(12, 12, 9, 10),
    { op: 'fill', layer: 'deco', rect: [11, 10, 2, 1], tile: T.ALTAR },
  ],
  objects: [anchor('grove-of-antlers', [12, 14])],
};

/** Companion quest (Cadoc, quest:the-unsung-verse): the lake over drowned Ys Aerwen. */
const ysAerwen: OverlayDef = {
  id: 'overlay:ys-aerwen', origin: [492, 836], size: [56, 44], encoding: 'ops', noScatter: true,
  ops: [
    { op: 'ellipse', layer: 'ground', rect: [2, 6, 52, 38], tile: T.SHALLOWS },
    { op: 'ellipse', layer: 'ground', rect: [6, 10, 44, 32], tile: T.DEEP_WATER },
    ...stones(28, 26, 12, 8),
    { op: 'fill', layer: 'ground', rect: [16, 0, 24, 6], tile: T.GRASS_DARK },
    { op: 'fill', layer: 'ground', rect: [26, 4, 4, 6], tile: T.BRIDGE },
  ],
  objects: [
    anchor('ys-aerwen-shore', [24, 3]), fire('obj:ys-aerwen-fire', [33, 2], 'Mourning fire'),
    { id: 'obj:ys-aerwen-stair', kind: 'interactable', at: [28, 8], props: { name: 'White stair into the lake', label: 'Descend' } },
  ],
};

const ylwen: RegionDef = {
  id: 'region:ylwen-deepwood', name: 'Ylwen Deepwood', tier: 3, innerTierBonus: 0.5, layoutCode: 'Y',
  description: 'The vast Aelthi forest: the canopy enclave Caer Ylwen, the drowned court of Ys Aerwen, the Thornwise Circle.',
  biome: 'old-growth', frost: 0.25, mapColor: 0x26361c, faction: 'faction:thornwise',
  gate: { flag: 'act1.ylwen_pact' },
  overlays: ['overlay:caer-ylwen', 'overlay:grove-of-antlers', 'overlay:ys-aerwen'],
  landmarks: [
    lm('caer-ylwen', 'Caer Ylwen', [448, 704], 'city', 12),
    lm('grove-of-antlers', 'The Grove of Antlers', [560, 780], 'shrine', 9),
    lm('ys-aerwen', 'Ys Aerwen', [520, 862], 'ruin', 24),
    lm('ys-aerwen-shore', 'Shore of Ys Aerwen', [518, 840], 'poi', 6),
  ],
  spawnZones: [{ id: 'zone:deepwood', table: 'spawn:deepwood', area: { x: 400, y: 560, w: 220, h: 300 }, maxAlive: 4, respawnSec: 240, leash: 22 }],
};

export default [witherdowns, ossuary, kingBarrows, foothills, dunKorrath, grimmasForge, nailShaft, kneelingFather, saltreachCoast, brackhaven, ylwen, caerYlwen, groveOfAntlers, ysAerwen];
