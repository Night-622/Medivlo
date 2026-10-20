/** Lazily initialised Firebase app/auth/firestore. Only call when `isFirebaseConfigured`. */
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, type Auth, type User } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from './config';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function firebase(): { app: FirebaseApp; auth: Auth; db: Firestore } {
  if (!isFirebaseConfigured) throw new Error('Firebase not configured (.env.local missing)');
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
  return { app, auth: auth!, db: db! };
}

/**
 * Resolves with the signed-in user, signing in anonymously if needed.
 * Waits for auth to restore the persisted session first: currentUser is null until then, and signInAnonymously
 * replaces a restored email/username user with a brand-new anonymous one (only an anonymous one is reused).
 */
export async function ensureUser(): Promise<User> {
  const { auth } = firebase();
  await auth.authStateReady();
  if (auth.currentUser) return auth.currentUser;
  return new Promise((resolve, reject) => {
    const off = onAuthStateChanged(auth, (user) => {
      if (user) { off(); resolve(user); }
    });
    signInAnonymously(auth).catch((e) => { off(); reject(e); });
  });
}
