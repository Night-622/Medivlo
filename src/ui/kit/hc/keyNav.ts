/**
 * Keyboard navigation for a screen's clickable controls (accessibility: every screen usable without a mouse).
 * Owner: Claude 6. A screen registers each control as it draws it (`nav.add(obj, fn)`); a redraw calls `nav.clear()`
 * first. ↑/←/Shift+Tab and ↓/→/Tab move a visible focus ring; Enter / Space press the focused control. The ring only
 * appears once a key is used, so mouse players never see it. Keys typed into DOM inputs are left alone.
 */
import Phaser from 'phaser';
import { C } from './theme';

type Focusable = Phaser.GameObjects.GameObject & { getBounds(): Phaser.Geom.Rectangle; visible?: boolean };

export class KeyNav {
  private items: { obj: Focusable; fn: () => void }[] = [];
  private i = -1;
  private ring: Phaser.GameObjects.Graphics;

  /**
   * `first`: the control focused by the first key press (a screen's main action). `autofocus`: focus it at once
   * (Enter presses it). `skip`: while true, keys pass through (e.g. Settings waiting for a key to rebind).
   * `tabOnly`: only Tab / Shift+Tab move (the screen's arrows drive its own menu; it calls blur() on them).
   */
  constructor(scene: Phaser.Scene, private opts: { first?: number; autofocus?: boolean; skip?: () => boolean; tabOnly?: boolean } = {}) {
    if (opts.autofocus) this.i = opts.first ?? 0;
    this.ring = scene.add.graphics().setDepth(10_000);
    const onKey = (ev: KeyboardEvent) => this.key(ev);
    scene.input.keyboard?.on('keydown', onKey);
    scene.events.once('shutdown', () => { scene.input.keyboard?.off('keydown', onKey); this.items = []; });
  }

  /** Register a control (call in drawing order). Returns it, so it can wrap a constructor call. */
  add<T extends Focusable>(obj: T, fn: () => void): T { this.items.push({ obj, fn }); if (this.i >= 0) this.draw(); return obj; }

  /** Forget every control (before a screen redraws); the focus keeps its position. */
  clear(): void { this.items = []; this.ring.clear(); }

  get focused(): boolean { return this.i >= 0; }

  /** Drop the focus (the screen's own keys took over). */
  blur(): void { this.i = -1; this.ring.clear(); }

  /** Controls still on screen, in registration (drawing) order: a screen with columns draws one column at a time. */
  private live(): { obj: Focusable; fn: () => void }[] { return this.items.filter((x) => x.obj.scene && x.obj.visible !== false); }

  private key(ev: KeyboardEvent): void {
    if (ev.target instanceof HTMLInputElement || ev.target instanceof HTMLTextAreaElement || this.opts.skip?.()) return;
    const list = this.live();
    if (!list.length) return;
    const arrows = !this.opts.tabOnly;
    const back = (arrows && (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft')) || (ev.key === 'Tab' && ev.shiftKey);
    const fwd = (arrows && (ev.key === 'ArrowDown' || ev.key === 'ArrowRight')) || (ev.key === 'Tab' && !ev.shiftKey);
    if (back || fwd) {
      ev.preventDefault();
      this.i = this.i < 0 ? Math.min(this.opts.first ?? 0, list.length - 1) : (this.i + (fwd ? 1 : -1) + list.length) % list.length;
      this.draw();
    } else if ((ev.key === 'Enter' || ev.key === ' ') && this.i >= 0) {
      ev.preventDefault();
      // after this key event has reached every listener: a press that starts a rebind must not be bound itself.
      // (Construct a KeyNav before a screen's own keydown listener when that listener captures keys.)
      const item = list[Math.min(this.i, list.length - 1)];
      queueMicrotask(() => item.fn());
    }
  }

  private draw(): void {
    this.ring.clear();
    const list = this.live();
    if (this.i < 0 || !list.length) return;
    // clamp for drawing only: during a redraw the controls come back one add() at a time, and storing the clamp
    // here sent the focus back to the first control after every redraw (a Settings tab switch, a slider step…)
    const b = list[Math.min(this.i, list.length - 1)].obj.getBounds();
    this.ring.lineStyle(3, parseInt(C.gold.slice(1), 16), 1).strokeRect(b.x - 4, b.y - 4, b.width + 8, b.height + 8);
  }
}
