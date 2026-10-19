/** Escort engine test (Claude 4): spawn through Services.combat, hide the static NPC, arrival/loss flags, despawn. */
import { Game, Services, bus, createNewGameState, getFlag } from '@/core';
import type { NpcId } from '@/core';
import { installNarrativeAuthority, isPresent } from '@/narrative/engine';
import { startEscort } from '@/narrative/engine/escort';

installNarrativeAuthority();
let fails = 0;
const ok = (c: boolean, m: string) => { console.log(`${c ? 'ok  ' : 'FAIL'} ${m}`); if (!c) fails++; };
Game.set(createNewGameState());
Game.state.player.hero = { classId: 'arcanist', look: { skin: 0, hair: 0, hc: 0, eyes: 0, brows: 0, ec: 0, mouth: 0, mark: 0, body: 0 }, outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } };
Game.set(Game.state);

const NPC = 'npc:orsolya-glaze' as NpcId;
// 1) headless (no combat/world service): arrives at once, so quests stay playable in bots and on a bare server
startEscort({ escort: NPC, to: 'landmark:thrane-study' });
ok(getFlag('escort.orsolya-glaze') === 'arrived', 'headless: escort arrives at once');

// 2) with stub services
const spawns: Record<string, unknown>[] = [], despawned: string[] = [];
Services.register('combat', { spawn: (r: Record<string, unknown>) => { spawns.push(r); return `e${spawns.length}`; }, despawn: (id: string) => despawned.push(id) } as never);
Services.register('worlds', { placePos: (id: string) => ({ space: 'realm:ash', x: id.length * 10, y: 5 }) } as never);
startEscort({ escort: NPC, to: 'landmark:thrane-study', revives: 2 });
const req = spawns[0] as { creature: string; follow: string; escort: { npc: string; toMarker: { r: number }; revives: number } };
ok(spawns.length === 1 && req.creature === 'bx_escort' && req.follow === 'party', 'spawns bx_escort following the party');
ok(req.escort.npc === NPC && req.escort.toMarker.r === 64 && req.escort.revives === 2, 'escort carries the npc, marker radius and revives');
ok(getFlag('escort.orsolya-glaze') === 'active' && !isPresent(NPC), 'active: the static NPC is hidden');
bus.emit('escort:arrived', { id: 'e1', npc: NPC, creature: 'bx_escort', marker: { space: 'realm:ash', x: 0, y: 0, r: 64 }, playerIds: ['local'] });
ok(getFlag('escort.orsolya-glaze') === 'arrived' && isPresent(NPC), 'arrived: flag set, the static NPC is back');
ok(despawned.includes('e1'), 'arrived: the escort body is despawned');

startEscort({ escort: NPC, to: 'landmark:thrane-study' });
bus.emit('escort:lost', { id: 'e2', npc: NPC, creature: 'bx_escort', reason: 'died' });
ok(getFlag('escort.orsolya-glaze') === 'lost' && isPresent(NPC), 'lost: flag set for a retry branch, the NPC is back');
startEscort({ escort: NPC, to: 'landmark:thrane-study' });
ok(getFlag('escort.orsolya-glaze') === 'active' && spawns.length === 3, 'a retry stage can start the escort again');
console.log(fails ? `${fails} FAILED` : 'ALL PASS');
