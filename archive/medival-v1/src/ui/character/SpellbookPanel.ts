/**
 * Spellbook / Loadout (board 8f): leather book, list page (filtered by school bookmarks) + detail page
 * (rank table, upgrade choices, glyph sockets), loadout bar (click a slot to assign the selected spell).
 */
import Phaser from 'phaser';
import { Registry, bus } from '@/core';
import type { MagicSchool, SpellDef, SpellId } from '@/core';
import { drawFrame, palette as P, schools } from '@/ui/kit';
import { P as PCURVE } from '@/systems/balance';
import { canRankSpell, rankSpell } from '@/systems/items/Runecraft';
import type { CharacterPanels, PanelView } from './CharacterPanels';
import { C, chip, dimScreen, hotspot, ironButton, itemSlot, schoolColor, spellSlot, txt } from './px';

const INK = C.inkOnParch, INK2 = C.parchDark, LEATHER = C.leather;
const PATRON: Record<MagicSchool, string> = {
  ash: 'ASHVAR, THE EMBER-TONGUE', rime: 'SAELA, THE TIDE-MOTHER', storm: 'CALUN, THE WANDERER',
  radiance: 'ITHREN, THE LANTERN', umbral: 'MORROW, THE VEILED', verdant: 'KETHRA, THE THORN',
};

type Filter = 'all' | 'powers' | MagicSchool;

export class SpellbookPanel implements PanelView {
  readonly container: Phaser.GameObjects.Container;
  private filter: Filter = 'all';
  private selected: SpellId | null = null;

  constructor(private readonly scene: Phaser.Scene, private readonly mgr: CharacterPanels) {
    this.container = scene.add.container(0, 0);
    this.refresh();
  }

  private get p() { return this.mgr.rt.player; }

  private known(): SpellDef[] {
    const ids = new Set<string>(Object.keys(this.p.gs.player.spellbook.known));
    for (const g of this.p.stats.collected.grants) ids.add(g);
    return [...ids].map((id) => Registry.tryGet('spell', id)).filter((s): s is SpellDef => !!s);
  }

  refresh(): void {
    const s = this.scene, c = this.container;
    c.removeAll(true);
    const g = s.add.graphics();
    c.add(g);
    dimScreen(s, g);
    c.add(s.add.zone(0, 0, s.scale.width, s.scale.height).setOrigin(0).setInteractive());
    // book
    g.fillStyle(P['ink-900'], 1).fillRect(94, 38, 1092, 524).fillRect(100, 44, 1092, 524);
    g.fillStyle(P['leather-800'], 1).fillRect(96, 40, 1088, 520);
    g.fillStyle(P['leather-500'], 1).fillRect(96, 40, 1088, 2).fillRect(96, 40, 2, 520);
    g.fillStyle(P['leather-900'], 1).fillRect(96, 558, 1088, 2).fillRect(1182, 40, 2, 520);
    drawFrame(g, 'parchment', 124, 60, 508, 480);
    drawFrame(g, 'parchment', 648, 60, 508, 480);
    g.fillStyle(P['ink-900'], 1).fillRect(630, 54, 20, 492);
    g.fillStyle(P['leather-900'], 1).fillRect(632, 56, 16, 488);
    g.fillStyle(P['leather-800'], 1).fillRect(632, 56, 2, 488);

    const all = this.known();
    if (!this.selected || !all.some((sp) => sp.id === this.selected)) this.selected = all[0]?.id ?? null;
    this.bookmarks(g, all);
    this.listPage(g, all);
    const sel = all.find((sp) => sp.id === this.selected);
    if (sel) this.detailPage(g, sel);
    this.loadout(g);
    this.mgr.footer(c, 694);
  }

  private bookmarks(g: Phaser.GameObjects.Graphics, all: SpellDef[]): void {
    const s = this.scene, c = this.container;
    const present = new Set(all.map((sp) => sp.school).filter((x): x is MagicSchool => !!x));
    const tabs: [Filter, string, number][] = [['all', 'ALL', P['parch-700']]];
    for (const sc of Object.keys(schools) as MagicSchool[]) if (present.has(sc)) tabs.push([sc, schools[sc].name.toUpperCase(), schools[sc].mid]);
    if (all.some((sp) => sp.abilityKind === 'power')) tabs.push(['powers', 'POWERS', P['iron-400']]);
    tabs.forEach(([f, label, col], i) => {
      const x = 1184, y = 72 + i * 62, on = this.filter === f;
      g.fillStyle(P['ink-900'], 1).fillRect(x - 2, y - 2, (on ? 44 : 36) + 4, 56);
      g.fillStyle(col, 1).fillRect(x, y, on ? 44 : 36, 52);
      g.fillStyle(P['ink-900'], 1).fillRect(x, y + 50, on ? 44 : 36, 2);
      const t = txt(s, x + (on ? 22 : 18), y + 26, label.slice(0, 3), 'micro', C.ink).setOrigin(0.5);
      c.add(t);
      hotspot(s, c, x, y, 44, 52, { click: () => { this.filter = f; this.refresh(); }, over: () => this.mgr.tooltip.show({ lines: [{ text: label }], accent: col }), out: () => this.mgr.tooltip.hide() });
    });
  }

  private listPage(g: Phaser.GameObjects.Graphics, all: SpellDef[]): void {
    const s = this.scene, c = this.container;
    const f = this.filter;
    const list = all.filter((sp) => f === 'all' || (f === 'powers' ? sp.abilityKind === 'power' : sp.school === f));
    const title = f === 'all' ? 'Spellbook' : f === 'powers' ? 'Powers' : schools[f].name;
    const titleCol = f === 'all' || f === 'powers' ? INK : `#${schools[f].lo.toString(16).padStart(6, '0')}`;
    c.add(txt(s, 148, 72, title, 'titleL', titleCol));
    c.add(txt(s, 608, 92, f === 'all' ? `${all.length} KNOWN` : f === 'powers' ? 'MARTIAL · ARCHERY · ASHMARK' : PATRON[f], 'micro', INK2).setOrigin(1, 0));
    g.fillStyle(P['parch-800'], 1).fillRect(148, 126, 460, 2);
    const sb = this.p.gs.player.spellbook;
    list.slice(0, 9).forEach((sp, i) => {
      const y = 136 + i * 44;
      const on = sp.id === this.selected;
      if (on) { g.fillStyle(P['parch-700'], 1).fillRect(144, y - 2, 468, 42); }
      spellSlot(g, sp, 150, y + 2, 36);
      c.add(txt(s, 196, y + 8, sp.name, 'bodyM', INK));
      const prog = sb.known[sp.id];
      const rank = prog?.rank ?? 1;
      for (let r = 0; r < 5; r++) {
        g.fillStyle(P['ink-900'], 1).fillRect(424 + r * 10, y + 14, 8, 8);
        g.fillStyle(r < rank ? schoolColor(sp).mid : P['parch-300'], 1).fillRect(426 + r * 10, y + 16, 4, 4);
      }
      const cost = sp.cost.mana ? `${sp.cost.mana}E` : sp.cost.stamina ? `${sp.cost.stamina}S` : sp.cost.resource ? `${sp.cost.resource}R` : '—';
      c.add(txt(s, 486, y + 12, cost, 'bodyS', INK2));
      c.add(txt(s, 540, y + 12, `${(sp.cooldownMs / 1000).toFixed(sp.cooldownMs < 2000 ? 1 : 0)}s`, 'bodyS', INK2));
      const slotIdx = sb.slots.indexOf(sp.id);
      if (slotIdx >= 0) c.add(txt(s, 600, y + 12, `${slotIdx + 1}`, 'micro', C.gold).setOrigin(1, 0));
      hotspot(s, c, 144, y - 2, 468, 42, { click: () => { this.selected = sp.id; this.refresh(); } });
    });
    if (this.p.cls?.resource.id === 'attunement') {
      c.add(txt(s, 148, 470, 'Attunement: casting one school then another spends stacks on a combo. Ash → Rime: Thermal Shock.', 'bodyS', INK2, 460));
    }
  }

  private detailPage(g: Phaser.GameObjects.Graphics, sp: SpellDef): void {
    const s = this.scene, c = this.container, p = this.p;
    const prog = p.gs.player.spellbook.known[sp.id] ?? { rank: 1, mastery: 0, choices: [], glyphs: [] };
    const rank = prog.rank;
    spellSlot(g, sp, 672, 76, 64);
    c.add(txt(s, 752, 80, sp.name, 'titleM', INK));
    const kindLabel = sp.school ? `${schools[sp.school].name} spell` : `${sp.discipline ?? 'martial'} power`;
    c.add(txt(s, 752, 116, `${kindLabel} · ${sp.delivery.kind} · rank ${rank} / 5`, 'bodyS', INK2));
    c.add(txt(s, 672, 152, sp.description, 'bodyS', LEATHER, 460));
    // rank table
    const lv = PCURVE(p.level);
    const mult = (r: number) => sp.ranks[r - 1]?.damageMult ?? 1;
    const dmg = (r: number) => sp.weaponDamagePct
      ? `${Math.round(sp.weaponDamagePct * mult(r) * 100)}% weapon`
      : sp.damage?.length ? sp.damage.map((d) => `${Math.round(d.min * lv * mult(r))}–${Math.round(d.max * lv * mult(r))} ${d.type}`).join(', ') : '—';
    const next = Math.min(5, rank + 1);
    const rowsT: [string, string, string][] = [
      ['Damage', dmg(rank), rank < 5 ? dmg(next) : ''],
      ['Cooldown', `${(sp.cooldownMs / 1000).toFixed(1)} s`, ''],
      ['Cost', sp.cost.mana ? `${sp.cost.mana} Ember` : sp.cost.stamina ? `${sp.cost.stamina} stamina` : sp.cost.resource ? `${sp.cost.resource} ${p.cls?.resource.name ?? ''}` : '—', ''],
      ['Cast time', sp.castTimeMs ? `${(sp.castTimeMs / 1000).toFixed(2)} s` : 'instant', ''],
      ['Buildup', Object.entries(sp.buildup ?? {}).map(([k, v]) => `${v} ${k}`).join(', ') || '—', ''],
    ];
    let y = 224;
    c.add(txt(s, 820, y, `RANK ${rank}`, 'micro', INK2));
    if (rank < 5) c.add(txt(s, 990, y, `RANK ${next}`, 'micro', '#347035'));
    y += 18;
    for (const [k, a, b] of rowsT) {
      c.add(txt(s, 672, y, k, 'bodyS', INK2));
      c.add(txt(s, 820, y, a, 'bodyS', INK, 166));
      if (b && b !== a) c.add(txt(s, 990, y, `${b} ▲`, 'bodyS', '#347035', 160));
      y += 22;
    }
    const nextXp = sp.ranks[rank]?.masteryXp;
    if (rank >= 3 && rank < 5) {
      const rc = canRankSpell(p.gs, sp.id);
      const cost = rc.cost ? `${rc.cost.items.map((x) => `${x.qty}× ${Registry.tryGet('item', x.item)?.name ?? x.item}`).join(', ')} · ${rc.cost.gold} gold` : '';
      ironButton(s, c, 672, y, 200, 30, `Upgrade to rank ${rank + 1}`, () => {
        const r = rankSpell(p.gs, sp.id);
        this.mgr.rt.ui?.toast(r.ok ? `${sp.name} reached rank ${rank + 1}` : r.reason, r.ok ? C.gold : C.bad);
        this.refresh();
      }, rc.ok ? 'gold' : 'normal');
      c.add(txt(s, 884, y + 6, rc.ok ? cost : `${rc.reason}${cost ? ` · ${cost}` : ''}`, 'bodyS', rc.ok ? INK2 : '#6b1d1f', 250));
    } else c.add(txt(s, 672, y + 6, rank >= 5 ? 'Mastered.' : `Mastery ${prog.mastery} / ${nextXp ?? '—'}: cast and hit to improve`, 'bodyS', INK2, 460));
    g.fillStyle(P['parch-800'], 1).fillRect(672, y + 36, 460, 2);
    y += 46;
    // upgrade choices
    const pending = sp.ranks.map((r, i) => ({ r, rankNo: i + 1 })).filter(({ r, rankNo }) => r.choices.length && rank >= rankNo);
    if (pending.length) c.add(txt(s, 672, y, 'Upgrades', 'titleS', INK));
    y += 30;
    for (const { r, rankNo } of pending) {
      const taken = r.choices.find((ch) => prog.choices.includes(ch.id));
      c.add(txt(s, 672, y + 6, `R${rankNo}`, 'micro', INK2));
      if (taken) { c.add(txt(s, 704, y + 4, `${taken.name}: ${taken.description}`, 'bodyS', '#347035', 420)); y += 30; continue; }
      r.choices.forEach((ch, i) => {
        ironButton(s, c, 704 + i * 214, y, 206, 28, ch.name, () => {
          const pr = p.gs.player.spellbook.known[sp.id];
          if (!pr || r.choices.some((x) => pr.choices.includes(x.id))) return;
          pr.choices.push(ch.id);
          bus.emit('spell:ranked', { spellId: sp.id, rank: pr.rank });
          this.refresh();
        }, 'gold');
        hotspot(s, c, 704 + i * 214, y, 206, 28, { over: () => this.mgr.tooltip.show({ lines: [{ text: ch.name, size: 'title' }, { text: ch.description, color: C.magic }], accent: P['gold-500'] }), out: () => this.mgr.tooltip.hide() });
      });
      y += 36;
    }
    // glyph sockets
    const sockets = sp.ranks[rank - 1]?.glyphSockets ?? 0;
    const maxSockets = sp.ranks[4]?.glyphSockets ?? 0;
    if (maxSockets) {
      c.add(txt(s, 672, 470, 'Glyph sockets', 'titleS', INK));
      for (let i = 0; i < maxSockets; i++) {
        const x = 820 + i * 46, yy = 470;
        const open = i < sockets;
        g.fillStyle(P['ink-900'], 1);
        for (let k = 0; k < 20; k += 2) { const w = 20 - Math.abs(10 - k) * 2 + 4; g.fillRect(x + 20 - w / 2, yy + k * 2, w, 4); }
        const gUid = open ? prog.glyphs[i] : undefined;
        const gInst = gUid ? p.gs.player.inventory.items.find((it) => it.uid === gUid) : undefined;
        const gDef = gInst ? Registry.tryGet('item', gInst.def) : undefined;
        g.fillStyle(gDef ? parseInt(gDef.icon.color.replace('#', ''), 16) : open ? P['parch-700'] : P['stone-600'], 1);
        for (let k = 2; k < 18; k += 2) { const w = 16 - Math.abs(10 - k) * 2 + 4; if (w > 0) g.fillRect(x + 20 - w / 2, yy + k * 2, w, 4); }
        if (!open) continue;
        hotspot(s, c, x, yy, 40, 40, {
          over: () => this.mgr.tooltip.show(gDef?.glyph
            ? { lines: [{ text: gDef.name, size: 'title' }, { text: gDef.description, color: C.magic }, { text: 'Click: next glyph · right-click: remove', color: C.muted, size: 'micro' }], accent: P['mana-500'] }
            : { lines: [{ text: 'Empty socket', size: 'title' }, { text: 'Click to socket a compatible glyph from your pack.', color: C.muted }], accent: P['stone-500'] }),
          out: () => this.mgr.tooltip.hide(),
          click: (right) => {
            const known = p.gs.player.spellbook.known[sp.id];
            if (!known) return;
            if (right) { known.glyphs.splice(i, 1); this.refresh(); return; }
            const used = new Set(Object.values(p.gs.player.spellbook.known).flatMap((k) => k?.glyphs ?? []));
            const options = p.gs.player.inventory.items.filter((it) => {
              const gd = Registry.tryGet('item', it.def)?.glyph;
              return gd && gd.appliesTo.some((t) => sp.tags.includes(t)) && (!used.has(it.uid) || it.uid === gUid);
            });
            if (!options.length) { this.mgr.rt.ui?.toast('No compatible glyphs in your pack', C.muted); return; }
            const idx = gUid ? (options.findIndex((o) => o.uid === gUid) + 1) % options.length : 0;
            known.glyphs[i] = options[idx].uid;
            known.glyphs = known.glyphs.filter(Boolean);
            this.mgr.tooltip.hide();
            this.refresh();
          },
        });
      }
      const filled = prog.glyphs.slice(0, sockets).length;
      c.add(txt(s, 820 + maxSockets * 46 + 6, 482, sockets ? `${filled}/${sockets} socketed` : 'unlocks at rank 2', 'bodyS', INK2));
    }
  }

  private loadout(g: Phaser.GameObjects.Graphics): void {
    const s = this.scene, c = this.container, p = this.p;
    drawFrame(g, 'iron', 96, 592, 1088, 96);
    c.add(txt(s, 124, 604, 'Loadout', 'titleS', C.gold));
    c.add(txt(s, 124, 636, 'Click a slot to put the selected spell there · right-click clears', 'bodyS', C.text2, 230));
    const sb = p.gs.player.spellbook;
    const n = Math.min(6, p.stats.derived.abilitySlots);
    while (sb.slots.length < n) sb.slots.push(null);
    for (let i = 0; i < n; i++) {
      const x = 380 + i * 76, y = 608;
      const id = sb.slots[i];
      const def = id ? Registry.tryGet('spell', id) : undefined;
      spellSlot(g, def, x, y, 64, id && id === this.selected ? 'selected' : 'normal');
      c.add(chip(s, g, x + 2, y + 2, String(i + 1)));
      hotspot(s, c, x, y, 64, 64, {
        over: () => def && this.mgr.tooltip.show({ lines: [{ text: def.name, size: 'title' }, { text: def.description, color: C.magic }], accent: schoolColor(def).mid }),
        out: () => this.mgr.tooltip.hide(),
        click: (right) => {
          if (right) sb.slots[i] = null;
          else if (this.selected) {
            const prev = sb.slots.indexOf(this.selected);
            if (prev >= 0) sb.slots[prev] = sb.slots[i];
            sb.slots[i] = this.selected;
          }
          this.mgr.tooltip.hide();
          this.refresh();
        },
      });
    }
    const dx = 380 + n * 76;
    g.fillStyle(P['iron-600'], 1).fillRect(dx, 612, 2, 56);
    g.fillStyle(P['ink-900'], 1).fillRect(dx + 2, 612, 2, 56);
    p.gs.player.equipment.quickslots.forEach((id, i) => {
      const x = dx + 16 + i * 60;
      const def = id ? Registry.tryGet('item', id) : undefined;
      itemSlot(g, def, def ? 'common' : null, x, 616, 48);
      c.add(chip(s, g, x + 2, 618, i === 0 ? 'Q' : 'E'));
    });
    ironButton(s, c, 1040, 610, 120, 28, 'Auto-fill', () => {
      for (const sp of this.known()) {
        if (sb.slots.includes(sp.id)) continue;
        const free = sb.slots.indexOf(null);
        if (free < 0 || free >= n) break;
        sb.slots[free] = sp.id;
      }
      this.refresh();
    });
    ironButton(s, c, 1040, 646, 120, 28, 'Clear', () => { for (let i = 0; i < sb.slots.length; i++) sb.slots[i] = null; this.refresh(); });
  }

  destroy(): void { this.container.destroy(true); }
}
