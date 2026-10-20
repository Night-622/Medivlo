import Phaser from 'phaser';
import { Theme } from './theme';
import { drawFrame, type FrameStyle } from './frame';
import { pxText } from './text';

/**
 * Framed pixel panel. Children are positioned relative to the panel's top-left.
 * Styles: 'iron' (HUD, bags, trees), 'parchment' (dialogue, journal, codex), 'stone' (world map), 'wood', 'tooltip'.
 */
export class Panel extends Phaser.GameObjects.Container {
  readonly w: number;
  readonly h: number;
  readonly style: FrameStyle;
  /** Inner padding to use for content: 12 (iron/stone/wood/tooltip) or 16 (parchment). */
  readonly pad: number;

  constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, title?: string, style: FrameStyle = 'iron') {
    super(scene, x, y);
    this.w = w; this.h = h; this.style = style;
    this.pad = style === 'parchment' ? 16 : 12;
    const g = scene.add.graphics();
    drawFrame(g, style, 0, 0, w, h);
    this.add(g);
    if (title) {
      const color = style === 'parchment' ? Theme.css.ink : Theme.css.gold;
      this.add(pxText(scene, w / 2, this.pad + 4, title, 'titleS', color, style !== 'parchment').setOrigin(0.5, 0));
    }
    scene.add.existing(this);
  }
}
