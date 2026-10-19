/** Display helpers for spells (Claude 3): cost, cooldown and a short stat line for tooltips and the tree. */
import type { HcSpell } from './types';

export const spellCost = (s: HcSpell): number => s.cost;

export function spellMeta(s: HcSpell): [string, string][] {
  const out: [string, string][] = [];
  out.push(s.hpCost ? ['Cost', `${Math.round(s.hpCost * 100)}% health`] : ['Ember cost', String(Math.round(s.cost))]);
  out.push(['Cooldown', `${s.cd}s`]);
  if (s.castMs) out.push(['Cast', `${(s.castMs / 1000).toFixed(1)}s`]);
  if (s.range) out.push(['Range', `${Math.round(s.range / 32)} tiles`]);
  return out;
}
