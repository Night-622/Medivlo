/** Act II, Chapter 6: "Nhal" (docs/lore/11-act2-spec.md), the turn of the act and its finale. Owner: Claude 4. */
import type { QuestDef } from '@/core';

const L = (id: `landmark:${string}`) => ({ landmark: id });
const f = (flag: string) => ({ flag });
const done = (q: `quest:${string}`) => ({ questCompleted: q });
const QV = 'quest:the-drowned-voice', QP = 'quest:the-pale-parley', QB = 'quest:the-breach';
const NAIL = 'quest:the-ninth-nail', WOLF = 'quest:the-wolf-moot', TIDE = 'quest:the-ember-auction', GLASS = 'quest:the-glass-throne';

const quests: QuestDef[] = [
  {
    id: QV, name: 'The Drowned Voice', type: 'main', act: 'act2', chapter: 'Nhal', region: 'region:kingsvale',
    summary: 'Every Ember you carry has brought the Pale Saint closer in your sleep. Tonight it is not her voice in the fire. Something under the water has learned your name, and it speaks in more than one voice at once.',
    // at least three of the four Ember hunts completed
    requires: {
      any: [
        { all: [done(NAIL), done(WOLF), done(TIDE)] },
        { all: [done(NAIL), done(WOLF), done(GLASS)] },
        { all: [done(NAIL), done(TIDE), done(GLASS)] },
        { all: [done(WOLF), done(TIDE), done(GLASS)] },
      ],
    },
    autoStart: true,
    firstStage: 'dream',
    stages: [
      {
        id: 'dream', journal: 'You slept with the Embers burning in your hand, and dreamed of black water. The voice that came up out of it was not Ysolde’s. If you can bear to hear it again, the dream-brazier at Cinderhold will bring it back.',
        onEnter: [{ openDialogue: 'dialogue:nhal-first' }],
        objectives: [{ id: 'dream', text: 'Hear the voice beneath the water', marker: L('landmark:cinderhold-hall'), when: f('act2.nhal_heard') }],
        onComplete: [{ unlockLore: 'lore:nhal-the-drowned' }],
        next: 'counsel',
      },
      {
        id: 'counsel', journal: 'It called itself “we”, and it wept for you, and it was hungry. Someone must know what lives under the Mire. If the Thornwise still keep faith with you, the Archdruid Rhiannon will know what sings beneath the water. If not, the Grey Monks of Morrow keep every dream that was ever written down.',
        objectives: [{ id: 'counsel', text: 'Seek counsel on the voice beneath the water', when: f('act2.nhal_revealed') }],
        onComplete: [{ unlockLore: 'lore:the-third-way' }, { unlockLore: 'lore:the-forging', section: 'truth' }, { unlockLore: 'lore:the-mire', section: 'nhal' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:nhal-the-drowned', 'lore:the-third-way'] },
  },
  {
    id: QP, name: 'The Pale Parley', type: 'main', act: 'act2', chapter: 'Nhal', region: 'region:kingsvale',
    summary: 'Ysolde believes the Dreaming will be gentle. The thing that told her so wants to be the world’s new heart. The dream-brazier at Cinderhold can carry you down to her under truce, if you are willing to go where she lives, and to tell her the truth.',
    requires: f('act2.nhal_revealed'),
    autoStart: true,
    firstStage: 'brazier',
    stages: [
      {
        id: 'brazier', journal: 'Put your marked hand into the dream-brazier at Cinderhold and call her. Bring whatever proof you have: Ozrah’s testimony, her own words, the frozen river of the dead. She will only believe what she cannot explain away.',
        objectives: [
          { id: 'brazier', text: 'Call Ysolde through the dream-brazier', interact: 'obj:dream-brazier', optional: true, marker: L('landmark:cinderhold-hall') },
          { id: 'parley', text: 'Parley with the Pale Saint', marker: L('landmark:cinderhold-hall'), when: f('act2.parley_done') },
        ],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3 },
  },
  {
    id: QB, name: 'The Breach', type: 'main', act: 'act2', chapter: 'Nhal', region: 'region:greywater-marsh',
    summary: 'You came up from the dream with the taste of black water in your mouth, and before the day was out the news came after you. Greywater is falling in.',
    requires: f('act2.parley_done'),
    autoStart: true,
    firstStage: 'word',
    stages: [
      {
        id: 'word', journal: 'Word has come from the marsh. Hear it.',
        onEnter: [{ openDialogue: 'dialogue:ch6-breach-word' }],
        objectives: [{ id: 'word', text: 'Hear the news from Greywater', marker: L('landmark:cinderhold-hall'), when: f('act2.breach_word') }],
        next: 'seep',
      },
      {
        id: 'seep', journal: 'The Black Seep has opened like an eye, and the marsh is pouring into it. Things are climbing out of the water that have never had a shape before. Get to the heart of it.',
        objectives: [
          { id: 'reach', text: 'Go to the Black Seep', reach: 'landmark:black-seep', marker: L('landmark:black-seep') },
          { id: 'beasts', text: 'Destroy the mirebeasts', kill: 'enemy:mirebeast', count: 2, marker: L('landmark:black-seep') },
          { id: 'mirelings', text: 'Destroy the mirelings', kill: 'enemy:mireling', count: 6, marker: L('landmark:black-seep') },
        ],
        next: 'heart',
      },
      {
        id: 'heart', journal: 'At the bottom of the seep, where the water should be deepest, there is a light, and it is beating.',
        objectives: [
          { id: 'heart', text: 'Kindle the heart of the Black Seep', interact: 'obj:black-seep-heart', optional: true, marker: L('landmark:black-seep') },
          { id: 'breach', text: 'Face the heart of the Black Seep', marker: L('landmark:black-seep'), when: f('act2.complete') },
        ],
        onComplete: [{ unlockLore: 'lore:the-breach' }],
        end: { status: 'completed' },
      },
    ],
    reward: {
      xpTier: 3, skillPoints: 1,
      rep: [{ faction: 'faction:drowned-choir', delta: -15 }],
      lore: ['lore:the-breach'],
    },
  },
];

export default quests;
