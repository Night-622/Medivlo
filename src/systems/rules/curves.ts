/** Level curves and progression numbers (HOLLOW_CROWN.md §2.2). Pure. */
import type { CreatureTier } from './types';

export const LEVEL_CAP = 40;

/** Player health and spell power, creature health. */
export const P = (level: number): number => Math.pow(1.075, Math.max(0, level - 1));
/** Creature damage. */
export const D = (level: number): number => Math.pow(1.05, Math.max(0, level - 1)) * 1.25;

export function xpToNext(level: number): number {
  return level >= LEVEL_CAP ? Infinity : Math.round(80 * Math.pow(level, 1.7) + 120);
}

// 2026-10-20: lairs fight in waves now (60–80 kills each), so a kill is worth less: Claude 2's Act I reports ended at
// L19–20 quest-only / L22–24 explorer (target L13–14); quest and kill XP were both cut to ~2/3 in levels gained
const KILLS_PER_LEVEL = 32;
const TIER_XP: Record<CreatureTier, number> = { enemy: 1, mini: 6, boss: 25 };

/** XP for one kill at the killer's own level (no level sync; §2.2 clamps). */
export function xpForKill(playerLevel: number, enemyLevel: number, tier: CreatureTier): number {
  const effLevel = Math.min(enemyLevel, playerLevel + 5);
  const base = (xpToNext(effLevel) / KILLS_PER_LEVEL) * TIER_XP[tier];
  const lowMult = enemyLevel <= playerLevel - 5 ? 0.1 : 1;
  return Math.max(1, Math.round(base * lowMult));
}

/** Skill points from levels alone (quest points come on top). */
export const levelPoints = (level: number): number => Math.max(0, Math.min(level, LEVEL_CAP) - 1);

/** Level bands per class campaign (Claude 4's act shape). */
export const ACT_BANDS = { 1: [1, 14], 2: [14, 28], 3: [28, 40] } as const;

/** Creature tier baselines at level 1, before hpShape and party scaling. */
/** Pacing pass (docs/PACING.md): fights at the intended level run 2–3× longer; interludes and hazards carry the rest. */
export const TIER_HP: Record<CreatureTier, number> = { enemy: 140, mini: 1500, boss: 7600 };
export const TIER_DMG: Record<CreatureTier, number> = { enemy: 8, mini: 10.5, boss: 9.5 };
export const TIER_ARMOR: Record<CreatureTier, number> = { enemy: 8, mini: 20, boss: 35 };

/** Party scaling (§6). */
export const partyHpMult = (n: number, tier: CreatureTier): number => 1 + (tier === 'boss' ? 0.75 : 0.6) * Math.max(0, n - 1);
export const spawnCountMult = (n: number): number => 1 + 0.5 * Math.max(0, n - 1);
export const dropRolls = (n: number): number => Math.max(1, n);

/** Gear unlocks: material / style index i drops from this level. */
export const unlockLevel = (index: number): number => 1 + 5 * index;
/** Branch reset cost in Embershards. */
export const resetCost = (level: number): number => 10 * level;
