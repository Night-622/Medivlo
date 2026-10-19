/**
 * Gather every EffectDef that applies to the player from GameState:
 * class resource, traits, ancestry, equipment (implicit, affixes, uniques, sets), skill-tree nodes.
 */
import { Registry } from '@/core';
import type {
  ArmorWeight, ClassDef, EffectDef, EquipSlot, GameState, ItemDef, ItemInstance, SpellId, StatModifier, WeaponFamily,
} from '@/core';
import { OFF_PROFICIENCY_DAMAGE, OFF_PROFICIENCY_WEIGHT, UPGRADE_PER_LEVEL, armorLevelMult } from '../balance';

export type ProcEffect = Extract<EffectDef, { kind: 'applyStatus' } | { kind: 'hook' }>;

export interface EquippedItem { inst: ItemInstance; def: ItemDef }

export interface Collected {
  mods: StatModifier[];
  procs: ProcEffect[];
  grants: SpellId[];
  dialogueTags: string[];
  weapon: EquippedItem | null;
  offhand: EquippedItem | null;
  worn: EquippedItem[];
  wornWeight: number;
  armorWeight: ArmorWeight | null;
  proficientWeapons: Set<WeaponFamily>;
  proficientArmor: Set<ArmorWeight>;
}

export function itemByUid(state: GameState, uid: string | undefined): EquippedItem | null {
  if (!uid) return null;
  const inst = state.player.inventory.items.find((i) => i.uid === uid);
  if (!inst) return null;
  const def = Registry.tryGet('item', inst.def);
  return def ? { inst, def } : null;
}

export function classOf(state: GameState): ClassDef | undefined {
  const id = state.player.progression.classId;
  return id ? Registry.tryGet('class', id) : undefined;
}

function pushEffects(out: Collected, effects: readonly EffectDef[] | undefined, scale = 1): void {
  if (!effects) return;
  for (const e of effects) {
    switch (e.kind) {
      case 'modifier': out.mods.push(scale === 1 ? e.mod : { ...e.mod, value: e.mod.value * scale }); break;
      case 'applyStatus': case 'hook': out.procs.push(e); break;
      case 'grantAbility': out.grants.push(e.spell); break;
      case 'dialogueTag': out.dialogueTags.push(e.tag); break;
      case 'proficiency':
        if (e.weapon) out.proficientWeapons.add(e.weapon);
        if (e.armor) out.proficientArmor.add(e.armor);
        break;
    }
  }
}

const WEIGHT_ORDER: ArmorWeight[] = ['light', 'medium', 'heavy'];

export function collectPlayerEffects(state: GameState): Collected {
  const p = state.player;
  const cls = classOf(state);
  const out: Collected = {
    mods: [], procs: [], grants: [], dialogueTags: [], weapon: null, offhand: null, worn: [], wornWeight: 0, armorWeight: null,
    proficientWeapons: new Set(cls?.proficiencies.weapons ?? []), proficientArmor: new Set(cls?.proficiencies.armor ?? []),
  };

  // class resource passives (e.g. Resolve → damage reduction per point)
  for (const m of cls?.resource.perPoint ?? []) out.mods.push({ ...m, value: m.value * p.resource });

  // traits + ancestry
  const traitIds = [...p.progression.traits, ...(p.ancestry ? [p.ancestry] : [])];
  for (const id of traitIds) {
    const t = Registry.tryGet('trait', id);
    if (!t) continue;
    pushEffects(out, t.boons);
    pushEffects(out, t.drawbacks);
  }

  // skill trees
  for (const [treeId, nodes] of Object.entries(p.progression.tree)) {
    const tree = Registry.tryGet('skilltree', treeId);
    if (!tree) continue;
    for (const [nodeId, rank] of Object.entries(nodes)) {
      const node = tree.nodes.find((n) => n.id === nodeId);
      if (node && rank > 0) pushEffects(out, node.effects, rank);
    }
  }

  // equipment
  const lo = p.equipment.loadouts[p.equipment.activeLoadout];
  out.weapon = itemByUid(state, lo.mainHand);
  out.offhand = itemByUid(state, lo.offHand);
  for (const uid of Object.values(p.equipment.worn)) {
    const it = itemByUid(state, uid);
    if (it) out.worn.push(it);
  }
  const setCounts = new Map<string, number>();
  const equipped = [out.weapon, out.offhand, ...out.worn].filter((x): x is EquippedItem => !!x);
  let heaviest = -1;
  for (const { inst, def } of equipped) {
    const up = 1 + UPGRADE_PER_LEVEL * inst.upgrade;
    for (const m of def.implicit ?? []) out.mods.push(m);
    pushEffects(out, def.unique);
    for (const a of inst.affixes) {
      const ad = Registry.tryGet('affix', a.affix);
      if (ad) out.mods.push({ stat: ad.stat, op: ad.op, value: a.value });
    }
    if (def.armor) {
      const prof = out.proficientArmor.has(def.armor.weight);
      out.mods.push({ stat: 'armor', op: 'flat', value: def.armor.armor * up * armorLevelMult(inst.itemLevel, def.itemLevel) });
      out.mods.push({ stat: 'poise', op: 'flat', value: def.armor.poise });
      for (const [t, v] of Object.entries(def.armor.resist ?? {})) out.mods.push({ stat: `resist.${t}` as StatModifier['stat'], op: 'flat', value: v });
      out.wornWeight += def.armor.equipWeight * (prof ? 1 : 1 + OFF_PROFICIENCY_WEIGHT);
      const w = WEIGHT_ORDER.indexOf(def.armor.weight);
      if (w > heaviest) heaviest = w;
    }
    if (def.offhand) {
      for (const m of def.offhand.modifiers ?? []) out.mods.push(m);
    }
    if (def.set) setCounts.set(def.set, (setCounts.get(def.set) ?? 0) + 1);
  }
  out.armorWeight = heaviest >= 0 ? WEIGHT_ORDER[heaviest] : null;

  for (const [setId, count] of setCounts) {
    const set = Registry.tryGet('set', setId);
    for (const b of set?.bonuses ?? []) if (count >= b.pieces) pushEffects(out, b.effects);
  }

  // proficiency penalty (§3)
  const wf = out.weapon?.def.weapon?.family;
  if (wf && !out.proficientWeapons.has(wf)) out.mods.push({ stat: 'damageDealt', op: 'increased', value: OFF_PROFICIENCY_DAMAGE });

  return out;
}

export function equippedInSlot(state: GameState, slot: EquipSlot): EquippedItem | null {
  const e = state.player.equipment;
  if (slot === 'mainHand' || slot === 'offHand') return itemByUid(state, e.loadouts[e.activeLoadout][slot]);
  return itemByUid(state, e.worn[slot]);
}
