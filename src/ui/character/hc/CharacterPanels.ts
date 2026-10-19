/**
 * Character screens shell (Claude 3, HANDOFF › Inventory / Skill tree): dim overlay over the paused world and the
 * handoff's 5-tab bar (Pack I · Skills K · Spells B · Journal J · Map M, 150×44 centred at y 20, key letter right
 * after the label), ✕ 44×44 at (W−92, 20). Opens on ui:open / I K B; Esc closes it (UI rule: Esc closes the open
 * panel and never falls through to Pause). Journal / Map hand over to their owners via ui:open.
 * Drawn in the HUD scene (fixed camera). Solo pauses the sim while open; co-op never pauses.
 */
import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, SceneKeys } from '@/core/constants';
import { bus } from '@/core/EventBus';
import { sim } from '@/net/SimLoop';
import { C, T, typeStyle } from '@/ui/kit/hc';
import type { HeroInput } from '@/systems/input/HeroInput';
import { InventoryPanel } from './InventoryPanel';
import { TreePanel } from './TreePanel';

type Which = 'inventory' | 'skills' | 'spells';
type Target = Which | 'journal' | 'map';
const MINE: Which[] = ['inventory', 'skills', 'spells'];
const TABS: [string, string, Target][] = [['Pack', 'I', 'inventory'], ['Skills', 'K', 'skills'], ['Spells', 'B', 'spells'], ['Journal', 'J', 'journal'], ['Map', 'M', 'map']];

export class CharacterPanels {
  private root: Phaser.GameObjects.Container | null = null;
  private body: { destroy(): void } | null = null;
  private which: Which | null = null;
  private offs: (() => void)[] = [];
  private tabs: Phaser.GameObjects.GameObject[] = [];
  /** true while we emit ui:open ourselves, so our own listener ignores the echo */
  private echo = false;
  private escKey: Phaser.Input.Keyboard.Key | null = null;

  constructor(private world: Phaser.Scene, private input: HeroInput) {
    this.offs.push(bus.on('ui:open', (e) => {
      if (this.echo) return;
      if (e.panel === 'pause') { this.close(true); return; }
      const p = e.panel as Which;
      if (!MINE.includes(p)) { if (this.which) this.close(false, true); return; } // another panel took over
      if (this.which === p) this.close(); else this.open(p);
    }));
  }

  private hud(): Phaser.Scene | null {
    const s = this.world.scene.get(SceneKeys.HudV2);
    return s && s.sys.isActive() ? s : null;
  }

  /** Open (or switch to) one of our panels. `announce`: tell the HUD (tab clicks); key and HUD-button opens already did. */
  open(which: Which, announce = false): void {
    const hud = this.hud();
    if (!hud) return;
    this.closeBody();
    if (!this.root) {
      this.root = hud.add.container(0, 0).setDepth(5000);
      this.root.add(hud.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0d1226, 0.8).setOrigin(0).setInteractive());
      sim.setPaused(true);
      this.input.enabled = false;
      this.escKey = hud.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC, false) ?? null;
      this.escKey?.on('down', this.onEsc, this);
    }
    if (announce) { this.echo = true; bus.emit('ui:open', { panel: which }); this.echo = false; }
    this.which = which;
    this.drawTabs(hud);
    this.body = which === 'inventory' ? new InventoryPanel(hud, this.root) : new TreePanel(hud, this.root, which === 'spells' ? 'spells' : 'skills');
  }

  private drawTabs(hud: Phaser.Scene): void {
    this.tabs.forEach((t) => t.destroy());
    const w = T.component.tab.width, h = T.component.tab.height, gap = 8;
    const x0 = GAME_WIDTH / 2 - (TABS.length * w + (TABS.length - 1) * gap) / 2;
    this.tabs = TABS.map(([label, key, target], i) => {
      const active = this.which === target;
      const c = hud.add.container(x0 + i * (w + gap), 20);
      const bg = hud.add.nineslice(0, 0, active ? 'ui:tab_active' : 'ui:tab', undefined, w, h, 8, 8, 8, 8).setOrigin(0);
      const lt = hud.add.text(0, h / 2, label, { fontFamily: '"Jersey 10"', fontSize: '24px', color: active ? '#fbf6e9' : '#b7c0e3' }).setOrigin(0, 0.5);
      const kt = hud.add.text(0, h / 2 + 2, key, { fontFamily: '"Jersey 10"', fontSize: '15px', color: '#7884b5' }).setOrigin(0, 0.5);
      lt.x = (w - (lt.width + 6 + kt.width)) / 2;
      kt.x = lt.x + lt.width + 6;
      c.add([bg, lt, kt]);
      c.setSize(w, h).setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains).on('pointerup', () => this.pick(target));
      return c;
    });
    const close = hud.add.container(GAME_WIDTH - 92, 20);
    const bg = hud.add.nineslice(0, 0, 'ui:btn_slate', undefined, 44, 44, 8, 8, 8, 8).setOrigin(0);
    close.add([bg, hud.add.text(22, 22, '✕', typeStyle('h3', C.text)).setOrigin(0.5)]);
    close.setSize(44, 44).setInteractive(new Phaser.Geom.Rectangle(0, 0, 44, 44), Phaser.Geom.Rectangle.Contains).on('pointerup', () => this.close());
    this.tabs.push(close);
    this.root!.add(this.tabs);
  }

  private pick(target: Target): void {
    if (MINE.includes(target as Which)) { if (target !== this.which) this.open(target as Which, true); return; }
    // Journal (Claude 4) / Map (Claude 2): step aside (unpausing), then hand over; they pause for themselves
    this.close();
    bus.emit('ui:open', { panel: target });
  }

  private onEsc(): void { if (this.which) this.close(); }

  private closeBody(): void { this.body?.destroy(); this.body = null; }

  /**
   * fromPause: Pause takes over the paused world, so leave the sim paused.
   * handover: another panel opens next and manages pause itself; we still emit ui:close for the HUD.
   */
  close(fromPause = false, handover = false): void {
    const was = this.which;
    this.closeBody();
    this.tabs.forEach((t) => t.destroy());
    this.tabs = [];
    if (this.escKey) { this.escKey.off('down', this.onEsc, this); this.hud()?.input.keyboard?.removeKey(this.escKey, false); }
    this.escKey = null;
    this.root?.destroy();
    this.root = null;
    this.which = null;
    if (!was) return;
    if (!fromPause && !handover) sim.setPaused(false);
    this.input.enabled = true;
    bus.emit('ui:close', { panel: was });
  }

  destroy(): void {
    this.close();
    this.offs.forEach((f) => f());
  }
}
