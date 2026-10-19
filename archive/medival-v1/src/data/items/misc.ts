/** Consumables, materials, quest items and tomes. Owner: Claude 3 (quest item ids agreed with Claude 4). */
import type { ItemDef } from '@/core';

const consumables: ItemDef[] = [
  {
    id: 'item:ember-tonic', name: 'Ember Tonic', description: 'Restores 40 Ember. Tastes of hot copper.',
    itemKind: 'consumable', rarity: 'common', itemLevel: 1, stack: 10, value: 12, icon: { shape: 'potion', color: '#3b6fd1' },
    consumable: { category: 'potion', useTimeMs: 400, cooldownMs: 2000, effects: [], restore: { mana: 40 } },
  },
  {
    id: 'item:healing-poultice', name: 'Healing Poultice', description: 'Heals 25% HP over 3 seconds.',
    itemKind: 'consumable', rarity: 'common', itemLevel: 1, stack: 10, value: 15, icon: { shape: 'potion', color: '#9b2c2c' },
    consumable: { category: 'potion', useTimeMs: 600, cooldownMs: 4000, effects: [], heal: { pct: 0.25, overMs: 3000 } },
  },
  {
    id: 'item:stamina-draught', name: 'Stamina Draught', description: 'Refills stamina instantly.',
    itemKind: 'consumable', rarity: 'common', itemLevel: 1, stack: 10, value: 10, icon: { shape: 'potion', color: '#4f9d4a' },
    consumable: { category: 'potion', useTimeMs: 300, cooldownMs: 3000, effects: [], restore: { stamina: 999 } },
  },
  {
    id: 'item:hearty-stew', name: 'Hearty Stew', description: 'For 10 minutes: +2 HP regen and +10 max stamina.',
    itemKind: 'consumable', rarity: 'common', itemLevel: 1, stack: 5, value: 8, icon: { shape: 'misc', color: '#a0703a' },
    consumable: {
      category: 'food', useTimeMs: 1200, cooldownMs: 1000, durationMs: 600_000,
      effects: [{ kind: 'modifier', mod: { stat: 'hpRegen', op: 'flat', value: 2 } }, { kind: 'modifier', mod: { stat: 'maxStamina', op: 'flat', value: 10 } }],
    },
  },
  {
    id: 'item:fire-oil', name: 'Fire Oil', description: 'Coat a weapon: for 3 minutes, hits add Burn buildup and +8% damage.',
    itemKind: 'consumable', rarity: 'common', itemLevel: 2, stack: 5, value: 25, icon: { shape: 'potion', color: '#ff8a3d' },
    consumable: {
      category: 'oil', useTimeMs: 1500, cooldownMs: 1000, durationMs: 180_000,
      effects: [
        { kind: 'modifier', mod: { stat: 'meleeDamage', op: 'increased', value: 0.08 } },
        { kind: 'applyStatus', trigger: 'onHit', status: 'burn', target: 'target', buildup: 20 },
      ],
    },
  },
];

const material = (id: string, name: string, description: string, color: string, value = 4): ItemDef => ({
  id: `item:${id}`, name, description, itemKind: 'material', rarity: 'common', itemLevel: 1, stack: 99, value, icon: { shape: 'gem', color },
});
const materials: ItemDef[] = [
  material('wolf-pelt', 'Wolf Pelt', 'Thick grey fur. Tanners pay for these.', '#8a8a8a', 6),
  material('mire-residue', 'Mire Residue', 'Black slime that will not wash off. Ashmarked hands burn it clean.', '#2c3a2e', 5),
  material('iron-scrap', 'Iron Scrap', 'Salvage for the forge.', '#8d9196', 3),
  material('ley-dust', 'Ley-Dust', 'Glittering dust from salvaged enchantments.', '#7fc4d9', 8),
  material('essence-ash', 'Essence of Ash', 'A school essence. Used to raise Ash spells past rank 3.', '#ff8a3d', 30),
  material('essence-rime', 'Essence of Rime', 'A school essence. Used to raise Rime spells past rank 3.', '#8fd3ff', 30),
  material('drowned-silver-flake', 'Drowned Silver Flake', 'Cold, tarnished and faintly humming.', '#5f7f86', 25),
  { ...material('white-stag-antler', 'White Stag Antler', 'Pale bone with something holy, or something rotten, still inside it.', '#f1ead8', 120), stack: 1, tags: ['trophy'] },
];

const quest = (id: string, name: string, description: string): ItemDef => ({
  id: `item:${id}`, name, description, itemKind: 'quest', rarity: 'common', itemLevel: 1, value: 0, icon: { shape: 'misc', color: '#d4a646' },
});
const questItems: ItemDef[] = [
  quest('pyre-tinder', 'Pyre Tinder', 'Dry kindling for the festival pyre.'),
  quest('stag-tears', 'Stag’s Tears', 'Black tears from the Hollowed White Stag, gone clear once the beast was cleansed.'),
  quest('briar-salve', 'Briar Salve', 'Nan Briar’s salve. It smells of thorn and honey.'),
  quest('sluice-key', 'Sluice Key', 'Opens the old sluice gates of the Wennamere.'),
  quest('choir-hymnal', 'Choir Hymnal', 'Drowned Choir hymns, written in water-stained ink.'),
  quest('mill-key', 'Mill Key', 'A heavy iron key to the miller’s cellar.'),
  quest('wardens-token', 'Warden’s Token', 'A tarnished Emberwarden badge.'),
];

const tomes: ItemDef[] = [
  {
    id: 'item:tome-frostbite', name: 'Tome: Frostbite', description: 'Teaches the Rime spell Frostbite. Nan Briar’s spidery hand fills the margins.',
    itemKind: 'tome', rarity: 'uncommon', itemLevel: 1, value: 120, teaches: 'spell:frostbite', icon: { shape: 'book', color: '#8fd3ff' },
  },
  {
    id: 'item:tome-ember-burst', name: 'Tome: Ember Burst', description: 'Teaches the Ash spell Ember Burst.',
    itemKind: 'tome', rarity: 'uncommon', itemLevel: 2, value: 140, teaches: 'spell:ember-burst', requirements: { intellect: 11 }, icon: { shape: 'book', color: '#ff8a3d' },
  },
];

export default [...consumables, ...materials, ...questItems, ...tomes];
