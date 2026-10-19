/** Act II quest items, true-iron, and legendaries (docs/lore/11-act2-spec.md). Owner: Claude 3. */
import type { ItemDef } from '@/core';

const quest = (id: string, name: string, description: string): ItemDef => ({
  id: `item:${id}`, name, description, itemKind: 'quest', rarity: 'common', itemLevel: 1, value: 0, icon: { shape: 'book', color: '#d4a646' },
});

const items: ItemDef[] = [
  quest('wick-writ', 'Wick Writ', 'Papers of the Order of the Wick, signed by Inquisitor Vellane. Doors open; some faces close.'),
  quest('ysolde-journal', 'Ysolde’s Journal', 'The Pale Saint’s private journal: visions, prayers, and Hesta’s letters folded between the pages.'),
  {
    id: 'item:true-iron', name: 'True-Iron', description: 'Giant-forged Orrin metal that never rusts. The Concord guards every seam of it.',
    itemKind: 'material', rarity: 'rare', itemLevel: 18, stack: 99, value: 240, icon: { shape: 'gem', color: '#8d9aab' }, tags: ['upgrade-10'],
  },
  {
    id: 'item:frostjaw', name: 'Frostjaw', description: 'Jarl Sigrun Ice-Eye’s family axe. Frost creeps along the beard of the blade.',
    flavor: '“The cold keeps what the axe takes.”',
    itemKind: 'weapon', rarity: 'legendary', itemLevel: 20, slot: 'mainHand', value: 2600, upgradeable: true, requirements: { might: 18 },
    icon: { shape: 'axe', color: '#bdf0f7' },
    weapon: {
      family: 'axe', hands: 1, damage: [{ type: 'slash', min: 14, max: 19 }, { type: 'frost', min: 4, max: 6 }], scaling: { might: 'B', finesse: 'D' },
      attacksPerSec: 1.45, reachPx: 50, arcDeg: 95, poiseDamage: 16, staminaCost: 13, moveset: 'axe', buildup: { bleed: 30, frozen: 10 },
    },
    unique: [{ kind: 'hook', hook: 'bleedFreeze' }, { kind: 'hook', hook: 'frozenShatter', params: { pct: 0.6, radius: 90 } }],
  },
  {
    id: 'item:crown-of-ozrah', name: 'Crown of Ozrah', description: 'The last Ashen King’s circlet of fused glass. It burns away everything you have.',
    flavor: '“A king spends himself.”',
    itemKind: 'armor', rarity: 'legendary', itemLevel: 22, slot: 'head', value: 3000, requirements: { intellect: 20 },
    icon: { shape: 'ring', color: '#ffb04a' }, armor: { weight: 'light', armor: 6, poise: 0, equipWeight: 1.5 },
    implicit: [{ stat: 'spellDamage', op: 'more', value: 0.5 }],
    unique: [{ kind: 'hook', hook: 'alwaysOverdraw' }],
  },
  {
    id: 'item:the-first-nail', name: 'The First Nail', description: 'One of the Nine Nails that pin the Mire, pried loose and hafted. True-iron does not forget what it holds down.',
    flavor: '“Hold.”',
    itemKind: 'weapon', rarity: 'legendary', itemLevel: 22, slot: 'mainHand', value: 3200, upgradeable: true, requirements: { might: 22 },
    icon: { shape: 'blunt', color: '#8d9aab' },
    weapon: {
      family: 'warhammer', hands: 2, damage: [{ type: 'blunt', min: 26, max: 34 }], scaling: { might: 'S' },
      attacksPerSec: 0.8, reachPx: 60, arcDeg: 120, poiseDamage: 55, staminaCost: 22, moveset: 'warhammer',
    },
    implicit: [{ stat: 'attackSpeed', op: 'increased', value: -0.2 }],
    unique: [{ kind: 'hook', hook: 'heavyPin', params: { durationMs: 2000 } }],
  },
];

export default items;
