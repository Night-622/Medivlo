/**
 * Runeforge v2 on the authority (Claude 3, docs/PACING.md D): act { domain: 'systems', action: 'reforge' | 'socket' |
 * 'salvage', args: { shop, uid, gem? } } at a smith whose shop has `runeforge`. Prices come from rules/runeforge.ts.
 * Changed pieces go out as loot:granted with the same uid (the guest applier replaces it in place); spent ingots,
 * gems and salvaged pieces as item:used.
 */
import { shopByNpc } from '@/data/items/hc/shops';
import { dustYield, imbueCost, INGOT, reforgeCost, rerollCost, salvageYield, socketCost, transferCost, uniqueOf, upgradeCost } from '@/systems/rules/runeforge';
import { affixDef, rollAffixes } from '@/systems/rules/affixes';
import { essenceOf, HC_RUNES, RUNE_DUST } from '@/data/items/hc/build-items';
import { MAGIC_SCHOOLS, MARTIAL_SCHOOLS } from '@/core/constants';
import { socketCount } from '@/systems/rules/affixes';
import type { ItemInstance, SchoolId } from '@/systems/rules/types';
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

export const RUNEFORGE_ACTIONS = ['reforge', 'socket', 'salvage', 'upgrade', 'reroll', 'imbue', 'transfer', 'craft'];

export function runeforge(w: SimWorld, p: PlayerEnt, action: string, args: Record<string, unknown>): string | null {
  const shop = shopByNpc(String(args.shop ?? ''));
  if (!shop?.runeforge) return 'There is no runeforge here.';
  if (action === 'craft') return craft(w, p, String(args.rune ?? ''));
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
    // sockets by rarity; legacy items carry their one gem into socket 0
    const n = socketCount(it);
    const sockets = it.sockets ?? Array.from({ length: n }, (_, i) => (i === 0 ? it.gem ?? null : null));
    const want = Number(args.socket);
    const at = Number.isInteger(want) && want >= 0 && want < n ? want : Math.max(0, sockets.indexOf(null));
    sockets[at] = gem;
    it.sockets = sockets.slice(0, n);
    delete it.gem;
    changed(w, p, it, worn);
    return null;
  }
  if (action === 'upgrade') {
    const c = upgradeCost(it);
    if (!c) return 'That can’t be upgraded any further.';
    if (count(p, INGOT) < c.ingots) return `You need ${c.ingots} Iron Ingots.`;
    if (p.save.gold < c.gold) return 'Not enough Embershards.';
    pay(w, p, c.gold);
    spend(w, p, INGOT, c.ingots);
    it.upgrade = c.to;
    changed(w, p, it, worn);
    return null;
  }
  if (action === 'reroll') {
    const cost = rerollCost(it), i = Number(args.affix);
    if (cost === null || !Number.isInteger(i) || !it.affixes?.[i]) return 'There is nothing to reroll there.';
    if (p.save.gold < cost) return 'Not enough Embershards.';
    // a fresh roll of one affix: same kind (prefix / suffix), any group the rest of the item does not already hold
    const fresh = rerollOne(w, p, it, i);
    if (!fresh) return 'The runes refuse to change.';
    pay(w, p, cost);
    it.affixes = it.affixes.map((a, j) => (j === i ? fresh : a));
    changed(w, p, it, worn);
    return null;
  }
  if (action === 'imbue') {
    const cost = imbueCost(it), school = String(args.school ?? '') as SchoolId;
    if (cost === null) return 'Only weapons take an imbue.';
    if (!(SCHOOLS as string[]).includes(school)) return 'Choose a school.';
    if (!count(p, essenceOf(school))) return 'You need an Essence of that school.';
    if (p.save.gold < cost) return 'Not enough Embershards.';
    pay(w, p, cost);
    spend(w, p, essenceOf(school), 1);
    it.imbue = school;
    changed(w, p, it, worn);
    return null;
  }
  if (action === 'transfer') {
    const src = owned(p, String(args.from ?? ''));
    if (!src) return 'You don’t have that.';
    if (src.worn) return 'Take it off first.';
    const cost = transferCost(src.it, it);
    if (cost === null) return 'That effect can’t move there.';
    if (p.save.gold < cost) return 'Not enough Embershards.';
    pay(w, p, cost);
    it.uniqueFx = uniqueOf(src.it);
    p.save.inventory.splice(p.save.inventory.indexOf(src.it), 1);
    w.emit('item:used', { playerId: p.playerId, uid: src.it.uid, def: src.it.base as never });
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
    for (const g of y.gems) grantItem(w, p, { base: g, ilvl: 1, qty: 1 });
    const dust = dustYield(it);
    if (dust) grantItem(w, p, { base: RUNE_DUST, ilvl: 1, qty: dust });
    return null;
  }
  return 'The smith shrugs.';
}

const SCHOOLS: string[] = [...MAGIC_SCHOOLS, ...MARTIAL_SCHOOLS];

/** One affix rerolled: the same kind (prefix / suffix), a group the rest of the item does not hold. */
function rerollOne(w: SimWorld, p: PlayerEnt, it: ItemInstance, i: number): NonNullable<ItemInstance['affixes']>[number] | null {
  const old = affixDef(it.affixes![i].id);
  if (!old) return null;
  const keep = new Set(it.affixes!.filter((_, j) => j !== i).map((a) => affixDef(a.id)?.group));
  for (let tries = 0; tries < 40; tries++) {
    const [r] = rollAffixes(w.rng, it.base, it.ilvl, 'fine', { classId: p.save.classId, school: p.school });
    const d = r && affixDef(r.id);
    if (d && d.kind === old.kind && !keep.has(d.group) && r.id !== old.id) return r;
  }
  return null;
}

/** Craft a rune from its recipe (gold + rune dust, an Essence for Convert runes). */
function craft(w: SimWorld, p: PlayerEnt, id: string): string | null {
  const r = HC_RUNES.find((x) => x.id === id);
  if (!r) return 'The smith doesn’t know that rune.';
  for (const need of r.craft.items) if (count(p, need.item) < need.qty) return 'You lack the materials.';
  if (p.save.gold < r.craft.gold) return 'Not enough Embershards.';
  if (!grantItem(w, p, { base: r.id, ilvl: 1, qty: 1 })) return 'Your pack is full.';
  pay(w, p, r.craft.gold);
  for (const need of r.craft.items) spend(w, p, need.item, need.qty);
  return null;
}
