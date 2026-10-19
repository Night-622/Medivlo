/** Faction reputation with relation spillover (docs/lore/03-factions.md). Owner: Claude 4. */
import { Registry, bus, getFlag, setFlag } from '@/core';
import type { FactionDef, FactionId, FlagValue } from '@/core';
import { nar, toast } from './state';

export const REP_TIERS: { max: number; name: string }[] = [
  { max: -60, name: 'Hated' },
  { max: -25, name: 'Hostile' },
  { max: -1, name: 'Wary' },
  { max: 24, name: 'Neutral' },
  { max: 59, name: 'Friendly' },
  { max: 89, name: 'Honoured' },
  { max: 100, name: 'Exalted' },
];

export function repTier(value: number): string {
  return REP_TIERS.find((t) => value <= t.max)?.name ?? 'Exalted';
}

function faction(id: FactionId): FactionDef | undefined {
  return Registry.tryGet('faction', id) as FactionDef | undefined;
}

/** Own value, else the parent faction's (e.g. Order of the Wick → Lanternate), else startingRep. */
export function getRep(id: FactionId): number {
  const own = nar().reputation[id];
  if (own !== undefined) return own;
  const def = faction(id);
  if (def?.parent) return getRep(def.parent);
  return def?.startingRep ?? 0;
}

export function rankTitle(id: FactionId): string | undefined {
  const v = getRep(id);
  const ranks = faction(id)?.ranks ?? [];
  return [...ranks].sort((a, b) => b.min - a.min).find((r) => v >= r.min)?.title;
}


/** Change reputation. Spillover: each related faction moves by trunc(delta × relation / 200). */
export function changeRep(id: FactionId, delta: number, spill = true): void {
  if (!delta) return;
  const def = faction(id);
  const before = rankTitle(id);
  const value = Math.max(-100, Math.min(100, getRep(id) + delta));
  nar().reputation[id] = value;
  bus.emit('reputation:changed', { factionId: id, value, delta });
  syncRepFlags(id);
  const after = rankTitle(id);
  if (after && after !== before && def?.joinable) toast(`${def.shortName}: you are now ${after}`, 'reputation');
  if (spill) {
    toast(`${def?.shortName ?? id} ${delta > 0 ? '+' : ''}${delta}`, 'reputation');
    for (const [other, rel] of Object.entries(def?.relations ?? {})) {
      const d = Math.trunc((delta * (rel ?? 0)) / 200);
      if (d) changeRep(other as FactionId, d, false);
    }
  }
}

// ---------- consequences surfaced as plain flags (read by Claude 3 shops, Claude 2 guards, dialogue) ----------

/** Merchant price multiplier by tier: Hated refuse, Hostile +25%, Wary +10%, Neutral 1, Friendly −5%, Honoured −10%, Exalted −15%. */
export const PRICE_BY_TIER: Record<string, number> = { Hated: 1.5, Hostile: 1.25, Wary: 1.1, Neutral: 1, Friendly: 0.95, Honoured: 0.9, Exalted: 0.85 };

/**
 * Writes, per faction slug (`faction:lanternate` → `lanternate`):
 *   rep.price.<slug>  number  merchant price multiplier
 *   rep.refuse.<slug> bool    true when Hated (merchants of that faction won't trade)
 *   rep.tier.<slug>   string  Hated…Exalted
 *   rep.rank.<slug>   string  faction rank title ('' if none)
 * Sub-factions (e.g. the Wick) inherit their parent's values unless they have their own.
 */
export function syncRepFlags(id: FactionId): void {
  const slug = id.slice(id.indexOf(':') + 1);
  const v = getRep(id);
  const tier = repTier(v);
  const set = (k: string, val: FlagValue) => { if (getFlag(k) !== val) setFlag(k, val); };
  set(`rep.price.${slug}`, PRICE_BY_TIER[tier] ?? 1);
  set(`rep.refuse.${slug}`, tier === 'Hated');
  set(`rep.tier.${slug}`, tier);
  set(`rep.rank.${slug}`, rankTitle(id) ?? '');
  for (const child of (Registry.all('faction') as FactionDef[]).filter((f) => f.parent === id && nar().reputation[f.id] === undefined)) syncRepFlags(child.id);
}

export function syncAllRepFlags(): void {
  for (const f of Registry.all('faction') as FactionDef[]) syncRepFlags(f.id);
}
