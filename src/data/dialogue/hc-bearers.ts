/**
 * Hollow Crown: the bearers at the Stone Court (04-concordia.md "The bearers", 08 R10/R11). One generated dialogue
 * per class: the sibling meeting (II-5) when you carry the other half of their stone, and a greeting otherwise.
 * Featured-bearer threads live in each class campaign's data. Owner: Claude 4.
 */
import type { DialogueDef } from '@/core';
import { CAMPAIGNS, SCHOOL_NAME } from '@/narrative/engine/classes';

const cap = (s: string): string => s[0].toUpperCase() + s.slice(1);

const dialogues: DialogueDef[] = CAMPAIGNS.map((c): DialogueDef => {
  const school = SCHOOL_NAME[c.school];
  return {
    id: `dialogue:cc-bearer-${c.id}`, name: `Bearer: ${c.name} (${c.bearer})`, scope: 'party',
    entries: [
      { when: { all: [{ heroClass: c.sibling }, { questStage: 'quest:cc-stone-court', stage: 'sibling' }] }, node: 'sibling' },
      { when: { all: [{ heroClass: c.sibling }, { flag: 'story.sibling_met' }] }, node: 'together' },
      { node: 'hello' },
    ],
    nodes: {
      sibling: {
        speaker: `npc:bearer-${c.id}`,
        text: `There you are. ${cap(c.halfStone)} has been pulling at me since ${c.start}, like a dog on a lead. It was pulling towards you. I’m ${c.bearer}. You must be the {class}.`,
        choices: [
          { text: 'Two halves of one stone.', to: 'sing' },
          { text: 'What happened to you, out of {start}?', to: 'story' },
        ],
      },
      story: {
        speaker: `npc:bearer-${c.id}`,
        text: `${c.nemesis} happened. I got my half out from under them and ran for the gate. I think they came through behind me. Have you seen them?`,
        next: 'sing',
      },
      sing: {
        speaker: `npc:bearer-${c.id}`, text: 'Come here, then. Let’s hear them together.',
        choices: [{ text: 'Together, then.', to: null, quest: true, effects: [{ setFlag: 'story.sibling_met', value: true }] }],
      },
      together: { speaker: `npc:bearer-${c.id}`, text: `Still singing. Don’t lose your half, {class}. I’d hate to have to come and find it.`, next: null },
      hello: {
        speaker: `npc:bearer-${c.id}`,
        text: `${c.bearer}, ${c.name}, out of ${c.start}. ${cap(c.halfStone)} of the ${school} stone, if you can hear it. Everyone here can.`,
        choices: [
          { text: `What’s ${c.realm} like?`, to: 'realm' },
          { text: 'Good luck.', to: null, tag: 'leave' },
        ],
      },
      realm: { speaker: `npc:bearer-${c.id}`, text: `Far away, and in trouble. Like everywhere. Ask me again when we’re both alive at the other end of this.`, next: null },
    },
  };
});

export default dialogues;

// II-5's last beat (opened by the stage's onComplete): the two halves sing. One node per campaign so the right
// bearer is counted, whether the sibling is the NPC bearer or a co-op partner playing that class.
dialogues.push({
  id: 'dialogue:cc-court-sing', name: 'II-5 the halves sing', scope: 'party',
  entries: CAMPAIGNS.map((c) => ({ when: { heroClass: c.id }, node: c.id })),
  nodes: Object.fromEntries(CAMPAIGNS.map((c) => [c.id, {
    speaker: 'narrator' as const,
    text: `You stand together with the {sibling}, and the two halves of the ${SCHOOL_NAME[c.school]} stone sing together for the first time in thirty years. Everyone in the Stone Court stops to listen.`,
    effects: [{ setFlag: `story.bearer.${c.sibling}`, value: true }, { setFlag: 'story.sibling_met', value: true }],
    next: null,
  }])),
});
