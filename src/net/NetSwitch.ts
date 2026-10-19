/**
 * The one NetService everyone holds (Services.get('net')). Owner: Claude 1.
 * Going solo → host, solo → guest, → public realm and back swaps the transport underneath, but systems, world,
 * narrative, HUD and chat subscribed once at install time. NetSwitch records every subscription (on, onClient,
 * onMembers, providers, consumers, state syncs) and moves them onto the new transport on each swap, so nothing
 * has to re-install. Emits bus 'net:changed' after a swap.
 */
import { bus } from '@/core/EventBus';
import type {
  ClientMsg, InputFrame, NetRole, NetService, PartyMember, PlayerId, ServerMsg, SessionInfo, SnapshotConsumer, SnapshotProvider, StateSync, VoteOpen,
} from './types';

interface Sub { attach(n: NetService): () => void; off: (() => void) | null }

export class NetSwitch implements NetService {
  private subs = new Set<Sub>();

  constructor(private impl: NetService) {}

  /** the transport currently underneath (HostNet, GuestNet, RealmNet, LocalNet) */
  get current(): NetService { return this.impl; }

  /** Swap the transport; every recorded subscription moves across. */
  use(next: NetService): void {
    if (next === this.impl) return;
    const prev = this.impl;
    for (const s of this.subs) { s.off?.(); s.off = null; }
    this.impl = next;
    for (const s of this.subs) s.off = s.attach(next);
    bus.emit('net:changed', { from: prev.role, to: next.role });
  }

  private record(attach: (n: NetService) => () => void): () => void {
    const sub: Sub = { attach, off: null };
    sub.off = attach(this.impl);
    this.subs.add(sub);
    return () => { sub.off?.(); sub.off = null; this.subs.delete(sub); };
  }

  get role(): NetRole { return this.impl.role; }
  get localPlayer(): PlayerId { return this.impl.localPlayer; }
  session(): SessionInfo { return this.impl.session(); }
  isAuthority(): boolean { return this.impl.isAuthority(); }
  inputsFor(tick: number): Map<PlayerId, InputFrame[]> { return this.impl.inputsFor(tick); }
  send(msg: ClientMsg): void { this.impl.send(msg); }
  openVote(v: Omit<VoteOpen, 'voteId' | 'deadlineMs'>, timeoutMs?: number): Promise<number> { return this.impl.openVote(v, timeoutMs); }
  flush(tick: number, t: number): void { this.impl.flush(tick, t); }
  partySize(): number { return this.impl.partySize(); }

  addProvider(p: SnapshotProvider): () => void { return this.record((n) => n.addProvider(p)); }
  addConsumer(c: SnapshotConsumer): () => void { return this.record((n) => n.addConsumer(c)); }
  addStateSync(s: StateSync): () => void { return this.record((n) => n.addStateSync(s)); }
  on<T extends ServerMsg['type']>(type: T, fn: (msg: Extract<ServerMsg, { type: T }>) => void): () => void { return this.record((n) => n.on(type, fn)); }
  onMembers(fn: (members: PartyMember[]) => void): () => void { return this.record((n) => n.onMembers(fn)); }
  onClient<T extends ClientMsg['type']>(type: T, fn: (msg: Extract<ClientMsg, { type: T }>, from: PlayerId) => void): () => void {
    return this.record((n) => n.onClient(type, fn));
  }
}
