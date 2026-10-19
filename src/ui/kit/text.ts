import type Phaser from 'phaser';
import { Theme, hex, type } from './theme';

export type TypeKey = keyof typeof type;

/** Phaser text style for a type-scale entry. Pixel fonts, 1-art ink drop shadow by default. */
export function textStyle(key: TypeKey, color: string = Theme.css.text, shadow = true, wrap?: number): Phaser.Types.GameObjects.Text.TextStyle {
  const t = type[key];
  return {
    fontFamily: t.font,
    fontSize: `${t.size}px`,
    color,
    ...(shadow ? { shadow: { offsetX: 2, offsetY: 2, color: hex(Theme.palette['ink-900']), blur: 0, fill: true, stroke: false } } : {}),
    ...(wrap ? { wordWrap: { width: wrap } } : {}),
  };
}

/** Text over the world: 4-way ink outline instead of a drop shadow. */
export function outlinedStyle(key: TypeKey, color: string): Phaser.Types.GameObjects.Text.TextStyle {
  return { ...textStyle(key, color, false), stroke: hex(Theme.palette['ink-900']), strokeThickness: 4 };
}

export function pxText(scene: Phaser.Scene, x: number, y: number, text: string, key: TypeKey = 'bodyS', color: string = Theme.css.text, shadow = true, wrap?: number): Phaser.GameObjects.Text {
  return scene.add.text(x, y, text, textStyle(key, color, shadow, wrap)).setResolution(1);
}
