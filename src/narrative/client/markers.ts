/**
 * Quest markers (Claude 4; Claude 2 resolves and draws them on the minimap and map). Every open objective of every
 * active quest's current stage, as a place id Claude 2's markerAt()/placePos() resolve, tracked quest first. Phaser-free.
 * Reads the engine's nar(): on a co-op guest that is the host's mirror, so the markers follow the host's story.
 * Recompute on quest:started / advanced / objective / completed / failed, flag:changed and ui:close.
 */
import { Game } from '@/core';
import type { ObjectiveDef, QuestDef } from '@/core';
import { bossLair as worldBossLair } from '@/world/hc/instanceGen';
import { campaign } from '../engine/classes';
import { heroClass } from '../engine/party';
import { activeQuests, currentStage, objectiveDone, objectiveTarget, objectiveText } from '../engine/quests';
import { mirrored, nar } from '../engine/state';
import { hostFlags } from './mirror';

/** the campaign's class: the host's on a co-op guest (the engine-derived campaign.class flag, mirrored) */
function campaignClass(): string {
  if (mirrored()) return String(hostFlags['campaign.class'] ?? '');
  return Game.hasState ? heroClass() : ''; // no game (tools, title screen): skip the lair lookup rather than throw
}

/**
 * A lair boss lives in its class's lair (Claude 2's bossLair over lairBoss: lair 1 the realm mini, 2 the lair-2 boss, 3 the nemesis),
 * so its kill points at that lair: 'inst:<school>-<side>-lair-<n>' (the door from outside, the arena inside).
 */
export function bossLair(creature: string, cls: string): string | null {
  const c = campaign(cls);
  return c ? worldBossLair(creature, c.school, c.side, c.id) : null;
}

export interface QuestMarker {
  quest: string;
  objective: string;
  /** the tracked quest's objectives (gold); the rest are drawn quieter */
  tracked: boolean;
  /** side quest or bounty (teal) */
  side: boolean;
  /** landmark: / obj: / inst: / area: / zone: / region: / vil: id, or npc:<id> for talk objectives (resolve live) */
  place: string;
  /** the objective text, with its count (map tooltip) */
  label: string;
  /** turnin: talk to the quest's giver; area: a zone, area, region or village; objective: everything else */
  kind: 'objective' | 'turnin' | 'area';
}

const AREA = /^(region|zone|area|vil):/;
const markerIsArea = (o: ObjectiveDef): boolean => {
  const m = o.marker as { landmark?: string; region?: string; place?: string } | undefined;
  return !!m && (!!m.region || AREA.test(m.place ?? ''));
};

/** Where an objective points, as place ids (several for a prefix object objective), or none. `cls`: the campaign's class. */
export function objectivePlaces(o: ObjectiveDef, cls: string = campaignClass()): string[] {
  if ('kill' in o && typeof o.kill === 'string') { const lair = bossLair(o.kill, cls); if (lair) return [lair]; }
  // a talk or a single object is pointed at directly, even when the data gives an area marker (it was drawn on the
  // zone centre, ten tiles off). Area markers stay for `reach` finds and multi-clue searches, where the vagueness is
  // the point (style guide §8 "find").
  if ('talk' in o) return [o.talk];
  if ('interact' in o && !o.interact.endsWith('*') && (!o.marker || markerIsArea(o))) return [o.interact];
  if (o.marker) {
    const m = o.marker as { landmark?: string; region?: string; place?: string };
    const id = m.landmark ?? m.region ?? m.place;
    if (id) return [id];
  }
  if ('reach' in o) return [o.reach.replace(/^instance:/, 'inst:')];
  if ('interact' in o) {
    if (!o.interact.endsWith('*')) return [o.interact];
    const base = o.interact.slice(0, -1), n = objectiveTarget(o);
    return Array.from({ length: n }, (_, i) => `${base}${i + 1}`);
  }
  return [];
}

/**
 * For an objective with no place of its own (a boss kill, a flag): where the story last sent the hero. Another objective
 * of the same stage, else the nearest earlier stage that had a place (a lair boss follows "enter the lair", so it points
 * at the lair door), else the quest's region.
 */
export function fallbackPlace(def: QuestDef, stageId: string): string | null {
  const at = def.stages.findIndex((s) => s.id === stageId);
  for (let i = at; i >= 0; i--) {
    for (const o of def.stages[i].objectives) { const p = objectivePlaces(o)[0]; if (p) return p; }
  }
  return def.region ?? null;
}

export function questMarkers(): QuestMarker[] {
  const tracked = nar().trackedQuest;
  const out: QuestMarker[] = [];
  const quests = activeQuests().sort((a, b) => rank(a, tracked) - rank(b, tracked));
  for (const def of quests) {
    const stage = currentStage(def);
    if (!stage) continue;
    for (const o of stage.objectives) {
      if (o.hidden || objectiveDone(def, o)) continue;
      const label = objectiveText(def, o);
      const own = objectivePlaces(o);
      const places = own.length ? own : [fallbackPlace(def, stage.id)].filter((p): p is string => !!p);
      for (const place of places) {
        const kind = 'talk' in o && o.talk === def.giver ? 'turnin' : AREA.test(place) ? 'area' : 'objective';
        out.push({ quest: def.id, objective: o.id, tracked: def.id === tracked, side: def.type === 'side' || def.type === 'bounty', place, label, kind });
      }
    }
  }
  return out;
}

/** the tracked quest first, then main / class quests, then sides and bounties; First Steps last */
function rank(def: QuestDef, tracked: string | null): number {
  if (def.id === tracked) return 0;
  if (def.chapter === 'tutorial') return 3;
  return def.type === 'side' || def.type === 'bounty' ? 2 : 1;
}
