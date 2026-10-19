/**
 * Hollow Crown, Wildheart: Thornwilds NPCs for the Ranger campaign (06-outlines/verdant.md). Zones:
 * zone:verdant-frontier-1 Wayfarer’s Rest, -2 the Thornwilds, -3 the Bloomfen, -4 the Rotwood. Owner: Claude 4.
 */
import type { NarrativeCondition, NpcDef } from '@/core';

const RG: NarrativeCondition = { heroClass: 'ranger' };
const at = (q: `quest:${string}`, stage: string): NarrativeCondition => ({ questStage: q, stage });
const Z1 = 'zone:verdant-frontier-1' as const, Z2 = 'zone:verdant-frontier-2' as const, Z3 = 'zone:verdant-frontier-3' as const, Z4 = 'zone:verdant-frontier-4' as const;

const npcs: NpcDef[] = [
  {
    id: 'npc:holt-barrow', name: 'Holt Barrow', title: 'Warden-of-Ways of the Wayfarers', school: 'verdant', origin: 'verdant', trust: 2,
    services: ['Mentor', 'Trains Rangers'], region: Z1, home: 'landmark:holt-lookout', lore: 'lore:hc-holt-barrow',
    presentWhen: RG,
    schedule: [
      { from: 0, to: 24, at: 'landmark:burning-line', activity: 'idle', when: at('quest:ranger-the-burning-line', 'vote') },
      { from: 0, to: 24, at: 'landmark:old-rot-stump', activity: 'idle', when: at('quest:ranger-the-old-rot', 'holt') },
      { from: 0, to: 24, at: 'landmark:ranger-map-stone', activity: 'idle', when: { any: [at('quest:ranger-the-bell-in-the-thorns', 'paths'), at('quest:ranger-the-bell-in-the-thorns', 'map')] } },
    ],
    dialogue: [
      { when: at('quest:ranger-the-bell-in-the-thorns', 'map'), dialogue: 'dialogue:ranger-holt-map' },
      { when: at('quest:ranger-the-bell-in-the-thorns', 'holt'), dialogue: 'dialogue:ranger-holt-bell' },
      { when: at('quest:ranger-walk-the-ways', 'report'), dialogue: 'dialogue:ranger-holt-blight' },
      { when: at('quest:ranger-the-wallow', 'report'), dialogue: 'dialogue:ranger-holt-wallow' },
      { when: at('quest:ranger-the-rotking-returns', 'holt'), dialogue: 'dialogue:ranger-holt-aldo-home' },
      { when: at('quest:ranger-the-burning-line', 'vote'), dialogue: 'dialogue:ranger-burning-line' },
      { when: at('quest:ranger-the-rotkings-crown', 'holt'), dialogue: 'dialogue:ranger-holt-turned' },
      { when: at('quest:ranger-the-last-waymark', 'farewell'), dialogue: 'dialogue:ranger-holt-farewell' },
      { when: at('quest:ranger-holt-and-aldo', 'holt'), dialogue: 'dialogue:ranger-holt-aldo-blaze' },
      { when: at('quest:ranger-the-old-rot', 'holt'), dialogue: 'dialogue:ranger-holt-old-rot' },
      { dialogue: 'dialogue:ranger-holt' },
    ],
    barks: [{ lines: ['Hm.', 'A beetle, a boar and a Circle witch… later.', 'Paths moved again. Course they did.'] }],
    roles: ['quest', 'trainer'], essential: true,
    look: { skin: 0xb88a6a, hair: 0x8a8a7a, cloth: 0x3a4a2a, accent: 0x8a6a3a, build: 'tall' },
    bio: 'Warden-of-Ways of the Wayfarers, laconic, weathered, smelling of pine. He has walked every path in the Thornwilds, and has been trying to finish one joke for the whole of the hero’s life. Something always interrupts him.',
  },
  {
    id: 'npc:aldo-mire', name: 'Aldo Mire', title: 'the Rotking', school: 'verdant', origin: 'verdant', trust: 3,
    region: Z1, home: 'landmark:wayfarer-fire', lore: 'lore:hc-aldo-mire',
    // Act I in the Thornwilds; Act III, beaten on the stair top, waiting for his fate (the scene must be reopenable)
    presentWhen: {
      all: [RG, {
        any: [
          { all: [{ any: [{ questActive: 'quest:ranger-the-rotking-returns' }, { questCompleted: 'quest:ranger-the-rotking-returns' }] }, { not: { flag: 'ranger.halfstone' } }] },
          at('quest:ranger-the-herald-of-rot', 'fate'),
        ],
      }],
    },
    schedule: [
      { from: 0, to: 24, at: 'landmark:twelve-stairs-top', activity: 'idle', when: at('quest:ranger-the-herald-of-rot', 'fate') },
      { from: 0, to: 24, at: 'landmark:rotking-throne', activity: 'idle', when: at('quest:ranger-the-rotkings-crown', 'aldo') },
      { from: 0, to: 24, at: 'landmark:ranger-aldo-plot', activity: 'idle', when: { any: [at('quest:ranger-the-rotking-returns', 'walk'), at('quest:ranger-the-rotking-returns', 'plot')] } },
    ],
    dialogue: [
      { when: at('quest:ranger-the-herald-of-rot', 'fate'), dialogue: 'dialogue:ranger-herald-fate' },
      { when: at('quest:ranger-the-rotking-returns', 'aldo'), dialogue: 'dialogue:ranger-aldo-home' },
      { when: at('quest:ranger-the-rotking-returns', 'plot'), dialogue: 'dialogue:ranger-aldo-plot' },
      { when: at('quest:ranger-the-rotkings-crown', 'aldo'), dialogue: 'dialogue:ranger-aldo-crown' },
      { dialogue: 'dialogue:ranger-aldo' },
    ],
    barks: [{ lines: ['Mushroom? Go on. Best thing you’ll ever eat.', 'The rot’s not the enemy, Holt. It’s the cook.', 'Listen. Hear that? Things falling down. Lovely.'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xb0a088, hair: 0x9a9a8a, cloth: 0x5a5a4a, accent: 0xc8b89a, build: 'broad' },
    bio: 'Holt Barrow’s oldest friend, a big laughing Wayfarer who was lost in the Rotwood for a year and walked home with shelf-fungus in his beard and a basket of perfect mushrooms. He always was the best cook in the camp.',
  },
  {
    id: 'npc:dunmore-fitch', name: 'Cook Dunmore Fitch', title: 'Cook of Wayfarer’s Rest', school: 'verdant', origin: 'verdant', trust: 2,
    region: Z1, home: 'landmark:wayfarer-fire', presentWhen: RG,
    dialogue: [{ dialogue: 'dialogue:ranger-dunmore' }],
    barks: [{ lines: ['Eleven years. ELEVEN.', 'If you see a red squirrel, it owes me a sack of salt.'] }],
    roles: ['quest'],
    look: { skin: 0xd0a080, hair: 0x6a3a2a, cloth: 0x8a7a5a, accent: 0xc84a3a, build: 'broad' },
    bio: 'The Wayfarers’ cook, whose stew is famous and whose salt has been stolen by the same red squirrel every day for eleven years.',
  },
  {
    id: 'npc:davy-fernsby', name: 'Davy Fernsby', title: 'Wayfarer of the Rest', school: 'verdant', origin: 'verdant', trust: 2,
    region: Z1, home: 'landmark:wayfarer-memorial-tree', presentWhen: RG,
    dialogue: [{ dialogue: 'dialogue:ranger-davy' }],
    barks: [{ lines: ['You can’t carve a Wayfarer without her bow.', 'Kit would’ve hated the fuss.'] }],
    roles: ['quest'],
    look: { skin: 0xe0b898, hair: 0xb8743a, cloth: 0x4a5a3a, accent: 0xb87a4a, build: 'slight' },
    bio: 'A young Wayfarer whose sister Kit went out on the trail in the spring and did not come back. Her name is to be carved on the memorial tree this year.',
  },
  {
    id: 'npc:sister-morel', name: 'Sister Morel', title: 'Herbalist of the Wayfarers', school: 'verdant', origin: 'verdant', trust: 2,
    region: Z1, home: 'landmark:wayfarer-fire', presentWhen: RG,
    dialogue: [{ dialogue: 'dialogue:ranger-morel' }],
    barks: [{ lines: ['I’ve eaten everything that grows out here. Some of it twice.', 'Don’t eat that. Or that. You can eat that.'] }],
    roles: ['quest'],
    look: { skin: 0xc8a888, hair: 0x4a3a2a, cloth: 0x6a4a3a, accent: 0xd8c8a0, build: 'average' },
    bio: 'The Wayfarers’ herbalist, who has tasted every mushroom in the Thornwilds and can tell a good one by the spore print. Aldo’s mushrooms worry her very much.',
  },
  {
    id: 'npc:marjory-burrell', name: 'Marjory Burrell', title: 'Keeper of the bounty-stake', school: 'verdant', origin: 'verdant', trust: 1,
    region: Z1, home: 'landmark:wayfarer-bounty-stake', presentWhen: RG,
    dialogue: [{ dialogue: 'dialogue:ranger-marjory' }],
    barks: [{ lines: ['Bounties on the stake. Paid in coin.', 'I did NOT take the silver spoon.'] }],
    roles: ['quest'],
    look: { skin: 0xb8886a, hair: 0x2a2a20, cloth: 0x5a4a2a, accent: 0xb08a3a, build: 'short' },
    bio: 'Keeper of the Wayfarers’ bounty-stake, who pays out fairly and has been accused of stealing a silver spoon for six years running.',
  },
  {
    id: 'npc:cobb-tinsley', name: 'Cobb Tinsley', title: 'Pedlar of the Thornwilds', school: 'verdant', origin: 'verdant', trust: 2,
    region: Z2, home: 'landmark:gerald-the-tree', presentWhen: RG,
    schedule: [{ from: 0, to: 24, at: 'landmark:ranger-cobb-pitch', activity: 'idle', when: { any: [at('quest:ranger-the-path-that-likes-him', 'walk'), at('quest:ranger-the-path-that-likes-him', 'stall'), { questCompleted: 'quest:ranger-the-path-that-likes-him' }] } }],
    dialogue: [
      { when: at('quest:ranger-the-path-that-likes-him', 'stall'), dialogue: 'dialogue:ranger-cobb-stall' },
      { when: { questCompleted: 'quest:ranger-the-path-that-likes-him' }, dialogue: 'dialogue:ranger-cobb-after' },
      { dialogue: 'dialogue:ranger-cobb' },
    ],
    barks: [{ lines: ['Four days. Same tree. I’ve named it Gerald.', 'Pins, ribbons, needles, a very good teapot.'] }],
    roles: ['quest'],
    look: { skin: 0xe0c0a0, hair: 0x8a6a4a, cloth: 0x7a4a6a, accent: 0xe8c86a, build: 'slight' },
    bio: 'A pedlar who walks the Thornwilds with a pack of pins and ribbons, and who has been walking in a circle round one tree for four days.',
  },
  {
    id: 'npc:ivo-pennick', name: 'Old Ivo Pennick', title: 'Fiddler of the Wayfarers', school: 'verdant', origin: 'verdant', trust: 2,
    region: Z2, home: 'landmark:pennick-camp', presentWhen: RG,
    dialogue: [{ dialogue: 'dialogue:ranger-ivo' }],
    barks: [{ lines: ['Fifty years I played it. Gone, like a wiped slate.', '(He plays a few bars, and stops, and shakes his head.)'] }],
    roles: ['quest'],
    look: { skin: 0xc8a080, hair: 0xd8d8d0, cloth: 0x4a3a2a, accent: 0xa87a4a, build: 'slight' },
    bio: 'The Wayfarers’ old fiddler, who played the Still Tune for fifty years and woke one morning to find it gone out of his head.',
  },
  {
    id: 'npc:dilys-marram', name: 'Dilys Marram', title: 'a bride of the Bloomfen', school: 'verdant', origin: 'verdant', trust: 2,
    region: Z3, home: 'landmark:fen-wedding-green', presentWhen: RG,
    dialogue: [{ dialogue: 'dialogue:ranger-dilys' }],
    barks: [{ lines: ['Married at noon. Lilies by eleven. Best man by half past.', 'Real ones nod with the wind.'] }],
    roles: ['quest'],
    look: { skin: 0xe8c4a8, hair: 0xd8a84a, cloth: 0xf0ece0, accent: 0x6ab86a, build: 'average' },
    bio: 'A Bloomfen girl getting married at noon, who needs real lilies, and her best man back in one piece.',
  },
  {
    id: 'npc:old-cattail', name: 'Old Cattail', title: 'Counter of the Bloomkin', school: 'verdant', origin: 'verdant', trust: 2,
    region: Z3, home: 'landmark:bloomkin-census-stone', presentWhen: RG,
    dialogue: [
      { when: at('quest:ranger-the-burning-line', 'cattail'), dialogue: 'dialogue:ranger-cattail-line' },
      { dialogue: 'dialogue:ranger-cattail' },
    ],
    barks: [{ lines: ['One… hundred… and… oh.', '(It bends, very slowly, in no wind at all.)'] }],
    roles: ['quest'],
    look: { skin: 0x8a6a3a, hair: 0x5a3a1a, cloth: 0x6a8a3a, build: 'tall' },
    bio: 'A solemn bulrush of a Bloomkin, as tall as a man, chosen to count the Bloomkin of the fen because it is the slowest to lose its temper. It keeps losing count.',
  },
  {
    id: 'npc:primula-vetch', name: 'Envoy Primula Vetch', title: 'of the Root Circle', school: 'verdant', origin: 'verdant', trust: 1,
    region: Z3, home: 'landmark:burning-line', presentWhen: { all: [RG, { any: [{ questActive: 'quest:ranger-the-burning-line' }, { questCompleted: 'quest:ranger-the-burning-line' }] }, { not: { flag: 'ranger.halfstone' } }] },
    dialogue: [
      { when: at('quest:ranger-the-burning-line', 'envoy'), dialogue: 'dialogue:ranger-vetch-envoy' },
      { dialogue: 'dialogue:ranger-vetch' },
    ],
    barks: [{ lines: ['Is the mud compulsory?', 'The Circle regrets it. From a great distance.'] }],
    roles: ['quest'],
    look: { skin: 0xe8d0b8, hair: 0x3a2a20, cloth: 0x2a4a2a, accent: 0xe8d87a, build: 'slight' },
    bio: 'An envoy of the Root Circle, sent out from Rootholme to the wilds with an order nobody wanted to carry. She has never had mud on her boots before, and does not intend to start.',
  },
  {
    id: 'npc:bram-hatchley', name: 'Bram Hatchley', title: 'Woodcutter of the Rotwood', school: 'verdant', origin: 'verdant', trust: 1,
    region: Z4, home: 'landmark:hatchley-cottage', presentWhen: RG,
    schedule: [{ from: 0, to: 24, at: 'landmark:ranger-rotwood-edge', activity: 'idle', when: { any: [at('quest:ranger-the-house-is-just-old', 'edge'), at('quest:ranger-the-house-is-just-old', 'stump')] } }],
    dialogue: [
      { when: at('quest:ranger-the-house-is-just-old', 'stump'), dialogue: 'dialogue:ranger-bram-edge' },
      { dialogue: 'dialogue:ranger-bram' },
    ],
    barks: [{ lines: ['It’s not rotten. It’s old. Same as me.', 'Nobody’s asking me to leave my knees.'] }],
    roles: ['quest'],
    look: { skin: 0xb08a6a, hair: 0xc8c8c0, cloth: 0x5a4a3a, accent: 0x8a6a4a, build: 'broad' },
    bio: 'An old woodcutter who has lived on the edge of the Rotwood for fifty years and will not leave his half-rotted cottage.',
  },
  // ---------- Act II
  {
    id: 'npc:bloomkin-scout', name: 'Fernhat', title: 'a Bloomkin scout', school: 'verdant', origin: 'verdant', trust: 3,
    region: 'region:gloam', home: 'landmark:gloam-stag-glade',
    presentWhen: { all: [RG, { flag: 'story.act', op: '>=', value: 2 }, { flag: 'ranger.line', value: 'hold' }] },
    dialogue: [{ dialogue: 'dialogue:ranger-fernhat' }],
    barks: [{ lines: ['You held the line for us. I will hold the path for you.', '(It adjusts its fern.)'] }],
    roles: ['ambient'],
    look: { skin: 0x6a8a4a, hair: 0x3a6a2a, cloth: 0x4a6a3a, build: 'short' },
    bio: 'A small Bloomkin of the Bloomfen with a fern for a hat, who came through the Thorn Gate behind the Ranger who held the line for its people.',
  },
];

export default npcs;
