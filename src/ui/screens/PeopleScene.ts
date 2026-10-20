import Phaser from 'phaser';
import { Game, Registry, SceneKeys, bus, type NpcDef, type SchoolId } from '@/core';
import { C, typeStyle } from '@/ui/kit/hc';
import { getTrust } from '@/narrative/engine/trust';
import { npcMet, npcQuestInfo } from '@/narrative/engine';
import { MORVANE_VILLAGES } from '@/data/regions/hc/morvane';
import { SCHOOL_COLOR, SCHOOL_NAME } from '@/data/classes/hc';
import { Art, npcTexture } from '@/art';

type Tab = 'all' | 'story' | 'trade' | 'folk';
const TRUST_LABEL = ['Stranger', 'Wary', 'Neutral', 'Friendly', 'Trusted', 'Devoted'];

/**
 * People of <village> (handoff › NPCs). Owner: Claude 1. Opens from the HUD (P, or ui:open {panel:'people'}).
 * Left: 4×n card grid (sprite on a plinth, name, role, school crest + place, trust diamonds, ! when they have a quest),
 * tabs Everyone / Story / Trade / Villagers. Right: detail (4× sprite, title, trust, a bark line, place, services, bio).
 * Data: Claude 4's NpcDefs (Registry 'npc') + trust flags; grouped by home village; bearers (other heroes) are skipped.
 */
/** Card grid viewport height (y 136 → 664); the scroll cue sits below it and the footer hint (y ≈ 698) below that. */
const GRID_H = 528;

export class PeopleScene extends Phaser.Scene {
  private cue?: Phaser.GameObjects.Text;
  private tab: Tab = 'all';
  private sel = 0;
  private line = 0;
  private village = 'brind';
  private people: NpcDef[] = [];
  private grid!: Phaser.GameObjects.Container;
  private detail!: Phaser.GameObjects.Container;
  private tabs!: Phaser.GameObjects.Container;
  private scroll = 0;

  constructor() { super(SceneKeys.People); }

  init(data: { village?: string }): void {
    this.tab = 'all'; this.sel = 0; this.line = 0; this.scroll = 0;
    this.village = data?.village ?? this.guessVillage();
  }

  create(): void {
    this.cue = undefined; // the scene instance is reused across launches; the old text was destroyed with it
    const { width: W, height: H } = this.scale;
    bus.emit('ui:open', { panel: 'people' });
    this.add.rectangle(0, 0, W, H, parseInt(C.bg.slice(1), 16), 0.82).setOrigin(0).setInteractive();
    const vil = villageName(this.village);
    const head = this.add.text(48, 24, `People of ${vil}`, { ...typeStyle('displayL', C.text), shadow: { offsetX: 3, offsetY: 3, color: C.ink, fill: true } });
    this.people = Registry.all('npc')
      .filter((n) => villageOf(n) === this.village && !n.roles?.includes('bearer'))
      .sort((a, b) => Number(b.roles?.includes('quest') ?? false) - Number(a.roles?.includes('quest') ?? false) || a.name.localeCompare(b.name));
    this.add.text(48 + 16 + head.width, 62, `${vil} · ${this.people.filter((n) => npcMet(n.id)).length} met`, typeStyle('body', C.text300)).setOrigin(0, 1);
    this.tabs = this.add.container(0, 0);
    this.grid = this.add.container(0, 0);
    this.detail = this.add.container(0, 0);
    this.add.nineslice(792, 96, 'ui:panel', undefined, 440, 592, 8, 8, 8, 8).setOrigin(0).setDepth(-1);
    this.add.text(W / 2, H - 22, '← → choose · Enter next line · Esc back', typeStyle('caption', C.text500)).setOrigin(0.5);
    const kb = this.input.keyboard!;
    kb.on('keydown-ESC', () => this.close());
    kb.on('keydown-P', () => this.close());
    kb.on('keydown-LEFT', () => this.pick(this.sel - 1));
    kb.on('keydown-RIGHT', () => this.pick(this.sel + 1));
    kb.on('keydown-UP', () => this.pick(this.sel - 4));
    kb.on('keydown-DOWN', () => this.pick(this.sel + 4));
    kb.on('keydown-ENTER', () => { this.line++; this.drawDetail(); });
    this.input.on('wheel', (_p: unknown, _o: unknown, _dx: number, dy: number) => { this.scroll = Math.max(0, Math.min(this.maxScroll(), this.scroll + dy)); this.drawGrid(); });
    this.render();
  }

  private get shown(): NpcDef[] { return this.people.filter((n) => this.tab === 'all' || category(n) === this.tab); }

  private render(): void { this.drawTabs(); this.drawGrid(); this.drawDetail(); }

  private drawTabs(): void {
    this.tabs.removeAll(true);
    ([['all', 'Everyone'], ['story', 'Story'], ['trade', 'Trade'], ['folk', 'Villagers']] as [Tab, string][]).forEach(([k, label], i) => {
      const on = this.tab === k;
      const bg = this.add.nineslice(48 + i * 146, 92, on ? 'ui:tab_active' : 'ui:tab', undefined, 140, 36, 8, 8, 8, 8).setOrigin(0);
      bg.setInteractive({ useHandCursor: true }).on('pointerup', () => { this.tab = k; this.sel = 0; this.scroll = 0; this.render(); });
      this.tabs.add([bg, this.add.text(48 + i * 146 + 70, 110, label, { fontFamily: '"Jersey 10"', fontSize: '20px', color: on ? C.text : C.text300 }).setOrigin(0.5)]);
    });
  }

  private maxScroll(): number { return Math.max(0, Math.ceil(this.shown.length / 4) * 206 - 10 - GRID_H); }

  private drawGrid(): void {
    this.grid.removeAll(true);
    const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => { this.grid.add(o); return o; };
    const list = this.shown;
    if (!list.length) add(this.add.text(412, 300, 'No one here yet.', typeStyle('bodyL', C.text300)).setOrigin(0.5));
    list.forEach((n, i) => {
      const x = 48 + (i % 4) * 182, y = 136 + Math.floor(i / 4) * 206 - this.scroll;
      if (y + 196 < 136 || y > 136 + GRID_H) return;
      const on = i === this.sel;
      const card = add(this.add.nineslice(x, y, on ? 'ui:panel_gold' : 'ui:btn_slate', undefined, 172, 196, 8, 8, 8, 8).setOrigin(0));
      card.setInteractive({ useHandCursor: true }).on('pointerup', () => this.pick(i));
      add(this.add.ellipse(x + 86, y + 82, 84, 20, 0x212b52).setStrokeStyle(2, 0x1a1230));
      const met = npcMet(n.id);
      const tex = npcTexture(this, n);
      if (tex) {
        const s = add(this.add.sprite(x + 86, y + 88, tex, 0).setOrigin(0.5, 1).setScale(2));
        if (!met) s.setTintFill(0x0b0f22).setAlpha(0.8);
        const anim = `${tex}:${on ? 'walk' : 'idle'}`;
        if (this.anims.exists(anim)) s.play(anim); else if (this.anims.exists(`${tex}:idle`)) s.play(`${tex}:idle`);
      }
      const nm = add(this.add.text(x + 86, y + 100, met ? n.name : '???', { ...typeStyle('h3', on ? (n.school ? SCHOOL_COLOR[n.school] : C.gold) : C.text), align: 'center', wordWrap: { width: 160 } }).setOrigin(0.5, 0));
      if (nm.height > 26) nm.setFontSize(18).setLineSpacing(-4).setY(y + 96); // two-line names stay clear of the role line
      add(this.add.text(x + 86, y + 142, met ? roleOf(n) : 'Not met yet', typeStyle('caption', met ? C.text300 : C.text500)).setOrigin(0.5, 0));
      const crest = n.school ? Art.tryFrame(`school_${n.school}`) : null;
      const place = add(this.add.text(x + 86 + (crest ? 9 : 0), y + 162, placeOf(n).toUpperCase(), typeStyle('badge', C.text500)).setOrigin(0.5, 0));
      if (crest) add(this.add.image(place.x - place.width / 2 - 10, y + 168, crest.key, crest.frame).setScale(0.75));
      if (met) this.diamonds(add, x + 86, y + 184, getTrust(n.id), 8);
      const q = npcQuestInfo(n.id);
      if (q) add(this.add.text(x + 158, y + 10, q.state === 'offer' ? '!' : '?', { fontFamily: '"Jersey 10"', fontSize: '28px', color: C.ink, backgroundColor: q.state === 'offer' ? C.gold : '#8b9fe0', padding: { x: 7, y: 0 } }).setOrigin(0.5, 0));
    });
    // clip to the grid viewport
    const mask = this.make.graphics({}, false).fillRect(40, 136, 744, GRID_H).createGeometryMask();
    this.grid.setMask(mask);
    // scroll cue below the viewport, never over a card (wheel or arrow keys)
    this.cue ??= this.add.text(412, 136 + GRID_H + 4, '', typeStyle('badge', C.gold300)).setOrigin(0.5, 0);
    this.cue.setText(this.scroll < this.maxScroll() ? '▼ more · scroll' : this.maxScroll() > 0 ? '▲ scroll up' : '');
  }

  private drawDetail(): void {
    this.detail.removeAll(true);
    const n = this.shown[this.sel];
    if (!n) return;
    const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => { this.detail.add(o); return o; };
    if (!npcMet(n.id)) {
      add(this.add.text(1012, 300, '???', { ...typeStyle('displayL', C.text500) }).setOrigin(0.5));
      add(this.add.text(1012, 360, `Someone in ${placeOf(n)}. You haven't met them yet.`, typeStyle('body', C.text300, 360)).setOrigin(0.5, 0).setAlign('center'));
      return;
    }
    const color = n.school ? SCHOOL_COLOR[n.school] : C.gold;
    add(this.add.circle(880, 220, 70, parseInt(color.slice(1), 16), 0.2));
    const tex = npcTexture(this, n);
    if (tex) {
      const s = add(this.add.sprite(880, 280, tex, 0).setOrigin(0.5, 1).setScale(4));
      if (this.anims.exists(`${tex}:idle`)) s.play(`${tex}:idle`);
    }
    add(this.add.text(960, 150, n.name, { ...typeStyle('displayL', C.text), fontSize: '40px', wordWrap: { width: 250 } }));
    const title = add(this.add.text(960, 150, n.title ?? roleOf(n), { ...typeStyle('h3', color), wordWrap: { width: 250 } }));
    title.setY(Math.max(196, 150 + (this.detail.list.at(-2) as Phaser.GameObjects.Text).height + 4));
    const trust = getTrust(n.id);
    add(this.add.text(960, title.y + title.height + 10, 'Trust', typeStyle('caption', C.text500)));
    this.diamonds(add, 1046, title.y + title.height + 18, trust, 10);
    add(this.add.text(1104, title.y + title.height + 10, TRUST_LABEL[trust], typeStyle('caption', C.gold300)));
    const lines = n.barks?.flatMap((b) => b.lines) ?? [];
    const quote = lines.length ? lines[this.line % lines.length] : n.bio.split('. ')[0] + '.';
    const bubble = add(this.add.text(816, 306, `“${quote}”`, { ...typeStyle('body', C.ink, 368), backgroundColor: '#fbf6e9', padding: { x: 12, y: 10 } }));
    add(this.add.rectangle(860, 302, 12, 12, 0xfbf6e9).setRotation(Math.PI / 4));
    let y = bubble.y + bubble.height + 14;
    add(this.add.text(816, y, 'Found at', typeStyle('body', C.text500)).setFontStyle('700'));
    add(this.add.text(912, y, `${placeOf(n)}, ${villageName(this.village)}`, typeStyle('body', C.text, 296)));
    y += 24;
    add(this.add.text(816, y, 'School', typeStyle('body', C.text500)).setFontStyle('700'));
    add(this.add.text(912, y, n.school ? SCHOOL_NAME[n.school as SchoolId] : 'None', typeStyle('body', color)));
    y += 24;
    const qi = npcQuestInfo(n.id);
    add(this.add.text(816, y, 'Quest', typeStyle('body', C.text500)).setFontStyle('700'));
    add(this.add.text(912, y, qi ? `${qi.quest.name} · ${qi.state === 'active' ? 'active' : 'available'}` : 'None right now', typeStyle('body', qi ? C.gold : C.text500, 296)));
    y += 30;
    let sx = 816;
    for (const sv of n.services ?? []) {
      const chip = add(this.add.text(sx, y, sv, { ...typeStyle('caption', '#d3ddff'), backgroundColor: '#2c3868', padding: { x: 8, y: 3 } }));
      if (sx + chip.width > 1208) { sx = 816; y += 26; chip.setPosition(sx, y); }
      sx += chip.width + 6;
    }
    y += 34;
    add(this.add.text(816, y, n.bio, typeStyle('body', C.text300, 392)).setLineSpacing(4));
    const map = add(this.add.nineslice(816, 616, 'ui:btn_slate', undefined, 392, 52, 8, 8, 8, 8).setOrigin(0));
    add(this.add.text(1012, 642, 'Show on map', typeStyle('button', C.text)).setOrigin(0.5));
    map.setInteractive({ useHandCursor: true }).on('pointerup', () => { this.close(); bus.emit('ui:open', { panel: 'map' }); });
  }

  private diamonds(add: <T extends Phaser.GameObjects.GameObject>(o: T) => T, cx: number, cy: number, trust: number, size: number): void {
    const gap = size + 5;
    for (let t = 0; t < 5; t++) {
      add(this.add.rectangle(cx + (t - 2) * gap, cy, size, size, t < trust ? 0xffc43d : 0x212b52).setRotation(Math.PI / 4).setStrokeStyle(2, 0x1a1230));
    }
  }

  private pick(i: number): void {
    const n = this.shown.length;
    if (!n) return;
    this.sel = Math.max(0, Math.min(n - 1, i));
    this.line = 0;
    const rowY = Math.floor(this.sel / 4) * 206;
    if (rowY < this.scroll) this.scroll = rowY;
    if (rowY + 196 > this.scroll + GRID_H) this.scroll = rowY + 196 - GRID_H;
    this.drawGrid();
    this.drawDetail();
  }

  /** The village the player is standing in (nearest home landmark prefix in this space), else Brindlecross. */
  private guessVillage(): string {
    const loc = Game.hasState ? Game.state.world.location : null;
    if (!loc || loc.space !== 'concordia') return 'brind';
    return 'brind';
  }

  private close(): void {
    bus.emit('ui:close', { panel: 'people' });
    this.scene.stop();
  }
}

const villageOf = (n: NpcDef): string => n.home.replace(/^landmark:/, '').split('-')[0];
const titleCase = (s: string) => s.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
const slug = (s: string) => s.toLowerCase().replace(/[’'"]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').replace(/^the-/, '');
/** Canon names from Claude 2's MORVANE_VILLAGES (vil:<prefix>); unknown prefixes title-case. */
const villageName = (v: string): string => MORVANE_VILLAGES.find((x) => x.id === `vil:${v}`)?.name ?? titleCase(v);
function placeOf(n: NpcDef): string {
  const [vil, ...rest] = n.home.replace(/^landmark:/, '').split('-');
  const key = rest.join('-');
  const place = MORVANE_VILLAGES.find((x) => x.id === `vil:${vil}`)?.places.find((p) => slug(p[1]) === key);
  return place ? place[1] : titleCase(key || vil);
}
const roleOf = (n: NpcDef): string => n.services?.[0] ?? (n.roles?.includes('merchant') ? 'Merchant' : n.roles?.includes('trainer') ? 'Trainer' : 'Villager');
function category(n: NpcDef): 'story' | 'trade' | 'folk' {
  if (n.roles?.includes('quest') || n.essential) return 'story';
  if (n.roles?.includes('merchant') || n.shop || n.roles?.includes('trainer')) return 'trade';
  return 'folk';
}
