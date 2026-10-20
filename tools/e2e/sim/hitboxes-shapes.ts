/**
 * Hitbox model (Claude 3 helper): an independent reading of the stated shapes (range, radius, cone angle, line
 * width, projectile width) plus body radii, used to say where a body is "just inside" or "just outside". The sim's
 * own maths is never called here: the test compares this model against what the sim does.
 *
 * Semantics: a body of radius R is hit when any part of it overlaps the shape (circle, cone, box, capsule);
 * centreOnly circles (chain jumps) and rings use the body centre. `tol` widens the outside probe only (tick
 * quantisation, spawn offsets), so probes inside [−AMB, tol+AMB] of another shape are dropped as ambiguous.
 */
export interface V { x: number; y: number }
export type Cat = 'core' | 'range' | 'edge' | 'dodge';
/** which bodies a shape can affect: any, only the aimed-at primary, or only the others (chain jumps) */
export type Applies = 'all' | 'primary' | 'others';

interface Base { label: string; applies: Applies; tol: number; outCat: Cat; inCat?: Cat }
export type Shape = Base & (
  | { k: 'circle'; c: V; r: number; centreOnly?: boolean }
  | { k: 'cone'; o: V; dir: V; r: number; angle: number }
  | { k: 'box'; o: V; dir: V; len: number; half: number }
  | { k: 'capsule'; a: V; b: V; half: number; pierce: boolean; side: boolean }
  | { k: 'ring'; c: V; r: number; outer: number }
);

export const AMB = 1.5;
export const v = (x: number, y: number): V => ({ x, y });
export const add = (a: V, b: V, k = 1): V => ({ x: a.x + b.x * k, y: a.y + b.y * k });
export const len = (a: V): number => Math.hypot(a.x, a.y);
export const unit = (a: V): V => { const l = len(a) || 1; return { x: a.x / l, y: a.y / l }; };
export const rot = (a: V, deg: number): V => { const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r); return { x: a.x * c - a.y * s, y: a.x * s + a.y * c }; };
const perp = (a: V): V => ({ x: -a.y, y: a.x });
const dot = (a: V, b: V): number => a.x * b.x + a.y * b.y;

/** Signed distance (px) from the body's edge to the shape boundary: ≤ 0 means the model says "hit". */
export function margin(s: Shape, p: V, R: number): number {
  switch (s.k) {
    case 'circle': return len(add(p, s.c, -1)) - s.r - (s.centreOnly ? 0 : R);
    case 'ring': { const d = len(add(p, s.c, -1)); return Math.max(s.r - d, d - s.outer); }
    case 'box': {
      const q = add(p, s.o, -1), along = dot(q, s.dir), across = Math.abs(dot(q, perp(s.dir)));
      return Math.max(-R - along, along - s.len - R, across - s.half - R);
    }
    case 'capsule': return segDist(p, s.a, s.b) - s.half - R;
    case 'cone': {
      const q = add(p, s.o, -1), d = len(q);
      const rangeM = d - s.r - R;
      const half = s.angle / 2, th = d < 1e-6 ? 0 : (Math.acos(Math.max(-1, Math.min(1, dot(q, s.dir) / d))) * 180) / Math.PI;
      // distance from the centre to the cone's angular boundary (rays from the apex), signed
      const edge = th <= half ? -d * Math.sin(((Math.min(90, half - th)) * Math.PI) / 180) : th - half >= 90 ? d : d * Math.sin(((th - half) * Math.PI) / 180);
      return Math.max(rangeM, edge - R);
    }
  }
}

function segDist(p: V, a: V, b: V): number {
  const ab = add(b, a, -1), l2 = dot(ab, ab) || 1;
  const t = Math.max(0, Math.min(1, dot(add(p, a, -1), ab) / l2));
  return len(add(p, add(a, ab, t), -1));
}

export interface ProbeBody { at: V; role: 'primary' | 'other' }
export interface Probe { label: string; cat: Cat; bodies: ProbeBody[] }

/** Model verdict per body (non-piercing projectiles stop at the first body along their line). */
export function expected(shapes: Shape[], bodies: ProbeBody[], R: number): boolean[] {
  const hit = bodies.map(() => false);
  for (const s of shapes) {
    const idx = bodies.map((b, i) => ({ b, i })).filter(({ b }) => (s.applies === 'all' || (s.applies === 'primary') === (b.role === 'primary')) && margin(s, b.at, R) <= 0);
    if (s.k === 'capsule' && !s.pierce && idx.length > 1) {
      const dir = unit(add(s.b, s.a, -1));
      idx.sort((x, y) => dot(add(x.b.at, s.a, -1), dir) - dot(add(y.b.at, s.a, -1), dir));
      idx.length = 1;
    }
    for (const { i } of idx) hit[i] = true;
  }
  return hit;
}

/** True when a body sits in the uncertain band of a shape (its own boundary ± AMB, widened by tol outside). */
export function ambiguous(shapes: Shape[], bodies: ProbeBody[], R: number, own?: Shape): boolean {
  for (const s of shapes) for (const b of bodies) {
    if (!(s.applies === 'all' || (s.applies === 'primary') === (b.role === 'primary'))) continue;
    const m = margin(s, b.at, R);
    const tol = s === own ? 0 : s.tol;
    // a cone's angular edge: centre outside but body overlapping is the 'edge' question, not the shape's own probe
    const coneBand = s.k === 'cone' && s !== own ? R : 0;
    if (m > -AMB - coneBand && m < tol + AMB) return true;
  }
  return false;
}

/** Edge probes for one shape: positions for a single body (or a secondary beside the primary). */
export function edgePoints(s: Shape, R: number): { label: string; at: V; inside: boolean; cat: Cat }[] {
  const out: { label: string; at: V; inside: boolean; cat: Cat }[] = [];
  const pair = (label: string, base: V, u: V, reach: number) => {
    out.push({ label: `${label} in`, at: add(base, u, reach - 2), inside: true, cat: s.inCat ?? 'core' });
    out.push({ label: `${label} out`, at: add(base, u, reach + s.tol + 2), inside: false, cat: s.outCat });
  };
  switch (s.k) {
    case 'circle': {
      const reach = s.r + (s.centreOnly ? 0 : R);
      pair(`${s.label} side`, s.c, v(0, 1), reach);
      pair(`${s.label} front`, s.c, v(1, 0), reach);
      break;
    }
    case 'ring':
      out.push({ label: `${s.label} beyond safe r`, at: add(s.c, v(0, 1), s.r + 3), inside: true, cat: 'core' });
      out.push({ label: `${s.label} inside safe r`, at: add(s.c, v(0, 1), s.r - 3), inside: false, cat: s.outCat });
      break;
    case 'box': {
      const mid = add(s.o, s.dir, s.len / 2), n = perp(s.dir);
      pair(`${s.label} end`, s.o, s.dir, s.len + R);
      pair(`${s.label} side`, mid, n, s.half + R);
      break;
    }
    case 'capsule': {
      const dir = unit(add(s.b, s.a, -1)), mid = add(s.a, add(s.b, s.a, -1), 0.5);
      pair(`${s.label} end`, s.b, dir, s.half + R);
      if (s.side) {
        // outward normal: away from the fan centre (+x), or +y for a straight line
        let n = perp(dir);
        if (Math.abs(dir.y) > 1e-6 && dot(n, v(0, dir.y)) < 0) n = v(-n.x, -n.y);
        out.push({ label: `${s.label} beside in`, at: add(mid, n, s.half + R - 3), inside: true, cat: 'core' });
        out.push({ label: `${s.label} beside out`, at: add(mid, n, s.half + R + 3), inside: false, cat: s.outCat });
      }
      break;
    }
    case 'cone': {
      pair(`${s.label} range`, s.o, s.dir, s.r + R);
      // angle probes at a distance clear of the point-blank zone (body overlapping the caster)
      const d = Math.min(s.r + R - 4, Math.max(s.r * 0.6, R + 18));
      const half = s.angle / 2;
      if (d > R + 16 && half < 170) {
        out.push({ label: `${s.label} angle in`, at: add(s.o, rot(s.dir, half - 4), d), inside: true, cat: 'core' });
        const outDeg = half + (Math.asin(Math.min(1, (R + 2) / d)) * 180) / Math.PI + 1;
        if (outDeg < 175) out.push({ label: `${s.label} angle out`, at: add(s.o, rot(s.dir, outDeg), d), inside: false, cat: s.outCat });
        // the body overlaps the cone edge by 3 px while its centre is outside: the 'edge' semantics question
        if (R > 5) out.push({ label: `${s.label} body overlaps edge`, at: add(s.o, rot(s.dir, half + (Math.asin((R - 3) / d) * 180) / Math.PI), d), inside: true, cat: 'edge' });
      }
      break;
    }
  }
  return out;
}

export const fmt = (p: V): string => `(${Math.round(p.x)},${Math.round(p.y)})`;
