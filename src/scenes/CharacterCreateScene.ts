import Phaser from 'phaser';
import { worldKey } from '@/scenes/worldKey';
import { Game, SceneKeys, bus, createNewGameState } from '@/core';
import { C, typeStyle } from '@/ui/kit/hc';
import { classDisplay, HC_CLASS_DISPLAY } from '@/data/classes/hc';
import { mv, addCanvasSheet } from '@/art';
import { SaveService } from '@/firebase/SaveService';
import { ClassList } from './create/ClassList';
import { OptionPanel } from './create/OptionPanel';
import { LOOK, applyBodyRules, defaultLook, defaultOutfit, heroSprite, type HeroChoice, type HeroLookV2, type HeroOutfit } from './create/heroChoice';

const NAMES = ['Wren', 'Aldric', 'Isolde', 'Bram', 'Tamsin', 'Corin', 'Maelis', 'Oswin', 'Hedda', 'Rhodri', 'Ysolt', 'Garreth'];

/**
 * Character creation for The Hollow Crown (handoff › Characters). Owner: Claude 1.
 * 24 classes · body · look · outfit · name. Begin saves the choice into GameState.player.hero and starts the game.
 */
export class CharacterCreateScene extends Phaser.Scene {
  private slot = 0;
  private hc!: HeroChoice;
  /** per-class remembered looks/outfits so switching classes doesn't lose edits */
  private looks = new Map<string, { look: HeroLookV2; outfit: HeroOutfit }>();
  private list!: ClassList;
  private panel!: OptionPanel;
  private preview?: Phaser.GameObjects.Sprite;
  private titleT!: Phaser.GameObjects.Text;
  private epithetT!: Phaser.GameObjects.Text;
  private glow!: Phaser.GameObjects.Graphics;
  private ctl!: Phaser.GameObjects.Container;
  private nameT!: Phaser.GameObjects.Text;
  private anim: 'idle' | 'walk' = 'idle';
  private flip = false;
  private caret = true;
  /** the hero as the screen opened: leaving unchanged needs no confirm */
  private initial = '';
  private confirm: Phaser.GameObjects.Container | null = null;

  constructor() { super(SceneKeys.CharacterCreate); }

  init(data: { slot?: number }): void {
    this.slot = data.slot ?? 0;
    const first = HC_CLASS_DISPLAY[0]?.id ?? 'warden';
    this.hc = { classId: first, name: Phaser.Utils.Array.GetRandom(NAMES), look: defaultLook(first), outfit: defaultOutfit() };
    this.looks.clear();
    this.initial = JSON.stringify(this.hc);
    this.confirm = null;
  }

  create(): void {
    const { width: W, height: H } = this.scale;
    this.add.rectangle(0, 0, W, H, parseInt(C.bg.slice(1), 16)).setOrigin(0);
    this.add.text(48, 24, 'Choose your hero', { ...typeStyle('displayL', C.text), stroke: C.ink, strokeThickness: 6 });
    this.add.text(48, 86, 'Twelve schools, with two classes in each. Six schools use magic and six use plain skill and steel.', typeStyle('body', C.text300));

    this.glow = this.add.graphics();
    this.drawPedestal();
    this.titleT = this.add.text(622, 112, '', { ...typeStyle('displayXL', C.text), stroke: C.ink, strokeThickness: 8 }).setOrigin(0.5, 0);
    this.epithetT = this.add.text(622, 176, '', { ...typeStyle('h2', C.text300), letterSpacing: 2 } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(0.5, 0);
    this.ctl = this.add.container(0, 0);

    this.list = new ClassList(this, this.hc.classId, (id) => this.pickClass(id));
    this.panel = new OptionPanel(this, {
      setLook: (k, v) => this.patch({ look: applyBodyRules({ ...this.hc.look, [k]: v }) }),
      setOutfit: (k, v) => this.patch({ outfit: { ...this.hc.outfit, [k]: v } }),
      randomise: () => this.randomise(),
      resetLook: () => this.patch({ look: defaultLook(this.hc.classId, this.hc.look.body), outfit: defaultOutfit() }),
    });
    this.buildFooter();

    const kb = this.input.keyboard!;
    kb.on('keydown', (ev: KeyboardEvent) => this.onKey(ev));
    this.time.addEvent({ delay: 500, loop: true, callback: () => { this.caret = !this.caret; this.drawName(); } });
    this.render();
  }

  private drawPedestal(): void {
    const g = this.add.graphics();
    const n = (s: string) => parseInt(s.slice(1), 16);
    g.fillStyle(n(C.ink), 1).fillEllipse(622, 542, 346, 70);
    g.fillStyle(n(C.panel700), 1).fillEllipse(622, 542, 340, 64);
    g.fillStyle(n(C.panel600), 1).fillEllipse(622, 536, 336, 54);
    g.fillStyle(n(C.line), 1).fillEllipse(622, 532, 330, 44);
    g.fillStyle(n(C.panel600), 1).fillEllipse(622, 534, 324, 42);
    g.fillStyle(0x140c30, 0.45).fillEllipse(622, 540, 220, 28);
  }

  private pickClass(id: string): void {
    this.looks.set(this.hc.classId, { look: this.hc.look, outfit: this.hc.outfit });
    const saved = this.looks.get(id);
    this.hc = { ...this.hc, classId: id, look: saved?.look ?? defaultLook(id, this.hc.look.body), outfit: saved?.outfit ?? defaultOutfit() };
    this.list.select(id);
    this.list.reveal(id);
    this.render();
  }

  private patch(p: Partial<HeroChoice>): void { this.hc = { ...this.hc, ...p }; this.render(); }

  private randomise(): void {
    const r = (k: number) => Math.floor(Math.random() * k);
    const L = LOOK();
    const body = r(2) as 0 | 1;
    this.patch({
      look: applyBodyRules({ skin: r(L.skin.length), hair: r(L.hair.length), hc: r(L.hc.length), eyes: r(12), brows: r(12), ec: r(L.ec.length), mouth: r(L.mouth.length), mark: r(L.mark.length), body }),
      outfit: { ...this.hc.outfit, dye: r(4) },
    });
  }

  private render(): void {
    const c = classDisplay(this.hc.classId);
    const col = c?.color ?? C.text;
    this.titleT.setText(c?.name ?? this.hc.classId).setColor(col);
    this.epithetT.setText(c?.epithet ?? '');
    this.glow.clear();
    const cn = parseInt(col.slice(1), 16);
    for (let r = 190; r > 0; r -= 10) this.glow.fillStyle(cn, 0.03).fillCircle(622, 330, r);
    this.renderPreview();
    this.renderControls();
    this.panel.render(this.hc);
  }

  /** hero at 6× on the pedestal, idle/walk, flip */
  private renderPreview(): void {
    const name = heroSprite(this.hc.classId, this.hc.look, this.hc.outfit);
    const idle = mv().frames(name, 'idle') ?? [], walk = mv().frames(name, 'walk') ?? [];
    if (!idle.length) return;
    const key = 'cc-preview';
    // destroy the old preview FIRST: replacing the texture/anims while a sprite still uses them leaves it pointing at a
    // removed texture, and every following frame throws (the game "freezes" after clicking a hero)
    this.preview?.destroy();
    this.preview = undefined;
    addCanvasSheet(this, key, [idle[0], idle[1] ?? idle[0], walk[0] ?? idle[0], walk[1] ?? idle[0], walk[2] ?? idle[0], walk[3] ?? idle[0]]);
    for (const a of ['idle', 'walk']) if (this.anims.exists(`${key}:${a}`)) this.anims.remove(`${key}:${a}`);
    this.anims.create({ key: `${key}:idle`, frames: this.anims.generateFrameNumbers(key, { frames: [0, 1] }), frameRate: 2.5, repeat: -1 });
    this.anims.create({ key: `${key}:walk`, frames: this.anims.generateFrameNumbers(key, { frames: [2, 3, 4, 5] }), frameRate: 8, repeat: -1 });
    this.preview =this.add.sprite(622, 534, key, 0).setOrigin(0.5, 38 / 40).setScale(6).setFlipX(this.flip);
    this.preview.play(`${key}:${this.anim}`);
  }

  private renderControls(): void {
    this.ctl.removeAll(true);
    let x = 432;
    const btn = (w: number, label: string, on: boolean, fn: () => void) => {
      const bg = this.add.nineslice(x, 588, on ? 'ui:tab_active' : 'ui:tab', undefined, w, 40, 8, 8, 8, 8).setOrigin(0);
      bg.setInteractive({ useHandCursor: true }).on('pointerup', fn);
      this.ctl.add([bg, this.add.text(x + w / 2, 608, label, typeStyle('h3', on ? C.text : C.text300)).setOrigin(0.5)]);
      x += w + 6;
    };
    btn(84, 'Female', this.hc.look.body === 0, () => this.patch({ look: applyBodyRules({ ...this.hc.look, body: 0, brows: this.hc.look.brows }) }));
    btn(84, 'Male', this.hc.look.body === 1, () => this.patch({ look: applyBodyRules({ ...this.hc.look, body: 1 }) }));
    x += 14;
    btn(64, 'Idle', this.anim === 'idle', () => { this.anim = 'idle'; this.render(); });
    btn(64, 'Walk', this.anim === 'walk', () => { this.anim = 'walk'; this.render(); });
    btn(40, '⇆', this.flip, () => { this.flip = !this.flip; this.render(); });
  }

  private buildFooter(): void {
    const back = this.add.nineslice(48, 636, 'ui:btn_slate', undefined, 160, 52, 8, 8, 8, 8).setOrigin(0);
    this.add.text(128, 662, 'Back', typeStyle('button', C.text)).setOrigin(0.5);
    back.setInteractive({ useHandCursor: true }).on('pointerup', () => this.leave());
    this.add.text(224, 656, '↑ ↓ class · Enter begin · Esc back', typeStyle('caption', C.text500));
    this.add.nineslice(856, 636, 'ui:panel_inset', undefined, 194, 52, 8, 8, 8, 8).setOrigin(0);
    this.add.text(868, 656, 'NAME', typeStyle('badge', C.text500));
    this.nameT = this.add.text(908, 662, '', typeStyle('button', C.text)).setOrigin(0, 0.5);
    const begin = this.add.nineslice(1060, 636, 'ui:btn_gold', undefined, 172, 52, 8, 8, 8, 8).setOrigin(0);
    this.add.text(1146, 662, 'Begin', typeStyle('button', C.ink)).setOrigin(0.5);
    begin.setInteractive({ useHandCursor: true })
      .on('pointerover', () => begin.setTexture('ui:btn_gold_hover'))
      .on('pointerout', () => begin.setTexture('ui:btn_gold'))
      .on('pointerdown', () => begin.setTexture('ui:btn_gold_down'))
      .on('pointerup', () => this.begin());
    this.drawName();
  }

  private drawName(): void { this.nameT?.setText(this.hc.name + (this.caret ? '|' : ' ')); }

  private onKey(ev: KeyboardEvent): void {
    if (this.confirm) { if (ev.key === 'Escape') this.scene.start(SceneKeys.MainMenu); else if (ev.key === 'Enter') this.keep(); return; }
    if (ev.key === 'Escape') { this.leave(); return; }
    if (ev.key === 'Enter') { this.begin(); return; }
    if (ev.key === 'ArrowUp' || ev.key === 'ArrowDown') {
      const ids = this.list.order(), i = ids.indexOf(this.hc.classId);
      const next = ids[(i + (ev.key === 'ArrowUp' ? -1 : 1) + ids.length) % ids.length];
      this.pickClass(next);
      return;
    }
    if (ev.key === 'Backspace') this.hc.name = this.hc.name.slice(0, -1);
    else if (/^[a-zA-Z' -]$/.test(ev.key) && this.hc.name.length < 12) this.hc.name += ev.key;
    else return;
    this.caret = true;
    this.drawName();
  }

  /** Back / Esc: a hero the player has worked on is only dropped after "Discard this hero?" (Esc again or Yes). */
  private leave(): void {
    if (this.confirm || JSON.stringify(this.hc) === this.initial) { this.scene.start(SceneKeys.MainMenu); return; }
    const { width: W, height: H } = this.scale;
    const c = this.add.container(0, 0).setDepth(1000);
    c.add(this.add.rectangle(0, 0, W, H, parseInt(C.bg.slice(1), 16), 0.72).setOrigin(0).setInteractive()); // blocks clicks below
    c.add(this.add.nineslice(W / 2 - 260, H / 2 - 110, 'ui:panel', undefined, 520, 220, 8, 8, 8, 8).setOrigin(0));
    c.add(this.add.text(W / 2, H / 2 - 78, 'Discard this hero?', typeStyle('h1', C.text)).setOrigin(0.5, 0));
    c.add(this.add.text(W / 2, H / 2 - 30, `${this.hc.name || 'Your hero'}'s class, look and name will be lost.`, typeStyle('body', C.text300, 460)).setOrigin(0.5, 0).setAlign('center'));
    const btn = (x: number, label: string, gold: boolean, fn: () => void) => {
      const b = this.add.nineslice(x, H / 2 + 34, gold ? 'ui:btn_gold' : 'ui:btn_slate', undefined, 200, 52, 8, 8, 8, 8).setOrigin(0);
      b.setInteractive({ useHandCursor: true }).on('pointerup', fn);
      c.add([b, this.add.text(x + 100, H / 2 + 60, label, typeStyle('button', gold ? C.ink : C.text)).setOrigin(0.5)]);
    };
    btn(W / 2 - 220, 'Keep editing', true, () => this.keep());
    btn(W / 2 + 20, 'Discard', false, () => this.scene.start(SceneKeys.MainMenu));
    c.add(this.add.text(W / 2, H / 2 + 96, 'Esc discard · Enter keep editing', typeStyle('caption', C.text500)).setOrigin(0.5, 0));
    this.confirm = c;
  }

  private keep(): void { this.confirm?.destroy(); this.confirm = null; }

  private begin(): void {
    const raw = this.hc.name.trim();
    if (!raw) return;
    const name = raw[0].toUpperCase() + raw.slice(1); // heroes get a capitalised name even if typed without Shift
    const state = createNewGameState(this.slot);
    state.player.name = name;
    state.player.hero = { classId: this.hc.classId, look: { ...this.hc.look }, outfit: { ...this.hc.outfit } };
    Game.set(state);
    bus.emit('game:new', { slot: this.slot });
    void SaveService.save(state);
    this.scene.start(worldKey(this));
  }
}
