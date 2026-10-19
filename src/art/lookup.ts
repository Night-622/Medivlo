/**
 * Look up any handoff art by its atlas frame name (e.g. "v_grass_0", "v_path_7", "b_inn", "v_well", "w_sword_ember").
 * Textures are loaded in BootScene; keys follow "<group>:<atlasKey>".
 */
import type { Atlas, AtlasImage, AtlasSheet } from './textures';

export interface ArtFrame {
  /** Phaser texture key */
  key: string;
  /** frame index for spritesheets; undefined for single images */
  frame?: number;
  w: number;
  h: number;
}

export interface ArtMeta {
  group: string;
  /** light points [dx, dy, radius] relative to the sprite's top-left (buildings/props) */
  lights?: [number, number, number][];
  category?: string;
  label?: string;
  origin?: [number, number];
}

const frames = new Map<string, ArtFrame>();
const metas = new Map<string, ArtMeta>();

const SHEET_GROUPS = ['tilesV2', 'sheets', 'gear', 'characters', 'heroes', 'npcs', 'bestiary'];
const IMAGE_GROUPS = ['buildings', 'propsV2', 'props', 'ui'];

/** Build the lookup tables once from atlas.json (BootScene does this). */
export function indexAtlas(atlas: Atlas): void {
  frames.clear(); metas.clear();
  for (const g of SHEET_GROUPS) {
    for (const [k, raw] of Object.entries(atlas[g] ?? {})) {
      const s = raw as AtlasSheet;
      if (!s.file || !s.frameWidth) continue;
      const key = `${g}:${k}`;
      if (Array.isArray(s.frames)) s.frames.forEach((name, i) => { if (!frames.has(name)) frames.set(name, { key, frame: i, w: s.frameWidth, h: s.frameHeight }); });
      if (!frames.has(k)) frames.set(k, { key, frame: 0, w: s.frameWidth, h: s.frameHeight });
      metas.set(k, { group: g });
    }
  }
  for (const g of IMAGE_GROUPS) {
    for (const [k, raw] of Object.entries(atlas[g] ?? {})) {
      const s = raw as AtlasImage & { size?: number };
      if (!s.file) continue;
      const name = s.file.split('/').pop()!.replace(/\.png$/, '');
      const f: ArtFrame = { key: `${g}:${k}`, w: s.w ?? s.size ?? 0, h: s.h ?? s.size ?? 0 };
      const m: ArtMeta = { group: g, lights: s.lights, category: s.category, label: s.label, origin: s.origin };
      for (const n of new Set([k, name])) { if (!frames.has(n)) frames.set(n, f); metas.set(n, m); }
    }
  }
}

export const Art = {
  /** Texture key + frame for an atlas frame name. Throws if unknown (catches typos early). */
  frame(name: string): ArtFrame {
    const f = frames.get(name);
    if (!f) throw new Error(`[art] unknown frame "${name}"`);
    return f;
  },
  tryFrame(name: string): ArtFrame | undefined { return frames.get(name); },
  meta(name: string): ArtMeta | undefined { return metas.get(name); },
  /** All known frame names (debug / audits). */
  names(): string[] { return [...frames.keys()]; },
};
