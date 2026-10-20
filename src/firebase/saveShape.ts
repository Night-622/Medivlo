/**
 * Shape checks for saves read from localStorage or Firestore (Claude 6). A save is plain JSON that older builds,
 * other accounts or a broken write may have produced, so nothing about its shape is trusted:
 * - `sane()` rejects anything that isn't a save (one bad slot must not crash the title menu or the Load screen);
 * - `fillDefaults()` adds keys a newer build expects (an older save missing `world.foundRegions` loaded, then threw
 *   in the world and map code);
 * - `ownedBy()` keeps one account's local copy from loading (and later overwriting) another account's cloud slot
 *   on a shared browser. Saves from before `meta.ownerUid` belong to whoever loads them next.
 */
import { createNewGameState, type GameState } from '@/core/GameState';

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

/** The parsed value as a save, or null when it can't be one. */
export function sane(raw: unknown): GameState | null {
  if (!isObj(raw)) return null;
  const { meta, player, world, narrative } = raw;
  if (!isObj(meta) || !isObj(player) || !isObj(world) || !isObj(narrative)) return null;
  if (typeof meta.slot !== 'number' || typeof player.name !== 'string') return null;
  return raw as unknown as GameState;
}

/** Fill keys the current build expects from a fresh state; never overwrites a saved value. Arrays are kept whole. */
export function fillDefaults(state: GameState): GameState {
  const fill = (into: Record<string, unknown>, from: Record<string, unknown>) => {
    for (const [k, v] of Object.entries(from)) {
      if (into[k] === undefined) into[k] = structuredClone(v); // a saved null is a value (trackedQuest: null…)
      else if (isObj(into[k]) && isObj(v)) fill(into[k] as Record<string, unknown>, v);
    }
  };
  fill(state as unknown as Record<string, unknown>, createNewGameState(state.meta.slot) as unknown as Record<string, unknown>);
  return state;
}

/** May the account `uid` use this save? Unknown uid (offline, auth not ready) or an unowned save: yes. */
export const ownedBy = (state: GameState, uid: string | null | undefined): boolean => !uid || !state.meta.ownerUid || state.meta.ownerUid === uid;
