/**
 * Hollow Crown, Tidecourt: Gallows Reef NPCs for the Corsair campaign (docs/lore/hollow-crown/06-outlines/guile.md),
 * plus the Corsair's Concordia NPCs (the C-4 informant and the C-6 messenger). Lanternford's folk are in hc-guile-capital.ts.
 * Zones: zone:guile-frontier-1 the Brine Market, -2 Gallows Reef, -3 the Wreckers' Coves, -4 the Crow Islands. Owner: Claude 4.
 */
import type { NarrativeCondition, NpcDef } from '@/core';

const CS: NarrativeCondition = { heroClass: 'corsair' };
const at = (q: `quest:${string}`, stage: string): NarrativeCondition => ({ questStage: q, stage });
const Z1 = 'zone:guile-frontier-1' as const, Z2 = 'zone:guile-frontier-2' as const, Z3 = 'zone:guile-frontier-3' as const, Z4 = 'zone:guile-frontier-4' as const;
const ACT2: NarrativeCondition = { flag: 'story.act', op: '>=', value: 2 };

const npcs: NpcDef[] = [
  {
    id: 'npc:dot-brine', name: 'Captain Dot Brine', title: 'of the Overdraft, admiral of nothing', school: 'guile', origin: 'guile', trust: 2,
    services: ['Mentor', 'Trains Corsairs'], region: Z1, home: 'landmark:the-overdraft', lore: 'lore:hc-dot-brine',
    presentWhen: CS,
    schedule: [{ from: 0, to: 24, at: 'landmark:hat-gibbets', activity: 'idle', when: at('quest:corsair-the-pearl-charter', 'moot') }],
    dialogue: [
      { when: at('quest:corsair-the-bell-over-the-water', 'dot'), dialogue: 'dialogue:corsair-dot-bell' },
      { when: at('quest:corsair-dots-creditors', 'dot'), dialogue: 'dialogue:corsair-dot-creditors' },
      { when: at('quest:corsair-vexs-guildhold', 'dot'), dialogue: 'dialogue:corsair-dot-overdraft' },
      { when: at('quest:corsair-the-pearl-admiral', 'dot'), dialogue: 'dialogue:corsair-dot-admiral' },
      { when: at('quest:corsair-the-pearl-charter', 'moot'), dialogue: 'dialogue:corsair-pearl-charter' },
      { when: at('quest:corsair-dots-reckoning', 'dot'), dialogue: 'dialogue:corsair-dot-farewell' },
      { when: at('quest:corsair-quills-price', 'dot'), dialogue: 'dialogue:corsair-dot-quill' },
      { when: at('quest:corsair-the-first-article', 'dot'), dialogue: 'dialogue:corsair-dot-article' },
      { dialogue: 'dialogue:corsair-dot' },
    ],
    barks: [{ lines: ['If anybody asks, I’m not here, and you’ve never heard of me, and the Overdraft is a fishing boat.', 'Owe? I don’t owe. I’m between payments.', 'A free captain chooses her targets. That’s the whole of it.'] }],
    roles: ['quest', 'trainer'], essential: true,
    look: { skin: 0xc8946e, hair: 0x8a3a1a, cloth: 0x2a3a5a, accent: 0xd9a83a, build: 'average' },
    bio: 'Captain Dorothea “Dot” Brine of the Overdraft: admiral of nothing, captain of everything, and in debt to every soul on Gallows Reef. She took the hero on last month and has not paid them yet. Her hat is lined with something she will not show anybody.',
  },
  {
    id: 'npc:interest', name: 'Interest', title: 'Dot Brine’s parrot', school: 'guile', origin: 'guile', trust: 1,
    region: Z1, home: 'landmark:the-overdraft', presentWhen: { all: [CS, { not: { flag: 'corsair.interest_pet' } }] },
    dialogue: [{ dialogue: 'dialogue:corsair-interest' }],
    barks: [{ lines: ['(Interest says “Pay up!” and then, louder, “PAY UP!”)', '(The parrot compounds.)', '(Interest bites a button off your coat and keeps it.)'] }],
    roles: ['ambient'],
    look: { skin: 0x3aa84a, cloth: 0xd83a2a, accent: 0xffd36a, build: 'short' },
    bio: 'Dot’s parrot, green and red and loud, named for the thing that grows on everything Dot owes. He knows one phrase, and it gets longer every time he says it.',
  },
  {
    id: 'npc:saltmarsh', name: 'Admiral Saltmarsh', title: 'of the white flagship', school: 'guile', origin: 'guile', trust: 2,
    region: Z2, home: 'landmark:white-flagship-berth', lore: 'lore:hc-saltmarsh',
    // Act I on Gallows Reef; Act III, bound in the Chimera and beaten on the stair top, waiting for his fate (reopenable)
    presentWhen: {
      all: [CS, {
        any: [
          { all: [{ any: [{ questActive: 'quest:corsair-the-pearl-admiral' }, { questCompleted: 'quest:corsair-the-pearl-admiral' }] }, { not: { flag: 'corsair.halfstone' } }] },
          at('quest:corsair-saltmarshs-last-sale', 'fate'),
        ],
      }],
    },
    schedule: [
      { from: 0, to: 24, at: 'landmark:twelve-stairs-top', activity: 'idle', when: at('quest:corsair-saltmarshs-last-sale', 'fate') },
      { from: 0, to: 24, at: 'landmark:grief-ration-huts', activity: 'idle', when: at('quest:corsair-what-the-admiral-sells', 'saltmarsh') },
    ],
    dialogue: [
      { when: at('quest:corsair-saltmarshs-last-sale', 'fate'), dialogue: 'dialogue:corsair-herald-fate' },
      { when: at('quest:corsair-the-pearl-admiral', 'flagship'), dialogue: 'dialogue:corsair-saltmarsh-flagship' },
      { when: at('quest:corsair-what-the-admiral-sells', 'saltmarsh'), dialogue: 'dialogue:corsair-saltmarsh-huts' },
      { dialogue: 'dialogue:corsair-saltmarsh' },
    ],
    barks: [{ lines: ['Honest work, honest pay. Is that so strange, on Gallows Reef?', 'Lavender. For the smell of the hold. You get used to it.', 'Everybody has a price. I just pay it promptly.'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xb88a6a, hair: 0xd8d8d0, cloth: 0xe8e4dc, accent: 0x1a1a2a, build: 'tall' },
    bio: 'The master of the black-pearl trade, who sails a white flagship and pays every debt he buys on the day he buys it. He is weathered, kind to deckhands, smells of lavender, and wears a single black pearl in one ear.',
  },
  {
    id: 'npc:salvage-sal', name: 'Salvage Sal', title: 'of the Brine Market', school: 'guile', origin: 'guile', trust: 2,
    region: Z1, home: 'landmark:sals-last-plank', presentWhen: CS,
    dialogue: [
      { when: at('quest:corsair-everything-must-go', 'sal'), dialogue: 'dialogue:corsair-sal-done' },
      { dialogue: 'dialogue:corsair-sal' },
    ],
    barks: [{ lines: ['Everything must go! Including, eventually, me!', 'Lovely bit of hull, that. You’re standing on it. Make me an offer.'] }],
    roles: ['quest'],
    look: { skin: 0xd0a080, hair: 0x6a4a2a, cloth: 0x6a5a3a, accent: 0xffd36a, build: 'short' },
    bio: 'A cheerful salvager of the Brine Market who is selling her own ship plank by plank while standing on it. Business is good. The ship is getting small.',
  },
  {
    id: 'npc:netty-hawser', name: 'Netty Hawser', title: 'Keeper of the Thousand Knot', school: 'guile', origin: 'guile', trust: 2,
    region: Z1, home: 'landmark:thousand-knot', presentWhen: CS,
    dialogue: [
      { when: at('quest:corsair-everything-must-go', 'buyers'), dialogue: 'dialogue:corsair-netty-rigging' },
      { when: at('quest:corsair-the-thousand-knot', 'netty'), dialogue: 'dialogue:corsair-netty-knot' },
      { dialogue: 'dialogue:corsair-netty' },
    ],
    barks: [{ lines: ['Over, under, round and through. Nobody left behind.', 'Mind the knot. Everything in this market is tied to everything else.'] }],
    roles: ['quest'],
    look: { skin: 0xc89a78, hair: 0xd8d8d0, cloth: 0x4a5a6a, accent: 0xb08a3a, build: 'slight' },
    bio: 'An old rigger who has kept the Thousand Knot since the night it was tied, the night the gate shut, so that no ship in the Brine Market would ever be left behind.',
  },
  {
    id: 'npc:gilly-rackham', name: 'Bosun Gilly Rackham', title: 'of the Brine Market board', school: 'guile', origin: 'guile', trust: 1,
    region: Z1, home: 'landmark:brine-market-board', presentWhen: CS,
    dialogue: [
      { when: at('quest:corsair-everything-must-go', 'buyers'), dialogue: 'dialogue:corsair-gilly-deck' },
      { dialogue: 'dialogue:corsair-gilly' },
    ],
    barks: [{ lines: ['Bounties on the board. Paid in coin, not pearls. I’m old-fashioned.', 'If it’s got a price on its head, I’ve nailed it up.'] }],
    roles: ['quest'],
    look: { skin: 0xb07a5a, hair: 0x2a2a2a, cloth: 0x3a3a4a, accent: 0xd83a2a, build: 'broad' },
    bio: 'The Brine Fleet’s old bosun, who keeps the bounty board in the Brine Market and pays only in coin, on principle.',
  },
  {
    id: 'npc:merrin-tusk', name: 'Captain Merrin Tusk', title: 'of the Brine Fleet, retired', school: 'guile', origin: 'guile', trust: 1,
    region: Z2, home: 'landmark:hat-gibbets', presentWhen: CS,
    dialogue: [
      { when: at('quest:corsair-the-pearl-charter', 'canvass'), dialogue: 'dialogue:corsair-tusk-canvass' },
      { when: at('quest:corsair-the-hat-on-the-gibbet', 'tusk'), dialogue: 'dialogue:corsair-tusk-hat' },
      { dialogue: 'dialogue:corsair-tusk' },
    ],
    barks: [{ lines: ['A week to memorial night, and my hat’s gone. My hat!', 'They hang a hat for every captain lost. Mine’s meant to go up early, to save time.'] }],
    roles: ['quest'],
    look: { skin: 0xa07a5a, hair: 0xe8e4dc, cloth: 0x2a3a5a, accent: 0xe8e4dc, build: 'broad' },
    bio: 'An old free captain of the Brine Fleet who has given his hat to the gibbets in advance, as is the custom for captains who expect to be lost soon, and is outraged to find it stolen.',
  },
  {
    id: 'npc:ione-sculpin', name: 'Ione Sculpin', title: 'Pearl-diver of Gallows Reef', school: 'guile', origin: 'guile', trust: 1,
    region: Z2, home: 'landmark:hat-gibbets', presentWhen: CS,
    dialogue: [
      { when: at('quest:corsair-a-message-in-a-pearl', 'ione'), dialogue: 'dialogue:corsair-ione-weeper' },
      { dialogue: 'dialogue:corsair-ione' },
    ],
    barks: [{ lines: ['Down and up, down and up. Every pearl’s a little colder than the last.', 'I don’t sell the ones that talk.'] }],
    roles: ['quest'],
    look: { skin: 0x9a6a4a, hair: 0x1a1a1a, cloth: 0x2a5a6a, accent: 0x1a1a2a, build: 'slight' },
    bio: 'One of the few pearl-divers on Gallows Reef who is not yet sitting smiling on the market’s edge. She has started keeping the pearls that whisper.',
  },
  {
    id: 'npc:ruel-tregaskis', name: 'Ruel Tregaskis', title: 'of the Crow Islands', school: 'guile', origin: 'guile', trust: 1,
    region: Z4, home: 'landmark:grief-ration-huts', presentWhen: CS,
    dialogue: [
      { when: at('quest:corsair-a-message-in-a-pearl', 'weeper'), dialogue: 'dialogue:corsair-ruel-weeper' },
      { when: at('quest:corsair-the-crow-who-stole-a-crown', 'ruel'), dialogue: 'dialogue:corsair-ruel-crown' },
      { dialogue: 'dialogue:corsair-ruel' },
    ],
    barks: [{ lines: ['One more, and they’ll let me sleep.', 'That crow’s got a crown. A real one. Nobody believes me.'] }],
    roles: ['quest'],
    look: { skin: 0xb88a6a, hair: 0xd8d8d0, cloth: 0x5a5a4a, accent: 0x6a6a6a, build: 'slight' },
    bio: 'An old islander of the Crow Islands, on grief rations, who weeps a black pearl a day into a bowl so that the Admiral’s men will let him sleep. He knows everything about crows.',
  },
  {
    id: 'npc:nell-gant', name: 'Little Nell Gant', title: 'of the Wreckers’ Coves', school: 'guile', origin: 'guile', trust: 2,
    region: Z3, home: 'landmark:nell-gant-cottage', presentWhen: CS,
    dialogue: [
      { when: at('quest:corsair-the-wreckers-daughter', 'nell'), dialogue: 'dialogue:corsair-nell-father' },
      { dialogue: 'dialogue:corsair-nell' },
    ],
    barks: [{ lines: ['I keep it lit so he can find the cove. He’s just late. He’s always late.'] }],
    roles: ['quest'],
    look: { skin: 0xe0b898, hair: 0x8a5a2a, cloth: 0x4a4a5a, accent: 0xffd36a, build: 'short' },
    bio: 'A wrecker’s daughter of eleven who keeps a lantern burning on the high rock at the cove mouth every night for her father, who went out on a wrecking night four years ago and did not come home.',
  },
  {
    id: 'npc:abel-gant', name: 'Abel Gant', title: 'a wrecker, home late', school: 'guile', origin: 'guile', trust: 1,
    region: Z3, home: 'landmark:nell-gant-cottage',
    presentWhen: { all: [CS, { any: [at('quest:corsair-the-wreckers-daughter', 'home'), { flag: 'corsair.gant_home' }] }] },
    dialogue: [{ dialogue: 'dialogue:corsair-abel-home' }],
    barks: [{ lines: ['(He is sitting on the doorstep, wet through, holding his daughter’s hand, and he has not let go of it once.)'] }],
    roles: ['quest'],
    look: { skin: 0xc0a080, hair: 0x4a3a2a, cloth: 0x3a3a3a, accent: 0x6a8a9a, build: 'broad' },
    bio: 'A wrecker of the coves who was taken by the Merry Widow four years ago and crewed her, hollow, until her captain remembered his name.',
  },
  {
    id: 'npc:ma-colley', name: 'Ma Colley', title: 'Lantern-hirer of the Wreckers’ Coves', school: 'guile', origin: 'guile', trust: 1,
    region: Z3, home: 'landmark:colley-lantern-stall', presentWhen: CS,
    dialogue: [
      { when: at('quest:corsair-ma-colleys-lights', 'colley'), dialogue: 'dialogue:corsair-colley-payer' },
      { dialogue: 'dialogue:corsair-colley' },
    ],
    barks: [{ lines: ['Lanterns by the hour! Honest lights! Mostly!', 'I rent the lantern. What you do with it is your own business. That’s the wrecker’s creed.'] }],
    roles: ['quest'],
    look: { skin: 0xc89a78, hair: 0x9a9a9a, cloth: 0x5a3a2a, accent: 0xffd36a, build: 'broad' },
    bio: 'A wrecker’s widow who rents lanterns by the hour from a stall in the coves and asks no questions. Lately someone has been paying her in black pearls, and she has started asking questions.',
  },
  {
    id: 'npc:pennywhistle', name: 'Captain Pennywhistle', title: 'treasure-hunter, bad back', school: 'guile', origin: 'guile', trust: 2,
    region: Z4, home: 'landmark:pennywhistle-camp', presentWhen: CS,
    dialogue: [
      { when: at('quest:corsair-pennywhistles-map', 'penny'), dialogue: 'dialogue:corsair-penny-chest' },
      { dialogue: 'dialogue:corsair-penny' },
    ],
    barks: [{ lines: ['X marks the spot! Well. A sort of wobbly cross marks the spot.', 'My back. My back! Somebody else dig.'] }],
    roles: ['quest'],
    look: { skin: 0xe0b898, hair: 0xd8d8d0, cloth: 0x6a2a4a, accent: 0xd9a83a, build: 'short' },
    bio: 'An elderly treasure-hunter camped on the Crow Islands with a map, a spade and a back that will not let him use either.',
  },
  {
    id: 'npc:barnaby-quill', name: 'Barnaby Quill', title: 'net-mender, once first mate', school: 'guile', origin: 'guile', trust: 1,
    region: Z1, home: 'landmark:quill-net-loft', presentWhen: CS,
    dialogue: [
      { when: at('quest:corsair-the-pearl-charter', 'canvass'), dialogue: 'dialogue:corsair-quill-canvass' },
      { when: at('quest:corsair-quills-price', 'quill'), dialogue: 'dialogue:corsair-quill-price' },
      { dialogue: 'dialogue:corsair-quill' },
    ],
    barks: [{ lines: ['Don’t want her money. Never wanted her money.', 'One leg, one net, one opinion. That’s plenty.'] }],
    roles: ['quest'],
    look: { skin: 0xb07a5a, hair: 0xa8a8a0, cloth: 0x3a4a5a, accent: 0xb08a3a, build: 'broad' },
    bio: 'Dot Brine’s first mate for twenty years, who lost a leg pulling her out of the sea and has mended nets at the end of the Brine Market ever since. He will not take her money.',
  },
  // ---------- Act II (Concordia)
  {
    id: 'npc:rosie-mossop', name: 'Rosie Mossop', title: 'Dock ganger of Gildport', school: 'iron', origin: 'concord', trust: 1,
    region: 'region:gilded', home: 'landmark:gild-gilded-row',
    presentWhen: ACT2,
    // after the escort she stays at the cart-head, watching the pearls go down
    schedule: [{ from: 0, to: 24, at: 'landmark:corsair-cart-head', activity: 'idle', when: at('quest:corsair-the-admirals-cargo', 'hear') }],
    dialogue: [
      { when: at('quest:corsair-the-admirals-cargo', 'hear'), dialogue: 'dialogue:corsair-rosie-chute' },
      { when: at('quest:corsair-the-admirals-cargo', 'rosie'), dialogue: 'dialogue:corsair-rosie' },
      { dialogue: 'dialogue:corsair-rosie-general' },
    ],
    barks: [{ lines: ['Lift with your knees. Lift with your knees!', 'Pearls in, nothing out. I don’t like a cargo that only goes one way.'] }],
    roles: ['quest'],
    look: { skin: 0xc8946e, hair: 0x8a3a1a, cloth: 0x4a4a3a, accent: 0xd9a83a, build: 'broad' },
    bio: 'Ganger of the Gildport dockers, who unload the barges that come up the gold-silt from the Marsh. She has never liked a cargo she wasn’t allowed to look at.',
  },
  {
    id: 'npc:interest-courier', name: 'Interest', title: 'Dot Brine’s parrot, a long way from the reef', school: 'guile', origin: 'guile', trust: 2,
    region: 'region:alder', home: 'landmark:gate-circle',
    // Act II at the Gate Circle with Dot's letter; Act III at the Heart camp with Dot's IOU
    presentWhen: { all: [CS, { flag: 'corsair.interest_pet' }, { any: [{ questActive: 'quest:corsair-a-bottle-from-dot' }, at('quest:corsair-dots-iou', 'iou')] }] },
    schedule: [{ from: 0, to: 24, at: 'landmark:heart-camp', activity: 'idle', when: at('quest:corsair-dots-iou', 'iou') }],
    dialogue: [
      { when: at('quest:corsair-dots-iou', 'iou'), dialogue: 'dialogue:corsair-interest-iou' },
      { dialogue: 'dialogue:corsair-interest-letter' },
    ],
    barks: [{ lines: ['(Interest is sitting on the Guile arch with a letter in his claws, shouting “PAY UP!” at passing wolves.)'] }],
    roles: ['quest'],
    look: { skin: 0x3aa84a, cloth: 0xd83a2a, accent: 0xffd36a, build: 'short' },
    bio: 'Dot’s parrot, who flew back through the Pawned Gate to Gallows Reef on his own and has now flown all the way back with a letter, compounding.',
  },
  // ---------- Act III (the Heart)
  {
    id: 'npc:captain-nobody', name: 'Captain Nobody', title: 'of the Merry Widow, lost', school: 'guile', origin: 'guile', trust: 1,
    region: 'region:heart', home: 'landmark:twelve-stairs-top',
    // only for the first part: once his name is settled he is gone, and the Widow and her bell carry the rest
    presentWhen: { all: [CS, at('quest:corsair-nobodys-name', 'nobody')] },
    dialogue: [{ dialogue: 'dialogue:corsair-nobody' }],
    barks: [{ lines: ['(He turns his hat round and round in his hands. He has no face to turn with it.)', 'Forty years. Forty years in somebody else’s pocket.'] }],
    roles: ['quest'],
    look: { skin: 0x9aa8b0, hair: 0x4a5a6a, cloth: 0x2a3a4a, accent: 0xb8d8e8, build: 'tall' },
    bio: 'The ghost captain of the Merry Widow, who sold his name for a ship forty years ago to a nameless wharf-boy of Gallows Reef, and has been nobody ever since. He has followed his contract into the Heart.',
  },
];

export default npcs;
