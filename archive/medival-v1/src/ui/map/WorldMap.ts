/**
 * World map (M), built to design board "8j · World Map": stone & gold frames, flat region colours with pixel
 * glyphs, three fog states by dither only (explored / seen / hidden), tier skulls, legend, region card.
 * Lives in the HUD scene; WorldScene toggles it and supplies the data (WorldMapSource).
 */
import Phaser from 'phaser';
import { checker, drawFrame, hex, outlinedStyle, palette as P, pxText, tierColors } from '@/ui/kit';
import { drawGlyph, type GlyphName } from './glyphs';

export type FogState = 'explored' | 'seen' | 'hidden';
export interface WorldMapPin { tx: number; ty: number; kind: 'waystone' | 'town' | 'dungeon' | 'quest' | 'player' | 'boss' | 'unknown' }
export interface WorldMapRegion { code: string; name: string; tier: number; color: number; state: FogState; at: [number, number] }

export interface WorldMapWaystone { id: string; name: string; tx: number; ty: number; region: string; tier: number; unlocked: boolean }

export interface WorldMapSource {
  widthTiles: number;
  heightTiles: number;
  /** region layout code at a tile ('~' = sea) */
  codeAt(tx: number, ty: number): string;
  chunkDiscovered(cx: number, cy: number): boolean;
  regions(): WorldMapRegion[];
  routes(): { kind: string; points: [number, number][] }[];
  pins(): WorldMapPin[];
  current(): { name: string; tier: number; explored: number; found: [number, number] } | null;
  waystones(): WorldMapWaystone[];
  /** Why fast travel is unavailable right now (combat, dungeon, dialogue), or null. */
  travelBlocked(): string | null;
  /** In-game hours to reach a waystone from where the player is. */
  travelHours(id: string): number;
  /** Gold cost (0 when the economy service is absent) and whether the player can pay it. */
  travelCost(id: string): { gold: number; affordable: boolean };
  travel(id: string): void;
}

const ART_W = 384, ART_H = 288, SCALE = 2, MAP_X = 48, MAP_Y = 72, B = 4;
const TEX = 'worldmap-art';

function hash(x: number, y: number): number {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) ^ 0x5bd1e995;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export class WorldMap {
  private root: Phaser.GameObjects.Container;
  private tex: Phaser.Textures.CanvasTexture;
  private pinsG: Phaser.GameObjects.Graphics;
  private cardG: Phaser.GameObjects.Graphics;
  private travelG!: Phaser.GameObjects.Graphics;
  private dynamic: Phaser.GameObjects.GameObject[] = [];
  private show = { waystone: true, quest: true, dungeon: true };
  private acc = 0;
  private selected: string | null = null;
  open = false;

  constructor(private scene: Phaser.Scene, private src: WorldMapSource) {
    if (scene.textures.exists(TEX)) scene.textures.remove(TEX);
    const tex = scene.textures.createCanvas(TEX, ART_W, ART_H);
    if (!tex) throw new Error('world map canvas failed');
    this.tex = tex;
    const { width, height } = scene.scale;

    const bg = scene.add.rectangle(0, 0, width, height, P['stone-900'], 1).setOrigin(0).setInteractive();
    const frames = scene.add.graphics();
    drawFrame(frames, 'stone', 24, 24, 816, 672);
    drawFrame(frames, 'stone', 864, 24, 392, 672);
    const map = scene.add.image(MAP_X, MAP_Y, TEX).setOrigin(0).setScale(SCALE);
    const plate = scene.add.graphics();
    drawFrame(plate, 'stone', 48, 40, 340, 52);
    const title = pxText(scene, 218, 66, 'The Known Lands', 'titleL', hex(P['gold-200'])).setOrigin(0.5).setFontSize(40);
    // Scale bar: 20 leagues.
    const bar = scene.add.graphics();
    bar.fillStyle(P['ink-900'], 1).fillRect(618, 638, 100, 12);
    [P['parch-500'], P['ink-900'], P['parch-500']].forEach((c, i) => bar.fillStyle(c, 1).fillRect(620 + i * 32, 640, 32, 8));
    const barText = scene.add.text(726, 644, '20 LEAGUES', outlinedStyle('micro', hex(P['parch-500']))).setOrigin(0, 0.5);
    // Compass.
    const rose = scene.add.graphics();
    rose.fillStyle(P['gold-900'], 1).fillCircle(928, 92, 30).fillStyle(P['stone-900'], 1).fillCircle(928, 92, 24);
    rose.fillStyle(P['gold-400'], 1).fillTriangle(928, 66, 922, 92, 934, 92).fillStyle(P['parch-700'], 1).fillTriangle(928, 118, 922, 92, 934, 92);
    const north = scene.add.text(928, 50, 'N', outlinedStyle('titleS', hex(P['gold-200']))).setOrigin(0.5);
    const hint = scene.add.text(1240, 680, 'M · ESC  CLOSE', outlinedStyle('micro', hex(P['parch-700']))).setOrigin(1, 1);

    this.pinsG = scene.add.graphics();
    this.cardG = scene.add.graphics();
    this.root = scene.add.container(0, 0, [bg, frames, map, this.pinsG, plate, title, bar, barText, rose, north, hint, this.cardG])
      .setDepth(10_000).setVisible(false);
    this.travelG = scene.add.graphics();
    this.root.add(this.travelG);
    this.buildToggles();
    this.buildLegend();
  }

  private buildToggles(): void {
    const items: [keyof WorldMap['show'], string][] = [['waystone', 'Waystones'], ['quest', 'Quests'], ['dungeon', 'Dungeons']];
    const x = 984;
    let y = 58;
    for (const [key, label] of items) {
      const box = this.scene.add.graphics();
      const by = y;
      const draw = () => {
        box.clear().fillStyle(P['ink-900'], 1).fillRect(x - 2, by - 2, 18, 18).fillStyle(P['stone-600'], 1).fillRect(x, by, 14, 14)
          .fillStyle(this.show[key] ? P['gold-500'] : P['stone-900'], 1).fillRect(x + 2, by + 2, 10, 10);
      };
      draw();
      const text = pxText(this.scene, x + 22, by + 7, label, 'bodyS').setOrigin(0, 0.5);
      const hit = this.scene.add.zone(x - 2, by - 4, 22 + text.width + 4, 22).setOrigin(0).setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => { this.show[key] = !this.show[key]; draw(); this.redraw(); });
      this.root.add([box, text, hit]);
      y += 26;
    }
  }

  private buildLegend(): void {
    const s = this.scene;
    const g = s.add.graphics();
    const parts: Phaser.GameObjects.GameObject[] = [g, pxText(s, 884, 160, 'Legend', 'titleS', hex(P['gold-400']))];
    const rows: [GlyphName, string, number][] = [
      ['obelisk', 'Waystone', 2], ['unknown', 'Unfound', 2], ['player', 'You', 2], ['quest', 'Quest', 2],
      ['town', 'Town', 2], ['dungeon', 'Dungeon', 2], ['boss', 'Boss', 2],
    ];
    rows.forEach(([glyph, label, sc], i) => {
      const x = 884 + (i % 2) * 176, y = 196 + Math.floor(i / 2) * 32;
      drawGlyph(g, glyph, x, y, sc);
      parts.push(pxText(s, x + 32, y + 12, label, 'bodyS').setOrigin(0, 0.5));
    });
    // Danger skulls, tiers 1–5.
    tierColors.forEach((c, i) => drawGlyph(g, 'skull', 1060 + i * 16, 196 + 3 * 32 + 4, 1.5, c));
    parts.push(pxText(s, 1144, 196 + 3 * 32 + 12, 'Danger', 'bodyS').setOrigin(0, 0.5));
    // Fog swatches.
    const sy = 340;
    g.fillStyle(P['ink-900'], 1).fillRect(882, sy - 2, 32, 20).fillStyle(P['stam-500'], 1).fillRect(884, sy, 28, 16);
    g.fillStyle(P['ink-900'], 1).fillRect(1002, sy - 2, 32, 20).fillStyle(P['stam-500'], 1).fillRect(1004, sy, 28, 16);
    checker(g, 1004, sy, 28, 16, P['ink-900']);
    g.fillStyle(P['ink-900'], 1).fillRect(1122, sy - 2, 32, 20);
    checker(g, 1124, sy, 28, 16, P['dusk-700']);
    parts.push(pxText(s, 920, sy + 8, 'Explored', 'bodyS').setOrigin(0, 0.5), pxText(s, 1040, sy + 8, 'Seen', 'bodyS').setOrigin(0, 0.5),
      pxText(s, 1160, sy + 8, 'Unknown', 'bodyS').setOrigin(0, 0.5));
    this.root.add(parts);
  }

  /** Board 8j fast-travel card for the selected waystone (gold-edged, above the region card). */
  private drawTravelCard(): void {
    const c = this.travelG.clear();
    const w = this.selected ? this.src.waystones().find((x) => x.id === this.selected && x.unlocked) : undefined;
    if (!w) return;
    const s = this.scene;
    const cx = 884, cy = 380, cw = 352, ch = 140;
    c.fillStyle(P['ink-900'], 1).fillRect(cx - 2, cy - 2, cw + 4, ch + 4).fillRect(cx + 6, cy + 6, cw, ch);
    c.fillStyle(P['gold-500'], 1).fillRect(cx, cy, cw, ch).fillStyle(P['stone-900'], 1).fillRect(cx + 2, cy + 2, cw - 4, ch - 4)
      .fillStyle(P['ink-800'], 1).fillRect(cx + 4, cy + 4, cw - 8, ch - 8);
    drawGlyph(c, 'obelisk', cx + cw - 36, cy + 10, 2);
    const hours = this.src.travelHours(w.id);
    const cost = this.src.travelCost(w.id);
    const blocked = this.src.travelBlocked() ?? (cost.affordable ? null : `Travel: ${hours} h · ${cost.gold} gold (you cannot afford it)`);
    this.dynamic.push(
      pxText(s, cx + 14, cy + 22, `${w.name} Waystone`, 'titleS', hex(P['gold-200'])).setOrigin(0, 0.5),
      pxText(s, cx + 14, cy + 50, `${w.region} · tier ${w.tier}`, 'bodyS', hex(P['parch-700'])).setOrigin(0, 0.5),
      pxText(s, cx + 14, cy + 74, blocked ?? `Travel: ${hours} h of in-game time${cost.gold ? ` · ${cost.gold} gold` : ''}`, 'bodyS', hex(blocked ? P['blood-200'] : P['parch-700'])).setOrigin(0, 0.5),
    );
    if (blocked) return;
    const bx = cx + 14, by = cy + ch - 46;
    c.fillStyle(P['ink-900'], 1).fillRect(bx - 2, by - 2, 124, 36).fillRect(bx + 4, by + 4, 120, 32);
    c.fillStyle(P['gold-800'], 1).fillRect(bx, by, 120, 32).fillStyle(P['gold-400'], 1).fillRect(bx, by, 120, 2).fillRect(bx, by, 2, 32)
      .fillStyle(P['gold-900'], 1).fillRect(bx, by + 30, 120, 2).fillRect(bx + 118, by, 2, 32);
    const label = pxText(s, bx + 60, by + 16, 'Travel', 'bodyS', hex(P['gold-200'])).setOrigin(0.5);
    const hit = s.add.zone(bx, by, 120, 32).setOrigin(0).setInteractive({ useHandCursor: true });
    hit.on('pointerdown', () => { const id = w.id; this.selected = null; this.src.travel(id); });
    this.dynamic.push(label, hit);
  }

  toggle(): boolean {
    this.open = !this.open;
    if (!this.open) this.selected = null;
    this.root.setVisible(this.open);
    if (this.open) this.redraw();
    return this.open;
  }

  update(dtMs: number): void {
    if (!this.open) return;
    this.acc += dtMs;
    if (this.acc > 1000) this.redraw();
  }

  private artOf(tx: number, ty: number): [number, number] {
    return [(tx / this.src.widthTiles) * ART_W, (ty / this.src.heightTiles) * ART_H];
  }

  private paintArt(): void {
    const s = this.src;
    const ctx = this.tex.getContext();
    const img = ctx.createImageData(ART_W, ART_H);
    const d = img.data;
    const put = (x: number, y: number, c: number) => {
      if (x < 0 || y < 0 || x >= ART_W || y >= ART_H) return;
      const i = (y * ART_W + x) * 4;
      d[i] = (c >> 16) & 255; d[i + 1] = (c >> 8) & 255; d[i + 2] = c & 255; d[i + 3] = 255;
    };
    const regions = new Map(s.regions().map((r) => [r.code, r]));
    const nW = ART_W / B, nH = ART_H / B;
    const tilesPerBlock = s.widthTiles / nW;
    const codes: string[] = [];
    for (let by = 0; by < nH; by++) for (let bx = 0; bx < nW; bx++) codes.push(s.codeAt(Math.floor((bx + 0.5) * tilesPerBlock), Math.floor((by + 0.5) * tilesPerBlock)));
    const fogOf = (bx: number, by: number): FogState => {
      const tx = (bx + 0.5) * tilesPerBlock, ty = (by + 0.5) * tilesPerBlock;
      if (s.chunkDiscovered(Math.floor(tx / 32), Math.floor(ty / 32))) return 'explored';
      const r = regions.get(codes[by * nW + bx]);
      return r && r.state !== 'hidden' ? 'seen' : 'hidden';
    };

    for (let by = 0; by < nH; by++) for (let bx = 0; bx < nW; bx++) {
      const code = codes[by * nW + bx];
      const x0 = bx * B, y0 = by * B;
      const r = regions.get(code);
      for (let y = 0; y < B; y++) for (let x = 0; x < B; x++) {
        const ax = x0 + x, ay = y0 + y;
        if (!r) put(ax, ay, (ax % 16 >= 2 && ax % 16 < 5 && ay % 8 === 2) || (ax % 16 >= 10 && ax % 16 < 13 && ay % 8 === 6) ? P['frost-700'] : P['deepwater-800']);
        else put(ax, ay, r.color);
      }
      if (!r) continue;
      const right = codes[by * nW + bx + 1], below = codes[(by + 1) * nW + bx];
      if (bx + 1 < nW && right !== code && right !== '~') for (let y = 0; y < B; y++) put(x0 + B - 1, y0 + y, P['parch-900']);
      if (by + 1 < nH && below !== code && below !== '~') for (let x = 0; x < B; x++) put(x0 + x, y0 + B - 1, P['parch-900']);
      const h = hash(bx + 99, by + 7);
      if ('IFO'.includes(code) && h < (code === 'O' ? 0.08 : 0.16)) {
        for (const [px, py, w] of [[x0 - 2, y0 + 2, 7], [x0 - 1, y0 + 1, 5], [x0, y0, 3]] as const) for (let k = 0; k < w; k++) put(px + k, py, P['stone-700']);
        put(x0, y0 - 1, P['parch-300']); put(x0 + 1, y0 - 1, P['parch-300']);
      }
      if ('YWA'.includes(code) && h < (code === 'Y' ? 0.3 : 0.08)) {
        put(x0 + 2, y0, P['ink-900']); put(x0 + 1, y0 + 1, P['ink-900']); put(x0 + 2, y0 + 1, P['ink-900']); put(x0 + 3, y0 + 1, P['ink-900']);
        for (let k = 0; k < 5; k++) put(x0 + k, y0 + 2, P['ink-900']);
      }
      if ((code === 'U' || code === 'C') && h < 0.14) for (let k = 0; k < 4; k++) put(x0 + k, y0 + 2, P['leather-500']);
      if (code === 'G' && h < 0.2) { put(x0 + 1, y0 + 1, P['deepwater-800']); put(x0 + 2, y0 + 1, P['deepwater-800']); }
      if (code === 'M' && h < 0.2) put(x0 + 1, y0 + 2, P['shadow-300']);
    }
    // Roads and rivers, under the fog.
    for (const rt of s.routes()) {
      const c = rt.kind === 'river' || rt.kind === 'stream' ? P['frost-700'] : rt.kind === 'ley' ? -1 : P['parch-800'];
      if (c < 0) continue;
      for (let i = 0; i < rt.points.length - 1; i++) {
        const [ax, ay] = this.artOf(...rt.points[i]);
        const [bx, by] = this.artOf(...rt.points[i + 1]);
        const n = Math.ceil(Math.max(Math.abs(bx - ax), Math.abs(by - ay)));
        for (let k = 0; k <= n; k++) put(Math.round(ax + ((bx - ax) * k) / n), Math.round(ay + ((by - ay) * k) / n), c);
      }
    }
    // Fog: seen = ink checker; hidden = ink with dusk checker and rare marks. Dither only, never alpha.
    for (let by = 0; by < nH; by++) for (let bx = 0; bx < nW; bx++) {
      const f = fogOf(bx, by);
      if (f === 'explored') continue;
      const x0 = bx * B, y0 = by * B;
      for (let y = 0; y < B; y++) for (let x = 0; x < B; x++) {
        const ax = x0 + x, ay = y0 + y, on = (ax + ay) % 2 === 0;
        if (f === 'seen') { if (on) put(ax, ay, P['ink-900']); }
        else put(ax, ay, on ? P['dusk-700'] : P['ink-900']);
      }
      if (f === 'hidden' && hash(bx + 99, by + 7) > 0.97) for (let k = 0; k < 3; k++) put(x0 + k, y0 + 1, P['parch-900']);
    }
    ctx.putImageData(img, 0, 0);
    this.tex.refresh();
  }

  private redraw(): void {
    this.acc = 0;
    this.paintArt();
    this.dynamic.forEach((o) => o.destroy());
    this.dynamic = [];
    const s = this.scene;
    const toScreen = (tx: number, ty: number): [number, number] => {
      const [ax, ay] = this.artOf(tx, ty);
      return [MAP_X + ax * SCALE, MAP_Y + ay * SCALE];
    };

    // Region labels with tier skulls.
    const g = this.pinsG.clear();
    for (const r of this.src.regions()) {
      const [x, y] = toScreen(r.at[0], r.at[1]);
      const color = r.state === 'explored' ? P['gold-200'] : r.state === 'seen' ? P['parch-700'] : P['stone-700'];
      this.dynamic.push(s.add.text(x, y, r.state === 'hidden' ? '???' : r.name, outlinedStyle('titleS', hex(color))).setOrigin(0.5));
      if (r.state !== 'hidden') for (let i = 0; i < r.tier; i++) drawGlyph(g, 'skull', x - (r.tier * 14) / 2 + i * 14, y + 14, 1.5, tierColors[r.tier - 1]);
    }
    // Pins.
    const glyphFor: Record<WorldMapPin['kind'], [GlyphName, number]> = {
      waystone: ['obelisk', 2], unknown: ['unknown', 2], player: ['player', 2], quest: ['quest', 2], town: ['town', 2], dungeon: ['dungeon', 2], boss: ['boss', 2],
    };
    for (const p of this.src.pins()) {
      if ((p.kind === 'waystone' && !this.show.waystone) || (p.kind === 'quest' && !this.show.quest) || ((p.kind === 'dungeon' || p.kind === 'boss') && !this.show.dungeon)) continue;
      const [glyph, sc] = glyphFor[p.kind];
      const size = (glyph === 'obelisk' || glyph === 'unknown' || glyph === 'player' ? 12 : 8) * sc;
      const [x, y] = toScreen(p.tx, p.ty);
      drawGlyph(g, glyph, x - size / 2, y - size / 2, sc);
    }
    // Waystones: obelisks when attuned (clickable for fast travel), "unfound" glyphs when only their ground is explored.
    if (this.show.waystone) {
      for (const w of this.src.waystones()) {
        const [x, y] = toScreen(w.tx, w.ty);
        if (!w.unlocked) {
          if (this.src.chunkDiscovered(Math.floor(w.tx / 32), Math.floor(w.ty / 32))) drawGlyph(g, 'unknown', x - 12, y - 12, 2);
          continue;
        }
        drawGlyph(g, 'obelisk', x - 12, y - 18, 2);
        if (w.id === this.selected) g.lineStyle(2, P['gold-200'], 1).strokeRect(x - 14, y - 20, 28, 28);
        const hit = s.add.zone(x - 14, y - 20, 28, 28).setOrigin(0).setInteractive({ useHandCursor: true });
        hit.on('pointerdown', () => { this.selected = w.id; this.redraw(); });
        this.dynamic.push(hit);
      }
    }
    this.root.bringToTop(this.pinsG);
    this.drawTravelCard();

    // Current-region card (board: region hover card).
    const c = this.cardG.clear();
    const cur = this.src.current();
    if (!cur) { this.root.add(this.dynamic); return; }
    const cx = 884, cy = 540, cw = 352, ch = 136;
    c.fillStyle(P['ink-900'], 1).fillRect(cx - 2, cy - 2, cw + 4, ch + 4).fillRect(cx + 6, cy + 6, cw, ch);
    c.fillStyle(P['stone-600'], 1).fillRect(cx, cy, cw, ch).fillStyle(P['stone-900'], 1).fillRect(cx + 2, cy + 2, cw - 4, ch - 4)
      .fillStyle(P['ink-800'], 1).fillRect(cx + 4, cy + 4, cw - 8, ch - 8);
    for (let i = 0; i < cur.tier; i++) drawGlyph(c, 'skull', cx + cw - 20 - i * 14, cy + 14, 1.5, tierColors[cur.tier - 1]);
    const pct = Math.round(cur.explored * 100);
    c.fillStyle(P['ink-900'], 1).fillRect(cx + 12, cy + 78, cw - 24, 12).fillStyle(P['stone-900'], 1).fillRect(cx + 14, cy + 80, cw - 28, 8)
      .fillStyle(P['gold-500'], 1).fillRect(cx + 14, cy + 80, Math.round((cw - 28) * cur.explored), 8);
    this.dynamic.push(
      pxText(s, cx + 14, cy + 22, cur.name, 'titleS').setOrigin(0, 0.5),
      pxText(s, cx + 14, cy + 58, 'Explored', 'bodyS', hex(P['parch-700'])).setOrigin(0, 0.5),
      pxText(s, cx + cw - 14, cy + 58, `${pct}%`, 'bodyS').setOrigin(1, 0.5),
      pxText(s, cx + 14, cy + 110, 'Notable places found', 'bodyS', hex(P['parch-700'])).setOrigin(0, 0.5),
      pxText(s, cx + cw - 14, cy + 110, `${cur.found[0]} / ${cur.found[1]}`, 'bodyS').setOrigin(1, 0.5),
    );
    this.root.add(this.dynamic);
  }

  destroy(): void {
    this.root.destroy();
  }
}
