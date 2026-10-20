/**
 * Umbral perks (Claude 5 for Claude 3, docs/systems/BUILDS.md §3; slots in rules/perkTypes.ts). Shade and Duskweaver
 * signatures (12 each, path i themed on kit spell i and the new kit spell i+3) and 8 Umbral school perks. Each
 * exclusive c1 / c2 pair is two different playstyles. effects[r-1] is the whole effect at rank r. Numbers follow the
 * HOLLOW_CROWN.md §2.1 budgets: a perk ≈ a 3-rank node of the old tree; trade-offs net about +20%.
 */
import type { ClassPerks, PerkDef, PerkKind, SchoolPerks } from '@/systems/rules/perkTypes';
import type { Passive } from '@/systems/rules/types';

const one = (id: string, name: string, kind: PerkKind, text: string, fx: Passive): PerkDef => ({ id, name, kind, ranks: 1, text: [text], effects: [fx] });
/** 3-rank perks are front-loaded: text / fx get a rank weight of 1.5 / 2.25 / 3 (rank 3 as written, rank 1 half of it) */
const RANK_W = [1.5, 2.25, 3];
const three = (id: string, name: string, kind: PerkKind, text: (r: number) => string, fx: (r: number) => Passive): PerkDef =>
  ({ id, name, kind, ranks: 3, text: RANK_W.map(text), effects: RANK_W.map(fx) });
const tgt = { shape: 'single' as const, at: 'target' as const };

const STEP = 'spell:umbral-step', FAN = 'spell:nightglass-fan', MARK = 'spell:mark-for-death';
const THREAD = 'spell:night-thread', ORB = 'spell:eclipse-orb', UNMAKE = 'spell:unmaking';

const shade: ClassPerks = {
  classId: 'shade',
  signature: [
    // path 0: Umbral Step (+ new spell 3): the blink behind
    one('pk_shade_deep_step', 'Deep Step', 'power', '+2 to Umbral Step and Shadowstrike.',
      { spellLevels: [{ spell: STEP, levels: 2 }, { spell: 'spell:shadowstrike', levels: 2 }] }),
    three('pk_shade_backstab', 'Backstab', 'power', (r) => `+${r * 8}% damage from behind; +${r.toFixed(1)}% damage from any side.`,
      (r) => ({ mods: [{ stat: 'dmg', op: 'flat', value: 0.01 * r }, { stat: 'dmg', op: 'flat', value: 0.08 * r, when: { c: 'behind' } }] })),
    one('pk_shade_ambush', 'Ambush', 'trigger', 'Hits from stealth deal double damage and make the foe bleed; +10% critical damage.',
      { mods: [{ stat: 'critd', op: 'flat', value: 0.1 }, { stat: 'dmg', op: 'more', value: 1, when: { c: 'fromStealth' } }], procs: [{ on: 'stealthHit', do: [{ a: 'status', status: { id: 'bleed', dur: 4000 }, area: tgt }] }] }),
    one('pk_shade_shadow_dance', 'Shadow Dance', 'trigger', 'Landing a dash: your next hit within 2 s is a critical hit, once every 3 s; +3% critical chance.',
      { mods: [{ stat: 'crit', op: 'flat', value: 0.03 }], procs: [{ on: 'dashEnd', icd: 3000, do: [{ a: 'buff', id: 'shd:dance', dur: 2000, to: 'self', charges: 1, flags: ['nextHitsCrit'] }] }] }),
    // path 1: Nightglass Fan (+ new spell 4): blades in the dark
    one('pk_shade_glass_edges', 'Glass Edges', 'power', 'Nightglass Fan recharges 20% faster and hits 25% harder.', { spellMods: [{ spell: FAN, cd: -0.2, dmg: 0.25 }] }),
    three('pk_shade_serrated_glass', 'Serrated Glass', 'power', (r) => `+${r * 10}% bleed damage and +${r * 2}% critical chance; +${r.toFixed(1)}% damage.`,
      (r) => ({ mods: [{ stat: 'dmg', op: 'flat', value: 0.01 * r }, { stat: 'statusDmg.bleed', op: 'flat', value: 0.1 * r }, { stat: 'crit', op: 'flat', value: 0.02 * r }] })),
    one('pk_shade_night_blades', 'Night Blades', 'conversion', 'Your attacks deal 50% of their damage as Umbral; +10% Umbral damage.',
      { convert: [{ from: 'attack', to: 'umbral', pct: 0.5 }], mods: [{ stat: 'dmg.umbral', op: 'flat', value: 0.1 }] }),
    one('pk_shade_thousand_cuts', 'Thousand Cuts', 'tradeoff', '+25% attack speed, −15% max health.',
      { mods: [{ stat: 'atkSpeed', op: 'flat', value: 0.25 }, { stat: 'hp', op: 'pct', value: -0.15 }] }),
    // path 2: Mark for Death (+ new spell 5): the contract
    one('pk_shade_long_contract', 'Long Contract', 'power', 'Mark for Death recharges 20% faster, costs 15% less and lasts 30% longer.', { spellMods: [{ spell: MARK, cd: -0.2, cost: -0.15, dur: 0.3 }] }),
    three('pk_shade_executioner', 'Executioner', 'power', (r) => `+${r * 8}% damage to foes below 30% health; +${(2 * r).toFixed(1)}% damage to all foes.`,
      (r) => ({ mods: [{ stat: 'dmg', op: 'flat', value: 0.02 * r }, { stat: 'dmg', op: 'flat', value: 0.08 * r, when: { c: 'targetHpBelow', pct: 0.3 } }] })),
    one('pk_shade_vanish', 'Vanish', 'trigger', 'Kills, or dropping below 50% health, hide you in shadow for 1.5 s (6 s; 30 s below half health).',
      { procs: [{ on: 'kill', icd: 6000, do: [{ a: 'buff', id: 'shd:vanish', dur: 1500, to: 'self', flags: ['untargetable'] }] }, { on: 'lowHp', icd: 30000, do: [{ a: 'buff', id: 'shd:vanish', dur: 1500, to: 'self', flags: ['untargetable'] }] }] }),
    one('pk_shade_bloodprice', 'Blood Price', 'resource', 'Kills restore 20 stamina and 4% of max health; critical hits heal 1%, once every 1 s.',
      { mods: [{ stat: 'staminaOnKill', op: 'flat', value: 20 }], procs: [{ on: 'kill', do: [{ a: 'heal', pctMax: 0.04, to: 'self' }] }, { on: 'crit', icd: 1000, do: [{ a: 'heal', pctMax: 0.01, to: 'self' }] }] }),
  ],
};

const duskweaver: ClassPerks = {
  classId: 'duskweaver',
  signature: [
    // path 0: Night Thread (+ new spell 3): binding foes together
    one('pk_duskweaver_strong_thread', 'Strong Thread', 'power', '+2 to Night Thread and Soul Link.',
      { spellLevels: [{ spell: THREAD, levels: 2 }, { spell: 'spell:soul-link', levels: 2 }] }),
    three('pk_duskweaver_tangle', 'Tangle', 'power', (r) => `+${r * 6}% damage to linked foes.`,
      (r) => ({ mods: [{ stat: 'dmg', op: 'flat', value: 0.06 * r, when: { c: 'targetHas', status: 'linked' } }] })),
    one('pk_duskweaver_unravel', 'Unravel', 'trigger', 'Setting any status has a 20% chance to burst shadow around the foe.',
      { procs: [{ on: 'statusApplied', chance: 0.2, icd: 400, do: [{ a: 'damage', coef: 0.35, kind: 'umbral', area: { shape: 'circle', at: 'target', r: 56 } }] }] }),
    one('pk_duskweaver_frayed_mind', 'Frayed Mind', 'tradeoff', '+35% spell damage, −20% armour.',
      { mods: [{ stat: 'spellDmg', op: 'flat', value: 0.35 }, { stat: 'armor', op: 'pct', value: -0.2 }] }),
    // path 1: Eclipse Orb (+ new spell 4): swallowing light
    one('pk_duskweaver_wide_eclipse', 'Patient Eclipse', 'power', 'Eclipse Orb recharges 20% faster, costs 15% less and hits 25% harder.', { spellMods: [{ spell: ORB, cd: -0.2, cost: -0.15, dmg: 0.25 }] }),
    three('pk_duskweaver_hungering_dark', 'Hungering Dark', 'resource', (r) => `Heal for ${r}% of the damage you deal.`, (r) => ({ mods: [{ stat: 'lifesteal', op: 'flat', value: 0.01 * r }] })),
    one('pk_duskweaver_void_ward', 'Void Ward', 'trigger', 'Casting grants a shield of 4% max health, once every 3 s.',
      { procs: [{ on: 'cast', icd: 3000, do: [{ a: 'shield', pctMax: 0.04, dur: 4000, to: 'self' }] }] }),
    one('pk_duskweaver_gloom', 'Gloom', 'aura', 'Foes near you deal 10% less damage.',
      { aura: [{ id: 'dsk:gloom', r: 120, enemies: true, mods: [{ stat: 'dmg', op: 'flat', value: -0.1 }] }] }),
    // path 2: Unmaking (+ new spell 5): curses that end things
    one('pk_duskweaver_swift_curse', 'Swift Curse', 'power', 'Unmaking recharges 20% faster and hits 25% harder; +4% Umbral damage.', { mods: [{ stat: 'dmg.umbral', op: 'flat', value: 0.04 }], spellMods: [{ spell: UNMAKE, cd: -0.2, dmg: 0.25 }] }),
    three('pk_duskweaver_doom', 'Doomsayer', 'power', (r) => `Your statuses last ${r * 8}% longer and land ${r * 4}% more often; +${(2.5 * r).toFixed(1)}% Umbral damage.`,
      (r) => ({ mods: [{ stat: 'dmg.umbral', op: 'flat', value: 0.025 * r }, { stat: 'statusDur', op: 'flat', value: 0.08 * r }, { stat: 'statusChance', op: 'flat', value: 0.04 * r }] })),
    one('pk_duskweaver_soul_harvest', 'Soul Harvest', 'resource', 'Kills restore 8 Ember and 3% of max health; every 10th hit restores 4 Ember; +5% Umbral damage.',
      { mods: [{ stat: 'dmg.umbral', op: 'flat', value: 0.05 }], procs: [{ on: 'kill', do: [{ a: 'resource', ember: 8 }, { a: 'heal', pctMax: 0.03, to: 'self' }] }, { on: 'hit', every: 10, do: [{ a: 'resource', ember: 4 }] }] }),
    one('pk_duskweaver_chain_curse', 'Chained Curse', 'trigger', 'Kills spread darkness: foes around the body take 60% spell power; +4% damage.',
      { mods: [{ stat: 'dmg', op: 'flat', value: 0.04 }], procs: [{ on: 'kill', do: [{ a: 'damage', coef: 0.6, kind: 'umbral', area: { shape: 'circle', at: 'target', r: 72 } }] }] }),
  ],
};

const school: PerkDef[] = [
  // p0 offence
  one('pk_umbral_dusk', 'Dusk', 'power', '+12% Umbral damage and +3% critical chance.',
    { mods: [{ stat: 'dmg.umbral', op: 'flat', value: 0.12 }, { stat: 'crit', op: 'flat', value: 0.03 }] }),
  one('pk_umbral_predator', 'Predator', 'power', '+12% damage to foes below 50% health; +3% critical chance.',
    { mods: [{ stat: 'crit', op: 'flat', value: 0.03 }, { stat: 'dmg', op: 'flat', value: 0.12, when: { c: 'targetHpBelow', pct: 0.5 } }] }),
  // p1 defence
  three('pk_umbral_shroud', 'Shroud', 'power', (r) => `+${r * 5}% Umbral resistance and +${r * 2}% max health.`,
    (r) => ({ mods: [{ stat: 'resist.umbral', op: 'flat', value: 0.05 * r }, { stat: 'hp', op: 'pct', value: 0.02 * r }] })),
  one('pk_umbral_fade', 'Fade', 'trigger', 'Below 50% health: vanish for 2 s, once every 45 s.',
    { procs: [{ on: 'lowHp', icd: 45000, do: [{ a: 'buff', id: 'umb:fade', dur: 2000, to: 'self', flags: ['untargetable'] }] }] }),
  one('pk_umbral_leech', 'Leech', 'resource', 'Heal for 3% of the damage you deal.', { mods: [{ stat: 'lifesteal', op: 'flat', value: 0.03 }] }),
  // p2 focus / resource
  three('pk_umbral_night_mind', 'Night Mind', 'resource', (r) => `+${(0.3 * r).toFixed(1)} Ember per second and ${r * 2}% shorter cooldowns.`,
    (r) => ({ mods: [{ stat: 'emberRegen', op: 'flat', value: 0.3 * r }, { stat: 'cdr', op: 'flat', value: 0.02 * r }] })),
  one('pk_umbral_shadow_stride', 'Shadow Stride', 'power', 'Your dash recharges 20% faster and costs 15% less stamina; +4% damage.',
    { mods: [{ stat: 'dmg', op: 'flat', value: 0.04 }, { stat: 'dashCd', op: 'flat', value: -0.2 }, { stat: 'staminaCost', op: 'flat', value: -0.15 }] }),
  one('pk_umbral_dark_pact', 'Dark Pact', 'resource', 'Every 50 Ember spent heals 3% of max health.',
    { procs: [{ on: 'emberSpent', do: [{ a: 'heal', pctMax: 0.03, to: 'self' }] }] }),
];

export const PERKS: SchoolPerks = { school: 'umbral', classes: [shade, duskweaver], perks: school };
