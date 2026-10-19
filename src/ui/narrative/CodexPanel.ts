import Phaser from 'phaser';
import { Registry } from '@/core';
import type { LoreCategory, LoreEntry, LoreId } from '@/core';
import { C, typeStyle } from '@/ui/kit/hc';
import { isUnlocked, unlockedSections } from '@/narrative/engine/codex';

// No handoff board for the codex: built from the HC kit in the Journal/Settings language (Claude 1).
// Title (48,28) · ✕ · categories column 220 wide at (48,100) · entries panel 320×588 at (284,100) ·
// article panel 612×588 at (620,100), scrolls with the wheel; footer: see also, Read (books), paging.
const NAV = { x: 48, y: 100, w: 220, row: 44, gap: 4 };
const LIST = { x: 284, y: 100, w: 320, h: 588, row: 56 };
const ART = { x: 620, y: 100, w: 612, h: 588 };
const CATS: { id: LoreCategory; name: string; c: string }[] = [
  { id: 'cosmology', name: 'Cosmology', c: '#7fe3ff' }, { id: 'gods', name: 'Gods', c: '#ffe27a' },
  { id: 'magic', name: 'Magic', c: '#ff8a5c' }, { id: 'history', name: 'History', c: '#d9c49a' },
  { id: 'factions', name: 'Factions', c: '#ff6b7f' }, { id: 'peoples', name: 'Peoples', c: '#8ce07a' },
  { id: 'places', name: 'Places', c: '#9fb0d8' }, { id: 'characters', name: 'Characters', c: '#e0a878' },
  { id: 'bestiary', name: 'Bestiary', c: '#b7c0e3' }, { id: 'culture', name: 'Culture', c: '#6ee0b0' },
  { id: 'books', name: 'Books', c: '#c9a2ff' },
];
const hexN = (s: string) => parseInt(s.slice(1), 16);

/** The codex (L): categories, entries (locked ones as ???), and an article with progressive sections. Logic: Claude 4. */
export class CodexPanel extends Phaser.GameObjects.Container {
  private parts: Phaser.GameObjects.GameObject[] = [];
  private article: Phaser.GameObjects.Container;
  private cat: LoreCategory = 'cosmology';
  private sel: LoreId | null = null;
  private listScroll = 0;
  private artScroll = 0;
  private artHeight = 0;

  constructor(scene: Phaser.Scene, private onRead?: (id: LoreId) => void) {
    super(scene, 0, 0);
    this.article = scene.add.container(ART.x + 28, ART.y + 24);
    this.article.setMask(scene.make.graphics({}, false).fillRect(ART.x + 8, ART.y + 8, ART.w - 16, ART.h - 72).createGeometryMask());
    this.add(this.article);
    scene.input.on('wheel', (p: Phaser.Input.Pointer, _o: unknown, _dx: number, dy: number) => {
      if (!this.visible) return;
      if (p.x >= ART.x) {
        this.artScroll = Phaser.Math.Clamp(this.artScroll + dy * 0.5, 0, Math.max(0, this.artHeight - (ART.h - 96)));
        this.article.y = ART.y + 24 - this.artScroll;
      } else if (p.x >= LIST.x) { this.listScroll = Math.max(0, this.listScroll + Math.sign(dy)); this.render(); }
    });
    this.setDepth(20).setVisible(false);
    scene.add.existing(this);
  }

  open(entry?: LoreId): void {
    const all = Registry.all('lore') as LoreEntry[];
    const first = entry ?? this.sel ?? all.find((e) => isUnlocked(e.id))?.id ?? null;
    if (first) { this.sel = first; this.cat = (Registry.tryGet('lore', first) as LoreEntry | undefined)?.category ?? this.cat; }
    this.setVisible(true);
    this.render();
  }

  close(): void { this.setVisible(false); }

  private entriesIn(cat: LoreCategory): LoreEntry[] {
    return (Registry.all('lore') as LoreEntry[]).filter((e) => e.category === cat && (isUnlocked(e.id) || !e.hidden))
      .sort((a, b) => Number(isUnlocked(b.id)) - Number(isUnlocked(a.id)) || a.name.localeCompare(b.name));
  }

  private render(): void {
    this.parts.forEach((o) => o.destroy());
    this.parts = [];
    this.article.removeAll(true);
    const sc = this.scene;
    const { width: W, height: H } = sc.scale;
    this.keep(sc.add.rectangle(0, 0, W, H, 0x0d1226, 0.9).setOrigin(0).setInteractive());
    const all = Registry.all('lore') as LoreEntry[];
    const found = all.filter((e) => isUnlocked(e.id)).length;
    const title = this.keep(sc.add.text(48, 28, 'Codex', { ...typeStyle('displayL', C.text), shadow: { offsetX: 3, offsetY: 3, color: C.ink, fill: true } }));
    const bx = 48 + title.width + 28;
    this.keep(sc.add.text(bx, 40, `Discovered ${found} of ${all.length}`, typeStyle('body', C.text300)));
    this.keep(sc.add.rectangle(bx, 64, 240, 10, 0x0b0f22).setOrigin(0).setStrokeStyle(2, 0x1a1230));
    this.keep(sc.add.rectangle(bx, 64, 240 * (found / Math.max(1, all.length)), 10, 0xffc43d).setOrigin(0));
    this.keep(sc.add.text(W - 104, 50, 'L · Esc close', typeStyle('caption', '#7884b5')).setOrigin(1, 0.5));

    // categories (only those with something to show)
    let ny = NAV.y;
    for (const c of CATS) {
      const list = this.entriesIn(c.id);
      if (!list.length) continue;
      const on = c.id === this.cat;
      const bg = this.keep(sc.add.nineslice(NAV.x, ny, on ? 'ui:tab_active' : 'ui:tab', undefined, NAV.w, NAV.row, 8, 8, 8, 8).setOrigin(0));
      this.keep(sc.add.rectangle(NAV.x + 20, ny + NAV.row / 2, 10, 10, hexN(c.c)).setRotation(Math.PI / 4).setStrokeStyle(2, 0x1a1230));
      this.keep(sc.add.text(NAV.x + 36, ny + NAV.row / 2, c.name, typeStyle('h3', on ? C.text : C.text300)).setOrigin(0, 0.5));
      this.keep(sc.add.text(NAV.x + NAV.w - 12, ny + NAV.row / 2, `${list.filter((e) => isUnlocked(e.id)).length}/${list.length}`, { ...typeStyle('badge', '#7884b5'), fontStyle: '700' }).setOrigin(1, 0.5));
      bg.setInteractive({ useHandCursor: true }).on('pointerup', () => { this.cat = c.id; this.listScroll = 0; this.sel = this.entriesIn(c.id).find((e) => isUnlocked(e.id))?.id ?? null; this.artScroll = 0; this.render(); });
      ny += NAV.row + NAV.gap;
    }

    // entries
    this.keep(sc.add.nineslice(LIST.x, LIST.y, 'ui:panel', undefined, LIST.w, LIST.h, 8, 8, 8, 8).setOrigin(0));
    const entries = this.entriesIn(this.cat);
    const rows = Math.floor((LIST.h - 24) / LIST.row);
    this.listScroll = Math.min(this.listScroll, Math.max(0, entries.length - rows));
    entries.slice(this.listScroll, this.listScroll + rows).forEach((e, i) => this.entryRow(e, LIST.x + 12, LIST.y + 12 + i * LIST.row));
    if (entries.length > rows) this.keep(sc.add.text(LIST.x + LIST.w - 16, LIST.y + LIST.h - 10, `▼ ${entries.length - rows - this.listScroll} more`, typeStyle('caption', '#7884b5')).setOrigin(1, 1));

    // article
    this.keep(sc.add.nineslice(ART.x, ART.y, 'ui:panel', undefined, ART.w, ART.h, 8, 8, 8, 8).setOrigin(0));
    this.bringToTop(this.article);
    const e = this.sel ? (Registry.tryGet('lore', this.sel) as LoreEntry | undefined) : undefined;
    if (e && isUnlocked(e.id)) this.renderArticle(e, entries);
    else this.atext(0, 40, 'Nothing recorded yet. Explore, read and listen.', typeStyle('bodyL', C.text300, ART.w - 56));
  }

  private entryRow(e: LoreEntry, x: number, y: number): void {
    const sc = this.scene;
    const open = isUnlocked(e.id), on = e.id === this.sel;
    const w = LIST.w - 24;
    const bg = this.keep(sc.add.nineslice(x, y, on ? 'ui:panel_gold' : 'ui:btn_slate', undefined, w, LIST.row - 6, 8, 8, 8, 8).setOrigin(0).setAlpha(open ? 1 : 0.6));
    const c = CATS.find((k) => k.id === e.category)?.c ?? C.text300;
    this.keep(sc.add.rectangle(x + 24, y + (LIST.row - 6) / 2, 12, 12, open ? hexN(c) : 0x3a4370).setRotation(Math.PI / 4).setStrokeStyle(2, 0x1a1230));
    const name = this.keep(sc.add.text(x + 44, y + 9, open ? e.name : '???', { fontFamily: '"Jersey 10"', fontSize: '20px', color: on ? '#ffe27a' : open ? C.text : C.text500 }));
    this.fit(name, w - 56);
    const sub = this.keep(sc.add.text(x + 44, y + 31, open ? (e.source ? 'From an in-world text' : this.summary(e)) : this.hint(e), typeStyle('caption', '#7884b5')));
    this.fit(sub, w - 56);
    if (open) bg.setInteractive({ useHandCursor: true }).on('pointerup', () => { this.sel = e.id; this.artScroll = 0; this.render(); });
  }

  private renderArticle(e: LoreEntry, siblings: LoreEntry[]): void {
    const sc = this.scene;
    const w = ART.w - 56;
    const opened = siblings.filter((s) => isUnlocked(s.id));
    const idx = opened.findIndex((s) => s.id === e.id);
    const cat = CATS.find((c) => c.id === e.category);
    let y = 0;
    const chip = this.atext(0, y, (cat?.name ?? '').toUpperCase(), { ...typeStyle('badge', C.ink), fontStyle: '700', backgroundColor: cat?.c ?? C.gold, padding: { x: 8, y: 2 } });
    if (e.source) this.atext(chip.width + 10, y + 1, e.source.slice(0, 60), typeStyle('caption', C.text300, w - chip.width - 110));
    this.atext(w, y + 1, `Entry ${idx + 1} of ${opened.length}`, typeStyle('caption', '#7884b5')).setOrigin(1, 0);
    y += 26;
    y += this.atext(0, y, e.name, { fontFamily: '"Jersey 10"', fontSize: '40px', color: C.text, wordWrap: { width: w } }).setLineSpacing(-6).height + 10;
    // drop cap beside the first paragraph
    const [first, ...rest] = e.body.split(/\n\s*\n/);
    const capBox = sc.add.rectangle(0, y, 72, 72, 0x0b0f22).setOrigin(0).setStrokeStyle(2, hexN(cat?.c ?? C.gold));
    this.article.add(capBox);
    const letter = first.trimStart()[0] ?? '';
    this.atext(36, y + 36, letter, { fontFamily: '"Jersey 10"', fontSize: '64px', color: '#ffe27a' }).setOrigin(0.5);
    const body = { ...typeStyle('body', C.text), fontSize: '14px', lineSpacing: 7 } as Phaser.Types.GameObjects.Text.TextStyle;
    const p1 = this.atext(88, y, first.trimStart().slice(1), { ...body, wordWrap: { width: w - 88 } });
    y += Math.max(84, p1.height + 14);
    for (const para of rest) y += this.atext(0, y, para.trim(), { ...body, wordWrap: { width: w } }).height + 14;
    // progressive sections
    const unlocked = unlockedSections(e.id);
    for (const s of e.sections ?? []) {
      if (unlocked.includes(s.id)) {
        if (s.title) y += this.atext(0, y, s.title, { fontFamily: '"Jersey 10"', fontSize: '24px', color: '#ffc43d' }).height + 4;
        for (const para of s.body.split(/\n\s*\n/)) y += this.atext(0, y, para.trim(), { ...body, wordWrap: { width: w } }).height + 14;
      } else {
        y += this.atext(0, y, `${s.title ?? 'Unwritten'} · locked`, { fontFamily: '"Jersey 10"', fontSize: '22px', color: '#7884b5' }).height + 6;
        let bx = 0;
        for (const bw of [120, 60, 150, 90, 130, 70]) {
          if (bx + bw > w) { bx = 0; y += 20; }
          this.article.add(sc.add.rectangle(bx, y + 2, bw, 12, 0x212b52).setOrigin(0));
          bx += bw + 8;
        }
        y += 24;
        if (s.hint) y += this.atext(0, y, `Hint: ${s.hint}`, typeStyle('caption', C.text300, w)).height + 10;
      }
    }
    this.artHeight = y;
    this.article.y = ART.y + 24 - this.artScroll;

    // footer (fixed, outside the scroll): see also · Read · paging
    const fy = ART.y + ART.h - 52;
    this.keep(sc.add.rectangle(ART.x + 12, fy - 8, ART.w - 24, 2, 0x212b52).setOrigin(0));
    const related = (e.related ?? []).filter((r) => isUnlocked(r));
    let fx = ART.x + 28;
    if (related.length) {
      fx += this.keep(sc.add.text(fx, fy + 12, 'See also', { ...typeStyle('caption', '#7884b5'), fontStyle: '700' })).width + 10;
      for (const r of related.slice(0, 3)) {
        const name = (Registry.tryGet('lore', r) as LoreEntry | undefined)?.name ?? r;
        const t = this.keep(sc.add.text(fx, fy + 10, name, typeStyle('body', C.teal)).setInteractive({ useHandCursor: true }));
        t.on('pointerup', () => this.open(r));
        fx += t.width + 14;
        if (fx > ART.x + ART.w - 260) break;
      }
    }
    if (e.category === 'books' && this.onRead) this.button(ART.x + ART.w - 288, fy, 100, 'Read', true, () => this.onRead!(e.id));
    const nav = (dx: number, to: LoreEntry | undefined) => this.button(ART.x + ART.w - (dx > 0 ? 72 : 172), fy, 48, dx > 0 ? '▶' : '◀', false, to ? () => { this.sel = to.id; this.artScroll = 0; this.render(); } : undefined);
    nav(-1, opened[idx - 1]);
    this.keep(sc.add.text(ART.x + ART.w - 98, fy + 22, `${idx + 1}/${opened.length}`, typeStyle('caption', C.text300)).setOrigin(0.5));
    nav(1, opened[idx + 1]);
  }

  private button(x: number, y: number, w: number, label: string, gold: boolean, fn?: () => void): void {
    const sc = this.scene;
    const b = this.keep(sc.add.nineslice(x, y, !fn ? 'ui:btn_off' : gold ? 'ui:btn_gold' : 'ui:btn_slate', undefined, w, 44, 8, 8, 8, 8).setOrigin(0));
    this.keep(sc.add.text(x + w / 2, y + 22, label, { fontFamily: '"Jersey 10"', fontSize: '22px', color: !fn ? C.text500 : gold ? C.ink : C.text }).setOrigin(0.5));
    if (fn) b.setInteractive({ useHandCursor: true }).on('pointerup', fn);
  }

  private summary(e: LoreEntry): string {
    const s = e.body.replace(/\s+/g, ' ').trim();
    return s.length > 40 ? `${s.slice(0, 38)}…` : s;
  }

  private hint(e: LoreEntry): string {
    const t = e.unlockOn?.[0];
    if (t && 'landmark' in t) return 'Found by exploring';
    if (t && 'region' in t) return 'Found on your travels';
    if (t && 'kill' in t) return 'Learned in battle';
    return 'Undiscovered';
  }

  private fit(t: Phaser.GameObjects.Text, max: number): void {
    if (t.width <= max) return;
    let s = t.text;
    while (s.length > 4 && t.width > max) { s = s.slice(0, -2); t.setText(`${s}…`); }
  }

  private keep<T extends Phaser.GameObjects.GameObject>(o: T): T {
    this.add(o);
    this.parts.push(o);
    return o;
  }

  private atext(x: number, y: number, s: string, style: Phaser.Types.GameObjects.Text.TextStyle): Phaser.GameObjects.Text {
    const t = this.scene.add.text(x, y, s, style);
    this.article.add(t);
    return t;
  }
}
