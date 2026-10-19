/** Act I, Chapter 3: "The Drowning of Varn" (docs/lore/10-act1-spec.md, Q9–Q12). Owner: Claude 4. */
import type { QuestDef } from '@/core';

const L = (id: `landmark:${string}`) => ({ landmark: id });
const f = (flag: string) => ({ flag });
const Q9 = 'quest:the-reed-mother', Q10 = 'quest:the-boy-in-the-reeds', Q11 = 'quest:harrows-bargain', Q12 = 'quest:ashes-of-varn';
const G = 'region:greywater-marsh' as const;

const quests: QuestDef[] = [
  {
    id: Q9, name: 'The Reed-Mother', type: 'main', act: 'act1', chapter: 'The Drowning of Varn', region: G, giver: 'npc:hesta-corrow',
    summary: 'Hesta has sent word: the allies are gathering, but Varn cannot be taken while the Choir’s reed temples stand in the marsh around it. Go into Greywater and find out who is feeding the Drowned Choir.',
    requires: {
      all: [
        f('act1.audience_done'),
        {
          any: [
            { all: [f('act1.ylwen_pact'), f('act1.korrath_gate_open')] },
            { all: [f('act1.ylwen_pact'), f('act1.river_truth')] },
            { all: [f('act1.korrath_gate_open'), f('act1.river_truth')] },
          ],
        },
      ],
    },
    autoStart: true,
    firstStage: 'fenwick',
    stages: [
      {
        id: 'fenwick', journal: 'Hesta’s letter says the eel-fishers of Fenwick still live on their stilts at the edge of the reeds, and that they have made some bargain to go on living there.',
        onEnter: [{ openDialogue: 'dialogue:ch3-hesta-word' }, { unlockLore: 'lore:greywater-marsh' }],
        objectives: [
          { id: 'reach', text: 'Go to Fenwick in Greywater Marsh', reach: 'landmark:fenwick-stilts', marker: L('landmark:fenwick-stilts') },
          { id: 'agna', text: 'Speak with the headwoman of Fenwick', talk: 'npc:agna-fenn', marker: L('landmark:fenwick-stilts') },
        ],
        onComplete: [{ unlockLore: 'lore:fenwick' }],
        next: 'temple',
      },
      {
        id: 'temple', journal: 'Agna Fenn named the reed temple where the Choir takes its tithe. Something in there is worth more to the Reed-Mother than eels.',
        objectives: [
          { id: 'reach', text: 'Find the reed temple', reach: 'landmark:reed-temple', marker: L('landmark:reed-temple') },
          { id: 'oswin', text: 'Speak with the miller from Brindlecross', talk: 'npc:oswin', optional: true, hidden: true, marker: L('landmark:reed-temple') },
        ],
        onComplete: [{ unlockLore: 'lore:the-drowned-tongue' }, { unlockLore: 'lore:the-drowned-tongue', section: 'hymns' }],
        next: [{ when: f('npc.oswin.betrayed'), to: 'ambush' }, { to: 'letters' }],
      },
      {
        id: 'ambush', journal: 'Oswin rang the reed-bell. The temple knows you are here.',
        objectives: [
          { id: 'priests', text: 'Cut down the reed-priests', kill: 'enemy:reed-priest', count: 2, marker: L('landmark:reed-temple') },
          { id: 'acolytes', text: 'Cut down the acolytes', kill: 'enemy:choir-acolyte', count: 3, marker: L('landmark:reed-temple') },
        ],
        next: 'letters',
      },
      {
        id: 'letters', journal: 'The Reed-Mother keeps a sanctum at the heart of the temple. Whatever she is hiding, it is there.',
        objectives: [{ id: 'letters', text: 'Search the Reed-Mother’s sanctum', when: { flag: 'act1.harrow_letters' }, marker: L('landmark:reed-temple') }],
        next: 'mother',
      },
      {
        id: 'mother', journal: 'Letters sealed with the Lord Protector’s own signet. And behind you, very softly, someone has begun to sing.',
        onEnter: [{ openDialogue: 'dialogue:ch3-reed-mother-sermon' }],
        objectives: [{ id: 'mother', text: 'Defeat the Reed-Mother', kill: 'enemy:reed-mother', count: 1, marker: L('landmark:reed-temple') }],
        onComplete: [{ openDialogue: 'dialogue:reed-mother-death' }, { unlockLore: 'lore:the-black-seep' }, { unlockLore: 'lore:the-drowned-choir' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, rep: [{ faction: 'faction:drowned-choir', delta: -10 }], lore: ['lore:greywater-marsh', 'lore:the-black-seep'] },
  },
  {
    id: Q10, name: 'The Boy in the Reeds', type: 'companion', act: 'act1', chapter: 'The Drowning of Varn', region: G, giver: 'npc:maren-hollis',
    summary: 'A year ago Tobin Hollis ran singing into the dark beneath the Drowned Abbey, and his prints went east. Eel-fishers speak of a red-haired boy in the reeds who sings with his mother’s voice.',
    requires: {
      all: [
        { flag: 'prologue.tobin_fate', op: '==', value: 'hollowed' },
        { any: [{ questActive: Q9 }, { questCompleted: Q9 }] },
      ],
    },
    autoStart: true,
    firstStage: 'reeds',
    stages: [
      {
        id: 'reeds', journal: 'Maren has heard the fishers’ talk. She is already walking into the reeds, and she is not waiting for you.',
        onEnter: [{ companion: 'npc:maren-hollis', following: true }],
        objectives: [
          { id: 'reach', text: 'Follow Maren into the reeds', reach: 'landmark:tobins-reeds', marker: L('landmark:tobins-reeds') },
          { id: 'tobin', text: 'Find Tobin', marker: L('landmark:tobins-reeds'), when: { any: [f('act1.tobin_saved'), f('act1.tobin_lost')] } },
        ],
        next: [{ when: f('act1.tobin_saved'), to: 'saved' }, { to: 'lost' }],
      },
      {
        id: 'saved', journal: 'Tobin is himself again, shaking and weeping and alive. Maren has not let go of him.',
        objectives: [],
        end: { status: 'completed', outcome: 'saved' },
      },
      {
        id: 'lost', journal: 'The water took Tobin Hollis. Maren has sworn that the Choir will pay for every drop of it.',
        objectives: [],
        onComplete: [{ setFlag: 'npc.maren-hollis.vengeance', value: true }],
        end: { status: 'completed', outcome: 'lost' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    id: Q11, name: 'Harrow’s Bargain', type: 'main', act: 'act1', chapter: 'The Drowning of Varn', region: 'region:kingsvale', giver: 'npc:queen-aldith',
    summary: 'The Lord Protector of Haldmarch has been writing to the Drowned Choir. The Choir spares his lands; he leaves Varn to drown. Someone must decide what the Queen is told.',
    firstStage: 'confront',
    stages: [
      {
        id: 'confront', journal: 'You carry Osric Harrow’s letters to the Reed-Mother. Hear what he has to say for himself before anyone else does.',
        onEnter: [{ unlockLore: 'lore:osric-harrow' }],
        objectives: [{ id: 'harrow', text: 'Confront the Lord Protector', talk: 'npc:osric-harrow', marker: L('landmark:throne-room') }],
        next: 'choice',
      },
      {
        id: 'choice', journal: 'The Queen has called you to the throne room. Harrow will be there, and so will the Church. What you say next decides who rules the Haldmarch.',
        objectives: [{ id: 'judge', text: 'Stand before the Queen', marker: L('landmark:throne-room'), when: f('act1.ruler') }],
        next: [
          { when: { flag: 'act1.ruler', op: '==', value: 'aldith' }, to: 'aldith' },
          { when: { flag: 'act1.ruler', op: '==', value: 'harrow' }, to: 'harrow' },
          { to: 'wick' },
        ],
      },
      {
        id: 'aldith', journal: 'The Queen read the letters herself. Osric Harrow rode out of Haldren in the rain with nothing but his sword, and Aldith rules alone.',
        objectives: [], onComplete: [{ unlockLore: 'lore:queen-aldith' }, { unlockLore: 'lore:crown-of-haldmarch', section: 'queen-rules' }],
        end: { status: 'completed', outcome: 'aldith' },
      },
      {
        id: 'harrow', journal: 'You kept Harrow’s secret, and Harrow keeps the kingdom. His army will march on Varn. He will remember what you know.',
        objectives: [], onComplete: [{ unlockLore: 'lore:crown-of-haldmarch', section: 'protector-rules' }],
        end: { status: 'completed', outcome: 'harrow' },
      },
      {
        id: 'wick', journal: 'You gave the letters to the Church. By nightfall the wick-scissors hung over the gate of Haldren Keep, and the Haldmarch was under the Order’s law.',
        objectives: [], onComplete: [{ unlockLore: 'lore:crown-of-haldmarch', section: 'wick-rules' }, { unlockLore: 'lore:wick-licence' }],
        end: { status: 'completed', outcome: 'wick' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    id: Q12, name: 'Ashes of Varn', type: 'main', act: 'act1', chapter: 'The Drowning of Varn', region: G, giver: 'npc:hesta-corrow',
    summary: 'The Reed-Mother is dead, and the Haldmarch has a ruler again. Now the drowned town of Varn must be taken back, and the Ember its lord has kept in the black water for a year.',
    requires: { all: [f('act1.ruler'), { questCompleted: Q9 }] },
    autoStart: true,
    firstStage: 'muster',
    stages: [
      {
        id: 'muster', journal: 'Hesta is waiting at Cinderhold. Everyone who will fight for Varn is gathering under the brazier.',
        objectives: [{ id: 'hesta', text: 'Speak with Hesta at Cinderhold', talk: 'npc:hesta-corrow', marker: L('landmark:cinderhold-hall') }],
        onComplete: [{ companion: 'npc:hesta-corrow', following: true }],
        next: 'causeway',
      },
      {
        id: 'causeway', journal: 'The Varn Causeway runs straight into the flood. Aldwin Varn’s drowned knights hold the gates, and the floodgate wheel that drowned the town is still turned open.',
        onEnter: [{ unlockLore: 'lore:varn' }, { unlockLore: 'lore:varn', section: 'drowned' }],
        objectives: [
          { id: 'reach', text: 'Reach the gates of Varn', reach: 'landmark:varn-gates', marker: L('landmark:varn-gates') },
          { id: 'knights', text: 'Defeat the drowned knights', kill: 'enemy:drowned-knight', count: 2, marker: L('landmark:varn-gates') },
          { id: 'acolytes', text: 'Defeat the Choir acolytes', kill: 'enemy:choir-acolyte', count: 4, marker: L('landmark:varn-gates') },
          { id: 'wheel', text: 'Turn the floodgate wheel', marker: L('landmark:varn-gates'), when: f('act1.varn_assault') },
        ],
        next: 'approach',
      },
      {
        id: 'approach', journal: 'The water is going out of Varn. Through the dripping market, the bells of the drowned hall are still ringing.',
        objectives: [{ id: 'reach', text: 'Go to the hall of Varn', reach: 'landmark:varn-hall', marker: L('landmark:varn-hall') }],
        onComplete: [{ openDialogue: 'dialogue:ch3-aldwin-hall' }],
        next: 'hall',
      },
      {
        id: 'hall', journal: 'Aldwin Varn will not give up his hall, or his family, or the light in the water.',
        objectives: [{ id: 'aldwin', text: 'Defeat Aldwin Varn, the Drowned Lord', kill: 'enemy:aldwin-varn', count: 1, marker: L('landmark:varn-hall') }],
        onComplete: [{ openDialogue: 'dialogue:aldwin-death' }],
        next: 'aldwin',
      },
      {
        id: 'aldwin', journal: 'The Drowned Lord is on his knees in the water, and the ghosts of his wife and daughter are kneeling with him.',
        objectives: [{ id: 'fate', text: 'Decide the Drowned Lord’s end', marker: L('landmark:varn-hall'), when: f('act1.varn_fate') }],
        onComplete: [{ giveItem: 'item:drowned-lords-hook' }, { unlockLore: 'lore:aldwin-varn' }],
        next: 'ember',
      },
      {
        id: 'ember', journal: 'At the end of the hall, under the black water, the second Ember is burning.',
        objectives: [{ id: 'ember', text: 'Take the Ember of the Fen', marker: L('landmark:varn-hall'), when: f('act1.ember_fen_claimed') }],
        next: 'aftermath',
      },
      {
        id: 'aftermath', journal: 'Varn is taken. It cost what it cost. Haldren is waiting to hear of it, and so, it seems, is Solenne.',
        objectives: [
          { id: 'aldith', text: 'Bring word to the Queen', talk: 'npc:queen-aldith', marker: L('landmark:throne-room') },
          { id: 'hesta', text: 'Or speak with Hesta', talk: 'npc:hesta-corrow', marker: L('landmark:cinderhold-hall') },
        ],
        completeWhen: 'any',
        onComplete: [
          { setFlag: 'act1.complete', value: true },
          { setFlag: 'act1.vellane_summons', value: true },
          { companion: 'npc:hesta-corrow', following: false },
        ],
        end: { status: 'completed' },
      },
    ],
    reward: {
      xpTier: 3, skillPoints: 1,
      rep: [{ faction: 'faction:emberwardens', delta: 15 }, { faction: 'faction:crown-of-haldmarch', delta: 10 }, { faction: 'faction:drowned-choir', delta: -15 }],
      lore: ['lore:varn', 'lore:aldwin-varn'],
    },
  },
];

export default quests;
