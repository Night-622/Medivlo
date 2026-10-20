/**
 * Realm recolouring (port of the handoff's realms.js `shift()`): per-pixel HSL rules that turn the base village
 * art into a realm's palette. Pure maths over RGBA arrays, so it runs anywhere; the renderer feeds it ImageData.
 */
import type { HueRule, RealmDef } from './types';

const cl = (v: number) => Math.max(0, Math.min(1, v));

/** RGB 0–255 → [h deg, s 0–1, l 0–1]. */
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, s, l];
}

/** [h deg, s, l] → RGB 0–255. */
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360 / 360;
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [Math.round(hue(h + 1 / 3) * 255), Math.round(hue(h) * 255), Math.round(hue(h - 1 / 3) * 255)];
}

export interface RecolorRules { ground: HueRule; stone: HueRule; water: HueRule; roofHue: number }

export function rulesOf(realm: RealmDef): RecolorRules | null {
  if (!realm.ground || !realm.stone || !realm.water || realm.roofHue === undefined) return null;
  return { ground: realm.ground, stone: realm.stone, water: realm.water, roofHue: realm.roofHue };
}

/**
 * Recolour RGBA pixels in place. Kept unchanged: transparent pixels, the ink outline (l < .13) and gold/window
 * highlights. Then the first match wins: green → ground, blue water → water, other saturated → roof, rest → stone.
 */
export function recolorPixels(a: Uint8ClampedArray, R: RecolorRules): void {
  for (let i = 0; i < a.length; i += 4) {
    if (!a[i + 3]) continue;
    const [h, s, l] = rgbToHsl(a[i], a[i + 1], a[i + 2]);
    if (l < 0.13) continue;
    if (h > 35 && h < 65 && l > 0.58 && s > 0.55) continue;
    let nh: number, ns: number, nl: number;
    if (s > 0.3 && h >= 70 && h <= 170) { nh = R.ground[0] + (h - 115) * 0.3; ns = cl(s * R.ground[1]); nl = cl(l + R.ground[2]); }
    else if (s > 0.45 && h >= 185 && h <= 215) { nh = R.water[0]; ns = cl(s * R.water[1]); nl = cl(l + R.water[2]); }
    else if (s > 0.32) { nh = R.roofHue + (h % 40) * 0.25; ns = cl(s * 0.95); nl = l; }
    else { nh = R.stone[0]; ns = cl(s * R.stone[1] + 0.04); nl = cl(l + R.stone[2]); }
    const [r, g, b] = hslToRgb(nh, ns, nl);
    a[i] = r; a[i + 1] = g; a[i + 2] = b;
  }
}
