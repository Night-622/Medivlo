/**
 * Hollow Crown: the HUNTSMAN campaign (docs/lore/hollow-crown/06-outlines/hunt.md). Act I in Antlerford
 * (area:hunt-capital) and the Act II class thread in Concordia. Act III class quests land with the Heart. Owner: Claude 4.
 */
import type { NarrativeCondition, QuestDef } from '@/core';

const HS: NarrativeCondition = { heroClass: 'huntsman' };
const done = (q: `quest:${string}`): NarrativeCondition => ({ questCompleted: q });
const req = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: [HS, ...c] });
const A1 = { act: 'act1' as const, campaign: 'huntsman', chapter: 'Antlerford' };
const A2 = { act: 'act2' as const, campaign: 'huntsman', chapter: 'Concordia' };
const A3 = { act: 'act3' as const, campaign: 'huntsman', chapter: 'The Heart' };
const Z1 = 'zone:hunt-capital-1' as const, Z2 = 'zone:hunt-capital-2' as const, Z3 = 'zone:hunt-capital-3' as const, Z4 = 'zone:hunt-capital-4' as const;
const L1 = 'inst:hunt-capital-lair-1' as const, L2 = 'inst:hunt-capital-lair-2' as const, L3 = 'inst:hunt-capital-lair-3' as const;
const BN = 'npc:ulric-bannock' as const, CO = 'npc:corva-ashby' as const;

const quests: QuestDef[] = [
  // ======================= ACT I: main (I-1 … I-10)
  {
    ...A1, id: 'quest:huntsman-the-bell-in-the-antlers', name: 'The Bell in the Antlers', type: 'main', region: Z1, giver: BN,
    summary: 'You were on smokehouse watch in the Lodge Yards when a bell rang somewhere far away, and every antler on every wall in Antlerford hummed the same note.',
    requires: HS, autoStart: true, firstStage: 'watch',
    stages: [
      {
        id: 'watch', journal: 'The kennels are howling and the antlers are humming. Something in your chest is humming with them, and it wants you to walk towards the Trophy Hall.',
        onEnter: [{ openDialogue: 'dialogue:huntsman-bell-night' }],
        objectives: [{ id: 'hall', text: 'Follow the song to the Trophy Hall', reach: 'landmark:trophy-hall-gates', marker: { landmark: 'landmark:trophy-hall-gates' } }],
        next: 'bannock',
      },
      {
        id: 'bannock', journal: 'The Trophy Hall’s gates are locked. A very large man with a very old dog is standing behind you, not saying anything.',
        objectives: [{ id: 'bannock', text: 'Talk to the big man at the Trophy Hall gates', talk: BN, marker: { landmark: 'landmark:trophy-hall-gates' } }],
        onComplete: [{ setFlag: 'huntsman.bell_heard', value: true }],
        next: 'home',
      },
      {
        id: 'home', journal: 'Master Bannock is walking you home through the Lodge Yards without asking a single question. Biscuit is walking on your feet.',
        objectives: [{ id: 'hearth', text: 'Walk back through the Lodge Yards to Bannock’s hearth', reach: 'landmark:bannock-hearth', marker: { landmark: 'landmark:bannock-hearth' } }],
        next: 'hearth',
      },
      {
        id: 'hearth', journal: 'A low room, a big fire and a kettle that has been on since the Concord. Bannock is looking at your chest, where the humming is, and pretending not to.',
        objectives: [{ id: 'bannock', text: 'Sit by Bannock’s hearth', talk: BN, marker: { landmark: 'landmark:bannock-hearth' } }],
        onComplete: [{ startQuest: 'quest:huntsman-count-the-herd' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-greywilds', 'lore:hc-great-lodge'] },
  },
  {
    ...A1, id: 'quest:huntsman-count-the-herd', name: 'Count the Herd', type: 'main', region: Z3, giver: BN,
    summary: 'Every autumn for a thousand years the Lodge has walked the Elkway and counted the herd. Bannock wants you with him this year, and he will not say why.',
    requires: req(done('quest:huntsman-the-bell-in-the-antlers')), firstStage: 'stone',
    stages: [
      {
        id: 'stone', journal: 'The count starts at the Lodge’s tally stone on the Elkway, where the herd has crossed every autumn since before the Concord.',
        objectives: [{ id: 'stone', text: 'Walk the Elkway to the tally stone', reach: 'landmark:elkway-tally-stone', marker: { landmark: 'landmark:elkway-tally-stone' } }],
        onComplete: [{ openDialogue: 'dialogue:huntsman-tally-stone' }],
        next: 'elk',
      },
      {
        id: 'elk', journal: 'There is no herd. There are Great Elk standing among the trees, quite still, with black tears in their eyes. They charge when you look away.',
        objectives: [{ id: 'elk', text: 'Drive off the hollowed Great Elk', kill: 'bx_hunt_0', count: 4, marker: { place: Z3 } }],
        next: 'tracks',
      },
      {
        id: 'tracks', journal: 'Bannock wants to know where the elk came from before he writes anything down. Their tracks are still fresh in the leaf-mould.',
        objectives: [{ id: 'tracks', text: 'Read the elk’s tracks back into the trees', interact: 'obj:huntsman-elk-track-*', count: 3, marker: { place: Z3 } }],
        next: 'report',
      },
      {
        id: 'report', journal: 'Bannock wrote a number in the tally book, and then he crossed it out.',
        objectives: [{ id: 'bannock', text: 'Talk to Bannock at his hearth', talk: BN, marker: { landmark: 'landmark:bannock-hearth' } }],
        onComplete: [{ startQuest: 'quest:huntsman-the-poachers-camp' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40, lore: ['lore:hc-elkway'] },
  },
  {
    ...A1, id: 'quest:huntsman-the-poachers-camp', name: 'The Poachers’ Camp', type: 'main', region: Z4, giver: BN,
    summary: 'Somebody has strung snares right across the Elkway, and whatever they catch comes out weeping. The Lodge says the Poacher Chief is selling the pelts in the Tannery Lanes.',
    requires: req(done('quest:huntsman-count-the-herd')), firstStage: 'snares',
    stages: [
      {
        id: 'snares', journal: 'Three snare-lines across the herd road, strung at the height of a calf’s neck. Cut them before anything else walks into them.',
        objectives: [{ id: 'snares', text: 'Cut the snares across the Elkway', interact: 'obj:elkway-snare-*', count: 3, marker: { place: Z3 } }],
        next: 'camp',
      },
      {
        id: 'camp', journal: 'The snare-cord is Old Snares hemp, and the trail of it leads to a stockade in the deep forest.',
        objectives: [{ id: 'camp', text: 'Find the Poachers’ Camp', reach: L1, marker: { landmark: 'landmark:poachers-camp-stockade' } }],
        next: 'chief',
      },
      {
        id: 'chief', journal: 'The camp is strung with lines he can trigger from his hides. Cut them, and flush him out.',
        objectives: [{ id: 'chief', text: 'Defeat the Poacher Chief', kill: 'bx_hunt_4', count: 1 }],
        next: 'pelts',
      },
      {
        id: 'pelts', journal: 'His store-shed is stacked to the roof with pelts, every one of them damp with black.',
        objectives: [{ id: 'pelts', text: 'Search the Poacher Chief’s pelt store', interact: 'obj:poacher-pelt-store' }],
        next: 'report',
      },
      {
        id: 'report', journal: 'The pelts were bought in advance and paid for in gold. Somebody in Antlerford is buying every tear-stained hide in the Greywilds.',
        objectives: [{ id: 'bannock', text: 'Report to Bannock', talk: BN, marker: { landmark: 'landmark:bannock-hearth' } }],
        onComplete: [{ setFlag: 'huntsman.snares_cut', value: true }, { startQuest: 'quest:huntsman-the-barons-bonfire' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 80, hcItems: [{ item: 'i_hide', qty: 3 }] },
  },
  {
    ...A1, id: 'quest:huntsman-the-barons-bonfire', name: 'The Baron’s Bonfire', type: 'main', region: Z2, giver: CO,
    summary: 'Lady Corva Ashby, the richest Trophy Baron in the Greywilds, is buying every tear-stained pelt in the Tannery Lanes and burning them in the street.',
    requires: req(done('quest:huntsman-the-poachers-camp')), firstStage: 'fire',
    stages: [
      {
        id: 'fire', journal: 'There is a bonfire outside Lusk’s tannery, and the whole of the Tannery Lanes has come out to watch a Baron burn her own money.',
        objectives: [{ id: 'corva', text: 'Meet Lady Corva Ashby at the bonfire', talk: CO, marker: { landmark: 'landmark:lusk-tannery' } }],
        next: 'hide',
      },
      {
        id: 'hide', journal: 'Lady Corva has ridden out to her hide on the Elkway, and asked you to come and watch her hunt before you decide anything.',
        objectives: [{ id: 'hide', text: 'Ride out to Lady Corva’s hide on the Elkway', reach: 'landmark:huntsman-baron-hide', marker: { landmark: 'landmark:huntsman-baron-hide' } }],
        next: 'shot',
      },
      {
        id: 'shot', journal: 'A platform in an oak, swept clean, with a cushion on it. Corva is already up there, with her crossbow across her knees.',
        objectives: [{ id: 'corva', text: 'Watch Lady Corva hunt', talk: CO, marker: { landmark: 'landmark:huntsman-baron-hide' } }],
        next: 'bannock',
      },
      {
        id: 'bannock', journal: 'She has paid the Lodge’s debts in full, every one, and she has asked for you by name.',
        objectives: [{ id: 'bannock', text: 'Tell Bannock what the Baron wants', talk: BN, marker: { landmark: 'landmark:bannock-hearth' } }],
        onComplete: [{ setFlag: 'huntsman.corva_met', value: true }, { startQuest: 'quest:huntsman-the-old-law' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-trophy-barons'] },
  },
  {
    ...A1, id: 'quest:huntsman-the-old-law', name: 'The Old Law', type: 'main', region: Z1, giver: BN,
    summary: 'The Trophy Barons have offered to buy the Lodge’s charter: the old law of the chase, which says what may be hunted, and when. The Lodge meets tonight to decide.',
    requires: req(done('quest:huntsman-the-barons-bonfire')), firstStage: 'canvass',
    stages: [
      {
        id: 'canvass', journal: 'Bannock said: before you speak, find out what the charter is worth to the people who have to live under it. The kennels eat on the Lodge’s money. The Tannery Lanes eat on the Barons’.',
        objectives: [
          { id: 'jem', text: 'Ask Jem Furlong what the charter means to the kennels', talk: 'npc:jem-furlong', marker: { landmark: 'landmark:antlerford-kennels' } },
          { id: 'lusk', text: 'Ask Griselda Lusk what the charter means to the Tannery Lanes', talk: 'npc:griselda-lusk', marker: { landmark: 'landmark:lusk-tannery' } },
        ],
        next: 'vote',
      },
      {
        id: 'vote', journal: 'The whole Lodge is gathering in the Great Lodge hall, under the charter in its case. You have a voice, because you have a half-stone singing in you, and everyone has noticed.',
        objectives: [{ id: 'vote', text: 'Speak at the Great Lodge', when: { flag: 'huntsman.charter' }, marker: { landmark: 'landmark:great-lodge-hall' } }],
        next: [
          { when: { flag: 'huntsman.charter', value: 'road' }, to: 'cairns' },
          { to: 'after' },
        ],
      },
      {
        id: 'cairns', journal: 'The whole Lodge has gone out onto the Elkway with torches, to put back every cairn the Barons pulled down.',
        objectives: [{ id: 'cairns', text: 'Rebuild the antler-cairns on the Elkway, by torchlight', interact: 'obj:elkway-cairn-*', count: 6, marker: { place: Z3 } }],
        next: 'after',
      },
      {
        id: 'after', journal: 'Whatever the Lodge decided, the sick animals of the Elkway are on the move tonight.',
        objectives: [],
        onComplete: [{ startQuest: 'quest:huntsman-the-swollen-queen' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-old-law'] },
  },
  {
    ...A1, id: 'quest:huntsman-the-swollen-queen', name: 'The Swollen Queen', type: 'main', region: Z4, giver: BN,
    summary: 'The Elkway’s sick animals are fleeing into the Tick Hollows. Something there is waiting for them, fat on hollow blood.',
    requires: req(done('quest:huntsman-the-old-law')), firstStage: 'trail',
    stages: [
      {
        id: 'trail', journal: 'Whatever drove them, the sick animals of the Elkway all ran the same way in the night. Follow the signs of their flight south, towards the Tick Hollows.',
        objectives: [{ id: 'signs', text: 'Follow the signs of the herd’s flight', interact: 'obj:huntsman-flight-sign-*', count: 3, marker: { place: Z4 } }],
        next: 'hollows',
      },
      {
        id: 'hollows', journal: 'Follow the herd’s tracks down into the Tick Hollows, where the ground is soft and the trees are full of ticks.',
        objectives: [{ id: 'enter', text: 'Go down into the Tick Hollows', reach: L2, marker: { landmark: 'landmark:tick-hollows-mouth' } }],
        onComplete: [{ openDialogue: 'dialogue:huntsman-tick-hollows' }],
        next: 'queen',
      },
      {
        id: 'queen', journal: 'The Swollen Queen is the size of a hill. Shoot the sacs on her back before she latches on.',
        objectives: [{ id: 'queen', text: 'Defeat the Swollen Queen', kill: 'cb_swollen-queen', count: 1 }],
        next: 'tags',
      },
      {
        id: 'tags', journal: 'She deflated with a long, rude noise. Under her, in the mud, there are brass tags. Dozens of them.',
        objectives: [{ id: 'tags', text: 'Look at the brass tags in the mud', interact: 'obj:hunting-party-tags' }],
        onComplete: [{ setFlag: 'huntsman.hollows_clear', value: true }, { startQuest: 'quest:huntsman-the-empty-wall' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 120 },
  },
  {
    ...A1, id: 'quest:huntsman-the-empty-wall', name: 'The Empty Wall', type: 'main', region: Z2, giver: BN,
    summary: 'The tags in the Tick Hollows came off the collars of Lady Corva’s hunting parties. She has been driving the hollow herd in there on purpose.',
    requires: req(done('quest:huntsman-the-swollen-queen')), firstStage: 'bannock',
    stages: [
      {
        id: 'bannock', journal: 'Bannock will know whose tags these are. He knows every hunting party in the Greywilds.',
        objectives: [{ id: 'bannock', text: 'Show Bannock the tags', talk: BN, marker: { landmark: 'landmark:bannock-hearth' } }],
        next: 'book',
      },
      {
        id: 'book', journal: 'Every kill a Baron’s party makes goes into its gamekeeper’s game book. Corva’s gamekeeper is Quentin Snipe, out at his lodge on the Elkway, and he is an honest man.',
        objectives: [{ id: 'book', text: 'Read Corva’s game book at the gamekeeper’s lodge', interact: 'obj:huntsman-game-book', marker: { landmark: 'landmark:gamekeepers-lodge' } }],
        next: 'corva',
      },
      {
        id: 'corva', journal: 'Corva is at the Trophy Hall, supervising the hanging of a very large, very empty bracket on the end wall.',
        objectives: [{ id: 'corva', text: 'Confront Lady Corva at the Trophy Hall', talk: CO, marker: { landmark: 'landmark:trophy-hall-gates' } }],
        onComplete: [{ setFlag: 'huntsman.corva_turned', value: true }, { startQuest: 'quest:huntsman-the-trophy-hall' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-great-hunt'] },
  },
  {
    ...A1, id: 'quest:huntsman-the-trophy-hall', name: 'The Trophy Hall', type: 'main', region: L3, giver: BN,
    summary: 'The Lodge half of the Hunt stone has been set in a stag’s brow in Corva’s Trophy Hall for thirty years. She means to use its song to bring the Great Hunt under her roof.',
    requires: req(done('quest:huntsman-the-empty-wall')), firstStage: 'enter',
    stages: [
      {
        id: 'enter', journal: 'The Trophy Hall gates are open tonight. Every lamp inside is lit, and every glass eye is turned to the door.',
        objectives: [{ id: 'enter', text: 'Enter the Trophy Hall', reach: L3, marker: { landmark: 'landmark:trophy-hall-gates' } }],
        next: 'corva',
      },
      {
        id: 'corva', journal: 'She reloads behind the trophy glass. Shoot out the hooks, and let her own heads fall on her.',
        objectives: [{ id: 'corva', text: 'Defeat Lady Corva Ashby', kill: 'cb_corva-ashby', count: 1 }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'Corva went out through the back on a grey horse, towards the Antler Gate. Above the end wall, a stag’s head with half a crystal in its brow is singing to you.',
        objectives: [{ id: 'stone', text: 'Lift the Lodge half from the stag’s brow', interact: 'obj:hunt-capital-halfstone' }],
        onComplete: [{ setFlag: 'huntsman.halfstone', value: true }, { startQuest: 'quest:huntsman-the-last-count' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, skillPoints: 1, lore: ['lore:hc-half-stones'] },
  },
  {
    ...A1, id: 'quest:huntsman-the-last-count', name: 'The Last Count', type: 'main', region: Z3, giver: BN,
    summary: 'Corva is waiting at the Antler Gate for the Great Hunt to come. Bannock will walk you as far as the gate road, and count what is left on the way.',
    requires: req(done('quest:huntsman-the-trophy-hall')), firstStage: 'count',
    stages: [
      {
        id: 'count', journal: 'Bannock is at the tally stone with the book under his arm and Biscuit at his heel.',
        objectives: [{ id: 'bannock', text: 'Walk the Elkway with Bannock', talk: BN, marker: { landmark: 'landmark:elkway-tally-stone' } }],
        next: 'post',
      },
      {
        id: 'post', journal: 'Halfway up the gate road stands the Counting Post, where the Lodge cut a notch for every hunter who ran the Turning road, and another for every one who came home.',
        objectives: [{ id: 'post', text: 'Stop at the Counting Post on the gate road', interact: 'obj:huntsman-counting-post', marker: { landmark: 'landmark:huntsman-counting-post' } }],
        next: 'road',
      },
      {
        id: 'road', journal: 'The gate road runs north from the end of the Elkway, to the Antler Gate.',
        objectives: [{ id: 'gate', text: 'Take the gate road to the Antler Gate', reach: 'area:hunt-gate', marker: { place: 'area:hunt-gate' } }],
        onComplete: [{ startQuest: 'quest:huntsman-the-antler-gate' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:huntsman-the-antler-gate', name: 'The Antler Gate', type: 'main', region: 'area:hunt-gate', giver: BN,
    summary: 'The Great Hunt is circling the Antler Gate at the head of a hollow herd, and Corva is on the ridge above it with her crossbow loaded.',
    requires: req(done('quest:huntsman-the-last-count')), firstStage: 'hunt',
    stages: [
      {
        id: 'hunt', journal: 'The old law: run it to a standstill, and do not kill it. Keep pace round the gate ring, thin the herd, and stop Corva’s bolts.',
        objectives: [{ id: 'hunt', text: 'Run the Great Hunt to a standstill', kill: 'bx_hunt_5', count: 1 }],
        next: 'tine',
      },
      {
        id: 'tine', journal: 'The black has dripped off its antlers and they are burning gold again. It has lowered its head to you.',
        objectives: [{ id: 'tine', text: 'Go to the Great Hunt', interact: 'obj:great-hunt-tine' }],
        next: 'gate',
      },
      {
        id: 'gate', journal: 'The Great Hunt has gone back up the Elkway. The Antler Gate is weeping black down its carved tines.',
        objectives: [{ id: 'seal', text: 'Open the Antler Gate with the Lodge half', interact: 'obj:hunt-gate-seal' }],
        onComplete: [{ setFlag: 'story.gate_open', value: true }, { setFlag: 'story.act', value: 2 }, { setFlag: 'huntsman.act1_done', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 200, lore: ['lore:hc-realm-gates'] },
  },

  // ======================= ACT I: side quests (2 per zone)
  {
    ...A1, id: 'quest:huntsman-grandfer-lumms-hat', name: 'Grandfer Lumm’s Hat', type: 'side', region: Z1, giver: 'npc:grandfer-lumm',
    summary: 'Grandfer Lumm, the oldest braggart in the Lodge, swears he once caught a boar in his hat. The Lodge has had enough. Prove it, or kindly arrange not to.',
    requires: req(done('quest:huntsman-the-bell-in-the-antlers')), firstStage: 'hat',
    stages: [
      {
        id: 'hat', journal: 'The hat in question hangs in the Lodge loft, in a place of honour that Grandfer Lumm chose himself.',
        objectives: [{ id: 'hat', text: 'Find Grandfer Lumm’s famous hat', interact: 'obj:lumm-hat', marker: { landmark: 'landmark:great-lodge-hall' } }],
        next: 'lumm',
      },
      {
        id: 'lumm', journal: 'The hat is about the size of a pudding basin. There are bristles in the band.',
        objectives: [{ id: 'lumm', text: 'Settle the matter with Grandfer Lumm', when: { flag: 'huntsman.lumm_settled' }, marker: { landmark: 'landmark:great-lodge-hall' } }],
        next: 'tally',
      },
      {
        id: 'tally', journal: 'Grandfer Lumm wants the boar entered in the Lodge tally, officially, in ink, before witnesses. Tallykeeper Ruddock keeps the tally, and Tallykeeper Ruddock counts everything twice.',
        objectives: [{ id: 'ruddock', text: 'Have the boar entered in the Lodge tally', talk: 'npc:hesketh-ruddock', marker: { landmark: 'landmark:lodge-tally-board' } }],
        onComplete: [{ setFlag: 'huntsman.lumm_tallied', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 30 },
  },
  {
    ...A1, id: 'quest:huntsman-hounds-facing-east', name: 'Hounds Facing East', type: 'side', region: Z1, giver: 'npc:jem-furlong',
    summary: 'Since the Bell, the Lodge hounds have refused to hunt. They lie in their runs facing the Antler Gate, and Kennelmaster Jem Furlong is at his wits’ end.',
    requires: req(done('quest:huntsman-the-bell-in-the-antlers')), firstStage: 'walk',
    stages: [
      {
        id: 'walk', journal: 'Walk the pack out along the east road to the old milestone, and see what they are waiting for. Jem says they only stand up after dark.',
        objectives: [{ id: 'walk', text: 'Walk the hounds to the east milestone, at night', when: { flag: 'huntsman.hounds_heard' }, marker: { landmark: 'landmark:lodge-east-milestone' } }],
        next: 'jem',
      },
      {
        id: 'jem', journal: 'At midnight, far off over the forest, a light like a burning tree went past the Antler Gate. Every hound stood up.',
        objectives: [{ id: 'jem', text: 'Tell Jem what the hounds saw', talk: 'npc:jem-furlong', marker: { landmark: 'landmark:antlerford-kennels' } }],
        next: 'lintel',
      },
      {
        id: 'lintel', journal: 'Jem’s grandmother kept the pack at the old kennels, out past the east milestone, before they burned. She had something carved over the door.',
        objectives: [{ id: 'lintel', text: 'Find the carving over the old kennel door', interact: 'obj:huntsman-old-kennel-lintel', marker: { landmark: 'landmark:huntsman-old-kennels' } }],
        onComplete: [{ setFlag: 'huntsman.hounds_run', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_roast' }] },
  },
  {
    ...A1, id: 'quest:huntsman-the-back-room', name: 'The Back Room', type: 'side', region: Z2, giver: 'npc:dabney-flinders',
    summary: 'Tanner Mistress Griselda Lusk sells tear-stained pelts from a back room, and her apprentice says the customers who buy them are going quiet.',
    requires: req(done('quest:huntsman-count-the-herd')), firstStage: 'room',
    stages: [
      {
        id: 'room', journal: 'Dabney has left the back door of Lusk’s tannery on the latch.',
        objectives: [{ id: 'room', text: 'Look in Lusk’s back room', interact: 'obj:lusk-back-room', marker: { landmark: 'landmark:lusk-tannery' } }],
        next: 'lusk',
      },
      {
        id: 'lusk', journal: 'Pelts hung in rows, every one weeping onto the floor. Griselda Lusk is standing in the doorway behind you.',
        objectives: [{ id: 'lusk', text: 'Deal with Griselda Lusk', when: { flag: 'huntsman.back_room' }, marker: { landmark: 'landmark:lusk-tannery' } }],
        next: [
          { when: { flag: 'huntsman.back_room', value: 'followed' }, to: 'cart' },
          { to: 'harle' },
        ],
      },
      {
        id: 'cart', journal: 'The pelts come in on a cart before dawn, down the old track from the Old Snares.',
        objectives: [{ id: 'cart', text: 'Follow the pelt cart’s tracks', interact: 'obj:pelt-cart-tracks', marker: { place: Z4 } }],
        next: 'harle',
      },
      {
        id: 'harle', journal: 'Shutting the back room will not help the people who already bought from it. Old Mister Harle bought a winter coat there a month ago, and has not said a word since.',
        objectives: [{ id: 'harle', text: 'Call on old Mister Harle', interact: 'obj:huntsman-harle-door', marker: { landmark: 'landmark:huntsman-harle-cottage' } }],
        next: 'dabney',
      },
      {
        id: 'dabney', journal: 'The back room is dealt with, one way or another.',
        objectives: [{ id: 'dabney', text: 'Tell Dabney', talk: 'npc:dabney-flinders', marker: { landmark: 'landmark:lusk-tannery' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 60 },
  },
  {
    ...A1, id: 'quest:huntsman-gloves-for-a-giant', name: 'Gloves for a Giant', type: 'side', region: Z2, giver: 'npc:aldith-pockle',
    summary: 'No glover in Antlerford has ever fitted Ulric Bannock, because he is too shy to be measured. Mistress Pockle wants to make him feast gloves before she dies, and she is eighty-one.',
    requires: req(done('quest:huntsman-the-barons-bonfire')), firstStage: 'measure',
    stages: [
      {
        id: 'measure', journal: 'Get Bannock’s hand measured. By any means.',
        objectives: [{ id: 'measure', text: 'Get a measurement out of Bannock', when: { flag: 'huntsman.bannock_measured' }, marker: { landmark: 'landmark:bannock-hearth' } }],
        next: 'pockle',
      },
      {
        id: 'pockle', journal: 'You have the measurement. It is larger than you expected, and you expected large.',
        objectives: [{ id: 'pockle', text: 'Bring the measurement to Mistress Pockle', talk: 'npc:aldith-pockle', marker: { landmark: 'landmark:pockle-glovers' } }],
        onComplete: [{ setFlag: 'huntsman.feast_gloves', value: true }],
        next: 'fitting',
      },
      {
        id: 'fitting', journal: 'Mistress Pockle sewed the feast gloves while you watched, without once looking at her hands. You are to take them to Bannock and see that he puts them on.',
        objectives: [{ id: 'bannock', text: 'Take the feast gloves to Bannock', talk: BN, marker: { landmark: 'landmark:bannock-hearth' } }],
        onComplete: [{ setFlag: 'huntsman.bannock_fitting', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'a_hunt_leather_hands' }] },
  },
  {
    ...A1, id: 'quest:huntsman-the-gamekeepers-notice', name: 'The Gamekeeper’s Notice', type: 'side', region: Z3, giver: 'npc:quentin-snipe',
    summary: 'Corva Ashby’s gamekeeper, Quentin Snipe, has written out his notice nine times and cannot bring himself to hand it to her.',
    requires: req(done('quest:huntsman-the-barons-bonfire')), firstStage: 'corva',
    stages: [
      {
        id: 'corva', journal: 'One letter, folded very small, for Lady Corva Ashby. Quentin says she reads everything twice.',
        completeWhen: 'any',
        objectives: [
          { id: 'corva', text: 'Deliver Quentin’s notice to Lady Corva', talk: CO, marker: { landmark: 'landmark:trophy-hall-gates' } },
          // she rides for the gate at I-8; after that the notice is simply left for her
          { id: 'gone', text: 'Leave the notice in her empty Trophy Hall', hidden: true, when: { flag: 'huntsman.halfstone' } },
        ],
        next: 'snipe',
      },
      {
        id: 'snipe', journal: 'Quentin’s notice is delivered: into Lady Corva’s hands, or onto the table of her empty Hall.',
        objectives: [{ id: 'snipe', text: 'Tell Quentin it is done', talk: 'npc:quentin-snipe', marker: { landmark: 'landmark:gamekeepers-lodge' } }],
        onComplete: [{ setFlag: 'huntsman.snipe_free', value: true }],
        next: 'basket',
      },
      {
        id: 'basket', journal: 'Quentin has packed Lady Corva one last basket, the way he has before every hunt for twenty years. He wants it left at her hide on the Elkway, and he cannot bring himself to take it.',
        objectives: [{ id: 'basket', text: 'Leave Quentin’s basket at Lady Corva’s hide', interact: 'obj:huntsman-snipe-basket', marker: { landmark: 'landmark:huntsman-baron-hide' } }],
        onComplete: [{ setFlag: 'huntsman.snipe_basket', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50 },
  },
  {
    ...A1, id: 'quest:huntsman-the-last-calf', name: 'The Last Calf', type: 'side', region: Z3, giver: 'npc:quentin-snipe',
    summary: 'There is a newborn elk calf on the Elkway, alone and without a single black tear. Quentin daren’t go near it. The old law says you may lead a calf home, but never touch it.',
    requires: req(done('quest:huntsman-count-the-herd')), firstStage: 'calf',
    stages: [
      {
        id: 'calf', journal: 'Quentin saw it last in the bracken below the tally stone.',
        objectives: [{ id: 'calf', text: 'Find the calf', interact: 'obj:elkway-calf', marker: { place: Z3 } }],
        next: 'lead',
      },
      {
        id: 'lead', journal: 'It follows you if you walk slowly and look the other way. Lead it to cover, one thicket at a time, and do not touch it once.',
        objectives: [{ id: 'cover', text: 'Lead the calf to cover', interact: 'obj:calf-cover-*', count: 3, marker: { place: Z3 } }],
        next: 'night',
      },
      {
        id: 'night', journal: 'Something answered the calf from the north. Whatever it is, it will come to the thicket after dark. Be there, and keep still.',
        objectives: [{ id: 'watch', text: 'Watch over the calf’s thicket, at night', when: { flag: 'huntsman.calf_watched' }, marker: { place: Z3 } }],
        onComplete: [{ setFlag: 'huntsman.calf_home', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:huntsman-unstringing', name: 'Unstringing', type: 'side', region: Z4, giver: 'npc:hedda-crake',
    summary: 'Hedda Crake, the charcoal-burner of the Old Snares, wants the old poachers’ lines cut before something else walks into them. Each of the three still holds something.',
    requires: req(done('quest:huntsman-the-poachers-camp')), firstStage: 'snares',
    stages: [
      {
        id: 'snares', journal: 'Three snares left in the Old Snares. Hedda says the last one has been swearing at her all week.',
        objectives: [{ id: 'snares', text: 'Cut the old snares', interact: 'obj:old-snare-*', count: 3, marker: { place: Z4 } }],
        next: 'hedda',
      },
      {
        id: 'hedda', journal: 'A Baron’s hound, a hollow hare, and the Poacher Chief’s own boot, with his second-in-command still in it.',
        objectives: [{ id: 'hedda', text: 'Tell Hedda the snares are cut', talk: 'npc:hedda-crake', marker: { landmark: 'landmark:charcoal-burners-hut' } }],
        next: 'silk',
      },
      {
        id: 'silk', journal: 'The third snare was not poacher hemp. It was silk, and Hedda says somebody has strung a fresh line of it by the old cart track since the camp fell.',
        objectives: [{ id: 'silk', text: 'Find the fresh silk snare by the cart track', interact: 'obj:huntsman-silk-snare', marker: { place: Z4 } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 70 },
  },
  {
    ...A1, id: 'quest:huntsman-the-first-letter', name: 'The First Letter', type: 'side', region: Z4, giver: 'npc:hedda-crake',
    summary: 'A hunter’s bones hang in the old snare-tree, and Hedda says there is a letter in his coat that nobody has been brave enough to read.',
    requires: req(done('quest:huntsman-count-the-herd')), firstStage: 'tree',
    stages: [
      {
        id: 'tree', journal: 'The snare-tree stands alone in a clearing, hung with thirty years of rope.',
        objectives: [{ id: 'tree', text: 'Read the letter in the snare-tree', interact: 'obj:snare-tree-letter', marker: { landmark: 'landmark:snare-tree' } }],
        next: 'hedda',
      },
      {
        id: 'hedda', journal: 'A letter to the Lodge, dated C. 1013, from a hunter called Osric Fallow. It is the first record of the herds leaving their roads.',
        objectives: [{ id: 'hedda', text: 'Tell Hedda who he was', talk: 'npc:hedda-crake', marker: { landmark: 'landmark:charcoal-burners-hut' } }],
        onComplete: [{ setFlag: 'huntsman.first_letter', value: true }],
        next: 'hide',
      },
      {
        id: 'hide', journal: 'Osric Fallow meant to watch the carts. Hedda says the old wardens kept a hide in the rocks above the cart track, and that nobody has climbed up to it in thirty years.',
        objectives: [{ id: 'hide', text: 'Climb to Osric Fallow’s hide above the cart track', interact: 'obj:huntsman-osric-hide', marker: { place: Z4 } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-first-letter'] },
  },

  // ======================= ACT I: mentor thread (2) and bounties (2)
  {
    ...A1, id: 'quest:huntsman-the-herd-road-cairns', name: 'The Herd-Road Cairns', type: 'side', region: Z3, giver: BN,
    summary: 'Bannock wants to rebuild the first antler-cairn on the Elkway, the one his grandfather built. He says he will explain when it is standing.',
    requires: req({ trust: BN, value: 'friendly' }, done('quest:huntsman-count-the-herd')), firstStage: 'cairn',
    stages: [
      {
        id: 'cairn', journal: 'The first cairn stood where the Elkway leaves the town. There is a heap of antler and stone in the ditch where it was.',
        objectives: [{ id: 'cairn', text: 'Rebuild the first antler-cairn', interact: 'obj:elkway-cairn-1', marker: { place: Z3 } }],
        next: 'bannock',
      },
      {
        id: 'bannock', journal: 'The cairn is standing. Bannock is sitting on the verge beside it, getting his breath.',
        objectives: [{ id: 'bannock', text: 'Sit with Bannock', talk: BN, marker: { landmark: 'landmark:bannock-hearth' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, skillPoints: 1 },
  },
  {
    ...A1, id: 'quest:huntsman-biscuits-hunt', name: 'Biscuit’s Hunt', type: 'side', region: Z1, giver: BN,
    summary: 'Biscuit is fourteen and has never caught anything. Bannock would like her to catch something, once, before she is too old to run.',
    requires: req({ trust: BN, value: 'trusted' }, done('quest:huntsman-the-barons-bonfire')), firstStage: 'run',
    stages: [
      {
        id: 'run', journal: 'A hunt she can win: a slow hare, a short run, and a lot of luck. Set it up in the paddock behind the Lodge.',
        objectives: [{ id: 'run', text: 'Set up a hunt Biscuit can win', interact: 'obj:biscuit-hare-run', marker: { landmark: 'landmark:great-lodge-hall' } }],
        next: 'biscuit',
      },
      {
        id: 'biscuit', journal: 'Biscuit is standing in the paddock with a hare in her mouth, looking surprised.',
        objectives: [{ id: 'biscuit', text: 'Go to Biscuit', talk: 'npc:biscuit', marker: { landmark: 'landmark:great-lodge-hall' } }],
        next: 'bannock',
      },
      {
        id: 'bannock', journal: 'Bannock saw it from the fence. He has had to sit down.',
        objectives: [{ id: 'bannock', text: 'Go to Bannock', talk: BN, marker: { landmark: 'landmark:great-lodge-hall' } }],
        onComplete: [{ setFlag: 'huntsman.bannock_devotable', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:huntsman-bounty-tick-swarm', name: 'Bounty: the Old Snares Tick Swarm', type: 'bounty', region: Z4, giver: 'npc:hesketh-ruddock',
    summary: 'Giant Ticks are swarming out of the Old Snares and dropping onto anything warm. The Lodge pays by the tick, and Tallykeeper Ruddock counts very carefully.',
    requires: req(done('quest:huntsman-count-the-herd')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'They drop from the branches. Look up.', objectives: [{ id: 'ticks', text: 'Defeat Giant Ticks in the Old Snares', kill: 'bx_hunt_2', count: 6, marker: { place: Z4 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 150 },
  },
  {
    ...A1, id: 'quest:huntsman-bounty-old-broadhead', name: 'Bounty: Old Broadhead', type: 'bounty', region: Z3, giver: 'npc:hesketh-ruddock',
    summary: 'Old Broadhead, the bull elk who led the herd for eleven autumns, has come back to the Elkway hollowed and is goring anything on two legs.',
    requires: req(done('quest:huntsman-count-the-herd')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'He stands in the middle of the road at dusk, waiting for a herd that is not coming.', objectives: [{ id: 'bull', text: 'Put down Old Broadhead', kill: 'bx_hunt_0', count: 1, marker: { place: Z3 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 120 },
  },

  // ======================= ACT II: the class thread (C-1 … C-6) + featured bearers
  {
    ...A2, id: 'quest:huntsman-hollis-lodge', name: 'Hollis Lodge', type: 'class', region: 'vil:lodge', giver: 'npc:thaddeus-hollis',
    summary: 'Maren says her family keeps a lodge in the Gloamwood, the last Hunt lodge in Concordia. Nobody there has hunted by the old law in thirty years.',
    requires: req(done('quest:cc-through-the-arch')), autoStart: true, firstStage: 'lodge',
    stages: [
      {
        id: 'lodge', journal: 'Hollis Lodge stands in the Gloamwood east of Brindlecross. Maren’s great-uncle Thaddeus keeps it.',
        objectives: [{ id: 'thaddeus', text: 'Find Thaddeus Hollis at Hollis Lodge', talk: 'npc:thaddeus-hollis', marker: { landmark: 'landmark:lodge-hunters-lodge' } }],
        next: 'law',
      },
      {
        id: 'law', journal: 'In the lodge hall hangs the board the old law was carved on, brought over from the Greywilds when Thaddeus was young. Half of it has worn away. He would like a Lodge hunter to read what is left.',
        objectives: [{ id: 'law', text: 'Read the old-law board in the lodge hall', interact: 'obj:huntsman-old-law-board', marker: { landmark: 'landmark:huntsman-lodge-hall' } }],
        onComplete: [{ startQuest: 'quest:huntsman-the-stags-road' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-hunt-hollis-lodge'] },
  },
  {
    ...A2, id: 'quest:huntsman-the-stags-road', name: 'The Stag’s Road', type: 'class', region: 'region:gloam', giver: 'npc:thaddeus-hollis',
    summary: 'The White Stag is weeping somewhere deep in the Gloamwood. Its trail can only be followed by someone who takes nothing on the way: no pelts, no herbs, no kills.',
    requires: req(done('quest:huntsman-hollis-lodge')), firstStage: 'escort',
    stages: [
      {
        id: 'escort', journal: 'Thaddeus has not walked the Stag’s trail since the arches shut. He wants to stand at the head of it once more, and the Gloamwood is full of things that have gone hollow. He is seventy-one and walks with a stick. Keep him alive.',
        onEnter: [{ escort: 'npc:thaddeus-hollis', to: 'landmark:huntsman-trail-head' }],
        objectives: [{ id: 'thaddeus', text: 'See Thaddeus safely to the head of the Stag’s trail', when: { any: [{ flag: 'escort.thaddeus-hollis', op: '==', value: 'arrived' }, { flag: 'escort.thaddeus-hollis', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:huntsman-trail-head' } }],
        next: [{ when: { flag: 'escort.thaddeus-hollis', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'hear' }],
      },
      {
        id: 'regroup', journal: 'Thaddeus went down in the bracken, and Joss Amblin carted him back to the lodge in a barrow full of pelts, which he will never forgive. He has a new stick and is waiting at the door.',
        onEnter: [{ escort: 'npc:thaddeus-hollis', to: 'landmark:huntsman-trail-head' }],
        objectives: [{ id: 'thaddeus', text: 'Try again: see Thaddeus to the trail-head', when: { any: [{ flag: 'escort.thaddeus-hollis', op: '==', value: 'arrived' }, { flag: 'escort.thaddeus-hollis', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:huntsman-trail-head' } }],
        next: [{ when: { flag: 'escort.thaddeus-hollis', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'hear' }],
      },
      {
        id: 'hear', journal: 'Thaddeus is standing at the head of the trail, leaning on his stick, looking at the ground.',
        objectives: [{ id: 'thaddeus', text: 'Hear what Thaddeus sees at the trail-head', talk: 'npc:thaddeus-hollis', marker: { landmark: 'landmark:huntsman-trail-head' } }],
        next: 'trail',
      },
      {
        id: 'trail', journal: 'Three marks on the Stag’s trail, each with something lying beside it that would be easy to take.',
        objectives: [{ id: 'trail', text: 'Follow the Stag’s trail, taking nothing', interact: 'obj:huntsman-stag-trail-*', count: 3, marker: { region: 'region:gloam' } }],
        next: [
          { when: { flag: 'huntsman.trail_cold' }, to: 'cold' },
          { to: 'deep' },
        ],
      },
      {
        id: 'cold', journal: 'You took something, and the trail has gone cold. Thaddeus says there is only one cure: give it back where the Stag can see.',
        objectives: [{ id: 'offer', text: 'Leave what you took at the Stag’s glade', interact: 'obj:huntsman-stag-offering', marker: { landmark: 'landmark:gloam-stag-glade' } }],
        next: 'deep',
      },
      {
        id: 'deep', journal: 'Past the glade where Nan sent you, the trail goes on, down into a hollow where the trees close over.',
        objectives: [{ id: 'lair', text: 'Follow the trail into the deep glade', reach: 'inst:sentinel-hunt', marker: { landmark: 'landmark:gloam-stag-glade' } }],
        onComplete: [{ startQuest: 'quest:huntsman-the-white-stag' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:huntsman-the-white-stag', name: 'The White Stag', type: 'class', region: 'region:gloam', giver: 'npc:thaddeus-hollis',
    summary: 'The White Stag walked ahead of the crown through the Gloamwood every Turning for a thousand years. Now it stands in the deep glade and weeps.',
    requires: req(done('quest:huntsman-the-stags-road')), firstStage: 'fight',
    stages: [
      {
        id: 'fight', journal: 'The White Stag is the Sentinel of the Hunt school. Run it down, and win its mark.',
        objectives: [{ id: 'stag', text: 'Bring down the White Stag', kill: 'bx_stag', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-hunt' }],
        next: 'release',
      },
      {
        id: 'release', journal: 'It knelt in the moss and looked at you.',
        objectives: [{ id: 'mark', text: 'Stay with the White Stag', when: { flag: 'story.sentinel.hunt' } }],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'The Stag is at rest in its glade, and the Gloamwood has stopped weeping. Thaddeus is at the lodge with the door open, which he never does.',
        objectives: [{ id: 'thaddeus', text: 'Tell Thaddeus the White Stag is at rest', talk: 'npc:thaddeus-hollis', marker: { landmark: 'landmark:lodge-hunters-lodge' } }],
        onComplete: [{ startQuest: 'quest:huntsman-the-barons-list' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-stag'] },
  },
  {
    ...A2, id: 'quest:huntsman-the-barons-list', name: 'The Baron’s List', type: 'class', region: 'region:gloam', giver: 'npc:joss-amblin',
    summary: 'Somebody in a Baron’s riding coat has been buying heavy bolts and silk rope at Hollis Lodge. Corva Ashby is in Concordia.',
    requires: req(done('quest:huntsman-the-white-stag')), firstStage: 'joss',
    stages: [
      {
        id: 'joss', journal: 'Joss Amblin, the pelt trader at Hollis Lodge, sold her the bolts. He has been sorry about it ever since.',
        objectives: [{ id: 'joss', text: 'Ask Joss Amblin about the Baron', talk: 'npc:joss-amblin', marker: { landmark: 'landmark:lodge-pelt-trader' } }],
        next: 'sign',
      },
      {
        id: 'sign', journal: 'Corva rode out towards the roots three days ago. A Trophy Baron leaves sign like anybody else, if you know how to read a Baron.',
        objectives: [{ id: 'sign', text: 'Read Corva’s sign on the way to the roots', interact: 'obj:huntsman-corva-sign-*', count: 3, marker: { region: 'region:gloam' } }],
        next: 'camp',
      },
      {
        id: 'camp', journal: 'Her camp is in the roots of the Gloamwood, where the ground opens into the dark. She left in a hurry.',
        objectives: [{ id: 'camp', text: 'Search Corva’s camp at the Gloamwood roots', interact: 'obj:huntsman-corva-camp', marker: { region: 'region:gloam' } }],
        onComplete: [{ startQuest: 'quest:huntsman-the-spinner-below' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-hunt-barons-list'] },
  },
  {
    ...A2, id: 'quest:huntsman-the-spinner-below', name: 'The Spinner Below', type: 'class', region: 'region:gloam', giver: 'npc:joss-amblin',
    summary: 'Corva has gone down under the Gloamwood roots after the second name on her list: the Spinner Below, the memory-spider that wove the Concord’s records into the dark.',
    requires: req(done('quest:huntsman-the-barons-list')), firstStage: 'roots',
    stages: [
      {
        id: 'roots', journal: 'Down through the roots, where the Spinner is unweaving every record of every Turning hunt.',
        objectives: [{ id: 'lair', text: 'Go down under the Gloamwood roots', reach: 'inst:sentinel-umbral', marker: { region: 'region:gloam' } }],
        next: 'spinner',
      },
      {
        id: 'spinner', journal: 'The Spinner Below is the Sentinel of the Umbral school. The Umbral bearers cannot win their mark while it unweaves the dark.',
        objectives: [{ id: 'spinner', text: 'Defeat the Spinner Below', kill: 'bx_spinner', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-umbral' }, { setFlag: 'story.bearer.shade', value: true }],
        next: 'rope',
      },
      {
        id: 'rope', journal: 'The Spinner is at rest. Corva was here before you, and she did not stay to finish it. Her silk rope still hangs from the roof of the web.',
        objectives: [{ id: 'rope', text: 'See what Corva left at the end of her rope', interact: 'obj:huntsman-corva-rope' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300 },
  },
  {
    ...A2, id: 'quest:huntsman-a-letter-by-hawk', name: 'A Letter by Hawk', type: 'class', region: 'vil:brind', giver: BN,
    summary: 'A hawk with Hawkmoor jesses has come in over the Gate Circle with a letter on its leg, and it will not give the letter to anyone but you.',
    requires: req(done('quest:huntsman-the-spinner-below')), autoStart: true, firstStage: 'hawk',
    stages: [
      {
        id: 'hawk', journal: 'The Falconer bearer’s hawk is sitting on the Hunt arch with a letter from Antlerford, looking down its beak at everyone.',
        objectives: [{ id: 'hawk', text: 'Take the letter from the hawk at the Gate Circle', talk: 'npc:sorrel', marker: { landmark: 'landmark:gate-circle' } }],
        next: 'reply',
      },
      {
        id: 'reply', journal: 'Sorrel has gone up onto the old milestone by the Gate Circle and is waiting there with one foot held out, empty, very pointedly. A hawk that brings a letter takes one back.',
        objectives: [{ id: 'reply', text: 'Tie a reply for Bannock to Sorrel’s jess', interact: 'obj:huntsman-reply-sorrel', marker: { landmark: 'landmark:huntsman-gate-milestone' } }],
        onComplete: [{ setFlag: 'story.act2_ready', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:huntsman-what-the-wild-gives', name: 'What the Wild Gives', type: 'side', region: 'vil:lodge', giver: 'npc:bearer-ranger',
    summary: 'The Ranger bearer is at Hollis Lodge, arguing with Thaddeus that everything has to die to feed something else. They want to walk the Stag’s trail with a hunter and settle it.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'trail',
    stages: [
      {
        id: 'trail', journal: 'Rowan Thornbury found a fresh kill on the Stag’s trail and wants you to look at it with them.',
        objectives: [{ id: 'kill', text: 'Look at the kill on the Stag’s trail with the Ranger bearer', interact: 'obj:huntsman-wild-gives-kill', marker: { landmark: 'landmark:lodge-archery-yard' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Rowan has gone quiet, which Thaddeus says is a first. They want a word at the Stone Court.',
        // co-op: if a party member plays the Ranger, they ARE this bearer (the NPC is hidden)
        objectives: [{ id: 'rowan', text: 'Talk to the Ranger bearer', when: { any: [{ flag: 'huntsman.rowan_thanked' }, { partyHasClass: 'ranger' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.ranger', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A2, id: 'quest:huntsman-the-unwoven-hunt', name: 'The Unwoven Hunt', type: 'side', region: 'region:gloam', giver: 'npc:bearer-duskweaver',
    summary: 'Under the Gloamwood roots the Spinner is unweaving the record of every Turning hunt. The Duskweaver bearer wants to write them down before they go, and only a hunter knows where the old trails ran.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'trails',
    stages: [
      {
        id: 'trails', journal: 'Three old procession trails through the Gloamwood. Walk each one, and say aloud where it went, while Lune Ashgrey writes.',
        objectives: [{ id: 'trails', text: 'Walk the old hunt trails with the Duskweaver bearer', interact: 'obj:huntsman-unwoven-trail-*', count: 3, marker: { region: 'region:gloam' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Lune has three pages of trails and is reading them back to themselves at the Stone Court.',
        objectives: [{ id: 'lune', text: 'Talk to the Duskweaver bearer', when: { any: [{ flag: 'huntsman.lune_thanked' }, { partyHasClass: 'duskweaver' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.duskweaver', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  // ======================= ACT III: class quests (III-4 + 3 side)
  {
    ...A3, id: 'quest:huntsman-the-antlered-chimera', name: 'The Antlered Chimera', type: 'class', region: 'region:heart', giver: 'npc:casimir',
    summary: 'At the top of the Twelve Stairs waits the Union Chimera, crowned with antlers of black tears. Riding in them, sighting down them, is Lady Corva Ashby. She has never missed.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'herald',
    stages: [
      { id: 'herald', journal: 'The Hollow King’s smiths bound Corva into the Chimera as its antlers and its aim. Every charge it makes, she has sighted first.', objectives: [{ id: 'herald', text: 'Face the Antlered Chimera', kill: 'cb_antlered-chimera', count: 1, marker: { landmark: 'landmark:twelve-stairs-top' } }], onComplete: [{ openDialogue: 'dialogue:huntsman-herald-fate' }], next: 'fate' },
      { id: 'fate', journal: 'The antlers have come off her. Corva is sitting on the top stair with her crossbow across her knees, still loaded, waiting for you to decide.', objectives: [{ id: 'fate', text: 'Decide Corva’s fate', when: { flag: 'huntsman.nemesis_fate' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 3 },
  },
  {
    ...A3, id: 'quest:huntsman-the-homeward-call', name: 'The Homeward Call', type: 'side', region: 'region:heart', giver: BN,
    summary: 'At the end of every count the Lodge blows a call for the herd to come home. Nobody has blown it in thirty years. From the top of the Twelve Stairs you can see every road in Concordia.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'banner',
    stages: [
      { id: 'banner', journal: 'Halfway up the Hunt stair hangs the Great Lodge’s old Turning banner, an elk on green, that every Master of the Lodge carried up here once in twelve years. Bannock carried it last.', objectives: [{ id: 'banner', text: 'Find the Lodge’s banner on the Hunt stair', interact: 'obj:huntsman-stair-banner', marker: { landmark: 'landmark:huntsman-hunt-stair' } }], next: 'call' },
      { id: 'call', journal: 'The head of the Hunt stair looks out over the Citadel, and every road in Concordia runs to it.', objectives: [{ id: 'call', text: 'Sound the Lodge’s homeward call at the head of the Hunt stair', interact: 'obj:huntsman-hunt-stair-head', marker: { landmark: 'landmark:twelve-stairs-top' } }], next: 'tally' },
      { id: 'tally', journal: 'The herd answered. At the end of every count the Lodge writes the number down on the tally stone. The Heart camp has a cart-board. It will do.', objectives: [{ id: 'tally', text: 'Write the count on the cart-board at the Heart camp', interact: 'obj:huntsman-heart-tally', marker: { landmark: 'landmark:heart-camp' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:huntsman-the-gamekeeper', name: 'The Gamekeeper', type: 'side', region: 'region:heart', giver: 'npc:quentin-snipe',
    summary: 'A thin, careful man with a pack and a spade has walked into the Heart camp. Quentin Snipe has followed his lady all the way here, to bring her home or to bury her.',
    requires: req(done('quest:huntsman-the-antlered-chimera'), done('quest:huntsman-the-gamekeepers-notice')), autoStart: true, firstStage: 'snipe',
    stages: [
      { id: 'snipe', journal: 'Quentin is at the Heart camp. He has not asked anyone anything. He is waiting to be told.', objectives: [{ id: 'snipe', text: 'Tell Quentin Snipe what became of Corva', talk: 'npc:quentin-snipe', marker: { landmark: 'landmark:heart-camp' } }], next: [{ when: { flag: 'huntsman.nemesis_fate', op: '==', value: 'spared' }, to: 'corva' }, { to: 'cairn' }] },
      { id: 'corva', journal: 'Corva is sitting at the edge of the camp fire, unbound, with nothing in her hands. Quentin is standing behind you with his spade.', objectives: [{ id: 'corva', text: 'Bring Quentin to Corva', talk: CO, marker: { landmark: 'landmark:heart-camp' } }], next: 'notice' },
      { id: 'cairn', journal: 'The Heart’s stone will not take a spade. Quentin says a cairn will do. It is what the Lodge does for its own.', objectives: [{ id: 'cairn', text: 'Build Corva’s cairn at the head of the Hunt stair', interact: 'obj:huntsman-corva-cairn', marker: { landmark: 'landmark:twelve-stairs-top' } }], next: 'notice' },
      { id: 'notice', journal: 'Quentin has left his pack by the camp’s edge, open, with nine folded notices in it and a tenth half written. He has gone to fetch water and left it where you would see it. He is a careful man.', objectives: [{ id: 'notice', text: 'Read Quentin’s tenth notice', interact: 'obj:huntsman-tenth-notice', marker: { landmark: 'landmark:huntsman-snipe-pack' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:huntsman-the-calf-on-the-stair', name: 'The Calf on the Stair', type: 'side', region: 'region:heart', giver: 'npc:quentin-snipe',
    summary: 'Just below the top of the Hunt stair stands a young elk, half grown, without a speck of black on it. It has followed the Great Hunt’s old road all the way from the Elkway, and it is waiting to be led.',
    requires: req(done('quest:heart-stairs'), done('quest:huntsman-the-last-calf')), autoStart: true, firstStage: 'stair',
    stages: [
      { id: 'stair', journal: 'The calf from the Elkway, taller now, is standing on the Hunt stair, very still, as if it has forgotten how to go down.', objectives: [{ id: 'calf', text: 'Find the calf on the Hunt stair', interact: 'obj:huntsman-stair-calf', marker: { landmark: 'landmark:twelve-stairs-top' } }], next: 'cover' },
      { id: 'cover', journal: 'It follows if you walk slowly and look the other way. The old law still holds: lead it, and never touch it once.', objectives: [{ id: 'cover', text: 'Lead the calf down to cover at the Heart camp', interact: 'obj:huntsman-calf-cover', marker: { landmark: 'landmark:heart-camp' } }], next: 'watch' },
      { id: 'watch', journal: 'Hollowed things come to the edge of the camp after dark, drawn by anything without black on it. The calf sleeps behind the carts. Somebody should sit up with it, the old way, at the far side of the wagon line where the dark comes in.', objectives: [{ id: 'watch', text: 'Sit the night watch over the calf', interact: 'obj:huntsman-calf-watch', marker: { landmark: 'landmark:huntsman-wagon-line' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
];

export default quests;
