/** Phase 2 starting kits and class gear. Owner: Claude 3. */
import type { ItemDef } from '@/core';

const items: ItemDef[] = [
  {
    id: 'item:bearded-greataxe', name: 'Bearded Greataxe', description: 'A Hrothi war-axe as long as a man. It hooks, it splits, it does not argue.',
    itemKind: 'weapon', rarity: 'common', itemLevel: 1, slot: 'mainHand', value: 30, upgradeable: true,
    icon: { shape: 'axe', color: '#8d8a84' },
    weapon: {
      family: 'greataxe', hands: 2, damage: [{ type: 'slash', min: 15, max: 20 }], scaling: { might: 'A' },
      attacksPerSec: 1.05, reachPx: 62, arcDeg: 160, poiseDamage: 22, staminaCost: 18, moveset: 'greataxe', buildup: { bleed: 40 },
    },
  },
  {
    id: 'item:iron-greatsword', name: 'Iron Greatsword', description: 'A long Haldish blade for two hands and wide arcs.',
    itemKind: 'weapon', rarity: 'common', itemLevel: 3, slot: 'mainHand', value: 70, upgradeable: true, requirements: { might: 13 },
    icon: { shape: 'blade', color: '#b8bcc2' },
    weapon: {
      family: 'greatsword', hands: 2, damage: [{ type: 'slash', min: 16, max: 21 }], scaling: { might: 'B', finesse: 'D' },
      attacksPerSec: 1.15, reachPx: 64, arcDeg: 150, poiseDamage: 20, staminaCost: 17, moveset: 'greatsword',
    },
  },
  {
    id: 'item:quiet-hand-dagger', name: 'Quiet Hand Dagger', description: 'Blackened steel, no guard to catch the light. The guild issues one; you earn the second.',
    itemKind: 'weapon', rarity: 'common', itemLevel: 1, slot: 'mainHand', value: 25, upgradeable: true,
    icon: { shape: 'blade', color: '#5a554d' },
    weapon: {
      family: 'dagger', hands: 1, damage: [{ type: 'pierce', min: 7, max: 9 }], scaling: { finesse: 'A' },
      attacksPerSec: 2.5, reachPx: 40, arcDeg: 70, poiseDamage: 6, staminaCost: 7, moveset: 'dagger', buildup: { bleed: 12, poison: 10 }, critChance: 0.06,
    },
  },
  {
    id: 'item:cinderglass-dagger', name: 'Cinderglass Dagger', description: 'Fused ash-glass, Qasiri work. Sharper than steel, and it burns going in.',
    itemKind: 'weapon', rarity: 'common', itemLevel: 5, slot: 'mainHand', value: 90, upgradeable: true, requirements: { finesse: 14 },
    icon: { shape: 'blade', color: '#e0661c' },
    weapon: {
      family: 'dagger', hands: 1, damage: [{ type: 'pierce', min: 8, max: 10 }, { type: 'fire', min: 2, max: 3 }], scaling: { finesse: 'A' },
      attacksPerSec: 2.5, reachPx: 40, arcDeg: 70, poiseDamage: 6, staminaCost: 7, moveset: 'dagger', buildup: { burn: 15 }, critChance: 0.06,
    },
  },
  {
    id: 'item:lantern-mace', name: 'Lantern Mace', description: 'A flanged mace with a little brass lantern cage at the head. Lanternate clergy shed no blood.',
    itemKind: 'weapon', rarity: 'common', itemLevel: 1, slot: 'mainHand', value: 30, upgradeable: true,
    icon: { shape: 'blunt', color: '#d4a646' },
    weapon: {
      family: 'mace', hands: 1, damage: [{ type: 'blunt', min: 9, max: 12 }, { type: 'radiant', min: 1, max: 2 }], scaling: { might: 'C', will: 'C' },
      attacksPerSec: 1.45, reachPx: 46, arcDeg: 90, poiseDamage: 22, staminaCost: 13, moveset: 'mace',
    },
  },
  {
    id: 'item:pilgrim-talisman', name: 'Pilgrim’s Talisman', description: 'A tin lantern-charm on a cord, blessed at a roadside shrine.',
    itemKind: 'offhand', rarity: 'common', itemLevel: 1, slot: 'offHand', value: 25,
    icon: { shape: 'gem', color: '#ebc969' },
    offhand: { family: 'talisman', modifiers: [{ stat: 'school.radiance', op: 'increased', value: 0.15 }, { stat: 'healingDone', op: 'increased', value: 0.1 }, { stat: 'maxMana', op: 'flat', value: 10 }] },
  },
  {
    id: 'item:wolfhide-coat', name: 'Wolfhide Coat', description: 'Hrothi furs over boiled leather. Smells of smoke and wet dog.',
    itemKind: 'armor', rarity: 'common', itemLevel: 1, slot: 'chest', value: 22, upgradeable: true,
    icon: { shape: 'armor', color: '#8a8a8a' }, armor: { weight: 'medium', armor: 13, poise: 7, equipWeight: 6, resist: { frost: 0.1 } },
  },
  {
    id: 'item:dark-leathers', name: 'Dark Leathers', description: 'Soft, oiled, dyed black. They do not creak.',
    itemKind: 'armor', rarity: 'common', itemLevel: 1, slot: 'chest', value: 20, upgradeable: true,
    icon: { shape: 'armor', color: '#3a2d20' }, armor: { weight: 'light', armor: 8, poise: 2, equipWeight: 3 },
    implicit: [{ stat: 'dodgeCost', op: 'increased', value: -0.1 }],
  },
];

export default items;
