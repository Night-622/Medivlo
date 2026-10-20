/** Side-view gear, school of Radiance: cantor, oathbound. Owner: Claude 4. Contract and conventions: ../gear.ts. */
import { GO, bob, tilt, type Gfx, type SideGear } from '../kit';

/** art.js helmDome in profile: the dome a touch longer front to back, cleared under the brow */
function dome(g: Gfx, c: string[]): void {
  g.ell(15.5, 10, 8.4, 6.4, c[2]); g.ell(15, 9.6, 7.8, 5.8, c[1]); g.ell(12.5, 7.4, 3.8, 2.4, c[0]);
  g.x.clearRect(0, 13, 32, 27);
}

const radiance: Record<string, SideGear> = {
  oathbound: {
    head: (g) => {
      // the gold dome, the white brow band with the blue stone at the front, the near wing swept back
      dome(g, GO);
      g.r(7, 11, 18, 2, '#e2e8f6'); g.r(23, 11, 2, 2, '#7fe3ff'); g.p(24, 12, '#3fa9ff');
      g.poly([[12, 9], [6, 3], [2, 2], [4, 5], [1, 7], [5, 8], [3, 11], [11, 12]], '#ffffff');
      g.line(4, 4, 10, 9, '#c9d3ea'); g.line(3, 8, 10, 10, '#c9d3ea');
    },
    hold: 5,
    held: (g, _P, hand, ph) => {
      // the warhammer carried upright, its steel head with the gold band riding above the brow
      const x = 24 + hand - 5, b = bob(ph), t = tilt(ph);
      g.line(x + t, 12 + b, x, 37, '#c4834a'); g.line(x + 1 + t, 12 + b, x + 1, 37, '#7d4a2a');
      g.r(x - 3 + t, 6 + b, 8, 6, '#a9bbd6'); g.r(x - 3 + t, 6 + b, 8, 1, '#eef4ff'); g.r(x - 3 + t, 11 + b, 8, 1, '#62759a');
      g.r(x + t, 6 + b, 2, 6, GO[1]); g.p(x + 5 + t, 5 + b, '#fff6c8');
    },
  },
  cantor: {
    open: true,
    head: (g) => {
      // the halo, tilted edge-on above the crown
      g.ell(15.5, 2.5, 5.5, 1.6, GO[1]); g.ell(15.5, 2.2, 5, 1.1, GO[0]); g.ell(15.5, 2.6, 3.6, 0.6, null, true);
    },
    held: (g, _P, _hand, _ph, swing) => {
      // the censer on its chain, swinging from the near hand a beat behind the arm, a thread of smoke above it
      const hx = 15 + swing, hy = 32, cx = hx - Math.sign(swing), cy = 36;
      g.line(hx, hy, cx, cy - 2, '#c9d3ea');
      g.disc(cx + 0.5, cy, 2.2, GO[1]); g.p(cx, cy - 1, GO[0]); g.p(cx + 1, cy + 1, GO[2]);
      g.p(cx + 2, cy - 4, '#fff6c8'); g.p(cx + 3, cy - 6, '#fff6c8');
    },
  },
};

export default radiance;
