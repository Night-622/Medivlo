/**
 * New-character setup (called by Claude 1's CharacterCreate before entering the world).
 */
import { Registry, bus } from '@/core';
import type { ClassId, GameState, SpellId, TraitId } from '@/core';
import { createItem } from '../items/ItemRoller';
import { addInstance, equip } from '../items/Inventory';
import { computePlayerStats } from '../stats/playerStats';

export const ASHMARK: SpellId = 'spell:ashmark';

export interface InitCharacterOpts { classId: ClassId; traits: TraitId[]; ancestry: TraitId | null }

export function learnSpell(state: GameState, spellId: SpellId, slot = true): void {
  const sb = state.player.spellbook;
  if (!sb.known[spellId]) sb.known[spellId] = { rank: 1, mastery: 0, choices: [], glyphs: [] };
  if (slot && !sb.slots.includes(spellId)) {
    const free = sb.slots.indexOf(null);
    if (free >= 0) sb.slots[free] = spellId;
  }
  bus.emit('spell:learned', { spellId });
}

export function initCharacter(state: GameState, opts: InitCharacterOpts): void {
  const cls = Registry.get('class', opts.classId);
  const p = state.player;
  const pr = p.progression;
  pr.classId = cls.id;
  pr.level = 1;
  pr.xp = 0;
  pr.attributes = { ...cls.baseAttributes };
  pr.traits = [...opts.traits];
  pr.tree = {};
  pr.unspentAttributePoints = 0;
  pr.unspentSkillPoints = 0;
  p.ancestry = opts.ancestry;
  p.resource = 0;
  p.inventory.items = [];
  p.equipment = { loadouts: [{}, {}], activeLoadout: 0, worn: {}, quickslots: [null, null] };
  p.spellbook = { known: {}, slots: [null, null, null, null] };

  const noble = pr.traits.includes('trait:noble-born');
  for (const s of cls.startingItems) {
    const def = Registry.tryGet('item', s.item);
    if (!def) { console.warn(`[character] missing starting item ${s.item}`); continue; }
    const inst = createItem(def, { qty: s.qty ?? 1, rarity: noble && def.itemKind !== 'consumable' ? 'uncommon' : undefined });
    addInstance(state, inst, true);
    if (s.equip) equip(state, inst.uid, undefined, s.loadout ?? 0);
  }
  for (const id of cls.startingAbilities) learnSpell(state, id);
  if (Registry.tryGet('spell', ASHMARK)) learnSpell(state, ASHMARK);

  p.inventory.gold = noble ? 230 : 30;
  const ps = computePlayerStats(state);
  p.inventory.draught = { charges: ps.derived.draughtCharges, maxCharges: ps.derived.draughtCharges, potency: 1 };
  p.hp = ps.derived.maxHp;
  p.mana = ps.derived.maxMana;
  p.stamina = ps.derived.maxStamina;
  bus.emit('stats:changed', {});
}
