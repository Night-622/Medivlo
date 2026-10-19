/**
 * Base combatant shared by player and enemies: position, vitals, poise, statuses, sprite.
 */
import Phaser from 'phaser';
import { Depth } from '@/core';
import type { DamageType } from '@/core';
import type { CombatantView } from '../combat/HitResolver';
import { StatusState } from '../status/StatusState';

export type Team = 'player' | 'enemy';

let nextId = 1;

export abstract class Actor {
  readonly id: string;
  x: number;
  y: number;
  facing = Math.PI / 2;
  hp = 1;
  maxHp = 1;
  poise = 1;
  maxPoise = 1;
  poiseRegenAt = 0;
  ward = 0;
  wardUntil = 0;
  alive = true;
  iframeUntil = 0;
  level = 1;
  status: StatusState;
  readonly sprite: Phaser.GameObjects.Image;
  private flashUntil = 0;

  protected constructor(
    readonly scene: Phaser.Scene,
    readonly team: Team,
    x: number, y: number,
    readonly radius: number,
    texture: string,
    status: StatusState,
  ) {
    this.id = `${team}-${nextId++}`;
    this.x = x;
    this.y = y;
    this.status = status;
    this.sprite = scene.add.image(x, y, texture).setOrigin(0.5, 0.85).setDepth(Depth.Actors + y);
  }

  abstract view(): CombatantView;
  abstract get armor(): number;
  abstract get resist(): Record<DamageType, number>;
  abstract get moveSpeed(): number;

  get hpPct(): number { return this.maxHp > 0 ? this.hp / this.maxHp : 0; }
  get isBoss(): boolean { return false; }

  /** foot hitbox for world collision */
  get footW(): number { return Math.max(12, this.radius * 1.6); }
  get footH(): number { return Math.max(8, this.radius * 0.9); }

  flash(now: number): void {
    this.flashUntil = now + 90;
    this.sprite.setTintFill(0xffffff);
  }

  syncSprite(now: number): void {
    this.sprite.setPosition(this.x, this.y);
    this.sprite.setDepth(Depth.Actors + this.y);
    if (this.flashUntil && now >= this.flashUntil) {
      this.flashUntil = 0;
      this.sprite.clearTint();
      this.applyTint();
    }
  }

  /** subclass status tint (frozen, burning…) */
  protected applyTint(): void {
    if (this.status.has('frozen')) this.sprite.setTint(0x9fdcff);
    else if (this.status.has('burn')) this.sprite.setTint(0xffb08a);
    else if (this.status.has('poison')) this.sprite.setTint(0xb8f08a);
    else if (this.status.has('stealth')) this.sprite.setAlpha(0.4);
  }

  refreshTint(): void {
    if (this.flashUntil) return;
    this.sprite.clearTint();
    this.sprite.setAlpha(1);
    this.applyTint();
  }

  destroy(): void {
    this.sprite.destroy();
  }
}

// ───────── geometry ─────────
export const dist = (ax: number, ay: number, bx: number, by: number): number => Math.hypot(bx - ax, by - ay);
export const angleTo = (ax: number, ay: number, bx: number, by: number): number => Math.atan2(by - ay, bx - ax);
export function angleDiff(a: number, b: number): number {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/** circle-vs-sector test (melee arcs, cones, block arcs) */
export function inSector(ox: number, oy: number, facing: number, arcDeg: number, reach: number, tx: number, ty: number, tr: number): boolean {
  const d = dist(ox, oy, tx, ty);
  if (d > reach + tr) return false;
  if (arcDeg >= 360 || d < tr) return true;
  const half = (arcDeg * Math.PI) / 360 + Math.atan2(tr, d);
  return Math.abs(angleDiff(facing, angleTo(ox, oy, tx, ty))) <= half;
}

/** is (tx,ty) behind an actor facing `facing` (within arcDeg of its back) */
export function isBehind(facing: number, ox: number, oy: number, tx: number, ty: number, arcDeg: number): boolean {
  const toAttacker = angleTo(ox, oy, tx, ty);
  return Math.abs(angleDiff(facing + Math.PI, toAttacker)) <= (arcDeg * Math.PI) / 360;
}
