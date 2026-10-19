/**
 * Shared data contracts. Owner: Claude 1. Other agents: request changes, don't edit.
 * Combat/progression types: types.systems.ts (Claude 3). Narrative types: types.narrative.ts (Claude 4). Both re-exported here.
 */
export * from './types.systems';
import type { QuestDef, DialogueDef, LoreEntry, NpcDef, FactionDef } from './types.narrative';
export * from './types.narrative';

// ---------- ids ----------
/** Namespaced kebab-case id, e.g. `item:iron-longsword`. */
export type ContentId = string;

/** Registry kinds (narrative + regions). Hollow Crown systems content (classes, items, spells, creatures) lives in
 *  Claude 3's typed data modules ('@/systems/rules', '@/data/classes/hc', …), not the Registry. */
export type ContentKind = 'region' | 'quest' | 'dialogue' | 'lore' | 'npc' | 'faction';

export interface BaseDef {
  id: ContentId;
  name: string;
  description?: string;
}

// ---------- geometry ----------
export interface Vec2 { x: number; y: number }
export interface ChunkCoord { cx: number; cy: number }

// ---------- character appearance (skins) ----------
export interface AppearanceLayers {
  body: string;      // body type id
  skinTone: number;  // 0xRRGGBB
  hair: string;
  hairColor: number;
  face: string;
  outfit: string;    // cosmetic override; empty = show equipped armour
  cape?: string;
  accentColor: number;
}

// ---------- flags ----------
export type FlagValue = boolean | number | string;
export type Flags = Record<string, FlagValue>;

/** Flag-only condition (WORLD.md §4.3). Evaluated by `evalCondition` in core/flags.ts. */
export type FlagCond =
  | { flag: string }                                   // truthy
  | { flag: string; value: FlagValue }                 // equality (same as op '==')
  | { flag: string; op: '==' | '!=' | '>=' | '<='; value: FlagValue }
  | { all: FlagCond[] } | { any: FlagCond[] } | { not: FlagCond };

/** General condition used by quests, dialogue, world spawns and gates. Superset of FlagCond. */
export type Condition =
  | FlagCond
  | { minLevel: number }
  | { hasItem: ContentId; count?: number }
  | { questStage: ContentId; stage: string }
  | { questCompleted: ContentId }
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition };

export type Effect =
  | { setFlag: string; value: FlagValue }
  | { giveItem: ContentId; count?: number }
  | { takeItem: ContentId; count?: number }
  | { giveXp: number }
  | { giveGold: number }
  | { startQuest: ContentId }
  | { reputation: ContentId; delta: number };

// ---------- WORLD (Claude 2, WORLD.md) ----------
export type BiomeId =
  | 'farmland' | 'temperate-forest' | 'old-growth' | 'moor' | 'marsh' | 'plains' | 'downs' | 'coast' | 'beach'
  | 'alpine' | 'cavern' | 'tundra' | 'glacier' | 'desert' | 'canyon' | 'ash-desert' | 'island' | 'mirelands'
  | 'dungeon-crypt' | 'dungeon-mine' | 'dungeon-ruin' | 'interior';

export type Tier = 1 | 2 | 3 | 4 | 5;

export interface LandmarkDef {
  id: `landmark:${string}`;
  name: string;
  at: [number, number];
  discoverRadius: number;
  icon: 'village' | 'city' | 'dungeon' | 'ruin' | 'shrine' | 'camp' | 'den' | 'poi' | 'waystone';
  instance?: `instance:${string}`;
}

export interface SpawnEntry {
  enemy: `enemy:${string}`;
  weight: number;
  level: [number, number];
  group: [number, number];
  time?: 'day' | 'night' | 'any';
  when?: FlagCond;
}
export interface SpawnTable { id: `spawn:${string}`; entries: SpawnEntry[] }
export interface SpawnZone {
  id: string;
  table: `spawn:${string}`;
  area: { x: number; y: number; w: number; h: number };
  maxAlive: number;
  respawnSec: number;
  leash: number;
  eliteChance?: number;
  when?: FlagCond;
}
export interface SeepDef { id: string; at: [number, number]; radius: number; minLevel: number; spawnTable?: `spawn:${string}` }

export interface RegionDef {
  kind?: 'region';
  id: `region:${string}`;
  name: string;
  description?: string;
  tier: Tier;
  innerTierBonus: number;
  /** Character used for this region in the 64×48 world-layout grid (src/data/regions/world-layout.ts). */
  layoutCode: string;
  biome: BiomeId;
  subBiomes?: { biome: BiomeId; weight: number }[];
  frost: number;
  mapColor: number;
  music?: string;
  ambience?: string;
  landmarks: LandmarkDef[];
  spawnZones: SpawnZone[];
  seeps?: SeepDef[];
  overlays: string[];
  waystones?: string[];
  gate?: FlagCond;
  faction?: `faction:${string}`;
  codexEntry?: `lore:${string}`;
}

export interface WorldObject {
  id: string;
  kind: 'door' | 'chest' | 'sign' | 'lore' | 'npc-anchor' | 'waystone' | 'lever' | 'interactable'
      | 'gate' | 'resource' | 'trigger' | 'spawn-zone';
  at: [number, number];
  size?: [number, number];
  when?: FlagCond;
  props?: Record<string, string | number | boolean>;
}

export type TimePhase = 'dawn' | 'day' | 'dusk' | 'night';

/** 'safe' villages/capitals/interiors (no combat spawns, never PvP) · 'arena' arena zones in arena realms · 'wild' everything else (ffa realms: PvP in wild + arena). */
export type ZoneRule = 'safe' | 'arena' | 'wild';

/** Implemented in src/world, registered as Services.world. */
export interface WorldQuery {
  tileAt(tx: number, ty: number): { collision: number; region: string } | null;
  isWalkable(tx: number, ty: number): boolean;
  raycast(x0: number, y0: number, x1: number, y1: number, mask: number): { hit: boolean; x: number; y: number };
  findPath(from: [number, number], to: [number, number], maxNodes?: number): [number, number][] | null;
  moveAndCollide(x: number, y: number, dx: number, dy: number, w: number, h: number): { x: number; y: number };
  regionAt(tx: number, ty: number): string;
  biomeAt(tx: number, ty: number): BiomeId;
  timeOfDay(): { hour: number; phase: TimePhase };
  /** Hollow Crown (Claude 2). Optional only until the v2 world replaces the old implementation. */
  zoneRule?(tx: number, ty: number): ZoneRule;
}

export interface ContentDefs {
  region: RegionDef; quest: QuestDef; dialogue: DialogueDef; lore: LoreEntry; npc: NpcDef; faction: FactionDef;
}
