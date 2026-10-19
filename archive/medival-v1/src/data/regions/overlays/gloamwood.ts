/** Gloamwood sites (WORLD.md §5.3): Weeping Stones, Wolf Hollow, Tobin's camp, the Briar hut. Valley-local origins. */
import { T } from '@/world/tiles';
import type { OverlayDef, OverlayOp } from '@/world/types';
import { v } from '../_valley';

/** Ring of standing stones around (cx, cy). */
function stoneRing(cx: number, cy: number, r: number, n: number): OverlayOp[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return { op: 'fill', layer: 'deco', rect: [Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r * 0.8), 1, 1], tile: T.STANDING_STONE } as OverlayOp;
  });
}

const weepingStones: OverlayDef = {
  id: 'overlay:weeping-stones',
  origin: v(18, 50),
  size: [26, 22],
  encoding: 'ops',
  noScatter: true,
  ops: [
    { op: 'ellipse', layer: 'ground', rect: [0, 0, 26, 22], tile: T.GRASS, soft: true },
    { op: 'ellipse', layer: 'detail', rect: [8, 7, 10, 8], tile: T.LEY_VEIN },
    ...stoneRing(13, 11, 8, 9),
    { op: 'fill', layer: 'deco', rect: [12, 10, 2, 1], tile: T.ALTAR },
  ],
  variants: [
    { when: { flag: 'prologue.stag_fate', op: '==', value: 'slain' },
      ops: [{ op: 'ellipse', layer: 'ground', rect: [3, 3, 20, 16], tile: T.ASH }, { op: 'clear', layer: 'detail', rect: [0, 0, 26, 22] }] },
    { when: { flag: 'prologue.stag_fate', op: '==', value: 'cleansed' },
      ops: [{ op: 'scatter', rect: [2, 2, 22, 18], tiles: [T.FLOWERS], density: 0.2, seed: 41 }],
      objects: [{ id: 'npc-anchor:weeping-stones', kind: 'npc-anchor', at: [13, 13], props: { landmark: 'landmark:weeping-stones' } }] },
  ],
};

const wolfHollow: OverlayDef = {
  id: 'overlay:wolf-hollow',
  origin: v(14, 22),
  size: [22, 18],
  encoding: 'ops',
  noScatter: true,
  ops: [
    { op: 'ellipse', layer: 'ground', rect: [0, 0, 22, 18], tile: T.DIRT, soft: true },
    { op: 'fill', layer: 'deco', rect: [7, 1, 8, 3], tile: T.TOR },
    { op: 'fill', layer: 'deco', rect: [10, 4, 2, 1], tile: -1 },
    { op: 'scatter', rect: [1, 1, 20, 16], ellipse: true, tiles: [T.ROCK, T.BUSH, T.DEAD_TREE], density: 0.08, seed: 42 },
  ],
};

const tobinsCamp: OverlayDef = {
  id: 'overlay:tobins-camp',
  origin: v(54, 84),
  size: [14, 12],
  encoding: 'ops',
  noScatter: true,
  ops: [
    { op: 'ellipse', layer: 'ground', rect: [0, 0, 14, 12], tile: T.DIRT, soft: true },
    { op: 'building', rect: [2, 2, 4, 3], wall: T.WALL_WOOD, floor: T.DIRT, roof: T.ROOF_THATCH, doorAt: 1 },
  ],
  objects: [
    { id: 'obj:tobins-campfire', kind: 'interactable', at: [7, 7], props: { name: 'Campfire', rest: true } },
    { id: 'obj:tobins-lantern', kind: 'interactable', at: [9, 4], props: { name: "Tobin's Lantern", label: 'Examine' } },
    { id: 'obj:tobins-camp-chest', kind: 'chest', at: [3, 8], props: { lootTable: 'loot:tobins-camp', name: 'Pack' } },
  ],
};

const briarHut: OverlayDef = {
  id: 'overlay:briar-hut',
  origin: v(36, 104),
  size: [14, 12],
  encoding: 'ops',
  noScatter: true,
  ops: [
    { op: 'ellipse', layer: 'ground', rect: [0, 0, 14, 12], tile: T.GRASS, soft: true },
    { op: 'building', rect: [3, 2, 7, 5], wall: T.WALL_WOOD, floor: T.WOOD_FLOOR, roof: T.ROOF_THATCH, doorAt: 3 },
    { op: 'scatter', rect: [1, 7, 12, 4], tiles: [T.FLOWERS, T.BUSH], density: 0.25, seed: 43 },
    { op: 'collide', rect: [0, 0, 14, 12], bits: 64 },
  ],
  objects: [
    { id: 'obj:briar-campfire', kind: 'interactable', at: [10, 8], props: { name: 'Hearth-fire', rest: true } },
    { id: 'npc-anchor:briar-hut', kind: 'npc-anchor', at: [7, 8], props: { landmark: 'landmark:briar-hut' } },
  ],
};

export default [weepingStones, wolfHollow, tobinsCamp, briarHut];
