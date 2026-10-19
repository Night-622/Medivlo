/**
 * The Hollow Crown UI theme: the Claude Design handoff tokens (medival-tokens.json), typed.
 * Owner: Claude 1. Use these, not the old Theme, in every rebuilt screen.
 */
import tokens from './tokens.json';
import { Settings } from '@/core/settings';

export const T = tokens;

/** '#rrggbb' → 0xrrggbb */
export const n = (hex: string): number => parseInt(hex.replace('#', '').slice(0, 6), 16);

export const C = {
  ink: T.color.ui.ink, bg: T.color.ui.bg900, panel: T.color.ui.panel800, panel700: T.color.ui.panel700, panel600: T.color.ui.panel600,
  line: T.color.ui.line500, line300: T.color.ui.line300, line100: T.color.ui.line100, slotFill: T.color.ui.slotFill,
  text: T.color.text['100'], text300: T.color.text['300'], text500: T.color.text['500'], onGold: T.color.text.onGold,
  gold: T.color.accent.gold500, gold300: T.color.accent.gold300, gold700: T.color.accent.gold700, teal: T.color.accent.teal400,
  danger: T.color.state.danger, good: T.color.state.good,
} as const;

export type RarityKey = keyof typeof T.color.rarity;
export type SchoolKey = keyof typeof T.color.school;
export type TypeKey = keyof typeof T.type;

export const FONT = { display: '"Jersey 10", monospace', text: '"Pixelify Sans", monospace' } as const;

/** Phaser text style for a type-scale key. */
export function typeStyle(key: TypeKey, color: string = C.text, wrap?: number): Phaser.Types.GameObjects.Text.TextStyle {
  const t = T.type[key] as { font: 'display' | 'text'; size: number; lineHeight?: number; weight?: number; letterSpacing?: number; stroke?: number; strokeColor?: string; color?: string };
  // Accessibility › Text size: Large adds 2px to small text (< 16px), read when the text is created
  const size = t.size < 16 && Settings.get().textSize === 'large' ? t.size + 2 : t.size;
  return {
    fontFamily: FONT[t.font],
    fontSize: `${size}px`,
    fontStyle: t.weight ? String(t.weight) : undefined, // numeric weight (400–700 are bundled); 'bold' would ask for 700
    color: t.color ?? color,
    ...(t.stroke ? { stroke: t.strokeColor ?? C.ink, strokeThickness: t.stroke * 2 } : {}),
    ...(t.lineHeight ? { lineSpacing: Math.max(0, t.lineHeight - t.size) } : {}),
    ...(wrap ? { wordWrap: { width: wrap } } : {}),
  };
}

/** HUD safe centre: no HUD element may enter this rect. */
export const SAFE_CENTRE = T.hud.safeCentre;
export const MARGIN = T.hud.margin;
