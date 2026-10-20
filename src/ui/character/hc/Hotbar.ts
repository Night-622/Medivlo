/**
 * Hotbar (Claude 3, HANDOFF HUD): 7 slots of 60×60, 8px gap, centred at the HUD's bottom anchor —
 * 1–4 spells │ Q E potions │ Space dash (+ R slash / quick shot for martial classes, cooldown from data.cs). Cooldowns, Ember cost badges and dash stamina come from the local
 * player's replicated entity data (c1–c4, cq, ce, em, st, dc).
 */
import Phaser from 'phaser';
import { Art } from '@/art';
import { Services } from '@/core/services';
import { keyLabel, type Action } from '@/core/settings';
import type { EntityState } from '@/net/types';
import { C, slot, typeStyle } from '@/ui/kit/hc';
import { spellDef } from '@/systems/rules/spells';
import { spellCost } from '@/systems/rules/spellText';
import { character, onCharacterChanged } from '@/systems/client/character';
import type { HeroInput } from '@/systems/input/HeroInput';
import { SLASH, hasSlash } from '@/systems/rules/slash';
import { itemInfo } from '@/systems/rules/gear';
import { kitFor } from '@/data/classes/hc/kits';
import type { WeaponType } from '@/systems/rules/types';

/** The weapon the local hero swings with: the main hand, else the class start weapon. */
function swungWith(): { type: WeaponType; base: string } {
  const ch = character(), main = ch.equipment.main, kit = kitFor(ch.classId);
  const base = main?.base ?? kit.startWeapon;
  return { type: itemInfo(base)?.weaponType ?? kit.weapons[0], base };
}

const S = 60, GAP = 8, DIV = 12;
interface Cell { key: Action; bg: Phaser.GameObjects.NineSlice; icon?: Phaser.GameObjects.Image; cd: Phaser.GameObjects.Rectangle; cdText: Phaser.GameObjects.Text; badge: Phaser.GameObjects.Text; label: Phaser.GameObjects.Text; x: number }


export class Hotbar extends Phaser.GameObjects.Container {
  private cells: Cell[] = [];
  private data_: Record<string, string | number | boolean> = {};
  private offs: (() => void)[] = [];

  constructor(scene: Phaser.Scene, private heroInput?: HeroInput) {
    super(scene, 0, 0);
    // martial classes get the slash slot after dash; magic classes never see it
    const keys: Action[] = ['cast1', 'cast2', 'cast3', 'cast4', 'potionQ', 'potionE', 'dash', ...(hasSlash(character().classId) ? ['slash' as Action] : [])];
    const width = keys.length * S + (keys.length - 1) * GAP + 2 * DIV;
    let x = -width / 2;
    keys.forEach((key, i) => {
      if (i === 4 || i === 6) {
        this.add(scene.add.rectangle(x + DIV / 2 - GAP / 2, -S / 2 - 4, 4, 40, 0x2c3868).setStrokeStyle(2, 0x1a1230));
        x += DIV;
      }
      const bg = slot(scene, x, -S, S);
      const cd = scene.add.rectangle(x + 4, -S + 4, S - 8, 0, 0x0d1226, 0.7).setOrigin(0);
      const cdText = scene.add.text(x + S / 2, -S / 2, '', typeStyle('h2', C.text)).setOrigin(0.5);
      const badge = scene.add.text(x + S - 5, -S + 3, '', typeStyle('badge', '#38b6ff')).setOrigin(1, 0);
      const label = scene.add.text(x + 6, -14, '', typeStyle('badge', C.text300));
      this.add([bg, cd, cdText, badge, label]);
      bg.setInteractive().on('pointerup', () => this.press(i));
      this.cells.push({ key, bg, cd, cdText, badge, label, x });
      x += S + GAP;
    });
    const net = Services.get('net');
    this.offs.push(net.addConsumer({ kinds: ['player'], apply: (ents) => this.onSnap(ents) }));
    this.offs.push(onCharacterChanged(() => this.refreshIcons()));
    this.refreshIcons();
    scene.events.on('update', this.tick, this);
    this.once('destroy', () => { this.offs.forEach((f) => f()); scene.events.off('update', this.tick, this); });
  }

  /** Clicking a slot does what its key does (one input frame). */
  private press(i: number): void {
    void this.heroInput; void i; // clicks are cosmetic for now: the keyboard drives combat
  }

  private onSnap(ents: EntityState[]): void {
    const me = Services.get('net').localPlayer;
    const e = ents.find((x) => x.kind === 'player' && x.owner === me);
    if (e?.data) this.data_ = e.data;
  }

  private setIcon(c: Cell, frame: string | undefined, scale: number): void {
    c.icon?.destroy();
    c.icon = undefined;
    const f = frame ? Art.tryFrame(frame) : undefined;
    if (!f) return;
    c.icon = this.scene.add.image(c.x + S / 2, -S / 2, f.key, f.frame).setScale(scale);
    this.addAt(c.icon, this.getIndex(c.cd));
  }

  refreshIcons(): void {
    const ch = character();
    this.cells.forEach((c, i) => {
      if (i < 4) {
        const sp = ch.hotbar[i] ? spellDef(ch.hotbar[i]!) : undefined;
        this.setIcon(c, sp?.icon, sp?.icon.startsWith('school_') ? 2 : 1);
      } else if (i === 4) this.setIcon(c, 'icon_potion_red', 1);
      else if (i === 5) this.setIcon(c, 'icon_potion_ember', 1);
      else if (i === 6) this.setIcon(c, 'school_storm', 2);
      else { const wpn = swungWith(); this.setIcon(c, Art.tryFrame(wpn.base) ? wpn.base : `w_${wpn.type}_wood`, 1); }
      // the same key names as the rest of the UI (core keyLabel); Space stays a glyph to fit the slot
      c.label.setText(keyLabel(c.key) === 'Space' ? '␣' : keyLabel(c.key));
    });
  }

  private tick(): void {
    const d = this.data_, ch = character();
    const em = Number(d.em ?? 0), st = Number(d.st ?? 0);
    this.cells.forEach((c, i) => {
      let left = 0, total = 1, badge = '', badgeColor = '#38b6ff', dim = false;
      if (i < 4) {
        const sp = ch.hotbar[i] ? spellDef(ch.hotbar[i]!) : undefined;
        left = Number(d[`c${i + 1}`] ?? 0); total = (sp?.cd ?? 1) * 1000;
        if (sp) { const cost = Math.round(spellCost(sp)); badge = sp.hpCost ? `${Math.round(sp.hpCost * 100)}%` : String(cost); dim = !sp.hpCost && em < cost; if (dim || sp.hpCost) badgeColor = '#ff4d5e'; }
      } else if (i < 6) {
        const ids = i === 4 ? ['i_hp_s', 'i_hp_l'] : ['i_em_s', 'i_em_l'];
        const qty = ch.inventory.filter((x) => ids.includes(x.base)).reduce((a, x) => a + x.qty, 0);
        left = Number(d[i === 4 ? 'cq' : 'ce'] ?? 0); total = 8000; badge = `×${qty}`; badgeColor = C.text; dim = qty === 0;
      } else if (i === 6) { badge = '25'; badgeColor = '#9be33f'; dim = st < 25; }
      else { left = Number(d.cs ?? 0); total = SLASH[swungWith().type].cd; }
      const k = Math.max(0, Math.min(1, left / Math.max(1, total)));
      c.cd.height = (S - 8) * k;
      c.cdText.setText(left > 600 ? String(Math.ceil(left / 1000)) : '');
      c.badge.setText(badge).setColor(badgeColor);
      c.icon?.setAlpha(dim ? 0.4 : 1);
    });
  }
}
