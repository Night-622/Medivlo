/**
 * Ash perks (Claude 5 for Claude 3, docs/systems/BUILDS.md §3; slots in rules/perkTypes.ts). Arcanist and Reaver
 * signatures (12 each, path i themed on kit spell i and the new kit spell i+3) and 8 Ash school perks. Each exclusive
 * c1 / c2 pair is two different playstyles. effects[r-1] is the whole effect at rank r. Numbers follow the
 * HOLLOW_CROWN.md §2.1 budgets: a perk ≈ a 3-rank node of the old tree; trade-offs net about +20%.
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

const AB = 'spell:ash-bolt', NOVA = 'spell:cinder-nova', KINDLE = 'spell:kindle';
const CLEAVE = 'spell:cinder-cleave', BLOOD = 'spell:bloodburn', LEAP = 'spell:pyre-leap';

const arcanist: ClassPerks = {
  classId: 'arcanist',
  signature: [
    // path 0: Ash Bolt (+ new spell 3): a bolt caster who stokes burning foes
    one('pk_arcanist_kindled_bolt', 'Kindled Bolt', 'power', '+1 to Ash Bolt and Ember Comet.',
      { spellLevels: [{ spell: AB, levels: 1 }, { spell: 'spell:ember-comet', levels: 1 }] }),
    three('pk_arcanist_combustion', 'Combustion', 'power', (r) => `+${r * 6}% damage to burning foes.`,
      (r) => ({ mods: [{ stat: 'dmg', op: 'flat', value: 0.06 * r, when: { c: 'targetHas', status: 'burn' } }] })),
    one('pk_arcanist_ember_well', 'Ember Well', 'resource', 'Spell critical hits restore 6 Ember, once every 0.5 s.',
      { procs: [{ on: 'spellCrit', icd: 500, do: [{ a: 'resource', ember: 6 }] }] }),
    one('pk_arcanist_burning_ambition', 'Burning Ambition', 'tradeoff', '+35% spell damage, −15% max health.',
      { mods: [{ stat: 'spellDmg', op: 'flat', value: 0.35 }, { stat: 'hp', op: 'pct', value: -0.15 }] }),
    // path 1: Cinder Nova (+ new spell 4): fire spreading through a crowd
    one('pk_arcanist_quick_nova', 'Quick Nova', 'power', 'Cinder Nova recharges 20% faster and costs 15% less.',
      { spellMods: [{ spell: NOVA, cd: -0.2, cost: -0.15 }] }),
    three('pk_arcanist_wildfire', 'Wildfire', 'trigger', (r) => `Setting a burn has a ${5 + r * 5}% chance to scorch the foes around it; +${(3 * r).toFixed(1)}% burn damage.`,
      (r) => ({ mods: [{ stat: 'statusDmg.burn', op: 'flat', value: 0.03 * r }], procs: [{ on: 'statusApplied', chance: 0.05 + 0.05 * r, icd: 300, do: [{ a: 'damage', coef: 0.35, kind: 'ash', area: { shape: 'circle', at: 'target', r: 56 } }] }] })),
    one('pk_arcanist_ember_hands', 'Ember Hands', 'conversion', 'Your attacks deal 50% of their damage as Ash, and +15% attack damage.',
      { convert: [{ from: 'attack', to: 'ash', pct: 0.5 }], mods: [{ stat: 'attackDmg', op: 'flat', value: 0.15 }] }),
    one('pk_arcanist_cauterise', 'Cauterise', 'power', '+30% burn damage; your statuses last 20% longer.',
      { mods: [{ stat: 'statusDmg.burn', op: 'flat', value: 0.3 }, { stat: 'statusDur', op: 'flat', value: 0.2 }] }),
    // path 2: Kindle (+ new spell 5): the hearth that heals and burns
    one('pk_arcanist_hearthfire', 'Hearthfire Kindle', 'power', 'Kindle heals 25% more and costs 15% less.',
      { spellMods: [{ spell: KINDLE, dmg: 0.25, cost: -0.15 }] }),
    three('pk_arcanist_searing_light', 'Searing Light', 'trigger', (r) => `Your heals scorch foes near you for ${25 + r * 10}% spell power, once every 1 s; +${r.toFixed(1)}% Ash damage.`,
      (r) => ({ mods: [{ stat: 'dmg.ash', op: 'flat', value: 0.01 * r }], procs: [{ on: 'heal', icd: 1000, do: [{ a: 'damage', coef: 0.25 + 0.1 * r, kind: 'ash', area: near(96) }] }] })),
    one('pk_arcanist_phoenix', 'Phoenix Ember', 'trigger', 'Below 50% health: heal 30% and erupt in flame, once every 60 s.',
      { procs: [{ on: 'lowHp', icd: 60000, do: [{ a: 'heal', pctMax: 0.3, to: 'self' }, { a: 'damage', coef: 1.0, kind: 'ash', area: near(96), status: [{ id: 'burn', dur: 3000 }] }] }] }),
    one('pk_arcanist_hearth_circle', 'Hearth Circle', 'aura', 'You and allies near you deal 8% more damage and receive 10% more healing.',
      { aura: [{ id: 'arc:hearth', r: 160, mods: [{ stat: 'dmg', op: 'flat', value: 0.08 }, { stat: 'healingTaken', op: 'flat', value: 0.1 }] }] }),
  ],
};

const reaver: ClassPerks = {
  classId: 'reaver',
  signature: [
    // path 0: Cinder Cleave (+ new spell 3): the burning axe
    one('pk_reaver_muster_flame', 'Flame of the Muster', 'power', '+1 to Cinder Cleave and Searing Rend.',
      { spellLevels: [{ spell: CLEAVE, levels: 1 }, { spell: 'spell:searing-rend', levels: 1 }] }),
    three('pk_reaver_red_fury', 'Red Fury', 'power', (r) => `+${r * 6}% damage below 70% health.`,
      (r) => ({ mods: [{ stat: 'dmg', op: 'flat', value: 0.06 * r, when: { c: 'hpBelow', pct: 0.7 } }] })),
    one('pk_reaver_searing_edge', 'Searing Edge', 'trigger', 'Attack critical hits set the foe burning for 3 s; +4% critical chance; +10% burn damage.',
      { mods: [{ stat: 'statusDmg.burn', op: 'flat', value: 0.1 }, { stat: 'crit', op: 'flat', value: 0.04 }], procs: [{ on: 'attackCrit', do: [{ a: 'status', status: { id: 'burn', dur: 3000 }, area: tgt }] }] }),
    one('pk_reaver_berserk_blood', 'Berserk Blood', 'tradeoff', '+35% attack damage, −20% armour.',
      { mods: [{ stat: 'attackDmg', op: 'flat', value: 0.35 }, { stat: 'armor', op: 'pct', value: -0.2 }] }),
    // path 1: Bloodburn (+ new spell 4): paying in blood
    one('pk_reaver_quick_blood', 'Quickened Blood', 'power', 'Bloodburn recharges 20% faster and lasts 30% longer.', { spellMods: [{ spell: BLOOD, cd: -0.2, dur: 0.3 }] }),
    three('pk_reaver_bloodthirst', 'Bloodthirst', 'resource', (r) => `Heal for ${r * 2}% of the damage you deal.`,
      (r) => ({ mods: [{ stat: 'lifesteal', op: 'flat', value: 0.02 * r }] })),
    one('pk_reaver_unbowed', 'Unbowed', 'power', 'Below 30% health you take 25% less damage.',
      { mods: [{ stat: 'dmgTaken', op: 'flat', value: -0.25, when: { c: 'hpBelow', pct: 0.3 } }] }),
    one('pk_reaver_pain_to_power', 'Pain to Power', 'trigger', 'When hit: +12% damage for 3 s, once every 2 s.',
      { procs: [{ on: 'hurt', icd: 2000, do: [{ a: 'buff', id: 'rea:pain', dur: 3000, to: 'self', mods: [{ stat: 'dmg', op: 'flat', value: 0.12 }] }] }] }),
    // path 2: Pyre Leap (+ new spell 5): crashing in
    one('pk_reaver_pyre_landing', 'Pyre Landing', 'power', 'Pyre Leap recharges 25% faster and lands 25% harder.', { spellMods: [{ spell: LEAP, cd: -0.25, dmg: 0.25 }] }),
    three('pk_reaver_kill_frenzy', 'Kill Frenzy', 'trigger', (r) => `Kills, and every 8th hit: +${Math.round((25 * r) / 3)}% attack speed for 4 s.`,
      (r) => { const frenzy = { a: 'buff' as const, id: 'rea:frenzy', dur: 4000, to: 'self' as const, mods: [{ stat: 'atkSpeed' as const, op: 'flat' as const, value: (0.25 * r) / 3 }] };
        return { procs: [{ on: 'kill', do: [frenzy] }, { on: 'hit', every: 8, do: [frenzy] }] }; }),
    one('pk_reaver_undying', 'Undying Rage', 'trigger', 'Below 50% health: take 60% less damage for 3 s, once every 45 s.',
      { procs: [{ on: 'lowHp', icd: 45000, do: [{ a: 'buff', id: 'rea:undying', dur: 3000, to: 'self', mods: [{ stat: 'dmgTaken', op: 'flat', value: -0.6 }] }] }] }),
    one('pk_reaver_scorched_steel', 'Scorched Steel', 'conversion', 'Attacks deal 40% of their damage as Ash; +12% Ash damage.',
      { convert: [{ from: 'attack', to: 'ash', pct: 0.4 }], mods: [{ stat: 'dmg.ash', op: 'flat', value: 0.12 }] }),
  ],
};

const school: PerkDef[] = [
  // p0 offence
  one('pk_ash_slow_burn', 'Slow Burn', 'power', 'Your statuses last 25% longer and land 10% more often; +15% burn damage; +4% Ash damage.',
    { mods: [{ stat: 'dmg.ash', op: 'flat', value: 0.04 }, { stat: 'statusDmg.burn', op: 'flat', value: 0.15 }, { stat: 'statusDur', op: 'flat', value: 0.25 }, { stat: 'statusChance', op: 'flat', value: 0.1 }] }),
  one('pk_ash_flashfire', 'Flashfire', 'power', '+12% Ash damage and +3% critical chance.',
    { mods: [{ stat: 'dmg.ash', op: 'flat', value: 0.12 }, { stat: 'crit', op: 'flat', value: 0.03 }] }),
  // p1 defence
  three('pk_ash_hearthward', 'Hearthward', 'power', (r) => `+${r * 5}% Ash resistance and +${r * 2}% max health.`,
    (r) => ({ mods: [{ stat: 'resist.ash', op: 'flat', value: 0.05 * r }, { stat: 'hp', op: 'pct', value: 0.02 * r }] })),
  one('pk_ash_kiln_skin', 'Kiln Skin', 'trigger', 'When hit: burn the foes around you, once every 6 s.',
    { procs: [{ on: 'hurt', icd: 6000, do: [{ a: 'damage', coef: 0.35, kind: 'ash', area: near(64), status: [{ id: 'burn', dur: 3000 }] }] }] }),
  one('pk_ash_firewalker', 'Firewalker', 'power', 'You cannot be burned; +6% move speed.',
    { hooks: [{ id: 'immune:burn' }], mods: [{ stat: 'moveSpeed', op: 'flat', value: 0.06 }] }),
  // p2 focus / resource
  three('pk_ash_banked_coals', 'Banked Coals', 'resource', (r) => `+${(0.3 * r).toFixed(1)} Ember per second; +${r} health per second in combat; +${r.toFixed(1)}% max health.`,
    (r) => ({ mods: [{ stat: 'hp', op: 'pct', value: 0.01 * r }, { stat: 'emberRegen', op: 'flat', value: 0.3 * r }, { stat: 'hpRegen', op: 'flat', value: r, when: { c: 'inCombat' } }] })),
  one('pk_ash_cinder_heart', 'Cinder Heart', 'resource', 'Every 50 Ember spent heals 3% of max health; +5% Ash damage; +3% critical chance.',
    { mods: [{ stat: 'crit', op: 'flat', value: 0.03 }, { stat: 'dmg.ash', op: 'flat', value: 0.05 }], procs: [{ on: 'emberSpent', do: [{ a: 'heal', pctMax: 0.03, to: 'self' }] }] }),
  one('pk_ash_forge_focus', 'Forge Focus', 'power', '6% shorter cooldowns and +5% Ash damage.',
    { mods: [{ stat: 'cdr', op: 'flat', value: 0.06 }, { stat: 'dmg.ash', op: 'flat', value: 0.05 }] }),
];

export const PERKS: SchoolPerks = { school: 'ash', classes: [arcanist, reaver], perks: school };
