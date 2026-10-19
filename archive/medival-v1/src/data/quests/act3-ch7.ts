/** Act III, Chapter 7: "The Siege of Haldren" (docs/lore/14-act3-spec.md). Owner: Claude 4. Dialogue in src/data/dialogue/act3-ch7*.ts. */
import type { QuestDef } from '@/core';

const L = (id: `landmark:${string}`) => ({ landmark: id });
const f = (flag: string) => ({ flag });
const eq = (flag: string, value: string) => ({ flag, op: '==' as const, value });
const Q = 'quest:the-last-lanternmass';
const CROWN = 'faction:crown-of-haldmarch' as const;

const quests: QuestDef[] = [
  {
    id: Q, name: 'The Last Lanternmass', type: 'main', act: 'act3', chapter: 'The Siege of Haldren', region: 'region:kingsvale', giver: 'npc:hesta-corrow',
    summary: 'Greywater is gone into the Mire, and the Mire has come up the River Hald. On the night of Lanternmass, two years to the night since the Brand went dark, the Hollowed tide will break on the walls of Haldren. Everyone you ever made a promise to is about to find out whether you kept it.',
    requires: { all: [f('act2.complete'), f('content.act3')] },
    autoStart: true,
    firstStage: 'muster',
    stages: [
      {
        id: 'muster', journal: 'The beacons are lit along the Kingsvale and the riders have gone out to every hall that owes you a debt. At Cinderhold they are calling the roll of who has answered. Go and hear it.',
        onEnter: [{ setFlag: 'act3.siege_active', value: true }, { setFlag: 'world.mire_level', value: 5 }],
        // The muster chain sets act3.ally.<x> and act3.ally_count node by node, and sets act3.muster_done when the roll is complete.
        // It is idempotent (its first node resets the count), so an interrupted roll is simply called again.
        objectives: [{ id: 'muster', text: 'Hear the muster at Cinderhold', marker: L('landmark:cinderhold-hall'), when: f('act3.muster_done') }],
        next: 'walls',
      },
      {
        id: 'walls', journal: 'The tide is on the plain below the South Gate: Hollowed in their thousands, walking in silence over the frozen fields, and the drowned knights of Varn riding in front of them. Get to the walls.',
        onEnter: [{ openDialogue: 'dialogue:ch7-walls' }, { unlockLore: 'lore:the-siege-of-haldren' }],
        objectives: [
          { id: 'reach', text: 'Reach the South Gate of Haldren', reach: 'landmark:haldren-gate', marker: L('landmark:haldren-gate') },
          { id: 'knights', text: 'Cut down the drowned knights', kill: 'enemy:drowned-knight', count: 3, marker: L('landmark:haldren-gate') },
          { id: 'thralls', text: 'Hold the gate against the Hollowed', kill: 'enemy:hollowed-thrall', count: 8, marker: L('landmark:haldren-gate') },
          { id: 'beast', text: 'Kill the mirebeast at the gate', kill: 'enemy:mirebeast', count: 1, marker: L('landmark:haldren-gate') },
        ],
        next: [
          { when: eq('act1.ruler', 'harrow'), to: 'betrayal' },
          { when: f('act3.ally.church'), to: 'fire' },
          { to: 'dawn' },
        ],
      },
      {
        id: 'betrayal', journal: 'Someone is raising the river gate, where the Hald runs in under the wall, and the banner on the water-stair is the Lord Protector’s own. Osric Harrow has made one more bargain.',
        onEnter: [{ openDialogue: 'dialogue:ch7-river-alarm' }],
        objectives: [
          { id: 'reach', text: 'Get to the river gate', reach: 'landmark:haldren-river-gate', marker: L('landmark:haldren-river-gate') },
          { id: 'harrow', text: 'Deal with Osric Harrow', marker: L('landmark:haldren-river-gate'), when: f('act3.harrow_fate') },
        ],
        next: [{ when: f('act3.ally.church'), to: 'fire' }, { to: 'dawn' }],
      },
      {
        id: 'fire', journal: 'Smoke from the lower city. The Order of the Wick is rolling pitch-barrels into the Narrows, where the refugees of Greywater sleep twelve to a room, and the Lord-Inquisitor is holding the torch.',
        onEnter: [{ openDialogue: 'dialogue:ch7-fire-alarm' }],
        objectives: [
          { id: 'reach', text: 'Get to the lower city', reach: 'landmark:lower-city', marker: L('landmark:lower-city') },
          { id: 'vellane', text: 'Face Castor Vellane', marker: L('landmark:lower-city'), when: f('act3.lower_city') },
        ],
        next: 'dawn',
      },
      {
        id: 'dawn', journal: 'The night is nearly over. In the market the great lantern of Haldren has hung cold for two years. It is Lanternmass morning.',
        onEnter: [{ openDialogue: 'dialogue:ch7-dawn' }],
        objectives: [{ id: 'dawn', text: 'Light the great lantern of Haldren', marker: L('landmark:haldren-market'), when: f('act3.siege_outcome') }],
        next: [{ when: eq('act3.siege_outcome', 'held'), to: 'held' }, { to: 'fallen' }],
      },
      {
        id: 'held', journal: 'Haldren held. On Lanternmass morning every lantern in the city was burning, and the tide went back down the Hald into the dark. Now the dark must be followed home.',
        objectives: [],
        onComplete: [
          { setFlag: 'act3.siege_active', value: false },
          { reputation: CROWN, delta: 10 },
          { unlockLore: 'lore:the-last-lanternmass' },
        ],
        end: { status: 'completed', outcome: 'held' },
      },
      {
        id: 'fallen', journal: 'Haldren fell on Lanternmass morning with every lantern in it burning. The survivors walked up the crag road to Cinderhold carrying them. There is nowhere left to fall back to, only forward, into the Mire.',
        objectives: [],
        onComplete: [
          { setFlag: 'act3.siege_active', value: false },
          { unlockLore: 'lore:the-last-lanternmass' },
        ],
        end: { status: 'completed', outcome: 'fallen' },
      },
    ],
    reward: {
      xpTier: 3, skillPoints: 1,
      rep: [{ faction: CROWN, delta: 10 }, { faction: 'faction:emberwardens', delta: 10 }, { faction: 'faction:drowned-choir', delta: -15 }],
      lore: ['lore:the-siege-of-haldren', 'lore:the-last-lanternmass'],
    },
  },
];

export default quests;
