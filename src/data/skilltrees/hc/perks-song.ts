/**
 * Song perks (Claude 5 for Claude 3, docs/systems/BUILDS.md §3; slots in rules/perkTypes.ts). Bard and Skald
 * signatures (12 each, path i themed on kit spell i and the new kit spell i+3) and 8 Song school perks. The builds
 * turn on auras, buffs, rhythm and stamina, not only damage. Each exclusive c1 / c2 pair is two different playstyles.
 * effects[r-1] is the whole effect at rank r. Budgets: HOLLOW_CROWN.md §2.1.
 */
import type { ClassPerks, PerkDef, PerkKind, SchoolPerks } from '@/systems/rules/perkTypes';
import type { Passive } from '@/systems/rules/types';

const one = (id: string, name: string, kind: PerkKind, text: string, fx: Passive): PerkDef => ({ id, name, kind, ranks: 1, text: [text], effects: [fx] });
/** 3-rank perks are front-loaded: text / fx get a rank weight of 1.5 / 2.25 / 3 (rank 3 as written, rank 1 half of it) */
const RANK_W = [1.5, 2.25, 3];
const three = (id: string, name: string, kind: PerkKind, text: (r: number) => string, fx: (r: number) => Passive): PerkDef =>
  ({ id, name, kind, ranks: 3, text: RANK_W.map(text), effects: RANK_W.map(fx) });
const near = (r: number) => ({ shape: 'circle' as const, at: 'self' as const, r });

const BALLAD = 'spell:rousing-ballad', DISSON = 'spell:dissonance', LULLABY = 'spell:lullaby';
const CHANT = 'spell:war-chant', DRUM = 'spell:drumbeat-strike', SAGA = 'spell:saga-of-heroes';

const bard: ClassPerks = {
  classId: 'bard',
  signature: [
    // path 0: Rousing Ballad (+ new spell 3): the rallying song
    one('pk_bard_full_chorus', 'Full Chorus', 'power', 'Rousing Ballad and Ballad of Swiftness last 30% longer and recharge 20% faster; +4% damage; +3% critical chance.',
      { mods: [{ stat: 'crit', op: 'flat', value: 0.03 }, { stat: 'dmg', op: 'flat', value: 0.04 }], spellMods: [{ spell: BALLAD, dur: 0.3, cd: -0.2 }, { spell: 'spell:ballad-of-swiftness', dur: 0.3, cd: -0.2 }] }),
    three('pk_bard_anthem', 'Anthem', 'aura', (r) => `You and allies near you deal ${r * 3}% more damage; +${r.toFixed(1)}% Song damage for you.`,
      (r) => ({ mods: [{ stat: 'dmg.song', op: 'flat', value: 0.01 * r }], aura: [{ id: 'brd:anthem', r: 160, mods: [{ stat: 'dmg', op: 'flat', value: 0.03 * r }] }] })),
    one('pk_bard_crescendo', 'Crescendo', 'trigger', 'Casting: +10% damage for 6 s, once every 2 s.',
      { procs: [{ on: 'cast', icd: 2000, do: [{ a: 'buff', id: 'brd:crescendo', dur: 6000, to: 'self', mods: [{ stat: 'dmg', op: 'flat', value: 0.1 }] }] }] }),
    one('pk_bard_solo_act', 'Solo Act', 'tradeoff', '+35% spell damage; your auras and buffs on allies are 30% weaker.',
      { mods: [{ stat: 'spellDmg', op: 'flat', value: 0.35 }, { stat: 'buffPower', op: 'flat', value: -0.3 }] }),
    // path 1: Dissonance (+ new spell 4): the sour chord
    one('pk_bard_sour_notes', 'Sour Notes', 'power', 'Dissonance recharges 20% faster, costs 15% less and hits 25% harder.', { spellMods: [{ spell: DISSON, cd: -0.2, cost: -0.15, dmg: 0.25 }] }),
    three('pk_bard_discord', 'Discord', 'power', (r) => `+${r * 8}% damage to confused foes; +${(1.5 * r).toFixed(1)}% Song damage.`,
      (r) => ({ mods: [{ stat: 'dmg.song', op: 'flat', value: 0.015 * r }, { stat: 'dmg', op: 'flat', value: 0.08 * r, when: { c: 'targetHas', status: 'confuse' } }] })),
    one('pk_bard_feedback', 'Feedback', 'trigger', 'Setting any status has a 40% chance to send a sound wave around the foe for 35% spell power.',
      { procs: [{ on: 'statusApplied', chance: 0.4, icd: 400, do: [{ a: 'damage', coef: 0.35, kind: 'song', area: { shape: 'circle', at: 'target', r: 56 } }] }] }),
    one('pk_bard_heckle', 'Heckle', 'aura', 'Foes near you take 8% more damage.',
      { aura: [{ id: 'brd:heckle', r: 120, enemies: true, mods: [{ stat: 'dmgTaken', op: 'flat', value: 0.08 }] }] }),
    // path 2: Lullaby (+ new spell 5): the quiet
    one('pk_bard_soft_voice', 'Soft Voice', 'power', 'Lullaby recharges 20% faster; +5% Song damage; +3% critical chance.', { spellMods: [{ spell: LULLABY, cd: -0.2 }], mods: [{ stat: 'crit', op: 'flat', value: 0.03 }, { stat: 'dmg.song', op: 'flat', value: 0.05 }] }),
    three('pk_bard_long_song', 'Long Song', 'power', (r) => `Your statuses and buffs last ${r * 8}% longer; +${r.toFixed(1)}% damage; +${r.toFixed(1)}% Song damage; +${(2 * r).toFixed(1)}% critical damage.`,
      (r) => ({ mods: [{ stat: 'critd', op: 'flat', value: 0.02 * r }, { stat: 'dmg.song', op: 'flat', value: 0.01 * r }, { stat: 'dmg', op: 'flat', value: 0.01 * r }, { stat: 'statusDur', op: 'flat', value: 0.08 * r }, { stat: 'buffDur', op: 'flat', value: 0.08 * r }] })),
    one('pk_bard_rude_awakening', 'Rude Awakening', 'power', '+40% damage to sleeping foes; +6% Song damage.',
      { mods: [{ stat: 'dmg.song', op: 'flat', value: 0.06 }, { stat: 'dmg', op: 'flat', value: 0.4, when: { c: 'targetHas', status: 'sleep' } }] }),
    one('pk_bard_restful_tune', 'Restful Tune', 'aura', 'You and allies near you regain stamina 20% faster and receive 10% more healing; +4% damage for you.',
      { mods: [{ stat: 'dmg', op: 'flat', value: 0.04 }], aura: [{ id: 'brd:rest', r: 160, mods: [{ stat: 'staminaRegen', op: 'pct', value: 0.2 }, { stat: 'healingTaken', op: 'flat', value: 0.1 }] }] }),
  ],
};

const skald: ClassPerks = {
  classId: 'skald',
  signature: [
    // path 0: War Chant (+ new spell 3): the war song
    one('pk_skald_loud_chant', 'Loud Chant', 'power', 'War Chant and Chant of Fury last 30% longer and recharge 20% faster.',
      { spellMods: [{ spell: CHANT, dur: 0.3, cd: -0.2 }, { spell: 'spell:chant-of-fury', dur: 0.3, cd: -0.2 }] }),
    three('pk_skald_shield_song', 'Shield Song', 'aura', (r) => `You and allies near you gain ${r * 4}% armour and ${r * 2}% max health.`,
      (r) => ({ aura: [{ id: 'skd:shield', r: 160, mods: [{ stat: 'armor', op: 'pct', value: 0.04 * r }, { stat: 'hp', op: 'pct', value: 0.02 * r }] }] })),
    one('pk_skald_battle_cry', 'Battle Cry', 'trigger', 'Kills: allies near you deal 10% more damage for 4 s.',
      { procs: [{ on: 'kill', icd: 4000, do: [{ a: 'buff', id: 'skd:cry', dur: 4000, to: 'allies', r: 180, mods: [{ stat: 'dmg', op: 'flat', value: 0.1 }] }] }] }),
    one('pk_skald_berserkergang', 'Berserkergang', 'tradeoff', '+30% attack damage and +10% attack speed; −20% armour.',
      { mods: [{ stat: 'attackDmg', op: 'flat', value: 0.3 }, { stat: 'atkSpeed', op: 'flat', value: 0.1 }, { stat: 'armor', op: 'pct', value: -0.2 }] }),
    // path 1: Drumbeat Strike (+ new spell 4): the rhythm
    one('pk_skald_steady_beat', 'Steady Beat', 'power', 'Drumbeat Strike recharges 20% faster and hits 25% harder.', { spellMods: [{ spell: DRUM, cd: -0.2, dmg: 0.25 }] }),
    three('pk_skald_war_drum', 'War Drum', 'trigger', (r) => `Every 4th hit: +${r * 5}% attack speed for 4 s; +${r.toFixed(1)}% damage.`,
      (r) => ({ mods: [{ stat: 'dmg', op: 'flat', value: 0.01 * r }], procs: [{ on: 'hit', every: 4, do: [{ a: 'buff', id: 'skd:drum', dur: 4000, to: 'self', mods: [{ stat: 'atkSpeed', op: 'flat', value: 0.05 * r }] }] }] })),
    one('pk_skald_thunder_beat', 'Thunder Beat', 'trigger', 'Every 6th hit shakes the ground around the foe for 60% weapon power.',
      { procs: [{ on: 'hit', every: 6, do: [{ a: 'damage', coef: 0.6, kind: 'song', area: { shape: 'circle', at: 'target', r: 64 } }] }] }),
    one('pk_skald_marching_song', 'Marching Song', 'resource', 'Every 50 stamina spent: you and allies near you regain stamina 30% faster for 4 s; +4% damage.',
      { mods: [{ stat: 'dmg', op: 'flat', value: 0.04 }], procs: [{ on: 'staminaSpent', do: [{ a: 'buff', id: 'skd:march', dur: 4000, to: 'allies', r: 180, mods: [{ stat: 'staminaRegen', op: 'pct', value: 0.3 }] }] }] }),
    // path 2: Saga of Heroes (+ new spell 5): the saga
    one('pk_skald_retold_saga', 'Retold Saga', 'power', 'Saga of Heroes recharges 25% faster; +8% healing received.', { spellMods: [{ spell: SAGA, cd: -0.25 }], mods: [{ stat: 'healingTaken', op: 'flat', value: 0.08 }] }),
    three('pk_skald_hero_tale', 'Hero’s Tale', 'power', (r) => `Your buffs last ${r * 8}% longer and are ${r * 4}% stronger.`,
      (r) => ({ mods: [{ stat: 'buffDur', op: 'flat', value: 0.08 * r }, { stat: 'buffPower', op: 'flat', value: 0.04 * r }] })),
    one('pk_skald_unsung', 'Unsung Hero', 'trigger', 'Below 50% health: you and allies near you gain a shield of 15% max health for 6 s, once every 45 s.',
      { procs: [{ on: 'lowHp', icd: 45000, do: [{ a: 'shield', pctMax: 0.15, dur: 6000, to: 'allies', r: 160 }] }] }),
    one('pk_skald_last_verse', 'Last Verse', 'power', 'Below 30% health: +25% damage and take 15% less; +4% damage at any health.',
      { mods: [{ stat: 'dmg', op: 'flat', value: 0.04 }, { stat: 'dmg', op: 'flat', value: 0.25, when: { c: 'hpBelow', pct: 0.3 } }, { stat: 'dmgTaken', op: 'flat', value: -0.15, when: { c: 'hpBelow', pct: 0.3 } }] }),
  ],
};

const school: PerkDef[] = [
  // p0 offence
  one('pk_song_resonant', 'Resonant', 'power', '+12% Song damage and +3% critical chance.',
    { mods: [{ stat: 'dmg.song', op: 'flat', value: 0.12 }, { stat: 'crit', op: 'flat', value: 0.03 }] }),
  one('pk_song_harmony', 'Harmony', 'power', 'Your buffs are 15% stronger; +5% damage.',
    { mods: [{ stat: 'buffPower', op: 'flat', value: 0.15 }, { stat: 'dmg', op: 'flat', value: 0.05 }] }),
  // p1 defence
  three('pk_song_steady_voice', 'Steady Voice', 'power', (r) => `+${r * 3}% max health and ${r * 10}% shorter stuns.`,
    (r) => ({ mods: [{ stat: 'hp', op: 'pct', value: 0.03 * r }, { stat: 'stunTaken', op: 'flat', value: -0.1 * r }] })),
  one('pk_song_lament', 'Lament', 'trigger', 'When hit: heal allies near you for 3% of your max health, once every 3 s; +4% max health.',
    { mods: [{ stat: 'hp', op: 'pct', value: 0.04 }], procs: [{ on: 'hurt', icd: 3000, do: [{ a: 'heal', pctMax: 0.03, to: 'allies', r: 140 }] }] }),
  one('pk_song_counter_melody', 'Counter-melody', 'trigger', 'Below 50% health: foes near you are confused for 2 s, once every 45 s; +5% max health.',
    { mods: [{ stat: 'hp', op: 'pct', value: 0.05 }], procs: [{ on: 'lowHp', icd: 45000, do: [{ a: 'status', status: { id: 'confuse', dur: 2000 }, area: near(96) }] }] }),
  // p2 focus / resource
  three('pk_song_breath_control', 'Breath Control', 'resource', (r) => `+${(0.3 * r).toFixed(1)} Ember per second and +${r * 6}% stamina regeneration.`,
    (r) => ({ mods: [{ stat: 'emberRegen', op: 'flat', value: 0.3 * r }, { stat: 'staminaRegen', op: 'pct', value: 0.06 * r }] })),
  one('pk_song_applause', 'Applause', 'resource', 'Kills restore 6 Ember and 10 stamina; +4% damage.',
    { mods: [{ stat: 'dmg', op: 'flat', value: 0.04 }], procs: [{ on: 'kill', do: [{ a: 'resource', ember: 6, stamina: 10 }] }] }),
  one('pk_song_tempo', 'Tempo', 'power', 'Your buffs last 15% longer; 5% shorter cooldowns; +4% damage; +3% critical chance.',
    { mods: [{ stat: 'crit', op: 'flat', value: 0.03 }, { stat: 'dmg', op: 'flat', value: 0.04 }, { stat: 'buffDur', op: 'flat', value: 0.15 }, { stat: 'cdr', op: 'flat', value: 0.05 }] }),
];

export const PERKS: SchoolPerks = { school: 'song', classes: [bard, skald], perks: school };
