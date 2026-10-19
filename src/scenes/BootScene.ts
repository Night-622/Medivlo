import Phaser from 'phaser';
import { SaveService } from '@/firebase/SaveService';
import { Game, Registry, SceneKeys, Services, createNewGameState } from '@/core';
import { Theme, rectTexture, circleTexture } from '@/ui/kit';
import { LocalNet, NetSwitch, sim } from '@/net';
import { installNarrative, validateContent } from '@/narrative';
import { createCharacterAnims, indexAtlas, mvReady, queueAtlas, type Atlas } from '@/art';

/**
 * Loads the handoff art (atlas sheets + MV art libraries), content and services, then shows the main menu.
 * Other scenes can rely on: textures "<group>:<key>" from public/art/atlas.json, character anims
 * "<group>:<key>:idle|walk", the atlas at `this.cache.json.get('atlas')`, and window.MV being ready.
 */
export class BootScene extends Phaser.Scene {
  constructor() { super(SceneKeys.Boot); }

  preload(): void {
    this.add.text(this.scale.width / 2, this.scale.height / 2, 'Loading…', { fontFamily: Theme.font.body, fontSize: '20px', color: Theme.css.textDim }).setOrigin(0.5);
    this.load.json('atlas', 'art/atlas.json');
    this.load.json('tokens', 'art/tokens.json');
    this.load.once('filecomplete-json-atlas', (_key: string, _type: string, data: Atlas) => queueAtlas(this, data));
  }

  create(): void {
    SaveService.wipeLegacyLocal();
    Registry.load();
    // Solo authority until a co-op/public transport replaces it (docs/REBUILD.md § Network architecture).
    // One NetSwitch for the whole run; co-op / realms swap the transport under it (src/net/NetSwitch.ts).
    if (!Services.tryGet('net')) Services.register('net', new NetSwitch(new LocalNet(`local-${crypto.randomUUID().slice(0, 8)}`, 'Wanderer', '', 1)));
    sim.attach(Services.get('net'));
    installNarrative(this.game);
    if (import.meta.env.DEV) {
      const problems = validateContent();
      if (problems.length) console.warn(`[content] ${problems.length} problem(s):\n  ` + problems.join('\n  '));
    }
    rectTexture(this, 'px', 1, 1, 0xffffff, false);
    circleTexture(this, 'dot', 4, 0xffffff);
    const atlas = this.cache.json.get('atlas') as Atlas;
    indexAtlas(atlas);
    createCharacterAnims(this, atlas);
    mvReady()
      .catch((e) => console.error('[art]', e))
      .finally(() => this.startFirstScene());
  }

  private startFirstScene(): void {
    // Dev shortcut: ?scene=CharacterCreate opens a scene directly (World needs a GameState, so one is created).
    const jump = import.meta.env.DEV ? new URLSearchParams(location.search).get('scene') : null;
    if (jump && Object.values(SceneKeys).includes(jump as never)) {
      if (!Game.hasState) Game.set(createNewGameState(0));
      this.scene.start(jump, JSON.parse(new URLSearchParams(location.search).get('data') ?? '{}'));
      return;
    }
    this.scene.start(SceneKeys.MainMenu);
  }
}
