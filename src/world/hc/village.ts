/**
 * Villages (handoff map.js `vilLayout` + `drawVillage`), stamped into the world 1:1. A village close-up is
 * 768×448 px = 24×14 tiles: a crossroads path autotile (tile rows 6–7, columns 11–12), up to 8 places laid out in
 * four quadrants, and fixed decor. The map screen's village view uses the same layout. Pure.
 */
import { TILE_SIZE } from '@/core/constants';
import { artSize } from './footprints';
import type { VillageDef } from './types';

export const VIL_W = 24;
export const VIL_H = 14;

/** A place box in close-up px (top-left), as vilLayout returns it. */
export interface VillagePlaceBox { art: string; label: string; service: string; npc: string | null; x: number; y: number; w: number; h: number }

/** Art name used for a village place: realm capitals use recoloured buildings and the realm landmark. */
export function placeArt(v: VillageDef, base: string): string {
  if (!v.tiles.startsWith('realm:')) return base;
  if (base.startsWith('lm:')) return base;
  return `rc:${v.tiles.slice(6)}:${base}`;
}

/** Port of vilLayout: 2 places per quadrant max, bottom-aligned to rows 188 / 436, 12 px gaps; overflow carries on. */
export function vilLayout(v: VillageDef): VillagePlaceBox[] {
  const sides: [number, number][] = [[16, 340], [430, 760]];
  const rows = [188, 436];
  const out: VillagePlaceBox[] = [];
  let k = 0;
  for (const base of rows) for (const [x0, x1] of sides) {
    let x = x0;
    for (let n = 0; n < 2 && k < v.places.length; n++) {
      const [art, label, service, npc] = v.places[k];
      const s = artSize(placeArt(v, art));
      if (x + s.w > x1) break;
      out.push({ art: placeArt(v, art), label, service, npc, x, y: base - s.h, w: s.w, h: s.h });
      x += s.w + 12;
      k++;
    }
  }
  return out;
}

/** Fixed decor of every village close-up: [art, x, y] top-left in close-up px. */
export function villageDecor(v: VillageDef): [string, number, number][] {
  const well = v.well ?? (v.tiles.startsWith('realm:') ? `rc:${v.tiles.slice(6)}:v_well` : 'v_well');
  return [[well, 360, 232], ['v_lamp', 340, 168], ['v_lamp', 424, 168], ['v_lamp', 340, 420], ['v_lamp', 424, 420], ['v_bench', 300, 236], ['v_flowerbed', 430, 240]];
}

/** Top-left world tile of a village. */
export function villageOrigin(v: VillageDef): [number, number] {
  return [v.at[0] - VIL_W / 2, v.at[1] - VIL_H / 2];
}

/** Is the village crossroads on corner (cx, cy) in village-local corner coords? */
export function villageRoad(cx: number, cy: number): boolean {
  return (cy >= 6 && cy <= 7) || (cx >= 11 && cx <= 12);
}

/** A placed sprite in world px (bottom-centre anchor, as Phaser origin 0.5, 1). */
export interface Placement { art: string; x: number; y: number; key: string }

/** Every placement of a village in world px. */
export function villagePlacements(v: VillageDef): Placement[] {
  const [ox, oy] = villageOrigin(v).map((t) => t * TILE_SIZE);
  const out: Placement[] = [];
  vilLayout(v).forEach((p, i) => out.push({ art: p.art, x: ox + p.x + p.w / 2, y: oy + p.y + p.h, key: `${v.id}#${i}` }));
  villageDecor(v).forEach(([art, x, y], i) => {
    const s = artSize(art);
    out.push({ art, x: ox + x + s.w / 2, y: oy + y + s.h, key: `${v.id}#d${i}` });
  });
  return out;
}

/** Stable slug for ids built from labels. */
export function slug(s: string): string {
  return s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
