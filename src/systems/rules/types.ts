/**
 * The Hollow Crown: systems types (Claude 3). Pure data, no Phaser.
 * - Hc*Base: shapes of the generated handoff imports (src/data/**\/hc/*.gen.ts)
 * - Stats, modifiers, procs and the Action language shared by spells, gear procs, tree nodes and enemy abilities
 * Proposed for core v2; until then systems import from here.
 */

// ───────────── enums ─────────────
import type { SchoolId } from '@/core/constants';
import type { CreatureTier, DamageKind, StatusApply, StatusId } from '@/core/hc';
export type { SchoolId };
/** Cross-agent contract types live in core (frozen v2). */
export type {
  CharacterSave, CombatantInfo, CombatService, CreatureTier, DamageKind, GearSlot, ItemInstance, SpawnRequest, StatusApply, StatusId,
} from '@/core/hc';
export type StyleId = 'cloth' | 'leather' | 'fur' | 'mail' | 'robe' | 'scale' | 'plate' | 'vestment';
export type Rarity = 'common' | 'fine' | 'ember' | 'runed' | 'wrought' | 'spark';
export type WeaponType = 'sword' | 'axe' | 'mace' | 'spear' | 'bow' | 'staff' | 'dagger' | 'wand';
export type ArmourPiece = 'helm' | 'chest' | 'hands' | 'feet';
export type BodyArch = 'quad' | 'slime' | 'skeleton' | 'humanoid' | 'spirit' | 'flyer' | 'plant' | 'construct' | 'bug';
export type ItemCat = 'potion' | 'food' | 'scroll' | 'gem' | 'material' | 'trinket' | 'tool' | 'relic';
export type TreeBranch = 'spells' | 'skills' | 'upgrades';

export const RARITY_ORDER: Rarity[] = ['common', 'fine', 'ember', 'runed', 'wrought', 'spark'];

// ───────────── generated handoff bases ─────────────
export interface HcMaterial { id: string; name: string; rarity: Rarity }
export interface HcWeaponBase {
  id: string; type: WeaponType; material: string; name: string; rarity: Rarity;
  /** handoff damage range at handoff ilvl */
  dmg: [number, number]; ilvl: number; value: number;
}
export interface HcArmourSet {
  id: string; school: SchoolId; style: StyleId; name: string; helm: string; rarity: Rarity; tier: number; lore: string;
  twoPiece: string; ability: { name: string; desc: string }; attuned: string;
  palette: { a: string[]; b: string[]; trim: string };
}
export interface HcArmourPiece {
  id: string; set: string; piece: ArmourPiece; slot: 'head' | 'chest' | 'hands' | 'feet'; name: string; rarity: Rarity;
  stats: { armor?: number; ember?: number; hp?: number }; ilvl: number; value: number;
}
export interface HcItemBase { id: string; cat: ItemCat; name: string; rarity: Rarity; desc: string; value: number }
export interface HcLegendaryBase {
  id: string; name: string; boss: string; bossName: string; region: string; slot: 'main' | 'ring' | 'amulet';
  base: string; fx: string; fxIndex: number; lore: string; value: number;
}
export interface HcCreatureBase {
  id: string; name: string; tier: CreatureTier; arch: BodyArch; scale: number; region: string;
  /** e.g. "Beast", "Rime", "Radiance · Umbral", "All schools" */
  element: string; hp: number; abilities: string[]; drops: string[]; lore: string;
}
export interface HcRealmBase { id: string; school: SchoolId | 'concord'; name: string; capital: string; landmark: string; desc: string }
export interface HcClassBase {
  id: string; name: string; epithet: string; school: SchoolId; role: string; tags: string[]; color: string;
  rating: { might: number; guard: number; arcana: number; speed: number }; difficulty: number; lore: string;
  abilities: { icon: string; name: string; desc: string }[];
}

// ───────────── stats ─────────────
export type StatKey =
  | 'hp' | 'ember' | 'stamina' | 'emberRegen' | 'hpRegen' | 'staminaRegen'
  | 'armor' | 'sp' | 'power' | 'crit' | 'critd' | 'moveSpeed' | 'atkSpeed' | 'cdr' | 'emberCost'
  | 'dmg' | 'spellDmg' | 'attackDmg' | 'healing' | 'healingTaken' | 'lifesteal' | 'block' | 'dmgTaken'
  | 'statusDur' | 'buffDur' | 'buffPower' | 'slowPower' | 'chains' | 'rootDur' | 'stunTaken'
  | 'xp' | 'gold' | 'itemFind' | 'bag' | 'potionHeal' | 'dashCharges' | 'lootRange' | 'maxMomentum' | 'ultCdr'
  | `dmg.${DamageKind}` | `resist.${DamageKind}`;

/**
 * flat: added to the base. pct: summed into an "increased" pool (×(1+Σ)). more: multiplied separately.
 * Fractions everywhere: crit 0.05 = 5%, moveSpeed 0.1 = +10%.
 */
export interface Modifier { stat: StatKey; op: 'flat' | 'pct' | 'more'; value: number; when?: Cond }

/** Evaluated at hit / tick time. */
export type Cond =
  | { c: 'hpBelow'; pct: number } | { c: 'hpAbove'; pct: number }
  | { c: 'targetHpAbove'; pct: number } | { c: 'targetHpBelow'; pct: number }
  | { c: 'targetHas'; status: StatusId } | { c: 'targetTier'; tiers: CreatureTier[] }
  | { c: 'targetFar'; px: number } | { c: 'alone'; px: number } | { c: 'inCombat' } | { c: 'stationary'; ms: number }
  | { c: 'weapon'; types: WeaponType[] } | { c: 'behind' } | { c: 'fromStealth' } | { c: 'momentum'; min: number };

// ───────────── statuses ─────────────

// ───────────── action language ─────────────
export interface Area {
  shape: 'circle' | 'cone' | 'line' | 'ring' | 'single';
  /** where it is centred: caster, current target / aim point */
  at: 'self' | 'target' | 'aim';
  r?: number; angle?: number; len?: number; width?: number;
}
export type Who = 'self' | 'target' | 'allies' | 'party' | 'area';
export type HitFlag = 'ignoreArmor' | 'alwaysCrit' | 'noProc' | 'knockback' | 'pull' | 'lifesteal' | 'taunt' | 'execute' | 'absorb' | 'launch';

export type Action =
  | { a: 'damage'; coef: number; kind?: DamageKind; area: Area; status?: StatusApply[]; flags?: HitFlag[]; maxTargets?: number }
  | {
      a: 'projectile'; coef: number; kind?: DamageKind; speed: number; range: number;
      count?: number; spread?: number; pierce?: boolean; bounce?: number; homing?: boolean; radius?: number;
      status?: StatusApply[]; flags?: HitFlag[]; onHit?: Action[]; visual?: string;
    }
  | { a: 'chain'; coef: number; kind?: DamageKind; jumps: number; range: number; status?: StatusApply[] }
  | { a: 'heal'; coef?: number; pctMax?: number; over?: number; to: Who; r?: number }
  | { a: 'shield'; pctMax: number; dur: number; to: Who; r?: number }
  | { a: 'buff'; id: string; dur: number; to: Who; r?: number; mods?: Modifier[]; charges?: number; procs?: Proc[]; flags?: BuffFlag[] }
  | { a: 'status'; status: StatusApply; area: Area; maxTargets?: number }
  | {
      a: 'move'; mode: 'dash' | 'leap' | 'blink' | 'behind' | 'charge';
      dist: number; iframes?: number; path?: Action[]; land?: Action[];
    }
  | { a: 'pull'; dist: number; area: Area } | { a: 'knock'; dist: number; area: Area }
  | {
      a: 'zone'; kind: 'field' | 'wall' | 'trap' | 'totem' | 'decoy'; area: Area; dur: number; tick?: number;
      each?: Action[]; trigger?: Action[]; blocksShots?: boolean; taunts?: boolean; visual?: string;
    }
  | { a: 'summon'; what: string; count: number; dur: number; power: number }
  | { a: 'resource'; ember?: number; stamina?: number; hpPct?: number; momentum?: number; to?: Who }
  | { a: 'cooldowns'; reduceMs: number | 'all'; to: Who; r?: number }
  | { a: 'cleanse'; to: Who }
  | { a: 'delay'; ms: number; then: Action[] }
  | { a: 'repeat'; n: number; every: number; then: Action[] }
  | { a: 'revive'; pctMax: number; r: number }
  | { a: 'steal'; gold: number; buffs: boolean; area: Area };

export type BuffFlag =
  | 'stealth' | 'untargetable' | 'invulnerable' | 'unstoppable' | 'parry' | 'nextHitsCrit' | 'nextHitsChain'
  | 'nextHitsTrue' | 'freeCasts' | 'freeDash' | 'reflect' | 'blockFront' | 'channel';

// ───────────── procs (gear sets, legendaries, tree, class mechanics) ─────────────
export type Trigger =
  | 'attack' | 'hit' | 'crit' | 'kill' | 'dash' | 'hurt' | 'cast' | 'lowHp' | 'block' | 'healed' | 'heal'
  | 'combo' | 'stealthHit' | 'parry' | 'ultimate' | 'potion';
export interface Proc {
  on: Trigger;
  /** fire on every Nth trigger */
  every?: number;
  /** internal cooldown ms */
  icd?: number;
  chance?: number;
  when?: Cond;
  do: Action[];
}

/** Everything a source (gear, set bonus, node, buff, kit) can contribute. */
export interface Passive {
  mods?: Modifier[];
  procs?: Proc[];
  /** named rule switches read directly by the sim (e.g. 'spellsCostHp', 'shatterFrozen') */
  hooks?: Hook[];
  /** spell tweaks from the Spells tree */
  spellMods?: SpellMod[];
}
export interface Hook { id: string; value?: number }

export interface SpellMod {
  /** spell id, or '*' for every spell */
  spell: string;
  dmg?: number; cost?: number; cd?: number; area?: number; dur?: number;
  echo?: number; twin?: boolean; split?: boolean; linger?: number; burst?: boolean;
}

// ───────────── spells & kits ─────────────
export interface HcSpell {
  id: string; name: string; desc: string; icon: string; school: SchoolId; kind: DamageKind;
  cost: number;
  /** seconds */
  cd: number;
  /** ms of wind-up (rooted); 0 = instant */
  castMs?: number;
  range: number;
  aim: 'enemy' | 'ally' | 'self' | 'ground' | 'direction';
  actions: Action[];
  tags: ('projectile' | 'area' | 'heal' | 'buff' | 'move' | 'summon' | 'control' | 'ultimate')[];
  /** pay with HP fraction instead of Ember */
  hpCost?: number;
}

export interface BasicAttack {
  form: 'melee' | 'ranged';
  /** ms between attacks at 0 attack speed */
  interval: number;
  range: number;
  /** melee arc in degrees */
  arc?: number;
  projectileSpeed?: number;
  /** damage multiplier per hit */
  coef: number;
  hits?: number;
  kind?: DamageKind;
  visual?: string;
}

export interface HcKit {
  classId: string;
  weapons: WeaponType[];
  /** weapon base id the class starts with (wood tier) */
  startWeapon: string;
  /** overrides the weapon type's basic attack */
  basic?: Partial<BasicAttack>;
  spells: [string, string, string];
  /** class-wide passive rules (the class mechanic) */
  passive: Passive;
  canBlock?: boolean;
}

// ───────────── skill tree ─────────────
export type NodeKind = 'root' | 'major' | 'minor' | 'choice' | 'top' | 'ult';
export interface TreeNode {
  id: string; branch: TreeBranch; kind: NodeKind; name: string; icon: string;
  x: number; y: number; size: number; maxRank: number;
  /** text per rank (index 0 = rank 1) */
  text: string[];
  /** contribution per rank (index 0 = rank 1); ranks are cumulative: rank r uses effects[r-1] */
  effects: Passive[];
  /** grants a spell at rank 1 */
  grantsSpell?: string;
  req: string[];
  /** any of req (true) or all of req (false) */
  reqAny?: boolean;
  /** mutually exclusive with */
  excludes?: string;
  free?: boolean;
  typeLabel: string;
  diamond?: boolean;
}

