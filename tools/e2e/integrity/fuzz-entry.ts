// Bundle entry for tools/e2e/integrity-fuzz.mjs (Firebase is swapped for integrity/fake-firebase.mjs).
export { SaveService } from '@/firebase/SaveService';
export { createNewGameState } from '@/core/GameState';
export { newCharacter } from '@/systems/rules/character';
export { sanitizeLoadout } from '@/systems/rules/validate';
export { kitFor } from '@/data/classes/hc/kits';
export { HC_PIECES } from '@/data/items/hc/armour.gen';
