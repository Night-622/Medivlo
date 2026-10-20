/**
 * Side-view anims for the atlas NPCs (Claude 5). Each NPC with an `npcs:<id>` sheet is re-made as one 12-frame sheet
 * under the same key: its atlas front frames as they are (0–5: idle 2, walk 4), then the side view (6–11: idle 2,
 * walk 4, facing right), like bakeHero. Its `idle` / `walk` anims are re-created and `idle-side` / `walk-side`
 * added, so hasSideView(scene, 'npcs:<id>') is true and CombatView turns walking escorts (which use these sheets)
 * side-on. One texture per NPC matters: CombatView names anims from the sprite's texture key, which a side anim on a
 * second texture would change. Call once after mvReady(), before any sprite uses the sheets.
 */
import type Phaser from 'phaser';
import { M } from './mvApi';
import { sideFrames } from './index';

const FW = 32, FH = 40;

/** Bake every atlas NPC's side view; returns the ids baked. Never throws: an NPC whose frames fail keeps its sheet. */
export function bakeNpcSides(scene: Phaser.Scene): string[] {
  const done: string[] = [];
  let hero: Record<string, { npc?: number }>;
  try { hero = M().HERO as Record<string, { npc?: number }>; } catch { return done; }
  for (const id of Object.keys(hero)) {
    const key = `npcs:${id}`;
    if (!hero[id]?.npc || !scene.textures.exists(key)) continue;
    try {
      const idle = sideFrames(id, 'idle'), walk = sideFrames(id, 'walk');
      if (idle.length < 2 || walk.length < 4) continue;
      const src = scene.textures.get(key).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
      const n = Math.floor(src.width / FW);
      if (n < 6) continue;
      const side = [idle[0], idle[1], walk[0], walk[1], walk[2], walk[3]];
      const sheet = document.createElement('canvas');
      sheet.width = FW * (n + side.length); sheet.height = FH;
      const ctx = sheet.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(src, 0, 0);
      side.forEach((f, i) => ctx.drawImage(f, (n + i) * FW, 0));
      for (const a of ['idle', 'walk', 'idle-side', 'walk-side']) if (scene.anims.exists(`${key}:${a}`)) scene.anims.remove(`${key}:${a}`);
      scene.textures.remove(key);
      scene.textures.addSpriteSheet(key, sheet as unknown as HTMLImageElement, { frameWidth: FW, frameHeight: FH });
      const anim = (a: string, frames: number[], fps: number) =>
        scene.anims.create({ key: `${key}:${a}`, frames: scene.anims.generateFrameNumbers(key, { frames }), frameRate: fps, repeat: -1 });
      anim('idle', [0, 1], 2.5); anim('walk', [2, 3, 4, 5], 8);
      anim('idle-side', [n, n + 1], 2.5); anim('walk-side', [n + 2, n + 3, n + 4, n + 5], 8);
      done.push(id);
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[art] NPC side view unavailable for', id, e);
    }
  }
  return done;
}
