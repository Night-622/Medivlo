/**
 * The damage formula (SYSTEMS.md §2.3). Pure: no Phaser, no GameState.
 */
import type {
  AttributeId, BuildupStatus, DamageRoll, DamageType, EnemyFamily, EnemyRank, EnemyVariant, MagicSchool, Rng, ScalingGrade, StatId, StatusId,
} from '@/core';
import { ARMOR_CAP, ARMOR_K_BASE, ARMOR_K_PER_LEVEL, BACKSTAB_CRIT, BACKSTAB_MORE, GRADE, STATUS_MULT, attrEffect } from '../balance';
import type { SelfContext, StatBlock } from '../stats/StatBlock';

export type AttackKind = 'melee' | 'ranged' | 'spell' | 'dot';

export interface CombatantView {
  level: number;
  attributes: Record<AttributeId, number> | null; // null for enemies (no attribute scaling)
  block: StatBlock;
  self: SelfContext;
  armor: number;
  resist: Record<DamageType, number>;
  statuses: ReadonlySet<StatusId>;
  critChance: number;
  critMultiplier: number;
  family?: EnemyFamily;
  variant?: EnemyVariant;
  rank?: EnemyRank;
}

export interface HitSpec {
  kind: AttackKind;
  lines: DamageRoll[];
  scaling?: Partial<Record<AttributeId, ScalingGrade>>;
  /** combo/heavy/power/rank multipliers, applied as 'more' */
  mult?: number;
  school?: MagicSchool;
  poise?: number;
  buildup?: Partial<Record<BuildupStatus, number>>;
  canCrit?: boolean;
  forceCrit?: boolean;
  critBonus?: number;
  critMultBonus?: number;
  backstab?: boolean;
  ignoreArmor?: boolean;
}

export interface HitResult {
  byType: Partial<Record<DamageType, number>>;
  total: number;
  crit: boolean;
  poise: number;
  buildup: Partial<Record<BuildupStatus, number>>;
  /** dominant damage type (for number colour) */
  mainType: DamageType;
}

const PHYSICAL = new Set<DamageType>(['slash', 'pierce', 'blunt']);
const KIND_STAT: Record<AttackKind, StatId | null> = { melee: 'meleeDamage', ranged: 'rangedDamage', spell: 'spellDamage', dot: null };

/** additive pool of a percentage stat (flat + increased), and its 'more' factor */
const pool = (b: StatBlock, s: StatId) => b.flat(s) + b.inc(s);

export function scalingBonus(attrs: Record<AttributeId, number> | null, scaling: HitSpec['scaling']): number {
  if (!attrs || !scaling) return 0;
  let bonus = 0;
  for (const [a, g] of Object.entries(scaling) as [AttributeId, ScalingGrade][]) bonus += GRADE[g] * attrEffect(attrs[a] ?? 10);
  return bonus;
}

export function armorMitigation(armor: number, attackerLevel: number): number {
  if (armor <= 0) return 0;
  return Math.min(ARMOR_CAP, armor / (armor + ARMOR_K_BASE + ARMOR_K_PER_LEVEL * attackerLevel));
}

export function resolveHit(attacker: CombatantView, defender: CombatantView, spec: HitSpec, rng: Rng): HitResult {
  const atk = attacker.block.withHit(attacker.self, {
    targetFamily: defender.family, targetVariant: defender.variant, targetRank: defender.rank, targetStatuses: defender.statuses, school: spec.school,
  });
  const def = defender.block;

  // 1–2 roll + attribute scaling
  const scale = 1 + scalingBonus(attacker.attributes, spec.scaling);
  // crit roll (once per hit)
  const critChance = attacker.critChance + (spec.critBonus ?? 0) + (spec.backstab ? BACKSTAB_CRIT : 0);
  const crit = spec.forceCrit || (spec.canCrit !== false && spec.kind !== 'dot' && rng.chance(critChance));
  const critMult = crit ? attacker.critMultiplier + (spec.critMultBonus ?? 0) : 1;

  const kindStat = KIND_STAT[spec.kind];
  const sharedInc = pool(atk, 'damageDealt') + (kindStat ? pool(atk, kindStat) : 0) + (spec.school ? pool(atk, `school.${spec.school}`) : 0);
  const sharedMore = atk.more('damageDealt') * (kindStat ? atk.more(kindStat) : 1) * (spec.school ? atk.more(`school.${spec.school}`) : 1)
    * (spec.mult ?? 1) * (spec.backstab ? 1 + BACKSTAB_MORE : 1);

  // defender multipliers (step 7)
  let taken = def.mult('damageTaken');
  if (defender.statuses.has('shock')) taken *= 1 + STATUS_MULT.shocked;
  if (defender.statuses.has('exposed') || defender.statuses.has('stagger')) taken *= 1 + STATUS_MULT.exposed;
  if (defender.statuses.has('vulnerable')) taken *= 1 + STATUS_MULT.vulnerable;

  const armorMit = spec.ignoreArmor ? 0 : armorMitigation(defender.armor, attacker.level);
  const byType: Partial<Record<DamageType, number>> = {};
  let total = 0;
  let mainType: DamageType = spec.lines[0]?.type ?? 'slash';
  let mainAmt = -1;
  for (const line of spec.lines) {
    const base = rng.range(line.min, line.max + 0.999);
    const typeStat: StatId = `damage.${line.type}`;
    const inc = 1 + sharedInc + pool(atk, typeStat);
    const more = sharedMore * atk.more(typeStat);
    let v = base * scale * Math.max(0, inc) * more * critMult;
    if (PHYSICAL.has(line.type)) v *= 1 - armorMit;
    v *= 1 - (defender.resist[line.type] ?? 0);
    v *= taken;
    v = Math.max(0, v);
    byType[line.type] = (byType[line.type] ?? 0) + v;
    total += v;
    if (v > mainAmt) { mainAmt = v; mainType = line.type; }
  }
  total = spec.lines.length ? Math.max(1, Math.round(total)) : 0;

  const buildup: Partial<Record<BuildupStatus, number>> = {};
  for (const [s, amt] of Object.entries(spec.buildup ?? {}) as [BuildupStatus, number][]) {
    buildup[s] = amt * (1 + pool(atk, `buildup.${s}`)) * atk.more(`buildup.${s}`) * (crit ? 1.25 : 1);
  }

  return { byType, total, crit, poise: (spec.poise ?? 0) * (crit ? 1.25 : 1), buildup, mainType };
}
