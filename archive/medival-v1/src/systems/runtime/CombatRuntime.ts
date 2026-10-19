/**
 * Per-scene combat runtime: owns actors, projectiles, areas, loot, FX and the hit pipeline.
 * Created by createPlayer(); driven by the scene's update event.
 */
import Phaser from 'phaser';
import { Registry, Services, bus, rng } from '@/core';
import type { DangerTier, EnemyAttackDef, EnemyId, Rng, WorldQuery } from '@/core';
import {
  BACKSTAB_ARC_DEG, BLOCK_ARC_DEG, COMBAT_DISENGAGE_MS, EXPOSED_MS, GUARD_BREAK_STAGGER_MS, PLAYER_STAGGER_IMMUNE_MS, PLAYER_STAGGER_MS,
  POISE_REGEN_DELAY_MS, RIPOSTE_MULT, RIPOSTE_WINDOW_MS, STAGGER_MS,
} from '../balance';
import { resolveHit, type HitResult, type HitSpec } from '../combat/HitResolver';
import { Actor, angleDiff, angleTo, dist, inSector, isBehind } from './Actor';
import { Director } from './Director';
import { EnemyActor, type SpawnOpts } from './Enemy';
import { Fx } from './fx';
import { Area, Projectile, type AreaOpts, type HitExtra } from './hazards';
import { Pickups } from './pickups';
import { weaponInfo } from './weapon';
import type { PlayerActor } from './Player';
import { applyEffectStatus, fireProcs, handleTicks, triggerBuildupStatus } from './statusEffects';
import { onEnemyKilled, onEnemyCleansed, onEnemyYielded, onPlayerDied } from './outcomes';

export interface RuntimeUi {
  update(rt: CombatRuntime, now: number): void;
  toast(text: string, color?: string): void;
  destroy(): void;
}

export class CombatRuntime {
  readonly fx: Fx;
  readonly director = new Director();
  readonly pickups: Pickups;
  readonly rng: Rng = rng;
  enemies: EnemyActor[] = [];
  private projectiles: Projectile[] = [];
  private areas: Area[] = [];
  now = 0;
  playerThreatUntil = 0;
  playerNoisy = false;
  lastHostileAt = 0;
  lastPlayerHitWasSpell = false;
  private engagedEmitted = false;
  private pauses = new Set<string>();
  ui: RuntimeUi | null = null;
  /** controller hook so the runtime can interrupt player actions */
  interruptPlayer: () => void = () => {};
  private unsub: (() => void)[] = [];

  constructor(readonly scene: Phaser.Scene, readonly player: PlayerActor) {
    this.fx = new Fx(scene);
    this.pickups = new Pickups(scene);
    this.unsub.push(
      bus.on('ui:open', ({ panel }) => this.pauses.add(`ui:${panel}`)),
      bus.on('ui:close', ({ panel }) => this.pauses.delete(`ui:${panel}`)),
      bus.on('dialogue:started', () => this.pauses.add('dialogue')),
      bus.on('dialogue:ended', () => this.pauses.delete('dialogue')),
      bus.on('game:paused', ({ paused }) => (paused ? this.pauses.add('game') : this.pauses.delete('game'))),
    );
  }

  get paused(): boolean { return this.pauses.size > 0; }
  world(): WorldQuery | undefined { return Services.tryGet('world'); }

  // ───────── movement ─────────
  move(a: Actor, dx: number, dy: number): void {
    if (!dx && !dy) return;
    const w = this.world();
    if (w) {
      const r = w.moveAndCollide(a.x, a.y, dx, dy, a.footW, a.footH);
      a.x = r.x; a.y = r.y;
    } else { a.x += dx; a.y += dy; }
  }

  private separate(): void {
    const list: Actor[] = this.enemies.filter((e) => e.alive);
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      for (let j = i + 1; j < list.length + 1; j++) {
        const b = j < list.length ? list[j] : this.player;
        if (!b.alive) continue;
        const d = dist(a.x, a.y, b.x, b.y);
        const min = (a.radius + b.radius) * 0.9;
        if (d >= min || d < 0.01) continue;
        const push = (min - d) / (b === this.player ? 1 : 2);
        const ux = (a.x - b.x) / d, uy = (a.y - b.y) / d;
        this.move(a, ux * push, uy * push);
        if (b !== this.player) this.move(b, -ux * push, -uy * push);
      }
    }
  }

  nearestEnemy(x: number, y: number, maxD: number): EnemyActor | null {
    let best: EnemyActor | null = null, bd = maxD;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const d = dist(x, y, e.x, e.y);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }

  // ───────── spawning ─────────
  /** Runtime-created adds (summons, splits) get no zoneId, so Claude 2's zone bookkeeping only sees its own spawns. */
  spawnEnemy(id: string, x: number, y: number, opts: SpawnOpts): EnemyActor | null {
    const def = Registry.tryGet('enemy', id);
    if (!def) { console.warn(`[combat] unknown enemy ${id}`); return null; }
    const e = new EnemyActor(this.scene, def, x, y, opts, (p) => this.rng.chance(p), (a) => this.rng.pick(a));
    const pack = this.enemies.filter((o) => o.alive && o.def.id === def.id && o.zoneId === opts.zoneId && dist(o.x, o.y, x, y) < 400);
    e.packIndex = pack.length;
    for (const o of [...pack, e]) o.packSize = pack.length + 1;
    this.enemies.push(e);
    return e;
  }

  despawnZone(zoneId: string): void {
    for (const e of this.enemies) if (e.zoneId === zoneId && !e.isEngaged()) { e.alive = false; e.destroy(); this.director.release(e.id); }
    this.enemies = this.enemies.filter((e) => e.alive);
  }

  spawnProjectile(owner: Actor, x: number, y: number, angle: number, def: Projectile['def'], spec: HitSpec, extra: HitExtra = {}): void {
    const count = def.count ?? 1;
    const spread = ((def.spreadDeg ?? 0) * Math.PI) / 180;
    for (let i = 0; i < count; i++) {
      const a = count > 1 ? angle - spread / 2 + (spread * i) / (count - 1) : angle;
      this.projectiles.push(new Projectile(this.scene, owner, owner.team, x, y, a, def, spec, extra));
    }
  }

  spawnArea(o: AreaOpts): void { this.areas.push(new Area(o, this.now)); }

  // ───────── the hit pipeline ─────────
  applyHit(source: Actor, target: Actor, spec0: HitSpec, extra: HitExtra = {}): HitResult | null {
    if (!target.alive || source === target) return null;
    const now = this.now;
    const p = this.player;
    const fromX = extra.fromX ?? source.x, fromY = extra.fromY ?? source.y;
    let spec = spec0;

    if (target instanceof EnemyActor) {
      if (extra.ashmark) {
        if (target.subdued && target.def.cleansable) { onEnemyCleansed(this, target); return null; }
        if (target.def.variant !== 'hollowed' && target.def.family !== 'unwrought') return null;
        if (target.def.variant === 'hollowed') spec = { ...spec, mult: (spec.mult ?? 1) * 1.5 };
      }
      if (source === p) {
        if (spec.kind === 'melee' && !target.isBoss && isBehind(target.facing, target.x, target.y, p.x, p.y, BACKSTAB_ARC_DEG)) {
          spec = { ...spec, backstab: true, critBonus: (spec.critBonus ?? 0) + p.hookNum('backstabCrit', 'bonus', 0) };
        }
        // Shade: the first strike from stealth is a guaranteed crit for double damage
        if (p.status.has('stealth') && spec.kind !== 'dot') {
          spec = { ...spec, forceCrit: true, mult: (spec.mult ?? 1) * 2 * (1 + p.hookNum('stealthBonus', 'more', 0)) };
          p.status.remove('stealth');
          this.fx.label(p.x, p.y - 20, 'From the dark!', '#c9a2f0', now, 700);
        }
        let more = 1;
        if (p.hook('furyDamage') && p.resource >= p.hookNum('furyDamage', 'threshold', 50)) more *= 1 + p.hookNum('furyDamage', 'pct', 0.15);
        if (p.hook('executeBonus') && target.hpPct < p.hookNum('executeBonus', 'threshold', 0.3)) more *= 1 + p.hookNum('executeBonus', 'pct', 0.4);
        const bane = extra.effects?.find((e) => e.kind === 'hook' && e.hook === 'banesHollowed');
        if (bane && bane.kind === 'hook' && (target.def.variant === 'hollowed' || target.def.family === 'unwrought')) more *= Number(bane.params?.mult ?? 1.5);
        if (spec.kind === 'ranged' && extra.travelled && p.hook('longShot')) more *= 1 + p.hookNum('longShot', 'pct', 0.3) * Math.min(1, extra.travelled / 500);
        if (more !== 1) spec = { ...spec, mult: (spec.mult ?? 1) * more };
        if (spec.kind === 'melee' && now < p.riposteUntil) {
          const boost = p.hook('riposteBoost');
          spec = { ...spec, forceCrit: true, mult: (spec.mult ?? 1) * (typeof boost?.mult === 'number' ? boost.mult : RIPOSTE_MULT) };
          p.riposteUntil = 0;
          if (boost) p.stamina += p.hookNum('riposteBoost', 'stamina', 0);
          if (p.hook('edricsOath')) p.gainResource(p.hookNum('edricsOath', 'resolve', 25), now);
        }
        if (spec.kind === 'spell' && !p.hook('spellCrit')) spec = { ...spec, canCrit: false };
      }
    }

    // player defence: dodge, parry, block
    let blockFactor: ((r: HitResult) => number) | null = null;
    if (target === p) {
      if (now < p.iframeUntil) return null;
      const front = !!p.hook('omniBlock') || Math.abs(angleDiff(p.facing, angleTo(p.x, p.y, fromX, fromY))) <= (BLOCK_ARC_DEG * Math.PI) / 360;
      const shield = p.stats.collected.offhand?.def.offhand;
      if (p.blocking && front && !extra.unblockable && shield?.family === 'shield' && !p.hook('noShield')) {
        const edric = p.hook('edricsOath') && now >= p.edricsReadyAt;
        if (now - p.blockStart <= p.stats.derived.parryWindowMs || edric) {
          if (edric) p.edricsReadyAt = now + p.hookNum('edricsOath', 'cooldownMs', 6000);
          this.parry(source);
          return null;
        }
        blockFactor = (r) => {
          const phys = (r.byType.slash ?? 0) + (r.byType.pierce ?? 0) + (r.byType.blunt ?? 0);
          let blocked = phys * ((shield.blockPhysical ?? 0) / 100);
          for (const [t, v] of Object.entries(r.byType)) if (t !== 'slash' && t !== 'pierce' && t !== 'blunt') blocked += (v ?? 0) * (shield.blockResist?.[t as keyof typeof shield.blockResist] ?? 0);
          const stability = Math.min(90, (shield.stability ?? 0) + p.stats.derived.blockStability);
          const cost = 4 + blocked * (1 - stability / 100) * p.stats.derived.blockCostMult;
          if (p.stamina >= cost) {
            p.spendStamina(cost, now);
            this.fx.number(p.x, p.y - 24, 0, 'block', false, now);
            p.gainResource(this.resourceGain('onBlock'), now);
            fireProcs(this, 'onBlock', source);
            const ret = p.hook('retaliation');
            if (ret && source.alive && blocked > 0) this.directDamage(source, blocked * p.hookNum('retaliation', 'pct', 0.3), 'blunt');
            return blocked;
          }
          p.stamina = 0; p.staminaSpentAt = now; // guard break
          p.status.apply('stagger', now, GUARD_BREAK_STAGGER_MS);
          this.interruptPlayer();
          this.fx.label(p.x, p.y, 'Guard broken!', '#c04a4a', now);
          return 0;
        };
      }
    }

    const res = resolveHit(source.view(), target.view(), spec, this.rng);
    let total = res.total;
    if (blockFactor) total = Math.max(0, total - blockFactor(res));
    if (target instanceof EnemyActor && target.shieldsFrom(fromX, fromY) && !extra.unblockable) {
      const phys = (res.byType.slash ?? 0) + (res.byType.pierce ?? 0) + (res.byType.blunt ?? 0);
      total -= phys * 0.8;
      if (phys > total) this.fx.number(target.x, target.y - target.radius * 2, 0, 'block', false, now);
    }
    if (target.ward > 0 && total > 0) {
      const absorbed = Math.min(target.ward, total);
      target.ward -= absorbed;
      total -= absorbed;
      if (target === p && p.hook('wardBurn') && source instanceof EnemyActor && spec.kind === 'melee' &&
        source.status.addBuildup('burn', p.hookNum('wardBurn', 'buildup', 25), now)) triggerBuildupStatus(this, source, 'burn', res, p);
    }
    total = Math.max(0, Math.round(total));
    target.hp -= total;
    target.flash(now);
    if (total > 0) this.fx.number(target.x, target.y - target.radius * 2, total, res.mainType, res.crit, now);
    bus.emit('combat:hit', { sourceId: source.id, targetId: target.id, amount: total, type: res.mainType, crit: res.crit });

    if (target === p) {
      this.lastHostileAt = now;
      bus.emit('player:damaged', { amount: total, type: res.mainType, sourceId: source.id });
      p.gainResource(this.resourceGain('onHurt'), now);
      fireProcs(this, 'onHurt', source);
      if (total > p.maxHp * 0.15) this.fx.shake(0.006, 120);
    } else if (source === p) {
      this.lastHostileAt = now;
      this.lastPlayerHitWasSpell = spec.kind === 'spell';
      if (spec.kind !== 'dot' && total > 0) p.gainResource(this.resourceGain('onHit'), now);
      if (spec.kind === 'melee' && !extra.spellId && total > 0) {
        const cdr = p.hookNum('spellbladeCdr', 'ms', 0);
        if (cdr) for (const [id, t] of p.cooldowns) if (id.startsWith('spell:')) p.cooldowns.set(id, t - cdr);
        const ember = p.hookNum('emberOnHit', 'amount', 0);
        if (ember) p.mana = Math.min(p.stats.derived.maxMana, p.mana + ember);
      }
      const siphon = extra.effects?.find((e) => e.kind === 'hook' && e.hook === 'siphon');
      if (siphon && siphon.kind === 'hook') p.mana = Math.min(p.stats.derived.maxMana, p.mana + total * Number(siphon.params?.pct ?? 0.05));
      const bleeding = target.status.meters.bleed > 0 ? p.hookNum('bleedLeech', 'pct', 0) : 0;
      const leech = p.stats.derived.lifeLeech + bleeding;
      if (leech > 0) p.heal(total * leech);
    }
    if (source instanceof EnemyActor) {
      const leech = source.block.pct('lifeLeech');
      if (leech > 0) source.hp = Math.min(source.maxHp, source.hp + total * leech);
    }

    // buildup statuses
    for (const [s, amt] of Object.entries(res.buildup) as [keyof HitResult['buildup'], number][]) {
      if (target.status.addBuildup(s, amt, now, s === 'poison' ? 0.5 : 0)) triggerBuildupStatus(this, target, s, res, source);
    }
    // ability on-hit effects, then player procs
    for (const e of extra.effects ?? []) if (e.kind === 'applyStatus' && e.trigger === 'onHit') applyEffectStatus(this, e, source, target);
    if (source === p) {
      fireProcs(this, 'onHit', target);
      if (res.crit) fireProcs(this, 'onCrit', target);
      if (extra.heavy && p.hook('sunder')) target.status.apply('vulnerable', now, p.hookNum('sunder', 'durationMs', 3000));
      if (extra.heavyFull && p.hook('heavyPin')) {
        const ms = p.hookNum('heavyPin', 'durationMs', 2000);
        if (target.isBoss) target.status.apply('slow', now, ms, 0.5); else target.status.apply('root', now, ms);
        target.status.apply('vulnerable', now, ms);
        this.fx.label(target.x, target.y - 20, 'Pinned!', '#8d9aab', now, 800);
      }
      if (res.crit || extra.heavy) { this.fx.hitStop(now, 50); if (extra.heavy) this.fx.shake(0.004, 80); }
    }

    // poise
    if (res.poise > 0) {
      target.poise -= res.poise;
      target.poiseRegenAt = now + POISE_REGEN_DELAY_MS;
      if (target.poise <= 0) this.stagger(target);
    }

    if (target instanceof EnemyActor) {
      target.showBarUntil = now + 4000;
      if (source === p) target.engage(this);
      target.checkPhases(this);
    }
    if (target.hp <= 0) this.onZeroHp(target, source);
    return res;
  }

  /** damage that bypasses the formula (bleed bursts, DoT ticks, retaliation) */
  directDamage(target: Actor, amount: number, type: string, source?: Actor): void {
    if (!target.alive || amount <= 0) return;
    target.hp -= amount;
    this.fx.number(target.x, target.y - target.radius * 2, amount, type, false, this.now);
    if (target instanceof EnemyActor) { target.showBarUntil = this.now + 4000; target.checkPhases(this); }
    if (target.hp <= 0) this.onZeroHp(target, source ?? this.player);
  }

  private onZeroHp(target: Actor, source: Actor): void {
    if (target === this.player) {
      if (this.player.alive) onPlayerDied(this);
      return;
    }
    if (target instanceof EnemyActor && target.alive && target.def.cleansable && target.def.tags?.includes('autoYield')) {
      target.hp = 1; // yielding bosses cannot be killed outright
      this.onYield(target);
      return;
    }
    if (target instanceof EnemyActor && target.alive) onEnemyKilled(this, target, source === this.player || source.team === 'player');
  }

  /** a boss that yields instead of dying (Ysolde): flag + XP + loot, no death */
  onYield(e: EnemyActor): void {
    if (!e.alive) return;
    onEnemyYielded(this, e);
  }

  stagger(target: Actor): void {
    const now = this.now;
    if (target === this.player) {
      // the player only flinches, then gets a window of stagger immunity (no stun-locks)
      target.poise = target.maxPoise;
      if (now < this.player.staggerImmuneUntil) return;
      this.player.staggerImmuneUntil = now + PLAYER_STAGGER_IMMUNE_MS;
      target.status.apply('stagger', now, PLAYER_STAGGER_MS);
      target.status.apply('exposed', now, PLAYER_STAGGER_MS + 600);
      this.interruptPlayer();
      return;
    }
    target.status.apply('stagger', now, STAGGER_MS);
    target.status.apply('exposed', now, STAGGER_MS + EXPOSED_MS);
    target.poise = target.maxPoise;
    if (target instanceof EnemyActor) {
      target.cancelAttack(this);
      this.fx.label(target.x, target.y - target.radius, 'Staggered', '#f2e6cf', now, 900);
    } else this.interruptPlayer();
  }

  private parry(source: Actor): void {
    const now = this.now;
    const p = this.player;
    p.riposteUntil = now + RIPOSTE_WINDOW_MS;
    this.fx.number(p.x, p.y - 26, 0, 'parry', false, now);
    this.fx.hitStop(now, 80);
    this.fx.shake(0.003, 70);
    if (source instanceof EnemyActor && !source.isBoss) this.stagger(source);
    else if (source instanceof EnemyActor) { source.cancelAttack(this); source.poise -= source.maxPoise * 0.35; }
    p.gainResource(this.resourceGain('onParry'), now);
    const c = p.gs.player.counters;
    c.parries = (c.parries ?? 0) + 1;
    fireProcs(this, 'onParry', source);
  }

  resourceGain(trigger: string): number {
    return this.player.cls?.resource.gains.find((g) => g.trigger === trigger)?.amount ?? 0;
  }

  // ───────── enemy attacks ─────────
  enemySpec(e: EnemyActor, a: EnemyAttackDef): HitSpec {
    const dmg = e.baseDamage * a.damageMult;
    return {
      kind: a.kind === 'projectile' ? 'ranged' : 'melee',
      lines: Object.entries(a.damageTypes).map(([type, share]) => ({ type: type as HitSpec['lines'][number]['type'], min: dmg * (share ?? 0) * 0.9, max: dmg * (share ?? 0) * 1.1 })),
      poise: a.poiseDamage, buildup: a.buildup, canCrit: false,
    };
  }

  enemyHitPlayer(e: EnemyActor, a: EnemyAttackDef): void {
    if (e.status.has('blind') && this.rng.chance(0.5)) { this.fx.label(this.player.x, this.player.y, 'Miss', '#a09a8e', this.now, 600); return; }
    this.applyHit(e, this.player, this.enemySpec(e, a), { unblockable: a.unblockable });
  }

  enemyAttackStart(e: EnemyActor, run: { def: EnemyAttackDef; dir: number; tx: number; ty: number }): void {
    const a = run.def;
    const p = this.player;
    if (a.kind === 'melee') {
      this.fx.arc(e.x, e.y, run.dir, a.arcDeg ?? 90, a.rangePx, 0xffa040, this.now);
      if (inSector(e.x, e.y, run.dir, a.arcDeg ?? 90, a.rangePx, p.x, p.y, p.radius)) this.enemyHitPlayer(e, a);
    } else if (a.kind === 'projectile' && a.projectile) {
      this.spawnProjectile(e, e.x, e.y - e.radius * 0.6, run.dir, a.projectile, this.enemySpec(e, a), { unblockable: a.unblockable });
    } else if (a.kind === 'spell') {
      // summoners: tag summon:<enemyId>:<count>
      const tag = (e.def.tags ?? []).map((t) => /^summon:(enemy:[a-z0-9-]+):(\d+)$/.exec(t)).find((m) => m);
      if (tag) {
        const mine = this.enemies.filter((o) => o.alive && o.summoner === e).length;
        const n = Math.min(Number(tag[2]), 6 - mine);
        for (let i = 0; i < n; i++) {
          const ang = (i / Math.max(1, n)) * Math.PI * 2 + this.rng.range(0, 1);
          const s = this.spawnEnemy(tag[1], e.x + Math.cos(ang) * 60, e.y + Math.sin(ang) * 60, { level: e.level, tier: e.tier, noElite: true });
          if (s) { s.summoner = e; s.engage(this, false); }
        }
        this.fx.ring(e.x, e.y, 70, 0x4a6b5a, this.now, 500);
      }
    } else if (a.kind === 'area') {
      const atPoint = a.rangePx > (a.radius ?? 0);
      const cx = atPoint ? run.tx : e.x, cy = atPoint ? run.ty : e.y;
      this.fx.ring(cx, cy, a.radius ?? 80, a.unblockable ? 0xff3030 : 0xffa040, this.now, 320);
      if (dist(cx, cy, p.x, p.y) <= (a.radius ?? 80) + p.radius) this.enemyHitPlayer(e, a);
      if (a.radius && a.radius > 80) this.fx.shake(0.005, 120);
    }
  }

  onBossPhase(e: EnemyActor, message: string | undefined, summon: { enemy: EnemyId; count: number } | undefined): void {
    bus.emit('boss:phase', { enemyId: e.def.id, phase: e.phaseIndex + 1 });
    if (message) this.ui?.toast(message, '#ffb347');
    if (summon) {
      for (let i = 0; i < summon.count; i++) {
        const a = (i / summon.count) * Math.PI * 2;
        const s = this.spawnEnemy(summon.enemy, e.x + Math.cos(a) * 70, e.y + Math.sin(a) * 70, { level: e.level, tier: e.tier, noElite: true });
        s?.engage(this, false);
      }
    }
  }

  // ───────── main loop ─────────
  update(time: number, delta: number): void {
    this.now = time;
    const dtMs = Math.min(50, delta);
    if (this.paused) {
      this.player.syncSprite(time);
      for (const e of this.enemies) if (e.alive) e.syncSprite(time);
      this.fx.update(time, 0);
      this.ui?.update(this, time);
      return;
    }
    const frozen = time < this.fx.hitStopUntil;
    const dt = frozen ? 0 : dtMs;
    const p = this.player;
    p.tick(time, dt);
    handleTicks(this, p, time, dt);
    for (const e of this.enemies) {
      if (!e.alive) continue;
      handleTicks(this, e, time, dt);
      if (dt > 0) e.update(this, time, dt);
      if (e.poise < e.maxPoise && time >= e.poiseRegenAt) e.poise = e.maxPoise;
    }
    if (dt > 0) this.separate();
    this.projectiles = this.projectiles.filter((pr) => { if (dt > 0) pr.update(this, dt); return !pr.dead; });
    this.areas = this.areas.filter((ar) => { ar.update(this, time); return !ar.dead; });
    this.pickups.update(this, time, dt);
    // sync visuals
    p.syncSprite(time);
    p.refreshTint();
    for (const e of this.enemies) if (e.alive) { e.syncSprite(time); e.refreshTint(); this.drawEnemyBar(e, time); }
    this.enemies = this.enemies.filter((e) => e.alive || e.sprite.active);
    this.updateCombatState(time);
    this.companion(time);
    this.fx.update(time, dt);
    this.ui?.update(this, time);
  }

  /** Beastwarden spirit hawk: periodic strike on the nearest engaged enemy */
  private nextCompanionAt = 0;
  private companion(now: number): void {
    const p = this.player;
    if (!p.alive || !p.hook('companionStrike') || now < this.nextCompanionAt) return;
    const every = p.hookNum('companionSpeed', 'everyMs', p.hookNum('companionStrike', 'everyMs', 3000));
    const target = this.enemies.filter((e) => e.alive && e.isEngaged() && dist(e.x, e.y, p.x, p.y) < 420).sort((a, b) => dist(a.x, a.y, p.x, p.y) - dist(b.x, b.y, p.x, p.y))[0];
    if (!target) return;
    this.nextCompanionAt = now + every;
    const w = weaponInfo(p);
    const pct = Math.max(p.hookNum('companionStrike', 'pct', 0.4), p.hookNum('companionPower', 'pct', 0));
    const bleed = p.hookNum('companionBleed', 'buildup', 0);
    this.fx.ring(target.x, target.y - 10, 18, 0xa3d68f, now, 250);
    this.applyHit(p, target, { kind: 'ranged', lines: w.lines, scaling: w.scaling, mult: pct, poise: 6, canCrit: false, buildup: bleed ? { bleed } : {} }, { spellId: 'spell:spirit-hawk' });
  }

  private drawEnemyBar(e: EnemyActor, now: number): void {
    if (e.isBoss || (now > e.showBarUntil && !e.elite)) return;
    const g = this.fx.frame;
    const w = Math.max(24, e.radius * 2.4), x = e.x - w / 2, y = e.y - e.radius * 2.6 - 8;
    g.fillStyle(0x0e0b08, 0.8).fillRect(x - 1, y - 1, w + 2, 5);
    g.fillStyle(e.elite ? 0xd4a646 : 0x9b2c2c, 1).fillRect(x, y, w * Math.max(0, e.hpPct), 3);
  }

  private updateCombatState(now: number): void {
    const p = this.player;
    const engaged = this.enemies.some((e) => e.alive && e.isEngaged() && dist(e.x, e.y, p.x, p.y) < 700);
    const inCombat = engaged || now - this.lastHostileAt < COMBAT_DISENGAGE_MS;
    if (inCombat !== p.inCombat) { p.inCombat = inCombat; p.markDirty(); }
    if (inCombat && !this.engagedEmitted) { this.engagedEmitted = true; bus.emit('combat:engaged', {}); }
    if (!inCombat && this.engagedEmitted) { this.engagedEmitted = false; bus.emit('combat:disengaged', {}); }
  }

  setTier(t: DangerTier): void { this.director.tier = t; }

  /** auto-assign new consumables to empty quickslots */
  onItemPicked(item: { def: string }): void {
    const def = Registry.tryGet('item', item.def);
    const qs = this.player.gs.player.equipment.quickslots;
    if (def?.itemKind !== 'consumable' || qs.includes(def.id)) return;
    const free = qs.indexOf(null);
    if (free >= 0) qs[free] = def.id;
  }

  destroy(): void {
    // never leave Claude 2 thinking we are still in combat (fast travel is gated on it)
    if (this.engagedEmitted) { this.engagedEmitted = false; bus.emit('combat:disengaged', {}); }
    for (const u of this.unsub) u();
    for (const e of this.enemies) e.destroy();
    for (const pr of this.projectiles) pr.kill();
    this.pickups.destroy();
    this.fx.destroy();
    this.ui?.destroy();
    this.enemies = [];
  }
}
