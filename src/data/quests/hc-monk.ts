/**
 * Hollow Crown: the MONK campaign (docs/lore/hollow-crown/06-outlines/fist.md). Act I in Stonecloister
 * (area:fist-capital) and the Act II class thread in Concordia. Act III class quests land with the Heart.
 * Built on the Ash reference (10-campaign-style.md). Owner: Claude 4.
 */
import type { NarrativeCondition, QuestDef } from '@/core';

const MK: NarrativeCondition = { heroClass: 'monk' };
const done = (q: `quest:${string}`): NarrativeCondition => ({ questCompleted: q });
const req = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: [MK, ...c] });
const A1 = { act: 'act1' as const, campaign: 'monk', chapter: 'Stonecloister' };
const A2 = { act: 'act2' as const, campaign: 'monk', chapter: 'Concordia' };
const A3 = { act: 'act3' as const, campaign: 'monk', chapter: 'The Heart' };
const Z1 = 'zone:fist-capital-1' as const, Z2 = 'zone:fist-capital-2' as const, Z3 = 'zone:fist-capital-3' as const, Z4 = 'zone:fist-capital-4' as const;
const L1 = 'inst:fist-capital-lair-1' as const, L2 = 'inst:fist-capital-lair-2' as const, L3 = 'inst:fist-capital-lair-3' as const;
const ST = 'npc:shirin-tal' as const, KS = 'npc:kestrel' as const;

const quests: QuestDef[] = [
  // ======================= ACT I: main (I-1 … I-10)
  {
    ...A1, id: 'quest:monk-the-bell-on-the-stair', name: 'The Bell on the Stair', type: 'main', region: Z1, giver: ST,
    summary: 'The night-sweep of the Thousand Stairs, step six hundred and eleven. Then a bell rang far away, and the great bell of the Bell Courts answered it with nobody on the rope.',
    requires: MK, autoStart: true, firstStage: 'stair',
    stages: [
      {
        id: 'stair', journal: 'Something is singing from straight up the mountain. The Abbess is on landing six hundred, with the night porter. Go down and tell her.',
        onEnter: [{ openDialogue: 'dialogue:monk-bell-night' }],
        objectives: [{ id: 'landing', text: 'Go down to landing six hundred', reach: 'landmark:landing-600-tea-stall', marker: { landmark: 'landmark:landing-600-tea-stall' } }],
        next: 'shirin',
      },
      {
        id: 'shirin', journal: 'Abbess Shirin Tal is playing stones with the night porter by lantern-light, and winning, which is suspicious.',
        objectives: [{ id: 'shirin', text: 'Speak to the Abbess on landing six hundred', talk: ST, marker: { landmark: 'landmark:landing-600-tea-stall' } }],
        onComplete: [{ setFlag: 'monk.bell_heard', value: true }],
        next: 'climb',
      },
      {
        id: 'climb', journal: 'Shirin wants to see the bell that rang itself, tonight, before anybody else can tell her what it means. She has set off up the Stairs to the Bell Courts with her lantern, faster than her knees should allow.',
        objectives: [{ id: 'bell', text: 'Climb with the Abbess to the great bell in the Bell Courts', reach: 'landmark:great-bell', marker: { landmark: 'landmark:great-bell' } }],
        next: 'bell',
      },
      {
        id: 'bell', journal: 'The Bell Courts at midnight, empty, and the great bell still humming on its beam. Shirin has put her lantern down and her hand on the bronze.',
        objectives: [{ id: 'shirin', text: 'Stand under the great bell with the Abbess', talk: ST, marker: { landmark: 'landmark:great-bell' } }],
        onComplete: [{ startQuest: 'quest:monk-tea-on-every-landing' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-mountainreach', 'lore:hc-thousand-stairs'] },
  },
  {
    ...A1, id: 'quest:monk-tea-on-every-landing', name: 'Tea on Every Landing', type: 'main', region: Z1, giver: ST,
    summary: 'Novices have always carried the Abbess’s tea-urn up the Thousand Stairs and poured a cup on every landing. Shirin sees no reason the end of the world should change that.',
    requires: req(done('quest:monk-the-bell-on-the-stair')), firstStage: 'cups',
    stages: [
      {
        id: 'cups', journal: 'One cup on every landing for whoever keeps the tea stall there. Half the stalls are shuttered. Their keepers have gone up to the Mountain King.',
        objectives: [{ id: 'cups', text: 'Pour a cup of tea on each landing', interact: 'obj:landing-cup-*', count: 6, marker: { place: Z1 } }],
        next: 'monks',
      },
      {
        id: 'monks', journal: 'Black tears are trickling down the steps like slow rain. The Rogue Monks coming down to meet you wear the cloister’s own grey.',
        objectives: [{ id: 'monks', text: 'Turn back the Rogue Monks on the Stairs', kill: 'bx_fist_0', count: 3, marker: { place: Z1 } }],
        next: 'trickle',
      },
      {
        id: 'trickle', journal: 'The black on the steps is coming down from somewhere above. Follow it up a few landings before you go to the Abbess.',
        objectives: [{ id: 'trickle', text: 'Follow the black trickle up the Stairs', interact: 'obj:monk-tear-trail-*', count: 3, marker: { place: Z1 } }],
        next: 'shirin',
      },
      {
        id: 'shirin', journal: 'The urn is empty. You know two of the Rogue Monks by name.',
        objectives: [{ id: 'shirin', text: 'Bring the empty urn to the Abbess’s rooms', talk: ST, marker: { landmark: 'landmark:abbess-rooms' } }],
        onComplete: [{ startQuest: 'quest:monk-the-guardian-hall' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:monk-the-guardian-hall', name: 'The Guardian Hall', type: 'main', region: Z2, giver: ST,
    summary: 'For nine hundred years the Temple Guardian has let no unworthy soul up the mountain. Now it lets nobody up and everybody down, towards the King.',
    requires: req(done('quest:monk-tea-on-every-landing')), firstStage: 'gate',
    stages: [
      {
        id: 'gate', journal: 'Novices bound for the Bell Courts are being turned back at the Guardian Hall, weeping.',
        objectives: [{ id: 'enter', text: 'Enter the Guardian Hall', reach: L1, marker: { landmark: 'landmark:guardian-hall-gate' } }],
        onComplete: [{ openDialogue: 'dialogue:monk-guardian-sees' }],
        next: 'guardian',
      },
      {
        id: 'guardian', journal: 'It attacks only what moves. Cross its hall in the stillness stance between its sweeps, then strike its heart-stone from behind.',
        objectives: [{ id: 'guardian', text: 'Pass the Temple Guardian', kill: 'bx_fist_4', count: 1 }],
        next: 'novices',
      },
      {
        id: 'novices', journal: 'The Guardian is still. A huddle of novices is waiting at the far door, too frightened to go through it.',
        objectives: [{ id: 'novices', text: 'Lead the novices through the Guardian Hall', interact: 'obj:guardian-hall-novices' }],
        onComplete: [{ setFlag: 'monk.guardian_passed', value: true }, { startQuest: 'quest:monk-kestrel-comes-down' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 80, hcItems: [{ item: 'a_fist_robe_feet' }], lore: ['lore:hc-high-monastery'] },
  },
  {
    ...A1, id: 'quest:monk-kestrel-comes-down', name: 'Kestrel Comes Down', type: 'main', region: Z2, giver: KS,
    summary: 'Brother Kestrel has walked back onto the Prayer Terraces in the Mountain King’s grey, with a present for every novice and a goat on a lead.',
    requires: req(done('quest:monk-the-guardian-hall')), firstStage: 'kestrel',
    stages: [
      {
        id: 'kestrel', journal: 'Your foster-brother, who left the cloister for the King three years ago, is handing out sweets on the Prayer Terraces. The goat is eating the prayer flags.',
        objectives: [{ id: 'kestrel', text: 'Meet Kestrel on the Prayer Terraces', talk: KS, marker: { landmark: 'landmark:terrace-goat-pens' } }],
        next: 'foundling',
      },
      {
        id: 'foundling', journal: 'Kestrel has handed the goat to a novice and gone down to the Foundling Stair, where Shirin found you both in one basket. He wants you to come.',
        objectives: [{ id: 'stair', text: 'Follow Kestrel to the Foundling Stair', reach: 'landmark:monk-foundling-stair', marker: { landmark: 'landmark:monk-foundling-stair' } }],
        next: 'basket',
      },
      {
        id: 'basket', journal: 'The Foundling Stair: a single broad step on the old pilgrim path, worn in the middle. Kestrel is sitting on it with his knees up, the way he used to.',
        objectives: [{ id: 'kestrel', text: 'Sit with Kestrel on the Foundling Stair', talk: KS, marker: { landmark: 'landmark:monk-foundling-stair' } }],
        next: 'shirin',
      },
      {
        id: 'shirin', journal: 'He is funnier than he used to be, and much sadder. Shirin raised you both.',
        objectives: [{ id: 'shirin', text: 'Tell the Abbess that Kestrel is home', talk: ST, marker: { landmark: 'landmark:abbess-rooms' } }],
        onComplete: [{ setFlag: 'monk.kestrel_home', value: true }, { startQuest: 'quest:monk-the-empty-cells' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-kings-climbers'] },
  },
  {
    ...A1, id: 'quest:monk-the-empty-cells', name: 'The Empty Cells', type: 'main', region: Z3, giver: ST,
    summary: 'Kestrel and the King’s Climbers stand on one side of the Bell Courts and the Abbess on the other, and the cloister is about to vote with its feet.',
    requires: req(done('quest:monk-kestrel-comes-down')), firstStage: 'canvass',
    stages: [
      {
        id: 'canvass', journal: 'Before the cloister votes with its feet, hear the two who have carried it longest: Sister Agnetha, who has rung its bell for forty years, and Bodhan Kreel, who carried Doran Kell’s pack.',
        objectives: [
          { id: 'agnetha', text: 'Ask Sister Agnetha what the cloister is for', talk: 'npc:agnetha-hume', marker: { landmark: 'landmark:great-bell' } },
          { id: 'bodhan', text: 'Ask Bodhan Kreel what the Climbers are for', talk: 'npc:bodhan-kreel', marker: { landmark: 'landmark:climbers-rice-store' } },
        ],
        next: 'vote',
      },
      {
        id: 'vote', journal: 'The whole cloister is in the Bell Courts under the great bell. Half the cells behind them are already empty.',
        objectives: [{ id: 'vote', text: 'Stand in the Bell Courts', when: { flag: 'monk.cells' }, marker: { landmark: 'landmark:great-bell' } }],
        next: 'dusk',
      },
      {
        id: 'dusk', journal: 'By dusk the cloister will know what it has chosen. Agnetha rings the bell at dusk as well as dawn. Be in the Bell Courts to hear it.',
        objectives: [{ id: 'dusk', text: 'Stand in the Bell Courts at dusk', interact: 'obj:monk-cells-dusk', marker: { landmark: 'landmark:great-bell' } }],
        onComplete: [{ startQuest: 'quest:monk-the-ninefold-abbot' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A1, id: 'quest:monk-the-ninefold-abbot', name: 'The Ninefold Abbot', type: 'main', region: Z3, giver: ST,
    summary: 'Whatever the cloister chose, only the Ninefold Abbot can open the way to the summit, and he has been meditating in the Silent Cell since C. 1012.',
    requires: req(done('quest:monk-the-empty-cells')), firstStage: 'why',
    stages: [
      {
        id: 'why', journal: 'The cloister has chosen.', objectives: [],
        next: [
          { when: { flag: 'monk.cells', value: 'climb' }, to: 'climb' },
          { when: { flag: 'monk.cells', value: 'turned' }, to: 'turned' },
          { to: 'stay' },
        ],
      },
      {
        id: 'stay', journal: 'The cloister barred its gate to the Climbers. Now somebody has to take the summit road before Kestrel does, and the summit road starts in the Silent Cell.',
        objectives: [{ id: 'door', text: 'Go to the Silent Cell', reach: 'landmark:silent-cell-door', marker: { landmark: 'landmark:silent-cell-door' } }],
        next: 'cell',
      },
      {
        id: 'climb', journal: 'You wear the King’s grey now. The Climbers need the old Abbot’s blessing to open the summit road, and he is in the Silent Cell.',
        objectives: [{ id: 'door', text: 'Go to the Silent Cell', reach: 'landmark:silent-cell-door', marker: { landmark: 'landmark:silent-cell-door' } }],
        next: 'cell',
      },
      {
        id: 'turned', journal: 'The Bell Courts know what Doran Kell did on the road. Somebody has to carry it up to the summit, and the summit road starts in the Silent Cell.',
        objectives: [{ id: 'door', text: 'Go to the Silent Cell', reach: 'landmark:silent-cell-door', marker: { landmark: 'landmark:silent-cell-door' } }],
        next: 'cell',
      },
      {
        id: 'cell', journal: 'The Silent Cell has not been silent for thirty years. There are nine voices behind the door, and they are all arguing.',
        objectives: [{ id: 'enter', text: 'Enter the Silent Cell', reach: L2, marker: { landmark: 'landmark:silent-cell-door' } }],
        next: 'abbot',
      },
      {
        id: 'abbot', journal: 'Nine monks, each one temper of the same old man. Agree with one and it vanishes. The ninth is weeping black.',
        objectives: [{ id: 'abbot', text: 'Make the Ninefold Abbot whole', kill: 'cb_ninefold-abbot', count: 1 }],
        next: 'whole',
      },
      {
        id: 'whole', journal: 'Eight of them are gone. One small old man sits on the meditation cushion, crying, and he is the only one left.',
        objectives: [{ id: 'cushion', text: 'Sit with the Abbot', interact: 'obj:ninefold-cushion' }],
        onComplete: [{ setFlag: 'monk.abbot_whole', value: true }, { startQuest: 'quest:monk-what-is-owed' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 120, lore: ['lore:hc-ninefold-abbot'] },
  },
  {
    ...A1, id: 'quest:monk-what-is-owed', name: 'What Is Owed', type: 'main', region: Z4, giver: KS,
    summary: 'The summit road is open. Kestrel is waiting for you in the Cloud Kitchen, stirring rice for the King’s Climbers, and he says he wants to tell you the truth.',
    requires: req(done('quest:monk-the-ninefold-abbot')), firstStage: 'camp',
    stages: [
      {
        id: 'camp', journal: 'The summit road runs past the Climbers’ camp on the cloud-side, where Kestrel’s forty sleep. Walk through it on your way up to the Cloud Kitchen.',
        objectives: [{ id: 'camp', text: 'Walk through the Climbers’ camp', interact: 'obj:monk-climber-camp-*', count: 3, marker: { place: Z4 } }],
        next: 'kitchen',
      },
      {
        id: 'kitchen', journal: 'The Cloud Kitchen sits above the clouds, overrun with Stone Slimes and the smell of rice.',
        objectives: [{ id: 'kitchen', text: 'Climb to the Cloud Kitchen', reach: 'landmark:cloud-kitchen-hearth', marker: { landmark: 'landmark:cloud-kitchen-hearth' } }],
        next: 'kestrel',
      },
      {
        id: 'kestrel', journal: 'Kestrel is at the great hearth, stirring a pot big enough to bathe in.',
        objectives: [{ id: 'kestrel', text: 'Hear Kestrel out at the hearth', talk: KS, marker: { landmark: 'landmark:cloud-kitchen-hearth' } }],
        onComplete: [{ setFlag: 'monk.kestrel_turned', value: true }],
        next: 'abbess',
      },
      {
        id: 'abbess', journal: 'Kestrel has gone up to the summit. Before you follow him, the woman who found you both in one basket should hear it from you.',
        objectives: [{ id: 'shirin', text: 'Tell the Abbess what Kestrel means to do', talk: ST, marker: { landmark: 'landmark:abbess-rooms' } }],
        onComplete: [{ startQuest: 'quest:monk-the-summit-shrine' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-mountain-king'] },
  },
  {
    ...A1, id: 'quest:monk-the-summit-shrine', name: 'The Summit Shrine', type: 'main', region: L3, giver: ST,
    summary: 'The Summit half of the Fist stone lies in the shrine at the very top of the mountain, past the Mountain King’s empty throne. Kestrel has gone up ahead of you.',
    requires: req(done('quest:monk-what-is-owed')), firstStage: 'climb',
    stages: [
      {
        id: 'climb', journal: 'Above the clouds, past a throne carved out of the summit with nobody on it.',
        objectives: [{ id: 'enter', text: 'Climb to the Summit Shrine', reach: L3, marker: { landmark: 'landmark:mountain-king-throne' } }],
        next: 'kestrel',
      },
      {
        id: 'kestrel', journal: 'Kestrel knows every form you know, because he learned them first. He is faster. Counter from stillness, and do not strike first.',
        objectives: [{ id: 'kestrel', text: 'Face Brother Kestrel', kill: 'cb_kestrel', count: 1 }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'Kestrel stepped backwards off the summit into the clouds. The Summit half is singing in its niche.',
        objectives: [{ id: 'stone', text: 'Take the Summit half', interact: 'obj:fist-capital-halfstone' }],
        onComplete: [{ setFlag: 'monk.halfstone', value: true }, { startQuest: 'quest:monk-the-long-descent' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, skillPoints: 1, lore: ['lore:hc-half-stones'] },
  },
  {
    ...A1, id: 'quest:monk-the-long-descent', name: 'The Long Descent', type: 'main', region: Z1, giver: ST,
    summary: 'Kestrel has gone down the cloud-side towards the Stair Gate. You have the Summit half. The Abbess has put on her travelling sandals for the first time in thirty years.',
    requires: req(done('quest:monk-the-summit-shrine')), firstStage: 'farewell',
    stages: [
      {
        id: 'farewell', journal: 'Shirin is waiting at the foot of the Thousand Stairs, where the Stair Gate road begins. She is going to walk you down.',
        objectives: [{ id: 'shirin', text: 'Walk down the gate road with the Abbess', talk: ST, marker: { landmark: 'landmark:thousand-stairs-foot' } }],
        onComplete: [{ setFlag: 'monk.shirin_farewell', value: true }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'Past the rock where Shirin sat down, the gate road bends round a plain grey boulder. Shirin called it out to you as you passed: the place on the C. 1012 road where Doran Kell stopped, and listened, and turned round.',
        objectives: [{ id: 'stone', text: 'Stop at the stone where Doran Kell turned back', interact: 'obj:monk-kell-stone', marker: { landmark: 'landmark:monk-kell-stone' } }],
        next: 'road',
      },
      {
        id: 'road', journal: 'The Stair Gate road runs down out of Mountainreach. On the last stair before the gate sits the Mountain King.',
        objectives: [{ id: 'gate', text: 'Go down to the Stair Gate', reach: 'area:fist-gate', marker: { place: 'area:fist-gate' } }],
        onComplete: [{ startQuest: 'quest:monk-the-stair-gate' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:monk-the-stair-gate', name: 'The Stair Gate', type: 'main', region: 'area:fist-gate', giver: ST,
    summary: 'Master Doran Kell, the Mountain King, has sat on the last stair before the Stair Gate since the night of the Bell. His beard is frozen into a black crown.',
    requires: req(done('quest:monk-the-long-descent')), firstStage: 'king',
    stages: [
      {
        id: 'king', journal: 'You cannot out-hit him. You have to out-still him. Stand fast as he charges, and let the stair break round you.',
        onEnter: [{ openDialogue: 'dialogue:monk-king-on-the-stair' }],
        objectives: [{ id: 'king', text: 'Out-still the Mountain King', kill: 'bx_fist_5', count: 1 }],
        next: 'gate',
      },
      {
        id: 'gate', journal: 'The black crown in his beard has melted. He has sat down on the step, and he is waiting for you to answer him.',
        objectives: [{ id: 'seal', text: 'Answer the Mountain King, and open the Stair Gate', interact: 'obj:fist-gate-seal' }],
        onComplete: [{ setFlag: 'story.gate_open', value: true }, { setFlag: 'story.act', value: 2 }, { setFlag: 'monk.act1_done', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 200, lore: ['lore:hc-realm-gates'] },
  },

  // ======================= ACT I: side quests (2 per zone)
  {
    ...A1, id: 'quest:monk-auntie-yuens-last-pot', name: 'Auntie Yuen’s Last Pot', type: 'side', region: Z1, giver: 'npc:auntie-yuen',
    summary: 'Auntie Yuen has kept the tea stall on landing four hundred for sixty years. Her customers have all gone up the mountain, and she will not close.',
    requires: req(done('quest:monk-tea-on-every-landing')), firstStage: 'customers',
    stages: [
      {
        id: 'customers', journal: 'Bring Auntie Yuen one customer from each of the landings above her. Anybody will do. She is not fussy. She is extremely fussy.',
        objectives: [{ id: 'customers', text: 'Bring a customer down from each landing', interact: 'obj:landing-customer-*', count: 3, marker: { landmark: 'landmark:yuen-tea-stall' } }],
        next: 'yuen',
      },
      {
        id: 'yuen', journal: 'Three customers, sitting on Auntie Yuen’s bench, waiting to be told off for something.',
        objectives: [{ id: 'yuen', text: 'Tell Auntie Yuen she has customers', talk: 'npc:auntie-yuen', marker: { landmark: 'landmark:yuen-tea-stall' } }],
        onComplete: [{ setFlag: 'monk.yuen_pot', value: true }],
        next: 'bush',
      },
      {
        id: 'bush', journal: 'If the pot is going anywhere, it needs fresh leaves from the bush Auntie Yuen’s mother planted at the very foot of the Thousand Stairs, sixty years ago. She cannot do the stairs down and back in a day any more.',
        objectives: [{ id: 'bush', text: 'Pick leaves from the old tea bush at the foot of the Stairs', interact: 'obj:monk-yuen-tea-bush', marker: { landmark: 'landmark:thousand-stairs-foot' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40, hcItems: [{ item: 'i_em_s', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:monk-misprayers', name: 'Misprayers', type: 'side', region: Z1, giver: 'npc:pema-lightfoot',
    summary: 'The wind tore the prayer flags, and the novices who re-stitched them got the prayers muddled. The Abbess reads them aloud at dusk.',
    requires: req(done('quest:monk-the-bell-on-the-stair')), firstStage: 'flags',
    stages: [
      {
        id: 'flags', journal: 'The torn originals blew off down the Stairs. Find them before dusk and Pema can copy them out properly.',
        objectives: [{ id: 'flags', text: 'Find the original prayer flags', interact: 'obj:prayer-flag-*', count: 3, marker: { landmark: 'landmark:prayer-flag-lines' } }],
        next: 'pema',
      },
      {
        id: 'pema', journal: 'Three torn flags. One has a boot-print on it, which may or may not be part of the prayer.',
        objectives: [{ id: 'pema', text: 'Bring the flags to Novice Pema', talk: 'npc:pema-lightfoot', marker: { landmark: 'landmark:prayer-flag-lines' } }],
        next: 'dusk',
      },
      {
        id: 'dusk', journal: 'At dusk the Abbess reads the prayer flags aloud from the Prayer Terraces, as she always has. Pema cannot bear to watch. Somebody should.',
        objectives: [{ id: 'reading', text: 'Hear the Abbess read the flags at dusk', interact: 'obj:monk-flag-reading', marker: { landmark: 'landmark:monk-prayer-pole' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 30 },
  },
  {
    ...A1, id: 'quest:monk-matins-ate-the-sutras', name: 'Matins Ate the Sutras', type: 'side', region: Z2, giver: 'npc:wyn-orchard',
    summary: 'A Mountain Goat called Matins has eaten the novices’ sutra scrolls and is now on the roof of the meditation hall, chewing.',
    requires: req(done('quest:monk-the-guardian-hall')), firstStage: 'roof',
    stages: [
      {
        id: 'roof', journal: 'Matins is on the meditation hall roof. Goats do not need to meditate, Brother Wyn says. Goats are already enlightened, and insufferable about it.',
        objectives: [{ id: 'roof', text: 'Chase Matins off the meditation hall roof', interact: 'obj:matins-roof', marker: { landmark: 'landmark:meditation-hall-roof' } }],
        next: 'shrine',
      },
      {
        id: 'shrine', journal: 'Matins ran up a goat path nobody uses, to a shrine nobody remembered.',
        objectives: [{ id: 'shrine', text: 'Follow Matins to the forgotten shrine', interact: 'obj:forgotten-goat-shrine', marker: { place: Z2 } }],
        next: 'wyn',
      },
      {
        id: 'wyn', journal: 'The sutras are mostly eaten. The shrine is not.',
        objectives: [{ id: 'wyn', text: 'Tell Brother Wyn what Matins found', talk: 'npc:wyn-orchard', marker: { landmark: 'landmark:terrace-goat-pens' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:monk-little-brother-sop', name: 'Little Brother Sop', type: 'side', region: Z2, giver: 'npc:little-brother-sop',
    summary: 'Little Brother Sop is eight and keeps falling asleep in the middle of his forms. The other novices say he is lazy. He is not lazy.',
    requires: req(done('quest:monk-the-guardian-hall')), firstStage: 'dream',
    stages: [
      {
        id: 'dream', journal: 'Sop talks in his sleep. Sit by his mat in the novice dormitory after dark and listen.',
        objectives: [{ id: 'dream', text: 'Listen to Sop sleeping, at night', when: { flag: 'monk.sop_dream' }, marker: { landmark: 'landmark:novice-dormitory' } }],
        next: 'sop',
      },
      {
        id: 'sop', journal: 'He was humming in his sleep. It was the same song you have been hearing since the Bell.',
        objectives: [{ id: 'sop', text: 'Talk to Sop about his dreams', talk: 'npc:little-brother-sop', marker: { landmark: 'landmark:novice-dormitory' } }],
        onComplete: [{ setFlag: 'monk.sop_helped', value: true }],
        next: 'step',
      },
      {
        id: 'step', journal: 'Sop has been sleepwalking. Every night he goes down the Stairs in his sleep and sits on the same step, and the night porter carries him back. The step is six hundred and eleven.',
        objectives: [{ id: 'step', text: 'Find out why Sop sleeps on step six hundred and eleven, at night', when: { flag: 'monk.sop_step' }, marker: { landmark: 'landmark:monk-step-611' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:monk-the-ringers-arms', name: 'The Ringer’s Arms', type: 'side', region: Z3, giver: 'npc:agnetha-hume',
    summary: 'Sister Agnetha Hume has rung the great bell every dawn for forty years, and her arms are going. She will not say so.',
    requires: req(done('quest:monk-kestrel-comes-down')), firstStage: 'ring',
    stages: [
      {
        id: 'ring', journal: 'The dawn bell is rung in the last dark before dawn. Get to the rope before Agnetha does.',
        objectives: [{ id: 'ring', text: 'Ring the great bell in the last dark before dawn', when: { flag: 'monk.bell_rung' }, marker: { landmark: 'landmark:great-bell' } }],
        next: 'agnetha',
      },
      {
        id: 'agnetha', journal: 'You rang it. Badly. The whole cloister knows it was not Agnetha.',
        objectives: [{ id: 'agnetha', text: 'Be told off by Sister Agnetha', talk: 'npc:agnetha-hume', marker: { landmark: 'landmark:great-bell' } }],
        next: 'rope',
      },
      {
        id: 'rope', journal: 'Agnetha’s bell-rope is forty years old and frayed to a thread at the grip. She has a new one, plaited by her own mother, in a chest in the ringers’ loft, and has never had the heart to hang it.',
        objectives: [{ id: 'rope', text: 'Fetch the new bell-rope from the ringers’ loft', interact: 'obj:monk-bell-rope', marker: { landmark: 'landmark:monk-ringers-loft' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50 },
  },
  {
    ...A1, id: 'quest:monk-half-the-cells', name: 'Half the Cells', type: 'side', region: Z3, giver: 'npc:rosamund-inch',
    summary: 'Sister Rosamund Inch keeps the cell-roll, and the cell-roll no longer adds up. She would like the empty cells counted, and the notes their leavers left read.',
    requires: req(done('quest:monk-kestrel-comes-down')), firstStage: 'count',
    stages: [
      {
        id: 'count', journal: 'Three cloisters of cells, half of them empty. Every leaver left a note on the sleeping-mat. That is the rule.',
        objectives: [{ id: 'cells', text: 'Count the empty cells and read the leavers’ notes', interact: 'obj:empty-cell-*', count: 3, marker: { landmark: 'landmark:empty-cells-cloister' } }],
        next: 'rosamund',
      },
      {
        id: 'rosamund', journal: 'The last cell was Kestrel’s, years ago. His note is addressed to you. It was never delivered.',
        objectives: [{ id: 'rosamund', text: 'Give Sister Rosamund the count', talk: 'npc:rosamund-inch', marker: { landmark: 'landmark:empty-cells-cloister' } }],
        next: 'reply',
      },
      {
        id: 'reply', journal: 'Rosamund says a note left on a mat is a note waiting for an answer. Kestrel’s old cell is at the end of the north cloister, still empty. You could leave one there.',
        objectives: [{ id: 'reply', text: 'Leave an answer in Kestrel’s old cell', interact: 'obj:monk-kestrel-cell', marker: { landmark: 'landmark:monk-kestrel-cell' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:monk-slime-stew', name: 'Slime Stew', type: 'side', region: Z4, giver: 'npc:halvard-pottage',
    summary: 'The Cloud Kitchen is overrun with Stone Slimes that have learned to sit very still in the soup pots. Cook-Brother Halvard Pottage can no longer tell which pots are soup.',
    requires: req(done('quest:monk-the-ninefold-abbot')), firstStage: 'pots',
    stages: [
      {
        id: 'pots', journal: 'Lift the lid of each pot. Soup steams. Slime glares.',
        objectives: [{ id: 'pots', text: 'Find out which pots are soup', interact: 'obj:kitchen-pot-*', count: 3, marker: { landmark: 'landmark:cloud-kitchen-hearth' } }],
        next: 'slimes',
      },
      {
        id: 'slimes', journal: 'Two pots were slime. The slime is now out of the pots and quite cross about it.',
        objectives: [{ id: 'slimes', text: 'Clear the Stone Slimes out of the kitchen', kill: 'bx_fist_2', count: 3 }],
        next: 'halvard',
      },
      {
        id: 'halvard', journal: 'The kitchen is slime-free, for the first time in a month.',
        objectives: [{ id: 'halvard', text: 'Tell Cook-Brother Halvard', talk: 'npc:halvard-pottage', marker: { landmark: 'landmark:cloud-kitchen-hearth' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_stew', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:monk-the-kings-rice', name: 'The King’s Rice', type: 'side', region: Z4, giver: 'npc:halvard-pottage',
    summary: 'The Climbers are taking the cloister’s rice up to the King, and the novices’ bowls are getting thinner. Halvard has three sacks left and opinions about all of them.',
    requires: req(done('quest:monk-the-ninefold-abbot')), firstStage: 'sacks',
    stages: [
      {
        id: 'sacks', journal: 'The last three rice sacks are in the store. The Climbers’ porter is waiting at the top of the summit road.',
        objectives: [{ id: 'sacks', text: 'Decide what to do with the last rice', interact: 'obj:rice-sacks', marker: { landmark: 'landmark:climbers-rice-store' } }],
        next: 'bodhan',
      },
      {
        id: 'bodhan', journal: 'The Climbers’ old porter, Bodhan Kreel, wants a word, whichever way you chose.',
        objectives: [{ id: 'bodhan', text: 'Talk to the porter Bodhan Kreel', talk: 'npc:bodhan-kreel', marker: { landmark: 'landmark:climbers-rice-store' } }],
        next: 'pot',
      },
      {
        id: 'pot', journal: 'Bodhan says the Climbers’ cook-pot on the cloud-side has been empty three days, and they are too proud to come down and ask. Half of them were novices a month ago.',
        objectives: [{ id: 'pot', text: 'Take a sack of rice to the Climbers’ cook-pot', interact: 'obj:monk-climbers-pot', marker: { landmark: 'landmark:monk-climber-camp' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 60 },
  },

  // ======================= ACT I: mentor thread (2) and bounties (2)
  {
    ...A1, id: 'quest:monk-stones-with-the-abbess', name: 'Stones with the Abbess', type: 'side', region: Z3, giver: ST,
    summary: 'Abbess Shirin Tal has never lost a game of stones. To win, you have to catch her cheating, and she cheats beautifully.',
    requires: req({ trust: ST, value: 'friendly' }, done('quest:monk-tea-on-every-landing')), firstStage: 'game',
    stages: [
      {
        id: 'game', journal: 'Catch her cheating three times in one game. Watch the board. Watch the sleeves. Watch the teapot.',
        objectives: [{ id: 'game', text: 'Beat the Abbess at stones', when: { flag: 'monk.stones_won' }, marker: { landmark: 'landmark:abbess-rooms' } }],
        next: 'shirin',
      },
      {
        id: 'shirin', journal: 'She conceded. She has never conceded. She says that deserves a true story.',
        objectives: [{ id: 'shirin', text: 'Hear the Abbess’s story', talk: ST, marker: { landmark: 'landmark:abbess-rooms' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, skillPoints: 1, lore: ['lore:hc-kell-turned-back'] },
  },
  {
    ...A1, id: 'quest:monk-the-thirtieth-move', name: 'The Thirtieth Move', type: 'side', region: L3, giver: ST,
    summary: 'For thirty years Shirin has played a game of stones with Doran Kell by messenger, one move a year. He has never replied. This year she wants her move carried to his throne.',
    requires: req({ trust: ST, value: 'trusted' }, done('quest:monk-the-ninefold-abbot')), firstStage: 'throne',
    stages: [
      {
        id: 'throne', journal: 'Carry the thirtieth move up to the Mountain King’s empty throne on the summit.',
        objectives: [{ id: 'throne', text: 'Lay Shirin’s move on the Mountain King’s throne', interact: 'obj:kell-throne-arm', marker: { landmark: 'landmark:mountain-king-throne' } }],
        next: 'shirin',
      },
      {
        id: 'shirin', journal: 'Scratched into the arm of the throne: thirty replies, one a year. Nobody ever carried them down.',
        objectives: [{ id: 'shirin', text: 'Tell Shirin what is written on the throne', talk: ST, marker: { landmark: 'landmark:abbess-rooms' } }],
        onComplete: [{ setFlag: 'monk.shirin_devotable', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-thirty-moves'] },
  },
  {
    ...A1, id: 'quest:monk-bounty-terrace-goats', name: 'Bounty: the Terrace Goats', type: 'bounty', region: Z2, giver: 'npc:gelek-amble',
    summary: 'A herd of hollow Mountain Goats has taken the Prayer Terraces and is knocking novices off them, one landing at a time.',
    requires: req(done('quest:monk-tea-on-every-landing')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'Six of them, black-eyed and leaping. Not Matins. Matins is merely rude.', objectives: [{ id: 'goats', text: 'Drive off the hollow Terrace Goats', kill: 'bx_fist_1', count: 6, marker: { place: Z2 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 150 },
  },
  {
    ...A1, id: 'quest:monk-bounty-great-stone-slime', name: 'Bounty: the Great Stone Slime', type: 'bounty', region: Z4, giver: 'npc:gelek-amble',
    summary: 'Something lives in the Cloud Kitchen’s cellar. It is very large, very slow, and mostly rice.',
    requires: req(done('quest:monk-the-ninefold-abbot')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'The Great Stone Slime has eaten forty sacks of rice and a ladder.', objectives: [{ id: 'slime', text: 'Defeat the Great Stone Slime', kill: 'bx_fist_2', count: 1, marker: { landmark: 'landmark:cloud-kitchen-hearth' } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 120 },
  },

  // ======================= ACT II: the class thread (C-1 … C-6) + featured bearers
  {
    ...A2, id: 'quest:monk-the-welcome-hall', name: 'The Welcome Hall', type: 'class', region: 'region:briar', giver: 'npc:faraj-stillwater',
    summary: 'Somewhere in Concordia there are Fist monks who came ahead in C. 1012 to prepare Doran Kell’s crowning. They will know where Fist’s Sentinel lies.',
    requires: req(done('quest:cc-through-the-arch')), autoStart: true, firstStage: 'hall',
    stages: [
      {
        id: 'hall', journal: 'You left Master Kell, the Mountain King, sitting on the last stair, and came through the Stair Gate with the Summit half singing. Now Nan Briar, the hedge-witch of the Briar Path, says there is a cloister half-sunk in the bog at Briar Hollow, where six monks sweep the doorstep every morning.',
        objectives: [{ id: 'faraj', text: 'Find the Welcome Hall in Briar Hollow', talk: 'npc:faraj-stillwater', marker: { landmark: 'landmark:fist-welcome-hall' } }],
        next: 'sweep',
      },
      {
        id: 'sweep', journal: 'The six monks of the Welcome Hall sweep it every morning, for a crowning that never came. Brother Faraj has handed you a broom. It would be rude not to.',
        objectives: [{ id: 'sweep', text: 'Sweep the Welcome Hall with the six monks', interact: 'obj:monk-welcome-broom', marker: { landmark: 'landmark:fist-welcome-hall' } }],
        onComplete: [{ startQuest: 'quest:monk-the-bog-forms' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-fist-welcome-hall'] },
  },
  {
    ...A2, id: 'quest:monk-the-bog-forms', name: 'The Bog Forms', type: 'class', region: 'region:briar', giver: 'npc:faraj-stillwater',
    summary: 'The slimes of Briar Hollow have started doing the Stone Abbot’s forms. Badly. Follow the forms and they will lead you to whatever taught them.',
    requires: req(done('quest:monk-the-welcome-hall')), firstStage: 'forms',
    stages: [
      {
        id: 'forms', journal: 'Watch the slimes in the bramble. Each one is doing a form, and each form points the same way.',
        objectives: [{ id: 'forms', text: 'Follow the slime-forms through the bramble', interact: 'obj:monk-slime-form-*', count: 3, marker: { region: 'region:briar' } }],
        next: 'slimes',
      },
      {
        id: 'slimes', journal: 'The slimes near the pool are doing the forms well. Too well. They would like to show you.',
        objectives: [{ id: 'slimes', text: 'Get past the bog-slimes doing forms', kill: 'bx_slime', count: 4, marker: { landmark: 'landmark:sentinel-fist' } }],
        next: 'down',
      },
      {
        id: 'down', journal: 'At the heart of the bramble, a black pool, perfectly still.',
        objectives: [{ id: 'lair', text: 'Go down into the Deep Bog', reach: 'inst:sentinel-fist', marker: { landmark: 'landmark:sentinel-fist' } }],
        onComplete: [{ startQuest: 'quest:monk-the-ooze-sovereign' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 120 },
  },
  {
    ...A2, id: 'quest:monk-the-ooze-sovereign', name: 'The Ooze Sovereign', type: 'class', region: 'region:briar', giver: 'npc:faraj-stillwater',
    summary: 'The Ooze Sovereign has eaten the Stone Abbot, Fist’s Sentinel, and it fights like a monk because it ate one.',
    requires: req(done('quest:monk-the-bog-forms')), firstStage: 'fight',
    stages: [
      {
        id: 'fight', journal: 'The Ooze Sovereign is the Sentinel of the Fist school, because it is wearing him. Win his mark back.',
        onEnter: [{ openDialogue: 'dialogue:monk-sovereign-forms' }],
        objectives: [{ id: 'sovereign', text: 'Defeat the Ooze Sovereign', kill: 'bx_sovereign', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-fist' }],
        next: 'release',
      },
      {
        id: 'release', journal: 'An old man in a monk’s robe rose out of the slime, sitting cross-legged, very calm, a little damp.',
        objectives: [{ id: 'mark', text: 'Hear the Stone Abbot out', when: { flag: 'story.sentinel.fist' } }],
        next: 'seat',
      },
      {
        id: 'seat', journal: 'The Stone Abbot is sitting on the bog-stone where the Sovereign lay. He has been very patient.',
        objectives: [{ id: 'seat', text: 'Sit with the Stone Abbot', interact: 'obj:fist-abbot-seat' }],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'Six monks have swept a welcome hall for thirty years, twelve steps from the pool that ate their Abbot. Somebody should tell them he is out.',
        objectives: [{ id: 'faraj', text: 'Tell Brother Faraj the Stone Abbot is free', talk: 'npc:faraj-stillwater', marker: { landmark: 'landmark:fist-welcome-hall' } }],
        onComplete: [{ startQuest: 'quest:monk-the-news-that-never-came' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-sovereign'] },
  },
  {
    ...A2, id: 'quest:monk-the-news-that-never-came', name: 'The News That Never Came', type: 'class', region: 'region:storm', giver: 'npc:faraj-stillwater',
    summary: 'Kestrel is on the Stormcliffs. The Stormcrow screams the news of a Turning that never came, and he wants it to scream instead that Fist is crowned.',
    requires: req(done('quest:monk-the-ooze-sovereign')), firstStage: 'cliffs',
    stages: [
      {
        id: 'cliffs', journal: 'The Stone Abbot says your brother walked past the bog towards the thunder. Go to Cliffstair.',
        objectives: [{ id: 'cliffs', text: 'Climb to Cliffstair on the Stormcliffs', reach: 'region:storm', marker: { landmark: 'landmark:cliff-storm-spire' } }],
        next: [
          { when: { flag: 'monk.cells', value: 'climb' }, to: 'exiles' },
          { to: 'legion' },
        ],
      },
      {
        id: 'exiles', journal: 'There are Climbers on the Stormcliffs, exiles who came through after you. They wore the grey with you for a week. Light the Climbers’ cairn and they will come.',
        objectives: [{ id: 'cairn', text: 'Light the Climbers’ signal cairn', interact: 'obj:monk-climber-cairn', marker: { landmark: 'landmark:cliff-wind-yard' } }],
        next: 'legion',
      },
      {
        id: 'legion', journal: 'Hollow Legionnaires hold the cliff path above Cliffstair, waiting for Kestrel to come back down.',
        objectives: [{ id: 'legion', text: 'Break the Hollow Legion on the cliff path', kill: 'bx_concord_0', count: 4, marker: { region: 'region:storm' } }],
        next: 'bead',
      },
      {
        id: 'bead', journal: 'On the cliff path, a broken prayer bead, black, still wet.',
        objectives: [{ id: 'bead', text: 'Pick up the broken bead', interact: 'obj:monk-kestrel-bead' }],
        next: 'nest',
      },
      {
        id: 'nest', journal: 'The path goes on up to the Stormcrow’s nest at the top of the cliffs.',
        objectives: [{ id: 'lair', text: 'Climb to the Stormcrow’s Nest', reach: 'inst:sentinel-storm', marker: { landmark: 'landmark:sentinel-storm' } }],
        onComplete: [{ startQuest: 'quest:monk-the-stormcrow' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 150 },
  },
  {
    ...A2, id: 'quest:monk-the-stormcrow', name: 'The Stormcrow', type: 'class', region: 'region:storm', giver: 'npc:faraj-stillwater',
    summary: 'The Stormcrow carried the news of every Turning across the ring. For thirty years it has screamed the news of one that never came.',
    requires: req(done('quest:monk-the-news-that-never-came')), firstStage: 'fight',
    stages: [
      {
        id: 'fight', journal: 'The Stormcrow is the Sentinel of the Storm school. The Storm bearers cannot win their mark while it screams.',
        objectives: [{ id: 'crow', text: 'Defeat the Stormcrow', kill: 'bx_stormcrow', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-storm' }, { setFlag: 'story.bearer.sparkwright', value: true }],
        next: 'carving',
      },
      {
        id: 'carving', journal: 'The nest is quiet. In the rock at its rim, where the Stormcrow used to stand and scream, somebody has been cutting letters with a hard, patient fist.',
        objectives: [{ id: 'carving', text: 'Read what is cut into the rim of the nest', interact: 'obj:monk-nest-carving' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-stormcrow'] },
  },
  {
    ...A2, id: 'quest:monk-a-move-by-post', name: 'A Move by Post', type: 'class', region: 'vil:brind', giver: ST,
    summary: 'Something has come through the Fist arch from Stonecloister with a letter for you. It is a stones move. It is a cheating one.',
    requires: req(done('quest:monk-the-stormcrow')), autoStart: true, firstStage: 'letter',
    stages: [
      {
        id: 'letter', journal: 'A letter from the Abbess is waiting for you at the Gate Circle.',
        objectives: [{ id: 'letter', text: 'Collect Shirin’s letter at the Gate Circle', when: { flag: 'monk.shirin_letter' }, marker: { landmark: 'landmark:gate-circle' } }],
        next: 'reply',
      },
      {
        id: 'reply', journal: 'A stones game by post needs a move back. Kell’s stair is carved halfway up the Fist arch, and it stops where a stone could sit.',
        objectives: [{ id: 'reply', text: 'Send the Abbess a move back through the Fist arch', interact: 'obj:monk-reply-stone', marker: { landmark: 'landmark:gate-circle' } }],
        onComplete: [{ setFlag: 'story.act2_ready', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:monk-the-patient-bog', name: 'The Patient Bog', type: 'side', region: 'region:briar', giver: 'npc:bearer-hedgewitch',
    summary: 'The Hedgewitch bearer wants to compost the Ooze Sovereign’s pool, all of it, into something that grows. You would like to ask the bog first.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'pool',
    stages: [
      {
        id: 'pool', journal: 'Bryony Fernwick is at the edge of the Sovereign’s pool with a spade and a very determined face.',
        objectives: [{ id: 'pool', text: 'Meet the Hedgewitch bearer at the Sovereign’s pool', interact: 'obj:monk-pool-edge', marker: { landmark: 'landmark:sentinel-fist' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Bryony wants to tell you how it turned out, at the Stone Court.',
        objectives: [{ id: 'bryony', text: 'Talk to the Hedgewitch bearer', when: { any: [{ flag: 'monk.bryony_thanked' }, { partyHasClass: 'hedgewitch' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.hedgewitch', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A2, id: 'quest:monk-one-breath-first', name: 'One Breath First', type: 'side', region: 'region:storm', giver: 'npc:bearer-stormlancer',
    summary: 'The Stormlancer bearer means to charge the Stormcrow alone, right now, at a run. You would like them to wait one breath first.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'ledge',
    stages: [
      {
        id: 'ledge', journal: 'Kit Skyward is on the wind ledge above Cliffstair’s Wind Yard, lance up, about to jump.',
        objectives: [{ id: 'ledge', text: 'Catch the Stormlancer bearer on the wind ledge', interact: 'obj:monk-wind-ledge', marker: { landmark: 'landmark:cliff-wind-yard' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Kit has something to say about breathing, at the Stone Court. They say it quickly.',
        objectives: [{ id: 'kit', text: 'Talk to the Stormlancer bearer', when: { any: [{ flag: 'monk.kit_thanked' }, { partyHasClass: 'stormlancer' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.stormlancer', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  // ======================= ACT III: class quests (III-4 + 3 side)
  {
    ...A3, id: 'quest:monk-the-arms-of-the-chimera', name: 'The Arms of the Chimera', type: 'class', region: 'region:heart', giver: 'npc:casimir',
    summary: 'At the top of the Twelve Stairs the Union Chimera is waiting. Its arms are grey iron, striking with a stolen half-stone, and you know every one of their forms. Kestrel learned them first.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'herald',
    stages: [
      { id: 'herald', journal: 'At the Eve, Kestrel, your foster-brother, took the Brawler’s Pit half and ran into the Heart. Now he is bound into the Union Chimera as its arms. He always wanted to be good at something.', objectives: [{ id: 'herald', text: 'Face the Arms of the Chimera', kill: 'cb_arms-of-the-chimera', count: 1, marker: { landmark: 'landmark:twelve-stairs-top' } }], onComplete: [{ openDialogue: 'dialogue:monk-herald-fate' }], next: 'fate' },
      { id: 'fate', journal: 'Kestrel is on his knees inside the iron arms, beaten, and the arms are still striking at the air.', objectives: [{ id: 'fate', text: 'Decide Kestrel’s fate', when: { flag: 'monk.nemesis_fate' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 3 },
  },
  {
    ...A3, id: 'quest:monk-the-last-move', name: 'The Last Move', type: 'side', region: 'region:heart', giver: ST,
    summary: '“Play it anyway. They never check.” The move in Shirin’s letter has never been played. At the top of the Twelve Stairs the old paving is laid in squares, like a board.',
    requires: req(done('quest:monk-the-arms-of-the-chimera')), autoStart: true, firstStage: 'beads',
    stages: [
      { id: 'beads', journal: 'A stones move needs stones. Kestrel’s black prayer beads went down the Fist stair one step at a time. Gather them.', objectives: [{ id: 'beads', text: 'Gather Kestrel’s black beads on the Twelve Stairs', interact: 'obj:monk-stair-bead-*', count: 3, marker: { landmark: 'landmark:twelve-stairs' } }], next: 'pebbles' },
      { id: 'pebbles', journal: 'Black stones you have. Shirin always played white. There are pale pebbles in the ring of the bearers’ fires at the Heart camp.', objectives: [{ id: 'pebbles', text: 'Find white stones at the Heart camp', interact: 'obj:monk-camp-pebbles', marker: { landmark: 'landmark:heart-camp' } }], next: 'board' },
      { id: 'board', journal: 'Before the Citadel doors the paving is laid out like a stones board. Doran Kell should have stood here in C. 1012.', objectives: [{ id: 'board', text: 'Play Shirin’s last move on the Citadel threshold', interact: 'obj:monk-last-move-board', marker: { landmark: 'landmark:twelve-stairs-top' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:monk-forty-novices', name: 'Forty Novices', type: 'side', region: 'region:heart', giver: 'npc:auntie-yuen',
    summary: 'The novices who went up the mountain with Kestrel followed him all the way into the Heart. They are standing in the Legion. Somebody has brought a teapot.',
    requires: req(done('quest:heart-legion')), autoStart: true, firstStage: 'yuen',
    stages: [
      { id: 'yuen', journal: 'Auntie Yuen, sixty years at the tea stall on landing four hundred, has carried her pot all the way to the Heart camp, as she said she would. It is still on the boil.', objectives: [{ id: 'yuen', text: 'Find Auntie Yuen at the Heart camp', talk: 'npc:auntie-yuen', marker: { landmark: 'landmark:heart-camp' } }], next: 'escort' },
      { id: 'escort', journal: 'Auntie Yuen will not let her pot out of her sight, and she will pour for her children herself. Get her and the pot to the Legion camp. The Heart is not a safe road for an old woman with a brazier.', onEnter: [{ escort: 'npc:auntie-yuen', to: 'landmark:legion-camp' }], objectives: [{ id: 'yuen', text: 'Bring Auntie Yuen and her pot safely to the Legion camp', when: { any: [{ flag: 'escort.auntie-yuen', op: '==', value: 'arrived' }, { flag: 'escort.auntie-yuen', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:legion-camp' } }], next: [{ when: { flag: 'escort.auntie-yuen', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'novices' }] },
      { id: 'regroup', journal: 'Auntie Yuen went down, pot and all, and the bearers carried her back to the camp. The pot did not spill. She is extremely angry about the whole thing and ready to go again.', onEnter: [{ escort: 'npc:auntie-yuen', to: 'landmark:legion-camp' }], objectives: [{ id: 'yuen', text: 'Try again: bring Auntie Yuen to the Legion camp', when: { any: [{ flag: 'escort.auntie-yuen', op: '==', value: 'arrived' }, { flag: 'escort.auntie-yuen', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:legion-camp' } }], next: [{ when: { flag: 'escort.auntie-yuen', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'novices' }] },
      { id: 'novices', journal: 'Forty novices in Stonecloister robes, standing hollow in the Legion’s ranks. Bring them back one at a time, by name, with a cup of tea.', objectives: [{ id: 'novices', text: 'Bring the novices back by name', interact: 'obj:monk-legion-novice-*', count: 3, marker: { landmark: 'landmark:legion-camp' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A3, id: 'quest:monk-sop-on-the-stair', name: 'Sop on the Stair', type: 'side', region: 'region:heart', giver: 'npc:little-brother-sop',
    summary: 'Little Brother Sop followed the song: down the Thousand Stairs, through the Stair Gate, across Concordia and up the Fist stair of the Twelve Stairs, where he fell asleep.',
    requires: req(done('quest:heart-stairs'), done('quest:monk-little-brother-sop')), autoStart: true, firstStage: 'stair',
    stages: [
      { id: 'stair', journal: 'A very small novice is asleep near the top of the Fist stair, curled round a toy goat, perfectly safe.', objectives: [{ id: 'sop', text: 'Wake Little Brother Sop on the Fist stair', talk: 'npc:little-brother-sop', marker: { landmark: 'landmark:twelve-stairs-top' } }], next: 'cloak' },
      { id: 'cloak', journal: 'Sop is asleep on your back again, and he is shivering. He came across the whole world in his summer robe. There was a cloak on the stair on the way up.', objectives: [{ id: 'cloak', text: 'Find something warm for Sop on the Stairs', interact: 'obj:monk-stair-cloak', marker: { landmark: 'landmark:twelve-stairs' } }], next: 'yuen' },
      { id: 'yuen', journal: 'Sop has gone back to sleep on your back. Carry him down to the Heart camp, to somebody with a teapot.', objectives: [{ id: 'yuen', text: 'Carry Sop to Auntie Yuen at the Heart camp', when: { flag: 'monk.sop_home' }, marker: { landmark: 'landmark:heart-camp' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
];

export default quests;
