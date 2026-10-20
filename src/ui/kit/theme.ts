/**
 * The original Medival UI theme tokens (Design System v1, design canvas "Medival UI Design"). Owner: Claude 1.
 * Pixel-art rules: 2× art grid, 64-colour locked palette, light from top-left, 1-art ink outlines,
 * hard drop shadows, dither instead of alpha.
 *
 * Still live: the 64-colour `palette` (map glyphs, narrative widgets, BookReader) and the `Theme` colours Boot uses
 * for placeholder textures. Hollow Crown screens use ui/kit/hc/theme.ts (the handoff tokens) instead.
 */

/** The locked 64-colour palette. Token names are final. */
export const palette = {
  'ink-900': 0x0e0b08, 'ink-800': 0x1a140e, 'ink-700': 0x281f16, 'ink-600': 0x3a2d20,
  'stone-900': 0x2b2824, 'stone-800': 0x3e3a34, 'stone-700': 0x5a554d, 'stone-600': 0x7b756b, 'stone-500': 0xa09a8e,
  'parch-900': 0x5e4f38, 'parch-800': 0x8a7857, 'parch-700': 0xb9a57c, 'parch-500': 0xe8d9b5, 'parch-300': 0xf7efd6,
  'leather-900': 0x3b2314, 'leather-800': 0x5c3a21, 'leather-700': 0x8a5a33, 'leather-500': 0xb98550,
  'iron-900': 0x1d2127, 'iron-800': 0x343b45, 'iron-600': 0x566170, 'iron-400': 0x8d9aab,
  'gold-900': 0x6b4a14, 'gold-800': 0x9a7020, 'gold-500': 0xd4a646, 'gold-400': 0xebc969, 'gold-200': 0xfbe7a3,
  'blood-900': 0x3f0f12, 'blood-800': 0x6b1d1f, 'blood-600': 0x9b2c2c, 'blood-400': 0xc94545, 'blood-200': 0xe88a7e,
  'mana-900': 0x1b3069, 'mana-700': 0x2a52a8, 'mana-500': 0x3b6fd1, 'mana-300': 0x8db6f2,
  'stam-900': 0x1f4021, 'stam-700': 0x347035, 'stam-500': 0x4f9d4a, 'stam-300': 0xa3d68f,
  'flame-700': 0x8c3a10, 'flame-500': 0xe0661c, 'flame-300': 0xffb04a,
  'frost-700': 0x1f5f7a, 'frost-500': 0x4fb3d1, 'frost-300': 0xbdf0f7,
  'storm-700': 0x6e7a14, 'storm-500': 0xc3d52e, 'storm-300': 0xf4ff9a,
  'shadow-700': 0x3a1c5c, 'shadow-500': 0x7a44b8, 'shadow-300': 0xc9a2f0,
  'mythic-700': 0x8a1f4d, 'mythic-400': 0xe8508f,
  'forest-900': 0x102418, 'moss-500': 0x7e8a3a, 'deepwater-800': 0x153844,
  'skin-100': 0xf0cba8, 'skin-300': 0xc98e62, 'skin-500': 0x8f5a3a, 'skin-700': 0x4e2f1e,
  'highlight-100': 0xfff8e8, 'ruin-teal-500': 0x2f6f6a, 'dusk-700': 0x4a4058,
} as const;

/** 0xRRGGBB → '#rrggbb' for Phaser text styles. */
export const hex = (c: number): string => `#${c.toString(16).padStart(6, '0')}`;
const P = palette;

/** Semantic roles: map every UI colour to one of these. */
export const roles = {
  bg: { base: P['ink-900'], panelDark: P['ink-800'], panelDarkRaised: P['ink-700'] },
  panelLight: { fill: P['parch-500'], shade: P['parch-700'], edge: P['parch-800'] },
  textOnDark: { primary: P['parch-500'], secondary: P['parch-700'], muted: P['stone-600'] },
  textOnLight: { primary: P['ink-900'], secondary: P['parch-900'] },
  accent: { selection: P['gold-500'], hover: P['gold-400'], sparkle: P['gold-200'] },
  resource: {
    hp: { lo: P['blood-800'], mid: P['blood-600'], hi: P['blood-400'], sheen: P['blood-200'] },
    mana: { lo: P['mana-900'], mid: P['mana-700'], hi: P['mana-500'], sheen: P['mana-300'] },
    stamina: { lo: P['stam-900'], mid: P['stam-700'], hi: P['stam-500'], sheen: P['stam-300'] },
    xp: { lo: P['gold-900'], mid: P['gold-800'], hi: P['gold-500'], sheen: P['gold-400'] },
    cast: { lo: P['ink-900'], mid: P['gold-400'], hi: P['gold-400'], sheen: P['gold-200'] },
  },
  state: {
    disabledFill: P['stone-900'], disabledBorder: P['stone-800'], disabledText: P['stone-700'],
    danger: P['blood-400'], success: P['stam-300'], warning: P['gold-400'],
  },
} as const;

/** Item rarity. Keys match Claude 3's `Rarity`; names are the lore display names. */
export const rarity = {
  common: { name: 'Common', border: P['stone-500'], text: P['parch-500'], plate: P['ink-800'], gem: 'none' },
  uncommon: { name: 'Fine', border: P['stam-500'], text: P['stam-300'], plate: P['stam-900'], gem: 'notch' },
  rare: { name: 'Ember-touched', border: P['mana-500'], text: P['mana-300'], plate: P['mana-900'], gem: 'diamond' },
  epic: { name: 'Runed', border: P['shadow-500'], text: P['shadow-300'], plate: P['shadow-700'], gem: 'diamond2' },
  legendary: { name: 'Wrought', border: P['flame-500'], text: P['flame-300'], plate: P['flame-700'], gem: 'star' },
  set: { name: 'Sparkforged', border: P['mythic-400'], text: P['mythic-400'], plate: P['mythic-700'], gem: 'crown' },
} as const;

/** Magic schools. Keys match Claude 3's `MagicSchool`. */
export const schools = {
  ash: { name: 'Ash', lo: P['flame-700'], mid: P['flame-500'], hi: P['flame-300'] },
  rime: { name: 'Rime', lo: P['frost-700'], mid: P['frost-500'], hi: P['frost-300'] },
  storm: { name: 'Storm', lo: P['storm-700'], mid: P['storm-500'], hi: P['storm-300'] },
  radiance: { name: 'Radiance', lo: P['gold-800'], mid: P['gold-400'], hi: P['gold-200'] },
  umbral: { name: 'Umbral', lo: P['shadow-700'], mid: P['shadow-500'], hi: P['shadow-300'] },
  verdant: { name: 'Verdant', lo: P['stam-900'], mid: P['stam-500'], hi: P['stam-300'] },
} as const;

/** Floating damage numbers (always 1-art ink outline). */
export const damage = {
  physical: P['parch-300'], magic: P['mana-300'], crit: P['gold-200'], critOutline: P['blood-900'],
  heal: P['stam-300'], blocked: P['stone-500'],
  fire: P['flame-300'], frost: P['frost-300'], lightning: P['storm-300'], radiant: P['gold-200'], shadow: P['shadow-300'], poison: P['stam-300'],
} as const;

/** Danger tier skull colours, tiers 1–5. */
export const tierColors = [P['stam-500'], P['gold-500'], P['flame-500'], P['blood-400'], P['mythic-400']] as const;

/** Fonts (self-hosted via @fontsource, loaded in main.ts before the game starts). */
export const fonts = {
  display: '"Jacquard 24", serif',
  heading: '"Jacquard 12", serif',
  body: '"Pixelify Sans", monospace',
  micro: '"Silkscreen", monospace',
} as const;

/** Type scale (screen px). Jacquard: Display/Title L. Jacquard 12: Title M/S. Pixelify: body. */
export const type = {
  displayXL: { font: fonts.display, size: 96 },
  titleL: { font: fonts.display, size: 48 },
  titleM: { font: fonts.heading, size: 32 },
  titleS: { font: fonts.heading, size: 24 },
  bodyL: { font: fonts.body, size: 24 },
  bodyM: { font: fonts.body, size: 20 },
  bodyS: { font: fonts.body, size: 16 },
  micro: { font: fonts.micro, size: 12 },
  numberHud: { font: fonts.body, size: 20 },
  numberDamage: { font: fonts.body, size: 24 },
  numberCrit: { font: fonts.body, size: 32 },
} as const;

/** Frame material sets. A UI theme swaps frame/trim/rivet; geometry never changes. */
export interface FrameTheme { frameHi: number; frameMid: number; frameLo: number; trimHi: number; trimMid: number; trimLo: number; rivet: number; fill: number }
export const themes: Record<'leatherIron' | 'stoneGold' | 'woodBrass', FrameTheme> = {
  leatherIron: { frameHi: P['iron-400'], frameMid: P['iron-600'], frameLo: P['iron-800'], trimHi: P['leather-500'], trimMid: P['leather-800'], trimLo: P['leather-900'], rivet: P['iron-400'], fill: P['ink-800'] },
  stoneGold: { frameHi: P['stone-500'], frameMid: P['stone-600'], frameLo: P['stone-800'], trimHi: P['gold-400'], trimMid: P['gold-500'], trimLo: P['gold-800'], rivet: P['gold-200'], fill: P['stone-800'] },
  woodBrass: { frameHi: P['leather-500'], frameMid: P['leather-700'], frameLo: P['leather-900'], trimHi: P['gold-400'], trimMid: P['gold-800'], trimLo: P['gold-900'], rivet: P['gold-400'], fill: P['leather-800'] },
};

export const Theme = {
  // ---- compatibility keys (used across ui/*) ----
  color: {
    ink: P['ink-900'], parchment: P['parch-500'], parchmentDark: P['parch-700'], gold: P['gold-500'], blood: P['blood-600'],
    mana: P['mana-500'], stamina: P['stam-500'], stone: P['stone-700'],
    text: P['parch-500'], textDim: P['stone-600'], panel: P['ink-800'], panelEdge: P['iron-600'],
  },
  css: {
    text: hex(P['parch-500']), textDim: hex(P['parch-700']), gold: hex(P['gold-500']), blood: hex(P['blood-400']),
    good: hex(P['stam-300']), bad: hex(P['blood-200']), muted: hex(P['stone-600']), hover: hex(P['gold-400']),
    ink: hex(P['ink-900']),
  },
  font: { title: fonts.heading, display: fonts.display, body: fonts.body, micro: fonts.micro },
  size: { title: 48, h1: 32, h2: 24, body: 16, small: 14 },
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  // ---- design system ----
  palette, roles, rarity, schools, damage, tierColors, type, themes,
  /** frame thickness 6 (3 art), drop shadow 4 (2 art), min hit target 32 */
  frame: { border: 6, shadow: 4, rivet: 4, minHit: 32 },
} as const;
