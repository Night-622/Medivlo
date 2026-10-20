/**
 * World authority (Phaser-free): what runs wherever the simulation runs. The client scene (solo/host) and the
 * public-realm server (one vm context per realm) both call installWorldAuthority. Imports only core, net and
 * pure world code, so it is safe in Node.
 */
import { CHUNK_TILES, Services, TILE_SIZE, bus, type NpcDef, type TimePhase } from '@/core';
import { sim as defaultSim, type SimLoop } from '@/net';
import { handleWorldAct, landmarksAt } from './interact';
import { NpcProvider, npcsIn } from './npcs';
import { BossWatch, SpawnDirector, warmMarkers, zoneTopNow, type QuestKill } from './spawns';
import { allWaystones, placeName, spaceRuntime } from './spaces';
import { optionalName } from '@/data/regions/hc/optionalAreas';
import { prewarm } from './runtime';
import { HcWorldService } from './worldService';

/** One player as the world sim sees it (world px). */
export interface WorldPlayer { id: string; space: string; x: number; y: number }

export interface WorldAuthorityOpts {
  /** the space this authority hosts (a public realm hosts one; solo follows the player's space) */
  space: string;
  /** reserved: the world is fixed-seed today so every client builds identical chunks */
  seed?: number;
  /** players to track this tick (solo: the local player; server: its sessions) */
  players: () => WorldPlayer[];
  /** class id per player (start area / respawn) */
  classOf?: (playerId: string) => string | null;
  /** woken waystones per player, most recent last (server: per account; default: the local GameState) */
  wokenOf?: (playerId: string) => string[];
  /** time of day; defaults to a sim-driven clock (1 real second = 1 game minute) starting at `startHour` */
  clock?: () => { hour: number; phase: TimePhase };
  startHour?: number;
  sim?: SimLoop;
  /** move a player (travel, doors): the server routes this to the systems sim; solo to its player */
  place?: (playerId: string, space: string, x: number, y: number) => void;
  /** why a player may not fast-travel right now (combat, dialogue), or null */
  travelBlocked?: (playerId: string) => string | null;
  /** a player entered a region/area/zone id for the first time this session (persist it per player) */
  discover?: (playerId: string, id: string) => void;
  /** already discovered/cleared (persisted) ids: landmarks fire landmark:discovered once; `boss:<inst>` stays dead */
  known?: (playerId: string, id: string) => boolean;
  /** public realms: keep everyone in `space` (respawns use its waystones; travel to other spaces is refused) */
  confine?: boolean;
  /** servers: build the chunks round every waystone of `space` at install time, so arrivals land on warm ground */
  warmStart?: boolean;
  /** ambient enemy spawns (default true) and NPC snapshot entities (default true) */
  spawns?: boolean;
  /** open kill objectives with markers per player (story fights spawn at the marker); from the narrative */
  questKills?: () => QuestKill[];
  /** NPC snapshot entities: pass Claude 4's npcPlacements() from '@/narrative' (omit for none) */
  npcPlacements?: () => ReadonlyMap<string, readonly NpcDef[]>;
}

export function phaseOf(hour: number): TimePhase {
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 18) return 'day';
  if (hour >= 18 && hour < 20) return 'dusk';
  return 'night';
}

/** Per-player region tracking (region:entered with banner name, area:entered) and landmark discovery. */
export class RegionTracker {
  private at = new Map<string, string>();
  private seen = new Map<string, Set<string>>();
  /** landmarks each player stands in now (presence: landmark:entered / landmark:left) */
  private inside = new Map<string, Set<string>>();
  private spaceOf = new Map<string, string>();
  private tick = 0;

  constructor(
    private clock: () => { hour: number; phase: TimePhase },
    private onFirst?: (playerId: string, id: string) => void,
    private known?: (playerId: string, id: string) => boolean,
  ) {}

  step(players: WorldPlayer[]): void {
    const live = new Set<string>();
    const landmarks = this.tick++ % 6 === 0; // 5 Hz is plenty for walking into a landmark
    for (const p of players) {
      live.add(p.id);
      const was = this.spaceOf.get(p.id);
      if (was !== p.space) {
        // instance presence for quests and narrative (doors, travel or respawn, whichever moved them)
        if (was?.startsWith('inst:')) bus.emit('instance:exited', { playerId: p.id, space: was, instanceId: was });
        if (p.space.startsWith('inst:')) bus.emit('instance:entered', { playerId: p.id, space: p.space, instanceId: p.space });
        this.spaceOf.set(p.id, p.space);
      }
      if (landmarks) this.landmarks(p);
      const id = Services.get('worlds').query(p.space).regionAt(Math.floor(p.x / TILE_SIZE), Math.floor(p.y / TILE_SIZE));
      const key = `${p.space}|${id}`;
      const prevKey = this.at.get(p.id);
      if (prevKey === key) continue;
      this.at.set(p.id, key);
      const prev = prevKey?.startsWith(`${p.space}|`) ? prevKey.slice(p.space.length + 1) : null;
      const { name, subtitle } = placeName(p.space, id);
      const ph = this.clock().phase;
      bus.emit('region:entered', {
        playerId: p.id, space: p.space, regionId: id, prevRegionId: prev,
        name, subtitle: `${subtitle} · ${ph.charAt(0).toUpperCase()}${ph.slice(1)}`,
      });
      if (id.startsWith('area:') || id.startsWith('zone:')) bus.emit('area:entered', { playerId: p.id, space: p.space, triggerId: id });
      this.onFirst?.(p.id, id);
    }
    for (const id of [...this.at.keys()]) if (!live.has(id)) { this.at.delete(id); this.seen.delete(id); this.inside.delete(id); this.spaceOf.delete(id); }
  }

  private landmarks(p: WorldPlayer): void {
    let set = this.seen.get(p.id);
    if (!set) this.seen.set(p.id, (set = new Set()));
    const now = new Set(landmarksAt(p.space, p.x, p.y));
    const before = this.inside.get(p.id) ?? new Set<string>();
    for (const id of before) if (!now.has(id)) bus.emit('landmark:left', { landmarkId: id });
    for (const id of now) if (!before.has(id)) bus.emit('landmark:entered', { landmarkId: id });
    this.inside.set(p.id, now);
    for (const id of now) {
      if (set.has(id)) continue;
      set.add(id);
      if (this.known?.(p.id, id)) continue;
      bus.emit('landmark:discovered', { playerId: p.id, space: p.space, landmarkId: id });
      this.onFirst?.(p.id, id);
    }
  }

  reset(playerId?: string): void {
    if (playerId) { this.at.delete(playerId); this.seen.delete(playerId); } else { this.at.clear(); this.seen.clear(); }
  }
}

export interface WorldAuthority {
  worlds: HcWorldService;
  tracker: RegionTracker;
  uninstall(): void;
}

/** Register Services.world/.worlds and the world stepper (order 100). Returns a handle to uninstall. */
export function installWorldAuthority(opts: WorldAuthorityOpts): WorldAuthority {
  const loop = opts.sim ?? defaultSim;
  const start = (opts.startHour ?? 8) * 60;
  const clock = opts.clock ?? (() => {
    const hour = ((start + loop.time / 1000) / 60) % 24;
    return { hour, phase: phaseOf(hour) };
  });
  spaceRuntime(opts.space); // build the generator up front (fails fast on a bad space id)
  const worlds = new HcWorldService(clock,
    (pid) => opts.players().find((p) => p.id === pid)?.space ?? opts.space,
    opts.classOf ?? (() => null), opts.wokenOf);
  if (opts.confine) worlds.confine = opts.space;
  // co-op: the host is the authority's own player (solo/host); guests join and respawn with the host
  worlds.party = {
    host: () => { const id = Services.tryGet('net')?.localPlayer; return opts.players().find((p) => p.id === id) ?? null; },
    placed: (pid) => opts.players().some((p) => p.id === pid),
  };
  Services.register('worlds', worlds);
  Services.register('world', worlds.query(opts.space));
  const tracker = new RegionTracker(clock, opts.discover, opts.known);
  const net = Services.tryGet('net');
  const director = opts.spawns === false ? null : new SpawnDirector(opts.players, () => net?.partySize() ?? 1, opts.questKills);
  const bosses = new BossWatch(opts.players, (pid, id) => !!opts.known?.(pid, id), (pid, id) => opts.discover?.(pid, id), opts.classOf,
    (pid, creature) => (opts.questKills?.() ?? []).some((k) => k.playerId === pid && k.creature === creature));
  if (opts.warmStart) {
    const rt = spaceRuntime(opts.space);
    for (const w of allWaystones().filter((x) => x.space === opts.space)) {
      const cx = Math.floor(w.at[0] / CHUNK_TILES), cy = Math.floor(w.at[1] / CHUNK_TILES);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (rt.inBounds(cx + dx, cy + dy)) rt.chunk(cx + dx, cy + dy);
    }
  }
  // adaptive: a tick that ran long skips the next warm-up stage (Claude 1)
  let lastMs = 0, tickN = 0;
  const off = loop.add({ name: 'world', order: 100, step: (dt) => {
    const t0 = performance.now(), ps = opts.players();
    const busy = lastMs < 15 && prewarm(spaceRuntime, ps);
    // place index for quest markers, story markers and escorts (placePos): one space per quiet tick once the chunks
    // round the players are warm, the first player's space first (it was unreachable behind the prewarm branch)
    if (!busy && lastMs < 8 && tickN % 30 === 0) warmMarkers(ps[0]?.space);
    tickN++;
    tracker.step(ps); director?.step(dt); bosses.step(dt);
    lastMs = performance.now() - t0;
  } });
  const offNpcs = opts.npcPlacements ? net?.addProvider(new NpcProvider(opts.players, opts.npcPlacements)) : undefined;
  const ports = {
    worlds, classOf: opts.classOf ?? (() => null), travelBlocked: opts.travelBlocked ?? (() => null),
    place: opts.place ?? (() => undefined),
    npcAt: (space: string, npcId: string) => {
      const n = opts.npcPlacements && npcsIn(space, opts.npcPlacements()).find((x) => x.npc.id === npcId);
      return n ? { x: n.x, y: n.y } : null;
    },
    chestLevel: zoneTopNow,
  };
  // a lookout marks its half's ruin and cave on the map (hint:<area>, kept with the found regions)
  const offLook = bus.on('interact', ({ playerId, objectId, props }) => {
    const m = /^obj:([a-z]+(?:-capital|-frontier)?)-view-find$/.exec(objectId);
    if (!m || !props.lookout || !playerId) return;
    const fresh = ['ruin', 'cave'].map((k) => `area:${m[1]}-${k}`).filter((id) => !opts.known?.(playerId, id) && !opts.known?.(playerId, `hint:${id}`));
    for (const id of fresh) opts.discover?.(playerId, `hint:${id}`);
    if (fresh.length) bus.emit('narrative:toast', { text: `Marked on your map: ${fresh.map((id) => optionalName(id)?.name ?? id).join(', ')}`, kind: 'info' });
  });
  // realm visitors and guests take the hour from here (sent on join and on request; clients advance it locally)
  const offSync = net?.addStateSync({ name: 'world-clock', collect: () => ({ hour: clock().hour }), apply: () => undefined });
  const offAct = net?.onClient('act', (msg, from) => {
    if (msg.domain !== 'world') return;
    const me = opts.players().find((p) => p.id === from);
    if (me) handleWorldAct(ports, me, msg.action, msg.args);
  });
  return { worlds, tracker, uninstall: () => { off(); offLook(); offAct?.(); offSync?.(); offNpcs?.(); director?.dispose(); bosses.dispose(); } };
}
