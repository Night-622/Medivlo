/**
 * NPC presence as snapshot entities (authority, pure). Claude 4's npcPlacements() says who stands at which
 * landmark from the HOST's quests, flags and clock; this provider puts each NPC at its npc-anchor (or its
 * landmark) in the viewer's space. Clients draw them from snapshots (src/world/render/NpcView.ts).
 */
import { TILE_SIZE } from '@/core';
import type { NpcDef } from '@/core';
import type { EntityState, SnapshotProvider } from '@/net';
import { spaceRuntime } from './spaces';
import type { WorldPlayer } from './authority';

type P2 = [number, number];

/** Positions (world px, feet) of npc-anchors and landmarks per space, built once per space. */
const index = new Map<string, { anchors: Map<string, P2>; landmarks: Map<string, P2> }>();

function spaceIndex(space: string) {
  let ix = index.get(space);
  if (ix) return ix;
  ix = { anchors: new Map(), landmarks: new Map() };
  const gen = spaceRuntime(space).gen;
  const N = 32;
  for (let cy = 0; cy < Math.ceil(gen.heightTiles / N); cy++) for (let cx = 0; cx < Math.ceil(gen.widthTiles / N); cx++) {
    for (const o of gen.objects(cx, cy)) {
      const [w, h] = o.size ?? [1, 1];
      const at: P2 = [(o.at[0] + w / 2) * TILE_SIZE, (o.at[1] + h / 2) * TILE_SIZE + TILE_SIZE / 2];
      if (o.kind === 'npc-anchor' && typeof o.props?.npc === 'string') ix.anchors.set(o.props.npc, [(o.at[0] + 0.5) * TILE_SIZE, (o.at[1] + 1) * TILE_SIZE - 2]);
      else if (o.id.startsWith('landmark:')) ix.landmarks.set(o.id, at);
    }
  }
  index.set(space, ix);
  return ix;
}

/** Every NPC present in a space now, at its anchor (or in a short row on its landmark), world px. */
export function npcsIn(space: string, placements: ReadonlyMap<string, readonly NpcDef[]>): { npc: NpcDef; x: number; y: number }[] {
  const ix = spaceIndex(space);
  const out: { npc: NpcDef; x: number; y: number }[] = [];
  for (const [landmark, npcs] of placements) {
    const base = ix.landmarks.get(landmark);
    npcs.forEach((n, i) => {
      const a = ix.anchors.get(n.id);
      // several NPCs on one landmark without their own anchor stand in a short row
      const at: P2 | undefined = a ?? (base ? [base[0] + (i - (npcs.length - 1) / 2) * 28, base[1]] : undefined);
      if (at) out.push({ npc: n, x: at[0], y: at[1] });
    });
  }
  return out;
}

function entity(n: NpcDef, space: string, x: number, y: number): EntityState {
  const data: Record<string, string | number | boolean> = { name: n.name, skin: n.look.skin, cloth: n.look.cloth };
  if (n.look.hair !== undefined) data.hair = n.look.hair;
  if (n.look.accent !== undefined) data.accent = n.look.accent;
  if (n.classLook) data.classLook = n.classLook;
  if (n.school) data.school = n.school;
  if (n.title) data.title = n.title;
  return { id: n.id, kind: 'npc', space, def: n.id, x, y, facing: 's', anim: 'idle', data };
}

export class NpcProvider implements SnapshotProvider {
  readonly name = 'world-npcs';

  /** @param placements Claude 4's npcPlacements() (injected so world code never imports narrative) */
  constructor(private players: () => WorldPlayer[], private placements: () => ReadonlyMap<string, readonly NpcDef[]>) {}

  collect(viewer: string): EntityState[] {
    const me = this.players().find((p) => p.id === viewer) ?? this.players()[0];
    return me ? npcsIn(me.space, this.placements()).map(({ npc, x, y }) => entity(npc, me.space, x, y)) : [];
  }
}
