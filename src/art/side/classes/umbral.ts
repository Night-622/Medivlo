/** Side-view gear, school of Umbral: duskweaver, shade. Owner: Claude 4. Contract and conventions: ../gear.ts. */
import { bob, tilt, type Gfx, type SideGear } from '../kit';

/** art.js hood in profile: the cowl round the skull, open at the face, its fall hanging behind the neck */
function hood(g: Gfx, c: string[]): void {
  g.ell(15, 11.5, 9, 9.5, c[2]); g.ell(14.5, 11, 8.4, 8.9, c[1]); g.ell(12, 6.5, 4, 3, c[0]);
  g.poly([[11, 4], [13, -0.5], [17, 3]], c[1]); g.line(12, 3, 13, 0, c[0]); // the peak, standing up
  g.ell(20.5, 14.5, 4.2, 5.6, null, true);
  g.r(7, 16, 5, 6, c[2]); g.r(7, 16, 1, 6, c[1]);
  g.x.clearRect(0, 22, 32, 18);
}

const umbral: Record<string, SideGear> = {
  shade: {
    head: (g) => {
      hood(g, ['#8a6ad0', '#5a3fa0', '#33236a']);
      // the cowl mask over mouth and nose, the violet band below it
      g.r(18, 17, 7, 3, '#2b2145'); g.r(18, 17, 7, 1, '#3d3060'); g.r(17, 20, 7, 1, '#1d1638');
      g.r(14, 20, 10, 2, '#a35cff'); g.r(14, 20, 10, 1, '#d9a0ff');
    },
    back: (g, _P, ph) => {
      // the two scarf tails streaming behind, longer on the pass
      const f = ph === 'pass' || ph === 'pass2' ? 1 : 0;
      g.poly([[13, 21], [6 - f, 19], [3 - f, 21], [7, 23], [5 - f, 26], [12, 24]], '#a35cff');
      g.line(12, 21, 5 - f, 20, '#d9a0ff');
    },
    held: (g, _P, _hand, _ph, swing) => {
      // a dagger in the near hand, point down and forward
      const x = 16 + swing, y = 31;
      g.line(x, y, x + 2, y + 4, '#e8c8ff'); g.line(x + 1, y, x + 3, y + 4, '#a35cff'); g.p(x, y - 1, '#d9a0ff');
    },
    farHeld: (g, _P, swing) => {
      // its twin in the far hand, a shade darker
      const x = 15 + Math.round(swing / 2), y = 31;
      g.line(x, y, x + 2, y + 4, '#a888cc'); g.line(x + 1, y, x + 3, y + 4, '#6a3aa0');
    },
  },
  duskweaver: {
    open: true,
    head: (g) => {
      // the silver circlet: a thin line round the head, high on the forehead and dipping toward the back, the violet
      // stone on the brow (a flat 2 px band to the face edge read as a visor)
      g.line(9, 12, 22, 10, '#e8f0ff'); g.p(9, 13, '#9aa6c8');
      g.disc(22.5, 10, 1.2, '#a35cff'); g.p(22, 9, '#f4d8ff');
    },
    back: (g) => {
      // the crescent moon halo behind the head: a bright arc round the back of the skull
      g.ell(10.5, 11, 6.5, 9.5, '#d9a0ff'); g.ell(10.5, 11, 5.5, 8.6, '#a35cff'); g.ell(13, 10, 5.5, 9.4, null, true);
    },
    hold: 4,
    held: (g, _P, hand, ph) => {
      // the orb floating just ahead of the near hand, bobbing against the stride, a ribbon of starlight under it
      const x = 22 + hand - 4, y = 27 + bob(ph) - tilt(ph);
      g.disc(x, y, 2.6, '#5a2ab0'); g.disc(x - 0.5, y - 0.5, 1.7, '#a35cff'); g.p(x - 1, y - 1, '#f4d8ff');
      g.line(x - 3, y + 3, x + 3, y + 1, '#d9a0ff'); g.p(x + 4, y - 3, '#e8f0ff');
    },
  },
};

export default umbral;
