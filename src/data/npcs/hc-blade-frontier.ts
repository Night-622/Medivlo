/**
 * Hollow Crown, Steelvale: Hushpine NPCs for the Samurai campaign (06-outlines/blade.md), plus the Samurai’s
 * Concordia NPCs (the Hushpine pilgrims of the quiet pew; Hettie’s C-6 visit). Zones: zone:blade-frontier-1 the
 * Hushpine Temple Road, -2 the Hushpine Terraces, -3 the Ronin Camps, -4 the Bamboo Shallows. Owner: Claude 4.
 */
import type { NarrativeCondition, NpcDef } from '@/core';

const SA: NarrativeCondition = { heroClass: 'samurai' };
const at = (q: `quest:${string}`, stage: string): NarrativeCondition => ({ questStage: q, stage });
const ACT2: NarrativeCondition = { flag: 'story.act', op: '>=', value: 2 };
/** Act III: Hettie at the Heart camp, while either of her letters is undelivered */
const HEART_POST: NarrativeCondition = { any: [at('quest:samurai-say-it-for-me', 'hettie'), at('quest:samurai-kentas-letter', 'letter')] };
const Z1 = 'zone:blade-frontier-1' as const, Z2 = 'zone:blade-frontier-2' as const, Z3 = 'zone:blade-frontier-3' as const, Z4 = 'zone:blade-frontier-4' as const;

const npcs: NpcDef[] = [
  {
    id: 'npc:haru-kanemori', name: 'Sensei Haru Kanemori', title: 'Abbot of Hushpine', school: 'blade', origin: 'blade', trust: 2,
    services: ['Mentor', 'Trains Samurai'], region: Z1, home: 'landmark:kanemori-cell', lore: 'lore:hc-haru-kanemori',
    presentWhen: SA,
    schedule: [
      { from: 0, to: 24, at: 'landmark:hushpine-elders-yard', activity: 'idle', when: at('quest:samurai-the-call-to-muster', 'yard') },
      { from: 0, to: 24, at: 'landmark:samurai-lantern-shrine', activity: 'idle', when: { any: [at('quest:samurai-the-bell-in-the-pines', 'climb'), at('quest:samurai-the-bell-in-the-pines', 'lanterns')] } },
    ],
    dialogue: [
      { when: at('quest:samurai-the-bell-in-the-pines', 'kanemori'), dialogue: 'dialogue:samurai-kanemori-bell' },
      { when: at('quest:samurai-the-bell-in-the-pines', 'lanterns'), dialogue: 'dialogue:samurai-kanemori-lanterns' },
      { when: at('quest:samurai-a-blade-with-no-master', 'cell'), dialogue: 'dialogue:samurai-kanemori-ikeda' },
      { when: at('quest:samurai-tea-before-steel', 'report'), dialogue: 'dialogue:samurai-kanemori-gone' },
      { when: at('quest:samurai-the-ronin-fort', 'report'), dialogue: 'dialogue:samurai-kanemori-good' },
      { when: at('quest:samurai-the-pilgrim-road-down', 'farewell'), dialogue: 'dialogue:samurai-kanemori-farewell' },
      { when: at('quest:samurai-the-word-he-saved', 'kanemori'), dialogue: 'dialogue:samurai-kanemori-saved' },
      { when: at('quest:samurai-the-eleven-words', 'kanemori'), dialogue: 'dialogue:samurai-kanemori-eleven' },
      { dialogue: 'dialogue:samurai-kanemori' },
    ],
    barks: [{ lines: ['(He pours you tea.)', '(He looks at you, and you straighten your back without being told.)', '(He nods, once.)'] }],
    roles: ['quest', 'trainer'], essential: true,
    look: { skin: 0xd8b090, hair: 0xb8b8b0, cloth: 0x6a6a5a, accent: 0xd8c89a, build: 'slight' },
    bio: 'Abbot of the Hushpine Order, who has spoken eleven words this year and does not regret any of them. He wears the same straw hat on the Temple Road that he has worn for forty years. He has kept one word unspoken for thirty.',
  },
  {
    id: 'npc:ikeda-shun', name: 'Lord Ikeda Shun', title: 'Warlord of the Ronin Companies', school: 'blade', origin: 'blade', trust: 3,
    region: Z3, home: 'landmark:ikeda-pavilion', lore: 'lore:hc-ikeda-shun',
    // Act I on the frontier; Act III, beaten on the stair top, waiting for his fate (the scene must be reopenable)
    presentWhen: {
      all: [SA, {
        any: [
          { all: [{ any: [{ questActive: 'quest:samurai-the-lord-of-no-master' }, { questCompleted: 'quest:samurai-the-lord-of-no-master' }] }, { not: { flag: 'samurai.halfstone' } }] },
          at('quest:samurai-the-chimeras-blade', 'fate'),
          // Act II, C-4: met once at the mouth of the root-caves, cutting threads
          at('quest:samurai-the-ronin-under-the-wood', 'ikeda'),
        ],
      }],
    },
    schedule: [
      { from: 0, to: 24, at: 'landmark:samurai-root-mouth', activity: 'idle', when: at('quest:samurai-the-ronin-under-the-wood', 'ikeda') },
      { from: 0, to: 24, at: 'landmark:twelve-stairs-top', activity: 'idle', when: at('quest:samurai-the-chimeras-blade', 'fate') },
      { from: 0, to: 24, at: 'landmark:temple-road-gate', activity: 'idle', when: at('quest:samurai-a-blade-with-no-master', 'ikeda') },
      { from: 0, to: 24, at: 'landmark:samurai-valley-lip', activity: 'idle', when: { any: [at('quest:samurai-the-lord-of-no-master', 'ride'), at('quest:samurai-the-lord-of-no-master', 'lip')] } },
    ],
    dialogue: [
      { when: at('quest:samurai-the-chimeras-blade', 'fate'), dialogue: 'dialogue:samurai-herald-fate' },
      { when: at('quest:samurai-the-ronin-under-the-wood', 'ikeda'), dialogue: 'dialogue:samurai-ikeda-roots' },
      { when: at('quest:samurai-the-lord-of-no-master', 'pavilion'), dialogue: 'dialogue:samurai-ikeda-pavilion' },
      { when: at('quest:samurai-the-lord-of-no-master', 'lip'), dialogue: 'dialogue:samurai-ikeda-lip' },
      { when: at('quest:samurai-a-blade-with-no-master', 'ikeda'), dialogue: 'dialogue:samurai-ikeda-reveal' },
      { dialogue: 'dialogue:samurai-ikeda' },
    ],
    barks: [{ lines: ['Serve no one, as I do.', 'Drink? I stole it from a lord.', '(His right hand rests on his hilt. It always does.)'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xd0a080, hair: 0x1a1a1a, cloth: 0x2a2a2a, accent: 0xc83a3a, build: 'tall' },
    bio: 'Warlord of the Ronin Companies: honest, generous, funny and very easy to like. He pays his ronin fairly, frees pilgrims for the pleasure of it and serves nobody. His sword hangs bare at his belt. He has no sheath.',
  },
  {
    id: 'npc:fumiko-sora', name: 'Elder Fumiko Sora', title: 'of the Hushpine Order', school: 'blade', origin: 'blade', trust: 1,
    region: Z2, home: 'landmark:hushpine-elders-yard', presentWhen: SA,
    dialogue: [
      { when: at('quest:samurai-the-call-to-muster', 'yard'), dialogue: 'dialogue:samurai-call-to-muster' },
      { dialogue: 'dialogue:samurai-fumiko' },
    ],
    barks: [{ lines: ['(She rakes the gravel in perfect lines.)', '(She looks at you until you stand up straighter.)'] }],
    roles: ['quest'],
    look: { skin: 0xc8a888, hair: 0xe8e4dc, cloth: 0x4a4a4a, accent: 0xa8a890, build: 'short' },
    bio: 'Eldest of the Order’s elders, who speaks perhaps once a season, and only when the Order has something to decide. When she speaks, the Elders’ Yard goes quiet, which is saying something.',
  },
  {
    id: 'npc:hettie-natter', name: 'Goodwife Hettie Natter', title: 'a pilgrim of the Temple Road', school: 'blade', origin: 'blade', trust: 2,
    region: Z1, home: 'landmark:temple-road-shrine', presentWhen: SA,
    dialogue: [{ dialogue: 'dialogue:samurai-hettie' }],
    barks: [{ lines: ['Sorry! Sorry. I know. Sorry.', 'I talked before I cried, my mother said.'] }],
    roles: ['quest'],
    look: { skin: 0xe0b898, hair: 0x8a5a3a, cloth: 0x8a7a5a, accent: 0xe8c86a, build: 'broad' },
    bio: 'A pilgrim on the silent Temple Road who cannot stop talking, and is mortified about it, at length.',
  },
  {
    id: 'npc:ren-tsuge', name: 'Master Ren Tsuge', title: 'Carpenter of the Order', school: 'blade', origin: 'blade', trust: 2,
    region: Z1, home: 'landmark:fallen-pine', presentWhen: SA,
    dialogue: [{ dialogue: 'dialogue:samurai-tsuge' }],
    barks: [{ lines: ['(He taps a beam, and listens to it.)', '(Sawdust drifts off his eyebrows.)'] }],
    roles: ['quest'],
    look: { skin: 0xb88a6a, hair: 0x4a3a2a, cloth: 0x6a5a3a, accent: 0xd8b878, build: 'broad' },
    bio: 'The Hushpine Order’s carpenter, who can hear what is wrong with a beam by tapping it, and has never needed to say what he hears.',
  },
  {
    id: 'npc:chiyo-ashina', name: 'Tea-Mistress Chiyo Ashina', title: 'of the Hushpine Terraces', school: 'blade', origin: 'blade', trust: 2,
    region: Z2, home: 'landmark:ashina-spring', presentWhen: SA,
    dialogue: [{ dialogue: 'dialogue:samurai-chiyo' }],
    barks: [{ lines: ['(She pours, and the pouring is perfect.)', '(She tips a black cup onto the gravel, and rakes it over.)'] }],
    roles: ['quest', 'merchant'],
    look: { skin: 0xe8d0b8, hair: 0x1a1a1a, cloth: 0x3a6a4a, accent: 0xe8e0c8, build: 'slight' },
    bio: 'Tea-Mistress of the Hushpine Terraces, whose family has kept the Ashina spring and the top tea-terrace for twenty generations. The spring is running black.',
  },
  {
    id: 'npc:kenta', name: 'Kenta', title: 'a novice of Hushpine', school: 'blade', origin: 'blade', trust: 3,
    region: Z2, home: 'landmark:hushpine-fifth-yard', presentWhen: SA,
    dialogue: [
      { when: at('quest:samurai-the-call-to-muster', 'canvass'), dialogue: 'dialogue:samurai-kenta-canvass' },
      { dialogue: 'dialogue:samurai-kenta' },
    ],
    barks: [{ lines: ['(He practises a cut, frowning terribly.)', '(He bows to you so low he nearly falls over.)'] }],
    roles: ['quest'],
    look: { skin: 0xe8c4a8, hair: 0x1a1a1a, cloth: 0x8a8a7a, accent: 0xd8c89a, build: 'short' },
    bio: 'Ten years old, the only novice of Hushpine who did not go down to the Ronin Camps for pay. He practises alone in the fifth dojo yard every morning, and sweeps it twice: once for himself, once for the others.',
  },
  {
    id: 'npc:daisuke-nine-coins', name: 'Daisuke Nine-Coins', title: 'Captain of a Ronin company', school: 'blade', origin: 'blade', trust: 1,
    region: Z3, home: 'landmark:daisuke-camp', presentWhen: SA,
    dialogue: [
      { when: at('quest:samurai-the-call-to-muster', 'canvass'), dialogue: 'dialogue:samurai-daisuke-canvass' },
      { dialogue: 'dialogue:samurai-daisuke' },
    ],
    barks: [{ lines: ['A sword that serves a purse. Honest work.', 'Nine coins. Never been sure it was enough.'] }],
    roles: ['quest'],
    look: { skin: 0xb8886a, hair: 0x2a2a2a, cloth: 0x5a3a2a, accent: 0xd8b04a, build: 'broad' },
    bio: 'A ronin captain who sells his sword and his company’s swords to whoever pays, and is entirely honest about it. He would like to be paid.',
  },
  {
    id: 'npc:paymaster-ozu', name: 'Paymaster Ozu', title: 'of the Ronin Companies', school: 'blade', origin: 'blade', trust: 0,
    region: Z3, home: 'landmark:daisuke-camp', presentWhen: SA,
    dialogue: [{ dialogue: 'dialogue:samurai-ozu' }],
    barks: [{ lines: ['Expenses. Handling. Other expenses.', 'I’m counting. Honestly.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b498, hair: 0x4a4a4a, cloth: 0x6a5a2a, accent: 0xc8a83a, build: 'short' },
    bio: 'Keeper of the Ronin Companies’ strongbox, whose purses are always a little lighter than they should be. He cannot bear silence.',
  },
  {
    id: 'npc:old-tomoe', name: 'Old Tomoe', title: 'Sharpener of the Ronin Camps', school: 'blade', origin: 'blade', trust: 1,
    region: Z3, home: 'landmark:tomoe-whetstone', presentWhen: SA, lore: 'lore:hc-old-tomoe',
    dialogue: [{ dialogue: 'dialogue:samurai-tomoe' }],
    barks: [{ lines: ['Anyone’s sword. No questions.', 'A sword sharpened in a hurry cuts in a hurry.'] }],
    roles: ['quest', 'merchant'],
    look: { skin: 0xc0a088, hair: 0xe8e4dc, cloth: 0x4a3a3a, accent: 0xa0a0a0, build: 'slight' },
    bio: 'An old woman with a whetstone in the Ronin Camps who sharpens anyone’s sword and asks no questions. She gives away a plain sheath with every sharpening, and almost nobody keeps it.',
  },
  {
    id: 'npc:natsu', name: 'Punt-woman Natsu', title: 'of the Bamboo Shallows', school: 'blade', origin: 'blade', trust: 2,
    region: Z4, home: 'landmark:natsu-landing', presentWhen: SA,
    dialogue: [{ dialogue: 'dialogue:samurai-natsu' }],
    barks: [{ lines: ['Out here you can talk. Nobody hears you over the frogs.', 'Mind the bamboo. It falls when the Dancers pass.'] }],
    roles: ['quest'],
    look: { skin: 0xc89a78, hair: 0x2a2a2a, cloth: 0x3a5a5a, accent: 0x8ac8a8, build: 'average' },
    bio: 'The punt-woman of the Bamboo Shallows, who poles pilgrims through the flooded groves and is the only person on the frontier who talks as much as she likes.',
  },
  {
    id: 'npc:old-gama', name: 'Old Gama', title: 'Conductor of the frog choir', school: 'blade', origin: 'blade', trust: 1,
    region: Z4, home: 'landmark:frog-pond', presentWhen: SA,
    dialogue: [{ dialogue: 'dialogue:samurai-gama' }],
    barks: [{ lines: ['Brrrp.', '(He is the size of a cat and the shape of a grudge.)'] }],
    roles: ['ambient'],
    look: { skin: 0x5a7a3a, cloth: 0x3a5a2a, build: 'short' },
    bio: 'The largest frog in Steelvale and conductor of the Bamboo Shallows choir, a bad-tempered genius who walked out over a flat third verse.',
  },
  {
    id: 'npc:tetsuo-ban', name: 'Road-Warden Tetsuo Ban', title: 'of the Temple Road', school: 'blade', origin: 'blade', trust: 1,
    region: Z1, home: 'landmark:temple-road-gate', presentWhen: SA,
    dialogue: [{ dialogue: 'dialogue:samurai-tetsuo' }],
    barks: [{ lines: ['(He points at the notice-post.)', '(He mimes a punt-rope being cut, and scowls.)'] }],
    roles: ['quest'],
    look: { skin: 0xb8886a, hair: 0x2a2a2a, cloth: 0x4a4a3a, accent: 0xb08a3a, build: 'broad' },
    bio: 'Warden of the Temple Road, who keeps the peace on the frontier without once raising his voice, and posts the bounties in very small writing.',
  },
  // ---------- Act II (Concordia)
  {
    id: 'npc:hisako', name: 'Pilgrim-Mother Hisako', title: 'of the quiet pew', school: 'blade', origin: 'blade', trust: 2,
    region: 'region:alder', home: 'landmark:brind-chapel', presentWhen: ACT2,
    dialogue: [
      { when: at('quest:samurai-bonelord-varric', 'tell'), dialogue: 'dialogue:samurai-hisako-varric' },
      { when: at('quest:samurai-the-quiet-pew', 'pew'), dialogue: 'dialogue:samurai-hisako' },
      { dialogue: 'dialogue:blade-hisako' },
    ],
    barks: [{ lines: ['(She sits perfectly still in the back pew.)', '(She makes the Temple Road sign: I am here.)'] }],
    roles: ['quest'],
    look: { skin: 0xc8a888, hair: 0xe8e4dc, cloth: 0x8a8a7a, accent: 0xd8c89a, build: 'slight' },
    bio: 'The eldest of five Hushpine pilgrims who were in Concordia when the arches shut in C. 1012. For thirty years they have kept silence in the back pew of the Chapel of the Drowned Bell, without ever quite knowing why.',
  },
  {
    id: 'npc:hettie-natter-concordia', name: 'Goodwife Hettie Natter', title: 'a pilgrim, a long way from the Temple Road', school: 'blade', origin: 'blade', trust: 2,
    region: 'region:alder', home: 'landmark:gate-circle',
    presentWhen: { all: [SA, ACT2, { any: [{ questActive: 'quest:samurai-kanemoris-word' }, { questCompleted: 'quest:samurai-kanemoris-word' }] }] },
    // C-6: escorted across the moor to the quiet pew, where she stays; Act III: she follows the bearers into the Heart
    schedule: [
      { from: 0, to: 24, at: 'landmark:heart-camp', activity: 'idle', when: HEART_POST },
      { from: 0, to: 24, at: 'landmark:brind-chapel', activity: 'idle', when: { any: [at('quest:samurai-kanemoris-word', 'court'), at('quest:samurai-kanemoris-word', 'reply'), { questCompleted: 'quest:samurai-kanemoris-word' }] } },
    ],
    dialogue: [
      { when: HEART_POST, dialogue: 'dialogue:samurai-hettie-heart' },
      { dialogue: 'dialogue:samurai-hettie-letter' },
    ],
    barks: [{ lines: ['(Both hands clamped over her mouth.)', 'Concordia is so LOUD. I love it.'] }],
    roles: ['quest'],
    look: { skin: 0xe0b898, hair: 0x8a5a3a, cloth: 0x8a7a5a, accent: 0xe8c86a, build: 'broad' },
    bio: 'Hettie Natter walked down the pilgrim road and through the Edge Gate to deliver Sensei Kanemori’s letter, in silence, which nearly killed her.',
  },
];

export default npcs;
