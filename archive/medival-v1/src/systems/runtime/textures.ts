/** Placeholder textures for combat (enemy shapes, projectiles, pickups). Generated once per key. */
import Phaser from 'phaser';
import type { EnemyDef } from '@/core';

const hex = (s: string): number => parseInt(s.replace('#', ''), 16);

export function enemyTexture(scene: Phaser.Scene, def: EnemyDef, elite: boolean): string {
  const key = `enemy-${def.id}${elite ? '-elite' : ''}`;
  if (scene.textures.exists(key)) return key;
  const r = Math.round(def.radius * 1.1);
  const size = r * 2 + 8;
  const c = size / 2;
  const color = hex(def.appearance.color);
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0x000000, 0.25).fillEllipse(c, c + r * 0.8, r * 1.6, r * 0.5);
  g.fillStyle(color, 1);
  const edge = Phaser.Display.Color.ValueToColor(color).darken(40).color;
  switch (def.appearance.shape) {
    case 'circle': g.fillCircle(c, c, r); break;
    case 'square': g.fillRect(c - r * 0.85, c - r, r * 1.7, r * 2); break;
    case 'triangle': g.fillTriangle(c, c - r, c - r, c + r * 0.8, c + r, c + r * 0.8); break;
    case 'diamond': g.fillPoints([{ x: c, y: c - r }, { x: c + r * 0.8, y: c }, { x: c, y: c + r }, { x: c - r * 0.8, y: c }], true); break;
  }
  g.lineStyle(elite ? 3 : 1.5, elite ? 0xd4a646 : edge, 1);
  switch (def.appearance.shape) {
    case 'circle': g.strokeCircle(c, c, r); break;
    case 'square': g.strokeRect(c - r * 0.85, c - r, r * 1.7, r * 2); break;
    case 'triangle': g.strokeTriangle(c, c - r, c - r, c + r * 0.8, c + r, c + r * 0.8); break;
    case 'diamond': g.strokePoints([{ x: c, y: c - r }, { x: c + r * 0.8, y: c }, { x: c, y: c + r }, { x: c - r * 0.8, y: c }], true); break;
  }
  if (def.variant === 'hollowed') {
    g.fillStyle(0x0a0a0a, 1).fillRect(c - r * 0.35, c - r * 0.3, 2, r * 0.6).fillRect(c + r * 0.3, c - r * 0.3, 2, r * 0.6); // black tears
  }
  g.fillStyle(0x111111, 1).fillCircle(c - r * 0.3, c - r * 0.35, 1.6).fillCircle(c + r * 0.3, c - r * 0.35, 1.6);
  g.generateTexture(key, size, size);
  g.destroy();
  return key;
}

export function orbTexture(scene: Phaser.Scene, color: number, r: number): string {
  const key = `orb-${color.toString(16)}-${r}`;
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(color, 0.35).fillCircle(r * 2, r * 2, r * 2);
  g.fillStyle(color, 1).fillCircle(r * 2, r * 2, r);
  g.fillStyle(0xffffff, 0.8).fillCircle(r * 2 - r * 0.3, r * 2 - r * 0.3, Math.max(1, r * 0.35));
  g.generateTexture(key, r * 4, r * 4);
  g.destroy();
  return key;
}

export function arrowTexture(scene: Phaser.Scene, color: number): string {
  const key = `arrow-${color.toString(16)}`;
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(color, 1).fillRect(0, 3, 16, 2);
  g.fillStyle(0xd8d0bf, 1).fillTriangle(16, 0, 22, 4, 16, 8);
  g.generateTexture(key, 22, 8);
  g.destroy();
  return key;
}

export function lootTexture(scene: Phaser.Scene, color: number, gold: boolean): string {
  const key = `loot-${color.toString(16)}-${gold ? 'g' : 'i'}`;
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  if (gold) {
    g.fillStyle(0xd4a646, 1).fillCircle(6, 6, 5);
    g.lineStyle(1, 0x7a5a1a, 1).strokeCircle(6, 6, 5);
    g.generateTexture(key, 12, 12);
  } else {
    g.fillStyle(color, 0.3).fillCircle(9, 9, 9);
    g.fillStyle(color, 1).fillRect(4, 4, 10, 10);
    g.lineStyle(1, 0x000000, 0.6).strokeRect(4, 4, 10, 10);
    g.generateTexture(key, 18, 18);
  }
  g.destroy();
  return key;
}
