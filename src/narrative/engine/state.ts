/** Small accessors for the narrative GameState slice. Owner: Claude 4. */
import { Game, Services, bus } from '@/core';
import type { GameEventName, GameEvents, NarrativeState } from '@/core';

/**
 * Per-device text formatting for player-facing strings (key names from the player's own bindings). The client
 * installs it (client/keys.ts); the engine and the server leave text as written.
 */
let localFmt: (text: string) => string = (t) => t;
export function setLocalFormatter(fn: (text: string) => string): void { localFmt = fn; }
export const localText = (text: string): string => localFmt(text);

/** This machine runs the story (solo, host, dedicated server). False on a co-op guest or realm visitor. */
export function isAuthority(): boolean {
  const net = Services.tryGet('net');
  return !net || net.isAuthority();
}

/**
 * bus.on for the authority engine. The engine is installed once at boot (solo), and net is a switch facade, so a
 * session can become a guest later: its handlers must then do nothing (guests play the host's story, Claude 1).
 */
export const authBus = {
  on<K extends GameEventName>(event: K, fn: (payload: GameEvents[K]) => void): () => void {
    return bus.on(event, (p) => { if (isAuthority()) fn(p); });
  },
};

/**
 * Where narrative state is read from. The authority reads its own save; a co-op guest's UI reads a mirror of
 * the host's state (client/mirror.ts), because guests play the host's story.
 */
let source: (() => NarrativeState) | null = null;
export function setNarrativeSource(fn: (() => NarrativeState) | null): void { source = fn; }
export const mirrored = (): boolean => source !== null;

export function nar(): NarrativeState {
  return source ? source() : Game.state.narrative;
}

/** Lazily-initialised entry in `narrative.ext` (must stay JSON-serialisable). */
export function ext<T>(key: string, init: () => T): T {
  const e = nar().ext;
  if (!(key in e)) e[key] = init();
  return e[key] as T;
}

/** `npc:maren-hollis` → `maren-hollis` */
export function slug(id: string): string {
  return id.slice(id.indexOf(':') + 1);
}

/** Current in-game hour 0–23 (world clock if registered, else derived from world.time minutes). */
export function hourNow(): number {
  const world = Services.tryGet('world');
  if (world) return world.timeOfDay().hour;
  return Math.floor(Game.state.world.time / 60) % 24;
}

export function toast(text: string, kind: 'quest' | 'codex' | 'reputation' | 'trust' | 'info' = 'info'): void {
  bus.emit('narrative:toast', { text, kind });
}
