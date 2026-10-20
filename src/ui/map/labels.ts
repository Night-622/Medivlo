/**
 * Map labels (Claude 3's UI pass #13): each name is placed at the free spot nearest its anchor, clear of the
 * marker icons, the hero and the labels already placed, and off the roads where it can be, on a dark pill so it
 * reads on any ground. Names start with a capital.
 */
import type Phaser from 'phaser';
import { C, n, text } from '@/ui/kit/hc';

type Box = [number, number, number, number]; // x, y, w, h (screen px)

export interface LabelArea {
  /** the map rectangle on screen (labels stay inside it) */
  bounds: Box;
  /** road at a screen point (from the overview's road mask); omit where there are no roads to avoid */
  road?: (x: number, y: number) => boolean;
}

/** "the White Gate" → "The White Gate" (the first letter only; the rest stays as written). */
export const capFirst = (s: string): string => (s ? s[0].toUpperCase() + s.slice(1) : s);

const overlaps = (a: Box, b: Box) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];

export class MapLabels {
  private taken: Box[] = [];

  constructor(private scene: Phaser.Scene, private into: Phaser.GameObjects.Container, private area: LabelArea) {}

  /** Keep labels off a marker icon (or the hero) centred at (x, y). */
  block(x: number, y: number, r = 9): void { this.taken.push([x - r, y - r, r * 2, r * 2]); }

  /** Place a label for something at (x, y); `below` prefers just under the anchor (a dot) to on top of it. */
  add(x: number, y: number, name: string, color: string = C.text, below = false): void {
    const t = text(this.scene, 0, 0, capFirst(name), 'caption', color).setOrigin(0.5);
    const w = t.width + 10, h = t.height + 4;
    const [bx, by, bw, bh] = this.area.bounds;
    const offsets: [number, number][] = below
      ? [[0, 16], [0, -16], [0, 28], [0, -28], [w / 2 + 12, 0], [-w / 2 - 12, 0]]
      : [[0, 0], [0, -16], [0, 16], [0, -28], [0, 28], [w / 2 + 12, 0], [-w / 2 - 12, 0], [0, -40], [0, 40]];
    let best: { box: Box; score: number } | null = null;
    for (const [dx, dy] of offsets) {
      const cx = Math.round(Math.min(bx + bw - w / 2 - 2, Math.max(bx + w / 2 + 2, x + dx)));
      const cy = Math.round(Math.min(by + bh - h / 2 - 2, Math.max(by + h / 2 + 2, y + dy)));
      const box: Box = [cx - w / 2, cy - h / 2, w, h];
      let score = Math.hypot(cx - x, cy - y) * 0.5;
      for (const o of this.taken) if (overlaps(box, o)) score += 1000;
      if (this.area.road) for (let sx = box[0]; sx <= box[0] + w; sx += 4) for (let sy = box[1]; sy <= box[1] + h; sy += 4) if (this.area.road(sx, sy)) score += 6;
      if (!best || score < best.score) best = { box, score };
    }
    const [lx, ly] = best!.box;
    t.setPosition(lx + w / 2, ly + h / 2);
    this.into.add([this.scene.add.rectangle(lx + w / 2, ly + h / 2, w, h, n(C.bg), 0.78), t]);
    this.taken.push(best!.box);
  }
}
