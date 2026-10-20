/**
 * Right panel of character creation: panel 376×524 at (856,96) with tabs Class / Outfit / Look
 * (handoff › Characters). Calls back with look/outfit changes; the scene re-renders the preview.
 */
import Phaser from 'phaser';
import { Art } from '@/art';
import { C, typeStyle } from '@/ui/kit/hc';
import { classDisplay, SCHOOL_NAME } from '@/data/classes/hc';
import { GEAR, LOOK, heroSprite, heroTexture, type HeroChoice, type HeroLookV2, type HeroOutfit } from './heroChoice';

export type PanelTab = 'class' | 'outfit' | 'look';

export interface OptionPanelHooks {
  setLook(key: keyof HeroLookV2, v: number): void;
  setOutfit(key: keyof HeroOutfit, v: number): void;
  randomise(): void;
  resetLook(): void;
}

const X = 856, Y = 96, W = 376, H = 524, CX = 880;
const CLIP = { x: 864, y: 152, w: 360, h: 460 };

export class OptionPanel {
  private body: Phaser.GameObjects.Container;
  private tabsC: Phaser.GameObjects.Container;
  tab: PanelTab = 'class';
  private lastTab: PanelTab | null = null;

  constructor(private scene: Phaser.Scene, private hooks: OptionPanelHooks) {
    scene.add.nineslice(X, Y, 'ui:panel', undefined, W, H, 8, 8, 8, 8).setOrigin(0);
    this.tabsC = scene.add.container(872, 108);
    this.body = scene.add.container(0, 0);
    // content area below the tabs is clipped and scrolls with the mouse wheel when taller than the panel
    const maskG = scene.make.graphics({}, false).fillRect(CLIP.x, CLIP.y, CLIP.w, CLIP.h);
    this.body.setMask(maskG.createGeometryMask());
    scene.input.on('wheel', (ptr: Phaser.Input.Pointer, _o: unknown, _dx: number, dy: number) => {
      if (ptr.x < CLIP.x || ptr.x > CLIP.x + CLIP.w || ptr.y < CLIP.y || ptr.y > CLIP.y + CLIP.h) return;
      this.scrollTo(this.scroll + dy * 0.6);
    });
  }

  private scroll = 0;
  private contentBottom = 0;
  private cueUp?: Phaser.GameObjects.Text;
  private cueDown?: Phaser.GameObjects.Text;
  private scrollTo(v: number): void {
    const max = Math.max(0, this.contentBottom - (CLIP.y + CLIP.h) + 8);
    this.scroll = Math.max(0, Math.min(max, v));
    this.body.y = -Math.round(this.scroll);
    // scroll cues (the panel scrolls with the mouse wheel): there is more above / below
    const cue = (y: number, label: string, oy: number) => this.scene.add.text(CLIP.x + CLIP.w / 2, y, label, { ...typeStyle('badge', C.gold300), backgroundColor: C.bg, padding: { x: 8, y: 2 } }).setOrigin(0.5, oy).setDepth(10);
    this.cueUp ??= cue(CLIP.y + 2, '▲ more', 0);
    this.cueDown ??= cue(CLIP.y + CLIP.h - 2, '▼ more · scroll', 1);
    this.cueUp.setVisible(this.scroll > 2);
    this.cueDown.setVisible(this.scroll < max - 2);
  }

  render(hc: HeroChoice): void {
    this.tabsC.removeAll(true);
    const tabs: [PanelTab, string][] = [['class', 'Class'], ['outfit', 'Outfit'], ['look', 'Look']];
    const tw = (344 - 12) / 3;
    tabs.forEach(([k, label], i) => {
      const on = this.tab === k;
      const bg = this.scene.add.nineslice(i * (tw + 6), 0, on ? 'ui:tab_active' : 'ui:tab', undefined, tw, 40, 8, 8, 8, 8).setOrigin(0);
      bg.setInteractive({ useHandCursor: true }).on('pointerup', () => { this.tab = k; this.render(hc); });
      this.tabsC.add([bg, this.scene.add.text(i * (tw + 6) + tw / 2, 20, label, typeStyle('h3', on ? C.text : C.text300)).setOrigin(0.5)]);
    });
    const keepScroll = this.lastTab === this.tab;
    this.lastTab = this.tab;
    this.body.removeAll(true);
    if (this.tab === 'class') this.renderClass(hc);
    else if (this.tab === 'outfit') this.renderOutfit(hc);
    else this.renderLook(hc);
    this.contentBottom = this.body.list.reduce((m, o) => Math.max(m, (o as Phaser.GameObjects.Components.GetBounds & Phaser.GameObjects.GameObject).getBounds?.().bottom ?? 0), 0) + this.scroll;
    this.scrollTo(keepScroll ? this.scroll : 0);
  }

  private add<T extends Phaser.GameObjects.GameObject>(o: T): T { this.body.add(o); return o; }

  private renderClass(hc: HeroChoice): void {
    const c = classDisplay(hc.classId);
    if (!c) return;
    let x = CX, y = 162;
    const chip = (str: string, fg: string, bg: string, icon?: string) => {
      const t = this.scene.add.text(0, 0, str, { ...typeStyle('caption', fg), backgroundColor: bg, padding: { left: icon ? 26 : 8, right: 8, top: 2, bottom: 2 } });
      if (x + t.width > CX + 328) { x = CX; y += 26; }
      t.setPosition(x, y);
      this.add(t);
      if (icon) { const f = Art.tryFrame(icon); if (f) this.add(this.scene.add.image(x + 2, y + t.height / 2, f.key, f.frame).setOrigin(0, 0.5)); }
      x += t.width + 8;
    };
    c.tags.forEach((t) => chip(t, C.line100, C.panel600));
    chip(SCHOOL_NAME[c.school], c.color, C.panel700, `school_${c.school}`);
    y += 34;
    const lore = this.add(this.scene.add.text(CX, y, c.lore, typeStyle('body', C.text, 328)));
    y += lore.height + 12;
    this.add(this.scene.add.rectangle(CX, y - 6, 328, 2, parseInt(C.panel700.slice(1), 16)).setOrigin(0));
    for (const s of c.stats) {
      this.add(this.scene.add.text(CX, y, s.label, typeStyle('body', C.text300)));
      for (let p = 0; p < 5; p++) {
        const r = this.add(this.scene.add.rectangle(CX + 82 + p * 50, y + 4, 44, 10, parseInt((p < s.pips ? c.color : C.panel700).slice(1), 16)).setOrigin(0));
        r.setStrokeStyle(2, parseInt(C.ink.slice(1), 16));
      }
      y += 22;
    }
    this.add(this.scene.add.rectangle(CX, y + 2, 328, 2, parseInt(C.panel700.slice(1), 16)).setOrigin(0));
    y += 12;
    this.add(this.scene.add.text(CX, y, 'Starting spells', typeStyle('h3', C.gold)));
    y += 26;
    for (const a of c.abilities) {
      this.add(this.scene.add.nineslice(CX, y, 'ui:slot_empty', undefined, 40, 40, 8, 8, 8, 8).setOrigin(0));
      const f = Art.tryFrame(a.icon);
      if (f) this.add(this.scene.add.image(CX + 20, y + 20, f.key, f.frame));
      this.add(this.scene.add.text(CX + 50, y, a.name, typeStyle('body', C.text)).setFontStyle('600'));
      const d = this.add(this.scene.add.text(CX + 50, y + 16, a.desc, typeStyle('caption', C.text300, 278)));
      y += Math.max(46, d.height + 22);
    }
    this.add(this.scene.add.text(CX, y + 2, 'Difficulty', typeStyle('caption', C.text500)));
    for (let d = 0; d < 3; d++) {
      const r = this.add(this.scene.add.rectangle(CX + 82 + d * 18, y + 10, 10, 10, parseInt((d < c.difficulty ? C.gold : C.panel700).slice(1), 16)).setAngle(45));
      r.setStrokeStyle(2, parseInt(C.ink.slice(1), 16));
    }
  }

  /** a row of thumbnail / swatch options with a label + current value */
  private optionRow(y: number, label: string, value: string, opts: { selected: boolean; draw: (x: number, y: number) => void; go: () => void; w: number; h: number }[]): number {
    this.add(this.scene.add.text(CX, y, label, typeStyle('caption', C.text300)));
    this.add(this.scene.add.text(CX + 336, y, value, typeStyle('caption', C.gold300)).setOrigin(1, 0));
    let x = CX, yy = y + 18;
    for (const o of opts) {
      if (x + o.w > CX + 336) { x = CX; yy += o.h + 8; }
      const ring = this.add(this.scene.add.rectangle(x - 2, yy - 2, o.w + 4, o.h + 4, parseInt((o.selected ? C.gold : C.ink).slice(1), 16)).setOrigin(0));
      if (o.selected) ring.setStrokeStyle(2, parseInt(C.gold.slice(1), 16));
      const bg = this.add(this.scene.add.rectangle(x, yy, o.w, o.h, parseInt(C.panel600.slice(1), 16)).setOrigin(0));
      o.draw(x, yy);
      bg.setInteractive({ useHandCursor: true }).on('pointerup', o.go);
      x += o.w + 8;
    }
    return yy + (opts[0]?.h ?? 0) + 10;
  }

  private thumb(name: string, x: number, y: number, w: number, h: number, scale = 1, dy = 0): void {
    const tex = heroTexture(this.scene, name);
    if (!tex) return;
    const img = this.add(this.scene.add.image(x + w / 2, y + h + dy, tex).setOrigin(0.5, 1).setScale(scale));
    // Crop to the w×h window in frame pixels. A crop moves with the image when the panel scrolls; the old world-space
    // geometry mask stayed put, so every thumbnail vanished as soon as the Look/Outfit panel was scrolled.
    const left = x + w / 2 - (img.width * scale) / 2, top = y + h + dy - img.height * scale;
    img.setCrop((x - left) / scale, (y - top) / scale, w / scale, h / scale);
  }

  private renderOutfit(hc: HeroChoice): void {
    const kit = GEAR().kitOf(hc.classId), N = GEAR().ACC_N, dyes = GEAR().outfitNames(hc.classId);
    let y = 154;
    const outfitRow = (label: string, key: keyof HeroOutfit, ids: number[], names: string[]) => {
      y = this.optionRow(y, label, names[ids.indexOf(hc.outfit[key])] ?? names[0] ?? '', ids.map((v, i) => ({
        w: 44, h: 48, selected: hc.outfit[key] === v,
        draw: (x, yy) => this.thumb(heroSprite(hc.classId, hc.look, { ...hc.outfit, [key]: v }), x, yy, 44, 48, 1, 2),
        go: () => this.hooks.setOutfit(key, v), name: names[i],
      })));
    };
    outfitRow('Outfit', 'dye', [0, 1, 2, 3], dyes);
    outfitRow('Headwear', 'headw', [0, 1, 2], ['Class', 'None', kit.alt[0].toUpperCase() + kit.alt.slice(1)]);
    outfitRow('Back', 'cape', kit.cape, kit.cape.map((i) => N.cape[i]));
    outfitRow('Neck', 'neck', kit.neck, kit.neck.map((i) => N.neck[i]));
    outfitRow('Face', 'face', kit.face, kit.face.map((i) => N.face[i]));
    outfitRow('Extra', 'extra', kit.extra, kit.extra.map((i) => N.extra[i]));
    this.add(this.scene.add.text(CX, y, 'Armour you find later replaces the outfit while worn, and weapons replace the class weapon.', typeStyle('caption', C.text500, 330)));
  }

  private renderLook(hc: HeroChoice): void {
    const L = LOOK();
    let y = 154;
    const hexN = (s: string) => parseInt(s.replace('#', '').slice(0, 6), 16);
    const swatch = (label: string, key: keyof HeroLookV2, names: string[], cols: [string, string][]) => {
      y = this.optionRow(y, label, names[hc.look[key] as number] ?? '', names.map((_, v) => ({
        w: 24, h: 24, selected: hc.look[key] === v,
        draw: (x, yy) => { this.add(this.scene.add.rectangle(x, yy, 24, 24, hexN(cols[v]?.[1] ?? C.panel600)).setOrigin(0)); },
        go: () => this.hooks.setLook(key, v),
      })));
    };
    const thumbs = (label: string, key: keyof HeroLookV2, names: string[], count = names.length) => {
      const list = Array.from({ length: count }, (_, v) => v);
      y = this.optionRow(y, label, names[hc.look[key] as number] ?? `Style ${(hc.look[key] as number) + 1}`, list.map((v) => ({
        w: 32, h: 32, selected: hc.look[key] === v,
        draw: (x, yy) => this.thumb(heroSprite(hc.classId, { ...hc.look, [key]: v }, hc.outfit, true), x, yy, 32, 32, 2, 34),
        go: () => this.hooks.setLook(key, v),
      })));
    };
    swatch('Skin', 'skin', L.skin, L.SKINS);
    thumbs('Hair', 'hair', L.hair);
    swatch('Hair colour', 'hc', L.hc, L.HAIRC);
    thumbs('Eyes', 'eyes', L.eyes, 12);
    thumbs('Eyebrows', 'brows', L.brows ?? [], 12);
    swatch('Eye colour', 'ec', L.ec, L.EYEC);
    thumbs('Expression', 'mouth', L.mouth);
    thumbs('Face mark', 'mark', L.mark);
    const btn = (x: number, label: string, fn: () => void) => {
      const b = this.add(this.scene.add.nineslice(x, y, 'ui:btn_slate', undefined, 162, 36, 8, 8, 8, 8).setOrigin(0));
      this.add(this.scene.add.text(x + 81, y + 18, label, typeStyle('h3', C.text)).setOrigin(0.5));
      b.setInteractive({ useHandCursor: true }).on('pointerup', fn);
    };
    btn(CX, 'Randomise', () => this.hooks.randomise());
    btn(CX + 174, 'Class default', () => this.hooks.resetLook());
  }
}
