/**
 * Solo play: this client is the authority. Same API the co-op/public transports implement,
 * so systems written against NetService work unchanged when multiplayer lands.
 */
import type {
  ClientMsg, EntityState, InputFrame, NetService, PlayerId, ServerMsg, SessionInfo,
  SnapshotConsumer, SnapshotProvider, StateSync, VoteOpen,
} from './types';

type Handler = (msg: ServerMsg) => void;

export class LocalNet implements NetService {
  readonly role = 'solo' as const;
  readonly localPlayer: PlayerId;
  private providers = new Set<SnapshotProvider>();
  private consumers = new Set<SnapshotConsumer>();
  private handlers = new Map<ServerMsg['type'], Set<Handler>>();
  private pendingInputs: InputFrame[] = [];
  private info: SessionInfo;

  constructor(playerId: PlayerId, name: string, classId: string, level: number) {
    this.localPlayer = playerId;
    this.info = {
      kind: 'solo', sessionId: playerId, joinCode: null, realmRule: 'peaceful', maxPlayers: 1,
      members: [{ playerId, name, classId, level, isHost: true, connected: true, downed: false }],
    };
  }

  session(): SessionInfo { return this.info; }
  isAuthority(): boolean { return true; }
  partySize(): number { return 1; }

  inputsFor(): Map<PlayerId, InputFrame[]> {
    const frames = this.pendingInputs;
    this.pendingInputs = [];
    return new Map([[this.localPlayer, frames]]);
  }

  send(msg: ClientMsg): void {
    if (msg.type === 'input') { this.pendingInputs.push(...msg.frames); return; }
    if (msg.type === 'chat') this.dispatch({ type: 'chat', from: this.localPlayer, name: this.info.members[0].name, text: msg.text });
    if (msg.type === 'vote') this.castLocalVote(msg.voteId, msg.choice);
    for (const fn of this.clientHandlers.get(msg.type) ?? []) fn(msg, this.localPlayer);
  }

  onMembers(fn: (members: SessionInfo['members']) => void): () => void {
    fn(this.info.members);
    this.memberHandlers.add(fn);
    return () => this.memberHandlers.delete(fn);
  }
  private memberHandlers = new Set<(members: SessionInfo['members']) => void>();
  /** Solo: name/class/level are known only after character creation or load. */
  setLocalMember(p: { name?: string; classId?: string; level?: number }): void {
    Object.assign(this.info.members[0], p);
    for (const fn of this.memberHandlers) fn(this.info.members);
  }

  private clientHandlers = new Map<ClientMsg['type'], Set<(msg: ClientMsg, from: PlayerId) => void>>();
  onClient<T extends ClientMsg['type']>(type: T, fn: (msg: Extract<ClientMsg, { type: T }>, from: PlayerId) => void): () => void {
    let set = this.clientHandlers.get(type);
    if (!set) this.clientHandlers.set(type, (set = new Set()));
    const h = fn as (msg: ClientMsg, from: PlayerId) => void;
    set.add(h);
    return () => set!.delete(h);
  }

  addProvider(p: SnapshotProvider): () => void { this.providers.add(p); return () => this.providers.delete(p); }
  addConsumer(c: SnapshotConsumer): () => void { this.consumers.add(c); return () => this.consumers.delete(c); }
  /** Solo: nobody joins, so syncs are only registered (transports send collect() to joiners). */
  addStateSync(s: StateSync): () => void { this.syncs.add(s); return () => this.syncs.delete(s); }
  private syncs = new Set<StateSync>();

  /** Solo: loop a snapshot back every tick so rendering always goes through SnapshotConsumers. */
  flush(tick: number, t: number): void { if (this.consumers.size) this.loopbackSnapshot(tick, t); }

  /** Solo: no network hop. Systems render directly, but tests can call this to exercise consumers. */
  loopbackSnapshot(tick: number, t: number): void {
    const entities: EntityState[] = [];
    for (const p of this.providers) entities.push(...p.collect(this.localPlayer));
    const ids = new Set(entities.map((e) => e.id));
    const removed = [...this.lastIds].filter((id) => !ids.has(id));
    this.lastIds = ids;
    const snap = { tick, t, entities, removed, acks: {} };
    for (const c of this.consumers) c.apply(entities.filter((e) => c.kinds.includes(e.kind)), removed, snap);
  }
  private lastIds = new Set<string>();

  /** Solo vote: the only player decides, so the UI's chosen index is returned immediately by the caller. */
  openVote(v: Omit<VoteOpen, 'voteId' | 'deadlineMs'>): Promise<number> {
    return new Promise((resolve) => {
      const voteId = `vote:${Date.now()}`;
      const off = this.on('vote:result', (r) => { if (r.voteId === voteId) { off(); resolve(r.choice); } });
      this.dispatch({ type: 'vote:open', vote: { ...v, voteId, deadlineMs: 0 } });
    });
  }

  /** The dialogue UI calls this with the local choice; in solo it resolves the vote instantly. */
  castLocalVote(voteId: string, choice: number): void {
    this.dispatch({ type: 'vote:result', voteId, choice, tally: { [choice]: 1 }, tieBrokenByHost: false });
  }

  on<T extends ServerMsg['type']>(type: T, fn: (msg: Extract<ServerMsg, { type: T }>) => void): () => void {
    let set = this.handlers.get(type);
    if (!set) this.handlers.set(type, (set = new Set()));
    set.add(fn as Handler);
    return () => set!.delete(fn as Handler);
  }

  private dispatch(msg: ServerMsg): void {
    for (const fn of this.handlers.get(msg.type) ?? []) fn(msg);
  }
}
