/** Act III, Chapter 8: "The Hollow Sea" (docs/lore/14-act3-spec.md). Owner: Claude 4.
 *  Dream scenes: src/data/dialogue/act3-ch8.ts. Ysolde: src/data/dialogue/act3-ch8b.ts.
 *  Every flag a stage waits on is set at the moment of decision; the confrontation and the fallen scene both
 *  reopen from npc:ysolde’s routes while their stages are active. */
import type { NarrativeCondition, QuestDef } from '@/core';

const Q = 'quest:into-the-dreaming' as const;
const L = (id: `landmark:${string}`) => ({ landmark: id });
const f = (flag: string): NarrativeCondition => ({ flag });
const fate = (value: 'turned' | 'slain' | 'spared'): NarrativeCondition => ({ flag: 'act3.ysolde_fate', op: '==', value });

const quests: QuestDef[] = [
  {
    id: Q, name: 'Into the Dreaming', type: 'main', act: 'act3', chapter: 'The Hollow Sea', region: 'region:mirelands',
    summary: 'Haldren has seen its Lanternmass dawn. Beyond the Black Seep the Mire has stopped pretending to be marsh: the Mirelands lie open, where the rain falls upward and every grief that was ever drowned floats on the water as a thing you can touch. Somewhere in the middle of it, in a cathedral made of memory, the Pale Saint is keeping vigil over the seventh Ember.',
    requires: { questCompleted: 'quest:the-last-lanternmass' },
    autoStart: true,
    firstStage: 'shore',
    stages: [
      {
        id: 'shore', journal: 'The way into the Mirelands lies through the Black Seep, where Greywater fell in. Go down to where the marsh stops being marsh, and find the shore of the Hollow Sea.',
        objectives: [{ id: 'shore', text: 'Go down to the shore of the Mirelands', reach: 'landmark:mireland-shore', marker: L('landmark:mireland-shore') }],
        onComplete: [{ unlockLore: 'lore:the-mirelands' }],
        next: 'dreams',
      },
      {
        id: 'dreams', journal: 'The rain falls upward here, and the water is full of memories that have set hard, like wax: a cottage, a lamp, a pair of boots on a bank. They are not yours, most of them. They belong to the people walking beside you, and the Mire has found the worst of each. The only way across is through them.',
        onEnter: [{ openDialogue: 'dialogue:ch8-shore' }],
        objectives: [{ id: 'dreams', text: 'Walk through the drowned memories ({n}/{count})', interact: 'obj:dream-memory-*', count: 3, marker: L('landmark:mireland-shore') }],
        next: 'road',
      },
      {
        id: 'road', journal: 'Past the memories the water firms into a road that nobody laid: the Unmade Road, made of every road that was never taken. Things are walking on it that have never decided what shape to be.',
        objectives: [
          { id: 'road', text: 'Follow the Unmade Road', reach: 'landmark:the-unmade-road', marker: L('landmark:the-unmade-road') },
          { id: 'things', text: 'Destroy the drowned things', kill: 'enemy:drowned-thing', count: 4, marker: L('landmark:the-unmade-road') },
        ],
        next: 'ysolde',
      },
      {
        id: 'ysolde', journal: 'At the end of the road stands a cathedral built out of somebody’s memory of the Cathedral of the Brand, every window of it made of rain. She is inside. At the parley she asked you to show her, here, where the Mire is thin and has to show its face. Show her.',
        objectives: [
          { id: 'reach', text: 'Enter the Drowned Cathedral', reach: 'landmark:drowned-cathedral', marker: L('landmark:drowned-cathedral') },
          { id: 'talk', text: 'Speak with the Pale Saint', talk: 'npc:ysolde', marker: L('landmark:drowned-cathedral') },
          { id: 'face', text: 'Face Ysolde Maerin', marker: L('landmark:drowned-cathedral'), when: { any: [fate('turned'), f('act3.ysolde_fight')] } },
        ],
        next: [{ when: fate('turned'), to: 'ember' }, { to: 'boss' }],
      },
      {
        id: 'boss', journal: 'She would not come back, or could not. The water of the whole cathedral has risen up behind her like a wave that has decided not to fall. End it.',
        objectives: [{ id: 'saint', text: 'Defeat the Pale Saint', kill: 'enemy:ysolde-pale-saint', count: 1, marker: L('landmark:drowned-cathedral') }],
        next: 'fallen',
      },
      {
        id: 'fallen', journal: 'The Pale Saint lies in the shallows of her own nave, and the seventh Ember burns under her breastbone through skin gone thin as paper. She is still breathing.',
        onEnter: [{ openDialogue: 'dialogue:ch8-ysolde-fallen' }],
        objectives: [{ id: 'fallen', text: 'Decide what becomes of Ysolde', marker: L('landmark:drowned-cathedral'), when: { any: [fate('slain'), fate('spared')] } }],
        next: 'ember',
      },
      {
        id: 'ember', journal: 'The seventh Ember: the white heart of the Brand itself, which she caught as it broke and kept under her ribs for a year. Take it. All seven, in one hand.',
        objectives: [{ id: 'ember', text: 'Take the seventh Ember', marker: L('landmark:drowned-cathedral'), when: f('act3.embers_complete') }],
        end: { status: 'completed' },
      },
    ],
    reward: {
      xpTier: 3, skillPoints: 1,
      rep: [{ faction: 'faction:drowned-choir', delta: -20 }],
      lore: ['lore:the-seventh-ember', 'lore:ysolde-maerin'],
    },
  },
];

export default quests;
