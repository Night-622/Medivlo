/**
 * The player's current weapon, resolved into attack numbers (item level, upgrades, quiver).
 */
import type { AttributeId, BuildupStatus, DamageRoll, ProjectileDef, ScalingGrade, WeaponFamily } from '@/core';
import { P, UPGRADE_PER_LEVEL } from '../balance';
import type { PlayerActor } from './Player';

export interface WeaponInfo {
  family: WeaponFamily | 'fists';
  lines: DamageRoll[];
  scaling: Partial<Record<AttributeId, ScalingGrade>>;
  aps: number;
  reach: number;
  arc: number;
  poise: number;
  stamina: number;
  critBonus: number;
  buildup: Partial<Record<BuildupStatus, number>>;
  projectile: ProjectileDef | null;
  kind: 'melee' | 'bow' | 'caster';
}

const FISTS: WeaponInfo = {
  family: 'fists', lines: [{ type: 'blunt', min: 3, max: 5 }], scaling: { might: 'D' }, aps: 2, reach: 36, arc: 80, poise: 5, stamina: 8,
  critBonus: 0, buildup: {}, projectile: null, kind: 'melee',
};

export function weaponInfo(p: PlayerActor): WeaponInfo {
  const w = p.stats.collected.weapon;
  const ws = w?.def.weapon;
  if (!w || !ws) return FISTS;
  const lvl = P(w.inst.itemLevel) / P(w.def.itemLevel);
  const up = 1 + UPGRADE_PER_LEVEL * w.inst.upgrade;
  const lines = ws.damage.map((l) => ({ type: l.type, min: l.min * lvl * up, max: l.max * lvl * up }));
  const buildup: Partial<Record<BuildupStatus, number>> = { ...(ws.buildup ?? {}) };
  const off = p.stats.collected.offhand?.def.offhand;
  if (ws.family === 'bow' && off?.family === 'quiver' && off.projectileOverride) {
    for (const [s, v] of Object.entries(off.projectileOverride.buildup ?? {}) as [BuildupStatus, number][]) buildup[s] = (buildup[s] ?? 0) + v;
    for (const l of off.projectileOverride.damage) lines.push({ ...l });
  }
  const conv = p.hook('convertPhysical');
  if (conv) {
    const pct = typeof conv.pct === 'number' ? conv.pct : 0.3;
    const to = (typeof conv.to === 'string' ? conv.to : 'fire') as DamageRoll['type'];
    for (const l of [...lines]) {
      if (l.type !== 'slash' && l.type !== 'pierce' && l.type !== 'blunt') continue;
      lines.push({ type: to, min: l.min * pct, max: l.max * pct });
      l.min *= 1 - pct; l.max *= 1 - pct;
    }
  }
  const kind = ws.family === 'bow' || ws.family === 'crossbow' ? 'bow' : ws.family === 'staff' || ws.family === 'wand' ? 'caster' : 'melee';
  return {
    family: ws.family, lines, scaling: ws.scaling, aps: ws.attacksPerSec, reach: ws.reachPx, arc: ws.arcDeg, poise: ws.poiseDamage,
    stamina: ws.staminaCost, critBonus: ws.critChance ?? 0, buildup, projectile: ws.projectile ?? null, kind,
  };
}

/** total min/max of a set of lines */
export function lineSum(lines: DamageRoll[]): { min: number; max: number } {
  return lines.reduce((a, l) => ({ min: a.min + l.min, max: a.max + l.max }), { min: 0, max: 0 });
}
