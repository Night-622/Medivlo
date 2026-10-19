/** Act I, Chapter 1 "Cinderhold" (docs/lore/10-act1-spec.md): Q1–Q3. Owner: Claude 4. */
import type { QuestDef } from '@/core';

const L = (id: `landmark:${string}`) => ({ landmark: id });

const quests: QuestDef[] = [
  {
    id: 'quest:the-last-warden', name: 'The Last Warden', type: 'main', act: 'act1', chapter: 'Cinderhold', region: 'region:kingsvale', giver: 'npc:hesta-corrow',
    summary: 'Hesta Corrow is taking you north along the King’s Way, to the burned hall where the Emberwardens kept the leys for nine hundred years, until the Church came for them in a single night.',
    // content.act1 is switched on by Claude 1 once the Kingsvale exists in-world (data-only until then)
    requires: { all: [{ flag: 'prologue.complete' }, { flag: 'content.act1' }] }, autoStart: true, firstStage: 'road',
    stages: [
      {
        id: 'road', journal: 'Hesta is waiting on the north road at first light. She means to burn a way through the drifts into the Kingsvale.',
        onEnter: [{ companion: 'npc:hesta-corrow', following: true }],
        objectives: [{ id: 'vale', text: 'Travel the King’s Way into the Kingsvale', reach: 'region:kingsvale', marker: L('landmark:kings-way-north') }],
        next: 'crag',
      },
      {
        id: 'crag', journal: 'The Kingsvale lies white and hungry under the snow. Cinderhold stands on its crag above the river, black against the sky.',
        objectives: [{ id: 'crag', text: 'Climb to the ruins of Cinderhold', reach: 'landmark:cinderhold', marker: L('landmark:cinderhold') }],
        next: 'shades',
      },
      {
        id: 'shades', journal: '"They’re ours," Hesta said. "The burned. The Church never gave them a pyre." Shapes of smoke and cinder walk the ruined yard.',
        objectives: [{ id: 'shades', text: 'Lay the cinder-shades to rest', kill: 'enemy:cinder-shade', count: 4, marker: L('landmark:cinderhold') }],
        next: 'brazier',
      },
      {
        id: 'brazier', journal: 'The ley-brazier still stands in the great hall, cold for a hundred and forty-six years. Hesta says your hand will know what to do.',
        objectives: [{ id: 'brazier', text: 'Rekindle the ley-brazier with the Ashmark', when: { flag: 'act1.cinderhold_restored' }, marker: L('landmark:cinderhold-hall') }],
        next: 'lesson',
      },
      {
        id: 'lesson', journal: 'Cinderhold is warm again. Hesta is sitting by the brazier, and she has things to tell you that she did not say on the shore.',
        objectives: [{ id: 'hesta', text: 'Sit with Hesta by the fire', talk: 'npc:hesta-corrow', marker: L('landmark:cinderhold-hall') }],
        onComplete: [
          { companion: 'npc:hesta-corrow', following: false },
          { startQuest: 'quest:a-queen-in-winter' },
        ],
        end: { status: 'completed' },
      },
    ],
    reward: {
      xpTier: 2,
      rep: [{ faction: 'faction:emberwardens', delta: 10 }],
      lore: ['lore:cinderhold', 'lore:purge-of-the-emberwardens'],
    },
  },
  {
    id: 'quest:a-queen-in-winter', name: 'A Queen in Winter', type: 'main', act: 'act1', chapter: 'Cinderhold', region: 'region:kingsvale', giver: 'npc:hesta-corrow',
    summary: 'Haldren is starving, the refugees of Greywater crowd its gates, and the Wick is searching hands at the gate. Somewhere above it all a fifteen-year-old queen must be persuaded that Varn can be taken back.',
    firstStage: 'gate',
    stages: [
      {
        id: 'gate', journal: 'The Order of the Wick keeps a table on Haldren’s north gate and inspects every hand that passes. Keep your glove on.',
        onEnter: [{ unlockLore: 'lore:charter-of-haldren' }],
        objectives: [{ id: 'bryce', text: 'Pass the Wick’s checkpoint at the Haldren gate', talk: 'npc:bryce-aldmere', marker: L('landmark:haldren-gate') }],
        next: 'market',
      },
      {
        id: 'market', journal: 'Ser Bryce warned you that the Wick had been busy in the market. The road to the Keep runs straight through it.',
        objectives: [
          { id: 'reach', text: 'Cross Haldren market', reach: 'landmark:haldren-market', marker: L('landmark:haldren-market') },
          { id: 'mage', text: 'Deal with the arrest in the market', when: { flag: 'act1.market_mage' }, marker: L('landmark:haldren-market') },
        ],
        next: [{ when: { flag: 'act1.market_mage', op: '==', value: 'fought' }, to: 'brawl' }, { to: 'audience' }],
      },
      {
        id: 'brawl', journal: 'You drew steel on the Wick in the open market. Corin Vale has fled, and the soldiers have not.',
        // Claude 2 gates the wick-soldier ×2 spawn zone at landmark:haldren-market on this flag
        onEnter: [{ setFlag: 'act1.market_brawl', value: true }],
        onComplete: [{ setFlag: 'act1.market_brawl', value: false }],
        objectives: [{ id: 'soldiers', text: 'Fight off the Wick’s soldiers', kill: 'enemy:wick-soldier', count: 2, marker: L('landmark:haldren-market') }],
        next: 'audience',
      },
      {
        id: 'audience', journal: 'Haldren Keep stands at the top of the hill. The Queen has had a letter from Hesta, and has agreed to receive you.',
        objectives: [{ id: 'aldith', text: 'Seek an audience with Queen Aldith', talk: 'npc:queen-aldith', marker: L('landmark:throne-room') }],
        next: 'harrow',
      },
      {
        id: 'harrow', journal: 'The Lord Protector walked into the throne room unannounced, and asked for a word with you in private.',
        objectives: [{ id: 'harrow', text: 'Speak with Lord Protector Harrow', talk: 'npc:osric-harrow', marker: L('landmark:throne-room') }],
        onComplete: [
          { setFlag: 'act1.audience_done', value: true },
          { unlockLore: 'lore:crown-of-haldmarch' },
          { startQuest: 'quest:the-singing-wood' },
          { startQuest: 'quest:iron-and-oath' },
          { startQuest: 'quest:the-river-under' },
        ],
        end: { status: 'completed' },
      },
    ],
    reward: {
      xpTier: 2,
      rep: [{ faction: 'faction:crown-of-haldmarch', delta: 5 }],
      lore: ['lore:queen-aldith', 'lore:osric-harrow', 'lore:haldren-keep'],
    },
  },
  {
    id: 'quest:the-quiet-hand', name: 'The Quiet Hand', type: 'side', act: 'act1', chapter: 'Cinderhold', region: 'region:kingsvale', giver: 'npc:sable',
    summary: 'A cheerful red-haired thief picked your pocket in Haldren market and then gave the purse back. She wants to meet you under the Tanners’ Steps, where the Quiet Hand keeps its den.',
    requires: { flag: 'act1.gate_passed' }, firstStage: 'den',
    stages: [
      {
        id: 'den', journal: '"Come and see me under the Tanners’ Steps," the thief said. "Ask for Sable."',
        objectives: [{ id: 'sable', text: 'Find Sable in the Quiet Hand’s den', talk: 'npc:sable', marker: L('landmark:quiet-hand-den') }],
        next: 'ledger',
      },
      {
        id: 'ledger', journal: 'The Wick keeps a ledger of every soul it has marked, locked in the Prior’s press in the cathedral vestry. The Quiet Hand wants it.',
        objectives: [{ id: 'ledger', text: 'Steal the Wick’s ledger from the cathedral vestry', when: { flag: 'act1.wick_ledger_taken' }, marker: L('landmark:haldren-cathedral') }],
        next: 'return',
      },
      {
        id: 'return', journal: 'The ledger is under your coat, and it is heavier than it looks. Take it back to Sable.',
        objectives: [{ id: 'sable2', text: 'Bring the ledger to Sable', talk: 'npc:sable', marker: L('landmark:quiet-hand-den') }],
        onComplete: [{ companion: 'npc:sable', following: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:the-quiet-hand', 'lore:wick-licence'] },
  },
];

export default quests;
