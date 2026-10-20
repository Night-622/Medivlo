/** Spell lookup across kit, school and scroll spells (Claude 3). Pure. */
import { HC_KIT_SPELLS } from '@/data/spells/hc/kit-spells';
import { HC_KIT_SPELLS_NEW } from '@/data/spells/hc/kit-spells-new';
import { HC_SCHOOL_SPELL_DEFS, HC_SCROLL_SPELLS, SCROLL_SPELL } from '@/data/spells/hc/school-spells';
import { displayName } from './buildText';
import type { HcSpell } from './types';

// built on first use: the names overlay (Claude 4) imports data that imports this module's neighbours
let ALL: Map<string, HcSpell> | null = null;
function all(): Map<string, HcSpell> {
  if (!ALL) {
    ALL = new Map<string, HcSpell>([...HC_KIT_SPELLS, ...HC_KIT_SPELLS_NEW, ...HC_SCHOOL_SPELL_DEFS, ...HC_SCROLL_SPELLS]
      .map((s) => [s.id, { ...s, name: displayName('spell', s.id, s.name) }]));
  }
  return ALL;
}

export const spellDef = (id: string): HcSpell | undefined => all().get(id);
export const allSpells = (): HcSpell[] => [...all().values()];
export const scrollSpell = (itemId: string): HcSpell | undefined => all().get(SCROLL_SPELL[itemId] ?? '');
