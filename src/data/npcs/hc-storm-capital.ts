/**
 * Hollow Crown, Thunderreach: Spirehold NPCs for the Sparkwright campaign (docs/lore/hollow-crown/06-outlines/storm.md),
 * plus the Sparkwright's Concordia people (Cliffstair, Gildport).
 * Zones: zone:storm-capital-1 Coil Street, -2 the Copper Spires, -3 the Dynamo Halls, -4 the Tower Foundations. Owner: Claude 4.
 */
import type { NarrativeCondition, NpcDef } from '@/core';

const SW: NarrativeCondition = { heroClass: 'sparkwright' };
const at = (q: `quest:${string}`, stage: string): NarrativeCondition => ({ questStage: q, stage });
const ACT1: NarrativeCondition = { all: [SW, { not: { flag: 'story.gate_open' } }] };
const ACT2: NarrativeCondition = { flag: 'story.act', op: '>=', value: 2 };
const Z1 = 'zone:storm-capital-1' as const, Z2 = 'zone:storm-capital-2' as const, Z3 = 'zone:storm-capital-3' as const, Z4 = 'zone:storm-capital-4' as const;

const npcs: NpcDef[] = [
  {
    id: 'npc:tess-ampery', name: 'Guildmother Tess Ampery', title: 'Eldest Master of the Coil Guild', school: 'storm', origin: 'storm', trust: 3,
    services: ['Mentor', 'Trains Sparkwrights'], region: Z1, home: 'landmark:tess-ampery-workshop', lore: 'lore:hc-tess-ampery',
    presentWhen: SW,
    schedule: [{ from: 0, to: 24, at: 'landmark:tower-fifteen', activity: 'idle', when: at('quest:sparkwright-tower-fifteen', 'vote') }],
    dialogue: [
      { when: at('quest:sparkwright-every-workshop-at-once', 'tess'), dialogue: 'dialogue:sparkwright-tess-bell' },
      { when: at('quest:sparkwright-every-workshop-at-once', 'tea'), dialogue: 'dialogue:sparkwright-tess-tea' },
      { when: at('quest:sparkwright-patent-pending', 'tell'), dialogue: 'dialogue:sparkwright-tess-anchors' },
      { when: at('quest:sparkwright-rod-duty', 'report'), dialogue: 'dialogue:sparkwright-tess-rods' },
      { when: at('quest:sparkwright-the-witchs-belfry', 'report'), dialogue: 'dialogue:sparkwright-tess-belfry' },
      { when: at('quest:sparkwright-patent-pending', 'tess'), dialogue: 'dialogue:sparkwright-tess-patent' },
      { when: at('quest:sparkwright-the-copper-road', 'farewell'), dialogue: 'dialogue:sparkwright-tess-farewell' },
      { when: at('quest:sparkwright-the-nineteenth-kettle', 'tess'), dialogue: 'dialogue:sparkwright-tess-kettle' },
      { when: at('quest:sparkwright-tess-eyebrows', 'tess'), dialogue: 'dialogue:sparkwright-tess-eyebrows' },
      { when: at('quest:sparkwright-the-root-tuner', 'tess'), dialogue: 'dialogue:sparkwright-tess-roots' },
      { dialogue: 'dialogue:sparkwright-tess' },
    ],
    barks: [{ lines: ['Family! Come in! Mind the kettle, it’s live.', 'That wasn’t an explosion. That was an enthusiastic result.', 'Nineteen patents. Same kettle. Don’t ask. Do ask.'] }],
    roles: ['quest', 'trainer'], essential: true,
    look: { skin: 0xe0b898, hair: 0xd8d8d8, cloth: 0x8a5a2a, accent: 0x6ac8ff, build: 'short' },
    bio: 'The eldest master of the Coil Guild, called Guildmother by everyone and Tess by anyone she has met twice. She has no eyebrows, on principle, nineteen patents for the same kettle, and a workshop on Coil Street that explodes on the hour, politely. She declares everyone family on sight.',
  },
  {
    id: 'npc:kettle-twenty', name: 'Kettle Twenty', title: 'a walking kettle', school: 'storm', origin: 'storm',
    region: Z1, home: 'landmark:tess-ampery-workshop', presentWhen: ACT1,
    dialogue: [{ dialogue: 'dialogue:sparkwright-kettle-twenty' }],
    barks: [{ lines: ['(Tweet.)', '(It walks in a small circle on three copper legs, and settles, steaming gently.)'] }],
    roles: ['ambient'],
    look: { skin: 0xc8783a, cloth: 0xe8a050, accent: 0x6ac8ff, build: 'short' },
    bio: 'Tess’s twentieth kettle, which walks on three copper legs and whistles when danger is near. It whistles quite a lot on Coil Street.',
  },
  {
    id: 'npc:volta-sterne', name: 'Chancellor Volta Sterne', title: 'Chancellor of the Coil Guild', school: 'storm', origin: 'storm', trust: 2,
    region: Z3, home: 'landmark:chancellery', lore: 'lore:hc-volta-sterne',
    // Act I in Spirehold; Act III, beaten on the stair top, waiting for her fate (the scene must be reopenable)
    presentWhen: { all: [SW, { any: [{ not: { flag: 'sparkwright.halfstone' } }, at('quest:sparkwright-the-copper-herald', 'fate')] }] },
    schedule: [
      { from: 0, to: 24, at: 'landmark:twelve-stairs-top', activity: 'idle', when: at('quest:sparkwright-the-copper-herald', 'fate') },
      { from: 0, to: 24, at: 'landmark:tower-fifteen', activity: 'idle', when: at('quest:sparkwright-tower-fifteen', 'vote') },
      // I-4: she walks the hero through the Dynamo Halls to the Number Three wheel
      { from: 0, to: 24, at: 'landmark:dynamo-wheel-three', activity: 'idle', when: { any: [at('quest:sparkwright-the-chancellors-tour', 'wheel'), at('quest:sparkwright-the-chancellors-tour', 'three')] } },
    ],
    dialogue: [
      { when: at('quest:sparkwright-the-copper-herald', 'fate'), dialogue: 'dialogue:sparkwright-herald-fate' },
      { when: at('quest:sparkwright-the-chancellors-tour', 'summons'), dialogue: 'dialogue:sparkwright-volta-tour' },
      { when: at('quest:sparkwright-the-chancellors-tour', 'three'), dialogue: 'dialogue:sparkwright-volta-three' },
      { when: at('quest:sparkwright-tower-fifteen', 'vote'), dialogue: 'dialogue:sparkwright-tower-fifteen-vote' },
      { dialogue: 'dialogue:sparkwright-volta' },
    ],
    barks: [{ lines: ['Every wheel in this hall is mine, and I know every one by its squeak.', 'Spirehold must not fall down again. Everything else is a detail.', 'Do mind the cuffs. They were clean this morning, and they are still clean.'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xe8d0c0, hair: 0x2a2a3a, cloth: 0x1a2a4a, accent: 0xffd36a, build: 'tall' },
    bio: 'Chancellor of the Coil Guild: impeccably buttoned, dry, brilliant, and the only Sparkwright in Spirehold without a single burn mark. She knows every wheel in the Dynamo Halls by its squeak. She loves the city, and she would like it to be safe for ever.',
  },
  // ---------- Coil Street
  {
    id: 'npc:pim-joule', name: 'Pim Joule', title: 'Inventor, worryingly quiet', school: 'storm', origin: 'storm', trust: 2,
    region: Z1, home: 'landmark:pim-joule-workshop', presentWhen: ACT1,
    dialogue: [
      { when: at('quest:sparkwright-the-quiet-workshop', 'pim'), dialogue: 'dialogue:sparkwright-pim-toast' },
      { dialogue: 'dialogue:sparkwright-pim' },
    ],
    barks: [{ lines: ['Nothing’s wrong! Nothing’s exploded! Go away!', '(A smell of toast drifts under his door.)'] }],
    roles: ['quest'],
    look: { skin: 0xe8c0a0, hair: 0x3a2a1a, cloth: 0x5a4a3a, accent: 0x6ac8ff, build: 'slight' },
    bio: 'A Coil Street inventor whose workshop has exploded every day for eleven years, and has not exploded for nine days. The whole street is frightened for him.',
  },
  {
    id: 'npc:mortimer-sneddon', name: 'Clerk Mortimer Sneddon', title: 'of the Patent Office', school: 'storm', origin: 'storm', trust: 1,
    region: Z1, home: 'landmark:patent-office', presentWhen: ACT1,
    dialogue: [
      { when: at('quest:sparkwright-patent-pending', 'clerk'), dialogue: 'dialogue:sparkwright-mortimer-filing' },
      { when: at('quest:sparkwright-patent-rejected', 'mortimer'), dialogue: 'dialogue:sparkwright-mortimer-done' },
      { when: at('quest:sparkwright-sentry-sixty-one', 'filed'), dialogue: 'dialogue:sparkwright-mortimer-pigeon' },
      { dialogue: 'dialogue:sparkwright-mortimer' },
    ],
    barks: [{ lines: ['Rejected. Rejected. Rejected. Approved. No, rejected.', 'Thirty years of letters, and nobody to post them.'] }],
    roles: ['quest'],
    look: { skin: 0xd8c0a8, hair: 0x9a9a9a, cloth: 0x3a3a4a, accent: 0xffd36a, build: 'slight' },
    bio: 'The Patent Office clerk, who has rejected every application made to the Coil Guild for thirty years and never once posted the letters, because the Office’s pigeon exploded in C. 1013.',
  },
  {
    id: 'npc:juniper-gauss', name: 'Juniper Gauss', title: 'aged nine, inventor', school: 'storm', origin: 'storm', trust: 2,
    region: Z1, home: 'landmark:patent-office', presentWhen: ACT1,
    dialogue: [
      { when: { all: [at('quest:sparkwright-patent-rejected', 'deliver'), { not: { flag: 'sparkwright.juniper_letter' } }] }, dialogue: 'dialogue:sparkwright-juniper-letter' },
      { when: at('quest:sparkwright-tower-fifteen', 'canvass'), dialogue: 'dialogue:sparkwright-juniper-canvass' },
      { when: at('quest:sparkwright-the-wisp-nursery', 'juniper'), dialogue: 'dialogue:sparkwright-juniper-wisp' },
      { dialogue: 'dialogue:sparkwright-juniper' },
    ],
    barks: [{ lines: ['I sent in an application. I sent it in a MONTH ago.', 'Have you seen a little wisp? About so big? Called Bobbin?'] }],
    roles: ['quest'],
    look: { skin: 0xd8a888, hair: 0x2a1a14, cloth: 0x6a8a3a, accent: 0x6ac8ff, build: 'short' },
    bio: 'A nine-year-old inventor of Coil Street who has applied to the Patent Office with a design for a tower that hums. She has been waiting for an answer for a month, which at nine is most of a lifetime.',
  },
  {
    id: 'npc:bunty-pyle', name: 'Fire-Marshal Bunty Pyle', title: 'of Coil Street', school: 'storm', origin: 'storm', trust: 1,
    region: Z1, home: 'landmark:fire-marshals-post', presentWhen: ACT1,
    dialogue: [{ dialogue: 'dialogue:sparkwright-bunty' }],
    barks: [{ lines: ['Bounties on the board! Stand back from the board! The board is also on fire.', 'Eleven explosions this morning. A quiet one.'] }],
    roles: ['quest'],
    look: { skin: 0xc8907a, hair: 0x8a2a1a, cloth: 0x8a1a1a, accent: 0xffd36a, build: 'broad' },
    bio: 'Fire-Marshal of Coil Street, a street that explodes on the hour. She has the busiest job in Spirehold and the calmest face, and she keeps the bounty board, which is fireproof, mostly.',
  },
  // ---------- the Copper Spires
  {
    id: 'npc:wilf-farraday', name: 'Wilf Farraday', title: 'Master of the Spire-Jumpers', school: 'storm', origin: 'storm', trust: 2,
    region: Z2, home: 'landmark:tower-fifteen', presentWhen: ACT1,
    dialogue: [
      { when: { all: [at('quest:sparkwright-patent-rejected', 'deliver'), { not: { flag: 'sparkwright.wilf_letter' } }] }, dialogue: 'dialogue:sparkwright-wilf-letter' },
      { when: at('quest:sparkwright-tower-fifteen', 'canvass'), dialogue: 'dialogue:sparkwright-wilf-canvass' },
      { when: at('quest:sparkwright-the-spire-jumpers', 'wilf'), dialogue: 'dialogue:sparkwright-wilf-race' },
      { dialogue: 'dialogue:sparkwright-wilf' },
    ],
    barks: [{ lines: ['First one off the tower buys the tea! Last one down pays for the cloak!', 'Gliding is just falling with good posture.'] }],
    roles: ['quest'],
    look: { skin: 0xe0b890, hair: 0xe8c86a, cloth: 0x3a5a8a, accent: 0xffffff, build: 'slight' },
    bio: 'A retired lightning-rod fitter who teaches the Guild’s apprentices to leap between the leaning towers of the Copper Spires on glide-cloaks, for fun. He has broken every bone in his body at least once and recommends it.',
  },
  {
    id: 'npc:ada-henry', name: 'Ada Henry', title: 'of the top of Tower Seven', school: 'storm', origin: 'storm', trust: 2,
    region: Z2, home: 'landmark:tower-seven', presentWhen: ACT1,
    dialogue: [{ dialogue: 'dialogue:sparkwright-ada' }],
    barks: [{ lines: ['It leans a little further every day. So do I, dear. We manage.', 'Tea’s at four. The tower’s always at four. Whatever four is, by then.'] }],
    roles: ['quest'],
    look: { skin: 0xe0c8b8, hair: 0xe8e8e8, cloth: 0x8a3a5a, accent: 0xffd36a, build: 'short' },
    bio: 'Ada Henry and her husband Bert have lived at the top of Tower Seven for fifty years. It leans a little further every day, and they refuse to leave, because the view is excellent and the stairs are bad.',
  },
  {
    id: 'npc:bert-henry', name: 'Old Bert Henry', title: 'of the top of Tower Seven', school: 'storm', origin: 'storm', trust: 2,
    region: Z2, home: 'landmark:tower-seven', presentWhen: ACT1,
    dialogue: [{ dialogue: 'dialogue:sparkwright-bert' }],
    barks: [{ lines: ['Leans? It doesn’t lean. The rest of the city’s gone crooked.', 'I put my cup down this morning and it slid into Ada’s.'] }],
    roles: ['ambient'],
    look: { skin: 0xd8b8a0, hair: 0xd8d8d8, cloth: 0x4a5a3a, accent: 0xb08a3a, build: 'average' },
    bio: 'Old Bert Henry, who maintains that Tower Seven is perfectly upright and that everything else in Spirehold is leaning away from it.',
  },
  // ---------- the Dynamo Halls
  {
    id: 'npc:marjorie-watt', name: 'Marjorie Watt', title: 'of the Number Three Wheel', school: 'storm', origin: 'storm', trust: 2,
    region: Z3, home: 'landmark:dynamo-wheel-three', presentWhen: ACT1,
    dialogue: [
      { when: at('quest:sparkwright-the-quiet-workshop', 'toast'), dialogue: 'dialogue:sparkwright-marjorie-toast' },
      { dialogue: 'dialogue:sparkwright-marjorie' },
    ],
    barks: [{ lines: ['Thirty years on Number Three. The orphanage hasn’t been cold one night.', 'Replace me? Replace ME? With a Sentry? It can’t even whistle.'] }],
    roles: ['quest'],
    look: { skin: 0xc8a080, hair: 0x8a6a4a, cloth: 0x5a4a3a, accent: 0x6ac8ff, build: 'broad' },
    bio: 'Marjorie Watt has turned the Number Three wheel in the Dynamo Halls for thirty years. It powers the Spirehold orphanage, and the orphanage has never been cold. The haywire Coil Sentries have decided she is obsolete.',
  },
  {
    id: 'npc:sentry-sixty-one', name: 'Sentry Sixty-One', title: 'a Coil Sentry, or possibly a pigeon', school: 'storm', origin: 'storm', trust: 1,
    region: Z3, home: 'landmark:dynamo-wheel-three', presentWhen: ACT1,
    dialogue: [
      { when: at('quest:sparkwright-sentry-sixty-one', 'feed'), dialogue: 'dialogue:sparkwright-sixty-one-feed' },
      { dialogue: 'dialogue:sparkwright-sixty-one' },
    ],
    barks: [{ lines: ['Coo. COO. Coo.', '(It bobs its head, which is a lantern, and pecks at the floor, which is iron.)'] }],
    roles: ['quest'],
    look: { skin: 0x8a8a9a, cloth: 0x4a5a6a, accent: 0x6ac8ff, build: 'average' },
    bio: 'A haywire Coil Sentry of the Dynamo Halls which has decided it is a pigeon. It roosts on the Number Three wheel, coos, and is scheduled for scrapping on Thursday.',
  },
  // ---------- the Tower Foundations
  {
    id: 'npc:ma-ohmsworth', name: 'Ma Ohmsworth', title: 'Root-Tuner of the Lightning Tower', school: 'storm', origin: 'storm', trust: 2,
    region: Z4, home: 'landmark:root-tuning-chamber', presentWhen: ACT1,
    dialogue: [{ dialogue: 'dialogue:sparkwright-ma' }],
    barks: [{ lines: ['Hush. That root’s flat. Hear it?', 'The Chancellor says stop. The Chancellor can come down here and say it to the roots.'] }],
    roles: ['quest'],
    look: { skin: 0xb88a6a, hair: 0xd8d8d0, cloth: 0x6a4a2a, accent: 0xc8783a, build: 'short' },
    bio: 'The old root-tuner of the Tower Foundations, who has tuned the Lightning Tower’s copper roots like harp strings all her life. The Chancellor has told her to stop. She has not stopped.',
  },
  // ---------- Act II (Concordia)
  {
    id: 'npc:prudence-spindle', name: 'Spire-Keeper Prudence Spindle', title: 'of the Cliffstair Storm Spire', school: 'storm', origin: 'storm', trust: 2,
    region: 'region:storm', home: 'landmark:cliff-storm-spire', presentWhen: ACT2,
    // C-2: escorted up the lightning-ladder; she waits on the ledge under the nest until the Stormcrow falls
    schedule: [{ from: 0, to: 24, at: 'landmark:sparkwright-ladder-head', activity: 'idle', when: { any: [at('quest:sparkwright-the-news-that-never-came', 'read'), at('quest:sparkwright-the-news-that-never-came', 'up')] } }],
    dialogue: [
      { when: at('quest:sparkwright-cliffstair', 'spindle'), dialogue: 'dialogue:sparkwright-prudence' },
      { when: at('quest:sparkwright-the-news-that-never-came', 'read'), dialogue: 'dialogue:sparkwright-prudence-ladder' },
      { when: at('quest:sparkwright-the-stormcrow', 'tell'), dialogue: 'dialogue:sparkwright-prudence-crow' },
      { when: { all: [SW, { flag: 'sparkwright.part_six' }] }, dialogue: 'dialogue:sparkwright-prudence-six' },
      { dialogue: 'dialogue:storm-prudence' },
    ],
    barks: [{ lines: ['Part six. Thirty years, and we have never once seen part six.', 'It is a very good Spire. It just isn’t on.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b8a0, hair: 0x6a6a7a, cloth: 0x2a3a6a, accent: 0x6ac8ff, build: 'slight' },
    bio: 'Keeper of the Storm Spire at Cliffstair, a thirty-year-old kit-build that has never been switched on, because the instructions came in eleven parts and part six never arrived. She has re-read parts one to five, and seven to eleven, many times.',
  },
  {
    id: 'npc:clement-penhallow', name: 'Works-Clerk Clement Inchley', title: 'of the Gildport Sparkwright Works', school: 'storm', origin: 'concord', trust: 1,
    region: 'region:gilded', home: 'landmark:gild-sparkwright-works', presentWhen: ACT2,
    dialogue: [
      { when: at('quest:sparkwright-the-machine-age', 'clement'), dialogue: 'dialogue:sparkwright-clement' },
      { dialogue: 'dialogue:storm-clement' },
    ],
    barks: [{ lines: ['The old Works are running again. Nobody here started them.', 'I keep the ledgers. The ledgers have started keeping themselves.'] }],
    roles: ['quest'],
    look: { skin: 0xd0a888, hair: 0x4a3a2a, cloth: 0x4a5aa8, accent: 0xffe14a, build: 'slight' },
    bio: 'The clerk of the Sparkwright Works at Gildport, who keeps its ledgers, minds its stamps and has lately noticed that the oldest furnaces under the town have started running on their own, at night, very hot.',
  },
  {
    id: 'npc:sentry-sixty-one-gild', name: 'Sentry Sixty-One', title: 'a Coil Sentry, still a pigeon', school: 'storm', origin: 'storm', trust: 3,
    region: 'region:gilded', home: 'landmark:gild-clocktower',
    presentWhen: { all: [SW, ACT2, { flag: 'sparkwright.sixty_one_saved' }] },
    dialogue: [{ dialogue: 'dialogue:sparkwright-sixty-one-gild' }],
    barks: [{ lines: ['Coo!', '(It is roosting on the Gildport clocktower with a dozen real pigeons, who have accepted it.)'] }],
    roles: ['ambient'],
    look: { skin: 0x8a8a9a, cloth: 0x4a5a6a, accent: 0x6ac8ff, build: 'average' },
    bio: 'Sentry Sixty-One flew, or rather walked very determinedly, all the way from Spirehold to Gildport, and roosts on the clocktower. It is still a pigeon. It has seen things in the Gilded Ruins at night.',
  },
  {
    id: 'npc:sentry-sixty-one-heart', name: 'Sentry Sixty-One', title: 'a Coil Sentry, homing', school: 'storm', origin: 'storm', trust: 3,
    region: 'region:heart', home: 'landmark:heart-camp',
    presentWhen: { all: [SW, { questActive: 'quest:sparkwright-sixty-one-flies-home' }] },
    schedule: [{ from: 0, to: 24, at: 'landmark:twelve-stairs-top', activity: 'idle', when: at('quest:sparkwright-sixty-one-flies-home', 'chase') }],
    dialogue: [
      { when: at('quest:sparkwright-sixty-one-flies-home', 'home'), dialogue: 'dialogue:sparkwright-sixty-one-tag' },
      { dialogue: 'dialogue:sparkwright-sixty-one-heart' },
    ],
    barks: [{ lines: ['COO.', '(It is bobbing at the Citadel, faster and faster.)'] }],
    roles: ['quest'],
    look: { skin: 0x8a8a9a, cloth: 0x4a5a6a, accent: 0x6ac8ff, build: 'average' },
    bio: 'Sentry Sixty-One walked, very determinedly, from Gildport to the edge of the Heart. It has decided it is a homing pigeon, and that home is the crown.',
  },
];

export default npcs;
