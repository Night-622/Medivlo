/**
 * Hollow Crown world scene (Claude 2), under construction beside the Phase 1 WorldScene until the swap.
 * Renders one space (realm:<school> | concordia) from the shared SpaceRuntime; registers Services.world and
 * Services.worlds; the world sim (region tracking) is a SimLoop stepper that runs only on the authority.
 * Dev: ?scene=WorldV2&space=realm:ash&tp=tx,ty&zoom=0.5&hour=22&fly=1
 */
import Phaser from 'phaser';
import { CHUNK_TILES, Game, Registry, SceneKeys, Services, TILE_SIZE, bus, heroClassId } from '@/core';
import { createHero } from '@/systems/client/hero';
import { character } from '@/systems/client/character';
import { systemsAuthority } from '@/systems/sim';
import { activeQuests, npcPlacements } from '@/narrative';
import { currentStage, objectiveDone } from '@/narrative/engine/quests';
import type { HudV2Scene } from '@/ui/hud/HudV2Scene';
import { MinimapV2 } from '@/ui/map/MinimapV2';
import { MapScreen } from '@/ui/map/MapScreen';
import { WorldClock } from '@/world/render/WorldClock';
import { ARENAS, REALMS, entryWaystone, knownSpace, placeName, spaceRuntime } from '@/world/hc/spaces';
import { HcWorldService, standBeside, startAreaOf } from '@/world/hc/worldService';
import type { SpaceQuery } from '@/world/hc/runtime';
import { installWorldAuthority, type WorldAuthority } from '@/world/hc/authority';
import { InstanceGen } from '@/world/hc/instanceGen';
import { ChunkRenderer } from '@/world/render/ChunkRenderer';
import { bakeStats } from '@/world/render/artCache';
import { chunkFeed } from '@/world/render/ChunkFeed';
import { ListeningShadow } from '@/world/render/ListeningShadow';
import { isAction } from '@/ui/kit/hc/keys';
import { Lighting } from '@/world/render/Lighting';
import { FocusPrompt } from '@/world/render/FocusPrompt';
import { NpcView } from '@/world/render/NpcView';

interface PlayerLike {
  readonly sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
  readonly x: number;
  readonly y: number;
  teleport(x: number, y: number, space?: string): void;
  destroy(): void;
}

/** spaces the scene can open: Concordia, the school realms, arenas and every buildable instance */
const SPACES = { has: (id: string): boolean => knownSpace(id), list: (): string[] => ['concordia', ...REALMS.filter((r) => r.school).map((r) => r.space), ...ARENAS.map((a) => a.id)] };

/** scene data: a public realm visit (Claude 1's realm browser) or a co-op guest; `space` follows the authority */
export interface VisitData { realm?: { id: string; space: string; rule: string; name: string }; guest?: boolean; space?: string }
const FLY_SPEED = 600;

/** Open kill objectives with a map marker: the world spawns their creatures at the marker (story fights). */
function storyKills(playerId: string): { playerId: string; creature: string; count: number; marker?: string }[] {
  return activeQuests().flatMap((q) => (currentStage(q)?.objectives ?? []).flatMap((o) => {
    // all open kills: marked ones also spawn at their marker; any of them wakes a cleared boss its stage now wants
    if (!('kill' in o) || !o.kill || objectiveDone(q, o)) return [];
    const m = o.marker as { landmark?: string; place?: string; region?: string } | undefined;
    return [{ playerId, creature: String(o.kill), count: o.count, marker: m ? m.landmark ?? m.place ?? m.region : undefined }];
  }));
}

export class WorldV2Scene extends Phaser.Scene {
  private space = '';
  private query!: SpaceQuery;
  private listening: ListeningShadow | null = null;
  private clock!: WorldClock;
  private chunks!: ChunkRenderer;
  private light!: Lighting;
  private player: PlayerLike | null = null;
  /** dev fly camera position when there is no player */
  private fly: { x: number; y: number; keys: Record<string, Phaser.Input.Keyboard.Key> } | null = null;
  private region: string | null = null;
  private authority: WorldAuthority | null = null;
  private minimap: MinimapV2 | null = null;
  private map: MapScreen | null = null;
  private focus: FocusPrompt | null = null;
  private npcs: { view: NpcView; off: () => void } | null = null;

  constructor() { super(SceneKeys.WorldV2); }

  /** Public realm visit ({ realm }) or co-op guest ({ guest }): render only, never touch the campaign save. */
  private visit: VisitData['realm'] | null = null;
  private guest = false;
  /** visits and guests read the world but never write location, waystones, discovery or fog */
  private get readOnly(): boolean { return !!this.visit || this.guest || !this.isAuthority(); }
  private isAuthority(): boolean { return Services.tryGet('net')?.isAuthority() ?? true; }

  init(data?: VisitData): void {
    this.visit = data?.realm ?? null;
    this.guest = !!data?.guest;
    this.spaceOverride = data?.space ?? null;
  }

  private spaceOverride: string | null = null;

  create(): void {
    Registry.load();
    const q = new URLSearchParams(location.search);
    const loc = Game.state.world.location;
    const me = () => Services.tryGet('net')?.localPlayer ?? 'local';
    let space: string;
    if (this.visit || this.spaceOverride) space = this.visit?.space ?? this.spaceOverride!;
    else {
      const want = q.get('space') && !this.registry.get('dev-space-done') ? q.get('space')! : loc.space;
      this.registry.set('dev-space-done', true);
      space = want && SPACES.has(want) ? want : startAreaOf(heroClassId()).space;
      if (loc.space !== space) Object.assign(loc, { space, x: 0, y: 0 });
      const hour = Number(q.get('hour'));
      if (q.has('hour') && !this.registry.get('dev-hour-done')) { this.registry.set('dev-hour-done', true); Game.state.world.time = hour * 60; }
    }
    if (!SPACES.has(space)) throw new Error(`[world] unknown space "${space}"`);
    this.space = space;
    this.clock = new WorldClock(this);

    if (this.isAuthority()) {
      // the same entry the public-realm server uses; its stepper only runs where Services.net is the authority
      const save = !this.readOnly;
      this.authority = installWorldAuthority({
        space, clock: () => this.clock.current, classOf: () => heroClassId(),
        players: () => this.simPlayers(me()),
        travelBlocked: () => (this.clock.pausedExcept('ui:map') ? 'Finish what you are doing first.' : null),
        // our hero moves itself; remote party members are moved by the systems sim (Claude 3: clients can't teleport)
        place: (pid, to, x, y) => { if (pid === me()) this.arrive(to, x, y); else systemsAuthority()?.sim.teleport(pid, to, x, y); },
        discover: (pid, id) => {
          if (!save || pid !== me() || !id) return;
          const w = Game.state.world;
          if (id.startsWith('boss:')) { w.clearedZones[id] = Date.now(); return; }
          const list = id.startsWith('landmark:') ? w.discoveredLandmarks : w.foundRegions;
          if (!list.includes(id)) list.push(id);
        },
        known: (pid, id) => pid === me() && (id.startsWith('boss:') ? id in Game.state.world.clearedZones : Game.state.world.discoveredLandmarks.includes(id) || Game.state.world.foundRegions.includes(id)),
        wokenOf: save ? undefined : () => [],
        npcPlacements,
        questKills: () => storyKills(me()),
      });
    } else {
      // clients of a server or host: queries for local prediction and rendering only; the authority does the rest
      const worlds = new HcWorldService(() => this.clock.current, () => this.space, () => heroClassId(), () => []);
      Services.register('worlds', worlds);
      Services.register('world', worlds.query(space));
      this.followSpace(me);
      const offClock = Services.get('net').addStateSync({
        name: 'world-clock', collect: () => null,
        apply: (s) => { const h = (s as { hour?: unknown } | null)?.hour; if (typeof h === 'number') this.clock.follow(h); },
      });
      this.events.once('shutdown', offClock);
    }
    this.query = Services.get('worlds').query(space) as SpaceQuery;
    bus.onScene(this, 'region:entered', (e) => { if (e.playerId === me() && e.space === this.space) this.region = e.regionId; });

    // where to stand: ?tp, saved position, else the space's start (class waystone or entry waystone)
    const at = this.readOnly ? this.fallbackStart() : this.startOf(q, loc);
    const rt = spaceRuntime(space);
    const cam = this.cameras.main;
    cam.setBackgroundColor(0x24485e).setRoundPixels(true);
    cam.setBounds(0, 0, rt.gen.widthTiles * TILE_SIZE, rt.gen.heightTiles * TILE_SIZE);
    const zoom = Number(q.get('zoom'));
    if (zoom > 0) cam.setZoom(zoom);

    this.light = new Lighting(this);
    if (space.startsWith('inst:')) { this.light.look = 'abbey'; cam.setBackgroundColor(0x0e0b08); }
    this.chunks = new ChunkRenderer(this, rt, this.light);
    // terrain ahead of the camera comes from the chunk worker (no fresh-terrain hitches); stale asks are dropped
    const feed = chunkFeed();
    feed.clear();
    this.chunks.feed = feed;
    // opened chests (Claude 3 keeps the ids on the character; chest:opened as they open)
    const opened = new Set<string>((character() as { chests?: string[] }).chests ?? []);
    const chestAt = (tx: number, ty: number) => rt.chunk(Math.floor(tx / CHUNK_TILES), Math.floor(ty / CHUNK_TILES), false)?.objects
      .find((o) => o.kind === 'chest' && o.at[0] === tx && o.at[1] === ty);
    this.chunks.openedAt = (tx, ty) => { const o = chestAt(tx, ty); return !!o && opened.has(o.id); };
    const offChest = bus.on('chest:opened', (e) => {
      if (e.playerId !== (Services.tryGet('net')?.localPlayer ?? 'local') || opened.has(e.objectId)) return;
      opened.add(e.objectId);
      const o = this.chunks.views().flatMap((c) => c.objects).find((x) => x.id === e.objectId);
      if (o) this.chunks.redraw(o.at[0], o.at[1] - 1);
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, offChest);
    // the Shade's listening shadow (scripted beats and, for a shadowless Shade, ambient ones by lit lamps)
    this.listening = new ListeningShadow(this, {
      hero: () => (this.player ? { sprite: this.player.sprite, x: this.player.sprite.x, y: this.player.sprite.y } : null),
      query: () => this.query,
      phase: () => this.clock.current.phase,
      objects: () => this.chunks.views().flatMap((c) => c.objects),
      placements: () => this.chunks.views().flatMap((c) => c.placements),
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.listening?.destroy(); this.listening = null; });
    cam.centerOn(at.x, at.y);
    cam.preRender();
    this.chunks.update(true);

    if (q.get('fly') !== '1') this.player = this.spawnPlayer(at.x, at.y);
    if (this.player) cam.startFollow(this.player.sprite, true, 0.15, 0.15);
    else this.startFly(at.x, at.y);
    cam.fadeIn(250);
    this.focus = new FocusPrompt(this, () => this.space, () => this.pos(), () => this.clock.paused);
    const npcView = new NpcView(this, () => this.space);
    const offNpcs = Services.tryGet('net')?.addConsumer(npcView);
    this.npcs = { view: npcView, off: offNpcs ?? (() => undefined) };
    this.focus.npcs = () => npcView.list();

    this.events.once('shutdown', () => this.teardown());
    if (import.meta.env.DEV) this.installDevHooks();
    this.scene.sendToBack(); // HUD and narrative scenes draw over the world
    this.attachHud();
    bus.emit('world:ready', {});
  }

  /** Campaign start: ?tp (dev), the saved position, else the respawn point (class or last woken waystone). */
  private startOf(q: URLSearchParams, loc: typeof Game.state.world.location): { x: number; y: number } {
    const tp = q.get('tp')?.split(',').map(Number);
    if (tp?.length === 2 && !this.registry.get('dev-tp-done')) {
      this.registry.set('dev-tp-done', true);
      Object.assign(loc, standBeside(this.query, tp[0], tp[1]));
    } else if (loc.x === 0 && loc.y === 0) {
      const r = Services.get('worlds').respawnPoint(Services.tryGet('net')?.localPlayer ?? 'local');
      Object.assign(loc, r.space === this.space ? { x: r.x, y: r.y } : this.fallbackStart());
    }
    return { x: loc.x, y: loc.y };
  }

  /** Non-authority clients: when the authority moves our player to another space, re-open the scene there. */
  private followSpace(me: () => string): void {
    const off = Services.get('net').addConsumer({
      kinds: ['player'],
      apply: (ents) => {
        const mine = ents.find((e) => e.id === `p:${me()}`);
        if (!mine || mine.space === this.space || !SPACES.has(mine.space)) return;
        this.scene.restart({ realm: this.visit ? { ...this.visit, space: mine.space } : undefined, guest: this.guest, space: mine.space } satisfies VisitData);
      },
    });
    this.events.once('shutdown', off);
  }

  /** Concordia (and any space without the class waystone): its first lit waystone. */
  private fallbackStart(): { x: number; y: number } {
    const rt = spaceRuntime(this.space);
    const at = rt.gen instanceof InstanceGen ? rt.gen.entrance
      : entryWaystone(this.space)?.at ?? [Math.floor(rt.gen.widthTiles / 2), Math.floor(rt.gen.heightTiles / 2)];
    return standBeside(this.query, at[0], at[1]);
  }

  private spawnPlayer(x: number, y: number): PlayerLike | null {
    try {
      return createHero(this, this.space, x, y);
    } catch (e) {
      console.warn('[world] createHero failed; using the fly camera', e);
      return null;
    }
  }

  private startFly(x: number, y: number): void {
    const kb = this.input.keyboard!;
    const keys = kb.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT') as Record<string, Phaser.Input.Keyboard.Key>;
    this.fly = { x, y, keys };
    this.input.on('wheel', (_p: unknown, _o: unknown, _dx: number, dy: number) => {
      const cam = this.cameras.main;
      cam.setZoom(Phaser.Math.Clamp(cam.zoom * (dy > 0 ? 0.9 : 1.1), 0.15, 3));
    });
  }

  /** Players for the world sim: the systems sim's own positions (every party member), else the local view. */
  private simPlayers(me: string): { id: string; space: string; x: number; y: number }[] {
    const list = Services.tryGet('combat')?.players().filter((p) => p.kind === 'player' && p.playerId)
      .map((p) => ({ id: p.playerId!, space: p.space, x: p.x, y: p.y })) ?? [];
    return list.length ? list : [{ id: me, space: this.space, ...this.pos() }];
  }

  private pos(): { x: number; y: number } {
    return this.player ? { x: this.player.x, y: this.player.y } : this.fly ?? { x: 0, y: 0 };
  }

  /** Launch HudV2 and mount the minimap in its top-right anchor; M or the HUD map button opens the map. */
  private attachHud(): void {
    const mount = () => {
      const hud = this.scene.get(SceneKeys.HudV2) as HudV2Scene;
      if (!hud.anchors || this.minimap) return;
      if (this.visit) hud.banner(this.visit.name, 'Public realm');
      const rt = spaceRuntime(this.space);
      this.map = new MapScreen(hud, {
        space: () => this.space,
        player: () => this.pos(),
        found: () => Game.state.world.foundRegions,
        woken: () => Game.state.world.waystones,
        homeSpace: () => startAreaOf(heroClassId()).space,
        travel: (waystone) => Services.tryGet('net')?.send({ type: 'act', domain: 'world', action: 'travel', args: { waystone } }),
      });
      this.minimap = new MinimapV2(hud, hud.anchors.topRight, {
        player: () => this.pos(),
        colorAt: (tx, ty) => {
          const c = rt.chunk(Math.floor(tx / CHUNK_TILES), Math.floor(ty / CHUNK_TILES), false);
          return c ? c.mini[(ty - c.cy * CHUNK_TILES) * CHUNK_TILES + (tx - c.cx * CHUNK_TILES)] : null;
        },
        dots: () => this.chunks.views().flatMap((c) => c.objects
          .filter((o) => o.kind === 'door' || o.kind === 'waystone')
          .map((o) => ({ x: o.at[0] * TILE_SIZE + 16, y: o.at[1] * TILE_SIZE + 16, kind: o.kind as 'door' | 'waystone' }))),
        label: () => (this.region ? placeName(this.space, this.region).name : ''),
      });
    };
    if (this.scene.isActive(SceneKeys.HudV2)) mount();
    else {
      this.scene.launch(SceneKeys.HudV2);
      this.scene.get(SceneKeys.HudV2).events.once(Phaser.Scenes.Events.CREATE, mount);
    }
    // the map key follows rebinds; typing in chat never opens it
    this.input.keyboard!.on('keydown', (ev: KeyboardEvent) => {
      if (!(ev.target instanceof HTMLInputElement) && !(ev.target instanceof HTMLTextAreaElement) && isAction(ev, 'map')) bus.emit('ui:open', { panel: 'map' });
    });
  }

  /** Authority placed the local player (travel, doors): fade and move within this space, or switch spaces. */
  private arrive(to: string, x: number, y: number): void {
    bus.emit('ui:close', { panel: 'map' });
    if (to !== this.space) { this.changeSpace(to, { x, y }); return; }
    // move now (state never waits on a camera effect); the fade-in is cosmetic
    const cam = this.cameras.main;
    if (this.player) this.player.teleport(x, y, to);
    else if (this.fly) Object.assign(this.fly, { x, y });
    cam.centerOn(x, y);
    cam.preRender();
    this.chunks.update(true);
    cam.fadeIn(350, 0, 0, 0);
  }

  /** Switch spaces (realm gate, dev): fade, then restart in the new space at its start. */
  private changeSpace(to: string, at?: { x: number; y: number }, announce = false): void {
    if (!SPACES.has(to)) return;
    const from = this.space;
    if (this.readOnly) { this.scene.restart({ realm: this.visit ?? undefined, guest: this.guest, space: to } satisfies VisitData); return; }
    Object.assign(Game.state.world.location, { space: to, x: at?.x ?? 0, y: at?.y ?? 0 });
    // the authority announces travel; dev jumps announce themselves
    if (announce) bus.emit('space:changed', { playerId: Services.tryGet('net')?.localPlayer ?? 'local', from, to });
    this.scene.restart();
  }

  /** DEV: window.__world = { where, tp, space, step, perf }. */
  private installDevHooks(): void {
    const api = {
      where: () => {
        const p = this.pos();
        const tx = Math.floor(p.x / TILE_SIZE), ty = Math.floor(p.y / TILE_SIZE);
        return { space: this.space, tx, ty, region: this.query.regionAt(tx, ty), rule: this.query.zoneRule(tx, ty), tile: this.query.tileAt(tx, ty) };
      },
      tp: (tx: number, ty: number) => {
        const s = standBeside(this.query, tx, ty);
        if (this.player) this.player.teleport(s.x, s.y);
        else if (this.fly) Object.assign(this.fly, s);
        this.cameras.main.centerOn(s.x, s.y);
        this.cameras.main.preRender();
        this.chunks.update(true);
        return s;
      },
      space: (id: string) => { this.changeSpace(id, undefined, true); return SPACES.has(id) ? 'ok' : `unknown; one of ${SPACES.list().join(', ')}`; },
      spaces: () => SPACES.list(),
      hour: (h: number) => { Game.state.world.time = h * 60; },
      step: (ms = 100, n = 10) => { for (let i = 0; i < n; i++) this.update(0, ms); return api.where(); },
      chunks: () => this.chunks.views().map((c) => `${c.cx},${c.cy}`),
      chunkStats: () => ({ worker: !!this.chunks.feed?.live, delivered: this.chunks.feed?.delivered ?? 0, syncBuilds: this.chunks.syncBuilds, shown: this.chunks.views().length, show: this.chunks.perf, bakes: bakeStats }),
      focus: () => this.focus?.focusId() ?? null,
      press: () => this.focus?.use(),
    };
    (window as unknown as { __world?: typeof api }).__world = api;
  }

  private teardown(): void {
    this.authority?.uninstall();
    this.authority = null;
    this.minimap?.destroy();
    this.map?.destroy();
    this.map = null;
    this.focus?.destroy();
    this.focus = null;
    this.npcs?.off();
    this.npcs?.view.destroy();
    this.npcs = null;
    this.minimap = null;
    this.chunks?.destroy();
    this.light?.destroy();
    this.player?.destroy();
    this.player = null;
    this.fly = null;
    this.region = null;
  }

  update(time: number, dt: number): void {
    // visits keep the campaign clock still (TODO: take the realm's hour from the server)
    if (!this.readOnly) this.clock.tick(dt);
    if (this.fly) {
      const k = this.fly.keys, sp = (FLY_SPEED * (k.SHIFT.isDown ? 4 : 1) * dt) / 1000 / this.cameras.main.zoom;
      this.fly.x += ((k.D.isDown || k.RIGHT.isDown ? 1 : 0) - (k.A.isDown || k.LEFT.isDown ? 1 : 0)) * sp;
      this.fly.y += ((k.S.isDown || k.DOWN.isDown ? 1 : 0) - (k.W.isDown || k.UP.isDown ? 1 : 0)) * sp;
      this.cameras.main.centerOn(this.fly.x, this.fly.y);
    }
    const p = this.pos();
    if (!this.readOnly) Object.assign(Game.state.world.location, { x: p.x, y: p.y });
    this.chunks.update();
    this.listening?.update(dt);
    this.light.update(this.clock.darkness, time);
    this.minimap?.update(dt);
    this.focus?.update(dt);
  }
}
