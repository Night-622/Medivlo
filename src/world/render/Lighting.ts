/**
 * Handoff lighting (docs/world/HOLLOW-CROWN-WORLD.md §6): a MULTIPLY grade over the view plus ADD glows from
 * the art's light points. Lamps flicker. Strength follows the world clock's darkness (0 day … 1 night).
 */
import Phaser from 'phaser';
import { Depth, Settings } from '@/core';
import type { Light } from './artCache';

const GLOW_KEY = 'hc-glow';
const GLOW_PX = 128;
const GRADE_DEPTH = Depth.Overhead + 5_000;
const GLOW_DEPTH = Depth.Overhead + 6_000;

/** Grade colours per look (handoff: dusk, night; forest/abbey are their own constant grades). */
export const Grades = { dusk: 0x8a8ed6, night: 0x5c5fb4, forest: 0xa4aae8, abbey: 0xb0b0ec } as const;
export type GradeLook = 'open' | 'forest' | 'abbey';

interface Glow { img: Phaser.GameObjects.Image; base: number; lamp: boolean; seed: number }

function ensureGlowTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(GLOW_KEY)) return;
  const c = document.createElement('canvas');
  c.width = c.height = GLOW_PX;
  const g = c.getContext('2d')!;
  const r = GLOW_PX / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0.45)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, GLOW_PX, GLOW_PX);
  scene.textures.addCanvas(GLOW_KEY, c);
}

function lerpColor(a: number, b: number, t: number): number {
  const ch = (s: number) => Math.round(((a >> s) & 255) + (((b >> s) & 255) - ((a >> s) & 255)) * t);
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}

export class Lighting {
  private grade: Phaser.GameObjects.Rectangle;
  private glows = new Set<Glow>();
  private strength = 0;
  look: GradeLook = 'open';

  constructor(private scene: Phaser.Scene) {
    ensureGlowTexture(scene);
    this.grade = scene.add.rectangle(0, 0, 10, 10, 0xffffff).setScrollFactor(0).setDepth(GRADE_DEPTH)
      .setBlendMode(Phaser.BlendModes.MULTIPLY).setOrigin(0.5);
  }

  /** Add the glows for one placed art at (x, y) = its bottom-centre. Returns them for removal. */
  addFor(art: string, x: number, y: number, w: number, h: number, lights: Light[]): Glow[] {
    const out: Glow[] = [];
    const lamp = art.endsWith('v_lamp') || art.endsWith('d_candelabra') || art.endsWith('d_sconce');
    for (const [dx, dy, r, col] of lights) {
      const lx = x - w / 2 + dx, ly = y - h + dy;
      out.push(this.glow(lx, ly, lamp ? 90 : r, lamp ? 0xffb347 : col, lamp ? 0.42 : 0.38, lamp));
      if (lamp) out.push(this.glow(lx, ly, 22, 0xfff0b0, 0.5, true));
    }
    return out;
  }

  private glow(x: number, y: number, r: number, color: number, base: number, lamp: boolean): Glow {
    const img = this.scene.add.image(x, y, GLOW_KEY).setBlendMode(Phaser.BlendModes.ADD).setDepth(GLOW_DEPTH)
      .setScale((r * 2) / GLOW_PX).setTint(color).setAlpha(0);
    const g: Glow = { img, base, lamp, seed: (x * 13 + y * 7) % 100 };
    this.glows.add(g);
    return g;
  }

  remove(gs: Glow[]): void {
    for (const g of gs) { g.img.destroy(); this.glows.delete(g); }
  }

  /** Per frame: fit the grade to the camera, apply darkness (0..1) and flicker lamps. */
  update(darkness: number, timeMs: number): void {
    const cam = this.scene.cameras.main;
    this.grade.setPosition(cam.width / 2, cam.height / 2).setSize(cam.width / cam.zoom + 64, cam.height / cam.zoom + 64);
    const night = darkness > 0.5 ? lerpColor(Grades.dusk, Grades.night, (darkness - 0.5) * 2) : lerpColor(0xffffff, Grades.dusk, darkness * 2);
    const fixed = this.look === 'forest' ? Grades.forest : this.look === 'abbey' ? Grades.abbey : 0xffffff;
    // constant looks keep their grade by day and deepen toward night
    const color = this.look === 'open' ? night : lerpColor(fixed, Grades.night, darkness);
    this.grade.setFillStyle(color).setVisible(color !== 0xffffff);
    // glows: off in plain daylight, .38 at dusk → .55 at night (relative to each light's base)
    const lit = this.look === 'open' ? darkness : Math.max(0.6, darkness);
    if (lit !== this.strength || lit > 0) {
      this.strength = lit;
      const t = timeMs / 1000;
      // Settings › Accessibility › reduce motion: lamps burn steady
      const calm = Settings.get().reduceMotion;
      for (const g of this.glows) {
        const flick = g.lamp && !calm ? 1 + Math.sin(9 * t + g.seed) * 0.04 + Math.sin(23 * t + g.seed) * 0.03 : 1;
        g.img.setAlpha(Math.min(1, g.base * lit * (1 + 0.45 * lit) * flick)).setVisible(lit > 0.01);
      }
    }
  }

  destroy(): void {
    for (const g of this.glows) g.img.destroy();
    this.glows.clear();
    this.grade.destroy();
  }
}
