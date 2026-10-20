/**
 * Hollow Crown: the JESTER campaign (docs/lore/hollow-crown/06-outlines/guile.md). Act I in Velvet Harbour
 * (area:guile-capital) and the Act II class thread in Concordia. Act III class quests land with the Heart. Owner: Claude 4.
 */
import type { NarrativeCondition, QuestDef } from '@/core';

const JE: NarrativeCondition = { heroClass: 'jester' };
const done = (q: `quest:${string}`): NarrativeCondition => ({ questCompleted: q });
const req = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: [JE, ...c] });
const A1 = { act: 'act1' as const, campaign: 'jester', chapter: 'Velvet Harbour' };
const A2 = { act: 'act2' as const, campaign: 'jester', chapter: 'Concordia' };
const A3 = { act: 'act3' as const, campaign: 'jester', chapter: 'The Heart' };
const Z1 = 'zone:guile-capital-1' as const, Z2 = 'zone:guile-capital-2' as const, Z3 = 'zone:guile-capital-3' as const, Z4 = 'zone:guile-capital-4' as const;
const L1 = 'inst:guile-capital-lair-1' as const, L2 = 'inst:guile-capital-lair-2' as const, L3 = 'inst:guile-capital-lair-3' as const;
const FE = 'npc:fennick-pantaloon' as const, SO = 'npc:harlequin-sorrow' as const;

const quests: QuestDef[] = [
  // ======================= ACT I: main (I-1 … I-10)
  {
    ...A1, id: 'quest:jester-the-bell-at-the-masque', name: 'The Bell at the Masque', type: 'main', region: Z1, giver: FE,
    summary: 'Midnight on the Velvet Docks, with the court’s barge-masque coming ashore. A bell rang under the harbour, every bell on every fool’s cap answered it, and for one heartbeat the whole of Velvet Harbour stopped laughing.',
    requires: JE, autoStart: true, firstStage: 'masque',
    stages: [
      {
        id: 'masque', journal: 'Something under the palace is singing, and it is singing to you. Everyone on the gangplank has seen your face.',
        onEnter: [{ openDialogue: 'dialogue:jester-bell-night' }],
        objectives: [{ id: 'gangplank', text: 'Get down the gangplank before anyone looks too closely', reach: 'landmark:masque-gangplank', marker: { landmark: 'landmark:masque-gangplank' } }],
        next: 'fennick',
      },
      {
        id: 'fennick', journal: 'Old Fennick Pantaloon, the old fool who taught you to fall over, has fallen flat across the gangplank, on purpose, and the whole masque is laughing at him instead of looking at you.',
        objectives: [{ id: 'fennick', text: 'Help Fennick up off the gangplank', talk: FE, marker: { landmark: 'landmark:masque-gangplank' } }],
        onComplete: [{ setFlag: 'jester.bell_heard', value: true }],
        next: 'attic',
      },
      {
        id: 'attic', journal: 'Fennick wants walking home along the Docks, slowly, because of the knee. His attic is at the top of an old sail-loft, up a ladder with two rungs missing.',
        objectives: [{ id: 'attic', text: 'Walk Fennick home to his attic', reach: 'landmark:fennick-attic', marker: { landmark: 'landmark:fennick-attic' } }],
        next: 'cushions',
      },
      {
        id: 'cushions', journal: 'An attic made entirely of cushions. Fennick has lowered himself onto the biggest heap, and he is waiting to hear about the singing.',
        objectives: [{ id: 'fennick', text: 'Sit with Fennick in his attic', talk: FE, marker: { landmark: 'landmark:fennick-attic' } }],
        onComplete: [{ startQuest: 'quest:jester-fennicks-pawn-ticket' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-tidecourt', 'lore:hc-velvet-court'] },
  },
  {
    ...A1, id: 'quest:jester-fennicks-pawn-ticket', name: 'Fennick’s Pawn Ticket', type: 'main', region: Z1, giver: FE,
    summary: 'Fennick pawned his cap-bells to Tuttle on the Docks eleven years ago, and now he wants them back. He has kept the ticket in his shoe ever since, which is why it smells like that.',
    requires: req(done('quest:jester-the-bell-at-the-masque')), firstStage: 'tuttle',
    stages: [
      {
        id: 'tuttle', journal: 'Tuttle’s Pawn, on the Velvet Docks. Take the ticket. Hold your nose.',
        objectives: [{ id: 'tuttle', text: 'Redeem Fennick’s ticket at Tuttle’s Pawn', talk: 'npc:tuttle', marker: { landmark: 'landmark:tuttles-pawn' } }],
        next: 'purses',
      },
      {
        id: 'purses', journal: 'Tuttle takes and pays in black pearls now, nothing else. The Hollow Cutpurses working the Docks crowd are carrying plenty.',
        objectives: [{ id: 'purses', text: 'Take back what the Hollow Cutpurses lifted', kill: 'bx_guile_0', count: 4, marker: { place: Z1 } }],
        next: 'redeem',
      },
      {
        id: 'redeem', journal: 'A purse of black pearls, cold and heavy. Tuttle will take it.',
        objectives: [{ id: 'tuttle', text: 'Pay Tuttle in pearls', talk: 'npc:tuttle', marker: { landmark: 'landmark:tuttles-pawn' } }],
        next: 'fennick',
      },
      {
        id: 'fennick', journal: 'Fennick’s cap-bells, tarnished, in a paper bag. The dockers on the bollards outside are smiling at nothing.',
        objectives: [{ id: 'fennick', text: 'Bring Fennick his bells', talk: FE, marker: { landmark: 'landmark:fennick-attic' } }],
        onComplete: [{ startQuest: 'quest:jester-the-phantom-theatre' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40, lore: ['lore:hc-black-pearls'] },
  },
  {
    ...A1, id: 'quest:jester-the-phantom-theatre', name: 'The Phantom Theatre', type: 'main', region: Z2, giver: FE,
    summary: 'Masks are vanishing from the Masquerade Quarter, faces and all. Revellers wake up bare-faced and cannot remember who they were.',
    requires: req(done('quest:jester-fennicks-pawn-ticket')), firstStage: 'ribbons',
    stages: [
      {
        id: 'ribbons', journal: 'Every stolen mask dropped a ribbon as it went. Follow them.',
        objectives: [{ id: 'ribbons', text: 'Follow the trail of dropped mask-ribbons', interact: 'obj:mask-ribbon-*', count: 3, marker: { place: Z2 } }],
        next: 'theatre',
      },
      {
        id: 'theatre', journal: 'The ribbons go under the boards of the old Phantom Theatre, which has been shut since the year of the Hollowing.',
        objectives: [{ id: 'theatre', text: 'Get into the Phantom Theatre', reach: L1, marker: { landmark: 'landmark:phantom-theatre' } }],
        next: 'phantom',
      },
      {
        id: 'phantom', journal: 'It swaps places with the masks hung round the stage. Find the one that blinks.',
        objectives: [{ id: 'phantom', text: 'Unmask the Masked Phantom', kill: 'bx_guile_4', count: 1 }],
        next: 'masks',
      },
      {
        id: 'masks', journal: 'A rack of stolen masks behind the stage, every one of them crying black pearls.',
        objectives: [{ id: 'masks', text: 'Give the masks back to the Quarter', interact: 'obj:phantom-mask-rack' }],
        onComplete: [{ setFlag: 'jester.phantom_unmasked', value: true }, { startQuest: 'quest:jester-the-kings-fool' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 80, lore: ['lore:hc-masquerade-quarter'] },
  },
  {
    ...A1, id: 'quest:jester-the-kings-fool', name: 'The King’s Fool', type: 'main', region: Z3, giver: SO,
    summary: 'The Velvet King’s own fool, Harlequin Sorrow, has sent for the apprentice who unmasked the Phantom. He would like to meet you on the Exchange Floor, in front of everyone.',
    requires: req(done('quest:jester-the-phantom-theatre')), firstStage: 'exchange',
    stages: [
      {
        id: 'exchange', journal: 'The Thieves’ Exchange, at the busiest hour. Every broker on the floor has stopped trading to watch.',
        objectives: [{ id: 'sorrow', text: 'Meet Harlequin Sorrow on the Exchange Floor', talk: SO, marker: { landmark: 'landmark:thieves-exchange' } }],
        next: 'steps',
      },
      {
        id: 'steps', journal: 'Sorrow has asked you to walk with him up to the palace steps, where the pages come down with the King’s letters.',
        objectives: [{ id: 'steps', text: 'Follow Sorrow up to the palace steps', reach: 'landmark:jester-palace-steps', marker: { landmark: 'landmark:jester-palace-steps' } }],
        next: 'pages',
      },
      {
        id: 'pages', journal: 'Sorrow is sitting on the palace steps between two page boys, teaching them a card trick.',
        objectives: [{ id: 'sorrow', text: 'Sit with Sorrow on the palace steps', talk: SO, marker: { landmark: 'landmark:jester-palace-steps' } }],
        next: 'fennick',
      },
      {
        id: 'fennick', journal: 'He bought your apprentice indenture in front of the whole Exchange and tore it in half. You are free, and you have a cap at court.',
        objectives: [{ id: 'fennick', text: 'Tell Fennick', talk: FE, marker: { landmark: 'landmark:fennick-attic' } }],
        onComplete: [{ setFlag: 'jester.sorrow_met', value: true }, { startQuest: 'quest:jester-the-jubilee-jest' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-thieves-exchange'] },
  },
  {
    ...A1, id: 'quest:jester-the-jubilee-jest', name: 'The Jubilee Jest', type: 'main', region: Z3, giver: SO,
    summary: 'The Velvet King has bought back the Pawned Gate and declared a Jubilee: every debt in Tidecourt forgiven by royal jest. The Court wants you to tell it. The Thieves’ Exchange wants it told differently.',
    requires: req(done('quest:jester-the-kings-fool')), firstStage: 'canvass',
    stages: [
      {
        id: 'canvass', journal: 'Fennick said: before you tell a joke about debt, ask the people who owe and the people who count. Mother Gudgeon has run on a slate for thirty years. Augustin Drabb keeps the Counting House books.',
        objectives: [
          { id: 'gudgeon', text: 'Ask Mother Gudgeon what the Jubilee means to the Docks', talk: 'npc:mother-gudgeon', marker: { landmark: 'landmark:gudgeon-fish-stall' } },
          { id: 'drabb', text: 'Ask Augustin Drabb what the Jubilee means to the Counting House', talk: 'npc:augustin-drabb', marker: { landmark: 'landmark:counting-house' } },
        ],
        next: 'jest',
      },
      {
        id: 'jest', journal: 'The Jubilee is proclaimed from the Exchange balcony at noon. You have the King’s jest in one pocket and Guildmaster Vex’s in the other.',
        objectives: [{ id: 'jest', text: 'Tell the Jubilee jest from the Exchange balcony', when: { flag: 'jester.jest' }, marker: { landmark: 'landmark:thieves-exchange' } }],
        next: 'after',
      },
      {
        id: 'after', journal: 'Whatever you told them, a joke cannot cancel a debt. Something in the royal treasury has woken up to collect.',
        objectives: [],
        onComplete: [{ startQuest: 'quest:jester-the-counting-house' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-pawned-gate'] },
  },
  {
    ...A1, id: 'quest:jester-the-counting-house', name: 'The Counting House', type: 'main', region: Z3, giver: FE,
    summary: 'The Auditor, the royal treasury’s ledger-golem, has woken to collect every debt in Tidecourt at once, with interest. It has started with the debts the Jubilee forgave.',
    requires: req(done('quest:jester-the-jubilee-jest')), firstStage: 'coins',
    stages: [
      {
        id: 'coins', journal: 'Coins are walking out of purses all over the Exchange Floor, rolling uphill along the gutters. Follow them, and find out where every debt in Tidecourt is going.',
        objectives: [{ id: 'coins', text: 'Follow the walking coins through the Exchange', interact: 'obj:jester-walking-coin-*', count: 3, marker: { place: Z3 } }],
        next: 'house',
      },
      {
        id: 'house', journal: 'The Counting House doors are open, and coins are walking out of every purse on the Exchange Floor and in through them.',
        objectives: [{ id: 'house', text: 'Go into the Counting House', reach: L2, marker: { landmark: 'landmark:counting-house' } }],
        onComplete: [{ openDialogue: 'dialogue:jester-auditor-wakes' }],
        next: 'auditor',
      },
      {
        id: 'auditor', journal: 'Every blow you land is charged to your account and paid back with interest. Smash the abacus pillars to clear it.',
        objectives: [{ id: 'auditor', text: 'Close the Auditor’s account', kill: 'cb_the-auditor', count: 1 }],
        next: 'jar',
      },
      {
        id: 'jar', journal: 'Behind the Auditor, a strongroom of shelves, floor to ceiling, and on every shelf, jars of black pearls.',
        objectives: [{ id: 'jar', text: 'Look at the jars in the strongroom', interact: 'obj:sorrow-pearl-jar' }],
        onComplete: [{ setFlag: 'jester.pearl_jar', value: true }, { startQuest: 'quest:jester-sorrows-laughing-shop' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 120 },
  },
  {
    ...A1, id: 'quest:jester-sorrows-laughing-shop', name: 'Sorrow’s Laughing Shop', type: 'main', region: Z4, giver: FE,
    summary: 'Every jar in the strongroom is labelled “One sorrow, received with thanks. H.S.” The labels come from a little shop with a red door at the top of the Crooked Stairs.',
    requires: req(done('quest:jester-the-counting-house')), firstStage: 'shop',
    stages: [
      {
        id: 'shop', journal: 'Up the Crooked Stairs, to the red door. There is a queue.',
        objectives: [{ id: 'shop', text: 'Find the shop with the red door', reach: 'landmark:sorrows-laughing-shop', marker: { landmark: 'landmark:sorrows-laughing-shop' } }],
        next: 'queue',
      },
      {
        id: 'queue', journal: 'The queue for the red door goes halfway down the Crooked Stairs. Before you go in, find out what the people in it have come to sell.',
        objectives: [{ id: 'queue', text: 'Talk to the people queueing at the red door', interact: 'obj:jester-shop-queue-*', count: 3, marker: { landmark: 'landmark:sorrows-laughing-shop' } }],
        next: 'sorrow',
      },
      {
        id: 'sorrow', journal: 'Behind the counter, measuring out laughter on credit, is Harlequin Sorrow.',
        objectives: [{ id: 'sorrow', text: 'Talk to Harlequin Sorrow in his shop', talk: SO, marker: { landmark: 'landmark:sorrows-laughing-shop' } }],
        next: 'fennick',
      },
      {
        id: 'fennick', journal: 'He wants the Court half set in his bauble: a joke that never fails, so nobody in Tidecourt ever has to cry again.',
        objectives: [{ id: 'fennick', text: 'Tell Fennick what Sorrow wants', talk: FE, marker: { landmark: 'landmark:fennick-attic' } }],
        onComplete: [{ setFlag: 'jester.sorrow_turned', value: true }, { startQuest: 'quest:jester-the-velvet-court' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-harlequin-sorrow'] },
  },
  {
    ...A1, id: 'quest:jester-the-velvet-court', name: 'The Velvet Court', type: 'main', region: L3, giver: FE,
    summary: 'The Court half of the Guile stone lies under the cushion of the Velvet King’s throne. Tonight is Jubilee night, and Sorrow means to take it while the court laughs.',
    requires: req(done('quest:jester-sorrows-laughing-shop')), firstStage: 'court',
    stages: [
      {
        id: 'court', journal: 'Into the King’s court on Jubilee night. A paid claque in the gallery laughs on cue.',
        objectives: [{ id: 'court', text: 'Go into the Velvet Court', reach: L3, marker: { place: Z3 } }],
        next: 'sorrow',
      },
      {
        id: 'sorrow', journal: 'Every laugh from the claque heals him. Make them laugh for real, off his cue.',
        objectives: [{ id: 'sorrow', text: 'Defeat Harlequin Sorrow', kill: 'cb_harlequin-sorrow', count: 1 }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'Sorrow bowed, said “Encore,” and left by the King’s private tunnel. The throne’s cushion is singing.',
        objectives: [{ id: 'stone', text: 'Take the Court half from under the cushion', interact: 'obj:guile-capital-halfstone' }],
        onComplete: [{ setFlag: 'jester.halfstone', value: true }, { startQuest: 'quest:jester-exit-pursued-by-a-fool' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, skillPoints: 1, lore: ['lore:hc-half-stones'] },
  },
  {
    ...A1, id: 'quest:jester-exit-pursued-by-a-fool', name: 'Exit, Pursued by a Fool', type: 'main', region: Z4, giver: FE,
    summary: 'Sorrow’s tunnel comes out on the toll road to the Pawned Gate. Fennick insists on walking you to the first milestone, and on falling over at it.',
    requires: req(done('quest:jester-the-velvet-court')), firstStage: 'fennick',
    stages: [
      {
        id: 'fennick', journal: 'Fennick is waiting at the top of the Crooked Stairs with a bag of cushions over his shoulder.',
        objectives: [{ id: 'fennick', text: 'Walk the toll road with Fennick', talk: FE, marker: { landmark: 'landmark:pellam-lamp' } }],
        next: 'toll',
      },
      {
        id: 'toll', journal: 'Halfway up the toll road stands the old Jest House, where the toll was once a joke. Nobody has paid it in thirty years.',
        objectives: [{ id: 'toll', text: 'Stop at the Jest House on the toll road', interact: 'obj:jester-toll-slate', marker: { landmark: 'landmark:jester-jest-house' } }],
        next: 'road',
      },
      {
        id: 'road', journal: 'The toll road runs out of Velvet Harbour along the cliffs to the Pawned Gate.',
        objectives: [{ id: 'gate', text: 'Take the toll road to the Pawned Gate', reach: 'area:guile-gate', marker: { place: 'area:guile-gate' } }],
        onComplete: [{ startQuest: 'quest:jester-the-pawned-gate' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:jester-the-pawned-gate', name: 'The Pawned Gate', type: 'main', region: 'area:guile-gate', giver: FE,
    summary: 'The Velvet King stands at the Pawned Gate on the gate’s own deed, waiting to sell passage through it to the Hollow King.',
    requires: req(done('quest:jester-exit-pursued-by-a-fool')), firstStage: 'king',
    stages: [
      {
        id: 'king', journal: 'He auctions the floor out from under you to hollow bidders. Between his phases, tell him a true joke. It is the only thing that will crack his crown.',
        objectives: [{ id: 'king', text: 'Defeat the Velvet King', kill: 'bx_guile_5', count: 1 }],
        next: 'gate',
      },
      {
        id: 'gate', journal: 'The Velvet King is sitting on his throne of IOUs, weeping clear tears. Behind him, the gate weeps black.',
        objectives: [{ id: 'seal', text: 'Open the Pawned Gate with the Court half', interact: 'obj:guile-gate-seal' }],
        onComplete: [{ setFlag: 'story.gate_open', value: true }, { setFlag: 'story.act', value: 2 }, { setFlag: 'jester.act1_done', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 200, lore: ['lore:hc-realm-gates', 'lore:hc-velvet-king'] },
  },

  // ======================= ACT I: side quests (2 per zone)
  {
    ...A1, id: 'quest:jester-gull-number-nine', name: 'Gull Number Nine', type: 'side', region: Z1, giver: 'npc:constable-prigg',
    summary: 'A gull with forty-one convictions for chip theft is to be hanged in a tiny hat-gibbet at dawn. Constable Prigg is very proud of the gibbet. The gull says it was framed.',
    requires: req(done('quest:jester-the-bell-at-the-masque')), firstStage: 'scenes',
    stages: [
      {
        id: 'scenes', journal: 'Three chip stalls robbed last night. The gull was in custody for two of them.',
        objectives: [{ id: 'scenes', text: 'Look at the three robbed chip stalls', interact: 'obj:chip-stall-*', count: 3, marker: { place: Z1 } }],
        next: 'crow',
      },
      {
        id: 'crow', journal: 'Black feathers at every stall. Not gull feathers. Thief Crow feathers.',
        objectives: [{ id: 'crow', text: 'Catch the real chip thief', kill: 'bx_guile_1', count: 1, marker: { place: Z1 } }],
        next: 'prigg',
      },
      {
        id: 'prigg', journal: 'The crow had forty-one chips in its nest. Forty-one exactly.',
        objectives: [{ id: 'prigg', text: 'Present the evidence to Constable Prigg', talk: 'npc:constable-prigg', marker: { landmark: 'landmark:harbour-watch-house' } }],
        onComplete: [{ setFlag: 'jester.gull_saved', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 30 },
  },
  {
    ...A1, id: 'quest:jester-mother-gudgeons-tab', name: 'Mother Gudgeon’s Tab', type: 'side', region: Z1, giver: 'npc:mother-gudgeon',
    summary: 'Mother Gudgeon’s fish stall has run on credit for thirty years, and Harlequin Sorrow has just bought the whole street’s tab.',
    requires: req(done('quest:jester-fennicks-pawn-ticket')), firstStage: 'tab',
    stages: [
      {
        id: 'tab', journal: 'The tab is a roll of paper as long as the stall. Sorrow’s clerk wants it settled by the Jubilee.',
        objectives: [{ id: 'tab', text: 'Settle Mother Gudgeon’s tab', when: { flag: 'jester.tab_settled' }, marker: { landmark: 'landmark:gudgeon-fish-stall' } }],
        next: 'book',
      },
      {
        id: 'book', journal: 'Why would Sorrow buy a whole street’s slate in one morning? His clerk keeps the tab-book on a stand by the red door, at the top of the Crooked Stairs.',
        objectives: [{ id: 'book', text: 'Read Mother Gudgeon’s page in Sorrow’s tab-book', interact: 'obj:jester-tab-book', marker: { landmark: 'landmark:sorrows-laughing-shop' } }],
        next: 'gudgeon',
      },
      {
        id: 'gudgeon', journal: 'The debt was never meant to be paid. It was bait, and Mother Gudgeon ought to know what for.',
        objectives: [{ id: 'gudgeon', text: 'Tell Mother Gudgeon what the tab was for', talk: 'npc:mother-gudgeon', marker: { landmark: 'landmark:gudgeon-fish-stall' } }],
        onComplete: [{ setFlag: 'jester.gudgeon_warned', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_fish', qty: 3 }] },
  },
  {
    ...A1, id: 'quest:jester-the-man-who-forgot-his-face', name: 'The Man Who Forgot His Face', type: 'side', region: Z2, giver: 'npc:ottoline-squibb',
    summary: 'Mister Ottoline Squibb has worn the same carnival mask since the year of the Hollowing, and no longer knows what is under it. He would like someone to find out before he does.',
    requires: req(done('quest:jester-the-phantom-theatre')), firstStage: 'painter',
    stages: [
      {
        id: 'painter', journal: 'Somebody painted Squibb’s portrait when he was twenty. The Quarter says it was old Clementine Daub.',
        objectives: [{ id: 'daub', text: 'Find the painter, Clementine Daub', talk: 'npc:clementine-daub', marker: { landmark: 'landmark:squibb-portrait' } }],
        next: 'portrait',
      },
      {
        id: 'portrait', journal: 'The portrait is still in her studio, face to the wall.',
        objectives: [{ id: 'portrait', text: 'Turn the portrait round', interact: 'obj:squibb-portrait-canvas', marker: { landmark: 'landmark:squibb-portrait' } }],
        next: 'squibb',
      },
      {
        id: 'squibb', journal: 'A young man with a large nose and a very good laugh, holding his mask in his hand.',
        objectives: [{ id: 'squibb', text: 'Tell Squibb what you saw', talk: 'npc:ottoline-squibb', marker: { place: Z2 } }],
        onComplete: [{ setFlag: 'jester.squibb_helped', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 60 },
  },
  {
    ...A1, id: 'quest:jester-the-worst-joke-in-tidecourt', name: 'The Worst Joke in Tidecourt', type: 'side', region: Z2, giver: 'npc:hortense-quibble',
    summary: 'The Masquerade Quarter’s yearly contest for the worst joke in Tidecourt. Fennick has won it eleven years running. Dame Hortense Quibble, the judge, would like a new winner for once.',
    requires: req(done('quest:jester-the-phantom-theatre')), firstStage: 'charter',
    stages: [
      {
        id: 'charter', journal: 'The contest’s rules are nailed to the stage. Read them first. Fennick never has.',
        objectives: [{ id: 'charter', text: 'Read the contest charter on the stage', interact: 'obj:worst-joke-charter', marker: { landmark: 'landmark:worst-joke-stage' } }],
        next: 'contest',
      },
      {
        id: 'contest', journal: 'Fennick has told his joke. Three people fainted. It is your turn.',
        objectives: [{ id: 'contest', text: 'Tell the worst joke in Tidecourt', when: { flag: 'jester.worst_joke' }, marker: { landmark: 'landmark:worst-joke-stage' } }],
        next: 'fennick',
      },
      {
        id: 'fennick', journal: 'Fennick handed over the cap that honks and went home early. He has never once gone home early from the contest.',
        objectives: [{ id: 'fennick', text: 'Find Fennick in his attic', talk: FE, marker: { landmark: 'landmark:fennick-attic' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50, hcItems: [{ item: 'a_guile_cloth_helm' }] },
  },
  {
    ...A1, id: 'quest:jester-a-promise-slightly-used', name: 'A Promise, Slightly Used', type: 'side', region: Z3, giver: 'npc:rosamund-hake',
    summary: 'Rosamund Hake sold her wedding vow on the Exchange to pay her father’s debts. It is being resold on the Floor as “lightly worn”, and the wedding is on Saturday.',
    requires: req(done('quest:jester-the-kings-fool')), firstStage: 'stall',
    stages: [
      {
        id: 'stall', journal: 'The vow is under glass on a broker’s stall on the Exchange Floor, between a used apology and a box of second-hand oaths.',
        objectives: [{ id: 'stall', text: 'Get Rosamund’s vow back from the promise stall', interact: 'obj:promise-stall', marker: { landmark: 'landmark:thieves-exchange' } }],
        next: 'bride',
      },
      {
        id: 'bride', journal: 'You have the vow. It is a small folded paper, and it is warm.',
        objectives: [{ id: 'bride', text: 'Give Rosamund her vow back', talk: 'npc:rosamund-hake', marker: { place: Z3 } }],
        next: 'wedding',
      },
      {
        id: 'wedding', journal: 'Saturday, in the little harbour chapel. Rosamund wants you at the back, to hear her say her vow out loud so that nobody can ever sell it again.',
        objectives: [{ id: 'wedding', text: 'Go to Rosamund’s wedding in the harbour chapel', interact: 'obj:jester-wedding-altar', marker: { landmark: 'landmark:jester-harbour-chapel' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 70, lore: ['lore:hc-promise-trade'] },
  },
  {
    ...A1, id: 'quest:jester-futures-in-weather', name: 'Futures in Weather', type: 'side', region: Z3, giver: 'npc:lionel-mizzle',
    summary: 'Broker Lionel Mizzle has sold “fine tomorrow” on the Exchange every day for thirty years. The Bell has spoiled the forecast, and if it rains on Saturday he owes the whole market.',
    requires: req(done('quest:jester-the-kings-fool')), firstStage: 'cover',
    stages: [
      {
        id: 'cover', journal: 'Three ways to cover a position in weather, Mizzle says: buy the umbrellas, sell the sunshine, and bet against yourself.',
        objectives: [{ id: 'cover', text: 'Cover Mizzle’s position on the Floor', interact: 'obj:weather-desk-*', count: 3, marker: { landmark: 'landmark:thieves-exchange' } }],
        next: 'mizzle',
      },
      {
        id: 'mizzle', journal: 'His position is covered. It is also, technically, raining.',
        objectives: [{ id: 'mizzle', text: 'Tell Mizzle he is covered', talk: 'npc:lionel-mizzle', marker: { landmark: 'landmark:thieves-exchange' } }],
        next: 'delivery',
      },
      {
        id: 'delivery', journal: 'Mizzle sold the sunshine to a man from Solaria, and the man from Solaria would like it delivered. He is waiting at the end of the Docks, in the rain.',
        objectives: [{ id: 'berth', text: 'Deliver one fine day to the Solarian at the Docks', interact: 'obj:jester-solarian-berth', marker: { place: Z1 } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 90, lore: ['lore:hc-exchange-markets'] },
  },
  {
    ...A1, id: 'quest:jester-the-chest-that-bites-back', name: 'The Chest That Bites Back', type: 'side', region: Z4, giver: 'npc:wick-pellam',
    summary: 'A treasure-chest on the Crooked Stairs is a Mimic Slime, and it has swallowed a debt-collector who is still, from inside, collecting.',
    requires: req(done('quest:jester-the-counting-house')), firstStage: 'chest',
    stages: [
      {
        id: 'chest', journal: 'The chest is on the fourth landing, and it is shouting about arrears.',
        objectives: [{ id: 'chest', text: 'Defeat the Mimic Slime on the Stairs', kill: 'bx_guile_2', count: 1, marker: { place: Z4 } }],
        next: 'smallbone',
      },
      {
        id: 'smallbone', journal: 'Out of the slime, with his ledger, his pencil and his dignity, comes Collector Smallbone.',
        objectives: [{ id: 'smallbone', text: 'Talk to Collector Smallbone', talk: 'npc:collector-smallbone', marker: { place: Z4 } }],
        next: 'refunds',
      },
      {
        id: 'refunds', journal: 'Smallbone collected from three people on the Stairs who owed nothing, and he cannot bring himself to give money back. He has given you the envelope instead.',
        objectives: [{ id: 'refunds', text: 'Deliver Smallbone’s refunds on the Crooked Stairs', interact: 'obj:jester-refund-door-*', count: 3, marker: { place: Z4 } }],
        onComplete: [{ setFlag: 'jester.smallbone_refunds', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 80 },
  },
  {
    ...A1, id: 'quest:jester-the-lamplighters-wife', name: 'The Lamplighter’s Wife', type: 'side', region: Z4, giver: 'npc:wick-pellam',
    summary: 'Old Wick Pellam lights a lamp at the top of the Crooked Stairs every night, and cannot remember why.',
    requires: req(done('quest:jester-the-counting-house')), firstStage: 'lamp',
    stages: [
      {
        id: 'lamp', journal: 'Watch him light it tonight. Whatever he has forgotten, his hands remember.',
        objectives: [{ id: 'lamp', text: 'Watch Wick light his lamp, at night', when: { flag: 'jester.lamp_watched' }, marker: { landmark: 'landmark:pellam-lamp' } }],
        next: 'receipt',
      },
      {
        id: 'receipt', journal: 'There is a tin box in the lamp’s base, and a receipt in the tin.',
        objectives: [{ id: 'receipt', text: 'Read the receipt in the lamp’s tin', interact: 'obj:pellam-receipt', marker: { landmark: 'landmark:pellam-lamp' } }],
        next: 'wick',
      },
      {
        id: 'wick', journal: '“One grief, for the late Mrs Pellam, received with thanks. Paid in laughter, on credit. H.S.”',
        objectives: [{ id: 'wick', text: 'Tell Wick what he sold', talk: 'npc:wick-pellam', marker: { landmark: 'landmark:pellam-lamp' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_lantern' }] },
  },

  // ======================= ACT I: mentor thread (2) and bounties (2)
  {
    ...A1, id: 'quest:jester-the-fools-licence', name: 'The Fool’s Licence', type: 'side', region: Z3, giver: FE,
    summary: 'Why does Fennick fall over? He says it is a long story, and that the short version is in the palace archive, in a drawer marked FOOLS, NOT TO BE OPENED.',
    requires: req({ trust: FE, value: 'friendly' }, done('quest:jester-the-kings-fool')), firstStage: 'archive',
    stages: [
      {
        id: 'archive', journal: 'The palace archive, behind the Counting House. Fennick says nobody has opened the FOOLS drawer in a reign.',
        objectives: [{ id: 'drawer', text: 'Open the FOOLS drawer in the palace archive', interact: 'obj:palace-fools-drawer', marker: { landmark: 'landmark:counting-house' } }],
        next: 'fennick',
      },
      {
        id: 'fennick', journal: 'An old licence on vellum, with a royal seal and a drawing of a man falling over in the margin.',
        objectives: [{ id: 'fennick', text: 'Bring the licence to Fennick', talk: FE, marker: { landmark: 'landmark:fennick-attic' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, skillPoints: 1, lore: ['lore:hc-fools-licence'] },
  },
  {
    ...A1, id: 'quest:jester-the-pantaloon-act', name: 'The Pantaloon Act', type: 'side', region: Z2, giver: FE,
    summary: 'Fennick’s straight man, Augustin Drabb, quit the act in C. 1012 to clerk in the Counting House, and has not smiled since. Fennick would like them on a stage one last time.',
    requires: req({ trust: FE, value: 'trusted' }, done('quest:jester-the-counting-house')), firstStage: 'drabb',
    stages: [
      {
        id: 'drabb', journal: 'Augustin Drabb clerks at the back of the Counting House, under a window, with his collar done up to the top.',
        objectives: [{ id: 'drabb', text: 'Ask Augustin Drabb back on stage', talk: 'npc:augustin-drabb', marker: { landmark: 'landmark:counting-house' } }],
        next: 'stage',
      },
      {
        id: 'stage', journal: 'The little stage in the Masquerade Quarter, tonight. Get the boards swept and the cushions down.',
        objectives: [{ id: 'stage', text: 'Set the stage for the Pantaloon Act', interact: 'obj:pantaloon-stage', marker: { landmark: 'landmark:worst-joke-stage' } }],
        next: 'fennick',
      },
      {
        id: 'fennick', journal: 'The house was full. Augustin Drabb smiled, once, at the very end, and the whole Quarter cheered for it.',
        objectives: [{ id: 'fennick', text: 'Find Fennick backstage', talk: FE, marker: { landmark: 'landmark:worst-joke-stage' } }],
        onComplete: [{ setFlag: 'jester.fennick_devotable', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:jester-bounty-velvet-fingers', name: 'Bounty: the Velvet Fingers', type: 'bounty', region: Z1, giver: 'npc:constable-prigg',
    summary: 'A gang of Cutpurses calling themselves the Velvet Fingers is working the Docks in matching gloves. The Harbour Watch would like the gloves, and the fingers in them.',
    requires: req(done('quest:jester-fennicks-pawn-ticket')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'They wear lilac gloves. Not subtle.', objectives: [{ id: 'purses', text: 'Defeat the Velvet Fingers', kill: 'bx_guile_0', count: 6, marker: { place: Z1 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 150 },
  },
  {
    ...A1, id: 'quest:jester-bounty-old-grin', name: 'Bounty: Old Grin', type: 'bounty', region: Z4, giver: 'npc:constable-prigg',
    summary: 'The wishing-well at the top of the Crooked Stairs has been taking coins, and wishers, for a month. It is a Mimic Slime. Locals call it Old Grin.',
    requires: req(done('quest:jester-the-counting-house')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'Do not make a wish.', objectives: [{ id: 'grin', text: 'Defeat Old Grin', kill: 'bx_guile_2', count: 1, marker: { place: Z4 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 120 },
  },

  // ======================= ACT II: the class thread (C-1 … C-6) + featured bearers
  {
    ...A2, id: 'quest:jester-lanternford', name: 'Lanternford', type: 'class', region: 'vil:ford', giver: 'npc:hester-glimmer',
    summary: 'Pell Odd, the peddler of the Morvane Road, says there are Tidecourt folk in Concordia, out in Morvane Marsh, selling lanterns that lead you only slightly into the water.',
    requires: req(done('quest:cc-through-the-arch')), autoStart: true, firstStage: 'ford',
    stages: [
      {
        id: 'ford', journal: 'You made the Velvet King laugh, honestly, and came through the Pawned Gate with the Court half singing. Now: Lanternford, on the edge of Morvane Marsh. The Guile exiles drink at the Will-o’-Wisp.',
        objectives: [{ id: 'hester', text: 'Find the Tidecourt folk at the Will-o’-Wisp in Lanternford', talk: 'npc:hester-glimmer', marker: { landmark: 'landmark:ford-will-o-wisp' } }],
        next: 'wall',
      },
      {
        id: 'wall', journal: 'Out the back of the Will-o’-Wisp, on the wall of the privy yard, the Tidecourt exiles have chalked every joke they brought with them from Velvet Harbour, so as not to lose them. Hester says a fool ought to read it.',
        objectives: [{ id: 'wall', text: 'Read the joke wall behind the Will-o’-Wisp', interact: 'obj:jester-joke-wall', marker: { landmark: 'landmark:jester-wisp-yard' } }],
        onComplete: [{ startQuest: 'quest:jester-the-queens-toll' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-guile-lanternford'] },
  },
  {
    ...A2, id: 'quest:jester-the-queens-toll', name: 'The Queen’s Toll', type: 'class', region: 'region:marsh', giver: 'npc:hester-glimmer',
    summary: 'Crossing Morvane Marsh to the old Guile embassy takes one of the Lantern Queen’s lights, and her lights cost a memory.',
    requires: req(done('quest:jester-lanternford')), firstStage: 'start',
    stages: [
      {
        id: 'start', journal: 'Hester says the honest way across is the long way, from light to light.',
        objectives: [],
        next: [
          { when: { flag: 'jester.jest', value: 'exchange' }, to: 'toll' },
          { to: 'lights' },
        ],
      },
      {
        id: 'lights', journal: 'Three of the Queen’s little lights stand on the black water between Lanternford and the embassy. Follow them.',
        objectives: [{ id: 'lights', text: 'Follow the Queen’s lights across the marsh', interact: 'obj:guile-marsh-light-*', count: 3, marker: { region: 'region:marsh' } }],
        next: 'toll',
      },
      {
        id: 'toll', journal: 'At the last light, a lantern burns on a post over the water, and the price of passage is written under it: one memory.',
        objectives: [{ id: 'toll', text: 'Pay the Queen’s toll', when: { flag: 'jester.toll_paid' }, marker: { region: 'region:marsh' } }],
        next: 'embassy',
      },
      {
        id: 'embassy', journal: 'Beyond the toll the water is deep and black, and the drowned lights of the old Guile embassy glow under it.',
        objectives: [{ id: 'lair', text: 'Go down to the drowned lights', reach: 'inst:sentinel-guile', marker: { region: 'region:marsh' } }],
        onComplete: [{ startQuest: 'quest:jester-the-lantern-queen' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:jester-the-lantern-queen', name: 'The Lantern Queen', type: 'class', region: 'region:marsh', giver: 'npc:hester-glimmer',
    summary: 'For a thousand years the Lantern Queen sold the crown’s road safe passage over Morvane Marsh. Now she sells the lights that lead into the water.',
    requires: req(done('quest:jester-the-queens-toll')), firstStage: 'fight',
    stages: [
      {
        id: 'fight', journal: 'The Lantern Queen is the Sentinel of the Guile school. Win her mark.',
        objectives: [{ id: 'queen', text: 'Defeat the Lantern Queen', kill: 'bx_lanternqueen', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-guile' }],
        next: 'release',
      },
      {
        id: 'release', journal: 'Her lanterns went out one by one, until only her own was left.',
        objectives: [{ id: 'mark', text: 'Hear the Lantern Queen out', when: { flag: 'story.sentinel.guile' } }],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'The Queen’s lights have gone out over Morvane Marsh, all of them at once. At Lanternford, Hester will be standing in the door of the Will-o’-Wisp wondering what happened to the competition.',
        objectives: [{ id: 'hester', text: 'Tell Hester the Lantern Queen is at rest', talk: 'npc:hester-glimmer', marker: { landmark: 'landmark:ford-will-o-wisp' } }],
        onComplete: [{ startQuest: 'quest:jester-sorrow-buys-the-silence' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-lantern-queen'] },
  },
  {
    ...A2, id: 'quest:jester-sorrow-buys-the-silence', name: 'Sorrow Buys the Silence', type: 'class', region: 'vil:shore', giver: 'npc:winnifred-sprat',
    summary: 'A fool in a white mask has been at Abbeyshore all week, buying up the drowned Abbey’s old bell-ropes from the Old Fish Mill. He pays very well, and he never laughs.',
    requires: req(done('quest:jester-the-lantern-queen')), firstStage: 'mill',
    stages: [
      {
        id: 'mill', journal: 'Winnifred Sprat keeps the Old Fish Mill at Abbeyshore, and she sold him the ropes.',
        objectives: [{ id: 'winnie', text: 'Ask at the Old Fish Mill', talk: 'npc:winnifred-sprat', marker: { landmark: 'landmark:shore-fish-mill' } }],
        next: 'ropes',
      },
      {
        id: 'ropes', journal: 'The last bell-rope he didn’t take is still coiled in the mill loft. Somebody has left a note on it.',
        objectives: [{ id: 'ropes', text: 'Look at the last bell-rope in the mill loft', interact: 'obj:jester-bell-rope', marker: { landmark: 'landmark:shore-fish-mill' } }],
        next: 'escort',
      },
      {
        id: 'escort', journal: 'Winnifred wants to show you where the Abbey lies, from the old lake steps where the bell-ringers used to go down to the water. She is eighty, and the shore is full of things that came up out of the lake hollow. Keep her alive.',
        onEnter: [{ escort: 'npc:winnifred-sprat', to: 'landmark:jester-lake-steps' }],
        objectives: [{ id: 'winnie', text: 'See Winnifred safely to the old lake steps', when: { any: [{ flag: 'escort.winnifred-sprat', op: '==', value: 'arrived' }, { flag: 'escort.winnifred-sprat', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:jester-lake-steps' } }],
        next: [{ when: { flag: 'escort.winnifred-sprat', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'hear' }],
      },
      {
        id: 'regroup', journal: 'Winnifred went down on the shingle, and two eel-men carried her back to the mill in a net, which she says is the most undignified thing to happen to her since her wedding. She has her stick and is waiting at the mill door.',
        onEnter: [{ escort: 'npc:winnifred-sprat', to: 'landmark:jester-lake-steps' }],
        objectives: [{ id: 'winnie', text: 'Try again: see Winnifred to the lake steps', when: { any: [{ flag: 'escort.winnifred-sprat', op: '==', value: 'arrived' }, { flag: 'escort.winnifred-sprat', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:jester-lake-steps' } }],
        next: [{ when: { flag: 'escort.winnifred-sprat', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'hear' }],
      },
      {
        id: 'hear', journal: 'Winnifred is standing on the top step, where the lake has come up over the rest, looking down into the water.',
        objectives: [{ id: 'winnie', text: 'Hear what Winnifred sees from the lake steps', talk: 'npc:winnifred-sprat', marker: { landmark: 'landmark:jester-lake-steps' } }],
        onComplete: [{ startQuest: 'quest:jester-abbess-morwen' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:jester-abbess-morwen', name: 'Abbess Morwen', type: 'class', region: 'region:abbey', giver: 'npc:winnifred-sprat',
    summary: 'Sorrow has gone down to the drowned nave with the bell-ropes, so the Bell can never be rung, and Abbess Morwen is glad of it. Her drowned choir has not laughed in thirty years.',
    requires: req(done('quest:jester-sorrow-buys-the-silence')), firstStage: 'nave',
    stages: [
      {
        id: 'nave', journal: 'Down into the drowned Abbey, where the choir still stands in its stalls under the lake.',
        objectives: [{ id: 'lair', text: 'Go down into the drowned nave', reach: 'inst:drowned-abbey', marker: { region: 'region:abbey' } }],
        onComplete: [{ openDialogue: 'dialogue:jester-choir-laughs' }],
        next: 'morwen',
      },
      {
        id: 'morwen', journal: 'Abbess Morwen is the Sentinel of Radiance and of Song. The Radiance bearers cannot win their mark while she holds the nave.',
        objectives: [{ id: 'morwen', text: 'Free Abbess Morwen', kill: 'bx_morwen', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-morwen' }, { setFlag: 'story.bearer.cantor', value: true }],
        next: 'ropes',
      },
      {
        id: 'ropes', journal: 'The Abbess is at rest, and the choir is quiet in its stalls. Sorrow’s bell-ropes are still coiled where she stood, and he tied something into them before he left.',
        objectives: [{ id: 'ropes', text: 'Look at the bell-ropes Sorrow left in the nave', interact: 'obj:jester-sorrow-ropes' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300 },
  },
  {
    ...A2, id: 'quest:jester-a-letter-by-gull', name: 'A Letter by Gull', type: 'class', region: 'vil:brind', giver: FE,
    summary: 'Something has flown in through the Guile arch with a letter, and is causing a scene at the Gate Circle.',
    requires: req(done('quest:jester-abbess-morwen')), autoStart: true, firstStage: 'letter',
    stages: [
      {
        id: 'letter', journal: 'A letter from Velvet Harbour has arrived at the Gate Circle, by air, with some ceremony.',
        objectives: [{ id: 'letter', text: 'Collect Fennick’s letter at the Gate Circle', when: { flag: 'jester.fennick_letter' }, marker: { landmark: 'landmark:gate-circle' } }],
        next: 'reply',
      },
      {
        id: 'reply', journal: 'Whatever brought Fennick’s letter is waiting by the chip stall at the Gate Circle, which is where anything from Velvet Harbour waits. It will take a reply home. Make it a good one. Fennick will read it to the gulls.',
        objectives: [{ id: 'reply', text: 'Send Fennick a reply from the chip stall', interact: 'obj:jester-reply-fennick', marker: { landmark: 'landmark:jester-chip-stall' } }],
        onComplete: [{ setFlag: 'story.act2_ready', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:jester-the-knight-who-wouldnt-laugh', name: 'The Knight Who Wouldn’t Laugh', type: 'side', region: 'vil:shore', giver: 'npc:bearer-oathbound',
    summary: 'The Oathbound bearer has sworn not to smile until the Concord is restored. At Abbeyshore the drowned choir has heard the oath, and is holding them to it, very hard.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'choir',
    stages: [
      {
        id: 'choir', journal: 'Ser Aldric Vow is on the Abbeyshore chapel steps, where the drowned choir sings up through the water, and their oath is getting heavier by the hour.',
        objectives: [{ id: 'steps', text: 'Go to the chapel steps with the Oathbound bearer', interact: 'obj:jester-oath-steps', marker: { landmark: 'landmark:shore-chapel' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Ser Aldric has something to say to you at the Stone Court, with a perfectly straight face.',
        objectives: [{ id: 'aldric', text: 'Talk to the Oathbound bearer', when: { any: [{ flag: 'jester.aldric_thanked' }, { partyHasClass: 'oathbound' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.oathbound', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A2, id: 'quest:jester-remember-the-punchline', name: 'Remember the Punchline', type: 'side', region: 'vil:ford', giver: 'npc:bearer-duskweaver',
    summary: 'The Duskweaver bearer has been paying the Lantern Queen’s tolls and losing a memory each time. Facts are slipping. Jokes, it turns out, stick.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'jokes',
    stages: [
      {
        id: 'jokes', journal: 'Lune Ashgrey wants to hang the things they mustn’t forget on jokes, and the jokes on lanterns, so the marsh can’t take them. Three lanterns, three jokes.',
        objectives: [{ id: 'jokes', text: 'Tell a joke to each of Lune’s lanterns', interact: 'obj:jester-punchline-lantern-*', count: 3, marker: { landmark: 'landmark:ford-lantern-shop' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Lune is at the Stone Court, telling themselves the jokes under their breath and laughing at the right places.',
        objectives: [{ id: 'lune', text: 'Talk to the Duskweaver bearer', when: { any: [{ flag: 'jester.lune_thanked' }, { partyHasClass: 'duskweaver' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.duskweaver', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  // ======================= ACT III: class quests (III-4 + 3 side)
  {
    ...A3, id: 'quest:jester-the-last-laugh', name: 'The Last Laugh', type: 'class', region: 'region:heart', giver: 'npc:casimir',
    summary: 'At the top of the Twelve Stairs waits the Union Chimera, a patchwork beast of every school. Its face is a white mask, and it is laughing with every laugh Harlequin Sorrow ever sold.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'herald',
    stages: [
      { id: 'herald', journal: 'At the Eve, Harlequin Sorrow, the Velvet King’s fool, took the Corsair’s Reef half and ran into the Heart. Now the Hollow King has bound him into the Chimera as its heart. Every laugh he ever sold on credit is being called in at once.', objectives: [{ id: 'herald', text: 'Face the Last Laugh', kill: 'cb_the-last-laugh', count: 1, marker: { landmark: 'landmark:twelve-stairs-top' } }], onComplete: [{ openDialogue: 'dialogue:jester-herald-fate' }], next: 'fate' },
      { id: 'fate', journal: 'The Chimera is down on the stair, still laughing. Behind the white mask, somebody is trying very hard not to cry.', objectives: [{ id: 'fate', text: 'Decide Sorrow’s fate', when: { flag: 'jester.nemesis_fate' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 3 },
  },
  {
    ...A3, id: 'quest:jester-the-joke-for-the-king', name: 'The Joke for the King', type: 'side', region: 'region:heart', giver: FE,
    summary: 'Nearly fifty years ago a little prince visited the Velvet Court and was the only child there who never laughed. Fennick wrote him a joke, and never got the chance to tell it.',
    requires: req({ flag: 'story.heart_open' }), autoStart: true, firstStage: 'letter',
    stages: [
      { id: 'letter', journal: 'Something from Velvet Harbour has found its way through the Weeping Wall to the Heart camp, with a letter.', objectives: [{ id: 'letter', text: 'Collect Fennick’s letter at the Heart camp', when: { flag: 'jester.king_joke' }, marker: { landmark: 'landmark:heart-camp' } }], next: 'tell' },
      { id: 'tell', journal: 'Fennick’s instructions are very clear. Stand on the top step, face the back row, speak up, and then fall over.', objectives: [{ id: 'tell', text: 'Tell Fennick’s joke at the Citadel doors', interact: 'obj:jester-citadel-step', marker: { landmark: 'landmark:twelve-stairs-top' } }], next: 'camp' },
      { id: 'camp', journal: 'Word of the joke on the top step has got down to the Heart camp before you, and the bearers want it told again, properly, from a crate, with the falling-over. Fennick would never forgive you if you said no.', objectives: [{ id: 'camp', text: 'Tell Fennick’s joke again from a crate at the Heart camp', interact: 'obj:jester-camp-crate', marker: { landmark: 'landmark:jester-camp-crate' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:jester-paid-in-full', name: 'Paid in Full', type: 'side', region: 'region:heart', giver: SO,
    summary: 'Sorrow’s best customers sold every grief they had, and walked into the Heart with nothing left to feel. They are standing in the Legion camp, smiling.',
    requires: req(done('quest:jester-the-last-laugh')), autoStart: true, firstStage: 'stair',
    stages: [
      { id: 'stair', journal: 'When the Chimera fell, black pearls poured from its sleeves all the way down the stair. Every one belongs to somebody. Gather them before the Legion treads them in.', objectives: [{ id: 'stair', text: 'Gather Sorrow’s pearls from the stair', interact: 'obj:jester-stair-pearls', marker: { landmark: 'landmark:jester-pearl-stair' } }], next: 'pearls' },
      { id: 'pearls', journal: 'When the Chimera fell, black pearls poured from its sleeves all down the stair. Your pockets are full of them, and every one belongs to somebody.', objectives: [{ id: 'pearls', text: 'Give Sorrow’s customers back their pearls', interact: 'obj:jester-legion-customers', marker: { landmark: 'landmark:legion-camp' } }], next: 'last' },
      { id: 'last', journal: 'One pearl is left in your pocket, and nobody in the Legion camp will take it. It is bigger than the rest, and very cold, and it has a white mask painted on it.', objectives: [{ id: 'last', text: 'Decide what to do with the last pearl', interact: 'obj:jester-last-pearl', marker: { landmark: 'landmark:heart-camp' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A3, id: 'quest:jester-gull-number-nine-goes-straight', name: 'Gull Number Nine Goes Straight', type: 'side', region: 'region:heart', giver: 'npc:gull-number-nine-concordia',
    summary: 'Gull Number Nine followed you through the Weeping Wall. Now a Black Tear Knight has followed Gull Number Nine out of the Legion camp, without its plume.',
    requires: req(done('quest:heart-legion'), done('quest:jester-gull-number-nine')), autoStart: true, firstStage: 'knight',
    stages: [
      { id: 'knight', journal: 'A Black Tear Knight is stalking round the Heart camp, bare-helmed, looking under the tents. It is looking for a gull.', objectives: [{ id: 'knight', text: 'Stop the plumeless Black Tear Knight', kill: 'bx_concord_2', count: 1, marker: { landmark: 'landmark:heart-camp' } }], next: 'gull' },
      { id: 'gull', journal: 'Gull Number Nine is sitting on a tent-pole with an enormous black plume, looking innocent.', objectives: [{ id: 'gull', text: 'Have a word with Gull Number Nine', talk: 'npc:gull-number-nine-concordia', marker: { landmark: 'landmark:heart-camp' } }], next: 'plume' },
      { id: 'plume', journal: 'The plume belongs to the knight, and the knight is not getting up again. In the Legion camp the Black Tear Knights keep a rack where their helms stand empty. The plume should go back on its own.', objectives: [{ id: 'plume', text: 'Return the plume to the knight’s helm in the Legion camp', interact: 'obj:jester-plume-rack', marker: { landmark: 'landmark:legion-camp' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
];

export default quests;
