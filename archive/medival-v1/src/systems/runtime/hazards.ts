/**
 * Projectiles and area effects (both teams).
 */
import Phaser from 'phaser';
import { Collision, Depth } from '@/core';
import type { EffectDef, ProjectileDef, SpellId, StatModifier } from '@/core';
import type { HitSpec } from '../combat/HitResolver';
import type { Actor, Team } from './Actor';
import { dist } from './Actor';
import type { CombatRuntime } from './CombatRuntime';
import { arrowTexture, orbTexture } from './textures';

export interface HitExtra {
  spellId?: SpellId;
  effects?: EffectDef[];
  heavy?: boolean;
  /** heavy attack charged ≥ 90% (The First Nail) */
  heavyFull?: boolean;
  unblockable?: boolean;
  ashmark?: boolean;
  /** px a projectile flew before hitting (Long Shot) */
  travelled?: number;
  fromX?: number;
  fromY?: number;
}

const hex = (s: string) => parseInt(s.replace('#', ''), 16);

export class Projectile {
  readonly sprite: Phaser.GameObjects.Image;
  private vx: number;
  private vy: number;
  private travelled = 0;
  private pierceLeft: number;
  private hitIds = new Set<string>();
  dead = false;

  constructor(
    scene: Phaser.Scene,
    readonly owner: Actor,
    readonly team: Team,
    public x: number, public y: number,
    private angle: number,
    readonly def: ProjectileDef,
    readonly spec: HitSpec,
    readonly extra: HitExtra,
    readonly speedMult = 1,
  ) {
    const color = hex(def.color);
    const isArrow = spec.kind === 'ranged';
    this.sprite = scene.add.image(x, y, isArrow ? arrowTexture(scene, color) : orbTexture(scene, color, Math.max(3, def.radius)))
      .setDepth(Depth.Effects - 1).setRotation(angle);
    this.vx = Math.cos(angle) * def.speed * speedMult;
    this.vy = Math.sin(angle) * def.speed * speedMult;
    this.pierceLeft = def.pierce;
  }

  update(rt: CombatRuntime, dtMs: number): void {
    const dt = dtMs / 1000;
    if (this.def.homingDegPerSec) {
      const target = this.team === 'enemy' ? rt.player : rt.nearestEnemy(this.x, this.y, 260);
      if (target) {
        const want = Math.atan2(target.y - this.y, target.x - this.x);
        const diff = Phaser.Math.Angle.Wrap(want - this.angle);
        const max = Phaser.Math.DegToRad(this.def.homingDegPerSec) * dt;
        this.angle += Phaser.Math.Clamp(diff, -max, max);
        const sp = this.def.speed * this.speedMult;
        this.vx = Math.cos(this.angle) * sp;
        this.vy = Math.sin(this.angle) * sp;
      }
    }
    const nx = this.x + this.vx * dt, ny = this.y + this.vy * dt;
    const world = rt.world();
    if (world) {
      const hit = world.raycast(this.x, this.y, nx, ny, Collision.SOLID | Collision.BLOCK_PROJECTILE);
      if (hit.hit) { rt.fx.ring(hit.x, hit.y, 8, hex(this.def.color), rt.now, 150); this.kill(); return; }
    }
    this.travelled += Math.hypot(nx - this.x, ny - this.y);
    this.x = nx; this.y = ny;
    this.sprite.setPosition(nx, ny).setRotation(Math.atan2(this.vy, this.vx));
    if (this.travelled >= this.def.rangePx) { this.kill(); return; }

    const targets: Actor[] = this.team === 'player' ? rt.enemies : [rt.player];
    for (const t of targets) {
      if (!t.alive || this.hitIds.has(t.id)) continue;
      if (dist(this.x, this.y, t.x, t.y - t.radius * 0.6) > t.radius + this.def.radius) continue;
      if (t === rt.player && rt.now < t.iframeUntil) continue; // dodged through
      this.hitIds.add(t.id);
      rt.applyHit(this.owner, t, this.spec, { ...this.extra, travelled: this.travelled, fromX: this.x - this.vx * 0.05, fromY: this.y - this.vy * 0.05 });
      const det = this.extra.effects?.find((e) => e.kind === 'hook' && e.hook === 'detonate');
      if (det && det.kind === 'hook' && this.team === 'player') {
        rt.spawnArea({ owner: this.owner, team: this.team, x: this.x, y: this.y, radius: Number(det.params?.radius ?? 80), delayMs: 0, durationMs: 0, tickMs: 500,
          color: parseInt(this.def.color.replace('#', ''), 16), spec: { ...this.spec, mult: (this.spec.mult ?? 1) * Number(det.params?.pct ?? 0.5) }, extra: { ...this.extra, effects: [] } });
      }
      if (this.pierceLeft-- <= 0) { this.kill(); return; }
    }
  }

  kill(): void {
    this.dead = true;
    this.sprite.destroy();
  }
}

export interface AreaOpts {
  owner: Actor;
  team: Team;
  x: number; y: number;
  radius: number;
  delayMs: number;
  durationMs: number;     // 0 = single burst
  tickMs: number;
  color: number;
  spec?: HitSpec;         // damage to enemies of `team`
  extra?: HitExtra;
  buff?: { id: string; mods: StatModifier[] }; // applied to the owner (player) while inside
}

export class Area {
  private readonly born: number;
  private nextTick: number;
  private fired = false;
  dead = false;

  constructor(readonly o: AreaOpts, now: number) {
    this.born = now;
    this.nextTick = now + o.delayMs;
  }

  update(rt: CombatRuntime, now: number): void {
    const o = this.o;
    const g = rt.fx.frame;
    const age = now - this.born;
    if (age < o.delayMs) {
      const p = age / Math.max(1, o.delayMs);
      g.lineStyle(2, o.color, 0.8).strokeCircle(o.x, o.y, o.radius);
      g.fillStyle(o.color, 0.12 + 0.25 * p).fillCircle(o.x, o.y, o.radius * p);
      return;
    }
    if (o.durationMs > 0) {
      const life = 1 - (age - o.delayMs) / o.durationMs;
      g.fillStyle(o.color, 0.12 + 0.08 * life).fillCircle(o.x, o.y, o.radius);
      g.lineStyle(1.5, o.color, 0.5).strokeCircle(o.x, o.y, o.radius);
    } else if (!this.fired) {
      rt.fx.ring(o.x, o.y, o.radius, o.color, now, 260);
    }
    if (now >= this.nextTick && (!this.fired || o.durationMs > 0)) {
      this.fired = true;
      this.nextTick = now + Math.max(100, o.tickMs);
      if (o.spec) {
        const targets: Actor[] = o.team === 'player' ? rt.enemies : [rt.player];
        for (const t of targets) {
          if (t.alive && dist(o.x, o.y, t.x, t.y) <= o.radius + t.radius) rt.applyHit(o.owner, t, o.spec, { ...o.extra, fromX: o.x, fromY: o.y });
        }
      }
      if (o.buff && o.owner === rt.player && dist(o.x, o.y, rt.player.x, rt.player.y) <= o.radius) {
        rt.player.addBuff({ id: o.buff.id, until: now + Math.max(300, o.tickMs + 100), mods: o.buff.mods, procs: [] });
      }
    }
    if (age >= o.delayMs + o.durationMs && this.fired) this.dead = true;
  }
}
