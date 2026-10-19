/**
 * WebRTC signalling for co-op. Two implementations of one interface:
 *  - LocalSignaling: BroadcastChannel (same browser, two tabs) for tests and dev without Firebase.
 *  - FirestoreSignaling (firestoreSignaling.ts): rooms/{code}/peers/{peerId}/msgs for real games.
 * Messages are SDP offers/answers and ICE candidates between ONE host and each guest.
 */
export type SignalMsg =
  | { t: 'offer'; sdp: string }
  | { t: 'answer'; sdp: string }
  | { t: 'ice'; c: RTCIceCandidateInit }
  | { t: 'reject'; reason: string };

export interface SignalChannel {
  send(msg: SignalMsg): void;
  onMessage(fn: (msg: SignalMsg) => void): () => void;
  close(): void;
}

export interface Signaling {
  /** Host opens a room; `onPeer` fires for each guest that knocks. Returns a closer. */
  host(code: string, hostId: string, onPeer: (peerId: string, ch: SignalChannel) => void): Promise<() => void>;
  /** Guest knocks on a room. Rejects if the room doesn't exist. */
  join(code: string, peerId: string): Promise<SignalChannel>;
}

type Wire = { room: string; peer: string; from: 'host' | 'guest'; msg?: SignalMsg; knock?: true; hostHere?: true };

/** Same-browser signalling over BroadcastChannel (tests, local dev). */
export class LocalSignaling implements Signaling {
  private bc = new BroadcastChannel('hollowcrown-signal');

  async host(code: string, _hostId: string, onPeer: (peerId: string, ch: SignalChannel) => void): Promise<() => void> {
    const peers = new Map<string, Set<(m: SignalMsg) => void>>();
    const onMsg = (ev: MessageEvent<Wire>) => {
      const w = ev.data;
      if (w.room !== code || w.from !== 'guest') return;
      if (w.knock) {
        if (peers.has(w.peer)) return;
        const handlers = new Set<(m: SignalMsg) => void>();
        peers.set(w.peer, handlers);
        this.bc.postMessage({ room: code, peer: w.peer, from: 'host', hostHere: true } satisfies Wire);
        onPeer(w.peer, {
          send: (msg) => this.bc.postMessage({ room: code, peer: w.peer, from: 'host', msg } satisfies Wire),
          onMessage: (fn) => { handlers.add(fn); return () => handlers.delete(fn); },
          close: () => peers.delete(w.peer),
        });
        return;
      }
      if (w.msg) for (const fn of peers.get(w.peer) ?? []) fn(w.msg);
    };
    this.bc.addEventListener('message', onMsg);
    return () => this.bc.removeEventListener('message', onMsg);
  }

  join(code: string, peerId: string): Promise<SignalChannel> {
    return new Promise((resolve, reject) => {
      const handlers = new Set<(m: SignalMsg) => void>();
      let welcomed = false;
      const onMsg = (ev: MessageEvent<Wire>) => {
        const w = ev.data;
        if (w.room !== code || w.peer !== peerId || w.from !== 'host') return;
        if (w.hostHere && !welcomed) {
          welcomed = true;
          resolve({
            send: (msg) => this.bc.postMessage({ room: code, peer: peerId, from: 'guest', msg } satisfies Wire),
            onMessage: (fn) => { handlers.add(fn); return () => handlers.delete(fn); },
            close: () => this.bc.removeEventListener('message', onMsg),
          });
          return;
        }
        if (w.msg) for (const fn of handlers) fn(w.msg);
      };
      this.bc.addEventListener('message', onMsg);
      // knock every second (a busy host tab may miss one), give up after 10 s
      const knock = () => this.bc.postMessage({ room: code, peer: peerId, from: 'guest', knock: true } satisfies Wire);
      knock();
      const again = setInterval(() => { if (welcomed) clearInterval(again); else knock(); }, 1000);
      setTimeout(() => { clearInterval(again); if (!welcomed) { this.bc.removeEventListener('message', onMsg); reject(new Error('No game found with that code')); } }, 10000);
    });
  }
}
