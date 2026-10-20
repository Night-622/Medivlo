/**
 * Real co-op signalling over Firestore (requires a signed-in Firebase user).
 *   rooms/{code}                         { host: uid, open: true, createdAt }
 *   rooms/{code}/peers/{peerId}          { createdAt }            ← a guest knocking
 *   rooms/{code}/peers/{peerId}/msgs/*   { from: 'host'|'guest', m: SignalMsg (JSON), ts }
 * Only SDP/ICE passes through Firestore; game traffic is peer-to-peer (WebRTC).
 */
import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc, where, type Firestore,
} from 'firebase/firestore';
import type { SignalChannel, SignalMsg, Signaling } from './signaling';

export class FirestoreSignaling implements Signaling {
  constructor(private db: Firestore) {}

  async host(code: string, hostId: string, onPeer: (peerId: string, ch: SignalChannel) => void): Promise<() => void> {
    const room = doc(this.db, 'rooms', code);
    await setDoc(room, { host: hostId, open: true, createdAt: serverTimestamp() });
    // A guest who comes back (drop-in, or after a dropped connection) deletes its old knock and knocks again with a
    // new nonce. Firestore may report that as removed + added or, coalesced, as modified: either way it's a new knock.
    const knocks = new Map<string, { nonce: unknown; ch: SignalChannel }>();
    const offPeers = onSnapshot(collection(room, 'peers'), (snap) => {
      for (const ch of snap.docChanges()) {
        const id = ch.doc.id;
        const prev = knocks.get(id);
        if (ch.type === 'removed') { prev?.ch.close(); knocks.delete(id); continue; }
        const nonce = ch.doc.data().nonce ?? null;
        if (prev && prev.nonce === nonce) continue;
        prev?.ch.close(); // the old channel would also read (and delete) the new attempt's offer
        const sig = this.channel(code, id, 'host');
        knocks.set(id, { nonce, ch: sig });
        onPeer(id, sig);
      }
    });
    return () => {
      offPeers();
      for (const k of knocks.values()) k.ch.close();
      void setDoc(room, { open: false }, { merge: true }).catch(() => undefined);
    };
  }

  async join(code: string, peerId: string): Promise<SignalChannel> {
    const room = await getDoc(doc(this.db, 'rooms', code));
    if (!room.exists() || room.data().open === false) throw new Error('No game found with that code');
    // Rejoining the same room: the rules allow create (not update) on our knock, and leftover SDP/ICE from the last
    // attempt would be replayed into the new connection. Clear both first.
    const peer = doc(this.db, 'rooms', code, 'peers', peerId);
    const stale = await getDocs(collection(peer, 'msgs')).catch(() => null);
    await Promise.all((stale?.docs ?? []).map((d) => deleteDoc(d.ref).catch(() => undefined)));
    await deleteDoc(peer).catch(() => undefined);
    await setDoc(peer, { createdAt: serverTimestamp(), nonce: crypto.randomUUID() });
    return this.channel(code, peerId, 'guest');
  }

  private channel(code: string, peerId: string, me: 'host' | 'guest'): SignalChannel {
    const msgs = collection(this.db, 'rooms', code, 'peers', peerId, 'msgs');
    const other = me === 'host' ? 'guest' : 'host';
    const handlers = new Set<(m: SignalMsg) => void>();
    const off = onSnapshot(query(msgs, where('from', '==', other)), (snap) => {
      for (const ch of snap.docChanges()) {
        if (ch.type !== 'added') continue;
        let m: SignalMsg;
        try { m = JSON.parse(ch.doc.data().m as string) as SignalMsg; } catch { continue; }
        for (const fn of handlers) fn(m);
        void deleteDoc(ch.doc.ref).catch(() => undefined);
      }
    });
    return {
      send: (m) => { void addDoc(msgs, { from: me, m: JSON.stringify(m), ts: serverTimestamp() }); },
      onMessage: (fn) => { handlers.add(fn); return () => handlers.delete(fn); },
      close: () => off(),
    };
  }
}
