/**
 * Real co-op signalling over Firestore (requires a signed-in Firebase user).
 *   rooms/{code}                         { host: uid, open: true, createdAt }
 *   rooms/{code}/peers/{peerId}          { createdAt }            ← a guest knocking
 *   rooms/{code}/peers/{peerId}/msgs/*   { from: 'host'|'guest', m: SignalMsg (JSON), ts }
 * Only SDP/ICE passes through Firestore; game traffic is peer-to-peer (WebRTC).
 */
import {
  addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, query, serverTimestamp, setDoc, where, type Firestore,
} from 'firebase/firestore';
import type { SignalChannel, SignalMsg, Signaling } from './signaling';

export class FirestoreSignaling implements Signaling {
  constructor(private db: Firestore) {}

  async host(code: string, hostId: string, onPeer: (peerId: string, ch: SignalChannel) => void): Promise<() => void> {
    const room = doc(this.db, 'rooms', code);
    await setDoc(room, { host: hostId, open: true, createdAt: serverTimestamp() });
    const seen = new Set<string>();
    const offPeers = onSnapshot(collection(room, 'peers'), (snap) => {
      for (const ch of snap.docChanges()) {
        if (ch.type !== 'added' || seen.has(ch.doc.id)) continue;
        seen.add(ch.doc.id);
        onPeer(ch.doc.id, this.channel(code, ch.doc.id, 'host'));
      }
    });
    return () => { offPeers(); void setDoc(room, { open: false }, { merge: true }).catch(() => undefined); };
  }

  async join(code: string, peerId: string): Promise<SignalChannel> {
    const room = await getDoc(doc(this.db, 'rooms', code));
    if (!room.exists() || room.data().open === false) throw new Error('No game found with that code');
    await setDoc(doc(this.db, 'rooms', code, 'peers', peerId), { createdAt: serverTimestamp() });
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
