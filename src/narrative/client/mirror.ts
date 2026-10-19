/**
 * Co-op guest journal mirror (07-narrative-systems.md §4, 05 co-op rules). The host's narrative state arrives
 * once on join through net.addStateSync('narrative'), then replicated quest/codex/flag events keep it current.
 * On a guest, nar() reads this mirror, so the journal and tracker show the host's story. Guests still keep what
 * is theirs: codex unlocks go into their own save too, and portable quests the host completes are completed in
 * the guest's own save if they had them active or not yet done there. Owner: Claude 4.
 */
import { Game, Registry, Services, bus } from '@/core';
import type { FlagValue, NarrativeState, QuestDef } from '@/core';
import { setNarrativeSource } from '../engine/state';

interface Synced { narrative: Pick<NarrativeState, 'quests' | 'codexUnlocked' | 'trackedQuest'>; flags: Record<string, FlagValue> }

const mirror: NarrativeState = { quests: {}, trackedQuest: null, codexUnlocked: [], reputation: {}, ext: {} };
/** host flags (trust, story, insight…) for guest-side display */
export const hostFlags: Record<string, FlagValue> = {};

let installed = false;

export function installNarrativeMirror(): void {
  const net = Services.tryGet('net');
  if (installed || !net) return;
  installed = true;
  net.addStateSync({
    name: 'narrative',
    // host side: what a joining guest needs for its journal
    collect: (): Synced => ({
      narrative: { quests: Game.state.narrative.quests, codexUnlocked: Game.state.narrative.codexUnlocked, trackedQuest: Game.state.narrative.trackedQuest },
      flags: Game.state.flags,
    }),
    // guest side
    apply: (state: unknown) => {
      if (net.isAuthority()) return;
      const s = state as Synced;
      mirror.quests = structuredClone(s.narrative.quests);
      mirror.codexUnlocked = [...s.narrative.codexUnlocked];
      mirror.trackedQuest = s.narrative.trackedQuest;
      Object.assign(hostFlags, s.flags);
      for (const id of mirror.codexUnlocked) keepCodex(id);
      setNarrativeSource(() => mirror);
      bus.emit('quest:advanced', { questId: mirror.trackedQuest ?? 'quest:none', stage: '' }); // nudge the UI to redraw
    },
  });

  // switching roles: a new guest reads an empty mirror until the host's sync lands; back to authority reads its own save
  bus.on('net:changed', () => {
    if (net.isAuthority()) { setNarrativeSource(null); clearMirror(); return; }
    clearMirror();
    setNarrativeSource(() => mirror);
    bus.emit('quest:advanced', { questId: 'quest:none', stage: '' }); // redraw journal and tracker
  });

  // incremental updates (replicated events arrive on a guest's bus; the host ignores them here)
  const guest = () => !net.isAuthority();
  bus.on('quest:started', ({ questId }) => {
    if (!guest()) return;
    const def = Registry.tryGet('quest', questId) as QuestDef | undefined;
    mirror.quests[questId] = { stage: def?.firstStage ?? '', objectives: {} };
  });
  bus.on('quest:advanced', ({ questId, stage }) => {
    if (!guest() || !stage) return;
    const p = (mirror.quests[questId] ??= { stage, objectives: {} });
    p.stage = stage;
    p.objectives = {};
  });
  bus.on('quest:objective', ({ questId, objectiveId, count }) => {
    if (!guest()) return;
    const p = mirror.quests[questId];
    if (p) p.objectives[objectiveId] = count;
  });
  bus.on('quest:completed', ({ questId, outcome }) => {
    if (!guest()) return;
    const p = (mirror.quests[questId] ??= { stage: '', objectives: {} });
    p.completed = true;
    p.outcome = outcome;
    keepPortable(questId, outcome);
  });
  bus.on('quest:failed', ({ questId }) => {
    if (!guest()) return;
    const p = mirror.quests[questId];
    if (p) p.failed = true;
  });
  bus.on('codex:unlocked', ({ entryId }) => {
    if (!guest()) return;
    if (!mirror.codexUnlocked.includes(entryId)) mirror.codexUnlocked.push(entryId);
    keepCodex(entryId);
  });
  bus.on('flag:changed', ({ key, value }) => {
    if (!guest()) return;
    if (value === undefined) delete hostFlags[key];
    else hostFlags[key] = value;
  });
}

function clearMirror(): void {
  mirror.quests = {};
  mirror.codexUnlocked = [];
  mirror.trackedQuest = null;
  for (const k of Object.keys(hostFlags)) delete hostFlags[k];
}

/** guests keep codex entries in their own save */
function keepCodex(id: string): void {
  const own = Game.state.narrative.codexUnlocked;
  if (!own.includes(id)) own.push(id);
}

/** portable quests: completing one in the host's world completes it in the guest's own save */
function keepPortable(questId: string, outcome?: string): void {
  const def = Registry.tryGet('quest', questId) as QuestDef | undefined;
  if (!def?.portable) return;
  const own = Game.state.narrative.quests;
  if (own[questId]?.completed) return;
  own[questId] = { stage: def.stages[def.stages.length - 1]?.id ?? '', objectives: {}, completed: true, outcome };
}
