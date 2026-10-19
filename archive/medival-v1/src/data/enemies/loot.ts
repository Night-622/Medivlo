/** Loot tables (SYSTEMS.md §8.5). Chests reference these via props.lootTable. Owner: Claude 3. */
import type { LootTable } from '@/core';

const gear = (weight: number, smart = 0.6) => ({ weight, kind: 'random' as const, filter: { kinds: ['weapon', 'armor', 'offhand', 'accessory'] as ('weapon' | 'armor' | 'offhand' | 'accessory')[], smart }, rarity: 'roll' as const });

const tables: LootTable[] = [
  { id: 'loot:none', rolls: 0, entries: [] },
  { id: 'loot:glyphs', rolls: 1, entries: [{ weight: 5, kind: 'item', item: 'item:glyph-splitting' }, { weight: 5, kind: 'item', item: 'item:glyph-lingering' }, { weight: 2, kind: 'item', item: 'item:glyph-echo' }, { weight: 5, kind: 'item', item: 'item:glyph-haste' }, { weight: 5, kind: 'item', item: 'item:glyph-cinders' }, { weight: 5, kind: 'item', item: 'item:glyph-frost' }, { weight: 5, kind: 'item', item: 'item:glyph-storms' }, { weight: 5, kind: 'item', item: 'item:glyph-piercing' }, { weight: 5, kind: 'item', item: 'item:glyph-siphon' }, { weight: 2, kind: 'item', item: 'item:glyph-detonation' }, { weight: 5, kind: 'item', item: 'item:glyph-homing' }, { weight: 5, kind: 'item', item: 'item:glyph-widening' }] },
  {
    id: 'loot:gloamwood-wolf', rolls: 1, gold: [0, 2],
    entries: [{ weight: 55, kind: 'nothing' }, { weight: 35, kind: 'item', item: 'item:wolf-pelt', qty: [1, 2] }, gear(8), { weight: 2, kind: 'item', item: 'item:healing-poultice' }],
  },
  {
    id: 'loot:hollowed-thrall', rolls: 1, gold: [1, 4],
    entries: [{ weight: 50, kind: 'nothing' }, { weight: 30, kind: 'item', item: 'item:mire-residue', qty: [1, 2] }, gear(14), { weight: 6, kind: 'item', item: 'item:healing-poultice' }],
  },
  { id: 'loot:mireling', rolls: 1, entries: [{ weight: 70, kind: 'nothing' }, { weight: 30, kind: 'item', item: 'item:mire-residue' }] },
  {
    id: 'loot:ashfoot-bandit', rolls: 1, gold: [2, 6],
    entries: [
      { weight: 40, kind: 'nothing' }, gear(25), { weight: 20, kind: 'item', item: 'item:iron-scrap', qty: [1, 3] },
      { weight: 8, kind: 'item', item: 'item:healing-poultice' }, { weight: 4, kind: 'item', item: 'item:fire-oil' }, { weight: 3, kind: 'item', item: 'item:stamina-draught' },
    ],
  },
  {
    id: 'loot:drowned-dead', rolls: 1, gold: [1, 4],
    entries: [
      { weight: 45, kind: 'nothing' }, gear(25), { weight: 15, kind: 'item', item: 'item:iron-scrap', qty: [1, 2] },
      { weight: 10, kind: 'item', item: 'item:ley-dust' }, { weight: 5, kind: 'item', item: 'item:drowned-silver-flake' },
    ],
  },
  {
    id: 'loot:wick-soldier', rolls: 1, gold: [3, 8],
    entries: [{ weight: 35, kind: 'nothing' }, gear(30), { weight: 15, kind: 'item', item: 'item:healing-poultice' }, { weight: 20, kind: 'item', item: 'item:iron-scrap', qty: [1, 3] }],
  },
  {
    id: 'loot:hollowed-white-stag', rolls: 2, gold: [20, 30], rarityBoost: 3,
    guaranteed: [{ weight: 1, kind: 'item', item: 'item:white-stag-antler' }, { weight: 1, kind: 'item', item: 'item:essence-ash' }],
    entries: [gear(1, 0.8)],
  },
  {
    id: 'loot:abbess-morwen', rolls: 3, gold: [40, 60], rarityBoost: 4,
    guaranteed: [{ weight: 1, kind: 'item', item: 'item:essence-rime' }, { weight: 1, kind: 'item', item: 'item:drowned-silver-flake', qty: [2, 3] }, { weight: 1, kind: 'table', table: 'loot:glyphs' }],
    entries: [gear(1, 0.8)],
  },
  // chests (Claude 2 places them with props.lootTable)
  {
    id: 'loot:chest-common', rolls: [1, 2], gold: [5, 15],
    entries: [
      gear(40), { weight: 20, kind: 'item', item: 'item:healing-poultice', qty: [1, 2] }, { weight: 15, kind: 'item', item: 'item:ember-tonic' },
      { weight: 10, kind: 'item', item: 'item:hearty-stew' }, { weight: 8, kind: 'item', item: 'item:fire-oil' }, { weight: 7, kind: 'item', item: 'item:iron-scrap', qty: [2, 4] },
      { weight: 4, kind: 'table', table: 'loot:glyphs' },
    ],
  },
  // prologue: Edric's Barrow outer chamber (the sword stays sealed until Act I)
  {
    id: 'loot:edrics-barrow-chest', rolls: 1, gold: [30, 50],
    guaranteed: [{ weight: 1, kind: 'item', item: 'item:hrothi-round-shield', rarity: 'uncommon' }, { weight: 1, kind: 'item', item: 'item:ley-dust', qty: [2, 3] }],
    entries: [gear(1)],
  },
  // Act I: the sealed inner vault (place with when: { flag: 'act1.river_truth' }).
  // Edric's Oath itself is handed over by Cuthred's ghost in quest:edrics-oath (Claude 4), not looted.
  { id: 'loot:edrics-inner-vault', rolls: 1, gold: [60, 90], guaranteed: [{ weight: 1, kind: 'item', item: 'item:barrow-king-helm' }], entries: [gear(1, 0.8)] },
  { id: 'loot:abbey-reliquary', rolls: 2, gold: [20, 40], rarityBoost: 3, guaranteed: [{ weight: 1, kind: 'item', item: 'item:tome-ember-burst' }], entries: [gear(1, 0.8)] },
];

export default tables;
