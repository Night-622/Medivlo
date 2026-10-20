/**
 * Side-view hero bodies (Claude 5). The torso, arms, legs and boots are sampled from the hero's real front body as
 * the paperdoll composes it (MV.heroFrameX: class body or chest set, dye, gloves, boots, male widening), so every
 * outfit, armour set and dye carries over without per-combination art. Facing right; left is flipX.
 */
import { M, type Gfx, type Look } from './mvApi';

/** idle; a = near leg forward; pass = far leg swinging (lifted); b = far leg forward; pass2 = near leg swinging */
export type Phase = 'idle' | 'a' | 'pass' | 'b' | 'pass2';

/** Colours read off the front body. */
export interface BodySample {
  front: HTMLCanvasElement;
  robe: boolean;
  /** arm strip: rows top..bottom of 3 columns (the front's left arm), hands included */
  arm: (string | null)[][];
  leg: [string, string, string];
  boot: [string, string];
  /** class back gear (cloak/cape) main + shade, if any */
  back: [string, string] | null;
}

/** Pixel reader; the front frame's ink outline counts as empty (the side layers get their own outline). */
function pixels(c: HTMLCanvasElement): (x: number, y: number) => string | null {
  const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data, ink = M().INK.toLowerCase();
  return (x, y) => {
    if (x < 0 || y < 0 || x >= c.width || y >= c.height) return null;
    const i = (y * c.width + x) * 4;
    if (d[i + 3] < 40) return null;
    const hex = '#' + [d[i], d[i + 1], d[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('');
    return hex === ink ? null : hex;
  };
}

/** The front body with no headgear, weapon or held items, via a throwaway copy of the class in MV.HERO. */
export function sampleBody(L: Look): BodySample {
  const mv = M(), key = `__side_${L.cls}`, C = mv.HERO[L.cls];
  mv.HERO[key] = { ...C, wf: [], wb: [], head: undefined, over: undefined };
  let front: HTMLCanvasElement;
  try {
    const flat: Look = { ...L, cls: key, hair: 6, nohat: true, helm: 0, weapon: 0, face: 0, extra: L.extra === 3 ? 0 : L.extra, cape: 0 };
    front = mv.heroFrameX ? mv.heroFrameX(flat, 0, 'idle') : (mv as unknown as { frames(n: string): HTMLCanvasElement[] }).frames(L.cls)[0];
  } finally { delete mv.HERO[key]; }
  const at = pixels(front);
  const robe = !!at(16, 34) && !!at(15, 34);
  // the left arm: the first opaque column left of the torso at elbow height, three wide, from the shoulder to the hand
  let a = 9;
  for (let x = 2; x < 10; x++) if (at(x, 27)) { a = x; break; }
  let bottom = 26;
  for (let y = 23; y < 35; y++) if (at(a + 1, y)) bottom = y; else if (y > 26) break;
  const arm: (string | null)[][] = [];
  for (let y = 22; y <= bottom; y++) arm.push([at(a, y), at(a + 1, y), at(a + 2, y)]);
  const leg: [string, string, string] = [at(11, 34) ?? '#6e7f3a', at(12, 34) ?? '#4a5a28', at(14, 34) ?? '#2f3a18'];
  const boot: [string, string] = [at(10, 36) ?? '#a9622f', at(12, 37) ?? at(12, 36) ?? '#5e3220'];
  let back: [string, string] | null = null;
  if (C.back && !L.chest) {
    const bg = mv.G(32, 40);
    C.back(bg, { k: mv.INK, w: '#fff', s: '#ffe0bd', S: '#f7b48a', d: '#d9805f', b: '#ff8a9e', h: '#888', H: '#777', j: '#666', e: '#000', E: '#000' });
    const bp = pixels(bg.c), count = new Map<string, number>();
    for (let y = 22; y < 37; y++) for (let x = 4; x < 28; x++) { const c = bp(x, y); if (c) count.set(c, (count.get(c) ?? 0) + 1); }
    const main = [...count.entries()].sort((p, q) => q[1] - p[1])[0]?.[0];
    if (main) back = [main, mv.mix(main, mv.INK, 0.35)];
  }
  return { front, robe, arm, leg, boot, back };
}

/** The chest's front-facing detail (emblem) as a 1–2 px sliver on the slice's front edge. Off if it reads as noise. */
export const EMBLEM_SLIVER = true;

/**
 * The torso: the front's centre columns (x 11–20) as a side slice, re-lit for a profile, the robe hem widened toward
 * its flare. Re-light: art.js banding (sh(): a highlight and a shade column on every strip) would read as vertical
 * seams from the side, so a colour found in one column of a row takes its inner neighbour's colour; then the back
 * edge is lit and the front edge shaded. Full-row features (belts, buckles, mantles, hems) keep their colours.
 */
export function drawTorso(g: Gfx, S: BodySample, dy: number): void {
  const at = pixels(S.front), last = S.robe ? 35 : 32, mix = M().mix, INK = M().INK;
  for (let y = 22; y <= last; y++) {
    const row: (string | null)[] = [];
    for (let x = 11; x <= 20; x++) row.push(at(x, y));
    const count = new Map<string, number>();
    row.forEach((c) => { if (c) count.set(c, (count.get(c) ?? 0) + 1); });
    const lit = row.map((c, i) => (!c || (count.get(c) ?? 0) > 1 ? c : (i < 5 ? row[i + 1] : row[i - 1]) ?? c));
    const first = lit.findIndex((c) => !!c), end = lit.length - 1 - [...lit].reverse().findIndex((c) => !!c);
    if (first >= 0 && end > first) { lit[first] = mix(lit[first]!, '#ffffff', 0.18); lit[end] = mix(lit[end]!, INK, 0.25); }
    lit.forEach((c, i) => { if (c) g.p(11 + i, y + dy, c); });
    if (EMBLEM_SLIVER && y >= 24 && y <= 30) {
      // the front's centre pixels that occur nowhere else in their row (an emblem) move to the chest's front edge
      const full: (string | null)[] = [];
      for (let x = 6; x <= 25; x++) full.push(at(x, y));
      [15, 16].forEach((x, k) => { const c = at(x, y); if (c && full.filter((v) => v === c).length <= 2) g.p(19 + k, y + dy, c); });
    }
    if (S.robe && y >= 33) {
      // hem rows: the front's outer robe columns, half as many, on each side of the slice
      let l = 11, r = 20;
      while (l > 0 && at(l - 1, y)) l--;
      while (r < 31 && at(r + 1, y)) r++;
      const extra = Math.max(0, Math.round((r - l + 1 - 12) / 2));
      for (let i = 0; i < extra; i++) {
        const cl = at(l + i, y), cr = at(r - i, y);
        if (cl) g.p(10 - (extra - 1 - i), y + dy, cl);
        if (cr) g.p(21 + (extra - 1 - i), y + dy, cr);
      }
    }
  }
}

type Foot = 'plant' | 'heel' | 'lift';
const STRIDE: Record<Phase, { near: number[]; far: number[]; nearFoot: Foot; farFoot: Foot }> = {
  // per leg: x of the leg at rows 33, 34, 35 (the foot follows the last). heel = back foot pushing off; lift = the
  // swinging leg, knee bent, foot clear of the ground. Contact spreads the feet ~12 px.
  idle: { near: [15, 15, 15], far: [13, 13, 13], nearFoot: 'plant', farFoot: 'plant' },
  a: { near: [16, 18, 20], far: [13, 11, 9], nearFoot: 'plant', farFoot: 'heel' },
  pass: { near: [15, 15, 15], far: [14, 14, 14], nearFoot: 'plant', farFoot: 'lift' },
  b: { near: [13, 11, 9], far: [16, 18, 20], nearFoot: 'heel', farFoot: 'plant' },
  pass2: { near: [15, 15, 15], far: [14, 14, 14], nearFoot: 'lift', farFoot: 'plant' },
};

/** One leg and boot. Robes show only the boot peeking under the hem. */
function leg(g: Gfx, S: BodySample, xs: number[], foot: Foot, dark: boolean): void {
  const mix = M().mix, INK = M().INK, sh = (c: string) => (dark ? mix(c, INK, 0.3) : c), n = foot === 'lift' ? 2 : 3;
  if (!S.robe) xs.slice(0, n).forEach((x, i) => { g.r(x, 33 + i, 3, 1, sh(S.leg[1])); g.p(x, 33 + i, sh(S.leg[0])); g.p(x + 2, 33 + i, sh(S.leg[2])); });
  const fx = xs[n - 1];
  if (foot === 'lift') { g.r(fx, 35, 4, 1, sh(S.boot[1])); g.p(fx, 35, sh(S.boot[0])); }
  else if (foot === 'heel') { g.r(fx, 36, 3, 1, sh(S.boot[1])); g.p(fx, 36, sh(S.boot[0])); g.p(fx + 2, 37, sh(S.boot[1])); }
  else { g.r(fx, 36, 4, 2, sh(S.boot[1])); g.r(fx, 36, 2, 1, sh(S.boot[0])); }
}

export function drawLegs(g: Gfx, S: BodySample, phase: Phase, which: 'near' | 'far'): void {
  const s = STRIDE[phase];
  if (which === 'far') leg(g, S, s.far, s.farFoot, true);
  else leg(g, S, s.near, s.nearFoot, false);
}

/** Hand swing for a phase: the arm opposite the forward leg goes forward. */
export function armSwing(phase: Phase, which: 'near' | 'far'): number {
  const v = phase === 'a' ? -2 : phase === 'b' ? 2 : 0;
  return which === 'near' ? v : -v;
}

/** An arm hanging from the shoulder at x 14–16, its hand swung `swing` px (slanted over the forearm). */
export function drawArm(g: Gfx, S: BodySample, swing: number, dy: number, dark: boolean): void {
  const mix = M().mix, INK = M().INK, n = S.arm.length;
  S.arm.forEach((row, i) => {
    const t = n > 1 ? i / (n - 1) : 0, off = Math.round(swing * t * t);
    row.forEach((c, j) => { if (c) g.p(14 + j + off, 22 + i + dy, dark ? mix(c, INK, 0.3) : c); });
  });
}

/** Class back gear (cloak) hanging behind the shoulders, swaying with the stride. */
export function drawBack(g: Gfx, S: BodySample, phase: Phase, dy: number): void {
  if (!S.back) return;
  const sway = phase === 'a' || phase === 'b' ? -1 : 0;
  g.poly([[11, 22 + dy], [14, 22 + dy], [13, 32 + dy], [8 + sway, 33 + dy], [9 + sway, 27 + dy]], S.back[0]);
  g.line(11, 22 + dy, 8 + sway, 32 + dy, S.back[1]);
}

/** Paperdoll capes (gear.js CAPE colours) in profile. */
export function drawCape(g: Gfx, kind: number, phase: Phase, dy: number): void {
  const sway = phase === 'a' || phase === 'b' ? -1 : 0;
  if (kind === 1) { g.poly([[12, 22 + dy], [15, 22 + dy], [13, 33], [9 + sway, 34]], '#c8503a'); g.line(12, 22 + dy, 9 + sway, 34, '#e87a5a'); }
  if (kind === 2) { g.poly([[12, 21 + dy], [15, 21 + dy], [14, 37], [7 + sway, 37]], '#3a4a7a'); g.line(12, 21 + dy, 7 + sway, 37, '#5a6aa8'); }
  if (kind === 3) { g.ell(10, 21 + dy, 3, 2.5, '#8a5a3a'); g.ell(10, 20 + dy, 2.5, 1.8, '#a87a5a'); }
}
