/**
 * Combat HUD (board 8c) mounted into Claude 1's HUD scene:
 *   anchors.bottom  ability bar (56px slots, key chips, cooldown dither, out-of-resource), Q/E/R slots,
 *                   class-resource bar above, XP strip below
 *   anchors.topLeft buff row + debuff row (32px icons, 4px gaps, duration strip)
 *   top centre      boss frame;  centre  toasts.  Also hosts the character panels.
 */
import Phaser from 'phaser';
import { Registry, SceneKeys } from '@/core';
import type { StatusId } from '@/core';
import { Bar, checker, drawFrame, drawSlot, outlinedStyle, palette as P } from '@/ui/kit';
import type { CombatRuntime, RuntimeUi } from '@/systems/runtime/CombatRuntime';
import { xpProgress } from '@/systems/progression/Leveling';
import { countItem } from '@/systems/items/Inventory';
import { CharacterPanels } from './CharacterPanels';
import { C, chip, itemSlot, spellSlot, txt } from './px';

type HudLike = Phaser.Scene & { anchors?: Record<string, Phaser.GameObjects.Container> };

const SLOT = 56, STEP = 64, SMALL = 48;
const BUFFS = new Set<StatusId>(['haste', 'regen', 'ward', 'stealth']);
const STATUS_ABBR: Partial<Record<StatusId, string>> = {
  burn: 'BRN', poison: 'PSN', chill: 'CHL', frozen: 'FRZ', shock: 'SHK', slow: 'SLW', root: 'RT', stagger: 'STG', exposed: 'EXP',
  vulnerable: 'VUL', weaken: 'WK', blind: 'BLD', silence: 'SIL', fear: 'FER', haste: 'HST', regen: 'RGN', ward: 'WRD', stealth: 'STL',
};

interface SlotText { key: Phaser.GameObjects.Text; label: Phaser.GameObjects.Text; cd: Phaser.GameObjects.Text }

export class CombatHud implements RuntimeUi {
  private hud: HudLike | null = null;
  private barG?: Phaser.GameObjects.Graphics;
  private iconG?: Phaser.GameObjects.Graphics;
  private slotTexts: SlotText[] = [];
  private smallTexts: SlotText[] = [];
  private resLabel?: Phaser.GameObjects.Text;
  private resBar?: Bar;
  private xpBar?: Bar;
  private builtFor = -1;
  private statusG?: Phaser.GameObjects.Graphics;
  private statusTexts: Phaser.GameObjects.Text[] = [];
  private bossG?: Phaser.GameObjects.Graphics;
  private bossName?: Phaser.GameObjects.Text;
  private bossSub?: Phaser.GameObjects.Text;
  private bossBar?: Bar;
  private toastText?: Phaser.GameObjects.Text;
  private pendingToasts: { text: string; color: string }[] = [];
  private panels?: CharacterPanels;
  private lastNow = 0;

  constructor(private readonly world: Phaser.Scene, private readonly rt: CombatRuntime) {}

  private findHud(): HudLike | null {
    const s = this.world.scene.get(SceneKeys.Hud) as HudLike | null;
    return s && s.sys.isActive() && s.anchors?.bottom && s.anchors.topLeft ? s : null;
  }

  private mount(h: HudLike): void {
    this.hud = h;
    const W = h.scale.width;
    this.statusG = h.add.graphics();
    h.anchors!.topLeft.add(this.statusG);
    this.bossG = h.add.graphics().setVisible(false);
    this.bossName = txt(h, W / 2, 32, '', 'titleS', C.text).setOrigin(0.5, 0).setVisible(false);
    this.bossSub = txt(h, W / 2, 34, '', 'bodyS', C.text2).setOrigin(0, 0).setVisible(false);
    this.bossBar = new Bar(h, 384 + 16, 24 + 36, 480, 14, 'hp').setVisible(false);
    this.toastText = h.add.text(W / 2, 112, '', outlinedStyle('titleS', C.gold)).setOrigin(0.5).setAlpha(0).setDepth(20);
    this.panels = new CharacterPanels(h, this.rt);
    for (const t of this.pendingToasts) this.toast(t.text, t.color);
    this.pendingToasts = [];
  }

  /** (re)build the ability bar for n open slots */
  private buildBar(n: number): void {
    const h = this.hud!;
    const bottom = h.anchors!.bottom;
    for (const s of [...this.slotTexts, ...this.smallTexts]) { s.key.destroy(); s.label.destroy(); s.cd.destroy(); }
    this.barG?.destroy(); this.iconG?.destroy(); this.resLabel?.destroy(); this.resBar?.destroy(); this.xpBar?.destroy();
    this.slotTexts = []; this.smallTexts = [];
    const fw = 12 + n * STEP + 14 + 3 * (SMALL + 8) + 4;
    const x0 = -Math.round(fw / 2);
    this.barG = h.add.graphics();
    this.iconG = h.add.graphics();
    bottom.add([this.barG, this.iconG]);
    const mk = (x: number, y: number, size: number, key: string): SlotText => {
      const k = txt(h, x + 4, y + 4, key, 'micro', C.ink);
      const label = txt(h, x + size / 2, y + size - 14, '', 'micro', C.text).setOrigin(0.5, 0);
      const cd = h.add.text(x + size / 2, y + size / 2, '', outlinedStyle('bodyM', C.text)).setOrigin(0.5);
      bottom.add([label, cd, k]);
      return { key: k, label, cd };
    };
    for (let i = 0; i < n; i++) this.slotTexts.push(mk(x0 + 12 + i * STEP, -80, SLOT, String(i + 1)));
    const sx = x0 + 12 + n * STEP + 14;
    ['Q', 'E', 'R'].forEach((k, i) => this.smallTexts.push(mk(sx + i * (SMALL + 8), -76, SMALL, k)));
    this.resLabel = txt(h, x0, -116, '', 'micro', C.gold);
    this.resBar = new Bar(h, x0 + 120, -112, fw - 120, 8, P['gold-500']);
    this.xpBar = new Bar(h, x0, -8, fw, 4, 'xp');
    bottom.add([this.resLabel, this.resBar, this.xpBar]);
    this.builtFor = n;
  }

  toast(text: string, color: string = C.gold): void {
    const h = this.hud;
    if (!h || !this.toastText) { this.pendingToasts.push({ text, color }); return; }
    h.tweens.killTweensOf(this.toastText);
    this.toastText.setText(text).setColor(color).setAlpha(1);
    h.tweens.add({ targets: this.toastText, alpha: 0, delay: 2200, duration: 500, ease: 'Stepped', easeParams: [4] });
  }

  update(rt: CombatRuntime, now: number): void {
    if (!this.hud) {
      const h = this.findHud();
      if (!h) return;
      this.mount(h);
    }
    const dt = this.lastNow ? now - this.lastNow : 16;
    this.lastNow = now;
    const p = rt.player;
    const n = Math.min(6, p.stats.derived.abilitySlots);
    if (n !== this.builtFor) this.buildBar(n);
    this.drawBar(rt, now, n);
    this.drawStatuses(rt, now);
    this.drawBoss(rt, dt);
    this.panels?.update();
  }

  private drawBar(rt: CombatRuntime, now: number, n: number): void {
    const p = rt.player, gs = p.gs, h = this.hud!;
    const g = this.barG!.clear(), ig = this.iconG!.clear();
    const fw = 12 + n * STEP + 14 + 3 * (SMALL + 8) + 4;
    const x0 = -Math.round(fw / 2);
    drawFrame(g, 'iron', x0, -92, fw, 76);
    const sb = gs.player.spellbook;
    for (let i = 0; i < n; i++) {
      const x = x0 + 12 + i * STEP, y = -80;
      const id = sb.slots[i];
      const def = id ? Registry.tryGet('spell', id) : undefined;
      spellSlot(ig, def, x, y, SLOT);
      const t = this.slotTexts[i];
      chip(h, ig, x + 2, y + 2, String(i + 1)).destroy(); // chip background only; label text kept below
      t.key.setPosition(x + 6, y + 5);
      // cooldown dither + seconds; out-of-resource dither
      const ready = def ? p.cooldowns.get(def.id) ?? 0 : 0;
      const left = Math.max(0, ready - now);
      const oom = !!def && ((def.cost.stamina ?? 0) > 0 && p.stamina <= 0 || (def.cost.resource ?? 0) > p.resource);
      if (left > 0) {
        const total = def!.cooldownMs * (1 - p.stats.derived.cooldownReduction);
        const hh = Math.round(((SLOT - 12) * Math.min(1, left / total)) / 2) * 2;
        checker(ig, x + 6, y + 6 + (SLOT - 12 - hh), SLOT - 12, hh, P['ink-900']);
      } else if (oom) checker(ig, x + 6, y + 6, SLOT - 12, SLOT - 12, P['mana-900']);
      t.cd.setText(left > 0 ? (left < 3000 ? (left / 1000).toFixed(1) : String(Math.ceil(left / 1000))) : '');
      // overdraw warning: spell would cost HP
      if (def?.cost.mana && def.cost.mana > p.mana && left <= 0) ig.fillStyle(P['flame-500'], 1).fillRect(x + SLOT - 12, y + 8, 4, 4);
    }
    // divider
    const dx = x0 + 12 + n * STEP + 4;
    ig.fillStyle(P['iron-600'], 1).fillRect(dx, -76, 2, 48);
    ig.fillStyle(P['ink-900'], 1).fillRect(dx + 2, -76, 2, 48);
    // Q / E / R
    const qs = gs.player.equipment.quickslots;
    const sx = x0 + 12 + n * STEP + 14;
    [0, 1].forEach((i) => {
      const id = qs[i];
      const def = id ? Registry.tryGet('item', id) : undefined;
      const x = sx + i * (SMALL + 8);
      itemSlot(ig, def, def ? 'common' : null, x, -76, SMALL);
      chip(h, ig, x + 2, -74, i === 0 ? 'Q' : 'E').destroy();
      this.smallTexts[i].key.setPosition(x + 6, -71);
      const cnt = def ? countItem(gs, def.id) : 0;
      this.smallTexts[i].label.setText(def ? `${cnt}` : '').setColor(cnt ? C.text : C.bad);
    });
    const d = gs.player.inventory.draught;
    const rx = sx + 2 * (SMALL + 8);
    drawSlot(ig, rx, -76, SMALL, d.charges ? P['stam-500'] : P['stone-700'], d.charges ? P['stam-900'] : P['ink-800']);
    ig.fillStyle(P['ink-900'], 1).fillRect(rx + 17, -63, 14, 22);
    ig.fillStyle(d.charges ? P['blood-400'] : P['stone-700'], 1).fillRect(rx + 19, -57, 10, 14);
    ig.fillStyle(P['parch-700'], 1).fillRect(rx + 21, -61, 6, 4);
    chip(h, ig, rx + 2, -74, 'R').destroy();
    this.smallTexts[2].key.setPosition(rx + 6, -71);
    this.smallTexts[2].label.setText(`${d.charges}/${d.maxCharges}`).setColor(d.charges ? C.good : C.muted);
    // class resource + XP
    const res = p.cls?.resource;
    if (res) {
      this.resBar!.setVisible(true).setValue(p.resource, res.max);
      this.resLabel!.setText(`${res.name.toUpperCase()} ${Math.floor(p.resource)}/${res.max}`);
    } else { this.resBar!.setVisible(false); this.resLabel!.setText(''); }
    const xp = xpProgress(gs);
    this.xpBar!.setValue(xp.pct, 1);
  }

  private drawStatuses(rt: CombatRuntime, now: number): void {
    const h = this.hud!, g = this.statusG!.clear();
    for (const t of this.statusTexts) t.destroy();
    this.statusTexts = [];
    const p = rt.player;
    type Entry = { label: string; frac: number; stacks: number; buff: boolean };
    const buffs: Entry[] = [], debuffs: Entry[] = [];
    for (const st of p.status.active.values()) {
      const dur = Math.max(1, st.until - now);
      (BUFFS.has(st.id) ? buffs : debuffs).push({ label: STATUS_ABBR[st.id] ?? st.id.slice(0, 3).toUpperCase(), frac: Math.min(1, dur / 6000), stacks: st.stacks, buff: BUFFS.has(st.id) });
    }
    for (const b of p.buffs) {
      const name = b.id.startsWith('consumable:') ? b.id.slice(11) : Registry.tryGet('spell', b.id as `spell:${string}`)?.name ?? b.id;
      buffs.push({ label: name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase(), frac: Math.min(1, (b.until - now) / 10000), stacks: 1, buff: true });
    }
    if (p.ward > 0) buffs.push({ label: 'WRD', frac: Math.min(1, (p.wardUntil - now) / 8000), stacks: 1, buff: true });
    const cl = p.gs.player.progression.cinderlung ?? 0;
    if (cl > 0) debuffs.push({ label: 'CIN', frac: 1, stacks: cl, buff: false });
    const row = (list: Entry[], y: number) => list.slice(0, 10).forEach((e, i) => {
      const x = i * 36;
      drawSlot(g, x, y, 32, e.buff ? P['stam-300'] : P['blood-400'], e.buff ? P['stam-900'] : P['blood-900']);
      g.fillStyle(P['ink-900'], 1).fillRect(x + 2, y + 36, 28, 6);
      g.fillStyle(e.buff ? P['stam-300'] : P['blood-400'], 1).fillRect(x + 4, y + 38, Math.max(2, Math.round((24 * e.frac) / 2) * 2), 2);
      this.statusTexts.push(txt(h, x + 16, y + 10, e.label, 'micro', e.buff ? C.good : C.bad).setOrigin(0.5, 0));
      if (e.stacks > 1) this.statusTexts.push(txt(h, x + 30, y + 30, `x${e.stacks}`, 'micro', C.goldHi).setOrigin(1, 1));
    });
    row(buffs, 0);
    row(debuffs, 48);
    for (const t of this.statusTexts) h.anchors!.topLeft.add(t);
    // unspent points hint
    const pr = p.gs.player.progression;
    const hint = [pr.unspentSkillPoints ? `[K] ${pr.unspentSkillPoints} SKILL` : '', pr.unspentAttributePoints ? `[C] ${pr.unspentAttributePoints} ATTR` : ''].filter(Boolean).join('  ');
    if (hint) { const t = txt(h, 0, 100, hint, 'micro', C.goldHi); h.anchors!.topLeft.add(t); this.statusTexts.push(t); }
  }

  private drawBoss(rt: CombatRuntime, dt: number): void {
    const boss = rt.enemies.find((e) => e.alive && e.isBoss && (e.isEngaged() || e.subdued));
    const vis = !!boss;
    this.bossG!.setVisible(vis); this.bossName!.setVisible(vis); this.bossSub!.setVisible(vis); this.bossBar!.setVisible(vis);
    if (!boss) return;
    const g = this.bossG!.clear();
    drawFrame(g, 'iron', 384, 24, 512, 64);
    const name = boss.subdued ? `${boss.def.name}` : boss.displayName;
    this.bossName!.setText(name).setPosition(640, 30);
    this.bossSub!.setText(boss.subdued ? '· subdued: [F] purge' : '').setPosition(Math.round(640 + this.bossName!.width / 2 + 8), 36);
    this.bossBar!.setValue(boss.hp, boss.maxHp);
    this.bossBar!.tickGhost(dt);
    // phase thresholds
    for (const ph of boss.def.phases ?? []) g.fillStyle(P['ink-900'], 1).fillRect(400 + Math.round(480 * ph.atHpPct), 58, 2, 18);
    if (boss.def.cleansable) g.fillStyle(P['gold-400'], 1).fillRect(400 + Math.round(480 * boss.def.cleansable.atHpPct), 58, 2, 18);
  }

  destroy(): void {
    this.panels?.destroy();
    for (const s of [...this.slotTexts, ...this.smallTexts]) { s.key.destroy(); s.label.destroy(); s.cd.destroy(); }
    for (const t of this.statusTexts) t.destroy();
    this.barG?.destroy(); this.iconG?.destroy(); this.statusG?.destroy(); this.resLabel?.destroy(); this.resBar?.destroy(); this.xpBar?.destroy();
    this.bossG?.destroy(); this.bossName?.destroy(); this.bossSub?.destroy(); this.bossBar?.destroy(); this.toastText?.destroy();
  }
}
