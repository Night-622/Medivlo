/** Act II, Chapter 5 (south) NPCs: the Saltreach Isles auction and the Sunscar/Cinder Wastes (docs/lore/11-act2-spec.md). Owner: Claude 4.
 *  Landmarks are placed by Claude 2. Vesper and Samir are at Gull Rock while the player is in the isles for the auction, and otherwise
 *  at the Ashen Creed’s camp / Zahrun. */
import type { NarrativeCondition, NpcDef } from '@/core';

const QA = 'quest:the-ember-auction', QG = 'quest:the-glass-throne';
const at = (quest: `quest:${string}`, stage: string) => ({ questStage: quest, stage });
const f = (flag: string) => ({ flag });
const following = (id: string) => ({ flag: `companion.${id}.following` });
/** the player is in the isles for the auction (from arrival until the Ember of the Tide is claimed) */
const inIsles: NarrativeCondition = { any: ['isles', 'bidders', 'auction', 'heist', 'duel', 'ember'].map((s) => at(QA, s)) };
/** the bidding is still open: the bidders’ scenes run until the auction is decided */
const bidding: NarrativeCondition = { all: [{ any: [at(QA, 'isles'), at(QA, 'bidders'), at(QA, 'auction')] }, { not: f('act2.auction_outcome') }] };

const npcs: NpcDef[] = [
  // ----- Saltreach Isles
  {
    id: 'npc:marisol-kestrel', name: 'Marisol Kestrel', title: 'Admiral of the Salt League', people: 'haldish', faction: 'faction:salt-league',
    shop: 'shop:kestrel-isles',
    region: 'region:saltreach-isles', home: 'landmark:gull-rock-hall',
    schedule: [
      { from: 7, to: 23, at: 'landmark:gull-rock-hall', activity: 'work' },
      { from: 23, to: 7, at: 'landmark:gull-rock-hall', activity: 'sleep' },
    ],
    dialogue: [
      { when: at(QA, 'auction'), dialogue: 'dialogue:ch5-auction' },
      { when: { any: [at(QA, 'isles'), at(QA, 'bidders')] }, dialogue: 'dialogue:ch5s-kestrel-welcome' },
      { dialogue: 'dialogue:ch5s-kestrel-general' },
    ],
    barks: [
      { when: { not: { questCompleted: QA } }, lines: ['Sundown, sweetheart. Not before.', 'Nobody touches the cage. Nobody. Hask, that means you.', 'The Hierophant called me a pirate. I had it embroidered.'] },
      { when: { questCompleted: QA }, lines: ['I miss the hum. Don’t tell anyone.', 'Bigger ships. That’s the answer to most things.'] },
    ],
    roles: ['quest'], essential: true,
    look: { skin: 0xc89870, hair: 0x9a9a92, cloth: 0x1f3a4a, accent: 0xd4a646, build: 'average' },
    bio: 'Admiral of the Salt League, elected by a show of hands from the corsair-merchants of the Saltreach. Fifty-odd, grey-braided and gold-toothed, a thief before she was an admiral and proud of it. Ruthless, very funny, and almost never wrong about what a thing will sell for. Her crew fished an Ember out of the sea in a net of wet chain, and she means to auction it on Gull Rock.',
    lore: 'lore:marisol-kestrel',
  },
  {
    id: 'npc:vesper-qadri', name: 'Vesper Qadri', title: 'the Red Abbess', people: 'qasiri', faction: 'faction:ashen-creed',
    region: 'region:saltreach-isles', home: 'landmark:gull-rock-hall',
    presentWhen: { not: f('act2.vesper_betrayed') },
    schedule: [
      { from: 0, to: 24, at: 'landmark:gull-rock-hall', activity: 'pray', when: { all: [inIsles, { not: following('vesper-qadri') }] } },
      { from: 0, to: 24, at: 'landmark:ashen-creed-camp', activity: 'idle', when: { all: [{ not: inIsles }, { not: following('vesper-qadri') }] } },
    ],
    dialogue: [
      { when: { all: [{ flag: 'companion.vesper-qadri.following' }, { flag: 'companion.vesper-qadri.loyalty', op: '>=', value: 70 }, { not: { flag: 'companion.vesper-qadri.beat_70' } }] }, dialogue: 'dialogue:loyalty-vesper-qadri' },
      { when: { all: [{ flag: 'companion.vesper-qadri.following' }, { flag: 'companion.vesper-qadri.loyalty', op: '<=', value: 20 }, { not: { flag: 'companion.vesper-qadri.left' } }] }, dialogue: 'dialogue:loyalty-vesper-qadri-low' },
      { when: bidding, dialogue: 'dialogue:ch5s-vesper-bid' },
      { dialogue: 'dialogue:ch5s-vesper-general' },
    ],
    barks: [
      { when: following('vesper-qadri'), lines: ['Ashvar keep us. Somebody has to.', 'I used to trim wicks at this hour. Now I light them.', 'Don’t look at me like that. The tent was already on fire.', 'Seven Lights. Seven. I still count them every night.'] },
      { when: f('act2.vesper_left'), lines: ['(She feeds the fire and does not look up.)'] },
      { when: bidding, lines: ['Benedetta is watching me again. Let her.', 'Church plate. Four chapels. Every candlestick of it stolen honestly.'] },
    ],
    roles: ['quest', 'companion'], essential: true,
    look: { skin: 0x8a5a3a, hair: 0x1a1210, cloth: 0x8a2a1a, accent: 0xe0a030, build: 'slight' },
    bio: 'Leader of the Ashen Creed, called the Red Abbess by the Church that raised her. A Qasiri foundling given to the Lanternate, she was Sister Vesper of the Lamp-house at Valcastre for eleven years, until the Wick burned the midwife who had once healed her. Fire-eyed, quick to laugh and quicker to burn, she believes magic belongs to everyone. She still reads her breviary every night, and still knows the high part of the Canticle.',
    lore: 'lore:vesper-qadri',
  },
  {
    id: 'npc:benedetta-aurevine', name: 'Benedetta Aurevine', title: 'Factor to the Hierophancy', people: 'solenni', faction: 'faction:lanternate',
    region: 'region:saltreach-isles', home: 'landmark:gull-rock-hall',
    presentWhen: { all: [{ questActive: QA }, { not: f('act2.ember_tide_claimed') }] },
    schedule: [{ from: 0, to: 24, at: 'landmark:gull-rock-hall', activity: 'drink' }],
    dialogue: [
      { when: bidding, dialogue: 'dialogue:ch5s-benedetta-bid' },
      { dialogue: 'dialogue:ch5s-benedetta-general' },
    ],
    barks: [{ lines: ['The wine is Solenni. The glass is Solenni. The table, alas, is not.', 'Such a lively rock.', 'Do mind my soldiers; they are unwell.'] }],
    roles: ['quest'],
    look: { skin: 0xb08058, hair: 0x14100c, cloth: 0xe8e0cc, accent: 0xd4a646, build: 'tall' },
    bio: 'Of the Aurevine of Solenne, a house that grows wine and bishops. Factor to the Hierophancy and the Lord-Inquisitor’s agent at the Ember auction. Smooth, candid when candour is cheaper, and never once brave; she has made a long career of being useful instead.',
  },
  {
    id: 'npc:samir-ibn-ruqaya', name: 'Samir ibn Ruqaya', title: 'Envoy of the Caravans', people: 'qasiri', faction: 'faction:qasiri',
    shop: 'shop:zahrun-bazaar',
    region: 'region:saltreach-isles', home: 'landmark:gull-rock-hall',
    schedule: [
      { from: 0, to: 24, at: 'landmark:gull-rock-hall', activity: 'idle', when: inIsles },
      { from: 0, to: 24, at: 'landmark:zahrun', activity: 'idle', when: { not: inIsles } },
    ],
    dialogue: [
      { when: bidding, dialogue: 'dialogue:ch5s-samir-bid' },
      { dialogue: 'dialogue:ch5s-samir-zahrun' },
    ],
    barks: [
      { when: inIsles, lines: ['The salt is on the plate.', 'The sea is a desert that moves. I dislike it.', 'Peace on your road.'] },
      { when: { not: inIsles }, lines: ['Peace on your road.', 'Go with water.'] },
    ],
    roles: ['quest'],
    look: { skin: 0x7a4e30, hair: 0x18120e, cloth: 0xc8b48a, accent: 0x5ab0a0, build: 'average' },
    bio: 'The Cindermother’s youngest son and her envoy to the Ember auction. Courteous, watchful and careful with words, he keeps the salt-law as other men keep a sword. He wants no one to have the Embers, least of all the Qasiri.',
  },
  // ----- Sunscar
  {
    id: 'npc:ruqaya-al-nar', name: 'Ruqaya al-Nar', title: 'the Cindermother', people: 'qasiri', faction: 'faction:qasiri',
    region: 'region:sunscar', home: 'landmark:cindermother-tent',
    schedule: [{ from: 0, to: 24, at: 'landmark:cindermother-tent', activity: 'pray' }],
    dialogue: [
      { when: { questActive: 'quest:the-heart-of-orr' }, dialogue: 'dialogue:ch9-kings-stair' },
      { when: at(QG, 'zahrun'), dialogue: 'dialogue:ch5s-ruqaya-salt' },
      { dialogue: 'dialogue:ch5s-ruqaya-general' },
    ],
    barks: [{ lines: ['Sit, child. The sun is not your friend.', 'The smoke is restless today.', 'Salt shared is a vow.'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0x6a4428, hair: 0xe8e4dc, cloth: 0x4a3a2a, accent: 0xb87a3a, build: 'slight' },
    bio: 'Oracle-matriarch of the Qasiri caravans, blind for forty years and seeing further for it. Her face is a lace of ash-scars. She reads the smoke at Zahrun, keeps the salt-law, and has told the story of Ozrah ten thousand times without once being sure it was the right one.',
    lore: 'lore:ruqaya-al-nar',
  },
  // ----- Cinder Wastes
  {
    id: 'npc:ozrah', name: 'Ozrah the Unsleeping', title: 'Last of the Ashen Kings', people: 'drowned',
    region: 'region:cinder-wastes', home: 'landmark:glass-throne',
    presentWhen: { any: [at(QG, 'ozrah'), { all: [at(QG, 'ember'), { not: f('act2.ember_glass_claimed') }] }] },
    dialogue: [{ dialogue: 'dialogue:ozrah-throne' }],
    look: { skin: 0x5a5450, hair: 0x3a3634, cloth: 0x2a2624, accent: 0xd8eef0, build: 'tall' },
    bio: 'Last king of Qadir, a ghost of ash held together by nothing on a throne of black glass. History says he drew a ley-nexus to make himself undying and burned his land. In truth he was trying to feed the dying Heartfire, and when it would not take the fire back he held the wound closed for sixteen hundred years. Speaker only; present from his testimony until the Ember of the Glass is claimed.',
    lore: 'lore:ozrah-the-unsleeping',
  },
];

export default npcs;
