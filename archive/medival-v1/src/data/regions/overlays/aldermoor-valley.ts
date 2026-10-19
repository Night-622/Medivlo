/**
 * The Aldermoor valley shell (WORLD.md §5.1): tor ring with three road gaps, the Gloamwood, farmland,
 * exit barriers (Claude 4's lore: storm-felled trees N, Reeve's Barricade E, Wick toll-gate S) and exit triggers.
 */
import { T } from '@/world/tiles';
import type { OverlayDef } from '@/world/types';
import { v } from '../_valley';

const NORTH_OPEN = { flag: 'prologue.complete' };
const SOUTH_OPEN = { all: [{ flag: 'prologue.complete' }, { flag: 'act1.complete' }] };

const valley: OverlayDef = {
  id: 'overlay:aldermoor-valley',
  origin: v(0, 0),
  size: [256, 256],
  encoding: 'ops',
  ops: [
    // Gloamwood: dark ground and dense trees over the west third.
    { op: 'ellipse', layer: 'ground', rect: [-30, -10, 136, 276], tile: T.GRASS_DARK, soft: true },
    { op: 'scatter', rect: [-30, -10, 136, 276], ellipse: true, tiles: [T.TREE, T.TREE, T.TREE, T.PINE, T.BUSH], density: 0.3, seed: 11 },
    // Farmland around Brindlecross.
    { op: 'fill', layer: 'ground', rect: [100, 166, 28, 22], tile: T.FIELD, soft: true },
    { op: 'fill', layer: 'ground', rect: [146, 160, 24, 16], tile: T.FIELD, soft: true },
    { op: 'fill', layer: 'ground', rect: [112, 96, 20, 16], tile: T.FIELD, soft: true },
    { op: 'clear', layer: 'deco', rect: [100, 96, 76, 92], soft: true },
    // The ring: tors, with the deep Gloamwood thicket on the west.
    { op: 'frame', layer: 'deco', thickness: 6, jitter: 6, tile: T.TOR,
      gaps: [{ side: 'n', at: 136, width: 6 }, { side: 's', at: 136, width: 6 }, { side: 'e', at: 150, width: 6 }] },
    { op: 'fill', layer: 'deco', rect: [0, 0, 7, 256], tile: T.THICKET },
  ],
  objects: [
    { id: 'obj:ley-coal-vein-1', kind: 'interactable', at: [216, 170], props: { name: 'Ley-coal vein', label: 'Mine' } },
    { id: 'obj:ley-coal-vein-2', kind: 'interactable', at: [228, 180], props: { name: 'Ley-coal vein', label: 'Mine' } },
    { id: 'obj:ley-coal-vein-3', kind: 'interactable', at: [237, 189], props: { name: 'Ley-coal vein', label: 'Mine' } },
  ],
  variants: [
    {
      when: { not: NORTH_OPEN },
      ops: [
        { op: 'fill', layer: 'deco', rect: [131, 1, 11, 2], tile: T.DEAD_TREE },
        { op: 'fill', layer: 'deco', rect: [244, 140, 6, 21], tile: T.BARRICADE },
      ],
      objects: [
        { id: 'area:exit-north', kind: 'trigger', at: [130, 3], size: [13, 6] },
        { id: 'area:exit-east', kind: 'trigger', at: [238, 144], size: [8, 13] },
      ],
    },
    {
      when: { not: SOUTH_OPEN },
      ops: [
        { op: 'fill', layer: 'deco', rect: [130, 250, 3, 2], tile: T.WALL_STONE },
        { op: 'fill', layer: 'deco', rect: [133, 250, 7, 2], tile: T.BARRICADE },
        { op: 'fill', layer: 'deco', rect: [140, 250, 3, 2], tile: T.WALL_STONE },
      ],
      objects: [{ id: 'area:exit-south', kind: 'trigger', at: [130, 243], size: [13, 6] }],
    },
  ],
};

export default valley;
