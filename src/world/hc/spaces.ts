/**
 * The space registry: builds the generator for any space id from the Hollow Crown data. Pure, shared by
 * clients and the public-realm server.
 */
import { AREAS } from '@/data/regions/hc/areas';
import { SET_PIECES } from '@/data/regions/hc/landmarks';
import { SENTINELS } from '@/data/regions/hc/sentinels';
import { INSTANCE_EXTRA, INSTANCE_ROOMS, RETIRED, SET_PIECES_EXTRA } from '@/data/regions/hc/setPiecesExtra';
import {
  MORVANE_MAP_H, MORVANE_MAP_W, MORVANE_REGIONS, MORVANE_RIVER, MORVANE_ROADS, MORVANE_SCALE, MORVANE_VILLAGES, MORVANE_WAYSTONES,
} from '@/data/regions/hc/morvane';
import REALMS from '@/data/regions/hc/realms';
import { ConcordiaGen, regionLevels, regionPalette } from './concordiaGen';
import { ARENAS, ArenaGen } from './arenaGen';
import { InstanceGen, lairBoss, type InstanceDef } from './instanceGen';
import { GATE_NAMES, OPTIONAL_LEVEL, RealmGen, realmWaystones } from './realmGen';
import { optionalName } from '@/data/regions/hc/optionalAreas';
import { SpaceRuntime } from './runtime';
import type { SpaceGen } from './space';
import type { RealmDef, SchoolId, WaystoneDef } from './types';

export { REALMS, AREAS, ARENAS };

const runtimes = new Map<string, SpaceRuntime>();

export function realmOf(space: string): RealmDef | undefined {
  return REALMS.find((r) => r.space === space);
}

/** Generator for a space id (`realm:<school>`, `concordia` or `arena:<id>`). Instances come later. */
export function makeGen(space: string): SpaceGen {
  if (space === 'concordia') {
    return new ConcordiaGen({
      regions: MORVANE_REGIONS, villages: MORVANE_VILLAGES, waystones: MORVANE_WAYSTONES, river: MORVANE_RIVER, roads: MORVANE_ROADS,
      scale: MORVANE_SCALE, mapW: MORVANE_MAP_W, mapH: MORVANE_MAP_H,
    });
  }
  const arena = ARENAS.find((a) => a.id === space);
  if (arena) return new ArenaGen(arena);
  const inst = space.startsWith('inst:') ? instanceDef(space) : null;
  if (inst) return new InstanceGen(inst);
  const realm = realmOf(space);
  if (!realm?.school) throw new Error(`[world] unknown space "${space}"`);
  return new RealmGen(realm, AREAS, [...SET_PIECES, ...SET_PIECES_EXTRA].filter((p) => !RETIRED.has(p.id)));
}

/** Shared runtime per space (one chunk cache and query per space per process). */
export function spaceRuntime(space: string): SpaceRuntime {
  let rt = runtimes.get(space);
  if (!rt) runtimes.set(space, (rt = new SpaceRuntime(makeGen(space))));
  return rt;
}

/** Every waystone in the world. */
export function allWaystones(): WaystoneDef[] {
  const out: WaystoneDef[] = [...(spaceRuntime('concordia').gen as ConcordiaGen).waystones];
  for (const r of REALMS) if (r.school) out.push(...realmWaystones(r, AREAS));
  for (const a of ARENAS) out.push(...(spaceRuntime(a.id).gen as ArenaGen).waystones);
  return out;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Display name and banner subline for a region/area/zone id of a space ('' when unknown). */
export function placeName(space: string, id: string): { name: string; subtitle: string } {
  if (space.startsWith('inst:')) {
    const d = instanceDef(space);
    if (id.endsWith('-heart')) return { name: cap(d?.name ?? 'Below'), subtitle: 'Deeper in' };
    const parent = d?.exit?.space;
    return { name: cap(d?.name ?? 'Below'), subtitle: parent === 'concordia' ? 'Morvane' : realmOf(parent ?? '')?.name ?? 'Below' };
  }
  const arena = ARENAS.find((a) => a.id === space);
  if (arena) return { name: arena.name, subtitle: 'Arena' };
  const realm = realmOf(space);
  if (space === 'concordia' || !realm?.school) {
    const opt = optionalName(id);
    if (opt) return { name: opt.name, subtitle: `${opt.subtitle} · Morvane` };
    const r = MORVANE_REGIONS.find((x) => x.id === id);
    return { name: r?.name ?? 'Morvane', subtitle: 'Morvane' };
  }
  const opt = optionalName(id);
  if (opt) return { name: opt.name, subtitle: `${opt.subtitle} · ${realm.name}` };
  const m = /^(area|zone):([a-z]+)-(capital|frontier|gate)(?:-(\d))?$/.exec(id);
  if (!m) return { name: realm.name, subtitle: realm.name };
  const [, kind, school, side, i] = m;
  if (side === 'gate') return { name: GATE_NAMES[school as keyof typeof GATE_NAMES] ?? 'The Realm Gate', subtitle: realm.name };
  const area = AREAS.find((a) => a.id === `area:${school}-${side}`);
  if (kind === 'zone' && area) return { name: cap(area.zones[Number(i) - 1]?.name ?? area.title), subtitle: `${cap(area.title)} · ${realm.name}` };
  return { name: cap(area?.title ?? realm.capital), subtitle: realm.name };
}

/** Where a player enters a space with no saved position: its first lit waystone. */
export function entryWaystone(space: string): WaystoneDef | undefined {
  const list = allWaystones().filter((w) => w.space === space);
  return list.find((w) => w.startsLit) ?? list[0];
}

/** The outdoor door (tile below it) that leads into an instance, by scanning its parent space's objects. */
function doorInto(parent: string, target: string): [number, number] | null {
  const gen = spaceRuntime(parent).gen;
  for (let cy = 0; cy < Math.ceil(gen.heightTiles / 32); cy++) for (let cx = 0; cx < Math.ceil(gen.widthTiles / 32); cx++) {
    const o = gen.objects(cx, cy).find((x) => x.props?.target === target);
    if (o) return [o.at[0], o.at[1] + 1];
  }
  return null;
}

const instCache = new Map<string, InstanceDef | null>();

/** Definition of an instance id, or null when it isn't one we build (cached: it scans the parent space for its door). */
export function instanceDef(id: string): InstanceDef | null {
  if (!instCache.has(id)) {
    const d = buildInstanceDef(id);
    // campaign extras that live inside (setPiecesExtra INSTANCE_EXTRA)
    if (d) d.pieces = [...d.pieces, ...(INSTANCE_EXTRA[id] ?? []).map((p) => ({ id: p, area: 'area:concordia' as const, where: 'boss', note: '' })),
      ...(INSTANCE_ROOMS[id] ?? []).map((p) => ({ id: p, area: 'area:concordia' as const, where: 'boss', note: 'rooms' }))];
    instCache.set(id, d);
  }
  return instCache.get(id)!;
}

function buildInstanceDef(id: string): InstanceDef | null {
  // optional caves (PACING pass 2): five rooms in the realm's palette, an ambush in the middle, a cache at the end
  // Morvane caves: the region's palette and creatures, a step above its band
  const mcave = /^inst:([a-z]+)-cave$/.exec(id);
  if (mcave) {
    const r = MORVANE_REGIONS.find((x) => x.id === `region:${mcave[1]}`);
    if (!r) return null;
    const base = `${mcave[1]}-cave`, name = optionalName(`area:${base}`)!.name;
    return { id, name, palette: regionPalette(r.id), rooms: 5, exit: (() => { const at = doorInto('concordia', id); return at && { space: 'concordia', at }; })(),
      pieces: [], theme: 'a cave', level: regionLevels(r)[1] + 1, region: r.name, finale: { base, name } };
  }
  const cave = /^inst:([a-z]+)-(capital|frontier)-cave$/.exec(id);
  if (cave) {
    const [, school, side] = cave, space = `realm:${school}`, base = `${school}-${side}-cave`;
    if (!realmOf(space)) return null;
    const name = optionalName(`area:${base}`)!.name;
    return { id, name, palette: `rc:${school as SchoolId}`, rooms: 5, exit: (() => { const at = doorInto(space, id); return at && { space, at }; })(),
      pieces: [], theme: 'a cave', level: OPTIONAL_LEVEL.cave, finale: { base, name } };
  }
  const lair = /^inst:([a-z]+)-(capital|frontier)-lair-(\d)$/.exec(id);
  if (lair) {
    const [, school, side, nStr] = lair;
    const n = Number(nStr), space = `realm:${school}`;
    const realm = realmOf(space), area = AREAS.find((a) => a.id === `area:${school}-${side}`);
    if (!realm || !area) return null;
    const at = doorInto(space, id);
    return {
      id, name: area.lairs[n - 1]?.name ?? 'Lair', palette: `rc:${school as SchoolId}`, rooms: [6, 7, 8][n - 1] ?? 7,
      exit: at && { space, at }, boss: lairBoss(school, side as 'capital' | 'frontier', n, area.className),
      theme: area.lairs[n - 1]?.theme,
      pieces: (spaceRuntime(space).gen as RealmGen).lairPieces.get(id) ?? [],
    };
  }
  const concordia = (name: string, palette: InstanceDef['palette'], rooms: number, boss?: InstanceDef['boss'], drowned = false): InstanceDef => {
    const at = doorInto('concordia', id);
    return { id, name, palette, rooms, exit: at && { space: 'concordia', at }, boss, pieces: [], drowned };
  };
  if (id === 'inst:varric-barrow') return { ...concordia("Bonelord Varric's Barrow", 'rc:umbral', 7, { creature: 'bx_varric', level: 16 }), theme: 'a barrow crypt' };
  if (id === 'inst:drowned-abbey') {
    const d = concordia('The Drowned Nave', 'village', 8, { creature: 'bx_morwen', level: 22 }, true);
    d.pieces = [{ id: 'obj:abbey-clapper', area: 'area:concordia', where: 'boss', note: 'the altar of the drowned nave' }];
    return d;
  }
  if (id === 'inst:concord-citadel') {
    // the throne room: the Black Concord, then the Hollow King (who yields; Claude 4 ends it)
    const d = concordia('The Concord Citadel', 'rc:radiance', 9, { creature: 'bx_concord_5', level: 38 });
    d.boss2 = { creature: 'bx_hollowking', level: 40 };
    d.pieces = ['landmark:citadel-throne', 'obj:crown-cage', 'obj:citadel-throne-door'].map((p) => ({ id: p, area: 'area:concordia', where: 'boss', note: 'the throne room' }));
    return d;
  }
  const sentinel = SENTINELS.find((s) => s.inst === id);
  if (sentinel) {
    const lv = MORVANE_REGIONS.find((r) => r.id === sentinel.region)?.levels.split(/[–-]/).map((x) => parseInt(x, 10)) ?? [14, 18];
    // Sentinels are Act II bosses (band 14–28): a little above their region, never below 15
    const sd = concordia(sentinel.name, `rc:${sentinel.palette}`, 8, { creature: sentinel.boss, level: Math.max(15, (lv[1] || lv[0]) + 2) }, !!sentinel.drowned);
    sd.theme = sentinel.name;
    return sd;
  }
  return null;
}

/** Is this a space we can generate? */
export function knownSpace(id: string): boolean {
  return id === 'concordia' || !!realmOf(id)?.school || ARENAS.some((a) => a.id === id) || (id.startsWith('inst:') && !!instanceDef(id));
}
