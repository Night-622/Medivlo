import Phaser from 'phaser';
import { Game, SceneKeys, bus } from '@/core';
import { C, alive, typeStyle } from '@/ui/kit/hc';
import { SAVE_SLOTS, SaveService, type SaveSummary } from '@/firebase/SaveService';
import { classDisplay, SCHOOL_NAME } from '@/data/classes/hc';
import { realmOf } from '@/world/hc/spaces';
import { defaultOutfit, heroSprite, heroTexture } from '@/scenes/create/heroChoice';
import { worldKey } from '@/scenes/worldKey';
import { leaveCoop } from '@/net/coop';
import { sim } from '@/net';

/**
 * Load game (no handoff board; built from the kit: Settings frame, slot cards). Owner: Claude 1.
 * Three slots, newest copy of local + cloud. Load, delete (press twice), or start a new hero in an empty slot.
 */
export class LoadScene extends Phaser.Scene {
  private cards!: Phaser.GameObjects.Container;
  private status!: Phaser.GameObjects.Text;
  private armed: number | null = null;
  private saves: (SaveSummary | null)[] = [];
  private from: string = SceneKeys.MainMenu;

  constructor() { super(SceneKeys.Load); }

  private notice = '';
  private cloudReady = true;

  init(data: { from?: string; notice?: string }): void { this.from = data?.from ?? SceneKeys.MainMenu; this.armed = null; this.notice = data?.notice ?? ''; }

  create(): void {
    const { width: W, height: H } = this.scale;
    this.add.rectangle(0, 0, W, H, parseInt(C.bg.slice(1), 16), 0.92).setOrigin(0).setInteractive();
    this.add.text(48, 28, 'Load game', { ...typeStyle('displayL', C.text), shadow: { offsetX: 3, offsetY: 3, color: C.ink, fill: true } });
    const x = this.add.nineslice(W - 92, 28, 'ui:btn_slate', undefined, 44, 44, 8, 8, 8, 8).setOrigin(0);
    this.add.text(W - 70, 50, '✕', typeStyle('button', C.text)).setOrigin(0.5);
    x.setInteractive({ useHandCursor: true }).on('pointerup', () => this.close());
    this.cards = this.add.container(0, 0);
    this.status = this.add.text(W / 2, H - 40, this.notice, typeStyle('body', this.notice ? C.gold : C.text300)).setOrigin(0.5);
    this.input.keyboard!.on('keydown-ESC', () => this.close());
    this.saves = SaveService.listLocal();
    this.cloudReady = !SaveService.cloudEnabled;
    this.render();
    if (SaveService.cloudEnabled) {
      if (!this.notice) this.status.setText('Checking cloud saves…');
      // the screen may be closed, or a slot already loading, by the time the cloud answers
      void SaveService.list().then((s) => {
        if (!alive(this.status) || this.status.text === 'Loading…') return;
        this.cloudReady = true;
        this.saves = s;
        if (!this.notice) this.status.setText('');
        this.render();
      });
    }
  }

  private render(): void {
    this.cards.removeAll(true);
    const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => { this.cards.add(o); return o; };
    for (let slot = 0; slot < SAVE_SLOTS; slot++) {
      const s = this.saves[slot];
      const y = 112 + slot * 180;
      add(this.add.nineslice(190, y, 'ui:panel', undefined, 900, 164, 8, 8, 8, 8).setOrigin(0));
      add(this.add.text(214, y + 18, `SLOT ${slot + 1}`, typeStyle('badge', C.text500)));
      add(this.add.rectangle(214, y + 40, 104, 104, parseInt(C.panel600.slice(1), 16)).setOrigin(0));
      if (!s) {
        add(this.add.text(346, y + 62, 'Empty slot', typeStyle('h1', C.text500)));
        this.button(add, 866, y + 56, 200, 'New hero', true, () => {
          // an "empty" slot may still hold a cloud hero until the cloud list is in
          if (!this.cloudReady) { this.status.setText('Checking cloud saves… one moment').setColor(C.gold); return; }
          this.scene.start(SceneKeys.CharacterCreate, { slot });
        });
        continue;
      }
      if (s.hero) {
        const tex = heroTexture(this, heroSprite(s.hero.classId, s.hero.look, s.hero.outfit ?? defaultOutfit()));
        if (tex) add(this.add.image(266, y + 140, tex).setOrigin(0.5, 1).setScale(3));
      }
      const cls = s.classId ? classDisplay(s.classId) : undefined;
      add(this.add.text(346, y + 40, s.name || 'Unnamed', typeStyle('h1', C.text)));
      add(this.add.text(346, y + 80, cls ? `Lv ${s.level} ${cls.name} · ${SCHOOL_NAME[cls.school]}` : `Lv ${s.level}`, typeStyle('bodyL', cls?.color ?? C.text300)));
      const where = s.space === 'concordia' ? 'Concordia' : s.space ? realmOf(s.space)?.name ?? s.space : 'Not started';
      const hrs = Math.floor(s.playtimeSec / 3600), mins = Math.floor((s.playtimeSec % 3600) / 60);
      add(this.add.text(346, y + 110, `${where} · ${hrs}h ${mins}m played · saved ${ago(s.updatedAt)}`, typeStyle('body', C.text300)));
      add(this.add.text(1066, y + 18, s.where === 'local' ? 'THIS DEVICE' : s.where === 'cloud' ? 'CLOUD' : 'CLOUD + DEVICE', typeStyle('badge', s.where === 'local' ? C.text500 : C.teal)).setOrigin(1, 0));
      this.button(add, 866, y + 44, 200, 'Load', true, () => void this.loadSlot(slot));
      this.button(add, 866, y + 104, 200, this.armed === slot ? 'Really delete?' : 'Delete', false, () => void this.remove(slot), this.armed === slot);
    }
  }

  private button(add: <T extends Phaser.GameObjects.GameObject>(o: T) => T, x: number, y: number, w: number, label: string, gold: boolean, fn: () => void, danger = false): void {
    const b = add(this.add.nineslice(x, y, gold ? 'ui:btn_gold' : 'ui:btn_slate', undefined, w, 48, 8, 8, 8, 8).setOrigin(0));
    add(this.add.text(x + w / 2, y + 24, label, typeStyle('button', gold ? C.ink : danger ? C.danger : C.text)).setOrigin(0.5));
    b.setInteractive({ useHandCursor: true }).on('pointerup', fn)
      .on('pointerover', () => b.setTexture(gold ? 'ui:btn_gold_hover' : 'ui:btn_slate_hover'))
      .on('pointerout', () => b.setTexture(gold ? 'ui:btn_gold' : 'ui:btn_slate'));
  }

  private async loadSlot(slot: number): Promise<void> {
    this.status.setText('Loading…').setColor(C.gold);
    const st = await SaveService.load(slot);
    if (!st) { this.status.setText('That save could not be read').setColor(C.danger); return; }
    Game.set(st);
    bus.emit('game:loaded', { slot });
    if (this.from !== SceneKeys.MainMenu) { this.scene.stop(this.from); leaveCoop(); sim.setPaused(false); }
    for (const k of [SceneKeys.HudV2, SceneKeys.Hud, SceneKeys.WorldV2, SceneKeys.World, SceneKeys.MainMenu]) if (this.scene.isActive(k) || this.scene.isPaused(k)) this.scene.stop(k);
    this.scene.start(worldKey(this));
  }

  private async remove(slot: number): Promise<void> {
    // the hero being played: its next autosave would write the slot straight back
    if (this.from !== SceneKeys.MainMenu && Game.hasState && Game.state.meta.slot === slot) {
      this.status.setText('You\'re playing this hero. Quit to the title to delete it.').setColor(C.danger);
      return;
    }
    if (this.armed !== slot) { this.armed = slot; this.render(); return; }
    this.armed = null;
    await SaveService.remove(slot);
    this.saves[slot] = null;
    this.status.setText(`Slot ${slot + 1} deleted`).setColor(C.text300);
    this.render();
  }

  private close(): void {
    this.scene.stop();
    this.scene.resume(this.from);
  }
}

function ago(t: number): string {
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 90) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(t).toLocaleDateString();
}
