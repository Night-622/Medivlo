/**
 * Switch the running game between solo, hosting and guesting (Services.net + SimLoop). Owner: Claude 1.
 * Signalling: Firestore when Firebase is configured and the player is signed in, else same-browser
 * BroadcastChannel (dev/tests).
 */
import { Game, Services } from '@/core';
import { TILE_SIZE, WORLD_SEED } from '@/core/constants';
import { sim } from '../SimLoop';
import { NetSwitch } from '../NetSwitch';
import type { NetService } from '../types';
import { LocalNet } from '../LocalNet';
import { HostNet } from './HostNet';
import { GuestNet } from './GuestNet';
import { LocalSignaling, type Signaling } from './signaling';
import { FirestoreSignaling } from './firestoreSignaling';
import { normaliseCode } from './codes';
import { RealmNet, listRealms, type RealmListing } from '../realm/RealmNet';
import { isFirebaseConfigured } from '@/firebase/config';
import { ensureUser, firebase } from '@/firebase/app';
import { hostedCodeOf, setHosting } from '@/firebase/friends';

async function signalingAndUid(): Promise<{ sig: Signaling; uid: string }> {
  if (isFirebaseConfigured) {
    try {
      const user = await ensureUser();
      return { sig: new FirestoreSignaling(firebase().db), uid: user.uid };
    } catch (e) { console.warn('[coop] Firebase unavailable, using local signalling', e); }
  }
  return { sig: new LocalSignaling(), uid: `local-${crypto.randomUUID().slice(0, 8)}` };
}

export function me(): { name: string; classId: string; level: number } {
  const p = Game.hasState ? Game.state.player : null;
  return { name: p?.name ?? 'Wanderer', classId: p?.hero?.classId ?? '', level: (Game.hasState ? Game.state.character?.level : undefined) ?? p?.progression.level ?? 1 };
}

let current: HostNet | GuestNet | RealmNet | null = null;
/** the solo player id from before the first switch: the local hero keeps it when hosting and gets it back after leaving */
let soloId: string | null = null;

/** Swap the transport under the run's NetSwitch (Boot registers one); subscriptions move across. */
function useNet(next: NetService): void {
  const net = Services.tryGet('net');
  if (net instanceof NetSwitch) net.use(next);
  else { Services.register('net', new NetSwitch(next)); sim.attach(Services.get('net')); }
}
const localId = (): string => soloId ??= Services.tryGet('net')?.localPlayer ?? `local-${crypto.randomUUID().slice(0, 8)}`;

/**
 * Is the local (host) hero standing in a 'safe' zone right now? First-time joiners may only enter then (user rule).
 * Reads the hero from the combat sim and the zone from the world (Claude 2's zoneRule). Unknown → false (strict).
 */
export function hostInSafeZone(): boolean {
  const me = Services.tryGet('net')?.localPlayer;
  const hero = Services.tryGet('combat')?.players().find((p) => p.playerId === me);
  const worlds = Services.tryGet('worlds');
  if (!hero || !worlds) return false;
  return worlds.query(hero.space).zoneRule?.(Math.floor(hero.x / TILE_SIZE), Math.floor(hero.y / TILE_SIZE)) === 'safe';
}

/** Start hosting the current game. Returns the join code. `hostInSafeZone` comes from the world (Claude 2). */
export async function hostGame(hostInSafeZone: () => boolean): Promise<string> {
  leaveCoop();
  const { sig, uid } = await signalingAndUid();
  const visited = new Set<string>((Game.hasState ? Game.state.world.visitors : undefined) ?? []);
  // in-game id stays the solo one (the sim already knows this hero); signalling uses the auth uid
  const host = new HostNet(sig, localId(), {
    ...me(), worldSeed: WORLD_SEED, hostInSafeZone, signalId: uid,
    hasVisited: (p) => visited.has(p),
    markVisited: (p) => {
      visited.add(p);
      if (Game.hasState) Game.state.world.visitors = [...visited];
    },
  });
  const code = await host.open();
  useNet(host);
  current = host;
  if (isFirebaseConfigured) setHosting(code); // friends see "Hosting" and can join with one click
  return code;
}

/** Join a friend's game by code. On success the game must start the World scene in guest mode. */
export async function joinGame(rawCode: string): Promise<GuestNet> {
  let code = normaliseCode(rawCode);
  // An 8-character FRIEND code joins whatever that friend is hosting right now.
  if (code && code.length === 8 && isFirebaseConfigured) { await ensureUser(); code = normaliseCode(await hostedCodeOf(code)); }
  if (!code || code.length !== 6) throw new Error('Use a 6-character game code or an 8-character friend code');
  leaveCoop();
  const { sig, uid } = await signalingAndUid();
  const guest = await GuestNet.join(sig, code, { playerId: uid, ...me(), firstVisit: true });
  localId();
  useNet(guest);
  current = guest;
  return guest;
}

/** Back to solo (host ends the session for guests; a guest leaves). */
export function leaveCoop(): void {
  if (!current) return;
  if (current instanceof HostNet) { current.close(); if (isFirebaseConfigured) setHosting(null); } else current.leave();
  realmListing = null;
  current = null;
  useNet(new LocalNet(localId(), me().name, me().classId, me().level));
}

export const coopRole = (): 'solo' | 'host' | 'guest' | 'realm' => (!current ? 'solo' : current instanceof RealmNet ? 'realm' : current.role);

// ───────── public realms ─────────

/** Realm server base URL: VITE_REALM_SERVER, or the local dev server. Empty = public realms unavailable. */
export const REALM_SERVER: string = (import.meta.env.VITE_REALM_SERVER as string | undefined) ?? (import.meta.env.DEV ? 'http://localhost:8080' : '');

let realmListing: RealmListing | null = null;
/** The realm we're in (space, rule), or null. */
export const currentRealm = (): RealmListing | null => realmListing;

export async function browseRealms(): Promise<RealmListing[]> {
  if (!REALM_SERVER) throw new Error('Public realms open at launch');
  return listRealms(REALM_SERVER);
}

/** Connects to a public realm (server = authority). Token: Firebase ID token; dev builds without a user use DEV_AUTH. */
export async function enterRealm(listing: RealmListing): Promise<RealmNet> {
  if (!REALM_SERVER) throw new Error('Public realms open at launch');
  leaveCoop();
  let token = '';
  if (isFirebaseConfigured) {
    try { token = await (await ensureUser()).getIdToken(); }
    catch (e) { if (!import.meta.env.DEV) throw new Error('Sign in to play online'); console.warn('[realm] no Firebase user, using dev auth', e); }
  }
  if (!token) token = `dev:local-${crypto.randomUUID().slice(0, 8)}:${me().name.replace(/:/g, '')}`;
  const net = await RealmNet.connect(REALM_SERVER, listing.id, token, me());
  localId();
  useNet(net);
  current = net;
  realmListing = listing;
  return net;
}
