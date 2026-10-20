/**
 * Side-view hero art (Claude 5, for Claude 1's art pipeline): the typed slice of window.MV it reads. Read-only:
 * nothing in public/art/mv is changed. Source of formats: "Medieval Browser Action RPG/HANDOFF.md".
 */
import { mv } from '../mv';

/** The handoff's tiny canvas API (art.js G()). */
export interface Gfx {
  c: HTMLCanvasElement;
  x: CanvasRenderingContext2D;
  w: number;
  h: number;
  p(x: number, y: number, col: string | undefined): void;
  r(x: number, y: number, w: number, h: number, col: string): void;
  line(x0: number, y0: number, x1: number, y1: number, col: string): void;
  ell(cx: number, cy: number, rx: number, ry: number, col: string | null, clear?: boolean): void;
  disc(cx: number, cy: number, r: number, col: string): void;
  poly(pts: [number, number][], col: string): void;
  rr(x: number, y: number, w: number, h: number, col: string, r?: number): void;
  img(src: HTMLCanvasElement | Gfx, dx?: number, dy?: number): void;
}

/** Palette the composer hands to class draw functions (art.js heroFrame P). */
export interface Pal { k: string; w: string; s: string; S: string; d: string; b: string; h: string; H: string; j: string; e: string; E: string; [k: string]: string }

/** A hero look as MV.heroLook returns it (indices; gear fields 0 = none). */
export interface Look {
  cls: string; skin: number; hair: number; hc: number; eyes: number; ec: number; mouth: number; mark: number; body: number;
  brows: number | null; nohat?: boolean;
  dye?: number; headw?: number; cape?: number; neck?: number; face?: number; extra?: number;
  helm?: number; chest?: number; hands?: number; feet?: number; weapon?: number;
}

type DrawFn = (g: Gfx, P: Pal) => void;
export interface HeroDef { school: string; open?: number; npc?: number; boots: [string, string]; back?: DrawFn; body: DrawFn; head?: DrawFn; over?: DrawFn; wb?: DrawFn[]; wf?: DrawFn[]; look: Partial<Look> }

interface MVSide {
  INK: string;
  G(w: number, h: number): Gfx;
  outline(c: HTMLCanvasElement, col?: string): HTMLCanvasElement;
  mix(a: string, b: string, t: number): string;
  HERO: Record<string, HeroDef>;
  heroLook(name: string): Look | null;
  heroFrameX?: (L: Look, dy: number, feet: string) => HTMLCanvasElement;
  _int: { SKINS: string[][]; HAIRC: string[][]; EYEC: string[][]; [k: string]: unknown };
  GEAR?: { DYE: number[] };
}

export const M = (): MVSide => mv() as unknown as MVSide;

/** The composer's palette for a look (same mapping as art.js heroFrame). */
export function palette(L: Look): Pal {
  const I = M()._int, sk = I.SKINS[L.skin % 5], hc = I.HAIRC[L.hc % 8], ec = I.EYEC[L.ec % 6];
  return { k: M().INK, w: '#ffffff', s: sk[0], S: sk[1], d: sk[2], b: sk[3], h: hc[0], H: hc[1], j: hc[2], e: ec[0], E: ec[1], l: '#9be8ff' };
}

/** Read a pixel as '#rrggbb', or null when (nearly) transparent. */
export function px(c: HTMLCanvasElement, x: number, y: number): string | null {
  if (x < 0 || y < 0 || x >= c.width || y >= c.height) return null;
  const d = c.getContext('2d')!.getImageData(x, y, 1, 1).data;
  if (d[3] < 40) return null;
  return '#' + [d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, '0')).join('');
}
