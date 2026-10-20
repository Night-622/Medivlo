/** Side-view gear, school of Ash: arcanist, reaver. Owner: Claude 5. Contract and conventions: ../gear.ts. */
import { GO, bob, tilt, type SideGear } from '../kit';

const RR = ['#ff6a6a', '#d63447', '#8a1f45'], RK = ['#ff5a5a', '#c02a3a', '#7d1d2d'];

const ash: Record<string, SideGear> = {
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
  reaver: {
    open: true,
    head: (g) => {
      // the Red Muster headband, its tails streaming back
      g.r(7, 11, 17, 2, RK[1]); g.r(7, 11, 17, 1, RK[0]);
      g.poly([[8, 11], [3, 13], [2, 17], [5, 15], [8, 13]], RK[1]); g.poly([[8, 12], [4, 16], [5, 18], [9, 13]], RK[2]);
    },
    hold: 4,
    held: (g, _P, hand, ph) => {
      // the great axe carried upright ahead of the face: crescent blade forward with its ember edge, spike behind, gold collar
      const x = 21 + hand, b = bob(ph), t = tilt(ph);
      g.line(x + t, 4 + b, x, 35 + b, '#8a4f2a'); g.line(x + 1 + t, 4 + b, x + 1, 35 + b, '#5e3220');
      g.poly([[x + 2 + t, 2 + b], [x + 5 + t, 0.5 + b], [x + 6.6 + t, 5 + b], [x + 5 + t, 11 + b], [x + 2 + t, 9 + b]], '#b9c6e0');
      g.line(x + 5 + t, 1 + b, x + 6 + t, 5 + b, '#f2f6ff'); g.line(x + 6 + t, 5 + b, x + 5 + t, 10 + b, '#f2f6ff'); g.line(x + 4 + t, 2 + b, x + 5 + t, 6 + b, '#ff9a2e');
      g.poly([[x - 1 + t, 4 + b], [x - 3 + t, 5 + b], [x - 1 + t, 7 + b]], '#7a88aa');
      g.r(x - 1 + t, 3 + b, 3, 2, GO[1]); g.r(x - 1, 28 + b, 3, 2, '#5e3220');
    },
  },
};

export default ash;
