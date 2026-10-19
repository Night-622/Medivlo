/**
 * Full-screen character panels in the HUD scene (boards 8d/8e/8f):
 *   Tab / I / C  inventory + equipment + stats      K  skill tree      B  spellbook + loadout      Esc  close
 * Opening emits ui:open (world + combat pause); closing emits ui:close.
 */
import Phaser from 'phaser';
import { bus } from '@/core';
import { palette as P } from '@/ui/kit';
import type { CombatRuntime } from '@/systems/runtime/CombatRuntime';
import { InventoryPanel } from './InventoryPanel';
import { SkillTreePanel } from './SkillTreePanel';
import { SpellbookPanel } from './SpellbookPanel';
import { RunecraftPanel } from './RunecraftPanel';
import { ShopPanel } from './ShopPanel';
import { C, tooltipFrame, txt } from './px';

export type PanelId = 'inventory' | 'skills' | 'spellbook' | 'runecraft' | 'shop';

export interface PanelView {
  readonly container: Phaser.GameObjects.Container;
  refresh(): void;
  destroy(): void;
}

export interface TipLine { text: string; color?: string; size?: 'title' | 'body' | 'micro'; gap?: boolean }
export interface TipBlock { lines: TipLine[]; accent: number; label?: string }

/** Pixel tooltip: one block, or two side by side (equipped vs hovered). */
export class Tooltip {
  private root: Phaser.GameObjects.Container;
  constructor(private readonly scene: Phaser.Scene) {
    this.root = scene.add.container(0, 0).setDepth(1000).setVisible(false);
  }

  private block(b: TipBlock, x: number, y: number, w: number): number {
    const s = this.scene;
    const g = s.add.graphics();
    this.root.add(g);
    let cy = y + 12;
    const texts: Phaser.GameObjects.Text[] = [];
    if (b.label) { texts.push(txt(s, x + 14, cy, b.label, 'micro', C.muted)); cy += 18; }
    for (const l of b.lines) {
      if (l.gap) { cy += 6; continue; }
      const t = txt(s, x + 14, cy, l.text, l.size === 'title' ? 'titleS' : l.size === 'micro' ? 'micro' : 'bodyS', l.color ?? C.text, w - 28);
      texts.push(t);
      cy += Math.ceil(t.height) + 2;
    }
    const h = cy - y + 10;
    tooltipFrame(g, x, y, w, h, b.accent);
    this.root.add(texts);
    return h;
  }

  show(main: TipBlock, compare?: TipBlock): void {
    this.root.removeAll(true);
    const ptr = this.scene.input.activePointer;
    const W = this.scene.scale.width, H = this.scene.scale.height;
    const w = 280;
    const total = compare ? w * 2 + 12 : w;
    let x = Math.round(ptr.x + 20), y = Math.round(ptr.y + 16);
    if (x + total > W - 8) x = Math.round(ptr.x - total - 16);
    if (x < 8) x = 8;
    const h1 = this.block(main, compare ? x + w + 12 : x, y, w);
    const h2 = compare ? this.block(compare, x, y, w) : 0;
    const over = y + Math.max(h1, h2) - (H - 8);
    if (over > 0) this.root.setY(-over); else this.root.setY(0);
    this.root.setVisible(true);
  }

  hide(): void { this.root.setVisible(false); this.root.removeAll(true); }
  destroy(): void { this.root.destroy(true); }
}

export class CharacterPanels {
  private open: PanelId | null = null;
  private view?: PanelView;
  readonly tooltip: Tooltip;
  private keyHandler: (ev: KeyboardEvent) => void;
  private offStats: () => void;
  private offInteract: () => void;
  private offShop: () => void;
  /** open the shop once the merchant dialogue has closed */
  private pendingShop = false;

  constructor(private readonly scene: Phaser.Scene, readonly rt: CombatRuntime) {
    this.tooltip = new Tooltip(scene);
    const kb = scene.input.keyboard!;
    kb.addCapture('TAB');
    this.keyHandler = (ev: KeyboardEvent) => {
      if (this.rt.paused && !this.open) return; // dialogue/journal owns input
      if (ev.code === 'Escape' && this.open) { this.close(); return; }
      const map: Record<string, PanelId> = { Tab: 'inventory', KeyI: 'inventory', KeyC: 'inventory', KeyK: 'skills', KeyB: 'spellbook' };
      const id = map[ev.code];
      if (!id) return;
      if (this.open === id) this.close();
      else this.show(id);
    };
    kb.on('keydown', this.keyHandler);
    this.offStats = bus.on('stats:changed', () => this.view?.refresh());
    // Runecraft stations: any world object with props.station = forge | runeforge | anvil
    this.offInteract = bus.on('interact', ({ props }) => {
      const st = props.station;
      if (st === 'forge' || st === 'runeforge' || st === 'anvil') this.show('runecraft');
    });
    // Merchants: narrative sets flag shop.open = <npc id> (e.g. a "Let me see your wares" choice)
    this.offShop = bus.on('flag:changed', ({ key, value }) => {
      if (key === 'shop.open' && typeof value === 'string' && value) this.pendingShop = true;
    });
  }

  get isOpen(): boolean { return this.open !== null; }

  show(id: PanelId): void {
    const was = this.open;
    this.teardownView();
    this.open = id;
    const ctor = { inventory: InventoryPanel, skills: SkillTreePanel, spellbook: SpellbookPanel, runecraft: RunecraftPanel, shop: ShopPanel }[id];
    this.view = new ctor(this.scene, this);
    this.view.container.setDepth(900);
    if (was) bus.emit('ui:close', { panel: `character:${was}` });
    bus.emit('ui:open', { panel: `character:${id}` });
  }

  close(): void {
    if (!this.open) return;
    const id = this.open;
    this.teardownView();
    this.open = null;
    bus.emit('ui:close', { panel: `character:${id}` });
  }

  private teardownView(): void {
    this.tooltip.hide();
    this.view?.destroy();
    this.view = undefined;
  }

  /** shared footer: panel hotkeys */
  footer(container: Phaser.GameObjects.Container, y: number): void {
    container.add(txt(this.scene, 640, y, 'TAB INVENTORY   ·   K SKILLS   ·   B SPELLBOOK   ·   ESC CLOSE', 'micro', C.muted).setOrigin(0.5, 0));
  }

  update(): void {
    if (this.pendingShop && !this.rt.paused) { this.pendingShop = false; this.show('shop'); }
  }

  destroy(): void {
    if (this.open) this.close();
    this.scene.input.keyboard?.off('keydown', this.keyHandler);
    this.offStats();
    this.offInteract();
    this.offShop();
    this.tooltip.destroy();
  }
}

export { P };
