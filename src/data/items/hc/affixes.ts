/**
 * Affix pools (Claude 5 for Claude 3, docs/systems/BUILDS.md §2.3). Prefixes are offence and resource, suffixes
 * defence and utility; one affix per group on an item. Tiers apply from item level 1 / 10 / 20 / 30 / 38.
 * Values follow Modifier conventions (fractions: 0.08 = +8%). Flat hp / armour / spell power / Ember are written at
 * the L1 scale: the engine (rules/affixes.ts) multiplies them by P(ilvl), so their tiers only widen the roll band.
 * Negative stats (cost, dash cooldown, damage taken) grow in size tier by tier. No conditional pct on a scaled stat.
 * The spell-specific affixes ("+1 to <kit spell>" for all 6 kit spells, "+1 to all <school> spells") are generated from
 * the class kits and NEW_KIT, so kit spells get theirs automatically. {v} in a text is the rolled value.
 */
import { HC_CLASSES } from '@/data/classes/hc/classes.gen';
import { kitFor } from '@/data/classes/hc/kits';
import { HC_KIT_SPELLS } from '@/data/spells/hc/kit-spells';
import { HC_KIT_SPELLS_NEW, NEW_KIT } from '@/data/spells/hc/kit-spells-new';
import { SCHOOL_NAME } from '@/data/classes/hc';
import type { AffixDef, AffixSlot, AffixTier } from '@/systems/rules/affixTypes';
import type { Action, DamageKind, Modifier, Proc, SchoolId, StatKey } from '@/systems/rules/types';

const ILVLS = [1, 10, 20, 30, 38];
/** five [min, max] bands at the standard tier levels */
const T = (...bands: [number, number][]): AffixTier[] => bands.map(([min, max], i) => ({ ilvl: ILVLS[i], min, max }));

// standard value curves
const PCT_DMG = T([0.04, 0.07], [0.08, 0.12], [0.13, 0.17], [0.18, 0.22], [0.23, 0.28]);
const PCT_SMALL = T([0.03, 0.05], [0.06, 0.08], [0.09, 0.11], [0.12, 0.14], [0.15, 0.18]);
const SPEED = T([0.03, 0.05], [0.05, 0.07], [0.07, 0.09], [0.09, 0.11], [0.11, 0.14]);
const RESIST = T([0.04, 0.07], [0.07, 0.1], [0.1, 0.13], [0.13, 0.16], [0.16, 0.2]);
const UTIL = T([0.04, 0.07], [0.07, 0.1], [0.1, 0.13], [0.13, 0.16], [0.16, 0.2]);
/** tiers from minIlvl up: the band in force at minIlvl becomes the first tier */
const from = (t: AffixTier[], minIlvl: number): AffixTier[] => {
  const i = Math.max(0, t.findIndex((x, j) => x.ilvl <= minIlvl && (t[j + 1]?.ilvl ?? Infinity) > minIlvl));
  return [{ ...t[i], ilvl: minIlvl }, ...t.slice(i + 1)];
};
const neg = (t: AffixTier[]): AffixTier[] => t.map((x) => ({ ilvl: x.ilvl, min: -x.max, max: -x.min }));

const WEAPONISH: AffixSlot[] = ['weapon', 'offhand', 'ring', 'amulet'];
const JEWEL: AffixSlot[] = ['ring', 'amulet'];
const ARMOUR: AffixSlot[] = ['head', 'chest', 'hands', 'feet'];

interface Opts { weight?: number; minIlvl?: number; when?: Modifier['when']; op?: Modifier['op'] }
const mod = (kind: 'prefix' | 'suffix', id: string, group: string, text: string, slots: AffixSlot[], stat: StatKey, tiers: AffixTier[], o: Opts = {}): AffixDef => ({
  id: `${kind === 'prefix' ? 'pre' : 'suf'}_${id}`, kind, text, slots, group, weight: o.weight ?? 100, minIlvl: o.minIlvl ?? 1, tiers: from(tiers, o.minIlvl ?? 1),
  effect: { mod: { stat, op: o.op ?? 'flat', ...(o.when ? { when: o.when } : {}) } },
});
const pre = (id: string, group: string, text: string, slots: AffixSlot[], stat: StatKey, tiers: AffixTier[], o?: Opts) => mod('prefix', id, group, text, slots, stat, tiers, o);
const suf = (id: string, group: string, text: string, slots: AffixSlot[], stat: StatKey, tiers: AffixTier[], o?: Opts) => mod('suffix', id, group, text, slots, stat, tiers, o);

const KINDS: [DamageKind, string, string][] = [
  ['physical', 'Honed', 'Physical'], ['ash', 'Burning', 'Ash'], ['rime', 'Frozen', 'Rime'], ['storm', 'Crackling', 'Storm'],
  ['radiance', 'Radiant', 'Radiance'], ['umbral', 'Shadowed', 'Umbral'], ['verdant', 'Thorned', 'Verdant'], ['blade', 'Keen', 'Blade'],
  ['iron', 'Tempered', 'Iron'], ['fist', 'Brawling', 'Fist'], ['hunt', 'Stalking', 'Hunt'], ['guile', 'Sly', 'Guile'], ['song', 'Resonant', 'Song'],
];

// ───────────── prefixes: offence ─────────────
const OFFENCE: AffixDef[] = [
  ...KINDS.map(([k, adj, name]) => pre(adj.toLowerCase(), `dmg.${k}`, `+{v}% ${name} damage`, [...WEAPONISH, 'hands'], `dmg.${k}` as StatKey, PCT_DMG)),
  pre('mighty', 'dmg', '+{v}% damage', ['weapon', ...JEWEL], 'dmg', PCT_SMALL, { weight: 40 }),
  pre('arcane', 'spellDmg', '+{v}% spell damage', ['weapon', 'offhand', 'head', ...JEWEL], 'spellDmg', PCT_DMG),
  pre('brutal', 'attackDmg', '+{v}% attack damage', ['weapon', 'hands', 'ring'], 'attackDmg', PCT_DMG),
  pre('swift', 'atkSpeed', '+{v}% attack speed', ['weapon', 'hands', 'ring'], 'atkSpeed', SPEED),
  pre('fluent', 'castSpeed', '+{v}% cast speed', ['weapon', 'offhand', 'head', 'amulet'], 'castSpeed', SPEED),
  pre('precise', 'crit', '+{v}% critical chance', ['weapon', 'hands', 'head', ...JEWEL], 'crit', T([0.01, 0.02], [0.02, 0.03], [0.03, 0.04], [0.04, 0.05], [0.05, 0.06])),
  pre('vicious', 'critd', '+{v}% critical damage', ['weapon', 'hands', ...JEWEL], 'critd', T([0.05, 0.1], [0.1, 0.15], [0.15, 0.2], [0.2, 0.25], [0.25, 0.32])),
  pre('channelling', 'sp', '+{v} spell power', ['weapon', 'offhand', 'head', 'chest', ...JEWEL], 'sp', T([2, 4], [3, 5], [4, 6], [5, 7], [6, 9])),
  pre('volleying', 'projCount', '+{v} projectile', JEWEL, 'projCount', T([1, 1]), { weight: 10, minIlvl: 20 }),
  pre('sweeping', 'area', '+{v}% area of effect', ['offhand', 'head', ...JEWEL], 'area', T([0.03, 0.05], [0.05, 0.08], [0.08, 0.11], [0.11, 0.14], [0.14, 0.18])),
  pre('afflicting', 'statusChance', '+{v}% status chance', WEAPONISH, 'statusChance', T([0.05, 0.08], [0.08, 0.12], [0.12, 0.16], [0.16, 0.2], [0.2, 0.25])),
  pre('lingering', 'statusDur', '+{v}% status duration', ['weapon', 'offhand', 'amulet'], 'statusDur', UTIL, { weight: 60 }),
  pre('leeching', 'lifesteal', '{v}% of damage healed back', ['weapon', 'ring'], 'lifesteal', T([0.01, 0.015], [0.015, 0.02], [0.02, 0.028], [0.028, 0.034], [0.034, 0.04]), { weight: 50 }),
  pre('commanding', 'minionDmg', '+{v}% summon damage', ['offhand', ...JEWEL], 'minionDmg', PCT_DMG, { weight: 50 }),
  pre('mending', 'healing', '+{v}% healing done', ['weapon', 'offhand', 'amulet'], 'healing', PCT_DMG, { weight: 60 }),
  ...([['burn', 'Searing'], ['bleed', 'Serrated'], ['poison', 'Venomous']] as const).map(([s, adj]): AffixDef => ({
    id: `pre_${adj.toLowerCase()}`, kind: 'prefix', text: `+{v}% ${s} damage`, slots: WEAPONISH, group: `statusDmg.${s}`, weight: 70, minIlvl: 1,
    tiers: T([0.08, 0.12], [0.12, 0.18], [0.18, 0.24], [0.24, 0.3], [0.3, 0.38]), effect: { statusDmg: s },
  })),
];

// ───────────── prefixes: resource ─────────────
const RESOURCE: AffixDef[] = [
  pre('fervent', 'ember', '+{v} max Ember', ['offhand', 'head', 'chest', ...JEWEL], 'ember', T([5, 8], [6, 10], [8, 12], [10, 14], [12, 16])),
  pre('flowing', 'emberRegen', '+{v} Ember per second', ['offhand', 'head', ...JEWEL], 'emberRegen', T([0.3, 0.5], [0.5, 0.8], [0.8, 1.1], [1.1, 1.4], [1.4, 1.8])),
  pre('siphoning', 'emberOnHit', '+{v} Ember on hit', ['weapon', 'ring'], 'emberOnHit', T([1, 1], [1, 2], [2, 2], [2, 3], [3, 4]), { weight: 50 }),
  pre('thrifty', 'emberCost', '{v}% Ember cost', ['offhand', 'head', 'amulet'], 'emberCost', neg(T([0.03, 0.05], [0.05, 0.07], [0.07, 0.09], [0.09, 0.11], [0.11, 0.14]))),
  pre('hastened', 'cdr', '+{v}% cooldown reduction', ['head', ...JEWEL], 'cdr', T([0.02, 0.03], [0.03, 0.05], [0.05, 0.06], [0.06, 0.08], [0.08, 0.1])),
  pre('fleeting', 'ultCdr', '+{v}% ultimate cooldown reduction', ['amulet'], 'ultCdr', UTIL, { weight: 30, minIlvl: 10 }),
  pre('enduring', 'stamina', '+{v} max stamina', ['chest', 'feet'], 'stamina', T([5, 10], [8, 12], [10, 15], [12, 18], [15, 22])),
  pre('nimble', 'staminaCost', '{v}% stamina cost', ['feet', 'hands'], 'staminaCost', neg(T([0.04, 0.06], [0.06, 0.08], [0.08, 0.1], [0.1, 0.12], [0.12, 0.15]))),
  pre('darting', 'dashCd', '{v}% dash cooldown', ['feet'], 'dashCd', neg(T([0.04, 0.06], [0.06, 0.09], [0.09, 0.12], [0.12, 0.15], [0.15, 0.2]))),
  pre('relentless', 'staminaOnKill', '+{v} stamina on kill', ['feet', 'ring'], 'staminaOnKill', T([2, 3], [3, 4], [4, 6], [6, 8], [8, 10]), { weight: 50 }),
];

// ───────────── suffixes: defence ─────────────
const DEFENCE: AffixDef[] = [
  suf('of_the_bear', 'hp', '+{v} max health', [...ARMOUR, 'offhand', ...JEWEL], 'hp', T([10, 16], [14, 22], [18, 28], [24, 34], [30, 42])),
  suf('of_vigour', 'hpPct', '+{v}% max health', ['chest', 'amulet'], 'hp', T([0.03, 0.05], [0.05, 0.07], [0.07, 0.09], [0.09, 0.11], [0.11, 0.14]), { op: 'pct', weight: 60 }),
  suf('of_the_tortoise', 'armor', '+{v} armour', [...ARMOUR, 'offhand'], 'armor', T([4, 7], [6, 9], [8, 12], [10, 15], [13, 18])),
  suf('of_the_bulwark', 'armorPct', '+{v}% armour', ['head', 'chest', 'offhand'], 'armor', T([0.04, 0.07], [0.07, 0.1], [0.1, 0.13], [0.13, 0.16], [0.16, 0.2]), { op: 'pct', weight: 60 }),
  ...KINDS.filter(([k]) => k !== 'physical').map(([k, , name]) =>
    suf(`of_${k}_warding`, `resist.${k}`, `+{v}% ${name} resistance`, [...ARMOUR, 'offhand', ...JEWEL], `resist.${k}` as StatKey, RESIST, { weight: 60 })),
  suf('of_the_wall', 'block', '+{v}% block chance', ['offhand', 'chest'], 'block', T([0.02, 0.03], [0.03, 0.05], [0.05, 0.06], [0.06, 0.08], [0.08, 0.1]), { weight: 50 }),
  suf('of_renewal', 'healingTaken', '+{v}% healing received', ['chest', ...JEWEL], 'healingTaken', UTIL),
  suf('of_the_troll', 'hpRegen', '+{v} health per second', ['chest', ...JEWEL], 'hpRegen', T([0.5, 1], [1, 2], [2, 4], [4, 7], [7, 11])),
  suf('of_last_light', 'lowHpGuard', '{v}% damage taken below 50% health', ['chest', 'feet'], 'dmgTaken',
    neg(T([0.03, 0.05], [0.05, 0.07], [0.07, 0.09], [0.09, 0.12], [0.12, 0.15])), { when: { c: 'hpBelow', pct: 0.5 }, weight: 60 }),
  suf('of_steadiness', 'stunTaken', '{v}% stun duration', ['head', 'feet'], 'stunTaken', neg(T([0.05, 0.08], [0.08, 0.12], [0.12, 0.16], [0.16, 0.2], [0.2, 0.25])), { weight: 60 }),
  suf('of_the_pack', 'minionHp', '+{v}% summon health', ['chest', 'offhand', 'amulet'], 'minionHp', PCT_DMG, { weight: 50 }),
];

// ───────────── suffixes: utility ─────────────
const UTILITY: AffixDef[] = [
  suf('of_the_wind', 'moveSpeed', '+{v}% move speed', ['feet'], 'moveSpeed', T([0.03, 0.04], [0.04, 0.05], [0.05, 0.06], [0.06, 0.07], [0.07, 0.09])),
  suf('of_the_magpie', 'gold', '+{v}% Embershards', ['weapon', 'hands', ...JEWEL], 'gold', T([0.05, 0.1], [0.1, 0.15], [0.15, 0.2], [0.2, 0.25], [0.25, 0.3])),
  suf('of_fortune', 'itemFind', '+{v}% rarer loot', ['weapon', 'head', ...JEWEL], 'itemFind', T([0.03, 0.05], [0.05, 0.07], [0.07, 0.1], [0.1, 0.12], [0.12, 0.15]), { weight: 60 }),
  suf('of_the_scholar', 'xp', '+{v}% experience', ['weapon', 'head', ...JEWEL], 'xp', T([0.02, 0.03], [0.03, 0.04], [0.04, 0.05], [0.05, 0.06], [0.06, 0.08]), { weight: 60 }),
  suf('of_the_apothecary', 'potionHeal', '+{v}% potion healing', ['chest', 'amulet'], 'potionHeal', UTIL, { weight: 60 }),
  suf('of_the_choir', 'buffDur', '+{v}% buff duration', JEWEL, 'buffDur', UTIL, { weight: 50 }),
  suf('of_second_wind', 'staminaRegen', '+{v}% stamina regeneration', ['feet', 'chest'], 'staminaRegen', UTIL, { op: 'pct' }),
];

// ───────────── proc affixes (wrought+, weight 5): v scales the proc's coefficients ─────────────
const near = (r: number) => ({ shape: 'circle' as const, at: 'self' as const, r });
const tgt = { shape: 'single' as const, at: 'target' as const };
const PROC_TIERS = T([0.9, 1.0], [1.0, 1.15], [1.15, 1.3], [1.3, 1.5], [1.5, 1.75]);
const proc = (id: string, text: string, slots: AffixSlot[], p: Proc): AffixDef => ({
  id: `suf_${id}`, kind: 'suffix', text, slots, group: `proc:${id}`, weight: 5, minIlvl: 10, minRarity: 'wrought', tiers: from(PROC_TIERS, 10), effect: { proc: p },
});
const buff = (id: string, dur: number, mods: Modifier[], to: 'self' | 'allies' = 'self'): Action => ({ a: 'buff', id, dur, to, mods, ...(to === 'allies' ? { r: 180 } : {}) });
const PROCS: AffixDef[] = [
  proc('of_the_pyre', 'On kill: 20% chance to release an ember nova', ['weapon', 'amulet'], { on: 'kill', chance: 0.2, do: [{ a: 'damage', coef: 0.6, kind: 'ash', area: near(80), status: [{ id: 'burn', dur: 3000 }] }] }),
  proc('of_the_frost_step', 'Dashing leaves a ring of frost', ['feet'], { on: 'dash', icd: 3000, do: [{ a: 'status', status: { id: 'chill', dur: 2000 }, area: near(64) }] }),
  proc('of_the_tempest', 'Critical hits arc lightning to 2 foes', ['weapon', 'ring'], { on: 'crit', icd: 1000, do: [{ a: 'chain', coef: 0.4, kind: 'storm', jumps: 2, range: 120 }] }),
  proc('of_the_dawn', 'When hit: heal 6% of max health (8 s)', ['chest', 'amulet'], { on: 'hurt', icd: 8000, do: [{ a: 'heal', pctMax: 0.06, to: 'self' }] }),
  proc('of_the_night', 'Hits have an 8% chance to drain the foe', ['weapon', 'ring'], { on: 'hit', chance: 0.08, do: [{ a: 'damage', coef: 0.5, kind: 'umbral', area: tgt, flags: ['lifesteal'] }] }),
  proc('of_the_bramble', 'Hits have a 6% chance to root the foe', ['weapon', 'hands'], { on: 'hit', chance: 0.06, icd: 2000, do: [{ a: 'status', status: { id: 'root', dur: 1200 }, area: tgt }] }),
  proc('of_the_rampart', 'Below 50% health: a shield of 20% max health (30 s)', ['chest', 'offhand'], { on: 'lowHp', icd: 30000, do: [{ a: 'shield', pctMax: 0.2, dur: 6000, to: 'self' }] }),
  proc('of_the_rally', 'On kill: allies nearby deal 8% more damage for 4 s', ['amulet', 'head'], { on: 'kill', icd: 4000, do: [buff('aff:rally', 4000, [{ stat: 'dmg', op: 'flat', value: 0.08 }], 'allies')] }),
  proc('of_the_hunt', 'Every 6th attack marks the foe (+25% damage taken)', ['weapon', 'hands'], { on: 'attack', every: 6, do: [{ a: 'status', status: { id: 'mark', dur: 6000, power: 0.25 }, area: tgt, maxTargets: 1 }] }),
  proc('of_the_flurry', 'Critical hits: +20% attack speed for 3 s', ['weapon', 'hands'], { on: 'crit', icd: 3000, do: [buff('aff:flurry', 3000, [{ stat: 'atkSpeed', op: 'flat', value: 0.2 }])] }),
  proc('of_the_wellspring', 'Spending Ember: 10% chance to refund 10 Ember', ['offhand', 'amulet'], { on: 'cast', chance: 0.1, do: [{ a: 'resource', ember: 10 }] }),
  proc('of_the_echo', 'Casting has a 10% chance to strike the target again', ['weapon', 'offhand'], { on: 'cast', chance: 0.1, icd: 1000, do: [{ a: 'damage', coef: 0.5, area: tgt }] }),
];

// ───────────── spell-specific (generated from the kits) ─────────────
const SPELL_LEVELS: AffixTier[] = [{ ilvl: 1, min: 1, max: 1 }, { ilvl: 20, min: 1, max: 2 }, { ilvl: 38, min: 2, max: 2 }];
// the 3 starting kit spells and the 3 learned on the Spells branch (NEW_KIT)
const KIT_SPELL_AFFIXES: AffixDef[] = HC_CLASSES.flatMap((c) => [...kitFor(c.id).spells, ...(NEW_KIT[c.id] ?? [])].map((sid): AffixDef => {
  const name = [...HC_KIT_SPELLS, ...HC_KIT_SPELLS_NEW].find((s) => s.id === sid)?.name ?? sid;
  return { id: `pre_lvl_${sid.replace(/^spell:/, '')}`, kind: 'prefix', text: `+{v} to ${name}`, slots: ['weapon', 'amulet'], group: `spell:${sid}`,
    weight: 30, minIlvl: 1, tiers: SPELL_LEVELS, effect: { spellLevels: sid }, only: { classId: c.id } };
}));
const SCHOOLS = [...new Set(HC_CLASSES.map((c) => c.school))] as SchoolId[];
const SCHOOL_AFFIXES: AffixDef[] = SCHOOLS.map((s): AffixDef => ({
  id: `pre_lvl_school_${s}`, kind: 'prefix', text: `+{v} to all ${SCHOOL_NAME[s]} spells`, slots: ['weapon', 'offhand', 'amulet'], group: `school:${s}`,
  weight: 20, minIlvl: 10, tiers: [{ ilvl: 10, min: 1, max: 1 }, { ilvl: 30, min: 1, max: 2 }], effect: { schoolLevels: s }, only: { school: s },
}));

export const HC_AFFIXES: AffixDef[] = [...OFFENCE, ...RESOURCE, ...DEFENCE, ...UTILITY, ...PROCS, ...KIT_SPELL_AFFIXES, ...SCHOOL_AFFIXES];
