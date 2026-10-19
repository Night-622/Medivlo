import Phaser from 'phaser';
import { Theme, palette as P, roles } from './theme';

type Ramp = { lo: number; mid: number; hi: number; sheen: number };
export type BarKind = 'hp' | 'mana' | 'stamina' | 'xp' | 'cast';

function rampFor(c: number | BarKind): Ramp {
  if (typeof c === 'string') return roles.resource[c === 'hp' ? 'hp' : c];
  if (c === P['blood-600']) return roles.resource.hp;
  if (c === P['mana-500']) return roles.resource.mana;
  if (c === P['stam-500']) return roles.resource.stamina;
  if (c === P['gold-500']) return roles.resource.xp;
  return { lo: c, mid: c, hi: c, sheen: c };
}

/** Resource bar: ink outline, ink-700 track, banded fill (sheen/hi/mid/lo), ghost strip on loss. */
export class Bar extends Phaser.GameObjects.Container {
  private g: Phaser.GameObjects.Graphics;
  private readonly bw: number;
  private readonly bh: number;
  private readonly ramp: Ramp;
  private readonly kind: BarKind | null;
  private shown = 1;
  private ghost = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, color: number | BarKind) {
    super(scene, x, y);
    this.bw = w; this.bh = h;
    this.ramp = rampFor(color);
    this.kind = typeof color === 'string' ? color : null;
    this.g = scene.add.graphics();
    this.add(this.g);
    scene.add.existing(this);
    this.draw();
  }

  setValue(current: number, max: number): this {
    const v = Math.max(0, Math.min(1, max > 0 ? current / max : 0));
    if (v === this.shown) return this;
    if (v < this.shown) this.ghost = Math.max(this.ghost, this.shown);
    else this.ghost = v;
    this.shown = v;
    this.draw();
    return this;
  }

  /** Call each frame (or on a timer) to drain the lost-value ghost strip. */
  tickGhost(dtMs: number): void {
    if (this.ghost <= this.shown) return;
    this.ghost = Math.max(this.shown, this.ghost - dtMs / 1500);
    this.draw();
  }

  private draw(): void {
    const g = this.g.clear(), w = this.bw, h = this.bh, r = this.ramp;
    g.fillStyle(P['ink-900'], 1).fillRect(-2, -2, w + 4, h + 4);
    g.fillStyle(Theme.palette['ink-700'], 1).fillRect(0, 0, w, h);
    const fw = Math.round((w * this.shown) / 2) * 2;
    const gw = Math.round((w * this.ghost) / 2) * 2;
    if (gw > fw) g.fillStyle(P['gold-900'], 1).fillRect(fw, 0, gw - fw, h);
    if (fw <= 0) return;
    if (this.kind === 'cast') {
      g.fillStyle(r.mid, 1).fillRect(0, 0, fw, h);
      g.fillStyle(P['ink-900'], 1);
      for (let sx = -h; sx < fw; sx += 8) for (let yy = 0; yy < h; yy += 2) { const px = sx + yy; if (px >= 0 && px < fw - 1) g.fillRect(px, yy, 2, 2); }
      return;
    }
    const sheen = Math.min(2, h), hi = Math.max(2, Math.round(h * 0.25)), mid = Math.round(h * 0.35);
    g.fillStyle(r.lo, 1).fillRect(0, 0, fw, h);
    g.fillStyle(r.mid, 1).fillRect(0, 0, fw, Math.min(h, sheen + hi + mid));
    g.fillStyle(r.hi, 1).fillRect(0, 0, fw, Math.min(h, sheen + hi));
    g.fillStyle(r.sheen, 1).fillRect(0, 0, fw, sheen);
  }
}
