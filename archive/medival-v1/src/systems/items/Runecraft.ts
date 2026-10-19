/**
 * Runecraft (SYSTEMS.md §7.6): upgrade, salvage, affix reroll, spell essence rank-ups. Pure GameState edits.
 * Phase 1.5 scope: upgrades +1…+6 (tempers and true-iron +7…+10 come with Act II materials).
 */
import { Registry, bus, rng } from '@/core';
import type { GameState, ItemId, ItemInstance, SpellId } from '@/core';
import { RARITY_AFFIXES } from '../balance';
import { addInstance, countItem, equippedUids, removeItem, removeUid } from './Inventory';
import { affixTagsFor, createItem, isGear } from './ItemRoller';

export const MAX_UPGRADE_NOW = 6;

export interface Cost { gold: number; items: { item: ItemId; qty: number }[] }
export type CheckResult = { ok: true; cost: Cost } | { ok: false; reason: string; cost?: Cost };

function afford(state: GameState, cost: Cost): string | null {
  if (state.player.inventory.gold < cost.gold) return `Need ${cost.gold} gold`;
  for (const c of cost.items) {
    if (countItem(state, c.item) < c.qty) return `Need ${c.qty}× ${Registry.tryGet('item', c.item)?.name ?? c.item}`;
  }
  return null;
}

function pay(state: GameState, cost: Cost): void {
  state.player.inventory.gold -= cost.gold;
  for (const c of cost.items) removeItem(state, c.item, c.qty);
}

export function findInstance(state: GameState, uid: string): ItemInstance | undefined {
  return state.player.inventory.items.find((i) => i.uid === uid);
}

// ───────── upgrade ─────────
export function upgradeCost(inst: ItemInstance): Cost {
  const n = inst.upgrade; // current level; cost to reach n+1
  const gold = Math.round(25 * (n + 1) * (1 + inst.itemLevel / 6));
  if (n < 3) return { gold, items: [{ item: 'item:iron-scrap', qty: 2 + n * 2 }] };
  return { gold, items: [{ item: 'item:iron-scrap', qty: 4 + n }, { item: 'item:ley-dust', qty: n - 1 }] };
}

export function canUpgrade(state: GameState, uid: string): CheckResult {
  const inst = findInstance(state, uid);
  const def = inst && Registry.tryGet('item', inst.def);
  if (!inst || !def) return { ok: false, reason: 'Unknown item' };
  if (!isGear(def) || def.upgradeable === false || def.itemKind === 'accessory') return { ok: false, reason: 'Cannot be upgraded' };
  if (inst.upgrade >= MAX_UPGRADE_NOW) return { ok: false, reason: `+${MAX_UPGRADE_NOW} is the limit until you find tempering materials` };
  const cost = upgradeCost(inst);
  const why = afford(state, cost);
  return why ? { ok: false, reason: why, cost } : { ok: true, cost };
}

export function upgrade(state: GameState, uid: string): CheckResult {
  const c = canUpgrade(state, uid);
  if (!c.ok) return c;
  pay(state, c.cost);
  findInstance(state, uid)!.upgrade++;
  bus.emit('stats:changed', {});
  return c;
}

// ───────── salvage ─────────
export function salvageYield(inst: ItemInstance): { item: ItemId; qty: number }[] {
  const base: { item: ItemId; qty: number }[] = [{ item: 'item:iron-scrap', qty: 1 + Math.floor(inst.itemLevel / 4) + inst.upgrade }];
  switch (inst.rarity) {
    case 'uncommon': base.push({ item: 'item:ley-dust', qty: 1 }); break;
    case 'rare': base.push({ item: 'item:ley-dust', qty: 3 }); break;
    case 'epic': base.push({ item: 'item:ley-dust', qty: 5 }, { item: rng.chance(0.5) ? 'item:essence-ash' : 'item:essence-rime', qty: 1 }); break;
    default: break;
  }
  return base;
}

export function canSalvage(state: GameState, uid: string): { ok: true } | { ok: false; reason: string } {
  const inst = findInstance(state, uid);
  const def = inst && Registry.tryGet('item', inst.def);
  if (!inst || !def) return { ok: false, reason: 'Unknown item' };
  if (!isGear(def)) return { ok: false, reason: 'Only gear can be salvaged' };
  if (inst.rarity === 'legendary' || inst.rarity === 'set') return { ok: false, reason: 'Wrought and Sparkforged items cannot be broken down' };
  if (equippedUids(state).has(uid)) return { ok: false, reason: 'Unequip it first' };
  return { ok: true };
}

export function salvage(state: GameState, uid: string): { item: ItemId; qty: number }[] | null {
  if (!canSalvage(state, uid).ok) return null;
  const inst = removeUid(state, uid);
  if (!inst) return null;
  const out = salvageYield(inst);
  for (const y of out) {
    const def = Registry.tryGet('item', y.item);
    if (def) addInstance(state, { ...createItem(def, { qty: y.qty }), qty: y.qty }, true);
  }
  bus.emit('stats:changed', {});
  return out;
}

// ───────── affix reroll (runeforge) ─────────
export function rerollCost(inst: ItemInstance): Cost {
  const strain = inst.enchantStrain ?? 0;
  return { gold: Math.round(40 * Math.pow(2, strain) * (1 + inst.itemLevel / 8)), items: [{ item: 'item:ley-dust', qty: 2 * Math.pow(2, strain) }] };
}

export function canReroll(state: GameState, uid: string, index: number): CheckResult {
  const inst = findInstance(state, uid);
  if (!inst || !inst.affixes[index]) return { ok: false, reason: 'No affix there' };
  const cost = rerollCost(inst);
  const why = afford(state, cost);
  return why ? { ok: false, reason: why, cost } : { ok: true, cost };
}

/** Replace affix `index` with a new roll from the item's pools (other affixes locked). */
export function rerollAffix(state: GameState, uid: string, index: number): CheckResult {
  const c = canReroll(state, uid, index);
  if (!c.ok) return c;
  const inst = findInstance(state, uid)!;
  const def = Registry.get('item', inst.def);
  const tags = new Set(affixTagsFor(def));
  const keep = inst.affixes.filter((_, i) => i !== index);
  const usedGroups = new Set(keep.map((a) => Registry.tryGet('affix', a.affix)?.group ?? a.affix));
  const pool = Registry.all('affix').filter((a) => a.tags.some((t) => tags.has(t)) && !usedGroups.has(a.group ?? a.id) && a.tiers[0].minItemLevel <= inst.itemLevel);
  if (!pool.length) return { ok: false, reason: 'No other affix can roll here' };
  pay(state, c.cost);
  const a = rng.weighted(pool);
  let top = 0;
  a.tiers.forEach((t, i) => { if (t.minItemLevel <= inst.itemLevel) top = i; });
  const tier = rng.chance(0.6) ? top : Math.max(0, top - 1);
  const t = a.tiers[tier];
  const raw = rng.range(t.min, t.max);
  inst.affixes[index] = { affix: a.id, tier: tier + 1, value: Math.abs(t.max) >= 2 ? Math.round(raw) : Math.round(raw * 1000) / 1000 };
  inst.enchantStrain = (inst.enchantStrain ?? 0) + 1;
  bus.emit('stats:changed', {});
  return c;
}

/** max affixes for display ("2 / 3 affixes") */
export const affixCapacity = (inst: ItemInstance) => RARITY_AFFIXES[inst.rarity][1];

// ───────── spell ranks 4–5 (essences) ─────────
export function canRankSpell(state: GameState, spellId: SpellId): CheckResult {
  const spell = Registry.tryGet('spell', spellId);
  const prog = state.player.spellbook.known[spellId];
  if (!spell || !prog) return { ok: false, reason: 'Unknown spell' };
  if (prog.rank >= 5) return { ok: false, reason: 'Mastered' };
  const next = spell.ranks[prog.rank];
  if (!next) return { ok: false, reason: 'No further ranks' };
  if (prog.mastery < next.masteryXp) return { ok: false, reason: `Mastery ${prog.mastery} / ${next.masteryXp}` };
  if (!next.essenceCost) return { ok: false, reason: 'Ranks up through mastery alone' };
  const cost: Cost = { gold: 100 * (prog.rank + 1), items: [next.essenceCost] };
  const why = afford(state, cost);
  return why ? { ok: false, reason: why, cost } : { ok: true, cost };
}

export function rankSpell(state: GameState, spellId: SpellId): CheckResult {
  const c = canRankSpell(state, spellId);
  if (!c.ok) return c;
  pay(state, c.cost);
  const prog = state.player.spellbook.known[spellId]!;
  prog.rank++;
  bus.emit('spell:ranked', { spellId, rank: prog.rank });
  return c;
}
