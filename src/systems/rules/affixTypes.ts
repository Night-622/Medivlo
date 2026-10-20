/**
 * Deeper builds (docs/systems/BUILDS.md §2.3, §2.2, §5.1): the data shapes for random affixes, spell runes and
 * named loot tables. Pure types; the engines live in rules/affixes.ts, rules/runes.ts and sim/loot.ts.
 */
import type { DamageKind, StatusId } from '@/core/hc';
import type { SchoolId } from '@/core/constants';
import type { HcSpell, Modifier, Passive, Proc, Rarity, SpellMod } from './types';

/** Where an affix may roll (gear slot families: both ring slots are 'ring'). */
export type AffixSlot = 'weapon' | 'offhand' | 'head' | 'chest' | 'hands' | 'feet' | 'ring' | 'amulet';

export interface AffixTier {
  /** this tier applies from this item level up (tiers sorted ascending) */
  ilvl: number;
  min: number;
  max: number;
}

export type AffixEffect =
  /** the rolled value v replaces mod.value (pct / flat as the modifier says) */
  | { mod: Omit<Modifier, 'value'> }
  /** "+v to <spell>" (v an integer, 1–2): +12% damage and +6% area per level on that spell ('*' = all spells) */
  | { spellLevels: string }
  /** "+v to all <school> spells" */
  | { schoolLevels: SchoolId }
  /** the proc's damage coefficients are scaled by v (v = 1 means as written) */
  | { proc: Proc }
  /** "+v% <status> damage" (v a fraction) */
  | { statusDmg: StatusId };

export interface AffixDef {
  /** 'pre_burning', 'suf_of_the_owl' */
  id: string;
  kind: 'prefix' | 'suffix';
  /** the text pattern, {v} = the rolled value ('+{v}% Ash damage'); Claude 4 may restyle */
  text: string;
  slots: AffixSlot[];
  /** at most one affix per group on an item ('dmg.ash', 'hp', 'spell:fireball') */
  group: string;
  /** pool weight (common 100, rare 20, proc affixes 5) */
  weight: number;
  minIlvl: number;
  tiers: AffixTier[];
  effect: AffixEffect;
  /** rolls only on drops for this class / school (spell-specific affixes) */
  only?: { classId?: string; school?: SchoolId };
  /** lowest rarity it can roll on (proc affixes: 'wrought') */
  minRarity?: Rarity;
}

/** A rolled affix on an item instance (ItemInstance.affixes). */
export interface RolledAffix { id: string; v: number }

/** Affix counts and socket counts by rarity (BUILDS.md §2.3). */
export const AFFIX_COUNT: Record<Rarity, [number, number]> = {
  common: [0, 0], fine: [1, 1], ember: [2, 2], runed: [3, 3], wrought: [3, 4], spark: [4, 4],
};
export const SOCKETS: Record<Rarity, number> = { common: 0, fine: 0, ember: 1, runed: 1, wrought: 2, spark: 3 };
/** Rolled-rarity weights at luck 0 (BUILDS.md §2.3). */
export const RARITY_WEIGHT: Record<Rarity, number> = { common: 50, fine: 30, ember: 13, runed: 5, wrought: 1.6, spark: 0.4 };

// ───────────── runes (BUILDS.md §2.2) ─────────────
/** SpellMod fields only runes (and a few perks / uniques) add. */
export interface RuneMod extends SpellMod {
  /** projectiles split into N at their first hit */
  fork?: number;
  /** hits chain to N more foes at 60% */
  chain?: number;
  pierce?: boolean;
  /** −cast time and −cooldown share (0.2 = 20% faster) */
  haste?: number;
  /** the spell deals this damage kind */
  convert?: DamageKind;
  /** + projectiles */
  count?: number;
  /** a shield of this share of max HP on cast */
  ward?: number;
  /** share of the spell's damage healed back */
  leech?: number;
}

export interface RuneDef {
  /** 'rn_fork'; the rune item base is the same id */
  id: string;
  name: string;
  desc: string;
  /** spells it fits (by HcSpell.tags); empty = any spell */
  fits: HcSpell['tags'];
  mod: Omit<RuneMod, 'spell'>;
  /** Runeforge recipe */
  craft: { gold: number; items: { item: string; qty: number }[] };
  rarity: Rarity;
}

// ───────────── loot tables (BUILDS.md §5.1) ─────────────
export type LootEntry = { weight: number } & (
  /** a fixed base: 'rn_fork', 't_<spellId>', 'u_<unique>' */
  | { item: string; qty?: [number, number] }
  /** a rolled affixed piece */
  | { gear: { slot?: AffixSlot; minRarity?: Rarity; forKit?: boolean } }
  | { rune: 'any' | string[] }
  | { tome: 'any' | SchoolId }
  | { nothing: true }
  /** a unique (UniqueDef id): once per character per table; repeats roll a wrought kit piece */
  | { unique: string }
);

export interface LootTable {
  /** 'tbl:rime-ruin', 'tbl:<boss id>' */
  id: string;
  /** independent rolls, each one entry by weight */
  rolls: number;
  entries: LootEntry[];
  /** dropped every time, on top of the rolls */
  always?: LootEntry[];
  /** chests: keep today's gold + gear + potion roll and add this table on top (default true) */
  base?: boolean;
}

// ───────────── uniques (BUILDS.md §5) ─────────────
/**
 * A unique item: a fixed base (its stats and art), fixed affixes, and one build-defining effect. The 25 boss
 * legendaries keep their lg_* ids (their effect replaces the six generic legendary effects); new ones are u_<slug>.
 * Each drops once per character from its home (a loot table id, or 'boss' for a legendary's own boss).
 */
export interface UniqueDef {
  id: string;
  name: string;
  /** stat / art base: a weapon, armour piece, ring or amulet id */
  base: string;
  affixes: RolledAffix[];
  effect: Passive;
  /** the effect line shown in gold on the tooltip */
  text: string;
  home: string;
  /** at least this level to drop (Act gates) */
  minLevel?: number;
}
