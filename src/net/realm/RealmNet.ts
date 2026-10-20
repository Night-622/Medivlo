/**
 * Public-realm client over WebSocket. The server is the authority (ServerNet); this renders it.
 * URL: wss://<realm-server>/realm/<realmId>?token=<Firebase ID token>
 */
import type { ClientMsg, PlayerId, RealmRule, ServerMsg } from '../types';
import { RemoteClient } from '../RemoteClient';

export interface RealmListing { id: string; name: string; rule: RealmRule; space: string; players: number; max: number }

export async function listRealms(serverUrl: string): Promise<RealmListing[]> {
  const res = await fetch(`${serverUrl.replace(/^ws/, 'http')}/realms`);
  if (!res.ok) throw new Error('Realm server unavailable');
  return (await res.json()) as RealmListing[];
}

export class RealmNet extends RemoteClient {
  readonly role = 'server-client' as const;

  private constructor(private ws: WebSocket, playerId: PlayerId) { super(playerId); }

  /**
   * The ID token rides in the hello, never the URL (request logs keep URLs). A server from before that (no /caps)
   * still gets it in the query string, so a new client works against an older deployment.
   */
  static async connect(serverUrl: string, realmId: string, token: string, hello: { name: string; classId: string; level: number }, timeoutMs = 30000): Promise<RealmNet> {
    const http = serverUrl.replace(/^ws/, 'http');
    const caps = await fetch(`${http}/caps`).then((r) => (r.ok ? r.json() as Promise<{ helloToken?: boolean }> : null)).catch(() => null);
    const inHello = !!caps?.helloToken;
    return new Promise((resolve, reject) => {
      const url = `${serverUrl.replace(/^http/, 'ws')}/realm/${encodeURIComponent(realmId)}${inHello ? '' : `?token=${encodeURIComponent(token)}`}`;
      const ws = new WebSocket(url);
      let net: RealmNet | null = null;
      const timer = setTimeout(() => { ws.close(); reject(new Error('The realm did not answer')); }, timeoutMs);
      ws.onopen = () => ws.send(JSON.stringify({ type: 'hello', playerId: '', ...hello, firstVisit: false, ...(inHello ? { token } : {}) } satisfies ClientMsg));
      ws.onmessage = (ev) => {
        let m: ServerMsg;
        try { m = JSON.parse(String(ev.data)) as ServerMsg; } catch { return; }
        if (!net && m.type === 'welcome') { net = new RealmNet(ws, m.you); clearTimeout(timer); net.onServer(m); resolve(net); return; }
        if (!net && m.type === 'kick') { clearTimeout(timer); reject(new Error(m.reason)); return; }
        net?.onServer(m);
      };
      ws.onclose = () => { clearTimeout(timer); if (net) net.onServer({ type: 'kick', reason: 'Disconnected from the realm' }); else reject(new Error('Could not reach the realm server')); };
    });
  }

  protected transportSend(msg: ClientMsg): void { if (this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(msg)); }

  leave(): void { this.leaving = true; this.transportSend({ type: 'bye' }); this.ws.close(); }
}
