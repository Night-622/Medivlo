/**
 * rules-props: the +72 new kit spells (Claude 5, docs/systems/BUILDS.md §4, HOLLOW_CROWN.md §2.1 budgets). 3 per class
 * in NEW_KIT, ids unique and clear of every other spell; cost 8–30 (or an hpCost); cd 2–20 s; castMs ≤ 600; an
 * 'enemy'-aimed spell has a real range; areas centred on the aim point need 'ground' or 'direction' aim; tags that
 * promise heal / move / buff are backed by an action; every desc states a number; coefficients stay in band.
 */
import { HC_CLASSES } from '@/data/classes/hc/classes.gen';
import { HC_KIT_SPELLS_NEW, NEW_KIT } from '@/data/spells/hc/kit-spells-new';
import { allSpells } from '@/systems/rules/spells';
import type { Action, HcSpell } from '@/systems/rules/types';
import { check } from './features-harness';

/** every action in a spell, recursing into delays, repeats, moves, zones and projectile hits */
function flat(acts: Action[] | undefined, out: Action[] = []): Action[] {
  for (const a of acts ?? []) {
    out.push(a);
    if (a.a === 'delay' || a.a === 'repeat') flat(a.then, out);
    if (a.a === 'move') { flat(a.path, out); flat(a.land, out); }
    if (a.a === 'zone') { flat(a.each, out); flat(a.trigger, out); }
    if (a.a === 'projectile') flat(a.onHit, out);
    if (a.a === 'buff') for (const p of a.procs ?? []) flat(p.do, out);
  }
  return out;
}

function spellBad(s: HcSpell): string[] {
  const bad: string[] = [], acts = flat(s.actions), has = (k: Action['a']) => acts.some((a) => a.a === k);
  if (!((s.cost >= 8 && s.cost <= 30) || (s.cost === 0 && (s.hpCost ?? 0) > 0))) bad.push(`cost ${s.cost}`);
  if (!(s.cd >= 2 && s.cd <= 20)) bad.push(`cd ${s.cd}`);
  if ((s.castMs ?? 0) > 600) bad.push(`castMs ${s.castMs}`);
  if (s.aim === 'enemy' && !(s.range > 0)) bad.push('enemy-aimed with no range');
  const aimAreas = acts.some((a) => 'area' in a && a.area && a.area.at === 'aim');
  if (aimAreas && s.aim !== 'ground' && s.aim !== 'direction') bad.push(`aim-point area with aim '${s.aim}'`);
  if (s.tags.includes('heal') !== has('heal')) bad.push('heal tag vs heal action');
  if (s.tags.includes('move') !== has('move')) bad.push('move tag vs move action');
  if (s.tags.includes('buff') && !has('buff') && !has('shield')) bad.push('buff tag without a buff or shield');
  if (!/\d/.test(s.desc)) bad.push('desc states no number');
  const coefs = acts.flatMap((a) => ('coef' in a && typeof a.coef === 'number' ? [a.coef] : []));
  if (coefs.some((c) => c <= 0 || c > 3.2)) bad.push(`coefficient out of band (${coefs.join(', ')})`);
  if (!acts.length) bad.push('no actions');
  return bad;
}

export function newSpellProps(): void {
  const S = HC_KIT_SPELLS_NEW, ids = S.map((s) => s.id), registry = allSpells();
  // rules/spells.ts registers the new spells too: each must be there exactly once, and no other spell may share an id
  const others = new Set(registry.filter((r) => !ids.includes(r.id)).map((r) => r.id));
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i), clash = ids.filter((x) => registry.filter((r) => r.id === x).length !== 1);
  const kitBad = HC_CLASSES.filter((c) => NEW_KIT[c.id]?.length !== 3 || NEW_KIT[c.id].some((id) => !ids.includes(id))).map((c) => c.id);
  check(S.length === 72 && !dup.length && !clash.length && !kitBad.length, `new kit spells: ${S.length}, 3 per class in NEW_KIT, ids unique, each registered once in rules/spells.ts beside the other ${others.size} spells`,
    [...dup.map((x) => `dup ${x}`), ...clash.map((x) => `not registered once ${x}`), ...kitBad.map((x) => `NEW_KIT ${x}`)].join(', '));
  const bad = S.map((s) => [s.id, spellBad(s)] as const).filter(([, b]) => b.length).map(([id, b]) => `${id}: ${b.join(', ')}`);
  check(!bad.length, 'new kit spells: budgets (cost, cd, cast), ranges, aim for aim-point areas, honest heal/move/buff tags, numbers in desc', bad.slice(0, 5).join('; '));
}
