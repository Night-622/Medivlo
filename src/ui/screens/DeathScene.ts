import Phaser from 'phaser';
import { worldKey } from '@/scenes/worldKey';
import { Game, SceneKeys, Services, bus } from '@/core';
import { bakeBeast } from '@/art';
import { C, randomTip, typeStyle } from '@/ui/kit/hc';
import { SaveService } from '@/firebase/SaveService';
import { defaultOutfit, heroSprite, heroTexture } from '@/scenes/create/heroChoice';

export interface DeathInfo { killer?: string; killerName?: string; line?: string; stats?: [string, string][]; penalty?: string; waystone?: string }

/**
 * "YOU HAVE FALLEN" (handoff › Death). Owner: Claude 1. Launched on player:died for the local player
 * (solo) or party:wiped (co-op). Respawn asks the authority: act { domain:'systems', action:'respawn' }.
 */
export class DeathScene extends Phaser.Scene {
  private info: DeathInfo = {};

  constructor() { super(SceneKeys.Death); }

  init(data: DeathInfo): void { this.info = data ?? {}; }

  create(): void {
    const { width: W, height: H } = this.scale;
    const g = this.add.graphics();
    for (let r = 0; r < 18; r++) g.fillStyle(0x0d0818, 0.05 + r * 0.05).fillRect(0, 0, W, H);
    g.lineStyle(6, 0xb3123f, 0.7).strokeRect(3, 3, W - 6, H - 6);
    this.add.rectangle(0, 0, W, H, 0, 0).setOrigin(0).setInteractive();
    this.add.text(W / 2, 70, 'YOU HAVE FALLEN', { ...typeStyle('displayXL', '#ff3d5a'), fontSize: '96px', stroke: C.ink, strokeThickness: 10, letterSpacing: 6 } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(0.5, 0);
    this.add.text(W / 2, 166, this.info.line ?? 'The black tears take another… but not for long.', typeStyle('bodyL', C.text300)).setOrigin(0.5, 0);

    const p = Game.hasState ? Game.state.player : null;
    const hero = p?.hero;
    if (hero) {
      const tex = heroTexture(this, heroSprite(hero.classId, hero.look, hero.outfit ?? defaultOutfit()));
      if (tex) this.add.image(W / 2 - 120, 400, tex).setOrigin(0.5, 1).setScale(4).setTint(0x8a8aa0).setAlpha(0.55);
      this.add.text(W / 2 - 120, 410, p?.name ?? '', typeStyle('caption', C.text500)).setOrigin(0.5, 0);
    }
    this.add.text(W / 2, 330, '✕', { fontFamily: '"Jersey 10"', fontSize: '40px', color: '#5a2a4a' }).setOrigin(0.5);
    if (this.info.killer) {
      try {
        const key = bakeBeast(this, this.info.killer);
        const s = this.add.sprite(W / 2 + 120, 400, key, 0).setOrigin(0.5, 1).setScale(3);
        s.play(`${key}:idle`);
      } catch { /* unknown creature id: name only */ }
      this.add.text(W / 2 + 120, 410, this.info.killerName ?? this.info.killer.replace(/^bx_/, '').replace(/_/g, ' '), typeStyle('caption', '#ff8a9a')).setOrigin(0.5, 0);
    }
    const stats = this.info.stats ?? [['Level', String((Game.hasState ? Game.state.character?.level : undefined) ?? p?.progression.level ?? 1)], ['Playtime', `${Math.floor((Game.hasState ? Game.state.meta.playtimeSec : 0) / 60)}m`]];
    const sw = 500 / stats.length;
    stats.forEach(([k, v], i) => {
      const x = 390 + i * sw;
      this.add.rectangle(x + 4, 430, sw - 8, 70, 0x171f3d, 0.85).setOrigin(0).setStrokeStyle(2, 0x1a1230);
      this.add.text(x + sw / 2, 444, v, typeStyle('h1', C.gold300)).setOrigin(0.5, 0);
      this.add.text(x + sw / 2, 480, k, typeStyle('badge', C.text500)).setOrigin(0.5, 0);
    });
    this.button(390, 524, 500, `Return to the ${this.info.waystone ?? 'waystone'}`, true, () => this.respawn());
    this.button(390, 584, 246, 'Load last save', false, () => void this.loadLast());
    this.button(644, 584, 246, 'Quit to title', false, () => this.quit());
    this.add.text(W / 2, H - 34, this.info.penalty ?? 'You keep your gear. Unspent Embershards are dropped where you fell.', typeStyle('caption', C.text500)).setOrigin(0.5, 0);
    this.add.text(W / 2, 220, `Tip · ${randomTip('combat')}`, typeStyle('body', C.text300, 720)).setOrigin(0.5, 0).setAlign('center');
    this.input.keyboard!.on('keydown-ENTER', () => this.respawn());
  }

  private button(x: number, y: number, w: number, label: string, gold: boolean, fn: () => void): void {
    const b = this.add.nineslice(x, y, gold ? 'ui:btn_gold' : 'ui:btn_slate', undefined, w, 52, 8, 8, 8, 8).setOrigin(0);
    this.add.text(x + w / 2, y + 26, label, typeStyle('button', gold ? C.ink : C.text)).setOrigin(0.5);
    b.setInteractive({ useHandCursor: true }).on('pointerup', fn)
      .on('pointerover', () => b.setTexture(gold ? 'ui:btn_gold_hover' : 'ui:btn_slate_hover'))
      .on('pointerout', () => b.setTexture(gold ? 'ui:btn_gold' : 'ui:btn_slate'));
  }

  private respawn(): void {
    Services.get('net').send({ type: 'act', domain: 'systems', action: 'respawn', args: {} });
    bus.emit('ui:close', { panel: 'death' });
    this.scene.stop();
  }

  private async loadLast(): Promise<void> {
    const slot = Game.hasState ? Game.state.meta.slot : 0;
    const st = await SaveService.load(slot);
    if (!st) return;
    Game.set(st);
    bus.emit('game:loaded', { slot });
    this.scene.stop();
    const world = worldKey(this);
    this.scene.start(world);
  }

  private quit(): void {
    for (const k of [SceneKeys.HudV2, SceneKeys.Hud, SceneKeys.WorldV2, SceneKeys.World]) if (this.scene.isActive(k)) this.scene.stop(k);
    this.scene.start(SceneKeys.MainMenu);
  }
}
