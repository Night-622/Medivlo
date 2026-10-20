/**
 * Hollow Crown, Mountainreach: Stonecloister NPCs for the Monk campaign (docs/lore/hollow-crown/06-outlines/fist.md),
 * plus the Monk's Concordia NPCs (the Welcome Hall in Briar Hollow, and Shirin's letter-bearers).
 * Zones: zone:fist-capital-1 the Thousand Stairs, -2 the Prayer Terraces, -3 the Bell Courts, -4 the Cloud Kitchen. Owner: Claude 4.
 */
import type { NarrativeCondition, NpcDef } from '@/core';

const MK: NarrativeCondition = { heroClass: 'monk' };
const at = (q: `quest:${string}`, stage: string): NarrativeCondition => ({ questStage: q, stage });
const Z1 = 'zone:fist-capital-1' as const, Z2 = 'zone:fist-capital-2' as const, Z3 = 'zone:fist-capital-3' as const, Z4 = 'zone:fist-capital-4' as const;

const npcs: NpcDef[] = [
  {
    id: 'npc:shirin-tal', name: 'Abbess Shirin Tal', title: 'Abbess of the High Monastery', school: 'fist', origin: 'fist', trust: 3,
    services: ['Mentor', 'Trains Monks'], region: Z3, home: 'landmark:abbess-rooms', lore: 'lore:hc-shirin-tal',
    presentWhen: MK,
    schedule: [
      { from: 0, to: 24, at: 'landmark:landing-600-tea-stall', activity: 'idle', when: at('quest:monk-the-bell-on-the-stair', 'shirin') },
      { from: 0, to: 24, at: 'landmark:great-bell', activity: 'idle', when: at('quest:monk-the-empty-cells', 'vote') },
      { from: 0, to: 24, at: 'landmark:thousand-stairs-foot', activity: 'idle', when: at('quest:monk-the-long-descent', 'farewell') },
      { from: 0, to: 24, at: 'landmark:great-bell', activity: 'idle', when: { any: [at('quest:monk-the-bell-on-the-stair', 'climb'), at('quest:monk-the-bell-on-the-stair', 'bell')] } },
    ],
    dialogue: [
      { when: at('quest:monk-the-bell-on-the-stair', 'shirin'), dialogue: 'dialogue:monk-shirin-bell' },
      { when: at('quest:monk-the-bell-on-the-stair', 'bell'), dialogue: 'dialogue:monk-shirin-midnight' },
      { when: at('quest:monk-what-is-owed', 'abbess'), dialogue: 'dialogue:monk-shirin-kestrel-turned' },
      { when: at('quest:monk-tea-on-every-landing', 'shirin'), dialogue: 'dialogue:monk-shirin-urn' },
      { when: at('quest:monk-kestrel-comes-down', 'shirin'), dialogue: 'dialogue:monk-shirin-kestrel' },
      { when: at('quest:monk-the-empty-cells', 'vote'), dialogue: 'dialogue:monk-empty-cells' },
      { when: at('quest:monk-the-long-descent', 'farewell'), dialogue: 'dialogue:monk-shirin-farewell' },
      { when: at('quest:monk-stones-with-the-abbess', 'shirin'), dialogue: 'dialogue:monk-shirin-stones' },
      { when: at('quest:monk-the-thirtieth-move', 'shirin'), dialogue: 'dialogue:monk-shirin-thirtieth' },
      { when: { all: [at('quest:monk-tea-on-every-landing', 'cups'), { not: { flag: 'monk.delight.urn' } }] }, dialogue: 'dialogue:monk-delight-urn' },
      { dialogue: 'dialogue:monk-shirin' },
    ],
    barks: [{ lines: ['Stand still until you know which way to move.', 'Tea? I cheated a pilgrim out of it.', 'Mind the step. You know the one.'] }],
    roles: ['quest', 'trainer'], essential: true,
    look: { skin: 0xc8946e, hair: 0xe8e4dc, cloth: 0xd9a066, accent: 0x8a3a2a, build: 'slight' },
    bio: 'Abbess of the High Monastery at Stonecloister: serene, mischievous and the finest cheat at stones in Mountainreach. She raised the hero and Brother Kestrel, two foundlings left on the same stair in the same winter, and has not left Stonecloister in thirty years.',
  },
  {
    id: 'npc:kestrel', name: 'Brother Kestrel', title: 'of the King’s Climbers', school: 'fist', origin: 'fist', trust: 3,
    region: Z2, home: 'landmark:terrace-goat-pens', lore: 'lore:hc-kestrel',
    // Act I on the Terraces; Act III, beaten on the stair top inside the Chimera's arms, waiting for his fate (reopenable)
    presentWhen: { all: [MK, { any: [{ all: [{ questCompleted: 'quest:monk-the-guardian-hall' }, { not: { flag: 'monk.halfstone' } }] }, at('quest:monk-the-arms-of-the-chimera', 'fate')] }] },
    schedule: [
      { from: 0, to: 24, at: 'landmark:twelve-stairs-top', activity: 'idle', when: at('quest:monk-the-arms-of-the-chimera', 'fate') },
      { from: 0, to: 24, at: 'landmark:cloud-kitchen-hearth', activity: 'work', when: at('quest:monk-what-is-owed', 'kestrel') },
      { from: 0, to: 24, at: 'landmark:monk-foundling-stair', activity: 'idle', when: { any: [at('quest:monk-kestrel-comes-down', 'foundling'), at('quest:monk-kestrel-comes-down', 'basket')] } },
    ],
    dialogue: [
      { when: at('quest:monk-kestrel-comes-down', 'basket'), dialogue: 'dialogue:monk-kestrel-basket' },
      { when: at('quest:monk-the-arms-of-the-chimera', 'fate'), dialogue: 'dialogue:monk-herald-fate' },
      { when: at('quest:monk-kestrel-comes-down', 'kestrel'), dialogue: 'dialogue:monk-kestrel-home' },
      { when: at('quest:monk-what-is-owed', 'kestrel'), dialogue: 'dialogue:monk-kestrel-kitchen' },
      { dialogue: 'dialogue:monk-kestrel' },
    ],
    barks: [{ lines: ['Little one! Have you eaten? You never do.', 'We were robbed. You know we were.', '(His thumb is counting his beads without him.)'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xc8946e, hair: 0x2a1a14, cloth: 0x8a8a8a, accent: 0x1a1a1a, build: 'average' },
    bio: 'The hero’s foster-brother, found holding their foot in the same basket on the same stair. He left the cloister three years ago to serve the Mountain King. He is funnier than he used to be, and much sadder, and his prayer beads have gone black.',
  },
  {
    id: 'npc:gelek-amble', name: 'Night-Porter Gelek Amble', title: 'of the Thousand Stairs', school: 'fist', origin: 'fist', trust: 1,
    region: Z1, home: 'landmark:landing-600-tea-stall', presentWhen: MK,
    dialogue: [
      { when: { all: [{ questCompleted: 'quest:monk-the-bell-on-the-stair' }, { not: { flag: 'monk.delight.gelek' } }] }, dialogue: 'dialogue:monk-delight-gelek' },
      { dialogue: 'dialogue:monk-gelek' },
    ],
    barks: [{ lines: ['Bounties on the post. Do not play stones with the Abbess.', 'Six hundred stairs up, four hundred to go. Every night.'] }],
    roles: ['quest'],
    look: { skin: 0xb07a5a, hair: 0x3a2a20, cloth: 0x6a4a2a, accent: 0xd9a066, build: 'short' },
    bio: 'The night porter of the Thousand Stairs, who keeps the cloister’s bounty post and has lost every game of stones he has ever played against the Abbess.',
  },
  {
    id: 'npc:auntie-yuen', name: 'Auntie Yuen', title: 'of the tea stall on landing four hundred', school: 'fist', origin: 'fist', trust: 2,
    region: Z1, home: 'landmark:yuen-tea-stall', presentWhen: MK,
    // Act III: she carried the pot to the Heart camp, as she said she would
    // Forty Novices: escorted with her pot to the Legion camp, where she pours while you bring the novices back
    schedule: [
      { from: 0, to: 24, at: 'landmark:legion-camp', activity: 'idle', when: at('quest:monk-forty-novices', 'novices') },
      { from: 0, to: 24, at: 'landmark:heart-camp', activity: 'idle', when: { any: [{ questActive: 'quest:monk-forty-novices' }, at('quest:monk-sop-on-the-stair', 'yuen')] } },
    ],
    dialogue: [
      { when: at('quest:monk-forty-novices', 'yuen'), dialogue: 'dialogue:monk-yuen-heart' },
      { when: at('quest:monk-sop-on-the-stair', 'yuen'), dialogue: 'dialogue:monk-yuen-sop' },
      { when: { questActive: 'quest:monk-forty-novices' }, dialogue: 'dialogue:monk-yuen-heart' },
      { dialogue: 'dialogue:monk-yuen' },
    ],
    barks: [{ lines: ['Sixty years, a pot on the boil. I am not closing.', 'Sit up. Drink. More sugar.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b090, hair: 0xd0d0c8, cloth: 0x5a3a5a, accent: 0xd9a066, build: 'short' },
    bio: 'The oldest tea-stall keeper on the Thousand Stairs, sixty years on landing four hundred. Her customers have all gone up the mountain to the King, and she will not close.',
  },
  {
    id: 'npc:pema-lightfoot', name: 'Novice Pema Lightfoot', title: 'of the prayer-flag lines', school: 'fist', origin: 'fist', trust: 2,
    region: Z1, home: 'landmark:prayer-flag-lines', presentWhen: MK,
    dialogue: [{ dialogue: 'dialogue:monk-pema' }],
    barks: [{ lines: ['May my teachers know pies. No. Peace. Peace!', 'The Abbess reads them at dusk. Dusk is soon.'] }],
    roles: ['quest'],
    look: { skin: 0xe0b898, hair: 0x1a1a1a, cloth: 0xd9a066, accent: 0x8a3a2a, build: 'slight' },
    bio: 'A novice in charge of mending the prayer flags, who has mended them with great care and the wrong words.',
  },
  {
    id: 'npc:wyn-orchard', name: 'Brother Wyn Orchard', title: 'Keeper of the Terrace Goats', school: 'fist', origin: 'fist', trust: 2,
    region: Z2, home: 'landmark:terrace-goat-pens', presentWhen: MK,
    dialogue: [{ dialogue: 'dialogue:monk-wyn' }],
    barks: [{ lines: ['Goats are already enlightened. And insufferable about it.', 'Mind your sleeves. She likes sleeves.'] }],
    roles: ['quest'],
    look: { skin: 0xc8a080, hair: 0x6a4a2a, cloth: 0xb88a4a, accent: 0xe8e4dc, build: 'average' },
    bio: 'The cloister’s goatherd, or possibly the goats’ monk; the cloister has never settled the question.',
  },
  {
    id: 'npc:little-brother-sop', name: 'Little Brother Sop', title: 'novice, aged eight', school: 'fist', origin: 'fist', trust: 3,
    region: Z2, home: 'landmark:novice-dormitory', presentWhen: MK,
    // Act III: asleep on the Fist stair of the Twelve Stairs, then carried down to the Heart camp
    schedule: [
      { from: 0, to: 24, at: 'landmark:twelve-stairs-top', activity: 'idle', when: at('quest:monk-sop-on-the-stair', 'stair') },
      { from: 0, to: 24, at: 'landmark:heart-camp', activity: 'idle', when: at('quest:monk-sop-on-the-stair', 'yuen') },
    ],
    dialogue: [
      { when: { questActive: 'quest:monk-sop-on-the-stair' }, dialogue: 'dialogue:monk-sop-stair' },
      { dialogue: 'dialogue:monk-sop' },
    ],
    barks: [{ lines: ['I’m not lazy. I’m listening.', '(He is asleep standing up, in Crane Form.)'] }],
    roles: ['quest'],
    look: { skin: 0xe8c4a8, hair: 0x2a1a14, cloth: 0xd9a066, accent: 0x8a3a2a, build: 'short' },
    bio: 'A very small novice in a very large robe, who keeps falling asleep in the middle of his forms because he spends every night listening to a song from the top of the mountain.',
  },
  {
    id: 'npc:agnetha-hume', name: 'Sister Agnetha Hume', title: 'Ringer of the great bell', school: 'fist', origin: 'fist', trust: 1,
    region: Z3, home: 'landmark:great-bell', presentWhen: MK,
    dialogue: [
      { when: at('quest:monk-the-empty-cells', 'canvass'), dialogue: 'dialogue:monk-agnetha-canvass' },
      { dialogue: 'dialogue:monk-agnetha' },
    ],
    barks: [{ lines: ['Forty years at that rope. Stop looking at my arms.', 'Never pull on the up-stroke.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b8a0, hair: 0xe8e4dc, cloth: 0x8a3a2a, accent: 0xd9a066, build: 'broad' },
    bio: 'The ringer of Stonecloister’s great bell for forty years, every dawn without fail. Her arms are going, and she would rather die than say so.',
  },
  {
    id: 'npc:rosamund-inch', name: 'Sister Rosamund Inch', title: 'Keeper of the cell-roll', school: 'fist', origin: 'fist', trust: 2,
    region: Z3, home: 'landmark:empty-cells-cloister', presentWhen: MK,
    dialogue: [{ dialogue: 'dialogue:monk-rosamund' }],
    barks: [{ lines: ['The cell-roll does not add up.', 'Every leaver leaves a note. That is the rule.'] }],
    roles: ['quest'],
    look: { skin: 0xe8c8b0, hair: 0x8a6a4a, cloth: 0xd9a066, accent: 0x5a3a2a, build: 'slight' },
    bio: 'Keeper of the cloister’s cell-roll, which added up for three hundred years and no longer does.',
  },
  {
    id: 'npc:halvard-pottage', name: 'Cook-Brother Halvard Pottage', title: 'of the Cloud Kitchen', school: 'fist', origin: 'fist', trust: 2,
    region: Z4, home: 'landmark:cloud-kitchen-hearth', presentWhen: MK,
    dialogue: [{ dialogue: 'dialogue:monk-halvard' }],
    barks: [{ lines: ['Don’t lift that lid.', 'Last Tuesday I served a slime. I have not recovered.'] }],
    roles: ['quest'],
    look: { skin: 0xd0a080, hair: 0x5a3a2a, cloth: 0xe8e4dc, accent: 0xd9a066, build: 'broad' },
    bio: 'Cook-Brother of the Cloud Kitchen above the clouds, whose soup pots have been infiltrated by Stone Slimes and whose rice is going up the mountain to a King who does not eat it.',
  },
  {
    id: 'npc:bodhan-kreel', name: 'Bodhan Kreel', title: 'old porter of the King’s Climbers', school: 'fist', origin: 'fist', trust: 1,
    region: Z4, home: 'landmark:climbers-rice-store', presentWhen: MK,
    dialogue: [
      { when: at('quest:monk-the-empty-cells', 'canvass'), dialogue: 'dialogue:monk-bodhan-canvass' },
      { dialogue: 'dialogue:monk-bodhan' },
    ],
    barks: [{ lines: ['Carry things up. Carry things down. Mostly up.', 'I carried his pack on the road. Nobody ever asked me.'] }],
    roles: ['quest'],
    look: { skin: 0xb07a5a, hair: 0xd0d0c8, cloth: 0x8a8a8a, accent: 0x6a4a2a, build: 'broad' },
    bio: 'The King’s Climbers’ oldest porter, who carried Doran Kell’s pack on the road to Concordia in C. 1012 and has carried what he saw there ever since.',
  },
  // ---------- Act II (Concordia)
  {
    id: 'npc:faraj-stillwater', name: 'Brother Faraj Stillwater', title: 'of the Welcome Hall', school: 'fist', origin: 'fist', trust: 1,
    region: 'region:briar', home: 'landmark:fist-welcome-hall', lore: 'lore:hc-fist-welcome-hall',
    presentWhen: { flag: 'story.act', op: '>=', value: 2 },
    dialogue: [
      { when: at('quest:monk-the-ooze-sovereign', 'tell'), dialogue: 'dialogue:monk-faraj-abbot' },
      { when: at('quest:monk-the-welcome-hall', 'hall'), dialogue: 'dialogue:monk-faraj' },
      { dialogue: 'dialogue:fist-faraj' },
    ],
    barks: [{ lines: ['Welcome. Mind the step. It is half in the bog.', 'He is late. Thirty years late. We sweep anyway.'] }],
    roles: ['quest'],
    look: { skin: 0xb07a5a, hair: 0xe8e4dc, cloth: 0xd9a066, accent: 0x6a8a3a, build: 'slight' },
    bio: 'Eldest of the six Fist monks who came ahead in C. 1012 to prepare Doran Kell’s crowning, and who have swept the welcome hall of the half-sunk embassy-cloister in Briar Hollow every morning since.',
  },
  {
    id: 'npc:vespers', name: 'Vespers', title: 'a Mountain Goat kid with no respect for anything', school: 'fist', origin: 'fist', trust: 3,
    region: 'region:alder', home: 'landmark:gate-circle',
    presentWhen: { all: [MK, { flag: 'monk.vespers_pet' }, { questActive: 'quest:monk-a-move-by-post' }] },
    dialogue: [{ dialogue: 'dialogue:monk-shirin-letter' }],
    barks: [{ lines: ['(She is eating the letter. Slowly. Looking at you.)'] }],
    roles: ['quest'],
    look: { skin: 0xf0f0e8, cloth: 0xd9a066, accent: 0x8a3a2a, build: 'short' },
    bio: 'Matins’s kid, who followed you down from Stonecloister, and then went all the way back up for a letter without telling anyone.',
  },
  {
    id: 'npc:yeshe-highstep', name: 'Yeshe Highstep', title: 'Climber runner', school: 'fist', origin: 'fist', trust: 2,
    region: 'region:alder', home: 'landmark:gate-circle',
    presentWhen: { all: [MK, { not: { flag: 'monk.vespers_pet' } }, { questActive: 'quest:monk-a-move-by-post' }] },
    dialogue: [{ dialogue: 'dialogue:monk-shirin-letter' }],
    barks: [{ lines: ['The whole Stair Gate road. Twice. Tea at the top.'] }],
    roles: ['quest'],
    look: { skin: 0xc8946e, hair: 0x1a1a1a, cloth: 0x8a8a8a, accent: 0xd9a066, build: 'slight' },
    bio: 'A young Climber runner who carried Shirin’s letter down the Stair Gate road, was given tea, and was sent down it again.',
  },
];

export default npcs;
