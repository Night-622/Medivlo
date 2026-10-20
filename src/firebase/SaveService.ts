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

export const SAVE_SLOTS = 3;
/** Hollow Crown saves live under their own keys; Medival v1 saves (medival.save.N) are never read (wiped at launch). */
const localKey = (slot: number) => `hollowcrown.save.${slot}`;
const GAME_TAG = 'hollowcrown';

export interface SaveSummary {
  slot: number; name: string; level: number; updatedAt: number; playtimeSec: number;
  classId?: string; hero?: HeroChoiceState; space?: string; where: 'local' | 'cloud' | 'both';
}

/** Hollow Crown level lives on the systems character once it exists. */
const levelOf = (s: GameState) => s.character?.level ?? s.player.progression.level;
const summary = (slot: number, s: GameState, where: SaveSummary['where']): SaveSummary => ({
  slot, name: s.player.name, level: levelOf(s), updatedAt: s.meta.updatedAt, playtimeSec: s.meta.playtimeSec,
  classId: s.player.hero?.classId, hero: s.player.hero, space: s.world.location?.space, where,
});

function readLocal(slot: number): GameState | null {
  try {
    const raw = localStorage.getItem(localKey(slot));
    return raw ? (JSON.parse(raw) as GameState) : null;
  } catch { return null; }
}

function writeLocal(state: GameState): void {
  try { localStorage.setItem(localKey(state.meta.slot), JSON.stringify(state)); }
  catch (e) { console.warn('[save] local write failed', e); }
}

async function readCloud(slot: number): Promise<GameState | null> {
  if (!isFirebaseConfigured) return null;
  try {
    const user = await ensureUser();
    const snap = await getDoc(doc(firebase().db, 'users', user.uid, 'saves', String(slot)));
    return snap.exists() && snap.data().game === GAME_TAG ? (JSON.parse(snap.data().json as string) as GameState) : null;
  } catch (e) { console.warn('[save] cloud read failed', e); return null; }
}

async function writeCloud(state: GameState): Promise<boolean> {
  if (!isFirebaseConfigured) return false;
  try {
    const user = await ensureUser();
    // Stored as a JSON string: avoids Firestore's nested-array limits and keeps the schema opaque.
    await setDoc(doc(firebase().db, 'users', user.uid, 'saves', String(state.meta.slot)), {
      game: GAME_TAG,
      json: JSON.stringify(state),
      name: state.player.name,
      level: levelOf(state),
      classId: state.player.hero?.classId ?? null,
      updatedAt: state.meta.updatedAt,
      version: state.meta.version,
    });
    return true;
  } catch (e) { console.warn('[save] cloud write failed', e); return false; }
}

function migrate(state: GameState): GameState {
  // Add migrations here when SAVE_VERSION increases.
  state.world.location.space ??= ''; // pre-swap saves had an optional space
  if (state.character) migrateCharacter(state.character); // deeper builds: gem → sockets (tree refund later)
  state.meta.version = SAVE_VERSION;
  return applyReleasedContent(state);
}

let lastCloudAt = 0;

export const SaveService = {
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
    writeLocal(state);
    // cloud autosaves at most once a minute (local copies are always written); manual saves go straight up
    const skipCloud = opts.localOnly || (opts.auto && Date.now() - lastCloudAt < 60_000);
    if (!skipCloud) lastCloudAt = Date.now();
    const cloud = skipCloud ? false : await writeCloud(state);
    bus.emit('game:saved', { slot: state.meta.slot, cloud, auto: opts.auto });
  },

  async load(slot: number): Promise<GameState | null> {
    const [local, cloud] = await Promise.all([readLocal(slot), readCloud(slot)]);
    const pick = !local ? cloud : !cloud ? local : cloud.meta.updatedAt > local.meta.updatedAt ? cloud : local;
    return pick ? migrate(pick) : null;
  },

  /** Local-only summaries (fast, for menus). */
  listLocal(): (SaveSummary | null)[] {
    return Array.from({ length: SAVE_SLOTS }, (_, slot) => {
      const s = readLocal(slot);
      return s ? summary(slot, s, 'local') : null;
    });
  },

  /** Local + cloud summaries (newest copy per slot), for the Load screen. Cloud failures fall back to local. */
  async list(): Promise<(SaveSummary | null)[]> {
    const out = SaveService.listLocal();
    if (!isFirebaseConfigured) return out;
    try {
      const user = await ensureUser();
      const snaps = await getDocs(collection(firebase().db, 'users', user.uid, 'saves'));
      for (const d of snaps.docs) {
        const slot = Number(d.id);
        if (!(slot >= 0 && slot < SAVE_SLOTS) || d.data().game !== GAME_TAG) continue;
        const cur = out[slot];
        const updatedAt = Number(d.data().updatedAt ?? 0);
        if (cur && Math.abs(cur.updatedAt - updatedAt) < 1000) { cur.where = 'both'; continue; }
        if (cur && cur.updatedAt > updatedAt) continue;
        out[slot] = summary(slot, JSON.parse(d.data().json as string) as GameState, 'cloud');
      }
    } catch (e) { console.warn('[save] cloud list failed', e); }
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
