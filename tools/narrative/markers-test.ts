/**
 * Quest markers test (Claude 4): questMarkers() on a fresh game for every class (the I-1 night quest and First Steps
 * run), the tracked quest first, and a coverage count over every objective in the data: which kinds of objective
 * have no place to point at. Usage: node $(node tools/narrative/build.mjs tools/narrative/markers-test.ts full)
 */
import { Game, Registry, bus, createNewGameState, setFlag } from '@/core';
import type { QuestDef } from '@/core';
import { installNarrativeAuthority } from '@/narrative/engine';
import { CAMPAIGNS } from '@/narrative/engine/classes';
import { bossLair, fallbackPlace, objectUsed, objectivePlaces, questMarkers } from '@/narrative/client/markers';

installNarrativeAuthority();
let bad = 0;
const ok = (c: boolean, m: string) => { console.log(`${c ? 'ok  ' : 'FAIL'} ${m}`); if (!c) bad++; };
const hero = (cls: string) => ({ classId: cls, look: { skin: 0, hair: 0, hc: 0, eyes: 0, brows: 0, ec: 0, mouth: 0, mark: 0, body: 0 }, outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } });

let withMarkers = 0;
for (const c of CAMPAIGNS) {
  Game.set(createNewGameState());
  Game.state.player.hero = hero(c.id) as never;
  Game.set(Game.state);
  bus.emit('game:new', {} as never);
  setFlag('tut.on', true); // First Steps runs beside I-1, as on a real new game with hints on
  const ms = questMarkers();
  const first = ms[0];
  if (ms.length) withMarkers++;
  const trackedFirst = !first || first.tracked || !Game.state.narrative.trackedQuest;
  if (!ms.length || !trackedFirst) ok(false, `${c.id}: ${ms.length} markers, first ${first?.quest ?? '-'} tracked=${first?.tracked}`);
  else if (process.env.VERBOSE) console.log(`     ${c.id}: ${ms.length} markers, first → ${first.place} (${first.kind}) “${first.label}”`);
}
ok(withMarkers === CAMPAIGNS.length, `every class's opening has a marker (${withMarkers}/${CAMPAIGNS.length}), tracked quest first`);

// coverage: objectives that can point somewhere vs ones with no place (kill/collect/flag with no marker)
const kinds: Record<string, [number, number]> = {};
for (const q of Registry.all('quest') as QuestDef[]) for (const s of q.stages) for (const o of s.objectives) {
  if (o.hidden) continue;
  const k = 'talk' in o ? 'talk' : 'reach' in o ? 'reach' : 'interact' in o ? 'interact' : 'kill' in o ? 'kill' : 'collect' in o ? 'collect' : 'when';
  const has = objectivePlaces(o).length > 0 || !!fallbackPlace(q, s.id);
  const e = (kinds[k] ??= [0, 0]); e[0]++; if (has) e[1]++;
}
for (const [k, [n, has]] of Object.entries(kinds)) console.log(`     ${k.padEnd(8)} ${has}/${n} have a place (own or fallback)`);
ok(kinds.talk[1] === kinds.talk[0] && kinds.reach[1] === kinds.reach[0] && kinds.interact[1] === kinds.interact[0], 'every talk, reach and interact objective points somewhere');
// lair bosses point at their own lair (Claude 7: the stage fallback sent 65 of 72 to a zone far away)
let lairs = 0; const missing: string[] = [];
for (const c of CAMPAIGNS) {
  const found = new Set<string>();
  for (const q of (Registry.all('quest') as QuestDef[]).filter((x) => x.campaign === c.id)) for (const s of q.stages) for (const o of s.objectives) {
    if ('kill' in o && typeof o.kill === 'string') { const l = bossLair(o.kill, c.id); if (l && objectivePlaces(o, c.id)[0] === l) found.add(l); }
  }
  lairs += found.size; if (found.size < 3) missing.push(`${c.id} ${found.size}/3`);
}
ok(lairs === CAMPAIGNS.length * 3, `every class's three lair-boss kills point at their lair (${lairs}/${CAMPAIGNS.length * 3})${missing.length ? ' missing: ' + missing.join(', ') : ''}`);
// objectUsed: a counted search object reads as used, the others don't (Claude 2's "Already searched" prompt)
Game.set(createNewGameState());
Game.state.player.hero = hero('rimecaller') as never;
Game.set(Game.state);
Game.state.narrative.quests['quest:rimecaller-the-hold-gauges' as never] = { stage: 'gauges', objectives: {} };
bus.emit('interact', { playerId: 'p1', objectId: 'obj:hold-gauge-1', props: {} } as never);
ok(objectUsed('obj:hold-gauge-1') && !objectUsed('obj:hold-gauge-2'), `objectUsed marks only the gauge already read (${objectUsed('obj:hold-gauge-1')}, ${objectUsed('obj:hold-gauge-2')})`);
console.log(bad ? `${bad} FAILED` : 'ALL PASS');
