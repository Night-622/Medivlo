/**
 * Aldermoor, the prologue region (WORLD.md §5). Landmark ids are Claude 4's; `at` is where an NPC hosted there stands.
 * Positions are world tiles via the valley helpers.
 */
import type { LandmarkDef, RegionDef } from '@/core';
import { area, v, VIL, WEN } from './_valley';

const lm = (id: string, name: string, at: [number, number], icon: LandmarkDef['icon'], discoverRadius = 5): LandmarkDef =>
  ({ id: `landmark:${id}`, name, at, icon, discoverRadius });

const STAG_UNRESOLVED = {
  not: { any: [{ flag: 'prologue.stag_fate' }, { flag: 'prologue.stag_cleansed' }, { flag: 'prologue.stag_slain' }] },
};

const aldermoor: RegionDef = {
  id: 'region:aldermoor',
  name: 'Aldermoor',
  description: 'Heather moor and valley on the Haldmarch border; Brindlecross, the Gloamwood and cold Wennamere.',
  tier: 1,
  innerTierBonus: 0.3,
  layoutCode: 'A',
  biome: 'moor',
  frost: 0.35,
  mapColor: 0x74604f,
  faction: 'faction:crown-of-haldmarch',
  overlays: [
    'overlay:aldermoor-valley',
    'overlay:weeping-stones', 'overlay:wolf-hollow', 'overlay:tobins-camp', 'overlay:briar-hut',
    'overlay:brindlecross',
    'overlay:wennamere', 'overlay:edrics-barrow',
  ],
  landmarks: [
    lm('brindlecross-green', 'Brindlecross Green', VIL(18, 19), 'village', 9),
    lm('brindlecross-chapel', 'Chapel of the Lantern', VIL(39, 12), 'shrine'),
    lm('guttered-candle', 'The Guttered Candle', VIL(16, 16), 'poi'),
    lm('coalbrook-smithy', 'Coalbrook Smithy', VIL(12, 28), 'poi'),
    lm('oswin-mill', "Oswin's Mill", VIL(13, 42), 'poi'),
    lm('elder-hall', 'The Elder Hall', VIL(43, 40), 'poi'),
    lm('hollis-cottage', 'Hollis Cottage', VIL(4, 33), 'poi'),
    lm('brindlecross-woodshed', 'The Woodshed', VIL(47, 23), 'poi', 3),
    lm('gloamwood-path', 'The Gloamwood Path', v(100, 146), 'poi', 6),
    lm('briar-hut', 'The Briar Hut', v(43, 112), 'camp', 7),
    lm('weeping-stones', 'The Weeping Stones', v(31, 61), 'shrine', 10),
    lm('wolf-hollow', 'Wolf Hollow', v(25, 31), 'den', 9),
    lm('tobins-camp', "Tobin's Camp", v(61, 90), 'camp', 7),
    lm('wennamere-shore', 'Wennamere Shore', WEN(38, 98), 'poi', 9),
    lm('giants-sluice', "The Giant's Sluice", WEN(79, 98), 'ruin', 7),
    lm('drowned-abbey', 'The Drowned Abbey', WEN(47, 46), 'dungeon', 12),
    lm('edrics-barrow', "Edric's Barrow", v(207, 203), 'dungeon', 8),
  ],
  seeps: [{ id: 'seep:wennamere', at: v(170, 116), radius: 3, minLevel: 0, spawnTable: 'spawn:wennamere-seep' }],
  spawnZones: [
    { id: 'zone:aldermoor-moor', table: 'spawn:aldermoor-moor', area: area(170, 160, 66, 26), maxAlive: 2, respawnSec: 120, leash: 18 },
    { id: 'zone:gloamwood-edge', table: 'spawn:gloamwood-edge', area: area(62, 120, 36, 90), maxAlive: 3, respawnSec: 120, leash: 20 },
    { id: 'zone:gloamwood-deep', table: 'spawn:gloamwood-deep', area: area(12, 40, 60, 60), maxAlive: 4, respawnSec: 180, leash: 22 },
    { id: 'zone:wolf-hollow', table: 'spawn:wolf-hollow', area: area(14, 22, 22, 18), maxAlive: 3, respawnSec: 300, leash: 16, eliteChance: 0.25 },
    { id: 'zone:ley-tors', table: 'spawn:ley-tors', area: area(208, 162, 34, 34), maxAlive: 2, respawnSec: 300, leash: 16 },
    { id: 'zone:brindlecross-festival', table: 'spawn:festival', area: area(120, 131, 14, 8), maxAlive: 4, respawnSec: 0, leash: 30,
      when: { flag: 'prologue.festival_attacked' } },
    { id: 'zone:green-inquisition', table: 'spawn:green-inquisition', area: area(118, 129, 18, 10), maxAlive: 3, respawnSec: 0, leash: 30,
      when: { flag: 'prologue.hale_outcome', op: '==', value: 'defied' } },
    { id: 'zone:weeping-stones-boss', table: 'spawn:weeping-stones-boss', area: area(24, 54, 14, 12), maxAlive: 1, respawnSec: 0, leash: 20,
      when: STAG_UNRESOLVED },
    { id: 'zone:giants-sluice', table: 'spawn:giants-sluice', area: area(224, 108, 18, 12), maxAlive: 5, respawnSec: 0, leash: 18 },
  ],
};

export default aldermoor;
