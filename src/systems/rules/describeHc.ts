/** Human-readable text for Hollow Crown stats, modifiers and items (Claude 3). Pure. */
import { SCHOOL_NAME } from '@/data/classes/hc';
import { HC_WEAPON_TYPES } from '@/data/items/hc/weapons.gen';
import { armourPiece, armourSet, gemsOf, hasHybrid, hybridFor, hybridSchools, itemInfo, itemMods, itemWeaponDamage, legendary, setProgress, upgradeOf, weaponBase, GEMS } from './gear';
import { affixDef, affixPassive, itemRarity, socketCount } from './affixes';
import { uniqueDef } from './uniques';
import { affixLabel, displayName, flavourOf } from './buildText';
import { spellDef } from './spells';
import { HC_ITEM_FLAVOUR } from '@/data/lore/hc-item-flavour';
import { campaignItem } from '@/data/items/hc/campaign-items';
import type { ItemInstance, Modifier, SchoolId, StatKey } from './types';

const LABEL: Partial<Record<string, string>> = {
  hp: 'Max health', ember: 'Max Ember', stamina: 'Max stamina', emberRegen: 'Ember regen /s', hpRegen: 'Health regen /s', staminaRegen: 'Stamina regen /s',
  armor: 'Armour', sp: 'Spell power', power: 'Weapon power', crit: 'Crit chance', critd: 'Crit damage', moveSpeed: 'Move speed', atkSpeed: 'Attack speed',
  cdr: 'Cooldown reduction', emberCost: 'Ember cost', dmg: 'Damage', spellDmg: 'Spell damage', attackDmg: 'Attack damage', healing: 'Healing done',
  healingTaken: 'Healing received', lifesteal: 'Life steal', block: 'Block chance', dmgTaken: 'Damage taken', statusDur: 'Effect duration',
  buffDur: 'Buff duration', buffPower: 'Buff strength', slowPower: 'Slow strength', chains: 'Chain targets', xp: 'XP gained', gold: 'Embershards found',
  itemFind: 'Rarer loot', bag: 'Bag slots', potionHeal: 'Potion healing', dashCharges: 'Dash charges', lootRange: 'Loot pickup range',
  maxMomentum: 'Max Momentum', ultCdr: 'Ultimate cooldown', stunTaken: 'Stun duration',
};
const PCT = new Set(['crit', 'critd', 'moveSpeed', 'atkSpeed', 'cdr', 'emberCost', 'dmg', 'spellDmg', 'attackDmg', 'healing', 'healingTaken', 'lifesteal', 'block',
  'dmgTaken', 'statusDur', 'buffDur', 'buffPower', 'slowPower', 'xp', 'gold', 'itemFind', 'potionHeal', 'ultCdr', 'stunTaken', 'power']);

export function statLabel(k: StatKey | string): string {
  if (LABEL[k]) return LABEL[k]!;
  const [g, s] = k.split('.');
  const name = SCHOOL_NAME[s as SchoolId] ?? (s === 'physical' ? 'Physical' : s);
  if (g === 'dmg') return `${name} damage`;
  if (g === 'resist') return `${name} resistance`;
  return k;
}
export const isPct = (k: string): boolean => PCT.has(k) || k.startsWith('dmg.') || k.startsWith('resist.');

export function fmtStat(k: string, v: number): string {
  if (isPct(k)) return `${Math.round(v * 1000) / 10}%`;
  return Math.abs(v) >= 10 ? String(Math.round(v)) : String(Math.round(v * 10) / 10);
}

export function modText(m: Modifier): string {
  const sign = m.value >= 0 ? '+' : '−';
  const v = Math.abs(m.value);
  const amount = m.op === 'flat' && !isPct(m.stat) ? (v >= 10 ? Math.round(v) : Math.round(v * 10) / 10) : `${Math.round(v * 1000) / 10}%`;
  return `${sign}${amount}${m.op === 'more' ? ' more' : ''} ${statLabel(m.stat)}`;
}

export const rarityLabel = (r: string): string =>
  ({ common: 'Common', fine: 'Fine', ember: 'Ember-touched', runed: 'Runed', wrought: 'Wrought', spark: 'Sparkforged' } as Record<string, string>)[r] ?? r;

export interface TipLine { text: string; color?: 'gold' | 'good' | 'dim' | 'danger' | 'rarity' | 'school'; size?: 'h' | 'b' | 's' }

/** Tooltip lines for an item (equipped set progress is evaluated against `equipped`). */
export function itemTooltip(it: ItemInstance, equipped: ItemInstance[], classSchool: SchoolId, classWeapons: string[]): TipLine[] {
  const info = itemInfo(it.base);
  if (!info) return [{ text: it.base }];
  const up = upgradeOf(it), rar = itemRarity(it);
  const out: TipLine[] = [{ text: affixedName(it, info.name) + (up ? ` +${up}` : '') + (it.qty > 1 ? ` ×${it.qty}` : ''), color: 'rarity', size: 'h' }];
  const kind = info.weaponType ? HC_WEAPON_TYPES.includes(info.weaponType) ? cap(info.weaponType) : 'Weapon' : info.slot ? cap(info.slot) : cap(info.kind);
  out.push({ text: `${kind} · ${rarityLabel(rar)}${info.slot ? ` · Item level ${it.ilvl}` : ''}`, color: 'dim', size: 's' });
  if (info.weaponType) {
    const [a, b] = itemWeaponDamage(it);
    out.push({ text: `Damage ${a}–${b}`, size: 'b' });
    if (!classWeapons.includes(info.weaponType)) out.push({ text: `Your class cannot wield a ${info.weaponType}.`, color: 'danger', size: 's' });
  }
  for (const m of itemMods(it)) out.push({ text: modText(m), color: 'good', size: 's' });
  out.push(...affixLines(it));
  const uq = uniqueDef(it.base);
  if (uq) out.push({ text: uq.text, color: 'gold', size: 's' });
  const moved = it.uniqueFx ? uniqueDef(it.uniqueFx) ?? legendary(it.uniqueFx) : undefined;
  if (moved) out.push({ text: `Bound effect: ${'text' in moved ? moved.text : moved.fx}`, color: 'gold', size: 's' });
  if (it.imbue) out.push({ text: `Imbued: ${SCHOOL_NAME[it.imbue]} (half of its attacks deal ${SCHOOL_NAME[it.imbue]} damage)`, color: 'school', size: 's' });
  const lg = legendary(it.base);
  if (lg && !uq) out.push({ text: lg.fx, color: 'gold', size: 's' }); // a bespoke effect replaced the generic one
  const piece = armourPiece(it.base);
  if (piece) {
    const set = armourSet(piece.set)!;
    const count = setProgress(equipped).find((s) => s.set.id === set.id)?.count ?? 0;
    out.push({ text: `${set.name} (${count}/4)`, color: 'gold', size: 'b' });
    out.push({ text: `2: ${set.twoPiece}`, color: count >= 2 ? 'good' : 'dim', size: 's' });
    out.push({ text: `4: ${set.ability.name}. ${set.ability.desc}`, color: count >= 4 ? 'good' : 'dim', size: 's' });
    out.push({ text: `Attuned (${SCHOOL_NAME[set.school]}): ${set.attuned}`, color: count >= 4 && set.school === classSchool ? 'school' : 'dim', size: 's' });
    const hs = hybridSchools(equipped), hy = hs ? hybridFor(hs[0], hs[1]) : undefined;
    out.push(hy && count >= 2 && count < 4
      ? { text: `Hybrid: ${displayName('hybrid', hy.schools.join('+'), hy.name)}. ${hy.text}`, color: 'good', size: 's' }
      : { text: 'Hybrid: 2 of this set + 2 of another school’s set: a two-school bonus.', color: count >= 2 && count < 4 && hasHybrid(equipped) ? 'good' : 'dim', size: 's' });
  }
  const gems = gemsOf(it), sockets = socketCount(it);
  for (const g of gems) out.push({ text: `Socket: ${itemInfo(g)?.name} (${GEMS[g].label})`, color: 'good', size: 's' });
  for (let i = gems.length; i < sockets; i++) out.push({ text: 'Empty socket', color: 'dim', size: 's' });

  if (info.desc && !lg && !info.slot) out.push({ text: info.desc, size: 's' });
  // in-world flavour (Claude 4) wins over the handoff line: legendaries by id, armour by set, weapons by base
  const wb = weaponBase(it.base);
  const story = campaignItem(it.base);
  const flavour = (story && story.kind !== 'relic' ? story.desc : undefined) ?? flavourOf('unique', it.base) ?? flavourOf('item', it.base) ?? HC_ITEM_FLAVOUR[it.base] ?? (piece ? HC_ITEM_FLAVOUR[piece.set] : undefined) ?? (wb && !lg ? HC_ITEM_FLAVOUR[wb.id] : undefined);
  if (flavour) out.push({ text: flavour, color: 'dim', size: 's' });
  else if (lg) out.push({ text: lg.lore, color: 'dim', size: 's' });
  else if (piece) out.push({ text: armourSet(piece.set)!.lore, color: 'dim', size: 's' });
  out.push({ text: info.questItem ? 'Quest item' : `Sells for ${Math.max(1, Math.round(info.value / 4))} Embershards`, color: 'dim', size: 's' });
  return out;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Compared with what you wear" lines for a pack item: weapon damage and every stat that changes. */
export function compareLines(it: ItemInstance, worn: ItemInstance | undefined): TipLine[] {
  const info = itemInfo(it.base);
  if (!info?.slot) return [];
  if (!worn) return [{ text: 'Empty slot: a straight upgrade', color: 'good', size: 's' }];
  const out: TipLine[] = [{ text: `Compared with ${itemInfo(worn.base)?.name ?? 'worn'}:`, color: 'dim', size: 's' }];
  if (info.weaponType) {
    const [a, b] = itemWeaponDamage(it), [c, d] = itemWeaponDamage(worn);
    const delta = Math.round((a + b) / 2 - (c + d) / 2);
    if (delta) out.push({ text: `${delta > 0 ? '▲ +' : '▼ '}${delta} average damage`, color: delta > 0 ? 'good' : 'danger', size: 's' });
  }
  const sum = flatStats;
  const mine = sum(it), theirs = sum(worn);
  for (const k of new Set([...Object.keys(mine), ...Object.keys(theirs)])) {
    const dv = (mine[k] ?? 0) - (theirs[k] ?? 0);
    if (Math.abs(dv) < (isPct(k) ? 0.001 : 0.5)) continue;
    out.push({ text: `${dv > 0 ? '▲ +' : '▼ −'}${fmtStat(k, Math.abs(dv))} ${statLabel(k)}`, color: dv > 0 ? 'good' : 'danger', size: 's' });
  }
  if (out.length === 1) out.push({ text: 'About the same', color: 'dim', size: 's' });
  return out;
}

/** One line per rolled affix: its compiled value at this item level (and upgrade), prefixes first. */
export function affixLines(it: ItemInstance): TipLine[] {
  const out: TipLine[] = [];
  const list = [...(it.affixes ?? [])].sort((a, b) => (affixDef(a.id)?.kind === 'prefix' ? 0 : 1) - (affixDef(b.id)?.kind === 'prefix' ? 0 : 1));
  for (const r of list) {
    const d = affixDef(r.id), p = affixPassive(r, it.ilvl, it.upgrade ?? 0);
    if (!d || !p) continue;
    let text: string;
    if (p.mods?.length) text = p.mods.map(modText).join(', ') + (p.mods[0].when ? ` (${d.text.replace(/.*\(|\).*/g, '') || 'conditional'})` : '');
    else if (p.spellLevels?.length) { const l = p.spellLevels[0]; text = `+${l.levels} to ${l.spell.startsWith('school:') ? `all ${SCHOOL_NAME[l.spell.slice(7) as SchoolId]} spells` : spellDef(l.spell)?.name ?? l.spell}`; }
    else text = `${d.text.replace('{v}', String(Math.round(r.v * 100)))}${'proc' in d.effect ? ` (power ×${r.v.toFixed(2)})` : ''}`;
    out.push({ text, color: d.kind === 'prefix' ? 'good' : 'school', size: 's' });
  }
  return out;
}

/** Flat, unconditional stats an item gives (base, upgrade, gems and affixes): for "compared with worn". */
function flatStats(x: ItemInstance): Record<string, number> {
  const m: Record<string, number> = {};
  const mods = [...itemMods(x), ...(x.affixes ?? []).flatMap((r) => affixPassive(r, x.ilvl, x.upgrade ?? 0)?.mods ?? [])];
  for (const mod of mods) if (mod.op === 'flat' && !mod.when) m[mod.stat] = (m[mod.stat] ?? 0) + mod.value;
  return m;
}

/** "<prefix label> <name> <suffix label>" from the rolled affixes' words (Claude 4's overlay). */
export function affixedName(it: ItemInstance, name: string): string {
  let pre = '', suf = '';
  for (const r of it.affixes ?? []) {
    const d = affixDef(r.id), label = affixLabel(r.id);
    if (!d || !label) continue;
    if (d.kind === 'prefix' && !pre) pre = label;
    if (d.kind === 'suffix' && !suf) suf = label;
  }
  return [pre, name, suf].filter(Boolean).join(' ');
}
