/** Phase 1 weapons and off-hands (SYSTEMS.md §7.2). Owner: Claude 3. */
import type { ItemDef } from '@/core';

const weapons: ItemDef[] = [
  {
    id: 'item:iron-arming-sword', name: 'Iron Arming Sword', description: 'A plain Haldish blade, honest and well balanced.',
    itemKind: 'weapon', rarity: 'common', itemLevel: 1, slot: 'mainHand', value: 20, upgradeable: true,
    icon: { shape: 'blade', color: '#b8bcc2' },
    weapon: {
      family: 'sword', hands: 1, damage: [{ type: 'slash', min: 9, max: 12 }], scaling: { might: 'C', finesse: 'C' },
      attacksPerSec: 1.6, reachPx: 52, arcDeg: 100, poiseDamage: 12, staminaCost: 12, moveset: 'sword',
    },
  },
  {
    id: 'item:steel-arming-sword', name: 'Steel Arming Sword', description: 'Better steel, a truer edge.',
    itemKind: 'weapon', rarity: 'common', itemLevel: 4, slot: 'mainHand', value: 60, upgradeable: true, requirements: { might: 10 },
    icon: { shape: 'blade', color: '#d6dbe0' },
    weapon: {
      family: 'sword', hands: 1, damage: [{ type: 'slash', min: 11, max: 15 }], scaling: { might: 'C', finesse: 'C' },
      attacksPerSec: 1.6, reachPx: 54, arcDeg: 100, poiseDamage: 13, staminaCost: 12, moveset: 'sword',
    },
  },
  {
    id: 'item:barrow-blade', name: 'Barrow Blade', description: 'Pulled from a barrow mound. The edge has not dulled in four hundred years.',
    flavor: '“Smoke from the barrow means the dead are restless.”',
    itemKind: 'weapon', rarity: 'uncommon', itemLevel: 3, slot: 'mainHand', value: 90, upgradeable: true,
    icon: { shape: 'blade', color: '#9fb1a0' },
    weapon: {
      family: 'sword', hands: 1, damage: [{ type: 'slash', min: 10, max: 14 }], scaling: { might: 'C', finesse: 'C' },
      attacksPerSec: 1.65, reachPx: 54, arcDeg: 100, poiseDamage: 13, staminaCost: 11, moveset: 'sword', critChance: 0.03,
    },
    implicit: [{ stat: 'damageDealt', op: 'increased', value: 0.15, condition: { kind: 'targetFamily', family: 'restless' } }],
  },
  {
    id: 'item:edrics-oath', name: "Edric's Oath", description: 'The first Barrow-King’s blade. It remembers every oath sworn upon it.',
    flavor: '“Hold, and be held.”',
    itemKind: 'weapon', rarity: 'legendary', itemLevel: 5, slot: 'mainHand', value: 900, upgradeable: true, requirements: { might: 13 },
    icon: { shape: 'blade', color: '#e0a64a' },
    weapon: {
      family: 'sword', hands: 1, damage: [{ type: 'slash', min: 13, max: 17 }], scaling: { might: 'B', finesse: 'D' },
      attacksPerSec: 1.6, reachPx: 56, arcDeg: 105, poiseDamage: 15, staminaCost: 12, moveset: 'sword',
    },
    unique: [{ kind: 'hook', hook: 'edricsOath', params: { cooldownMs: 6000, resolve: 25 } }],
  },
  {
    id: 'item:hunting-knife', name: 'Hunting Knife', description: 'For skinning, and for whatever gets too close.',
    itemKind: 'weapon', rarity: 'common', itemLevel: 1, slot: 'mainHand', value: 12, upgradeable: true,
    icon: { shape: 'blade', color: '#a39a8a' },
    weapon: {
      family: 'dagger', hands: 1, damage: [{ type: 'pierce', min: 6, max: 8 }], scaling: { finesse: 'A' },
      attacksPerSec: 2.4, reachPx: 40, arcDeg: 70, poiseDamage: 6, staminaCost: 8, moveset: 'dagger', buildup: { bleed: 15 }, critChance: 0.05,
    },
  },
  {
    id: 'item:bearded-axe', name: 'Bearded Axe', description: 'A Hrothi axe, hooked to drag shields down.',
    itemKind: 'weapon', rarity: 'common', itemLevel: 2, slot: 'mainHand', value: 30, upgradeable: true, requirements: { might: 11 },
    icon: { shape: 'axe', color: '#9a8f80' },
    weapon: {
      family: 'axe', hands: 1, damage: [{ type: 'slash', min: 10, max: 14 }], scaling: { might: 'B' },
      attacksPerSec: 1.45, reachPx: 48, arcDeg: 90, poiseDamage: 14, staminaCost: 13, moveset: 'axe', buildup: { bleed: 25 },
    },
  },
  {
    id: 'item:iron-mace', name: 'Iron Mace', description: 'Lanternate clergy shed no blood. They break bones instead.',
    itemKind: 'weapon', rarity: 'common', itemLevel: 2, slot: 'mainHand', value: 30, upgradeable: true, requirements: { might: 11 },
    icon: { shape: 'blunt', color: '#8d8a84' },
    weapon: {
      family: 'mace', hands: 1, damage: [{ type: 'blunt', min: 10, max: 13 }], scaling: { might: 'B', will: 'D' },
      attacksPerSec: 1.45, reachPx: 46, arcDeg: 90, poiseDamage: 22, staminaCost: 13, moveset: 'mace',
    },
  },
  {
    id: 'item:haldish-spear', name: 'Haldish Spear', description: 'Long ash shaft, leaf-bladed head. Keeps trouble at a distance.',
    itemKind: 'weapon', rarity: 'common', itemLevel: 2, slot: 'mainHand', value: 28, upgradeable: true,
    icon: { shape: 'blade', color: '#b5a27c' },
    weapon: {
      family: 'spear', hands: 2, damage: [{ type: 'pierce', min: 11, max: 15 }], scaling: { finesse: 'B', might: 'D' },
      attacksPerSec: 1.35, reachPx: 84, arcDeg: 30, poiseDamage: 12, staminaCost: 13, moveset: 'spear',
    },
  },
  {
    id: 'item:yew-shortbow', name: 'Yew Shortbow', description: 'Quick to draw, easy to carry through thick brush.',
    itemKind: 'weapon', rarity: 'common', itemLevel: 1, slot: 'mainHand', value: 22, upgradeable: true,
    icon: { shape: 'bow', color: '#a8794a' },
    weapon: {
      family: 'bow', hands: 2, damage: [{ type: 'pierce', min: 10, max: 13 }], scaling: { finesse: 'A' },
      attacksPerSec: 1.4, reachPx: 0, arcDeg: 0, poiseDamage: 8, staminaCost: 8, moveset: 'bow',
      projectile: { speed: 640, rangePx: 560, radius: 4, pierce: 0, color: '#e8d9b5' },
    },
  },
  {
    id: 'item:haldish-longbow', name: 'Haldish Longbow', description: 'A war-bow taller than its archer. Slow, and deadly.',
    itemKind: 'weapon', rarity: 'common', itemLevel: 4, slot: 'mainHand', value: 70, upgradeable: true, requirements: { finesse: 13, might: 10 },
    icon: { shape: 'bow', color: '#7e5a35' },
    weapon: {
      family: 'bow', hands: 2, damage: [{ type: 'pierce', min: 15, max: 20 }], scaling: { finesse: 'A', might: 'E' },
      attacksPerSec: 1.0, reachPx: 0, arcDeg: 0, poiseDamage: 14, staminaCost: 10, moveset: 'bow',
      projectile: { speed: 720, rangePx: 640, radius: 4, pierce: 1, color: '#e8d9b5' },
    },
  },
  {
    id: 'item:ashwood-staff', name: 'Ashwood Staff', description: 'An apprentice’s staff, carved from a tree that grew over a ley.',
    itemKind: 'weapon', rarity: 'common', itemLevel: 1, slot: 'mainHand', value: 25, upgradeable: true,
    icon: { shape: 'staff', color: '#c0653a' },
    implicit: [{ stat: 'spellDamage', op: 'increased', value: 0.1 }],
    weapon: {
      family: 'staff', hands: 2, damage: [{ type: 'fire', min: 6, max: 8 }], scaling: { intellect: 'B' },
      attacksPerSec: 1.5, reachPx: 0, arcDeg: 0, poiseDamage: 4, staminaCost: 6, moveset: 'staff', buildup: { burn: 10 },
      projectile: { speed: 440, rangePx: 380, radius: 5, pierce: 0, color: '#ff8a3d' },
    },
  },
  {
    id: 'item:ley-wand', name: 'Ley Wand', description: 'A rod of ley-glass. Quick sparks, little heft.',
    itemKind: 'weapon', rarity: 'common', itemLevel: 3, slot: 'mainHand', value: 45, upgradeable: true, requirements: { intellect: 12 },
    icon: { shape: 'staff', color: '#7fa7d9' },
    implicit: [{ stat: 'castSpeed', op: 'increased', value: 0.05 }],
    weapon: {
      family: 'wand', hands: 1, damage: [{ type: 'lightning', min: 4, max: 6 }], scaling: { intellect: 'C' },
      attacksPerSec: 2.2, reachPx: 0, arcDeg: 0, poiseDamage: 2, staminaCost: 4, moveset: 'wand', buildup: { shock: 10 },
      projectile: { speed: 520, rangePx: 360, radius: 4, pierce: 0, color: '#f7e463' },
    },
  },
];

const offhands: ItemDef[] = [
  {
    id: 'item:oak-kite-shield', name: 'Oak Kite Shield', description: 'Haldish kite shield, iron-rimmed.',
    itemKind: 'offhand', rarity: 'common', itemLevel: 1, slot: 'offHand', value: 18, upgradeable: true,
    icon: { shape: 'shield', color: '#8a6a3f' },
    offhand: { family: 'shield', blockPhysical: 100, stability: 55, parryable: true },
    armor: { weight: 'medium', armor: 4, poise: 4, equipWeight: 4 },
  },
  {
    id: 'item:hrothi-round-shield', name: 'Hrothi Round Shield', description: 'Painted linden boards around a heavy boss.',
    itemKind: 'offhand', rarity: 'common', itemLevel: 3, slot: 'offHand', value: 40, upgradeable: true,
    icon: { shape: 'shield', color: '#6d4c2f' },
    offhand: { family: 'shield', blockPhysical: 95, stability: 45, parryable: true, modifiers: [{ stat: 'parryWindow', op: 'flat', value: 30 }] },
    armor: { weight: 'light', armor: 3, poise: 2, equipWeight: 3 },
  },
  {
    id: 'item:iron-buckler', name: 'Iron Buckler', description: 'A fist-sized shield for those who would rather parry than block.',
    itemKind: 'offhand', rarity: 'common', itemLevel: 2, slot: 'offHand', value: 30, upgradeable: true,
    icon: { shape: 'shield', color: '#9aa0a6' },
    offhand: { family: 'shield', blockPhysical: 70, stability: 30, parryable: true, modifiers: [{ stat: 'parryWindow', op: 'flat', value: 60 }] },
    armor: { weight: 'light', armor: 2, poise: 1, equipWeight: 1.5 },
  },
  {
    id: 'item:hunting-arrows', name: 'Hunting Arrows', description: 'A quiver of plain bodkin and field points.',
    itemKind: 'offhand', rarity: 'common', itemLevel: 1, slot: 'offHand', value: 5,
    icon: { shape: 'misc', color: '#c9b48a' },
    offhand: { family: 'quiver' },
  },
  {
    id: 'item:broadhead-arrows', name: 'Broadhead Arrows', description: 'Wide cutting heads. Prey bleeds out.',
    itemKind: 'offhand', rarity: 'common', itemLevel: 3, slot: 'offHand', value: 35,
    icon: { shape: 'misc', color: '#b04a3a' },
    offhand: { family: 'quiver', projectileOverride: { damage: [], buildup: { bleed: 25 } } },
  },
  {
    id: 'item:apprentice-grimoire', name: 'Apprentice Grimoire', description: 'Margins crowded with someone else’s notes.',
    itemKind: 'offhand', rarity: 'common', itemLevel: 2, slot: 'offHand', value: 40,
    icon: { shape: 'book', color: '#6b4f9a' },
    offhand: { family: 'tome', modifiers: [{ stat: 'spellDamage', op: 'increased', value: 0.08 }, { stat: 'maxMana', op: 'flat', value: 10 }] },
  },
];

export default [...weapons, ...offhands];
