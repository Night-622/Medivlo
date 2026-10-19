/**
 * Simulation state (Claude 3): plain-data entities owned by the authority. No Phaser, no DOM.
 * Every entity has a stable id and lives in one world `space`.
 */
import type { Compiled } from '@/systems/rules/stats';
import type { CreatureDef } from '@/systems/rules/creatures';
import type {
  Action, Area, BuffFlag, SchoolId, CharacterSave, CreatureTier, DamageKind, HcKit, HcSpell, HitFlag, Modifier, Proc, StatusApply,
  StatusId, WeaponType,
} from '@/systems/rules/types';
import type { CreatureAbility } from '@/data/enemies/hc/abilities';

export interface Vec { x: number; y: number }

export interface StatusInst {
  id: StatusId;
  until: number;
  power: number;
  sourceId: string;
  /** dot snapshot: damage per second */
  dps: number;
  kind: DamageKind;
  stacks: number;
  nextTick: number;
}

export interface BuffInst {
  id: string;
  until: number;
  sourceId: string;
  mods: Modifier[];
  procs: Proc[];
  flags: BuffFlag[];
  charges?: number;
}

export type Team = 'players' | 'enemies';

export interface Combatant {
  id: string;
  kind: 'player' | 'enemy' | 'pet';
  def: string;
  space: string;
  x: number; y: number;
  r: number;
  face: Vec;
  team: Team;
  level: number;
  hp: number; maxHp: number;
  shield: number; shieldUntil: number;
  statuses: Map<StatusId, StatusInst>;
  buffs: BuffInst[];
  /** base passives compiled (gear, tree, kit / creature); buffs are layered at read time */
  base: Compiled;
  /** base + buffs, rebuilt when buffs change */
  stats: Compiled;
  statsDirty: boolean;
  dead: boolean;
  /** threat per attacker id (enemies) */
  threat: Map<string, number>;
  /** per-proc counters and internal cooldowns, keyed by proc identity */
  procCount: Map<Proc, number>;
  procReadyAt: Map<Proc, number>;
  inCombatUntil: number;
  movedAt: number;
  anim: string;
  animUntil: number;
  /** forced movement (dash / leap / knockback) */
  motion: { vx: number; vy: number; until: number; iframes: boolean; path?: Action[]; pathCast?: CastCtx; hitIds?: Set<string>; land?: Action[] } | null;
  /** cast / ability wind-up in progress */
  windup: { until: number; then: () => void; label: string } | null;
  /** bosses: no new hard control until then */
  ccImmuneUntil: number;
  /** Thick Skin and similar once-per-window effects */
  lastHalvedAt: number;
}

export interface PlayerEnt extends Combatant {
  kind: 'player';
  playerId: string;
  school: SchoolId;
  save: CharacterSave;
  kit: HcKit;
  weapon: { type: WeaponType; min: number; max: number; offMin: number; offMax: number };
  spells: Map<string, HcSpell>;
  ember: number; emberMax: number;
  stamina: number; staminaMax: number;
  momentum: number;
  dashCharges: number; dashReadyAt: number;
  cds: Map<string, number>;
  attackReadyAt: number;
  potionReadyAt: { q: number; e: number };
  target: string | null;
  aim: Vec;
  move: Vec;
  buttons: number;
  lastSeq: number;
  downed: { until: number; revive: number; reviver: string | null } | null;
  respawnAt: number;
  stealth: boolean;
  duelWith: string | null;
  spawnProtectUntil: number;
  attackCount: number;
  /** last creature/player that damaged us (Death screen) */
  lastHitBy: string | null;
}

export interface EnemyEnt extends Combatant {
  kind: 'enemy' | 'pet';
  cdef: CreatureDef;
  tier: CreatureTier;
  dmg: number;
  armor: number;
  zoneId?: string;
  home: Vec;
  ai: 'idle' | 'engage' | 'return' | 'flee' | 'dormant' | 'follow';
  targetId: string | null;
  attackReadyAt: number;
  abilityReadyAt: Map<CreatureAbility, number>;
  phase: number;
  revived: boolean;
  /** nemesis bosses stop at 1 HP and wait for the story to spare or destroy them */
  yielded: boolean;
  /** interludes already run (boss: one per phase change; mini: one at half HP) */
  interludes: number;
  /** elite affix ids (champion creature) */
  elite?: string[];
  /** escorted NPC state (sim/escort.ts) */
  escort?: import('./escort').EscortState;
  /** rolled once: this creature goes for escorts first */
  huntsEscort?: boolean;
  /** side (+1 / -1) this creature last stepped around an obstacle */
  steer?: number;
  /** patrol route walked while idle (loops) */
  patrol?: Vec[];
  patrolI?: number;
  summonerId?: string;
  /** player-owned pets / scripted allies */
  ownerId?: string;
  /** cosmetic story pet (its gift flag): follows, never fights, cannot be hurt */
  storyPet?: string;
  expiresAt?: number;
  path: Vec[];
  pathAt: number;
}

export interface CastCtx {
  caster: Combatant;
  spellId?: string;
  kind: DamageKind;
  /** damage per 1.0 coef */
  power: number;
  isSpell: boolean;
  target: Combatant | null;
  aim: Vec;
  dir: Vec;
  dmgMult: number;
  areaMult: number;
  durMult: number;
  flags: HitFlag[];
  depth: number;
}

export interface ProjectileEnt {
  id: string; space: string; x: number; y: number; vx: number; vy: number; travelled: number; range: number; radius: number;
  coef: number; kind: DamageKind; status?: StatusApply[]; flags: HitFlag[]; onHit?: Action[];
  pierce: boolean; bounce: number; homing: string | null; hit: Set<string>; cast: CastCtx; visual: string; team: Team; dead: boolean;
}

export interface ZoneEnt {
  id: string; space: string; kind: 'field' | 'wall' | 'trap' | 'totem' | 'decoy' | 'telegraph'; visual: string;
  x: number; y: number; area: Area; dir: Vec; until: number; tick: number; nextTick: number;
  each?: Action[]; trigger?: Action[]; blocksShots: boolean; taunts: boolean; cast: CastCtx; team: Team; dead: boolean;
}

export interface LootEnt {
  id: string; space: string; x: number; y: number;
  item?: { base: string; ilvl: number; qty: number; gem?: string };
  gold?: number;
  /** only this player may pick it up until `lockUntil` (PvP gold piles) */
  lockTo?: string; lockUntil?: number;
  expiresAt: number;
}

export const newCombatantBase = (): Pick<Combatant, 'ccImmuneUntil' | 'lastHalvedAt' | 'statuses' | 'buffs' | 'threat' | 'procCount' | 'procReadyAt' | 'statsDirty' | 'dead' | 'shield' | 'shieldUntil' | 'inCombatUntil' | 'movedAt' | 'anim' | 'animUntil' | 'motion' | 'windup'> => ({
  ccImmuneUntil: 0, lastHalvedAt: -1e9, statuses: new Map(), buffs: [], threat: new Map(), procCount: new Map(), procReadyAt: new Map(), statsDirty: true, dead: false,
  shield: 0, shieldUntil: 0, inCombatUntil: 0, movedAt: 0, anim: 'idle', animUntil: 0, motion: null, windup: null,
});
