/**
 * Runeforge v2 (Claude 3, docs/PACING.md D): what the smith charges and gives. Pure, shared by the authority
 * (src/systems/sim/runeforge.ts) and the shop screen, so the price a player sees is the price they pay.
 * - Reforge: raise a piece's item level to yours (gold + Iron Ingots). Keeps a favourite piece, set or legendary alive.
 * - Socket: set a gem into one of the item's sockets (count by rarity, 1–3; gold; the gem is used up, a gem already
 *   in that socket is lost).
 * - Salvage: break unworn gear into Iron Ingots (its gem comes back).
 */
import { campaignItem } from '@/data/items/hc/campaign-items';
import { P } from './curves';
import { gemsOf, GEMS, itemInfo, rarityIndex } from './gear';
import { itemRarity, socketCount } from './affixes';
import type { ItemInstance } from './types';

export const INGOT = 'i_ingot';

const scale = (L: number): number => Math.pow(P(L), 0.6);

export interface ReforgeCost { gold: number; ingots: number; to: number }

/** Cost to bring `it` up to `level`; null if it is already there or cannot be reforged. */
export function reforgeCost(it: ItemInstance, level: number): ReforgeCost | null {
  const info = itemInfo(it.base);
  if (!info?.slot || info.questItem || it.ilvl >= level) return null;
  const diff = level - it.ilvl;
  const legendary = info.kind === 'legendary' ? 2 : 1;
  return { to: level, gold: Math.max(5, Math.round(info.value * 0.12 * diff * scale(level) * legendary)), ingots: Math.ceil(diff / 4) * legendary };
}

/** Gold to set a gem; null if the piece has no socket or the gem is not a gem. */
export function socketCost(it: ItemInstance, gem: string): number | null {
  const info = itemInfo(it.base);
  if (!info || !socketCount(it) || !GEMS[gem]) return null;
  return Math.max(10, Math.round(20 * scale(it.ilvl)));
}

export interface SalvageYield { ingots: number; /** first gem (legacy field) */ gem?: string; gems: string[] }

/** What breaking a piece gives; null for things the smith will not break (legendaries, story gifts, quest items). */
export function salvageYield(it: ItemInstance): SalvageYield | null {
  const info = itemInfo(it.base);
  if (!info?.slot || info.questItem || info.kind === 'legendary' || campaignItem(it.base)) return null;
  const gems = gemsOf(it);
  return { ingots: 1 + Math.floor(rarityIndex(itemRarity(it)) / 2) + Math.floor(it.ilvl / 12), gem: gems[0], gems };
}
