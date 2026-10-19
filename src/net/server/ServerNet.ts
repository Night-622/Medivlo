/**
 * Public-realm SERVER authority (runs in Node inside a realm's isolated context). Owner: Claude 1.
 * Same authority logic as the co-op host (AuthorityNet) but with no local player; every player is remote and
 * reached through a send function supplied by the WebSocket layer.
 */
import { AuthorityNet } from '../AuthorityNet';
import type { ClientMsg, PartyMember, PlayerId, RealmRule, ServerMsg } from '../types';

const BLOCKED = /\b(fuck|shit|cunt|nigg\w*|fag\w*|retard\w*|whore|slut)\b/gi;

export class ServerNet extends AuthorityNet {
  readonly role = 'server' as const;
  readonly localPlayer: PlayerId = '';
  private senders = new Map<PlayerId, (msg: ServerMsg) => void>();
  private muted = new Map<PlayerId, Set<PlayerId>>();

  constructor(realmId: string, rule: RealmRule, maxPlayers = 8, private worldSeed = 0) {
    super();
    this.info = { kind: 'public', sessionId: realmId, joinCode: null, realmRule: rule, maxPlayers, members: [] };
  }

  full(): boolean { return this.remotes.size >= this.info.maxPlayers; }
  playerCount(): number { return this.remotes.size; }

  /** A verified player connected. Returns false if the realm is full. */
  attach(member: Omit<PartyMember, 'isHost' | 'connected' | 'downed'>, send: (msg: ServerMsg) => void): boolean {
    if (this.full() && !this.remotes.has(member.playerId)) return false;
    this.senders.set(member.playerId, send);
    this.addRemote({ ...member, isHost: false, connected: true, downed: false }, { worldSeed: this.worldSeed });
    return true;
  }

  detach(playerId: PlayerId): void {
    this.removeRemote(playerId);
    this.senders.delete(playerId);
    this.muted.delete(playerId);
  }

  /** A message from a connected player. */
  receive(playerId: PlayerId, msg: ClientMsg): void {
    if (!this.remotes.has(playerId)) return;
    if (msg.type === 'hello') return;
    this.handleClient(playerId, msg);
  }

  /** Per-player mute (block): the muter stops receiving that player's chat. */
  mute(by: PlayerId, target: PlayerId): void {
    const set = this.muted.get(by) ?? new Set<PlayerId>();
    set.add(target);
    this.muted.set(by, set);
  }

  protected transportSend(playerId: PlayerId, msg: ServerMsg): void {
    if (msg.type === 'chat' && this.muted.get(playerId)?.has(msg.from)) return;
    this.senders.get(playerId)?.(msg);
  }

  /** Strangers can chat in public realms: mask slurs/profanity (word list is a start; extend it). */
  protected filterChat(text: string): string {
    return text.trim().replace(BLOCKED, (w) => w[0] + '*'.repeat(w.length - 1));
  }
}
