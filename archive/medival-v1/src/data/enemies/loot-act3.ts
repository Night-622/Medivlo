/** Act III loot tables. Owner: Claude 3. */
import type { LootTable } from '@/core';

const gear = (weight: number, smart = 0.6) => ({ weight, kind: 'random' as const, filter: { kinds: ['weapon', 'armor', 'offhand', 'accessory'] as ('weapon' | 'armor' | 'offhand' | 'accessory')[], smart }, rarity: 'roll' as const });

const tables: LootTable[] = [
  {
    id: 'loot:drowned-thing', rolls: 1, gold: [10, 20], rarityBoost: 1.5,
    entries: [{ weight: 30, kind: 'nothing' }, gear(35), { weight: 20, kind: 'item', item: 'item:mire-residue', qty: [2, 4] }, { weight: 10, kind: 'item', item: 'item:drowned-silver-flake', qty: [1, 3] }, { weight: 5, kind: 'table', table: 'loot:glyphs' }],
  },
  {
    id: 'loot:ysolde', rolls: 3, gold: [200, 260], rarityBoost: 5,
    guaranteed: [{ weight: 1, kind: 'table', table: 'loot:glyphs' }, { weight: 1, kind: 'item', item: 'item:essence-rime', qty: [2, 3] }],
    entries: [gear(1, 0.8)],
  },
  {
    id: 'loot:nhal-risen', rolls: 4, gold: [400, 500], rarityBoost: 8,
    guaranteed: [{ weight: 1, kind: 'table', table: 'loot:glyphs' }, { weight: 1, kind: 'item', item: 'item:true-iron', qty: [2, 3] }],
    entries: [gear(1, 0.8)],
  },
];

export default tables;
