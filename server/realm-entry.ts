/**
 * One public realm, bundled as an IIFE and evaluated in its OWN vm context by server/main.ts, so the game's
 * singletons (Services, bus, sim, Game) are per-realm. Exposes globalThis.__createRealm(cfg).
 * Runs the same Phaser-free authority code as a co-op host: world (Claude 2), systems (Claude 3), narrative
 * (Claude 4, personal-scope only — no host campaign in public realms).
 * TODO(deploy): pass loadCharacter (Firestore admin read of the player's save) so PvP stats can't be forged;
 * until then the client's loadout message is trusted.
 */
import { Game, Registry, Services, createNewGameState } from '@/core';
import { WORLD_SEED } from '@/core/constants';
import { SimLoop } from '@/net/SimLoop';
import { sim } from '@/net/SimLoop';
import type { ClientMsg, RealmRule, ServerMsg } from '@/net/types';
import { ServerNet } from '@/net/server/ServerNet';
import { installWorldAuthority } from '@/world/hc/authority';
import { installNarrativeAuthority, npcPlacements } from '@/narrative/engine';
import { installSystemsAuthority, systemsAuthority } from '@/systems/sim';

export interface RealmConfig { id: string; name: string; rule: RealmRule; space: string; maxPlayers: number }

export interface RealmApi {
  attach(p: { playerId: string; name: string; classId: string; level: number }, send: (json: string) => void): boolean;
  detach(playerId: string): void;
  receive(playerId: string, json: string): void;
  tick(dtMs: number): void;
  count(): number;
  full(): boolean;
  /** Test hook: register a fake entity provider (server/test). */
  testProvider?(): void;
}

function createRealm(cfg: RealmConfig): RealmApi {
  void SimLoop;
  Game.set(createNewGameState(0));
  try { Registry.load(); } catch (e) { console.warn(`[realm ${cfg.id}] registry load failed`, e); }
  const net = new ServerNet(cfg.id, cfg.rule, cfg.maxPlayers, WORLD_SEED);
  Services.register('net', net);
  sim.attach(net);
  try { installSystemsAuthority({ realmRule: cfg.rule }); }
  catch (e) { console.warn(`[realm ${cfg.id}] systems authority failed`, e); }
  const players = () => Services.tryGet('combat')?.players().map((p) => ({ id: p.playerId ?? p.id, space: p.space, x: p.x, y: p.y })) ?? [];
  try { installWorldAuthority({ space: cfg.space, players, sim, confine: true, warmStart: true, npcPlacements, place: (pid, space, x, y) => void systemsAuthority()?.sim.teleport(pid, space, x, y) }); }
  catch (e) { console.warn(`[realm ${cfg.id}] world authority failed`, e); }
  try { installNarrativeAuthority(); }
  catch (e) { console.warn(`[realm ${cfg.id}] narrative authority failed`, e); }

  return {
    attach: (p, send) => net.attach(p, (msg: ServerMsg) => send(JSON.stringify(msg))),
    detach: (id) => net.detach(id),
    receive: (id, json) => { let m: ClientMsg; try { m = JSON.parse(json) as ClientMsg; } catch { return; } net.receive(id, m); },
    tick: (dt) => sim.advance(dt),
    count: () => net.playerCount(),
    full: () => net.full(),
    testProvider: () => {
      net.addProvider({ name: 'test', collect: (viewer) => [{ id: 'e:test', kind: 'enemy', def: 'bx_wolf', space: cfg.space, x: 1, y: 2, facing: 's', anim: 'idle', hp: 10, maxHp: 10, data: { viewer, realm: cfg.id } }] });
    },
  };
}

(globalThis as unknown as { __createRealm: typeof createRealm }).__createRealm = createRealm;
