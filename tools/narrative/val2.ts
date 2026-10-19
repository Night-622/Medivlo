import { Registry } from '@/core';
import type { DialogueDef } from '@/core';
import { validateContent } from '@/narrative/engine/validate';
import { installHcValidationSource } from '@/narrative/client/validationSources';
// the harness registry (registry-full.ts) records ids defined twice; the real Registry lets the later file win
import { DUPLICATES } from './registry-full';
installHcValidationSource();
// travel banter fires from trigger zones, which can sit on shared ground (gate roads, Concordia): every entry must be
// gated by a quest stage or class, or another campaign's line plays for the wrong hero
const ungatedBanter = (Registry.all('dialogue') as DialogueDef[])
  .filter((d) => d.id.startsWith('dialogue:area-') && d.entries.some((e) => !e.when || !/questStage|questActive|heroClass|partyHasClass/.test(JSON.stringify(e.when))))
  .map((d) => `${d.id}: banter entry not gated by a quest stage or class`);
const p = [...DUPLICATES.map((d) => `duplicate id: ${d}`), ...ungatedBanter, ...validateContent()];
const world = p.filter((x) => x.startsWith('[world]'));
const logic = p.filter((x) => !x.startsWith('[world]') && !x.startsWith('[systems]'));
const systems = p.filter((x) => x.startsWith('[systems]'));
console.log('LOGIC problems:', logic.length); for (const x of logic) console.log('  ' + x);
if (systems.length) { console.log('SYSTEMS (ids Claude 3 has not defined):', systems.length); for (const x of systems) console.log('  ' + x); }
console.log('WORLD (unplaced):', world.length);
const ids = new Set(world.map((x) => x.match(/"([^"]+)"/)?.[1]));
console.log('  unplaced ids:', [...ids].join(' '));
