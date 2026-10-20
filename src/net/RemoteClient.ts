/**
 * Client side of a remote authority (co-op guest over WebRTC, public-realm player over WebSocket).
 * Never simulates: sends inputs/requests, applies snapshots, re-emits replicated events, applies state syncs.
 */
import { bus } from '@/core/EventBus';
import type { GameEventName, GameEvents } from '@/core/events';
import type { ClientMsg, InputFrame, NetRole, NetService, PlayerId, ServerMsg, StateSync, VoteOpen } from './types';
import { NetBase } from './coop/base';

export abstract class RemoteClient extends NetBase implements NetService {
  abstract readonly role: NetRole;
  readonly localPlayer: PlayerId;
  worldSeed = 0;

  protected constructor(playerId: PlayerId) { super(); this.localPlayer = playerId; }

  protected abstract transportSend(msg: ClientMsg): void;

  isAuthority(): boolean { return false; }
  inputsFor(): Map<PlayerId, InputFrame[]> { return new Map(); }
  flush(): void { /* clients don't simulate */ }
  send(msg: ClientMsg): void { this.transportSend(msg); }
  openVote(_v: Omit<VoteOpen, 'voteId' | 'deadlineMs'>): Promise<number> { return Promise.reject(new Error('Only the authority opens votes')); }

  /**
   * State blocks arrive once on join, but syncs can register later (WorldV2 adds 'world-clock' ~0.4 s after the
   * join, and again on every scene restart): those get the last block at once and ask the authority for fresh ones.
   */
  private blocks: Record<string, unknown> = {};
  private welcomed = false;
  private asking = false;

  addStateSync(s: StateSync): () => void {
    const off = super.addStateSync(s);
    if (s.name in this.blocks) { try { s.apply(this.blocks[s.name]); } catch (e) { console.warn('[net] sync apply failed', s.name, e); } }
    if (this.welcomed && !this.asking) {
      this.asking = true; // one request for a burst of registrations (a scene's create)
      queueMicrotask(() => { this.asking = false; this.transportSend({ type: 'state:request' }); });
    }
    return off;
  }

  private kicked = false;
  /** Set by leave(): the transport closing afterwards is our own doing, not a kick (no 'net:kicked' → title). */
  protected leaving = false;

  /** Feed every message from the authority through here. */
  protected onServer(m: ServerMsg): void {
    switch (m.type) {
      case 'welcome': this.info = m.session; this.worldSeed = m.worldSeed; this.welcomed = true; break;
      case 'snapshot':
        for (const c of this.consumers) c.apply(m.snap.entities.filter((e) => c.kinds.includes(e.kind)), m.snap.removed, m.snap);
        break;
      case 'event':
        (bus.emit as <K extends GameEventName>(n: K, p: GameEvents[K]) => void)(m.name, m.payload as GameEvents[typeof m.name]);
        break;
      case 'session': this.info = m.session; this.emitMembers(); break;
      case 'state':
        Object.assign(this.blocks, m.blocks);
        for (const s of this.syncs) if (s.name in m.blocks) { try { s.apply(m.blocks[s.name]); } catch (e) { console.warn('[net] sync apply failed', s.name, e); } }
        break;
      case 'kick': if (!this.kicked && !this.leaving) { this.kicked = true; bus.emit('net:kicked', { reason: m.reason }); } break;
      default: break;
    }
    this.emitServer(m);
  }
}
