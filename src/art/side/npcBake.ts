/**
 * Side-view anims for the atlas NPCs (Claude 5). Each NPC with an `npcs:<id>` sheet gets a canvas texture
 * `npcs-side:<id>` (6 frames: idle 2 + walk 4, facing right) and the anims `npcs:<id>:idle-side` /
 * `npcs:<id>:walk-side` built from it, so hasSideView(scene, 'npcs:<id>') is true and CombatView turns walking
 * escorts (which use these sheets) side-on without touching the atlas sheets. Call once after mvReady().
 */
import type Phaser from 'phaser';
import { M } from './mvApi';
import { sideFrames } from './index';

/** Bake every atlas NPC's side view; returns the ids baked. Never throws: an NPC whose frames fail is skipped. */
export function bakeNpcSides(scene: Phaser.Scene): string[] {
  const done: string[] = [];
  let hero: Record<string, { npc?: number }>;
  try { hero = M().HERO as Record<string, { npc?: number }>; } catch { return done; }
  for (const id of Object.keys(hero)) {
    const key = `npcs:${id}`, side = `npcs-side:${id}`;
    if (!hero[id]?.npc || !scene.textures.exists(key)) continue;
    try {
      const idle = sideFrames(id, 'idle'), walk = sideFrames(id, 'walk');
      if (idle.length < 2 || walk.length < 4) continue;
      const frames = [idle[0], idle[1], walk[0], walk[1], walk[2], walk[3]];
      const sheet = document.createElement('canvas');
      sheet.width = 32 * frames.length; sheet.height = 40;
      const ctx = sheet.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;
      frames.forEach((f, i) => ctx.drawImage(f, i * 32, 0));
      if (scene.textures.exists(side)) scene.textures.remove(side);
      scene.textures.addSpriteSheet(side, sheet as unknown as HTMLImageElement, { frameWidth: 32, frameHeight: 40 });
      for (const a of ['idle-side', 'walk-side']) if (scene.anims.exists(`${key}:${a}`)) scene.anims.remove(`${key}:${a}`);
      scene.anims.create({ key: `${key}:idle-side`, frames: scene.anims.generateFrameNumbers(side, { frames: [0, 1] }), frameRate: 2.5, repeat: -1 });
      scene.anims.create({ key: `${key}:walk-side`, frames: scene.anims.generateFrameNumbers(side, { frames: [2, 3, 4, 5] }), frameRate: 8, repeat: -1 });
      done.push(id);
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[art] NPC side view unavailable for', id, e);
    }
  }
  return done;
}
