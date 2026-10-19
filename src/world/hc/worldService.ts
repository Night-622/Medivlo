/**
 * Services.worlds (core WorldService): per-space queries, start/respawn points and waystones. Pure (no
 * Phaser): the public-realm server registers the same implementation with its own player locations.
 */
import { Game, TILE_SIZE, bus, classSchool, type TimePhase, type WorldQuery, type WorldService } from '@/core';
import { SpaceQuery } from './runtime';
import { AREAS, allWaystones, entryWaystone, spaceRuntime } from './spaces';
import type { InstanceGen } from './instanceGen';
import { markerAt } from './spawns';

type Clock = () => { hour: number; phase: TimePhase };

/** The class's start area: `area:<school>-capital|frontier` (falls back to the Ash capital). */
export function startAreaOf(classId: string | null | undefined): { space: string; waystone: string } {
  const bare = (classId ?? '').replace(/^class:/, '');
  const area = AREAS.find((a) => a.className.toLowerCase() === bare) ?? AREAS.find((a) => a.school === classSchool(bare));
  const school = area?.school ?? 'ash', side = area?.side ?? 'capital';
  return { space: `realm:${school}`, waystone: `ws:${school}-${side}` };
}

/** A walkable spot (world px, feet) beside a tile, searched outward. */
export function standBeside(q: WorldQuery, tx: number, ty: number): { x: number; y: number } {
  for (let r = 1; r < 6; r++) {
    for (const [dx, dy] of [[0, r], [r, 0], [-r, 0], [0, -r], [r, r], [-r, r], [r, -r], [-r, -r]]) {
      if (q.isWalkable(tx + dx, ty + dy)) return { x: (tx + dx) * TILE_SIZE + TILE_SIZE / 2, y: (ty + dy) * TILE_SIZE + TILE_SIZE - 2 };
    }
  }
  return { x: tx * TILE_SIZE + TILE_SIZE / 2, y: ty * TILE_SIZE + TILE_SIZE / 2 };
}

export class HcWorldService implements WorldService {
  private queries = new Map<string, SpaceQuery>();
  /** public realms: every respawn and travel stays inside this space */
  confine: string | null = null;
  /** co-op: the host (the authority's own player) and who is placed already; guests play in the host's world */
  party: { host: () => { id: string; space: string; x: number; y: number } | null; placed: (playerId: string) => boolean } | null = null;

  /**
   * @param spaceOfPlayer where each player is (solo/host: the local GameState; the server: its sessions)
   * @param classOf a player's class id (for the start area)
   */
  constructor(
    private clock: Clock,
    private spaceOfPlayer: (playerId: string) => string,
    private classOf: (playerId: string) => string | null,
    /** woken waystones per player, most recent last (default: the local GameState) */
    private wokenOf: (playerId: string) => string[] = () => Game.state.world.waystones,
  ) {}

  query(space: string): SpaceQuery {
    let q = this.queries.get(space);
    if (!q) this.queries.set(space, (q = new SpaceQuery(spaceRuntime(space), this.clock)));
    return q;
  }

  spaceOf(playerId: string): string { return this.spaceOfPlayer(playerId); }

  /** A walkable spot (world px) at a place id: landmark:, obj:, area:, zone:, region:, or inst: (its door outside). */
  placePos(placeId: string): { space: string; x: number; y: number } | null {
    const m = markerAt(placeId);
    return m ? { space: m.space, ...standBeside(this.query(m.space), m.at[0], m.at[1]) } : null;
  }

  respawnPoint(playerId: string): { space: string; x: number; y: number } {
    // fallen inside a lair, a cave or the citadel: back at its (safe) entrance, so the run keeps its state and the
    // boss its wounds (Claude 3: a walk back from the waystone into a refilled lair was the 274-death loop)
    const here = this.spaceOfPlayer(playerId);
    if (here.startsWith('inst:') && (!this.confine || here === this.confine)) {
      const gen = spaceRuntime(here).gen as InstanceGen;
      if (gen.entrance) return { space: here, ...standBeside(this.query(here), gen.entrance[0], gen.entrance[1]) };
    }
    // co-op guests (REBUILD.md: they drop into the HOST's world): joining → beside the host; later → the party's point
    const host = !this.confine ? this.party?.host() : null;
    if (host && playerId !== host.id) {
      if (!this.party!.placed(playerId)) return { space: host.space, ...standBeside(this.query(host.space), Math.floor(host.x / TILE_SIZE), Math.floor(host.y / TILE_SIZE)) };
      return this.respawnPoint(host.id);
    }
    const all = allWaystones();
    const last = [...this.wokenOf(playerId)].reverse().map((id) => all.find((w) => w.id === id)).find(Boolean);
    const start = startAreaOf(this.classOf(playerId));
    let ws = last ?? all.find((w) => w.id === start.waystone)!;
    if (this.confine && ws.space !== this.confine) {
      const entry = entryWaystone(this.confine);
      if (!entry) return { space: this.confine, ...standBeside(this.query(this.confine), 8, 8) };
      ws = entry;
    }
    return { space: ws.space, ...standBeside(this.query(ws.space), ws.at[0], ws.at[1]) };
  }

  isWoken(playerId: string, waystoneId: string): boolean {
    return this.wokenOf(playerId).includes(waystoneId) || !!allWaystones().find((w) => w.id === waystoneId)?.startsLit;
  }

  wakeWaystone(playerId: string, waystoneId: string): void {
    const ws = allWaystones().find((w) => w.id === waystoneId);
    if (!ws) return;
    const list = this.wokenOf(playerId);
    const i = list.indexOf(waystoneId);
    if (i >= 0) list.splice(i, 1);
    list.push(waystoneId); // most recent last (respawn point)
    if (i < 0) bus.emit('waystone:woken', { playerId, waystone: waystoneId, space: ws.space });
  }
}
