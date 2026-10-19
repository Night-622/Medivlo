/**
 * Encounter Director: attack tokens so the player is never dog-piled (SYSTEMS.md §8.2).
 */
import type { DangerTier } from '@/core';
import { attackTokens } from '../balance';

export type TokenKind = 'melee' | 'ranged';

export class Director {
  private held = { melee: new Set<string>(), ranged: new Set<string>() };
  tier: DangerTier = 1;

  request(id: string, kind: TokenKind, bypass = false): boolean {
    if (bypass) return true;
    const set = this.held[kind];
    if (set.has(id)) return true;
    if (set.size >= attackTokens(this.tier)[kind]) return false;
    set.add(id);
    return true;
  }

  release(id: string): void {
    this.held.melee.delete(id);
    this.held.ranged.delete(id);
  }

  clear(): void {
    this.held.melee.clear();
    this.held.ranged.clear();
  }
}
