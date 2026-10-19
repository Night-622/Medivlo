/**
 * World object use on the authority (pure): act { domain: 'world', action: 'use' | 'wake' | 'travel' }.
 * Validates range and conditions, then wakes waystones, opens doors (place the player), rests, and emits
 * `interact` for everything (quests, NPC talk, lore). Also landmark discovery for the region tracker.
 */
import { CHUNK_TILES, TILE_SIZE, bus, classSchool, evalCondition, type WorldObject } from '@/core';
import { InstanceGen } from './instanceGen';
import { allWaystones, knownSpace, spaceRuntime } from './spaces';
import { standBeside, type HcWorldService } from './worldService';

/** Kinds a player can use with the interact key. */
export const USABLE = new Set<WorldObject['kind']>(['waystone', 'door', 'interactable', 'npc-anchor', 'chest', 'lever', 'sign', 'lore']);
/** Max distance (tiles, centre to object tile) for using an object. */
export const USE_RANGE = 2.5;

export interface Actor { id: string; space: string; x: number; y: number }

export interface InteractPorts {
  worlds: HcWorldService;
  classOf: (playerId: string) => string | null;
  travelBlocked: (playerId: string) => string | null;
  place: (playerId: string, space: string, x: number, y: number) => void;
  /** where an NPC stands in a space now (world px), for talking to NPCs that have no anchor object */
  npcAt?: (space: string, npcId: string) => { x: number; y: number } | null;
}

const toast = (text: string) => bus.emit('narrative:toast', { text, kind: 'info' });

/** Objects of a space whose chunk lies within `r` chunks of a tile. */
export function objectsAround(space: string, tx: number, ty: number, r = 1): WorldObject[] {
  const gen = spaceRuntime(space).gen;
  const cx = Math.floor(tx / CHUNK_TILES), cy = Math.floor(ty / CHUNK_TILES);
  const out: WorldObject[] = [];
  for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) out.push(...gen.objects(x, y));
  return out;
}

/** Distance in tiles from a world-px point to an object's tile (or rect). */
export function tileDist(o: WorldObject, x: number, y: number): number {
  const px = x / TILE_SIZE, py = y / TILE_SIZE;
  const [w, h] = o.size ?? [1, 1];
  const dx = Math.max(o.at[0] - px, 0, px - (o.at[0] + w)), dy = Math.max(o.at[1] - py, 0, py - (o.at[1] + h));
  return Math.hypot(dx, dy);
}

export const usableNow = (o: WorldObject): boolean => USABLE.has(o.kind) && (!o.when || evalCondition(o.when));

export function handleWorldAct(p: InteractPorts, me: Actor, action: string, args: Record<string, string | number | boolean>): void {
  if (action === 'travel') { travel(p, me, String(args.waystone)); return; }
  const id = String(args.id ?? args.waystone ?? '');
  // talking to an NPC entity (any NPC, anchored or standing on a landmark): validated against where it stands
  if (id.startsWith('npc:')) {
    const at = p.npcAt?.(me.space, id);
    // NPCs stand in rows on busy landmarks, so allow a tile more than for objects
    if (at && Math.hypot(at.x - me.x, at.y - me.y) <= (USE_RANGE + 1) * TILE_SIZE) {
      bus.emit('interact', { playerId: me.id, objectId: `npc-anchor:${id.slice(4)}`, kind: 'npc-anchor', props: { npc: id } });
    }
    return;
  }
  const o = objectsAround(me.space, Math.floor(me.x / TILE_SIZE), Math.floor(me.y / TILE_SIZE)).find((x) => x.id === id);
  if (!o || !usableNow(o) || tileDist(o, me.x, me.y) > USE_RANGE) return;
  use(p, me, o);
}

function use(p: InteractPorts, me: Actor, o: WorldObject): void {
  const props = o.props ?? {};
  switch (o.kind) {
    case 'waystone': {
      const was = p.worlds.isWoken(me.id, o.id);
      p.worlds.wakeWaystone(me.id, o.id);
      if (!was) toast(`Waystone woken: ${props.name ?? o.id}`);
      break;
    }
    case 'door': door(p, me, o);
      break;
    case 'interactable':
      if (props.rest) bus.emit('world:rest', { pointId: o.id });
      break;
    default:
      break;
  }
  bus.emit('interact', { playerId: me.id, objectId: o.id, kind: o.kind, props });
}

function door(p: InteractPorts, me: Actor, o: WorldObject): void {
  const props = o.props ?? {};
  const target = String(props.target ?? '');
  if (typeof props.school === 'string' && classSchool(p.classOf(me.id) ?? '') !== props.school) {
    toast('This arch answers to another school.');
    return;
  }
  const into = target.startsWith('space:') ? target.slice(6) : target;
  if (!knownSpace(into)) { toast(`${props.name ?? 'The way'} is sealed for now.`); return; }
  if (p.worlds.confine && into !== p.worlds.confine) { toast('That way leads beyond this realm.'); return; }
  // where to arrive: explicit tile (instance exits), an instance's entrance, the named waystone, else the centre
  const gen = spaceRuntime(into).gen;
  let at: [number, number];
  if (typeof props.x === 'number' && typeof props.y === 'number') at = [props.x, props.y];
  else if (gen instanceof InstanceGen) at = gen.entrance;
  else at = allWaystones().find((w) => w.id === props.entrance && w.space === into)?.at ?? [gen.widthTiles >> 1, gen.heightTiles >> 1];
  const spot = standBeside(p.worlds.query(into), at[0], at[1]);
  if (into !== me.space) bus.emit('space:changed', { playerId: me.id, from: me.space, to: into });
  p.place(me.id, into, spot.x, spot.y);
}

function travel(p: InteractPorts, me: Actor, waystone: string): void {
  const ws = allWaystones().find((w) => w.id === waystone);
  if (!ws) return;
  const blocked = p.travelBlocked(me.id);
  if (p.worlds.confine && ws.space !== p.worlds.confine) { toast('That waystone lies beyond this realm.'); return; }
  // TODO(net): per-player toasts once events can target one player; in solo they reach the local HUD
  if (!p.worlds.isWoken(me.id, ws.id) || blocked) { toast(blocked ?? `${ws.name} is asleep. Wake it by hand first.`); return; }
  const spot = standBeside(p.worlds.query(ws.space), ws.at[0], ws.at[1]);
  if (ws.space !== me.space) bus.emit('space:changed', { playerId: me.id, from: me.space, to: ws.space });
  p.place(me.id, ws.space, spot.x, spot.y);
}

/** Landmark triggers (props.landmark) containing a player's tile. */
export function landmarksAt(space: string, x: number, y: number): string[] {
  const tx = Math.floor(x / TILE_SIZE), ty = Math.floor(y / TILE_SIZE);
  return objectsAround(space, tx, ty).filter((o) => o.kind === 'trigger' && o.props?.landmark && tileDist(o, x, y) === 0).map((o) => o.id);
}
