/**
 * Hollow Crown: the CORSAIR campaign (docs/lore/hollow-crown/06-outlines/guile.md). Act I on Gallows Reef
 * (area:guile-frontier) and the Act II class thread in Concordia. Owner: Claude 4.
 */
import type { NarrativeCondition, QuestDef } from '@/core';

const CS: NarrativeCondition = { heroClass: 'corsair' };
const done = (q: `quest:${string}`): NarrativeCondition => ({ questCompleted: q });
const req = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: [CS, ...c] });
const A1 = { act: 'act1' as const, campaign: 'corsair', chapter: 'Gallows Reef' };
const A2 = { act: 'act2' as const, campaign: 'corsair', chapter: 'Concordia' };
const A3 = { act: 'act3' as const, campaign: 'corsair', chapter: 'The Heart' };
const Z1 = 'zone:guile-frontier-1' as const, Z2 = 'zone:guile-frontier-2' as const, Z3 = 'zone:guile-frontier-3' as const, Z4 = 'zone:guile-frontier-4' as const;
const L1 = 'inst:guile-frontier-lair-1' as const, L2 = 'inst:guile-frontier-lair-2' as const, L3 = 'inst:guile-frontier-lair-3' as const;
const DB = 'npc:dot-brine' as const, SA = 'npc:saltmarsh' as const;

const quests: QuestDef[] = [
  // ======================= ACT I: main (I-1 … I-10)
  {
    ...A1, id: 'quest:corsair-the-bell-over-the-water', name: 'The Bell over the Water', type: 'main', region: Z1, giver: DB,
    summary: 'Night in the Brine Market. Captain Dot Brine was slipping the Overdraft’s moorings to dodge a creditor when a bell rang under the sea, and every ship’s bell in the market rang back.',
    requires: CS, autoStart: true, firstStage: 'deck',
    stages: [
      {
        id: 'deck', journal: 'The creditor sent Cutpurses after the Overdraft, and they are coming over the rail. The deck is swaying. So are you.',
        onEnter: [{ openDialogue: 'dialogue:corsair-bell-night' }],
        objectives: [{ id: 'boarders', text: 'Throw the Cutpurses off the Overdraft', kill: 'bx_guile_0', count: 4, marker: { landmark: 'landmark:the-overdraft' } }],
        next: 'dot',
      },
      {
        id: 'dot', journal: 'The deck is clear. The black pearls in the hold are humming one note, and so is your chest.',
        objectives: [{ id: 'dot', text: 'Report to Captain Dot', talk: DB, marker: { landmark: 'landmark:the-overdraft' } }],
        onComplete: [{ setFlag: 'corsair.bell_heard', value: true }],
        next: 'lines',
      },
      {
        id: 'lines', journal: 'Dot wants the Overdraft cast off before the creditor comes back with more friends: the bow line, the stern line, and the one she tied in a temper.',
        objectives: [{ id: 'lines', text: 'Cast off the Overdraft’s mooring lines', interact: 'obj:corsair-mooring-line-*', count: 3, marker: { landmark: 'landmark:the-overdraft' } }],
        next: 'hold',
      },
      {
        id: 'hold', journal: 'The Overdraft is drifting free in the dark. Dot says there is something in the hold you ought to hear.',
        objectives: [{ id: 'hold', text: 'Go down into the Overdraft’s hold', interact: 'obj:corsair-hold-pearls', marker: { landmark: 'landmark:the-overdraft' } }],
        onComplete: [{ startQuest: 'quest:corsair-dots-creditors' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-tidecourt', 'lore:hc-brine-fleet'] },
  },
  {
    ...A1, id: 'quest:corsair-dots-creditors', name: 'Dot’s Creditors', type: 'main', region: Z1, giver: DB,
    summary: 'Dot would like you to go round the floating market and “renegotiate” her debts. This mostly means hiding behind barrels.',
    requires: req(done('quest:corsair-the-bell-over-the-water')), firstStage: 'creditors',
    stages: [
      {
        id: 'creditors', journal: 'Three creditors in the Brine Market, and three good barrels to hide behind.',
        objectives: [{ id: 'barrels', text: 'Renegotiate with Dot’s creditors', interact: 'obj:creditor-barrel-*', count: 3, marker: { place: Z1 } }],
        next: 'divers',
      },
      {
        id: 'divers', journal: 'Every creditor wants paying in black pearls now, nothing else. At the edge of the market the divers who bring the pearls up are sitting in a row.',
        objectives: [{ id: 'divers', text: 'Look at the pearl-divers at the market’s edge', interact: 'obj:market-edge-divers', marker: { place: Z1 } }],
        next: 'dot',
      },
      {
        id: 'dot', journal: 'They sit smiling at the water, empty as shells.',
        objectives: [{ id: 'dot', text: 'Tell Dot what the creditors want', talk: DB, marker: { landmark: 'landmark:the-overdraft' } }],
        onComplete: [{ startQuest: 'quest:corsair-vexs-guildhold' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40, lore: ['lore:hc-black-pearls'] },
  },
  {
    ...A1, id: 'quest:corsair-vexs-guildhold', name: 'Vex’s Guildhold', type: 'main', region: Z2, giver: DB,
    summary: 'Guildmaster Vex of the Thieves’ Exchange has bought up all of Dot’s paper in one morning, seized the Overdraft and towed her to his sea-fort off the reef. Steal her back.',
    requires: req(done('quest:corsair-dots-creditors')), firstStage: 'gate',
    stages: [
      {
        id: 'gate', journal: 'Vex’s Guildhold sits on a rock off Gallows Reef with its cannons pointing at the Fleet. The Overdraft is moored under its walls.',
        objectives: [{ id: 'gate', text: 'Row out to Vex’s Guildhold', reach: 'landmark:vex-guildhold-gate', marker: { landmark: 'landmark:vex-guildhold-gate' } }],
        next: 'fort',
      },
      {
        id: 'fort', journal: 'Over the wall, quietly. Mind the cannons. They fire on a timer.',
        objectives: [{ id: 'fort', text: 'Get into the Guildhold', reach: L1, marker: { landmark: 'landmark:vex-guildhold-gate' } }],
        next: 'vex',
      },
      {
        id: 'vex', journal: 'Vex is on the ramparts with his ledger open. Every time it closes, he calls in more Cutpurses.',
        objectives: [{ id: 'vex', text: 'Defeat Guildmaster Vex', kill: 'bx_guile_3', count: 1 }],
        next: 'line',
      },
      {
        id: 'line', journal: 'The Overdraft is chained to the fort by a tow-line as thick as your leg.',
        objectives: [{ id: 'line', text: 'Cut the Overdraft’s tow-line', interact: 'obj:overdraft-tow-line' }],
        next: 'dot',
      },
      {
        id: 'dot', journal: 'The Overdraft is free, and drifting back to the reef on the tide with you on her.',
        objectives: [{ id: 'dot', text: 'Bring the Overdraft home to Dot', talk: DB, marker: { landmark: 'landmark:the-overdraft' } }],
        onComplete: [{ setFlag: 'corsair.overdraft_back', value: true }, { startQuest: 'quest:corsair-the-pearl-admiral' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 80, hcItems: [{ item: 'w_dagger_steel' }] },
  },
  {
    ...A1, id: 'quest:corsair-the-pearl-admiral', name: 'The Pearl Admiral', type: 'main', region: Z2, giver: SA,
    summary: 'A white flagship has sailed into Gallows Reef. Its admiral bought every one of Dot’s debts in an afternoon, and forgave them with a smile.',
    requires: req(done('quest:corsair-vexs-guildhold')), firstStage: 'flagship',
    stages: [
      {
        id: 'flagship', journal: 'Admiral Saltmarsh’s white flagship is moored at the deep-water berth, and he has asked for the Overdraft’s newest hand by name.',
        objectives: [{ id: 'saltmarsh', text: 'Go aboard the white flagship', talk: SA, marker: { landmark: 'landmark:white-flagship-berth' } }],
        next: 'paid',
      },
      {
        id: 'paid', journal: 'Before you tell Dot, see for yourself how the Admiral paid off her creditors in the Brine Market in a single afternoon.',
        objectives: [{ id: 'paid', text: 'Call on Dot’s paid-off creditors', interact: 'obj:corsair-paid-creditor-*', count: 3, marker: { place: Z1 } }],
        next: 'dot',
      },
      {
        id: 'dot', journal: 'He smells of lavender, he wears one black pearl in one ear, and he has offered the Fleet honest work.',
        objectives: [{ id: 'dot', text: 'Tell Dot what the Admiral offers', talk: DB, marker: { landmark: 'landmark:the-overdraft' } }],
        onComplete: [{ setFlag: 'corsair.saltmarsh_met', value: true }, { startQuest: 'quest:corsair-the-pearl-charter' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-saltmarsh'] },
  },
  {
    ...A1, id: 'quest:corsair-the-pearl-charter', name: 'The Pearl Charter', type: 'main', region: Z2, giver: DB,
    summary: 'Saltmarsh offers the free captains a charter to carry his pearls. The Velvet Court has sent letters of marque to raid them instead. Either way, somebody buys the Fleet.',
    requires: req(done('quest:corsair-the-pearl-admiral')), firstStage: 'canvass',
    stages: [
      {
        id: 'canvass', journal: 'Dot said: before the moot, ask the two oldest hands on the reef what they would take for their freedom. Captain Merrin Tusk is at the hat-gibbets. Barnaby Quill mends nets at the end of the Brine Market.',
        objectives: [
          { id: 'tusk', text: 'Ask Captain Merrin Tusk about the charter', talk: 'npc:merrin-tusk', marker: { landmark: 'landmark:hat-gibbets' } },
          { id: 'quill', text: 'Ask Barnaby Quill about the charter', talk: 'npc:barnaby-quill', marker: { landmark: 'landmark:quill-net-loft' } },
        ],
        next: 'moot',
      },
      {
        id: 'moot', journal: 'The Fleet’s captains are meeting under the hat-gibbets at sunset. You have a voice, and a chest that hums, and they have all heard about the chest.',
        objectives: [{ id: 'moot', text: 'Speak at the Fleet moot under the gibbets', when: { flag: 'corsair.charter' }, marker: { landmark: 'landmark:hat-gibbets' } }],
        next: 'after',
      },
      {
        id: 'after', journal: 'Whatever the Fleet chose, there are false lights burning in the Wreckers’ Coves tonight.',
        objectives: [],
        onComplete: [{ startQuest: 'quest:corsair-the-merry-widow' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A1, id: 'quest:corsair-the-merry-widow', name: 'The Wreck of the Merry Widow', type: 'main', region: Z3, giver: DB,
    summary: 'False lanterns in the Wreckers’ Coves are luring pearl barges onto the rocks, and the ghost ship Merry Widow comes out of the fog for the cargo.',
    requires: req(done('quest:corsair-the-pearl-charter')), firstStage: 'lights',
    stages: [
      {
        id: 'lights', journal: 'Three false lanterns on the cove rocks, burning with a cold pearl-light. Put them out.',
        objectives: [{ id: 'lights', text: 'Douse the false lanterns in the coves', interact: 'obj:false-lantern-*', count: 3, marker: { place: Z3 } }],
        onComplete: [{ openDialogue: 'dialogue:corsair-widow-fog' }],
        next: 'wreck',
      },
      {
        id: 'wreck', journal: 'The Merry Widow is aground in the biggest cove, rigging dripping black, and her captain has no face.',
        objectives: [{ id: 'wreck', text: 'Board the Wreck of the Merry Widow', reach: L2, marker: { landmark: 'landmark:merry-widow-wreck' } }],
        next: 'nobody',
      },
      {
        id: 'nobody', journal: 'You cannot strike a man with no name. Read it off the wreck between his lanterns, and call him by it.',
        objectives: [{ id: 'nobody', text: 'Defeat Captain Nobody', kill: 'cb_captain-nobody', count: 1 }],
        next: 'contract',
      },
      {
        id: 'contract', journal: 'For a moment he is a man again, and he is holding out a paper.',
        objectives: [{ id: 'contract', text: 'Take Captain Nobody’s contract', interact: 'obj:nobody-contract' }],
        onComplete: [{ setFlag: 'corsair.nobodys_name', value: true }, { startQuest: 'quest:corsair-what-the-admiral-sells' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 120, lore: ['lore:hc-nobodys-contract'] },
  },
  {
    ...A1, id: 'quest:corsair-what-the-admiral-sells', name: 'What the Admiral Sells', type: 'main', region: Z4, giver: DB,
    summary: 'Captain Nobody sold his name for a ship, forty years ago, to a nameless wharf-boy. The name was Saltmarsh. On the Crow Islands, Thief Crows are hoarding the Admiral’s pearls.',
    requires: req(done('quest:corsair-the-merry-widow')), firstStage: 'hoard',
    stages: [
      {
        id: 'hoard', journal: 'The biggest Thief Crow nest on the islands is crammed with black pearls, every one stamped with a white flag.',
        objectives: [{ id: 'hoard', text: 'Search the Thief Crows’ hoard', interact: 'obj:crow-pearl-hoard', marker: { place: Z4 } }],
        next: 'huts',
      },
      {
        id: 'huts', journal: 'Below the nest, in a row of huts, islanders sit weeping into bowls. A sign says GRIEF RATIONS.',
        objectives: [{ id: 'huts', text: 'Go down to the grief-ration huts', reach: 'landmark:grief-ration-huts', marker: { landmark: 'landmark:grief-ration-huts' } }],
        next: 'rations',
      },
      {
        id: 'rations', journal: 'Three huts in a row, a weeping islander in each, and a slate on every wall. Look inside before the Admiral sees you.',
        objectives: [{ id: 'huts', text: 'Look inside the grief-ration huts', interact: 'obj:corsair-ration-hut-*', count: 3, marker: { landmark: 'landmark:grief-ration-huts' } }],
        next: 'saltmarsh',
      },
      {
        id: 'saltmarsh', journal: 'The Admiral is walking down the row of huts, kindly, with a ledger, collecting the bowls.',
        objectives: [{ id: 'saltmarsh', text: 'Confront Admiral Saltmarsh', talk: SA, marker: { landmark: 'landmark:grief-ration-huts' } }],
        onComplete: [{ setFlag: 'corsair.saltmarsh_turned', value: true }, { startQuest: 'quest:corsair-the-gallows' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A1, id: 'quest:corsair-the-gallows', name: 'The Gallows', type: 'main', region: L3, giver: DB,
    summary: 'The Reef half of the Guile stone hangs in the topmost cage of the Gallows, the great gibbet-rock at the reef’s heart. Saltmarsh is climbing it, and the tide is coming in.',
    requires: req(done('quest:corsair-what-the-admiral-sells')), firstStage: 'rock',
    stages: [
      {
        id: 'rock', journal: 'Up the gibbet-rock with the tide at your heels. The cages swing in the wind like pendulums.',
        objectives: [{ id: 'rock', text: 'Climb the Gallows', reach: L3, marker: { place: Z2 } }],
        next: 'saltmarsh',
      },
      {
        id: 'saltmarsh', journal: 'The tide rises a tier with every phase. His pearls hatch into Mimic Slimes. The pearl in his ear is swelling.',
        objectives: [{ id: 'saltmarsh', text: 'Defeat Admiral Saltmarsh', kill: 'cb_admiral-saltmarsh', count: 1 }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'Saltmarsh dived from the top tier and came up by his flagship. In the topmost cage, half a crystal is singing.',
        objectives: [{ id: 'stone', text: 'Take the Reef half from the topmost cage', interact: 'obj:guile-frontier-halfstone' }],
        onComplete: [{ setFlag: 'corsair.halfstone', value: true }, { startQuest: 'quest:corsair-dots-reckoning' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, skillPoints: 1, lore: ['lore:hc-half-stones'] },
  },
  {
    ...A1, id: 'quest:corsair-dots-reckoning', name: 'Dot’s Reckoning', type: 'main', region: Z1, giver: DB,
    summary: 'Saltmarsh is running for the Pawned Gate’s water-arch. The Overdraft can catch him, if she can get past whoever is waiting to turn her back.',
    requires: req(done('quest:corsair-the-gallows')), firstStage: 'dot',
    stages: [
      {
        id: 'dot', journal: 'Dot is at the Overdraft’s wheel, with her hat pulled down and her parrot on her shoulder.',
        objectives: [{ id: 'dot', text: 'Talk to Dot at the wheel', talk: DB, marker: { landmark: 'landmark:the-overdraft' } }],
        next: 'blockade',
      },
      {
        id: 'blockade', journal: 'Boats across the channel, and boarders coming over the side.',
        objectives: [{ id: 'boarders', text: 'Break the blockade', kill: 'bx_guile_0', count: 4 }],
        next: 'buoy',
      },
      {
        id: 'buoy', journal: 'At the channel mouth rocks the Last Bell, the buoy every free captain rings once on the way out of Gallows Reef. Nobody has rung it in thirty years.',
        objectives: [{ id: 'buoy', text: 'Ring the Last Bell at the channel mouth', interact: 'obj:corsair-last-bell', marker: { landmark: 'landmark:corsair-last-bell' } }],
        next: 'sail',
      },
      {
        id: 'sail', journal: 'Open water, and the Pawned Gate’s water-arch ahead.',
        objectives: [{ id: 'gate', text: 'Sail for the Pawned Gate', reach: 'area:guile-gate', marker: { place: 'area:guile-gate' } }],
        onComplete: [{ startQuest: 'quest:corsair-the-pawned-gate' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:corsair-the-pawned-gate', name: 'The Pawned Gate (sea side)', type: 'main', region: 'area:guile-gate', giver: DB,
    summary: 'The Velvet King rides at anchor in the Pawned Gate’s water-arch on a gilded barge, waiting to sell passage to the Hollow King.',
    requires: req(done('quest:corsair-dots-reckoning')), firstStage: 'king',
    stages: [
      {
        id: 'king', journal: 'A broadside duel, then boarding. Break the barge’s pearl plating with the Overdraft’s guns before you can reach him.',
        objectives: [{ id: 'king', text: 'Defeat the Velvet King', kill: 'bx_guile_5', count: 1 }],
        next: 'deed',
      },
      {
        id: 'deed', journal: 'The barge has lifted free of its pearls and floats high. On the water beside it, a sheet of vellum is drifting: the deed to the Pawned Gate.',
        objectives: [{ id: 'deed', text: 'Fish the gate’s deed out of the water', interact: 'obj:pawned-gate-deed' }],
        next: 'gate',
      },
      {
        id: 'gate', journal: 'The water-arch weeps black. Beyond it, somewhere, Saltmarsh is already through.',
        objectives: [{ id: 'seal', text: 'Open the Pawned Gate with the Reef half', interact: 'obj:guile-gate-seal' }],
        onComplete: [{ setFlag: 'story.gate_open', value: true }, { setFlag: 'story.act', value: 2 }, { setFlag: 'corsair.act1_done', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 200, lore: ['lore:hc-realm-gates', 'lore:hc-pawned-gate'] },
  },

  // ======================= ACT I: side quests (2 per zone)
  {
    ...A1, id: 'quest:corsair-everything-must-go', name: 'Everything Must Go', type: 'side', region: Z1, giver: 'npc:salvage-sal',
    summary: 'Salvage Sal is selling her own ship plank by plank while standing on it. She is down to the deck, the mast and the bit she is standing on.',
    requires: req(done('quest:corsair-the-bell-over-the-water')), firstStage: 'buyers',
    stages: [
      {
        id: 'buyers', journal: 'Find Sal a buyer for the mast and a buyer for the deck, before she has to start selling the water.',
        objectives: [
          { id: 'netty', text: 'Sell the rigging to Netty Hawser', talk: 'npc:netty-hawser', marker: { landmark: 'landmark:thousand-knot' } },
          { id: 'gilly', text: 'Sell the deck to Bosun Rackham', talk: 'npc:gilly-rackham', marker: { landmark: 'landmark:brine-market-board' } },
        ],
        next: 'sal',
      },
      {
        id: 'sal', journal: 'Rigging sold, deck sold. Sal is standing on one plank and a barrel.',
        objectives: [{ id: 'sal', text: 'Tell Sal she’s sold out', talk: 'npc:salvage-sal', marker: { landmark: 'landmark:sals-last-plank' } }],
        next: 'plank',
      },
      {
        id: 'plank', journal: 'Sal will not sell the last plank. It came off her mother’s ship, the Overdraft’s sister, and she wants it to go on sailing. Dot’s starboard rail has always been one board short.',
        objectives: [{ id: 'plank', text: 'Fit Sal’s last plank into the Overdraft’s rail', interact: 'obj:corsair-overdraft-patch', marker: { landmark: 'landmark:the-overdraft' } }],
        onComplete: [{ setFlag: 'corsair.sal_plank', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50 },
  },
  {
    ...A1, id: 'quest:corsair-the-thousand-knot', name: 'The Thousand Knot', type: 'side', region: Z1, giver: 'npc:netty-hawser',
    summary: 'Every ship in the Brine Market is lashed to every other by one great knot, tied the night the gate shut so nobody would be left behind. Thief Crows are picking it apart.',
    requires: req(done('quest:corsair-the-bell-over-the-water')), firstStage: 'crows',
    stages: [
      {
        id: 'crows', journal: 'Drive the crows off the knot before they unpick the market.',
        objectives: [{ id: 'crows', text: 'Drive off the Thief Crows', kill: 'bx_guile_1', count: 3, marker: { landmark: 'landmark:thousand-knot' } }],
        next: 'retie',
      },
      {
        id: 'retie', journal: 'Three strands pulled loose. Netty says retie them the old way, saying the words.',
        objectives: [{ id: 'strands', text: 'Retie the Thousand Knot', interact: 'obj:thousand-knot-strand-*', count: 3, marker: { landmark: 'landmark:thousand-knot' } }],
        next: 'netty',
      },
      {
        id: 'netty', journal: 'The knot is whole. The market creaks, all together, like a ship settling.',
        objectives: [{ id: 'netty', text: 'Tell Netty the knot holds', talk: 'npc:netty-hawser', marker: { landmark: 'landmark:thousand-knot' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_rope' }], lore: ['lore:hc-thousand-knot'] },
  },
  {
    ...A1, id: 'quest:corsair-the-hat-on-the-gibbet', name: 'The Hat on the Gibbet', type: 'side', region: Z2, giver: 'npc:merrin-tusk',
    summary: 'The Fleet stopped hanging people thirty years ago. Now it hangs a hat for every captain lost at sea. Captain Merrin Tusk’s hat has been stolen a week before the memorial night.',
    requires: req(done('quest:corsair-dots-creditors')), firstStage: 'crows',
    stages: [
      {
        id: 'crows', journal: 'The Thief Crows on the reef have been seen with hats. Several hats. One crow is wearing one.',
        objectives: [{ id: 'crows', text: 'Chase down the hat-stealing crows', kill: 'bx_guile_1', count: 2, marker: { landmark: 'landmark:hat-gibbets' } }],
        next: 'hat',
      },
      {
        id: 'hat', journal: 'A crow’s nest on the gibbet beam, lined with hats. One of them is a captain’s tricorne with a tusk badge.',
        objectives: [{ id: 'hat', text: 'Take Captain Tusk’s hat from the nest', interact: 'obj:tusk-hat', marker: { landmark: 'landmark:hat-gibbets' } }],
        next: 'tusk',
      },
      {
        id: 'tusk', journal: 'The hat is a little pecked, and very much his.',
        objectives: [{ id: 'tusk', text: 'Bring Merrin Tusk his hat', talk: 'npc:merrin-tusk', marker: { landmark: 'landmark:hat-gibbets' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 60 },
  },
  {
    ...A1, id: 'quest:corsair-a-message-in-a-pearl', name: 'A Message in a Pearl', type: 'side', region: Z2, giver: 'npc:ione-sculpin',
    summary: 'Ione Sculpin brought up a black pearl that whispers when you hold it to your ear: “Just one more, and they’ll let me sleep.” She wants to know who wept it.',
    requires: req(done('quest:corsair-dots-creditors')), firstStage: 'listen',
    stages: [
      {
        id: 'listen', journal: 'Hold the pearl up and listen again, carefully, for anything else.',
        objectives: [{ id: 'pearl', text: 'Listen to the whispering pearl', interact: 'obj:whispering-pearl', marker: { landmark: 'landmark:hat-gibbets' } }],
        next: 'weeper',
      },
      {
        id: 'weeper', journal: 'Under the words, faintly, the cry of Thief Crows, and a hut door banging. The Crow Islands.',
        objectives: [{ id: 'ruel', text: 'Find who wept the pearl', talk: 'npc:ruel-tregaskis', marker: { landmark: 'landmark:grief-ration-huts' } }],
        next: 'ione',
      },
      {
        id: 'ione', journal: 'An old islander called Ruel Tregaskis, on grief rations, who weeps a pearl a day so that they will let him sleep.',
        objectives: [{ id: 'ione', text: 'Tell Ione who wept it', talk: 'npc:ione-sculpin', marker: { landmark: 'landmark:hat-gibbets' } }],
        onComplete: [{ setFlag: 'corsair.pearl_weeper', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 60 },
  },
  {
    ...A1, id: 'quest:corsair-the-wreckers-daughter', name: 'The Wrecker’s Daughter', type: 'side', region: Z3, giver: 'npc:nell-gant',
    summary: 'Little Nell Gant keeps a lantern lit in the Wreckers’ Coves every night for her father, who went out on a wrecking night and never came home.',
    requires: req(done('quest:corsair-the-pearl-admiral')), firstStage: 'lantern',
    stages: [
      {
        id: 'lantern', journal: 'Nell’s lantern is on the high rock at the cove mouth. She can’t reach it to fill it any more. She has grown, but the rock hasn’t.',
        objectives: [{ id: 'lantern', text: 'Fill Nell’s lantern on the high rock', interact: 'obj:nell-lantern', marker: { landmark: 'landmark:nell-gant-cottage' } }],
        next: 'nell',
      },
      {
        id: 'nell', journal: 'From the high rock you can see the Merry Widow in the fog. There are men on her deck who are not quite there.',
        objectives: [{ id: 'nell', text: 'Talk to Nell', talk: 'npc:nell-gant', marker: { landmark: 'landmark:nell-gant-cottage' } }],
        next: 'wait',
      },
      {
        id: 'wait', journal: 'Her father crews the Merry Widow. Whatever is holding that ship, it is holding him too.',
        objectives: [{ id: 'wait', text: 'Free the Merry Widow’s crew', when: { flag: 'corsair.nobodys_name' } }],
        next: 'home',
      },
      {
        id: 'home', journal: 'Someone is walking up from the coves towards Nell’s cottage, wet through, very slowly.',
        objectives: [{ id: 'abel', text: 'Meet the man walking home', talk: 'npc:abel-gant', marker: { landmark: 'landmark:nell-gant-cottage' } }],
        onComplete: [{ setFlag: 'corsair.gant_home', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50 },
  },
  {
    ...A1, id: 'quest:corsair-ma-colleys-lights', name: 'Ma Colley’s Lights', type: 'side', region: Z3, giver: 'npc:ma-colley',
    summary: 'Ma Colley rents out wreckers’ lanterns by the hour. Someone has been paying her in black pearls to keep a row of them lit all night, every night, and she would like to know who.',
    requires: req(done('quest:corsair-the-pearl-admiral')), firstStage: 'ledger',
    stages: [
      {
        id: 'ledger', journal: 'Ma Colley’s hire ledger. The pearl-payer signs with a little drawing of a flag.',
        objectives: [{ id: 'ledger', text: 'Read Ma Colley’s hire ledger', interact: 'obj:colley-hire-ledger', marker: { landmark: 'landmark:colley-lantern-stall' } }],
        next: 'watch',
      },
      {
        id: 'watch', journal: 'The payment is left on the stall counter after dark. Watch for who leaves it.',
        objectives: [{ id: 'watch', text: 'Watch Ma Colley’s stall at night', when: { flag: 'corsair.colley_payer' }, marker: { landmark: 'landmark:colley-lantern-stall' } }],
        next: 'colley',
      },
      {
        id: 'colley', journal: 'A deckhand in white, from the white flagship, with a purse of pearls and a list of which coves to light.',
        objectives: [{ id: 'colley', text: 'Tell Ma Colley who pays her', talk: 'npc:ma-colley', marker: { landmark: 'landmark:colley-lantern-stall' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_lantern' }] },
  },
  {
    ...A1, id: 'quest:corsair-the-crow-who-stole-a-crown', name: 'The Crow Who Stole a Crown', type: 'side', region: Z4, giver: 'npc:ruel-tregaskis',
    summary: 'A Thief Crow on the Crow Islands has a tiny crown in its nest, and Ruel Tregaskis swears it is one of the crown jewels of Tidecourt.',
    requires: req(done('quest:corsair-the-merry-widow')), firstStage: 'nest',
    stages: [
      {
        id: 'nest', journal: 'The crow lives on the tallest stack on the islands, and it is not sharing.',
        objectives: [{ id: 'crow', text: 'Drive the crow off its nest', kill: 'bx_guile_1', count: 1, marker: { place: Z4 } }],
        next: 'crown',
      },
      {
        id: 'crown', journal: 'In the nest, between a spoon and a button, a crown the size of a bracelet.',
        objectives: [{ id: 'crown', text: 'Take the tiny crown from the nest', interact: 'obj:crow-nest-crown', marker: { place: Z4 } }],
        next: 'ruel',
      },
      {
        id: 'ruel', journal: 'It is engraved inside with three names, and three dates.',
        objectives: [{ id: 'ruel', text: 'Show Ruel the crown', talk: 'npc:ruel-tregaskis', marker: { landmark: 'landmark:grief-ration-huts' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 90, lore: ['lore:hc-thrice-sold-crown'] },
  },
  {
    ...A1, id: 'quest:corsair-pennywhistles-map', name: 'Pennywhistle’s Map', type: 'side', region: Z4, giver: 'npc:pennywhistle',
    summary: 'Captain Pennywhistle has a treasure map, a spade and a bad back. Seven paces from the dead tree, three from the rock that looks like a duck.',
    requires: req(done('quest:corsair-dots-creditors')), firstStage: 'dig',
    stages: [
      {
        id: 'dig', journal: 'There is a dead tree. There is a rock that looks, if you squint, like a duck.',
        objectives: [{ id: 'dig', text: 'Dig where the map says', interact: 'obj:pennywhistle-x', marker: { place: Z4 } }],
        next: 'chest',
      },
      {
        id: 'chest', journal: 'A chest. It has teeth. It is apologising.',
        objectives: [{ id: 'chest', text: 'Deal with the sorry chest', interact: 'obj:pennywhistle-chest', marker: { place: Z4 } }],
        next: 'penny',
      },
      {
        id: 'penny', journal: 'Pennywhistle will want to know what was in it.',
        objectives: [{ id: 'penny', text: 'Tell Captain Pennywhistle', talk: 'npc:pennywhistle', marker: { landmark: 'landmark:pennywhistle-camp' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_map' }] },
  },

  // ======================= ACT I: mentor thread (2) and bounties (2)
  {
    ...A1, id: 'quest:corsair-the-first-article', name: 'The First Article', type: 'side', region: Z2, giver: DB,
    summary: 'Dot’s hat is lined with the Brine Fleet’s original articles, which she stole off the Exchange in C. 1012 so nobody could sell them. The first page is missing, and she has a fair idea where.',
    requires: req({ trust: DB, value: 'friendly' }, done('quest:corsair-vexs-guildhold')), firstStage: 'page',
    stages: [
      {
        id: 'page', journal: 'Dot says Vex had the first page framed in his strongroom as a joke. His strongroom is empty now, and the frame went to the hat-gibbets with his things.',
        objectives: [{ id: 'page', text: 'Find the first page of the Fleet’s articles', interact: 'obj:first-article-page', marker: { landmark: 'landmark:hat-gibbets' } }],
        next: 'dot',
      },
      {
        id: 'dot', journal: 'One page, framed, a little water-stained, with Article One at the top.',
        objectives: [{ id: 'dot', text: 'Bring the page to Dot', talk: DB, marker: { landmark: 'landmark:the-overdraft' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, skillPoints: 1, lore: ['lore:hc-fleet-articles'] },
  },
  {
    ...A1, id: 'quest:corsair-quills-price', name: 'Quill’s Price', type: 'side', region: Z1, giver: DB,
    summary: 'Dot owes one debt she can’t pay in coin, to her old first mate Barnaby Quill, who lost a leg pulling her out of the sea and won’t take money. Find out what he will take.',
    requires: req({ trust: DB, value: 'trusted' }, done('quest:corsair-the-pearl-admiral')), firstStage: 'quill',
    stages: [
      {
        id: 'quill', journal: 'Barnaby Quill mends nets on the end of the Brine Market and does not look up.',
        objectives: [{ id: 'quill', text: 'Ask Barnaby Quill his price', talk: 'npc:barnaby-quill', marker: { landmark: 'landmark:quill-net-loft' } }],
        next: 'voyage',
      },
      {
        id: 'voyage', journal: 'One more voyage. One night’s sail round the reef with Dot at the wheel and him at the bow, the way it used to be.',
        objectives: [{ id: 'helm', text: 'Take the Overdraft out with Dot and Quill', interact: 'obj:overdraft-helm', marker: { landmark: 'landmark:the-overdraft' } }],
        next: 'dot',
      },
      {
        id: 'dot', journal: 'They sailed all night and argued about every knot. Dot is at the rail at dawn, with her hat off.',
        objectives: [{ id: 'dot', text: 'Talk to Dot', talk: DB, marker: { landmark: 'landmark:the-overdraft' } }],
        onComplete: [{ setFlag: 'corsair.dot_devotable', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:corsair-bounty-parliament-of-pockets', name: 'Bounty: the Parliament of Pockets', type: 'bounty', region: Z4, giver: 'npc:gilly-rackham',
    summary: 'A flock of Thief Crows on the Crow Islands has learned to empty pockets in formation. The islanders call it the Parliament of Pockets.',
    requires: req(done('quest:corsair-dots-creditors')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'Keep your hands in your pockets. Keep your pockets in your hands.', objectives: [{ id: 'crows', text: 'Break up the Parliament of Pockets', kill: 'bx_guile_1', count: 6, marker: { place: Z4 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 150 },
  },
  {
    ...A1, id: 'quest:corsair-bounty-barnacle-mimic', name: 'Bounty: the Barnacle Mimic', type: 'bounty', region: Z3, giver: 'npc:gilly-rackham',
    summary: 'A Mimic Slime has moved into the strongbox of a wreck in the Wreckers’ Coves and grown barnacles. Three salvagers have opened it. Three salvagers are owed new hands.',
    requires: req(done('quest:corsair-the-pearl-admiral')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'It is the only strongbox in the coves that is smiling.', objectives: [{ id: 'mimic', text: 'Defeat the Barnacle Mimic', kill: 'bx_guile_2', count: 1, marker: { place: Z3 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 120 },
  },

  // ======================= ACT II: the class thread (C-1 … C-6) + featured bearers
  {
    ...A2, id: 'quest:corsair-lanternford', name: 'The Smugglers of Lanternford', type: 'class', region: 'vil:ford', giver: 'npc:hester-glimmer',
    summary: 'Black pearls lie like gravel in the lee of the Guile arch, and somebody has been raking them up. The trail leads to Lanternford, where the Bog Market runs on them.',
    requires: req(done('quest:cc-through-the-arch')), autoStart: true, firstStage: 'ford',
    stages: [
      {
        id: 'ford', journal: 'Lanternford, on the edge of Morvane Marsh. The Tidecourt exiles drink at the Will-o’-Wisp.',
        objectives: [{ id: 'hester', text: 'Find the Tidecourt folk at the Will-o’-Wisp', talk: 'npc:hester-glimmer', marker: { landmark: 'landmark:ford-will-o-wisp' } }],
        next: 'market',
      },
      {
        id: 'market', journal: 'Hester says to see the Bog Market for yourself before you go asking anybody anything. The Tidecourt exiles weigh black pearls there on an old fish-scale, by the pound, like sprats.',
        objectives: [{ id: 'scales', text: 'Look at the pearl scales in the Bog Market', interact: 'obj:corsair-bog-scales', marker: { landmark: 'landmark:ford-bog-market' } }],
        next: 'pell',
      },
      {
        id: 'pell', journal: 'Hester says the pearls in the Bog Market come through Pell Odd, and Pell buys his from a man with a white flag.',
        objectives: [{ id: 'pell', text: 'Ask Pell Odd where he buys his pearls', talk: 'npc:pell', marker: { landmark: 'landmark:brind-market' } }],
        onComplete: [{ startQuest: 'quest:corsair-the-queens-toll' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-guile-lanternford'] },
  },
  {
    ...A2, id: 'quest:corsair-the-queens-toll', name: 'The Queen’s Toll', type: 'class', region: 'region:marsh', giver: 'npc:hester-glimmer',
    summary: 'Crossing Morvane Marsh to the old Guile embassy takes one of the Lantern Queen’s lights, and her lights cost a memory. Dot would have had a word or two to say about that price.',
    requires: req(done('quest:corsair-lanternford')), firstStage: 'start',
    stages: [
      {
        id: 'start', journal: 'Hester says the honest way across is the long way, from light to light.',
        objectives: [],
        next: [
          { when: { flag: 'corsair.charter', value: 'signed' }, to: 'toll' },
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
        objectives: [{ id: 'toll', text: 'Pay the Queen’s toll', when: { flag: 'corsair.toll_paid' }, marker: { region: 'region:marsh' } }],
        next: 'embassy',
      },
      {
        id: 'embassy', journal: 'Beyond the toll the water is deep and black, and the drowned lights of the old Guile embassy glow under it.',
        objectives: [{ id: 'lair', text: 'Go down to the drowned lights', reach: 'inst:sentinel-guile', marker: { region: 'region:marsh' } }],
        onComplete: [{ startQuest: 'quest:corsair-the-lantern-queen' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:corsair-the-lantern-queen', name: 'The Lantern Queen', type: 'class', region: 'region:marsh', giver: 'npc:hester-glimmer',
    summary: 'For a thousand years the Lantern Queen sold the crown’s road safe passage over Morvane Marsh, at an honest price. Now she sells the lights that lead into the water.',
    requires: req(done('quest:corsair-the-queens-toll')), firstStage: 'fight',
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
        id: 'tell', journal: 'Every light over Morvane Marsh went out at once when the Queen let go of her last one. Peregrine Tolley makes lanterns at Lanternford for a living, and he has just lost his only competition. He ought to hear it from you.',
        objectives: [{ id: 'peregrine', text: 'Tell Peregrine Tolley the Queen’s lights are out', talk: 'npc:peregrine-tolley', marker: { landmark: 'landmark:ford-lantern-shop' } }],
        onComplete: [{ startQuest: 'quest:corsair-the-admirals-cargo' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-lantern-queen'] },
  },
  {
    ...A2, id: 'quest:corsair-the-admirals-cargo', name: 'The Admiral’s Cargo', type: 'class', region: 'vil:gild', giver: 'npc:rosie-mossop',
    summary: 'Barges of black pearls are coming up the gold-silt to Gildport and going straight down into the Gilded Ruins. The dockers say the man selling them flies a white flag.',
    requires: req(done('quest:corsair-the-lantern-queen')), firstStage: 'rosie',
    stages: [
      {
        id: 'rosie', journal: 'Rosie Mossop runs the Gildport dock gang, and her dockers unload the pearl barges.',
        objectives: [{ id: 'rosie', text: 'Ask the dock ganger at Gildport', talk: 'npc:rosie-mossop', marker: { landmark: 'landmark:gild-gilded-row' } }],
        next: 'barge',
      },
      {
        id: 'barge', journal: 'The last pearl barge of the day is tied up below Gilded Row, waiting to be unloaded into the Ruins.',
        objectives: [{ id: 'barge', text: 'Search the pearl barge', interact: 'obj:corsair-pearl-barge', marker: { landmark: 'landmark:gild-gilded-row' } }],
        next: 'escort',
      },
      {
        id: 'escort', journal: 'Rosie has unloaded the Admiral’s pearls for a month and never once seen where they go. She wants to follow the empty carts to the cart-head at the mouth of the Gilded Ruins, and the gold-silt between is full of things that have gone hollow. Keep her alive.',
        onEnter: [{ escort: 'npc:rosie-mossop', to: 'landmark:corsair-cart-head' }],
        objectives: [{ id: 'rosie', text: 'Bring Rosie Mossop safely to the cart-head', when: { any: [{ flag: 'escort.rosie-mossop', op: '==', value: 'arrived' }, { flag: 'escort.rosie-mossop', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:corsair-cart-head' } }],
        next: [{ when: { flag: 'escort.rosie-mossop', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'hear' }],
      },
      {
        id: 'regroup', journal: 'Rosie went down in the gold-silt, and her gang carried her back to Gilded Row in an empty pearl-cart, which she calls the worst insult of her working life. She has put on fresh gloves and is waiting.',
        onEnter: [{ escort: 'npc:rosie-mossop', to: 'landmark:corsair-cart-head' }],
        objectives: [{ id: 'rosie', text: 'Try again: bring Rosie to the cart-head', when: { any: [{ flag: 'escort.rosie-mossop', op: '==', value: 'arrived' }, { flag: 'escort.rosie-mossop', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:corsair-cart-head' } }],
        next: [{ when: { flag: 'escort.rosie-mossop', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'hear' }],
      },
      {
        id: 'hear', journal: 'Rosie is standing at the cart-head, where the carts tip their pearls down a chute into the dark, watching one go.',
        objectives: [{ id: 'rosie', text: 'Hear what Rosie sees at the cart-head', talk: 'npc:rosie-mossop', marker: { landmark: 'landmark:corsair-cart-head' } }],
        onComplete: [{ startQuest: 'quest:corsair-the-gilded-engine' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:corsair-the-gilded-engine', name: 'The Gilded Engine', type: 'class', region: 'region:gilded', giver: 'npc:rosie-mossop',
    summary: 'Saltmarsh is selling his pearls to the Gilded Engine, which burns them to forge the Black Concord. He is the Hollow King’s merchant now.',
    requires: req(done('quest:corsair-the-admirals-cargo')), firstStage: 'ruins',
    stages: [
      {
        id: 'ruins', journal: 'Down into the Gilded Ruins, where the Engine still runs, buried in the gold of the Sparkwright city.',
        objectives: [{ id: 'lair', text: 'Go down into the Gilded Ruins', reach: 'inst:sentinel-iron', marker: { region: 'region:gilded' } }],
        next: 'engine',
      },
      {
        id: 'engine', journal: 'The Gilded Engine is the Sentinel of the Iron school. The Iron bearers cannot win their mark while Saltmarsh’s pearls keep it burning. Board it like a ship.',
        objectives: [{ id: 'engine', text: 'Stop the Gilded Engine', kill: 'bx_engine', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-iron' }, { setFlag: 'story.bearer.knight', value: true }],
        next: 'fitting',
      },
      {
        id: 'fitting', journal: 'The Engine is still. Saltmarsh’s two tailors in grey left in a hurry, and their pattern-book is lying open on the cold anvil.',
        objectives: [{ id: 'book', text: 'Read the tailors’ pattern-book', interact: 'obj:corsair-engine-pattern-book' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-engine'] },
  },
  {
    ...A2, id: 'quest:corsair-a-bottle-from-dot', name: 'A Bottle from Dot', type: 'class', region: 'vil:brind', giver: DB,
    summary: 'Something has come through the Guile arch from Gallows Reef with a letter: a parrot, if you were lucky, or a bottle, if you weren’t.',
    requires: req(done('quest:corsair-the-gilded-engine')), autoStart: true, firstStage: 'letter',
    stages: [
      {
        id: 'letter', journal: 'A letter from the Overdraft is waiting at the Gate Circle.',
        objectives: [{ id: 'letter', text: 'Collect Dot’s letter at the Gate Circle', when: { flag: 'corsair.dot_letter' }, marker: { landmark: 'landmark:gate-circle' } }],
        next: 'reply',
      },
      {
        id: 'reply', journal: 'Dot expects an answer to every letter she sends, from everybody but her creditors. Whatever brought hers is waiting in the lee of the Guile arch to carry one home.',
        objectives: [{ id: 'reply', text: 'Send Dot a reply from the Guile arch', interact: 'obj:corsair-reply-bottle', marker: { landmark: 'landmark:gate-circle' } }],
        onComplete: [{ setFlag: 'story.act2_ready', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:corsair-the-lantern-bargain', name: 'The Lantern Bargain', type: 'side', region: 'vil:ford', giver: 'npc:bearer-rimecaller',
    summary: 'The Rimecaller bearer wants to buy one of the Lantern Queen’s lights from the Lantern Shop at Lanternford, because it holds a frozen memory of her mother. She has never haggled in her life.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'shop',
    stages: [
      {
        id: 'shop', journal: 'Ilse Winterbourne is at the Lantern Shop counter, staring at one lantern on the top shelf.',
        objectives: [{ id: 'shop', text: 'Help the Rimecaller bearer at the Lantern Shop', interact: 'obj:corsair-mother-lantern', marker: { landmark: 'landmark:ford-lantern-shop' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Ilse has gone back to the Stone Court to think, which she says is what Rimecallers do instead of crying.',
        objectives: [{ id: 'ilse', text: 'Talk to the Rimecaller bearer', when: { any: [{ flag: 'corsair.ilse_thanked' }, { partyHasClass: 'rimecaller' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.rimecaller', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A2, id: 'quest:corsair-union-rates', name: 'Union Rates', type: 'side', region: 'vil:gild', giver: 'npc:bearer-juggernaut',
    summary: 'The Juggernaut bearer is organising the Gildport dockers who unload Saltmarsh’s pearls for the Engine. They want a Corsair to read the books, because nobody else can.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'ledger',
    stages: [
      {
        id: 'ledger', journal: 'Hamm Ironsides has got hold of the dock office ledger, and is holding it upside down.',
        objectives: [{ id: 'ledger', text: 'Read the Gildport dock ledger with the Juggernaut bearer', interact: 'obj:corsair-dock-ledger', marker: { landmark: 'landmark:gild-gilded-row' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'The dockers have downed tools, and Hamm wants a word at the Stone Court.',
        objectives: [{ id: 'hamm', text: 'Talk to the Juggernaut bearer', when: { any: [{ flag: 'corsair.hamm_thanked' }, { partyHasClass: 'juggernaut' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.juggernaut', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  // ======================= ACT III: class quests (III-4 + 3 side)
  {
    ...A3, id: 'quest:corsair-saltmarshs-last-sale', name: 'Saltmarsh’s Last Sale', type: 'class', region: 'region:heart', giver: 'npc:casimir',
    summary: 'At the top of the Twelve Stairs waits the Union Chimera, its hide crusted with pearls and barnacles. Its face is the figurehead of a white flagship, and it smells of lavender.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'herald',
    stages: [
      { id: 'herald', journal: 'The Hollow King has bound Saltmarsh into the Chimera as its heart. Between blows it offers, very politely, to buy your grief.', objectives: [{ id: 'herald', text: 'Face Saltmarsh’s Last Sale', kill: 'cb_saltmarshs-last-sale', count: 1, marker: { landmark: 'landmark:twelve-stairs-top' } }], onComplete: [{ openDialogue: 'dialogue:corsair-herald-fate' }], next: 'fate' },
      { id: 'fate', journal: 'The Chimera lies on the stair like a wreck on a reef. The figurehead is still smiling, and the pearl in its ear is the size of a fist.', objectives: [{ id: 'fate', text: 'Decide Saltmarsh’s fate', when: { flag: 'corsair.nemesis_fate' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 3 },
  },
  {
    ...A3, id: 'quest:corsair-dots-iou', name: 'Dot’s IOU', type: 'side', region: 'region:heart', giver: DB,
    summary: 'Dot Brine has never in her life paid a debt she could get out of. She has sent one to the Heart anyway, made out to the Hollow King.',
    requires: req({ flag: 'story.heart_open' }), autoStart: true, firstStage: 'iou',
    stages: [
      { id: 'iou', journal: 'Something from Gallows Reef has come through the Weeping Wall to find you at the Heart camp.', objectives: [{ id: 'iou', text: 'Collect Dot’s IOU at the Heart camp', when: { flag: 'corsair.dot_iou' }, marker: { landmark: 'landmark:heart-camp' } }], next: 'witness' },
      { id: 'witness', journal: 'Dot has signed for the whole Brine Fleet, which nobody has ever let her do. An apology from the Fleet wants a second captain’s mark beside hers, and there are Tidecourt hats among the Legion’s ranks.', objectives: [{ id: 'captain', text: 'Find a Brine Fleet captain in the Legion camp to witness the IOU', interact: 'obj:corsair-legion-captain', marker: { landmark: 'landmark:legion-camp' } }], next: 'door' },
      { id: 'door', journal: 'A debt is delivered by hand, Dot says, and read aloud. The Citadel doors stand open at the top of the stairs.', objectives: [{ id: 'door', text: 'Deliver Dot’s IOU at the Citadel doors', interact: 'obj:corsair-citadel-door', marker: { landmark: 'landmark:twelve-stairs-top' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:corsair-the-white-flagship', name: 'The White Flagship', type: 'side', region: 'region:heart', giver: SA,
    summary: 'A white ship is sailing round and round the Weeping Wall on the black water at its foot. Her crew are Saltmarsh’s, and they are hollow, and nobody has told them to stop.',
    requires: req({ flag: 'story.heart_open' }), autoStart: true, firstStage: 'board',
    stages: [
      { id: 'board', journal: 'Every so often the white flagship comes round the Wall past the Heart camp, close enough to board.', objectives: [{ id: 'board', text: 'Take the white flagship and set her crew ashore', interact: 'obj:corsair-white-flagship', marker: { landmark: 'landmark:heart-camp' } }], next: 'cabin' },
      { id: 'cabin', journal: 'The white flagship lies aground below the Heart camp with the Admiral’s cabin door standing open. A man who buys everything keeps the receipts.', objectives: [{ id: 'cabin', text: 'Search the Admiral’s cabin', interact: 'obj:corsair-flagship-cabin', marker: { landmark: 'landmark:corsair-flagship-aground' } }], next: 'crew' },
      { id: 'crew', journal: 'The flagship’s crew have walked up out of the shallows and fallen in at the back of the Legion’s ranks, because standing in a line is all anybody has told them to do in thirty years. Their bills of sale are in your pocket.', objectives: [{ id: 'crew', text: 'Give the flagship’s crew back their papers in the Legion camp', interact: 'obj:corsair-flagship-crew', marker: { landmark: 'landmark:legion-camp' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A3, id: 'quest:corsair-nobodys-name', name: 'Nobody’s Name', type: 'side', region: 'region:heart', giver: 'npc:captain-nobody',
    summary: 'Captain Nobody sold his name for a ship forty years ago. His ghost has followed the contract all the way to the Heart, to see what became of it.',
    requires: req(done('quest:corsair-saltmarshs-last-sale')), autoStart: true, firstStage: 'nobody',
    stages: [
      { id: 'nobody', journal: 'A ghost captain with no face is standing at the head of the Guile stair, turning his hat in his hands.', objectives: [{ id: 'nobody', text: 'Speak to Captain Nobody at the top of the stairs', talk: 'npc:captain-nobody', marker: { landmark: 'landmark:twelve-stairs-top' } }], next: 'widow' },
      { id: 'widow', journal: 'A black ship with rotten sails and no lights has come round the Weeping Wall on the black water, following her captain: the Merry Widow. Her bell is still aboard.', objectives: [{ id: 'widow', text: 'Board the Merry Widow below the Weeping Wall', interact: 'obj:corsair-widow-heart', marker: { landmark: 'landmark:corsair-widow-mooring' } }], next: 'bell' },
      { id: 'bell', journal: '“Wen’s bell. Ring it twice for supper.” The Heart camp has a cook-fire, a great many hungry bearers and nothing to call them with.', objectives: [{ id: 'bell', text: 'Hang the Merry Widow’s bell at the Heart camp and ring it', interact: 'obj:corsair-camp-bell', marker: { landmark: 'landmark:heart-camp' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
];

export default quests;
