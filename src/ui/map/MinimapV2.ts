/**
 * Hollow Crown minimap (handoff tokens component.minimap): 216×140 gold frame hanging left/down from
 * HudV2's anchors.topRight, a 192×108 map at scale 0.15 (≈ 40×22 tiles), player 6×6 gold, enemies 4×4
 * danger, and the region label row beneath (y 160). Tile colours come from the space's chunk minimap data.
 */
import Phaser from 'phaser';
import { TILE_SIZE } from '@/core';
import { C, T, n, panel, text } from '@/ui/kit/hc';

export interface MinimapV2Source {
  /** player world px */
  player(): { x: number; y: number };
  /** minimap colour of a tile, or null when its chunk isn't loaded */
  colorAt(tx: number, ty: number): number | null;
  /** enemies and points of interest (world px) */
  dots?(): { x: number; y: number; kind: 'enemy' | 'door' | 'waystone' | 'quest' }[];
  label(): string;
}

const [FW, FH] = T.component.minimap.frame as [number, number];
const [MW, MH] = T.component.minimap.map as [number, number];
const SCALE = T.component.minimap.scale;
const TILE_PX = TILE_SIZE * SCALE;
const COLS = Math.ceil(MW / TILE_PX) + 2, ROWS = Math.ceil(MH / TILE_PX) + 2;
const TEX = 'hc-minimap';
const DOT: Record<string, number> = { enemy: n(C.danger), door: n(C.text), waystone: n(C.teal), quest: n(C.gold) };

export class MinimapV2 {
  private root: Phaser.GameObjects.Container;
  private canvas: Phaser.Textures.CanvasTexture;
  private img: Phaser.GameObjects.Image;
  private marks: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private acc = 1e9;

  constructor(private scene: Phaser.Scene, anchor: Phaser.GameObjects.Container, private src: MinimapV2Source) {
    if (scene.textures.exists(TEX)) scene.textures.remove(TEX);
    this.canvas = scene.textures.createCanvas(TEX, COLS, ROWS)!;
    const ox = -FW, mx = ox + (FW - MW) / 2, my = (FH - MH) / 2;
    const frame = panel(scene, ox, 0, FW, FH, 'panel_gold');
    this.img = scene.add.image(0, 0, TEX).setOrigin(0).setScale(TILE_PX);
    const view = scene.add.container(mx, my, [this.img]);
    this.marks = scene.add.graphics();
    view.add(this.marks);
    this.label = text(scene, -FW / 2, 160 - 16, '', 'caption', C.text).setOrigin(0.5, 0);
    this.root = scene.add.container(0, 0, [frame, view, this.label]);
    anchor.add(this.root);
    // clip the map to its window (mask follows the anchor's screen position)
    const geo = scene.make.graphics({}, false);
    geo.fillRect(anchor.x + mx, anchor.y + my, MW, MH);
    view.setMask(geo.createGeometryMask());
  }

  /** Redraw ~6×/s (tiles) and every frame (marks). */
  update(dt: number): void {
    const p = this.src.player();
    const cx = p.x * SCALE - MW / 2, cy = p.y * SCALE - MH / 2; // map-px of the window's top-left
    const tx0 = Math.floor(cx / TILE_PX), ty0 = Math.floor(cy / TILE_PX);
    this.acc += dt;
    if (this.acc > 160) {
      this.acc = 0;
      const ctx = this.canvas.context;
      const img = ctx.createImageData(COLS, ROWS);
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
        const c = this.src.colorAt(tx0 + x, ty0 + y);
        const i = (y * COLS + x) * 4;
        const col = c ?? 0x0d1226;
        img.data[i] = col >> 16; img.data[i + 1] = (col >> 8) & 255; img.data[i + 2] = col & 255; img.data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      this.canvas.refresh();
      this.label.setText(this.src.label());
      this.tile0 = [tx0, ty0];
    }
    // the tile image scrolls smoothly between redraws
    this.img.setPosition(this.tile0[0] * TILE_PX - cx, this.tile0[1] * TILE_PX - cy);
    const g = this.marks.clear();
    for (const d of this.src.dots?.() ?? []) {
      const x = d.x * SCALE - cx, y = d.y * SCALE - cy;
      if (x < 0 || y < 0 || x > MW || y > MH) continue;
      const s = d.kind === 'enemy' ? 4 : 3;
      g.fillStyle(DOT[d.kind], 1).fillRect(Math.round(x - s / 2), Math.round(y - s / 2), s, s);
    }
    g.fillStyle(n(C.ink), 1).fillRect(MW / 2 - 4, MH / 2 - 4, 8, 8);
    g.fillStyle(n(C.gold), 1).fillRect(MW / 2 - 3, MH / 2 - 3, 6, 6);
  }

  private tile0: [number, number] = [0, 0];

  destroy(): void {
    this.root.destroy();
    if (this.scene.textures.exists(TEX)) this.scene.textures.remove(TEX);
  }
}
