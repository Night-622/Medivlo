/**
 * Runtime service locator. Systems register implementations of core interfaces here
 * so other systems can use them without importing each other's folders.
 */
import type { StatId, WorldQuery } from './types';
import type { NetService } from '@/net/types';
import type { CombatService } from './hc';

/** Implemented by Claude 2. Multi-space world: one WorldQuery per space. */
export interface WorldService {
  query(space: string): WorldQuery;
  spaceOf(playerId: string): string;
  /** last woken waystone (world px, beside it), else the class start area's hub */
  respawnPoint(playerId: string): { space: string; x: number; y: number };
  /** authority: wake a waystone for a player (emits waystone:woken) */
  wakeWaystone(playerId: string, waystoneId: string): void;
  /** where a place is: landmark:, obj:, area:, zone: ids and inst: entrances (Claude 2); null if unknown */
  placePos?(placeId: string): { space: string; x: number; y: number } | null;
  /** where an NPC stands now (authority), e.g. so shop and Runeforge acts need the hero beside the merchant */
  npcPos?(npcId: string): { space: string; x: number; y: number } | null;
}

/** Implemented by Claude 3, registered in createPlayer(). */
export interface StatsService {
  /** HUD bar maxima */
  max(stat: 'maxHp' | 'maxMana' | 'maxStamina'): number;
  /** any computed player stat (tooltips, character sheet) */
  get(stat: StatId): number;
}

/** Implemented by Claude 3 (inventory owner). Anyone who charges or pays gold goes through this. */
export interface EconomyService {
  gold(): number;
  /** Deducts and returns true if affordable; returns false (no change) otherwise. */
  spend(amount: number, reason: string): boolean;
  give(amount: number, reason: string): void;
}

export interface ServiceMap {
  /** WorldQuery for the LOCAL player's current space (kept for existing callers) */
  world: WorldQuery;        // Claude 2
  worlds: WorldService;     // Claude 2 (per-space queries)
  stats: StatsService;      // Claude 3
  economy: EconomyService;  // Claude 3
  combat: CombatService;    // Claude 3 (authority only)
  net: NetService;          // Claude 1 (LocalNet in solo; co-op/public transports later)
  // combat, inventory, quests… added as owners request them
}

const services: Partial<ServiceMap> = {};

export const Services = {
  register<K extends keyof ServiceMap>(key: K, impl: ServiceMap[K]): void { services[key] = impl; },
  get<K extends keyof ServiceMap>(key: K): ServiceMap[K] {
    const s = services[key];
    if (!s) throw new Error(`Service "${key}" not registered`);
    return s;
  },
  tryGet<K extends keyof ServiceMap>(key: K): ServiceMap[K] | undefined { return services[key]; },
};
