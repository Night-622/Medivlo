/**
 * Loot-table rolling (SYSTEMS.md §7.3, §8.5). Pure apart from Registry reads.
 */
import { Registry, rng as sharedRng } from '@/core';
import type { ItemDef, ItemFilter, ItemInstance, LootEntry, Rng, WeaponFamily } from '@/core';
import { goldCurve } from '../balance';
import { createItem, isGear } from './ItemRoller';

export interface LootContext {
  level: number;              // monster/chest level → item level
  rarityBoost?: number;       // tier × rank × itemFind
  goldFind?: number;
  proficient?: Set<WeaponFamily>;
  check?: (e: LootEntry) => boolean; // condition evaluator (optional)
  rng?: Rng;
}

export interface LootDrop { items: ItemInstance[]; gold: number }

function randomBase(filter: ItemFilter, level: number, ctx: LootContext, r: Rng): ItemDef | null {
  let pool = Registry.all('item').filter((d) =>
    isGear(d) && d.rarity === 'common' && d.itemLevel <= level + 2 &&
    (!filter.kinds || filter.kinds.includes(d.itemKind)) &&
    (!filter.slots || (d.slot !== undefined && filter.slots.includes(d.slot))) &&
    (!filter.weaponFamilies || (d.weapon !== undefined && filter.weaponFamilies.includes(d.weapon.family))) &&
    (!filter.tags || filter.tags.every((t) => d.tags?.includes(t))));
  if (pool.length === 0) return null;
  if (filter.smart && ctx.proficient && r.chance(filter.smart)) {
    const smart = pool.filter((d) => !d.weapon || ctx.proficient!.has(d.weapon.family));
    if (smart.length) pool = smart;
  }
  return r.pick(pool);
}

function rollEntry(e: LootEntry, ctx: LootContext, out: LootDrop, r: Rng, depth: number): void {
  if (ctx.check && e.conditions?.length && !ctx.check(e)) return;
  switch (e.kind) {
    case 'nothing': return;
    case 'item': {
      const def = Registry.tryGet('item', e.item);
      if (!def) { console.warn(`[loot] missing item ${e.item}`); return; }
      const qty = e.qty ? r.int(e.qty[0], e.qty[1]) : 1;
      out.items.push(createItem(def, { qty, rarity: e.rarity, itemLevel: ctx.level, rarityBoost: ctx.rarityBoost, rng: r }));
      return;
    }
    case 'random': {
      const def = randomBase(e.filter, ctx.level, ctx, r);
      if (def) out.items.push(createItem(def, { rarity: e.rarity ?? 'roll', itemLevel: ctx.level, rarityBoost: ctx.rarityBoost, rng: r }));
      return;
    }
    case 'table':
      if (depth < 4) rollTableInto(e.table, ctx, out, r, depth + 1);
      return;
  }
}

function rollTableInto(id: string, ctx: LootContext, out: LootDrop, r: Rng, depth: number): void {
  const t = Registry.tryGet('loot', id);
  if (!t) { console.warn(`[loot] missing table ${id}`); return; }
  const boosted: LootContext = { ...ctx, rarityBoost: (ctx.rarityBoost ?? 1) * (t.rarityBoost ?? 1) };
  for (const g of t.guaranteed ?? []) rollEntry(g, boosted, out, r, depth);
  const rolls = Array.isArray(t.rolls) ? r.int(t.rolls[0], t.rolls[1]) : t.rolls;
  const entries = t.entries.filter((e) => !ctx.check || !e.conditions?.length || ctx.check(e));
  for (let i = 0; i < rolls && entries.length; i++) rollEntry(r.weighted(entries), boosted, out, r, depth);
  if (t.gold) out.gold += Math.round(r.int(t.gold[0], t.gold[1]) * goldCurve(ctx.level) * (ctx.goldFind ?? 1));
}

export function rollLoot(tableId: string, ctx: LootContext): LootDrop {
  const out: LootDrop = { items: [], gold: 0 };
  rollTableInto(tableId, ctx, out, ctx.rng ?? sharedRng, 0);
  return out;
}
