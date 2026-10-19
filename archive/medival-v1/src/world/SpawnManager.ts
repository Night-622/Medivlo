/** Spawn zones (WORLD.md §4.5): emits enemy:spawn-request, tracks alive counts, respawn timers and clears. */
import Phaser from 'phaser';
import {
  CHUNK_TILES, Collision, Game, Registry, TILE_SIZE, bus, evalCondition, rng, setFlag,
  type SpawnTable, type SpawnZone, type Tier,
} from '@/core';
import type { ChunkManager } from './ChunkManager';
import { timeMatches, type WorldClock } from './WorldClock';

interface ZoneRt { zone: SpawnZone; tier: Tier; alive: number; spawned: number; nextAt: number }

const TICK_MS = 1000;
/** Don't pop enemies in right next to the player. */
const MIN_PLAYER_DIST_TILES = 7;

export class SpawnManager {
  private zones: ZoneRt[] = [];
  private acc = 0;
  private now = 0;

  constructor(scene: Phaser.Scene, private chunks: ChunkManager, private clock: WorldClock) {
    bus.onScene(scene, 'enemy:killed', ({ zoneId }) => {
      const z = zoneId && this.zones.find((r) => r.zone.id === zoneId);
      if (!z) return;
      z.alive = Math.max(0, z.alive - 1);
      if (z.zone.respawnSec === 0 && z.alive === 0 && z.spawned >= z.zone.maxAlive) {
        Game.state.world.clearedZones[z.zone.id] = Date.now();
        setFlag(`world.cleared.${z.zone.id}`, true);
      } else if (z.zone.respawnSec > 0) {
        z.nextAt = Math.max(z.nextAt, this.now + z.zone.respawnSec * 1000);
      }
    });
  }

  setZones(zones: { zone: SpawnZone; tier: Tier }[]): void {
    for (const z of this.zones) if (z.alive > 0) bus.emit('enemy:despawn', { zoneId: z.zone.id });
    this.zones = zones.map(({ zone, tier }) => ({ zone, tier, alive: 0, spawned: 0, nextAt: 0 }));
  }

  /** Zone area touches at least one rendered chunk. */
  private zoneLive(z: SpawnZone): boolean {
    const { x, y, w, h } = z.area;
    const cx0 = Math.floor(x / CHUNK_TILES), cx1 = Math.floor((x + w - 1) / CHUNK_TILES);
    const cy0 = Math.floor(y / CHUNK_TILES), cy1 = Math.floor((y + h - 1) / CHUNK_TILES);
    for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) if (this.chunks.isLive(cx, cy)) return true;
    return false;
  }

  private spawnable(tx: number, ty: number): boolean {
    const bits = this.chunks.collisionAt(tx, ty);
    return bits !== null && (bits & (Collision.SOLID | Collision.WATER | Collision.NO_SPAWN | Collision.HAZARD)) === 0;
  }

  private findSpot(z: SpawnZone, ptx: number, pty: number, near?: [number, number]): [number, number] | null {
    // Wild (respawning) zones avoid popping in beside the player; one-off event/boss zones spawn regardless.
    const minDist = z.respawnSec > 0 ? MIN_PLAYER_DIST_TILES : 2;
    for (let i = 0; i < 24; i++) {
      const tx = near ? near[0] + rng.int(-2, 2) : z.area.x + rng.int(0, z.area.w - 1);
      const ty = near ? near[1] + rng.int(-2, 2) : z.area.y + rng.int(0, z.area.h - 1);
      if (!near && Math.hypot(tx - ptx, ty - pty) < minDist) continue;
      if (this.spawnable(tx, ty)) return [tx, ty];
    }
    return null;
  }

  update(dtMs: number, playerTx: number, playerTy: number): void {
    this.now += dtMs;
    this.acc += dtMs;
    if (this.acc < TICK_MS) return;
    this.acc = 0;
    const phase = this.clock.current.phase;
    const cleared = Game.state.world.clearedZones;

    for (const z of this.zones) {
      const live = this.zoneLive(z.zone);
      const active = evalCondition(z.zone.when);
      if ((!live || !active) && z.alive > 0) {
        bus.emit('enemy:despawn', { zoneId: z.zone.id });
        z.spawned -= z.alive;
        z.alive = 0;
      }
      if (!live || !active || (cleared[z.zone.id] !== undefined && z.zone.respawnSec === 0)) continue;
      if (z.alive >= z.zone.maxAlive || this.now < z.nextAt) continue;
      if (z.zone.respawnSec === 0 && z.spawned >= z.zone.maxAlive) continue;

      const table = Registry.extra<SpawnTable>('spawn', z.zone.table);
      if (!table) { console.warn(`[world] missing ${z.zone.table}`); continue; }
      const entries = table.entries.filter((e) => timeMatches(e.time, phase) && evalCondition(e.when));
      if (!entries.length) continue;
      const entry = rng.weighted(entries);
      const room = z.zone.maxAlive - z.alive;
      const count = Math.min(room, rng.int(entry.group[0], entry.group[1]));
      const first = this.findSpot(z.zone, playerTx, playerTy);
      if (!first) continue;
      for (let i = 0; i < count; i++) {
        const spot = i === 0 ? first : this.findSpot(z.zone, playerTx, playerTy, first) ?? first;
        bus.emit('enemy:spawn-request', {
          enemyId: entry.enemy,
          level: rng.int(entry.level[0], entry.level[1]),
          x: spot[0] * TILE_SIZE + TILE_SIZE / 2,
          y: spot[1] * TILE_SIZE + TILE_SIZE / 2,
          zoneId: z.zone.id,
          tier: z.tier,
        });
      }
      z.alive += count;
      z.spawned += count;
      if (z.zone.respawnSec > 0) z.nextAt = this.now + Math.min(z.zone.respawnSec * 1000, 20_000);
    }
  }

  /** Debug: zone runtime state. */
  debug(): { id: string; alive: number; spawned: number }[] {
    return this.zones.map((z) => ({ id: z.zone.id, alive: z.alive, spawned: z.spawned }));
  }
}
