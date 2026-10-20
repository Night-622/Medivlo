import Phaser from 'phaser';
import { Theme, palette as P } from './theme';
import { bevel, checker, outlineAndShadow } from './frame';
import { textStyle } from './text';

export interface ButtonOpts {
  width?: number;
  height?: number;
  /** Legacy: label pixel size. Ignored when `size` is set. */
  fontSize?: number;
  /** large 240×48 (Title S) · medium 160×40 (Body M) · small 96×32 (Body S) */
  size?: 'large' | 'medium' | 'small';
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

type State = 'default' | 'hover' | 'pressed' | 'disabled';

const SIZES = { large: [240, 48, 'titleS'], medium: [160, 40, 'bodyM'], small: [96, 32, 'bodyS'] } as const;

/** Leather pixel button with hover / pressed / disabled states (Design System §07). */
export class Button extends Phaser.GameObjects.Container {
  private g: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private disabled: boolean;
  private readonly bw: number;
  private readonly bh: number;
  private readonly variant: 'default' | 'destructive';

  constructor(scene: Phaser.Scene, x: number, y: number, text: string, onClick: () => void, opts: ButtonOpts = {}) {
    super(scene, x, y);
    const preset = SIZES[opts.size ?? (opts.height && opts.height <= 32 ? 'small' : opts.height && opts.height <= 40 ? 'medium' : 'large')];
    this.bw = opts.width ?? preset[0];
    this.bh = opts.height ?? preset[1];
    this.variant = opts.variant ?? 'default';
    this.disabled = !!opts.disabled;
    this.g = scene.add.graphics();
    const style = textStyle(opts.size || !opts.fontSize ? preset[2] : 'bodyM');
    if (opts.fontSize && !opts.size) style.fontSize = `${opts.fontSize}px`;
    this.label = scene.add.text(0, 0, text, style).setOrigin(0.5);
    this.add([this.g, this.label]);
    this.setSize(this.bw, this.bh).setInteractive({ useHandCursor: true });
    this.on('pointerover', () => this.paint('hover'));
    this.on('pointerout', () => this.paint('default'));
    this.on('pointerdown', () => this.paint('pressed'));
    this.on('pointerup', () => { if (this.disabled) return; this.paint('hover'); onClick(); });
    this.paint('default');
    scene.add.existing(this);
  }

  setDisabled(d: boolean): this {
    this.disabled = d;
    this.paint('default');
    return this;
  }

  setText(text: string): this { this.label.setText(text); return this; }

  private paint(state: State): void {
    if (this.disabled) state = 'disabled';
    const g = this.g.clear();
    const x = -this.bw / 2, y = -this.bh / 2, w = this.bw, h = this.bh;
    const red = this.variant === 'destructive';
    const fill = state === 'disabled' ? P['stone-900'] : state === 'pressed' ? (red ? P['blood-900'] : P['leather-900'])
      : state === 'hover' ? (red ? P['blood-600'] : P['leather-700']) : (red ? P['blood-800'] : P['leather-800']);
    const off = state === 'pressed' ? 2 : 0;
    if (state === 'hover') { g.fillStyle(P['gold-500'], 1).fillRect(x - 4, y - 4, w + 8, h + 8); }
    outlineAndShadow(g, x + off, y + off, w, h, state === 'pressed' || state === 'disabled' ? 0 : 4);
    g.fillStyle(fill, 1).fillRect(x + off, y + off, w, h);
    if (state === 'disabled') {
      checker(g, x, y, w, h, P['stone-800']);
      bevel(g, x, y, w, h, P['stone-800'], P['stone-800']);
    } else if (state === 'pressed') {
      bevel(g, x + off, y + off, w, h, P['ink-900'], red ? P['blood-600'] : P['leather-700']);
    } else {
      bevel(g, x, y, w, h, red ? P['blood-400'] : P['leather-500'], red ? P['blood-900'] : P['leather-900']);
    }
    this.label.setPosition(off, off);
    this.label.setColor(state === 'disabled' ? Theme.css.muted : state === 'hover' ? Theme.css.hover : state === 'pressed' ? Theme.css.textDim : Theme.css.text);
  }
}
