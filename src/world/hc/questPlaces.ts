/**
 * Where a quest marker points (Claude 2; pure, no Phaser). markerAt answers where a thing IS (story fights spawn
 * there, so it stays exact); a marker answers where to GO: a piece inside a lair, cave or the citadel points at
 * that instance's door from outside, and at the thing itself once you're in; a lair id from inside points at its
 * boss arena. Uses markerPeek, so a frame never pays for the cold index (warmMarkers fills it while idle).
 */
import { CHUNK_TILES } from '@/core';
import { indexedInstances, markerPeek } from './spawns';
import { mapMarkers } from './overview';
import { instanceDef, spaceRuntime } from './spaces';

type At = { space: string; at: [number, number] };

/** piece id → the instance it stands in (from the instance defs of the doors indexed so far) */
const holder = new Map<string, string>();
const scanned = new Set<string>();
function holderOf(id: string): string | undefined {
  if (!holder.has(id)) for (const inst of indexedInstances()) {
    if (scanned.has(inst)) continue;
    scanned.add(inst);
    for (const p of instanceDef(inst)?.pieces ?? []) if (!holder.has(p.id)) holder.set(p.id, inst);
  }
  return holder.get(id);
}

/** the objects of the instance the player is in (built anyway: they're standing in it) */
let local: { space: string; at: Map<string, [number, number]> } | null = null;
function inside(space: string, id: string): [number, number] | undefined {
  if (local?.space !== space) {
    const g = spaceRuntime(space).gen, at = new Map<string, [number, number]>();
    for (let cy = 0; cy < Math.ceil(g.heightTiles / CHUNK_TILES); cy++) for (let cx = 0; cx < Math.ceil(g.widthTiles / CHUNK_TILES); cx++) {
      for (const o of g.objects(cx, cy)) { const [w, h] = o.size ?? [1, 1]; if (!at.has(o.id)) at.set(o.id, [o.at[0] + (w >> 1), o.at[1] + (h >> 1)]); }
    }
    local = { space, at };
  }
  return local.at.get(id);
}

/** A quest place id, seen from `here` (the player's space), as a space and tile; null if it can't be shown. */
export function questPlace(id: string, here?: string): At | null {
  if (here?.startsWith('inst:') && instanceDef(here)) {
    if (id === here) { const boss = mapMarkers(here).find((m) => m.kind === 'boss'); return boss ? { space: here, at: boss.at } : null; }
    const at = inside(here, id);
    if (at) return { space: here, at };
  }
  const hit = markerPeek(id);
  if (hit) return hit;
  const inst = holderOf(id);
  return inst ? markerPeek(inst) : null;
}
