/**
 * The martial slash / quick shot (Claude 3): Btn.SLASH, a quick swing in a short arc toward the aim (or the click
 * target), using the same body-edge arc test as the basic attack. Bows loose a fast short shot. Authority only.
 * Rules and numbers: src/systems/rules/slash.ts.
 */
import { SLASH, SLASH_ID, hasSlash } from '@/systems/rules/slash';
import { runActions } from './actions';
import { basicCast, dealDamage, incapacitated, kindOf } from './combat';
import { inArc, weaponRoll } from './player';
import type { PlayerEnt } from './state';
import { dist2, norm, type SimWorld } from './world';

export function slash(w: SimWorld, p: PlayerEnt): boolean {
  if (p.dead || p.downed || incapacitated(p) || !hasSlash(p.save.classId)) return false;
  if (w.t < (p.cds.get(SLASH_ID) ?? 0)) return false;
  const spec = SLASH[p.weapon.type];
  const t = w.combatant(p.target);
  const target = t && w.hostile(p, t) && w.targetable(t) ? t : null;
  const aim = target ? { x: target.x, y: target.y } : p.aim;
  const dir = norm(aim.x - p.x, aim.y - p.y);
  p.cds.set(SLASH_ID, w.t + spec.cd);
  p.face = dir;
  if (!p.windup) { p.anim = 'attack'; p.animUntil = w.t + 160; }
  const kind = kindOf(p), amount = weaponRoll(w, p) * spec.coef;
  if (spec.shot) {
    // the quick shot: straight down the aim line (no homing), short and fast
    runActions(w, [{ a: 'projectile', coef: spec.coef, kind, speed: spec.shot.speed, range: spec.shot.range, visual: 'arrow' }],
      { ...basicCast(w, p, target), power: amount / spec.coef, dir, aim });
    w.emit('ability:cast', { casterId: p.id, ability: 'quickshot', x: Math.round(p.x), y: Math.round(p.y), tx: Math.round(p.x + dir.x * spec.shot.range), ty: Math.round(p.y + dir.y * spec.shot.range), ms: 120 });
    return true;
  }
  const cast = { ...basicCast(w, p, target), dir, aim };
  const foes = [...w.combatants(p.space)].filter((x) => w.hostile(p, x) && w.targetable(x) && inArc(p, x, spec.range, spec.arc));
  foes.sort((a, z) => (a === target ? -1 : z === target ? 1 : dist2(p, a) - dist2(p, z)));
  for (const f of foes.slice(0, spec.hits)) dealDamage(w, p, f, amount, kind, { cast });
  w.emit('ability:cast', { casterId: p.id, ability: 'slash', x: Math.round(p.x), y: Math.round(p.y), tx: Math.round(p.x + dir.x * spec.range), ty: Math.round(p.y + dir.y * spec.range), ms: 160 });
  return true;
}
