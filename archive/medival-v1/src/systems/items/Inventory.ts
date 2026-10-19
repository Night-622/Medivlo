/**
 * Inventory + equipment operations on GameState (SYSTEMS.md §7.1). Pure state edits + bus events.
 * All owned items live in inventory.items; equipment slots reference them by uid.
 */
import { Registry, bus } from '@/core';
import type { EquipSlot, GameState, ItemDef, ItemId, ItemInstance } from '@/core';
import { createItem, isStackable, type CreateOpts } from './ItemRoller';

export type WornSlot = Exclude<EquipSlot, 'mainHand' | 'offHand'>;

export function equippedUids(state: GameState): Set<string> {
  const e = state.player.equipment;
  const s = new Set<string>();
  for (const lo of e.loadouts) { if (lo.mainHand) s.add(lo.mainHand); if (lo.offHand) s.add(lo.offHand); }
  for (const uid of Object.values(e.worn)) if (uid) s.add(uid);
  for (const prog of Object.values(state.player.spellbook.known)) for (const g of prog?.glyphs ?? []) s.add(g); // socketed glyphs
  return s;
}

/** Items occupying bag slots (not equipped). */
export function bagItems(state: GameState): ItemInstance[] {
  const eq = equippedUids(state);
  return state.player.inventory.items.filter((i) => !eq.has(i.uid));
}

export function freeSlots(state: GameState): number {
  return state.player.inventory.capacity - bagItems(state).filter((i) => !isMaterial(i.def)).length;
}

function isMaterial(id: ItemId): boolean {
  const d = Registry.tryGet('item', id);
  return d?.itemKind === 'material' || d?.itemKind === 'quest' || d?.itemKind === 'key';
}

export function countItem(state: GameState, def: ItemId): number {
  return state.player.inventory.items.filter((i) => i.def === def).reduce((a, i) => a + i.qty, 0);
}

/** Add an existing instance (merging stacks). Returns false if bags are full. */
export function addInstance(state: GameState, inst: ItemInstance, silent = false): boolean {
  const def = Registry.tryGet('item', inst.def);
  if (!def) return false;
  const items = state.player.inventory.items;
  if (isStackable(def)) {
    let left = inst.qty;
    for (const it of items) {
      if (it.def !== inst.def || left <= 0) continue;
      const room = (def.stack ?? 1) - it.qty;
      const put = Math.min(room, left);
      it.qty += put;
      left -= put;
    }
    if (left > 0) {
      if (!isMaterial(def.id) && freeSlots(state) <= 0) return false;
      items.push({ ...inst, qty: left });
    }
  } else {
    if (!isMaterial(def.id) && freeSlots(state) <= 0) return false;
    items.push(inst);
  }
  if (!silent) bus.emit('item:picked', { uid: inst.uid, def: inst.def, qty: inst.qty });
  return true;
}

export function giveItem(state: GameState, id: ItemId, qty = 1, opts: CreateOpts = {}): ItemInstance | null {
  const def = Registry.tryGet('item', id);
  if (!def) { console.warn(`[inventory] unknown item ${id}`); return null; }
  const inst = createItem(def, { ...opts, qty });
  if (isStackable(def)) inst.qty = qty;
  return addInstance(state, inst) ? inst : null;
}

/** Remove qty of a def (stackables) or one instance by uid. */
export function removeItem(state: GameState, def: ItemId, qty = 1): boolean {
  if (countItem(state, def) < qty) return false;
  const inv = state.player.inventory;
  for (const it of [...inv.items]) {
    if (it.def !== def || qty <= 0) continue;
    const take = Math.min(it.qty, qty);
    it.qty -= take;
    qty -= take;
    if (it.qty <= 0) { unequipUid(state, it.uid); inv.items.splice(inv.items.indexOf(it), 1); }
  }
  return true;
}

export function removeUid(state: GameState, uid: string): ItemInstance | null {
  const inv = state.player.inventory;
  const i = inv.items.findIndex((x) => x.uid === uid);
  if (i < 0) return null;
  unequipUid(state, uid);
  return inv.items.splice(i, 1)[0];
}

/** Which equipment slot a def goes in (rings: first free ring). */
export function slotFor(state: GameState, def: ItemDef): EquipSlot | null {
  if (def.slot === 'ring') {
    return state.player.equipment.worn.ring1 ? (state.player.equipment.worn.ring2 ? 'ring1' : 'ring2') : 'ring1';
  }
  if (def.slot) return def.slot;
  if (def.itemKind === 'weapon') return 'mainHand';
  if (def.itemKind === 'offhand') return 'offHand';
  return null;
}

export function meetsRequirements(state: GameState, def: ItemDef): boolean {
  const req = def.requirements;
  if (!req) return true;
  const pr = state.player.progression;
  if (req.level && pr.level < req.level) return false;
  for (const [k, v] of Object.entries(req)) {
    if (k === 'level' || v === undefined) continue;
    if ((pr.attributes[k as keyof typeof pr.attributes] ?? 0) < v) return false;
  }
  return true;
}

export function equip(state: GameState, uid: string, slotOverride?: EquipSlot, loadout?: 0 | 1): boolean {
  const inst = state.player.inventory.items.find((i) => i.uid === uid);
  const def = inst && Registry.tryGet('item', inst.def);
  if (!inst || !def) return false;
  const slot = slotOverride ?? slotFor(state, def);
  if (!slot) return false;
  unequipUid(state, uid);
  const e = state.player.equipment;
  if (slot === 'mainHand' || slot === 'offHand') {
    const lo = e.loadouts[loadout ?? e.activeLoadout];
    // two-handed main hand clears the off-hand (quivers are allowed with bows)
    if (slot === 'mainHand' && def.weapon?.hands === 2 && lo.offHand) {
      const off = state.player.inventory.items.find((i) => i.uid === lo.offHand);
      const offDef = off && Registry.tryGet('item', off.def);
      if (offDef?.offhand?.family !== 'quiver') lo.offHand = undefined;
    }
    if (slot === 'offHand' && lo.mainHand) {
      const main = state.player.inventory.items.find((i) => i.uid === lo.mainHand);
      const mainDef = main && Registry.tryGet('item', main.def);
      if (mainDef?.weapon?.hands === 2 && def.offhand?.family !== 'quiver') lo.mainHand = undefined;
    }
    lo[slot] = uid;
  } else {
    e.worn[slot] = uid;
  }
  bus.emit('item:equipped', { uid, slot });
  bus.emit('stats:changed', {});
  return true;
}

export function unequipUid(state: GameState, uid: string): void {
  const e = state.player.equipment;
  let changed = false;
  for (const lo of e.loadouts) {
    if (lo.mainHand === uid) { lo.mainHand = undefined; changed = true; bus.emit('item:unequipped', { uid, slot: 'mainHand' }); }
    if (lo.offHand === uid) { lo.offHand = undefined; changed = true; bus.emit('item:unequipped', { uid, slot: 'offHand' }); }
  }
  for (const [slot, v] of Object.entries(e.worn)) {
    if (v === uid) { delete e.worn[slot as WornSlot]; changed = true; bus.emit('item:unequipped', { uid, slot }); }
  }
  if (changed) bus.emit('stats:changed', {});
}

export function unequipSlot(state: GameState, slot: EquipSlot): void {
  const e = state.player.equipment;
  const uid = slot === 'mainHand' || slot === 'offHand' ? e.loadouts[e.activeLoadout][slot] : e.worn[slot];
  if (!uid) return;
  if (freeSlots(state) <= 0) return; // nowhere to put it
  unequipUid(state, uid);
}
