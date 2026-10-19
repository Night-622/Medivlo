/**
 * Input → player actions (SYSTEMS.md §2.1–2.2): move, sprint, roll, light/heavy combos, bow draw,
 * staff bolts, block/parry, abilities, Hearth Draught, quickslots, loadout swap, Ashmark purge.
 */
import Phaser from 'phaser';
import { Registry, bus } from '@/core';
import type { ItemId } from '@/core';
import {
  COMBO_MULTS, COMBO_RESET_MS, DRAUGHT_DURATION_MS, DRAUGHT_HEAL_PCT, HEAVY_MAX_HOLD_MS, HEAVY_MIN_HOLD_MS, HEAVY_MULT, ROLL_TIERS,
  SPRINT_COST_PER_SEC, SPRINT_MULT,
} from '../balance';
import { countItem, removeItem } from '../items/Inventory';
import { dist, inSector } from './Actor';
import { executeCast, prepareCast, type CastPlan } from './abilities';
import type { CombatRuntime } from './CombatRuntime';
import { onEnemyCleansed } from './outcomes';
import { applyEffectStatus, fireProcs } from './statusEffects';
import { weaponInfo, type WeaponInfo } from './weapon';

type Action =
  | { kind: 'light' | 'heavy'; t0: number; windup: number; active: number; recovery: number; hit: boolean; mult: number; combo: number; charge?: number }
  | { kind: 'charge'; t0: number }
  | { kind: 'draw'; t0: number; full: number; moved: boolean }
  | { kind: 'cast'; t0: number; plan: CastPlan; aimX: number; aimY: number }
  | { kind: 'roll'; t0: number; dur: number; vx: number; vy: number; iStart: number; iEnd: number }
  | { kind: 'drink' | 'swap' | 'recover'; t0: number; dur: number };

type KeyName = 'W' | 'A' | 'S' | 'D' | 'SHIFT';
/** one-shot inputs are queued from key events and buffered briefly, so taps are never lost */
const INPUT_BUFFER_MS = 350;
const ONE_SHOT = new Set(['Space', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'KeyR', 'KeyQ', 'KeyE', 'KeyX', 'KeyF']);

export class PlayerController {
  private keys: Record<KeyName, Phaser.Input.Keyboard.Key>;
  action: Action | null = null;
  private combo = 0;
  private comboResetAt = 0;
  private queued = false;
  private lmbWas = false;
  private rmbWas = false;
  private pressQueue: { code: string; at: number }[] = [];
  private ptrDown = { left: false, right: false };
  private ptrUp = { left: false };
  private readonly onKey: (ev: KeyboardEvent) => void;
  private readonly onPtrDown: (p: Phaser.Input.Pointer) => void;
  private readonly onPtrUp: (p: Phaser.Input.Pointer) => void;
  private lmbDownAt = 0;
  private nextBolt = 0;
  private itemCds = new Map<string, number>();
  private aim = { x: 0, y: 0 };

  constructor(private readonly scene: Phaser.Scene, private readonly rt: CombatRuntime) {
    this.keys = scene.input.keyboard!.addKeys('W,A,S,D,SHIFT', false) as Record<KeyName, Phaser.Input.Keyboard.Key>;
    scene.input.mouse?.disableContextMenu();
    rt.interruptPlayer = () => this.interrupt();
    this.onKey = (ev) => { if (!ev.repeat && ONE_SHOT.has(ev.code) && !rt.paused) this.pressQueue.push({ code: ev.code, at: rt.now }); };
    this.onPtrDown = (p) => { if (p.leftButtonDown()) this.ptrDown.left = true; if (p.rightButtonDown()) this.ptrDown.right = true; };
    this.onPtrUp = (p) => { if (p.leftButtonReleased()) this.ptrUp.left = true; };
    scene.input.keyboard!.on('keydown', this.onKey);
    scene.input.on('pointerdown', this.onPtrDown);
    scene.input.on('pointerup', this.onPtrUp);
  }

  destroy(): void {
    this.scene.input.keyboard?.off('keydown', this.onKey);
    this.scene.input.off('pointerdown', this.onPtrDown);
    this.scene.input.off('pointerup', this.onPtrUp);
  }

  private get p() { return this.rt.player; }

  interrupt(): void {
    if (this.action?.kind === 'roll') return;
    this.action = null;
    this.p.blocking = false;
  }

  /** lose queued edge states while paused so a panel click doesn't fire an attack */
  resetEdges(): void {
    const ptr = this.scene.input.activePointer;
    this.lmbWas = ptr.leftButtonDown();
    this.rmbWas = ptr.rightButtonDown();
    this.pressQueue = [];
    this.ptrDown = { left: false, right: false };
    this.ptrUp = { left: false };
  }

  /** try queued one-shot presses; keep the ones that can't happen yet (input buffer) */
  private processQueue(now: number): void {
    const keep: { code: string; at: number }[] = [];
    for (const q of this.pressQueue) {
      if (now - q.at > INPUT_BUFFER_MS) continue;
      if (!this.tryPress(q.code, now)) keep.push(q);
    }
    this.pressQueue = keep;
  }

  private tryPress(code: string, now: number): boolean {
    if (code === 'KeyF') { this.tryPurge(now); return true; }
    if (code === 'Space') { if (!this.canRoll()) return false; this.startRoll(now); return true; }
    if (this.busy()) return false;
    if (code.startsWith('Digit')) { this.castSlot(Number(code.slice(5)) - 1, now); return true; }
    if (code === 'KeyR') this.drinkDraught(now);
    else if (code === 'KeyQ') this.useQuickslot(0, now);
    else if (code === 'KeyE') this.useQuickslot(1, now);
    else if (code === 'KeyX') this.swapLoadout(now);
    return true;
  }

  update(now: number, dtMs: number): void {
    const p = this.p;
    const ptr = this.scene.input.activePointer;
    const wp = ptr.positionToCamera(this.scene.cameras.main) as Phaser.Math.Vector2;
    this.aim = { x: wp.x, y: wp.y };
    if (!p.alive) { this.action = null; return; }

    const lmb = ptr.leftButtonDown(), rmb = ptr.rightButtonDown();
    const lmbDown = (lmb && !this.lmbWas) || this.ptrDown.left;
    const lmbUp = (!lmb && this.lmbWas) || (this.ptrUp.left && !lmb);
    const rmbDown = (rmb && !this.rmbWas) || this.ptrDown.right;
    this.lmbWas = lmb; this.rmbWas = rmb;
    this.ptrDown = { left: false, right: false };
    this.ptrUp = { left: false };
    const incap = p.status.incapacitated();
    const w = weaponInfo(p);
    const act = this.action;

    // facing follows the cursor unless committed to a swing/roll
    if (!act || act.kind === 'draw' || act.kind === 'charge' || act.kind === 'cast') p.facing = Math.atan2(this.aim.y - p.y, this.aim.x - p.x);

    if (incap) {
      this.action = null;
      p.blocking = false;
      if (this.pressQueue.some((q) => q.code === 'KeyF')) { this.tryPurge(now); this.pressQueue = this.pressQueue.filter((q) => q.code !== 'KeyF'); }
      return;
    }

    // ── one-shot keys: roll, abilities, draught, quickslots, swap, purge (buffered)
    this.processQueue(now);

    // ── block
    const shield = p.stats.collected.offhand?.def.offhand?.family === 'shield';
    const canBlock = shield && (!this.action || this.action.kind === 'recover' || (this.action.kind === 'light' && now - this.action.t0 > this.action.windup + this.action.active));
    if (rmb && canBlock) {
      if (!p.blocking || rmbDown) { p.blocking = true; p.blockStart = now; this.action = null; }
    } else if (!rmb || !shield) p.blocking = false;

    // ── attacks
    if (!p.blocking) this.handleAttack(w, lmb, lmbDown, lmbUp, now);
    this.advanceAction(w, now, dtMs);
    this.move(dtMs, now);
    this.rt.playerNoisy = !!this.action || (this.keys.SHIFT.isDown && this.moveDir() !== null);
  }

  private busy(): boolean {
    const a = this.action;
    return !!a && (a.kind === 'roll' || a.kind === 'cast' || a.kind === 'drink' || a.kind === 'swap' || a.kind === 'heavy' || a.kind === 'charge'
      || (a.kind === 'light' && this.rt.now - a.t0 < a.windup + a.active));
  }

  // ───────── movement ─────────
  private moveDir(): { x: number; y: number } | null {
    const k = this.keys;
    const x = (k.D.isDown ? 1 : 0) - (k.A.isDown ? 1 : 0);
    const y = (k.S.isDown ? 1 : 0) - (k.W.isDown ? 1 : 0);
    if (!x && !y) return null;
    const l = Math.hypot(x, y);
    return { x: x / l, y: y / l };
  }

  private move(dtMs: number, now: number): void {
    const p = this.p;
    const a = this.action;
    if (a?.kind === 'roll') return;
    const dir = this.moveDir();
    if (!dir) return;
    let mult = 1;
    if (p.blocking) mult = 0.5;
    else if (a?.kind === 'draw') { mult = 0.5; a.moved = true; }
    else if (a?.kind === 'charge' || a?.kind === 'drink') mult = 0.45;
    else if (a?.kind === 'cast') mult = a.plan.spell.canMoveWhileCasting ? 0.5 : 0;
    else if (a?.kind === 'light' || a?.kind === 'heavy') mult = now - a.t0 < a.windup + a.active ? 0.15 : 0.4;
    else if (a?.kind === 'swap') mult = 0.6;
    const sprint = this.keys.SHIFT.isDown && !a && !p.blocking && p.stamina > 0;
    if (sprint) { p.stamina -= SPRINT_COST_PER_SEC * (dtMs / 1000); p.staminaSpentAt = now; mult *= SPRINT_MULT; }
    const v = p.moveSpeed * mult * (dtMs / 1000);
    this.rt.move(p, dir.x * v, dir.y * v);
  }

  // ───────── roll ─────────
  private canRoll(): boolean {
    const p = this.p;
    if (this.action?.kind === 'roll' || this.action?.kind === 'cast' || this.action?.kind === 'heavy') return false;
    if (this.action?.kind === 'light' && this.rt.now - this.action.t0 < this.action.windup + this.action.active) return false;
    if (p.stamina <= 0 || p.hook('noDodge')) return false;
    return p.stats.collected.wornWeight / p.stats.derived.equipCapacity < 1;
  }

  private startRoll(now: number): void {
    const p = this.p;
    const load = p.stats.collected.wornWeight / p.stats.derived.equipCapacity;
    const tier = ROLL_TIERS.find((t) => load < t.maxLoad) ?? ROLL_TIERS[ROLL_TIERS.length - 1];
    p.spendStamina(tier.cost * p.stats.derived.dodgeCostMult, now);
    const dir = this.moveDir() ?? { x: Math.cos(p.facing), y: Math.sin(p.facing) };
    const distPx = tier.distance * p.stats.derived.dodgeDistanceMult;
    this.action = { kind: 'roll', t0: now, dur: tier.durationMs, vx: (dir.x * distPx) / tier.durationMs, vy: (dir.y * distPx) / tier.durationMs, iStart: tier.iframeStart, iEnd: tier.iframeEnd };
    p.iframeUntil = now + tier.iframeEnd;
    p.blocking = false;
    if (p.cls?.resource.id === 'focus') p.resource = p.resource - 2;
    if (p.hook('quickNock')) p.quickNockReady = true;
    fireProcs(this.rt, 'onDodge', null);
  }

  // ───────── attacks ─────────
  private handleAttack(w: WeaponInfo, lmb: boolean, lmbDown: boolean, lmbUp: boolean, now: number): void {
    const p = this.p;
    const a = this.action;
    if (w.kind === 'bow') {
      if (lmbDown && !a && p.stamina > 0) {
        const full = 1000 / (w.aps * p.stats.derived.attackSpeed * p.status.actionMult());
        this.action = { kind: 'draw', t0: p.quickNockReady ? now - full : now, full, moved: false };
        p.quickNockReady = false;
      }
      if (lmbUp && a?.kind === 'draw') this.loose(w, a, now);
      return;
    }
    if (w.kind === 'caster') {
      if (lmb && (!a || a.kind === 'recover') && now >= this.nextBolt && w.projectile) {
        this.nextBolt = now + 1000 / (w.aps * p.stats.derived.attackSpeed * p.status.actionMult());
        if (!p.spendStamina(w.stamina * 0.5, now)) return;
        const angle = Math.atan2(this.aim.y - p.y, this.aim.x - p.x);
        this.rt.spawnProjectile(p, p.x, p.y - 14, angle, w.projectile, { kind: 'spell', lines: w.lines, scaling: w.scaling, poise: w.poise, buildup: w.buildup });
        this.action = { kind: 'recover', t0: now, dur: 120 };
      }
      return;
    }
    // melee
    if (lmbDown) {
      this.lmbDownAt = now;
      if (a?.kind === 'light') this.queued = true;
    }
    if (lmb && !a && now - this.lmbDownAt >= HEAVY_MIN_HOLD_MS && this.lmbDownAt > 0) {
      this.action = { kind: 'charge', t0: this.lmbDownAt };
      this.rt.playerThreatUntil = now + 500;
    }
    if (lmbUp) {
      if (a?.kind === 'charge') this.startSwing(w, 'heavy', now, Math.min(1, (now - a.t0 - HEAVY_MIN_HOLD_MS) / (HEAVY_MAX_HOLD_MS - HEAVY_MIN_HOLD_MS)));
      else if (!a || a.kind === 'recover') this.startSwing(w, 'light', now, 0);
      this.lmbDownAt = 0;
    }
  }

  private startSwing(w: WeaponInfo, kind: 'light' | 'heavy', now: number, charge: number): void {
    const p = this.p;
    const cost = w.stamina * (kind === 'heavy' ? 1.6 : 1);
    if (!p.spendStamina(cost, now)) return;
    if (now > this.comboResetAt) this.combo = 0;
    const cycle = 1000 / (w.aps * p.stats.derived.attackSpeed * p.status.actionMult());
    const combo = kind === 'light' ? this.combo : 0;
    const mult = kind === 'heavy' ? HEAVY_MULT[0] + (HEAVY_MULT[1] - HEAVY_MULT[0]) * Math.max(0, charge) : COMBO_MULTS[combo];
    this.action = kind === 'heavy'
      ? { kind, t0: now, windup: 160, active: cycle * 0.2, recovery: cycle * 0.7, hit: false, mult, combo, charge }
      : { kind, t0: now, windup: cycle * 0.3, active: cycle * 0.2, recovery: cycle * 0.5, hit: false, mult, combo };
    if (kind === 'light') this.combo = (this.combo + 1) % COMBO_MULTS.length;
    this.queued = false;
  }

  private loose(w: WeaponInfo, a: Extract<Action, { kind: 'draw' }>, now: number): void {
    const p = this.p;
    const progress = Math.min(1, (now - a.t0) / a.full);
    this.action = { kind: 'recover', t0: now, dur: 150 };
    if (progress < 0.25 || !w.projectile) return;
    p.spendStamina(w.stamina, now);
    if (progress >= 1 && !a.moved && p.cls?.resource.id === 'focus') {
      p.gainResource(1 + p.hookNum('focusedDraw', 'extra', 0), now);
    }
    const angle = Math.atan2(this.aim.y - p.y, this.aim.x - p.x);
    this.rt.spawnProjectile(p, p.x, p.y - 14, angle, w.projectile, {
      kind: 'ranged', lines: w.lines, scaling: w.scaling, mult: 0.5 + 0.5 * progress, poise: w.poise * progress, buildup: w.buildup, critBonus: w.critBonus,
    });
  }

  private advanceAction(w: WeaponInfo, now: number, dtMs: number): void {
    const a = this.action;
    const p = this.p;
    if (!a) return;
    const t = now - a.t0;
    switch (a.kind) {
      case 'roll': {
        const ease = 1.25 - (t / a.dur) * 0.5;
        this.rt.move(p, a.vx * ease * dtMs, a.vy * ease * dtMs);
        if (t >= a.dur) this.action = null;
        break;
      }
      case 'light':
      case 'heavy':
        if (!a.hit && t >= a.windup) {
          a.hit = true;
          this.swingHit(w, a, now);
        }
        if (t >= a.windup + a.active + a.recovery) {
          this.action = null;
          this.comboResetAt = now + COMBO_RESET_MS;
          if (this.queued && a.kind === 'light') this.startSwing(w, 'light', now, 0);
        }
        break;
      case 'cast':
        if (t >= a.plan.castMs) { this.action = { kind: 'recover', t0: now, dur: 120 }; executeCast(this.rt, a.plan, this.aim.x, this.aim.y); }
        break;
      case 'drink':
      case 'swap':
      case 'recover':
        if (t >= a.dur) this.action = null;
        break;
      case 'charge':
      case 'draw': {
        const pct = a.kind === 'draw' ? Math.min(1, t / a.full) : Math.min(1, t / HEAVY_MAX_HOLD_MS);
        const g = this.rt.fx.frame;
        g.lineStyle(3, pct >= 1 ? 0xd4a646 : 0xe8d9b5, 0.9).beginPath()
          .arc(p.x, p.y - 20, 16, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct).strokePath();
        break;
      }
    }
  }

  private swingHit(w: WeaponInfo, a: Extract<Action, { kind: 'light' | 'heavy' }>, now: number): void {
    const p = this.p;
    const reach = w.reach + (a.kind === 'heavy' ? 6 : 0);
    const arc = w.arc + (a.kind === 'heavy' ? 20 : 0);
    this.rt.fx.arc(p.x, p.y - 8, p.facing, arc, reach, a.kind === 'heavy' ? 0xffe2a0 : 0xf2e6cf, now);
    const thirdHit = a.kind === 'light' && a.combo === COMBO_MULTS.length - 1;
    const poise = w.poise * (a.kind === 'heavy' ? 2 : thirdHit ? 1.5 : 1);
    for (const e of this.rt.enemies) {
      if (!e.alive || !inSector(p.x, p.y, p.facing, arc, reach, e.x, e.y, e.radius)) continue;
      this.rt.applyHit(p, e, { kind: 'melee', lines: w.lines, scaling: w.scaling, mult: a.mult, poise, buildup: w.buildup, critBonus: w.critBonus }, { heavy: a.kind === 'heavy', heavyFull: a.kind === 'heavy' && (a.charge ?? 0) >= 0.9 });
    }
  }

  // ───────── abilities & items ─────────
  castSlot(i: number, now: number): void {
    const id = this.p.gs.player.spellbook.slots[i];
    if (!id || this.action?.kind === 'cast') return;
    const plan = prepareCast(this.rt, id);
    if (typeof plan === 'string') { if (plan) this.rt.fx.label(this.p.x, this.p.y, plan, '#9c8f72', now, 700); return; }
    this.p.blocking = false;
    if (plan.castMs <= 0) { executeCast(this.rt, plan, this.aim.x, this.aim.y); this.action = { kind: 'recover', t0: now, dur: 150 }; }
    else { this.action = { kind: 'cast', t0: now, plan, aimX: this.aim.x, aimY: this.aim.y }; this.rt.playerThreatUntil = now + plan.castMs; }
  }

  private drinkDraught(now: number): void {
    const p = this.p;
    const d = p.gs.player.inventory.draught;
    if (d.charges <= 0) { this.rt.fx.label(p.x, p.y, 'Hearth Draught empty', '#9c8f72', now, 900); return; }
    d.charges--;
    this.action = { kind: 'drink', t0: now, dur: DRAUGHT_DURATION_MS };
    const total = p.maxHp * DRAUGHT_HEAL_PCT * d.potency * (1 - p.hookNum('draughtPenalty', 'pct', 0));
    p.status.apply('regen', now, DRAUGHT_DURATION_MS, 1, { dps: total / (DRAUGHT_DURATION_MS / 1000) });
    this.rt.fx.ring(p.x, p.y - 10, 24, 0x7be07b, now, 500);
  }

  private useQuickslot(i: 0 | 1, now: number): void {
    const p = this.p;
    const id = p.gs.player.equipment.quickslots[i];
    if (!id) return;
    const def = Registry.tryGet('item', id);
    const c = def?.consumable;
    if (!def || !c || countItem(p.gs, id) <= 0) return;
    if ((this.itemCds.get(id) ?? 0) > now) return;
    this.itemCds.set(id, now + c.cooldownMs);
    const d = p.stats.derived;
    if (c.restore?.mana) p.mana = Math.min(d.maxMana, p.mana + c.restore.mana);
    if (c.restore?.stamina) p.stamina = Math.min(d.maxStamina, p.stamina + c.restore.stamina);
    if (c.heal) {
      const amt = (c.heal.pct ?? 0) * p.maxHp + (c.heal.flat ?? 0);
      if (c.heal.overMs) p.status.apply('regen', now, c.heal.overMs, 1, { dps: amt / (c.heal.overMs / 1000) });
      else p.heal(amt);
    }
    if (c.durationMs) {
      p.addBuff({
        id: `consumable:${c.category === 'oil' ? 'oil' : c.category === 'food' ? 'food' : def.id}`, until: now + c.durationMs,
        mods: c.effects.flatMap((e) => (e.kind === 'modifier' ? [e.mod] : [])),
        procs: c.effects.flatMap((e) => (e.kind === 'applyStatus' || e.kind === 'hook' ? [e] : [])),
      });
    } else for (const e of c.effects) if (e.kind === 'applyStatus') applyEffectStatus(this.rt, e, p, p);
    removeItem(p.gs, id as ItemId, 1);
    bus.emit('item:used', { uid: '', def: def.id });
    this.action = { kind: 'drink', t0: now, dur: c.useTimeMs };
    this.rt.fx.label(p.x, p.y, def.name, '#e8d9b5', now, 800);
  }

  private swapLoadout(now: number): void {
    const p = this.p;
    const e = p.gs.player.equipment;
    e.activeLoadout = e.activeLoadout === 0 ? 1 : 0;
    p.markDirty();
    this.action = { kind: 'swap', t0: now, dur: 400 };
    bus.emit('stats:changed', {});
    this.rt.fx.label(p.x, p.y, `Loadout ${e.activeLoadout + 1}`, '#e8d9b5', now, 700);
  }

  private tryPurge(now: number): void {
    const p = this.p;
    const target = this.rt.enemies.find((e) => e.alive && e.subdued && e.def.cleansable && !e.def.tags?.includes('autoYield') && dist(e.x, e.y, p.x, p.y) < 110 + e.radius);
    if (!target) return;
    this.rt.fx.ring(p.x, p.y - 8, 80, 0xffb347, now, 500);
    onEnemyCleansed(this.rt, target);
  }
}
