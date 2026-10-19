/**
 * Friends + presence (docs/REBUILD.md § Multiplayer: friend codes; join through a friend). Owner: Claude 1.
 * Friends are a personal list (profiles/{me}/friends/{uid}); adding needs only their friend code.
 * Presence lives on the public profile: lastSeen (heartbeat while the game is open) and hosting (join code or null),
 * so a friend's list can show Online / Hosting and join with one click (or by typing the friend code in Join Game).
 */
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { firebase } from './app';
import { isFirebaseConfigured } from './config';

export interface Friend { uid: string; name: string; friendCode: string; online: boolean; hosting: string | null; lastSeen: number }

const ONLINE_MS = 2.5 * 60_000;
const BEAT_MS = 60_000;
const codeKey = (code: string) => code.replace(/[\s-]/g, '').toUpperCase();

function me(): string {
  const user = firebase().auth.currentUser;
  if (!user) throw new Error('Sign in to use friends');
  return user.uid;
}

/** Friend code → { uid, name }. */
async function lookup(code: string): Promise<{ uid: string; name: string }> {
  const key = codeKey(code);
  if (key.length !== 8) throw new Error('Friend codes are 8 letters/numbers');
  const c = await getDoc(doc(firebase().db, 'friendCodes', key));
  if (!c.exists()) throw new Error('No one has that friend code');
  const uid = c.data().uid as string;
  const p = await getDoc(doc(firebase().db, 'profiles', uid));
  return { uid, name: (p.data()?.name as string | undefined) ?? 'Hero' };
}

export async function addFriend(code: string): Promise<{ uid: string; name: string }> {
  const self = me();
  const f = await lookup(code);
  if (f.uid === self) throw new Error('That\'s your own code');
  await setDoc(doc(firebase().db, 'profiles', self, 'friends', f.uid), { name: f.name, addedAt: Date.now() });
  return f;
}

export async function removeFriend(uid: string): Promise<void> {
  await deleteDoc(doc(firebase().db, 'profiles', me(), 'friends', uid));
}

export async function listFriends(): Promise<Friend[]> {
  const snaps = await getDocs(collection(firebase().db, 'profiles', me(), 'friends'));
  const now = Date.now();
  const out = await Promise.all(snaps.docs.map(async (d) => {
    const p = (await getDoc(doc(firebase().db, 'profiles', d.id)).catch(() => null))?.data() ?? {};
    const lastSeen = Number(p.lastSeen ?? 0);
    const online = now - lastSeen < ONLINE_MS;
    return {
      uid: d.id, name: (p.name as string | undefined) ?? (d.data().name as string), friendCode: (p.friendCode as string | undefined) ?? '',
      online, hosting: online ? ((p.hosting as string | null | undefined) ?? null) : null, lastSeen,
    };
  }));
  return out.sort((a, b) => Number(!!b.hosting) - Number(!!a.hosting) || Number(b.online) - Number(a.online) || a.name.localeCompare(b.name));
}

/** The join code a friend is hosting right now (by friend code), for Join Game. */
export async function hostedCodeOf(friendCode: string): Promise<string> {
  const f = await lookup(friendCode);
  const p = (await getDoc(doc(firebase().db, 'profiles', f.uid))).data() ?? {};
  const online = Date.now() - Number(p.lastSeen ?? 0) < ONLINE_MS;
  if (!online || !p.hosting) throw new Error(`${f.name} isn't hosting a game right now`);
  return p.hosting as string;
}

// ───────── presence ─────────

let beat: ReturnType<typeof setInterval> | null = null;
let hosting: string | null = null;

async function writePresence(): Promise<void> {
  const user = firebase().auth.currentUser;
  if (!user) return;
  await setDoc(doc(firebase().db, 'profiles', user.uid), { lastSeen: Date.now(), hosting }, { merge: true }).catch(() => undefined);
}

/** Starts the heartbeat (idempotent). Call once a player is signed in; stops when the tab closes. */
export function startPresence(): void {
  if (!isFirebaseConfigured || beat) return;
  void writePresence();
  beat = setInterval(() => void writePresence(), BEAT_MS);
  addEventListener('pagehide', () => { hosting = null; void writePresence(); });
}

/** Called by the co-op session when hosting starts (join code) or ends (null). */
export function setHosting(code: string | null): void {
  hosting = code;
  if (isFirebaseConfigured) void writePresence();
}
