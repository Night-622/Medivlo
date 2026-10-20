/**
 * Onboarding (Claude 1's brief), client side. Two parts:
 * - First Steps: ticks `tut.<step>` from real input, so each class's First Steps quest (data/quests/hc-first-steps.ts)
 *   checks itself off. Steps only count on the authority (solo or host: guests play the host's story).
 * - One-time contextual hints as info toasts, remembered as `hint.<id>` flags in this player's own save.
 * Everything respects Settings.get().showHints, and key names always come from the player's bindings. Owner: Claude 4.
 */
import { Game, Services, Settings, bus, getFlag, setFlag } from '@/core';
import type { Action } from '@/core';
import type { TutorialStep } from '@/data/quests/hc-first-steps';
import { isAuthority } from '../engine/state';
import { dialogueClient } from './dialogueClient';
import { formatKeys } from './keys';
import { isAction } from '@/ui/kit/hc/keys';

const me = (): string => Services.tryGet('net')?.localPlayer ?? 'local';
const mine = (id?: string): boolean => !id || id === me();
const hintsOn = (): boolean => Settings.get().showHints;

/** a First Steps step is done (also called by the journal when a quest is tracked) */
export function markTutorial(s: TutorialStep): void {
  // keys and events arrive on the title and creation screens too, before any game is loaded
  if (!Game.hasState || !isAuthority() || getFlag('tut.on') !== true || getFlag('story.gate_open')) return;
  if (!getFlag(`tut.${s}`)) setFlag(`tut.${s}`, true);
}

/** a one-time hint; `{key:<action>}` tokens show this player's bindings */
export function hint(id: string, text: string): void {
  if (!Game.hasState || !hintsOn() || getFlag(`hint.${id}`)) return;
  setFlag(`hint.${id}`, true);
  // local: a hint is this player's own (their save's hint flag, their key bindings), so the host never replicates it
  bus.emit('narrative:toast', { text: formatKeys(text), kind: 'info', local: true });
}

export const HINTS = {
  enemy: 'Enemies close. Attack with a click or {key:cast1}–{key:cast4}; {key:dash} gets you out of the red warning zones.',
  loot: 'Loot. Open your Pack with {key:inventory} to look it over and equip it.',
  scroll: 'A spell scroll. Read it for one free cast; your spells and their slots are in Spells ({key:spells}).',
  levelup: 'Level up! Spend your new points in Skills ({key:skills}).',
  trust: 'Trust grows. The diamonds by a name show how far someone trusts you; trusted friends offer more, and ask more.',
  death: 'You fell. You rise again at the last waystone you woke, so wake every one you pass ({key:interact}).',
  vote: 'Party vote: everyone picks. The majority decides, and the host breaks a tie.',
  gate: 'A realm gate. Its guardian holds the way out of the realm. Beat it, then break the seal ({key:interact}).',
} as const;

const KEY_STEPS: [Action[], TutorialStep][] = [
  [['up', 'down', 'left', 'right'], 'move'],
  [['dash'], 'dash'],
  [['cast1', 'cast2', 'cast3', 'cast4'], 'attack'],
  [['potionQ', 'potionE'], 'potion'],
  [['inventory'], 'pack'],
];

let installed = false;

export function installTutorial(): void {
  if (installed) return;
  installed = true;
  // a new game with hints on runs First Steps (old saves and hint-off players never see it)
  bus.on('game:new', () => { if (Game.hasState && isAuthority() && hintsOn()) setFlag('tut.on', true); });
  // switching hints off closes First Steps (its hidden objective watches tut.skip)
  bus.on('settings:changed', ({ key }) => {
    if ((key === 'showHints' || key === 'all') && Game.hasState && !hintsOn() && isAuthority() && getFlag('tut.on') === true) setFlag('tut.skip', true);
  });

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (ev) => {
      const t = ev.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      // in a conversation, Space continues and 1–4 pick choices: those presses are not a dash or an attack
      if (dialogueClient.active) return;
      // the player's own bindings (Claude 1's helper: bindings are Phaser KeyCodes names, matched by key code)
      for (const [actions, s] of KEY_STEPS) if (actions.some((a) => isAction(ev, a))) markTutorial(s);
    });
  }
  bus.on('combat:hit', ({ sourceId, kind }) => { if (sourceId === me() && kind !== 'heal') markTutorial('attack'); });
  bus.on('ability:cast', ({ casterId }) => { if (casterId === me()) markTutorial('attack'); });
  bus.on('item:used', ({ playerId }) => { if (mine(playerId)) markTutorial('potion'); });
  bus.on('ui:open', ({ panel }) => { if (panel === 'inventory' || panel === 'pack') markTutorial('pack'); });
  bus.on('dialogue:ended', ({ npcId, initiator }) => { if (npcId && mine(initiator)) markTutorial('talk'); });
  bus.on('waystone:woken', ({ playerId }) => { if (mine(playerId)) markTutorial('waystone'); });

  // contextual hints
  bus.on('combat:engaged', () => hint('enemy', HINTS.enemy));
  bus.on('loot:granted', ({ playerId, item }) => {
    if (!mine(playerId) || !item) return;
    hint(item.startsWith('i_scroll') ? 'scroll' : 'loot', item.startsWith('i_scroll') ? HINTS.scroll : HINTS.loot);
  });
  bus.on('item:picked', ({ playerId, def }) => {
    if (!mine(playerId)) return;
    if (String(def).startsWith('i_scroll')) hint('scroll', HINTS.scroll);
    else hint('loot', HINTS.loot);
  });
  bus.on('player:levelup', ({ playerId }) => { if (mine(playerId)) hint('levelup', HINTS.levelup); });
  bus.on('flag:changed', ({ key, value, prev }) => {
    if (key.startsWith('trust.') && typeof value === 'number' && value > (typeof prev === 'number' ? prev : 0)) hint('trust', HINTS.trust);
    if (key === 'story.gate_fight' && value === true) hint('gate', HINTS.gate);
  });
  bus.on('player:died', ({ playerId }) => { if (mine(playerId)) hint('death', HINTS.death); });
  Services.tryGet('net')?.on('vote:open', () => hint('vote', HINTS.vote));
}
