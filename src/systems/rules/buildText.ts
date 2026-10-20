/**
 * Claude 4's builds text overlay (src/data/lore/hc-builds-text.ts) for the deeper-builds content: one resolver so
 * every screen shows `overlay.name ?? def.name` and the in-world flavour line, while mechanics keep their own text.
 */
import {
  AFFIX_TEXT, HYBRID_TEXT, ITEM_TEXT, KEYSTONE_TEXT, MASTERY_TEXT, PERK_TEXT, RUNE_TEXT, SPELL_TEXT, UNIQUE_TEXT,
} from '@/data/lore/hc-builds-text';

export type TextKind = 'perk' | 'keystone' | 'mastery' | 'spell' | 'rune' | 'item' | 'unique' | 'hybrid';
export interface ShownText { name?: string; flavour?: string; lore?: string }

export function textOf(kind: TextKind, id: string): ShownText | undefined {
  switch (kind) {
    case 'perk': return PERK_TEXT[id] ?? KEYSTONE_TEXT[id];
    case 'keystone': return KEYSTONE_TEXT[id];
    case 'mastery': return MASTERY_TEXT[id];
    case 'spell': return SPELL_TEXT[id];
    case 'rune': return RUNE_TEXT[id];
    case 'item': return ITEM_TEXT[id] ?? RUNE_TEXT[id];
    case 'unique': return UNIQUE_TEXT[id];
    /** key `${schools[0]}+${schools[1]}` as HC_HYBRIDS lists them */
    case 'hybrid': return HYBRID_TEXT[id];
  }
}
export const displayName = (kind: TextKind, id: string, fallback: string): string => textOf(kind, id)?.name ?? fallback;
export const flavourOf = (kind: TextKind, id: string): string | undefined => textOf(kind, id)?.flavour;
/** the word an affix adds to an item's name ("Burning", "of the Owl") */
export const affixLabel = (id: string): string | undefined => AFFIX_TEXT[id]?.label;
