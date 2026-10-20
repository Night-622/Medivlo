import Phaser from 'phaser';
import { DEFAULT_KEYS, SceneKeys, Settings, keyLabel, type Action, type SettingsData } from '@/core';
import { C, typeStyle } from '@/ui/kit/hc';
import { keyName } from '@/ui/kit/hc/keys';

type Tab = 'video' | 'audio' | 'controls' | 'gameplay' | 'accessibility';
type Row =
  | { label: string; hint: string; slider: keyof Pick<SettingsData, 'master' | 'music' | 'sfx'> }
  | { label: string; hint: string; opts: { key: keyof SettingsData; values: [string, SettingsData[keyof SettingsData]][] } }
  | { label: string; hint: string; action: Action };

const ACTION_LABEL: Record<Action, string> = {
  up: 'Move up', down: 'Move down', left: 'Move left', right: 'Move right', dash: 'Dash', slash: 'Slash / quick shot (martial)', cast1: 'Spell 1', cast2: 'Spell 2',
  cast3: 'Spell 3', cast4: 'Spell 4', potionQ: 'Health potion', potionE: 'Ember potion', interact: 'Talk / interact',
  inventory: 'Inventory', skills: 'Skill tree', spells: 'Spellbook', journal: 'Journal', track: 'Track quest (Journal)', codex: 'Codex', map: 'World map', people: 'People', pause: 'Pause',
};

const ROWS: Record<Tab, Row[]> = {
  video: [
    { label: 'Fullscreen', hint: 'Fill the whole screen', opts: { key: 'fullscreen', values: [['Off', false], ['On', true]] } },
    { label: 'Pixel-perfect scaling', hint: 'Only scale the game by whole numbers (crisper pixels, may add borders)', opts: { key: 'pixelPerfect', values: [['Off', false], ['On', true]] } },
    { label: 'Screen shake', hint: 'Camera shake on big hits', opts: { key: 'screenShake', values: [['Off', 'off'], ['Low', 'low'], ['Full', 'full']] } },
    { label: 'Sharp rendering', hint: 'Draw at double resolution for crisper text. Turn off on slow machines (applies after restart)', opts: { key: 'sharpRendering', values: [['Off', false], ['On', true]] } },
  ],
  audio: [
    { label: 'Master volume', hint: 'Everything', slider: 'master' },
    { label: 'Music', hint: 'Background music', slider: 'music' },
    { label: 'Sound effects', hint: 'Combat, footsteps, interface', slider: 'sfx' },
  ],
  controls: (Object.keys(DEFAULT_KEYS) as Action[]).map((a) => ({ label: ACTION_LABEL[a], hint: '', action: a })),
  gameplay: [
    { label: 'Damage numbers', hint: 'Show floating damage in combat', opts: { key: 'damageNumbers', values: [['All', 'all'], ['Mine', 'mine'], ['Off', 'off']] } },
    { label: 'Control hints', hint: 'Show key prompts on screen', opts: { key: 'showHints', values: [['Off', false], ['On', true]] } },
    { label: 'Auto-collect Embershards', hint: 'Pick up coins by walking over them', opts: { key: 'autoLootGold', values: [['Off', false], ['On', true]] } },
    { label: 'Slash aim (martial)', hint: 'Facing: swing where you face, on the slash key · Mouse: swing at the cursor, on left click', opts: { key: 'slashAim', values: [['Facing', 'facing'], ['Mouse', 'mouse']] } },
  ],
  accessibility: [
    { label: 'Text size', hint: 'Bigger interface text', opts: { key: 'textSize', values: [['Normal', 'normal'], ['Large', 'large']] } },
    { label: 'Reduce flashing', hint: 'Softer hit flashes and lightning', opts: { key: 'reduceFlashing', values: [['Off', false], ['On', true]] } },
    { label: 'Rarity glyphs', hint: 'Show a shape on items as well as a colour', opts: { key: 'rarityGlyphs', values: [['Off', false], ['On', true]] } },
  ],
};

/** Settings (handoff › Settings). Owner: Claude 1. Opens over Title or Pause and returns there. Changes apply at once. */
export class SettingsScene extends Phaser.Scene {
  private tab: Tab = 'video';
  private body!: Phaser.GameObjects.Container;
  private tabs!: Phaser.GameObjects.Container;
  private from: string = SceneKeys.MainMenu;
  private rebinding: Action | null = null;

  constructor() { super(SceneKeys.Settings); }

  init(data: { from?: string }): void { this.from = data?.from ?? SceneKeys.MainMenu; this.tab = 'video'; this.rebinding = null; }

  create(): void {
    const { width: W, height: H } = this.scale;
    this.add.rectangle(0, 0, W, H, parseInt(C.bg.slice(1), 16), 0.92).setOrigin(0).setInteractive();
    this.add.text(48, 28, 'Settings', { ...typeStyle('displayL', C.text), shadow: { offsetX: 3, offsetY: 3, color: C.ink, fill: true } });
    const x = this.add.nineslice(W - 48 - 44, 28, 'ui:btn_slate', undefined, 44, 44, 8, 8, 8, 8).setOrigin(0);
    this.add.text(W - 48 - 22, 50, '✕', typeStyle('button', C.text)).setOrigin(0.5);
    x.setInteractive({ useHandCursor: true }).on('pointerup', () => this.close());
    this.add.nineslice(292, 100, 'ui:panel', undefined, 940, 540, 8, 8, 8, 8).setOrigin(0);
    this.tabs = this.add.container(48, 100);
    this.body = this.add.container(0, 0);
    this.add.text(292, 666, 'Changes apply straight away.', typeStyle('caption', C.text500));
    const reset = this.add.nineslice(1032, 652, 'ui:btn_slate', undefined, 200, 52, 8, 8, 8, 8).setOrigin(0);
    this.add.text(1132, 678, 'Restore defaults', typeStyle('button', C.text)).setOrigin(0.5);
    reset.setInteractive({ useHandCursor: true }).on('pointerup', () => { Settings.reset(); this.render(); });
    this.input.keyboard!.on('keydown', (ev: KeyboardEvent) => this.onKey(ev));
    this.render();
  }

  private render(): void {
    this.tabs.removeAll(true);
    (['video', 'audio', 'controls', 'gameplay', 'accessibility'] as Tab[]).forEach((t, i) => {
      const on = t === this.tab;
      const bg = this.add.nineslice(0, i * 54, on ? 'ui:tab_active' : 'ui:tab', undefined, 220, 48, 8, 8, 8, 8).setOrigin(0);
      this.tabs.add([bg, this.add.text(12, i * 54 + 24, t[0].toUpperCase() + t.slice(1), typeStyle('h2', on ? C.text : C.text300)).setOrigin(0, 0.5)]);
      bg.setInteractive({ useHandCursor: true }).on('pointerup', () => { this.tab = t; this.rebinding = null; this.render(); });
    });
    this.body.removeAll(true);
    const s = Settings.get();
    ROWS[this.tab].forEach((r, i) => {
      // controls: as many rows as actions, fitted into the panel (100…640)
      const step = this.tab === 'controls' ? Math.min(28, Math.floor(512 / ROWS.controls.length)) : 58;
      const y = 120 + i * step;
      const h = this.tab === 'controls' ? step - 2 : 52;
      this.body.add(this.add.rectangle(316, y, 892, h, parseInt((i % 2 ? C.panel700 : C.panel).slice(1), 16)).setOrigin(0));
      this.body.add(this.add.text(326, y + (r.hint ? 8 : h / 2), r.label, typeStyle('body', C.text)).setOrigin(0, r.hint ? 0 : 0.5).setFontStyle('600'));
      if (r.hint) this.body.add(this.add.text(326, y + 28, r.hint, typeStyle('caption', C.text500)));
      const right = 1198;
      if ('slider' in r) {
        const v = s[r.slider];
        const track = this.add.rectangle(right - 380, y + h / 2 - 8, 380, 16, 0x0b0f22).setOrigin(0).setStrokeStyle(2, 0x1a1230);
        const fill = this.add.rectangle(right - 380, y + h / 2 - 8, 3.8 * v, 16, parseInt(C.gold.slice(1), 16)).setOrigin(0);
        const val = this.add.text(right - 390, y + h / 2, String(v), typeStyle('h3', C.gold300)).setOrigin(1, 0.5);
        track.setInteractive({ useHandCursor: true }).on('pointerdown', (p: Phaser.Input.Pointer) => {
          const nv = Math.round(Math.max(0, Math.min(1, (p.x - (right - 380)) / 380)) * 20) * 5;
          Settings.set(r.slider, nv); fill.width = 3.8 * nv; val.setText(String(nv));
        });
        this.body.add([track, fill, val]);
      } else if ('opts' in r) {
        let x = right;
        [...r.opts.values].reverse().forEach(([label, value]) => {
          const on = s[r.opts.key] === value;
          const t = this.add.text(0, 0, label, typeStyle('caption', on ? C.text : C.text300));
          const w = Math.max(56, t.width + 24);
          x -= w;
          const bg = this.add.nineslice(x, y + h / 2 - 18, on ? 'ui:tab_active' : 'ui:tab', undefined, w, 36, 8, 8, 8, 8).setOrigin(0);
          t.setPosition(x + w / 2, y + h / 2).setOrigin(0.5);
          bg.setInteractive({ useHandCursor: true }).on('pointerup', () => {
            Settings.set(r.opts.key, value as never);
            if (r.opts.key === 'fullscreen') { if (value) this.scale.startFullscreen(); else this.scale.stopFullscreen(); }
            this.render();
          });
          this.body.add([bg, t]);
          x -= 6;
        });
      } else {
        const waiting = this.rebinding === r.action;
        // the key box is centred on the row; the letter sits 2 px up inside it (Pixelify rides low in its line box)
        const key = this.add.text(right - 80, y + h / 2 - 2, waiting ? 'press a key…' : keyLabel(r.action), typeStyle('h3', waiting ? C.gold : C.text)).setOrigin(1, 0.5);
        const box = this.add.rectangle(right - 70, y + h / 2, key.width + 20, Math.min(h - 2, 24), parseInt(C.panel600.slice(1), 16)).setOrigin(1, 0.5);
        const rebind = this.add.text(right, y + h / 2, 'Rebind', typeStyle('badge', C.teal)).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
        rebind.on('pointerup', () => { this.rebinding = r.action; this.render(); });
        this.body.add([box, key, rebind]);
      }
    });
  }

  private onKey(ev: KeyboardEvent): void {
    if (this.rebinding) {
      ev.preventDefault();
      // Esc cancels a rebind (except when rebinding Pause itself)
      if (ev.key === 'Escape' && this.rebinding !== 'pause') { this.rebinding = null; this.render(); return; }
      // store Phaser's KeyCodes name from the physical key (ArrowLeft → LEFT, ; → SEMICOLON, numpad → NUMPAD_*);
      // ev.key names like 'ARROWLEFT' matched nothing, so non-letter rebinds silently did nothing
      const name = keyName(ev);
      if (!name) return; // a key Phaser can't bind (e.g. Fn): keep waiting
      Settings.bind(this.rebinding, name);
      this.rebinding = null;
      this.render();
      return;
    }
    if (ev.key === 'Escape') this.close();
  }

  private close(): void {
    this.scene.stop();
    if (this.from !== SceneKeys.Pause) this.scene.resume(this.from);
  }
}
