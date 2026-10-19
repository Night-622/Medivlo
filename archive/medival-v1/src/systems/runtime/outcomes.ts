/**
 * What happens when things end: enemy deaths (XP, loot, events, splits), cleansing, player death/respawn,
 * earned-trait checks.
 */
import { Registry, Services, TILE_SIZE, bus, setFlag } from '@/core';
import type { GameState, TraitId } from '@/core';
import { RANK_LOOT_BOOST, killXp } from '../balance';
import { rollLoot } from '../items/Loot';
import { grantXp } from '../progression/Leveling';
import { fireProcs } from './statusEffects';
import type { CombatRuntime } from './CombatRuntime';
import type { EnemyActor } from './Enemy';

export function bumpCounter(state: GameState, key: string, by = 1): void {
  const c = state.player.counters;
  c[key] = (c[key] ?? 0) + by;
}

/** grant earned traits whose counter requirements are now met */
export function checkEarnedTraits(rt: CombatRuntime): void {
  const gs = rt.player.gs;
  const owned = new Set(gs.player.progression.traits);
  for (const t of Registry.all('trait')) {
    if (t.source !== 'earned' || owned.has(t.id) || t.requirement?.kind !== 'counter') continue;
    if ((gs.player.counters[t.requirement.counter] ?? 0) >= t.requirement.atLeast) grantTrait(rt, t.id);
  }
}

export function grantTrait(rt: CombatRuntime, id: TraitId): void {
  const pr = rt.player.gs.player.progression;
  if (pr.traits.includes(id)) return;
  pr.traits.push(id);
  rt.player.markDirty();
  bus.emit('trait:earned', { traitId: id });
  bus.emit('stats:changed', {});
  rt.ui?.toast(`Trait earned: ${Registry.tryGet('trait', id)?.name ?? id}`, '#d4a646');
}

function rewardKill(rt: CombatRuntime, e: EnemyActor): void {
  const p = rt.player;
  const xp = Math.round(killXp(e.level, e.rank, p.level, e.def.xpMult ?? 1) * p.stats.derived.xpGain);
  grantXp(p.gs, xp, `kill:${e.def.id}`);
  rt.fx.label(e.x, e.y - 10, `+${xp} XP`, '#b9a57c', rt.now, 900);
}

function fadeOut(rt: CombatRuntime, e: EnemyActor, tint?: number): void {
  e.alive = false;
  rt.director.release(e.id);
  if (tint !== undefined) e.sprite.setTint(tint);
  rt.scene.tweens.add({ targets: e.sprite, alpha: 0, scaleY: e.sprite.scaleY * 0.6, duration: 450, onComplete: () => e.destroy() });
}

export function onEnemyKilled(rt: CombatRuntime, e: EnemyActor, byPlayer: boolean): void {
  const gs = rt.player.gs;
  const now = rt.now;
  // Frostjaw: frozen kills shatter into a frost burst
  if (byPlayer && e.status.has('frozen') && rt.player.hook('frozenShatter')) {
    const r = rt.player.hookNum('frozenShatter', 'radius', 90), amt = Math.round(e.maxHp * rt.player.hookNum('frozenShatter', 'pct', 0.6) * 0.25);
    rt.fx.ring(e.x, e.y, r, 0xbdf0f7, now, 350);
    for (const o of rt.enemies) if (o !== e && o.alive && Math.hypot(o.x - e.x, o.y - e.y) <= r + o.radius) rt.directDamage(o, Math.round(amt * (1 - (o.resist.frost ?? 0))), 'frost', rt.player);
  }
  fadeOut(rt, e);
  const c = e.def.cleansable;
  if (c && byPlayer) setFlag(c.flag, 'slain');
  bus.emit('enemy:killed', {
    enemyId: e.def.id, zoneId: e.zoneId, x: e.x, y: e.y, level: e.level, family: e.def.family, variant: e.def.variant, rank: e.rank, byPlayer,
  });
  if (!byPlayer) return;
  bumpCounter(gs, 'kills.total');
  bumpCounter(gs, `kills.family.${e.def.family}`);
  bumpCounter(gs, `kills.enemy.${e.def.id}`);
  if (e.def.variant) bumpCounter(gs, `kills.variant.${e.def.variant}`);
  rewardKill(rt, e);

  // loot
  const p = rt.player;
  const drop = rollLoot(e.def.loot, {
    level: e.level,
    rarityBoost: (1 + 0.25 * (e.tier - 1)) * RANK_LOOT_BOOST[e.rank] * p.stats.derived.itemFind,
    goldFind: p.stats.derived.goldFind,
    proficient: p.stats.collected.proficientWeapons,
  });
  for (const it of drop.items) rt.pickups.spawnItem(it, e.x, e.y, now);
  if (drop.gold) rt.pickups.spawnGold(drop.gold, e.x, e.y, now);

  // on-kill effects
  const d = p.stats.derived;
  if (d.lifeOnKill > 0) p.heal(p.maxHp * d.lifeOnKill);
  p.gainResource(rt.resourceGain('onKill') + p.hookNum('furyOnKill', 'amount', 0), now);
  fireProcs(rt, 'onKill', e);
  const lastSpell = rt.lastPlayerHitWasSpell;
  if (e.def.variant === 'hollowed' && p.hook('emberOnHollowedKill')) p.mana = Math.min(d.maxMana, p.mana + p.hookNum('emberOnHollowedKill', 'amount', 10));
  if (lastSpell && p.hook('leyFlow')) p.mana = Math.min(d.maxMana, p.mana + p.hookNum('leyFlow', 'amount', 8));

  // Mireling-style splits
  for (const tag of e.def.tags ?? []) {
    const m = /^split:(enemy:[a-z0-9-]+):(\d+)$/.exec(tag);
    if (!m) continue;
    for (let i = 0; i < Number(m[2]); i++) {
      const a = (i / Number(m[2])) * Math.PI * 2 + rt.rng.range(0, 1);
      rt.spawnEnemy(m[1], e.x + Math.cos(a) * 16, e.y + Math.sin(a) * 16, { level: e.level, tier: e.tier, noElite: true })?.engage(rt, false);
    }
  }
  if (e.isBoss) rt.ui?.toast(`${e.def.name} has fallen`, '#d4a646');
  checkEarnedTraits(rt);
}

export function onEnemyCleansed(rt: CombatRuntime, e: EnemyActor): void {
  const c = e.def.cleansable;
  if (!c) return;
  const gs = rt.player.gs;
  fadeOut(rt, e, 0xffffff);
  rt.fx.ring(e.x, e.y, 90, 0xffb347, rt.now, 700);
  setFlag(c.flag, c.value);
  bus.emit('enemy:cleansed', { enemyId: e.def.id, flag: c.flag });
  bumpCounter(gs, `cleansed.${e.def.id}`);
  if (e.def.variant) bumpCounter(gs, `kills.variant.${e.def.variant}`);
  rewardKill(rt, e);
  rt.ui?.toast(`${e.def.name} is cleansed`, '#ffe9b0');
  checkEarnedTraits(rt);
}

/** autoYield bosses: defeated without dying; Claude 4's dialogue decides their fate */
export function onEnemyYielded(rt: CombatRuntime, e: EnemyActor): void {
  const now = rt.now;
  onEnemyCleansed(rt, e);
  const p = rt.player;
  const drop = rollLoot(e.def.loot, { level: e.level, rarityBoost: RANK_LOOT_BOOST[e.rank] * p.stats.derived.itemFind, goldFind: p.stats.derived.goldFind, proficient: p.stats.collected.proficientWeapons });
  for (const it of drop.items) rt.pickups.spawnItem(it, e.x, e.y, now);
  if (drop.gold) rt.pickups.spawnGold(drop.gold, e.x, e.y, now);
  bus.emit('enemy:killed', { enemyId: e.def.id, zoneId: e.zoneId, x: e.x, y: e.y, level: e.level, family: e.def.family, variant: e.def.variant, rank: e.rank, byPlayer: true });
}

export function onPlayerDied(rt: CombatRuntime): void {
  const p = rt.player;
  const gs = p.gs;
  p.alive = false;
  p.hp = 0;
  rt.interruptPlayer();
  const w = Services.tryGet('world');
  const regionId = w ? w.regionAt(Math.floor(p.x / TILE_SIZE), Math.floor(p.y / TILE_SIZE)) : '';
  bus.emit('player:died', { x: p.x, y: p.y, regionId });
  // Echo: half the carried gold stays where you fell
  const inv = gs.player.inventory;
  const lost = Math.floor(inv.gold / 2);
  rt.pickups.clearEcho();
  inv.echo = undefined;
  if (lost > 0) {
    inv.gold -= lost;
    const loc = gs.world.location;
    inv.echo = { instance: loc.instance, floor: loc.floor, x: p.x, y: p.y, gold: lost };
    rt.pickups.spawnGold(lost, p.x, p.y, rt.now, true);
  }
  for (const e of rt.enemies) if (e.alive && e.isEngaged()) { e.cancelAttack(rt); e.state = 'return'; }
  rt.director.clear();
  rt.lastHostileAt = 0; // combat ends at death; disengaged fires on the next frame
  rt.ui?.toast('You have fallen', '#c04a4a');
  rt.scene.tweens.add({ targets: p.sprite, alpha: 0.15, angle: 90, duration: 600 });
  rt.scene.time.delayedCall(2600, () => {
    p.x = p.spawnX;
    p.y = p.spawnY;
    p.alive = true;
    p.sprite.setAlpha(1).setAngle(0);
    p.fullRestore();
    bus.emit('player:respawned', {});
  });
}

