/**
 * Map-screen data (pure): school realm overview images built from the generator, map markers per space,
 * and Morvane hit-testing. The map UI (src/ui/map) only draws what this returns.
 */
import { MORVANE_REGIONS, MORVANE_VILLAGES } from '@/data/regions/hc/morvane';
import { CHUNK_TILES } from '@/core';
import { CORNER_MINI } from './theme';
import { AREAS, allWaystones, placeName, realmOf, spaceRuntime } from './spaces';
import type { RealmGen } from './realmGen';
import type { MorvaneRegionDef } from './types';
import type { ConcordiaGen } from './concordiaGen';

/** Tiles per overview pixel for school realms (384×256 → 192×128). */
export const REALM_OVERVIEW_STEP = 2;

export interface MapMarker {
  id: string;
  kind: 'waystone' | 'village' | 'zone' | 'lair' | 'gate' | 'optional' | 'exit' | 'boss' | 'chest' | 'find';
  name: string;
  /** world tiles */
  at: [number, number];
  /** waystones: lit from the start */
  startsLit?: boolean;
}

/** An overview image, and which of its pixels are road (for the map's label placement). */
export interface Overview { w: number; h: number; rgba: Uint8ClampedArray; road: Uint8Array }
const overviews = new Map<string, Overview>();

/** RGBA overview of a school realm, one pixel per REALM_OVERVIEW_STEP tiles (an instance: one per tile) (cached). */
export function realmOverview(space: string): Overview {
  const hit = overviews.get(space);
  if (hit) return hit;
  const gen = spaceRuntime(space).gen;
  const S = space.startsWith('inst:') ? 1 : REALM_OVERVIEW_STEP, w = Math.ceil(gen.widthTiles / S), h = Math.ceil(gen.heightTiles / S);
  const rgba = new Uint8ClampedArray(w * h * 4), road = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const tx = x * S, ty = y * S, corner = CORNER_MINI[gen.cornerAt(tx, ty)] ?? 'ground';
    const c = gen.paletteAt(tx, ty).mini[corner];
    if (corner === 'path') road[y * w + x] = 1;
    const i = (y * w + x) * 4;
    rgba[i] = c >> 16; rgba[i + 1] = (c >> 8) & 255; rgba[i + 2] = c & 255; rgba[i + 3] = 255;
  }
  const out = { w, h, rgba, road };
  overviews.set(space, out);
  return out;
}

/** Markers inside an instance: the way out, the boss arena, chests and things to read or search. */
function instanceMarkers(space: string): MapMarker[] {
  const gen = spaceRuntime(space).gen, out: MapMarker[] = [];
  for (let cy = 0; cy < Math.ceil(gen.heightTiles / CHUNK_TILES); cy++) for (let cx = 0; cx < Math.ceil(gen.widthTiles / CHUNK_TILES); cx++) {
    for (const o of gen.objects(cx, cy)) {
      const [w, h] = o.size ?? [1, 1];
      const at: [number, number] = [o.at[0] + (w >> 1), o.at[1] + (h >> 1)];
      const name = String(o.props?.name ?? '');
      if (o.kind === 'door' && String(o.props?.target ?? '').startsWith('space:')) out.push({ id: o.id, kind: 'exit', name: 'The way out', at });
      else if (o.id.startsWith('boss:') && !o.props?.after) out.push({ id: o.id, kind: 'boss', name: 'The boss', at });
      else if (o.kind === 'chest') out.push({ id: o.id, kind: 'chest', name: 'Chest', at });
      else if (o.kind === 'interactable' && !o.id.startsWith('hz:')) out.push({ id: o.id, kind: 'find', name, at });
    }
  }
  return out;
}

/** Markers of a space for the map screen. */
export function mapMarkers(space: string): MapMarker[] {
  if (space.startsWith('inst:')) return instanceMarkers(space);
  const ws: MapMarker[] = allWaystones().filter((w) => w.space === space)
    .map((w) => ({ id: w.id, kind: 'waystone', name: w.name, at: w.at, startsLit: w.startsLit }));
  if (space === 'concordia') {
    const opt = [...(spaceRuntime('concordia').gen as ConcordiaGen).optional].map(([id, o]): MapMarker => ({ id, kind: 'optional', name: placeName(space, id).name, at: o.at }));
    return [...ws, ...MORVANE_VILLAGES.map((v): MapMarker => ({ id: v.id, kind: 'village', name: v.name, at: v.at })), ...opt];
  }
  const gen = spaceRuntime(space).gen as RealmGen;
  const out: MapMarker[] = [...ws, ...gen.villages.map((v): MapMarker => ({ id: v.id, kind: 'village', name: v.name, at: v.at }))];
  for (const [id, at] of gen.zones) out.push({ id, kind: 'zone', name: placeName(space, id).name, at });
  // optional areas: the map shows them once found (name) or hinted by a lookout (a question mark)
  for (const [id, o] of gen.optional) out.push({ id, kind: 'optional', name: placeName(space, id).name, at: o.at });
  return out;
}

/** Morvane map pixel (432×272) → region, using the same polygons as generation. */
export function morvaneRegionAt(mx: number, my: number): MorvaneRegionDef | null {
  for (const r of MORVANE_REGIONS) if (r.polys.some((p) => inPoly(mx, my, p))) return r;
  return null;
}

function inPoly(x: number, y: number, p: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, yi] = p[i], [xj, yj] = p[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Zone info for the realm panel: name, theme and its area. */
export function zoneInfo(space: string, zoneId: string): { name: string; theme: string; area: string } | null {
  const m = /^zone:([a-z]+)-(capital|frontier)-(\d)$/.exec(zoneId);
  const area = m && AREAS.find((a) => a.id === `area:${m[1]}-${m[2]}`);
  const z = area?.zones[Number(m![3]) - 1];
  if (!area || !z) return null;
  return { name: placeName(space, zoneId).name, theme: z.theme, area: `${area.title} · ${area.className}` };
}

export { realmOf };
