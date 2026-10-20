/**
 * Hunt perks (Claude 5 for Claude 3, docs/systems/BUILDS.md §3; slots in rules/perkTypes.ts). Huntsman and Falconer
 * signatures (12 each, path i themed on kit spell i and the new kit spell i+3) and 8 Hunt school perks. Martial: the
 * builds turn on marks, traps, the falcon, distance and stamina, not only attack damage. Each exclusive c1 / c2 pair is
 * two different playstyles. effects[r-1] is the whole effect at rank r. Budgets: HOLLOW_CROWN.md §2.1.
 */
import type { ClassPerks, PerkDef, PerkKind, SchoolPerks } from '@/systems/rules/perkTypes';
import type { Passive } from '@/systems/rules/types';

const one = (id: string, name: string, kind: PerkKind, text: string, fx: Passive): PerkDef => ({ id, name, kind, ranks: 1, text: [text], effects: [fx] });
/** 3-rank perks are front-loaded: text / fx get a rank weight of 1.5 / 2.25 / 3 (rank 3 as written, rank 1 half of it) */
const RANK_W = [1.5, 2.25, 3];
const three = (id: string, name: string, kind: PerkKind, text: (r: number) => string, fx: (r: number) => Passive): PerkDef =>
  ({ id, name, kind, ranks: 3, text: RANK_W.map(text), effects: RANK_W.map(fx) });
const tgt = { shape: 'single' as const, at: 'target' as const };

const BOLT = 'spell:heavy-bolt', TRAP = 'spell:bear-trap', MARK = 'spell:trackers-mark';
const STOOP = 'spell:stoop', HARRY = 'spell:harry', KNIFE = 'spell:talon-knife';

const huntsman: ClassPerks = {
  classId: 'huntsman',
  signature: [
    // path 0: Heavy Bolt (+ new spell 3): the piercing shot
    one('pk_huntsman_heavy_draw', 'Heavy Draw', 'power', '+1 to Heavy Bolt and Spike Trap.',
      { spellLevels: [{ spell: BOLT, levels: 1 }, { spell: 'spell:spike-trap', levels: 1 }] }),
    three('pk_huntsman_long_shot', 'Long Shot', 'power', (r) => `+${r * 5}% damage to foes 200 px or more away.`,
      (r) => ({ mods: [{ stat: 'dmg', op: 'flat', value: 0.05 * r, when: { c: 'targetFar', px: 200 } }] })),
    one('pk_huntsman_broadheads', 'Broadheads', 'trigger', 'Attack critical hits make the foe bleed (4 s).',
      { procs: [{ on: 'attackCrit', do: [{ a: 'status', status: { id: 'bleed', dur: 4000 }, area: tgt }] }] }),
    one('pk_huntsman_steady_aim', 'Steady Aim', 'power', 'After standing still for 1 s: +20% damage and +5% critical chance.',
      { mods: [{ stat: 'dmg', op: 'flat', value: 0.2, when: { c: 'stationary', ms: 1000 } }, { stat: 'crit', op: 'flat', value: 0.05, when: { c: 'stationary', ms: 1000 } }] }),
    // path 1: Bear Trap (+ new spell 4): the trapper
    one('pk_huntsman_set_traps', 'Set Traps', 'power', 'Bear Trap recharges 20% faster, costs 15% less and bites 30% harder.', { spellMods: [{ spell: TRAP, cd: -0.2, cost: -0.15, dmg: 0.3 }] }),
    three('pk_huntsman_jaws', 'Jaws', 'power', (r) => `+${r * 10}% summon damage and +${r * 10}% bleed damage; Bear Trap and Spike Trap bite ${(8 * r).toFixed(0)}% harder.`,
      (r) => ({ spellMods: [{ spell: 'spell:bear-trap', dmg: 0.08 * r }, { spell: 'spell:spike-trap', dmg: 0.08 * r }], mods: [{ stat: 'minionDmg', op: 'flat', value: 0.1 * r }, { stat: 'statusDmg.bleed', op: 'flat', value: 0.1 * r }] })),
    one('pk_huntsman_snare_line', 'Snare Line', 'trigger', 'Landing a dash roots the nearest foe (1.2 s, 5 s); +4% damage.',
      { mods: [{ stat: 'dmg', op: 'flat', value: 0.04 }], procs: [{ on: 'dashEnd', icd: 5000, do: [{ a: 'status', status: { id: 'root', dur: 1200 }, area: { shape: 'single', at: 'target', r: 220 } }] }] }),
    one('pk_huntsman_pit_fighter', 'Pit Fighter', 'power', '+20% damage to rooted foes; +5% damage to anything.',
      { mods: [{ stat: 'dmg', op: 'flat', value: 0.05 }, { stat: 'dmg', op: 'flat', value: 0.2, when: { c: 'targetHas', status: 'root' } }] }),
    // path 2: Tracker's Mark (+ new spell 5): the hunt
    one('pk_huntsman_keen_tracker', 'Keen Tracker', 'power', 'Tracker’s Mark recharges 20% faster and lasts 30% longer.', { spellMods: [{ spell: MARK, cd: -0.2, dur: 0.3 }] }),
    three('pk_huntsman_quarry', 'Quarry', 'power', (r) => `+${r * 6}% damage to marked foes.`,
      (r) => ({ mods: [{ stat: 'dmg', op: 'flat', value: 0.06 * r, when: { c: 'targetHas', status: 'mark' } }] })),
    one('pk_huntsman_mark_the_herd', 'Mark the Herd', 'trigger', 'Kills, and every 8th attack, mark the nearest foe (+25% damage taken, 6 s).',
      { procs: [{ on: 'kill', do: [{ a: 'status', status: { id: 'mark', dur: 6000, power: 0.25 }, area: { shape: 'single', at: 'target', r: 220 }, maxTargets: 1 }] }, { on: 'attack', every: 8, do: [{ a: 'status', status: { id: 'mark', dur: 6000, power: 0.25 }, area: tgt, maxTargets: 1 }] }] }),
    one('pk_huntsman_relentless', 'Relentless Pursuit', 'resource', 'Kills restore 15 stamina; +8% move speed.',
      { mods: [{ stat: 'staminaOnKill', op: 'flat', value: 15 }, { stat: 'moveSpeed', op: 'flat', value: 0.08 }] }),
  ],
};

const falconer: ClassPerks = {
  classId: 'falconer',
  signature: [
    // path 0: Stoop (+ new spell 3): the dive
    one('pk_falconer_high_stoop', 'High Stoop', 'power', '+2 to Stoop and Talon Rake.',
      { spellLevels: [{ spell: STOOP, levels: 2 }, { spell: 'spell:talon-rake', levels: 2 }] }),
    three('pk_falconer_sharp_talons', 'Sharp Talons', 'power', (r) => `+${r * 10}% summon damage; Stoop, Talon Rake and Sky Hunt deal ${(12 * r).toFixed(0)}% more.`, (r) => ({ spellMods: [{ spell: 'spell:stoop', dmg: 0.12 * r }, { spell: 'spell:talon-rake', dmg: 0.12 * r }, { spell: 'spell:sky-hunt', dmg: 0.12 * r }], mods: [{ stat: 'minionDmg', op: 'flat', value: 0.1 * r }] })),
    one('pk_falconer_rending_dive', 'Rending Dive', 'trigger', 'Summoning makes the target bleed (4 s, 2 s); casting makes the target bleed (4 s, 2 s).',
      { procs: [{ on: 'cast', icd: 2000, do: [{ a: 'status', status: { id: 'bleed', dur: 4000 }, area: { shape: 'single', at: 'target' } }] }, { on: 'summon', icd: 2000, do: [{ a: 'status', status: { id: 'bleed', dur: 4000 }, area: tgt }] }] }),
    one('pk_falconer_bond', 'Shared Sight', 'power', 'With a summon out: +5% critical chance and +15% critical damage.',
      { mods: [{ stat: 'crit', op: 'flat', value: 0.05, when: { c: 'minions', min: 1 } }, { stat: 'critd', op: 'flat', value: 0.15, when: { c: 'minions', min: 1 } }] }),
    // path 1: Harry (+ new spell 4): the circling bird
    one('pk_falconer_tireless_wings', 'Tireless Wings', 'power', 'Harry recharges 20% faster and hits 25% harder.', { spellMods: [{ spell: HARRY, cd: -0.2, dmg: 0.25 }] }),
    three('pk_falconer_hardy_bird', 'Hardy Bird', 'power', (r) => `+${r * 15}% summon health; +${r * 2}% max health.`,
      (r) => ({ mods: [{ stat: 'minionHp', op: 'flat', value: 0.15 * r }, { stat: 'hp', op: 'pct', value: 0.02 * r }] })),
    one('pk_falconer_blinded_prey', 'Blinded Prey', 'power', '+20% damage to blinded foes.',
      { mods: [{ stat: 'dmg', op: 'flat', value: 0.2, when: { c: 'targetHas', status: 'blind' } }] }),
    one('pk_falconer_screech', 'Screech', 'aura', 'Foes near you deal 10% less damage.',
      { aura: [{ id: 'flc:screech', r: 120, enemies: true, mods: [{ stat: 'dmg', op: 'flat', value: -0.1 }] }] }),
    // path 2: Talon Knife (+ new spell 5): the throw while the bird is away
    one('pk_falconer_quick_throw', 'Quick Throw', 'power', 'Talon Knife recharges 20% faster and costs 15% less and hits 25% harder.', { spellMods: [{ spell: KNIFE, cd: -0.2, cost: -0.15, dmg: 0.25 }] }),
    three('pk_falconer_knife_work', 'Knife Work', 'power', (r) => `+${r * 6}% attack damage and +${r * 4}% attack speed.`,
      (r) => ({ mods: [{ stat: 'attackDmg', op: 'flat', value: 0.06 * r }, { stat: 'atkSpeed', op: 'flat', value: 0.04 * r }] })),
    one('pk_falconer_lone_hunter', 'Lone Hunter', 'tradeoff', '+30% attack damage; your summons deal 30% less.',
      { mods: [{ stat: 'attackDmg', op: 'flat', value: 0.3 }, { stat: 'minionDmg', op: 'flat', value: -0.3 }] }),
    one('pk_falconer_falcons_eye', 'Falcon’s Eye', 'trigger', 'Critical hits send the falcon at the foe for 50% weapon power (1.5 s).',
      { procs: [{ on: 'crit', icd: 1500, do: [{ a: 'damage', coef: 0.5, kind: 'hunt', area: tgt }] }] }),
  ],
};

const school: PerkDef[] = [
  // p0 offence
  one('pk_hunt_predator_instinct', 'Predator Instinct', 'power', '+12% Hunt damage and +3% critical chance.',
    { mods: [{ stat: 'dmg.hunt', op: 'flat', value: 0.12 }, { stat: 'crit', op: 'flat', value: 0.03 }] }),
  one('pk_hunt_first_blood', 'First Blood', 'power', '+15% damage to foes above 80% health.',
    { mods: [{ stat: 'dmg', op: 'flat', value: 0.15, when: { c: 'targetHpAbove', pct: 0.8 } }] }),
  // p1 defence
  three('pk_hunt_hide_cloak', 'Hide Cloak', 'power', (r) => `+${r * 3}% max health and +${r * 3}% move speed.`,
    (r) => ({ mods: [{ stat: 'hp', op: 'pct', value: 0.03 * r }, { stat: 'moveSpeed', op: 'flat', value: 0.03 * r }] })),
  one('pk_hunt_disengage', 'Disengage', 'trigger', 'When hit: +25% move speed for 2 s (5 s); +4% max health.',
    { mods: [{ stat: 'hp', op: 'pct', value: 0.04 }], procs: [{ on: 'hurt', icd: 5000, do: [{ a: 'buff', id: 'hnt:away', dur: 2000, to: 'self', mods: [{ stat: 'moveSpeed', op: 'flat', value: 0.25 }] }] }] }),
  one('pk_hunt_camouflage', 'Camouflage', 'trigger', 'Below 50% health: vanish for 2 s (45 s).',
    { procs: [{ on: 'lowHp', icd: 45000, do: [{ a: 'buff', id: 'hnt:camo', dur: 2000, to: 'self', flags: ['untargetable'] }] }] }),
  // p2 focus / resource
  three('pk_hunt_trail_wind', 'Trail Wind', 'resource', (r) => `+${r * 10} max stamina and +${r * 6}% stamina regeneration.`,
    (r) => ({ mods: [{ stat: 'stamina', op: 'flat', value: 10 * r }, { stat: 'staminaRegen', op: 'pct', value: 0.06 * r }] })),
  one('pk_hunt_field_dressing', 'Field Dressing', 'resource', 'Kills restore 5 Ember and 3% of max health; +4% damage.',
    { mods: [{ stat: 'dmg', op: 'flat', value: 0.04 }], procs: [{ on: 'kill', do: [{ a: 'resource', ember: 5 }, { a: 'heal', pctMax: 0.03, to: 'self' }] }] }),
  one('pk_hunt_patience', 'Hunter’s Patience', 'power', '6% shorter cooldowns and +5% Hunt damage.',
    { mods: [{ stat: 'cdr', op: 'flat', value: 0.06 }, { stat: 'dmg.hunt', op: 'flat', value: 0.05 }] }),
];

export const PERKS: SchoolPerks = { school: 'hunt', classes: [huntsman, falconer], perks: school };
