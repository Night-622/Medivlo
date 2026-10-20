/**
 * Public realms seat the player's SAVED hero (Claude 6, approved by Claude 1). The server reads the player's own
 * users/{uid}/saves/{slot} through the Firestore REST API with the player's verified Firebase ID token, so the
 * project's rules (owner read) scope it: no admin SDK, no service account, no extra dependency.
 * The token is never logged. Tests point FIRESTORE_BASE at a local stub, so they never touch the real project.
 */
const FIRESTORE_BASE = process.env.FIRESTORE_BASE ?? 'https://firestore.googleapis.com';
const GAME_TAG = 'hollowcrown';

export type LoadedSave = { ok: true; character: unknown; playtimeSec: number } | { ok: false; reason: string; log: string };

const refuse = (reason: string, log: string): LoadedSave => ({ ok: false, reason, log });

export async function loadSave(project: string, uid: string, slot: number, token: string): Promise<LoadedSave> {
  if (!Number.isInteger(slot) || slot < 0 || slot > 2) return refuse('Choose a hero first, then enter the realm.', `bad slot ${slot}`);
  const url = `${FIRESTORE_BASE}/v1/projects/${encodeURIComponent(project)}/databases/(default)/documents/users/${encodeURIComponent(uid)}/saves/${slot}`;
  let res: Response;
  try { res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(4000) }); }
  catch (e) { return refuse('The realm couldn\'t read your saved hero. Try again in a moment.', `fetch failed: ${(e as Error).name}`); }
  if (res.status === 404) return refuse('Save your hero to the cloud first (Pause › Save game), then enter the realm.', 'no cloud save');
  if (!res.ok) return refuse('The realm couldn\'t read your saved hero. Try again in a moment.', `firestore ${res.status}`);
  let doc: { fields?: Record<string, { stringValue?: string }> };
  try { doc = await res.json() as typeof doc; } catch { return refuse('Your saved hero couldn\'t be read.', 'bad json'); }
  if (doc.fields?.game?.stringValue !== GAME_TAG) return refuse('Save your hero to the cloud first (Pause › Save game), then enter the realm.', 'not a Hollow Crown save');
  let state: { meta?: { playtimeSec?: unknown; ownerUid?: unknown }; character?: unknown };
  try { state = JSON.parse(doc.fields?.json?.stringValue ?? '') as typeof state; } catch { return refuse('Your saved hero couldn\'t be read.', 'bad save json'); }
  if (!state || typeof state !== 'object' || !state.character || typeof state.character !== 'object') return refuse('Play your hero in your own world first, then enter the realm.', 'no character');
  if (typeof state.meta?.ownerUid === 'string' && state.meta.ownerUid !== uid) return refuse('That saved hero belongs to another account.', 'owner mismatch');
  const playtimeSec = Number(state.meta?.playtimeSec);
  return { ok: true, character: state.character, playtimeSec: Number.isFinite(playtimeSec) && playtimeSec >= 0 ? playtimeSec : 0 };
}
