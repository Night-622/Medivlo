/**
 * See-through props (Claude 7's QA: a pine y-sorted in front of the hero hid the sprite completely, right where lair
 * doors and fights are). Each frame, tall props drawn over the local hero's sprite fade to SEE_THROUGH and ease back
 * once clear. Only the props of the 3×3 chunks round the hero are tested, and only those whose foot is below the
 * hero's (drawn in front of it).
 */
import type Phaser from 'phaser';
import { Depth } from '@/core';

const SEE_THROUGH = 0.45;
/** props shorter than this never hide a hero (chests, stumps, fences) */
const TALL = 40;
/** the hero's sprite box above its feet (origin 0.5, 0.95) */
const HERO_W = 26, HERO_H = 50;
/** how far below the hero's feet a prop's foot can be and still reach up over the hero */
const REACH = 220;
/** ms to ease the alpha most of the way */
const EASE_MS = 90;

export class Occlusion {
  /** faded props → the alpha they had (opened chests are dimmed already) */
  private faded = new Map<Phaser.GameObjects.Image, number>();

  /** `near(x, y)`: the prop sprites of the chunks round a world point. */
  constructor(private near: (x: number, y: number) => Iterable<Phaser.GameObjects.Image>) {}

  update(hero: { x: number; y: number } | null, dt: number): void {
    const over = new Set<Phaser.GameObjects.Image>();
    if (hero) {
      const l = hero.x - HERO_W / 2, r = hero.x + HERO_W / 2, t = hero.y - HERO_H, b = hero.y, front = Depth.Actors + hero.y;
      for (const s of this.near(hero.x, hero.y)) {
        if (s.y <= hero.y || s.y > hero.y + REACH || s.depth <= front || s.displayHeight < TALL) continue;
        // the drawn box, trimmed at the sides (tree canopies and roofs carry transparent margins)
        const w = s.displayWidth * 0.8;
        if (s.x - w / 2 < r && s.x + w / 2 > l && s.y - s.displayHeight < b && s.y > t) over.add(s);
      }
    }
    const k = Math.min(1, dt / EASE_MS);
    for (const s of over) if (!this.faded.has(s)) this.faded.set(s, s.alpha);
    for (const [s, base] of this.faded) {
      if (!s.active) { this.faded.delete(s); continue; }
      const target = over.has(s) ? Math.min(base, SEE_THROUGH) : base;
      const a = s.alpha + (target - s.alpha) * k;
      if (!over.has(s) && Math.abs(a - base) < 0.02) { s.setAlpha(base); this.faded.delete(s); } else s.setAlpha(a);
    }
  }

  /** Put every faded prop back (scene teardown, space change). */
  clear(): void {
    for (const [s, base] of this.faded) if (s.active) s.setAlpha(base);
    this.faded.clear();
  }
}
