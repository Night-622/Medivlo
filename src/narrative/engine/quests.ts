/** Quest engine: stages, objectives, branching, rewards. Owner: Claude 4. */
import { Game, Registry, Services, bus } from '@/core';
import type { ObjectiveDef, QuestDef, QuestId, QuestProgress, QuestStageDef } from '@/core';
import { unlockLore } from './codex';
import { check } from './conditions';
import { applyEffects, emitReward } from './effects';
import { changeRep } from './reputation';
import { authBus, ext, isAuthority, localText, mirrored, nar, toast } from './state';

// ---------- lookups ----------
export function questDef(id: QuestId): QuestDef | undefined {
  return Registry.tryGet('quest', id) as QuestDef | undefined;
}
export function progress(id: QuestId): QuestProgress | undefined {
  return nar().quests[id];
}
export function isActive(id: QuestId): boolean {
  const p = progress(id);
  return !!p && !p.completed && !p.failed;
}
export function activeQuests(): QuestDef[] {
  return Object.keys(nar().quests).filter((id) => isActive(id as QuestId))
    .map((id) => questDef(id as QuestId)).filter((d): d is QuestDef => !!d);
}
export function currentStage(def: QuestDef): QuestStageDef | undefined {
  const p = progress(def.id);
  return p ? def.stages.find((s) => s.id === p.stage) : undefined;
}

// ---------- objective state ----------
export function objectiveTarget(o: ObjectiveDef): number {
  if ('kill' in o || 'collect' in o) return o.count;
  if ('interact' in o) return o.count ?? 1;
  return 1;
}

const isV1Item = (id: string): boolean => id.startsWith('item:');

function inventoryCount(item: string): number {
  return Game.state.player.inventory.items.filter((it) => it.def === item).reduce((a, it) => a + it.qty, 0);
}

/** Current count toward an objective (live for collect/when/reach). */
export function objectiveCount(def: QuestDef, o: ObjectiveDef): number {
  // a co-op guest only knows the counts the host replicated (quest:objective)
  if (mirrored()) return Math.min(objectiveTarget(o), progress(def.id)?.objectives[o.id] ?? 0);
  // v1 Registry items read the inventory; Hollow Crown handoff items (i_*, w_*…) live in client saves, so the
  // authority counts loot:granted to any party member instead (stored like kills)
  if ('collect' in o && isV1Item(o.collect)) return Math.min(o.count, inventoryCount(o.collect));
  if ('when' in o) return check(o.when) ? 1 : 0;
  if ('reach' in o && presence.has(o.reach)) return 1;
  return Math.min(objectiveTarget(o), progress(def.id)?.objectives[o.id] ?? 0);
}

export function objectiveDone(def: QuestDef, o: ObjectiveDef): boolean {
  return objectiveCount(def, o) >= objectiveTarget(o);
}

/** Tracker text, with "(n/N)" for counted objectives. */
export function objectiveText(def: QuestDef, o: ObjectiveDef): string {
  const target = objectiveTarget(o);
  const text = localText(o.text);
  return target > 1 ? `${text} (${objectiveCount(def, o)}/${target})` : text;
}

// ---------- where the player is (for `reach` objectives that are already satisfied) ----------
const presence = new Set<string>();

/** Stages each quest has passed through, in order (narrative.ext.questStages). */
export function stageHistory(): Record<string, string[]> {
  return ext<Record<string, string[]>>('questStages', () => ({}));
}

// ---------- lifecycle ----------
export function startQuest(id: QuestId): void {
  if (!isAuthority() || progress(id)) return;
  const def = questDef(id);
  if (!def) { console.warn(`[quests] unknown quest ${id}`); return; }
  nar().quests[id] = { stage: def.firstStage, objectives: {} };
  if (!nar().trackedQuest || !isActive(nar().trackedQuest as QuestId)) nar().trackedQuest = id;
  bus.emit('quest:started', { questId: id });
  toast(`New quest: ${def.name}`, 'quest');
  enterStage(def, def.firstStage);
}

export function setStage(id: QuestId, stage: string): void {
  const def = questDef(id);
  if (!isAuthority() || !def || !isActive(id)) return;
  enterStage(def, stage);
}

function enterStage(def: QuestDef, stageId: string): void {
  const p = progress(def.id);
  const stage = def.stages.find((s) => s.id === stageId);
  if (!p || !stage) { console.warn(`[quests] ${def.id} has no stage "${stageId}"`); return; }
  p.stage = stageId;
  const hist = (stageHistory()[def.id] ??= []);
  if (hist[hist.length - 1] !== stageId) hist.push(stageId);
  // saves are one cloud document: a quest whose stages loop must not grow its history without bound
  if (hist.length > 32) hist.splice(0, hist.length - 32);
  bus.emit('quest:advanced', { questId: def.id, stage: stageId });
  applyEffects(stage.onEnter, { questId: def.id });
  schedule();
}

/**
 * After a load: a stage that opened its scenes on entry and waits only on flags those scenes set (the final epilogue,
 * some yields) would be stuck if the save was made mid-scene, since open dialogue is not saved. Reopen just its
 * openDialogue effects. Stages that wait on a place, a fight or a talk keep their scene closed (no repeats on every
 * load). Claude 6's trace.
 */
function reopenStageScenes(): void {
  for (const def of activeQuests()) {
    const stage = currentStage(def);
    const scenes = (stage?.onEnter ?? []).filter((e) => 'openDialogue' in e);
    if (!stage || !scenes.length || !stage.objectives.every((o) => 'when' in o)) continue;
    if (stage.objectives.every((o) => objectiveDone(def, o))) continue;
    applyEffects(scenes, { questId: def.id });
  }
}

function completeStage(def: QuestDef, stage: QuestStageDef): void {
  applyEffects(stage.onComplete, { questId: def.id });
  if (!isActive(def.id) || progress(def.id)?.stage !== stage.id) return; // an effect moved it already
  if (stage.end) return finish(def, stage.end.status, stage.end.outcome);
  const next = typeof stage.next === 'string' ? stage.next : stage.next?.find((b) => check(b.when))?.to;
  if (next) enterStage(def, next);
  else finish(def, 'completed');
}

export function completeQuest(id: QuestId, outcome?: string): void {
  const def = questDef(id);
  if (isAuthority() && def && isActive(id)) finish(def, 'completed', outcome);
}

export function failQuest(id: QuestId): void {
  const def = questDef(id);
  if (isAuthority() && def && isActive(id)) finish(def, 'failed');
}

function finish(def: QuestDef, status: 'completed' | 'failed', outcome?: string): void {
  const p = progress(def.id)!;
  if (outcome) p.outcome = outcome;
  if (status === 'failed') {
    p.failed = true;
    bus.emit('quest:failed', { questId: def.id });
    toast(`Quest failed: ${def.name}`, 'quest');
  } else {
    p.completed = true;
    const r = def.reward;
    if (r) {
      const { rep, lore, ...payload } = r;
      if (Object.keys(payload).length) emitReward(def.id, payload);
      for (const x of rep ?? []) changeRep(x.faction, x.delta);
      for (const l of lore ?? []) unlockLore(l);
    }
    bus.emit('quest:completed', { questId: def.id, outcome: p.outcome });
    toast(`Quest complete: ${def.name}`, 'quest');
  }
  if (nar().trackedQuest === def.id) nar().trackedQuest = activeQuests()[0]?.id ?? null;
  schedule();
}

// ---------- evaluation ----------
let evaluating = false;
let dirty = false;

/** Re-check every active quest (and autoStart quests). Re-entrant safe. */
export function schedule(): void {
  if (!Game.hasState) return;
  if (evaluating) { dirty = true; return; }
  evaluating = true;
  try {
    let guard = 0;
    do {
      dirty = false;
      for (const def of Registry.all('quest') as QuestDef[]) {
        if (!progress(def.id) && def.autoStart && check(def.requires)) startQuest(def.id);
      }
      for (const def of activeQuests()) {
        const stage = currentStage(def);
        if (!stage) continue;
        const required = stage.objectives.filter((o) => !o.optional);
        const done = stage.completeWhen === 'any'
          ? required.length === 0 || required.some((o) => objectiveDone(def, o))
          : required.every((o) => objectiveDone(def, o));
        if (done) { completeStage(def, stage); dirty = true; }
      }
    } while (dirty && ++guard < 50);
  } finally {
    evaluating = false;
  }
}

/** Add progress to every active objective matching `match`. */
export function bump(match: (o: ObjectiveDef) => boolean, amount = 1): void {
  for (const def of activeQuests()) {
    const stage = currentStage(def);
    const p = progress(def.id)!;
    for (const o of stage?.objectives ?? []) {
      if (!match(o) || objectiveDone(def, o)) continue;
      p.objectives[o.id] = (p.objectives[o.id] ?? 0) + amount;
      bus.emit('quest:objective', { questId: def.id, objectiveId: o.id, count: objectiveCount(def, o), target: objectiveTarget(o) });
    }
  }
  schedule();
}

/** A beaten creature that did not die (a yielding nemesis) still counts for kill objectives. */
export function countKill(creature: string): void {
  bump((o) => 'kill' in o && o.kill !== null && matchesId(o.kill, creature));
}

function matchesId(pattern: string, id: string): boolean {
  return pattern.endsWith('*') ? id.startsWith(pattern.slice(0, -1)) : pattern === id;
}

/** Stage snapshot at dialogue start: talk objectives only count for the stage that was active then. */
const talkSnapshot = new Map<string, string>();

export function installQuestTriggers(): void {
  // party changes can satisfy objectives (e.g. II-5: the sibling bearer joins as a co-op partner)
  Services.tryGet('net')?.onMembers?.(() => schedule());
  // v1 matches enemyId; Hollow Crown matches the handoff creature id (bx_*), with a trailing '*' as a prefix match
  authBus.on('enemy:killed', ({ enemyId, creature, family, variant }) => bump((o) => 'kill' in o
    && (o.kill === null || o.kill === enemyId || (!!creature && matchesId(o.kill, creature)))
    && (!o.family || o.family === family)
    && (!o.hollowed || variant === 'hollowed')));
  authBus.on('loot:granted', ({ item, qty }) => { if (item && !isV1Item(item)) bump((o) => 'collect' in o && o.collect === item, qty ?? 1); });
  // resting at a rest point counts as using it (e.g. interact: 'obj:brind-goose-bed' for A Warm Bed)
  authBus.on('world:rest', ({ pointId }) => bump((o) => 'interact' in o && matchesId(o.interact, pointId)));
  // bounties are repeatable once per rest (docs/PACING.md): a rest clears every finished bounty, so its board offers it
  // again. Bounties carry no stage effects, only a reward. ext.bountyRuns counts each one's completions.
  authBus.on('world:rest', () => {
    const runs = ext<Record<string, number>>('bountyRuns', () => ({}));
    let reposted = 0;
    for (const [id, p] of Object.entries(nar().quests)) {
      if (!p.completed || questDef(id as QuestId)?.type !== 'bounty') continue;
      runs[id] = (runs[id] ?? 0) + 1;
      delete nar().quests[id];
      delete stageHistory()[id];
      reposted++;
    }
    if (reposted) toast(reposted === 1 ? 'A bounty has been posted again.' : 'The bounty boards have new postings.', 'quest');
  });
  authBus.on('interact', ({ objectId }) => bump((o) => 'interact' in o && matchesId(o.interact, objectId)));
  // record progress before marking presence: bump skips objectives that already count as done, and transient
  // places (areas, waystones) are removed from presence right after
  const reach = (id: string) => { bump((o) => 'reach' in o && o.reach === id); presence.add(id); };
  authBus.on('landmark:entered', ({ landmarkId }) => reach(landmarkId));
  authBus.on('landmark:discovered', ({ landmarkId }) => reach(landmarkId));
  authBus.on('landmark:left', ({ landmarkId }) => presence.delete(landmarkId));
  authBus.on('region:entered', ({ regionId, prevRegionId }) => { if (prevRegionId) presence.delete(prevRegionId); reach(regionId); });
  authBus.on('instance:entered', ({ instanceId }) => reach(instanceId));
  authBus.on('instance:exited', ({ instanceId }) => presence.delete(instanceId));
  authBus.on('area:entered', ({ triggerId }) => { reach(triggerId); presence.delete(triggerId); });
  // Hollow Crown: spaces (realm:*, concordia) and waystones count as places too
  authBus.on('space:changed', ({ from, to }) => { presence.delete(from); reach(to); });
  authBus.on('waystone:woken', ({ waystone }) => { reach(waystone); presence.delete(waystone); });
  authBus.on('dialogue:started', ({ npcId }) => {
    if (!npcId) return;
    talkSnapshot.clear();
    for (const def of activeQuests()) talkSnapshot.set(def.id, progress(def.id)!.stage);
  });
  authBus.on('dialogue:ended', ({ npcId }) => {
    if (!npcId) return;
    const snap = new Map(talkSnapshot);
    bump((o) => 'talk' in o && o.talk === npcId && [...snap].some(([q, st]) => {
      const def = questDef(q as QuestId);
      return progress(q as QuestId)?.stage === st && !!def && currentStage(def)?.objectives.includes(o);
    }));
  });
  authBus.on('item:picked', () => schedule());
  authBus.on('flag:changed', () => schedule());
  authBus.on('enemy:cleansed', () => schedule());
  authBus.on('game:new', () => { presence.clear(); schedule(); });
  authBus.on('game:loaded', () => { presence.clear(); reopenStageScenes(); schedule(); });
}
