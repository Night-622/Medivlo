/**
 * Status triggers (buildup fills), direct status effects, procs, and DoT/heal ticks.
 */
import type { BuildupStatus, EffectDef, Trigger } from '@/core';
import { P, STATUS } from '../balance';
import type { HitResult } from '../combat/HitResolver';
import type { Actor } from './Actor';
import { dist } from './Actor';
import type { CombatRuntime } from './CombatRuntime';
import { EnemyActor } from './Enemy';

const STATUS_LABEL: Record<string, string> = { bleed: 'Bleed!', burn: 'Burning', frozen: 'Frozen!', shock: 'Shocked', poison: 'Poisoned' };
const LABEL_COLOR: Record<string, string> = { bleed: '#d04040', burn: '#ff8a3d', frozen: '#8fd3ff', shock: '#f7e463', poison: '#8fdc5a' };

export function triggerBuildupStatus(rt: CombatRuntime, target: Actor, s: BuildupStatus, res: HitResult, source: Actor): void {
  const now = rt.now;
  rt.fx.label(target.x, target.y - target.radius * 1.5, STATUS_LABEL[s], LABEL_COLOR[s], now, 900);
  switch (s) {
    case 'bleed': {
      const pct = target === rt.player ? STATUS.bleed.playerPct : target.isBoss ? STATUS.bleed.bossPct : STATUS.bleed.burstPct;
      rt.directDamage(target, Math.round(target.maxHp * pct), 'bleed', source);
      if (source === rt.player && rt.player.hook('bleedFreeze') && target.alive) triggerBuildupStatus(rt, target, 'frozen', res, source);
      break;
    }
    case 'burn': {
      const fire = Math.max(res.byType.fire ?? 0, res.total * 0.5);
      target.status.apply('burn', now, STATUS.burn.durationMs, 1, { dps: Math.max(1, fire * STATUS.burn.dpsPctOfHit) });
      break;
    }
    case 'frozen':
      if (target.isBoss) target.status.apply('slow', now, STATUS.frozen.bossSlowMs, STATUS.frozen.bossSlow);
      else {
        target.status.apply('frozen', now, STATUS.frozen.durationMs);
        if (target instanceof EnemyActor) target.cancelAttack(rt);
        else rt.interruptPlayer();
      }
      break;
    case 'shock':
      target.status.apply('shock', now, STATUS.shock.durationMs);
      break;
    case 'poison':
      target.status.apply('poison', now, STATUS.poison.durationMs, 1, { stacks: 1, maxStacks: STATUS.poison.maxStacks, dps: STATUS.poison.perStackPerSec * P(source.level) });
      break;
  }
}

/** applyStatus EffectDef (abilities, procs, consumables) */
export function applyEffectStatus(rt: CombatRuntime, e: Extract<EffectDef, { kind: 'applyStatus' }>, source: Actor, target: Actor | null): void {
  if (e.chance !== undefined && !rt.rng.chance(e.chance)) return;
  const now = rt.now;
  const targets: Actor[] = e.target === 'self' ? [source]
    : e.target === 'area' ? (source.team === 'player' ? rt.enemies.filter((x) => x.alive && dist(x.x, x.y, source.x, source.y) < 120) : [rt.player])
      : target ? [target] : [];
  for (const t of targets) {
    if (!t.alive) continue;
    const s = e.status;
    if (e.buildup && (s === 'bleed' || s === 'burn' || s === 'frozen' || s === 'shock' || s === 'poison')) {
      if (t.status.addBuildup(s, e.buildup, now, s === 'poison' ? 0.5 : 0)) {
        triggerBuildupStatus(rt, t, s, { byType: {}, total: 10 * P(source.level), crit: false, poise: 0, buildup: {}, mainType: 'fire' }, source);
      }
      continue;
    }
    const dur = e.durationMs ?? 3000;
    switch (s) {
      case 'root':
        if (t.isBoss) t.status.apply('slow', now, dur, 0.4); else t.status.apply('root', now, dur);
        break;
      case 'chill': t.status.apply('chill', now, dur, 1, { stacks: e.magnitude ?? 1, maxStacks: 5 }); break;
      case 'slow': t.status.apply('slow', now, dur, e.magnitude ?? 0.3); break;
      case 'ward':
        t.ward = Math.max(t.ward, t.maxHp * (e.magnitude ?? 0.2) * (t === rt.player ? 1 + rt.player.hookNum('wardBoost', 'pct', 0) : 1));
        t.wardUntil = now + dur;
        rt.fx.ring(t.x, t.y - 10, 26, 0xffb347, now, 400);
        break;
      case 'regen': t.status.apply('regen', now, dur, 1, { dps: e.magnitude ?? 1 }); break;
      default: t.status.apply(s, now, dur, e.magnitude ?? 1);
    }
  }
}

/** player procs from traits / nodes / items / buffs */
export function fireProcs(rt: CombatRuntime, trigger: Trigger, other: Actor | null): void {
  const p = rt.player;
  for (const e of p.procs) {
    if (e.kind !== 'applyStatus' || e.trigger !== trigger) continue;
    applyEffectStatus(rt, e, p, e.target === 'self' ? p : other);
  }
}

/** DoT damage and HoT heals from active statuses */
export function handleTicks(rt: CombatRuntime, a: Actor, now: number, dtMs: number): void {
  const ticks = a.status.update(now, dtMs);
  for (const t of ticks) {
    if (t.id === 'regen') {
      if (a === rt.player) {
        const healed = rt.player.heal(t.amount);
        if (healed >= 1) rt.fx.number(a.x, a.y - 30, healed, 'heal', false, now);
      } else a.hp = Math.min(a.maxHp, a.hp + t.amount);
      continue;
    }
    const type = t.id === 'burn' ? 'fire' : t.id === 'poison' ? 'poison' : 'slash';
    const resist = a.resist[type as 'fire'] ?? 0;
    const amt = Math.max(1, Math.round(t.amount * (1 - resist)));
    rt.directDamage(a, amt, type);
  }
  // second wind (Warden node)
  if (a === rt.player && a.alive) {
    const sw = rt.player.hook('secondWind');
    if (sw && a.hpPct < rt.player.hookNum('secondWind', 'threshold', 0.3) && now >= rt.player.secondWindReadyAt) {
      rt.player.secondWindReadyAt = now + rt.player.hookNum('secondWind', 'cooldownMs', 90000);
      const dur = rt.player.hookNum('secondWind', 'durationMs', 5000);
      a.status.apply('regen', now, dur, 1, { dps: (a.maxHp * rt.player.hookNum('secondWind', 'heal', 0.25)) / (dur / 1000) });
      rt.fx.label(a.x, a.y, 'Second Wind', '#7be07b', now);
    }
  }
}
