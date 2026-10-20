/** Side-view gear, school of Rime: rimecaller, warden. Owner: Claude 5. Contract and conventions: ../gear.ts. */
import { GO, ST, band, bob, tilt, type SideGear } from '../kit';

const BL = ['#5aaeff', '#2f74e0', '#1f469c'];

const rime: Record<string, SideGear> = {
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
  rimecaller: {
    open: true,
    head: (g) => {
      // the ice crown: three shards along the circlet, the tallest in the middle, a blue gem at the brow
      ([[11, 3, 11, 1.4], [15.5, 0.5, 11, 1.8], [20, 3, 11, 1.4]] as const).forEach(([x, top, bot, w]) => {
        g.poly([[x, top], [x + w, (top + bot) / 2], [x, bot], [x - w, (top + bot) / 2]], '#7fe3ff'); g.line(x, top + 1, x, bot - 1, '#e8fbff');
      });
      g.r(8, 12, 15, 1, '#e8f0ff'); g.r(8, 13, 15, 1, '#9aa6c8'); g.r(21, 12, 2, 2, '#3fa9e8');
    },
    hold: 6,
    held: (g, _P, hand, ph) => {
      // the frost staff carried upright, its crystal above the brow line; it sways against the stride
      const x = 19 + hand, b = bob(ph), t = tilt(ph);
      g.line(x + t, 15 + b, x, 37, '#e8f0ff'); g.line(x + 1 + t, 15 + b, x + 1, 37, '#9aa6c8');
      g.poly([[x + 0.5 + t, 4 + b], [x + 4 + t, 9.5 + b], [x + 0.5 + t, 15 + b], [x - 3 + t, 9.5 + b]], '#7fe3ff');
      g.poly([[x + 0.5 + t, 4 + b], [x + 0.5 + t, 15 + b], [x + 4 + t, 9.5 + b]], '#3fa9e8');
      g.line(x - 1 + t, 7 + b, x - 2 + t, 9 + b, '#e8fbff'); g.p(x + t, 6 + b, '#ffffff'); g.p(x - 4 + t, 16 + b, '#e8fbff');
    },
  },
};

export default rime;
