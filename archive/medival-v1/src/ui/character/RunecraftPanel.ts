/**
 * Runecraft station (forge / runeforge): upgrade, salvage, reroll affixes. Opened by interacting with a world
 * object whose props carry `station: 'forge' | 'runeforge' | 'anvil'` (placed by Claude 2).
 */
import Phaser from 'phaser';
import { Registry } from '@/core';
import type { ItemId, ItemInstance } from '@/core';
import { drawFrame, palette as P } from '@/ui/kit';
import { describeModifier } from '@/systems/describe';
import { countItem, equippedUids } from '@/systems/items/Inventory';
import { isGear } from '@/systems/items/ItemRoller';
import { MAX_UPGRADE_NOW, canReroll, canSalvage, canUpgrade, rerollAffix, salvage, salvageYield, upgrade, type Cost } from '@/systems/items/Runecraft';
import type { CharacterPanels, PanelView } from './CharacterPanels';
import { itemTip } from './itemText';
import { C, dimScreen, header, hotspot, ironButton, itemSlot, rarityCssOf, txt, vrule } from './px';

const MATS: ItemId[] = ['item:iron-scrap', 'item:ley-dust', 'item:essence-ash', 'item:essence-rime', 'item:drowned-silver-flake'];

export class RunecraftPanel implements PanelView {
  readonly container: Phaser.GameObjects.Container;
  private selected: string | null = null;

  constructor(private readonly scene: Phaser.Scene, private readonly mgr: CharacterPanels) {
    this.container = scene.add.container(0, 0);
    this.refresh();
  }

  private get gs() { return this.mgr.rt.player.gs; }

  private costText(cost: Cost | undefined): string {
    if (!cost) return '';
    const parts = cost.items.map((c) => `${c.qty}× ${Registry.tryGet('item', c.item)?.name ?? c.item}`);
    if (cost.gold) parts.push(`${cost.gold} gold`);
    return parts.join(' · ');
  }

  refresh(): void {
    const s = this.scene, c = this.container, gs = this.gs;
    c.removeAll(true);
    this.mgr.tooltip.hide();
    const g = s.add.graphics();
    c.add(g);
    dimScreen(s, g);
    drawFrame(g, 'stone', 32, 32, 1216, 656);
    c.add(s.add.zone(0, 0, s.scale.width, s.scale.height).setOrigin(0).setInteractive());
    c.add(txt(s, 56, 44, 'Runecraft', 'titleL', C.gold));
    c.add(txt(s, 300, 64, 'Vor, the Hammer: craft, war, endurance', 'bodyS', C.text2));

    // gear list
    const eq = equippedUids(gs);
    const gear = gs.player.inventory.items.filter((i) => { const d = Registry.tryGet('item', i.def); return d && isGear(d); });
    gear.sort((a, b) => Number(eq.has(b.uid)) - Number(eq.has(a.uid)));
    if (!this.selected || !gear.some((i) => i.uid === this.selected)) this.selected = gear[0]?.uid ?? null;
    c.add(header(s, 56, 108, 'Your gear'));
    gear.slice(0, 40).forEach((inst, i) => {
      const x = 56 + (i % 8) * 56, y = 146 + Math.floor(i / 8) * 56;
      const def = Registry.tryGet('item', inst.def);
      itemSlot(g, def, inst.rarity, x, y, 48, inst.uid === this.selected ? 'selected' : 'normal');
      if (eq.has(inst.uid)) g.fillStyle(P['gold-400'], 1).fillRect(x + 6, y + 38, 4, 4);
      if (inst.upgrade) c.add(txt(s, x + 44, y + 4, `+${inst.upgrade}`, 'micro', C.goldHi).setOrigin(1, 0));
      hotspot(s, c, x, y, 48, 48, {
        over: () => this.mgr.tooltip.show(itemTip(gs, inst, eq.has(inst.uid) ? 'EQUIPPED' : undefined)),
        out: () => this.mgr.tooltip.hide(),
        click: () => { this.selected = inst.uid; this.refresh(); },
      });
    });
    c.add(txt(s, 56, 440, '● gold pip = equipped', 'micro', C.muted));
    // materials
    c.add(header(s, 56, 476, 'Materials'));
    MATS.forEach((id, i) => {
      const def = Registry.tryGet('item', id);
      if (!def) return;
      const x = 56 + (i % 3) * 150, y = 512 + Math.floor(i / 3) * 56;
      itemSlot(g, def, 'common', x, y, 40);
      c.add(txt(s, x + 48, y + 4, def.name.replace(/^Essence of /, 'Essence: ').replace(/ Flake$/, ''), 'micro', C.text2));
      c.add(txt(s, x + 48, y + 22, `× ${countItem(gs, id)}`, 'bodyS', C.text));
    });
    c.add(txt(s, 56, 630, `Gold: ${gs.player.inventory.gold}`, 'bodyM', C.goldHi));
    vrule(g, 520, 52, 616);

    const inst = gs.player.inventory.items.find((i) => i.uid === this.selected);
    if (inst) this.detail(g, inst);
    else c.add(txt(s, 548, 120, 'You carry no gear to work on.', 'bodyM', C.muted));
    this.mgr.footer(c, 666);
  }

  private detail(g: Phaser.GameObjects.Graphics, inst: ItemInstance): void {
    const s = this.scene, c = this.container, gs = this.gs;
    const def = Registry.get('item', inst.def);
    itemSlot(g, def, inst.rarity, 548, 108, 64);
    c.add(txt(s, 628, 110, `${def.name}${inst.upgrade ? ` +${inst.upgrade}` : ''}`, 'titleS', rarityCssOf(inst.rarity)));
    c.add(txt(s, 628, 142, `iLvl ${inst.itemLevel} · upgrade ${inst.upgrade} / ${MAX_UPGRADE_NOW} (+${Math.round(inst.upgrade * 7)}% base)`, 'bodyS', C.text2));

    // upgrade
    let y = 196;
    c.add(header(s, 548, y, 'Upgrade'));
    const up = canUpgrade(gs, inst.uid);
    c.add(txt(s, 548, y + 34, up.ok ? `Next: +${inst.upgrade + 1} (+7% base damage/armour)` : up.reason, 'bodyS', up.ok ? C.text : C.bad, 420));
    c.add(txt(s, 548, y + 56, this.costText(up.cost), 'bodyS', C.text2, 420));
    ironButton(s, c, 1000, y + 30, 200, 32, 'Upgrade', () => {
      const r = upgrade(gs, inst.uid);
      this.mgr.rt.ui?.toast(r.ok ? `${def.name} is now +${inst.upgrade}` : r.reason, r.ok ? C.gold : C.bad);
      this.refresh();
    }, up.ok ? 'gold' : 'normal');

    // affixes
    y = 300;
    c.add(header(s, 548, y, 'Runeforge: reroll an affix'));
    y += 36;
    if (!inst.affixes.length) { c.add(txt(s, 548, y, 'No affixes to reroll.', 'bodyS', C.muted)); y += 28; }
    inst.affixes.forEach((a, i) => {
      const ad = Registry.tryGet('affix', a.affix);
      c.add(txt(s, 548, y + 6, ad ? `${describeModifier({ stat: ad.stat, op: ad.op, value: a.value })}  (T${a.tier})` : a.affix, 'bodyS', C.magic, 420));
      const rr = canReroll(gs, inst.uid, i);
      ironButton(s, c, 1000, y, 200, 30, 'Reroll', () => {
        const r = rerollAffix(gs, inst.uid, i);
        if (!r.ok) this.mgr.rt.ui?.toast(r.reason, C.bad);
        this.refresh();
      }, rr.ok ? 'normal' : 'normal');
      c.add(txt(s, 548, y + 26, this.costText(rr.cost), 'micro', rr.ok ? C.text2 : C.bad, 420));
      y += 52;
    });

    // salvage
    y = Math.max(y + 12, 520);
    c.add(header(s, 548, y, 'Salvage'));
    const sv = canSalvage(gs, inst.uid);
    const yieldTxt = sv.ok ? `Yields ${salvageYield(inst).map((x) => `${x.qty}× ${Registry.tryGet('item', x.item)?.name ?? x.item}`).join(', ')}${inst.rarity === 'epic' ? ' (essence random)' : ''}` : sv.reason;
    c.add(txt(s, 548, y + 34, yieldTxt, 'bodyS', sv.ok ? C.text2 : C.bad, 420));
    ironButton(s, c, 1000, y + 30, 200, 32, 'Salvage', () => {
      if (!sv.ok) return;
      const out = salvage(gs, inst.uid);
      if (out) this.mgr.rt.ui?.toast(`Salvaged ${def.name}`, C.text);
      this.selected = null;
      this.refresh();
    }, sv.ok ? 'red' : 'normal');
  }

  destroy(): void { this.container.destroy(true); }
}
