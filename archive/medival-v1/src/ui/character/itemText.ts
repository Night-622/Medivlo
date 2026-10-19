/** Item tooltip content (Design System tooltip: rarity accent border, coloured lines). */
import { Registry } from '@/core';
import type { GameState, ItemInstance } from '@/core';
import { rarity as RARITY } from '@/ui/kit';
import { describeEffect, describeModifier } from '@/systems/describe';
import { meetsRequirements } from '@/systems/items/Inventory';
import { P as PCURVE, UPGRADE_PER_LEVEL, armorLevelMult } from '@/systems/balance';
import type { TipBlock, TipLine } from './CharacterPanels';
import { C, rarityCssOf } from './px';

export function itemTip(state: GameState, inst: ItemInstance, label?: string): TipBlock {
  const def = Registry.tryGet('item', inst.def);
  const r = RARITY[inst.rarity];
  if (!def) return { lines: [{ text: inst.def }], accent: r.border, label };
  const L: TipLine[] = [];
  const up = inst.upgrade ? ` +${inst.upgrade}` : '';
  L.push({ text: `${def.name}${up}${inst.qty > 1 ? ` ×${inst.qty}` : ''}`, color: rarityCssOf(inst.rarity), size: 'title' });
  const kind = def.weapon ? `${def.weapon.hands === 2 ? 'two-handed ' : ''}${def.weapon.family}` : def.offhand ? def.offhand.family
    : def.armor ? `${def.armor.weight} ${def.slot}` : def.slot ?? def.itemKind;
  L.push({ text: `${r.name} ${kind} · iLvl ${inst.itemLevel}`, color: C.text2 });
  L.push({ text: '', gap: true });
  const lvl = (PCURVE(inst.itemLevel) / PCURVE(def.itemLevel)) * (1 + UPGRADE_PER_LEVEL * inst.upgrade);
  if (def.weapon) {
    const w = def.weapon;
    for (const d of w.damage) L.push({ text: `${Math.round(d.min * lvl)}–${Math.round(d.max * lvl)} ${d.type}` });
    L.push({ text: `${w.attacksPerSec.toFixed(2)} attacks/s · poise ${w.poiseDamage}`, color: C.text2 });
    const sc = Object.entries(w.scaling).map(([a, g]) => `${a.slice(0, 3).toUpperCase()} ${g}`).join('  ');
    if (sc) L.push({ text: `Scaling ${sc}`, color: C.text2 });
    for (const [s, v] of Object.entries(w.buildup ?? {})) L.push({ text: `${v} ${s} buildup`, color: C.text2 });
  }
  if (def.offhand?.family === 'shield') L.push({ text: `Blocks ${def.offhand.blockPhysical ?? 0}% physical · stability ${def.offhand.stability ?? 0}` });
  if (def.armor) L.push({ text: `Armour ${Math.round(def.armor.armor * (1 + UPGRADE_PER_LEVEL * inst.upgrade) * armorLevelMult(inst.itemLevel, def.itemLevel))} · poise ${def.armor.poise} · weight ${def.armor.equipWeight}` });
  const mods = [...(def.implicit ?? []), ...(def.offhand?.modifiers ?? [])];
  for (const m of mods) L.push({ text: describeModifier(m), color: C.magic });
  for (const a of inst.affixes) {
    const ad = Registry.tryGet('affix', a.affix);
    if (ad) L.push({ text: describeModifier({ stat: ad.stat, op: ad.op, value: a.value }), color: C.magic });
  }
  for (const e of def.unique ?? []) L.push({ text: `★ ${describeEffect(e)}`, color: rarityCssOf('legendary') });
  if (def.consumable) {
    const c = def.consumable;
    if (c.restore?.mana) L.push({ text: `Restores ${c.restore.mana} Ember`, color: C.magic });
    if (c.restore?.stamina) L.push({ text: 'Restores stamina', color: C.magic });
    if (c.heal?.pct) L.push({ text: `Heals ${Math.round(c.heal.pct * 100)}% HP${c.heal.overMs ? ` over ${c.heal.overMs / 1000} s` : ''}`, color: C.magic });
    for (const e of c.effects) L.push({ text: describeEffect(e), color: C.magic });
  }
  if (def.teaches) L.push({ text: `Teaches ${Registry.tryGet('spell', def.teaches)?.name ?? def.teaches}`, color: C.goldHi });
  if (def.requirements) {
    const req = Object.entries(def.requirements).map(([k, v]) => `${k} ${v}`).join(', ');
    L.push({ text: `Requires ${req}`, color: meetsRequirements(state, def) ? C.text2 : C.bad });
  }
  L.push({ text: '', gap: true });
  L.push({ text: def.flavor ?? def.description, color: C.text2 });
  L.push({ text: `${def.value} gold`, color: C.muted, size: 'micro' });
  return { lines: L, accent: r.border, label };
}
