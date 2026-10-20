/**
 * Creature side (Claude 3 helper): every distinct telegraphed ability shape, creature melee and creature shots.
 * The hero stands where the creature aims, the ability starts (telegraph), the hero is moved to a probe spot, and
 * the hit is judged when the telegraph resolves. Real creatures from rules/creatures.ts; only their rotation is
 * narrowed to the ability under test and they are rooted (speed 0) so the geometry stays put.
 */
import type { CreatureAbility } from '@/data/enemies/hc/abilities';
import type { GameEvents } from '@/core/events';
import { allCreatures, type CreatureDef } from '@/systems/rules/creatures';
import type { Action, Area } from '@/systems/rules/types';
import type { EnemyEnt, PlayerEnt } from '@/systems/sim/state';
import { check, DT, Findings, tally, World } from './hitboxes-harness';
import { buildShapes, hostileActions, settleMs, type ModelCtx, type Travel } from './hitboxes-model';
import { ambiguous, edgePoints, expected, fmt, v, type Cat, type Shape, type V } from './hitboxes-shapes';

type Move = Extract<Action, { a: 'move' }>;
const HERO = 'arcanist';
const HERO_R = 10;

interface Setup { w: World; p: PlayerEnt; e: EnemyEnt }

/** A rooted creature whose only option is `ab` (or its basic attack when ab is null), and the hero at L. */
function setup(def: CreatureDef, ab: CreatureAbility | null, L: V): Setup {
  const w = new World();
  const p = w.hero('h', HERO, L.x, L.y, true);
  const e = w.creature(def, 0, 0, false);
  e.cdef = { ...e.cdef, abilities: ab ? [ab] : [], phases: [], onDeath: [], lowHp: [],
    ai: { ...e.cdef.ai, speed: 0, aggro: 2000, ...(ab ? { attackRange: -1e9, ranged: false } : {}) } };
  e.abilityReadyAt = new Map(ab ? [[ab, 0]] : []);
  e.attackReadyAt = 0;
  return { w, p, e };
}

/** Step until the creature commits (wind-up set, or a shot in the air). */
function waitStart(s: Setup, shot: boolean): boolean {
  for (let i = 0; i < 120; i++) {
    s.w.step();
    if (shot ? s.w.sim.w.projectiles.size > 0 : !!s.e.windup) return true;
  }
  return false;
}

interface Run { started: boolean; got: boolean; tele?: GameEvents['enemy:telegraph']; moved: number }
/** potions and food carried (a thief takes one) */
const consumables = (p: { save: { inventory: { base: string; qty: number }[] } }): number => p.save.inventory.filter((x) => /^i_(hp|em)_|^i_(bread|stew|cheese|apple|fish|roast|pie)$/.test(x.base)).reduce((n, x) => n + x.qty, 0);

function runOnce(def: CreatureDef, ab: CreatureAbility | null, L: V, probe: V | null, settle: number, shot = false): Run {
  const s = setup(def, ab, L);
  if (!waitStart(s, shot)) return { started: false, got: false, moved: 0 };
  const tele = [...s.w.events].reverse().find((x) => x.name === 'enemy:telegraph')?.p as GameEvents['enemy:telegraph'] | undefined;
  if (probe) { s.p.x = probe.x; s.p.y = probe.y; }
  // something for "steals your buffs" to take
  s.p.buffs.push({ id: 'hb-probe', until: Infinity, sourceId: s.p.id, mods: [], procs: [], flags: [] });
  const at = { x: s.p.x, y: s.p.y };
  const mark = s.w.events.length, packs0 = consumables(s.p);
  let moved = 0;
  for (let t = 0; t < settle; t += DT) {
    s.w.step();
    if (!s.e.motion && moved === 0 && Math.hypot(s.e.x, s.e.y) > 0.5) moved = Math.hypot(s.e.x, s.e.y);
  }
  const got = s.w.reached(s.p.id, s.e.id, mark, at) || s.w.goldMoved('h', mark) || !s.p.buffs.some((b) => b.id === 'hb-probe') || consumables(s.p) < packs0;
  return { started: true, got, tele, moved };
}

/** The first area that does the damage / status work, looking through wrappers. */
function workArea(acts: Action[]): Area | null {
  for (const a of acts) {
    if ((a.a === 'damage' || a.a === 'status' || a.a === 'steal' || a.a === 'pull' || a.a === 'knock') && a.area) return a.area;
    const inner = a.a === 'repeat' || a.a === 'delay' ? a.then : a.a === 'zone' ? [...(a.each ?? []), ...(a.trigger ?? [])] : a.a === 'move' ? [...(a.path ?? []), ...(a.land ?? [])] : [];
    const x = workArea(inner);
    if (x) return x;
  }
  return null;
}

function telegraphFinding(f: Findings, name: string, ab: CreatureAbility, tele: GameEvents['enemy:telegraph'] | undefined): void {
  const area = workArea(ab.actions);
  if (!area || ab.actions.some((a) => a.a === 'projectile' || a.a === 'chain')) return; // shots and chains are seen in flight
  if (!tele) { f.add('telegraph', false, `${name}: no enemy:telegraph before a ${area.shape} area`); return; }
  const want = area.shape === 'line' ? area.len ?? 100 : area.r ?? 0;
  const problems: string[] = [];
  // a single-target strike resolves at its locked aim (actions.ts lockedTarget): the circle it shows must cover at
  // least the hero's body plus the 12 px slack, so standing in it means being hit and leaving it means a dodge
  if (area.shape === 'single') { if (tele.shape !== 'circle' || tele.r < HERO_R + 12) problems.push(`single-target hit, telegraph is a ${tele.shape} of r ${tele.r} (want a circle of r ≥ ${HERO_R + 12})`); }
  else if (tele.shape !== area.shape) problems.push(`telegraph ${tele.shape} r ${tele.r} but damage is a ${area.shape} r ${want}`);
  else {
    if (Math.abs(tele.r - want) > 1) problems.push(`telegraph r ${tele.r} but damage ${area.shape} ${area.shape === 'line' ? 'len' : 'r'} ${want}`);
    if (area.shape === 'line' && Math.abs((tele.w ?? 0) - (area.width ?? 24)) > 1) problems.push(`telegraph width ${tele.w} but damage width ${area.width}`);
    // cones carry their half-angle (arc, radians) and fx.ts draws ±arc; without it the client draws ±0.6 rad (69°)
    const drawn = ((tele.arc ?? 0.6) * 360) / Math.PI;
    if (area.shape === 'cone' && Math.abs((area.angle ?? 90) - drawn) > 2) problems.push(`cone ${area.angle}° drawn as ${Math.round(drawn)}°`);
  }
  f.add('telegraph', !problems.length, `${name}: ${problems.join('; ')}`);
}

/** Distinct ability geometries (coefficients and statuses ignored), each with the first plain creature that has it. */
function abilityCases(): { def: CreatureDef; ab: CreatureAbility }[] {
  const seen = new Map<string, { def: CreatureDef; ab: CreatureAbility }>();
  const geo = (ab: CreatureAbility) => JSON.stringify(ab.actions, (k, x) => (['coef', 'status', 'kind', 'power', 'flags', 'mods'].includes(k) ? undefined : x)) + ab.range;
  const defs = [...allCreatures()].sort((a, b) => a.hooks.length - b.hooks.length || a.id.localeCompare(b.id));
  for (const def of defs) for (const ab of [...def.abilities, ...def.phases.flat()]) {
    if (ab.use !== 'attack' || !hostileActions(ab.actions)) continue;
    const k = `${geo(ab)}|r${def.radius}`;
    const g = geo(ab);
    if (![...seen.keys()].some((x) => x.startsWith(g))) seen.set(k, { def, ab });
  }
  return [...seen.values()];
}

/** A steal that takes neither gold, buffs nor an item does nothing at all. */
const noop = (ab: CreatureAbility): boolean => ab.actions.every((a) => a.a === 'steal' && !a.gold && !a.buffs && !a.item);

function abilityCase(def: CreatureDef, ab: CreatureAbility, f: Findings): void {
  const name = `${def.id} "${ab.text}"`;
  f.add('noop', !noop(ab), `${name}: its only action is { a: 'steal', gold: 0, buffs: false } (does nothing; "consumable" is not modelled)`);
  if (noop(ab)) return;
  const eR = def.radius, L = v(eR + HERO_R + Math.max(-2, Math.min(ab.range - 2, 40)), 0);
  const settle = ab.windup + settleMs(ab.actions) + 200;
  // stand still once: the measured travel of its charges / leaps
  const stand = runOnce(def, ab, L, null, settle);
  if (!check(stand.started, `creature ${name}: uses the ability from ${fmt(L)}`)) return;
  telegraphFinding(f, name, ab, stand.tele);
  const travel = (a: Move): Travel => ({ dist: a.dist, overshoot: a.mode === 'charge' || a.mode === 'dash' ? Math.max(0, stand.moved - a.dist) : 0 });
  const ctx = (primary: V): ModelCtx => ({ casterR: eR, self: v(0, 0), aim: L, dir: v(1, 0), primary, centreT: L, gate: ab.range + eR, gateCat: 'dodge', tCat: 'dodge', R: HERO_R, travel });
  const fails: string[] = [];
  let n = 0;
  const probes: { label: string; at: V; cat: Cat; own?: string }[] = [{ label: 'stays where the telegraph aimed', at: L, cat: 'core' }];
  // (a copy of L: the primary is the hero, not the telegraph's aim point)
  for (const m of buildShapes(ab.actions, ctx({ ...L }))) {
    if (m.s.noProbe) continue;
    for (const e of edgePoints(m.s, HERO_R)) if (m.s.applies !== 'primary' || /front/.test(e.label)) probes.push({ label: e.label, at: e.at, cat: e.cat, own: m.s.label });
  }
  const seen = new Set<string>();
  for (const pr of probes) {
    if (seen.has(fmt(pr.at))) continue;
    seen.add(fmt(pr.at));
    const shapes: Shape[] = buildShapes(ab.actions, ctx(pr.at)).map((m) => m.s);
    const bodies = [{ at: pr.at, role: 'primary' as const }];
    if (pr.own && ambiguous(shapes, bodies, HERO_R, shapes.find((s) => s.label === pr.own))) continue;
    const want = expected(shapes, bodies, HERO_R)[0];
    const r = runOnce(def, ab, L, pr.at, settle);
    n++; tally.probes++;
    const ok = r.started && r.got === want;
    const line = `${pr.label}: hero at ${fmt(pr.at)} expected ${want ? 'hit' : 'miss'}, got ${r.started ? (r.got ? 'hit' : 'miss') : 'never cast'}`;
    if (pr.cat === 'core') { if (!ok) fails.push(line); } else f.add(pr.cat, ok, `${name}: ${line}`);
  }
  check(!fails.length, `creature ${name}: ${n} probes`, fails);
  // a creature that uses an ability from its full range should be able to land it on a hero who stands still
  const far = v(eR + HERO_R + ab.range - 1, 0);
  if (ab.range > 0) {
    const r = runOnce(def, ab, far, null, settle);
    // either it lands, or the creature waits until it can (it must never start a cast that cannot reach)
    f.add('userange', !r.started || r.got, `${name}: used at ${ab.range} px (edge to edge) on a hero standing still at ${fmt(far)}: ${r.started ? (r.got ? 'hit' : 'miss') : 'not started (out of reach)'}`);
  }
}

/** Basic attacks: one melee and one ranged creature per body type. */
function basics(f: Findings): void {
  const picked = new Map<string, CreatureDef>();
  for (const d of [...allCreatures()].sort((a, b) => a.hooks.length - b.hooks.length || a.id.localeCompare(b.id))) {
    const k = `${d.arch}:${d.ai.ranged ? 'ranged' : 'melee'}`;
    if (!picked.has(k) && !d.ai.immobile) picked.set(k, d);
  }
  for (const [k, def] of picked) {
    const ai = def.ai, eR = def.radius, fails: string[] = [];
    let n = 0;
    const L = v(eR + HERO_R + ai.attackRange * (ai.ranged ? 0.8 : 1) - 2, 0);
    let shapes: Shape[];
    if (ai.ranged) {
      // creature basic shot (sim/enemy.ts basicAttack): 280 px/s, flies attackRange + 60, 6 px radius
      shapes = buildShapes([{ a: 'projectile', coef: 1, speed: 280, range: ai.attackRange + 60 }], { casterR: eR, self: v(0, 0), aim: L, dir: v(1, 0), primary: null, centreT: null, gate: null, gateCat: 'core', tCat: 'core', R: HERO_R, travel: (a) => ({ dist: a.dist, overshoot: 0 }) }).map((m) => m.s);
    } else {
      // melee: resolves after its wind-up if the hero is still within attackRange (+12 px grace) edge to edge
      shapes = [{ label: 'melee reach', applies: 'all', tol: 12, outCat: 'core', k: 'circle', c: v(0, 0), r: ai.attackRange + eR }];
    }
    const settle = ai.ranged ? ((ai.attackRange + 60) / 280) * 1000 + 300 : 600;
    for (const s of shapes) for (const e of edgePoints(s, HERO_R)) {
      const bodies = [{ at: e.at, role: 'primary' as const }];
      if (ambiguous(shapes, bodies, HERO_R, s)) continue;
      const want = expected(shapes, bodies, HERO_R)[0];
      const r = runOnce(def, null, L, e.at, settle, ai.ranged);
      n++; tally.probes++;
      if (!r.started || r.got !== want) fails.push(`${e.label}: hero at ${fmt(e.at)} expected ${want ? 'hit' : 'miss'}, got ${r.started ? (r.got ? 'hit' : 'miss') : 'never attacked'}`);
    }
    check(!fails.length, `creature basic ${k} ${def.id} (attackRange ${ai.attackRange}, r ${eR}): ${n} probes`, fails);
  }
  void f;
}

export function creatureSection(f: Findings): void {
  console.log('# creature side: telegraphs resolve at the end of the wind-up; the hero moves after the telegraph');
  basics(f);
  for (const { def, ab } of abilityCases()) abilityCase(def, ab, f);
}
