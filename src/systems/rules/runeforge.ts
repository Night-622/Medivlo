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

// ───────────── deeper builds (BUILDS.md §6) ─────────────
export const MAX_UPGRADE = 5;

/** Cost of the next upgrade (+1 … +5: +8% base stats and +6% affix values per level); null at +5 or for non-gear. */
export function upgradeCost(it: ItemInstance): { gold: number; ingots: number; to: number } | null {
  const info = itemInfo(it.base);
  const n = (it.upgrade ?? 0) + 1;
  if (!info?.slot || info.questItem || n > MAX_UPGRADE) return null;
  return { to: n, gold: Math.round(40 * scale(it.ilvl) * n * n), ingots: n };
}

/** Cost to reroll one affix (same group pool, the item's level); null without affixes. */
export function rerollCost(it: ItemInstance): number | null {
  if (!it.affixes?.length) return null;
  return Math.round(25 * scale(it.ilvl) * (1 + rarityIndex(itemRarity(it)) / 2));
}

/** Cost to imbue a weapon with a school (its attacks deal half that school's damage): gold + that school's Essence. */
export function imbueCost(it: ItemInstance): number | null {
  const info = itemInfo(it.base);
  if (info?.kind !== 'weapon' && info?.kind !== 'legendary') return null;
  if (info.slot !== 'weapon') return null;
  return Math.round(60 * scale(it.ilvl));
}

/** The unique effect a piece carries: moved onto it (uniqueFx), or its own if it is a legendary. */
export const uniqueOf = (it: ItemInstance): string | undefined => it.uniqueFx ?? (itemInfo(it.base)?.kind === 'legendary' ? it.base : undefined);

/** Cost to move `from`'s unique effect onto `to` (same slot family; `from` is destroyed); null if not possible. */
export function transferCost(from: ItemInstance, to: ItemInstance): number | null {
  const a = itemInfo(from.base), b = itemInfo(to.base);
  if (!a?.slot || !b?.slot || from.uid === to.uid || !uniqueOf(from) || b.questItem) return null;
  if (a.slot !== b.slot || b.kind === 'legendary') return null;
  return Math.round(120 * scale(Math.max(from.ilvl, to.ilvl)));
}

/** Rune dust from salvaging: one per affix on the piece. */
export const dustYield = (it: ItemInstance): number => it.affixes?.length ?? 0;
