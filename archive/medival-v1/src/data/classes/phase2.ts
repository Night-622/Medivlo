/** Phase 2 classes (SYSTEMS.md §3): Reaver, Shade, Oathbound. Owner: Claude 3. */
import type { ClassDef } from '@/core';

const reaver: ClassDef = {
  id: 'class:reaver',
  name: 'Reaver',
  tagline: 'Wolf-sworn of the north. Spend your blood, take theirs.',
  description:
    'A two-handed berserker who draws ember from their own warmth: Bloodcraft powers cost HP and hit harder the more you have bled. Dealing and taking damage builds Fury, which quickens every swing. The Church hates the practice; the Drowned Choir covets those who master it.',
  phase: 2,
  primaryAttributes: ['might', 'vigor'],
  baseAttributes: { might: 16, finesse: 9, vigor: 15, intellect: 7, will: 8 },
  resource: {
    id: 'fury', name: 'Fury', max: 100, decayPerSec: 8, decayDelayMs: 2500,
    gains: [{ trigger: 'onHit', amount: 4 }, { trigger: 'onHurt', amount: 6 }, { trigger: 'onKill', amount: 15 }],
    perPoint: [{ stat: 'attackSpeed', op: 'increased', value: 0.002 }],
  },
  proficiencies: { weapons: ['greataxe', 'axe', 'greatsword', 'warhammer'], armor: ['medium', 'heavy'] },
  startingItems: [
    { item: 'item:bearded-greataxe', equip: true },
    { item: 'item:wolfhide-coat', equip: true },
    { item: 'item:leather-boots', equip: true },
  ],
  startingAbilities: ['spell:blood-rend'],
  tree: 'skilltree:reaver',
  subclasses: [
    { id: 'bloodletter', name: 'Bloodletter', description: 'Bleed, leech, and HP-cost scaling.', unlockLevel: 15, tree: 'skilltree:bloodletter' },
    { id: 'juggernaut', name: 'Juggernaut', description: 'Poise and unstoppable heavies.', unlockLevel: 15, tree: 'skilltree:juggernaut' },
  ],
  color: '#9b2c2c',
};

const shade: ClassDef = {
  id: 'class:shade',
  name: 'Shade',
  tagline: 'The Quiet Hand. Strike once, from nowhere.',
  description:
    'A dagger-fighter of the Quiet Hand. Shadowstep slips you into stealth, and your first strike from stealth is a guaranteed crit for double damage. Dagger hits build Venom, which thickens the poison you leave behind.',
  phase: 2,
  primaryAttributes: ['finesse', 'intellect'],
  baseAttributes: { might: 9, finesse: 17, vigor: 10, intellect: 11, will: 8 },
  resource: {
    id: 'venom', name: 'Venom', max: 5, decayPerSec: 0.5, decayDelayMs: 4000,
    gains: [{ trigger: 'onHit', amount: 1 }],
    perPoint: [{ stat: 'buildup.poison', op: 'flat', value: 0.12 }],
  },
  proficiencies: { weapons: ['dagger', 'sword', 'crossbow'], armor: ['light'] },
  startingItems: [
    { item: 'item:quiet-hand-dagger', equip: true },
    { item: 'item:dark-leathers', equip: true },
    { item: 'item:soft-boots', equip: true },
  ],
  startingAbilities: ['spell:shadowstep'],
  tree: 'skilltree:shade',
  subclasses: [
    { id: 'assassin', name: 'Assassin', description: 'Stealth burst and executes.', unlockLevel: 15, tree: 'skilltree:assassin' },
    { id: 'hexblade', name: 'Hexblade', description: 'Umbral curses on dagger hits.', unlockLevel: 15, tree: 'skilltree:hexblade' },
  ],
  color: '#3a1c5c',
};

const oathbound: ClassDef = {
  id: 'class:oathbound',
  name: 'Oathbound',
  tagline: 'Lightsworn of the Lanternate. Hold the light up.',
  description:
    'A warrior-priest of Ithren, the Lantern. Mace and talisman: smite with Radiance, ward yourself, and consecrate the ground. Devotion builds as you strike and heal; at full Devotion your next prayer is empowered and costs no cooldown.',
  phase: 2,
  primaryAttributes: ['will', 'might'],
  baseAttributes: { might: 12, finesse: 8, vigor: 12, intellect: 8, will: 15 },
  resource: {
    id: 'devotion', name: 'Devotion', max: 100, decayPerSec: 2, decayDelayMs: 6000,
    gains: [{ trigger: 'onHit', amount: 6 }, { trigger: 'onBlock', amount: 8 }, { trigger: 'onCast', amount: 4 }],
  },
  proficiencies: { weapons: ['mace', 'warhammer', 'sword'], armor: ['medium', 'heavy'] },
  startingItems: [
    { item: 'item:lantern-mace', equip: true },
    { item: 'item:pilgrim-talisman', equip: true },
    { item: 'item:chain-hauberk', equip: true },
    { item: 'item:leather-boots', equip: true },
  ],
  startingAbilities: ['spell:lantern-smite'],
  tree: 'skilltree:oathbound',
  subclasses: [
    { id: 'lightbringer', name: 'Lightbringer', description: 'Heals, wards and auras.', unlockLevel: 15, tree: 'skilltree:lightbringer' },
    { id: 'inquisitor', name: 'Inquisitor', description: 'The Order of the Wick: Radiance damage, anti-Mire, anti-mage.', unlockLevel: 15, tree: 'skilltree:inquisitor' },
  ],
  color: '#d4a646',
};

export default [reaver, shade, oathbound];
