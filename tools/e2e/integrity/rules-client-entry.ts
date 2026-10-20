// Bundle entry for tools/e2e/integrity-rules.mjs (--client): the game's REAL Firebase client code against the auth and
// Firestore emulators, so a rules change can't silently break sign-up, saves, friends, reports or co-op signalling.
import { connectAuthEmulator, getAuth, signInAnonymously, signOut } from 'firebase/auth';
import { addDoc, collection, connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebase } from '@/firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { currentAccount, playAsGuest, signUpUsername } from '@/firebase/accounts';
import { addFriend, listFriends, setHosting, startPresence } from '@/firebase/friends';
import { SaveService } from '@/firebase/SaveService';
import { Social } from '@/net/social';
import { FirestoreSignaling } from '@/net/coop/firestoreSignaling';
import { createNewGameState } from '@/core/GameState';

export async function run(authPort: number, fsPort: number): Promise<{ name: string; ok: boolean; detail?: string }[]> {
  const { auth, db } = firebase();
  connectAuthEmulator(auth, `http://127.0.0.1:${authPort}`, { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', fsPort);
  const out: { name: string; ok: boolean; detail?: string }[] = [];
  const step = async (name: string, fn: () => Promise<unknown>) => {
    try { const r = await fn(); out.push({ name, ok: r !== false, detail: r === false ? 'returned false' : undefined }); }
    catch (e) { out.push({ name, ok: false, detail: (e as { code?: string; message?: string }).code ?? (e as Error).message }); }
  };

  // a guest: profile + friend code, presence, hosting, a cloud save
  await step('guest sign-in + profile (playAsGuest)', () => playAsGuest('Gus'));
  const gusCode = (await currentAccount())?.friendCode ?? '';
  await step('presence + hosting (friends.ts)', async () => { startPresence(); setHosting('ABCDEF'); await new Promise((r) => setTimeout(r, 400)); setHosting(null); await new Promise((r) => setTimeout(r, 400)); });
  await step('cloud save (SaveService.save writes the cloud copy)', async () => {
    const s = createNewGameState(0); s.player.name = 'Gus';
    let cloud = false; const { bus } = await import('@/core/EventBus');
    const off = bus.on('game:saved', (e) => { cloud = e.cloud; }); await SaveService.save(s); off();
    return cloud;
  });
  await step('cloud save reads back (SaveService.list)', async () => (await SaveService.list())[0]?.name === 'Gus');
  await step('chat report (Social.report)', () => Social.report('someone', 'Someone', ['hi', 'there']));
  await step('crash report (clientErrors, errors.ts shape)', async () => {
    const u = auth.currentUser!;
    await addDoc(collection(db, 'clientErrors'), { uid: u.uid, build: '0.9.0 · test', message: 'Test error', stack: 'Error: Test\n at x', scenes: 'MainMenu,HudV2', role: 'solo', ua: 'Mozilla/5.0 (test)'.slice(0, 160), at: Date.now() });
  });
  // the guest becomes a username account (link): username claim needs the token's email (proposed rules)
  await step('username sign-up from a guest (link + claim + vault)', () => signUpUsername(`carol${Date.now() % 100000}`, 'pw-123456'));
  // a second player adds the guest-now-username by friend code and lists friends
  await signOut(auth);
  await step('second player signs in', () => signInAnonymously(auth));
  await step('add a friend by code (addFriend)', () => addFriend(gusCode));
  await step('list friends (listFriends)', async () => (await listFriends()).length === 1);
  // co-op signalling between two different accounts: host on this app, guest on a second one
  await step('co-op: host opens a room, a guest joins and they exchange signalling', async () => {
    const hostSig = new FirestoreSignaling(db);
    const got: unknown[] = [];
    let peerCh: { onMessage(fn: (m: unknown) => void): () => void; send(m: unknown): void } | null = null;
    const close = await hostSig.host('TESTR1', auth.currentUser!.uid, (_id, ch) => { peerCh = ch as never; ch.onMessage((m) => got.push(m)); });
    const app2 = initializeApp(firebaseConfig, 'guest');
    const auth2 = getAuth(app2); connectAuthEmulator(auth2, `http://127.0.0.1:${authPort}`, { disableWarnings: true });
    const db2 = getFirestore(app2); connectFirestoreEmulator(db2, '127.0.0.1', fsPort);
    const g = await signInAnonymously(auth2);
    const guestSig = new FirestoreSignaling(db2);
    const gch = await guestSig.join('TESTR1', g.user.uid);
    const back: unknown[] = []; gch.onMessage((m) => back.push(m));
    gch.send({ t: 'offer', sdp: 'v=0 test' });
    for (let i = 0; i < 40 && (!got.length || !peerCh); i++) await new Promise((r) => setTimeout(r, 100));
    peerCh?.send({ t: 'answer', sdp: 'v=0 answer' });
    for (let i = 0; i < 40 && !back.length; i++) await new Promise((r) => setTimeout(r, 100));
    // and the same guest rejoins (delete knock + msgs, knock again)
    gch.close();
    const gch2 = await guestSig.join('TESTR1', g.user.uid);
    gch2.close(); close();
    return got.length > 0 && back.length > 0;
  });
  return out;
}
