/**
 * One WebRTC connection between the host and a guest, with two data channels:
 *  - 'rel'  reliable + ordered: events, session, votes, chat, state, act…
 *  - 'fast' unreliable + unordered: snapshots (host→guest) and inputs (guest→host)
 * Messages are JSON. The GUEST creates the offer; the HOST answers.
 */
import type { SignalChannel, SignalMsg } from './signaling';

/** Public STUN (address discovery only; no game data passes through it). TURN can be added for strict NATs. */
const ICE: RTCConfiguration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
const FAST_TYPES = new Set(['snapshot', 'input']);

export class PeerLink {
  readonly pc = new RTCPeerConnection(ICE);
  private rel?: RTCDataChannel;
  private fast?: RTCDataChannel;
  private handlers = new Set<(msg: unknown) => void>();
  private closeHandlers = new Set<() => void>();
  private offSignal: () => void;
  private openResolve!: () => void;
  readonly opened: Promise<void> = new Promise((r) => { this.openResolve = r; });

  constructor(private sig: SignalChannel, role: 'host' | 'guest') {
    this.pc.onicecandidate = (e) => { if (e.candidate) sig.send({ t: 'ice', c: e.candidate.toJSON() }); };
    this.pc.onconnectionstatechange = () => {
      if (['failed', 'closed', 'disconnected'].includes(this.pc.connectionState)) this.fireClose();
    };
    if (role === 'guest') {
      this.attach(this.pc.createDataChannel('rel', { ordered: true }));
      this.attach(this.pc.createDataChannel('fast', { ordered: false, maxRetransmits: 0 }));
    } else {
      this.pc.ondatachannel = (e) => this.attach(e.channel);
    }
    this.offSignal = sig.onMessage((m) => void this.onSignal(m, role));
  }

  /** Guest only: start the handshake. */
  async start(): Promise<void> {
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    this.sig.send({ t: 'offer', sdp: offer.sdp ?? '' });
  }

  private async onSignal(m: SignalMsg, role: 'host' | 'guest'): Promise<void> {
    try {
      if (m.t === 'offer' && role === 'host') {
        await this.pc.setRemoteDescription({ type: 'offer', sdp: m.sdp });
        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);
        this.sig.send({ t: 'answer', sdp: answer.sdp ?? '' });
      } else if (m.t === 'answer' && role === 'guest') {
        await this.pc.setRemoteDescription({ type: 'answer', sdp: m.sdp });
      } else if (m.t === 'ice') {
        await this.pc.addIceCandidate(m.c);
      } else if (m.t === 'reject') {
        this.fireClose();
      }
    } catch (e) { console.warn('[coop] signal error', e); }
  }

  private attach(ch: RTCDataChannel): void {
    if (ch.label === 'rel') this.rel = ch; else this.fast = ch;
    ch.onmessage = (e) => { let m: unknown; try { m = JSON.parse(String(e.data)); } catch { return; } for (const fn of this.handlers) fn(m); };
    ch.onopen = () => { if (this.rel?.readyState === 'open' && this.fast?.readyState === 'open') this.openResolve(); };
    ch.onclose = () => this.fireClose();
  }

  send(msg: { type: string; [k: string]: unknown } | import("../types").ServerMsg | import("../types").ClientMsg): void {
    const ch = FAST_TYPES.has(msg.type) ? this.fast : this.rel;
    if (ch?.readyState === 'open') ch.send(JSON.stringify(msg));
  }

  onMessage(fn: (msg: unknown) => void): () => void { this.handlers.add(fn); return () => this.handlers.delete(fn); }
  onClose(fn: () => void): () => void { this.closeHandlers.add(fn); return () => this.closeHandlers.delete(fn); }

  close(): void { this.offSignal(); this.sig.close(); this.pc.close(); this.fireClose(); }

  private closed = false;
  private fireClose(): void { if (this.closed) return; this.closed = true; for (const fn of this.closeHandlers) fn(); }
}
