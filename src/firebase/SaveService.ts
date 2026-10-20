/**
 * Save/load. Always writes localStorage; also writes Firestore `users/{uid}/saves/{slot}` when configured.
 * Load picks whichever copy has the newer `meta.updatedAt`.
 */
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { bus } from '@/core/EventBus';
import { Game, applyReleasedContent, type GameState, type HeroChoiceState } from '@/core/GameState';
import { SAVE_VERSION } from '@/core/constants';
import { migrateCharacter } from '@/core/hcMigrate';
import { isFirebaseConfigured } from './config';
import { ensureUser, firebase } from './app';
import { fillDefaults, ownedBy, sane } from './saveShape';

export const SAVE_SLOTS = 3;
/** Hollow Crown saves live under their own keys; Medival v1 saves (medival.save.N) are never read (wiped at launch). */
const localKey = (slot: number) => `hollowcrown.save.${slot}`;
const GAME_TAG = 'hollowcrown';

export interface SaveSummary {
  slot: number; name: string; level: number; updatedAt: number; rev: number; playtimeSec: number;
  classId?: string; hero?: HeroChoiceState; space?: string; where: 'local' | 'cloud' | 'both';
}

/**
 * Which copy is newer: the save counter first (every save adds 1, on whichever device), the wall clock only as a
 * tiebreak. Device clocks disagree, and comparing them alone let a device whose clock ran ahead win every time.
 */
const newer = (a: { rev?: number; updatedAt?: number }, b: { rev?: number; updatedAt?: number }): number =>
  (a.rev ?? 0) - (b.rev ?? 0) || (a.updatedAt ?? 0) - (b.updatedAt ?? 0);

/** Hollow Crown level lives on the systems character once it exists. */
const levelOf = (s: GameState) => s.character?.level ?? s.player.progression.level;
const summary = (slot: number, s: GameState, where: SaveSummary['where']): SaveSummary => ({
  slot, name: s.player.name, level: levelOf(s), updatedAt: s.meta.updatedAt, rev: s.meta.rev ?? 0, playtimeSec: s.meta.playtimeSec,
  classId: s.player.hero?.classId, hero: s.player.hero, space: s.world.location?.space, where,
});

function readLocal(slot: number): GameState | null {
  try {
    const raw = localStorage.getItem(localKey(slot));
    return raw ? sane(JSON.parse(raw)) : null;
  } catch { return null; }
}

function writeLocal(state: GameState): void {
  try { localStorage.setItem(localKey(state.meta.slot), JSON.stringify(state)); }
  catch (e) { console.warn('[save] local write failed', e); }
}

/**
 * Offline, Firestore never settles a write (it waits for the server's ack) and reads can hang: every cloud call is
 * time-boxed, so Save / Quit to title / Load never wait on the network. The local copy is always written first, and
 * a timed-out write stays queued in Firestore and goes up when the browser is back online.
 */
function timeBox<T>(p: Promise<T>, what: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`[save] ${what} timed out (offline?)`)), SaveService.cloudTimeoutMs);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

async function readCloud(slot: number): Promise<GameState | null> {
  if (!isFirebaseConfigured) return null;
  try {
    const user = await timeBox(ensureUser(), 'sign-in');
    const snap = await timeBox(getDoc(doc(firebase().db, 'users', user.uid, 'saves', String(slot))), 'cloud read');
    return snap.exists() && snap.data().game === GAME_TAG ? sane(JSON.parse(snap.data().json as string)) : null;
  } catch (e) { console.warn('[save] cloud read failed', e); return null; }
}

async function writeCloud(state: GameState): Promise<boolean> {
  if (!isFirebaseConfigured) return false;
  try {
    const user = await timeBox(ensureUser(), 'sign-in');
    // Stored as a JSON string: avoids Firestore's nested-array limits and keeps the schema opaque.
    await timeBox(setDoc(doc(firebase().db, 'users', user.uid, 'saves', String(state.meta.slot)), {
      game: GAME_TAG,
      json: JSON.stringify(state),
      name: state.player.name,
      level: levelOf(state),
      classId: state.player.hero?.classId ?? null,
      updatedAt: state.meta.updatedAt,
      rev: state.meta.rev ?? 0,
      version: state.meta.version,
    }), 'cloud write');
    return true;
  } catch (e) { console.warn('[save] cloud write failed', e); return false; }
}

/** The signed-in uid if auth already knows it (sync; null before auth restores the session or offline). */
function knownUid(): string | null {
  if (!isFirebaseConfigured) return null;
  try { return firebase().auth.currentUser?.uid ?? null; } catch { return null; }
}

function migrate(state: GameState): GameState {
  // Add migrations here when SAVE_VERSION increases.
  fillDefaults(state); // keys newer builds expect (an old save missing world.foundRegions threw in the map)
  state.world.location.space ??= ''; // pre-swap saves had an optional space
  if (state.character) migrateCharacter(state.character); // deeper builds: gem → sockets (tree refund later)
  state.meta.version = SAVE_VERSION;
  return applyReleasedContent(state);
}

let lastCloudAt = 0;

export const SaveService = {
  /** How long a cloud read/write may take before the game carries on without it (tests shorten it). */
  cloudTimeoutMs: 8000,

  /**
   * Launch rule (docs/REBUILD.md): old Medival saves are wiped. Local v1 keys are removed on boot; cloud v1 docs
   * (no `game` tag) are ignored by load/list and overwritten by the first Hollow Crown save in that slot.
   */
  wipeLegacyLocal(): number {
    let n = 0;
    try { for (const k of Object.keys(localStorage)) if (/^medival\.save\.\d+$/.test(k)) { localStorage.removeItem(k); n++; } } catch { /* storage blocked */ }
    return n;
  },

  /** Local write is synchronous (safe on pagehide); the cloud copy follows. `auto` = autosave (no toast). */
  async save(state: GameState = Game.state, opts: { auto?: boolean; localOnly?: boolean } = {}): Promise<void> {
    bus.emit('game:saving', { slot: state.meta.slot, auto: opts.auto });
    state.meta.updatedAt = Date.now();
    state.meta.rev = (state.meta.rev ?? 0) + 1;
    state.meta.ownerUid = knownUid() ?? state.meta.ownerUid;
    writeLocal(state);
    // cloud autosaves at most once a minute (local copies are always written); manual saves go straight up
    const skipCloud = opts.localOnly || (opts.auto && Date.now() - lastCloudAt < 60_000);
    const cloud = skipCloud ? false : await writeCloud(state);
    if (cloud) lastCloudAt = Date.now(); // a failed upload is retried by the next autosave, not a minute later
    bus.emit('game:saved', { slot: state.meta.slot, cloud, auto: opts.auto });
  },

  async load(slot: number): Promise<GameState | null> {
    const [anyLocal, cloud] = await Promise.all([readLocal(slot), readCloud(slot)]);
    // Another account's hero in this browser's slot must not load over this account's cloud hero (its next save
    // would overwrite it). With the cloud slot empty there is nothing to lose: the hero is adopted (a guest who
    // signs in to an existing account keeps playing it).
    const local = anyLocal && (ownedBy(anyLocal, knownUid()) || !cloud) ? anyLocal : null;
    const pick = !local ? cloud : !cloud ? local : newer(cloud.meta, local.meta) > 0 ? cloud : local;
    try { return pick ? migrate(pick) : null; } catch (e) { console.warn('[save] unreadable save', slot, e); return null; }
  },

  /** Local-only summaries (fast, for menus). */
  listLocal(foreign = false): (SaveSummary | null)[] {
    const uid = knownUid();
    return Array.from({ length: SAVE_SLOTS }, (_, slot) => {
      // one unreadable slot must not take the title menu or the Load screen down with it
      try { const s = readLocal(slot); return s && (foreign || ownedBy(s, uid)) ? summary(slot, s, 'local') : null; } catch { return null; }
    });
  },

  /** Local + cloud summaries (newest copy per slot), for the Load screen. Cloud failures fall back to local. */
  async list(): Promise<(SaveSummary | null)[]> {
    if (!isFirebaseConfigured) return SaveService.listLocal();
    // every local copy first; another account's copy gives way to this account's cloud slot (see load())
    const out = SaveService.listLocal(true);
    try {
      const user = await timeBox(ensureUser(), 'sign-in');
      const snaps = await timeBox(getDocs(collection(firebase().db, 'users', user.uid, 'saves')), 'cloud list');
      for (const d of snaps.docs) {
        const slot = Number(d.id);
        if (!(slot >= 0 && slot < SAVE_SLOTS) || d.data().game !== GAME_TAG) continue;
        const cur = out[slot] && ownedBy(readLocal(slot)!, user.uid) ? out[slot] : null;
        const remote = { rev: Number(d.data().rev ?? 0), updatedAt: Number(d.data().updatedAt ?? 0) };
        if (cur && cur.rev === remote.rev && Math.abs(cur.updatedAt - remote.updatedAt) < 1000) { cur.where = 'both'; continue; }
        if (cur && newer(cur, remote) > 0) continue;
        try { const s = sane(JSON.parse(d.data().json as string)); if (s) out[slot] = summary(slot, s, 'cloud'); } catch { /* unreadable cloud copy */ }
      }
    } catch (e) { console.warn('[save] cloud list failed', e); return SaveService.listLocal(); }
    return out;
  },

  /** Deletes a slot everywhere (local + cloud). */
  async remove(slot: number): Promise<void> {
    try { localStorage.removeItem(localKey(slot)); } catch { /* ignore */ }
    if (!isFirebaseConfigured) return;
    try { const user = await ensureUser(); await deleteDoc(doc(firebase().db, 'users', user.uid, 'saves', String(slot))); }
    catch (e) { console.warn('[save] cloud delete failed', e); }
  },

  get cloudEnabled(): boolean { return isFirebaseConfigured; },
};
