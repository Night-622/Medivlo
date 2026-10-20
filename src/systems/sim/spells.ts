/**
 * A hero's spell as cast (Claude 3): the tree / rune / affix modifiers summed into a SpellView, the actions reshaped
 * by runes (BUILDS.md §2.2), and the reach helpers cast() uses. Split out of player.ts.
 */
import type { Action, Area, DamageKind, HcSpell, SpellMod } from '@/systems/rules/types';
import { spellLevel } from './builds';
import type { PlayerEnt } from './state';

export interface SpellView {
  spell: HcSpell; dmg: number; cost: number; cd: number; area: number; dur: number; echo: number; twin: boolean; split: boolean; linger: number;
  /** rune shaping */
  burst: boolean; count: number; pierce: boolean; chain: number; haste: number; convert?: DamageKind; ward: number; leech: number;
}

export function spellView(p: PlayerEnt, spell: HcSpell): SpellView {
  // a mod names its spell, '*' (all), or 'school:<id>' (every spell of that school: uniques, perks)
  const mods = p.stats.spellMods.filter((m: SpellMod) => m.spell === spell.id || m.spell === '*' || m.spell === `school:${spell.school}`);
  const sum = (k: keyof SpellMod) => mods.reduce((a, m) => a + (typeof m[k] === 'number' ? (m[k] as number) : 0), 0);
  const ult = spell.tags.includes('ultimate');
  const lv = spellLevel(p, spell);
  const haste = Math.min(0.5, sum('haste'));
  return {
    spell, dmg: (1 + sum('dmg')) * (1 + 0.12 * lv), area: (1 + sum('area') + (p.stats.stats.area ?? 0)) * (1 + 0.06 * lv), dur: 1 + sum('dur'), echo: sum('echo'), linger: sum('linger'),
    twin: mods.some((m) => m.twin), split: mods.some((m) => m.split), burst: mods.some((m) => m.burst),
    count: Math.round(sum('count')), pierce: mods.some((m) => m.pierce), chain: Math.round(sum('chain')), haste,
    convert: mods.find((m) => m.convert)?.convert, ward: sum('ward'), leech: sum('leech'),
    cost: Math.max(0, spell.cost * (1 + sum('cost') + (p.stats.stats.emberCost ?? 0))),
    cd: Math.max(0.25, spell.cd * (1 + sum('cd')) * (1 - Math.min(0.5, p.stats.stats.cdr ?? 0)) * (ult ? 1 - (p.stats.stats.ultCdr ?? 0) : 1) * (1 - haste)),
  };
}

const scaleCoef = (a: Action, k: number): Action => ('coef' in a && typeof a.coef === 'number' ? { ...a, coef: a.coef * k } as Action : a);

/**
 * The actions a cast runs after its runes: Split (×3 projectiles at 40%), Volley (+N projectiles), Pierce, Chain
 * (each damaging hit chains to N more foes at 60%), Burst (a repeat lands at once: its hits summed).
 */
export function shapeActions(actions: Action[], v: SpellView): Action[] {
  const chainOn = (coef: number, kind?: DamageKind): Action[] => (v.chain > 0 ? [{ a: 'chain', coef: coef * 0.6, kind, jumps: v.chain, range: 140 }] : []);
  const shape = (a: Action): Action => {
    if (a.a === 'repeat' && v.burst) return { a: 'delay', ms: 0, then: a.then.map((x) => scaleCoef(shape(x), a.n)) };
    if (a.a === 'repeat' || a.a === 'delay') return { ...a, then: a.then.map(shape) };
    if (a.a === 'projectile') {
      let p = { ...a };
      if (v.split) p = { ...p, count: (p.count ?? 1) * 3, spread: (p.spread ?? 0) + 30, coef: p.coef * 0.4 };
      if (v.count) p = { ...p, count: (p.count ?? 1) + v.count, spread: (p.spread ?? 0) + 12 * v.count };
      if (v.pierce) p = { ...p, pierce: true };
      if (v.chain) p = { ...p, onHit: [...(p.onHit ?? []), ...chainOn(p.coef, p.kind)] };
      return p;
    }
    return a;
  };
  const out = actions.map(shape);
  // area / single-target damage chains from the target once per cast
  if (v.chain) for (const a of actions) if (a.a === 'damage') out.push(...chainOn(a.coef, a.kind));
  return out;
}

/** A spell's working actions, looking through repeat / delay wrappers. */
export function flatParts(actions: Action[]): Action[] {
  return actions.flatMap((a) => (a.a === 'repeat' || a.a === 'delay' ? flatParts(a.then) : [a]));
}
/** Resources, and buffs / heals / shields on yourself. */
export const selfSide = (a: Action): boolean => a.a === 'resource' || ((a.a === 'buff' || a.a === 'heal' || a.a === 'shield') && (a as { to?: string }).to === 'self');
/** Does this action land on the cast's target itself (single hit, target-centred area, chain, blink / leap)? */
export function targetBound(a: Action): boolean {
  if (a.a === 'chain') return true;
  if (a.a === 'move') return a.mode === 'blink' || a.mode === 'behind' || a.mode === 'leap';
  if (a.a === 'resource' || a.a === 'buff' || a.a === 'heal' || a.a === 'shield') return false;
  const area = 'area' in a ? (a.area as Area | undefined) : undefined;
  return !!area && (area.shape === 'single' || area.at === 'target');
}
