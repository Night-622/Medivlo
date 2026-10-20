/**
 * Spell runes on the Spells panel (Claude 3, BUILDS.md §2.2, §9): pips beside each known spell's node on the tree
 * (filled / empty slots), and on the spell's detail card the slots themselves: a filled slot shows the rune (click
 * to take it out, back to the pack), an empty one opens a picker of the fitting runes you carry. The slotted runes'
 * effects print under the slots. The authority validates (slots, fit, ownership) and refuses with a notice.
 */
import Phaser from 'phaser';
import { C, slot, typeStyle } from '@/ui/kit/hc';
import { itemInfo } from '@/systems/rules/gear';
import { rankOf } from '@/systems/rules/tree';
import { runeDef, runeFits, runeSlots } from '@/systems/rules/runes';
import { spellDef } from '@/systems/rules/spells';
import type { TipLine } from '@/systems/rules/describeHc';
import type { CharacterSave, TreeNode } from '@/systems/rules/types';
import { flavourOf } from '@/systems/rules/buildText';
import { slotRune } from '@/systems/client/character';
import { iconFrame } from './InventoryPanel';
import type { ShownLine } from './tooltip';

/** A rune's shown name (Claude 4's overlay through itemInfo) and its in-world line. */
export const runeName = (id: string): string => itemInfo(id)?.name ?? runeDef(id)?.name ?? id;
const runeFlavour = (id: string): ShownLine[] => { const f = flavourOf('rune', id); return f ? [{ text: f, color: 'dim', size: 's', italic: true }] : []; };

const RUNE_FILL = 0xb766ff;

/** Rune-slot pips to the right of a learned spell node (OX/OY: the tree's origin). */
export function runePips(scene: Phaser.Scene, parent: Phaser.GameObjects.Container, n: TreeNode, ch: CharacterSave, ox: number, oy: number): void {
  if (!n.grantsSpell || rankOf(n, ch.tree) <= 0) return;
  const slots = runeSlots(ch, n.grantsSpell);
  const filled = ch.runes?.[n.grantsSpell] ?? [];
  for (let i = 0; i < slots; i++) {
    const r = scene.add.rectangle(ox + n.x + n.size / 2 + 7, oy + n.y - n.size / 2 + 7 + i * 13, 8, 8, RUNE_FILL, filled[i] ? 1 : 0).setAngle(45).setStrokeStyle(2, filled[i] ? 0x1a1230 : RUNE_FILL);
    parent.add(r);
  }
}

/** Rune lines for a spell's tooltip / card: one per active slotted rune. */
export function runeEffectLines(ch: CharacterSave, spellId: string): TipLine[] {
  const n = runeSlots(ch, spellId);
  return (ch.runes?.[spellId] ?? []).slice(0, n).map((id) => { const r = runeDef(id); return { text: `${runeName(id)}: ${r?.desc ?? ''}`, color: 'good', size: 's' } as TipLine; });
}

export interface RuneUi { picking: boolean }
export interface RuneHooks { redraw(): void; tip(lines: ShownLine[], at: { x: number; y: number; w: number }, rarity?: string): void; hideTip(): void }

const S = 48;

/** The Runes block on a spell's detail card, from y; returns the y below it. */
export function runeSection(scene: Phaser.Scene, parent: Phaser.GameObjects.Container, ch: CharacterSave, spellId: string, x: number, y: number, w: number, ui: RuneUi, h: RuneHooks): number {
  const sp = spellDef(spellId);
  if (!sp) return y;
  const n = runeSlots(ch, spellId), filled = ch.runes?.[spellId] ?? [];
  const add = (t: string, color: string, key: 'caption' | 'body' = 'caption') => { const o = scene.add.text(x, y, t, typeStyle(key, color, w)); parent.add(o); y += o.height + 6; return o; };
  add(n ? `Runes · ${Math.min(filled.length, n)} / ${n} slot${n > 1 ? 's' : ''}` : 'Runes', C.text300);
  if (!n && !filled.length) { add('No rune slot yet. Learn more of this spell’s path to open one.', C.text500); return y; }
  const cells = Math.max(n, filled.length);
  for (let i = 0; i < cells; i++) {
    const cx = x + i * (S + 8), id = filled[i], off = i >= n;
    const def = id ? runeDef(id) : undefined;
    const fr = slot(scene, cx, y, S, id ? (def?.rarity as never) ?? 'ember' : 'empty');
    parent.add(fr);
    if (id) {
      const f = iconFrame(id);
      if (f) parent.add(scene.add.image(cx + S / 2, y + S / 2, f.key, f.frame).setAlpha(off ? 0.35 : 1));
    } else parent.add(scene.add.text(cx + S / 2, y + S / 2, '+', typeStyle('h2', ui.picking ? C.gold : C.text500)).setOrigin(0.5));
    if (!id && ui.picking) parent.add(scene.add.rectangle(cx - 3, y - 3, S + 6, S + 6).setOrigin(0).setStrokeStyle(2, 0xffd23f));
    const yy = y;
    fr.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        h.hideTip();
        h.tip(id ? [{ text: runeName(id), color: 'rarity', size: 'h' }, { text: def?.desc ?? '', size: 's' },
          ...(off ? [{ text: 'Inactive: this spell has fewer rune slots now.', color: 'danger' as const, size: 's' as const }] : []),
          { text: 'Click to take it out (back to your pack)', color: 'gold', size: 's' }, ...runeFlavour(id)]
          : [{ text: `Empty rune slot ${i + 1}`, color: 'dim', size: 'b' }, { text: 'Click to pick a rune from your pack', color: 'gold', size: 's' }], { x: cx, y: yy, w: S }, def?.rarity);
      })
      .on('pointerout', () => h.hideTip())
      .on('pointerup', () => {
        h.hideTip();
        if (id) { slotRune(spellId, id, true); return; }
        ui.picking = !ui.picking; h.redraw();
      });
  }
  y += S + 8;
  if (ui.picking) {
    const fitting = ch.inventory.filter((it) => { const r = runeDef(it.base); return !!r && it.qty > 0 && runeFits(r, sp) && !filled.includes(it.base); });
    add(fitting.length ? 'Pick a rune for this spell:' : 'You carry no rune that fits this spell. Craft one at a Runeforge.', fitting.length ? C.text : C.text500);
    const P = 40, per = Math.max(1, Math.floor((w + 6) / (P + 6)));
    fitting.slice(0, per * 2).forEach((it, i) => {
      const px = x + (i % per) * (P + 6), py = y + Math.floor(i / per) * (P + 6);
      const def = runeDef(it.base)!;
      const fr = slot(scene, px, py, P, (def.rarity as never) ?? 'ember');
      parent.add(fr);
      const f = iconFrame(it.base);
      if (f) parent.add(scene.add.image(px + P / 2, py + P / 2, f.key, f.frame).setScale(0.8));
      if (it.qty > 1) parent.add(scene.add.text(px + P - 3, py + P - 2, String(it.qty), typeStyle('badge', C.text)).setOrigin(1, 1));
      fr.setInteractive({ useHandCursor: true })
        .on('pointerover', () => { h.hideTip(); h.tip([{ text: runeName(it.base), color: 'rarity', size: 'h' }, { text: def.desc, size: 's' }, { text: 'Click to slot it', color: 'gold', size: 's' }, ...runeFlavour(it.base)], { x: px, y: py, w: P }, def.rarity); })
        .on('pointerout', () => h.hideTip())
        .on('pointerup', () => { h.hideTip(); ui.picking = false; slotRune(spellId, it.base); });
    });
    if (fitting.length) y += Math.ceil(Math.min(fitting.length, per * 2) / per) * (P + 6) + 2;
  }
  for (const l of runeEffectLines(ch, spellId)) add(l.text, C.good);
  return y;
}
