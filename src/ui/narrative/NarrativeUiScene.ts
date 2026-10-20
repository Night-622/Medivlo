import Phaser from 'phaser';
import { Registry, bus } from '@/core';
import type { LoreEntry, LoreId } from '@/core';
import { dialogueClient as dialogue } from '@/narrative/client/dialogueClient';
import { BookReader } from './BookReader';
import { CodexPanel } from './CodexPanel';
import { DialogueBox } from './DialogueBox';
import { QuestJournal } from './QuestJournal';
import { isAction } from '@/ui/kit/hc/keys';

export const NARRATIVE_UI_KEY = 'NarrativeUi';

type Panel = 'journal' | 'codex' | 'book';

/**
 * Overlay scene for the dialogue box, quest journal, codex and book reader. Runs alongside the HUD
 * (installed by src/narrative/index.ts). Keys: J journal, L codex, Esc close, Space/Enter continue,
 * 1–9 choose, ←/→ turn book pages. World objects with props.lore pointing at a 'books' entry open the reader.
 */
export class NarrativeUiScene extends Phaser.Scene {
  private box!: DialogueBox;
  private journal!: QuestJournal;
  private codex!: CodexPanel;
  private reader!: BookReader;
  private open: Panel | null = null;

  constructor() { super(NARRATIVE_UI_KEY); }

  create(): void {
    this.box = new DialogueBox(this, (i) => dialogue.choose(i), () => dialogue.advance());
    this.journal = new QuestJournal(this, () => this.closePanel());
    this.codex = new CodexPanel(this, (id) => this.show('book', id));
    this.reader = new BookReader(this);
    const unsub = dialogue.subscribe((v) => {
      this.box.show(v);
      if (v) this.closePanel();
    });
    this.events.once('shutdown', unsub);
    this.box.show(dialogue.view);

    bus.onScene(this, 'interact', ({ props }) => {
      if (dialogue.active || typeof props.lore !== 'string') return;
      const e = Registry.tryGet('lore', props.lore) as LoreEntry | undefined;
      if (e?.category === 'books') this.show('book', e.id);
    });

    // HUD buttons / the tracker / other panels' top tabs ask for the journal or codex through ui:open
    bus.onScene(this, 'ui:open', ({ panel }) => {
      if ((panel === 'journal' || panel === 'codex') && this.open !== panel && !dialogue.active) this.show(panel, undefined, true);
    });

    this.input.keyboard!.on('keydown', (ev: KeyboardEvent) => {
      if (dialogue.active) {
        if (ev.code === 'Space' || ev.code === 'Enter') dialogue.advance();
        else if (ev.code === 'Escape') dialogue.close();
        else if (/^Digit[1-9]$/.test(ev.code)) {
          const idx = this.box.choiceAt(Number(ev.code.slice(5)) - 1, dialogue.view);
          if (idx !== undefined) dialogue.choose(idx);
        }
        return;
      }
      if (this.open === 'book') {
        if (ev.code === 'ArrowRight' || isAction(ev, 'right')) this.reader.turn(1);
        else if (ev.code === 'ArrowLeft' || isAction(ev, 'left')) this.reader.turn(-1);
        else if (ev.code === 'Escape') this.closePanel();
        return;
      }
      if (this.open === 'journal') {
        if (ev.code === 'ArrowUp') { this.journal.move(-1); return; }
        if (ev.code === 'ArrowDown') { this.journal.move(1); return; }
        if (isAction(ev, 'track')) { this.journal.track(); return; }
      }
      // bindable actions (rebinds), not letters ('track' too); ↑/↓ in the journal and ←/→ in books are in-panel keys
      if (isAction(ev, 'journal')) this.toggle('journal');
      else if (isAction(ev, 'codex')) this.toggle('codex');
      else if (ev.code === 'Escape' && this.open) this.closePanel();
    });
  }

  private toggle(panel: 'journal' | 'codex'): void {
    if (this.open === panel) this.closePanel();
    else this.show(panel);
  }

  /** `viaBus`: opened by someone else's ui:open, so don't echo it */
  private show(panel: Panel, book?: LoreId, viaBus = false): void {
    const wasOpen = this.open !== null;
    this.journal.close();
    this.codex.close();
    this.reader.close();
    if (panel === 'journal') this.journal.open();
    else if (panel === 'codex') this.codex.open();
    else if (!book || !this.reader.open(book)) { this.open = null; return; }
    this.open = panel;
    if (!wasOpen && !viaBus) bus.emit('ui:open', { panel });
  }

  private closePanel(): void {
    if (!this.open) return;
    const panel = this.open;
    this.journal.close();
    this.codex.close();
    this.reader.close();
    this.open = null;
    bus.emit('ui:close', { panel });
  }
}
