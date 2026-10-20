/**
 * Blade perks (Claude 5 for Claude 3, docs/systems/BUILDS.md §3; slots in rules/perkTypes.ts). Swordsman and Samurai
 * signatures (12 each, path i themed on kit spell i and the new kit spell i+3) and 8 Blade school perks. Martial: the
 * builds turn on stamina, dashes and critical rhythm, not only attack damage. Each exclusive c1 / c2 pair is two
 * different playstyles. effects[r-1] is the whole effect at rank r. Budgets: HOLLOW_CROWN.md §2.1.
 */
import type { ClassPerks, PerkDef, PerkKind, SchoolPerks } from '@/systems/rules/perkTypes';
import type { Passive } from '@/systems/rules/types';

const one = (id: string, name: string, kind: PerkKind, text: string, fx: Passive): PerkDef => ({ id, name, kind, ranks: 1, text: [text], effects: [fx] });
const three = (id: string, name: string, kind: PerkKind, text: (r: number) => string, fx: (r: number) => Passive): PerkDef =>
  ({ id, name, kind, ranks: 3, text: [1, 2, 3].map(text), effects: [1, 2, 3].map(fx) });
const near = (r: number) => ({ shape: 'circle' as const, at: 'self' as const, r });
const tgt = { shape: 'single' as const, at: 'target' as const };

const RIPOSTE = 'spell:riposte', LUNGE = 'spell:lunge', WHIRL = 'spell:whirling-edge';
const IAI = 'spell:iaijutsu', WIND = 'spell:wind-step', STILL = 'spell:still-mind';

const swordsman: ClassPerks = {
  classId: 'swordsman',
  signature: [
    // path 0: Riposte (+ new spell 3): the duellist's answer
    one('pk_swordsman_quick_guard', 'Quick Guard', 'power', '+1 to Riposte and its new sister spell.',
      { spellLevels: [{ spell: RIPOSTE, levels: 1 }, { spell: 'spell:new-swordsman-3', levels: 1 }] }),
    three('pk_swordsman_counter_rhythm', 'Counter Rhythm', 'trigger', (r) => `A parry: +${r * 8}% damage for 4 s.`,
      (r) => ({ procs: [{ on: 'parry', do: [{ a: 'buff', id: 'swd:counter', dur: 4000, to: 'self', mods: [{ stat: 'dmg', op: 'flat', value: 0.08 * r }] }] }] })),
    one('pk_swordsman_perfect_parry', 'Perfect Parry', 'trigger', 'A parry restores 25 stamina and cuts your cooldowns by 0.4 s.',
      { procs: [{ on: 'parry', do: [{ a: 'resource', stamina: 25 }, { a: 'cooldowns', reduceMs: 400, to: 'self' }] }] }),
    one('pk_swordsman_open_guard', 'Open Guard', 'tradeoff', '+30% attack damage, −15% armour and block.',
      { mods: [{ stat: 'attackDmg', op: 'flat', value: 0.3 }, { stat: 'armor', op: 'pct', value: -0.15 }, { stat: 'block', op: 'flat', value: -0.15 }] }),
    // path 1: Lunge (+ new spell 4): closing the distance
    one('pk_swordsman_long_lunge', 'Long Lunge', 'power', 'Lunge recharges 20% faster and costs 15% less.', { spellMods: [{ spell: LUNGE, cd: -0.2, cost: -0.15 }] }),
    three('pk_swordsman_footwork', 'Footwork', 'resource', (r) => `Your dash costs ${r * 8}% less stamina and recharges ${r * 5}% faster.`,
      (r) => ({ mods: [{ stat: 'staminaCost', op: 'flat', value: -0.08 * r }, { stat: 'dashCd', op: 'flat', value: -0.05 * r }] })),
    one('pk_swordsman_flowing_steel', 'Flowing Steel', 'trigger', 'Every 50 stamina spent: +15% attack speed for 4 s.',
      { procs: [{ on: 'staminaSpent', do: [{ a: 'buff', id: 'swd:flow', dur: 4000, to: 'self', mods: [{ stat: 'atkSpeed', op: 'flat', value: 0.15 }] }] }] }),
    one('pk_swordsman_lunging_cut', 'Lunging Cut', 'trigger', 'Landing a dash cuts the foes around you for 60% weapon power.',
      { procs: [{ on: 'dashEnd', icd: 800, do: [{ a: 'damage', coef: 0.6, kind: 'blade', area: near(56) }] }] }),
    // path 2: Whirling Edge (+ new spell 5): the crowd
    one('pk_swordsman_storm_of_steel', 'Storm of Steel', 'power', 'Whirling Edge recharges 20% faster.', { spellMods: [{ spell: WHIRL, cd: -0.2 }] }),
    three('pk_swordsman_battle_trance', 'Battle Trance', 'resource', (r) => `Kills restore ${r * 6} stamina and +${r}% of damage healed back.`,
      (r) => ({ mods: [{ stat: 'staminaOnKill', op: 'flat', value: 6 * r }, { stat: 'lifesteal', op: 'flat', value: 0.01 * r }] })),
    one('pk_swordsman_whirlwind_heart', 'Whirlwind Heart', 'trigger', 'Kills: +20% move and attack speed for 3 s.',
      { procs: [{ on: 'kill', icd: 1000, do: [{ a: 'buff', id: 'swd:whirl', dur: 3000, to: 'self', mods: [{ stat: 'moveSpeed', op: 'flat', value: 0.2 }, { stat: 'atkSpeed', op: 'flat', value: 0.2 }] }] }] }),
    one('pk_swordsman_last_duellist', 'Last Duellist', 'power', 'With no ally within 300 px: +20% damage and take 10% less damage.',
      { mods: [{ stat: 'dmg', op: 'flat', value: 0.2, when: { c: 'alone', px: 300 } }, { stat: 'dmgTaken', op: 'flat', value: -0.1, when: { c: 'alone', px: 300 } }] }),
  ],
};

const samurai: ClassPerks = {
  classId: 'samurai',
  signature: [
    // path 0: Iaijutsu (+ new spell 3): the single cut
    one('pk_samurai_drawn_blade', 'Drawn Blade', 'power', '+1 to Iaijutsu and its new sister spell.',
      { spellLevels: [{ spell: IAI, levels: 1 }, { spell: 'spell:new-samurai-3', levels: 1 }] }),
    three('pk_samurai_first_cut', 'First Cut', 'power', (r) => `+${r * 6}% damage to foes above 80% health.`,
      (r) => ({ mods: [{ stat: 'dmg', op: 'flat', value: 0.06 * r, when: { c: 'targetHpAbove', pct: 0.8 } }] })),
    one('pk_samurai_one_stroke', 'One Stroke', 'trigger', 'After standing still for 1 s: +40% critical damage.',
      { mods: [{ stat: 'critd', op: 'flat', value: 0.4, when: { c: 'stationary', ms: 1000 } }] }),
    one('pk_samurai_bleeding_edge', 'Bleeding Edge', 'trigger', 'Attack critical hits make the foe bleed (4 s).',
      { procs: [{ on: 'attackCrit', do: [{ a: 'status', status: { id: 'bleed', dur: 4000 }, area: tgt }] }] }),
    // path 1: Wind Step (+ new spell 4): through the line
    one('pk_samurai_gale_step', 'Gale Step', 'power', 'Wind Step recharges 20% faster.', { spellMods: [{ spell: WIND, cd: -0.2 }] }),
    three('pk_samurai_wind_breath', 'Wind Breath', 'resource', (r) => `Your dash costs ${r * 8}% less stamina; +${r * 5}% stamina regeneration.`,
      (r) => ({ mods: [{ stat: 'staminaCost', op: 'flat', value: -0.08 * r }, { stat: 'staminaRegen', op: 'pct', value: 0.05 * r }] })),
    one('pk_samurai_passing_cut', 'Passing Cut', 'trigger', 'Landing a dash: your next hit within 2 s is a critical hit (3 s).',
      { procs: [{ on: 'dashEnd', icd: 3000, do: [{ a: 'buff', id: 'sam:passing', dur: 2000, to: 'self', charges: 1, flags: ['nextHitsCrit'] }] }] }),
    one('pk_samurai_ronin', 'Ronin', 'tradeoff', '+30% critical damage and +5% critical chance, −15% max health.',
      { mods: [{ stat: 'critd', op: 'flat', value: 0.3 }, { stat: 'crit', op: 'flat', value: 0.05 }, { stat: 'hp', op: 'pct', value: -0.15 }] }),
    // path 2: Still Mind (+ new spell 5): focus
    one('pk_samurai_deep_focus', 'Deep Focus', 'power', 'Still Mind recharges 25% faster.', { spellMods: [{ spell: STILL, cd: -0.25 }] }),
    three('pk_samurai_zanshin', 'Zanshin', 'power', (r) => `+${r * 2}% critical chance and +${r * 6}% critical damage.`,
      (r) => ({ mods: [{ stat: 'crit', op: 'flat', value: 0.02 * r }, { stat: 'critd', op: 'flat', value: 0.06 * r }] })),
    one('pk_samurai_clear_water', 'Clear Water', 'resource', 'Critical hits restore 4 stamina and 2 Ember (0.5 s).',
      { procs: [{ on: 'crit', icd: 500, do: [{ a: 'resource', stamina: 4, ember: 2 }] }] }),
    one('pk_samurai_death_poem', 'Death Poem', 'trigger', 'Below 50% health: your next 3 hits are critical (45 s).',
      { procs: [{ on: 'lowHp', icd: 45000, do: [{ a: 'buff', id: 'sam:poem', dur: 6000, to: 'self', charges: 3, flags: ['nextHitsCrit'] }] }] }),
  ],
};

const school: PerkDef[] = [
  // p0 offence
  one('pk_blade_keen', 'Keen', 'power', '+12% Blade damage and +3% critical chance.',
    { mods: [{ stat: 'dmg.blade', op: 'flat', value: 0.12 }, { stat: 'crit', op: 'flat', value: 0.03 }] }),
  one('pk_blade_hamstring', 'Hamstring', 'trigger', 'Hits have a 15% chance to slow the foe (2 s).',
    { procs: [{ on: 'hit', chance: 0.15, do: [{ a: 'status', status: { id: 'slow', dur: 2000 }, area: tgt }] }] }),
  // p1 defence
  three('pk_blade_parry_stance', 'Parry Stance', 'power', (r) => `+${r * 3}% block chance and +${r * 3}% armour.`,
    (r) => ({ mods: [{ stat: 'block', op: 'flat', value: 0.03 * r }, { stat: 'armor', op: 'pct', value: 0.03 * r }] })),
  one('pk_blade_second_guard', 'Second Guard', 'trigger', 'When hit: take 12% less damage for 4 s (6 s).',
    { procs: [{ on: 'hurt', icd: 6000, do: [{ a: 'buff', id: 'bld:guard', dur: 4000, to: 'self', mods: [{ stat: 'dmgTaken', op: 'flat', value: -0.12 }] }] }] }),
  one('pk_blade_sidestep', 'Sidestep', 'power', '+1 dash charge.', { mods: [{ stat: 'dashCharges', op: 'flat', value: 1 }] }),
  // p2 focus / resource
  three('pk_blade_endurance', 'Swordsman’s Wind', 'resource', (r) => `+${r * 10} max stamina and +${r * 5}% stamina regeneration.`,
    (r) => ({ mods: [{ stat: 'stamina', op: 'flat', value: 10 * r }, { stat: 'staminaRegen', op: 'pct', value: 0.05 * r }] })),
  one('pk_blade_tempo', 'Tempo', 'trigger', 'Every 50 stamina spent restores 6 Ember.',
    { procs: [{ on: 'staminaSpent', do: [{ a: 'resource', ember: 6 }] }] }),
  one('pk_blade_honed_mind', 'Honed Mind', 'power', '6% shorter cooldowns and +5% Blade damage.',
    { mods: [{ stat: 'cdr', op: 'flat', value: 0.06 }, { stat: 'dmg.blade', op: 'flat', value: 0.05 }] }),
];

export const PERKS: SchoolPerks = { school: 'blade', classes: [swordsman, samurai], perks: school };
