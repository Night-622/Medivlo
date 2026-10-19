/**
 * Merchants (docs/lore/12-reputation.md): buy/sell with reputation price multipliers and refusals.
 * Opening: narrative sets flag `shop.open` = <npc id>; the NPC's `shop` field names the ShopDef (`shop:<id>`,
 * data in src/data/items/shops.ts). Price = value × rarity × upgrades × rep.price.<faction> × trait discounts.
 */
import { Registry, getFlag } from '@/core';
import type { GameState, ItemDef, ItemId, ItemInstance, Rarity } from '@/core';
import { RARITY_WEIGHTS } from '../balance';
import { addInstance, countItem, equippedUids, freeSlots, removeUid } from './Inventory';
import { createItem, isGear } from './ItemRoller';

export interface ShopStockEntry { item: ItemId; rarity?: Rarity; minLevel?: number }
export interface ShopDef {
  id: `shop:${string}`;
  name: string;
  greeting?: string;
  stock: ShopStockEntry[];
  /** pieces of random gear rolled per visit (smart loot for the player's class) */
  randomGear?: number;
  /** only buys items with one of these kinds (default: everything except quest/key) */
  buys?: ItemDef['itemKind'][];
}

const RARITY_PRICE: Record<Rarity, number> = { common: 1, uncommon: 1.6, rare: 3, epic: 6, legendary: 20, set: 15 };
export const SELL_RATE = 0.35;

export interface ShopContext { shop: ShopDef; npcId: string; faction: string | null; priceMult: number; refuse: boolean }

export function shopFor(npcId: string): ShopContext | null {
  const npc = Registry.tryGet('npc', npcId) as ({ shop?: string; faction?: string } & object) | undefined;
  const shopId = npc?.shop;
  const shop = shopId ? Registry.extra<ShopDef>('shop', shopId) : undefined;
  if (!shop) return null;
  const slug = npc?.faction ? npc.faction.replace(/^faction:/, '') : null;
  const priceMult = slug ? Number(getFlag(`rep.price.${slug}`) ?? 1) || 1 : 1;
  const refuse = slug ? getFlag(`rep.refuse.${slug}`) === true : false;
  return { shop, npcId, faction: slug, priceMult, refuse };
}

/** player-side discount from traits/ancestry (hook shopDiscount, e.g. Silver Tongue 15%, Solenni 10%) */
export function discountMult(discountPct: number): number {
  return Math.max(0.5, 1 - discountPct);
}

export function baseValue(def: ItemDef, inst?: Pick<ItemInstance, 'rarity' | 'upgrade' | 'itemLevel'>): number {
  const r = inst?.rarity ?? def.rarity;
  const lvl = inst ? 1 + Math.max(0, inst.itemLevel - def.itemLevel) * 0.06 : 1;
  return def.value * RARITY_PRICE[r] * (1 + 0.15 * (inst?.upgrade ?? 0)) * lvl;
}

export function buyPrice(ctx: ShopContext, def: ItemDef, inst: Pick<ItemInstance, 'rarity' | 'upgrade' | 'itemLevel'> | undefined, discountPct: number): number {
  return Math.max(1, Math.round(baseValue(def, inst) * ctx.priceMult * discountMult(discountPct)));
}

export function sellPrice(ctx: ShopContext, inst: ItemInstance): number {
  const def = Registry.tryGet('item', inst.def);
  if (!def) return 0;
  return Math.max(0, Math.floor((baseValue(def, inst) * SELL_RATE) / ctx.priceMult)) * (def.stack && def.stack > 1 ? inst.qty : 1);
}

export function canSellToShop(ctx: ShopContext, state: GameState, inst: ItemInstance): string | null {
  const def = Registry.tryGet('item', inst.def);
  if (!def) return 'Unknown item';
  if (def.itemKind === 'quest' || def.itemKind === 'key') return 'Not for sale';
  if (equippedUids(state).has(inst.uid)) return 'Unequip it first';
  if (ctx.shop.buys && !ctx.shop.buys.includes(def.itemKind)) return 'They do not deal in that';
  return null;
}

/** Stock for this visit: fixed entries + rolled gear. */
export function rollStock(ctx: ShopContext, playerLevel: number, proficient: Set<string>): ItemInstance[] {
  const out: ItemInstance[] = [];
  for (const e of ctx.shop.stock) {
    if (e.minLevel && playerLevel < e.minLevel) continue;
    const def = Registry.tryGet('item', e.item);
    if (def) out.push(createItem(def, { rarity: e.rarity, itemLevel: isGear(def) ? Math.max(def.itemLevel, playerLevel) : def.itemLevel, qty: 1 }));
  }
  const pool = Registry.all('item').filter((d) => isGear(d) && d.rarity === 'common' && d.itemLevel <= playerLevel + 2
    && (!d.weapon || proficient.has(d.weapon.family)));
  for (let i = 0; i < (ctx.shop.randomGear ?? 0) && pool.length; i++) {
    const def = pool[Math.floor(Math.random() * pool.length)];
    out.push(createItem(def, { rarity: 'roll', rarityBoost: 1 + RARITY_WEIGHTS.rare / 10, itemLevel: playerLevel }));
  }
  return out;
}

export function buy(state: GameState, ctx: ShopContext, inst: ItemInstance, discountPct: number): string | null {
  if (ctx.refuse) return 'They will not trade with you';
  const def = Registry.tryGet('item', inst.def);
  if (!def) return 'Unknown item';
  const price = buyPrice(ctx, def, inst, discountPct);
  if (state.player.inventory.gold < price) return `Need ${price} gold`;
  const stackable = (def.stack ?? 1) > 1;
  if (!stackable && def.itemKind !== 'material' && freeSlots(state) <= 0) return 'Bags full';
  const copy = createItem(def, { rarity: inst.rarity, itemLevel: inst.itemLevel, qty: 1 });
  copy.affixes = inst.affixes.map((a) => ({ ...a }));
  if (!addInstance(state, copy)) return 'Bags full';
  state.player.inventory.gold -= price;
  return null;
}

export function sell(state: GameState, ctx: ShopContext, uid: string): string | null {
  if (ctx.refuse) return 'They will not trade with you';
  const inst = state.player.inventory.items.find((i) => i.uid === uid);
  if (!inst) return 'Unknown item';
  const why = canSellToShop(ctx, state, inst);
  if (why) return why;
  const price = sellPrice(ctx, inst);
  removeUid(state, uid);
  state.player.inventory.gold += price;
  return null;
}

export { countItem };
