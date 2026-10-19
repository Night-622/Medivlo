/**
 * Entry point used by Claude 2's WorldScene: builds the player + combat runtime on the scene.
 */
import Phaser from 'phaser';
import { Game, Registry, Services, bus } from '@/core';
import { humanoidTexture } from '@/ui/kit';
import { CombatHud } from '@/ui/character/CombatHud';
import { initCharacter } from '../progression/Character';
import { statValue } from '../stats/playerStats';
import { CombatRuntime } from './CombatRuntime';
import { installListeners } from './listeners';
import { PlayerActor } from './Player';
import { PlayerController } from './PlayerController';

export interface PlayerHandle {
  readonly sprite: Phaser.GameObjects.Image;
  readonly x: number;
  readonly y: number;
  teleport(x: number, y: number): void;
  destroy(): void;
}

const OUTFIT: Record<string, number> = {
  'class:warden': 0x6d7480, 'class:ranger': 0x4f5f3a, 'class:arcanist': 0x6b4f7a,
  'class:reaver': 0x6b1d1f, 'class:shade': 0x281f16, 'class:oathbound': 0xb9a57c,
};

/** x, y = the player's feet in world px. */
export function createPlayer(scene: Phaser.Scene, x: number, y: number): PlayerHandle {
  const state = Game.state;
  // dev entry (?scene=World) skips character creation: default to a Warden (or ?class=ranger)
  const devClass = `class:${new URLSearchParams(location.search).get('class') ?? 'warden'}` as const;
  if (!state.player.progression.classId && Registry.tryGet('class', devClass)) {
    initCharacter(state, { classId: devClass, traits: [], ancestry: null });
  }
  const a = state.player.appearance;
  const outfit = OUTFIT[state.player.progression.classId ?? ''] ?? 0x5a554d;
  const tex = humanoidTexture(scene, `player-${a.skinTone}-${a.hairColor}-${a.accentColor}-${outfit}`, a.skinTone, a.hairColor, outfit, a.accentColor);

  const player = new PlayerActor(scene, x, y, tex);
  const rt = new CombatRuntime(scene, player);
  const ctl = new PlayerController(scene, rt);
  const offListeners = installListeners(rt);
  rt.ui = new CombatHud(scene, rt);

  Services.register('stats', {
    max: (s) => (s === 'maxHp' ? player.maxHp : s === 'maxMana' ? player.stats.derived.maxMana : player.stats.derived.maxStamina),
    get: (s) => statValue(player.stats, s),
  });

  // gold, for fast travel (Claude 2), merchants and Runecraft
  Services.register('economy', {
    gold: () => Game.state.player.inventory.gold,
    spend: (amount, reason) => {
      const inv = Game.state.player.inventory;
      if (amount < 0 || inv.gold < amount) return false;
      inv.gold -= Math.round(amount);
      if (import.meta.env.DEV) console.debug(`[economy] -${amount} gold (${reason})`);
      return true;
    },
    give: (amount, reason) => {
      if (amount <= 0) return;
      Game.state.player.inventory.gold += Math.round(amount);
      if (import.meta.env.DEV) console.debug(`[economy] +${amount} gold (${reason})`);
    },
  });

  // unrecovered Echo in this place
  const echo = state.player.inventory.echo;
  if (echo && echo.instance === state.world.location.instance && (echo.floor ?? '') === (state.world.location.floor ?? '')) {
    rt.pickups.spawnGold(echo.gold, echo.x, echo.y, scene.time.now, true);
  }

  if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__combat = { rt, player, ctl, scene };

  // dev: ?spawn=enemy:gloamwood-wolf*3,enemy:mireling&lvl=2 spawns enemies around the player
  const q = new URLSearchParams(location.search);
  const spawn = q.get('spawn');
  if (spawn) {
    scene.time.delayedCall(400, () => {
      const list = spawn.split(',').flatMap((s) => { const [id, n] = s.split('*'); return Array<string>(Number(n ?? 1)).fill(id); });
      list.forEach((id, i) => {
        const a = (i / list.length) * Math.PI * 2;
        rt.spawnEnemy(id, player.x + Math.cos(a) * 170, player.y + Math.sin(a) * 170, { level: Number(q.get('lvl') ?? 1), tier: 1, zoneId: 'dev', noElite: !q.has('elite') });
      });
    });
  }

  const onUpdate = (time: number, delta: number) => {
    if (rt.paused) ctl.resetEdges();
    else ctl.update(time, Math.min(50, delta));
    rt.update(time, delta);
  };
  const offStats = bus.on('stats:changed', () => player.markDirty());
  scene.events.on('update', onUpdate);
  let destroyed = false;
  const teardown = () => {
    if (destroyed) return;
    destroyed = true;
    scene.events.off('update', onUpdate);
    offStats();
    offListeners();
    ctl.destroy();
    rt.destroy();
    player.destroy();
  };
  scene.events.once('shutdown', teardown);
  scene.events.once('destroy', teardown);
  player.syncSprite(scene.time.now);

  return {
    get sprite() { return player.sprite; },
    get x() { return player.x; },
    get y() { return player.y; },
    teleport(nx: number, ny: number) { player.x = nx; player.y = ny; player.syncSprite(scene.time.now); },
    destroy: teardown,
  };
}
