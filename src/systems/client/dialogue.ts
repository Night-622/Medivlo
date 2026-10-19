/**
 * Dialogue tags for the narrative engine (Claude 3, Hollow Crown): the local hero's class and school
 * (`warden`, `class:warden`, `rime`, `school:rime`) plus equipped legendaries (`legendary:<id>`).
 * The optional argument keeps the old call shape `activeDialogueTags(Game.state)` working.
 */
import { CLASS_SCHOOL } from '@/core/constants';
import { character } from './character';

export function activeDialogueTags(_state?: unknown): string[] {
  const c = character();
  const school = CLASS_SCHOOL[c.classId];
  const tags = [c.classId, `class:${c.classId}`];
  if (school) tags.push(school, `school:${school}`);
  for (const it of Object.values(c.equipment)) if (it?.base.startsWith('lg_')) tags.push(`legendary:${it.base}`);
  return tags;
}
