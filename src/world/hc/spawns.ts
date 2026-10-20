/**
 * Ambient enemy spawns (authority only, pure). Zones per space: school realms spawn around zones 2–4 of each
 * start area (level rising with the zone), Concordia around a few anchors per region with that region's
 * creatures and level band. The director keeps zones near players stocked through Services.combat.spawn,
 * scaled by party size, and restocks after enemy:killed with a cooldown. Lairs and bosses live in instances.
 */
import { CHUNK_TILES, Services, TILE_SIZE, bus, evalCondition, getFlag, heroClassId, type WorldObject } from '@/core';
import { MORVANE_REGIONS, MORVANE_ROADS, MORVANE_SCALE } from '@/data/regions/hc/morvane';
import { morvaneRegionAt } from './overview';
import { allCreatures, bestiaryFor } from '@/systems/rules/creatures';
import { spawnCountMult } from '@/systems/rules/curves';
import { elitePack, lairWaves, type EncounterSpawn } from '@/systems/rules/encounters';
import { HC_CAMPAIGN_BOSSES } from '@/data/enemies/hc/campaign';
import { hash2 } from './noise';
import { Corner } from './autotile';
import { OPTIONAL_LEVEL, type RealmGen } from './realmGen';
import type { InstanceGen } from './instanceGen';
import { regionLevels, type ConcordiaGen } from './concordiaGen';
import { objectsAround, tileDist } from './interact';
import { REALMS, spaceRuntime } from './spaces';
import { banded, concordiaBanded, eliteAt, levelAt, stepDone, zoneFloor, type Banded, type LevelTier } from './bands';

export { levelAt as zoneLevelAt, eliteAt as zoneEliteAt };

export interface SpawnZoneDef {
  id: string;
  space: string;
  /** centre (tiles) and radius (tiles) */
  at: [number, number];
  r: number;
  level: [number, number];
  pool: string[];
  /** alive at once for a solo player */
  cap: number;
  /** lair packs: spawn `cap` once per visit (no restock); ambushes only when a player is inside `rect` */
  once?: boolean;
  rect?: [number, number, number, number];
  /** a pack led by an elite whenever it restocks from empty */
  elite?: boolean;
  /** waypoints (tiles) the pack walks, looping, while nothing is in sight */
  patrol?: [number, number][];
  /** lair rooms (Claude 3's lairWaves / elitePack): waves that start when a player steps into `rect`, the next
   * when the last is dead or after WAVE_MS; counts are for one player (scaled by party size here) */
  waves?: EncounterSpawn[][];
  /** realm bands by campaign order (bands.ts): later level bands, each once its Act I main step is done */
  tiers?: LevelTier[];
  /** the class whose campaign this side belongs to (tiers also step with the host's own Act I progress) */
  cls?: string;
  /** which main-quest list a tier's step counts in, and (Concordia) the band per host class: see bands.ts */
  track?: Banded['track'];
  byClass?: Banded['byClass'];
}

const ACTIVE_TILES = 48;     // a zone stocks while a player is this close to its centre
const DESPAWN_TILES = 80;    // and clears when everyone is this far
const MIN_SPAWN_GAP = 9;     // never spawn within this many tiles of a player
const RESPAWN_MS = 45_000;
/** a lair left empty this long fills again; a quick return (a death, a trip out to sell) finds it as it was */
const LAIR_RESET_MS = 5 * 60_000;
const WAVE_MS = 25_000;
const STEP_MS = 1000;

const zoneCache = new Map<string, SpawnZoneDef[]>();

/** The campaign owner's class: the replicated campaign.class flag (the host's, on a guest too), else the hero's. */
const hostClass = (): string | null => (typeof getFlag('campaign.class') === 'string' && getFlag('campaign.class') ? String(getFlag('campaign.class')) : heroClassId());

/** The level band a Morvane region's creatures spawn at now, for this campaign's host and progress (map panel). */
export function regionBandNow(region: string): [number, number] | null {
  const z = spawnZones('concordia').find((x) => x.id.startsWith(`${region}#`)) ?? (region === 'region:heart' ? spawnZones('concordia').find((x) => x.id === 'zone:legion-camp') : undefined);
  if (!z) return null;
  const host = hostClass();
  return levelAt(z, stepDone(host, (q) => evalCondition({ questCompleted: q })), host);
}

/** Spawn zones of a space (cached). */
export function spawnZones(space: string): SpawnZoneDef[] {
  let z = zoneCache.get(space);
  if (!z) zoneCache.set(space, (z = space === 'concordia' ? concordiaZones() : space.startsWith('realm:') ? realmZones(space) : space.startsWith('inst:') ? lairZones(space) : []));
  return z;
}

/** Regions whose bestiary has no rank-and-file yet (only their boss): borrow the nearest fitting one. */
const REGION_FALLBACK: Record<string, string> = { Stormcliffs: 'Thunderreach', 'Morvane Marsh': 'Drowned Abbey' };
function regionPool(region: string): string[] {
  const of = (r: string) => allCreatures().filter((c) => c.tier === 'enemy' && c.region === r).map((c) => c.id);
  const own = of(region);
  return own.length || !REGION_FALLBACK[region] ? own : of(REGION_FALLBACK[region]);
}

/**
 * A lair's rooms: realm lairs and caves fight in Claude 3's waves (main rooms) and elite packs (side rooms), the
 * lair's own creatures a little below its boss; the abbey and the citadel keep plain packs.
 */
function lairZones(space: string): SpawnZoneDef[] {
  const gen = spaceRuntime(space).gen as InstanceGen;
  const d = gen.def;
  const pool = d.region ? regionPool(d.region)
    : space === 'inst:concord-citadel' ? ['bx_concord_0', 'bx_concord_1', 'bx_concord_2']
    : d.palette.startsWith('rc:') ? bestiaryFor(d.palette.slice(3)).filter((c) => c.tier === 'enemy').map((c) => c.id)
      : allCreatures().filter((c) => c.tier === 'enemy' && c.region === 'Drowned Abbey').map((c) => c.id);
  if (!pool.length) return [];
  const lv = d.level ?? Math.max(1, (d.boss?.level ?? 6) - 2);
  const school = d.palette.startsWith('rc:') && space !== 'inst:concord-citadel' && !d.region ? d.palette.slice(3) : null;
  const main = gen.packs.filter((p) => !p.id.includes(':side-'));
  const seed = [...space].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);
  const rooms = school ? lairWaves(school, lv, main.length, 1, seed) : [];
  return gen.packs.map((p, k) => {
    const waves = !school ? undefined : p.id.includes(':side-') ? [elitePack(school, lv, 1, seed + k)] : rooms[main.indexOf(p)]?.waves;
    return {
      id: p.id, space, at: [p.room.x + (p.room.w >> 1), p.room.y + (p.room.h >> 1)] as [number, number], r: Math.max(3, Math.min(p.room.w, p.room.h) / 2 - 1),
      level: [lv, lv + 1] as [number, number], pool, cap: waves ? 999 : p.cap, once: true, elite: p.elite, waves: waves?.length ? waves : undefined,
      rect: waves?.length || p.ambush ? [p.room.x, p.room.y, p.room.w, p.room.h] as [number, number, number, number] : undefined,
    };
  });
}

function realmZones(space: string): SpawnZoneDef[] {
  const gen = spaceRuntime(space).gen as RealmGen;
  const pool = bestiaryFor(gen.school).filter((c) => c.tier === 'enemy').map((c) => c.id);
  if (!pool.length) return [];
  const out: SpawnZoneDef[] = [];
  // levels by campaign order (bands.ts, zoneBands.gen.ts): a side's zone n and its roads share a band group,
  // lair roads the zone they leave from (l1 → 2, l2/l3 → 4), the gate road its own; zone-number bands otherwise
  const S = gen.school;
  const group = (routeId: string, zone: number) => routeId === 'gate-road' ? `${S}-gate` : `${S}-${routeId.split('-')[0]}-z${zone}`;
  for (const [id, at] of gen.zones) {
    const n = Number(id.slice(-1));
    if (n === 1) continue; // the hub village and its fields stay quiet
    const side = id.split('-').slice(-2)[0];
    out.push({ id, space, at, r: 22, ...banded(`${S}-${side}-z${n}`, zoneFloor(n), 'zone'), pool, cap: 5 + n });
  }
  // road patrols: a pack walking the far stretch of each road, a level above the zone it leads to (elite-led from
  // L8 only: Claude 3, no elite walls below ~L8)
  for (const r of gen.patrols) {
    out.push({ id: `patrol:${S}-${r.id}`, space, at: r.a, r: 3, ...banded(group(r.id, r.zone), zoneFloor(r.zone), 'patrol'), pool, cap: 3, patrol: [r.a, r.b] });
  }
  // road camps (PACING: encounter count): a small pack beside every road at 30/60/90% of the way, alternating
  // sides; the first, nearest the hub, a level below the zone the road leads to
  for (const r of gen.routes) {
    const dx = r.b[0] - r.a[0], dy = r.b[1] - r.a[1], len = Math.hypot(dx, dy) || 1;
    [0.3, 0.6, 0.9].forEach((t, k) => {
      const side = k % 2 ? 1 : -1, off = 5;
      const at: [number, number] = [Math.round(r.a[0] + dx * t - (dy / len) * off * side), Math.round(r.a[1] + dy * t + (dx / len) * off * side)];
      out.push({ id: `camp:${S}-${r.id}-${k + 1}`, space, at, r: 4, ...banded(group(r.id, r.zone), zoneFloor(r.zone), t < 0.5 ? 'camp-near' : 'camp'), pool, cap: 3 });
    });
  }
  // optional areas: a pack on the approach (between the area and its nearest road), elite-led to caves from L8;
  // banded by quest order like the zones, since main-quest walks pass them (group <school>-<side>-<kind>)
  for (const [id, o] of gen.optional) {
    if (o.kind === 'ruin') continue;
    const towards = gen.routes.map((r) => [(r.a[0] + r.b[0]) / 2, (r.a[1] + r.b[1]) / 2] as [number, number])
      .sort((a, b) => Math.hypot(a[0] - o.at[0], a[1] - o.at[1]) - Math.hypot(b[0] - o.at[0], b[1] - o.at[1]))[0];
    const d = Math.hypot(towards[0] - o.at[0], towards[1] - o.at[1]) || 1;
    const at: [number, number] = [Math.round(o.at[0] + ((towards[0] - o.at[0]) / d) * 14), Math.round(o.at[1] + ((towards[1] - o.at[1]) / d) * 14)];
    const lv = o.kind === 'cave' ? OPTIONAL_LEVEL.cave - 1 : 6;
    out.push({ id: `guard:${id.slice(5)}`, space, at, r: 4, ...banded(id.slice(5), lv, 'guard', o.kind === 'cave'), pool, cap: 3 });
  }
  // optional ruins: an elite pack a step above the zone beside them, guarding the cache
  for (const [id, o] of gen.optional) {
    if (o.kind !== 'ruin') continue;
    out.push({ id: `pack:${id.slice(5)}`, space, at: o.at, r: o.r - 2, level: [OPTIONAL_LEVEL.ruin, OPTIONAL_LEVEL.ruin + 1], pool, cap: 3, elite: true });
  }
  return out;
}

/**
 * Concordia zones: a few anchors per region, sampled against the region polygons (map px). Never through
 * gen.regionAt here: that builds noise-warped 32×32 region blocks per sample (a 12 s stall, Claude 1's profile).
 */
function concordiaZones(): SpawnZoneDef[] {
  const gen = spaceRuntime('concordia').gen;
  const out: SpawnZoneDef[] = [];
  for (const r of MORVANE_REGIONS) {
    const pool = regionPool(r.name);
    if (!pool.length) continue;
    const [lo] = regionLevels(r);
    // anchors per region (8, 45+ tiles apart): deterministic samples that land inside the region
    let k = 0;
    for (let i = 0; i < 800 && k < 8; i++) {
      const tx = Math.floor(hash2(i, r.id.length, 61) * gen.widthTiles), ty = Math.floor(hash2(r.id.length, i, 62) * gen.heightTiles);
      // well inside the polygon (2 map px margin) so the noise-warped border can't put it in a neighbour
      const mx = tx / MORVANE_SCALE, my = ty / MORVANE_SCALE;
      if ([[0, 0], [2, 0], [-2, 0], [0, 2], [0, -2]].some(([dx, dy]) => morvaneRegionAt(mx + dx, my + dy)?.id !== r.id)) continue;
      if (gen.zoneRule(tx, ty) !== 'wild' || gen.cornerAt(tx, ty) === Corner.WATER) continue; // not in the lakes
      if (out.some((z) => Math.hypot(z.at[0] - tx, z.at[1] - ty) < 45)) continue;
      out.push({ id: `${r.id}#${k++}`, space: 'concordia', at: [tx, ty], r: 18, ...concordiaBanded(r.id, lo, 'zone'), pool, cap: 6 });
    }
  }
  // the Legion camp in the Heart: III-2 needs six Hollow Legionnaires there; a couple of Weeping Shades mixed in (Claude 4)
  const camp = findObject('concordia', 'landmark:legion-camp');
  if (camp) {
    const [w, h] = camp.size ?? [1, 1];
    out.push({ id: 'zone:legion-camp', space: 'concordia', at: [camp.at[0] + (w >> 1), camp.at[1] + (h >> 1)], r: 9, ...concordiaBanded('region:heart', 30, 'zone'),
      pool: ['bx_concord_0', 'bx_concord_0', 'bx_concord_0', 'bx_concord_1'], cap: 7 });
  }
  // road camps (PACING: encounter count): a small pack every 40 tiles along the Morvane roads, alternating sides,
  // at the band of the region underfoot (never the Heart, never on safe ground)
  const roadPts: [number, number][] = [];
  MORVANE_ROADS.forEach((line, li) => {
    let carry = 20, k = 0;
    for (let i = 1; i < line.length; i++) {
      const [ax, ay] = line[i - 1], [bx, by] = line[i], len = Math.hypot(bx - ax, by - ay) || 1;
      for (let d = carry; d < len; d += 40) {
        const t = d / len, side = k % 2 ? 1 : -1;
        const cx = ax + (bx - ax) * t, cy = ay + (by - ay) * t;
        roadPts.push([Math.round(cx), Math.round(cy)]);
        const at: [number, number] = [Math.round(cx - ((by - ay) / len) * 6 * side), Math.round(cy + ((bx - ax) / len) * 6 * side)];
        const r = morvaneRegionAt(at[0] / MORVANE_SCALE, at[1] / MORVANE_SCALE);
        k++;
        if (!r || r.id === 'region:heart' || gen.zoneRule(at[0], at[1]) !== 'wild') continue;
        const pool = regionPool(r.name), [lo] = regionLevels(r);
        if (pool.length) out.push({ id: `camp:morvane-${li}-${k}`, space: 'concordia', at, r: 4, ...concordiaBanded(r.id, lo, 'camp'), pool, cap: 3 });
      }
      carry = (carry - len) % 40; if (carry < 0) carry += 40;
    }
  });
  // optional caves and lookouts: a pack on the approach, 14 tiles towards the nearest road (elite-led to caves)
  for (const [id, o] of (gen as ConcordiaGen).optional) {
    if (o.kind === 'ruin' || !roadPts.length) continue;
    const r = MORVANE_REGIONS.find((x) => x.id === o.region)!, [lo, hi] = regionLevels(r);
    const near = roadPts.reduce((a, b) => (Math.hypot(b[0] - o.at[0], b[1] - o.at[1]) < Math.hypot(a[0] - o.at[0], a[1] - o.at[1]) ? b : a));
    const d = Math.hypot(near[0] - o.at[0], near[1] - o.at[1]) || 1, f = Math.min(14, d / 2);
    const at: [number, number] = [Math.round(o.at[0] + ((near[0] - o.at[0]) / d) * f), Math.round(o.at[1] + ((near[1] - o.at[1]) / d) * f)];
    const pool = regionPool(r.name), lv = o.kind === 'cave' ? hi : lo;
    if (pool.length) out.push({ id: `guard:${id.slice(5)}`, space: 'concordia', at, r: 4, ...concordiaBanded(o.region, lv, 'guard', o.kind === 'cave'), pool, cap: 3 });
  }
  // optional ruins: an elite-led pack at the top of the region band, guarding the cache
  for (const [id, o] of (gen as ConcordiaGen).optional) {
    if (o.kind !== 'ruin') continue;
    const r = MORVANE_REGIONS.find((x) => x.id === o.region)!, [, hi] = regionLevels(r);
    const pool = regionPool(r.name);
    if (pool.length) out.push({ id: `pack:${id.slice(5)}`, space: 'concordia', at: o.at, r: o.r - 2, ...concordiaBanded(o.region, hi - 1, 'pack'), pool, cap: 3 });
  }
  return out;
}

interface ZoneState { alive: Set<string>; cooldownUntil: number; spawned: number; space: string; wave?: number; waveAt?: number }

/** The spawn director: a SimLoop stepper body (call every tick; it works once a second). */
/** An open kill objective with a map marker: its creature spawns at the marker while the objective is open. */
export interface QuestKill { playerId: string; creature: string; count: number; marker?: string }

/** Landmark/object positions across Concordia and the realms (for quest markers), built once. */
const markerIndex = new Map<string, { space: string; at: [number, number] }>();
/**
 * Where a place id is (space + tile): objects and landmarks, instance ids (the door outside), optional areas and
 * story trigger zones, realm zones / areas (their centre) and Morvane regions (their label point).
 */
export function markerAt(id: string): { space: string; at: [number, number] } | null {
  // whatever warmMarkers() hasn't indexed yet is indexed now (the first lookup can cost ~3 s cold)
  if (markerPending().length) {
    const early = markerIndex.get(id);
    if (early) return early;
    while (markerPending().length) indexMarkers(markerPending()[0]);
  }
  return markerLookup(id);
}

const indexed = new Set<string>();
const markerPending = () => ['concordia', ...REALMS.filter((r) => r.school).map((r) => r.space)].filter((s) => !indexed.has(s));

/** Index one more space's markers (call while idle, e.g. one per world tick); false once all are done. */
export function warmMarkers(): boolean {
  const next = markerPending()[0];
  if (!next) return false;
  indexMarkers(next);
  return true;
}

function indexMarkers(space: string): void {
  indexed.add(space);
  const g = spaceRuntime(space).gen;
  for (let cy = 0; cy < Math.ceil(g.heightTiles / CHUNK_TILES); cy++) for (let cx = 0; cx < Math.ceil(g.widthTiles / CHUNK_TILES); cx++) {
    for (const o of g.objects(cx, cy)) {
      const [w, h] = o.size ?? [1, 1];
      if (!markerIndex.has(o.id)) markerIndex.set(o.id, { space, at: [o.at[0] + (w >> 1), o.at[1] + (h >> 1)] });
      // an instance is found at its door, on the tile in front of it
      const t = o.props?.target;
      if (typeof t === 'string' && t.startsWith('inst:') && !markerIndex.has(t)) markerIndex.set(t, { space, at: [o.at[0], o.at[1] + 1] });
    }
  }
  const opt = (g as Partial<RealmGen>).optional, trig = (g as Partial<RealmGen>).triggers;
  for (const [aid, o] of [...(opt ?? []), ...(trig ?? [])]) if (!markerIndex.has(aid)) markerIndex.set(aid, { space, at: o.at });
}

function markerLookup(id: string): { space: string; at: [number, number] } | null {
  const hit = markerIndex.get(id);
  if (hit) return hit;
  // markers can also be places: a realm zone or area (its centre), or a Morvane region (its label point)
  for (const r of REALMS.filter((x) => x.school)) {
    const g = spaceRuntime(r.space).gen as RealmGen;
    const z = g.zones.get(id) ?? g.zones.get(id.replace(/^area:(.*)-(capital|frontier)$/, 'zone:$1-$2-1'));
    if (z) return { space: r.space, at: z };
  }
  const reg = MORVANE_REGIONS.find((x) => x.id === id);
  return reg ? { space: 'concordia', at: [Math.round(reg.label[0] * MORVANE_SCALE), Math.round(reg.label[1] * MORVANE_SCALE)] } : null;
}

export class SpawnDirector {
  private state = new Map<string, ZoneState>();
  /** instance → sim ms it has been empty since */
  private emptySince = new Map<string, number>();
  private acc = 0;
  private t = 0;
  private offKill: () => void;
  /** realm lairs whose boss fell this visit: stepping out of one springs an ambush at its door, once */
  private bossDown = new Set<string>();
  /** one-off zones (lair-exit ambushes) by space, dropped once spent */
  private extra = new Map<string, SpawnZoneDef[]>();

  constructor(
    private players: () => { id: string; space: string; x: number; y: number }[],
    private partySize: () => number,
    /** open kill objectives with markers (story fights): spawned at the marker while open */
    private questKills: () => QuestKill[] = () => [],
  ) {
    const offKilled = bus.on('enemy:killed', (e) => {
      const z = e.zoneId ? this.state.get(e.zoneId) : undefined;
      if (z?.alive.delete(e.enemyId)) z.cooldownUntil = Math.max(z.cooldownUntil, this.t + RESPAWN_MS / Math.max(1, z.alive.size + 1));
      if (e.zoneId && /^boss:[a-z]+-(capital|frontier)-lair-\d$/.test(e.zoneId)) this.bossDown.add(`inst:${e.zoneId.slice(5)}`);
    });
    const offExit = bus.on('instance:exited', (e) => {
      if (!this.bossDown.delete(e.instanceId)) return;
      const d = (spaceRuntime(e.instanceId).gen as InstanceGen).def;
      const school = d.palette.startsWith('rc:') ? d.palette.slice(3) : null;
      if (!d.exit || !school) return;
      const pool = bestiaryFor(school).filter((c) => c.tier === 'enemy').map((c) => c.id);
      const lv = Math.max(1, (d.boss?.level ?? 6) - 1);
      // whoever the boss had been keeping in check comes for the hero on the way out
      const z: SpawnZoneDef = { id: `ambush:${e.instanceId.slice(5)}`, space: d.exit.space, at: [d.exit.at[0], d.exit.at[1] + 8], r: 6, level: [lv, lv + 1], pool, cap: 4, once: true, elite: true };
      this.state.delete(z.id);
      this.extra.set(z.space, [...(this.extra.get(z.space) ?? []).filter((x) => x.id !== z.id), z]);
    });
    this.offKill = () => { offKilled(); offExit(); };
  }

  step(dt: number): void {
    this.t += dt;
    this.acc += dt;
    if (this.acc < STEP_MS) return;
    this.acc = 0;
    const combat = Services.tryGet('combat');
    if (!combat) return;
    const players = this.players();
    const spaces = new Set(players.map((p) => p.space));
    const mult = spawnCountMult(this.partySize());
    // lairs nobody has been in for a while: clear their packs so they fill again on the next visit
    for (const sp of [...this.emptySince.keys()]) if (spaces.has(sp)) this.emptySince.delete(sp);
    for (const st of this.state.values()) {
      if (!st.space.startsWith('inst:') || spaces.has(st.space)) continue;
      if (!this.emptySince.has(st.space)) this.emptySince.set(st.space, this.t);
      if (this.t - this.emptySince.get(st.space)! < LAIR_RESET_MS) continue;
      for (const id of st.alive) combat.despawn(id);
      st.alive.clear();
      st.spawned = 0;
      st.wave = 0;
    }
    // story fights: a small zone of the wanted creature at each open kill objective's marker
    const story = new Map<string, SpawnZoneDef[]>();
    const levels = new Map((combat.players?.() ?? []).map((c) => [c.playerId ?? c.id, c.level]));
    for (const k of this.questKills()) {
      const m = k.marker ? markerAt(k.marker) : null;
      if (!m || !players.some((p) => p.id === k.playerId && p.space === m.space)) continue;
      const lv = levels.get(k.playerId) ?? 1;
      const list = story.get(m.space) ?? [];
      list.push({ id: `quest:${k.marker}:${k.creature}`, space: m.space, at: m.at, r: 8, level: [lv, lv + 1], pool: [k.creature], cap: Math.min(k.count, 4) });
      story.set(m.space, list);
    }
    for (const space of spaces) {
      const here = players.filter((p) => p.space === space);
      // spent ambushes (all spawned and all down) go away
      const ex = this.extra.get(space);
      if (ex) this.extra.set(space, ex.filter((z) => { const st = this.state.get(z.id); return !st || st.spawned < z.cap || st.alive.size > 0; }));
      for (const z of [...spawnZones(space), ...(story.get(space) ?? []), ...(this.extra.get(space) ?? [])]) {
        const st = this.state.get(z.id) ?? { alive: new Set<string>(), cooldownUntil: 0, spawned: 0, space };
        this.state.set(z.id, st);
        const near = Math.min(...here.map((p) => Math.hypot(p.x / TILE_SIZE - z.at[0], p.y / TILE_SIZE - z.at[1])));
        if (near > DESPAWN_TILES && !z.once) {
          for (const id of st.alive) combat.despawn(id);
          st.alive.clear();
          st.spawned = 0; // a lair fills again on the next visit
          continue;
        }
        if (z.once && st.spawned >= Math.round(z.cap * mult)) continue;
        if (z.rect && !here.some((p) => { const tx = p.x / TILE_SIZE, ty = p.y / TILE_SIZE; return tx >= z.rect![0] && ty >= z.rect![1] && tx < z.rect![0] + z.rect![2] && ty < z.rect![1] + z.rect![3]; })) continue;
        if (z.waves) { this.wave(z, st, here, mult); continue; }
        if (near > ACTIVE_TILES || this.t < st.cooldownUntil) continue;
        const want = Math.round(z.cap * mult);
        if (st.alive.size >= want) continue;
        const spot = this.spot(z, here);
        if (!spot) continue;
        const pick = z.pool[Math.floor(Math.random() * z.pool.length)];
        const host = hostClass(), done = stepDone(host, (q) => evalCondition({ questCompleted: q }));
        const [lo, hi] = z.tiers || z.byClass ? levelAt(z, done, host) : z.level;
        const level = lo + Math.floor(Math.random() * (hi - lo + 1));
        // elite packs: one elite leads (the first of each fill)
        const elite = (z.tiers || z.byClass ? eliteAt(z, done, host) : z.elite) && st.alive.size === 0;
        const patrol = z.patrol?.map(([x, y]) => ({ x: x * TILE_SIZE + TILE_SIZE / 2, y: y * TILE_SIZE + TILE_SIZE / 2 }));
        const id = combat.spawn({ creature: pick, level, space, x: spot[0], y: spot[1], zoneId: z.id, tier: 'enemy', ...(elite ? { elite: true } : {}), ...(patrol ? { patrol } : {}) });
        if (id) { st.alive.add(id); st.spawned++; }
      }
    }
  }

  /** A lair room's next wave: the first as a player steps in, then each when the last is down (or after WAVE_MS). */
  private wave(z: SpawnZoneDef, st: ZoneState, here: { x: number; y: number }[], mult: number): void {
    const i = st.wave ?? 0, list = z.waves![i];
    if (!list || (i > 0 && st.alive.size > 0 && this.t - (st.waveAt ?? 0) < WAVE_MS)) return;
    const combat = Services.get('combat');
    const n = Math.max(1, Math.round(list.length * mult));
    let made = 0;
    for (let k = 0; k < n; k++) {
      const e = list[k % list.length];
      const spot = this.spot(z, here, 4);
      if (!spot) continue;
      const id = combat.spawn({ creature: e.creature, level: e.level, space: z.space, x: spot[0], y: spot[1], zoneId: z.id, tier: e.tier ?? 'enemy', ...(e.elite ? { elite: true } : {}) });
      if (id) { st.alive.add(id); st.spawned++; made++; }
    }
    if (made) { st.wave = i + 1; st.waveAt = this.t; }
  }

  /** A walkable 'wild' tile in the zone, out of every player's sight radius (world px). */
  private spot(z: SpawnZoneDef, players: { x: number; y: number }[], gap = MIN_SPAWN_GAP): [number, number] | null {
    const q = Services.get('worlds').query(z.space);
    const rt = spaceRuntime(z.space);
    // a patrol starts at whichever end of its route is farther from everyone (someone standing on one end can't
    // block it); a small zone spawns at its edge rather than nowhere
    const ends = z.patrol?.length ? [...z.patrol] : [z.at];
    const far = (c: [number, number]) => Math.min(...players.map((p) => Math.hypot(p.x / TILE_SIZE - c[0], p.y / TILE_SIZE - c[1])), 1e9);
    const c0 = ends.sort((a, b) => far(b) - far(a))[0];
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * z.r;
      const tx = Math.round(c0[0] + Math.cos(a) * d), ty = Math.round(c0[1] + Math.sin(a) * d);
      // only probe chunks that are already built (the authority prewarms around players); never generate here
      if (!rt.chunk(Math.floor(tx / CHUNK_TILES), Math.floor(ty / CHUNK_TILES), false)) continue;
      // story fights may be in town ("hold the drill yard"); ambient spawns stay out of safe ground
      if (!q.isWalkable(tx, ty) || (!z.id.startsWith('quest:') && q.zoneRule?.(tx, ty) !== 'wild')) continue;
      if (players.some((p) => Math.hypot(p.x / TILE_SIZE - tx, p.y / TILE_SIZE - ty) < gap)) continue;
      return [tx * TILE_SIZE + TILE_SIZE / 2, ty * TILE_SIZE + TILE_SIZE / 2];
    }
    // story fights are small and someone is usually standing on the marker: closer in rather than never
    if ((z.id.startsWith('quest:') || z.id.startsWith('ambush:')) && gap > 5) return this.spot(z, players, 5);
    // a marker in the middle of buildings or a palisade: try a wider ring before giving up
    if ((z.id.startsWith('quest:') || z.id.startsWith('ambush:')) && z.r < 14) return this.spot({ ...z, r: z.r + 6 }, players, gap);
    return null;
  }

  dispose(): void {
    this.offKill();
    const combat = Services.tryGet('combat');
    for (const st of this.state.values()) for (const id of st.alive) combat?.despawn(id);
    this.state.clear();
  }
}

/**
 * Instance bosses: a `boss:<inst>` trigger over the boss room spawns its creature once when a player walks in.
 * A kill (or a nemesis yield) marks it cleared for every player in the instance (persisted through the authority's
 * discover port). A boss the party walked away from keeps its wounds and waits (the systems sim's rule).
 */
export class BossWatch {
  private live = new Map<string, { entity: string; space: string }>();
  private acc = 0;
  private offKill: () => void;

  constructor(
    private players: () => { id: string; space: string; x: number; y: number }[],
    private cleared: (playerId: string, bossId: string) => boolean,
    private clear: (playerId: string, bossId: string) => void,
    private classOf: (playerId: string) => string | null = () => null,
    /** an open story objective wants this creature dead (a boss killed before its stage wakes again for it) */
    private wanted: (playerId: string, creature: string) => boolean = () => false,
  ) {
    // a boss is done when killed, or when a nemesis yields (Claude 3: it stays for the story scene, so we stop
    // tracking it and never despawn it; the story despawns or finishes it)
    const done = (zoneId?: string) => {
      const b = zoneId?.startsWith('boss:') ? this.live.get(zoneId) : undefined;
      if (!b) return;
      this.live.delete(zoneId!);
      for (const p of this.players()) if (p.space === b.space) this.clear(p.id, zoneId!);
    };
    const offKilled = bus.on('enemy:killed', (e) => done(e.zoneId));
    // TODO: typed once Claude 1 adds enemy:yielded to core events
    const loose = bus as unknown as { on(ev: string, fn: (e: { zoneId?: string }) => void): () => void };
    const offYielded = loose.on('enemy:yielded', (e) => done(e.zoneId));
    this.offKill = () => { offKilled(); offYielded(); };
  }

  step(dt: number): void {
    this.acc += dt;
    if (this.acc < 500) return;
    this.acc = 0;
    const combat = Services.tryGet('combat');
    if (!combat) return;
    const players = this.players();
    // bosses keep their wounds and wait when the party leaves (Claude 3); forget one only if the sim lost it
    for (const [id, b] of this.live) {
      if (!combat.entitiesNear(b.space, 0, 0, 1e9, ['enemy']).some((e) => e.id === b.entity)) this.live.delete(id);
    }
    for (const p of players) {
      const tx = Math.floor(p.x / TILE_SIZE), ty = Math.floor(p.y / TILE_SIZE);
      for (const o of objectsAround(p.space, tx, ty)) {
        if (!o.id.startsWith('boss:') || this.live.has(o.id) || tileDist(o, p.x, p.y) > 0) continue;
        if (o.when && !evalCondition(o.when)) continue; // armed by story flags (realm-gate fights)
        const pr = o.props ?? {};
        // a second boss waits for the first (the Black Concord, then the Hollow King)
        if (typeof pr.after === 'string' && !this.cleared(p.id, pr.after)) continue;
        // `class:act3`: the hero's own nemesis in its Act III form (Herald for magic schools, Chimera for martial)
        let creature = String(pr.boss);
        if (creature === 'class:act3') {
          const cls = (this.classOf(p.id) ?? '').replace(/^class:/, '');
          const cb = HC_CAMPAIGN_BOSSES.find((b) => b.classId === cls && (b.slot === 'herald' || b.slot === 'chimera'));
          if (!cb) continue;
          creature = cb.id;
        }
        // cleared stays cleared, unless a quest stage that opened since asks for it (an explorer who walked into
        // the arena before the story sent them there must not soft-lock the quest)
        if (this.cleared(p.id, o.id) && !this.wanted(p.id, creature)) continue;
        const entity = combat.spawn({
          // each boss at its own bestiary tier (a lair-1 mini stays a mini; promoting it is ~3.7× HP)
          creature, level: Number(pr.level) || 10, space: p.space, zoneId: o.id,
          x: Number(pr.x) * TILE_SIZE + TILE_SIZE / 2, y: Number(pr.y) * TILE_SIZE + TILE_SIZE / 2,
        });
        if (entity) {
          this.live.set(o.id, { entity, space: p.space });
          // arena hazards in the boss room (Claude 3's runtime)
          for (const h of objectsAround(p.space, tx, ty, 2)) {
            const hp = h.props;
            if (!h.id.startsWith('hz:') || typeof hp?.hazard !== 'string') continue;
            combat.addHazard?.({ id: h.id, space: p.space, x: h.at[0] * TILE_SIZE + TILE_SIZE / 2, y: (h.at[1] - 1) * TILE_SIZE + TILE_SIZE / 2,
              r: Number(hp.r) || 40, kind: hp.hazard as 'anchor' | 'vent' | 'light' | 'pillar' | 'cover', ...(hp.charges !== undefined ? { charges: Number(hp.charges) } : {}) });
          }
        }
      }
    }
  }

  dispose(): void {
    this.offKill();
    const combat = Services.tryGet('combat');
    for (const b of this.live.values()) combat?.despawn(b.entity);
    this.live.clear();
  }
}

/** An object of a space by id (scans the generator's object lists; cheap, no chunk builds). */
function findObject(space: string, id: string): WorldObject | null {
  const g = spaceRuntime(space).gen;
  for (let cy = 0; cy < Math.ceil(g.heightTiles / CHUNK_TILES); cy++) for (let cx = 0; cx < Math.ceil(g.widthTiles / CHUNK_TILES); cx++) {
    const o = g.objects(cx, cy).find((x) => x.id === id);
    if (o) return o;
  }
  return null;
}
