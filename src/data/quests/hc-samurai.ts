/**
 * Hollow Crown: the SAMURAI campaign (docs/lore/hollow-crown/06-outlines/blade.md). Act I on the Hushpine Terraces
 * (area:blade-frontier) and the Act II class thread in Concordia. Zones: -1 the Hushpine Temple Road, -2 the
 * Hushpine Terraces, -3 the Ronin Camps, -4 the Bamboo Shallows. Kanemori’s words for the year are counted in the
 * flag samurai.kanemori_words (the journal word-counter). Owner: Claude 4.
 */
import type { NarrativeCondition, QuestDef } from '@/core';

const SA: NarrativeCondition = { heroClass: 'samurai' };
const done = (q: `quest:${string}`): NarrativeCondition => ({ questCompleted: q });
const req = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: [SA, ...c] });
const A1 = { act: 'act1' as const, campaign: 'samurai', chapter: 'The Hushpine Terraces' };
const A2 = { act: 'act2' as const, campaign: 'samurai', chapter: 'Concordia' };
const A3 = { act: 'act3' as const, campaign: 'samurai', chapter: 'The Heart' };
const Z1 = 'zone:blade-frontier-1' as const, Z2 = 'zone:blade-frontier-2' as const, Z3 = 'zone:blade-frontier-3' as const, Z4 = 'zone:blade-frontier-4' as const;
const L1 = 'inst:blade-frontier-lair-1' as const, L2 = 'inst:blade-frontier-lair-2' as const, L3 = 'inst:blade-frontier-lair-3' as const;
const HK = 'npc:haru-kanemori' as const, IS = 'npc:ikeda-shun' as const;

const quests: QuestDef[] = [
  // ======================= ACT I: main (I-1 … I-10)
  {
    ...A1, id: 'quest:samurai-the-bell-in-the-pines', name: 'The Bell in the Pines', type: 'main', region: Z1, giver: HK,
    summary: 'A silent night vigil on the Temple Road. A bell rang somewhere very far away, and every pine on the mountain let go of every needle at once.',
    requires: SA, autoStart: true, firstStage: 'road',
    stages: [
      {
        id: 'road', journal: 'Revenants are walking up the pilgrim road in the falling needles, swords drawn. Your chest is singing, and it is the first loud thing you have heard in a year.',
        onEnter: [{ openDialogue: 'dialogue:samurai-vigil-night' }],
        objectives: [{ id: 'revenants', text: 'Stop the Revenants on the Temple Road', kill: 'bx_blade_0', count: 3, marker: { place: Z1 } }],
        next: 'kanemori',
      },
      {
        id: 'kanemori', journal: 'Sensei Kanemori is standing at the top of the steps with his hands in his sleeves, looking at you.',
        objectives: [{ id: 'kanemori', text: 'Go to Sensei Kanemori', talk: HK, marker: { landmark: 'landmark:kanemori-cell' } }],
        onComplete: [{ setFlag: 'samurai.bell_heard', value: true }],
        next: 'climb',
      },
      {
        id: 'climb', journal: '“Come,” he said, and he has gone up the Temple Road into the dark, through the falling needles, towards the Lantern Shrine at the top of the steps. You follow.',
        objectives: [{ id: 'shrine', text: 'Follow Kanemori up to the Lantern Shrine', reach: 'landmark:samurai-lantern-shrine', marker: { landmark: 'landmark:samurai-lantern-shrine' } }],
        next: 'lanterns',
      },
      {
        id: 'lanterns', journal: 'Every lantern at the shrine has blown out. Kanemori is kneeling by the first of them with a taper, waiting for you.',
        objectives: [{ id: 'kanemori', text: 'Keep the vigil with Kanemori at the Lantern Shrine', talk: HK, marker: { landmark: 'landmark:samurai-lantern-shrine' } }],
        onComplete: [{ startQuest: 'quest:samurai-tea-before-steel' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-steelvale', 'lore:hc-hushpine-order'] },
  },
  {
    ...A1, id: 'quest:samurai-tea-before-steel', name: 'Tea Before Steel', type: 'main', region: Z2, giver: HK,
    summary: 'Without a word, Sensei Kanemori has put a tray in your hands: five cups of tea for the five dojo yards on the Terraces.',
    requires: req(done('quest:samurai-the-bell-in-the-pines')), firstStage: 'tea',
    stages: [
      {
        id: 'tea', journal: 'Five dojo yards, five cups of tea. Do not spill. Do not speak.',
        objectives: [{ id: 'yards', text: 'Carry tea to the five dojo yards', interact: 'obj:hushpine-dojo-*', count: 5, marker: { place: Z2 } }],
        next: 'trail',
      },
      {
        id: 'trail', journal: 'Sandal-prints in the dew, going down the terrace steps towards the valley and the Camps. The novices left in a hurry. Follow them a little way.',
        objectives: [{ id: 'trail', text: 'Follow the novices’ trail down the terraces', interact: 'obj:samurai-novice-trail-*', count: 3, marker: { place: Z2 } }],
        next: 'report',
      },
      {
        id: 'report', journal: 'Four of the five yards were empty. The novices have gone down to the Ronin Camps for pay. And the tea-terraces are curling black at the leaf.',
        objectives: [{ id: 'kanemori', text: 'Bring the cold cups back to Kanemori', talk: HK, marker: { landmark: 'landmark:kanemori-cell' } }],
        onComplete: [{ startQuest: 'quest:samurai-the-ronin-fort' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:samurai-the-ronin-fort', name: 'The Ronin Fort', type: 'main', region: Z3, giver: HK,
    summary: 'The Ronin Captain is press-ganging pilgrims off the Temple Road to fill the Thousand-Edge General’s muster. He is, by some distance, the loudest man on the frontier.',
    requires: req(done('quest:samurai-tea-before-steel')), firstStage: 'fort',
    stages: [
      {
        id: 'fort', journal: 'The Ronin Fort is a stockade in the Ronin Camps. You can hear the Captain from the Terraces.',
        objectives: [{ id: 'enter', text: 'Go into the Ronin Fort', reach: L1, marker: { place: Z3 } }],
        next: 'captain',
      },
      {
        id: 'captain', journal: 'He shouts every attack before he makes it. On a frontier this quiet, the shouts are a gift.',
        objectives: [{ id: 'captain', text: 'Defeat the Ronin Captain', kill: 'bx_blade_4', count: 1 }],
        next: 'pilgrims',
      },
      {
        id: 'pilgrims', journal: 'The press-ganged pilgrims are roped together in the stockade yard.',
        objectives: [{ id: 'pilgrims', text: 'Free the pilgrims', interact: 'obj:ronin-fort-stockade' }],
        next: 'report',
      },
      {
        id: 'report', journal: 'The pilgrims are walking home up the Temple Road, in silence, as is proper.',
        objectives: [{ id: 'kanemori', text: 'Return to Kanemori', talk: HK, marker: { landmark: 'landmark:kanemori-cell' } }],
        onComplete: [{ setFlag: 'samurai.captain_down', value: true }, { startQuest: 'quest:samurai-the-lord-of-no-master' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 80, hcItems: [{ item: 'i_st', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:samurai-the-lord-of-no-master', name: 'The Lord of No Master', type: 'main', region: Z3, giver: IS,
    summary: 'Lord Ikeda Shun, warlord of the Ronin Companies, has ridden into the Camps. He has sent word that he would like to thank you for beating his captain.',
    requires: req(done('quest:samurai-the-ronin-fort')), firstStage: 'pavilion',
    stages: [
      {
        id: 'pavilion', journal: 'Ikeda’s pavilion is the only quiet place in the Ronin Camps. Its doors are open.',
        objectives: [{ id: 'ikeda', text: 'Go to Lord Ikeda’s pavilion', talk: IS, marker: { landmark: 'landmark:ikeda-pavilion' } }],
        onComplete: [{ setFlag: 'samurai.ikeda_met', value: true }],
        next: 'camps',
      },
      {
        id: 'camps', journal: 'Ikeda says your novices are paid fairly now. Three of them are in the Camps below his pavilion. See for yourself.',
        objectives: [{ id: 'novices', text: 'Find the Hushpine novices in the Ronin Camps', interact: 'obj:samurai-camp-novice-*', count: 3, marker: { place: Z3 } }],
        next: 'ride',
      },
      {
        id: 'ride', journal: 'Ikeda has ridden up to the lip of the valley, where the Camps end and the mountain begins, and sent a rider to ask whether you would care to join him.',
        objectives: [{ id: 'lip', text: 'Ride out to Ikeda at the valley’s lip', reach: 'landmark:samurai-valley-lip', marker: { landmark: 'landmark:samurai-valley-lip' } }],
        next: 'lip',
      },
      {
        id: 'lip', journal: 'From the valley’s lip you can see the whole mountain: the Camps below, the Terraces above, and at the very top, in the cloud, the High Terrace. Ikeda is looking at it.',
        objectives: [{ id: 'ikeda', text: 'Talk with Ikeda at the valley’s lip', talk: IS, marker: { landmark: 'landmark:samurai-valley-lip' } }],
        onComplete: [{ startQuest: 'quest:samurai-the-call-to-muster' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-ikeda-shun', 'lore:hc-ronin-companies'] },
  },
  {
    ...A1, id: 'quest:samurai-the-call-to-muster', name: 'The Call to Muster', type: 'main', region: Z2, giver: 'npc:fumiko-sora',
    summary: 'The Thousand-Edge General has called every blade in Steelvale to the Edge Gate. The Order’s elders say a sword must answer its realm’s marshal. Ikeda’s Ronin offer the novices another way.',
    requires: req(done('quest:samurai-the-lord-of-no-master')), firstStage: 'canvass',
    stages: [
      {
        id: 'canvass', journal: 'Before the elders sit, hear the two ends of it: the one novice who never went down the mountain, and a ronin who has served a purse all his life and is honest about it.',
        objectives: [
          { id: 'kenta', text: 'Ask Kenta whom a sword should serve', talk: 'npc:kenta', marker: { landmark: 'landmark:hushpine-fifth-yard' } },
          { id: 'daisuke', text: 'Ask Daisuke Nine-Coins whom a sword should serve', talk: 'npc:daisuke-nine-coins', marker: { landmark: 'landmark:daisuke-camp' } },
        ],
        next: 'yard',
      },
      {
        id: 'yard', journal: 'The elders sit in the Elders’ Yard on the Terraces. The novices who came back up from the Camps stand behind them. Ikeda stands at the gate, smiling.',
        objectives: [{ id: 'vote', text: 'Answer the call in the Elders’ Yard', when: { flag: 'samurai.oath' }, marker: { landmark: 'landmark:hushpine-elders-yard' } }],
        next: 'dawn',
      },
      {
        id: 'dawn', journal: 'Whatever was chosen happens at dawn, at the temple gate at the head of the Temple Road. Be there.',
        objectives: [{ id: 'gate', text: 'Go to the temple gate at dawn', interact: 'obj:samurai-muster-dawn', marker: { landmark: 'landmark:temple-road-gate' } }],
        onComplete: [{ startQuest: 'quest:samurai-the-sheathed-blade' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A1, id: 'quest:samurai-the-sheathed-blade', name: 'The Sheathed Blade', type: 'main', region: Z4, giver: HK,
    summary: 'Whatever was decided in the Elders’ Yard, someone has broken the seal on the old shrine in the Bamboo Shallows, and what was kept inside has got out.',
    requires: req(done('quest:samurai-the-call-to-muster')), firstStage: 'shrine',
    stages: [
      {
        id: 'shrine', journal: 'The Shrine of the Sheathed Blade stands in the flooded bamboo, its seal broken, its door swinging.',
        objectives: [{ id: 'enter', text: 'Enter the Shrine of the Sheathed Blade', reach: L2, marker: { place: Z4 } }],
        onComplete: [{ openDialogue: 'dialogue:samurai-shrine' }],
        next: 'offerings',
      },
      {
        id: 'offerings', journal: 'The shrine’s side halls are full of offerings, left by pilgrims for a thousand years. Something has been cutting at them. Look before you go in to it.',
        objectives: [{ id: 'offerings', text: 'Look at the shrine’s cut offerings', interact: 'obj:samurai-shrine-offering-*', count: 3 }],
        next: 'unsheathed',
      },
      {
        id: 'unsheathed', journal: 'A sword-spirit that has never been put away. It cannot be blocked. Dodge until it overreaches, then drive it back to its sheath.',
        objectives: [{ id: 'unsheathed', text: 'Sheathe the Unsheathed', kill: 'cb_the-unsheathed', count: 1 }],
        next: 'sheath',
      },
      {
        id: 'sheath', journal: 'On the shrine’s altar lies another sheath, an old one, empty. The sword that belonged in it was taken thirty years ago.',
        objectives: [{ id: 'sheath', text: 'Look at the empty sheath', interact: 'obj:shrine-empty-sheath' }],
        onComplete: [{ setFlag: 'samurai.empty_sheath', value: true }, { startQuest: 'quest:samurai-a-blade-with-no-master' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 120 },
  },
  {
    ...A1, id: 'quest:samurai-a-blade-with-no-master', name: 'A Blade with No Master', type: 'main', region: Z1, giver: HK,
    summary: 'Ikeda is marching up the silent Temple Road, talking, with Blade Dancers at his back: swords with no dancers in them.',
    requires: req(done('quest:samurai-the-sheathed-blade')), firstStage: 'dancers',
    stages: [
      {
        id: 'dancers', journal: 'The Blade Dancers spin up the road ahead of him, hollow and bright.',
        objectives: [{ id: 'dancers', text: 'Stop the Blade Dancers on the Temple Road', kill: 'bx_blade_1', count: 4, marker: { place: Z1 } }],
        next: 'pilgrims',
      },
      {
        id: 'pilgrims', journal: 'The pilgrims on the Temple Road have scattered into the pines, away from the noise. Find them before you go on.',
        objectives: [{ id: 'pilgrims', text: 'Find the pilgrims hiding in the pines', interact: 'obj:samurai-hidden-pilgrim-*', count: 3, marker: { place: Z1 } }],
        next: 'ikeda',
      },
      {
        id: 'ikeda', journal: 'Ikeda has stopped at the Temple Road gate, under the pines, and is waiting for you with his hand on his hilt.',
        objectives: [{ id: 'ikeda', text: 'Face Ikeda at the Temple Road gate', talk: IS, marker: { landmark: 'landmark:temple-road-gate' } }],
        onComplete: [{ setFlag: 'samurai.ikeda_known', value: true }],
        next: 'cell',
      },
      {
        id: 'cell', journal: 'Ikeda has gone up towards the High Terrace. Kanemori must be told, and you think he already knows.',
        objectives: [{ id: 'kanemori', text: 'Tell Kanemori about Ikeda', talk: HK, marker: { landmark: 'landmark:kanemori-cell' } }],
        onComplete: [{ startQuest: 'quest:samurai-the-high-terrace' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-blade-dancers'] },
  },
  {
    ...A1, id: 'quest:samurai-the-high-terrace', name: 'The High Terrace', type: 'main', region: L3, giver: HK,
    summary: 'The Terrace half lies in the shrine on the top terrace, above the clouds. Ikeda has gone up the last stair to set it in himself, and become a blade that answers to no hand.',
    requires: req(done('quest:samurai-a-blade-with-no-master')), firstStage: 'climb',
    stages: [
      {
        id: 'climb', journal: 'Up the last stair, through the cloud, to the High Terrace. Your half-stone is singing, and up here it is the only sound there is.',
        objectives: [{ id: 'enter', text: 'Climb to the High Terrace', reach: L3, marker: { place: Z2 } }],
        next: 'ikeda',
      },
      {
        id: 'ikeda', journal: 'He never sheathes, so he never stops. Every instinct says attack. Sheathe. Wait. Draw when he commits.',
        objectives: [{ id: 'ikeda', text: 'Face Lord Ikeda Shun', kill: 'cb_ikeda-shun', count: 1 }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'Ikeda stepped off the edge of the terrace into the cloud. The shrine is open, and the Terrace half is singing in it.',
        objectives: [{ id: 'stone', text: 'Claim the Terrace half', interact: 'obj:blade-frontier-halfstone' }],
        onComplete: [{ setFlag: 'samurai.halfstone', value: true }, { startQuest: 'quest:samurai-the-pilgrim-road-down' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, skillPoints: 1, lore: ['lore:hc-half-stones'] },
  },
  {
    ...A1, id: 'quest:samurai-the-pilgrim-road-down', name: 'The Pilgrim Road Down', type: 'main', region: Z1, giver: HK,
    summary: 'Ikeda has gone down to the General’s muster at the Edge Gate. The half-stone in your hand can open it. Sensei Kanemori is waiting at the top of the pilgrim road.',
    requires: req(done('quest:samurai-the-high-terrace')), firstStage: 'farewell',
    stages: [
      {
        id: 'farewell', journal: 'Kanemori sits on the top step of the pilgrim road, looking down it.',
        objectives: [{ id: 'kanemori', text: 'Sit with Sensei Kanemori', talk: HK, marker: { landmark: 'landmark:kanemori-cell' } }],
        next: 'milestone',
      },
      {
        id: 'milestone', journal: 'The last milestone of the Temple Road stands where the pines end. Pilgrims leaving Hushpine stop there and keep one moment of silence for the road behind them.',
        objectives: [{ id: 'stone', text: 'Keep the silence at the last milestone', interact: 'obj:samurai-last-milestone', marker: { landmark: 'landmark:samurai-last-milestone' } }],
        next: 'road',
      },
      {
        id: 'road', journal: 'Down the pilgrim road, through the pines, to the Edge Gate.',
        objectives: [{ id: 'gate', text: 'Walk the pilgrim road down to the Edge Gate', reach: 'area:blade-gate', marker: { place: 'area:blade-gate' } }],
        onComplete: [{ startQuest: 'quest:samurai-the-edge-gate' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:samurai-the-edge-gate', name: 'The Edge Gate (terrace side)', type: 'main', region: 'area:blade-gate', giver: HK,
    summary: 'The Thousand-Edge General stands before the Edge Gate. From the terrace side, his edges are drawn to drawn steel, and a sheathed blade passes through them.',
    requires: req(done('quest:samurai-the-pilgrim-road-down')), firstStage: 'general',
    stages: [
      {
        id: 'general', journal: 'Stay sheathed. Let the edges pass. Strike the General in the gap when he over-commits.',
        onEnter: [{ openDialogue: 'dialogue:samurai-edge-gate-novices' }],
        objectives: [{ id: 'general', text: 'Wait out the Thousand-Edge General', kill: 'bx_blade_5', count: 1 }],
        next: 'gate',
      },
      {
        id: 'gate', journal: 'He laid his edges down, one by one, and knelt. Behind him the gate is weeping black.',
        objectives: [{ id: 'seal', text: 'Open the Edge Gate with the half-stone', interact: 'obj:blade-gate-seal' }],
        onComplete: [{ setFlag: 'story.gate_open', value: true }, { setFlag: 'story.act', value: 2 }, { setFlag: 'samurai.act1_done', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 200, lore: ['lore:hc-realm-gates', 'lore:hc-thousand-edge-general'] },
  },

  // ======================= ACT I: side quests (2 per zone)
  {
    ...A1, id: 'quest:samurai-the-loudest-pilgrim', name: 'The Loudest Pilgrim', type: 'side', region: Z1, giver: 'npc:hettie-natter',
    summary: 'Goodwife Hettie Natter cannot stop talking on the silent Temple Road, and is mortified about it, and is telling everybody how mortified she is.',
    requires: req(done('quest:samurai-the-bell-in-the-pines')), firstStage: 'signs',
    stages: [
      {
        id: 'signs', journal: 'The pilgrims’ hand-signs are cut into the milestones of the Temple Road. Learn three, and teach them to Hettie.',
        objectives: [{ id: 'signs', text: 'Learn the hand-signs from the milestones', interact: 'obj:pilgrim-sign-stone-*', count: 3, marker: { place: Z1 } }],
        next: 'shrine',
      },
      {
        id: 'shrine', journal: 'Hettie has three signs and a great deal of determination. Walk her to the road shrine without a word.',
        objectives: [{ id: 'shrine', text: 'Walk Hettie to the road shrine in silence', interact: 'obj:temple-road-shrine', marker: { place: Z1 } }],
        next: 'hettie',
      },
      {
        id: 'hettie', journal: 'She made it. She is bursting.',
        objectives: [{ id: 'hettie', text: 'Let Hettie speak', talk: 'npc:hettie-natter', marker: { place: Z1 } }],
        onComplete: [{ setFlag: 'samurai.hettie_silent', value: true }],
        next: 'echo',
      },
      {
        id: 'echo', journal: 'Hettie did not come up the Temple Road to be quiet. She came to say one thing, at the Echo Stone, where a pilgrim may speak once and be heard by whoever they have lost.',
        objectives: [{ id: 'echo', text: 'Take Hettie to the Echo Stone', interact: 'obj:samurai-echo-stone', marker: { landmark: 'landmark:samurai-echo-stone' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 30, hcItems: [{ item: 'i_cake' }] },
  },
  {
    ...A1, id: 'quest:samurai-the-pine-that-fell', name: 'The Pine That Fell', type: 'side', region: Z1, giver: 'npc:ren-tsuge',
    summary: 'A thousand-year pine fell across the Temple Road on the night of the Bell. The Order’s carpenter, Master Ren Tsuge, wants its rings counted before it is cut.',
    requires: req(done('quest:samurai-the-bell-in-the-pines')), firstStage: 'rings',
    stages: [
      {
        id: 'rings', journal: 'One ring for every year. Count them with your finger, from the heart out.',
        objectives: [{ id: 'rings', text: 'Count the fallen pine’s rings', interact: 'obj:fallen-pine-rings', marker: { landmark: 'landmark:fallen-pine' } }],
        next: 'tsuge',
      },
      {
        id: 'tsuge', journal: 'A thousand rings, and the last thirty are black.',
        objectives: [{ id: 'tsuge', text: 'Tell Master Tsuge the count', talk: 'npc:ren-tsuge', marker: { landmark: 'landmark:fallen-pine' } }],
        next: 'bench',
      },
      {
        id: 'bench', journal: 'Tsuge has made a bench from the pine, and wants it set at the Resting Bend, halfway up the road, where the old pilgrims stop for breath. He cannot carry it and be quiet at the same time.',
        objectives: [{ id: 'bench', text: 'Set the pine bench at the Resting Bend', interact: 'obj:samurai-pine-bench', marker: { landmark: 'landmark:samurai-resting-bend' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-fallen-pine'] },
  },
  {
    ...A1, id: 'quest:samurai-tea-without-water', name: 'Tea Without Water', type: 'side', region: Z2, giver: 'npc:chiyo-ashina',
    summary: 'Tea-Mistress Chiyo Ashina’s spring is running black, and every terrace below it drinks from the spring.',
    requires: req(done('quest:samurai-tea-before-steel')), firstStage: 'source',
    stages: [
      {
        id: 'source', journal: 'The Ashina spring rises in a rock basin above the top tea-terrace. Something has got into it.',
        objectives: [{ id: 'source', text: 'Clear the tears from the Ashina spring', interact: 'obj:ashina-spring-source', marker: { landmark: 'landmark:ashina-spring' } }],
        next: 'chiyo',
      },
      {
        id: 'chiyo', journal: 'The spring runs clear. The first terrace is already drinking.',
        objectives: [{ id: 'chiyo', text: 'Tell Chiyo Ashina', talk: 'npc:chiyo-ashina', marker: { landmark: 'landmark:ashina-spring' } }],
        next: 'crack',
      },
      {
        id: 'crack', journal: 'Chiyo has pointed, without a word, above the spring: the tears are still coming from somewhere. Up the rock, where the water first comes out of the mountain, there is a crack.',
        objectives: [{ id: 'crack', text: 'Find where the tears come into the spring', interact: 'obj:samurai-spring-crack', marker: { landmark: 'landmark:samurai-spring-crack' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50, hcItems: [{ item: 'i_em_s', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:samurai-the-novice-who-stayed', name: 'The Novice Who Stayed', type: 'side', region: Z2, giver: 'npc:kenta',
    summary: 'Ten-year-old Kenta is the only novice who did not go down to the Ronin Camps. He practises alone in the empty dojo yard, and he would like a sparring partner.',
    requires: req(done('quest:samurai-tea-before-steel')), firstStage: 'spar',
    stages: [
      {
        id: 'spar', journal: 'Kenta’s practice post is in the fifth dojo yard. He has worn it smooth.',
        objectives: [{ id: 'spar', text: 'Spar with Kenta', interact: 'obj:kenta-practice-post', marker: { place: Z2 } }],
        next: 'kenta',
      },
      {
        id: 'kenta', journal: 'Kenta is sitting on the yard step, bruised and delighted.',
        objectives: [{ id: 'kenta', text: 'Sit with Kenta', talk: 'npc:kenta', marker: { place: Z2 } }],
        onComplete: [{ setFlag: 'samurai.kenta_sparred', value: true }],
        next: 'brother',
      },
      {
        id: 'brother', journal: 'Kenta’s older brother Ryo went down to the Camps with the others. Kenta has wrapped a rice ball for him in a leaf, and is too proud to take it himself.',
        objectives: [{ id: 'ryo', text: 'Take Kenta’s rice ball to Ryo in the Camps', interact: 'obj:samurai-kenta-brother', marker: { place: Z3 } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:samurai-nine-coins', name: 'Nine Coins', type: 'side', region: Z3, giver: 'npc:daisuke-nine-coins',
    summary: 'Daisuke Nine-Coins’s company of ronin has been cheated by its paymaster. Daisuke is a sword for hire, and honest about it, and would like to be paid.',
    requires: req(done('quest:samurai-the-ronin-fort')), firstStage: 'ozu',
    stages: [
      {
        id: 'ozu', journal: 'Paymaster Ozu keeps the Companies’ strongbox in a tent with a great many locks on it.',
        objectives: [{ id: 'ozu', text: 'Have a word with Paymaster Ozu', talk: 'npc:paymaster-ozu', marker: { place: Z3 } }],
        next: 'daisuke',
      },
      {
        id: 'daisuke', journal: 'The purse is heavy. It is exactly as heavy as it should be.',
        objectives: [{ id: 'daisuke', text: 'Bring Daisuke his company’s pay', talk: 'npc:daisuke-nine-coins', marker: { place: Z3 } }],
        next: 'strongbox',
      },
      {
        id: 'strongbox', journal: 'Daisuke wants to know where the missing coin was going. Ozu’s strongbox has a second, smaller ledger under the false bottom.',
        objectives: [{ id: 'ledger', text: 'Look under the false bottom of Ozu’s strongbox', interact: 'obj:samurai-ozu-strongbox', marker: { landmark: 'landmark:daisuke-camp' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 90 },
  },
  {
    ...A1, id: 'quest:samurai-the-whetstone-stall', name: 'The Whetstone Stall', type: 'side', region: Z3, giver: 'npc:old-tomoe',
    summary: 'Old Tomoe sharpens anyone’s sword in the Ronin Camps and asks no questions. She has offered to sharpen yours.',
    requires: req(done('quest:samurai-the-ronin-fort')), firstStage: 'wheel',
    stages: [
      {
        id: 'wheel', journal: 'Tomoe’s wheel is behind her stall. She wants you to turn it while she works.',
        objectives: [{ id: 'wheel', text: 'Turn Old Tomoe’s whetstone', interact: 'obj:tomoe-whetstone-wheel', marker: { landmark: 'landmark:tomoe-whetstone' } }],
        next: 'tomoe',
      },
      {
        id: 'tomoe', journal: 'Your sword is sharper than it has ever been. Tomoe is wiping it down, and talking, which she never does.',
        objectives: [{ id: 'tomoe', text: 'Listen to Old Tomoe', talk: 'npc:old-tomoe', marker: { landmark: 'landmark:tomoe-whetstone' } }],
        next: 'sheath',
      },
      {
        id: 'sheath', journal: 'Tomoe has given you a plain wooden sheath and asked you to leave it on Ikeda’s cushion in his pavilion, as she does every month. He laughs, she says, and throws them away.',
        objectives: [{ id: 'sheath', text: 'Leave Tomoe’s sheath in Ikeda’s pavilion', interact: 'obj:samurai-ikeda-sheaths', marker: { landmark: 'landmark:ikeda-pavilion' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-old-tomoe'] },
  },
  {
    ...A1, id: 'quest:samurai-the-dancers-partner', name: 'The Dancer’s Partner', type: 'side', region: Z4, giver: 'npc:natsu',
    summary: 'One Blade Dancer in the Bamboo Shallows is not hostile. Punt-woman Natsu has watched it dance alone in the mist every morning for thirty years, waiting.',
    requires: req(done('quest:samurai-the-call-to-muster')), firstStage: 'watch',
    stages: [
      {
        id: 'watch', journal: 'The lonely Dancer turns in the mist by the old channel.',
        objectives: [{ id: 'watch', text: 'Watch the lonely Blade Dancer', interact: 'obj:lonely-dancer', marker: { place: Z4 } }],
        next: 'sword',
      },
      {
        id: 'sword', journal: 'It always turns to the same place in the water, as if reaching for something under it.',
        objectives: [{ id: 'sword', text: 'Find the partner’s sword in the shallows', interact: 'obj:dancer-partner-sword', marker: { place: Z4 } }],
        next: 'natsu',
      },
      {
        id: 'natsu', journal: 'Two swords dancing in the mist, and then dancing away.',
        objectives: [{ id: 'natsu', text: 'Tell Natsu', talk: 'npc:natsu', marker: { landmark: 'landmark:natsu-landing' } }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'Natsu says the old channel ends at a dancers’ stone, where the Shallows’ blade-dancers used to perform for the Turning procession. The two swords were going that way.',
        objectives: [{ id: 'stone', text: 'Follow the dancers to the end of the old channel', interact: 'obj:samurai-dancers-stone', marker: { landmark: 'landmark:samurai-dancers-stone' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 60 },
  },
  {
    ...A1, id: 'quest:samurai-the-frog-choir', name: 'The Frog Choir', type: 'side', region: Z4, giver: 'npc:natsu',
    summary: 'The frogs of the Bamboo Shallows are the only things on the frontier allowed to be loud, and they are very bad at it without their conductor, who has gone missing.',
    requires: req(done('quest:samurai-tea-before-steel')), firstStage: 'reeds',
    stages: [
      {
        id: 'reeds', journal: 'The conductor is a very old, very large frog called Gama. He was last seen in the reeds round the frog pond.',
        objectives: [{ id: 'reeds', text: 'Search the reeds round the frog pond', interact: 'obj:frog-pond-reed-*', count: 3, marker: { landmark: 'landmark:frog-pond' } }],
        next: 'gama',
      },
      {
        id: 'gama', journal: 'Old Gama is sitting on a stone in the middle of the pond, sulking.',
        objectives: [{ id: 'gama', text: 'Coax Old Gama back to his choir', talk: 'npc:old-gama', marker: { landmark: 'landmark:frog-pond' } }],
        next: 'natsu',
      },
      {
        id: 'natsu', journal: 'The Shallows are loud again, gloriously, horribly loud.',
        objectives: [{ id: 'natsu', text: 'Tell Natsu the choir is back', talk: 'npc:natsu', marker: { landmark: 'landmark:natsu-landing' } }],
        next: 'concert',
      },
      {
        id: 'concert', journal: 'Natsu says the choir gives its first concert in a month tonight, at the Moon Pool, and that you will not believe who comes to listen.',
        objectives: [{ id: 'concert', text: 'Go to the frog choir’s concert at the Moon Pool, at night', when: { flag: 'samurai.frog_concert' }, marker: { landmark: 'landmark:samurai-moon-pool' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40, hcItems: [{ item: 'i_fish', qty: 2 }] },
  },

  // ======================= ACT I: mentor thread (2) and bounties (2)
  {
    ...A1, id: 'quest:samurai-the-eleven-words', name: 'The Eleven Words', type: 'side', region: Z2, giver: HK,
    summary: 'Before the Bell, Sensei Kanemori spoke eleven words this year, one at a time, each to a different novice. Each novice wrote their word down. You would like to know what they were.',
    requires: req({ trust: HK, value: 'friendly' }, done('quest:samurai-tea-before-steel')), firstStage: 'slips',
    stages: [
      {
        id: 'slips', journal: 'The novices left their word-slips pinned up round the Terraces when they went down to the Camps.',
        objectives: [{ id: 'slips', text: 'Find the novices’ word-slips', interact: 'obj:word-slip-*', count: 3, marker: { place: Z2 } }],
        next: 'kenta',
      },
      {
        id: 'kenta', journal: 'Nine words found. Kenta, who never left, has the other two in his sleeve.',
        objectives: [{ id: 'kenta', text: 'Ask Kenta for the last two words', talk: 'npc:kenta', marker: { place: Z2 } }],
        next: 'kanemori',
      },
      {
        id: 'kanemori', journal: 'Eleven words, in the order he spoke them. They make one sentence.',
        objectives: [{ id: 'kanemori', text: 'Read the sentence to Kanemori', talk: HK, marker: { landmark: 'landmark:kanemori-cell' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, skillPoints: 1, lore: ['lore:hc-eleven-words'] },
  },
  {
    ...A1, id: 'quest:samurai-the-word-he-saved', name: 'The Word He Saved', type: 'side', region: L3, giver: HK,
    summary: 'For thirty years Sensei Kanemori has kept one word unspoken. He has asked you, by gesture, to take him up to the High Terrace bell before dawn so that he can say it.',
    requires: req({ trust: HK, value: 'trusted' }, done('quest:samurai-the-high-terrace')), firstStage: 'bell',
    stages: [
      {
        id: 'bell', journal: 'Sit with Kanemori by the High Terrace bell through the night, and wait for the first light.',
        objectives: [{ id: 'bell', text: 'Keep watch at the High Terrace bell, at night', when: { flag: 'samurai.word_spoken' }, marker: { place: Z2 } }],
        next: 'kanemori',
      },
      {
        id: 'kanemori', journal: 'At first light, he said it. It was a name.',
        objectives: [{ id: 'kanemori', text: 'Walk Kanemori back down', talk: HK, marker: { landmark: 'landmark:kanemori-cell' } }],
        onComplete: [{ setFlag: 'samurai.kanemori_devotable', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:samurai-bounty-mist-dancers', name: 'Bounty: the Mist Dancers', type: 'bounty', region: Z4, giver: 'npc:tetsuo-ban',
    summary: 'Blade Dancers are spinning out of the mist in the Bamboo Shallows and cutting the punt-ropes.',
    requires: req(done('quest:samurai-the-ronin-fort')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'Listen for the bamboo falling. That is where they are.', objectives: [{ id: 'dancers', text: 'Defeat the Mist Dancers', kill: 'bx_blade_1', count: 6, marker: { place: Z4 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 150 },
  },
  {
    ...A1, id: 'quest:samurai-bounty-pilgrim-revenant', name: 'Bounty: the Pilgrim Revenant', type: 'bounty', region: Z1, giver: 'npc:tetsuo-ban',
    summary: 'A Duelist Revenant stands on the Temple Road and challenges every pilgrim who passes. Out loud.',
    requires: req(done('quest:samurai-the-bell-in-the-pines')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'You will hear it before you see it. Everyone does.', objectives: [{ id: 'revenant', text: 'Silence the Pilgrim Revenant', kill: 'bx_blade_0', count: 1, marker: { place: Z1 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 120 },
  },

  // ======================= ACT II: the class thread (C-1 … C-6) + featured bearers
  {
    ...A2, id: 'quest:samurai-the-quiet-pew', name: 'The Quiet Pew', type: 'class', region: 'vil:brind', giver: 'npc:hisako',
    summary: 'In a corner of the Chapel of the Drowned Bell, a handful of Hushpine pilgrims have kept silence for thirty years. Brother Aldous lets them. Nobody knows why they stay.',
    requires: req(done('quest:cc-through-the-arch')), autoStart: true, firstStage: 'pew',
    stages: [
      {
        id: 'pew', journal: 'The Hushpine pilgrims sit in the back pew of the Chapel in Brindlecross, very still.',
        objectives: [{ id: 'hisako', text: 'Sit with the Hushpine pilgrims in the Chapel', talk: 'npc:hisako', marker: { landmark: 'landmark:brind-chapel' } }],
        next: 'floor',
      },
      {
        id: 'floor', journal: 'Pilgrim-Mother Hisako has pointed, very gently, at the floor under the pew.',
        objectives: [{ id: 'floor', text: 'Listen at the floor of the quiet pew', interact: 'obj:samurai-quiet-pew', marker: { landmark: 'landmark:brind-chapel' } }],
        next: 'strips',
      },
      {
        id: 'strips', journal: 'Before you go down, Hisako leads you to the back rail of the Chapel, where the pilgrims have tied something every night for thirty years.',
        objectives: [{ id: 'strips', text: 'Look at the pilgrims’ strips on the Chapel rail', interact: 'obj:samurai-pilgrim-strips', marker: { landmark: 'landmark:brind-chapel' } }],
        onComplete: [{ startQuest: 'quest:samurai-the-silent-muster' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-samurai-quiet-pew'] },
  },
  {
    ...A2, id: 'quest:samurai-the-silent-muster', name: 'The Silent Muster', type: 'class', region: 'region:alder', giver: 'npc:hisako',
    summary: 'Under the Chapel, under the churchyard, Varric’s dead muster drills in silence. The pilgrims have been sitting over it for thirty years without knowing why.',
    requires: req(done('quest:samurai-the-quiet-pew')), firstStage: 'barrow',
    stages: [
      {
        id: 'barrow', journal: 'Down through the empty graves of the churchyard, into Varric’s barrow.',
        objectives: [{ id: 'barrow', text: 'Go down into Varric’s barrow', reach: 'inst:varric-barrow', marker: { landmark: 'landmark:brind-graveyard' } }],
        onComplete: [{ openDialogue: 'dialogue:samurai-silent-muster' }],
        next: 'ranks',
      },
      {
        id: 'ranks', journal: 'The dead muster lets you walk among its ranks as long as you make no sound.',
        objectives: [{ id: 'ranks', text: 'Walk through the silent muster', interact: 'obj:samurai-muster-rank-*', count: 3, marker: { landmark: 'landmark:brind-graveyard' } }],
        onComplete: [{ startQuest: 'quest:samurai-bonelord-varric' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-varric'] },
  },
  {
    ...A2, id: 'quest:samurai-bonelord-varric', name: 'Bonelord Varric', type: 'class', region: 'region:alder', giver: 'npc:hisako',
    summary: 'Whom did Varric’s sword serve? The Concord. And when the Concord stopped coming, he went on serving it anyway, in the dark, for thirty years.',
    requires: req(done('quest:samurai-the-silent-muster')), firstStage: 'fight',
    stages: [
      {
        id: 'fight', journal: 'Varric is the Sentinel of the Blade school. Win its mark.',
        objectives: [{ id: 'varric', text: 'Face Bonelord Varric', kill: 'bx_varric', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-blade' }],
        next: 'release',
      },
      {
        id: 'release', journal: 'Varric has gone down on one knee and laid his sword across it.',
        objectives: [{ id: 'mark', text: 'Hear Varric out', when: { flag: 'story.sentinel.blade' } }],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'The marching under the Chapel has stopped. The pilgrims in the quiet pew have sat over it for thirty years. They should know why it stopped.',
        objectives: [{ id: 'hisako', text: 'Tell Pilgrim-Mother Hisako the muster has stood down', talk: 'npc:hisako', marker: { landmark: 'landmark:brind-chapel' } }],
        onComplete: [{ startQuest: 'quest:samurai-the-ronin-under-the-wood' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-varric'] },
  },
  {
    ...A2, id: 'quest:samurai-the-ronin-under-the-wood', name: 'The Ronin Under the Wood', type: 'class', region: 'region:gloam', giver: 'npc:hisako',
    summary: 'Ikeda is under the Gloamwood, cutting the Spinner Below’s threads one by one, to free the Concord’s records from the weave. “No record,” he says, “no masters.”',
    requires: req(done('quest:samurai-bonelord-varric')), firstStage: 'threads',
    stages: [
      {
        id: 'threads', journal: 'Cut threads hang from the roots of the Gloamwood, each one a strand of the Concord’s memory, cut clean.',
        objectives: [{ id: 'threads', text: 'Follow Ikeda’s cut threads under the Gloamwood', interact: 'obj:samurai-cut-thread-*', count: 3, marker: { region: 'region:gloam' } }],
        next: 'ikeda',
      },
      {
        id: 'ikeda', journal: 'The cut threads end at the mouth of the root-caves. Somebody is standing there with a bare sword, cutting.',
        objectives: [{ id: 'ikeda', text: 'Face Ikeda at the mouth of the root-caves', talk: 'npc:ikeda-shun', marker: { landmark: 'landmark:samurai-root-mouth' } }],
        onComplete: [{ setFlag: 'samurai.threads_followed', value: true }, { startQuest: 'quest:samurai-the-spinner-below' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:samurai-the-spinner-below', name: 'The Spinner Below', type: 'class', region: 'region:gloam', giver: 'npc:hisako',
    summary: 'The Spinner Below wove the Concord’s records into the dark under the Gloamwood. Ikeda has cut it loose from half of them, and it is in a fury of unweaving.',
    requires: req(done('quest:samurai-the-ronin-under-the-wood')), firstStage: 'caves',
    stages: [
      {
        id: 'caves', journal: 'Down into the root-caves, where the Spinner hangs in what is left of its web.',
        objectives: [{ id: 'lair', text: 'Go down into the root-caves', reach: 'inst:sentinel-umbral', marker: { region: 'region:gloam' } }],
        next: 'spinner',
      },
      {
        id: 'spinner', journal: 'The Spinner is the Sentinel of the Umbral school. The Umbral bearers cannot win their mark while it unweaves itself.',
        objectives: [{ id: 'spinner', text: 'Defeat the Spinner Below', kill: 'bx_spinner', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-umbral' }, { setFlag: 'story.bearer.duskweaver', value: true }],
        next: 'record',
      },
      {
        id: 'record', journal: 'One thread in the ruined web is still humming. Ikeda never reached it.',
        objectives: [{ id: 'record', text: 'Listen to the last uncut thread', interact: 'obj:samurai-spinner-record' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-samurai-threads'] },
  },
  {
    ...A2, id: 'quest:samurai-kanemoris-word', name: 'Kanemori’s Word', type: 'class', region: 'vil:brind', giver: HK,
    summary: 'A pilgrim has come through the Blade arch with a letter from Hushpine. She has been asked to deliver it in silence, and she is finding it very difficult.',
    requires: req(done('quest:samurai-the-spinner-below')), autoStart: true, firstStage: 'letter',
    stages: [
      {
        id: 'letter', journal: 'Goodwife Hettie Natter is at the Gate Circle, holding a letter, with both hands clamped over her own mouth.',
        objectives: [{ id: 'hettie', text: 'Meet Hettie Natter at the Gate Circle', talk: 'npc:hettie-natter-concordia', marker: { landmark: 'landmark:gate-circle' } }],
        next: 'escort',
      },
      {
        id: 'escort', journal: 'Hettie has crossed half the world in silence, and now she wants to sit with her own people in the quiet pew. The moor has wolves on it, and Hettie has never once been quiet near a wolf.',
        onEnter: [{ escort: 'npc:hettie-natter-concordia', to: 'landmark:brind-chapel' }],
        objectives: [{ id: 'hettie', text: 'Bring Hettie Natter safely to the Chapel', when: { any: [{ flag: 'escort.hettie-natter-concordia', op: '==', value: 'arrived' }, { flag: 'escort.hettie-natter-concordia', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:brind-chapel' } }],
        next: [{ when: { flag: 'escort.hettie-natter-concordia', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'court' }],
      },
      {
        id: 'regroup', journal: 'Hettie went down in the heather, and a carter brought her back to the Gate Circle in his barrow, still talking. She would like to try again, more quietly.',
        onEnter: [{ escort: 'npc:hettie-natter-concordia', to: 'landmark:brind-chapel' }],
        objectives: [{ id: 'hettie', text: 'Try again: bring Hettie to the Chapel', when: { any: [{ flag: 'escort.hettie-natter-concordia', op: '==', value: 'arrived' }, { flag: 'escort.hettie-natter-concordia', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:brind-chapel' } }],
        next: [{ when: { flag: 'escort.hettie-natter-concordia', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'court' }],
      },
      {
        id: 'court', journal: 'Your half-stone has been tugging towards the Stone Court all day, towards the Hall half and the one who carries it.',
        objectives: [{ id: 'court', text: 'Sit with the Swordsman bearer at the Stone Court', interact: 'obj:blade-court-bench', marker: { landmark: 'landmark:stone-court' } }],
        next: 'reply',
      },
      {
        id: 'reply', journal: 'A Hushpine prayer-strip hangs on the Blade arch, thirty years faded. The next pilgrim through should find a new one.',
        objectives: [{ id: 'reply', text: 'Tie a strip for home on the Blade arch', interact: 'obj:samurai-reply-strip', marker: { landmark: 'landmark:gate-circle' } }],
        onComplete: [{ setFlag: 'story.act2_ready', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:samurai-the-oath-unbroken', name: 'The Oath Unbroken', type: 'side', region: 'region:alder', giver: 'npc:bearer-oathbound',
    summary: 'The Oathbound bearer has sworn to destroy Bonelord Varric, and has carved the oath in a stone at the barrow-mouth. The oath says nothing at all about whom it serves.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'stone',
    stages: [
      {
        id: 'stone', journal: 'Ser Aldric Vow is kneeling at a stone in the churchyard, at the barrow-mouth, reading his oath aloud to it.',
        objectives: [{ id: 'stone', text: 'Kneel with the Oathbound bearer at the oath-stone', interact: 'obj:samurai-oath-stone', marker: { landmark: 'landmark:brind-graveyard' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'The oath has a new line on it. Aldric wants a word at the Stone Court.',
        // co-op: if a party member plays the Oathbound, they ARE this bearer (the NPC is hidden)
        objectives: [{ id: 'aldric', text: 'Talk to the Oathbound bearer', when: { any: [{ flag: 'samurai.aldric_thanked' }, { partyHasClass: 'oathbound' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.oathbound', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A2, id: 'quest:samurai-the-shadow-on-the-thread', name: 'The Shadow on the Thread', type: 'side', region: 'region:gloam', giver: 'npc:bearer-shade',
    summary: 'The Shade bearer has no shadow. You have no words. Between you, you might be quiet enough to cross what is left of the Spinner’s web.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'web',
    stages: [
      {
        id: 'web', journal: 'Vesper is waiting at the edge of the web under the Gloamwood, where every thread hums at the faintest sound or shadow.',
        objectives: [{ id: 'web', text: 'Cross the Spinner’s web with the Shade bearer', interact: 'obj:samurai-web-crossing-*', count: 3, marker: { region: 'region:gloam' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'You crossed without a word or a shadow between you. Vesper wants a word, for once.',
        objectives: [{ id: 'vesper', text: 'Talk to the Shade bearer', when: { any: [{ flag: 'samurai.vesper_thanked' }, { partyHasClass: 'shade' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.shade', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  // ======================= ACT III: class quests (III-4 + 3 side)
  {
    ...A3, id: 'quest:samurai-the-chimeras-blade', name: 'The Chimera’s Blade', type: 'class', region: 'region:heart', giver: 'npc:casimir',
    summary: 'At the top of the Twelve Stairs the Union Chimera waits, and its sword-arm is a bare blade with a man still holding it. Ikeda Shun has found a master at last.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'herald',
    stages: [
      { id: 'herald', journal: 'Ikeda has been bound into the Union Chimera as its blade: a sword that serves no one, in the hand of something that serves the Hollow King.', objectives: [{ id: 'herald', text: 'Face the Chimera’s Blade', kill: 'cb_chimeras-blade', count: 1, marker: { landmark: 'landmark:twelve-stairs-top' } }], onComplete: [{ openDialogue: 'dialogue:samurai-herald-fate' }], next: 'fate' },
      { id: 'fate', journal: 'The Chimera is down on the stair. Ikeda kneels in what is left of its grip, and his hand has still not left the hilt.', objectives: [{ id: 'fate', text: 'Decide Ikeda’s fate', when: { flag: 'samurai.nemesis_fate' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 3 },
  },
  {
    ...A3, id: 'quest:samurai-say-it-for-me', name: 'Say It for Me', type: 'side', region: 'region:heart', giver: HK,
    summary: 'For thirty years Kanemori has kept one word unspoken. Someone has come all the way from the Temple Road to the Heart to ask you to say it for him.',
    requires: req(done('quest:samurai-the-chimeras-blade')), autoStart: true, firstStage: 'hettie',
    stages: [
      { id: 'hettie', journal: 'Hettie Natter is at the Heart camp, in her pilgrim’s hat, with a message from Hushpine.', objectives: [{ id: 'hettie', text: 'Talk to Hettie Natter at the Heart camp', talk: 'npc:hettie-natter-concordia', marker: { landmark: 'landmark:heart-camp' } }], next: 'voice' },
      { id: 'voice', journal: 'A year on the Temple Road without a word. Try the name at the foot of the Stairs first, quietly, to see if it will come.', objectives: [{ id: 'voice', text: 'Try the word at the foot of the Twelve Stairs', interact: 'obj:samurai-voice-step', marker: { landmark: 'landmark:twelve-stairs' } }], next: 'say' },
      { id: 'say', journal: 'A name, said aloud, at the top of the Twelve Stairs, where the man who owns it can hear.', objectives: [{ id: 'say', text: 'Say Kanemori’s word at the top of the stairs', interact: 'obj:samurai-shun-step', marker: { landmark: 'landmark:twelve-stairs-top' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:samurai-the-masterless', name: 'The Masterless', type: 'side', region: 'region:heart', giver: HK,
    summary: 'Ikeda’s hollow ronin followed him through the Edge Gate and into the Heart. Now they stand in the Legion camp with their swords drawn, and nobody left to serve.',
    requires: req(done('quest:heart-legion')), autoStart: true, firstStage: 'watch',
    stages: [
      { id: 'watch', journal: 'Ikeda’s ronin stand in a corner of the Legion camp, swords drawn, pointing at nothing.', objectives: [{ id: 'watch', text: 'Find Ikeda’s ronin in the Legion camp', interact: 'obj:samurai-masterless', marker: { landmark: 'landmark:legion-camp' } }], next: 'cages' },
      { id: 'cages', journal: 'They will not take an order. They never wanted a master; they wanted something to stand in front of. Across the camp, nobody is standing in front of the cages.', objectives: [{ id: 'cages', text: 'Look at the cages of the hollowed', interact: 'obj:samurai-legion-cages', marker: { landmark: 'landmark:legion-camp' } }], next: 'ronin' },
      { id: 'ronin', journal: 'The ronin are still pointing at nothing. Show them what needs protecting.', objectives: [{ id: 'ronin', text: 'Give the masterless ronin something to protect', interact: 'obj:samurai-masterless', marker: { landmark: 'landmark:legion-camp' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A3, id: 'quest:samurai-kentas-letter', name: 'Kenta’s Letter', type: 'side', region: 'region:heart', giver: 'npc:kenta',
    summary: 'A letter has come all the way from the fifth dojo yard to the edge of the Heart. It is badly spelt, and it asks one question.',
    requires: req(done('quest:heart-wall'), done('quest:samurai-the-novice-who-stayed')), autoStart: true, firstStage: 'letter',
    stages: [
      { id: 'letter', journal: 'Hettie Natter has come into the Heart camp with the bearers’ stragglers, carrying letters.', objectives: [{ id: 'hettie', text: 'Talk to Hettie Natter at the Heart camp', talk: 'npc:hettie-natter-concordia', marker: { landmark: 'landmark:heart-camp' } }], next: 'sweep' },
      { id: 'sweep', journal: 'A Hushpine novice sweeps the yard before a lesson. Kenta sweeps yours now. Sweep the practice ground at the Heart camp first.', objectives: [{ id: 'sweep', text: 'Sweep the practice ground by the camp’s hitching post', interact: 'obj:samurai-heart-sweep', marker: { landmark: 'landmark:heart-camp' } }], next: 'answer' },
      { id: 'answer', journal: 'Kenta wants to know how to breathe for the draw. The answer is not something you can write down. Show it, then write it down anyway.', objectives: [{ id: 'post', text: 'Answer Kenta at the practice post in the Heart camp', interact: 'obj:samurai-heart-post', marker: { landmark: 'landmark:heart-camp' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
];

export default quests;
