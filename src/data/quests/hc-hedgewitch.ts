/**
 * Hollow Crown: the HEDGEWITCH campaign (docs/lore/hollow-crown/06-outlines/verdant.md). Act I in Rootholme
 * (area:verdant-capital) and the Act II class thread in Concordia. Act III class quests land with the Heart.
 * Zones: -1 the Bough Markets, -2 the Sap Wells, -3 the Root Cellars, -4 the Canopy Hollows. Owner: Claude 4.
 */
import type { NarrativeCondition, QuestDef } from '@/core';

const HW: NarrativeCondition = { heroClass: 'hedgewitch' };
const done = (q: `quest:${string}`): NarrativeCondition => ({ questCompleted: q });
const req = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: [HW, ...c] });
const A1 = { act: 'act1' as const, campaign: 'hedgewitch', chapter: 'Rootholme' };
const A2 = { act: 'act2' as const, campaign: 'hedgewitch', chapter: 'Concordia' };
const A3 = { act: 'act3' as const, campaign: 'hedgewitch', chapter: 'The Heart' };
const Z1 = 'zone:verdant-capital-1' as const, Z2 = 'zone:verdant-capital-2' as const, Z3 = 'zone:verdant-capital-3' as const, Z4 = 'zone:verdant-capital-4' as const;
const L1 = 'inst:verdant-capital-lair-1' as const, L2 = 'inst:verdant-capital-lair-2' as const, L3 = 'inst:verdant-capital-lair-3' as const;
const YA = 'npc:mother-yarrow' as const, OS = 'npc:ostara' as const;

const quests: QuestDef[] = [
  // ======================= ACT I: main (I-1 … I-10)
  {
    ...A1, id: 'quest:hedgewitch-the-bell-in-the-boughs', name: 'The Bell in the Boughs', type: 'main', region: Z1, giver: YA,
    summary: 'Night on the Bough Markets. A bell rang somewhere very far away, every leaf on the Elder Tree turned silver side up, and the whole tree grew a ring in one breath.',
    requires: HW, autoStart: true, firstStage: 'boughs',
    stages: [
      {
        id: 'boughs', journal: 'The bough-bridge snapped under you, and the new growth is full of Briarlings, all elbows and thorns. Something in your chest is singing.',
        onEnter: [{ openDialogue: 'dialogue:hedgewitch-bell-night' }],
        objectives: [{ id: 'briarlings', text: 'Fight off the Briarlings in the new growth', kill: 'bx_verdant_2', count: 3, marker: { place: Z1 } }],
        next: 'yarrow',
      },
      {
        id: 'yarrow', journal: 'On the next bough over, in her slippers, Mother Yarrow is telling the Elder Tree to hush.',
        objectives: [{ id: 'yarrow', text: 'Climb across to Mother Yarrow', talk: YA, marker: { landmark: 'landmark:yarrow-bower' } }],
        onComplete: [{ setFlag: 'hedgewitch.bell_heard', value: true }],
        next: 'trunk',
      },
      {
        id: 'trunk', journal: 'Yarrow wants a word with the tree before bed, and she wants it at the trunk, where it can’t pretend not to hear. She has set off along the bough-road in her slippers.',
        objectives: [{ id: 'hush', text: 'Follow Yarrow along the bough-road to the trunk', reach: 'landmark:hedgewitch-hush-bough', marker: { landmark: 'landmark:hedgewitch-hush-bough' } }],
        next: 'hush',
      },
      {
        id: 'hush', journal: 'The Hushing Bough, where the market meets the trunk. Yarrow has both hands on the bark and is waiting for you to do the same.',
        objectives: [{ id: 'yarrow', text: 'Listen to the tree with Yarrow', talk: YA, marker: { landmark: 'landmark:hedgewitch-hush-bough' } }],
        onComplete: [{ startQuest: 'quest:hedgewitch-pruning-day' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-wildheart', 'lore:hc-elder-tree'] },
  },
  {
    ...A1, id: 'quest:hedgewitch-pruning-day', name: 'Pruning Day', type: 'main', region: Z1, giver: YA,
    summary: 'Mother Yarrow has lent you her second-best shears. Five market stalls are buried under last night’s growth, and the stallholders would like to open before lunch.',
    requires: req(done('quest:hedgewitch-the-bell-in-the-boughs')), firstStage: 'stalls',
    stages: [
      {
        id: 'stalls', journal: 'Cut five stalls free on the Bough Markets. Gently. Yarrow says the tree feels it.',
        objectives: [{ id: 'stalls', text: 'Prune the market stalls free', interact: 'obj:verdant-stall-*', count: 5, marker: { place: Z1 } }],
        next: 'lantern',
      },
      {
        id: 'lantern', journal: 'The fourth stall was weeping black sap. And Lantern Row, the next street over, is simply gone: swallowed whole by the tree overnight, cats and all.',
        objectives: [{ id: 'row', text: 'Look at what is left of Lantern Row', reach: 'landmark:lantern-row', marker: { landmark: 'landmark:lantern-row' } }],
        next: 'row',
      },
      {
        id: 'row', journal: 'Lantern Row is under a skin of new bark, smooth as a bowl. Here and there you can still see what it swallowed. Look closer.',
        objectives: [{ id: 'clues', text: 'Look for what is left of Lantern Row under the bark', interact: 'obj:hedgewitch-lantern-clue-*', count: 3, marker: { landmark: 'landmark:lantern-row' } }],
        next: 'report',
      },
      {
        id: 'report', journal: 'A whole street under new bark. You could hear a cat somewhere inside it, complaining.',
        objectives: [{ id: 'yarrow', text: 'Tell Mother Yarrow', talk: YA, marker: { landmark: 'landmark:yarrow-bower' } }],
        onComplete: [{ startQuest: 'quest:hedgewitch-the-sleeping-cellars' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:hedgewitch-the-sleeping-cellars', name: 'The Sleeping Cellars', type: 'main', region: Z3, giver: YA,
    summary: 'A whole cellar-street in the Root Cellars has fallen asleep, mid-supper, and nobody can wake it. The spores are drifting up from a mushroom cellar below.',
    requires: req(done('quest:hedgewitch-pruning-day')), firstStage: 'sleepers',
    stages: [
      {
        id: 'sleepers', journal: 'Down in the Root Cellars, people are asleep at their tables with their spoons still in their hands.',
        objectives: [{ id: 'sleepers', text: 'Check on the sleepers of Spindle Street', interact: 'obj:cellar-sleeper-*', count: 3, marker: { place: Z3 } }],
        next: 'enter',
      },
      {
        id: 'enter', journal: 'The spores are coming up through the floor from the old Spore Cellar. Something down there is breathing.',
        objectives: [{ id: 'cellar', text: 'Go down into the Spore Cellar', reach: L1, marker: { place: Z3 } }],
        next: 'puffcap',
      },
      {
        id: 'puffcap', journal: 'A mushroom the size of a cottage. Stamp its puffballs flat, and strike its gills while it breathes in.',
        objectives: [{ id: 'puffcap', text: 'Defeat the Ancient Puffcap', kill: 'bx_verdant_4', count: 1 }],
        next: 'report',
      },
      {
        id: 'report', journal: 'Up on Spindle Street, people are waking and finishing their soup. Its spores were black. Yarrow has come down from the bower with a pot of fresh soup and a ladle.',
        objectives: [{ id: 'yarrow', text: 'Tell Mother Yarrow about the black spores, on Spindle Street', talk: YA, marker: { landmark: 'landmark:spindle-street' } }],
        onComplete: [{ setFlag: 'hedgewitch.puffcap_down', value: true }, { startQuest: 'quest:hedgewitch-the-bramblewifes-garden' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 80, hcItems: [{ item: 'i_anti', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:hedgewitch-the-bramblewifes-garden', name: 'The Bramblewife’s Garden', type: 'main', region: Z2, giver: OS,
    summary: 'Bramblewife Ostara grows medicine in the Sap Wells, and nobody in her ward has died in a year. She has heard about the Puffcap, and she would love to meet you.',
    requires: req(done('quest:hedgewitch-the-sleeping-cellars')), firstStage: 'garden',
    stages: [
      {
        id: 'garden', journal: 'Ostara’s sap-garden is at the bottom of the Sap Wells, where the tree’s sap comes up warm.',
        objectives: [{ id: 'ostara', text: 'Visit Bramblewife Ostara’s garden', talk: OS, marker: { landmark: 'landmark:ostara-sap-garden' } }],
        next: 'rounds',
      },
      {
        id: 'rounds', journal: 'Ostara has handed you a ladle and three patients. “Just a spoonful each, love. They’ll be right as rain.”',
        objectives: [{ id: 'beds', text: 'Help Ostara on her rounds', interact: 'obj:ostara-ward-bed-*', count: 3, marker: { landmark: 'landmark:ostara-sap-garden' } }],
        next: 'well',
      },
      {
        id: 'well', journal: 'The ladle is empty. Ostara has gone down the sap-stair to the Deep Well to fill her buckets, and she wants you to see where her medicine comes from.',
        objectives: [{ id: 'well', text: 'Go down the sap-stair to the Deep Well', reach: 'landmark:hedgewitch-deep-well', marker: { landmark: 'landmark:hedgewitch-deep-well' } }],
        next: 'draw',
      },
      {
        id: 'draw', journal: 'The Deep Well, at the very bottom of the Sap Wells, where the sap comes up warm from the heart of the tree. Ostara is letting down a bucket.',
        objectives: [{ id: 'ostara', text: 'Help Ostara draw sap at the Deep Well', talk: OS, marker: { landmark: 'landmark:hedgewitch-deep-well' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Three patients, three spoonfuls, three smiles, and two full buckets. Ostara is back in her garden with tea and sticky hands.',
        objectives: [{ id: 'ostara', text: 'Go back to Ostara', talk: OS, marker: { landmark: 'landmark:ostara-sap-garden' } }],
        onComplete: [{ setFlag: 'hedgewitch.ostara_met', value: true }, { startQuest: 'quest:hedgewitch-the-ring-vote' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-ostara'] },
  },
  {
    ...A1, id: 'quest:hedgewitch-the-ring-vote', name: 'The Ring Vote', type: 'main', region: Z1, giver: YA,
    summary: 'The Root Circle meets tonight to vote on the Great Pruning: burn back a year’s growth to save the swallowed streets. The Bloomkin who woke in that growth would go back to seed.',
    requires: req(done('quest:hedgewitch-the-bramblewifes-garden')), firstStage: 'canvass',
    stages: [
      {
        id: 'canvass', journal: 'Before the ring sits, Yarrow says, find out what the Pruning means to the people it will cost. The Eldest is at the ring already, practising. One of the new-woken Bloomkin has been standing on Lantern Row all week.',
        objectives: [
          { id: 'cicely', text: 'Ask Eldest Cicely Rue to make the case for the Pruning', talk: 'npc:cicely-rue', marker: { landmark: 'landmark:root-circle-ring' } },
          { id: 'campion', text: 'Ask the Bloomkin on Lantern Row what the Pruning would cost', talk: 'npc:campion', marker: { landmark: 'landmark:lantern-row' } },
        ],
        next: 'vote',
      },
      {
        id: 'vote', journal: 'The Circle meets in its ring, and disagrees in its ring. Yarrow has saved you a seat on the root.',
        objectives: [{ id: 'vote', text: 'Speak at the Root Circle’s ring', when: { flag: 'hedgewitch.pruning' }, marker: { landmark: 'landmark:root-circle-ring' } }],
        next: 'dawn',
      },
      {
        id: 'dawn', journal: 'Whatever the ring decided, it happens at dawn. Yarrow says you should see it with your own eyes, on Cobble Lane, where she was born.',
        objectives: [{ id: 'lane', text: 'Go to Cobble Lane at dawn and see what the ring has done', interact: 'obj:hedgewitch-cobble-lane', marker: { landmark: 'landmark:hedgewitch-cobble-lane' } }],
        onComplete: [{ startQuest: 'quest:hedgewitch-the-seed-vault' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-root-circle', 'lore:hc-bloomkin'] },
  },
  {
    ...A1, id: 'quest:hedgewitch-the-seed-vault', name: 'The Seed Vault', type: 'main', region: Z3, giver: YA,
    summary: 'Whatever the ring decided, everyone needs the Seed Vault now. Its keeper is a topiary giant that prunes anyone who comes in.',
    requires: req(done('quest:hedgewitch-the-ring-vote')), firstStage: 'vault',
    stages: [
      {
        id: 'vault', journal: 'The Circle’s Seed Vault lies under the Root Cellars, behind a door shaped like an acorn.',
        objectives: [{ id: 'enter', text: 'Enter the Seed Vault', reach: L2, marker: { place: Z3 } }],
        onComplete: [{ openDialogue: 'dialogue:hedgewitch-seed-vault' }],
        next: 'aisles',
      },
      {
        id: 'aisles', journal: 'The Gardener has pruned the vault’s aisles into hedges, and somewhere behind them it is still at work. Cut your way through.',
        objectives: [{ id: 'aisles', text: 'Cut through the overgrown aisles of the Seed Vault', interact: 'obj:hedgewitch-vault-aisle-*', count: 3 }],
        next: 'gardener',
      },
      {
        id: 'gardener', journal: 'The Gardener is still pruning a garden nobody wants. It will prune your summoned plants first.',
        objectives: [{ id: 'gardener', text: 'Defeat the Gardener', kill: 'cb_the-gardener', count: 1 }],
        next: 'ledger',
      },
      {
        id: 'ledger', journal: 'The Gardener kept a seed-ledger, in very small, very neat leaves.',
        objectives: [{ id: 'ledger', text: 'Read the Gardener’s seed-ledger', interact: 'obj:seed-vault-ledger' }],
        onComplete: [{ setFlag: 'hedgewitch.empty_drawer', value: true }, { startQuest: 'quest:hedgewitch-what-the-bramblewife-planted' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 120 },
  },
  {
    ...A1, id: 'quest:hedgewitch-what-the-bramblewife-planted', name: 'What the Bramblewife Planted', type: 'main', region: Z4, giver: YA,
    summary: 'One drawer in the Seed Vault is empty: the seed of the Elder Tree itself, signed out by Ostara. Her grafts run all the way up into the Canopy Hollows.',
    requires: req(done('quest:hedgewitch-the-seed-vault')), firstStage: 'ward',
    stages: [
      {
        id: 'ward', journal: 'Ostara is not in her garden. Her ward in the Sap Wells is tidy, warm and empty of her. Look round before you follow.',
        objectives: [{ id: 'ward', text: 'Search Ostara’s ward in the Sap Wells', interact: 'obj:hedgewitch-ward-clue-*', count: 3, marker: { landmark: 'landmark:ostara-sap-garden' } }],
        next: 'grafts',
      },
      {
        id: 'grafts', journal: 'Follow Ostara’s grafts up into the crown of the tree. They are fat, and warm, and they pulse.',
        objectives: [{ id: 'grafts', text: 'Follow the grafts into the Canopy Hollows', interact: 'obj:canopy-graft-*', count: 3, marker: { place: Z4 } }],
        next: 'ostara',
      },
      {
        id: 'ostara', journal: 'At the top of the grafts, where they bite into the tree’s crown, Ostara is waiting with a watering can.',
        objectives: [{ id: 'ostara', text: 'Confront Bramblewife Ostara', talk: OS, marker: { landmark: 'landmark:canopy-graft-crown' } }],
        onComplete: [{ setFlag: 'hedgewitch.ostara_known', value: true }],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'Ostara has gone down to the Heartwood. Before you follow, Yarrow has to hear it from you. She has known Ostara since Ostara was a girl.',
        objectives: [{ id: 'yarrow', text: 'Tell Mother Yarrow what Ostara has done', talk: YA, marker: { landmark: 'landmark:yarrow-bower' } }],
        onComplete: [{ startQuest: 'quest:hedgewitch-the-heartwood' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-black-sap'] },
  },
  {
    ...A1, id: 'quest:hedgewitch-the-heartwood', name: 'The Heartwood', type: 'main', region: L3, giver: YA,
    summary: 'Ostara has gone down into the Heartwood, the living heart of the Elder Tree, to take the half-stone that sings there. She means to make the tree cover the world.',
    requires: req(done('quest:hedgewitch-what-the-bramblewife-planted')), firstStage: 'descend',
    stages: [
      {
        id: 'descend', journal: 'Down through the root-tunnels to where the wood beats like a heart. Your half-stone is singing so loudly the bark hums.',
        objectives: [{ id: 'enter', text: 'Go down into the Heartwood', reach: L3, marker: { place: Z3 } }],
        next: 'ostara',
      },
      {
        id: 'ostara', journal: 'Ostara is grafted into the Heartwood itself, and the tree’s limbs move when she does. Cut her sap-grafts with the stone’s song.',
        objectives: [{ id: 'ostara', text: 'Stop Bramblewife Ostara', kill: 'cb_bramblewife-ostara', count: 1 }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'Ostara tore herself loose and rode a tunnelling root away down into the dark. The Heartwood half is still in its knot of living wood, singing.',
        objectives: [{ id: 'stone', text: 'Claim the Heartwood half', interact: 'obj:verdant-capital-halfstone' }],
        onComplete: [{ setFlag: 'hedgewitch.halfstone', value: true }, { startQuest: 'quest:hedgewitch-the-root-road' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, skillPoints: 1, lore: ['lore:hc-half-stones'] },
  },
  {
    ...A1, id: 'quest:hedgewitch-the-root-road', name: 'The Root Road', type: 'main', region: Z1, giver: YA,
    summary: 'Ostara’s root is tunnelling towards the Thorn Gate. The half-stone in your hand can open it. Mother Yarrow has put the kettle on.',
    requires: req(done('quest:hedgewitch-the-heartwood')), firstStage: 'farewell',
    stages: [
      {
        id: 'farewell', journal: 'Yarrow is in her bower with two cups and something wrapped in a dock leaf.',
        objectives: [{ id: 'yarrow', text: 'Say goodbye to Mother Yarrow', talk: YA, marker: { landmark: 'landmark:yarrow-bower' } }],
        next: 'hazel',
      },
      {
        id: 'hazel', journal: 'Halfway down the Root Road stands the Leaving Hazel, where every witch who leaves Rootholme ties a strip of her apron, so the tree remembers who went. Nobody has tied one in thirty years.',
        objectives: [{ id: 'hazel', text: 'Stop at the Leaving Hazel on the Root Road', interact: 'obj:hedgewitch-leaving-hazel', marker: { landmark: 'landmark:hedgewitch-leaving-hazel' } }],
        next: 'road',
      },
      {
        id: 'road', journal: 'The Root Road runs down the trunk and out to the Thorn Gate, where the Elder Grove has wrapped itself round the arch.',
        objectives: [{ id: 'gate', text: 'Take the Root Road to the Thorn Gate', reach: 'area:verdant-gate', marker: { place: 'area:verdant-gate' } }],
        onComplete: [{ startQuest: 'quest:hedgewitch-the-thorn-gate' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:hedgewitch-the-thorn-gate', name: 'The Thorn Gate', type: 'main', region: 'area:verdant-gate', giver: YA,
    summary: 'The Elder Grove, the tree’s own root-mind, has been hollowed and has wrapped itself round the Thorn Gate. It has not slept in thirty years.',
    requires: req(done('quest:hedgewitch-the-root-road')), firstStage: 'grove',
    stages: [
      {
        id: 'grove', journal: 'Cut the hollow roots. Between the knots, sing the half-stone to it, the way Yarrow sings to the tree.',
        objectives: [{ id: 'grove', text: 'Talk the Elder Grove down', kill: 'bx_verdant_5', count: 1 }],
        next: 'gate',
      },
      {
        id: 'gate', journal: 'The Grove let go of the gate and lay down to sleep. The arch is weeping black sap down its face.',
        objectives: [{ id: 'seal', text: 'Open the Thorn Gate with the half-stone', interact: 'obj:verdant-gate-seal' }],
        onComplete: [{ setFlag: 'story.gate_open', value: true }, { setFlag: 'story.act', value: 2 }, { setFlag: 'hedgewitch.act1_done', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 200, lore: ['lore:hc-realm-gates', 'lore:hc-elder-grove'] },
  },

  // ======================= ACT I: side quests (2 per zone)
  {
    ...A1, id: 'quest:hedgewitch-too-many-cats', name: 'Too Many Cats', type: 'side', region: Z1, giver: 'npc:prudence-coddle',
    summary: 'Lantern Row was swallowed with nineteen cats in it. Prudence Coddle has counted them twice, and would like all nineteen back before teatime.',
    requires: req(done('quest:hedgewitch-pruning-day')), firstStage: 'cats',
    stages: [
      {
        id: 'cats', journal: 'The cats of Lantern Row are somewhere in the new wood, in knot-holes, up branches and inside a hollow bench.',
        objectives: [{ id: 'cats', text: 'Coax the cats out of the new wood', interact: 'obj:lantern-cat-*', count: 4, marker: { landmark: 'landmark:lantern-row' } }],
        next: 'tibbs',
      },
      {
        id: 'tibbs', journal: 'Eighteen cats. The nineteenth is a Bloomkin, a small walking rose-hip, and it insists that it is a cat.',
        objectives: [{ id: 'tibbs', text: 'Persuade the nineteenth cat to come home', talk: 'npc:tibbs', marker: { landmark: 'landmark:lantern-row' } }],
        next: 'prudence',
      },
      {
        id: 'prudence', journal: 'Nineteen cats, near enough.',
        objectives: [{ id: 'prudence', text: 'Bring the cats back to Prudence Coddle', talk: 'npc:prudence-coddle', marker: { landmark: 'landmark:lantern-row' } }],
        next: 'register',
      },
      {
        id: 'register', journal: 'Prudence will not rest until the nineteenth cat is written into the Circle’s register of Lantern Row cats, like the other eighteen. The register is kept by Beadle Wort, at the notice-bough.',
        objectives: [{ id: 'wort', text: 'Have Beadle Wort enter Tibbs in the register of cats', talk: 'npc:thaddeus-wort', marker: { landmark: 'landmark:circle-notice-bough' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40, hcItems: [{ item: 'i_cheese' }] },
  },
  {
    ...A1, id: 'quest:hedgewitch-the-compost-debate', name: 'The Compost Debate', type: 'side', region: Z1, giver: 'npc:hepzibah-marl',
    summary: 'Hepzibah Marl and Old Fennimore Clay have argued about compost across the same bough for forty years. Hepzibah wants it settled, in her favour, by teatime.',
    requires: req(done('quest:hedgewitch-the-bell-in-the-boughs')), firstStage: 'heaps',
    stages: [
      {
        id: 'heaps', journal: 'Look at both their heaps, and the Market’s big one, and form an opinion. Hepzibah would like it to be hers.',
        objectives: [{ id: 'heaps', text: 'Inspect the compost heaps of the Bough Markets', interact: 'obj:bough-compost-*', count: 3, marker: { place: Z1 } }],
        next: 'fennimore',
      },
      {
        id: 'fennimore', journal: 'Not one of the heaps is rotting. Not even a little. Old Fennimore has opinions about that, too.',
        objectives: [{ id: 'fennimore', text: 'Hear Old Fennimore Clay’s side', talk: 'npc:fennimore-clay', marker: { landmark: 'landmark:compost-bough' } }],
        next: 'hepzibah',
      },
      {
        id: 'hepzibah', journal: 'They are both wrong. The whole city has stopped rotting.',
        objectives: [{ id: 'hepzibah', text: 'Give Hepzibah your verdict', talk: 'npc:hepzibah-marl', marker: { landmark: 'landmark:compost-bough' } }],
        next: 'old-heap',
      },
      {
        id: 'old-heap', journal: 'Fennimore swears there is one heap in Rootholme older than the Hollowing: the Circle’s Old Heap, at the bottom of the Root Cellars. Hepzibah has sent you down with a cabbage leaf, to see if it will take it.',
        objectives: [{ id: 'heap', text: 'Try the cabbage leaf on the Circle’s Old Heap', interact: 'obj:hedgewitch-old-heap', marker: { place: Z3 } }],
        next: 'truce',
      },
      {
        id: 'truce', journal: 'The Old Heap is rotting. Slowly, sweetly, the way compost should. Both of them will want to hear why.',
        objectives: [{ id: 'hepzibah', text: 'Tell Hepzibah and Fennimore about the Old Heap', talk: 'npc:hepzibah-marl', marker: { landmark: 'landmark:compost-bough' } }],
        onComplete: [{ setFlag: 'hedgewitch.compost_truce', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-rootholme-compost'] },
  },
  {
    ...A1, id: 'quest:hedgewitch-a-sticky-situation', name: 'A Sticky Situation', type: 'side', region: Z2, giver: 'npc:dunstan-treacle',
    summary: 'Sap-tapper Dunstan Treacle has been stuck to his own tap for three days and is being very brave about it.',
    requires: req(done('quest:hedgewitch-the-sleeping-cellars')), firstStage: 'kettle',
    stages: [
      {
        id: 'kettle', journal: 'Sap lets go of anything for hot water, Dunstan says, and the tappers’ kettle is on the far side of the Well.',
        objectives: [{ id: 'kettle', text: 'Fetch the tappers’ kettle', interact: 'obj:sap-well-kettle', marker: { place: Z2 } }],
        next: 'tap',
      },
      {
        id: 'tap', journal: 'One kettle of hot water, and one sap-tapper, set like a fly in amber.',
        objectives: [{ id: 'tap', text: 'Unstick Dunstan from his tap', interact: 'obj:treacle-tap', marker: { place: Z2 } }],
        next: 'dunstan',
      },
      {
        id: 'dunstan', journal: 'Dunstan is free and has fallen over.',
        objectives: [{ id: 'dunstan', text: 'Help Dunstan up', talk: 'npc:dunstan-treacle', marker: { place: Z2 } }],
        next: 'junction',
      },
      {
        id: 'junction', journal: 'Dunstan says it wasn’t the sap that held him. The tap was pulling, as if something at the other end of the line was drinking. Follow the tappers’ pipe down the Well.',
        objectives: [{ id: 'pipe', text: 'Follow the tappers’ pipe to where it pulls', interact: 'obj:hedgewitch-sap-junction', marker: { landmark: 'landmark:hedgewitch-deep-well' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Someone has fitted a new pipe to the tappers’ line, low down where nobody looks, and it is drawing their sap away up the Well. Dunstan should know.',
        objectives: [{ id: 'dunstan', text: 'Tell Dunstan what was drinking his sap', talk: 'npc:dunstan-treacle', marker: { landmark: 'landmark:sap-tappers-well' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50, hcItems: [{ item: 'i_cake' }] },
  },
  {
    ...A1, id: 'quest:hedgewitch-gran-hasnt-said-a-word', name: 'Gran Hasn’t Said a Word', type: 'side', region: Z2, giver: 'npc:ned-burdock',
    summary: 'Young Ned Burdock wants to know whether his Gran is better. Ostara healed her a month ago, and she has not spoken since.',
    requires: req(done('quest:hedgewitch-the-bramblewifes-garden')), firstStage: 'gran',
    stages: [
      {
        id: 'gran', journal: 'Gran Burdock sits in the sun outside Ostara’s ward every day, smiling at nothing.',
        objectives: [{ id: 'gran', text: 'Sit with Gran Burdock', talk: 'npc:gran-burdock', marker: { landmark: 'landmark:ostara-sap-garden' } }],
        next: 'ned',
      },
      {
        id: 'ned', journal: 'She smiled the whole time. Her hands were cool and green at the nails, and she smelled of sap.',
        objectives: [{ id: 'ned', text: 'Tell Ned about his Gran', talk: 'npc:ned-burdock', marker: { place: Z2 } }],
        onComplete: [{ setFlag: 'hedgewitch.gran_seen', value: true }],
        next: 'peppermints',
      },
      {
        id: 'peppermints', journal: 'Ned says his Gran always smelled of peppermints, and kept a twist of them in her apron for him. The sweet-seller on the Bough Markets makes them. Perhaps the smell will reach her.',
        objectives: [{ id: 'jar', text: 'Get a twist of peppermints from the sweet stall', interact: 'obj:hedgewitch-peppermint-jar', marker: { place: Z1 } }],
        next: 'apron',
      },
      {
        id: 'apron', journal: 'A twist of peppermints, the old-fashioned sort, in a paper screw. Ned wants them in her apron pocket, where they used to be.',
        objectives: [{ id: 'gran', text: 'Put the peppermints in Gran Burdock’s apron', talk: 'npc:gran-burdock', marker: { landmark: 'landmark:ostara-sap-garden' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:hedgewitch-moving-day', name: 'Moving Day', type: 'side', region: Z3, giver: 'npc:hester-mudlark',
    summary: 'The roots are coming through the Mudlarks’ cellar walls. Eight children, one goat and everything they own have to go up a level before the roots fill the house.',
    requires: req(done('quest:hedgewitch-the-sleeping-cellars')), firstStage: 'carry',
    stages: [
      {
        id: 'carry', journal: 'A bed, a dresser and a goat called Duchess. The goat is the heaviest.',
        objectives: [{ id: 'bundles', text: 'Carry the Mudlarks’ things up a level', interact: 'obj:mudlark-bundle-*', count: 3, marker: { landmark: 'landmark:mudlark-cellar' } }],
        next: 'door',
      },
      {
        id: 'door', journal: 'Everything is out. Hester Mudlark has gone back down to stand in the empty doorway.',
        objectives: [{ id: 'door', text: 'Go back down to the Mudlarks’ door', interact: 'obj:mudlark-door', marker: { landmark: 'landmark:mudlark-cellar' } }],
        next: 'hester',
      },
      {
        id: 'hester', journal: 'The roots closed over the door behind you, very gently.',
        objectives: [{ id: 'hester', text: 'See the Mudlarks settled', talk: 'npc:hester-mudlark', marker: { landmark: 'landmark:mudlark-cellar' } }],
        next: 'agnes',
      },
      {
        id: 'agnes', journal: 'Seven Mudlarks at the sister’s door, and one missing. Agnes has gone back down into the root-tunnels with a bread knife, for the family’s doorframe.',
        objectives: [{ id: 'frame', text: 'Find Agnes Mudlark in the root-tunnels', interact: 'obj:hedgewitch-mudlark-frame', marker: { landmark: 'landmark:hedgewitch-mudlark-tunnels' } }],
        next: 'frame',
      },
      {
        id: 'frame', journal: 'Agnes is safe, and so is a strip of doorframe with four generations of Mudlarks measured on it.',
        objectives: [{ id: 'hester', text: 'Bring Agnes and the doorframe home to Hester', talk: 'npc:hester-mudlark', marker: { landmark: 'landmark:mudlark-cellar' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 60 },
  },
  {
    ...A1, id: 'quest:hedgewitch-what-is-thistledown-for', name: 'What Is Thistledown For?', type: 'side', region: Z3, giver: 'npc:thistledown',
    summary: 'A Bloomkin woke in the Root Cellars last week, a small, serious, fluffy thing, and it would like to know what it is for.',
    requires: req(done('quest:hedgewitch-the-sleeping-cellars')), firstStage: 'sights',
    stages: [
      {
        id: 'sights', journal: 'Thistledown would like to see what other things are for, first, so it has something to go on.',
        objectives: [{ id: 'sights', text: 'Show Thistledown what things are for', interact: 'obj:thistledown-sight-*', count: 3, marker: { place: Z3 } }],
        next: 'answer',
      },
      {
        id: 'answer', journal: 'A lantern, a compost heap and a cradle. Thistledown has gone very quiet, thinking.',
        objectives: [{ id: 'thistledown', text: 'Answer Thistledown’s question', talk: 'npc:thistledown', marker: { place: Z3 } }],
        onComplete: [{ setFlag: 'hedgewitch.thistledown_helped', value: true }],
        next: 'list',
      },
      {
        id: 'list', journal: 'Thistledown went out through the Cellar Mouth, where the roots open on to the wilds. It left something behind on the bark, at about the height of its head.',
        objectives: [{ id: 'list', text: 'See what Thistledown left at the Cellar Mouth', interact: 'obj:hedgewitch-thistle-list', marker: { landmark: 'landmark:hedgewitch-cellar-mouth' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:hedgewitch-kite-weather', name: 'Kite Weather', type: 'side', region: Z4, giver: 'npc:hyssop-haws',
    summary: 'It is the Canopy kite-race, and the Briarlings keep snatching the kites out of the sky. Little Hyssop Haws has lost three and is furious about it.',
    requires: req(done('quest:hedgewitch-the-seed-vault')), firstStage: 'briarlings',
    stages: [
      {
        id: 'briarlings', journal: 'The Briarlings are up in the high boughs, wearing the kites like capes.',
        objectives: [{ id: 'briarlings', text: 'Chase the kite-snatching Briarlings off', kill: 'bx_verdant_2', count: 4, marker: { place: Z4 } }],
        next: 'kites',
      },
      {
        id: 'kites', journal: 'Three kites are tangled in the twigs at the top of the Hollows.',
        objectives: [{ id: 'kites', text: 'Untangle the children’s kites', interact: 'obj:canopy-kite-*', count: 3, marker: { place: Z4 } }],
        next: 'hyssop',
      },
      {
        id: 'hyssop', journal: 'Three kites, one with a bite out of it.',
        objectives: [{ id: 'hyssop', text: 'Give the kites back to Hyssop', talk: 'npc:hyssop-haws', marker: { place: Z4 } }],
        next: 'race',
      },
      {
        id: 'race', journal: 'The race starts from the Launching Ledge, high on the windward side of the Hollows. Hyssop has painted her kite’s face to look like somebody, and will not say who.',
        objectives: [{ id: 'race', text: 'Fly in the Canopy kite-race from the Launching Ledge', interact: 'obj:hedgewitch-launching-ledge', marker: { landmark: 'landmark:hedgewitch-launching-ledge' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50, hcItems: [{ item: 'i_apple', qty: 3 }] },
  },
  {
    ...A1, id: 'quest:hedgewitch-the-topmost-leaf', name: 'The Topmost Leaf', type: 'side', region: Z4, giver: 'npc:wenna-sloe',
    summary: 'Grandmother Wenna Sloe would like to see the topmost leaf of the Elder Tree before she dies. The tree has grown past the clouds since she last looked.',
    requires: req(done('quest:hedgewitch-the-seed-vault')), firstStage: 'climb',
    stages: [
      {
        id: 'climb', journal: 'Up past the kite-boughs, past the clouds, to the very last leaf.',
        objectives: [{ id: 'top', text: 'Climb to the topmost leaf', reach: 'landmark:topmost-leaf', marker: { landmark: 'landmark:topmost-leaf' } }],
        next: 'leaf',
      },
      {
        id: 'leaf', journal: 'The leaf is there, small and new, turning in the wind.',
        objectives: [{ id: 'leaf', text: 'Look out from the topmost leaf', interact: 'obj:topmost-leaf' }],
        next: 'wenna',
      },
      {
        id: 'wenna', journal: 'From the top you could see all the way to Morvane, and a willow there, very far off, weeping.',
        objectives: [{ id: 'wenna', text: 'Tell Wenna what you saw', talk: 'npc:wenna-sloe', marker: { place: Z4 } }],
        next: 'fork',
      },
      {
        id: 'fork', journal: 'Wenna never reached the topmost leaf. Ninety years ago she stopped at a fork halfway up, and lied about it ever since. She wants her initials cut where she really stopped.',
        objectives: [{ id: 'fork', text: 'Cut Wenna’s initials at the Liar’s Fork', interact: 'obj:hedgewitch-liars-fork', marker: { landmark: 'landmark:hedgewitch-liars-fork' } }],
        onComplete: [{ setFlag: 'hedgewitch.wenna_truth', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-willow-daughter'] },
  },

  // ======================= ACT I: mentor thread (2) and bounties (2)
  {
    ...A1, id: 'quest:hedgewitch-yarrows-tree-diary', name: 'Yarrow’s Tree-Diary', type: 'side', region: Z1, giver: YA,
    summary: 'Mother Yarrow has written down everything she has said to the Elder Tree for sixty years, and she cannot read her early handwriting at all.',
    requires: req({ trust: YA, value: 'friendly' }, done('quest:hedgewitch-pruning-day')), firstStage: 'volumes',
    stages: [
      {
        id: 'volumes', journal: 'The oldest volumes of the diary are wedged in among the bower’s roots, where Yarrow put them “for safe keeping” and forgot.',
        objectives: [{ id: 'volumes', text: 'Find the oldest volumes of the tree-diary', interact: 'obj:yarrow-diary-*', count: 3, marker: { landmark: 'landmark:yarrow-bower' } }],
        next: 'read',
      },
      {
        id: 'read', journal: 'Three volumes in a hand like a hedge in a high wind. Yarrow has her spectacles on, and upside down.',
        objectives: [{ id: 'yarrow', text: 'Read the old diary with Yarrow', talk: YA, marker: { landmark: 'landmark:yarrow-bower' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, skillPoints: 1, lore: ['lore:hc-yarrow-diary'] },
  },
  {
    ...A1, id: 'quest:hedgewitch-what-the-tree-said-back', name: 'What the Tree Said Back', type: 'side', region: Z4, giver: YA,
    summary: 'Mother Yarrow admits that in sixty years the Elder Tree has never once answered her. She talks to it anyway. There is one place in the canopy where it is said to still speak.',
    requires: req({ trust: YA, value: 'trusted' }, done('quest:hedgewitch-yarrows-tree-diary')), firstStage: 'knot',
    stages: [
      {
        id: 'knot', journal: 'The Listening Knot is high in the Canopy Hollows. The tree speaks there only at night, when the market is asleep.',
        objectives: [{ id: 'knot', text: 'Listen at the Listening Knot, at night', when: { flag: 'hedgewitch.knot_heard' }, marker: { landmark: 'landmark:listening-knot' } }],
        next: 'yarrow',
      },
      {
        id: 'yarrow', journal: 'It said a name. It said it slowly, like a seed opening. It said “Yarrow”.',
        objectives: [{ id: 'yarrow', text: 'Tell Mother Yarrow', talk: YA, marker: { landmark: 'landmark:yarrow-bower' } }],
        onComplete: [{ setFlag: 'hedgewitch.yarrow_devotable', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:hedgewitch-bounty-cellar-beetles', name: 'Bounty: the Cellar Beetles', type: 'bounty', region: Z3, giver: 'npc:thaddeus-wort',
    summary: 'A Thorn Beetle nest has hatched in the Root Cellars, and the beetles are eating the stairs.',
    requires: req(done('quest:hedgewitch-the-sleeping-cellars')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'They nest under the old cider-press and come out when the lamps go down.', objectives: [{ id: 'beetles', text: 'Defeat the Cellar Thorn Beetles', kill: 'bx_verdant_1', count: 6, marker: { place: Z3 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 150 },
  },
  {
    ...A1, id: 'quest:hedgewitch-bounty-sap-well-bloomtraps', name: 'Bounty: the Sap Well Bloomtraps', type: 'bounty', region: Z2, giver: 'npc:thaddeus-wort',
    summary: 'Bloomtraps have taken root along the Sap Wells and are snapping at the tappers. Two buckets and one tapper’s hat have been lost.',
    requires: req(done('quest:hedgewitch-the-bramblewifes-garden')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'They look like lilies until they don’t.', objectives: [{ id: 'traps', text: 'Uproot the Sap Well Bloomtraps', kill: 'bx_verdant_0', count: 5, marker: { place: Z2 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 120 },
  },

  // ======================= ACT II: the class thread (C-1 … C-6) + featured bearers
  {
    ...A2, id: 'quest:hedgewitch-thornhollow', name: 'Thornhollow', type: 'class', region: 'vil:thorn', giver: 'npc:teasel-gammon',
    summary: 'There are Verdant folk in Concordia, stranded since the arches shut. The wolves smelled of bark, and the bark smelled of Briar Hollow.',
    requires: req(done('quest:cc-through-the-arch')), autoStart: true, firstStage: 'hedge',
    stages: [
      {
        id: 'hedge', journal: 'The Verdant folk of Concordia keep the Hedge House at Thornhollow, in Briar Hollow.',
        objectives: [{ id: 'teasel', text: 'Find the Verdant folk of Thornhollow', talk: 'npc:teasel-gammon', marker: { landmark: 'landmark:thorn-hedge-house' } }],
        next: 'pots',
      },
      {
        id: 'pots', journal: 'Teasel wants you to see the back room of the Hedge House before you go anywhere. “Thirty years of Wildheart,” he says. “In pots.”',
        objectives: [{ id: 'pots', text: 'Look at the Hedge House’s pots', interact: 'obj:hedgewitch-hedge-pots', marker: { landmark: 'landmark:thorn-hedge-house' } }],
        next: 'nan',
      },
      {
        id: 'nan', journal: 'Teasel Gammon says that if you want to know about the Willow, you ask Nan Briar, and you bring her something for the kettle.',
        objectives: [{ id: 'nan', text: 'Call on Nan Briar at Briar Cottage', talk: 'npc:nanbriar', marker: { landmark: 'landmark:thorn-briar-cottage' } }],
        onComplete: [{ startQuest: 'quest:hedgewitch-the-willows-roots' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-verdant-thornhollow'] },
  },
  {
    ...A2, id: 'quest:hedgewitch-the-willows-roots', name: 'The Willow’s Roots', type: 'class', region: 'region:gloam', giver: 'npc:teasel-gammon',
    summary: 'Through the Gloamwood to Stag’s Rest, where the Weeping Willow weeps black into the wood. You feel it before you see it, the way you would feel a cousin in a crowded room.',
    requires: req(done('quest:hedgewitch-thornhollow')), firstStage: 'roots',
    stages: [
      {
        id: 'roots', journal: 'The Willow’s roots run under half the Gloamwood. Follow the ones that weep.',
        objectives: [{ id: 'roots', text: 'Follow the Willow’s weeping roots', interact: 'obj:hedgewitch-willow-root-*', count: 3, marker: { region: 'region:gloam' } }],
        next: 'listen',
      },
      {
        id: 'listen', journal: 'The Willow’s bark is the Elder Tree’s bark. Before you go down to it, Mother Yarrow would put her hand on it and say good evening.',
        objectives: [{ id: 'bark', text: 'Put your hand on the Willow’s bark', interact: 'obj:hedgewitch-willow-bark', marker: { landmark: 'landmark:gloam-stags-rest' } }],
        next: 'rest',
      },
      {
        id: 'rest', journal: 'The roots all lead to Stag’s Rest, and the Willow.',
        objectives: [{ id: 'lair', text: 'Go to the Weeping Willow at Stag’s Rest', reach: 'inst:sentinel-verdant' }],
        onComplete: [{ startQuest: 'quest:hedgewitch-the-weeping-willow' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:hedgewitch-the-weeping-willow', name: 'The Weeping Willow', type: 'class', region: 'region:gloam', giver: 'npc:teasel-gammon',
    summary: 'The Weeping Willow was planted on the day the Concord was sworn, a cutting from the Elder Tree. The tears found it in its sleep.',
    requires: req(done('quest:hedgewitch-the-willows-roots')), firstStage: 'fight',
    stages: [
      {
        id: 'fight', journal: 'The Willow is the Sentinel of the Verdant school. Win its mark.',
        objectives: [{ id: 'willow', text: 'Defeat the Weeping Willow', kill: 'bx_willow', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-verdant' }],
        next: 'release',
      },
      {
        id: 'release', journal: 'The Willow has stopped weeping. It is trying to say something.',
        objectives: [{ id: 'mark', text: 'Hear the Willow out', when: { flag: 'story.sentinel.verdant' } }],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'The Willow has let its leaves fall at last. Nan Briar planted its mother’s cutting with her own hands. She should hear it from you.',
        objectives: [{ id: 'nan', text: 'Tell Nan Briar the Willow is at rest', talk: 'npc:nanbriar', marker: { landmark: 'landmark:thorn-briar-cottage' } }],
        onComplete: [{ startQuest: 'quest:hedgewitch-the-bramblewifes-graft' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-verdant-willow'] },
  },
  {
    ...A2, id: 'quest:hedgewitch-the-bramblewifes-graft', name: 'The Bramblewife’s Graft', type: 'class', region: 'region:briar', giver: 'npc:teasel-gammon',
    summary: 'Ostara is in Briar Hollow. The bog-folk have seen a woman with sticky hands carrying pails of black sap out to the Ooze Sovereign every night.',
    requires: req(done('quest:hedgewitch-the-weeping-willow')), firstStage: 'escort',
    stages: [
      {
        id: 'escort', journal: 'Jennet Wadeley traps eels in the deep bog, and she has seen the sticky-handed woman. She will show you where, but not on her own: the bog has gone hollow at the edges.',
        onEnter: [{ escort: 'npc:jennet-wadeley', to: 'landmark:hedgewitch-bog-edge' }],
        objectives: [{ id: 'jennet', text: 'Bring Jennet Wadeley safely to the edge of the deep bog', when: { any: [{ flag: 'escort.jennet-wadeley', op: '==', value: 'arrived' }, { flag: 'escort.jennet-wadeley', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:hedgewitch-bog-edge' } }],
        next: [{ when: { flag: 'escort.jennet-wadeley', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'witness' }],
      },
      {
        id: 'regroup', journal: 'Jennet went down in the bramble, and her neighbours hauled her home by the collar, scolding. She is already back at her hut, wringing out her hat to try again.',
        onEnter: [{ escort: 'npc:jennet-wadeley', to: 'landmark:hedgewitch-bog-edge' }],
        objectives: [{ id: 'jennet', text: 'Try again: bring Jennet to the edge of the deep bog', when: { any: [{ flag: 'escort.jennet-wadeley', op: '==', value: 'arrived' }, { flag: 'escort.jennet-wadeley', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:hedgewitch-bog-edge' } }],
        next: [{ when: { flag: 'escort.jennet-wadeley', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'witness' }],
      },
      {
        id: 'witness', journal: 'Jennet has her eel-spear planted in the mud at the edge of the deep bog. She is pointing.',
        objectives: [{ id: 'jennet', text: 'Hear what Jennet saw', talk: 'npc:jennet-wadeley', marker: { landmark: 'landmark:hedgewitch-bog-edge' } }],
        next: 'pails',
      },
      {
        id: 'pails', journal: 'Follow Ostara’s pails across the bog. She is feeding the Ooze Sovereign black-tear sap.',
        objectives: [{ id: 'pails', text: 'Follow Ostara’s sap-pails across Briar Hollow', interact: 'obj:hedgewitch-sap-pail-*', count: 3, marker: { region: 'region:briar' } }],
        next: 'seed',
      },
      {
        id: 'seed', journal: 'The last pail sits beside a little planting-pot. In the pot, under a glass, is the Elder Tree’s stolen seed.',
        objectives: [{ id: 'seed', text: 'Look at what Ostara is growing', interact: 'obj:hedgewitch-seed-pot', marker: { region: 'region:briar' } }],
        onComplete: [{ setFlag: 'hedgewitch.graft_known', value: true }, { startQuest: 'quest:hedgewitch-the-ooze-sovereign' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:hedgewitch-the-ooze-sovereign', name: 'The Ooze Sovereign', type: 'class', region: 'region:briar', giver: 'npc:teasel-gammon',
    summary: 'Ostara wants to graft the Ooze Sovereign’s endless hunger into the Elder Tree’s seed: a thing that eats forever and never dies. The Sovereign has already eaten the Stone Abbot.',
    requires: req(done('quest:hedgewitch-the-bramblewifes-graft')), firstStage: 'bog',
    stages: [
      {
        id: 'bog', journal: 'The Sovereign sits in the deepest part of the bog, very fat and very calm.',
        objectives: [{ id: 'lair', text: 'Wade out to the Ooze Sovereign', reach: 'inst:sentinel-fist', marker: { region: 'region:briar' } }],
        onComplete: [{ openDialogue: 'dialogue:hedgewitch-sovereign-bog' }],
        next: 'sovereign',
      },
      {
        id: 'sovereign', journal: 'It fights like a monk, because it has eaten one. It is the Sentinel of the Fist school; the Fist bearers cannot win their mark while it lives fat on Ostara’s sap.',
        objectives: [{ id: 'sovereign', text: 'Defeat the Ooze Sovereign', kill: 'bx_sovereign', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-fist' }, { setFlag: 'story.bearer.brawler', value: true }],
        next: 'graft',
      },
      {
        id: 'graft', journal: 'The bog is draining out of the Sovereign’s bed. Something glints in the mud where it sat, about where its heart would have been.',
        objectives: [{ id: 'graft', text: 'See what Ostara left in the Sovereign’s bed', interact: 'obj:hedgewitch-graft-knife' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-hedgewitch-graft'] },
  },
  {
    ...A2, id: 'quest:hedgewitch-a-letter-from-yarrow', name: 'A Letter from Yarrow', type: 'class', region: 'vil:brind', giver: YA,
    summary: 'A leaf has blown through the Gate Circle from the Verdant arch, the size of a dinner plate, with Mother Yarrow’s handwriting all over it.',
    requires: req(done('quest:hedgewitch-the-ooze-sovereign')), autoStart: true, firstStage: 'leaf',
    stages: [
      {
        id: 'leaf', journal: 'The leaf is caught against the foot of the Verdant arch, as if the tree had carried it all the way.',
        objectives: [{ id: 'leaf', text: 'Pick up the leaf at the Gate Circle', interact: 'obj:hedgewitch-yarrow-leaf', marker: { landmark: 'landmark:gate-circle' } }],
        next: 'court',
      },
      {
        id: 'court', journal: 'Your half-stone has been tugging towards the Stone Court all day, towards the Rot half and the one who carries it.',
        objectives: [{ id: 'court', text: 'Sit with the Ranger bearer at the Stone Court', interact: 'obj:verdant-court-bench', marker: { landmark: 'landmark:stone-court' } }],
        next: 'reply',
      },
      {
        id: 'reply', journal: 'The briar on the Verdant arch carried Yarrow’s leaf all the way. It will carry one back, if you ask it nicely.',
        objectives: [{ id: 'reply', text: 'Give the Verdant arch a leaf to carry home', interact: 'obj:hedgewitch-reply-briar', marker: { landmark: 'landmark:gate-circle' } }],
        onComplete: [{ setFlag: 'story.act2_ready', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:hedgewitch-the-abbot-in-the-ooze', name: 'The Abbot in the Ooze', type: 'side', region: 'vil:thorn', giver: 'npc:bearer-monk',
    summary: 'The Monk bearer has come to Thornhollow to bring the Stone Abbot out of the Ooze Sovereign whole. They are building him a cairn first, so he has somewhere to come home to.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'cairn',
    stages: [
      {
        id: 'cairn', journal: 'The Monk bearer is stacking stones behind the Greenbriar Nursery, one at a time, very carefully.',
        objectives: [{ id: 'cairn', text: 'Help raise the Stone Abbot’s cairn', interact: 'obj:hedgewitch-abbot-cairn', marker: { landmark: 'landmark:thorn-greenbriar-nursery' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'The cairn stands. Brother Sefu has something to say about it, back at the Stone Court.',
        // co-op: if a party member plays the Monk, they ARE this bearer (the NPC is hidden)
        objectives: [{ id: 'sefu', text: 'Talk to the Monk bearer', when: { any: [{ flag: 'hedgewitch.sefu_thanked' }, { partyHasClass: 'monk' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.monk', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A2, id: 'quest:hedgewitch-the-willows-song', name: 'The Willow’s Song', type: 'side', region: 'region:gloam', giver: 'npc:bearer-bard',
    summary: 'The Bard bearer wants to write down the Weeping Willow’s song before it stops. The Willow sings in three of its boughs, and they are a long way apart.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'boughs',
    stages: [
      {
        id: 'boughs', journal: 'Lark Ellery is at Stag’s Rest with a quill behind each ear and no idea which bough to listen to first.',
        objectives: [{ id: 'boughs', text: 'Find the Willow’s singing boughs', interact: 'obj:hedgewitch-song-bough-*', count: 3, marker: { region: 'region:gloam' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Three boughs, three verses, one very inky Bard.',
        objectives: [{ id: 'lark', text: 'Talk to the Bard bearer', when: { any: [{ flag: 'hedgewitch.lark_thanked' }, { partyHasClass: 'bard' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.bard', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  // ======================= ACT III: class quests (III-4 + 3 side)
  {
    ...A3, id: 'quest:hedgewitch-the-herald-of-bloom', name: 'The Herald of Bloom', type: 'class', region: 'region:heart', giver: 'npc:casimir',
    summary: 'At the top of the Twelve Stairs stands the Hollow King’s Herald in a robe of living hedge, ringing a seed-pod bell. Everything it rings over grows. It has Ostara’s smile.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'herald',
    stages: [
      { id: 'herald', journal: 'Ostara has become the Herald of Bloom: a garden that will never stop growing, and never let anything go.', objectives: [{ id: 'herald', text: 'Face the Herald of Bloom', kill: 'cb_herald-of-bloom', count: 1, marker: { landmark: 'landmark:twelve-stairs-top' } }], onComplete: [{ openDialogue: 'dialogue:hedgewitch-herald-fate' }], next: 'fate' },
      { id: 'fate', journal: 'Ostara kneels on the stair in her own leaves, beaten, and the hedge of her robe is still growing.', objectives: [{ id: 'fate', text: 'Decide Ostara’s fate', when: { flag: 'hedgewitch.nemesis_fate' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 3 },
  },
  {
    ...A3, id: 'quest:hedgewitch-yarrows-acorn', name: 'Yarrow’s Acorn', type: 'side', region: 'region:heart', giver: YA,
    summary: 'Mother Yarrow always said the tree should have a word in everything. At the head of the Verdant stair is a crack in the black stone where nothing has grown for thirty years.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'cold',
    stages: [
      { id: 'cold', journal: 'You woke at the Heart camp and the thing you carry from Yarrow had gone cold, for the first time since Rootholme.', objectives: [{ id: 'cold', text: 'Look at what you carry from Yarrow', interact: 'obj:hedgewitch-camp-bedroll', marker: { landmark: 'landmark:heart-camp' } }], next: 'bed' },
      { id: 'bed', journal: 'It isn’t dying. It’s homesick for real earth. Nan Briar kept the Concordant’s garden three Turnings back, and its beds ran to the foot of the Twelve Stairs.', objectives: [{ id: 'bed', text: 'Find Nan Briar’s old garden at the foot of the Stairs', interact: 'obj:hedgewitch-concordant-bed', marker: { landmark: 'landmark:twelve-stairs' } }], next: 'plant' },
      { id: 'plant', journal: 'Plant something from home at the head of the Verdant stair, so the tree has a word in the Heart.', objectives: [{ id: 'plant', text: 'Plant a word from home on the Verdant stair', when: { flag: 'hedgewitch.acorn_planted' }, marker: { landmark: 'landmark:twelve-stairs-top' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:hedgewitch-gran-burdocks-rest', name: 'Gran Burdock’s Rest', type: 'side', region: 'region:heart', giver: 'npc:gran-burdock',
    summary: 'Ostara’s silent patient walked all the way to the Heart behind her. Gran Burdock is standing in the Legion’s ranks, rooted to the ground, still smiling.',
    requires: req(done('quest:heart-legion'), done('quest:hedgewitch-gran-hasnt-said-a-word')), autoStart: true, firstStage: 'gran',
    stages: [
      { id: 'gran', journal: 'An old woman in a shawl, grown down into the black ground of the Legion camp. She smells of warm sap.', objectives: [{ id: 'gran', text: 'Find Gran Burdock in the Legion camp', talk: 'npc:gran-burdock', marker: { landmark: 'landmark:legion-camp' } }], next: 'pail' },
      { id: 'pail', journal: 'Gran’s roots run out of the Legion camp under the black ground, all one way, towards the foot of the Twelve Stairs. Somebody has been watering them.', objectives: [{ id: 'pail', text: 'Follow Gran’s roots to the foot of the Stairs', interact: 'obj:hedgewitch-gran-pail', marker: { landmark: 'landmark:twelve-stairs' } }], next: 'choose' },
      { id: 'choose', journal: 'Ostara has been carrying a pail to Gran every night, all the way into the Heart. Gran is still waiting for somebody to tell her what happens now.', objectives: [{ id: 'gran', text: 'Go back to Gran Burdock', talk: 'npc:gran-burdock', marker: { landmark: 'landmark:legion-camp' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A3, id: 'quest:hedgewitch-thistledowns-answer', name: 'Thistledown’s Answer', type: 'side', region: 'region:heart', giver: 'npc:thistledown-thornhollow',
    summary: 'A small, very serious puff of fluff has walked to the Heart camp all the way from Thornhollow. It says it has finished its list.',
    requires: req({ flag: 'story.heart_open' }, done('quest:hedgewitch-what-is-thistledown-for')), autoStart: true, firstStage: 'edge',
    stages: [
      { id: 'edge', journal: 'Thistledown is waiting at the edge of the Heart camp, where the black ground begins. It would like a word.', objectives: [{ id: 'thistledown', text: 'Talk to Thistledown at the Heart camp', talk: 'npc:thistledown-thornhollow', marker: { landmark: 'landmark:heart-camp' } }], next: 'spots' },
      { id: 'spots', journal: 'Thistledown knows what it is for now, and it is extremely particular about where. Help it inspect the nothing round the camp.', objectives: [{ id: 'spots', text: 'Help Thistledown choose a patch of nothing', interact: 'obj:hedgewitch-thistle-spot-*', count: 3, marker: { landmark: 'landmark:heart-camp' } }], next: 'root' },
      { id: 'root', journal: 'Thistledown has chosen. It is standing in the exact middle of the best nothing in the Heart, waiting for you, very solemn.', objectives: [{ id: 'thistledown', text: 'See Thistledown put down roots', talk: 'npc:thistledown-thornhollow', marker: { landmark: 'landmark:hedgewitch-thistle-patch' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
];

export default quests;
