import Phaser from 'phaser';
import { SceneKeys } from '@/core';
import { C, typeStyle } from '@/ui/kit/hc';

const SECTIONS: [string, string[]][] = [
  ['THE HOLLOW CROWN', ['A pixel-art action RPG of twenty-four heroes, twelve schools and one hollow king.']],
  ['DESIGN', ['Art direction, UI kit, bestiary, tiles and screens: the Medival design handoff', 'Created with Claude Design']],
  ['BUILT BY', ['Claude 1 · core, network, art pipeline, interface', 'Claude 2 · world, map and exploration', 'Claude 3 · combat, classes and builds', 'Claude 4 · lore, quests, dialogue and the people of the realms', 'Claude 5 · story depth, proofreading and story tests']],
  ['TYPE', ['Jersey 10 and Pixelify Sans, SIL Open Font License 1.1']],
  ['ENGINE AND SERVICES', ['Phaser 3 (MIT) · Firebase · Google Cloud Run · Vite · TypeScript']],
  ['THANK YOU', ['for playing.']],
];

/** Credits (title footer link). Owner: Claude 1. Scrolls slowly; Esc, click or Enter closes. */
export class CreditsScene extends Phaser.Scene {
  constructor() { super(SceneKeys.Credits); }

  create(): void {
    const { width: W, height: H } = this.scale;
    this.add.rectangle(0, 0, W, H, parseInt(C.bg.slice(1), 16), 0.95).setOrigin(0).setInteractive().on('pointerup', () => this.close());
    const roll = this.add.container(0, H);
    let y = 0;
    for (const [head, lines] of SECTIONS) {
      roll.add(this.add.text(W / 2, y, head, { ...typeStyle(head === 'THE HOLLOW CROWN' ? 'displayL' : 'h2', head === 'THE HOLLOW CROWN' ? C.gold : C.gold300), letterSpacing: 3 } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(0.5, 0));
      y += head === 'THE HOLLOW CROWN' ? 72 : 44;
      for (const l of lines) { roll.add(this.add.text(W / 2, y, l, typeStyle('bodyL', C.text, 900)).setOrigin(0.5, 0).setAlign('center')); y += 30; }
      y += 48;
    }
    const end = -(y - H / 2);
    this.tweens.add({ targets: roll, y: end, duration: (H - end) * 28, ease: 'Linear' });
    // footer band drawn over the roll, so the hint never sits on a rolling line
    this.add.rectangle(0, H - 56, W, 56, parseInt(C.bg.slice(1), 16), 1).setOrigin(0);
    this.add.text(W / 2, H - 28, 'Esc to close', typeStyle('caption', C.text500)).setOrigin(0.5);
    this.input.keyboard!.on('keydown-ESC', () => this.close());
    this.input.keyboard!.on('keydown-ENTER', () => this.close());
  }

  private close(): void {
    this.scene.stop();
    this.scene.resume(SceneKeys.MainMenu);
  }
}
