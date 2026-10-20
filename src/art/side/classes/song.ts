/** Side-view gear, school of Song: bard, skald. Owner: Claude 4. Contract and conventions: ../gear.ts. */
import { bob, type Gfx, type SideGear } from '../kit';

/** art.js helmDome in profile: the dome a touch longer front to back, cleared under the brow */
function dome(g: Gfx, c: string[]): void {
  g.ell(15.5, 10, 8.4, 6.4, c[2]); g.ell(15, 9.6, 7.8, 5.8, c[1]); g.ell(12.5, 7.4, 3.8, 2.4, c[0]);
  g.x.clearRect(0, 13, 32, 27);
}

const song: Record<string, SideGear> = {
  bard: {
    head: (g) => {
      // the floppy cap slumped back over the skull, its gold feather sweeping back from the band
      g.ell(13.5, 8.5, 8.5, 4, '#8a4ae0'); g.ell(12.5, 7.8, 7.5, 3, '#c08aff');
      g.poly([[6, 8], [2, 11], [3, 13], [7, 11]], '#8a4ae0');
      g.x.clearRect(0, 12, 32, 28);
      g.r(8, 11, 15, 1, '#5a2aa8');
      g.poly([[16, 7], [5, 1], [4, 2], [14, 8]], '#ffd84a'); g.line(15, 7, 5, 2, '#e09a1e');
    },
    hold: 4,
    held: (g, _P, hand, ph) => {
      // the lute carried at the hip: round body in front, the neck angled forward and up
      const x = 21 + hand - 4, y = 29 + bob(ph);
      g.line(x, y - 1, x + 6, y - 7, '#8a4f2a'); g.line(x + 1, y - 1, x + 7, y - 7, '#5e3220');
      g.r(x + 6, y - 9, 3, 3, '#5e3220'); g.p(x + 9, y - 9, '#ffd84a');
      g.ell(x, y, 3.8, 3.4, '#a8622f'); g.ell(x - 0.5, y - 0.5, 3, 2.5, '#e8a868'); g.disc(x, y, 1, '#5e3220');
      g.line(x - 2, y + 1, x + 8, y - 8, '#fff1cf');
    },
  },
  skald: {
    head: (g) => {
      // the bronze dome with its nose-ridge, the near horn curling up and forward, the far horn behind and darker
      const Bz = ['#e8c08a', '#c09070', '#7a5a3a'];
      g.poly([[10, 9], [6, 6], [4, 1], [5, 5], [8, 10]], '#a8906a');
      dome(g, Bz);
      g.r(7, 11, 18, 2, Bz[2]); g.r(22, 6, 2, 7, Bz[0]); g.r(24, 11, 1, 4, Bz[1]);
      g.poly([[18, 9], [23, 6], [26, 1], [25, 5], [20, 10]], '#efe6cf'); g.p(26, 1, '#a8906a');
    },
    back: (g, _P, ph) => {
      // the round shield slung on the back below the hair, seen edge-on: the painted face showing as a crescent behind
      // the wooden rim, its cross-strap
      const b = bob(ph);
      g.ell(8, 27 + b, 3, 8, '#efe6cf'); g.r(9, 19 + b, 3, 16, '#a8622f'); g.r(9, 20 + b, 1, 14, '#d18a4a');
      g.line(6, 22 + b, 9, 31 + b, '#a8622f'); g.p(11, 27 + b, '#7a4526');
    },
    held: (g, _P, _hand, _ph, swing) => {
      // the axe in the swinging near hand, held short under the head: the blade forward at the hip, the haft below
      const x = 15 + swing, y = 30;
      g.line(x, y - 3, x + 1, y + 5, '#8a4f2a');
      g.poly([[x + 1, y - 3], [x + 5, y - 5], [x + 5, y], [x + 2, y - 1]], '#b9c6e0'); g.line(x + 5, y - 5, x + 5, y, '#f2f6ff');
    },
  },
};

export default song;
