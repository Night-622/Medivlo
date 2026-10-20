/**
 * Side-view art kit (Claude 5): the SideGear contract every school file fills in, and the shared helpers (banding,
 * stride bob / tilt, common metal colours). School files import from here; gear.ts registers them. See gear.ts for
 * the contributor guide.
 */
import type { Gfx, Pal } from './mvApi';
import type { Phase } from './body';

export type { Gfx, Pal, Phase };

/** One class's side-view gear. Every field optional; a missing head falls back to the squeezed front hat. */
export interface SideGear {
  /** headgear, drawn over the profile head (crown/top at rows 0–13, brow band ~11–12) */
  head?: (g: Gfx, P: Pal) => void;
  /** true for circlets/bands/open hoods: the crown's hair stays drawn under it */
  open?: boolean;
  /**
   * held item in front of the near arm; `hand` = the hold reach below, `phase` for bob/tilt, `swing` = where the near
   * hand actually is this frame (px from rest: `hold` when holding, else the walk swing ±2), for swinging items
   */
  held?: (g: Gfx, P: Pal, hand: number, phase: Phase, swing: number) => void;
  /** how far forward (px) the near hand reaches to carry `held` (0 = arm swings freely) */
  hold?: number;
  /** item on the far arm, between the body and the near arm (shields, off-hand books, lanterns) */
  farHeld?: (g: Gfx, P: Pal, swing: number, phase: Phase) => void;
  /**
   * back gear in profile, drawn behind the body INSTEAD of the sampled cloak (scabbards, slung staves, quivers,
   * banners); set `keepCloak` to draw it on top of the class cloak instead.
   */
  back?: (g: Gfx, P: Pal, phase: Phase) => void;
  keepCloak?: boolean;
}

/** held items ride the stride: up 1 px on the pass frames */
export const bob = (ph: Phase): number => (ph === 'pass' || ph === 'pass2' ? -1 : 0);
/** pendulum lean (px) against the hand's swing on contact frames, for tall held items */
export const tilt = (ph: Phase): number => (ph === 'a' ? -1 : ph === 'b' ? 1 : 0);
/** a footfall dip (px) for items carried low */
export const dip = (ph: Phase): number => (ph === 'a' || ph === 'b' ? 1 : 0);

/** a vertical banded strip, art.js sh(): highlight column, body, shade column */
export const band = (g: Gfx, x: number, y: number, w: number, h: number, c: string[]): void => { g.r(x, y, w, h, c[1]); g.r(x, y, 1, h, c[0]); g.r(x + w - 1, y, 1, h, c[2]); };

/** art.js shared ramps (light, mid, dark) */
export const ST = ['#eef4ff', '#a9bbd6', '#62759a'];  // steel
export const GO = ['#ffe27a', '#f0a823', '#b8661a'];  // gold
export const LE = ['#e8a868', '#b06a38', '#7a4526'];  // leather
