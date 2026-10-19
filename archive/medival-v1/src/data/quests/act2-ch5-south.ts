/** Act II, Chapter 5 (south): quest:the-ember-auction (Saltreach Isles) and quest:the-glass-throne (Sunscar to the Cinder Wastes). docs/lore/11-act2-spec.md. Owner: Claude 4. */
import type { QuestDef } from '@/core';

const L = (id: `landmark:${string}`) => ({ landmark: id });
const f = (flag: string) => ({ flag });
const CH = 'The Ember Hunts';
const QA = 'quest:the-ember-auction', QG = 'quest:the-glass-throne';
const outcome = (v: string) => ({ flag: 'act2.auction_outcome', op: '==' as const, value: v });

const quests: QuestDef[] = [
  // ----- The Ember Auction (Saltreach Isles)
  {
    id: QA, name: 'The Ember Auction', type: 'main', act: 'act2', chapter: CH, region: 'region:saltreach-isles', giver: 'npc:marisol-kestrel',
    summary: 'The Salt League fished a falling star out of the Saltreach, and Admiral Marisol Kestrel means to sell it to the highest bidder on Gull Rock. Solenne, the Ashen Creed and the Qasiri caravans have all sent buyers. First you need a ship.',
    requires: { all: [f('act1.complete'), f('content.act2')] },
    firstStage: 'passage',
    stages: [
      {
        id: 'passage', journal: 'Every hull in Brackhaven is spoken for, and the Saltreach Isles are two days out over a winter sea. Wren Tallow at the Salt Exchange always has one ship more than she admits to. She will want paying.',
        objectives: [{ id: 'wren', text: 'Buy passage to the isles from Wren Tallow', marker: L('landmark:salt-exchange'), when: f('act2.ship_passage') }],
        next: 'isles',
      },
      {
        id: 'isles', journal: 'The Gannet sails on the tide for Gull Rock, the old lighthouse the League roofed over with the keels of Solenni warships. The auction is held in its hall.',
        objectives: [{ id: 'reach', text: 'Sail to Gull Rock Hall', reach: 'landmark:gull-rock-hall', marker: L('landmark:gull-rock-hall') }],
        onComplete: [{ unlockLore: 'lore:brackhaven-auction' }, { openDialogue: 'dialogue:ch5s-kestrel-welcome' }],
        next: 'bidders',
      },
      {
        id: 'bidders', journal: 'The lot goes at sundown. Until then the hall is full of bidders watching one another: the Hierophancy’s factor, the Red Abbess of the Ashen Creed, and the Cindermother’s son. Learn what each of them means to pay, and what they would do to win.',
        objectives: [
          { id: 'vesper', text: 'Speak with the Red Abbess', talk: 'npc:vesper-qadri', marker: L('landmark:gull-rock-hall') },
          { id: 'benedetta', text: 'Speak with the Hierophancy’s factor', talk: 'npc:benedetta-aurevine', marker: L('landmark:gull-rock-hall') },
          { id: 'samir', text: 'Speak with the Qasiri envoy', talk: 'npc:samir-ibn-ruqaya', marker: L('landmark:gull-rock-hall') },
        ],
        next: 'auction',
      },
      {
        id: 'auction', journal: 'Sundown on Gull Rock. They have lit the great lamp for the first time in forty years, and the Ember is humming in its cage on the stern-dais. Kestrel has a belaying pin for a gavel.',
        onEnter: [{ openDialogue: 'dialogue:ch5-auction' }],
        objectives: [{ id: 'auction', text: 'Win the Ember of the Tide', marker: L('landmark:gull-rock-hall'), when: f('act2.auction_outcome') }],
        next: [{ when: outcome('heist'), to: 'heist' }, { when: outcome('duel'), to: 'duel' }, { to: 'ember' }],
      },
      {
        id: 'heist', journal: 'The gavel fell for Solenne. The Ember sleeps tonight in Kestrel’s vault under the hall, and Benedetta Aurevine takes delivery at dawn. Dawn is a long way off.',
        objectives: [{ id: 'vault', text: 'Open the auction vault after dark', marker: L('landmark:auction-vault'), when: { any: [f('act2.tide_vault_open'), outcome('duel')] } }],
        next: [{ when: outcome('duel'), to: 'duel' }, { to: 'ember' }],
      },
      {
        id: 'duel', journal: 'Salt-law of the League: any bid may be answered with steel against the house champion. Kestrel’s champion is waiting on the rocks below the hall, and the whole of Gull Rock is laying bets.',
        objectives: [{ id: 'champion', text: 'Defeat Kestrel’s champion', kill: 'enemy:salt-corsair-champion', count: 1, marker: L('landmark:gull-rock-hall') }],
        onComplete: [{ openDialogue: 'dialogue:ch5s-kestrel-concede' }],
        next: 'ember',
      },
      {
        id: 'ember', journal: 'The Ember of the Tide is waiting in the vault below Gull Rock Hall, in a cage of wet chain.',
        objectives: [{ id: 'ember', text: 'Claim the Ember of the Tide', marker: L('landmark:auction-vault'), when: f('act2.ember_tide_claimed') }],
        next: [
          { when: outcome('heist'), to: 'won-heist' },
          { when: outcome('duel'), to: 'won-duel' },
          { when: outcome('betrayal'), to: 'won-betrayal' },
          { to: 'won-bid' },
        ],
      },
      {
        id: 'won-bid', journal: 'You won the Ember of the Tide at Kestrel’s auction, fairly, or as fairly as anything is done on Gull Rock.',
        objectives: [], end: { status: 'completed', outcome: 'bid' },
      },
      {
        id: 'won-heist', journal: 'You robbed the Admiral’s vault on the night of her own auction. Benedetta Aurevine is still screaming. Kestrel, by all accounts, is laughing.',
        objectives: [], end: { status: 'completed', outcome: 'heist' },
      },
      {
        id: 'won-duel', journal: 'You answered the bidding with steel under salt-law, and put Kestrel’s champion on the rocks. The Ember of the Tide is yours.',
        objectives: [], end: { status: 'completed', outcome: 'duel' },
      },
      {
        id: 'won-betrayal', journal: 'You bought the Ember of the Tide with the Church’s gold, and paid for the gold with Vesper Qadri. The Wick took her to Valcastre in chains.',
        objectives: [], end: { status: 'completed', outcome: 'betrayal' },
      },
    ],
    reward: { xpTier: 3, lore: ['lore:brackhaven-auction', 'lore:marisol-kestrel'] },
  },
  // ----- The Glass Throne (Sunscar → Cinder Wastes)
  {
    id: QG, name: 'The Glass Throne', type: 'main', act: 'act2', chapter: CH, region: 'region:sunscar', giver: 'npc:ruqaya-al-nar',
    summary: 'An Ember fell into the dead city of Qadir, where nothing has lived for sixteen hundred years but cinderdrakes. The only way there is the Ash Road, and only the Qasiri remember it. Their Cindermother keeps her tent at the oasis of Zahrun.',
    requires: { all: [f('act1.complete'), f('content.act2')] },
    firstStage: 'zahrun',
    stages: [
      {
        id: 'zahrun', journal: 'Zahrun is the last green thing before the Cinder Wastes. The Cindermother, Ruqaya al-Nar, is said to have seen you coming in the smoke. In the Sunscar a road is a gift, and gifts are given to guests.',
        onEnter: [{ unlockLore: 'lore:the-qasiri' }],
        objectives: [
          { id: 'reach', text: 'Travel to the oasis of Zahrun', reach: 'landmark:zahrun', marker: L('landmark:zahrun') },
          { id: 'ruqaya', text: 'Ask the Cindermother for the Ash Road', marker: L('landmark:cindermother-tent'), when: f('act2.ashroad_known') },
        ],
        onComplete: [{ unlockLore: 'lore:zahrun' }],
        next: 'ashroad',
      },
      {
        id: 'ashroad', journal: 'East of Zahrun the sand turns black. Follow the cairns of glass, one every mile, each set by a Qasiri who did not come back. Where they end the road is paved with fused ash, and at its end are the gates of Qadir.',
        onEnter: [{ unlockLore: 'lore:the-ash-road' }],
        objectives: [{ id: 'gates', text: 'Follow the Ash Road to the gates of Qadir', reach: 'landmark:qadir-gates', marker: L('landmark:qadir-gates') }],
        onComplete: [{ unlockLore: 'lore:ruins-of-qadir' }, { openDialogue: 'dialogue:ch5s-qadir-gates' }],
        next: 'wyrm',
      },
      {
        id: 'wyrm', journal: 'Every tower in Qadir leans away from the throne-hall at its heart. The Ember is in there. So is the thing that has been sleeping on it.',
        objectives: [
          { id: 'reach', text: 'Enter the throne-hall of Qadir', reach: 'landmark:glass-throne', marker: L('landmark:glass-throne') },
          { id: 'wyrm', text: 'Slay the Ashwyrm', kill: 'enemy:ashwyrm', count: 1, marker: L('landmark:glass-throne') },
        ],
        onComplete: [{ unlockLore: 'lore:cinderdrakes-and-ashwyrms' }],
        next: 'ozrah',
      },
      {
        id: 'ozrah', journal: 'The Ashwyrm is dead. On the throne of black glass someone made of ash is lifting his head: Ozrah the Unsleeping, last of the Ashen Kings, whose name the Qasiri spit after.',
        onEnter: [{ openDialogue: 'dialogue:ozrah-throne' }],
        objectives: [{ id: 'ozrah', text: 'Hear the testimony of the ghost king', marker: L('landmark:glass-throne'), when: f('act2.ozrah_truth') }],
        next: 'ember',
      },
      {
        id: 'ember', journal: 'The Heartfire was always dying, and the Ashen Kings were trying to save it. Behind the glass throne the last coal of Ozrah’s nexus is still burning, and the old king is waiting for you to take it so that he can let go.',
        objectives: [{ id: 'ember', text: 'Claim the Ember of the Glass', marker: L('landmark:glass-throne'), when: f('act2.ember_glass_claimed') }],
        end: { status: 'completed' },
      },
    ],
    reward: {
      xpTier: 3, items: [{ item: 'item:crown-of-ozrah' }],
      rep: [{ faction: 'faction:qasiri', delta: 15 }],
      lore: ['lore:ruins-of-qadir', 'lore:ozrah-the-unsleeping', 'lore:the-ashen-kings'],
    },
  },
];

export default quests;
