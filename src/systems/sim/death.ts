/**
 * Deaths (Claude 3): creature deaths (on-death abilities, doom, shatter, XP, loot, enemy:killed) and routing of
 * players at 0 HP to the co-op rules. Boss "rebuilds once" revives here too.
 */
import { LEVEL_CAP, xpForKill, xpToNext } from '@/systems/rules/curves';
import { hook } from '@/systems/rules/stats';
import { runActions } from './actions';
import { basicCast, dealDamage, fireProcs, heal, srcPower } from './combat';
import { onPlayerZero } from './coop';
import { clearHazards } from './hazards';
import { escortZero } from './escort';
import { ELITE } from '@/data/enemies/hc/elites';
import { rollKillLoot } from './loot';
import { rebuildPlayer } from './player';
import type { Combatant, EnemyEnt, PlayerEnt } from './state';
import { dist2, type SimWorld } from './world';

const XP_RANGE = 900;

/** bodies whose death is being resolved right now (re-entry guard) */
const DYING = new WeakSet<Combatant>();

export function onCombatantZero(w: SimWorld, tgt: Combatant, src: Combatant | null): void {
  if (tgt.dead) return;
  if (tgt.kind === 'player') return onPlayerZero(w, tgt as PlayerEnt, src);
  const e = tgt as EnemyEnt;
  // escorts go down (revivable) instead of dying
  if (e.escort) { escortZero(w, e); return; }
  // spare-or-destroy bosses: players can only beat them; scripted damage (no source) destroys them
  if (hook(e.stats, 'yields') && src) {
    e.hp = 1;
    yieldEnemy(w, e);
    return;
  }
  if (hook(e.stats, 'reviveOnce') && !e.revived) {
    e.revived = true;
    e.hp = Math.round(e.maxHp * hook(e.stats, 'reviveOnce'));
    e.statuses.clear();
    e.windup = null;
    w.emit('boss:phase', { enemyId: e.id as never, phase: -1 });
    return;
  }
  // on-death abilities resolve while the body is still "alive" for targeting; a death already in progress is not
  // restarted (an on-death blast the hero parries counter-attacks the dying body: that looped until the stack ran out)
  if (DYING.has(e)) return;
  DYING.add(e);
  e.hp = 0;
  // summoned creatures (adds, splits) never summon again on death: no split cascades
  for (const ab of e.cdef.onDeath) {
    const acts = e.summonerId ? ab.actions.filter((a) => a.a !== 'summon') : ab.actions;
    if (acts.length) runActions(w, acts, { ...basicCast(w, e, null, true), power: e.dmg });
  }
  const doom = e.statuses.get('doom');
  const doomSrc = doom ? w.combatant(doom.sourceId) : undefined;
  e.dead = true;
  if (doom && doomSrc) explode(w, doomSrc, e, doom.power * srcPower(doomSrc), 'umbral');
  if (src && e.statuses.has('freeze') && hook(src.stats, 'shatterFrozen')) explode(w, src, e, srcPower(src) * 1.2, 'rime');
  e.anim = 'die';
  if (e.tier !== 'enemy' && !e.ownerId) { clearHazards(w, e.space); scatterAdds(w, e); }
  w.later(900, () => w.enemies.delete(e.id));
  if (e.ownerId) return; // pets give nothing

  const killerPlayer = src?.kind === 'player' ? (src as PlayerEnt) : src?.kind === 'pet' ? w.players.get((src as EnemyEnt).ownerId ?? '') : undefined;
  if (killerPlayer) {
    fireProcs(w, killerPlayer, 'kill', e);
    const sok = killerPlayer.stats.stats.staminaOnKill ?? 0;
    if (sok) killerPlayer.stamina = Math.min(killerPlayer.staminaMax, killerPlayer.stamina + sok);
  }
  // bloodlust: a melee hero who lands the kill catches its breath (5% max HP); melee bleeds in packs, ranged does not
  if (killerPlayer && src === killerPlayer && !killerPlayer.dead && !['bow', 'staff', 'wand'].includes(killerPlayer.weapon.type)) heal(w, killerPlayer, killerPlayer, killerPlayer.maxHp * 0.05, true);
  const killers = nearPlayers(w, e);
  const eliteXp = e.elite?.length ? ELITE.xp : 1;
  if (!e.yielded) for (const p of killers) grantXp(w, p, xpForKill(p.level, e.level, e.tier) * eliteXp * (1 + (p.stats.stats.xp ?? 0)));
  if (e.team === 'enemies') rollKillLoot(w, e, killers);
  w.emit('enemy:killed', {
    enemyId: e.id, creature: e.cdef.id, tier: e.tier, level: e.level, space: e.space, x: Math.round(e.x), y: Math.round(e.y),
    zoneId: e.zoneId, killers: killers.map((k) => k.playerId), byPlayer: !!killerPlayer,
  });
}

/**
 * A boss stops fighting and waits for the story (spare / destroy / escape): 1 HP at least, invulnerable, dormant.
 * Reached at 0 HP for `yields` bosses, or at any HP when its `yieldOnFlag:<flag>` story beat lands.
 */
export function yieldEnemy(w: SimWorld, e: EnemyEnt): void {
  if (e.yielded || e.dead) return;
  e.yielded = true;
  e.hp = Math.max(1, e.hp);
  // beating it is the victory: XP now (once); loot when the story spares (despawn) or destroys it
  for (const p of nearPlayers(w, e)) grantXp(w, p, xpForKill(p.level, e.level, e.tier) * (1 + (p.stats.stats.xp ?? 0)));
  e.windup = null; e.motion = null; e.statuses.clear(); e.ai = 'dormant'; e.threat.clear();
  e.buffs.push({ id: 'yielded', until: Infinity, sourceId: e.id, mods: [], procs: [], flags: ['invulnerable'] });
  e.statsDirty = true;
  e.anim = 'yield';
  if (e.tier !== 'enemy') { clearHazards(w, e.space); scatterAdds(w, e); }
  w.emit('enemy:yielded', { enemyId: e.id, creature: e.cdef.id, space: e.space, zoneId: e.zoneId, x: Math.round(e.x), y: Math.round(e.y), killers: [...w.players.values()].filter((p) => p.space === e.space).map((p) => p.playerId) });
}

/** A beaten boss or mini takes its called adds with it (no loot, no XP): nothing lingers into the story beat. */
function scatterAdds(w: SimWorld, boss: EnemyEnt): void {
  for (const x of w.enemies.values()) {
    if (x.summonerId !== boss.id || x.dead) continue;
    x.dead = true; x.hp = 0; x.anim = 'die'; x.windup = null;
    w.later(900, () => w.enemies.delete(x.id));
  }
}

export const nearPlayers = (w: SimWorld, e: EnemyEnt): PlayerEnt[] =>
  [...w.players.values()].filter((p) => !p.dead && p.space === e.space && dist2(p, e) <= XP_RANGE * XP_RANGE);

function explode(w: SimWorld, src: Combatant, at: Combatant, amount: number, kind: 'umbral' | 'rime'): void {
  w.emit('ability:cast', { casterId: src.id, ability: kind === 'rime' ? 'shatter' : 'unmaking', x: Math.round(at.x), y: Math.round(at.y), tx: 0, ty: 0, ms: 300 });
  for (const o of w.combatants(at.space)) if (o !== at && w.hostile(src, o) && dist2(o, at) <= 90 * 90) dealDamage(w, src, o, amount, kind, { noProc: true });
}

export function grantXp(w: SimWorld, p: PlayerEnt, amount: number, source = 'kill'): void {
  const xp = Math.max(1, Math.round(amount));
  if (p.save.level >= LEVEL_CAP) return;
  p.save.xp += xp;
  w.emit('loot:granted', { playerId: p.playerId, xp });
  w.emit('xp:gained', { amount: xp, source }); // balance tooling (Claude 2's playthrough splits XP by source)
  let leveled = false;
  while (p.save.level < LEVEL_CAP && p.save.xp >= xpToNext(p.save.level)) {
    p.save.xp -= xpToNext(p.save.level);
    p.save.level++;
    leveled = true;
    w.emit('player:levelup', { playerId: p.playerId, level: p.save.level });
  }
  if (leveled) {
    rebuildPlayer(w, p);
    p.hp = p.maxHp;
    p.ember = p.emberMax;
  }
}
