/**
 * Shared authority logic for co-op HOST (browser) and public-realm SERVER (Node). Owner: Claude 1.
 * Owns members, input queues, per-viewer snapshots, replicated bus events, chat and votes.
 * Subclasses provide the transport: `transportSend(playerId, msg)` and admission.
 */
import { bus } from '@/core/EventBus';
import { SNAPSHOT_EVERY } from './SimLoop';
import {
  REPLICATED_EVENTS, type ClientMsg, type EntityState, type InputFrame, type NetRole, type NetService,
  type PartyMember, type PlayerId, type ServerMsg, type VoteOpen,
} from './types';
import { NetBase } from './coop/base';

interface PendingVote { open: VoteOpen; eligible: Set<PlayerId>; votes: Map<PlayerId, number>; resolve: (i: number) => void; timer: ReturnType<typeof setTimeout> }

export abstract class AuthorityNet extends NetBase implements NetService {
  abstract readonly role: NetRole;
  abstract readonly localPlayer: PlayerId;
  /** remote players connected through the transport (not the local player) */
  protected remotes = new Map<PlayerId, { lastIds: Set<string> }>();
  private pending = new Map<PlayerId, InputFrame[]>();
  private votes = new Map<string, PendingVote>();
  protected offs: (() => void)[] = [];
  private lastLocalIds = new Set<string>();

  /** Deliver a server message to one remote player. */
  protected abstract transportSend(playerId: PlayerId, msg: ServerMsg): void;

  protected constructor() {
    super();
    // a payload marked local (e.g. a one-time hint in the host's own key bindings) stays on this machine
    for (const name of REPLICATED_EVENTS) this.offs.push(bus.on(name, (payload) => { if ((payload as { local?: boolean } | undefined)?.local) return; this.broadcast({ type: 'event', name, payload }); }));
    this.offs.push(bus.on('player:downed', ({ playerId }) => this.setDowned(playerId, true)));
    this.offs.push(bus.on('player:revived', ({ playerId }) => this.setDowned(playerId, false)));
  }

  isAuthority(): boolean { return true; }

  inputsFor(): Map<PlayerId, InputFrame[]> {
    const out = this.pending;
    this.pending = new Map();
    return out;
  }

  /** The local player's client messages (host only; servers have no local player). */
  send(msg: ClientMsg): void { this.handleClient(this.localPlayer, msg); }

  flush(tick: number, t: number): void {
    if (this.consumers.size) {
      const ents = this.collect(this.localPlayer);
      const removed = this.diff(this.lastLocalIds, ents);
      const snap = { tick, t, entities: ents, removed, acks: {} };
      for (const c of this.consumers) c.apply(ents.filter((e) => c.kinds.includes(e.kind)), removed, snap);
    }
    if (tick % SNAPSHOT_EVERY !== 0) return;
    for (const [id, r] of this.remotes) {
      const ents = this.collect(id);
      const removed = this.diff(r.lastIds, ents);
      this.transportSend(id, { type: 'snapshot', snap: { tick, t, entities: ents, removed, acks: {} } });
    }
  }

  openVote(v: Omit<VoteOpen, 'voteId' | 'deadlineMs'>, timeoutMs = 30000): Promise<number> {
    const voteId = `vote:${Date.now()}:${Math.floor(Math.random() * 1e6)}`;
    const open: VoteOpen = { ...v, voteId, deadlineMs: Date.now() + timeoutMs };
    const audience = v.audience === 'all' ? this.info.members.filter((m) => m.connected).map((m) => m.playerId) : v.audience;
    const eligible = new Set(audience.filter((p) => v.choices.some((c) => c.allowed === 'all' || c.allowed.includes(p))));
    return new Promise((resolve) => {
      const timer = setTimeout(() => this.finishVote(voteId), timeoutMs);
      this.votes.set(voteId, { open, eligible, votes: new Map(), resolve, timer });
      const msg: ServerMsg = { type: 'vote:open', vote: open };
      if (audience.includes(this.localPlayer)) this.emitServer(msg);
      for (const p of audience) if (this.remotes.has(p)) this.transportSend(p, msg);
    });
  }

  // ───────── membership (called by subclasses) ─────────

  protected addRemote(member: PartyMember, welcome: { worldSeed: number }): void {
    this.info.members = [...this.info.members.filter((m) => m.playerId !== member.playerId), member];
    this.remotes.set(member.playerId, { lastIds: new Set() });
    this.transportSend(member.playerId, { type: 'welcome', you: member.playerId, role: this.role === 'server' ? 'server-client' : 'guest', session: this.info, worldSeed: welcome.worldSeed });
    this.sendState(member.playerId);
    this.broadcastSession();
    this.emitMembers();
  }

  protected removeRemote(playerId: PlayerId): void {
    if (!this.remotes.has(playerId)) return;
    this.remotes.delete(playerId);
    this.pending.delete(playerId);
    this.stateAsked.delete(playerId); // (chatBucket is kept: reconnecting must not refill a flooder's bucket)
    this.info.members = this.role === 'server'
      ? this.info.members.filter((m) => m.playerId !== playerId)
      : this.info.members.map((m) => (m.playerId === playerId ? { ...m, connected: false } : m));
    for (const v of [...this.votes.values()]) { v.eligible.delete(playerId); if ([...v.eligible].every((p) => v.votes.has(p))) this.finishVote(v.open.voteId); }
    this.broadcastSession();
    this.emitMembers();
  }

  /** Route one client message from `from` (local or remote). */
  protected handleClient(from: PlayerId, msg: ClientMsg): void {
    if (msg.type === 'input') {
      if (!Array.isArray(msg.frames)) return;
      const list = this.pending.get(from) ?? [];
      // Never trust a remote frame's shape: a malformed one would throw in every stepper, every tick, for everyone.
      for (const f of msg.frames.slice(-60)) { const ok = sanitizeFrame(f); if (ok) list.push(ok); }
      if (list.length > 120) list.splice(0, list.length - 120);
      this.pending.set(from, list);
      return;
    }
    if (msg.type === 'bye') { this.removeRemote(from); return; }
    if (msg.type === 'state:request') {
      const now = Date.now();
      if (from !== this.localPlayer && now - (this.stateAsked.get(from) ?? 0) >= 1000) { this.stateAsked.set(from, now); this.sendState(from); }
      return;
    }
    if (msg.type === 'chat' && typeof msg.text === 'string') {
      // every line goes to everyone: a flood from one remote (120 msgs/s fit the realm budget) is dropped
      if (from !== this.localPlayer && !this.chatToken(from)) return;
      const text = this.filterChat(msg.text.slice(0, 240));
      if (!text) return;
      const name = this.info.members.find((m) => m.playerId === from)?.name ?? '?';
      const out: ServerMsg = { type: 'chat', from, name, text };
      this.emitServer(out);
      this.broadcast(out);
    }
    if (msg.type === 'vote') this.castVote(from, msg.voteId, msg.choice);
    this.emitClient(msg, from);
  }

  /** Profanity filter / moderation hook (public realms). Return '' to drop. */
  protected filterChat(text: string): string { return text.trim(); }

  protected broadcast(msg: ServerMsg): void { for (const id of this.remotes.keys()) this.transportSend(id, msg); }

  protected broadcastSession(): void {
    const msg: ServerMsg = { type: 'session', session: this.info };
    this.emitServer(msg);
    this.broadcast(msg);
  }

  close(): void { this.offs.forEach((f) => f()); this.offs = []; }

  // ───────── internals ─────────

  private stateAsked = new Map<PlayerId, number>();
  private chatBucket = new Map<PlayerId, { n: number; at: number }>();

  /** Chat rate: a burst of 5 lines, then one every 1.5 s. */
  private chatToken(from: PlayerId): boolean {
    const now = Date.now();
    const b = this.chatBucket.get(from) ?? { n: 5, at: now };
    b.n = Math.min(5, b.n + (now - b.at) / 1500);
    b.at = now;
    this.chatBucket.set(from, b);
    if (b.n < 1) return false;
    b.n -= 1;
    return true;
  }

  /** Every state block, to one remote player (on join, and when it asks after registering a late sync). */
  private sendState(playerId: PlayerId): void {
    if (!this.remotes.has(playerId)) return;
    const blocks: Record<string, unknown> = {};
    for (const s of this.syncs) { try { blocks[s.name] = s.collect(); } catch (e) { console.warn('[net] sync collect failed', s.name, e); } }
    this.transportSend(playerId, { type: 'state', blocks });
  }

  private castVote(from: PlayerId, voteId: string, choice: number): void {
    const v = this.votes.get(voteId);
    if (!v || !v.eligible.has(from)) return;
    const c = v.open.choices.find((x) => x.index === choice);
    if (!c || (c.allowed !== 'all' && !c.allowed.includes(from))) return;
    v.votes.set(from, choice);
    bus.emit('vote:cast', { voteId, playerId: from, choice });
    if ([...v.eligible].every((p) => v.votes.has(p))) this.finishVote(voteId);
  }

  private finishVote(voteId: string): void {
    const v = this.votes.get(voteId);
    if (!v) return;
    clearTimeout(v.timer);
    this.votes.delete(voteId);
    const tally: Record<number, number> = {};
    for (const c of v.votes.values()) tally[c] = (tally[c] ?? 0) + 1;
    const best = Math.max(0, ...Object.values(tally));
    const top = Object.keys(tally).map(Number).filter((k) => tally[k] === best);
    const hostPick = v.votes.get(this.localPlayer);
    let choice: number;
    let tieBrokenByHost = false;
    if (top.length === 1) choice = top[0];
    else if (top.length > 1 && hostPick !== undefined && top.includes(hostPick)) { choice = hostPick; tieBrokenByHost = true; }
    else choice = top[0] ?? v.open.choices[0]?.index ?? 0;
    const msg: ServerMsg = { type: 'vote:result', voteId, choice, tally, tieBrokenByHost };
    this.emitServer(msg);
    this.broadcast(msg);
    v.resolve(choice);
  }

  private setDowned(playerId: PlayerId, downed: boolean): void {
    this.info.members = this.info.members.map((m) => (m.playerId === playerId ? { ...m, downed } : m));
    this.broadcastSession();
    this.emitMembers();
  }

  private collect(viewer: PlayerId): EntityState[] {
    const out: EntityState[] = [];
    for (const p of this.providers) { try { out.push(...p.collect(viewer)); } catch (e) { console.warn('[net] provider failed', p.name, e); } }
    return out;
  }

  private diff(last: Set<string>, ents: EntityState[]): string[] {
    const ids = new Set(ents.map((e) => e.id));
    const removed = [...last].filter((id) => !ids.has(id));
    last.clear();
    ids.forEach((id) => last.add(id));
    return removed;
  }
}

const num = (v: unknown, lo: number, hi: number): number => (typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : 0);

/** A well-formed InputFrame, or null. Clamps move to -1..1 and coerces everything else. */
export function sanitizeFrame(f: unknown): InputFrame | null {
  if (!f || typeof f !== 'object') return null;
  const o = f as Record<string, unknown>;
  const mv = (o.move ?? {}) as Record<string, unknown>, aim = (o.aim ?? {}) as Record<string, unknown>;
  return {
    seq: num(o.seq, 0, Number.MAX_SAFE_INTEGER),
    t: num(o.t, 0, Number.MAX_SAFE_INTEGER),
    move: { x: num(mv.x, -1, 1), y: num(mv.y, -1, 1) },
    aim: { x: num(aim.x, -1e7, 1e7), y: num(aim.y, -1e7, 1e7) },
    buttons: num(o.buttons, 0, 0xffff) | 0,
    target: typeof o.target === 'string' && o.target.length < 80 ? o.target : null,
  };
}
