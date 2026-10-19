/**
 * Escorts (Claude 3, for Claude 4's escort / arrive objectives): an allied creature or NPC that walks with the party,
 * draws some enemy attention, can be revived once (hold F, like a downed hero) and reports arrival or loss.
 *   combat.spawn({ creature, level, space, x, y, follow: playerId | 'party', escort: { npc?, toMarker?, revives?, hp?, fights? } })
 * Events: escort:arrived { id, npc, creature, marker, playerIds }, escort:lost { id, npc, creature, reason },
 * escort:downed { id, npc, until }. Snapshot data: esc, npc, name, down (ms left), rv (revive ms).
 */
import type { SpawnRequest } from '@/core/hc';
import { Btn } from '@/net/types';
import type { EnemyEnt, PlayerEnt } from './state';
import { dist2, freeSpot, type SimWorld } from './world';

export interface EscortMarker { space: string; x: number; y: number; r: number }
/** The SpawnRequest fields escorts use (core/hc). */
export type EscortSpawn = Pick<SpawnRequest, 'follow' | 'escort'>;
export interface EscortState {
  npc?: string;
  to?: EscortMarker;
  revives: number;
  fights: boolean;
  /** playerId, or 'party' (nearest standing party member) */
  follow: string;
  down: { until: number; revive: number; reviver: string | null } | null;
  arrived: boolean;
}

const LEASH = 70, CATCH_UP = 300, TELEPORT = 900;
const DOWN_MS = 30_000, REVIVE_MS = 3000, REVIVE_RANGE = 40;

export function makeEscort(req: EscortSpawn): EscortState | undefined {
  if (!req.escort) return undefined;
  return { npc: req.escort.npc, to: req.escort.toMarker, revives: req.escort.revives ?? 1, fights: !!req.escort.fights, follow: req.follow ?? 'party', down: null, arrived: false };
}

function leaderOf(w: SimWorld, e: EnemyEnt): PlayerEnt | undefined {
  const s = e.escort!;
  const standing = [...w.players.values()].filter((p) => !p.dead && !p.downed);
  if (s.follow !== 'party') return w.players.get(`p:${s.follow}`) ?? standing[0];
  const here = standing.filter((p) => p.space === e.space).sort((a, b) => dist2(a, e) - dist2(b, e));
  return here[0] ?? standing[0];
}

/**
 * One tick of an escort's own movement. Returns true when it handled the tick (following, lying down, arrived);
 * false hands the tick to the normal creature AI (a fighting escort with a foe close by).
 */
export function stepEscort(w: SimWorld, e: EnemyEnt, dt: number, walk: (dir: { x: number; y: number }, speed: number) => void): boolean {
  const s = e.escort!;
  if (s.down) { e.anim = 'down'; return true; }
  if (s.to && !s.arrived && e.space === s.to.space && dist2(e, s.to) <= s.to.r * s.to.r) {
    s.arrived = true;
    w.emit('escort:arrived', { id: e.id, npc: s.npc, creature: e.cdef.id, marker: s.to, playerIds: [...w.players.values()].filter((p) => p.space === e.space).map((p) => p.playerId) });
  }
  if (s.arrived) { if (w.t >= e.animUntil) e.anim = 'idle'; return true; }
  const lead = leaderOf(w, e);
  if (!lead) return true;
  // doors and instances: it comes along (placed beside its leader)
  if (lead.space !== e.space || dist2(lead, e) > TELEPORT * TELEPORT) {
    const at = freeSpot(w, lead.space, lead.x, lead.y, e.id);
    e.space = lead.space; e.x = at.x; e.y = at.y; e.home = { x: at.x, y: at.y };
    return true;
  }
  if (s.fights && w.nearestHostile(e, 140)) return false;
  const d2 = dist2(lead, e);
  if (d2 > LEASH * LEASH) {
    const d = Math.sqrt(d2), speed = Math.max(60, e.cdef.ai.speed || 75) * (d > CATCH_UP ? 1.6 : 1.1);
    // a wall between them: follow the world's A* (re-planned each second); in the open, walk straight
    const to = w.ports.clear(e.space, e.x, e.y, lead.x, lead.y) ? lead : waypoint(w, e, lead);
    const dd = Math.hypot(to.x - e.x, to.y - e.y) || 1;
    walk({ x: (to.x - e.x) / dd, y: (to.y - e.y) / dd }, speed);
  } else if (w.t >= e.animUntil) e.anim = 'idle';
  void dt;
  e.home = { x: e.x, y: e.y };
  return true;
}

/** Next A* waypoint toward the leader (falls back to the leader itself when there is no path port or no path). */
function waypoint(w: SimWorld, e: EnemyEnt, lead: { x: number; y: number }): { x: number; y: number } {
  if (!w.ports.path) return lead;
  if (!e.path.length || w.t >= e.pathAt) {
    e.path = w.ports.path(e.space, e.x, e.y, lead.x, lead.y)?.slice(1) ?? [];
    e.pathAt = w.t + 1000;
  }
  while (e.path.length && dist2(e, e.path[0]) < 10 * 10) e.path.shift();
  return e.path[0] ?? lead;
}

/** At 0 HP: down (revivable) while revives last, otherwise lost. */
export function escortZero(w: SimWorld, e: EnemyEnt): void {
  const s = e.escort!;
  if (s.down || s.revives <= 0) return loseEscort(w, e, 'died');
  s.down = { until: w.t + DOWN_MS, revive: 0, reviver: null };
  e.hp = 1;
  e.windup = null; e.motion = null; e.statuses.clear();
  e.buffs.push({ id: 'escort-down', until: s.down.until, sourceId: e.id, mods: [], procs: [], flags: ['invulnerable', 'untargetable'] });
  e.statsDirty = true;
  e.anim = 'down';
  w.emit('escort:downed', { id: e.id, npc: s.npc, until: s.down.until });
}

export function loseEscort(w: SimWorld, e: EnemyEnt, reason: 'died' | 'despawned'): void {
  if (e.dead && reason === 'died') return;
  const s = e.escort!;
  e.dead = true; e.hp = 0; e.anim = 'die';
  if (reason === 'died') w.later(900, () => w.enemies.delete(e.id));
  if (!s.arrived) w.emit('escort:lost', { id: e.id, npc: s.npc, creature: e.cdef.id, reason });
}

/** Downed escorts: time out, or come back when a standing hero holds F beside them for 3 s. */
export function tickEscorts(w: SimWorld, dt: number): void {
  for (const e of w.enemies.values()) {
    const s = e.escort;
    if (!s?.down || e.dead) continue;
    if (w.t >= s.down.until) { loseEscort(w, e, 'died'); continue; }
    const helper = [...w.players.values()].find((p) => !p.dead && !p.downed && p.space === e.space && (p.buttons & Btn.INTERACT)
      && dist2(p, e) <= (REVIVE_RANGE + p.r + e.r) ** 2 && w.t > p.inCombatUntil - 4500);
    if (!helper || helper.id !== s.down.reviver) s.down.revive = 0;
    s.down.reviver = helper?.id ?? null;
    if (!helper) continue;
    s.down.revive += dt;
    helper.anim = 'revive'; helper.animUntil = w.t + 100;
    if (s.down.revive >= REVIVE_MS) {
      s.revives--;
      s.down = null;
      e.buffs = e.buffs.filter((b) => b.id !== 'escort-down');
      e.statsDirty = true;
      e.hp = Math.round(e.maxHp * 0.5);
      e.anim = 'idle';
    }
  }
}

/**
 * Enemy attention: an engaged creature weighs nearby escorts at 35% of its top grudge, and about a third of them
 * (rolled once per creature) go for the escort first.
 */
export function noticeEscorts(w: SimWorld, e: EnemyEnt): void {
  if (!e.threat.size || e.team === 'players') return;
  for (const x of w.enemies.values()) {
    if (!x.escort || x.escort.down || x.dead || x.space !== e.space || !w.hostile(e, x) || dist2(e, x) > 250 * 250) continue;
    e.huntsEscort ??= w.rng.chance(0.3);
    const top = Math.max(1, ...[...e.threat.entries()].filter(([id]) => id !== x.id).map(([, v]) => v));
    const want = top * (e.huntsEscort ? 1.2 : 0.35);
    if ((e.threat.get(x.id) ?? 0) < want) e.threat.set(x.id, want);
  }
}
