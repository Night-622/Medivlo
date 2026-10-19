/**
 * FROZEN v1: narrative contracts proposed by Claude 4 for src/core/types.ts.
 * Replace the "DRAFT: Claude 4" block in types.ts with everything below the cut line.
 * Style matches core: key-discriminated Condition/Effect objects (no `kind` tags).
 * Assumes these are in scope in types.ts: BaseDef, ContentId, FlagValue, Condition, Effect,
 * and from types.systems: ClassId, TraitId, ItemId, SpellId, AttributeId, EnemyId, EnemyFamily.
 */
// ─────────────────────────── cut here ───────────────────────────

// ---------- NARRATIVE (Claude 4, docs/lore/08-data-formats.md) ----------
export type QuestId = `quest:${string}`;
export type DialogueId = `dialogue:${string}`;
export type NpcId = `npc:${string}`;
export type LoreId = `lore:${string}`;
export type FactionId = `faction:${string}`;
/** 1 minor, 2 standard, 3 major (0.25 / 0.5 / 1.0 of a level's XP, Claude 3). Matches core quest:reward. */
export type XpTier = 1 | 2 | 3;

/**
 * Narrative-only condition variants. Evaluated by src/narrative (which delegates the core
 * variants to core evalCondition). Core code never needs to understand these.
 */
export type NarrativeCondition =
  | Condition
  | { questActive: QuestId }
  | { questFailed: QuestId }
  | { questOutcome: QuestId; outcome: string }
  | { stat: AttributeId; min: number }               // passive check against the player's attribute
  | { classIs: ClassId }
  | { dialogueTag: string }                          // from traits' { kind:'dialogueTag' } effects
  | { rep: FactionId; min?: number; max?: number }
  | { loreUnlocked: LoreId }
  | { hour: [number, number] }                       // [from, to), wraps midnight
  | { all: NarrativeCondition[] }
  | { any: NarrativeCondition[] }
  | { not: NarrativeCondition };

/** Exactly the payload of the core `quest:reward` event (minus questId). */
export interface QuestRewardPayload {
  xpTier?: XpTier;
  items?: { item: ItemId; qty?: number }[];
  traits?: TraitId[];
  skillPoints?: number;
  gold?: number;
  tome?: SpellId;
}

/** Narrative-only effect variants, applied by src/narrative (core Effects are delegated). */
export type NarrativeEffect =
  | Effect
  | { addFlag: string; amount: number }              // numeric increment (missing = 0)
  | { setStage: QuestId; stage: string }
  | { completeQuest: QuestId; outcome?: string }
  | { failQuest: QuestId }
  | { reward: QuestRewardPayload }                   // emitted as quest:reward for Claude 3
  | { unlockLore: LoreId; section?: string }
  | { openDialogue: DialogueId }
  | { companion: NpcId; following: boolean }
  | { loyalty: NpcId; delta: number };               // flag companion.<id>.loyalty, clamped 0..100

// ----- quests
export type ObjectiveDef = {
  /** unique within the quest */
  id: string;
  /** quest-log / tracker text; "{n}/{count}" is filled in automatically for counted objectives */
  text: string;
  optional?: boolean;
  hidden?: boolean;
  /** map pin; Claude 2 resolves the landmark position */
  marker?: { landmark: `landmark:${string}` } | { region: `region:${string}` };
} & (
  | { talk: NpcId }                                                     // dialogue with npc ended
  | { kill: EnemyId | null; family?: EnemyFamily; hollowed?: boolean; count: number } // id, or any of family/variant
  | { collect: ItemId; count: number }                                  // inventory count ≥ count
  | { reach: `landmark:${string}` | `region:${string}` | `area:${string}` | `instance:${string}` }
  | { interact: string; count?: number }                                // object id; trailing '*' = prefix match
  | { when: NarrativeCondition }                                        // generic, re-checked on flag:changed
);

export interface QuestStageDef {
  id: string;
  journal: string;
  objectives: ObjectiveDef[];          // [] = completes immediately (auto-advance)
  completeWhen?: 'all' | 'any';        // default 'all' (optional objectives ignored)
  onEnter?: NarrativeEffect[];
  onComplete?: NarrativeEffect[];
  /** next stage id, or branches checked in order (first match). Omit on the final stage. */
  next?: string | { when?: NarrativeCondition; to: string }[];
  /** completing this stage ends the quest */
  end?: { status: 'completed' | 'failed'; outcome?: string };
}

export interface QuestDef extends BaseDef {   // BaseDef.name = quest title
  id: QuestId;
  kind?: 'quest';
  type: 'main' | 'side' | 'faction' | 'companion';
  act: 'prologue' | 'act1' | 'act2' | 'act3';
  chapter?: string;
  region: `region:${string}`;
  giver?: NpcId;
  summary: string;
  requires?: NarrativeCondition;
  autoStart?: boolean;
  firstStage: string;
  stages: QuestStageDef[];
  reward?: QuestRewardPayload & { rep?: { faction: FactionId; delta: number }[]; lore?: LoreId[] };
}

// ----- dialogue
export type Speaker = NpcId | 'player' | 'narrator';

export interface DialogueChoice {
  text: string;                        // tokens: {player.name}, {flag:some.key}
  to: string | null;                   // node id; null ends
  when?: NarrativeCondition;           // hidden unless true…
  lockedLabel?: string;                // …or shown disabled with this label, e.g. "[Will 15]"
  /** passive check: success if attribute ≥ dc; otherwise go to failTo */
  check?: { stat: AttributeId; dc: number; failTo: string | null };
  tag?: 'persuade' | 'intimidate' | 'deceive' | 'lore' | 'class' | 'trait' | 'aggressive' | 'leave';
  once?: boolean;
  effects?: NarrativeEffect[];
}

export interface DialogueNode {
  speaker: Speaker;
  text: string;
  mood?: 'neutral' | 'happy' | 'sad' | 'angry' | 'afraid' | 'hollow';
  effects?: NarrativeEffect[];         // on entering the node
  choices?: DialogueChoice[];
  next?: string | null;                // used when there are no choices; null/omitted = end
}

export interface DialogueDef extends BaseDef {   // BaseDef.name = editor label
  id: DialogueId;
  kind?: 'dialogue';
  /** entry points checked in order; the first passing one is the start node */
  entries: { when?: NarrativeCondition; node: string }[];
  nodes: Record<string, DialogueNode>;
  bark?: boolean;                      // floating one-liner, no dialogue box
}

// ----- NPCs
export type PeopleId = 'haldish' | 'solenni' | 'hrothi' | 'aelthi' | 'orrun' | 'qasiri' | 'drowned';

export interface NpcScheduleEntry {
  from: number;                        // hour 0–23, wraps
  to: number;
  at: `landmark:${string}`;
  activity?: 'idle' | 'work' | 'sleep' | 'pray' | 'drink' | 'patrol' | 'wander';
  when?: NarrativeCondition;
}

export interface NpcDef extends BaseDef {   // BaseDef.name = display name
  id: NpcId;
  kind?: 'npc';
  title?: string;
  people: PeopleId;
  faction?: FactionId;
  region: `region:${string}`;
  home: `landmark:${string}`;
  schedule?: NpcScheduleEntry[];
  presentWhen?: NarrativeCondition;
  dialogue: { when?: NarrativeCondition; dialogue: DialogueId }[];
  barks?: { when?: NarrativeCondition; lines: string[] }[];
  roles?: ('quest' | 'merchant' | 'trainer' | 'companion' | 'ambient')[];
  shop?: string;
  essential?: boolean;
  look: { skin: number; hair?: number; cloth: number; accent?: number; build?: 'slight' | 'average' | 'broad' | 'tall' | 'short' };
  bio: string;
  lore?: LoreId;
}

// ----- codex (kind 'lore')
export type LoreCategory =
  | 'cosmology' | 'gods' | 'magic' | 'history' | 'factions' | 'peoples'
  | 'places' | 'characters' | 'bestiary' | 'culture' | 'books';

export interface LoreSection { id: string; title?: string; body: string; hint?: string }

export interface LoreEntry extends BaseDef {    // BaseDef.name = entry title
  id: LoreId;
  kind?: 'lore';
  category: LoreCategory;
  source?: string;                     // in-world attribution
  body: string;                        // paragraphs separated by blank lines
  sections?: LoreSection[];            // progressive unlocks
  related?: LoreId[];
  hidden?: boolean;                    // unlisted until unlocked (else shown as "???")
  unlockOn?: (
    | { landmark: `landmark:${string}` }
    | { region: `region:${string}` }
    | { kill: EnemyId | null; family?: EnemyFamily; hollowed?: boolean }
    | { interact: string }
    | { item: ItemId }
  )[];
  /** kept for back-compat with the draft; evaluated on flag:changed */
  unlock?: NarrativeCondition;
}

// ----- factions
export interface FactionDef extends BaseDef {
  id: FactionId;
  kind?: 'faction';
  shortName: string;
  leader?: NpcId | string;
  seat?: `region:${string}`;
  parent?: FactionId;
  joinable: boolean;
  startingRep: number;                 // -100..100
  ranks?: { min: number; title: string }[];
  relations: Partial<Record<FactionId, number>>;
  colors: { primary: number; secondary: number };
  sigil: string;
}
