/**
 * Reload soft-locks (Claude 4, from Claude 6's trace): a save made mid-escort or mid-scene must not strand a stage.
 * Usage: node $(node tools/narrative/build.mjs tools/narrative/reload-test.ts full)
 */
import { Game, bus, createNewGameState, getFlag, setFlag } from '@/core';
import type { QuestId } from '@/core';
import { installNarrativeAuthority } from '@/narrative/engine';
import { dialogue } from '@/narrative/engine/dialogue';

installNarrativeAuthority();
let bad = 0;
const ok = (c: boolean, m: string) => { console.log(`${c ? 'ok  ' : 'FAIL'} ${m}`); if (!c) bad++; };
const hero = (cls: string) => ({ classId: cls, look: { skin: 0, hair: 0, hc: 0, eyes: 0, brows: 0, ec: 0, mouth: 0, mark: 0, body: 0 }, outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } });
const fresh = (cls: string) => { const s = createNewGameState(); s.player.hero = hero(cls) as never; return s; };
const load = (s: ReturnType<typeof createNewGameState>) => { dialogue.drop(); Game.set(s); bus.emit('game:loaded', {} as never); };

// 1. mid-escort: the flag was saved 'active', the body was not
const a = fresh('jester');
a.flags['escort.winnifred-sprat'] = 'active';
a.flags['escort.ada'] = 'arrived';
load(a);
ok(getFlag('escort.winnifred-sprat') === 'lost', `an 'active' escort comes back 'lost' (${getFlag('escort.winnifred-sprat')}), so the regroup stage restarts it`);
ok(getFlag('escort.ada') === 'arrived', 'a finished escort is left alone');

// 2. mid-epilogue: heart-after's scenes were open when the tab closed
const b = fresh('arcanist');
b.narrative.quests['quest:heart-after' as QuestId] = { stage: 'after', objectives: {} };
b.flags['story.ending'] = 'turning';
b.flags['story.act'] = 3;
load(b);
ok(dialogue.active, 'reloading inside the epilogue stage reopens the epilogue');
let guard = 0;
while (dialogue.active && guard++ < 200) {
  const v = dialogue.view();
  const c = v?.choices.find((x) => x.enabled);
  if (c) dialogue.choose(c.index); else dialogue.advance();
}
ok(getFlag('story.epilogue_seen') === true, 'playing it through sets story.epilogue_seen');

// 3. a stage that waits on a place does not replay its opening scene on every load
const d = fresh('warden');
d.narrative.quests['quest:heart-wall' as QuestId] = { stage: 'through', objectives: {} };
d.flags['story.act'] = 3;
load(d);
const open = (dialogue.view() as unknown as { dialogueId?: string } | null)?.dialogueId ?? (dialogue.active ? '?' : '');
ok(!open.startsWith('dialogue:heart'), `a reach stage keeps its own scene closed on load (open: ${open || 'none'})`);
setFlag('noop', 1);
console.log(bad ? `${bad} FAILED` : 'ALL PASS');
