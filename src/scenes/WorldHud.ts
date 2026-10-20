/**
 * The world scene's HUD parts (Claude 2, out of WorldV2Scene): launches HudV2 and mounts the map screen and the
 * minimap in its top-right anchor (doors, waystones, merchant coins, quest diamonds); M (rebindable) or the HUD map
 * button opens the map.
 */
import Phaser from 'phaser';
import { CHUNK_TILES, Game, SceneKeys, Services, TILE_SIZE, bus, heroClassId } from '@/core';
import type { HudV2Scene } from '@/ui/hud/HudV2Scene';
import { MinimapV2 } from '@/ui/map/MinimapV2';
import { MapScreen } from '@/ui/map/MapScreen';
import type { QuestMarkFeed } from '@/ui/map/questMarks';
import { isAction } from '@/ui/kit/hc/keys';
import { placeName, spaceRuntime } from '@/world/hc/spaces';
import { startAreaOf } from '@/world/hc/worldService';
import type { ChunkRenderer } from '@/world/render/ChunkRenderer';

export interface WorldHudSource {
  space(): string;
  /** the local hero (world px) */
  pos(): { x: number; y: number };
  region(): string | null;
  chunks(): ChunkRenderer;
  quests: QuestMarkFeed;
  /** a public realm visit's name for the HUD banner */
  visit?: string;
  /** the HUD is mounted already (a scene restart keeps HudV2 running) */
  mounted(): boolean;
  /** hands the mounted parts back to the scene (it destroys them on teardown) */
  done(parts: { map: MapScreen; minimap: MinimapV2 }): void;
}

export function attachWorldHud(scene: Phaser.Scene, s: WorldHudSource): void {
  const mount = () => {
    const hud = scene.scene.get(SceneKeys.HudV2) as HudV2Scene;
    if (!hud.anchors || s.mounted()) return;
    if (s.visit) hud.banner(s.visit, 'Public realm');
    const rt = spaceRuntime(s.space());
    const map = new MapScreen(hud, {
      space: () => s.space(),
      player: () => s.pos(),
      found: () => Game.state.world.foundRegions,
      woken: () => Game.state.world.waystones,
      homeSpace: () => startAreaOf(heroClassId()).space,
      travel: (waystone) => Services.tryGet('net')?.send({ type: 'act', domain: 'world', action: 'travel', args: { waystone } }),
      quests: () => s.quests.all(),
    });
    const minimap = new MinimapV2(hud, hud.anchors.topRight, {
      player: () => s.pos(),
      colorAt: (tx, ty) => {
        const c = rt.chunk(Math.floor(tx / CHUNK_TILES), Math.floor(ty / CHUNK_TILES), false);
        return c ? c.mini[(ty - c.cy * CHUNK_TILES) * CHUNK_TILES + (tx - c.cx * CHUNK_TILES)] : null;
      },
      dots: () => [
        ...s.chunks().views().flatMap((c) => c.objects
          .filter((o) => o.kind === 'door' || o.kind === 'waystone')
          .map((o) => ({ x: o.at[0] * TILE_SIZE + 16, y: o.at[1] * TILE_SIZE + 16, kind: o.kind as 'door' | 'waystone' }))),
        // merchants (gold coins), then the open objectives: the tracked quest gold (edge arrow off the window), others teal
        ...s.quests.merchants(scene.time.now).map((m) => ({ x: m.x, y: m.y, kind: 'shop' as const })),
        ...s.quests.here(scene.time.now, scene.game.loop.delta).map((m) => ({ x: m.x, y: m.y, kind: (m.tracked ? 'quest' : 'quest-side') as 'quest' | 'quest-side' })),
      ],
      label: () => { const r = s.region(); return r ? placeName(s.space(), r).name : ''; },
    });
    s.done({ map, minimap });
  };
  if (scene.scene.isActive(SceneKeys.HudV2)) mount();
  else {
    scene.scene.launch(SceneKeys.HudV2);
    scene.scene.get(SceneKeys.HudV2).events.once(Phaser.Scenes.Events.CREATE, mount);
  }
  // the map key follows rebinds; typing in chat never opens it
  scene.input.keyboard!.on('keydown', (ev: KeyboardEvent) => {
    if (!(ev.target instanceof HTMLInputElement) && !(ev.target instanceof HTMLTextAreaElement) && isAction(ev, 'map')) bus.emit('ui:open', { panel: 'map' });
  });
}
