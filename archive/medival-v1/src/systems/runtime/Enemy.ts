/**
 * Enemy combatant + AI state machine (SYSTEMS.md §8): perception, behaviours, telegraphed attacks,
 * Director tokens, leash, boss phases, cleansable bosses, elites.
 */
import Phaser from 'phaser';
import type { DamageType, DangerTier, EnemyAttackDef, EnemyDef, EnemyRank, StatModifier } from '@/core';
import { D, ELITE_CHANCE, ENEMY_DAMAGE_MULT, P, RANK_MULT } from '../balance';
import type { CombatantView } from '../combat/HitResolver';
import { ALL_DAMAGE_TYPES } from '../stats/derive';
import { StatBlock, defaultSelfContext } from '../stats/StatBlock';
import { StatusState } from '../status/StatusState';
import { Actor, angleDiff, angleTo, dist } from './Actor';
import { canSee, pathTo, steer, walkClear, type Vec } from './ai';
import type { CombatRuntime } from './CombatRuntime';
import { drawTelegraph } from './fx';
import { enemyTexture } from './textures';

type AiState = 'idle' | 'alert' | 'engage' | 'flee' | 'return' | 'subdued';
interface AttackRun { def: EnemyAttackDef; phase: 'windup' | 'active' | 'recovery'; t0: number; dir: number; tx: number; ty: number; hit: boolean; speed: number }

const ELITE_AFFIXES: { id: string; name: string; minTier: DangerTier; mods: StatModifier[] }[] = [
  { id: 'frenzied', name: 'Frenzied', minTier: 1, mods: [{ stat: 'attackSpeed', op: 'increased', value: 0.25 }, { stat: 'moveSpeed', op: 'increased', value: 0.2 }] },
  { id: 'armoured', name: 'Armoured', minTier: 1, mods: [{ stat: 'armor', op: 'increased', value: 0.5 }, { stat: 'poise', op: 'increased', value: 0.3 }] },
  { id: 'vampiric', name: 'Vampiric', minTier: 2, mods: [{ stat: 'lifeLeech', op: 'flat', value: 0.15 }] },
  { id: 'molten', name: 'Molten', minTier: 2, mods: [{ stat: 'resist.fire', op: 'flat', value: 0.5 }, { stat: 'damageDealt', op: 'increased', value: 0.15 }] },
];

export interface SpawnOpts { level: number; tier: DangerTier; zoneId?: string; leashTiles?: number; eliteChance?: number; forceElite?: boolean; noElite?: boolean }

export class EnemyActor extends Actor {
  readonly def: EnemyDef;
  rank: EnemyRank;
  elite = false;
  affixNames: string[] = [];
  readonly zoneId?: string;
  readonly tier: DangerTier;
  readonly homeX: number;
  readonly homeY: number;
  readonly leashPx: number;
  block = new StatBlock();
  baseDamage = 1;
  private armorV = 0;
  private resistV = {} as Record<DamageType, number>;
  state: AiState = 'idle';
  attack: AttackRun | null = null;
  private cds = new Map<string, number>();
  private path: Vec[] | null = null;
  private nextPathAt = 0;
  private nextPerceive = 0;
  private alertUntil = 0;
  private strafeDir: 1 | -1 = 1;
  private strafeSwitchAt = 0;
  private retreatUntil = 0;
  private fleeUntil = 0;
  private wanderAt = 0;
  private wanderTo: Vec | null = null;
  private dodgeCheckedFor = 0;
  private sidestep: { vx: number; vy: number; until: number } | null = null;
  phaseIndex = 0;
  subdued = false;
  showBarUntil = 0;
  packIndex = 0;
  /** the enemy that summoned this one (summon caps) */
  summoner: EnemyActor | null = null;
  packSize = 1;

  constructor(scene: Phaser.Scene, def: EnemyDef, x: number, y: number, opts: SpawnOpts, rngChance: (p: number) => boolean, pick: <T>(a: T[]) => T) {
    const elite = !opts.noElite && def.canBeElite !== false && def.rank === 'normal' && (opts.forceElite || rngChance(opts.eliteChance ?? ELITE_CHANCE[opts.tier]));
    super(scene, 'enemy', x, y, def.radius, enemyTexture(scene, def, elite), new StatusState(def.rank === 'boss', def.statusResist));
    this.def = def;
    this.rank = elite ? 'elite' : def.rank;
    this.elite = elite;
    this.zoneId = opts.zoneId;
    this.tier = opts.tier;
    this.level = Math.max(1, Math.round(opts.level));
    this.homeX = x;
    this.homeY = y;
    this.leashPx = (opts.leashTiles ?? 14) * 32;
    this.sprite.setScale(def.appearance.scale * (elite ? 1.12 : 1) * 0.9);
    if (elite) {
      const count = opts.tier >= 3 ? 2 : 1;
      const pool = ELITE_AFFIXES.filter((a) => a.minTier <= opts.tier);
      for (let i = 0; i < count && pool.length; i++) {
        const a = pick(pool);
        pool.splice(pool.indexOf(a), 1);
        this.affixNames.push(a.name);
        for (const m of a.mods) this.block.apply(m.stat, m.op, m.value);
      }
    }
    for (const s of def.immune) if (s === 'bleed' || s === 'burn' || s === 'frozen' || s === 'shock' || s === 'poison') this.status.meterSize[s] = Number.POSITIVE_INFINITY;
    this.recomputeStats(true);
    this.facing = Math.random() * Math.PI * 2;
  }

  get displayName(): string { return [...this.affixNames, this.def.name].join(' '); }
  get armor(): number { return this.armorV; }
  get resist(): Record<DamageType, number> { return this.resistV; }
  get moveSpeed(): number { return this.def.base.moveSpeed * this.block.mult('moveSpeed') * this.status.moveMult(); }
  get isBoss(): boolean { return this.def.rank === 'boss'; }
  get speedMult(): number { return Math.max(0.3, (1 + this.block.flat('attackSpeed') + this.block.inc('attackSpeed')) * this.status.actionMult()); }
  get behaviors(): readonly string[] { return this.def.ai.behaviors; }

  recomputeStats(fill = false): void {
    const rm = RANK_MULT[this.rank];
    const max = Math.round(this.def.base.hp * P(this.level) * rm.hp);
    const pct = fill ? 1 : this.hpPct;
    this.maxHp = max;
    this.hp = Math.max(1, Math.round(max * pct));
    this.baseDamage = this.def.base.damage * D(this.level) * rm.damage * ENEMY_DAMAGE_MULT;
    this.armorV = Math.round(this.block.total('armor', this.def.base.armor * (1 + 0.1 * (this.level - 1))));
    this.maxPoise = Math.round(this.block.total('poise', this.def.base.poise * (this.rank === 'elite' ? 1.3 : 1)));
    if (fill) this.poise = this.maxPoise;
    for (const t of ALL_DAMAGE_TYPES) this.resistV[t] = Math.min(0.9, (this.def.resist[t] ?? 0) + this.block.pct(`resist.${t}`));
  }

  view(): CombatantView {
    return {
      level: this.level, attributes: null, block: this.block, self: { ...defaultSelfContext(), hpPct: this.hpPct, statuses: this.status.set },
      armor: this.armorV, resist: this.resistV, statuses: this.status.set, critChance: 0, critMultiplier: 1.5,
      family: this.def.family, variant: this.def.variant, rank: this.rank,
    };
  }

  isEngaged(): boolean { return this.state === 'engage' || this.state === 'flee'; }

  engage(rt: CombatRuntime, callHelp = true): void {
    if (this.state === 'subdued' || !this.alive) return;
    if (this.state !== 'engage') this.state = 'engage';
    if (callHelp && this.def.ai.callForHelpPx) {
      for (const o of rt.enemies) if (o !== this && o.alive && o.state === 'idle' && dist(this.x, this.y, o.x, o.y) <= this.def.ai.callForHelpPx) o.engage(rt, false);
    }
  }

  cancelAttack(rt: CombatRuntime): void {
    if (this.attack) rt.director.release(this.id);
    this.attack = null;
  }

  /** returns true if a boss phase threshold was crossed (runtime handles summons/banners) */
  checkPhases(rt: CombatRuntime): void {
    const phases = this.def.phases ?? [];
    while (this.phaseIndex < phases.length && this.hpPct <= phases[this.phaseIndex].atHpPct) {
      const ph = phases[this.phaseIndex];
      this.phaseIndex++;
      for (const m of ph.modifiers) this.block.apply(m.stat, m.op, m.value);
      this.recomputeStats();
      rt.onBossPhase(this, ph.message, ph.summon);
    }
    const c = this.def.cleansable;
    if (c && this.alive && this.def.tags?.includes('autoYield') && this.hpPct <= c.atHpPct) { rt.onYield(this); return; }
    if (c && !this.subdued && this.hpPct <= c.atHpPct) {
      this.subdued = true;
      this.state = 'subdued';
      this.cancelAttack(rt);
      rt.fx.label(this.x, this.y - 30, '[F] Purge with the Ashmark', '#ffb347', rt.now, 4000);
    }
  }

  update(rt: CombatRuntime, now: number, dtMs: number): void {
    if (!this.alive) return;
    const p = rt.player;
    if (this.status.incapacitated() || this.state === 'subdued') {
      if (this.attack) this.cancelAttack(rt);
      return;
    }
    // perception
    if (now >= this.nextPerceive) {
      this.nextPerceive = now + 200;
      this.perceive(rt, now);
    }
    if (this.state === 'idle') return this.wander(rt, now, dtMs);
    if (this.state === 'alert') {
      this.facing = angleTo(this.x, this.y, p.x, p.y);
      if (now >= this.alertUntil) this.engage(rt);
      return;
    }
    if (this.state === 'return') {
      this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.25 * (dtMs / 1000));
      if (dist(this.x, this.y, this.homeX, this.homeY) < 20) { this.state = 'idle'; this.hp = this.maxHp; return; }
      this.moveToward(rt, this.homeX, this.homeY, dtMs, 1, now);
      return;
    }
    // leash
    if (!this.isBoss && dist(this.x, this.y, this.homeX, this.homeY) > this.leashPx && !this.attack) {
      this.state = 'return';
      this.path = null;
      return;
    }
    if (!p.alive) { this.state = 'return'; return; }

    if (this.attack) return this.runAttack(rt, now, dtMs);

    const d = dist(this.x, this.y, p.x, p.y);
    this.facing = angleTo(this.x, this.y, p.x, p.y);
    // flee
    if (this.def.ai.fleeBelowHp && this.hpPct < this.def.ai.fleeBelowHp && now >= this.fleeUntil + 6000) {
      const allies = rt.enemies.some((o) => o !== this && o.alive && dist(o.x, o.y, this.x, this.y) < 220);
      if (!allies) this.fleeUntil = now + 2500;
    }
    // dodge telegraphed player attacks
    if (this.def.ai.dodgeChance && rt.playerThreatUntil > now && this.dodgeCheckedFor !== rt.playerThreatUntil && d < 120) {
      this.dodgeCheckedFor = rt.playerThreatUntil;
      if (rt.rng.chance(this.def.ai.dodgeChance)) {
        const side = this.facing + (rt.rng.chance(0.5) ? Math.PI / 2 : -Math.PI / 2);
        this.sidestep = { vx: Math.cos(side) * 320, vy: Math.sin(side) * 320, until: now + 220 };
      }
    }
    if (this.sidestep && now < this.sidestep.until) {
      rt.move(this, this.sidestep.vx * (dtMs / 1000), this.sidestep.vy * (dtMs / 1000));
      return;
    }
    // try to attack
    if (now >= this.fleeUntil && this.tryStartAttack(rt, now, d)) return;
    // move
    if (now >= this.strafeSwitchAt) { this.strafeDir = rt.rng.chance(0.5) ? 1 : -1; this.strafeSwitchAt = now + 1200 + rt.rng.int(0, 1600); }
    const s = steer({
      x: this.x, y: this.y, tx: p.x, ty: p.y, behaviors: this.behaviors, pref: this.def.ai.preferredRangePx,
      packIndex: this.packIndex, packSize: this.packSize, strafeDir: this.strafeDir,
      retreating: now < this.retreatUntil, fleeing: now < this.fleeUntil,
    });
    if (!s.dir) return;
    if (s.dir && !walkClear(rt.world(), this.x, this.y, p.x, p.y) && now >= this.fleeUntil) {
      this.moveToward(rt, p.x, p.y, dtMs, 1, now);
      return;
    }
    const v = this.moveSpeed * s.speedMult * (dtMs / 1000);
    rt.move(this, s.dir.x * v, s.dir.y * v);
  }

  private perceive(rt: CombatRuntime, now: number): void {
    if (this.state !== 'idle') return;
    const p = rt.player;
    if (!p.alive) return;
    if (this.def.family === 'beast' && !this.def.variant && this.tier <= 2 && p.hook('wolfFriend')) return;
    const d = dist(this.x, this.y, p.x, p.y);
    const night = p.timePhase === 'night' ? 0.7 : 1;
    const stealth = p.status.has('stealth') ? 0.5 : 1;
    const sightR = this.def.ai.perceptionPx * night * stealth;
    const inFov = Math.abs(angleDiff(this.facing, angleTo(this.x, this.y, p.x, p.y))) <= (this.def.ai.fovDeg * Math.PI) / 360;
    const seen = d <= sightR && inFov && canSee(rt.world(), this.x, this.y, p.x, p.y);
    const heard = d <= this.def.ai.hearingPx * stealth && (p.inCombat || rt.playerNoisy) && d <= this.def.ai.hearingPx * 0.6;
    if (seen || heard || d < 48) {
      this.state = 'alert';
      this.alertUntil = now + (this.isBoss ? 300 : 600);
      rt.fx.label(this.x, this.y - 22, '!', '#ffa040', now, 600);
    }
  }

  private wander(rt: CombatRuntime, now: number, dtMs: number): void {
    if (now >= this.wanderAt) {
      this.wanderAt = now + 2500 + rt.rng.int(0, 3500);
      this.wanderTo = rt.rng.chance(0.6) ? { x: this.homeX + rt.rng.range(-64, 64), y: this.homeY + rt.rng.range(-64, 64) } : null;
    }
    if (this.wanderTo) {
      if (dist(this.x, this.y, this.wanderTo.x, this.wanderTo.y) < 6) { this.wanderTo = null; return; }
      this.facing = angleTo(this.x, this.y, this.wanderTo.x, this.wanderTo.y);
      this.moveToward(rt, this.wanderTo.x, this.wanderTo.y, dtMs, 0.35, now);
    }
  }

  private moveToward(rt: CombatRuntime, tx: number, ty: number, dtMs: number, mult: number, now: number): void {
    let gx = tx, gy = ty;
    if (!walkClear(rt.world(), this.x, this.y, tx, ty)) {
      if (now >= this.nextPathAt) { this.path = pathTo(rt.world(), this.x, this.y, tx, ty); this.nextPathAt = now + 500; }
      if (this.path?.length) {
        if (dist(this.x, this.y, this.path[0].x, this.path[0].y) < 10) this.path.shift();
        if (this.path.length) { gx = this.path[0].x; gy = this.path[0].y; }
      }
    } else this.path = null;
    const a = angleTo(this.x, this.y, gx, gy);
    const v = this.moveSpeed * mult * (dtMs / 1000);
    rt.move(this, Math.cos(a) * v, Math.sin(a) * v);
  }

  private tryStartAttack(rt: CombatRuntime, now: number, d: number): boolean {
    const p = rt.player;
    const phaseNum = this.phaseIndex + 1;
    const ok = this.def.attacks.filter((a) => {
      if ((this.cds.get(a.id) ?? 0) > now) return false;
      if (a.minPhase && phaseNum < a.minPhase) return false;
      const reach = a.kind === 'area' && a.rangePx <= (a.radius ?? 0) ? (a.radius ?? 0) * 0.8 : a.rangePx;
      return d <= reach + p.radius;
    });
    if (!ok.length) return false;
    const a = rt.rng.weighted(ok);
    const ranged = a.kind === 'projectile' || (a.kind === 'area' && a.rangePx > 150);
    if (!rt.director.request(this.id, ranged ? 'ranged' : 'melee', this.isBoss)) return false;
    if (!canSee(rt.world(), this.x, this.y, p.x, p.y)) { rt.director.release(this.id); return false; }
    this.attack = { def: a, phase: 'windup', t0: now, dir: angleTo(this.x, this.y, p.x, p.y), tx: p.x, ty: p.y, hit: false, speed: this.speedMult };
    return true;
  }

  private runAttack(rt: CombatRuntime, now: number, dtMs: number): void {
    const run = this.attack!;
    const a = run.def;
    const p = rt.player;
    const windup = a.windupMs / run.speed;
    const active = a.activeMs / run.speed;
    const recovery = a.recoveryMs / run.speed;
    const t = now - run.t0;
    if (run.phase === 'windup') {
      if (t < windup * 0.7) { // track the target, then lock so the player can react
        run.dir = angleTo(this.x, this.y, p.x, p.y);
        run.tx = p.x; run.ty = p.y;
        this.facing = run.dir;
      }
      const ax = a.kind === 'area' && a.rangePx > (a.radius ?? 0) ? run.tx : this.x;
      const ay = a.kind === 'area' && a.rangePx > (a.radius ?? 0) ? run.ty : this.y;
      drawTelegraph(rt.fx.frame, a.telegraph, ax, ay, run.dir, a.kind === 'charge' ? a.rangePx : a.rangePx + 10, a.arcDeg ?? 60, a.radius ?? 0, Math.min(1, t / windup), !!a.unblockable);
      if (t >= windup) { run.phase = 'active'; run.t0 = now; rt.enemyAttackStart(this, run); }
      return;
    }
    if (run.phase === 'active') {
      if (a.kind === 'charge') {
        const v = (a.rangePx / Math.max(1, active)) * dtMs;
        rt.move(this, Math.cos(run.dir) * v, Math.sin(run.dir) * v);
        if (!run.hit && dist(this.x, this.y, p.x, p.y) <= this.radius + p.radius + 8) { run.hit = true; rt.enemyHitPlayer(this, a); }
      }
      if (now - run.t0 >= active) { run.phase = 'recovery'; run.t0 = now; }
      return;
    }
    if (now - run.t0 >= recovery) {
      this.cds.set(a.id, now + a.cooldownMs / run.speed);
      this.cancelAttack(rt);
      if (this.behaviors.includes('retreatAfterAttack')) this.retreatUntil = now + 600;
    }
  }

  /** frontal shield (shieldFront behaviour): physical from the front is mostly absorbed */
  shieldsFrom(ax: number, ay: number): boolean {
    if (!this.behaviors.includes('shieldFront') || this.status.incapacitated() || this.attack?.phase === 'active') return false;
    return Math.abs(angleDiff(this.facing, angleTo(this.x, this.y, ax, ay))) <= Math.PI * 0.3;
  }
}
