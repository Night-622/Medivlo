/**
 * Hollow Crown, Mountainreach: the Lowfold Pits NPCs for the Brawler campaign (docs/lore/hollow-crown/06-outlines/fist.md),
 * plus the Brawler's Concordia NPCs (the cellar ring under the Briar & Kettle, Honest Abigail at Kilnmouth, and Tilly).
 * Zones: zone:fist-frontier-1 Knuckletown, -2 the Lowfold Pits, -3 the Goat Paths, -4 the Quarry Rings. Owner: Claude 4.
 */
import type { NarrativeCondition, NpcDef } from '@/core';

const BW: NarrativeCondition = { heroClass: 'brawler' };
const at = (q: `quest:${string}`, stage: string): NarrativeCondition => ({ questStage: q, stage });
const Z1 = 'zone:fist-frontier-1' as const, Z2 = 'zone:fist-frontier-2' as const, Z3 = 'zone:fist-frontier-3' as const, Z4 = 'zone:fist-frontier-4' as const;

const npcs: NpcDef[] = [
  {
    id: 'npc:tobiah-knuckle', name: '“Pops” Tobiah Knuckle', title: 'Cornerman, retired champion of the Lowfold', school: 'fist', origin: 'fist', trust: 2,
    services: ['Mentor', 'Trains Brawlers', 'Noodles'], region: Z1, home: 'landmark:pops-noodle-cart', lore: 'lore:hc-tobiah-knuckle',
    presentWhen: BW,
    schedule: [{ from: 0, to: 24, at: 'landmark:knuckletown-village-ring', activity: 'idle', when: at('quest:brawler-the-bell-in-round-three', 'pops') }],
    dialogue: [
      { when: at('quest:brawler-the-bell-in-round-three', 'pops'), dialogue: 'dialogue:brawler-pops-bell' },
      { when: at('quest:brawler-the-bell-in-round-three', 'stock'), dialogue: 'dialogue:brawler-pops-midnight' },
      { when: at('quest:brawler-sold-by-the-head', 'pops'), dialogue: 'dialogue:brawler-pops-silas' },
      { when: at('quest:brawler-noodles-and-debts', 'pops'), dialogue: 'dialogue:brawler-pops-doors' },
      { when: at('quest:brawler-the-promoters-offer', 'pops'), dialogue: 'dialogue:brawler-pops-offer' },
      { when: at('quest:brawler-whose-purse', 'vote'), dialogue: 'dialogue:brawler-whose-purse' },
      { when: at('quest:brawler-in-your-corner', 'cart'), dialogue: 'dialogue:brawler-pops-corner' },
      { when: at('quest:brawler-the-towel', 'noodles'), dialogue: 'dialogue:brawler-pops-towel' },
      { when: at('quest:brawler-the-last-herb', 'pops'), dialogue: 'dialogue:brawler-pops-herb' },
      { when: at('quest:brawler-names-on-the-wall', 'pops'), dialogue: 'dialogue:brawler-pops-names' },
      { dialogue: 'dialogue:brawler-pops' },
    ],
    barks: [{ lines: ['Hands up. Chin down. Get up every time.', 'Number nine’s the beef. Don’t ask about eleven.', 'Getting up. That’s the whole sport.'] }],
    roles: ['quest', 'trainer'], essential: true,
    look: { skin: 0xc8946e, hair: 0xd0d0c8, cloth: 0x8a3a2a, accent: 0xe8e4dc, build: 'short' },
    bio: 'A retired champion of the Lowfold who runs a cornerman’s stall and a noodle cart in Knuckletown. He has agreed to corner the hero for a bowl of noodles a week, and has a reputation for meanness he works very hard to keep. In C. 1009 he knocked down Doran Kell.',
  },
  {
    id: 'npc:silas-gaunt', name: 'Silas Gaunt', title: 'the Promoter', school: 'fist', origin: 'fist', trust: 2,
    region: Z2, home: 'landmark:grand-pit-gate', lore: 'lore:hc-silas-gaunt',
    // Act I in the Pits; Act III, beaten on the stair top in the Chimera's chest, waiting for his fate (reopenable)
    presentWhen: { all: [BW, { any: [{ all: [{ questCompleted: 'quest:brawler-the-broken-fist-dojo' }, { not: { flag: 'brawler.halfstone' } }] }, at('quest:brawler-the-promoters-corner', 'fate')] }] },
    schedule: [
      { from: 0, to: 24, at: 'landmark:twelve-stairs-top', activity: 'idle', when: at('quest:brawler-the-promoters-corner', 'fate') },
      { from: 0, to: 24, at: 'landmark:quarry-tunnel', activity: 'work', when: at('quest:brawler-sold-by-the-head', 'silas') },
    ],
    dialogue: [
      { when: at('quest:brawler-the-promoters-corner', 'fate'), dialogue: 'dialogue:brawler-herald-fate' },
      { when: at('quest:brawler-the-promoters-offer', 'silas'), dialogue: 'dialogue:brawler-silas-offer' },
      { when: at('quest:brawler-sold-by-the-head', 'silas'), dialogue: 'dialogue:brawler-silas-tunnel' },
      { dialogue: 'dialogue:brawler-silas' },
    ],
    barks: [{ lines: ['Nobody fights for free. Not while I’m around.', 'You need a nickname. Something will come to me.', 'Everybody watches. Nobody pays. Except me.'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xe0c0a0, hair: 0x2a2a2a, cloth: 0x2a1a3a, accent: 0xc84a8a, build: 'slight' },
    bio: 'The Promoter of the outlaw pits: thin, silk-scarfed, generous, with very kind eyes and a small scar under the right one. He pays for everything, writes every name down, and sells beaten fighters to the Hollow Legion by the head.',
  },
  {
    id: 'npc:abigail-tuck', name: 'Honest Abigail Tuck', title: 'Bookie of Knuckletown', school: 'fist', origin: 'fist', trust: 2,
    region: Z1, home: 'landmark:abigail-book-stall', presentWhen: BW,
    dialogue: [
      { when: at('quest:brawler-whose-purse', 'canvass'), dialogue: 'dialogue:brawler-abigail-canvass' },
      { dialogue: 'dialogue:brawler-abigail' },
    ],
    barks: [{ lines: ['Never once against a local fighter. Ridiculous way to run a book.', 'To the copper, love. To the copper.'] }],
    roles: ['quest'],
    look: { skin: 0xd8a888, hair: 0x8a6a4a, cloth: 0x3a5a3a, accent: 0xd9a066, build: 'average' },
    bio: 'The only bookie in the Lowfold who has never taken a bet against a local fighter, and who pays out exactly to the copper. Silas’s runners are pushing her out of the Pits.',
  },
  {
    id: 'npc:peony-crouch', name: 'Mrs Peony Crouch', title: 'of the Bunting Committee', school: 'fist', origin: 'fist', trust: 1,
    region: Z1, home: 'landmark:knuckletown-bunting-row', presentWhen: BW,
    dialogue: [{ dialogue: 'dialogue:brawler-peony' }],
    barks: [{ lines: ['Red, yellow, red, yellow. Never two yellows.', 'My sister Violet is checking. My sister Iris is checking Violet.'] }],
    roles: ['quest'],
    look: { skin: 0xe8c8b0, hair: 0xe8e4dc, cloth: 0x6a3a5a, accent: 0xffd36a, build: 'short' },
    bio: 'Chair of Knuckletown’s Bunting Committee, which consists of her and two sisters who watch from their windows.',
  },
  {
    id: 'npc:bess-plummet', name: 'League Steward Bess Plummet', title: 'of the Pit Leagues', school: 'fist', origin: 'fist', trust: 1,
    region: Z1, home: 'landmark:league-bounty-board', presentWhen: BW,
    schedule: [{ from: 0, to: 24, at: 'landmark:pops-noodle-cart', activity: 'idle', when: at('quest:brawler-whose-purse', 'vote') }],
    dialogue: [{ dialogue: 'dialogue:brawler-bess' }],
    barks: [{ lines: ['League coin. It’s dry. I check.', 'Bounties on the League board.'] }],
    roles: ['quest'],
    look: { skin: 0xd0a080, hair: 0x3a2a20, cloth: 0x2a3a6a, accent: 0xd9a066, build: 'average' },
    bio: 'A steward of the Pit Leagues, in a blazer, with a clipboard. She keeps the League bounty board and checks that the League’s coin is dry.',
  },
  {
    id: 'npc:saffie-lint', name: 'Doc Saffie Lint', title: 'Cutwoman of the Lowfold Pits', school: 'fist', origin: 'fist', trust: 2,
    region: Z2, home: 'landmark:doc-lint-tent', presentWhen: BW,
    dialogue: [
      { when: at('quest:brawler-whose-purse', 'canvass'), dialogue: 'dialogue:brawler-doc-canvass' },
      { dialogue: 'dialogue:brawler-doc' },
    ],
    barks: [{ lines: ['Nobody bleeds in my corner for longer than they have to.', 'Sit. Tilt your head. Don’t whimper. Good.'] }],
    roles: ['quest'],
    look: { skin: 0xc89070, hair: 0x6a4a2a, cloth: 0xe8e4dc, accent: 0xb5481f, build: 'slight' },
    bio: 'The best cutwoman in the Lowfold, who has stitched every face in the Pits at some point, including, once, a sixteen-year-old called Silas.',
  },
  {
    id: 'npc:tilly', name: 'Tin-Can Tilly', title: 'aged twelve, would-be fighter', school: 'fist', origin: 'fist', trust: 3,
    region: Z2, home: 'landmark:lowfold-practice-ring', presentWhen: BW,
    dialogue: [{ dialogue: 'dialogue:brawler-tilly' }],
    barks: [{ lines: ['I’ve got cans!', 'Pops says no. Pops says no to everything.'] }],
    roles: ['quest'],
    look: { skin: 0xe8c4a8, hair: 0xb8402a, cloth: 0x5a5a6a, accent: 0xc8c8c8, build: 'slight' },
    bio: 'A twelve-year-old who shadow-boxes the practice-ring posts with tin cans tied to her fists and wants to fight in the Grand Pit more than anything in the world.',
  },
  {
    id: 'npc:nob-furze', name: 'Old Nob Furze', title: 'goat-smuggler, retired, mostly', school: 'fist', origin: 'fist', trust: 2,
    region: Z3, home: 'landmark:nob-goat-shed', presentWhen: BW,
    dialogue: [{ dialogue: 'dialogue:brawler-nob' }],
    barks: [{ lines: ['They kick. Gently does it.', 'Every path between every valley. Or they did.'] }],
    roles: ['quest'],
    look: { skin: 0xb07a5a, hair: 0xd0d0c8, cloth: 0x6a5a3a, accent: 0x8a8a8a, build: 'short' },
    bio: 'An old goat-smuggler of the Goat Paths, whose goats know every road between the valleys, or did until they went hollow.',
  },
  {
    id: 'npc:gert-haddow', name: 'Gert Haddow', title: 'Champion of Lowfold Under', school: 'fist', origin: 'fist', trust: 1,
    region: Z3, home: 'landmark:goat-path-shelter', presentWhen: BW,
    dialogue: [{ dialogue: 'dialogue:brawler-gert' }],
    barks: [{ lines: ['I am NOT sharing a coat with Rufus Thrush.', 'Eleven years. Eleven years he’s owed me a rematch.'] }],
    roles: ['quest'],
    look: { skin: 0xd8a888, hair: 0xe8c86a, cloth: 0x6a3a2a, accent: 0x8a8a8a, build: 'broad' },
    bio: 'Village champion of Lowfold Under, who has hated Rufus Thrush of Lowfold Over for eleven years over a bout at the Harvest Ring.',
  },
  {
    id: 'npc:mouse-mallory', name: 'Mouse Mallory', title: 'undercard fighter of the Quarry Rings', school: 'fist', origin: 'fist', trust: 1,
    region: Z4, home: 'landmark:quarry-undercard-ring', presentWhen: BW,
    dialogue: [{ dialogue: 'dialogue:brawler-mouse' }],
    barks: [{ lines: ['Always the undercard.', 'Fight by ear. The big ones breathe like bellows.'] }],
    roles: ['quest'],
    look: { skin: 0xc8a080, hair: 0x3a2a20, cloth: 0x3a3a3a, accent: 0xb5481f, build: 'slight' },
    bio: 'A small, quick undercard fighter in the outlaw rings, who has fought in the dark for years for a purse that never reaches the fighters.',
  },
  // ---------- Act II (Concordia)
  {
    id: 'npc:moll-treadwell', name: 'Moll Treadwell', title: 'of the cellar ring under the Briar & Kettle', school: 'fist', origin: 'fist', trust: 2,
    region: 'region:briar', home: 'landmark:thorn-briar-kettle', lore: 'lore:hc-fist-cellar-ring',
    presentWhen: { flag: 'story.act', op: '>=', value: 2 },
    // Brawler C-1: escorted to the edge of the bog, where she stays to watch the slimes spar
    schedule: [{ from: 0, to: 24, at: 'landmark:brawler-bog-edge', activity: 'idle', when: at('quest:brawler-the-cellar-ring', 'hear') }],
    dialogue: [
      { when: at('quest:brawler-the-cellar-ring', 'hear'), dialogue: 'dialogue:brawler-moll-bog' },
      { when: at('quest:brawler-the-ooze-sovereign', 'tell'), dialogue: 'dialogue:brawler-moll-abbot' },
      { when: at('quest:brawler-the-cellar-ring', 'cellar'), dialogue: 'dialogue:brawler-moll' },
      { dialogue: 'dialogue:fist-moll' },
    ],
    barks: [{ lines: ['Saturdays. Gloves on, grudges off.', 'It fights like a monk. Which is cheating.'] }],
    roles: ['quest'],
    look: { skin: 0xd8a888, hair: 0x8a2a1a, cloth: 0x5a3a2a, accent: 0xd9a066, build: 'broad' },
    bio: 'Leader of the Lowfold fighters who came through for an exhibition bout in C. 1012 and were stranded when the arches shut. She runs a Saturday ring in the cellar under Thornhollow’s Briar & Kettle.',
  },
  {
    id: 'npc:abigail-tuck-kilnmouth', name: 'Honest Abigail Tuck', title: 'of the Kilnmouth ash-pits', school: 'fist', origin: 'fist', trust: 3,
    region: 'region:ash', home: 'landmark:kiln-ore-market',
    presentWhen: { all: [BW, { flag: 'brawler.abigail_book' }, { flag: 'story.act', op: '>=', value: 2 }] },
    dialogue: [{ dialogue: 'dialogue:brawler-abigail-kilnmouth' }],
    barks: [{ lines: ['First honest book in Concordia!'] }],
    roles: ['ambient'],
    look: { skin: 0xd8a888, hair: 0x8a6a4a, cloth: 0x3a5a3a, accent: 0xd9a066, build: 'average' },
    bio: 'Honest Abigail came through the Stair Gate after you, and now runs the betting at Kilnmouth’s ash-pits, to the copper.',
  },
  {
    id: 'npc:tilly-concordia', name: 'Tin-Can Tilly', title: 'who was not supposed to come', school: 'fist', origin: 'fist', trust: 3,
    region: 'region:alder', home: 'landmark:gate-circle',
    presentWhen: { all: [BW, { any: [{ questActive: 'quest:brawler-a-menu-with-a-message' }, { questActive: 'quest:brawler-pops-stock' }] }] },
    // Act III: she came through again, with Pops's stock-pot on a cart
    schedule: [{ from: 0, to: 24, at: 'landmark:heart-camp', activity: 'idle', when: { questActive: 'quest:brawler-pops-stock' } }],
    dialogue: [
      { when: { questActive: 'quest:brawler-pops-stock' }, dialogue: 'dialogue:brawler-tilly-heart' },
      { when: at('quest:brawler-a-menu-with-a-message', 'reply'), dialogue: 'dialogue:brawler-tilly-reply' },
      { dialogue: 'dialogue:brawler-tilly-menu' },
    ],
    barks: [{ lines: ['I wasn’t supposed to come. I came.'] }],
    roles: ['quest'],
    look: { skin: 0xe8c4a8, hair: 0xb8402a, cloth: 0x5a5a6a, accent: 0xc8c8c8, build: 'slight' },
    bio: 'Tilly came all the way through the Stair Gate with a noodle menu from Pops, against everyone’s instructions including Pops’s.',
  },
  // ---------- Act III (the Heart)
  {
    id: 'npc:big-mother-ox', name: 'Big Mother Ox', title: 'Champion of the Grand Pit', school: 'fist', origin: 'fist', trust: 2,
    region: 'region:heart', home: 'landmark:twelve-stairs-top',
    presentWhen: { all: [BW, { questActive: 'quest:brawler-big-mother-ox-comes-through' }] },
    dialogue: [{ dialogue: 'dialogue:brawler-ox-heart' }],
    barks: [{ lines: ['Concordia. Hm.', '(She has her arms folded. The Fist stair seems smaller with her on it.)'] }],
    roles: ['quest'],
    look: { skin: 0xb07a5a, hair: 0x2a1a14, cloth: 0x8a3a2a, accent: 0xd9a066, build: 'broad' },
    bio: 'Champion of the Grand Pit, unbeaten for nineteen years until the night somebody caught her. She has walked through the Stair Gate to stand on the Fist stair at the Heart, and is not impressed by anything she has seen on the way.',
  },
];

export default npcs;
