/**
 * Dual-grid corner autotiles (handoff tiles.js): terrain lives on the CORNER grid; a tile's frame index is
 * mask = TL·8 + TR·4 + BL·2 + BR, where 1 means that corner is inside the terrain (0 = outside, 15 = solid).
 * Tiles are drawn offset by half a tile, which the renderer handles. Pure.
 */

/** Corner terrain classes, in draw priority order (highest wins). */
export const Corner = { GROUND: 0, PATH: 1, WATER: 2, CLIFF: 3, FLOOR: 4, WALL: 5 } as const;
export type CornerClass = (typeof Corner)[keyof typeof Corner];

/** Mask for one terrain class from the 4 corners around tile (tx, ty): tl, tr, bl, br. */
export function maskOf(tl: number, tr: number, bl: number, br: number, cls: number): number {
  return ((tl === cls ? 1 : 0) << 3) | ((tr === cls ? 1 : 0) << 2) | ((bl === cls ? 1 : 0) << 1) | (br === cls ? 1 : 0);
}

/** Number of set corners in a mask. */
export function cornersIn(mask: number): number {
  return (mask & 1) + ((mask >> 1) & 1) + ((mask >> 2) & 1) + ((mask >> 3) & 1);
}
