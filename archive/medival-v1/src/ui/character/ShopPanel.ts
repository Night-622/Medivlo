/** Merchant panel: their stock (buy) | your pack (sell). Prices follow reputation (rep.price.<faction>). */
import Phaser from 'phaser';
import { Registry, getFlag, setFlag } from '@/core';
import type { ItemInstance } from '@/core';
import { drawFrame, palette as P } from '@/ui/kit';
import { bagItems } from '@/systems/items/Inventory';
import { buy, buyPrice, canSellToShop, rollStock, sell, sellPrice, shopFor, type ShopContext } from '@/systems/items/Shop';
import type { CharacterPanels, PanelView } from './CharacterPanels';
import { itemTip } from './itemText';
import { C, dimScreen, header, hotspot, itemSlot, txt, vrule } from './px';

export class ShopPanel implements PanelView {
  readonly container: Phaser.GameObjects.Container;
  private ctx: ShopContext | null;
  private stock: ItemInstance[] = [];

  constructor(private readonly scene: Phaser.Scene, private readonly mgr: CharacterPanels) {
    this.container = scene.add.container(0, 0);
    const npc = String(getFlag('shop.open') ?? '');
    this.ctx = npc ? shopFor(npc) : null;
    const p = mgr.rt.player;
    if (this.ctx) this.stock = rollStock(this.ctx, p.level, p.stats.collected.proficientWeapons);
    this.refresh();
  }

  private get gs() { return this.mgr.rt.player.gs; }
  private discount(): number {
    return this.mgr.rt.player.stats.collected.procs.reduce((a, e) => a + (e.kind === 'hook' && e.hook === 'shopDiscount' ? Number(e.params?.pct ?? 0) : 0), 0);
  }

  refresh(): void {
    const s = this.scene, c = this.container, gs = this.gs;
    c.removeAll(true);
    this.mgr.tooltip.hide();
    const g = s.add.graphics();
    c.add(g);
    dimScreen(s, g);
    drawFrame(g, 'wood', 32, 32, 1216, 656);
    c.add(s.add.zone(0, 0, s.scale.width, s.scale.height).setOrigin(0).setInteractive());
    const ctx = this.ctx;
    if (!ctx) { c.add(txt(s, 60, 80, 'There is nothing to buy here.', 'bodyM', C.text)); this.mgr.footer(c, 666); return; }
    const npcName = (Registry.tryGet('npc', ctx.npcId) as { name?: string } | undefined)?.name ?? '';
    c.add(txt(s, 56, 44, ctx.shop.name, 'titleL', C.gold));
    c.add(txt(s, 56, 100, `${npcName}${ctx.shop.greeting ? `: “${ctx.shop.greeting}”` : ''}`, 'bodyS', C.text2, 560));
    const mult = ctx.priceMult * (1 - this.discount());
    const repLine = ctx.faction ? `${String(getFlag(`rep.tier.${ctx.faction}`) ?? 'Neutral')} with ${ctx.faction.replace(/-/g, ' ')}` : 'No faction';
    c.add(txt(s, 1220, 52, `${repLine} · prices ×${mult.toFixed(2)}`, 'bodyS', mult > 1 ? C.bad : mult < 1 ? C.good : C.text2).setOrigin(1, 0));
    c.add(txt(s, 1220, 76, `Gold: ${gs.player.inventory.gold}`, 'bodyM', C.goldHi).setOrigin(1, 0));
    if (ctx.refuse) {
      c.add(txt(s, 56, 160, '“Not to you. Not for any coin.” They will not trade while you are Hated.', 'bodyM', C.bad, 1100));
      this.mgr.footer(c, 666);
      return;
    }
    // stock (buy)
    c.add(header(s, 56, 138, 'For sale: click to buy'));
    this.stock.slice(0, 24).forEach((inst, i) => {
      const x = 56 + (i % 4) * 136, y = 176 + Math.floor(i / 4) * 76;
      const def = Registry.tryGet('item', inst.def);
      if (!def) return;
      const price = buyPrice(ctx, def, inst, this.discount());
      itemSlot(g, def, inst.rarity, x, y, 48);
      c.add(txt(s, x + 54, y + 4, def.name, 'micro', C.text, 76));
      c.add(txt(s, x + 54, y + 30, `${price} g`, 'bodyS', gs.player.inventory.gold >= price ? C.goldHi : C.bad));
      hotspot(s, c, x, y, 130, 48, {
        over: () => this.mgr.tooltip.show(itemTip(gs, inst, `BUY · ${price} GOLD`)),
        out: () => this.mgr.tooltip.hide(),
        click: () => { const err = buy(gs, ctx, inst, this.discount()); this.mgr.rt.ui?.toast(err ?? `Bought ${def.name}`, err ? C.bad : C.gold); this.refresh(); },
      });
    });
    vrule(g, 620, 52, 616);
    // pack (sell)
    c.add(header(s, 644, 138, 'Your pack: click to sell'));
    const bag = bagItems(gs).filter((i) => !canSellToShop(ctx, gs, i));
    bag.slice(0, 40).forEach((inst, i) => {
      const x = 644 + (i % 8) * 72, y = 176 + Math.floor(i / 8) * 76;
      const def = Registry.tryGet('item', inst.def);
      if (!def) return;
      const price = sellPrice(ctx, inst);
      itemSlot(g, def, inst.rarity, x, y, 48);
      if (inst.qty > 1) c.add(txt(s, x + 44, y + 30, `${inst.qty}`, 'micro', C.text).setOrigin(1, 0));
      c.add(txt(s, x + 24, y + 52, `${price}g`, 'micro', C.goldHi).setOrigin(0.5, 0));
      hotspot(s, c, x, y, 48, 48, {
        over: () => this.mgr.tooltip.show(itemTip(gs, inst, `SELL · ${price} GOLD`)),
        out: () => this.mgr.tooltip.hide(),
        click: () => { const err = sell(gs, ctx, inst.uid); this.mgr.rt.ui?.toast(err ?? `Sold ${def.name} for ${price} gold`, err ? C.bad : C.text); this.refresh(); },
      });
    });
    if (!bag.length) c.add(txt(s, 644, 180, 'Nothing they would buy.', 'bodyS', C.muted));
    g.fillStyle(P['ink-900'], 1);
    this.mgr.footer(c, 666);
  }

  destroy(): void {
    if (getFlag('shop.open')) setFlag('shop.open', undefined);
    this.container.destroy(true);
  }
}
