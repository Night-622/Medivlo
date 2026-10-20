/**
 * Storm perks (Claude 5 for Claude 3, docs/systems/BUILDS.md §3; slots in rules/perkTypes.ts). Stormlancer and
 * Sparkwright signatures (12 each, path i themed on kit spell i and the new kit spell i+3) and 8 Storm school perks.
 * Each exclusive c1 / c2 pair is two different playstyles. effects[r-1] is the whole effect at rank r. Numbers follow
 * the HOLLOW_CROWN.md §2.1 budgets: a perk ≈ a 3-rank node of the old tree; trade-offs net about +20%.
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

const LUNGE = 'spell:lightning-lunge', COND = 'spell:conductor', SKY = 'spell:skybreak';
const ARC = 'spell:arc-gauntlet', TOTEM = 'spell:tesla-totem', OVER = 'spell:overcharge';

const stormlancer: ClassPerks = {
  classId: 'stormlancer',
  signature: [
    // path 0: Lightning Lunge (+ new spell 3): striking along the lance
    one('pk_stormlancer_bright_lance', 'Bright Lance', 'power', '+1 to Lightning Lunge and Thunder Charge.',
      { spellLevels: [{ spell: LUNGE, levels: 1 }, { spell: 'spell:thunder-charge', levels: 1 }] }),
    three('pk_stormlancer_momentum', 'Charge Momentum', 'trigger', (r) => `Landing a dash: +${r * 6}% damage for 3 s.`,
      (r) => ({ procs: [{ on: 'dashEnd', do: [{ a: 'buff', id: 'stl:charge', dur: 3000, to: 'self', mods: [{ stat: 'dmg', op: 'flat', value: 0.06 * r }] }] }] })),
    one('pk_stormlancer_thunderstep', 'Thunderstep', 'trigger', 'Landing a dash shocks the foes around you.',
      { procs: [{ on: 'dashEnd', icd: 1000, do: [{ a: 'damage', coef: 0.5, kind: 'storm', area: near(64), status: [{ id: 'shock', dur: 2000 }] }] }] }),
    one('pk_stormlancer_lancers_reach', 'Lancer’s Reach', 'tradeoff', '+30% attack damage; dashing costs 30% more stamina.',
      { mods: [{ stat: 'attackDmg', op: 'flat', value: 0.3 }, { stat: 'staminaCost', op: 'flat', value: 0.3 }] }),
    // path 1: Conductor (+ new spell 4): lightning that jumps
    one('pk_stormlancer_live_wire', 'Live Wire', 'power', 'Conductor recharges 20% faster and lasts 30% longer.', { spellMods: [{ spell: COND, cd: -0.2, dur: 0.3 }] }),
    three('pk_stormlancer_arc_reach', 'Arc Reach', 'power', (r) => `Your chains jump to ${r >= 3 ? '2 more foes' : '1 more foe'} and deal +${r * 5}% Storm damage.`,
      (r) => ({ mods: [{ stat: 'chains', op: 'flat', value: r >= 3 ? 2 : 1 }, { stat: 'dmg.storm', op: 'flat', value: 0.05 * r }] })),
    one('pk_stormlancer_overload', 'Overload', 'power', '+25% damage to shocked foes.',
      { mods: [{ stat: 'dmg', op: 'flat', value: 0.25, when: { c: 'targetHas', status: 'shock' } }] }),
    one('pk_stormlancer_static_field', 'Static Field', 'aura', 'Foes near you take 8% more damage.',
      { aura: [{ id: 'stl:static', r: 120, enemies: true, mods: [{ stat: 'dmgTaken', op: 'flat', value: 0.08 }] }] }),
    // path 2: Skybreak (+ new spell 5): calling the bolt
    one('pk_stormlancer_open_sky', 'Open Sky', 'power', 'Skybreak recharges 20% faster and costs 15% less and hits 25% harder.', { spellMods: [{ spell: SKY, cd: -0.2, cost: -0.15, dmg: 0.25 }] }),
    three('pk_stormlancer_thunderhead', 'Thunderhead', 'trigger', (r) => `Critical hits have a ${r * 10}% chance to call a bolt on the target; +${r.toFixed(1)}% critical chance.`,
      (r) => ({ mods: [{ stat: 'crit', op: 'flat', value: 0.01 * r }], procs: [{ on: 'crit', chance: 0.1 * r, icd: 500, do: [{ a: 'damage', coef: 0.6, kind: 'storm', area: tgt }] }] })),
    one('pk_stormlancer_eye_of_storm', 'Eye of the Storm', 'power', 'Below 50% health: take 15% less damage and deal 15% more.',
      { mods: [{ stat: 'dmgTaken', op: 'flat', value: -0.15, when: { c: 'hpBelow', pct: 0.5 } }, { stat: 'dmg', op: 'flat', value: 0.15, when: { c: 'hpBelow', pct: 0.5 } }] }),
    one('pk_stormlancer_galeborn', 'Galeborn', 'power', '+8% move speed and +1 dash charge.',
      { mods: [{ stat: 'moveSpeed', op: 'flat', value: 0.08 }, { stat: 'dashCharges', op: 'flat', value: 1 }] }),
  ],
};

const sparkwright: ClassPerks = {
  classId: 'sparkwright',
  signature: [
    // path 0: Arc Gauntlet (+ new spell 3): the beam
    one('pk_sparkwright_tuned_coils', 'Tuned Coils', 'power', '+1 to Arc Gauntlet and Arc Mine.',
      { spellLevels: [{ spell: ARC, levels: 1 }, { spell: 'spell:arc-mine', levels: 1 }] }),
    three('pk_sparkwright_high_voltage', 'High Voltage', 'power', (r) => `+${r * 6}% Storm damage.`, (r) => ({ mods: [{ stat: 'dmg.storm', op: 'flat', value: 0.06 * r }] })),
    one('pk_sparkwright_feedback', 'Feedback Loop', 'resource', 'Spell critical hits restore 5 Ember (0.5 s); +3% critical chance.',
      { mods: [{ stat: 'crit', op: 'flat', value: 0.03 }], procs: [{ on: 'spellCrit', icd: 500, do: [{ a: 'resource', ember: 5 }] }] }),
    one('pk_sparkwright_overclock', 'Overclock', 'tradeoff', '+20% cast speed and +15% spell damage; spells cost 25% more.',
      { mods: [{ stat: 'castSpeed', op: 'flat', value: 0.2 }, { stat: 'spellDmg', op: 'flat', value: 0.15 }, { stat: 'emberCost', op: 'flat', value: 0.25 }] }),
    // path 1: Tesla Totem (+ new spell 4): the workshop on the field
    one('pk_sparkwright_quick_build', 'Quick Build', 'power', 'Tesla Totem recharges 20% faster and costs 15% less and hits 25% harder.', { spellMods: [{ spell: TOTEM, cd: -0.2, cost: -0.15, dmg: 0.25 }] }),
    three('pk_sparkwright_better_parts', 'Better Parts', 'power', (r) => `+${r * 10}% summon damage and health; Tesla Totem and Arc Mine deal ${(8 * r).toFixed(0)}% more.`,
      (r) => ({ spellMods: [{ spell: 'spell:tesla-totem', dmg: 0.08 * r }, { spell: 'spell:arc-mine', dmg: 0.08 * r }], mods: [{ stat: 'minionDmg', op: 'flat', value: 0.1 * r }, { stat: 'minionHp', op: 'flat', value: 0.1 * r }] })),
    one('pk_sparkwright_grid', 'Power Grid', 'power', 'With 2 or more summons out: +20% damage; Tesla Totem lasts 30% longer and hits 20% harder.',
      { spellMods: [{ spell: 'spell:tesla-totem', dur: 0.3, dmg: 0.2 }], mods: [{ stat: 'dmg', op: 'flat', value: 0.2, when: { c: 'minions', min: 2 } }] }),
    one('pk_sparkwright_spare_parts', 'Spare Parts', 'trigger', 'Summoning grants a shield of 8% max health (5 s); casting grants a shield of 5% max health (6 s).',
      { procs: [{ on: 'cast', icd: 6000, do: [{ a: 'shield', pctMax: 0.05, dur: 4000, to: 'self' }] }, { on: 'summon', icd: 5000, do: [{ a: 'shield', pctMax: 0.08, dur: 5000, to: 'self' }] }] }),
    // path 2: Overcharge (+ new spell 5): pushing the machine
    one('pk_sparkwright_surge', 'Surge', 'power', 'Overcharge recharges 25% faster and lasts 30% longer.', { spellMods: [{ spell: OVER, cd: -0.25, dur: 0.3 }] }),
    three('pk_sparkwright_capacitor', 'Capacitor', 'resource', (r) => `+${r * 10} max Ember and +${(0.4 * r).toFixed(1)} Ember per second; above 50% Ember, +${(3 * r).toFixed(1)}% spell damage.`,
      (r) => ({ mods: [{ stat: 'spellDmg', op: 'flat', value: 0.03 * r, when: { c: 'emberAbove', pct: 0.5 } }, { stat: 'ember', op: 'flat', value: 10 * r }, { stat: 'emberRegen', op: 'flat', value: 0.4 * r }] })),
    one('pk_sparkwright_discharge', 'Discharge', 'trigger', 'Every 50 Ember spent releases a shock nova around you (80% power).',
      { procs: [{ on: 'emberSpent', do: [{ a: 'damage', coef: 0.8, kind: 'storm', area: near(96), status: [{ id: 'shock', dur: 2000 }] }] }] }),
    one('pk_sparkwright_insulated', 'Insulated Coat', 'power', '+15% Storm resistance and +8% max health.',
      { mods: [{ stat: 'resist.storm', op: 'flat', value: 0.15 }, { stat: 'hp', op: 'pct', value: 0.08 }] }),
  ],
};

const school: PerkDef[] = [
  // p0 offence
  one('pk_storm_crackle', 'Crackle', 'power', '+12% Storm damage; your status chance is 10% higher.',
    { mods: [{ stat: 'dmg.storm', op: 'flat', value: 0.12 }, { stat: 'statusChance', op: 'flat', value: 0.1 }] }),
  one('pk_storm_forked', 'Forked', 'power', 'Your chains jump to 1 more foe; +3% critical chance; +4% Storm damage.',
    { mods: [{ stat: 'dmg.storm', op: 'flat', value: 0.04 }, { stat: 'chains', op: 'flat', value: 1 }, { stat: 'crit', op: 'flat', value: 0.03 }] }),
  // p1 defence
  three('pk_storm_grounded', 'Grounded', 'power', (r) => `+${r * 5}% Storm resistance and +${r * 3}% armour.`,
    (r) => ({ mods: [{ stat: 'resist.storm', op: 'flat', value: 0.05 * r }, { stat: 'armor', op: 'pct', value: 0.03 * r }] })),
  one('pk_storm_static_skin', 'Static Skin', 'trigger', 'When hit: shock the foes around you (4 s); +10% armour.',
    { mods: [{ stat: 'armor', op: 'pct', value: 0.1 }], procs: [{ on: 'hurt', icd: 4000, do: [{ a: 'status', status: { id: 'shock', dur: 2000 }, area: near(64) }] }] }),
  one('pk_storm_lightning_reflexes', 'Lightning Reflexes', 'power', 'Your dash recharges 20% faster; +4% move speed.',
    { mods: [{ stat: 'dashCd', op: 'flat', value: -0.2 }, { stat: 'moveSpeed', op: 'flat', value: 0.04 }] }),
  // p2 focus / resource
  three('pk_storm_charged', 'Charged', 'resource', (r) => `+${(0.3 * r).toFixed(1)} Ember per second and ${r * 2}% shorter cooldowns; +${r.toFixed(1)}% cast speed; +${r.toFixed(1)}% Storm damage.`,
    (r) => ({ mods: [{ stat: 'dmg.storm', op: 'flat', value: 0.01 * r }, { stat: 'castSpeed', op: 'flat', value: 0.01 * r }, { stat: 'emberRegen', op: 'flat', value: 0.3 * r }, { stat: 'cdr', op: 'flat', value: 0.02 * r }] })),
  one('pk_storm_kinetic', 'Kinetic', 'resource', 'Every 50 stamina spent restores 8 Ember; +5% attack speed; +5% cast speed.',
    { mods: [{ stat: 'castSpeed', op: 'flat', value: 0.05 }, { stat: 'atkSpeed', op: 'flat', value: 0.05 }], procs: [{ on: 'staminaSpent', do: [{ a: 'resource', ember: 8 }] }] }),
  one('pk_storm_tempest_mind', 'Tempest Mind', 'power', '+10% cast speed and +10% attack speed.',
    { mods: [{ stat: 'castSpeed', op: 'flat', value: 0.1 }, { stat: 'atkSpeed', op: 'flat', value: 0.1 }] }),
];

export const PERKS: SchoolPerks = { school: 'storm', classes: [stormlancer, sparkwright], perks: school };
