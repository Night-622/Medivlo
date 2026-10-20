/** Shared plumbing for HostNet/GuestNet: server-msg handlers, providers/consumers, state syncs, members. */
import type {
  ClientMsg, NetRole, NetService, PartyMember, PlayerId, ServerMsg, SessionInfo, SnapshotConsumer, SnapshotProvider, StateSync,
} from '../types';

export abstract class NetBase implements Partial<NetService> {
  abstract readonly role: NetRole;
  abstract readonly localPlayer: PlayerId;
  protected providers = new Set<SnapshotProvider>();
  protected consumers = new Set<SnapshotConsumer>();
  protected syncs = new Set<StateSync>();
  protected serverHandlers = new Map<ServerMsg['type'], Set<(m: ServerMsg) => void>>();
  protected clientHandlers = new Map<ClientMsg['type'], Set<(m: ClientMsg, from: PlayerId) => void>>();
  protected memberHandlers = new Set<(m: PartyMember[]) => void>();
  protected info!: SessionInfo;

  session(): SessionInfo { return this.info; }
  partySize(): number { return this.info.members.filter((m) => m.connected).length; }
  addProvider(p: SnapshotProvider): () => void { this.providers.add(p); return () => this.providers.delete(p); }
  addConsumer(c: SnapshotConsumer): () => void { this.consumers.add(c); return () => this.consumers.delete(c); }
  addStateSync(s: StateSync): () => void { this.syncs.add(s); return () => this.syncs.delete(s); }

  on<T extends ServerMsg['type']>(type: T, fn: (msg: Extract<ServerMsg, { type: T }>) => void): () => void {
    let set = this.serverHandlers.get(type);
    if (!set) this.serverHandlers.set(type, (set = new Set()));
    const h = fn as (m: ServerMsg) => void;
    set.add(h);
    return () => set!.delete(h);
  }

  onClient<T extends ClientMsg['type']>(type: T, fn: (msg: Extract<ClientMsg, { type: T }>, from: PlayerId) => void): () => void {
    let set = this.clientHandlers.get(type);
    if (!set) this.clientHandlers.set(type, (set = new Set()));
    const h = fn as (m: ClientMsg, from: PlayerId) => void;
    set.add(h);
    return () => set!.delete(h);
  }

  onMembers(fn: (members: PartyMember[]) => void): () => void {
    fn(this.info.members);
    this.memberHandlers.add(fn);
    return () => this.memberHandlers.delete(fn);
  }

  // Each handler is isolated: a malformed remote message that throws in one domain's handler (world, systems,
  // narrative all listen to 'act') must not stop the others or the transport loop that called us.
  protected emitServer(msg: ServerMsg): void {
    for (const fn of this.serverHandlers.get(msg.type) ?? []) { try { fn(msg); } catch (e) { console.warn(`[net] '${msg.type}' handler threw`, e); } }
  }
  protected emitClient(msg: ClientMsg, from: PlayerId): void {
    for (const fn of this.clientHandlers.get(msg.type) ?? []) { try { fn(msg, from); } catch (e) { console.warn(`[net] client '${msg.type}' handler threw`, e); } }
  }
  protected emitMembers(): void { for (const fn of this.memberHandlers) fn(this.info.members); }
}
