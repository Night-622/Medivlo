/**
 * Hollow Crown, Steelvale: Edgewater NPCs for the Swordsman campaign (docs/lore/hollow-crown/06-outlines/blade.md),
 * plus the Swordsman’s Concordia NPCs (the Blade folk at Rook’s Watch House; Percy’s C-6 visit). Zones:
 * zone:blade-capital-1 the Fencing Quarter, -2 the Duelling Bridges, -3 the Riverside Salles, -4 the Old Armoury.
 * Owner: Claude 4.
 */
import type { NarrativeCondition, NpcDef } from '@/core';

const SW: NarrativeCondition = { heroClass: 'swordsman' };
const at = (q: `quest:${string}`, stage: string): NarrativeCondition => ({ questStage: q, stage });
const ACT2: NarrativeCondition = { flag: 'story.act', op: '>=', value: 2 };
const Z1 = 'zone:blade-capital-1' as const, Z2 = 'zone:blade-capital-2' as const, Z3 = 'zone:blade-capital-3' as const, Z4 = 'zone:blade-capital-4' as const;

const npcs: NpcDef[] = [
  {
    id: 'npc:lucia-ferro', name: 'Maestra Lucia Ferro', title: 'Retired champion of the Ladder', school: 'blade', origin: 'blade', trust: 2,
    services: ['Mentor', 'Trains Swordsmen'], region: Z1, home: 'landmark:ferro-salle', lore: 'lore:hc-lucia-ferro',
    presentWhen: SW,
    schedule: [
      { from: 0, to: 24, at: 'landmark:ladder-board', activity: 'idle', when: { any: [at('quest:swordsman-the-bell-on-the-ladder', 'ferro'), at('quest:swordsman-the-ladder-vote', 'vote')] } },
      { from: 0, to: 24, at: 'landmark:grand-salle-steps', activity: 'idle', when: { any: [at('quest:swordsman-the-hand-that-quit', 'piste'), at('quest:swordsman-the-hand-that-quit', 'ferro')] } },
    ],
    dialogue: [
      { when: at('quest:swordsman-the-bell-on-the-ladder', 'ferro'), dialogue: 'dialogue:swordsman-ferro-bell' },
      { when: at('quest:swordsman-the-bell-on-the-ladder', 'salle'), dialogue: 'dialogue:swordsman-ferro-salle-night' },
      { when: at('quest:swordsman-a-sheath-for-once', 'gift'), dialogue: 'dialogue:swordsman-ferro-scabbard' },
      { when: at('quest:swordsman-strike-them-off', 'report'), dialogue: 'dialogue:swordsman-ferro-chalk' },
      { when: at('quest:swordsman-the-saints-tomb', 'report'), dialogue: 'dialogue:swordsman-ferro-saint' },
      { when: at('quest:swordsman-the-champions-salute', 'ferro'), dialogue: 'dialogue:swordsman-ferro-only-loss' },
      { when: at('quest:swordsman-the-last-lesson', 'lesson'), dialogue: 'dialogue:swordsman-ferro-farewell' },
      { when: at('quest:swordsman-the-hand-that-quit', 'ferro'), dialogue: 'dialogue:swordsman-ferro-steps' },
      { when: at('quest:swordsman-ferros-last-bout', 'ferro'), dialogue: 'dialogue:swordsman-ferro-yield' },
      { dialogue: 'dialogue:swordsman-ferro' },
    ],
    barks: [{ lines: ['Feet. FEET.', 'Anyone can start a fight. The art is in the other end.', 'Retired. Not quit. Retired.'] }],
    roles: ['quest', 'trainer'], essential: true,
    look: { skin: 0xd8b090, hair: 0x6a6a6a, cloth: 0x2a2a3a, accent: 0xc83a3a, build: 'slight' },
    bio: 'The only champion of the Ladder ever to retire. She beat Vellacourt on the night of the Hollowing, in the Fencing Hall, and walked away from the sword at the top, and has never said why. Her sword-hand has shaken ever since.',
  },
  {
    id: 'npc:auguste-vellacourt', name: 'Ser Auguste Vellacourt', title: 'Champion of the Ladder', school: 'blade', origin: 'blade', trust: 3,
    region: Z2, home: 'landmark:champions-bridge', lore: 'lore:hc-auguste-vellacourt',
    // Act I in Edgewater; Act III, beaten on the stair top, waiting for his fate (the scene must be reopenable)
    presentWhen: { all: [SW, { any: [{ not: { flag: 'swordsman.halfstone' } }, at('quest:swordsman-the-chimeras-champion', 'fate')] }] },
    schedule: [
      { from: 0, to: 24, at: 'landmark:twelve-stairs-top', activity: 'idle', when: at('quest:swordsman-the-chimeras-champion', 'fate') },
      { from: 0, to: 24, at: 'landmark:unended-gallery', activity: 'idle', when: at('quest:swordsman-the-unended', 'auguste') },
    ],
    dialogue: [
      { when: at('quest:swordsman-the-chimeras-champion', 'fate'), dialogue: 'dialogue:swordsman-herald-fate' },
      { when: at('quest:swordsman-the-champions-salute', 'bridge'), dialogue: 'dialogue:swordsman-vellacourt-salute' },
      { when: at('quest:swordsman-the-unended', 'auguste'), dialogue: 'dialogue:swordsman-vellacourt-unended' },
      { dialogue: 'dialogue:swordsman-vellacourt' },
    ],
    barks: [{ lines: ['Again!', 'Autograph? Everyone wants an autograph.', 'Give Lucia my love. Tell her: again.'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xe8c8a8, hair: 0xd8b04a, cloth: 0xf0ece0, accent: 0xd8b04a, build: 'tall' },
    bio: 'Champion of the Ladder, undefeated in thirty years but for one bout: gracious, funny, golden, and far better than anyone else alive. He signs autographs with a smiling face. He has never once let a duel end.',
  },
  {
    id: 'npc:cosimo-bracca', name: 'Maestro Cosimo Bracca', title: 'Chair of the Salles’ Council', school: 'blade', origin: 'blade', trust: 1,
    region: Z1, home: 'landmark:ladder-board', presentWhen: SW,
    dialogue: [
      { when: at('quest:swordsman-the-ladder-vote', 'vote'), dialogue: 'dialogue:swordsman-ladder-vote' },
      { when: at('quest:swordsman-the-insult-broker', 'cosimo'), dialogue: 'dialogue:swordsman-cosimo-apology' },
      { dialogue: 'dialogue:swordsman-cosimo' },
    ],
    barks: [{ lines: ['The Council sits when it must.', 'Please don’t raise a motion.'] }],
    roles: ['quest'],
    look: { skin: 0xc8a080, hair: 0x2a2a2a, cloth: 0x4a2a5a, accent: 0xd8b04a, build: 'broad' },
    bio: 'Master of the Salle Bracca and chair of the Salles’ Council, a large, tired man who has presided over thirty years of motions about the Ladder and carried none of them.',
  },
  {
    id: 'npc:percy-thimble', name: 'Percy Thimble', title: 'Tailor, rung 4,012', school: 'blade', origin: 'blade', trust: 3,
    region: Z1, home: 'landmark:thimble-shop', presentWhen: SW,
    dialogue: [
      { when: at('quest:swordsman-the-ladder-vote', 'canvass'), dialogue: 'dialogue:swordsman-percy-canvass' },
      { dialogue: 'dialogue:swordsman-percy' },
    ],
    barks: [{ lines: ['Rung 4,012! The very bottom!', 'Nine hundred and ninety-nine bouts. Next one’s my thousandth!', 'I can take your measurements while you fence. I’m very quick.'] }],
    roles: ['quest'],
    look: { skin: 0xe8c4a8, hair: 0x8a5a2a, cloth: 0x4a7a5a, accent: 0xe8c86a, build: 'short' },
    bio: 'A cheerful tailor of the Fencing Quarter and the lowest-ranked duellist on the Ladder, who has lost nine hundred and ninety-nine bouts and enjoyed nearly all of them.',
  },
  {
    id: 'npc:celandine-sallow', name: 'Madame Celandine Sallow', title: 'Insult Broker', school: 'blade', origin: 'blade', trust: 2,
    region: Z1, home: 'landmark:sallow-booth', presentWhen: SW,
    dialogue: [
      { when: at('quest:swordsman-the-champions-salute', 'sallow'), dialogue: 'dialogue:swordsman-sallow-customer' },
      { dialogue: 'dialogue:swordsman-celandine' },
    ],
    barks: [{ lines: ['Insults! Freshly sharpened!', 'Guaranteed to start a duel or your money back.'] }],
    roles: ['quest'],
    look: { skin: 0xe0b898, hair: 0x2a1a2a, cloth: 0x7a2a4a, accent: 0xe8a0c8, build: 'slight' },
    bio: 'Proprietor of the Quarter’s only insult booth, who sells pre-written provocations to duellists too busy to think of their own. Business has never been worse.',
  },
  {
    id: 'npc:ugo-fiore', name: 'Watch-Sergeant Ugo Fiore', title: 'of the Quarter Watch', school: 'blade', origin: 'blade', trust: 1,
    region: Z1, home: 'landmark:quarter-watch-post', presentWhen: SW,
    dialogue: [{ dialogue: 'dialogue:swordsman-ugo' }],
    barks: [{ lines: ['Bounties on the post.', 'We pay by the head. And by the goose, one memorable week.'] }],
    roles: ['quest'],
    look: { skin: 0xb8886a, hair: 0x3a2a20, cloth: 0x3a4a6a, accent: 0xb08a3a, build: 'broad' },
    bio: 'Sergeant of the Quarter Watch, which keeps order in a city where every quarrel is legally a duel. He posts the bounties and pays them, eventually.',
  },
  {
    id: 'npc:bettina-sarto', name: 'Bettina Sarto', title: 'of the Sisters’ Bridge', school: 'blade', origin: 'blade', trust: 1,
    region: Z2, home: 'landmark:sisters-bridge', presentWhen: SW,
    dialogue: [
      { when: at('quest:swordsman-the-ladder-vote', 'canvass'), dialogue: 'dialogue:swordsman-bettina-canvass' },
      { dialogue: 'dialogue:swordsman-bettina' },
    ],
    barks: [{ lines: ['Thirty years I’ve sat on this bank.', 'Not with your sword, please. She’s had enough swords.'] }],
    roles: ['quest'],
    look: { skin: 0xd0b098, hair: 0xe8e4dc, cloth: 0x2a2a2a, accent: 0xa0a0a0, build: 'slight' },
    bio: 'Eighty-one years old, Bettina has sat on the far bank of the Sisters’ Bridge every day for thirty years, waiting for her sister Rosa, who died there mid-duel and has not stopped fencing since.',
  },
  {
    id: 'npc:assunta-rill', name: 'Signora Assunta Rill', title: 'of Rill’s Bridge', school: 'blade', origin: 'blade', trust: 2,
    region: Z2, home: 'landmark:rills-bridge', presentWhen: SW,
    dialogue: [{ dialogue: 'dialogue:swordsman-assunta' }],
    barks: [{ lines: ['He hasn’t eaten since Thursday.', 'Bread, cheese, a little sausage. Is that so much to ask?'] }],
    roles: ['quest'],
    look: { skin: 0xc8946e, hair: 0x4a2a20, cloth: 0x8a4a2a, accent: 0xe8c86a, build: 'broad' },
    bio: 'Mother of Tommaso Rill, who holds the family bridge against all comers by law. She has been trying to give him his lunch for four days.',
  },
  {
    id: 'npc:tommaso-rill', name: 'Tommaso Rill', title: 'Holder of Rill’s Bridge', school: 'blade', origin: 'blade', trust: 2,
    region: Z2, home: 'landmark:rills-bridge', presentWhen: SW,
    dialogue: [{ dialogue: 'dialogue:swordsman-tommaso' }],
    barks: [{ lines: ['None shall pass!', '(His stomach rumbles.) That wasn’t me.'] }],
    roles: ['quest'],
    look: { skin: 0xd0a080, hair: 0x2a1a14, cloth: 0x6a2a2a, accent: 0xd8b04a, build: 'slight' },
    bio: 'Nineteen years old and holder of Rill’s Bridge, as his father and grandfather were. By law he must challenge everyone who crosses. Everyone.',
  },
  {
    id: 'npc:ottavio-grisi', name: 'Master Ottavio Grisi', title: 'of the Salle Grisi', school: 'blade', origin: 'blade', trust: 1,
    region: Z3, home: 'landmark:grisi-salle', presentWhen: SW,
    dialogue: [{ dialogue: 'dialogue:swordsman-grisi' }],
    barks: [{ lines: ['Eight sharp. Every morning.', 'The room has learned a great deal.'] }],
    roles: ['quest', 'trainer'],
    look: { skin: 0xd8b8a0, hair: 0xe8e4dc, cloth: 0x2a3a2a, accent: 0xc8c8c0, build: 'tall' },
    bio: 'Master of the Salle Grisi on the river, who has taught every morning at eight sharp for thirty years to an empty room, because the room has never once failed to turn up.',
  },
  {
    id: 'npc:dulcie-bellows', name: 'Armourer Dulcie Bellows', title: 'of the Old Armoury', school: 'blade', origin: 'blade', trust: 2,
    region: Z4, home: 'landmark:bellows-forge', presentWhen: SW,
    dialogue: [{ dialogue: 'dialogue:swordsman-dulcie' }],
    barks: [{ lines: ['Three generations, and never one scabbard.', 'Sharpen? Course. Sheathe? What for?'] }],
    roles: ['quest', 'merchant'],
    look: { skin: 0xa07a5a, hair: 0x8a4a2a, cloth: 0x4a3a2a, accent: 0xff8a3a, build: 'broad' },
    bio: 'Third of the Bellows armourers of the Old Armoury, who has sharpened half the swords in Edgewater and has always wanted, just once, to make something to put one away in.',
  },
  {
    id: 'npc:benedict-strop', name: 'Clerk Benedict Strop', title: 'Keeper of the Armoury Roll', school: 'blade', origin: 'blade', trust: 1,
    region: Z4, home: 'landmark:armoury-roll', presentWhen: SW,
    dialogue: [{ dialogue: 'dialogue:swordsman-strop' }],
    barks: [{ lines: ['Four thousand and ten. No. Twelve. No.', 'They move them in the night.'] }],
    roles: ['quest'],
    look: { skin: 0xe0c0a0, hair: 0x6a5a4a, cloth: 0x4a4a5a, accent: 0xc8b89a, build: 'slight' },
    bio: 'The Old Armoury’s clerk, charged with counting its swords, which the Training Automatons rearrange every night out of pure spite.',
  },
  // ---------- Act II (Concordia)
  {
    id: 'npc:basilio-trento', name: 'Ser Basilio Trento', title: 'of the Watch House, once of rung 61', school: 'blade', origin: 'blade', trust: 2,
    region: 'region:alder', home: 'landmark:brind-watch-house', presentWhen: ACT2,
    dialogue: [
      { when: at('quest:swordsman-the-watch-house-ladder', 'watch'), dialogue: 'dialogue:swordsman-basilio' },
      { dialogue: 'dialogue:blade-basilio' },
    ],
    barks: [{ lines: ['Thirty years on the wrong side of a duel.', 'The bottom rung gets the best bunk. Very civilised.'] }],
    roles: ['quest'],
    look: { skin: 0xc8a888, hair: 0xd8d8d0, cloth: 0x3a4a6a, accent: 0xc83a3a, build: 'average' },
    bio: 'An old Edgewater duellist, once of rung 61, who came through to Concordia for a bout in C. 1012 and was shut out when the arches closed. He drinks with the Blade folk of Brindlecross at Rook’s Watch House.',
  },
  {
    id: 'npc:percy-thimble-concordia', name: 'Percy Thimble', title: 'Tailor of the Ladder, far from home', school: 'blade', origin: 'blade', trust: 3,
    region: 'region:alder', home: 'landmark:gate-circle',
    presentWhen: { all: [SW, ACT2, { any: [{ questActive: 'quest:swordsman-a-letter-from-ferro' }, { questCompleted: 'quest:swordsman-a-letter-from-ferro' }] }] },
    // C-6: escorted across the moor to the Watch House, where he stays with the Blade folk;
    // Act III: he follows the hero into the Heart (Ferro’s Ribbon, Percy’s Thousandth)
    schedule: [
      { from: 0, to: 24, at: 'landmark:heart-camp', activity: 'idle', when: { any: [{ questActive: 'quest:swordsman-percys-thousandth' }, at('quest:swordsman-ferros-ribbon', 'percy')] } },
      { from: 0, to: 24, at: 'landmark:brind-watch-house', activity: 'idle', when: { any: [at('quest:swordsman-a-letter-from-ferro', 'court'), at('quest:swordsman-a-letter-from-ferro', 'reply'), { questCompleted: 'quest:swordsman-a-letter-from-ferro' }] } },
    ],
    dialogue: [
      { when: at('quest:swordsman-ferros-ribbon', 'percy'), dialogue: 'dialogue:swordsman-percy-banner' },
      { when: { questActive: 'quest:swordsman-percys-thousandth' }, dialogue: 'dialogue:swordsman-percy-heart' },
      { dialogue: 'dialogue:swordsman-percy-letter' },
    ],
    barks: [{ lines: ['I came through the gate! Me!', 'Concordian tailoring is a scandal.'] }],
    roles: ['quest'],
    look: { skin: 0xe8c4a8, hair: 0x8a5a2a, cloth: 0x4a7a5a, accent: 0xe8c86a, build: 'short' },
    bio: 'Percy Thimble walked all the way from Edgewater to the Gate Circle to deliver Maestra Ferro’s letter, in his best coat, and has already taken four commissions.',
  },
];

export default npcs;
