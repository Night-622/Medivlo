/**
 * Public narrative API (Claude 4). Scenes and other systems import only from here.
 *
 *   engine/  authority-only, Phaser-free: quests, dialogue, NPCs, codex, conditions, effects, validation
 *   client/  UI glue: overlay scene, HUD tracker, debug console
 *
 * Integration:
 *   - BootScene (Claude 1), after Registry.load():  installNarrative(this.game)
 *     installs the engine where this process is the authority, and the client UI everywhere.
 *     A dedicated server calls installNarrativeAuthority() alone.
 *   - World (Claude 2): spawn NPC sprites with npcsAt(landmarkId) + NpcDef.look, and emit
 *     `interact { kind: 'npc-anchor', props: { npc } }`. Talking is handled here.
 *   - Dialogue emits dialogue:started / dialogue:ended and ui:open / ui:close { panel: 'dialogue' | 'journal' }.
 */
import type Phaser from 'phaser';
import { Services } from '@/core';
import { installNarrativeAuthority } from './engine';
import { installNarrativeClient } from './client';

export * from './engine';
export { installNarrativeAuthority, installNarrativeClient };

export function installNarrative(game: Phaser.Game): void {
  const net = Services.tryGet('net');
  if (!net || net.isAuthority()) installNarrativeAuthority();
  installNarrativeClient(game);
}
