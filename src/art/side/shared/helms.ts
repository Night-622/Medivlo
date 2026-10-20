/**
 * Side-view worn headgear (Claude 5): the 16 armour-set helms (gear.js HELM, by set colours s.a / s.b / s.t) and the
 * 3 alt headwear pieces (gear.js ALT: hood, circlet, bandana), in profile facing right, on the side head grid
 * (skull x 8–23, rows 6–21, brow band rows 11–12, face edge x 23). Drawn solid; the composer outlines them.
 */
import { M } from '../mvApi';
import type { Gfx } from '../kit';

/** a helm set's colours, as gear.js SETS carries them */
export interface SetCol { helm: string; a: string[]; b: string[]; t: string }

/** profile dome over the skull (art.js helmDome, side): cleared below the brow */
export function sideDome(g: Gfx, c: string[]): void {
  g.ell(15.5, 10, 8.4, 6.4, c[2]); g.ell(15, 9.6, 7.8, 5.8, c[1]); g.ell(12.5, 7.4, 3.8, 2.4, c[0]);
  g.x.clearRect(0, 13, 32, 27);
}

/** profile hood: covers the crown and the back of the head to the shoulders, open at the face; peak up or trailing */
export function sideHood(g: Gfx, c: string[], peak?: 'up' | 'back'): void {
  g.ell(14.5, 12, 9.4, 9.6, c[2]); g.ell(14, 11.5, 8.8, 9, c[1]); g.ell(11, 7, 4, 3, c[0]);
  if (peak === 'up') g.poly([[11, 4], [14, 0], [17, 3]], c[1]);
  if (peak === 'back') { g.poly([[8, 6], [2, 3], [4, 10]], c[1]); g.line(3, 4, 5, 9, c[0]); }
  g.ell(20.5, 15.5, 4.6, 6.2, null, true); // the face opening
  g.x.clearRect(0, 23, 32, 17);
}

type HelmFn = (g: Gfx, s: SetCol) => void;

export const SIDE_HELM: Record<string, HelmFn> = {
  kettle: (g, s) => { sideDome(g, s.b); g.ell(15.5, 12, 12.5, 2.2, s.b[2]); g.ell(15.5, 11.6, 12, 1.6, s.b[1]); g.r(7, 11, 17, 1, s.t); },
  great: (g, s) => {
    g.rr(7, 4, 18, 18, s.a[2], 3); g.rr(8, 4, 16, 17, s.a[1], 3); g.r(9, 5, 4, 14, s.a[0]);
    g.r(17, 14, 7, 2, M().INK); [[20, 18], [22, 18], [20, 20], [22, 20]].forEach(([x, y]) => g.p(x, y, M().INK));
    g.disc(15, 3, 2.2, s.t);
  },
  fin: (g, s) => {
    g.poly([[9, 8], [10, 4], [13, 1.5], [17, 1.5], [20, 3.5], [21, 7], [18, 5], [14, 4], [11, 6]], s.b[1]);
    g.line(10, 4, 13, 2, s.b[0]); g.line(13, 2, 17, 2, s.b[0]);
    sideDome(g, s.a); g.r(7, 11, 17, 2, s.b[0]);
    g.r(7, 13, 4, 5, s.a[1]); g.r(7, 13, 1, 5, s.a[0]); g.r(15, 13, 3, 5, s.a[1]); g.r(23, 12, 2, 4, s.a[1]);
  },
  wizard: (g, s) => {
    g.ell(15.5, 12, 11.6, 2.2, s.a[2]); g.ell(15.5, 11.4, 11, 1.6, s.a[1]); g.r(6, 11, 9, 1, s.a[0]);
    g.poly([[8, 11], [12.5, 2.5], [22, 11]], s.a[1]); g.poly([[17, 11], [12.5, 2.5], [22, 11]], s.a[2]); g.line(10, 10, 12, 4, s.a[0]);
    g.poly([[13, 3.5], [11, 1], [7, 0.5], [3, 2.5], [6, 2], [10, 2.6]], s.a[1]);
    g.r(11, 9, 9, 2, s.b[1]); g.r(11, 9, 9, 1, s.b[0]); g.p(19, 9, s.t);
  },
  hood: (g, s) => { sideHood(g, s.a, 'back'); g.p(18, 6, s.t); },
  circlet: (g, s) => { g.r(8, 12, 15, 1, s.b[0]); g.r(8, 13, 15, 1, s.b[2]); g.r(21, 11, 2, 3, s.t); g.p(21, 11, '#ffffff'); },
  skull: (g, s) => {
    sideDome(g, s.b); const INK = M().INK;
    g.r(18, 8, 4, 3, INK); g.p(19, 9, s.t);
    g.r(7, 11, 17, 2, s.b[0]); for (let x = 8; x < 24; x += 2) g.p(x, 12, s.b[2]);
    g.poly([[9, 6], [4, 1], [6, 7]], s.a[1]); g.poly([[19, 5], [23, 0], [22, 6]], s.a[1]);
  },
  crest: (g, s) => {
    sideDome(g, s.a); g.r(6, 11, 19, 2, s.a[2]); g.r(6, 11, 19, 1, s.a[1]);
    g.poly([[19, 4], [16, 1], [10, 1], [3, 3], [2, 7], [8, 4], [13, 3], [15, 5]], s.b[1]); g.line(15, 2, 4, 4, s.t);
  },
  flowers: (g, s) => {
    g.r(8, 10, 15, 2, '#3fae4c'); g.r(8, 10, 15, 1, '#8ef06a');
    [[10, 9, s.t], [14, 8, s.b[0]], [18, 9, '#ffd84a'], [22, 9, s.t]].forEach(([x, y, c]) => { const X = +x, Y = +y, C = String(c); g.p(X - 1, Y, C); g.p(X + 1, Y, C); g.p(X, Y - 1, C); g.p(X, Y + 1, C); g.p(X, Y, '#ffd84a'); });
  },
  cowl: (g, s) => sideHood(g, s.a, 'up'),
  winged: (g, s) => {
    sideDome(g, s.a); g.r(7, 11, 17, 2, s.b[1]); g.r(21, 11, 2, 2, s.t);
    g.poly([[13, 9], [7, 3], [5, 6], [7, 6], [5, 9], [8, 9], [7, 12], [13, 12]], s.b[0]); g.line(6, 5, 12, 9, s.b[2]);
  },
  wolf: (g, s) => {
    sideHood(g, s.a); const INK = M().INK;
    g.poly([[10, 6], [11, 0], [14, 4]], s.a[2]); g.poly([[13, 5], [15, 0], [17, 4]], s.a[1]); g.p(15, 2, s.t);
    g.r(16, 7, 8, 3, s.a[0]); g.p(24, 8, INK); g.p(20, 8, INK); g.r(21, 9, 3, 1, s.a[1]);
  },
  horned: (g, s) => {
    sideDome(g, s.a); g.r(7, 11, 17, 2, s.a[2]);
    g.poly([[10, 8], [6, 6], [4, 1], [7, 4], [9, 8]], s.b[1]); g.poly([[15, 8], [19, 6], [22, 1], [21, 5], [17, 9]], s.b[0]); g.p(15, 7, s.t);
  },
  tricorne: (g, s) => {
    // a bicorne worn athwart: from the side it is a tall arch
    g.poly([[6, 11], [9, 4], [15.5, 1], [22, 4], [25, 11], [15.5, 9]], s.a[2]); g.poly([[9, 5], [15.5, 2], [15.5, 7], [11, 8]], s.a[1]);
    g.line(6, 11, 15.5, 9, s.t); g.line(15.5, 9, 25, 11, s.t); g.poly([[14, 3], [8, 0], [6, 1], [12, 4]], s.b[0]);
  },
  antler: (g, s) => {
    sideDome(g, s.a); g.r(7, 11, 17, 2, s.a[2]);
    [[12, 6, 8, 1], [10, 4, 6, 4], [16, 5, 18, 0], [17, 3, 21, 2], [8, 1, 7, 0]].forEach(([a, b, c, d]) => g.line(a, b, c, d, s.b[1]));
    g.r(21, 8, 2, 3, s.t); g.p(21, 8, '#ffffff');
  },
  crown: (g, s) => {
    sideDome(g, s.a); g.r(8, 8, 15, 4, s.b[1]); g.r(8, 8, 15, 1, s.b[0]);
    [9, 13, 17, 20].forEach((x) => g.poly([[x, 8], [x + 1.5, 3], [x + 3, 8]], s.b[1])); [[10, 10], [15, 10], [21, 10]].forEach(([x, y]) => g.p(x, y, s.t));
  },
};
/** helms that leave the crown's hair drawn (gear.js OPEN_HELM) */
export const OPEN_SIDE_HELM = new Set(['circlet', 'flowers']);

/** gear.js ALT headwear (by kit: sly → hood, caster → circlet, martial → bandana), in profile */
export const SIDE_ALT: Record<string, { draw: (g: Gfx) => void; open: boolean }> = {
  hood: { draw: (g) => sideHood(g, ['#c8a07a', '#8a6a4a', '#5e4a34'], 'back'), open: false },
  circlet: { draw: (g) => { g.r(8, 12, 15, 1, '#eef4ff'); g.r(8, 13, 15, 1, '#9aa6c8'); g.r(21, 11, 2, 3, '#3fa9ff'); }, open: true },
  bandana: { draw: (g) => { g.r(7, 11, 17, 2, '#d63447'); g.r(7, 11, 17, 1, '#ff6a6a'); g.poly([[8, 11], [3, 13], [2, 17], [5, 15], [8, 13]], '#d63447'); }, open: true },
};
