/** Runtime placeholder tileset atlas (WORLD.md §3.5). One 32px cell per tile id, drawn with canvas 2D. */
import Phaser from 'phaser';
import { TILE_SIZE } from '@/core';
import { hash01 } from './noise';
import { TILE_COUNT, tileInfo, type TileStyle } from './tiles';

export const TILESET_KEY = 'world-tiles';
const COLS = 16;

function css(c: number, a = 1): string {
  return `rgba(${(c >> 16) & 255},${(c >> 8) & 255},${c & 255},${a})`;
}
function shade(c: number, f: number): number {
  const ch = (s: number) => Math.max(0, Math.min(255, Math.round(((c >> s) & 255) * f)));
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}

function drawTile(g: CanvasRenderingContext2D, id: number, ox: number, oy: number): void {
  const S = TILE_SIZE;
  const { color, style } = tileInfo(id);
  const r = (i: number) => hash01(id, i, 77);
  const dots = (n: number, c: number, size = 2) => {
    g.fillStyle = css(c);
    for (let i = 0; i < n; i++) g.fillRect(ox + Math.floor(r(i) * (S - size)), oy + Math.floor(r(i + 500) * (S - size)), size, size);
  };
  const transparent: TileStyle[] = ['trunk', 'canopy', 'rock', 'bush', 'roof', 'cross', 'fire', 'reeds', 'vein', 'banner'];
  const isOverlay = transparent.includes(style) && id >= 21;
  if (!isOverlay) { g.fillStyle = css(color); g.fillRect(ox, oy, S, S); }

  switch (style) {
    case 'flat': break;
    case 'speckle': dots(14, shade(color, 0.8)); dots(8, shade(color, 1.18)); break;
    case 'grass':
      dots(10, shade(color, 0.78));
      g.fillStyle = css(shade(color, 1.25));
      for (let i = 0; i < 9; i++) g.fillRect(ox + Math.floor(r(i + 40) * 30), oy + Math.floor(r(i + 90) * 28), 1, 3);
      break;
    case 'flowers': dots(12, shade(color, 0.8)); dots(6, 0xb07aa8); dots(3, 0xd8c060); break;
    case 'water':
      g.fillStyle = css(shade(color, 1.25));
      for (let i = 0; i < 4; i++) g.fillRect(ox + Math.floor(r(i) * 22), oy + 4 + i * 7, 8, 1);
      break;
    case 'stripes':
      g.fillStyle = css(shade(color, 0.75));
      for (let y = 2; y < S; y += 6) g.fillRect(ox, oy + y, S, 2);
      break;
    case 'brick':
      g.fillStyle = css(shade(color, 0.65));
      for (let y = 0; y < S; y += 8) {
        g.fillRect(ox, oy + y, S, 1);
        for (let x = (y / 8) % 2 ? 0 : 8; x < S; x += 16) g.fillRect(ox + x, oy + y, 1, 8);
      }
      break;
    case 'planks':
      g.fillStyle = css(shade(color, 0.7));
      for (let x = 0; x < S; x += 8) g.fillRect(ox + x, oy, 1, S);
      break;
    case 'stone':
      g.strokeStyle = css(shade(color, 0.7));
      g.strokeRect(ox + 1.5, oy + 1.5, 13, 13); g.strokeRect(ox + 16.5, oy + 1.5, 14, 13);
      g.strokeRect(ox + 1.5, oy + 16.5, 20, 14); g.strokeRect(ox + 23.5, oy + 16.5, 7, 14);
      break;
    case 'door':
      g.fillStyle = css(0x2a1a0e); g.fillRect(ox + 6, oy + 2, 20, 30);
      g.fillStyle = css(0xd4a646); g.fillRect(ox + 21, oy + 16, 2, 2);
      break;
    case 'trunk':
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(ox + 16, oy + 28, 11, 4, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = css(color); g.fillRect(ox + 12, oy + 6, 8, 23);
      g.fillStyle = css(shade(color, 0.7)); g.fillRect(ox + 12, oy + 6, 2, 23);
      break;
    case 'canopy':
      g.fillStyle = css(shade(color, 0.8)); g.beginPath(); g.arc(ox + 16, oy + 17, 15, 0, Math.PI * 2); g.fill();
      g.fillStyle = css(color); g.beginPath(); g.arc(ox + 14, oy + 14, 12, 0, Math.PI * 2); g.fill();
      g.fillStyle = css(shade(color, 1.25)); g.beginPath(); g.arc(ox + 11, oy + 10, 5, 0, Math.PI * 2); g.fill();
      break;
    case 'bush':
      g.fillStyle = css(shade(color, 0.75)); g.beginPath(); g.arc(ox + 16, oy + 19, 12, 0, Math.PI * 2); g.fill();
      g.fillStyle = css(color); g.beginPath(); g.arc(ox + 13, oy + 16, 9, 0, Math.PI * 2); g.arc(ox + 21, oy + 17, 8, 0, Math.PI * 2); g.fill();
      break;
    case 'rock':
      g.fillStyle = css(shade(color, 0.7));
      g.beginPath(); g.moveTo(ox + 3, oy + 29); g.lineTo(ox + 7, oy + 8); g.lineTo(ox + 18, oy + 3); g.lineTo(ox + 29, oy + 12); g.lineTo(ox + 30, oy + 29); g.closePath(); g.fill();
      g.fillStyle = css(color);
      g.beginPath(); g.moveTo(ox + 7, oy + 26); g.lineTo(ox + 9, oy + 10); g.lineTo(ox + 18, oy + 6); g.lineTo(ox + 26, oy + 13); g.lineTo(ox + 26, oy + 26); g.closePath(); g.fill();
      break;
    case 'roof':
      g.fillStyle = css(color); g.fillRect(ox, oy, S, S);
      g.fillStyle = css(shade(color, 0.75));
      for (let y = 3; y < S; y += 6) g.fillRect(ox, oy + y, S, 2);
      break;
    case 'cross':
      g.fillStyle = css(color); g.fillRect(ox + 4, oy + 8, 24, 5); g.fillRect(ox + 4, oy + 20, 24, 5);
      g.fillRect(ox + 7, oy + 4, 4, 26); g.fillRect(ox + 21, oy + 4, 4, 26);
      break;
    case 'fire':
      g.fillStyle = css(0x4a3420); g.fillRect(ox + 6, oy + 22, 20, 5);
      g.fillStyle = css(0xe08a2a); g.beginPath(); g.moveTo(ox + 9, oy + 23); g.lineTo(ox + 16, oy + 6); g.lineTo(ox + 23, oy + 23); g.fill();
      g.fillStyle = css(0xf2d060); g.beginPath(); g.moveTo(ox + 13, oy + 23); g.lineTo(ox + 16, oy + 13); g.lineTo(ox + 19, oy + 23); g.fill();
      break;
    case 'reeds':
      if (id >= 21) { /* reeds deco: transparent */ } else dots(10, shade(color, 0.7));
      g.fillStyle = css(id === 12 ? 0xcfc9b0 : shade(color, 1.2));
      for (let i = 0; i < 7; i++) g.fillRect(ox + 3 + Math.floor(r(i) * 26), oy + 6 + Math.floor(r(i + 9) * 12), 1, 10);
      break;
    case 'banner':
      g.fillStyle = css(0x3a2d20); g.fillRect(ox + 15, oy + 2, 2, 30);
      g.fillStyle = css(color); g.fillRect(ox + 8, oy + 4, 16, 18);
      g.fillStyle = css(0xd4a646); g.fillRect(ox + 8, oy + 4, 16, 2); g.fillRect(ox + 14, oy + 10, 4, 6);
      g.fillStyle = css(color); g.beginPath(); g.moveTo(ox + 8, oy + 22); g.lineTo(ox + 16, oy + 27); g.lineTo(ox + 24, oy + 22); g.fill();
      break;
    case 'vein':
      if (id === 48) { g.fillStyle = css(0x5a5650); g.fillRect(ox + 10, oy + 2, 12, 28); }
      g.strokeStyle = css(color); g.lineWidth = 2;
      g.beginPath(); g.moveTo(ox + 4, oy + 26); g.lineTo(ox + 12, oy + 18); g.lineTo(ox + 18, oy + 20); g.lineTo(ox + 28, oy + 6); g.stroke();
      g.lineWidth = 1;
      break;
  }
}

/** Build the atlas once; returns the texture key. */
export function ensureTileset(scene: Phaser.Scene): string {
  if (scene.textures.exists(TILESET_KEY)) return TILESET_KEY;
  const rows = Math.ceil(TILE_COUNT / COLS);
  const tex = scene.textures.createCanvas(TILESET_KEY, COLS * TILE_SIZE, rows * TILE_SIZE);
  if (!tex) throw new Error('tileset canvas failed');
  const g = tex.getContext();
  for (let id = 0; id < TILE_COUNT; id++) drawTile(g, id, (id % COLS) * TILE_SIZE, Math.floor(id / COLS) * TILE_SIZE);
  tex.refresh();
  return TILESET_KEY;
}
