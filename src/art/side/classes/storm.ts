/** Side-view gear, school of Storm: stormlancer, sparkwright. Owner: Claude 4. Contract and conventions: ../gear.ts. */
import { band, bob, tilt, type Gfx, type SideGear } from '../kit';

const N = ['#8a9ad8', '#4a5aa8', '#2a3470'];
const B = ['#ffe27a', '#d9a03a', '#8a5a1a'];

/** art.js helmDome in profile: the dome a touch longer front to back, cleared under the brow */
function dome(g: Gfx, c: string[]): void {
  g.ell(15.5, 10, 8.4, 6.4, c[2]); g.ell(15, 9.6, 7.8, 5.8, c[1]); g.ell(12.5, 7.4, 3.8, 2.4, c[0]);
  g.x.clearRect(0, 13, 32, 27);
}

const storm: Record<string, SideGear> = {
  stormlancer: {
    head: (g) => {
      dome(g, N);
      // the white wing crest swept back off the crown, a lightning stroke down the near side, the dark brow band
      g.poly([[16, 3], [12, 1], [6, 1.5], [2, 4], [3, 7], [7, 5], [12, 4.5]], '#ffffff');
      g.line(5, 3, 12, 2, '#ffe14a'); g.line(4, 6, 10, 5, '#dfe7f5');
      g.p(17, 6, '#ffe14a'); g.p(16, 7, '#ffe14a'); g.p(17, 8, '#ffe14a'); g.p(16, 9, '#ffe14a');
      g.r(7, 11, 18, 2, N[2]); g.r(7, 11, 18, 1, N[1]);
    },
    hold: 6,
    held: (g, _P, hand, ph) => {
      // the lance carried upright, steel head high, the yellow pennant streaming back and flicking on the pass
      const x = 25 + hand - 6, b = bob(ph), t = tilt(ph), f = b ? 1 : 0;
      g.line(x + t, 8 + b, x, 37, '#c4834a'); g.line(x + 1 + t, 8 + b, x + 1, 37, '#7d4a2a');
      g.poly([[x + 0.5 + t, 0 + b], [x + 2.5 + t, 4 + b], [x + 0.5 + t, 7.5 + b], [x - 1.5 + t, 4 + b]], '#d3ddff');
      g.line(x + t, 1 + b, x - 1 + t, 4 + b, '#ffffff');
      g.r(x - 1 + t, 8 + b, 4, 1, '#ffe14a');
      g.poly([[x + t, 9 + b], [x - 5 + t, 10 + b + f], [x - 6 + t, 12 + b + f], [x + t, 12 + b]], '#ffe14a');
      g.line(x - 1 + t, 10 + b, x - 5 + t, 11 + b + f, '#fffbd0');
    },
  },
  sparkwright: {
    open: true,
    head: (g) => {
      // goggles pushed up on the brow: the strap round the skull, the near lens on the side of the head
      // (the lens sits up on the brow, above the eye, so it doesn't read as an eye-patch)
      g.r(8, 10, 15, 1, '#6b3a20'); g.r(8, 9, 15, 1, '#8a4f2a');
      g.disc(19.5, 9.5, 2.3, '#d9a03a'); g.disc(19.5, 9.5, 1.2, '#7fe3ff'); g.p(19, 9, '#ffffff'); g.r(21, 8, 2, 3, '#b8661a');
    },
    back: (g, _P, ph) => {
      // the brass pack on the back, its copper coil-mast, and the spark crackling on top (it jumps each step)
      const b = bob(ph), s = ph === 'a' || ph === 'pass2' ? 1 : -1;
      band(g, 6, 21 + b, 6, 10, B); g.r(6, 23 + b, 6, 1, '#e07a3a'); g.r(6, 27 + b, 6, 1, '#e07a3a');
      g.r(8, 6 + b, 2, 15, '#a84a1a'); g.r(8, 6 + b, 1, 15, '#e07a3a');
      for (let y = 9; y < 20; y += 3) g.r(7, y + b, 4, 1, '#e07a3a');
      g.disc(8.5, 4.5 + b, 2, '#ffe14a'); g.p(8, 4 + b, '#fffbd0');
      g.p(8 + 3 * s, 2 + b, '#fffbd0'); g.p(8 - 2 * s, 1 + b, '#ffe14a');
    },
    held: (g, _P, _hand, _ph, swing) => {
      // the wrench hanging from the swinging near hand, jaw down
      const x = 15 + swing, y = 31, d = Math.sign(swing);
      g.line(x, y, x + d, y + 5, '#b9c6e0');
      g.r(x - 1 + d, y + 5, 3, 2, '#b9c6e0'); g.p(x + d, y + 6, '#62759a');
    },
  },
};

export default storm;
