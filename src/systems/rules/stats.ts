/**
 * Stat compilation: class base + level + gear + set bonuses + tree + buffs → a flat stat table,
 * plus the conditional modifiers, procs, hooks and spell mods that the sim evaluates at hit time. Pure.
 */
import { P } from './curves';
import type { Aura, Cond, Convert, CreatureTier, Hook, HcClassBase, Modifier, Passive, Proc, SpellMod, StatKey, StatusId, WeaponType } from './types';

export type StatTable = Record<string, number>;

export interface Compiled {
  stats: StatTable;
  /** "more" multipliers for non-scaled stats (e.g. dmg), applied separately from the additive pool */
  more: StatTable;
  /** modifiers with a `when` condition, evaluated per hit / tick */
  conditional: Modifier[];
  procs: Proc[];
  hooks: Map<string, number>;
  spellMods: SpellMod[];
  /** damage conversions (BUILDS.md §3), auras, "+N to <spell>" levels */
  convert: Convert[];
  auras: Aura[];
  spellLevels: Map<string, number>;
}

/** Handoff BASE (sp 12, hp 180, ember 100, regen 5, armour 6, crit 5%, critd 50%) shaped by the 4-pip rating. */
export function classBase(cls: HcClassBase, level: number): Modifier[] {
  const { might, guard, arcana, speed } = cls.rating;
  const p = P(level);
  const f = (stat: StatKey, value: number): Modifier => ({ stat, op: 'flat', value });
  return [
    f('hp', (180 + 20 * guard) * p),
    f('ember', 100 + 8 * arcana + 2 * (level - 1)),
    f('emberRegen', 5 + 0.5 * arcana),
    f('stamina', 100),
    f('staminaRegen', 22 + speed),
    f('armor', 6 + 3 * guard + 2 * (level - 1)),
    f('sp', (12 + 3 * arcana) * p),
    f('power', 0.04 * might + 0.01 * level),
    f('crit', 0.05 + 0.01 * speed),
    f('critd', 0.5),
    f('moveSpeed', 0.02 * speed),
    f('atkSpeed', 0.03 * speed),
    f('bag', 66),
    f('dashCharges', 1),
    f('lootRange', 48),
    f('maxMomentum', 5),
  ];
}

/** Stats where the "increased" pool applies to the flat total (others are plain sums). */
const SCALED = new Set<string>(['hp', 'ember', 'stamina', 'armor', 'sp', 'emberRegen', 'hpRegen', 'staminaRegen']);

export function compile(sources: Passive[]): Compiled {
  const flat: StatTable = {}, inc: StatTable = {}, more: StatTable = {};
  const conditional: Modifier[] = [], procs: Proc[] = [], spellMods: SpellMod[] = [], convert: Convert[] = [], auras: Aura[] = [];
  const spellLevels = new Map<string, number>();
  const hooks = new Map<string, number>();
  for (const s of sources) {
    for (const m of s.mods ?? []) {
      if (m.when) { conditional.push(m); continue; }
      const bucket = m.op === 'flat' ? flat : m.op === 'pct' ? inc : more;
      if (m.op === 'more') bucket[m.stat] = (bucket[m.stat] ?? 1) * (1 + m.value);
      else bucket[m.stat] = (bucket[m.stat] ?? 0) + m.value;
    }
    if (s.procs) procs.push(...s.procs);
    if (s.spellMods) spellMods.push(...s.spellMods);
    for (const h of s.hooks ?? []) hooks.set(h.id, (hooks.get(h.id) ?? 0) + (h.value ?? 1));
    if (s.convert) convert.push(...s.convert);
    if (s.aura) auras.push(...s.aura);
    for (const l of s.spellLevels ?? []) spellLevels.set(l.spell, (spellLevels.get(l.spell) ?? 0) + l.levels);
  }
  const stats: StatTable = {};
  const keys = new Set([...Object.keys(flat), ...Object.keys(inc), ...Object.keys(more)]);
  for (const k of keys) {
    const base = flat[k] ?? 0;
    // for non-scaled stats a pct modifier is additive (e.g. crit +0.08)
    stats[k] = SCALED.has(k) ? base * (1 + (inc[k] ?? 0)) * (more[k] ?? 1) : base + (inc[k] ?? 0);
  }
  const moreOut: StatTable = {};
  for (const k of Object.keys(more)) if (!SCALED.has(k)) moreOut[k] = more[k];
  return { stats, more: moreOut, conditional, procs, hooks, spellMods, convert, auras, spellLevels };
}

export const stat = (t: StatTable, k: StatKey): number => t[k] ?? 0;

// ───────────── conditions ─────────────
export interface CondCtx {
  hpFrac: number;
  targetHpFrac?: number;
  targetStatuses?: ReadonlySet<StatusId>;
  targetTier?: CreatureTier | 'player';
  distance?: number;
  alliesNear?: number;
  inCombat: boolean;
  stationaryMs: number;
  weapon?: WeaponType;
  behind?: boolean;
  fromStealth?: boolean;
  momentum: number;
  /** resources (players; creatures count as full) and summons alive */
  emberFrac?: number;
  staminaFrac?: number;
  moving?: boolean;
  minions?: number;
}

export function evalCond(c: Cond, x: CondCtx): boolean {
  switch (c.c) {
    case 'hpBelow': return x.hpFrac < c.pct;
    case 'hpAbove': return x.hpFrac > c.pct;
    case 'targetHpAbove': return (x.targetHpFrac ?? 0) > c.pct;
    case 'targetHpBelow': return (x.targetHpFrac ?? 1) < c.pct;
    case 'targetHas': return !!x.targetStatuses?.has(c.status);
    case 'targetTier': return !!x.targetTier && x.targetTier !== 'player' && c.tiers.includes(x.targetTier);
    case 'targetFar': return (x.distance ?? 0) >= c.px;
    case 'alone': return (x.alliesNear ?? 0) === 0;
    case 'inCombat': return x.inCombat;
    case 'stationary': return x.stationaryMs >= c.ms;
    case 'weapon': return !!x.weapon && c.types.includes(x.weapon);
    case 'behind': return !!x.behind;
    case 'fromStealth': return !!x.fromStealth;
    case 'momentum': return x.momentum >= c.min;
    case 'emberAbove': return (x.emberFrac ?? 1) > c.pct;
    case 'emberBelow': return (x.emberFrac ?? 1) < c.pct;
    case 'staminaBelow': return (x.staminaFrac ?? 1) < c.pct;
    case 'moving': return !!x.moving;
    case 'minions': return (x.minions ?? 0) >= c.min;
  }
}

/** Additive stat value with conditional flat/pct modifiers applied (conditional "more" goes to moreWith). */
export function statWith(c: Compiled, k: StatKey, x: CondCtx): number {
  let v = c.stats[k] ?? 0;
  for (const m of c.conditional) if (m.stat === k && m.op !== 'more' && m.when && evalCond(m.when, x)) v += m.value;
  return v;
}

/** Product of "more" multipliers for a stat, conditional ones included. */
export function moreWith(c: Compiled, k: StatKey, x: CondCtx): number {
  let mult = c.more[k] ?? 1;
  for (const m of c.conditional) if (m.stat === k && m.op === 'more' && m.when && evalCond(m.when, x)) mult *= 1 + m.value;
  return mult;
}

export const hook = (c: Compiled, id: string): number => c.hooks.get(id) ?? 0;
export type { Hook };
