/** Act III, Chapter 9: "The Heart of Orr" (docs/lore/14-act3-spec.md), the end of the campaign. Owner: Claude 4.
 *  Hard rule: every flag a stage waits on is set at the moment of decision, and every scene is reopenable:
 *  the way down from Brannoch / the Cindermother / obj:heartforge-seal; Nhal and the ending from obj:heartfire;
 *  the epilogue sequence from obj:heartfire once act3.complete is set. */
import type { DialogueId, NarrativeEffect, QuestDef } from '@/core';

const L = (id: `landmark:${string}`) => ({ landmark: id });
const f = (flag: string) => ({ flag });
const QH = 'quest:the-heart-of-orr';

/** The epilogue slides, in order (they queue). dialogue:epilogue-ashmarked sets act3.epilogue_seen on its first node. */
export const EPILOGUE_SEQUENCE: DialogueId[] = [
  'dialogue:epilogue-world',
  'dialogue:epilogue-haldmarch',
  'dialogue:epilogue-church',
  'dialogue:epilogue-wardens',
  'dialogue:epilogue-thornwise',
  'dialogue:epilogue-orrun',
  'dialogue:epilogue-north',
  'dialogue:epilogue-salt-and-ash',
  'dialogue:epilogue-ysolde',
  'dialogue:epilogue-maren',
  'dialogue:epilogue-anselm',
  'dialogue:epilogue-cadoc',
  'dialogue:epilogue-grimma',
  'dialogue:epilogue-sable',
  'dialogue:epilogue-vesper',
  'dialogue:epilogue-ashmarked',
];
export const OPEN_EPILOGUE: NarrativeEffect[] = EPILOGUE_SEQUENCE.map((d) => ({ openDialogue: d }));

const quests: QuestDef[] = [
  {
    id: QH, name: 'The Heart of Orr', type: 'main', act: 'act3', chapter: 'The Heart of Orr', region: 'region:heartforge',
    summary: 'Seven Embers burn in your hand, and the world above is cold enough to crack. Somewhere under the Ironspine, under the Vault and the roots of the mountains, the heart of a dead god is still beating, slower every day. Something is climbing toward it out of the black water. Go down.',
    requires: { questCompleted: 'quest:into-the-dreaming' },
    autoStart: true,
    firstStage: 'way',
    stages: [
      {
        id: 'way',
        journal: 'There are three ways down to the Heartforge, and each one costs something. The Orrun keep a gate at the bottom of the Vault of the Nine Nails, and High Thane Brannoch will open it for a friend of the Concord, or for one who carries Grimma Ironsong’s word. Beneath Qadir the Ashen Kings cut a stair of their own; the Cindermother will bless the way, if you have heard the truth from Ozrah’s own mouth. And if no one will open a door for you, the Ashmark can burn the seal on the Vault gate. It will not be forgiven.',
        objectives: [
          { id: 'seal', text: 'Burn the Heartforge seal with the Ashmark', interact: 'obj:heartforge-seal', optional: true, marker: L('landmark:heartforge-gate') },
          { id: 'way', text: 'Open a way down to the Heartforge', marker: L('landmark:heartforge-gate'), when: f('act3.heartforge_unsealed') },
        ],
        onComplete: [{ unlockLore: 'lore:the-heartforge' }],
        next: 'descent',
      },
      {
        id: 'descent',
        journal: 'Below the last stair the rock is warm to the touch, and it beats. The Wrought still keep their posts down here, for masters who rusted three thousand years ago, and the black water has come up through the cracks with things in it that have never had a shape. Go down to the Anvil of Ribs, where Orr struck the world.',
        objectives: [
          { id: 'anvil', text: 'Descend to the Anvil of Ribs', reach: 'landmark:the-anvil-of-ribs', marker: L('landmark:the-anvil-of-ribs') },
          { id: 'sentinels', text: 'Destroy the Wrought sentinels', kill: 'enemy:wrought-sentinel', count: 2, marker: L('landmark:the-anvil-of-ribs') },
          { id: 'things', text: 'Destroy the drowned things', kill: 'enemy:drowned-thing', count: 3, marker: L('landmark:the-anvil-of-ribs') },
        ],
        onComplete: [{ unlockLore: 'lore:the-anvil-of-ribs' }],
        next: 'nhal',
      },
      {
        id: 'nhal',
        journal: 'Below the Anvil of Ribs lies the Heart of Orr, vast and dim and slowing, and the black water has risen round it like a tide in a harbour. Out of the water rose the Drowned One, the Eighth Spark, weeping and hungry, and it asked you to become the heart with it. Whatever you answered, it is waiting for you at the heart.',
        onEnter: [{ openDialogue: 'dialogue:ch9-nhal' }],
        completeWhen: 'any',
        objectives: [
          { id: 'heart', text: 'Go down to the Heart of Orr', reach: 'landmark:heart-of-orr', optional: true, marker: L('landmark:heart-of-orr') },
          { id: 'offer', text: 'Hear what the Drowned One offers', optional: true, marker: L('landmark:heart-of-orr'), when: f('act3.nhal_offer') },
          { id: 'nhal', text: 'Destroy Nhal, risen', kill: 'enemy:nhal-risen', count: 1, marker: L('landmark:heart-of-orr') },
          { id: 'accepted', text: 'Go down into the water with Nhal', hidden: true, marker: L('landmark:heart-of-orr'), when: { flag: 'act3.nhal_offer', op: '==', value: 'accepted' } },
        ],
        onComplete: [{ unlockLore: 'lore:nhal-risen' }, { unlockLore: 'lore:nhal-the-drowned', section: 'risen' }],
        next: 'choice',
      },
      {
        id: 'choice',
        journal: 'You stand at the Heart of Orr with all Seven Embers in your hand. The heart beats, and you count to forty before it beats again. Rekindle it, and buy the world another age of fire. Sing the Mire to true sleep and reforge the heart, if you have the whole of the song, and leave a keeper below for ever. Give the Embers to the water and let the world dream. Or take the heart for yourself. There is no one left to choose for you.',
        onEnter: [{ unlockLore: 'lore:the-heartfire' }, { openDialogue: 'dialogue:obj-heartfire' }],
        objectives: [
          { id: 'heartfire', text: 'Lay your hand on the Heartfire', interact: 'obj:heartfire', optional: true, marker: L('landmark:heart-of-orr') },
          { id: 'choice', text: 'Choose what becomes of the world', marker: L('landmark:heart-of-orr'), when: f('act3.complete') },
        ],
        next: 'epilogue',
      },
      {
        id: 'epilogue',
        journal: 'It is done, and it cannot be undone. Up the long stair, across the snow or the spring or the soft unending water, the world is learning what you chose. If you would remember how it ended, lay your hand on the Heartfire again.',
        onEnter: OPEN_EPILOGUE,
        objectives: [
          { id: 'epilogue', text: 'See what became of the world', marker: L('landmark:heart-of-orr'), when: f('act3.epilogue_seen') },
        ],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, lore: ['lore:the-heartfire'] },
  },
];

export default quests;
