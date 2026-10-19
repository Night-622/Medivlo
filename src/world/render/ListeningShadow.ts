/**
 * The Shade's listening shadow (umbral outline, Claude 4's spec): "sometimes, when a lantern is lit, a hero-shaped
 * shadow appears on a wall across the room, listening". Client-side only; it never touches the simulation.
 *   scripted: every flag:changed of `shade.listening` (= the object it appears opposite) shows it once, posed by
 *             `shade.listening_pose` ('listen' | 'watch')
 *   ambient:  a shadowless Shade within ~4 tiles of a lit lamp at dusk or night: 1 in 8 per lamp per minute
 * The look: the hero's own sprite in flat black at 55%, a little taller (a cast shadow), facing the hero; 5–8 tiles
 * beyond the object on the far side from the hero; ~3 s, gone in 0.5 s if the hero walks at it. Never twice in 30 s,
 * and never again once `shade.shadowless` clears (spared at III-4).
 */
import Phaser from 'phaser';
import { Depth, TILE_SIZE, bus, getFlag, heroClassId, type TimePhase } from '@/core';
import type { WorldObject } from '@/core';
import type { SpaceQuery } from '@/world/hc/runtime';
import type { Placement } from '@/world/hc/village';

const HOLD_MS = 3000, FADE_IN = 400, FADE_OUT = 600, FLEE_MS = 500, COOLDOWN_MS = 30_000;
const LAMP = /lamp|lantern|candelabra|sconce|brazier/;

export interface ListeningHost {
  hero(): { sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image; x: number; y: number } | null;
  query(): SpaceQuery;
  phase(): TimePhase;
  /** objects and placements in the chunks on screen */
  objects(): WorldObject[];
  placements(): Placement[];
}

export class ListeningShadow {
  private img: Phaser.GameObjects.Image | null = null;
  private shownAt = -Infinity;
  private fleeing = false;
  private acc = 0;
  private off: () => void;

  constructor(private scene: Phaser.Scene, private host: ListeningHost) {
    this.off = bus.on('flag:changed', (e) => {
      if (e.key !== 'shade.listening' || typeof e.value !== 'string' || !this.active()) return;
      const o = this.host.objects().find((x) => x.id === e.value);
      if (o) this.show(o.at[0] + 0.5, o.at[1] + 0.5, getFlag('shade.listening_pose') === 'watch' ? 'watch' : 'listen', true);
    });
  }

  /** while the Shade has no shadow (from I-1 until it is spared) */
  private active(): boolean { return !!getFlag('shade.shadowless'); }

  update(dt: number): void {
    this.track();
    this.acc += dt;
    if (this.acc < 1000) return;
    this.acc = 0;
    // ambient: a shadowless Shade near a lit lamp at dusk or night
    if (heroClassId() !== 'shade' || !this.active() || this.img) return;
    const ph = this.host.phase();
    if (ph !== 'dusk' && ph !== 'night') return;
    const h = this.host.hero();
    if (!h || this.scene.time.now - this.shownAt < COOLDOWN_MS) return;
    const near = this.host.placements().filter((p) => LAMP.test(p.art) && Math.hypot(p.x - h.x, p.y - h.y) < 4 * TILE_SIZE);
    // 1 in 8 per lamp per minute, checked once a second
    if (near.length && Math.random() < 1 - (1 - 1 / 480) ** near.length) {
      const l = near[Math.floor(Math.random() * near.length)];
      this.show(l.x / TILE_SIZE, (l.y - 4) / TILE_SIZE, 'listen', false);
    }
  }

  /** Show it 5–8 tiles past (ox, oy) (tiles) on the far side from the hero, on the floor at the foot of a wall if any. */
  private show(ox: number, oy: number, pose: 'listen' | 'watch', scripted: boolean): void {
    const h = this.host.hero();
    if (!h || (!scripted && this.scene.time.now - this.shownAt < COOLDOWN_MS)) return;
    const spot = this.spot(ox, oy, h.x / TILE_SIZE, h.y / TILE_SIZE);
    if (!spot) return;
    this.clear();
    const s = h.sprite;
    const img = this.scene.add.image(spot[0] * TILE_SIZE, spot[1] * TILE_SIZE, s.texture.key, s.frame.name)
      .setOrigin(0.5, 1).setTintFill(0x000000).setAlpha(0).setDepth(Depth.Actors + spot[1] * TILE_SIZE - 6)
      .setScale(Math.abs(s.scaleX) * (pose === 'watch' ? 0.96 : 1), Math.abs(s.scaleY) * 1.12)
      .setFlipX(h.x < spot[0] * TILE_SIZE); // faces the hero
    // 'listen': head tilted to one side, still; 'watch': upright, a touch narrower (arms folded)
    if (pose === 'listen') img.setAngle(h.x < spot[0] * TILE_SIZE ? -7 : 7);
    this.img = img;
    this.shownAt = this.scene.time.now;
    this.fleeing = false;
    this.scene.tweens.add({ targets: img, alpha: 0.55, duration: FADE_IN });
    this.scene.time.delayedCall(FADE_IN + HOLD_MS, () => { if (this.img === img) this.fade(FADE_OUT); });
  }

  /** gone quickly if the hero walks at it: it can't be reached */
  private track(): void {
    const h = this.host.hero();
    if (!this.img || !h || this.fleeing) return;
    if (Math.hypot(this.img.x - h.x, this.img.y - h.y) < 3.5 * TILE_SIZE) this.fade(FLEE_MS);
  }

  private fade(ms: number): void {
    const img = this.img;
    if (!img) return;
    this.fleeing = true;
    this.scene.tweens.add({ targets: img, alpha: 0, duration: ms, onComplete: () => { img.destroy(); if (this.img === img) this.img = null; } });
  }

  private spot(ox: number, oy: number, hx: number, hy: number): [number, number] | null {
    const q = this.host.query();
    const base = Math.atan2(oy - hy, ox - hx);
    // straight across first, then swinging out to either side
    for (const da of [0, 0.35, -0.35, 0.7, -0.7]) {
      const a = base + da;
      let last: [number, number] | null = null;
      for (let d = 1; d <= 8; d++) {
        const tx = Math.floor(ox + Math.cos(a) * d), ty = Math.floor(oy + Math.sin(a) * d);
        if (!q.isWalkable(tx, ty)) break; // a wall: stand at its foot
        last = [tx + 0.5, ty + 1];
        if (d >= 8) break;
      }
      if (last && Math.hypot(last[0] - ox, last[1] - oy) >= 5) return last;
    }
    return null;
  }

  private clear(): void { this.img?.destroy(); this.img = null; }

  destroy(): void { this.off(); this.clear(); }
}
