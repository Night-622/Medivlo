/**
 * Loading / waiting tips (Claude 1 shows them; Claude 4 writes them in src/data/tips/*.ts as
 * `export const TIPS: { text: string; tag?: string }[]`). Key names come from Settings, so a tip may write
 * {key:dash} and it shows the player's actual binding.
 */
import { formatKeys } from '@/core';

export interface Tip { text: string; tag?: string }

const FALLBACK: Tip[] = [
  { text: 'Press {key:dash} to dash through an attack. Dashes recharge over time.', tag: 'combat' },
  { text: 'Drink a health draught with {key:potionQ} before the big hit, not after.', tag: 'combat' },
  { text: 'Wake every waystone you pass. If you fall, you rise at the last one you woke.', tag: 'world' },
  { text: 'Open the Journal with {key:journal} and track a quest to see your next step on the map.', tag: 'quests' },
  { text: 'Invite friends from the pause menu. They keep everything they earn in your world.', tag: 'coop' },
  { text: 'People who trust you sell for less and tell you more.', tag: 'lore' },
];

let all: Tip[] | null = null;
function load(): Tip[] {
  if (all) return all;
  const mods = import.meta.glob<{ TIPS?: Tip[] }>('../../../data/tips/*.ts', { eager: true });
  const found = Object.values(mods).flatMap((m) => m.TIPS ?? []);
  all = found.length ? found : FALLBACK;
  return all;
}

/** A random tip (optionally of one tag), with {key:action} placeholders filled from the player's bindings. */
export function randomTip(tag?: string): string {
  const pool = load().filter((t) => !tag || t.tag === tag);
  const t = (pool.length ? pool : load())[Math.floor(Math.random() * (pool.length || load().length))];
  return formatKeys(t.text);
}
