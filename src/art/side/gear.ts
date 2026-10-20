/**
 * Side-view class gear registry + contributor guide (Claude 5).
 *
 * WHERE: one file per school, src/art/side/classes/<school>.ts, default-exporting { <class>: SideGear } for its two
 * classes. Owners: ash, rime, hunt + shared gear: Claude 5 · storm, radiance, umbral, verdant, song: Claude 4 ·
 * blade, iron, fist, guile: Claude 2. Shared worn gear (paperdoll weapons, helm sets, alt headwear, accessories):
 * src/art/side/shared/*, Claude 5. Contract and helpers: ./kit.ts. Edit only your files.
 *
 * WHAT IS AUTOMATIC (don't redraw it): torso, sleeves, hands, legs and boots are sampled from the hero's real front
 * body (body.ts), so the class colours, dyes, chest sets and gloves come through. The head, face and hair are drawn
 * in profile (head.ts). The class cloak (HERO.back) is sampled and hung behind as a generic cloak. You add only the
 * HEADGEAR and the HELD ITEMS, plus `back` when the class's back gear isn't a cloak.
 *
 * THE GRID: 32×40 canvas, facing RIGHT (left = flipX). Pivot bottom-centre, ground below row 37 (feet rows 36–37).
 * Head: skull ~x 8–23, rows 6–21; face edge x 23, nose x 24; eye ~x 19–21 row 15; brow band rows 11–12; crown
 * rows 0–10. Torso x 11–20, rows 22–32 (robes to 35). Near arm hangs at x 14–16 from row 22; its hand reaches
 * x 14+`hold` … 16+`hold` at about row 30 when the class holds something. Behind = smaller x.
 *
 * SideGear (kit.ts):
 *   head(g, P)                headgear in profile; brims seen edge-on stay full width, domes ~x 7–24.
 *   open                      true for circlets/bands/open hoods (hair crown stays drawn under it).
 *   held(g, P, hand, phase, swing)  item in front of the near arm (staves, bows, swords), with `hold` (px reach,
 *                             ~4–6; 0 = the arm swings freely and `swing` says where the hand is, for censers/axes).
 *   farHeld(g, P, swing, ph)  far-arm item between body and near arm (shields edge-on, off-hand lanterns/books);
 *                             shift x by round(swing/2).
 *   back(g, P, phase)         back gear in profile, drawn behind the body INSTEAD of the sampled cloak (scabbards,
 *                             slung staves, quivers, banners); `keepCloak: true` draws it over the cloak instead.
 * Every function draws on a fresh canvas at dy = 0; the composer lifts it with the body's bob and draws the ink
 * outline (OUTLINE RULE: never draw ink outlines yourself; one layer = one outline, so draw each item solid).
 *
 * PHASES (body.ts Phase): idle | a (near leg forward) | pass (far leg swinging) | b (far leg forward) | pass2.
 * Walk = [a, pass, b, pass2]; idle = [idle, idle with the body 1 px up]. Bob convention: held items add bob(ph)
 * (−1 on passes) and, if tall, tilt(ph) (±1 lean at the top on contacts); low items add dip(ph) on footfalls.
 *
 * STYLE: the handoff's — banded shading (kit band(): light column, body, dark column), light from the top left,
 * colours from the class's front art (art.js HERO[cls]), no external assets.
 *
 * CHECK YOUR WORK: start the e2e server (npx vite --config tools/e2e/vite.test.config.mjs --port 51xx --strictPort;
 * it doesn't watch files: restart it after edits), then
 *   node tools/art-side/sheet.mjs --base http://localhost:51xx --classes knight,juggernaut [--scale 8] [--nohat]
 * → tools/e2e/out/side/side-sheet.png (front vs side idle + walk, flipX) and side-sheet-1x.png (1× on grass, 2×).
 * Add --name <yours> so sheets don't overwrite each other. One headless Chrome at a time (cdp.mjs takes the lock);
 * stop your server by PID afterwards. Typecheck clean, files under ~400 lines.
 */
import { M } from './mvApi';
import type { Pal } from './mvApi';
import type { SideGear } from './kit';
import ash from './classes/ash';
import rime from './classes/rime';
import storm from './classes/storm';
import radiance from './classes/radiance';
import umbral from './classes/umbral';
import verdant from './classes/verdant';
import blade from './classes/blade';
import iron from './classes/iron';
import fist from './classes/fist';
import hunt from './classes/hunt';
import guile from './classes/guile';
import song from './classes/song';

export type { SideGear } from './kit';

/** every class's side gear, by class id */
export const SIDE: Record<string, SideGear> = { ...ash, ...rime, ...storm, ...radiance, ...umbral, ...verdant, ...blade, ...iron, ...fist, ...hunt, ...guile, ...song };

/** Fallback headgear: the class's front hat squeezed from 21 to 13 columns, set back over the skull. */
export function squeezedHead(cls: string, P: Pal): HTMLCanvasElement | null {
  const mv = M(), C = mv.HERO[cls];
  if (!C?.head) return null;
  const src = mv.G(32, 40), out = mv.G(32, 40);
  C.head(src, P);
  for (let x = 0; x < 13; x++) out.x.drawImage(src.c, 6 + Math.round((x * 20) / 12), 0, 1, 40, 9 + x, 0, 1, 40);
  return out.c;
}
