/**
 * Client side of dialogue (every process, authority or not). Renders from the replicated `dialogue:node`,
 * `dialogue:ended` and vote events; sends picks/continue/close to the authority over the net, so solo and
 * co-op share one path (LocalNet routes the sends to the engine). Owner: Claude 4.
 */
import { Game, Registry, Services, bus, classSchool, heroClassId } from '@/core';
import type { DialogueId, GameEvents, NpcDef, NpcId } from '@/core';
import { decodeChoice } from '../engine/chips';
import { dialogue } from '../engine/dialogue';
import type { DialogueView } from '../engine/dialogue';
import { mirrored } from '../engine/state';
import { getTrust, trustKey } from '../engine/trust';
import { formatKeys } from './keys';
import { hostFlags } from './mirror';

/** the speaker's trust in the story being played (the host's, for a co-op guest) */
function viewTrust(npc: NpcId): number {
  if (!mirrored()) return getTrust(npc);
  const v = hostFlags[trustKey(npc)];
  return typeof v === 'number' ? v : (Registry.tryGet('npc', npc) as NpcDef | undefined)?.trust ?? 0;
}

export interface ClientDialogueView extends DialogueView {
  nodeId: string;
  /** votes cast so far: choice index → player ids */
  votes: Record<number, string[]>;
  /** ms epoch when the vote closes (co-op), 0 = no timer */
  deadline: number;
  /** this viewer may pick (false for an onlooker of someone's personal pick, or a [School] option of another school) */
  canPick: boolean;
}

type Listener = (v: ClientDialogueView | null) => void;

class DialogueClient {
  view: ClientDialogueView | null = null;
  private voteId: string | null = null;
  private initiators = new Map<string, string>();
  private listeners = new Set<Listener>();
  private installed = false;

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  install(): void {
    if (this.installed) return;
    this.installed = true;
    bus.on('dialogue:started', ({ sessionId, initiator }) => { if (sessionId && initiator) this.initiators.set(sessionId, initiator); });
    bus.on('dialogue:node', (p) => this.onNode(p));
    bus.on('dialogue:ended', ({ sessionId }) => {
      if (sessionId) this.initiators.delete(sessionId);
      if (!sessionId || sessionId === this.view?.sessionId) this.set(null);
    });
    bus.on('vote:cast', ({ voteId, playerId, choice }) => {
      const v = this.view;
      if (!v || voteId !== this.voteId) return;
      for (const k of Object.keys(v.votes)) v.votes[+k] = v.votes[+k].filter((p) => p !== playerId);
      (v.votes[choice] ??= []).push(playerId);
      this.emit();
    });
    const net = Services.tryGet('net');
    net?.on('vote:open', ({ vote }) => {
      const v = this.view;
      if (!v || vote.sessionId !== v.sessionId || vote.nodeId !== v.nodeId) return;
      this.voteId = vote.voteId;
      v.deadline = vote.deadlineMs;
      const me = net.localPlayer;
      for (const c of v.choices) {
        const allowed = vote.choices.find((x) => x.index === c.index)?.allowed;
        if (allowed && allowed !== 'all' && !allowed.includes(me)) c.enabled = false;
      }
      this.emit();
    });
    net?.on('vote:result', ({ voteId }) => { if (voteId === this.voteId) this.voteId = null; });
  }

  get active(): boolean { return this.view !== null; }

  choose(index: number): void {
    const v = this.view;
    if (!v || !v.canPick || !v.choices.find((c) => c.index === index)?.enabled) return;
    const net = Services.tryGet('net');
    if (!net) return dialogue.choose(index);
    net.send({ type: 'vote', voteId: this.voteId ?? `${v.sessionId}:${v.nodeId}`, choice: index });
    bus.emit('vote:cast', { voteId: this.voteId ?? `${v.sessionId}:${v.nodeId}`, playerId: net.localPlayer, choice: index });
  }

  advance(): void {
    const v = this.view;
    if (!v || v.choices.length) return;
    const net = Services.tryGet('net');
    if (!net) return dialogue.advance();
    net.send({ type: 'dialogue:continue', sessionId: v.sessionId });
  }

  close(): void {
    const v = this.view;
    if (!v || v.choices.length) return;
    const net = Services.tryGet('net');
    if (!net) return dialogue.close();
    net.send({ type: 'act', domain: 'narrative', action: 'dialogue-close', args: { sessionId: v.sessionId } });
  }

  private onNode(p: GameEvents['dialogue:node']): void {
    const net = Services.tryGet('net');
    const me = net?.localPlayer ?? 'local';
    if (p.audience !== 'all' && !p.audience.includes(me)) return;
    const initiator = this.initiators.get(p.sessionId) ?? me;
    const mySchool = classSchool(heroClassId(Game.state) ?? '');
    const choices = p.choices.map((c) => {
      const cv = decodeChoice(c);
      // a [School] option is shown to everyone, but only that school's players can take it
      if (cv.school && cv.school !== mySchool) cv.enabled = false;
      return cv;
    });
    const speakerNpc = p.speaker.startsWith('npc:') ? (p.speaker as NpcId) : undefined;
    this.voteId = null;
    this.set({
      sessionId: p.sessionId,
      dialogueId: p.dialogueId as DialogueId,
      nodeId: p.nodeId,
      npcId: speakerNpc,
      speakerId: p.speaker,
      speakerName: this.speakerName(p.speaker),
      text: formatKeys(p.text),
      mood: (p.mood ?? 'neutral') as DialogueView['mood'],
      choices,
      audience: p.audience,
      initiator,
      trust: speakerNpc ? viewTrust(speakerNpc) : undefined,
      votes: {},
      deadline: 0,
      canPick: true,
    });
  }

  private speakerName(speaker: string): string {
    if (speaker === 'narrator') return '';
    if (speaker === 'player') {
      // the story's hero is the campaign owner (the host in co-op)
      const host = Services.tryGet('net')?.session().members.find((m) => m.isHost);
      return (host && host.playerId !== Services.tryGet('net')?.localPlayer ? host.name : Game.state.player.name) || 'You';
    }
    return (Registry.tryGet('npc', speaker) as NpcDef | undefined)?.name ?? speaker;
  }

  private set(v: ClientDialogueView | null): void {
    this.view = v;
    this.emit();
  }

  private emit(): void {
    for (const fn of this.listeners) fn(this.view);
  }
}

export const dialogueClient = new DialogueClient();
