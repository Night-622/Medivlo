/** Perk tables by school (Claude 5 for Claude 3, docs/systems/BUILDS.md §3), all 12 schools. */
import type { SchoolPerks } from '@/systems/rules/perkTypes';
import { PERKS as ash } from './perks-ash';
import { PERKS as blade } from './perks-blade';
import { PERKS as fist } from './perks-fist';
import { PERKS as guile } from './perks-guile';
import { PERKS as hunt } from './perks-hunt';
import { PERKS as iron } from './perks-iron';
import { PERKS as radiance } from './perks-radiance';
import { PERKS as rime } from './perks-rime';
import { PERKS as song } from './perks-song';
import { PERKS as storm } from './perks-storm';
import { PERKS as umbral } from './perks-umbral';
import { PERKS as verdant } from './perks-verdant';

export const HC_SCHOOL_PERKS: SchoolPerks[] = [ash, rime, storm, radiance, umbral, verdant, blade, iron, fist, hunt, guile, song];
