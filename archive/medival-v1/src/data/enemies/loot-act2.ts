/** Act II loot tables. Owner: Claude 3. */
import type { LootTable } from '@/core';

const gear = (weight: number, smart = 0.6) => ({ weight, kind: 'random' as const, filter: { kinds: ['weapon', 'armor', 'offhand', 'accessory'] as ('weapon' | 'armor' | 'offhand' | 'accessory')[], smart }, rarity: 'roll' as const });

const tables: LootTable[] = [
  {
    id: 'loot:hrothi-raider', rolls: 1, gold: [4, 9],
    entries: [{ weight: 40, kind: 'nothing' }, gear(25), { weight: 20, kind: 'item', item: 'item:wolf-pelt', qty: [1, 2] }, { weight: 10, kind: 'item', item: 'item:iron-scrap', qty: [1, 3] }, { weight: 5, kind: 'item', item: 'item:healing-poultice' }],
  },
  {
    id: 'loot:wrought-sentinel', rolls: 1, gold: [6, 12],
    entries: [{ weight: 30, kind: 'nothing' }, gear(25), { weight: 30, kind: 'item', item: 'item:iron-scrap', qty: [3, 6] }, { weight: 10, kind: 'item', item: 'item:ley-dust', qty: [1, 3] }, { weight: 5, kind: 'item', item: 'item:true-iron' }],
  },
  {
    id: 'loot:rime-wolf', rolls: 1, gold: [2, 6],
    entries: [{ weight: 45, kind: 'nothing' }, { weight: 30, kind: 'item', item: 'item:wolf-pelt', qty: [1, 3] }, gear(15), { weight: 10, kind: 'item', item: 'item:essence-rime' }],
  },
  {
    id: 'loot:act2-champion', rolls: 2, gold: [30, 60], rarityBoost: 3,
    guaranteed: [{ weight: 1, kind: 'table', table: 'loot:glyphs' }, { weight: 1, kind: 'item', item: 'item:ley-dust', qty: [3, 5] }],
    entries: [gear(1, 0.8)],
  },
  {
    id: 'loot:mirebeast', rolls: 1, gold: [6, 14], rarityBoost: 1.5,
    entries: [{ weight: 30, kind: 'nothing' }, gear(30), { weight: 30, kind: 'item', item: 'item:mire-residue', qty: [2, 4] }, { weight: 10, kind: 'item', item: 'item:drowned-silver-flake', qty: [1, 2] }],
  },
  {
    // item:crown-of-ozrah is the quest reward of quest:the-glass-throne, not loot
    id: 'loot:ashwyrm', rolls: 3, gold: [140, 200], rarityBoost: 5,
    guaranteed: [{ weight: 1, kind: 'table', table: 'loot:glyphs' }, { weight: 1, kind: 'item', item: 'item:essence-ash', qty: [2, 3] }, { weight: 1, kind: 'item', item: 'item:true-iron', qty: [1, 2] }],
    entries: [gear(1, 0.8)],
  },
];

export default tables;
