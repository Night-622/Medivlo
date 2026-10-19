/** Tooltip card (Claude 3): 268 wide, anchored right of a slot, flips left when there's no room (HANDOFF). */
import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '@/core/constants';
import { C, T, typeStyle } from '@/ui/kit/hc';
import type { TipLine } from '@/systems/rules/describeHc';

const W = 268, PAD = 12;

export function showTooltip(scene: Phaser.Scene, parent: Phaser.GameObjects.Container, lines: TipLine[], anchor: { x: number; y: number; w: number }, rarity = 'common', schoolColor = C.gold): Phaser.GameObjects.Container {
  const c = scene.add.container(0, 0);
  const rarityColor = (T.color.rarity as Record<string, { color: string }>)[rarity]?.color ?? C.text;
  let y = PAD;
  const texts = lines.map((l) => {
    const key = l.size === 'h' ? 'h3' : l.size === 'b' ? 'bodyL' : 'body';
    const color = l.color === 'rarity' ? rarityColor : l.color === 'gold' ? C.gold : l.color === 'good' ? C.good : l.color === 'danger' ? C.danger
      : l.color === 'dim' ? C.text500 : l.color === 'school' ? schoolColor : C.text;
    const t = scene.add.text(PAD, y, l.text, typeStyle(key as never, color, W - PAD * 2));
    y += t.height + (l.size === 'h' ? 4 : 3);
    return t;
  });
  const h = y + PAD - 3;
  const bg = scene.add.nineslice(0, 0, 'ui:tooltip', undefined, W, h, 8, 8, 8, 8).setOrigin(0);
  c.add([bg, ...texts]);
  let x = anchor.x + anchor.w + 8;
  if (x + W > GAME_WIDTH - 8) x = anchor.x - W - 8;
  c.setPosition(x, Math.max(8, Math.min(GAME_HEIGHT - h - 8, anchor.y)));
  parent.add(c);
  return c;
}
