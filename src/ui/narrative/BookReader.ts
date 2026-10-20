import Phaser from 'phaser';
import { Registry } from '@/core';
import type { LoreEntry, LoreId } from '@/core';
import { hex, noise, palette as P, pxText } from '@/ui/kit';
import { smallButton } from './widgets';

type Key = 'displayXL' | 'titleL' | 'titleM' | 'titleS' | 'bodyM' | 'bodyS' | 'micro';

const BOOK = { x: 140, y: 60, w: 1000, h: 600 };
const PAGE_W = 460, PAGE_H = 540;
const LEFT_X = BOOK.x + 30, RIGHT_X = BOOK.x + BOOK.w / 2 + 10, PAGE_Y = BOOK.y + 30;

/** Splits a book body into pages on lines containing only `---`. */
export function bookPages(e: LoreEntry): string[] {
  return e.body.split(/\n\s*---\s*\n/).map((p) => p.trim()).filter(Boolean);
}

/** Two-page reader for in-world books (lore category 'books'). ◂ ▸ or ←/→ to turn, Esc to close. */
export class BookReader extends Phaser.GameObjects.Container {
  private g: Phaser.GameObjects.Graphics;
  private parts: Phaser.GameObjects.GameObject[] = [];
  private entry: LoreEntry | null = null;
  private spread = 0; // index of the left-hand page; page 0 is the title page

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    this.g = scene.add.graphics();
    this.add(this.g);
    this.setDepth(30).setVisible(false);
    scene.add.existing(this);
  }

  get isOpen(): boolean { return this.visible; }

  open(id: LoreId): boolean {
    const e = Registry.tryGet('lore', id) as LoreEntry | undefined;
    if (!e) return false;
    this.entry = e;
    this.spread = 0;
    this.setVisible(true);
    this.render();
    return true;
  }

  close(): void { this.setVisible(false); this.entry = null; }

  turn(dir: 1 | -1): void {
    if (!this.entry) return;
    const total = bookPages(this.entry).length + 1; // + title page
    const next = this.spread + dir * 2;
    if (next < 0 || next >= total) return;
    this.spread = next;
    this.render();
  }

  private render(): void {
    this.parts.forEach((o) => o.destroy());
    this.parts = [];
    const g = this.g.clear();
    const e = this.entry;
    if (!e) return;
    // cover + pages
    g.fillStyle(P['ink-900'], 1).fillRect(0, 0, 1280, 720);
    g.fillStyle(P['ink-900'], 1).fillRect(BOOK.x - 2 + 10, BOOK.y - 2 + 10, BOOK.w + 4, BOOK.h + 4).fillRect(BOOK.x - 2, BOOK.y - 2, BOOK.w + 4, BOOK.h + 4);
    g.fillStyle(P['leather-900'], 1).fillRect(BOOK.x, BOOK.y, BOOK.w, BOOK.h);
    g.fillStyle(P['leather-700'], 1).fillRect(BOOK.x, BOOK.y, BOOK.w, 2).fillRect(BOOK.x, BOOK.y, 2, BOOK.h);
    for (const x of [LEFT_X, RIGHT_X]) {
      g.fillStyle(P['ink-900'], 1).fillRect(x - 2, PAGE_Y - 2, PAGE_W + 4, PAGE_H + 4);
      g.fillStyle(P['parch-500'], 1).fillRect(x, PAGE_Y, PAGE_W, PAGE_H);
      noise(g, x, PAGE_Y, PAGE_W, PAGE_H, P['parch-700']);
      g.fillStyle(P['parch-700'], 1).fillRect(x === LEFT_X ? x + PAGE_W - 8 : x, PAGE_Y, 8, PAGE_H);
    }
    g.fillStyle(P['ink-900'], 1).fillRect(BOOK.x + BOOK.w / 2 - 12, BOOK.y + 20, 24, BOOK.h - 40);
    g.fillStyle(P['leather-800'], 1).fillRect(BOOK.x + BOOK.w / 2 - 10, BOOK.y + 22, 20, BOOK.h - 44);

    const pages = bookPages(e);
    this.page(this.spread, LEFT_X, pages, e);
    this.page(this.spread + 1, RIGHT_X, pages, e);
    // controls
    const total = pages.length + 1;
    const by = BOOK.y + BOOK.h + 14;
    const btn = (x: number, dir: 'left' | 'right', enabled: boolean, fn: () => void) => {
      smallButton(this.g, x, by, 44, 32, enabled, dir);
      if (!enabled) return;
      const z = this.scene.add.zone(x, by, 44, 32).setOrigin(0).setInteractive({ useHandCursor: true }).on('pointerup', fn);
      this.add(z); this.parts.push(z);
    };
    btn(BOOK.x + BOOK.w / 2 - 110, 'left', this.spread > 0, () => this.turn(-1));
    btn(BOOK.x + BOOK.w / 2 + 66, 'right', this.spread + 2 < total, () => this.turn(1));
    this.text(BOOK.x + BOOK.w / 2, by + 10, `${Math.min(total, this.spread + 1)}–${Math.min(total, this.spread + 2)} / ${total}`, 'micro', hex(P['parch-700'])).setOrigin(0.5, 0);
    this.text(BOOK.x + BOOK.w, by + 10, '← → turn · Esc close', 'micro', hex(P['stone-600'])).setOrigin(1, 0);
  }

  /** page 0 = title page; page n = pages[n-1] */
  private page(n: number, x: number, pages: string[], e: LoreEntry): void {
    const w = PAGE_W - 64;
    if (n === 0) {
      const cx = x + PAGE_W / 2;
      this.g.fillStyle(P['gold-800'], 1).fillRect(cx - 80, PAGE_Y + 120, 160, 4).fillRect(cx - 6, PAGE_Y + 114, 12, 16);
      this.text(cx, PAGE_Y + 150, e.name, 'titleM', hex(P['blood-800']), false, w).setOrigin(0.5, 0).setAlign('center');
      if (e.source) this.text(cx, PAGE_Y + 300, e.source, 'bodyS', hex(P['parch-900']), false, w).setOrigin(0.5, 0).setAlign('center');
      this.g.fillStyle(P['gold-800'], 1).fillRect(cx - 80, PAGE_Y + 420, 160, 4);
      return;
    }
    const body = pages[n - 1];
    if (body === undefined) return;
    let y = PAGE_Y + 32;
    let text = body;
    if (n === 1) {
      // illuminated initial on the first page of text
      const letter = body[0];
      this.g.fillStyle(P['ink-900'], 1).fillRect(x + 30, y - 2, 68, 68);
      this.g.fillStyle(P['blood-800'], 1).fillRect(x + 32, y, 64, 64);
      this.g.fillStyle(P['gold-500'], 1).fillRect(x + 34, y + 2, 60, 2).fillRect(x + 34, y + 60, 60, 2).fillRect(x + 34, y + 2, 2, 60).fillRect(x + 92, y + 2, 2, 60);
      this.text(x + 64, y - 6, letter, 'titleL', hex(P['gold-200'])).setOrigin(0.5, 0);
      text = body.slice(1);
      for (const para of text.split(/\n\s*\n/)) y += this.text(x + 108, y, para.trim(), 'bodyM', hex(P['ink-800']), false, w - 76).height + 10;
      this.text(x + PAGE_W / 2, PAGE_Y + PAGE_H - 28, '— 1 —', 'micro', hex(P['parch-800']), false).setOrigin(0.5, 0);
      return;
    }
    for (const para of text.split(/\n\s*\n/)) y += this.text(x + 32, y, para.trim(), 'bodyM', hex(P['ink-800']), false, w).height + 10;
    this.text(x + PAGE_W / 2, PAGE_Y + PAGE_H - 28, `— ${n} —`, 'micro', hex(P['parch-800']), false).setOrigin(0.5, 0);
  }

  private text(x: number, y: number, s: string, key: Key, color: string, shadow = true, wrap?: number): Phaser.GameObjects.Text {
    const t = pxText(this.scene, x, y, s, key, color, shadow, wrap);
    this.add(t);
    this.parts.push(t);
    return t;
  }
}
