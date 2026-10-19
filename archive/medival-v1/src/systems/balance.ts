/**
 * Every combat/progression tuning knob (SYSTEMS.md). Pure data + curves, no Phaser.
 */
import type { AttributeId, BuildupStatus, DangerTier, EnemyRank, Rarity, ScalingGrade } from '@/core';

export const LEVEL_CAP = 40;
export const ATTRIBUTE_POINTS_PER_LEVEL = 2;
export const SKILL_POINTS_PER_LEVEL = 1;
export const ATTRIBUTE_SOFT_CAP = 40;
export const CREATION_TRAIT_PICKS = 2;
export const FREE_RESPEC_BELOW_LEVEL = 10;

export const ATTRIBUTES: readonly AttributeId[] = ['might', 'finesse', 'vigor', 'intellect', 'will'];

/** §1.3 */
export function xpToNext(level: number): number {
  return Math.round(80 * Math.pow(level, 1.7) + 120);
}

/** §2.3 power curve (enemy HP, spell base damage) */
export const P = (level: number): number => Math.pow(1.075, Math.max(0, level - 1));
/** §2.3 enemy damage curve */
export const D = (level: number): number => Math.pow(1.05, Math.max(0, level - 1));
export const goldCurve = (level: number): number => Math.pow(1.06, Math.max(0, level - 1));

/** §2.3 attribute scaling */
export const GRADE: Record<ScalingGrade, number> = { S: 1.4, A: 1.15, B: 0.9, C: 0.65, D: 0.4, E: 0.2 };
export function attrEffect(value: number): number {
  const v = Math.max(0, value - 10);
  return 0.03 * Math.min(v, 30) + 0.015 * Math.max(0, value - ATTRIBUTE_SOFT_CAP);
}

export const ARMOR_K_BASE = 40;
export const ARMOR_K_PER_LEVEL = 12;
export const ARMOR_CAP = 0.8;
export const RESIST_CAP = 0.75;
export const RESIST_FLOOR = -1;
export const CDR_CAP = 0.4;
export const BASE_CRIT_MULT = 1.5;
export const BACKSTAB_MORE = 0.5;
export const BACKSTAB_CRIT = 0.25;
export const BACKSTAB_ARC_DEG = 120;
export const RIPOSTE_MULT = 1.3;
export const RIPOSTE_WINDOW_MS = 1500;

/** Combat timing (ms) */
export const GLOBAL_COOLDOWN_MS = 300;
export const PARRY_WINDOW_MS = 160;
export const BLOCK_ARC_DEG = 120;
export const HEAVY_MIN_HOLD_MS = 300;
export const HEAVY_MAX_HOLD_MS = 900;
export const HEAVY_MULT: [number, number] = [1.6, 2.4];
export const COMBO_MULTS = [1.0, 1.1, 1.4];
export const COMBO_RESET_MS = 900;
export const GUARD_BREAK_STAGGER_MS = 1000;
export const STAGGER_MS = 1200;
export const PLAYER_STAGGER_MS = 450;
export const PLAYER_STAGGER_IMMUNE_MS = 3000;
export const EXPOSED_MS = 2000;
export const POISE_REGEN_DELAY_MS = 2500;
export const STAMINA_REGEN_DELAY_MS = 600;
export const STAMINA_REGEN_PER_SEC = 30;
export const SPRINT_MULT = 1.45;
export const SPRINT_COST_PER_SEC = 18;
export const BASE_MOVE_SPEED = 150;
export const HIT_STOP_MS = 50;
export const COMBAT_DISENGAGE_MS = 4000;

/** Equip-load roll tiers §1.2 */
export interface RollTier { maxLoad: number; durationMs: number; distance: number; iframeStart: number; iframeEnd: number; cost: number }
export const ROLL_TIERS: RollTier[] = [
  { maxLoad: 0.3, durationMs: 360, distance: 110, iframeStart: 40, iframeEnd: 320, cost: 18 },
  { maxLoad: 0.7, durationMs: 380, distance: 90, iframeStart: 60, iframeEnd: 280, cost: 22 },
  { maxLoad: 1.0, durationMs: 450, distance: 70, iframeStart: 120, iframeEnd: 270, cost: 32 },
];

/** Hearth Draught §2.6 */
export const DRAUGHT_HEAL_PCT = 0.45;
export const DRAUGHT_DURATION_MS = 1200;
export const DRAUGHT_COOLDOWN_MS = 1500;

/** Overdraw / Cinderlung §6.4 */
export const OVERDRAW_HP_PER_EMBER = 2;
export const CINDERLUNG_MAX = 5;
export const CINDERLUNG_HP_PER_STACK = 0.05;
export const CINDERLUNG_DECAY_MS = 20_000;

/** Status buildup §2.5 */
export const BUILDUP_DECAY_DELAY_MS = 2000;
export const BUILDUP_DECAY_PER_SEC = 0.1; // fraction of meter size
export const BOSS_METER_GROWTH = 1.5;
export const STATUS = {
  bleed: { burstPct: 0.15, bossPct: 0.05, playerPct: 0.1 },
  burn: { dpsPctOfHit: 0.25, durationMs: 4000 },
  frozen: { durationMs: 1500, shatterMult: 1.5, bossSlow: 0.5, bossSlowMs: 2000 },
  shock: { durationMs: 6000, damageTaken: 0.2, chainRadius: 160 },
  poison: { maxStacks: 10, perStackPerSec: 2, durationMs: 6000, healingCutPerStack: 0.03, refill: 0.5 },
} as const;
export const STATUS_MULT = { shocked: 0.2, exposed: 0.3, vulnerable: 0.25 } as const;
export const METER_BASE = 100;
export const BUILDUP_STATUSES: readonly BuildupStatus[] = ['bleed', 'burn', 'frozen', 'shock', 'poison'];

/** XP §1.4 */
export const RANK_XP: Record<EnemyRank, number> = { minion: 0.4, normal: 1, elite: 3, champion: 6, boss: 25 };
export function levelDiffXpMult(enemyLevel: number, playerLevel: number): number {
  const d = enemyLevel - playerLevel;
  if (d <= -6) return 0.1;
  if (d <= -3) return 0.5;
  if (d >= 3) return 1.25;
  return 1;
}
/** same-level normal kills per level from kills alone (quests supply the rest) */
export const KILLS_PER_LEVEL = 20;
export function killXp(enemyLevel: number, rank: EnemyRank, playerLevel: number, xpMult = 1): number {
  return Math.max(1, Math.round((xpToNext(enemyLevel) / KILLS_PER_LEVEL) * RANK_XP[rank] * xpMult * levelDiffXpMult(enemyLevel, playerLevel)));
}
/** quest:reward xpTier 1|2|3 → fraction of xpToNext (e2e pass: prologue player ≈ L3 at the stag, L5 at Morwen) */
export const QUEST_XP_TIER: Record<number, number> = { 1: 0.6, 2: 1.2, 3: 2.0 };
export const DISCOVERY_XP = { region: 0.15, landmark: 0.05, codex: 0.02 } as const;

/** global enemy damage tuning (balance pass 1: normal hits ≈ 6–10% of a same-level melee player's HP) */
export const ENEMY_DAMAGE_MULT = 1.25;

/** Enemy ranks §8.1 */
export const RANK_MULT: Record<EnemyRank, { hp: number; damage: number }> = {
  minion: { hp: 0.4, damage: 0.6 },
  normal: { hp: 1, damage: 1 },
  elite: { hp: 2.5, damage: 1.3 },
  champion: { hp: 5, damage: 1.5 },
  boss: { hp: 1, damage: 1 }, // bosses author their own base hp/damage
};
export const ELITE_CHANCE: Record<DangerTier, number> = { 1: 0.02, 2: 0.05, 3: 0.08, 4: 0.12, 5: 0.16 };
/** Max simultaneous attackers (Director tokens) §8.2 */
export function attackTokens(tier: DangerTier): { melee: number; ranged: number } {
  const bonus = (tier >= 3 ? 1 : 0) + (tier >= 5 ? 1 : 0);
  return { melee: 2 + bonus, ranged: 2 + bonus };
}

/** Loot §7.3 */
export const RARITY_WEIGHTS: Record<Rarity, number> = { common: 70, uncommon: 22, rare: 6.5, epic: 1.3, legendary: 0.2, set: 0 };
export const RARITY_AFFIXES: Record<Rarity, [number, number]> = {
  common: [0, 0], uncommon: [1, 1], rare: [2, 3], epic: [4, 4], legendary: [2, 2], set: [1, 1],
};
export const RANK_LOOT_BOOST: Record<EnemyRank, number> = { minion: 0.5, normal: 1, elite: 3, champion: 5, boss: 10 };
export const AFFIX_TIER_ILVL = [1, 8, 16, 24, 32];
export const UPGRADE_PER_LEVEL = 0.07;
/** armour on gear grows with item level so it keeps pace with the armour formula (K = 40 + 12·attackerLevel) */
export const armorLevelMult = (itemLevel: number, baseLevel: number): number => 1 + 0.12 * Math.max(0, itemLevel - baseLevel);
export const OFF_PROFICIENCY_DAMAGE = -0.3;
export const OFF_PROFICIENCY_WEIGHT = 0.3;

export const RARITY_COLOR: Record<Rarity, number> = {
  common: 0xd8d0bf, uncommon: 0x6fbf5a, rare: 0x4f8fe0, epic: 0xa66be0, legendary: 0xe08a2e, set: 0x3fd0b0,
};
export const DAMAGE_COLOR: Record<string, number> = {
  slash: 0xf2e6cf, pierce: 0xf2e6cf, blunt: 0xf2e6cf, fire: 0xff8a3d, frost: 0x8fd3ff, lightning: 0xf7e463,
  radiant: 0xfff3b0, shadow: 0xb08cff, poison: 0x8fdc5a,
};
