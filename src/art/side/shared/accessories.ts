/**
 * Side-view paperdoll accessories (Claude 5): gear.js NECK (scarf, amulet, fur collar), FACE (eyepatch, spectacles,
 * nose bandage) and EXTRA (belt pouch, satchel, hair flower) in profile, facing right. Index = the look's value
 * (0 = none). Neck and extra pieces are drawn into the body silhouette, face pieces over the head.
 */
import { M } from '../mvApi';
import type { Gfx } from '../kit';

export const SIDE_NECK: (((g: Gfx) => void) | null)[] = [
  null,
  (g) => { g.r(12, 21, 9, 3, '#d63447'); g.r(12, 21, 9, 1, '#ff6a6a'); g.r(10, 23, 3, 6, '#d63447'); g.r(10, 28, 3, 1, '#8a1f45'); },
  (g) => { g.line(15, 22, 19, 25, '#f0a823'); g.disc(19.5, 26, 1.4, '#3fa9ff'); g.p(19, 25, '#bfe8ff'); },
  (g) => { g.r(11, 21, 11, 3, '#a8906a'); g.r(11, 21, 11, 1, '#d9c4a0'); for (let x = 11; x < 22; x += 2) g.p(x, 24, '#a8906a'); },
];

export const SIDE_FACE: (((g: Gfx) => void) | null)[] = [
  null,
  (g) => { const INK = M().INK; g.r(19, 14, 3, 3, INK); g.line(12, 12, 19, 15, INK); },
  (g) => { g.r(19, 14, 3, 1, '#f0a823'); g.r(19, 16, 3, 1, '#f0a823'); g.p(19, 15, '#f0a823'); g.p(21, 15, '#f0a823'); g.p(20, 15, '#bfe8ff'); g.line(13, 15, 18, 15, '#f0a823'); },
  (g) => { g.r(23, 15, 2, 2, '#fff1cf'); g.p(23, 15, '#ffffff'); },
];

export const SIDE_EXTRA: (((g: Gfx) => void) | null)[] = [
  null,
  (g) => { g.r(18, 29, 3, 3, '#8a5a3a'); g.r(18, 29, 3, 1, '#a87a5a'); g.p(19, 31, '#ffd84a'); },
  (g) => { g.line(12, 22, 19, 30, '#5e3220'); g.rr(7, 28, 6, 5, '#a8622f', 1); g.r(7, 28, 6, 2, '#7a4526'); g.p(9, 30, '#ffd84a'); },
  (g) => { [[12, 10], [11, 11], [13, 11], [12, 12]].forEach(([x, y]) => g.p(x, y, '#ff79a8')); g.p(12, 11, '#ffd84a'); g.p(14, 12, '#3fae4c'); },
];
