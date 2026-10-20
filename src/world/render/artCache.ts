/**
 * Turns hc art names into Phaser textures (docs/world/HOLLOW-CROWN-WORLD.md §6):
 *   base frame        "b_inn", "v_grass_0"        → Art.frame (atlas loaded in BootScene)
 *   recoloured frame  "rc:<school>:<base>"         → baked once with the realm's HSL rules
 *   realm landmark    "lm:<arch>:<school|concordia>" → MV image rl_<realm>
 */
import type Phaser from 'phaser';
import { Art, mvImage } from '@/art';
import { realmOf } from '../hc/spaces';
import { recolorPixels, rulesOf } from '../hc/recolor';
import { LANDMARK_SIZES, baseArt } from '../hc/footprints';
import type { LandmarkArch } from '../hc/types';

export interface ArtTex { key: string; frame?: string | number; w: number; h: number }

/** dev stats: recoloured / landmark textures baked on first use, and the ms they took (hitch hunt) */
export const bakeStats = { n: 0, ms: 0, max: 0, slow: [] as string[] };
const timed = <T>(name: string, f: () => T): T => {
  const t0 = performance.now();
  const r = f();
  const ms = performance.now() - t0;
  bakeStats.n++; bakeStats.ms += ms; bakeStats.max = Math.max(bakeStats.max, ms);
  if (ms > 4 && bakeStats.slow.length < 40) bakeStats.slow.push(`${name} ${ms.toFixed(1)}ms`);
  return r;
};

/** Light point [dx, dy, r, colour] from the image's top-left. */
export type Light = [number, number, number, number];

const DEFAULT_LIGHT = 0xffd36a;
const LAMP_HEADS: Record<string, [number, number, number]> = { v_lamp: [8, 9, 90], d_candelabra: [10, 6, 60], d_sconce: [8, 8, 60] };

function mvRealm(id: string): string { return id === 'concordia' ? 'concord' : id; }

/** Copy one frame of a loaded texture into a canvas. */
function frameCanvas(scene: Phaser.Scene, key: string, frame?: string | number): HTMLCanvasElement {
  const f = scene.textures.getFrame(key, frame);
  const c = document.createElement('canvas');
  c.width = f.cutWidth; c.height = f.cutHeight;
  c.getContext('2d')!.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight, 0, 0, f.cutWidth, f.cutHeight);
  return c;
}

/** Recolour a canvas in place with a realm's rules. */
function recolorCanvas(c: HTMLCanvasElement, school: string): void {
  const realm = realmOf(`realm:${school}`);
  const rules = realm && rulesOf(realm);
  if (!rules) return;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  const img = ctx.getImageData(0, 0, c.width, c.height);
  recolorPixels(img.data, rules);
  ctx.putImageData(img, 0, 0);
}

/** Canvas of any hc art name (used by the tile atlas). */
export function artCanvas(scene: Phaser.Scene, name: string): HTMLCanvasElement {
  const base = baseArt(name);
  const f = Art.frame(base);
  const c = frameCanvas(scene, f.key, f.frame);
  if (name.startsWith('rc:')) recolorCanvas(c, name.split(':')[1]);
  return c;
}

/** Texture for a placeable art name, baking recolours and landmarks on first use. */
export function artTexture(scene: Phaser.Scene, name: string): ArtTex {
  if (name.startsWith('lm:')) {
    const [, arch, realm] = name.split(':');
    const key = scene.textures.exists(`hc-${name}`) ? `hc-${name}` : timed(name, () => mvImage(scene, `hc-${name}`, `rl_${mvRealm(realm)}`));
    const s = LANDMARK_SIZES[arch as LandmarkArch];
    return { key, w: s.w, h: s.h };
  }
  if (name.startsWith('rc:')) {
    const key = `hc-${name}`;
    if (!scene.textures.exists(key)) timed(name, () => scene.textures.addCanvas(key, artCanvas(scene, name)));
    const t = scene.textures.get(key).getSourceImage();
    return { key, w: t.width, h: t.height };
  }
  const f = Art.frame(name);
  return { key: f.key, frame: f.frame, w: f.w, h: f.h };
}

/** Light points of an art name (handoff metadata; realm landmarks glow in the realm accent). */
export function artLights(name: string): Light[] {
  if (name.startsWith('lm:')) {
    const [, arch, realm] = name.split(':');
    const s = LANDMARK_SIZES[arch as LandmarkArch];
    const accent = realm === 'concordia' ? 0xffd36a : realmOf(`realm:${realm}`)?.accent ?? DEFAULT_LIGHT;
    return [[s.w / 2, s.h * 0.4, 40, accent]];
  }
  const base = baseArt(name);
  const m = Art.meta(base);
  // the handoff gives lamps no light points; their lantern sits at the top
  const pts = m?.lights ?? (LAMP_HEADS[base] ? [LAMP_HEADS[base]] : []);
  return pts.map((l) => {
    const raw = l as unknown as [number, number, number, (string | number)?];
    const col = typeof raw[3] === 'string' ? parseInt(raw[3].replace('#', ''), 16) : raw[3] ?? DEFAULT_LIGHT;
    return [raw[0], raw[1], raw[2], col];
  });
}
