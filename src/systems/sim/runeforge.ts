/**
 * Runeforge v2 on the authority (Claude 3, docs/PACING.md D): act { domain: 'systems', action: 'reforge' | 'socket' |
 * 'salvage', args: { shop, uid, gem? } } at a smith whose shop has `runeforge`. Prices come from rules/runeforge.ts.
 * Changed pieces go out as loot:granted with the same uid (the guest applier replaces it in place); spent ingots,
 * gems and salvaged pieces as item:used.
 */
import { shopByNpc } from '@/data/items/hc/shops';
import { INGOT, reforgeCost, salvageYield, socketCost } from '@/systems/rules/runeforge';
import type { ItemInstance } from '@/systems/rules/types';
import { grantItem } from './loot';
import { rebuildPlayer } from './player';
import type { PlayerEnt } from './state';
import type { SimWorld } from './world';

/** A piece the player owns, worn or carried. */
function owned(p: PlayerEnt, uid: string): { it: ItemInstance; worn: boolean } | null {
  const inv = p.save.inventory.find((x) => x.uid === uid);
  if (inv) return { it: inv, worn: false };
  const eq = Object.values(p.save.equipment).find((x) => x?.uid === uid);
  return eq ? { it: eq, worn: true } : null;
}

const count = (p: PlayerEnt, base: string): number => p.save.inventory.filter((x) => x.base === base).reduce((a, x) => a + x.qty, 0);

/** Remove `qty` of a stackable from the pack, one item:used per unit (what the guest applier expects). */
function spend(w: SimWorld, p: PlayerEnt, base: string, qty: number): void {
  let left = qty;
  for (const it of [...p.save.inventory]) {
    if (left <= 0) break;
    if (it.base !== base) continue;
    const n = Math.min(left, it.qty);
    for (let i = 0; i < n; i++) w.emit('item:used', { playerId: p.playerId, uid: it.uid, def: it.base as never });
    it.qty -= n; left -= n;
    if (it.qty <= 0) p.save.inventory.splice(p.save.inventory.indexOf(it), 1);
  }
}

function pay(w: SimWorld, p: PlayerEnt, gold: number): void {
  p.save.gold -= gold;
  w.emit('loot:granted', { playerId: p.playerId, gold: -gold });
}

/** Tell the owning client the piece changed (same uid → replaced in place), and refresh stats if it is worn. */
function changed(w: SimWorld, p: PlayerEnt, it: ItemInstance, worn: boolean): void {
  w.emit('loot:granted', { playerId: p.playerId, instance: { ...it } }); // no item: the loot feed stays quiet
  if (worn) rebuildPlayer(w, p);
}

export function runeforge(w: SimWorld, p: PlayerEnt, action: string, args: Record<string, unknown>): string | null {
  const shop = shopByNpc(String(args.shop ?? ''));
  if (!shop?.runeforge) return 'There is no runeforge here.';
  const o = owned(p, String(args.uid ?? ''));
  if (!o) return 'You don’t have that.';
  const { it, worn } = o;
  if (action === 'reforge') {
    const c = reforgeCost(it, p.save.level);
    if (!c) return 'That is already as strong as you are.';
    if (p.save.gold < c.gold) return 'Not enough Embershards.';
    if (count(p, INGOT) < c.ingots) return `You need ${c.ingots} Iron Ingots.`;
    pay(w, p, c.gold);
    spend(w, p, INGOT, c.ingots);
    it.ilvl = c.to;
    changed(w, p, it, worn);
    return null;
  }
  if (action === 'socket') {
    const gem = String(args.gem ?? '');
    const cost = socketCost(it, gem);
    if (cost === null) return 'That gem won’t sit in that.';
    if (!count(p, gem)) return 'You don’t have that gem.';
    if (p.save.gold < cost) return 'Not enough Embershards.';
    pay(w, p, cost);
    spend(w, p, gem, 1);
    it.gem = gem;
    changed(w, p, it, worn);
    return null;
  }
  if (action === 'salvage') {
    if (worn) return 'Take it off first.';
    const y = salvageYield(it);
    if (!y) return 'The smith won’t break that.';
    p.save.inventory.splice(p.save.inventory.indexOf(it), 1);
    w.emit('item:used', { playerId: p.playerId, uid: it.uid, def: it.base as never });
    grantItem(w, p, { base: INGOT, ilvl: 1, qty: y.ingots });
    if (y.gem) grantItem(w, p, { base: y.gem, ilvl: 1, qty: 1 });
    return null;
  }
  return 'The smith shrugs.';
}
