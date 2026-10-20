/**
 * One public realm, bundled as an IIFE and evaluated in its OWN vm context by server/main.ts, so the game's
 * singletons (Services, bus, sim, Game) are per-realm. Exposes globalThis.__createRealm(cfg).
 * Runs the same Phaser-free authority code as a co-op host: world (Claude 2), systems (Claude 3), narrative
 * (Claude 4, personal-scope only — no host campaign in public realms).
 * Trusted saves (cfg.trustedSaves, on in production): the player's SAVED hero is seated (server/main.ts reads it from
 * Firestore with the player's own token and passes it to attach), checked here by the game's own validators, and
 * loadouts are ignored. Off (DEV_AUTH tests), the client's first loadout is used, as before.
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
import { sanitizeLoadout } from '@/systems/rules/validate';
import { plausible } from '@/systems/rules/plausible';
import { migrateCharacter } from '@/core/hcMigrate';
import type { CharacterSave } from '@/core/hc';

export interface RealmConfig { id: string; name: string; rule: RealmRule; space: string; maxPlayers: number; trustedSaves?: boolean }
/** The player's saved hero as read from their cloud save (unvalidated). */
export interface SavedHero { character: unknown; playtimeSec: number }
export type AttachResult = { ok: true } | { ok: false; reason: string; log?: string };

export interface RealmApi {
  attach(p: { playerId: string; name: string; classId: string; level: number }, send: (json: string) => void, saved?: SavedHero): AttachResult;
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
  const seated = new Map<string, CharacterSave>();
  const loadCharacter = cfg.trustedSaves ? (pid: string) => Promise.resolve(seated.get(pid) ?? null) : undefined;
  try { installSystemsAuthority({ realmRule: cfg.rule, loadCharacter }); }
  catch (e) { console.warn(`[realm ${cfg.id}] systems authority failed`, e); }
  const players = () => Services.tryGet('combat')?.players().map((p) => ({ id: p.playerId ?? p.id, space: p.space, x: p.x, y: p.y })) ?? [];
  try { installWorldAuthority({ space: cfg.space, players, sim, confine: true, warmStart: true, npcPlacements, place: (pid, space, x, y) => void systemsAuthority()?.sim.teleport(pid, space, x, y) }); }
  catch (e) { console.warn(`[realm ${cfg.id}] world authority failed`, e); }
  try { installNarrativeAuthority(); }
  catch (e) { console.warn(`[realm ${cfg.id}] narrative authority failed`, e); }

  return {
    attach: (p, send, saved) => {
      if (cfg.trustedSaves) {
        const hero = checkSaved(saved);
        if (!hero.ok) return hero;
        seated.set(p.playerId, hero.character);
      }
      if (!net.attach(p, (msg: ServerMsg) => send(JSON.stringify(msg)))) { seated.delete(p.playerId); return { ok: false, reason: 'That realm is full' }; }
      return { ok: true };
    },
    detach: (id) => { net.detach(id); seated.delete(id); },
    receive: (id, json) => { let m: ClientMsg; try { m = JSON.parse(json) as ClientMsg; } catch { return; } net.receive(id, m); },
    tick: (dt) => sim.advance(dt),
    count: () => net.playerCount(),
    full: () => net.full(),
    testProvider: () => {
      net.addProvider({ name: 'test', collect: (viewer) => [{ id: 'e:test', kind: 'enemy', def: 'bx_wolf', space: cfg.space, x: 1, y: 2, facing: 's', anim: 'idle', hp: 10, maxHp: 10, data: { viewer, realm: cfg.id } }] });
    },
  };
}

/** migrate → sanitise → plausibility (Claude 3's rules): the same checks a co-op host applies to a guest, and more. */
function checkSaved(saved: SavedHero | undefined): { ok: true; character: CharacterSave } | { ok: false; reason: string; log: string } {
  const bad = (log: string) => ({ ok: false as const, reason: "This hero's save couldn't be verified for public realms.", log });
  if (!saved?.character || typeof saved.character !== 'object') return bad('no character');
  let c: CharacterSave | null;
  try {
    const migrated = migrateCharacter(structuredClone(saved.character) as CharacterSave);
    // plausibility BEFORE sanitising, so the sanitiser's clamps can't hide tampering (Claude 3)
    const p = plausible(migrated, { playtimeSec: saved.playtimeSec });
    if (!p.ok) return { ok: false, reason: p.reason, log: `implausible: ${p.detail}` };
    // an honest save that loses something here (a retired base, a rune past its slots) is drift: seat it sanitised
    c = sanitizeLoadout(migrated);
  } catch (e) { return bad(`check threw: ${(e as Error).message}`); }
  if (!c) return bad('sanitize rejected');
  return { ok: true, character: c };
}

(globalThis as unknown as { __createRealm: typeof createRealm }).__createRealm = createRealm;
