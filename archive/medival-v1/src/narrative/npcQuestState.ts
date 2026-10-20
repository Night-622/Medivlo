/**
 * Archived 2026-10-21 (Claude 4): unused since the People screen reads npcQuestInfo directly. Was in
 * src/narrative/engine/npcs.ts and re-exported from engine/index.ts.
 */
import type { NpcId } from '@/core';
import { npcQuestInfo } from '@/narrative/engine/npcs';

export function npcQuestState(id: NpcId): 'offer' | 'active' | null {
  return npcQuestInfo(id)?.state ?? null;
}

