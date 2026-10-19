/** First Steps (onboarding) engine test: starts only with tut.on, never blocks, closes itself (Claude 4). */
import { Game, bus, createNewGameState, setFlag } from '@/core';
import type { QuestDef, QuestId } from '@/core';
import { installNarrativeAuthority, progress, questDef } from '@/narrative/engine';
import { objectiveText } from '@/narrative/engine/quests';
import { setLocalFormatter } from '@/narrative/engine/state';
import { formatKeys } from '@/narrative/client/keys';
import { TUTORIAL_STEPS } from '@/data/quests/hc-first-steps';

installNarrativeAuthority();
setLocalFormatter(formatKeys);
let fails = 0;
const ok = (c: boolean, m: string) => { console.log(`${c ? 'ok  ' : 'FAIL'} ${m}`); if (!c) fails++; };

function fresh(cls: string, tutOn: boolean): QuestId {
  Game.set(createNewGameState());
  Game.state.player.hero = { classId: cls, look: { skin: 0, hair: 0, hc: 0, eyes: 0, brows: 0, ec: 0, mouth: 0, mark: 0, body: 0 }, outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } };
  Game.set(Game.state);
  bus.emit('game:new', {} as never);
  if (tutOn) setFlag('tut.on', true);
  return `quest:${cls}-first-steps` as QuestId;
}
const live = (q: QuestId) => { const p = progress(q); return !!p && !p.completed && !p.failed; };

let q = fresh('warden', false);
ok(!progress(q), 'no tut.on (old save or hints off): First Steps never starts');

q = fresh('warden', true);
ok(live(q), 'tut.on: First Steps starts for the hero’s class');
ok(!progress('quest:arcanist-first-steps' as QuestId), 'other classes’ First Steps stay unstarted');
ok(live('quest:warden-the-horn-at-midnight' as QuestId) || Object.keys(Game.state.narrative.quests).some((id) => id.startsWith('quest:warden-') && !id.endsWith('first-steps')), 'the class’s first quest runs alongside');
for (const s of TUTORIAL_STEPS.slice(0, -1)) setFlag(`tut.${s}`, true);
ok(live(q), 'seven of eight steps: still open, and nothing else waits on it');
setFlag(`tut.${TUTORIAL_STEPS[TUTORIAL_STEPS.length - 1]}`, true);
ok(!!progress(q)?.completed, 'all eight steps: completed');

q = fresh('reaver', true);
setFlag('story.gate_open', true);
ok(!!progress(q)?.completed, 'leaving the realm (story.gate_open) closes it');

q = fresh('bard', true);
setFlag('tut.skip', true);
ok(!!progress(q)?.completed, 'hints switched off (tut.skip) closes it');

const def = questDef('quest:monk-first-steps' as QuestId) as QuestDef;
const text = def.stages[0].objectives.map((o) => objectiveText(def, o)).join(' | ');
ok(text.includes('(WASD)') && text.includes('(Space)') && text.includes('click or 1') && text.includes('(Q / E)') && text.includes('(I)') && text.includes('(J, then T)') && text.includes('(F)'), `key names from Settings: ${text.slice(0, 120)}…`);
ok(!/\{key:/.test(text), 'no raw {key:} tokens left');
console.log(fails ? `${fails} FAILED` : 'ALL PASS');
