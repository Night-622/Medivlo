/**
 * Side-view gear for the 14 atlas NPCs (MV.HERO entries with npc:1): maren, godric, nanbriar, odo, wil, pell, aldous,
 * rook, tamsin, hobb, ysolde, pip, corwin, sela. Owner: Claude 5. Contract and conventions: ../gear.ts. Their front
 * hats, held items (wf) and back pieces in profile; tall items stand ahead of the face (x 25+). Escorts use these
 * NPCs' sheets as stand-ins, so they are the NPCs that walk.
 */
import { M } from '../mvApi';
import { GO, bob, dip, tilt, type SideGear } from '../kit';
import { sideDome, sideHood } from '../shared/helms';

const FUR = ['#c9cfe0', '#8f97b0', '#5d6480'], WOOD = ['#8a5a3a', '#5e3a22'];
const INK = () => M().INK;

const npcs: Record<string, SideGear> = {
  maren: {
    head: (g) => {
      // the wolf-head hood: the hood, one ear up, the muzzle over the brow looking ahead
      sideHood(g, FUR); g.poly([[10, 6], [11, 1], [14, 4]], FUR[1]); g.p(11, 3, '#ff9ab0');
      g.poly([[15, 4], [21, 5], [25, 8], [24, 11], [16, 11]], FUR[0]); g.r(16, 10, 8, 1, FUR[1]);
      g.p(20, 7, INK()); g.p(24, 8, INK());
    },
    back: (g) => {
      // the bow across the back and the quiver, its fletchings over the shoulder
      g.line(3, 31, 11, 10, '#8a4f2a'); g.line(4, 31, 12, 10, '#5e3220'); g.line(4, 30, 11, 11, '#fff1cf');
      g.r(5, 15, 3, 11, '#7a4526'); g.r(5, 15, 1, 11, '#b06a38'); g.p(5, 13, '#ff5a6a'); g.p(7, 13, '#ffffff'); g.p(6, 12, '#ff5a6a');
    },
  },
  godric: {
    hold: 6,
    held: (g, _P, hand, ph) => {
      // the plain walking staff with its knob, carried upright ahead of him
      const x = 19 + hand, b = bob(ph), t = tilt(ph);
      g.line(x + t, 8 + b, x, 37, WOOD[0]); g.line(x + 1 + t, 8 + b, x + 1, 37, WOOD[1]);
      g.disc(x + 0.5 + t, 7 + b, 2.2, WOOD[0]); g.p(x + t, 6 + b, '#b07a4a');
    },
  },
  nanbriar: {
    head: (g) => {
      // the witch's hat: wide brim edge-on, the crooked cone bending back, a purple band with a flower
      g.ell(15.5, 12, 12, 2.2, '#5e3a22'); g.ell(15.5, 11.6, 11.5, 1.6, '#8a5a3a');
      g.poly([[9, 12], [11, 6], [13, 3], [10, 1], [7, 2], [11, 0], [16, 2], [20, 7], [22, 12]], '#8a5a3a');
      g.poly([[16, 2], [20, 7], [22, 12], [18, 12]], '#5e3a22');
      g.r(12, 6, 3, 2, '#a8503a'); g.r(8, 10, 14, 2, '#5f5090'); g.p(10, 10, '#ffd84a'); g.p(9, 9, '#8ef06a');
    },
    keepCloak: true,
    back: (g) => {
      // the black cat padding along ahead of her feet
      const k = INK();
      g.ell(27, 35, 3.5, 2, k); g.disc(30, 32, 1.8, k); g.p(29, 30, k); g.p(31, 30, k); g.p(31, 32, '#ffe14a'); g.line(23, 35, 22, 31, k);
    },
    hold: 4,
    held: (g, _P, hand, ph) => {
      // the ladle, held up in front
      const x = 19 + hand, b = bob(ph);
      g.line(x, 30 + b, x + 3, 23 + b, '#a8a8b8'); g.ell(x + 3.5, 22 + b, 2, 1.4, '#c9cfe0');
    },
  },
  odo: {
    hold: 4,
    held: (g, _P, hand, ph) => {
      // the smith's hammer held upright, the head ahead of the chin, an ember glint on its face
      const x = 21 + hand, b = bob(ph), t = tilt(ph);
      g.r(x, 22 + b, 2, 12, WOOD[0]); g.r(x + 1, 22 + b, 1, 12, WOOD[1]);
      g.r(x - 1 + t, 18 + b, 7, 5, '#5a5f7a'); g.r(x - 1 + t, 18 + b, 7, 1, '#8a90a8'); g.r(x - 1 + t, 22 + b, 7, 1, '#33364a');
      g.p(x + 5 + t, 19 + b, '#ff9a2e'); g.p(x + 6 + t, 20 + b, '#ffd36a');
    },
  },
  wil: {
    head: (g) => {
      // the floppy green cap: crown, its droop behind, a short peak, the white spots
      g.ell(15.5, 8.5, 8.6, 4.6, '#4fa36a'); g.ell(14.5, 7.8, 7.6, 3.6, '#6fc88a'); g.poly([[8, 8], [4, 11], [8, 12]], '#4fa36a');
      g.x.clearRect(0, 13, 32, 27);
      g.poly([[21, 9], [26, 10], [25, 12], [21, 12]], '#4fa36a');
      [[11, 7], [15, 6], [19, 8], [13, 9]].forEach(([x, y]) => g.p(x, y, '#ffffff'));
    },
    hold: 4,
    held: (g, _P, hand, ph) => {
      // the tray of two foaming mugs, carried level in front
      const x = 19 + hand, b = bob(ph) + dip(ph);
      g.r(x - 1, 27 + b, 9, 2, '#a9bbd6'); g.r(x - 1, 27 + b, 9, 1, '#eef4ff');
      g.r(x, 22 + b, 3, 5, '#d9955a'); g.r(x, 22 + b, 3, 1, '#ffffff'); g.r(x + 4, 23 + b, 3, 4, '#d9955a'); g.r(x + 4, 23 + b, 3, 1, '#ffffff');
      g.p(x + 3, 24 + b, '#a8622f'); g.p(x + 7, 25 + b, '#a8622f');
    },
  },
  pell: {
    head: (g) => {
      // the peddler's flat-crowned hat: brim edge-on, a blue band, a yellow feather
      g.ell(15.5, 12, 12, 2.2, '#6b3a20'); g.ell(15.5, 11.6, 11.5, 1.6, '#a8622f');
      g.r(9, 5, 12, 6, '#a8622f'); g.r(9, 5, 12, 1, '#d9955a'); g.r(9, 9, 12, 2, '#3f74d9'); g.p(19, 7, '#ffe14a'); g.p(20, 6, '#ffe14a');
    },
    back: (g) => {
      // the great pack: strapped box, a pan hanging off it, wares poking out of the top
      g.r(1, 10, 9, 22, '#a8622f'); g.r(1, 10, 1, 22, '#d9955a'); g.r(9, 10, 1, 22, '#6b3a20');
      g.r(1, 16, 9, 2, '#6b3a20'); g.r(1, 24, 9, 2, '#6b3a20');
      g.disc(2, 21, 2.2, '#c09070'); g.disc(2, 21, 1.2, '#7a5a3a'); g.r(0, 27, 3, 4, '#ff5a8a'); g.r(0, 27, 3, 1, '#ffb0c8');
      g.r(2, 7, 4, 3, '#4fa36a'); g.r(5, 6, 4, 4, '#3f74d9'); g.r(5, 6, 4, 1, '#7ab4ff');
    },
  },
  aldous: {
    hold: 3,
    held: (g, _P, hand, ph) => {
      // the lantern hanging from his fist, swaying a step behind the stride
      const x = 18 + hand - tilt(ph), y = 31 + bob(ph);
      g.line(x, y, x, y + 1, '#3a2a4a'); g.r(x - 2, y + 2, 5, 4, '#3a2a4a'); g.r(x - 1, y + 3, 3, 2, '#ffd36a'); g.p(x, y + 3, '#fff0b0'); g.r(x - 2, y + 1, 5, 1, '#5a4470');
    },
  },
  rook: {
    head: (g) => {
      // the steel kettle helm with a red crest
      sideDome(g, FUR); g.ell(15.5, 12, 12, 2, FUR[2]); g.ell(15.5, 11.6, 11.5, 1.4, FUR[1]); g.r(12, 3, 5, 1, '#d63447');
    },
    hold: 4,
    held: (g, _P, hand, ph) => {
      // the long axe carried upright ahead of the face: blade forward, spike behind, a steel point on top
      const x = 21 + hand, b = bob(ph), t = tilt(ph);
      g.line(x + t, 4 + b, x, 36, WOOD[0]); g.line(x + 1 + t, 4 + b, x + 1, 36, WOOD[1]);
      g.poly([[x + 2 + t, 6 + b], [x + 5 + t, 4 + b], [x + 5 + t, 12 + b], [x + 2 + t, 10 + b]], '#b9c6e0'); g.line(x + 5 + t, 4 + b, x + 5 + t, 12 + b, '#f2f6ff');
      g.poly([[x + t, 7 + b], [x - 2 + t, 8 + b], [x + t, 9 + b]], '#7a88aa'); g.poly([[x + 0.5 + t, 0 + b], [x + 2 + t, 4 + b], [x - 1 + t, 4 + b]], '#d3ddff');
    },
  },
  tamsin: {
    head: (g) => {
      // the straw sun hat, its wide brim edge-on
      g.ell(15.5, 12, 12.5, 2.4, '#a8761a'); g.ell(15.5, 11.6, 12, 1.8, '#f0b43a');
      g.ell(15.5, 9, 7.5, 4, '#ffe27a'); g.ell(14, 8, 4.5, 2.4, '#fff0b0'); g.x.clearRect(0, 14, 32, 26);
    },
    hold: 6,
    held: (g, _P, hand, ph) => {
      // the long walking staff, upright ahead of her
      const x = 19 + hand, b = bob(ph), t = tilt(ph);
      g.line(x + t, 4 + b, x, 37, '#c4834a'); g.line(x + 1 + t, 4 + b, x + 1, 37, '#7d4a2a');
    },
  },
  hobb: {
    head: (g) => {
      // the flat cap, its peak forward
      g.ell(15.5, 9, 8.5, 4, '#4a4638'); g.ell(14.5, 8.3, 7.5, 3, '#6e6a5a'); g.x.clearRect(0, 12, 32, 28);
      g.r(8, 11, 15, 2, '#3a3228'); g.poly([[22, 11], [26, 12], [25, 13], [22, 13]], '#3a3228');
    },
    keepCloak: true,
    back: (g) => {
      // the yoke staff over the shoulder behind him, the pail hanging off its foot
      g.line(6, 33, 13, 6, WOOD[0]); g.line(7, 33, 14, 6, WOOD[1]); g.rr(3, 31, 5, 5, '#8a90a8', 1); g.r(4, 32, 2, 3, '#c9cfe0');
    },
    hold: 3,
    held: (g, _P, hand, ph) => {
      // the green-lit lantern hanging from his fist
      const x = 18 + hand - tilt(ph), y = 31 + bob(ph);
      g.line(x, y, x, y + 1, '#3a2a4a'); g.r(x - 2, y + 2, 5, 4, '#3a2a4a'); g.r(x - 1, y + 3, 3, 2, '#b8f57a'); g.p(x, y + 3, '#e8ffc0');
    },
  },
  ysolde: {
    open: true,
    head: (g) => {
      // gold spectacles on the near eye, the temple arm back to the ear; a quill tucked behind it
      const c = '#d9a03a';
      g.r(19, 14, 3, 1, c); g.r(19, 16, 3, 1, c); g.p(19, 15, c); g.p(21, 15, c); g.p(20, 15, '#e8fbff'); g.line(13, 15, 18, 15, c);
      g.line(10, 8, 14, 14, '#ffffff'); g.p(9, 7, '#e6e9f5');
    },
  },
  pip: {
    open: true,
    head: (g) => {
      // the white plume, swept back from the crown
      g.poly([[13, 6], [7, 1], [5, 3], [11, 7]], '#ffffff'); g.line(12, 6, 7, 2, '#e6e9f5');
    },
    hold: 6,
    held: (g, _P, hand, ph) => {
      // the broom carried upright, head down, ahead of him
      const x = 19 + hand, b = bob(ph), t = tilt(ph);
      g.r(x + t, 14 + b, 2, 15, '#d9955a'); g.r(x + 1 + t, 14 + b, 1, 15, '#a8622f'); g.r(x - 3, 29 + b, 8, 2, '#8a5a3a'); g.r(x, 31 + b, 2, 3, '#5e3220');
    },
  },
  corwin: {
    head: (g) => {
      // the cream coif-cap, banded, its peak forward
      g.ell(15.5, 9, 8.6, 4.2, '#efe6cf'); g.ell(14.5, 8.3, 7.6, 3.2, '#ffffff'); g.x.clearRect(0, 13, 32, 27);
      g.r(7, 11, 17, 2, '#c8b08a'); g.poly([[21, 7], [26, 9], [25, 12], [21, 11]], '#efe6cf');
    },
    back: (g) => {
      // the flour sack slung on his back
      g.ell(5, 19, 4, 6.5, '#c8b08a'); g.ell(4.5, 18, 3.4, 5.5, '#efe6cf'); g.r(3, 12, 5, 2, '#a8906a');
    },
  },
  sela: {
    open: true,
    head: (g) => {
      // the silver circlet with its sea-green stone at the brow
      g.r(8, 12, 15, 1, '#e8f0ff'); g.r(21, 11, 2, 2, '#2de2c4'); g.p(21, 11, '#e8fbff');
    },
    back: (g, _P, ph) => {
      // the long teal cloak behind, its hem kicking back on each step
      const k = dip(ph);
      g.poly([[9, 23], [12, 23], [13, 36], [4 - k, 36]], '#1a6a6a'); g.line(9, 24, 5 - k, 35, '#2a8a8a'); g.p(10, 22, GO[1]);
    },
  },
};

export default npcs;
