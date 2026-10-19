/**
 * Overworld + instance scene (Claude 2). One scene handles both: an instance floor is just a different ChunkProvider.
 * Contracts: launches the HUD, registers Services.world, emits world:ready.
 */
import Phaser from 'phaser';
import {
  CHUNK_TILES, Game, Registry, SceneKeys, Services, TILE_SIZE, bus,
  type LandmarkDef, type SpawnZone, type Tier,
} from '@/core';
import { npcsAt, progress, questDef, activeQuests } from '@/narrative';
import { createPlayer } from '@/systems';
import type { HudScene } from '@/ui/hud/HudScene';
import { Minimap, type MinimapMarker } from '@/ui/map/Minimap';
import { WorldMap } from '@/ui/map/WorldMap';
import { buildWorldMapSource } from '@/world/worldMapSource';
import { ChunkManager } from '@/world/ChunkManager';
import { InstanceProvider, OverworldProvider } from '@/world/chunkGen';
import { WorldQueryImpl } from '@/world/collision';
import { Discovery } from '@/world/discovery';
import { WorldModel } from '@/world/model';
import { SpawnManager } from '@/world/SpawnManager';
import { TempPlayer } from '@/world/TempPlayer';
import { WorldClock } from '@/world/WorldClock';
import { WorldObjects, type TravelRequest } from '@/world/WorldObjects';
import { NpcLayer } from '@/world/NpcLayer';
import { seepZones } from '@/world/seeps';
import { auditWorld } from '@/world/devAudit';

/** New games start just outside Hollis cottage: the player lodges with the Hollises (Claude 4's prologue). */
const START_LANDMARK = 'landmark:hollis-cottage';

interface PlayerLike { readonly sprite: Phaser.GameObjects.Image; readonly x: number; readonly y: number; teleport(x: number, y: number): void; destroy(): void }

let model: WorldModel | null = null;

export class WorldScene extends Phaser.Scene {
  private chunks!: ChunkManager;
  private clock!: WorldClock;
  private query!: WorldQueryImpl;
  private spawns!: SpawnManager;
  private discovery!: Discovery;
  private objects!: WorldObjects;
  private npcs!: NpcLayer;
  private player!: PlayerLike;
  private temp: TempPlayer | null = null;
  private minimap: Minimap | null = null;
  private worldMap: WorldMap | null = null;
  private landmarks: LandmarkDef[] = [];
  private regionName = '';
  private travelling = false;
  private inCombat = false;
  /** World-side update cost (dev: __world.perf()). */
  private perf = { frames: 0, worldMs: 0, maxMs: 0 };

  constructor() { super(SceneKeys.World); }

  create(): void {
    Registry.load();
    model ??= new WorldModel();
    const m = model;
    const loc = Game.state.world.location;
    this.travelling = false;
    if (import.meta.env.DEV) this.applyDevParams();

    let zones: { zone: SpawnZone; tier: Tier }[] = [];
    if (loc.instance === 'overworld') {
      this.chunks = new ChunkManager(this, new OverworldProvider(m));
      for (const r of m.regions.values()) {
        r.spawnZones.forEach((zone) => zones.push({ zone, tier: r.tier }));
        zones.push(...seepZones(r));
        this.landmarks.push(...r.landmarks);
      }
      if (loc.x === 0 && loc.y === 0) {
        const start = this.landmarks.find((l) => l.id === START_LANDMARK);
        const [tx, ty] = start ? [start.at[0], start.at[1] + 2] : [960, 1020];
        Object.assign(loc, { x: tx * TILE_SIZE + TILE_SIZE / 2, y: ty * TILE_SIZE + TILE_SIZE / 2 });
      }
      this.cameras.main.setBackgroundColor(0x24485e);
    } else {
      const inst = m.instances.get(loc.instance);
      const floor = inst?.floors.find((f) => f.id === loc.floor) ?? inst?.floors[0];
      const overlay = floor && m.overlays.get(floor.overlay);
      if (!inst || !floor || !overlay) {
        console.error(`[world] bad instance location ${loc.instance}/${loc.floor}; returning to overworld`);
        Object.assign(loc, { instance: 'overworld', floor: undefined, x: Game.state.world.lastOverworld.x, y: Game.state.world.lastOverworld.y });
        this.scene.restart();
        return;
      }
      const regionId = m.regionAt(inst.exit[0], inst.exit[1])?.id ?? '';
      this.chunks = new ChunkManager(this, new InstanceProvider(overlay, regionId, inst.biome));
      zones = floor.spawnZones.map((zone) => ({ zone, tier: inst.tier }));
      this.landmarks = floor.landmarks ?? [];
      this.regionName = inst.name;
      this.cameras.main.setBackgroundColor(0x0e0b08);
    }

    this.clock = new WorldClock(this);
    this.query = new WorldQueryImpl(this.chunks, this.clock);
    Services.register('world', this.query);
    this.chunks.update(Math.floor(loc.x / TILE_SIZE), Math.floor(loc.y / TILE_SIZE), true);

    this.objects = new WorldObjects(this);
    this.objects.onTravel = (req) => this.travel(req);
    this.npcs = new NpcLayer(this, (landmarkId) => npcsAt(landmarkId).map((d) => ({ id: d.id, name: d.name, look: d.look })));
    this.objects.extraFocus = () => this.npcs.focusables();
    this.chunks.onShow = (c) => { this.objects.show(c); this.npcs.show(c); };
    this.chunks.onHide = (c) => { this.objects.hide(c); this.npcs.hide(c); };
    for (const c of this.chunks.liveChunks()) { this.objects.show(c); this.npcs.show(c); }
    for (const ev of ['flag:changed', 'quest:advanced', 'time:phase-changed'] as const) bus.onScene(this, ev, () => this.npcs.refresh());

    this.player = this.spawnPlayer(loc.x, loc.y);
    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.chunks.provider.widthTiles * TILE_SIZE, this.chunks.provider.heightTiles * TILE_SIZE);
    cam.startFollow(this.player.sprite, true, 0.15, 0.15);
    cam.setRoundPixels(true);
    cam.fadeIn(250);

    this.spawns = new SpawnManager(this, this.chunks, this.clock);
    this.spawns.setZones(zones);
    this.discovery = new Discovery(this.landmarks, loc.instance === 'overworld', (tx, ty) => this.query.regionAt(tx, ty));

    bus.onScene(this, 'region:entered', ({ regionId }) => {
      this.regionName = m.regions.get(regionId)?.name ?? regionId;
      this.hud()?.flash(this.regionName);
    });
    bus.onScene(this, 'flag:changed', ({ key }) => {
      if (m.watchedFlags.has(key)) this.chunks.invalidate();
    });
    this.input.keyboard!.on('keydown-F', () => { if (!this.clock.paused) this.objects.interact(); });
    this.input.keyboard!.on('keydown-M', () => this.toggleWorldMap());
    bus.onScene(this, 'combat:engaged', () => { this.inCombat = true; });
    bus.onScene(this, 'combat:disengaged', () => { this.inCombat = false; });
    bus.onScene(this, 'interact', ({ kind, props }) => { if (kind === 'waystone') this.hud()?.flash(`Waystone attuned: ${props.name}`); });
    this.input.keyboard!.on('keydown-ESC', () => { if (this.worldMap?.open) this.toggleWorldMap(); });
    this.events.once('shutdown', () => this.teardown());

    if (import.meta.env.DEV) {
      const g = m.regions.get('region:aldermoor')?.landmarks.find((l) => l.id === START_LANDMARK);
      (window as unknown as { __worldAudit?: () => string[] }).__worldAudit = () => auditWorld(m, g ? [g.at[0], g.at[1] + 2] : [958, 1033]);
      this.installDevHooks();
    }
    this.attachHud();
    bus.emit('world:ready', {});
    if (loc.instance !== 'overworld') bus.emit('instance:entered', { instanceId: loc.instance, floorId: loc.floor });
  }

  /** Dev only: ?tp=tx,ty (world tiles), ?inst=instance:id/floor, ?flags=a,b=1, ?zoom=0.5. */
  private applyDevParams(): void {
    const q = new URLSearchParams(location.search);
    const tp = q.get('tp')?.split(',').map(Number);
    if (tp?.length === 2 && !this.registry.get('dev-tp-done')) {
      this.registry.set('dev-tp-done', true);
      Object.assign(Game.state.world.location, { instance: 'overworld', x: tp[0] * TILE_SIZE + 16, y: tp[1] * TILE_SIZE + 16 });
    }
    for (const f of q.get('flags')?.split(',').filter(Boolean) ?? []) {
      const [k, val] = f.split('=');
      Game.state.flags[k] = val === undefined ? true : isNaN(Number(val)) ? val : Number(val);
    }
    const inst = q.get('inst')?.split('/');
    if (inst && !this.registry.get('dev-inst-done')) {
      this.registry.set('dev-inst-done', true);
      const floor = model!.instances.get(inst[0])?.floors.find((f) => f.id === (inst[1] ?? 'f1'));
      const [ex, ey] = floor ? Object.values(floor.entrances)[0] : [2, 2];
      Object.assign(Game.state.world.location, { instance: inst[0], floor: floor?.id, x: ex * TILE_SIZE + 16, y: ey * TILE_SIZE + 16 });
    }
    const zoom = Number(q.get('zoom'));
    if (zoom > 0) this.cameras.main.setZoom(zoom);
  }

  /** DEV: window.__world = { goto(id), tp(tx,ty), where(), focus(), spawns } for scripted playtests. */
  private installDevHooks(): void {
    const spawns: string[] = [];
    bus.onScene(this, 'enemy:spawn-request', (e) => spawns.push(`${e.enemyId}@${e.zoneId}`));
    const tp = (tx: number, ty: number) => {
      this.chunks.update(tx, ty, true);
      this.player.teleport(tx * TILE_SIZE + TILE_SIZE / 2, ty * TILE_SIZE + TILE_SIZE - 2);
    };
    const api = {
      spawns,
      tp,
      where: () => ({ ...Game.state.world.location, tx: Math.floor(this.player.x / TILE_SIZE), ty: Math.floor(this.player.y / TILE_SIZE), region: this.regionName }),
      focus: () => this.objects.focusId(),
      /** Stand next to a specific NPC sprite (anchors can host several). */
      gotoNpc: (npcId: string) => {
        const o = this.npcs.focusables().find((x) => x.props?.npc === npcId);
        if (!o) return `${npcId} not shown`;
        tp(o.at[0], o.at[1] + 1);
        return `at ${o.at[0]},${o.at[1] + 1}`;
      },
      press: () => this.objects.interact(),
      spawnDebug: () => this.spawns.debug(),
      travelTo: (id: string) => { this.fastTravel(id, 1); return { travelling: this.travelling, fade: this.cameras.main.fadeEffect.isRunning, progress: this.cameras.main.fadeEffect.progress }; },
      travelState: () => ({ travelling: this.travelling, fade: this.cameras.main.fadeEffect.isRunning, progress: this.cameras.main.fadeEffect.progress }),
      /** Advance world logic n times by ms without waiting for rendered frames (headless tests). */
      step: (ms = 100, n = 10) => { for (let i = 0; i < n; i++) this.update(0, ms); return this.spawns.debug().filter((z) => z.alive); },
      perf: () => { const p = { ...this.perf, avgMs: this.perf.worldMs / Math.max(1, this.perf.frames), fps: this.game.loop.actualFps }; this.perf = { frames: 0, worldMs: 0, maxMs: 0 }; return p; },
      goto: (id: string) => {
        const lm = this.landmarks.find((l) => l.id === id);
        let at = lm?.at;
        if (!at) for (const o of model!.overlays.values()) {
          const hit = [...(o.objects ?? []), ...(o.variants ?? []).flatMap((v) => v.objects ?? [])].find((x) => x.id === id);
          if (hit) { at = [hit.at[0] + o.origin[0], hit.at[1] + o.origin[1]]; break; }
        }
        if (!at) return `unknown ${id}`;
        this.chunks.update(at[0], at[1], true);
        for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, 1], [0, 2], [2, 0], [-2, 0], [0, 0]]) {
          if (this.query.isWalkable(at[0] + dx, at[1] + dy)) { tp(at[0] + dx, at[1] + dy); return `at ${at[0] + dx},${at[1] + dy}`; }
        }
        return `no walkable tile near ${id}`;
      },
    };
    (window as unknown as { __world?: typeof api }).__world = api;
  }

  private spawnPlayer(x: number, y: number): PlayerLike {
    try {
      return createPlayer(this, x, y);
    } catch {
      this.temp = new TempPlayer(this, x, y);
      return this.temp;
    }
  }

  private hud(): HudScene | null {
    const s = this.scene.get(SceneKeys.Hud) as HudScene | null;
    return s && s.sys.isActive() && s.anchors ? s : null;
  }

  private attachHud(): void {
    const mount = () => {
      const hud = this.hud();
      if (!hud || this.minimap) return;
      this.minimap = new Minimap(hud, hud.anchors.topRight, {
        playerTile: () => [Math.floor(this.player.x / TILE_SIZE), Math.floor(this.player.y / TILE_SIZE)],
        colorAt: (tx, ty) => {
          const c = this.chunks.data(Math.floor(tx / CHUNK_TILES), Math.floor(ty / CHUNK_TILES), false);
          return c ? c.mini[(ty - c.cy * CHUNK_TILES) * CHUNK_TILES + (tx - c.cx * CHUNK_TILES)] : null;
        },
        markers: () => this.markers(),
        region: () => this.regionName,
        time: () => {
          const { hour, phase } = this.clock.current;
          const hh = String(Math.floor(hour)).padStart(2, '0'), mm = String(Math.floor((hour % 1) * 60)).padStart(2, '0');
          return `${phase.toUpperCase()} ${hh}:${mm}`;
        },
      });
      const overworld = Game.state.world.location.instance === 'overworld';
      this.worldMap = new WorldMap(hud, buildWorldMapSource(model!, this.discovery, () => this.questMarkerLandmarks(), () => {
        const p = overworld ? { x: this.player.x, y: this.player.y } : Game.state.world.lastOverworld;
        return [Math.floor(p.x / TILE_SIZE), Math.floor(p.y / TILE_SIZE)];
      }, {
        blocked: () => {
          if (!overworld) return 'Leave this place before you travel.';
          if (this.inCombat) return 'You cannot travel while enemies are near.';
          if (this.clock.pausedExcept('ui:worldmap')) return 'Finish what you are doing first.';
          return null;
        },
        go: (id, hours) => this.fastTravel(id, hours),
      }));
    };
    if (this.scene.isActive(SceneKeys.Hud)) mount();
    else {
      this.scene.launch(SceneKeys.Hud);
      this.scene.get(SceneKeys.Hud).events.once(Phaser.Scenes.Events.CREATE, mount);
    }
  }

  /** Overworld-to-overworld crossing (ships, lifts): fade, then arrive at `at`. */
  private ferry(at: [number, number]): void {
    if (this.travelling) return;
    this.travelling = true;
    const cam = this.cameras.main;
    cam.fadeOut(400, 0, 0, 0);
    cam.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      Game.state.world.time += 120;
      this.chunks.update(at[0], at[1], true);
      this.player.teleport(at[0] * TILE_SIZE + TILE_SIZE / 2, at[1] * TILE_SIZE + TILE_SIZE - 2);
      this.travelling = false;
      cam.fadeIn(400);
    });
  }

  /** Fast travel to an attuned waystone (from the world map card): time passes, the player arrives beside it. */
  private fastTravel(id: string, hours: number): void {
    const w = model!.waystones().find((x) => x.id === id);
    if (!w || this.travelling) return;
    if (this.worldMap?.open) this.toggleWorldMap();
    this.travelling = true;
    const cam = this.cameras.main;
    cam.fadeOut(300, 0, 0, 0);
    cam.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      Game.state.world.time += hours * 60;
      const [tx, ty] = [w.at[0], w.at[1] + 1];
      this.chunks.update(tx, ty, true);
      const spot = ([[0, 0], [1, 0], [-1, 0], [0, 1], [1, 1], [-1, 1], [0, 2]] as const).map(([dx, dy]) => [tx + dx, ty + dy] as const)
        .find(([x, y]) => this.query.isWalkable(x, y)) ?? [tx, ty];
      this.player.teleport(spot[0] * TILE_SIZE + TILE_SIZE / 2, spot[1] * TILE_SIZE + TILE_SIZE - 2);
      this.travelling = false;
      cam.fadeIn(300);
      this.hud()?.flash(`${w.name} · ${hours} h later`);
    });
  }

  private toggleWorldMap(): void {
    if (!this.worldMap || this.travelling) return;
    if (!this.worldMap.open && this.clock.paused) return; // dialogue or another panel is open
    const open = this.worldMap.toggle();
    bus.emit(open ? 'ui:open' : 'ui:close', { panel: 'worldmap' });
  }

  private markers(): MinimapMarker[] {
    const out: MinimapMarker[] = [];
    const known = Game.state.world.discoveredLandmarks;
    for (const l of this.landmarks) if (known.includes(l.id)) out.push({ tx: l.at[0], ty: l.at[1], color: 0xd4a646, size: 1 });
    for (const c of this.chunks.liveChunks()) for (const o of c.objects) {
      if (o.kind === 'door') out.push({ tx: o.at[0], ty: o.at[1], color: 0xe8d9b5, size: 0 });
    }
    for (const id of this.questMarkerLandmarks()) {
      const l = this.landmarks.find((x) => x.id === id);
      if (l) out.push({ tx: l.at[0], ty: l.at[1], color: 0xc94545, size: 1, edge: true });
    }
    return out;
  }

  /** Landmarks pinned by the tracked quest's current objectives (Claude 4's marker.landmark). */
  private questMarkerLandmarks(): string[] {
    try {
      const id = Game.state.narrative.trackedQuest ?? activeQuests()[0]?.id;
      const def = id ? questDef(id as `quest:${string}`) : undefined;
      const stage = def?.stages.find((s) => s.id === progress(def.id)?.stage);
      return (stage?.objectives ?? []).filter((o) => !o.hidden && o.marker && 'landmark' in o.marker)
        .map((o) => (o.marker as { landmark: string }).landmark);
    } catch {
      return [];
    }
  }

  private travel(req: TravelRequest): void {
    if (this.travelling) return;
    if (req.target === 'tp' && req.at) { this.ferry(req.at); return; }
    const w = Game.state.world;
    const m = model!;
    const from = w.location;
    let next: typeof w.location;
    if (req.target === 'overworld') {
      const inst = m.instances.get(from.instance);
      const [tx, ty] = inst?.exit ?? [Math.floor(w.lastOverworld.x / TILE_SIZE), Math.floor(w.lastOverworld.y / TILE_SIZE)];
      next = { instance: 'overworld', x: tx * TILE_SIZE + TILE_SIZE / 2, y: ty * TILE_SIZE + TILE_SIZE / 2, facing: 's' };
    } else {
      const inst = m.instances.get(req.target);
      const floor = inst?.floors.find((f) => f.id === req.floor) ?? inst?.floors[0];
      if (!inst || !floor) { console.warn(`[world] door to unknown ${req.target}`); return; }
      const [tx, ty] = floor.entrances[req.entrance ?? 'main'] ?? Object.values(floor.entrances)[0] ?? [2, 2];
      if (from.instance === 'overworld') w.lastOverworld = { x: this.player.x, y: this.player.y };
      next = { instance: inst.id as `instance:${string}`, floor: floor.id, x: tx * TILE_SIZE + TILE_SIZE / 2, y: ty * TILE_SIZE + TILE_SIZE / 2, facing: 'n' };
    }
    this.travelling = true;
    if (from.instance !== 'overworld') bus.emit('instance:exited', { instanceId: from.instance, floorId: from.floor });
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      w.location = next;
      this.scene.restart();
    });
  }

  private teardown(): void {
    this.minimap?.destroy();
    if (this.worldMap?.open) bus.emit('ui:close', { panel: 'worldmap' });
    this.worldMap?.destroy();
    this.worldMap = null;
    this.minimap = null;
    this.spawns?.setZones([]);
    this.objects?.clear();
    this.npcs?.clear();
    this.chunks?.destroy();
    this.temp = null;
    this.landmarks = [];
  }

  update(_t: number, dt: number): void {
    if (this.travelling) return;
    this.clock.tick(dt);
    this.temp?.update(dt, this.clock.paused);
    const px = this.player.x, py = this.player.y;
    const loc = Game.state.world.location;
    loc.x = px; loc.y = py;
    const tx = Math.floor(px / TILE_SIZE), ty = Math.floor(py / TILE_SIZE);
    const t0 = performance.now();
    this.chunks.update(tx, ty);
    this.discovery.update(px, py);
    this.objects.update(px, py);
    this.npcs.update(dt, px, py);
    this.spawns.update(dt, tx, ty);
    this.minimap?.update(dt);
    this.worldMap?.update(dt);
    this.perf.frames++;
    this.perf.worldMs += performance.now() - t0;
    this.perf.maxMs = Math.max(this.perf.maxMs, performance.now() - t0);
  }
}
