/**
 * Keyboard + mouse → InputFrame (Claude 3, handoff controls). The only place that reads the keyboard for combat.
 * Bindings come from core Settings (rebindable): move · click enemy = target + auto-attack · hold left on ground =
 * attack toward cursor · cast1–4 · dash · potions Q/E · interact (held: revive) · inventory/skills/spells panels.
 */
import Phaser from 'phaser';
import { bus } from '@/core/EventBus';
import { Services } from '@/core/services';
import { Settings, type Action } from '@/core/settings';
import { Btn, type InputFrame } from '@/net/types';
import { slashAimPoint } from '@/systems/rules/slash';

export interface TargetPicker { pick(x: number, y: number): string | null; heroAt?(): { x: number; y: number } | null }

const HELD: [Action, number][] = [
  ['cast1', Btn.CAST1], ['cast2', Btn.CAST2], ['cast3', Btn.CAST3], ['cast4', Btn.CAST4], ['dash', Btn.DASH], ['slash', Btn.SLASH],
  ['potionQ', Btn.POTION_Q], ['potionE', Btn.POTION_E], ['interact', Btn.INTERACT],
];
const PANELS: [Action, 'inventory' | 'skills' | 'spells'][] = [['inventory', 'inventory'], ['skills', 'skills'], ['spells', 'spells']];

export class HeroInput {
  private keys = new Map<Action, Phaser.Input.Keyboard.Key>();
  private seq = 0;
  private target: string | null = null;
  private attackHeld = false;
  private offs: (() => void)[] = [];
  /** panels / dialogue / pause turn combat input off */
  enabled = true;

  constructor(private scene: Phaser.Scene, private picker: TargetPicker) {
    this.bindKeys();
    this.offs.push(bus.on('settings:changed', (e) => { if (e.key === 'keys' || e.key === 'all') this.bindKeys(); }));
    scene.input.mouse?.disableContextMenu();
    scene.input.on('pointerdown', this.onDown, this);
    scene.input.on('pointerup', this.onUp, this);
    scene.input.keyboard!.on('keydown', this.onKey, this);
    scene.events.on('update', this.update, this);
    scene.events.once('shutdown', () => this.destroy());
  }

  private bindKeys(): void {
    const kb = this.scene.input.keyboard!;
    for (const k of this.keys.values()) kb.removeKey(k, false);
    this.keys.clear();
    for (const a of ['up', 'down', 'left', 'right', ...HELD.map(([x]) => x)] as Action[]) {
      const code = Phaser.Input.Keyboard.KeyCodes[Settings.key(a) as keyof typeof Phaser.Input.Keyboard.KeyCodes];
      if (code !== undefined) this.keys.set(a, kb.addKey(code, false));
    }
  }

  /** I/K/B also work while a character panel is open (to switch or close it); other UIs set panelKeys = false */
  panelKeys = true;

  private onKey(ev: KeyboardEvent): void {
    if (!this.enabled && !this.panelKeys) return;
    for (const [a, panel] of PANELS) {
      const code = Phaser.Input.Keyboard.KeyCodes[Settings.key(a) as keyof typeof Phaser.Input.Keyboard.KeyCodes];
      if (ev.keyCode === code) bus.emit('ui:open', { panel });
    }
  }

  /** last movement direction (8-way): a facing-mode slash swings this way; down until the hero first moves */
  private lastDir = { x: 0, y: 1 };
  /** mouse-mode slash: a left click queues one Btn.SLASH frame toward the click point */
  private clickSlash = false;

  private onDown(p: Phaser.Input.Pointer): void {
    if (!this.enabled || !p.leftButtonDown()) return;
    const hit = this.picker.pick(p.worldX, p.worldY);
    this.target = hit;
    this.attackHeld = !hit;
    // Settings › Gameplay › Slash aim = mouse: left click also slashes toward the cursor (a creature clicked is still targeted)
    if (Settings.get().slashAim === 'mouse') this.clickSlash = true;
  }
  private onUp(): void { this.attackHeld = false; }

  clearTarget(): void { this.target = null; }
  get currentTarget(): string | null { return this.target; }

  private down(a: Action): boolean { return !!this.keys.get(a)?.isDown; }

  private update(): void {
    const net = Services.tryGet('net');
    if (!net) return;
    const on = this.enabled, ptr = this.scene.input.activePointer;
    let b = 0;
    if (on) {
      if (this.attackHeld && ptr.leftButtonDown()) b |= Btn.ATTACK;
      for (const [a, bit] of HELD) if (this.down(a)) b |= bit;
    }
    const mx = on ? Number(this.down('right')) - Number(this.down('left')) : 0;
    const my = on ? Number(this.down('down')) - Number(this.down('up')) : 0;
    const len = Math.hypot(mx, my) || 1;
    if (mx || my) this.lastDir = { x: mx / len, y: my / len };
    ptr.updateWorldPoint(this.scene.cameras.main);
    let aim = { x: Math.round(ptr.worldX), y: Math.round(ptr.worldY) };
    if (on && this.clickSlash) b |= Btn.SLASH;
    this.clickSlash = false;
    // Slash aim = facing (default): the slash key swings the way the hero is walking (or last walked), not at the mouse
    if (b & Btn.SLASH) aim = slashAimPoint(Settings.get().slashAim, this.picker.heroAt?.() ?? null, this.lastDir, aim);
    const frame: InputFrame = {
      seq: ++this.seq, t: Math.round(this.scene.time.now), move: { x: mx / len, y: my / len },
      aim, buttons: b, target: this.target,
    };
    net.send({ type: 'input', frames: [frame] });
  }

  destroy(): void {
    this.offs.forEach((f) => f());
    this.scene.events.off('update', this.update, this);
    this.scene.input.off('pointerdown', this.onDown, this);
    this.scene.input.off('pointerup', this.onUp, this);
    this.scene.input.keyboard?.off('keydown', this.onKey, this);
  }
}
