/**
 * Left column of character creation: filter tabs (All / Magic / Martial) at (48,108) and a scrolling
 * class list in an inset panel 340×470 at (48,150), grouped by school (handoff › Characters).
 */
import Phaser from 'phaser';
import { Art } from '@/art';
import { C, typeStyle } from '@/ui/kit/hc';
import { HC_CLASS_DISPLAY, SCHOOL_NAME, SCHOOL_COLOR, type ClassDisplay } from '@/data/classes/hc';
import { defaultLook, defaultOutfit, heroSprite, heroTexture } from './heroChoice';

type Filter = 'all' | 'magic' | 'martial';

export class ClassList {
  private root: Phaser.GameObjects.Container;
  private list: Phaser.GameObjects.Container;
  private tabs: Phaser.GameObjects.Container;
  private filter: Filter = 'all';
  private scroll = 0;
  private contentH = 0;
  private rows = new Map<string, { bg: Phaser.GameObjects.NineSlice; name: Phaser.GameObjects.Text }>();
  private readonly X = 48;
  private readonly Y = 150;
  private readonly W = 340;
  private readonly H = 470;

  constructor(private scene: Phaser.Scene, private selected: string, private onPick: (id: string) => void) {
    this.root = scene.add.container(0, 0);
    this.tabs = scene.add.container(this.X, 108);
    this.root.add(this.tabs);
    this.root.add(scene.add.nineslice(this.X, this.Y, 'ui:panel_inset', undefined, this.W, this.H, 8, 8, 8, 8).setOrigin(0));
    this.list = scene.add.container(this.X + 10, this.Y + 10);
    const maskG = scene.make.graphics({}, false).fillRect(this.X + 6, this.Y + 6, this.W - 12, this.H - 12);
    this.list.setMask(maskG.createGeometryMask());
    this.root.add(this.list);
    scene.input.on('wheel', (p: Phaser.Input.Pointer, _o: unknown, _dx: number, dy: number) => {
      if (p.x < this.X || p.x > this.X + this.W || p.y < this.Y || p.y > this.Y + this.H) return;
      this.setScroll(this.scroll + dy * 0.6);
    });
    this.build();
  }

  select(id: string): void {
    this.selected = id;
    this.rows.forEach((r, k) => {
      const on = k === id;
      r.bg.setTexture(on ? 'ui:btn_gold' : 'ui:btn_slate');
      r.name.setColor(on ? C.ink : C.text);
    });
  }

  /** ids in display order (for ↑↓ keyboard navigation) */
  order(): string[] { return this.visible().map((c) => c.id); }

  private visible(): ClassDisplay[] {
    return HC_CLASS_DISPLAY.filter((c) => this.filter === 'all' || c.kind === this.filter);
  }

  private build(): void {
    this.tabs.removeAll(true);
    (['all', 'magic', 'martial'] as Filter[]).forEach((f, i) => {
      const w = (this.W - 12) / 3, on = this.filter === f;
      const bg = this.scene.add.nineslice(i * (w + 6), 0, on ? 'ui:tab_active' : 'ui:tab', undefined, w, 36, 8, 8, 8, 8).setOrigin(0);
      const t = this.scene.add.text(i * (w + 6) + w / 2, 18, f === 'all' ? 'All' : f === 'magic' ? 'Magic' : 'Martial', typeStyle('h3', on ? C.text : C.text300)).setOrigin(0.5);
      bg.setInteractive({ useHandCursor: true }).on('pointerup', () => { this.filter = f; this.scroll = 0; this.build(); });
      this.tabs.add([bg, t]);
    });
    this.list.removeAll(true);
    this.rows.clear();
    let y = 0, lastSchool = '';
    const rowW = this.W - 20;
    for (const c of this.visible()) {
      if (c.school !== lastSchool) {
        lastSchool = c.school;
        const icon = Art.tryFrame(`school_${c.school}`);
        if (icon) this.list.add(this.scene.add.image(2, y + 4, icon.key, icon.frame).setOrigin(0));
        this.list.add(this.scene.add.text(30, y + 4, SCHOOL_NAME[c.school], typeStyle('h3', SCHOOL_COLOR[c.school])));
        this.list.add(this.scene.add.text(30 + 8 + SCHOOL_NAME[c.school].length * 10, y + 9, c.kind.toUpperCase(), typeStyle('badge', C.text500)));
        y += 30;
      }
      const row = this.scene.add.container(0, y);
      const bg = this.scene.add.nineslice(0, 0, 'ui:btn_slate', undefined, rowW, 64, 8, 8, 8, 8).setOrigin(0);
      row.add(bg);
      for (const [i, body] of ([0, 1] as const).entries()) {
        const tex = heroTexture(this.scene, heroSprite(c.id, defaultLook(c.id, body), defaultOutfit()));
        if (tex) row.add(this.scene.add.image(10 + i * 22, 60, tex).setOrigin(0, 1));
      }
      const name = this.scene.add.text(72, 10, c.name, typeStyle('h2', C.text));
      row.add([name, this.scene.add.text(72, 38, c.role, typeStyle('caption', C.text500))]);
      bg.setInteractive({ useHandCursor: true }).on('pointerup', () => this.onPick(c.id))
        .on('pointerover', () => { if (c.id !== this.selected) bg.setTexture('ui:btn_slate_hover'); })
        .on('pointerout', () => { if (c.id !== this.selected) bg.setTexture('ui:btn_slate'); });
      this.list.add(row);
      this.rows.set(c.id, { bg, name });
      y += 70;
    }
    this.contentH = y;
    this.setScroll(this.scroll);
    this.select(this.selected);
  }

  /** keep the selected row visible */
  reveal(id: string): void {
    const ids = this.order();
    const i = ids.indexOf(id);
    if (i < 0) return;
    const row = this.list.list.find((o) => o instanceof Phaser.GameObjects.Container && (o as Phaser.GameObjects.Container).list.includes(this.rows.get(id)!.bg)) as Phaser.GameObjects.Container | undefined;
    if (!row) return;
    const top = row.y, bottom = row.y + 64, view = this.H - 20;
    if (top < this.scroll) this.setScroll(top - 30);
    else if (bottom > this.scroll + view) this.setScroll(bottom - view);
  }

  private setScroll(v: number): void {
    this.scroll = Math.max(0, Math.min(Math.max(0, this.contentH - (this.H - 20)), v));
    this.list.y = this.Y + 10 - Math.round(this.scroll);
  }
}
