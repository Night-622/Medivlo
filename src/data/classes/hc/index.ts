/**
 * Class display records for character creation and UI (Claude 3). Stable import path:
 *   import { HC_CLASS_DISPLAY, classDisplay, defaultLook } from '@/data/classes/hc';
 * Data comes from the handoff (Screens CLASSES + atlas.heroes[*].defaultLook).
 */
import type { SchoolId } from '@/systems/rules/types';
import { HC_CLASSES, HC_DEFAULT_LOOK, HC_LOOK_OPTIONS } from './classes.gen';

export { HC_CLASSES, HC_DEFAULT_LOOK, HC_LOOK_OPTIONS };

import { MAGIC_SCHOOLS, MARTIAL_SCHOOLS } from '@/core/constants';
export { MAGIC_SCHOOLS, MARTIAL_SCHOOLS };
export const SCHOOL_NAME: Record<SchoolId, string> = {
  ash: 'Ash', rime: 'Rime', storm: 'Storm', radiance: 'Radiance', umbral: 'Umbral', verdant: 'Verdant',
  blade: 'Blade', iron: 'Iron', fist: 'Fist', hunt: 'Hunt', guile: 'Guile', song: 'Song',
};
/** atlas.schools.colors */
export const SCHOOL_COLOR: Record<SchoolId, string> = {
  ash: '#ff6a2a', rime: '#7fe3ff', storm: '#ffe14a', radiance: '#ffd96b', umbral: '#a35cff', verdant: '#4fd86a',
  blade: '#e8eef8', iron: '#c09070', fist: '#ff8a5a', hunt: '#d9b45a', guile: '#ff5a8a', song: '#f0a0ff',
};
/** The school realm each hero starts in (realms.js). */
export const SCHOOL_REALM: Record<SchoolId, string> = {
  ash: 'Cinderreach', rime: 'Frostmere', storm: 'Thunderreach', radiance: 'Solaria', umbral: 'Nocturne', verdant: 'Wildheart',
  blade: 'Steelvale', iron: 'Ironhold', fist: 'Mountainreach', hunt: 'The Greywilds', guile: 'Tidecourt', song: 'Harmonia',
};

export interface ClassDisplay {
  id: string; name: string; epithet: string; role: string; school: SchoolId; kind: 'magic' | 'martial';
  tags: string[]; lore: string; color: string; difficulty: number; realm: string;
  /** handoff's 4 rows: Might, Guard, Arcana, Speed */
  stats: { label: string; pips: number }[];
  /** starting spells (slots 1–3); icon = atlas / MV frame name */
  abilities: { name: string; desc: string; icon: string }[];
}

export const HC_CLASS_DISPLAY: ClassDisplay[] = HC_CLASSES.map((c) => ({
  id: c.id, name: c.name, epithet: c.epithet, role: c.role, school: c.school,
  kind: MAGIC_SCHOOLS.includes(c.school) ? 'magic' : 'martial',
  tags: c.tags, lore: c.lore, color: c.color, difficulty: c.difficulty, realm: SCHOOL_REALM[c.school],
  stats: [
    { label: 'Might', pips: c.rating.might }, { label: 'Guard', pips: c.rating.guard },
    { label: 'Arcana', pips: c.rating.arcana }, { label: 'Speed', pips: c.rating.speed },
  ],
  abilities: c.abilities.map((a) => ({ name: a.name, desc: a.desc, icon: a.icon })),
}));

export const classDisplay = (id: string): ClassDisplay | undefined => HC_CLASS_DISPLAY.find((c) => c.id === id);

export type Look = (typeof HC_DEFAULT_LOOK)[string];

/**
 * Default look for a class in the requested body (0 = Female, 1 = Male).
 * Applies the handoff's switch rules: Male turns Long/Bob/Braids into Tousled; Female drops Stubble/Beard.
 */
export function defaultLook(classId: string, body: 0 | 1): Look {
  const base = HC_DEFAULT_LOOK[classId] ?? HC_DEFAULT_LOOK.warden;
  const look = { ...base, body };
  if (body === 1 && [1, 4, 5].includes(look.hair)) look.hair = 0;
  if (body === 0 && [4, 5].includes(look.mark)) look.mark = 0;
  return look;
}
