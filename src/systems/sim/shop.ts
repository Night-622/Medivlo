/**
 * Shops and quest rewards on the authority (Claude 3).
 * - act buy {shop, item, idx?} / sell {uid}: validated here, gold and items move, loot:granted / item:used tell the client
 * - quest:reward (hcItems, xpTier, gold, skillPoints; no playerId = whole party), quest:take-item (handoff ids)
 */
import { Rng } from '@/core/rng';
import { HC_PIECES } from '@/data/items/hc/armour.gen';
import { HC_WEAPONS } from '@/data/items/hc/weapons.gen';
import { shopByNpc, type HcShopDef } from '@/data/items/hc/shops';
import { P, unlockLevel, xpToNext } from '@/systems/rules/curves';
import { itemInfo, materialIndex, sellValue, styleIndex } from '@/systems/rules/gear';
import type { ItemInstance } from '@/systems/rules/types';
import { hook } from '@/systems/rules/stats';
import { grantXp } from './death';
import { grantItem, grantOrDrop } from './loot';
import type { PlayerEnt } from './state';
import { nearNpc, type SimWorld } from './world';

/** share of the current level's XP per quest tier; with kills (~45% of XP) ≈ 12.5 levels an act (Act I ends L13–14) */
export const QUEST_XP_TIER = { 1: 0.16, 2: 0.3, 3: 0.53 } as const;

export interface ShopLine { item: string; ilvl: number; price: number }

const gearScale = (ilvl: number): number => Math.pow(P(ilvl), 0.6);

/** What a merchant offers this player right now (fixed stock + gear rolled for their level). */
export function shopStock(shop: HcShopDef, p: { classId: string; level: number; school: string; weapons: string[] }, flag: (k: string) => unknown, priceMult: number): ShopLine[] {
  const out: ShopLine[] = [];
  for (const s of shop.stock) {
    if (s.when && !flag(s.when)) continue;
    const info = itemInfo(s.item);
    if (info) out.push({ item: s.item, ilvl: info.slot ? p.level : 1, price: Math.max(1, Math.round(info.value * (info.slot ? gearScale(p.level) : 1) * priceMult)) });
  }
  if (shop.gear) {
    // the same roll for everyone of this level, so co-op players see the same anvil
    const rng = new Rng(hash(`${shop.id}:${p.level}:${p.classId}`));
    let top = 0;
    for (let i = 0; i < 8; i++) if (p.level >= unlockLevel(i)) top = i;
    const weapons = HC_WEAPONS.filter((w) => (shop.gear!.weapons === 'kit' ? p.weapons.includes(w.type) : true) && materialIndex(w.id) <= top && materialIndex(w.id) >= top - 1);
    const armour = HC_PIECES.filter((a) => (shop.gear!.armour === 'school' ? a.set.startsWith(`${p.school}_`) : true) && styleIndex(a.id) <= top && styleIndex(a.id) >= top - 1);
    let added = 0;
    for (let i = 0; i < shop.gear.count * 4 && added < shop.gear.count; i++) {
      const pool = i % 2 === 0 && weapons.length ? weapons : armour;
      if (!pool.length) continue;
      const base = rng.pick(pool as { id: string }[]).id;
      if (out.some((x) => x.item === base)) continue;
      added++;
      const info = itemInfo(base)!;
      out.push({ item: base, ilvl: p.level, price: Math.max(1, Math.round(info.value * 2 * gearScale(p.level) * priceMult)) });
    }
  }
  return out;
}

/** What a merchant pays for one: base value / 4, scaled by item level, rolled rarity and upgrades (rules/gear sellValue). */
export const sellPrice = (it: Pick<ItemInstance, 'base' | 'ilvl' | 'rarity' | 'upgrade'>): number => sellValue(it);





export function buysItem(shop: HcShopDef, base: string): boolean {
  const info = itemInfo(base);
  if (!info || info.questItem) return false;
  if (shop.buys === 'all') return true;
  return shop.buys.includes(info.slot ? 'gear' : (info.kind as never));
}

const hash = (s: string): number => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };

export interface ShopEnv { flag: (k: string) => unknown; priceMult: (npc: string) => number }

export function buy(w: SimWorld, p: PlayerEnt, shopId: string, item: string, env: ShopEnv): string | null {
  const shop = shopByNpc(shopId);
  if (!shop) return 'No such merchant.';
  if (!nearNpc(w, p, shop.npc)) return 'Walk over to the merchant first.';
  const mult = env.priceMult(shop.npc) * (1 - hook(p.stats, 'shopDiscount'));
  const line = shopStock(shop, playerShopView(p), env.flag, mult).find((l) => l.item === item);
  if (!line) return 'Not for sale.';
  if (p.save.gold < line.price) return 'Not enough Embershards.';
  if (!grantItem(w, p, { base: line.item, ilvl: line.ilvl, qty: 1 })) return 'Your pack is full.';
  p.save.gold -= line.price;
  w.emit('loot:granted', { playerId: p.playerId, gold: -line.price });
  return null;
}

export function sell(w: SimWorld, p: PlayerEnt, shopId: string, uid: string): string | null {
  const shop = shopByNpc(shopId);
  const it = p.save.inventory.find((x) => x.uid === uid);
  if (!shop || !it) return 'Nothing to sell.';
  if (!nearNpc(w, p, shop.npc)) return 'Walk over to the merchant first.';
  if (!buysItem(shop, it.base)) return `${shop.name} doesn’t buy that.`;
  const price = sellPrice(it) * it.qty;
  p.save.inventory.splice(p.save.inventory.indexOf(it), 1);
  for (let i = 0; i < it.qty; i++) w.emit('item:used', { playerId: p.playerId, uid, def: it.base as never });
  p.save.gold += price;
  w.emit('loot:granted', { playerId: p.playerId, gold: price });
  return null;
}

export const playerShopView = (p: PlayerEnt) => ({ classId: p.save.classId, level: p.save.level, school: p.school, weapons: p.kit.weapons });

// ───────────── quests ─────────────
export interface QuestRewardEv { playerId?: string; xpTier?: 1 | 2 | 3; gold?: number; skillPoints?: number; hcItems?: { item: string; qty?: number; ilvl?: number }[] }

export function questReward(w: SimWorld, e: QuestRewardEv): void {
  const who = e.playerId ? [w.players.get(`p:${e.playerId}`)].filter((x): x is PlayerEnt => !!x) : [...w.players.values()];
  for (const p of who) {
    if (e.gold) { p.save.gold += e.gold; w.emit('loot:granted', { playerId: p.playerId, gold: e.gold }); }
    if (e.xpTier) grantXp(w, p, QUEST_XP_TIER[e.xpTier] * xpToNext(p.save.level), 'quest');
    if (e.skillPoints) p.save.bonusPoints += e.skillPoints;
    for (const it of e.hcItems ?? []) {
      const info = itemInfo(it.item);
      if (!info) { console.warn(`[systems] quest reward: unknown item ${it.item}`); continue; }
      grantOrDrop(w, p, { base: it.item, ilvl: it.ilvl ?? (info.slot ? p.save.level : 1), qty: it.qty ?? 1 });
    }
  }
}

/** Take quest items from whoever carries them (host first). */
export function questTake(w: SimWorld, item: string, qty: number): void {
  let left = qty;
  for (const p of w.players.values()) {
    for (const it of [...p.save.inventory]) {
      if (left <= 0) return;
      if (it.base !== item) continue;
      const n = Math.min(left, it.qty);
      it.qty -= n;
      left -= n;
      if (it.qty <= 0) p.save.inventory.splice(p.save.inventory.indexOf(it), 1);
      for (let i = 0; i < n; i++) w.emit('item:used', { playerId: p.playerId, uid: it.uid, def: it.base as never });
    }
  }
}
