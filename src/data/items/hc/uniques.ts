/**
 * Uniques (docs/systems/BUILDS.md §5): 40 build-defining items. Mechanics by Claude 5 (to Claude 3's UniqueDef),
 * names and flavour by Claude 4 (hc-builds-text overlay), homes by Claude 2 (loot tables). The 25 boss legendaries
 * keep their lg_* ids and replace the six generic legendary effects with one themed on their boss; 15 more (u_*) live
 * in the school caves (Act I) and the Heart caches (Act III). Each has 2 fixed affixes whose values sit inside the
 * affix's tier at the unique's minLevel (computed from HC_AFFIXES, so a retuned tier keeps them legal). Effects are
 * Passive data only; the hooks used are ones the sim already reads (overheal, shatterFrozen, spToAttack, buffStacks,
 * thornskin).
 */
import type { RolledAffix, UniqueDef } from '@/systems/rules/affixTypes';
import type { Action, Area, Modifier, Passive, StatKey } from '@/systems/rules/types';
import { HC_AFFIXES } from './affixes';

/** a fixed affix: its value at quality q (0–1) inside the tier in force at `level` */
function fx(id: string, level: number, q = 0.7): RolledAffix {
  const d = HC_AFFIXES.find((a) => a.id === id);
  if (!d) throw new Error(`[uniques] unknown affix ${id}`);
  const t = [...d.tiers].reverse().find((x) => x.ilvl <= level) ?? d.tiers[0];
  const raw = t.min + (t.max - t.min) * q;
  const whole = Number.isInteger(t.min) && Number.isInteger(t.max);
  return { id, v: whole ? Math.round(raw) : Math.round(raw * 1000) / 1000 };
}
const f = (stat: StatKey, value: number, when?: Modifier['when']): Modifier => ({ stat, op: 'flat', value, ...(when ? { when } : {}) });
const pc = (stat: StatKey, value: number): Modifier => ({ stat, op: 'pct', value });
const tgt: Area = { shape: 'single', at: 'target' };
const at = (r: number): Area => ({ shape: 'circle', at: 'target', r });
const near = (r: number): Area => ({ shape: 'circle', at: 'self', r });
const buff = (id: string, dur: number, mods: Modifier[], extra: Partial<Extract<Action, { a: 'buff' }>> = {}): Action => ({ a: 'buff', id, dur, to: 'self', mods, ...extra });

type U = Omit<UniqueDef, 'affixes'> & { affixes: [string, string] };
const u = (x: U): UniqueDef => ({ ...x, affixes: x.affixes.map((id) => fx(id, x.minLevel ?? 1)) });

const ACT1 = 10, ACT2 = 14, HEART = 30, KING = 38;

const LEGENDARY: U[] = [
  // Morvane bosses (Act II)
  { id: 'lg_stag', name: 'Stag’s Blade', base: 'w_sword_spark', home: 'boss', minLevel: ACT2, affixes: ['pre_radiant', 'pre_precise'],
    text: 'Critical hits call down the White Stag’s light: 60% Radiance damage around the target, and you heal 2% of your health (0.8 s).',
    effect: { procs: [{ on: 'crit', icd: 800, do: [{ a: 'damage', coef: 0.6, kind: 'radiance', area: at(64) }, { a: 'heal', pctMax: 0.02, to: 'self' }] }] } },
  { id: 'lg_morwen', name: 'Morwen’s Cleaver', base: 'w_axe_ember', home: 'boss', minLevel: ACT2, affixes: ['pre_frozen', 'pre_brutal'],
    text: 'Your attacks deal half their damage as Rime and chill on 30% of hits; +15% damage to chilled foes.',
    effect: { convert: [{ from: 'attack', to: 'rime', pct: 0.5 }], mods: [f('dmg', 0.15, { c: 'targetHas', status: 'chill' })], procs: [{ on: 'hit', chance: 0.3, do: [{ a: 'status', status: { id: 'chill', dur: 2000 }, area: tgt }] }] } },
  { id: 'lg_sovereign', name: 'Sovereign’s Staff', base: 'w_staff_rime', home: 'boss', minLevel: ACT2, affixes: ['pre_thorned', 'pre_arcane'],
    text: 'Your Verdant spells leave poisoned ground for 3 s; +1 projectile; +30% poison damage.',
    effect: { spellMods: [{ spell: 'school:verdant', linger: 3000 }], mods: [f('projCount', 1), f('statusDmg.poison', 0.3)] } },
  { id: 'lg_varric', name: 'Varric’s Bow', base: 'w_bow_storm', home: 'boss', minLevel: ACT2, affixes: ['pre_shadowed', 'pre_swift'],
    text: 'Kills loose a ring of five bone arrows (50% Umbral each); +20% damage to foes below 30% health.',
    effect: { mods: [f('dmg', 0.2, { c: 'targetHpBelow', pct: 0.3 })], procs: [{ on: 'kill', do: [{ a: 'projectile', coef: 0.5, kind: 'umbral', speed: 480, range: 260, count: 5, spread: 360, visual: 'arrow' }] }] } },
  { id: 'lg_ashmaw', name: 'Ashmaw’s Maul', base: 'w_mace_umbral', home: 'boss', minLevel: ACT2, affixes: ['pre_burning', 'pre_searing'],
    text: 'Your attacks deal half their damage as Ash; every 4th hit leaves burning ground under the foe for 3 s.',
    effect: { convert: [{ from: 'attack', to: 'ash', pct: 0.5 }],
      procs: [{ on: 'hit', every: 4, do: [{ a: 'zone', kind: 'field', area: at(56), dur: 3000, tick: 500, each: [{ a: 'damage', coef: 0.15, kind: 'ash', area: at(56), status: [{ id: 'burn', dur: 2000 }] }], visual: 'rime-ring' }] }] } },
  { id: 'lg_colossus', name: 'Colossus’s Lance', base: 'w_spear_spark', home: 'boss', minLevel: ACT2, affixes: ['pre_frozen', 'pre_vicious'],
    text: '+1 dash charge; landing a dash freezes foes around you (1 s, 3 s); while moving you take 15% less damage.',
    effect: { mods: [f('dashCharges', 1), f('dmgTaken', -0.15, { c: 'moving' })], procs: [{ on: 'dashEnd', icd: 3000, do: [{ a: 'status', status: { id: 'freeze', dur: 1000 }, area: near(64) }] }] } },
  { id: 'lg_stormcrow', name: 'Stormcrow’s Fang', base: 'w_dagger_umbral', home: 'boss', minLevel: ACT2, affixes: ['pre_crackling', 'pre_precise'],
    text: 'Critical hits chain lightning to 3 foes for 60% Storm damage (0.3 s); +5% critical chance.',
    effect: { mods: [f('crit', 0.05)], procs: [{ on: 'crit', icd: 300, do: [{ a: 'chain', coef: 0.6, kind: 'storm', jumps: 3, range: 140 }] }] } },
  { id: 'lg_willow', name: 'Willow’s Wand', base: 'w_wand_storm', home: 'boss', minLevel: ACT2, affixes: ['pre_thorned', 'pre_afflicting'],
    text: 'Your statuses last 50% longer; +30% poison damage; kills spread poison to foes around the body.',
    effect: { mods: [f('statusDur', 0.5), f('statusDmg.poison', 0.3)], procs: [{ on: 'kill', do: [{ a: 'status', status: { id: 'poison', dur: 4000 }, area: at(80) }] }] } },
  { id: 'lg_spinner', name: 'Below’s Pendant', base: 'i_moonpend', home: 'boss', minLevel: ACT2, affixes: ['pre_shadowed', 'suf_of_the_bear'],
    text: 'Every 5th hit webs up to 3 foes near the target together (linked, 4 s); +20% damage to linked foes.',
    effect: { mods: [f('dmg', 0.2, { c: 'targetHas', status: 'linked' })], procs: [{ on: 'hit', every: 5, do: [{ a: 'status', status: { id: 'linked', dur: 4000 }, area: at(120), maxTargets: 3 }] }] } },
  { id: 'lg_engine', name: 'Engine’s Sigil', base: 'i_sunpend', home: 'boss', minLevel: ACT2, affixes: ['pre_crackling', 'pre_flowing'],
    text: 'Every 50 Ember spent overcharges you: +30% cast speed for 4 s and a shock nova (60% Storm).',
    effect: { procs: [{ on: 'emberSpent', do: [buff('lg:engine', 4000, [f('castSpeed', 0.3)]), { a: 'damage', coef: 0.6, kind: 'storm', area: near(96), status: [{ id: 'shock', dur: 2000 }] }] }] } },
  { id: 'lg_lanternqueen', name: 'Queen’s Ring', base: 'i_emberring', home: 'boss', minLevel: ACT2, affixes: ['pre_radiant', 'suf_of_renewal'],
    text: 'Healing beyond full health becomes a shield; +20% healing done.',
    effect: { hooks: [{ id: 'overheal' }], mods: [f('healing', 0.2)] } },
  { id: 'lg_hollowking', name: 'King’s Tear', base: 'i_tear', home: 'boss', minLevel: KING, affixes: ['pre_shadowed', 'pre_hastened'],
    text: 'Your ultimate recharges 30% faster; kills restore 10 Ember; below 50% health you deal 20% more damage.',
    effect: { mods: [f('ultCdr', 0.3), f('dmg', 0.2, { c: 'hpBelow', pct: 0.5 })], procs: [{ on: 'kill', do: [{ a: 'resource', ember: 10 }] }] } },
  // the twelve realm bosses (Act I)
  { id: 'lg_ash_5', name: 'Vulkan’s Blade', base: 'w_sword_spark', home: 'boss', minLevel: ACT1, affixes: ['pre_burning', 'pre_brutal'],
    text: 'Your Ash spells leave burning ground for 3 s; +15% Ash damage.',
    effect: { spellMods: [{ spell: 'school:ash', linger: 3000 }], mods: [f('dmg.ash', 0.15)] } },
  { id: 'lg_rime_5', name: 'Tyrant’s Cleaver', base: 'w_axe_ember', home: 'boss', minLevel: ACT1, affixes: ['pre_frozen', 'pre_vicious'],
    text: 'Frozen foes shatter on death; +30% damage to frozen foes and your statuses last 20% longer.',
    effect: { hooks: [{ id: 'shatterFrozen' }], mods: [f('dmg', 0.3, { c: 'targetHas', status: 'freeze' }), f('statusDur', 0.2)] } },
  { id: 'lg_storm_5', name: 'Skyrender’s Staff', base: 'w_staff_rime', home: 'boss', minLevel: ACT1, affixes: ['pre_crackling', 'pre_fluent'],
    text: 'Your spells chain to 1 more foe; +1 to all Storm spells.',
    effect: { spellMods: [{ spell: '*', chain: 1 }], spellLevels: [{ spell: 'school:storm', levels: 1 }] } },
  { id: 'lg_radiance_5', name: 'Hierarch’s Bow', base: 'w_bow_storm', home: 'boss', minLevel: ACT1, affixes: ['pre_radiant', 'pre_swift'],
    text: 'Your spells’ projectiles pierce; your attacks deal 30% of their damage as Radiance; attack critical hits blind (1 s, 2 s).',
    effect: { spellMods: [{ spell: '*', pierce: true }], convert: [{ from: 'attack', to: 'radiance', pct: 0.3 }], procs: [{ on: 'attackCrit', icd: 2000, do: [{ a: 'status', status: { id: 'blind', dur: 1000 }, area: tgt }] }] } },
  { id: 'lg_umbral_5', name: 'Queen’s Maul', base: 'w_mace_umbral', home: 'boss', minLevel: ACT1, affixes: ['pre_shadowed', 'pre_leeching'],
    text: 'Kills wrap you in shadow for 2 s (stealth); hits from stealth deal double damage.',
    effect: { mods: [{ stat: 'dmg', op: 'more', value: 1, when: { c: 'fromStealth' } }], procs: [{ on: 'kill', icd: 4000, do: [buff('lg:nocturne', 2000, [], { flags: ['stealth'] })] }] } },
  { id: 'lg_verdant_5', name: 'Grove’s Lance', base: 'w_spear_spark', home: 'boss', minLevel: ACT1, affixes: ['pre_thorned', 'pre_afflicting'],
    text: 'Setting a status heals you for 3% of your health (1 s); your roots last 50% longer.',
    effect: { mods: [f('rootDur', 0.5)], procs: [{ on: 'statusApplied', icd: 1000, do: [{ a: 'heal', pctMax: 0.03, to: 'self' }] }] } },
  { id: 'lg_blade_5', name: 'General’s Fang', base: 'w_dagger_umbral', home: 'boss', minLevel: ACT1, affixes: ['pre_keen', 'pre_vicious'],
    text: 'Every 3rd hit is a critical hit that ignores armour.',
    effect: { procs: [{ on: 'hit', every: 3, do: [buff('lg:general', 3000, [], { charges: 1, flags: ['nextHitsCrit', 'nextHitsTrue'] })] }] } },
  { id: 'lg_iron_5', name: 'Colossus’s Wand', base: 'w_wand_storm', home: 'boss', minLevel: ACT1, affixes: ['pre_tempered', 'pre_channelling'],
    text: 'Half your spell power adds to your attack damage; +10% block chance, and blocking restores 10 Ember.',
    effect: { hooks: [{ id: 'spToAttack', value: 0.5 }], mods: [f('block', 0.1)], procs: [{ on: 'block', icd: 500, do: [{ a: 'resource', ember: 10 }] }] } },
  { id: 'lg_fist_5', name: 'King’s Pendant', base: 'i_moonpend', home: 'boss', minLevel: ACT1, affixes: ['pre_brawling', 'pre_precise'],
    text: '+3 maximum Momentum; at 5 Momentum every 6th hit stuns the foe (0.5 s).',
    effect: { mods: [f('maxMomentum', 3)], procs: [{ on: 'hit', every: 6, when: { c: 'momentum', min: 5 }, do: [{ a: 'status', status: { id: 'stun', dur: 500 }, area: tgt }] }] } },
  { id: 'lg_hunt_5', name: 'Hunt’s Sigil', base: 'i_sunpend', home: 'boss', minLevel: ACT1, affixes: ['pre_stalking', 'pre_precise'],
    text: 'Every 4th attack marks the foe (+25% damage taken, 6 s); +15% damage to marked foes.',
    effect: { mods: [f('dmg', 0.15, { c: 'targetHas', status: 'mark' })], procs: [{ on: 'attack', every: 4, do: [{ a: 'status', status: { id: 'mark', dur: 6000, power: 0.25 }, area: tgt, maxTargets: 1 }] }] } },
  { id: 'lg_guile_5', name: 'King’s Ring', base: 'i_emberring', home: 'boss', minLevel: ACT1, affixes: ['pre_sly', 'suf_of_the_magpie'],
    text: 'Critical hits steal Embershards and give 10% attack speed for 3 s (1 s); +40% Embershards.',
    effect: { mods: [f('gold', 0.4)], procs: [{ on: 'crit', icd: 1000, do: [{ a: 'steal', gold: 1, buffs: false, area: tgt }, buff('lg:tidecourt', 3000, [f('atkSpeed', 0.1)])] }] } },
  { id: 'lg_song_5', name: 'Maestro’s Tear', base: 'i_tear', home: 'boss', minLevel: ACT1, affixes: ['pre_resonant', 'suf_of_the_choir'],
    text: 'Your buffs stack twice; they are 25% stronger and last 30% longer.',
    effect: { hooks: [{ id: 'buffStacks', value: 2 }], mods: [f('buffPower', 0.25), f('buffDur', 0.3)] } },
  { id: 'lg_concord_5', name: 'Concord’s Blade', base: 'w_sword_spark', home: 'boss', minLevel: ACT2, affixes: ['pre_mighty', 'pre_precise'],
    text: '+1 to all spells; +10% damage of every kind.',
    effect: { spellLevels: [{ spell: '*', levels: 1 }], mods: [f('dmg', 0.1)] } },
];

const NEW: U[] = [
  // the twelve school caves (Act I)
  { id: 'u_emberheart', name: 'Emberheart', base: 'a_ash_robe_chest', home: 'tbl:ash-cave', minLevel: ACT1, affixes: ['suf_of_the_bear', 'pre_fervent'],
    text: 'Burning foes explode on death: 80% Ash damage around the body, burning the foes it hits.',
    effect: { procs: [{ on: 'kill', when: { c: 'targetHas', status: 'burn' }, do: [{ a: 'damage', coef: 0.8, kind: 'ash', area: at(80), status: [{ id: 'burn', dur: 3000 }] }] }] } },
  { id: 'u_frostbound', name: 'Frostbound Crown', base: 'a_rime_mail_helm', home: 'tbl:rime-cave', minLevel: ACT1, affixes: ['suf_of_the_tortoise', 'suf_of_rime_warding'],
    text: 'Your slows are 30% stronger; +15% damage to chilled foes.',
    effect: { mods: [f('slowPower', 0.3), f('dmg', 0.15, { c: 'targetHas', status: 'chill' })] } },
  { id: 'u_thunderstep', name: 'Thunderstep Boots', base: 'a_storm_leather_feet', home: 'tbl:storm-cave', minLevel: ACT1, affixes: ['suf_of_the_wind', 'pre_darting'],
    text: 'Landing a dash discharges lightning that chains to 3 foes (70% Storm, 1 s).',
    effect: { procs: [{ on: 'dashEnd', icd: 1000, do: [{ a: 'chain', coef: 0.7, kind: 'storm', jumps: 3, range: 140 }] }] } },
  { id: 'u_sunward_band', name: 'Sunward Band', base: 'i_signet', home: 'tbl:radiance-cave', minLevel: ACT1, affixes: ['pre_radiant', 'suf_of_the_bear'],
    text: 'Healing grants you a shield of 4% of your health (2 s); +10% healing received.',
    effect: { mods: [f('healingTaken', 0.1)], procs: [{ on: 'heal', icd: 2000, do: [{ a: 'shield', pctMax: 0.04, dur: 4000, to: 'self' }] }] } },
  { id: 'u_veilshroud', name: 'Veilshroud', base: 'a_umbral_leather_chest', home: 'tbl:umbral-cave', minLevel: ACT1, affixes: ['suf_of_the_bear', 'suf_of_umbral_warding'],
    text: 'Below 50% health, slip into shadow for 1.5 s (20 s); +3% of damage healed back.',
    effect: { mods: [f('lifesteal', 0.03)], procs: [{ on: 'lowHp', icd: 20000, do: [buff('u:veil', 1500, [], { flags: ['stealth', 'untargetable'] })] }] } },
  { id: 'u_thornmantle', name: 'Thornmantle', base: 'a_verdant_fur_chest', home: 'tbl:verdant-cave', minLevel: ACT1, affixes: ['suf_of_the_bear', 'suf_of_the_troll'],
    text: 'Melee attackers are rooted and pricked by thorns; +3 health per second in combat.',
    effect: { hooks: [{ id: 'thornskin' }], mods: [f('hpRegen', 3, { c: 'inCombat' })] } },
  { id: 'u_duelists_glove', name: 'Duelist’s Glove', base: 'a_blade_leather_hands', home: 'tbl:blade-cave', minLevel: ACT1, affixes: ['pre_precise', 'pre_swift'],
    text: 'Landing a dash: your next 2 hits within 3 s are critical hits (4 s).',
    effect: { procs: [{ on: 'dashEnd', icd: 4000, do: [buff('u:duelist', 3000, [], { charges: 2, flags: ['nextHitsCrit'] })] }] } },
  { id: 'u_anvil_heart', name: 'Anvil Heart', base: 'a_iron_plate_chest', home: 'tbl:iron-cave', minLevel: ACT1, affixes: ['suf_of_the_tortoise', 'suf_of_the_wall'],
    text: '+15% block chance; blocking strikes back for 50% Iron damage.',
    effect: { mods: [f('block', 0.15)], procs: [{ on: 'block', icd: 400, do: [{ a: 'damage', coef: 0.5, kind: 'iron', area: tgt }] }] } },
  { id: 'u_mountain_wraps', name: 'Mountain Wraps', base: 'a_fist_cloth_hands', home: 'tbl:fist-cave', minLevel: ACT1, affixes: ['pre_brawling', 'pre_swift'],
    text: 'At 5 Momentum your hits echo for 30% more damage.',
    effect: { procs: [{ on: 'hit', when: { c: 'momentum', min: 5 }, do: [{ a: 'damage', coef: 0.3, kind: 'fist', area: tgt }] }] } },
  { id: 'u_hawkeye_charm', name: 'Hawkeye Charm', base: 'i_bonecharm', home: 'tbl:hunt-cave', minLevel: ACT1, affixes: ['pre_stalking', 'pre_precise'],
    text: '+25% damage to foes 200 px or more away; your spells’ projectiles pierce.',
    effect: { mods: [f('dmg', 0.25, { c: 'targetFar', px: 200 })], spellMods: [{ spell: '*', pierce: true }] } },
  { id: 'u_loaded_dice', name: 'Loaded Dice', base: 'i_copper', home: 'tbl:guile-cave', minLevel: ACT1, affixes: ['pre_sly', 'suf_of_fortune'],
    text: 'Below 50% health, +15% critical chance; critical hits restore 5 stamina (0.5 s).',
    effect: { mods: [f('crit', 0.15, { c: 'hpBelow', pct: 0.5 })], procs: [{ on: 'crit', icd: 500, do: [{ a: 'resource', stamina: 5 }] }] } },
  { id: 'u_war_horn', name: 'War Horn', base: 'i_locket', home: 'tbl:song-cave', minLevel: ACT1, affixes: ['pre_resonant', 'suf_of_the_choir'],
    text: 'Casting a spell gives you and allies near you 10% more damage for 5 s (5 s).',
    effect: { procs: [{ on: 'cast', icd: 5000, do: [{ a: 'buff', id: 'u:warhorn', dur: 5000, to: 'allies', r: 180, mods: [f('dmg', 0.1)] }] }] } },
  // the Heart caches (Act III)
  { id: 'u_crown_shard', name: 'Shard of the Crown', base: 'i_moonpend', home: 'tbl:heart-cache', minLevel: HEART, affixes: ['pre_arcane', 'pre_hastened'],
    text: '+1 to all spells; +10% cooldown reduction.',
    effect: { spellLevels: [{ spell: '*', levels: 1 }], mods: [f('cdr', 0.1)] } },
  { id: 'u_hollow_blade', name: 'The Hollow Blade', base: 'w_sword_spark', home: 'tbl:heart-cache', minLevel: HEART, affixes: ['pre_mighty', 'pre_leeching'],
    text: 'Kills restore 15% of your health; +25% damage to bosses and mini-bosses.',
    effect: { mods: [f('dmg', 0.25, { c: 'targetTier', tiers: ['mini', 'boss'] })], procs: [{ on: 'kill', do: [{ a: 'heal', pctMax: 0.15, to: 'self' }] }] } },
  { id: 'u_morvane_plate', name: 'Morvane Plate', base: 'a_iron_plate_chest', home: 'tbl:heart-cache', minLevel: HEART, affixes: ['suf_of_the_bear', 'suf_of_last_light'],
    text: 'When hit, gain a shield of 2% of your health (1 s); +10% max health.',
    effect: { mods: [pc('hp', 0.1)], procs: [{ on: 'hurt', icd: 1000, do: [{ a: 'shield', pctMax: 0.02, dur: 3000, to: 'self' }] }] } },
];

export const HC_UNIQUES: UniqueDef[] = [...LEGENDARY, ...NEW].map(u);
export type { Passive };
