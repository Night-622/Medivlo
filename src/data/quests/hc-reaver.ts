/**
 * Hollow Crown: the REAVER campaign (docs/lore/hollow-crown/06-outlines/ash.md). Act I on the Bleeding Fields
 * (area:ash-frontier) and the Act II class thread in Concordia. Owner: Claude 4.
 */
import type { NarrativeCondition, QuestDef } from '@/core';

const REV: NarrativeCondition = { heroClass: 'reaver' };
const done = (q: `quest:${string}`): NarrativeCondition => ({ questCompleted: q });
const req = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: [REV, ...c] });
const A1 = { act: 'act1' as const, campaign: 'reaver', chapter: 'The Bleeding Fields' };
const A2 = { act: 'act2' as const, campaign: 'reaver', chapter: 'Concordia' };
const A3 = { act: 'act3' as const, campaign: 'reaver', chapter: 'The Heart' };
const Z1 = 'zone:ash-frontier-1' as const, Z2 = 'zone:ash-frontier-2' as const, Z3 = 'zone:ash-frontier-3' as const, Z4 = 'zone:ash-frontier-4' as const;
const L1 = 'inst:ash-frontier-lair-1' as const, L2 = 'inst:ash-frontier-lair-2' as const, L3 = 'inst:ash-frontier-lair-3' as const;
const BR = 'npc:brenna-scald-hand' as const;

const quests: QuestDef[] = [
  // ======================= ACT I: main (I-1 … I-10)
  {
    ...A1, id: 'quest:reaver-the-bell-on-the-fields', name: 'The Bell on the Fields', type: 'main', region: Z1, giver: BR,
    summary: 'A night attack on the Red Muster’s palisade. Magma Hounds out of the Fields, a hundred of them, and Hask is not on the line.',
    requires: REV, autoStart: true, firstStage: 'palisade',
    stages: [
      {
        id: 'palisade', journal: 'Magma Hounds are coming over the palisade. Hold the line.',
        onEnter: [{ openDialogue: 'dialogue:reaver-palisade-night' }],
        objectives: [{ id: 'hounds', text: 'Hold the palisade against the Magma Hounds', kill: 'bx_ash_0', count: 4, marker: { landmark: 'landmark:muster-palisade' } }],
        onComplete: [{ openDialogue: 'dialogue:reaver-bell-rings' }],
        next: 'brenna',
      },
      {
        id: 'brenna', journal: 'The Bell rang. Every Reaver on the line lowered their axe. The hounds did not. And Hask was not on the line.',
        objectives: [{ id: 'brenna', text: 'Find Brenna at the palisade', talk: BR, marker: { landmark: 'landmark:muster-palisade' } }],
        onComplete: [{ setFlag: 'reaver.bell_heard', value: true }],
        next: 'wounded',
      },
      {
        id: 'wounded', journal: 'The wounded are laid out by the cookfire. Everyone is talking about the Bell, and nobody is talking about Hask.',
        objectives: [{ id: 'wounded', text: 'See to the wounded by the cookfire', interact: 'obj:reaver-wounded-*', count: 3, marker: { landmark: 'landmark:muster-cookfire' } }],
        next: 'dawn',
      },
      {
        id: 'dawn', journal: 'Brenna has gone up the watchtower to keep the dawn watch, as her grandmother did.',
        objectives: [{ id: 'brenna', text: 'Keep the dawn watch with Brenna', talk: BR, marker: { landmark: 'landmark:reaver-watchtower' } }],
        onComplete: [{ startQuest: 'quest:reaver-count-the-fallen' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-cinderreach', 'lore:hc-red-muster'] },
  },
  {
    ...A1, id: 'quest:reaver-count-the-fallen', name: 'Count the Fallen', type: 'main', region: Z2, giver: BR,
    summary: 'Brenna wants the dead brought home from the Fields before the lava takes them. The Muster buries its own.',
    requires: req(done('quest:reaver-the-bell-on-the-fields')), firstStage: 'field',
    stages: [
      {
        id: 'field', journal: 'Three Reavers fell beyond the palisade last night. Find them on the Fields.',
        objectives: [{ id: 'fallen', text: 'Find the fallen on the Bleeding Fields', interact: 'obj:fallen-reaver-*', count: 3, marker: { place: Z2 } }],
        next: 'tracks',
      },
      {
        id: 'tracks', journal: 'Three sets of footprints lead away from where the fallen lay, side by side, in step, towards the white lava.',
        objectives: [{ id: 'tracks', text: 'Follow the footprints into the Fields', interact: 'obj:reaver-footprints-end', marker: { landmark: 'landmark:reaver-white-lava' } }],
        next: 'report',
      },
      {
        id: 'report', journal: 'There are no bodies. Only black tears in the lava, and footprints walking away.',
        objectives: [{ id: 'brenna', text: 'Tell Brenna', talk: BR, marker: { landmark: 'landmark:brenna-tent' } }],
        onComplete: [{ startQuest: 'quest:reaver-the-drake-roost' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:reaver-the-drake-roost', name: 'The Drake Roost', type: 'main', region: Z4, giver: BR,
    summary: 'In the confusion of the night attack, the Cinder Drake carried off the Muster’s war-banner. A Muster without its banner is just a camp.',
    requires: req(done('quest:reaver-count-the-fallen')), firstStage: 'climb',
    stages: [
      {
        id: 'climb', journal: 'Nobody in the Muster knows a safe way up the Drakeholt. The deserter who lives up there will.',
        objectives: [{ id: 'hild', text: 'Ask Hild Ashfoot the way to the Roost', talk: 'npc:hermit-hild', marker: { landmark: 'landmark:hermit-hut' } }],
        next: 'roost',
      },
      {
        id: 'roost', journal: 'The Cinder Drake nests on the highest crag of the Drakeholt.',
        objectives: [{ id: 'roost', text: 'Climb to the Drake Roost', reach: L1, marker: { place: Z4 } }],
        next: 'drake',
      },
      {
        id: 'drake', journal: 'Knock it out of the sky with thrown axes. Mind the black ash.',
        objectives: [{ id: 'drake', text: 'Defeat the Cinder Drake', kill: 'bx_ash_4', count: 1 }],
        next: 'banner',
      },
      {
        id: 'banner', journal: 'The banner is in the nest, scorched and whole.',
        objectives: [{ id: 'banner', text: 'Take back the war-banner', interact: 'obj:muster-war-banner' }],
        next: 'report',
      },
      {
        id: 'report', journal: 'You have the banner.',
        objectives: [{ id: 'brenna', text: 'Bring the banner to Brenna', talk: BR, marker: { landmark: 'landmark:brenna-tent' } }],
        onComplete: [{ setFlag: 'reaver.banner', value: true }, { startQuest: 'quest:reaver-hask-comes-home' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 80 },
  },
  {
    ...A1, id: 'quest:reaver-hask-comes-home', name: 'Hask Comes Home', type: 'main', region: Z1, giver: BR,
    summary: 'Hask has walked back out of the Fields in the night, alive and grinning. The lava did not burn him. Nothing seems to.',
    requires: req(done('quest:reaver-the-drake-roost')), firstStage: 'hask',
    stages: [
      {
        id: 'hask', journal: 'The sentries say Hask came over the palisade at midnight, laughing.',
        objectives: [{ id: 'hask', text: 'Find Hask at the palisade', talk: 'npc:hask', marker: { landmark: 'landmark:muster-palisade' } }],
        next: 'sentry',
      },
      {
        id: 'sentry', journal: 'Two-Coin Jory had the midnight watch when Hask came back over the palisade.',
        objectives: [{ id: 'jory', text: 'Ask Jory what he saw', talk: 'npc:jory-two-coin', marker: { landmark: 'landmark:muster-wager-ring' } }],
        next: 'brenna',
      },
      {
        id: 'brenna', journal: 'He talks about winning the war forever. He was standing in a brazier while he said it.',
        objectives: [{ id: 'brenna', text: 'Talk to Brenna about her son', talk: BR, marker: { landmark: 'landmark:brenna-tent' } }],
        onComplete: [{ setFlag: 'reaver.hask_home', value: true }],
        next: 'vein',
      },
      {
        id: 'vein', journal: 'At dusk Hask slipped out past the line again, alone, towards the old lava vein where he fell in as a boy.',
        objectives: [{ id: 'vein', text: 'Follow Hask to the old vein', interact: 'obj:reaver-hask-vein', marker: { landmark: 'landmark:reaver-hask-vein' } }],
        onComplete: [{ startQuest: 'quest:reaver-the-muster-vote' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:reaver-the-muster-vote', name: 'The Muster’s Vote', type: 'main', region: Z1, giver: BR,
    summary: 'The Muster is splitting. Brenna wants to march on the Brand-Pits and end the hounds for good. Half the camp says the Bell rang, and by the old law, the war is over.',
    requires: req(done('quest:reaver-hask-comes-home')), firstStage: 'speak',
    stages: [
      {
        id: 'speak', journal: 'Before the ring, hear the two people who will have to live with whatever the Muster decides: the cook and the quartermaster.',
        objectives: [
          { id: 'cookie', text: 'Hear Cookie Mallow out', talk: 'npc:cookie-mallow', marker: { landmark: 'landmark:muster-cookfire' } },
          { id: 'grub', text: 'Hear Quartermaster Grub out', talk: 'npc:quartermaster-grub', marker: { landmark: 'landmark:muster-quartermaster' } },
        ],
        next: 'vote',
      },
      {
        id: 'vote', journal: 'The Muster gathers at the ring. Every Reaver gets a voice.',
        objectives: [{ id: 'vote', text: 'Speak at the Muster ring', when: { flag: 'reaver.muster' }, marker: { landmark: 'landmark:muster-ring' } }],
        onComplete: [{ startQuest: 'quest:reaver-the-brand-pits' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A1, id: 'quest:reaver-the-brand-pits', name: 'The Brand-Pits', type: 'main', region: Z2, giver: BR,
    summary: 'Every Magma Hound on the Fields comes out of the Brand-Pits, and the Brand-Mother is at the bottom of them.',
    requires: req(done('quest:reaver-the-muster-vote')), firstStage: 'pits',
    stages: [
      {
        id: 'pits', journal: 'Down into the Brand-Pits, to war or to parley.',
        objectives: [{ id: 'pits', text: 'Go down into the Brand-Pits', reach: L2, marker: { place: Z2 } }],
        onComplete: [{ openDialogue: 'dialogue:reaver-brand-mother' }],
        next: 'mother',
      },
      {
        id: 'mother', journal: 'The Brand-Mother is hollowed. Whatever you came to say, she has stopped listening.',
        objectives: [{ id: 'mother', text: 'Defeat the Brand-Mother', kill: 'cb_brand-mother', count: 1 }],
        next: 'seal',
      },
      {
        id: 'seal', journal: 'The pits are still spitting whelps. Brand them shut.',
        objectives: [{ id: 'seal', text: 'Brand the pits shut', interact: 'obj:brand-pit-seal' }],
        next: 'whelp',
      },
      {
        id: 'whelp', journal: 'Behind the last branded pit-mouth, something small is whining.',
        objectives: [{ id: 'whelp', text: 'See what is whining behind the last pit', interact: 'obj:reaver-brand-whelp' }],
        onComplete: [{ startQuest: 'quest:reaver-the-unburnt' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 120 },
  },
  {
    ...A1, id: 'quest:reaver-the-unburnt', name: 'The Unburnt', type: 'main', region: Z3, giver: BR,
    summary: 'Hask is raiding the Old Battle-Kiln with Reavers who should be dead. He wants a war that never has to end, fought by soldiers who never have to die.',
    requires: req(done('quest:reaver-the-brand-pits')), firstStage: 'raid',
    stages: [
      {
        id: 'raid', journal: 'Hollowed Reavers, the missing dead of the Fields, are attacking the Bone Ridge camp.',
        objectives: [{ id: 'raiders', text: 'Drive off the hollowed Reavers', kill: 'bx_hollowed', count: 5, marker: { place: Z3 } }],
        next: 'ginnet',
      },
      {
        id: 'ginnet', journal: 'One of the raiders dropped something in the ash as they fell back.',
        objectives: [{ id: 'axe', text: 'Find what the raiders left behind', interact: 'obj:reaver-ginnet-axe', marker: { place: Z3 } }],
        next: 'camp',
      },
      {
        id: 'camp', journal: 'Old Tam watched them march past the Bone Ridge camp. He knew every face.',
        objectives: [{ id: 'tam', text: 'Talk to Old Tam', talk: 'npc:old-tam', marker: { landmark: 'landmark:bone-ridge-banners' } }],
        next: 'brenna',
      },
      {
        id: 'brenna', journal: 'They fell back towards the Old Battle-Kiln, singing Hask’s name.',
        objectives: [{ id: 'brenna', text: 'Tell Brenna what Hask has become', talk: BR, marker: { landmark: 'landmark:brenna-tent' } }],
        onComplete: [{ setFlag: 'reaver.hask_turned', value: true }, { startQuest: 'quest:reaver-the-old-battle-kiln' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A1, id: 'quest:reaver-the-old-battle-kiln', name: 'The Old Battle-Kiln', type: 'main', region: L3, giver: BR,
    summary: 'The Field half of the Ash stone lies in the Old Battle-Kiln at the heart of the Fields. Hask is there first.',
    requires: req(done('quest:reaver-the-unburnt')), firstStage: 'kiln',
    stages: [
      {
        id: 'kiln', journal: 'The Old Battle-Kiln, a war-kiln from the Schools’ War, at the centre of the Fields. Your half-stone is singing from inside it.',
        objectives: [{ id: 'enter', text: 'Enter the Old Battle-Kiln', reach: L3, marker: { place: Z2 } }],
        next: 'hask',
      },
      {
        id: 'hask', journal: 'Hask fights like you, because he taught you. He cannot be burned. Push him into the cooled stone.',
        objectives: [{ id: 'hask', text: 'Face Hask the Unburnt', kill: 'cb_hask-the-unburnt', count: 1 }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'Hask fell into the lava and walked out the other side, smiling. The Field half is still singing in its cradle.',
        objectives: [{ id: 'stone', text: 'Claim the Field half', interact: 'obj:ash-frontier-halfstone' }],
        onComplete: [{ setFlag: 'reaver.halfstone', value: true }, { startQuest: 'quest:reaver-the-last-muster' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, skillPoints: 1, lore: ['lore:hc-half-stones'] },
  },
  {
    ...A1, id: 'quest:reaver-the-last-muster', name: 'The Last Muster', type: 'main', region: Z1, giver: BR,
    summary: 'Hask is walking to the Cinder Gate, and the half-stone in your hand can open it. Brenna has called the Muster out one last time.',
    requires: req(done('quest:reaver-the-old-battle-kiln')), firstStage: 'farewell',
    stages: [
      {
        id: 'farewell', journal: 'Brenna is waiting in her tent with the war-banner over her knees.',
        objectives: [{ id: 'brenna', text: 'Speak with Brenna', talk: BR, marker: { landmark: 'landmark:brenna-tent' } }],
        next: 'camp',
      },
      {
        id: 'camp', journal: 'Halfway up the Cinder Road, make camp for one last night on Ash soil.',
        objectives: [{ id: 'fire', text: 'Make camp on the road', interact: 'obj:reaver-last-campfire', marker: { landmark: 'landmark:reaver-road-camp' } }],
        next: 'road',
      },
      {
        id: 'road', journal: 'North, to the Cinder Gate, where the Pyrelord sleeps and does not sleep.',
        objectives: [{ id: 'gate', text: 'March to the Cinder Gate', reach: 'area:ash-gate', marker: { place: 'area:ash-gate' } }],
        onComplete: [{ startQuest: 'quest:reaver-the-cinder-gate' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:reaver-the-cinder-gate', name: 'The Cinder Gate (Fields side)', type: 'main', region: 'area:ash-gate', giver: BR,
    summary: 'Pyrelord Vulkan, the Muster’s oldest enemy, lies coiled round the Cinder Gate with its scales crusted black.',
    requires: req(done('quest:reaver-the-last-muster')), firstStage: 'vulkan',
    stages: [
      {
        id: 'vulkan', journal: 'Smash the hollow crust off its scales, then strike the fire beneath.',
        objectives: [{ id: 'vulkan', text: 'Defeat Pyrelord Vulkan', kill: 'bx_ash_5', count: 1 }],
        next: 'gate',
      },
      {
        id: 'gate', journal: 'The Pyrelord lies across the road with the black gone out of it, watching you. Behind it, the gate weeps.',
        objectives: [{ id: 'seal', text: 'Decide, and open the Cinder Gate', interact: 'obj:ash-gate-seal' }],
        onComplete: [{ setFlag: 'story.gate_open', value: true }, { setFlag: 'story.act', value: 2 }, { setFlag: 'reaver.act1_done', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 200, lore: ['lore:hc-realm-gates'] },
  },

  // ======================= ACT I: side quests (2 per zone)
  {
    ...A1, id: 'quest:reaver-a-wager-of-axes', name: 'A Wager of Axes', type: 'side', region: Z1, giver: 'npc:jory-two-coin',
    summary: 'Two-Coin Jory will take a wager that you can’t split three targets at forty paces. Two-Coin Jory has never paid out in full.',
    requires: req(done('quest:reaver-the-bell-on-the-fields')), firstStage: 'throw',
    stages: [
      { id: 'throw', journal: 'Three targets. Forty paces. One axe.', objectives: [{ id: 'targets', text: 'Split the targets', interact: 'obj:axe-target-*', count: 3, marker: { landmark: 'landmark:muster-wager-ring' } }], next: 'collect' },
      { id: 'collect', journal: 'Three for three. Now get Jory to pay.', objectives: [{ id: 'jory', text: 'Collect from Jory', talk: 'npc:jory-two-coin', marker: { landmark: 'landmark:muster-wager-ring' } }], next: 'book' },
      { id: 'book', journal: 'Jory paid in full, for the first time in twenty years, and went very quiet. His betting book is under the stakes board.', objectives: [{ id: 'book', text: 'Look under the stakes board', interact: 'obj:reaver-jory-book', marker: { landmark: 'landmark:muster-wager-ring' } }], next: 'jory' },
      { id: 'jory', journal: 'Twenty years of bets against Reavers coming home, and every one paid to their families.', objectives: [{ id: 'jory', text: 'Talk to Jory about his book', talk: 'npc:jory-two-coin', marker: { landmark: 'landmark:muster-wager-ring' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1, gold: 60 },
  },
  {
    ...A1, id: 'quest:reaver-the-cooks-last-ox', name: 'The Cook’s Last Ox', type: 'side', region: Z1, giver: 'npc:cookie-mallow',
    summary: 'The Muster is down to its last ox. Cookie Mallow needs food that isn’t raided from the truce villages, or the Muster will raid them anyway.',
    requires: req(done('quest:reaver-count-the-fallen')), firstStage: 'forage',
    stages: [
      { id: 'forage', journal: 'Fire-caps grow on the cooled lava, if you know where to look.', objectives: [{ id: 'caps', text: 'Gather fire-caps on the Fields', interact: 'obj:fire-cap-*', count: 3, marker: { place: Z2 } }], next: 'cook' },
      { id: 'cook', journal: 'A sack of fire-caps. Enough for a week of soup.', objectives: [{ id: 'cookie', text: 'Bring the fire-caps to Cookie', talk: 'npc:cookie-mallow', marker: { landmark: 'landmark:muster-cookfire' } }], next: 'village' },
      { id: 'village', journal: 'There is more soup than the Muster can eat. Cookie wants the rest taken to the truce village, the one the Muster was going to raid.', objectives: [{ id: 'pot', text: 'Take the soup to the truce village', interact: 'obj:reaver-truce-pot', marker: { landmark: 'landmark:reaver-truce-village' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_stew', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:reaver-hounds-at-the-well', name: 'Hounds at the Well', type: 'side', region: Z2, giver: 'npc:quartermaster-grub',
    summary: 'The Muster has one well, and a pack of Magma Hounds has decided it is theirs.',
    requires: req(done('quest:reaver-count-the-fallen')), firstStage: 'clear',
    stages: [
      { id: 'clear', journal: 'Clear the hounds off the well.', objectives: [{ id: 'hounds', text: 'Drive the hounds from the well', kill: 'bx_ash_0', count: 5, marker: { landmark: 'landmark:muster-well' } }], next: 'check' },
      { id: 'check', journal: 'The well is quiet. Make sure the water is still good.', objectives: [{ id: 'well', text: 'Check the well', interact: 'obj:muster-well' }], next: 'source' },
      { id: 'source', journal: 'The water tastes of salt. The well is fed from an old cistern under the rocks, and the hounds were sitting right on top of it.', objectives: [{ id: 'cistern', text: 'Find what is spoiling the well', interact: 'obj:reaver-well-cistern', marker: { landmark: 'landmark:muster-well' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1, gold: 50 },
  },
  {
    ...A1, id: 'quest:reaver-red-veins', name: 'Red Veins', type: 'side', region: Z2, giver: 'npc:quartermaster-grub',
    summary: 'Grub wants the lava veins mapped before the next march. Nobody has mapped them since the Schools’ War.',
    requires: req(done('quest:reaver-count-the-fallen')), firstStage: 'map',
    stages: [
      { id: 'map', journal: 'Three old survey stones mark the main veins.', objectives: [{ id: 'veins', text: 'Read the vein markers', interact: 'obj:vein-marker-*', count: 3, marker: { place: Z2 } }], next: 'grub' },
      { id: 'grub', journal: 'Every vein runs the same way: north, to the gate.', objectives: [{ id: 'grub', text: 'Bring the map to Grub', talk: 'npc:quartermaster-grub', marker: { landmark: 'landmark:muster-quartermaster' } }], next: 'confluence' },
      { id: 'confluence', journal: 'Grub wants to know where all the veins go. North of the Muster, they meet.', objectives: [{ id: 'meet', text: 'Find where the veins meet', interact: 'obj:reaver-vein-confluence', marker: { landmark: 'landmark:reaver-vein-confluence' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-bleeding-fields'] },
  },
  {
    ...A1, id: 'quest:reaver-banners-of-the-schools-war', name: 'Banners of the Schools’ War', type: 'side', region: Z3, giver: 'npc:old-tam',
    summary: 'The banners of the Schools’ War still hang on the Bone Ridge, a thousand years rotted. Old Tam says nobody remembers how that war ended.',
    requires: req(done('quest:reaver-the-drake-roost')), firstStage: 'banners',
    stages: [
      { id: 'banners', journal: 'Four banners still stand on the Ridge.', objectives: [{ id: 'banners', text: 'Read the old banners', interact: 'obj:war-banner-*', count: 4, marker: { landmark: 'landmark:bone-ridge-banners' } }], next: 'tam' },
      { id: 'tam', journal: 'The last banner is not a war-banner. It is the Concord’s.', objectives: [{ id: 'tam', text: 'Tell Old Tam', talk: 'npc:old-tam', marker: { landmark: 'landmark:bone-ridge-banners' } }], next: 'plant' },
      { id: 'plant', journal: 'Tam says a banner that ended a war shouldn’t rot on a ridge. Take it down to the Muster ring.', objectives: [{ id: 'pole', text: 'Raise the Concord banner at the Muster ring', interact: 'obj:reaver-ring-pole', marker: { landmark: 'landmark:muster-ring' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-schools-war'] },
  },
  {
    ...A1, id: 'quest:reaver-a-grave-for-old-cinder', name: 'A Grave for Old Cinder', type: 'side', region: Z3, giver: 'npc:old-tam',
    summary: 'Old Tam’s war-ram carried him through four wars and died in its sleep. Tam wants it buried on the Ridge, properly, with a cairn.',
    requires: req(done('quest:reaver-the-drake-roost')), firstStage: 'stones',
    stages: [
      { id: 'stones', journal: 'Tam wants the cairn built from stones of the places Cinder fought for him.', objectives: [{ id: 'stones', text: 'Gather stones from Old Cinder’s battles', interact: 'obj:reaver-cinder-stone-*', count: 3, marker: { place: Z3 } }], next: 'cairn' },
      { id: 'cairn', journal: 'Stones for a cairn, on the Ridge, where Cinder can see the Fields.', objectives: [{ id: 'cairn', text: 'Build Old Cinder’s cairn', interact: 'obj:old-cinder-cairn' }], next: 'tam' },
      { id: 'tam', journal: 'The cairn is built.', objectives: [{ id: 'tam', text: 'Fetch Old Tam to the cairn', talk: 'npc:old-tam' }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:reaver-warm-eggs', name: 'Warm Eggs', type: 'side', region: Z4, giver: 'npc:hermit-hild',
    summary: 'A clutch of drake eggs has been knocked out of the Roost. They are warm, and they have no black in them at all.',
    requires: req(done('quest:reaver-the-drake-roost')), firstStage: 'eggs',
    stages: [
      { id: 'eggs', journal: 'The eggs lie in the scree below the Roost.', objectives: [{ id: 'eggs', text: 'Find the drake eggs', interact: 'obj:drake-egg-nest', marker: { place: Z4 } }], next: 'hild' },
      { id: 'hild', journal: 'Hild will want to know what became of the eggs.', objectives: [{ id: 'hild', text: 'Tell Hild what you did with the eggs', talk: 'npc:hermit-hild', marker: { landmark: 'landmark:hermit-hut' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1, gold: 60 },
  },
  {
    ...A1, id: 'quest:reaver-the-hermit-of-the-holt', name: 'The Hermit of the Holt', type: 'side', region: Z4, giver: 'npc:hermit-hild',
    summary: 'There is a deserter living up in the Drakeholt with the drakes. The Muster spits when it says her name. She says she will talk to anyone who puts their axe down first.',
    requires: req(done('quest:reaver-the-drake-roost')), firstStage: 'talk',
    stages: [
      { id: 'talk', journal: 'Hild Ashfoot’s hut is high in the Drakeholt.', objectives: [{ id: 'wenna', text: 'Talk with the Hermit, axe down', talk: 'npc:hermit-hild', marker: { landmark: 'landmark:hermit-hut' } }], next: 'grub' },
      { id: 'grub', journal: 'Hild has written a letter, the first in twenty years, to someone at the Muster. It is addressed to the quartermaster.', objectives: [{ id: 'grub', text: 'Take Hild’s letter to Grub', talk: 'npc:quartermaster-grub', marker: { landmark: 'landmark:muster-quartermaster' } }], next: 'reply' },
      { id: 'reply', journal: 'Grub read the letter twice. He reads everything twice.', objectives: [{ id: 'hild', text: 'Bring Grub’s answer to Hild', talk: 'npc:hermit-hild', marker: { landmark: 'landmark:hermit-hut' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-hild'] },
  },

  // ======================= ACT I: mentor thread (2) and bounties (2)
  {
    ...A1, id: 'quest:reaver-brennas-arm', name: 'Brenna’s Arm', type: 'side', region: Z1, giver: BR,
    summary: 'Everyone in the Muster knows Brenna burned her arm. Nobody knows how.',
    requires: req({ trust: BR, value: 'friendly' }, done('quest:reaver-hask-comes-home')), firstStage: 'story',
    stages: [
      { id: 'story', journal: 'Sit with Brenna by the fire tonight. She might tell you.', objectives: [{ id: 'brenna', text: 'Ask Brenna about her arm', talk: BR, marker: { landmark: 'landmark:brenna-tent' } }], next: 'vein' },
      { id: 'vein', journal: 'Brenna says the vein where it happened is still there, past the line. She has never gone back.', objectives: [{ id: 'mark', text: 'Find the vein where Brenna burned her arm', interact: 'obj:reaver-brenna-handprint', marker: { landmark: 'landmark:reaver-hask-vein' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:reaver-the-peace-axe', name: 'The Peace-Axe', type: 'side', region: Z3, giver: BR,
    summary: 'The Muster has a ceremonial peace-axe, made a thousand years ago for the day the war ended. Nobody has seen it since Brenna’s grandmother hid it.',
    requires: req({ trust: BR, value: 'trusted' }, done('quest:reaver-the-drake-roost')), firstStage: 'find',
    stages: [
      { id: 'find', journal: 'Brenna thinks her grandmother buried it under the oldest banner on the Bone Ridge.', objectives: [{ id: 'axe', text: 'Find the peace-axe', interact: 'obj:muster-peace-axe', marker: { landmark: 'landmark:bone-ridge-banners' } }], next: 'home' },
      { id: 'home', journal: 'A plain axe of pale wood, never sharpened.', objectives: [{ id: 'brenna', text: 'Bring the peace-axe to Brenna', talk: BR, marker: { landmark: 'landmark:brenna-tent' } }], onComplete: [{ setFlag: 'reaver.brenna_devotable', value: true }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:reaver-bounty-prowlers', name: 'Bounty: the Bone Ridge Prowlers', type: 'bounty', region: Z3, giver: 'npc:quartermaster-grub',
    summary: 'A pack of Magma Hounds has been picking off sentries on the Bone Ridge.',
    requires: req(done('quest:reaver-the-drake-roost')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'Six of them, Grub reckons.', objectives: [{ id: 'hounds', text: 'Defeat the Bone Ridge prowlers', kill: 'bx_ash_0', count: 6, marker: { place: Z3 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 150 },
  },
  {
    ...A1, id: 'quest:reaver-bounty-slag-belly', name: 'Bounty: Slag-Belly', type: 'bounty', region: Z2, giver: 'npc:quartermaster-grub',
    summary: 'A Lava Slime the size of a supply wagon has been eating supply wagons.',
    requires: req(done('quest:reaver-count-the-fallen')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'Slag-Belly basks on the lava flats at noon.', objectives: [{ id: 'slime', text: 'Defeat Slag-Belly', kill: 'bx_ash_1', count: 1, marker: { place: Z2 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 120 },
  },

  // ======================= ACT II: the class thread (C-1 … C-6) + featured bearers
  // depth pass (wave 2): the axes over the Cinder Mug, escorting Orrin to the vent head, telling him, the axe-dead's trail,
  // Varric's muster-roll, and supper with the runner
  {
    ...A2, id: 'quest:reaver-kilnmouth', name: 'The Deserters of Kilnmouth', type: 'class', region: 'vil:kiln', giver: 'npc:forgewife-ada',
    summary: 'There are Ash-folk in Concordia, stranded since the arches shut. Some of them, the Muster says, were Reavers once.',
    requires: req(done('quest:cc-through-the-arch')), autoStart: true, firstStage: 'ada',
    stages: [
      { id: 'ada', journal: 'The Ash-folk of Concordia keep a cold kiln at Kilnmouth, in the Ashfall Kiln.', objectives: [{ id: 'ada', text: 'Find the Ash-folk of Kilnmouth', talk: 'npc:forgewife-ada', marker: { landmark: 'landmark:kiln-great-kiln' } }], next: 'axes' },
      {
        id: 'axes', journal: 'Over the hearth of the Cinder Mug hang three Reaver axes, edge up, the Muster’s way of saying “gone home”. The old smith who hung them is watching you look.',
        objectives: [{ id: 'axes', text: 'Look at the axes over the Cinder Mug’s hearth', interact: 'obj:reaver-kilnmouth-axes', marker: { landmark: 'landmark:kiln-cinder-mug' } }],
        onComplete: [{ startQuest: 'quest:reaver-ashmaws-breath' }], end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-kilnmouth'] },
  },
  {
    ...A2, id: 'quest:reaver-ashmaws-breath', name: 'Ashmaw’s Breath', type: 'class', region: 'region:ash', giver: 'npc:forgewife-ada',
    summary: 'The kilns of the Ashfall are built around a beast that would not die, like a war nobody can finish.',
    requires: req(done('quest:reaver-kilnmouth')), firstStage: 'escort',
    stages: [
      {
        id: 'escort', journal: 'Orrin Mattock has listened to Ashmaw breathing under his anvil for thirty years, and he wants to look at it once before he dies. He is seventy-eight, and the Ashfall has gone hollow. Keep him alive.',
        onEnter: [{ escort: 'npc:orrin-mattock', to: 'landmark:arcanist-vent-head' }],
        objectives: [{ id: 'orrin', text: 'Bring Orrin Mattock safely to the vent head', when: { any: [{ flag: 'escort.orrin-mattock', op: '==', value: 'arrived' }, { flag: 'escort.orrin-mattock', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:arcanist-vent-head' } }],
        next: [{ when: { flag: 'escort.orrin-mattock', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'read' }],
      },
      {
        id: 'regroup', journal: 'Orrin went down, and the other two deserters carried him home to Kilnmouth, arguing about whose fault it was. He is already looking for his other boot.',
        onEnter: [{ escort: 'npc:orrin-mattock', to: 'landmark:arcanist-vent-head' }],
        objectives: [{ id: 'orrin', text: 'Try again: bring Orrin to the vent head', when: { any: [{ flag: 'escort.orrin-mattock', op: '==', value: 'arrived' }, { flag: 'escort.orrin-mattock', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:arcanist-vent-head' } }],
        next: [{ when: { flag: 'escort.orrin-mattock', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'read' }],
      },
      {
        id: 'read', journal: 'Orrin is sitting on the lip of the vent head with his ear to the stone, the way he used to listen for hounds under the Fields.',
        objectives: [{ id: 'orrin', text: 'Hear what Orrin hears in the breath', talk: 'npc:orrin-mattock', marker: { landmark: 'landmark:arcanist-vent-head' } }],
        next: 'vents',
      },
      { id: 'vents', journal: 'Three breath-vents feed the Kilnmouth forges. Follow them down.', objectives: [{ id: 'vents', text: 'Follow Ashmaw’s breath-vents', interact: 'obj:ashmaw-vent-*', count: 3, marker: { region: 'region:ash' } }], next: 'down' },
      { id: 'down', journal: 'The vents lead to one place, under the oldest kiln.', objectives: [{ id: 'lair', text: 'Go down to Ashmaw', reach: 'inst:sentinel-ash' }], onComplete: [{ startQuest: 'quest:reaver-ashmaw' }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:reaver-ashmaw', name: 'Ashmaw', type: 'class', region: 'region:ash', giver: 'npc:forgewife-ada',
    summary: 'Ashmaw, the Kiln-Beast, lit the Turning torches for a thousand years. The tears found it first.',
    requires: req(done('quest:reaver-ashmaws-breath')), firstStage: 'fight',
    stages: [
      { id: 'fight', journal: 'Ashmaw is the Sentinel of the Ash school. Win its mark.', objectives: [{ id: 'ashmaw', text: 'Defeat Ashmaw', kill: 'bx_ashmaw', count: 1 }], onComplete: [{ openDialogue: 'dialogue:sentinel-release-ash' }], next: 'release' },
      { id: 'release', journal: 'In its last breath Ashmaw spoke to you.', objectives: [{ id: 'mark', text: 'Hear Ashmaw out', when: { flag: 'story.sentinel.ash' } }], next: 'tell' },
      {
        id: 'tell', journal: 'Every forge in Kilnmouth went out at once. Orrin will be at the Cinder Mug, under his three axes, waiting to hear how a thing that would not die finally did.',
        objectives: [{ id: 'orrin', text: 'Tell Orrin that Ashmaw is at rest', talk: 'npc:orrin-mattock', marker: { landmark: 'landmark:kiln-cinder-mug' } }],
        onComplete: [{ startQuest: 'quest:reaver-the-muster-of-the-dead' }], end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-ashmaw'] },
  },
  {
    ...A2, id: 'quest:reaver-the-muster-of-the-dead', name: 'The Muster of the Dead', type: 'class', region: 'region:alder', giver: 'npc:hobb',
    summary: 'The dead of Brindlecross are walking out of their graves at night, to a barrow under the moor. Hask is there, raising a muster of his own.',
    requires: req(done('quest:reaver-ashmaw')), firstStage: 'signs',
    stages: [
      {
        id: 'signs', journal: 'Somebody is mustering on the moor. Find the trail before you go asking: a muster always leaves one, whether it means to or not.',
        objectives: [{ id: 'signs', text: 'Follow the axe-dead’s trail across Aldermoor', interact: 'obj:reaver-muster-sign-*', count: 3, marker: { region: 'region:alder' } }],
        next: 'hobb',
      },
      { id: 'hobb', journal: 'Old Hobb at Brindlecross knows where the dead are walking to.', objectives: [{ id: 'hobb', text: 'Ask Old Hobb about the walking dead', talk: 'npc:hobb', marker: { landmark: 'landmark:brind-graveyard' } }], next: 'barrow' },
      { id: 'barrow', journal: 'Bonelord Varric’s barrow, under the moor. Hask has been seen at the door.', objectives: [{ id: 'barrow', text: 'Go down into Varric’s barrow', reach: 'inst:varric-barrow', marker: { landmark: 'landmark:barrow-door' } }], onComplete: [{ startQuest: 'quest:reaver-bonelord-varric' }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-varric'] },
  },
  {
    ...A2, id: 'quest:reaver-bonelord-varric', name: 'Bonelord Varric', type: 'class', region: 'region:alder', giver: 'npc:hobb',
    summary: 'Bonelord Varric ended the Schools’ War in single combat. Now he is raising the dead for a war that never ends, and Hask is his best student.',
    requires: req(done('quest:reaver-the-muster-of-the-dead')), firstStage: 'varric',
    stages: [
      { id: 'varric', journal: 'Varric is the Sentinel of the Blade school. The Blade bearers cannot win their mark while he keeps fighting.', objectives: [{ id: 'varric', text: 'Defeat Bonelord Varric', kill: 'bx_varric', count: 1 }], onComplete: [{ openDialogue: 'dialogue:sentinel-release-blade' }, { setFlag: 'story.bearer.samurai', value: true }], next: 'roll' },
      {
        id: 'roll', journal: 'Varric’s dead have lain down. On the barrow’s muster-table lies the roll he called them by, and the last page is not in his hand.',
        objectives: [{ id: 'roll', text: 'Read Varric’s muster-roll', interact: 'obj:reaver-varric-roll' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-varric'] },
  },
  {
    ...A2, id: 'quest:reaver-brennas-runner', name: 'Brenna’s Runner', type: 'class', region: 'vil:brind', giver: BR,
    summary: 'A runner from the Red Muster has come through the Ash arch, and won’t give her message to anyone but you.',
    requires: req(done('quest:reaver-bonelord-varric')), autoStart: true, firstStage: 'runner',
    stages: [
      { id: 'runner', journal: 'Dunny Ashbrook is waiting at the Gate Circle, out of breath.', objectives: [{ id: 'runner', text: 'Meet Brenna’s runner at the Gate Circle', talk: 'npc:brenna-runner', marker: { landmark: 'landmark:gate-circle' } }], next: 'supper' },
      {
        id: 'supper', journal: '“Eat something,” Brenna wrote. Dunny has run the whole Cinder Road on a heel of bread, and she will not run back without an answer. The Gilded Goose does a stew.',
        objectives: [{ id: 'runner', text: 'Feed Dunny at the Gilded Goose, and give her your answer', talk: 'npc:brenna-runner', marker: { landmark: 'landmark:brind-gilded-goose' } }],
        onComplete: [{ setFlag: 'story.act2_ready', value: true }], end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:reaver-duel-at-the-barrow', name: 'Duel at the Barrow', type: 'side', region: 'region:alder', giver: 'npc:bearer-swordsman',
    summary: 'The Swordsman bearer means to walk into Varric’s barrow alone and duel the first duellist for his mark.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'door',
    stages: [
      { id: 'door', journal: 'Gaspard Lisle is at the barrow door, sword drawn, talking to it.', objectives: [{ id: 'door', text: 'Catch the Swordsman bearer at the barrow door', interact: 'obj:barrow-door', marker: { landmark: 'landmark:barrow-door' } }], next: 'back' },
      { id: 'back', journal: 'Whatever you said at the door, Gaspard wants a word at the Stone Court.', objectives: [{ id: 'gaspard', text: 'Talk to the Swordsman bearer', when: { any: [{ flag: 'reaver.gaspard_thanked' }, { partyHasClass: 'swordsman' }] }, marker: { landmark: 'landmark:stone-court' } }], onComplete: [{ setFlag: 'story.bearer.swordsman', value: true }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A2, id: 'quest:reaver-the-brawlers-bout', name: 'The Brawler’s Bout', type: 'side', region: 'vil:kiln', giver: 'npc:bearer-brawler',
    summary: 'The Brawler bearer is hunting Ashmaw too, and says only one of you goes down first. She’d like to settle it in the Kilnmouth ash-ring.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'ring',
    stages: [
      { id: 'ring', journal: 'The ash-ring behind the Cinder Mug. Gloves on, axes off.', objectives: [{ id: 'ring', text: 'Meet the Brawler bearer in the ash-ring', interact: 'obj:kiln-ash-ring', marker: { landmark: 'landmark:kiln-cinder-mug' } }], next: 'back' },
      { id: 'back', journal: 'Bruised, both of you. Kat Mabry is buying.', objectives: [{ id: 'kat', text: 'Talk to the Brawler bearer', when: { any: [{ flag: 'reaver.kat_thanked' }, { partyHasClass: 'brawler' }] }, marker: { landmark: 'landmark:stone-court' } }], onComplete: [{ setFlag: 'story.bearer.brawler', value: true }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2 },
  },
  // ======================= ACT III: class quests (III-4 + 3 side)
  {
    ...A3, id: 'quest:reaver-the-unburnt-herald', name: 'The Unburnt Herald', type: 'class', region: 'region:heart', giver: 'npc:casimir',
    summary: 'At the top of the Twelve Stairs stands the Hollow King’s Herald, ringing a bell of slag. It is Hask, and he is still smiling.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'herald',
    stages: [
      { id: 'herald', journal: 'Hask has become the Unburnt Herald: a war that never has to end, wearing your brother’s face.', objectives: [{ id: 'herald', text: 'Face the Unburnt Herald', kill: 'cb_unburnt-herald', count: 1, marker: { landmark: 'landmark:twelve-stairs-top' } }], onComplete: [{ openDialogue: 'dialogue:reaver-herald-fate' }], next: 'fate' },
      { id: 'fate', journal: 'Hask is on his knees on the stair, laughing, and he still will not burn.', objectives: [{ id: 'fate', text: 'Decide Hask’s fate', when: { flag: 'reaver.nemesis_fate' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 3 },
  },
  {
    ...A3, id: 'quest:reaver-bring-him-home', name: 'Bring Him Home', type: 'side', region: 'region:heart', giver: BR,
    summary: '“If you find my son, bring him home, whatever he is now.” Brenna’s runner has come as far as the Heart camp to carry home whatever there is to carry.',
    requires: req({ flag: 'reaver.nemesis_fate' }, { flag: 'reaver.brenna_message' }), autoStart: true, firstStage: 'runner',
    stages: [
      { id: 'runner', journal: 'Dunny Ashbrook is waiting at the Heart camp.', objectives: [{ id: 'runner', text: 'Give Brenna’s runner your news', talk: 'npc:brenna-runner', marker: { landmark: 'landmark:heart-camp' } }], next: 'stair' },
      {
        id: 'stair', journal: 'Dunny can’t carry a man up the Cinder Road, and she won’t go home with empty hands. Hask’s axe is still lying where it fell, at the top of the stairs.',
        objectives: [{ id: 'axe', text: 'Fetch Hask’s axe from the top of the Twelve Stairs', interact: 'obj:reaver-hask-axe', marker: { landmark: 'landmark:twelve-stairs-top' } }],
        next: 'home',
      },
      {
        id: 'home', journal: 'The haft of Hask’s axe is bound round something older. Dunny should see it before she packs it.',
        objectives: [{ id: 'runner', text: 'Give Hask’s axe to Dunny at the Heart camp', talk: 'npc:brenna-runner', marker: { landmark: 'landmark:heart-camp' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:reaver-the-hollow-muster', name: 'The Hollow Muster', type: 'side', region: 'region:heart', giver: BR,
    summary: 'Ginnet and the others who walked off the Fields on the night of the Bell are standing in the Legion, still holding their axes.',
    requires: req(done('quest:heart-legion')), autoStart: true, firstStage: 'free',
    stages: [
      { id: 'free', journal: 'Find the hollowed Reavers in the Legion camp.', objectives: [{ id: 'ginnet', text: 'Free the hollow Muster', interact: 'obj:legion-reavers', marker: { landmark: 'landmark:legion-camp' } }], next: 'ginnet' },
      {
        id: 'ginnet', journal: 'The living ones are already arguing about the road home. Ginnet is not. She is sitting on her shield at the edge of the camp, and she wants a word.',
        objectives: [{ id: 'ginnet', text: 'Talk to Ginnet', talk: 'npc:ginnet-heart', marker: { landmark: 'landmark:legion-camp' } }],
        next: 'count',
      },
      {
        id: 'count', journal: 'The fallen have laid their axes in a row. By Muster law the fallen are counted aloud, by name, so that they can stop standing.',
        objectives: [{ id: 'count', text: 'Count the fallen home', interact: 'obj:reaver-legion-axe-row', marker: { landmark: 'landmark:legion-camp' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A3, id: 'quest:reaver-the-peace-axes-edge', name: 'The Peace-Axe’s Edge', type: 'side', region: 'region:heart', giver: BR,
    summary: 'Brenna wanted to plant the peace-axe somewhere a war was won. Nobody has ever won anything at the Heart. Maybe that is the point.',
    requires: req({ flag: 'reaver.brenna_devotable' }, done('quest:heart-stairs')), autoStart: true, firstStage: 'socket',
    stages: [
      {
        id: 'socket', journal: 'Somewhere at the top of the Twelve Stairs there ought to be a place for a thing like this. Look before you dig.',
        objectives: [{ id: 'socket', text: 'Find a place for the peace-axe at the top of the stairs', interact: 'obj:reaver-stair-mark', marker: { landmark: 'landmark:twelve-stairs-top' } }],
        next: 'plant',
      },
      { id: 'plant', journal: 'At the top of the Twelve Stairs there is a crack in the stone just wide enough for an axe-haft, and somebody from the Muster found it first.', objectives: [{ id: 'plant', text: 'Plant the peace-axe at the top of the stairs', interact: 'obj:heart-peace-axe-stone', marker: { landmark: 'landmark:twelve-stairs-top' } }], next: 'watch' },
      {
        id: 'watch', journal: 'A planted axe gets a first watch. That is older than the Muster, too.',
        objectives: [{ id: 'watch', text: 'Keep the first watch by the peace-axe', interact: 'obj:heart-peace-axe-stone', marker: { landmark: 'landmark:twelve-stairs-top' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
];

export default quests;
