import Phaser from 'phaser';
import { Game, bus } from '@/core';
import type { QuestDef, QuestId } from '@/core';
import { C, typeStyle } from '@/ui/kit/hc';
import { activeQuests, currentStage, objectiveCount, objectiveDone, objectiveTarget, objectiveText, questDef } from '@/narrative/engine/quests';

const W = 260;
const COLOR: Record<string, string> = { main: '#ffc43d', class: '#ffc43d', side: '#7fe3ff', companion: '#c9a2ff', faction: '#c9a2ff', bounty: '#ff8a5c' };

/**
 * Tracked quest on the HUD's rightColumn anchor (handoff › HUD › quest tracker): translucent box 260 wide,
 * diamond + title in the quest's colour, then the open objectives with checkboxes and counts. Click → journal.
 * Visuals: Claude 1; mounted by src/narrative/client/index.ts (Claude 4).
 */
export class QuestTracker extends Phaser.GameObjects.Container {
  private parts: Phaser.GameObjects.GameObject[] = [];

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    const refresh = () => this.refresh();
    // ui:close: tracking a quest in the Journal (T) changes only state, so redraw when the Journal (or any panel) closes
    for (const ev of ['quest:started', 'quest:advanced', 'quest:objective', 'quest:completed', 'quest:failed', 'item:picked', 'flag:changed', 'ui:close'] as const) {
      bus.onScene(scene, ev, refresh);
    }
    this.refresh();
  }

  refresh(): void {
    this.parts.forEach((o) => o.destroy());
    this.parts = [];
    if (!Game.hasState) return;
    const id = Game.state.narrative.trackedQuest as QuestId | null;
    const def = id ? questDef(id) : undefined;
    const stage = def ? currentStage(def) : undefined;
    // First Steps (onboarding) rides along under whatever is tracked, until its steps are done
    const tut = activeQuests().find((q) => q.chapter === 'tutorial' && q.id !== def?.id);
    if ((!def || !stage) && !tut) return;
    const sc = this.scene;

    const box = this.keep(sc.add.rectangle(0, 0, W, 10, 0x0d1226, 0.72).setOrigin(0).setStrokeStyle(2, 0x1a1230, 0.9));
    let y = 10;
    if (def && stage) {
      const color = COLOR[def.type] ?? C.gold;
      const tutorial = def.chapter === 'tutorial';
      const objectives = stage.objectives.filter((o) => !(o.hidden && !objectiveDone(def, o))).slice(0, tutorial ? 8 : 4);
      this.keep(sc.add.rectangle(16, y + 10, 8, 8, parseInt(color.slice(1), 16)).setRotation(Math.PI / 4).setStrokeStyle(2, 0x1a1230));
      const title = this.keep(sc.add.text(28, y, def.name, { fontFamily: '"Jersey 10"', fontSize: '22px', color, wordWrap: { width: W - 40 } }).setLineSpacing(-4));
      y += title.height + 6;
      for (const o of objectives) {
        const done = objectiveDone(def, o);
        const need = objectiveTarget(o);
        const text = objectiveText(def, o).replace(/\s*\(\d+\s*\/\s*\d+\)\s*$/, '') + (o.optional && !tutorial ? ' (optional)' : '');
        this.keep(sc.add.rectangle(12, y + 3, 12, 12, done ? 0x2de2c4 : 0x0b0f22).setOrigin(0).setStrokeStyle(2, done ? 0x1a1230 : 0x8b9fe0));
        const t = this.keep(sc.add.text(32, y, text, { ...typeStyle('body', done ? C.text500 : C.text, W - 32 - (need > 1 ? 44 : 12)), lineSpacing: 2 }));
        if (need > 1 && !done) this.keep(sc.add.text(W - 12, y, `${objectiveCount(def, o)}/${need}`, { ...typeStyle('body', '#ffe27a'), fontStyle: '700' }).setOrigin(1, 0));
        y += Math.max(18, t.height) + 6;
      }
    }
    if (tut) y = this.firstSteps(tut, y + (def && stage ? 4 : 0));
    box.setSize(W, y + 6);
    box.setInteractive({ useHandCursor: true }).on('pointerup', () => bus.emit('ui:open', { panel: 'journal' }));
  }

  /** the next three open First Steps, small, under a caption */
  private firstSteps(def: QuestDef, y: number): number {
    const sc = this.scene;
    const open = (currentStage(def)?.objectives ?? []).filter((o) => !o.hidden && !objectiveDone(def, o));
    if (!open.length) return y;
    this.keep(sc.add.text(12, y, 'FIRST STEPS', { ...typeStyle('caption', '#7fe3ff'), fontStyle: '700' }));
    y += 18;
    for (const o of open.slice(0, 3)) {
      this.keep(sc.add.rectangle(14, y + 4, 9, 9, 0x0b0f22).setOrigin(0).setStrokeStyle(2, 0x5a6ab0));
      const t = this.keep(sc.add.text(30, y, objectiveText(def, o), { ...typeStyle('caption', C.text300, W - 40), lineSpacing: 1 }));
      y += Math.max(16, t.height) + 4;
    }
    return y;
  }

  private keep<T extends Phaser.GameObjects.GameObject>(o: T): T {
    this.add(o);
    this.parts.push(o);
    return o;
  }
}
