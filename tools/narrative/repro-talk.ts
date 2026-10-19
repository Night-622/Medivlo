/** Repro: does talkTo(NPC) open a dialogue for a fresh hero of CLASS? (Claude 4 debugging aid) */
import { readFileSync } from 'fs';
import { Game, bus, createNewGameState } from '@/core';
import { installNarrativeAuthority, dialogue, talkTo, isPresent, npcDef } from '@/narrative/engine';
import { newCharacter } from '@/systems/rules/character';
installNarrativeAuthority();
const cls = process.env.CLASS ?? 'warden', npc = process.env.NPC ?? 'npc:kettil-rask';
Game.set(createNewGameState());
Game.state.player.hero = { classId: cls, look: { skin: 0, hair: 0, hc: 0, eyes: 0, brows: 0, ec: 0, mouth: 0, mark: 0, body: 0 }, outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } };
Game.state.character = newCharacter(cls);
Game.set(Game.state);
bus.emit('game:new', {} as never);
bus.on('dialogue:started', (e) => console.log('started', e.dialogueId));
for (const [k, v] of Object.entries(JSON.parse(process.env.FLAGS ?? '{}'))) Game.state.flags[k] = v as never;
// STATE=<json file> with { hour, flags, quests } (Claude 2's playthrough dumps)
if (process.env.STATE) {
  const st = JSON.parse(readFileSync(process.env.STATE, 'utf8')) as { hour: number; flags: Record<string, never>; quests: Record<string, never> };
  Object.assign(Game.state.flags, st.flags);
  Game.state.narrative.quests = st.quests;
  Game.state.world.time = Math.floor(st.hour * 60);
}
const d = dialogue as unknown as { def?: { id: string }; queue: unknown[] };
if (process.env.CLOSE) { d.queue.length = 0; dialogue.close(); }
console.log('active before:', d.def?.id ?? null, 'present:', isPresent(npc as never), 'def dialogue:', JSON.stringify(npcDef(npc as never)?.dialogue));
console.log('talkTo →', talkTo(npc as never, 'local'), 'active after:', d.def?.id ?? null);
