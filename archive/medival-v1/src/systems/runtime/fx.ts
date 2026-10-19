/**
 * Combat feedback: damage numbers, telegraphs, swing arcs, camera shake, hit-stop, world toasts.
 */
import Phaser from 'phaser';
import { Depth } from '@/core';
import { damage as DMG, hex, outlinedStyle, palette as PAL } from '@/ui/kit';

interface FloatText { t: Phaser.GameObjects.Text; vy: number; until: number; born: number }
interface Shape { draw: (g: Phaser.GameObjects.Graphics, pct: number) => void; born: number; until: number }

export class Fx {
  private texts: FloatText[] = [];
  private shapes: Shape[] = [];
  /** per-frame graphics (telegraphs, HP bars); cleared every frame */
  readonly frame: Phaser.GameObjects.Graphics;
  /** short-lived shapes (swing arcs, bursts) */
  private fading: Phaser.GameObjects.Graphics;
  hitStopUntil = 0;

  constructor(private readonly scene: Phaser.Scene) {
    this.frame = scene.add.graphics().setDepth(Depth.Effects);
    this.fading = scene.add.graphics().setDepth(Depth.Effects + 1);
  }

  number(x: number, y: number, amount: number, type: string, crit: boolean, now: number): void {
    const physical = type === 'slash' || type === 'pierce' || type === 'blunt' || type === 'bleed';
    const col = type === 'heal' ? DMG.heal : type === 'block' ? DMG.blocked : type === 'parry' ? PAL['gold-400']
      : crit ? DMG.crit : physical ? DMG.physical : (DMG as Record<string, number>)[type] ?? DMG.magic;
    const label = type === 'block' ? 'Blocked' : type === 'parry' ? 'Parry!' : `${type === 'heal' ? '+' : ''}${Math.round(amount)}${crit ? '!' : ''}`;
    const style = outlinedStyle(crit ? 'numberCrit' : type === 'block' ? 'bodyS' : 'numberDamage', hex(col));
    if (crit) style.stroke = hex(DMG.critOutline);
    const t = this.scene.add.text(Math.round(x + Phaser.Math.Between(-8, 8)), Math.round(y - 20), label, style)
      .setOrigin(0.5).setDepth(Depth.WorldUi).setResolution(1);
    this.texts.push({ t, vy: -40, until: now + 800, born: now });
  }

  label(x: number, y: number, text: string, color: string, now: number, ms = 1400): void {
    const t = this.scene.add.text(Math.round(x), Math.round(y - 30), text, outlinedStyle('bodyS', color)).setOrigin(0.5).setDepth(Depth.WorldUi).setResolution(1);
    this.texts.push({ t, vy: -18, until: now + ms, born: now });
  }

  /** a fading shape drawn for `ms` */
  pulse(ms: number, now: number, draw: Shape['draw']): void {
    this.shapes.push({ draw, born: now, until: now + ms });
  }

  arc(x: number, y: number, facing: number, arcDeg: number, reach: number, color: number, now: number): void {
    this.pulse(140, now, (g, p) => {
      g.fillStyle(color, 0.35 * (1 - p));
      g.slice(x, y, reach, facing - Phaser.Math.DegToRad(arcDeg / 2), facing + Phaser.Math.DegToRad(arcDeg / 2), false).fillPath();
    });
  }

  ring(x: number, y: number, radius: number, color: number, now: number, ms = 300): void {
    this.pulse(ms, now, (g, p) => {
      g.lineStyle(3, color, 0.8 * (1 - p)).strokeCircle(x, y, radius * (0.6 + 0.4 * p));
      g.fillStyle(color, 0.18 * (1 - p)).fillCircle(x, y, radius);
    });
  }

  shake(intensity = 0.004, ms = 90): void {
    this.scene.cameras.main.shake(ms, intensity);
  }

  hitStop(now: number, ms: number): void {
    this.hitStopUntil = Math.max(this.hitStopUntil, now + ms);
  }

  update(now: number, dtMs: number): void {
    this.frame.clear();
    this.fading.clear();
    this.texts = this.texts.filter((f) => {
      if (now >= f.until) { f.t.destroy(); return false; }
      f.t.y += f.vy * (dtMs / 1000);
      f.t.setVisible(f.until - now > 160 || Math.floor(now / 50) % 2 === 0); // no alpha: blink out
      return true;
    });
    this.shapes = this.shapes.filter((s) => {
      if (now >= s.until) return false;
      s.draw(this.fading, (now - s.born) / (s.until - s.born));
      return true;
    });
  }

  destroy(): void {
    for (const f of this.texts) f.t.destroy();
    this.frame.destroy();
    this.fading.destroy();
  }
}

/** telegraph drawing helpers on the per-frame graphics */
export function drawTelegraph(
  g: Phaser.GameObjects.Graphics, kind: 'flash' | 'ring' | 'line' | 'cone', x: number, y: number, facing: number,
  range: number, arcDeg: number, radius: number, pct: number, unblockable: boolean,
): void {
  const color = unblockable ? 0xff3030 : 0xffa040;
  const a = 0.15 + 0.35 * pct;
  switch (kind) {
    case 'ring':
      g.fillStyle(color, a * 0.6).fillCircle(x, y, radius * pct);
      g.lineStyle(2, color, 0.8).strokeCircle(x, y, radius);
      break;
    case 'line': {
      const ex = x + Math.cos(facing) * range, ey = y + Math.sin(facing) * range;
      g.lineStyle(10, color, a * 0.7).lineBetween(x, y, ex, ey);
      g.lineStyle(2, color, 0.9).lineBetween(x, y, x + (ex - x) * pct, y + (ey - y) * pct);
      break;
    }
    case 'cone':
    case 'flash': {
      const half = Phaser.Math.DegToRad((arcDeg || 60) / 2);
      g.fillStyle(color, a * 0.6).slice(x, y, range, facing - half, facing + half, false).fillPath();
      g.lineStyle(1.5, color, 0.8).slice(x, y, range * pct, facing - half, facing + half, false).strokePath();
      break;
    }
  }
}
