/**
 * Hollow Crown: the JUGGERNAUT campaign (docs/lore/hollow-crown/06-outlines/iron.md). Act I in the Deepworks
 * (area:iron-frontier) and the Act II class thread in Concordia. Act III class quests land with the Heart.
 * Built on the Ash reference (10-campaign-style.md). Owner: Claude 4.
 */
import type { NarrativeCondition, QuestDef } from '@/core';

const JG: NarrativeCondition = { heroClass: 'juggernaut' };
const done = (q: `quest:${string}`): NarrativeCondition => ({ questCompleted: q });
const req = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: [JG, ...c] });
const A1 = { act: 'act1' as const, campaign: 'juggernaut', chapter: 'The Deepworks' };
const A2 = { act: 'act2' as const, campaign: 'juggernaut', chapter: 'Concordia' };
const A3 = { act: 'act3' as const, campaign: 'juggernaut', chapter: 'The Heart' };
const Z1 = 'zone:iron-frontier-1' as const, Z2 = 'zone:iron-frontier-2' as const, Z3 = 'zone:iron-frontier-3' as const, Z4 = 'zone:iron-frontier-4' as const;
const L1 = 'inst:iron-frontier-lair-1' as const, L2 = 'inst:iron-frontier-lair-2' as const, L3 = 'inst:iron-frontier-lair-3' as const;
const GH = 'npc:gussie-haldt' as const, MR = 'npc:magda-ruhl' as const;

const quests: QuestDef[] = [
  // ======================= ACT I: main (I-1 … I-10)
  {
    ...A1, id: 'quest:juggernaut-the-bell-in-the-rock', name: 'The Bell in the Rock', type: 'main', region: Z1, giver: GH,
    summary: 'End of the night shift in Rivet Town. Then a bell rang through the rock, every shift-whistle blew by itself, and the shaft-head roof came down.',
    requires: JG, autoStart: true, firstStage: 'roof',
    stages: [
      {
        id: 'roof', journal: 'The shaft-head roof is coming down on three miners. You are the only one tall enough to hold it.',
        onEnter: [{ openDialogue: 'dialogue:juggernaut-bell-night' }],
        objectives: [{ id: 'roof', text: 'Hold up the shaft-head roof', interact: 'obj:shaft-head-prop', marker: { landmark: 'landmark:rivet-shaft-head' } }],
        next: 'gussie',
      },
      {
        id: 'gussie', journal: 'Everyone is out. Foreman Gussie Haldt is standing on a crate, counting heads, and she keeps getting one sound too many.',
        objectives: [{ id: 'gussie', text: 'Report to Foreman Gussie at the shaft-head', talk: GH, marker: { landmark: 'landmark:rivet-shaft-head' } }],
        onComplete: [{ setFlag: 'juggernaut.bell_heard', value: true }],
        next: 'board',
      },
      {
        id: 'board', journal: 'Gussie has marched off to the tally-board with her crate under her arm, to count the shift’s brass tallies, because she does not trust her ears tonight. Sergeant is still singing.',
        objectives: [{ id: 'board', text: 'Follow Gussie to the tally-board', reach: 'landmark:rivet-tally-board', marker: { landmark: 'landmark:rivet-tally-board' } }],
        next: 'tally',
      },
      {
        id: 'tally', journal: 'Forty-one brass tallies on forty-one hooks, one for every miner up. Gussie is standing on her crate in front of them, counting, with her canary held up to the board like a lamp.',
        objectives: [{ id: 'gussie', text: 'Count the tallies with Gussie', talk: GH, marker: { landmark: 'landmark:rivet-tally-board' } }],
        onComplete: [{ startQuest: 'quest:juggernaut-stopped-golems' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-ironhold', 'lore:hc-deepworks'] },
  },
  {
    ...A1, id: 'quest:juggernaut-stopped-golems', name: 'Stopped Golems', type: 'main', region: Z2, giver: GH,
    summary: 'Every Rivet Golem in the Deepworks stopped dead when the Bell rang, with the Regency’s ore quota due in three days.',
    requires: req(done('quest:juggernaut-the-bell-in-the-rock')), firstStage: 'golems',
    stages: [
      {
        id: 'golems', journal: 'Four Rivet Golems haul the ore carts on the main line. Kick their boilers until they start. That is the official procedure.',
        objectives: [{ id: 'golems', text: 'Restart the stopped Rivet Golems on the main line', interact: 'obj:rivet-golem-*', count: 4, marker: { place: Z2 } }],
        next: 'fight',
      },
      {
        id: 'fight', journal: 'They started. There are black tears in their boilers, and they are swinging at the miners.',
        objectives: [{ id: 'golems', text: 'Put down the weeping Rivet Golems', kill: 'bx_iron_1', count: 4, marker: { place: Z2 } }],
        next: 'boilers',
      },
      {
        id: 'boilers', journal: 'Golems drink from the line’s water-tanks. Something put tears in their boilers. Follow the water back before you go up.',
        objectives: [{ id: 'water', text: 'Follow the golems’ water back to its source', interact: 'obj:juggernaut-boiler-clue-*', count: 3, marker: { place: Z2 } }],
        next: 'gussie',
      },
      {
        id: 'gussie', journal: 'The main line is quiet. Too quiet, with the quota due.',
        objectives: [{ id: 'gussie', text: 'Tell Gussie about the golems', talk: GH, marker: { landmark: 'landmark:gussie-whistle-house' } }],
        onComplete: [{ startQuest: 'quest:juggernaut-the-warden-foundry' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:juggernaut-the-warden-foundry', name: 'The Warden Foundry', type: 'main', region: Z3, giver: GH,
    summary: 'The Forge Warden in the old foundry is melting down miners’ picks, lamps and dinner-pails to cast sentries for a Colossus that has already left. It has started on the cage-lifts.',
    requires: req(done('quest:juggernaut-stopped-golems')), firstStage: 'door',
    stages: [
      {
        id: 'door', journal: 'Nobody has worked the old foundry on the Slag Rivers in twenty years. Its chimney started smoking the night of the Bell.',
        objectives: [{ id: 'enter', text: 'Break into the Warden Foundry', reach: L1, marker: { landmark: 'landmark:warden-foundry-door' } }],
        next: 'warden',
      },
      {
        id: 'warden', journal: 'Its moulds spit out Iron Sentries. Smash each mould before the casting cools. It hammers in a rhythm you can learn.',
        objectives: [{ id: 'warden', text: 'Stop the Forge Warden', kill: 'bx_iron_4', count: 1 }],
        next: 'pails',
      },
      {
        id: 'pails', journal: 'The foundry is cooling. Along one wall, a heap of everything it took: picks, lamps, dinner-pails, a cage-lift door.',
        objectives: [{ id: 'pails', text: 'Sort out the heap of stolen tools', interact: 'obj:foundry-pail-heap' }],
        onComplete: [{ setFlag: 'juggernaut.foundry_cold', value: true }],
        next: 'gussie',
      },
      {
        id: 'gussie', journal: 'Two hundred dinner-pails, all with names scratched on the lids.',
        objectives: [{ id: 'gussie', text: 'Bring the pails home to Gussie', talk: GH, marker: { landmark: 'landmark:gussie-whistle-house' } }],
        onComplete: [{ startQuest: 'quest:juggernaut-the-smelters-wages' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 80, hcItems: [{ item: 'a_iron_plate_hands' }] },
  },
  {
    ...A1, id: 'quest:juggernaut-the-smelters-wages', name: 'The Smelter’s Wages', type: 'main', region: Z1, giver: MR,
    summary: 'A woman in a smelter’s leather apron has walked into Rivet Town’s company store with a strongbox, and the whole street has followed her in.',
    requires: req(done('quest:juggernaut-the-warden-foundry')), firstStage: 'store',
    stages: [
      {
        id: 'store', journal: 'Something is happening at the company store. There is cheering, which has never happened at the company store.',
        objectives: [{ id: 'store', text: 'Go to the company store', reach: 'landmark:rivet-company-store', marker: { landmark: 'landmark:rivet-company-store' } }],
        next: 'magda',
      },
      {
        id: 'magda', journal: 'Magda Ruhl, mine-boss of the Hollow Lode, has bought the store outright and is burning its debt-ledgers on the step.',
        objectives: [{ id: 'magda', text: 'Speak with Magda Ruhl', talk: MR, marker: { landmark: 'landmark:rivet-company-store' } }],
        onComplete: [{ setFlag: 'juggernaut.magda_met', value: true }],
        next: 'payday',
      },
      {
        id: 'payday', journal: 'Magda’s coin is already going round Rivet Town. Walk down the street and see what people are spending it on.',
        objectives: [{ id: 'payday', text: 'Walk Rivet Town on Magda’s payday', interact: 'obj:juggernaut-payday-*', count: 3, marker: { place: Z1 } }],
        next: 'penny',
      },
      {
        id: 'penny', journal: 'Penny Grist, the store clerk, is sitting on the step beside the cold ashes of her ledgers, and nobody else has noticed her.',
        objectives: [{ id: 'penny', text: 'Sit with Penny Grist on the store step', talk: 'npc:penny-grist', marker: { landmark: 'landmark:rivet-company-store' } }],
        onComplete: [{ startQuest: 'quest:juggernaut-the-whistle-vote' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 60, lore: ['lore:hc-hollow-lode'] },
  },
  {
    ...A1, id: 'quest:juggernaut-the-whistle-vote', name: 'The Whistle Vote', type: 'main', region: Z1, giver: GH,
    summary: 'Magda pays double for anyone who will dig her seam. Gussie has blown the long whistle, and the Brotherhood is meeting at the shaft-head to vote on it.',
    requires: req(done('quest:juggernaut-the-smelters-wages')), firstStage: 'canvass',
    stages: [
      {
        id: 'canvass', journal: 'Before the whistle, Gussie says, ask the oldest miner on the shift and the youngest what the Lode would cost them. Old Selwyn is at his seam. Dilly Spoke is at the rail yard.',
        objectives: [
          { id: 'selwyn', text: 'Ask Old Selwyn Duckett about the Hollow Lode', talk: 'npc:selwyn-duckett', marker: { landmark: 'landmark:singing-seam' } },
          { id: 'dilly', text: 'Ask Dilly Spoke about the Hollow Lode', talk: 'npc:dilly-spoke', marker: { landmark: 'landmark:deepworks-rail-yard' } },
        ],
        next: 'vote',
      },
      {
        id: 'vote', journal: 'Every miner in Rivet Town is at the shaft-head, and Gussie is on her crate.',
        objectives: [{ id: 'vote', text: 'Vote at the shaft-head', when: { flag: 'juggernaut.whistle' }, marker: { landmark: 'landmark:rivet-shaft-head' } }],
        next: 'dawn',
      },
      {
        id: 'dawn', journal: 'Whatever the whistle said, the first shift after it goes down at dawn. Be at the shaft-head to see it.',
        objectives: [{ id: 'shift', text: 'Watch the first shift after the vote', interact: 'obj:juggernaut-whistle-dawn', marker: { landmark: 'landmark:rivet-shaft-head' } }],
        onComplete: [{ startQuest: 'quest:juggernaut-the-scrap-hive' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-deepworks-brotherhood'] },
  },
  {
    ...A1, id: 'quest:juggernaut-the-scrap-hive', name: 'The Scrap Hive', type: 'main', region: Z4, giver: GH,
    summary: 'Whatever the Brotherhood voted, the road runs through the Scrapfields, and the Beetle King has made the Scrapfields its own.',
    requires: req(done('quest:juggernaut-the-whistle-vote')), firstStage: 'why',
    stages: [
      {
        id: 'why', journal: 'The whistle has blown.', objectives: [],
        next: [
          { when: { flag: 'juggernaut.whistle', value: 'dig' }, to: 'dig' },
          { when: { flag: 'juggernaut.whistle', value: 'slag' }, to: 'slag' },
          { to: 'strike' },
        ],
      },
      {
        id: 'strike', journal: 'Tools down means no wages. Rivet Town is selling scrap to eat, and the best scrap is in the Beetle King’s hive.',
        objectives: [{ id: 'mound', text: 'Go to the Scrap Hive mound', reach: 'landmark:scrap-hive-mound', marker: { landmark: 'landmark:scrap-hive-mound' } }],
        next: 'hive',
      },
      {
        id: 'dig', journal: 'Magda’s new rail to the Hollow Lode runs straight through the Scrapfields, and straight through the Beetle King’s hive.',
        objectives: [{ id: 'mound', text: 'Go to the Scrap Hive mound', reach: 'landmark:scrap-hive-mound', marker: { landmark: 'landmark:scrap-hive-mound' } }],
        next: 'hive',
      },
      {
        id: 'slag', journal: 'The slag-carts for the Lode’s upper galleries were buried in the Scrapfields years ago, under what is now the Beetle King’s hive.',
        objectives: [{ id: 'mound', text: 'Go to the Scrap Hive mound', reach: 'landmark:scrap-hive-mound', marker: { landmark: 'landmark:scrap-hive-mound' } }],
        next: 'hive',
      },
      {
        id: 'hive', journal: 'The hive is a mountain of everything Rivet Town ever threw away, and it is breathing.',
        objectives: [{ id: 'enter', text: 'Dig your way into the Scrap Hive', reach: L2, marker: { landmark: 'landmark:scrap-hive-mound' } }],
        next: 'king',
      },
      {
        id: 'king', journal: 'The Beetle King wears thirty years of Rivet Town’s junk as armour. Knock it off a layer at a time.',
        objectives: [{ id: 'king', text: 'Defeat the Beetle King', kill: 'cb_beetle-king', count: 1 }],
        next: 'banner',
      },
      {
        id: 'banner', journal: 'Under the last layer: the Brotherhood’s lost strike banner, wrapped round something heavy.',
        objectives: [{ id: 'banner', text: 'Unwrap the strike banner', interact: 'obj:strike-banner' }],
        onComplete: [{ setFlag: 'juggernaut.strike_banner', value: true }, { startQuest: 'quest:juggernaut-pay-that-empties-you' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 120 },
  },
  {
    ...A1, id: 'quest:juggernaut-pay-that-empties-you', name: 'Pay That Empties You', type: 'main', region: Z3, giver: GH,
    summary: 'The strike banner was wrapped round a strongbox of Magda’s new coin. Somebody hid it in the hive on purpose. Somebody was frightened of it.',
    requires: req(done('quest:juggernaut-the-scrap-hive')), firstStage: 'strongbox',
    stages: [
      {
        id: 'strongbox', journal: 'A strongbox stamped with the Hollow Lode’s mark, full of bright new iron coin.',
        objectives: [{ id: 'box', text: 'Open Magda’s strongbox', interact: 'obj:magda-strongbox', marker: { landmark: 'landmark:scrap-hive-mound' } }],
        next: 'gussie',
      },
      {
        id: 'gussie', journal: 'The coins are wet. They are always wet.',
        objectives: [{ id: 'gussie', text: 'Show Gussie the coin', talk: GH, marker: { landmark: 'landmark:gussie-whistle-house' } }],
        next: 'quiet',
      },
      {
        id: 'quiet', journal: 'Twelve of Magda’s diggers have gone quiet. Some of them are still above ground, sitting very still. Find them before you face her.',
        objectives: [{ id: 'quiet', text: 'Find the miners who went quiet', interact: 'obj:juggernaut-quiet-miner-*', count: 3, marker: { place: Z3 } }],
        next: 'magda',
      },
      {
        id: 'magda', journal: 'Gussie says the miners who carry Magda’s wages go quiet, then docile, then down the Lode for good. Magda is at the Lode mouth, paying the next shift.',
        objectives: [{ id: 'magda', text: 'Confront Magda at the Lode mouth', talk: MR, marker: { landmark: 'landmark:hollow-lode-mouth' } }],
        onComplete: [{ setFlag: 'juggernaut.magda_turned', value: true }, { startQuest: 'quest:juggernaut-the-hollow-lode' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-hollow-iron'] },
  },
  {
    ...A1, id: 'quest:juggernaut-the-hollow-lode', name: 'The Hollow Lode', type: 'main', region: L3, giver: GH,
    summary: 'The Lode half of the Iron stone is down the deepest seam, and Magda means it to be her last shipment.',
    requires: req(done('quest:juggernaut-pay-that-empties-you')), firstStage: 'descend',
    stages: [
      {
        id: 'descend', journal: 'Down the deepest seam, where the iron weeps. Your half-stone is singing so loud the rock hums.',
        objectives: [{ id: 'enter', text: 'Go down the Hollow Lode', reach: L3, marker: { landmark: 'landmark:hollow-lode-mouth' } }],
        next: 'magda',
      },
      {
        id: 'magda', journal: 'Magda is on a smelting crane above the seam, pouring hollow iron and throwing coin to her miners. Knock her purse into the seam.',
        objectives: [{ id: 'magda', text: 'Defeat Magda Ruhl, the Smelter', kill: 'cb_magda', count: 1 }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'Magda went up the main line in the last ore-cart. The Lode half is still in the rock, singing.',
        objectives: [{ id: 'stone', text: 'Break the Lode half out of the rock', interact: 'obj:iron-frontier-halfstone' }],
        onComplete: [{ setFlag: 'juggernaut.halfstone', value: true }, { startQuest: 'quest:juggernaut-end-of-shift' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, skillPoints: 1, lore: ['lore:hc-half-stones'] },
  },
  {
    ...A1, id: 'quest:juggernaut-end-of-shift', name: 'End of Shift', type: 'main', region: Z1, giver: GH,
    summary: 'Magda rode the main line up towards the Iron Gate with the last of her coin. You have the Lode half, and Gussie has blown the end-of-shift whistle early.',
    requires: req(done('quest:juggernaut-the-hollow-lode')), firstStage: 'farewell',
    stages: [
      {
        id: 'farewell', journal: 'Rivet Town is lining the rails. Gussie is waiting at the shaft-head, on her crate.',
        objectives: [{ id: 'gussie', text: 'Say goodbye to Gussie at the shaft-head', talk: GH, marker: { landmark: 'landmark:rivet-shaft-head' } }],
        onComplete: [{ setFlag: 'juggernaut.gussie_farewell', value: true }],
        next: 'post',
      },
      {
        id: 'post', journal: 'At the top of the main line, where the Deepworks end and the gate road begins, stands the Lamp Post: the Brotherhood hangs a lamp on it for every miner who goes up and out, so the shift knows to wait for them.',
        objectives: [{ id: 'lamp', text: 'Hang your lamp on the Lamp Post', interact: 'obj:juggernaut-lamp-post', marker: { landmark: 'landmark:juggernaut-lamp-post' } }],
        next: 'road',
      },
      {
        id: 'road', journal: 'Follow the main line up out of the Deepworks to the Iron Gate, where the Colossus waits.',
        objectives: [{ id: 'gate', text: 'Ride the main line to the Iron Gate', reach: 'area:iron-gate', marker: { place: 'area:iron-gate' } }],
        onComplete: [{ startQuest: 'quest:juggernaut-the-iron-gate' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:juggernaut-the-iron-gate', name: 'The Iron Gate (Deepworks side)', type: 'main', region: 'area:iron-gate', giver: GH,
    summary: 'The Iron Colossus stands at the Iron Gate, sweating hollow iron at every joint. Every plate on it is stamped with a Brotherhood shift-mark.',
    requires: req(done('quest:juggernaut-end-of-shift')), firstStage: 'colossus',
    stages: [
      {
        id: 'colossus', journal: 'Climb its legs by the mine-rails. Prise the shift-stamped plates loose and use them as shields.',
        onEnter: [{ openDialogue: 'dialogue:juggernaut-colossus-stamps' }],
        objectives: [{ id: 'colossus', text: 'Bring down the Iron Colossus', kill: 'bx_iron_5', count: 1 }],
        next: 'gate',
      },
      {
        id: 'gate', journal: 'The tears drained out of the Colossus like water out of a pumped shaft. It lies across the gate road. Behind it, the Iron Gate weeps.',
        objectives: [{ id: 'seal', text: 'Decide, and open the Iron Gate with the Lode half', interact: 'obj:iron-gate-seal' }],
        onComplete: [{ setFlag: 'story.gate_open', value: true }, { setFlag: 'story.act', value: 2 }, { setFlag: 'juggernaut.act1_done', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 200, lore: ['lore:hc-realm-gates', 'lore:hc-iron-colossus'] },
  },

  // ======================= ACT I: side quests (2 per zone)
  {
    ...A1, id: 'quest:juggernaut-too-tall-for-the-door', name: 'Too Tall for the Door', type: 'side', region: Z1, giver: 'npc:lotte-anvers',
    summary: 'Big Lotte Anvers, the tallest Juggernaut in the Deepworks, has grown again and cannot get into her own house.',
    requires: req(done('quest:juggernaut-the-bell-in-the-rock')), firstStage: 'house',
    stages: [
      {
        id: 'house', journal: 'Fix the house, not Lotte. Lotte is fine. Lotte is just tall.',
        objectives: [{ id: 'house', text: 'Raise Lotte’s lintel, door-frame and roof-beam', interact: 'obj:lotte-door-*', count: 3, marker: { landmark: 'landmark:lotte-house' } }],
        next: 'lotte',
      },
      {
        id: 'lotte', journal: 'The door is now taller than the house. This seems to be the Deepworks way.',
        objectives: [{ id: 'lotte', text: 'Show Lotte her new door', talk: 'npc:lotte-anvers', marker: { landmark: 'landmark:lotte-house' } }],
        next: 'invite',
      },
      {
        id: 'invite', journal: 'Lotte has never once had anyone round, because she could never get in herself. She has written an invitation for the whole shift and wants it pinned up at the shaft-head where they will all see it.',
        objectives: [{ id: 'invite', text: 'Pin Lotte’s invitation at the shaft-head', interact: 'obj:juggernaut-lotte-invite', marker: { landmark: 'landmark:rivet-shaft-head' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40, hcItems: [{ item: 'i_cheese', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:juggernaut-pennys-other-ledger', name: 'Penny’s Other Ledger', type: 'side', region: Z1, giver: 'npc:penny-grist',
    summary: 'Magda burned the company store’s ledgers on the step. Penny Grist, the clerk, kept a second one, and the Regency’s auditors are coming.',
    requires: req(done('quest:juggernaut-the-smelters-wages')), firstStage: 'ledger',
    stages: [
      {
        id: 'ledger', journal: 'Penny’s other ledger is behind the flour sacks in the store-room. The auditors are due at the second whistle.',
        objectives: [{ id: 'ledger', text: 'Find Penny’s second ledger before the auditors do', interact: 'obj:pennys-ledger', marker: { landmark: 'landmark:rivet-company-store' } }],
        next: 'penny',
      },
      {
        id: 'penny', journal: 'Every debt Penny ever quietly let go, in thirty years, in tiny neat writing.',
        objectives: [{ id: 'penny', text: 'Give Penny her ledger', talk: 'npc:penny-grist', marker: { landmark: 'landmark:rivet-company-store' } }],
        onComplete: [{ setFlag: 'juggernaut.penny_ledger', value: true }],
        next: 'auditor',
      },
      {
        id: 'auditor', journal: 'The second whistle has gone and the Regency’s auditor is in the pay office, with an empty desk and a very long face. Someone should go and keep him company.',
        objectives: [{ id: 'auditor', text: 'Face the Regency’s auditor in the pay office', interact: 'obj:juggernaut-auditor-desk', marker: { landmark: 'landmark:juggernaut-pay-office' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50 },
  },
  {
    ...A1, id: 'quest:juggernaut-dillys-rails', name: 'Dilly’s Rails', type: 'side', region: Z2, giver: 'npc:dilly-spoke',
    summary: 'Rail-runner Dilly Spoke races ore carts down the Deepworks lines for fun, and there are hollow golems on her favourite run.',
    requires: req(done('quest:juggernaut-stopped-golems')), firstStage: 'clear',
    stages: [
      {
        id: 'clear', journal: 'Three hollow golems are standing on the Long Drop line, which is the best line, says Dilly, because it is the most likely to kill you.',
        objectives: [{ id: 'golems', text: 'Clear the hollow golems off the Long Drop', kill: 'bx_iron_1', count: 3, marker: { landmark: 'landmark:deepworks-rail-yard' } }],
        next: 'race',
      },
      {
        id: 'race', journal: 'The line is clear. Dilly is already in her cart.',
        objectives: [{ id: 'race', text: 'Race Dilly down the Long Drop', interact: 'obj:dilly-race-cart' }],
        next: 'dilly',
      },
      {
        id: 'dilly', journal: 'You both survived. Dilly is outraged about the result.',
        objectives: [{ id: 'dilly', text: 'Settle the result with Dilly', talk: 'npc:dilly-spoke', marker: { landmark: 'landmark:deepworks-rail-yard' } }],
        onComplete: [{ setFlag: 'juggernaut.dilly_raced', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 60 },
  },
  {
    ...A1, id: 'quest:juggernaut-the-singing-seam', name: 'The Singing Seam', type: 'side', region: Z2, giver: 'npc:selwyn-duckett',
    summary: 'Old Selwyn Duckett says there is a gallery in the Deepworks where the first miners sang to find iron, and that the song is still down there.',
    requires: req(done('quest:juggernaut-stopped-golems')), firstStage: 'seam',
    stages: [
      {
        id: 'seam', journal: 'The oldest gallery of the Deepworks, at the end of a line nobody uses. Sing, Selwyn says. Or hum, if you can’t sing. Most Juggernauts can’t.',
        objectives: [{ id: 'seam', text: 'Sing in the Singing Seam', interact: 'obj:singing-seam-echo', marker: { landmark: 'landmark:singing-seam' } }],
        next: 'selwyn',
      },
      {
        id: 'selwyn', journal: 'The rock sang back. Then your chest sang back at the rock.',
        objectives: [{ id: 'selwyn', text: 'Tell Selwyn what the seam sang', talk: 'npc:selwyn-duckett', marker: { landmark: 'landmark:singing-seam' } }],
        next: 'board',
      },
      {
        id: 'board', journal: 'Selwyn says his granddad’s song had more verses, cut on a song-board in the old gallery past the seam, where the first miners kept the words. Nobody has read it in sixty years.',
        objectives: [{ id: 'board', text: 'Read the first miners’ song-board', interact: 'obj:juggernaut-song-board', marker: { landmark: 'landmark:juggernaut-old-gallery' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-singing-seam'] },
  },
  {
    ...A1, id: 'quest:juggernaut-crane-mother', name: 'Crane-Mother', type: 'side', region: Z3, giver: 'npc:agathe-strell',
    summary: 'Agathe Strell, the oldest crane-driver on the Slag Rivers, will not come down from her crane, though the slag under it has turned black.',
    requires: req(done('quest:juggernaut-the-warden-foundry')), firstStage: 'climb',
    stages: [
      {
        id: 'climb', journal: 'Agathe’s crane stands over the black slag-run. The ladder is ninety rungs and some of them are missing.',
        objectives: [{ id: 'ladder', text: 'Climb Agathe’s crane', interact: 'obj:agathe-crane-ladder', marker: { landmark: 'landmark:agathe-crane' } }],
        next: 'agathe',
      },
      {
        id: 'agathe', journal: 'Agathe is in her cab with a flask of tea and no intention of going anywhere.',
        objectives: [{ id: 'agathe', text: 'Talk Agathe down, or ride the bridge with her', talk: 'npc:agathe-strell', marker: { landmark: 'landmark:agathe-crane' } }],
        onComplete: [{ setFlag: 'juggernaut.agathe_helped', value: true }],
        next: 'bridge',
      },
      {
        id: 'bridge', journal: 'Agathe would not leave because her crane’s jib holds up the old slag-bridge, and under the bridge the black slag is backing up towards the shift houses. Go and look at the dam.',
        objectives: [{ id: 'dam', text: 'See what Agathe’s crane is holding back', interact: 'obj:juggernaut-slag-dam', marker: { landmark: 'landmark:juggernaut-slag-bridge' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 60 },
  },
  {
    ...A1, id: 'quest:juggernaut-slag-sculptures', name: 'Slag Sculptures', type: 'side', region: Z3, giver: 'npc:clem-bodkin',
    summary: 'The shift children cast shapes in cooling slag every year for the contest, and this year the judge has gone hollow. Clem Bodkin, aged ten, has appointed you instead.',
    requires: req(done('quest:juggernaut-the-warden-foundry')), firstStage: 'judge',
    stages: [
      {
        id: 'judge', journal: 'Three finalists, all cooling on the slag bank. The parents are watching. The parents are always watching.',
        objectives: [{ id: 'judge', text: 'Judge the slag sculptures', interact: 'obj:slag-sculpture-*', count: 3, marker: { landmark: 'landmark:slag-contest-yard' } }],
        next: 'clem',
      },
      {
        id: 'clem', journal: 'You have seen all three. Now you must choose, and live with it.',
        objectives: [{ id: 'clem', text: 'Announce the winner to Clem', talk: 'npc:clem-bodkin', marker: { landmark: 'landmark:slag-contest-yard' } }],
        next: 'canary',
      },
      {
        id: 'canary', journal: 'Clem’s own sculpture fell over, she said. It did not fall over. It was hidden behind the judge’s chair: a canary, in slag, for somebody. Clem wants it delivered and does not want to be there when it is.',
        objectives: [{ id: 'canary', text: 'Deliver Clem’s slag canary to the whistle-house', interact: 'obj:juggernaut-slag-canary', marker: { landmark: 'landmark:gussie-whistle-house' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_cake' }] },
  },
  {
    ...A1, id: 'quest:juggernaut-nib-and-nub', name: 'Nib and Nub', type: 'side', region: Z4, giver: 'npc:nib-tinker',
    summary: 'The Tinker Twins are building a cart out of scrap. They disagree about everything, including which way is forward.',
    requires: req(done('quest:juggernaut-the-warden-foundry')), firstStage: 'parts',
    stages: [
      {
        id: 'parts', journal: 'Nib wants a boiler, a wheel and a bell. Nub wants a different boiler, a different wheel and no bell. Get one of each and let them fight about it.',
        objectives: [{ id: 'parts', text: 'Dig the cart parts out of the Scrapfields', interact: 'obj:scrap-part-*', count: 3, marker: { landmark: 'landmark:tinker-twins-cart' } }],
        next: 'beetles',
      },
      {
        id: 'beetles', journal: 'The Scrap Beetles were sitting on those parts, and they would like them back.',
        objectives: [{ id: 'beetles', text: 'Fend off the Scrap Beetles', kill: 'bx_iron_2', count: 3 }],
        next: 'twins',
      },
      {
        id: 'twins', journal: 'A boiler, a wheel and a bell. Bring them to the twins and stand well back.',
        objectives: [{ id: 'nub', text: 'Bring the parts to the Tinker Twins', talk: 'npc:nub-tinker', marker: { landmark: 'landmark:tinker-twins-cart' } }],
        onComplete: [{ setFlag: 'juggernaut.twins_cart', value: true }],
        next: 'test',
      },
      {
        id: 'test', journal: 'The cart is finished. It has a boiler, a wheel, a bell in the middle and no brakes, because neither twin will admit to having forgotten them. It needs testing on the scrap hill. They have asked you to sit in the front. Both fronts.',
        objectives: [{ id: 'test', text: 'Test the twins’ cart on the scrap hill', interact: 'obj:juggernaut-twins-cart', marker: { landmark: 'landmark:juggernaut-scrap-hill' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50 },
  },
  {
    ...A1, id: 'quest:juggernaut-the-widows-pick', name: 'The Widow’s Pick', type: 'side', region: Z4, giver: 'npc:mother-teasdale',
    summary: 'Old Mother Teasdale’s husband died in the collapse of C. 1031. His pick was thrown out with the scrap, and it belongs on the Brotherhood shrine.',
    requires: req(done('quest:juggernaut-the-warden-foundry')), firstStage: 'pick',
    stages: [
      {
        id: 'pick', journal: 'A pick with a red-painted haft and the initials W. T. burned into it. Somewhere in a mountain of picks.',
        objectives: [{ id: 'pick', text: 'Find Walter Teasdale’s pick in the scrap', interact: 'obj:teasdale-pick', marker: { place: Z4 } }],
        next: 'shrine',
      },
      {
        id: 'shrine', journal: 'The Brotherhood shrine stands at the edge of the Scrapfields, hung with the tools of every miner the Deepworks kept.',
        objectives: [{ id: 'shrine', text: 'Hang the pick on the Brotherhood shrine', interact: 'obj:brotherhood-shrine', marker: { landmark: 'landmark:brotherhood-shrine' } }],
        next: 'teasdale',
      },
      {
        id: 'teasdale', journal: 'It is up, between his brother’s shovel and his father’s lamp.',
        objectives: [{ id: 'teasdale', text: 'Tell Mother Teasdale', talk: 'npc:mother-teasdale', marker: { landmark: 'landmark:brotherhood-shrine' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },

  // ======================= ACT I: mentor thread (2) and bounties (2)
  {
    ...A1, id: 'quest:juggernaut-haldts-lamp', name: 'Haldt’s Lamp', type: 'side', region: Z3, giver: GH,
    summary: 'Gussie’s father was foreman before her. He was lost in the Slag Rivers in C. 1029, and his lamp was never found.',
    requires: req({ trust: GH, value: 'friendly' }, done('quest:juggernaut-stopped-golems')), firstStage: 'lamp',
    stages: [
      {
        id: 'lamp', journal: 'Gussie says he went down the third slag-run with his lamp lit and never came back up. The run cooled years ago.',
        objectives: [{ id: 'lamp', text: 'Find Foreman Haldt’s lamp in the cooled slag-run', interact: 'obj:haldt-lamp', marker: { place: Z3 } }],
        next: 'gussie',
      },
      {
        id: 'gussie', journal: 'A miner’s lamp, sealed in clear grey slag like a fly in amber. Dry. Not a single black tear on it.',
        objectives: [{ id: 'gussie', text: 'Bring the lamp to Gussie', talk: GH, marker: { landmark: 'landmark:gussie-whistle-house' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, skillPoints: 1, lore: ['lore:hc-slag'] },
  },
  {
    ...A1, id: 'quest:juggernaut-the-first-whistle', name: 'The First Whistle', type: 'side', region: L3, giver: GH,
    summary: 'The Brotherhood’s founding whistle was blown once, at the first strike nine hundred years ago, and left in the oldest gallery of the Hollow Lode.',
    requires: req({ trust: GH, value: 'trusted' }, done('quest:juggernaut-the-hollow-lode')), firstStage: 'gallery',
    stages: [
      {
        id: 'gallery', journal: 'The oldest gallery of the Lode, past where the hollow iron starts. The first whistle hangs on a nail there, as if somebody meant to come back for it.',
        objectives: [{ id: 'whistle', text: 'Fetch the First Whistle from the oldest gallery', interact: 'obj:first-whistle', marker: { landmark: 'landmark:hollow-lode-mouth' } }],
        next: 'gussie',
      },
      {
        id: 'gussie', journal: 'A whistle of black horn and brass, nine hundred years old. You did not blow it. It is not yours to blow.',
        objectives: [{ id: 'gussie', text: 'Bring the First Whistle to Gussie', talk: GH, marker: { landmark: 'landmark:gussie-whistle-house' } }],
        onComplete: [{ setFlag: 'juggernaut.gussie_devotable', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:juggernaut-bounty-cart-line-golems', name: 'Bounty: the Cart-Line Golems', type: 'bounty', region: Z2, giver: 'npc:ida-fettle',
    summary: 'A pair of hollow Rivet Golems has taken over the number four cart-line and will not let anybody past without a fight.',
    requires: req(done('quest:juggernaut-stopped-golems')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'Two of them, back to back, swinging at anything with a lamp.', objectives: [{ id: 'golems', text: 'Defeat the cart-line golems', kill: 'bx_iron_1', count: 2, marker: { place: Z2 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 150 },
  },
  {
    ...A1, id: 'quest:juggernaut-bounty-old-mandible', name: 'Bounty: Old Mandible', type: 'bounty', region: Z4, giver: 'npc:ida-fettle',
    summary: 'A Scrap Beetle the size of an ore-cart, wearing a boiler as a hat, has been eating the Scrapfields’ salvage crews’ lunches.',
    requires: req(done('quest:juggernaut-the-warden-foundry')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'Old Mandible. You will know it by the hat.', objectives: [{ id: 'beetle', text: 'Defeat Old Mandible', kill: 'bx_iron_2', count: 1, marker: { place: Z4 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 120 },
  },

  // ======================= ACT II: the class thread (C-1 … C-6) + featured bearers
  {
    ...A2, id: 'quest:juggernaut-the-gold-diggers', name: 'The Gold Diggers', type: 'class', region: 'region:gilded', giver: 'npc:hobnail-jenks',
    summary: 'Somewhere in Concordia there are Deepworks folk, stranded since the arches shut. If anybody is digging, it will be them.',
    requires: req(done('quest:cc-through-the-arch')), autoStart: true, firstStage: 'jenks',
    stages: [
      {
        id: 'jenks', journal: 'You came through the Iron Gate with the Lode half in your chest and nobody to blow end of shift. Ysolde Fenn, the Brindlecross archivist, says there is a digging crew in the Gilded Ruins who speak with Rivet Town accents and swear in shift-whistle.',
        objectives: [{ id: 'jenks', text: 'Find the Deepworks diggers in the Gilded Ruins', talk: 'npc:hobnail-jenks', marker: { landmark: 'landmark:juggernaut-dig-camp' } }],
        next: 'escort',
      },
      {
        id: 'escort', journal: 'There is an old bore-hole out past the gold-line where Jenks says you can hear the hammering best. The hollow sentries walk their rounds out there. He has never gone alone.',
        onEnter: [{ escort: 'npc:hobnail-jenks', to: 'landmark:juggernaut-listening-shaft' }],
        objectives: [{ id: 'jenks', text: 'Get Hobnail Jenks safely to the old bore-hole', when: { any: [{ flag: 'escort.hobnail-jenks', op: '==', value: 'arrived' }, { flag: 'escort.hobnail-jenks', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:juggernaut-listening-shaft' } }],
        next: [{ when: { flag: 'escort.hobnail-jenks', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'hear' }],
      },
      {
        id: 'regroup', journal: 'Jenks went down under a sentry’s halberd, and the night shift dragged him back to the dig camp by his braces. He says it was a scratch. It was not a scratch. He is ready to go again.',
        onEnter: [{ escort: 'npc:hobnail-jenks', to: 'landmark:juggernaut-listening-shaft' }],
        objectives: [{ id: 'jenks', text: 'Try again: get Jenks to the old bore-hole', when: { any: [{ flag: 'escort.hobnail-jenks', op: '==', value: 'arrived' }, { flag: 'escort.hobnail-jenks', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:juggernaut-listening-shaft' } }],
        next: [{ when: { flag: 'escort.hobnail-jenks', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'hear' }],
      },
      {
        id: 'hear', journal: 'Jenks is lying flat on the gold with his ear to the bore-hole, and his face has gone very strange.',
        objectives: [{ id: 'jenks', text: 'Hear what Jenks hears down the bore-hole', talk: 'npc:hobnail-jenks', marker: { landmark: 'landmark:juggernaut-listening-shaft' } }],
        onComplete: [{ startQuest: 'quest:juggernaut-under-the-gold' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-iron-gilded-diggers'] },
  },
  {
    ...A2, id: 'quest:juggernaut-under-the-gold', name: 'Under the Gold', type: 'class', region: 'region:gilded', giver: 'npc:hobnail-jenks',
    summary: 'For thirty years Hobnail Jenks has heard something hammering under the gold. Tonight you lead the night shift down to find it.',
    requires: req(done('quest:juggernaut-the-gold-diggers')), firstStage: 'shoring',
    stages: [
      {
        id: 'shoring', journal: 'Gold is soft and it moves. Shore the new gallery before anybody goes any deeper.',
        objectives: [{ id: 'props', text: 'Shore up the night-shift gallery', interact: 'obj:juggernaut-dig-shoring-*', count: 3, marker: { landmark: 'landmark:juggernaut-dig-camp' } }],
        next: 'collapse',
      },
      {
        id: 'collapse', journal: 'The gallery is coming down, and the night shift is under it.',
        objectives: [{ id: 'hold', text: 'Hold up the collapsing gallery', interact: 'obj:juggernaut-dig-collapse' }],
        next: 'footings',
      },
      {
        id: 'footings', journal: 'Under the collapse, the footings of a building much older than Gildport: the first Iron embassy, from the buried city of C. 640.',
        objectives: [{ id: 'footings', text: 'Search the old Iron embassy’s footings', interact: 'obj:juggernaut-embassy-footings' }],
        next: 'down',
      },
      {
        id: 'down', journal: 'The hammering is right below you now, behind a door of plain dark iron.',
        objectives: [{ id: 'lair', text: 'Break through to the Buried Engine', reach: 'inst:sentinel-iron', marker: { landmark: 'landmark:sentinel-iron' } }],
        onComplete: [{ startQuest: 'quest:juggernaut-the-gilded-engine' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 120 },
  },
  {
    ...A2, id: 'quest:juggernaut-the-gilded-engine', name: 'The Gilded Engine', type: 'class', region: 'region:gilded', giver: 'npc:hobnail-jenks',
    summary: 'The Gilded Engine made the crown’s settings. It is Iron’s Sentinel, and it has been working a double shift for thirty years.',
    requires: req(done('quest:juggernaut-under-the-gold')), firstStage: 'fight',
    stages: [
      {
        id: 'fight', journal: 'The Gilded Engine is the Sentinel of the Iron school. Win its mark.',
        objectives: [{ id: 'engine', text: 'Defeat the Gilded Engine', kill: 'bx_engine', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-iron' }],
        next: 'release',
      },
      {
        id: 'release', journal: 'The gold ran off it. Underneath it was only old iron, worked very hard for a very long time.',
        objectives: [{ id: 'mark', text: 'Hear the Engine out', when: { flag: 'story.sentinel.iron' } }],
        next: 'anvil',
      },
      {
        id: 'anvil', journal: 'Its last anvil is warm. It seems to be waiting to be asked something, or to ask.',
        objectives: [{ id: 'anvil', text: 'Lay your hand on the Engine’s anvil', interact: 'obj:iron-engine-anvil' }],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'The hammering under the gold has stopped. Jenks has listened to it every night for thirty years. Go and tell him why.',
        objectives: [{ id: 'jenks', text: 'Tell Jenks the Engine has knocked off', talk: 'npc:hobnail-jenks', marker: { landmark: 'landmark:juggernaut-dig-camp' } }],
        onComplete: [{ startQuest: 'quest:juggernaut-the-ore-road' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-engine'] },
  },
  {
    ...A2, id: 'quest:juggernaut-the-ore-road', name: 'The Ore Road', type: 'class', region: 'region:frost', giver: 'npc:hobnail-jenks',
    summary: 'Magda came through the Iron arch behind you with a last load of hollow iron, and she is hauling it north to the Heart by the high pass.',
    requires: req(done('quest:juggernaut-the-gilded-engine')), firstStage: 'tracks',
    stages: [
      {
        id: 'tracks', journal: 'Jenks found ore-cart ruts on the north road out of the Ruins, wet with black. Follow them.',
        objectives: [{ id: 'ruts', text: 'Follow Magda’s ore-cart ruts north', interact: 'obj:juggernaut-ore-ruts', marker: { region: 'region:gilded' } }],
        next: 'pass',
      },
      {
        id: 'pass', journal: 'The ruts lead up into Frostmere Pass, where the Rimeheart Colossus holds the road shut.',
        objectives: [{ id: 'pass', text: 'Climb to Frostmere Pass', reach: 'region:frost', marker: { region: 'region:frost' } }],
        next: [
          { when: { flag: 'juggernaut.whistle', value: 'dig' }, to: 'rivet' },
          { to: 'miners' },
        ],
      },
      {
        id: 'rivet', journal: 'The hollow miners breaking at the pass are Rivet Town folk. You dug beside some of them. They took Magda’s pay because you voted that they should.',
        objectives: [{ id: 'rivet', text: 'Hold back the hollow Rivet Town miners', kill: 'bx_hollowed', count: 4, marker: { region: 'region:frost' } }],
        next: 'miners',
      },
      {
        id: 'miners', journal: 'Magda has hollow miners swinging picks at the Colossus’s feet, trying to break it out of the pass.',
        objectives: [{ id: 'miners', text: 'Drive Magda’s hollow miners off the pass', kill: 'bx_hollowed', count: 4, marker: { region: 'region:frost' } }],
        next: 'cart',
      },
      {
        id: 'cart', journal: 'Magda’s cart stands abandoned in the snow, one wheel off. She went on over the ice on foot.',
        objectives: [{ id: 'cart', text: 'Search Magda’s abandoned ore-cart', interact: 'obj:juggernaut-magda-cart' }],
        next: 'up',
      },
      {
        id: 'up', journal: 'The Rimeheart Colossus stands in the high pass, and Magda’s road goes straight through it.',
        objectives: [{ id: 'lair', text: 'Go up to the High Pass', reach: 'inst:sentinel-rime', marker: { landmark: 'landmark:sentinel-rime' } }],
        onComplete: [{ startQuest: 'quest:juggernaut-rimeheart-colossus' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 150 },
  },
  {
    ...A2, id: 'quest:juggernaut-rimeheart-colossus', name: 'Rimeheart Colossus', type: 'class', region: 'region:frost', giver: 'npc:hobnail-jenks',
    summary: 'The Rimeheart Colossus held the northern pass for the crown’s road. Now it holds the pass shut. Another colossus.',
    requires: req(done('quest:juggernaut-the-ore-road')), firstStage: 'fight',
    stages: [
      {
        id: 'fight', journal: 'The Rimeheart Colossus is the Sentinel of the Rime school. The Rime bearers cannot win their mark while it stands hollowed.',
        onEnter: [{ openDialogue: 'dialogue:juggernaut-another-colossus' }],
        objectives: [{ id: 'colossus', text: 'Defeat the Rimeheart Colossus', kill: 'bx_colossus', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-rime' }, { setFlag: 'story.bearer.rimecaller', value: true }],
        next: 'packet',
      },
      {
        id: 'packet', journal: 'Where the Colossus stood, the ice has melted back from something small and brown, frozen in at the height of a giant’s knee.',
        objectives: [{ id: 'packet', text: 'See what was frozen into the Colossus’s ice', interact: 'obj:juggernaut-colossus-pay' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-colossus'] },
  },
  {
    ...A2, id: 'quest:juggernaut-three-short-blasts', name: 'Three Short Blasts', type: 'class', region: 'vil:brind', giver: GH,
    summary: 'Something has come through the Iron arch from the Deepworks with a letter for you, and it is making a great deal of noise about it.',
    requires: req(done('quest:juggernaut-rimeheart-colossus')), autoStart: true, firstStage: 'letter',
    stages: [
      {
        id: 'letter', journal: 'A letter from Gussie is waiting for you at the Gate Circle.',
        objectives: [{ id: 'letter', text: 'Collect Gussie’s letter at the Gate Circle', when: { flag: 'juggernaut.gussie_letter' }, marker: { landmark: 'landmark:gate-circle' } }],
        next: 'reply',
      },
      {
        id: 'reply', journal: 'Three short blasts means all well. Gussie will be listening at the whistle-house every night until she hears one back.',
        objectives: [{ id: 'reply', text: 'Blow Gussie an answer through the Iron arch', interact: 'obj:juggernaut-reply-whistle', marker: { landmark: 'landmark:gate-circle' } }],
        onComplete: [{ setFlag: 'story.act2_ready', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:juggernaut-who-holds-the-pass', name: 'Who Holds the Pass', type: 'side', region: 'vil:warden', giver: 'npc:bearer-warden',
    summary: 'The Warden bearer says the wall at Wardenhold is failing, and that walls are for keeping people out. You built walls for a living. You have opinions.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'shore',
    stages: [
      {
        id: 'shore', journal: 'Three cracked buttresses in Wardenhold’s gate wall. Aled Holloway keeps the wall. You know how to build one.',
        objectives: [{ id: 'buttress', text: 'Shore up Wardenhold’s failing gate wall', interact: 'obj:juggernaut-buttress-*', count: 3, marker: { landmark: 'landmark:warden-wardens-gate' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'The wall holds. Aled wants a word at the Stone Court, and possibly an argument.',
        objectives: [{ id: 'bram', text: 'Talk to the Warden bearer', when: { any: [{ flag: 'juggernaut.bram_thanked' }, { partyHasClass: 'warden' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.warden', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A2, id: 'quest:juggernaut-the-machine-age', name: 'The Machine Age', type: 'side', region: 'vil:gild', giver: 'npc:bearer-sparkwright',
    summary: 'The Sparkwright bearer wants the Gilded Engine’s secrets for a machine that will do the miners’ work for them. All of it.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'machine',
    stages: [
      {
        id: 'machine', journal: 'Fizz Copperpot’s machine is in the yard of the Sparkwright Works at Gildport. It has a great many arms and no off switch.',
        objectives: [{ id: 'machine', text: 'Look at the Sparkwright bearer’s machine', interact: 'obj:juggernaut-fizz-machine', marker: { landmark: 'landmark:gild-sparkwright-works' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Fizz has been thinking about what you said, and wants to tell you at the Stone Court.',
        objectives: [{ id: 'fizz', text: 'Talk to the Sparkwright bearer', when: { any: [{ flag: 'juggernaut.fizz_thanked' }, { partyHasClass: 'sparkwright' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.sparkwright', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  // ======================= ACT III: class quests (III-4 + 3 side)
  {
    ...A3, id: 'quest:juggernaut-the-furnace-heart', name: 'The Furnace-Heart', type: 'class', region: 'region:heart', giver: 'npc:casimir',
    summary: 'At the top of the Twelve Stairs waits the Union Chimera, with a furnace for a heart and coin pouring through its ribs. The fire in the furnace is Magda Ruhl.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'herald',
    stages: [
      { id: 'herald', journal: 'Magda Ruhl, the Smelter, who paid Rivet Town in hollow coin and took the other half of your stone at the Eve, had herself measured for the Chimera’s furnace, and she was fitted at her convenience. Now she burns at its heart, paying out for ever.', objectives: [{ id: 'herald', text: 'Face the Furnace-Heart', kill: 'cb_furnace-heart', count: 1, marker: { landmark: 'landmark:twelve-stairs-top' } }], onComplete: [{ openDialogue: 'dialogue:juggernaut-herald-fate' }], next: 'fate' },
      { id: 'fate', journal: 'The Chimera’s furnace hangs open on the stair, beaten. Magda is still burning, and still paying.', objectives: [{ id: 'fate', text: 'Decide Magda’s fate', when: { flag: 'juggernaut.nemesis_fate' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 3 },
  },
  {
    ...A3, id: 'quest:juggernaut-last-shift', name: 'Last Shift', type: 'side', region: 'region:heart', giver: GH,
    summary: 'A Rivet Town crate has come into the Heart with the bearers’ baggage, stencilled GUSSIE’S and DO NOT SIT ON. There is a letter on top.',
    requires: req(done('quest:heart-legion')), autoStart: true, firstStage: 'count',
    stages: [
      { id: 'count', journal: 'Before you blow anything, do what Gussie does at the end of every shift: count heads. The Deepworks folk stand in the Legion camp in their own ranks.', objectives: [{ id: 'count', text: 'Count the Deepworks heads in the Legion camp', interact: 'obj:juggernaut-legion-count', marker: { landmark: 'landmark:legion-camp' } }], next: 'whistle' },
      { id: 'whistle', journal: 'Gussie’s crate is waiting in the Legion camp, where the Deepworks folk still stand in their ranks.', objectives: [{ id: 'crate', text: 'Blow end of shift from Gussie’s crate', interact: 'obj:juggernaut-shift-crate', marker: { landmark: 'landmark:legion-camp' } }], next: 'tally' },
      { id: 'tally', journal: 'The whole night shift has turned for home. A foreman chalks the count when the shift is out. Somebody should chalk this one.', objectives: [{ id: 'tally', text: 'Chalk the count on the board at the Heart camp', interact: 'obj:juggernaut-shift-tally', marker: { landmark: 'landmark:heart-camp' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:juggernaut-pay-day', name: 'Pay Day', type: 'side', region: 'region:heart', giver: GH,
    summary: 'The miners emptied by Magda Ruhl’s hollow coin are standing in the Legion camp in their Deepworks leathers, each one holding a wet, bright coin.',
    requires: req(done('quest:heart-legion')), autoStart: true, firstStage: 'shift',
    stages: [
      { id: 'shift', journal: 'Magda’s hollow miners stand in the Legion camp, each with a wet, bright coin in their fist.', objectives: [{ id: 'shift', text: 'Find Magda’s hollow miners in the Legion camp', interact: 'obj:juggernaut-hollow-shift', marker: { landmark: 'landmark:legion-camp' } }], next: 'lamp' },
      { id: 'lamp', journal: 'They will not be paid in the dark. Deepworks pay comes through a lit window at the end of the shift. Find a lamp at the Heart camp.', objectives: [{ id: 'lamp', text: 'Set up a lit pay-window at the Heart camp', interact: 'obj:juggernaut-pay-lamp', marker: { landmark: 'landmark:heart-camp' } }], next: 'pay' },
      { id: 'pay', journal: 'The pay-lamp is lit. Take the hollow coins off Magda’s miners, one by one, and pay them properly.', objectives: [{ id: 'pay', text: 'Pay Magda’s hollow miners a fair wage', interact: 'obj:juggernaut-hollow-shift', marker: { landmark: 'landmark:legion-camp' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A3, id: 'quest:juggernaut-one-winter-coat', name: 'One Winter Coat', type: 'side', region: 'region:heart', giver: 'npc:penny-grist',
    summary: 'Penny Grist, who has never been past the second whistle-post, has walked all the way to the Heart with a tin on her knees and a page from C. 1020.',
    requires: req(done('quest:juggernaut-the-furnace-heart'), done('quest:juggernaut-pennys-other-ledger')), autoStart: true, firstStage: 'penny',
    stages: [
      { id: 'penny', journal: 'Penny is sitting on her luggage at the Heart camp, holding a tin.', objectives: [{ id: 'penny', text: 'Find Penny Grist at the Heart camp', talk: 'npc:penny-grist', marker: { landmark: 'landmark:heart-camp' } }], next: 'magda' },
      { id: 'magda', journal: 'C. 1020. M. Ruhl, aged 11, one winter coat. Forgiven. Take the page and Penny’s tin up to the Chimera’s cold furnace.', objectives: [{ id: 'furnace', text: 'Bring Penny’s page to the top of the Twelve Stairs', interact: 'obj:juggernaut-cold-furnace', marker: { landmark: 'landmark:twelve-stairs-top' } }], next: 'tell' },
      { id: 'tell', journal: 'Penny is still sitting on her luggage at the Heart camp, waiting to hear. She cannot do stairs. She can do ledgers.', objectives: [{ id: 'penny', text: 'Tell Penny the page was delivered', talk: 'npc:penny-grist', marker: { landmark: 'landmark:heart-camp' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
];

export default quests;
