/**
 * Hollow Crown, Ironhold: Anvilgate NPCs for the Knight campaign (docs/lore/hollow-crown/06-outlines/iron.md),
 * plus the Knight's Concordia NPCs (the Ironhold envoy at Gildport, and Gideon's letter-bearers).
 * Zones: zone:iron-capital-1 the Anvilgate Wards, -2 the Tilt Yard, -3 the Fortress Forge, -4 Berenika's Wall. Owner: Claude 4.
 */
import type { NarrativeCondition, NpcDef } from '@/core';

const KN: NarrativeCondition = { heroClass: 'knight' };
const at = (q: `quest:${string}`, stage: string): NarrativeCondition => ({ questStage: q, stage });
const Z1 = 'zone:iron-capital-1' as const, Z2 = 'zone:iron-capital-2' as const, Z3 = 'zone:iron-capital-3' as const, Z4 = 'zone:iron-capital-4' as const;

const npcs: NpcDef[] = [
  {
    id: 'npc:gideon-marke', name: 'Ser Gideon Marke', title: 'Knight of the Order of the Anvil', school: 'iron', origin: 'iron', trust: 2,
    services: ['Mentor', 'Trains Knights'], region: Z1, home: 'landmark:gideon-quarters', lore: 'lore:hc-gideon-marke',
    presentWhen: KN,
    schedule: [
      { from: 0, to: 24, at: 'landmark:order-chapel', activity: 'idle', when: at('quest:knight-the-vigil', 'gideon') },
      { from: 0, to: 24, at: 'landmark:wall-dubbing-tower', activity: 'idle', when: at('quest:knight-the-dubbing-on-the-wall', 'wall') },
      { from: 0, to: 24, at: 'landmark:knight-colossus-breach', activity: 'idle', when: at('quest:knight-the-vigil', 'breach') },
    ],
    dialogue: [
      { when: at('quest:knight-the-vigil', 'quarters'), dialogue: 'dialogue:knight-gideon-morning' },
      { when: at('quest:knight-the-vigil', 'gideon'), dialogue: 'dialogue:knight-gideon-vigil' },
      { when: at('quest:knight-the-barrow-vigil', 'report'), dialogue: 'dialogue:knight-gideon-roswitha' },
      { when: at('quest:knight-a-king-for-the-colossus', 'gideon'), dialogue: 'dialogue:knight-gideon-roll' },
      { when: at('quest:knight-the-dubbing-on-the-wall', 'wall'), dialogue: 'dialogue:knight-gideon-dubbing' },
      { when: at('quest:knight-the-stewards-writ', 'gideon'), dialogue: 'dialogue:knight-gideon-writ' },
      { when: at('quest:knight-gideons-spurs', 'gideon'), dialogue: 'dialogue:knight-gideon-spurs' },
      { when: at('quest:knight-the-replica-crown', 'gideon'), dialogue: 'dialogue:knight-gideon-crown' },
      { dialogue: 'dialogue:knight-gideon' },
    ],
    barks: [{ lines: ['Hold the line. Mind the gap in it.', '(He nods to you, and says nothing, which from Ser Gideon is a speech.)', 'Eat the breakfast.'] }],
    roles: ['quest', 'trainer'], essential: true,
    look: { skin: 0xd8b8a0, hair: 0xd8d8d0, cloth: 0x6e6e74, accent: 0x9aa4b0, build: 'tall' },
    bio: 'Queen Berenika’s last living knight: old, grey-cloaked, kind and so full of guilt that he has kept every squire at arm’s length for thirty years. He has not ridden since the night of the Hollowing, and he keeps a pot of paint for arms he never gets to paint.',
  },
  {
    id: 'npc:konrad-berenikson', name: 'Prince-Regent Konrad Berenikson', title: 'Regent of Ironhold', school: 'iron', origin: 'iron', trust: 2,
    region: Z2, home: 'landmark:tilt-yard-lists', lore: 'lore:hc-konrad-berenikson',
    // Act I in Anvilgate; Act III, beaten on the stair top, waiting for his fate (the scene must be reopenable)
    presentWhen: { all: [KN, { any: [{ not: { flag: 'knight.halfstone' } }, at('quest:knight-the-iron-head', 'fate')] }] },
    schedule: [
      { from: 0, to: 24, at: 'landmark:twelve-stairs-top', activity: 'idle', when: at('quest:knight-the-iron-head', 'fate') },
      { from: 0, to: 24, at: 'landmark:council-of-the-forge', activity: 'idle', when: at('quest:knight-the-colossus-vote', 'vote') },
      { from: 0, to: 24, at: 'landmark:colossus-cradle', activity: 'idle', when: at('quest:knight-a-king-for-the-colossus', 'cradle') },
    ],
    dialogue: [
      { when: at('quest:knight-the-iron-head', 'fate'), dialogue: 'dialogue:knight-herald-fate' },
      { when: at('quest:knight-the-prince-regents-purse', 'konrad'), dialogue: 'dialogue:knight-konrad-purse' },
      { when: at('quest:knight-the-colossus-vote', 'vote'), dialogue: 'dialogue:knight-colossus-vote' },
      { when: at('quest:knight-a-king-for-the-colossus', 'cradle'), dialogue: 'dialogue:knight-konrad-cradle' },
      { dialogue: 'dialogue:knight-konrad' },
    ],
    barks: [{ lines: ['Ironhold has apologised for thirty years. I’d like to try something else.', 'Have you eaten? Stop apologising and eat.', 'Gold and black. It suits everyone. It suits you.'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xf0d0b0, hair: 0xf0c860, cloth: 0x1a1a1a, accent: 0xd9a83a, build: 'tall' },
    bio: 'Queen Berenika’s grandson and Regent of Ironhold: golden-haired, generous, funny and tired of being sorry. He wins tourneys in borrowed armour and gives away the purse. He wears his grandmother’s plate on state occasions, and has never once noticed that it weeps.',
  },
  {
    id: 'npc:ansel-varley', name: 'Chapter-Master Ansel Varley', title: 'of the Order of the Anvil', school: 'iron', origin: 'iron', trust: 1,
    region: Z1, home: 'landmark:order-chapterhouse', presentWhen: KN,
    schedule: [{ from: 0, to: 24, at: 'landmark:council-of-the-forge', activity: 'idle', when: at('quest:knight-the-colossus-vote', 'vote') }],
    dialogue: [
      { when: at('quest:knight-forty-gates', 'chapter'), dialogue: 'dialogue:knight-varley-letter' },
      { dialogue: 'dialogue:knight-varley' },
    ],
    barks: [{ lines: ['Form of contrition, second class. In triplicate.', 'The Order holds the line. The line is mostly walls at present.'] }],
    roles: ['quest'],
    look: { skin: 0xe0c0a0, hair: 0x5a4a3a, cloth: 0x6e6e74, accent: 0xffffff, build: 'average' },
    bio: 'Chapter-Master of the Order of the Anvil: punctilious, a little pompous, and secretly delighted whenever anything happens. He has kept the Order’s rules for thirty years and would very much like there to be a reason for them again.',
  },
  {
    id: 'npc:hilde-ninelocks', name: 'Hilde Ninelocks', title: 'Toll-keeper of Lantern Street', school: 'iron', origin: 'iron', trust: 2,
    region: Z1, home: 'landmark:hilde-toll-house', presentWhen: KN,
    dialogue: [{ dialogue: 'dialogue:knight-hilde' }],
    barks: [{ lines: ['Nine keys. Ten gates. Nine keys, ten gates.', 'Penny a person. Two with a shield. Don’t argue, I’ve heard it.'] }],
    roles: ['quest'],
    look: { skin: 0xd8a888, hair: 0x8a8a8a, cloth: 0x4a5a6a, accent: 0xb08a3a, build: 'short' },
    bio: 'Toll-keeper of Lantern Street for twenty years, who carries nine keys on a ring the size of a dinner plate and counts her gates every night before bed.',
  },
  {
    id: 'npc:absalom-bray', name: 'Clerk Absalom Bray', title: 'of the Office of Public Contrition', school: 'iron', origin: 'iron', trust: 2,
    region: Z1, home: 'landmark:office-of-contrition', presentWhen: KN,
    dialogue: [{ dialogue: 'dialogue:knight-bray' }],
    barks: [{ lines: ['Dear Concordia, we remain sorry. No. Too stiff.', 'Mind the shelves. Mind the other shelves.'] }],
    roles: ['quest'],
    look: { skin: 0xe8c8b0, hair: 0x3a3a3a, cloth: 0x2a2a3a, accent: 0xc8c8c8, build: 'slight' },
    bio: 'The only clerk of the Office of Public Contrition, who has written Concordia one formal apology a day since the Hollowing. Ten thousand, nine hundred and fifty letters. He has never sent one.',
  },
  {
    id: 'npc:barnabas-hock', name: 'Toll-Sergeant Barnabas Hock', title: 'of the Anvilgate Watch', school: 'iron', origin: 'iron', trust: 1,
    region: Z1, home: 'landmark:anvilgate-toll-board', presentWhen: KN,
    dialogue: [{ dialogue: 'dialogue:knight-hock' }],
    barks: [{ lines: ['Bounties on the board. Toll first. Joke. Mostly.', 'Forty gates and I’ve walked every one of them twice today.'] }],
    roles: ['quest'],
    look: { skin: 0xc89070, hair: 0x6a4a2a, cloth: 0x4a4a5a, accent: 0xb08a3a, build: 'broad' },
    bio: 'Sergeant of the Watch on the inner tolls, who posts the Wards’ bounties and has opinions about every one of the forty gates.',
  },
  {
    id: 'npc:wat-mudge', name: 'Squire Wat Mudge', title: 'of the Order of the Anvil', school: 'iron', origin: 'iron', trust: 3,
    region: Z2, home: 'landmark:tilt-yard-lists', presentWhen: KN,
    dialogue: [{ dialogue: 'dialogue:knight-wat' }],
    barks: [{ lines: ['Don’t mind the dent. That’s from Tuesday.', 'Lance low, eyes open… or was it lance open, eyes low?'] }],
    roles: ['quest'],
    look: { skin: 0xf0c8a8, hair: 0xb8743a, cloth: 0x6e6e74, accent: 0xb5481f, build: 'average' },
    bio: 'Your fellow squire: cheerful, brave, loyal to a fault and the worst jouster in the Order’s history. He has fallen off every horse in the Tilt Yard, including one that was asleep.',
  },
  {
    id: 'npc:duty', name: 'Duty', title: 'the Queen’s destrier', school: 'iron', origin: 'iron', trust: 2,
    region: Z2, home: 'landmark:duty-stall', presentWhen: KN,
    dialogue: [{ dialogue: 'dialogue:knight-duty' }],
    barks: [{ lines: ['(He looks at you over the stall door, patiently, as if you are late.)', '(A long, unimpressed snort.)'] }],
    roles: ['quest'],
    look: { skin: 0xb8b8b8, cloth: 0x6e6e74, accent: 0xd9a83a, build: 'broad' },
    bio: 'Queen Berenika’s last destrier, thirty-eight years old, white about the muzzle and extremely set in his ways. He has refused to leave his stall since the night of the Bell.',
  },
  {
    id: 'npc:marit-blum', name: 'Forgemistress Marit Blum', title: 'of the Fortress Forge', school: 'iron', origin: 'iron', trust: 2,
    region: Z3, home: 'landmark:forge-rivet-benches', presentWhen: KN,
    dialogue: [
      { when: at('quest:knight-the-colossus-vote', 'canvass'), dialogue: 'dialogue:knight-blum-canvass' },
      { dialogue: 'dialogue:knight-blum' },
    ],
    barks: [{ lines: ['Mind the sparks. Mind the slag. Mind my riveters.', 'Thirty years we built one thing, and it walked out through the wall.'] }],
    roles: ['quest'],
    look: { skin: 0xb07a5a, hair: 0x2a1a14, cloth: 0x3a2a20, accent: 0xff9a2e, build: 'broad' },
    bio: 'Forgemistress of the Fortress Forge, who ran the building of the Iron Colossus for twenty years and watched it walk out through three of her walls. Her riveters are going quiet at their benches.',
  },
  {
    id: 'npc:old-jarek', name: 'Old Jarek', title: 'Mason of Berenika’s Wall', school: 'iron', origin: 'iron', trust: 2,
    region: Z4, home: 'landmark:wall-masons-stair', presentWhen: KN,
    dialogue: [
      { when: at('quest:knight-the-colossus-vote', 'canvass'), dialogue: 'dialogue:knight-jarek-canvass' },
      { dialogue: 'dialogue:knight-jarek' },
    ],
    barks: [{ lines: ['Built this Wall. Me and four hundred others.', 'She’s cracking. Good stone, though. Good stone.'] }],
    roles: ['quest'],
    look: { skin: 0xc8a080, hair: 0xe8e4dc, cloth: 0x5a4a3a, accent: 0x9aa4b0, build: 'short' },
    bio: 'One of the four hundred masons who built the Wall of Shame after the Hollowing, every one ordered to cut an apology into their stone. His eyes are going, and he would like to read his once more.',
  },
  {
    id: 'npc:fenna-tock', name: 'Fenna Tock', title: 'the Wall-Walker, aged nine', school: 'iron', origin: 'iron', trust: 3,
    region: Z4, home: 'landmark:wall-walk-steps', presentWhen: KN,
    dialogue: [{ dialogue: 'dialogue:knight-fenna' }],
    barks: [{ lines: ['If you squint you can see the whole world from up there.', 'I’m going to be first through the gate. Before the knights.'] }],
    roles: ['quest'],
    look: { skin: 0xe8c4a8, hair: 0x4a2a1a, cloth: 0x8a5a3a, accent: 0xffd36a, build: 'slight' },
    bio: 'A nine-year-old who walks the top of Berenika’s Wall every evening, against all instructions, hoping to see Concordia.',
  },
  // ---------- Act II (Concordia)
  {
    id: 'npc:perpetua-stannard', name: 'Envoy Perpetua Stannard', title: 'of the Ironhold embassy at Gildport', school: 'iron', origin: 'iron', trust: 1,
    region: 'region:gilded', home: 'landmark:iron-embassy-gildport', lore: 'lore:hc-iron-embassy',
    presentWhen: { flag: 'story.act', op: '>=', value: 2 },
    // Knight C-1: escorted to the head of the gold stair, where she stays to listen while you go down (C-2)
    schedule: [{ from: 0, to: 24, at: 'landmark:knight-gold-stair', activity: 'idle', when: { any: [at('quest:knight-the-iron-embassy', 'hear'), { questActive: 'quest:knight-the-buried-forge' }] } }],
    dialogue: [
      { when: at('quest:knight-the-iron-embassy', 'hear'), dialogue: 'dialogue:knight-perpetua-stair' },
      { when: at('quest:knight-the-gilded-engine', 'tell'), dialogue: 'dialogue:knight-perpetua-engine' },
      { when: at('quest:knight-the-iron-embassy', 'envoy'), dialogue: 'dialogue:knight-perpetua' },
      { dialogue: 'dialogue:iron-perpetua' },
    ],
    barks: [{ lines: ['The embassy is open. It has been open for thirty years.', 'You are forgiven. Come home. Every week. Not one got through.'] }],
    roles: ['quest'],
    look: { skin: 0xe0c0a8, hair: 0xb8b8c0, cloth: 0x2a3440, accent: 0xd9a83a, build: 'slight' },
    bio: 'Ironhold’s last envoy to Concordia, still accredited, who has kept the embassy lamp lit at Gildport for thirty years and written to Anvilgate every week: “You are forgiven. Come home.”',
  },
  {
    id: 'npc:duty-concordia', name: 'Duty', title: 'the Queen’s destrier, a long way from his stall', school: 'iron', origin: 'iron', trust: 3,
    region: 'region:alder', home: 'landmark:gate-circle',
    presentWhen: { all: [KN, { flag: 'knight.duty_walked' }, { questActive: 'quest:knight-gideons-letter' }] },
    dialogue: [{ dialogue: 'dialogue:knight-gideon-letter' }],
    barks: [{ lines: ['(He has a letter tucked under his girth, and an air of having done something nobody told him to.)'] }],
    roles: ['quest'],
    look: { skin: 0xb8b8b8, cloth: 0x6e6e74, accent: 0xd9a83a, build: 'broad' },
    bio: 'Berenika’s old destrier, who walked the Queen’s last ride with you, and then walked all the way through the Iron Gate on his own with a letter from Ser Gideon.',
  },
  {
    id: 'npc:joss-ashlar', name: 'Courier Joss Ashlar', title: 'of the Wall post', school: 'iron', origin: 'iron', trust: 2,
    region: 'region:alder', home: 'landmark:gate-circle',
    // C-6 at the Gate Circle (when Duty didn't come); Act III, at the Heart camp with Gideon's spurs and a letter
    presentWhen: { all: [KN, { any: [{ all: [{ not: { flag: 'knight.duty_walked' } }, { questActive: 'quest:knight-gideons-letter' }] }, { questActive: 'quest:knight-spurs-on-the-stair' }] }] },
    schedule: [{ from: 0, to: 24, at: 'landmark:heart-camp', activity: 'idle', when: { questActive: 'quest:knight-spurs-on-the-stair' } }],
    dialogue: [
      { when: { questActive: 'quest:knight-spurs-on-the-stair' }, dialogue: 'dialogue:knight-courier-heart' },
      { dialogue: 'dialogue:knight-gideon-letter' },
    ],
    barks: [{ lines: ['Thirty-nine gates and a Colossus, and I’ve still got two pennies.'] }],
    roles: ['quest'],
    look: { skin: 0xd8a888, hair: 0x3a2a1a, cloth: 0x4a5a6a, accent: 0xb08a3a, build: 'slight' },
    bio: 'A courier of the Wall post, sent through the Iron Gate by Ser Gideon with a letter three lines long.',
  },
  // ---------- Act III (the Heart)
  {
    id: 'npc:blank-shield', name: 'The Blank Shield', title: 'an empty suit of armour, wearing one small anvil', school: 'iron', origin: 'iron', trust: 2,
    region: 'region:heart', home: 'landmark:heart-camp',
    // walks in behind the hero at the Heart camp; once posted, keeps its watch on the Iron stair until the story ends
    presentWhen: { all: [KN, { any: [{ questActive: 'quest:knight-the-blank-shields-crest' }, { questCompleted: 'quest:knight-the-blank-shields-crest' }] }, { not: { flag: 'story.complete' } }] },
    schedule: [{ from: 0, to: 24, at: 'landmark:twelve-stairs-top', activity: 'idle', when: { any: [at('quest:knight-the-blank-shields-crest', 'stair'), { questCompleted: 'quest:knight-the-blank-shields-crest' }] } }],
    dialogue: [{ dialogue: 'dialogue:knight-blank-shield' }],
    barks: [{ lines: ['(It stands three polite paces behind you, exactly.)', '(Its small anvil catches the light.)'] }],
    roles: ['quest'],
    look: { skin: 0x8a8a90, cloth: 0x6e6e74, accent: 0x9aa4b0, build: 'tall' },
    bio: 'Thirty years of crests, scraped off Ironhold’s shields in shame, once gathered in the Heraldry Vault into one nameless suit of armour. Emptied now, it wears a single crest, the Order’s oldest mark, and it has walked all the way from Anvilgate behind you.',
  },
];

export default npcs;
