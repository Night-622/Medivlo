/**
 * Build simulator (Claude 3 helper): the A/B probe behind the dead-content analysis. A stationary training ground,
 * built to keep the sim from diverging between A and B (no kiting, no chasing, nothing dies at random):
 *  - a realm-boss punching bag in reach (immobile, harmless, refilled at 10% HP so "above / below X% health"
 *    conditions cycle) and one harmless realm creature beside it that respawns 2 s after it dies (kill procs fire);
 *  - two realm creatures pinned in front of the hero, either side, that only basic-attack the hero (abilities stripped,
 *    replaced the tick they die), their damage calibrated per class so the base build loses its health in about a
 *    minute (one hit capped at 5% of the hero's health).
 * The bot stands still, targets the bag and presses casts / slash / attack like the fight bot; no potions, no dash.
 * The hero is topped up to full at 12% HP (not a heal), so HP cycles like a real fight and the window is always full.
 * Measures DPS (everything hit), net HP drain (taken − healed) → seconds to die from full, and EHP from the build's
 * stats against a fixed damage mix.
 */
import { Btn, type InputFrame } from '@/net/types';
import { CLASS_SCHOOL, MAGIC_SCHOOLS } from '@/core/constants';
import { hasSlash } from '@/systems/rules/slash';
import type { CharacterSave } from '@/systems/rules/types';
import type { EnemyEnt, PlayerEnt } from '@/systems/sim/state';
import { arena, CAST, chooseSlot, DT, PID, takenMult, type Arena } from './builds-fight';

export interface Probe {
  dps: number;
  /** damage taken per second (gross) and net of healing */
  taken: number; drain: number;
  /** seconds to die from full at the net drain (capped) */
  surv: number;
  ehp: number; maxHp: number;
}

const SURV_CAP = 1000;
const PROBE_SECS = 90;
export const PROBE_SEEDS = [11, 23, 37, 41, 59] as const;

/** EHP vs a fixed mix: 60% physical, 40% the class's own element (magic schools; martial: all physical). */
export function refEhp(p: PlayerEnt, cls: string, L: number): number {
  const school = CLASS_SCHOOL[cls];
  const elem = (MAGIC_SCHOOLS as readonly string[]).includes(school) ? school : 'physical';
  return p.maxHp / (0.6 * takenMult(p, 'physical', L) + 0.4 * takenMult(p, elem, L));
}

function pin(e: EnemyEnt, x: number, y: number, harmless: boolean): void {
  e.x = x; e.y = y; e.home = { x, y };
  e.cdef = { ...e.cdef, abilities: [], phases: [], onDeath: [], lowHp: [],
    ai: { ...e.cdef.ai, speed: 0, immobile: true, flee: false, leash: 9999, aggro: harmless ? 0 : 900, attackRange: harmless ? 0 : Math.max(e.cdef.ai.attackRange, 40) } };
  if (harmless) e.dmg = 0;
}

function spawnAt(a: Arena, creature: string, L: number, x: number, y: number): EnemyEnt {
  return a.sim.w.enemies.get(a.sim.spawn({ creature, level: L, space: 'test', x, y }))!;
}

/** One probe run: PROBE_SECS of combat (the hero cannot fall: top-up at 12%, hits capped at 5%). */
export function probeOnce(save: CharacterSave, seed: number, dmgMult: number, secs = PROBE_SECS): Probe {
  const cls = save.classId, L = save.level, school = CLASS_SCHOOL[cls];
  const a = arena({ ...save, inventory: save.inventory.filter((i) => !/^i_(hp|em)_/.test(i.base)) }, seed);
  const p = a.p;
  const ranged = ['bow', 'staff', 'wand'].includes(p.weapon.type);
  const bag = spawnAt(a, `bx_${school}_5`, L, 300, 0);
  // ranged heroes stand 200 px off, or inside the reach of their shortest enemy-aimed spell (Monk's staff + palms)
  const reach = [...p.spells.values()].filter((sp) => sp.aim === 'enemy' && sp.range > 0).map((sp) => sp.range + bag.r - 10);
  const bx = ranged ? Math.max(p.r + bag.r + 22, Math.min(200, ...reach)) : p.r + bag.r + 22;
  pin(bag, bx, 0, true);
  // a hitter that dies is replaced on the next tick, so incoming damage never stops (and kill procs fire on it too);
  // one hit never exceeds 5% of the hero's health, so two blows in one tick cannot skip the 12% top-up below (and
  // "below 25% health" effects such as Last Stand get their window)
  const hitter = (sy: number): EnemyEnt => {
    const h = spawnAt(a, `bx_${school}_0`, L, -300, sy * 300);
    const d = p.r + h.r + 4;
    pin(h, d * 0.45, sy * d * 0.9, false); // in front of the hero (front blocks count), beside the line to the bag
    h.dmg = Math.min(h.dmg * dmgMult, p.maxHp * 0.05);
    return h;
  };
  const hitters = [hitter(-1), hitter(1)];
  const fodderKind = `bx_${school}_1`;
  let fodder = spawnAt(a, fodderKind, L, bx, 60);
  pin(fodder, bx + 10, bag.r + 30, true);
  let fodderDied = -1;
  let seq = 0, held = 0, tick = 0;
  const martial = hasSlash(save.classId);
  for (; tick < 30 * secs && !p.dead && !p.downed; tick++) {
    if (bag.hp < bag.maxHp * 0.1) bag.hp = bag.maxHp;
    // the hero is kept in the fight (topped up at 12%: not a heal event, so the drain still counts every hit) so every
    // build is measured over the same window — a build that dies early would otherwise skip its Ember-starved minute
    if (p.hp < p.maxHp * 0.12) p.hp = p.maxHp;
    hitters.forEach((h, i) => { if (h.dead) hitters[i] = hitter(i ? 1 : -1); });
    if (fodder.dead) {
      if (fodderDied < 0) fodderDied = a.sim.w.t;
      else if (a.sim.w.t - fodderDied >= 2000) { fodder = spawnAt(a, fodderKind, L, bx, 60); pin(fodder, bx + 10, bag.r + 30, true); fodderDied = -1; }
    }
    let buttons = Btn.ATTACK;
    if (tick % 15 === 0) { const s = chooseSlot(a.sim, p); if (s !== undefined) buttons |= CAST[s]; }
    if (martial && tick % 2 === 0 && a.sim.w.t >= (p.cds.get('slash') ?? 0)) buttons |= Btn.SLASH;
    const frame: InputFrame = { seq: ++seq, t: a.sim.w.t, move: { x: 0, y: 0 }, aim: { x: bag.x, y: bag.y }, buttons: buttons & ~held | (buttons & Btn.ATTACK), target: bag.id };
    held = buttons & ~Btn.ATTACK;
    a.sim.step(DT, tick + 1, new Map([[PID, [frame]]]));
    if (held) { held = 0; a.sim.step(0.0001, tick + 1, new Map([[PID, [{ ...frame, seq: ++seq, buttons: Btn.ATTACK }]]])); }
  }
  const s = Math.max(1, tick) / 30;
  const drain = (a.m.taken - a.m.healed) / s;
  return { dps: a.m.dealt / s, taken: a.m.taken / s, drain, surv: Math.min(SURV_CAP, p.maxHp / Math.max(drain, p.maxHp / SURV_CAP)), ehp: refEhp(p, cls, L), maxHp: p.maxHp };
}

/** Mean over the probe seeds (cached by build fingerprint: same build → same numbers). */
const cache = new Map<string, Probe>();
export function probe(save: CharacterSave, dmgMult: number, seeds: readonly number[] = PROBE_SEEDS): Probe {
  const key = JSON.stringify([save.classId, save.level, save.tree, save.hotbar, save.equipment, dmgMult, seeds]);
  const hit = cache.get(key);
  if (hit) return hit;
  const rs = seeds.map((sd) => probeOnce(save, sd, dmgMult));
  const mean = (f: (x: Probe) => number): number => rs.reduce((acc, r) => acc + f(r), 0) / rs.length;
  const out: Probe = { dps: mean((r) => r.dps), taken: mean((r) => r.taken), drain: mean((r) => r.drain), surv: mean((r) => r.surv), ehp: mean((r) => r.ehp), maxHp: rs[0].maxHp };
  cache.set(key, out);
  return out;
}

/** Hitter damage multiplier for a class's probe: the base build should lose its health in about a minute. */
export function calibrate(save: CharacterSave): number {
  let mult = 1;
  for (let i = 0; i < 5; i++) {
    const r = probeOnce(save, PROBE_SEEDS[0], mult);
    if (r.surv > 45 && r.surv < 90) break;
    mult = Math.max(0.05, Math.min(200, mult * (r.surv >= SURV_CAP ? 4 : r.surv / 60)));
  }
  return mult;
}
