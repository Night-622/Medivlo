/**
 * Hollow Crown, Solaria: the Gilded March NPCs for the Oathbound campaign (06-outlines/radiance.md), plus the
 * Shorewatch at Abbeyshore and the Oathbound's Concordia messenger.
 * Zones: zone:radiance-frontier-1 Oathkeep, -2 the Sunfields, -3 the Gilded March, -4 the Dimming. Owner: Claude 4.
 */
import type { NarrativeCondition, NpcDef } from '@/core';

const OAT: NarrativeCondition = { heroClass: 'oathbound' };
const at = (q: `quest:${string}`, stage: string): NarrativeCondition => ({ questStage: q, stage });
const ACT2: NarrativeCondition = { flag: 'story.act', op: '>=', value: 2 };
const Z1 = 'zone:radiance-frontier-1' as const, Z2 = 'zone:radiance-frontier-2' as const, Z3 = 'zone:radiance-frontier-3' as const, Z4 = 'zone:radiance-frontier-4' as const;
const SHORE = 'landmark:oathbound-shorewatch-post' as const;

const npcs: NpcDef[] = [
  {
    id: 'npc:beatrix-holm', name: 'Ser Beatrix Holm', title: 'Marshal of Oathkeep', school: 'radiance', origin: 'radiance', trust: 2,
    services: ['Mentor', 'Trains Oathbound'], region: Z1, home: 'landmark:beatrix-holm-quarters', lore: 'lore:hc-beatrix-holm',
    presentWhen: OAT,
    schedule: [
      { from: 0, to: 24, at: 'landmark:hall-of-broken-swords', activity: 'idle', when: at('quest:oathbound-the-vigil', 'oath') },
      { from: 0, to: 24, at: 'landmark:dimming-edge', activity: 'idle', when: { any: [at('quest:oathbound-the-sorrow-oath', 'edge'), at('quest:oathbound-the-sorrow-oath', 'ilsabet')] } },
      // I-4: she follows Ilsabet's column out of the Dimming and sits down on the old milestone
      { from: 0, to: 24, at: 'landmark:oathbound-milestone', activity: 'idle', when: { any: [at('quest:oathbound-the-sorrow-oath', 'follow'), at('quest:oathbound-the-sorrow-oath', 'beatrix')] } },
      { from: 0, to: 24, at: 'landmark:oath-stones', activity: 'idle', when: at('quest:oathbound-the-oath-moot', 'moot') },
    ],
    dialogue: [
      { when: at('quest:oathbound-the-vigil', 'oath'), dialogue: 'dialogue:oathbound-beatrix-vigil' },
      { when: at('quest:oathbound-no-village-alone', 'report'), dialogue: 'dialogue:oathbound-beatrix-haybright' },
      { when: at('quest:oathbound-the-lions-gate', 'report'), dialogue: 'dialogue:oathbound-beatrix-lion' },
      { when: at('quest:oathbound-the-sorrow-oath', 'beatrix'), dialogue: 'dialogue:oathbound-beatrix-milestone' },
      { when: at('quest:oathbound-the-oath-moot', 'moot'), dialogue: 'dialogue:oathbound-oath-moot' },
      { when: at('quest:oathbound-to-whoever-wears-it', 'beatrix'), dialogue: 'dialogue:oathbound-beatrix-turn' },
      { when: at('quest:oathbound-the-march-road', 'farewell'), dialogue: 'dialogue:oathbound-beatrix-farewell' },
      { when: at('quest:oathbound-the-first-oath', 'beatrix'), dialogue: 'dialogue:oathbound-beatrix-first-oath' },
      { when: at('quest:oathbound-the-marshals-promise', 'finish'), dialogue: 'dialogue:oathbound-beatrix-letter' },
      { dialogue: 'dialogue:oathbound-beatrix' },
    ],
    barks: [{ lines: ['Report. Or don’t.', 'An oath is a wall you build in front of yourself. Mind you don’t build it behind.', 'Eat standing up. It saves time.'] }],
    roles: ['quest', 'trainer'], essential: true,
    look: { skin: 0xc8946e, hair: 0xb8b0a0, cloth: 0xd8c890, accent: 0xb08a3a, build: 'broad' },
    bio: 'Marshal of Oathkeep for twenty years: bluff, scarred, rigidly honest, and fond of nobody until they have kept a promise in front of her. She has broken one promise in her life, and she has never forgiven herself for it.',
  },
  {
    id: 'npc:ilsabet', name: 'Dame Ilsabet', title: 'of the Sorrow-Oath', school: 'radiance', origin: 'radiance', trust: 3,
    region: Z4, home: 'landmark:dimming-edge', lore: 'lore:hc-ilsabet',
    // Act I on the March; Act III, beaten on the stair top, waiting for her fate (the scene must be reopenable)
    presentWhen: { all: [OAT, { any: [at('quest:oathbound-the-sorrow-oath', 'ilsabet'), at('quest:oathbound-the-sorrow-oath', 'follow'), { questActive: 'quest:oathbound-to-whoever-wears-it' }, at('quest:oathbound-the-dimming-shrine', 'yield'), at('quest:oathbound-the-sorrow-herald', 'fate')] }] },
    schedule: [
      { from: 0, to: 24, at: 'landmark:twelve-stairs-top', activity: 'idle', when: at('quest:oathbound-the-sorrow-herald', 'fate') },
      // I-4: she leads the Nethercott column out of the Dimming to the Haybright carts at the milestone
      { from: 0, to: 24, at: 'landmark:oathbound-milestone', activity: 'idle', when: at('quest:oathbound-the-sorrow-oath', 'follow') },
    ],
    dialogue: [
      { when: at('quest:oathbound-the-sorrow-herald', 'fate'), dialogue: 'dialogue:oathbound-herald-fate' },
      { when: at('quest:oathbound-the-sorrow-oath', 'ilsabet'), dialogue: 'dialogue:oathbound-ilsabet-meet' },
      { when: at('quest:oathbound-to-whoever-wears-it', 'ilsabet'), dialogue: 'dialogue:oathbound-ilsabet-turn' },
      { when: at('quest:oathbound-the-dimming-shrine', 'yield'), dialogue: 'dialogue:oathbound-ilsabet-yields' },
      { dialogue: 'dialogue:oathbound-ilsabet' },
    ],
    barks: [{ lines: ['High guard. First blow from the left.', 'Good evening. It is evening, out here.', 'An oath to the crown is an oath to whoever wears it.'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xe8d0b8, hair: 0xe8d8a0, cloth: 0xe0e4ec, accent: 0xb0b8c8, build: 'tall' },
    bio: 'The most famous knight of the Gilded March, lost at the 85th Turning in C. 1012 and thought dead for thirty years. Calm, kind and impeccably courteous, in armour polished like a mirror. She keeps every oath she has ever sworn, to the letter.',
  },
  {
    id: 'npc:ser-gallant', name: 'Ser Gallant', title: 'the Forsworn', school: 'radiance', origin: 'radiance', trust: 1,
    region: Z2, home: 'landmark:forsworn-chapel-door',
    presentWhen: { all: [OAT, { any: [at('quest:oathbound-the-forsworn-chapel', 'yield'), { all: [{ flag: 'oathbound.gallant', value: 'held' }, { not: { flag: 'story.gate_open' } }] }] }] },
    dialogue: [
      { when: at('quest:oathbound-the-forsworn-chapel', 'yield'), dialogue: 'dialogue:oathbound-gallant-yields' },
      { dialogue: 'dialogue:oathbound-gallant' },
    ],
    barks: [{ lines: ['I yield. I always yield. It never takes.', '(He is following at a respectful distance.)'] }],
    roles: ['quest'],
    look: { skin: 0xb0a090, hair: 0x5a4a3a, cloth: 0x8a8070, accent: 0x2a2a2a, build: 'average' },
    bio: 'Dame Ilsabet’s squire, who broke his oath to her on the night of the Turning and cannot die because of it. He has held the Forsworn Chapel for thirty years, and got up every time he fell.',
  },
  {
    id: 'npc:hamish-goodbody', name: 'Squire Hamish Goodbody', title: 'of Oathkeep', school: 'radiance', origin: 'radiance', trust: 3,
    region: Z1, home: 'landmark:oathkeep-yard', presentWhen: OAT,
    dialogue: [{ dialogue: 'dialogue:oathbound-hamish' }],
    barks: [{ lines: ['I swear I’ll… oh no.', 'Two hundred and twelve. Two hundred and thirteen.', 'I solemnly swear this porridge will not defeat me.'] }],
    roles: ['quest'],
    look: { skin: 0xe8c4a8, hair: 0xb8402a, cloth: 0xd8c890, accent: 0xb08a3a, build: 'short' },
    bio: 'A squire of Oathkeep who swears oaths about everything, on the principle that a knight’s word is his armour and more armour is better. He is currently bound by two hundred and twelve of them.',
  },
  {
    id: 'npc:wystan-crake', name: 'Ser Wystan Crake', title: 'Keeper of the Hall of Broken Swords', school: 'radiance', origin: 'radiance', trust: 2,
    region: Z1, home: 'landmark:hall-of-broken-swords', presentWhen: OAT,
    dialogue: [
      { when: at('quest:oathbound-the-squire-who-swears-too-much', 'hall'), dialogue: 'dialogue:oathbound-wystan-book' },
      { dialogue: 'dialogue:oathbound-wystan' },
    ],
    barks: [{ lines: ['EH? Speak up.', 'Swords get lonely. So do old men.'] }],
    roles: ['quest'],
    look: { skin: 0xc8a890, hair: 0xf0ece4, cloth: 0x6a6a5a, accent: 0xb08a3a, build: 'slight' },
    bio: 'An old knight who has kept the Hall of Broken Swords for forty years. The ringing of the swords has made him deaf in one ear, and he says it has made him wise in the other.',
  },
  {
    id: 'npc:roderick-mallard', name: 'Sergeant-at-Arms Roderick Mallard', title: 'of Oathkeep', school: 'radiance', origin: 'radiance', trust: 2,
    services: ['Bounties'], region: Z1, home: 'landmark:oathkeep-yard', presentWhen: OAT,
    dialogue: [{ dialogue: 'dialogue:oathbound-mallard' }],
    barks: [{ lines: ['Paid on proof. Small proof, please.', 'Signed, sealed, witnessed. Then we talk money.'] }],
    roles: ['quest'],
    look: { skin: 0xd0a080, hair: 0x3a2a20, cloth: 0xd8c890, accent: 0x8a6a3a, build: 'broad' },
    bio: 'Oathkeep’s sergeant-at-arms, keeper of its bounty-rolls and its stores, who wants every claim signed, sealed and witnessed, and the proof small enough to fit on his desk.',
  },
  {
    id: 'npc:aurelian-sterling', name: 'Captain Aurelian Sterling', title: 'of the Brightwatch', school: 'radiance', origin: 'radiance', trust: 1,
    region: Z1, home: 'landmark:oath-stones',
    presentWhen: { all: [OAT, { questActive: 'quest:oathbound-the-oath-moot' }] },
    dialogue: [
      { when: at('quest:oathbound-the-oath-moot', 'canvass'), dialogue: 'dialogue:oathbound-sterling-canvass' },
      { dialogue: 'dialogue:oathbound-sterling' },
    ],
    barks: [{ lines: ['By order of His Radiance. I’m terribly sorry.', 'I just carry it. Very carefully.'] }],
    roles: ['ambient'],
    look: { skin: 0xe8d0b8, hair: 0xd8c070, cloth: 0xf8f4e8, accent: 0xd0b060, build: 'tall' },
    bio: 'A captain of the Brightwatch sent to Oathkeep with the Hierarch’s decree. He is polished, polite and very nervous, and would much rather be anywhere else.',
  },
  {
    id: 'npc:marjory-stook', name: 'Reeve Marjory Stook', title: 'of Haybright', school: 'radiance', origin: 'radiance', trust: 2,
    region: Z2, home: 'landmark:haybright', presentWhen: OAT,
    dialogue: [
      { when: at('quest:oathbound-no-village-alone', 'reeve'), dialogue: 'dialogue:oathbound-marjory' },
      { when: at('quest:oathbound-the-oath-moot', 'canvass'), dialogue: 'dialogue:oathbound-stook-canvass' },
      { dialogue: 'dialogue:oathbound-marjory-general' },
    ],
    barks: [{ lines: ['It’s your shadow, Pym.', 'Fear can wait in the queue like everyone else.'] }],
    roles: ['quest'],
    look: { skin: 0xc89070, hair: 0x8a5a2a, cloth: 0x8a7a4a, accent: 0xd8b040, build: 'broad' },
    bio: 'The reeve of Haybright in the Sunfields, who has four hundred acres of wheat to bring in and no time at all for the end of the world.',
  },
  {
    id: 'npc:clover-wheatley', name: 'Clover Wheatley', title: 'aged seven', school: 'radiance', origin: 'radiance', trust: 3,
    region: Z2, home: 'landmark:haybright-windmill', presentWhen: OAT,
    dialogue: [
      { when: at('quest:oathbound-the-night-shepherd', 'names'), dialogue: 'dialogue:oathbound-clover-names' },
      { dialogue: 'dialogue:oathbound-clover' },
    ],
    barks: [{ lines: ['Is it a real sword? Can I hold it when I’m eight?', 'Is the star a hole?'] }],
    roles: ['quest'],
    look: { skin: 0xe8c4a8, hair: 0xe8c860, cloth: 0x8aa04a, accent: 0xffd96b, build: 'short' },
    bio: 'A seven-year-old of Haybright who has seen a star at the edge of the Dimming, and intends to find out what it is, and name it, and all the others.',
  },
  {
    id: 'npc:dobbin-fenwick', name: 'Recruit Dobbin Fenwick', title: 'of the Haybright post', school: 'radiance', origin: 'radiance', trust: 2,
    region: Z2, home: 'landmark:haybright', presentWhen: OAT,
    dialogue: [{ dialogue: 'dialogue:oathbound-dobbin' }],
    barks: [{ lines: ['Don’t look at it. It knows.', 'It’s only where the light isn’t. It’s only where the light isn’t.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b090, hair: 0x6a4a2a, cloth: 0xd8c890, accent: 0x8a6a3a, build: 'slight' },
    bio: 'A raw recruit of the Order posted to Haybright, who saw his own shadow at full length for the first time when the Dimming came, and is sure it is a curse.',
  },
  {
    id: 'npc:jessamy-brightpenny', name: 'Jessamy Brightpenny', title: 'Gilder of the March', school: 'radiance', origin: 'radiance', trust: 2,
    region: Z3, home: 'landmark:gilders-hut', presentWhen: OAT,
    dialogue: [{ dialogue: 'dialogue:oathbound-jessamy' }],
    barks: [{ lines: ['Size, leaf, breath, burnish. Never sneeze.', 'Thirty years of gilding, and a cat ate it.'] }],
    roles: ['quest'],
    look: { skin: 0xe0b898, hair: 0x9a5a3a, cloth: 0x7a5a3a, accent: 0xffd96b, build: 'average' },
    bio: 'The gilder of the March road, who has kept its golden waymarks shining leaf by leaf for thirty years, and is very cross with the Gilded Lion about it.',
  },
  {
    id: 'npc:humbert-tench', name: 'Ser Humbert Tench', title: 'the Bridge Knight', school: 'radiance', origin: 'radiance', trust: 2,
    region: Z3, home: 'landmark:tench-bridge', presentWhen: OAT,
    dialogue: [{ dialogue: 'dialogue:oathbound-humbert' }],
    barks: [{ lines: ['HALT. None shall cross without… give me a moment.', 'It’s on the tip of my tongue.'] }],
    roles: ['quest'],
    look: { skin: 0xd0a888, hair: 0xe0dcd4, cloth: 0xa0a0a8, accent: 0xb08a3a, build: 'broad' },
    bio: 'An old knight who swore forty years ago to let no one cross his bridge without answering his riddle. Since the Bell rang he has forgotten the riddle, and nobody has crossed for a month.',
  },
  {
    id: 'npc:elspeth-snuff', name: 'Elspeth Snuff', title: 'Headwoman of Lampwick', school: 'radiance', origin: 'radiance', trust: 2,
    region: Z4, home: 'landmark:lampwick', presentWhen: OAT,
    dialogue: [{ dialogue: 'dialogue:oathbound-elspeth' }],
    barks: [{ lines: ['Six hundred years of candles and never needed one.', 'Don’t tell anyone I said lovely.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b8a0, hair: 0x5a5a5a, cloth: 0x6a5a4a, accent: 0xffc860, build: 'short' },
    bio: 'Headwoman of Lampwick, a village of candle-makers who have dipped candles for six hundred years without ever needing one, and are now terrified of their first night.',
  },
  {
    id: 'npc:gammer-lisle', name: 'Gammer Lisle', title: 'Shepherd of the Dimming', school: 'radiance', origin: 'radiance', trust: 2,
    region: Z4, home: 'landmark:lisle-fold', presentWhen: OAT,
    dialogue: [
      { when: at('quest:oathbound-the-first-star', 'gammer'), dialogue: 'dialogue:oathbound-gammer-star' },
      { dialogue: 'dialogue:oathbound-gammer' },
    ],
    barks: [{ lines: ['It’s only the evening, love.', 'Mind the dog. He doesn’t mind you.'] }],
    roles: ['quest'],
    look: { skin: 0xb88a6a, hair: 0xf0ece4, cloth: 0x5a6a4a, accent: 0xd0d0c8, build: 'short' },
    bio: 'An old shepherd of the Dimming, the only calm person in it, because she remembers night from before C. 1012 and was never once afraid of it.',
  },

  // ---------- Act II (Concordia): the Shorewatch, and Hamish
  {
    id: 'npc:cuthbert-lowe', name: 'Ser Cuthbert Lowe', title: 'of the Shorewatch', school: 'radiance', origin: 'radiance', trust: 2,
    region: 'region:abbey', home: SHORE, presentWhen: ACT2, lore: 'lore:hc-radiance-shorewatch',
    dialogue: [
      { when: { all: [OAT, at('quest:oathbound-abbess-morwen', 'tell')] }, dialogue: 'dialogue:oathbound-cuthbert-report' },
      { when: { all: [OAT, at('quest:oathbound-abbeyshore', 'shore')] }, dialogue: 'dialogue:oathbound-cuthbert' },
      { when: { all: [OAT, at('quest:oathbound-the-shorewatch-oath', 'oath')] }, dialogue: 'dialogue:oathbound-cuthbert' },
      { dialogue: 'dialogue:radiance-shorewatch' },
    ],
    barks: [{ lines: ['HALT. Mostly.', 'None shall reach the nave while the Shorewatch stands.', 'Is the March still there?'] }],
    roles: ['quest'],
    look: { skin: 0xc8a890, hair: 0xd8d4cc, cloth: 0x8a5a3a, accent: 0xb08a3a, build: 'broad' },
    bio: 'The eldest of the Shorewatch, three Oathbound who swore in C. 1012 to let no one reach the drowned nave, and have kept the shore at Abbeyshore for thirty years in rusting, dripping armour.',
  },
  {
    id: 'npc:bryony-wade', name: 'Ser Bryony Wade', title: 'of the Shorewatch', school: 'radiance', origin: 'radiance', trust: 1,
    region: 'region:abbey', home: SHORE, presentWhen: ACT2,
    dialogue: [{ dialogue: 'dialogue:oathbound-bryony' }],
    barks: [{ lines: ['I’ll fight you.', 'Thirty years. Not one decent fight.'] }],
    roles: ['ambient'],
    look: { skin: 0xb88a6a, hair: 0x8a8a8a, cloth: 0x8a5a3a, accent: 0xb08a3a, build: 'broad' },
    bio: 'The fiercest of the Shorewatch, who has not been allowed to fight anyone in thirty years and keeps a running tally of everything she would have fought, scratched on her shield.',
  },
  {
    id: 'npc:petronella-fane', name: 'Ser Petronella Fane', title: 'of the Shorewatch', school: 'radiance', origin: 'radiance', trust: 2,
    region: 'region:abbey', home: SHORE, presentWhen: ACT2,
    // C-2: she is at the oars when the choir starts singing (deaf, so it can't sing her to sleep)
    schedule: [{ from: 0, to: 24, at: 'landmark:shore-boat', activity: 'idle', when: { all: [OAT, at('quest:oathbound-the-shorewatch-oath', 'row')] } }],
    dialogue: [
      { when: { all: [OAT, at('quest:oathbound-the-shorewatch-oath', 'row')] }, dialogue: 'dialogue:oathbound-petronella-row' },
      { when: { all: [OAT, at('quest:oathbound-the-shorewatch-oath', 'oath')] }, dialogue: 'dialogue:oathbound-petronella' },
      { dialogue: 'dialogue:oathbound-petronella' },
    ],
    barks: [{ lines: ['WHAT?', 'Until relieved, dear. Until relieved.'] }],
    roles: ['quest'],
    look: { skin: 0xd8c0a8, hair: 0xf0ece4, cloth: 0x8a5a3a, accent: 0xb08a3a, build: 'slight' },
    bio: 'The quietest of the Shorewatch, made deaf by lake-water in her helm, in C. 1015. She painted the whole of their oath round the rim of her shield so she could still read it.',
  },
  {
    id: 'npc:hamish-at-the-gate', name: 'Squire Hamish Goodbody', title: 'a long way from Oathkeep', school: 'radiance', origin: 'radiance', trust: 3,
    region: 'region:alder', home: 'landmark:gate-circle',
    presentWhen: { all: [OAT, { any: [{ questActive: 'quest:oathbound-hamish-delivers' }, { questCompleted: 'quest:oathbound-hamish-delivers' }] }] },
    // C-6: after the escort he stays at the Gilded Goose, having found out that Concordia has a tavern
    schedule: [{ from: 0, to: 24, at: 'landmark:brind-gilded-goose', activity: 'idle', when: { any: [at('quest:oathbound-hamish-delivers', 'reply'), { questCompleted: 'quest:oathbound-hamish-delivers' }] } }],
    dialogue: [
      { when: at('quest:oathbound-hamish-delivers', 'reply'), dialogue: 'dialogue:oathbound-hamish-goose' },
      { dialogue: 'dialogue:oathbound-hamish-gate' },
    ],
    barks: [{ lines: ['I swear I’ll get up in a minute.', 'Is there a tavern? I swore I’d find out.'] }],
    roles: ['quest'],
    look: { skin: 0xe8c4a8, hair: 0xb8402a, cloth: 0xd8c890, accent: 0xb08a3a, build: 'short' },
    bio: 'Squire Hamish swore to deliver Ser Beatrix’s message or die trying, fell through the Dawn Gate and most of the way down the far side, and very nearly managed both.',
  },
];

export default npcs;
