/**
 * The player combatant: cached stats, timed buffs, class resource, vitals (synced to GameState).
 */
import Phaser from 'phaser';
import { Game, Registry, bus } from '@/core';
import type { ClassDef, DamageType, GameState, HookParams, StatModifier } from '@/core';
import { CINDERLUNG_DECAY_MS, STAMINA_REGEN_DELAY_MS } from '../balance';
import type { CombatantView } from '../combat/HitResolver';
import { computePlayerStats, type PlayerStats } from '../stats/playerStats';
import type { ProcEffect } from '../stats/collect';
import { StatusState } from '../status/StatusState';
import { Actor } from './Actor';

export interface TimedBuff { id: string; until: number; mods: StatModifier[]; procs: ProcEffect[] }

export class PlayerActor extends Actor {
  stats!: PlayerStats;
  private dirty = true;
  private nextRecalc = 0;
  buffs: TimedBuff[] = [];
  hooks = new Map<string, HookParams>();
  procs: ProcEffect[] = [];
  mana = 0;
  stamina = 0;
  staminaSpentAt = 0;
  resourceTouchedAt = 0;
  inCombat = false;
  lastCombatAt = 0;
  timePhase: 'dawn' | 'day' | 'dusk' | 'night' = 'day';
  cinderDecayAt = 0;
  /** cooldown bookkeeping: spellId/hook → ready time */
  readonly cooldowns = new Map<string, number>();
  spawnX: number;
  spawnY: number;
  /** defence state (set by the controller, read by the runtime) */
  blocking = false;
  blockStart = 0;
  riposteUntil = 0;
  edricsReadyAt = 0;
  secondWindReadyAt = 0;
  staggerImmuneUntil = 0;
  /** Arcanist Attunement: school of the last spell cast */
  lastSchool: string | null = null;
  quickNockReady = false;
  gcdUntil = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, 'player', x, y, 12, texture, new StatusState());
    this.spawnX = x;
    this.spawnY = y;
    this.recalc(0);
    const p = this.gs.player;
    this.hp = p.hp > 0 ? Math.min(p.hp, this.maxHp) : this.maxHp;
    this.mana = Math.min(p.mana, this.stats.derived.maxMana);
    this.stamina = Math.min(p.stamina, this.stats.derived.maxStamina);
    this.poise = this.maxPoise;
  }

  get gs(): GameState { return Game.state; }
  get cls(): ClassDef | undefined {
    const id = this.gs.player.progression.classId;
    return id ? Registry.tryGet('class', id) : undefined;
  }
  get armor(): number { return this.stats.derived.armor; }
  get resist(): Record<DamageType, number> { return this.stats.derived.resist; }
  get moveSpeed(): number { return this.stats.derived.moveSpeed * this.status.moveMult(); }
  get resourceMax(): number { return this.hookNum('attunementMax', 'max', this.cls?.resource.max ?? 0); }
  get resource(): number { return this.gs.player.resource; }
  set resource(v: number) {
    const max = this.resourceMax;
    const nv = Phaser.Math.Clamp(v, 0, max);
    if (nv !== this.gs.player.resource) this.markDirty();
    this.gs.player.resource = nv;
  }

  markDirty(): void { this.dirty = true; }

  hook(name: string): HookParams | undefined { return this.hooks.get(name); }
  hookNum(name: string, key: string, fallback: number): number {
    const v = this.hooks.get(name)?.[key];
    return typeof v === 'number' ? v : fallback;
  }

  recalc(now: number): void {
    const extra: StatModifier[] = [];
    for (const b of this.buffs) extra.push(...b.mods);
    if (this.status.has('weaken')) extra.push({ stat: 'damageDealt', op: 'increased', value: -0.25 });
    this.stats = computePlayerStats(this.gs, {
      hpPct: this.maxHp > 1 ? this.hp / this.maxHp : 1, inCombat: this.inCombat, timePhase: this.timePhase, statuses: this.status.set,
    }, extra);
    this.hooks.clear();
    this.procs = [];
    for (const p of [...this.stats.collected.procs, ...this.buffs.flatMap((b) => b.procs)]) {
      if (p.kind === 'hook') this.hooks.set(p.hook, p.params ?? {});
      else this.procs.push(p);
    }
    const d = this.stats.derived;
    const ratio = this.maxHp > 1 ? this.hp / this.maxHp : 1;
    this.maxHp = d.maxHp;
    if (this.hp > 0) this.hp = Math.min(this.maxHp, Math.max(1, Math.round(ratio * this.maxHp)));
    this.maxPoise = d.poise;
    this.level = this.gs.player.progression.level;
    this.dirty = false;
    this.nextRecalc = now + 500;
  }

  addBuff(buff: TimedBuff): void {
    this.buffs = this.buffs.filter((b) => b.id !== buff.id);
    this.buffs.push(buff);
    this.markDirty();
  }

  view(): CombatantView {
    const d = this.stats.derived;
    return {
      level: this.level, attributes: d.attributes, block: this.stats.block, self: this.stats.self, armor: d.armor, resist: d.resist,
      statuses: this.status.set, critChance: d.critChance, critMultiplier: d.critMultiplier,
    };
  }

  /** per-frame upkeep: regen, buffs, resource decay, stat refresh, GameState sync */
  tick(now: number, dtMs: number): void {
    const before = this.buffs.length;
    this.buffs = this.buffs.filter((b) => b.until > now);
    if (this.buffs.length !== before) this.markDirty();
    if (this.dirty || now >= this.nextRecalc) this.recalc(now);

    const d = this.stats.derived;
    const dt = dtMs / 1000;
    if (this.alive) {
      if (now - this.staminaSpentAt > STAMINA_REGEN_DELAY_MS) this.stamina = Math.min(d.maxStamina, this.stamina + d.staminaRegen * dt);
      this.mana = Math.min(d.maxMana, this.mana + d.manaRegen * (this.inCombat ? 1 : 2) * dt);
      if (d.hpRegen > 0) this.hp = Math.min(this.maxHp, this.hp + d.hpRegen * dt);
      const pr = this.hookNum('percentRegen', 'pct', 0);
      if (pr > 0 && this.inCombat) this.hp = Math.min(this.maxHp, this.hp + this.maxHp * pr * dt);
    }
    // class resource decay
    const res = this.cls?.resource;
    if (res && this.resource > 0 && now - this.resourceTouchedAt > res.decayDelayMs) {
      this.resource = this.resource - res.decayPerSec * dt;
    }
    // poise regen
    if (this.poise < this.maxPoise && now >= this.poiseRegenAt) this.poise = this.maxPoise;
    // ward expiry
    if (this.ward > 0 && now >= this.wardUntil) this.ward = 0;
    // cinderlung decays out of combat
    const pr = this.gs.player.progression;
    if ((pr.cinderlung ?? 0) > 0 && !this.inCombat && now >= this.cinderDecayAt) {
      pr.cinderlung = (pr.cinderlung ?? 0) - 1;
      this.cinderDecayAt = now + CINDERLUNG_DECAY_MS;
      this.markDirty();
    }
    // sync vitals to GameState (HUD reads these)
    const p = this.gs.player;
    p.hp = Math.max(0, Math.round(this.hp));
    p.mana = Math.round(this.mana);
    p.stamina = Math.round(this.stamina);
  }

  gainResource(amount: number, now: number): void {
    if (!this.cls || amount === 0) return;
    if (amount > 0 && this.cls.resource.id === 'devotion') amount *= this.hookNum('devotionGain', 'mult', 1);
    this.resource = this.resource + amount;
    this.resourceTouchedAt = now;
  }

  spendStamina(cost: number, now: number): boolean {
    if (this.stamina <= 0 && cost > 0) return false;
    this.stamina -= cost; // may dip slightly negative (Souls rule: act if > 0)
    this.staminaSpentAt = now;
    return true;
  }

  heal(amount: number): number {
    const healed = Math.min(this.maxHp - this.hp, amount * this.stats.derived.healingReceived);
    this.hp += healed;
    return healed;
  }

  fullRestore(): void {
    const d = this.stats.derived;
    this.hp = this.maxHp;
    this.mana = d.maxMana;
    this.stamina = d.maxStamina;
    this.status.clearAll();
    const inv = this.gs.player.inventory;
    inv.draught.maxCharges = d.draughtCharges;
    inv.draught.charges = inv.draught.maxCharges;
    this.cooldowns.clear();
    bus.emit('stats:changed', {});
  }

  protected applyTint(): void {
    super.applyTint();
    if (this.status.has('stealth')) this.sprite.setAlpha(0.45);
  }
}
