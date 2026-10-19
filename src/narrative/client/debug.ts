/**
 * Dev-only console helpers: `narrative.talk('npc:maren-hollis')`, `narrative.interact('obj:remembrance-pyre')`,
 * `narrative.kill('enemy:hollowed-thrall', 4)`, `narrative.reach('landmark:gloamwood-path')`, `narrative.state()`.
 * They simulate the events other systems emit, so quests can be played before the world exists.
 */
import { Game, bus, setFlag } from '@/core';
import type { DialogueId, EnemyFamily, EnemyId, FlagValue, ItemId, NpcId, QuestId } from '@/core';
import { dialogue } from '../engine/dialogue';
import { npcsAt, talkTo } from '../engine/npcs';
import { startQuest } from '../engine/quests';
import { validateContent } from '../engine/validate';

export function installDebug(): void {
  if (!import.meta.env.DEV) return;
  const api = {
    talk: (npc: string) => talkTo(npc as NpcId),
    /** co-op e2e: a two-choice party-scope vote (data/dialogue/dev-test-vote.ts); the result is flag dev.test_vote */
    testVote: () => dialogue.open('dialogue:dev-test-vote' as DialogueId),
    choose: (i: number) => dialogue.choose(i),
    next: () => dialogue.advance(),
    view: () => dialogue.view(),
    interact: (objectId: string, kind: 'interactable' | 'lore' | 'npc-anchor' = 'interactable', props: Record<string, string> = {}) =>
      bus.emit('interact', { objectId, kind, props }),
    kill: (enemyId: string, n = 1, family: EnemyFamily = 'folk', variant?: 'hollowed') => {
      for (let i = 0; i < n; i++) {
        bus.emit('enemy:killed', { enemyId: enemyId as EnemyId, x: 0, y: 0, level: 1, family, variant, rank: 'normal' as never, byPlayer: true });
      }
    },
    cleanse: (enemyId: string, flag: string) => { setFlag(flag, true); bus.emit('enemy:cleansed', { enemyId: enemyId as EnemyId, flag }); },
    reach: (landmarkId: string) => bus.emit('landmark:entered', { landmarkId }),
    leave: (landmarkId: string) => bus.emit('landmark:left', { landmarkId }),
    flag: (k: string, v: FlagValue) => setFlag(k, v),
    start: (q: string) => startQuest(q as QuestId),
    /** debug only: put an item straight into the inventory (normally Claude 3 does this on quest:reward) */
    give: (item: string, qty = 1) => {
      Game.state.player.inventory.items.push({ uid: `dbg-${Date.now()}`, def: item as ItemId, qty } as never);
      bus.emit('item:picked', { uid: 'dbg', def: item as ItemId, qty });
    },
    state: () => ({ quests: Game.state.narrative.quests, flags: Game.state.flags, rep: Game.state.narrative.reputation, items: Game.state.player.inventory.items.map((i) => `${i.def}x${i.qty}`), codex: Game.state.narrative.codexUnlocked.length }),
    npcsAt: (landmark: string) => npcsAt(landmark).map((n) => n.id),
    validate: () => validateContent(),
  };
  (window as unknown as { narrative: typeof api }).narrative = api;
}
