/**
 * Dialogue runner (authority-only, UI-agnostic). Owner: Claude 4.
 * 07-narrative-systems.md §3: one dialogue session at a time; `scope: 'party'` dialogues are shown to the
 * whole party and every choice node is a vote (net.openVote, host breaks ties); personal dialogues are the
 * initiator's alone. Solo (partySize 1) applies picks synchronously, so tests and the soft-lock bot stay
 * deterministic. Every node is published as the replicated `dialogue:node` event; clients render from it.
 */
import { Game, Registry, Services, bus, getFlag } from '@/core';
import type { DialogueChoice, DialogueDef, DialogueId, DialogueNode, NpcDef, NpcId } from '@/core';
import { encodeChips, type ChoiceView } from './chips';
import { attribute, check } from './conditions';
import { applyEffects } from './effects';
import { SCHOOL_NAME, campaign } from './classes';
import { allowedFor, heroClass, localPlayer, partyHasSchool, partySize } from './party';
import { getRep, rankTitle, repTier } from './reputation';
import { ext, isAuthority, toast } from './state';
import { changeTrust, getTrust } from './trust';

export type { ChoiceView } from './chips';

export interface DialogueView {
  sessionId: string;
  dialogueId: DialogueId;
  npcId?: NpcId;
  speakerId: string;
  speakerName: string;
  text: string;
  mood: NonNullable<DialogueNode['mood']>;
  choices: ChoiceView[];
  /** who sees it: 'all' (party scope) or the initiator */
  audience: string[] | 'all';
  initiator: string;
  /** speaker NPC's trust 0..5 (name-plate diamonds) */
  trust?: number;
}

type Listener = (view: DialogueView | null) => void;

const ATTR_LABEL: Record<string, string> = { might: 'Might', finesse: 'Finesse', vigor: 'Vigor', intellect: 'Intellect', will: 'Will' };
const LEADING_LABEL = /^\[([^\]]+)\]\s*([\s\S]*)$/;
const VOTE_MS = 30_000;
const ENDING_VOTE_MS = 60_000;

/** Hollow Crown campaign tokens: {class} {sibling} {school} {realm} {start} {mentor} {nemesis} {halfstone} {siblingbearer} */
function campaignToken(key: string): string | undefined {
  const c = campaign(heroClass());
  if (!c) return undefined;
  const sib = campaign(c.sibling);
  switch (key) {
    case 'class': return c.name;
    case 'sibling': return sib?.name;
    case 'siblingbearer': return sib?.bearer;
    case 'school': return SCHOOL_NAME[c.school];
    case 'realm': return c.realm;
    case 'start': return c.start;
    case 'mentor': return c.mentor;
    case 'nemesis': return c.nemesis;
    case 'halfstone': return c.halfStone;
    default: return undefined;
  }
}

export function interpolate(text: string): string {
  return text
    .replace(/\{(class|sibling|siblingbearer|school|realm|start|mentor|nemesis|halfstone)\}/g, (m, k: string) => campaignToken(k) ?? m)
    .replace(/\{player\.name\}/g, () => Game.state.player.name || 'Ashmarked')
    .replace(/\{flag:([^}]+)\}/g, (_, k: string) => String(getFlag(k) ?? ''))
    // {rank:lanternate} → "Acolyte" (or "friend"), {tier:lanternate} → "Honoured"
    .replace(/\{rank:([a-z-]+)\}/g, (_, s: string) => rankTitle(`faction:${s}`) ?? 'friend')
    .replace(/\{tier:([a-z-]+)\}/g, (_, s: string) => repTier(getRep(`faction:${s}`)));
}

function onceStore(): Record<string, string[]> {
  return ext<Record<string, string[]>>('dialogueOnce', () => ({}));
}
/** TRUST ±1 pays out once per save: `<dialogueId>|<nodeId>:<index>` */
function trustPaid(): string[] {
  return ext<string[]>('trustPaid', () => []);
}

let sessionSeq = 0;

class DialogueRunner {
  private def: DialogueDef | null = null;
  private npcId?: NpcId;
  private nodeId: string | null = null;
  private sessionId = '';
  private initiator = '';
  private audience: string[] | 'all' = 'all';
  private visible: { choice: DialogueChoice; index: number; enabled: boolean }[] = [];
  private queue: { id: DialogueId; npcId?: NpcId; initiator?: string }[] = [];
  private listeners = new Set<Listener>();
  /** bumps on every node change, so a late vote result for an old node is ignored */
  private nodeSeq = 0;

  get active(): boolean { return this.def !== null; }
  get session(): string | null { return this.def ? this.sessionId : null; }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /** Open a dialogue; if one is running, queue it to open after. Returns false if the def is missing or has no valid entry. */
  open(id: DialogueId, npcId?: NpcId, initiator: string = localPlayer()): boolean {
    // a co-op guest or realm visitor never runs scenes: it renders the host's replicated dialogue:node views
    if (!isAuthority()) return false;
    if (this.def) {
      // one pending copy per dialogue: repeated interacts while a scene is up must not stack it
      if (this.def.id !== id && !this.queue.some((q) => q.id === id)) this.queue.push({ id, npcId, initiator });
      return true;
    }
    const def = Registry.tryGet('dialogue', id) as DialogueDef | undefined;
    if (!def) { console.warn(`[dialogue] unknown ${id}`); return false; }
    const entry = def.entries.find((e) => check(e.when));
    if (!entry) return false;
    if (def.bark) {
      const node = def.nodes[entry.node];
      if (node) {
        applyEffects(node.effects);
        toast(`${this.speakerName(node)}: ${interpolate(node.text)}`, 'info');
      }
      return true;
    }
    this.def = def;
    this.npcId = npcId;
    this.sessionId = `dlg:${++sessionSeq}`;
    this.initiator = initiator;
    this.audience = def.scope === 'party' ? 'all' : [initiator];
    bus.emit('dialogue:started', { dialogueId: id, npcId, sessionId: this.sessionId, initiator, audience: this.audience });
    bus.emit('ui:open', { panel: 'dialogue' });
    this.goto(entry.node);
    return true;
  }

  view(): DialogueView | null {
    if (!this.def || !this.nodeId) return null;
    const node = this.def.nodes[this.nodeId];
    const speakerNpc = this.speakerNpc(node);
    return {
      sessionId: this.sessionId,
      dialogueId: this.def.id,
      npcId: this.npcId,
      speakerId: node.speaker,
      speakerName: this.speakerName(node),
      text: interpolate(node.text),
      mood: node.mood ?? 'neutral',
      choices: this.visible.map(({ choice, index, enabled }) => this.choiceView(choice, index, enabled)),
      audience: this.audience,
      initiator: this.initiator,
      trust: speakerNpc ? getTrust(speakerNpc) : undefined,
    };
  }

  /** Continue a node without choices. `from` (a player id) must be the initiator when given. */
  advance(from?: string): void {
    if (!this.def || !this.nodeId) return;
    if (from !== undefined && from !== this.initiator) return;
    if (this.visible.length) return;
    this.goto(this.def.nodes[this.nodeId].next ?? null);
  }

  choose(index: number): void {
    if (!this.def || !this.nodeId) return;
    const v = this.visible.find((c) => c.index === index);
    if (!v || !v.enabled) return;
    const { choice } = v;
    const def = this.def;
    const nodeId = this.nodeId;
    bus.emit('dialogue:choice', { dialogueId: def.id, nodeId, choiceIndex: index, sessionId: this.sessionId });
    if (choice.once) (onceStore()[def.id] ??= []).push(`${nodeId}:${index}`);
    // v2 chips: decide-at-the-moment flags first, so they hold even if an effect closes the dialogue
    if (choice.insight) applyEffects([{ insight: choice.insight }]);
    if (choice.trust) {
      const key = `${def.id}|${nodeId}:${index}`;
      const target = choice.trustNpc ?? this.speakerNpc(def.nodes[nodeId]) ?? this.npcId;
      if (target && !trustPaid().includes(key)) { trustPaid().push(key); changeTrust(target, choice.trust); }
    }
    applyEffects(choice.effects);
    if (this.def !== def) return; // an effect closed it
    let to = choice.to;
    if (choice.check) {
      const passed = attribute(choice.check.stat) >= choice.check.dc;
      toast(`${ATTR_LABEL[choice.check.stat] ?? choice.check.stat} check ${passed ? 'passed' : 'failed'}`, 'info');
      if (!passed) to = choice.check.failTo;
    }
    this.goto(to);
  }

  /** Drop the open scene and everything queued (this machine just became a client: the host's story takes over). */
  drop(): void {
    this.queue.length = 0;
    if (this.def) this.finish();
  }

  /**
   * Esc. On a line: skip the text, not the consequences. The remaining lines run (with their effects) up to the next
   * choice, which stays on screen because it is a decision, or to the end. With choices showing: leave the
   * conversation (critical scenes are reopenable). Claude 7's QA: closing outright dropped 330 lines' flags, items
   * and trust.
   */
  close(from?: string): void {
    if (from !== undefined && from !== this.initiator) return;
    const def = this.def;
    if (!def) return;
    if (this.visible.length) return this.goto(null);
    for (let i = 0; i < 64 && this.def === def && this.nodeId && !this.visible.length; i++) this.goto(def.nodes[this.nodeId].next ?? null);
    if (this.def === def && !this.visible.length) this.finish(); // a line loop (never in data): stop anyway
  }

  private goto(nodeId: string | null): void {
    const def = this.def;
    if (!def) return;
    if (nodeId === null) return this.finish();
    const node = def.nodes[nodeId];
    if (!node) { console.warn(`[dialogue] ${def.id} missing node "${nodeId}"`); return this.finish(); }
    this.nodeId = nodeId;
    this.nodeSeq++;
    applyEffects(node.effects);
    if (this.def !== def) return;
    const picked = onceStore()[def.id] ?? [];
    this.visible = (node.choices ?? []).flatMap((choice, index) => {
      if (choice.once && picked.includes(`${nodeId}:${index}`)) return [];
      // [School] options exist only when someone in the party can take them
      if (choice.school && !partyHasSchool(choice.school)) return [];
      const ok = check(choice.when);
      // INSIGHT is a discovery: hidden (never locked) when its gate fails
      if (!ok && (!choice.lockedLabel || choice.insight)) return [];
      return [{ choice, index, enabled: ok }];
    });
    // merchants: a conversation's last line with an NPC who has a `shop` offers trading (Claude 3 opens the
    // shop panel when the dialogue closes with flag shop.open = npc id).
    if (!this.visible.length && !node.next && this.npcId && def.scope !== 'party') {
      const npc = Registry.tryGet('npc', this.npcId) as NpcDef | undefined;
      if (npc?.shop) {
        this.visible = [
          { choice: { text: 'Let me see your wares.', to: null, effects: [{ setFlag: 'shop.open', value: this.npcId }] }, index: 1000, enabled: true },
          { choice: { text: 'Farewell.', to: null, tag: 'leave' }, index: 1001, enabled: true },
        ];
      }
    }
    this.emit();
    if (this.visible.some((v) => v.enabled) && partySize() > 1) this.startVote();
  }

  /** Co-op: put the node's choices to the party (or to the initiator alone for personal dialogues). */
  private startVote(): void {
    const net = Services.tryGet('net');
    if (!net || !this.def || !this.nodeId) return;
    const seq = this.nodeSeq;
    const personal = this.audience !== 'all';
    const ending = this.def.id === 'dialogue:heart-choice';
    const choices = this.visible.filter((v) => v.enabled).map(({ choice, index }) => ({
      index,
      text: this.choiceView(choice, index, true).text,
      allowed: personal ? [this.initiator] : allowedFor(choice.school),
    }));
    void net.openVote(
      { sessionId: this.sessionId, audience: this.audience, dialogueId: this.def.id, nodeId: this.nodeId, choices },
      ending ? ENDING_VOTE_MS : VOTE_MS,
    ).then((winner) => { if (this.nodeSeq === seq) this.choose(winner); });
  }

  private finish(): void {
    const def = this.def;
    const npcId = this.npcId;
    const sessionId = this.sessionId;
    const initiator = this.initiator;
    const audience = this.audience;
    this.def = null;
    this.nodeId = null;
    this.nodeSeq++;
    this.visible = [];
    this.npcId = undefined;
    this.emit();
    if (def) {
      bus.emit('ui:close', { panel: 'dialogue' });
      bus.emit('dialogue:ended', { dialogueId: def.id, npcId, sessionId, initiator, audience });
    }
    // drain the queue: skip queued dialogues that have no valid entry (e.g. an epilogue slide for a companion never met)
    while (this.queue.length && !this.def) {
      const next = this.queue.shift()!;
      this.open(next.id, next.npcId, next.initiator);
    }
  }

  private speakerNpc(node: DialogueNode): NpcId | undefined {
    return node.speaker.startsWith('npc:') ? (node.speaker as NpcId) : undefined;
  }

  private speakerName(node: DialogueNode): string {
    if (node.speaker === 'player') return Game.state.player.name || 'You';
    if (node.speaker === 'narrator') return '';
    return (Registry.tryGet('npc', node.speaker) as NpcDef | undefined)?.name ?? node.speaker;
  }

  private choiceView(c: DialogueChoice, index: number, enabled: boolean): ChoiceView {
    const raw = interpolate(c.text);
    const m = LEADING_LABEL.exec(raw);
    // "[Label] words" → chip + text; a choice that is only "[Do something]" is an action, shown as "(Do something)"
    const view: ChoiceView = m && m[2].trim()
      ? { index, enabled, tag: c.tag, text: m[2], chip: m[1] }
      : { index, enabled, tag: c.tag, text: m ? `(${m[1]})` : raw };
    if (!enabled && c.lockedLabel) view.chip = c.lockedLabel.replace(/^\[|\]$/g, '');
    if (c.check) view.check = { stat: c.check.stat, label: ATTR_LABEL[c.check.stat] ?? c.check.stat, dc: c.check.dc, have: attribute(c.check.stat) };
    const rep = (c.effects ?? []).flatMap((e) => ('reputation' in e ? [{ faction: e.reputation, delta: e.delta }] : []));
    if (rep.length) view.rep = rep;
    if (c.trust && !trustPaid().includes(`${this.def?.id}|${this.nodeId}:${index}`)) view.trust = c.trust;
    if (c.quest) view.quest = true;
    if (c.insight) view.insight = true;
    if (c.school) view.school = c.school;
    return view;
  }

  private emit(): void {
    const v = this.view();
    for (const fn of this.listeners) fn(v);
    if (!v) return;
    bus.emit('dialogue:node', {
      sessionId: v.sessionId, dialogueId: v.dialogueId, nodeId: this.nodeId!, audience: v.audience,
      speaker: v.speakerId, text: v.text, mood: v.mood,
      choices: v.choices.map((c) => ({
        index: c.index, text: c.text, chips: encodeChips(c), school: c.school,
        locked: !c.enabled || undefined, lockedLabel: !c.enabled ? c.chip : undefined,
      })),
    });
  }
}

export const dialogue = new DialogueRunner();

export function openDialogue(id: DialogueId, npcId?: NpcId, initiator?: string): boolean {
  return dialogue.open(id, npcId, initiator);
}

/** Authority: client messages that drive dialogue (continue / close / solo picks). */
export function installDialogueNet(): void {
  const net = Services.tryGet('net');
  if (!net) return;
  net.onClient('dialogue:continue', (m, from) => { if (m.sessionId === dialogue.session) dialogue.advance(from); });
  net.onClient('act', (m, from) => {
    if (m.domain !== 'narrative') return;
    if (m.action === 'dialogue-close' && m.args.sessionId === dialogue.session) dialogue.close(from);
  });
  // solo picks: the client sends its vote with the local id `<sessionId>:<nodeId>`; co-op votes resolve via openVote
  net.onClient('vote', (m) => {
    if (partySize() > 1) return;
    const view = dialogue.view();
    if (!view || !m.voteId.startsWith(`${view.sessionId}:`)) return;
    dialogue.choose(m.choice);
  });
}
