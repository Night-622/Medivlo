/**
 * Merchant screen (Claude 3): opens when dialogue sets flag shop.open = <npc id> (Claude 4), closes by clearing it.
 * Left: the merchant's stock with prices (trustPrice × Haggler); right: your pack with sell prices for what they buy.
 * Buy / sell are authority-validated acts; the pack and gold update from loot:granted / item:used.
 * Smiths with a runeforge get a second tab with the Runeforge services (ForgeTabs.ts: Reforge, Sockets, Upgrade,
 * Reroll, Imbue, Transfer, Craft, Salvage); prices from rules/runeforge.ts, the same the authority charges.
 */
import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, SceneKeys } from '@/core/constants';
import { bus } from '@/core/EventBus';
import { getFlag, setFlag } from '@/core/flags';
import { Services } from '@/core/services';
import { sim } from '@/net/SimLoop';
import { trustPrice } from '@/narrative/engine/trust';
import { HC_CLASSES } from '@/data/classes/hc/classes.gen';
import { SCHOOL_COLOR } from '@/data/classes/hc';
import { kitFor } from '@/data/classes/hc/kits';
import { shopByNpc, type HcShopDef } from '@/data/items/hc/shops';
import { itemInfo, slotsFor } from '@/systems/rules/gear';
import { itemRarity } from '@/systems/rules/affixes';
import { compareLines, itemTooltip, type TipLine } from '@/systems/rules/describeHc';
import { compileStats } from '@/systems/rules/playerStats';
import { buysItem, sellPrice, shopStock } from '@/systems/sim/shop';
import type { ItemInstance, SchoolId } from '@/systems/rules/types';
import { character, onCharacterChanged } from '@/systems/client/character';
import type { HeroInput } from '@/systems/input/HeroInput';
import { C, panel, slot, tab, typeStyle } from '@/ui/kit/hc';
import { iconFrame } from './InventoryPanel';
import { showTooltip } from './tooltip';
import { rarityGlyph } from './glyph';
import { drawForge, forgeFits, forgePrice, newForgeState, type ForgeAction, type ForgeCtx } from './ForgeTabs';
import { navClear, navRefresh } from './panelNav';

const CELL = 56, GAP = 8;

export class ShopPanel {
  private root: Phaser.GameObjects.Container | null = null;
  private shop: HcShopDef | null = null;
  private tip: Phaser.GameObjects.Container | null = null;
  private offs: (() => void)[] = [];
  private escKey: Phaser.Input.Keyboard.Key | null = null;
  private mode: 'trade' | 'forge' = 'trade';
  /** runeforge: the tab, the piece being worked on and the sub-picks */
  private forge = newForgeState();

  constructor(private world: Phaser.Scene, private input: HeroInput) {
    this.offs.push(bus.on('flag:changed', (e) => {
      if (e.key !== 'shop.open') return;
      const npc = typeof e.value === 'string' ? e.value : '';
      if (npc) this.open(npc); else this.close(false);
    }));
    this.offs.push(onCharacterChanged(() => this.draw()));
    this.offs.push(bus.on('ui:open', (e) => { if (e.panel === 'pause') this.close(true); }));
  }

  private hud(): Phaser.Scene | null {
    const s = this.world.scene.get(SceneKeys.HudV2);
    return s && s.sys.isActive() ? s : null;
  }

  open(npc: string): void {
    const shop = shopByNpc(npc), hud = this.hud();
    if (!shop || !hud) return;
    if (this.shop?.id !== shop.id) { this.mode = 'trade'; this.forge = newForgeState(); }
    this.shop = shop;
    if (!this.root) {
      sim.setPaused(true); this.input.enabled = false;
      // Esc closes the shop (it never falls through to Pause); the HUD tracks open panels via ui:open / ui:close
      this.escKey = hud.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC, false) ?? null;
      this.escKey?.on('down', this.onEsc, this);
      bus.emit('ui:open', { panel: 'shop' });
    }
    this.root?.destroy();
    this.root = hud.add.container(0, 0).setDepth(5000);
    this.draw();
  }

  private priceMult(): number {
    const ch = character();
    return trustPrice(this.shop!.npc as never) * (1 - (compileStats(ch).hooks.get('shopDiscount') ?? 0));
  }

  private showTip(hud: Phaser.Scene, root: Phaser.GameObjects.Container, lines: TipLine[], at: { x: number; y: number; w: number }, rarity: string | undefined, school: SchoolId): void {
    this.hideTip();
    this.tip = showTooltip(hud, root, lines, at, rarity, SCHOOL_COLOR[school]);
  }

  private draw(): void {
    const hud = this.hud(), shop = this.shop, root = this.root;
    if (!hud || !shop || !root) return;
    root.removeAll(true);
    this.tip = null;
    const ch = character();
    const cls = HC_CLASSES.find((c) => c.id === ch.classId)!;
    const kit = kitFor(ch.classId);
    const equipped = Object.values(ch.equipment).filter((x): x is ItemInstance => !!x);
    const forge = this.mode === 'forge';
    root.add(hud.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0d1226, 0.8).setOrigin(0).setInteractive());
    // merchant
    root.add(panel(hud, 48, 84, 568, 604, 'panel_gold'));
    if (shop.runeforge) {
      root.add(tab(hud, 76, 96, 'Trade', !forge, () => { this.mode = 'trade'; this.draw(); }));
      root.add(tab(hud, 236, 96, 'Runeforge', forge, () => { this.mode = 'forge'; this.draw(); }));
      root.add(hud.add.text(588, 108, shop.name, typeStyle('caption', C.gold)).setOrigin(1, 0));
    } else root.add(hud.add.text(76, 104, shop.name, typeStyle('h2', C.gold)));
    const mult = this.priceMult();
    if (mult < 1 && !forge) root.add(hud.add.text(588, 128, `${Math.round((1 - mult) * 100)}% off`, typeStyle('caption', C.good)).setOrigin(1, 0));
    if (forge) drawForge(this.ctx(hud, root, equipped, cls.school, kit.weapons));
    const stock = shopStock(shop, { classId: ch.classId, level: ch.level, school: cls.school, weapons: kit.weapons }, (k) => getFlag(k), mult);
    if (!forge) stock.forEach((l, i) => {
      const x = 76 + (i % 8) * (CELL + GAP), y = 156 + Math.floor(i / 8) * (CELL + 30);
      const info = itemInfo(l.item)!;
      const fr = slot(hud, x, y, CELL, info.rarity as never);
      root.add(fr);
      const f = iconFrame(l.item);
      if (f) root.add(hud.add.image(x + 28, y + 28, f.key, f.frame));
      rarityGlyph(hud, root, l.item, x, y);
      const afford = ch.gold >= l.price;
      root.add(hud.add.text(x + 28, y + CELL + 2, String(l.price), typeStyle('badge', afford ? C.gold : C.danger)).setOrigin(0.5, 0));
      const inst: ItemInstance = { uid: 'shop', base: l.item, ilvl: l.ilvl, qty: 1 };
      fr.setInteractive({ useHandCursor: afford })
        .on('pointerover', () => this.showTip(hud, root, [...itemTooltip(inst, equipped, cls.school, kit.weapons), ...this.compare(inst)], { x, y, w: CELL }, info.rarity, cls.school))
        .on('pointerout', () => this.hideTip())
        .on('pointerup', () => { if (afford) this.act('buy', { shop: shop.id, item: l.item }); });
    });
    if (!forge) root.add(hud.add.text(76, 652, 'Click (or arrows + Enter) to buy', typeStyle('caption', C.text500)));
    // pack
    root.add(panel(hud, 648, 84, 584, 604, 'panel'));
    root.add(hud.add.text(676, 104, 'Your pack', typeStyle('h2', C.text)));
    root.add(hud.add.text(1204, 110, `${ch.gold} Embershards`, typeStyle('bodyL', C.gold)).setOrigin(1, 0));
    const ft = this.forge;
    ch.inventory.slice(0, 8 * 7).forEach((it, i) => {
      const x = 676 + (i % 8) * (CELL + GAP), y = 156 + Math.floor(i / 8) * (CELL + 14);
      const info = itemInfo(it.base), rar = itemRarity(it);
      const fr = slot(hud, x, y, CELL, (info ? rar as never : 'empty'));
      root.add(fr);
      const f = iconFrame(it.base);
      // forge: gear can be picked on every tab (dimmed where the tab's service does not apply); craft picks recipes
      const pick = forge && !!info?.slot && ft.tab !== 'craft';
      const lit = forge ? (ft.tab === 'craft' ? true : forgeFits(ft.tab, it, ch, false)) : buysItem(shop, it.base);
      if (f) root.add(hud.add.image(x + 28, y + 28, f.key, f.frame).setAlpha(lit ? 1 : 0.35));
      rarityGlyph(hud, root, it.base, x, y, rar);
      if (it.qty > 1) root.add(hud.add.text(x + 52, y + 52, String(it.qty), typeStyle('badge', C.text)).setOrigin(1, 1));
      const price = pick ? forgePrice(ft.tab, it, ch, false) : null;
      if (price) root.add(hud.add.text(x + 28, y + CELL - 3, price.text, typeStyle('badge', price.ok ? C.gold : C.danger)).setOrigin(0.5, 1).setStroke('#1a1230', 3));
      if (pick && ft.sel === it.uid) root.add(hud.add.rectangle(x - 3, y - 3, CELL + 6, CELL + 6).setOrigin(0).setStrokeStyle(2, 0xffd23f));
      const buys = !forge && lit;
      fr.setInteractive({ useHandCursor: forge ? pick : buys })
        .on('pointerover', () => {
          const lines = itemTooltip(it, equipped, cls.school, kit.weapons);
          if (info?.slot) lines.push(...this.compare(it));
          if (forge) { if (pick) lines.push({ text: 'Click to work on it', color: 'gold', size: 's' }); }
          else lines.push(buys ? { text: `Sell for ${sellPrice(it) * it.qty}`, color: 'gold', size: 'b' } : { text: 'This merchant doesn’t buy that.', color: 'danger', size: 's' });
          this.showTip(hud, root, lines, { x, y, w: CELL }, rar, cls.school);
        })
        .on('pointerout', () => this.hideTip())
        .on('pointerup', () => {
          if (forge) { if (pick) { ft.sel = it.uid; ft.socket = -1; ft.src = null; this.draw(); } return; }
          if (buys) this.act('sell', { shop: shop.id, uid: it.uid });
        });
    });
    root.add(hud.add.text(676, 652, forge ? (ft.tab === 'craft' ? 'Runes you craft land here' : 'Click a piece to work on it') : 'Click to sell', typeStyle('caption', C.text500)));
    // close: the same slate ✕ button as the Pack / Skills / Spells bar, in the same place
    const close = hud.add.container(GAME_WIDTH - 92, 20);
    const closeBg = hud.add.nineslice(0, 0, 'ui:btn_slate', undefined, 44, 44, 8, 8, 8, 8).setOrigin(0);
    close.add([closeBg, hud.add.text(22, 22, '✕', typeStyle('h3', C.text)).setOrigin(0.5)]);
    closeBg.setInteractive({ useHandCursor: true }).on('pointerup', () => this.close(false));
    root.add(close);
    navRefresh(hud, root);
  }

  /** "Compared with what you wear" for an unworn piece (the slot it would take). */
  private compare(it: ItemInstance): TipLine[] {
    const ch = character(), info = itemInfo(it.base);
    if (!info?.slot || Object.values(ch.equipment).some((e) => e?.uid === it.uid)) return [];
    return compareLines(it, slotsFor(info).map((s) => ch.equipment[s]).find(Boolean) ?? undefined);
  }

  private ctx(hud: Phaser.Scene, root: Phaser.GameObjects.Container, equipped: ItemInstance[], school: SchoolId, weapons: string[]): ForgeCtx {
    return {
      hud, root, shop: this.shop!.id, ch: character(), equipped, school, weapons, st: this.forge,
      redraw: () => this.draw(),
      act: (a, args) => this.act(a, args),
      tip: (lines, at, rarity) => this.showTip(hud, root, lines, at, rarity, school),
      hideTip: () => this.hideTip(),
    };
  }

  private act(action: 'buy' | 'sell' | ForgeAction, args: Record<string, string | number>): void {
    this.hideTip();
    Services.get('net').send({ type: 'act', domain: 'systems', action, args });
  }

  private hideTip(): void { this.tip?.destroy(); this.tip = null; }

  private onEsc(): void { this.close(false); }

  close(fromPause: boolean): void {
    if (!this.root) return;
    if (this.escKey) { this.escKey.off('down', this.onEsc, this); this.hud()?.input.keyboard?.removeKey(this.escKey, false); }
    this.escKey = null;
    const hud = this.hud();
    if (hud) navClear(hud);
    this.root.destroy();
    this.root = null;
    this.shop = null;
    this.input.enabled = true;
    if (!fromPause) sim.setPaused(false);
    if (getFlag('shop.open')) setFlag('shop.open', '');
    bus.emit('ui:close', { panel: 'shop' });
  }

  destroy(): void { this.close(false); this.offs.forEach((f) => f()); }
}
