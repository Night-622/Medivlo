/** NPC presence, schedules, dialogue selection and barks. Owner: Claude 4. */
import { Registry, getFlag, setFlag } from '@/core';
import type { NarrativeCondition, NpcDef, NpcId, QuestDef, QuestId } from '@/core';
import { activeQuests, currentStage, objectiveDone, progress, questDef } from './quests';
import { check } from './conditions';
import { openDialogue } from './dialogue';
import { authBus, hourNow, slug, toast } from './state';

export function npcDef(id: NpcId): NpcDef | undefined {
  return Registry.tryGet('npc', id) as NpcDef | undefined;
}

export function isPresent(id: NpcId): boolean {
  const def = npcDef(id);
  // an NPC being escorted walks as a combat body; their static placement is hidden meanwhile
  if (getFlag(`escort.${slug(id)}`) === 'active') return false;
  return !!def && check(def.presentWhen);
}

function inHours(h: number, from: number, to: number): boolean {
  return from <= to ? h >= from && h < to : h >= from || h < to;
}

/** Landmark the NPC is at right now (schedule, else home). */
export function npcLandmark(id: NpcId): string | undefined {
  const def = npcDef(id);
  if (!def) return undefined;
  const h = hourNow();
  return def.schedule?.find((s) => inHours(h, s.from, s.to) && check(s.when))?.at ?? def.home;
}

/** NPCs present at a landmark right now. Claude 2 uses this to spawn sprites at npc-anchors. */
export function npcsAt(landmarkId: string): NpcDef[] {
  return (Registry.all('npc') as NpcDef[]).filter((n) => isPresent(n.id) && npcLandmark(n.id) === landmarkId);
}

/** Start the NPC's current dialogue. Falls back to a bark, then to nothing. */
export function talkTo(id: NpcId, initiator?: string): boolean {
  const def = npcDef(id);
  if (!def || !isPresent(id)) return false;
  // first entry whose condition passes AND whose dialogue opens (a dialogue with no passing entry falls through)
  for (const entry of def.dialogue) {
    if (!check(entry.when) || stageTalkDone(entry.when, id)) continue;
    if (!Registry.tryGet('dialogue', entry.dialogue)) continue;
    if (openDialogue(entry.dialogue, id, initiator)) return true;
  }
  return bark(id);
}

/**
 * A stage scene keyed on `{ questStage, stage }` stops taking over the NPC's talk once that stage's talk objective
 * for this NPC is done (e.g. one of two canvass talks): talk falls through to their own dialogue and quest offers.
 */
function stageTalkDone(when: NarrativeCondition | undefined, npc: NpcId): boolean {
  if (!when || !('questStage' in when)) return false;
  const q = questDef(when.questStage as QuestId);
  const st = q?.stages.find((s) => s.id === when.stage);
  const talks = st?.objectives.filter((o) => 'talk' in o && o.talk === npc) ?? [];
  return !!q && talks.length > 0 && talks.every((o) => objectiveDone(q, o));
}

export function bark(id: NpcId): boolean {
  const def = npcDef(id);
  const set = def?.barks?.find((b) => check(b.when));
  if (!def || !set?.lines.length) return false;
  toast(`${def.name}: ${set.lines[Math.floor(Math.random() * set.lines.length)]}`, 'info');
  return true;
}

/**
 * npc-anchor interactions from Claude 2: props.npc, or props.landmark → first NPC present there.
 * Any other object `obj:X` opens `dialogue:obj-X` if that dialogue exists (narrative-owned object scenes).
 */
export function installNpcTriggers(): void {
  authBus.on('dialogue:started', ({ npcId }) => { if (npcId && !npcMet(npcId as NpcId)) setFlag(`met.${slug(npcId)}`, true); });
  // trigger zones: `area:X` opens `dialogue:area-X` if it exists (barks, blocked roads, ambushes)
  authBus.on('area:entered', ({ triggerId, playerId }) => {
    const id = `dialogue:area-${triggerId.replace(/^area:/, '')}` as const;
    if (Registry.tryGet('dialogue', id)) openDialogue(id, undefined, playerId);
  });
  authBus.on('interact', ({ objectId, kind, props, playerId }) => {
    if (kind !== 'npc-anchor') {
      const id = `dialogue:obj-${objectId.replace(/^obj:/, '')}` as const;
      // queue (not skip) when another dialogue is up: the interact objective counts either way, so the scene must play
      if (Registry.tryGet('dialogue', id)) openDialogue(id, undefined, playerId);
      return;
    }
    if (typeof props.npc === 'string') { talkTo(props.npc as NpcId, playerId); return; }
    if (typeof props.landmark === 'string') {
      const first = npcsAt(props.landmark)[0];
      if (first) talkTo(first.id, playerId);
    }
  });
}

// ---------- placements for the world's snapshot provider (authority) ----------
let placementCache: Map<string, NpcDef[]> | null = null;
let placementHour = -1;
const invalidate = () => { placementCache = null; };
for (const ev of ['flag:changed', 'quest:started', 'quest:advanced', 'quest:completed', 'quest:failed', 'game:new', 'game:loaded'] as const) authBus.on(ev, invalidate);

/**
 * Every present NPC grouped by the landmark it stands at right now (schedule, else home), evaluated on the
 * authority's (host's) story state. Cached; recomputed after story changes or when the hour turns. Claude 2's
 * authority-side NPC snapshot provider reads this, so co-op guests see the host's NPCs where the host's story puts them.
 */
export function npcPlacements(): ReadonlyMap<string, readonly NpcDef[]> {
  const h = hourNow();
  if (placementCache && h === placementHour) return placementCache;
  placementHour = h;
  placementCache = new Map();
  for (const n of Registry.all('npc') as NpcDef[]) {
    if (!isPresent(n.id)) continue;
    const at = npcLandmark(n.id);
    if (!at) continue;
    const list = placementCache.get(at);
    if (list) list.push(n); else placementCache.set(at, [n]);
  }
  return placementCache;
}

// ---------- the NPCs screen (Claude 1's PeopleScene) ----------
/** true once the player has had any dialogue with this NPC (flag met.<npc-slug>, set on dialogue:started) */
export function npcMet(id: NpcId): boolean {
  return getFlag(`met.${slug(id)}`) === true;
}

/**
 * The NPC's quest state for the card: 'active' when one of their quests is running (or a running quest's current
 * stage wants you to talk to them), 'offer' when they give a quest you could start now, else null.
 */
export function npcQuestInfo(id: NpcId): { state: 'offer' | 'active'; quest: QuestDef } | null {
  for (const q of activeQuests()) {
    if (q.giver === id) return { state: 'active', quest: q };
    if ((currentStage(q)?.objectives ?? []).some((o) => 'talk' in o && o.talk === id)) return { state: 'active', quest: q };
  }
  for (const q of Registry.all('quest') as QuestDef[]) {
    if (q.giver === id && !q.autoStart && !progress(q.id) && check(q.requires)) return { state: 'offer', quest: q };
  }
  return null;
}
