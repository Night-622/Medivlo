/**
 * Inventory & Equipment (board 8d): equipment + paper doll | pack grid | character stats.
 * Click gear to equip, click an equipped slot to unequip; consumables: click → Q, right-click → E; tomes: click to learn.
 */
import Phaser from 'phaser';
import { Registry, bus } from '@/core';
import type { AttributeId, EquipSlot, ItemInstance } from '@/core';
import { checker, drawFrame, palette as P } from '@/ui/kit';
import { ATTRIBUTES } from '@/systems/balance';
import { bagItems, equip, freeSlots, meetsRequirements, removeUid, unequipSlot } from '@/systems/items/Inventory';
import { equippedInSlot } from '@/systems/stats/collect';
import { learnSpell } from '@/systems/progression/Character';
import { spendAttributePoint } from '@/systems/progression/Leveling';
import type { CharacterPanels, PanelView } from './CharacterPanels';
import { itemTip } from './itemText';
import { C, dimScreen, header, hotspot, ironButton, itemSlot, txt, vrule } from './px';

const LEFT: [EquipSlot, string][] = [['head', 'HEAD'], ['chest', 'CHEST'], ['hands', 'HANDS'], ['legs', 'LEGS'], ['feet', 'FEET']];
const RIGHT: [EquipSlot, string][] = [['amulet', 'AMULET'], ['cloak', 'CLOAK'], ['belt', 'BELT'], ['trinket', 'TRINKET'], ['ring2', 'RING']];
const BOTTOM: [EquipSlot, string][] = [['mainHand', 'MAIN'], ['offHand', 'OFF'], ['ring1', 'RING']];
type Tab = 'all' | 'gear' | 'use' | 'mats' | 'quest';
const TABS: [Tab, string][] = [['all', 'All'], ['gear', 'Gear'], ['use', 'Use'], ['mats', 'Mats'], ['quest', 'Quest']];
const KIND_TAB: Record<string, Tab> = { weapon: 'gear', offhand: 'gear', armor: 'gear', accessory: 'gear', consumable: 'use', tome: 'use', glyph: 'use', material: 'mats', schematic: 'mats', quest: 'quest', key: 'quest' };
const RARITY_ORDER = ['set', 'legendary', 'epic', 'rare', 'uncommon', 'common'];

export class InventoryPanel implements PanelView {
  readonly container: Phaser.GameObjects.Container;
  private tab: Tab = 'all';
  private sortByRarity = false;

  constructor(private readonly scene: Phaser.Scene, private readonly mgr: CharacterPanels) {
    this.container = scene.add.container(0, 0);
    this.refresh();
  }

  private get gs() { return this.mgr.rt.player.gs; }

  refresh(): void {
    const s = this.scene, c = this.container;
    c.removeAll(true);
    this.mgr.tooltip.hide();
    const g = s.add.graphics();
    c.add(g);
    dimScreen(s, g);
    drawFrame(g, 'iron', 32, 32, 1216, 656);
    // block clicks to the world under the panel
    c.add(s.add.zone(0, 0, s.scale.width, s.scale.height).setOrigin(0).setInteractive());
    const slotG = s.add.graphics();
    c.add(slotG);
    this.equipment(slotG);
    vrule(g, 408, 52, 616);
    this.pack(slotG);
    vrule(g, 872, 52, 616);
    this.stats();
    this.mgr.footer(c, 666);
  }

  // ───────── equipment column ─────────
  private equipment(g: Phaser.GameObjects.Graphics): void {
    const s = this.scene, c = this.container, gs = this.gs;
    const eq = gs.player.equipment;
    c.add(header(s, 56, 48, 'Equipment'));
    const slot = (slotId: EquipSlot, label: string, x: number, y: number, size = 56) => {
      const it = equippedInSlot(gs, slotId);
      itemSlot(g, it?.def, it ? it.inst.rarity : null, x, y, size);
      if (!it) c.add(txt(s, x + size / 2, y + size / 2 - 6, label, 'micro', C.muted).setOrigin(0.5, 0));
      hotspot(s, c, x, y, size, size, {
        over: () => it && this.mgr.tooltip.show(itemTip(gs, it.inst, 'EQUIPPED · CLICK TO UNEQUIP')),
        out: () => this.mgr.tooltip.hide(),
        click: () => { if (!it) return; if (freeSlots(gs) <= 0) { this.mgr.rt.ui?.toast('Bags full', C.bad); return; } unequipSlot(gs, slotId); bus.emit('stats:changed', {}); this.refresh(); },
      });
    };
    LEFT.forEach(([id, l], i) => slot(id, l, 56, 96 + i * 68));
    RIGHT.forEach(([id, l], i) => slot(id, l, 328, 96 + i * 68));
    BOTTOM.forEach(([id, l], i) => slot(id, l, 132 + i * 72, 446));
    // paper doll well
    g.fillStyle(P['ink-900'], 1).fillRect(146, 106, 148, 228);
    g.fillStyle(P['ink-800'], 1).fillRect(148, 108, 144, 224);
    const key = this.mgr.rt.player.sprite.texture.key;
    c.add(s.add.image(220, 220, key).setScale(4));
    c.add(txt(s, 156, 114, `LV ${gs.player.progression.level}`, 'micro', C.muted));
    // loadouts
    const other = eq.activeLoadout === 0 ? 1 : 0;
    c.add(txt(s, 56, 540, `X  Swap loadout · ${eq.activeLoadout === 0 ? 'I' : 'II'} active`, 'bodyS', C.text2));
    const lo = eq.loadouts[other];
    const inv = gs.player.inventory.items;
    const oMain = inv.find((i) => i.uid === lo.mainHand), oOff = inv.find((i) => i.uid === lo.offHand);
    itemSlot(g, oMain && Registry.tryGet('item', oMain.def), oMain?.rarity ?? null, 56, 568, 48);
    itemSlot(g, oOff && Registry.tryGet('item', oOff.def), oOff?.rarity ?? null, 112, 568, 48);
    c.add(txt(s, 172, 582, `Loadout ${other === 0 ? 'I' : 'II'}${oMain ? ` · ${Registry.tryGet('item', oMain.def)?.name ?? ''}` : ''}`, 'bodyS', C.muted, 220));
    ironButton(s, c, 300, 536, 84, 26, 'Swap', () => { eq.activeLoadout = other; bus.emit('stats:changed', {}); this.refresh(); });
  }

  // ───────── pack column ─────────
  private pack(g: Phaser.GameObjects.Graphics): void {
    const s = this.scene, c = this.container, gs = this.gs;
    c.add(header(s, 432, 48, 'Pack'));
    TABS.forEach(([id, label], i) => {
      const x = 432 + i * 82, y = 90, on = this.tab === id;
      g.fillStyle(P['ink-900'], 1).fillRect(x - 2, y - 2, 78, 32);
      if (on) g.fillStyle(P['gold-500'], 1).fillRect(x - 4, y - 4, 82, 36).fillStyle(P['ink-900'], 1).fillRect(x - 2, y - 2, 78, 32);
      g.fillStyle(on ? P['ink-600'] : P['ink-700'], 1).fillRect(x, y, 74, 28);
      c.add(txt(s, x + 37, y + 6, label, 'bodyS', on ? C.goldHi : C.text2).setOrigin(0.5, 0));
      hotspot(s, c, x, y, 74, 28, { click: () => { this.tab = id; this.refresh(); } });
    });
    let items = bagItems(gs).filter((i) => this.tab === 'all' || KIND_TAB[Registry.tryGet('item', i.def)?.itemKind ?? 'material'] === this.tab);
    const kindOrder = ['weapon', 'offhand', 'armor', 'accessory', 'consumable', 'tome', 'glyph', 'material', 'schematic', 'quest', 'key'];
    items = [...items].sort((a, b) => this.sortByRarity
      ? RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity)
      : kindOrder.indexOf(Registry.tryGet('item', a.def)?.itemKind ?? '') - kindOrder.indexOf(Registry.tryGet('item', b.def)?.itemKind ?? ''));
    for (let i = 0; i < 48; i++) {
      const x = 432 + (i % 8) * 52, y = 136 + Math.floor(i / 8) * 52;
      const inst = items[i];
      const def = inst && Registry.tryGet('item', inst.def);
      const usable = !def || meetsRequirements(gs, def);
      itemSlot(g, def, inst?.rarity ?? null, x, y, 48);
      if (def && !usable) checker(g, x + 6, y + 6, 36, 36, P['ink-900']);
      if (!inst) continue;
      if (inst.qty > 1) c.add(txt(s, x + 44, y + 30, `${inst.qty}`, 'micro', C.text).setOrigin(1, 0));
      if (!usable) g.fillStyle(P['blood-400'], 1).fillRect(x + 38, y + 6, 4, 4);
      hotspot(s, c, x, y, 48, 48, {
        over: () => this.hover(inst),
        out: () => this.mgr.tooltip.hide(),
        click: (right) => this.click(inst, right),
      });
    }
    ironButton(s, c, 432, 456, 96, 30, this.sortByRarity ? 'By rarity' : 'By kind', () => { this.sortByRarity = !this.sortByRarity; this.refresh(); });
    const bagCount = bagItems(gs).filter((i) => !['material', 'quest', 'key'].includes(Registry.tryGet('item', i.def)?.itemKind ?? '')).length;
    c.add(txt(s, 544, 462, `${bagCount} / ${gs.player.inventory.capacity} slots`, 'bodyS', C.text2));
    // gold, equip load
    g.fillStyle(P['ink-900'], 1).fillRect(430, 510, 20, 20);
    g.fillStyle(P['gold-500'], 1).fillRect(432, 512, 16, 16);
    g.fillStyle(P['gold-200'], 1).fillRect(434, 514, 6, 4);
    c.add(txt(s, 458, 506, gs.player.inventory.gold.toLocaleString('en-GB'), 'bodyL', C.goldHi));
    const p = this.mgr.rt.player;
    const load = p.stats.collected.wornWeight, cap = p.stats.derived.equipCapacity;
    c.add(txt(s, 844, 504, `LOAD ${load.toFixed(1)} / ${cap.toFixed(0)}`, 'micro', C.text2).setOrigin(1, 0));
    g.fillStyle(P['ink-900'], 1).fillRect(682, 520, 164, 12);
    g.fillStyle(P['ink-700'], 1).fillRect(684, 522, 160, 8);
    const pct = Math.min(1, load / cap);
    g.fillStyle(pct < 0.3 ? P['stam-500'] : pct < 0.7 ? P['gold-500'] : P['blood-400'], 1).fillRect(684, 522, Math.round(160 * pct / 2) * 2, 8);
    const d = gs.player.inventory.draught;
    c.add(txt(s, 432, 560, `Hearth Draught · ${d.charges} / ${d.maxCharges} charges · refills at rest points`, 'bodyS', C.text2, 420));
    c.add(txt(s, 432, 590, 'Click: equip / use / learn  ·  Right-click a consumable: set as E', 'bodyS', C.muted, 420));
  }

  private hover(inst: ItemInstance): void {
    const gs = this.gs;
    const def = Registry.tryGet('item', inst.def);
    let compare;
    if (def && (def.slot || def.itemKind === 'weapon' || def.itemKind === 'offhand')) {
      const slot: EquipSlot | null = def.slot === 'ring' ? 'ring1' : def.slot ?? (def.itemKind === 'weapon' ? 'mainHand' : def.itemKind === 'offhand' ? 'offHand' : null);
      const cur = slot ? equippedInSlot(gs, slot) : null;
      if (cur) compare = itemTip(gs, cur.inst, 'EQUIPPED');
    }
    this.mgr.tooltip.show(itemTip(gs, inst, compare ? 'HOVERED' : undefined), compare);
  }

  private click(inst: ItemInstance, right: boolean): void {
    const gs = this.gs, ui = this.mgr.rt.ui;
    const def = Registry.tryGet('item', inst.def);
    if (!def) return;
    this.mgr.tooltip.hide();
    switch (def.itemKind) {
      case 'weapon': case 'armor': case 'offhand': case 'accessory':
        if (!meetsRequirements(gs, def)) { ui?.toast('Requirements not met', C.bad); return; }
        equip(gs, inst.uid);
        break;
      case 'consumable':
        gs.player.equipment.quickslots[right ? 1 : 0] = def.id;
        ui?.toast(`${def.name} → ${right ? 'E' : 'Q'}`, C.text);
        break;
      case 'tome':
        if (!def.teaches) return;
        if (!meetsRequirements(gs, def)) { ui?.toast('Requirements not met', C.bad); return; }
        if (gs.player.spellbook.known[def.teaches]) { ui?.toast('Already known', C.muted); return; }
        learnSpell(gs, def.teaches);
        removeUid(gs, inst.uid);
        ui?.toast(`Learned ${Registry.tryGet('spell', def.teaches)?.name ?? def.teaches}`, C.gold);
        break;
      default: return;
    }
    bus.emit('stats:changed', {});
    this.refresh();
  }

  // ───────── stats column ─────────
  private stats(): void {
    const s = this.scene, c = this.container;
    const p = this.mgr.rt.player;
    p.recalc(this.mgr.rt.now);
    const gs = p.gs, pr = gs.player.progression, d = p.stats.derived;
    const anc = gs.player.ancestry ? Registry.tryGet('trait', gs.player.ancestry)?.name : null;
    c.add(header(s, 896, 48, `${gs.player.name} · ${p.cls?.name ?? '—'} ${pr.level}`));
    c.add(txt(s, 896, 76, [anc, ...pr.traits.map((t) => Registry.tryGet('trait', t)?.name).filter(Boolean)].filter(Boolean).join(' · '), 'micro', C.muted, 330));
    let y = 100;
    const group = (name: string, rows: [string, string, string?][]) => {
      c.add(txt(s, 896, y, name, 'titleS', C.text2));
      y += 30;
      for (const [k, v, col] of rows) {
        c.add(txt(s, 896, y, k, 'bodyS', C.text2));
        c.add(txt(s, 1220, y, v, 'bodyS', col ?? C.text).setOrigin(1, 0));
        y += 20;
      }
      y += 8;
    };
    // attributes with spend buttons
    c.add(txt(s, 896, y, `Attributes${pr.unspentAttributePoints ? ` · ${pr.unspentAttributePoints} to spend` : ''}`, 'titleS', pr.unspentAttributePoints ? C.goldHi : C.text2));
    y += 30;
    (ATTRIBUTES as AttributeId[]).forEach((a) => {
      c.add(txt(s, 896, y, a[0].toUpperCase() + a.slice(1), 'bodyS', C.text2));
      const base = pr.attributes[a], tot = d.attributes[a];
      c.add(txt(s, 1180, y, `${tot}`, 'bodyS', tot > base ? C.good : C.text).setOrigin(1, 0));
      if (pr.unspentAttributePoints > 0) {
        const bx = 1192, by = y;
        const bg = s.add.graphics();
        bg.fillStyle(P['ink-900'], 1).fillRect(bx - 2, by - 2, 24, 22);
        bg.fillStyle(P['gold-800'], 1).fillRect(bx, by, 20, 18);
        bg.fillStyle(P['gold-200'], 1).fillRect(bx + 9, by + 4, 2, 10).fillRect(bx + 5, by + 8, 10, 2);
        c.add(bg);
        hotspot(s, c, bx, by, 20, 18, { click: () => { spendAttributePoint(gs, a); this.refresh(); } });
      }
      y += 20;
    });
    y += 8;
    const pct = (v: number) => `${Math.round(v * 1000) / 10}%`;
    group('Vitals', [['Health', `${Math.round(p.hp)} / ${d.maxHp}`], ['Ember', `${Math.round(p.mana)} / ${d.maxMana}`], ['Stamina', `${d.maxStamina}`], ['Ember regen', `${d.manaRegen.toFixed(1)}/s`]]);
    group('Offence', [['Crit', `${pct(d.critChance)} · ×${d.critMultiplier.toFixed(2)}`], ['Attack / cast speed', `×${d.attackSpeed.toFixed(2)} / ×${d.castSpeed.toFixed(2)}`]]);
    group('Defence', [['Armour · Poise', `${d.armor} · ${d.poise}`], ['Status resist', pct(d.statusResist)],
      ['Fire / Frost / Ltng', `${pct(d.resist.fire)} / ${pct(d.resist.frost)} / ${pct(d.resist.lightning)}`],
      ['Radiant / Shadow', `${pct(d.resist.radiant)} / ${pct(d.resist.shadow)}`],
      ['Cinderlung', `${pr.cinderlung ?? 0} / 5`, (pr.cinderlung ?? 0) > 0 ? C.bad : undefined]]);
  }

  destroy(): void { this.container.destroy(true); }
}
