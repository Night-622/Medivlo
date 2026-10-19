/**
 * Arena hazards (Claude 3, docs/systems/ARENA_HAZARDS.md): boss-room set pieces built from five kinds.
 *  anchor — a boss with `anchorStun` that is charging, leaping or knocked into it is stunned 3 s and Vulnerable
 *  vent   — erupts on a timer (telegraphed, hurts players); a `ventHeal` boss standing in a live vent heals 2%/s;
 *           a player's F douses it for 20 s
 *  light  — a `lightOnly` boss takes damage only inside a lit light; F lights it for 30 s
 *  pillar — F strikes it (3 strikes by default); while any stands, `paysBack` reflects 25% and `shielded` cuts damage to 20%
 *  cover  — stops shots and charges
 * Placed by the world (Claude 2) through Sim.addHazard; cleared when the room's boss dies, yields or despawns.
 */
import { hook } from '@/systems/rules/stats';
import { applyStatus, dealDamage, heal } from './combat';
import { yieldEnemy } from './death';
import type { Combatant, EnemyEnt, PlayerEnt } from './state';
import type { SimWorld } from './world';

import type { HazardKind, HazardSpec } from '@/core/hc';
export type { HazardKind, HazardSpec };
export interface HazardEnt extends HazardSpec {
  charges: number;
  /** vent: erupting until; light: lit until; vent: doused until */
  activeUntil: number;
  dousedUntil: number;
  /** vent turned against a `ventHurt` boss until */
  turnedUntil: number;
  nextCycle: number;
  /** cover: charges it started with (restored at each boss phase) */
  max: number;
}

const VENT_EVERY = 8000, VENT_ERUPT = 2500, VENT_TELL = 900, DOUSE_MS = 20_000, LIGHT_MS = 30_000, USE_RANGE = 48;

export function addHazard(w: SimWorld, h: HazardSpec): void {
  const prev = w.hazards.get(h.id);
  w.hazards.set(h.id, {
    ...h, charges: prev?.charges ?? h.charges ?? (h.kind === 'pillar' ? 3 : Infinity),
    activeUntil: prev?.activeUntil ?? 0, dousedUntil: prev?.dousedUntil ?? 0, turnedUntil: prev?.turnedUntil ?? 0, nextCycle: prev?.nextCycle ?? w.t + VENT_EVERY / 2,
    max: h.charges ?? Infinity,
  });
}

export const removeHazard = (w: SimWorld, id: string): void => { w.hazards.delete(id); };

const inside = (h: HazardEnt, c: { x: number; y: number; r: number }) => (c.x - h.x) ** 2 + (c.y - h.y) ** 2 <= (h.r + c.r) ** 2;
const live = (h: HazardEnt) => h.charges > 0;
const hazardsIn = (w: SimWorld, space: string, kind: HazardKind) => [...w.hazards.values()].filter((h) => h.space === space && h.kind === kind && live(h));

export function tickHazards(w: SimWorld, dt: number): void {
  for (const h of w.hazards.values()) {
    if (h.kind !== 'vent' || w.t < h.dousedUntil) continue;
    // vents: telegraph, then erupt; players caught in it are burnt
    if (w.t >= h.nextCycle) {
      h.nextCycle = w.t + VENT_EVERY;
      w.emit('enemy:telegraph', { id: h.id, shape: 'circle', x: Math.round(h.x), y: Math.round(h.y), r: h.r, w: 0, angle: 0, ms: VENT_TELL });
      w.later(VENT_TELL, () => {
        if (w.t < h.dousedUntil || !w.hazards.has(h.id)) return;
        h.activeUntil = w.t + VENT_ERUPT;
        const boss = roomBoss(w, h.space);
        // a vent the hero turned (pylons, hammers, time patches) erupts on the boss instead of on the party
        if (w.t < h.turnedUntil) { if (boss && inside(h, boss)) dealDamage(w, null, boss, boss.maxHp * 0.06, 'storm', { dot: true, noProc: true }); return; }
        for (const p of w.players.values()) if (p.space === h.space && !p.dead && inside(h, p)) dealDamage(w, boss ?? null, p, (boss?.dmg ?? 20) * 1.2, 'ash', { noProc: true, dot: !boss });
      });
    }
  }
  // bosses: vent healing and anchor stuns
  for (const e of w.enemies.values()) {
    if (e.dead || e.kind !== 'enemy') continue;
    if (hook(e.stats, 'ventHeal') && hazardsIn(w, e.space, 'vent').some((h) => w.t < h.activeUntil && w.t >= h.dousedUntil && inside(h, e))) {
      heal(w, e, e, e.maxHp * 0.02 * (dt / 1000), true);
    }
    if (hook(e.stats, 'anchorStun') && (e.motion || e.anim === 'leap')) {
      const a = hazardsIn(w, e.space, 'anchor').find((h) => inside(h, e));
      if (a) {
        a.charges--;
        e.motion = null;
        e.ccImmuneUntil = 0; // the set piece always lands
        applyStatus(w, null, e, { id: 'stun', dur: 6000 }); // bosses halve control: 3 s
        applyStatus(w, null, e, { id: 'vulnerable', dur: 6000 });
        if (hook(e.stats, 'reflectCharge')) dealDamage(w, null, e, e.maxHp * 0.08, 'physical', { dot: true });
        // the Unsheathed: driven into its sheath in the last phase, the fight ends
        if (hook(e.stats, 'anchorYield') && e.phase >= Math.max(0, e.cdef.phases.length - 1)) yieldEnemy(w, e);
        w.emit('ability:cast', { casterId: e.id, ability: 'hazard:anchor', x: Math.round(a.x), y: Math.round(a.y), tx: 0, ty: 0, ms: 300 });
      }
    }
    if (e.motion && hazardsIn(w, e.space, 'cover').some((h) => inside(h, e))) e.motion = null; // cover stops charges
    // the Hooded Man: while his standing stones stand, the ring is draped in calm (a slow on the party)
    if (hook(e.stats, 'calmAura') && w.tick % 30 === 0 && hazardsIn(w, e.space, 'pillar').length) {
      for (const p of w.players.values()) if (p.space === e.space && !p.dead) applyStatus(w, e, p, { id: 'slow', dur: 1200, power: 0.35 });
    }
  }
}

/** The boss of a room: the strongest living enemy in that space. */
function roomBoss(w: SimWorld, space: string): EnemyEnt | undefined {
  let best: EnemyEnt | undefined;
  for (const e of w.enemies.values()) if (e.space === space && !e.dead && e.kind === 'enemy' && e.tier !== 'enemy' && (!best || e.maxHp > best.maxHp)) best = e;
  return best;
}

/** act { action: 'hazard', args: { id } }: douse a vent, light a lantern, strike a pillar. Range-checked. */
export function useHazard(w: SimWorld, p: PlayerEnt, id: string): boolean {
  const h = w.hazards.get(id);
  if (!h || h.space !== p.space || p.dead || p.downed || !live(h)) return false;
  if ((p.x - h.x) ** 2 + (p.y - h.y) ** 2 > (h.r + USE_RANGE) ** 2) return false;
  switch (h.kind) {
    case 'vent': {
      const boss = roomBoss(w, h.space);
      if (boss && hook(boss.stats, 'ventHurt')) h.turnedUntil = w.t + DOUSE_MS; // rewire it against the boss
      else { h.dousedUntil = w.t + DOUSE_MS; h.activeUntil = 0; }
      break;
    }
    case 'light': h.activeUntil = w.t + LIGHT_MS; break;
    case 'pillar': h.charges--; break;
    default: return false;
  }
  w.emit('ability:cast', { casterId: p.id, ability: `hazard:${h.kind}`, x: Math.round(h.x), y: Math.round(h.y), tx: 0, ty: 0, ms: 200 });
  return true;
}

/**
 * Damage rules the hazards impose on a boss (called from dealDamage): returns the multiplier for this hit,
 * and reflects damage for `paysBack`. 0 means the hit does nothing (light-only boss in the dark).
 */
export function hazardDamageMult(w: SimWorld, tgt: Combatant, src: Combatant | null, amount: number): number {
  if (tgt.kind !== 'enemy') return 1;
  let mult = 1;
  if (hook(tgt.stats, 'lightOnly') && !hazardsIn(w, tgt.space, 'light').some((h) => w.t < h.activeUntil && inside(h, tgt))) return 0;
  const pillars = hazardsIn(w, tgt.space, 'pillar').length > 0;
  if (pillars && hook(tgt.stats, 'shielded')) mult *= 0.2;
  if (pillars && hook(tgt.stats, 'paysBack') && src && src !== tgt) dealDamage(w, tgt, src, amount * 0.25, 'physical', { dot: true, noProc: true });
  return mult;
}

/** Is the line from (x0,y0) to the target in the shade of a live cover piece? Uses up one charge if so. */
export function shadedBy(w: SimWorld, space: string, x0: number, y0: number, t: { x: number; y: number }): boolean {
  for (const h of hazardsIn(w, space, 'cover')) {
    const dx = t.x - x0, dy = t.y - y0, l2 = dx * dx + dy * dy || 1;
    const k = Math.max(0, Math.min(1, ((h.x - x0) * dx + (h.y - y0) * dy) / l2));
    const px = x0 + k * dx, py = y0 + k * dy;
    if ((px - h.x) ** 2 + (py - h.y) ** 2 <= h.r * h.r && k < 0.98) { if (Number.isFinite(h.charges)) h.charges--; return true; }
  }
  return false;
}

/** A boss changed phase: its burnt-away cover comes back (Lucan's song makes new shadows, flats drop in). */
export function refreshCover(w: SimWorld, space: string): void {
  for (const h of w.hazards.values()) if (h.space === space && h.kind === 'cover') h.charges = h.max;
}

/** Clear a room's hazards once its boss is gone. */
export function clearHazards(w: SimWorld, space: string): void {
  for (const [id, h] of w.hazards) if (h.space === space) w.hazards.delete(id);
}
