/**
 * Deeper builds (Claude 3, docs/systems/BUILDS.md §2.1): the shared sim pieces perks, affixes and uniques read.
 * - spend: pay Ember / stamina and fire 'emberSpent' / 'staminaSpent' once per 50 spent
 * - spellLevel: "+N to <spell>" levels from the compiled passives ('*', 'school:<id>' and the spell id)
 * - tickAuras: Passive.aura re-applied every second as a 1.5 s buff on allies (or foes) in range
 */
import type { HcSpell } from '@/systems/rules/types';
import { addBuff, fireProcs } from './combat';
import type { PlayerEnt } from './state';
import type { SimWorld } from './world';

const SPENT_STEP = 50;

export function spend(w: SimWorld, p: PlayerEnt, res: 'ember' | 'stamina', n: number): void {
  if (n <= 0) return;
  p[res] = Math.max(0, p[res] - n);
  const s = (p.spent ??= { ember: 0, stamina: 0 });
  s[res] += n;
  while (s[res] >= SPENT_STEP) { s[res] -= SPENT_STEP; fireProcs(w, p, res === 'ember' ? 'emberSpent' : 'staminaSpent'); }
}

export function spellLevel(p: PlayerEnt, spell: HcSpell): number {
  const l = p.stats.spellLevels;
  if (!l.size) return 0;
  return (l.get('*') ?? 0) + (l.get(`school:${spell.school}`) ?? 0) + (l.get(spell.id) ?? 0);
}

const AURA_EVERY = 1000, AURA_DUR = 1500;

export function tickAuras(w: SimWorld, p: PlayerEnt): void {
  const auras = p.stats.auras;
  if (!auras.length || p.dead || w.t < (p.auraAt ?? 0)) return;
  p.auraAt = w.t + AURA_EVERY;
  for (const a of auras) {
    for (const o of w.combatants(p.space)) {
      if (o.dead || (o.x - p.x) ** 2 + (o.y - p.y) ** 2 > a.r * a.r) continue;
      if (a.enemies ? !w.hostile(p, o) : w.hostile(p, o)) continue;
      addBuff(w, p, o, { a: 'buff', id: `aura:${a.id}`, dur: AURA_DUR, to: 'self', mods: a.mods });
    }
  }
}
