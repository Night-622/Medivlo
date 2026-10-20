import Phaser from 'phaser';
import { Game, Registry, bus, keyLabel } from '@/core';
import type { NpcDef, ObjectiveDef, QuestDef, QuestId } from '@/core';
import { C, typeStyle } from '@/ui/kit/hc';
import { npcTexture } from '@/art';
import { itemName } from '@/narrative/client/itemNames';
import { iconFrame } from '@/ui/character/hc/InventoryPanel';
import { HC_ITEMS } from '@/data/items/hc/items.gen';
import { HC_WEAPONS } from '@/data/items/hc/weapons.gen';
import { HC_PIECES } from '@/data/items/hc/armour.gen';
import { HC_LEGENDARIES } from '@/data/items/hc/legendary.gen';
import { currentStage, objectiveCount, objectiveDone, objectiveTarget, objectiveText, progress, questDef, stageHistory } from '@/narrative/engine/quests';
import { markTutorial } from '@/narrative/client/tutorial';

export type JournalTab = 'active' | 'main' | 'side' | 'bounty' | 'done';

// Handoff › Journal (1280×720): top tabs (Pack I · Skills K · Spells B · Journal J · Map M), ✕ at the right,
// list panel 400×604 at (48,84) with category tabs, detail panel 760×604 at (472,84).
const CATS: [JournalTab, string][] = [['active', 'Active'], ['main', 'Story'], ['side', 'Side'], ['bounty', 'Bounty'], ['done', 'Done']];
const TOP: [string, string, string | null][] = [['Pack', 'I', 'inventory'], ['Skills', 'K', 'skills'], ['Spells', 'B', 'spells'], ['Journal', 'J', null], ['Map', 'M', 'map']];
const CAT_COLOR: Record<string, string> = { main: '#ffc43d', class: '#ffc43d', side: '#7fe3ff', companion: '#c9a2ff', faction: '#c9a2ff', bounty: '#ff8a5c' };
const CAT_LABEL: Record<string, string> = { main: 'STORY', class: 'STORY', side: 'SIDE', companion: 'COMPANION', faction: 'SIDE', bounty: 'BOUNTY' };
const ACT_LABEL: Record<string, string> = { prologue: 'Prologue', act1: 'Act I', act2: 'Act II', act3: 'Act III' };
const XP_LABEL: Record<number, string> = { 1: 'Minor', 2: 'Standard', 3: 'Major' };
const ROW_H = 58;
const LIST = { x: 64, y: 146, w: 368, h: 530 };

let rarityOf: Map<string, string> | null = null;
const rarity = (id: string): string => {
  rarityOf ??= new Map([...HC_ITEMS, ...HC_WEAPONS, ...HC_PIECES, ...HC_LEGENDARIES].map((x) => [x.id, (x as { rarity?: string }).rarity ?? 'common']));
  return rarityOf.get(id) ?? 'common';
};
const SLOT_BY_RARITY: Record<string, string> = { common: 'ui:slot_common', fine: 'ui:slot_fine', ember: 'ui:slot_ember', runed: 'ui:slot_runed', wrought: 'ui:slot_wrought', spark: 'ui:slot_spark', legendary: 'ui:slot_ember' };

/**
 * The quest journal (J), handoff › Journal. Visuals: Claude 1; quest state/logic: Claude 4 (engine/quests, guest mirror).
 * Wheel scrolls the list; ↑/↓ select, the bindable 'track' action (default T) tracks (routed by NarrativeUiScene).
 */
export class QuestJournal extends Phaser.GameObjects.Container {
  tab: JournalTab = 'active';
  private parts: Phaser.GameObjects.GameObject[] = [];
  private sel: string | null = null;
  private scroll = 0;
  private quests_: QuestDef[] = [];

  constructor(scene: Phaser.Scene, private onClose: () => void = () => undefined) {
    super(scene, 0, 0);
    scene.input.on('wheel', (p: Phaser.Input.Pointer, _o: unknown, _dx: number, dy: number) => {
      if (!this.visible || p.x > LIST.x + LIST.w + 16) return;
      this.scroll = Math.max(0, Math.min(this.maxScroll(), this.scroll + dy * 0.6));
      this.render();
    });
    this.setDepth(20).setVisible(false);
    scene.add.existing(this);
  }

  open(tab: JournalTab = this.tab): void {
    if (tab !== this.tab) { this.scroll = 0; this.sel = null; }
    this.tab = tab;
    this.setVisible(true);
    this.render();
  }

  close(): void { this.setVisible(false); }

  /** ↑/↓ from the scene's key routing */
  move(d: number): void {
    if (!this.quests_.length) return;
    const i = Math.max(0, Math.min(this.quests_.length - 1, this.quests_.findIndex((q) => q.id === this.sel) + d));
    this.sel = this.quests_[i].id;
    const top = i * ROW_H;
    if (top < this.scroll) this.scroll = top;
    if (top + ROW_H > this.scroll + LIST.h) this.scroll = top + ROW_H - LIST.h;
    this.render();
  }

  /** T: track the selected quest */
  track(): void {
    const q = this.quests_.find((x) => x.id === this.sel);
    const p = q ? progress(q.id) : undefined;
    if (!q || !p || p.completed || p.failed) return;
    Game.state.narrative.trackedQuest = q.id;
    markTutorial('track');
    this.render();
  }

  private maxScroll(): number { return Math.max(0, this.quests_.length * ROW_H - LIST.h); }

  private quests(tab: JournalTab): QuestDef[] {
    const all = Object.keys(Game.state.narrative.quests).map((id) => questDef(id as QuestId)).filter((d): d is QuestDef => !!d);
    const st = (d: QuestDef) => progress(d.id)!;
    const live = all.filter((d) => !st(d).completed && !st(d).failed);
    if (tab === 'done') return all.filter((d) => st(d).completed || st(d).failed);
    if (tab === 'main') return live.filter((d) => d.type === 'main' || d.type === 'class');
    if (tab === 'side') return live.filter((d) => d.type === 'side' || d.type === 'companion' || d.type === 'faction');
    if (tab === 'bounty') return live.filter((d) => d.type === 'bounty');
    const tracked = Game.state.narrative.trackedQuest;
    return live.sort((a, b) => Number(b.id === tracked) - Number(a.id === tracked) || Number(b.type === 'main' || b.type === 'class') - Number(a.type === 'main' || a.type === 'class'));
  }

  private render(): void {
    this.parts.forEach((o) => o.destroy());
    this.parts = [];
    const sc = this.scene;
    const { width: W, height: H } = sc.scale;
    this.keep(sc.add.rectangle(0, 0, W, H, 0x0d1226, 0.86).setOrigin(0).setInteractive());
    // top tabs
    const tw = 150, total = TOP.length * tw + (TOP.length - 1) * 6;
    TOP.forEach(([label, key, panel], i) => {
      const x = (W - total) / 2 + i * (tw + 6), on = panel === null;
      const bg = this.keep(sc.add.nineslice(x, 20, on ? 'ui:tab_active' : 'ui:tab', undefined, tw, 44, 8, 8, 8, 8).setOrigin(0));
      const t = this.keep(sc.add.text(x + tw / 2 - 8, 42, label, { fontFamily: '"Jersey 10"', fontSize: '24px', color: on ? C.text : C.text300 }).setOrigin(0.5));
      this.keep(sc.add.text(t.x + t.width / 2 + 8, 43, key, { fontFamily: '"Jersey 10"', fontSize: '15px', color: '#7884b5' }).setOrigin(0, 0.5));
      if (panel) bg.setInteractive({ useHandCursor: true }).on('pointerup', () => { this.onClose(); bus.emit('ui:open', { panel }); });
    });
    const x = this.keep(sc.add.nineslice(W - 92, 20, 'ui:btn_slate', undefined, 44, 44, 8, 8, 8, 8).setOrigin(0));
    this.keep(sc.add.text(W - 70, 42, '✕', { fontFamily: '"Jersey 10"', fontSize: '26px', color: C.text }).setOrigin(0.5));
    x.setInteractive({ useHandCursor: true }).on('pointerup', () => this.onClose());

    // list panel + categories
    this.keep(sc.add.nineslice(48, 84, 'ui:panel', undefined, 400, 604, 8, 8, 8, 8).setOrigin(0));
    const cw = (360 - 4 * 4) / 5;
    CATS.forEach(([k, label], i) => {
      const on = this.tab === k, cx = 68 + i * (cw + 4);
      const bg = this.keep(sc.add.nineslice(cx, 100, on ? 'ui:tab_active' : 'ui:tab', undefined, cw, 36, 8, 8, 8, 8).setOrigin(0));
      const n = this.quests(k).length;
      this.keep(sc.add.text(cx + cw / 2, 118, `${label} ${n}`, { ...typeStyle('badge', on ? C.text : C.text300), fontStyle: '700' }).setOrigin(0.5));
      bg.setInteractive({ useHandCursor: true }).on('pointerup', () => this.open(k));
    });
    this.quests_ = this.quests(this.tab);
    const tracked = Game.state.narrative.trackedQuest;
    if (!this.sel || !this.quests_.some((q) => q.id === this.sel)) this.sel = this.quests_.find((q) => q.id === tracked)?.id ?? this.quests_[0]?.id ?? null;
    this.scroll = Math.min(this.scroll, this.maxScroll());
    const rows = sc.add.container(0, 0);
    this.keep(rows);
    if (!this.quests_.length) this.keep(sc.add.text(248, 300, 'Nothing written here yet.', typeStyle('bodyL', C.text300)).setOrigin(0.5));
    this.quests_.forEach((q, i) => {
      const y = LIST.y + i * ROW_H - this.scroll;
      if (y + ROW_H < LIST.y || y > LIST.y + LIST.h) return;
      this.row(rows, q, y);
    });
    rows.setMask(sc.make.graphics({}, false).fillRect(LIST.x - 4, LIST.y - 2, LIST.w + 12, LIST.h + 4).createGeometryMask());

    // detail panel
    this.keep(sc.add.nineslice(472, 84, 'ui:panel', undefined, 760, 604, 8, 8, 8, 8).setOrigin(0));
    const q = this.quests_.find((d) => d.id === this.sel);
    if (q) this.detail(q);
    else this.keep(sc.add.text(852, 380, 'Pick a quest on the left.', typeStyle('bodyL', C.text300)).setOrigin(0.5));
  }

  private row(rows: Phaser.GameObjects.Container, q: QuestDef, y: number): void {
    const sc = this.scene;
    const p = progress(q.id)!;
    const on = q.id === this.sel;
    const color = p.failed ? '#ff8a9a' : p.completed ? C.text500 : CAT_COLOR[q.type] ?? C.text;
    const bg = sc.add.nineslice(LIST.x, y, on ? 'ui:panel_gold' : 'ui:btn_slate', undefined, LIST.w, ROW_H - 6, 8, 8, 8, 8).setOrigin(0);
    rows.add(bg);
    const giver = q.giver ? (Registry.tryGet('npc', q.giver) as NpcDef | undefined) : undefined;
    const tex = giver ? npcTexture(sc, giver) : null;
    if (tex) rows.add(sc.add.sprite(LIST.x + 26, y + ROW_H - 10, tex, 0).setOrigin(0.5, 1).setCrop(0, 0, 40, 34));
    // one line, always: the place line sits right under it. Long names shrink a little, then end in an ellipsis
    // (the detail panel shows the full name)
    const title = sc.add.text(LIST.x + 50, y + 8, q.name, { fontFamily: '"Jersey 10"', fontSize: '22px', color });
    const maxW = LIST.w - 110;
    if (title.width > maxW) title.setFontSize(19);
    if (title.width > maxW) {
      let s = q.name;
      while (s.length > 4 && title.width > maxW) { s = s.slice(0, -1).trimEnd(); title.setText(`${s}…`); }
    }
    rows.add(title);
    rows.add(sc.add.text(LIST.x + 50, y + 33, `${ACT_LABEL[q.act] ?? ''} · ${placeLabel(q)}`, { ...typeStyle('badge', '#7884b5'), fontStyle: '700' }));
    const hist = stageHistory()[q.id] ?? [p.stage];
    const totalStages = Math.max(hist.length, q.stages.filter((s) => !s.end).length + 1);
    // "Step n/N" (which stage you're on), so it isn't mistaken for the objective's own count beside it in the detail
    const prog = p.completed ? 'Done' : p.failed ? 'Failed' : `Step ${Math.min(hist.length, totalStages)}/${totalStages}`;
    rows.add(sc.add.text(LIST.x + LIST.w - 12, y + 10, prog, { ...typeStyle('badge', p.completed ? C.good : C.gold300), fontStyle: '700' }).setOrigin(1, 0));
    if (Game.state.narrative.trackedQuest === q.id) rows.add(sc.add.rectangle(LIST.x + LIST.w - 18, y + 36, 10, 10, 0xffc43d).setRotation(Math.PI / 4).setStrokeStyle(2, 0x1a1230));
    bg.setInteractive({ useHandCursor: true }).on('pointerup', () => { this.sel = q.id; this.render(); });
  }

  private detail(q: QuestDef): void {
    const sc = this.scene;
    const p = progress(q.id)!;
    const color = CAT_COLOR[q.type] ?? C.gold;
    const giver = q.giver ? (Registry.tryGet('npc', q.giver) as NpcDef | undefined) : undefined;
    // giver ×3 on a lit plinth
    this.keep(sc.add.circle(548, 196, 50, parseInt(color.slice(1), 16), 0.18));
    this.keep(sc.add.rectangle(496, 222, 104, 6, 0x212b52).setOrigin(0));
    const tex = giver ? npcTexture(sc, giver) : null;
    if (tex) {
      const s = this.keep(sc.add.sprite(548, 224, tex, 0).setOrigin(0.5, 1).setScale(3));
      if (sc.anims.exists(`${tex}:idle`)) s.play(`${tex}:idle`);
    }
    const chip = this.keep(sc.add.text(624, 106, CAT_LABEL[q.type] ?? q.type.toUpperCase(), { ...typeStyle('badge', C.ink), fontStyle: '700', backgroundColor: color, padding: { x: 8, y: 2 }, letterSpacing: 1 } as Phaser.Types.GameObjects.Text.TextStyle));
    this.keep(sc.add.text(chip.x + chip.width + 10, 108, `${ACT_LABEL[q.act] ?? ''} · ${placeLabel(q)}${p.completed ? ' · Completed' : p.failed ? ' · Failed' : ''}`, { ...typeStyle('caption', C.text300), fontStyle: '600' }));
    const title = this.keep(sc.add.text(624, 130, q.name, { fontFamily: '"Jersey 10"', fontSize: '44px', color: C.text, wordWrap: { width: 584 } }).setLineSpacing(-6));
    if (title.height > 80) title.setFontSize(34);
    this.keep(sc.add.text(624, title.y + title.height + 4, giver ? `Given by ${giver.name}` : 'The story itself', { ...typeStyle('body', color), fontStyle: '600' }));

    // left column: summary + objectives
    let y = 248;
    const L = 496, LW = 380, R = 898, RW = 310;
    const sum = this.keep(sc.add.text(L, y, q.summary, { ...typeStyle('body', C.text, LW), fontSize: '14px', lineSpacing: 6 }));
    y += sum.height + 14;
    this.keep(sc.add.text(L, y, 'Objectives', { fontFamily: '"Jersey 10"', fontSize: '24px', color: '#ffc43d' }));
    y += 30;
    const hist = stageHistory()[q.id] ?? [p.stage];
    for (const sid of hist.slice(0, -1)) {
      const s = q.stages.find((st) => st.id === sid);
      const first = s?.objectives[0];
      if (s && first) y += this.objective(L, y, LW, first.text, 'done');
      if (y > 600) break;
    }
    const cur = currentStage(q);
    if (cur && !p.completed && !p.failed) {
      for (const o of cur.objectives) {
        if (o.hidden && !objectiveDone(q, o)) continue;
        if (y > 600) break;
        y += this.objective(L, y, LW, objectiveText(q, o) + (o.optional ? ' (optional)' : ''), objectiveDone(q, o) ? 'done' : 'now', q, o);
      }
    } else if (p.outcome) {
      y += this.objective(L, y, LW, `Outcome: ${p.outcome}`, 'done');
    }

    // right column: rewards + note
    let ry = 248;
    this.keep(sc.add.text(R, ry, 'Rewards', { fontFamily: '"Jersey 10"', fontSize: '24px', color: '#ffc43d' }));
    ry += 32;
    const r = q.reward;
    // `glyph`: rewards with no atlas icon (experience, skill points) get a short gold mark in the slot instead
    const line = (slotKey: string, icon: { key: string; frame?: string | number } | undefined, label: string, sub?: string, glyph?: string) => {
      this.keep(sc.add.nineslice(R, ry, slotKey, undefined, 44, 44, 8, 8, 8, 8).setOrigin(0));
      if (icon) this.keep(sc.add.image(R + 22, ry + 22, icon.key, icon.frame));
      else if (glyph) this.keep(sc.add.text(R + 22, ry + 23, glyph, { fontFamily: '"Jersey 10"', fontSize: '22px', color: '#ffc43d' }).setOrigin(0.5));
      this.keep(sc.add.text(R + 54, ry + (sub ? 6 : 14), label, { ...typeStyle('body', C.text, RW - 60), fontStyle: '600' }));
      if (sub) this.keep(sc.add.text(R + 54, ry + 24, sub, typeStyle('caption', C.text500)));
      ry += 50;
    };
    if (r?.xpTier) line('ui:slot_empty', undefined, `${XP_LABEL[r.xpTier]} experience`, undefined, 'XP');
    if (r?.gold) line('ui:slot_empty', iconFrame('icon_coin'), `${r.gold} Embershards`);
    if (r?.skillPoints) line('ui:slot_empty', undefined, `+${r.skillPoints} skill point${r.skillPoints > 1 ? 's' : ''}`, undefined, 'SP');
    for (const it of [...(r?.hcItems ?? []), ...(r?.items ?? [])].slice(0, 5 - Number(!!r?.xpTier) - Number(!!r?.gold))) {
      line(SLOT_BY_RARITY[rarity(it.item)] ?? 'ui:slot_empty', iconFrame(it.item), `${itemName(it.item)}${it.qty && it.qty > 1 ? ` ×${it.qty}` : ''}`, rarity(it.item).toUpperCase());
    }
    if (!r) line('ui:slot_empty', undefined, 'Unknown');
    const note = q.portable ? 'Finishing this in a friend\'s world also finishes it in yours.' : p.completed ? 'Completed. The journal remembers.' : q.type === 'bounty' ? 'Bounties are posted again after a rest.' : 'Track it to see the next step on your screen and map.';
    const nt = this.keep(sc.add.text(R + 12, Math.max(ry + 8, 470), '', { ...typeStyle('caption', C.text300, RW - 24), lineSpacing: 4 }));
    nt.setText(`Note · ${note}`);
    this.keep(sc.add.rectangle(R, nt.y - 10, RW, nt.height + 20, 0x10162e).setOrigin(0).setStrokeStyle(2, 0x1a1230));
    this.bringToTop(nt);

    // buttons
    const done = p.completed || p.failed;
    const isTracked = Game.state.narrative.trackedQuest === q.id;
    if (!done) {
      const b = this.keep(sc.add.nineslice(496, 620, isTracked ? 'ui:btn_slate' : 'ui:btn_gold', undefined, 200, 52, 8, 8, 8, 8).setOrigin(0));
      this.keep(sc.add.text(596, 646, isTracked ? '◆ Tracked' : 'Track quest', { fontFamily: '"Jersey 10"', fontSize: '24px', color: isTracked ? C.gold300 : C.ink }).setOrigin(0.5));
      if (!isTracked) b.setInteractive({ useHandCursor: true }).on('pointerup', () => this.track());
    }
    const m = this.keep(sc.add.nineslice(done ? 496 : 706, 620, 'ui:btn_slate', undefined, 180, 52, 8, 8, 8, 8).setOrigin(0));
    this.keep(sc.add.text((done ? 496 : 706) + 90, 646, 'Show on map', { fontFamily: '"Jersey 10"', fontSize: '24px', color: C.text }).setOrigin(0.5));
    m.setInteractive({ useHandCursor: true }).on('pointerup', () => { this.onClose(); bus.emit('ui:open', { panel: 'map' }); });
    this.keep(sc.add.text(1208, 646, `↑ ↓ quest · ${keyLabel('track')} track · Esc close`, typeStyle('caption', '#7884b5')).setOrigin(1, 0.5));
  }

  private objective(x: number, y: number, w: number, s: string, state: 'done' | 'now', q?: QuestDef, o?: ObjectiveDef): number {
    const sc = this.scene;
    const done = state === 'done';
    this.keep(sc.add.rectangle(x, y + 2, 14, 14, done ? 0x2de2c4 : 0x0b0f22).setOrigin(0).setStrokeStyle(2, done ? 0x1a1230 : 0x8b9fe0));
    const counted = !!(q && o && !done && objectiveTarget(o) > 1);
    const label = counted ? s.replace(/\s*\(\d+\s*\/\s*\d+\)\s*$/, '') : s; // the count sits on the right
    const t = this.keep(sc.add.text(x + 24, y, label, { ...typeStyle('body', done ? C.text500 : C.text, w - 90), lineSpacing: 3 }));
    if (done) this.keep(sc.add.rectangle(x + 24, y + 9, Math.min(t.width, w - 90), 1, 0x7884b5).setOrigin(0));
    let h = Math.max(20, t.height + 6);
    if (q && o && !done && objectiveTarget(o) > 1) {
      const have = objectiveCount(q, o), need = objectiveTarget(o);
      this.keep(sc.add.text(x + w, y, `${have}/${need}`, { ...typeStyle('body', '#ffe27a'), fontStyle: '700' }).setOrigin(1, 0));
      this.keep(sc.add.rectangle(x + 24, y + h, w - 24, 6, 0x212b52).setOrigin(0).setStrokeStyle(2, 0x1a1230));
      this.keep(sc.add.rectangle(x + 24, y + h, (w - 24) * Math.min(1, have / need), 6, 0xffc43d).setOrigin(0));
      h += 14;
    }
    return h + 6;
  }

  private keep<T extends Phaser.GameObjects.GameObject>(o: T): T {
    this.add(o);
    this.parts.push(o);
    return o;
  }
}

/** 'region:alder' / 'zone:ash-capital-2' / 'ws:…' → a readable place label. */
function placeLabel(q: QuestDef): string {
  const raw = String(q.region ?? '').replace(/^[a-z]+:/, '');
  if (!raw) return '';
  return raw.split('-').filter((w) => !/^\d+$/.test(w)).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
}
