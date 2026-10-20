/** Side-view gear, school of Blade: swordsman, samurai. Owner: Claude 2. Contract and conventions: ../gear.ts. */
import { GO, bob, tilt, type Gfx, type SideGear } from '../kit';

const BLADE = ['#f2f6ff', '#d3ddff', '#b9c6e0', '#7a88aa'];
const STRAW = ['#e8c98f', '#c8a060', '#a8803a'];

/**
 * an upright longsword carried in front, centred at x `hx` (the hand's reach + 5, clear of the face at x 19–24, as the
 * prototype's staff): 3-wide blade above a gold guard, the grip, a pommel below
 */
export function uprightSword(g: Gfx, hx: number, top: number, b: number, t: number): void {
  const x = hx - 1;
  g.r(x + t, top + b, 3, 26 - top, BLADE[2]); g.r(x + t, top + b, 1, 26 - top, BLADE[0]); g.r(x + 2 + t, top + b, 1, 26 - top, BLADE[3]);
  g.r(x + 1 + t, top + 2 + b, 1, 22 - top, BLADE[1]); g.p(x + 1 + t, top - 1 + b, BLADE[0]);
  g.r(x - 2, 26 + b, 7, 2, GO[1]); g.r(x - 2, 26 + b, 7, 1, GO[0]);
  g.r(x, 28 + b, 3, 4, '#5e3220'); g.disc(x + 1, 33 + b, 1.4, GO[1]);
}

const blade: Record<string, SideGear> = {
  // bare-headed (the hair shows); his red cloak is the sampled one
  swordsman: {
    hold: 6,
    held: (g, _P, hand, ph) => uprightSword(g, 20 + hand, 4, bob(ph), tilt(ph)),
  },
  samurai: {
    head: (g) => {
      // the jingasa edge-on: a wide shallow cone over the skull, its peak a little back, a red cord to the chin
      g.poly([[2, 13], [8, 9], [13, 5.5], [15.5, 4.8], [18, 5.5], [23, 9], [29, 13]], STRAW[1]);
      g.poly([[2, 13], [8, 9], [13, 5.5], [15.5, 4.8], [15.5, 13]], STRAW[0]);
      g.r(2, 13, 28, 1, STRAW[2]);
      g.line(6, 12, 13, 6, STRAW[1]); g.line(18, 6, 25, 11, STRAW[2]); g.p(15, 5, '#fff1cf');
      g.line(20, 14, 21, 19, '#d63447');
    },
    hold: 4,
    held: (g, _P, hand, ph) => {
      // the katana held low, edge up, the blade forward and up clear of the face
      const x = 17 + hand, y = 30 + bob(ph), t = tilt(ph);
      g.line(x - 2, y + 2, x, y, '#2b2145'); g.line(x - 2, y + 3, x, y + 1, '#5a3a8a');
      g.r(x, y - 1, 3, 2, GO[1]);
      g.line(x + 2, y - 2, x + 7 + t, y - 13, BLADE[0]); g.line(x + 3, y - 2, x + 8 + t, y - 12, BLADE[2]);
    },
    // the scabbard slung at the back hip (not a cloak)
    back: (g) => { g.line(4, 33, 13, 27, '#2b2145'); g.line(4, 34, 13, 28, '#1a1230'); g.p(13, 27, GO[1]); },
  },
};

export default blade;
