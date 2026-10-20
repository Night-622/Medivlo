/** Side-view gear, school of Iron: knight, juggernaut. Owner: Claude 2. Contract and conventions: ../gear.ts. */
import { ST, band, bob, tilt, type SideGear } from '../kit';
import { uprightSword } from './blade';

const IRON = ['#8a90a8', '#5a5f7a', '#33364a'];
const SLIT = '#1a1230';

const iron: Record<string, SideGear> = {
  knight: {
    head: (g) => {
      // a flat-topped great helm: the box, the eye slit forward, breaths below it, the red crest trailing back
      g.rr(8, 4, 16, 18, ST[2], 3); g.rr(8, 4, 15, 17, ST[1], 3); g.r(9, 5, 4, 14, ST[0]);
      g.r(17, 13, 7, 2, SLIT); g.p(21, 17, SLIT); g.p(21, 19, SLIT); g.p(19, 18, SLIT);
      g.r(23, 6, 1, 14, ST[2]);
      g.poly([[16, 3.5], [10, 2], [4, 4], [3, 7], [8, 5], [14, 5]], '#d63447'); g.line(15, 3, 6, 3, '#ff7a6a'); g.disc(16, 3, 2, '#e84a4a');
    },
    farHeld: (g, _P, swing, ph) => {
      // the red heater shield edge-on on the far arm: gold-rimmed, a sliver of its face, the point below
      const x = 20 + Math.round(swing / 2), y = 21 + bob(ph);
      g.r(x, y, 3, 13, '#d63447'); g.r(x, y, 1, 13, '#ffd84a'); g.r(x + 2, y, 1, 13, '#b8661a');
      g.p(x + 1, y + 13, '#d63447'); g.r(x + 1, y + 4, 1, 4, '#ffd84a');
    },
    hold: 6,
    held: (g, _P, hand, ph) => uprightSword(g, 20 + hand, 11, bob(ph), tilt(ph)),
  },
  juggernaut: {
    head: (g) => {
      // the spiked dome: spikes along the crown, the brow band, cheek guard forward with the ember eye, neck guard behind
      g.ell(15.5, 10, 8.4, 6.6, IRON[2]); g.ell(15, 9.6, 7.8, 5.9, IRON[1]); g.ell(12.5, 7.5, 3.6, 2.4, IRON[0]);
      g.x.clearRect(0, 13, 32, 27);
      [9, 13, 17].forEach((x) => g.poly([[x, 4.5], [x + 1, 1], [x + 2.5, 4]], '#d3ddff'));
      g.r(7, 11, 17, 2, IRON[2]);
      band(g, 7, 13, 4, 6, IRON); band(g, 19, 13, 5, 8, IRON);
      g.p(21, 15, '#ff9a2e'); g.p(22, 15, '#ffb84a');
    },
    hold: 6,
    held: (g, _P, hand, ph) => {
      // the warhammer carried upright: the haft from the fist to above the helm, the iron head across it, an ember band
      const x = 20 + hand, b = bob(ph), t = tilt(ph); // in front of the face, as the prototype's staff
      g.line(x + t, 7 + b, x, 36, '#6b3a20'); g.line(x + 1 + t, 7 + b, x + 1, 36, '#3a2214');
      g.rr(x - 4 + t, 1 + b, 10, 6, IRON[1], 1); g.r(x - 3 + t, 2 + b, 8, 1, IRON[0]); g.r(x - 4 + t, 6 + b, 10, 1, IRON[2]);
      g.r(x + t, 1 + b, 2, 6, '#ff9a2e');
    },
  },
};

export default iron;
