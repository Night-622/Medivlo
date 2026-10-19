/**
 * Wennamere and the moor (WORLD.md §5.4): the cold mere with the half-sunk Drowned Abbey, the Giant's Sluice,
 * and Edric's Barrow on the south-east moor. `prologue.mere_drained` (Claude 4) drains the mere and opens the abbey.
 */
import { T } from '@/world/tiles';
import type { OverlayDef } from '@/world/types';
import { v, WEN } from '../_valley';

const DRAINED = { flag: 'prologue.mere_drained' };

const wennamere: OverlayDef = {
  id: 'overlay:wennamere',
  origin: WEN(0, 0),
  size: [94, 104],
  encoding: 'ops',
  ops: [
    { op: 'ellipse', layer: 'deco', rect: [0, 0, 92, 96], tile: -1 },
    { op: 'ellipse', layer: 'overhead', rect: [0, 0, 92, 96], tile: -1 },
    { op: 'ellipse', layer: 'ground', rect: [2, 2, 88, 92], tile: T.SHALLOWS },
    { op: 'ellipse', layer: 'ground', rect: [5, 5, 82, 86], tile: T.DEEP_WATER },
    // Abbey island and the half-sunk ruin.
    { op: 'ellipse', layer: 'ground', rect: [38, 34, 20, 18], tile: T.ROCK_FLOOR },
    { op: 'building', rect: [41, 36, 13, 10], wall: T.WALL_STONE, floor: T.STONE_FLOOR, roof: -1, doorAt: 6 },
    { op: 'scatter', rect: [38, 34, 20, 18], ellipse: true, tiles: [T.RUBBLE], density: 0.08, seed: 51 },
    // The Giant's Sluice: Orrin stonework across the south-east outflow.
    { op: 'line', layer: 'deco', points: [[70, 88], [84, 97]], width: 2, tile: T.WALL_STONE },
    { op: 'fill', layer: 'ground', rect: [74, 96, 12, 6], tile: T.STONE_FLOOR },
  ],
  objects: [
    { id: 'obj:giants-sluice-wheel', kind: 'interactable', at: [79, 99], props: { name: "Giant's Sluice Wheel", label: 'Turn' } },
    { id: 'npc-anchor:wennamere-shore', kind: 'npc-anchor', at: [40, 99], props: { landmark: 'landmark:wennamere-shore' } },
  ],
  variants: [
    {
      when: DRAINED,
      ops: [
        { op: 'ellipse', layer: 'ground', rect: [2, 2, 88, 92], tile: T.MUD },
        { op: 'ellipse', layer: 'ground', rect: [16, 58, 22, 16], tile: T.SHALLOWS },
        { op: 'ellipse', layer: 'ground', rect: [38, 34, 20, 18], tile: T.ROCK_FLOOR },
        { op: 'fill', layer: 'ground', rect: [41, 36, 13, 10], tile: T.STONE_FLOOR },
        { op: 'line', layer: 'ground', points: [[47, 100], [47, 46]], width: 3, tile: T.OLD_ROAD },
        { op: 'scatter', rect: [4, 4, 84, 88], ellipse: true, tiles: [T.REEDS, T.DEAD_TREE, T.RUBBLE], density: 0.03, seed: 52 },
      ],
      objects: [
        { id: 'obj:drowned-abbey-door', kind: 'door', at: [47, 45], props: { target: 'instance:drowned-abbey', entrance: 'main', name: 'the Drowned Abbey' } },
        { id: 'obj:wennamere-campfire', kind: 'interactable', at: [36, 98], props: { name: 'Campfire', rest: true } },
      ],
    },
  ],
};

const edricsBarrow: OverlayDef = {
  id: 'overlay:edrics-barrow',
  origin: v(196, 190),
  size: [22, 18],
  encoding: 'ops',
  noScatter: true,
  ops: [
    { op: 'ellipse', layer: 'ground', rect: [1, 1, 20, 16], tile: T.GRASS, soft: true },
    { op: 'ellipse', layer: 'deco', rect: [5, 3, 12, 9], tile: T.TOR },
    { op: 'fill', layer: 'deco', rect: [10, 11, 2, 1], tile: -1 },
    { op: 'fill', layer: 'detail', rect: [10, 11, 2, 2], tile: T.OLD_ROAD },
    { op: 'fill', layer: 'deco', rect: [3, 13, 1, 1], tile: T.STANDING_STONE },
    { op: 'fill', layer: 'deco', rect: [18, 13, 1, 1], tile: T.STANDING_STONE },
  ],
  objects: [
    { id: 'obj:edrics-barrow-door', kind: 'door', at: [11, 11], props: { target: 'instance:edrics-barrow', entrance: 'main', name: "Edric's Barrow" } },
    { id: 'npc-anchor:edrics-barrow', kind: 'npc-anchor', at: [13, 13], props: { landmark: 'landmark:edrics-barrow' } },
  ],
};

export default [wennamere, edricsBarrow];
