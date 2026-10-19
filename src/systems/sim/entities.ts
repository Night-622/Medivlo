/**
 * Projectiles and ground zones (Claude 3): movement with sub-steps, world and wall blocking, pierce / bounce /
 * homing, absorbing orbs, field and totem ticks, traps.
 */
import { hook } from '@/systems/rules/stats';
import { inArea, runActions } from './actions';
import { shadedBy } from './hazards';
import { dealDamage } from './combat';
import type { Combatant, ProjectileEnt, ZoneEnt } from './state';
import { dist2, norm, type SimWorld } from './world';

const STEP = 12;

export function tickProjectiles(w: SimWorld, dt: number): void {
  for (const p of w.projectiles.values()) {
    if (p.dead) { w.projectiles.delete(p.id); continue; }
    const owner = p.cast.caster;
    if (p.homing) {
      const t = w.combatant(p.homing);
      if (t && !t.dead) {
        const sp = Math.hypot(p.vx, p.vy), d = norm(t.x - p.x, t.y - p.y), cur = norm(p.vx, p.vy);
        const k = Math.min(1, (dt / 1000) * 8);
        const nd = norm(cur.x + (d.x - cur.x) * k, cur.y + (d.y - cur.y) * k);
        p.vx = nd.x * sp; p.vy = nd.y * sp;
      }
    }
    const total = Math.hypot(p.vx, p.vy) * (dt / 1000);
    const n = Math.max(1, Math.ceil(total / STEP));
    for (let i = 0; i < n && !p.dead; i++) {
      const sx = (p.vx * dt) / 1000 / n, sy = (p.vy * dt) / 1000 / n;
      if (!w.ports.clear(p.space, p.x, p.y, p.x + sx, p.y + sy) || blockedByWall(w, p, sx, sy)) { p.dead = true; break; }
      if (p.team === 'enemies' && w.hazards.size && shadedBy(w, p.space, p.x, p.y, { x: p.x + sx * 2, y: p.y + sy * 2 })) { p.dead = true; break; }
      p.x += sx; p.y += sy; p.travelled += Math.hypot(sx, sy);
      if (p.flags.includes('absorb')) absorb(w, p);
      for (const c of w.combatants(p.space)) {
        if (p.hit.has(c.id) || !w.hostile(owner, c) || !w.targetable(c)) continue;
        if (dist2(p, c) > (p.radius + c.r) ** 2) continue;
        p.hit.add(c.id);
        hit(w, p, c);
        if (p.dead) break;
      }
      if (p.travelled >= p.range) p.dead = true;
    }
  }
}

function hit(w: SimWorld, p: ProjectileEnt, c: Combatant): void {
  const cast = { ...p.cast, target: c, aim: { x: c.x, y: c.y } };
  if (c.kind !== 'player' && hook(c.stats, 'absorbShots')) {
    w.emit('combat:hit', { x: Math.round(c.x), y: Math.round(c.y), sourceId: p.cast.caster.id, targetId: c.id, amount: 0, type: p.kind, crit: false, kind: 'immune' });
    p.dead = true;
    return;
  }
  dealDamage(w, p.cast.caster, c, p.coef * p.cast.power, p.kind, { cast, isSpell: p.cast.isSpell, flags: p.flags, status: p.status });
  if (p.onHit) runActions(w, p.onHit, { ...cast, depth: cast.depth + 1 });
  if (p.pierce) return;
  if (p.bounce > 0) {
    const next = w.nearestHostile({ ...p.cast.caster, x: p.x, y: p.y } as Combatant, 160, (x) => !p.hit.has(x.id));
    if (next) {
      p.bounce--;
      const d = norm(next.x - p.x, next.y - p.y), sp = Math.hypot(p.vx, p.vy);
      p.vx = d.x * sp; p.vy = d.y * sp; p.travelled = Math.max(0, p.range - 200);
      return;
    }
  }
  p.dead = true;
}

/** Eclipse orbs swallow hostile projectiles they touch. */
function absorb(w: SimWorld, p: ProjectileEnt): void {
  for (const o of w.projectiles.values()) {
    if (o === p || o.dead || o.team === p.team || o.space !== p.space) continue;
    if (dist2(o, p) <= (p.radius + o.radius) ** 2) o.dead = true;
  }
}

function blockedByWall(w: SimWorld, p: ProjectileEnt, sx: number, sy: number): boolean {
  for (const z of w.zones.values()) {
    if (!z.blocksShots || z.team === p.team || z.space !== p.space) continue;
    // wall = segment centred on z, perpendicular to its cast direction
    const half = (z.area.len ?? 120) / 2, perp = { x: -z.dir.y, y: z.dir.x };
    const ax = z.x - perp.x * half, ay = z.y - perp.y * half, bx = z.x + perp.x * half, by = z.y + perp.y * half;
    if (segmentsCross(p.x, p.y, p.x + sx, p.y + sy, ax, ay, bx, by, (z.area.width ?? 16) / 2)) return true;
  }
  return false;
}

function segmentsCross(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, pad: number): boolean {
  // distance from the projectile's end point to the wall segment
  const dx = x4 - x3, dy = y4 - y3, l2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((x2 - x3) * dx + (y2 - y3) * dy) / l2));
  const px = x3 + t * dx, py = y3 + t * dy;
  void x1; void y1;
  return (x2 - px) ** 2 + (y2 - py) ** 2 <= pad * pad + 16;
}

export function tickZones(w: SimWorld): void {
  for (const z of w.zones.values()) {
    if (z.dead || w.t >= z.until || z.cast.caster.dead && z.kind !== 'wall') { w.zones.delete(z.id); continue; }
    const cast = { ...z.cast, aim: { x: z.x, y: z.y } };
    if (z.kind === 'trap') {
      const area = { shape: 'circle' as const, at: 'aim' as const, r: z.area.r ?? 26 };
      const t = inArea(w, area, { ...cast, areaMult: 1 }, true, 1)[0];
      if (t) {
        const power = 1 + (z.cast.caster.stats.hooks.get('trapPower') ?? 0);
        runActions(w, z.trigger ?? [], { ...cast, target: t, dmgMult: cast.dmgMult * power });
        z.dead = true;
      }
      continue;
    }
    if (z.tick && z.each && w.t >= z.nextTick) {
      z.nextTick += z.tick;
      runActions(w, z.each, { ...cast, target: nearestIn(w, z) ?? null });
    }
  }
}

function nearestIn(w: SimWorld, z: ZoneEnt): Combatant | undefined {
  const r = z.area.r ?? 80;
  return w.nearestHostile({ ...z.cast.caster, x: z.x, y: z.y } as Combatant, r);
}
