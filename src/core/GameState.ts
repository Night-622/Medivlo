/**
 * The single serialisable game state. Each system owns one slice:
 *   player.*        Claude 1 (name/ancestry/appearance) + Claude 3 (vitals, progression, spellbook, equipment, inventory, counters)
 *   world.*         Claude 2 (WORLD.md §4.4)
 *   narrative.*     Claude 4
 *   flags           shared; Claude 4 writes most, everyone may read
 * Must stay JSON-serialisable (no class instances, Maps, Sets or functions).
 */
import type {
  AppearanceLayers, ContentId, CountersState, EquipmentState, Flags, InventoryState, ProgressionState, SpellbookState, TraitId,
} from './types';
import { SAVE_VERSION } from './constants';
import type { CharacterSave } from './hc';

/** Hollow Crown hero choice from character creation (Claude 1): class + handoff look/outfit indices. */
export interface HeroChoiceState {
  classId: string;
  look: { skin: number; hair: number; hc: number; eyes: number; brows: number; ec: number; mouth: number; mark: number; body: 0 | 1 };
  outfit: { dye: number; headw: number; cape: number; neck: number; face: number; extra: number };
}

/** Player slice. Identity (name/ancestry/appearance): Claude 1. Everything else: Claude 3 (SYSTEMS.md §9). */
export interface PlayerState {
  name: string;
  ancestry: TraitId | null;
  appearance: AppearanceLayers;
  /** Hollow Crown: chosen class + look (set by character creation) */
  hero?: HeroChoiceState;
  /** current vitals; maxima come from Claude 3's StatBlock. mana is shown as "Ember". */
  hp: number;
  mana: number;
  stamina: number;
  /** class resource (Resolve, Focus, Attunement…) */
  resource: number;
  progression: ProgressionState;
  spellbook: SpellbookState;
  equipment: EquipmentState;
  inventory: InventoryState;
  counters: CountersState;
}

/** World slice, owned by Claude 2 (WORLD.md §4.4). */
export interface WorldState {
  /** `space` = which world space the player is in (school realm, 'morvane', or an instance id). x/y in world px. */
  location: { /** Hollow Crown world space ('concordia', 'realm:<school>', 'inst:…'); '' until the hero first enters the world */ space: string; /** pre-rebuild field, removed with the old world */ instance: 'overworld' | `instance:${string}`; floor?: string; x: number; y: number; facing: 'n' | 'e' | 's' | 'w' };
  lastOverworld: { x: number; y: number };
  /** base64 bitset, WORLD_CHUNKS_W × WORLD_CHUNKS_H bits. */
  discoveredChunks: string;
  discoveredLandmarks: string[];
  visitedRegions: string[];
  waystones: string[];
  objectState: Record<string, boolean | number | string>;
  /** zoneId -> timestamp cleared */
  clearedZones: Record<string, number>;
  /** in-game minutes since start */
  time: number;
  /** per-player fog of war: spaceId -> base64 chunk bitset (Hollow Crown) */
  discovered: Record<string, string>;
  /** Morvane region ids found (world-map fog) */
  foundRegions: string[];
  /** co-op: player ids that have joined this host's world before (may drop in any time) */
  visitors?: string[];
}

export interface QuestProgress { stage: string; objectives: Record<string, number>; completed?: boolean; failed?: boolean; outcome?: string }

export interface NarrativeState {
  quests: Record<ContentId, QuestProgress>;
  trackedQuest: ContentId | null;
  codexUnlocked: ContentId[];
  reputation: Record<ContentId, number>;
  /** Narrative-owned extra state (Claude 4). */
  ext: Record<string, unknown>;
}

export interface MetaState {
  version: number;
  createdAt: number;
  updatedAt: number;
  playtimeSec: number;
  /** Firebase uid of the account that last saved this hero (local copies are per browser, not per account). */
  ownerUid?: string;
  /** Save counter, +1 on every save and carried with the cloud copy: "newest" compares this before updatedAt
   * (device clocks disagree; one running ahead used to win every time). Older saves count as 0. */
  rev?: number;
  slot: number;
}

export interface GameState {
  meta: MetaState;
  player: PlayerState;
  world: WorldState;
  narrative: NarrativeState;
  flags: Flags;
  /** Hollow Crown character (Claude 3, systems v2): class, level, gear, spells, gold. Created lazily from player.hero if absent. */
  character?: CharacterSave;
}

/**
 * Content gates applied to new games and on every load. Empty for The Hollow Crown: the user's rule is that all
 * 24 campaigns ship together (no partial or per-class release), so nothing is gated by flag. Kept as a hook.
 */
export const RELEASED_CONTENT: Record<string, true> = {};

export function applyReleasedContent(state: GameState): GameState {
  for (const k of Object.keys(RELEASED_CONTENT)) state.flags[k] = true;
  return state;
}

export function defaultAppearance(): AppearanceLayers {
  return { body: 'body:average', skinTone: 0xc8a07a, hair: 'hair:short', hairColor: 0x3b2a1a, face: 'face:1', outfit: '', accentColor: 0x9b2c2c };
}

export function createNewGameState(slot = 0): GameState {
  const now = Date.now();
  return {
    meta: { version: SAVE_VERSION, createdAt: now, updatedAt: now, playtimeSec: 0, slot },
    player: {
      name: 'Wanderer', ancestry: null, appearance: defaultAppearance(),
      hp: 100, mana: 50, stamina: 100, resource: 0,
      progression: {
        classId: null, level: 1, xp: 0,
        attributes: { might: 11, finesse: 11, vigor: 11, intellect: 11, will: 11 },
        unspentAttributePoints: 0, unspentSkillPoints: 0, bonusSkillPoints: 0, traits: [], tree: {}, respecs: 0, cinderlung: 0,
      },
      spellbook: { known: {}, slots: [null, null, null, null] },
      equipment: { loadouts: [{}, {}], activeLoadout: 0, worn: {}, quickslots: [null, null] },
      inventory: { items: [], capacity: 40, gold: 0, draught: { charges: 3, maxCharges: 3, potency: 1 }, knownRecipes: [] },
      counters: {},
    },
    world: {
      location: { space: '', instance: 'overworld', x: 0, y: 0, facing: 's' }, lastOverworld: { x: 0, y: 0 },
      discoveredChunks: '', discoveredLandmarks: [], visitedRegions: [], waystones: [], objectState: {}, clearedZones: {}, time: 8 * 60, discovered: {}, foundRegions: [],
    },
    narrative: { quests: {}, trackedQuest: null, codexUnlocked: [], reputation: {}, ext: {} },
    flags: { ...RELEASED_CONTENT },
  };
}

/** Process-wide current state. Set by MainMenu / CharacterCreate / load. */
let current: GameState | null = null;
export const Game = {
  get state(): GameState {
    if (!current) throw new Error('GameState not initialised');
    return current;
  },
  get hasState(): boolean { return current !== null; },
  set(state: GameState): void { current = syncHeroClass(state); },
};

/**
 * The Hollow Crown class lives on player.hero (character creation). Older code and the narrative engine read
 * player.progression.classId ('class:<id>'), so keep that mirror in step whenever a state becomes current.
 */
export function syncHeroClass(state: GameState): GameState {
  const id = state.player.hero?.classId;
  if (id && state.player.progression.classId !== `class:${id}`) state.player.progression.classId = `class:${id}` as never;
  return state;
}

/** The current hero's class id, bare ('warden'), or null before character creation. Prefer this everywhere. */
export function heroClassId(state: GameState = Game.state): string | null {
  return state.player.hero?.classId ?? state.player.progression.classId?.replace(/^class:/, '') ?? null;
}
