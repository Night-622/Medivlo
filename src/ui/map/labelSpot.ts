/**
 * Map label placement, pure (Claude 2): MapLabels draws with it, tools/playthrough/mapLabels.ts checks the layout in
 * Node with it.
 */
/** "the White Gate" → "The White Gate" (the first letter only; the rest stays as written). */
export const capFirst = (s: string): string => (s ? s[0].toUpperCase() + s.slice(1) : s);

export type Box = [number, number, number, number]; // x, y, w, h (screen px)

export interface LabelArea {
  /** the map rectangle on screen (labels stay inside it) */
  bounds: Box;
  /** road at a screen point (from the overview's road mask); omit where there are no roads to avoid */
  road?: (x: number, y: number) => boolean;
}

const overlaps = (a: Box, b: Box) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];

/**
 * Where a w×h label for (x, y) goes (pure, shared with tools/playthrough/mapLabels.ts): the candidate spot nearest the
 * anchor that is clear of `taken` (and of roads where it can be). `overlap`: every spot was taken, so it sits on one.
 */
export function pickLabelSpot(taken: Box[], area: LabelArea, x: number, y: number, w: number, h: number, below = false): { box: Box; overlap: boolean } {
  const [bx, by, bw, bh] = area.bounds;
  const side = w / 2 + 12;
  // nearest first; the diagonals and the further rows only matter in dense clusters (Morvane's Stormcliffs, Gloamwood)
  const far: [number, number][] = [[side, -16], [-side, -16], [side, 16], [-side, 16], [0, -52], [0, 52], [side, -28], [-side, -28], [side, 28], [-side, 28]];
  const offsets: [number, number][] = below
    ? [[0, 16], [0, -16], [0, 28], [0, -28], [side, 0], [-side, 0], [0, 40], [0, -40], ...far]
    : [[0, 0], [0, -16], [0, 16], [0, -28], [0, 28], [side, 0], [-side, 0], [0, -40], [0, 40], ...far];
  let best: { box: Box; score: number } | null = null;
  for (const [dx, dy] of offsets) {
    const cx = Math.round(Math.min(bx + bw - w / 2 - 2, Math.max(bx + w / 2 + 2, x + dx)));
    const cy = Math.round(Math.min(by + bh - h / 2 - 2, Math.max(by + h / 2 + 2, y + dy)));
    const box: Box = [cx - w / 2, cy - h / 2, w, h];
    let score = Math.hypot(cx - x, cy - y) * 0.5;
    for (const o of taken) if (overlaps(box, o)) score += 1000;
    if (area.road) for (let sx = box[0]; sx <= box[0] + w; sx += 4) for (let sy = box[1]; sy <= box[1] + h; sy += 4) if (area.road(sx, sy)) score += 6;
    if (!best || score < best.score) best = { box, score };
  }
  return { box: best!.box, overlap: best!.score >= 1000 };
}
