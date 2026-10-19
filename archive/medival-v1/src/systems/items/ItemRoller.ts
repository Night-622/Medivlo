/**
 * Creates ItemInstances: rarity roll, affix roll (SYSTEMS.md §7.3–7.4). Pure apart from Registry reads.
 */
import { Registry, rng as sharedRng } from '@/core';
import type { AffixDef, AffixTag, ItemDef, ItemInstance, Rarity, Rng } from '@/core';
import { AFFIX_TIER_ILVL, RARITY_AFFIXES, RARITY_WEIGHTS } from '../balance';

let uidCounter = 0;
export function newUid(): string {
  uidCounter = (uidCounter + 1) % 1_000_000;
  return `i${Date.now().toString(36)}${uidCounter.toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;
}

export const isGear = (def: ItemDef): boolean =>
  def.itemKind === 'weapon' || def.itemKind === 'armor' || def.itemKind === 'offhand' || def.itemKind === 'accessory';

export const isStackable = (def: ItemDef): boolean => (def.stack ?? 1) > 1;

/** Affix pools an item may roll from, if the def doesn't say. */
export function affixTagsFor(def: ItemDef): AffixTag[] {
  if (def.affixTags) return def.affixTags;
  switch (def.itemKind) {
    case 'weapon': {
      const f = def.weapon?.family;
      const sub: AffixTag = f === 'bow' || f === 'crossbow' ? 'ranged' : f === 'staff' || f === 'wand' ? 'caster' : 'melee';
      return ['weapon', sub];
    }
    case 'offhand': return def.offhand?.family === 'shield' ? ['shield'] : ['caster'];
    case 'armor': {
      const s = def.slot;
      const slotTag: AffixTag | null = s === 'head' || s === 'chest' || s === 'hands' || s === 'legs' || s === 'feet' || s === 'cloak' || s === 'belt' ? s : null;
      return slotTag ? ['armor', slotTag] : ['armor'];
    }
    case 'accessory': return ['jewelry'];
    default: return [];
  }
}

/** Roll a rarity tier for random gear. Only common→epic; legendaries/sets drop as named items. */
export function rollRarity(boost = 1, r: Rng = sharedRng): Rarity {
  const pool: { rarity: Rarity; weight: number }[] = (['common', 'uncommon', 'rare', 'epic', 'legendary'] as Rarity[]).map((rarity) => ({
    rarity,
    weight: RARITY_WEIGHTS[rarity] * (rarity === 'common' || rarity === 'uncommon' ? 1 : boost),
  }));
  return r.weighted(pool).rarity;
}

function maxTierIndex(def: AffixDef, itemLevel: number): number {
  let idx = -1;
  def.tiers.forEach((t, i) => { if (t.minItemLevel <= itemLevel) idx = i; });
  return idx;
}

export function rollAffixes(def: ItemDef, rarity: Rarity, itemLevel: number, r: Rng = sharedRng): ItemInstance['affixes'] {
  const [lo, hi] = RARITY_AFFIXES[rarity];
  const count = def.maxAffixes !== undefined ? Math.min(def.maxAffixes, hi) : r.int(lo, hi);
  if (count <= 0) return [];
  const tags = new Set(affixTagsFor(def));
  const pool = Registry.all('affix').filter((a) => a.tags.some((t) => tags.has(t)) && maxTierIndex(a, itemLevel) >= 0);
  const out: ItemInstance['affixes'] = [];
  const usedGroups = new Set<string>();
  const counts = { prefix: 0, suffix: 0 };
  const bonusTier = rarity === 'epic' ? 1 : 0;
  for (let n = 0; n < count; n++) {
    const avail = pool.filter((a) => !usedGroups.has(a.group ?? a.id) && counts[a.position] < 2);
    if (avail.length === 0) break;
    const a = r.weighted(avail);
    usedGroups.add(a.group ?? a.id);
    counts[a.position]++;
    const top = Math.min(a.tiers.length - 1, maxTierIndex(a, itemLevel) + bonusTier);
    const tier = Math.max(0, r.chance(0.6) ? top : top - 1);
    const t = a.tiers[tier];
    const raw = r.range(t.min, t.max);
    const value = Math.abs(t.max) >= 2 ? Math.round(raw) : Math.round(raw * 1000) / 1000;
    out.push({ affix: a.id, tier: tier + 1, value });
  }
  return out;
}

export interface CreateOpts { qty?: number; rarity?: Rarity | 'roll'; itemLevel?: number; rarityBoost?: number; rng?: Rng }

/** Make a concrete item from a def. Non-gear and uniques keep their authored rarity. */
export function createItem(def: ItemDef, opts: CreateOpts = {}): ItemInstance {
  const r = opts.rng ?? sharedRng;
  const itemLevel = Math.max(1, opts.itemLevel ?? def.itemLevel);
  let rarity: Rarity = def.rarity;
  const fixed = def.rarity === 'legendary' || def.rarity === 'set' || !isGear(def);
  if (!fixed && opts.rarity) {
    rarity = opts.rarity === 'roll' ? rollRarity(opts.rarityBoost ?? 1, r) : opts.rarity;
    if (rarity === 'legendary' || rarity === 'set') rarity = 'epic';
  }
  return {
    uid: newUid(),
    def: def.id,
    qty: Math.max(1, Math.min(opts.qty ?? 1, def.stack ?? 1)),
    rarity,
    itemLevel,
    affixes: isGear(def) ? rollAffixes(def, rarity, itemLevel, r) : [],
    upgrade: 0,
  };
}

/** Tier unlocked for an item level, 1-based (for UI). */
export function affixTierForIlvl(ilvl: number): number {
  let t = 0;
  AFFIX_TIER_ILVL.forEach((min, i) => { if (ilvl >= min) t = i + 1; });
  return t;
}
