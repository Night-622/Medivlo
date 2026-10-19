/**
 * Pixel-art helpers for Claude 3's panels (Design System v1: whole pixels, ink outlines, hard shadows,
 * dither instead of alpha). Built on Claude 1's ui/kit primitives.
 */
import Phaser from 'phaser';
import { Theme, checker, drawFrame, drawSlot, hex, palette as P, pxText, rarity as RARITY, schools } from '@/ui/kit';
import type { TypeKey } from '@/ui/kit';
import type { ItemDef, MagicSchool, Rarity, SpellDef } from '@/core';

export const C = {
  text: hex(P['parch-500']), text2: hex(P['parch-700']), muted: hex(P['stone-600']), gold: hex(P['gold-500']), goldHi: hex(P['gold-400']),
  good: hex(P['stam-300']), bad: hex(P['blood-200']), magic: hex(P['mana-300']), ink: hex(P['ink-900']), spark: hex(P['gold-200']),
  inkOnParch: hex(P['ink-900']), parchDark: hex(P['parch-900']), leather: hex(P['leather-900']),
} as const;

export const rarityOf = (r: Rarity) => RARITY[r];
export const rarityCssOf = (r: Rarity) => hex(RARITY[r].text);

/** Full-screen 50% dither dim (no alpha). */
export function dimScreen(scene: Phaser.Scene, g: Phaser.GameObjects.Graphics): void {
  checker(g, 0, 0, scene.scale.width, scene.scale.height, P['ink-900']);
}

export function txt(scene: Phaser.Scene, x: number, y: number, s: string, key: TypeKey = 'bodyS', color: string = C.text, wrap?: number): Phaser.GameObjects.Text {
  return pxText(scene, Math.round(x), Math.round(y), s, key, color, true, wrap);
}

/** Key chip (e.g. "1", "Q", "CLICK"): parchment plate, ink text. */
export function chip(scene: Phaser.Scene, g: Phaser.GameObjects.Graphics, x: number, y: number, label: string): Phaser.GameObjects.Text {
  const t = pxText(scene, x + 4, y + 3, label, 'micro', C.ink, false);
  const w = Math.max(14, Math.round(t.width) + 8);
  g.fillStyle(P['ink-900'], 1).fillRect(x - 2, y - 2, w + 4, 22);
  g.fillStyle(P['parch-500'], 1).fillRect(x, y, w, 18);
  g.fillStyle(P['parch-800'], 1).fillRect(x, y + 16, w, 2).fillRect(x + w - 2, y, 2, 18);
  return t;
}

/** Iron button drawn into g, with an interactive zone. */
export function ironButton(scene: Phaser.Scene, parent: Phaser.GameObjects.Container, x: number, y: number, w: number, h: number, label: string, onClick: () => void, variant: 'normal' | 'gold' | 'red' = 'normal'): void {
  const g = scene.add.graphics();
  const fill = variant === 'gold' ? P['gold-800'] : variant === 'red' ? P['blood-800'] : P['ink-600'];
  const hi = variant === 'gold' ? P['gold-500'] : variant === 'red' ? P['blood-400'] : P['iron-600'];
  const lo = variant === 'gold' ? P['gold-900'] : variant === 'red' ? P['blood-900'] : P['ink-800'];
  const draw = (hover: boolean) => {
    g.clear();
    g.fillStyle(P['ink-900'], 1).fillRect(x - 2, y - 2, w + 4, h + 4).fillRect(x + 2, y + 2, w + 4, h + 4);
    g.fillStyle(hover ? hi : fill, 1).fillRect(x, y, w, h);
    g.fillStyle(hi, 1).fillRect(x, y, w, 2).fillRect(x, y, 2, h);
    g.fillStyle(lo, 1).fillRect(x, y + h - 2, w, 2).fillRect(x + w - 2, y, 2, h);
  };
  draw(false);
  const t = txt(scene, x + w / 2, y + h / 2, label, 'bodyS', C.text).setOrigin(0.5);
  t.setPosition(Math.round(t.x), Math.round(t.y));
  const z = scene.add.zone(x, y, w, h).setOrigin(0).setInteractive({ useHandCursor: true });
  z.on('pointerover', () => draw(true));
  z.on('pointerout', () => draw(false));
  z.on('pointerup', onClick);
  parent.add([g, t, z]);
}

/** Interactive rectangle zone with hover/out/click callbacks. */
export function hotspot(
  scene: Phaser.Scene, parent: Phaser.GameObjects.Container, x: number, y: number, w: number, h: number,
  on: { over?: () => void; out?: () => void; click?: (right: boolean) => void },
): Phaser.GameObjects.Zone {
  const z = scene.add.zone(x, y, w, h).setOrigin(0).setInteractive({ useHandCursor: !!on.click });
  if (on.over) z.on('pointerover', on.over);
  if (on.out) z.on('pointerout', on.out);
  if (on.click) z.on('pointerup', (p: Phaser.Input.Pointer) => on.click!(p.rightButtonReleased()));
  parent.add(z);
  return z;
}

// ───────── 8×8 pixel icons ─────────
const ICONS: Record<string, string[]> = {
  blade: ['......##', '.....##.', '....##..', '...##...', '#.##....', '.##.....', '.##.....', '#..#....'],
  axe: ['..###...', '.#####..', '.####.#.', '..##..#.', '......#.', '.....#..', '....#...', '...#....'],
  blunt: ['....###.', '...#####', '....###.', '...#....', '..#.....', '.#......', '#.......', '........'],
  bow: ['..#####.', '.#....#.', '#....#..', '#...#...', '#..#....', '#.#.....', '##......', '#.......'],
  staff: ['......##', '.....###', '......#.', '.....#..', '....#...', '...#....', '..#.....', '.#......'],
  shield: ['.######.', '########', '###..###', '##.##.##', '########', '.######.', '..####..', '...##...'],
  armor: ['.##..##.', '########', '########', '.######.', '.######.', '.##..##.', '.######.', '.######.'],
  ring: ['...##...', '..#..#..', '.######.', '#......#', '#......#', '#......#', '.#....#.', '..####..'],
  potion: ['...##...', '...##...', '..####..', '.######.', '########', '########', '########', '.######.'],
  book: ['.######.', '#.#....#', '#.#....#', '#.#.##.#', '#.#....#', '#.#....#', '#.######', '.#######'],
  gem: ['..####..', '.#.##.#.', '########', '.######.', '..####..', '...##...', '........', '........'],
  misc: ['........', '..####..', '.#....#.', '.#.##.#.', '.#.##.#.', '.#....#.', '..####..', '........'],
  // spell kinds
  bolt: ['......##', '.....###', '....###.', '...###..', '..###...', '.###....', '###.....', '##......'],
  ring2: ['..####..', '.#....#.', '#..##..#', '#.#..#.#', '#.#..#.#', '#..##..#', '.#....#.', '..####..'],
  arc: ['..####..', '.#....#.', '#......#', '........', '...##...', '..####..', '...##...', '...##...'],
  burst: ['#..#..#.', '.#.#.#..', '..###...', '#######.', '..###...', '.#.#.#..', '#..#..#.', '........'],
  beam: ['........', '##......', '####....', '########', '########', '####....', '##......', '........'],
  orb: ['..####..', '.######.', '########', '########', '########', '########', '.######.', '..####..'],
  // skill-tree glyphs
  plus: ['........', '...##...', '...##...', '.######.', '.######.', '...##...', '...##...', '........'],
  crown: ['#..##..#', '#..##..#', '##.##.##', '########', '########', '########', '........', '........'],
  banner: ['#.......', '#######.', '#######.', '#######.', '#####...', '#.......', '#.......', '#.......'],
  heart: ['.##..##.', '########', '########', '########', '.######.', '..####..', '...##...', '........'],
};

export function icon(g: Phaser.GameObjects.Graphics, shape: string, color: number, x: number, y: number, scale = 4): void {
  const rows = ICONS[shape] ?? ICONS.misc;
  // ink outline: draw dilated ink first
  g.fillStyle(P['ink-900'], 1);
  rows.forEach((r, yy) => [...r].forEach((c, xx) => { if (c === '#') g.fillRect(x + xx * scale - 2, y + yy * scale - 2, scale + 4, scale + 4); }));
  g.fillStyle(color, 1);
  rows.forEach((r, yy) => [...r].forEach((c, xx) => { if (c === '#') g.fillRect(x + xx * scale, y + yy * scale, scale, scale); }));
  // top-left light: one highlight pixel row
  g.fillStyle(Phaser.Display.Color.ValueToColor(color).lighten(25).color, 1);
  rows.forEach((r, yy) => [...r].forEach((c, xx) => { if (c === '#' && (yy === 0 || rows[yy - 1][xx] !== '#')) g.fillRect(x + xx * scale, y + yy * scale, scale, Math.max(1, scale / 2)); }));
}

const parseHex = (s: string) => parseInt(s.replace('#', ''), 16);

/** Item in a slot: rarity border + plate + icon. */
export function itemSlot(g: Phaser.GameObjects.Graphics, def: ItemDef | undefined, rarity: Rarity | null, x: number, y: number, size: number, state: 'normal' | 'hover' | 'selected' | 'locked' = 'normal'): void {
  const r = rarity ? RARITY[rarity] : null;
  drawSlot(g, x, y, size, r?.border ?? P['stone-700'], r?.plate ?? P['ink-800'], state);
  if (!def) return;
  const sc = size >= 56 ? 4 : size >= 44 ? 3 : 2;
  const off = Math.round((size - 8 * sc) / 2);
  icon(g, def.icon.shape, parseHex(def.icon.color), x + off, y + off, sc);
}

export function schoolColor(spell: SpellDef): { lo: number; mid: number; hi: number } {
  if (spell.school) return schools[spell.school as MagicSchool];
  if (spell.discipline === 'ashmark') return { lo: P['flame-700'], mid: P['gold-500'], hi: P['gold-200'] };
  if (spell.discipline === 'archery') return { lo: P['stam-900'], mid: P['moss-500'], hi: P['stam-300'] };
  return { lo: P['iron-800'], mid: P['iron-400'], hi: P['parch-300'] };
}

const SPELL_ICON: Record<string, string> = { projectile: 'bolt', melee: 'arc', cone: 'arc', area: 'burst', aura: 'ring2', self: 'ring2', chain: 'beam', dash: 'beam', summon: 'orb' };

/** Spell in a slot: school-coloured border/plate + delivery icon. */
export function spellSlot(g: Phaser.GameObjects.Graphics, spell: SpellDef | undefined, x: number, y: number, size: number, state: 'normal' | 'hover' | 'selected' | 'locked' = 'normal'): void {
  if (!spell) { drawSlot(g, x, y, size, P['stone-700'], P['ink-800'], state); return; }
  const c = schoolColor(spell);
  drawSlot(g, x, y, size, c.mid, c.lo, state);
  const sc = size >= 56 ? 4 : size >= 44 ? 3 : 2;
  const off = Math.round((size - 8 * sc) / 2);
  icon(g, SPELL_ICON[spell.delivery.kind] ?? 'orb', c.hi, x + off, y + off, sc);
}

/** Tooltip frame (accent = rarity border). Returns content origin. */
export function tooltipFrame(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, accent: number): void {
  drawFrame(g, 'tooltip', x, y, w, h, accent);
}

/** Section header (Jacquard 12, 24px, gold). */
export function header(scene: Phaser.Scene, x: number, y: number, s: string): Phaser.GameObjects.Text {
  return txt(scene, x, y, s, 'titleS', C.gold);
}

/** 2px divider with ink shadow. */
export function vrule(g: Phaser.GameObjects.Graphics, x: number, y: number, h: number): void {
  g.fillStyle(P['ink-600'], 1).fillRect(x, y, 2, h);
  g.fillStyle(P['ink-900'], 1).fillRect(x + 2, y, 2, h);
}

export { Theme, P };
