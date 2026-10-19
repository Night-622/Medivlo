/** NarrativeCondition evaluation. Core variants delegate to core `evalCondition`. Owner: Claude 4. */
import { Game, evalCondition, getFlag, heroClassId } from '@/core';
import type { CmpOp, Condition, NarrativeCondition } from '@/core';
import { heroClass, heroSchool, partyHasClass, partyHasSchool } from './party';
import { getRep } from './reputation';
import { hourNow, nar } from './state';
import { getTrust, trustValue } from './trust';

function cmp(a: number, op: CmpOp, b: number): boolean {
  switch (op) {
    case '==': return a === b;
    case '!=': return a !== b;
    case '>': return a > b;
    case '<': return a < b;
    case '<=': return a <= b;
    default: return a >= b;
  }
}

/** v1 dialogue tags (traits, gear…). The engine stays free of '@/systems': the client installs the provider. */
let tagProvider: () => Iterable<string> = () => [];
export function setTagProvider(fn: () => Iterable<string>): void { tagProvider = fn; }

/** Dialogue tags from the provider, plus the universal v1 'ashmarked'. */
export function playerTags(): Set<string> {
  return new Set(['ashmarked', ...tagProvider()]);
}

export function attribute(stat: string): number {
  const attrs = Game.state.player.progression.attributes as Record<string, number>;
  return attrs[stat] ?? 0;
}

export function check(c: NarrativeCondition | undefined): boolean {
  if (!c) return true;
  const quests = nar().quests;
  if ('all' in c) return (c.all as NarrativeCondition[]).every(check);
  if ('any' in c) return (c.any as NarrativeCondition[]).some(check);
  if ('not' in c) return !check(c.not as NarrativeCondition);
  if ('questActive' in c) {
    const q = quests[c.questActive];
    return !!q && !q.completed && !q.failed;
  }
  // narrative semantics: a stage only "is" the stage while the quest is still running
  // (finished quests keep their last stage id in progress).
  if ('questStage' in c) {
    const q = quests[c.questStage];
    return !!q && !q.completed && !q.failed && q.stage === c.stage;
  }
  if ('questFailed' in c) return !!quests[c.questFailed]?.failed;
  if ('questOutcome' in c) return quests[c.questOutcome]?.outcome === c.outcome;
  if ('stat' in c) return attribute(c.stat) >= c.min;
  if ('classIs' in c) return heroClassId(Game.state) === c.classIs.replace(/^class:/, '');
  if ('dialogueTag' in c) return playerTags().has(c.dialogueTag);
  if ('rep' in c) {
    const v = getRep(c.rep);
    return (c.min === undefined || v >= c.min) && (c.max === undefined || v <= c.max);
  }
  if ('loreUnlocked' in c) return nar().codexUnlocked.includes(c.loreUnlocked);
  // v2 (Hollow Crown)
  if ('trust' in c) return cmp(getTrust(c.trust), c.op ?? '>=', trustValue(c.value));
  if ('heroClass' in c) return heroClass() === c.heroClass.replace(/^class:/, '');
  if ('heroSchool' in c) return heroSchool() === c.heroSchool;
  if ('partyHasClass' in c) return partyHasClass(c.partyHasClass);
  if ('partyHasSchool' in c) return partyHasSchool(c.partyHasSchool);
  if ('insight' in c) return !!getFlag(`insight.${c.insight}`);
  if ('hour' in c) {
    const h = hourNow();
    const [from, to] = c.hour;
    return from <= to ? h >= from && h < to : h >= from || h < to;
  }
  return evalCondition(c as Condition);
}
