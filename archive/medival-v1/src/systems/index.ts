/**
 * Public API of Claude 3's systems (combat, progression, builds). Scenes import only from here.
 */
export { initCharacter, learnSpell, ASHMARK, type InitCharacterOpts } from './progression/Character';
export { CREATION_TRAIT_PICKS, LEVEL_CAP, xpToNext } from './balance';
export { describeEffect, describeModifier, statLabel } from './describe';
export { computePlayerStats } from './stats/playerStats';
export { grantXp, xpProgress } from './progression/Leveling';
export { createPlayer, type PlayerHandle } from './runtime/createPlayer';

import type { GameState } from '@/core';
import { collectPlayerEffects } from './stats/collect';
/** Dialogue tags the player currently has (traits, ancestry, equipment, tree nodes). For Claude 4's dialogue checks. */
export function activeDialogueTags(state: GameState): string[] {
  return [...new Set(collectPlayerEffects(state).dialogueTags)];
}
