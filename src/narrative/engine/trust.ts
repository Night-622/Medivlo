/**
 * NPC trust (Hollow Crown, 07-narrative-systems.md §1). Flag `trust.<npc-slug>`, 0..5:
 * Stranger, Wary, Neutral, Friendly, Trusted, Devoted. ±1 steps clamp to 0..4; only `set` reaches 5.
 * Host state in co-op (flags replicate through flag:changed). Owner: Claude 4.
 */
import { TRUST_LEVELS, getFlag, setFlag } from '@/core';
import type { NpcId, TrustLevel, TrustValue } from '@/core';
import { npcDef } from './npcs';
import { slug, toast } from './state';

export const trustKey = (npc: NpcId | string): string => `trust.${slug(npc)}`;

export function getTrust(npc: NpcId): TrustValue {
  const v = getFlag(trustKey(npc));
  if (typeof v === 'number') return clamp(v, 0, 5);
  return npcDef(npc)?.trust ?? 0;
}

export function trustLevel(v: number): TrustLevel {
  return TRUST_LEVELS[clamp(v, 0, 5)];
}

/** 'friendly' → 3; numbers pass through. */
export function trustValue(v: number | TrustLevel): number {
  return typeof v === 'number' ? v : TRUST_LEVELS.indexOf(v);
}

/** Shop price multiplier for a merchant NPC (Friendly −10%, Trusted/Devoted −20%). */
export function trustPrice(npc: NpcId): number {
  const t = getTrust(npc);
  return t >= 4 ? 0.8 : t >= 3 ? 0.9 : 1;
}

export function changeTrust(npc: NpcId, delta: number): void {
  if (!delta) return;
  const cur = getTrust(npc);
  // Devoted is only reached by `set`; a +1 never pushes past Trusted, and a −1 from Devoted lands on Trusted
  const next = delta > 0 ? (cur >= 4 ? cur : clamp(cur + delta, 0, 4)) : clamp(Math.min(cur, 4) + delta, 0, 4);
  apply(npc, cur, next);
}

export function setTrust(npc: NpcId, value: number): void {
  apply(npc, getTrust(npc), clamp(value, 0, 5));
}

function apply(npc: NpcId, cur: number, next: number): void {
  if (next === cur) return;
  setFlag(trustKey(npc), next);
  const name = npcDef(npc)?.name ?? slug(npc);
  const level = trustLevel(next);
  toast(`${name}: ${level[0].toUpperCase()}${level.slice(1)} ${'◆'.repeat(next)}${'◇'.repeat(5 - next)}`, 'trust');
}

function clamp(v: number, lo: number, hi: number): TrustValue {
  return Math.max(lo, Math.min(hi, Math.round(v))) as TrustValue;
}
