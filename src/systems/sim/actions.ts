/**
 * Action executor (Claude 3): runs the Action language used by spells, procs, gear sets, legendaries and creature
 * abilities. Area targeting, projectiles, zones, movement, summons and resources all start here.
 */
import type { Action, Area, HitFlag } from '@/systems/rules/types';
import { addBuff, addShield, applyStatus, dealDamage, heal } from './combat';
import { reviveNear } from './coop';
import { shadedBy } from './hazards';
import { spawnDecoy, spawnSummon } from './spawn';
import type { CastCtx, Combatant, PlayerEnt, Vec } from './state';
import { dist2, norm, type SimWorld } from './world';
import { itemInfo } from '@/systems/rules/gear';

const SCREEN = 420;

/** Where an area is centred. */
export function origin(area: Area, c: CastCtx): Vec {
  if (area.at === 'self') return { x: c.caster.x, y: c.caster.y };
  if (area.at === 'target' && !c.locked && c.target && !c.target.dead) return { x: c.target.x, y: c.target.y };
  return c.aim;
}

/** The cast's target, unless the cast is locked (telegraphed) and the target has stepped out of reach of the aim. */
export function lockedTarget(c: CastCtx, slack: number): Combatant | null {
  const t = c.target;
  if (!t || t.dead || c.unreachable) return null;
  if (!c.locked) return t;
  return Math.hypot(t.x - c.aim.x, t.y - c.aim.y) <= t.r + slack ? t : null;
}

/** Combatants inside an area. hostile=true picks foes of the caster, false picks allies (self included). */
export function inArea(w: SimWorld, area: Area, c: CastCtx, hostile: boolean, max?: number): Combatant[] {
  const o = origin(area, c), caster = c.caster, mult = c.areaMult;
  const pick = (x: Combatant) => (hostile ? w.hostile(caster, x) && w.targetable(x) : w.ally(caster, x) && !x.dead);
  // out of the spell's range: whatever lands on the target (or around it) does nothing
  if (c.unreachable && hostile && (area.shape === 'single' || area.at === 'target')) return [];
  if (area.shape === 'single') {
    const tgt = lockedTarget(c, (area.r ?? 0) + 12);
    if (tgt && pick(tgt)) return [tgt];
    if (c.locked) return hostile ? [] : [caster]; // dodged: a telegraphed bite never jumps to someone else
    const near = w.nearestHostile(caster, Math.max(area.r ?? 0, 140));
    return hostile && near ? [near] : hostile ? [] : [caster];
  }
  const out: Combatant[] = [];
  const r = (area.r ?? 0) * mult, d = c.dir;
  const shade = hostile && caster.kind === 'enemy' && w.hazards.size > 0;
  for (const x of w.combatants(caster.space)) {
    if (!pick(x)) continue;
    if (shade && x.kind === 'player' && shadedBy(w, caster.space, o.x, o.y, x)) continue;
    const dx = x.x - o.x, dy = x.y - o.y, dd = Math.hypot(dx, dy), reach = x.r;
    let inside = false;
    switch (area.shape) {
      case 'circle': inside = dd <= r + reach; break;
      case 'ring': inside = dd > r && dd <= SCREEN; break;
      case 'cone': {
        if (dd > r + reach) break;
        // a body overlapping the cone's edge counts: widen the half-angle by the angle the body covers at that distance
        const cos = dd < 1 ? 1 : (dx * d.x + dy * d.y) / dd;
        const half = ((area.angle ?? 90) * Math.PI) / 360 + Math.asin(Math.min(1, reach / Math.max(1, dd)));
        inside = half >= Math.PI || cos >= Math.cos(half) || dd < reach + 8;
        break;
      }
      case 'line': {
        const len = (area.len ?? 100) * mult, half = ((area.width ?? 24) * mult) / 2;
        const along = dx * d.x + dy * d.y, across = Math.abs(-dx * d.y + dy * d.x);
        inside = along >= -reach && along <= len + reach && across <= half + reach;
        break;
      }
    }
    if (inside) out.push(x);
  }
  out.sort((a, b) => dist2(a, o) - dist2(b, o));
  return max ? out.slice(0, max) : out;
}

/** Allies for heal/buff/shield `to`. */
function recipients(w: SimWorld, to: string, c: CastCtx, r?: number): Combatant[] {
  switch (to) {
    case 'self': return [c.caster];
    case 'target': return c.target && !w.hostile(c.caster, c.target) ? [c.target] : [c.caster];
    case 'party': return [...w.players.values()].filter((p) => !p.dead && p.team === c.caster.team);
    case 'allies': return inArea(w, { shape: 'circle', at: 'self', r: r ?? 200 }, { ...c, areaMult: 1 }, false);
    default: return inArea(w, { shape: 'circle', at: 'aim', r: r ?? 80 }, { ...c, areaMult: 1 }, false);
  }
}

export function runActions(w: SimWorld, actions: Action[], c: CastCtx): void {
  if (c.depth > 4 || c.caster.dead) return;
  for (const a of actions) run(w, a, c);
}

function hitPush(w: SimWorld, c: CastCtx, t: Combatant, flags: HitFlag[] | undefined): void {
  if (!flags || t.dead) return;
  const away = norm(t.x - c.caster.x, t.y - c.caster.y);
  const push = (dx: number, dy: number, dist: number) => {
    // bosses shrug off knockback, except the ones whose set piece is being knocked into an anchor
    if (t.kind === 'enemy' && (t as { tier?: string }).tier === 'boss' && !t.stats.hooks.get('anchorStun')) return;
    t.motion = { vx: (dx * dist) / 0.2, vy: (dy * dist) / 0.2, until: w.t + 200, iframes: false, left: dist };
  };
  if (flags.includes('knockback')) push(away.x, away.y, 60);
  if (flags.includes('launch')) push(away.x, away.y, 110);
  if (flags.includes('pull')) push(-away.x, -away.y, Math.min(80, Math.sqrt(dist2(t, c.caster)) - 30));
}

function run(w: SimWorld, a: Action, c: CastCtx): void {
  const caster = c.caster;
  switch (a.a) {
    case 'damage': {
      const targets = inArea(w, a.area, c, true, a.maxTargets);
      for (const t of targets) {
        dealDamage(w, caster, t, a.coef * c.power * c.dmgMult, a.kind ?? c.kind, { cast: c, isSpell: c.isSpell, flags: [...(a.flags ?? []), ...c.flags], status: a.status });
        hitPush(w, c, t, a.flags);
      }
      if (targets.length) w.emit('ability:cast', { casterId: caster.id, ability: 'hit', x: Math.round(origin(a.area, c).x), y: Math.round(origin(a.area, c).y), tx: 0, ty: 0, ms: 0 });
      return;
    }
    case 'projectile': {
      const n = a.count ?? 1, spread = ((a.spread ?? 0) * Math.PI) / 180;
      const base = Math.atan2(c.dir.y, c.dir.x);
      for (let i = 0; i < n; i++) {
        const ang = n > 1 ? base - spread / 2 + (spread * i) / (n - 1) : base;
        const id = w.nextId('proj');
        w.projectiles.set(id, {
          id, space: caster.space, x: caster.x + Math.cos(ang) * (caster.r + 4), y: caster.y + Math.sin(ang) * (caster.r + 4),
          vx: Math.cos(ang) * a.speed, vy: Math.sin(ang) * a.speed, travelled: 0, range: a.range, radius: a.radius ?? 6,
          coef: a.coef * c.dmgMult, kind: a.kind ?? c.kind, status: a.status, flags: [...(a.flags ?? []), ...c.flags], onHit: a.onHit,
          pierce: !!a.pierce, bounce: a.bounce ?? 0, homing: a.homing && c.target ? c.target.id : null, hit: new Set(),
          cast: c, visual: a.visual ?? `${a.kind ?? c.kind}-bolt`, team: caster.team, dead: false,
        });
      }
      return;
    }
    case 'chain': {
      const first = lockedTarget(c, 24);
      let from: Vec = caster, cur = first && w.hostile(caster, first) && w.targetable(first) ? first : c.locked || c.unreachable ? null : w.nearestHostile(caster, 280);
      const hit = new Set<string>();
      const jumps = a.jumps + (caster.stats.stats.chains ?? 0);
      for (let i = 0; i <= jumps && cur; i++) {
        hit.add(cur.id);
        w.emit('ability:cast', { casterId: caster.id, ability: 'chain', x: Math.round(from.x), y: Math.round(from.y), tx: Math.round(cur.x), ty: Math.round(cur.y), ms: 150 });
        dealDamage(w, caster, cur, a.coef * c.power * c.dmgMult * Math.pow(0.85, i), a.kind ?? c.kind, { cast: c, isSpell: c.isSpell, status: a.status, flags: c.flags, noProc: i > 0 });
        from = cur;
        const prev: Combatant = cur;
        cur = w.nearestHostile(caster, 9999, (x) => !hit.has(x.id) && dist2(x, prev) <= a.range * a.range);
      }
      return;
    }
    case 'heal': {
      for (const t of recipients(w, a.to, c, a.r)) {
        // creature heals scale from the healer (a choir monk must not heal a boss for 15% of its life)
        const pool = caster.kind === 'enemy' ? Math.min(t.maxHp, caster.maxHp) : t.maxHp;
        const amt = (a.coef ?? 0) * c.power * c.dmgMult + (a.pctMax ?? 0) * pool;
        if (a.over) {
          const n = Math.max(1, Math.round(a.over * (1 + (caster.stats.hooks.get('hotDur') ?? 0)) / 500));
          for (let i = 1; i <= n; i++) w.later(i * 500, () => heal(w, caster, t, amt / n, i < n));
        } else heal(w, caster, t, amt);
      }
      return;
    }
    case 'shield':
      // creature shields scale from the caster, like creature heals
      for (const t of recipients(w, a.to, c, a.r)) addShield(w, t, a.pctMax * (caster.kind === 'enemy' ? Math.min(t.maxHp, caster.maxHp) : t.maxHp), a.dur);
      return;
    case 'buff':
      for (const t of a.to === 'target' && c.target ? [c.target] : recipients(w, a.to, c, a.r)) addBuff(w, caster, t, a, c.durMult);
      return;
    case 'status':
      for (const t of inArea(w, a.area, c, true, a.maxTargets)) applyStatus(w, caster, t, { ...a.status, dur: a.status.dur ? a.status.dur * c.durMult : undefined }, c);
      return;
    case 'move': return startMove(w, a, c);
    case 'pull': case 'knock':
      for (const t of inArea(w, a.area, c, true)) hitPush(w, c, t, [a.a === 'pull' ? 'pull' : 'knockback']);
      return;
    case 'zone': {
      const o = origin(a.area, c);
      if (a.kind === 'decoy') { spawnDecoy(w, c, o, a.dur * c.durMult); return; }
      const id = w.nextId('fx');
      const dur = a.dur * c.durMult * (1 + (caster.stats.hooks.get('zoneDur') ?? 0));
      w.zones.set(id, {
        id, space: caster.space, kind: a.kind, visual: a.visual ?? a.kind, x: o.x, y: o.y,
        area: { ...a.area, r: (a.area.r ?? 0) * c.areaMult, len: a.area.len, width: a.area.width }, dir: c.dir,
        until: w.t + dur, tick: a.tick ?? 0, nextTick: w.t + (a.tick ?? 0), each: a.each && pinToZone(a.each), trigger: a.trigger && pinToZone(a.trigger),
        blocksShots: !!a.blocksShots, taunts: !!a.taunts, cast: { ...c, aim: o }, team: caster.team, dead: false,
      });
      return;
    }
    case 'summon': spawnSummon(w, c, a.what, a.count, a.dur, a.power); return;
    case 'resource': {
      const t = a.to === 'target' && c.target ? c.target : caster;
      if (t.kind === 'player') {
        const p = t as PlayerEnt;
        if (a.ember) p.ember = Math.max(0, Math.min(p.emberMax, p.ember + a.ember));
        if (a.stamina) p.stamina = Math.max(0, Math.min(p.staminaMax, p.stamina + a.stamina));
        if (a.momentum) p.momentum = Math.max(0, Math.min(Math.round(p.stats.stats.maxMomentum ?? 5), p.momentum + a.momentum));
      }
      if (a.hpPct) t.hp = Math.max(1, Math.min(t.maxHp, t.hp + a.hpPct * t.maxHp));
      return;
    }
    case 'cooldowns':
      for (const t of a.to === 'self' ? [caster] : recipients(w, 'allies', c, a.r ?? 400)) {
        if (t.kind !== 'player') continue;
        const p = t as PlayerEnt;
        // a cooldown reset (Encore) never refunds the very spell that cast it
        for (const [k, v] of p.cds) if (!(t === caster && k === c.spellId)) p.cds.set(k, a.reduceMs === 'all' ? w.t : Math.max(w.t, v - a.reduceMs));
      }
      return;
    case 'cleanse':
      for (const t of recipients(w, a.to, c)) for (const s of ['burn', 'chill', 'freeze', 'bleed', 'poison', 'root', 'slow', 'blind', 'confuse', 'weaken', 'mark'] as const) t.statuses.delete(s);
      return;
    case 'delay': w.later(a.ms, () => runActions(w, a.then, { ...c, depth: c.depth + 1 })); return;
    case 'repeat':
      for (let i = 0; i < a.n; i++) w.later(i * a.every, () => runActions(w, a.then, { ...c, depth: c.depth + 1 }));
      return;
    case 'revive': reviveNear(w, caster, a.r, a.pctMax); return;
    case 'steal': return steal(w, a, c);
  }
}

/** Ground effects stay where they were placed: their tick areas centre on the zone, not on whoever is nearest. */
function pinToZone(acts: Action[]): Action[] {
  return acts.map((x) => ('area' in x && x.area && x.area.shape !== 'single' ? { ...x, area: { ...x.area, at: 'aim' as const } } : x)) as Action[];
}

/** Dash / leap / charge / blink / behind. Path actions hit each foe crossed once; land actions run on arrival. */
function startMove(w: SimWorld, a: Extract<Action, { a: 'move' }>, c: CastCtx): void {
  const me = c.caster;
  // blink / behind / leap onto a target beyond the spell's range: no move at all
  if (c.unreachable && (a.mode === 'blink' || a.mode === 'behind' || a.mode === 'leap')) return;
  if (a.mode === 'blink' || a.mode === 'behind') {
    const t = c.locked ? lockedTarget(c, 40) : c.target && !c.target.dead ? c.target : w.nearestHostile(me, a.dist);
    if (!t && c.locked) {
      // the target stepped away from the telegraph: blink to the marked spot and land there
      const p = w.ports.move(me.space, me.x, me.y, c.aim.x - me.x, c.aim.y - me.y, me.r);
      w.emit('ability:cast', { casterId: me.id, ability: 'blink', x: Math.round(me.x), y: Math.round(me.y), tx: Math.round(p.x), ty: Math.round(p.y), ms: 0 });
      me.x = p.x; me.y = p.y;
      if (a.land) runActions(w, a.land, { ...c, target: null, depth: c.depth + 1 });
      return;
    }
    if (!t) return;
    const off = a.mode === 'behind' ? { x: -t.face.x * (t.r + me.r + 4), y: -t.face.y * (t.r + me.r + 4) } : norm(me.x - t.x, me.y - t.y);
    const dest = a.mode === 'behind' ? { x: t.x + off.x, y: t.y + off.y } : { x: t.x + off.x * (t.r + me.r + 4), y: t.y + off.y * (t.r + me.r + 4) };
    const p = w.ports.move(me.space, me.x, me.y, dest.x - me.x, dest.y - me.y, me.r);
    w.emit('ability:cast', { casterId: me.id, ability: 'blink', x: Math.round(me.x), y: Math.round(me.y), tx: Math.round(p.x), ty: Math.round(p.y), ms: 0 });
    me.x = p.x; me.y = p.y;
    me.face = norm(t.x - me.x, t.y - me.y);
    if (a.land) runActions(w, a.land, { ...c, target: t, depth: c.depth + 1 });
    return;
  }
  const speed = a.mode === 'dash' ? 620 : a.mode === 'leap' ? 460 : 420;
  let dist = a.dist;
  // a leap lands on its target, or on the telegraphed spot when the cast is locked
  const goal: Vec | null = a.mode !== 'leap' ? null : c.locked ? c.aim : c.target;
  if (goal) dist = Math.min(a.dist, Math.sqrt(dist2(me, goal)));
  const ms = (dist / speed) * 1000;
  const d = goal ? norm(goal.x - me.x, goal.y - me.y) : c.dir;
  me.face = d;
  me.motion = {
    vx: d.x * speed, vy: d.y * speed, until: w.t + ms, iframes: !!a.iframes || a.mode === 'leap', left: dist,
    path: a.path, pathCast: { ...c, depth: c.depth + 1 }, hitIds: new Set(), land: a.land,
  };
  me.anim = a.mode === 'leap' ? 'leap' : 'dash';
  me.animUntil = w.t + ms;
}

/** Braced: standing still for half a second, holding a shield front, or ready to parry. */
function braced(w: SimWorld, p: Combatant): boolean {
  return w.t - p.movedAt >= 500 || p.buffs.some((b) => b.flags.includes('blockFront') || b.flags.includes('parry'));
}

/** Called by movement each tick while a motion with path/land is active. */
/** The share (0..1) of this tick's step a motion still has to travel; it uses that distance up. */
export function motionStep(m: NonNullable<Combatant['motion']>, s: number): number {
  if (m.left === undefined) return 1;
  const step = Math.hypot(m.vx, m.vy) * s;
  const k = step > 0 ? Math.max(0, Math.min(1, m.left / step)) : 0;
  m.left -= step * k;
  return k;
}

/** How far from the mover's centre a path action reaches: its lane (a creature charge: half the 36 px telegraph
 * past its body; a hero move: 14 px), or a bigger area it carries around itself. */
function pathReach(path: Action[], r: number, lane: number, areaMult: number): number {
  let reach = r + lane;
  const walk = (acts: Action[]): void => {
    for (const a of acts) {
      if (a.a === 'repeat' || a.a === 'delay') walk(a.then);
      const area = 'area' in a ? (a.area as Area | undefined) : undefined;
      if (area?.at === 'self' && (area.shape === 'circle' || area.shape === 'cone')) reach = Math.max(reach, (area.r ?? 0) * areaMult);
      // a path line with a stated width: that lane (Unstoppable is line(170, 36))
      if (area?.shape === 'line' && area.width) reach = Math.max(reach, r + (area.width * areaMult) / 2);
    }
  };
  walk(path);
  return reach;
}

export function motionTick(w: SimWorld, me: Combatant, ended: boolean): void {
  const m = me.motion;
  if (!m) return;
  if (m.path && m.pathCast) {
    // what the move sweeps: the 36 px lane its telegraph shows, or a bigger area it carries around itself (Blade Dance)
    const reach = pathReach(m.path, me.r, me.kind === 'enemy' ? 18 : 14, m.pathCast.areaMult);
    for (const t of w.combatants(me.space)) {
      if (m.hitIds!.has(t.id) || !w.hostile(me, t) || !w.targetable(t)) continue;
      if (dist2(me, t) > (reach + t.r) ** 2) continue;
      m.hitIds!.add(t.id);
      if (me.kind === 'enemy' && me.stats.hooks.get('reflectCharge') && t.kind === 'player' && braced(w, t)) {
        // "stop, brace and let her come": the charge breaks on the hero and turns back on the boss
        me.motion = null;
        me.ccImmuneUntil = 0;
        applyStatus(w, t, me, { id: 'stun', dur: 6000 });
        applyStatus(w, t, me, { id: 'vulnerable', dur: 6000 });
        dealDamage(w, t, me, me.maxHp * 0.08, 'physical', { dot: true, noProc: true });
        w.emit('ability:cast', { casterId: t.id, ability: 'hazard:brace', x: Math.round(t.x), y: Math.round(t.y), tx: Math.round(me.x), ty: Math.round(me.y), ms: 300 });
        return;
      }
      const single: Action[] = m.path.map((p) => (p.a === 'damage' ? { ...p, area: { shape: 'single', at: 'target', r: 0 } } : p));
      // contact is already established by the lane: no lock re-check against the telegraph spot
      runActions(w, single, { ...m.pathCast, target: t, locked: false });
    }
  }
  if (ended) {
    const land = m.land, cast = m.pathCast;
    me.motion = null;
    if (land && cast) runActions(w, land, { ...cast, aim: { x: me.x, y: me.y } });
  }
}

function steal(w: SimWorld, a: Extract<Action, { a: 'steal' }>, c: CastCtx): void {
  for (const t of inArea(w, a.area, c, true)) {
    if (a.buffs && t.buffs.length) {
      const b = t.buffs.shift()!;
      t.statsDirty = true;
      c.caster.buffs.push({ ...b, sourceId: c.caster.id });
      c.caster.statsDirty = true;
    }
    // a thief takes one potion or food from a hero's pack (item:used keeps a guest's own copy in step)
    if (a.item && t.kind === 'player' && c.caster.kind !== 'player') {
      const p = t as PlayerEnt;
      const it = p.save.inventory.find((x) => { const k = itemInfo(x.base)?.kind; return k === 'potion' || k === 'food'; });
      if (it) {
        if (--it.qty <= 0) p.save.inventory.splice(p.save.inventory.indexOf(it), 1);
        w.emit('item:used', { playerId: p.playerId, uid: it.uid, def: it.base });
        w.emit('systems:notice', { playerId: p.playerId, text: `Something snatched your ${itemInfo(it.base)?.name ?? 'supplies'}!`, kind: 'error' });
      }
    }
    if (!a.gold) continue;
    if (c.caster.kind === 'player') {
      const p = c.caster as PlayerEnt;
      const g = Math.round(a.gold * (1 + 0.1 * t.level) * (1 + (p.stats.stats.gold ?? 0)));
      p.save.gold += g;
      w.emit('loot:granted', { playerId: p.playerId, gold: g });
    } else if (t.kind === 'player') {
      const p = t as PlayerEnt;
      const g = Math.min(p.save.gold, Math.round(a.gold * (1 + 0.1 * c.caster.level)));
      if (g <= 0) continue;
      p.save.gold -= g;
      w.emit('loot:granted', { playerId: p.playerId, gold: -g });
    }
  }
}
