/**
 * Features gate, part 1: every class casts hotbar slots 1–4 through real InputFrame buttons (slot 4 bound to a
 * school spell, then to the ultimate, both learned through the Spells tree first), dashes, and drinks Q/E.
 */
import { CLASS_SCHOOL } from '@/core/constants';
import { Btn } from '@/net/types';
import { availablePoints, newCharacter } from '@/systems/rules/character';
import { P } from '@/systems/rules/curves';
import { buildTree, canLearn } from '@/systems/rules/tree';
import type { CharacterSave } from '@/systems/rules/types';
import { spellView } from '@/systems/sim/player';
import type { PlayerEnt } from '@/systems/sim/state';
import { CAST_BTN, check, describe, DT, dummy, EffectWatch, expectedEffects, hero, near, world, type World } from './features-harness';

const AIM = { x: 40, y: 0 };
const WINDOW = 7000;
/** Spells branch: path 0 to its fork, then the first school spell (5 points). */
export const TOP_PATH = ['sp_p0m1', 'sp_p0m2', 'sp_p0b', 'sp_p0c2', 'sp_t0'];
/** + path 1 and the second school spell: the ultimate needs both tops (11 points). */
export const ULT_PATH = [...TOP_PATH, 'sp_p1m1', 'sp_p1m2', 'sp_p1b', 'sp_p1c2', 'sp_t1', 'sp_u'];

const clone = (s: CharacterSave): CharacterSave => JSON.parse(JSON.stringify(s)) as CharacterSave;

/**
 * Learn nodes the way the client does (canLearn against the points left, one rank each), bind `slot4`, then send it
 * to the authority as a remote loadout (sanitised and replayed there). Returns the nodes the rules refused.
 */
export function learnViaLoadout(w: World, pid: string, nodes: string[], slot4?: string | null): string[] {
  const p = w.player(pid), s = clone(p.save), refused: string[] = [];
  for (const id of nodes) {
    const chk = canLearn(s.classId, id, s.tree, availablePoints(s));
    if (!chk.ok) { refused.push(`${id} (${chk.why})`); continue; }
    s.tree[id] = (s.tree[id] ?? 0) + 1;
  }
  if (slot4 !== undefined) s.hotbar[3] = slot4;
  w.sim.receive({ type: 'loadout', data: s as unknown as Record<string, unknown> }, pid);
  return refused;
}

function castCase(classId: string, slot: number, label: string, setup?: (w: World, p: PlayerEnt) => string | null): void {
  const kitSave = newCharacter(classId);
  const spellOf = (p: PlayerEnt) => p.spells.get(p.save.hotbar[slot] ?? '');
  // peek at the spell (kit spells are known from the save; slot 4 after setup)
  const probe = world();
  const pp = hero(probe, 'a', clone(kitSave));
  const pre = setup?.(probe, pp) ?? null;
  const sp0 = spellOf(pp);
  const tag = `${classId} slot ${slot + 1} (${label})`;
  if (pre !== null || !sp0) { check(false, `${tag}: bound and castable`, pre ?? `no spell in slot ${slot + 1}`); return; }
  const exp = expectedEffects(sp0);
  const revive = exp.effects.has('revive');

  const w = world({ party: revive ? 2 : 1 });
  const p = hero(w, 'a', clone(kitSave));
  setup?.(w, p);
  const spell = spellOf(p)!;
  const dummies = [dummy(w, 40, 0, p.level), dummy(w, 110, 0, p.level), dummy(w, 165, 0, p.level)];
  let ally: PlayerEnt | undefined;
  if (revive) {
    ally = hero(w, 'b', newCharacter('warden'), 20, 20);
    w.sim.damage(ally.id, 1e9, 'physical');
  }
  w.tick({ a: { aim: AIM } });
  if (exp.effects.has('heal')) p.hp = Math.round(p.maxHp * 0.3);
  if (exp.effects.has('stamina')) p.stamina = 0;
  const other = p.kit.spells.find((id) => id !== spell.id)!;
  if (exp.effects.has('cooldowns')) p.cds.set(other, w.sim.w.t + 60_000);

  const v = spellView(p, spell);
  const em0 = p.ember, hp0 = p.hp;
  const regenE = (p.stats.stats.emberRegen ?? 5) * DT / 1000;
  const watch = new EffectWatch(w, p, dummies, ally);
  w.tick({ a: { aim: AIM, buttons: CAST_BTN[slot] } });
  const tCast = w.sim.w.t;
  watch.sample();
  const cdUntil = p.cds.get(spell.id) ?? 0;
  const why: string[] = [];
  let payText: string;
  if (spell.hpCost) {
    const want = spell.hpCost * p.maxHp, paid = hp0 - p.hp;
    payText = `${Math.round(want)} HP paid`;
    if (Math.abs(paid - want) > p.maxHp * 0.02 * DT / 1000 + 0.5) why.push(`HP paid ${paid.toFixed(1)} ≠ ${want.toFixed(1)}`);
    if (p.ember < em0 - 0.001) why.push(`Ember also spent (${(em0 - p.ember).toFixed(2)})`);
  } else {
    const paid = em0 - p.ember + regenE;
    payText = `${Math.round(v.cost * 100) / 100} Ember paid`;
    if (!near(paid, v.cost)) why.push(`Ember paid ${paid.toFixed(2)} ≠ cost ${v.cost.toFixed(2)} (base ${spell.cost})`);
  }
  if (!(v.cd > 0) || !near(cdUntil, tCast + v.cd * 1000, 1)) why.push(`cooldown ends at +${((cdUntil - tCast) / 1000).toFixed(2)} s, want +${v.cd.toFixed(2)} s`);
  // re-press while cooling down: nothing happens
  w.tick({ a: { aim: AIM } });
  watch.sample();
  const emBefore = p.ember, casts0 = w.events.filter((e) => e.name === 'ability:cast' && e.p.casterId === p.id && e.p.ability === spell.id).length;
  w.tick({ a: { aim: AIM, buttons: CAST_BTN[slot] } });
  watch.sample();
  const casts1 = w.events.filter((e) => e.name === 'ability:cast' && e.p.casterId === p.id && e.p.ability === spell.id).length;
  if (p.ember < emBefore - 0.001 || (casts1 > casts0 && !spell.castMs)) why.push('re-press during the cooldown cast again');
  for (let t = 0; t < WINDOW; t += DT) { w.tick({ a: { aim: AIM } }); watch.sample(); }
  if (v.cd * 1000 > w.sim.w.t - tCast && (p.cds.get(spell.id) ?? 0) <= w.sim.w.t) why.push(`cooldown gone after ${((w.sim.w.t - tCast) / 1000).toFixed(1)} s of ${v.cd} s`);
  check(!why.length, `${tag} ${spell.name}: ${payText}, ${v.cd.toFixed(2)} s cooldown`, why.join('; '));
  const fired = w.events.some((e) => e.name === 'ability:cast' && e.p.casterId === p.id && e.p.ability === spell.id);
  const miss = watch.missing(exp, { cooldownsReset: () => (p.cds.get(other) ?? 0) <= tCast + 1 });
  check(fired && !miss.length, `${tag} ${spell.name}: ${describe(exp)}`, `${fired ? '' : 'never went off; '}missing ${miss.join(', ')}`);
}

/** Slot 4 setup: level up, learn the path through the Spells tree, bind the granted spell. */
function slot4(level: number, nodes: string[], top: 'sp_t0' | 'sp_u') {
  return (w: World, p: PlayerEnt): string | null => {
    p.save.level = level;
    w.sim.addPlayer('a', p.save); // rebuild at the new level
    const grant = buildTree(p.save.classId, 'spells').find((n) => n.id === top)!.grantsSpell!;
    const refused = learnViaLoadout(w, 'a', nodes, grant);
    const q = w.player('a');
    if (refused.length) return `tree refused ${refused.join(', ')}`;
    if (!nodes.every((n) => (q.save.tree[n] ?? 0) > 0)) return `authority dropped nodes: ${nodes.filter((n) => !q.save.tree[n]).join(', ')}`;
    if (q.save.hotbar[3] !== grant || !q.spells.has(grant)) return `${grant} not bound / not known after learning`;
    return null;
  };
}

function dashCase(classId: string): void {
  const w = world();
  const p = hero(w, 'a', newCharacter(classId));
  // dashReadyAt starts at 0 and the 400 ms gap applies from it: nobody dashes in their first 0.4 s of sim time
  w.run(500, { a: { aim: AIM } });
  const st0 = p.stamina, x0 = p.x, n0 = w.events.length;
  w.tick({ a: { aim: AIM, move: { x: 1, y: 0 }, buttons: Btn.DASH } });
  const spent = st0 - p.stamina;
  w.run(300, { a: { aim: AIM } });
  const moved = p.x - x0;
  const dashes = () => w.since(n0, 'ability:cast').filter((e) => e.p.casterId === p.id && e.p.ability === 'dash').length;
  check(near(spent, 25) && moved >= 60 && moved <= 90 && dashes() === 1, `${classId} dash: −25 stamina, moved ${Math.round(moved)} px`, `spent ${spent.toFixed(2)}, moved ${moved.toFixed(1)}, dashes ${dashes()}`);
  const st1 = p.stamina;
  w.tick({ a: { aim: AIM, move: { x: 1, y: 0 }, buttons: Btn.DASH } });
  const blocked = dashes() === 1 && p.stamina >= st1;
  w.run(1600, { a: { aim: AIM } });
  w.tick({ a: { aim: AIM, move: { x: 1, y: 0 }, buttons: Btn.DASH } });
  check(blocked && dashes() === 2, `${classId} dash cooldown: blocked at +0.37 s, ready again at +2 s`, `blocked ${blocked}, dashes ${dashes()}`);
}

function potionCase(classId: string): void {
  const w = world();
  const p = hero(w, 'a', newCharacter(classId));
  w.tick({ a: { aim: AIM } });
  const qty = (base: string) => p.save.inventory.filter((x) => x.base === base).reduce((a, x) => a + x.qty, 0);
  // Q: 80 × P(level) over 3 s, through heal() (healing / healing-taken apply), +2%/s out-of-combat regen on top
  p.hp = Math.round(p.maxHp * 0.2);
  const hp0 = p.hp, hpS = qty('i_hp_s');
  w.tick({ a: { aim: AIM, buttons: Btn.POTION_Q } });
  const t0 = w.sim.w.t, readyQ = p.potionReadyAt.q;
  w.run(3100, { a: { aim: AIM } });
  const st = p.stats.stats;
  const want = 80 * P(p.level) * (1 + (st.potionHeal ?? 0)) * (1 + (st.healing ?? 0)) * (1 + (st.healingTaken ?? 0));
  const gain = p.hp - hp0, regen = p.maxHp * 0.02 * 3.2;
  check(qty('i_hp_s') === hpS - 1 && gain >= want - 1 && gain <= want + regen + 1 && near(readyQ, t0 + 8000, 1),
    `${classId} Q: health potion used, healed ${Math.round(gain)} (potion ${Math.round(want)}), 8 s cooldown`, `qty ${hpS}→${qty('i_hp_s')}, gain ${gain.toFixed(1)}, ready +${readyQ - t0}`);
  w.tick({ a: { aim: AIM, buttons: Btn.POTION_Q } });
  const blockedQ = qty('i_hp_s') === hpS - 1;
  w.run(5000, { a: { aim: AIM } });
  w.tick({ a: { aim: AIM, buttons: Btn.POTION_Q } });
  check(blockedQ && qty('i_hp_s') === hpS - 2, `${classId} Q cooldown: refused at +3 s, drinks again after 8 s`, `qty ${qty('i_hp_s')}`);
  // E: +60 Ember at once
  p.ember = 0;
  const emS = qty('i_em_s'), regenE = (p.stats.stats.emberRegen ?? 5) * DT / 1000;
  w.tick({ a: { aim: AIM, buttons: Btn.POTION_E } });
  const t1 = w.sim.w.t;
  const okE = near(p.ember, Math.min(p.emberMax, 60 + regenE)) && qty('i_em_s') === emS - 1 && near(p.potionReadyAt.e, t1 + 8000, 1);
  check(okE, `${classId} E: Ember potion used, +60 Ember, 8 s cooldown`, `ember ${p.ember.toFixed(2)}, qty ${emS}→${qty('i_em_s')}`);
  w.run(1000, { a: { aim: AIM } });
  w.tick({ a: { aim: AIM, buttons: Btn.POTION_E } });
  check(qty('i_em_s') === emS - 1, `${classId} E cooldown: a second draught 1 s later is refused`, `qty ${qty('i_em_s')}`);
}

export function castChecks(only?: string): void {
  for (const classId of Object.keys(CLASS_SCHOOL)) {
    if (only && only !== classId) continue;
    for (const slot of [0, 1, 2]) castCase(classId, slot, 'kit');
    castCase(classId, 3, 'school spell, L6', slot4(6, TOP_PATH, 'sp_t0'));
    castCase(classId, 3, 'ultimate, L12', slot4(12, ULT_PATH, 'sp_u'));
    dashCase(classId);
    potionCase(classId);
  }
}
