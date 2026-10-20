/**
 * Runeforge tabs (Claude 3, docs/systems/BUILDS.md §6, §9): Reforge | Sockets | Upgrade | Reroll | Imbue | Transfer |
 * Craft | Salvage, drawn inside the Shop screen's left panel. Each tab lists the worn pieces (the pack on the right
 * lists the carried ones) dimmed when the service does not apply, with that tab's price on every piece; the
 * selected piece gets the service's controls. Prices come from rules/runeforge.ts, the same the authority charges;
 * refusals come back as systems:notice (the HUD toasts them).
 */
import Phaser from 'phaser';
import { C, slot, typeStyle } from '@/ui/kit/hc';
import { RUNE_DUST } from '@/data/items/hc/build-items';
import { itemInfo } from '@/systems/rules/gear';
import { itemRarity, socketCount } from '@/systems/rules/affixes';
import { imbueCost, INGOT, reforgeCost, rerollCost, salvageYield, socketCost, transferCost, uniqueOf, upgradeCost } from '@/systems/rules/runeforge';
import { itemTooltip } from '@/systems/rules/describeHc';
import type { ShownLine } from './tooltip';
import type { CharacterSave, ItemInstance, SchoolId } from '@/systems/rules/types';
import { iconFrame } from './InventoryPanel';
import { rarityGlyph } from './glyph';
import { bodyReforge, bodySalvage, bodySockets, bodyUpgrade, pieceHeader } from './ForgeGear';
import { bodyImbue, bodyReroll, bodyTransfer, drawCraft } from './ForgeMagic';

export type ForgeTab = 'reforge' | 'sockets' | 'upgrade' | 'reroll' | 'imbue' | 'transfer' | 'craft' | 'salvage';
export const FORGE_TABS: [ForgeTab, string][] = [
  ['reforge', 'Reforge'], ['sockets', 'Sockets'], ['upgrade', 'Upgrade'], ['reroll', 'Reroll'],
  ['imbue', 'Imbue'], ['transfer', 'Transfer'], ['craft', 'Craft'], ['salvage', 'Salvage'],
];
export type ForgeAction = 'reforge' | 'socket' | 'salvage' | 'upgrade' | 'reroll' | 'imbue' | 'transfer' | 'craft';

/** What the player has picked on the Runeforge (kept while the shop is open). */
export interface ForgeState {
  tab: ForgeTab;
  /** the piece being worked on (uid, worn or carried) */
  sel: string | null;
  /** Sockets: the socket index a gem goes into (-1 = the first empty one) */
  socket: number;
  /** Transfer: the source piece whose effect moves (uid, carried) */
  src: string | null;
  /** Craft: the rune recipe being read */
  rune: string | null;
}
export const newForgeState = (): ForgeState => ({ tab: 'reforge', sel: null, socket: -1, src: null, rune: null });

export interface ForgeCtx {
  hud: Phaser.Scene;
  root: Phaser.GameObjects.Container;
  shop: string;
  ch: CharacterSave;
  equipped: ItemInstance[];
  school: SchoolId;
  weapons: string[];
  st: ForgeState;
  redraw(): void;
  act(action: ForgeAction, args: Record<string, string | number>): void;
  tip(lines: ShownLine[], at: { x: number; y: number; w: number }, rarity?: string): void;
  hideTip(): void;
}

export const CELL = 56, STEP = 64, LEFT = 76, BODY_Y = 316;

/** How many of a stackable the player carries. */
export const have = (ch: CharacterSave, base: string): number => ch.inventory.filter((x) => x.base === base).reduce((a, x) => a + x.qty, 0);
export const plural = (n: number, one: string): string => `${n} ${one}${n === 1 ? '' : 's'}`;

/** Does this tab's service apply to the piece? (Craft works on recipes, not pieces.) */
export function forgeFits(tab: ForgeTab, it: ItemInstance, ch: CharacterSave, worn: boolean): boolean {
  const info = itemInfo(it.base);
  if (!info?.slot) return false;
  switch (tab) {
    case 'reforge': return !!reforgeCost(it, ch.level);
    case 'sockets': return socketCount(it) > 0;
    case 'upgrade': return !!upgradeCost(it);
    case 'reroll': return rerollCost(it) !== null;
    case 'imbue': return imbueCost(it) !== null;
    case 'transfer': return ch.inventory.some((s) => transferCost(s, it) !== null);
    case 'salvage': return !worn && !!salvageYield(it);
    default: return false;
  }
}

/** The price badge a piece shows on this tab (null: nothing to show). */
export function forgePrice(tab: ForgeTab, it: ItemInstance, ch: CharacterSave, worn: boolean): { text: string; ok: boolean } | null {
  if (!forgeFits(tab, it, ch, worn)) return null;
  const gold = (g: number | null | undefined, ingots = 0) => (g == null ? null : { text: String(g), ok: ch.gold >= g && have(ch, INGOT) >= ingots });
  switch (tab) {
    case 'reforge': { const c = reforgeCost(it, ch.level); return gold(c?.gold, c?.ingots); }
    case 'sockets': return gold(socketCost(it, 'i_ruby'));
    case 'upgrade': { const c = upgradeCost(it); return c && { text: `+${c.to}`, ok: ch.gold >= c.gold && have(ch, INGOT) >= c.ingots }; }
    case 'reroll': return gold(rerollCost(it));
    case 'imbue': return gold(imbueCost(it));
    case 'transfer': return gold(Math.min(...ch.inventory.map((s) => transferCost(s, it) ?? Infinity)));
    case 'salvage': { const y = salvageYield(it); return y && { text: `+${y.ingots}`, ok: true }; }
    default: return null;
  }
}

export interface CellOpts {
  rarity?: string;
  badge?: { text: string; ok: boolean } | null;
  /** badge under the cell instead of inside it */
  badgeBelow?: boolean;
  dim?: boolean;
  selected?: boolean;
  qty?: number;
  tip?: () => ShownLine[];
  onClick?: () => void;
}

/** A 56 (or `size`) slot with the item's icon, rarity glyph, an optional price badge, hover tip and click. */
export function cell(ctx: ForgeCtx, x: number, y: number, base: string | null, o: CellOpts = {}, size = CELL): Phaser.GameObjects.NineSlice {
  const { hud, root } = ctx;
  const info = base ? itemInfo(base) : undefined;
  const rarity = o.rarity ?? info?.rarity;
  const fr = slot(hud, x, y, size, (rarity as never) ?? 'empty');
  root.add(fr);
  if (base) {
    const f = iconFrame(base);
    if (f) root.add(hud.add.image(x + size / 2, y + size / 2, f.key, f.frame).setAlpha(o.dim ? 0.35 : 1));
    rarityGlyph(hud, root, base, x, y, rarity);
  }
  if (o.qty && o.qty > 1) root.add(hud.add.text(x + size - 4, y + 2, String(o.qty), typeStyle('badge', C.text)).setOrigin(1, 0));
  if (o.badge) {
    const t = o.badgeBelow
      ? hud.add.text(x + size / 2, y + size + 2, o.badge.text, typeStyle('badge', o.badge.ok ? C.gold : C.danger)).setOrigin(0.5, 0)
      : hud.add.text(x + size / 2, y + size - 3, o.badge.text, typeStyle('badge', o.badge.ok ? C.gold : C.danger)).setOrigin(0.5, 1).setStroke('#1a1230', 3);
    root.add(t);
  }
  if (o.selected) root.add(hud.add.rectangle(x - 3, y - 3, size + 6, size + 6).setOrigin(0).setStrokeStyle(2, 0xffd23f));
  fr.setInteractive({ useHandCursor: !!o.onClick && !o.dim })
    .on('pointerover', () => { if (o.tip) { ctx.hideTip(); ctx.tip(o.tip(), { x, y, w: size }, rarity); } })
    .on('pointerout', () => ctx.hideTip())
    .on('pointerup', () => o.onClick?.());
  return fr;
}

/** The piece being worked on (worn or carried), if it is still there. */
export function selected(ctx: ForgeCtx): { it: ItemInstance; worn: boolean } | null {
  const id = ctx.st.sel;
  if (!id) return null;
  const w = ctx.equipped.find((x) => x.uid === id);
  if (w) return { it: w, worn: true };
  const c = ctx.ch.inventory.find((x) => x.uid === id);
  return c ? { it: c, worn: false } : null;
}

export function drawForge(ctx: ForgeCtx): void {
  const { hud, root, st, ch } = ctx;
  // tab bar: 8 small tabs, 64 wide, under the Trade / Runeforge tabs
  FORGE_TABS.forEach(([id, label], i) => {
    const x = LEFT + i * 65, y = 146, on = st.tab === id;
    const bg = hud.add.nineslice(x, y, on ? 'ui:tab_active' : 'ui:tab', undefined, 64, 26, 8, 8, 8, 8).setOrigin(0);
    root.add([bg, hud.add.text(x + 32, y + 13, label, typeStyle('caption', on ? C.gold : C.text300)).setOrigin(0.5)]);
    bg.setInteractive({ useHandCursor: true }).on('pointerup', () => { ctx.hideTip(); st.tab = id; st.socket = -1; st.src = null; ctx.redraw(); });
  });
  const dust = have(ch, RUNE_DUST), ingots = have(ch, INGOT);
  if (st.tab === 'craft') {
    drawCraft(ctx);
    root.add(hud.add.text(LEFT, 652, `Rune Dust: ${dust} · salvage enchanted gear for more`, typeStyle('caption', C.text500)));
    return;
  }
  // worn pieces (the carried ones are in the pack on the right)
  ctx.equipped.forEach((it, i) => {
    const x = LEFT + (i % 8) * STEP, y = 184 + Math.floor(i / 8) * STEP;
    const fits = forgeFits(st.tab, it, ch, true);
    cell(ctx, x, y, it.base, {
      rarity: itemRarity(it), dim: !fits, selected: st.sel === it.uid, badge: forgePrice(st.tab, it, ch, true),
      tip: () => itemTooltip(it, ctx.equipped, ctx.school, ctx.weapons),
      onClick: () => { st.sel = it.uid; st.socket = -1; st.src = null; ctx.redraw(); },
    });
  });
  root.add(hud.add.text(LEFT, 652, `Iron Ingots: ${ingots}  ·  Rune Dust: ${dust}  ·  pick a worn piece here or one from your pack`, typeStyle('caption', C.text500)));
  const s = selected(ctx);
  if (!s) { root.add(hud.add.text(LEFT, 320, 'Choose a piece to work on.', typeStyle('body', C.text300))); return; }
  pieceHeader(ctx, s.it);
  const body = { reforge: bodyReforge, sockets: bodySockets, upgrade: bodyUpgrade, reroll: bodyReroll, imbue: bodyImbue, transfer: bodyTransfer, salvage: bodySalvage }[st.tab];
  body(ctx, s.it, s.worn);
}

/** A carried source of a unique effect, for the Transfer tab. */
/** Pack pieces that could give `target` something: a unique effect, or a higher upgrade level, of the same slot. */
export const transferSources = (ch: CharacterSave, target: ItemInstance): ItemInstance[] => ch.inventory.filter((x) => x.uid !== target.uid && (!!uniqueOf(x) || (x.upgrade ?? 0) > 0));
