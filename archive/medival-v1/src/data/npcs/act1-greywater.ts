/** NPCs of Greywater Marsh, Act I Chapter 3 (docs/lore/10-act1-spec.md). Owner: Claude 4. Landmarks are placed by Claude 2. */
import type { NpcDef } from '@/core';

const at = (quest: `quest:${string}`, stage: string) => ({ questStage: quest, stage });
const Q9 = 'quest:the-reed-mother', Q12 = 'quest:ashes-of-varn';
const R = 'region:greywater-marsh' as const;

const npcs: NpcDef[] = [
  {
    id: 'npc:agna-fenn', name: 'Agna Fenn', title: 'Headwoman of Fenwick', people: 'haldish', region: R, home: 'landmark:fenwick-stilts',
    shop: 'shop:fenwick-eel-market',
    schedule: [{ from: 5, to: 19, at: 'landmark:fenwick-stilts', activity: 'work' }],
    dialogue: [
      { when: { questStage: 'quest:the-hunters-oath', stage: 'fenwick' }, dialogue: 'dialogue:oath-agna' },
      { when: at(Q9, 'fenwick'), dialogue: 'dialogue:ch3-agna-fenwick' },
      { dialogue: 'dialogue:ch3-agna-general' },
    ],
    barks: [
      { when: { not: { questCompleted: Q9 } }, lines: ['Mind the ladder. Third rung’s rotten, like everything else.', 'Dark of the moon’s coming. Count the children.', 'Eels don’t care who rules. Lucky eels.'] },
      { when: { flag: 'act1.complete' }, lines: ['No candles in the windows tonight.', 'Varn’s bells have stopped. Strange, the quiet.'] },
    ],
    roles: ['quest'], essential: true,
    look: { skin: 0xc8946c, hair: 0x6a5a4a, cloth: 0x4a4a3a, accent: 0x7a6a3a, build: 'broad' },
    bio: 'Headwoman of the eel-fishers’ stilt-village of Fenwick, 50s, iron-willed. She has buried two husbands and a son, and pays the Drowned Choir its tithe so that she will not bury Fenwick.',
  },
  {
    id: 'npc:reed-mother', name: 'The Reed-Mother', title: 'High Priestess of the Drowned Choir', people: 'drowned', faction: 'faction:drowned-choir', region: R, home: 'landmark:reed-temple',
    presentWhen: { flag: 'never' },
    dialogue: [
      { when: { questCompleted: Q9 }, dialogue: 'dialogue:reed-mother-death' },
      { dialogue: 'dialogue:ch3-reed-mother-sermon' },
    ],
    look: { skin: 0xb8c8c0, hair: 0x2a3a30, cloth: 0x5a6a4a, accent: 0x1c2a33, build: 'tall' },
    bio: 'The Choir’s high priestess in Greywater, keeper of the reed temple on the Black Seep and Harrow’s correspondent. Serene, certain and kind in the way the tide is kind. Speaker entry only; the boss is Claude 3’s enemy:reed-mother.',
  },
  {
    id: 'npc:aldwin-varn', name: 'Aldwin Varn', title: 'the Drowned Lord', people: 'drowned', faction: 'faction:drowned-choir', region: R, home: 'landmark:varn-hall',
    // kneeling in the hall after his defeat, so his death scene can always be reopened
    presentWhen: at(Q12, 'aldwin'),
    dialogue: [
      { when: at(Q12, 'aldwin'), dialogue: 'dialogue:aldwin-death' },
      { dialogue: 'dialogue:ch3-aldwin-hall' },
    ],
    look: { skin: 0xa8b8c0, hair: 0x4a4a48, cloth: 0x2a3a4a, accent: 0x8a7a4a, build: 'tall' },
    bio: 'Lord of Varn. His wife Merewyn and daughter Elfreda died of the Grey Lung a season before Saint Ysolde ended it. The Choir promised him he would see them again, and on the Night of Falling Ash he opened the floodgates of his own town. Speaker entry only; the boss is Claude 3’s enemy:aldwin-varn.',
    lore: 'lore:aldwin-varn',
  },
];

export default npcs;
