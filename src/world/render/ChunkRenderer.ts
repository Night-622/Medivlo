/**
 * Shows the chunks of one space around the camera: a ground tilemap layer per chunk (drawn +16,+16 for the
 * half-tile corner autotiles), placement sprites y-sorted in the Actors band, and their lights.
 * Chunk data comes from the shared SpaceRuntime; this file is the only Phaser side of a space.
 */
import Phaser from 'phaser';
import type { ChunkFeed } from './ChunkFeed';
import { CHUNK_TILES, Depth, TILE_SIZE, bus } from '@/core';
import type { SpaceRuntime } from '../hc/runtime';
import type { HcChunk } from '../hc/space';
import { artCanvas, artLights, artTexture } from './artCache';
import type { Lighting } from './Lighting';

const N = CHUNK_TILES;
const CHUNK_PX = N * TILE_SIZE;
const ATLAS_COLS = 32;
/** flat decor drawn under actors */
const FLAT = new Set(['v_flowerbed', 'f_fern', 'd_bones', 'f_lily']);

interface View {
  chunk: HcChunk;
  map: Phaser.Tilemaps.Tilemap;
  sprites: Phaser.GameObjects.Image[];
  glows: ReturnType<Lighting['addFor']>;
}

/** Bake every frame of the space's tile registry into one tileset texture (index = registry id). */
function tileAtlas(scene: Phaser.Scene, rt: SpaceRuntime): string {
  const key = `hc-tiles:${rt.id}`;
  if (scene.textures.exists(key)) return key;
  const names = rt.gen.registry.names;
  const c = document.createElement('canvas');
  c.width = ATLAS_COLS * TILE_SIZE;
  c.height = Math.ceil(names.length / ATLAS_COLS) * TILE_SIZE;
  const g = c.getContext('2d')!;
  names.forEach((name, i) => {
    if (i === 0) return;
    try {
      g.drawImage(artCanvas(scene, name), (i % ATLAS_COLS) * TILE_SIZE, Math.floor(i / ATLAS_COLS) * TILE_SIZE);
    } catch (e) {
      console.warn(`[world] tile frame ${name} missing`, e);
      g.fillStyle = '#ff00ff';
      g.fillRect((i % ATLAS_COLS) * TILE_SIZE, Math.floor(i / ATLAS_COLS) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  });
  scene.textures.addCanvas(key, c);
  return key;
}

const READY_PER_FRAME = 2;
const WAIT_MS = 700;
const PREFETCH = 2;

export class ChunkRenderer {
  private live = new Map<string, View>();
  private tileset: string;
  /** chunks built here per frame when the worker can't help (each costs a few ms, up to ~150 ms cold) */
  budget = 1;
  /** chunk worker (client): builds ahead of the camera off the main thread; null = build here */
  feed: ChunkFeed | null = null;
  /** dev stats: chunks built on the main thread (first frame, no worker, or the worker too slow) */
  syncBuilds = 0;
  /** dev stats: main-thread ms per chunk shown, split (hitch hunt: RELEASE.md §3) */
  perf = { shows: 0, max: 0, tiles: 0, sprites: 0, lights: 0, slow: [] as string[] };
  onShow?: (c: HcChunk) => void;
  onHide?: (c: HcChunk) => void;
  /** chests this character has opened (object tile = the tile below the chest art): drawn dimmed and lidless */
  openedAt?: (tx: number, ty: number) => boolean;

  constructor(private scene: Phaser.Scene, readonly rt: SpaceRuntime, private light: Lighting) {
    this.tileset = tileAtlas(scene, rt);
  }

  views(): HcChunk[] { return [...this.live.values()].map((v) => v.chunk); }

  /** Show chunks overlapping the camera view (plus a 1-chunk margin), nearest first; hide far ones. */
  update(force = false): void {
    const v = this.scene.cameras.main.worldView;
    const x0 = Math.floor((v.x - CHUNK_PX / 2) / CHUNK_PX), x1 = Math.floor((v.right + CHUNK_PX / 2) / CHUNK_PX);
    const y0 = Math.floor((v.y - CHUNK_PX / 2) / CHUNK_PX), y1 = Math.floor((v.bottom + CHUNK_PX / 2) / CHUNK_PX);
    const ccx = v.centerX / CHUNK_PX, ccy = v.centerY / CHUNK_PX;
    const want: [number, number, number][] = [];
    for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
      if (this.rt.inBounds(cx, cy) && !this.live.has(`${cx},${cy}`)) want.push([cx, cy, (cx + 0.5 - ccx) ** 2 + (cy + 0.5 - ccy) ** 2]);
    }
    want.sort((a, b) => a[2] - b[2]);
    // ready chunks (cached or delivered by the worker) are cheap to show; missing ones go to the worker, and are
    // built here only on the first frame, without a worker, or after waiting too long
    let builds = force ? Infinity : this.budget, shows = force ? Infinity : READY_PER_FRAME;
    const feed = this.feed?.live ? this.feed : null;
    for (const [cx, cy, d] of want) {
      if (this.rt.chunk(cx, cy, false)) { if (shows-- > 0) this.show(cx, cy); continue; }
      if (!feed || force || (feed.waiting(this.rt, cx, cy) ?? 0) > WAIT_MS) { if (builds-- > 0) { this.syncBuilds++; this.show(cx, cy); } continue; }
      feed.request(this.rt, cx, cy, d);
    }
    // prefetch a ring beyond the view so walking never waits on generation
    if (feed) {
      for (let cy = y0 - PREFETCH; cy <= y1 + PREFETCH; cy++) for (let cx = x0 - PREFETCH; cx <= x1 + PREFETCH; cx++) {
        if (this.rt.inBounds(cx, cy) && !this.live.has(`${cx},${cy}`)) feed.request(this.rt, cx, cy, 100 + (cx + 0.5 - ccx) ** 2 + (cy + 0.5 - ccy) ** 2);
      }
    }
    for (const [k, view] of this.live) {
      const { cx, cy } = view.chunk;
      if (cx < x0 - 1 || cx > x1 + 1 || cy < y0 - 1 || cy > y1 + 1) this.hide(k);
    }
  }

  private show(cx: number, cy: number): void {
    const t0 = performance.now();
    const c = this.rt.chunk(cx, cy)!;
    const map = this.scene.make.tilemap({ tileWidth: TILE_SIZE, tileHeight: TILE_SIZE, width: N, height: N });
    const ts = map.addTilesetImage(this.tileset, this.tileset, TILE_SIZE, TILE_SIZE, 0, 0)!;
    const layer = map.createBlankLayer('ground', ts, cx * CHUNK_PX + TILE_SIZE / 2, cy * CHUNK_PX + TILE_SIZE / 2, N, N)!;
    for (let i = 0; i < c.ground.length; i++) if (c.ground[i]) layer.putTileAt(c.ground[i], i % N, (i / N) | 0, false);
    layer.setDepth(Depth.Ground).setCullPadding(1, 1);
    const t1 = performance.now();
    let tl = 0;
    const sprites: Phaser.GameObjects.Image[] = [];
    const glows: View['glows'] = [];
    for (const p of c.placements) {
      try {
        const t = artTexture(this.scene, p.art);
        const base = p.art.slice(p.art.lastIndexOf(':') + 1);
        const depth = FLAT.has(base) ? Depth.GroundDecor : Depth.Actors + p.y - 4;
        const img = this.scene.add.image(Math.round(p.x), Math.round(p.y), t.key, t.frame).setOrigin(0.5, 1).setDepth(depth);
        if (base.startsWith('d_chest') && this.openedAt?.(Math.floor(p.x / TILE_SIZE), Math.floor((p.y - 1) / TILE_SIZE) + 1)) img.setTint(0x6a6a6a).setAlpha(0.8);
        sprites.push(img);
        const lights = artLights(p.art);
        const l0 = performance.now();
        if (lights.length) glows.push(...this.light.addFor(p.art, p.x, p.y, t.w, t.h, lights));
        tl += performance.now() - l0;
      } catch (e) {
        console.warn(`[world] placement ${p.art} failed`, e);
      }
    }
    this.live.set(`${cx},${cy}`, { chunk: c, map, sprites, glows });
    const t2 = performance.now();
    this.onShow?.(c);
    const ms = performance.now() - t0, P = this.perf;
    P.shows++; P.tiles += t1 - t0; P.sprites += t2 - t1 - tl; P.lights += tl; P.max = Math.max(P.max, ms);
    if (ms > 12 && P.slow.length < 40) P.slow.push(`${cx},${cy} ${ms.toFixed(1)}ms (tiles ${(t1 - t0).toFixed(1)}, sprites ${(t2 - t1 - tl).toFixed(1)} ×${sprites.length}, lights ${tl.toFixed(1)}, onShow ${(performance.now() - t2).toFixed(1)})`);
    bus.emit('chunk:loaded', { cx, cy });
  }

  private hide(k: string): void {
    const v = this.live.get(k);
    if (!v) return;
    v.map.destroy();
    for (const s of v.sprites) s.destroy();
    this.light.remove(v.glows);
    this.live.delete(k);
    this.onHide?.(v.chunk);
    bus.emit('chunk:unloaded', { cx: v.chunk.cx, cy: v.chunk.cy });
  }

  /** Redraw the chunk holding a tile (a chest just opened). */
  redraw(tx: number, ty: number): void {
    const cx = Math.floor(tx / N), cy = Math.floor(ty / N), k = `${cx},${cy}`;
    if (!this.live.has(k)) return;
    this.hide(k);
    this.show(cx, cy);
  }

  destroy(): void {
    for (const k of [...this.live.keys()]) this.hide(k);
  }
}
