/**
 * Camp / rest banter. When the player rests (`world:rest`, Claude 2), play one unseen banter scene whose
 * entry conditions pass, typically gated on which companions are following and on story flags.
 * Banter scenes are ordinary DialogueDefs whose id starts with `dialogue:banter-`; each plays once.
 * Owner: Claude 4.
 */
import { Registry } from '@/core';
import type { DialogueDef, DialogueId } from '@/core';
import { check } from './conditions';
import { dialogue, openDialogue } from './dialogue';
import { authBus, ext } from './state';

function seen(): string[] {
  return ext<string[]>('banterSeen', () => []);
}

/** Banter scenes that could play right now, in data order. */
export function availableBanter(): DialogueDef[] {
  const done = seen();
  return (Registry.all('dialogue') as DialogueDef[]).filter((d) =>
    d.id.startsWith('dialogue:banter-') && !done.includes(d.id) && d.entries.some((e) => check(e.when)));
}

/** Play the next available banter (if any). Returns the dialogue id played. */
export function playBanter(): DialogueId | null {
  if (dialogue.active) return null;
  const next = availableBanter()[0];
  if (!next || !openDialogue(next.id)) return null;
  seen().push(next.id);
  return next.id;
}

export function installBanter(): void {
  authBus.on('world:rest', () => { playBanter(); });
}
