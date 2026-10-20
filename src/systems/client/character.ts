/**
 * The local player's character on this client (Claude 3). Lives in Game.state.character (GameState v2 slice),
 * is sent to the authority as `loadout`, and is kept in sync with authority grants:
 *  - solo / host: the sim mutates this same object (LocalNet hands over the reference), so nothing to apply
 *  - guest: loot:granted / item:used / player:levelup for our playerId are applied here
 * Equip, learn, bind and reset happen here, then the loadout is re-sent.
 */
import { Game } from '@/core/GameState';
import { bus } from '@/core/EventBus';
import { Services } from '@/core/services';
import { Settings } from '@/core/settings';
import { newCharacter, availablePoints } from '@/systems/rules/character';
import { resetCost, xpToNext } from '@/systems/rules/curves';
import { itemInfo, slotsFor, TWO_HANDED } from '@/systems/rules/gear';
import { canLearn, resetBranch } from '@/systems/rules/tree';
import type { CharacterSave, GearSlot, TreeBranch } from '@/systems/rules/types';
import { kitFor } from '@/data/classes/hc/kits';

type WithChar = { character?: CharacterSave };
const listeners = new Set<() => void>();

export function character(): CharacterSave {
  const st = Game.state as unknown as WithChar;
  const dev = import.meta.env.DEV && typeof location !== 'undefined' ? new URLSearchParams(location.search).get('hc_class') : null;
  const classId = dev ?? Game.state.player.hero?.classId ?? Game.state.player.progression.classId?.replace(/^class:/, '') ?? 'warden';
  if (!st.character || st.character.classId !== classId) st.character = newCharacter(classId, Game.state.player.hero?.look.body ?? 0);
  return st.character;
}

/** Re-render hooks for UI (inventory, tree, hotbar). */
export function onCharacterChanged(fn: () => void): () => void { listeners.add(fn); return () => listeners.delete(fn); }
export function changed(): void { listeners.forEach((f) => f()); }

export function sendLoadout(): void {
  // the hero look rides along so every client can bake the same paperdoll (not part of the save slice)
  const c = character() as CharacterSave & { look?: unknown; prefs?: { autoLootGold: boolean } };
  c.look = Game.state.player.hero?.look;
  // device preferences the authority must honour for this player (Settings, Claude 1)
  c.prefs = { autoLootGold: Settings.get().autoLootGold };
  Services.tryGet('net')?.send({ type: 'loadout', data: c as unknown as Record<string, unknown> });
  changed();
}

/** Guests apply authority grants for themselves; authorities already share the object. Call once at boot. */
export function installCharacterSync(): () => void {
  const mine = (pid?: string) => pid === Services.tryGet('net')?.localPlayer;
  const guest = () => !(Services.tryGet('net')?.isAuthority() ?? true);
  const offs = [
    bus.on('loot:granted', (e) => {
      if (!mine(e.playerId)) return;
      if (guest()) {
        const c = character();
        if (e.gold) c.gold = Math.max(0, c.gold + e.gold);
        if (e.xp) { c.xp += e.xp; while (c.xp >= xpToNext(c.level) && c.level < 40) { c.xp -= xpToNext(c.level); c.level++; } }
        // a piece the runeforge changed comes back with its own uid: replace it where it is (pack or worn)
        const same = e.instance && !e.item ? [...c.inventory, ...Object.values(c.equipment)].find((x) => x?.uid === e.instance!.uid) : undefined;
        if (same) Object.assign(same, { ilvl: e.instance!.ilvl, gem: e.instance!.gem });
        else if (e.instance) {
          const stack = itemInfo(e.instance.base)?.stackable ? c.inventory.find((x) => x.base === e.instance!.base) : undefined;
          if (stack) stack.qty += e.instance.qty; else c.inventory.push({ ...e.instance });
        }
      }
      changed();
    }),
    bus.on('item:used', (e) => {
      if (!mine(e.playerId)) return;
      const c = character();
      if (guest()) {
        const it = c.inventory.find((x) => x.uid === e.uid);
        if (it && --it.qty <= 0) c.inventory.splice(c.inventory.indexOf(it), 1);
        if ((e.def as string) === 'i_tome') c.bonusPoints++;
      }
      changed();
    }),
    // world chests: guests keep their own record so the next session can not open them again
    bus.on('chest:opened', (e) => {
      if (!mine(e.playerId)) return;
      const c = character() as ReturnType<typeof character> & { chests?: string[] };
      if (guest() && !(c.chests ??= []).includes(e.objectId)) c.chests.push(e.objectId);
      changed();
    }),
    bus.on('player:levelup', (e) => { if (mine(e.playerId)) changed(); }),
    bus.on('settings:changed', (e) => { if (e.key === 'autoLootGold' || e.key === 'all') sendLoadout(); }),
    bus.on('quest:reward', (e) => {
      if (e.playerId && !mine(e.playerId)) return;
      if (guest() && e.skillPoints) character().bonusPoints += e.skillPoints;
      changed();
    }),
  ];
  return () => offs.forEach((f) => f());
}

// ───────────── actions (client-owned inventory) ─────────────
export function equip(uid: string, slot?: GearSlot): string | null {
  const c = character(), it = c.inventory.find((x) => x.uid === uid);
  if (!it) return 'Not in your pack.';
  const info = itemInfo(it.base);
  if (!info) return 'Unknown item.';
  const slots = slotsFor(info);
  if (!slots.length) return 'That cannot be equipped.';
  const kit = kitFor(c.classId);
  if (info.weaponType && !kit.weapons.includes(info.weaponType)) return `Your class cannot wield a ${info.weaponType}.`;
  const target = slot && slots.includes(slot) ? slot : slots.find((s) => !c.equipment[s]) ?? slots[0];
  if (target === 'off') {
    const main = c.equipment.main && itemInfo(c.equipment.main.base);
    if (main?.weaponType && TWO_HANDED.includes(main.weaponType)) return 'Your main hand needs both hands.';
  }
  if (target === 'main' && info.weaponType && TWO_HANDED.includes(info.weaponType) && c.equipment.off) unequip('off');
  const prev = c.equipment[target];
  c.inventory.splice(c.inventory.indexOf(it), 1);
  if (prev) c.inventory.push(prev);
  c.equipment[target] = it;
  bus.emit('item:equipped', { uid, slot: target, playerId: Services.tryGet('net')?.localPlayer });
  sendLoadout();
  return null;
}

export function unequip(slot: GearSlot): string | null {
  const c = character(), it = c.equipment[slot];
  if (!it) return null;
  if (c.inventory.length >= 66 + 30) return 'Your pack is full.';
  delete c.equipment[slot];
  c.inventory.push(it);
  bus.emit('item:unequipped', { uid: it.uid, slot, playerId: Services.tryGet('net')?.localPlayer });
  sendLoadout();
  return null;
}

/** Use from the pack (authority validates and consumes). */
export function useItem(uid: string): void {
  Services.tryGet('net')?.send({ type: 'act', domain: 'systems', action: 'useItem', args: { uid } });
}

export function learn(nodeId: string): string | null {
  const c = character();
  const chk = canLearn(c.classId, nodeId, c.tree, availablePoints(c));
  if (!chk.ok) return chk.why;
  c.tree[nodeId] = (c.tree[nodeId] ?? 0) + 1;
  sendLoadout();
  return null;
}

/** Has the local character learned anything (beyond the free starting nodes) in this branch? */
export function branchHasRanks(branch: TreeBranch): boolean {
  const t = character().tree;
  return Object.keys(resetBranch(t, branch)).length < Object.keys(t).length;
}

export function resetTree(branch: TreeBranch): string | null {
  const c = character(), cost = resetCost(c.level);
  // nothing learned in this branch: never charge for an empty reset
  if (!branchHasRanks(branch)) return 'Nothing to reset in this branch.';
  if (c.gold < cost) return `Resetting costs ${cost} Embershards.`;
  c.gold -= cost;
  c.tree = resetBranch(c.tree, branch);
  c.hotbar = c.hotbar.map((id) => id) as CharacterSave['hotbar'];
  sendLoadout();
  return null;
}

export function bindSpell(slot: 0 | 1 | 2 | 3, spellId: string | null): void {
  const c = character();
  const i = c.hotbar.indexOf(spellId);
  if (spellId && i >= 0) c.hotbar[i] = c.hotbar[slot];
  c.hotbar[slot] = spellId;
  sendLoadout();
}

export { availablePoints };
