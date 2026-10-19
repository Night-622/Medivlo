/**
 * One-call player stat computation: collect → StatBlock → Derived.
 */
import type { GameState, StatId, StatModifier } from '@/core';
import { collectPlayerEffects, type Collected } from './collect';
import { deriveStats, type Derived } from './derive';
import { StatBlock, type SelfContext, defaultSelfContext } from './StatBlock';

export interface PlayerStats {
  block: StatBlock;
  derived: Derived;
  collected: Collected;
  self: SelfContext;
}

export function computePlayerStats(state: GameState, self: Partial<SelfContext> = {}, extraMods: StatModifier[] = []): PlayerStats {
  const collected = collectPlayerEffects(state);
  const ctx: SelfContext = {
    ...defaultSelfContext(),
    ...self,
    weaponFamily: collected.weapon?.def.weapon?.family ?? null,
    armorWeight: collected.armorWeight,
    flags: state.flags,
  };
  const block = StatBlock.from([...collected.mods, ...extraMods], ctx);
  const pr = state.player.progression;
  const derived = deriveStats(pr.attributes, pr.level, block, { cinderlung: pr.cinderlung ?? 0 });
  return { block, derived, collected, self: ctx };
}

/** Value for StatsService.get(stat) */
export function statValue(ps: PlayerStats, stat: StatId): number {
  const d = ps.derived as unknown as Record<string, unknown>;
  const v = d[stat];
  if (typeof v === 'number') return v;
  if (stat in ps.derived.attributes) return ps.derived.attributes[stat as keyof Derived['attributes']];
  if (stat.startsWith('resist.')) return ps.derived.resist[stat.slice(7) as keyof Derived['resist']] ?? 0;
  return ps.block.pct(stat);
}
