/** Chunk streaming (WORLD.md §3.6): builds ChunkData via a provider, renders one Tilemap per chunk, LRU cache. */
import Phaser from 'phaser';
import { CHUNK_LOAD_RADIUS, CHUNK_PX, CHUNK_TILES, Depth, TILE_SIZE, bus } from '@/core';
import type { ChunkProvider } from './chunkGen';
import { OUT_OF_BOUNDS } from './chunkGen';
import { ensureTileset, TILESET_KEY } from './tileset';
import { LAYERS, type ChunkData, type LayerName } from './types';

const N = CHUNK_TILES;
const CACHE_MAX = 64;
const LAYER_DEPTH: Record<LayerName, number> = {
  ground: Depth.Ground, detail: Depth.Ground + 1, deco: Depth.GroundDecor, overhead: Depth.Overhead,
};

interface Live { map: Phaser.Tilemaps.Tilemap; layers: Record<LayerName, Phaser.Tilemaps.TilemapLayer> }

export class ChunkManager {
  private cache = new Map<string, ChunkData>();
  private live = new Map<string, Live>();
  private queue: string[] = [];
  private center = { cx: -999, cy: -999 };
  private faded: Phaser.Tilemaps.Tile[] = [];
  private forceSync = false;
  onShow?: (c: ChunkData) => void;
  onHide?: (c: ChunkData) => void;

  constructor(private scene: Phaser.Scene, readonly provider: ChunkProvider, private radius = CHUNK_LOAD_RADIUS) {
    ensureTileset(scene);
  }

  private inBounds(cx: number, cy: number): boolean {
    return cx >= 0 && cy >= 0 && cx < this.provider.widthChunks && cy < this.provider.heightChunks;
  }

  /** Cached or freshly built data (does not render). */
  data(cx: number, cy: number, build = true): ChunkData | undefined {
    if (!this.inBounds(cx, cy)) return undefined;
    const k = `${cx},${cy}`;
    let c = this.cache.get(k);
    if (c) { this.cache.delete(k); this.cache.set(k, c); return c; }
    if (!build) return undefined;
    c = this.provider.build(cx, cy);
    this.cache.set(k, c);
    this.trimCache();
    return c;
  }

  private trimCache(): void {
    for (const k of this.cache.keys()) {
      if (this.cache.size <= CACHE_MAX) break;
      if (!this.live.has(k)) this.cache.delete(k);
    }
  }

  /** Collision bits at a tile; null if its chunk isn't built. */
  collisionAt(tx: number, ty: number): number | null {
    const cx = Math.floor(tx / N), cy = Math.floor(ty / N);
    if (!this.inBounds(cx, cy)) return OUT_OF_BOUNDS;
    const c = this.cache.get(`${cx},${cy}`);
    if (!c) return null;
    return c.collision[(ty - cy * N) * N + (tx - cx * N)];
  }

  isLive(cx: number, cy: number): boolean { return this.live.has(`${cx},${cy}`); }

  liveChunks(): ChunkData[] {
    return [...this.live.keys()].map((k) => this.cache.get(k)).filter((c): c is ChunkData => !!c);
  }

  /** Call every frame with the player's tile. `sync` loads everything immediately (first frame, teleports). */
  update(tx: number, ty: number, sync = false): void {
    const cx = Math.floor(tx / N), cy = Math.floor(ty / N);
    if (cx !== this.center.cx || cy !== this.center.cy) {
      this.center = { cx, cy };
      this.refreshQueue();
    }
    let budget = sync || this.forceSync ? Infinity : 1;
    this.forceSync = false;
    while (budget-- > 0 && this.queue.length) {
      const k = this.queue.shift()!;
      const [qx, qy] = k.split(',').map(Number);
      if (Math.max(Math.abs(qx - cx), Math.abs(qy - cy)) <= this.radius) this.show(qx, qy);
    }
    this.fadeOverhead(tx, ty);
  }

  private refreshQueue(): void {
    const { cx, cy } = this.center;
    const want: [number, number, number][] = [];
    for (let dy = -this.radius; dy <= this.radius; dy++) for (let dx = -this.radius; dx <= this.radius; dx++) {
      const x = cx + dx, y = cy + dy;
      if (this.inBounds(x, y) && !this.live.has(`${x},${y}`)) want.push([x, y, dx * dx + dy * dy]);
    }
    want.sort((a, b) => a[2] - b[2]);
    this.queue = want.map(([x, y]) => `${x},${y}`);
    // Unload with hysteresis (radius + 1).
    for (const k of [...this.live.keys()]) {
      const [x, y] = k.split(',').map(Number);
      if (Math.max(Math.abs(x - cx), Math.abs(y - cy)) > this.radius + 1) this.hide(k);
    }
  }

  private show(cx: number, cy: number): void {
    const k = `${cx},${cy}`;
    if (this.live.has(k)) return;
    const c = this.data(cx, cy)!;
    const map = this.scene.make.tilemap({ tileWidth: TILE_SIZE, tileHeight: TILE_SIZE, width: N, height: N });
    const ts = map.addTilesetImage(TILESET_KEY, TILESET_KEY, TILE_SIZE, TILE_SIZE, 0, 0);
    if (!ts) throw new Error('tileset missing');
    const layers = {} as Record<LayerName, Phaser.Tilemaps.TilemapLayer>;
    for (const name of LAYERS) {
      const layer = map.createBlankLayer(name, ts, cx * CHUNK_PX, cy * CHUNK_PX, N, N);
      if (!layer) throw new Error('layer create failed');
      const src = c[name];
      for (let i = 0; i < src.length; i++) if (src[i] >= 0) layer.putTileAt(src[i], i % N, (i / N) | 0, false);
      layer.setDepth(LAYER_DEPTH[name]);
      layer.setCullPadding(1, 1);
      layers[name] = layer;
    }
    this.live.set(k, { map, layers });
    this.onShow?.(c);
    bus.emit('chunk:loaded', { cx, cy });
  }

  private hide(k: string): void {
    const l = this.live.get(k);
    if (!l) return;
    this.faded = this.faded.filter((t) => t.tilemap !== l.map);
    l.map.destroy();
    this.live.delete(k);
    const c = this.cache.get(k);
    if (c) this.onHide?.(c);
    const [cx, cy] = k.split(',').map(Number);
    bus.emit('chunk:unloaded', { cx, cy });
    this.trimCache();
  }

  /** Overhead tiles near the player fade so they can see themselves under canopies and arches. */
  private fadeOverhead(tx: number, ty: number): void {
    for (const t of this.faded) t.setAlpha(1);
    this.faded = [];
    for (let dy = -3; dy <= 1; dy++) for (let dx = -2; dx <= 2; dx++) {
      const x = tx + dx, y = ty + dy;
      const l = this.live.get(`${Math.floor(x / N)},${Math.floor(y / N)}`);
      const t = l?.layers.overhead.getTileAt(x - Math.floor(x / N) * N, y - Math.floor(y / N) * N);
      if (t) { t.setAlpha(0.35); this.faded.push(t); }
    }
  }

  /** Drop every cached chunk and rebuild the live ones (after a relevant flag change). */
  invalidate(): void {
    const keys = [...this.live.keys()];
    for (const k of keys) this.hide(k);
    this.cache.clear();
    this.center = { cx: -999, cy: -999 };
    this.forceSync = true;
  }

  destroy(): void {
    for (const k of [...this.live.keys()]) this.hide(k);
    this.cache.clear();
  }
}
