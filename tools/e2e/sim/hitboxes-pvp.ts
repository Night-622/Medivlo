/**
 * Dash i-frames and PvP (Claude 3 helper).
 * - Dash: HOLLOW_CROWN.md §2 gives 220 ms of i-frames. A real creature's telegraphed area resolves k ticks after the
 *   dash starts; inside the window the hit is 'immune' and costs nothing, after it the hero is hurt.
 * - PvP: a 'duels' realm lets two players who accepted a duel hit each other (and nobody else); 'peaceful' never.
 *   Same harness pattern as coop.ts world(rule, party), rebuilt here (coop.ts runs its own checks at import).
 */
import type { GameEvents } from '@/core/events';
import type { RealmRule } from '@/net/types';
import { allCreatures } from '@/systems/rules/creatures';
import type { CreatureAbility } from '@/data/enemies/hc/abilities';
import { BTN, check, DT, Findings, World } from './hitboxes-harness';

const DASH_IFRAMES_MS = 220; // design: docs/systems/HOLLOW_CROWN.md §2
const DASH_PX = 72;

/** The widest self-centred damage circle among creature attacks (so the hero stays inside while dashing). */
function bigSlam(): { id: string; ab: CreatureAbility; r: number } | null {
  let best: { id: string; ab: CreatureAbility; r: number } | null = null;
  for (const d of allCreatures()) for (const ab of [...d.abilities, ...d.phases.flat()]) {
    if (ab.use !== 'attack' || ab.windup < 700) continue;
    const a = ab.actions[0];
    if (a?.a !== 'damage' || a.area.shape !== 'circle' || a.area.at !== 'self' || ab.actions.length !== 1) continue;
    if (!best || (a.area.r ?? 0) > best.r) best = { id: d.id, ab, r: a.area.r ?? 0 };
  }
  return best;
}

export function dashSection(f: Findings): void {
  console.log('# dash i-frames');
  const slam = bigSlam();
  if (!check(!!slam, 'a creature with a wide self-centred slam exists for the dash test') || !slam) return;
  const def = allCreatures().find((d) => d.id === slam.id)!;
  const rows: string[] = [];
  let lastImmune = -1, firstHit = Infinity, wrong = 0, dashMoved = 0;
  for (let k = 0; k <= 12; k++) {
    const w = new World();
    const p = w.hero('h', 'arcanist', def.radius + 20, 0, true);
    const e = w.creature(def, 0, 0, false);
    e.cdef = { ...e.cdef, abilities: [slam.ab], phases: [], onDeath: [], lowHp: [], ai: { ...e.cdef.ai, speed: 0, aggro: 2000, attackRange: -1e9, ranged: false } };
    e.abilityReadyAt = new Map([[slam.ab, 0]]); e.attackReadyAt = 0;
    let guard = 0;
    while (!e.windup && guard++ < 120) w.step();
    // the tick on which the telegraph resolves, and the tick to press dash on (k ticks earlier)
    let tr = w.t;
    while (tr < e.windup!.until) tr += DT; // same float sums and comparison as the sim's wind-up check
    const td = tr - k * DT;
    while (w.t + DT < td - 1e-6) w.step();
    const mark = w.events.length, hp0 = p.hp, x0 = p.x, y0 = p.y;
    w.step({ h: { buttons: BTN.DASH, move: { x: 0, y: 1 }, aim: { x: p.x, y: p.y + 100 } } });
    const dashAt = w.t;
    // the moment the telegraph actually resolved: the step that produced the creature's hit on the hero
    const mine = (from: number) => w.events.slice(from).filter((x) => x.name === 'combat:hit' && (x.p as GameEvents['combat:hit']).targetId === p.id && (x.p as GameEvents['combat:hit']).sourceId === e.id);
    let hitAt = mine(mark).length ? w.t : NaN;
    for (let i = 0; i < k + 20; i++) { const n = w.events.length; w.step({ h: { move: { x: 0, y: 0 } } }); if (Number.isNaN(hitAt) && mine(n).length) hitAt = w.t; }
    if (k === 12) dashMoved = Math.hypot(p.x - x0, p.y - y0);
    const hits = mine(mark).map((x) => (x.p as GameEvents['combat:hit']).kind);
    const immune = hits.includes('immune') && !hits.includes('dmg') && p.hp >= hp0;
    const hurt = hits.includes('dmg') && p.hp < hp0;
    const offset = Math.round((Number.isNaN(hitAt) ? tr : hitAt) - dashAt);
    const want = offset < DASH_IFRAMES_MS ? 'immune' : 'hurt';
    const got = immune ? 'immune' : hurt ? 'hurt' : `neither (${hits.join(',') || 'no hit'})`;
    if (immune) lastImmune = Math.max(lastImmune, offset); else if (hurt) firstHit = Math.min(firstHit, offset);
    if (got !== want) { wrong++; rows.push(`hit ${offset} ms into the dash: expected ${want}, got ${got}`); }
  }
  check(!wrong, `dash i-frames: ${slam.id} "${slam.ab.text}" (r ${slam.r}) resolving 0–400 ms into a dash: immune < ${DASH_IFRAMES_MS} ms, hurt after (last immune ${lastImmune} ms, first hurt ${firstHit} ms)`, rows);
  f.add('travel', Math.abs(dashMoved - DASH_PX) <= DASH_PX / (DASH_IFRAMES_MS / DT) + 0.5, `hero dash: ${DASH_PX} px moved ${dashMoved.toFixed(1)} px (one tick = ${(DASH_PX / (DASH_IFRAMES_MS / DT)).toFixed(1)} px)`);
}

// ───────────── PvP ─────────────
function duelWorld(rule: RealmRule, attacker: string) {
  const w = new World(rule, 3);
  const a = w.hero('a', attacker, 0, 0);
  const b = w.hero('b', 'cantor', 40, 0);
  const c = w.hero('c', 'knight', 40, 26); // a bystander inside the same swing / cone
  const duel = () => { w.sim.receive({ type: 'duel', target: 'b' }, 'a'); w.sim.receive({ type: 'duel', target: 'a', accept: true }, 'b'); };
  return { w, a, b, c, duel };
}

type Attack = 'basic' | 'spell1';
function attack(x: ReturnType<typeof duelWorld>, how: Attack): { b: boolean; c: boolean } {
  const { w, a, b, c } = x;
  const mark = w.events.length, bp = { x: b.x, y: b.y }, cp = { x: c.x, y: c.y };
  if (how === 'basic') for (let t = 0; t < 900; t += DT) w.step({ a: { buttons: BTN.ATTACK, aim: { x: b.x, y: b.y } } });
  else { w.press('a', { buttons: BTN.CAST1, aim: { x: b.x, y: b.y }, target: b.id }); w.run(900); }
  return { b: w.reached(b.id, a.id, mark, bp), c: w.reached(c.id, a.id, mark, cp) };
}

export function pvpSection(): void {
  console.log('# PvP');
  for (const attacker of ['warden', 'arcanist']) for (const how of ['basic', 'spell1'] as Attack[]) {
    const what = `${attacker} ${how === 'basic' ? 'basic attack' : 'slot-1 spell'}`;
    const pre = duelWorld('duels', attacker);
    const r0 = attack(pre, how);
    check(!r0.b && !r0.c, `duels realm, no duel yet: ${what} does not touch other players (b ${r0.b}, c ${r0.c})`);
    const d = duelWorld('duels', attacker);
    d.duel();
    check(d.w.sim.w.hostile(d.a, d.b) && !d.w.sim.w.hostile(d.a, d.c), 'duels realm: accepted duel makes exactly the two duellists hostile');
    const r1 = attack(d, how);
    check(r1.b && !r1.c, `duels realm, duel accepted: ${what} hits the opponent (${r1.b}) and not the bystander (${r1.c})`);
    const pc = duelWorld('peaceful', attacker);
    pc.duel();
    const r2 = attack(pc, how);
    check(!r2.b && !r2.c, `peaceful realm (duel "accepted"): ${what} touches nobody (b ${r2.b}, c ${r2.c})`);
  }
}
