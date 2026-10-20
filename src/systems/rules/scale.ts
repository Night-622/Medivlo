/**
 * Scale a passive's strength (Claude 3): "50% stronger" keystones (Avatar capstones) and "25% stronger" Attuned bonuses
 * (Set Mastery). Numbers that are a size scale: modifier values, hook values, and the damage / heal / shield amounts of
 * proc actions. Switch-like hooks (no value) stay switches. Pure.
 */
import type { Action, Passive } from './types';

const SIZES = ['coef', 'amount', 'pctMax', 'pct', 'gold'] as const;

function scaleAction(a: Action, k: number): Action {
  const out = { ...a } as Record<string, unknown>;
  for (const key of SIZES) if (typeof out[key] === 'number') out[key] = (out[key] as number) * k;
  if (Array.isArray(out.then)) out.then = (out.then as Action[]).map((x) => scaleAction(x, k));
  return out as unknown as Action;
}

export function scalePassive(p: Passive, k: number): Passive {
  if (k === 1) return p;
  return {
    ...p,
    mods: p.mods?.map((m) => ({ ...m, value: m.value * k })),
    hooks: p.hooks?.map((h) => (h.value === undefined ? h : { ...h, value: h.value * k })),
    procs: p.procs?.map((pr) => ({ ...pr, do: pr.do.map((a) => scaleAction(a, k)) })),
  };
}
