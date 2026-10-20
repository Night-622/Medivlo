/**
 * A Smith’s Eye (Claude 4): a capital smith offers the quest until the first upgrade, one at a time; Claude 3's
 * item:crafted { recipe: 'recipe:upgrade' } completes it. Usage: node $(node tools/narrative/build.mjs tools/narrative/smiths-eye-test.ts full)
 */
import { Game, bus, createNewGameState, getFlag } from '@/core';
import type { DialogueId, NpcId, QuestId } from '@/core';
import { installNarrativeAuthority } from '@/narrative/engine';
import { dialogue } from '@/narrative/engine/dialogue';
import { isActive, progress } from '@/narrative/engine/quests';

installNarrativeAuthority();
let bad = 0;
const ok = (c: boolean, m: string) => { console.log(`${c ? 'ok  ' : 'FAIL'} ${m}`); if (!c) bad++; };
const s = createNewGameState();
s.player.hero = { classId: 'arcanist', look: { skin: 0, hair: 0, hc: 0, eyes: 0, brows: 0, ec: 0, mouth: 0, mark: 0, body: 0 }, outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } } as never;
Game.set(s); bus.emit('game:loaded', {} as never); dialogue.drop();

const offer = (school: string): boolean => {
  dialogue.open(`dialogue:merchant-${school}-smith` as DialogueId, `npc:${school}-smith` as NpcId);
  const has = !!dialogue.view()?.choices.some((c) => c.enabled && c.text === 'Make something of mine stronger.');
  return has;
};
const take = () => { const c = dialogue.view()!.choices.find((x) => x.text === 'Make something of mine stronger.')!; dialogue.choose(c.index); dialogue.drop(); };

ok(offer('ash'), 'the Kilnhold smith offers A Smith’s Eye before any upgrade');
take();
ok(isActive('quest:ash-smiths-eye' as QuestId), 'taking it starts quest:ash-smiths-eye');
ok(!offer('rime'), 'another capital’s smith does not offer a second one while it runs');
dialogue.drop();
bus.emit('item:crafted', { recipe: 'recipe:other', uid: 'x' } as never);
ok(isActive('quest:ash-smiths-eye' as QuestId), 'another recipe does not complete it');
bus.emit('item:crafted', { recipe: 'recipe:upgrade', uid: 'x' } as never);
ok(getFlag('builds.upgraded') === true, 'an upgrade sets builds.upgraded');
ok(progress('quest:ash-smiths-eye' as QuestId)?.completed === true, 'and completes the quest');
ok(!offer('rime'), 'after the first upgrade no smith offers it again');
dialogue.drop();
console.log(bad ? `${bad} FAILED` : 'ALL PASS');
process.exit(bad ? 1 : 0);
