/** Runtime placeholder textures, so nobody blocks on art. Generate once in Boot; reuse by key. */
import Phaser from 'phaser';

/** Solid rectangle texture with an optional 1px darker border. */
export function rectTexture(scene: Phaser.Scene, key: string, w: number, h: number, color: number, border = true): string {
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(color, 1).fillRect(0, 0, w, h);
  if (border) g.lineStyle(1, Phaser.Display.Color.ValueToColor(color).darken(35).color, 1).strokeRect(0.5, 0.5, w - 1, h - 1);
  g.generateTexture(key, w, h);
  g.destroy();
  return key;
}

/** Circle texture (projectiles, pickups, markers). */
export function circleTexture(scene: Phaser.Scene, key: string, r: number, color: number): string {
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(color, 1).fillCircle(r, r, r);
  g.generateTexture(key, r * 2, r * 2);
  g.destroy();
  return key;
}
