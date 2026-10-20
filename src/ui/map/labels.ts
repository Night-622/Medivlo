/**
 * Map labels (Claude 3's UI pass #13): each name is placed at the free spot nearest its anchor, clear of the
 * marker icons, the hero and the labels already placed, and off the roads where it can be, on a dark pill so it
 * reads on any ground. Names start with a capital.
 */
import type Phaser from 'phaser';
import { C, n, text } from '@/ui/kit/hc';
import { capFirst, pickLabelSpot, type Box, type LabelArea } from './labelSpot';
export { capFirst } from './labelSpot';
export type { Box, LabelArea } from './labelSpot';

export class MapLabels {
  private taken: Box[] = [];

  constructor(private scene: Phaser.Scene, private into: Phaser.GameObjects.Container, private area: LabelArea) {}

  /** Keep labels off a marker icon (or the hero) centred at (x, y). */
  block(x: number, y: number, r = 9): void { this.taken.push([x - r, y - r, r * 2, r * 2]); }

  /** Place a label for something at (x, y); `below` prefers just under the anchor (a dot) to on top of it. */
  add(x: number, y: number, name: string, color: string = C.text, below = false): void {
    const t = text(this.scene, 0, 0, capFirst(name), 'caption', color).setOrigin(0.5);
    const w = t.width + 10, h = t.height + 4;
    const { box } = pickLabelSpot(this.taken, this.area, x, y, w, h, below);
    const [lx, ly] = box;
    t.setPosition(lx + w / 2, ly + h / 2);
    this.into.add([this.scene.add.rectangle(lx + w / 2, ly + h / 2, w, h, n(C.bg), 0.78), t]);
    this.taken.push(box);
  }
}
