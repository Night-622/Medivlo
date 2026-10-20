import Phaser from 'phaser';
import { Game, Registry } from '@/core';
import type { NpcDef } from '@/core';
import { C, typeStyle } from '@/ui/kit/hc';
import { npcTexture } from '@/art';
import { SCHOOL_COLOR, SCHOOL_NAME } from '@/data/classes/hc';
import { defaultOutfit, heroSprite, heroTexture } from '@/scenes/create/heroChoice';
import type { ChoiceView, DialogueView } from '@/narrative/engine/dialogue';

/** v2 view extras from the dialogue client (co-op votes). */
type BoxView = DialogueView & { votes?: Record<number, string[]>; deadline?: number; canPick?: boolean };

// Handoff › Dialogue (1280×720): speaker ×6 at left, hero ×4 at right (flipped), panel 1152×262 at (64,430),
// gold name plate at (88,412), text 520 wide at (96,468), choices 548 wide at (648,456), min 46 tall, gap 6.
const PANEL = { x: 64, y: 430, w: 1152, h: 262 };
const TEXT = { x: 96, y: 468, w: 520, wFull: 1088 };
const CHOICES = { x: 648, y: 456, w: 548, min: 46, gap: 6 };
const PLATE = { x: 88, y: 412, h: 56 };
const PLATE_BOTTOM = PLATE.y + PLATE.h;
const HINT_Y = 650;
const TAG_BG = { quest: '#ffc43d', insight: '#c9a2ff', trustUp: '#6ee06a', trustDown: '#ff4d5e' };

/**
 * Dialogue overlay (handoff › Dialogue). Visuals: Claude 1; flow/logic: Claude 4 (dialogueClient, chips, votes).
 * Click or 1–9 to choose (display order → choice index via choiceAt); Space/Enter/click to continue.
 * Disabled choices stay visible (other schools' [School] options, vote locks, lockedLabel ones).
 */
export class DialogueBox extends Phaser.GameObjects.Container {
  private dynamic: Phaser.GameObjects.GameObject[] = [];
  private view: BoxView | null = null;
  private hover = -1;
  private caret?: Phaser.GameObjects.Rectangle;
  private timer?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, private onChoose: (index: number) => void, private onAdvance: () => void) {
    super(scene, 0, 0);
    const { width: W, height: H } = scene.scale;
    // gradient: clear above 30%, deepening to .85 at 62% (bands, no alpha textures needed)
    const g = scene.add.graphics();
    const top = Math.round(H * 0.3), full = Math.round(H * 0.62);
    for (let y = top; y < H; y += 4) g.fillStyle(0x0d1226, Math.min(0.85, ((y - top) / (full - top)) * 0.85)).fillRect(0, y, W, 4);
    const hit = scene.add.zone(0, 0, W, H).setOrigin(0).setInteractive();
    hit.on('pointerup', () => { if (!this.view?.choices.length) this.onAdvance(); });
    this.add([g, hit]);
    this.setDepth(10).setVisible(false);
    scene.add.existing(this);
    scene.time.addEvent({ delay: 500, loop: true, callback: () => this.tick() });
  }

  show(view: BoxView | null): void {
    this.view = view;
    this.hover = -1;
    this.render();
  }

  /** index in the displayed list → choice index */
  choiceAt(displayIndex: number, view: DialogueView | null): number | undefined {
    const c = view?.choices[displayIndex];
    return c && c.enabled ? c.index : undefined;
  }

  private tick(): void {
    if (!this.visible) return;
    this.caret?.setVisible(!this.caret.visible);
    const d = this.view?.deadline ?? 0;
    if (this.timer && d) this.timer.setText(`Party vote · ${Math.max(0, Math.ceil((d - Date.now()) / 1000))}s`);
  }

  private render(): void {
    this.dynamic.forEach((o) => o.destroy());
    this.dynamic = [];
    this.caret = undefined;
    this.timer = undefined;
    const v = this.view;
    if (!v) { this.setVisible(false); return; }
    this.setVisible(true);
    const sc = this.scene;
    const npc = v.speakerId.startsWith('npc:') ? (Registry.tryGet('npc', v.speakerId) as NpcDef | undefined) : undefined;
    const narrator = v.speakerId === 'narrator';
    const playerSpeaks = v.speakerId === 'player';

    // speaker at left (×6), the hero at right (×4, facing them)
    const tex = npc ? npcTexture(sc, npc) : null;
    if (tex) {
      const s = this.keep(sc.add.sprite(196, 420, tex, 0).setOrigin(0.5, 1).setScale(6));
      if (sc.anims.exists(`${tex}:idle`)) s.play(`${tex}:idle`);
      if (v.mood === 'hollow') s.setTint(0x9fb0d8);
    }
    const hero = Game.hasState ? Game.state.player.hero : undefined;
    const htex = hero ? heroTexture(sc, heroSprite(hero.classId, hero.look, hero.outfit ?? defaultOutfit())) : null;
    if (htex) this.keep(sc.add.image(1080, 420, htex).setOrigin(0.5, 1).setScale(4).setFlipX(true).setAlpha(playerSpeaks ? 1 : 0.9));

    this.keep(sc.add.nineslice(PANEL.x, PANEL.y, 'ui:panel', undefined, PANEL.w, PANEL.h, 8, 8, 8, 8).setOrigin(0));
    if (!narrator) this.namePlate(v, npc);

    // body text (narration in a softer colour, the hero's own lines in gold)
    const wrap = v.choices.length ? TEXT.w : TEXT.wFull;
    const color = narrator ? C.text300 : playerSpeaks ? C.gold300 : C.text;
    // under a name plate (412 + 56 tall) the text drops 12 px so it doesn't sit flush; it must stay clear of the hint row
    const bodyY = narrator ? TEXT.y : PLATE_BOTTOM + 12;
    const maxH = HINT_Y - 10 - bodyY;
    const body = this.keep(sc.add.text(TEXT.x, bodyY, v.text, { ...typeStyle('bodyL', color, wrap), fontSize: '17px', lineSpacing: 9 }));
    if (body.height > maxH) body.setFontSize(15).setLineSpacing(6);
    if (body.height > maxH) body.setFontSize(13).setLineSpacing(4);
    if (!v.choices.length) {
      const last = body.getBottomRight();
      this.caret = this.keep(sc.add.rectangle(last.x! + 6, last.y! - 18, 10, 14, parseInt(C.gold.slice(1), 16)).setOrigin(0));
    }

    // choices: stack down from CHOICES.y; if they'd overflow the panel, the stack grows upward
    const heights = v.choices.map((c) => this.measure(c));
    const total = heights.reduce((a, h) => a + h + CHOICES.gap, -CHOICES.gap);
    let y = Math.min(CHOICES.y, PANEL.y + PANEL.h - 20 - total);
    v.choices.forEach((c, i) => { this.choice(c, i, y, heights[i]); y += heights[i] + CHOICES.gap; });

    // 13px, not the 11px caption: at caption size Pixelify's "2" reads as an "8" ("1–2" looked like "1-8")
    const n = Math.min(9, v.choices.length);
    const keys = n === 1 ? 'Press 1' : n === 2 ? 'Press 1 or 2' : `Press 1 to ${n}`;
    this.keep(sc.add.text(TEXT.x, HINT_Y, n ? `${keys} to choose · Esc to leave the conversation` : 'Enter, Space or click to continue · Esc to skip', { ...typeStyle('caption', '#7884b5'), fontSize: '13px' }));
    if (v.deadline) this.timer = this.keep(sc.add.text(TEXT.x + 520, HINT_Y, '', typeStyle('caption', C.gold300)).setOrigin(1, 0));
    this.tick();
  }

  private namePlate(v: BoxView, npc: NpcDef | undefined): void {
    const sc = this.scene;
    const name = sc.add.text(0, 0, v.speakerName, { fontFamily: '"Jersey 10"', fontSize: '28px', color: v.mood === 'hollow' ? '#9fd8ff' : '#ffe27a' });
    const role = sc.add.text(0, 0, npc?.title ?? '', { ...typeStyle('caption', C.text300), fontStyle: '700' });
    const diamonds = v.trust !== undefined ? 5 * 15 + 6 : 0;
    const w = 14 + name.width + (role.text ? 10 + role.width : 0) + diamonds + 14 + 16;
    this.keep(sc.add.nineslice(PLATE.x, PLATE.y, 'ui:panel_gold', undefined, w, PLATE.h, 8, 8, 8, 8).setOrigin(0));
    this.keep(name.setPosition(88 + 22, 412 + 28).setOrigin(0, 0.5));
    let x = name.x + name.width + 10;
    if (role.text) { this.keep(role.setPosition(x, 412 + 29).setOrigin(0, 0.5)); x += role.width + 10; } else role.destroy();
    if (v.trust !== undefined) {
      for (let k = 0; k < 5; k++) {
        this.keep(sc.add.rectangle(x + 8 + k * 15, 412 + 28, 9, 9, k < v.trust ? 0xffc43d : 0x212b52).setRotation(Math.PI / 4).setStrokeStyle(2, 0x1a1230));
      }
    }
  }

  /** chip label + colour for a choice (school, quest, insight, trust, data chip, v1 check) */
  private chipOf(c: ChoiceView): { label: string; bg: string } | null {
    if (c.school) return { label: `[${SCHOOL_NAME[c.school] ?? c.school}]`, bg: SCHOOL_COLOR[c.school] ?? C.gold };
    if (c.quest) return { label: 'QUEST', bg: TAG_BG.quest };
    if (c.insight) return { label: 'INSIGHT', bg: TAG_BG.insight };
    if (c.trust) return { label: c.trust > 0 ? 'TRUST +1' : 'TRUST −1', bg: c.trust > 0 ? TAG_BG.trustUp : TAG_BG.trustDown };
    if (c.chip) return { label: c.chip.toUpperCase(), bg: c.enabled ? '#8b9fe0' : '#5a6390' };
    if (c.check) return { label: `${c.check.label} ${c.check.dc}`, bg: c.check.have >= c.check.dc ? TAG_BG.trustUp : TAG_BG.trustDown };
    return null;
  }

  private measure(c: ChoiceView): number {
    const chip = this.chipOf(c);
    const t = this.scene.add.text(0, 0, c.text, { ...typeStyle('body', C.text, CHOICES.w - 16 - 34 - (chip ? chip.label.length * 7 + 22 : 0) - 40), fontSize: '14px', fontStyle: '600' });
    const h = Math.max(CHOICES.min, t.height + 20);
    t.destroy();
    return h;
  }

  private choice(c: ChoiceView, i: number, y: number, h: number): void {
    const sc = this.scene;
    const { x, w } = CHOICES;
    const hov = this.hover === i && c.enabled;
    // gold frame only for a [School] option this player can take; another school's option keeps its chip, not the frame
    const bgKey = c.school && c.enabled ? 'ui:panel_gold' : hov ? 'ui:btn_slate_hover' : 'ui:btn_slate';
    const bg = this.keep(sc.add.nineslice(x, y, bgKey, undefined, w, h, 8, 8, 8, 8).setOrigin(0).setAlpha(c.enabled ? 1 : 0.55));
    // number badge
    this.keep(sc.add.rectangle(x + 12, y + h / 2 - 12, 24, 24, 0x0b0f22).setOrigin(0).setStrokeStyle(2, 0x1a1230));
    this.keep(sc.add.rectangle(x + 13, y + h / 2 - 11, 22, 22).setOrigin(0).setStrokeStyle(1, 0x8b9fe0));
    this.keep(sc.add.text(x + 24, y + h / 2, String(i + 1), { fontFamily: '"Jersey 10"', fontSize: '18px', color: C.text }).setOrigin(0.5));
    let cx = x + 46;
    const chip = this.chipOf(c);
    if (chip) {
      const t = sc.add.text(0, 0, chip.label, { ...typeStyle('badge', C.ink), fontStyle: '700' });
      this.keep(sc.add.rectangle(cx, y + h / 2 - 9, t.width + 12, 18, parseInt(chip.bg.slice(1), 16)).setOrigin(0).setStrokeStyle(2, 0x1a1230));
      this.keep(t.setPosition(cx + 6, y + h / 2).setOrigin(0, 0.5));
      cx += t.width + 22;
    }
    // right side: co-op vote pips
    let rx = x + w - 14;
    const voters = this.view?.votes?.[c.index]?.length ?? 0;
    if (voters) {
      for (let k = 0; k < voters; k++) this.keep(sc.add.circle(rx - k * 12, y + h / 2, 4, 0xffc43d).setStrokeStyle(2, 0x1a1230));
      rx -= voters * 12 + 6;
    }
    const color = !c.enabled ? '#b7c0e3' : c.tag === 'aggressive' ? '#ff8a9a' : C.text;
    this.keep(sc.add.text(cx, y + h / 2, c.text, { ...typeStyle('body', color, rx - cx - 4), fontSize: '14px', fontStyle: '600', lineSpacing: 2 }).setOrigin(0, 0.5));
    bg.setInteractive({ useHandCursor: c.enabled });
    bg.on('pointerover', () => { if (this.hover !== i) { this.hover = i; this.render(); } });
    bg.on('pointerout', () => { if (this.hover === i) { this.hover = -1; this.render(); } });
    bg.on('pointerup', (_p: unknown, _x: unknown, _y: unknown, ev: Phaser.Types.Input.EventData) => { ev.stopPropagation(); if (c.enabled) this.onChoose(c.index); });
  }

  private keep<T extends Phaser.GameObjects.GameObject>(o: T): T {
    this.add(o);
    this.dynamic.push(o);
    return o;
  }
}
