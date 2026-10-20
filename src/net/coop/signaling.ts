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

/** `attempt`: one per join() call. A guest who comes back (same peer id) is a NEW knock; its repeats within one attempt aren't. */
type Wire = { room: string; peer: string; attempt: string; from: 'host' | 'guest'; msg?: SignalMsg; knock?: true; hostHere?: true };

/** Same-browser signalling over BroadcastChannel (tests, local dev). */
export class LocalSignaling implements Signaling {
  private bc = new BroadcastChannel('hollowcrown-signal');

  async host(code: string, _hostId: string, onPeer: (peerId: string, ch: SignalChannel) => void): Promise<() => void> {
    const peers = new Map<string, { attempt: string; handlers: Set<(m: SignalMsg) => void> }>();
    const onMsg = (ev: MessageEvent<Wire>) => {
      const w = ev.data;
      if (w.room !== code || w.from !== 'guest') return;
      const cur = peers.get(w.peer);
      if (w.knock) {
        const here = () => this.bc.postMessage({ room: code, peer: w.peer, attempt: w.attempt, from: 'host', hostHere: true } satisfies Wire);
        if (cur?.attempt === w.attempt) { here(); return; } // a repeat knock (the first answer may have been missed)
        // a new attempt, possibly from a guest who left or dropped: it replaces the old channel (rejoin by code)
        const entry = { attempt: w.attempt, handlers: new Set<(m: SignalMsg) => void>() };
        peers.set(w.peer, entry);
        here();
        onPeer(w.peer, {
          send: (msg) => this.bc.postMessage({ room: code, peer: w.peer, attempt: entry.attempt, from: 'host', msg } satisfies Wire),
          onMessage: (fn) => { entry.handlers.add(fn); return () => entry.handlers.delete(fn); },
          close: () => { if (peers.get(w.peer) === entry) peers.delete(w.peer); },
        });
        return;
      }
      if (w.msg && cur?.attempt === w.attempt) for (const fn of cur.handlers) fn(w.msg); // stale attempts are ignored
    };
    this.bc.addEventListener('message', onMsg);
    return () => this.bc.removeEventListener('message', onMsg);
  }

  join(code: string, peerId: string): Promise<SignalChannel> {
    const attempt = crypto.randomUUID().slice(0, 8);
    return new Promise((resolve, reject) => {
      const handlers = new Set<(m: SignalMsg) => void>();
      let welcomed = false;
      const onMsg = (ev: MessageEvent<Wire>) => {
        const w = ev.data;
        if (w.room !== code || w.peer !== peerId || w.attempt !== attempt || w.from !== 'host') return;
        if (w.hostHere) {
          if (welcomed) return;
          welcomed = true;
          resolve({
            send: (msg) => this.bc.postMessage({ room: code, peer: peerId, attempt, from: 'guest', msg } satisfies Wire),
            onMessage: (fn) => { handlers.add(fn); return () => handlers.delete(fn); },
            close: () => this.bc.removeEventListener('message', onMsg),
          });
          return;
        }
        if (w.msg) for (const fn of handlers) fn(w.msg);
      };
      this.bc.addEventListener('message', onMsg);
      // knock every second (a busy host tab may miss one), give up after 10 s
      const knock = () => this.bc.postMessage({ room: code, peer: peerId, attempt, from: 'guest', knock: true } satisfies Wire);
      knock();
      const again = setInterval(() => { if (welcomed) clearInterval(again); else knock(); }, 1000);
      setTimeout(() => { clearInterval(again); if (!welcomed) { this.bc.removeEventListener('message', onMsg); reject(new Error('No game found with that code')); } }, 10000);
    });
  }
}
