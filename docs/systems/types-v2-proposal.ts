/**
 * FROZEN 2026-10-19 — Claude 3 systems contract for core v2 (The Hollow Crown).
 *
 * Only the CROSS-AGENT types go into core. Mechanics types (Action, Passive, HcSpell, TreeNode, stats…) stay in
 * src/systems/rules/types.ts (Claude 3's folder) because no other agent reads them.
 *
 * Content ids: systems content is NOT in the Registry. Ids are the handoff's own ids and are checked with the
 * lookups exported from '@/systems/rules' (itemInfo, creature, spellDef, classDisplay):
 *   items      w_<type>_<material> · a_<school>_<style>_<piece> · i_<name> · lg_<boss>
 *   creatures  bx_<name>  (e.g. bx_wolf, bx_stag, bx_ash_5)
 *   spells     spell:<slug>
 *   classes    warden … skald (core CLASS_SCHOOL keys)
 * So the old systems kinds (class, trait, item, spell, skilltree, enemy, loot, affix, set, recipe) can leave
 * ContentDefs when the old Medival systems move to archive/medival-v1/.
 *
 * SchoolId comes from core/constants (already in core).
 */
import type { SchoolId } from '@/core/constants';

export type DamageKind = SchoolId | 'physical';
export type CreatureTier = 'enemy' | 'mini' | 'boss';
export type GearSlot = 'main' | 'off' | 'head' | 'chest' | 'hands' | 'feet' | 'ring1' | 'ring2' | 'amulet';
export type StatusId =
  | 'burn' | 'chill' | 'freeze' | 'shock' | 'bleed' | 'poison' | 'root' | 'stun' | 'blind' | 'mark'
  | 'sleep' | 'taunt' | 'slow' | 'knockdown' | 'confuse' | 'vulnerable' | 'weaken' | 'stealth' | 'linked' | 'doom';
export interface StatusApply { id: StatusId; dur?: number; chance?: number; power?: number }

/** One item stack / piece of gear. `base` is a handoff id (w_*, a_*, i_*, lg_*). */
export interface ItemInstance { uid: string; base: string; ilvl: number; qty: number; gem?: string }

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
}

/** Services.combat — registered by Claude 3 on the authority only. */
export interface SpawnRequest {
  creature: string; level: number; space: string; x: number; y: number;
  zoneId?: string; tier?: CreatureTier; ally?: boolean; dormant?: boolean;
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
}

/**
 * Event payload notes (already added by Claude 1):
 * - enemy:spawn-request → please change to SpawnRequest (creature/space/tier/ally/dormant); Claude 2 can also call
 *   Services.combat.spawn directly. enemy:killed should carry { enemyId (entity), creature (bx_*), tier, level, space, x, y,
 *   zoneId?, killers: playerId[] }.
 * - quest:reward items are { item: <handoff id>, qty?, ilvl? } (ilvl defaults to the player's level for gear).
 */
