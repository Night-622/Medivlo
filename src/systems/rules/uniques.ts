/**
 * Unique items (Claude 3, docs/systems/BUILDS.md §5). Pure: item info, the effect passive (a moved uniqueFx too),
 * and the fixed affixes a fresh drop carries. Data: data/items/hc/uniques.ts.
 */
import { HC_UNIQUES } from '@/data/items/hc/uniques';
import type { UniqueDef } from './affixTypes';
import type { ItemInstance, Passive } from './types';

const BY_ID = new Map(HC_UNIQUES.map((u) => [u.id, u]));
export const uniqueDef = (id: string): UniqueDef | undefined => BY_ID.get(id);
export const allUniques = (): UniqueDef[] => HC_UNIQUES;

/** A fresh drop of a unique: its base's level, its fixed affixes, sockets as spark. */
export function uniqueInstance(id: string, ilvl: number): Omit<ItemInstance, 'uid'> | null {
  const u = BY_ID.get(id);
  if (!u) return null;
  return { base: u.id, ilvl, qty: 1, rarity: 'spark', affixes: u.affixes.map((a) => ({ ...a })), sockets: [null, null, null] };
}

/** The bespoke effect for an id (unique or legendary with a written effect), else undefined (generic legendary). */
export const uniqueEffect = (id: string): Passive | undefined => BY_ID.get(id)?.effect;
