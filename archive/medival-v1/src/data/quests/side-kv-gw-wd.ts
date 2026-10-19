/** Regional side quests: Kingsvale, Greywater Marsh, Witherdowns (docs/lore/15-side-content.md). Owner: Claude 4. */
import type { QuestDef } from '@/core';

const L = (id: `landmark:${string}`) => ({ landmark: id });
const SIDE = { flag: 'content.side' };
const PRO = { flag: 'prologue.complete' };
/** flag-is-value condition */
const is = (flag: string, value: string) => ({ flag, op: '==' as const, value });

const LAMP = 'side.kv.lamplighters', SEED = 'side.kv.seed-corn';
const EEL = 'side.gw.eel-wives', BELL = 'side.gw.bell-of-varn';
const UNB = 'side.wd.unburied', CHALK = 'side.wd.chalk-giant';

const quests: QuestDef[] = [
  // ======================= KINGSVALE =======================
  {
    id: 'quest:side-kv-lamplighters', name: 'The Lamplighters’ Strike', type: 'side', act: 'act1', region: 'region:kingsvale', giver: 'npc:martin-lowe',
    summary: 'The lamplighters of Haldren have put down their ladders. The Brand-wicks of the Lantern Row burn blue and cold now, and in their light, Master Lowe says, the faces of passers-by look drowned.',
    requires: { all: [SIDE, { flag: 'act1.gate_passed' }] },
    firstStage: 'lamp',
    stages: [
      {
        id: 'lamp', journal: 'Master Martin Lowe will not send another lad up the ladder until someone tells him what is wrong with the lamps. Look at one of the Brand-wicks on the Lantern Row.',
        objectives: [{ id: 'lamp', text: 'Examine a Brand-wick on the Lantern Row', interact: 'obj:kv-cold-lamp', marker: L('landmark:kv-lantern-row') }],
        next: 'cellar',
      },
      {
        id: 'cellar', journal: 'Something black is climbing the lamp-irons from below. The guild keeps its oil in an old cellar under the Row, down in the drowned streets of the old town.',
        objectives: [
          { id: 'reach', text: 'Go down to the guild’s oil-cellar', reach: 'landmark:kv-oil-cellar', marker: L('landmark:kv-oil-cellar') },
          { id: 'mire', text: 'Clear the cellar of the things in the oil', kill: 'enemy:mireling', count: 3 },
          { id: 'seep', text: 'Burn out the seep beneath the vats', when: { flag: `${LAMP}.seep_purged` } },
        ],
        next: 'light',
      },
      {
        id: 'light', journal: 'The seep is burned out, and the oil that is left is clean. Tell Master Lowe, and decide with him how the Lantern Row is to be lit, if it is to be lit at all.',
        objectives: [{ id: 'choice', text: 'Speak to Master Lowe', when: { flag: `${LAMP}.outcome` }, marker: L('landmark:kv-lantern-row') }],
        next: [
          { when: is(`${LAMP}.outcome`, 'ember'), to: 'ember' },
          { when: is(`${LAMP}.outcome`, 'church'), to: 'church' },
          { to: 'camp' },
        ],
      },
      {
        id: 'ember', journal: 'You lit the forty-one lamps of the Lantern Row with the Ashmark. They burn red and warm, and the whole of Haldren came out to look at them. So, no doubt, did the Wick.',
        objectives: [], end: { status: 'completed', outcome: 'ember' },
      },
      {
        id: 'church', journal: 'Prior Benedek walked the Row with a taper from the cathedral altar and lit the lamps with prayers. They burn yellow and steady now, and the Church has taken the credit. The lamplighters do not seem to mind.',
        objectives: [], end: { status: 'completed', outcome: 'church' },
      },
      {
        id: 'camp', journal: 'The Lantern Row stays dark. The guild’s clean oil went out of the city gate on a handcart, to the cook-fires of the refugee camp, and the lamplighters went with it.',
        objectives: [], end: { status: 'completed', outcome: 'camp' },
      },
    ],
    reward: { xpTier: 2, gold: 60, items: [{ item: 'item:glyph-cinders', qty: 1 }] },
  },
  {
    id: 'quest:side-kv-seed-corn', name: 'Seed Corn', type: 'side', act: 'act1', region: 'region:kingsvale', giver: 'npc:osyth-reed',
    summary: 'At the barred gate of Wheatcombe forty refugees from Greywater are starving in the snow. Inside, the reeve sits on a barn full of seed-corn, and says that if it is eaten there will be no harvest for anyone.',
    requires: { all: [SIDE, PRO] },
    firstStage: 'reeve',
    stages: [
      {
        id: 'reeve', journal: 'Osyth Reed of Varn speaks for the refugees at Wheatcombe’s gate. Hear what Reeve Wulfric Hay has to say for himself.',
        objectives: [{ id: 'reeve', text: 'Talk to Reeve Wulfric Hay', talk: 'npc:wulfric-hay', marker: L('landmark:kv-wheatcombe') }],
        next: 'barn',
      },
      {
        id: 'barn', journal: 'The reeve swears every grain in the tithe-barn is for the spring sowing. The barn is guarded and barred. See for yourself what is in it.',
        objectives: [{ id: 'barn', text: 'Get into Wheatcombe’s tithe-barn', when: { flag: `${SEED}.barn_seen` }, marker: L('landmark:kv-wheatcombe') }],
        next: 'judge',
      },
      {
        id: 'judge', journal: 'There is less corn in the barn than the reeve’s tally says, and the tally says where the rest went. Go back to Wulfric Hay. Somebody is going to be hungry; decide who.',
        objectives: [{ id: 'judge', text: 'Settle the matter of the seed-corn with the reeve', when: { flag: `${SEED}.outcome` }, marker: L('landmark:kv-wheatcombe') }],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'It is settled, one way or another. Tell Osyth Reed.',
        objectives: [{ id: 'osyth', text: 'Tell Osyth Reed', talk: 'npc:osyth-reed', marker: L('landmark:kv-wheatcombe') }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 30, items: [{ item: 'item:glyph-haste', qty: 1 }] },
  },

  // ======================= GREYWATER =======================
  {
    id: 'quest:side-gw-eel-wives', name: 'The Eel-Wives', type: 'side', act: 'act1', region: 'region:greywater-marsh', giver: 'npc:old-cob',
    summary: 'Three Fenwick men have gone out to Ninestake Weir since Lanternmass and not come back. Now Old Cob’s grandson Jory has gone too. The fen says the eel-wives have them.',
    requires: { all: [SIDE, PRO] },
    firstStage: 'weir',
    stages: [
      {
        id: 'weir', journal: 'Ninestake Weir stands in the open water south of Fenwick. Cob says to go before dark. It is always nearly dark in Greywater.',
        objectives: [
          { id: 'reach', text: 'Pole out to Ninestake Weir', reach: 'landmark:gw-ninestake-weir', marker: L('landmark:gw-ninestake-weir') },
          { id: 'dead', text: 'Deal with the drowned men at the weir', kill: 'enemy:drowned-dead', count: 3 },
        ],
        next: 'jory',
      },
      {
        id: 'jory', journal: 'The drowned at the weir wore Fenwick ganseys. Out among the stakes, somebody living is singing.',
        objectives: [{ id: 'jory', text: 'Find Jory among the weir-stakes', when: { flag: `${EEL}.jory` }, marker: L('landmark:gw-ninestake-weir') }],
        next: 'cob',
      },
      {
        id: 'cob', journal: 'Go back to Old Cob in Fenwick and tell him what you found at Ninestake Weir, and what became of Jory.',
        objectives: [{ id: 'cob', text: 'Tell Old Cob, and settle the fate of the weir', when: { flag: `${EEL}.weir` }, marker: L('landmark:fenwick-stilts') }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 40, items: [{ item: 'item:glyph-frost', qty: 1 }] },
  },
  {
    id: 'quest:side-gw-bell-of-varn', name: 'The Bell of Varn', type: 'side', act: 'act1', region: 'region:greywater-marsh', giver: 'npc:ebba-gale',
    summary: 'Godwin’s Bell called the knights of Varn to stand on the Causeway whenever the water rose. It has lain in the fen since the Night of Falling Ash, and now the Choir is trying to raise it.',
    requires: { all: [SIDE, PRO] },
    firstStage: 'hole',
    stages: [
      {
        id: 'hole', journal: 'Ebba Gale, the last sluice-keeper of Varn, says the Choir has a raising-party at the Bell-Hole beside the Causeway. Stop them before they get it up.',
        objectives: [
          { id: 'reach', text: 'Go to the Bell-Hole', reach: 'landmark:gw-bell-hole', marker: L('landmark:gw-bell-hole') },
          { id: 'acolytes', text: 'Drive off the raising-party', kill: 'enemy:choir-acolyte', count: 3 },
          { id: 'priest', text: 'Silence the reed-priest leading them', kill: 'enemy:reed-priest', count: 1 },
        ],
        next: 'raise',
      },
      {
        id: 'raise', journal: 'The Choir left its windlass standing, and the bell is half out of the mud already. Finish what they started, but for better reasons.',
        objectives: [{ id: 'raise', text: 'Raise Godwin’s Bell', when: { flag: `${BELL}.raised` }, marker: L('landmark:gw-bell-hole') }],
        next: 'bell',
      },
      {
        id: 'bell', journal: 'Godwin’s Bell hangs dripping from the windlass. It is green with the fen and very old, and when the wind touches it, out on the Causeway the drowned knights turn their heads. Decide what is to be done with it.',
        objectives: [{ id: 'fate', text: 'Decide the fate of Godwin’s Bell', when: { flag: `${BELL}.fate` }, marker: L('landmark:gw-bell-hole') }],
        next: 'ebba',
      },
      {
        id: 'ebba', journal: 'Tell Ebba Gale what became of the bell.',
        objectives: [{ id: 'ebba', text: 'Return to Ebba Gale', talk: 'npc:ebba-gale', marker: L('landmark:varn-causeway-end') }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 50, items: [{ item: 'item:glyph-echo', qty: 1 }] },
  },

  // ======================= WITHERDOWNS =======================
  {
    id: 'quest:side-wd-unburied', name: 'The Unburied', type: 'side', act: 'act1', region: 'region:witherdowns', giver: 'npc:brother-wystan',
    summary: 'Every night since the River Under froze, a dead man has walked from Nithing Barrow to the door of King Eadmer’s tomb and knocked. Brother Wystan of the Ossuary cannot sleep for it, and has asked you to lay him to rest.',
    requires: SIDE,
    firstStage: 'hill',
    stages: [
      {
        id: 'hill', journal: 'Nithing Barrow lies alone on the downs, outside the ring of the King-Barrows. Brother Wystan says the stones were set face-down. Go and read them.',
        objectives: [{ id: 'stone', text: 'Read the stone at Nithing Barrow', interact: 'obj:wd-nithing-stone', marker: L('landmark:wd-nithing-barrow') }],
        next: 'wight',
      },
      {
        id: 'wight', journal: 'At dusk the barrow opened, and a dead boy in a king’s mail climbed out of it. He wants something of you. Hear him out.',
        objectives: [{ id: 'wulfstan', text: 'Speak with Wulfstan the Unsworn', when: { flag: `${UNB}.fate` }, marker: L('landmark:wd-nithing-barrow') }],
        next: [{ when: is(`${UNB}.fate`, 'redeemed'), to: 'door' }, { to: 'report' }],
      },
      {
        id: 'door', journal: 'Wulfstan will keep his oath at last, if King Eadmer’s guard will let him in. Take him to the king’s door among the King-Barrows, and speak for him.',
        objectives: [
          { id: 'door', text: 'Bring Wulfstan to King Eadmer’s door', when: { flag: `${UNB}.door_done` }, marker: L('landmark:king-barrows') },
        ],
        next: 'report',
      },
      {
        id: 'report', journal: 'It is over, one way or another. Tell Brother Wystan, so that he can write it down truly.',
        objectives: [{ id: 'wystan', text: 'Return to Brother Wystan', talk: 'npc:brother-wystan', marker: L('landmark:ossuary-of-saint-calder') }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 25, items: [{ item: 'item:glyph-lingering', qty: 1 }] },
  },
  {
    id: 'quest:side-wd-chalk-giant', name: 'The Chalk Giant', type: 'side', act: 'act1', region: 'region:witherdowns', giver: 'npc:hob-merriman',
    summary: 'The Long Man of Morrowcombe must be scoured white every dark of the year, or, the downs-folk say, the dead will walk. This year no one has gone up the hill. This year the dead are walking.',
    requires: SIDE,
    firstStage: 'hill',
    stages: [
      {
        id: 'hill', journal: 'Something walks on the Long Man at night. Hob Merriman will not take his spades up the hill until it is gone.',
        objectives: [
          { id: 'reach', text: 'Climb to the Long Man', reach: 'landmark:wd-chalk-giant', marker: L('landmark:wd-chalk-giant') },
          { id: 'dead', text: 'Clear the Restless from the hill', kill: null, family: 'restless', count: 3 },
        ],
        next: 'scour',
      },
      {
        id: 'scour', journal: 'The turf has crept in over the Long Man’s lines. Hob says scour the eye first, then the hammer, then the nail. That is the order. It has always been the order.',
        objectives: [{ id: 'scour', text: 'Scour the Long Man’s lines', interact: 'obj:wd-giant-scour-*', count: 3, marker: L('landmark:wd-chalk-giant') }],
        next: 'tolley',
      },
      {
        id: 'tolley', journal: 'At the nail-head an old man is waiting with a scouring-spade. He has been dead since the autumn. He is Hob’s father, and he would like a word.',
        objectives: [{ id: 'tolley', text: 'Speak with Tolley Merriman', when: { flag: `${CHALK}.fate` }, marker: L('landmark:wd-chalk-giant') }],
        next: 'home',
      },
      {
        id: 'home', journal: 'Go down to Morrowcombe and tell Hob Merriman how the Long Man was finished.',
        objectives: [{ id: 'hob', text: 'Return to Hob Merriman', talk: 'npc:hob-merriman', marker: L('landmark:wd-morrowcombe') }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 40, items: [{ item: 'item:glyph-widening', qty: 1 }] },
  },
];

export default quests;
