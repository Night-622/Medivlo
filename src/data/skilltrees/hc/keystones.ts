/**
 * Shared keystones (Claude 5 for Claude 3, docs/systems/BUILDS.md §3): the crossover. Any class offered one can take
 * it (Upgrades branch up_p{i}c2, at most 2 per character). Each reshapes a build; trade-offs show both halves.
 * Sim rules these use (Claude 3): spToAttack, auraHitsEnemies, convertPower, spellblade, emberShield.
 * The others reuse rules the school keystones already read (spellsCostHp, unstoppable, berserker).
 */
import type { PerkKind, SharedKeystone } from '@/systems/rules/perkTypes';
import type { Passive } from '@/systems/rules/types';

const ks = (slug: string, name: string, kind: PerkKind, text: string, fx: Passive): SharedKeystone => ({ id: `ks_${slug}`, name, kind, ranks: 1, text: [text], effects: [fx] });

export const HC_SHARED_KEYSTONES: SharedKeystone[] = [
  ks('blood_magic', 'Blood Magic', 'resource', 'Your spells cost health instead of Ember; +20% spell damage.', { hooks: [{ id: 'spellsCostHp' }], mods: [{ stat: 'spellDmg', op: 'flat', value: 0.2 }] }),
  ks('iron_grip', 'Iron Grip', 'conversion', 'Your spell power also adds to your attack damage.', { hooks: [{ id: 'spToAttack', value: 1 }] }), // NEW hook
  ks('arcane_edge', 'Arcane Edge', 'resource', 'Attack hits restore 2 Ember; +10% spell damage.', { mods: [{ stat: 'emberOnHit', op: 'flat', value: 2 }, { stat: 'spellDmg', op: 'flat', value: 0.1 }] }),
  ks('glass_cannon', 'Glass Cannon', 'tradeoff', '+50% damage; you take 50% more damage.', { mods: [{ stat: 'dmg', op: 'flat', value: 0.5 }, { stat: 'dmgTaken', op: 'flat', value: 0.5 }] }),
  ks('untouchable', 'Untouchable', 'tradeoff', 'Your dash recharges 40% faster and costs 30% less stamina; landing a dash, take 25% less damage for 1.5 s (2 s); −10% armour.',
    { mods: [{ stat: 'dashCd', op: 'flat', value: -0.4 }, { stat: 'staminaCost', op: 'flat', value: -0.3 }, { stat: 'armor', op: 'pct', value: -0.1 }],
      procs: [{ on: 'dashEnd', icd: 2000, do: [{ a: 'buff', id: 'ks:untouchable', dur: 1500, to: 'self', mods: [{ stat: 'dmgTaken', op: 'flat', value: -0.25 }] }] }] }),
  ks('conduit', 'Conduit', 'aura', 'You gain an aura: you and allies within 140 px deal 6% more damage. Your auras also strike foes around you.',
    { hooks: [{ id: 'auraHitsEnemies' }], aura: [{ id: 'ks:conduit', r: 140, mods: [{ stat: 'dmg', op: 'flat', value: 0.06 }] }] }), // NEW hook
  ks('pack_leader', 'Pack Leader', 'tradeoff', 'Your summons deal 60% more damage and have 60% more health; your totems, traps and falcon strike 35% harder; you deal 10% less.',
    { mods: [{ stat: 'minionDmg', op: 'flat', value: 0.6 }, { stat: 'minionHp', op: 'flat', value: 0.6 }, { stat: 'dmg', op: 'flat', value: -0.1 }],
      spellMods: ['spell:tesla-totem', 'spell:arc-mine', 'spell:bear-trap', 'spell:spike-trap', 'spell:stoop', 'spell:harry', 'spell:talon-rake', 'spell:sky-hunt'].map((spell) => ({ spell, dmg: 0.35 })) }),
  ks('elementalist', 'Elementalist', 'conversion', 'All your damage conversions are 25% stronger; +5% damage.', { hooks: [{ id: 'convertPower', value: 0.25 }], mods: [{ stat: 'dmg', op: 'flat', value: 0.05 }] }), // NEW hook
  ks('spellblade', 'Spellblade', 'trigger', 'Every 4th basic attack also casts your slot-1 spell at 40% power.', { hooks: [{ id: 'spellblade', value: 0.4 }] }), // NEW hook
  ks('juggernaut_heart', 'Juggernaut Heart', 'tradeoff', 'You cannot be stunned; −15% move speed.', { hooks: [{ id: 'unstoppable' }], mods: [{ stat: 'moveSpeed', op: 'flat', value: -0.15 }] }),
  ks('executioner', 'Executioner', 'tradeoff', '+50% damage to foes below 30% health; −5% damage otherwise.',
    { mods: [{ stat: 'dmg', op: 'flat', value: 0.55, when: { c: 'targetHpBelow', pct: 0.3 } }, { stat: 'dmg', op: 'flat', value: -0.05 }] }),
  ks('vampire', 'Vampire', 'tradeoff', '+10% of damage healed back; −10% max health.', { mods: [{ stat: 'lifesteal', op: 'flat', value: 0.1 }, { stat: 'hp', op: 'pct', value: -0.1 }] }),
  ks('ember_shield', 'Ember Shield', 'resource', '15% of the damage you take is paid from Ember instead; +40% max Ember and +1 Ember per second.',
    { hooks: [{ id: 'emberShield', value: 0.15 }], mods: [{ stat: 'ember', op: 'pct', value: 0.4 }, { stat: 'emberRegen', op: 'flat', value: 1 }] }),
  ks('berserker', 'Berserker', 'tradeoff', '+3% damage for every 10% of health you are missing; −10% armour.', { hooks: [{ id: 'berserker', value: 0.03 }], mods: [{ stat: 'armor', op: 'pct', value: -0.1 }] }),
  ks('fortress', 'Fortress', 'tradeoff', 'After standing still for 1 s you take 30% less damage; −10% move speed.',
    { mods: [{ stat: 'dmgTaken', op: 'flat', value: -0.3, when: { c: 'stationary', ms: 1000 } }, { stat: 'moveSpeed', op: 'flat', value: -0.1 }] }),
  ks('tempest', 'Tempest', 'trigger', 'Every 5th hit chains lightning to 3 foes for 40% weapon power.', { procs: [{ on: 'hit', every: 5, do: [{ a: 'chain', coef: 0.4, kind: 'storm', jumps: 3, range: 140 }] }] }),
  ks('hoarder', 'Hoarder', 'resource', '+40% Embershards and +15% rarer loot.',
    { mods: [{ stat: 'gold', op: 'flat', value: 0.4 }, { stat: 'itemFind', op: 'flat', value: 0.15 }] }),
  ks('phase_step', 'Phase Step', 'tradeoff', 'Landing a dash grants a shield of 10% max health (2 s); your dash recharges 25% slower.',
    { procs: [{ on: 'dashEnd', icd: 2000, do: [{ a: 'shield', pctMax: 0.1, dur: 3000, to: 'self' }] }], mods: [{ stat: 'dashCd', op: 'flat', value: 0.25 }] }),
  ks('chain_reaction', 'Chain Reaction', 'trigger', 'Kills explode, hitting foes within 96 px of the body for 90% power; every 6th hit sparks a small blast of 30%.',
    { procs: [{ on: 'kill', do: [{ a: 'damage', coef: 0.9, area: { shape: 'circle', at: 'target', r: 96 } }] }, { on: 'hit', every: 6, do: [{ a: 'damage', coef: 0.3, area: { shape: 'circle', at: 'target', r: 56 } }] }] }),
  ks('lifebinder', 'Lifebinder', 'tradeoff', '+35% healing done and received; your spells cost 10% more.',
    { mods: [{ stat: 'healing', op: 'flat', value: 0.35 }, { stat: 'healingTaken', op: 'flat', value: 0.35 }, { stat: 'emberCost', op: 'flat', value: 0.1 }] }),
];

/** The 3 shared keystones each class is offered (fit to the class; Pack Leader only for classes with a summon). */
export const KEYSTONE_OFFERS: Record<string, [string, string, string]> = {
  arcanist: ['ks_glass_cannon', 'ks_elementalist', 'ks_blood_magic'],
  reaver: ['ks_elementalist', 'ks_vampire', 'ks_executioner'],
  warden: ['ks_conduit', 'ks_fortress', 'ks_juggernaut_heart'],
  rimecaller: ['ks_blood_magic', 'ks_ember_shield', 'ks_chain_reaction'],
  stormlancer: ['ks_spellblade', 'ks_untouchable', 'ks_arcane_edge'],
  sparkwright: ['ks_pack_leader', 'ks_iron_grip', 'ks_ember_shield'],
  oathbound: ['ks_iron_grip', 'ks_conduit', 'ks_spellblade'],
  cantor: ['ks_conduit', 'ks_arcane_edge', 'ks_lifebinder'],
  shade: ['ks_glass_cannon', 'ks_executioner', 'ks_elementalist'],
  duskweaver: ['ks_blood_magic', 'ks_vampire', 'ks_chain_reaction'],
  ranger: ['ks_glass_cannon', 'ks_tempest', 'ks_phase_step'],
  hedgewitch: ['ks_ember_shield', 'ks_lifebinder', 'ks_blood_magic'],
  swordsman: ['ks_arcane_edge', 'ks_untouchable', 'ks_spellblade'],
  samurai: ['ks_glass_cannon', 'ks_executioner', 'ks_phase_step'],
  knight: ['ks_arcane_edge', 'ks_fortress', 'ks_juggernaut_heart'],
  juggernaut: ['ks_berserker', 'ks_chain_reaction', 'ks_vampire'],
  monk: ['ks_untouchable', 'ks_tempest', 'ks_phase_step'],
  brawler: ['ks_juggernaut_heart', 'ks_berserker', 'ks_vampire'],
  huntsman: ['ks_pack_leader', 'ks_executioner', 'ks_hoarder'],
  falconer: ['ks_pack_leader', 'ks_phase_step', 'ks_hoarder'],
  corsair: ['ks_hoarder', 'ks_tempest', 'ks_berserker'],
  jester: ['ks_glass_cannon', 'ks_hoarder', 'ks_untouchable'],
  bard: ['ks_conduit', 'ks_lifebinder', 'ks_tempest'],
  skald: ['ks_berserker', 'ks_juggernaut_heart', 'ks_chain_reaction'],
};
