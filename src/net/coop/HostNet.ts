/**
 * Co-op HOST: this browser is the authority for up to 4 players (docs/REBUILD.md § Multiplayer).
 * Guests connect over WebRTC (PeerLink). All authority logic lives in AuthorityNet; this adds the room,
 * peer admission (party size, first-visit safe-zone rule) and the WebRTC transport.
 */
import { AuthorityNet } from '../AuthorityNet';
import type { ClientMsg, PartyMember, PlayerId, ServerMsg } from '../types';
import { newJoinCode } from './codes';
import { PeerLink } from './PeerLink';
import { Social } from '../social';
import type { Signaling } from './signaling';

export interface HostOptions {
  name: string; classId: string; level: number;
  worldSeed: number;
  maxPlayers?: number;
  /** first-time joiners may only enter while the host is in a safe zone (user rule) */
  hostInSafeZone(): boolean;
  /** has this player joined this host's world before? */
  hasVisited(playerId: PlayerId): boolean;
  markVisited(playerId: PlayerId): void;
  /** identity for signalling (Firestore rooms require the auth uid); defaults to the player id */
  signalId?: string;
}

export class HostNet extends AuthorityNet {
  readonly role = 'host' as const;
  readonly localPlayer: PlayerId;
  private links = new Map<PlayerId, PeerLink>();
  private closeRoom: (() => void) | null = null;

  constructor(private sig: Signaling, playerId: PlayerId, private opts: HostOptions) {
    super();
    this.localPlayer = playerId;
    this.info = {
      kind: 'coop', sessionId: playerId, joinCode: null, realmRule: 'peaceful', maxPlayers: opts.maxPlayers ?? 4,
      members: [{ playerId, name: opts.name, classId: opts.classId, level: opts.level, isHost: true, connected: true, downed: false }],
    };
  }

  /** Open the room; returns the 6-char join code to show the player. */
  async open(code = newJoinCode()): Promise<string> {
    this.info.joinCode = code;
    this.closeRoom = await this.sig.host(code, this.opts.signalId ?? this.localPlayer, (peerId, ch) => {
      const link = new PeerLink(ch, 'host');
      let playerId: PlayerId | null = null;
      link.onMessage((raw) => {
        const msg = raw as ClientMsg;
        if (!msg || typeof msg !== 'object') return;
        if (msg.type === 'hello') { if (!playerId) playerId = this.admit(link, msg, peerId); return; }
        if (playerId) this.handleClient(playerId, msg);
      });
      // Only the player's CURRENT link may remove them: after a rejoin the old connection dies late (ICE timeout)
      // and must not disconnect the new one.
      link.onClose(() => { if (playerId && this.links.get(playerId) === link) { this.links.delete(playerId); this.removeRemote(playerId); } });
      setTimeout(() => { if (!playerId) link.close(); }, 20000);
    });
    this.broadcastSession();
    return code;
  }

  protected transportSend(playerId: PlayerId, msg: ServerMsg): void { this.links.get(playerId)?.send(msg); }

  close(): void {
    this.broadcast({ type: 'kick', reason: 'The host ended the session' });
    for (const l of this.links.values()) l.close();
    this.links.clear();
    this.closeRoom?.();
    super.close();
  }

  /** `peerId` is the signalling identity (Firestore rules tie it to the guest's auth uid); the hello must match it. */
  private admit(link: PeerLink, hello: Extract<ClientMsg, { type: 'hello' }>, peerId: string): PlayerId | null {
    const reject = (reason: string) => { link.send({ type: 'kick', reason } satisfies ServerMsg); setTimeout(() => link.close(), 500); return null; };
    if (typeof hello.playerId !== 'string' || hello.playerId !== peerId || hello.playerId === this.localPlayer) return reject('You can\'t join that game');
    // a rejoin replaces the player's stale seat instead of counting it
    if (this.info.members.filter((m) => m.connected && m.playerId !== hello.playerId).length >= this.info.maxPlayers) return reject('That game is full');
    if (Social.isBlocked(hello.playerId)) return reject('You can\'t join that game');
    if (!this.opts.hasVisited(hello.playerId) && !this.opts.hostInSafeZone()) return reject('First visits can only join while the host is in a safe zone. Try again in a moment.');
    this.opts.markVisited(hello.playerId);
    const stale = this.links.get(hello.playerId);
    this.links.set(hello.playerId, link);
    stale?.close(); // its onClose sees it is no longer current and leaves the new seat alone
    const member: PartyMember = {
      playerId: hello.playerId, name: String(hello.name ?? 'Wanderer').slice(0, 24), classId: String(hello.classId ?? '').slice(0, 32),
      level: Math.max(1, Math.min(99, Math.floor(Number(hello.level)) || 1)), isHost: false, connected: true, downed: false,
    };
    this.addRemote(member, { worldSeed: this.opts.worldSeed });
    return hello.playerId;
  }
}
