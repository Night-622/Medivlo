/** Stand-in player until Claude 3's createPlayer() is live. Same handle shape; x/y = feet in world px. */
import Phaser from 'phaser';
import { Depth, Game, Services } from '@/core';
import { humanoidTexture } from '@/ui/kit';

const SPEED = 170;
const FOOT_W = 20;
const FOOT_H = 12;

export class TempPlayer {
  readonly sprite: Phaser.GameObjects.Image;
  private keys: Record<'W' | 'A' | 'S' | 'D' | 'UP' | 'LEFT' | 'DOWN' | 'RIGHT' | 'SHIFT', Phaser.Input.Keyboard.Key>;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const a = Game.state.player.appearance;
    const key = humanoidTexture(scene, 'player-temp', a.skinTone, a.hairColor, 0x5a554d, a.accentColor);
    this.sprite = scene.add.image(x, y, key).setOrigin(0.5, 0.95);
    this.keys = scene.input.keyboard!.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT,SHIFT') as typeof this.keys;
  }

  get x(): number { return this.sprite.x; }
  get y(): number { return this.sprite.y; }

  teleport(x: number, y: number): void { this.sprite.setPosition(x, y); }

  update(dtMs: number, frozen: boolean): void {
    const k = this.keys;
    let dx = (k.D.isDown || k.RIGHT.isDown ? 1 : 0) - (k.A.isDown || k.LEFT.isDown ? 1 : 0);
    let dy = (k.S.isDown || k.DOWN.isDown ? 1 : 0) - (k.W.isDown || k.UP.isDown ? 1 : 0);
    if (frozen || (!dx && !dy)) { this.sprite.setDepth(Depth.Actors + this.y); return; }
    const len = Math.hypot(dx, dy);
    const v = (SPEED * (k.SHIFT.isDown ? 2.5 : 1) * dtMs) / 1000;
    dx = (dx / len) * v; dy = (dy / len) * v;
    const world = Services.tryGet('world');
    const footY = this.y - FOOT_H / 2;
    const r = world ? world.moveAndCollide(this.x, footY, dx, dy, FOOT_W, FOOT_H) : { x: this.x + dx, y: footY + dy };
    this.sprite.setPosition(r.x, r.y + FOOT_H / 2).setDepth(Depth.Actors + r.y);
    Game.state.world.location.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'e' : 'w') : dy > 0 ? 's' : 'n';
  }

  destroy(): void { this.sprite.destroy(); }
}
