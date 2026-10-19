/** Act I, Chapter 2 "Allies in the Cold": Q4–Q8 (docs/lore/10-act1-spec.md). Owner: Claude 4. */
import type { QuestDef } from '@/core';

const L = (id: `landmark:${string}`) => ({ landmark: id });
const CH = 'Allies in the Cold';

const quests: QuestDef[] = [
  // ----- Q4
  {
    id: 'quest:the-singing-wood', name: 'The Singing Wood', type: 'main', act: 'act1', chapter: CH, region: 'region:kingsvale', giver: 'npc:cadoc-ap-ynys',
    summary: 'The Thornwise of the Ylwen Deepwood keep the oldest songs in Morvane, and they have shut their hedge against the world. The Queen needs them anyway.',
    firstStage: 'thornwall',
    stages: [
      {
        id: 'thornwall', journal: 'The Ylwen Deepwood begins at the Thornwall, a hedge of living wardwood on the western edge of the Kingsvale. Someone keeps its only door.',
        objectives: [
          { id: 'reach', text: 'Go to the Thornwall', reach: 'landmark:thornwall', marker: L('landmark:thornwall') },
          { id: 'cadoc', text: 'Speak with the hedge’s keeper', talk: 'npc:cadoc-ap-ynys', marker: L('landmark:thornwall') },
        ],
        onComplete: [{ unlockLore: 'lore:the-aelthi' }, { unlockLore: 'lore:cadoc-ap-ynys' }],
        next: [{ when: { flag: 'prologue.stag_fate', op: '==', value: 'cleansed' }, to: 'rhiannon' }, { to: 'seeps' }],
      },
      {
        id: 'seeps', journal: '“Three wounds, this side of the hedge,” Cadoc said. “The Old Sleeper is pushing up through our roots. You burn things. Burn those.”',
        objectives: [{ id: 'seeps', text: 'Purge the Mire seeps near the Thornwall', interact: 'obj:ylwen-seep-*', count: 3, marker: L('landmark:thornwall') }],
        onComplete: [{ reputation: 'faction:thornwise', delta: 5 }],
        next: 'rhiannon',
      },
      {
        id: 'rhiannon', journal: 'The Archdruid of the Thornwise has come to the Thornwall herself. She has not left the deepwood in eighty years.',
        objectives: [{
          id: 'pact', text: 'Hear the Archdruid out', marker: L('landmark:thornwall'),
          when: { any: [{ flag: 'act1.ylwen_pact' }, { flag: 'act1.ylwen_refused' }] },
        }],
        next: [{ when: { flag: 'act1.ylwen_pact' }, to: 'pact' }, { to: 'refused' }],
      },
      {
        id: 'pact', journal: 'You swore the Thornwise pact with your marked hand in Rhiannon’s. The deepwood is open to you, and Cadoc ap Ynys walks with you.', objectives: [],
        onEnter: [
          { reputation: 'faction:thornwise', delta: 15 },
          { companion: 'npc:cadoc-ap-ynys', following: true },
          { loyalty: 'npc:cadoc-ap-ynys', delta: 10 },
          { unlockLore: 'lore:ylwen-deepwood' },
        ],
        end: { status: 'completed', outcome: 'pact' },
      },
      {
        id: 'refused', journal: 'You would not swear. Rhiannon did not curse you; she only went back through the hedge, and the hedge closed behind her.', objectives: [],
        onEnter: [{ reputation: 'faction:thornwise', delta: -10 }],
        end: { status: 'completed', outcome: 'refused' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:the-lullaby', 'lore:sundering-of-ys'] },
  },
  // ----- Q5
  {
    id: 'quest:iron-and-oath', name: 'Iron and Oath', type: 'main', act: 'act1', chapter: CH, region: 'region:ironspine-foothills',
    summary: 'The Iron Concord has shut Dun Korrath-Gate against every human in Morvane. An exiled runesmith outside its walls says she knows why.',
    firstStage: 'gate',
    stages: [
      {
        id: 'gate', journal: 'Dun Korrath-Gate is the Orrun trade-gate in the foothills of the Ironspine. Ask there for the Concord’s help.',
        objectives: [
          { id: 'reach', text: 'Go to Dun Korrath-Gate', reach: 'landmark:dun-korrath-gate', marker: L('landmark:dun-korrath-gate') },
          { id: 'hedda', text: 'Speak with the Thane-Speaker at the gate', talk: 'npc:hedda-stonebrow', marker: L('landmark:dun-korrath-gate') },
        ],
        onComplete: [{ unlockLore: 'lore:iron-concord' }, { unlockLore: 'lore:the-orrun' }],
        next: 'grimma',
      },
      {
        id: 'grimma', journal: 'The gate is shut to humans. An exile keeps a forge in the snow beneath the wall: Grimma Ironsong, whose name Hedda would not say kindly.',
        objectives: [{ id: 'grimma', text: 'Speak with Grimma Ironsong at her forge', talk: 'npc:grimma-ironsong', marker: L('landmark:grimmas-forge') }],
        onComplete: [{ unlockLore: 'lore:grimma-ironsong' }, { unlockLore: 'lore:the-nine-nails' }],
        next: 'shaft',
      },
      {
        id: 'shaft', journal: '“Nine Nails. Seven hold. I counted.” Grimma wants proof the Concord cannot deny: a shard of the failed test-Nail at the bottom of the Old Nail Shaft.',
        objectives: [
          { id: 'reach', text: 'Descend to the Sunken Nail', reach: 'landmark:sunken-nail', marker: L('landmark:sunken-nail') },
          { id: 'wraiths', text: 'Destroy the rust-wraiths', kill: 'enemy:rust-wraith', count: 3, marker: L('landmark:sunken-nail') },
          { id: 'nail', text: 'Take a shard of the broken Nail', interact: 'obj:broken-nail', marker: L('landmark:sunken-nail') },
        ],
        onComplete: [{ giveItem: 'item:broken-nail-shard' }],
        next: 'judge',
      },
      {
        id: 'judge', journal: 'You have the shard. Iron does not lie, Grimma says. People do. Take it to Hedda Stonebrow at the gate, and decide what the crowd will hear.',
        objectives: [{ id: 'judge', text: 'Bring the shard before Hedda Stonebrow', marker: L('landmark:dun-korrath-gate'), when: { flag: 'act1.nails_choice' } }],
        next: [{ when: { flag: 'act1.nails_exposed' }, to: 'exposed' }, { to: 'kept' }],
      },
      {
        id: 'exposed', journal: 'You raised the shard before the whole gate. Seven Nails hold. Two have failed. The holds will know it by nightfall, and Grimma Ironsong walks with you.', objectives: [],
        onEnter: [
          { reputation: 'faction:iron-concord', delta: -15 },
          { companion: 'npc:grimma-ironsong', following: true },
          { loyalty: 'npc:grimma-ironsong', delta: 20 },
        ],
        end: { status: 'completed', outcome: 'exposed' },
      },
      {
        id: 'kept', journal: 'You closed your hand on the shard, and the gate opened. The Concord will stand with Haldmarch. Grimma Ironsong spat in the snow and went down the mountain alone.', objectives: [],
        onEnter: [{ reputation: 'faction:iron-concord', delta: 20 }, { setFlag: 'act1.concord_true_iron', value: true }],
        end: { status: 'completed', outcome: 'kept' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:dun-korrath-gate'] },
  },
  // ----- Q6
  {
    id: 'quest:the-river-under', name: 'The River Under', type: 'main', act: 'act1', chapter: CH, region: 'region:witherdowns',
    summary: 'The dead walk the Witherdowns at night and will not lie down. The Grey Monks of the Ossuary of Saint Calder say Saela’s river is freezing.',
    firstStage: 'ossuary',
    stages: [
      {
        id: 'ossuary', journal: 'The Grey Monks keep the dead of the Witherdowns at the Ossuary of Saint Calder. If anyone knows why the dead are restless, they will.',
        objectives: [{ id: 'ossory', text: 'Speak with the Grey Monks at the Ossuary', talk: 'npc:brother-ossory', marker: L('landmark:ossuary-of-saint-calder') }],
        onComplete: [{ unlockLore: 'lore:grey-monks-of-morrow' }, { unlockLore: 'lore:saela-and-the-river-under' }],
        next: 'barrows',
      },
      {
        id: 'barrows', journal: 'Brother Ossory says the River Under runs closest to the world beneath the King-Barrows, where his order once raised a shrine to Saela. The barrow-dead are awake.',
        objectives: [
          { id: 'reach', text: 'Enter the King-Barrows', reach: 'landmark:king-barrows', marker: L('landmark:king-barrows') },
          { id: 'wights', text: 'Lay the barrow-wights to rest', kill: 'enemy:barrow-wight', count: 4, marker: L('landmark:king-barrows') },
        ],
        onComplete: [{ unlockLore: 'lore:barrow-kings' }],
        next: 'shrine',
      },
      {
        id: 'shrine', journal: 'Below the oldest kings, the chalk gives way to black stone. Somewhere down there is Saela’s shrine, and the river of the dead.',
        objectives: [{ id: 'shrine', text: 'Find the shrine of the River Under', marker: L('landmark:river-under-shrine'), when: { flag: 'act1.river_truth' } }],
        next: 'report',
      },
      {
        id: 'report', journal: 'The river is frozen, and the dead are under the ice. A drowned singer of Ys told you what runs beneath it: a sea that was dreaming before it was chained. Brother Ossory will want to hear it. He may not be surprised.',
        objectives: [{ id: 'ossory', text: 'Return to Brother Ossory', talk: 'npc:brother-ossory', marker: L('landmark:ossuary-of-saint-calder') }],
        onComplete: [{ unlockLore: 'lore:morrow-the-veiled' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, skillPoints: 1 },
  },
  // ----- Q7
  {
    id: 'quest:salt-and-silver', name: 'Salt and Silver', type: 'side', act: 'act1', chapter: CH, region: 'region:saltreach-coast', giver: 'npc:wren-tallow',
    summary: 'Sailors in Haldren swear a star fell into the Saltreach on Lanternmass, and that the Salt League hauled it up in a net. Brackhaven will know the price of the story.',
    requires: { flag: 'act1.audience_done' }, autoStart: true,
    firstStage: 'docks',
    stages: [
      {
        id: 'docks', journal: 'If the Salt League has fished an Ember out of the sea, someone on the Brackhaven docks will be selling the tale.',
        objectives: [{ id: 'docks', text: 'Go to the Brackhaven docks', reach: 'landmark:brackhaven-docks', marker: L('landmark:brackhaven-docks') }],
        onComplete: [{ unlockLore: 'lore:salt-league' }],
        next: 'wren',
      },
      {
        id: 'wren', journal: 'Every dockhand points you to the same place: the Salt Exchange, and a factor named Wren Tallow, who knows the price of everything.',
        objectives: [{ id: 'wren', text: 'Find out what the Salt League has caught', marker: L('landmark:salt-exchange'), when: { flag: 'act1.auction_known' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50 },
  },
  // ----- Q8
  {
    id: 'quest:edrics-oath', name: 'Edric’s Oath', type: 'side', act: 'act1', chapter: CH, region: 'region:aldermoor', giver: 'npc:cuthred',
    summary: 'You warmed the River Under, a little, for a while. On the moor above Brindlecross a dead man has been waiting three hundred years to cross it.',
    requires: { all: [{ flag: 'act1.river_truth' }, { questCompleted: 'quest:smoke-from-the-barrow' }] }, autoStart: true,
    firstStage: 'door',
    stages: [
      {
        id: 'door', journal: '“When the river runs again, Ashmarked, come back. The King keeps something for you.” Cuthred is still behind the inner door of Edric’s Barrow.',
        objectives: [{ id: 'door', text: 'Return to the inner door of Edric’s Barrow', marker: L('landmark:edrics-barrow'), when: { flag: 'act1.edric_door_open' } }],
        next: 'tomb',
      },
      {
        id: 'tomb', journal: 'The King’s door stands open. Cuthred is waiting inside.',
        objectives: [{ id: 'cuthred', text: 'Speak with Cuthred', talk: 'npc:cuthred', marker: L('landmark:edrics-barrow') }],
        onComplete: [{ unlockLore: 'lore:edric-barrowborn', section: 'oath' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, items: [{ item: 'item:edrics-oath', qty: 1 }] },
  },
];

export default quests;
