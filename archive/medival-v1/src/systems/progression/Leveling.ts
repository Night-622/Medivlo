/**
 * XP and level-ups (SYSTEMS.md §1.3–1.4).
 */
import { bus } from '@/core';
import type { GameState } from '@/core';
import { ATTRIBUTE_POINTS_PER_LEVEL, LEVEL_CAP, QUEST_XP_TIER, SKILL_POINTS_PER_LEVEL, xpToNext } from '../balance';

/** Add XP (already multiplied by xpGain by the caller if relevant). Returns levels gained. */
export function grantXp(state: GameState, amount: number, source: string): number {
  const pr = state.player.progression;
  if (amount <= 0 || pr.level >= LEVEL_CAP) return 0;
  pr.xp += Math.round(amount);
  bus.emit('xp:gained', { amount: Math.round(amount), source });
  let gained = 0;
  while (pr.level < LEVEL_CAP && pr.xp >= xpToNext(pr.level)) {
    pr.xp -= xpToNext(pr.level);
    pr.level++;
    pr.unspentAttributePoints += ATTRIBUTE_POINTS_PER_LEVEL;
    pr.unspentSkillPoints += SKILL_POINTS_PER_LEVEL;
    gained++;
    bus.emit('player:levelup', { level: pr.level });
  }
  if (pr.level >= LEVEL_CAP) pr.xp = 0;
  if (gained) bus.emit('stats:changed', {});
  return gained;
}

/** quest:reward xpTier → XP at the player's level */
export function questXp(level: number, tier: number): number {
  return Math.round((QUEST_XP_TIER[tier] ?? 0.5) * xpToNext(level));
}

export function spendAttributePoint(state: GameState, attr: keyof GameState['player']['progression']['attributes']): boolean {
  const pr = state.player.progression;
  if (pr.unspentAttributePoints <= 0) return false;
  pr.unspentAttributePoints--;
  pr.attributes[attr]++;
  bus.emit('stats:changed', {});
  return true;
}

export function xpProgress(state: GameState): { xp: number; next: number; pct: number } {
  const pr = state.player.progression;
  const next = xpToNext(pr.level);
  return { xp: pr.xp, next, pct: pr.level >= LEVEL_CAP ? 1 : pr.xp / next };
}
