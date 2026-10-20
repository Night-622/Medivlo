/**
 * Typed event map: the only way systems talk to each other.
 * Owner: Claude 1. Request new events by message; include payload shape and emitter.
 */
import type { CreatureTier, DamageKind, ItemInstance as HcItemInstance, SpawnRequest } from './hc';
import type {
  ContentId, FlagValue, TimePhase, Tier, WorldObject, EnemyId, EnemyFamily, EnemyVariant, EnemyRank, DamageType,
  ItemId, RecipeId, SpellId, MagicSchool, TraitId, SkillTreeId,
} from './types';

export interface GameEvents {
  // ----- core (Claude 1)
  'game:new': { slot: number };
  'game:loaded': { slot: number };
  'game:saving': { slot: number; auto?: boolean };
  'game:saved': { slot: number; cloud: boolean; auto?: boolean };
  'game:paused': { paused: boolean };
  'flag:changed': { key: string; value: FlagValue | undefined; prev: FlagValue | undefined };
  'settings:changed': { key: string };
  /** focus: a place id to centre on (the map; e.g. the Journal's "Show on map" for the tracked objective) */
  'ui:open': { panel: string; focus?: string };
  'ui:close': { panel: string };

  // ----- world (Claude 2)
  'waystone:woken': { playerId: string; waystone: string; space: string };
  /** a player moved between world spaces (realm ↔ Morvane ↔ instance) */
  'space:changed': { playerId: string; from: string; to: string };
  'world:ready': Record<string, never>;
  'region:entered': { playerId?: string; space?: string; regionId: string; prevRegionId: string | null; /** display name + subline for the HUD banner (v2) */ name?: string; subtitle?: string };
  'landmark:discovered': { playerId?: string; space?: string; landmarkId: string };
  'landmark:entered': { landmarkId: string };
  'landmark:left': { landmarkId: string };
  'chunk:loaded': { cx: number; cy: number };
  'chunk:unloaded': { cx: number; cy: number };
  'instance:entered': { playerId?: string; space?: string; instanceId: string; floorId?: string };
  'instance:exited': { playerId?: string; space?: string; instanceId: string; floorId?: string };
  'interact': { playerId?: string; objectId: string; kind: WorldObject['kind']; props: Record<string, string | number | boolean> };
  'area:entered': { playerId?: string; space?: string; triggerId: string };
  'enemy:spawn-request': { enemyId: string; level: number; x: number; y: number; zoneId: string; tier: Tier };
  /** v2 spawn request (or call Services.combat.spawn directly) */
  'combat:spawn-request': SpawnRequest;
  'enemy:despawn': { zoneId: string };
  'time:phase-changed': { phase: TimePhase; hour: number };
  /** player rested at a rest point: refill draughts, reset cooldowns */
  'world:rest': { pointId: string };

  // ----- systems (Claude 3, SYSTEMS.md §10)
  'enemy:killed': {
    /** v1 fields (old runtime) */ enemyId: EnemyId | string; zoneId?: string; x: number; y: number; level: number; family?: EnemyFamily; variant?: EnemyVariant; rank?: EnemyRank; byPlayer?: boolean;
    /** v2 (Hollow Crown) */ creature?: string; tier?: CreatureTier; space?: string; killers?: string[];
  };
  'enemy:cleansed': { enemyId: EnemyId; flag: string };
  'boss:phase': { enemyId: EnemyId; phase: number };
  'combat:hit': { x?: number; y?: number; kind?: 'dmg' | 'heal' | 'block' | 'miss' | 'immune'; sourceId: string; targetId: string; amount: number; /** v2: DamageKind (12 schools + physical); v1 DamageType until cutover */ type: DamageType | DamageKind; crit: boolean };
  'combat:engaged': Record<string, never>;
  'combat:disengaged': Record<string, never>;
  'player:damaged': { playerId?: string; amount: number; type: DamageType; sourceId: string };
  'player:died': { playerId?: string; x: number; y: number; regionId: string; killer?: string; killerName?: string };
  'player:respawned': Record<string, never>;
  'player:levelup': { playerId?: string; level: number };
  'xp:gained': { amount: number; source: string };
  'item:picked': { playerId?: string; uid: string; def: ItemId; qty: number };
  'item:equipped': { playerId?: string; uid: string; slot: string };
  'item:unequipped': { playerId?: string; uid: string; slot: string };
  'item:used': { playerId?: string; uid: string; def: ItemId | string };
  'item:crafted': { recipe: RecipeId; uid: string };
  'spell:learned': { spellId: SpellId };
  'spell:cast': { spellId: SpellId; school?: MagicSchool };
  'spell:ranked': { spellId: SpellId; rank: number };
  'trait:earned': { traitId: TraitId };
  'tree:allocated': { treeId: SkillTreeId; nodeId: string; rank: number };
  'subclass:chosen': { id: string };
  // ----- Hollow Crown combat/co-op (Claude 3)
  'ability:cast': { casterId: string; ability: string; x: number; y: number; tx: number; ty: number; ms: number };
  'enemy:telegraph': { id: string; shape: 'circle' | 'cone' | 'line' | 'ring'; x: number; y: number; /** radius, or length for lines */ r: number; /** line width */ w?: number; angle: number; /** cones: half-angle in radians (draw it; omitted = 0.6) */ arc?: number; ms: number };
  'player:downed': { playerId: string };
  'player:revived': { playerId: string; by: string };
  'party:wiped': { waystone: string };
  'pvp:kill': { killer: string; victim: string; gold: number };
  /** authority's grant; the owning client applies it to its character and saves */
  'loot:granted': { playerId: string; item?: string; qty?: number; gold?: number; xp?: number; /** exact instance for the owning client to add */ instance?: HcItemInstance;
    /** the authority's rune slots and tome spell after a rune/tome act, for the owning client's save */ runes?: Record<string, string[]>; tomeSpell?: string };
  'status:changed': { entityId: string; status: string; stacks: number; ms: number };
  /** a party member's vote on a dialogue choice (for UI) */
  'vote:cast': { voteId: string; playerId: string; choice: number };
  'stats:changed': Record<string, never>;

  // ----- narrative (Claude 4, docs/lore/08-data-formats.md)
  'quest:started': { questId: ContentId };
  'quest:advanced': { questId: ContentId; stage: string };
  'quest:objective': { questId: ContentId; objectiveId: string; count: number; target: number };
  'quest:completed': { questId: ContentId; outcome?: string };
  'quest:failed': { questId: ContentId };
  /** consumed by Claude 3 to grant rewards. xpTier: 1 minor, 2 standard, 3 major (0.25 / 0.5 / 1.0 × xpToNext) */
  'quest:reward': { playerId?: string; questId: ContentId; xpTier?: 1 | 2 | 3; items?: { item: ItemId; qty?: number }[]; /** v2 handoff item ids (w_*, a_*, i_*, lg_*) */ hcItems?: { item: string; qty?: number; ilvl?: number }[]; traits?: TraitId[]; skillPoints?: number; gold?: number; tome?: SpellId };
  /** consumed by Claude 3: remove quest items from the inventory */
  'quest:take-item': { questId: ContentId; item: ItemId; qty: number };
  'dialogue:started': { dialogueId: ContentId; npcId?: ContentId; sessionId?: string; initiator?: string; audience?: string[] | 'all' };
  'dialogue:choice': { dialogueId: ContentId; nodeId: string; choiceIndex: number; sessionId?: string; tally?: Record<number, number> };
  'dialogue:ended': { dialogueId: ContentId; npcId?: ContentId; sessionId?: string; initiator?: string; audience?: string[] | 'all' };
  /** a dialogue line for clients to show (text interpolated on the authority) */
  'dialogue:node': {
    sessionId: string; dialogueId: ContentId; nodeId: string; audience: string[] | 'all'; speaker: string; text: string; mood?: string;
    choices: { index: number; text: string; chips: string[]; school?: string; locked?: boolean; lockedLabel?: string }[];
  };
  'codex:unlocked': { entryId: ContentId; sectionId?: string };
  'reputation:changed': { factionId: ContentId; value: number; delta: number };
  'companion:changed': { npcId: ContentId; following: boolean };
  /** short on-screen notice; HUD shows it */
  /** local: shown only on the machine that emitted it, never replicated (one-time hints worded with that player's keys) */
  'narrative:toast': { text: string; kind: 'quest' | 'codex' | 'reputation' | 'trust' | 'info'; local?: true };
  /** Authority → one player: why a buy/sell/use/act was refused, or other per-player info. Clients toast it if playerId is theirs. */
  'systems:notice': { playerId: string; text: string; kind?: 'info' | 'error' };
  /** Local only: the remote authority (co-op host or realm server) ended our session. HudV2 returns to the title. */
  'net:kicked': { reason: string };
  /** Duels realm (Claude 3 emits, replicated): a challenge was made / accepted / settled (loser left at 1 HP). */
  /** A character opened a world chest (once per character per chest; Claude 3 emits, replicated): guests record it, the world shows it opened. */
  'chest:opened': { playerId: string; objectId: string };
  /** Escorted NPCs (Claude 3 emits, replicated; Claude 4 wires escort/arrive objectives) */
  'escort:arrived': { id: string; npc?: string; creature: string; marker: { space: string; x: number; y: number; r: number }; playerIds: string[] };
  'escort:lost': { id: string; npc?: string; creature: string; reason: 'died' | 'despawned' };
  'escort:downed': { id: string; npc?: string; until: number };
  /** names come from the authority (realm strangers aren't in the client's session list) */
  'duel:asked': { from: string; to: string; fromName?: string; toName?: string };
  'duel:started': { a: string; b: string };
  'duel:ended': { winner: string; loser: string };
  /** Local only: the transport under Services.net was swapped (NetSwitch); subscriptions already moved across. */
  'net:changed': { from: string; to: string };
  /** A nemesis/Herald boss reached 0 HP and yields (1 HP, invulnerable, passive) so the story can decide: spare/escape → combat.despawn, destroy → sourceless combat.damage. */
  'enemy:yielded': { enemyId: string; creature: string; space: string; zoneId?: string; x: number; y: number; killers: string[] };
}

export type GameEventName = keyof GameEvents;
