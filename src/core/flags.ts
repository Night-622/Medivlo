/** Flag read/write and condition evaluation. Always set flags through here so `flag:changed` fires. */
import { Game } from './GameState';
import { bus } from './EventBus';
import type { Condition, FlagValue } from './types';

export function getFlag(key: string): FlagValue | undefined {
  return Game.state.flags[key];
}

export function setFlag(key: string, value: FlagValue | undefined): void {
  const flags = Game.state.flags;
  const prev = flags[key];
  if (prev === value) return;
  if (value === undefined) delete flags[key];
  else flags[key] = value;
  bus.emit('flag:changed', { key, value, prev });
}

export function evalCondition(cond: Condition | undefined): boolean {
  if (!cond) return true;
  const s = Game.state;
  if ('all' in cond) return cond.all.every((c) => evalCondition(c));
  if ('any' in cond) return cond.any.some((c) => evalCondition(c));
  if ('not' in cond) return !evalCondition(cond.not);
  if ('flag' in cond) {
    const v = s.flags[cond.flag];
    // { flag, value } with no op means equality (238 data conditions are written this way); { flag } alone = truthy
    if (!('op' in cond)) return 'value' in cond ? v === (cond as { value: unknown }).value : !!v;
    switch (cond.op) {
      case '==': return v === cond.value;
      case '!=': return v !== cond.value;
      case '>=': return typeof v === 'number' && typeof cond.value === 'number' && v >= cond.value;
      case '<=': return typeof v === 'number' && typeof cond.value === 'number' && v <= cond.value;
    }
  }
  // level and items live on the systems character (core/hc CharacterSave); the old player slices are read only when a state has no character
  if ('minLevel' in cond) return (s.character?.level ?? s.player.progression.level) >= cond.minLevel;
  if ('hasItem' in cond) {
    const n = s.character
      ? s.character.inventory.filter((it) => it.base === cond.hasItem).reduce((a, it) => a + it.qty, 0)
      : s.player.inventory.items.filter((it) => it.def === cond.hasItem).reduce((a, it) => a + it.qty, 0);
    return n >= (cond.count ?? 1);
  }
  if ('questStage' in cond) {
    // matches only while the quest is active (same semantics as src/narrative)
    const q = s.narrative.quests[cond.questStage];
    return !!q && !q.completed && !q.failed && q.stage === cond.stage;
  }
  if ('questCompleted' in cond) return !!s.narrative.quests[cond.questCompleted]?.completed;
  return false;
}
