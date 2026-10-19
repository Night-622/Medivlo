/**
 * Hollow Crown, Wildheart: Rootholme NPCs for the Hedgewitch campaign (docs/lore/hollow-crown/06-outlines/verdant.md),
 * plus the Verdant folk of Concordia (Thornhollow, both Verdant campaigns). Zones: zone:verdant-capital-1 the Bough
 * Markets, -2 the Sap Wells, -3 the Root Cellars, -4 the Canopy Hollows. Owner: Claude 4.
 */
import type { NarrativeCondition, NpcDef } from '@/core';

const HW: NarrativeCondition = { heroClass: 'hedgewitch' };
const at = (q: `quest:${string}`, stage: string): NarrativeCondition => ({ questStage: q, stage });
const ACT2: NarrativeCondition = { flag: 'story.act', op: '>=', value: 2 };
const Z1 = 'zone:verdant-capital-1' as const, Z2 = 'zone:verdant-capital-2' as const, Z3 = 'zone:verdant-capital-3' as const, Z4 = 'zone:verdant-capital-4' as const;

const npcs: NpcDef[] = [
  {
    id: 'npc:mother-yarrow', name: 'Mother Yarrow', title: 'Root-Warden of the Circle', school: 'verdant', origin: 'verdant', trust: 3,
    services: ['Mentor', 'Trains Hedgewitches'], region: Z1, home: 'landmark:yarrow-bower', lore: 'lore:hc-mother-yarrow',
    presentWhen: HW,
    schedule: [
      { from: 0, to: 24, at: 'landmark:root-circle-ring', activity: 'idle', when: at('quest:hedgewitch-the-ring-vote', 'vote') },
      { from: 0, to: 24, at: 'landmark:hedgewitch-hush-bough', activity: 'idle', when: { any: [at('quest:hedgewitch-the-bell-in-the-boughs', 'trunk'), at('quest:hedgewitch-the-bell-in-the-boughs', 'hush')] } },
      { from: 0, to: 24, at: 'landmark:spindle-street', activity: 'idle', when: at('quest:hedgewitch-the-sleeping-cellars', 'report') },
    ],
    dialogue: [
      { when: at('quest:hedgewitch-the-bell-in-the-boughs', 'yarrow'), dialogue: 'dialogue:hedgewitch-yarrow-bell' },
      { when: at('quest:hedgewitch-the-bell-in-the-boughs', 'hush'), dialogue: 'dialogue:hedgewitch-yarrow-hush' },
      { when: at('quest:hedgewitch-what-the-bramblewife-planted', 'tell'), dialogue: 'dialogue:hedgewitch-yarrow-ostara' },
      { when: at('quest:hedgewitch-pruning-day', 'report'), dialogue: 'dialogue:hedgewitch-yarrow-lantern' },
      { when: at('quest:hedgewitch-the-sleeping-cellars', 'report'), dialogue: 'dialogue:hedgewitch-yarrow-spores' },
      { when: at('quest:hedgewitch-the-ring-vote', 'vote'), dialogue: 'dialogue:hedgewitch-ring-vote' },
      { when: at('quest:hedgewitch-the-root-road', 'farewell'), dialogue: 'dialogue:hedgewitch-yarrow-farewell' },
      { when: at('quest:hedgewitch-what-the-tree-said-back', 'yarrow'), dialogue: 'dialogue:hedgewitch-yarrow-knot' },
      { when: at('quest:hedgewitch-yarrows-tree-diary', 'read'), dialogue: 'dialogue:hedgewitch-yarrow-diary' },
      { dialogue: 'dialogue:hedgewitch-yarrow' },
    ],
    barks: [{ lines: ['Hush now. Hush, you great lummox.', 'I was just telling the tree about you. Nothing bad.', 'Eat something green, dear. You look peaky.'] }],
    roles: ['quest', 'trainer'], essential: true,
    look: { skin: 0xd8b090, hair: 0xe8e4dc, cloth: 0x3a6a2a, accent: 0xe8d87a, build: 'short' },
    bio: 'Root-Warden of the Circle, gentle and immovable, who has taught the hero since they were knee-high to a Briarling. She talks to the Elder Tree out loud, all day, about everything, and writes it all down. She has never once had an answer.',
  },
  {
    id: 'npc:ostara', name: 'Bramblewife Ostara', title: 'Healer of the Sap Wells', school: 'verdant', origin: 'verdant', trust: 2,
    region: Z2, home: 'landmark:ostara-sap-garden', lore: 'lore:hc-ostara',
    // Act I in Rootholme; Act III, beaten on the stair top, waiting for her fate (the scene must be reopenable)
    presentWhen: { all: [HW, { any: [{ not: { flag: 'hedgewitch.halfstone' } }, at('quest:hedgewitch-the-herald-of-bloom', 'fate')] }] },
    schedule: [
      { from: 0, to: 24, at: 'landmark:twelve-stairs-top', activity: 'idle', when: at('quest:hedgewitch-the-herald-of-bloom', 'fate') },
      { from: 0, to: 24, at: 'landmark:canopy-graft-crown', activity: 'idle', when: { any: ['ward', 'grafts', 'ostara'].map((s) => at('quest:hedgewitch-what-the-bramblewife-planted', s)) } },
      { from: 0, to: 24, at: 'landmark:hedgewitch-deep-well', activity: 'idle', when: { any: [at('quest:hedgewitch-the-bramblewifes-garden', 'well'), at('quest:hedgewitch-the-bramblewifes-garden', 'draw')] } },
    ],
    dialogue: [
      { when: at('quest:hedgewitch-the-herald-of-bloom', 'fate'), dialogue: 'dialogue:hedgewitch-herald-fate' },
      { when: at('quest:hedgewitch-the-bramblewifes-garden', 'garden'), dialogue: 'dialogue:hedgewitch-ostara-garden' },
      { when: at('quest:hedgewitch-the-bramblewifes-garden', 'draw'), dialogue: 'dialogue:hedgewitch-ostara-well' },
      { when: at('quest:hedgewitch-the-bramblewifes-garden', 'back'), dialogue: 'dialogue:hedgewitch-ostara-tea' },
      { when: at('quest:hedgewitch-what-the-bramblewife-planted', 'ostara'), dialogue: 'dialogue:hedgewitch-ostara-reveal' },
      { dialogue: 'dialogue:hedgewitch-ostara' },
    ],
    barks: [{ lines: ['Nobody goes into the compost on my watch.', 'Sticky to the elbows, love. Don’t shake hands.', 'A spoonful and you’ll be right as rain.'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xe0b898, hair: 0x6a3a2a, cloth: 0x5a7a2a, accent: 0x2a1a14, build: 'average' },
    bio: 'The Circle’s best healer: warm, funny, sticky to the elbows and generous with everything. Nobody in her ward has died in a year. She married a bramble patch at nine, she says, and has been prickly ever since.',
  },
  {
    id: 'npc:cicely-rue', name: 'Eldest Cicely Rue', title: 'Chair of the Root Circle', school: 'verdant', origin: 'verdant', trust: 1,
    region: Z1, home: 'landmark:root-circle-ring', presentWhen: HW,
    dialogue: [
      { when: at('quest:hedgewitch-the-ring-vote', 'canvass'), dialogue: 'dialogue:hedgewitch-cicely-canvass' },
      { dialogue: 'dialogue:hedgewitch-cicely' },
    ],
    barks: [{ lines: ['Order. ORDER.', 'All in favour, disagree in the usual way.'] }],
    roles: ['ambient'],
    look: { skin: 0xc8a888, hair: 0xb8b8b0, cloth: 0x2a4a2a, accent: 0xd8c86a, build: 'tall' },
    bio: 'Eldest of the Root Circle, who has chaired its ring for twenty years and been agreed with twice.',
  },
  {
    id: 'npc:prudence-coddle', name: 'Prudence Coddle', title: 'Cat-warden of Lantern Row', school: 'verdant', origin: 'verdant', trust: 1,
    region: Z1, home: 'landmark:lantern-row', presentWhen: HW,
    dialogue: [{ dialogue: 'dialogue:hedgewitch-prudence' }],
    barks: [{ lines: ['Nineteen. There were nineteen.', 'I can hear Admiral. Admiral is very cross.'] }],
    roles: ['quest'],
    look: { skin: 0xe0c0a0, hair: 0x8a6a4a, cloth: 0x6a4a6a, accent: 0xe8a0a0, build: 'short' },
    bio: 'The unofficial keeper of every cat on Lantern Row, who knows all nineteen by name and temper. The Row was swallowed by the tree in the night.',
  },
  {
    id: 'npc:tibbs', name: 'Tibbs', title: 'a Bloomkin, and a cat', school: 'verdant', origin: 'verdant',
    region: Z1, home: 'landmark:lantern-row', presentWhen: HW,
    dialogue: [{ dialogue: 'dialogue:hedgewitch-tibbs' }],
    barks: [{ lines: ['Mrow.', '(It washes its face with a leaf.)'] }],
    roles: ['ambient'],
    look: { skin: 0xc83a2a, cloth: 0x3a6a2a, build: 'short' },
    bio: 'A Bloomkin, round and red as a rose-hip, who woke up on Lantern Row among nineteen cats and drew its own conclusions.',
  },
  {
    id: 'npc:campion', name: 'Campion', title: 'a Bloomkin of the new growth', school: 'verdant', origin: 'verdant', trust: 1,
    region: Z1, home: 'landmark:lantern-row', presentWhen: HW,
    dialogue: [
      { when: at('quest:hedgewitch-the-ring-vote', 'canvass'), dialogue: 'dialogue:hedgewitch-campion-canvass' },
      { dialogue: 'dialogue:hedgewitch-campion' },
    ],
    barks: [{ lines: ['(It is holding a lantern it found inside the bark. It will not put it down.)', 'I woke up in a street. The street was asleep.'] }],
    roles: ['ambient'],
    look: { skin: 0xd85a7a, hair: 0x6a8a3a, cloth: 0x4a6a2a, build: 'short' },
    bio: 'A ragged-robin Bloomkin, pink and frayed at the edges, who woke this spring in the new growth over Lantern Row and has stood guard on it ever since, holding a lantern it found inside the bark.',
  },
  {
    id: 'npc:hepzibah-marl', name: 'Hepzibah Marl', title: 'of the Compost Bough', school: 'verdant', origin: 'verdant', trust: 2,
    region: Z1, home: 'landmark:compost-bough', presentWhen: HW,
    dialogue: [
      { when: at('quest:hedgewitch-the-compost-debate', 'truce'), dialogue: 'dialogue:hedgewitch-compost-truce' },
      { dialogue: 'dialogue:hedgewitch-hepzibah' },
    ],
    barks: [{ lines: ['Nettles. Every Tuesday. That is compost.', 'Forty years I’ve been right, and he’s never once admitted it.'] }],
    roles: ['quest'],
    look: { skin: 0xd0a888, hair: 0xa0a098, cloth: 0x5a4a2a, accent: 0x6a8a3a, build: 'broad' },
    bio: 'A gardener of the Bough Markets who has argued about compost with her neighbour for forty years, across the same bough, at the same volume.',
  },
  {
    id: 'npc:fennimore-clay', name: 'Old Fennimore Clay', title: 'of the Compost Bough', school: 'verdant', origin: 'verdant', trust: 2,
    region: Z1, home: 'landmark:compost-bough', presentWhen: HW,
    dialogue: [{ dialogue: 'dialogue:hedgewitch-fennimore' }],
    barks: [{ lines: ['NETTLES. She puts in NETTLES.', 'In my day you let the winter do the work.'] }],
    roles: ['quest'],
    look: { skin: 0xb88a6a, hair: 0xd8d8d0, cloth: 0x4a3a2a, accent: 0x8a6a3a, build: 'slight' },
    bio: 'Hepzibah Marl’s neighbour and opponent of forty years. He is deaf in the ear that faces her, and old enough to remember the tree asleep in winter.',
  },
  {
    id: 'npc:thaddeus-wort', name: 'Beadle Thaddeus Wort', title: 'of the Circle’s notice-bough', school: 'verdant', origin: 'verdant', trust: 1,
    region: Z1, home: 'landmark:circle-notice-bough', presentWhen: HW,
    dialogue: [
      { when: at('quest:hedgewitch-too-many-cats', 'register'), dialogue: 'dialogue:hedgewitch-thaddeus-register' },
      { dialogue: 'dialogue:hedgewitch-thaddeus' },
    ],
    barks: [{ lines: ['Bounties paid in coin or jam, depending on the budget.', 'This week it’s coin. Don’t get used to it.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b498, hair: 0x5a4a3a, cloth: 0x3a4a2a, accent: 0xb08a3a, build: 'average' },
    bio: 'The Root Circle’s beadle, who pins up the bounties, pays them out and keeps a ledger of the jam.',
  },
  {
    id: 'npc:dunstan-treacle', name: 'Dunstan Treacle', title: 'Sap-tapper of the Wells', school: 'verdant', origin: 'verdant', trust: 2,
    region: Z2, home: 'landmark:sap-tappers-well', presentWhen: HW,
    dialogue: [
      { when: at('quest:hedgewitch-a-sticky-situation', 'back'), dialogue: 'dialogue:hedgewitch-dunstan-junction' },
      { dialogue: 'dialogue:hedgewitch-dunstan' },
    ],
    barks: [{ lines: ['Mustn’t grumble.', 'Three days. Hardly noticed.'] }],
    roles: ['quest'],
    look: { skin: 0xc89a78, hair: 0x8a4a2a, cloth: 0x6a5a3a, accent: 0xd8a03a, build: 'broad' },
    bio: 'A sap-tapper of the Sap Wells, so patient that he once stood stuck to his own tap for three days without making a fuss.',
  },
  {
    id: 'npc:ned-burdock', name: 'Ned Burdock', title: 'a boy of the Sap Wells', school: 'verdant', origin: 'verdant', trust: 2,
    region: Z2, home: 'landmark:ostara-sap-garden', presentWhen: HW,
    dialogue: [
      { when: { questCompleted: 'quest:hedgewitch-gran-hasnt-said-a-word' }, dialogue: 'dialogue:hedgewitch-ned-after' },
      { dialogue: 'dialogue:hedgewitch-ned' },
    ],
    barks: [{ lines: ['Is my Gran better? Everyone says she’s better.', 'She used to smell of peppermints.'] }],
    roles: ['quest'],
    look: { skin: 0xe0b898, hair: 0x6a4a2a, cloth: 0x4a6a8a, accent: 0xe8d87a, build: 'short' },
    bio: 'A boy of the Sap Wells whose Gran was dying until Bramblewife Ostara saved her. She has not said a word to him since.',
  },
  {
    id: 'npc:gran-burdock', name: 'Gran Burdock', title: 'Ostara’s patient', school: 'verdant', origin: 'verdant', trust: 0,
    region: Z2, home: 'landmark:ostara-sap-garden',
    // Act III: rooted in the Legion camp; once she has been sung to rest, she is gone
    presentWhen: { all: [HW, { not: { flag: 'hedgewitch.gran_fate', value: 'rest' } }] },
    schedule: [{ from: 0, to: 24, at: 'landmark:legion-camp', activity: 'idle', when: { questActive: 'quest:hedgewitch-gran-burdocks-rest' } }],
    dialogue: [
      { when: { questActive: 'quest:hedgewitch-gran-burdocks-rest' }, dialogue: 'dialogue:hedgewitch-gran-heart' },
      { when: at('quest:hedgewitch-gran-hasnt-said-a-word', 'apron'), dialogue: 'dialogue:hedgewitch-gran-peppermints' },
      { dialogue: 'dialogue:hedgewitch-gran' },
    ],
    barks: [{ lines: ['(She smiles at the wall.)', '(She smells of warm sap.)'] }],
    roles: ['quest'],
    look: { skin: 0xb0c098, hair: 0xd8d8d0, cloth: 0x6a5a4a, accent: 0x3a8a3a, build: 'slight' },
    bio: 'Ned’s grandmother, healed by Ostara a month ago. She sits in the sun outside the ward all day, smiling, and has not spoken since.',
  },
  {
    id: 'npc:hester-mudlark', name: 'Hester Mudlark', title: 'of the Root Cellars', school: 'verdant', origin: 'verdant', trust: 1,
    region: Z3, home: 'landmark:mudlark-cellar', presentWhen: HW,
    dialogue: [
      { when: at('quest:hedgewitch-moving-day', 'frame'), dialogue: 'dialogue:hedgewitch-hester-frame' },
      { dialogue: 'dialogue:hedgewitch-hester' },
    ],
    barks: [{ lines: ['Agnes, put that DOWN.', 'Eight children and a goat. Don’t ask which is louder.'] }],
    roles: ['quest'],
    look: { skin: 0xc8946e, hair: 0x3a2a20, cloth: 0x6a4a3a, accent: 0xb87a4a, build: 'broad' },
    bio: 'Mother of eight Mudlarks and keeper of one goat, Duchess. The roots are coming through her cellar walls, and her family has lived in that house for four generations.',
  },
  {
    id: 'npc:thistledown', name: 'Thistledown', title: 'a newly woken Bloomkin', school: 'verdant', origin: 'verdant', trust: 2,
    region: Z3, home: 'landmark:spindle-street', presentWhen: { all: [HW, { not: { questCompleted: 'quest:hedgewitch-what-is-thistledown-for' } }, { not: at('quest:hedgewitch-what-is-thistledown-for', 'list') }] },
    dialogue: [{ dialogue: 'dialogue:hedgewitch-thistledown' }],
    barks: [{ lines: ['What are you for?', 'I have made a list.'] }],
    roles: ['quest'],
    look: { skin: 0x8aa86a, hair: 0xf0ece0, cloth: 0x6a8a4a, build: 'short' },
    bio: 'A Bloomkin, one week old: a stalk with a soft white puff for a head, very serious, and determined to find out what it is for.',
  },
  {
    id: 'npc:hyssop-haws', name: 'Hyssop Haws', title: 'kite-flyer of the high boughs', school: 'verdant', origin: 'verdant', trust: 2,
    region: Z4, home: 'landmark:kite-bough', presentWhen: HW,
    dialogue: [{ dialogue: 'dialogue:hedgewitch-hyssop' }],
    barks: [{ lines: ['They took my KITE.', 'It had a face on it!'] }],
    roles: ['quest'],
    look: { skin: 0xe8c4a8, hair: 0xb8743a, cloth: 0xc84a3a, accent: 0xf0d060, build: 'short' },
    bio: 'A small, fierce child of the Canopy Hollows, entered in the kite-race every year since she could walk, and furious with the Briarlings.',
  },
  {
    id: 'npc:wenna-sloe', name: 'Grandmother Wenna Sloe', title: 'of the Canopy Hollows', school: 'verdant', origin: 'verdant', trust: 2,
    region: Z4, home: 'landmark:kite-bough', presentWhen: HW,
    dialogue: [{ dialogue: 'dialogue:hedgewitch-wenna-sloe' }],
    barks: [{ lines: ['I climbed to the top once, on a dare.', 'A hundred, and I could still beat that Haws girl at kites.'] }],
    roles: ['quest'],
    look: { skin: 0xd0b098, hair: 0xf0ece0, cloth: 0x4a3a5a, accent: 0xa8c8e8, build: 'slight' },
    bio: 'The oldest woman in the Canopy Hollows, a hundred and proud of it, who climbed to the topmost leaf as a girl and would like to hear about it once more.',
  },
  // ---------- Act II (Concordia: Thornhollow, both Verdant campaigns)
  {
    id: 'npc:teasel-gammon', name: 'Teasel Gammon', title: 'Keeper of the Hedge House', school: 'verdant', origin: 'verdant', trust: 2,
    region: 'region:briar', home: 'landmark:thorn-hedge-house', presentWhen: ACT2,
    // Ranger C-4/C-5: he walks out to the Gloamwood with his pot, is escorted into the Stag's glade, and stays to watch
    schedule: [
      { from: 0, to: 24, at: 'landmark:gloam-stag-glade', activity: 'idle', when: { any: [at('quest:ranger-the-white-stag', 'hear'), at('quest:ranger-the-white-stag', 'glade'), at('quest:ranger-the-white-stag', 'stag')] } },
      { from: 0, to: 24, at: 'landmark:ranger-glade-camp', activity: 'idle', when: { any: [at('quest:ranger-the-rotkings-trail', 'teasel'), at('quest:ranger-the-white-stag', 'escort'), at('quest:ranger-the-white-stag', 'regroup')] } },
    ],
    dialogue: [
      { when: at('quest:ranger-the-rotkings-trail', 'teasel'), dialogue: 'dialogue:ranger-teasel-camp' },
      { when: at('quest:ranger-the-white-stag', 'hear'), dialogue: 'dialogue:ranger-teasel-stag' },
      { when: at('quest:hedgewitch-thornhollow', 'hedge'), dialogue: 'dialogue:hedgewitch-teasel' },
      { when: at('quest:ranger-the-hedge-house', 'hedge'), dialogue: 'dialogue:ranger-teasel' },
      { dialogue: 'dialogue:verdant-teasel' },
    ],
    barks: [{ lines: ['Mind the seedlings.', 'Thirty years of Wildheart in pots. Like geraniums.'] }],
    roles: ['quest'],
    look: { skin: 0xc8a080, hair: 0x8a8a7a, cloth: 0x4a5a2a, accent: 0xa8c86a, build: 'average' },
    bio: 'Keeper of the Hedge House at Thornhollow, the old Verdant waystation in Concordia. He was on this side of the arch when it shut in C. 1012, and has kept a little of Wildheart alive in pots ever since.',
  },
  {
    id: 'npc:thistledown-thornhollow', name: 'Thistledown', title: 'a Bloomkin, far from home', school: 'verdant', origin: 'verdant', trust: 3,
    region: 'region:briar', home: 'landmark:thorn-greenbriar-nursery',
    presentWhen: { all: [HW, ACT2, { flag: 'hedgewitch.thistledown_helped' }] },
    // Act III: walks to the Heart camp, chooses its patch of nothing and plants itself there (Thistledown’s Answer)
    schedule: [
      { from: 0, to: 24, at: 'landmark:hedgewitch-thistle-patch', activity: 'idle', when: { any: [at('quest:hedgewitch-thistledowns-answer', 'root'), { questCompleted: 'quest:hedgewitch-thistledowns-answer' }] } },
      { from: 0, to: 24, at: 'landmark:heart-camp', activity: 'idle', when: { questActive: 'quest:hedgewitch-thistledowns-answer' } },
    ],
    dialogue: [
      { when: { any: [{ questActive: 'quest:hedgewitch-thistledowns-answer' }, { questCompleted: 'quest:hedgewitch-thistledowns-answer' }] }, dialogue: 'dialogue:hedgewitch-thistledown-heart' },
      { dialogue: 'dialogue:hedgewitch-thistledown-thornhollow' },
    ],
    barks: [{ lines: ['I am keeping a list of places where nothing grows.', 'Everything here grows in pots.'] }],
    roles: ['ambient'],
    look: { skin: 0x8aa86a, hair: 0xf0ece0, cloth: 0x6a8a4a, build: 'short' },
    bio: 'Thistledown walked out of Wildheart behind you, mostly fluff and very quiet, and has taken up residence in the Greenbriar Nursery while it decides what it is for.',
  },
  {
    id: 'npc:jennet-wadeley', name: 'Jennet Wadeley', title: 'Eel-trapper of Briar Hollow', school: 'verdant', origin: 'concord', trust: 1,
    region: 'region:briar', home: 'landmark:hedgewitch-eel-hut',
    presentWhen: { all: [HW, ACT2] },
    // C-4: escorted to the edge of the deep bog, where she stays while you follow Ostara's pails
    schedule: [{ from: 0, to: 24, at: 'landmark:hedgewitch-bog-edge', activity: 'idle', when: { any: [at('quest:hedgewitch-the-bramblewifes-graft', 'witness'), at('quest:hedgewitch-the-bramblewifes-graft', 'pails'), at('quest:hedgewitch-the-bramblewifes-graft', 'seed')] } }],
    dialogue: [
      { when: at('quest:hedgewitch-the-bramblewifes-graft', 'witness'), dialogue: 'dialogue:hedgewitch-jennet-witness' },
      { dialogue: 'dialogue:hedgewitch-jennet' },
    ],
    barks: [{ lines: ['Mind your feet. The bog likes ankles.', 'Eels don’t bite. Mostly they don’t bite.'] }],
    roles: ['quest'],
    look: { skin: 0xb89878, hair: 0x5a4a3a, cloth: 0x4a5a3a, accent: 0x8a9a5a, build: 'slight' },
    bio: 'An eel-trapper of Briar Hollow, born on the bog and proud of it, who has been setting her traps in the deep water every night for forty years and knows exactly who else is out there.',
  },
];

export default npcs;
