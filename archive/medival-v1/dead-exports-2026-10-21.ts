/**
 * Moved out of src on 2026-10-21 (Claude 1's dead-code cleanup, from Claude 3's compiler-graph scan): exports with no
 * importers anywhere in src / tools / server (static, dynamic, glob and tools/e2e '/src/...' path imports checked),
 * kept here as they were, never deleted. Each block names the file it came from. Not compiled (tsconfig include = src).
 */

// ── src/core/constants.ts (CHUNK_PX, CHUNK_LOAD_RADIUS) ──
export const CHUNK_PX = TILE_SIZE * CHUNK_TILES;
/** Chunks kept loaded around the player in each direction. */
export const CHUNK_LOAD_RADIUS = 2;

// ── src/core/constants.ts (SceneKey) ──
export type SceneKey = (typeof SceneKeys)[keyof typeof SceneKeys];

// ── src/core/constants.ts (WORLD_CHUNKS_W, WORLD_CHUNKS_H) ──
/** Continent size in chunks (WORLD.md §1.1). */
export const WORLD_CHUNKS_W = 64;
export const WORLD_CHUNKS_H = 48;

// ── src/core/types.ts (Vec2, ChunkCoord) ──
// ---------- geometry ----------
export interface Vec2 { x: number; y: number }
export interface ChunkCoord { cx: number; cy: number }

// ── src/core/types.ts (SpawnEntry, SpawnTable) ──
export interface SpawnEntry {
  enemy: `enemy:${string}`;
  weight: number;
  level: [number, number];
  group: [number, number];
  time?: 'day' | 'night' | 'any';
  when?: FlagCond;
}
export interface SpawnTable { id: `spawn:${string}`; entries: SpawnEntry[] }

// ── src/net/types.ts (ReplicatedPayload) ──
export type ReplicatedPayload<K extends GameEventName> = GameEvents[K];

// ── src/ui/kit/frame.ts (drawSlot) ──
/** Item / ability slot (Design System §09). */
export function drawSlot(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number, border: number = P['stone-500'], plate: number = P['ink-800'], state: 'normal' | 'hover' | 'selected' | 'locked' = 'normal'): void {
  if (state === 'hover' || state === 'selected') rect(g, state === 'selected' ? P['gold-200'] : P['gold-500'], x - 4, y - 4, size + 8, size + 8);
  outlineAndShadow(g, x, y, size, size, state === 'locked' ? 0 : 2);
  if (state === 'locked') {
    rect(g, P['stone-800'], x, y, size, size);
    rect(g, P['stone-900'], x + 4, y + 4, size - 8, size - 8);
    checker(g, x + 4, y + 4, size - 8, size - 8, P['stone-800']);
    return;
  }
  rect(g, state === 'selected' ? P['gold-500'] : border, x, y, size, size);
  rect(g, P['ink-900'], x + 4, y + 4, size - 8, size - 8);
  rect(g, plate, x + 6, y + 6, size - 12, size - 12);
}

// ── src/ui/kit/placeholder.ts (humanoidTexture) ──
/** Simple humanoid (32×48) built from appearance colours: used for player/NPC placeholders. */
export function humanoidTexture(scene: Phaser.Scene, key: string, skin: number, hair: number, outfit: number, accent: number): string {
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0x000000, 0.25).fillEllipse(16, 45, 22, 6);   // shadow
  g.fillStyle(outfit, 1).fillRect(8, 20, 16, 18);            // torso
  g.fillStyle(accent, 1).fillRect(8, 30, 16, 3);             // belt
  g.fillStyle(0x2a2118, 1).fillRect(9, 38, 6, 8).fillRect(17, 38, 6, 8); // legs
  g.fillStyle(skin, 1).fillCircle(16, 13, 8);                // head
  g.fillStyle(hair, 1).fillRect(8, 4, 16, 6);                // hair
  g.generateTexture(key, 32, 48);
  g.destroy();
  return key;
}

// ── src/ui/kit/text.ts (outlinedStyle) ──
/** Text over the world: 4-way ink outline instead of a drop shadow. */
export function outlinedStyle(key: TypeKey, color: string): Phaser.Types.GameObjects.Text.TextStyle {
  return { ...textStyle(key, color, false), stroke: hex(Theme.palette['ink-900']), strokeThickness: 4 };
}

// ── src/ui/kit/theme.ts (PaletteToken) ──
export type PaletteToken = keyof typeof palette;

// ── src/ui/kit/hc/theme.ts (SchoolKey) ──
export type SchoolKey = keyof typeof T.color.school;

// ── src/ui/kit/hc/theme.ts (SAFE_CENTRE, MARGIN) ──
/** HUD safe centre: no HUD element may enter this rect. */
export const SAFE_CENTRE = T.hud.safeCentre;
export const MARGIN = T.hud.margin;

// ── src/art/side/kit.ts (LE) ──
export const LE = ['#e8a868', '#b06a38', '#7a4526'];  // leather

// ── src/art/side/mvApi.ts (px) ──
/** Read a pixel as '#rrggbb', or null when (nearly) transparent. */
export function px(c: HTMLCanvasElement, x: number, y: number): string | null {
  if (x < 0 || y < 0 || x >= c.width || y >= c.height) return null;
  const d = c.getContext('2d')!.getImageData(x, y, 1, 1).data;
  if (d[3] < 40) return null;
  return '#' + [d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, '0')).join('');
}

// ── src/audio/music.ts (currentThemeId) ──
export function currentThemeId(): string | null { return current?.theme.id ?? null; }

// ── src/audio/sfx.ts (SFX_NAMES) ──
export const SFX_NAMES = Object.keys(P);

// ── src/ui/narrative/widgets.ts (ellipsize) ──
/** Shrink a single-line text to `max` px with an ellipsis. */
export function ellipsize(t: Phaser.GameObjects.Text, max: number): Phaser.GameObjects.Text {
  const full = t.text;
  if (t.width <= max) return t;
  let s = full;
  while (s.length > 1) { s = s.slice(0, -1); t.setText(`${s.trimEnd()}…`); if (t.width <= max) break; }
  return t;
}

// ── src/core/constants.ts (SceneKeys.Hud: the v1 HUD's key; no scene registers it and nothing references it) ──
//   Hud: 'Hud',

// ── src/main.ts (replaced by a static `import { WorldV2Scene } from '@/scenes/WorldV2Scene'`, not dead code) ──
// // Claude 2's v2 world scene is registered automatically once src/scenes/WorldV2Scene.ts exists.
// const v2Modules = import.meta.glob<{ WorldV2Scene?: typeof Phaser.Scene }>('./scenes/WorldV2Scene.ts', { eager: true });
// const v2Scenes = Object.values(v2Modules).map((mod) => mod.WorldV2Scene).filter((s): s is typeof Phaser.Scene => !!s);
//   scene: [..., CreditsScene, ...v2Scenes],
