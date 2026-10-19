/**
 * Nemesis fights end on a story choice, not a death (Claude 3): a beaten nemesis (lair 3), its Act III form, or
 * the Hollow King yields at 1 HP and the combat system emits enemy:yielded. The yield counts as the kill for
 * quest objectives. Then:
 *   - before Act III the nemesis escapes (08 R7): despawn;
 *   - in Act III it waits for the class's fate choice, `<class>.nemesis_fate` = 'spared' (despawn) or
 *     'destroyed' (a sourceless hit finishes it); this also sets story.nemesis_resolved / story.nemesis_spared;
 *   - the Hollow King waits for the ending (story.ending), then leaves the fight (every ending ends it in words).
 * Authority only. Owner: Claude 4.
 */
import { Services, getFlag, setFlag } from '@/core';
import { authBus } from './state';
import type { GameEvents } from '@/core';
import { countKill } from './quests';

type Yielded = GameEvents['enemy:yielded'];

let pending: Yielded | null = null;
let king: Yielded | null = null;

const combat = () => Services.tryGet('combat');

export function installNemesis(): void {
  authBus.on('enemy:yielded', (y) => {
    countKill(y.creature);
    if (y.creature === 'bx_hollowking') { king = y; return; }
    const act = getFlag('story.act');
    if (typeof act !== 'number' || act < 3) { combat()?.despawn(y.enemyId); return; }
    pending = y;
  });
  authBus.on('flag:changed', ({ key, value }) => {
    if (key.endsWith('.nemesis_fate') && key.split('.').length === 2) {
      setFlag('story.nemesis_resolved', true);
      setFlag('story.nemesis_spared', value === 'spared');
      if (pending) {
        const y = pending;
        pending = null;
        if (value === 'destroyed') combat()?.damage(y.enemyId, 1, 'umbral');
        else combat()?.despawn(y.enemyId);
      }
    }
    if (key === 'story.ending' && king) {
      combat()?.despawn(king.enemyId);
      king = null;
    }
  });
}
