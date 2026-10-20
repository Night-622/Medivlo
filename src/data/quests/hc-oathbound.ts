/**
 * Hollow Crown: the OATHBOUND campaign (docs/lore/hollow-crown/06-outlines/radiance.md). Act I on the Gilded March
 * (area:radiance-frontier) and the Act II class thread in Concordia. On the March the Dimming has brought back
 * real night for the first time in thirty years, so its night beats use the clock. Owner: Claude 4.
 */
import type { NarrativeCondition, QuestDef } from '@/core';

const OAT: NarrativeCondition = { heroClass: 'oathbound' };
const done = (q: `quest:${string}`): NarrativeCondition => ({ questCompleted: q });
const req = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: [OAT, ...c] });
const A1 = { act: 'act1' as const, campaign: 'oathbound', chapter: 'The Gilded March' };
const A2 = { act: 'act2' as const, campaign: 'oathbound', chapter: 'Concordia' };
const A3 = { act: 'act3' as const, campaign: 'oathbound', chapter: 'The Heart' };
const Z1 = 'zone:radiance-frontier-1' as const, Z2 = 'zone:radiance-frontier-2' as const, Z3 = 'zone:radiance-frontier-3' as const, Z4 = 'zone:radiance-frontier-4' as const;
const L1 = 'inst:radiance-frontier-lair-1' as const, L2 = 'inst:radiance-frontier-lair-2' as const, L3 = 'inst:radiance-frontier-lair-3' as const;
const BH = 'npc:beatrix-holm' as const, IL = 'npc:ilsabet' as const, RM = 'npc:roderick-mallard' as const, CL = 'npc:cuthbert-lowe' as const;

const quests: QuestDef[] = [
  // ======================= ACT I: main (I-1 … I-10)
  {
    ...A1, id: 'quest:oathbound-the-vigil', name: 'The Vigil', type: 'main', region: Z1, giver: BH,
    summary: 'The last vigil before you swear into the Order of Oathkeep, alone in the Hall of Broken Swords. Halfway through, a bell rang from very far away, and every broken sword in the Hall rang with it.',
    requires: OAT, autoStart: true, firstStage: 'vigil',
    stages: [
      {
        id: 'vigil', journal: 'Kneel at the vigil-stone in the Hall of Broken Swords until the oath is sworn. Do not get up. Do not look round. Do not sneeze.',
        onEnter: [{ openDialogue: 'dialogue:oathbound-vigil-bell' }],
        objectives: [{ id: 'hall', text: 'Kneel at the vigil-stone', reach: 'landmark:hall-of-broken-swords', marker: { landmark: 'landmark:hall-of-broken-swords' } }],
        next: 'swords',
      },
      {
        id: 'swords', journal: 'The broken swords are still ringing in their brackets, and something in your chest is ringing with them. Steady them before the whole Hall shakes itself apart.',
        objectives: [{ id: 'swords', text: 'Steady the ringing swords', interact: 'obj:broken-sword-rack-*', count: 3, marker: { landmark: 'landmark:hall-of-broken-swords' } }],
        next: 'oath',
      },
      {
        id: 'oath', journal: 'Ser Beatrix Holm is standing in the doorway. She has not said a word. She is waiting for you to finish.',
        objectives: [{ id: 'beatrix', text: 'Finish the oath before Ser Beatrix', talk: BH, marker: { landmark: 'landmark:hall-of-broken-swords' } }],
        onComplete: [{ setFlag: 'oathbound.bell_heard', value: true }],
        next: 'bracket',
      },
      {
        id: 'bracket', journal: 'Sworn. On your way out of the Hall one bracket is still ringing, high and thin, and there is no sword in it at all.',
        objectives: [{ id: 'bracket', text: 'Look at the empty bracket that is still ringing', interact: 'obj:oathbound-empty-bracket', marker: { landmark: 'landmark:hall-of-broken-swords' } }],
        onComplete: [{ startQuest: 'quest:oathbound-no-village-alone' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-solaria', 'lore:hc-order-of-oathkeep'] },
  },
  {
    ...A1, id: 'quest:oathbound-no-village-alone', name: 'No Village Alone', type: 'main', region: Z2, giver: BH,
    summary: '“No village of the March shall stand alone,” says the Oath. The Dimming has reached the wheat at Haybright, and Haybright is panicking at its own shadow.',
    requires: req(done('quest:oathbound-the-vigil')), firstStage: 'reeve',
    stages: [
      {
        id: 'reeve', journal: 'Haybright in the Sunfields. The reeve is a woman called Marjory Stook, and Beatrix says she will be the only person in the village not screaming.',
        objectives: [{ id: 'reeve', text: 'Find Reeve Stook at Haybright', talk: 'npc:marjory-stook', marker: { landmark: 'landmark:haybright' } }],
        next: 'shadows',
      },
      {
        id: 'shadows', journal: 'Haybright has never seen a shadow at full length. Three of its people are standing very still in the street, staring at theirs.',
        objectives: [{ id: 'villagers', text: 'Calm the villagers frightened of their shadows', interact: 'obj:haybright-villager-*', count: 3, marker: { landmark: 'landmark:haybright' } }],
        next: 'lightbearers',
      },
      {
        id: 'lightbearers', journal: 'Black tears are pooling in the first real shade in thirty years, and hollow Lightbearers are climbing out of them.',
        objectives: [{ id: 'lightbearers', text: 'Drive off the hollow Lightbearers', kill: 'bx_radiance_0', count: 4, marker: { landmark: 'landmark:haybright' } }],
        next: 'report',
      },
      {
        id: 'report', journal: 'Haybright is standing. Not alone.',
        objectives: [{ id: 'beatrix', text: 'Report to Ser Beatrix at Oathkeep', talk: BH, marker: { landmark: 'landmark:beatrix-holm-quarters' } }],
        onComplete: [{ startQuest: 'quest:oathbound-the-lions-gate' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40, lore: ['lore:hc-dimming'] },
  },
  {
    ...A1, id: 'quest:oathbound-the-lions-gate', name: 'The Lion’s Gate', type: 'main', region: Z3, giver: BH,
    summary: 'The Gilded Lion guarded the March road for a thousand years. Now it is eating the golden waymarks off it, one by one, and nobody can find the road in the Dimming.',
    requires: req(done('quest:oathbound-no-village-alone')), firstStage: 'road',
    stages: [
      {
        id: 'road', journal: 'Follow the bitten stumps of the waymarks up the March road to the old gatehouse where the Lion denned.',
        objectives: [{ id: 'arch', text: 'Follow the bitten waymarks to the Lion’s Gate', reach: 'landmark:lions-gate-arch', marker: { landmark: 'landmark:lions-gate-arch' } }],
        next: 'den',
      },
      {
        id: 'den', journal: 'The gatehouse smells of hot metal and old cat.',
        objectives: [{ id: 'enter', text: 'Go into the Lion’s Gate', reach: L1, marker: { landmark: 'landmark:lions-gate-arch' } }],
        next: 'lion',
      },
      {
        id: 'lion', journal: 'It is armoured in plates of waymark gold. Strip them off with your shield, and keep it away from the gold it eats to heal.',
        objectives: [{ id: 'lion', text: 'Defeat the Gilded Lion', kill: 'bx_radiance_3', count: 1 }],
        next: 'hoard',
      },
      {
        id: 'hoard', journal: 'Behind the Lion’s bed is a heap of chewed gold: every waymark it ate.',
        objectives: [{ id: 'hoard', text: 'Gather the waymark gold', interact: 'obj:lion-waymark-hoard' }],
        next: 'report',
      },
      {
        id: 'report', journal: 'A sack of bitten gold, and a road that can be found again.',
        objectives: [{ id: 'beatrix', text: 'Bring the gold to Ser Beatrix', talk: BH, marker: { landmark: 'landmark:beatrix-holm-quarters' } }],
        onComplete: [{ setFlag: 'oathbound.lion_down', value: true }, { startQuest: 'quest:oathbound-the-sorrow-oath' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 80, hcItems: [{ item: 'i_scroll_radiance', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:oathbound-the-sorrow-oath', name: 'The Sorrow-Oath', type: 'main', region: Z4, giver: BH,
    summary: 'Someone is riding out of the Dimming leading a line of villagers to safety. The scouts say her armour is polished, and every child in the line is holding her stirrup.',
    requires: req(done('quest:oathbound-the-lions-gate')), firstStage: 'edge',
    stages: [
      {
        id: 'edge', journal: 'Ride with Beatrix to the edge of the Dimming, where the light runs out.',
        objectives: [{ id: 'edge', text: 'Ride to the edge of the Dimming', reach: 'landmark:dimming-edge', marker: { landmark: 'landmark:dimming-edge' } }],
        next: 'ilsabet',
      },
      {
        id: 'ilsabet', journal: 'A knight on a grey horse, coming out of the dark at a walk, with forty villagers behind her.',
        objectives: [{ id: 'ilsabet', text: 'Greet the knight from the Dimming', talk: IL, marker: { landmark: 'landmark:dimming-edge' } }],
        next: 'follow',
      },
      {
        id: 'follow', journal: 'Ilsabet is leading the Nethercott folk out of the Dimming towards Haybright, at a walk, singing to the children. Ride behind her as far as the old milestone, where the Haybright carts are waiting.',
        objectives: [{ id: 'milestone', text: 'Follow Ilsabet and the villagers to the milestone', reach: 'landmark:oathbound-milestone', marker: { landmark: 'landmark:oathbound-milestone' } }],
        next: 'beatrix',
      },
      {
        id: 'beatrix', journal: 'Dame Ilsabet of the Sorrow-Oath, the most famous knight of the March, thirty years lost. Beatrix has sat down on a milestone and is not getting up.',
        objectives: [{ id: 'beatrix', text: 'Sit with Beatrix', talk: BH, marker: { landmark: 'landmark:oathbound-milestone' } }],
        onComplete: [{ setFlag: 'oathbound.ilsabet_met', value: true }, { startQuest: 'quest:oathbound-the-oath-moot' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-sorrow-oath'] },
  },
  {
    ...A1, id: 'quest:oathbound-the-oath-moot', name: 'The Oath Moot', type: 'main', region: Z1, giver: BH,
    summary: 'The Brightwatch has come to Oathkeep with the Hierarch’s decree: everyone who has seen the night is night-touched, and must be marched to Dawnspire for cleansing in the light. The Order is sworn to obey the Hierarch.',
    requires: req(done('quest:oathbound-the-sorrow-oath')), firstStage: 'canvass',
    stages: [
      {
        id: 'canvass', journal: 'Before the Moot, hear the two people the decree is really about: Reeve Stook, whose village is to be marched away, and Captain Sterling of the Brightwatch, who has to carry the order.',
        objectives: [
          { id: 'stook', text: 'Hear Reeve Stook out at Haybright', talk: 'npc:marjory-stook', marker: { landmark: 'landmark:haybright' } },
          { id: 'sterling', text: 'Hear Captain Sterling out at the oath-stones', talk: 'npc:aurelian-sterling', marker: { landmark: 'landmark:oath-stones' } },
        ],
        next: 'moot',
      },
      {
        id: 'moot', journal: 'The Order gathers at the oath-stones. The Brightwatch captain has the decree. Haybright and Lampwick are waiting to hear what the Order will do with them.',
        objectives: [{ id: 'moot', text: 'Speak at the Oath Moot', when: { flag: 'oathbound.decree' }, marker: { landmark: 'landmark:oath-stones' } }],
        next: [
          { when: { flag: 'oathbound.decree', op: '==', value: 'decree' }, to: 'escort' },
          { when: { flag: 'oathbound.decree', op: '==', value: 'march' }, to: 'stand' },
          { to: 'after' },
        ],
      },
      {
        id: 'escort', journal: 'Oathkeep keeps the decree. The night-touched of Haybright are waiting by the carts to be marched to Dawnspire, and you are to give the order to move.',
        objectives: [{ id: 'carts', text: 'Give the order at the Haybright carts', interact: 'obj:oathbound-escort-carts', marker: { landmark: 'landmark:haybright' } }],
        next: 'after',
      },
      {
        id: 'stand', journal: 'Oathkeep keeps the March. The Order is riding out to stand at the Dimming’s edge between the villages and the Brightwatch road, and somebody has to plant the first lance.',
        objectives: [{ id: 'line', text: 'Plant the first lance of the Order’s line', interact: 'obj:oathbound-march-line', marker: { landmark: 'landmark:oathbound-march-line' } }],
        next: 'after',
      },
      {
        id: 'after', journal: 'Whatever the Moot decided, the night-touched have ended up in the Forsworn Chapel, and something in the chapel has risen to drive them out.',
        objectives: [],
        onComplete: [{ startQuest: 'quest:oathbound-the-forsworn-chapel' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A1, id: 'quest:oathbound-the-forsworn-chapel', name: 'The Forsworn Chapel', type: 'main', region: Z2, giver: BH,
    summary: 'Whatever the Moot decided, the night-touched have ended up in the Forsworn Chapel, and the chapel’s knight has risen to drive everyone out.',
    requires: req(done('quest:oathbound-the-oath-moot')), firstStage: 'chapel',
    stages: [
      {
        id: 'chapel', journal: 'The Forsworn Chapel stands roofless in the Sunfields, where the Order sends the names of knights who broke their oaths.',
        objectives: [{ id: 'enter', text: 'Go into the Forsworn Chapel', reach: L2, marker: { landmark: 'landmark:forsworn-chapel-door' } }],
        next: 'gallant',
      },
      {
        id: 'gallant', journal: 'Ser Gallant the Forsworn cannot die: every time he falls, he gets up. Hold your guard until his oath-curse gives out, and make him yield.',
        objectives: [{ id: 'gallant', text: 'Make Ser Gallant yield', kill: 'cb_ser-gallant', count: 1 }],
        next: 'yield',
      },
      {
        id: 'yield', journal: 'He is on his knees, and he has yielded, and he wants to tell you whose oath he broke.',
        objectives: [{ id: 'gallant', text: 'Hear Ser Gallant out', when: { flag: 'oathbound.gallant' } }],
        onComplete: [{ startQuest: 'quest:oathbound-to-whoever-wears-it' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 120, lore: ['lore:hc-ser-gallant'] },
  },
  {
    ...A1, id: 'quest:oathbound-to-whoever-wears-it', name: 'To Whoever Wears It', type: 'main', region: Z4, giver: IL,
    summary: 'Gallant broke his oath to Ilsabet because she kept hers to someone else. She is waiting for you at the edge of the Dimming, and she has asked for you by name.',
    requires: req(done('quest:oathbound-the-forsworn-chapel')), firstStage: 'ilsabet',
    stages: [
      {
        id: 'ilsabet', journal: 'Dame Ilsabet is at the edge of the Dimming, alone this time, with her helm in the crook of her arm.',
        objectives: [{ id: 'ilsabet', text: 'Meet Dame Ilsabet in the Dimming', talk: IL, marker: { landmark: 'landmark:dimming-edge' } }],
        next: 'camp',
      },
      {
        id: 'camp', journal: 'Ilsabet has ridden on towards the Shrine. Her camp in the Dimming is still there, a fire’s ashes and a saddle-roll. A knight who tells you everything plainly still keeps a few things in a saddle-roll.',
        objectives: [{ id: 'camp', text: 'Look through Ilsabet’s camp in the Dimming', interact: 'obj:oathbound-ilsabet-camp-*', count: 3, marker: { landmark: 'landmark:oathbound-ilsabet-camp' } }],
        next: 'beatrix',
      },
      {
        id: 'beatrix', journal: 'She has sworn fealty to the Hollow King. Beatrix has to hear it from you.',
        objectives: [{ id: 'beatrix', text: 'Tell Beatrix what Ilsabet has sworn', talk: BH, marker: { landmark: 'landmark:beatrix-holm-quarters' } }],
        onComplete: [{ setFlag: 'oathbound.ilsabet_turned', value: true }, { startQuest: 'quest:oathbound-the-dimming-shrine' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-ilsabet'] },
  },
  {
    ...A1, id: 'quest:oathbound-the-dimming-shrine', name: 'The Dimming Shrine', type: 'main', region: L3, giver: BH,
    summary: 'At the heart of the Dimming, in the first true dark, the March half lies in the Dimming Shrine. Ilsabet is riding there to take it to her king.',
    requires: req(done('quest:oathbound-to-whoever-wears-it')), firstStage: 'shrine',
    stages: [
      {
        id: 'shrine', journal: 'Into the first true dark the March has seen in thirty years. Your half-stone is the only light you have.',
        objectives: [{ id: 'enter', text: 'Go down into the Dimming Shrine', reach: L3, marker: { place: Z4 } }],
        next: 'ilsabet',
      },
      {
        id: 'ilsabet', journal: 'She announces every attack before she makes it, by the rules of fair combat. Listen to her.',
        onEnter: [{ openDialogue: 'dialogue:oathbound-ilsabet-challenge' }],
        objectives: [{ id: 'ilsabet', text: 'Face Dame Ilsabet', kill: 'cb_dame-ilsabet', count: 1 }],
        next: 'yield',
      },
      {
        id: 'yield', journal: 'Dame Ilsabet has gone down on one knee and laid her sword across it. By the rules, she has yielded.',
        onEnter: [{ openDialogue: 'dialogue:oathbound-ilsabet-yields' }],
        objectives: [{ id: 'yield', text: 'Answer her yield', when: { flag: 'oathbound.yield' } }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'The March half lies on the shrine’s stone, singing to you in the dark.',
        objectives: [{ id: 'stone', text: 'Lift the March half', interact: 'obj:radiance-frontier-halfstone' }],
        onComplete: [{ setFlag: 'oathbound.halfstone', value: true }, { startQuest: 'quest:oathbound-the-march-road' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, skillPoints: 1, lore: ['lore:hc-half-stones'] },
  },
  {
    ...A1, id: 'quest:oathbound-the-march-road', name: 'The March Road', type: 'main', region: Z1, giver: BH,
    summary: 'Ilsabet yielded the field, not the road, and she is riding for the Dawn Gate. Beatrix will ride the March road with you as far as it goes.',
    requires: req(done('quest:oathbound-the-dimming-shrine')), firstStage: 'farewell',
    stages: [
      {
        id: 'farewell', journal: 'Beatrix is waiting in her quarters with her riding cloak already on and her face set like a wall.',
        objectives: [{ id: 'beatrix', text: 'Speak with Ser Beatrix', talk: BH, marker: { landmark: 'landmark:beatrix-holm-quarters' } }],
        onComplete: [{ setFlag: 'oathbound.beatrix_farewell', value: true }],
        next: 'endstone',
      },
      {
        id: 'endstone', journal: 'Halfway to the gate stands the last waymark of the March, where the Order’s charge ends and the road goes on without it.',
        objectives: [{ id: 'stone', text: 'Stop at the last waymark of the March', interact: 'obj:oathbound-march-end-stone', marker: { landmark: 'landmark:oathbound-march-end-stone' } }],
        next: 'road',
      },
      {
        id: 'road', journal: 'East along the March road, past the golden waymarks, to the Dawn Gate.',
        objectives: [{ id: 'gate', text: 'Ride the March road to the Dawn Gate', reach: 'area:radiance-gate', marker: { place: 'area:radiance-gate' } }],
        onComplete: [{ startQuest: 'quest:oathbound-the-dawn-gate' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:oathbound-the-dawn-gate', name: 'The Dawn Gate (March side)', type: 'main', region: 'area:radiance-gate', giver: BH,
    summary: 'The Fallen Hierarch, the lord every Oathbound swears to, stands in the Dawn Gate weeping black behind his mask. He will command you to kneel.',
    requires: req(done('quest:oathbound-the-march-road')), firstStage: 'hierarch',
    stages: [
      {
        id: 'hierarch', journal: 'He commands. Hold your guard. Refuse him three times, then strike.',
        onEnter: [{ openDialogue: 'dialogue:oathbound-hierarch-kneel' }],
        objectives: [{ id: 'hierarch', text: 'Refuse the Fallen Hierarch', kill: 'bx_radiance_5', count: 1 }],
        next: 'gate',
      },
      {
        id: 'gate', journal: 'Your lord is on his knees in the gate, the tears running out of him, asking you for something.',
        objectives: [{ id: 'seal', text: 'Answer the Hierarch, and open the Dawn Gate', interact: 'obj:radiance-gate-seal' }],
        onComplete: [{ setFlag: 'story.gate_open', value: true }, { setFlag: 'story.act', value: 2 }, { setFlag: 'oathbound.act1_done', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 200, lore: ['lore:hc-realm-gates', 'lore:hc-fallen-hierarch'] },
  },

  // ======================= ACT I: side quests (2 per zone)
  {
    ...A1, id: 'quest:oathbound-the-squire-who-swears-too-much', name: 'The Squire Who Swears Too Much', type: 'side', region: Z1, giver: 'npc:hamish-goodbody',
    summary: 'Squire Hamish Goodbody swears oaths about everything, and is now bound by two hundred and twelve of them, all to be kept before sunset. In Solaria that is never, so there is time.',
    requires: req(done('quest:oathbound-the-vigil')), firstStage: 'oaths',
    stages: [
      {
        id: 'oaths', journal: 'Two hundred and twelve oaths, but Hamish says three of them are urgent.',
        objectives: [
          { id: 'porridge', text: '“I swear I’ll finish this porridge”', interact: 'obj:hamish-porridge-bowl', marker: { landmark: 'landmark:oathkeep-yard' } },
          { id: 'dummy', text: '“I swear I’ll beat the drill-dummy fairly”', interact: 'obj:hamish-drill-dummy', marker: { landmark: 'landmark:oathkeep-yard' } },
          { id: 'bell', text: '“I swear I’ll never ring the chapel bell again”', interact: 'obj:hamish-chapel-bell', marker: { place: Z1 } },
        ],
        next: 'hamish',
      },
      {
        id: 'hamish', journal: 'Three down. Two hundred and nine to go, but those can wait until Tuesday.',
        objectives: [{ id: 'hamish', text: 'Tell Hamish his urgent oaths are kept', talk: 'npc:hamish-goodbody', marker: { landmark: 'landmark:oathkeep-yard' } }],
        onComplete: [{ setFlag: 'oathbound.hamish_helped', value: true }],
        next: 'hall',
      },
      {
        id: 'hall', journal: 'Hamish has written every one of his oaths in a little book, and he knows he will never keep most of them. He wants it hung in the Hall of Broken Swords, with the other broken things. Ser Wystan keeps the Hall.',
        objectives: [{ id: 'wystan', text: 'Ask Ser Wystan to hang Hamish’s oath-book in the Hall', talk: 'npc:wystan-crake', marker: { landmark: 'landmark:hall-of-broken-swords' } }],
        onComplete: [{ setFlag: 'oathbound.hamish_book', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_bread', qty: 2 }, { item: 'i_cake' }] },
  },
  {
    ...A1, id: 'quest:oathbound-the-sword-that-rattles', name: 'The Sword That Rattles', type: 'side', region: Z1, giver: 'npc:wystan-crake',
    summary: 'One broken sword in the Hall has rattled in its bracket since the Bell rang, and will not stop. Old Ser Wystan wants to know whose it was.',
    requires: req(done('quest:oathbound-the-vigil')), firstStage: 'sword',
    stages: [
      {
        id: 'sword', journal: 'Find the rattling sword in the Hall of Broken Swords.',
        objectives: [{ id: 'sword', text: 'Find the rattling sword', interact: 'obj:rattling-sword', marker: { landmark: 'landmark:hall-of-broken-swords' } }],
        next: 'roll',
      },
      {
        id: 'roll', journal: 'There is no name on the bracket. The Hall’s roll of names will say whose it was.',
        objectives: [{ id: 'roll', text: 'Read the Hall’s roll of names', interact: 'obj:hall-sword-roll', marker: { landmark: 'landmark:hall-of-broken-swords' } }],
        next: 'wystan',
      },
      {
        id: 'wystan', journal: 'Ser Gallant. Struck from the roll. Sent to the Forsworn Chapel.',
        objectives: [{ id: 'wystan', text: 'Tell Ser Wystan whose sword it is', talk: 'npc:wystan-crake', marker: { landmark: 'landmark:hall-of-broken-swords' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:oathbound-the-first-star', name: 'The First Star', type: 'side', region: Z2, giver: 'npc:clover-wheatley',
    summary: 'Clover Wheatley, aged seven, has seen a star at the Dimming’s edge and would like to know whether it is a hole in the sky. She is quite prepared to be told that it is.',
    requires: req(done('quest:oathbound-no-village-alone')), firstStage: 'windmill',
    stages: [
      {
        id: 'windmill', journal: 'From the top of the Haybright windmill you can see the edge of the Dimming. At night, Clover says. Stars are shy.',
        objectives: [{ id: 'star', text: 'Climb the windmill with Clover at night', when: { flag: 'oathbound.star_named' }, marker: { landmark: 'landmark:haybright-windmill' } }],
        next: 'clover',
      },
      {
        id: 'clover', journal: 'It has a name now. Clover is going to need help remembering it.',
        objectives: [{ id: 'clover', text: 'Walk Clover home', talk: 'npc:clover-wheatley', marker: { landmark: 'landmark:haybright' } }],
        next: 'gammer',
      },
      {
        id: 'gammer', journal: 'Clover wants to know whether her star had a name before she gave it one. The only person on the March old enough to know the old names is Gammer Lisle, out in the Dimming.',
        objectives: [{ id: 'gammer', text: 'Ask Gammer Lisle what the star used to be called', talk: 'npc:gammer-lisle', marker: { landmark: 'landmark:lisle-fold' } }],
        onComplete: [{ setFlag: 'oathbound.star_old_name', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-concord-ring'] },
  },
  {
    ...A1, id: 'quest:oathbound-the-recruit-and-his-shadow', name: 'The Recruit and His Shadow', type: 'side', region: Z2, giver: 'npc:dobbin-fenwick',
    summary: 'Recruit Dobbin Fenwick, posted at Haybright, has seen his own shadow at full length for the first time and is certain it is a curse.',
    requires: req(done('quest:oathbound-no-village-alone')), firstStage: 'lantern',
    stages: [
      {
        id: 'lantern', journal: 'A lantern and a lot of patience. Mostly patience.',
        objectives: [{ id: 'lantern', text: 'Show Dobbin how shadows work, with a lantern', interact: 'obj:dobbin-lantern', marker: { landmark: 'landmark:haybright' } }],
        next: 'dobbin',
      },
      {
        id: 'dobbin', journal: 'Dobbin is moving the lantern round himself, very slowly, watching his shadow swing. He has stopped crying.',
        objectives: [{ id: 'dobbin', text: 'Talk to Dobbin', talk: 'npc:dobbin-fenwick', marker: { landmark: 'landmark:haybright' } }],
        onComplete: [{ setFlag: 'oathbound.dobbin_watch', value: true }],
        next: 'watch',
      },
      {
        id: 'watch', journal: 'The Order has never had a night-watchman, and Dobbin has appointed himself. His first watch is tonight, at the watch-post on the north field, facing the Dimming. He would like company. He would like it a great deal.',
        objectives: [{ id: 'watch', text: 'Stand Dobbin’s first night-watch with him', when: { flag: 'oathbound.first_watch' }, marker: { landmark: 'landmark:oathbound-watch-post' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_lantern' }] },
  },
  {
    ...A1, id: 'quest:oathbound-the-golden-waymarks', name: 'The Golden Waymarks', type: 'side', region: Z3, giver: 'npc:jessamy-brightpenny',
    summary: 'With the Lion’s hoard back, Jessamy Brightpenny can re-gild the March waymarks so travellers can find the road in the Dimming. She will need someone to hold the ladder.',
    requires: req(done('quest:oathbound-the-lions-gate')), firstStage: 'gild',
    stages: [
      {
        id: 'gild', journal: 'Six bitten waymarks along the March road. Every one has an old traveller’s oath carved into the back.',
        objectives: [{ id: 'waymarks', text: 'Re-gild the March waymarks', interact: 'obj:march-waymark-*', count: 6, marker: { place: Z3 } }],
        next: 'jessamy',
      },
      {
        id: 'jessamy', journal: 'The road shines again, all the way to the Dimming’s edge.',
        objectives: [{ id: 'jessamy', text: 'Tell Jessamy the road is gilded', talk: 'npc:jessamy-brightpenny', marker: { landmark: 'landmark:gilders-hut' } }],
        next: 'carve',
      },
      {
        id: 'carve', journal: 'Jessamy has set one new waymark on the road, out towards the Lion’s Gate, to replace the one the Lion swallowed whole. Its back is blank. Every waymark has a traveller’s oath. This one is waiting for yours.',
        objectives: [{ id: 'carve', text: 'Carve your own oath on the new waymark', interact: 'obj:oathbound-new-waymark', marker: { landmark: 'landmark:oathbound-new-waymark' } }],
        onComplete: [{ setFlag: 'oathbound.waymark_carved', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 60, lore: ['lore:hc-golden-waymarks'] },
  },
  {
    ...A1, id: 'quest:oathbound-the-bridge-knight', name: 'The Bridge Knight', type: 'side', region: Z3, giver: 'npc:humbert-tench',
    summary: 'Ser Humbert Tench swore forty years ago to let no one cross his bridge without answering his riddle. He has forgotten the riddle. Nobody has crossed in a month.',
    requires: req(done('quest:oathbound-the-lions-gate')), firstStage: 'carving',
    stages: [
      {
        id: 'carving', journal: 'Humbert thinks he carved the riddle under the bridge, so he would never forget it. He forgot that too.',
        objectives: [{ id: 'carving', text: 'Find the riddle carved under the bridge', interact: 'obj:tench-bridge-carving', marker: { landmark: 'landmark:tench-bridge' } }],
        next: 'humbert',
      },
      {
        id: 'humbert', journal: 'Worn almost smooth, but you can make it out. Now Humbert has to ask it, and somebody has to answer.',
        objectives: [{ id: 'humbert', text: 'Remind Ser Humbert of his riddle', talk: 'npc:humbert-tench', marker: { landmark: 'landmark:tench-bridge' } }],
        next: 'bank',
      },
      {
        id: 'bank', journal: 'Forty years Humbert has kept his bridge, and he has never once crossed it. Somebody on the far bank gave him the riddle. He would like to know if the cottage is still there. He would like somebody else to look first.',
        objectives: [{ id: 'door', text: 'Cross Tench Bridge and find the cottage on the far bank', interact: 'obj:oathbound-far-bank-door', marker: { landmark: 'landmark:oathbound-far-bank' } }],
        onComplete: [{ setFlag: 'oathbound.far_bank', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50 },
  },
  {
    ...A1, id: 'quest:oathbound-afraid-of-the-dark', name: 'Afraid of the Dark', type: 'side', region: Z4, giver: 'npc:elspeth-snuff',
    summary: 'The whole village of Lampwick is terrified of its first night. Headwoman Elspeth Snuff has asked the Order for a knight who is not.',
    requires: req(done('quest:oathbound-the-sorrow-oath')), firstStage: 'fires',
    stages: [
      {
        id: 'fires', journal: 'Lampwick wants light. Build three good campfires on the green before the dark comes in.',
        objectives: [{ id: 'fires', text: 'Light the campfires on Lampwick green', interact: 'obj:lampwick-campfire-*', count: 3, marker: { landmark: 'landmark:lampwick' } }],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'The fires are lit. Now the hard part: when the dark comes, sit with them, and tell them what it is for.',
        objectives: [{ id: 'tell', text: 'Sit with Lampwick by the fire at night', when: { flag: 'oathbound.lampwick_told' }, marker: { landmark: 'landmark:lampwick' } }],
        next: 'morning',
      },
      {
        id: 'morning', journal: 'And then, as it always does, the morning came.',
        objectives: [{ id: 'elspeth', text: 'See Elspeth Snuff in the morning', talk: 'npc:elspeth-snuff', marker: { landmark: 'landmark:lampwick' } }],
        onComplete: [{ setFlag: 'oathbound.lampwick_saved', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_pie', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:oathbound-the-night-shepherd', name: 'The Night Shepherd', type: 'side', region: Z4, giver: 'npc:gammer-lisle',
    summary: 'Gammer Lisle is the only calm person in the Dimming: she remembers night from before C. 1012. Her flock is out on the hill, and she would like help bringing it in by starlight.',
    requires: req(done('quest:oathbound-the-sorrow-oath')), firstStage: 'flock',
    stages: [
      {
        id: 'flock', journal: 'Three ewes have wandered up the hill in the dark. They are white enough to see, if you look.',
        objectives: [{ id: 'ewes', text: 'Bring in Gammer Lisle’s ewes', interact: 'obj:lisle-ewe-*', count: 3, marker: { landmark: 'landmark:lisle-fold' } }],
        next: 'stars',
      },
      {
        id: 'stars', journal: 'The flock is folded. Gammer Lisle is sitting on the wall, looking up.',
        objectives: [{ id: 'gammer', text: 'Sit with Gammer Lisle under the stars', talk: 'npc:gammer-lisle', marker: { landmark: 'landmark:lisle-fold' } }],
        next: 'names',
      },
      {
        id: 'names', journal: 'Gammer Lisle has given you the old names of the stars, every one, and asked you to carry them to somebody young enough to keep them for another eighty years. There is a girl at Haybright naming stars from scratch.',
        objectives: [{ id: 'clover', text: 'Take Gammer’s star-names to Clover Wheatley', talk: 'npc:clover-wheatley', marker: { landmark: 'landmark:haybright' } }],
        onComplete: [{ setFlag: 'oathbound.names_given', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-march-stars'] },
  },

  // ======================= ACT I: mentor thread (2) and bounties (2)
  {
    ...A1, id: 'quest:oathbound-the-first-oath', name: 'The First Oath', type: 'side', region: Z1, giver: BH,
    summary: 'Oathkeep’s founding oath-stone has worn blank on its face. Beatrix believes the underside, buried for a thousand years, will still say what the first Oathbound swore.',
    requires: req({ trust: BH, value: 'friendly' }, done('quest:oathbound-no-village-alone')), firstStage: 'rubbing',
    stages: [
      {
        id: 'rubbing', journal: 'Dig under the founding oath-stone and take a rubbing of what is carved there. Beatrix has brought charcoal, paper and a spade, and an expression that says she has been wanting to do this for years.',
        objectives: [{ id: 'stone', text: 'Take a rubbing of the founding oath-stone', interact: 'obj:founding-oath-stone', marker: { landmark: 'landmark:oath-stones' } }],
        next: 'beatrix',
      },
      {
        id: 'beatrix', journal: 'The rubbing is black and grey and nearly legible.',
        objectives: [{ id: 'beatrix', text: 'Read the rubbing with Beatrix', talk: BH, marker: { landmark: 'landmark:beatrix-holm-quarters' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, skillPoints: 1, lore: ['lore:hc-first-oath'] },
  },
  {
    ...A1, id: 'quest:oathbound-the-marshals-promise', name: 'The Marshal’s Promise', type: 'side', region: Z1, giver: BH,
    summary: 'In thirty years Ser Beatrix Holm has broken one promise. She has written a letter about it, and is having trouble with the ending.',
    requires: req({ trust: BH, value: 'trusted' }, done('quest:oathbound-the-sorrow-oath')), firstStage: 'drafts',
    stages: [
      {
        id: 'drafts', journal: 'Her quarters are full of crumpled drafts. She has asked you, very stiffly, to read three of them and tell her what is wrong.',
        objectives: [{ id: 'drafts', text: 'Read Beatrix’s crumpled drafts', interact: 'obj:beatrix-draft-*', count: 3, marker: { landmark: 'landmark:beatrix-holm-quarters' } }],
        next: 'finish',
      },
      {
        id: 'finish', journal: 'Eight drafts, all of them true, none of them right. The ninth is still blank.',
        objectives: [{ id: 'beatrix', text: 'Help Beatrix write the ninth draft', talk: BH, marker: { landmark: 'landmark:beatrix-holm-quarters' } }],
        onComplete: [{ setFlag: 'oathbound.beatrix_letter', value: true }, { setFlag: 'oathbound.beatrix_devotable', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:oathbound-bounty-sunfield-acolytes', name: 'Bounty: the Sunfield Acolytes', type: 'bounty', region: Z2, giver: RM,
    summary: 'A band of Zealous Acolytes has gone hollow in the Sunfields and is preaching to the wheat, with sticks.',
    requires: req(done('quest:oathbound-no-village-alone')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'Six of them, singing at the corn. The corn is not converted.', objectives: [{ id: 'acolytes', text: 'Defeat the hollow Sunfield Acolytes', kill: 'bx_radiance_1', count: 6, marker: { place: Z2 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 150 },
  },
  {
    ...A1, id: 'quest:oathbound-bounty-old-grizzleface', name: 'Bounty: Old Grizzleface', type: 'bounty', region: Z2, giver: RM,
    summary: 'The biggest Sun Gargoyle on the chapel roof fell off during the Bell, landed on its feet, and has been walking the Sunfields ever since, flattening wheat.',
    requires: req(done('quest:oathbound-no-village-alone')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'Old Grizzleface. He used to hold up the chapel gutter. He is not holding anything up now.', objectives: [{ id: 'gargoyle', text: 'Bring down Old Grizzleface', kill: 'bx_radiance_2', count: 1, marker: { place: Z2 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 120 },
  },

  // ======================= ACT II: the class thread (C-1 … C-6) + featured bearers
  // depth pass (wave 2): the Shorewatch rota, Petronella at the oars, telling Cuthbert, two more sworn graves,
  // Ilsabet’s candle at Varric’s throne, and Hamish walked to the Gilded Goose with an answer to carry home
  {
    ...A2, id: 'quest:oathbound-abbeyshore', name: 'The Shorewatch', type: 'class', region: 'vil:shore', giver: CL,
    summary: 'Three ancient Oathbound swore in C. 1012 to let no one reach the drowned nave at Abbeyshore. They have kept the shore for thirty years in rusting, dripping armour.',
    requires: req(done('quest:cc-through-the-arch')), autoStart: true, firstStage: 'shore',
    stages: [
      {
        id: 'shore', journal: 'Ysolde says there are Radiance knights at Abbeyshore, standing in the shallows, and that they have been standing there for thirty years.',
        objectives: [{ id: 'cuthbert', text: 'Find the Shorewatch at Abbeyshore', talk: CL, marker: { landmark: 'landmark:oathbound-shorewatch-post' } }],
        next: 'rota',
      },
      {
        id: 'rota', journal: 'Nailed to the Shorewatch post is the watch-rota, kept in three hands for thirty years. Cuthbert is very proud of it. He would like you to read it.',
        objectives: [{ id: 'rota', text: 'Read the Shorewatch’s watch-rota', interact: 'obj:oathbound-shorewatch-rota', marker: { landmark: 'landmark:oathbound-shorewatch-post' } }],
        onComplete: [{ startQuest: 'quest:oathbound-the-shorewatch-oath' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-radiance-abbeyshore', 'lore:hc-radiance-shorewatch'] },
  },
  {
    ...A2, id: 'quest:oathbound-the-shorewatch-oath', name: 'The Shorewatch Oath', type: 'class', region: 'region:abbey', giver: CL,
    summary: 'The Shorewatch will not let you pass. An oath is an oath. But every oath has words in it, and words can be read.',
    requires: req(done('quest:oathbound-abbeyshore')), firstStage: 'oath',
    stages: [
      {
        id: 'oath', journal: 'Three knights, three oaths, one lake. Release them, out-swear them, or find what they forgot.',
        objectives: [
          { id: 'petronella', text: 'Ask Ser Petronella the exact words of her oath', talk: 'npc:petronella-fane', optional: true, marker: { landmark: 'landmark:oathbound-shorewatch-post' } },
          { id: 'oath', text: 'Settle the Shorewatch’s oath', when: { flag: 'oathbound.shorewatch' }, marker: { landmark: 'landmark:oathbound-shorewatch-post' } },
        ],
        next: 'row',
      },
      {
        id: 'row', journal: 'The Shorewatch row you out themselves, three old knights at the oars, creaking. Halfway across, the water starts to sing, and two of the three oars stop.',
        objectives: [{ id: 'petronella', text: 'See who is still rowing', talk: 'npc:petronella-fane', marker: { landmark: 'landmark:shore-boat' } }],
        next: 'nave',
      },
      {
        id: 'nave', journal: 'Petronella has rowed you right over it. Below the boat, the north door of the Abbey stands open.',
        objectives: [{ id: 'nave', text: 'Go down into the drowned nave', reach: 'inst:drowned-abbey', marker: { landmark: 'landmark:abbey-north-door' } }],
        onComplete: [{ startQuest: 'quest:oathbound-abbess-morwen' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:oathbound-abbess-morwen', name: 'Abbess Morwen', type: 'class', region: 'region:abbey', giver: CL,
    summary: 'Abbess Morwen swore to keep the Turning Bell. It rang without her leave, and she has kept her oath against it for thirty years, under the water.',
    requires: req(done('quest:oathbound-the-shorewatch-oath')), firstStage: 'fight',
    stages: [
      {
        id: 'fight', journal: 'Abbess Morwen is the Sentinel of the Radiance school, and of Song. Win her mark.',
        objectives: [{ id: 'morwen', text: 'Defeat Abbess Morwen', kill: 'bx_morwen', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-morwen' }],
        next: 'release',
      },
      {
        id: 'release', journal: 'The Abbess sinks down in the nave, her hands still closed on a bell-rope that is not there.',
        objectives: [{ id: 'mark', text: 'Hear the Abbess out', when: { flag: 'story.sentinel.radiance' } }],
        onComplete: [{ openDialogue: 'dialogue:oathbound-morwen-oath' }],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'The Shorewatch swore to keep everyone from the Abbess for thirty years. Whatever their oath says now, Cuthbert will want a report from the knight who went down.',
        objectives: [{ id: 'cuthbert', text: 'Report to Ser Cuthbert at the Shorewatch post', talk: CL, marker: { landmark: 'landmark:oathbound-shorewatch-post' } }],
        onComplete: [{ startQuest: 'quest:oathbound-the-dames-muster' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-radiance-morwen'] },
  },
  {
    ...A2, id: 'quest:oathbound-the-dames-muster', name: 'The Dame’s Muster', type: 'class', region: 'region:alder', giver: 'npc:hobb',
    summary: 'The graves of Brindlecross are emptying. Old Hobb says the dead walk home, but these ones are walking somewhere else, to someone who is making them swear.',
    requires: req(done('quest:oathbound-abbess-morwen')), firstStage: 'hobb',
    stages: [
      {
        id: 'hobb', journal: 'Old Hobb at the Brindlecross graveyard has been finding things on the empty graves.',
        objectives: [{ id: 'hobb', text: 'Ask Old Hobb about the empty graves', talk: 'npc:hobb', marker: { landmark: 'landmark:brind-graveyard' } }],
        next: 'graves',
      },
      {
        id: 'graves', journal: 'On three of the empty graves, someone has pressed an oath-ring into the soil, turned inward.',
        objectives: [{ id: 'graves', text: 'Read the oath-rings on the empty graves', interact: 'obj:oathbound-oath-grave-*', count: 3, marker: { landmark: 'landmark:brind-graveyard' } }],
        next: 'barrow',
      },
      {
        id: 'barrow', journal: 'The rings all point one way: down, under the moor, to Bonelord Varric’s barrow.',
        objectives: [{ id: 'barrow', text: 'Go down into the Barrowdowns', reach: 'inst:varric-barrow', marker: { landmark: 'landmark:barrow-door' } }],
        onComplete: [{ openDialogue: 'dialogue:oathbound-ilsabet-barrow' }, { startQuest: 'quest:oathbound-bonelord-varric' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-varric'] },
  },
  {
    ...A2, id: 'quest:oathbound-bonelord-varric', name: 'Bonelord Varric', type: 'class', region: 'region:alder', giver: 'npc:hobb',
    summary: 'Bonelord Varric settled the Schools’ War in single combat, and he holds every challenger to the same rules. Ilsabet has sworn his dead muster to the Hollow King, oath by oath.',
    requires: req(done('quest:oathbound-the-dames-muster')), firstStage: 'varric',
    stages: [
      {
        id: 'varric', journal: 'Varric is the Sentinel of the Blade school. He will accept your challenge, by the rules. The Swordsman bearer cannot win the mark while he keeps fighting.',
        onEnter: [{ openDialogue: 'dialogue:oathbound-varric-challenge' }],
        objectives: [{ id: 'varric', text: 'Defeat Bonelord Varric in single combat', kill: 'bx_varric', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-blade' }, { setFlag: 'story.bearer.swordsman', value: true }],
        next: 'release',
      },
      {
        id: 'release', journal: 'Varric has gone down on one knee, and his muster is lying down along the walls.',
        objectives: [{ id: 'mark', text: 'Hear Varric out', when: { flag: 'story.sentinel.blade' } }],
        next: 'candle',
      },
      {
        id: 'candle', journal: 'Ilsabet said she would be waiting further in. She is gone, but at the foot of Varric’s throne of shields a candle has burned down to nothing beside a page in her hand.',
        objectives: [{ id: 'candle', text: 'See what Ilsabet left at Varric’s throne', interact: 'obj:oathbound-ilsabet-candle' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-varric'] },
  },
  {
    ...A2, id: 'quest:oathbound-hamish-delivers', name: 'Hamish Delivers', type: 'class', region: 'vil:brind', giver: BH,
    summary: 'Something has fallen out of the Radiance arch at the Gate Circle with a great deal of clanking. It is wearing an Oathkeep surcoat and swearing about it.',
    requires: req(done('quest:oathbound-bonelord-varric')), autoStart: true, firstStage: 'hamish',
    stages: [
      {
        id: 'hamish', journal: 'Squire Hamish Goodbody is lying on his back at the foot of the Radiance arch, holding a message above his face in both hands.',
        objectives: [{ id: 'hamish', text: 'Collect Beatrix’s message from Hamish at the Gate Circle', talk: 'npc:hamish-at-the-gate', marker: { landmark: 'landmark:gate-circle' } }],
        next: 'escort',
      },
      {
        id: 'escort', journal: 'Hamish swore he would find out whether Concordia has a tavern. It does: the Gilded Goose, across Brindlecross. He can just about walk. The wolves round the Gate Circle can walk rather better. Get him there.',
        onEnter: [{ escort: 'npc:hamish-at-the-gate', to: 'landmark:brind-gilded-goose' }],
        objectives: [{ id: 'hamish', text: 'Bring Squire Hamish safely to the Gilded Goose', when: { any: [{ flag: 'escort.hamish-at-the-gate', op: '==', value: 'arrived' }, { flag: 'escort.hamish-at-the-gate', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:brind-gilded-goose' } }],
        next: [{ when: { flag: 'escort.hamish-at-the-gate', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'reply' }],
      },
      {
        id: 'regroup', journal: 'Hamish went down. Brindlecross folk carried him back to the arch, where he lay on his back and swore he would get there or die trying, again. He is getting up. Slowly.',
        onEnter: [{ escort: 'npc:hamish-at-the-gate', to: 'landmark:brind-gilded-goose' }],
        objectives: [{ id: 'hamish', text: 'Try again: bring Hamish to the Gilded Goose', when: { any: [{ flag: 'escort.hamish-at-the-gate', op: '==', value: 'arrived' }, { flag: 'escort.hamish-at-the-gate', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:brind-gilded-goose' } }],
        next: [{ when: { flag: 'escort.hamish-at-the-gate', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'reply' }],
      },
      {
        id: 'reply', journal: 'Hamish is at a table in the Gilded Goose with a bowl of stew, a bandage and a pencil. He has sworn to carry an answer back to the Marshal. He is waiting for you to give him one.',
        objectives: [{ id: 'reply', text: 'Give Hamish an answer for Beatrix at the Gilded Goose', talk: 'npc:hamish-at-the-gate', marker: { landmark: 'landmark:brind-gilded-goose' } }],
        onComplete: [{ setFlag: 'story.act2_ready', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:oathbound-the-saga-of-the-shorewatch', name: 'The Saga of the Shorewatch', type: 'side', region: 'vil:shore', giver: 'npc:bearer-skald',
    summary: 'The Skald bearer wants to drum the saga of the three old Shorewatch knights before it is lost, and the knights will not tell it themselves. Their shields might.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'shields',
    stages: [
      {
        id: 'shields', journal: 'Three shields leaning on the Shorewatch post, scratched with thirty years of tallies, and older marks under those.',
        objectives: [{ id: 'shields', text: 'Read the Shorewatch shields for the Skald', interact: 'obj:oathbound-shorewatch-shield-*', count: 3, marker: { landmark: 'landmark:oathbound-shorewatch-post' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Sigrid Drumhallow has the saga now, every word. She is beating it out on her knee and will not stop.',
        // co-op: if a party member plays the Skald, they ARE this bearer (the NPC is hidden)
        objectives: [{ id: 'sigrid', text: 'Talk to the Skald bearer', when: { any: [{ flag: 'oathbound.sigrid_thanked' }, { partyHasClass: 'skald' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.skald', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A2, id: 'quest:oathbound-whom-the-sword-serves', name: 'Whom the Sword Serves', type: 'side', region: 'region:alder', giver: 'npc:bearer-samurai',
    summary: 'The Samurai bearer has come to the Barrowdowns to ask Bonelord Varric one question: whom does the sword serve? She will only ask it alone, and someone must keep the door.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'door',
    stages: [
      {
        id: 'door', journal: 'Keep watch at the barrow door while Aiko Hoshida goes down alone.',
        objectives: [{ id: 'watch', text: 'Keep the barrow door for the Samurai bearer', interact: 'obj:oathbound-barrow-watch-stone', marker: { landmark: 'landmark:barrow-door' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'She came up again. She has not said what the answer was.',
        objectives: [{ id: 'aiko', text: 'Talk to the Samurai bearer', when: { any: [{ flag: 'oathbound.aiko_thanked' }, { partyHasClass: 'samurai' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.samurai', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  // ======================= ACT III: class quests (III-4 + 3 side)
  {
    ...A3, id: 'quest:oathbound-the-sorrow-herald', name: 'The Sorrow Herald', type: 'class', region: 'region:heart', giver: 'npc:casimir',
    summary: 'At the top of the Twelve Stairs stands the Hollow King’s Herald, in a robe of black samite, ringing her bell once for every vow she makes. It is Dame Ilsabet, and she announces every blow before she strikes it.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'herald',
    stages: [
      { id: 'herald', journal: 'Ilsabet has become the Sorrow Herald: a vow kept so long that nothing is left of her but the keeping.', objectives: [{ id: 'herald', text: 'Face the Sorrow Herald', kill: 'cb_sorrow-herald', count: 1, marker: { landmark: 'landmark:twelve-stairs-top' } }], onComplete: [{ openDialogue: 'dialogue:oathbound-herald-fate' }], next: 'fate' },
      { id: 'fate', journal: 'Ilsabet has yielded, formally, before witnesses. She is waiting to hear what you will do with it.', objectives: [{ id: 'fate', text: 'Decide Ilsabet’s fate', when: { flag: 'oathbound.nemesis_fate' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 3 },
  },
  {
    ...A3, id: 'quest:oathbound-a-promise-kept-late', name: 'A Promise Kept Late', type: 'side', region: 'region:heart', giver: BH,
    summary: '“Whatever you swore in my Hall, keep it. Mind her.” Beatrix sent that by Hamish. Whatever else of hers you carry, the head of the Radiance stair is where it belongs.',
    requires: req({ flag: 'oathbound.nemesis_fate' }, { flag: 'oathbound.beatrix_message' }), autoStart: true, firstStage: 'grey',
    stages: [
      {
        id: 'grey', journal: 'A grey horse in March harness is standing in the Legion camp among the hollow horses, saddled, as if for a long ride. It is the grey that came through the Dawn Gate behind you.',
        objectives: [{ id: 'grey', text: 'Look at the grey horse in the Legion camp', interact: 'obj:oathbound-ilsabet-grey', marker: { landmark: 'landmark:legion-camp' } }],
        next: 'promise',
      },
      { id: 'promise', journal: 'Thirty years ago Beatrix promised to ride with Ilsabet to the Turning, and stayed behind. Keep the promise for her, late.', objectives: [{ id: 'promise', text: 'Keep Beatrix’s promise at the head of the Radiance stair', interact: 'obj:oathbound-radiance-stair', marker: { landmark: 'landmark:twelve-stairs-top' } }], next: 'ride' },
      {
        id: 'ride', journal: 'The promise was to ride together. The grey has been led down to the Heart camp, where the road home begins. Somebody should see it off.',
        objectives: [{ id: 'ride', text: 'See the grey horse off at the Heart camp', interact: 'obj:oathbound-grey-road', marker: { landmark: 'landmark:heart-camp' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:oathbound-the-sorrow-sworn', name: 'The Sorrow-Sworn', type: 'side', region: 'region:heart', giver: BH,
    summary: 'Knights of the March who swore the Sorrow-Oath after Ilsabet are standing hollow in the Legion camp, with their rings turned inward.',
    requires: req(done('quest:heart-legion')), autoStart: true, firstStage: 'rings',
    stages: [
      { id: 'rings', journal: 'A file of March knights, fists closed, holding on to a fallen lord’s last command.', objectives: [{ id: 'rings', text: 'Turn the Sorrow-Sworn’s rings back', interact: 'obj:oathbound-sorrow-sworn', marker: { landmark: 'landmark:legion-camp' } }], next: 'swords' },
      {
        id: 'swords', journal: 'The Sorrow-Sworn have come to the Heart camp and stacked their swords, the Oathkeep way, each with its ribbon. They cannot remember their own names. The ribbons can.',
        objectives: [{ id: 'swords', text: 'Read the ribbons on the Sorrow-Sworn’s swords', interact: 'obj:oathbound-sworn-swords', marker: { landmark: 'landmark:heart-camp' } }],
        next: 'vigil',
      },
      {
        id: 'vigil', journal: 'A knight without an oath does not know where to stand. The Sorrow-Sworn have climbed to the head of the Radiance stair and are waiting there for somebody to give them one.',
        objectives: [{ id: 'vigil', text: 'Give the Sorrow-Sworn a new oath at the head of the Radiance stair', interact: 'obj:oathbound-sworn-vigil', marker: { landmark: 'landmark:twelve-stairs-top' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A3, id: 'quest:oathbound-ser-gallants-rest', name: 'Ser Gallant’s Rest', type: 'side', region: 'region:heart', giver: 'npc:ser-gallant',
    summary: 'Ser Gallant broke his oath to Ilsabet on the night of the Turning, and could not die of it. With her fate settled, so is his.',
    requires: req({ flag: 'oathbound.nemesis_fate' }), autoStart: true, firstStage: 'kit',
    stages: [
      {
        id: 'kit', journal: 'Every night at the Heart camp something keeps watch over your kit, the way a squire keeps watch over a knight’s, and by morning it has gone. Nobody in the camp will own to it.',
        objectives: [{ id: 'kit', text: 'Find out who has been squiring for you at the Heart camp', interact: 'obj:oathbound-squired-kit', marker: { landmark: 'landmark:heart-camp' } }],
        next: 'rest',
      },
      { id: 'rest', journal: 'At the edge of the Legion camp, something of Ser Gallant’s is waiting for you.', objectives: [{ id: 'rest', text: 'Let Ser Gallant rest', interact: 'obj:oathbound-gallant-rest', marker: { landmark: 'landmark:legion-camp' } }], next: 'farewell' },
      {
        id: 'farewell', journal: 'A knight of the March is laid out with his sword on his breast and his lord’s name said over him. Ser Gallant’s lord stood at the head of the Radiance stair.',
        objectives: [{ id: 'farewell', text: 'Give Ser Gallant a knight’s farewell at the head of the Radiance stair', interact: 'obj:oathbound-gallant-farewell', marker: { landmark: 'landmark:twelve-stairs-top' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
];

export default quests;
