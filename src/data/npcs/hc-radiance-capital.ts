/**
 * Hollow Crown, Solaria: Dawnspire NPCs for the Cantor campaign (docs/lore/hollow-crown/06-outlines/radiance.md),
 * plus the Radiance diaspora at Abbeyshore and the Cantor's Concordia messengers.
 * Zones: zone:radiance-capital-1 Cathedral Close, -2 the Choir Cloisters, -3 the Sunward Market, -4 the Undercroft.
 * Owner: Claude 4.
 */
import type { NarrativeCondition, NpcDef } from '@/core';

const CAN: NarrativeCondition = { heroClass: 'cantor' };
const at = (q: `quest:${string}`, stage: string): NarrativeCondition => ({ questStage: q, stage });
const ACT2: NarrativeCondition = { flag: 'story.act', op: '>=', value: 2 };
const Z1 = 'zone:radiance-capital-1' as const, Z2 = 'zone:radiance-capital-2' as const, Z3 = 'zone:radiance-capital-3' as const, Z4 = 'zone:radiance-capital-4' as const;
const LULL_SMUGGLES: NarrativeCondition = { all: [{ flag: 'cantor.night_speaker' }, { flag: 'cantor.lull', value: 'helped' }] };

const npcs: NpcDef[] = [
  {
    id: 'npc:celestine-hale', name: 'Mother Celestine Hale', title: 'Precentrix of the Cathedral Choir', school: 'radiance', origin: 'radiance', trust: 2,
    services: ['Mentor', 'Trains Cantors'], region: Z2, home: 'landmark:celestine-cell', lore: 'lore:hc-celestine-hale',
    presentWhen: CAN,
    schedule: [
      { from: 0, to: 24, at: 'landmark:close-steps', activity: 'idle', when: at('quest:cantor-the-hour-of-no-night', 'celestine') },
      { from: 0, to: 24, at: 'landmark:undercroft-jar-shelves', activity: 'idle', when: at('quest:cantor-six-years-awake', 'together') },
    ],
    dialogue: [
      { when: at('quest:cantor-the-hour-of-no-night', 'celestine'), dialogue: 'dialogue:cantor-celestine-bell' },
      { when: at('quest:cantor-the-hour-of-no-night', 'cell'), dialogue: 'dialogue:cantor-celestine-cell' },
      { when: at('quest:cantor-the-sleepers-census', 'report'), dialogue: 'dialogue:cantor-celestine-census' },
      { when: at('quest:cantor-the-bell-loft', 'report'), dialogue: 'dialogue:cantor-celestine-loft' },
      { when: at('quest:cantor-the-reliquary-of-hours', 'celestine'), dialogue: 'dialogue:cantor-celestine-reliquary' },
      { when: at('quest:cantor-the-last-night', 'celestine'), dialogue: 'dialogue:cantor-celestine-candle' },
      { when: at('quest:cantor-the-dawn-road', 'farewell'), dialogue: 'dialogue:cantor-celestine-farewell' },
      { when: at('quest:cantor-compline', 'celestine'), dialogue: 'dialogue:cantor-celestine-compline' },
      { when: at('quest:cantor-six-years-awake', 'why'), dialogue: 'dialogue:cantor-celestine-awake' },
      { when: at('quest:cantor-six-years-awake', 'together'), dialogue: 'dialogue:cantor-celestine-together' },
      { dialogue: 'dialogue:cantor-celestine' },
    ],
    barks: [{ lines: ['Sing up. The Brightwatch counts the quiet ones.', 'I am not tired. I am precise.', 'Collar done up, please. You’re glowing again.'] }],
    roles: ['quest', 'trainer'], essential: true,
    look: { skin: 0xe8c8a8, hair: 0xd8d4cc, cloth: 0xf0e8d0, accent: 0xffd96b, build: 'slight' },
    bio: 'Choir-mistress of the Sun Cathedral, thin as a reed and sharp as glass about it. She has not slept for six years, has sung every hour in that time, and covers for her novices with lies that are, strictly speaking, true.',
  },
  {
    id: 'npc:lucan-brightwater', name: 'Inquisitor Lucan Brightwater', title: 'of the Brightwatch', school: 'radiance', origin: 'radiance', trust: 2,
    region: Z1, home: 'landmark:brightwatch-house', lore: 'lore:hc-lucan-brightwater',
    // Act I in Dawnspire; Act III, beaten on the stair top, waiting for his fate (the scene must be reopenable)
    presentWhen: { all: [CAN, { any: [{ not: { flag: 'cantor.halfstone' } }, at('quest:cantor-the-herald-of-noon', 'fate')] }] },
    schedule: [
      { from: 0, to: 24, at: 'landmark:twelve-stairs-top', activity: 'idle', when: at('quest:cantor-the-herald-of-noon', 'fate') },
      { from: 0, to: 24, at: 'landmark:sunward-market-cross', activity: 'idle', when: at('quest:cantor-the-inquisitors-kindness', 'market') },
    ],
    dialogue: [
      { when: at('quest:cantor-the-herald-of-noon', 'fate'), dialogue: 'dialogue:cantor-herald-fate' },
      { when: at('quest:cantor-the-inquisitors-kindness', 'market'), dialogue: 'dialogue:cantor-lucan-market' },
      { when: at('quest:cantor-the-last-night', 'lucan'), dialogue: 'dialogue:cantor-lucan-last-night' },
      { dialogue: 'dialogue:cantor-lucan' },
    ],
    barks: [{ lines: ['Mind the glare. It’s worse in the afternoon.', 'Would you like a loaf? I always bring too many.', 'Everyone’s so tired. It isn’t their fault.'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xe8d0b8, hair: 0xe8d890, cloth: 0xf8f4e8, accent: 0x2a2a30, build: 'tall' },
    bio: 'The Inquisitor of the Brightwatch, who arrests sleep-draught sellers with a loaf and a blanket for each of them. Thin, gentle, endlessly polite, behind smoked spectacles he never takes off. Nobody can remember seeing him yawn.',
  },
  {
    id: 'npc:sister-amabel', name: 'Sister Amabel', title: 'Keeper of the Nights', school: 'radiance', origin: 'radiance', trust: 2,
    region: Z4, home: 'landmark:undercroft-jar-shelves',
    presentWhen: { all: [CAN, { questCompleted: 'quest:cantor-the-inquisitors-kindness' }] },
    dialogue: [
      { when: at('quest:cantor-the-jars-of-night', 'jars'), dialogue: 'dialogue:cantor-jars-of-night' },
      { when: at('quest:cantor-nodding-off', 'jar'), dialogue: 'dialogue:cantor-amabel-tobit' },
      { when: at('quest:cantor-rain-at-night', 'keep'), dialogue: 'dialogue:cantor-amabel-orla' },
      { dialogue: 'dialogue:cantor-amabel' },
    ],
    barks: [{ lines: ['Mind the bottom shelf. Those are the windy ones.', 'Every night’s labelled. Somebody has to remember them.', 'Soup’s on the crate, Orla.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b090, hair: 0x6a5a4a, cloth: 0x3a3a48, accent: 0xffd96b, build: 'average' },
    bio: 'A Cantor taken by the Brightwatch six years ago for singing Compline, brought down to the Undercroft and then forgotten. She has kept the city’s jars of night ever since, labelled in a round, neat hand, and has not seen daylight, or Celestine, in all that time.',
  },
  {
    id: 'npc:osgood-bellamy', name: 'Sergeant Osgood Bellamy', title: 'of the Brightwatch', school: 'radiance', origin: 'radiance', trust: 2,
    services: ['Bounties'], region: Z1, home: 'landmark:brightwatch-house', presentWhen: CAN,
    dialogue: [
      { when: at('quest:cantor-the-jars-of-night', 'canvass'), dialogue: 'dialogue:cantor-bellamy-canvass' },
      { dialogue: 'dialogue:cantor-bellamy' },
    ],
    barks: [{ lines: ['Two shards for the word. Sorry. It’s the law.', 'Fines on the left, bounties on the right.', 'I dreamed I was a boat again. Don’t write that down.'] }],
    roles: ['quest'],
    look: { skin: 0xd8a888, hair: 0x5a4a3a, cloth: 0xf0e8d0, accent: 0xd0b060, build: 'broad' },
    bio: 'A sergeant of the Brightwatch who must fine anyone who says the word for it, and fines himself every morning for dreaming. He apologises to everyone he arrests and means it every time.',
  },
  {
    id: 'npc:prue-haverlock', name: 'Prue Haverlock', title: 'Pilgrim from the Gilded March', school: 'radiance', origin: 'radiance', trust: 2,
    region: Z1, home: 'landmark:close-steps',
    presentWhen: { all: [CAN, { not: { flag: 'cantor.prue_home' } }] },
    dialogue: [{ dialogue: 'dialogue:cantor-prue' }],
    barks: [{ lines: ['Stars, I tell you. Like spilled salt.', 'Three weeks I walked. Nobody lets me finish.'] }],
    roles: ['quest'],
    look: { skin: 0xc89070, hair: 0xb8743a, cloth: 0x8a6a3a, accent: 0xffd96b, build: 'broad' },
    bio: 'A farmer’s wife from the Gilded March who walked three weeks to Dawnspire to report a miracle: the Dimming has stars in it. The Brightwatch would very much like her to stop saying so.',
  },
  {
    id: 'npc:tobit-lark', name: 'Novice Tobit Lark', title: 'of the Cathedral Choir', school: 'radiance', origin: 'radiance', trust: 3,
    region: Z2, home: 'landmark:choir-dormitory',
    presentWhen: { all: [CAN, { not: { flag: 'story.gate_open' } }] },
    dialogue: [{ dialogue: 'dialogue:cantor-tobit' }],
    barks: [{ lines: ['I’m awake! I’m awake.', 'Is it the amen yet?', '(He is asleep on his feet, mouthing the psalm.)'] }],
    roles: ['quest'],
    look: { skin: 0xe8c4a8, hair: 0xc8a050, cloth: 0xf0e8d0, accent: 0xffd96b, build: 'slight' },
    bio: 'A fifteen-year-old tenor in the Cathedral Choir who has never slept a whole night in his life, and is the best napper in Dawnspire. He can fall asleep between the amen and the next hymn.',
  },
  {
    id: 'npc:lambert-dewhurst', name: 'Brother Lambert Dewhurst', title: 'Gardener of the Cloisters', school: 'radiance', origin: 'radiance', trust: 2,
    region: Z2, home: 'landmark:moonflower-bed', presentWhen: CAN,
    dialogue: [
      { when: at('quest:cantor-the-jars-of-night', 'canvass'), dialogue: 'dialogue:cantor-lambert-canvass' },
      { when: at('quest:cantor-madame-lulls-draughts', 'infirmary'), dialogue: 'dialogue:cantor-lambert-crate' },
      { dialogue: 'dialogue:cantor-lambert' },
    ],
    barks: [{ lines: ['Mind the moonflowers. They’re resting.', 'Most of gardening is waiting. The rest is slugs.'] }],
    roles: ['quest'],
    look: { skin: 0xb88a6a, hair: 0xd0d0c8, cloth: 0x8a7a5a, accent: 0x6aa84f, build: 'short' },
    bio: 'The Choir’s old gardener, who has watered a bed of moonflowers every morning for thirty years though they only open at night, and there has not been one.',
  },
  {
    id: 'npc:dovina-lull', name: 'Madame Dovina Lull', title: 'Purveyor of Lulling Draughts', school: 'radiance', origin: 'radiance', trust: 2,
    region: Z3, home: 'landmark:lull-cart',
    presentWhen: { all: [CAN, { not: { flag: 'cantor.lull' } }] },
    dialogue: [{ dialogue: 'dialogue:cantor-lull' }],
    barks: [{ lines: ['Three drops and you’ll sleep like a stone in a well.', 'I’m not here. One shard for the not-seeing.', 'Mostly chamomile. A great deal of sincerity.'] }],
    roles: ['quest'],
    look: { skin: 0xe0b898, hair: 0x7a2a5a, cloth: 0x4a3a7a, accent: 0x9ad0ff, build: 'average' },
    bio: 'A seller of sleep-draughts in a city where sleep is forbidden, working from a painted cart that never stays put. She drops little blue bottles in the gutters for her regulars, so they can find her.',
  },
  {
    id: 'npc:albin-mote', name: 'Albin Mote', title: 'Grocer of the Sunward Market', school: 'radiance', origin: 'radiance', trust: 2,
    region: Z3, home: 'landmark:mote-stall', presentWhen: CAN,
    dialogue: [{ dialogue: 'dialogue:cantor-albin' }],
    barks: [{ lines: ['Forty-one years and never shut. Not once.', 'Apples, cheese, onions. They’re a bit tired.'] }],
    roles: ['quest'],
    look: { skin: 0xc8946e, hair: 0x9a9a9a, cloth: 0x6a5a3a, accent: 0xd06a3a, build: 'broad' },
    bio: 'A grocer who has kept the same stall in the Sunward Market for forty-one years without once closing it, because the Market Charter forbids it. He would like, just once, to put up the shutters and eat an onion in peace.',
  },
  {
    id: 'npc:orla-penwright', name: 'Old Orla Penwright', title: 'of the Undercroft', school: 'radiance', origin: 'radiance', trust: 2,
    region: Z4, home: 'landmark:orla-alcove',
    presentWhen: { all: [CAN, { questCompleted: 'quest:cantor-the-inquisitors-kindness' }] },
    dialogue: [{ dialogue: 'dialogue:cantor-orla' }],
    barks: [{ lines: ['Come where I can not-see you.', 'Dark’s the same as light to me. Only quieter.'] }],
    roles: ['quest'],
    look: { skin: 0xd8c0a8, hair: 0xf0ece4, cloth: 0x5a5a6a, accent: 0xb0b0c0, build: 'slight' },
    bio: 'A nearly blind old woman who moved down into the Undercroft when her eyes went, because the dark there is the same as the light for her, only quieter. Sister Amabel brings her soup.',
  },

  // ---------- Act II (Concordia)
  {
    id: 'npc:ysmay-penhallow', name: 'Mother Ysmay Penhallow', title: 'of the Shore Chapel', school: 'radiance', origin: 'radiance', trust: 2,
    services: ['Blessings', 'Hour-hymns'], region: 'region:abbey', home: 'landmark:shore-chapel',
    presentWhen: ACT2,
    // C-1: after the escort she stays at the end of the causeway to listen; C-3: she goes back there when the lake falls quiet
    schedule: [{ from: 0, to: 24, at: 'landmark:cantor-causeway-end', activity: 'idle', when: { any: [at('quest:cantor-abbeyshore', 'listen'), at('quest:cantor-abbess-morwen', 'tell')] } }],
    dialogue: [
      { when: at('quest:cantor-abbeyshore', 'listen'), dialogue: 'dialogue:cantor-ysmay-causeway' },
      { when: at('quest:cantor-abbess-morwen', 'tell'), dialogue: 'dialogue:cantor-ysmay-quiet' },
      { when: at('quest:cantor-abbeyshore', 'chapel'), dialogue: 'dialogue:cantor-ysmay' },
      { when: at('quest:cantor-the-light-in-the-wood', 'ysmay'), dialogue: 'dialogue:cantor-ysmay' },
      { dialogue: 'dialogue:radiance-ysmay' },
    ],
    barks: [{ lines: ['We sing the hours to the lake. The lake sings back.', 'Mind the step. It’s been wet for thirty years.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b8a0, hair: 0xe0dcd4, cloth: 0xe8e0c8, accent: 0x7ab0c8, build: 'short' },
    bio: 'The old mother of the Shore Chapel at Abbeyshore, where the Radiance folk stranded in Concordia have sung the hours towards the drowned Abbey for thirty years. Every hour, from under the water, the drowned choir sings back.',
  },
  {
    id: 'npc:dovina-lull-shore', name: 'Madame Dovina Lull', title: 'Lullabies for the Drowned', school: 'radiance', origin: 'radiance', trust: 3,
    region: 'region:abbey', home: 'landmark:shore-tide-kettle',
    presentWhen: { all: [CAN, ACT2, { flag: 'cantor.lull', value: 'helped' }] },
    schedule: [{ from: 0, to: 24, at: 'landmark:gate-circle', activity: 'idle', when: { all: [{ questActive: 'quest:cantor-celestines-lullaby' }, LULL_SMUGGLES] } }],
    dialogue: [
      { when: { all: [at('quest:cantor-celestines-lullaby', 'letter'), LULL_SMUGGLES] }, dialogue: 'dialogue:cantor-lullaby-lull' },
      { when: { all: [at('quest:cantor-celestines-lullaby', 'reply'), LULL_SMUGGLES] }, dialogue: 'dialogue:cantor-reply-lull' },
      { dialogue: 'dialogue:cantor-lull-shore' },
    ],
    barks: [{ lines: ['One shard a verse, darling.', 'The drowned never complain. Best customers I’ve ever had.'] }],
    roles: ['ambient'],
    look: { skin: 0xe0b898, hair: 0x7a2a5a, cloth: 0x4a3a7a, accent: 0x9ad0ff, build: 'average' },
    bio: 'Madame Lull took her cart down the Undercroft stair, out through the Dawn Gate behind you, and all the way to Abbeyshore, where she sells lullabies to the drowned choir from outside the Tide Kettle.',
  },
  {
    id: 'npc:tobit-lark-gate', name: 'Novice Tobit Lark', title: 'a long way from the Choir', school: 'radiance', origin: 'radiance', trust: 3,
    region: 'region:alder', home: 'landmark:gate-circle',
    presentWhen: { all: [CAN, { questActive: 'quest:cantor-celestines-lullaby' }, { not: LULL_SMUGGLES }] },
    dialogue: [
      { when: at('quest:cantor-celestines-lullaby', 'reply'), dialogue: 'dialogue:cantor-reply-tobit' },
      { dialogue: 'dialogue:cantor-lullaby-tobit' },
    ],
    barks: [{ lines: ['I slept in a hedge! A real hedge!', '(He is asleep against the Radiance arch.)'] }],
    roles: ['quest'],
    look: { skin: 0xe8c4a8, hair: 0xc8a050, cloth: 0xf0e8d0, accent: 0xffd96b, build: 'slight' },
    bio: 'Tobit Lark walked the whole Dawn Road with Celestine’s letter held to his chest, and slept in a hedge for the first time in his life on the way. He thinks Concordia is wonderful. He has not been awake for most of it.',
  },
  {
    id: 'npc:tobit-lark-heart', name: 'Novice Tobit Lark', title: 'asleep at the end of the world', school: 'radiance', origin: 'radiance', trust: 3,
    region: 'region:heart', home: 'landmark:legion-camp',
    presentWhen: { all: [CAN, { questActive: 'quest:cantor-tobit-lark-falls-asleep' }] },
    schedule: [
      { from: 0, to: 24, at: 'landmark:heart-camp', activity: 'sleep', when: at('quest:cantor-tobit-lark-falls-asleep', 'camp') },
      // he sleepwalks up the Twelve Stairs, "for the good bit"
      { from: 0, to: 24, at: 'landmark:twelve-stairs-top', activity: 'idle', when: at('quest:cantor-tobit-lark-falls-asleep', 'stairs') },
    ],
    dialogue: [
      { when: at('quest:cantor-tobit-lark-falls-asleep', 'stairs'), dialogue: 'dialogue:cantor-tobit-stairs' },
      { dialogue: 'dialogue:cantor-tobit-heart' },
    ],
    barks: [{ lines: ['(He is asleep.)', 'Is it the amen yet?'] }],
    roles: ['quest'],
    look: { skin: 0xe8c4a8, hair: 0xc8a050, cloth: 0xf0e8d0, accent: 0xffd96b, build: 'slight' },
    bio: 'Tobit Lark followed the hero through the Dawn Gate and all the way to the Heart, and fell asleep in the middle of the Hollow Legion. The hollowed have tucked him in.',
  },
  {
    id: 'npc:lucan-in-the-wood', name: 'Inquisitor Lucan Brightwater', title: 'at Stag’s Rest', school: 'radiance', origin: 'radiance', trust: 2,
    region: 'region:gloam', home: 'landmark:sentinel-verdant',
    presentWhen: { all: [CAN, { questActive: 'quest:cantor-the-light-in-the-wood' }] },
    dialogue: [{ dialogue: 'dialogue:cantor-lucan-wood' }],
    barks: [{ lines: ['A little more light and she’ll be clean.', 'Harder before better.'] }],
    roles: ['quest'],
    look: { skin: 0xe8d0b8, hair: 0xe8d890, cloth: 0xf8f4e8, accent: 0x2a2a30, build: 'tall' },
    bio: 'Lucan came through the Dawn Gate behind you, and has set up a lens the size of a cartwheel in front of the Weeping Willow, to burn the tears out of her.',
  },
];

export default npcs;
