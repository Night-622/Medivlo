/**
 * Hollow Crown, the Greywilds: Hawkmoor NPCs for the Falconer campaign (docs/lore/hollow-crown/06-outlines/hunt.md),
 * plus the Falconer's Concordia NPCs (the cormorant fishers, the C-4 informant, the C-6 messengers).
 * Zones: zone:hunt-frontier-1 the Mews Cliffs, -2 the Hawkmoor, -3 the Windscour Plain, -4 the Featherfall. Owner: Claude 4.
 */
import type { NarrativeCondition, NpcDef } from '@/core';

const FA: NarrativeCondition = { heroClass: 'falconer' };
const at = (q: `quest:${string}`, stage: string): NarrativeCondition => ({ questStage: q, stage });
const Z1 = 'zone:hunt-frontier-1' as const, Z2 = 'zone:hunt-frontier-2' as const, Z3 = 'zone:hunt-frontier-3' as const, Z4 = 'zone:hunt-frontier-4' as const;
const ACT2: NarrativeCondition = { flag: 'story.act', op: '>=', value: 2 };

const npcs: NpcDef[] = [
  {
    id: 'npc:old-wren', name: 'Old Wren', title: 'Eldest of the Mews', school: 'hunt', origin: 'hunt', trust: 3,
    services: ['Mentor', 'Trains Falconers'], region: Z1, home: 'landmark:wren-ledge', lore: 'lore:hc-old-wren',
    presentWhen: FA,
    dialogue: [
      { when: at('quest:falconer-the-bell-over-the-moor', 'wren'), dialogue: 'dialogue:falconer-wren-bell' },
      { when: at('quest:falconer-the-falling-birds', 'report'), dialogue: 'dialogue:falconer-wren-count' },
      { when: at('quest:falconer-the-bear-cave', 'report'), dialogue: 'dialogue:falconer-wren-bear' },
      { when: at('quest:falconer-the-gentle-stranger', 'wren'), dialogue: 'dialogue:falconer-wren-stranger' },
      { when: at('quest:falconer-what-the-hood-holds', 'wren'), dialogue: 'dialogue:falconer-wren-teodor' },
      { when: at('quest:falconer-cut-jesses', 'wren'), dialogue: 'dialogue:falconer-wren-farewell' },
      { when: at('quest:falconer-the-first-hood', 'burn'), dialogue: 'dialogue:falconer-wren-hood' },
      { when: at('quest:falconer-pibbs-eyes', 'wren'), dialogue: 'dialogue:falconer-wren-eyes' },
      { when: at('quest:falconer-pibb-wont-come-down', 'wren'), dialogue: 'dialogue:falconer-wren-pibb-back' },
      { dialogue: 'dialogue:falconer-wren' },
    ],
    barks: [{ lines: ['I can see you. Well. Pibb can see you, and he isn’t impressed.', 'Never hood a bird that’s only frightened. Frightened is how they stay alive.', 'Sit down. You’re blocking my kestrel.'] }],
    roles: ['quest', 'trainer'], essential: true,
    look: { skin: 0xd8b8a0, hair: 0xe8e4dc, cloth: 0x5a5a3a, accent: 0xd9b45a, build: 'slight' },
    bio: 'The eldest falconer of the Mews, half blind, who has seen through the eyes of her kestrel Pibb for twenty years. She taught the hero to fly their first bird. She laughs at almost everything, and has never in her life hooded a bird that was only frightened.',
  },
  {
    id: 'npc:pibb', name: 'Pibb', title: 'Old Wren’s kestrel', school: 'hunt', origin: 'hunt', trust: 2,
    region: Z1, home: 'landmark:wren-ledge', presentWhen: { all: [FA, { not: { flag: 'falconer.pibb_pet' } }] },
    schedule: [{ from: 0, to: 24, at: 'landmark:mews-chapel-roof', activity: 'idle', when: at('quest:falconer-pibb-wont-come-down', 'coax') }],
    dialogue: [
      { when: at('quest:falconer-pibb-wont-come-down', 'coax'), dialogue: 'dialogue:falconer-pibb-roof' },
      { dialogue: 'dialogue:falconer-pibb' },
    ],
    barks: [{ lines: ['(Pibb looks at you, then at Wren, then back at you, and reports.)', '(A small, offended kek.)', '(He fluffs up to twice his size and refuses to explain.)'] }],
    roles: ['ambient'],
    look: { skin: 0xb07a4a, cloth: 0x8a6a4a, accent: 0x4a6a8a, build: 'short' },
    bio: 'Old Wren’s kestrel and her eyes. Small, vain and tireless, he has opinions about perches, weather and most people.',
  },
  {
    id: 'npc:hooded-man', name: 'The Hooded Man', title: 'a stranger on the Mews Cliffs', school: 'hunt', origin: 'hunt', trust: 2,
    region: Z1, home: 'landmark:mews-cliff-perches', lore: 'lore:hc-hooded-man',
    // Act I on the Hawkmoor; Act III, beaten on the stair top, waiting for his fate (the scene must be reopenable)
    presentWhen: {
      all: [FA, {
        any: [
          { all: [{ any: [{ questActive: 'quest:falconer-the-gentle-stranger' }, { questCompleted: 'quest:falconer-the-gentle-stranger' }] }, { not: { flag: 'falconer.halfstone' } }] },
          at('quest:falconer-the-eyes-of-the-chimera', 'fate'),
        ],
      }],
    },
    schedule: [
      { from: 0, to: 24, at: 'landmark:twelve-stairs-top', activity: 'idle', when: at('quest:falconer-the-eyes-of-the-chimera', 'fate') },
      { from: 0, to: 24, at: 'landmark:quiet-steading', activity: 'idle', when: at('quest:falconer-what-the-hood-holds', 'teodor') },
    ],
    dialogue: [
      { when: at('quest:falconer-the-eyes-of-the-chimera', 'fate'), dialogue: 'dialogue:falconer-herald-fate' },
      { when: at('quest:falconer-the-gentle-stranger', 'stranger'), dialogue: 'dialogue:falconer-teodor-stranger' },
      { when: at('quest:falconer-what-the-hood-holds', 'teodor'), dialogue: 'dialogue:falconer-teodor-steading' },
      { dialogue: 'dialogue:falconer-teodor' },
    ],
    barks: [{ lines: ['Shh. There. Isn’t that better?', 'Nothing needs to be frightened. Nothing at all.', 'Hold still. It only takes a moment.'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xd8b090, hair: 0x4a3a2a, cloth: 0x3a3028, accent: 0x6a5a3a, build: 'average' },
    bio: 'A soft-spoken falconer in a leather hood that covers his eyes, who walked into the Mews with a panicking falcon and calmed it in a moment. He hoods frightened birds so gently that they settle at once, and everybody likes him.',
  },
  {
    id: 'npc:agatha-spurling', name: 'Mews-Mother Agatha Spurling', title: 'Eldest of the Mews council', school: 'hunt', origin: 'hunt', trust: 1,
    region: Z1, home: 'landmark:mews-cliff-perches', presentWhen: FA,
    dialogue: [
      { when: at('quest:falconer-the-hooding', 'vote'), dialogue: 'dialogue:falconer-hooding-vote' },
      { dialogue: 'dialogue:falconer-spurling' },
    ],
    barks: [{ lines: ['Order on the perches. Order!', 'The Mews has voted on everything for a thousand years. It has never once agreed.'] }],
    roles: ['quest'],
    look: { skin: 0xc8a080, hair: 0x9a9a9a, cloth: 0x4a4a2a, accent: 0xd9b45a, build: 'broad' },
    bio: 'Head of the Mews council, a broad, loud woman with a goshawk called the Countess and a gavel she bangs on the nearest rock.',
  },
  {
    id: 'npc:hamo-pickering', name: 'Hamo Pickering', title: 'Envoy of the Great Lodge', school: 'hunt', origin: 'hunt', trust: 1,
    region: Z1, home: 'landmark:mews-cliff-perches',
    presentWhen: { all: [FA, { any: [{ questActive: 'quest:falconer-the-gentle-stranger' }, { questActive: 'quest:falconer-the-hooding' }] }] },
    dialogue: [
      { when: at('quest:falconer-the-hooding', 'canvass'), dialogue: 'dialogue:falconer-pickering-canvass' },
      { dialogue: 'dialogue:falconer-pickering' },
    ],
    barks: [{ lines: ['Master Bannock sends his regards. And a request. Mostly a request.', 'Antlerford needs hawks. It needs them very much.'] }],
    roles: ['ambient'],
    look: { skin: 0xd8a888, hair: 0x6a4a2a, cloth: 0x6e5a28, accent: 0xd9b45a, build: 'average' },
    bio: 'An earnest young Huntsman sent up from Antlerford by the Great Lodge to ask the Mews for hawks. He has never been this high up in his life and keeps holding onto things.',
  },
  {
    id: 'npc:odile-thistlewood', name: 'Odile Thistlewood', title: 'Jess-maker of the Mews', school: 'hunt', origin: 'hunt', trust: 2,
    region: Z1, home: 'landmark:jess-maker-hut', presentWhen: FA,
    dialogue: [
      { when: at('quest:falconer-the-jess-makers-knots', 'odile'), dialogue: 'dialogue:falconer-odile-knot' },
      { dialogue: 'dialogue:falconer-odile' },
    ],
    barks: [{ lines: ['Every bird a different knot. Every knot a different bird.', 'My hands shake now. The knots don’t. Not yet.'] }],
    roles: ['quest'],
    look: { skin: 0xe0c0a8, hair: 0xb8b0a0, cloth: 0x6a5a4a, accent: 0x8a6a3a, build: 'slight' },
    bio: 'The Mews’ jess-maker for fifty years, who ties a different knot for every bird on the cliffs. Her hands have begun to shake, and she is afraid the knots will go with them.',
  },
  {
    id: 'npc:amos-coyle', name: 'Shepherd Amos Coyle', title: 'of the Hawkmoor', school: 'hunt', origin: 'hunt', trust: 1,
    region: Z2, home: 'landmark:coyle-steading', presentWhen: FA,
    dialogue: [
      { when: at('quest:falconer-the-bear-cave', 'fold'), dialogue: 'dialogue:falconer-coyle-bear' },
      { when: at('quest:falconer-shepherd-coyles-dog', 'coyle'), dialogue: 'dialogue:falconer-coyle-sort' },
      { dialogue: 'dialogue:falconer-coyle' },
    ],
    barks: [{ lines: ['Thirty sheep, one dog, nineteen hawks. That’s not the right way round.', 'Come by, Wimble. Come by! Not the hawks!'] }],
    roles: ['quest'],
    look: { skin: 0xb88a6a, hair: 0x8a6a4a, cloth: 0x6a6a4a, accent: 0xa8a890, build: 'average' },
    bio: 'A Hawkmoor shepherd of few words and much patience, nearly all of which is being used up by his sheepdog, Wimble.',
  },
  {
    id: 'npc:swithun-jessop', name: 'Swithun Jessop', title: 'Post-keeper of the Mews', school: 'hunt', origin: 'hunt', trust: 1,
    region: Z1, home: 'landmark:mews-post-loft', presentWhen: FA,
    dialogue: [
      { when: at('quest:falconer-the-hooding', 'canvass'), dialogue: 'dialogue:falconer-swithun-canvass' },
      { when: at('quest:falconer-the-moorland-post', 'swithun'), dialogue: 'dialogue:falconer-swithun-letter' },
      { when: at('quest:falconer-the-feather-counter', 'ring'), dialogue: 'dialogue:falconer-swithun-ring' },
      { dialogue: 'dialogue:falconer-swithun' },
    ],
    barks: [{ lines: ['Post by hawk, bounties by hand. Mind the droppings.', 'Every letter on the moor goes through this loft. I read none of them. Officially.'] }],
    roles: ['quest'],
    look: { skin: 0xd0a080, hair: 0x5a4a3a, cloth: 0x4a4a3a, accent: 0xb08a3a, build: 'short' },
    bio: 'Keeper of the Mews post-loft, which carries letters to the moor steadings by hawk, and of the bounty board, which carries everything else.',
  },
  {
    id: 'npc:ma-ketterick', name: 'Ma Ketterick', title: 'Bone-reader of the Windscour', school: 'hunt', origin: 'hunt', trust: 1,
    region: Z3, home: 'landmark:ketterick-camp', presentWhen: FA,
    dialogue: [
      { when: at('quest:falconer-bones-of-the-herd', 'ma'), dialogue: 'dialogue:falconer-ketterick-bones' },
      { dialogue: 'dialogue:falconer-ketterick' },
    ],
    barks: [{ lines: ['Bones don’t lie. They don’t say much either.', 'Every skeleton on this plain is telling the same story, and I’ve only heard the first half.'] }],
    roles: ['quest'],
    look: { skin: 0xa07a5a, hair: 0xd8d8d0, cloth: 0x7a5a3a, accent: 0xe8e4dc, build: 'short' },
    bio: 'An old woman who lives alone on the Windscour Plain and reads the herd bones there, which she says is like reading a letter with most of the words left out.',
  },
  {
    id: 'npc:edwy-pollard', name: 'Edwy Pollard', title: 'of the Windscour Plain', school: 'hunt', origin: 'hunt', trust: 2,
    region: Z3, home: 'landmark:quiet-steading', presentWhen: FA,
    schedule: [{ from: 0, to: 24, at: 'landmark:hawkmoor-gate-road', activity: 'idle', when: at('quest:falconer-the-quiet-steading', 'wake') }],
    dialogue: [
      { when: at('quest:falconer-the-quiet-steading', 'promise'), dialogue: 'dialogue:falconer-edwy-promise' },
      { when: at('quest:falconer-the-quiet-steading', 'wake'), dialogue: 'dialogue:falconer-edwy-wake' },
      { dialogue: 'dialogue:falconer-edwy' },
    ],
    barks: [{ lines: ['Mam’s asleep with her eyes open. That isn’t right, is it?', 'I made the tea myself. It’s a bit black.'] }],
    roles: ['quest'],
    look: { skin: 0xe8c4a8, hair: 0x8a5a2a, cloth: 0x6a5a3a, accent: 0xa8a890, build: 'short' },
    bio: 'A boy of nine from the Windscour Plain, the only one in his steading who was out with the goats when the stranger came, and so the only one who wasn’t hooded.',
  },
  {
    id: 'npc:elias-downe', name: 'Old Elias Downe', title: 'Feather-Counter of the Featherfall', school: 'hunt', origin: 'hunt', trust: 2,
    region: Z4, home: 'landmark:feather-counter-cairn', presentWhen: FA,
    dialogue: [
      { when: at('quest:falconer-grandmother-talon', 'elias'), dialogue: 'dialogue:falconer-elias-eyrie' },
      { when: at('quest:falconer-the-feather-counter', 'elias'), dialogue: 'dialogue:falconer-elias-ring' },
      { when: at('quest:falconer-fledglings', 'names'), dialogue: 'dialogue:falconer-elias-names' },
      { dialogue: 'dialogue:falconer-elias' },
    ],
    barks: [{ lines: ['Eleven thousand, four hundred and six. Seven. Oh. Seven.', 'Every one gets a name. It’s the least anyone can do.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b8a0, hair: 0xe8e4dc, cloth: 0x4a4a3a, accent: 0xe8e4dc, build: 'slight' },
    bio: 'An old man who has lived at the bottom of the Featherfall for thirty years, counting and naming every bird that falls there, and building a cairn of stones with their names scratched on.',
  },
  // ---------- Act II (Concordia)
  {
    id: 'npc:prudence-gannet', name: 'Prudence Gannet', title: 'Cormorant fisher of the Wend', school: 'hunt', origin: 'hunt', trust: 1,
    region: 'region:abbey', home: 'landmark:shore-ferry-house',
    presentWhen: ACT2,
    dialogue: [
      { when: at('quest:falconer-the-cormorant-boats', 'boats'), dialogue: 'dialogue:falconer-prudence' },
      { when: at('quest:falconer-the-white-stag', 'tell'), dialogue: 'dialogue:falconer-prudence-stag' },
      { dialogue: 'dialogue:hunt-prudence' },
    ],
    barks: [{ lines: ['Mind the birds. They bite, and they’re right to.', 'Never hooded a bird in my life. Never will.', 'Fish are leaving the river. My birds know where they’ve gone.'] }],
    roles: ['quest'],
    look: { skin: 0xc8946e, hair: 0x6a6a6a, cloth: 0x3a4a4a, accent: 0xd9b45a, build: 'broad' },
    bio: 'The eldest of the Hawkmoor exiles who fish the Wend with cormorants from under Tamsin Reed’s ferry. They came down to Concordia for the Turning fair in C. 1011 and never got home, and they have never once hooded a bird.',
  },
  {
    id: 'npc:bartle-crisp', name: 'Bartle Crisp', title: 'Landlord of the Lightning Jar', school: 'storm', origin: 'concord', trust: 1,
    region: 'region:storm', home: 'landmark:cliff-lightning-jar',
    presentWhen: ACT2,
    // C-4: after the escort he waits on the supper ledge with the fish
    schedule: [{ from: 0, to: 24, at: 'landmark:falconer-supper-ledge', activity: 'idle', when: { all: [FA, at('quest:falconer-the-hooded-crow', 'hear')] } }],
    dialogue: [
      { when: at('quest:falconer-the-hooded-crow', 'bartle'), dialogue: 'dialogue:falconer-bartle' },
      { when: at('quest:falconer-the-hooded-crow', 'hear'), dialogue: 'dialogue:falconer-bartle-ledge' },
      { dialogue: 'dialogue:falconer-bartle-general' },
    ],
    barks: [{ lines: ['Quiet tonight. Too quiet. I don’t like it quiet.', 'Thirty years of screaming and I’d got used to it.'] }],
    roles: ['quest', 'merchant'],
    look: { skin: 0xd0a080, hair: 0x2a2a30, cloth: 0x4a5aa8, accent: 0xffe14a, build: 'broad' },
    bio: 'Landlord of the Lightning Jar at Cliffstair, whose customers drink to the sound of the Stormcrow screaming overhead. It has stopped, and he cannot sleep.',
  },
  {
    id: 'npc:pibb-courier', name: 'Pibb', title: 'Old Wren’s kestrel, far from home', school: 'hunt', origin: 'hunt', trust: 2,
    region: 'region:alder', home: 'landmark:gate-circle',
    presentWhen: { all: [FA, { questActive: 'quest:falconer-wrens-letter' }, { not: { flag: 'falconer.pibb_pet' } }] },
    dialogue: [{ dialogue: 'dialogue:falconer-pibb-letter' }],
    barks: [{ lines: ['(Pibb is sitting on the Hunt arch, holding out one foot with a letter on it, very grandly.)'] }],
    roles: ['quest'],
    look: { skin: 0xb07a4a, cloth: 0x8a6a4a, accent: 0x4a6a8a, build: 'short' },
    bio: 'Old Wren’s kestrel, sent over the Antler Gate and across Concordia with a letter. Wren is seeing all of this through his eyes, and so is he.',
  },
  {
    id: 'npc:moor-pigeon', name: 'Captain Plumley', title: 'a moor pigeon', school: 'hunt', origin: 'hunt', trust: 2,
    region: 'region:alder', home: 'landmark:gate-circle',
    presentWhen: { all: [FA, { questActive: 'quest:falconer-wrens-letter' }, { flag: 'falconer.pibb_pet' }] },
    dialogue: [{ dialogue: 'dialogue:falconer-plumley-letter' }],
    barks: [{ lines: ['(The pigeon puffs out his chest until he is nearly round.)', '(Coo. Importantly.)'] }],
    roles: ['quest'],
    look: { skin: 0x8a8a9a, cloth: 0x6a6a7a, accent: 0x6aa86a, build: 'short' },
    bio: 'A moor pigeon from the Mews post-loft, sent across Concordia with a letter, which is the most important thing that has ever happened to him.',
  },
];

export default npcs;
