/** Phase 1 classes (SYSTEMS.md §3). Owner: Claude 3. */
import type { ClassDef } from '@/core';

const warden: ClassDef = {
  id: 'class:warden',
  name: 'Warden',
  tagline: 'Shield-sworn of the Marches. Hold the line.',
  description:
    'A frontline fighter with sword and shield. Wardens block and parry to build Resolve, which hardens them against harm, then break enemy guards with Shield Bash.',
  phase: 1,
  primaryAttributes: ['might', 'vigor'],
  baseAttributes: { might: 14, finesse: 10, vigor: 14, intellect: 8, will: 9 },
  resource: {
    id: 'resolve', name: 'Resolve', max: 100, decayPerSec: 5, decayDelayMs: 3000,
    gains: [{ trigger: 'onBlock', amount: 10 }, { trigger: 'onParry', amount: 30 }, { trigger: 'onHurt', amount: 5 }],
    perPoint: [{ stat: 'damageTaken', op: 'increased', value: -0.002 }],
  },
  proficiencies: { weapons: ['sword', 'mace', 'spear'], armor: ['light', 'medium', 'heavy'] },
  startingItems: [
    { item: 'item:iron-arming-sword', equip: true },
    { item: 'item:oak-kite-shield', equip: true },
    { item: 'item:padded-gambeson', equip: true },
    { item: 'item:leather-boots', equip: true },
  ],
  startingAbilities: ['spell:shield-bash'],
  tree: 'skilltree:warden',
  subclasses: [
    { id: 'bulwark', name: 'Bulwark', description: 'Taunts, tower shields and damage return.', unlockLevel: 15, tree: 'skilltree:bulwark' },
    { id: 'vanguard', name: 'Vanguard', description: 'Charges and war-banner auras.', unlockLevel: 15, tree: 'skilltree:vanguard' },
  ],
  color: '#8c9aa8',
};

const ranger: ClassDef = {
  id: 'class:ranger',
  name: 'Ranger',
  tagline: 'Thornwise-taught hunter. Strike from afar.',
  description:
    'A bow-wielding hunter. Full draws taken while standing still build Focus, which sharpens your crits, and Pinning Shot roots prey in place. Keep a hunting knife ready on your second loadout (X).',
  phase: 1,
  primaryAttributes: ['finesse'],
  baseAttributes: { might: 9, finesse: 16, vigor: 11, intellect: 9, will: 10 },
  resource: {
    id: 'focus', name: 'Focus', max: 5, decayPerSec: 0.5, decayDelayMs: 4000,
    gains: [],
    perPoint: [{ stat: 'critChance', op: 'flat', value: 0.06 }],
  },
  proficiencies: { weapons: ['bow', 'dagger', 'spear', 'sword'], armor: ['light', 'medium'] },
  startingItems: [
    { item: 'item:yew-shortbow', equip: true, loadout: 0 },
    { item: 'item:hunting-arrows', equip: true, loadout: 0 },
    { item: 'item:hunting-knife', equip: true, loadout: 1 },
    { item: 'item:leather-jerkin', equip: true },
    { item: 'item:leather-boots', equip: true },
  ],
  startingAbilities: ['spell:pinning-shot'],
  tree: 'skilltree:ranger',
  subclasses: [
    { id: 'deadeye', name: 'Deadeye', description: 'Long shots, crits, and DoTs that can crit.', unlockLevel: 15, tree: 'skilltree:deadeye' },
    { id: 'beastwarden', name: 'Beastwarden', description: 'A Kethra-blessed hawk or wolf companion.', unlockLevel: 15, tree: 'skilltree:beastwarden' },
  ],
  color: '#6f8f4e',
};

const arcanist: ClassDef = {
  id: 'class:arcanist',
  name: 'Arcanist',
  tagline: 'Ley-scholar. Shape the ember.',
  description:
    'A hedge-school mage who draws ember from the leys. Casting builds Attunement to a school, and switching schools spends it on a combo. If you cast without enough Ember, you pay in HP and Cinderlung.',
  phase: 1,
  primaryAttributes: ['intellect', 'will'],
  baseAttributes: { might: 7, finesse: 10, vigor: 9, intellect: 17, will: 12 },
  resource: { id: 'attunement', name: 'Attunement', max: 3, decayPerSec: 0.5, decayDelayMs: 5000, gains: [] },
  proficiencies: { weapons: ['staff', 'wand', 'dagger'], armor: ['light'] },
  startingItems: [
    { item: 'item:ashwood-staff', equip: true },
    { item: 'item:apprentice-robes', equip: true },
    { item: 'item:soft-boots', equip: true },
    { item: 'item:ember-tonic', qty: 2 },
  ],
  startingAbilities: ['spell:ash-bolt'],
  tree: 'skilltree:arcanist',
  subclasses: [
    { id: 'elementalist', name: 'Elementalist', description: 'Three-school combos; Attunement up to 5.', unlockLevel: 15, tree: 'skilltree:elementalist' },
    { id: 'spellblade', name: 'Spellblade', description: 'Melee hits cut spell cooldowns.', unlockLevel: 15, tree: 'skilltree:spellblade' },
  ],
  color: '#c0653a',
};

export default [warden, ranger, arcanist];
