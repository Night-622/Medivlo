/** Prologue quests 3–5 (docs/lore/07-prologue.md). Owner: Claude 4. */
import type { QuestDef } from '@/core';

const L = (id: `landmark:${string}`) => ({ landmark: id });

const quests: QuestDef[] = [
  {
    id: 'quest:the-witchfinder', name: 'The Witchfinder', type: 'main', act: 'prologue', region: 'region:aldermoor',
    summary: 'Riders of the Order of the Wick have come to Brindlecross, looking for "the one who lit the pyre".',
    firstStage: 'arrival',
    stages: [
      {
        id: 'arrival', journal: 'There are riders on the green, wearing the wick-scissors of the Inquisition.',
        onEnter: [{ unlockLore: 'lore:order-of-the-wick' }],
        objectives: [{ id: 'hale', text: 'Meet the Inquisitor', talk: 'npc:garrick-hale', marker: L('landmark:brindlecross-green') }],
        next: 'secret',
      },
      {
        id: 'secret', journal: 'Brother Anselm beckoned from the chapel door while the Inquisitor spoke to the Elder.',
        objectives: [{ id: 'anselm', text: 'See what Brother Anselm wants', talk: 'npc:anselm-pryde', marker: L('landmark:brindlecross-chapel') }],
        next: 'test',
      },
      {
        id: 'test', journal: 'Inquisitor Hale is waiting. He means to test you with the Last Wick.',
        objectives: [{ id: 'test', text: "Face the Inquisitor's test", marker: L('landmark:brindlecross-green'), when: { flag: 'prologue.hale_outcome' } }],
        next: [{ when: { flag: 'prologue.hale_outcome', op: '==', value: 'defied' }, to: 'fight' }, { to: 'sluice' }],
      },
      {
        id: 'fight', journal: 'You refused the Wick, and the Inquisitor’s soldiers drew steel.',
        objectives: [{ id: 'soldiers', text: 'Fight off the Inquisition', kill: 'enemy:wick-soldier', count: 3, marker: L('landmark:brindlecross-green') }],
        onComplete: [{ setFlag: 'npc.garrick-hale.wounded', value: true }],
        next: 'sluice',
      },
      {
        id: 'sluice', journal: "The abbey lies under Wennamere. The old Giant's Sluice could drain the mere, but the miller keeps the sluice-key.",
        objectives: [],
        onComplete: [{ startQuest: 'quest:the-millers-key' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    id: 'quest:the-millers-key', name: "The Miller's Key", type: 'main', act: 'prologue', region: 'region:aldermoor',
    summary: 'Draining Wennamere means opening the Giant’s Sluice, and Oswin the Miller keeps its key. He has not been himself since his wife drowned.',
    firstStage: 'ask',
    stages: [
      {
        id: 'ask', journal: 'Ask Oswin for the sluice-key.',
        objectives: [{ id: 'oswin', text: 'Ask Oswin the Miller for the sluice-key', talk: 'npc:oswin', marker: L('landmark:oswin-mill') }],
        next: 'investigate',
      },
      {
        id: 'investigate', journal: 'Oswin swears the key was lost years ago. He is lying, and badly. His strongbox might say more.',
        objectives: [
          { id: 'box', text: "Open Oswin's strongbox", marker: L('landmark:oswin-mill'), when: { flag: 'prologue.strongbox_opened' } },
          { id: 'wat', text: 'Ask around at The Guttered Candle', talk: 'npc:wat-fennick', optional: true, marker: L('landmark:guttered-candle') },
        ],
        next: 'confront',
      },
      {
        id: 'confront', journal: 'The sluice-key, and a Drowned Choir hymnal written in Oswin’s hand. Confront him.',
        onEnter: [{ unlockLore: 'lore:the-drowned-choir' }, { unlockLore: 'lore:the-mire', section: 'below' }],
        objectives: [{ id: 'confront', text: 'Confront Oswin', marker: L('landmark:oswin-mill'), when: { flag: 'prologue.oswin_fate' } }],
        next: 'sluice',
      },
      {
        id: 'sluice', journal: "Take the key to the Giant's Sluice and drain Wennamere. Something is guarding it.",
        objectives: [
          { id: 'reach', text: "Go to the Giant's Sluice", reach: 'landmark:giants-sluice', marker: L('landmark:giants-sluice') },
          { id: 'mirelings', text: 'Clear the Mirelings', kill: 'enemy:mireling', count: 5, marker: L('landmark:giants-sluice') },
          { id: 'wheel', text: 'Turn the sluice-wheel', when: { flag: 'prologue.sluice_turned' }, marker: L('landmark:giants-sluice') },
        ],
        onComplete: [
          { setFlag: 'prologue.mere_drained', value: true },
          { unlockLore: 'lore:the-orrin', section: 'sluice' },
          { startQuest: 'quest:the-drowned-abbey' },
        ],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:the-orrin'] },
  },
  {
    id: 'quest:the-drowned-abbey', name: 'The Drowned Abbey', type: 'main', act: 'prologue', region: 'region:aldermoor',
    summary: 'Wennamere has drained, and the Abbey of Saint Wenna stands black and dripping in the mud. The taken villagers are inside, and so is whatever fell from the sky.',
    firstStage: 'enter',
    stages: [
      {
        id: 'enter', journal: 'The abbey door stands open on the mudflats.',
        onEnter: [{ unlockLore: 'lore:saint-wenna' }],
        objectives: [{ id: 'enter', text: 'Enter the Drowned Abbey', reach: 'landmark:drowned-abbey', marker: L('landmark:drowned-abbey') }],
        next: 'nave',
      },
      {
        id: 'nave', journal: 'The nave is full of the drowned faithful, still kneeling.',
        objectives: [
          { id: 'nave', text: 'Search the nave', reach: 'landmark:abbey-nave' },
          { id: 'dead', text: 'Put the drowned dead to rest', kill: 'enemy:drowned-dead', count: 3 },
          { id: 'thralls', text: 'Cut down the Hollowed', kill: 'enemy:hollowed-thrall', count: 4 },
        ],
        next: 'crypt',
      },
      {
        id: 'crypt', journal: 'Voices below, in the crypt. The taken villagers are wrapped in black reeds.',
        objectives: [
          { id: 'crypt', text: 'Descend to the crypt', reach: 'landmark:abbey-crypt' },
          { id: 'cocoons', text: 'Cut the villagers free', interact: 'obj:reed-cocoon-*', count: 3 },
        ],
        next: 'tobin',
      },
      {
        id: 'tobin', journal: 'Tobin is here, bound in reeds and half-taken. His eyes are running black.',
        objectives: [{ id: 'tobin', text: 'Decide what to do for Tobin', when: { flag: 'prologue.tobin_fate' } }],
        next: 'abbess',
      },
      {
        id: 'abbess', journal: 'Something beneath the abbey is ringing the bells for the hours.',
        objectives: [
          { id: 'reliquary', text: 'Find the source of the bells', reach: 'landmark:abbey-reliquary' },
          { id: 'morwen', text: 'Defeat Abbess Morwen', kill: 'enemy:abbess-morwen', count: 1 },
        ],
        onComplete: [{ unlockLore: 'lore:saint-wenna', section: 'last-abbess' }, { openDialogue: 'dialogue:morwen-death' }],
        next: 'ember',
      },
      {
        id: 'ember', journal: 'In the reliquary, something burns white beneath the black water.',
        objectives: [{ id: 'ember', text: 'Take the fallen star', when: { flag: 'prologue.ember_claimed' } }],
        next: 'hesta',
      },
      {
        id: 'hesta', journal: 'Get out of the abbey. Someone is waiting on the shore with a sword that steams in the snow.',
        objectives: [
          { id: 'shore', text: 'Return to the shore of Wennamere', reach: 'landmark:wennamere-shore', marker: L('landmark:wennamere-shore') },
          { id: 'hesta', text: 'Speak with the stranger', talk: 'npc:hesta-corrow', marker: L('landmark:wennamere-shore') },
        ],
        onComplete: [
          { setFlag: 'prologue.complete', value: true },
          { unlockLore: 'lore:hesta-corrow' },
          { unlockLore: 'lore:the-emberwardens', section: 'last-warden' },
        ],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, skillPoints: 1, items: [{ item: 'item:wardens-token', qty: 1 }] },
  },
];

export default quests;
