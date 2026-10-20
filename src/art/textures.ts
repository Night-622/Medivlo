/**
 * Turn MV canvases into Phaser textures/animations, and load the exported atlas PNGs.
 * World art is used at 1× only; UI may use integer 2×/3×/4× (HANDOFF rule 1).
 */
import type Phaser from 'phaser';
import { heroName, mv, type HeroGear, type HeroLook } from './mv';
import { sideFrames } from './side';

export interface AtlasSheet { file: string; frameWidth: number; frameHeight: number; columns?: number; frames?: string[] | number; pivot?: [number, number]; pieces?: { id: string }[] }
export interface AtlasImage { file: string; w?: number; h?: number; origin?: [number, number]; lights?: [number, number, number][]; label?: string; category?: string }
export type Atlas = Record<string, Record<string, unknown>>;

const BASE = 'art/';

/** Queue every exported sheet and image from atlas.json (call in a scene's preload after the json loaded). */
export function queueAtlas(scene: Phaser.Scene, atlas: Atlas): void {
  const sheetGroups = ['characters', 'heroes', 'npcs', 'sheets', 'tilesV2', 'gear', 'bestiary'];
  for (const g of sheetGroups) {
    for (const [key, raw] of Object.entries(atlas[g] ?? {})) {
      const s = raw as AtlasSheet;
      if (!s.file || !s.frameWidth) continue;
      scene.load.spritesheet(`${g}:${key}`, BASE + s.file.replace(/^assets\//, ''), { frameWidth: s.frameWidth, frameHeight: s.frameHeight });
    }
  }
  const imageGroups = ['ui', 'buildings', 'propsV2', 'props'];
  for (const g of imageGroups) {
    for (const [key, raw] of Object.entries(atlas[g] ?? {})) {
      const s = raw as AtlasImage;
      if (s.file) scene.load.image(`${g}:${key}`, BASE + s.file.replace(/^assets\//, ''));
    }
  }
}

/** Create idle/walk animations for every 6-frame character sheet (frames [idle0, idle1, walkA, pass, walkB, pass]). */
export function createCharacterAnims(scene: Phaser.Scene, atlas: Atlas): void {
  for (const g of ['characters', 'heroes', 'npcs']) {
    for (const key of Object.keys(atlas[g] ?? {})) {
      const tex = `${g}:${key}`;
      if (!scene.textures.exists(tex) || scene.anims.exists(`${tex}:idle`)) continue;
      scene.anims.create({ key: `${tex}:idle`, frames: scene.anims.generateFrameNumbers(tex, { frames: [0, 1] }), frameRate: 2.5, repeat: -1 });
      scene.anims.create({ key: `${tex}:walk`, frames: scene.anims.generateFrameNumbers(tex, { frames: [2, 3, 4, 5] }), frameRate: 8, repeat: -1 });
    }
  }
}

type Shown = Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;

/** Every live image/sprite in any scene that draws from texture `key` (containers searched too). */
function usersOf(game: Phaser.Game, key: string): Shown[] {
  const out: Shown[] = [];
  const walk = (list: Phaser.GameObjects.GameObject[]) => {
    for (const o of list) {
      // structural checks: this module only imports Phaser's types
      const c = o as Partial<Phaser.GameObjects.Container> & Partial<Shown>;
      if (o.type === 'Container' && Array.isArray(c.list)) walk(c.list);
      else if (typeof c.setTexture === 'function' && c.texture?.key === key) out.push(o as Shown);
    }
  };
  for (const s of game.scene.getScenes(false)) if (s.sys.displayList) walk(s.sys.displayList.list);
  return out;
}

/**
 * Replace texture `key` (and, inside `build`, its anims) without breaking what is on screen. A sprite still showing
 * a removed texture throws on every frame (null frame source: "reading 'glTexture'" / "'sourceSize'"), which froze
 * the game after a hero click once. Live users are paused, then put back on the new sheet and their anim.
 */
export function replaceSheet(scene: Phaser.Scene, key: string, build: () => void): void {
  const live = scene.textures.exists(key) ? usersOf(scene.game, key).map((o) => {
    const anims = (o as Phaser.GameObjects.Sprite).anims as Phaser.Animations.AnimationState | undefined;
    const st = { o, frame: o.frame.name, anim: anims?.currentAnim?.key, playing: !!anims?.isPlaying };
    anims?.stop();
    return st;
  }) : [];
  build();
  for (const u of live) {
    if (!u.o.scene) continue;
    u.o.setTexture(key, scene.textures.get(key).has(u.frame) ? u.frame : 0);
    // only an anim rebuilt on the NEW sheet: one that still holds the removed frames would bring the crash back
    // (addCanvasSheet callers rebuild their anims after; they replay them themselves)
    const anim = u.playing && u.anim ? scene.anims.get(u.anim) : undefined;
    if (anim?.frames[0]?.frame.texture === scene.textures.get(key)) (u.o as Phaser.GameObjects.Sprite).play(anim.key, true);
  }
}

/** Pack canvases side by side into one spritesheet texture (replacing one that may be on screen). */
export function addCanvasSheet(scene: Phaser.Scene, key: string, frames: HTMLCanvasElement[]): void {
  replaceSheet(scene, key, () => writeSheet(scene, key, frames));
}

function writeSheet(scene: Phaser.Scene, key: string, frames: HTMLCanvasElement[]): void {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const w = Math.max(...frames.map((f) => f.width)), h = Math.max(...frames.map((f) => f.height));
  const sheet = document.createElement('canvas');
  sheet.width = w * frames.length; sheet.height = h;
  const ctx = sheet.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  frames.forEach((f, i) => ctx.drawImage(f, i * w, 0));
  scene.textures.addSpriteSheet(key, sheet as unknown as HTMLImageElement, { frameWidth: w, frameHeight: h });
}

/**
 * Bake a player's hero (custom look + class) into a 6-frame sheet with idle/walk anims.
 * Re-bake whenever equipment or appearance changes (HANDOFF: Heroes and appearance).
 * Returns the texture key.
 */
export function bakeHero(scene: Phaser.Scene, key: string, classId: string, look: HeroLook, gear?: HeroGear): string {
  const name = heroName(classId, look, gear);
  const idle = mv().frames(name, 'idle') ?? [];
  const walk = mv().frames(name, 'walk') ?? [];
  if (!idle.length || !walk.length) throw new Error(`MV could not draw hero "${name}"`);
  // frames 0–5 match the exported layout [idle0, idle1, walkA, pass, walkB, pass]; 6–11 are the side view
  // (facing right; left = flipX): [idle0, idle1, contact, pass, contact, pass]
  const side = sideView(name);
  // sheet + anims are replaced together, so sprites on screen go straight onto the new anims
  replaceSheet(scene, key, () => {
    writeSheet(scene, key, [idle[0], idle[1] ?? idle[0], walk[0], walk[1], walk[2], walk[3] ?? walk[1], ...side]);
    for (const a of ['idle', 'walk', 'idle-side', 'walk-side']) if (scene.anims.exists(`${key}:${a}`)) scene.anims.remove(`${key}:${a}`);
    scene.anims.create({ key: `${key}:idle`, frames: scene.anims.generateFrameNumbers(key, { frames: [0, 1] }), frameRate: 2.5, repeat: -1 });
    scene.anims.create({ key: `${key}:walk`, frames: scene.anims.generateFrameNumbers(key, { frames: [2, 3, 4, 5] }), frameRate: 8, repeat: -1 });
    if (side.length) {
      scene.anims.create({ key: `${key}:idle-side`, frames: scene.anims.generateFrameNumbers(key, { frames: [6, 7] }), frameRate: 2.5, repeat: -1 });
      scene.anims.create({ key: `${key}:walk-side`, frames: scene.anims.generateFrameNumbers(key, { frames: [8, 9, 10, 11] }), frameRate: 8, repeat: -1 });
    }
  });
  return key;
}

/** True when a baked hero sheet has side-view anims (`<key>:walk-side` / `<key>:idle-side`, facing right). */
export function hasSideView(scene: Phaser.Scene, key: string): boolean { return scene.anims.exists(`${key}:walk-side`); }

/**
 * Side-view frames for a hero name, or [] (the hero then keeps the mirrored front walk). Never throws: an unfinished
 * class or a drawing error must not break baking.
 */
function sideView(name: string): HTMLCanvasElement[] {
  try {
    const i = sideFrames(name, 'idle'), w = sideFrames(name, 'walk');
    return i.length >= 2 && w.length >= 4 ? [i[0], i[1], w[0], w[1], w[2], w[3]] : [];
  } catch (e) {
    if (import.meta.env.DEV) console.warn('[art] side view unavailable for', name, e);
    return [];
  }
}

/** Any single MV-drawn image (icons, props, wordmark…) as a texture. */
export function mvImage(scene: Phaser.Scene, key: string, name: string): string {
  if (!scene.textures.exists(key)) {
    const f = mv().frames(name)?.[0];
    if (!f) throw new Error(`MV has no frames for "${name}"`);
    scene.textures.addCanvas(key, f);
  }
  return key;
}

/** The game wordmark ("THE HOLLOW CROWN"), drawn by art.js in the handoff's logo style. */
export function wordmarkTexture(scene: Phaser.Scene, key = 'wordmark', text = 'THE HOLLOW CROWN'): string {
  if (!scene.textures.exists(key)) scene.textures.addCanvas(key, mv().wordmark(text));
  return key;
}

/**
 * Any creature by bestiary id (the 64 exported + the 78 realm creatures that only exist in code via MV.addBeast).
 * 2-frame idle sheet, anim "<key>:idle". Returns the texture key.
 */
export function bakeBeast(scene: Phaser.Scene, beastId: string, key = `beast:${beastId}`): string {
  if (scene.textures.exists(key)) return key;
  const f = mv().frames(beastId, 'idle') ?? mv().frames(beastId);
  if (!f || !f.length) throw new Error(`MV has no creature "${beastId}"`);
  addCanvasSheet(scene, key, f.length > 1 ? f : [f[0], f[0]]);
  if (!scene.anims.exists(`${key}:idle`)) scene.anims.create({ key: `${key}:idle`, frames: scene.anims.generateFrameNumbers(key, { frames: [0, 1] }), frameRate: 2.2, repeat: -1 });
  return key;
}
