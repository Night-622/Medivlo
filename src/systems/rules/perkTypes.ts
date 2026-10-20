/**
 * Deeper builds (docs/systems/BUILDS.md §3): perk table shapes. The tree generator (rules/tree.ts) keeps its
 * 3 branches × 24 nodes and draws these perks into fixed slots; every effect is plain Passive data.
 *
 * Slots per class (node ids):
 * - Spells: sp_p{i}m1 grants the new kit spell i+3; sp_p{i}m2, sp_p{i}b (3 ranks), sp_p{i}c1 / c2 = 4 signature perks
 *   per path, 12 in all, in ClassPerks.signature order [p0m2, p0b, p0c1, p0c2, p1m2, …, p2c2].
 * - Skills: sk_p0b stays the school element node; sk_p0c1 / c2, sk_p1b (3 ranks), sk_p1c1 / c2, sk_p2b (3 ranks),
 *   sk_p2c1 / c2 = 8 school perks in SchoolPerks.perks order [p0c1, p0c2, p1b, p1c1, p1c2, p2b, p2c1, p2c2].
 * - Upgrades: up_p{i}c2 = the class's 3 offered shared keystones (KEYSTONE_OFFERS), each against a utility in c1.
 *   A character takes at most 2 shared keystones.
 */
import type { SchoolId } from '@/core/constants';
import type { Passive, WeaponType } from './types';

export type PerkKind = 'conversion' | 'trigger' | 'resource' | 'aura' | 'tradeoff' | 'power';

export interface PerkDef {
  /** unique across all tables: 'pk_<class|school>_<slug>', 'ks_<slug>' */
  id: string;
  /** working name; Claude 4 restyles names and flavour */
  name: string;
  kind: PerkKind;
  /** 1, or 3 for the b slots */
  ranks: 1 | 3;
  /** one line per rank (the full effect at that rank, trade-off downside included) */
  text: string[];
  /** one Passive per rank: the whole effect at that rank (not a delta) */
  effects: Passive[];
  icon?: string;
}

export interface ClassPerks {
  classId: string;
  /** 12 in slot order (see the header); b slots (indices 1, 5, 9) have 3 ranks */
  signature: PerkDef[];
}

export interface SchoolPerks {
  school: SchoolId;
  /** the school's two classes */
  classes: [ClassPerks, ClassPerks];
  /** 8 in slot order (see the header); indices 2 and 5 have 3 ranks */
  perks: PerkDef[];
}

/** Shared keystones: rank 1, build-reshaping, any class that is offered one. */
export interface SharedKeystone extends PerkDef {
  ranks: 1;
}

/** Weapon mastery: active while the class wields that weapon type in the main hand. */
export interface MasteryDef {
  classId: string;
  weapon: WeaponType;
  name: string;
  text: string;
  passive: Passive;
}
