/**
 * Action → model shapes (Claude 3 helper). Reads the Action language's own numbers (src/systems/rules/types.ts)
 * and lays them out in a frame where the caster stands at `self` and aims along `dir`. Hero and creature tests
 * share it; they differ only in where target-centred areas sit and how reach is gated (see ModelCtx).
 */
import type { Action, Area } from '@/systems/rules/types';
import { add, len, rot, v, type Cat, type Shape, type V } from './hitboxes-shapes';

/** Measured travel of a movement action (stated `dist` plus tick-quantisation overshoot). */
export interface Travel { dist: number; overshoot: number }

export interface ModelCtx {
  casterR: number;
  self: V;
  aim: V;
  dir: V;
  /** the aimed-at body (hero spell aimed at an enemy) or the creature's target */
  primary: V | null;
  /** where target-centred areas sit: the primary (hero spells) or the locked aim point (creature telegraphs) */
  centreT: V | null;
  /** single / target-centred reach from the caster's centre to the target's edge; null = ungated */
  gate: number | null;
  gateCat: Cat;
  /** outside-probe category for target-centred shapes */
  tCat: Cat;
  /** body radius of the probed bodies (gating) */
  R: number;
  travel: (a: Extract<Action, { a: 'move' }>) => Travel;
  /** shapes centred on the primary are tagged so probes place a secondary around it */
  onPrimary?: boolean;
  /** where single-target reach is measured from (the caster, also after a blink moved the frame) */
  gateAt?: V;
}

export interface MShape { s: Shape; onPrimary: boolean }

const SCREEN_OUTER = 420;
/** projectile end tolerance: spawn offset (caster edge + 4) and one 12 px sub-step */
export const SHOT_TOL = 16;

function areaShapes(area: Area, ctx: ModelCtx, label: string): MShape[] {
  const tgt = area.at === 'target' && ctx.centreT;
  const centre = area.at === 'self' ? ctx.self : area.at === 'target' ? (ctx.centreT ?? ctx.aim) : ctx.aim;
  const base = { label, applies: 'all' as const, tol: 0, outCat: tgt ? ctx.tCat : ('core' as Cat) };
  const onP = !!tgt && !!ctx.onPrimary;
  switch (area.shape) {
    case 'single':
      // a telegraphed creature cast resolves at its aim: the target counts only within (r + 12) of it (actions.ts lockedTarget)
      if (lockedCast(ctx)) return [{ s: { ...base, k: 'circle', c: ctx.centreT!, r: (area.r ?? 0) + 12, applies: 'primary', outCat: ctx.tCat }, onPrimary: false }];
      if (ctx.gate === null) return [];
      return [{ s: { ...base, k: 'circle', c: ctx.gateAt ?? ctx.self, r: ctx.gate, applies: 'primary', outCat: ctx.gateCat }, onPrimary: false }];
    case 'circle': return [{ s: { ...base, k: 'circle', c: centre, r: area.r ?? 0 }, onPrimary: onP }];
    case 'ring': return [{ s: { ...base, k: 'ring', c: centre, r: area.r ?? 0, outer: SCREEN_OUTER }, onPrimary: onP }];
    case 'cone': return [
      { s: { ...base, k: 'cone', o: centre, dir: ctx.dir, r: area.r ?? 0, angle: area.angle ?? 90 }, onPrimary: false },
      // a body overlapping the caster is struck whatever the angle (point blank); never probed itself
      { s: { ...base, label: `${label} point-blank`, k: 'circle', c: centre, r: ctx.casterR, noProbe: true }, onPrimary: false },
    ];
    case 'line': return [{ s: { ...base, k: 'box', o: centre, dir: ctx.dir, len: area.len ?? 100, half: (area.width ?? 24) / 2 }, onPrimary: onP }];
  }
}

/** a creature's telegraphed cast: target-centred things sit on the locked aim, not on the hero (centreT is the aim) */
const lockedCast = (ctx: ModelCtx): boolean => !!ctx.centreT && ctx.centreT !== ctx.primary;
const heroAimed = (ctx: ModelCtx): boolean => ctx.gate !== null && !!ctx.primary && ctx.centreT === ctx.primary;
const gateShape = (ctx: ModelCtx, label: string): MShape =>
  ({ s: { label: `${label} range`, applies: 'primary', tol: 0, outCat: ctx.gateCat, k: 'circle', c: ctx.gateAt ?? ctx.self, r: ctx.gate ?? 0 }, onPrimary: false });

/** Is the primary reachable at all (gated spells do nothing to a target beyond their range)? */
// (a locked creature cast has already committed: its use-range gate was checked when it started)
const primaryOk = (ctx: ModelCtx): boolean => lockedCast(ctx) || !ctx.primary || ctx.gate === null || len(add(ctx.primary, ctx.gateAt ?? ctx.self, -1)) <= ctx.gate + ctx.R;

export function buildShapes(actions: Action[], ctx: ModelCtx, path = 'a'): MShape[] {
  const out: MShape[] = [];
  actions.forEach((a, i) => {
    const label = `${path}${i}:${a.a}`;
    switch (a.a) {
      case 'damage': case 'status': case 'steal': case 'pull': case 'knock': {
        const targetBound = a.area.shape === 'single' || a.area.at === 'target';
        if (targetBound && ctx.centreT && ctx.primary && !primaryOk(ctx)) return;
        // a hero spell aimed at an enemy reaches its target only within the spell's range
        if (a.area.at === 'target' && a.area.shape !== 'single' && heroAimed(ctx)) out.push(gateShape(ctx, label));
        out.push(...areaShapes(a.area, ctx, label));
        return;
      }
      case 'projectile': {
        const n = a.count ?? 1, spread = a.spread ?? 0;
        for (let k = 0; k < n; k++) {
          const ang = n > 1 ? -spread / 2 + (spread * k) / (n - 1) : 0, u = rot(ctx.dir, ang);
          const s: Shape = {
            label: `${label}#${k}`, applies: 'all', tol: SHOT_TOL, outCat: 'core', k: 'capsule',
            a: add(ctx.self, u, ctx.casterR), b: add(ctx.self, u, ctx.casterR + a.range), half: a.radius ?? 6, pierce: !!a.pierce || (a.bounce ?? 0) > 0, side: k === 0 || k === n - 1,
          };
          out.push({ s, onPrimary: false });
        }
        // on-hit effects centre on the body the shot struck: the primary placed on the centre line
        if (a.onHit && ctx.primary) out.push(...buildShapes(a.onHit, { ...ctx, centreT: ctx.primary, gate: null, onPrimary: true }, `${label}>`).map((m) => ({ ...m, s: { ...m.s, applies: m.s.applies === 'primary' ? 'primary' : 'others' } as Shape })));
        return;
      }
      case 'chain': {
        if (ctx.gate !== null && ctx.primary && !primaryOk(ctx)) return;
        // a locked chain starts only on a target still within 24 px of the telegraph (actions.ts lockedTarget)
        if (lockedCast(ctx)) out.push({ s: { label: `${label} first`, applies: 'primary', tol: 0, outCat: ctx.tCat, k: 'circle', c: ctx.centreT!, r: 24 }, onPrimary: false });
        else if (ctx.gate !== null) out.push({ s: { label: `${label} first`, applies: 'primary', tol: 0, outCat: ctx.gateCat, k: 'circle', c: ctx.self, r: ctx.gate }, onPrimary: false });
        // jumps measure centre to centre from the previous target ("range" of the chain)
        if (ctx.primary) out.push({ s: { label: `${label} jump`, applies: 'others', tol: 0, outCat: 'core', k: 'circle', c: ctx.primary, r: a.range, centreOnly: true }, onPrimary: true });
        return;
      }
      case 'move': {
        if (a.mode === 'blink' || a.mode === 'behind' || (a.mode === 'leap' && ctx.primary && ctx.gate !== null)) {
          if (ctx.primary && !primaryOk(ctx)) return;
          if (heroAimed(ctx)) out.push(gateShape(ctx, label));
          // lands beside / on the target: land areas centre on it
          // (a creature's leap / blink re-aims at its target: outside its landing spot is a dodge question)
          if (a.land) out.push(...buildShapes(a.land, { ...ctx, gateAt: ctx.gateAt ?? ctx.self, self: ctx.centreT ?? ctx.aim, onPrimary: true }, `${label}>land`).map((m) => ({ ...m, s: { ...m.s, outCat: m.s.applies === 'primary' ? m.s.outCat : ctx.tCat } as Shape })));
          return;
        }
        // the measured landing spot (the overshoot past the stated distance is the travel check's business)
        const tr = ctx.travel(a), end = add(ctx.self, ctx.dir, tr.dist + tr.overshoot), tol = 4;
        for (const [j, p] of (a.path ?? []).entries()) {
          const pl = `${label}>path${j}`;
          if (p.a === 'damage' && p.area.shape === 'line') {
            // the dasher's body sweeps a lane `width` wide along its path
            out.push({ s: { label: pl, applies: 'all', tol, outCat: 'core', k: 'capsule', a: ctx.self, b: end, half: (p.area.width ?? 24) / 2 + ctx.casterR, pierce: true, side: true }, onPrimary: false });
          } else {
            // any other path effect (a circle around the moving caster) sweeps its radius along the path
            const r = firstRadius([p]);
            if (r !== null) out.push({ s: { label: pl, applies: 'all', tol, outCat: 'core', k: 'capsule', a: ctx.self, b: end, half: r, pierce: true, side: true }, onPrimary: false });
          }
        }
        if (a.land) out.push(...buildShapes(a.land, { ...ctx, self: end }, `${label}>land`).map((m) => ({ ...m, s: { ...m.s, tol: Math.max(m.s.tol, tol) } as Shape })));
        return;
      }
      case 'zone': {
        if (a.kind === 'wall' || a.kind === 'decoy') return;
        const zc = a.area.at === 'self' ? ctx.self : a.area.at === 'target' ? (ctx.centreT ?? ctx.aim) : ctx.aim;
        const zctx: ModelCtx = { ...ctx, aim: zc, self: zc, centreT: zc, gate: null };
        if (a.kind === 'trap') {
          const r = Math.min(a.area.r ?? 26, firstRadius(a.trigger ?? []) ?? Infinity);
          out.push({ s: { label: `${label} trap`, applies: 'all', tol: 0, outCat: a.area.at === 'target' ? ctx.tCat : 'core', k: 'circle', c: zc, r }, onPrimary: false });
          return;
        }
        // tick effects are pinned to the zone centre
        const each = buildShapes(a.each ?? [], zctx, `${label}>`).map((m) => ({ ...m, onPrimary: false, s: { ...m.s, outCat: a.area.at === 'target' ? ctx.tCat : m.s.outCat } as Shape }));
        out.push(...each);
        return;
      }
      case 'delay': out.push(...buildShapes(a.then, ctx, `${label}>`)); return;
      case 'repeat': {
        // repeated movement continues from where the last one ended (same locked direction)
        const step = a.then.reduce((d, x) => d + (x.a === 'move' && x.mode !== 'blink' && x.mode !== 'behind' ? ctx.travel(x).dist + ctx.travel(x).overshoot : 0), 0);
        const n = step > 0 ? a.n : 1;
        for (let r = 0; r < n; r++) out.push(...buildShapes(a.then, { ...ctx, self: add(ctx.self, ctx.dir, step * r) }, `${label}>${r}.`));
        return;
      }
      default:
    }
  });
  return out;
}

function firstRadius(acts: Action[]): number | null {
  for (const a of acts) {
    if ((a.a === 'damage' || a.a === 'status') && a.area.shape === 'circle') return a.area.r ?? 0;
    if (a.a === 'repeat' || a.a === 'delay') { const r = firstRadius(a.then); if (r !== null) return r; }
  }
  return null;
}

/** Does this action list do anything to a hostile body (as opposed to heals, buffs, summons, resources)? */
export function hostileActions(acts: Action[]): boolean {
  return acts.some((a) => ['damage', 'status', 'projectile', 'chain', 'steal', 'pull', 'knock'].includes(a.a)
    || (a.a === 'move' && (!!a.path?.length || !!a.land?.length && hostileActions(a.land)))
    || (a.a === 'zone' && hostileActions([...(a.each ?? []), ...(a.trigger ?? [])]))
    || ((a.a === 'delay' || a.a === 'repeat') && hostileActions(a.then)));
}

/** How long until every effect of these actions has resolved (ms), generous. */
export function settleMs(acts: Action[]): number {
  let m = 0;
  for (const a of acts) {
    let t = 0;
    if (a.a === 'projectile') t = (a.range / a.speed) * 1000 + 150 + (a.onHit ? settleMs(a.onHit) : 0);
    else if (a.a === 'move') t = 700 + settleMs([...(a.path ?? []), ...(a.land ?? [])]);
    else if (a.a === 'zone') t = (a.tick ?? 0) + 200 + settleMs([...(a.each ?? []), ...(a.trigger ?? [])]);
    else if (a.a === 'delay') t = a.ms + settleMs(a.then);
    else if (a.a === 'repeat') t = (a.n - 1) * a.every + settleMs(a.then);
    else t = 100;
    m = Math.max(m, t);
  }
  return m + 150;
}

export const origin0 = v(0, 0);
