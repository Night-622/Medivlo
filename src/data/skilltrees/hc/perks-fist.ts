/**
 * Fist perks (Claude 5 for Claude 3, docs/systems/BUILDS.md §3; slots in rules/perkTypes.ts). Monk and Brawler
 * signatures (12 each, path i themed on kit spell i and the new kit spell i+3) and 8 Fist school perks. Martial: the
 * builds turn on Momentum, dashes and stamina, not only attack damage. Each exclusive c1 / c2 pair is two different
 * playstyles. effects[r-1] is the whole effect at rank r. Budgets: HOLLOW_CROWN.md §2.1.
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

const PALMS = 'spell:hundred-palms', SWEEP = 'spell:staff-sweep', CALM = 'spell:inner-calm';
const HAY = 'spell:haymaker', ROPE = 'spell:rope-a-dope', SECOND = 'spell:second-wind';

const monk: ClassPerks = {
  classId: 'monk',
  signature: [
    // path 0: Hundred Palms (+ new spell 3): the flurry
    one('pk_monk_swift_palms', 'Swift Palms', 'power', '+2 to Hundred Palms and Flowing Palm.',
      { spellLevels: [{ spell: PALMS, levels: 2 }, { spell: 'spell:flowing-palm', levels: 2 }] }),
    three('pk_monk_flowing_strikes', 'Flowing Strikes', 'power', (r) => `At 3+ Momentum: +${r * 6}% damage.`,
      (r) => ({ mods: [{ stat: 'dmg', op: 'flat', value: 0.06 * r, when: { c: 'momentum', min: 3 } }] })),
    one('pk_monk_open_palm', 'Open Palm', 'trigger', 'Every 5th hit stuns the foe for 0.6 s.',
      { procs: [{ on: 'hit', every: 5, do: [{ a: 'status', status: { id: 'stun', dur: 600 }, area: tgt }] }] }),
    one('pk_monk_endless_flurry', 'Endless Flurry', 'trigger', 'Critical hits grant 1 Momentum, once every 0.5 s; +1 maximum Momentum; +3% critical chance; +4% attack speed.',
      { mods: [{ stat: 'atkSpeed', op: 'flat', value: 0.04 }, { stat: 'crit', op: 'flat', value: 0.03 }, { stat: 'maxMomentum', op: 'flat', value: 1 }], procs: [{ on: 'crit', icd: 500, do: [{ a: 'resource', momentum: 1 }] }] }),
    // path 1: Staff Sweep (+ new spell 4): the circle
    one('pk_monk_wide_sweep', 'Low Sweep', 'power', 'Staff Sweep recharges 20% faster and hits 25% harder.', { spellMods: [{ spell: SWEEP, cd: -0.2, dmg: 0.25 }] }),
    three('pk_monk_still_water', 'Still Water', 'power', (r) => `+${r * 8}% damage to knocked-down foes; +${(2.5 * r).toFixed(1)}% damage to all foes.`,
      (r) => ({ mods: [{ stat: 'dmg', op: 'flat', value: 0.025 * r }, { stat: 'dmg', op: 'flat', value: 0.08 * r, when: { c: 'targetHas', status: 'knockdown' } }] })),
    one('pk_monk_whirling_staff', 'Whirling Staff', 'trigger', 'Landing a dash sweeps the foes around you for 60% weapon power.',
      { procs: [{ on: 'dashEnd', icd: 800, do: [{ a: 'damage', coef: 0.6, kind: 'fist', area: near(56) }] }] }),
    one('pk_monk_ascetic', 'Ascetic', 'tradeoff', '+25% attack speed and +10% move speed, −20% armour.',
      { mods: [{ stat: 'atkSpeed', op: 'flat', value: 0.25 }, { stat: 'moveSpeed', op: 'flat', value: 0.1 }, { stat: 'armor', op: 'pct', value: -0.2 }] }),
    // path 2: Inner Calm (+ new spell 5): the dodge
    one('pk_monk_deep_calm', 'Deep Calm', 'power', 'Inner Calm recharges 25% faster and lasts 30% longer.', { spellMods: [{ spell: CALM, cd: -0.25, dur: 0.3 }] }),
    three('pk_monk_light_feet', 'Light Feet', 'resource', (r) => `Your dash costs ${r * 8}% less stamina and recharges ${r * 5}% faster; +${r.toFixed(1)}% attack speed.`,
      (r) => ({ mods: [{ stat: 'atkSpeed', op: 'flat', value: 0.01 * r }, { stat: 'staminaCost', op: 'flat', value: -0.08 * r }, { stat: 'dashCd', op: 'flat', value: -0.05 * r }] })),
    one('pk_monk_empty_hand', 'Empty Hand', 'trigger', 'Landing a dash grants 1 Momentum and 10 stamina, once every 1 s; +1 maximum Momentum; +5% attack speed.',
      { mods: [{ stat: 'atkSpeed', op: 'flat', value: 0.05 }, { stat: 'maxMomentum', op: 'flat', value: 1 }], procs: [{ on: 'dashEnd', icd: 1000, do: [{ a: 'resource', momentum: 1, stamina: 10 }] }] }),
    one('pk_monk_breath', 'Breath of the Mountain', 'power', '+2 maximum Momentum; +8% max health.',
      { mods: [{ stat: 'maxMomentum', op: 'flat', value: 2 }, { stat: 'hp', op: 'pct', value: 0.08 }] }),
  ],
};

const brawler: ClassPerks = {
  classId: 'brawler',
  signature: [
    // path 0: Haymaker (+ new spell 3): the big punch
    one('pk_brawler_loaded_fist', 'Loaded Fist', 'power', '+2 to Haymaker and Uppercut.',
      { spellLevels: [{ spell: HAY, levels: 2 }, { spell: 'spell:uppercut', levels: 2 }] }),
    three('pk_brawler_knockout', 'Knockout', 'power', (r) => `At 5 Momentum: +${r * 10}% critical damage and +${r * 3}% damage.`,
      (r) => ({ mods: [{ stat: 'critd', op: 'flat', value: 0.1 * r, when: { c: 'momentum', min: 5 } }, { stat: 'dmg', op: 'flat', value: 0.03 * r, when: { c: 'momentum', min: 5 } }] })),
    one('pk_brawler_haymaker_heart', 'Spend It All', 'trigger', 'Every 50 stamina spent: +20% damage for 3 s.',
      { procs: [{ on: 'staminaSpent', do: [{ a: 'buff', id: 'brw:spend', dur: 3000, to: 'self', mods: [{ stat: 'dmg', op: 'flat', value: 0.2 }] }] }] }),
    one('pk_brawler_glass_jaw', 'Glass Jaw', 'tradeoff', '+35% attack damage, −15% max health.',
      { mods: [{ stat: 'attackDmg', op: 'flat', value: 0.35 }, { stat: 'hp', op: 'pct', value: -0.15 }] }),
    // path 1: Rope-a-Dope (+ new spell 4): absorbing and answering
    one('pk_brawler_on_the_ropes', 'On the Ropes', 'power', 'Rope-a-Dope recharges 20% faster and lasts 30% longer.', { spellMods: [{ spell: ROPE, cd: -0.2, dur: 0.3 }] }),
    three('pk_brawler_iron_chin', 'Iron Chin', 'power', (r) => `+${r * 4}% max health and ${r * 10}% shorter stuns.`,
      (r) => ({ mods: [{ stat: 'hp', op: 'pct', value: 0.04 * r }, { stat: 'stunTaken', op: 'flat', value: -0.1 * r }] })),
    one('pk_brawler_counterpunch', 'Counterpunch', 'trigger', 'Blocking strikes back for 70% weapon power and grants 1 Momentum; parries count too; +4% damage.',
      { mods: [{ stat: 'dmg', op: 'flat', value: 0.04 }], procs: [{ on: 'parry', icd: 800, do: [{ a: 'damage', coef: 0.7, kind: 'fist', area: { shape: 'single', at: 'target' } }, { a: 'resource', momentum: 1 }] }, { on: 'block', icd: 800, do: [{ a: 'damage', coef: 0.7, kind: 'fist', area: tgt }, { a: 'resource', momentum: 1 }] }] }),
    one('pk_brawler_take_a_hit', 'Take a Hit', 'trigger', 'When hit: gain 1 Momentum, once every 1.5 s; +1 maximum Momentum; +5% max health.',
      { mods: [{ stat: 'hp', op: 'pct', value: 0.05 }, { stat: 'maxMomentum', op: 'flat', value: 1 }], procs: [{ on: 'hurt', icd: 1500, do: [{ a: 'resource', momentum: 1 }] }] }),
    // path 2: Second Wind (+ new spell 5): getting back up
    one('pk_brawler_quick_recovery', 'Quick Recovery', 'power', 'Second Wind recharges 25% faster and heals 30% more.', { spellMods: [{ spell: SECOND, cd: -0.25, dmg: 0.3 }] }),
    three('pk_brawler_tough_as_nails', 'Tough as Nails', 'resource', (r) => `Kills restore ${r * 6} stamina and ${r}% of max health; when hit, heal ${r}% of max health, once every 4 s.`,
      (r) => ({ mods: [{ stat: 'staminaOnKill', op: 'flat', value: 6 * r }], procs: [{ on: 'kill', do: [{ a: 'heal', pctMax: 0.01 * r, to: 'self' }] }, { on: 'hurt', icd: 4000, do: [{ a: 'heal', pctMax: 0.01 * r, to: 'self' }] }] })),
    one('pk_brawler_last_round', 'Last Round', 'power', 'Below 30% health: +25% damage and take 15% less; +4% damage at any health.',
      { mods: [{ stat: 'dmg', op: 'flat', value: 0.04 }, { stat: 'dmg', op: 'flat', value: 0.25, when: { c: 'hpBelow', pct: 0.3 } }, { stat: 'dmgTaken', op: 'flat', value: -0.15, when: { c: 'hpBelow', pct: 0.3 } }] }),
    one('pk_brawler_crowd_pleaser', 'Crowd Pleaser', 'aura', 'You and allies near you gain 8% attack speed.',
      { aura: [{ id: 'brw:crowd', r: 160, mods: [{ stat: 'atkSpeed', op: 'flat', value: 0.08 }] }] }),
  ],
};

const school: PerkDef[] = [
  // p0 offence
  one('pk_fist_iron_fists', 'Iron Fists', 'power', '+12% Fist damage and +3% critical chance.',
    { mods: [{ stat: 'dmg.fist', op: 'flat', value: 0.12 }, { stat: 'crit', op: 'flat', value: 0.03 }] }),
  one('pk_fist_combo_master', 'Combo Master', 'trigger', 'Every 4th hit grants 1 Momentum; +1 maximum Momentum; +4% attack speed.',
    { mods: [{ stat: 'atkSpeed', op: 'flat', value: 0.04 }, { stat: 'maxMomentum', op: 'flat', value: 1 }], procs: [{ on: 'hit', every: 4, do: [{ a: 'resource', momentum: 1 }] }] }),
  // p1 defence
  three('pk_fist_hardened_body', 'Hardened Body', 'power', (r) => `+${r * 3}% max health and +${r * 3}% armour.`,
    (r) => ({ mods: [{ stat: 'hp', op: 'pct', value: 0.03 * r }, { stat: 'armor', op: 'pct', value: 0.03 * r }] })),
  one('pk_fist_evasion', 'Evasion', 'power', '+1 dash charge; your dash recharges 10% faster.',
    { mods: [{ stat: 'dashCharges', op: 'flat', value: 1 }, { stat: 'dashCd', op: 'flat', value: -0.1 }] }),
  one('pk_fist_stone_stance', 'Stone Stance', 'power', 'After standing still for 1 s: take 15% less damage.',
    { mods: [{ stat: 'dmgTaken', op: 'flat', value: -0.15, when: { c: 'stationary', ms: 1000 } }] }),
  // p2 focus / resource
  three('pk_fist_deep_breath', 'Deep Breath', 'resource', (r) => `+${r * 10} max stamina and +${r * 6}% stamina regeneration.`,
    (r) => ({ mods: [{ stat: 'stamina', op: 'flat', value: 10 * r }, { stat: 'staminaRegen', op: 'pct', value: 0.06 * r }] })),
  one('pk_fist_ki_flow', 'Ki Flow', 'trigger', 'Every 50 stamina spent restores 6 Ember and grants 1 Momentum; +4% attack speed.',
    { mods: [{ stat: 'atkSpeed', op: 'flat', value: 0.04 }], procs: [{ on: 'staminaSpent', do: [{ a: 'resource', ember: 6, momentum: 1 }] }] }),
  one('pk_fist_discipline', 'Discipline', 'power', '6% shorter cooldowns and +5% Fist damage.',
    { mods: [{ stat: 'cdr', op: 'flat', value: 0.06 }, { stat: 'dmg.fist', op: 'flat', value: 0.05 }] }),
];

export const PERKS: SchoolPerks = { school: 'fist', classes: [monk, brawler], perks: school };
