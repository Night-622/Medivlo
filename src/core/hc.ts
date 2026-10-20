/**
 * Hollow Crown systems contract (cross-agent types only). Authored by Claude 3 (docs/systems/types-v2-proposal.ts,
 * frozen 2026-10-19), owned by Claude 1. Import from '@/core/hc'. Kept separate from core/types.systems.ts because
 * that file still holds the old Medival names (ItemInstance, Rarity…) used by GameState's legacy save slices and
 * re-exported from '@/core', so the Hollow Crown versions would clash there.
 * Content ids are the handoff's own (w_*, a_*, i_*, lg_*, bx_*, spell:*, class ids) and are validated with lookups
 * from '@/systems/rules', not the Registry.
 */
import type { SchoolId } from './constants';

export type DamageKind = SchoolId | 'physical';
/** Boss-arena set pieces (Claude 3, docs/systems/ARENA_HAZARDS.md). Rendered as snapshot objects (fx: ids, def 'hz:<kind>'); used via act systems/hazard { id }. */
export type HazardKind = 'anchor' | 'vent' | 'light' | 'pillar' | 'cover';
export interface HazardSpec { id: string; space: string; x: number; y: number; r: number; kind: HazardKind; charges?: number }
export type CreatureTier = 'enemy' | 'mini' | 'boss';
export type GearSlot = 'main' | 'off' | 'head' | 'chest' | 'hands' | 'feet' | 'ring1' | 'ring2' | 'amulet';
export type StatusId =
  | 'burn' | 'chill' | 'freeze' | 'shock' | 'bleed' | 'poison' | 'root' | 'stun' | 'blind' | 'mark'
  | 'sleep' | 'taunt' | 'slow' | 'knockdown' | 'confuse' | 'vulnerable' | 'weaken' | 'stealth' | 'linked' | 'doom';
export interface StatusApply { id: StatusId; dur?: number; chance?: number; power?: number }

/** One item stack / piece of gear. `base` is a handoff id (w_*, a_*, i_*, lg_*). */
/** Handoff gear tiers (rules/types.ts Rarity mirrors this; the v1 `Rarity` in types.systems is a different set). */
export type HcRarity = 'common' | 'fine' | 'ember' | 'runed' | 'wrought' | 'spark';

/**
 * One item. The deeper-builds fields (docs/systems/BUILDS.md) are all optional, so old saves and stackables stay
 * valid: an item without `rarity` keeps its base's rarity, with no affixes.
 */
export interface ItemInstance {
  uid: string; base: string; ilvl: number; qty: number;
  /** legacy single gem: read-only, migrated to `sockets` on load */
  gem?: string;
  /** rolled per drop (absent = the base's rarity) */
  rarity?: HcRarity;
  /** rolled affixes: affix id + value */
  affixes?: { id: string; v: number }[];
  /** socketed gem ids (null = an empty socket); the count follows the rarity */
  sockets?: (string | null)[];
  /** Runeforge upgrade level, 0–5 */
  upgrade?: number;
  /** Runeforge element imbue */
  imbue?: SchoolId;
  /** a unique / legendary effect id carried by this item (it can be moved at the Runeforge) */
  uniqueFx?: string;
}

/** The player's own character (saved by their client into GameState v2 `character`; sent as `loadout`). */
export interface CharacterSave {
  classId: string;
  body: 0 | 1;
  level: number;
  xp: number;
  /** Embershards */
  gold: number;
  inventory: ItemInstance[];
  equipment: Partial<Record<GearSlot, ItemInstance>>;
  /** cosmetic option indexes (0 = class default); headwear 0 class, 1 none, 2 alt */
  cosmetics: { back: number; neck: number; face: number; extra: number; dye: number; headwear: number };
  /** skill tree ranks by node id (sp_*, sk_*, up_*) */
  tree: Record<string, number>;
  /** skill points from quests (level points are derived) */
  bonusPoints: number;
  /** spell ids bound to keys 1–4 */
  hotbar: [string | null, string | null, string | null, string | null];
  /** legendary ids already dropped for this character */
  legendariesSeen: string[];
  /** last woken waystone id */
  waystone: string | null;
  /** spell runes: spell id → rune item uids slotted in it (the rune items stay in the inventory) */
  runes?: Record<string, string[]>;
  /** the one off-school spell taught by a tome */
  tomeSpell?: string;
  /** one free respec (granted when the perk tree changes) */
  freeRespec?: boolean;
  /** build data version (2 = deeper builds: perk tree + runes); older saves are migrated on load */
  buildVersion?: number;
}

/** Services.combat — registered by Claude 3 on the authority only. */
export interface SpawnRequest {
  creature: string; level: number; space: string; x: number; y: number;
  zoneId?: string; tier?: CreatureTier; ally?: boolean; dormant?: boolean;
  /** champion: true = random affixes, or explicit affix ids (Claude 3, docs/PACING.md) */
  elite?: boolean | string[];
  /** waypoints walked (looping) while idle */
  patrol?: { x: number; y: number }[];
  /** walks with this player, or with the nearest party member ('party'); follows through doors/space changes */
  follow?: string | 'party';
  /** an escorted NPC: allied, non-combatant by default, revivable, reports arrival/loss (Claude 3) */
  escort?: {
    /** NpcDef id: sprite (npcTexture) and nameplate come from the NPC; omit to use the creature's body and name */
    npc?: string;
    /** where it is going; arrival = inside r (px) in that space */
    toMarker?: { space: string; x: number; y: number; r: number };
    /** times it can be revived after falling (default 1) */
    revives?: number;
    /** HP as a multiple of a mini of its level (default 0.5) */
    hp?: number;
    /** does it hit back (default false) */
    fights?: boolean;
  };
}
export interface CombatantInfo {
  id: string; kind: 'player' | 'enemy' | 'pet'; def: string; space: string; x: number; y: number;
  hp: number; maxHp: number; level: number; downed?: boolean; playerId?: string;
}
export interface CombatService {
  spawn(req: SpawnRequest): string;
  despawn(id: string): void;
  damage(targetId: string, amount: number, kind: DamageKind, sourceId?: string): void;
  heal(targetId: string, amount: number): void;
  applyStatus(targetId: string, status: StatusApply): void;
  entitiesNear(space: string, x: number, y: number, r: number, kinds?: CombatantInfo['kind'][]): CombatantInfo[];
  players(): CombatantInfo[];
  setFrozen(frozen: boolean): void;
  /** Boss-arena set pieces (optional until Claude 3's sim implements them; callers use ?.) */
  addHazard?(h: HazardSpec): void;
  removeHazard?(id: string): void;
}

