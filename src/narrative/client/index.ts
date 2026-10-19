/**
 * Narrative client (Claude 4): UI glue. Registers the NarrativeUi overlay scene and mounts the
 * quest tracker into the HUD's anchors.rightColumn whenever the HUD starts.
 */
import Phaser from 'phaser';
import { Game, SceneKeys } from '@/core';
import { activeDialogueTags } from '@/systems';
import { NARRATIVE_UI_KEY, NarrativeUiScene } from '@/ui/narrative/NarrativeUiScene';
import { QuestTracker } from '@/ui/narrative/QuestTracker';
import { setTagProvider } from '../engine/conditions';
import { setLocalFormatter } from '../engine/state';
import { installDebug } from './debug';
import { dialogueClient } from './dialogueClient';
import { formatKeys } from './keys';
import { installNarrativeMirror } from './mirror';
import { installTutorial } from './tutorial';
import { installHcValidationSource } from './validationSources';

let installed = false;

export function installNarrativeClient(game: Phaser.Game): void {
  if (installed) return;
  installed = true;
  // v1 trait/gear dialogue tags (Claude 3's helper); the engine itself never imports '@/systems'
  setTagProvider(() => activeDialogueTags(Game.state));
  installDebug();
  dialogueClient.install();
  installHcValidationSource();
  installNarrativeMirror();
  // per-device key names in objective text, and the onboarding steps and hints
  setLocalFormatter(formatKeys);
  installTutorial();
  game.scene.add(NARRATIVE_UI_KEY, NarrativeUiScene, false);
  // mount on whichever HUD runs (HudV2 is the handoff HUD; the v1 Hud stays until it is retired)
  let mounted = 0;
  for (const key of [SceneKeys.HudV2, SceneKeys.Hud]) {
    const hud = game.scene.getScene(key) as (Phaser.Scene & { anchors?: Record<string, Phaser.GameObjects.Container> }) | null;
    if (!hud) continue;
    mounted++;
    hud.events.on(Phaser.Scenes.Events.CREATE, () => {
      (hud.anchors?.rightColumn ?? hud.anchors?.topLeft)?.add(new QuestTracker(hud));
      game.scene.run(NARRATIVE_UI_KEY);
      game.scene.bringToTop(NARRATIVE_UI_KEY);
    });
    hud.events.on(Phaser.Scenes.Events.SHUTDOWN, () => game.scene.stop(NARRATIVE_UI_KEY));
  }
  if (!mounted) console.warn('[narrative] no HUD scene found; tracker not mounted');
}
