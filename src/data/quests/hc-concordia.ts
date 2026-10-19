/**
 * Hollow Crown: the shared Act II quests in Concordia (docs/lore/hollow-crown/05-campaign-framework.md §Act II).
 * Every campaign reaches these after its realm gate (story.act >= 2). The spine is II-1…II-6; the side quests and
 * bounties are the handoff's, written once and portable for co-op guests. Owner: Claude 4.
 * Ids from Claude 2 (docs/world/HOLLOW-CROWN-WORLD.md): region:*, vil:*, ws:*; landmarks/objects listed in 09-concordia-spec.md.
 */
import type { NarrativeCondition, QuestDef } from '@/core';
import { CAMPAIGNS } from '@/narrative/engine/classes';

const SIBLING_IN_PARTY: NarrativeCondition[] = CAMPAIGNS.map((c) => ({ all: [{ heroClass: c.id }, { partyHasClass: c.sibling }] }));
const ACT2: NarrativeCondition = { flag: 'story.act', op: '>=', value: 2 };
const after = (q: `quest:${string}`): NarrativeCondition => ({ all: [ACT2, { questCompleted: q }] });
const base = { act: 'act2' as const, campaign: 'shared', chapter: 'Concordia' };
const side = { ...base, portable: true };

const quests: QuestDef[] = [
  // ---------------- the spine (II-1 … II-6)
  {
    ...base, id: 'quest:cc-through-the-arch', name: 'Through the Arch', type: 'main', region: 'region:alder', giver: 'npc:maren',
    summary: 'You stepped out of your school’s arch into Concordia: a ring of twelve shut stone arches on a dusk moor, and only yours is lit.',
    requires: ACT2, autoStart: true, firstStage: 'arch',
    stages: [
      {
        id: 'arch', journal: 'You stepped out of your school’s arch into a ring of twelve stone arches on a green moor at dusk. Every arch but yours is shut, and weeping.',
        objectives: [{ id: 'look', text: 'Look back at your arch', interact: 'obj:arch-*', marker: { landmark: 'landmark:gate-circle' } }],
        next: 'wolves',
      },
      {
        id: 'wolves', journal: 'Wolves came out of the trees, walking towards the light of your arch instead of away from it.',
        objectives: [{ id: 'wolves', text: 'Drive off the wolves', kill: 'bx_wolf', count: 3 }],
        next: 'maren',
      },
      {
        id: 'maren', journal: 'A huntress is shouting at you from the moor road, bow drawn.',
        objectives: [{ id: 'maren', text: 'Talk to the huntress', talk: 'npc:maren', marker: { landmark: 'landmark:gate-circle' } }],
        onComplete: [{ setFlag: 'story.concordia_arrived', value: true }, { startQuest: 'quest:cc-warm-bed' }],
        next: 'road',
      },
      {
        id: 'road', journal: 'Maren Hollis is walking you down the moor road to Brindlecross, the oldest village in Morvane, to see the Elder.',
        objectives: [{ id: 'road', text: 'Walk the moor road to Brindlecross', reach: 'landmark:brind-elders-house', marker: { landmark: 'landmark:brind-elders-house' } }],
        next: 'godric',
      },
      {
        id: 'godric', journal: 'The Elder of Brindlecross keeps the oldest house in the village, and looks at strangers like a sentry.',
        objectives: [{ id: 'godric', text: 'Meet Elder Godric', talk: 'npc:godric', marker: { landmark: 'landmark:brind-elders-house' } }],
        onComplete: [{ startQuest: 'quest:cc-wolves' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-concordia', 'lore:hc-gate-circle'] },
  },
  {
    ...base, id: 'quest:cc-wolves', name: 'The Wolves at the Gate', type: 'main', region: 'region:alder', giver: 'npc:maren',
    summary: 'Gloamwood wolves are coming out of the trees in packs, and they walk into the torchlight instead of away from it. Maren Hollis wants them driven off before nightfall. After that she wants to know what is driving them.',
    requires: ACT2, firstStage: 'drive',
    stages: [
      {
        id: 'drive', journal: 'Wolves fear fire, but these ones follow it. Maren wants the packs driven back from Brindlecross before nightfall.',
        objectives: [{ id: 'kills', text: 'Drive off the Gloamwood wolves', kill: 'bx_wolf', count: 8, marker: { region: 'region:alder' } }],
        next: 'gate',
      },
      {
        id: 'gate', journal: 'The packs have pulled back into the trees. Maren is waiting at the east gate.',
        objectives: [{ id: 'maren', text: 'Find Maren Hollis by the east gate', talk: 'npc:maren', marker: { landmark: 'landmark:brind-east-gate' } }],
        next: 'tracks',
      },
      {
        id: 'tracks', journal: 'Maren thinks the wolves are being driven. Their tracks lead back into the Gloamwood.',
        objectives: [{ id: 'tracks', text: 'Follow the tracks into the Gloamwood', interact: 'obj:gloam-wolf-tracks', marker: { landmark: 'landmark:gloam-wolf-tracks' } }],
        next: 'deeper',
      },
      {
        id: 'deeper', journal: 'The stag’s prints go on, deeper into the Gloamwood, wet with black. The wolf tracks stop circling and start to follow them.',
        objectives: [{ id: 'prints', text: 'Follow the stag’s prints deeper in', interact: 'obj:cc-stag-print-*', count: 2, marker: { region: 'region:gloam' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 120, hcItems: [{ item: 'a_verdant_leather_helm' }], lore: ['lore:hc-gloamwood'] },
  },
  {
    ...base, id: 'quest:cc-drowned-bell', name: 'The Drowned Bell', type: 'main', region: 'region:alder', giver: 'npc:godric',
    summary: 'The bells of the Drowned Abbey rang the night you heard your half-stone. The Abbey has been under the lake for thirty years. Elder Godric will not say what he thinks it means, but he has asked you to find out.',
    requires: after('quest:cc-through-the-arch'), firstStage: 'aldous',
    stages: [
      {
        id: 'aldous', journal: 'Godric sent you to Brother Aldous, who keeps the chapel by the graveyard. He is the only one who swam out of the Abbey.',
        objectives: [{ id: 'aldous', text: 'Ask Brother Aldous about the bells', talk: 'npc:aldous', marker: { landmark: 'landmark:brind-chapel' } }],
        next: 'abbey',
      },
      {
        id: 'abbey', journal: 'The Turning Bell lies under the Abbey lake. Aldous’s old boat is still tied up at Abbeyshore.',
        objectives: [{ id: 'boat', text: 'Find a way out onto the Abbey lake', interact: 'obj:shore-boat', marker: { landmark: 'landmark:shore-boat' } }],
        next: 'register',
      },
      {
        id: 'register', journal: 'A face under the water, and two words. The Abbey register, saved from the flood, is kept in the chapel at Brindlecross.',
        objectives: [{ id: 'register', text: 'Read the Abbey register in the chapel', interact: 'obj:cc-abbey-register', marker: { landmark: 'landmark:brind-chapel' } }],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'Aldous swam out of the Abbey the night it drowned. He should hear what you saw.',
        objectives: [{ id: 'aldous', text: 'Tell Brother Aldous what you saw on the lake', talk: 'npc:aldous', marker: { landmark: 'landmark:brind-chapel' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 200, hcItems: [{ item: 'i_seal' }], lore: ['lore:hc-turning-bell'] },
  },
  {
    ...base, id: 'quest:cc-tears', name: 'Tears of the Stag', type: 'main', region: 'region:briar', giver: 'npc:nanbriar',
    summary: 'Nan Briar says the White Stag is not sick but grieving, and that its black tears are poisoning the Gloamwood. She wants a tear brought to her cottage, still warm.',
    requires: after('quest:cc-wolves'), firstStage: 'signs',
    stages: [
      {
        id: 'signs', journal: 'Nan says you won’t find the Stag by looking for it. Look for where it has been.',
        objectives: [{ id: 'signs', text: 'Find the signs of the White Stag in the Gloamwood', interact: 'obj:cc-stag-sign-*', count: 3, marker: { region: 'region:gloam' } }],
        next: 'stag',
      },
      {
        id: 'stag', journal: 'The White Stag walks the Gloamwood glade at dusk. Nan wants one of its tears, still warm.',
        objectives: [{ id: 'stag', text: 'Find the White Stag in the Gloamwood', interact: 'obj:gloam-stag-glade', marker: { landmark: 'landmark:gloam-stag-glade' } }],
        next: 'return',
      },
      {
        id: 'return', journal: 'The Stag fled from your half-stone, and left a black tear on the moss behind it. It is still warm.',
        objectives: [{ id: 'nan', text: 'Bring the tear to Nan Briar', talk: 'npc:nanbriar', marker: { landmark: 'landmark:thorn-briar-cottage' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, hcItems: [{ item: 'i_locket' }], lore: ['lore:hc-black-tears'] },
  },
  {
    ...base, id: 'quest:cc-stone-court', name: 'The Stone Court', type: 'main', region: 'region:alder', giver: 'npc:ysolde',
    summary: 'Ysolde Fenn has unlocked the old embassy square of Brindlecross, the Stone Court, because people with half-stones in their chests keep turning up in the village.',
    requires: { all: [ACT2, { questCompleted: 'quest:cc-drowned-bell' }, { questCompleted: 'quest:cc-tears' }] }, firstStage: 'court',
    stages: [
      {
        id: 'court', journal: 'The bearers are gathering at the Stone Court. Ysolde wants to show you all something in the old charter.',
        objectives: [{ id: 'ysolde', text: 'Meet Ysolde at the Stone Court', talk: 'npc:ysolde', marker: { landmark: 'landmark:stone-court' } }],
        next: 'charter',
      },
      {
        id: 'charter', journal: 'The Concord charter is cut into the Stone Court’s north wall. Ysolde says every bearer should read it once.',
        objectives: [{ id: 'charter', text: 'Read the Concord charter', interact: 'obj:cc-court-charter', marker: { landmark: 'landmark:stone-court' } }],
        next: 'sibling',
      },
      {
        id: 'sibling', journal: 'Somewhere in the Stone Court is the {sibling} who carries the other half of your school’s stone. You can hear it singing.',
        // met the sibling NPC, or (co-op) the sibling class is a party member: the player IS that bearer
        objectives: [{ id: 'sibling', text: 'Find the bearer of the other half', when: { any: [{ flag: 'story.sibling_met' }, ...SIBLING_IN_PARTY] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ openDialogue: 'dialogue:cc-court-sing' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-bearers', 'lore:hc-sentinels'] },
  },
  {
    ...base, id: 'quest:cc-eve', name: 'The Eve of the Turning', type: 'main', region: 'region:abbey', giver: 'npc:aldous',
    summary: 'With the bearers gathered and the marks won, Brother Aldous means to ring the Drowned Bell for a true Turning, if someone can bring him its clapper.',
    requires: { all: [ACT2, { questCompleted: 'quest:cc-stone-court' }, { flag: 'story.act2_ready' }] }, firstStage: 'clapper',
    stages: [
      {
        id: 'clapper', journal: 'The Bell’s clapper lies in the drowned nave of the Abbey, where the choir keeps it.',
        objectives: [{ id: 'clapper', text: 'Bring up the Bell’s clapper from the drowned nave', interact: 'obj:abbey-clapper', marker: { region: 'region:abbey' } }],
        next: 'farewells',
      },
      {
        id: 'farewells', journal: 'The Bell rings at dusk. Before the shore, there are people in Brindlecross who should hear it from you.',
        objectives: [
          { id: 'wil', text: 'Say goodbye to Wil at the Gilded Goose', talk: 'npc:wil', marker: { landmark: 'landmark:brind-gilded-goose' } },
          { id: 'godric', text: 'Say goodbye to Elder Godric', talk: 'npc:godric', marker: { landmark: 'landmark:brind-elders-house' } },
        ],
        next: 'gather',
      },
      {
        id: 'gather', journal: 'Aldous waits at Abbeyshore with the clapper and his boat. The bearers are coming down to the shore at dusk.',
        objectives: [{ id: 'eve', text: 'Join Brother Aldous at the shore', talk: 'npc:aldous', marker: { landmark: 'landmark:shore-boat' } }],
        onComplete: [{ setFlag: 'story.heart_open', value: true }, { setFlag: 'story.act', value: 3 }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, lore: ['lore:hc-weeping-wall'] },
  },

  // ---------------- the handoff's side quests (portable)
  {
    ...side, id: 'quest:cc-warm-bed', name: 'A Warm Bed', type: 'side', region: 'vil:brind', giver: 'npc:wil',
    summary: 'Wil Crane will give you a room at the Gilded Goose and a bowl of stew.',
    requires: ACT2, firstStage: 'wil',
    stages: [
      { id: 'wil', journal: 'Maren says the Gilded Goose has beds, stew and the worst gossip in Morvane.', objectives: [{ id: 'wil', text: 'Talk to Wil Crane', talk: 'npc:wil', marker: { landmark: 'landmark:brind-gilded-goose' } }], next: 'rest' },
      { id: 'rest', journal: 'Wil has a room for you upstairs. Rest here any time to restore everything.', objectives: [{ id: 'rest', text: 'Rest at the Gilded Goose', interact: 'obj:brind-goose-bed' }], next: 'letters' },
      { id: 'letters', journal: 'The washstand drawer in your room sticks, like the window. Something inside it is wedged tight.', objectives: [{ id: 'letters', text: 'Open the stuck drawer in your room', interact: 'obj:cc-goose-letters', marker: { landmark: 'landmark:brind-gilded-goose' } }], next: 'wil-again' },
      { id: 'wil-again', journal: 'The drawer was full of unopened letters, all in Wil’s hand, all addressed to whoever comes through the arches.', objectives: [{ id: 'wil', text: 'Ask Wil about the letters', talk: 'npc:wil', marker: { landmark: 'landmark:brind-gilded-goose' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_stew' }] },
  },
  {
    ...side, id: 'quest:cc-hollow-iron', name: 'Hollow Iron', type: 'side', region: 'vil:brind', giver: 'npc:odo',
    summary: 'Odo Vance says iron from Hollowed armour rings wrong on his anvil, like it remembers being something else. He wants pieces to study, and he will pay in steel.',
    requires: ACT2, firstStage: 'iron',
    stages: [
      { id: 'iron', journal: 'Hollowed Militia carry more of the iron than villagers do.', objectives: [{ id: 'iron', text: 'Take Hollow iron from the Hollowed', kill: 'bx_hollow*', count: 5 }], next: 'odo' },
      { id: 'odo', journal: 'You have enough Hollow iron to fill Odo’s apron.', objectives: [{ id: 'odo', text: 'Bring the iron to Odo', talk: 'npc:odo', marker: { landmark: 'landmark:brind-anvil' } }], next: 'forge' },
      { id: 'forge', journal: 'Odo wants a second pair of hands at the anvil while he works the hollow iron. He wants to hear how it rings.', objectives: [{ id: 'forge', text: 'Hold the tongs while Odo forges', interact: 'obj:cc-odo-anvil', marker: { landmark: 'landmark:brind-anvil' } }], onComplete: [{ trust: 'npc:odo', delta: 1 }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'w_sword_steel' }, { item: 'i_ingot', qty: 3 }], lore: ['lore:hc-hollow-iron'] },
  },
  {
    ...side, id: 'quest:cc-north-road', name: 'Hold the North Road', type: 'side', region: 'region:road', giver: 'npc:rook',
    summary: 'Captain Rook Harrow has eleven farmers and one halberd. Bandits are stopping carts on the road, and their leader, Mags the Knife, is getting bolder.',
    requires: ACT2, firstStage: 'bandits',
    stages: [
      { id: 'bandits', journal: 'Road bandits are working the Morvane Road east of Brindlecross.', objectives: [{ id: 'bandits', text: 'Defeat road bandits', kill: 'bx_bandit', count: 6, marker: { region: 'region:road' } }], next: 'camp' },
      { id: 'camp', journal: 'A bandit let slip where the camp is: past the Old Coach Inn, in the cutting.', objectives: [{ id: 'camp', text: 'Find the bandit camp', reach: 'landmark:road-bandit-camp', marker: { landmark: 'landmark:road-bandit-camp' } }], next: 'mags' },
      { id: 'mags', journal: 'Mags vanishes in smoke and strikes from behind. Stay moving.', objectives: [{ id: 'mags', text: 'Defeat Mags the Knife', kill: 'bx_mags', count: 1 }], onComplete: [{ trust: 'npc:rook', delta: 1 }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2, gold: 180, hcItems: [{ item: 'a_guile_cloth_helm' }] },
  },
  {
    ...side, id: 'quest:cc-reeds', name: 'Something in the Reeds', type: 'side', region: 'region:abbey', giver: 'npc:tamsin',
    summary: 'Tamsin Reed has seen pale shapes under her ferry at night, all swimming downstream toward the Abbey. The fish are leaving the river.',
    requires: ACT2, firstStage: 'watch',
    stages: [
      { id: 'watch', journal: 'Whatever swims under the ferry only comes after dark. Rest at an inn to skip to night.', objectives: [{ id: 'watch', text: 'Watch the river at night', when: { flag: 'cc.reeds_seen' }, marker: { landmark: 'landmark:shore-ferry-house' } }], next: 'follow' },
      { id: 'follow', journal: 'Pale shapes slid under the ferry and away downstream, towards the lake.', objectives: [{ id: 'follow', text: 'Follow the shapes downstream', interact: 'obj:shore-reed-bed', marker: { landmark: 'landmark:shore-reed-bed' } }], next: 'tamsin' },
      { id: 'tamsin', journal: 'You know what swims under the ferry at night. Tamsin should too.', objectives: [{ id: 'tamsin', text: 'Tell Tamsin what you saw', talk: 'npc:tamsin', marker: { landmark: 'landmark:shore-ferry-house' } }], onComplete: [{ trust: 'npc:tamsin', delta: 1 }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1, gold: 80, hcItems: [{ item: 'i_fish', qty: 4 }], lore: ['lore:hc-drowned-choir'] },
  },
  {
    ...side, id: 'quest:cc-empty-graves', name: 'Empty Graves', type: 'side', region: 'vil:brind', giver: 'npc:hobb',
    summary: 'Three of Old Hobb’s graves were empty this week. He has not told the Elder yet. He would like you to find out where they went before he has to.',
    requires: ACT2, firstStage: 'search',
    stages: [
      { id: 'search', journal: 'Hobb says the graves only stand open at night.', objectives: [{ id: 'search', text: 'Search the graveyard at night', when: { flag: 'cc.graves_searched' }, marker: { landmark: 'landmark:brind-graveyard' } }], next: 'follow' },
      { id: 'follow', journal: 'Bare footprints lead from the empty graves to an old barrow mound on the moor.', objectives: [{ id: 'follow', text: 'Follow the footprints', interact: 'obj:barrow-door', marker: { landmark: 'landmark:barrow-door' } }], next: 'report' },
      { id: 'report', journal: 'The dead are walking home to a muster under the moor. Hobb should know.', objectives: [{ id: 'hobb', text: 'Report back to Old Hobb', talk: 'npc:hobb', marker: { landmark: 'landmark:brind-graveyard' } }], onComplete: [{ trust: 'npc:hobb', delta: 1 }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_bonecharm' }], lore: ['lore:hc-varric'] },
  },
  {
    ...side, id: 'quest:cc-pip', name: 'Pip’s Big Adventure', type: 'side', region: 'vil:brind', giver: 'npc:pip',
    summary: 'Pip has decided to be your squire and wants a proper adventure. He has a wooden sword, a lucky stone and a list of places he is not allowed to go.',
    requires: ACT2, firstStage: 'well',
    stages: [
      { id: 'well', journal: 'Pip wants to show you the well. He is not allowed near the well.', objectives: [{ id: 'well', text: 'Let Pip follow you to the well', interact: 'obj:brind-well', marker: { landmark: 'landmark:brind-well' } }], next: 'drop' },
      { id: 'drop', journal: 'Pip dropped something down the well, on purpose, so you would have to fetch it.', objectives: [{ id: 'drop', text: 'Find what Pip dropped in the well', when: { flag: 'cc.pip_coin' } }], next: 'home' },
      { id: 'home', journal: 'It is getting dark, and Pip’s mother has a voice that carries.', objectives: [{ id: 'home', text: 'Walk Pip home before dark', talk: 'npc:pip', marker: { landmark: 'landmark:brind-pip-home' } }], onComplete: [{ trust: 'npc:pip', delta: 1 }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_lucky' }], lore: ['lore:hc-concord-coin'] },
  },
  {
    ...side, id: 'quest:cc-mill', name: 'Rebuild the Mill', type: 'side', region: 'vil:brind', giver: 'npc:corwin',
    summary: 'Corwin Hale’s mill burned the night the wolves first came. He is rebuilding it one plank at a time and could use more timber.',
    requires: ACT2, firstStage: 'timber',
    stages: [
      {
        id: 'timber', journal: 'Thornlings in Briar Hollow are mostly oak timber with opinions. Wolves still haunt the mill road.',
        objectives: [
          { id: 'timber', text: 'Gather oak timber for Corwin', collect: 'i_timber', count: 10 },
          { id: 'road', text: 'Clear the wolves from the mill road', kill: 'bx_wolf', count: 4 },
        ],
        next: 'corwin',
      },
      { id: 'corwin', journal: 'You have the timber, and the mill road is quiet.', objectives: [{ id: 'corwin', text: 'Bring the timber to Corwin', talk: 'npc:corwin', marker: { landmark: 'landmark:brind-mill' } }], onComplete: [{ setFlag: 'cc.mill_built', value: true }], next: 'wheel' },
      { id: 'wheel', journal: 'The mill is framed and roofed. All it needs now is its wheel raised, and half the village has promised to help.', objectives: [{ id: 'wheel', text: 'Help raise the mill wheel', interact: 'obj:cc-mill-wheel', marker: { landmark: 'landmark:brind-mill' } }], onComplete: [{ trust: 'npc:corwin', delta: 1 }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1, gold: 60, hcItems: [{ item: 'i_bread', qty: 5 }] },
  },
  {
    ...side, id: 'quest:cc-waystones', name: 'Wake the Waystones', type: 'side', region: 'vil:brind', giver: 'npc:sela',
    summary: 'Sela Moth is waking the old waystones of Morvane. Each one you light can send you back to it.',
    requires: ACT2, firstStage: 'brind',
    stages: [
      { id: 'brind', journal: 'Sela’s first waystone is the circle in Brindlecross itself.', objectives: [{ id: 'brind', text: 'Wake the Brindlecross waystone', reach: 'ws:brind', marker: { landmark: 'landmark:brind-waystone' } }], next: 'wood' },
      {
        id: 'wood', journal: 'Three more stones sleep in the Gloamwood and on the Briar path.',
        objectives: [
          { id: 'glade', text: 'Wake the Gloamwood Glade waystone', reach: 'ws:glade' },
          { id: 'stag', text: 'Wake the Stag’s Rest waystone', reach: 'ws:stag' },
          { id: 'briar', text: 'Wake the Briar Cottage waystone', reach: 'ws:briar' },
        ],
        next: 'report',
      },
      { id: 'report', journal: 'Four stones are awake and humming to each other along the roads. Sela will want to hear them.', objectives: [{ id: 'sela', text: 'Tell Sela the stones are awake', talk: 'npc:sela', marker: { landmark: 'landmark:brind-waystone' } }], next: 'listen' },
      { id: 'listen', journal: 'A fifth stone is answering the four, from somewhere no map shows: the Heart. Sela says the stones carry further at night.', objectives: [{ id: 'listen', text: 'Listen at the Brindlecross waystone after dark', when: { flag: 'cc.waystone_heart' }, marker: { landmark: 'landmark:brind-waystone' } }], onComplete: [{ trust: 'npc:sela', delta: 1 }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_map' }], lore: ['lore:hc-waystones'] },
  },

  // ---------------- bounties (Rook's board)
  {
    ...side, id: 'quest:cc-bounty-alpha', name: 'Bounty: Alpha of the Gloam', type: 'bounty', region: 'region:gloam', giver: 'npc:rook',
    summary: 'A wolf larger than a horse leads the packs. The militia has posted a bounty on it.',
    requires: after('quest:cc-wolves'), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'It howls before it leaps.', objectives: [{ id: 'alpha', text: 'Defeat the Alpha of the Gloam', kill: 'bx_alpha', count: 1, marker: { region: 'region:gloam' } }], end: { status: 'completed' } }],
    reward: { xpTier: 2, gold: 500, hcItems: [{ item: 'a_verdant_fur_chest' }] },
  },
  {
    ...side, id: 'quest:cc-bounty-slime', name: 'Bounty: The Slime King', type: 'bounty', region: 'region:briar', giver: 'npc:rook',
    summary: 'Something wearing a crown is gathering the slimes of Briar Hollow. Nan Briar says it is only the herald of something worse.',
    requires: ACT2, firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'It splits when hit hard.', objectives: [{ id: 'king', text: 'Defeat the Slime King', kill: 'bx_slimeking', count: 1, marker: { region: 'region:briar' } }], end: { status: 'completed' } }],
    reward: { xpTier: 2, gold: 400 },
  },
];

export default quests;
