/**
 * Key names for player-facing text: `{key:<action>}` → the player's own binding, `{key:move}` → the four movement
 * keys. The one table lives in core (Claude 1, core/settings.ts); this re-export keeps narrative imports stable.
 */
export { formatKeys, keyLabel, moveKeys } from '@/core';
