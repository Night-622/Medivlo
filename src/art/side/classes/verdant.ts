/** Side-view gear, school of Verdant: hedgewitch, ranger. Owner: Claude 4. Contract and conventions: ../gear.ts. */
import { bob, tilt, type Gfx, type SideGear } from '../kit';

/** art.js hood in profile, its point hanging back: the cowl round the skull, open at the face */
function hood(g: Gfx, c: string[]): void {
  g.ell(15, 11.5, 9, 9.5, c[2]); g.ell(14.5, 11, 8.4, 8.9, c[1]); g.ell(12, 6.5, 4, 3, c[0]);
  g.poly([[9, 6], [3, 3], [5, 11]], c[1]); g.line(4, 4, 6, 9, c[0]);
  g.ell(20.5, 15, 5, 6.2, null, true); // a generous face opening: the face must read in profile
  g.r(7, 16, 5, 6, c[2]); g.r(7, 16, 1, 6, c[1]);
  g.x.clearRect(0, 22, 32, 18);
}

const verdant: Record<string, SideGear> = {
  ranger: {
    head: (g) => {
      hood(g, ['#8ef06a', '#3fae4c', '#1f6a44']);
      g.p(13, 8, '#ffd84a'); g.p(12, 9, '#8ef06a'); g.p(14, 9, '#8ef06a'); // the leaf pin
    },
    keepCloak: true,
    back: (g, _P, ph) => {
      // walking, the longbow is slung across the back (held in front it hid the face in profile): the stave a diagonal
      // arc from the shoulder down behind the hip, its string taut, the quiver beside it with fletchings at the shoulder
      const b = bob(ph);
      for (let s = 0; s <= 1; s += 0.02) {
        const x = 15 - 11 * s - 2.5 * Math.sin(Math.PI * s), y = 11 + 24 * s + b;
        g.p(x, y, '#d9955a'); g.p(x + 1, y, '#7a4526');
      }
      g.line(15, 11 + b, 4, 35 + b, '#fff1cf'); g.p(15, 10 + b, '#ffd84a'); g.p(4, 36 + b, '#ffd84a'); g.r(7, 22 + b, 2, 3, '#3fae4c');
      g.line(8, 30 + b, 12, 16 + b, '#7a4526'); g.line(9, 30 + b, 13, 16 + b, '#b06a38');
      g.line(12, 16 + b, 11, 12 + b, '#e8c98f'); g.line(13, 16 + b, 14, 12 + b, '#e8c98f');
      g.p(11, 11 + b, '#ff5a6a'); g.p(10, 11 + b, '#ffffff'); g.p(14, 11 + b, '#ff5a6a'); g.p(15, 11 + b, '#ffffff');
    },
  },
  hedgewitch: {
    open: true,
    head: (g) => {
      // the green band, twig antlers rising front and back, a pink bloom at the front and a white one behind
      const T = '#8a5a3a';
      g.r(8, 10, 16, 2, '#3fae4c'); g.r(8, 10, 16, 1, '#8ef06a');
      [[11, 10, 9, 4], [9, 6, 7, 5], [9, 4, 10, 1], [20, 10, 22, 4], [22, 6, 24, 5], [22, 4, 21, 1]].forEach(([a, b, c, d]) => g.line(a, b, c, d, T));
      [[10, 0], [21, 0], [6, 4], [25, 4]].forEach(([x, y]) => g.p(x, y, '#8ef06a'));
      g.p(21, 9, '#ff79a8'); g.p(20, 9, '#ff79a8'); g.p(22, 9, '#ff79a8'); g.p(21, 8, '#ff79a8'); g.p(21, 9, '#ffd84a');
      g.p(11, 9, '#fff6e8'); g.p(10, 9, '#fff6e8'); g.p(11, 8, '#fff6e8'); g.p(11, 9, '#ffd84a');
      g.p(27, 2, '#7ff5e0');
    },
    hold: 6,
    held: (g, _P, hand, ph) => {
      // the crooked staff carried upright, the jar-lantern hanging plumb from its hook
      const x = 25 + hand - 6, b = bob(ph), t = tilt(ph);
      g.line(x + t, 12 + b, x, 37, '#8a5a3a'); g.line(x + 1 + t, 12 + b, x + 1, 37, '#5e3a22');
      g.line(x + t, 12 + b, x + 1 + t, 8 + b, '#8a5a3a'); g.line(x + 1 + t, 8 + b, x + 4 + t, 7 + b, '#8a5a3a'); g.line(x + 4 + t, 7 + b, x + 4 + t, 9 + b, '#8a5a3a');
      const jx = x + 3, jy = 10 + b;
      g.p(jx + 1, jy, '#3a2a4a'); g.r(jx, jy + 1, 3, 4, '#d8f4ff'); g.r(jx + 1, jy + 2, 1, 2, '#b8f57a'); g.r(jx, jy + 1, 3, 1, '#8a5a3a');
    },
  },
};

export default verdant;
