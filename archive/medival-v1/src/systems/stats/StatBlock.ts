/**
 * Modifier aggregation (SYSTEMS.md §2.3): flat → increased (additive pool) → more (multiplicative).
 * Pure, no Phaser. Conditions that depend on the hit target are kept aside and applied by HitResolver.
 */
import type { CombatCondition, StatId, StatModifier } from '@/core';
import type { ArmorWeight, EnemyFamily, EnemyRank, EnemyVariant, MagicSchool, StatusId, WeaponFamily } from '@/core';

interface Acc { flat: number; inc: number; more: number }

/** Facts about the stat owner, used for self conditions. */
export interface SelfContext {
  hpPct: number;
  inCombat: boolean;
  timePhase: 'dawn' | 'day' | 'dusk' | 'night';
  statuses: ReadonlySet<StatusId>;
  weaponFamily: WeaponFamily | null;
  armorWeight: ArmorWeight | null;
  flags: Record<string, boolean | number | string>;
}

/** Facts about the hit, used for target conditions. */
export interface HitContext {
  targetFamily?: EnemyFamily;
  targetVariant?: EnemyVariant;
  targetRank?: EnemyRank;
  targetStatuses?: ReadonlySet<StatusId>;
  school?: MagicSchool;
}

export function defaultSelfContext(): SelfContext {
  return { hpPct: 1, inCombat: false, timePhase: 'day', statuses: new Set(), weaponFamily: null, armorWeight: null, flags: {} };
}

/**
 * Evaluate a condition. Returns `undefined` when it needs a HitContext that wasn't given
 * (so the modifier is deferred to hit time).
 */
export function evalCombatCondition(c: CombatCondition, self: SelfContext, hit?: HitContext): boolean | undefined {
  switch (c.kind) {
    case 'hpBelow': return self.hpPct < c.pct;
    case 'hpAbove': return self.hpPct > c.pct;
    case 'timeOfDay': return c.phase === 'night' ? self.timePhase === 'night' : self.timePhase !== 'night';
    case 'inCombat': return self.inCombat === c.value;
    case 'inStealth': return self.statuses.has('stealth');
    case 'selfHasStatus': return self.statuses.has(c.status);
    case 'weaponFamily': return self.weaponFamily === c.family;
    case 'armorWeight': return self.armorWeight === c.weight;
    case 'flag': {
      const v = self.flags[c.flag];
      return c.equals === undefined ? !!v : v === c.equals;
    }
    case 'targetFamily': return hit ? hit.targetFamily === c.family : undefined;
    case 'targetVariant': return hit ? hit.targetVariant === c.variant : undefined;
    case 'targetRank': return hit ? hit.targetRank === c.rank : undefined;
    case 'targetHasStatus': return hit ? !!hit.targetStatuses?.has(c.status) : undefined;
    case 'school': return hit ? hit.school === c.school : undefined;
    case 'all': {
      let pending = false;
      for (const x of c.of) {
        const r = evalCombatCondition(x, self, hit);
        if (r === false) return false;
        if (r === undefined) pending = true;
      }
      return pending ? undefined : true;
    }
    case 'any': {
      let pending = false;
      for (const x of c.of) {
        const r = evalCombatCondition(x, self, hit);
        if (r === true) return true;
        if (r === undefined) pending = true;
      }
      return pending ? undefined : false;
    }
  }
}

export class StatBlock {
  private acc = new Map<StatId, Acc>();
  /** modifiers whose condition depends on the hit; HitResolver evaluates them */
  readonly deferred: StatModifier[] = [];

  static from(mods: readonly StatModifier[], self: SelfContext): StatBlock {
    const b = new StatBlock();
    for (const m of mods) b.add(m, self);
    return b;
  }

  add(mod: StatModifier, self?: SelfContext): void {
    if (mod.condition) {
      const r = evalCombatCondition(mod.condition, self ?? defaultSelfContext());
      if (r === undefined) { this.deferred.push(mod); return; }
      if (!r) return;
    }
    this.apply(mod.stat, mod.op, mod.value);
  }

  apply(stat: StatId, op: StatModifier['op'], value: number): void {
    let a = this.acc.get(stat);
    if (!a) this.acc.set(stat, (a = { flat: 0, inc: 0, more: 1 }));
    if (op === 'flat') a.flat += value;
    else if (op === 'increased') a.inc += value;
    else a.more *= 1 + value;
  }

  flat(s: StatId): number { return this.acc.get(s)?.flat ?? 0; }
  inc(s: StatId): number { return this.acc.get(s)?.inc ?? 0; }
  more(s: StatId): number { return this.acc.get(s)?.more ?? 1; }

  /** absolute stat: (base + flat) × (1 + increased) × more */
  total(s: StatId, base = 0): number {
    const a = this.acc.get(s);
    if (!a) return base;
    return (base + a.flat) * (1 + a.inc) * a.more;
  }

  /** percentage-pool stat (damage.*, resist.*, critChance…): base + flat + increased, more applied */
  pct(s: StatId, base = 0): number {
    const a = this.acc.get(s);
    if (!a) return base;
    return (base + a.flat + a.inc) * a.more;
  }

  /** multiplier stat (damageTaken, healingReceived, xpGain…): (1 + flat + increased) × more */
  mult(s: StatId): number {
    const a = this.acc.get(s);
    if (!a) return 1;
    return (1 + a.flat + a.inc) * a.more;
  }

  /** copy with extra hit-time modifiers applied */
  withHit(self: SelfContext, hit: HitContext): StatBlock {
    if (this.deferred.length === 0) return this;
    const b = new StatBlock();
    for (const [k, v] of this.acc) b.acc.set(k, { ...v });
    for (const m of this.deferred) {
      if (m.condition && evalCombatCondition(m.condition, self, hit) === true) b.apply(m.stat, m.op, m.value);
    }
    return b;
  }
}
