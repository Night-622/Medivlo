/**
 * Combat / progression contracts. Authored by Claude 3 (docs/systems/SYSTEMS.md), owned by Claude 1.
 * Request changes by message. `CombatCondition` is the combat-side condition, distinct from the
 * world/narrative `CombatCondition` in types.ts.
 */
import type { BaseDef, Tier } from '../../src/core/types';

// ───────────────────────── ids ─────────────────────────
export type ClassId = `class:${string}`;
export type TraitId = `trait:${string}`;
export type ItemId = `item:${string}`;
export type SpellId = `spell:${string}`; // spells AND martial powers
export type SkillTreeId = `skilltree:${string}`; // prefix must match ContentKind
export type EnemyId = `enemy:${string}`;
export type LootTableId = `loot:${string}`;
export type AffixId = `affix:${string}`;
export type SetId = `set:${string}`;
export type RecipeId = `recipe:${string}`;

export type TemperId = 'cinderglass' | 'wardwood' | 'lumen-silver' | 'drowned-silver';

// ───────────────────── stats & damage ─────────────────────
export type AttributeId = 'might' | 'finesse' | 'vigor' | 'intellect' | 'will';

export type PhysicalDamage = 'slash' | 'pierce' | 'blunt';
export type ElementalDamage = 'fire' | 'frost' | 'lightning';
export type DamageType = PhysicalDamage | ElementalDamage | 'radiant' | 'shadow' | 'poison';

/** Statuses filled by buildup meters (Souls-style) */
export type BuildupStatus = 'bleed' | 'burn' | 'frozen' | 'shock' | 'poison';
/** Statuses applied directly by abilities/effects */
export type DirectStatus =
  | 'chill' | 'stagger' | 'weaken' | 'vulnerable' | 'root' | 'slow' | 'silence'
  | 'blind' | 'fear' | 'haste' | 'regen' | 'ward' | 'stealth' | 'exposed' | 'cinderlung';
export type StatusId = BuildupStatus | DirectStatus;

export type MagicSchool = 'ash' | 'rime' | 'storm' | 'radiance' | 'umbral' | 'verdant';
export type PowerDiscipline = 'martial' | 'archery' | 'shadowcraft' | 'bloodcraft' | 'ashmark';

export type ScalingGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'E';

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

export type ModifierOp =
  | 'flat'      // +N added to base
  | 'increased' // +N% additive with all other 'increased' on the same stat
  | 'more';     // ×(1+N%) multiplicative, each source separately

export interface StatModifier {
  stat: StatId;
  op: ModifierOp;
  /** flat: absolute value; increased/more: fraction (0.15 = 15%). Negative = drawback */
  value: number;
  condition?: CombatCondition;
}

export interface DamageRoll {
  type: DamageType;
  min: number;
  max: number;
}

// ───────────────────── conditions & effects ─────────────────────
export type CombatCondition =
  | { kind: 'hpBelow'; pct: number }
  | { kind: 'hpAbove'; pct: number }
  | { kind: 'timeOfDay'; phase: 'day' | 'night' }
  | { kind: 'inCombat'; value: boolean }
  | { kind: 'inStealth' }
  | { kind: 'targetFamily'; family: EnemyFamily }
  | { kind: 'targetVariant'; variant: EnemyVariant }
  | { kind: 'targetRank'; rank: EnemyRank }
  | { kind: 'targetHasStatus'; status: StatusId }
  | { kind: 'selfHasStatus'; status: StatusId }
  | { kind: 'weaponFamily'; family: WeaponFamily }
  | { kind: 'armorWeight'; weight: ArmorWeight }
  | { kind: 'school'; school: MagicSchool }
  | { kind: 'flag'; flag: string; equals?: boolean | number | string }
  | { kind: 'all'; of: CombatCondition[] }
  | { kind: 'any'; of: CombatCondition[] };

export type Trigger =
  | 'onHit' | 'onCrit' | 'onKill' | 'onBlock' | 'onParry' | 'onDodge'
  | 'onHurt' | 'onCast' | 'onStatusApplied' | 'onLowHp' | 'onRest';

export type HookParams = Record<string, number | string | boolean>;

/**
 * Everything that changes a character funnels through EffectDef:
 * traits, skill nodes, item uniques, set bonuses, spell upgrades, glyphs.
 * 'hook' is the escape hatch for bespoke behaviour implemented in
 * src/systems/effects/hooks.ts and referenced by name from data.
 */
export type EffectDef =
  | { kind: 'modifier'; mod: StatModifier }
  | { kind: 'grantAbility'; spell: SpellId }
  | {
      kind: 'applyStatus';
      trigger: Trigger;
      status: StatusId;
      target: 'self' | 'target' | 'area';
      chance?: number;      // 0..1, default 1
      buildup?: number;     // for BuildupStatus: meter points added
      durationMs?: number;  // for DirectStatus
      magnitude?: number;
    }
  | { kind: 'hook'; hook: string; params?: HookParams }
  | { kind: 'proficiency'; weapon?: WeaponFamily; armor?: ArmorWeight }
  | { kind: 'dialogueTag'; tag: string }; // read by Claude 4's dialogue conditions

// ───────────────────── classes ─────────────────────
export interface ClassResourceDef {
  id: string;            // 'resolve' | 'focus' | 'attunement' | 'fury' | 'venom' | 'devotion'
  name: string;
  max: number;
  decayPerSec: number;
  decayDelayMs: number;
  gains: { trigger: Trigger; amount: number }[];
  /** passive per-point bonus, e.g. Resolve: +0.2% damage reduction per point */
  perPoint?: StatModifier[];
}

export interface SubclassDef {
  id: string;            // 'bulwark'
  name: string;
  description: string;
  unlockLevel: number;   // 15
  tree: SkillTreeId;
}

export interface ClassDef extends BaseDef {
  kind?: 'class';
  id: ClassId;
  name: string;
  tagline: string;
  description: string;
  phase: 1 | 2 | 3;
  primaryAttributes: AttributeId[];
  baseAttributes: Record<AttributeId, number>; // sums to 55
  resource: ClassResourceDef;
  proficiencies: { weapons: WeaponFamily[]; armor: ArmorWeight[] };
  startingItems: { item: ItemId; qty?: number; equip?: boolean; loadout?: 0 | 1 }[];
  startingAbilities: SpellId[];
  tree: SkillTreeId;
  subclasses: SubclassDef[];
  /** placeholder art tint until Phase 3 sprites */
  color: string;
  codexEntry?: string; // Claude 4 lore id
}

// ───────────────────── traits ─────────────────────
export type EarnRequirement =
  | { kind: 'counter'; counter: string; atLeast: number } // GameState counters, e.g. 'kills.family.undead'
  | { kind: 'flag'; flag: string; equals?: boolean | number | string }
  | { kind: 'level'; atLeast: number };

export interface TraitDef extends BaseDef {
  kind?: 'trait';
  id: TraitId;
  name: string;
  description: string;
  source: 'creation' | 'ancestry' | 'earned' | 'story';
  phase: 1 | 2 | 3;
  /** shown green in UI */
  boons: EffectDef[];
  /** shown red in UI; may be empty for earned traits */
  drawbacks: EffectDef[];
  exclusiveWith?: TraitId[];
  requirement?: EarnRequirement; // earned traits only
  hidden?: boolean;              // not listed until earned
}

// ───────────────────── items ─────────────────────
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'set';

export type EquipSlot =
  | 'mainHand' | 'offHand' | 'head' | 'chest' | 'hands' | 'legs' | 'feet'
  | 'cloak' | 'amulet' | 'ring1' | 'ring2' | 'belt' | 'trinket';

export type WeaponFamily =
  | 'sword' | 'greatsword' | 'axe' | 'greataxe' | 'mace' | 'warhammer'
  | 'spear' | 'dagger' | 'bow' | 'crossbow' | 'staff' | 'wand';

export type OffhandFamily = 'shield' | 'tome' | 'talisman' | 'quiver';
export type ArmorWeight = 'light' | 'medium' | 'heavy';

export type ItemKind =
  | 'weapon' | 'offhand' | 'armor' | 'accessory'
  | 'consumable' | 'material' | 'glyph' | 'tome' | 'schematic' | 'quest' | 'key';

/** Which affix pools an item may roll from */
export type AffixTag =
  | 'weapon' | 'melee' | 'ranged' | 'caster' | 'shield' | 'armor' | 'jewelry'
  | 'head' | 'chest' | 'hands' | 'legs' | 'feet' | 'cloak' | 'belt';

export interface ProjectileDef {
  speed: number;        // px/s
  rangePx: number;
  radius: number;
  pierce: number;       // extra targets passed through
  count?: number;       // default 1
  spreadDeg?: number;
  homingDegPerSec?: number;
  color: string;        // placeholder visual
}

export interface WeaponStats {
  family: WeaponFamily;
  hands: 1 | 2;
  damage: DamageRoll[];
  scaling: Partial<Record<AttributeId, ScalingGrade>>;
  attacksPerSec: number;   // light-attack cadence before attackSpeed
  reachPx: number;
  arcDeg: number;          // melee sweep; 0 for ranged
  poiseDamage: number;
  staminaCost: number;
  critChance?: number;     // added to base
  buildup?: Partial<Record<BuildupStatus, number>>;
  projectile?: ProjectileDef; // bows, crossbows, staves, wands
  moveset: string;         // key into src/systems/combat/movesets.ts
}

export interface OffhandStats {
  family: OffhandFamily;
  /** shields: % of physical damage blocked; elemental via resist */
  blockPhysical?: number;
  blockResist?: Partial<Record<DamageType, number>>;
  stability?: number;      // 0..100, lowers stamina cost of blocking
  parryable?: boolean;
  modifiers?: StatModifier[];
  projectileOverride?: { damage: DamageRoll[]; buildup?: Partial<Record<BuildupStatus, number>> }; // quivers
}

export interface ArmorStats {
  weight: ArmorWeight;
  armor: number;
  poise: number;
  equipWeight: number;
  resist?: Partial<Record<DamageType, number>>;
}

export interface ConsumableDef {
  useTimeMs: number;
  cooldownMs: number;
  effects: EffectDef[];
  heal?: { pct?: number; flat?: number; overMs?: number };
  restore?: { stamina?: number; mana?: number };
  thrown?: { projectile: ProjectileDef; radius: number; damage?: DamageRoll[] };
  durationMs?: number;     // buffs, oils, food
  category: 'potion' | 'oil' | 'bomb' | 'food' | 'scroll' | 'tome-of-unlearning';
}

export interface GlyphDef {
  /** spell must have at least one of these tags */
  appliesTo: SpellTag[];
  mods: SpellModifier[];
}

export interface ItemDef extends BaseDef {
  kind?: 'item';
  id: ItemId;
  name: string;
  description: string;
  flavor?: string;
  itemKind: ItemKind;
  /** base rarity; non-unique gear is re-rolled at drop time */
  rarity: Rarity;
  itemLevel: number;          // base level band; drops use monster level instead
  slot?: EquipSlot | 'ring';
  stack?: number;             // max stack, default 1
  value: number;              // gold
  requirements?: Partial<Record<AttributeId, number>> & { level?: number };
  weapon?: WeaponStats;
  offhand?: OffhandStats;
  armor?: ArmorStats;
  consumable?: ConsumableDef;
  teaches?: SpellId;          // itemKind: 'tome'
  recipe?: RecipeId;          // itemKind: 'schematic'
  glyph?: GlyphDef;           // itemKind: 'glyph'
  implicit?: StatModifier[];  // always-on
  unique?: EffectDef[];       // legendary build-defining effects
  set?: SetId;
  affixTags?: AffixTag[];
  maxAffixes?: number;        // overrides rarity default
  upgradeable?: boolean;
  icon: { shape: 'blade' | 'axe' | 'blunt' | 'bow' | 'staff' | 'shield' | 'armor' | 'ring' | 'potion' | 'book' | 'gem' | 'misc'; color: string };
  tags?: string[];
}

export interface AffixDef {
  id: AffixId;
  name: string;               // 'Searing' (prefix) / 'of the Bear' (suffix)
  position: 'prefix' | 'suffix';
  tags: AffixTag[];           // where it may roll
  stat: StatId;
  op: ModifierOp;
  weight: number;
  /** tier i unlocks at minItemLevel; value rolled uniformly in [min,max] */
  tiers: { minItemLevel: number; min: number; max: number }[];
  group?: string;             // max one affix per group per item
}

export interface SetDef {
  id: SetId;
  name: string;
  pieces: ItemId[];
  bonuses: { pieces: number; effects: EffectDef[] }[];
}

/** UI display names (lore): Common, Fine, Ember-touched, Runed, Wrought, Sparkforged */
export const RARITY_NAMES: Record<Rarity, string> = {
  common: 'Common', uncommon: 'Fine', rare: 'Ember-touched', epic: 'Runed', legendary: 'Wrought', set: 'Sparkforged',
};

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

export interface RecipeDef {
  id: RecipeId;
  station: 'forge' | 'alchemy' | 'runeforge';
  inputs: { item: ItemId; qty: number }[];
  gold?: number;
  output: { item: ItemId; qty?: number; guaranteedAffix?: AffixId };
  learnedByDefault?: boolean;
}

// ───────────────────── spells & powers ─────────────────────
export type SpellTag =
  | 'projectile' | 'area' | 'melee' | 'channel' | 'dot' | 'movement'
  | 'summon' | 'buff' | 'heal' | 'curse' | 'chain' | 'aura' | 'trap';

export type SpellDelivery =
  | { kind: 'projectile'; projectile: ProjectileDef }
  | { kind: 'melee'; arcDeg: number; reachPx: number; weaponScaled: boolean }
  | { kind: 'cone'; angleDeg: number; rangePx: number }
  | { kind: 'area'; radius: number; rangePx: number; delayMs: number; durationMs?: number; tickMs?: number }
  | { kind: 'chain'; jumps: number; jumpRadius: number; rangePx: number }
  | { kind: 'dash'; distancePx: number; damageOnPath: boolean }
  | { kind: 'aura'; radius: number; durationMs: number }
  | { kind: 'self' }
  | { kind: 'summon'; ally: EnemyId; count: number; durationMs: number };

export type SpellModifier =
  | { kind: 'damageMult'; value: number }
  | { kind: 'costMult'; value: number }
  | { kind: 'cooldownMult'; value: number }
  | { kind: 'castTimeMult'; value: number }
  | { kind: 'extraProjectiles'; value: number; spreadDeg: number }
  | { kind: 'pierce'; value: number }
  | { kind: 'areaMult'; value: number }
  | { kind: 'durationMult'; value: number }
  | { kind: 'extraChains'; value: number }
  | { kind: 'convert'; from: DamageType | 'all'; to: DamageType; pct: number }
  | { kind: 'echo'; delayMs: number; damageMult: number }
  | { kind: 'addBuildup'; status: BuildupStatus; value: number }
  | { kind: 'effect'; effect: EffectDef };

export interface SpellUpgradeChoice {
  id: string;
  name: string;
  description: string;
  mods: SpellModifier[];
}

export interface SpellRankDef {
  masteryXp: number;          // mastery needed to reach this rank (rank 1 = 0)
  essenceCost?: { item: ItemId; qty: number }; // ranks 4–5
  damageMult: number;         // cumulative vs rank 1
  glyphSockets: number;
  /** pick one; empty for plain ranks */
  choices: SpellUpgradeChoice[];
}

export interface SpellDef extends BaseDef {
  kind?: 'spell';
  id: SpellId;
  name: string;
  description: string;
  abilityKind: 'spell' | 'power';
  school?: MagicSchool;        // spells
  discipline?: PowerDiscipline; // powers
  phase: 1 | 2 | 3;
  requirements?: Partial<Record<AttributeId, number>> & { level?: number; classes?: ClassId[] };
  cost: { mana?: number; stamina?: number; health?: number; resource?: number };
  cooldownMs: number;
  castTimeMs: number;          // 0 = instant
  canMoveWhileCasting: boolean;
  targeting: 'direction' | 'point' | 'self';
  delivery: SpellDelivery;
  damage?: DamageRoll[];       // base at rank 1, scaled by P(level of caster) — see SYSTEMS §2.3
  weaponDamagePct?: number;    // powers: % of equipped weapon hit instead of damage[]
  scaling: Partial<Record<AttributeId, ScalingGrade>>;
  heal?: { flat: number; scaling: Partial<Record<AttributeId, ScalingGrade>> };
  poiseDamage?: number;
  buildup?: Partial<Record<BuildupStatus, number>>;
  effects: EffectDef[];
  tags: SpellTag[];
  ranks: SpellRankDef[];       // length 5
  vfx: { color: string; shape: 'orb' | 'bolt' | 'ring' | 'arc' | 'beam' | 'burst' };
}

// ───────────────────── skill trees ─────────────────────
export type SkillNodeType = 'minor' | 'notable' | 'ability' | 'keystone';

export interface SkillNodeDef {
  id: string;                  // local to the tree, e.g. 'shield-wall'
  name: string;
  description: string;
  type: SkillNodeType;
  tier: 1 | 2 | 3 | 4 | 5;
  branch: string;              // 'shield' | 'blade' | 'command' …
  maxRank: number;
  costPerRank: number;
  /** effects at rank 1; 'modifier' values are multiplied by current rank */
  effects: EffectDef[];
  requiresAll?: string[];
  requiresAny?: string[];
  /** only one node per group may be taken (keystones) */
  exclusiveGroup?: string;
  pos: { col: number; row: number }; // UI grid
}

export interface SkillTreeDef extends BaseDef {
  kind?: 'skilltree';
  id: SkillTreeId;
  name: string;
  description: string;
  treeKind: 'class' | 'subclass';
  owner: ClassId;
  /** points spent in this tree required to unlock tier i+1 */
  tierThresholds: [number, number, number, number, number];
  nodes: SkillNodeDef[];
}

// ───────────────────── enemies ─────────────────────
/** In-world families (Claude 4 lore). 'hollowed' is a variant, not a family. */
export type EnemyFamily = 'beast' | 'folk' | 'restless' | 'wrought' | 'thornkin' | 'cinderdrake' | 'unwrought';
export type EnemyVariant = 'hollowed';
export type EnemyArchetype =
  | 'brute' | 'skirmisher' | 'archer' | 'caster' | 'swarm' | 'charger'
  | 'shieldbearer' | 'summoner' | 'ambusher' | 'support' | 'boss';
export type EnemyRank = 'minion' | 'normal' | 'elite' | 'champion' | 'boss';
export type DangerTier = Tier;

export interface EnemyAttackDef {
  id: string;
  name: string;
  kind: 'melee' | 'projectile' | 'area' | 'charge' | 'spell';
  spell?: SpellId;
  damageMult: number;          // × enemy base damage
  damageTypes: Partial<Record<DamageType, number>>; // split, sums to 1
  windupMs: number;            // ≥250 (≥400 for heavy) — telegraph rule
  activeMs: number;
  recoveryMs: number;
  cooldownMs: number;
  rangePx: number;
  arcDeg?: number;
  projectile?: ProjectileDef;
  radius?: number;
  poiseDamage: number;
  buildup?: Partial<Record<BuildupStatus, number>>;
  weight: number;              // selection weight when several are valid
  telegraph: 'flash' | 'ring' | 'line' | 'cone';
  unblockable?: boolean;
  minPhase?: number;           // bosses
}

export interface AiProfile {
  perceptionPx: number;
  fovDeg: number;
  hearingPx: number;
  aggression: number;          // 0..1 — how eagerly it takes attack tokens
  preferredRangePx: [number, number];
  behaviors: string[];         // keys into src/systems/ai/behaviors.ts
  fleeBelowHp?: number;        // 0..1
  callForHelpPx?: number;
  dodgeChance?: number;        // vs telegraphed player heavies/spells
}

export interface BossPhaseDef {
  atHpPct: number;             // enter phase when hp <= this
  modifiers: StatModifier[];
  summon?: { enemy: EnemyId; count: number };
  message?: string;            // banner text
}

export interface EnemyDef extends BaseDef {
  kind?: 'enemy';
  id: EnemyId;
  name: string;
  family: EnemyFamily;
  variant?: EnemyVariant;       // Hollowed: Mire-touched version of a beast/folk
  archetype: EnemyArchetype;
  rank: EnemyRank;
  phase: 1 | 2 | 3;
  /** level-1 values; scaled by balance curves at spawn level */
  base: { hp: number; damage: number; armor: number; poise: number; moveSpeed: number };
  xpMult?: number;             // default from rank
  resist: Partial<Record<DamageType, number>>;
  statusResist: Partial<Record<BuildupStatus, number>>; // meter size multiplier bonus
  immune: StatusId[];
  attacks: EnemyAttackDef[];
  ai: AiProfile;
  loot: LootTableId;
  radius: number;
  appearance: { shape: 'circle' | 'square' | 'triangle' | 'diamond'; color: string; scale: number };
  allowedTiers?: DangerTier[];
  canBeElite?: boolean;
  phases?: BossPhaseDef[];
  /** boss can be purged with the Ashmark instead of killed (sets this flag) */
  cleansable?: { atHpPct: number; flag: string; value: string }; // e.g. prologue.stag_fate = 'cleansed'
  tags?: string[];
  codexEntry?: string;
}

export interface EliteAffixDef {
  id: string;                  // 'vampiric'
  name: string;
  minTier: DangerTier;
  modifiers: StatModifier[];
  effects: EffectDef[];
}

// ───────────────────── loot ─────────────────────
export interface ItemFilter {
  kinds?: ItemKind[];
  slots?: (EquipSlot | 'ring')[];
  weaponFamilies?: WeaponFamily[];
  tags?: string[];
  /** bias toward the player's class proficiencies (smart loot) */
  smart?: number;              // 0..1
}

export type LootEntry = { weight: number; conditions?: CombatCondition[] } & (
  | { kind: 'item'; item: ItemId; qty?: [number, number]; rarity?: Rarity | 'roll' }
  | { kind: 'random'; filter: ItemFilter; rarity?: Rarity | 'roll' }
  | { kind: 'table'; table: LootTableId }
  | { kind: 'nothing' }
);

export interface LootTable {
  id: LootTableId;
  rolls: number | [number, number];
  entries: LootEntry[];
  guaranteed?: LootEntry[];
  /** gold at level 1; scaled by goldCurve(level) */
  gold?: [number, number];
  /** multiplies the rare+ rarity weights for 'roll' entries */
  rarityBoost?: number;
}

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
  choices: string[];          // SpellUpgradeChoice ids taken
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
