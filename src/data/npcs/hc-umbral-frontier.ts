/**
 * Hollow Crown, Nocturne: the Veilwarrens NPCs for the Shade campaign (06-outlines/umbral.md), plus the Veil's
 * Concordia cousins at the Drowned Rat and the Shade's Concordia scenes.
 * Zones: zone:umbral-frontier-1 the Veilwarrens, -2 the Webbed Deeps, -3 the Moonwell, -4 the Stalker Moors.
 * Owner: Claude 4.
 */
import type { NarrativeCondition, NpcDef } from '@/core';

const SHA: NarrativeCondition = { heroClass: 'shade' };
const at = (q: `quest:${string}`, stage: string): NarrativeCondition => ({ questStage: q, stage });
const ACT2: NarrativeCondition = { flag: 'story.act', op: '>=', value: 2 };
const Z1 = 'zone:umbral-frontier-1' as const, Z2 = 'zone:umbral-frontier-2' as const, Z3 = 'zone:umbral-frontier-3' as const, Z4 = 'zone:umbral-frontier-4' as const;

const npcs: NpcDef[] = [
  {
    id: 'npc:grey-mab', name: 'Grey Mab', title: 'Thief-mother of the Veil', school: 'umbral', origin: 'umbral', trust: 1,
    services: ['Mentor', 'Trains Shades'], region: Z1, home: 'landmark:mab-nest', lore: 'lore:hc-grey-mab',
    presentWhen: SHA,
    schedule: [
      { from: 0, to: 24, at: 'landmark:rope-bridges', activity: 'idle', when: at('quest:shade-the-bell-on-the-bridges', 'mab') },
      { from: 0, to: 24, at: 'landmark:moonwell-market', activity: 'idle', when: { any: [at('quest:shade-a-stranger-at-the-moonwell', 'mab'), at('quest:shade-pasts-for-sale', 'stall')] } },
      // I-9: the escort starts on the moor at Bryn's fold, and she stops at the moor's edge
      { from: 0, to: 24, at: 'landmark:tallow-fold', activity: 'idle', when: { any: [at('quest:shade-mabs-last-lesson', 'walk'), at('quest:shade-mabs-last-lesson', 'regroup')] } },
      { from: 0, to: 24, at: 'landmark:shade-moor-edge', activity: 'idle', when: at('quest:shade-mabs-last-lesson', 'farewell') },
    ],
    dialogue: [
      { when: at('quest:shade-the-bell-on-the-bridges', 'mab'), dialogue: 'dialogue:shade-mab-bridges' },
      { when: at('quest:shade-mabs-toll', 'mab'), dialogue: 'dialogue:shade-mab-toll' },
      { when: at('quest:shade-a-stranger-at-the-moonwell', 'mab'), dialogue: 'dialogue:shade-mab-moonwell' },
      { when: at('quest:shade-pasts-for-sale', 'stall'), dialogue: 'dialogue:shade-pasts-for-sale' },
      { when: at('quest:shade-the-quiet-deeps', 'mab'), dialogue: 'dialogue:shade-mab-deeps' },
      { when: at('quest:shade-two-of-you', 'mab'), dialogue: 'dialogue:shade-mab-two' },
      { when: at('quest:shade-mabs-last-lesson', 'farewell'), dialogue: 'dialogue:shade-mab-farewell' },
      { when: at('quest:shade-mabs-ledger', 'mab'), dialogue: 'dialogue:shade-mab-ledger' },
      { when: at('quest:shade-the-letter-mab-never-opened', 'mab'), dialogue: 'dialogue:shade-mab-letter' },
      { when: at('quest:shade-cairn-of-the-unshadowed', 'mab'), dialogue: 'dialogue:shade-mab-founder' },
      { when: at('quest:shade-a-fair-price', 'mab'), dialogue: 'dialogue:shade-mab-mabyn' },
      { dialogue: 'dialogue:shade-mab' },
    ],
    barks: [{ lines: ['What.', 'Wary, petal. Everybody’s wary. You’re my favourite wary.', 'Give it back warm.'] }],
    roles: ['quest', 'trainer'], essential: true,
    look: { skin: 0xc8b0a0, hair: 0xa8a8b0, cloth: 0x3a3440, accent: 0x7a6a8a, build: 'short' },
    bio: 'Thief-mother of the Veil, ancient, tiny and terrifying, who raised the hero in the warrens. She trusts nobody above wary on principle. She left Duskmere forty years ago after a quarrel she has never once talked about.',
  },
  {
    id: 'npc:shadow-that-left', name: 'The Shadow That Left', title: 'your shadow', school: 'umbral', origin: 'umbral', trust: 3,
    region: Z3, home: 'landmark:moonwell-market', lore: 'lore:hc-shadow-that-left',
    // Act I in the warrens; Act III, beaten on the stair top as the Herald, waiting for its fate (the scene must be reopenable)
    presentWhen: { all: [SHA, { any: [at('quest:shade-a-stranger-at-the-moonwell', 'shadow'), { questActive: 'quest:shade-pasts-for-sale' }, at('quest:shade-two-of-you', 'shadow'), at('quest:shade-the-herald-of-shadows', 'fate')] }] },
    schedule: [
      { from: 0, to: 24, at: 'landmark:twelve-stairs-top', activity: 'idle', when: at('quest:shade-the-herald-of-shadows', 'fate') },
      { from: 0, to: 24, at: 'landmark:veil-ledger-hall', activity: 'idle', when: at('quest:shade-two-of-you', 'shadow') },
    ],
    dialogue: [
      { when: at('quest:shade-the-herald-of-shadows', 'fate'), dialogue: 'dialogue:shade-herald-fate' },
      { when: at('quest:shade-a-stranger-at-the-moonwell', 'shadow'), dialogue: 'dialogue:shade-shadow-moonwell' },
      { when: at('quest:shade-pasts-for-sale', 'stall'), dialogue: 'dialogue:shade-pasts-for-sale' },
      { when: at('quest:shade-two-of-you', 'shadow'), dialogue: 'dialogue:shade-shadow-ledger' },
      { dialogue: 'dialogue:shade-shadow' },
    ],
    barks: [{ lines: ['Hello, us.', 'I’ll see you before you see me.', 'Do you remember the goose? I remember the goose.'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0x141018, hair: 0x141018, cloth: 0x201828, accent: 0x3a2a4a, build: 'average' },
    bio: 'The hero’s own shadow, which stood up off the third bridge on the night of the Bell, bowed, and walked away. It is charming and sorry and glad to see you, and it knows every story you ever tried to forget.',
  },
  {
    id: 'npc:bryn-tallow', name: 'Bryn Tallow', title: 'Shepherd of the Stalker Moors', school: 'umbral', origin: 'umbral', trust: 2,
    region: Z4, home: 'landmark:tallow-fold', presentWhen: SHA,
    dialogue: [
      { when: at('quest:shade-nothing-to-hunt', 'bryn'), dialogue: 'dialogue:shade-bryn-stalker' },
      { when: at('quest:shade-nothing-to-hunt', 'report'), dialogue: 'dialogue:shade-bryn-stalker-done' },
      { dialogue: 'dialogue:shade-bryn' },
    ],
    barks: [{ lines: ['Never liked him. My shadow, I mean.', 'Evening, fellow lightweight.'] }],
    roles: ['quest'],
    look: { skin: 0xb88a6a, hair: 0x8a6a4a, cloth: 0x5a4a6a, accent: 0xd0c0a0, build: 'broad' },
    bio: 'A shepherd of the Stalker Moors who lost his shadow last spring and is entirely cheerful about it. He says he walks taller without it.',
  },
  {
    id: 'npc:wilhelmina-spool', name: 'Cutter-Mother Wilhelmina Spool', title: 'of the silk-cutters', school: 'umbral', origin: 'umbral', trust: 2,
    region: Z2, home: 'landmark:silk-cutters-camp', presentWhen: SHA,
    dialogue: [
      { when: at('quest:shade-mabs-toll', 'spool'), dialogue: 'dialogue:shade-spool-toll' },
      { when: at('quest:shade-agnes-in-the-silk', 'spool'), dialogue: 'dialogue:shade-spool-sorry' },
      { dialogue: 'dialogue:shade-spool' },
    ],
    barks: [{ lines: ['Silk doesn’t cut itself.', 'Mab’s toll. Every month for forty years.'] }],
    roles: ['quest'],
    look: { skin: 0xc8a888, hair: 0xd8d8e0, cloth: 0x4a4a5a, accent: 0xe8e8f0, build: 'broad' },
    bio: 'Head of the silk-cutters of the Webbed Deeps, who has paid the Veil’s toll every month for forty years, always in silk, always under protest.',
  },
  {
    id: 'npc:isidore-pale', name: 'Isidore Pale', title: 'Collector for the Obelisk Keepers', school: 'umbral', origin: 'umbral', trust: 1,
    region: Z3, home: 'landmark:moonwell-market',
    presentWhen: { all: [SHA, { questCompleted: 'quest:shade-a-stranger-at-the-moonwell' }] },
    dialogue: [
      { when: at('quest:shade-pasts-for-sale', 'stall'), dialogue: 'dialogue:shade-pasts-for-sale' },
      { when: { all: [at('quest:shade-pasts-for-sale', 'canvass'), { not: { flag: 'shade.isidore_asked' } }] }, dialogue: 'dialogue:shade-isidore-canvass' },
      { dialogue: 'dialogue:shade-isidore' },
    ],
    barks: [{ lines: ['Stolen goods, Mistress Mab.', 'You would be amazed how little wants to go home.'] }],
    roles: ['quest'],
    look: { skin: 0xe0d0c8, hair: 0x2a2030, cloth: 0x3a3050, accent: 0x9a8aff, build: 'tall' },
    bio: 'The Obelisk Keepers’ collector, sent down into the warrens to recover what has been stolen from Duskmere. Thin, grave and very polite, and much more frightened of the Veil than he lets on.',
  },
  {
    id: 'npc:nettle-crook', name: 'Nettle Crook', title: 'Keeper of the busiest bridge', school: 'umbral', origin: 'umbral', trust: 2,
    region: Z1, home: 'landmark:nettle-bridge', presentWhen: SHA,
    dialogue: [{ dialogue: 'dialogue:shade-nettle' }],
    barks: [{ lines: ['Toll! Two coppers if you’ve no shadow.', 'Fen Doyle’s bridge has a hole in it the size of a goat.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b090, hair: 0x6a3a2a, cloth: 0x5a4a5a, accent: 0xd0a040, build: 'short' },
    bio: 'A twelve-year-old who runs the busiest rope bridge in the warrens, and charges a toll she records in a ledger of pictures, because she cannot read.',
  },
  {
    id: 'npc:ludo-fingle', name: 'Ludo Fingle', title: 'Shadow-puppeteer', school: 'umbral', origin: 'umbral', trust: 2,
    region: Z1, home: 'landmark:ludo-puppet-booth', presentWhen: SHA,
    dialogue: [{ dialogue: 'dialogue:shade-ludo' }],
    barks: [{ lines: ['The Signing of the Concord, in shadow! One copper!', 'Arms up. Be heroic.'] }],
    roles: ['quest'],
    look: { skin: 0xe0b898, hair: 0x9a5a3a, cloth: 0x6a3a6a, accent: 0xffd36a, build: 'slight' },
    bio: 'A shadow-puppeteer of the warrens whose show of the signing of the Concord has lost its hero, shadow and all, on the night of the Bell.',
  },
  {
    id: 'npc:agnes-threadneedle', name: 'Agnes Threadneedle', title: 'Silk-cutter', school: 'umbral', origin: 'umbral', trust: 1,
    region: Z2, home: 'landmark:silk-cutters-camp',
    presentWhen: { all: [SHA, { any: [at('quest:shade-agnes-in-the-silk', 'agnes'), { questCompleted: 'quest:shade-agnes-in-the-silk' }] }] },
    dialogue: [{ dialogue: 'dialogue:shade-agnes' }],
    barks: [{ lines: ['Three days.', 'I’m cutting. Can’t you see I’m cutting?'] }],
    roles: ['quest'],
    look: { skin: 0xc8a080, hair: 0x3a2a2a, cloth: 0x4a4a5a, accent: 0xe8e8f0, build: 'short' },
    bio: 'The best silk-cutter in the Deeps and the worst-tempered, who spent three days cocooned in the low silk and has not forgiven anyone for it.',
  },
  {
    id: 'npc:silvan-hollowell', name: 'Silvan Hollowell', title: 'Echo-trader', school: 'umbral', origin: 'umbral', trust: 2,
    region: Z2, home: 'landmark:echo-traders-stall', presentWhen: SHA,
    dialogue: [{ dialogue: 'dialogue:shade-silvan' }],
    barks: [{ lines: ['Echoes! Bottled echoes!', 'Quiet has a sound, you know.'] }],
    roles: ['quest'],
    look: { skin: 0xd0b0a0, hair: 0x5a5a6a, cloth: 0x2a3a4a, accent: 0x9ab0d0, build: 'tall' },
    bio: 'An echo-trader of the Webbed Deeps who bottles sounds and sells them up the warrens. Lately he opens his jars to find nothing in them, not even quiet.',
  },
  {
    id: 'npc:madam-quince', name: 'Madam Quince', title: 'Fence of the Moonwell', school: 'umbral', origin: 'umbral', trust: 1,
    region: Z3, home: 'landmark:quince-stall', presentWhen: SHA,
    dialogue: [
      { when: { all: [at('quest:shade-pasts-for-sale', 'canvass'), { not: { flag: 'shade.quince_asked' } }] }, dialogue: 'dialogue:shade-quince-canvass' },
      { dialogue: 'dialogue:shade-quince' },
    ],
    barks: [{ lines: ['Fair price. Always a fair price.', '(She makes the bad-luck sign at your feet, very quickly.)'] }],
    roles: ['quest'],
    look: { skin: 0xc8a890, hair: 0xd0c8d0, cloth: 0x5a2a4a, accent: 0xd0a040, build: 'broad' },
    bio: 'The oldest fence in the warrens, who will buy anything, and has a drawer full of other people’s kept names that nobody has ever bought back for less than double.',
  },
  {
    id: 'npc:twig-and-moss', name: 'Twig and Moss', title: 'twins of the Moonwell', school: 'umbral', origin: 'umbral', trust: 3,
    region: Z3, home: 'landmark:moonwell-market', presentWhen: SHA,
    dialogue: [{ dialogue: 'dialogue:shade-twins' }],
    barks: [{ lines: ['Moss says you’ve got no shadow.', 'Moss says is the moon bigger.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b8a0, hair: 0x3a2a3a, cloth: 0x4a5a3a, accent: 0xb0c080, build: 'short' },
    bio: 'Twins of the Moonwell, a boy and a girl, one who talks and one who does not, who have only ever seen the moon from the bottom of the shaft.',
  },
  {
    id: 'npc:tibbet-crumb', name: 'Tibbet Crumb', title: 'Bounty-keeper of the Veil', school: 'umbral', origin: 'umbral', trust: 2,
    services: ['Bounties'], region: Z1, home: 'landmark:tibbet-post', presentWhen: SHA,
    dialogue: [{ dialogue: 'dialogue:shade-tibbet' }],
    barks: [{ lines: ['Coin, not silk. Mab keeps the silk.', 'Four bites. I’ve got four bites.'] }],
    roles: ['quest'],
    look: { skin: 0xc0a080, hair: 0x8a6a4a, cloth: 0x4a3a4a, accent: 0xa08a5a, build: 'slight' },
    bio: 'Keeper of the Veil’s bounty-post, who counts the creatures of the warrens by the bites they have given him.',
  },

  // ---------- Act II (Concordia)
  {
    id: 'npc:constance-gentle', name: 'Constance Gentle', title: 'Fence of the Morvane Road', school: 'umbral', origin: 'umbral', trust: 2,
    services: ['Fence', 'Rumours'], region: 'region:road', home: 'landmark:coach-drowned-rat',
    presentWhen: ACT2,
    // C-2: she waits at the root-cave mouth for the escort, and stays at the web's edge after it
    schedule: [
      { from: 0, to: 24, at: 'landmark:shade-root-mouth', activity: 'idle', when: { all: [SHA, { any: [at('quest:shade-the-spinners-silk', 'escort'), at('quest:shade-the-spinners-silk', 'regroup')] }] } },
      { from: 0, to: 24, at: 'landmark:shade-web-edge', activity: 'idle', when: { all: [SHA, { any: [at('quest:shade-the-spinners-silk', 'web'), at('quest:shade-the-spinners-silk', 'hear')] }] } },
    ],
    dialogue: [
      { when: { all: [SHA, at('quest:shade-the-drowned-rat', 'rat')] }, dialogue: 'dialogue:shade-constance' },
      { when: { all: [SHA, at('quest:shade-the-spinners-silk', 'hear')] }, dialogue: 'dialogue:shade-constance-web' },
      { when: { all: [SHA, at('quest:shade-the-spinner-below', 'tell')] }, dialogue: 'dialogue:shade-constance-tell' },
      { dialogue: 'dialogue:umbral-constance' },
    ],
    barks: [{ lines: ['Sit down, cousin. What are you buying?', 'Marked cards. Everyone knows. It saves time.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b8a0, hair: 0x2a2030, cloth: 0x3a2a3a, accent: 0xa35cff, build: 'average' },
    bio: 'A fence who runs the back room of the Drowned Rat at the Old Coach Inn, where the Veil’s Concordia cousins have drunk since the arches shut. She knows everything that goes missing on the Morvane Road, usually because it went past her table.',
  },
  {
    id: 'npc:shadow-under-the-willow', name: 'The Shadow That Left', title: 'under the Willow', school: 'umbral', origin: 'umbral', trust: 3,
    region: 'region:gloam', home: 'landmark:sentinel-verdant',
    presentWhen: { all: [SHA, { questActive: 'quest:shade-the-shadow-at-stags-rest' }] },
    dialogue: [{ dialogue: 'dialogue:shade-shadow-willow' }],
    barks: [{ lines: ['Do you like the robe?', 'I’ll have a bell. I’ll have a voice.'] }],
    roles: ['quest'],
    look: { skin: 0x141018, hair: 0x141018, cloth: 0x0a0a10, accent: 0x3a2a4a, build: 'average' },
    bio: 'Your Shadow came through the Dusk Gate behind you, and is sheltering under the Weeping Willow while the Hollow King’s tailors fit it for a Herald’s robe.',
  },
  {
    id: 'npc:nettle-crook-gate', name: 'Nettle Crook', title: 'a long way from her bridge', school: 'umbral', origin: 'umbral', trust: 2,
    region: 'region:alder', home: 'landmark:gate-circle',
    presentWhen: { all: [SHA, { any: [{ questActive: 'quest:shade-a-parcel-from-mab' }, { questCompleted: 'quest:shade-a-parcel-from-mab' }] }] },
    dialogue: [{ dialogue: 'dialogue:shade-nettle-gate' }],
    barks: [{ lines: ['Toll.', 'There’s a bridge here with no toll on it. It’s a scandal.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b090, hair: 0x6a3a2a, cloth: 0x5a4a5a, accent: 0xd0a040, build: 'short' },
    bio: 'Nettle Crook walked the whole gate road from the Veilwarrens with a parcel from Mab, and has charged you a toll for it.',
  },

  // ---------- Act III (the Heart)
  {
    id: 'npc:bryn-tallow-heart', name: 'Bryn Tallow', title: 'a long way from his fold', school: 'umbral', origin: 'umbral', trust: 2,
    region: 'region:heart', home: 'landmark:heart-camp',
    presentWhen: { all: [SHA, { questActive: 'quest:shade-bryns-flock' }] },
    dialogue: [{ dialogue: 'dialogue:shade-bryn-heart' }],
    barks: [{ lines: ['Thirty-one. There were thirty-one.', 'Lovely night for the end of the world.', '(He is calling, softly, into the dark: “Cooo-up, cooo-up.”)'] }],
    roles: ['quest'],
    look: { skin: 0xb88a6a, hair: 0x8a6a4a, cloth: 0x5a4a6a, accent: 0xd0c0a0, build: 'broad' },
    bio: 'The cheerful, shadowless shepherd of the Stalker Moors, who followed his flock off the moors and all the way across Morvane after the Bell, and has arrived at the end of the world with his pipe still lit.',
  },
];

export default npcs;
