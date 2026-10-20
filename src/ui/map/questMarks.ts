/**
 * Quest markers on the minimap and the map (Claude 2; Claude 7's QA finding: no quest guidance reached the player).
 * Claude 4's narrative client lists the open objectives (`questMarkers()`, src/narrative/client/markers.ts); this
 * resolves each place to a space and world px: an NPC by where it stands now (else its scheduled landmark), anything
 * else by questPlace (src/world/hc/questPlaces.ts: pieces inside an instance point at its door from outside).
 */
import { TILE_SIZE, type NpcId, type WorldObject } from '@/core';
import { HC_SHOPS } from '@/data/items/hc/shops';
import { questMarkers, type QuestMarker } from '@/narrative/client/markers';
import { isPresent, npcDef, npcLandmark } from '@/narrative/engine';
import { objectsAround } from '@/world/hc/interact';
import { questPlace } from '@/world/hc/questPlaces';
import { warmMarkers } from '@/world/hc/spawns';

/** One objective to show, resolved. */
export interface QuestMark {
  key: string;
  /** the place id it came from (the Journal's "Show on map" focus) */
  place: string;
  space: string;
  /** world px */
  x: number;
  y: number;
  /** the tracked quest (gold, gets the edge arrow and the map pulse) vs any other active quest (teal) */
  tracked: boolean;
  side: boolean;
  label: string;
  /** what the map calls the place (an NPC, landmark, object or door); '' for zones and regions, labelled already */
  name: string;
}

/** Where an NPC entity stands now, in the space the player is in (world px), if it's here. */
export type NpcAt = (npcId: string) => { space: string; x: number; y: number } | null;

const source = (): QuestMarker[] => { try { return questMarkers(); } catch { return []; } };

/** A place id (marker place, or npc:<id>) seen from space `here`, to a space and world px, or null. */
export function resolvePlace(place: string, npcAt?: NpcAt, here?: string): { space: string; x: number; y: number } | null {
  if (place.startsWith('npc:')) {
    const live = npcAt?.(place);
    if (live) return live;
    const home = npcLandmark(place as NpcId);
    return home ? resolvePlace(home, undefined, here) : null;
  }
  const hit = questPlace(place, here);
  return hit ? { space: hit.space, x: hit.at[0] * TILE_SIZE + TILE_SIZE / 2, y: hit.at[1] * TILE_SIZE + TILE_SIZE / 2 } : null;
}

/** Merchants standing in `space` now (world px): every shop whose NPC is present there, at its entity when `npcAt` sees it. */
export function merchantsIn(space: string, npcAt?: NpcAt): { x: number; y: number; forge: boolean }[] {
  const out: { x: number; y: number; forge: boolean }[] = [];
  for (const s of HC_SHOPS) {
    if (!s.npc.startsWith('npc:') || !isPresent(s.npc as NpcId)) continue;
    const at = resolvePlace(s.npc, npcAt, space);
    if (at?.space === space) out.push({ x: at.x, y: at.y, forge: !!s.runeforge });
  }
  return out;
}

const names = new Map<string, string>();
/** The map name of a mark's place (cached; the world is deterministic): an NPC's name, an object's or landmark's, a door's. */
export function placeLabel(place: string, at: { space: string; x: number; y: number }): string {
  let n = names.get(place);
  if (n !== undefined) return n;
  if (place.startsWith('npc:')) n = npcDef(place as NpcId)?.name ?? '';
  else if (/^(zone|area|region|vil):/.test(place)) n = '';
  else {
    const tx = Math.floor(at.x / TILE_SIZE), ty = Math.floor(at.y / TILE_SIZE);
    // a landmark's rect can start in the next chunk; a piece inside an instance resolves to its door, so it takes the door's name
    const near = objectsAround(at.space, tx, ty, 1), door = (x: WorldObject) => x.kind === 'door' && Math.abs(x.at[0] - tx) + Math.abs(x.at[1] - ty) < 4;
    const o = near.find((x) => x.id === place) ?? near.find((x) => door(x) && x.props?.target === place) ?? near.find(door);
    n = typeof o?.props?.name === 'string' ? o.props.name : typeof o?.props?.label === 'string' && o.kind === 'trigger' ? o.props.label : '';
  }
  names.set(place, n);
  return n;
}

/** The open objectives, resolved; unresolvable ones are dropped (see unresolvedMarkers). Tracked first. */
export function questMarks(npcAt?: NpcAt, here?: string): QuestMark[] {
  const out: QuestMark[] = [];
  for (const m of source()) {
    const at = resolvePlace(m.place, npcAt, here);
    if (at) out.push({ key: `${m.quest}#${m.objective}#${m.place}`, place: m.place, ...at, tracked: m.tracked, side: m.side, label: m.label, name: m.tracked ? placeLabel(m.place, at) : '' });
  }
  return out.sort((a, b) => Number(b.tracked) - Number(a.tracked));
}

/** Objectives whose place the world can't resolve (for Claude 4). */
export function unresolvedMarkers(npcAt?: NpcAt, here?: string): string[] {
  return source().filter((m) => !resolvePlace(m.place, npcAt, here)).map((m) => `${m.quest}#${m.objective} ${m.place}`);
}

/**
 * The open objectives of the player's space for per-frame UI (the minimap redraws every frame): resolved twice a
 * second. `guest`: no local authority fills the marker index while idle, so warm one space per 4 s on quiet frames.
 */
export class QuestMarkFeed {
  private cache: { at: number; marks: QuestMark[] } = { at: -1e9, marks: [] };
  private shops: { at: number; list: { x: number; y: number; forge: boolean }[] } = { at: -1e9, list: [] };
  private warmedAt = 0;
  constructor(private space: () => string, private guest: () => boolean, private npcAt: NpcAt) {}

  /** the merchants present here (minimap coins), every 2 s: presence follows quests and schedules */
  merchants(now: number): { x: number; y: number; forge: boolean }[] {
    if (now - this.shops.at > 2000) this.shops = { at: now, list: merchantsIn(this.space(), this.npcAt) };
    return this.shops.list;
  }

  /** every open objective, seen from this space (the map screen) */
  all(): QuestMark[] { return questMarks(this.npcAt, this.space()); }

  /** the ones in this space; `frameMs`: the last frame's length (warming only on quiet frames) */
  here(now: number, frameMs: number): QuestMark[] {
    if (now - this.cache.at < 500) return this.cache.marks;
    if (this.guest() && now - this.warmedAt > 4000 && frameMs < 20) { this.warmedAt = now; warmMarkers(this.space()); }
    const space = this.space();
    this.cache = { at: now, marks: this.all().filter((m) => m.space === space) };
    return this.cache.marks;
  }
}
