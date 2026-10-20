/**
 * The martial slash / quick shot (Claude 3): Btn.SLASH through real InputFrames. Martial classes: a swing hits inside
 * its arc and misses behind / past its reach (bows: the shot hits on the aim line, misses beside it); the cooldown is
 * the weapon's weight; no Ember or stamina; the auto-attack timer is untouched. Magic classes: nothing happens.
 */
import { CLASS_SCHOOL } from '@/core/constants';
import { Btn } from '@/net/types';
import { newCharacter } from '@/systems/rules/character';
import { SLASH, SLASH_ID, hasSlash } from '@/systems/rules/slash';
import { check, DT, dummy, hero, world } from './features-harness';

function slashCase(classId: string): void {
  const w = world(), p = hero(w, 'a', { ...newCharacter(classId), level: 10 });
  w.run(500);
  const spec = SLASH[p.weapon.type], aim = { x: 200, y: 0 };
  const hitOn = (id: string, n0: number) => w.since(n0, 'combat:hit').some((e) => e.p.sourceId === p.id && e.p.targetId === id);
  if (!hasSlash(classId)) {
    const d = dummy(w, 30, 0), n0 = w.events.length;
    w.press('a', Btn.SLASH, { aim });
    w.run(400);
    const cast = w.since(n0, 'ability:cast').some((e) => e.p.casterId === p.id && (e.p.ability === 'slash' || e.p.ability === 'quickshot'));
    check(!cast && !hitOn(d.id, n0) && !p.cds.has(SLASH_ID), `${classId} (magic): R does nothing`, `cast ${cast}, hit ${hitOn(d.id, n0)}`);
    return;
  }
  // a hit inside, and misses outside
  let inside: { x: number; y: number }, outside: { x: number; y: number }[];
  if (spec.shot) {
    inside = { x: 150, y: 0 };
    outside = [{ x: 150, y: 70 }, { x: spec.shot.range + 120, y: 0 }];
  } else {
    inside = { x: Math.round(p.r + spec.range * 0.7), y: 0 };
    outside = [{ x: -(p.r + 50), y: 0 }, { x: Math.round(spec.range + 60), y: 0 }];
  }
  const din = dummy(w, inside.x, inside.y), douts = outside.map((o) => dummy(w, o.x, o.y));
  const em0 = p.ember, st0 = p.stamina, atk0 = p.attackReadyAt, n0 = w.events.length, t0 = w.sim.w.t;
  w.press('a', Btn.SLASH, { aim });
  const cdSet = (p.cds.get(SLASH_ID) ?? 0) - t0;
  w.run(spec.shot ? 600 : 200);
  const name = spec.shot ? 'quick shot' : `${p.weapon.type} slash`;
  check(hitOn(din.id, n0), `${classId}: ${name} hits a foe inside its ${spec.shot ? 'line' : 'arc'}`, `dummy at ${inside.x},${inside.y}`);
  check(douts.every((d) => !hitOn(d.id, n0)), `${classId}: ${name} misses foes ${spec.shot ? 'beside the line and past its range' : 'behind and past its reach'}`, outside.map((o) => `${o.x},${o.y}`).join(' '));
  // the press is processed on the first tick: the cooldown starts within that tick of t0
  check(Math.abs(cdSet - spec.cd) <= DT + 1, `${classId}: ${name} cooldown is the weapon's weight (${spec.cd} ms)`, `cooldown ${Math.round(cdSet)} ms`);
  check(p.ember === em0 && p.stamina >= st0 && p.attackReadyAt === atk0, `${classId}: ${name} costs nothing and leaves the auto-attack timer alone`, `ember ${em0}→${p.ember}, stamina ${st0}→${p.stamina}, attackReadyAt ${atk0}→${p.attackReadyAt}`);
  // a second press inside the cooldown does nothing; after it, it swings again (a fresh cycle: a shot's flight time
  // above can outlast a short cooldown)
  while (w.sim.w.t < (p.cds.get(SLASH_ID) ?? 0) + DT) w.tick();
  w.press('a', Btn.SLASH, { aim });
  const until = p.cds.get(SLASH_ID) ?? 0;
  while (w.sim.w.t < until - 3 * DT) w.tick();
  const n1 = w.events.length;
  w.press('a', Btn.SLASH, { aim });
  const early = w.since(n1, 'ability:cast').filter((e) => e.p.casterId === p.id && (e.p.ability === 'slash' || e.p.ability === 'quickshot')).length;
  while (w.sim.w.t < until + DT) w.tick();
  const n2 = w.events.length;
  w.press('a', Btn.SLASH, { aim });
  const again = w.since(n2, 'ability:cast').filter((e) => e.p.casterId === p.id && (e.p.ability === 'slash' || e.p.ability === 'quickshot')).length;
  check(early === 0 && again === 1, `${classId}: ${name} can't be pressed again until its cooldown ends`, `inside cooldown ${early}, after ${again}`);
}

export function slashChecks(only?: string): void {
  for (const classId of Object.keys(CLASS_SCHOOL)) if (!only || only === classId) slashCase(classId);
}
