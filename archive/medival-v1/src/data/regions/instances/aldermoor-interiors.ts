/** Aldermoor interiors and Edric's Barrow (WORLD.md §5.2, §5.4). Instance-local tile coords. */
import { T } from '@/world/tiles';
import type { InstanceDef, OverlayDef } from '@/world/types';
import { interior, table } from '../_builders';
import { v, VIL } from '../_valley';

const defs = [
  ...interior('guttered-candle', 'The Guttered Candle', 16, 12, VIL(14, 16), {
    ops: [table(3, 4), table(8, 4), table(3, 7), table(8, 7), { op: 'fill', layer: 'deco', rect: [11, 2, 4, 1], tile: T.WALL_WOOD }],
    objects: [{ id: 'obj:guttered-candle-hearth', kind: 'interactable', at: [13, 4], props: { name: 'Hearth', rest: true } },
      { id: 'obj:book-hearthwardens-almanac', kind: 'lore', at: [14, 6], props: { lore: 'lore:book-hearthwardens-almanac', name: "Hearthwarden's Almanac", label: 'Read' } }],
  }),
  ...interior('brindlecross-chapel', 'Chapel of the Lantern', 14, 14, VIL(37, 12), {
    floor: T.STONE_FLOOR, wall: T.WALL_STONE,
    ops: [{ op: 'fill', layer: 'deco', rect: [6, 2, 2, 1], tile: T.ALTAR }, table(2, 6, 4), table(8, 6, 4), table(2, 9, 4), table(8, 9, 4)],
    objects: [{ id: 'obj:chapel-lectern', kind: 'lore', at: [7, 4], props: { lore: 'lore:the-forging', name: 'Lectern' } },
      { id: 'obj:book-wardens-primer-excerpts', kind: 'lore', at: [12, 2], props: { lore: 'lore:book-wardens-primer-excerpts', name: 'Loose stone niche', label: 'Search' } }],
  }),
  ...interior('elder-hall', 'The Elder Hall', 14, 10, VIL(41, 40), {
    ops: [table(4, 3, 6)],
  }),
  ...interior('oswin-mill', "Oswin's Mill", 10, 10, VIL(11, 42), {
    ops: [{ op: 'fill', layer: 'deco', rect: [2, 2, 2, 2], tile: T.ROCK }],
    objects: [{ id: 'obj:oswin-strongbox', kind: 'interactable', at: [7, 2], props: { name: 'Strongbox', label: 'Search' } },
      { id: 'obj:book-drowned-hymnal', kind: 'lore', at: [2, 6], props: { lore: 'lore:book-drowned-hymnal', name: 'Hymnal', label: 'Read' } }],
  }),
  ...interior('hollis-cottage', 'Hollis Cottage', 10, 8, VIL(2, 33), {
    ops: [table(2, 2, 2), table(6, 2, 2)],
    objects: [{ id: 'obj:book-tale-of-the-white-stag', kind: 'lore', at: [8, 2], props: { lore: 'lore:book-tale-of-the-white-stag', name: 'The Tale of the White Stag', label: 'Read' } }],
  }),
];

// ---- Edric's Barrow: optional mini-dungeon (Ashfoot Reavers have moved in).
const barrowOverlay: OverlayDef = {
  id: 'overlay:edrics-barrow-f1',
  origin: [0, 0],
  size: [30, 20],
  encoding: 'ops',
  ops: [
    { op: 'fill', layer: 'ground', rect: [2, 2, 26, 16], tile: T.ROCK_FLOOR },
    { op: 'fill', layer: 'deco', rect: [18, 2, 1, 16], tile: T.WALL_STONE },
    { op: 'scatter', rect: [3, 3, 14, 14], tiles: [T.GRAVE, T.RUBBLE], density: 0.06, seed: 71 },
    { op: 'fill', layer: 'deco', rect: [23, 9, 2, 1], tile: T.ALTAR },
  ],
  objects: [
    { id: 'obj:edrics-barrow-exit', kind: 'door', at: [4, 17], props: { target: 'overworld', label: 'Leave' } },
    { id: 'obj:barrow-inner-door', kind: 'interactable', at: [17, 9], props: { name: 'Inner door', label: 'Examine' } },
    { id: 'obj:edrics-barrow-campfire', kind: 'interactable', at: [6, 14], props: { name: 'Reavers\' fire', rest: true } },
    { id: 'obj:edrics-barrow-chest', kind: 'chest', at: [24, 5], props: { lootTable: 'loot:edrics-barrow', name: "Edric's hoard" } },
  ],
  // The inner door opens when the player lays the Ashmark on the stone (Claude 4: quest:edrics-oath sets act1.edric_door_open).
  variants: [{ when: { flag: 'act1.edric_door_open' }, ops: [{ op: 'fill', layer: 'deco', rect: [18, 9, 1, 2], tile: T.DOOR }] }],
};

const barrow: InstanceDef = {
  id: 'instance:edrics-barrow', kind: 'dungeon', name: "Edric's Barrow", tier: 1, biome: 'dungeon-ruin',
  exit: v(207, 203),
  floors: [{
    id: 'f1', overlay: 'overlay:edrics-barrow-f1',
    entrances: { main: [5, 16] },
    spawnZones: [
      { id: 'zone:edrics-cutthroats', table: 'spawn:edrics-cutthroats', area: { x: 4, y: 3, w: 12, h: 6 }, maxAlive: 2, respawnSec: 0, leash: 14 },
      { id: 'zone:edrics-archers', table: 'spawn:edrics-archers', area: { x: 10, y: 10, w: 7, h: 7 }, maxAlive: 2, respawnSec: 0, leash: 14 },
    ],
  }],
};

export default [...defs, barrowOverlay, barrow];
