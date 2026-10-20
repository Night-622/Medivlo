/**
 * Side-view class gear (Claude 5): headgear and held items in profile, facing right, in the handoff's colours and
 * banded shading. Phase 1 covers the prototype classes (warden, arcanist, huntsman); any other class falls back to
 * its front headgear squeezed to profile width and no held item. Phase 2 fills in the other 21 classes and NPCs.
 */
import { M, type Gfx, type Pal } from './mvApi';
import type { Phase } from './body';

const ST = ['#eef4ff', '#a9bbd6', '#62759a'], GO = ['#ffe27a', '#f0a823', '#b8661a'];
const BL = ['#5aaeff', '#2f74e0', '#1f469c'], RR = ['#ff6a6a', '#d63447', '#8a1f45'];
const CAP = ['#d9c4a0', '#a8906a', '#8a6a4a', '#6e5a40'];

/** held items ride the stride: up 1 on the pass frames, and a pendulum lean against the hand's swing on contact */
const bob = (ph: Phase) => (ph === 'pass' || ph === 'pass2' ? -1 : 0);
const tilt = (ph: Phase) => (ph === 'a' ? -1 : ph === 'b' ? 1 : 0);

/** a vertical banded strip (art.js sh) */
const band = (g: Gfx, x: number, y: number, w: number, h: number, c: string[]) => { g.r(x, y, w, h, c[1]); g.r(x, y, 1, h, c[0]); g.r(x + w - 1, y, 1, h, c[2]); };

export interface SideGear {
  /** headgear; `open` leaves the crown's hair drawn (circlets, bands) */
  head?: (g: Gfx, P: Pal) => void;
  open?: boolean;
  /** held item, drawn in front; `hold` = how far forward the near hand reaches to carry it (px) */
  held?: (g: Gfx, P: Pal, hand: number, phase: Phase) => void;
  hold?: number;
  /** item on the far arm, between the body and the near arm (shields) */
  farHeld?: (g: Gfx, P: Pal, swing: number, phase: Phase) => void;
}

export const SIDE: Record<string, SideGear> = {
  warden: {
    head: (g) => {
      // plume crest front to back, the dome, a gold brow band, neck guard behind, cheek guard and nasal in front
      g.poly([[9, 8], [10, 4], [13, 1.5], [17, 1.5], [20, 3.5], [21, 7], [18, 5], [14, 4], [11, 6]], BL[1]);
      g.line(10, 4, 13, 2, BL[0]); g.line(13, 2, 17, 2, BL[0]); g.line(18, 5, 21, 7, BL[2]);
      g.ell(15.5, 10, 8.4, 6.4, ST[2]); g.ell(15, 9.6, 7.8, 5.8, ST[1]); g.ell(12.5, 7.4, 3.8, 2.4, ST[0]);
      g.x.clearRect(0, 13, 32, 27);
      g.r(7, 11, 17, 2, GO[1]); g.r(7, 11, 17, 1, GO[0]);
      band(g, 7, 13, 4, 5, ST); g.r(7, 17, 4, 1, ST[2]);
      band(g, 15, 13, 3, 5, ST);
      g.r(23, 12, 2, 4, ST[1]); g.p(23, 12, ST[0]); g.p(24, 15, ST[2]);
    },
    farHeld: (g, _P, swing, ph) => {
      // the rime shield held forward, seen edge-on: steel rim, a sliver of the blue face, the gold boss standing out
      const x = 21 + Math.round(swing / 2), y = 20 + bob(ph);
      g.r(x, y, 3, 17, ST[2]); g.r(x, y + 1, 1, 15, ST[1]); g.r(x, y, 3, 1, ST[0]);
      g.r(x + 2, y + 1, 1, 15, BL[1]); g.p(x + 2, y + 1, BL[0]); g.p(x + 2, y + 15, BL[2]);
      g.p(x + 3, y + 8, GO[0]); g.p(x + 3, y + 9, GO[1]);
    },
  },
  arcanist: {
    head: (g) => {
      // the wide brim seen edge-on, the cone, its tip curling back with the lantern hanging from it
      g.ell(15.5, 12, 11.6, 2.2, RR[2]); g.ell(15.5, 11.4, 11, 1.6, RR[1]); g.r(6, 11, 9, 1, RR[0]);
      g.poly([[8, 11], [12.5, 2.5], [22, 11]], RR[1]); g.poly([[17, 11], [12.5, 2.5], [22, 11]], RR[2]);
      g.line(10, 10, 12, 4, RR[0]);
      g.poly([[13, 3.5], [11, 1], [7, 0.5], [3, 2.5], [6, 2], [10, 2.6]], RR[1]); g.line(11, 1, 7, 1, RR[0]);
      g.r(11, 9, 9, 2, GO[1]); g.r(11, 9, 9, 1, GO[0]); g.p(19, 9, '#ff7a2a'); g.p(18, 9, '#ffd36a');
      g.line(3, 3, 3, 5, '#3a2a4a'); g.r(1, 6, 5, 5, '#3a2a4a'); g.r(2, 7, 3, 3, '#ffd36a'); g.p(3, 7, '#fff0b0'); g.r(1, 5, 5, 1, '#5a4470');
    },
    hold: 6,
    held: (g, _P, hand, ph) => {
      // the ember staff carried upright in front, orb above the brow line; its top sways against the stride
      const x = 25 + hand - 6, b = bob(ph), t = tilt(ph);
      g.line(x + t, 10 + b, x, 37, '#c4834a'); g.line(x + 1 + t, 10 + b, x + 1, 37, '#7d4a2a'); g.r(x - 1 + t, 9 + b, 4, 2, GO[1]);
      g.disc(x + 0.5 + t, 5.5 + b, 3, '#ff7a2a'); g.disc(x + t, 5 + b, 1.8, '#ffd36a'); g.p(x - 1 + t, 4 + b, '#ffffff');
      g.p(x + 1 + t, 1 + b, '#ffb03a'); g.p(x - 1 + t, 0 + b, '#ff7a2a');
    },
  },
  huntsman: {
    head: (g) => {
      // a leather cap: crown, banded brim with a peak forward, the near earflap, the tail behind
      g.poly([[9, 6], [4, 9], [2, 13], [6, 10], [9, 9]], CAP[2]); g.p(2, 12, '#efe6cf'); g.p(3, 12, '#efe6cf');
      g.ell(15.5, 9, 8.2, 4.8, CAP[1]); g.ell(14.5, 8, 6.4, 3.4, CAP[0]);
      g.x.clearRect(0, 12, 32, 28);
      g.r(7, 11, 16, 3, CAP[2]); g.r(7, 11, 16, 1, CAP[1]);
      g.poly([[22, 11], [26, 12], [26, 13.5], [22, 14]], CAP[2]); g.line(22, 11, 26, 12, CAP[1]);
      band(g, 13, 14, 3, 6, [CAP[0], CAP[1], CAP[3]]);
    },
    hold: 4,
    held: (g, _P, hand, ph) => {
      // the crossbow at the hip, pointing the way he walks; it dips on each footfall
      const x = 18 + hand - 4, y = 27 + (ph === 'a' || ph === 'b' ? 1 : 0) + bob(ph);
      g.r(x, y, 10, 2, '#8a4f2a'); g.r(x, y, 10, 1, '#b06a38');
      g.line(x + 9, y - 5, x + 9, y + 6, '#5a5f7a'); g.line(x + 10, y - 5, x + 10, y + 6, '#8a90a8');
      g.line(x + 9, y - 5, x + 4, y, '#fff1cf'); g.line(x + 9, y + 6, x + 4, y + 1, '#fff1cf');
      g.r(x + 9, y, 3, 1, '#e8c98f'); g.p(x + 12, y, '#d3ddff');
    },
  },
};

/** Fallback headgear: the class's front hat squeezed from 21 to 13 columns, set back over the skull. */
export function squeezedHead(cls: string, P: Pal): HTMLCanvasElement | null {
  const mv = M(), C = mv.HERO[cls];
  if (!C?.head) return null;
  const src = mv.G(32, 40), out = mv.G(32, 40);
  C.head(src, P);
  for (let x = 0; x < 13; x++) out.x.drawImage(src.c, 6 + Math.round((x * 20) / 12), 0, 1, 40, 9 + x, 0, 1, 40);
  return out.c;
}
