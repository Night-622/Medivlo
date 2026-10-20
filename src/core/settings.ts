/**
 * Per-device player settings (video/audio/controls/gameplay/accessibility). Owner: Claude 1.
 * Stored in localStorage (device preference, not game progress). Read anywhere; listen to 'settings:changed'.
 * Key bindings are the source of truth for the input layer (Claude 3): Settings.key('dash') → 'SPACE'.
 */
import { bus } from './EventBus';

export type Action =
  | 'up' | 'down' | 'left' | 'right' | 'dash' | 'cast1' | 'cast2' | 'cast3' | 'cast4' | 'potionQ' | 'potionE'
  | 'interact' | 'inventory' | 'skills' | 'spells' | 'journal' | 'track' | 'codex' | 'map' | 'people' | 'pause';

export const DEFAULT_KEYS: Record<Action, string> = {
  up: 'W', down: 'S', left: 'A', right: 'D', dash: 'SPACE', cast1: 'ONE', cast2: 'TWO', cast3: 'THREE', cast4: 'FOUR',
  potionQ: 'Q', potionE: 'E', interact: 'F', inventory: 'I', skills: 'K', spells: 'B', journal: 'J', track: 'T', codex: 'L', map: 'M', people: 'P', pause: 'ESC',
};

export interface SettingsData {
  master: number; music: number; sfx: number;               // 0..100 in steps of 5
  fullscreen: boolean; screenShake: 'off' | 'low' | 'full'; pixelPerfect: boolean;
  /** render into a 2× buffer for crisp small text (src/render/hidpi.ts); applies on restart */
  sharpRendering: boolean;
  damageNumbers: 'all' | 'mine' | 'off'; showHints: boolean; autoLootGold: boolean;
  textSize: 'normal' | 'large'; reduceFlashing: boolean; rarityGlyphs: boolean;
  keys: Record<Action, string>;
}

export const DEFAULT_SETTINGS: SettingsData = {
  master: 80, music: 60, sfx: 80, fullscreen: false, screenShake: 'full', pixelPerfect: false, sharpRendering: true,
  damageNumbers: 'all', showHints: true, autoLootGold: true, textSize: 'normal', reduceFlashing: false, rarityGlyphs: true,
  keys: { ...DEFAULT_KEYS },
};

const KEY = 'hollowcrown.settings';
let data: SettingsData = load();

function load(): SettingsData {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
    if (!raw) return structuredClone(DEFAULT_SETTINGS);
    const parsed = JSON.parse(raw) as Partial<SettingsData>;
    return { ...structuredClone(DEFAULT_SETTINGS), ...parsed, keys: { ...DEFAULT_KEYS, ...(parsed.keys ?? {}) } };
  } catch { return structuredClone(DEFAULT_SETTINGS); }
}

function persist(): void {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* private mode: keep in memory */ }
}

export const Settings = {
  get(): Readonly<SettingsData> { return data; },
  set<K extends keyof SettingsData>(k: K, v: SettingsData[K]): void {
    data = { ...data, [k]: v };
    persist();
    bus.emit('settings:changed', { key: k });
  },
  key(a: Action): string { return data.keys[a]; },
  bind(a: Action, keyName: string): void {
    const keys = { ...data.keys };
    for (const k of Object.keys(keys) as Action[]) if (keys[k] === keyName) keys[k] = data.keys[a]; // swap on conflict
    keys[a] = keyName;
    Settings.set('keys', keys);
  },
  reset(): void { data = structuredClone(DEFAULT_SETTINGS); persist(); bus.emit('settings:changed', { key: 'all' }); },
};

// ───────── key names for player-facing text (moved to core from Claude 4's narrative/client/keys.ts) ─────────

const KEY_NAMES: Record<string, string> = {
  SPACE: 'Space', ESC: 'Esc', ENTER: 'Enter', SHIFT: 'Shift', CTRL: 'Ctrl', ALT: 'Alt', TAB: 'Tab', BACKSPACE: 'Backspace',
  ZERO: '0', ONE: '1', TWO: '2', THREE: '3', FOUR: '4', FIVE: '5', SIX: '6', SEVEN: '7', EIGHT: '8', NINE: '9',
  UP: '↑', DOWN: '↓', LEFT: '←', RIGHT: '→',
};

/** The bound key for an action, as a player reads it ('Space', '1', 'E'). */
export function keyLabel(a: Action): string {
  const k = Settings.key(a) ?? '';
  return KEY_NAMES[k] ?? (k.length === 1 ? k : k.charAt(0) + k.slice(1).toLowerCase());
}

/** The four movement keys: "WASD" when they are single letters, else "W/A/S/D"-style. */
export function moveKeys(): string {
  const ks = (['up', 'left', 'down', 'right'] as const).map(keyLabel);
  return ks.every((k) => k.length === 1) ? ks.join('') : ks.join('/');
}

/** Fill `{key:<action>}` (and `{key:move}`) in player-facing text from the player's own bindings. */
export function formatKeys(text: string): string {
  if (!text.includes('{key:')) return text;
  return text.replace(/\{key:([a-zA-Z0-9]+)\}/g, (m, a: string) => (a === 'move' ? moveKeys() : a in data.keys ? keyLabel(a as Action) : m));
}
