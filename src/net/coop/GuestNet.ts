/** Co-op GUEST over WebRTC: renders the host's world (RemoteClient) through a PeerLink. */
import type { ClientMsg, PlayerId, ServerMsg } from '../types';
import { RemoteClient } from '../RemoteClient';
import { PeerLink } from './PeerLink';
import type { Signaling } from './signaling';

export interface JoinHello { playerId: PlayerId; name: string; classId: string; level: number; firstVisit: boolean }

export class GuestNet extends RemoteClient {
  readonly role = 'guest' as const;

  private constructor(private link: PeerLink, playerId: PlayerId) { super(playerId); }

  /** Knock on a co-op room by join code. Resolves once welcomed; rejects with the host's reason. */
  static async join(sig: Signaling, code: string, hello: JoinHello, timeoutMs = 20000): Promise<GuestNet> {
    const ch = await sig.join(code, hello.playerId);
    const link = new PeerLink(ch, 'guest');
    const net = new GuestNet(link, hello.playerId);
    const welcomed = new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('The host did not answer')), timeoutMs);
      link.onMessage((raw) => {
        const m = raw as ServerMsg;
        if (m.type === 'welcome') { clearTimeout(timer); resolve(); }
        else if (m.type === 'kick') { clearTimeout(timer); reject(new Error(m.reason)); }
        net.onServer(m);
      });
      link.onClose(() => { clearTimeout(timer); reject(new Error('Connection to the host closed')); });
    });
    welcomed.catch(() => undefined); // awaited below; an earlier failure must not leave it rejecting unhandled
    try {
      await link.start();
      let openTimer: ReturnType<typeof setTimeout> | undefined;
      await Promise.race([link.opened, new Promise((_, r) => { openTimer = setTimeout(() => r(new Error('Could not connect to the host (network blocked?)')), timeoutMs); })])
        .finally(() => clearTimeout(openTimer));
      link.send({ type: 'hello', ...hello } satisfies ClientMsg);
      await welcomed;
    } catch (e) {
      net.leaving = true;
      link.close(); // a half-open connection would otherwise be admitted later and hold a party seat
      throw e;
    }
    link.onClose(() => net.onServer({ type: 'kick', reason: 'Disconnected from the host' }));
    return net;
  }

  protected transportSend(msg: ClientMsg): void { this.link.send(msg); }

  leave(): void { this.leaving = true; this.link.send({ type: 'bye' }); setTimeout(() => this.link.close(), 200); }
}
