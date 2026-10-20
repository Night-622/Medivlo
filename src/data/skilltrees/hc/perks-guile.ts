/**
 * Guile perks (Claude 5 for Claude 3, docs/systems/BUILDS.md §3; slots in rules/perkTypes.ts). Corsair and Jester
 * signatures (12 each, path i themed on kit spell i and the new kit spell i+3) and 8 Guile school perks. Martial: the
 * builds turn on dirty tricks, critical rhythm, dashes, stamina and loot, not only attack damage. Each exclusive
 * c1 / c2 pair is two different playstyles. effects[r-1] is the whole effect at rank r. Budgets: HOLLOW_CROWN.md §2.1.
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

const FLURRY = 'spell:cutlass-flurry', TRICK = 'spell:dirty-trick', PLUNDER = 'spell:plunder';
const JUGGLE = 'spell:juggle', PRAT = 'spell:pratfall', PUNCH = 'spell:punchline';

const corsair: ClassPerks = {
  classId: 'corsair',
  signature: [
    // path 0: Cutlass Flurry (+ new spell 3): the boarding fight
    one('pk_corsair_quick_cutlass', 'Quick Cutlass', 'power', '+1 to Cutlass Flurry and Pistol Shot.',
      { spellLevels: [{ spell: FLURRY, levels: 1 }, { spell: 'spell:pistol-shot', levels: 1 }] }),
    three('pk_corsair_boarding_party', 'Boarding Party', 'power', (r) => `+${r * 4}% attack speed and +${r * 3}% attack damage.`,
      (r) => ({ mods: [{ stat: 'atkSpeed', op: 'flat', value: 0.04 * r }, { stat: 'attackDmg', op: 'flat', value: 0.03 * r }] })),
    one('pk_corsair_salt_wounds', 'Salt in the Wound', 'trigger', 'Attack critical hits make the foe bleed for 4 s.',
      { procs: [{ on: 'attackCrit', do: [{ a: 'status', status: { id: 'bleed', dur: 4000 }, area: tgt }] }] }),
    one('pk_corsair_dual_wield', 'Two Blades', 'tradeoff', '+25% attack speed, −15% armour.',
      { mods: [{ stat: 'atkSpeed', op: 'flat', value: 0.25 }, { stat: 'armor', op: 'pct', value: -0.15 }] }),
    // path 1: Dirty Trick (+ new spell 4): fighting unfair
    one('pk_corsair_sand_pockets', 'Sand Pockets', 'power', 'Dirty Trick recharges 20% faster, costs 15% less and lasts 30% longer.', { spellMods: [{ spell: TRICK, cd: -0.2, cost: -0.15, dur: 0.3 }] }),
    three('pk_corsair_cheap_shot', 'Cheap Shot', 'power', (r) => `+${r * 8}% damage to blinded or stunned foes.`,
      (r) => ({ mods: [{ stat: 'dmg', op: 'flat', value: 0.08 * r, when: { c: 'targetHas', status: 'blind' } }, { stat: 'dmg', op: 'flat', value: 0.08 * r, when: { c: 'targetHas', status: 'stun' } }] })),
    one('pk_corsair_pocket_sand', 'Pocket Sand', 'trigger', 'Landing a dash blinds the foes around you for 1.5 s, once every 4 s.',
      { procs: [{ on: 'dashEnd', icd: 4000, do: [{ a: 'status', status: { id: 'blind', dur: 1500 }, area: near(64) }] }] }),
    one('pk_corsair_kick_low', 'Kick Low', 'trigger', 'Every 6th hit stuns the foe for 0.8 s.',
      { procs: [{ on: 'hit', every: 6, do: [{ a: 'status', status: { id: 'stun', dur: 800 }, area: tgt }] }] }),
    // path 2: Plunder (+ new spell 5): the take
    one('pk_corsair_deep_pockets', 'Greedy Hands', 'power', 'Plunder recharges 20% faster and hits 25% harder.', { spellMods: [{ spell: PLUNDER, cd: -0.2, dmg: 0.25 }] }),
    three('pk_corsair_treasure_nose', 'Treasure Nose', 'power', (r) => `+${r * 10}% Embershards and +${r * 3}% rarer loot.`,
      (r) => ({ mods: [{ stat: 'gold', op: 'flat', value: 0.1 * r }, { stat: 'itemFind', op: 'flat', value: 0.03 * r }] })),
    one('pk_corsair_pirates_luck', 'Pirate’s Luck', 'trigger', 'Critical hits steal Embershards from the foe; +6% critical chance.',
      { mods: [{ stat: 'crit', op: 'flat', value: 0.06 }], procs: [{ on: 'crit', icd: 1000, do: [{ a: 'steal', gold: 1, buffs: false, area: tgt }] }] }),
    one('pk_corsair_rum_ration', 'Rum Ration', 'resource', 'Kills restore 15 stamina and 3% of max health; when hit, restore 8 stamina, once every 3 s.',
      { mods: [{ stat: 'staminaOnKill', op: 'flat', value: 15 }], procs: [{ on: 'kill', do: [{ a: 'heal', pctMax: 0.03, to: 'self' }] }, { on: 'hurt', icd: 3000, do: [{ a: 'resource', stamina: 8 }] }] }),
  ],
};

const jester: ClassPerks = {
  classId: 'jester',
  signature: [
    // path 0: Juggle (+ new spell 3): the bouncing daggers
    one('pk_jester_more_balls', 'More Balls', 'power', '+1 to Juggle and Knife Fan.',
      { spellLevels: [{ spell: JUGGLE, levels: 1 }, { spell: 'spell:knife-fan', levels: 1 }] }),
    three('pk_jester_showmanship', 'Showmanship', 'power', (r) => `+${r * 2}% critical chance and +${r * 8}% critical damage.`,
      (r) => ({ mods: [{ stat: 'crit', op: 'flat', value: 0.02 * r }, { stat: 'critd', op: 'flat', value: 0.08 * r }] })),
    one('pk_jester_ricochet', 'Ricochet', 'trigger', 'Critical hits bounce to a nearby foe for 40% weapon power.',
      { procs: [{ on: 'crit', icd: 400, do: [{ a: 'chain', coef: 0.4, kind: 'guile', jumps: 1, range: 120 }] }] }),
    one('pk_jester_extra_dagger', 'Extra Dagger', 'tradeoff', '+1 projectile on every throw, −15% damage.',
      { mods: [{ stat: 'projCount', op: 'flat', value: 1 }, { stat: 'dmg', op: 'flat', value: -0.15 }] }),
    // path 1: Pratfall (+ new spell 4): the tumble
    one('pk_jester_tumbler', 'Tumbler', 'power', 'Pratfall recharges 20% faster and lasts 30% longer.', { spellMods: [{ spell: PRAT, cd: -0.2, dur: 0.3 }] }),
    three('pk_jester_acrobat', 'Acrobat', 'resource', (r) => `Your dash costs ${r * 8}% less stamina and recharges ${r * 5}% faster; +${r.toFixed(1)}% critical chance.`,
      (r) => ({ mods: [{ stat: 'crit', op: 'flat', value: 0.01 * r }, { stat: 'staminaCost', op: 'flat', value: -0.08 * r }, { stat: 'dashCd', op: 'flat', value: -0.05 * r }] })),
    one('pk_jester_slapstick', 'Slapstick', 'trigger', 'Landing a dash confuses the foes around you for 1.5 s, once every 5 s; +4% damage.',
      { mods: [{ stat: 'dmg', op: 'flat', value: 0.04 }], procs: [{ on: 'dashEnd', icd: 5000, do: [{ a: 'status', status: { id: 'confuse', dur: 1500 }, area: near(64) }] }] }),
    one('pk_jester_now_you_see_me', 'Now You See Me', 'trigger', 'Landing a dash: your next hit within 2 s is a critical hit, once every 3 s; +4% critical chance.',
      { mods: [{ stat: 'crit', op: 'flat', value: 0.04 }], procs: [{ on: 'dashEnd', icd: 3000, do: [{ a: 'buff', id: 'jst:seeme', dur: 2000, to: 'self', charges: 1, flags: ['nextHitsCrit'] }] }] }),
    // path 2: Punchline (+ new spell 5): the timing
    one('pk_jester_good_timing', 'Good Timing', 'power', 'Punchline recharges 25% faster and lasts 30% longer.', { spellMods: [{ spell: PUNCH, cd: -0.25, dur: 0.3 }] }),
    three('pk_jester_running_gag', 'Running Gag', 'trigger', (r) => `Critical hits: +${r * 5}% attack speed for 3 s; +${r.toFixed(1)}% damage; +${(3 * r).toFixed(1)}% critical damage.`,
      (r) => ({ mods: [{ stat: 'critd', op: 'flat', value: 0.03 * r }, { stat: 'dmg', op: 'flat', value: 0.01 * r }], procs: [{ on: 'crit', icd: 1500, do: [{ a: 'buff', id: 'jst:gag', dur: 3000, to: 'self', mods: [{ stat: 'atkSpeed', op: 'flat', value: 0.05 * r }] }] }] })),
    one('pk_jester_encore', 'Encore', 'resource', 'Critical hits restore 3 Ember and 4 stamina, once every 0.5 s.',
      { procs: [{ on: 'crit', icd: 500, do: [{ a: 'resource', ember: 3, stamina: 4 }] }] }),
    one('pk_jester_tough_crowd', 'Tough Crowd', 'power', 'Below 50% health: +15% critical chance.',
      { mods: [{ stat: 'crit', op: 'flat', value: 0.15, when: { c: 'hpBelow', pct: 0.5 } }] }),
  ],
};

const school: PerkDef[] = [
  // p0 offence
  one('pk_guile_sly', 'Sly', 'power', '+12% Guile damage and +3% critical chance.',
    { mods: [{ stat: 'dmg.guile', op: 'flat', value: 0.12 }, { stat: 'crit', op: 'flat', value: 0.03 }] }),
  one('pk_guile_exploit', 'Exploit Weakness', 'power', '+12% damage to blinded or slowed foes; +3% critical chance.',
    { mods: [{ stat: 'crit', op: 'flat', value: 0.03 }, { stat: 'dmg', op: 'flat', value: 0.12, when: { c: 'targetHas', status: 'blind' } }, { stat: 'dmg', op: 'flat', value: 0.12, when: { c: 'targetHas', status: 'slow' } }] }),
  // p1 defence
  three('pk_guile_light_armour', 'Light on Your Feet', 'power', (r) => `+${r * 3}% move speed and +${r * 2}% max health.`,
    (r) => ({ mods: [{ stat: 'moveSpeed', op: 'flat', value: 0.03 * r }, { stat: 'hp', op: 'pct', value: 0.02 * r }] })),
  one('pk_guile_smoke_bomb', 'Smoke Bomb', 'trigger', 'Below 50% health: vanish for 2 s, once every 45 s.',
    { procs: [{ on: 'lowHp', icd: 45000, do: [{ a: 'buff', id: 'gui:smoke', dur: 2000, to: 'self', flags: ['untargetable'] }] }] }),
  one('pk_guile_slippery', 'Slippery', 'power', '+1 dash charge; your dash costs 10% less stamina.',
    { mods: [{ stat: 'dashCharges', op: 'flat', value: 1 }, { stat: 'staminaCost', op: 'flat', value: -0.1 }] }),
  // p2 focus / resource
  three('pk_guile_quick_wits', 'Quick Wits', 'resource', (r) => `+${r * 10} max stamina and ${r * 2}% shorter cooldowns.`,
    (r) => ({ mods: [{ stat: 'stamina', op: 'flat', value: 10 * r }, { stat: 'cdr', op: 'flat', value: 0.02 * r }] })),
  one('pk_guile_opportunist', 'Opportunist', 'trigger', 'Every 50 stamina spent restores 6 Ember.',
    { procs: [{ on: 'staminaSpent', do: [{ a: 'resource', ember: 6 }] }] }),
  one('pk_guile_silver_tongue', 'Silver Tongue', 'power', '+15% Embershards and +5% Guile damage.',
    { mods: [{ stat: 'gold', op: 'flat', value: 0.15 }, { stat: 'dmg.guile', op: 'flat', value: 0.05 }] }),
];

export const PERKS: SchoolPerks = { school: 'guile', classes: [corsair, jester], perks: school };
