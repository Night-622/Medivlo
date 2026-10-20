/**
 * Build simulator (Claude 3 helper): the A/B probe behind the dead-content analysis. A stationary training ground,
 * built to keep the sim from diverging between A and B (no kiting, no chasing, nothing dies at random):
 *  - a realm-boss punching bag in reach (immobile, harmless, refilled at 10% HP so "above / below X% health"
 *    conditions cycle) and one harmless realm creature beside it that respawns 2 s after it dies (kill procs fire);
 *  - two realm creatures pinned in front of the hero, either side, that only basic-attack the hero (abilities stripped,
 *    replaced the tick they die), their damage calibrated per class so the base build loses its health in about a
 *    minute (one hit capped at 5% of the hero's health).
 * The bot stands still, targets the bag and presses casts / slash / attack like the fight bot, and dashes sideways about
 * every 3 s when it can (put back on its spot after); no potions.
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
  // one hit never exceeds 5% of the hero's health, so a couple of blows in one tick cannot skip the 12% top-up below
  // (and "below 25% health" effects such as Last Stand get their window)
  // where each pinned creature belongs: knockback and pulls must not carry an immobile hitter out of its reach (it
  // would never come back) or the bag out of the hero's (Claude 5)
  const spot = new Map<EnemyEnt, { x: number; y: number }>([[bag, { x: bx, y: 0 }]]);
  // Incoming damage is continuous in the multiplier (Claude 5): the target rate D = the two base hitters' damage per second
  // × dmgMult. A hit stays ≤ 5% of the hero's health; the fewest hitters that can deliver D (a basic attack's 280 ms
  // wind-up caps one hitter at ~2.4 hits/s) are placed (front pair first, then wider in the frontal arc so front blocks count for every one; up
  // to 6), and each one's attack interval is set so the total is exactly D, staggered so blows rarely share
  // a tick. Stepwise pairs and saturating attack speed made survival jump across the calibration window before.
  // all in the frontal arc (x > 0, the hero faces the bag): a hitter behind bypasses front blocks, which made the drain jump
  // ×13 for the Oathbound the moment a third hitter appeared
  const SLOTS: [number, number][] = [[0.45, -0.9], [0.45, 0.9], [0.8, -0.6], [0.8, 0.6], [0.2, -1.05], [0.2, 1.05]];
  const WINDUP = 280, MIN_MS = 140;
  const probeHit = spawnAt(a, `bx_${school}_0`, L, -600, 600);
  const baseHit = probeHit.dmg, baseMs = probeHit.cdef.ai.attackMs;
  probeHit.dead = true; a.sim.w.enemies.delete(probeHit.id);
  const D = (2 * baseHit * dmgMult * 1000) / (baseMs + WINDUP);
  const hit = Math.min(baseHit * dmgMult, p.maxHp * 0.05);
  const n = Math.max(2, Math.min(SLOTS.length, Math.ceil(D / (hit * (1000 / (MIN_MS + WINDUP))))));
  const perMs = Math.max(MIN_MS, (n * hit * 1000) / D - WINDUP);
  const hitter = (slot: number, replacement = false): EnemyEnt => {
    const h = spawnAt(a, `bx_${school}_0`, L, -300, (slot % 2 ? 1 : -1) * 300);
    const d = p.r + h.r + 4, [fx, fy] = SLOTS[slot];
    pin(h, d * fx, d * fy, false);
    spot.set(h, { x: d * fx, y: d * fy });
    h.dmg = hit;
    h.cdef = { ...h.cdef, ai: { ...h.cdef.ai, attackMs: perMs } };
    // staggered at the start; a replacement waits a full interval, so killing hitters faster doesn't bring blows sooner
    h.attackReadyAt = a.sim.w.t + (replacement ? perMs : (slot * (perMs + WINDUP)) / n);
    return h;
  };
  const hitters = Array.from({ length: n }, (_, i) => hitter(i));
  const fodderKind = `bx_${school}_1`;
  let fodder = spawnAt(a, fodderKind, L, bx, 60);
  pin(fodder, bx + 10, bag.r + 30, true);
  let fodderDied = -1;
  let seq = 0, held = 0, tick = 0;
  // healing measured from the hero's health itself (after − before + damage taken that tick): lifesteal and other
  // silent heals (combat.ts heal(..., silent)) emit no combat:hit, so counting heal events alone missed them (Claude 5)
  let healedHp = 0;
  const martial = hasSlash(save.classId);
  for (; tick < 30 * secs && !p.dead && !p.downed; tick++) {
    if (bag.hp < bag.maxHp * 0.1) bag.hp = bag.maxHp;
    // the hero is kept in the fight (topped up at 12%: not a heal event, so the drain still counts every hit) so every
    // build is measured over the same window — a build that dies early would otherwise skip its Ember-starved minute
    if (p.hp < p.maxHp * 0.12) p.hp = p.maxHp;
    hitters.forEach((h, i) => { if (h.dead) hitters[i] = hitter(i, true); });
    for (const e of [bag, ...hitters]) { const at = spot.get(e); if (at && !e.dead) { e.x = at.x; e.y = at.y; e.motion = null; } }
    if (fodder.dead) {
      if (fodderDied < 0) fodderDied = a.sim.w.t;
      else if (a.sim.w.t - fodderDied >= 2000) { fodder = spawnAt(a, fodderKind, L, bx, 60); pin(fodder, bx + 10, bag.r + 30, true); fodderDied = -1; }
    }
    let buttons = Btn.ATTACK;
    if (tick % 15 === 0) { const s = chooseSlot(a.sim, p); if (s !== undefined) buttons |= CAST[s]; }
    if (martial && tick % 2 === 0 && a.sim.w.t >= (p.cds.get('slash') ?? 0)) buttons |= Btn.SLASH;
    // dash every 3 s when a charge and the stamina are there (sideways, alternating), as players do: dash / dash-end /
    // stamina-spent perks get measured, and 'standing still for 1 s' perks keep most of their window; the hero is put
    // back on its spot once the move ends (Claude 5)
    const dashNow = tick % 90 === 45 && p.dashCharges > 0 && p.stamina >= 25 && !p.motion;
    if (dashNow) buttons |= Btn.DASH;
    const frame: InputFrame = { seq: ++seq, t: a.sim.w.t, move: dashNow ? { x: 0, y: (tick / 90) % 2 < 1 ? 1 : -1 } : { x: 0, y: 0 }, aim: { x: bag.x, y: bag.y }, buttons: buttons & ~held | (buttons & Btn.ATTACK), target: bag.id };
    held = buttons & ~Btn.ATTACK;
    const hp0 = p.hp, taken0 = a.m.taken;
    a.sim.step(DT, tick + 1, new Map([[PID, [frame]]]));
    if (held) { held = 0; a.sim.step(0.0001, tick + 1, new Map([[PID, [{ ...frame, seq: ++seq, buttons: Btn.ATTACK }]]])); }
    if (!p.dead && !p.downed) healedHp += Math.max(0, p.hp - hp0 + (a.m.taken - taken0));
    if (!p.motion && (p.x !== 0 || p.y !== 0)) { p.x = 0; p.y = 0; }
  }
  const s = Math.max(1, tick) / 30;
  const drain = (a.m.taken - healedHp) / s;
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
  // survival from the MEAN drain, not the mean of capped seconds-to-die: near the heal/damage balance one seed with ~0 net
  // drain hits the 1000 s cap and swamped the average (Claude 5)
  const drain = mean((r) => r.drain), maxHp = rs[0].maxHp;
  const out: Probe = { dps: mean((r) => r.dps), taken: mean((r) => r.taken), drain, surv: Math.min(SURV_CAP, maxHp / Math.max(drain, maxHp / SURV_CAP)), ehp: mean((r) => r.ehp), maxHp };
  cache.set(key, out);
  return out;
}

/** Hitter damage multiplier for a class's probe: the base build should lose its health in about a minute. */
export function calibrate(save: CharacterSave): number {
  // bisection on log(mult) over the mean drain of all probe seeds; incoming damage is
  // continuous in mult (see probeOnce), so the 45–90 s window is reachable for heal-heavy classes too (Claude 5)
  // over all the probe seeds, as the report measures: for heal-heavy kits the seeds' drains differ a lot
  const surv = (m: number) => probe(save, m).surv;
  let lo = 0.05, hi = 400, mult = 1;
  for (let i = 0; i < 14; i++) {
    const v = surv(mult);
    if (v > 45 && v < 90) return mult;
    if (v >= 90) lo = mult; else hi = mult;
    mult = Math.sqrt(lo * hi);
  }
  return mult;
}

