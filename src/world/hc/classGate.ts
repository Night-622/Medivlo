/**
 * Class story objects (pure): an object one campaign's quests use is usable only in that campaign's world, so
 * other classes' objects never take the [F] focus. `campaign.class` is the campaign owner's class, derived by the
 * narrative engine on the authority and replicated (Claude 4), so host and guests agree. The table is generated
 * from the quest data (tools/playthrough/classObjects.ts).
 */
import type { FlagCond, WorldObject } from '@/core';
import { CLASS_OBJECTS } from '@/data/regions/hc/classObjects.gen';

const GATED = new Set<WorldObject['kind']>(['interactable', 'sign', 'lore', 'lever']);

/** The object with its class gate added (combined with any `when` it already has). */
export function classGated(o: WorldObject): WorldObject {
  const who = GATED.has(o.kind) ? CLASS_OBJECTS[o.id] : undefined;
  if (!who) return o;
  const mine: FlagCond = who.length === 1 ? { flag: 'campaign.class', value: who[0] } : { any: who.map((c) => ({ flag: 'campaign.class', value: c })) };
  return { ...o, when: o.when ? { all: [o.when, mine] } : mine };
}
