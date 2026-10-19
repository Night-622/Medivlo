/**
 * Hollow Crown, Thunderreach: the Thunderclap Heights NPCs for the Stormlancer campaign (06-outlines/storm.md), plus
 * the Stormlancer's Concordia people (Cliffstair's Wind Yard, Wardenhold's watchtower, Odran's messengers).
 * Zones: zone:storm-frontier-1 the Ram Pastures, -2 the Thunderclap Heights, -3 Skyfall Gorge, -4 the Eyrie Steps. Owner: Claude 4.
 */
import type { NarrativeCondition, NpcDef } from '@/core';

const SL: NarrativeCondition = { heroClass: 'stormlancer' };
const at = (q: `quest:${string}`, stage: string): NarrativeCondition => ({ questStage: q, stage });
const ACT1: NarrativeCondition = { all: [SL, { not: { flag: 'story.gate_open' } }] };
const ACT2: NarrativeCondition = { flag: 'story.act', op: '>=', value: 2 };
const Z1 = 'zone:storm-frontier-1' as const, Z2 = 'zone:storm-frontier-2' as const, Z3 = 'zone:storm-frontier-3' as const, Z4 = 'zone:storm-frontier-4' as const;

const npcs: NpcDef[] = [
  {
    id: 'npc:odran-gale', name: 'Lancemaster Odran Gale', title: 'Elder of the Lance Clans', school: 'storm', origin: 'storm', trust: 2,
    services: ['Mentor', 'Trains Stormlancers'], region: Z1, home: 'landmark:odran-gale-steading', lore: 'lore:hc-odran-gale',
    presentWhen: SL,
    schedule: [{ from: 0, to: 24, at: 'landmark:chime-yard', activity: 'idle', when: { any: [at('quest:stormlancer-the-bell-in-the-chimes', 'odran'), at('quest:stormlancer-the-great-charge', 'muster')] } }],
    dialogue: [
      { when: at('quest:stormlancer-the-bell-in-the-chimes', 'odran'), dialogue: 'dialogue:stormlancer-odran-bell' },
      { when: at('quest:stormlancer-the-bell-in-the-chimes', 'steading'), dialogue: 'dialogue:stormlancer-odran-steading' },
      { when: at('quest:stormlancer-reading-the-sky', 'report'), dialogue: 'dialogue:stormlancer-odran-sky' },
      { when: at('quest:stormlancer-the-ram-kings-crag', 'report'), dialogue: 'dialogue:stormlancer-odran-crag' },
      { when: at('quest:stormlancer-the-great-charge', 'muster'), dialogue: 'dialogue:stormlancer-great-charge' },
      { when: at('quest:stormlancer-faster-than-grief', 'odran'), dialogue: 'dialogue:stormlancer-odran-grief' },
      { when: at('quest:stormlancer-the-long-ride-down', 'farewell'), dialogue: 'dialogue:stormlancer-odran-farewell' },
      { when: at('quest:stormlancer-the-cowards-cairn', 'odran'), dialogue: 'dialogue:stormlancer-odran-cairn' },
      { when: at('quest:stormlancer-why-odran-falls-off', 'odran'), dialogue: 'dialogue:stormlancer-odran-falls' },
      { when: at('quest:stormlancer-maudies-lance', 'odran'), dialogue: 'dialogue:stormlancer-odran-maudie' },
      { when: at('quest:stormlancer-the-chime-maker', 'bellnote'), dialogue: 'dialogue:stormlancer-odran-chime' },
      { dialogue: 'dialogue:stormlancer-odran' },
    ],
    barks: [{ lines: ['No hurry.', 'Thought I’d let you go first.', '(He is lying on his back in the grass beside a ram, looking at the sky. He seems to have meant to.)'] }],
    roles: ['quest', 'trainer'], essential: true,
    look: { skin: 0xb88a6a, hair: 0xd0d0c8, cloth: 0x4a5a3a, accent: 0x6ac8ff, build: 'tall' },
    bio: 'The slowest-talking elder of the Lance Clans, who has fallen off more rams than anyone alive and always gets up at the same speed. He gives everyone time, even when they have not asked for it. His name is the oldest on the Coward’s Cairn.',
  },
  {
    id: 'npc:old-biddy', name: 'Old Biddy', title: 'Odran’s ram', school: 'storm', origin: 'storm', trust: 2,
    region: Z1, home: 'landmark:odran-gale-steading', presentWhen: ACT1,
    dialogue: [{ dialogue: 'dialogue:stormlancer-old-biddy' }],
    barks: [{ lines: ['(Old Biddy looks at you. Old Biddy looks at Odran. Old Biddy decides against both of you.)', '(She is chewing something that was recently a glove.)'] }],
    roles: ['ambient'],
    look: { skin: 0xd8d0c0, hair: 0x8a8a8a, cloth: 0x6a5a4a, accent: 0x6ac8ff, build: 'average' },
    bio: 'Odran Gale’s Storm Ram, grizzled, sour and enormous, who has thrown him more times than anyone alive. They are devoted to each other and would never admit it.',
  },
  {
    id: 'npc:cass-vantor', name: 'Cass Vantor', title: 'first rider of the Lance Clans', school: 'storm', origin: 'storm', trust: 3,
    region: Z2, home: 'landmark:thunderclap-run-start', lore: 'lore:hc-cass-vantor',
    // Act I on the Heights; Act III, beaten on the stair top, waiting for her fate (the scene must be reopenable)
    presentWhen: { all: [SL, { any: [{ questActive: 'quest:stormlancer-catch-her' }, { questActive: 'quest:stormlancer-faster-than-grief' }, at('quest:stormlancer-the-swift-herald', 'fate')] }] },
    schedule: [
      { from: 0, to: 24, at: 'landmark:twelve-stairs-top', activity: 'idle', when: at('quest:stormlancer-the-swift-herald', 'fate') },
      { from: 0, to: 24, at: 'landmark:eyrie-stair', activity: 'idle', when: { questActive: 'quest:stormlancer-faster-than-grief' } },
    ],
    dialogue: [
      { when: at('quest:stormlancer-the-swift-herald', 'fate'), dialogue: 'dialogue:stormlancer-herald-fate' },
      { when: at('quest:stormlancer-catch-her', 'streak'), dialogue: 'dialogue:stormlancer-cass-streak' },
      { when: at('quest:stormlancer-catch-her', 'cass'), dialogue: 'dialogue:stormlancer-cass-run' },
      { when: at('quest:stormlancer-faster-than-grief', 'steps'), dialogue: 'dialogue:stormlancer-cass-grief' },
      { dialogue: 'dialogue:stormlancer-cass' },
    ],
    barks: [{ lines: ['Catch me! Go on! You never could!', '(She is already gone. The grass where she stood is scorched.)', 'Don’t stop. If you stop, it catches you.'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xe0b890, hair: 0xd8a040, cloth: 0x3a4a6a, accent: 0x1a1a1a, build: 'slight' },
    bio: 'The hero’s lance-rival, who always rode first. A month before the Bell she rode into Skyrender’s storm alone, and her ram Thistle came home without her. She came back on foot, laughing, and faster than anything alive.',
  },
  // ---------- the Ram Pastures
  {
    id: 'npc:thistle', name: 'Thistle', title: 'Cass’s ram', school: 'storm', origin: 'storm', trust: 1,
    region: Z1, home: 'landmark:thistles-stall', presentWhen: ACT1,
    dialogue: [
      { when: at('quest:stormlancer-thistle-wont-eat', 'thistle'), dialogue: 'dialogue:stormlancer-thistle-eats' },
      { dialogue: 'dialogue:stormlancer-thistle' },
    ],
    barks: [{ lines: ['(She stands facing the door of her stall, the way she has for a month.)', '(Her trough is full. It has been full for a month.)'] }],
    roles: ['quest'],
    look: { skin: 0xc8b8a0, hair: 0x5a4a3a, cloth: 0x8a6a4a, accent: 0xd8a040, build: 'average' },
    bio: 'Cass Vantor’s Storm Ram, who came home from Skyrender’s storm alone a month ago and has stood in her stall facing the door ever since. She will not eat.',
  },
  {
    id: 'npc:thistle-heart', name: 'Thistle', title: 'Cass’s ram, at the top of the Storm stair', school: 'storm', origin: 'storm', trust: 2,
    region: 'region:heart', home: 'landmark:twelve-stairs-top',
    // after the quest she stays only if Cass is gone: she waits where the fast ones go
    presentWhen: { all: [SL, { any: [{ questActive: 'quest:stormlancer-thistle' }, { all: [{ questCompleted: 'quest:stormlancer-thistle' }, { flag: 'stormlancer.nemesis_fate', value: 'destroyed' }, { not: { flag: 'story.complete' } }] }] }] },
    dialogue: [{ dialogue: 'dialogue:stormlancer-thistle-heart' }],
    barks: [{ lines: ['(She walked here. All the way. At a walk.)', '(She is facing the top of the Storm stair, and she will not move.)'] }],
    roles: ['quest'],
    look: { skin: 0xc8b8a0, hair: 0x5a4a3a, cloth: 0x8a6a4a, accent: 0xd8a040, build: 'average' },
    bio: 'Thistle walked from the Thunderclap Heights to the Heart behind the hero, the whole way, at a walk, and climbed the Storm stair to wait for Cass.',
  },
  {
    id: 'npc:wynn-tarry', name: 'Old Wynn Tarry', title: 'last rider of the Turning escort of C. 1012', school: 'storm', origin: 'storm', trust: 2,
    region: 'region:heart', home: 'landmark:legion-camp',
    presentWhen: { all: [SL, { questActive: 'quest:stormlancer-ride-second' }] },
    // escorted up the stair at 'stairs' (wave 2 depth); waits at the top for 'top'
    schedule: [{ from: 0, to: 24, at: 'landmark:twelve-stairs-top', activity: 'idle', when: at('quest:stormlancer-ride-second', 'top') }],
    dialogue: [{ dialogue: 'dialogue:stormlancer-wynn' }],
    barks: [{ lines: ['Go on ahead, young ’un. Everyone does.', '(She is a long way behind everybody, and she always has been.)'] }],
    roles: ['quest'],
    look: { skin: 0xc8a890, hair: 0xd8d8d0, cloth: 0x4a5a7a, accent: 0xd8a040, build: 'short' },
    bio: 'A Lance Clan rider who went with the Storm bearer’s escort to the 85th Turning on the slowest ram on the Heights. She came in last, after the doors had shut, and the Hollow Legion took her where she stood.',
  },
  {
    id: 'npc:wendeline-chyme', name: 'Wendeline Chyme', title: 'Chime-Maker of the Pastures', school: 'storm', origin: 'storm', trust: 2,
    region: Z1, home: 'landmark:chime-yard', presentWhen: ACT1,
    dialogue: [{ dialogue: 'dialogue:stormlancer-wendeline' }],
    barks: [{ lines: ['Every one of them, the same note. The same note! Like a choir that’s forgotten the tune.', 'A chime that tells you nothing is just noise with a hook on it.'] }],
    roles: ['quest'],
    look: { skin: 0xe0c0a8, hair: 0xc8c8d8, cloth: 0x4a6a8a, accent: 0xe8e8ff, build: 'slight' },
    bio: 'The clans’ chime-maker, whose wind-chimes hang from every steading on the Heights and tell the herders which way a storm is coming. Since the Bell, every chime she has ever made rings the same note.',
  },
  {
    id: 'npc:gwenna-fold', name: 'Herdmistress Gwenna Fold', title: 'of the Ram Pastures', school: 'storm', origin: 'storm', trust: 1,
    region: Z1, home: 'landmark:chime-yard', presentWhen: ACT1,
    dialogue: [
      { when: at('quest:stormlancer-the-great-charge', 'canvass'), dialogue: 'dialogue:stormlancer-gwenna-canvass' },
      { dialogue: 'dialogue:stormlancer-gwenna' },
    ],
    barks: [{ lines: ['Bounties on the post. Herds first. Glory after, if there’s time.', 'Count your rams. Then count them again. Then come and tell me.'] }],
    roles: ['quest'],
    look: { skin: 0xc8a080, hair: 0x6a4a2a, cloth: 0x5a4a3a, accent: 0xb08a3a, build: 'broad' },
    bio: 'Herdmistress of the Ram Pastures, who keeps the clans’ bounty post and counts every ram on the Heights every evening, out loud, with feeling.',
  },
  // ---------- the Thunderclap Heights
  {
    id: 'npc:osric-quell', name: 'Strike-Reader Osric Quell', title: 'of the Thunderclap Heights', school: 'storm', origin: 'storm', trust: 2,
    region: Z2, home: 'landmark:thunderclap-run-start', presentWhen: ACT1,
    dialogue: [{ dialogue: 'dialogue:stormlancer-osric' }],
    barks: [{ lines: ['Perfectly safe. Perfectly. Step where I step.', '(Every one of his boots has a scorch-mark on it.)'] }],
    roles: ['quest'],
    look: { skin: 0xd0a888, hair: 0x2a2a2a, cloth: 0x3a3a5a, accent: 0xffe14a, build: 'slight' },
    bio: 'The clans’ strike-reader, who runs their oldest trial: crossing the open Heights in a lightning storm by stepping where it won’t strike. He insists it is perfectly safe, and has a scorch-mark on every boot he owns.',
  },
  {
    id: 'npc:tamar-mallory', name: 'Lancer Tamar Mallory', title: 'of the young lancers', school: 'storm', origin: 'storm', trust: 1,
    region: Z2, home: 'landmark:cowards-cairn', presentWhen: ACT1,
    dialogue: [
      { when: at('quest:stormlancer-the-great-charge', 'canvass'), dialogue: 'dialogue:stormlancer-tamar-canvass' },
      { when: at('quest:stormlancer-the-cowards-cairn', 'tamar'), dialogue: 'dialogue:stormlancer-tamar-told' },
      { dialogue: 'dialogue:stormlancer-tamar' },
    ],
    barks: [{ lines: ['Charge it! Charge the storm! What are we waiting for, the weather?', '(She spits at the Coward’s Cairn, carefully, so as not to hit it.)'] }],
    roles: ['quest'],
    look: { skin: 0xe8c0a0, hair: 0x8a2a1a, cloth: 0x6a2a2a, accent: 0xe8e8ff, build: 'slight' },
    bio: 'The loudest of the young lancers, who means to charge Skyrender’s storm the moment anyone lets her, and spits at the Coward’s Cairn every time she rides past, though she is careful never to hit it.',
  },
  // ---------- Skyfall Gorge
  {
    id: 'npc:gorge-fledgling', name: 'A Thunderbird Fledgling', title: 'small, furious, not hollow', school: 'storm', origin: 'storm',
    region: Z3, home: 'landmark:gorge-rockfall', presentWhen: ACT1,
    dialogue: [{ dialogue: 'dialogue:stormlancer-fledgling' }],
    barks: [{ lines: ['(Kreeeee.)', '(It opens its beak at you, very wide, and a very small spark comes out.)'] }],
    roles: ['quest'],
    look: { skin: 0x5a6a9a, cloth: 0x8a9ac8, accent: 0xffe14a, build: 'short' },
    bio: 'A Thunderbird fledgling, fallen out of the Aerie into Skyfall Gorge. It is not hollow. It is only small, and cold, and very angry about both.',
  },
  {
    id: 'npc:rory-gust', name: 'Rory Gust', title: 'of the gorge-riders', school: 'storm', origin: 'storm', trust: 2,
    region: Z3, home: 'landmark:gorge-rockfall', presentWhen: ACT1,
    dialogue: [{ dialogue: 'dialogue:stormlancer-rory' }],
    barks: [{ lines: ['First one through wins! Second one through is second!', 'Rockfall’s due any minute. That’s the fun of it.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b090, hair: 0x3a2a1a, cloth: 0x5a6a3a, accent: 0xe8e8ff, build: 'average' },
    bio: 'Ringleader of the young gorge-riders, who dare each other to ride under the falling rocks of Skyfall Gorge. Whoever goes through first wins. Somebody always has to go second.',
  },
  // ---------- the Eyrie Steps
  {
    id: 'npc:tally-rowe', name: 'Old Tally Rowe', title: 'Counter of the Eyrie Steps', school: 'storm', origin: 'storm', trust: 2,
    region: Z4, home: 'landmark:eyrie-stair', presentWhen: ACT1,
    dialogue: [{ dialogue: 'dialogue:stormlancer-tally' }],
    barks: [{ lines: ['Three hundred and four. It was three hundred and three. For forty years it was three hundred and three!', 'Don’t step on two hundred and twelve. Or the new one. Especially the new one.'] }],
    roles: ['quest'],
    look: { skin: 0xc8a890, hair: 0xe8e8e0, cloth: 0x5a4a6a, accent: 0xb08a3a, build: 'short' },
    bio: 'Old Tally Rowe has counted the Eyrie Steps every morning for forty years. There have always been three hundred and three. Since the night the Bell rang, there have been three hundred and four.',
  },
  {
    id: 'npc:nessa-plume', name: 'Nessa Plume', title: 'Pennant-Maker of the Clans', school: 'storm', origin: 'storm', trust: 2,
    region: Z4, home: 'landmark:eyrie-stair', presentWhen: ACT1,
    dialogue: [{ dialogue: 'dialogue:stormlancer-nessa' }],
    barks: [{ lines: ['A pennant’s a promise you can see from a mile off.', 'Black feathers won’t take a stitch. They just weep through it.'] }],
    roles: ['quest'],
    look: { skin: 0xe0c8b0, hair: 0x6a3a5a, cloth: 0x8a5a8a, accent: 0xffe14a, build: 'slight' },
    bio: 'The clans’ pennant-maker, who sews the lance-pennants of the Heights from Thunderbird feathers, and has run out of clean ones.',
  },
  // ---------- Act II (Concordia)
  {
    id: 'npc:hamlin-crake', name: 'Goatmaster Hamlin Crake', title: 'of the Cliffstair Wind Yard', school: 'storm', origin: 'storm', trust: 2,
    region: 'region:storm', home: 'landmark:cliff-wind-yard', presentWhen: ACT2,
    // C-2 (wave 2 depth): he follows you up the Stormcliffs on his goat and waits at the lip until the Stormcrow falls
    schedule: [{ from: 0, to: 24, at: 'landmark:stormlancer-cliff-lip', activity: 'idle', when: { any: [at('quest:stormlancer-the-cliff-charge', 'lip'), at('quest:stormlancer-the-cliff-charge', 'up')] } }],
    dialogue: [
      { when: at('quest:stormlancer-cliffstair', 'crake'), dialogue: 'dialogue:stormlancer-hamlin' },
      { when: at('quest:stormlancer-the-cliff-charge', 'lip'), dialogue: 'dialogue:stormlancer-hamlin-lip' },
      { when: at('quest:stormlancer-the-stormcrow', 'tell'), dialogue: 'dialogue:stormlancer-hamlin-crow' },
      { dialogue: 'dialogue:storm-hamlin' },
    ],
    barks: [{ lines: ['No rams in Concordia. So: goats. Don’t laugh. The goats can hear you.', 'Lance up! Goat steady! Goat, I said steady!'] }],
    roles: ['quest'],
    look: { skin: 0xc8a080, hair: 0x5a5a5a, cloth: 0x3a4a6a, accent: 0xe8e8ff, build: 'broad' },
    bio: 'Master of the Wind Yard at Cliffstair, where Morvane’s Stormlancers have trained for thirty years on the only mounts Concordia had to offer. His goats are the finest lance-goats in the world, and the only ones.',
  },
  {
    id: 'npc:gudrun-hailstone', name: 'Watchman Gudrun Hailstone', title: 'of the Wardenhold watchtower', school: 'rime', origin: 'rime', trust: 1,
    region: 'region:frost', home: 'landmark:warden-watchtower', presentWhen: ACT2,
    dialogue: [
      { when: at('quest:stormlancer-the-race-on-the-pass', 'gudrun'), dialogue: 'dialogue:stormlancer-gudrun' },
      { dialogue: 'dialogue:storm-gudrun' },
    ],
    barks: [{ lines: ['Something runs the pass at night. I log it. Nobody reads the log.', 'Avalanche, half past two. Another one, a quarter to three. She was ahead of both.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b8a0, hair: 0x8a8a8a, cloth: 0x3a4a5a, accent: 0xe8f0ff, build: 'average' },
    bio: 'The night watchman of the Wardenhold watchtower, who has logged every avalanche on Frostmere Pass for twenty years, and has lately begun logging a runner who goes up the pass ahead of them.',
  },
  {
    id: 'npc:old-biddy-gate', name: 'Old Biddy', title: 'Odran’s ram, a long way from home', school: 'storm', origin: 'storm', trust: 3,
    region: 'region:alder', home: 'landmark:gate-circle',
    presentWhen: { all: [SL, { questActive: 'quest:stormlancer-old-biddy-brings-word' }, { not: { flag: 'stormlancer.biddy_mount' } }] },
    dialogue: [
      { when: at('quest:stormlancer-old-biddy-brings-word', 'reply'), dialogue: 'dialogue:stormlancer-biddy-reply' },
      { dialogue: 'dialogue:stormlancer-biddy-word' },
    ],
    barks: [{ lines: ['(Old Biddy is eating the Gate Circle. Slowly. Starting with the grass.)'] }],
    roles: ['quest'],
    look: { skin: 0xd8d0c0, hair: 0x8a8a8a, cloth: 0x6a5a4a, accent: 0x6ac8ff, build: 'average' },
    bio: 'Old Biddy has walked out of the Storm arch with a message tied to her horn, and is grazing the Gate Circle as if she owned it.',
  },
  {
    id: 'npc:lob-ferris', name: 'Runner Lob Ferris', title: 'of the Lance Clans', school: 'storm', origin: 'storm', trust: 2,
    region: 'region:alder', home: 'landmark:gate-circle',
    presentWhen: { all: [SL, { questActive: 'quest:stormlancer-old-biddy-brings-word' }, { flag: 'stormlancer.biddy_mount' }] },
    dialogue: [
      { when: at('quest:stormlancer-old-biddy-brings-word', 'reply'), dialogue: 'dialogue:stormlancer-lob-reply' },
      { dialogue: 'dialogue:stormlancer-lob-word' },
    ],
    barks: [{ lines: ['Ran the whole Copper Road. Walked the last bit. Don’t tell the Lancemaster.'] }],
    roles: ['quest'],
    look: { skin: 0xe0b890, hair: 0x2a1a14, cloth: 0x4a5a3a, accent: 0x6ac8ff, build: 'slight' },
    bio: 'A clan runner sent through the Copper Gate by Odran Gale, because the Lancemaster’s ram is already with the hero and the Lancemaster himself would take a month.',
  },
];

export default npcs;
