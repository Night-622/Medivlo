/**
 * Iron perks (Claude 5 for Claude 3, docs/systems/BUILDS.md §3; slots in rules/perkTypes.ts). Knight and Juggernaut
 * signatures (12 each, path i themed on kit spell i and the new kit spell i+3) and 8 Iron school perks. Martial: the
 * builds turn on blocking, stamina, charges and retaliation, not only attack damage. Each exclusive c1 / c2 pair is two
 * different playstyles. effects[r-1] is the whole effect at rank r. Budgets: HOLLOW_CROWN.md §2.1.
 */
import type { ClassPerks, PerkDef, PerkKind, SchoolPerks } from '@/systems/rules/perkTypes';
import type { Passive } from '@/systems/rules/types';

const one = (id: string, name: string, kind: PerkKind, text: string, fx: Passive): PerkDef => ({ id, name, kind, ranks: 1, text: [text], effects: [fx] });
/** 3-rank perks are front-loaded: text / fx get a rank weight of 1.5 / 2.25 / 3 (rank 3 as written, rank 1 half of it) */
const RANK_W = [1.5, 2.25, 3];
const three = (id: string, name: string, kind: PerkKind, text: (r: number) => string, fx: (r: number) => Passive): PerkDef =>
  ({ id, name, kind, ranks: 3, text: RANK_W.map(text), effects: RANK_W.map(fx) });
const near = (r: number) => ({ shape: 'circle' as const, at: 'self' as const, r });
const tgt = { shape: 'single' as const, at: 'target' as const };

const CHARGE = 'spell:shield-charge', OATH = 'spell:oathblade', RESOLVE = 'spell:iron-resolve';
const QUAKE = 'spell:maul-quake', UNSTOP = 'spell:unstoppable', SPIKES = 'spell:spiked-hide';

const knight: ClassPerks = {
  classId: 'knight',
  signature: [
    // path 0: Shield Charge (+ new spell 3): the charge
    one('pk_knight_lance_charge', 'Lance Charge', 'power', '+1 to Shield Charge and Ride Down.',
      { spellLevels: [{ spell: CHARGE, levels: 1 }, { spell: 'spell:ride-down', levels: 1 }] }),
    three('pk_knight_impact', 'Impact', 'trigger', (r) => `Landing a dash: +${r * 6}% damage and armour for 3 s.`,
      (r) => ({ procs: [{ on: 'dashEnd', do: [{ a: 'buff', id: 'kn:impact', dur: 3000, to: 'self', mods: [{ stat: 'dmg', op: 'flat', value: 0.06 * r }, { stat: 'armor', op: 'pct', value: 0.06 * r }] }] }] })),
    one('pk_knight_trample', 'Trample', 'trigger', 'Landing a dash knocks down the foes around you for 1 s, once every 3 s.',
      { procs: [{ on: 'dashEnd', icd: 3000, do: [{ a: 'status', status: { id: 'knockdown', dur: 1000 }, area: near(56) }] }] }),
    one('pk_knight_heavy_horse', 'Heavy Horse', 'tradeoff', '+30% attack damage and +15% armour; dashing costs 40% more stamina.',
      { mods: [{ stat: 'attackDmg', op: 'flat', value: 0.3 }, { stat: 'armor', op: 'pct', value: 0.15 }, { stat: 'staminaCost', op: 'flat', value: 0.4 }] }),
    // path 1: Oathblade (+ new spell 4): holding their eyes
    one('pk_knight_binding_oath', 'Binding Oath', 'power', 'Oathblade recharges 20% faster and hits 25% harder.', { spellMods: [{ spell: OATH, cd: -0.2, dmg: 0.25 }] }),
    three('pk_knight_shield_wall', 'Shield Wall', 'power', (r) => `+${r * 4}% block chance.`, (r) => ({ mods: [{ stat: 'block', op: 'flat', value: 0.04 * r }] })),
    one('pk_knight_shield_bash', 'Shield Bash', 'trigger', 'Blocking stuns the attacker for 0.8 s, once every 2 s; +5% block chance.',
      { mods: [{ stat: 'block', op: 'flat', value: 0.05 }], procs: [{ on: 'block', icd: 2000, do: [{ a: 'status', status: { id: 'stun', dur: 800 }, area: tgt }] }] }),
    one('pk_knight_rallying_banner', 'Rallying Banner', 'aura', 'You and allies near you gain 12% armour and 6% damage.',
      { aura: [{ id: 'kn:banner', r: 160, mods: [{ stat: 'armor', op: 'pct', value: 0.12 }, { stat: 'dmg', op: 'flat', value: 0.06 }] }] }),
    // path 2: Iron Resolve (+ new spell 5): standing through it
    one('pk_knight_steel_resolve', 'Steel Resolve', 'power', 'Iron Resolve recharges 25% faster; +6% armour.', { spellMods: [{ spell: RESOLVE, cd: -0.25 }], mods: [{ stat: 'armor', op: 'pct', value: 0.06 }] }),
    three('pk_knight_plate_drill', 'Plate Drill', 'power', (r) => `+${r * 5}% armour and +${r * 2}% max health.`,
      (r) => ({ mods: [{ stat: 'armor', op: 'pct', value: 0.05 * r }, { stat: 'hp', op: 'pct', value: 0.02 * r }] })),
    one('pk_knight_iron_will', 'Unbending', 'power', 'Below 30% health you take 25% less damage.',
      { mods: [{ stat: 'dmgTaken', op: 'flat', value: -0.25, when: { c: 'hpBelow', pct: 0.3 } }] }),
    one('pk_knight_vengeance', 'Vengeance', 'trigger', 'When hit: +12% damage for 3 s, once every 2 s.',
      { procs: [{ on: 'hurt', icd: 2000, do: [{ a: 'buff', id: 'kn:vengeance', dur: 3000, to: 'self', mods: [{ stat: 'dmg', op: 'flat', value: 0.12 }] }] }] }),
  ],
};

const juggernaut: ClassPerks = {
  classId: 'juggernaut',
  signature: [
    // path 0: Maul Quake (+ new spell 3): the earth shakes
    one('pk_juggernaut_deep_quake', 'Deep Quake', 'power', '+1 to Maul Quake and Seismic Slam.',
      { spellLevels: [{ spell: QUAKE, levels: 1 }, { spell: 'spell:seismic-slam', levels: 1 }] }),
    three('pk_juggernaut_crushing', 'Crushing Blows', 'power', (r) => `+${r * 8}% damage to stunned foes; +${(1.5 * r).toFixed(1)}% damage to all foes.`,
      (r) => ({ mods: [{ stat: 'dmg', op: 'flat', value: 0.015 * r }, { stat: 'dmg', op: 'flat', value: 0.08 * r, when: { c: 'targetHas', status: 'stun' } }] })),
    one('pk_juggernaut_aftershock', 'Aftershock', 'trigger', 'Setting any status sends a quake around the foe for 50% weapon power, once every 1 s.',
      { procs: [{ on: 'statusApplied', icd: 1000, do: [{ a: 'damage', coef: 0.5, kind: 'iron', area: { shape: 'circle', at: 'target', r: 64 } }] }] }),
    one('pk_juggernaut_avalanche', 'Avalanche', 'tradeoff', '+35% attack damage, −10% attack speed.',
      { mods: [{ stat: 'attackDmg', op: 'flat', value: 0.35 }, { stat: 'atkSpeed', op: 'flat', value: -0.1 }] }),
    // path 1: Unstoppable (+ new spell 4): through walls of foes
    one('pk_juggernaut_battering', 'Battering Ram', 'power', 'Unstoppable recharges 20% faster and hits 25% harder.', { spellMods: [{ spell: UNSTOP, cd: -0.2, dmg: 0.25 }] }),
    three('pk_juggernaut_momentum', 'Rolling Weight', 'power', (r) => `+${r * 5}% damage while moving, +${r.toFixed(1)}% while standing still.`,
      (r) => ({ mods: [{ stat: 'dmg', op: 'flat', value: 0.01 * r }, { stat: 'dmg', op: 'flat', value: 0.05 * r, when: { c: 'moving' } }] })),
    one('pk_juggernaut_shockwave', 'Shockwave Stride', 'trigger', 'Landing a dash stuns the foes around you for 0.6 s, once every 4 s; +4% damage.',
      { mods: [{ stat: 'dmg', op: 'flat', value: 0.04 }], procs: [{ on: 'dashEnd', icd: 4000, do: [{ a: 'status', status: { id: 'stun', dur: 600 }, area: near(64) }] }] }),
    one('pk_juggernaut_iron_lungs', 'Iron Lungs', 'resource', 'Kills restore 15 stamina; +20 max stamina.',
      { mods: [{ stat: 'staminaOnKill', op: 'flat', value: 15 }, { stat: 'stamina', op: 'flat', value: 20 }] }),
    // path 2: Spiked Hide (+ new spell 5): hurt to hit
    one('pk_juggernaut_long_spikes', 'Long Spikes', 'power', 'Spiked Hide recharges 25% faster and lasts 30% longer.', { spellMods: [{ spell: SPIKES, cd: -0.25, dur: 0.3 }] }),
    three('pk_juggernaut_thick_hide', 'Thick Hide', 'power', (r) => `+${r * 4}% max health and +${r * 3}% armour.`,
      (r) => ({ mods: [{ stat: 'hp', op: 'pct', value: 0.04 * r }, { stat: 'armor', op: 'pct', value: 0.03 * r }] })),
    one('pk_juggernaut_retribution', 'Retribution', 'trigger', 'When hit: strike back for 60% weapon power, once every 1 s.',
      { procs: [{ on: 'hurt', icd: 1000, do: [{ a: 'damage', coef: 0.6, kind: 'iron', area: tgt }] }] }),
    one('pk_juggernaut_bloodied', 'Bloodied Giant', 'power', 'Below 50% health: +20% damage and +10% attack speed.',
      { mods: [{ stat: 'dmg', op: 'flat', value: 0.2, when: { c: 'hpBelow', pct: 0.5 } }, { stat: 'atkSpeed', op: 'flat', value: 0.1, when: { c: 'hpBelow', pct: 0.5 } }] }),
  ],
};

const school: PerkDef[] = [
  // p0 offence
  one('pk_iron_tempered', 'Tempered', 'power', '+12% Iron damage and +10% critical damage.',
    { mods: [{ stat: 'dmg.iron', op: 'flat', value: 0.12 }, { stat: 'critd', op: 'flat', value: 0.1 }] }),
  one('pk_iron_armour_breaker', 'Armour Breaker', 'trigger', 'Hits have a 15% chance to make the foe vulnerable for 3 s.',
    { procs: [{ on: 'hit', chance: 0.15, do: [{ a: 'status', status: { id: 'vulnerable', dur: 3000 }, area: tgt }] }] }),
  // p1 defence
  three('pk_iron_bulwark', 'Bulwark', 'power', (r) => `+${r * 5}% armour and +${r * 2}% block chance.`,
    (r) => ({ mods: [{ stat: 'armor', op: 'pct', value: 0.05 * r }, { stat: 'block', op: 'flat', value: 0.02 * r }] })),
  one('pk_iron_unshaken', 'Unshaken', 'power', '40% shorter stuns; you take 5% less damage.',
    { mods: [{ stat: 'stunTaken', op: 'flat', value: -0.4 }, { stat: 'dmgTaken', op: 'flat', value: -0.05 }] }),
  one('pk_iron_last_bastion', 'Last Bastion', 'trigger', 'Below 50% health: a shield of 25% max health, once every 60 s.',
    { procs: [{ on: 'lowHp', icd: 60000, do: [{ a: 'shield', pctMax: 0.25, dur: 6000, to: 'self' }] }] }),
  // p2 focus / resource
  three('pk_iron_drilled', 'Drilled', 'resource', (r) => `+${r * 10} max stamina and ${r * 2}% shorter cooldowns.`,
    (r) => ({ mods: [{ stat: 'stamina', op: 'flat', value: 10 * r }, { stat: 'cdr', op: 'flat', value: 0.02 * r }] })),
  one('pk_iron_second_wind', 'Second Wind', 'resource', 'Blocking restores 8 stamina and 3 Ember.',
    { procs: [{ on: 'block', icd: 500, do: [{ a: 'resource', stamina: 8, ember: 3 }] }] }),
  one('pk_iron_forge_born', 'Forge-born', 'power', '+8% max health and +5% Iron damage.',
    { mods: [{ stat: 'hp', op: 'pct', value: 0.08 }, { stat: 'dmg.iron', op: 'flat', value: 0.05 }] }),
];

export const PERKS: SchoolPerks = { school: 'iron', classes: [knight, juggernaut], perks: school };
