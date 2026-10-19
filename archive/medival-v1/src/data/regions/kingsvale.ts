/**
 * The Kingsvale (Act I heartland). Landmark ids are Claude 4's (10-act1-spec); positions are world tiles.
 * Haldren occupies tiles 800–863 × 676–731; see overlays/haldren.ts.
 */
import type { RegionDef } from '@/core';
import type { OverlayDef } from '@/world/types';
import { T } from '@/world/tiles';
import { lm } from './_builders';
import { haldrenAt as H } from './overlays/haldren';
import { act3KingsvaleLandmarks } from './act3';

const RESTORED = { flag: 'act1.cinderhold_restored' };

const kingsvale: RegionDef = {
  id: 'region:kingsvale',
  name: 'The Kingsvale',
  description: 'Farmland heartland of the Haldmarch: the walled capital Haldren, the river Hald and the crag of Cinderhold.',
  tier: 2,
  innerTierBonus: 0.3,
  layoutCode: 'K',
  biome: 'farmland',
  subBiomes: [{ biome: 'farmland', weight: 0.6 }, { biome: 'plains', weight: 0.4 }],
  frost: 0.3,
  mapColor: 0x8c7a3f,
  faction: 'faction:crown-of-haldmarch',
  overlays: ['overlay:haldren', 'overlay:refugee-camp', 'overlay:cinderhold-crag', 'overlay:thornwall', 'overlay:ylwen-seeps', 'overlay:hrothi-raider-camp', 'overlay:haldren-act3', 'overlay:haldren-siege'],
  landmarks: [
    lm('kings-way-north', "The King's Way North", [968, 884], 'poi', 8),
    lm('haldren-market', 'Haldren', H(32, 27), 'city', 12),
    lm('haldren-gate', 'The South Gate', H(32, 51), 'poi', 5),
    lm('haldren-cathedral', 'Cathedral of Haldren', H(52, 18), 'shrine', 5),
    lm('refugee-camp', 'The Refugee Camp', [816, 754], 'camp', 7),
    lm('cinderhold', 'Cinderhold', [1064, 674], 'ruin', 12),
    lm('thornwall', 'The Thornwall', [648, 760], 'poi', 8),
    ...act3KingsvaleLandmarks,
  ],
  seeps: [
    { id: 'seep:ylwen-1', at: [662, 702], radius: 2, minLevel: 0, spawnTable: 'spawn:kingsvale-seep' },
    { id: 'seep:ylwen-2', at: [670, 744], radius: 2, minLevel: 0, spawnTable: 'spawn:kingsvale-seep' },
    { id: 'seep:ylwen-3', at: [664, 824], radius: 2, minLevel: 0, spawnTable: 'spawn:kingsvale-seep' },
  ],
  spawnZones: [
    { id: 'zone:haldren-market-brawl', table: 'spawn:market-brawl', area: { x: H(22, 20)[0], y: H(22, 20)[1], w: 20, h: 14 },
      maxAlive: 2, respawnSec: 0, leash: 24, when: { flag: 'act1.market_brawl' } },
    { id: 'zone:cinderhold-crag', table: 'spawn:cinderhold-crag', area: { x: 1040, y: 680, w: 48, h: 24 },
      maxAlive: 3, respawnSec: 240, leash: 18, when: { not: RESTORED } },
    { id: 'zone:kingsvale-fields', table: 'spawn:kingsvale-fields', area: { x: 900, y: 740, w: 200, h: 120 }, maxAlive: 3, respawnSec: 180, leash: 20 },
    { id: 'zone:kingsway-bandits', table: 'spawn:kingsway-bandits', area: { x: 680, y: 780, w: 80, h: 100 }, maxAlive: 3, respawnSec: 240, leash: 20 },
    { id: 'zone:siege-host', table: 'spawn:siege-host', area: { x: 760, y: 640, w: 144, h: 124 }, maxAlive: 6, respawnSec: 90, leash: 26,
      when: { flag: 'act3.siege_active' } },
    { id: 'zone:hrothi-raiders', table: 'spawn:hrothi-raiders', area: { x: 990, y: 630, w: 44, h: 38 }, maxAlive: 4, respawnSec: 300, leash: 22,
      when: { flag: 'act2.hrothi_invasion' } },
  ],
};

/** Act II: Hrothi raider camp in the northern Kingsvale while `act2.hrothi_invasion` holds. */
const raiderCamp: OverlayDef = {
  id: 'overlay:hrothi-raider-camp', origin: [1000, 640], size: [24, 18], encoding: 'ops',
  ops: [],
  variants: [{
    when: { flag: 'act2.hrothi_invasion' },
    ops: [
      { op: 'ellipse', layer: 'ground', rect: [0, 0, 24, 18], tile: T.MUD },
      { op: 'fill', layer: 'deco', rect: [2, 2, 3, 2], tile: T.TENT }, { op: 'fill', layer: 'deco', rect: [14, 3, 3, 2], tile: T.TENT },
      { op: 'fill', layer: 'deco', rect: [6, 12, 3, 2], tile: T.TENT }, { op: 'fill', layer: 'deco', rect: [11, 8, 1, 1], tile: T.CAMPFIRE },
    ],
  }],
};

/** Objects only: the three Mire seeps in the King's woods by the Thornwall (quest:the-singing-wood). */
const ylwenSeeps: OverlayDef = {
  id: 'overlay:ylwen-seeps',
  origin: [650, 690],
  size: [30, 140],
  encoding: 'ops',
  ops: [],
  objects: [
    { id: 'obj:ylwen-seep-1', kind: 'interactable', at: [12, 14], props: { name: 'Mire seep', label: 'Cleanse' } },
    { id: 'obj:ylwen-seep-2', kind: 'interactable', at: [20, 56], props: { name: 'Mire seep', label: 'Cleanse' } },
    { id: 'obj:ylwen-seep-3', kind: 'interactable', at: [14, 136], props: { name: 'Mire seep', label: 'Cleanse' } },
  ],
};

export default [kingsvale, ylwenSeeps, raiderCamp];
