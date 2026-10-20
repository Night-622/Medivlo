/**
 * Build simulator (Claude 3 helper): gear for a build. Level-legal kit weapons, armour sets (school × style),
 * trinkets and the consumables every build carries. Patterns copied from fight.ts / gauntlet.ts (not imported:
 * those files run their own checks at import).
 */
import { HC_PIECES } from '@/data/items/hc/armour.gen';
import { kitFor } from '@/data/classes/hc/kits';
import { unlockLevel } from '@/systems/rules/curves';
import { AMULET_IDS, RING_IDS, itemMods, weaponBase, weaponDamage } from '@/systems/rules/gear';
import { BASIC } from '@/systems/sim/player';
import type { CharacterSave, GearSlot, ItemInstance, SchoolId, WeaponType } from '@/systems/rules/types';

export const MATS = ['wood', 'iron', 'steel', 'ember', 'rime', 'storm', 'umbral', 'spark'] as const;
export const STYLES = ['cloth', 'leather', 'fur', 'mail', 'robe', 'scale', 'plate', 'vestment'] as const;
export const SCHOOLS: readonly SchoolId[] = ['ash', 'rime', 'storm', 'radiance', 'umbral', 'verdant', 'blade', 'iron', 'fist', 'hunt', 'guile', 'song'];
export const PIECES = ['helm', 'chest', 'hands', 'feet'] as const;

/** Highest material / style index unlocked at this level (curves.unlockLevel). */
export const tierAt = (level: number): number => Math.max(0, ...[0, 1, 2, 3, 4, 5, 6, 7].filter((i) => level >= unlockLevel(i)));
/** What a player who kept up carries (fight.ts): one tier behind the newest unlock. */
export const keptUpTier = (level: number): number => Math.max(0, tierAt(level) - 1);

/** Highest COMMON material / style index (wood, iron / cloth, leather) unlocked at this level. */
export const commonTier = (level: number): number => Math.min(1, tierAt(level));

export interface GearSpec {
  weapon: WeaponType;
  /** material index (0 wood … 7 spark) */
  mat: number;
  /** armour style index, or -1 for no armour */
  style: number;
  school: SchoolId;
  ring1?: string;
  ring2?: string;
  amulet?: string;
}

let uidSeq = 0;
const inst = (base: string, ilvl: number, qty = 1): ItemInstance => ({ uid: `b${(++uidSeq).toString(36)}`, base, ilvl, qty });

export const weaponId = (type: WeaponType, mat: number): string => `w_${type}_${MATS[Math.max(0, Math.min(7, mat))]}`;

/** Equip a gear spec on a save (replaces all equipment). */
export function equip(s: CharacterSave, g: GearSpec): void {
  const L = s.level;
  const eq: Partial<Record<GearSlot, ItemInstance>> = {};
  const wid = weaponId(g.weapon, g.mat);
  eq.main = inst(weaponBase(wid) ? wid : kitFor(s.classId).startWeapon, L);
  if (g.style >= 0) {
    for (const piece of PIECES) {
      const pc = HC_PIECES.find((p) => p.set === `${g.school}_${STYLES[g.style]}` && p.piece === piece);
      if (pc) eq[pc.slot] = inst(pc.id, L);
    }
  }
  if (g.ring1) eq.ring1 = inst(g.ring1, L);
  if (g.ring2) eq.ring2 = inst(g.ring2, L);
  if (g.amulet) eq.amulet = inst(g.amulet, L);
  s.equipment = eq;
}

/** Every build carries the same consumables: 5 small health draughts and 2 Ember tonics. */
export function stockConsumables(s: CharacterSave): void {
  s.inventory = s.inventory.filter((i) => !/^i_(hp|em)_/.test(i.base));
  s.inventory.push(inst('i_hp_s', 1, 5), inst('i_em_s', 1, 2));
}

/** Short text for a gear spec. */
export function gearText(g: GearSpec): string {
  const t = [`${MATS[g.mat]} ${g.weapon}`, g.style >= 0 ? `${g.school}_${STYLES[g.style]}×4` : 'no armour'];
  const tr = [g.ring1, g.ring2, g.amulet].filter(Boolean).map((x) => x!.replace(/^i_/, ''));
  if (tr.length) t.push(tr.join('+'));
  return t.join(', ');
}

/** Average weapon damage at this item level. */
export const weaponAvg = (type: WeaponType, mat: number, L: number): number => { const [a, b] = weaponDamage(weaponId(type, mat), L); return (a + b) / 2; };

/** Kit weapon with the best basic-attack DPS (avg damage / swing interval). */
export function fastestKitWeapon(cls: string, mat: number, L: number): WeaponType {
  const ws = kitFor(cls).weapons;
  return [...ws].sort((a, b) => weaponAvg(b, mat, L) / BASIC[b].interval - weaponAvg(a, mat, L) / BASIC[a].interval)[0];
}

/** Kit staff or wand with the higher average roll (spells add 25% of it), else the kit's first weapon. */
export function casterKitWeapon(cls: string, mat: number, L: number): WeaponType {
  const ws = kitFor(cls).weapons.filter((w) => w === 'staff' || w === 'wand');
  if (!ws.length) return kitFor(cls).weapons[0];
  return [...ws].sort((a, b) => weaponAvg(b, mat, L) - weaponAvg(a, mat, L))[0];
}

/** Total armour of a 4-piece set at this level. */
export function setArmour(school: SchoolId, style: number, L: number): number {
  let a = 0;
  for (const piece of PIECES) {
    const pc = HC_PIECES.find((p) => p.set === `${school}_${STYLES[style]}` && p.piece === piece);
    if (pc) for (const m of itemMods({ uid: 'x', base: pc.id, ilvl: L, qty: 1 })) if (m.stat === 'armor') a += m.value;
  }
  return a;
}

/** The unlocked style with the most armour (plate once it unlocks). */
export function heaviestStyle(school: SchoolId, L: number): number {
  let best = 0;
  for (let i = 0; i <= tierAt(L); i++) if (setArmour(school, i, L) > setArmour(school, best, L)) best = i;
  return best;
}

export { RING_IDS, AMULET_IDS };
