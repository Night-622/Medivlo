/**
 * Radiance perks (Claude 5 for Claude 3, docs/systems/BUILDS.md §3; slots in rules/perkTypes.ts). Oathbound and Cantor
 * signatures (12 each, path i themed on kit spell i and the new kit spell i+3) and 8 Radiance school perks. Each
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
const near = (r: number) => ({ shape: 'circle' as const, at: 'self' as const, r });
const tgt = { shape: 'single' as const, at: 'target' as const };

const SUNDER = 'spell:sunder-light', HANDS = 'spell:lay-on-hands', OATH = 'spell:oath-of-dawn';
const HYMN = 'spell:hymn-of-mending', CENSER = 'spell:censer-swing', CHORD = 'spell:bright-chord';

const oathbound: ClassPerks = {
  classId: 'oathbound',
  signature: [
    // path 0: Sunder Light (+ new spell 3): the holy hammer
    one('pk_oathbound_dawn_hammer', 'Dawn Hammer', 'power', '+1 to Sunder Light and Hammer of Dawn.',
      { spellLevels: [{ spell: SUNDER, levels: 1 }, { spell: 'spell:hammer-of-dawn', levels: 1 }] }),
    three('pk_oathbound_judgement', 'Judgement', 'power', (r) => `+${r * 6}% damage to foes above 80% health.`,
      (r) => ({ mods: [{ stat: 'dmg', op: 'flat', value: 0.06 * r, when: { c: 'targetHpAbove', pct: 0.8 } }] })),
    one('pk_oathbound_blinding_blow', 'Blinding Blow', 'trigger', 'Attack critical hits blind the foe for 1.5 s; +4% critical chance.',
      { mods: [{ stat: 'crit', op: 'flat', value: 0.04 }], procs: [{ on: 'attackCrit', icd: 2000, do: [{ a: 'status', status: { id: 'blind', dur: 1500 }, area: tgt }] }] }),
    one('pk_oathbound_zealot', 'Zealot', 'tradeoff', '+30% attack damage, −30% healing received.',
      { mods: [{ stat: 'attackDmg', op: 'flat', value: 0.3 }, { stat: 'healingTaken', op: 'flat', value: -0.3 }] }),
    // path 1: Lay on Hands (+ new spell 4): the healer in armour
    one('pk_oathbound_ready_hands', 'Ready Hands', 'power', 'Lay on Hands recharges 25% faster and heals 25% more.', { spellMods: [{ spell: HANDS, cd: -0.25, dmg: 0.25 }] }),
    three('pk_oathbound_devotion', 'Devotion', 'power', (r) => `+${r * 8}% healing done and received.`,
      (r) => ({ mods: [{ stat: 'healing', op: 'flat', value: 0.08 * r }, { stat: 'healingTaken', op: 'flat', value: 0.08 * r }] })),
    one('pk_oathbound_martyr', 'Martyr’s Gift', 'trigger', 'When hit: heal allies near you for 4% of your max health, once every 3 s.',
      { procs: [{ on: 'hurt', icd: 3000, do: [{ a: 'heal', pctMax: 0.04, to: 'allies', r: 140 }] }] }),
    one('pk_oathbound_smite_heal', 'Smiting Grace', 'trigger', 'Your heals strike foes near you for 50% weapon power.',
      { procs: [{ on: 'heal', icd: 1500, do: [{ a: 'damage', coef: 0.5, kind: 'radiance', area: near(96) }] }] }),
    // path 2: Oath of Dawn (+ new spell 5): the shield of the line
    one('pk_oathbound_long_oath', 'Long Oath', 'power', 'Oath of Dawn recharges 20% faster, costs 15% less and lasts 30% longer.', { spellMods: [{ spell: OATH, cd: -0.2, cost: -0.15, dur: 0.3 }] }),
    three('pk_oathbound_aegis', 'Aegis', 'aura', (r) => `You and allies near you take ${r * 3}% less damage.`,
      (r) => ({ aura: [{ id: 'oth:aegis', r: 160, mods: [{ stat: 'dmgTaken', op: 'flat', value: -0.03 * r }] }] })),
    one('pk_oathbound_bastion', 'Bastion', 'power', '+10% block chance; blocking heals 3% of max health.',
      { mods: [{ stat: 'block', op: 'flat', value: 0.1 }], procs: [{ on: 'block', icd: 1000, do: [{ a: 'heal', pctMax: 0.03, to: 'self' }] }] }),
    one('pk_oathbound_crusade', 'Crusade', 'aura', 'You and allies near you deal 10% more damage.',
      { aura: [{ id: 'oth:crusade', r: 160, mods: [{ stat: 'dmg', op: 'flat', value: 0.1 }] }] }),
  ],
};

const cantor: ClassPerks = {
  classId: 'cantor',
  signature: [
    // path 0: Hymn of Mending (+ new spell 3): the healing choir
    one('pk_cantor_full_voice', 'Full Voice', 'power', 'Hymn of Mending and Choral Burst are 30% stronger.',
      { spellMods: [{ spell: HYMN, dmg: 0.3 }, { spell: 'spell:choral-burst', dmg: 0.3 }] }),
    three('pk_cantor_choir', 'Choir', 'power', (r) => `+${r * 8}% healing done.`, (r) => ({ mods: [{ stat: 'healing', op: 'flat', value: 0.08 * r }] })),
    one('pk_cantor_overflow', 'Grace Overflowing', 'trigger', 'Healing gives the healed a shield of 5% of your max health, once every 2 s.',
      { procs: [{ on: 'heal', icd: 2000, do: [{ a: 'shield', pctMax: 0.05, dur: 4000, to: 'allies', r: 140 }] }] }),
    one('pk_cantor_vow_of_silence', 'Vow of Wrath', 'tradeoff', '+35% spell damage, −25% healing done.',
      { mods: [{ stat: 'spellDmg', op: 'flat', value: 0.35 }, { stat: 'healing', op: 'flat', value: -0.25 }] }),
    // path 1: Censer Swing (+ new spell 4): holy smoke
    one('pk_cantor_heavy_censer', 'Heavy Censer', 'power', 'Censer Swing recharges 20% faster and hits 25% harder.', { spellMods: [{ spell: CENSER, cd: -0.2, dmg: 0.25 }] }),
    three('pk_cantor_incense', 'Incense', 'power', (r) => `+${r * 6}% Radiance damage.`, (r) => ({ mods: [{ stat: 'dmg.radiance', op: 'flat', value: 0.06 * r }] })),
    one('pk_cantor_purifying_smoke', 'Purifying Smoke', 'trigger', 'Hits have a 20% chance to weaken the foe for 3 s; +4% damage.',
      { mods: [{ stat: 'dmg', op: 'flat', value: 0.04 }], procs: [{ on: 'hit', chance: 0.2, do: [{ a: 'status', status: { id: 'weaken', dur: 3000 }, area: tgt }] }] }),
    one('pk_cantor_thurible', 'Thurible Bearer', 'aura', 'Foes near you take 8% more damage.',
      { aura: [{ id: 'cnt:thurible', r: 120, enemies: true, mods: [{ stat: 'dmgTaken', op: 'flat', value: 0.08 }] }] }),
    // path 2: Bright Chord (+ new spell 5): the ringing note
    one('pk_cantor_ringing', 'Ringing Chord', 'power', 'Bright Chord recharges 20% faster and costs 15% less; +5% Radiance damage.', { spellMods: [{ spell: CHORD, cd: -0.2, cost: -0.15 }], mods: [{ stat: 'dmg.radiance', op: 'flat', value: 0.05 }] }),
    three('pk_cantor_resonance', 'Resonance', 'power', (r) => `Your statuses last ${r * 8}% longer; +${r * 8}% buff duration; +${r.toFixed(1)}% Radiance damage.`,
      (r) => ({ mods: [{ stat: 'dmg.radiance', op: 'flat', value: 0.01 * r }, { stat: 'statusDur', op: 'flat', value: 0.08 * r }, { stat: 'buffDur', op: 'flat', value: 0.08 * r }] })),
    one('pk_cantor_sanctuary', 'Sanctuary', 'aura', 'You and allies near you receive 12% more healing.',
      { aura: [{ id: 'cnt:sanctuary', r: 160, mods: [{ stat: 'healingTaken', op: 'flat', value: 0.12 }] }] }),
    one('pk_cantor_hallowed_mind', 'Hallowed Mind', 'resource', 'Healing restores 3 Ember, once every 1 s.',
      { procs: [{ on: 'heal', icd: 1000, do: [{ a: 'resource', ember: 3 }] }] }),
  ],
};

const school: PerkDef[] = [
  // p0 offence
  one('pk_radiance_dawnfire', 'Dawnfire', 'power', '+12% Radiance damage and +3% critical chance.',
    { mods: [{ stat: 'dmg.radiance', op: 'flat', value: 0.12 }, { stat: 'crit', op: 'flat', value: 0.03 }] }),
  one('pk_radiance_righteous', 'Righteous', 'power', '+15% damage to bosses and mini-bosses.',
    { mods: [{ stat: 'dmg', op: 'flat', value: 0.15, when: { c: 'targetTier', tiers: ['mini', 'boss'] } }] }),
  // p1 defence
  three('pk_radiance_halo', 'Halo', 'power', (r) => `+${r * 5}% Radiance resistance and +${r * 2}% max health.`,
    (r) => ({ mods: [{ stat: 'resist.radiance', op: 'flat', value: 0.05 * r }, { stat: 'hp', op: 'pct', value: 0.02 * r }] })),
  one('pk_radiance_divine_shield', 'Divine Shield', 'trigger', 'Below 50% health: a shield of 25% max health, once every 60 s; +5% max health.',
    { mods: [{ stat: 'hp', op: 'pct', value: 0.05 }], procs: [{ on: 'lowHp', icd: 60000, do: [{ a: 'shield', pctMax: 0.25, dur: 6000, to: 'self' }] }] }),
  one('pk_radiance_blessed', 'Blessed', 'power', '+20% healing received; +2 health per second in combat.',
    { mods: [{ stat: 'healingTaken', op: 'flat', value: 0.2 }, { stat: 'hpRegen', op: 'flat', value: 2, when: { c: 'inCombat' } }] }),
  // p2 focus / resource
  three('pk_radiance_prayer', 'Prayer', 'resource', (r) => `+${(0.3 * r).toFixed(1)} Ember per second and ${r * 2}% shorter cooldowns; +${(2 * r).toFixed(1)}% damage.`,
    (r) => ({ mods: [{ stat: 'dmg', op: 'flat', value: 0.02 * r }, { stat: 'emberRegen', op: 'flat', value: 0.3 * r }, { stat: 'cdr', op: 'flat', value: 0.02 * r }] })),
  one('pk_radiance_tithe', 'Tithe', 'resource', 'Kills restore 6 Ember and 3% of max health; +4% damage.',
    { mods: [{ stat: 'dmg', op: 'flat', value: 0.04 }], procs: [{ on: 'kill', do: [{ a: 'resource', ember: 6 }, { a: 'heal', pctMax: 0.03, to: 'self' }] }] }),
  one('pk_radiance_long_light', 'Long Light', 'power', 'Your buffs last 20% longer and are 10% stronger; +4% damage.',
    { mods: [{ stat: 'dmg', op: 'flat', value: 0.04 }, { stat: 'buffDur', op: 'flat', value: 0.2 }, { stat: 'buffPower', op: 'flat', value: 0.1 }] }),
];

export const PERKS: SchoolPerks = { school: 'radiance', classes: [oathbound, cantor], perks: school };
