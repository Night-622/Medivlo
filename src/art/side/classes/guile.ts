/** Side-view gear, school of Guile: jester, corsair. Owner: Claude 2. Contract and conventions: ../gear.ts. */
import { GO, bob, tilt, type Phase, type SideGear } from '../kit';

const BLADE = ['#f2f6ff', '#b9c6e0'];
/** where each of the three juggled balls is on its loop, per stride phase (they turn over as he walks) */
const TURN: Record<Phase, number> = { idle: 0, a: 0, pass: 1, b: 2, pass2: 3 };

const guile: Record<string, SideGear> = {
  jester: {
    head: (g) => {
      // the motley cap in profile: the crown, the yellow band, the blue horn curling forward and the red one back, bells
      g.ell(15.5, 9, 8, 3.5, '#a8203a');
      g.r(8, 10, 16, 3, '#ffd84a'); g.r(8, 10, 16, 1, '#fff0a0');
      g.poly([[9, 11], [14, 9], [9, 3], [3, 1], [1, 6], [5, 4]], '#d63447'); g.disc(2, 7, 1.5, '#ffd84a');
      g.poly([[22, 11], [17, 8], [22, 3], [27, 1], [29, 5], [26, 4]], '#2f74e0'); g.disc(28.5, 6, 1.5, '#ffd84a');
    },
    hold: 4,
    held: (g, _P, hand, ph) => {
      // three balls juggled in front of him, each a step further round its loop every frame (clear of the face)
      const x = 19 + hand, k = TURN[ph];
      const loop: [number, number][] = [[x + 2, 24], [x + 4, 19], [x + 1, 15], [x - 2, 19]];
      ['#ffd84a', '#4fd86a', '#d63447'].forEach((c, i) => { const [bx, by] = loop[(k + i) % 4]; g.disc(bx, by + bob(ph), 1.6, c); });
    },
  },
  corsair: {
    head: (g) => {
      // the tricorn in profile: a high back point, the front point over the brow, gold trim, a white plume behind
      g.poly([[5, 11], [9, 6], [15.5, 4], [21, 5], [25, 9], [21, 10], [15.5, 9], [9, 10]], '#2b2145');
      g.poly([[9, 6], [15.5, 4], [15.5, 7], [11, 8]], '#3d3060');
      g.line(5, 11, 9, 10, GO[1]); g.line(9, 10, 15.5, 9, GO[1]); g.line(15.5, 9, 21, 10, GO[1]); g.line(21, 10, 25, 9, GO[1]);
      g.poly([[13, 5], [6, 1], [3, 2], [10, 6]], '#ffffff'); g.line(12, 5, 5, 2, '#dfe7f5');
    },
    hold: 4,
    held: (g, _P, hand, ph) => {
      // the cutlass held low: the gold guard at the fist, the curved blade forward and up clear of the chin
      const x = 17 + hand, y = 30 + bob(ph), t = tilt(ph);
      g.disc(x, y, 1.7, GO[1]);
      g.line(x + 1, y - 1, x + 5 + t, y - 8, BLADE[0]); g.line(x + 2, y - 1, x + 6 + t, y - 7, BLADE[1]);
      g.line(x + 5 + t, y - 8, x + 5 + t, y - 11, BLADE[0]); g.p(x + 6 + t, y - 10, BLADE[1]);
    },
  },
};

export default guile;
