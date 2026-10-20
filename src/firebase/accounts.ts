/**
 * Accounts (docs/REBUILD.md § Multiplayer): email + password · username + password (no email; recovery code) ·
 * guest (device-only, anonymous). Owner: Claude 1.
 *
 * Username accounts use a synthetic, never-mailed email so Firebase Auth can store the password. Recovery
 * without email works client-side: the password is encrypted with a key derived from a one-time recovery code
 * (PBKDF2 → AES-GCM) and only that ciphertext is stored. Knowing the code decrypts it; nobody else can.
 */
import {
  EmailAuthProvider, createUserWithEmailAndPassword, linkWithCredential, signInAnonymously, signInWithEmailAndPassword,
  sendPasswordResetEmail, signOut, updatePassword, verifyBeforeUpdateEmail, type User,
} from 'firebase/auth';
import { doc, getDoc, runTransaction, setDoc } from 'firebase/firestore';
import { firebase } from './app';
import { newFriendCode, randomCode } from '@/net/coop/codes';

const SYNTH_DOMAIN = 'players.thehollowcrown.invalid';
const USERNAME_RE = /^[a-z0-9_]{3,16}$/;

export type AccountKind = 'email' | 'username' | 'guest';

export function normaliseUsername(name: string): string { return name.trim().toLowerCase(); }
const synthEmail = (username: string) => `${normaliseUsername(username)}@${SYNTH_DOMAIN}`;

export function accountKind(user: User | null): AccountKind | null {
  if (!user) return null;
  if (user.isAnonymous) return 'guest';
  return user.email?.endsWith(`@${SYNTH_DOMAIN}`) ? 'username' : 'email';
}

// ───────── email ─────────

export async function signUpEmail(email: string, password: string, displayName: string): Promise<User> {
  const { auth } = firebase();
  const cur = auth.currentUser;
  const user = cur?.isAnonymous
    ? (await linkWithCredential(cur, EmailAuthProvider.credential(email, password))).user // keep guest progress
    : (await createUserWithEmailAndPassword(auth, email, password)).user;
  await ensureProfile(user, displayName);
  return user;
}

export async function signInEmail(email: string, password: string): Promise<User> {
  return (await signInWithEmailAndPassword(firebase().auth, email, password)).user;
}

/** Email accounts: Firebase mails a reset link. */
export async function resetEmailPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(firebase().auth, email.trim());
}

// ───────── username + recovery code ─────────

/** Creates a username account. Returns the one-time RECOVERY CODE to show the player (store nothing else). */
export async function signUpUsername(username: string, password: string): Promise<{ user: User; recoveryCode: string }> {
  const name = normaliseUsername(username);
  if (!USERNAME_RE.test(name)) throw new Error('Usernames are 3–16 letters, numbers or _');
  const { auth, db } = firebase();
  if ((await getDoc(doc(db, 'usernames', name))).exists()) throw new Error('That username is taken');
  const cur = auth.currentUser;
  const user = cur?.isAnonymous
    ? (await linkWithCredential(cur, EmailAuthProvider.credential(synthEmail(name), password))).user
    : (await createUserWithEmailAndPassword(auth, synthEmail(name), password)).user;
  // the username claim is checked against the token's email (rules: only that account may claim the name), so make
  // sure the token we send already carries it (a guest that was just linked may still hold its anonymous token)
  await user.getIdToken(true);
  await runTransaction(db, async (tx) => {
    const ref = doc(db, 'usernames', name);
    if ((await tx.get(ref)).exists()) throw new Error('That username is taken');
    tx.set(ref, { uid: user.uid });
  });
  const recoveryCode = await writeVault(name, user.uid, password);
  await ensureProfile(user, username.trim());
  return { user, recoveryCode };
}

export async function signInUsername(username: string, password: string): Promise<User> {
  return (await signInWithEmailAndPassword(firebase().auth, synthEmail(username), password)).user;
}

/** Forgot password: recovery code → sets a new password. Returns a NEW recovery code (the old one is spent). */
export async function recoverUsername(username: string, recoveryCode: string, newPassword: string): Promise<string> {
  const name = normaliseUsername(username);
  const snap = await getDoc(doc(firebase().db, 'recovery', name));
  if (!snap.exists()) throw new Error('No recovery set up for that username');
  const v = snap.data() as { salt: string; iv: string; ct: string };
  let oldPassword: string;
  try { oldPassword = await decrypt(recoveryCode, v); } catch { throw new Error('That recovery code is not right'); }
  const user = await signInUsername(name, oldPassword);
  await updatePassword(user, newPassword);
  return writeVault(name, user.uid, newPassword);
}

// ───────── guest ─────────

export async function playAsGuest(displayName: string): Promise<User> {
  const user = (await signInAnonymously(firebase().auth)).user;
  await ensureProfile(user, displayName);
  return user;
}

// ───────── shared ─────────

/** Username accounts (and others) can attach a real email any time; Firebase sends a verification link. */
export async function addEmail(email: string): Promise<void> {
  const user = firebase().auth.currentUser;
  if (!user) throw new Error('Not signed in');
  await verifyBeforeUpdateEmail(user, email);
}

export async function logOut(): Promise<void> { await signOut(firebase().auth); }

/** profiles/{uid} with a unique friend code (friendCodes/{code} → uid). */
export async function ensureProfile(user: User, displayName: string): Promise<{ friendCode: string }> {
  const { db } = firebase();
  const ref = doc(db, 'profiles', user.uid);
  const cur = await getDoc(ref);
  if (cur.exists() && cur.data().friendCode) return { friendCode: cur.data().friendCode as string };
  for (let i = 0; i < 5; i++) {
    const code = newFriendCode();
    const ok = await runTransaction(db, async (tx) => {
      const c = doc(db, 'friendCodes', code.replace('-', ''));
      if ((await tx.get(c)).exists()) return false;
      tx.set(c, { uid: user.uid });
      return true;
    });
    if (ok) {
      await setDoc(ref, { name: displayName, friendCode: code, kind: accountKind(user), createdAt: Date.now() }, { merge: true });
      return { friendCode: code };
    }
  }
  throw new Error('Could not create a friend code, please retry');
}

// ───────── recovery vault (PBKDF2 + AES-GCM) ─────────

const b64 = (b: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(b instanceof Uint8Array ? b : new Uint8Array(b))));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function keyFrom(code: string, salt: Uint8Array): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(code.replace(/[\s-]/g, '').toUpperCase()), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 250_000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

async function writeVault(name: string, uid: string, password: string): Promise<string> {
  const raw = randomCode(16);
  const code = raw.match(/.{4}/g)!.join('-');
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await keyFrom(code, salt), new TextEncoder().encode(password));
  await setDoc(doc(firebase().db, 'recovery', name), { uid, salt: b64(salt), iv: b64(iv), ct: b64(ct) });
  return code;
}

async function decrypt(code: string, v: { salt: string; iv: string; ct: string }): Promise<string> {
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(v.iv) }, await keyFrom(code, unb64(v.salt)), unb64(v.ct));
  return new TextDecoder().decode(pt);
}

// ───────── current account (UI) ─────────

export interface AccountInfo { uid: string; kind: AccountKind; name: string; friendCode: string | null; email: string | null }

/** The signed-in player's account + profile, or null when signed out. */
export async function currentAccount(): Promise<AccountInfo | null> {
  const { auth, db } = firebase();
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) return null;
  const kind = accountKind(user)!;
  const p = (await getDoc(doc(db, 'profiles', user.uid)).catch(() => null))?.data() as { name?: string; friendCode?: string } | undefined;
  const name = p?.name ?? (kind === 'username' ? user.email!.split('@')[0] : user.displayName ?? (kind === 'guest' ? 'Guest' : user.email ?? ''));
  return { uid: user.uid, kind, name, friendCode: p?.friendCode ?? null, email: kind === 'email' ? user.email : null };
}

/** Firebase error → a sentence a player understands. */
export function friendlyAuthError(e: unknown): string {
  const code = (e as { code?: string })?.code ?? '';
  const map: Record<string, string> = {
    'auth/invalid-credential': 'That name and password don\'t match',
    'auth/wrong-password': 'That name and password don\'t match',
    'auth/user-not-found': 'No account with that name',
    'auth/invalid-email': 'That email address doesn\'t look right',
    'auth/email-already-in-use': 'That email already has an account',
    'auth/credential-already-in-use': 'That account already exists, so sign in instead',
    'auth/weak-password': 'Passwords need at least 6 characters',
    'auth/too-many-requests': 'Too many tries. Wait a minute and try again',
    'auth/network-request-failed': 'Can\'t reach the server. Check your connection',
    'auth/operation-not-allowed': 'This sign-in type isn\'t switched on yet',
    'auth/admin-restricted-operation': 'Guest play isn\'t switched on yet',
    'auth/requires-recent-login': 'Sign out and in again, then retry',
  };
  return map[code] ?? (e instanceof Error ? e.message.replace(/^Firebase: /, '') : 'Something went wrong');
}
