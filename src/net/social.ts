/**
 * Mute / block / report (docs/REBUILD.md § Chat: filter + mute/block/report). Owner: Claude 1.
 * Mutes last until the page closes; blocks persist on this device (and hide chat, and stop blocked players
 * joining your co-op world). Reports go to Firestore `reports` (create-only; read by moderators in the console).
 */
import { addDoc, collection } from 'firebase/firestore';
import { isFirebaseConfigured } from '@/firebase/config';
import { ensureUser, firebase } from '@/firebase/app';

const KEY = 'hollowcrown.blocked';
const muted = new Set<string>();
let blocked: Record<string, string> = load();

function load(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, string>; } catch { return {}; }
}
function persist(): void { try { localStorage.setItem(KEY, JSON.stringify(blocked)); } catch { /* private mode */ } }

export const Social = {
  mute(uid: string): void { muted.add(uid); },
  block(uid: string, name: string): void { blocked = { ...blocked, [uid]: name }; persist(); },
  unblock(uid: string): void { const { [uid]: _, ...rest } = blocked; blocked = rest; persist(); },
  isBlocked(uid: string): boolean { return uid in blocked; },
  /** Hide this player's chat? */
  hidden(uid: string): boolean { return muted.has(uid) || uid in blocked; },
  blockedList(): { uid: string; name: string }[] { return Object.entries(blocked).map(([uid, name]) => ({ uid, name })); },
  async report(uid: string, name: string, recent: string[]): Promise<boolean> {
    if (!isFirebaseConfigured) return false;
    try {
      const me = await ensureUser();
      await addDoc(collection(firebase().db, 'reports'), { reporter: me.uid, target: uid, targetName: name, recent: recent.slice(-10), at: Date.now() });
      return true;
    } catch (e) { console.warn('[social] report failed', e); return false; }
  },
};
