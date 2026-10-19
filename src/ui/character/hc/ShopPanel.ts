/**
 * Merchant screen (Claude 3): opens when dialogue sets flag shop.open = <npc id> (Claude 4), closes by clearing it.
 * Left: the merchant's stock with prices (trustPrice × Haggler); right: your pack with sell prices for what they buy.
 * Buy / sell are authority-validated acts; the pack and gold update from loot:granted / item:used.
 * Smiths with a runeforge get a second tab: pick a worn or carried piece, then reforge it to your level, set a gem
 * or salvage it for Iron Ingots (prices from rules/runeforge.ts, the same the authority charges).
 */
import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, SceneKeys } from '@/core/constants';
import { bus } from '@/core/EventBus';
import { getFlag, setFlag } from '@/core/flags';
import { Services } from '@/core/services';
import { sim } from '@/net/SimLoop';
import { trustPrice } from '@/narrative/engine/trust';
import { HC_CLASSES } from '@/data/classes/hc/classes.gen';
import { kitFor } from '@/data/classes/hc/kits';
import { shopByNpc, type HcShopDef } from '@/data/items/hc/shops';
import { GEMS, itemInfo } from '@/systems/rules/gear';
import { INGOT, reforgeCost, salvageYield, socketCost } from '@/systems/rules/runeforge';
import { itemTooltip } from '@/systems/rules/describeHc';
import { compileStats } from '@/systems/rules/playerStats';
import { buysItem, sellPrice, shopStock } from '@/systems/sim/shop';
import type { ItemInstance } from '@/systems/rules/types';
import { character, onCharacterChanged } from '@/systems/client/character';
import type { HeroInput } from '@/systems/input/HeroInput';
import { C, HCButton, panel, slot, tab, typeStyle } from '@/ui/kit/hc';
import { iconFrame } from './InventoryPanel';
import { showTooltip } from './tooltip';
import { rarityGlyph } from './glyph';

const CELL = 56, GAP = 8;

export class ShopPanel {
  private root: Phaser.GameObjects.Container | null = null;
  private shop: HcShopDef | null = null;
  private tip: Phaser.GameObjects.Container | null = null;
  private offs: (() => void)[] = [];
  private escKey: Phaser.Input.Keyboard.Key | null = null;
  private mode: 'trade' | 'forge' = 'trade';
  /** runeforge: the piece being worked on (uid) */
  private sel: string | null = null;

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
    if (this.shop?.id !== shop.id) { this.mode = 'trade'; this.sel = null; }
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

  private draw(): void {
    const hud = this.hud(), shop = this.shop, root = this.root;
    if (!hud || !shop || !root) return;
    root.removeAll(true);
    this.tip = null;
    const ch = character();
    const cls = HC_CLASSES.find((c) => c.id === ch.classId)!;
    const kit = kitFor(ch.classId);
    const equipped = Object.values(ch.equipment).filter((x): x is ItemInstance => !!x);
    root.add(hud.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0d1226, 0.8).setOrigin(0).setInteractive());
    // merchant
    root.add(panel(hud, 48, 84, 568, 604, 'panel_gold'));
    if (shop.runeforge) {
      root.add(tab(hud, 76, 96, 'Trade', this.mode === 'trade', () => { this.mode = 'trade'; this.draw(); }));
      root.add(tab(hud, 236, 96, 'Runeforge', this.mode === 'forge', () => { this.mode = 'forge'; this.draw(); }));
      root.add(hud.add.text(588, 108, shop.name, typeStyle('caption', C.gold)).setOrigin(1, 0));
    } else root.add(hud.add.text(76, 104, shop.name, typeStyle('h2', C.gold)));
    const mult = this.priceMult();
    if (mult < 1 && this.mode === 'trade') root.add(hud.add.text(588, 128, `${Math.round((1 - mult) * 100)}% off`, typeStyle('caption', C.good)).setOrigin(1, 0));
    if (this.mode === 'forge') this.drawForge(hud, root, equipped, cls.school, kit.weapons);
    const stock = shopStock(shop, { classId: ch.classId, level: ch.level, school: cls.school, weapons: kit.weapons }, (k) => getFlag(k), mult);
    if (this.mode === 'trade') stock.forEach((l, i) => {
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
        .on('pointerover', () => { this.hideTip(); this.tip = showTooltip(hud, root, itemTooltip(inst, equipped, cls.school, kit.weapons), { x, y, w: CELL }, info.rarity); })
        .on('pointerout', () => this.hideTip())
        .on('pointerup', () => { if (afford) this.act('buy', { shop: shop.id, item: l.item }); });
    });
    if (this.mode === 'trade') root.add(hud.add.text(76, 652, 'Click to buy', typeStyle('caption', C.text500)));
    // pack
    root.add(panel(hud, 648, 84, 584, 604, 'panel'));
    root.add(hud.add.text(676, 104, 'Your pack', typeStyle('h2', C.text)));
    root.add(hud.add.text(1204, 110, `${ch.gold} Embershards`, typeStyle('bodyL', C.gold)).setOrigin(1, 0));
    ch.inventory.slice(0, 8 * 7).forEach((it, i) => {
      const x = 676 + (i % 8) * (CELL + GAP), y = 156 + Math.floor(i / 8) * (CELL + 14);
      const info = itemInfo(it.base);
      const fr = slot(hud, x, y, CELL, (info?.rarity as never) ?? 'empty');
      root.add(fr);
      const f = iconFrame(it.base);
      const forge = this.mode === 'forge';
      const buys = forge ? !!info?.slot : buysItem(shop, it.base);
      if (f) root.add(hud.add.image(x + 28, y + 28, f.key, f.frame).setAlpha(buys ? 1 : 0.35));
      rarityGlyph(hud, root, it.base, x, y);
      if (it.qty > 1) root.add(hud.add.text(x + 52, y + 52, String(it.qty), typeStyle('badge', C.text)).setOrigin(1, 1));
      if (forge && this.sel === it.uid) root.add(hud.add.rectangle(x - 3, y - 3, CELL + 6, CELL + 6).setOrigin(0).setStrokeStyle(2, 0xffd23f));
      fr.setInteractive({ useHandCursor: buys })
        .on('pointerover', () => {
          this.hideTip();
          const lines = itemTooltip(it, equipped, cls.school, kit.weapons);
          if (forge) { if (buys) lines.push({ text: 'Click to work on it', color: 'gold', size: 's' }); }
          else lines.push(buys ? { text: `Sell for ${sellPrice(it.base, it.ilvl) * it.qty}`, color: 'gold', size: 'b' } : { text: 'This merchant doesn’t buy that.', color: 'danger', size: 's' });
          this.tip = showTooltip(hud, root, lines, { x, y, w: CELL }, info?.rarity);
        })
        .on('pointerout', () => this.hideTip())
        .on('pointerup', () => { if (!buys) return; if (forge) { this.sel = it.uid; this.draw(); } else this.act('sell', { shop: shop.id, uid: it.uid }); });
    });
    root.add(hud.add.text(676, 652, this.mode === 'forge' ? 'Click a piece to work on it' : 'Click to sell', typeStyle('caption', C.text500)));
    // close
    const close = hud.add.text(1210, 30, '×', typeStyle('h1', C.text)).setOrigin(0.5).setInteractive({ useHandCursor: true });
    close.on('pointerup', () => this.close(false));
    root.add(close);
  }

  /** Runeforge tab: worn pieces to pick from, then the three services for the selected piece. */
  private drawForge(hud: Phaser.Scene, root: Phaser.GameObjects.Container, equipped: ItemInstance[], school: string, weapons: string[]): void {
    const ch = character(), shop = this.shop!;
    root.add(hud.add.text(76, 156, 'Worn', typeStyle('h3', C.gold)));
    equipped.forEach((it, i) => {
      const x = 76 + (i % 8) * (CELL + GAP), y = 184 + Math.floor(i / 8) * (CELL + GAP);
      const info = itemInfo(it.base);
      const fr = slot(hud, x, y, CELL, (info?.rarity as never) ?? 'empty');
      root.add(fr);
      const f = iconFrame(it.base);
      if (f) root.add(hud.add.image(x + 28, y + 28, f.key, f.frame));
      rarityGlyph(hud, root, it.base, x, y);
      if (this.sel === it.uid) root.add(hud.add.rectangle(x - 3, y - 3, CELL + 6, CELL + 6).setOrigin(0).setStrokeStyle(2, 0xffd23f));
      fr.setInteractive({ useHandCursor: true })
        .on('pointerover', () => { this.hideTip(); this.tip = showTooltip(hud, root, itemTooltip(it, equipped, school as never, weapons as never), { x, y, w: CELL }, info?.rarity); })
        .on('pointerout', () => this.hideTip())
        .on('pointerup', () => { this.sel = it.uid; this.draw(); });
    });
    const ingots = ch.inventory.filter((x) => x.base === INGOT).reduce((a, x) => a + x.qty, 0);
    root.add(hud.add.text(76, 652, `Iron Ingots: ${ingots}   ·   pick a worn piece here or one from your pack`, typeStyle('caption', C.text500)));
    const worn = equipped.find((x) => x.uid === this.sel);
    const it = worn ?? ch.inventory.find((x) => x.uid === this.sel);
    if (!it) { root.add(hud.add.text(76, 320, 'Choose a piece to work on.', typeStyle('body', C.text300))); return; }
    const info = itemInfo(it.base)!;
    root.add(hud.add.text(76, 316, info.name, typeStyle('h3', C.gold)));
    root.add(hud.add.text(76, 342, `Item level ${it.ilvl}${it.gem ? `  ·  ${itemInfo(it.gem)?.name} set` : ''}`, typeStyle('caption', C.text300)));
    // reforge
    const rc = reforgeCost(it, ch.level);
    const canRe = !!rc && ch.gold >= rc.gold && ingots >= rc.ingots;
    root.add(new HCButton(hud, 226, 404, rc ? `Reforge to level ${rc.to}` : 'Already at your level', () => this.act('reforge', { shop: shop.id, uid: it.uid }),
      { w: 300, disabled: !canRe, sub: rc ? `${rc.gold} Embershards · ${rc.ingots} Iron Ingot${rc.ingots > 1 ? 's' : ''}` : undefined }));
    // socket
    const gems = ch.inventory.filter((x) => GEMS[x.base]);
    const sc0 = socketCost(it, 'i_ruby');
    root.add(hud.add.text(76, 452, sc0 === null ? 'No socket (runed or finer gear only)' : it.gem ? 'Set a new gem (the old one is lost):' : 'Set a gem:', typeStyle('body', sc0 === null ? C.text500 : C.text)));
    if (sc0 !== null) gems.slice(0, 8).forEach((g, i) => {
      const x = 76 + i * (CELL + GAP), y = 480;
      const cost = socketCost(it, g.base)!;
      const afford = ch.gold >= cost;
      const fr = slot(hud, x, y, CELL, (itemInfo(g.base)?.rarity as never) ?? 'empty');
      root.add(fr);
      const f = iconFrame(g.base);
      if (f) root.add(hud.add.image(x + 28, y + 28, f.key, f.frame).setAlpha(afford ? 1 : 0.4));
      root.add(hud.add.text(x + 28, y + CELL + 2, String(cost), typeStyle('badge', afford ? C.gold : C.danger)).setOrigin(0.5, 0));
      fr.setInteractive({ useHandCursor: afford })
        .on('pointerover', () => { this.hideTip(); this.tip = showTooltip(hud, root, [{ text: itemInfo(g.base)!.name, color: 'gold', size: 'b' }, { text: GEMS[g.base].label, color: 'good', size: 's' }, { text: `Set it for ${cost} Embershards`, color: 'dim', size: 's' }], { x, y, w: CELL }, itemInfo(g.base)?.rarity); })
        .on('pointerout', () => this.hideTip())
        .on('pointerup', () => { if (afford) this.act('socket', { shop: shop.id, uid: it.uid, gem: g.base }); });
    });
    if (sc0 !== null && !gems.length) root.add(hud.add.text(76, 484, 'You carry no gems (Pell sells them).', typeStyle('caption', C.text500)));
    // salvage
    const y = salvageYield(it);
    root.add(new HCButton(hud, 226, 600, worn ? 'Take it off to salvage' : y ? 'Salvage' : 'The smith won’t break that', () => { this.sel = null; this.act('salvage', { shop: shop.id, uid: it.uid }); },
      { w: 300, variant: 'secondary', disabled: !!worn || !y, sub: y && !worn ? `→ ${y.ingots} Iron Ingot${y.ingots > 1 ? 's' : ''}${y.gem ? ' + its gem' : ''}` : undefined }));
  }

  private act(action: 'buy' | 'sell' | 'reforge' | 'socket' | 'salvage', args: Record<string, string>): void {
    this.hideTip();
    Services.get('net').send({ type: 'act', domain: 'systems', action, args });
  }

  private hideTip(): void { this.tip?.destroy(); this.tip = null; }

  private onEsc(): void { this.close(false); }

  close(fromPause: boolean): void {
    if (!this.root) return;
    if (this.escKey) { this.escKey.off('down', this.onEsc, this); this.hud()?.input.keyboard?.removeKey(this.escKey, false); }
    this.escKey = null;
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
