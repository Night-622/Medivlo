/**
 * Minimap, built to design board "8c · HUD": 216×216 iron frame hanging left/down from anchors.topRight,
 * a 192px stepped-circle window (96 art px at 2×, 1 tile per art px), N/E/S/W letters, region + time banner below.
 * Fog at the rim and unloaded tiles use dither, never alpha.
 */
import Phaser from 'phaser';
import { drawFrame, hex, outlinedStyle, palette as P, pxText } from '@/ui/kit';

export interface MinimapMarker { tx: number; ty: number; color: number; size?: number; /** clamp to the rim when out of range (quest pins) */ edge?: boolean }

/** What the minimap needs from the world; implemented by WorldScene. */
export interface MinimapSource {
  playerTile(): [number, number];
  /** 0xRRGGBB, or null where unknown/unloaded. */
  colorAt(tx: number, ty: number): number | null;
  markers(): MinimapMarker[];
  region(): string;
  /** e.g. "DUSK 19:40" */
  time(): string;
}

const FRAME = 216, WIN = 96, SCALE = 2, INSET = 12;
const R = WIN / 2;
const REDRAW_MS = 200;
const TEX = 'minimap-canvas';

export class Minimap {
  private tex: Phaser.Textures.CanvasTexture;
  private root: Phaser.GameObjects.Container;
  private regionText: Phaser.GameObjects.Text;
  private timeText: Phaser.GameObjects.Text;
  private acc = REDRAW_MS;
  private img: ImageData;
  /** distance from centre per window pixel, stepped to whole art px */
  private dist = new Float32Array(WIN * WIN);

  constructor(scene: Phaser.Scene, anchor: Phaser.GameObjects.Container, private src: MinimapSource) {
    if (scene.textures.exists(TEX)) scene.textures.remove(TEX);
    const tex = scene.textures.createCanvas(TEX, WIN, WIN);
    if (!tex) throw new Error('minimap canvas failed');
    this.tex = tex;
    this.img = tex.getContext().createImageData(WIN, WIN);
    for (let y = 0; y < WIN; y++) for (let x = 0; x < WIN; x++) this.dist[y * WIN + x] = Math.hypot(x + 0.5 - R, y + 0.5 - R);

    const left = -FRAME;
    const g = scene.add.graphics();
    drawFrame(g, 'iron', left, 0, FRAME, FRAME);
    const image = scene.add.image(left + INSET, INSET, TEX).setOrigin(0).setScale(SCALE);
    const letter = (t: string, x: number, y: number, c: number) => scene.add.text(x, y, t, outlinedStyle('titleS', hex(c))).setOrigin(0.5);
    const mid = left + FRAME / 2;
    const compass = [
      letter('N', mid, 16, P['gold-400']), letter('E', -12, FRAME / 2, P['parch-700']),
      letter('S', mid, FRAME - 14, P['parch-700']), letter('W', left + 12, FRAME / 2, P['parch-700']),
    ];
    // Region + time banner (board: "plain" panel 216×28, 8px below the frame).
    const banner = scene.add.graphics();
    const by = FRAME + 8;
    banner.fillStyle(P['ink-900'], 1).fillRect(left - 2, by - 2, FRAME + 4, 32).fillRect(left + 4, by + 4, FRAME, 28);
    banner.fillStyle(P['ink-800'], 1).fillRect(left, by, FRAME, 28);
    banner.fillStyle(P['iron-600'], 1).fillRect(left, by, FRAME, 2).fillRect(left, by, 2, 28);
    banner.fillStyle(P['iron-800'], 1).fillRect(left, by + 26, FRAME, 2).fillRect(left + FRAME - 2, by, 2, 28);
    this.regionText = pxText(scene, left + 10, by + 14, '', 'titleS', hex(P['parch-500'])).setOrigin(0, 0.5);
    this.timeText = pxText(scene, -10, by + 15, '', 'micro', hex(P['parch-700'])).setOrigin(1, 0.5);
    this.root = scene.add.container(0, 0, [g, image, ...compass, banner, this.regionText, this.timeText]);
    anchor.add(this.root);
  }

  update(dtMs: number): void {
    this.acc += dtMs;
    if (this.acc < REDRAW_MS) return;
    this.acc = 0;
    const [ptx, pty] = this.src.playerTile();
    const x0 = ptx - R, y0 = pty - R;
    const d = this.img.data;
    const put = (i: number, c: number, a = 255) => { d[i] = (c >> 16) & 255; d[i + 1] = (c >> 8) & 255; d[i + 2] = c & 255; d[i + 3] = a; };
    for (let y = 0; y < WIN; y++) for (let x = 0; x < WIN; x++) {
      const i = (y * WIN + x) * 4;
      const r = this.dist[y * WIN + x];
      if (r > R) { put(i, 0, 0); continue; }                         // outside the stepped circle
      if (r > R - 1.5) { put(i, P['ink-900']); continue; }           // ink ring
      if (r > R - 3) { put(i, P['dusk-700']); continue; }            // dusk rim
      const c = this.src.colorAt(x0 + x, y0 + y);
      const checker = (x + y) % 2 === 0;
      if (c === null) { put(i, checker ? P['dusk-700'] : P['ink-900']); continue; }
      put(i, r > R - 8 && checker ? P['ink-900'] : c);               // fog band: checker dither
    }
    const plot = (mx: number, my: number, color: number, s: number) => {
      for (let yy = -s; yy <= s; yy++) for (let xx = -s; xx <= s; xx++) {
        const px = Math.round(mx + xx), py = Math.round(my + yy);
        if (px < 0 || py < 0 || px >= WIN || py >= WIN || this.dist[py * WIN + px] > R - 3) continue;
        put((py * WIN + px) * 4, color);
      }
    };
    for (const m of this.src.markers()) {
      let mx = m.tx - x0, my = m.ty - y0;
      if (m.edge) {
        const dx = mx - R, dy = my - R, len = Math.hypot(dx, dy);
        if (len > R - 6) { mx = R + (dx / len) * (R - 6); my = R + (dy / len) * (R - 6); }
      }
      plot(mx, my, m.color, m.size ?? 1);
    }
    // Player: gold arrow (board), 6 art px wide.
    for (const [dx, dy] of [[0, -2], [-1, -1], [0, -1], [-1, 0], [0, 0], [1, 0], [-2, 1], [-1, 1], [0, 1], [1, 1], [2, 1]]) put(((R + dy) * WIN + R + dx) * 4, P['gold-400']);
    for (let dx = -2; dx <= 2; dx++) put(((R + 2) * WIN + R + dx) * 4, P['ink-900']);
    this.tex.getContext().putImageData(this.img, 0, 0);
    this.tex.refresh();
    this.timeText.setText(this.src.time());
    const name = this.src.region();
    if (this.regionText.text !== name) {
      // Shrink long region names so they never run into the clock.
      const room = FRAME - 28 - this.timeText.width;
      this.regionText.setText(name).setFontSize(24);
      for (let size = 22; this.regionText.width > room && size >= 14; size -= 2) this.regionText.setFontSize(size);
    }
  }

  destroy(): void { this.root.destroy(); }
}
