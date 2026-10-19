/**
 * Combat effects on every client (Claude 3), driven by replicated events only:
 * damage numbers (HANDOFF rule 4), enemy telegraphs, chain arcs, blink/dash streaks, hit flashes.
 */
import Phaser from 'phaser';
import { Depth } from '@/core/constants';
import { bus } from '@/core/EventBus';
import { Settings } from '@/core/settings';
import { SCHOOL_COLOR } from '@/data/classes/hc';

const INK = '#1a1230';
const hex = (c: string) => Number.parseInt(c.slice(1), 16);
export const kindColor = (k: string): number => (k in SCHOOL_COLOR ? hex(SCHOOL_COLOR[k as keyof typeof SCHOOL_COLOR]) : 0xe8eef8);

/** What the effects need from the renderer: the drawn object and HP of an entity. */
export interface FxTargets { entity(id: string): { obj: Phaser.GameObjects.GameObject; maxHp: number; flashUntil?: number } | undefined }

const SHAKE = { off: 0, low: 0.4, full: 1 } as const;

export class CombatFx {
  private offs: (() => void)[] = [];

  constructor(private scene: Phaser.Scene, private localEntity: () => string, private visible: (x: number, y: number) => boolean, private targets?: FxTargets) {
    this.offs.push(
      bus.on('combat:hit', (e) => { this.number(e); this.impact(e); }),
      bus.on('enemy:telegraph', (e) => this.telegraph(e)),
      bus.on('ability:cast', (e) => this.cast(e)),
    );
  }

  destroy(): void { this.offs.forEach((f) => f()); }

  /**
   * Hit feedback, honouring Settings: a short flash on the struck sprite (reduceFlashing: a soft tint instead of a
   * white fill) and camera shake when the local hero is hurt or lands a crit (screenShake: off / low ×0.4 / full).
   */
  private impact(e: { amount: number; crit: boolean; kind?: string; targetId: string; sourceId: string }): void {
    if (e.kind !== 'dmg' || e.amount <= 0) return;
    const st = Settings.get();
    const rec = this.targets?.entity(e.targetId);
    const obj = rec?.obj as (Phaser.GameObjects.Sprite & { isTinted?: boolean }) | undefined;
    if (rec && obj && 'setTintFill' in obj) {
      const ms = st.reduceFlashing ? 90 : 60;
      rec.flashUntil = this.scene.time.now + ms;
      if (st.reduceFlashing) obj.setTint(0xffc8c8);
      else obj.setTintFill(0xffffff);
    }
    const mult = SHAKE[st.screenShake] ?? 1;
    if (!mult) return;
    const me = this.localEntity();
    if (e.targetId === me) {
      const frac = Math.min(1, e.amount / Math.max(1, this.targets?.entity(me)?.maxHp ?? 300));
      this.scene.cameras.main.shake(140, (0.002 + 0.01 * frac) * mult);
    } else if (e.sourceId === me && e.crit) this.scene.cameras.main.shake(80, 0.0015 * mult);
  }

  private number(e: { x?: number; y?: number; amount: number; crit: boolean; kind?: string; targetId: string; type: string }): void {
    if (e.x === undefined || e.y === undefined || !this.visible(e.x, e.y)) return;
    const mine = e.targetId === this.localEntity();
    const pref = Settings.get().damageNumbers;
    if (pref === 'off' || (pref === 'mine' && !mine && (e as { sourceId?: string }).sourceId !== this.localEntity())) return;
    let text = String(Math.round(e.amount)), color = '#fbf6e9', size = 18;
    switch (e.kind) {
      case 'heal': text = `+${text}`; color = '#5fe06a'; break;
      case 'miss': text = 'Miss'; color = '#b7c0e3'; break;
      case 'immune': if (!e.amount) { text = 'Immune'; color = '#b7c0e3'; } break;
      case 'block': text = e.amount ? `${text} Block` : 'Block'; color = '#9fb4ff'; break;
      default: if (mine) color = '#ff4d5e'; else if (e.type !== 'physical') color = '#' + kindColor(e.type).toString(16).padStart(6, '0');
    }
    if (e.crit) { text += '!'; color = '#ffd23f'; size = 32; }
    if (e.kind === 'dmg' && e.amount <= 0) return;
    const t = this.scene.add.text(e.x + Phaser.Math.Between(-6, 6), e.y - 24, text, {
      fontFamily: '"Jersey 10"', fontSize: `${size}px`, color, stroke: INK, strokeThickness: 2,
    }).setOrigin(0.5, 1).setDepth(Depth.WorldUi).setScale(1.7);
    this.scene.tweens.add({ targets: t, scale: 1, duration: 120 });
    this.scene.tweens.add({ targets: t, y: t.y - 34 * 0.9, duration: 900 });
    this.scene.tweens.add({ targets: t, alpha: 0, delay: 600, duration: 300, onComplete: () => t.destroy() });
  }

  private telegraph(e: { shape: string; x: number; y: number; r: number; w?: number; angle: number; ms: number }): void {
    if (!this.visible(e.x, e.y)) return;
    const g = this.scene.add.graphics().setDepth(Depth.GroundDecor + 60);
    const start = this.scene.time.now;
    const a = Phaser.Math.DegToRad(e.angle);
    const draw = (k: number) => {
      g.clear();
      g.lineStyle(2, 0xff3d5a, 0.9);
      const fill = (alpha: number, scale: number) => {
        g.fillStyle(0xff3d5a, alpha);
        if (e.shape === 'line') {
          const len = e.r * scale, w = Math.max(16, e.w ?? 24);
          const pts = rect(e.x, e.y, a, len, w);
          g.fillPoints(pts, true);
          if (scale === 1) g.strokePoints(pts, true);
        } else if (e.shape === 'cone') {
          g.slice(e.x, e.y, e.r * scale, a - 0.6, a + 0.6, false); g.fillPath();
          if (scale === 1) { g.beginPath(); g.slice(e.x, e.y, e.r, a - 0.6, a + 0.6, false); g.strokePath(); }
        } else if (e.shape === 'ring') {
          g.lineStyle(Math.max(8, 200 * scale), 0xff3d5a, alpha); g.strokeCircle(e.x, e.y, e.r + 100);
        } else {
          g.fillCircle(e.x, e.y, e.r * scale);
          if (scale === 1) g.strokeCircle(e.x, e.y, e.r);
        }
      };
      fill(0.16, 1);
      fill(0.28, k);
    };
    const ev = this.scene.time.addEvent({
      delay: 16, loop: true, callback: () => {
        const k = Math.min(1, (this.scene.time.now - start) / Math.max(1, e.ms));
        draw(k);
        if (k >= 1) { ev.remove(); this.scene.tweens.add({ targets: g, alpha: 0, duration: 150, onComplete: () => g.destroy() }); }
      },
    });
    draw(0);
  }

  private cast(e: { ability: string; x: number; y: number; tx: number; ty: number; ms: number }): void {
    if (!this.visible(e.x, e.y)) return;
    if (e.ability === 'chain') {
      const g = this.scene.add.graphics().setDepth(Depth.Effects).setBlendMode(Phaser.BlendModes.ADD);
      g.lineStyle(2, 0xffe14a, 1);
      g.beginPath(); g.moveTo(e.x, e.y - 12);
      const n = 5;
      for (let i = 1; i <= n; i++) {
        const k = i / n;
        g.lineTo(e.x + (e.tx - e.x) * k + (i < n ? Phaser.Math.Between(-6, 6) : 0), e.y - 12 + (e.ty - e.y) * k + (i < n ? Phaser.Math.Between(-6, 6) : 0));
      }
      g.strokePath();
      this.scene.tweens.add({ targets: g, alpha: 0, duration: 180, onComplete: () => g.destroy() });
    } else if (e.ability === 'blink' || e.ability === 'dash') {
      const g = this.scene.add.graphics().setDepth(Depth.Effects).setBlendMode(Phaser.BlendModes.ADD);
      g.lineStyle(6, e.ability === 'blink' ? 0xa35cff : 0xe8eef8, 0.5);
      g.lineBetween(e.x, e.y - 10, e.tx, e.ty - 10);
      this.scene.tweens.add({ targets: g, alpha: 0, duration: 220, onComplete: () => g.destroy() });
    } else if (e.ability === 'shatter' || e.ability === 'unmaking') {
      const c = this.scene.add.circle(e.x, e.y, 10, e.ability === 'shatter' ? 0x7fe3ff : 0xa35cff, 0.6).setDepth(Depth.Effects).setBlendMode(Phaser.BlendModes.ADD);
      this.scene.tweens.add({ targets: c, radius: 90, alpha: 0, duration: 300, onComplete: () => c.destroy() });
    }
  }
}

function rect(x: number, y: number, a: number, len: number, w: number): Phaser.Math.Vector2[] {
  const dx = Math.cos(a), dy = Math.sin(a), px = -dy * (w / 2), py = dx * (w / 2);
  return [
    new Phaser.Math.Vector2(x + px, y + py), new Phaser.Math.Vector2(x + dx * len + px, y + dy * len + py),
    new Phaser.Math.Vector2(x + dx * len - px, y + dy * len - py), new Phaser.Math.Vector2(x - px, y - py),
  ];
}
