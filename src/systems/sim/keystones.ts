/**
 * Keystone and kit hooks that run on a clock (Claude 3): Eye of the Storm (stormCharge), Halo (halo), and the Bard /
 * Skald auras (aura:dmg, aura:armor). Authority only, Phaser-free. Called once per player per tick from stepPlayer.
 */
import { hook } from '@/systems/rules/stats';
import { addBuff, dealDamage } from './combat';
import type { EnemyEnt, PlayerEnt } from './state';
import { dist2, type SimWorld } from './world';

const STORM_MAX = 5, STORM_PER = 0.25, STORM_EVERY = 1000;
const HALO_R = 100, HALO_COEF = 0.3;
const AURA_R = 300;

/** Eye of the Storm: each full second standing still adds a charge (max 5); the next hit spends them (+25% each). */
export function spendStormCharge(p: PlayerEnt): number {
  const n = p.stormCharge ?? 0;
  if (!n) return 1;
  p.stormCharge = 0;
  return 1 + STORM_PER * n;
}

export function tickKeystones(w: SimWorld, p: PlayerEnt): void {
  if (hook(p.stats, 'stormCharge')) {
    // the clock runs from when you stopped; moving (or a full charge) holds it at now
    const moving = w.t - p.movedAt < 100;
    if (moving || (p.stormCharge ?? 0) >= STORM_MAX) p.stormAt = w.t;
    else if (w.t - (p.stormAt ?? p.movedAt) >= STORM_EVERY) { p.stormCharge = (p.stormCharge ?? 0) + 1; p.stormAt = (p.stormAt ?? p.movedAt) + STORM_EVERY; }
  }
  if (w.t < (p.keystoneAt ?? 0)) return;
  p.keystoneAt = w.t + 1000;
  // Halo: a ring of light burns Umbral creatures near you
  if (hook(p.stats, 'halo')) {
    const dmg = ((p.stats.stats.sp ?? 0) + (p.weapon.min + p.weapon.max) / 8) * HALO_COEF;
    for (const e of w.enemies.values()) {
      if (e.dead || e.space !== p.space || (e as EnemyEnt).cdef.kind !== 'umbral' || !w.hostile(p, e) || dist2(p, e) > (HALO_R + e.r) ** 2) continue;
      dealDamage(w, p, e, dmg, 'radiance', { dot: true });
    }
  }
  // Bard / Skald: the party near you (you included) fights harder / stands firmer while you are close
  const dmgAura = hook(p.stats, 'aura:dmg'), armorAura = hook(p.stats, 'aura:armor');
  if (dmgAura || armorAura) {
    const mods = [...(dmgAura ? [{ stat: 'dmg' as const, op: 'flat' as const, value: dmgAura }] : []), ...(armorAura ? [{ stat: 'armor' as const, op: 'pct' as const, value: armorAura }] : [])];
    for (const q of w.players.values()) {
      if (q.dead || q.space !== p.space || q.team !== p.team || dist2(p, q) > AURA_R * AURA_R) continue;
      addBuff(w, p, q, { a: 'buff', id: `aura:${p.id}`, dur: 1500, to: 'target', mods });
    }
  }
}
