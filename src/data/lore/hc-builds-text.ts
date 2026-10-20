/**
 * Builds text overlay (Claude 4; BUILDS.md phase 8, agreed with Claude 3). Names and flavour for the deeper-builds content,
 * keyed by the frozen ids of Claude 3 / Claude 5's mechanics. The UI shows `name ?? def.name`, keeps the mechanical text
 * exactly as written, and adds `flavour` in italics at the foot of the card or tooltip. Affix labels go into the item
 * name: "<prefix label> <base> <suffix label>". Flavour never quotes numbers (they are still tuned). Owner: Claude 4.
 */
import * as ash from './builds/ash';
import * as rime from './builds/rime';
import * as storm from './builds/storm';
import * as radiance from './builds/radiance';
import * as umbral from './builds/umbral';
import * as verdant from './builds/verdant';
import * as blade from './builds/blade';
import * as iron from './builds/iron';
import * as fist from './builds/fist';
import * as hunt from './builds/hunt';
import * as guile from './builds/guile';
import * as song from './builds/song';
import * as shared from './builds/shared';
import * as uniques from './builds/uniques';
import * as schoolSpells from './builds/school-spells';

/** a perk, keystone, mastery, rune or item: an optional new name and one in-world line */
export interface BuildText { name?: string; flavour: string }
/** a spell: optional new name (the id stays), one in-world line; the mechanical desc stays Claude 5's */
export interface SpellText { name?: string; flavour: string }
/** a unique: optional new name, its flavour line and an optional longer lore line (the effect line stays Claude 5’s) */
export interface UniqueText { name?: string; flavour: string; lore?: string }
/** an affix's word on the item name: prefixes "Burning", suffixes "of the Owl" */
export interface AffixText { label: string }

const SCHOOLS = [ash, rime, storm, radiance, umbral, verdant, blade, iron, fist, hunt, guile, song];

export const PERK_TEXT: Record<string, BuildText> = Object.assign({}, ...SCHOOLS.map((s) => s.PERKS));
/** the 72 kit spells (per school file) and the 36 tome-taught school spells */
export const SPELL_TEXT: Record<string, SpellText> = Object.assign({}, ...SCHOOLS.map((s) => s.SPELLS), schoolSpells.SPELLS);
export const KEYSTONE_TEXT: Record<string, BuildText> = shared.KEYSTONES;
/** key `${classId}:${weapon}` */
export const MASTERY_TEXT: Record<string, BuildText> = shared.MASTERY;
export const AFFIX_TEXT: Record<string, AffixText> = shared.AFFIXES;
export const RUNE_TEXT: Record<string, BuildText> = shared.RUNES;
/** materials (rune dust, essences) and tomes */
export const ITEM_TEXT: Record<string, BuildText> = shared.ITEMS;
export const UNIQUE_TEXT: Record<string, UniqueText> = uniques.UNIQUES;
/** curated hybrid set bonuses, key `${schools[0]}+${schools[1]}` as HC_HYBRIDS lists them */
export const HYBRID_TEXT: Record<string, BuildText> = shared.HYBRIDS;
