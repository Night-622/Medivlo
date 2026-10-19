/**
 * Modal "enter a code" panel (join codes, friend codes). Keyboard: letters/digits, Backspace, Enter, Esc.
 * Calls `submit(code)`; show progress/errors with setStatus(). Owner: Claude 1.
 */
import Phaser from 'phaser';
import { C, typeStyle } from './theme';
import { randomTip } from './tips';

export class CodeEntry extends Phaser.GameObjects.Container {
  private code = '';
  private codeT: Phaser.GameObjects.Text;
  private status: Phaser.GameObjects.Text;
  private busy = false;
  private keyHandler: (ev: KeyboardEvent) => void;

  constructor(scene: Phaser.Scene, title: string, private len: number | number[], private submit: (code: string) => Promise<void>, private cancel: () => void) {
    super(scene, 0, 0);
    const { width: W, height: H } = scene.scale;
    const dim = scene.add.rectangle(0, 0, W, H, parseInt(C.bg.slice(1), 16), 0.8).setOrigin(0).setInteractive();
    const px = W / 2 - 220, py = H / 2 - 130;
    const panel = scene.add.nineslice(px, py, 'ui:panel', undefined, 440, 260, 8, 8, 8, 8).setOrigin(0);
    const t = scene.add.text(W / 2, py + 22, title, typeStyle('h1', C.text)).setOrigin(0.5, 0);
    const field = scene.add.nineslice(W / 2 - 150, py + 82, 'ui:panel_inset', undefined, 300, 60, 8, 8, 8, 8).setOrigin(0);
    this.codeT = scene.add.text(W / 2, py + 112, '', { ...typeStyle('displayL', C.gold), letterSpacing: 8 } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(0.5);
    this.status = scene.add.text(W / 2, py + 156, 'Type the code your friend shared', typeStyle('body', C.text300, 400)).setOrigin(0.5, 0).setAlign('center');
    const mkBtn = (x: number, label: string, gold: boolean, fn: () => void) => {
      const b = scene.add.nineslice(x, py + 192, gold ? 'ui:btn_gold' : 'ui:btn_slate', undefined, 160, 48, 8, 8, 8, 8).setOrigin(0);
      const l = scene.add.text(x + 80, py + 216, label, typeStyle('button', gold ? C.ink : C.text)).setOrigin(0.5);
      b.setInteractive({ useHandCursor: true }).on('pointerup', fn);
      return [b, l];
    };
    this.add([dim, panel, t, field, this.codeT, this.status, ...mkBtn(W / 2 - 170, 'Cancel', false, () => this.close()), ...mkBtn(W / 2 + 10, 'Join', true, () => void this.go())]);
    this.setDepth(1000);
    scene.add.existing(this);
    this.keyHandler = (ev) => {
      if (this.busy) return;
      if (ev.key === 'Escape') { this.close(); return; }
      if (ev.key === 'Enter') { void this.go(); return; }
      if (ev.key === 'Backspace') this.code = this.code.slice(0, -1);
      else if (/^[a-zA-Z0-9]$/.test(ev.key) && this.code.length < this.max) this.code += ev.key.toUpperCase();
      this.redraw();
    };
    scene.input.keyboard!.on('keydown', this.keyHandler);
    this.redraw();
  }

  setStatus(text: string, color: string = C.text300): void { this.status.setText(text).setColor(color); }

  private get lens(): number[] { return Array.isArray(this.len) ? this.len : [this.len]; }
  private get max(): number { return Math.max(...this.lens); }
  /** Pad to the shortest length that still fits what's typed. */
  private redraw(): void { this.codeT.setText(this.code.padEnd(this.lens.find((l) => l >= this.code.length) ?? this.max, '·')); }

  private async go(): Promise<void> {
    if (this.busy || !this.lens.includes(this.code.length)) { this.setStatus(`Codes are ${this.lens.join(' or ')} characters`, C.danger); return; }
    this.busy = true;
    this.setStatus(`Connecting…\n${randomTip('coop')}`, C.gold);
    try { await this.submit(this.code); }
    catch (e) { this.setStatus(e instanceof Error ? e.message : String(e), C.danger); }
    finally { this.busy = false; }
  }

  close(): void {
    this.scene.input.keyboard!.off('keydown', this.keyHandler);
    this.cancel();
    this.destroy();
  }
}
