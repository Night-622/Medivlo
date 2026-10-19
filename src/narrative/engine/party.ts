/**
 * Party/campaign queries for the narrative engine. The campaign owner is the authority's save
 * (the host in co-op); party members come from the net session. Owner: Claude 4.
 */
import { Game, Services, classSchool, heroClassId } from '@/core';
import type { SchoolId } from '@/core';

const bare = (id: string | null | undefined): string => (id ?? '').replace(/^class:/, '');

/** The campaign owner's class slug ('arcanist'), i.e. whose story this is. */
export function heroClass(): string {
  // the hero's class lives on player.hero (character creation); core's heroClassId() reads it
  return heroClassId(Game.state) ?? '';
}

export function heroSchool(): SchoolId | undefined {
  return classSchool(heroClass());
}

export interface Member { playerId: string; classId: string; school?: SchoolId; isHost: boolean }

/** Connected party members (solo: just the hero). */
export function members(): Member[] {
  const net = Services.tryGet('net');
  const list = net?.session().members.filter((m) => m.connected) ?? [];
  if (!list.length) return [{ playerId: localPlayer(), classId: heroClass(), school: heroSchool(), isHost: true }];
  // the authority's own player is the campaign owner: its class comes from the save (LocalNet reports '')
  const me = localPlayer();
  return list.map((m) => {
    const classId = m.playerId === me ? heroClass() || bare(m.classId) : bare(m.classId);
    return { playerId: m.playerId, classId, school: classSchool(classId), isHost: m.isHost };
  });
}

export function localPlayer(): string {
  return Services.tryGet('net')?.localPlayer ?? 'local';
}

export function partySize(): number {
  return Services.tryGet('net')?.partySize() ?? 1;
}

export function partyHasClass(classId: string): boolean {
  return members().some((m) => m.classId === bare(classId));
}

export function partyHasSchool(school: SchoolId): boolean {
  return members().some((m) => m.school === school);
}

/** Players allowed to pick a [School] option (everyone when the choice has no school). */
export function allowedFor(school: SchoolId | undefined): string[] | 'all' {
  return school ? members().filter((m) => m.school === school).map((m) => m.playerId) : 'all';
}
