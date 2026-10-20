/**
 * Hollow Crown, the Greywilds: Antlerford NPCs for the Huntsman campaign (docs/lore/hollow-crown/06-outlines/hunt.md),
 * plus the Huntsman's Concordia NPCs (Hollis Lodge, the C-4 informant, the C-6 messenger).
 * Zones: zone:hunt-capital-1 the Lodge Yards, -2 the Tannery Lanes, -3 the Elkway, -4 the Old Snares. Owner: Claude 4.
 */
import type { NarrativeCondition, NpcDef } from '@/core';

const HS: NarrativeCondition = { heroClass: 'huntsman' };
const at = (q: `quest:${string}`, stage: string): NarrativeCondition => ({ questStage: q, stage });
const Z1 = 'zone:hunt-capital-1' as const, Z2 = 'zone:hunt-capital-2' as const, Z3 = 'zone:hunt-capital-3' as const, Z4 = 'zone:hunt-capital-4' as const;
const ACT2: NarrativeCondition = { flag: 'story.act', op: '>=', value: 2 };

const npcs: NpcDef[] = [
  {
    id: 'npc:ulric-bannock', name: 'Ulric Bannock', title: 'Master of the Great Lodge', school: 'hunt', origin: 'hunt', trust: 2,
    services: ['Mentor', 'Trains Huntsmen'], region: Z1, home: 'landmark:bannock-hearth', lore: 'lore:hc-ulric-bannock',
    presentWhen: HS,
    schedule: [
      { from: 0, to: 24, at: 'landmark:trophy-hall-gates', activity: 'idle', when: at('quest:huntsman-the-bell-in-the-antlers', 'bannock') },
      { from: 0, to: 24, at: 'landmark:great-lodge-hall', activity: 'idle', when: at('quest:huntsman-the-old-law', 'vote') },
      { from: 0, to: 24, at: 'landmark:elkway-tally-stone', activity: 'idle', when: { any: [at('quest:huntsman-count-the-herd', 'stone'), at('quest:huntsman-count-the-herd', 'elk'), at('quest:huntsman-count-the-herd', 'tracks')] } },
      { from: 0, to: 24, at: 'landmark:great-lodge-hall', activity: 'idle', when: { questActive: 'quest:huntsman-biscuits-hunt' } },
      { from: 0, to: 24, at: 'landmark:elkway-tally-stone', activity: 'idle', when: at('quest:huntsman-the-last-count', 'count') },
    ],
    dialogue: [
      { when: at('quest:huntsman-the-bell-in-the-antlers', 'bannock'), dialogue: 'dialogue:huntsman-bannock-bell' },
      { when: at('quest:huntsman-the-bell-in-the-antlers', 'hearth'), dialogue: 'dialogue:huntsman-bannock-hearth' },
      { when: at('quest:huntsman-gloves-for-a-giant', 'fitting'), dialogue: 'dialogue:huntsman-bannock-fitting' },
      { when: at('quest:huntsman-count-the-herd', 'report'), dialogue: 'dialogue:huntsman-bannock-herd' },
      { when: at('quest:huntsman-the-poachers-camp', 'report'), dialogue: 'dialogue:huntsman-bannock-pelts' },
      { when: at('quest:huntsman-the-barons-bonfire', 'bannock'), dialogue: 'dialogue:huntsman-bannock-debts' },
      { when: at('quest:huntsman-the-old-law', 'vote'), dialogue: 'dialogue:huntsman-old-law' },
      { when: at('quest:huntsman-the-empty-wall', 'bannock'), dialogue: 'dialogue:huntsman-bannock-tags' },
      { when: at('quest:huntsman-the-last-count', 'count'), dialogue: 'dialogue:huntsman-bannock-farewell' },
      { when: at('quest:huntsman-biscuits-hunt', 'bannock'), dialogue: 'dialogue:huntsman-bannock-biscuit' },
      { when: at('quest:huntsman-the-herd-road-cairns', 'bannock'), dialogue: 'dialogue:huntsman-bannock-cairns' },
      { when: at('quest:huntsman-gloves-for-a-giant', 'measure'), dialogue: 'dialogue:huntsman-bannock-gloves' },
      { dialogue: 'dialogue:huntsman-bannock' },
    ],
    barks: [{ lines: ['Mind the dog. She’s friendly. She’s also blind on the left.', 'Two elk, a fox. Two elk, a fox. That isn’t a herd.', 'The old law is short. That’s why nobody reads it.'] }],
    roles: ['quest', 'trainer'], essential: true,
    look: { skin: 0xc8946e, hair: 0x8a6a4a, cloth: 0x6e5a28, accent: 0xd9b45a, build: 'broad' },
    bio: 'Master of the Great Lodge, enormous, soft-spoken and very shy. He has walked the Elkway every autumn for fifty years to count the herd, and for thirty of them the count has gone down. His deerhound Biscuit is fourteen and has never caught anything.',
  },
  {
    id: 'npc:biscuit', name: 'Biscuit', title: 'an elderly deerhound', school: 'hunt', origin: 'hunt',
    region: Z1, home: 'landmark:bannock-hearth', presentWhen: HS,
    schedule: [{ from: 0, to: 24, at: 'landmark:great-lodge-hall', activity: 'idle', when: { questActive: 'quest:huntsman-biscuits-hunt' } }],
    dialogue: [
      { when: at('quest:huntsman-biscuits-hunt', 'biscuit'), dialogue: 'dialogue:huntsman-biscuit-hare' },
      { dialogue: 'dialogue:huntsman-biscuit' },
    ],
    barks: [{ lines: ['(Biscuit leans her whole weight against your legs.)', '(She sniffs your boots, thoroughly, for news.)', '(Her tail goes once, slowly, like a door in the wind.)'] }],
    roles: ['ambient'],
    look: { skin: 0x9a9a8a, cloth: 0x6e5a28, build: 'tall' },
    bio: 'Ulric Bannock’s deerhound: grey in the muzzle, long in the leg and gentle in every direction. In fourteen years she has never caught anything, and she has never minded.',
  },
  {
    id: 'npc:corva-ashby', name: 'Lady Corva Ashby', title: 'Trophy Baron of the Greywilds', school: 'hunt', origin: 'hunt', trust: 2,
    region: Z2, home: 'landmark:trophy-hall-gates', lore: 'lore:hc-corva-ashby',
    // Act I in Antlerford; Act III, beaten on the stair top, waiting for her fate (the scene must be reopenable),
    // then, if spared, at the Heart camp for the Gamekeeper
    presentWhen: { all: [HS, { any: [{ not: { flag: 'huntsman.halfstone' } }, at('quest:huntsman-the-antlered-chimera', 'fate'), at('quest:huntsman-the-gamekeeper', 'corva')] }] },
    schedule: [
      { from: 0, to: 24, at: 'landmark:twelve-stairs-top', activity: 'idle', when: at('quest:huntsman-the-antlered-chimera', 'fate') },
      { from: 0, to: 24, at: 'landmark:heart-camp', activity: 'idle', when: at('quest:huntsman-the-gamekeeper', 'corva') },
      { from: 0, to: 24, at: 'landmark:lusk-tannery', activity: 'idle', when: at('quest:huntsman-the-barons-bonfire', 'fire') },
      { from: 0, to: 24, at: 'landmark:huntsman-baron-hide', activity: 'idle', when: { any: [at('quest:huntsman-the-barons-bonfire', 'hide'), at('quest:huntsman-the-barons-bonfire', 'shot')] } },
    ],
    dialogue: [
      { when: at('quest:huntsman-the-antlered-chimera', 'fate'), dialogue: 'dialogue:huntsman-herald-fate' },
      { when: at('quest:huntsman-the-gamekeeper', 'corva'), dialogue: 'dialogue:huntsman-corva-heart' },
      { when: at('quest:huntsman-the-barons-bonfire', 'fire'), dialogue: 'dialogue:huntsman-corva-bonfire' },
      { when: at('quest:huntsman-the-barons-bonfire', 'shot'), dialogue: 'dialogue:huntsman-corva-hide' },
      { when: at('quest:huntsman-the-empty-wall', 'corva'), dialogue: 'dialogue:huntsman-corva-wall' },
      { when: at('quest:huntsman-the-gamekeepers-notice', 'corva'), dialogue: 'dialogue:huntsman-corva-notice' },
      { dialogue: 'dialogue:huntsman-corva' },
    ],
    barks: [{ lines: ['Somebody has to do it properly. It may as well be me.', 'Burn them all. I’ll pay for the wood.', 'I never miss. It’s not a boast. I’ve simply never missed.'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xe8c8b0, hair: 0x1a1a1a, cloth: 0x2a3a2a, accent: 0xc8a050, build: 'tall' },
    bio: 'The richest of the Trophy Barons, who hunts alone, never misses and pays every bill on the day it falls due. Her Trophy Hall holds more mounted heads than any in the Greywilds. She is generous, exact and very polite, and nobody has ever seen her laugh.',
  },
  {
    id: 'npc:grandfer-lumm', name: 'Grandfer Lumm', title: 'Oldest Huntsman of the Lodge', school: 'hunt', origin: 'hunt', trust: 2,
    region: Z1, home: 'landmark:great-lodge-hall', presentWhen: HS,
    dialogue: [
      { when: at('quest:huntsman-grandfer-lumms-hat', 'lumm'), dialogue: 'dialogue:huntsman-lumm-verdict' },
      { dialogue: 'dialogue:huntsman-lumm' },
    ],
    barks: [{ lines: ['In my hat. A boar. Ask anyone. Ask anyone who was there, which was me.', 'When I was a lad the herd took three days to cross the Elkway.', 'Bigger than this. No, bigger.'] }],
    roles: ['quest'],
    look: { skin: 0xd8a888, hair: 0xe8e4dc, cloth: 0x5a4a2a, accent: 0xb08a3a, build: 'short' },
    bio: 'The oldest Huntsman in the Lodge, ninety if he is a day, who has told the story of the boar in his hat at every feast for sixty years. It gets bigger every time. The boar, not the hat.',
  },
  {
    id: 'npc:jem-furlong', name: 'Kennelmaster Jem Furlong', title: 'of the Lodge Kennels', school: 'hunt', origin: 'hunt', trust: 2,
    region: Z1, home: 'landmark:antlerford-kennels', presentWhen: HS,
    dialogue: [
      { when: at('quest:huntsman-the-old-law', 'canvass'), dialogue: 'dialogue:huntsman-jem-canvass' },
      { when: at('quest:huntsman-hounds-facing-east', 'jem'), dialogue: 'dialogue:huntsman-jem-hounds' },
      { dialogue: 'dialogue:huntsman-jem' },
    ],
    barks: [{ lines: ['Forty hounds and not one will take a scent.', 'East. They all lie facing east. I turn them round and they turn back.', 'Good dog. Good dog. Please hunt.'] }],
    roles: ['quest'],
    look: { skin: 0xb88a6a, hair: 0x6a4a2a, cloth: 0x4a3a20, accent: 0xd9b45a, build: 'average' },
    bio: 'Kennelmaster of the Great Lodge, who knows every hound by name, smell and opinion. Since the Bell rang, not one of his forty hounds will hunt.',
  },
  {
    id: 'npc:griselda-lusk', name: 'Tanner Mistress Griselda Lusk', title: 'of the Tannery Lanes', school: 'hunt', origin: 'hunt', trust: 1,
    region: Z2, home: 'landmark:lusk-tannery', presentWhen: HS,
    dialogue: [
      { when: at('quest:huntsman-the-old-law', 'canvass'), dialogue: 'dialogue:huntsman-lusk-canvass' },
      { when: at('quest:huntsman-the-back-room', 'lusk'), dialogue: 'dialogue:huntsman-lusk-back-room' },
      { dialogue: 'dialogue:huntsman-lusk' },
    ],
    barks: [{ lines: ['Front of the shop is for looking. Back of the shop is for nobody.', 'Hides don’t tan themselves. Unlike some people’s hides, which I could tan for them.'] }],
    roles: ['quest'],
    look: { skin: 0xc0906a, hair: 0x8a3a1a, cloth: 0x5a3a2a, accent: 0x8a6a3a, build: 'broad' },
    bio: 'The biggest tanner in the Tannery Lanes, with forearms like hams and a back room nobody is allowed into. Business has been very good since the tears came, and she has stopped asking why.',
  },
  {
    id: 'npc:dabney-flinders', name: 'Dabney Flinders', title: 'Apprentice Tanner', school: 'hunt', origin: 'hunt', trust: 2,
    region: Z2, home: 'landmark:lusk-tannery', presentWhen: HS,
    dialogue: [
      { when: at('quest:huntsman-the-back-room', 'dabney'), dialogue: 'dialogue:huntsman-dabney-done' },
      { dialogue: 'dialogue:huntsman-dabney' },
    ],
    barks: [{ lines: ['I smell of tannery. Everyone smells of tannery. It’s fine.', 'Don’t tell the Mistress I talked to you.'] }],
    roles: ['quest'],
    look: { skin: 0xe8c4a8, hair: 0x4a3a2a, cloth: 0x6a5a3a, accent: 0x8a6a3a, build: 'slight' },
    bio: 'Griselda Lusk’s apprentice, sixteen and nervous, who scrapes hides in the yard and has noticed that the people who buy from the back room stop coming in to chat.',
  },
  {
    id: 'npc:aldith-pockle', name: 'Mistress Aldith Pockle', title: 'Glover of the Tannery Lanes', school: 'hunt', origin: 'hunt', trust: 2,
    region: Z2, home: 'landmark:pockle-glovers', presentWhen: HS,
    dialogue: [
      { when: at('quest:huntsman-gloves-for-a-giant', 'pockle'), dialogue: 'dialogue:huntsman-pockle-gloves' },
      { dialogue: 'dialogue:huntsman-pockle' },
    ],
    barks: [{ lines: ['Sixty years I’ve fitted hands. Every hand in Antlerford but one.', 'Hold still. Not you. Him. Well, you too.'] }],
    roles: ['quest'],
    look: { skin: 0xe0c0a8, hair: 0xd8d8d0, cloth: 0x6a3a4a, accent: 0xd9b45a, build: 'short' },
    bio: 'The finest glover in Antlerford, eighty-one years old and nearly blind, who measures by touch. She has fitted every hand in the town except Ulric Bannock’s, and it has bothered her for forty years.',
  },
  {
    id: 'npc:quentin-snipe', name: 'Quentin Snipe', title: 'Gamekeeper to Lady Ashby', school: 'hunt', origin: 'hunt', trust: 1,
    region: Z3, home: 'landmark:gamekeepers-lodge', presentWhen: HS,
    schedule: [{ from: 0, to: 24, at: 'landmark:heart-camp', activity: 'idle', when: { questActive: 'quest:huntsman-the-gamekeeper' } }],
    dialogue: [
      { when: { questActive: 'quest:huntsman-the-gamekeeper' }, dialogue: 'dialogue:huntsman-snipe-heart' },
      { when: at('quest:huntsman-the-gamekeepers-notice', 'snipe'), dialogue: 'dialogue:huntsman-snipe-free' },
      { dialogue: 'dialogue:huntsman-snipe' },
    ],
    barks: [{ lines: ['I’ve written it nine times. The tenth will be the one.', 'She’s not cruel. I don’t know what she is.', 'Mind the calf. Don’t touch it. Nobody touch it.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b090, hair: 0x9a7a4a, cloth: 0x3a4a2a, accent: 0x8a8a6a, build: 'slight' },
    bio: 'Lady Corva Ashby’s gamekeeper for twenty years: a thin, careful man who has written his notice nine times and handed it in none of them.',
  },
  {
    id: 'npc:hedda-crake', name: 'Hedda Crake', title: 'Charcoal-burner of the Old Snares', school: 'hunt', origin: 'hunt', trust: 1,
    region: Z4, home: 'landmark:charcoal-burners-hut', presentWhen: HS,
    dialogue: [
      { when: at('quest:huntsman-unstringing', 'hedda'), dialogue: 'dialogue:huntsman-hedda-snares' },
      { when: at('quest:huntsman-the-first-letter', 'hedda'), dialogue: 'dialogue:huntsman-hedda-letter' },
      { dialogue: 'dialogue:huntsman-hedda' },
    ],
    barks: [{ lines: ['Thirty years I’ve burned charcoal out here and never once been snared. I look where I put my feet.', 'That snare’s been swearing at me since Tuesday.'] }],
    roles: ['quest'],
    look: { skin: 0x8a6a5a, hair: 0x3a3a3a, cloth: 0x2a2a20, accent: 0x6a5a3a, build: 'average' },
    bio: 'A charcoal-burner who lives alone in the Old Snares, black to the elbows, and steps round the poachers’ lines without looking. She has been meaning to cut them down for years.',
  },
  {
    id: 'npc:hesketh-ruddock', name: 'Tallykeeper Hesketh Ruddock', title: 'Keeper of the Lodge Tally', school: 'hunt', origin: 'hunt', trust: 1,
    region: Z1, home: 'landmark:lodge-tally-board', presentWhen: HS,
    dialogue: [
      { when: at('quest:huntsman-grandfer-lumms-hat', 'tally'), dialogue: 'dialogue:huntsman-ruddock-boar' },
      { dialogue: 'dialogue:huntsman-ruddock' },
    ],
    barks: [{ lines: ['Bounties on the board. Paid by the head. Heads counted twice.', 'One tick, two ticks. I can do this all day.'] }],
    roles: ['quest'],
    look: { skin: 0xd0a080, hair: 0x5a4a3a, cloth: 0x4a4a2a, accent: 0xb08a3a, build: 'average' },
    bio: 'The Lodge’s tallykeeper, who records every kill, every bounty and every bet, and has never once let a number go uncounted.',
  },
  // ---------- Act II (Concordia)
  {
    id: 'npc:thaddeus-hollis', name: 'Thaddeus Hollis', title: 'Keeper of Hollis Lodge', school: 'hunt', origin: 'hunt', trust: 1,
    region: 'region:gloam', home: 'landmark:lodge-hunters-lodge',
    presentWhen: ACT2,
    // C-2: after the escort he stands at the head of the Stag's trail until the hero comes back
    schedule: [{ from: 0, to: 24, at: 'landmark:huntsman-trail-head', activity: 'idle', when: { all: [HS, { any: [at('quest:huntsman-the-stags-road', 'hear'), at('quest:huntsman-the-stags-road', 'trail'), at('quest:huntsman-the-stags-road', 'cold')] }] } }],
    dialogue: [
      { when: at('quest:huntsman-hollis-lodge', 'lodge'), dialogue: 'dialogue:huntsman-thaddeus' },
      { when: at('quest:huntsman-the-stags-road', 'hear'), dialogue: 'dialogue:huntsman-thaddeus-trail' },
      { when: at('quest:huntsman-the-white-stag', 'tell'), dialogue: 'dialogue:huntsman-thaddeus-stag' },
      { when: at('quest:huntsman-the-stags-road', 'cold'), dialogue: 'dialogue:huntsman-thaddeus-cold' },
      { dialogue: 'dialogue:hunt-thaddeus' },
    ],
    barks: [{ lines: ['Thirty years and nobody left to teach the old law. We hunt by guesswork now.', 'Maren’s off again. She’s always off.', 'Hollis Lodge. Last Hunt lodge this side of the arches.'] }],
    roles: ['quest'],
    look: { skin: 0xc8946e, hair: 0xd8d8d0, cloth: 0x5a4a28, accent: 0xd9b45a, build: 'average' },
    bio: 'Maren Hollis’s great-uncle and the keeper of Hollis Lodge, the last Hunt lodge in Concordia. His father first brought him over from the Greywilds as a boy, for a Turning, and he was on this side when the arches shut.',
  },
  {
    id: 'npc:joss-amblin', name: 'Joss Amblin', title: 'Pelt Trader of Hollis Lodge', school: 'hunt', origin: 'concord', trust: 1,
    region: 'region:gloam', home: 'landmark:lodge-pelt-trader',
    presentWhen: ACT2,
    dialogue: [
      { when: at('quest:huntsman-the-barons-list', 'joss'), dialogue: 'dialogue:huntsman-joss' },
      { dialogue: 'dialogue:hunt-joss' },
    ],
    barks: [{ lines: ['Pelts bought, pelts sold. No black ones. I’ve standards.', 'Lovely bit of fox, that. Don’t ask whose.'] }],
    roles: ['quest', 'merchant'],
    look: { skin: 0xd0a080, hair: 0x2a1a14, cloth: 0x6a4a2a, accent: 0xb08a3a, build: 'broad' },
    bio: 'The pelt trader at Hollis Lodge, a cheerful, sharp-eyed Concordian who buys and sells anything with fur on it except the weeping kind.',
  },
  {
    id: 'npc:sorrel', name: 'Sorrel', title: 'a Hawkmoor goshawk', school: 'hunt', origin: 'hunt', trust: 2,
    region: 'region:alder', home: 'landmark:gate-circle',
    presentWhen: { all: [HS, { questActive: 'quest:huntsman-a-letter-by-hawk' }] },
    dialogue: [{ dialogue: 'dialogue:huntsman-sorrel-letter' }],
    barks: [{ lines: ['(The hawk looks at you as if you are late.)', '(It holds up one foot, with a letter tied to it, very pointedly.)'] }],
    roles: ['quest'],
    look: { skin: 0x8a7a6a, cloth: 0xd8d0b8, accent: 0xd9b45a, build: 'slight' },
    bio: 'The Falconer bearer’s goshawk, who has carried a letter from Antlerford over the Antler Gate and across Concordia, and would like that noticed.',
  },
];

export default npcs;
