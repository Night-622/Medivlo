/**
 * Tooltip card (Claude 3): 268 wide, anchored right of a slot, flips left when there's no room (HANDOFF).
 * Long cards (affixes, sockets, set lines, comparison) widen to 380 / 520 rather than run off the screen; every line
 * wraps inside the card.
 */
import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '@/core/constants';
import { C, T, typeStyle } from '@/ui/kit/hc';
import { playerText, type TipLine } from '@/systems/rules/describeHc';

const WIDTHS = [268, 380, 520], PAD = 12;

/** A tooltip line; `italic` for in-world flavour (always at the foot, never in place of the mechanics). */
export type ShownLine = TipLine & { italic?: boolean };

/**
 * itemTooltip() puts its flavour / lore line right before the closing "Sells for" / "Quest item" line, in dim:
 * mark it italic (socket lines, also dim, are never flavour).
 */
export function markFlavour(lines: ShownLine[]): ShownLine[] {
  const out: ShownLine[] = lines.map((l) => ({ ...l }));
  const end = out.findIndex((l) => /^(Sells for |Quest item$)/.test(l.text));
  const f = end > 2 ? out[end - 1] : undefined;
  if (f && f.color === 'dim' && !/^(Empty socket$|Socket: |Hybrid: |Attuned )/.test(f.text)) f.italic = true;
  return out;
}

export function showTooltip(scene: Phaser.Scene, parent: Phaser.GameObjects.Container, lines: ShownLine[], anchor: { x: number; y: number; w: number }, rarity = 'common', schoolColor = C.gold): Phaser.GameObjects.Container {
  const c = scene.add.container(0, 0);
  const shown = markFlavour(lines);
  const rarityColor = (T.color.rarity as Record<string, { color: string }>)[rarity]?.color ?? C.text;
  const build = (W: number): { texts: Phaser.GameObjects.Text[]; h: number } => {
    let y = PAD;
    const texts = shown.map((l) => {
      const key = l.size === 'h' ? 'h3' : l.size === 'b' ? 'bodyL' : 'body';
      const color = l.color === 'rarity' ? rarityColor : l.color === 'gold' ? C.gold : l.color === 'good' ? C.good : l.color === 'danger' ? C.danger
        : l.color === 'dim' ? C.text500 : l.color === 'school' ? schoolColor : C.text;
      const style = typeStyle(key as never, color, W - PAD * 2);
      const t = scene.add.text(PAD, y, playerText(l.text), l.italic ? { ...style, fontStyle: 'italic' } : style);
      y += t.height + (l.size === 'h' ? 4 : 3);
      return t;
    });
    return { texts, h: y + PAD - 3 };
  };
  let W = WIDTHS[0], made = build(W);
  for (const w of WIDTHS.slice(1)) {
    if (made.h <= GAME_HEIGHT - 16) break;
    made.texts.forEach((t) => t.destroy());
    W = w; made = build(W);
  }
  const { texts, h } = made;
  const bg = scene.add.nineslice(0, 0, 'ui:tooltip', undefined, W, h, 8, 8, 8, 8).setOrigin(0);
  c.add([bg, ...texts]);
  let x = anchor.x + anchor.w + 8;
  if (x + W > GAME_WIDTH - 8) x = anchor.x - W - 8;
  c.setPosition(Math.max(8, x), Math.max(8, Math.min(GAME_HEIGHT - h - 8, anchor.y)));
  parent.add(c);
  return c;
}
