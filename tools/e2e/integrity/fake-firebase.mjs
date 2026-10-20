/**
 * In-memory stand-ins for firebase/app, firebase/auth and firebase/firestore, for Node integrity checks
 * (tools/e2e/integrity-net.mjs). Only what src/firebase and src/net/coop use. Owner: Claude 6.
 *
 * Auth mimics the SDK's startup: currentUser is null until the persisted user is restored (authStateReady), and
 * signInAnonymously (firebase 11) reuses only an ANONYMOUS restored user; anyone else is replaced by a new one.
 * Firestore applies the project's rule for co-op knocks: rooms/{code}/peers/{peerId} may be created and deleted,
 * never updated (firestore.rules).
 */

// ───────── firebase/app ─────────
export const initializeApp = () => ({ name: 'fake' });

// ───────── firebase/auth ─────────
// state lives on globalThis: the bundle inlines its own copy of this module, and the test drives the same state
export const fakeAuth = globalThis.__fakeAuth ??= {
  currentUser: null,
  restored: null, // the user persistence will restore
  restoreMs: 30,
  listeners: new Set(),
  ready: null,
  signUps: 0,
  authStateReady() { return this.ready; },
  _set(u) { this.currentUser = u; for (const fn of [...this.listeners]) fn(u); },
  reset(restored, restoreMs = 30) {
    this.currentUser = null; this.restored = restored; this.restoreMs = restoreMs; this.listeners.clear(); this.signUps = 0;
    this.ready = new Promise((r) => setTimeout(() => { this._set(this.restored); r(); }, restoreMs));
  },
};
if (!fakeAuth.ready) fakeAuth.reset(null);
export const getAuth = () => fakeAuth;
export const onAuthStateChanged = (auth, fn) => {
  auth.listeners.add(fn);
  void auth.ready.then(() => { if (auth.listeners.has(fn)) fn(auth.currentUser); });
  return () => auth.listeners.delete(fn);
};
export async function signInAnonymously(auth) {
  await auth.ready;
  if (auth.currentUser?.isAnonymous) return { user: auth.currentUser };
  auth.signUps++;
  const user = { uid: `anon-${auth.signUps}`, isAnonymous: true };
  auth._set(user);
  return { user };
}

// ───────── firebase/firestore ─────────
export const fakeDb = globalThis.__fakeDb ??= { docs: new Map(), listeners: new Set(), denied: [] };
const { docs, listeners } = fakeDb; // path → data; { coll, filters, fn, seen }
export const getFirestore = () => fakeDb;
export const serverTimestamp = () => ({ __ts: Date.now() });

const pathOf = (x) => (typeof x === 'string' ? x : x.path);
export const doc = (base, ...segs) => ({ kind: 'doc', path: [base === fakeDb ? '' : pathOf(base), ...segs].filter(Boolean).join('/') });
export const collection = (base, ...segs) => ({ kind: 'coll', path: [base === fakeDb ? '' : pathOf(base), ...segs].filter(Boolean).join('/') });
export const where = (field, op, value) => ({ field, op, value });
export const query = (coll, ...filters) => ({ kind: 'coll', path: coll.path, filters });

const isPeerDoc = (p) => /^rooms\/[^/]+\/peers\/[^/]+$/.test(p);
const childrenOf = (coll) => [...docs.keys()].filter((p) => p.startsWith(coll + '/') && !p.slice(coll.length + 1).includes('/'));
const snapDoc = (p) => ({ id: p.split('/').at(-1), ref: { kind: 'doc', path: p }, data: () => docs.get(p) });

function notify() {
  for (const l of [...listeners]) {
    const now = new Map();
    for (const p of childrenOf(l.coll)) {
      const d = docs.get(p);
      if ((l.filters ?? []).every((f) => d[f.field] === f.value)) now.set(p, JSON.stringify(d));
    }
    const changes = [];
    for (const [p, j] of now) if (!l.seen.has(p)) changes.push({ type: 'added', doc: snapDoc(p) }); else if (l.seen.get(p) !== j) changes.push({ type: 'modified', doc: snapDoc(p) });
    for (const p of l.seen.keys()) if (!now.has(p)) changes.push({ type: 'removed', doc: { id: p.split('/').at(-1), ref: { kind: 'doc', path: p }, data: () => ({}) } });
    l.seen = now;
    if (changes.length) l.fn({ docChanges: () => changes });
  }
}
const later = (fn) => new Promise((resolve, reject) => setTimeout(() => { try { resolve(fn()); } catch (e) { reject(e); } }, 1));

export function setDoc(ref, data, opts) {
  if (fakeDb.offline) return new Promise(() => {}); // offline: Firestore never settles a write (waits for the server)
  return later(() => {
    if (fakeDb.failWrites) throw Object.assign(new Error('offline'), { code: 'unavailable' });
    const exists = docs.has(ref.path);
    if (isPeerDoc(ref.path) && exists && !opts?.merge) { fakeDb.denied.push(ref.path); throw Object.assign(new Error('Missing or insufficient permissions.'), { code: 'permission-denied' }); }
    docs.set(ref.path, opts?.merge ? { ...(docs.get(ref.path) ?? {}), ...data } : { ...data });
    notify();
  });
}
export const addDoc = (coll, data) => later(() => { const p = `${coll.path}/m${Math.random().toString(36).slice(2, 10)}`; docs.set(p, { ...data }); notify(); return { path: p }; });
export const deleteDoc = (ref) => later(() => { docs.delete(ref.path); notify(); });
export const getDoc = (ref) => fakeDb.offline ? new Promise(() => {}) : later(() => ({ exists: () => docs.has(ref.path), data: () => docs.get(ref.path) }));
export const getDocs = (coll) => fakeDb.offline ? new Promise(() => {}) : later(() => ({ docs: childrenOf(coll.path).map(snapDoc) }));
export function onSnapshot(q, fn) {
  const l = { coll: q.path, filters: q.filters, fn, seen: new Map() };
  listeners.add(l);
  setTimeout(() => { if (listeners.has(l)) notify(); }, 1);
  return () => listeners.delete(l);
}
