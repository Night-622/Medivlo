import Phaser from 'phaser';
import { Game, SceneKeys, Services, bus } from '@/core';
import { Bar, Theme, drawFrame, humanoidTexture, palette as P, pxText } from '@/ui/kit';
import { SaveService } from '@/firebase/SaveService';

/**
 * HUD overlay (design board "8c · In-Game HUD"), launched by the World scene. Owner: Claude 1.
 * The centre (x 360–920, y 100–600) stays free of persistent UI.
 * Plug-in anchors for other systems (they add their own containers):
 *   anchors.topRight     minimap, top-right corner at (1256,24) (Claude 2)
 *   anchors.rightColumn  tracked quest, top-left at (1040,284), 216 wide (Claude 4)
 *   anchors.topLeft      buff/debuff rows at (24,136) (Claude 3)
 *   anchors.bottom       ability bar, bottom-centre at (640,704) (Claude 3)
 */
export class HudScene extends Phaser.Scene {
  anchors!: Record<'topLeft' | 'topRight' | 'rightColumn' | 'bottom', Phaser.GameObjects.Container>;
  private hp!: Bar;
  private mana!: Bar;
  private stamina!: Bar;
  private hpText!: Phaser.GameObjects.Text;
  private level!: Phaser.GameObjects.Text;
  private toast?: Phaser.GameObjects.Container;

  constructor() { super(SceneKeys.Hud); }

  create(): void {
    const { width, height } = this.scale;
    this.drawUnitFrame();
    this.anchors = {
      topLeft: this.add.container(24, 136),
      topRight: this.add.container(width - 24, 24),
      rightColumn: this.add.container(1040, 284),
      bottom: this.add.container(width / 2, height - 16),
    };

    this.input.keyboard!.on('keydown-F5', () => void this.save(true));
    bus.onScene(this, 'game:saved', ({ cloud }) => { if (!this.quietSave) this.flash(cloud ? 'Saved to the cloud' : 'Saved'); });
    bus.onScene(this, 'narrative:toast', ({ text }) => this.flash(text));

    // Playtime counts only while nothing is paused or open; autosave on story beats and on a timer.
    this.openPanels = 0;
    this.paused = false;
    bus.onScene(this, 'ui:open', () => { this.openPanels++; });
    bus.onScene(this, 'ui:close', () => { this.openPanels = Math.max(0, this.openPanels - 1); });
    bus.onScene(this, 'game:paused', ({ paused }) => { this.paused = paused; });
    bus.onScene(this, 'quest:completed', () => this.autosave());
    bus.onScene(this, 'region:entered', () => this.autosave());
    bus.onScene(this, 'instance:exited', () => this.autosave());
    this.lastSave = this.time.now;
    const onHide = () => { if (document.visibilityState === 'hidden') void this.save(false); };
    document.addEventListener('visibilitychange', onHide);
    this.events.once('shutdown', () => document.removeEventListener('visibilitychange', onHide));
  }

  private openPanels = 0;
  private paused = false;
  private lastSave = 0;
  private playAcc = 0;
  private static readonly AUTOSAVE_MS = 5 * 60_000;
  private static readonly MIN_GAP_MS = 60_000;

  private autosave(): void {
    if (this.time.now - this.lastSave < HudScene.MIN_GAP_MS) return;
    void this.save(false);
  }

  /** Manual saves (F5) show a toast; autosaves are silent. */
  private async save(manual: boolean): Promise<void> {
    this.lastSave = this.time.now;
    this.quietSave = !manual;
    await SaveService.save();
  }
  private quietSave = false;

  /** Unit frame: iron panel 320×96 at (24,24), portrait 72×72, level badge, HP/Ember/stamina. */
  private drawUnitFrame(): void {
    const g = this.add.graphics();
    drawFrame(g, 'iron', 24, 24, 320, 96);
    // portrait well: dithered ink with a brass rim
    g.fillStyle(P['ink-900'], 1).fillRect(34, 34, 76, 76);
    g.fillStyle(P['gold-800'], 1).fillRect(36, 36, 72, 72);
    g.fillStyle(P['ink-700'], 1).fillRect(38, 38, 68, 68);
    g.fillStyle(P['ink-800'], 1);
    for (let y = 38; y < 106; y += 2) for (let x = 38 + ((y / 2) % 2) * 2; x < 106; x += 4) g.fillRect(x, y, 2, 2);
    const a = Game.state.player.appearance;
    const key = `hud-portrait-${a.skinTone}-${a.hairColor}-${a.accentColor}`;
    humanoidTexture(this, key, a.skinTone, a.hairColor, P['iron-600'], a.accentColor);
    const mask = this.make.graphics({}, false).fillRect(38, 38, 68, 68).createGeometryMask();
    this.add.image(72, 92, key).setScale(3).setMask(mask);
    // level badge
    g.fillStyle(P['ink-900'], 1).fillRect(86, 92, 36, 24);
    g.fillStyle(P['gold-800'], 1).fillRect(88, 94, 32, 20);
    g.fillStyle(P['gold-500'], 1).fillRect(88, 94, 32, 2).fillRect(88, 94, 2, 20);
    g.fillStyle(P['gold-900'], 1).fillRect(88, 112, 32, 2).fillRect(118, 94, 2, 20);
    this.level = pxText(this, 104, 104, '1', 'micro', Theme.css.text).setOrigin(0.5);

    this.hp = new Bar(this, 120, 38, 216, 20, 'hp');
    this.mana = new Bar(this, 120, 66, 192, 14, 'mana');
    this.stamina = new Bar(this, 120, 88, 176, 12, 'stamina');
    this.hpText = pxText(this, 228, 48, '', 'bodyS', Theme.css.text, false).setOrigin(0.5).setStroke(Theme.css.ink, 4);
  }

  update(_t: number, dt: number): void {
    if (!this.paused && this.openPanels === 0) {
      this.playAcc += dt;
      if (this.playAcc >= 1000) { Game.state.meta.playtimeSec += Math.floor(this.playAcc / 1000); this.playAcc %= 1000; }
    }
    if (this.time.now - this.lastSave > HudScene.AUTOSAVE_MS) void this.save(false);
    const p = Game.state.player;
    const stats = Services.tryGet('stats');
    const maxHp = stats?.max('maxHp') ?? 100;
    const maxMana = stats?.max('maxMana') ?? 50;
    const maxSta = stats?.max('maxStamina') ?? 100;
    this.hp.setValue(p.hp, maxHp).tickGhost(dt);
    this.mana.setValue(p.mana, maxMana);
    this.stamina.setValue(p.stamina, maxSta);
    this.hpText.setText(`${Math.ceil(p.hp)} / ${Math.round(maxHp)}`);
    this.hpText.setColor(p.hp / maxHp < 0.25 ? Theme.css.bad : Theme.css.text);
    this.level.setText(String(p.progression.level));
  }

  /** Notification toast (Design System §11): iron strip 240×40, top-centre, steps out after 1.8 s. */
  flash(msg: string): void {
    this.toast?.destroy();
    const label = pxText(this, 0, 0, msg, 'bodyS', Theme.css.hover).setOrigin(0.5);
    const w = Math.max(240, Math.ceil(label.width / 2) * 2 + 40);
    const g = this.add.graphics();
    drawFrame(g, 'iron', -w / 2, -20, w, 40);
    this.toast = this.add.container(this.scale.width / 2, 132, [g, label]);
    // Pixel rule: no alpha fades. Hold, then remove.
    this.time.delayedCall(1800, () => { this.toast?.destroy(); this.toast = undefined; });
  }
}
