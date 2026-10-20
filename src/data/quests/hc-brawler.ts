/**
 * Hollow Crown: the BRAWLER campaign (docs/lore/hollow-crown/06-outlines/fist.md). Act I in the Lowfold Pits
 * (area:fist-frontier) and the Act II class thread in Concordia. Act III class quests land with the Heart.
 * Built on the Ash reference (10-campaign-style.md). Owner: Claude 4.
 */
import type { NarrativeCondition, QuestDef } from '@/core';

const BW: NarrativeCondition = { heroClass: 'brawler' };
const done = (q: `quest:${string}`): NarrativeCondition => ({ questCompleted: q });
const req = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: [BW, ...c] });
const A1 = { act: 'act1' as const, campaign: 'brawler', chapter: 'The Lowfold Pits' };
const A2 = { act: 'act2' as const, campaign: 'brawler', chapter: 'Concordia' };
const A3 = { act: 'act3' as const, campaign: 'brawler', chapter: 'The Heart' };
const Z1 = 'zone:fist-frontier-1' as const, Z2 = 'zone:fist-frontier-2' as const, Z3 = 'zone:fist-frontier-3' as const, Z4 = 'zone:fist-frontier-4' as const;
const L1 = 'inst:fist-frontier-lair-1' as const, L2 = 'inst:fist-frontier-lair-2' as const, L3 = 'inst:fist-frontier-lair-3' as const;
const TK = 'npc:tobiah-knuckle' as const, SG = 'npc:silas-gaunt' as const;

const quests: QuestDef[] = [
  // ======================= ACT I: main (I-1 … I-10)
  {
    ...A1, id: 'quest:brawler-the-bell-in-round-three', name: 'The Bell in Round Three', type: 'main', region: Z1, giver: TK,
    summary: 'A night bout in a Knuckletown village ring. Round three, and you were winning on points, when the bell rang.',
    requires: BW, autoStart: true, firstStage: 'bout',
    stages: [
      {
        id: 'bout', journal: 'Round three, ahead on points. The bell rang. The round bell, surely. Turn for your corner.',
        onEnter: [{ openDialogue: 'dialogue:brawler-bout-night' }],
        objectives: [{ id: 'corner', text: 'Turn for your corner of the ring', interact: 'obj:village-ring-corner', marker: { landmark: 'landmark:knuckletown-village-ring' } }],
        next: 'pops',
      },
      {
        id: 'pops', journal: 'It was not the round bell. You are flat on the canvas, something is singing in your chest, and Pops, the old man with the noodle cart, is fanning you with his menu.',
        objectives: [{ id: 'pops', text: 'Get up, and talk to Pops', talk: TK, marker: { landmark: 'landmark:knuckletown-village-ring' } }],
        onComplete: [{ setFlag: 'brawler.bell_heard', value: true }],
        next: 'cart',
      },
      {
        id: 'cart', journal: 'Pops has packed up his bucket and is pushing his noodle cart home through Knuckletown, very slowly, because one wheel squeaks and he refuses to oil it. He expects you to push the other side.',
        objectives: [{ id: 'cart', text: 'Help Pops push his noodle cart home', reach: 'landmark:pops-noodle-cart', marker: { landmark: 'landmark:pops-noodle-cart' } }],
        next: 'stock',
      },
      {
        id: 'stock', journal: 'Pops’s cart, parked in its alley for the night. The stock-pot is still simmering, the way it has every night since before you were born. He has put out two bowls.',
        objectives: [{ id: 'pops', text: 'Eat a midnight bowl with Pops at his cart', talk: TK, marker: { landmark: 'landmark:pops-noodle-cart' } }],
        onComplete: [{ startQuest: 'quest:brawler-noodles-and-debts' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-mountainreach', 'lore:hc-lowfold-pits'] },
  },
  {
    ...A1, id: 'quest:brawler-noodles-and-debts', name: 'Noodles and Debts', type: 'main', region: Z1, giver: TK,
    summary: 'Pops has agreed to work your corner, for a bowl of noodles a week. In return you deliver his noodles, and collect on his little book of small debts.',
    requires: req(done('quest:brawler-the-bell-in-round-three')), firstStage: 'round',
    stages: [
      {
        id: 'round', journal: 'Three deliveries, three debts, all in Knuckletown. Pops’s book says they owe him four coppers between them and a ladle.',
        objectives: [{ id: 'doors', text: 'Deliver noodles and collect Pops’s debts', interact: 'obj:noodle-door-*', count: 3, marker: { place: Z1 } }],
        next: 'look',
      },
      {
        id: 'look', journal: 'Three locked doors, and black under every one. Before you go back to Pops, look harder: at the step, at the window, at what was pushed under the door.',
        objectives: [{ id: 'look', text: 'Look round the three locked doors', interact: 'obj:brawler-door-clue-*', count: 3, marker: { place: Z1 } }],
        next: 'pops',
      },
      {
        id: 'pops', journal: 'Three fighters who lost in the outlaw rings last month. Three locked doors. Black tears under every one.',
        objectives: [{ id: 'pops', text: 'Tell Pops about the locked doors', talk: TK, marker: { landmark: 'landmark:pops-noodle-cart' } }],
        onComplete: [{ startQuest: 'quest:brawler-the-broken-fist-dojo' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:brawler-the-broken-fist-dojo', name: 'The Broken Fist Dojo', type: 'main', region: Z3, giver: TK,
    summary: 'The Master of the Broken Fist takes in young fighters who have lost. They come out of his dojo hollow-eyed and very obedient.',
    requires: req(done('quest:brawler-noodles-and-debts')), firstStage: 'door',
    stages: [
      {
        id: 'door', journal: 'The dojo is up on the Goat Paths. He threw a Lowfold final for a bag of coin twenty years ago, and nobody has fought him since.',
        objectives: [{ id: 'enter', text: 'Walk into the Broken Fist Dojo', reach: L1, marker: { landmark: 'landmark:broken-fist-dojo-door' } }],
        onComplete: [{ openDialogue: 'dialogue:brawler-master-bows' }],
        next: 'master',
      },
      {
        id: 'master', journal: 'His right hand was broken in the thrown final and never set. He fights with the other: feints, sand, low blows. Beat him clean.',
        objectives: [{ id: 'master', text: 'Beat the Master of the Broken Fist', kill: 'bx_fist_3', count: 1 }],
        next: 'students',
      },
      {
        id: 'students', journal: 'His students are kneeling in rows, perfectly still, waiting to be told what to do next.',
        objectives: [{ id: 'students', text: 'Send the Master’s students home', interact: 'obj:dojo-students' }],
        onComplete: [{ setFlag: 'brawler.dojo_closed', value: true }, { startQuest: 'quest:brawler-the-promoters-offer' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 80, hcItems: [{ item: 'a_fist_leather_hands' }] },
  },
  {
    ...A1, id: 'quest:brawler-the-promoters-offer', name: 'The Promoter’s Offer', type: 'main', region: Z2, giver: SG,
    summary: 'Word of the dojo has gone round the Pits. A man in a silk scarf has paid for the damage, and would like to shake your hand in front of everybody.',
    requires: req(done('quest:brawler-the-broken-fist-dojo')), firstStage: 'silas',
    stages: [
      {
        id: 'silas', journal: 'The whole of the Lowfold Pits has turned out at the gate of the Grand Pit to see who the Promoter is shaking hands with.',
        objectives: [{ id: 'silas', text: 'Meet the Promoter at the Grand Pit gate', talk: SG, marker: { landmark: 'landmark:grand-pit-gate' } }],
        onComplete: [{ setFlag: 'brawler.silas_met', value: true }],
        next: 'crowd',
      },
      {
        id: 'crowd', journal: 'The whole of the Pits is talking about you and the man in the silk scarf. Walk through the crowd on your way to Pops and hear what they say about him.',
        objectives: [{ id: 'crowd', text: 'Hear what the Pits say about Silas Gaunt', interact: 'obj:brawler-pit-talk-*', count: 3, marker: { place: Z2 } }],
        next: 'pops',
      },
      {
        id: 'pops', journal: 'A title shot at the Grand Pit, the purse paid in advance. Pops will have an opinion. Pops always has an opinion.',
        objectives: [{ id: 'pops', text: 'Tell Pops about the offer', talk: TK, marker: { landmark: 'landmark:pops-noodle-cart' } }],
        onComplete: [{ startQuest: 'quest:brawler-whose-purse' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 60, lore: ['lore:hc-pit-leagues'] },
  },
  {
    ...A1, id: 'quest:brawler-whose-purse', name: 'Whose Purse', type: 'main', region: Z2, giver: TK,
    summary: 'The Pit Leagues want you to fight for the League belt. The King’s Climbers, down from the peaks recruiting, want you to clear the outlaw rings with them by force. Everyone wants to know who you are fighting for.',
    requires: req(done('quest:brawler-the-promoters-offer')), firstStage: 'canvass',
    stages: [
      {
        id: 'canvass', journal: 'Before you choose a purse, ask the two people in the Lowfold who know best what a purse costs: the cutwoman who stitches the losers, and the only honest bookie in the valley.',
        objectives: [
          { id: 'doc', text: 'Ask Doc Lint what a purse costs', talk: 'npc:saffie-lint', marker: { landmark: 'landmark:doc-lint-tent' } },
          { id: 'abigail', text: 'Ask Honest Abigail what a purse costs', talk: 'npc:abigail-tuck', marker: { landmark: 'landmark:abigail-book-stall' } },
        ],
        next: 'vote',
      },
      {
        id: 'vote', journal: 'The League stewards and the Climbers have both turned up at Pops’s noodle cart, and neither of them is leaving until you choose.',
        objectives: [{ id: 'vote', text: 'Choose whose purse you fight for', when: { flag: 'brawler.purse' }, marker: { landmark: 'landmark:pops-noodle-cart' } }],
        next: 'dawn',
      },
      {
        id: 'dawn', journal: 'By dawn the whole Lowfold will know whose purse you chose. The Grand Pit gate is where the news goes up first.',
        objectives: [{ id: 'gate', text: 'See the Grand Pit gate at dawn', interact: 'obj:brawler-purse-dawn', marker: { landmark: 'landmark:grand-pit-gate' } }],
        onComplete: [{ startQuest: 'quest:brawler-big-mother-ox' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-kings-climbers'] },
  },
  {
    ...A1, id: 'quest:brawler-big-mother-ox', name: 'Big Mother Ox', type: 'main', region: Z2, giver: TK,
    summary: 'Either way the road goes through the Grand Pit, and Big Mother Ox has been its champion for nineteen years. She cannot lie down any more.',
    requires: req(done('quest:brawler-whose-purse')), firstStage: 'why',
    stages: [
      {
        id: 'why', journal: 'You have chosen.', objectives: [],
        next: [
          { when: { flag: 'brawler.purse', value: 'climbers' }, to: 'climbers' },
          { when: { flag: 'brawler.purse', value: 'names' }, to: 'names' },
          { to: 'league' },
        ],
      },
      {
        id: 'league', journal: 'The League has sponsored your title shot. Pops has a corner stool with his name on it. Big Mother Ox is waiting in the Grand Pit.',
        objectives: [{ id: 'gate', text: 'Go to the Grand Pit for the title bout', reach: 'landmark:grand-pit-gate', marker: { landmark: 'landmark:grand-pit-gate' } }],
        next: 'pit',
      },
      {
        id: 'climbers', journal: 'The Climbers mean to take the Grand Pit for the King, and its champion will not stand aside. You are marching in at the front.',
        objectives: [{ id: 'gate', text: 'March on the Grand Pit with the Climbers', reach: 'landmark:grand-pit-gate', marker: { landmark: 'landmark:grand-pit-gate' } }],
        next: 'pit',
      },
      {
        id: 'names', journal: 'You are fighting the title bout for no purse at all, only for the names of the ones he sold. The Promoter has come to watch in person.',
        objectives: [{ id: 'gate', text: 'Go to the Grand Pit for the title bout', reach: 'landmark:grand-pit-gate', marker: { landmark: 'landmark:grand-pit-gate' } }],
        next: 'pit',
      },
      {
        id: 'pit', journal: 'The Grand Pit, every bench full.',
        objectives: [{ id: 'enter', text: 'Step into the Grand Pit', reach: L2, marker: { landmark: 'landmark:grand-pit-gate' } }],
        next: 'ox',
      },
      {
        id: 'ox', journal: 'Knock her down and she gets back up. The tears pool under her feet like roots and will not let her fall. In the last round, stop hitting.',
        objectives: [{ id: 'ox', text: 'Face Big Mother Ox', kill: 'cb_big-mother-ox', count: 1 }],
        next: 'catch',
      },
      {
        id: 'catch', journal: 'She is falling at last. Somebody has to catch her.',
        objectives: [{ id: 'catch', text: 'Catch Big Mother Ox, and sit her down', interact: 'obj:ox-corner-stool' }],
        onComplete: [{ setFlag: 'brawler.ox_rests', value: true }, { startQuest: 'quest:brawler-sold-by-the-head' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 120, lore: ['lore:hc-grand-pit'] },
  },
  {
    ...A1, id: 'quest:brawler-sold-by-the-head', name: 'Sold by the Head', type: 'main', region: Z4, giver: TK,
    summary: 'Big Mother Ox told you what Silas does with losers. The missing fighters’ trail runs into the Quarry Rings, and under the Stair Gate.',
    requires: req(done('quest:brawler-big-mother-ox')), firstStage: 'trail',
    stages: [
      {
        id: 'trail', journal: 'Big Mother Ox says the missing fighters were taken down into the Quarry Rings after their last bouts. Follow what they left behind.',
        objectives: [{ id: 'trail', text: 'Follow the missing fighters’ trail into the Quarry Rings', interact: 'obj:brawler-fighter-trail-*', count: 3, marker: { place: Z4 } }],
        next: 'tunnel',
      },
      {
        id: 'tunnel', journal: 'In the deepest quarry there is a tunnel that seeps black, running towards the Stair Gate.',
        objectives: [{ id: 'tunnel', text: 'Find the quarry tunnel', interact: 'obj:quarry-tunnel-mouth', marker: { place: Z4 } }],
        next: 'silas',
      },
      {
        id: 'silas', journal: 'Silas Gaunt is at the tunnel mouth, counting heads into a ledger. He waves to you with his pen.',
        objectives: [{ id: 'silas', text: 'Confront Silas at the tunnel', talk: SG, marker: { place: Z4 } }],
        onComplete: [{ setFlag: 'brawler.silas_turned', value: true }],
        next: 'pops',
      },
      {
        id: 'pops', journal: 'Silas has gone down to his Quarry Throne. Before you follow, Pops has to hear what his old fighter has become. He will want to hear it from you.',
        objectives: [{ id: 'pops', text: 'Tell Pops what Silas is doing', talk: TK, marker: { landmark: 'landmark:pops-noodle-cart' } }],
        onComplete: [{ startQuest: 'quest:brawler-the-quarry-throne' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-silas-gaunt'] },
  },
  {
    ...A1, id: 'quest:brawler-the-quarry-throne', name: 'The Quarry Throne', type: 'main', region: L3, giver: TK,
    summary: 'The Pit half of the Fist stone lies on the seat of Silas’s Quarry Throne, and he means to build the only ring in the Lowfold where nobody goes hollow, and charge for it.',
    requires: req(done('quest:brawler-sold-by-the-head')), firstStage: 'descend',
    stages: [
      {
        id: 'descend', journal: 'Down into the deepest quarry, where the outlaw rings are loudest. Your half-stone is pounding like a second heart.',
        objectives: [{ id: 'enter', text: 'Go down to the Quarry Throne', reach: L3, marker: { place: Z4 } }],
        next: 'silas',
      },
      {
        id: 'silas', journal: 'He does not fight fair, and he does not fight alone. Do not knock his fighters out: they are the people you came for. Push them out of the ring.',
        objectives: [{ id: 'silas', text: 'Beat Silas Gaunt, the Promoter', kill: 'cb_silas-gaunt', count: 1 }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'Silas rode the quarry crane-lift up and away towards the Stair Gate. The Pit half is on the seat of his throne, singing.',
        objectives: [{ id: 'stone', text: 'Take the Pit half from the throne', interact: 'obj:fist-frontier-halfstone' }],
        onComplete: [{ setFlag: 'brawler.halfstone', value: true }, { startQuest: 'quest:brawler-in-your-corner' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, skillPoints: 1, lore: ['lore:hc-half-stones'] },
  },
  {
    ...A1, id: 'quest:brawler-in-your-corner', name: 'In Your Corner', type: 'main', region: Z1, giver: TK,
    summary: 'Silas has gone up the crane towards the Stair Gate, and you have the Pit half. Pops has packed up his noodle cart.',
    requires: req(done('quest:brawler-the-quarry-throne')), firstStage: 'cart',
    stages: [
      {
        id: 'cart', journal: 'Pops is going to push his noodle cart up the Stair Gate road behind you. All the way. He has been very clear about this.',
        objectives: [{ id: 'pops', text: 'Walk up the gate road with Pops', talk: TK, marker: { landmark: 'landmark:pops-noodle-cart' } }],
        onComplete: [{ setFlag: 'brawler.pops_farewell', value: true }],
        next: 'corner',
      },
      {
        id: 'corner', journal: 'Halfway up the gate road is the Last Corner: a stone bench where Lowfold fighters going up to fight at the Turning sat to have their hands wrapped. Pops wants to wrap yours there, the old way.',
        objectives: [{ id: 'bench', text: 'Sit for your hand-wraps at the Last Corner', interact: 'obj:brawler-last-corner', marker: { landmark: 'landmark:brawler-last-corner' } }],
        next: 'road',
      },
      {
        id: 'road', journal: 'Up the Stair Gate road to the last landing, where the Mountain King sits.',
        objectives: [{ id: 'gate', text: 'Climb to the Stair Gate', reach: 'area:fist-gate', marker: { place: 'area:fist-gate' } }],
        onComplete: [{ startQuest: 'quest:brawler-the-stair-gate' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:brawler-the-stair-gate', name: 'The Stair Gate (Lowfold side)', type: 'main', region: 'area:fist-gate', giver: TK,
    summary: 'The Mountain King sits on the last landing before the Stair Gate. Knuckletown has come up the road behind you with blankets and a picnic.',
    requires: req(done('quest:brawler-in-your-corner')), firstStage: 'king',
    stages: [
      {
        id: 'king', journal: 'A title bout on the last landing. He hits like a rockfall. You cannot win on points. Get knocked down and get up again until he tires.',
        onEnter: [{ openDialogue: 'dialogue:brawler-king-bout' }],
        objectives: [{ id: 'king', text: 'Go the distance with the Mountain King', kill: 'bx_fist_5', count: 1 }],
        next: 'gate',
      },
      {
        id: 'gate', journal: 'The black gloves on his fists have cracked right off. He has sat down on the landing, and he is laughing.',
        objectives: [{ id: 'seal', text: 'Open the Stair Gate with the Pit half', interact: 'obj:fist-gate-seal' }],
        onComplete: [{ setFlag: 'story.gate_open', value: true }, { setFlag: 'story.act', value: 2 }, { setFlag: 'brawler.act1_done', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 200, lore: ['lore:hc-realm-gates', 'lore:hc-mountain-king'] },
  },

  // ======================= ACT I: side quests (2 per zone)
  {
    ...A1, id: 'quest:brawler-honest-abigails-book', name: 'Honest Abigail’s Book', type: 'side', region: Z1, giver: 'npc:abigail-tuck',
    summary: 'Honest Abigail Tuck has never taken a bet against a local fighter in her life. Silas’s runners are pushing her out of the Pits, and her book needs three wins to stay open.',
    requires: req(done('quest:brawler-the-bell-in-round-three')), firstStage: 'bouts',
    stages: [
      {
        id: 'bouts', journal: 'Three bouts on Abigail’s book, in three of Knuckletown’s village rings. Win them. Honestly, ideally.',
        objectives: [{ id: 'bouts', text: 'Win three bouts on Abigail’s book', interact: 'obj:abigail-bout-*', count: 3, marker: { landmark: 'landmark:abigail-book-stall' } }],
        next: 'abigail',
      },
      {
        id: 'abigail', journal: 'Three wins, and three very surprised runners from Silas’s book, who all bet against you.',
        objectives: [{ id: 'abigail', text: 'Collect from Honest Abigail', talk: 'npc:abigail-tuck', marker: { landmark: 'landmark:abigail-book-stall' } }],
        onComplete: [{ setFlag: 'brawler.abigail_book', value: true }],
        next: 'runners',
      },
      {
        id: 'runners', journal: 'Silas’s runners have a booth across the square, and they have just lost three bets in a row to Abigail’s book. She wants her closing odds pinned on their board, so they know.',
        objectives: [{ id: 'booth', text: 'Pin Abigail’s closing odds on the runners’ board', interact: 'obj:brawler-runner-booth', marker: { landmark: 'landmark:brawler-runner-booth' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 70 },
  },
  {
    ...A1, id: 'quest:brawler-the-bunting-committee', name: 'The Bunting Committee', type: 'side', region: Z1, giver: 'npc:peony-crouch',
    summary: 'Knuckletown’s fight bunting has gone black at the edges. It must all come down and all go up again before the title bout, under the eye of three old women with very firm opinions.',
    requires: req(done('quest:brawler-noodles-and-debts')), firstStage: 'bunting',
    stages: [
      {
        id: 'bunting', journal: 'Four strings of bunting across Knuckletown’s main street. Mrs Crouch will be watching. So will Mrs Crouch’s sisters.',
        objectives: [{ id: 'bunting', text: 'Take down and re-hang the bunting', interact: 'obj:bunting-*', count: 4, marker: { landmark: 'landmark:knuckletown-bunting-row' } }],
        next: 'peony',
      },
      {
        id: 'peony', journal: 'All four strings are up. They are, as far as you can tell, straight.',
        objectives: [{ id: 'peony', text: 'Present the bunting to the committee', talk: 'npc:peony-crouch', marker: { landmark: 'landmark:knuckletown-bunting-row' } }],
        next: 'attic',
      },
      {
        id: 'attic', journal: 'For a title bout, Mrs Crouch says, there is only one proper string: the old bunting from Pops Knuckle’s championship, packed away in her attic since C. 1009. Nobody has been allowed to touch it.',
        objectives: [{ id: 'attic', text: 'Fetch the old championship bunting from the Crouch attic', interact: 'obj:brawler-old-bunting', marker: { landmark: 'landmark:brawler-crouch-attic' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_pie', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:brawler-doc-lints-thread', name: 'Doc Lint’s Thread', type: 'side', region: Z2, giver: 'npc:saffie-lint',
    summary: 'Cutwoman Doc Saffie Lint has run out of stitching silk, and the only silk in the valley is on a smuggler’s goat.',
    requires: req(done('quest:brawler-the-broken-fist-dojo')), firstStage: 'goat',
    stages: [
      {
        id: 'goat', journal: 'A brown goat with saddlebags full of silk was last seen eating the Grand Pit’s posters. It belongs to a smuggler. It does not, in any real sense, belong to anybody.',
        objectives: [{ id: 'goat', text: 'Catch the silk-smuggling goat', interact: 'obj:silk-goat', marker: { landmark: 'landmark:doc-lint-tent' } }],
        next: 'doc',
      },
      {
        id: 'doc', journal: 'A bolt of fine silk, slightly chewed.',
        objectives: [{ id: 'doc', text: 'Bring the silk to Doc Lint', talk: 'npc:saffie-lint', marker: { landmark: 'landmark:doc-lint-tent' } }],
        next: 'stitch',
      },
      {
        id: 'stitch', journal: 'Doc Lint has a fighter waiting in the practice ring with a cut over the eye, and her hands are not as steady as they were. She is going to talk you through it. You are going to stitch.',
        objectives: [{ id: 'stitch', text: 'Stitch the fighter’s cut, with Doc Lint watching', interact: 'obj:brawler-doc-patient', marker: { landmark: 'landmark:lowfold-practice-ring' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_hp_s', qty: 3 }] },
  },
  {
    ...A1, id: 'quest:brawler-tin-can-tilly', name: 'Tin-Can Tilly', type: 'side', region: Z2, giver: 'npc:tilly',
    summary: 'Tilly is twelve and wants to fight in the pits. Pops says no. Pops is right. You need a way to say no that does not break her.',
    requires: req(done('quest:brawler-the-broken-fist-dojo')), firstStage: 'corner',
    stages: [
      {
        id: 'corner', journal: 'A fighter is only as good as their corner. Teach Tilly the bucket, the stool and the towel.',
        objectives: [{ id: 'lessons', text: 'Teach Tilly to work a corner', interact: 'obj:tilly-corner-*', count: 3, marker: { landmark: 'landmark:lowfold-practice-ring' } }],
        next: 'tilly',
      },
      {
        id: 'tilly', journal: 'She is very good at it. She is also very loud about being very good at it.',
        objectives: [{ id: 'tilly', text: 'Talk to Tilly', talk: 'npc:tilly', marker: { landmark: 'landmark:lowfold-practice-ring' } }],
        onComplete: [{ setFlag: 'brawler.tilly_corner', value: true }],
        next: 'bout',
      },
      {
        id: 'bout', journal: 'Tilly has talked her way into working a real corner, in a real bout, at the Knuckletown village ring tonight. Her fighter is a big lad called Hob. Go and watch from the ropes.',
        objectives: [{ id: 'bout', text: 'Watch Tilly work her first corner', interact: 'obj:brawler-tilly-bout', marker: { landmark: 'landmark:knuckletown-village-ring' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:brawler-old-nobs-goats', name: 'Old Nob’s Goats', type: 'side', region: Z3, giver: 'npc:nob-furze',
    summary: 'Old Nob Furze smuggles by goat. His goats have gone hollow, and they keep taking the wrong paths with his cargo.',
    requires: req(done('quest:brawler-the-broken-fist-dojo')), firstStage: 'goats',
    stages: [
      {
        id: 'goats', journal: 'Three of Nob’s goats are wandering the Goat Paths in the wrong directions. Turn them round. Gently. They kick.',
        objectives: [{ id: 'goats', text: 'Turn Old Nob’s goats back onto the right paths', interact: 'obj:nob-goat-*', count: 3, marker: { landmark: 'landmark:nob-goat-shed' } }],
        next: 'nob',
      },
      {
        id: 'nob', journal: 'The third goat was carrying a letter that was not Nob’s, sealed with the King’s Climbers’ mark, addressed to Silas Gaunt.',
        objectives: [{ id: 'nob', text: 'Bring the goats home to Nob', talk: 'npc:nob-furze', marker: { landmark: 'landmark:nob-goat-shed' } }],
        next: 'tent',
      },
      {
        id: 'tent', journal: 'The King’s Climbers have a recruiting tent at the foot of the Goat Paths. Whatever was in that letter, somebody in the tent wrote it.',
        objectives: [{ id: 'tent', text: 'Take the Climbers’ letter back to their tent', interact: 'obj:brawler-climbers-tent', marker: { landmark: 'landmark:brawler-climbers-tent' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 60 },
  },
  {
    ...A1, id: 'quest:brawler-one-coat', name: 'One Coat', type: 'side', region: Z3, giver: 'npc:gert-haddow',
    summary: 'Gert Haddow and Rufus Thrush, rival village champions who have hated each other for eleven years, are stuck in a shelter on the Goat Paths in a snowstorm, with one coat.',
    requires: req(done('quest:brawler-the-broken-fist-dojo')), firstStage: 'shelter',
    stages: [
      {
        id: 'shelter', journal: 'The shelter is a stone hut on the high path. The snow is coming down sideways. The shouting can be heard from the road.',
        objectives: [{ id: 'shelter', text: 'Get the rivals to share the coat', interact: 'obj:goat-path-shelter', marker: { landmark: 'landmark:goat-path-shelter' } }],
        next: 'gert',
      },
      {
        id: 'gert', journal: 'The storm has passed. Both of them are alive, which is more than either expected.',
        objectives: [{ id: 'gert', text: 'Talk to Gert Haddow', talk: 'npc:gert-haddow', marker: { landmark: 'landmark:goat-path-shelter' } }],
        next: 'rematch',
      },
      {
        id: 'rematch', journal: 'Gert and Rufus said spring. They have lasted until the afternoon. The rematch is at the Harvest Ring down the Goat Paths, and they have asked you to referee.',
        objectives: [{ id: 'ring', text: 'Referee the rematch at the Harvest Ring', interact: 'obj:brawler-coat-bout', marker: { landmark: 'landmark:brawler-harvest-ring' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50 },
  },
  {
    ...A1, id: 'quest:brawler-the-undercard', name: 'The Undercard', type: 'side', region: Z4, giver: 'npc:mouse-mallory',
    summary: 'The outlaw rings in the Quarry Rings make their undercard fight in the dark, for a purse that never quite reaches the fighters.',
    requires: req(done('quest:brawler-big-mother-ox')), firstStage: 'dark',
    stages: [
      {
        id: 'dark', journal: 'An undercard bout in a quarry pit with no lamps. Three opponents, one after another, and the crowd can only hear.',
        objectives: [{ id: 'bouts', text: 'Win the undercard in the dark', kill: 'bx_fist_0', count: 3, marker: { landmark: 'landmark:quarry-undercard-ring' } }],
        next: 'purse',
      },
      {
        id: 'purse', journal: 'You won the undercard. The purse is sitting on a crate in the dark, and nobody is guarding it, because nobody ever wins it but the house.',
        objectives: [{ id: 'purse', text: 'Take the undercard purse', interact: 'obj:undercard-purse' }],
        next: 'mouse',
      },
      {
        id: 'mouse', journal: 'Mouse Mallory and the other undercard fighters are sitting on the quarry steps with their hands wrapped, waiting to be paid nothing.',
        objectives: [{ id: 'mouse', text: 'Hand the purse to the fighters', talk: 'npc:mouse-mallory', marker: { landmark: 'landmark:quarry-undercard-ring' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 30 },
  },
  {
    ...A1, id: 'quest:brawler-names-on-the-wall', name: 'Names on the Wall', type: 'side', region: Z4, giver: TK,
    summary: 'Scratched into a quarry cell wall, Pops says, is the name of every fighter Silas has sold. He would like them copied out. All of them.',
    requires: req(done('quest:brawler-sold-by-the-head')), firstStage: 'wall',
    stages: [
      {
        id: 'wall', journal: 'The cell is in the Quarry Rings, under the old crane. Bring a lamp and a lot of paper.',
        objectives: [{ id: 'wall', text: 'Copy the names off the quarry wall', interact: 'obj:quarry-names-wall', marker: { landmark: 'landmark:quarry-names-wall' } }],
        next: 'pops',
      },
      {
        id: 'pops', journal: 'Two hundred and twelve names, in your best handwriting.',
        objectives: [{ id: 'pops', text: 'Bring the names to Pops', talk: TK, marker: { landmark: 'landmark:pops-noodle-cart' } }],
        onComplete: [{ setFlag: 'brawler.names_copied', value: true }],
        next: 'board',
      },
      {
        id: 'board', journal: 'Pops wants every name chalked up on the Knuckletown fight-board, where the night’s bouts are written, so the whole town has to read them on its way to the rings.',
        objectives: [{ id: 'board', text: 'Chalk the names on the Knuckletown fight-board', interact: 'obj:brawler-fight-board', marker: { landmark: 'landmark:brawler-fight-board' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-quarry-names'] },
  },

  // ======================= ACT I: mentor thread (2) and bounties (2)
  {
    ...A1, id: 'quest:brawler-the-towel', name: 'The Towel', type: 'side', region: Z1, giver: TK,
    summary: 'Pops has cornered a thousand fighters and thrown in the towel exactly once. He has never said for whom.',
    requires: req({ trust: TK, value: 'friendly' }, done('quest:brawler-the-promoters-offer')), firstStage: 'noodles',
    stages: [
      { id: 'noodles', journal: 'Sit at Pops’s cart after closing, with a bowl of noodles. He talks better with his hands busy.', objectives: [{ id: 'pops', text: 'Ask Pops about the towel, over noodles', talk: TK, marker: { landmark: 'landmark:pops-noodle-cart' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1, skillPoints: 1 },
  },
  {
    ...A1, id: 'quest:brawler-the-last-herb', name: 'The Last Herb', type: 'side', region: Z3, giver: TK,
    summary: 'Pops’s noodle stock has been simmering since C. 1003. It is missing one thing: a mountain herb his late wife used to pick on the Goat Paths.',
    requires: req({ trust: TK, value: 'trusted' }, done('quest:brawler-the-broken-fist-dojo')), firstStage: 'herb',
    stages: [
      {
        id: 'herb', journal: 'Rainwort, Pops says, though nobody else calls it that. It grows on one ledge, above the third bend, where Marta used to go.',
        objectives: [{ id: 'herb', text: 'Find the herb where Marta found it', interact: 'obj:marta-herb-ledge', marker: { place: Z3 } }],
        next: 'pot',
      },
      {
        id: 'pot', journal: 'A handful of grey-green leaves that smell of rain on hot stone.',
        objectives: [{ id: 'pot', text: 'Add the herb to Pops’s stock-pot', interact: 'obj:pops-stock-pot', marker: { landmark: 'landmark:pops-noodle-cart' } }],
        next: 'pops',
      },
      {
        id: 'pops', journal: 'The stock has changed colour. Pops has not noticed yet.',
        objectives: [{ id: 'pops', text: 'Let Pops taste it', talk: TK, marker: { landmark: 'landmark:pops-noodle-cart' } }],
        onComplete: [{ setFlag: 'brawler.pops_devotable', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:brawler-bounty-quarry-slimes', name: 'Bounty: the Quarry Slimes', type: 'bounty', region: Z4, giver: 'npc:bess-plummet',
    summary: 'A brood of Stone Slimes has settled in the Quarry Rings and is sitting in the rings, which spoils the bouts.',
    requires: req(done('quest:brawler-the-promoters-offer')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'Six of them, in the quarry pits, very still and very heavy.', objectives: [{ id: 'slimes', text: 'Clear the Quarry Slimes', kill: 'bx_fist_2', count: 6, marker: { place: Z4 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 150 },
  },
  {
    ...A1, id: 'quest:brawler-bounty-rogue-monk-gang', name: 'Bounty: the Rogue Monk Gang', type: 'bounty', region: Z3, giver: 'npc:bess-plummet',
    summary: 'A gang of Rogue Monks has been mugging pilgrims on the Goat Paths and then lecturing them about attachment to worldly goods.',
    requires: req(done('quest:brawler-the-broken-fist-dojo')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'Five of them. They will tell you that your purse is an illusion. Your purse is not an illusion.', objectives: [{ id: 'monks', text: 'Break up the Rogue Monk gang', kill: 'bx_fist_0', count: 5, marker: { place: Z3 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 120 },
  },

  // ======================= ACT II: the class thread (C-1 … C-6) + featured bearers
  {
    ...A2, id: 'quest:brawler-the-cellar-ring', name: 'The Cellar Ring', type: 'class', region: 'vil:thorn', giver: 'npc:moll-treadwell',
    summary: 'Somewhere in Concordia there are Lowfold fighters, stranded since the arches shut. Where there are Lowfold fighters, there is a ring.',
    requires: req(done('quest:cc-through-the-arch')), autoStart: true, firstStage: 'cellar',
    stages: [
      {
        id: 'cellar', journal: 'You went the distance with the Mountain King and came through the Stair Gate with the Pit half singing. Now Nan Briar, the hedge-witch of the Briar Path, says there is a great deal of thumping under the Briar & Kettle in Thornhollow on Saturdays.',
        objectives: [{ id: 'moll', text: 'Find the cellar ring under the Briar & Kettle in Thornhollow', talk: 'npc:moll-treadwell', marker: { landmark: 'landmark:thorn-briar-kettle' } }],
        next: 'escort',
      },
      {
        id: 'escort', journal: 'Moll wants to see this slime that fights like a monk with her own eyes before you go anywhere near it. She has a bad knee, and the bramble is full of slimes in stances.',
        onEnter: [{ escort: 'npc:moll-treadwell', to: 'landmark:brawler-bog-edge' }],
        objectives: [{ id: 'moll', text: 'Get Moll Treadwell safely to the edge of the bog', when: { any: [{ flag: 'escort.moll-treadwell', op: '==', value: 'arrived' }, { flag: 'escort.moll-treadwell', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:brawler-bog-edge' } }],
        next: [{ when: { flag: 'escort.moll-treadwell', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'hear' }],
      },
      {
        id: 'regroup', journal: 'Moll went down to a slime doing something very like a hip-throw, and the cellar regulars carried her home. She says she slipped. She is strapping up the knee to go again.',
        onEnter: [{ escort: 'npc:moll-treadwell', to: 'landmark:brawler-bog-edge' }],
        objectives: [{ id: 'moll', text: 'Try again: get Moll to the edge of the bog', when: { any: [{ flag: 'escort.moll-treadwell', op: '==', value: 'arrived' }, { flag: 'escort.moll-treadwell', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:brawler-bog-edge' } }],
        next: [{ when: { flag: 'escort.moll-treadwell', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'hear' }],
      },
      {
        id: 'hear', journal: 'Moll is leaning on a dead tree at the edge of the bog, arms folded, watching the slimes spar, with the face of a trainer at a very bad exhibition.',
        objectives: [{ id: 'moll', text: 'Hear what Moll makes of the slimes', talk: 'npc:moll-treadwell', marker: { landmark: 'landmark:brawler-bog-edge' } }],
        onComplete: [{ startQuest: 'quest:brawler-bog-sparring' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-fist-cellar-ring'] },
  },
  {
    ...A2, id: 'quest:brawler-bog-sparring', name: 'Bog Sparring', type: 'class', region: 'region:briar', giver: 'npc:moll-treadwell',
    summary: 'Every slime in Briar Hollow wants a bout. They have been watching something do forms in the bog, and they would like to try them out on you.',
    requires: req(done('quest:brawler-the-cellar-ring')), firstStage: 'spar',
    stages: [
      {
        id: 'spar', journal: 'Spar your way through the bramble. The slimes come at you in stances. The stances are terrible.',
        objectives: [{ id: 'slimes', text: 'Spar through the bramble with the bog-slimes', kill: 'bx_slime', count: 6, marker: { region: 'region:briar' } }],
        next: 'ring',
      },
      {
        id: 'ring', journal: 'At the edge of the Sovereign’s pool, the slimes have made a ring in the mud, and they are waiting for you to step into it.',
        objectives: [{ id: 'ring', text: 'Step into the slimes’ mud-ring', interact: 'obj:brawler-mud-ring', marker: { landmark: 'landmark:sentinel-fist' } }],
        next: 'down',
      },
      {
        id: 'down', journal: 'The ring parted, and every slime pointed into the black pool.',
        objectives: [{ id: 'lair', text: 'Go down into the Deep Bog', reach: 'inst:sentinel-fist', marker: { landmark: 'landmark:sentinel-fist' } }],
        onComplete: [{ startQuest: 'quest:brawler-the-ooze-sovereign' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 120 },
  },
  {
    ...A2, id: 'quest:brawler-the-ooze-sovereign', name: 'The Ooze Sovereign', type: 'class', region: 'region:briar', giver: 'npc:moll-treadwell',
    summary: 'The Ooze Sovereign ate the Stone Abbot, Fist’s Sentinel, and now it fights like a monk, which the cellar ring considers cheating.',
    requires: req(done('quest:brawler-bog-sparring')), firstStage: 'fight',
    stages: [
      {
        id: 'fight', journal: 'The Ooze Sovereign is the Sentinel of the Fist school, because it is wearing him. Get him out.',
        onEnter: [{ openDialogue: 'dialogue:brawler-sovereign-bout' }],
        objectives: [{ id: 'sovereign', text: 'Defeat the Ooze Sovereign', kill: 'bx_sovereign', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-fist' }],
        next: 'release',
      },
      {
        id: 'release', journal: 'An old man in a monk’s robe rose out of the slime, sitting cross-legged, a little damp.',
        objectives: [{ id: 'mark', text: 'Hear the Stone Abbot out', when: { flag: 'story.sentinel.fist' } }],
        next: 'seat',
      },
      {
        id: 'seat', journal: 'The Stone Abbot is looking at your gloves with great interest.',
        objectives: [{ id: 'seat', text: 'Sit with the Stone Abbot', interact: 'obj:fist-abbot-seat' }],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'The cellar ring has been betting on this since you went down. Moll will want the result from you, not from the regulars.',
        objectives: [{ id: 'moll', text: 'Give Moll the result at the Briar & Kettle', talk: 'npc:moll-treadwell', marker: { landmark: 'landmark:thorn-briar-kettle' } }],
        onComplete: [{ startQuest: 'quest:brawler-the-ashmaw-bout' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-sovereign'] },
  },
  {
    ...A2, id: 'quest:brawler-the-ashmaw-bout', name: 'The Ashmaw Bout', type: 'class', region: 'region:ash', giver: 'npc:moll-treadwell',
    summary: 'Silas is in Kilnmouth. He has put the beast under the kilns on his fight card, he is selling tickets, and he is selling the losers to the Legion.',
    requires: req(done('quest:brawler-the-ooze-sovereign')), firstStage: 'card',
    stages: [
      {
        id: 'card', journal: 'Moll heard it from a cellar regular: posters all over Kilnmouth. SILAS GAUNT PRESENTS.',
        objectives: [{ id: 'card', text: 'Find Silas’s fight card in Kilnmouth', interact: 'obj:brawler-fight-card', marker: { landmark: 'landmark:kiln-cinder-mug' } }],
        next: [
          { when: { flag: 'brawler.purse', value: 'climbers' }, to: 'climbers' },
          { to: 'card-fighters' },
        ],
      },
      {
        id: 'climbers', journal: 'Climber exiles have come down from the high pass to Kilnmouth. They marched with you on the Grand Pit, and they would like to march again.',
        objectives: [{ id: 'signal', text: 'Call the Climber exiles to the Ashworks', interact: 'obj:brawler-climber-signal', marker: { landmark: 'landmark:kiln-ashworks' } }],
        next: 'card-fighters',
      },
      {
        id: 'card-fighters', journal: 'Silas’s card-fighters are hollow, and they guard the kiln door he means to sell tickets to.',
        objectives: [{ id: 'fighters', text: 'Get past Silas’s hollow card-fighters', kill: 'bx_concord_0', count: 4, marker: { region: 'region:ash' } }],
        next: 'contract',
      },
      {
        id: 'contract', journal: 'On a table by the kiln door, under a lamp, Silas’s ledger, open at today.',
        objectives: [{ id: 'ledger', text: 'Read Silas’s ledger', interact: 'obj:brawler-silas-ledger' }],
        next: 'down',
      },
      {
        id: 'down', journal: 'The main event is under the oldest kiln. Ashmaw does not know it is on a fight card.',
        objectives: [{ id: 'lair', text: 'Go down under the kilns', reach: 'inst:sentinel-ash', marker: { landmark: 'landmark:sentinel-ash' } }],
        onComplete: [{ startQuest: 'quest:brawler-ashmaw' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 150 },
  },
  {
    ...A2, id: 'quest:brawler-ashmaw', name: 'Ashmaw', type: 'class', region: 'region:ash', giver: 'npc:moll-treadwell',
    summary: 'Ashmaw, the Kiln-Beast, lit the Turning torches for a thousand years. Silas has billed it as the Unbeatable Beast of the Kilns.',
    requires: req(done('quest:brawler-the-ashmaw-bout')), firstStage: 'fight',
    stages: [
      {
        id: 'fight', journal: 'Ashmaw is the Sentinel of the Ash school. The Ash bearers cannot win their mark while it burns black.',
        objectives: [{ id: 'ashmaw', text: 'Defeat Ashmaw', kill: 'bx_ashmaw', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-ash' }, { setFlag: 'story.bearer.arcanist', value: true }],
        next: 'stool',
      },
      {
        id: 'stool', journal: 'There was a ringside under the kilns. Silas set out seats for his main event. One of them is still warm.',
        objectives: [{ id: 'stool', text: 'Look at Silas’s ringside under the kilns', interact: 'obj:brawler-ringside-stool' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-ashmaw'] },
  },
  {
    ...A2, id: 'quest:brawler-a-menu-with-a-message', name: 'A Menu with a Message', type: 'class', region: 'vil:brind', giver: TK,
    summary: 'Somebody small has come through the Fist arch with a noodle menu, and they were absolutely not supposed to come.',
    requires: req(done('quest:brawler-ashmaw')), autoStart: true, firstStage: 'menu',
    stages: [
      {
        id: 'menu', journal: 'A message from Pops is waiting for you at the Gate Circle, along with somebody who is going to be in a lot of trouble.',
        objectives: [{ id: 'tilly', text: 'Meet the messenger at the Gate Circle', talk: 'npc:tilly-concordia', marker: { landmark: 'landmark:gate-circle' } }],
        next: 'reply',
      },
      {
        id: 'reply', journal: 'Tilly is going home through the Fist arch whether anyone likes it or not. She has offered to carry an answer. On the back of the menu.',
        objectives: [{ id: 'tilly', text: 'Give Tilly an answer for Pops', talk: 'npc:tilly-concordia', marker: { landmark: 'landmark:gate-circle' } }],
        onComplete: [{ setFlag: 'story.act2_ready', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:brawler-the-reavers-bout', name: 'The Reaver’s Bout', type: 'side', region: 'vil:kiln', giver: 'npc:bearer-reaver',
    summary: 'The Reaver bearer is hunting Ashmaw too, and says somebody has to go down first. Garrow Redaxe would like to settle who, in Kilnmouth’s ash-pits.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'pit',
    stages: [
      {
        id: 'pit', journal: 'The ash-pits behind the Ore Market, where Kilnmouth settles its arguments. Axes off. Gloves on.',
        objectives: [{ id: 'pit', text: 'Meet the Reaver bearer in the ash-pits', interact: 'obj:brawler-ash-pit', marker: { landmark: 'landmark:kiln-ore-market' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Garrow is buying, back at the Stone Court. Garrow insists.',
        objectives: [{ id: 'garrow', text: 'Talk to the Reaver bearer', when: { any: [{ flag: 'brawler.garrow_thanked' }, { partyHasClass: 'reaver' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.reaver', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A2, id: 'quest:brawler-knight-errant', name: 'Knight Errant', type: 'side', region: 'vil:kiln', giver: 'npc:bearer-knight',
    summary: 'The Knight bearer means to pay Silas’s prices to buy back the fighters he sold. All of them. With money the Knight does not have.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'pen',
    stages: [
      {
        id: 'pen', journal: 'Ser Edda Brand is at the sold-fighters’ pen behind the Cinder Mug, with an empty purse and a full heart.',
        objectives: [{ id: 'pen', text: 'Meet the Knight bearer at the pen', interact: 'obj:brawler-sold-pen', marker: { landmark: 'landmark:kiln-cinder-mug' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Edda wants a word at the Stone Court, about cheaper ways.',
        objectives: [{ id: 'edda', text: 'Talk to the Knight bearer', when: { any: [{ flag: 'brawler.edda_thanked' }, { partyHasClass: 'knight' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.knight', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  // ======================= ACT III: class quests (III-4 + 3 side)
  {
    ...A3, id: 'quest:brawler-the-promoters-corner', name: 'The Promoter’s Corner', type: 'class', region: 'region:heart', giver: 'npc:casimir',
    summary: 'At the top of the Twelve Stairs the Union Chimera is fighting, and a voice in its chest is calling the rounds. You would know that voice anywhere. It once offered you a purse.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'herald',
    stages: [
      { id: 'herald', journal: 'At the Eve, Silas Gaunt, the Promoter, took the Monk’s Summit half and ran into the Heart. Now he is bound into the Union Chimera as its chest and its voice. He calls the rounds, and it fights them.', objectives: [{ id: 'herald', text: 'Face the Promoter’s Corner', kill: 'cb_promoters-corner', count: 1, marker: { landmark: 'landmark:twelve-stairs-top' } }], onComplete: [{ openDialogue: 'dialogue:brawler-herald-fate' }], next: 'fate' },
      { id: 'fate', journal: 'The Chimera is down, and Silas is still calling rounds that nobody is fighting.', objectives: [{ id: 'fate', text: 'Decide Silas’s fate', when: { flag: 'brawler.nemesis_fate' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 3 },
  },
  {
    ...A3, id: 'quest:brawler-pops-stock', name: 'Pops’s Stock', type: 'side', region: 'region:heart', giver: TK,
    summary: 'Tin-Can Tilly, who carried Pops’s letter on the back of a noodle menu, has come through again, against instructions, with a very heavy pot on a very small cart. It is Pops’s stock. He wants the hollowed to smell it.',
    requires: req(done('quest:heart-legion')), autoStart: true, firstStage: 'tilly',
    stages: [
      { id: 'tilly', journal: 'Tilly is at the Heart camp, sitting on a stock-pot so that nobody can take it off her.', objectives: [{ id: 'tilly', text: 'Find Tilly at the Heart camp', talk: 'npc:tilly-concordia', marker: { landmark: 'landmark:heart-camp' } }], next: 'embers' },
      { id: 'embers', journal: 'Tilly’s tinderbox came through the bog in her pocket. It is wet through. The bearers’ fires at the Heart camp have been burning all week.', objectives: [{ id: 'embers', text: 'Carry embers from the bearers’ fires', interact: 'obj:brawler-camp-embers', marker: { landmark: 'landmark:heart-camp' } }], next: 'pot' },
      { id: 'pot', journal: 'Pops’s orders, on the back of a menu: set it bubbling by the Legion camp, where the lost ones stand, and let the wind do the rest.', objectives: [{ id: 'pot', text: 'Set Pops’s stock bubbling by the Legion camp', interact: 'obj:brawler-stock-pot', marker: { landmark: 'landmark:legion-camp' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:brawler-calling-the-names', name: 'Calling the Names', type: 'side', region: 'region:heart', giver: TK,
    summary: '“If you ever find them, wherever he sent them, you read them their names.” The fighters Silas sold by the head are standing in the Hollow Legion.',
    requires: req(done('quest:heart-legion'), done('quest:brawler-names-on-the-wall')), autoStart: true, firstStage: 'faces',
    stages: [
      { id: 'faces', journal: 'Lowfold fighters in their wraps, standing in the Legion’s ranks. You have Pops’s list of names. You do not know which face goes with which name.', objectives: [{ id: 'faces', text: 'Find the sold fighters in the Legion camp', interact: 'obj:brawler-sold-ranks', marker: { landmark: 'landmark:legion-camp' } }], next: 'stubs' },
      { id: 'stubs', journal: 'Silas sold them by the ticket. A promoter keeps his stubs. His were dropped at the foot of the Twelve Stairs when the Chimera went up.', objectives: [{ id: 'stubs', text: 'Find Silas’s ticket-stubs at the foot of the Stairs', interact: 'obj:brawler-ticket-stubs', marker: { landmark: 'landmark:twelve-stairs' } }], next: 'names' },
      { id: 'names', journal: 'Lowfold fighters in their wraps, standing in the Legion’s ranks. You have Pops’s list. People come back to their names.', objectives: [{ id: 'names', text: 'Read the sold fighters their names', interact: 'obj:brawler-sold-fighter-*', count: 3, marker: { landmark: 'landmark:legion-camp' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A3, id: 'quest:brawler-big-mother-ox-comes-through', name: 'Big Mother Ox Comes Through', type: 'side', region: 'region:heart', giver: 'npc:big-mother-ox',
    summary: 'Big Mother Ox has walked through the Stair Gate, across the whole of Concordia and into the Heart, and is standing on the Fist stair. She does not think much of any of it.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'stair',
    stages: [
      { id: 'stair', journal: 'Something very large is standing at the top of the Fist stair with its arms folded.', objectives: [{ id: 'ox', text: 'Talk to Big Mother Ox on the Fist stair', talk: 'npc:big-mother-ox', marker: { landmark: 'landmark:twelve-stairs-top' } }], next: 'over' },
      { id: 'over', journal: 'She says she will stand on the stair until it is over. She means the Promoter.', objectives: [{ id: 'over', text: 'Finish it with the Promoter', when: { flag: 'brawler.nemesis_fate' }, marker: { landmark: 'landmark:twelve-stairs-top' } }], next: 'down' },
      { id: 'down', journal: 'It is over. Big Mother Ox is still standing.', objectives: [{ id: 'ox', text: 'Tell Big Mother Ox it is over', talk: 'npc:big-mother-ox', marker: { landmark: 'landmark:twelve-stairs-top' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
];

export default quests;
