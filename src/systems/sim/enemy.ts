/**
 * Creature AI (Claude 3): idle → engage → return / flee, threat targeting, leash, telegraphed abilities
 * (enemy:telegraph, resolve at the end so players can dash out), boss phases at even HP steps, pets.
 */
import type { CreatureAbility } from '@/data/enemies/hc/abilities';
import type { Action, Area } from '@/systems/rules/types';
import { motionTick, runActions } from './actions';
import { refreshCover } from './hazards';
import { addBuff, basicCast, dealDamage, incapacitated, rooted } from './combat';
import { spawnSummon } from './spawn';
import { noticeEscorts, stepEscort } from './escort';
import { spawnCountMult } from '@/systems/rules/curves';
import type { CastCtx, Combatant, EnemyEnt, PlayerEnt, Vec } from './state';
import { dist, dist2, norm, type SimWorld } from './world';

export function stepEnemy(w: SimWorld, e: EnemyEnt, dt: number): void {
  if (e.dead) return;
  w.refresh(e);
  if (e.expiresAt && w.t >= e.expiresAt) { e.dead = true; w.enemies.delete(e.id); return; }
  // phase thresholds are checked every tick, even mid-charge or mid-wind-up
  if (!e.yielded && !e.storyPet) phases(w, e);
  if (e.motion) return moveMotion(w, e, dt);
  if (w.frozen || incapacitated(e) || e.yielded) return;
  if (e.storyPet) return idle(w, e, dt); // cosmetic: just follow the owner
  if (e.escort && stepEscort(w, e, dt, (dir, speed) => walk(w, e, dir, speed, dt))) return;
  if (e.windup) { if (w.t >= e.windup.until) { const go = e.windup.then; e.windup = null; go(); } return; }
  const target = pickTarget(w, e);
  if (!target) return idle(w, e, dt);
  const d = dist(e, target) - target.r - e.r;
  const ai = e.cdef.ai;
  if (ai.flee && e.hp < e.maxHp * 0.3) return walk(w, e, norm(e.x - target.x, e.y - target.y), ai.speed * 1.2, dt);
  if (w.t >= e.attackReadyAt) {
    const ab = chooseAbility(w, e, d);
    if (ab) return useAbility(w, e, ab, target);
    if (d <= ai.attackRange) return basicAttack(w, e, target);
  }
  // chase / hold range
  const want = ai.ranged ? ai.attackRange * 0.8 : ai.attackRange * 0.9;
  if (d > want && !rooted(e)) walk(w, e, norm(target.x - e.x, target.y - e.y), ai.speed, dt);
  // ranged creatures back off a little, but not out of their home ground (no endless kiting)
  else if (ai.ranged && d < want * 0.4 && !rooted(e) && dist2(e, e.home) < 300 * 300) walk(w, e, norm(e.x - target.x, e.y - target.y), ai.speed * 0.7, dt);
  else e.face = norm(target.x - e.x, target.y - e.y);
}

// ───────────── targeting ─────────────
function pickTarget(w: SimWorld, e: EnemyEnt): Combatant | undefined {
  const ai = e.cdef.ai;
  if (e.ownerId) return petTarget(w, e);
  // forced: taunt → its source; decoys in range
  const taunt = e.statuses.get('taunt');
  if (taunt) { const t = w.combatant(taunt.sourceId); if (t && !t.dead) return t; }
  if (e.ai === 'dormant') {
    if (!e.threat.size && !w.nearestHostile(e, 120)) return undefined;
    e.ai = 'engage';
  }
  noticeEscorts(w, e);
  // hit while walking home: turn around
  if (e.ai === 'return') { if (!e.threat.size) return undefined; e.ai = 'engage'; }
  if (e.ai === 'idle') {
    // a wounded boss watches its whole arena (stealth that broke the fight must not strand it idle at 230 px)
    const sight = e.tier === 'boss' && e.hp < e.maxHp ? Math.max(ai.aggro, 400) : ai.aggro;
    const seen = w.nearestHostile(e, sight, (c) => w.ports.clear(e.space, e.x, e.y, c.x, c.y));
    if (!seen && !e.threat.size) return undefined;
    e.ai = 'engage';
    if (seen) e.threat.set(seen.id, Math.max(1, e.threat.get(seen.id) ?? 0));
  }
  // leash only once the fight has gone quiet (bosses never leash out of their arena)
  if (e.tier !== 'boss' && ai.leash && dist2(e, e.home) > (ai.leash * 1.8) ** 2 && w.t > e.inCombatUntil - 2000) return goHome(w, e);
  let best: Combatant | undefined, bt = -1;
  for (const [id, threat] of e.threat) {
    const c = w.combatant(id);
    if (!c || c.dead || c.space !== e.space || !w.hostile(e, c)) { e.threat.delete(id); continue; }
    if (!w.targetable(c)) continue; // smoke / stealth / downed: keep the grudge, pick someone else
    const score = threat / (1 + dist(e, c) / 400);
    if (score > bt) { bt = score; best = c; }
  }
  best ??= w.nearestHostile(e, ai.aggro * 1.5);
  if (!best) return e.threat.size && w.t < e.inCombatUntil ? undefined : goHome(w, e);
  e.targetId = best.id;
  return best;
}

function petTarget(w: SimWorld, e: EnemyEnt): Combatant | undefined {
  const owner = w.players.get(e.ownerId!);
  if (!owner || owner.dead) { e.dead = true; w.enemies.delete(e.id); return undefined; }
  const t = w.combatant(owner.target);
  if (t && w.hostile(e, t) && w.targetable(t)) return t;
  return w.nearestHostile(owner, 220) ?? undefined;
}

function goHome(w: SimWorld, e: EnemyEnt): undefined {
  // bosses and minis stand their ground and keep their wounds: a death costs the hero time, never the progress made
  if (e.tier !== 'enemy') { e.ai = 'idle'; e.threat.clear(); e.targetId = null; return undefined; }
  e.ai = 'return';
  e.threat.clear();
  e.targetId = null;
  void w;
  return undefined;
}

function idle(w: SimWorld, e: EnemyEnt, dt: number): void {
  if (e.ownerId) {
    const owner = w.players.get(e.ownerId);
    if (owner && dist(e, owner) > 60) walk(w, e, norm(owner.x - e.x, owner.y - e.y), e.cdef.ai.speed, dt);
    return;
  }
  if (e.ai === 'return') {
    // elites keep their wounds like bosses: a hero who falls to a champion comes back to finish it, not to a fresh one
    const keep = !!e.elite?.length;
    if (dist(e, e.home) < 8) { e.ai = 'idle'; if (!keep) e.hp = e.maxHp; e.statuses.clear(); return; }
    if (w.t > e.inCombatUntil && !keep) e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.2 * (dt / 1000));
    walk(w, e, norm(e.home.x - e.x, e.home.y - e.y), e.cdef.ai.speed * 1.3, dt);
  } else if (e.patrol?.length) {
    // patrols walk their route while nothing is in sight
    const to = e.patrol[(e.patrolI ?? 0) % e.patrol.length];
    if (dist2(e, to) < 12 * 12) e.patrolI = ((e.patrolI ?? 0) + 1) % e.patrol.length;
    else walk(w, e, norm(to.x - e.x, to.y - e.y), e.cdef.ai.speed * 0.6, dt);
    e.home = { x: e.x, y: e.y }; // leash from where the patrol was when it engaged
  } else if (e.anim !== 'idle' && w.t >= e.animUntil) e.anim = 'idle';
}

// ───────────── movement ─────────────
function walk(w: SimWorld, e: EnemyEnt, dir: Vec, speed: number, dt: number): void {
  if (rooted(e) || speed <= 0) return;
  let v = speed;
  const chill = e.statuses.get('chill'), slow = e.statuses.get('slow');
  if (chill) v *= 1 - Math.min(0.7, chill.power * Math.min(chill.stacks, 3));
  if (slow) v *= 1 - Math.min(0.7, slow.power);
  if (e.statuses.has('confuse')) dir = { x: dir.y, y: -dir.x };
  // separation so packs don't stack on one pixel
  let sx = 0, sy = 0;
  for (const o of w.enemies.values()) {
    if (o === e || o.dead || o.space !== e.space) continue;
    const dx = e.x - o.x, dy = e.y - o.y, dd = dx * dx + dy * dy, min = (e.r + o.r) ** 2;
    if (dd > 0 && dd < min) { sx += dx / Math.sqrt(dd); sy += dy / Math.sqrt(dd); }
  }
  const s = dt / 1000;
  const mx = (dir.x + sx * 0.6) * v * s, my = (dir.y + sy * 0.6) * v * s;
  // flyers collide too: boss-room walls and world edges hold them (they used to drift through walls while kiting)
  let n = w.ports.move(e.space, e.x, e.y, mx, my, e.r);
  // blocked (a stone, pillar or corner between it and its target): step around it, keeping to the side that worked
  const want = Math.hypot(mx, my);
  if (want > 0.5 && Math.hypot(n.x - e.x, n.y - e.y) < want * 0.3) {
    for (const side of [e.steer ?? 1, -(e.steer ?? 1)]) {
      for (const turn of [0.9, 1.57]) {
        const c = Math.cos(turn * side), si = Math.sin(turn * side);
        const t = w.ports.move(e.space, e.x, e.y, mx * c - my * si, mx * si + my * c, e.r);
        if (Math.hypot(t.x - e.x, t.y - e.y) >= want * 0.5) { n = t; e.steer = side; break; }
      }
      if (n.x !== e.x || n.y !== e.y) break;
    }
  }
  if (n.x !== e.x || n.y !== e.y) e.movedAt = w.t;
  e.x = n.x; e.y = n.y;
  e.face = norm(dir.x, dir.y);
  if (w.t >= e.animUntil) e.anim = 'walk';
}

export function moveMotion(w: SimWorld, c: Combatant, dt: number): void {
  const m = c.motion!, s = dt / 1000, ended = w.t >= m.until;
  const n = w.ports.move(c.space, c.x, c.y, m.vx * s, m.vy * s, c.r);
  c.x = n.x; c.y = n.y; c.movedAt = w.t;
  motionTick(w, c, ended);
  if (ended && c.motion === m) c.motion = null;
}

// ───────────── attacks ─────────────
function basicAttack(w: SimWorld, e: EnemyEnt, t: Combatant): void {
  const ai = e.cdef.ai;
  e.attackReadyAt = w.t + ai.attackMs;
  e.face = norm(t.x - e.x, t.y - e.y);
  e.anim = 'attack'; e.animUntil = w.t + 350;
  if (ai.ranged) {
    // ranged bosses / minis: autos are chip damage, the telegraphed abilities are the threat (Skyrender out-shot every 563-HP caster)
    runActions(w, [{ a: 'projectile', coef: e.tier === 'enemy' ? 1 : 0.7, speed: 280, range: ai.attackRange + 60, visual: `${e.cdef.kind}-orb` }], { ...basicCast(w, e, t), power: e.dmg });
    return;
  }
  // short wind-up: a dash breaks contact
  e.windup = {
    until: w.t + 280, label: 'basic', then: () => {
      if (!t.dead && dist(e, t) <= ai.attackRange + t.r + e.r + 12) dealDamage(w, e, t, e.dmg * w.rng.range(0.85, 1.15), e.cdef.kind === 'umbral' && e.tier === 'enemy' ? 'physical' : e.cdef.kind);
    },
  };
}

function available(e: EnemyEnt): CreatureAbility[] {
  return [...e.cdef.abilities, ...e.cdef.phases.slice(0, e.phase + 1).flat()].filter((a) => a.use === 'attack' || a.use === 'self');
}

function chooseAbility(w: SimWorld, e: EnemyEnt, d: number): CreatureAbility | undefined {
  if (e.ownerId) return undefined;
  const ready = available(e).filter((a) => w.t >= (e.abilityReadyAt.get(a) ?? 0) && (a.use === 'self' || d <= Math.max(a.range, e.cdef.ai.attackRange)));
  if (!ready.length || w.rng.chance(e.tier === 'enemy' ? 0.3 : 0.15)) return undefined;
  return w.rng.pick(ready);
}

function areaOf(actions: Action[]): Area | undefined {
  for (const a of actions) {
    if ('area' in a && a.area) return a.area as Area;
    if (a.a === 'zone') return a.area;
    if (a.a === 'repeat' || a.a === 'delay') { const x = areaOf(a.then); if (x) return x; }
    if (a.a === 'move') return { shape: 'line', at: 'self', len: a.dist, width: 36 };
  }
  return undefined;
}

function useAbility(w: SimWorld, e: EnemyEnt, ab: CreatureAbility, t: Combatant): void {
  e.abilityReadyAt.set(ab, w.t + ab.cd * (e.tier === 'boss' ? 0.9 : 1));
  e.attackReadyAt = w.t + Math.max(600, e.cdef.ai.attackMs * 0.8);
  const lockAim = { x: t.x, y: t.y };
  e.face = norm(t.x - e.x, t.y - e.y);
  const cast: CastCtx = { ...basicCast(w, e, t, true), power: e.dmg, aim: lockAim, dir: e.face };
  const area = areaOf(ab.actions);
  if (area && ab.windup > 0) {
    const at = area.at === 'self' ? e : lockAim;
    w.emit('enemy:telegraph', {
      id: e.id, shape: area.shape === 'single' ? 'circle' : area.shape, x: Math.round(at.x), y: Math.round(at.y),
      r: Math.round(area.shape === 'line' ? area.len ?? 100 : area.r ?? 40), w: area.width ?? 0,
      angle: Math.round((Math.atan2(e.face.y, e.face.x) * 180) / Math.PI), ms: ab.windup,
    });
  }
  e.anim = 'cast'; e.animUntil = w.t + ab.windup + 200;
  e.windup = { until: w.t + ab.windup, label: ab.text, then: () => runActions(w, ab.actions, cast) };
}

function phases(w: SimWorld, e: EnemyEnt): void {
  const n = e.cdef.phases.length;
  if (n > 1) {
    const want = Math.min(n - 1, Math.floor((1 - e.hp / e.maxHp) * n));
    if (want > e.phase) {
      e.phase = want;
      w.emit('boss:phase', { enemyId: e.id as never, phase: want + 1 });
      addBuff(w, e, e, { a: 'buff', id: 'phase-shift', dur: 1500, to: 'self', flags: ['invulnerable'] });
      for (const ab of e.cdef.phases[want] ?? []) e.abilityReadyAt.set(ab, w.t + 1600);
      e.anim = 'roar'; e.animUntil = w.t + 1500;
      refreshCover(w, e.space);
      startInterlude(w, e);
    }
  }
  // minis: one interlude at half health
  if (e.tier === 'mini' && e.interludes === 0 && e.hp < e.maxHp * 0.5) startInterlude(w, e);
  endInterlude(w, e);
  if (e.cdef.lowHp.length && e.hp < e.maxHp * 0.3 && !e.buffs.some((b) => b.id === 'enrage')) {
    for (const ab of e.cdef.lowHp) runActions(w, ab.actions, { ...basicCast(w, e, null, true), power: e.dmg });
  }
}

/**
 * Interlude (PACING.md): at a boss phase change, or at half health for a mini, the creature wards itself and calls a
 * wave of adds from its home ground. The ward drops when the wave is dead, or after 20 s. Waves scale with the party.
 * Yielding and story bosses keep their own rules; summoned and pet creatures never call interludes.
 */
function startInterlude(w: SimWorld, e: EnemyEnt): void {
  if (e.ownerId || e.summonerId || e.yielded || e.tier === 'enemy') return;
  e.interludes++;
  const base = e.tier === 'boss' ? 3 : 2;
  const count = Math.round(base * spawnCountMult(w.ports.partySize()));
  spawnSummon(w, { ...basicCast(w, e, null, true), power: e.dmg }, 'same-region', count, 0, 1);
  addBuff(w, e, e, { a: 'buff', id: 'interlude', dur: 20_000, to: 'self', flags: ['invulnerable'] });
  w.emit('ability:cast', { casterId: e.id, ability: 'interlude', x: Math.round(e.x), y: Math.round(e.y), tx: 0, ty: 0, ms: 1500 });
}

function endInterlude(w: SimWorld, e: EnemyEnt): void {
  const ward = e.buffs.find((b) => b.id === 'interlude');
  if (!ward) return;
  const adds = [...w.enemies.values()].some((x) => x.summonerId === e.id && !x.dead);
  if (!adds) { ward.until = w.t; e.statsDirty = true; }
}

export type { PlayerEnt };
