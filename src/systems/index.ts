/**
 * Systems (Claude 3), The Hollow Crown. Kept deliberately light: it is imported by the narrative client, so it must
 * not pull in modules that import '@/narrative' (that creates a load-order cycle). Import heavy entry points directly:
 *   '@/systems/client/hero' (createHero) · '@/systems/sim' (installSystemsAuthority) · '@/systems/rules/*'
 * The retired Medival v1 systems are in archive/medival-v1/.
 */
export { activeDialogueTags } from './client/dialogue';
export { character, onCharacterChanged, availablePoints } from './client/character';
export { newCharacter } from './rules/character';
