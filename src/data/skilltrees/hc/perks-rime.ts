/**
 * Rime perks (Claude 5 for Claude 3, docs/systems/BUILDS.md §3; slots in rules/perkTypes.ts). Warden and Rimecaller
 * signatures (12 each, path i themed on kit spell i and the new kit spell i+3) and 8 Rime school perks. Each exclusive
 * c1 / c2 pair is two different playstyles. effects[r-1] is the whole effect at rank r. Numbers follow the
 * HOLLOW_CROWN.md §2.1 budgets: a perk ≈ a 3-rank node of the old tree; trade-offs net about +20%.
 */
import type { ClassPerks, PerkDef, PerkKind, SchoolPerks } from '@/systems/rules/perkTypes';
import type { Passive } from '@/systems/rules/types';

const one = (id: string, name: string, kind: PerkKind, text: string, fx: Passive): PerkDef => ({ id, name, kind, ranks: 1, text: [text], effects: [fx] });
const three = (id: string, name: string, kind: PerkKind, text: (r: number) => string, fx: (r: number) => Passive): PerkDef =>
  ({ id, name, kind, ranks: 3, text: [1, 2, 3].map(text), effects: [1, 2, 3].map(fx) });
const near = (r: number) => ({ shape: 'circle' as const, at: 'self' as const, r });
const tgt = { shape: 'single' as const, at: 'target' as const };

const SLAM = 'spell:bulwark-slam', HOLD = 'spell:hold-the-line', WARD = 'spell:rime-ward';
const SHARD = 'spell:rime-shard', FIELD = 'spell:hoarfrost-field', WALL = 'spell:glacier-wall';

const warden: ClassPerks = {
  classId: 'warden',
  signature: [
    // path 0: Bulwark Slam (+ new spell 3): the shield as a hammer
    one('pk_warden_heavy_slam', 'Heavy Slam', 'power', '+1 to Bulwark Slam and Frost Rampart.',
      { spellLevels: [{ spell: SLAM, levels: 1 }, { spell: 'spell:frost-rampart', levels: 1 }] }),
    three('pk_warden_glacial_weight', 'Glacial Weight', 'power', (r) => `+${r * 5}% damage to chilled foes.`,
      (r) => ({ mods: [{ stat: 'dmg', op: 'flat', value: 0.05 * r, when: { c: 'targetHas', status: 'chill' } }] })),
    one('pk_warden_frost_bite', 'Frost Bite', 'trigger', 'Hits have a 15% chance to freeze the foe for 1 s (3 s).',
      { procs: [{ on: 'hit', chance: 0.15, icd: 3000, do: [{ a: 'status', status: { id: 'freeze', dur: 1000 }, area: tgt }] }] }),
    one('pk_warden_avalanche', 'Avalanche', 'tradeoff', '+30% attack damage, −10% move speed.',
      { mods: [{ stat: 'attackDmg', op: 'flat', value: 0.3 }, { stat: 'moveSpeed', op: 'flat', value: -0.1 }] }),
    // path 1: Hold the Line (+ new spell 4): blocking as a weapon
    one('pk_warden_steady_line', 'Steady Line', 'power', 'Hold the Line recharges 20% faster.', { spellMods: [{ spell: HOLD, cd: -0.2 }] }),
    three('pk_warden_frozen_bulwark', 'Frozen Bulwark', 'power', (r) => `+${r * 4}% block chance.`, (r) => ({ mods: [{ stat: 'block', op: 'flat', value: 0.04 * r }] })),
    one('pk_warden_retaliation', 'Retaliation', 'trigger', 'Blocking strikes back for 60% weapon power as Rime.',
      { procs: [{ on: 'block', icd: 500, do: [{ a: 'damage', coef: 0.6, kind: 'rime', area: tgt }] }] }),
    one('pk_warden_stand_fast', 'Stand Fast', 'trigger', 'Blocking grants a shield of 5% max health (2 s).',
      { procs: [{ on: 'block', icd: 2000, do: [{ a: 'shield', pctMax: 0.05, dur: 4000, to: 'self' }] }] }),
    // path 2: Rime Ward (+ new spell 5): the frozen ground you hold
    one('pk_warden_ward_craft', 'Ward-craft', 'power', 'Rime Ward costs 20% less and recharges 15% faster.', { spellMods: [{ spell: WARD, cost: -0.2, cd: -0.15 }] }),
    three('pk_warden_cold_front', 'Cold Front', 'aura', (r) => `Foes near you deal ${r * 4}% less damage.`,
      (r) => ({ aura: [{ id: 'war:coldfront', r: 120, enemies: true, mods: [{ stat: 'dmg', op: 'flat', value: -0.04 * r }] }] })),
    one('pk_warden_oath_of_ice', 'Oath of Ice', 'aura', 'You and allies near you gain 12% armour and 5% max health.',
      { aura: [{ id: 'war:oath', r: 160, mods: [{ stat: 'armor', op: 'pct', value: 0.12 }, { stat: 'hp', op: 'pct', value: 0.05 }] }] }),
    one('pk_warden_winters_grasp', 'Winter’s Grasp', 'trigger', 'Hits have a 30% chance to chill the foe (2 s).',
      { procs: [{ on: 'hit', chance: 0.3, do: [{ a: 'status', status: { id: 'chill', dur: 2000 }, area: tgt }] }] }),
  ],
};

const rimecaller: ClassPerks = {
  classId: 'rimecaller',
  signature: [
    // path 0: Rime Shard (+ new spell 3): the sniper of ice
    one('pk_rimecaller_keen_shard', 'Keen Shard', 'power', '+1 to Rime Shard and Frozen Lance.',
      { spellLevels: [{ spell: SHARD, levels: 1 }, { spell: 'spell:frozen-lance', levels: 1 }] }),
    three('pk_rimecaller_brittle', 'Brittle', 'power', (r) => `+${r * 5}% damage to chilled foes.`,
      (r) => ({ mods: [{ stat: 'dmg', op: 'flat', value: 0.05 * r, when: { c: 'targetHas', status: 'chill' } }] })),
    one('pk_rimecaller_shatter_shot', 'Shatter Shot', 'trigger', 'Spell critical hits shatter, hitting foes around the target for 40% spell power.',
      { procs: [{ on: 'spellCrit', icd: 300, do: [{ a: 'damage', coef: 0.4, kind: 'rime', area: { shape: 'circle', at: 'target', r: 48 } }] }] }),
    one('pk_rimecaller_deep_winter', 'Deep Winter', 'power', 'Your statuses last 25% longer and slow 15% harder.',
      { mods: [{ stat: 'statusDur', op: 'flat', value: 0.25 }, { stat: 'slowPower', op: 'flat', value: 0.15 }] }),
    // path 1: Hoarfrost Field (+ new spell 4): rooted in place
    one('pk_rimecaller_spreading_frost', 'Spreading Frost', 'power', 'Hoarfrost Field recharges 20% faster.', { spellMods: [{ spell: FIELD, cd: -0.2 }] }),
    three('pk_rimecaller_permafrost', 'Permafrost', 'power', (r) => `Your roots last ${r * 10}% longer.`, (r) => ({ mods: [{ stat: 'rootDur', op: 'flat', value: 0.1 * r }] })),
    one('pk_rimecaller_frostbite_field', 'Frostbite Field', 'power', '+20% damage to rooted or frozen foes.',
      { mods: [{ stat: 'dmg', op: 'flat', value: 0.2, when: { c: 'targetHas', status: 'root' } }, { stat: 'dmg', op: 'flat', value: 0.2, when: { c: 'targetHas', status: 'freeze' } }] }),
    one('pk_rimecaller_glacial_ambition', 'Glacial Ambition', 'tradeoff', '+35% spell damage, −12% move speed.',
      { mods: [{ stat: 'spellDmg', op: 'flat', value: 0.35 }, { stat: 'moveSpeed', op: 'flat', value: -0.12 }] }),
    // path 2: Glacier Wall (+ new spell 5): walls and wards
    one('pk_rimecaller_quick_wall', 'Quick Wall', 'power', 'Glacier Wall recharges 25% faster.', { spellMods: [{ spell: WALL, cd: -0.25 }] }),
    three('pk_rimecaller_ice_mirror', 'Ice Mirror', 'trigger', (r) => `When hit: a shield of ${3 + r * 3}% max health (8 s).`,
      (r) => ({ procs: [{ on: 'hurt', icd: 8000, do: [{ a: 'shield', pctMax: 0.03 + 0.03 * r, dur: 5000, to: 'self' }] }] })),
    one('pk_rimecaller_cold_blood', 'Cold Blood', 'resource', 'Below 30% Ember: +3 Ember per second.',
      { mods: [{ stat: 'emberRegen', op: 'flat', value: 3, when: { c: 'emberBelow', pct: 0.3 } }] }),
    one('pk_rimecaller_blizzard_heart', 'Blizzard Heart', 'aura', 'Foes near you move 15% slower.',
      { aura: [{ id: 'rmc:blizzard', r: 140, enemies: true, mods: [{ stat: 'moveSpeed', op: 'flat', value: -0.15 }] }] }),
  ],
};

const school: PerkDef[] = [
  // p0 offence
  one('pk_rime_frostbite', 'Frostbite', 'power', '+12% Rime damage; your slows are 10% stronger.',
    { mods: [{ stat: 'dmg.rime', op: 'flat', value: 0.12 }, { stat: 'slowPower', op: 'flat', value: 0.1 }] }),
  one('pk_rime_icicle_edge', 'Icicle Edge', 'power', '+4% critical chance; +20% critical damage against chilled foes.',
    { mods: [{ stat: 'crit', op: 'flat', value: 0.04 }, { stat: 'critd', op: 'flat', value: 0.2, when: { c: 'targetHas', status: 'chill' } }] }),
  // p1 defence
  three('pk_rime_glacial_skin', 'Glacial Skin', 'power', (r) => `+${r * 5}% Rime resistance and +${r * 3}% armour.`,
    (r) => ({ mods: [{ stat: 'resist.rime', op: 'flat', value: 0.05 * r }, { stat: 'armor', op: 'pct', value: 0.03 * r }] })),
  one('pk_rime_frozen_retort', 'Frozen Retort', 'trigger', 'When hit: chill the foes around you (4 s).',
    { procs: [{ on: 'hurt', icd: 4000, do: [{ a: 'status', status: { id: 'chill', dur: 2000 }, area: near(64) }] }] }),
  one('pk_rime_ice_block', 'Ice Block', 'trigger', 'Below 50% health: a shield of 25% max health (60 s).',
    { procs: [{ on: 'lowHp', icd: 60000, do: [{ a: 'shield', pctMax: 0.25, dur: 6000, to: 'self' }] }] }),
  // p2 focus / resource
  three('pk_rime_clear_mind', 'Clear Mind', 'resource', (r) => `+${(0.3 * r).toFixed(1)} Ember per second and ${r * 2}% shorter cooldowns.`,
    (r) => ({ mods: [{ stat: 'emberRegen', op: 'flat', value: 0.3 * r }, { stat: 'cdr', op: 'flat', value: 0.02 * r }] })),
  one('pk_rime_snowfall', 'Snowfall', 'trigger', 'Every 50 Ember spent: +8% damage for 4 s.',
    { procs: [{ on: 'emberSpent', do: [{ a: 'buff', id: 'rime:snowfall', dur: 4000, to: 'self', mods: [{ stat: 'dmg', op: 'flat', value: 0.08 }] }] }] }),
  one('pk_rime_winter_patience', 'Patience of Winter', 'power', 'After standing still for 1 s: +15% spell damage.',
    { mods: [{ stat: 'spellDmg', op: 'flat', value: 0.15, when: { c: 'stationary', ms: 1000 } }] }),
];

export const PERKS: SchoolPerks = { school: 'rime', classes: [warden, rimecaller], perks: school };
