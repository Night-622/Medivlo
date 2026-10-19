/** Static world model: layout, regions, routes, overlays, instances, indexed for fast chunk lookups. Pure. */
import { CHUNK_TILES, Registry, WORLD_CHUNKS_H, WORLD_CHUNKS_W, WORLD_SEED, type BiomeId, type RegionDef } from '@/core';
import { Simplex2 } from './noise';
import { activeObjects, referencedFlags } from './overlays';
import type { InstanceDef, OverlayDef, RouteDef, WorldLayoutDef } from './types';

export const WORLD_TILES_W = WORLD_CHUNKS_W * CHUNK_TILES;
export const WORLD_TILES_H = WORLD_CHUNKS_H * CHUNK_TILES;
export const SEA = '~';

export interface ChunkIndex { overlays: OverlayDef[]; routes: RouteDef[] }

export class WorldModel {
  readonly layout: WorldLayoutDef;
  readonly regions = new Map<string, RegionDef>();
  readonly regionByCode = new Map<string, RegionDef>();
  readonly routes: RouteDef[];
  readonly overlays = new Map<string, OverlayDef>();
  readonly instances = new Map<string, InstanceDef>();
  /** Flags whose change can alter terrain/objects/spawns. */
  readonly watchedFlags = new Set<string>();
  readonly elev = new Simplex2(WORLD_SEED);
  readonly moist = new Simplex2(WORLD_SEED ^ 0x51ed);
  readonly detail = new Simplex2(WORLD_SEED ^ 0x7a11);
  readonly frost = new Simplex2(WORLD_SEED ^ 0x0f05);
  readonly warp = new Simplex2(WORLD_SEED ^ 0x3a9e);
  private index = new Map<string, ChunkIndex>();

  constructor() {
    const layout = Registry.extra<WorldLayoutDef>('layout', 'layout:morvane');
    if (!layout) throw new Error('[world] layout:morvane missing from src/data/regions');
    this.layout = layout;
    for (const r of Registry.all('region')) {
      this.regions.set(r.id, r);
      if (r.layoutCode) this.regionByCode.set(r.layoutCode, r);
    }
    this.routes = Registry.extraAll<RouteDef>('route');
    for (const o of Registry.extraAll<OverlayDef>('overlay')) this.overlays.set(o.id, o);
    for (const i of Registry.extraAll<InstanceDef>('instance')) this.instances.set(i.id, i);
    // An overlay id used both by a region and an instance floor means one silently replaced the other.
    const regionOverlays = new Set([...this.regions.values()].flatMap((r) => r.overlays));
    for (const i of this.instances.values()) for (const f of i.floors) {
      if (regionOverlays.has(f.overlay)) console.error(`[world] overlay id clash: ${f.overlay} is used by a region and by ${i.id}`);
    }

    const overworldOverlays = new Set<string>();
    for (const r of this.regions.values()) r.overlays.forEach((id) => overworldOverlays.add(id));
    for (const id of overworldOverlays) {
      const o = this.overlays.get(id);
      if (!o) { console.warn(`[world] region references missing ${id}`); continue; }
      this.addToIndex(o.origin[0], o.origin[1], o.size[0], o.size[1], (ix) => ix.overlays.push(o));
    }
    for (const rt of this.routes) {
      const pad = Math.ceil(rt.width / 2) + 1;
      for (let i = 0; i < rt.points.length - 1; i++) {
        const [ax, ay] = rt.points[i];
        const [bx, by] = rt.points[i + 1];
        const x0 = Math.min(ax, bx) - pad, y0 = Math.min(ay, by) - pad;
        this.addToIndex(x0, y0, Math.abs(bx - ax) + pad * 2, Math.abs(by - ay) + pad * 2, (ix) => {
          if (!ix.routes.includes(rt)) ix.routes.push(rt);
        });
      }
    }
    for (const o of this.overlays.values()) referencedFlags(o, this.watchedFlags);
    for (const r of this.regions.values()) {
      for (const z of r.spawnZones) collectFlags(z.when, this.watchedFlags);
    }
    for (const rt of this.routes) collectFlags(rt.when, this.watchedFlags);
    for (const r of this.regions.values()) collectFlags(r.gate, this.watchedFlags);
    this.watchedFlags.add('world.mire_level');
  }

  private addToIndex(x: number, y: number, w: number, h: number, add: (ix: ChunkIndex) => void): void {
    const cx0 = Math.max(0, Math.floor(x / CHUNK_TILES)), cy0 = Math.max(0, Math.floor(y / CHUNK_TILES));
    const cx1 = Math.min(WORLD_CHUNKS_W - 1, Math.floor((x + w - 1) / CHUNK_TILES));
    const cy1 = Math.min(WORLD_CHUNKS_H - 1, Math.floor((y + h - 1) / CHUNK_TILES));
    for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) {
      const k = `${cx},${cy}`;
      let ix = this.index.get(k);
      if (!ix) this.index.set(k, (ix = { overlays: [], routes: [] }));
      add(ix);
    }
  }

  chunkIndex(cx: number, cy: number): ChunkIndex {
    return this.index.get(`${cx},${cy}`) ?? { overlays: [], routes: [] };
  }

  /** Region code at chunk resolution (no warp). */
  codeAtChunk(cx: number, cy: number): string {
    const n = this.layout.cellChunks;
    if (cx < 0 || cy < 0 || cx >= WORLD_CHUNKS_W || cy >= WORLD_CHUNKS_H) return SEA;
    const row = this.layout.cells[Math.floor(cy / n)] ?? '';
    return row[Math.floor(cx / n)] ?? SEA;
  }

  /** Region code at a tile, with noise-warped borders (~8 tiles). */
  codeAt(tx: number, ty: number): string {
    const wx = this.warp.noise(tx / 48, ty / 48) * 10;
    const wy = this.warp.noise(ty / 48 + 91.7, tx / 48 - 13.3) * 10;
    return this.codeAtChunk(Math.floor((tx + wx) / CHUNK_TILES), Math.floor((ty + wy) / CHUNK_TILES));
  }

  regionAt(tx: number, ty: number): RegionDef | undefined {
    return this.regionByCode.get(this.codeAt(tx, ty));
  }

  /** Region for a chunk = its unwarped layout cell. */
  /** Every overworld waystone currently present (flag-filtered), in absolute world tiles. */
  waystones(): { id: string; name: string; at: [number, number]; region: RegionDef | undefined }[] {
    const out: { id: string; name: string; at: [number, number]; region: RegionDef | undefined }[] = [];
    for (const r of this.regions.values()) for (const oid of r.overlays) {
      const o = this.overlays.get(oid);
      if (!o) continue;
      for (const w of activeObjects(o)) {
        if (w.kind !== 'waystone') continue;
        out.push({ id: w.id, name: String(w.props?.name ?? 'Waystone'), at: w.at, region: r });
      }
    }
    return out;
  }

  regionOfChunk(cx: number, cy: number): RegionDef | undefined {
    return this.regionByCode.get(this.codeAtChunk(cx, cy));
  }

  biomeAt(tx: number, ty: number): BiomeId {
    const r = this.regionAt(tx, ty);
    return r ? this.biomeFor(r, tx, ty) : 'coast';
  }

  biomeFor(r: RegionDef, tx: number, ty: number): BiomeId {
    if (!r.subBiomes?.length) return r.biome;
    const s = this.detail.fbm(tx + 5000, ty - 3000, 2, 140);
    const total = r.subBiomes.reduce((a, b) => a + b.weight, 0);
    let acc = 0;
    for (const sb of r.subBiomes) { acc += sb.weight / total; if (s < acc) return sb.biome; }
    return r.subBiomes[r.subBiomes.length - 1].biome;
  }
}

function collectFlags(c: unknown, into: Set<string>): void {
  if (!c || typeof c !== 'object') return;
  const o = c as Record<string, unknown>;
  if (typeof o.flag === 'string') into.add(o.flag);
  for (const k of ['all', 'any']) if (Array.isArray(o[k])) (o[k] as unknown[]).forEach((x) => collectFlags(x, into));
  if (o.not) collectFlags(o.not, into);
}
