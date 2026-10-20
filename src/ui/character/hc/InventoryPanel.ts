/**
 * Inventory (Claude 3, HANDOFF layout): character panel 400×604 at (48, 84) with equip slots (56) in columns
 * x 72 / 368, rows y 168…384, hero at 3× at (200, 196) and a stat sheet; pack 760×604 at (472, 84) with an
 * 11×6 grid of 56 (8 gap) from (504, 156) and category filters. Click: equip / use; click equipped: take off.
 */
import Phaser from 'phaser';
import { Art } from '@/art';
import { Game } from '@/core/GameState';
import { HC_CLASSES } from '@/data/classes/hc/classes.gen';
import { HC_ITEM_CATS } from '@/data/items/hc/items.gen';
import { SCHOOL_COLOR } from '@/data/classes/hc';
import { kitFor } from '@/data/classes/hc/kits';
import { campaignItem } from '@/data/items/hc/campaign-items';
import { borrowedIcon, itemInfo, itemWeaponDamage, legendary, slotsFor, weaponDamage } from '@/systems/rules/gear';
import { compileStats } from '@/systems/rules/playerStats';
import { itemRarity } from '@/systems/rules/affixes';
import { compareLines, fmtStat, itemTooltip, statLabel } from '@/systems/rules/describeHc';
import { xpToNext } from '@/systems/rules/curves';
import type { GearSlot, ItemInstance } from '@/systems/rules/types';
import { character, equip, onCharacterChanged, unequip, useItem } from '@/systems/client/character';
import { C, panel, slot, typeStyle } from '@/ui/kit/hc';
import { showTooltip } from './tooltip';
import { rarityGlyph } from './glyph';
import { navRefresh } from './panelNav';

const EQUIP: [GearSlot, number, number, string][] = [
  ['head', 72, 168, 'Head'], ['chest', 72, 240, 'Chest'], ['hands', 72, 312, 'Hands'], ['feet', 72, 384, 'Feet'],
  ['main', 368, 168, 'Main hand'], ['off', 368, 240, 'Off hand'], ['ring1', 368, 312, 'Ring'], ['ring2', 368, 384, 'Ring'],
  ['amulet', 220, 384, 'Amulet'],
];
const GRID = { x: 504, y: 156, cols: 11, rows: 6, size: 56, gap: 8 };
const STATS: string[] = ['hp', 'ember', 'armor', 'sp', 'crit', 'critd', 'moveSpeed', 'atkSpeed', 'cdr', 'block', 'lifesteal', 'emberRegen'];

/** Atlas frame for an item icon (legendaries borrow their base icon). */
export function iconFrame(base: string): { key: string; frame?: string | number } | undefined {
  return Art.tryFrame(base) ?? (legendary(base) ? Art.tryFrame(legendary(base)!.base) : undefined) ?? Art.tryFrame(campaignItem(base)?.base ?? '') ?? Art.tryFrame(borrowedIcon(base) ?? '');
}

export class InventoryPanel {
  private c: Phaser.GameObjects.Container;
  private tip: Phaser.GameObjects.Container | null = null;
  private filter: string = 'all';
  private off: () => void;

  constructor(private scene: Phaser.Scene, private parent: Phaser.GameObjects.Container) {
    this.c = scene.add.container(0, 0);
    parent.add(this.c);
    this.off = onCharacterChanged(() => this.draw());
    this.draw();
  }

  destroy(): void { this.off(); this.c.destroy(); }

  private draw(): void {
    const s = this.scene, ch = character();
    this.c.removeAll(true);
    this.tip = null;
    const cls = HC_CLASSES.find((x) => x.id === ch.classId)!;
    const kit = kitFor(ch.classId);
    const equipped = Object.values(ch.equipment).filter((x): x is ItemInstance => !!x);
    // ── character panel
    this.c.add(panel(s, 48, 84, 400, 604, 'panel'));
    this.c.add(s.add.text(248, 104, Game.state.player.name || cls.name, typeStyle('h2', C.text)).setOrigin(0.5, 0));
    this.c.add(s.add.text(248, 134, `Level ${ch.level} ${cls.name} · ${cls.epithet}`, typeStyle('caption', SCHOOL_COLOR[cls.school])).setOrigin(0.5, 0));
    const heroTex = [...s.textures.getTextureKeys()].find((k) => k.startsWith(`hero:${ch.classId}.`)) ?? `heroes:${ch.classId}`;
    if (s.textures.exists(heroTex)) this.c.add(s.add.image(248, 300, heroTex, 0).setScale(3).setOrigin(0.5, 1));
    for (const [gs, x, y, label] of EQUIP) {
      const it = ch.equipment[gs];
      const info = it ? itemInfo(it.base) : undefined;
      const fr = slot(s, x, y, 56, it && info ? itemRarity(it) as never : 'empty');
      this.c.add(fr);
      if (it) this.icon(it, x, y);
      else this.c.add(s.add.text(x + 28, y + 28, label, typeStyle('badge', C.text500, 52)).setOrigin(0.5).setAlign('center'));
      fr.setInteractive({ useHandCursor: !!it })
        .on('pointerover', () => it && this.showTip(it, equipped, cls.school, kit.weapons, x, y))
        .on('pointerout', () => this.hideTip())
        .on('pointerup', () => { if (it) this.toast(unequip(gs)); });
    }
    // stats sheet
    const st = compileStats(ch).stats;
    const xpPct = Math.round((ch.xp / xpToNext(ch.level)) * 100);
    this.c.add(s.add.text(72, 460, `XP ${ch.xp} / ${xpToNext(ch.level)} (${xpPct}%)`, typeStyle('caption', C.text300)));
    const main = ch.equipment.main;
    const [dmin, dmax] = main ? itemWeaponDamage(main) : weaponDamage(kit.startWeapon, ch.level).map((v) => Math.round(v * 0.7));
    const rows: [string, string][] = [['Weapon damage', `${dmin}–${dmax}`], ...STATS.map((k) => [statLabel(k), fmtStat(k, st[k] ?? 0)] as [string, string])];
    rows.forEach(([k, v], i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = 72 + col * 188, y = 486 + row * 26;
      this.c.add(s.add.text(x, y, k, typeStyle('body', C.text300)));
      this.c.add(s.add.text(x + 176, y, v, typeStyle('body', C.text)).setOrigin(1, 0));
    });
    // ── pack
    this.c.add(panel(s, 472, 84, 760, 604, 'panel'));
    this.c.add(s.add.text(504, 100, 'Pack', typeStyle('h2', C.text)));
    const cap = Math.round(st.bag ?? 66);
    // gold and slots sit at the panel foot so the header row is free for the category filters
    this.c.add(s.add.text(1200, 660, `${ch.gold} Embershards · ${ch.inventory.length}/${cap}`, typeStyle('bodyL', C.gold)).setOrigin(1, 0));
    const cats: [string, string][] = [['all', 'All'], ['gear', 'Gear'], ...HC_ITEM_CATS.filter(([k]) => k !== 'trinket').map(([k, l]) => [k, l.split(' ')[0]] as [string, string])];
    let fx = 600;
    for (const [k, l] of cats) {
      const t = s.add.text(fx, 112, l, typeStyle('caption', this.filter === k ? C.gold : C.text500)).setInteractive({ useHandCursor: true });
      t.on('pointerup', () => { this.filter = k; this.draw(); });
      this.c.add(t);
      fx += t.width + 14;
    }
    const items = ch.inventory.filter((it) => {
      if (this.filter === 'all') return true;
      const info = itemInfo(it.base);
      if (this.filter === 'gear') return !!info?.slot;
      return info?.kind === this.filter;
    });
    for (let i = 0; i < GRID.cols * GRID.rows; i++) {
      const x = GRID.x + (i % GRID.cols) * (GRID.size + GRID.gap), y = GRID.y + Math.floor(i / GRID.cols) * (GRID.size + GRID.gap);
      const it = items[i];
      const info = it ? itemInfo(it.base) : undefined;
      const fr = slot(s, x, y, GRID.size, it && info ? itemRarity(it) as never : 'empty');
      this.c.add(fr);
      if (!it) continue;
      this.icon(it, x, y);
      fr.setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.showTip(it, equipped, cls.school, kit.weapons, x, y))
        .on('pointerout', () => this.hideTip())
        .on('pointerup', () => { this.hideTip(); if (info?.slot) this.toast(equip(it.uid)); else useItem(it.uid); });
    }
    if (items.length > GRID.cols * GRID.rows) this.c.add(s.add.text(1200, 540, `+${items.length - GRID.cols * GRID.rows} more`, typeStyle('caption', C.text500)).setOrigin(1, 0));
    this.c.add(s.add.text(504, 664, 'Click (or arrows + Enter) to equip or use · worn gear: take it off', typeStyle('caption', C.text500)));
    navRefresh(s, this.parent, this.c);
  }

  private icon(it: ItemInstance, x: number, y: number): void {
    rarityGlyph(this.scene, this.c, it.base, x, y, itemRarity(it));
    const f = iconFrame(it.base);
    if (f) this.c.add(this.scene.add.image(x + 28, y + 28, f.key, f.frame));
    if (it.qty > 1) this.c.add(this.scene.add.text(x + 52, y + 52, String(it.qty), typeStyle('badge', C.text)).setOrigin(1, 1));
  }

  private showTip(it: ItemInstance, equipped: ItemInstance[], school: Parameters<typeof itemTooltip>[2], weapons: string[], x: number, y: number): void {
    this.hideTip();
    const info = itemInfo(it.base);
    const lines = itemTooltip(it, equipped, school, weapons);
    // pack items: compare with what is worn in the slot it would take
    const ch = character();
    const worn = info && !Object.values(ch.equipment).some((e) => e?.uid === it.uid)
      ? slotsFor(info).map((sl) => ch.equipment[sl]).find(Boolean) ?? (slotsFor(info).length ? undefined : null)
      : null;
    if (worn !== null) lines.push(...compareLines(it, worn));
    this.tip = showTooltip(this.scene, this.c, lines, { x, y, w: 56 }, itemRarity(it), SCHOOL_COLOR[school]);
  }
  private hideTip(): void { this.tip?.destroy(); this.tip = null; }

  private toast(err: string | null): void {
    if (!err) return;
    const t = this.scene.add.text(840, 690, err, typeStyle('bodyL', C.danger)).setOrigin(0.5, 0);
    this.c.add(t);
    this.scene.tweens.add({ targets: t, alpha: 0, delay: 1600, duration: 400, onComplete: () => t.destroy() });
  }
}
