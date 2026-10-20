/**
 * NPC presence as snapshot entities (authority, pure). Claude 4's npcPlacements() says who stands at which
 * landmark from the HOST's quests, flags and clock; this provider puts each NPC at its npc-anchor (or its
 * landmark) in the viewer's space. Clients draw them from snapshots (src/world/render/NpcView.ts).
 */
import { TILE_SIZE } from '@/core';
import type { NpcDef } from '@/core';
import type { EntityState, SnapshotProvider } from '@/net';
import { spaceRuntime } from './spaces';
import { SpaceQuery } from './runtime';
import type { WorldPlayer } from './authority';

type P2 = [number, number];

/** Positions (world px, feet) of npc-anchors and landmarks per space, built once per space. */
const index = new Map<string, { anchors: Map<string, P2>; landmarks: Map<string, P2>; q: SpaceQuery }>();

/**
 * Feet on open ground: a set-piece landmark often has its building or prop at the centre, so an NPC placed there
 * stood inside the house (Claude 1's reach check: 179 spots). The nearest walkable tile wins, in front of (below) the
 * prop first; px kept when already clear.
 */
function onGround(q: SpaceQuery, [x, y]: P2): P2 {
  const tx = Math.floor(x / TILE_SIZE), ty = Math.floor((y - 1) / TILE_SIZE);
  if (q.isWalkable(tx, ty)) return [x, y];
  let best: P2 | null = null, bd = Infinity;
  for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
    const d = Math.hypot(dx, dy) + (dy < 0 ? 0.6 : 0); // below the prop reads as "in front of it"
    if (d < bd && q.isWalkable(tx + dx, ty + dy)) { bd = d; best = [(tx + dx + 0.5) * TILE_SIZE, (ty + dy + 1) * TILE_SIZE - 2]; }
  }
  return best ?? [x, y];
}

function spaceIndex(space: string) {
  let ix = index.get(space);
  if (ix) return ix;
  const rt = spaceRuntime(space), gen = rt.gen;
  ix = { anchors: new Map(), landmarks: new Map(), q: new SpaceQuery(rt, () => ({ hour: 12, phase: 'day' })) };
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
      const at: P2 | undefined = a ?? (base ? onGround(ix.q, [base[0] + (i - (npcs.length - 1) / 2) * 28, base[1]]) : undefined);
      if (at) out.push({ npc: n, x: at[0], y: at[1] });
    });
  }
  return out;
}

/**
 * Where an NPC stands now (WorldService.npcPos; Claude 3's shop and Runeforge acts need the hero beside the merchant):
 * the space of the landmark it is placed on (`spaceOf`, the marker index), else any of `also` (the players' spaces:
 * NPCs placed inside an instance). World px, as the snapshots draw it; null when it isn't present anywhere.
 */
export function npcWhere(npcId: string, placements: ReadonlyMap<string, readonly NpcDef[]>, spaceOf: (landmark: string) => string | null, also: string[] = []): { space: string; x: number; y: number } | null {
  const spaces = new Set<string>();
  for (const [landmark, npcs] of placements) if (npcs.some((n) => n.id === npcId)) { const s = spaceOf(landmark); if (s) spaces.add(s); }
  for (const s of also) spaces.add(s);
  for (const space of spaces) {
    const n = npcsIn(space, placements).find((x) => x.npc.id === npcId);
    if (n) return { space, x: n.x, y: n.y };
  }
  return null;
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
