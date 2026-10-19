/** Repeatable bounties (docs/PACING.md): a rest re-posts every finished bounty, and nothing else (Claude 4). */
import { Game, bus, createNewGameState } from '@/core';
import type { QuestId } from '@/core';
import { checkCondition, completeQuest, installNarrativeAuthority, progress, startQuest } from '@/narrative/engine';

installNarrativeAuthority();
let fails = 0;
const ok = (c: boolean, m: string) => { console.log(`${c ? 'ok  ' : 'FAIL'} ${m}`); if (!c) fails++; };
Game.set(createNewGameState());
Game.state.player.hero = { classId: 'reaver', look: { skin: 0, hair: 0, hc: 0, eyes: 0, brows: 0, ec: 0, mouth: 0, mark: 0, body: 0 }, outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } };
Game.set(Game.state);
bus.emit('game:new', {} as never);

const B = 'quest:reaver-bounty-prowlers' as QuestId, SIDE = 'quest:reaver-hounds-at-the-well' as QuestId;
const fresh = (q: QuestId) => checkCondition({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
startQuest(B); completeQuest(B);
startQuest(SIDE); completeQuest(SIDE);
ok(!!progress(B)?.completed && !fresh(B), 'bounty done: its board no longer offers it');
bus.emit('world:rest', { pointId: 'rest:test' });
ok(!progress(B) && fresh(B), 'after a rest: the bounty is posted again (offer condition passes)');
ok((Game.state.narrative.ext.bountyRuns as Record<string, number>)[B] === 1, 'bountyRuns counts the completion');
ok(!!progress(SIDE)?.completed, 'side quests are untouched by a rest');
startQuest(B);
ok(!!progress(B) && !progress(B)!.completed, 'the bounty can be taken again');
bus.emit('world:rest', { pointId: 'rest:test' });
ok(!!progress(B) && !progress(B)!.completed, 'an ACTIVE bounty survives a rest');
console.log(fails ? `${fails} FAILED` : 'ALL PASS');
