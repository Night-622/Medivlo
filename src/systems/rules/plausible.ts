/**
 * Is a loaded character plausible for a public realm? (Claude 3; Claude 6's realm-server request, Claude 1 approved.)
 * Pure and Phaser-free: the realm server runs it on the player's own cloud save before seating them.
 * Call order: migrateCharacter (core) → plausible (on the migrated save, so sanitising cannot hide tampering) →
 * sanitizeLoadout (seat that copy: it only drops what no longer exists).
 * Thresholds are generous: they catch "L40 after three minutes" or a million Embershards at L3, not a fast player.
 */
import { HC_CLASSES } from '@/data/classes/hc/classes.gen';
import { HC_TOMES } from '@/data/items/hc/build-items';
import { sanitizeAffixes, socketCount } from './affixes';
import { LEVEL_CAP, levelPoints, P, xpToNext } from './curves';
import { itemInfo } from './gear';
import { runeDef, runeSlots } from './runes';
import { spellDef } from './spells';
import { spentPoints } from './tree';
import { uniqueDef } from './uniques';
import type { CharacterSave, ItemInstance } from './types';

export type Plausible = { ok: true } | { ok: false; reason: string; detail: string };

const REASON = 'This hero’s save couldn’t be verified for public realms.';
/** fastest believable time to reach a level: (L−1)^1.5 × 20 s (L14 ≈ 16 min, L40 ≈ 81 min; real play is hours) */
export const minPlaySec = (level: number): number => Math.pow(Math.max(0, level - 1), 1.5) * 20;
/** most Embershards a hero of this level could hold: far above what drops and quests pay */
export const goldCeiling = (level: number): number => Math.round(20_000 + 15_000 * level * Math.pow(P(level), 0.6));
export const PLAUSIBLE_CAPS = { ilvlAbove: 5, pack: 160, stack: 999, bonusPoints: 60, upgrade: 5 };

export function plausible(c: CharacterSave, ctx: { playtimeSec: number }): Plausible {
  const no = (detail: string): Plausible => ({ ok: false, reason: REASON, detail });
  if (!c || typeof c !== 'object') return no('not a character');
  if (!HC_CLASSES.some((x) => x.id === c.classId)) return no(`unknown class ${String(c.classId)}`);
  const L = c.level;
  if (!Number.isInteger(L) || L < 1 || L > LEVEL_CAP) return no(`level ${L}`);
  if (L > 2 && ctx.playtimeSec < minPlaySec(L)) return no(`level ${L} after ${Math.round(ctx.playtimeSec)} s (min ${Math.round(minPlaySec(L))} s)`);
  if (!Number.isFinite(c.xp) || c.xp < 0 || (L < LEVEL_CAP && c.xp >= xpToNext(L))) return no(`xp ${c.xp} at level ${L}`);
  if (!Number.isFinite(c.gold) || c.gold < 0 || c.gold > goldCeiling(L)) return no(`gold ${c.gold} at level ${L} (ceiling ${goldCeiling(L)})`);
  const bonus = c.bonusPoints ?? 0;
  if (!Number.isInteger(bonus) || bonus < 0 || bonus > PLAUSIBLE_CAPS.bonusPoints) return no(`bonusPoints ${bonus}`);
  if (spentPoints(c.tree ?? {}) > levelPoints(L) + bonus) return no(`tree ${spentPoints(c.tree ?? {})} ranks > ${levelPoints(L) + bonus} points`);
  const inv = Array.isArray(c.inventory) ? c.inventory : [];
  if (inv.length > PLAUSIBLE_CAPS.pack) return no(`pack ${inv.length} items`);
  const items: ItemInstance[] = [...inv, ...Object.values(c.equipment ?? {}).filter((x): x is ItemInstance => !!x)];
  for (const it of items) {
    const why = itemProblem(it, L);
    if (why) return no(`${it?.uid ?? '?'} ${it?.base ?? '?'}: ${why}`);
  }
  for (const [spell, ids] of Object.entries(c.runes ?? {})) {
    if (!spellDef(spell)) return no(`runes in unknown spell ${spell}`);
    if (!Array.isArray(ids) || ids.some((id) => !runeDef(id))) return no(`unknown rune in ${spell}`);
    if (ids.length > runeSlots(c, spell)) return no(`${ids.length} runes in ${spell} (${runeSlots(c, spell)} slots)`);
  }
  if (c.tomeSpell && !HC_TOMES.some((t) => t.spell === c.tomeSpell)) return no(`tome spell ${c.tomeSpell}`);
  return { ok: true };
}

function itemProblem(it: ItemInstance, level: number): string | null {
  if (!it || typeof it !== 'object' || typeof it.base !== 'string') return 'malformed';
  const info = itemInfo(it.base);
  if (!info) return 'unknown base';
  if (!Number.isInteger(it.qty) || it.qty < 1 || it.qty > (info.stackable ? PLAUSIBLE_CAPS.stack : 1)) return `qty ${it.qty}`;
  if (info.slot && (!Number.isInteger(it.ilvl) || it.ilvl < 1 || it.ilvl > level + PLAUSIBLE_CAPS.ilvlAbove)) return `ilvl ${it.ilvl} at level ${level}`;
  if ((it.upgrade ?? 0) > PLAUSIBLE_CAPS.upgrade || (it.upgrade ?? 0) < 0) return `upgrade ${it.upgrade}`;
  if ((it.sockets?.length ?? 0) > Math.max(socketCount(it), it.gem ? 1 : 0)) return `${it.sockets?.length} sockets`;
  // uniques carry their own fixed affixes (re-set by the sanitiser); rolled ones must sit inside their tables
  if (it.affixes?.length && !uniqueDef(it.base) && sanitizeAffixes(it).length !== it.affixes.length) return 'affixes outside their tables';
  return null;
}
