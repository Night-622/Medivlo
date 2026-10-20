/** Side-view gear, school of the Fist: monk, brawler. Owner: Claude 2. Contract and conventions: ../gear.ts. */
import { bob, type SideGear } from '../kit';

const fist: Record<string, SideGear> = {
  monk: {
    open: true,
    head: (g) => {
      // the red headband round the brow, its knot at the back and two tails flying behind
      g.r(8, 11, 16, 2, '#d63447'); g.r(8, 11, 16, 1, '#ff6a6a');
      g.poly([[9, 11], [3, 9], [2, 12], [8, 13]], '#d63447'); g.poly([[9, 12], [4, 15], [5, 17], [9, 13]], '#a8203a');
    },
    // the bo staff slung across the back, a diagonal behind the shoulders (not a cloak); the far end bobs with the step
    back: (g, _P, ph) => {
      const b = bob(ph);
      g.line(4, 31, 21, 20 + b, '#c4834a'); g.line(4, 32, 21, 21 + b, '#7d4a2a');
      g.p(4, 31, '#ffd84a'); g.p(21, 20 + b, '#ffd84a');
    },
  },
  brawler: {
    open: true,
    head: (g) => { g.r(8, 12, 16, 1, '#ffffff'); g.p(7, 12, '#e6e9f5'); g.r(6, 13, 2, 2, '#e6e9f5'); },
    hold: 3,
    held: (g, _P, hand, ph) => {
      // the near glove at the fist, carried in a guard at chest height
      const x = 15 + hand - 3, y = 25 + bob(ph);
      g.rr(x, y, 6, 6, '#d63447', 1); g.r(x + 1, y + 1, 2, 2, '#ff8a8a'); g.r(x + 1, y + 5, 4, 1, '#ffffff'); g.r(x + 5, y + 1, 1, 4, '#8a1f45');
    },
    farHeld: (g, _P, swing, ph) => {
      // the far glove, a step behind and in shade
      const x = 15 + Math.round(swing / 2), y = 24 + bob(ph);
      g.rr(x, y, 6, 6, '#a8203a', 1); g.r(x + 1, y + 1, 2, 2, '#d63447'); g.r(x + 1, y + 5, 4, 1, '#d8dce8');
    },
  },
};

export default fist;
