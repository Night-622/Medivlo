/**
 * Hollow Crown, Tidecourt: Velvet Harbour NPCs for the Jester campaign (docs/lore/hollow-crown/06-outlines/guile.md),
 * plus the Guile school's Lanternford folk (both Guile campaigns' C-1) and the Jester's other Concordia NPCs.
 * Zones: zone:guile-capital-1 the Velvet Docks, -2 the Masquerade Quarter, -3 the Exchange Floor, -4 the Crooked Stairs. Owner: Claude 4.
 */
import type { NarrativeCondition, NpcDef } from '@/core';

const JE: NarrativeCondition = { heroClass: 'jester' };
const at = (q: `quest:${string}`, stage: string): NarrativeCondition => ({ questStage: q, stage });
const Z1 = 'zone:guile-capital-1' as const, Z2 = 'zone:guile-capital-2' as const, Z3 = 'zone:guile-capital-3' as const, Z4 = 'zone:guile-capital-4' as const;
const ACT2: NarrativeCondition = { flag: 'story.act', op: '>=', value: 2 };

const npcs: NpcDef[] = [
  {
    id: 'npc:fennick-pantaloon', name: 'Old Fennick Pantaloon', title: 'Royal Fool, retired', school: 'guile', origin: 'guile', trust: 3,
    services: ['Mentor', 'Trains Jesters'], region: Z1, home: 'landmark:fennick-attic', lore: 'lore:hc-fennick-pantaloon',
    presentWhen: JE,
    schedule: [
      { from: 0, to: 24, at: 'landmark:masque-gangplank', activity: 'idle', when: at('quest:jester-the-bell-at-the-masque', 'fennick') },
      { from: 0, to: 24, at: 'landmark:worst-joke-stage', activity: 'idle', when: at('quest:jester-the-pantaloon-act', 'fennick') },
      { from: 0, to: 24, at: 'landmark:pellam-lamp', activity: 'idle', when: at('quest:jester-exit-pursued-by-a-fool', 'fennick') },
    ],
    dialogue: [
      { when: at('quest:jester-the-bell-at-the-masque', 'fennick'), dialogue: 'dialogue:jester-fennick-masque' },
      { when: at('quest:jester-the-bell-at-the-masque', 'cushions'), dialogue: 'dialogue:jester-fennick-cushions' },
      { when: at('quest:jester-the-worst-joke-in-tidecourt', 'fennick'), dialogue: 'dialogue:jester-fennick-worst' },
      { when: at('quest:jester-fennicks-pawn-ticket', 'fennick'), dialogue: 'dialogue:jester-fennick-bells' },
      { when: at('quest:jester-the-kings-fool', 'fennick'), dialogue: 'dialogue:jester-fennick-sorrow' },
      { when: at('quest:jester-sorrows-laughing-shop', 'fennick'), dialogue: 'dialogue:jester-fennick-shop' },
      { when: at('quest:jester-exit-pursued-by-a-fool', 'fennick'), dialogue: 'dialogue:jester-fennick-farewell' },
      { when: at('quest:jester-the-pantaloon-act', 'fennick'), dialogue: 'dialogue:jester-fennick-act' },
      { when: at('quest:jester-the-fools-licence', 'fennick'), dialogue: 'dialogue:jester-fennick-licence' },
      { when: { all: [at('quest:jester-fennicks-pawn-ticket', 'tuttle'), { not: { flag: 'jester.delight.ticket' } }] }, dialogue: 'dialogue:jester-delight-ticket' },
      { dialogue: 'dialogue:jester-fennick' },
    ],
    barks: [{ lines: ['Mind the cushion. No, the other cushion. No. Ow.', 'The secret of falling over is: don’t try. Everybody tries.', 'I was funny once. Ask anyone over eighty.'] }],
    roles: ['quest', 'trainer'], essential: true,
    look: { skin: 0xe0b898, hair: 0xe8e4dc, cloth: 0x7d1d3d, accent: 0xff5a8a, build: 'slight' },
    bio: 'A retired royal fool who lives in a sail-loft attic full of cushions on the Velvet Docks and still falls over on purpose several times a day. He taught the hero to fall over. He has won the Quarter’s Worst Joke contest eleven years running and is very proud of it.',
  },
  {
    id: 'npc:harlequin-sorrow', name: 'Harlequin Sorrow', title: 'Fool to the Velvet King', school: 'guile', origin: 'guile', trust: 2,
    region: Z4, home: 'landmark:sorrows-laughing-shop', lore: 'lore:hc-harlequin-sorrow',
    // Act I in Velvet Harbour; Act III, bound in the Chimera and beaten on the stair top, waiting for his fate (reopenable)
    presentWhen: {
      all: [JE, {
        any: [
          { all: [{ any: [{ questActive: 'quest:jester-the-kings-fool' }, { questCompleted: 'quest:jester-the-kings-fool' }] }, { not: { flag: 'jester.halfstone' } }] },
          at('quest:jester-the-last-laugh', 'fate'),
        ],
      }],
    },
    schedule: [
      { from: 0, to: 24, at: 'landmark:twelve-stairs-top', activity: 'idle', when: at('quest:jester-the-last-laugh', 'fate') },
      { from: 0, to: 24, at: 'landmark:thieves-exchange', activity: 'idle', when: at('quest:jester-the-kings-fool', 'exchange') },
      { from: 0, to: 24, at: 'landmark:jester-palace-steps', activity: 'idle', when: { any: [at('quest:jester-the-kings-fool', 'steps'), at('quest:jester-the-kings-fool', 'pages')] } },
      { from: 0, to: 24, at: 'landmark:thieves-exchange', activity: 'idle', when: at('quest:jester-the-jubilee-jest', 'jest') },
    ],
    dialogue: [
      { when: at('quest:jester-the-last-laugh', 'fate'), dialogue: 'dialogue:jester-herald-fate' },
      { when: at('quest:jester-the-kings-fool', 'exchange'), dialogue: 'dialogue:jester-sorrow-indenture' },
      { when: at('quest:jester-the-kings-fool', 'pages'), dialogue: 'dialogue:jester-sorrow-steps' },
      { when: at('quest:jester-the-jubilee-jest', 'jest'), dialogue: 'dialogue:jester-jubilee-jest' },
      { when: at('quest:jester-sorrows-laughing-shop', 'sorrow'), dialogue: 'dialogue:jester-sorrow-shop' },
      { dialogue: 'dialogue:jester-sorrow' },
    ],
    barks: [{ lines: ['Fools should be free. Free fools are so much cheaper.', 'Laugh. Go on. It’s on the house. Well, it’s on credit.', '(His sleeves clink faintly when he bows.)'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xf0e8e0, hair: 0x1a1a1a, cloth: 0xe8e4dc, accent: 0x1a1a2a, build: 'tall' },
    bio: 'The Velvet King’s fool, in a white mask and a suit of black and white diamonds: funny, generous, kind to the pages, and the real power behind the throne. He owns half the realm’s debts. Nobody in Velvet Harbour has ever seen him laugh.',
  },
  {
    id: 'npc:guildmaster-vex', name: 'Guildmaster Vex', title: 'of the Thieves’ Exchange', school: 'guile', origin: 'guile', trust: 1,
    region: Z3, home: 'landmark:thieves-exchange',
    presentWhen: { all: [JE, { any: [{ questActive: 'quest:jester-the-jubilee-jest' }, { questCompleted: 'quest:jester-the-kings-fool' }] }, { not: { questCompleted: 'quest:jester-the-jubilee-jest' } }] },
    dialogue: [{ dialogue: 'dialogue:jester-vex' }],
    barks: [{ lines: ['Everything has a price. Mine is higher.', 'The King is broke, child. Everyone knows. Nobody’s said it in a way I can sell.'] }],
    roles: ['ambient'],
    look: { skin: 0xc8946e, hair: 0x2a2018, cloth: 0x2a2a3a, accent: 0xd9a83a, build: 'average' },
    bio: 'The master of the Thieves’ Exchange, who rules it from a sea-fort off Gallows Reef and visits the Floor by appointment. He buys debts the way other men buy bread.',
  },
  {
    id: 'npc:tuttle', name: 'Mister Tuttle', title: 'Pawnbroker of the Velvet Docks', school: 'guile', origin: 'guile', trust: 1,
    region: Z1, home: 'landmark:tuttles-pawn', presentWhen: JE,
    dialogue: [
      { when: at('quest:jester-fennicks-pawn-ticket', 'tuttle'), dialogue: 'dialogue:jester-tuttle-ticket' },
      { when: at('quest:jester-fennicks-pawn-ticket', 'redeem'), dialogue: 'dialogue:jester-tuttle-redeem' },
      { dialogue: 'dialogue:jester-tuttle' },
    ],
    barks: [{ lines: ['Pearls only. No coin, no promises, no tears. Well. Hardened ones.', 'Everything in this shop belongs to somebody who is coming back for it. Eventually.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b090, hair: 0x6a6a6a, cloth: 0x3a2a3a, accent: 0xd9a83a, build: 'short' },
    bio: 'The oldest pawnbroker on the Velvet Docks, a small dry man with a jeweller’s glass screwed permanently into one eye. Since last winter he has taken and paid in black pearls only.',
  },
  {
    id: 'npc:constable-prigg', name: 'Constable Prigg', title: 'of the Harbour Watch', school: 'guile', origin: 'guile', trust: 1,
    region: Z1, home: 'landmark:harbour-watch-house', presentWhen: JE,
    dialogue: [
      { when: at('quest:jester-gull-number-nine', 'prigg'), dialogue: 'dialogue:jester-prigg-gull' },
      { dialogue: 'dialogue:jester-prigg' },
    ],
    barks: [{ lines: ['Bounties on the board. Justice on the gibbet. Chips on the ground, apparently.', 'Forty-one counts. Forty-one!'] }],
    roles: ['quest'],
    look: { skin: 0xe0b898, hair: 0x9a3a2a, cloth: 0x2f4a7a, accent: 0xd9a83a, build: 'broad' },
    bio: 'The Harbour Watch’s most dedicated constable, who keeps the bounty board, the cells and a small, beautifully made gibbet for gulls.',
  },
  {
    id: 'npc:gull-number-nine', name: 'Gull Number Nine', title: 'a gull of some notoriety', school: 'guile', origin: 'guile', trust: 1,
    region: Z1, home: 'landmark:harbour-watch-house',
    presentWhen: { all: [JE, { not: { flag: 'story.gate_open' } }] },
    dialogue: [
      { when: { all: [{ flag: 'jester.delight.gull-met' }, { not: { flag: 'jester.gull_saved' } }, { not: { flag: 'jester.delight.gull-again' } }] }, dialogue: 'dialogue:jester-delight-gull' },
      { dialogue: 'dialogue:jester-gull' },
    ],
    barks: [{ lines: ['(The gull looks at your chips.)', '(It says something that sounds very much like “innocent”.)', '(It is following you. It has been following you for some time.)'] }],
    roles: ['ambient'],
    look: { skin: 0xe8e4dc, cloth: 0x9a9a9a, accent: 0xffd36a, build: 'short' },
    bio: 'A herring gull with forty-one convictions for chip theft, the most wanted bird on the Velvet Docks, who insists, loudly and at dawn, that it was framed.',
  },
  {
    id: 'npc:mother-gudgeon', name: 'Mother Gudgeon', title: 'Fishwife of the Velvet Docks', school: 'guile', origin: 'guile', trust: 2,
    region: Z1, home: 'landmark:gudgeon-fish-stall', presentWhen: JE,
    dialogue: [
      { when: at('quest:jester-the-jubilee-jest', 'canvass'), dialogue: 'dialogue:jester-gudgeon-canvass' },
      { when: at('quest:jester-mother-gudgeons-tab', 'tab'), dialogue: 'dialogue:jester-gudgeon-tab' },
      { when: at('quest:jester-mother-gudgeons-tab', 'gudgeon'), dialogue: 'dialogue:jester-gudgeon-bait' },
      { dialogue: 'dialogue:jester-gudgeon' },
    ],
    barks: [{ lines: ['Fresh cod! Fresh-ish cod! Cod!', 'Thirty years on the slate and I’ve never once been short. Well. Once.'] }],
    roles: ['quest'],
    look: { skin: 0xc89a78, hair: 0xb8b0a0, cloth: 0x4a5a6a, accent: 0xff5a8a, build: 'broad' },
    bio: 'The loudest fishwife on the Velvet Docks, whose stall has run on credit since the year of the Hollowing. She knows every debt on the street, and who has paid it, and when.',
  },
  {
    id: 'npc:ottoline-squibb', name: 'Mister Ottoline Squibb', title: 'of the Masquerade Quarter', school: 'guile', origin: 'guile', trust: 1,
    region: Z2, home: 'landmark:squibb-portrait', presentWhen: JE,
    dialogue: [
      { when: at('quest:jester-the-man-who-forgot-his-face', 'squibb'), dialogue: 'dialogue:jester-squibb-face' },
      { dialogue: 'dialogue:jester-squibb' },
    ],
    barks: [{ lines: ['Is my nose large? I think it might be large. I can’t remember.', 'I put it on for one night. One night!'] }],
    roles: ['quest'],
    look: { skin: 0xe0c0a8, hair: 0x4a3a2a, cloth: 0x6a3aa8, accent: 0xffd36a, build: 'average' },
    bio: 'A gentleman of the Masquerade Quarter who put on a gold carnival mask for one night in the year of the Hollowing and has not taken it off since. He no longer remembers what is underneath.',
  },
  {
    id: 'npc:clementine-daub', name: 'Clementine Daub', title: 'Portrait-painter of the Quarter', school: 'guile', origin: 'guile', trust: 2,
    region: Z2, home: 'landmark:squibb-portrait', presentWhen: JE,
    dialogue: [
      { when: at('quest:jester-the-man-who-forgot-his-face', 'painter'), dialogue: 'dialogue:jester-daub' },
      { dialogue: 'dialogue:jester-daub-general' },
    ],
    barks: [{ lines: ['Everyone in this Quarter is masked. I paint what’s under the mask. That’s why I’m poor.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b8a0, hair: 0xd0d0c8, cloth: 0x5a4a3a, accent: 0x3fa9e8, build: 'slight' },
    bio: 'An old portrait-painter of the Masquerade Quarter, paint on every finger, who has painted half the faces in Velvet Harbour without their masks, and kept every one.',
  },
  {
    id: 'npc:hortense-quibble', name: 'Dame Hortense Quibble', title: 'Judge of the Worst Joke', school: 'guile', origin: 'guile', trust: 2,
    region: Z2, home: 'landmark:worst-joke-stage', presentWhen: JE,
    dialogue: [
      { when: at('quest:jester-the-worst-joke-in-tidecourt', 'contest'), dialogue: 'dialogue:jester-hortense-contest' },
      { dialogue: 'dialogue:jester-hortense' },
    ],
    barks: [{ lines: ['Eleven years. Eleven years of Fennick. I can’t take a twelfth.', 'Worse. Worse! No, that one’s quite good. Go away.'] }],
    roles: ['quest'],
    look: { skin: 0xe8c0a0, hair: 0x9a3a8a, cloth: 0xd9a83a, accent: 0xff5a8a, build: 'broad' },
    bio: 'The grand old dame who has judged the Masquerade Quarter’s Worst Joke contest for forty years and has heard every joke there is. Most of them from Fennick.',
  },
  {
    id: 'npc:rosamund-hake', name: 'Rosamund Hake', title: 'a bride, nearly', school: 'guile', origin: 'guile', trust: 1,
    region: Z3, home: 'landmark:thieves-exchange', presentWhen: JE,
    dialogue: [
      { when: at('quest:jester-a-promise-slightly-used', 'bride'), dialogue: 'dialogue:jester-rosamund-vow' },
      { dialogue: 'dialogue:jester-rosamund' },
    ],
    barks: [{ lines: ['Saturday. The wedding is Saturday. I have a dress and a groom and no vow.'] }],
    roles: ['quest'],
    look: { skin: 0xe8c4a8, hair: 0xb8743a, cloth: 0xe8e4dc, accent: 0xff9ad0, build: 'slight' },
    bio: 'A young woman of Velvet Harbour who sold her wedding vow on the Exchange to pay her father’s debts, and is getting married on Saturday regardless.',
  },
  {
    id: 'npc:lionel-mizzle', name: 'Broker Lionel Mizzle', title: 'of the Weather Desk', school: 'guile', origin: 'guile', trust: 1,
    region: Z3, home: 'landmark:thieves-exchange', presentWhen: JE,
    dialogue: [
      { when: at('quest:jester-futures-in-weather', 'mizzle'), dialogue: 'dialogue:jester-mizzle-covered' },
      { dialogue: 'dialogue:jester-mizzle' },
    ],
    barks: [{ lines: ['Fine tomorrow! Fine tomorrow, going cheap!', 'Thirty years, and it has never once rained on a Saturday. Until the Bell.'] }],
    roles: ['quest'],
    look: { skin: 0xd0a080, hair: 0x3a3a3a, cloth: 0x4a5a8a, accent: 0xffe14a, build: 'slight' },
    bio: 'A broker on the Exchange Floor who has sold “fine tomorrow” every day for thirty years and been right more often than anybody likes. The Bell has spoiled his forecast.',
  },
  {
    id: 'npc:wick-pellam', name: 'Old Wick Pellam', title: 'Lamplighter of the Crooked Stairs', school: 'guile', origin: 'guile', trust: 1,
    region: Z4, home: 'landmark:pellam-lamp', presentWhen: JE,
    dialogue: [
      { when: at('quest:jester-the-lamplighters-wife', 'wick'), dialogue: 'dialogue:jester-wick-receipt' },
      { dialogue: 'dialogue:jester-wick' },
    ],
    barks: [{ lines: ['Every night. Every night I light it. I couldn’t tell you why.', 'Mind the fourth landing. The chest bites.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b8a0, hair: 0xe8e4dc, cloth: 0x3a3a3a, accent: 0xffd36a, build: 'slight' },
    bio: 'An old lamplighter who climbs to the top of the Crooked Stairs every night to light one particular lamp, and cannot remember why he does it, only that he must.',
  },
  {
    id: 'npc:collector-smallbone', name: 'Collector Smallbone', title: 'Debt-collector, damp', school: 'guile', origin: 'guile', trust: 0,
    region: Z4, home: 'landmark:pellam-lamp',
    presentWhen: { all: [JE, { any: [{ questStage: 'quest:jester-the-chest-that-bites-back', stage: 'smallbone' }, { questCompleted: 'quest:jester-the-chest-that-bites-back' }] }] },
    dialogue: [{ dialogue: 'dialogue:jester-smallbone' }],
    barks: [{ lines: ['Arrears. Arrears! Interest has been accruing. I have been accruing.'] }],
    roles: ['quest'],
    look: { skin: 0xc8c0a8, hair: 0x2a2a2a, cloth: 0x3a3a2a, accent: 0x6aa86a, build: 'slight' },
    bio: 'A debt-collector of the Counting House who was swallowed by a Mimic Slime on the Crooked Stairs a week ago and carried on collecting from inside it.',
  },
  {
    id: 'npc:augustin-drabb', name: 'Augustin Drabb', title: 'Clerk of the Counting House', school: 'guile', origin: 'guile', trust: 1,
    region: Z3, home: 'landmark:counting-house', presentWhen: JE,
    dialogue: [
      { when: at('quest:jester-the-jubilee-jest', 'canvass'), dialogue: 'dialogue:jester-drabb-canvass' },
      { when: at('quest:jester-the-pantaloon-act', 'drabb'), dialogue: 'dialogue:jester-drabb-asked' },
      { dialogue: 'dialogue:jester-drabb' },
    ],
    barks: [{ lines: ['Column A. Column B. Nothing funny about columns.', 'I was in the theatre once. Briefly. It passed.'] }],
    roles: ['quest'],
    look: { skin: 0xe0c0a8, hair: 0x6a6a6a, cloth: 0x2a2a2a, accent: 0xe8e4dc, build: 'tall' },
    bio: 'A tall, grave clerk of the Counting House, collar done up to the top, who was once the straight man in the Pantaloon Act, the finest double act Velvet Harbour ever saw. He quit in C. 1012 and has not smiled since.',
  },
  // ---------- Concordia: Lanternford (both Guile campaigns) and the Jester's thread
  {
    id: 'npc:hester-glimmer', name: 'Hester Glimmer', title: 'Keeper of the Will-o’-Wisp', school: 'guile', origin: 'guile', trust: 1,
    region: 'region:marsh', home: 'landmark:ford-will-o-wisp',
    presentWhen: ACT2,
    dialogue: [
      { when: at('quest:jester-lanternford', 'ford'), dialogue: 'dialogue:jester-hester' },
      { when: at('quest:corsair-lanternford', 'ford'), dialogue: 'dialogue:corsair-hester' },
      { dialogue: 'dialogue:guile-hester' },
    ],
    barks: [{ lines: ['Safe lanterns! Only slightly into the water!', 'The Queen? Business rival. Terrible woman. Lovely lamps.', 'Thirty years in a marsh. You get used to wet feet. You never get used to the frogs.'] }],
    roles: ['quest', 'merchant'],
    look: { skin: 0xd0a080, hair: 0x8a3a6a, cloth: 0x2a6a6a, accent: 0xff5a8a, build: 'average' },
    bio: 'Keeper of the Will-o’-Wisp at Lanternford and head of the Tidecourt folk stranded in Morvane Marsh. She sells lanterns that lead you only slightly into the water, and speaks of the Lantern Queen as a business rival.',
  },
  {
    id: 'npc:peregrine-tolley', name: 'Peregrine Tolley', title: 'Lantern-seller of Lanternford', school: 'guile', origin: 'guile', trust: 1,
    region: 'region:marsh', home: 'landmark:ford-lantern-shop',
    presentWhen: ACT2,
    dialogue: [
      { when: at('quest:corsair-the-lantern-queen', 'tell'), dialogue: 'dialogue:corsair-peregrine-queen' },
      { dialogue: 'dialogue:guile-peregrine' },
    ],
    barks: [{ lines: ['This one leads you home. This one leads you nearly home. This one is for people you don’t like.'] }],
    roles: ['quest', 'merchant'],
    look: { skin: 0xe0c0a8, hair: 0x2a2a2a, cloth: 0x7d1d3d, accent: 0x6ae8d8, build: 'slight' },
    bio: 'A Tidecourt lantern-maker who came to the Turning fair in C. 1011 to sell lamps and stayed to sell them to a marsh. He is very honest about which ones are dishonest.',
  },
  {
    id: 'npc:winnifred-sprat', name: 'Winnifred Sprat', title: 'Keeper of the Old Fish Mill', school: 'radiance', origin: 'concord', trust: 1,
    region: 'region:abbey', home: 'landmark:shore-fish-mill',
    presentWhen: ACT2,
    dialogue: [
      { when: at('quest:jester-sorrow-buys-the-silence', 'mill'), dialogue: 'dialogue:jester-winnie' },
      { dialogue: 'dialogue:jester-winnie-general' },
    ],
    barks: [{ lines: ['Ropes, nets, old bells, older fish. Everything the lake gives up, I keep.', 'He paid in pearls. Who pays for rope in pearls?'] }],
    roles: ['quest'],
    look: { skin: 0xc89a78, hair: 0xd8d8d0, cloth: 0x3a5a5a, accent: 0xffd96b, build: 'short' },
    bio: 'Keeper of the Old Fish Mill at Abbeyshore, which has stored everything the Abbey lake gave up for thirty years, including the drowned Abbey’s bell-ropes.',
  },
  {
    id: 'npc:gull-number-nine-concordia', name: 'Gull Number Nine', title: 'a gull, a long way from the chips', school: 'guile', origin: 'guile', trust: 2,
    region: 'region:alder', home: 'landmark:gate-circle',
    // Act II at the Gate Circle with Fennick's letter; Act III at the Heart camp, with another letter and a stolen plume
    presentWhen: {
      all: [JE, { flag: 'jester.gull_saved' }, {
        any: [{ questActive: 'quest:jester-a-letter-by-gull' }, at('quest:jester-the-joke-for-the-king', 'letter'), { questActive: 'quest:jester-gull-number-nine-goes-straight' }],
      }],
    },
    schedule: [{ from: 0, to: 24, at: 'landmark:heart-camp', activity: 'idle', when: { any: [at('quest:jester-the-joke-for-the-king', 'letter'), { questActive: 'quest:jester-gull-number-nine-goes-straight' }] } }],
    dialogue: [
      { when: at('quest:jester-gull-number-nine-goes-straight', 'gull'), dialogue: 'dialogue:jester-gull-heart' },
      { when: at('quest:jester-the-joke-for-the-king', 'letter'), dialogue: 'dialogue:jester-heart-letter' },
      { when: { questActive: 'quest:jester-a-letter-by-gull' }, dialogue: 'dialogue:jester-gull-letter' },
      { dialogue: 'dialogue:jester-gull-heart' },
    ],
    barks: [{ lines: ['(The gull is sitting on the Guile arch with a letter in its beak, and a chip.)'] }],
    roles: ['quest'],
    look: { skin: 0xe8e4dc, cloth: 0x9a9a9a, accent: 0xffd36a, build: 'short' },
    bio: 'Gull Number Nine, acquitted, who has flown all the way through the Pawned Gate and across Concordia with a letter, stopping only for chips.',
  },
  {
    id: 'npc:court-pigeon', name: 'A Court Pigeon', title: 'of the Velvet Court lofts', school: 'guile', origin: 'guile', trust: 1,
    region: 'region:alder', home: 'landmark:gate-circle',
    // Act II at the Gate Circle; Act III at the Heart camp with Fennick's last letter (when the gull was not saved)
    presentWhen: { all: [JE, { not: { flag: 'jester.gull_saved' } }, { any: [{ questActive: 'quest:jester-a-letter-by-gull' }, at('quest:jester-the-joke-for-the-king', 'letter')] }] },
    schedule: [{ from: 0, to: 24, at: 'landmark:heart-camp', activity: 'idle', when: at('quest:jester-the-joke-for-the-king', 'letter') }],
    dialogue: [
      { when: at('quest:jester-the-joke-for-the-king', 'letter'), dialogue: 'dialogue:jester-heart-letter' },
      { dialogue: 'dialogue:jester-pigeon-letter' },
    ],
    barks: [{ lines: ['(The pigeon wears a tiny velvet ribbon and an expression of great dignity.)'] }],
    roles: ['quest'],
    look: { skin: 0xa8a8b8, cloth: 0x7d1d3d, accent: 0xff5a8a, build: 'short' },
    bio: 'A pigeon of the Velvet Court lofts, in a ribbon, who has carried a letter from Velvet Harbour with enormous ceremony.',
  },
];

export default npcs;
