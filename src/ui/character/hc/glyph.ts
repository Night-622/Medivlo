/** Rarity glyphs (Claude 3, Settings.rarityGlyphs): a shape in the slot corner so rarity never relies on colour alone. */
import Phaser from 'phaser';
import { Settings } from '@/core/settings';
import { T } from '@/ui/kit/hc';
import { itemInfo, legendary } from '@/systems/rules/gear';

const GLYPH: Record<string, string> = { common: '·', fine: '◆', ember: '▲', runed: '✦', wrought: '■', spark: '✸' };

/** Adds the glyph for `base` at the slot's top-left corner (slot origin x, y). No-op when the setting is off. */
export function rarityGlyph(scene: Phaser.Scene, parent: Phaser.GameObjects.Container, base: string, x: number, y: number): void {
  if (!Settings.get().rarityGlyphs) return;
  const info = itemInfo(base);
  if (!info) return;
  const g = legendary(base) ? '★' : GLYPH[info.rarity] ?? '';
  if (!g) return;
  const color = (T.color.rarity as Record<string, { color: string; accent?: string }>)[info.rarity];
  parent.add(scene.add.text(x + 5, y + 2, g, { fontFamily: '"Pixelify Sans", monospace', fontSize: '11px', color: legendary(base) ? color?.accent ?? '#ffd23f' : color?.color ?? '#e6e9f5', stroke: '#1a1230', strokeThickness: 2 }));
}
