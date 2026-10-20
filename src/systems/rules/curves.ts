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

// 2026-10-20 (Claude 3, approved by Claude 1): the pacing passes (lair waves, elites, road camps, patrols, guards)
// made kills ~55% of a campaign's XP, and the static projection (tools/e2e/sim/xp-project.ts on Claude 2's walks)
// put Act I at L19 against L13–14. Kills per level now follow the hero's level: 100 through Act I, then fewer as
// the curve steepens (Act II/III have fewer, tougher fights per level), and kills under your level fade smoothly.
// Kills above your level pay a catch-up bonus, so a hero who skipped side quests closes the gap on the act's enemies.
// Projection after: Act I L13.7/14.2/15.1, II 24.7/27.7/32.3, III 38.1/39.2/40 (min/median/max, quest-only + walks);
// main quests only: L13.0 / 25.2 / 36.2 medians.
const KPL_CURVE: [number, number][] = [[14, 110], [16, 70], [28, 48], [40, 30]];
const TIER_XP: Record<CreatureTier, number> = { enemy: 1, mini: 6, boss: 25 };

/** Kills of a same-level enemy per level, at the hero's level (piecewise linear). */
export function killsPerLevel(level: number): number {
  const c = KPL_CURVE;
  if (level <= c[0][0]) return c[0][1];
  for (let i = 1; i < c.length; i++) if (level <= c[i][0]) return c[i - 1][1] + ((c[i][1] - c[i - 1][1]) * (level - c[i - 1][0])) / (c[i][0] - c[i - 1][0]);
  return c[c.length - 1][1];
}

/** Level difference: +20% per level above you (catch-up, up to 5 levels), −25% per level below, never under 10%. */
export const levelDiffMult = (playerLevel: number, enemyLevel: number, cap = 5): number =>
  enemyLevel >= playerLevel ? 1 + 0.2 * Math.min(cap, enemyLevel - playerLevel) : Math.max(0.1, 1 - 0.25 * (playerLevel - enemyLevel));

/** XP for one kill at the killer's own level (no level sync; §2.2 clamps). Elite / tier multipliers ride on top. */
export function xpForKill(playerLevel: number, enemyLevel: number, tier: CreatureTier): number {
  // a boss or mini far above you pays for at most 2 levels of the gap (a big jump on one kill: Sentinel bosses, Act II)
  const cap = tier === 'enemy' ? 5 : 2;
  const effLevel = Math.min(enemyLevel, playerLevel + cap);
  const base = (xpToNext(effLevel) / killsPerLevel(playerLevel)) * TIER_XP[tier];
  return Math.max(1, Math.round(base * levelDiffMult(playerLevel, enemyLevel, cap)));
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
// party scaling (coop-balance 2026-10-21): each extra hero adds less than a hero's worth, so a party is faster than solo
export const partyHpMult = (n: number, tier: CreatureTier): number => 1 + (tier === 'boss' ? 0.5 : 0.4) * Math.max(0, n - 1);
export const spawnCountMult = (n: number): number => 1 + 0.35 * Math.max(0, n - 1);
export const dropRolls = (n: number): number => Math.max(1, n);

/** Gear unlocks: material / style index i drops from this level. */
export const unlockLevel = (index: number): number => 1 + 5 * index;
/** Branch reset cost in Embershards. */
export const resetCost = (level: number): number => 10 * level;

/**
 * Act II quest XP per class (approved by Claude 1, 2026-10-21; bands pinned while tuning): the class threads' Act II
 * quests reach different levels, so solo heroes ended Act II at L27.6–32.7 against a goal of L28.5–31.5. Factor =
 * 1 + (30 − measured solo Act II end) / 6.2, clamped 0.6–1.4, rounded to 0.05 (tools/e2e/out/xp-pacing.md, 03:44).
 * One iteration: Claude 5 re-measures with xp-pacing. Unlisted classes and other acts: ×1.
 */
export const ACT2_QUEST_XP: Readonly<Record<string, number>> = {
  oathbound: 1.4, shade: 1.3, samurai: 1.3, huntsman: 1.3, ranger: 1.25, warden: 1.2, hedgewitch: 1.2,
  reaver: 1.15, duskweaver: 1.15, skald: 1.15, brawler: 1.1, bard: 1.1, rimecaller: 1.05, cantor: 1.05,
  swordsman: 1, arcanist: 0.95, falconer: 0.9, jester: 0.9, monk: 0.8, corsair: 0.8, knight: 0.7,
  juggernaut: 0.6, stormlancer: 0.6, sparkwright: 0.6,
};
export const actQuestXpMult = (classId: string, act: number | undefined): number => (act === 2 ? ACT2_QUEST_XP[classId] ?? 1 : 1);

/**
 * Quest XP follows the quest's own level band (Act II spread, 2026-10-21): +25% per level the hero is below its low
 * end (at most ×2), −15% per level beyond one past its high end (at least ×0.6), ×1 inside. Every class then converges on the
 * band whatever its thread's kill count was. No band known → ×1.
 */
export function questXpMult(heroLevel: number, band: readonly [number, number] | null | undefined): number {
  if (!band) return 1;
  const [lo, hi] = band;
  if (heroLevel < lo) return Math.min(2, 1 + 0.25 * (lo - heroLevel));
  // the over side starts one level past the high end: a duo runs ahead by design and should not feel short-changed
  if (heroLevel > hi + 1) return Math.max(0.6, 1 - 0.15 * (heroLevel - hi - 1));
  return 1;
}
