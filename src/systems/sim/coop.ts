/**
 * Co-op and PvP rules (Claude 3, HOLLOW_CROWN.md §6): downed state, hold-F revive, party wipe and waystone
 * respawn, PvP deaths by realm rule (duels end at 1 HP, arena no penalty, free-for-all drops 20% gold).
 */
import { Btn } from '@/net/types';
import { dropPvpGold } from './loot';
import type { Combatant, EnemyEnt, PlayerEnt } from './state';
import { dist2, freeSpot, type SimWorld } from './world';

const DOWNED_MS = 30_000;
const REVIVE_MS = 3_000;
const REVIVE_RANGE = 40;
const WIPE_RESPAWN_MS = 8_000;
const PVP_RESPAWN_MS = 5_000;

const ownerOf = (w: SimWorld, c: Combatant | null): PlayerEnt | undefined =>
  !c ? undefined : c.kind === 'player' ? (c as PlayerEnt) : c.kind === 'pet' ? w.players.get((c as EnemyEnt).ownerId ?? '') : undefined;

export function onPlayerZero(w: SimWorld, p: PlayerEnt, src: Combatant | null): void {
  // already down: a DoT tick or hazard must not restart the downed timer or wipe the revive in progress
  if (p.downed) { p.hp = 0; return; }
  const killer = ownerOf(w, src);
  if (killer && killer !== p) return pvpDeath(w, p, killer);
  const standing = [...w.players.values()].filter((o) => o !== p && !o.dead && !o.downed);
  if (standing.length) {
    p.hp = 0;
    p.downed = { until: w.t + DOWNED_MS, revive: 0, reviver: null };
    p.statuses.clear();
    p.windup = null;
    p.motion = null;
    w.emit('player:downed', { playerId: p.playerId });
    return;
  }
  wipe(w, p, src);
}

function die(w: SimWorld, p: PlayerEnt, respawnInMs: number, killer?: Combatant | null): void {
  p.hp = 0;
  p.dead = true;
  p.downed = null;
  p.windup = null;
  p.motion = null;
  p.respawnAt = respawnInMs === Infinity ? Infinity : w.t + respawnInMs;
  const k = killer ?? (p.lastHitBy ? w.combatant(p.lastHitBy) : undefined);
  const killerDef = k?.kind === 'player' ? `player:${(k as PlayerEnt).playerId}` : (k as EnemyEnt | undefined)?.cdef?.id;
  const killerName = k?.kind === 'player' ? (k as PlayerEnt).playerId : (k as EnemyEnt | undefined)?.cdef?.name;
  w.emit('player:died', { playerId: p.playerId, x: Math.round(p.x), y: Math.round(p.y), regionId: p.space, killer: killerDef, killerName });
}

/** Everyone is down: all respawn at their waystone, 10% of carried Embershards lost. Solo waits for the Death screen. */
function wipe(w: SimWorld, last: PlayerEnt, killer?: Combatant | null): void {
  const solo = w.players.size === 1;
  for (const p of w.players.values()) {
    if (p.dead) continue;
    const lost = Math.floor(p.save.gold * 0.1);
    if (lost > 0) { p.save.gold -= lost; w.emit('loot:granted', { playerId: p.playerId, gold: -lost }); }
    die(w, p, solo ? Infinity : WIPE_RESPAWN_MS, p === last ? killer : null);
  }
  w.emit('party:wiped', { waystone: last.save.waystone ?? '' });
}

function pvpDeath(w: SimWorld, p: PlayerEnt, killer: PlayerEnt): void {
  switch (w.ports.realmRule()) {
    case 'duels':
      // a bleed left over from a finished duel ends nothing: the duel is already over
      if (!p.duelWith) { p.hp = 1; return; }
      p.hp = 1;
      p.duelWith = null;
      killer.duelWith = null;
      w.emit('pvp:kill', { killer: killer.playerId, victim: p.playerId, gold: 0 });
      w.emit('duel:ended', { winner: killer.playerId, loser: p.playerId });
      return;
    case 'arena':
      w.emit('pvp:kill', { killer: killer.playerId, victim: p.playerId, gold: 0 });
      die(w, p, PVP_RESPAWN_MS, killer);
      return;
    default: {
      const gold = dropPvpGold(w, p, killer);
      w.emit('pvp:kill', { killer: killer.playerId, victim: p.playerId, gold });
      die(w, p, PVP_RESPAWN_MS, killer);
    }
  }
}

export function respawn(w: SimWorld, p: PlayerEnt): void {
  const rp = w.ports.respawnPoint(p.playerId);
  // a whole party respawning at one waystone fans out instead of stacking
  const at = freeSpot(w, rp.space, rp.x, rp.y, p.id);
  p.space = at.space; p.x = at.x; p.y = at.y;
  p.dead = false; p.downed = null; p.respawnAt = 0;
  p.hp = p.maxHp; p.ember = p.emberMax; p.stamina = p.staminaMax; p.shield = 0;
  p.statuses.clear(); p.buffs = []; p.statsDirty = true; p.target = null; p.motion = null; p.windup = null;
  p.spawnProtectUntil = w.t + 5000;
  for (const e of w.enemies.values()) { e.threat.delete(p.id); if (e.targetId === p.id) e.targetId = null; }
  w.emit('player:respawned', {} as never);
  w.emit('combat:hit', { x: Math.round(p.x), y: Math.round(p.y), sourceId: p.id, targetId: p.id, amount: 0, type: 'radiance', crit: false, kind: 'immune' });
}

function revive(w: SimWorld, p: PlayerEnt, by: Combatant, pct: number): void {
  p.downed = null;
  p.hp = Math.max(1, Math.round(p.maxHp * pct));
  p.spawnProtectUntil = w.t + 1500;
  w.emit('player:revived', { playerId: p.playerId, by: by.kind === 'player' ? (by as PlayerEnt).playerId : by.id });
}

/** Saga of Heroes and similar: revive downed allies in range. */
export function reviveNear(w: SimWorld, caster: Combatant, r: number, pct: number): void {
  for (const p of w.players.values()) if (p.downed && p.space === caster.space && dist2(p, caster) <= r * r && w.ally(caster, p)) revive(w, p, caster, pct);
}

export function tickCoop(w: SimWorld, dt: number): void {
  for (const p of w.players.values()) {
    if (p.dead) {
      if (w.t >= p.respawnAt) respawn(w, p);
      continue;
    }
    if (!p.downed) continue;
    if (w.t >= p.downed.until) { die(w, p, WIPE_RESPAWN_MS); continue; }
    // the first standing ally holding F in range channels the revive; moving away or taking damage resets it
    const helper = [...w.players.values()].find((o) => o !== p && !o.dead && !o.downed && o.space === p.space
      && (o.buttons & Btn.INTERACT) && dist2(o, p) <= (REVIVE_RANGE + o.r) ** 2 && w.t > o.inCombatUntil - 4500);
    if (!helper || helper.id !== p.downed.reviver) p.downed.revive = 0;
    p.downed.reviver = helper?.id ?? null;
    if (helper) {
      p.downed.revive += dt;
      helper.anim = 'revive';
      helper.animUntil = w.t + 100;
      if (p.downed.revive >= REVIVE_MS) revive(w, p, helper, 0.3);
    }
  }
  const alive = [...w.players.values()].filter((p) => !p.dead && !p.downed);
  const downed = [...w.players.values()].filter((p) => p.downed);
  if (!alive.length && downed.length) wipe(w, downed[0]);
}
