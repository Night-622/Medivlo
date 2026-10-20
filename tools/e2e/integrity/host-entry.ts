// Bundle entry for tools/e2e/integrity-host-fuzz.mjs: a co-op HOST in Node, set up the way WorldV2Scene and createHero
// set one up in the browser (systems + world + narrative authorities on a HostNet), minus Phaser.
import { Game, Registry, Services, createNewGameState, getFlag, bus } from '@/core';
import { HostNet } from '@/net/coop/HostNet';
import { NetSwitch } from '@/net/NetSwitch';
import { sim } from '@/net/SimLoop';
import { installSystemsAuthority, systemsAuthority } from '@/systems/sim';
import { installWorldAuthority } from '@/world/hc/authority';
import { installNarrativeAuthority, npcPlacements } from '@/narrative/engine';
import { newCharacter } from '@/systems/rules/character';

export async function makeHost(): Promise<{ host: HostNet; onPeer: (id: string, ch: unknown) => void; hostId: string }> {
  const st = createNewGameState(0);
  st.player.name = 'Hosty';
  st.player.hero = { classId: 'warden', look: { skin: 1, hair: 2, hc: 3, eyes: 0, ec: 1, mouth: 0, mark: 0, body: 0 }, outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } } as never;
  st.world.location.space = 'concordia';
  Game.set(st);
  try { Registry.load(); } catch (e) { console.warn('registry load failed', e); }
  let onPeer!: (id: string, ch: unknown) => void;
  const sig = { host: async (_c: string, _h: string, fn: (id: string, ch: unknown) => void) => { onPeer = fn; return () => undefined; } };
  const hostId = 'local-host';
  const host = new HostNet(sig as never, hostId, { name: 'Hosty', classId: 'warden', level: 5, worldSeed: 1, hostInSafeZone: () => true, hasVisited: () => true, markVisited: () => undefined });
  await host.open('FUZZ01');
  Services.register('net', new NetSwitch(host));
  sim.attach(Services.get('net'));
  installSystemsAuthority({ priceMult: () => 1, flag: (k) => getFlag(k) });
  const woken = new Map<string, string[]>();
  installWorldAuthority({
    space: 'concordia', classOf: () => 'warden', sim, npcPlacements,
    players: () => Services.tryGet('combat')?.players().map((p) => ({ id: p.playerId ?? p.id, space: p.space, x: p.x, y: p.y })) ?? [],
    place: (pid, space, x, y) => void systemsAuthority()?.sim.teleport(pid, space, x, y),
    wokenOf: (pid) => (pid === hostId ? Game.state.world.waystones : woken.get(pid) ?? woken.set(pid, []).get(pid)!),
  } as never);
  installNarrativeAuthority();
  Services.get('net').send({ type: 'loadout', data: newCharacter('warden') as never });
  return { host, onPeer, hostId };
}

export { Game, Services, sim, bus, newCharacter };
