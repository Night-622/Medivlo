/**
 * Hero side (Claude 3 helper): for every class, the basic attack and every kit + school spell are cast through
 * real input frames at inert creature bodies placed just inside / just outside each stated shape.
 */
import { CLASS_SCHOOL } from '@/core/constants';
import { HC_KIT_SPELLS } from '@/data/spells/hc/kit-spells';
import { HC_SCHOOL_SPELL_DEFS, HC_SCROLL_SPELLS } from '@/data/spells/hc/school-spells';
import type { CreatureDef } from '@/systems/rules/creatures';
import type { Action, HcSpell } from '@/systems/rules/types';
import { BASIC } from '@/systems/sim/player';
import { BTN, check, Findings, tally, testBodies, World } from './hitboxes-harness';
import { buildShapes, hostileActions, settleMs, type MShape, type ModelCtx, type Travel } from './hitboxes-model';
import { add, ambiguous, edgePoints, expected, fmt, rot, unit, v, type Cat, type ProbeBody, type V } from './hitboxes-shapes';

type Move = Extract<Action, { a: 'move' }>;
interface Case {
  cls: string; label: string; enemy: boolean; actions: Action[]; settle: number; range: number;
  /** a basic attack (hold ATTACK) instead of a spell on slot 1 */
  basic: boolean; spell?: HcSpell; steal: boolean;
}
interface Custom { label: string; cat: Cat; bodies: ProbeBody[]; want: boolean[] }

import { HERO_RADIUS } from '@/systems/sim/player';
const CASTER_R = HERO_RADIUS;
const PLAIN = new Set(['spell:nothing']);

/** Run one probe world; returns which bodies the hero's effect reached. */
function runProbe(c: Case, def: CreatureDef, bodies: V[], aim: V): boolean[] {
  const w = new World();
  const p = w.hero('h', c.cls);
  const es = bodies.map((b) => w.creature(def, b.x, b.y));
  const pos0 = es.map((e) => ({ x: e.x, y: e.y }));
  if (c.basic) {
    for (let t = 0; t < c.settle; t += 1000 / 30) w.step({ h: { buttons: BTN.ATTACK, aim } });
  } else {
    const s = c.spell!;
    p.attackReadyAt = 1e12; // no auto-attacks: only the spell may touch the bodies
    p.spells.set(s.id, s); p.save.hotbar[0] = s.id; p.ember = p.emberMax; p.cds.clear();
    w.step({ h: { buttons: BTN.CAST1, aim, target: c.enemy ? es[0].id : null } });
    p.target = null; // no auto-approach after the cast
    w.run(c.settle);
  }
  return es.map((e, i) => w.reached(e.id, p.id, 0, pos0[i]) || (c.steal && es.length === 1 && w.goldMoved('h')));
}

/** Measured travel of the case's own movement actions (empty world), and the travel findings. */
function measureTravel(c: Case, f: Findings): Map<Move, Travel> {
  const out = new Map<Move, Travel>();
  const moves = c.actions.filter((a): a is Move => a.a === 'move' && a.mode !== 'blink' && a.mode !== 'behind' && !(a.mode === 'leap' && c.enemy));
  for (const m of moves) {
    const w = new World(), p = w.hero('h', c.cls), s = c.spell!;
    p.spells.set(s.id, s); p.save.hotbar[0] = s.id; p.ember = p.emberMax;
    w.step({ h: { buttons: BTN.CAST1, aim: v(Math.max(60, s.range), 0) } });
    const first = Math.hypot(p.x, p.y);
    let guard = 0;
    while (p.motion && guard++ < 200) w.step();
    const d = Math.hypot(p.x, p.y), over = d - m.dist;
    out.set(m, { dist: m.dist, overshoot: Math.max(0, over) });
    f.add('travel', Math.abs(over) <= first + 0.5, `${c.cls} ${c.label}: ${m.mode} ${m.dist} px moved ${d.toFixed(1)} px (one tick = ${first.toFixed(1)} px)`);
  }
  return out;
}

function ctxFor(c: Case, R: number, primary: V | null, travel: Map<Move, Travel>, A0: V): ModelCtx {
  const tr = (a: Move): Travel => travel.get(a) ?? { dist: a.dist, overshoot: 0 };
  if (c.enemy) {
    const P = primary ?? v(60, 0);
    return { casterR: CASTER_R, self: v(0, 0), aim: P, dir: unit(P), primary: P, centreT: P, gate: c.range, gateCat: 'range', tCat: 'core', R, travel: tr };
  }
  return { casterR: CASTER_R, self: v(0, 0), aim: A0, dir: v(1, 0), primary, centreT: null, gate: null, gateCat: 'core', tCat: 'core', R, travel: tr };
}

/** Probes for a case at one body size: model edges, pierce pairs, chain and bounce rules. */
function probesFor(c: Case, R: number, travel: Map<Move, Travel>, A0: V, P0: V): { label: string; cat: Cat; bodies: ProbeBody[]; own?: string }[] {
  const shapes = buildShapes(c.actions, ctxFor(c, R, P0, travel, A0));
  const out: { label: string; cat: Cat; bodies: ProbeBody[]; own?: string }[] = [];
  for (const m of shapes) {
    if (m.s.noProbe) continue;
    for (const e of edgePoints(m.s, R)) {
      const end = m.s.k === 'capsule' && /end/.test(e.label) && /projectile#0$/.test(m.s.label);
      let bodies: ProbeBody[];
      if (m.s.applies === 'primary') { if (!/front/.test(e.label)) continue; bodies = [{ at: e.at, role: 'primary' }]; }
      else if (m.onPrimary || (c.enemy && !(end && m.s.k === 'capsule' && countOf(c, m) === 1))) bodies = [{ at: P0, role: 'primary' }, { at: e.at, role: 'other' }];
      else bodies = [{ at: e.at, role: 'primary' }];
      out.push({ label: `${e.label}`, cat: e.cat, bodies, own: m.s.label });
    }
  }
  // two bodies on the centre line: a piercing shot strikes both, any other only the first
  c.actions.forEach((a) => {
    if (a.a !== 'projectile') return;
    const n = a.count ?? 1, mid = Math.floor(n / 2), u = rot(v(1, 0), n > 1 ? -(a.spread ?? 0) / 2 + ((a.spread ?? 0) * mid) / (n - 1) : 0);
    const near = add(v(0, 0), u, CASTER_R + a.range * 0.35), far = add(v(0, 0), u, CASTER_R + a.range * 0.7);
    out.push({ label: `centre line pair (pierce=${!!a.pierce}, bounce=${a.bounce ?? 0})`, cat: 'core', bodies: [{ at: near, role: 'primary' }, { at: far, role: 'other' }] });
  });
  return out;
}
const countOf = (c: Case, m: MShape): number => { const a = c.actions.find((x) => x.a === 'projectile' && m.s.label.includes(':projectile')); return a && a.a === 'projectile' ? a.count ?? 1 : 1; };

/** Chain jump count and bounce rules, from the definitions (not the model). */
function customProbes(c: Case, P0: V): Custom[] {
  const out: Custom[] = [];
  const walk = (acts: Action[], viaShot: boolean) => acts.forEach((a) => {
    if (a.a === 'chain') {
      const n = a.jumps + 2, gap = a.range * 0.8;
      out.push({ label: `chain ${a.jumps} jumps of ${a.range} px: ${a.jumps + 1} of ${n} bodies ${Math.round(gap)} px apart`, cat: 'core',
        bodies: Array.from({ length: n }, (_, i) => ({ at: add(P0, v(0, 1), gap * i), role: i ? 'other' : 'primary' })), want: Array.from({ length: n }, (_, i) => i <= a.jumps) });
    }
    if (a.a === 'projectile') {
      if (a.onHit) walk(a.onHit, true);
      if ((a.bounce ?? 0) > 0 && !viaShot) {
        const b0 = v(CASTER_R + a.range * 0.3, 0);
        out.push({ label: `bounce ${a.bounce}: a body 100 px aside is struck next`, cat: 'core', bodies: [{ at: b0, role: 'primary' }, { at: add(b0, v(0, 1), 100), role: 'other' }], want: [true, true] });
        out.push({ label: `bounce ${a.bounce}: a body 300 px aside is not`, cat: 'core', bodies: [{ at: b0, role: 'primary' }, { at: add(b0, v(0, 1), 300), role: 'other' }], want: [true, false] });
      }
    }
    if (a.a === 'delay' || a.a === 'repeat') walk(a.then, viaShot);
  });
  walk(c.actions, false);
  return out;
}

function runCase(c: Case, bodies: CreatureDef[], f: Findings): void {
  const fails: string[] = [];
  let n = 0;
  const travel = c.basic ? new Map<Move, Travel>() : measureTravel(c, f);
  for (const def of bodies) {
    const R = def.radius;
    const A0 = c.enemy ? v(0, 0) : v(Math.max(60, Math.min(c.range || 100, 150)), 0);
    const minShot = Math.min(...c.actions.filter((a) => a.a === 'projectile').map((a) => (a.a === 'projectile' ? a.range : Infinity)), Infinity);
    const P0 = v(Math.max(CASTER_R + R + 8, 0.6 * Math.min(c.range || 120, minShot)), 0);
    const seen = new Set<string>();
    const run = (label: string, cat: Cat, bodies: ProbeBody[], want: boolean[]) => {
      const key = bodies.map((b) => fmt(b.at)).join('|');
      if (seen.has(key)) return;
      seen.add(key);
      const aim = c.enemy ? bodies[0].at : A0;
      const got = runProbe(c, def, bodies.map((b) => b.at), aim);
      n++; tally.probes++;
      const bad = got.map((g, i) => (g === want[i] ? '' : `${def.id} r${R} ${label}: body ${i} at ${fmt(bodies[i].at)} expected ${want[i] ? 'hit' : 'miss'}, got ${g ? 'hit' : 'miss'}`)).filter(Boolean);
      const line = `${c.cls} ${c.label}: ${bad.join('; ')}`;
      if (cat === 'core') fails.push(...bad); else f.add(cat, !bad.length, line);
    };
    for (const pr of probesFor(c, R, travel, A0, P0)) {
      const primary = pr.bodies[0].role === 'primary' ? pr.bodies[0].at : null;
      const shapes = buildShapes(c.actions, ctxFor(c, R, primary, travel, A0)).map((m) => m.s);
      const own = shapes.find((s) => s.label === pr.own);
      if (ambiguous(shapes, pr.bodies, R, own)) continue;
      run(pr.label, pr.cat, pr.bodies, expected(shapes, pr.bodies, R));
    }
    if (!c.basic) for (const cu of customProbes(c, P0)) run(cu.label, cu.cat, cu.bodies, cu.want);
  }
  check(!fails.length, `hero ${c.cls} ${c.label}: ${n} probes`, fails);
}

export function heroSection(f: Findings): string[] {
  const bodies = testBodies();
  console.log(`# hero side: bodies ${bodies.map((b) => `${b.id} (r ${b.radius})`).join(', ')}`);
  const skipped: string[] = [];
  const firstOfSchool = new Set<string>();
  for (const cls of Object.keys(CLASS_SCHOOL)) {
    const school = CLASS_SCHOOL[cls];
    // basic attack: the class's weapon form, with the kit override (as the sim merges them)
    const w = new World(), p = w.hero('h', cls), b = { ...BASIC[p.weapon.type], ...(p.kit.basic ?? {}) };
    const basicAct: Action = b.form === 'melee'
      ? { a: 'damage', coef: 1, area: { shape: 'cone', at: 'self', r: b.range, angle: b.arc ?? 90 } }
      : { a: 'projectile', coef: 1, speed: b.projectileSpeed ?? 460, range: b.range + 40 };
    runCase({ cls, label: `basic ${p.weapon.type} ${b.form} (range ${b.range}${b.form === 'melee' ? `, arc ${b.arc ?? 90}` : ''})`, enemy: false, actions: [basicAct], basic: true, range: 300, steal: false,
      settle: b.form === 'melee' ? 300 : ((b.range + 40) / (b.projectileSpeed ?? 460)) * 1000 + 300 }, bodies, f);
    const spells = [...p.kit.spells.map((id) => HC_KIT_SPELLS.find((s) => s.id === id)!), ...HC_SCHOOL_SPELL_DEFS.filter((s) => s.school === school)];
    if (!firstOfSchool.has(school)) { firstOfSchool.add(school); spells.push(...HC_SCROLL_SPELLS.filter((s) => s.school === school)); }
    for (const s of spells) {
      if (PLAIN.has(s.id) || !hostileActions(s.actions)) { skipped.push(`${cls}:${s.id}`); continue; }
      const steal = JSON.stringify(s.actions).includes('"steal"');
      runCase({ cls, label: `${s.id} (${s.aim})`, enemy: s.aim === 'enemy', actions: s.actions, basic: false, spell: s, range: s.range, steal,
        settle: (s.castMs ?? 0) + settleMs(s.actions) }, bodies, f);
    }
  }
  return skipped;
}
