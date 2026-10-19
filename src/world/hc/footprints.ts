/**
 * Sizes and collision footprints of the handoff's v2 buildings and props (docs/world/HOLLOW-CROWN-WORLD.md §5).
 * The handoff ships no collision data; footprints are defined here. All sprites use origin (0.5, 1), so a
 * footprint is a box relative to the sprite's bottom-centre: x from −w/2.., y upward (negative). Pure.
 */
import type { LandmarkArch } from './types';

export interface ArtSize { w: number; h: number; building?: boolean }

/** Pixel sizes from assets/atlas.json (buildings v2 + props v2). */
export const ART_SIZES: Record<string, ArtSize> = {
  // buildings
  b_inn: { w: 160, h: 144, building: true }, b_smithy: { w: 128, h: 112, building: true }, b_chapel: { w: 176, h: 168, building: true },
  b_mill: { w: 128, h: 144, building: true }, b_stall: { w: 64, h: 64, building: true }, b_house_tall: { w: 96, h: 144, building: true },
  b_house_stone: { w: 96, h: 112, building: true }, b_rowhouses: { w: 156, h: 124, building: true }, b_pub: { w: 128, h: 124, building: true },
  b_teahouse: { w: 112, h: 112, building: true }, b_bakery: { w: 112, h: 116, building: true }, b_alchemist: { w: 112, h: 148, building: true },
  b_nursery: { w: 128, h: 104, building: true }, b_training: { w: 144, h: 124, building: true }, b_stables: { w: 128, h: 104, building: true },
  c_wall: { w: 64, h: 96, building: true }, c_tower: { w: 72, h: 152, building: true }, c_gate: { w: 160, h: 152, building: true },
  c_keep: { w: 160, h: 176, building: true },
  // village props
  v_well: { w: 48, h: 64 }, v_lamp: { w: 16, h: 62 }, v_waystone: { w: 32, h: 58 }, v_noticeboard: { w: 40, h: 46 },
  v_haystack: { w: 40, h: 32 }, v_cart: { w: 56, h: 40 }, v_bench: { w: 40, h: 22 }, v_fence_h: { w: 32, h: 22 },
  v_fence_v: { w: 12, h: 40 }, v_gate: { w: 32, h: 24 }, v_hedge: { w: 32, h: 28 }, v_flowerbed: { w: 32, h: 20 },
  v_scarecrow: { w: 32, h: 54 }, v_barrels: { w: 40, h: 30 }, v_crates: { w: 40, h: 40 }, v_dummy: { w: 28, h: 50 },
  v_weapon_rack: { w: 40, h: 42 }, v_target: { w: 32, h: 44 }, v_cafe_table: { w: 40, h: 36 }, v_trough: { w: 44, h: 22 },
  // gloamwood props
  f_gloamtree: { w: 96, h: 112 }, f_pine: { w: 48, h: 88 }, f_deadtree: { w: 56, h: 80 }, f_stump: { w: 32, h: 26 },
  f_mushrooms: { w: 32, h: 26 }, f_toadstool: { w: 20, h: 24 }, f_fern: { w: 28, h: 22 }, f_log: { w: 56, h: 26 },
  f_runestone: { w: 28, h: 50 }, f_ruin_arch: { w: 80, h: 88 }, f_bramble: { w: 40, h: 24 },
  // abbey props
  d_pillar: { w: 32, h: 80 }, d_arch: { w: 96, h: 104 }, d_pew: { w: 48, h: 26 }, d_candelabra: { w: 20, h: 42 },
  d_sconce: { w: 16, h: 32 }, d_crystal: { w: 28, h: 36 }, d_altar: { w: 56, h: 42 }, d_bell: { w: 44, h: 42 },
  d_chest: { w: 28, h: 24 }, d_chest_rare: { w: 28, h: 24 }, d_kelp: { w: 18, h: 38 }, d_bones: { w: 30, h: 16 },
};

/** Realm landmark sizes by arch (realms.js LMSZ). */
export const LANDMARK_SIZES: Record<LandmarkArch, ArtSize> = {
  spire: { w: 96, h: 176, building: true }, hall: { w: 160, h: 128, building: true }, dome: { w: 128, h: 132, building: true },
  tree: { w: 128, h: 168, building: true }, citadel: { w: 192, h: 176, building: true },
};

/** Footprint box relative to the sprite's bottom-centre: [x, y, w, h] with y ≤ 0 (upward). */
export type Box = [number, number, number, number];

/** Non-building props with a custom footprint; anything not listed and not a building is walk-through. */
const PROP_BOXES: Record<string, Box> = {
  v_well: [-20, -22, 40, 20], v_lamp: [-4, -6, 8, 6], v_waystone: [-12, -12, 24, 12], v_noticeboard: [-16, -8, 32, 8],
  v_haystack: [-18, -18, 36, 16], v_cart: [-26, -18, 52, 16], v_fence_h: [-16, -8, 32, 8], v_fence_v: [-6, -38, 12, 38],
  v_hedge: [-16, -12, 32, 12], v_scarecrow: [-4, -6, 8, 6], v_barrels: [-18, -14, 36, 14], v_crates: [-18, -16, 36, 16],
  v_dummy: [-6, -8, 12, 8], v_weapon_rack: [-18, -10, 36, 10], v_target: [-12, -8, 24, 8], v_trough: [-20, -12, 40, 12],
  f_gloamtree: [-10, -12, 20, 12], f_pine: [-6, -8, 12, 8], f_deadtree: [-8, -8, 16, 8], f_stump: [-12, -12, 24, 12],
  f_log: [-26, -12, 52, 12], f_runestone: [-10, -10, 20, 10], f_bramble: [-18, -12, 36, 12],
  d_pillar: [-14, -16, 28, 16], d_altar: [-26, -18, 52, 18], d_bell: [-20, -16, 40, 16], d_crystal: [-10, -10, 20, 10],
  d_chest: [-12, -10, 24, 10], d_chest_rare: [-12, -10, 24, 10], d_candelabra: [-6, -6, 12, 6], d_pew: [-22, -10, 44, 10],
};

/** Door gap width (px) at the bottom centre of buildings. */
export const DOOR_W = 24;

/** Base art name of a frame (strips the `rc:<school>:` recolour prefix). */
export function baseArt(name: string): string {
  return name.startsWith('rc:') ? name.slice(name.indexOf(':', 3) + 1) : name;
}

/** Size of any placeable art (base, recoloured, or a realm landmark `lm:<arch>:<realm>`). */
export function artSize(name: string): ArtSize {
  if (name.startsWith('lm:')) return LANDMARK_SIZES[name.split(':')[1] as LandmarkArch] ?? LANDMARK_SIZES.dome;
  return ART_SIZES[baseArt(name)] ?? { w: 32, h: 32 };
}

/**
 * Solid boxes for one placed art, relative to its bottom-centre. Buildings: the lower 55% of the image,
 * inset 4 px, with a door gap at the bottom centre. Castle gates have a 40 px arch instead.
 */
export function footprintBoxes(name: string): Box[] {
  const base = baseArt(name);
  const custom = PROP_BOXES[base];
  if (custom) return [custom];
  const s = artSize(name);
  if (!s.building) return [];
  const w = s.w - 8, h = Math.round(s.h * 0.55);
  const gap = base === 'c_gate' ? 40 : base === 'c_wall' || base === 'c_tower' ? 0 : DOOR_W;
  if (!gap) return [[-w / 2, -h, w, h]];
  const side = (w - gap) / 2;
  return [[-w / 2, -h, side, h], [gap / 2, -h, side, h], [-gap / 2, -h, gap, h - 10]];
}
