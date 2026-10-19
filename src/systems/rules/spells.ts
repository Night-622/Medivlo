/** Spell lookup across kit, school and scroll spells (Claude 3). Pure. */
import { HC_KIT_SPELLS } from '@/data/spells/hc/kit-spells';
import { HC_SCHOOL_SPELL_DEFS, HC_SCROLL_SPELLS, SCROLL_SPELL } from '@/data/spells/hc/school-spells';
import type { HcSpell } from './types';

const ALL = new Map<string, HcSpell>([...HC_KIT_SPELLS, ...HC_SCHOOL_SPELL_DEFS, ...HC_SCROLL_SPELLS].map((s) => [s.id, s]));

export const spellDef = (id: string): HcSpell | undefined => ALL.get(id);
export const allSpells = (): HcSpell[] => [...ALL.values()];
export const scrollSpell = (itemId: string): HcSpell | undefined => ALL.get(SCROLL_SPELL[itemId] ?? '');
