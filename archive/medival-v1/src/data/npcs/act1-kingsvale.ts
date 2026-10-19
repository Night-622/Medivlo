/** NPCs of the Kingsvale and Haldren, Act I Ch1 (docs/lore/10-act1-spec.md). Owner: Claude 4. Landmarks are placed by Claude 2. */
import type { NpcDef } from '@/core';

const at = (quest: `quest:${string}`, stage: string) => ({ questStage: quest, stage });
const Q2 = 'quest:a-queen-in-winter', Q3 = 'quest:the-quiet-hand';
const Q11 = 'quest:harrows-bargain', Q12 = 'quest:ashes-of-varn';
const R = 'region:kingsvale' as const, CROWN = 'faction:crown-of-haldmarch' as const;

const npcs: NpcDef[] = [
  {
    id: 'npc:queen-aldith', name: 'Aldith', title: 'Queen of Haldmarch', people: 'haldish', faction: CROWN, region: R, home: 'landmark:throne-room',
    dialogue: [
      { when: at(Q11, 'choice'), dialogue: 'dialogue:aldith-judgement' },
      { when: at(Q12, 'aftermath'), dialogue: 'dialogue:ch3-aftermath-aldith' },
      { when: at(Q2, 'audience'), dialogue: 'dialogue:aldith-audience' },
      { dialogue: 'dialogue:ch1-aldith-general' },
    ],
    roles: ['quest'], essential: true,
    look: { skin: 0xe8c4a8, hair: 0xb8743a, cloth: 0x6e6e74, accent: 0x8a8a8a, build: 'slight' },
    bio: 'Queen of Haldmarch, 15, crowned this winter after King Aldred’s death. Sharp, well-read and untested, she hides her fear behind the royal "we" and a great deal of formality.',
    lore: 'lore:queen-aldith',
  },
  {
    id: 'npc:osric-harrow', name: 'Osric Harrow', title: 'Lord Protector', people: 'haldish', faction: CROWN, region: R, home: 'landmark:throne-room',
    presentWhen: { all: [{ not: { flag: 'act1.ruler', op: '==', value: 'aldith' } }, { not: { flag: 'act3.harrow_fate', op: '==', value: 'slain' } }, { not: { flag: 'act3.harrow_fate', op: '==', value: 'fled' } }] },
    schedule: [{ from: 0, to: 24, at: 'landmark:haldren-river-gate', activity: 'idle', when: { questStage: 'quest:the-last-lanternmass', stage: 'betrayal' } }],
    dialogue: [
      { when: { questStage: 'quest:the-last-lanternmass', stage: 'betrayal' }, dialogue: 'dialogue:ch7-harrow-gate' },
      { when: at(Q11, 'confront'), dialogue: 'dialogue:harrow-confront' },
      { when: at(Q2, 'harrow'), dialogue: 'dialogue:harrow-first' },
      { dialogue: 'dialogue:ch1-harrow-general' },
    ],
    roles: ['quest'], essential: true,
    look: { skin: 0xd4a888, hair: 0x2a2420, cloth: 0x1e1c1e, accent: 0x7a1e1e, build: 'tall' },
    bio: 'Regent of Haldmarch, 50s, the hero of Ashby Ford. Courteous, patient and steel underneath. He believes Varn is lost and is secretly treating with the Drowned Choir to buy his people a winter.',
    lore: 'lore:osric-harrow',
  },
  {
    id: 'npc:bryce-aldmere', name: 'Ser Bryce Aldmere', title: 'Captain of the Gate', people: 'haldish', faction: CROWN, region: R, home: 'landmark:haldren-gate',
    dialogue: [
      { when: { questStage: 'quest:the-last-lanternmass', stage: 'walls' }, dialogue: 'dialogue:ch7-walls' },
      { when: { questStage: 'quest:the-last-lanternmass', stage: 'betrayal' }, dialogue: 'dialogue:ch7-river-alarm' },
      { when: { questStage: 'quest:the-last-lanternmass', stage: 'fire' }, dialogue: 'dialogue:ch7-fire-alarm' },
      { when: { any: [{ questActive: 'quest:the-last-lanternmass' }, { questCompleted: 'quest:the-last-lanternmass' }] }, dialogue: 'dialogue:ch7-bryce' },
      { when: at(Q2, 'gate'), dialogue: 'dialogue:bryce-gate' },
      { dialogue: 'dialogue:ch1-bryce-general' },
    ],
    barks: [{ lines: ['Next.', 'Gloves off. Not my rule.', 'Move along, mother, there’s soup at the camp. Thin, but hot.'] }],
    roles: ['quest'],
    look: { skin: 0xc8946e, hair: 0x6a4a2e, cloth: 0x2f4a7a, accent: 0xb8862e, build: 'broad' },
    bio: 'Captain of Haldren’s north gate, 40s, tired and honest. He loathes the Wick’s table on his gate and obeys the order that put it there, spitting all the while.',
  },
  {
    id: 'npc:prior-benedek', name: 'Benedek', title: 'Prior of Haldren', people: 'solenni', faction: 'faction:lanternate', region: R, home: 'landmark:haldren-cathedral',
    schedule: [{ from: 0, to: 24, at: 'landmark:throne-room', activity: 'idle', when: { all: [at(Q11, 'choice'), { flag: 'prologue.hale_outcome', op: '==', value: 'defied' }] } }],
    dialogue: [{ dialogue: 'dialogue:ch1-benedek-general' }],
    barks: [{ lines: ['One in seven. One candle in seven…', 'Lux manet. It does. It must.'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xb08664, hair: 0x9a9a9a, cloth: 0xe8e0c8, accent: 0xd4a646, build: 'short' },
    bio: 'Solenni Prior of Haldren, 60s, fussy, kind and frightened, a scholar of the Charter. Anselm Pryde forged his name on a Wick-licence. He lives in terror of a letter from Lord-Inquisitor Vellane that he has not dared to open.',
  },
  {
    id: 'npc:sable', name: 'Sable', title: 'of the Quiet Hand', people: 'haldish', region: R, home: 'landmark:quiet-hand-den',
    lore: 'lore:sable',
    presentWhen: { not: { any: [{ flag: 'companion.sable.fate', op: '==', value: 'gone' }, { questStage: 'quest:the-quiet-hollowing', stage: 'trail' }] } },
    schedule: [
      { from: 0, to: 24, at: 'landmark:tobins-reeds', activity: 'idle', when: { questStage: 'quest:the-quiet-hollowing', stage: 'water' } },
      { from: 0, to: 24, at: 'landmark:grove-of-antlers', activity: 'sleep', when: { all: [{ flag: 'companion.sable.fate', op: '==', value: 'bound' }, { questCompleted: 'quest:the-quiet-hollowing' }, { flag: 'act1.ylwen_pact' }] } },
      { from: 0, to: 24, at: 'landmark:briar-hut', activity: 'sleep', when: { all: [{ flag: 'companion.sable.fate', op: '==', value: 'bound' }, { questCompleted: 'quest:the-quiet-hollowing' }, { not: { flag: 'act1.ylwen_pact' } }] } },
      {
        from: 8, to: 20, at: 'landmark:haldren-market', activity: 'wander',
        when: { all: [{ flag: 'act1.gate_passed' }, { not: { flag: 'npc.sable.met' } }] },
      },
    ],
    dialogue: [
      { when: { questStage: 'quest:the-quiet-hollowing', stage: 'signs' }, dialogue: 'dialogue:qh-sable-signs' },
      { when: { questStage: 'quest:the-quiet-hollowing', stage: 'water' }, dialogue: 'dialogue:obj-quiet-water' },
      { when: { all: [{ flag: 'companion.sable.fate', op: '==', value: 'saved' }, { not: { flag: 'npc.sable.qh_after' } }] }, dialogue: 'dialogue:qh-sable-after' },
      { when: { all: [{ flag: 'companion.sable.following' }, { flag: 'companion.sable.loyalty', op: '>=', value: 70 }, { not: { flag: 'companion.sable.beat_70' } }] }, dialogue: 'dialogue:loyalty-sable' },
      { when: { all: [{ flag: 'companion.sable.following' }, { flag: 'companion.sable.loyalty', op: '<=', value: 20 }, { not: { flag: 'companion.sable.left' } }] }, dialogue: 'dialogue:loyalty-sable-low' },
      { when: { all: [{ flag: 'act1.gate_passed' }, { not: { flag: 'npc.sable.met' } }] }, dialogue: 'dialogue:ch1-sable-market' },
      { when: at(Q3, 'den'), dialogue: 'dialogue:sable-den' },
      { when: at(Q3, 'ledger'), dialogue: 'dialogue:ch1-sable-waiting' },
      { when: at(Q3, 'return'), dialogue: 'dialogue:sable-return' },
      { dialogue: 'dialogue:ch1-sable-general' },
    ],
    barks: [{
      when: { flag: 'companion.sable.following' },
      lines: ['Ooh. A lock.', 'Don’t mind me, it’s the cold. Makes my eyes run.', 'If anyone asks, I was never here. Generally.', 'Is it singing? No. Never mind. It’s nothing.'],
    }],
    roles: ['quest', 'companion'], essential: true,
    look: { skin: 0xe6c0a4, hair: 0xb8402a, cloth: 0x3a3430, accent: 0x14181c, build: 'slight' },
    bio: 'Quiet Hand thief, about 20, cheerful and irreverent. Since Lanternmass she has been going Hollow, and she wipes the black tears away before anyone sees.',
  },
  {
    id: 'npc:corin-vale', name: 'Corin Vale', title: 'Hedge-mage', people: 'haldish', region: R, home: 'landmark:haldren-market',
    presentWhen: { not: { flag: 'act1.market_mage' } },
    dialogue: [
      { when: at(Q2, 'market'), dialogue: 'dialogue:corin-arrest' },
      { dialogue: 'dialogue:ch1-corin-general' },
    ],
    roles: ['quest'],
    look: { skin: 0xe0b89a, hair: 0x4a3420, cloth: 0x6a5a3a, accent: 0xb5481f, build: 'slight' },
    bio: 'Unlicensed hedge-mage, 20s, who sells hearth-knots in Haldren market as his grandmother did. He has noticed that each month his charms hold less warmth.',
  },
  {
    id: 'npc:goody-marl', name: 'Goody Marl', title: 'of Fenwick', people: 'haldish', region: R, home: 'landmark:refugee-camp',
    dialogue: [{ dialogue: 'dialogue:ch1-goody-marl' }],
    barks: [{ lines: ['Mind the net, love.', 'Eels don’t freeze. People do.'] }],
    roles: ['ambient'],
    look: { skin: 0xc8a080, hair: 0xd0d0c8, cloth: 0x4a4a3a, accent: 0x3a5a5a, build: 'short' },
    bio: 'Eel-fisher’s widow from Fenwick, 60s, a refugee outside Haldren’s walls. Her son went "to sing" for the Choir and walked into the reeds. She knows every rumour out of Varn.',
  },
];

export default npcs;
