/**
 * Autosave + play time (Claude 1). Installed once from main.ts.
 * - Play time: +1 s per second while the world is running (not while the solo game is paused).
 * - Autosave: after progress (quest started/completed, waystone woken, level-up, space change, loot), debounced 2 s
 *   and at most every 20 s; every 90 s while in the world; immediately (local, synchronous) when the tab is hidden
 *   or closed, so closing the browser never loses more than a moment.
 * Autosaves don't toast; the HUD shows a small "Saving…" mark.
 */
import type Phaser from 'phaser';
import { Game, SceneKeys, bus } from '@/core';
import { sim } from '@/net';
import { SaveService } from './SaveService';

const MIN_GAP_MS = 20_000;
const PERIOD_MS = 90_000;

export function installAutosave(game: Phaser.Game): void {
  let last = 0;
  let pending: ReturnType<typeof setTimeout> | null = null;
  const inWorld = () => Game.hasState && !!Game.state.player.hero && game.scene.isActive(SceneKeys.World);

  const save = (force = false) => {
    if (!inWorld()) return;
    const now = Date.now();
    if (!force && now - last < MIN_GAP_MS) { schedule(MIN_GAP_MS - (now - last)); return; }
    last = now;
    void SaveService.save(Game.state, { auto: true });
  };
  const schedule = (ms = 2000) => {
    if (pending) return;
    pending = setTimeout(() => { pending = null; save(); }, ms);
  };

  for (const ev of ['quest:started', 'quest:completed', 'waystone:woken', 'player:levelup', 'space:changed', 'loot:granted', 'codex:unlocked'] as const) {
    bus.on(ev, () => schedule());
  }
  setInterval(() => save(), PERIOD_MS);
  setInterval(() => {
    if (inWorld() && !sim.isPaused() && document.visibilityState === 'visible') Game.state.meta.playtimeSec += 1;
  }, 1000);

  // leaving: write locally now (sync), the cloud copy if the page lives long enough
  // not an 'auto' save: leaving the page should also push the cloud copy if the page lives long enough
  const flush = () => { if (inWorld()) { last = Date.now(); void SaveService.save(Game.state); } };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  addEventListener('pagehide', flush);
}
