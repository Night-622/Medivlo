/**
 * Narrative contracts v2 (Hollow Crown). Authored by Claude 4 (docs/lore/hollow-crown/07-narrative-systems.md),
 * owned by Claude 1. FROZEN DRAFT for pasting over src/core/types.narrative.ts.
 *
 * v2 is ADDITIVE: every v1 field still exists, so the old Medival content typechecks until it is archived.
 * Changes are marked "v2". NarrativeCondition/NarrativeEffect extend core Condition/Effect and are evaluated
 * in src/narrative/engine (core variants delegate to evalCondition).
 */
import type { BaseDef, Condition, Effect } from './types';
import type { AttributeId, ClassId, EnemyFamily, EnemyId, ItemId, SpellId, TraitId } from './types.systems';
import type { SchoolId } from './constants';

// ---------- NARRATIVE (Claude 4) ----------
export type QuestId = `quest:${string}`;
export type DialogueId = `dialogue:${string}`;
export type NpcId = `npc:${string}`;
export type LoreId = `lore:${string}`;
export type FactionId = `faction:${string}`;
/** 1 minor, 2 standard, 3 major (0.25 / 0.5 / 1.0 of a level's XP, Claude 3). Matches core quest:reward. */
export type XpTier = 1 | 2 | 3;

/** v2: world places a quest/NPC can live in (Claude 2's ids: docs/world/HOLLOW-CROWN-WORLD.md). */
export type PlaceId =
  | `region:${string}` | `realm:${string}` | `area:${string}` | `zone:${string}` | `vil:${string}` | `inst:${string}`
  | `ws:${string}` | 'concordia';

/** v2: NPC trust, flag `trust.<npc-slug>`, 0..5 (07-narrative-systems.md §1). */
export type TrustValue = 0 | 1 | 2 | 3 | 4 | 5;
export type TrustLevel = 'stranger' | 'wary' | 'neutral' | 'friendly' | 'trusted' | 'devoted';
export const TRUST_LEVELS: readonly TrustLevel[] = ['stranger', 'wary', 'neutral', 'friendly', 'trusted', 'devoted'];

/** v2: comparison used by trust conditions (flag conditions keep core FlagCond). */
export type CmpOp = '==' | '!=' | '>' | '>=' | '<' | '<=';

/**
 * Narrative-only condition variants. Evaluated by src/narrative/engine (which delegates the core
 * variants to core evalCondition). Core code never needs to understand these.
 */
export type NarrativeCondition =
  | Condition
  | { questActive: QuestId }
  | { questFailed: QuestId }
  | { questOutcome: QuestId; outcome: string }
  | { stat: AttributeId; min: number }               // passive check against the player's attribute
  | { classIs: ClassId }
  | { dialogueTag: string }                          // v1 (traits); unused by Hollow Crown content
  | { rep: FactionId; min?: number; max?: number }
  | { loreUnlocked: LoreId }
  | { hour: [number, number] }                       // [from, to), wraps midnight
  // v2 ↓
  | { trust: NpcId; op?: CmpOp; value: TrustValue | TrustLevel }   // default op '>='
  | { heroClass: string }                            // the CAMPAIGN OWNER's class (host in co-op), 'class:' prefix optional
  | { heroSchool: SchoolId }                         // the campaign owner's school
  | { partyHasClass: string }                        // any connected party member (solo = hero)
  | { partyHasSchool: SchoolId }
  | { insight: string }                              // flag insight.<id> is set
  | { all: NarrativeCondition[] }
  | { any: NarrativeCondition[] }
  | { not: NarrativeCondition };

/** Exactly the payload of the core `quest:reward` event (minus questId). */
export interface QuestRewardPayload {
  xpTier?: XpTier;
  items?: { item: ItemId; qty?: number }[];
  /** v2.1: handoff item ids (w_*, a_*, i_*, lg_*) — passed through to quest:reward.hcItems */
  hcItems?: { item: string; qty?: number; ilvl?: number }[];
  traits?: TraitId[];
  skillPoints?: number;
  gold?: number;
  tome?: SpellId;
}

/** Narrative-only effect variants, applied by src/narrative/engine (core Effects are delegated). */
export type NarrativeEffect =
  | Effect
  /** spawn an escorted NPC that follows the party to `to` (engine: Claude 4; sim: Claude 3); flag escort.<npc-slug> = active|arrived|lost */
  | { escort: NpcId; to: PlaceId | `landmark:${string}` | `obj:${string}`; revives?: number; hp?: number; fights?: boolean }
  | { addFlag: string; amount: number }              // numeric increment (missing = 0)
  | { setStage: QuestId; stage: string }
  | { completeQuest: QuestId; outcome?: string }
  | { failQuest: QuestId }
  | { reward: QuestRewardPayload }                   // emitted as quest:reward for Claude 3
  | { unlockLore: LoreId; section?: string }
  | { openDialogue: DialogueId }
  | { companion: NpcId; following: boolean }
  | { loyalty: NpcId; delta: number }                // v1: flag companion.<id>.loyalty, clamped 0..100
  // v2 ↓
  | { trust: NpcId; delta?: number; set?: TrustValue }  // delta clamps 0..4; only `set` reaches 5 (Devoted)
  | { insight: string };                             // sets insight.<id> = true

// ----- quests
export type ObjectiveDef = {
  /** unique within the quest */
  id: string;
  /** quest-log / tracker text; "{n}/{count}" is filled in automatically for counted objectives */
  text: string;
  optional?: boolean;
  hidden?: boolean;
  /** map pin; Claude 2 resolves the landmark position */
  marker?: { landmark: `landmark:${string}` } | { region: `region:${string}` } | { place: PlaceId };  // v2: place
} & (
  | { talk: NpcId }                                                     // dialogue with npc ended
  | { kill: EnemyId | string | null; family?: EnemyFamily; hollowed?: boolean; count: number } // id (or handoff creature bx_*), or any of family/variant
  | { collect: ItemId | string; count: number }                         // inventory count ≥ count (handoff item ids allowed)
  | { reach: `landmark:${string}` | PlaceId | `instance:${string}` }    // v2: any PlaceId
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
  /** v2 adds 'bounty' (journal "Bounty" tab) and 'class' (class main thread; journal "Story") */
  type: 'main' | 'side' | 'faction' | 'companion' | 'bounty' | 'class';
  act: 'prologue' | 'act1' | 'act2' | 'act3';
  chapter?: string;
  region: PlaceId;                     // v2: widened from region:*
  giver?: NpcId;
  summary: string;
  requires?: NarrativeCondition;
  autoStart?: boolean;
  firstStage: string;
  stages: QuestStageDef[];
  reward?: QuestRewardPayload & { rep?: { faction: FactionId; delta: number }[]; lore?: LoreId[] };
  /** v2: which campaign owns it: a class slug ('arcanist'), or 'shared' (Concordia/Heart). Validator + release gating (content.class.<id>). */
  campaign?: string;
  /** v2: completing it in a host's world also completes it in a guest's own save if active/available there (05 co-op rules). */
  portable?: boolean;
}

// ----- dialogue
export type Speaker = NpcId | 'player' | 'narrator';

export interface DialogueChoice {
  text: string;                        // tokens: {player.name}, {flag:some.key}; v2: {class}, {school}, {realm}
  to: string | null;                   // node id; null ends
  when?: NarrativeCondition;           // hidden unless true…
  lockedLabel?: string;                // …or shown disabled with this label, e.g. "[Will 15]"
  /** passive check: success if attribute ≥ dc; otherwise go to failTo */
  check?: { stat: AttributeId; dc: number; failTo: string | null };
  tag?: 'persuade' | 'intimidate' | 'deceive' | 'lore' | 'class' | 'trait' | 'aggressive' | 'leave';
  once?: boolean;
  effects?: NarrativeEffect[];
  // v2 chips (handoff: TRUST ±1, QUEST, INSIGHT, [School]) ↓
  /** TRUST ±1 chip; applied to `trustNpc` or the node's speaker NPC; pays out once per save */
  trust?: 1 | -1;
  trustNpc?: NpcId;
  /** QUEST chip: the choice starts/advances/ends a quest */
  quest?: boolean;
  /** INSIGHT chip: sets insight.<id>; hidden (not locked) when `when` fails */
  insight?: string;
  /** [School] option: visible to / votable by party members of this school only */
  school?: SchoolId;
}

export interface DialogueNode {
  speaker: Speaker;
  text: string;
  mood?: 'neutral' | 'happy' | 'sad' | 'angry' | 'afraid' | 'hollow';
  effects?: NarrativeEffect[];         // on entering the node
  choices?: DialogueChoice[];          // v2: at most 4 visible at once (validator)
  next?: string | null;                // used when there are no choices; null/omitted = end
}

export interface DialogueDef extends BaseDef {   // BaseDef.name = editor label
  id: DialogueId;
  kind?: 'dialogue';
  /** entry points checked in order; the first passing one is the start node */
  entries: { when?: NarrativeCondition; node: string }[];
  nodes: Record<string, DialogueNode>;
  bark?: boolean;                      // floating one-liner, no dialogue box
  /** v2: 'party' = whole party sees it and every choice node is a vote; 'personal' (default) = initiator only */
  scope?: 'party' | 'personal';
}

// ----- NPCs
/** v1 peoples (old lore). v2 Hollow Crown NPCs use `origin` instead. */
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
  /** v2: optional (v1 content only) */
  people?: PeopleId;
  /** v2: home realm (school) or Concordia */
  origin?: SchoolId | 'concord';
  /** v2: the NPC's school (handoff school_*): crest on the name plate */
  school?: SchoolId;
  /** v2: starting trust (default 0) */
  trust?: TrustValue;
  /** v2: handoff services list shown on the NPC screen ('Quest giver', 'Sells arrows', …) */
  services?: string[];
  faction?: FactionId;
  region: PlaceId;                     // v2: widened from region:*
  home: `landmark:${string}`;
  schedule?: NpcScheduleEntry[];
  presentWhen?: NarrativeCondition;
  dialogue: { when?: NarrativeCondition; dialogue: DialogueId }[];
  barks?: { when?: NarrativeCondition; lines: string[] }[];
  roles?: ('quest' | 'merchant' | 'trainer' | 'companion' | 'ambient' | 'bearer')[];   // v2: 'bearer'
  shop?: string;
  essential?: boolean;
  look: { skin: number; hair?: number; cloth: number; accent?: number; build?: 'slight' | 'average' | 'broad' | 'tall' | 'short' };
  /** v2: bearer NPCs (the other 23 heroes) render as this class's default look instead of `look` */
  classLook?: string;
  bio: string;
  lore?: LoreId;
}

// ----- codex (kind 'lore')
export type LoreCategory =
  | 'cosmology' | 'gods' | 'magic' | 'history' | 'factions' | 'peoples'
  | 'places' | 'characters' | 'bestiary' | 'culture' | 'books'
  | 'realms' | 'schools';              // v2

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
    | { place: PlaceId }               // v2
    | { kill: EnemyId | string | null; family?: EnemyFamily; hollowed?: boolean }
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
  seat?: `region:${string}` | PlaceId;  // v2: widened
  parent?: FactionId;
  joinable: boolean;
  startingRep: number;                 // -100..100
  ranks?: { min: number; title: string }[];
  relations: Partial<Record<FactionId, number>>;
  colors: { primary: number; secondary: number };
  sigil: string;
}
