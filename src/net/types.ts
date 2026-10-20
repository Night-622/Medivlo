/**
 * Network contracts for The Hollow Crown (docs/REBUILD.md § Multiplayer). Owner: Claude 1.
 *
 * Model: ONE authority simulates the world (solo client, co-op host, or public-realm server).
 * Everyone else sends inputs and renders replicated state. Systems must:
 *   - simulate only when `Services.get('net').isAuthority()`
 *   - expose their entities through a SnapshotProvider (authority) and apply them through a
 *     SnapshotConsumer (clients)
 *   - emit gameplay events normally; events listed in REPLICATED_EVENTS are forwarded to clients
 * All payloads are plain JSON (no class instances), entity ids are stable strings.
 */
import type { GameEventName, GameEvents } from '@/core/events';

export type NetRole = 'solo' | 'host' | 'guest' | 'server' | 'server-client';
/** Account uid (Firebase Auth). */
export type PlayerId = string;
/** Stable, globally unique within a session: `p:<uid>`, `e:<n>`, `npc:<id>`, `proj:<n>`, `loot:<n>`. */
export type EntityId = string;

export type SessionKind = 'solo' | 'coop' | 'public';
export type RealmRule = 'peaceful' | 'duels' | 'arena' | 'ffa';

export interface PartyMember {
  playerId: PlayerId;
  name: string;
  classId: string;
  level: number;
  isHost: boolean;
  connected: boolean;
  /** downed/revive state is gameplay (Claude 3) but mirrored here for party UI */
  downed: boolean;
}

export interface SessionInfo {
  kind: SessionKind;
  /** host uid (co-op) or server realm id (public) */
  sessionId: string;
  /** 6-char join code for co-op, null for solo */
  joinCode: string | null;
  realmRule: RealmRule;
  maxPlayers: number;
  members: PartyMember[];
}

// ───────────── client → authority ─────────────

/** Button bitmask (handoff controls). */
export const Btn = {
  ATTACK: 1, DASH: 2, CAST1: 4, CAST2: 8, CAST3: 16, CAST4: 32, POTION_Q: 64, POTION_E: 128, INTERACT: 256,
  /** martial classes: a quick weapon slash (bows: a quick shot) toward aim, cooldown by weapon weight */
  SLASH: 512,
} as const;

export interface InputFrame {
  seq: number;
  /** client ms since session start */
  t: number;
  move: { x: number; y: number };   // normalised -1..1
  aim: { x: number; y: number };    // world px
  buttons: number;                  // Btn bitmask (held this frame)
  target: EntityId | null;          // click-target
}

export type ClientMsg =
  | { type: 'input'; frames: InputFrame[] }
  | { type: 'vote'; voteId: string; choice: number }
  | { type: 'chat'; text: string }
  /** `token`: public realms only, the Firebase ID token (kept out of the URL: request logs record URLs) */
  | { type: 'hello'; playerId: PlayerId; name: string; classId: string; level: number; firstVisit: boolean; token?: string }
  | { type: 'bye' }
  /** a client registered a state sync after joining (e.g. a scene restart): send the current blocks again */
  | { type: 'state:request' }
  /** the client owns its character; sent on join and after any equip/learn/bind change (trusted in co-op; server validates later) */
  | { type: 'loadout'; data: Record<string, unknown> }
  | { type: 'duel'; target: PlayerId; accept?: boolean }
  /** initiator paces non-choice dialogue lines */
  | { type: 'dialogue:continue'; sessionId: string }
  /** talk/use a specific entity or object (clicked or F) */
  | { type: 'interact'; target: string }
  /** a request the authority validates (world: travel to a waystone, use a door…; systems: buy, craft…) */
  | { type: 'act'; domain: 'world' | 'systems' | 'narrative'; action: string; args: Record<string, string | number | boolean> };

// ───────────── authority → clients ─────────────

/** object = ground effects/totems/traps (`fx:<n>`), pet = summons/companions (`pet:<n>`, with owner) */
export type EntityKind = 'player' | 'enemy' | 'npc' | 'projectile' | 'loot' | 'object' | 'pet';

export interface EntityState {
  id: EntityId;
  kind: EntityKind;
  /** world space the entity is in; clients render only their own space */
  space: string;
  /** content id (class:…, enemy:…, npc:…, item:…) for the renderer */
  def: string;
  x: number;
  y: number;
  facing: 'n' | 'e' | 's' | 'w';
  /** animation key the renderer plays, e.g. 'idle' | 'walk' | 'cast' | 'hit' | 'down' */
  anim: string;
  hp?: number;
  maxHp?: number;
  /** owner player for players/projectiles/loot visibility */
  owner?: PlayerId;
  /** small extra render data (rarity, tint, level, elite, bubble text…) */
  data?: Record<string, string | number | boolean>;
}

export interface Snapshot {
  tick: number;
  /** authority ms since session start */
  t: number;
  /** full list of entities in the receiver's area of interest; `removed` lists ids gone since last */
  entities: EntityState[];
  removed: EntityId[];
  /** last input seq processed per player, for client reconciliation */
  acks: Record<PlayerId, number>;
}

export interface VoteOpen {
  voteId: string;
  sessionId: string;
  /** who sees the vote UI; personal-scope dialogues use [initiator] */
  audience: PlayerId[] | 'all';
  dialogueId: string;
  nodeId: string;
  choices: { index: number; text: string; allowed: PlayerId[] | 'all' }[];
  deadlineMs: number;
}

export type ServerMsg =
  | { type: 'welcome'; you: PlayerId; role: NetRole; session: SessionInfo; worldSeed: number }
  | { type: 'snapshot'; snap: Snapshot }
  /** StateSync blocks for a joining client (name → collect()) */
  | { type: 'state'; blocks: Record<string, unknown> }
  | { type: 'event'; name: GameEventName; payload: unknown }
  | { type: 'session'; session: SessionInfo }
  | { type: 'vote:open'; vote: VoteOpen }
  | { type: 'vote:result'; voteId: string; choice: number; tally: Record<number, number>; tieBrokenByHost: boolean }
  | { type: 'chat'; from: PlayerId; name: string; text: string }
  | { type: 'kick'; reason: string };

/** Events forwarded from the authority to every client (clients must NOT simulate these themselves). */
export const REPLICATED_EVENTS: ReadonlySet<GameEventName> = new Set<GameEventName>([
  'combat:hit', 'enemy:killed', 'boss:phase', 'player:damaged', 'player:died', 'player:respawned', 'player:levelup',
  'item:picked', 'quest:started', 'quest:advanced', 'quest:objective', 'quest:completed', 'quest:failed',
  'dialogue:started', 'dialogue:choice', 'dialogue:ended', 'codex:unlocked', 'region:entered', 'landmark:discovered',
  'flag:changed', 'time:phase-changed', 'narrative:toast', 'item:used', 'quest:reward', 'systems:notice', 'enemy:yielded', 'duel:asked', 'duel:started', 'duel:ended', 'chest:opened', 'escort:arrived', 'escort:lost', 'escort:downed',
  'ability:cast', 'enemy:telegraph', 'player:downed', 'player:revived', 'party:wiped', 'pvp:kill', 'loot:granted', 'status:changed',
  'dialogue:node', 'space:changed', 'waystone:woken', 'instance:entered', 'instance:exited', 'area:entered', 'vote:cast',
]);

/** Authority side: a system contributes its entities to each snapshot. */
export interface SnapshotProvider {
  readonly name: string;
  collect(viewer: PlayerId): EntityState[];
}

/** Client side: a system renders the entities of the kinds it owns. */
export interface SnapshotConsumer {
  readonly kinds: EntityKind[];
  apply(entities: EntityState[], removed: EntityId[], snap: Snapshot): void;
}

/** Authority state a joining client needs (quests, flags, codex…): collected on the authority, applied on join. */
export interface StateSync {
  readonly name: string;
  collect(): unknown;
  apply(state: unknown): void;
}

/** Registered as Services.net. LocalNet implements it for solo play; transports add co-op/public. */
export interface NetService {
  readonly role: NetRole;
  readonly localPlayer: PlayerId;
  session(): SessionInfo;
  /** true where the simulation runs: solo, host, server */
  isAuthority(): boolean;
  /** inputs of every player for this tick (authority only); solo returns the local player's input */
  inputsFor(tick: number): Map<PlayerId, InputFrame[]>;
  /** client → authority (in solo: delivered locally) */
  send(msg: ClientMsg): void;
  addProvider(p: SnapshotProvider): () => void;
  addConsumer(c: SnapshotConsumer): () => void;
  /** register a state block sent to clients when they join (and on request) */
  addStateSync(s: StateSync): () => void;
  /** Authority: open a party vote for a dialogue choice; resolves with the winning index (host breaks ties). */
  openVote(v: Omit<VoteOpen, 'voteId' | 'deadlineMs'>, timeoutMs?: number): Promise<number>;
  /** Called by SimLoop after every authority step: send/loop back a snapshot when due. */
  flush(tick: number, t: number): void;
  /** Player count, for enemy scaling and drop multipliers (Claude 3). */
  partySize(): number;
  on<T extends ServerMsg['type']>(type: T, fn: (msg: Extract<ServerMsg, { type: T }>) => void): () => void;
  /** Party membership changes (join/leave/reconnect). Called immediately with the current members. */
  onMembers(fn: (members: PartyMember[]) => void): () => void;
  /** Authority only: receive client messages with their sender (solo routes the local player's sends here). */
  onClient<T extends ClientMsg['type']>(type: T, fn: (msg: Extract<ClientMsg, { type: T }>, from: PlayerId) => void): () => void;
}

export type ReplicatedPayload<K extends GameEventName> = GameEvents[K];
