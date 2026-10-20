/** Side-view gear, school of the Hunt: huntsman, falconer. Owner: Claude 5. Contract and conventions: ../gear.ts. */
import { band, bob, dip, type SideGear } from '../kit';

const CAP = ['#d9c4a0', '#a8906a', '#8a6a4a', '#6e5a40'];

const hunt: Record<string, SideGear> = {
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
      const x = 18 + hand - 4, y = 27 + dip(ph) + bob(ph);
      g.r(x, y, 10, 2, '#8a4f2a'); g.r(x, y, 10, 1, '#b06a38');
      g.line(x + 9, y - 5, x + 9, y + 6, '#5a5f7a'); g.line(x + 10, y - 5, x + 10, y + 6, '#8a90a8');
      g.line(x + 9, y - 5, x + 4, y, '#fff1cf'); g.line(x + 9, y + 6, x + 4, y + 1, '#fff1cf');
      g.r(x + 9, y, 3, 1, '#e8c98f'); g.p(x + 12, y, '#d3ddff');
    },
  },
  falconer: {
    hold: 3,
    held: (g, _P, _hand, ph) => {
      // the gauntleted forearm held out ahead of the chest, the falcon perched on the fist, clear of the face
      const b = bob(ph), INK = '#1a1230';
      g.line(16, 29 + b, 24, 25 + b, '#b06a38'); g.line(16, 30 + b, 24, 26 + b, '#7a4526'); g.r(23, 24 + b, 4, 2, '#7a4526');
      g.poly([[24, 20 + b], [21, 26 + b], [24, 23 + b]], '#5a4a3a');
      g.ell(26, 20 + b, 2.2, 3.4, '#8a6a4a'); g.ell(26.7, 21 + b, 1.3, 2.2, '#e8d4b0'); g.line(24, 18 + b, 24, 22 + b, '#5a4a3a');
      g.disc(26.5, 15.5 + b, 1.8, '#5a4a3a'); g.p(28, 16 + b, '#ffd84a'); g.p(27, 15 + b, INK);
      g.p(25, 24 + b, '#ffd84a'); g.p(27, 24 + b, '#ffd84a');
    },
  },
};

export default hunt;
