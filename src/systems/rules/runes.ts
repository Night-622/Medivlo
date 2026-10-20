/**
 * Spell runes (Claude 3, docs/systems/BUILDS.md §2.2). Pure: slots by tree progress, which rune fits which spell,
 * the spell mods a save's slotted runes give, and the sanitiser for remote loadouts. Data: data/items/hc/build-items.
 *
 * Slots per spell:
 * - kit spell i (path i's free node): 1 at sp_p{i}m2, 2 at sp_p{i}b rank 3
 * - new kit spell i+3 (sp_p{i}m1): 1 once its path's c1 or c2 pick is taken, 2 at sp_p{i}b rank 3
 * - school spells (sp_t0 / sp_t1): 1 when learned, 2 at rank 3; the ultimate (sp_u) and a tome spell: 1
 */
import { kitFor } from '@/data/classes/hc/kits';
import { HC_RUNES } from '@/data/items/hc/build-items';
import { NEW_KIT } from '@/data/spells/hc/kit-spells-new';
import type { RuneDef } from './affixTypes';
import { spellDef } from './spells';
import { allNodes } from './tree';
import type { CharacterSave, HcSpell, SpellMod } from './types';

const BY_ID = new Map(HC_RUNES.map((r) => [r.id, r]));
export const runeDef = (id: string): RuneDef | undefined => BY_ID.get(id);

/** How many runes `spellId` can hold for this character (0 if it does not know the spell). */
export function runeSlots(s: Pick<CharacterSave, 'classId' | 'tree' | 'tomeSpell'>, spellId: string): number {
  const T = s.tree, r = (id: string) => T[id] ?? 0;
  const kit = kitFor(s.classId).spells.indexOf(spellId);
  if (kit >= 0) return (r(`sp_p${kit}m2`) > 0 ? 1 : 0) + (r(`sp_p${kit}b`) >= 3 ? 1 : 0);
  const fresh = (NEW_KIT[s.classId] ?? []).indexOf(spellId);
  if (fresh >= 0) return r(`sp_p${fresh}m1`) > 0 ? (r(`sp_p${fresh}c1`) + r(`sp_p${fresh}c2`) > 0 ? 1 : 0) + (r(`sp_p${fresh}b`) >= 3 ? 1 : 0) : 0;
  const node = allNodes(s.classId).find((n) => n.branch === 'spells' && n.grantsSpell === spellId && (n.kind === 'top' || n.kind === 'ult'));
  if (node) { const k = r(node.id); return node.kind === 'ult' ? (k > 0 ? 1 : 0) : (k > 0 ? 1 : 0) + (k >= 3 ? 1 : 0); }
  return s.tomeSpell === spellId ? 1 : 0;
}

/** Does the rune fit the spell? (`fits` empty = any spell; else the spell needs one of those tags.) */
export function runeFits(rune: RuneDef, spell: HcSpell): boolean {
  return !rune.fits.length || rune.fits.some((t) => spell.tags.includes(t));
}

/** The spell mods a save's slotted runes give (one SpellMod per rune; runes past a spell's slots, e.g. after a respec, stay put but do nothing). */
export function runeSpellMods(s: Pick<CharacterSave, 'classId' | 'tree' | 'tomeSpell' | 'runes'>): SpellMod[] {
  const out: SpellMod[] = [];
  for (const [spell, ids] of Object.entries(s.runes ?? {})) for (const id of (ids ?? []).slice(0, runeSlots(s, spell))) { const r = BY_ID.get(id); if (r) out.push({ ...r.mod, spell }); }
  return out;
}

/** Keep only known runes, in spells this character knows, that fit, no more than each spell's slots, no duplicates per spell. */
export function sanitizeRunes(s: Pick<CharacterSave, 'classId' | 'tree' | 'tomeSpell' | 'runes'>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  if (!s.runes || typeof s.runes !== 'object') return out;
  for (const [spellId, ids] of Object.entries(s.runes)) {
    const sp = spellDef(spellId), n = runeSlots(s, spellId);
    if (!sp || !n || !Array.isArray(ids)) continue;
    const keep = [...new Set(ids.filter((id): id is string => typeof id === 'string'))].filter((id) => { const r = BY_ID.get(id); return !!r && runeFits(r, sp); }).slice(0, n);
    if (keep.length) out[spellId] = keep;
  }
  return out;
}
