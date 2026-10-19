/** Act I quest items and legendaries (docs/lore/10-act1-spec.md). Owner: Claude 3. */
import type { ItemDef } from '@/core';

const quest = (id: string, name: string, description: string): ItemDef => ({
  id: `item:${id}`, name, description, itemKind: 'quest', rarity: 'common', itemLevel: 1, value: 0, icon: { shape: 'misc', color: '#d4a646' },
});

const items: ItemDef[] = [
  quest('choir-robes', 'Choir Robes', 'Wet grey robes of the Drowned Choir. In the reeds, they might pass you for a novice.'),
  quest('harrow-letters', 'Harrow’s Letters', 'Osric Harrow’s correspondence with the Choir, sealed in green wax. Damning.'),
  quest('broken-nail-shard', 'Broken Nail Shard', 'A splinter of true-iron from one of the Nine Nails. It is warm, and it should not be.'),
  quest('wick-ledger', 'The Wick Ledger', 'The Order of the Wick’s list of the “marked” held at Valcastre.'),
  {
    id: 'item:lastlight', name: 'Lastlight', description: 'The Emberwardens’ last blade, carried by Hesta Corrow until the end.',
    flavor: '“Keep the fire lit.”',
    itemKind: 'weapon', rarity: 'legendary', itemLevel: 12, slot: 'mainHand', value: 1600, upgradeable: true, requirements: { might: 14, will: 12 },
    icon: { shape: 'blade', color: '#ffb04a' },
    weapon: {
      family: 'sword', hands: 1, damage: [{ type: 'slash', min: 14, max: 19 }], scaling: { might: 'B', will: 'C' },
      attacksPerSec: 1.6, reachPx: 56, arcDeg: 105, poiseDamage: 16, staminaCost: 12, moveset: 'sword', buildup: { burn: 15 },
    },
    unique: [
      { kind: 'hook', hook: 'convertPhysical', params: { to: 'fire', pct: 0.3 } },
      { kind: 'hook', hook: 'emberOnHollowedKill', params: { amount: 10 } },
    ],
  },
  {
    id: 'item:drowned-lords-hook', name: 'The Drowned Lord’s Hook', description: 'Aldwin Varn’s drowned-silver dagger. It still pulls toward the water.',
    flavor: '“Come home.”',
    itemKind: 'weapon', rarity: 'legendary', itemLevel: 14, slot: 'mainHand', value: 1700, upgradeable: true, requirements: { finesse: 15 },
    icon: { shape: 'blade', color: '#5f7f86' },
    weapon: {
      family: 'dagger', hands: 1, damage: [{ type: 'pierce', min: 9, max: 12 }, { type: 'shadow', min: 3, max: 4 }], scaling: { finesse: 'A', intellect: 'D' },
      attacksPerSec: 2.4, reachPx: 42, arcDeg: 70, poiseDamage: 7, staminaCost: 8, moveset: 'dagger', buildup: { bleed: 30 }, critChance: 0.05,
    },
    implicit: [{ stat: 'healingReceived', op: 'increased', value: -0.2 }],
    unique: [
      { kind: 'hook', hook: 'bleedLeech', params: { pct: 0.05 } },
      { kind: 'hook', hook: 'stealthPull' },
    ],
  },
];

export default items;
