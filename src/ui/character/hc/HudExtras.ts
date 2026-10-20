/**
 * HUD extras (Claude 3): buff/debuff row on anchors.topLeft (16, 112) and the boss bar (top centre, outside the
 * safe rect). Both read replicated snapshots only, so guests see the same thing.
 */
import Phaser from 'phaser';
import { Art } from '@/art';
import { GAME_WIDTH } from '@/core/constants';
import { Services } from '@/core/services';
import type { EntityState } from '@/net/types';
import { creature } from '@/systems/rules/creatures';
import { spellDef } from '@/systems/rules/spells';
import { C, panel, typeStyle } from '@/ui/kit/hc';

const STATUS_ICON: Record<string, string> = {
  burn: 'school_ash', chill: 'school_rime', freeze: 'school_rime', shock: 'school_storm', bleed: 'icon_dagger', poison: 'school_verdant',
  root: 'school_verdant', stun: 'school_storm', blind: 'school_radiance', mark: 'school_hunt', sleep: 'school_song', slow: 'icon_boots',
  knockdown: 'school_iron', confuse: 'school_guile', vulnerable: 'school_umbral', weaken: 'school_umbral', linked: 'school_umbral', doom: 'school_umbral', taunt: 'school_iron',
};

/** Buffs and debuffs of the local hero: 28px chips, debuffs framed red. */
export class BuffRow extends Phaser.GameObjects.Container {
  private key = '';
  private unsub: () => void;
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    this.unsub = Services.get('net').addConsumer({ kinds: ['player'], apply: (ents) => this.onSnap(ents) });
    this.once('destroy', () => this.unsub());
  }
  private onSnap(ents: EntityState[]): void {
    const me = ents.find((e) => e.kind === 'player' && e.owner === Services.get('net').localPlayer);
    if (!me?.data) return;
    const buffs = String(me.data.b ?? '').split(',').filter(Boolean), sts = String(me.data.s ?? '').split(',').filter(Boolean);
    const key = `${buffs.join(',')}|${sts.join(',')}`;
    if (key === this.key) return;
    this.key = key;
    this.removeAll(true);
    const chips = [...buffs.map((b) => ({ icon: spellDef(`spell:${b}`)?.icon ?? 'icon_shield', bad: false, label: b })), ...sts.map((s) => ({ icon: STATUS_ICON[s] ?? 'icon_skull', bad: true, label: s }))];
    chips.slice(0, 12).forEach((c, i) => {
      const x = i * 32;
      this.add(this.scene.add.rectangle(x, 0, 28, 28, c.bad ? 0x3a1020 : 0x16203f).setOrigin(0).setStrokeStyle(2, c.bad ? 0xff4d5e : 0x5fe06a));
      const f = Art.tryFrame(c.icon);
      if (f) this.add(this.scene.add.image(x + 14, 14, f.key, f.frame).setDisplaySize(20, 20));
    });
  }
}

/** Boss frame: name, phase pips and a long HP bar at the top centre while a boss is near. */
/** bar width: the frame (bar + 12 px each side) stays inside x 386–894, clear of the unit frame (to 370) and minimap (1048) */
const BOSS_W = 484;

export class BossBar extends Phaser.GameObjects.Container {
  private unsub: () => void;
  private bg: Phaser.GameObjects.NineSlice;
  private title: Phaser.GameObjects.Text;
  private bar: Phaser.GameObjects.Graphics;
  private bossId = '';
  constructor(scene: Phaser.Scene) {
    super(scene, GAME_WIDTH / 2, 24);
    const w = BOSS_W;
    this.bg = panel(scene, -w / 2 - 12, -8, w + 24, 64, 'panel');
    this.title = scene.add.text(0, 0, '', typeStyle('h3', C.text)).setOrigin(0.5, 0);
    this.bar = scene.add.graphics();
    this.add([this.bg, this.title, this.bar]);
    this.setVisible(false);
    this.unsub = Services.get('net').addConsumer({ kinds: ['enemy'], apply: (ents) => this.onSnap(ents) });
    this.once('destroy', () => this.unsub());
  }
  private onSnap(ents: EntityState[]): void {
    const boss = ents.find((e) => e.kind === 'enemy' && e.data?.tier === 'boss' && (e.hp ?? 0) > 0 && e.data?.team !== 'players');
    if (!boss) { this.setVisible(false); this.bossId = ''; return; }
    if (boss.id !== this.bossId) { this.bossId = boss.id; this.title.setText(creature(boss.def)?.name ?? boss.def); }
    this.setVisible(true);
    const w = BOSS_W, frac = Math.max(0, (boss.hp ?? 0) / Math.max(1, boss.maxHp ?? 1));
    const phases = Math.max(1, creature(boss.def)?.phases.length ?? 1), ph = Number(boss.data?.ph ?? 1);
    this.bar.clear();
    this.bar.fillStyle(0x1a1230, 1).fillRect(-w / 2 - 2, 28, w + 4, 18);
    this.bar.fillStyle(0x5a1020, 1).fillRect(-w / 2, 30, w, 14);
    this.bar.fillStyle(0xff3d5a, 1).fillRect(-w / 2, 30, w * frac, 14);
    this.bar.fillStyle(0xff8a9a, 1).fillRect(-w / 2, 30, w * frac, 4);
    for (let i = 1; i < phases; i++) this.bar.fillStyle(0x1a1230, 1).fillRect(-w / 2 + (w * i) / phases - 1, 28, 2, 18);
    for (let i = 0; i < phases; i++) this.bar.fillStyle(i < ph ? 0xffc43d : 0x2c3868, 1).fillRect(w / 2 - 12 - i * 14, 6, 10, 10);
  }
}
