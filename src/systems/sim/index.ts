/**
 * Systems authority entry (Claude 3). Phaser-free: the client (solo / co-op host) and the public-realm server both
 * call installSystemsAuthority(). It registers Services.combat + Services.stats, adds the systems stepper
 * (order 200) to the SimLoop, provides snapshot entities and handles loadout / act / duel / members.
 */
import { Collision, TILE_SIZE } from '@/core/constants';
import { bus } from '@/core/EventBus';
import { Services } from '@/core/services';
import { sim as simLoop } from '@/net/SimLoop';
import type { PlayerId, RealmRule } from '@/net/types';
import type { CharacterSave } from '@/systems/rules/types';
import { Sim } from './Sim';
import type { SimPorts } from './world';

export interface SystemsAuthorityOpts {
  /** defaults to the session's realm rule */
  realmRule?: RealmRule;
  /** public realms: the server's trusted copy of a player's character (Firestore); loadouts are ignored then */
  loadCharacter?: (playerId: PlayerId) => Promise<CharacterSave | null>;
  seed?: number;
  /** merchant price multiplier (client: trustPrice from the narrative engine) */
  priceMult?: (npcId: string) => number;
  /** flag reader for shop stock conditions */
  flag?: (key: string) => unknown;
}

export interface SystemsAuthority { readonly sim: Sim; dispose(): void }

let installed: SystemsAuthority | null = null;
export const systemsAuthority = (): SystemsAuthority | null => installed;

export function installSystemsAuthority(opts: SystemsAuthorityOpts = {}): SystemsAuthority {
  if (installed) return installed;
  const net = Services.get('net');
  const worlds = () => Services.get('worlds');
  const ports: SimPorts = {
    move: (space, x, y, dx, dy, r) => worlds().query(space).moveAndCollide(x, y, dx, dy, r * 1.6, r * 1.2),
    clear: (space, x0, y0, x1, y1) => !worlds().query(space).raycast(x0, y0, x1, y1, Collision.BLOCK_PROJECTILE).hit,
    zoneRule: (space, x, y) => worlds().query(space).zoneRule?.(Math.floor(x / TILE_SIZE), Math.floor(y / TILE_SIZE)) ?? 'wild',
    respawnPoint: (pid) => worlds().respawnPoint(pid),
    emit: (name, payload) => bus.emit(name, payload),
    partySize: () => net.partySize(),
    realmRule: () => opts.realmRule ?? net.session().realmRule,
    path: (space, x0, y0, x1, y1) => {
      const T = TILE_SIZE, p = worlds().query(space).findPath([Math.floor(x0 / T), Math.floor(y0 / T)], [Math.floor(x1 / T), Math.floor(y1 / T)], 3000);
      return p ? p.map(([tx, ty]) => ({ x: tx * T + T / 2, y: ty * T + T / 2 })) : null;
    },
  };
  const s = new Sim(ports, opts.seed);
  // the solo player / co-op host is trusted with its own save (it is the authority); everyone else is sanitised
  s.localPlayer = net.role === 'solo' || net.role === 'host' ? net.localPlayer : null;
  s.shopEnv = { flag: opts.flag ?? (() => undefined), priceMult: opts.priceMult ?? (() => 1) };
  const offs: (() => void)[] = [];
  // quests (authority narrative engine emits these locally)
  offs.push(bus.on('quest:reward', (e) => s.questReward(e)));
  offs.push(bus.on('quest:take-item', (e) => s.questTake(e.item as string, e.qty)));
  // world chests (Claude 2's objects): one roll per character per chest
  offs.push(bus.on('interact', (e) => { if (e.kind === 'chest' && e.playerId) s.openChest(e.playerId, e.objectId, e.props ?? {}); }));
  // a load / new game on this page replaces the world: no creatures, shots or a dead hero carried over
  offs.push(bus.on('game:loaded', () => s.resetForLoad()));
  offs.push(bus.on('game:new', () => s.resetForLoad()));
  offs.push(simLoop.add({ name: 'systems', order: 200, step: (dt, tick) => s.step(dt, tick, net.inputsFor(tick)) }));
  offs.push(net.addProvider({ name: 'systems', collect: (viewer) => s.collect(viewer) }));
  offs.push(net.onClient('loadout', (msg, from) => {
    if (opts.loadCharacter) return; // trusted copies only (public realms)
    s.receive(msg, from);
  }));
  offs.push(net.onClient('act', (msg, from) => s.receive(msg, from)));
  offs.push(net.onClient('duel', (msg, from) => s.receive(msg, from)));
  offs.push(net.onMembers((members) => {
    s.syncMembers(members);
    if (opts.loadCharacter) for (const m of members) {
      if (!m.connected || s.w.players.has(`p:${m.playerId}`)) continue;
      // still here when the trusted copy arrives? (a player who left meanwhile must not come back as a ghost)
      void opts.loadCharacter(m.playerId).then((save) => { if (save && net.session().members.some((x) => x.playerId === m.playerId && x.connected)) s.addPlayer(m.playerId, save); });
    }
  }));
  Services.register('combat', s);
  Services.register('stats', {
    max: (stat) => {
      const p = s.w.players.get(`p:${net.localPlayer}`);
      if (!p) return 1;
      return stat === 'maxHp' ? p.maxHp : stat === 'maxMana' ? p.emberMax : p.staminaMax;
    },
    get: (stat) => s.w.players.get(`p:${net.localPlayer}`)?.stats.stats[stat as string] ?? 0,
  });
  installed = {
    sim: s,
    dispose() { offs.forEach((f) => f()); installed = null; },
  };
  return installed;
}

export { Sim } from './Sim';
export type { SimPorts } from './world';
