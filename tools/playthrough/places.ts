/**
 * Where things are, for the playthrough bot: any objective target id → { space, tile }. Built from the real
 * generators (objects, zones, villages, waystones, instance doors), NPC placements and spawn/boss tables.
 */
import type { NpcDef, WorldObject } from '@/core';
import { MORVANE_REGIONS, MORVANE_SCALE } from '@/data/regions/hc/morvane';
import { HC_CAMPAIGN_BOSSES } from '@/data/enemies/hc/campaign';
import { npcsIn } from '@/world/hc/npcs';
import { AREAS, REALMS, allWaystones, entryWaystone, instanceDef, spaceRuntime } from '@/world/hc/spaces';
import { spawnZones } from '@/world/hc/spawns';
import type { InstanceGen } from '@/world/hc/instanceGen';
import type { RealmGen } from '@/world/hc/realmGen';

export interface Spot { space: string; at: [number, number]; obj?: WorldObject }

export const MAIN_SPACES = [...REALMS.filter((r) => r.school).map((r) => r.space), 'concordia'];
const objects = new Map<string, Spot>();
let built = false;

function index(space: string): void {
  const g = spaceRuntime(space).gen;
  for (let cy = 0; cy < Math.ceil(g.heightTiles / 32); cy++) for (let cx = 0; cx < Math.ceil(g.widthTiles / 32); cx++) {
    for (const o of g.objects(cx, cy)) {
      const [w, h] = o.size ?? [1, 1];
      const at: [number, number] = [o.at[0] + (w >> 1), o.at[1] + (h >> 1)];
      if (!objects.has(o.id)) objects.set(o.id, { space, at, obj: o });
    }
  }
}

function ensure(): void {
  if (built) return;
  built = true;
  for (const s of MAIN_SPACES) index(s);
}

/** Index an instance's objects the first time the bot needs them. */
export function indexInstance(id: string): void {
  if (!objects.has(`__inst:${id}`)) { index(id); objects.set(`__inst:${id}`, { space: id, at: [0, 0] }); }
}

/** Which instance holds a set piece (from every instance a door leads to). */
let homes: Map<string, string> | null = null;
function pieceHome(id: string): string | null {
  if (!homes) {
    homes = new Map();
    for (const sp of objects.values()) {
      const t = sp.obj?.props?.target;
      if (typeof t !== 'string' || !t.startsWith('inst:')) continue;
      for (const p of instanceDef(t)?.pieces ?? []) homes.set(p.id, t);
    }
  }
  return homes.get(id) ?? null;
}

/** The outdoor door that leads into an instance (its parent space and tile). */
export function doorInto(inst: string): Spot | null {
  ensure();
  for (const s of objects.values()) if (s.obj?.props?.target === inst) return s;
  return null;
}

/** Resolve a place/object id to a spot (null when the world doesn't know it). */
export function where(id: string): Spot | null {
  ensure();
  const hit = objects.get(id);
  if (hit) return hit;
  // set pieces that live inside an instance (half-stones, lair relics): index that instance on demand
  const inst = pieceHome(id);
  if (inst) { indexInstance(inst); const h = objects.get(id); if (h) return h; }
  if (id === 'concordia' || id.startsWith('realm:')) {
    const w = entryWaystone(id);
    return w ? { space: id, at: w.at } : null;
  }
  if (id.startsWith('inst:')) {
    const d = instanceDef(id);
    if (!d) return null;
    const g = spaceRuntime(id).gen as InstanceGen;
    return { space: id, at: g.entrance };
  }
  const ws = allWaystones().find((w) => w.id === id);
  if (ws) return { space: ws.space, at: ws.at };
  if (id.startsWith('zone:') || id.startsWith('area:') || id.startsWith('vil:')) {
    for (const r of REALMS.filter((x) => x.school)) {
      const g = spaceRuntime(r.space).gen as RealmGen;
      const z = g.zones.get(id) ?? g.zones.get(id.replace(/^area:(.*)-(capital|frontier)$/, 'zone:$1-$2-1'));
      if (z) return { space: r.space, at: z };
      if (id === `area:${g.school}-gate`) return { space: r.space, at: [192, 52] };
      const v = g.villages.find((x) => x.id === id);
      if (v) return { space: r.space, at: v.at };
    }
    const cv = (spaceRuntime('concordia').gen as unknown as { data: { villages: { id: string; at: [number, number] }[] } }).data.villages.find((v) => v.id === id);
    if (cv) return { space: 'concordia', at: cv.at };
  }
  if (id.startsWith('region:')) {
    const r = MORVANE_REGIONS.find((x) => x.id === id);
    if (r) return { space: 'concordia', at: [Math.round(r.label[0] * MORVANE_SCALE), Math.round(r.label[1] * MORVANE_SCALE)] };
  }
  return null;
}

/** Where an NPC stands now (any main space), from the same placement the NPC snapshots use. */
export function whereNpc(npcId: string, placements: ReadonlyMap<string, readonly NpcDef[]>): Spot | null {
  for (const s of MAIN_SPACES) {
    const n = npcsIn(s, placements).find((x) => x.npc.id === npcId);
    if (n) return { space: s, at: [Math.floor(n.x / 32), Math.floor(n.y / 32)] };
  }
  return null;
}

/** Where a creature can be fought: a boss trigger that spawns it, else a spawn zone whose pool has it. */
export function whereCreature(creature: string, classId: string, near?: { space: string; x: number; y: number }): Spot | null {
  ensure();
  const act3 = HC_CAMPAIGN_BOSSES.find((b) => b.classId === classId && (b.slot === 'herald' || b.slot === 'chimera'))?.id;
  for (const s of objects.values()) {
    const b = s.obj?.props?.boss;
    if (s.obj?.id.startsWith('boss:') && (b === creature || (b === 'class:act3' && act3 === creature))) return s;
  }
  // instance bosses (lairs, Sentinels, the citadel): their boss room
  for (const s of objects.values()) {
    const t = s.obj?.props?.target;
    if (typeof t !== 'string' || !t.startsWith('inst:')) continue;
    const d = instanceDef(t);
    if (d?.boss?.creature === creature || d?.boss2?.creature === creature) {
      const g = spaceRuntime(t).gen as InstanceGen;
      const r = g.bossRoom;
      return { space: t, at: [r.x + (r.w >> 1), r.y + r.h - 3] };
    }
  }
  // spawn zones: the nearest one in the hero's own space first
  const spaces = near ? [near.space, ...MAIN_SPACES.filter((s) => s !== near.space)] : MAIN_SPACES;
  for (const space of spaces) {
    // ambient zones first: patrols walk off and elite packs (ruins, lairs) are not where a quest's creatures live
    const all = spawnZones(space).filter((x) => x.pool.includes(creature));
    const plain = all.filter((x) => x.id.startsWith('zone:'));
    const zs = plain.length ? plain : all;
    if (!zs.length) continue;
    if (near && space === near.space) zs.sort((a, b) => Math.hypot(a.at[0] - near.x / 32, a.at[1] - near.y / 32) - Math.hypot(b.at[0] - near.x / 32, b.at[1] - near.y / 32));
    return { space, at: zs[0].at };
  }
  return null;
}

export { AREAS };
