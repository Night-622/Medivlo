/**
 * Escorts (Claude 1's contract, core SpawnRequest.escort; Claude 3 runs them). A stage starts one with the effect
 * `{ escort: 'npc:x', to: 'landmark:y', revives?, hp?, fights? }`. Flag `escort.<npc-slug>` tracks it:
 * 'active' → 'arrived' | 'lost'. Objectives wait on the flag; a stage can branch to a retry on 'lost'.
 * While 'active', the NPC’s static placement is hidden (npcs.isPresent), because the escort body is the NPC.
 * Without a world or combat service (headless bots, a bare server), the escort arrives at once. Owner: Claude 4.
 */
import { Game, Services, setFlag } from '@/core';
import type { NpcId } from '@/core';
import { authBus, ext, isAuthority, slug } from './state';
import { npcLandmark } from './npcs';

export interface EscortOrder { escort: NpcId; to: string; revives?: number; hp?: number; fights?: boolean; creature?: string }

type Pos = { space: string; x: number; y: number };
/** Claude 2's resolver (WorldService.placePos): landmark:, obj:, area:, zone: ids and inst: entrances → world px */
type PlaceResolver = { placePos?(id: string): Pos | null };

export const escortFlag = (npc: string): string => `escort.${slug(npc)}`;
const spawned = () => ext<Record<string, string>>('escorts', () => ({}));

export function startEscort(o: EscortOrder): void {
  if (!isAuthority()) return;
  const combat = Services.tryGet('combat');
  const worlds = Services.tryGet('worlds') as PlaceResolver | undefined;
  const from = worlds?.placePos?.(npcLandmark(o.escort) ?? '') ?? null;
  const to = worlds?.placePos?.(o.to) ?? null;
  if (!combat || !from || !to) { setFlag(escortFlag(o.escort), 'arrived'); return; }
  setFlag(escortFlag(o.escort), 'active');
  const id = combat.spawn({
    // Claude 3's neutral non-combatant body; sprite and nameplate come from escort.npc
    creature: o.creature ?? 'bx_escort', level: Game.state.character?.level ?? 1,
    space: from.space, x: from.x, y: from.y, follow: 'party',
    escort: { npc: o.escort, toMarker: { ...to, r: 64 }, revives: o.revives, hp: o.hp, fights: o.fights },
  });
  spawned()[id] = o.escort;
}

export function installEscorts(): void {
  const npcOf = (id: string, npc?: string) => npc ?? spawned()[id];
  authBus.on('escort:arrived', ({ id, npc }) => {
    const n = npcOf(id, npc);
    if (n) setFlag(escortFlag(n), 'arrived');
    delete spawned()[id];
    // the body stands idle after arrival: remove it, and the static NPC is placed again by its schedule
    Services.tryGet('combat')?.despawn(id);
  });
  authBus.on('escort:lost', ({ id, npc }) => {
    const n = npcOf(id, npc);
    if (n) setFlag(escortFlag(n), 'lost');
    delete spawned()[id];
  });
}
