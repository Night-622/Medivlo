/**
 * Side-view hero heads, facing right (Claude 5): profile skull (female / male jaw), one eye, nose, mouth, ear, the
 * composer's marks, and the 7 hair styles in profile using the hair palettes. Same 32×40 grid as art.js: the head
 * sits in rows 5–22 like the front HEAD (drawn at y 6), the face toward x 23.
 */
import { M, type Gfx, type Look, type Pal } from './mvApi';

/** Profile skull + face. `M` (male) squares the jaw and thickens the brow, as HEAD_M does in front. */
export function drawHead(g: Gfx, L: Look, P: Pal): void {
  const male = L.body === 1;
  // neck, then a round chibi skull as wide as the front head: lit from the top left, shade on the jaw
  g.r(14, 19, 4, 4, P.S);
  g.r(14, 19, 1, 4, P.s);
  g.ell(15.5, 12.8, 7.2, 6.6, P.s);
  // jaw and chin toward the face; male: squarer and lower (HEAD_M)
  g.r(15, 19, 7, 1, P.s);
  g.r(16, 20, male ? 6 : 4, 1, P.S);
  if (male) { g.r(21, 19, 2, 1, P.s); g.p(22, 20, P.S); }
  g.r(9, 18, 4, 1, P.S);
  // the face's front edge: forehead, nose, lips
  g.r(23, 9, 1, 9, P.s);
  g.p(24, 14, P.s); g.p(24, 15, P.S); g.p(23, 16, P.S);
  // ear (back of the jaw line)
  g.r(12, 13, 2, 3, P.S); g.p(12, 14, P.d);
  drawFace(g, L, P, male);
}

type EyeRow = [number, number, string[]];

function drawFace(g: Gfx, L: Look, P: Pal, male: boolean): void {
  const mv = M(), INK = mv.INK, k = L.mark % 6, m = L.mouth % 4;
  // the near eye is the front's own right eye (all 12 styles), set toward the face: same rows, same palette keys
  const EYES = mv._int.EYES as EyeRow[][], es = L.eyes % EYES.length;
  let [, , rows] = EYES[es][1]; let ey = 15;
  if (male && rows.length === 3) { rows = rows.slice(1); ey += 1; }
  const w = rows[0].length, ex = 22 - w;
  rows.forEach((row, y) => { for (let i = 0; i < row.length; i++) { const ch = row[i]; const col = ch === '.' ? null : (P as Record<string, string>)[ch] ?? INK; if (col) g.p(ex + i, ey + y, col); } });
  if (!male && es !== 4 && es !== 6 && es !== 7) { g.p(ex + w, ey, INK); g.p(ex + w, ey - 1, INK); } // lash
  // brow
  const bw = L.brows == null ? (male ? 2 : 0) : L.brows % 12;
  if (bw) g.r(ex - 1, ey - 2 - (bw === 8 || bw === 10 ? 1 : 0), bw === 2 || bw === 7 ? w + 2 : w + 1, bw === 7 ? 2 : 1, bw === 1 ? P.H : P.j);
  // mouth
  const mc = k === 5 ? P.j : male ? P.d : '#e0607a';
  if (m === 1) { g.r(21, 19, 2, 1, INK); g.p(22, 19, '#ff6a7a'); } else g.r(21, 19, m === 2 ? 2 : 1, 1, mc);
  if (m === 3) g.p(22, 18, mc);
  if (m !== 2 && !male) g.p(ex - 1, 18, P.b); // blush
  // marks
  if (k === 1) [[17, 17], [19, 18], [18, 19]].forEach(([x, y]) => g.p(x, y, P.d));
  if (k === 2) g.line(18, 12, 17, 18, '#f0a0a8');
  if (k === 3) { g.r(17, 18, 3, 1, '#3f8cff'); g.r(15, 15, 1, 3, '#3f8cff'); }
  if (k === 4) { const st = mv.mix(P.s, P.H, 0.3); g.r(15, 18, 7, 2, st); g.r(16, 20, 5, 1, st); }
  if (k === 5) { g.r(13, 16, 2, 4, P.H); g.r(14, 18, 9, 3, P.H); g.r(15, 21, 6, 1, P.j); g.r(20, 18, 2, 1, P.h); g.p(21, 19, mc); }
}

/**
 * Profile hair. 'back' parts hang behind the body (drawn first); 'cap' sits on the skull. `capped`: class headgear
 * covers the crown, so only what shows under it (fringe, back fall) is drawn.
 */
export function drawHair(g: Gfx, L: Look, P: Pal, part: 'back' | 'cap', capped: boolean): void {
  const st = L.hair % 7;
  if (part === 'back') {
    if (st === 1) { g.r(8, 13, 5, 14, P.H); g.r(8, 13, 2, 14, P.h); g.r(9, 27, 3, 2, P.j); } // long, down the back
    if (st === 2) { g.disc(7.5, 11, 2.2, P.H); g.r(5, 12, 3, 8, P.H); g.r(5, 12, 1, 8, P.h); g.disc(6, 20, 1.6, P.j); g.p(8, 10, '#ff5a6a'); g.p(8, 11, '#ff5a6a'); } // ponytail
    if (st === 5) { for (let y = 15; y <= 29; y++) g.r(9, y, 2, 1, y % 2 ? P.h : P.H); g.r(9, 30, 2, 1, '#ff5a6a'); g.r(9, 31, 2, 1, P.j); } // braid
    if (st === 4) { g.r(9, 12, 4, 8, P.H); g.r(9, 19, 4, 1, P.j); } // bob, back
    return;
  }
  if (st === 6) { // cropped: a tight dark cap
    if (!capped) { g.ell(15, 9.5, 7.4, 4.2, P.H); g.r(8, 10, 3, 6, P.H); g.p(22, 8, P.j); }
    return;
  }
  if (!capped) {
    g.ell(15, 9.4, 7.8, 4.9, P.H);
    g.ell(14, 8.3, 6, 3.2, P.h);
    g.r(7, 10, 5, 7, P.H); g.r(7, 10, 1, 7, P.h); // back of the head, behind the ear
    g.p(21, 6, P.j);
    if (st === 3) [[10, 4], [13, 2], [16, 2], [20, 3]].forEach(([x, y], i) => { g.poly([[x - 2, 7], [x - 1 + (i % 2), y], [x + 2, 7]], P.h); g.line(x, y + 1, x + 1, 6, P.H); });
  } else g.r(8, 12, 4, 5, P.H); // what shows under a hat at the back
  // fringe over the brow
  if (st === 0) { g.r(20, 10, 3, 2, P.H); g.p(23, 11, P.H); g.p(21, 12, P.H); g.p(20, 10, P.h); }
  else if (st === 3 && !capped) { g.r(20, 10, 3, 1, P.H); }
  else if (st === 4) { g.r(19, 10, 5, 2, P.H); g.r(23, 12, 1, 4, P.H); g.r(8, 12, 5, 7, P.H); }
  else if (st === 1 || st === 5) { g.r(20, 10, 3, 1, P.H); g.p(22, 11, P.H); }
  else g.r(20, 10, 3, 1, P.H);
}
