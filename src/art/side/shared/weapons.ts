/**
 * Side-view paperdoll weapons (Claude 5): gear.js WHELD's 8 types, carried in the near hand in profile, facing right,
 * in their material's colours (m.b blade ramp, m.g grip ramp, m.a accent, m.glow sparks). `hand` is the reach the
 * near arm takes (WEAPON_HOLD); the hand then sits at about x 15+hand, row 30. Bob/tilt follow kit.ts. Tall weapons
 * stand ahead of the face (shaft at x 25–26; the face edge is x 23, the nose 24) so they never cover the eye.
 */
import { bob, dip, tilt, type Gfx, type Pal, type Phase } from '../kit';

/** a weapon material as gear.js MAT carries it */
export interface Mat { b: string[]; g: string[]; a: string; glow?: string }

type WFn = (g: Gfx, P: Pal, m: Mat, hand: number, ph: Phase) => void;

/** how far forward each type is carried (px) */
export const WEAPON_HOLD: Record<string, number> = { sword: 6, axe: 6, mace: 6, spear: 6, bow: 6, staff: 6, dagger: 3, wand: 4 };

const spark = (g: Gfx, m: Mat, pts: [number, number][]) => { if (m.glow) pts.forEach(([x, y], i) => g.p(x, y, i % 2 ? '#ffffff' : m.glow!)); };
/** a 2-px shaft from (x0, y0) at the top to (x1, y1), light column then dark */
const shaft = (g: Gfx, x0: number, y0: number, x1: number, y1: number, c: string[]) => { g.line(x0, y0, x1, y1, c[0]); g.line(x0 + 1, y0, x1 + 1, y1, c[1]); };

export const SIDE_WEAPON: Record<string, WFn> = {
  sword: (g, _P, m, hand, ph) => {
    // carried upright by the grip: blade up, cross-guard over the fist
    const x = 19 + hand, b = bob(ph), t = tilt(ph);
    g.line(x + t, 12 + b, x, 27 + b, m.b[0]); g.line(x + 1 + t, 12 + b, x + 1, 27 + b, m.b[1]); g.p(x + t, 11 + b, m.b[0]);
    g.r(x - 2, 28 + b, 6, 1, m.a); g.r(x, 29 + b, 2, 3, m.g[0]); g.disc(x + 0.5, 33 + b, 1.2, m.a);
    spark(g, m, [[x + 3 + t, 13 + b], [x - 2 + t, 16 + b]]);
  },
  axe: (g, _P, m, hand, ph) => {
    const x = 19 + hand, b = bob(ph), t = tilt(ph);
    shaft(g, x + t, 10 + b, x, 35 + b, m.g);
    g.poly([[x + 2 + t, 9 + b], [x + 6 + t, 7 + b], [x + 6 + t, 16 + b], [x + 2 + t, 13 + b]], m.b[1]); g.line(x + 6 + t, 7 + b, x + 6 + t, 16 + b, m.b[0]);
    g.poly([[x + t, 10 + b], [x - 2 + t, 11 + b], [x + t, 13 + b]], m.b[2]); g.r(x + t, 9 + b, 2, 2, m.a);
    spark(g, m, [[x + 4 + t, 6 + b], [x + 6 + t, 17 + b]]);
  },
  mace: (g, _P, m, hand, ph) => {
    // the head held high, above the brow, so it clears the face
    const x = 20 + hand, b = bob(ph), t = tilt(ph);
    shaft(g, x + t, 13 + b, x, 35 + b, m.g);
    [[x + t, 5 + b], [x + 4 + t, 9 + b], [x - 3 + t, 9 + b]].forEach(([px, py]) => g.p(px, py, m.b[2]));
    g.disc(x + 0.5 + t, 9 + b, 3, m.b[1]); g.disc(x - 0.5 + t, 8 + b, 1.7, m.b[0]); g.r(x - 1 + t, 13 + b, 4, 1, m.a);
    spark(g, m, [[x + 4 + t, 5 + b], [x - 3 + t, 6 + b]]);
  },
  spear: (g, _P, m, hand, ph) => {
    const x = 20 + hand, b = bob(ph), t = tilt(ph);
    shaft(g, x + t, 7 + b, x, 37 + b, m.g);
    g.poly([[x + 0.5 + t, 0 + b], [x + 3 + t, 4 + b], [x + 0.5 + t, 8 + b], [x - 2 + t, 4 + b]], m.b[1]); g.line(x + t, 1 + b, x - 1 + t, 5 + b, m.b[0]);
    g.r(x - 1 + t, 8 + b, 4, 1, m.a);
    spark(g, m, [[x + 3 + t, 1 + b], [x - 2 + t, 0 + b]]);
  },
  bow: (g, _P, m, hand, ph) => {
    // held out in front, upright, the string toward the archer
    const x = 19 + hand, b = bob(ph);
    for (let s = 0; s <= 1; s += 0.02) { const y = 14 + 22 * s + b, bx = x + 1 + 3.4 * Math.sin(Math.PI * s); g.p(bx, y, m.b[1]); g.p(bx + 1, y, m.b[2]); }
    g.line(x, 14 + b, x, 36 + b, '#fff1cf'); g.p(x + 1, 13 + b, m.a); g.p(x + 1, 37 + b, m.a); g.r(x + 3, 24 + b, 2, 3, m.a);
    spark(g, m, [[x + 2, 12 + b], [x + 2, 38 + b]]);
  },
  staff: (g, _P, m, hand, ph) => {
    const x = 19 + hand, b = bob(ph), t = tilt(ph);
    shaft(g, x + t, 11 + b, x, 37 + b, m.g); g.r(x - 1 + t, 10 + b, 4, 1, m.a);
    g.disc(x + 0.5 + t, 6.5 + b, 3.4, m.b[1]); g.disc(x + t, 6 + b, 1.9, m.b[0]); g.p(x - 1 + t, 5 + b, '#ffffff');
    spark(g, m, [[x + 4 + t, 2 + b], [x - 3 + t, 2 + b], [x + 3 + t, 10 + b]]);
  },
  dagger: (g, _P, m, hand, ph) => {
    // a reversed grip low at the hip, the blade pointing forward and down
    const x = 17 + hand, y = 30 + dip(ph) + bob(ph);
    g.line(x, y, x + 4, y + 4, m.b[0]); g.line(x + 1, y, x + 5, y + 4, m.b[1]); g.r(x - 1, y - 1, 3, 1, m.a);
    spark(g, m, [[x + 6, y + 5]]);
  },
  wand: (g, _P, m, hand, ph) => {
    const x = 17 + hand, y = 30 + bob(ph), t = tilt(ph);
    g.line(x, y, x + 4 + t, y - 7, m.g[0]); g.line(x + 1, y, x + 5 + t, y - 7, m.g[1]);
    g.disc(x + 5 + t, y - 9, 2, m.b[1]); g.p(x + 4 + t, y - 10, '#ffffff');
    spark(g, m, [[x + 8 + t, y - 12], [x + 3 + t, y - 13], [x + 8 + t, y - 7]]);
  },
};
