/** Biome palettes: noise fields → base ground + scatter (WORLD.md §3.3 steps 3 and 7). Pure. */
import type { BiomeId } from '@/core';
import { T } from './tiles';

export interface Fields {
  /** elevation, moisture, detail, frost noise, all in [0, 1] */
  e: number;
  m: number;
  d: number;
  f: number;
  /** per-tile random in [0, 1) */
  r: number;
}

export interface BaseTile { ground: number; deco: number }

const NONE = -1;

function pick(r: number, table: [number, number][]): number {
  let acc = 0;
  for (const [p, tile] of table) { acc += p; if (r < acc) return tile; }
  return NONE;
}

export function baseTile(biome: BiomeId, x: Fields, frost: number): BaseTile {
  const { e, m, d, r } = x;
  let ground: number = T.GRASS;
  let deco: number = NONE;

  switch (biome) {
    case 'moor':
      if (e < 0.24) return { ground: e < 0.2 ? T.DEEP_WATER : T.SHALLOWS, deco: NONE };
      ground = m > 0.62 ? T.GRASS : d > 0.7 ? T.DIRT : T.HEATH;
      if (e > 0.8) deco = T.TOR;
      else deco = pick(r, [[0.012, T.ROCK], [0.02, T.BUSH], [0.006, T.TREE]]);
      break;
    case 'temperate-forest':
    case 'old-growth': {
      ground = m > 0.55 ? T.GRASS_DARK : T.GRASS;
      const clearing = d < 0.32;
      // Below ~0.4 blocked tiles a forest stays crossable (site-percolation threshold); bushes only slow.
      const dens = biome === 'old-growth' ? 0.3 : 0.24;
      deco = clearing ? pick(r, [[0.03, T.BUSH], [0.02, T.FLOWERS]]) : pick(r, [[dens, T.TREE], [0.05, T.BUSH], [0.01, T.ROCK]]);
      break;
    }
    case 'farmland':
      ground = d > 0.62 && m < 0.6 ? T.FIELD : T.GRASS;
      deco = ground === T.FIELD ? NONE : pick(r, [[0.012, T.TREE], [0.01, T.BUSH], [0.01, T.FLOWERS]]);
      break;
    case 'plains':
      ground = T.GRASS;
      deco = pick(r, [[0.015, T.TREE], [0.015, T.FLOWERS], [0.008, T.ROCK]]);
      break;
    case 'downs':
      ground = T.GRASS;
      deco = pick(r, [[0.008, T.ROCK], [0.003, T.GRAVE], [0.01, T.BUSH]]);
      break;
    case 'marsh':
      ground = m > 0.78 ? T.DEEP_WATER : m > 0.58 ? T.SHALLOWS : T.MARSH;
      deco = ground === T.MARSH ? pick(r, [[0.12, T.REEDS], [0.012, T.DEAD_TREE]]) : NONE;
      break;
    case 'coast':
    case 'island':
      ground = e < 0.3 ? T.SAND : T.GRASS;
      deco = pick(r, [[0.01, T.ROCK], [0.012, T.BUSH], [0.008, T.PINE]]);
      break;
    case 'beach':
      ground = T.SAND;
      deco = pick(r, [[0.008, T.ROCK]]);
      break;
    case 'alpine':
      ground = e > 0.6 ? T.SNOW : T.ROCK_FLOOR;
      deco = e > 0.74 ? T.TOR : pick(r, [[0.14, T.PINE], [0.03, T.ROCK]]);
      break;
    case 'tundra':
      ground = e < 0.28 ? T.ICE : T.SNOW;
      deco = pick(r, [[0.05, T.DRIFT], [0.03, T.PINE], [0.01, T.ROCK]]);
      break;
    case 'glacier':
      ground = m > 0.5 ? T.ICE : T.SNOW;
      deco = e > 0.75 ? T.TOR : NONE;
      break;
    case 'desert':
      ground = T.SAND;
      deco = pick(r, [[0.008, T.ROCK]]);
      break;
    case 'canyon':
      ground = e > 0.5 ? T.ROCK_FLOOR : T.SAND;
      deco = e > 0.68 ? T.TOR : pick(r, [[0.015, T.ROCK]]);
      break;
    case 'ash-desert':
      ground = T.ASH;
      deco = e > 0.78 ? T.TOR : pick(r, [[0.012, T.DEAD_TREE], [0.015, T.ROCK]]);
      break;
    case 'mirelands':
      ground = m > 0.6 ? T.MIRE : e > 0.5 ? T.ASH : T.MARSH;
      deco = pick(r, [[0.04, T.REEDS], [0.02, T.DEAD_TREE]]);
      break;
    case 'cavern':
    case 'dungeon-crypt':
    case 'dungeon-mine':
    case 'dungeon-ruin':
      ground = T.ROCK_FLOOR;
      break;
    case 'interior':
      ground = T.WOOD_FLOOR;
      break;
  }

  // The Long Winter: frost noise turns open ground to snow.
  if (frost > 0 && x.f < frost * 0.55 && ground !== T.DEEP_WATER && ground !== T.SHALLOWS && ground !== T.MIRE) {
    ground = ground === T.ICE ? T.ICE : T.SNOW;
    if (deco === NONE && r > 0.985) deco = T.DRIFT;
  }
  return { ground, deco };
}
