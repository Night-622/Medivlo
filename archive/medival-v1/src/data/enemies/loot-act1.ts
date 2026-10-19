/** Act I loot tables. Owner: Claude 3. */
import type { LootTable } from '@/core';

const gear = (weight: number, smart = 0.6) => ({ weight, kind: 'random' as const, filter: { kinds: ['weapon', 'armor', 'offhand', 'accessory'] as ('weapon' | 'armor' | 'offhand' | 'accessory')[], smart }, rarity: 'roll' as const });

const tables: LootTable[] = [
  {
    id: 'loot:cinder-shade', rolls: 1, gold: [2, 5],
    entries: [{ weight: 45, kind: 'nothing' }, gear(20), { weight: 20, kind: 'item', item: 'item:ley-dust' }, { weight: 10, kind: 'item', item: 'item:essence-ash' }, { weight: 5, kind: 'item', item: 'item:fire-oil' }],
  },
  {
    id: 'loot:rust-wraith', rolls: 1, gold: [3, 8],
    entries: [{ weight: 35, kind: 'nothing' }, gear(25), { weight: 30, kind: 'item', item: 'item:iron-scrap', qty: [2, 5] }, { weight: 10, kind: 'item', item: 'item:ley-dust', qty: [1, 2] }],
  },
  {
    id: 'loot:barrow-wight', rolls: 1, gold: [3, 7],
    entries: [{ weight: 40, kind: 'nothing' }, gear(30), { weight: 15, kind: 'item', item: 'item:essence-rime' }, { weight: 15, kind: 'item', item: 'item:ley-dust' }],
  },
  {
    id: 'loot:drowned-choir', rolls: 1, gold: [3, 8],
    entries: [
      { weight: 40, kind: 'nothing' }, gear(25), { weight: 15, kind: 'item', item: 'item:mire-residue', qty: [1, 2] },
      { weight: 10, kind: 'item', item: 'item:healing-poultice' }, { weight: 10, kind: 'item', item: 'item:drowned-silver-flake' },
    ],
  },
  {
    id: 'loot:drowned-knight', rolls: 1, gold: [6, 12], rarityBoost: 1.5,
    entries: [{ weight: 30, kind: 'nothing' }, gear(40), { weight: 30, kind: 'item', item: 'item:drowned-silver-flake', qty: [1, 2] }],
  },
  {
    id: 'loot:reed-mother', rolls: 3, gold: [60, 90], rarityBoost: 4,
    guaranteed: [{ weight: 1, kind: 'table', table: 'loot:glyphs' }, { weight: 1, kind: 'item', item: 'item:essence-rime', qty: [1, 2] }, { weight: 1, kind: 'item', item: 'item:drowned-silver-flake', qty: [3, 4] }],
    entries: [gear(1, 0.8)],
  },
  {
    // item:drowned-lords-hook is a quest reward (quest:ashes-of-varn), not loot
    id: 'loot:aldwin-varn', rolls: 3, gold: [90, 130], rarityBoost: 5,
    guaranteed: [{ weight: 1, kind: 'table', table: 'loot:glyphs' }, { weight: 1, kind: 'item', item: 'item:essence-ash', qty: [1, 2] }, { weight: 1, kind: 'item', item: 'item:drowned-silver-flake', qty: [4, 6] }],
    entries: [gear(1, 0.8)],
  },
];

export default tables;
