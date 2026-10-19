/**
 * Pixel-art frame drawing (Design System §06–§09). Everything is drawn with fillRect on whole
 * pixels: ink outline, bevel light from top-left, hard drop shadow, no alpha, no smoothing.
 */
import type Phaser from 'phaser';
import { palette as P, themes, type FrameTheme } from './theme';

export type FrameStyle = 'iron' | 'parchment' | 'stone' | 'wood' | 'tooltip';

const themeFor: Record<'iron' | 'stone' | 'wood', FrameTheme> = { iron: themes.leatherIron, stone: themes.stoneGold, wood: themes.woodBrass };

function rect(g: Phaser.GameObjects.Graphics, c: number, x: number, y: number, w: number, h: number): void {
  if (w > 0 && h > 0) g.fillStyle(c, 1).fillRect(x, y, w, h);
}

/** Bevel: 2px highlight top/left, 2px shade bottom/right. */
export function bevel(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, hi: number, lo: number): void {
  rect(g, hi, x, y, w, 2); rect(g, hi, x, y, 2, h);
  rect(g, lo, x, y + h - 2, w, 2); rect(g, lo, x + w - 2, y, 2, h);
}

/** Outline + hard drop shadow around a w×h box at (x,y). `shadow` in px (4 = 2 art). */
export function outlineAndShadow(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, shadow = 4, outline = 2): void {
  if (shadow > 0) rect(g, P['ink-900'], x - outline + shadow, y - outline + shadow, w + outline * 2, h + outline * 2);
  rect(g, P['ink-900'], x - outline, y - outline, w + outline * 2, h + outline * 2);
}

/** Sparse 2×2 noise dither (parchment, stone texture). Deterministic. */
export function noise(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, color: number, stepX = 22, stepY = 14): void {
  for (let yy = 4; yy < h - 4; yy += stepY) {
    for (let xx = 4 + ((yy / stepY) % 2) * (stepX / 2); xx < w - 4; xx += stepX) rect(g, color, x + Math.round(xx), y + yy, 2, 2);
  }
}

/** 50% checker dither (dimming, disabled, fog). 2×2 px cells. */
export function checker(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, color: number): void {
  g.fillStyle(color, 1);
  for (let yy = 0; yy < h; yy += 2) for (let xx = (yy / 2) % 2 === 0 ? 0 : 2; xx < w; xx += 4) g.fillRect(x + xx, y + yy, 2, 2);
}

/** Draw a framed panel. Content area starts 12px (iron) / 16px (parchment) inside. */
export function drawFrame(g: Phaser.GameObjects.Graphics, style: FrameStyle, x: number, y: number, w: number, h: number, accent?: number): void {
  if (style === 'parchment') {
    outlineAndShadow(g, x - 2, y - 2, w + 4, h + 4, 8);
    rect(g, P['leather-800'], x - 2, y - 2, w + 4, h + 4);
    rect(g, P['parch-500'], x, y, w, h);
    noise(g, x, y, w, h, P['parch-700']);
    noise(g, x + 8, y + 6, w - 8, h - 6, P['parch-300'], 30, 26);
    bevel(g, x, y, w, h, P['parch-300'], P['parch-800']);
    rect(g, P['gold-500'], x - 2, y - 2, 4, 4); rect(g, P['gold-500'], x + w - 2, y - 2, 4, 4);
    rect(g, P['gold-500'], x - 2, y + h - 2, 4, 4); rect(g, P['gold-500'], x + w - 2, y + h - 2, 4, 4);
    return;
  }
  if (style === 'tooltip') {
    outlineAndShadow(g, x, y, w, h, 6);
    rect(g, accent ?? P['stone-500'], x, y, w, h);
    rect(g, P['ink-700'], x + 2, y + 2, w - 4, h - 4);
    rect(g, P['ink-900'], x + 4, y + 4, w - 8, h - 8);
    return;
  }
  const t = themeFor[style];
  outlineAndShadow(g, x, y, w, h, 4);
  rect(g, t.frameMid, x, y, w, h);
  bevel(g, x, y, w, h, t.frameHi, t.frameLo);
  if (style === 'stone') rect(g, t.trimMid, x + 4, y + 4, w - 8, h - 8);
  rect(g, P['ink-900'], x + (style === 'stone' ? 6 : 4), y + (style === 'stone' ? 6 : 4), w - (style === 'stone' ? 12 : 8), h - (style === 'stone' ? 12 : 8));
  const inset = style === 'stone' ? 8 : 6;
  rect(g, t.fill, x + inset, y + inset, w - inset * 2, h - inset * 2);
  if (style === 'stone') noise(g, x + inset, y + inset, w - inset * 2, h - inset * 2, P['stone-700'], 16, 12);
  if (style === 'wood') for (let xx = x + inset + 10; xx < x + w - inset; xx += 18) rect(g, P['leather-900'], xx, y + inset, 2, h - inset * 2);
  for (const [rx, ry] of [[10, 10], [w - 14, 10], [10, h - 14], [w - 14, h - 14]]) {
    rect(g, P['ink-900'], x + rx + 2, y + ry + 2, 4, 4);
    rect(g, t.rivet, x + rx, y + ry, 4, 4);
  }
}

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
