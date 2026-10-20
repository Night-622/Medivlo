/**
 * Character save migrations for the deeper-builds project (docs/systems/BUILDS.md). Pure, so the realm server and
 * Node tests can use it too. Owner: Claude 1 (contract); rules agreed with Claude 3.
 */
import type { CharacterSave, ItemInstance } from './hc';

/**
 * The tree refund (buildVersion < 2 → empty tree, one free respec) runs only once the perk tree has landed
 * (Claude 3's phase 3b). Until then saves keep their tree untouched.
 */
export const PERK_TREE_LIVE = true;
export const BUILD_VERSION = PERK_TREE_LIVE ? 2 : 1;

/** Old single gem → sockets; items without rarity keep the base's rarity (nothing to write). */
function migrateItem(it: ItemInstance): void {
  if (it.gem && !it.sockets) it.sockets = [it.gem];
}

/** Bring a saved character up to the current build data. Mutates and returns it. Safe to run more than once. */
export function migrateCharacter(c: CharacterSave): CharacterSave {
  for (const it of c.inventory ?? []) migrateItem(it);
  for (const it of Object.values(c.equipment ?? {})) if (it) migrateItem(it);
  if (PERK_TREE_LIVE && (c.buildVersion ?? 1) < 2) {
    c.tree = {}; // every point comes back: level points are derived, bonusPoints are kept
    c.runes = {};
    c.freeRespec = true;
    c.buildVersion = 2;
  }
  return c;
}
