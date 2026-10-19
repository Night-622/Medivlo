/** NarrativeEffect application. Rewards and items go to Claude 3 via `quest:reward`. Owner: Claude 4. */
import { bus, getFlag, setFlag } from '@/core';
import type { NarrativeEffect, NpcId, QuestId, QuestRewardPayload } from '@/core';
import { unlockLore } from './codex';
import { openDialogue } from './dialogue';
import { completeQuest, failQuest, setStage, startQuest } from './quests';
import { changeRep } from './reputation';
import { slug } from './state';
import { changeTrust, setTrust } from './trust';
import { startEscort, type EscortOrder } from './escort';

export interface EffectContext { questId?: QuestId }

export function emitReward(questId: QuestId | undefined, reward: QuestRewardPayload): void {
  bus.emit('quest:reward', { questId: questId ?? 'quest:none', ...reward });
}

export function companionFlag(npc: NpcId, key: 'following' | 'loyalty'): string {
  return `companion.${slug(npc)}.${key}`;
}

export function applyEffects(effects: NarrativeEffect[] | undefined, ctx: EffectContext = {}): void {
  for (const e of effects ?? []) applyEffect(e, ctx);
}

function applyEffect(e: NarrativeEffect, ctx: EffectContext): void {
  if ('setFlag' in e) return setFlag(e.setFlag, e.value);
  if ('addFlag' in e) {
    const cur = getFlag(e.addFlag);
    return setFlag(e.addFlag, (typeof cur === 'number' ? cur : 0) + e.amount);
  }
  if ('startQuest' in e) return startQuest(e.startQuest as QuestId);
  if ('setStage' in e) return setStage(e.setStage, e.stage);
  if ('completeQuest' in e) return completeQuest(e.completeQuest, e.outcome);
  if ('failQuest' in e) return failQuest(e.failQuest);
  if ('reward' in e) return emitReward(ctx.questId, e.reward);
  // escorts (core NarrativeEffect `escort` variant; see engine/escort.ts)
  if ('escort' in e) return startEscort(e as unknown as EscortOrder);
  if ('giveItem' in e) {
    const qty = e.count ?? 1;
    // Hollow Crown handoff ids (i_*, w_*, a_*, lg_*) go as hcItems; v1 Registry items as items
    return emitReward(ctx.questId, e.giveItem.startsWith('item:') ? { items: [{ item: e.giveItem as `item:${string}`, qty }] } : { hcItems: [{ item: e.giveItem, qty }] });
  }
  if ('giveGold' in e) return emitReward(ctx.questId, { gold: e.giveGold });
  if ('takeItem' in e) { bus.emit('quest:take-item', { questId: ctx.questId ?? 'quest:none', item: e.takeItem as `item:${string}`, qty: e.count ?? 1 }); return; }
  if ('reputation' in e) return changeRep(e.reputation as `faction:${string}`, e.delta);
  if ('unlockLore' in e) return unlockLore(e.unlockLore, e.section);
  if ('openDialogue' in e) { openDialogue(e.openDialogue); return; }
  if ('companion' in e) {
    // a companion who left (loyalty collapse) stays gone unless a scene deliberately clears companion.<slug>.left
    if (e.following && getFlag(`companion.${slug(e.companion)}.left`) === true) return;
    setFlag(companionFlag(e.companion, 'following'), e.following);
    bus.emit('companion:changed', { npcId: e.companion, following: e.following });
    return;
  }
  if ('loyalty' in e) {
    const key = companionFlag(e.loyalty, 'loyalty');
    const cur = getFlag(key);
    const base = typeof cur === 'number' ? cur : 50;
    return setFlag(key, Math.max(0, Math.min(100, base + e.delta)));
  }
  // v2 (Hollow Crown)
  if ('trust' in e) return e.set !== undefined ? setTrust(e.trust, e.set) : changeTrust(e.trust, e.delta ?? 0);
  if ('insight' in e) return setFlag(`insight.${e.insight}`, true);
  // giveXp needs raw XP (use reward.xpTier instead).
  console.warn('[narrative] unsupported effect', e);
}
