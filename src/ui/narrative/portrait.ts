/**
 * Procedural pixel-art bust portraits (Design board 8g, 192×192 = 96×96 art px at 2×) and faction crests,
 * built from NpcDef.look colours until real portrait art exists. Owner: Claude 4.
 */
import type Phaser from 'phaser';
import { palette as P } from '@/ui/kit';

export interface PortraitLook {
  skin: number;
  hair?: number;
  cloth: number;
  accent?: number;
  build?: 'slight' | 'average' | 'broad' | 'tall' | 'short';
  people?: string;
  hollow?: boolean;
}

const S = 2; // screen px per art px

export function shade(c: number, f: number): number {
  const r = Math.round(((c >> 16) & 255) * f), g = Math.round(((c >> 8) & 255) * f), b = Math.round((c & 255) * f);
  return (Math.min(255, r) << 16) | (Math.min(255, g) << 8) | Math.min(255, b);
}

/** Draw a portrait into `g` with its top-left at (x, y), size 192×192. */
export function drawPortrait(g: Phaser.GameObjects.Graphics, x: number, y: number, look: PortraitLook): void {
  const px = (c: number, ax: number, ay: number, aw: number, ah: number) => { if (aw > 0 && ah > 0) g.fillStyle(c, 1).fillRect(x + ax * S, y + ay * S, aw * S, ah * S); };
  /** horizontal-run ellipse, clipped to rows [y0,y1) and columns [xmin,xmax) */
  const ell = (c: number, cx: number, cy: number, rx: number, ry: number, y0 = 0, y1 = 96, xmin = 0, xmax = 96) => {
    for (let yy = Math.max(-ry, y0 - cy); yy < Math.min(ry, y1 - cy); yy++) {
      const t = 1 - ((yy + 0.5) * (yy + 0.5)) / (ry * ry);
      if (t <= 0) continue;
      const w = Math.round(rx * Math.sqrt(t));
      const a = Math.max(cx - w, xmin), b = Math.min(cx + w, xmax);
      px(c, a, cy + yy, b - a, 1);
    }
  };
  const hair = look.hair ?? shade(look.skin, 0.55);
  const skinLo = shade(look.skin, 0.8);
  const shoulders = look.build === 'broad' ? 46 : look.build === 'slight' ? 36 : 41;
  const faceRx = look.people === 'orrun' ? 19 : look.people === 'aelthi' ? 15 : 17;

  px(P['ink-700'], 0, 0, 96, 96);
  // cloak / shoulders
  ell(look.cloth, 48, 104, shoulders, 34, 66, 96);
  ell(shade(look.cloth, 0.7), 48, 104, shoulders, 34, 66, 96, 48, 96);
  ell(shade(look.cloth, 1.25), 40, 100, shoulders - 16, 24, 74, 78, 10, 48);
  // neck + face
  px(skinLo, 41, 60, 14, 12);
  ell(look.skin, 48, 46, faceRx, 21);
  ell(skinLo, 48, 46, faceRx, 21, 28, 70, 58, 96);
  if (look.people === 'aelthi') { px(look.skin, 30, 40, 2, 8); px(look.skin, 28, 36, 2, 6); px(look.skin, 64, 40, 2, 8); px(look.skin, 66, 36, 2, 6); }
  // hair (cap + side locks; long for Aelthi and the drowned)
  ell(hair, 48, 34, faceRx + 3, 14, 18, 40);
  const lockLen = look.people === 'aelthi' || look.people === 'drowned' ? 34 : 16;
  px(hair, 48 - faceRx - 2, 34, 5, lockLen);
  px(hair, 48 + faceRx - 3, 34, 4, Math.round(lockLen * 0.6));
  px(shade(hair, 1.3), 38, 22, 8, 2);
  if (look.people === 'orrun' || look.people === 'hrothi') { ell(hair, 48, 62, 15, 11, 56, 76); px(look.skin, 44, 58, 8, 2); }
  // brows, eyes, nose, mouth
  px(shade(hair, 0.7), 35, 40, 8, 2); px(shade(hair, 0.7), 53, 40, 8, 2);
  px(P['parch-300'], 36, 45, 6, 3); px(P['parch-300'], 54, 45, 6, 3);
  px(look.hollow ? P['ink-900'] : P['ruin-teal-500'], 38, 45, 3, 3); px(look.hollow ? P['ink-900'] : P['ruin-teal-500'], 56, 45, 3, 3);
  px(P['ink-900'], 39, 46, 2, 2); px(P['ink-900'], 57, 46, 2, 2);
  px(skinLo, 47, 48, 3, 8);
  px(P['blood-600'], 43, 60, 10, 2);
  if (look.hollow) { px(P['ink-900'], 38, 48, 1, 14); px(P['ink-900'], 58, 48, 1, 12); px(P['deepwater-800'], 39, 50, 1, 8); }
  // brooch / accent
  px(look.accent ?? P['gold-500'], 45, 82, 6, 6);
  px(P['highlight-100'], 34, 34, 2, 2);
}

/** 32×32 heraldic shield in faction colours. */
export function drawCrest(g: Phaser.GameObjects.Graphics, x: number, y: number, primary: number, secondary: number): void {
  const px = (c: number, ax: number, ay: number, aw: number, ah: number) => g.fillStyle(c, 1).fillRect(x + ax * 2, y + ay * 2, aw * 2, ah * 2);
  px(P['ink-900'], 2, 0, 12, 10); px(P['ink-900'], 3, 10, 10, 2); px(P['ink-900'], 4, 12, 8, 2); px(P['ink-900'], 6, 14, 4, 2);
  px(primary, 3, 1, 10, 9); px(primary, 4, 10, 8, 2); px(primary, 6, 12, 4, 2);
  px(secondary, 6, 3, 4, 6); px(secondary, 7, 9, 2, 2);
  px(shade(primary, 1.4), 3, 1, 10, 1);
}
