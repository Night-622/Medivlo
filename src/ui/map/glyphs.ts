/**
 * Pixel glyphs from design board "8j · World Map": rectilinear path data (M/h/v/z) drawn into a Graphics,
 * with the board's 1-art-px ink outline and hard shadow. Colours are palette tokens.
 */
import Phaser from 'phaser';
import { palette as P } from '@/ui/kit';

type Layer = [color: number, d: string];
export interface Glyph { size: number; layers: Layer[] }

export const GLYPHS = {
  obelisk: { size: 12, layers: [[P['gold-500'], 'M5 0h2v1h1v9h1v2h-6v-2h1v-9h1z'], [P['gold-200'], 'M5 1h1v8h-1z'], [P['gold-900'], 'M7 2h1v8h-1z']] },
  unknown: { size: 12, layers: [[P['stone-600'], 'M3 1h6v1h1v3h-1v1h-2v2h-2v-3h1v-1h2v-2h-4v1h-2v-1h1zM5 9h2v2h-2z']] },
  player: { size: 12, layers: [[P['gold-200'], 'M5 0h2v2h1v2h1v2h1v3h-2v-1h-4v1h-2v-3h1v-2h1v-2h1z'], [P['blood-400'], 'M5 3h2v4h-2z']] },
  quest: { size: 8, layers: [[P['gold-400'], 'M3 0h2v1h1v1h1v1h1v2h-1v1h-1v1h-1v1h-2v-1h-1v-1h-1v-1h-1v-2h1v-1h1v-1h1z'], [P['gold-200'], 'M3 2h1v1h-1z']] },
  // other active quests: the same gem, tinted (drawGlyph's tint; the map passes the HUD teal)
  questSide: { size: 8, layers: [[-1, 'M3 0h2v1h1v1h1v1h1v2h-1v1h-1v1h-1v1h-2v-1h-1v-1h-1v-1h-1v-2h1v-1h1v-1h1z'], [P['highlight-100'], 'M3 2h1v1h-1z']] },
  town: { size: 8, layers: [[P['parch-700'], 'M1 3h6v5h-6z'], [P['blood-600'], 'M0 3h8v-1h-1v-1h-1v-1h-4v1h-1v1h-1z']] },
  dungeon: { size: 8, layers: [[P['stone-700'], 'M1 1h6v7h-6z'], [P['ink-900'], 'M3 4h2v4h-2z'], [P['ruin-teal-500'], 'M2 2h1v1h-1zM5 2h1v1h-1z']] },
  skull: { size: 8, layers: [[-1, 'M1 0h6v1h1v4h-1v1h-1v2h-4v-2h-1v-1h-1v-4h1z'], [P['ink-900'], 'M2 2h1v2h-1zM5 2h1v2h-1z']] },
  boss: { size: 8, layers: [[P['blood-400'], 'M0 1h1v2h1v-2h1v2h2v-2h1v2h1v-2h1v6h-8z']] },
} satisfies Record<string, Glyph>;
export type GlyphName = keyof typeof GLYPHS;

/** Parse "M x y h dx v dy ... z" (absolute M, relative h/v) into polygons. */
function polygons(d: string): Phaser.Math.Vector2[][] {
  const out: Phaser.Math.Vector2[][] = [];
  const tokens = d.match(/[MhvzHV]|-?\d+(?:\.\d+)?/g) ?? [];
  let cur: Phaser.Math.Vector2[] = [];
  let x = 0, y = 0, i = 0;
  while (i < tokens.length) {
    const t = tokens[i++];
    if (t === 'M') { x = Number(tokens[i++]); y = Number(tokens[i++]); cur = [new Phaser.Math.Vector2(x, y)]; }
    else if (t === 'h') { x += Number(tokens[i++]); cur.push(new Phaser.Math.Vector2(x, y)); }
    else if (t === 'v') { y += Number(tokens[i++]); cur.push(new Phaser.Math.Vector2(x, y)); }
    else if (t === 'z') { if (cur.length > 2) out.push(cur); cur = []; }
  }
  return out;
}

const cache = new Map<string, Phaser.Math.Vector2[][]>();
function polys(d: string): Phaser.Math.Vector2[][] {
  let p = cache.get(d);
  if (!p) cache.set(d, (p = polygons(d)));
  return p;
}

/**
 * Draw a glyph with its top-left at (x, y), `scale` screen px per art px.
 * `tint` replaces colour -1 (skull = currentColor). Outline: 1 art px ink, plus a 1 art px hard shadow.
 */
export function drawGlyph(g: Phaser.GameObjects.Graphics, name: GlyphName, x: number, y: number, scale: number, tint: number = P['parch-500']): void {
  const glyph: Glyph = GLYPHS[name];
  const place = (pts: Phaser.Math.Vector2[], ox: number, oy: number) => pts.map((p) => new Phaser.Math.Vector2(x + (p.x + ox) * scale, y + (p.y + oy) * scale));
  g.fillStyle(P['ink-900'], 1);
  for (const [, d] of glyph.layers) for (const poly of polys(d)) {
    for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1], [2, 1], [1, 2]]) g.fillPoints(place(poly, ox, oy), true);
  }
  for (const [color, d] of glyph.layers) {
    g.fillStyle(color === -1 ? tint : color, 1);
    for (const poly of polys(d)) g.fillPoints(place(poly, 0, 0), true);
  }
}
