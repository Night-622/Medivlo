/**
 * Hollow Crown UI widgets built on the handoff 9-slice art (public/art/ui/*.png, slice 8).
 * Texture keys come from BootScene: "ui:<name>".
 */
import Phaser from 'phaser';
import { C, T, typeStyle, type RarityKey, type TypeKey } from './theme';

export type PanelKind = 'panel' | 'panel_gold' | 'panel_inset' | 'tooltip';

/** 9-slice panel at (x,y) top-left. */
export function panel(scene: Phaser.Scene, x: number, y: number, w: number, h: number, kind: PanelKind = 'panel'): Phaser.GameObjects.NineSlice {
  return scene.add.nineslice(x, y, `ui:${kind}`, undefined, w, h, 8, 8, 8, 8).setOrigin(0);
}

export function text(scene: Phaser.Scene, x: number, y: number, str: string, key: TypeKey = 'body', color: string = C.text, wrap?: number): Phaser.GameObjects.Text {
  return scene.add.text(x, y, str, typeStyle(key, color, wrap)).setResolution(1);
}

type BtnState = 'normal' | 'hover' | 'pressed' | 'disabled';
const BTN_TEX: Record<'primary' | 'secondary', Record<BtnState, string>> = {
  primary: { normal: 'ui:btn_gold', hover: 'ui:btn_gold_hover', pressed: 'ui:btn_gold_down', disabled: 'ui:btn_off' },
  secondary: { normal: 'ui:btn_slate', hover: 'ui:btn_slate_hover', pressed: 'ui:btn_gold_down', disabled: 'ui:btn_off' },
};

export interface ButtonOpts { w?: number; h?: number; variant?: 'primary' | 'secondary'; disabled?: boolean; sub?: string }

/** Handoff button: 52 tall, gold (primary, ink label) or slate (secondary, light label). Centre-anchored. */
export class HCButton extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.NineSlice;
  private label: Phaser.GameObjects.Text;
  private subLabel?: Phaser.GameObjects.Text;
  private disabled: boolean;
  private readonly variant: 'primary' | 'secondary';

  constructor(scene: Phaser.Scene, x: number, y: number, str: string, onClick: () => void, opts: ButtonOpts = {}) {
    super(scene, x, y);
    this.variant = opts.variant ?? 'primary';
    this.disabled = !!opts.disabled;
    const w = opts.w ?? Math.max(T.component.buttonPrimary.minWidth, 0), h = opts.h ?? T.component.buttonPrimary.height;
    this.bg = scene.add.nineslice(0, 0, BTN_TEX[this.variant].normal, undefined, w, h, 8, 8, 8, 8);
    this.label = scene.add.text(0, opts.sub ? -8 : 0, str, typeStyle('button', this.labelColor())).setOrigin(0.5).setResolution(1);
    this.add([this.bg, this.label]);
    if (opts.sub) { this.subLabel = scene.add.text(0, 14, opts.sub, typeStyle('caption', this.variant === 'primary' ? C.ink : C.text300)).setOrigin(0.5); this.add(this.subLabel); }
    this.setSize(w, h).setInteractive({ useHandCursor: true });
    this.on('pointerover', () => this.paint('hover'));
    this.on('pointerout', () => this.paint('normal'));
    this.on('pointerdown', () => this.paint('pressed'));
    this.on('pointerup', () => { if (this.disabled) return; this.paint('hover'); onClick(); });
    this.paint('normal');
    scene.add.existing(this);
  }

  setDisabled(d: boolean): this { this.disabled = d; this.paint('normal'); return this; }

  private labelColor(): string { return this.disabled ? C.text500 : this.variant === 'primary' ? T.component.buttonPrimary.labelColor : T.component.buttonSecondary.labelColor; }

  private paint(s: BtnState): void {
    if (this.disabled) s = 'disabled';
    this.bg.setTexture(BTN_TEX[this.variant][s]);
    const dy = s === 'pressed' ? T.component.buttonPrimary.pressedOffsetY : 0;
    this.label.setColor(this.labelColor()).setY((this.subLabel ? -8 : 0) + dy);
    this.subLabel?.setY(14 + dy);
  }
}

/** Item / bag / hotbar slot with rarity frame (56 bag, 60 hotbar). Top-left anchored. */
export function slot(scene: Phaser.Scene, x: number, y: number, size: number, rarity: RarityKey | 'empty' = 'empty'): Phaser.GameObjects.NineSlice {
  const tex = rarity === 'empty' ? 'ui:slot_empty' : `ui:slot_${rarity}`;
  return scene.add.nineslice(x, y, tex, undefined, size, size, 8, 8, 8, 8).setOrigin(0);
}

/** Tab (150×44): active uses tab_active. Top-left anchored. Returns [bg, label]. */
export function tab(scene: Phaser.Scene, x: number, y: number, str: string, active: boolean, onClick: () => void, key?: string): Phaser.GameObjects.Container {
  const { width: w, height: h } = T.component.tab;
  const c = scene.add.container(x, y);
  const bg = scene.add.nineslice(0, 0, active ? 'ui:tab_active' : 'ui:tab', undefined, w, h, 8, 8, 8, 8).setOrigin(0);
  const label = scene.add.text(w / 2 - (key ? 8 : 0), h / 2, str, typeStyle('h3', active ? C.gold : C.text)).setOrigin(0.5);
  c.add([bg, label]);
  if (key) c.add(scene.add.text(w - 14, h / 2, key, { fontFamily: '"Jersey 10"', fontSize: '15px', color: C.text500 }).setOrigin(1, 0.5));
  // The bg takes the clicks, not the container: Phaser offsets a Container's hit point by half its size, so a
  // Rectangle(0, 0, w, h) hit area only covered the tab's top-left quarter (dead tab-bar and map-crumb clicks).
  c.setSize(w, h);
  bg.setInteractive({ useHandCursor: true }).on('pointerup', onClick);
  return c;
}

type BarKind = 'hp' | 'ember' | 'stamina' | 'xp';
const BAR_SPEC = { hp: T.component.barHp, ember: T.component.barEmber, stamina: T.component.barStamina, xp: T.component.barXp } as const;

/** Resource bar per handoff: 2px ink outline, back colour, banded fill (hi top / lo bottom), HP ghost. */
export class HCBar extends Phaser.GameObjects.Container {
  private g: Phaser.GameObjects.Graphics;
  private value = 1;
  private ghost = 1;
  private ghostHoldMs = 0;
  readonly w: number;
  readonly h: number;
  private readonly kind: BarKind;

  constructor(scene: Phaser.Scene, x: number, y: number, kind: BarKind, w?: number) {
    super(scene, x, y);
    this.kind = kind;
    this.w = w ?? BAR_SPEC[kind].width;
    this.h = BAR_SPEC[kind].height;
    this.g = scene.add.graphics();
    this.add(this.g);
    scene.add.existing(this);
    this.draw();
  }

  set(current: number, max: number): this {
    const v = Math.max(0, Math.min(1, max > 0 ? current / max : 0));
    if (v < this.value) { this.ghost = Math.max(this.ghost, this.value); this.ghostHoldMs = T.motion.hpGhost.delayMs; }
    else this.ghost = Math.max(v, this.ghost);
    if (v !== this.value) { this.value = v; this.draw(); }
    return this;
  }

  /** Current fill, 0..1 (read by the DEV HUD probe). */
  get fraction(): number { return this.value; }

  /** Drain the ghost (call from scene update). */
  tick(dtMs: number): void {
    if (this.ghost <= this.value) return;
    if (this.ghostHoldMs > 0) { this.ghostHoldMs -= dtMs; return; }
    this.ghost = Math.max(this.value, this.ghost - dtMs / T.motion.hpGhost.durationMs);
    this.draw();
  }

  private draw(): void {
    const R = T.color.resource[this.kind === 'ember' ? 'ember' : this.kind] as { fill: string; hi: string; lo: string; back: string; ghost?: string };
    const g = this.g.clear(), w = this.w, h = this.h, o = 2;
    const hex = (s: string) => parseInt(s.slice(1), 16);
    g.fillStyle(hex(C.ink), 1).fillRect(-o, -o, w + o * 2, h + o * 2);
    g.fillStyle(hex(R.back), 1).fillRect(0, 0, w, h);
    const fw = Math.round(w * this.value), gw = Math.round(w * this.ghost);
    if (gw > fw && R.ghost) g.fillStyle(hex(R.ghost), 1).fillRect(fw, 0, gw - fw, h);
    if (fw > 0) {
      g.fillStyle(hex(R.fill), 1).fillRect(0, 0, fw, h);
      const hi = Math.min(h, (BAR_SPEC[this.kind] as { hi?: number }).hi ?? 2);
      const lo = Math.min(h - hi, (BAR_SPEC[this.kind] as { lo?: number }).lo ?? 0);
      g.fillStyle(hex(R.hi), 1).fillRect(0, 0, fw, hi);
      if (lo > 0) g.fillStyle(hex(R.lo), 1).fillRect(0, h - lo, fw, lo);
    }
    if (this.kind === 'hp') {
      g.fillStyle(hex(C.ink), 0.35);
      for (let p = 0.1; p < 1; p += 0.1) g.fillRect(Math.round(w * p), 0, 1, h);
    }
  }
}
