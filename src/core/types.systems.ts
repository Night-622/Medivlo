/**
 * Combat / progression contracts. Authored by Claude 3 (docs/systems/SYSTEMS.md), owned by Claude 1.
 * Request changes by message.
 * 2026-10-21 cleanup: the Medival v1 Registry contracts nobody imports any more (ClassDef, ItemDef, SpellDef,
 * SkillTreeDef, EnemyDef, LootTable, AffixDef, … and the types only they used) moved to
 * archive/medival-v1/src/core/types.systems.v1.ts. What stays is still read by the narrative types, GameState and saves.
 * The Hollow Crown's live systems types are in core/hc.ts and src/systems/rules/types.ts.
 */

// ───────────────────────── ids ─────────────────────────
export type ClassId = `class:${string}`;
export type TraitId = `trait:${string}`;
export type ItemId = `item:${string}`;
export type SpellId = `spell:${string}`; // spells AND martial powers
export type SkillTreeId = `skilltree:${string}`; // prefix must match ContentKind
export type EnemyId = `enemy:${string}`;
export type AffixId = `affix:${string}`;
export type RecipeId = `recipe:${string}`;

export type TemperId = 'cinderglass' | 'wardwood' | 'lumen-silver' | 'drowned-silver';

// ───────────────────── stats & damage ─────────────────────
export type AttributeId = 'might' | 'finesse' | 'vigor' | 'intellect' | 'will';

export type PhysicalDamage = 'slash' | 'pierce' | 'blunt';
export type ElementalDamage = 'fire' | 'frost' | 'lightning';
export type DamageType = PhysicalDamage | ElementalDamage | 'radiant' | 'shadow' | 'poison';

/** Statuses filled by buildup meters (Souls-style) */
export type BuildupStatus = 'bleed' | 'burn' | 'frozen' | 'shock' | 'poison';

export type MagicSchool = 'ash' | 'rime' | 'storm' | 'radiance' | 'umbral' | 'verdant';

export type StatId =
  | AttributeId
  | 'maxHp' | 'maxStamina' | 'maxMana' // 'mana' is displayed as "Ember" in UI (lore)
  | 'hpRegen' | 'staminaRegen' | 'manaRegen'
  | 'armor' | 'poise' | 'moveSpeed' | 'attackSpeed' | 'castSpeed'
  | 'critChance' | 'critMultiplier' | 'cooldownReduction'
  | 'blockEfficiency' | 'blockStability' | 'parryWindow'
  | 'dodgeCost' | 'dodgeDistance' | 'equipLoad'
  | 'healingReceived' | 'healingDone' | 'lifeOnKill' | 'lifeLeech'
  | 'statusResist' | 'damageTaken' | 'damageDealt'
  | 'meleeDamage' | 'rangedDamage' | 'spellDamage'
  | 'itemFind' | 'goldFind' | 'xpGain' | 'draughtCharges' | 'abilitySlots'
  | `damage.${DamageType}`
  | `resist.${DamageType}`
  | `buildup.${BuildupStatus}`
  | `school.${MagicSchool}`;

// ───────────────────── items ─────────────────────
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'set';

export type EquipSlot =
  | 'mainHand' | 'offHand' | 'head' | 'chest' | 'hands' | 'legs' | 'feet'
  | 'cloak' | 'amulet' | 'ring1' | 'ring2' | 'belt' | 'trinket';

/** Rolled item stored in GameState (player.inventory / player.equipment) */
export interface ItemInstance {
  uid: string;
  def: ItemId;
  qty: number;
  rarity: Rarity;
  itemLevel: number;
  affixes: { affix: AffixId; tier: number; value: number }[];
  upgrade: number;            // +0..+10
  temper?: TemperId;          // chosen at +7, see SYSTEMS §7.6
  enchantStrain?: number;     // reroll counter
}

// ───────────────────── enemies ─────────────────────
/** In-world families (Claude 4 lore). 'hollowed' is a variant, not a family. */
export type EnemyFamily = 'beast' | 'folk' | 'restless' | 'wrought' | 'thornkin' | 'cinderdrake' | 'unwrought';
export type EnemyVariant = 'hollowed';
export type EnemyRank = 'minion' | 'normal' | 'elite' | 'champion' | 'boss';

// ───────────────────── GameState slices (player.*) owned by Claude 3 ─────────────────────
export interface ProgressionState {
  classId: ClassId | null;
  subclassId?: string;
  secondTree?: SkillTreeId;                // "Second Oath", level 25+
  level: number;
  xp: number;                              // into current level
  attributes: Record<AttributeId, number>; // allocated incl. class base
  unspentAttributePoints: number;
  unspentSkillPoints: number;
  bonusSkillPoints: number;                // from quests/tomes, tracked for respec
  traits: TraitId[];
  /** treeId -> nodeId -> rank */
  tree: Record<string, Record<string, number>>;
  respecs: number;
  cinderlung?: number;                     // stacks 0..5
}

export interface SpellProgress {
  rank: number;               // 1..5
  mastery: number;
  choices: string[];          // upgrade choice ids taken
  glyphs: string[];           // socketed glyph ItemInstance uids
}

export interface SpellbookState {
  known: Record<string, SpellProgress>;   // spellId -> progress
  slots: (SpellId | null)[];               // 4 → 5 at L10 → 6 at L25
}

export type LoadoutSlots = { mainHand?: string; offHand?: string }; // item uids

export interface EquipmentState {
  loadouts: [LoadoutSlots, LoadoutSlots];
  activeLoadout: 0 | 1;
  worn: Partial<Record<Exclude<EquipSlot, 'mainHand' | 'offHand'>, string>>; // item uids
  quickslots: [ItemId | null, ItemId | null];
}

export interface InventoryState {
  items: ItemInstance[];
  capacity: number;
  gold: number;
  draught: { charges: number; maxCharges: number; potency: number };
  knownRecipes: RecipeId[];
  /** gold dropped on death; recovered by touching it */
  echo?: { instance: string; floor?: string; x: number; y: number; gold: number };
}

/** Monotonic counters for earned traits, e.g. 'kills.family.restless', 'parries', 'bloodcraft.casts' */
export type CountersState = Record<string, number>;
