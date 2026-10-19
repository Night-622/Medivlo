/**
 * Hollow Crown: the WARDEN campaign (docs/lore/hollow-crown/06-outlines/rime.md). Act I on the Wardwall
 * (area:rime-frontier) and the Act II class thread in Concordia. Owner: Claude 4.
 */
import type { NarrativeCondition, QuestDef } from '@/core';

const WD: NarrativeCondition = { heroClass: 'warden' };
const done = (q: `quest:${string}`): NarrativeCondition => ({ questCompleted: q });
const req = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: [WD, ...c] });
const A1 = { act: 'act1' as const, campaign: 'warden', chapter: 'The Wardwall' };
const A2 = { act: 'act2' as const, campaign: 'warden', chapter: 'Concordia' };
const A3 = { act: 'act3' as const, campaign: 'warden', chapter: 'The Heart' };
const Z1 = 'zone:rime-frontier-1' as const, Z2 = 'zone:rime-frontier-2' as const, Z3 = 'zone:rime-frontier-3' as const, Z4 = 'zone:rime-frontier-4' as const;
const L1 = 'inst:rime-frontier-lair-1' as const, L2 = 'inst:rime-frontier-lair-2' as const, L3 = 'inst:rime-frontier-lair-3' as const;
const DO = 'npc:dagny-orr' as const;

const quests: QuestDef[] = [
  // ======================= ACT I: main (I-1 … I-10)
  {
    ...A1, id: 'quest:warden-the-horn-at-midnight', name: 'The Horn at Midnight', type: 'main', region: Z1, giver: DO,
    summary: 'Night watch at the Gatehouse. Somewhere far away a bell rang, and the Wall-Captain heard a horn, and turned out the whole fortress in its nightshirts.',
    requires: WD, autoStart: true, firstStage: 'wolves',
    stages: [
      {
        id: 'wolves', journal: 'Half the Gatehouse is in its nightshirts, and Snow Wolves are coming over the drifts anyway. Hold the drill yard.',
        onEnter: [{ openDialogue: 'dialogue:warden-horn-night' }],
        objectives: [{ id: 'wolves', text: 'Hold the drill yard against the Snow Wolves', kill: 'bx_rime_0', count: 4, marker: { landmark: 'landmark:wardwall-drill-yard' } }],
        onComplete: [{ openDialogue: 'dialogue:warden-wall-song' }],
        next: 'dagny',
      },
      {
        id: 'dagny', journal: 'The wolves are gone. Something is singing out past the Breach, and only you can hear it.',
        objectives: [{ id: 'dagny', text: 'Report to Dagny in the drill yard', talk: DO, marker: { landmark: 'landmark:wardwall-drill-yard' } }],
        onComplete: [{ setFlag: 'warden.bell_heard', value: true }],
        next: 'heads',
      },
      {
        id: 'heads', journal: 'Thirty-seven Wardens in the drill yard, and there should be forty. Dagny wants every head counted before dawn, nightshirt or no nightshirt.',
        objectives: [{ id: 'heads', text: 'Find the three Wardens who never turned out', interact: 'obj:warden-missing-warden-*', count: 3, marker: { place: Z1 } }],
        next: 'quarters',
      },
      {
        id: 'quarters', journal: 'Forty of forty. Dagny has gone up to her quarters with a lamp, and for once she has left the door open.',
        objectives: [{ id: 'dagny', text: 'Report the count to Dagny in her quarters', talk: DO, marker: { landmark: 'landmark:dagny-orr-quarters' } }],
        onComplete: [{ startQuest: 'quest:warden-the-watch-fires' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-frostmere', 'lore:hc-wardens-of-the-wall'] },
  },
  {
    ...A1, id: 'quest:warden-the-watch-fires', name: 'The Watch-Fires', type: 'main', region: Z2, giver: DO,
    summary: 'The watch-fires on the Long Rampart keep going out, one a night. Dagny wants to know why, and she wants to know it loudly.',
    requires: req(done('quest:warden-the-horn-at-midnight')), firstStage: 'fires',
    stages: [
      {
        id: 'fires', journal: 'Six watch-fires along the Long Rampart. Find out what is putting them out.',
        objectives: [{ id: 'fires', text: 'Check the watch-fires on the Long Rampart', interact: 'obj:watch-fire-*', count: 6, marker: { place: Z2 } }],
        next: 'seep',
      },
      {
        id: 'seep', journal: 'The black water is coming up through the stones of the wall itself. Dagny will want to know where from. Follow the seep along the inside of the Rampart.',
        objectives: [{ id: 'seep', text: 'Trace the black seep along the Rampart', interact: 'obj:warden-seep-crack-*', count: 3, marker: { place: Z2 } }],
        next: 'report',
      },
      {
        id: 'report', journal: 'Black tears are seeping up through the stones and drowning the fires. And at the last fire there were children, on the wrong side of the wall.',
        objectives: [{ id: 'dagny', text: 'Report to Dagny', talk: DO, marker: { landmark: 'landmark:dagny-orr-quarters' } }],
        onComplete: [{ startQuest: 'quest:warden-the-jarls-longhall' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:warden-the-jarls-longhall', name: 'The Jarl’s Longhall', type: 'main', region: Z4, giver: DO,
    summary: 'Raiders keep taking the Wall’s supply sledges. Dagny is sending you over the wall to find out who leads them. You have never been over the wall.',
    requires: req(done('quest:warden-the-watch-fires')), firstStage: 'over',
    stages: [
      {
        id: 'over', journal: 'Through the postern and down into the Jarlsfell, where the winter the wall keeps out comes down on everyone else.',
        objectives: [{ id: 'over', text: 'Go over the wall into the Jarlsfell', reach: Z4, marker: { landmark: 'landmark:wall-postern' } }],
        next: 'hall',
      },
      {
        id: 'hall', journal: 'Every sledge-track in the Jarlsfell leads to one longhall, its roof sagging under the snow.',
        objectives: [{ id: 'enter', text: 'Enter the Jarl’s Longhall', reach: L1, marker: { place: Z4 } }],
        next: 'jarl',
      },
      {
        id: 'jarl', journal: 'The Frostbound Jarl has frozen to his high seat. His hall fights for him. Break the ice that binds him.',
        objectives: [{ id: 'jarl', text: 'Defeat the Frostbound Jarl', kill: 'bx_rime_3', count: 1 }],
        next: 'cauldron',
      },
      {
        id: 'cauldron', journal: 'The Jarl’s black tears have dripped into the mead-cauldron for a year, and his hall-folk have been drinking it.',
        objectives: [{ id: 'cauldron', text: 'Empty the Jarl’s mead-cauldron', interact: 'obj:jarl-mead-cauldron' }],
        next: 'report',
      },
      {
        id: 'report', journal: 'The Jarl is gone. His hall-folk are starving, and nobody leads the clans now.',
        objectives: [{ id: 'dagny', text: 'Report to Dagny', talk: DO, marker: { landmark: 'landmark:dagny-orr-quarters' } }],
        onComplete: [{ setFlag: 'warden.jarl_down', value: true }, { startQuest: 'quest:warden-the-wallbreakers-parley' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 80, hcItems: [{ item: 'i_hp_s', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:warden-the-wallbreakers-parley', name: 'The Wallbreaker’s Parley', type: 'main', region: Z3, giver: 'npc:torvald-wallbreaker',
    summary: 'With the Jarl gone, someone has come down the Wolfrun Passes under a parley-flag to lead the clans. It is the man who taught you to set a shield.',
    requires: req(done('quest:warden-the-jarls-longhall')), firstStage: 'parley',
    stages: [
      {
        id: 'parley', journal: 'Torvald Wallbreaker is waiting at the parley cairn in the Wolfrun, under a white flag.',
        objectives: [{ id: 'torvald', text: 'Meet Torvald under the parley-flag', talk: 'npc:torvald-wallbreaker', marker: { landmark: 'landmark:wolfrun-parley-cairn' } }],
        next: 'camp',
      },
      {
        id: 'camp', journal: '“Don’t take my word for it. Go and look.” The clans are camped in a fold of the Wolfrun, below the cairn, around three fires.',
        objectives: [{ id: 'fires', text: 'Walk through the clans’ camp in the Wolfrun', interact: 'obj:warden-clan-fire-*', count: 3, marker: { landmark: 'landmark:warden-clan-camp' } }],
        next: 'dagny',
      },
      {
        id: 'dagny', journal: 'He asked for one sledge of grain. Dagny will have to hear it, and she will hear it at full volume.',
        objectives: [{ id: 'dagny', text: 'Tell Dagny what Torvald asked', talk: DO, marker: { landmark: 'landmark:dagny-orr-quarters' } }],
        onComplete: [{ setFlag: 'warden.torvald_parley', value: true }, { startQuest: 'quest:warden-the-wall-moot' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-outland-clans', 'lore:hc-torvald'] },
  },
  {
    ...A1, id: 'quest:warden-the-wall-moot', name: 'The Wall Moot', type: 'main', region: Z1, giver: DO,
    summary: 'The Wardens are meeting in the drill yard to decide whether to open the postern to the clans. Every Warden gets a voice. Dagny will hear most of them.',
    requires: req(done('quest:warden-the-wallbreakers-parley')), firstStage: 'canvass',
    stages: [
      {
        id: 'canvass', journal: 'Before the moot, hear the two Wardens who will have to live with the answer: the sergeant who holds the yard, and the old woman on the furthest fire, who can see every light in the Jarlsfell.',
        objectives: [
          { id: 'kettil', text: 'Hear Sergeant Kettil out', talk: 'npc:kettil-rask', marker: { landmark: 'landmark:wardwall-drill-yard' } },
          { id: 'ingrith', text: 'Hear Old Ingrith out', talk: 'npc:ingrith-halfmile', marker: { landmark: 'landmark:last-watch-fire' } },
        ],
        next: 'moot',
      },
      {
        id: 'moot', journal: 'The moot gathers in the drill yard by torchlight. The clans are waiting on the other side of the wall for the answer.',
        objectives: [{ id: 'moot', text: 'Speak at the Wall Moot', when: { flag: 'warden.postern' }, marker: { landmark: 'landmark:wardwall-drill-yard' } }],
        next: [{ when: { flag: 'warden.postern', value: 'hold' }, to: 'after' }, { to: 'postern' }],
      },
      {
        id: 'postern', journal: 'The moot has spoken. Somebody has to draw the bolts on the postern, and it is going to be you.',
        objectives: [{ id: 'postern', text: 'Open the postern', reach: 'landmark:wall-postern', marker: { landmark: 'landmark:wall-postern' } }],
        next: 'after',
      },
      {
        id: 'after', journal: 'Whatever the moot decided, there are lights in the Wraith Barrows tonight, and nobody has been buried there in a hundred years.',
        objectives: [],
        onComplete: [{ startQuest: 'quest:warden-the-wraith-barrows' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A1, id: 'quest:warden-the-wraith-barrows', name: 'The Wraith Barrows', type: 'main', region: Z3, giver: DO,
    summary: 'The Wardens’ dead are stirring. The wall’s founder has risen from his barrow to drive out an enemy, though he can no longer say which side of the wall it is on.',
    requires: req(done('quest:warden-the-wall-moot')), firstStage: 'barrows',
    stages: [
      {
        id: 'barrows', journal: 'The Wraith Barrows lie below the Wolfrun, where the first hundred Wardens were buried with their shields.',
        objectives: [{ id: 'enter', text: 'Go down into the Wraith Barrows', reach: L2, marker: { place: Z3 } }],
        next: 'founder',
      },
      {
        id: 'founder', journal: 'The Hundredth Warden has planted a line across his barrow, and nothing crosses it. Block him until his shield arm drops.',
        objectives: [{ id: 'founder', text: 'Defeat the Hundredth Warden', kill: 'cb_hundredth-warden', count: 1 }],
        next: 'rest',
      },
      {
        id: 'rest', journal: 'The founder has knelt in his own barrow. He wants to ask you something.',
        objectives: [{ id: 'rest', text: 'Hear the Hundredth Warden', interact: 'obj:hundredth-warden-rest' }],
        onComplete: [{ setFlag: 'warden.hundredth_rest', value: true }, { startQuest: 'quest:warden-the-empty-banner' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 120 },
  },
  {
    ...A1, id: 'quest:warden-the-empty-banner', name: 'The Empty Banner', type: 'main', region: Z2, giver: DO,
    summary: 'Torvald has come back to the Breach by night, with the clans behind him and the hollowed beside them.',
    requires: req(done('quest:warden-the-wraith-barrows')), firstStage: 'attack',
    stages: [
      {
        id: 'attack', journal: 'Hollowed are coming up the ice at the Breach. Hold the Rampart.',
        onEnter: [{ openDialogue: 'dialogue:warden-night-attack' }],
        objectives: [{ id: 'hollowed', text: 'Hold the Rampart against the hollowed', kill: 'bx_hollowed', count: 5, marker: { place: Z2 } }],
        next: 'field',
      },
      {
        id: 'field', journal: 'Three of the hollowed fell on the ice below the Breach. They were Wardens once. You knew them.',
        objectives: [{ id: 'fallen', text: 'Search the fallen on the ice below the Breach', interact: 'obj:warden-fallen-hollowed-*', count: 3, marker: { landmark: 'landmark:warden-breach-ice' } }],
        next: 'dagny',
      },
      {
        id: 'dagny', journal: 'They fell back into the dark beyond the Breach. Torvald was shouting something over the wind, and Dagny didn’t hear it. You did.',
        objectives: [{ id: 'dagny', text: 'Tell Dagny what Torvald wants', talk: DO, marker: { landmark: 'landmark:dagny-orr-quarters' } }],
        onComplete: [{ setFlag: 'warden.torvald_known', value: true }, { startQuest: 'quest:warden-the-breach' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-empty-banner'] },
  },
  {
    ...A1, id: 'quest:warden-the-breach', name: 'The Breach', type: 'main', region: L3, giver: DO,
    summary: 'The Wall half is frozen into the ice that patches the Breach. Torvald means to tear it out and bring the whole Wardwall down.',
    requires: req(done('quest:warden-the-empty-banner')), firstStage: 'breach',
    stages: [
      {
        id: 'breach', journal: 'The Breach, where the wall was broken last winter and patched with ice. The half-stone has been singing in it the whole time.',
        objectives: [{ id: 'enter', text: 'Go to the Breach', reach: L3, marker: { place: Z2 } }],
        next: 'torvald',
      },
      {
        id: 'torvald', journal: 'Shield against shield. He tears blocks out of the Breach to let the wolves in. Shove him into the gaps.',
        objectives: [{ id: 'torvald', text: 'Face Torvald Wallbreaker', kill: 'cb_torvald-wallbreaker', count: 1 }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'Torvald has fallen back through the Breach. The Wall half is in the ice, and it will only come out for you.',
        objectives: [{ id: 'stone', text: 'Cut the Wall half out of the Breach', interact: 'obj:rime-frontier-halfstone' }],
        onComplete: [{ setFlag: 'warden.halfstone', value: true }, { startQuest: 'quest:warden-the-long-walk' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, skillPoints: 1, lore: ['lore:hc-half-stones', 'lore:hc-wardwall'] },
  },
  {
    ...A1, id: 'quest:warden-the-long-walk', name: 'The Long Walk', type: 'main', region: Z1, giver: DO,
    summary: 'Torvald is walking south at the head of the clans, through the passes, towards the White Gate. Dagny means to walk you there herself.',
    requires: req(done('quest:warden-the-breach')), firstStage: 'farewell',
    stages: [
      {
        id: 'farewell', journal: 'Dagny is in her quarters with her shield across her knees and her horn on the table.',
        objectives: [{ id: 'dagny', text: 'Walk with Dagny', talk: DO, marker: { landmark: 'landmark:dagny-orr-quarters' } }],
        next: 'walk',
      },
      {
        id: 'walk', journal: 'Dagny is walking you south herself, down the gate road, as far as the Wardens’ boundary stone. She says it is regulation. It isn’t.',
        objectives: [{ id: 'stone', text: 'Walk with Dagny to the boundary stone', reach: 'landmark:warden-boundary-stone', marker: { landmark: 'landmark:warden-boundary-stone' } }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'The boundary stone, halfway to the gate. No Wall-Captain has ever gone past it on duty. Dagny has stopped walking.',
        objectives: [{ id: 'dagny', text: 'Say goodbye to Dagny at the boundary stone', talk: DO, marker: { landmark: 'landmark:warden-boundary-stone' } }],
        next: 'road',
      },
      {
        id: 'road', journal: 'South, through the Wolfrun, to the White Gate. Torvald’s tracks are a mile wide.',
        objectives: [{ id: 'gate', text: 'Walk to the White Gate', reach: 'area:rime-gate', marker: { place: 'area:rime-gate' } }],
        onComplete: [{ startQuest: 'quest:warden-the-white-gate' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:warden-the-white-gate', name: 'The White Gate (Wall side)', type: 'main', region: 'area:rime-gate', giver: DO,
    summary: 'The Winter Tyrant, the Archive’s answer to the cold, stands hollow at the White Gate. In a thousand years it never once came to the Wall’s aid.',
    requires: req(done('quest:warden-the-long-walk')), firstStage: 'tyrant',
    stages: [
      {
        id: 'tyrant', journal: 'It drives the blizzard down the road in waves. Brace, wall off with the shield, and advance between them.',
        objectives: [{ id: 'tyrant', text: 'Break the Winter Tyrant’s crown', kill: 'bx_rime_5', count: 1 }],
        next: 'gate',
      },
      {
        id: 'gate', journal: 'The tears have gone out of the Tyrant. It is waiting for a Warden’s word. Behind it, the gate weeps.',
        objectives: [{ id: 'seal', text: 'Decide, and open the White Gate', interact: 'obj:rime-gate-seal' }],
        onComplete: [{ setFlag: 'story.gate_open', value: true }, { setFlag: 'story.act', value: 2 }, { setFlag: 'warden.act1_done', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 200, lore: ['lore:hc-realm-gates', 'lore:hc-winter-tyrant'] },
  },

  // ======================= ACT I: side quests (2 per zone)
  {
    ...A1, id: 'quest:warden-the-misheard-orders', name: 'The Misheard Orders', type: 'side', region: Z1, giver: 'npc:clemmie-briggs',
    summary: 'Nobody has dared ask the Wall-Captain to repeat herself in twenty years. There is a squad behind the stables digging a moat, because she asked for a boat.',
    requires: req(done('quest:warden-the-horn-at-midnight')), firstStage: 'orders',
    stages: [
      {
        id: 'orders', journal: 'Three of Dagny’s orders have gone very wrong. Untangle them before she notices.',
        objectives: [
          { id: 'moat', text: 'Stop the squad digging the moat', interact: 'obj:misheard-moat', marker: { place: Z1 } },
          { id: 'cake', text: 'Stop the squad baking the cook', interact: 'obj:misheard-cake', marker: { place: Z1 } },
          { id: 'hedge', text: 'Stop the squad polishing the thorns', interact: 'obj:misheard-hedge', marker: { place: Z1 } },
        ],
        next: 'clemmie',
      },
      {
        id: 'clemmie', journal: 'One boat, one woken cook, and one set of polished horns. Dagny noticed none of it.',
        objectives: [{ id: 'clemmie', text: 'Tell Clemmie it’s sorted', talk: 'npc:clemmie-briggs', marker: { landmark: 'landmark:wardwall-drill-yard' } }],
        next: 'again',
      },
      {
        id: 'again', journal: 'On Clemmie’s first day the Captain said something to her, and she has never known what. Somebody has to ask Dagny to say it again. Clemmie has decided that somebody is you.',
        objectives: [{ id: 'dagny', text: 'Ask Dagny what she said to Clemmie', talk: DO, marker: { landmark: 'landmark:dagny-orr-quarters' } }],
        onComplete: [{ setFlag: 'warden.clemmie_asked', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:warden-the-ration-ledger', name: 'The Ration Ledger', type: 'side', region: Z1, giver: 'npc:ebbe-strand',
    summary: 'Quartermaster Ebbe Strand’s sums have not added up for a year. He would like you not to look at them. So you should probably look at them.',
    requires: req(done('quest:warden-the-watch-fires')), firstStage: 'ledger',
    stages: [
      {
        id: 'ledger', journal: 'The Wardwall’s ration ledger, in the stores. Find out where the missing bread goes.',
        objectives: [{ id: 'ledger', text: 'Read the ration ledger', interact: 'obj:ration-ledger', marker: { landmark: 'landmark:wardwall-stores' } }],
        next: 'ebbe',
      },
      {
        id: 'ebbe', journal: 'The bread goes over the wall, a sack a night, to the clans. Ebbe will want to know what you mean to do about it.',
        objectives: [{ id: 'ebbe', text: 'Talk to Ebbe', talk: 'npc:ebbe-strand', marker: { landmark: 'landmark:wardwall-stores' } }],
        next: 'drop',
      },
      {
        id: 'drop', journal: 'Every night a sack goes down a rope at the foot of the Rampart, and somebody on the other side is waiting for it. Go down to the drop, after dark, and see who.',
        objectives: [{ id: 'drop', text: 'Go to the bread drop below the Rampart, at night', when: { flag: 'warden.bread_drop' }, marker: { landmark: 'landmark:warden-bread-drop' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50 },
  },
  {
    ...A1, id: 'quest:warden-the-last-watch-fire', name: 'The Last Watch-Fire', type: 'side', region: Z2, giver: 'npc:ingrith-halfmile',
    summary: 'Old Ingrith Halfmile has kept the furthest watch-fire on the Long Rampart alone for forty years, and nobody has ever once relieved her.',
    requires: req(done('quest:warden-the-watch-fires')), firstStage: 'watch',
    stages: [
      {
        id: 'watch', journal: 'Take Ingrith’s watch for one night, so she can sleep in a bed. Keep the fire. Watch the dark.',
        objectives: [{ id: 'watch', text: 'Keep the last watch-fire through the night', when: { flag: 'warden.watch_kept' }, marker: { landmark: 'landmark:last-watch-fire' } }],
        next: 'lamp',
      },
      {
        id: 'lamp', journal: 'Just before dawn, one light went out: a single lamp low under the wall on the far side, the one Ingrith always counts first. Go over and see why, before she comes back.',
        objectives: [{ id: 'lamp', text: 'Find the lamp that went out below the wall', interact: 'obj:warden-far-lamp', marker: { landmark: 'landmark:warden-far-lamp' } }],
        next: 'ingrith',
      },
      {
        id: 'ingrith', journal: 'Dawn on the Long Rampart. Ingrith is coming back up the steps, slowly, looking better than you have ever seen her.',
        objectives: [{ id: 'ingrith', text: 'Hand the fire back to Ingrith', talk: 'npc:ingrith-halfmile', marker: { landmark: 'landmark:last-watch-fire' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_cake' }] },
  },
  {
    ...A1, id: 'quest:warden-letters-over-the-wall', name: 'Letters Over the Wall', type: 'side', region: Z2, giver: 'npc:tilda-quarrel',
    summary: 'The Wardens have been shooting letters tied to arrows over the wall to their kin in the Jarlsfell. Officially, they haven’t. The replies are frozen in the drifts.',
    requires: req(done('quest:warden-the-watch-fires')), firstStage: 'replies',
    stages: [
      {
        id: 'replies', journal: 'The clans tie their replies to stones and throw them back. They land short, in the drifts below the Rampart.',
        objectives: [{ id: 'replies', text: 'Collect the frozen replies', interact: 'obj:frozen-reply-*', count: 4, marker: { place: Z2 } }],
        next: 'tilda',
      },
      {
        id: 'tilda', journal: 'A satchel of letters. There are far more of them than anybody on the Wall admits.',
        objectives: [{ id: 'tilda', text: 'Bring the letters to Tilda', talk: 'npc:tilda-quarrel', marker: { landmark: 'landmark:rampart-bowyers-post' } }],
        next: 'captain',
      },
      {
        id: 'captain', journal: 'One of the letters is for the Captain, and it isn’t signed. Tilda will not be the one who gives it to her. You will.',
        objectives: [{ id: 'dagny', text: 'Give the unsigned letter to Dagny', talk: DO, marker: { landmark: 'landmark:dagny-orr-quarters' } }],
        onComplete: [{ setFlag: 'warden.captains_letter', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50 },
  },
  {
    ...A1, id: 'quest:warden-the-white-pack', name: 'The White Pack', type: 'side', region: Z3, giver: 'npc:white-pack-alpha',
    summary: 'A Snow Wolf alpha who is not hollow is holding the mouth of her den against wolves who are.',
    requires: req(done('quest:warden-the-watch-fires')), firstStage: 'hollow',
    stages: [
      {
        id: 'hollow', journal: 'Stand at the den mouth beside her. The hollow ones have black in their eyes. The white ones don’t.',
        objectives: [{ id: 'wolves', text: 'Drive off the hollow wolves', kill: 'bx_rime_0', count: 5, marker: { landmark: 'landmark:white-pack-den' } }],
        next: 'alpha',
      },
      {
        id: 'alpha', journal: 'The hollow wolves are gone. The alpha has not taken her eyes off you.',
        objectives: [{ id: 'alpha', text: 'Go back to the alpha', talk: 'npc:white-pack-alpha', marker: { landmark: 'landmark:white-pack-den' } }],
        onComplete: [{ setFlag: 'warden.white_pack', value: true }],
        next: 'pup',
      },
      {
        id: 'pup', journal: 'One of the pups followed you all the way back to the Gatehouse. It is in the mess kitchen. The cook is standing on a table.',
        objectives: [{ id: 'pup', text: 'Deal with the wolf pup in the Gatehouse kitchen', interact: 'obj:warden-stray-pup', marker: { place: Z1 } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_hide', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:warden-out-of-the-hour', name: 'Out of the Hour', type: 'side', region: Z3, giver: 'npc:signy-frosk',
    summary: 'A family who walked out of Glacierhome’s held hour is snowed in in the Wolfrun Passes. The grandmother is younger than her daughter.',
    requires: req(done('quest:warden-the-jarls-longhall')), firstStage: 'wolves',
    stages: [
      {
        id: 'wolves', journal: 'Wolves are circling the snowed-in hut. Clear the road to the Gatehouse.',
        objectives: [{ id: 'wolves', text: 'Clear the wolves from the pass road', kill: 'bx_rime_0', count: 3, marker: { landmark: 'landmark:wolfrun-snowed-hut' } }],
        next: 'home',
      },
      {
        id: 'home', journal: 'The Frosks have walked down to the Gatehouse behind your shield, arguing about whose turn it is to be carried.',
        objectives: [{ id: 'signy', text: 'See the Frosks safe into the Gatehouse', talk: 'npc:signy-frosk', marker: { landmark: 'landmark:wardwall-drill-yard' } }],
        next: 'grave',
      },
      {
        id: 'grave', journal: 'Signy’s husband Leif walked out of the hour the same year as their daughter, to join the Wardens. He has been dead for nine years. He is buried in the cairn-field below the Wolfrun, and Signy would like him told she came.',
        objectives: [{ id: 'cairn', text: 'Find Leif Frosk’s cairn below the Wolfrun', interact: 'obj:warden-leif-cairn', marker: { landmark: 'landmark:warden-cairn-field' } }],
        onComplete: [{ setFlag: 'warden.leif_cairn', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40, lore: ['lore:hc-out-of-the-hour'] },
  },
  {
    ...A1, id: 'quest:warden-the-steading-oven', name: 'The Steading Oven', type: 'side', region: Z4, giver: 'npc:grandam-hekla',
    summary: 'The communal oven at the biggest steading in the Jarlsfell has cracked in the cold. The clan children have not eaten anything hot in a month.',
    requires: req(done('quest:warden-the-jarls-longhall')), firstStage: 'stones',
    stages: [
      {
        id: 'stones', journal: 'Hekla wants three firestones from the old cairns on the fell, the kind that hold heat all night.',
        objectives: [{ id: 'stones', text: 'Find firestones for the steading oven', interact: 'obj:oven-firestone-*', count: 3, marker: { place: Z4 } }],
        next: 'hekla',
      },
      {
        id: 'hekla', journal: 'Three firestones, warm through your gloves.',
        objectives: [{ id: 'hekla', text: 'Mend the oven with Grandam Hekla', talk: 'npc:grandam-hekla', marker: { landmark: 'landmark:jarlsfell-steading-oven' } }],
        onComplete: [{ setFlag: 'warden.hekla_met', value: true }],
        next: 'repaid',
      },
      {
        id: 'repaid', journal: 'The first loaf out of the mended oven is not for the steading. Hekla says somebody on the Wall has been feeding her children for a year, and the clans pay their debts. Take it to the quartermaster.',
        objectives: [{ id: 'ebbe', text: 'Take Hekla’s loaf to the Wardwall quartermaster', talk: 'npc:ebbe-strand', marker: { landmark: 'landmark:wardwall-stores' } }],
        onComplete: [{ setFlag: 'warden.loaf_repaid', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_bread', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:warden-the-goat-that-crosses-walls', name: 'The Goat That Crosses Walls', type: 'side', region: Z4, giver: 'npc:old-gubbins',
    summary: 'A clan goat called Old Gubbins has climbed the Wardwall twice a day for years. He is the only thing that crosses it freely, and he does not use the postern.',
    requires: req(done('quest:warden-the-jarls-longhall')), firstStage: 'follow',
    stages: [
      {
        id: 'follow', journal: 'Old Gubbins is setting off for his evening crossing. Follow him, at a respectful distance, because he bites.',
        objectives: [{ id: 'stair', text: 'Follow Old Gubbins over the wall', reach: 'landmark:goat-stair', marker: { landmark: 'landmark:goat-stair' } }],
        next: 'gubbins',
      },
      {
        id: 'gubbins', journal: 'A stair of footholds cut into the wall a hundred years ago and forgotten. It goes up, and over, and down, close by the Breach.',
        objectives: [{ id: 'gubbins', text: 'Catch up with Old Gubbins at the top', talk: 'npc:old-gubbins', marker: { landmark: 'landmark:goat-stair' } }],
        onComplete: [{ setFlag: 'warden.goat_stair', value: true }],
        next: 'cache',
      },
      {
        id: 'cache', journal: 'Gubbins went down the far side as if he had an appointment. At the foot of the stair, close by the Breach, there is a niche in the wall that a goat could not possibly have built.',
        objectives: [{ id: 'cache', text: 'Search the niche at the foot of the goat stair', interact: 'obj:warden-smugglers-niche', marker: { landmark: 'landmark:warden-stair-foot' } }],
        onComplete: [{ setFlag: 'warden.smugglers_niche', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 30 },
  },

  // ======================= ACT I: mentor thread (2) and bounties (2)
  {
    ...A1, id: 'quest:warden-the-long-horn', name: 'The Long Horn', type: 'side', region: Z1, giver: DO,
    summary: 'Everyone on the Wall knows the Captain is half deaf. Nobody knows that she did it to herself, on purpose, for three nights in C. 1012.',
    requires: req({ trust: DO, value: 'friendly' }, done('quest:warden-the-wallbreakers-parley')), firstStage: 'story',
    stages: [
      {
        id: 'story', journal: 'Sit with Dagny in her quarters. Speak up.',
        objectives: [{ id: 'dagny', text: 'Ask Dagny about the Long Horn', talk: DO, marker: { landmark: 'landmark:dagny-orr-quarters' } }],
        next: 'chest',
      },
      {
        id: 'chest', journal: 'The old Wall-Captain was buried in the Wraith Barrows with a sealed chest. Dagny thinks the charter is in it.',
        objectives: [{ id: 'chest', text: 'Open the old Wall-Captain’s chest', interact: 'obj:wall-charter-chest', marker: { place: Z3 } }],
        next: 'dagny',
      },
      {
        id: 'dagny', journal: 'The Wall Charter, in the founder’s own hand.',
        objectives: [{ id: 'charter', text: 'Bring the charter to Dagny', talk: DO, marker: { landmark: 'landmark:dagny-orr-quarters' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, skillPoints: 1, lore: ['lore:hc-wall-charter'] },
  },
  {
    ...A1, id: 'quest:warden-a-captains-sister', name: 'A Captain’s Sister', type: 'side', region: Z4, giver: DO,
    summary: 'Dagny has a sister on the far side of the wall, and has not spoken to her in thirty years. You have met her. She runs the argument at the steading oven.',
    requires: req({ trust: DO, value: 'trusted' }, done('quest:warden-the-steading-oven')), firstStage: 'steading',
    stages: [
      {
        id: 'steading', journal: 'Dagny has agreed to come. She has not agreed to like it. Walk her to the steading oven.',
        objectives: [{ id: 'oven', text: 'Bring Dagny to the steading oven', reach: 'landmark:jarlsfell-steading-oven', marker: { landmark: 'landmark:jarlsfell-steading-oven' } }],
        onComplete: [{ openDialogue: 'dialogue:warden-sisters' }],
        next: 'laugh',
      },
      {
        id: 'laugh', journal: 'Two old women, one oven, thirty years. Stand between them until one of them laughs.',
        objectives: [{ id: 'laugh', text: 'Stand between the sisters until one of them laughs', when: { flag: 'warden.sisters_laughed' }, marker: { landmark: 'landmark:jarlsfell-steading-oven' } }],
        onComplete: [{ setFlag: 'warden.dagny_devotable', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:warden-bounty-wolfrun-pack', name: 'Bounty: the Wolfrun Pack', type: 'bounty', region: Z3, giver: 'npc:kettil-rask',
    summary: 'A hollow Snow Wolf pack has been running the Wolfrun Passes, taking sledge-ponies. The Gatehouse pays by the pelt.',
    requires: req(done('quest:warden-the-watch-fires')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'Six of them, with black in their eyes.', objectives: [{ id: 'wolves', text: 'Defeat the Wolfrun pack', kill: 'bx_rime_0', count: 6, marker: { place: Z3 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 150 },
  },
  {
    ...A1, id: 'quest:warden-bounty-rampart-sentry', name: 'Bounty: the Rampart Sentry', type: 'bounty', region: Z2, giver: 'npc:kettil-rask',
    summary: 'A hollow Ice Sentry is walking the Long Rampart, shoving Wardens off it. It has shoved four. Two of them landed in snow.',
    requires: req(done('quest:warden-the-watch-fires')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'It walks the Rampart at a steady pace, and it does not stop for anyone.', objectives: [{ id: 'sentry', text: 'Stop the Rampart Sentry', kill: 'bx_rime_2', count: 1, marker: { place: Z2 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 120 },
  },

  // ======================= ACT II: the class thread (C-1 … C-6) + featured bearers
  // depth pass (wave 2): the gate log, the turn-back stone, telling Ingeborg, escorting Thyri to Torvald's table,
  // Torvald's shield in the glade, and an answer blown north from the Warden's Gate
  {
    ...A2, id: 'quest:warden-wardenhold', name: 'Wardenhold', type: 'class', region: 'vil:warden', giver: 'npc:ingeborg-tull',
    summary: 'There are Wardens in Concordia, stranded when the arches shut. They are said to keep a gate at the foot of Frostmere Pass that faces nothing at all.',
    requires: req(done('quest:cc-through-the-arch')), autoStart: true, firstStage: 'tull',
    stages: [
      {
        id: 'tull', journal: 'Ysolde says the Wardens of Concordia keep their drills at Wardenhold, at the foot of Frostmere Pass.',
        objectives: [{ id: 'tull', text: 'Find the Wardens of Wardenhold', talk: 'npc:ingeborg-tull', marker: { landmark: 'landmark:warden-drill-yard' } }],
        next: 'log',
      },
      {
        id: 'log', journal: 'The Warden’s Gate faces north, up the pass, at nothing. Its watch has kept a log for thirty years. Ingeborg says you should read it before you lead anybody anywhere.',
        objectives: [{ id: 'log', text: 'Read the gate log at the Warden’s Gate', interact: 'obj:warden-gate-log', marker: { landmark: 'landmark:warden-wardens-gate' } }],
        onComplete: [{ startQuest: 'quest:warden-the-shut-pass' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-rime-wardenhold'] },
  },
  {
    ...A2, id: 'quest:warden-the-shut-pass', name: 'The Shut Pass', type: 'class', region: 'region:frost', giver: 'npc:ingeborg-tull',
    summary: 'No patrol from Wardenhold has gone up Frostmere Pass in thirty years. Ingeborg wants you to lead the first one.',
    requires: req(done('quest:warden-wardenhold')), firstStage: 'cairns',
    stages: [
      {
        id: 'cairns', journal: 'The old patrol cairns mark the road up the pass, one every mile. Relight their beacons as you go.',
        objectives: [{ id: 'cairns', text: 'Relight the patrol cairns on the pass', interact: 'obj:warden-pass-cairn-*', count: 3, marker: { region: 'region:frost' } }],
        next: 'turnback',
      },
      {
        id: 'turnback', journal: 'Above the last cairn the beacons stop. Somewhere up here, thirty years ago, the last patrol turned round. Wardens always mark the place.',
        objectives: [{ id: 'turnback', text: 'Find where the last patrol turned back', interact: 'obj:warden-turnback-stone', marker: { region: 'region:frost' } }],
        next: 'up',
      },
      {
        id: 'up', journal: 'At the top of the pass, something enormous is standing in the road. It has been standing there for thirty years.',
        objectives: [{ id: 'lair', text: 'Lead the patrol to the High Pass', reach: 'inst:sentinel-rime' }],
        onComplete: [{ startQuest: 'quest:warden-rimeheart-colossus' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:warden-rimeheart-colossus', name: 'The Rimeheart Colossus', type: 'class', region: 'region:frost', giver: 'npc:ingeborg-tull',
    summary: 'The Rimeheart Colossus held the pass for the crown’s road for a thousand years. Now it holds it shut, the way a Warden would.',
    requires: req(done('quest:warden-the-shut-pass')), firstStage: 'fight',
    stages: [
      {
        id: 'fight', journal: 'The Colossus is the Sentinel of the Rime school. Win its mark.',
        objectives: [{ id: 'colossus', text: 'Defeat the Rimeheart Colossus', kill: 'bx_colossus', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-rime' }],
        next: 'release',
      },
      {
        id: 'release', journal: 'In its last breath the Colossus spoke to you.',
        objectives: [{ id: 'mark', text: 'Hear the Colossus out', when: { flag: 'story.sentinel.rime' } }],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'The pass is open for the first time in thirty years. Ingeborg turned a patrol round on that road once. She should hear what was standing at the top of it.',
        objectives: [{ id: 'tull', text: 'Tell Ingeborg what held the pass', talk: 'npc:ingeborg-tull', marker: { landmark: 'landmark:warden-drill-yard' } }],
        onComplete: [{ startQuest: 'quest:warden-the-kept-out' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-colossus'] },
  },
  {
    ...A2, id: 'quest:warden-the-kept-out', name: 'The Kept-Out', type: 'class', region: 'region:gloam', giver: 'npc:thyri-coldbrook',
    summary: 'Torvald has led the clans who followed him through the White Gate into the Gloamwood, and is gathering every hungry soul in Morvane behind him.',
    requires: req(done('quest:warden-rimeheart-colossus')), firstStage: 'thyri',
    stages: [
      {
        id: 'thyri', journal: 'A clanswoman who turned back from Torvald’s march is sheltering at Hollis Lodge.',
        objectives: [{ id: 'thyri', text: 'Find the clanswoman at Hollis Lodge', talk: 'npc:thyri-coldbrook', marker: { landmark: 'landmark:lodge-hunters-lodge' } }],
        next: 'escort',
      },
      {
        id: 'escort', journal: 'Thyri knows the way to Torvald’s last camp, and she is the only one who does. The Gloamwood is full of wolves and worse, and she has not stopped shaking. Bring her through.',
        onEnter: [{ escort: 'npc:thyri-coldbrook', to: 'landmark:warden-procession-road' }],
        objectives: [{ id: 'thyri', text: 'Bring Thyri safely to the procession road', when: { any: [{ flag: 'escort.thyri-coldbrook', op: '==', value: 'arrived' }, { flag: 'escort.thyri-coldbrook', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:warden-procession-road' } }],
        next: [{ when: { flag: 'escort.thyri-coldbrook', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'read' }],
      },
      {
        id: 'regroup', journal: 'Thyri fell, and the Lodge’s hunters carried her back to the fire. She says she will go again, because turning round twice is more than anybody should have to do.',
        onEnter: [{ escort: 'npc:thyri-coldbrook', to: 'landmark:warden-procession-road' }],
        objectives: [{ id: 'thyri', text: 'Try again: bring Thyri to the procession road', when: { any: [{ flag: 'escort.thyri-coldbrook', op: '==', value: 'arrived' }, { flag: 'escort.thyri-coldbrook', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:warden-procession-road' } }],
        next: [{ when: { flag: 'escort.thyri-coldbrook', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'read' }],
      },
      {
        id: 'read', journal: 'Thyri is standing on the procession road, at the place where she turned round, looking down it.',
        objectives: [{ id: 'thyri', text: 'Hear what Thyri sees on the road', talk: 'npc:thyri-coldbrook', marker: { landmark: 'landmark:warden-procession-road' } }],
        next: 'camp',
      },
      {
        id: 'camp', journal: 'Torvald’s last camp is just down the road, where the trees open out.',
        objectives: [{ id: 'camp', text: 'Find Torvald’s camp in the Gloamwood', interact: 'obj:warden-torvald-gloam-table', marker: { region: 'region:gloam' } }],
        onComplete: [{ startQuest: 'quest:warden-the-white-stag' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:warden-the-white-stag', name: 'The White Stag', type: 'class', region: 'region:gloam', giver: 'npc:thyri-coldbrook',
    summary: 'Torvald means to follow the weeping White Stag down its old road into the Heart, with every kept-out soul in Morvane at his back. The Stag is not leading. It is grieving.',
    requires: req(done('quest:warden-the-kept-out')), firstStage: 'glade',
    stages: [
      {
        id: 'glade', journal: 'The Stag weeps in the deep glade. You are not here to kill it. You are here to hold it until it stops.',
        objectives: [{ id: 'lair', text: 'Go into the Deep Glade', reach: 'inst:sentinel-hunt', marker: { region: 'region:gloam' } }],
        next: 'stag',
      },
      {
        id: 'stag', journal: 'The White Stag is the Sentinel of the Hunt school. The Hunt bearers cannot win their mark while it runs.',
        objectives: [{ id: 'stag', text: 'Hold the White Stag', kill: 'bx_stag', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-hunt' }, { setFlag: 'story.bearer.huntsman', value: true }],
        next: 'shield',
      },
      {
        id: 'shield', journal: 'The glade is quiet. Against the oldest tree, where the clans’ footprints go past and on, somebody has left a tower shield standing.',
        objectives: [{ id: 'shield', text: 'Look at the shield left in the glade', interact: 'obj:warden-torvald-shield' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-stag'] },
  },
  {
    ...A2, id: 'quest:warden-a-horn-from-the-north', name: 'A Horn from the North', type: 'class', region: 'vil:brind', giver: DO,
    summary: 'Late at night, very faintly, a horn-call comes through the Rime arch. The old signal: come home when you’re done.',
    requires: req(done('quest:warden-the-white-stag')), autoStart: true, firstStage: 'horn',
    stages: [
      {
        id: 'horn', journal: 'Stand by the Rime arch at the Gate Circle after dark, and listen.',
        objectives: [{ id: 'horn', text: 'Listen at the Rime arch, at night', when: { flag: 'warden.horn_heard' }, marker: { landmark: 'landmark:gate-circle' } }],
        next: 'chord',
      },
      {
        id: 'chord', journal: 'The Wall half is singing towards the Stone Court, and something there is singing back.',
        objectives: [{ id: 'court', text: 'Hear the two Rime halves together at the Stone Court', when: { questCompleted: 'quest:cc-stone-court' }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ openDialogue: 'dialogue:warden-shield-chord' }],
        next: 'answer',
      },
      {
        id: 'answer', journal: 'Dagny can’t hear a horn, but the Wardwall can, and a call goes up the line from watch to watch. The only gate in Concordia that faces north is the Warden’s Gate at Wardenhold. Blow the answer from there.',
        objectives: [{ id: 'answer', text: 'Blow the answer north from the Warden’s Gate', interact: 'obj:warden-gate-horn', marker: { landmark: 'landmark:warden-wardens-gate' } }],
        onComplete: [{ setFlag: 'story.act2_ready', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:warden-under-the-pass', name: 'Under the Pass', type: 'side', region: 'region:frost', giver: 'npc:bearer-juggernaut',
    summary: 'The Juggernaut bearer would rather dig through Frostmere Pass than climb it, and has started.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'tunnel',
    stages: [
      {
        id: 'tunnel', journal: 'Hamm Ironsides is digging into the side of the pass with a pick and no plan. The Wardens of old cut tunnels here. Find one.',
        objectives: [{ id: 'tunnel', text: 'Find the old Warden tunnel with the Juggernaut bearer', interact: 'obj:warden-old-tunnel', marker: { region: 'region:frost' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Hamm has put the pick down. They want a word at the Stone Court.',
        objectives: [{ id: 'hamm', text: 'Talk to the Juggernaut bearer', when: { any: [{ flag: 'warden.hamm_thanked' }, { partyHasClass: 'juggernaut' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.juggernaut', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A2, id: 'quest:warden-the-hooded-glade', name: 'The Hooded Glade', type: 'side', region: 'region:gloam', giver: 'npc:bearer-falconer',
    summary: 'The Falconer bearer’s bird won’t fly within a mile of the White Stag’s glade. Perrin Featherstone is beginning to take it personally.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'perch',
    stages: [
      {
        id: 'perch', journal: 'The bird needs somewhere to stand in the glade that the Stag’s grief can’t reach. A tower shield is very like a wall, if you hold it right.',
        objectives: [{ id: 'perch', text: 'Make a perch in the glade with the Falconer bearer', interact: 'obj:warden-hooded-glade-perch', marker: { region: 'region:gloam' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'The bird flew. Perrin wants a word at the Stone Court.',
        objectives: [{ id: 'perrin', text: 'Talk to the Falconer bearer', when: { any: [{ flag: 'warden.perrin_thanked' }, { partyHasClass: 'falconer' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.falconer', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  // ======================= ACT III: class quests (III-4 + 3 side)
  {
    ...A3, id: 'quest:warden-the-herald-of-the-wall', name: 'The Herald of the Wall', type: 'class', region: 'region:heart', giver: 'npc:casimir',
    summary: 'At the top of the Twelve Stairs stands the Hollow King’s Herald, in a robe of drifted snow and the empty crown’s colours, ringing a bell cut from the Wardwall’s own ice. It is Torvald, and he has saved you a seat.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'herald',
    stages: [
      { id: 'herald', journal: 'Torvald has become the Herald of the Wall: no more walls, ever, and a table at the end of it that isn’t there.', objectives: [{ id: 'herald', text: 'Face the Herald of the Wall', kill: 'cb_herald-of-the-wall', count: 1, marker: { landmark: 'landmark:twelve-stairs-top' } }], onComplete: [{ openDialogue: 'dialogue:warden-herald-fate' }], next: 'fate' },
      { id: 'fate', journal: 'Torvald is on his knees on the stair. His tears run like meltwater, and they still won’t freeze.', objectives: [{ id: 'fate', text: 'Decide Torvald’s fate', when: { flag: 'warden.nemesis_fate' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 3 },
  },
  {
    ...A3, id: 'quest:warden-dagnys-last-watch', name: 'Dagny’s Last Watch', type: 'side', region: 'region:heart', giver: DO,
    summary: '“Come home when you’re done.” But there is one more wall between you and home, and Dagny has an order about it.',
    requires: req({ flag: 'warden.horn_heard' }, { flag: 'story.heart_open' }), autoStart: true, firstStage: 'orders',
    stages: [
      { id: 'orders', journal: 'Somebody has come all the way to the Heart camp with the Wall-Captain’s orders.', objectives: [{ id: 'orders', text: 'Hear Dagny’s orders at the Heart camp', when: { flag: 'warden.last_watch_ordered' }, marker: { landmark: 'landmark:heart-camp' } }], next: 'watch' },
      { id: 'watch', journal: 'One watch on the last wall there is. Stand it at night, facing the Weeping Wall, and blow the horn when it parts.', objectives: [{ id: 'watch', text: 'Stand the night watch at the Weeping Wall', when: { flag: 'warden.last_watch_kept' }, marker: { landmark: 'landmark:heart-camp' } }], next: 'answer' },
      {
        id: 'answer', journal: 'Somebody in the Legion lifted their head at the horn. A Warden answers a horn-call; that is the whole of the drill. Go and find out who.',
        objectives: [{ id: 'warden', text: 'Find the Warden who answered the horn', interact: 'obj:warden-legion-warden', marker: { landmark: 'landmark:legion-camp' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:warden-the-clans-in-the-camp', name: 'The Clans in the Camp', type: 'side', region: 'region:heart', giver: 'npc:thyri-coldbrook',
    summary: 'The Outland folk who followed Torvald through the White Gate are standing in the Legion camp in their own rank, still waiting for the table they were promised.',
    requires: req(done('quest:heart-legion')), autoStart: true, firstStage: 'table',
    stages: [
      { id: 'table', journal: 'Grandmothers and children at the front, the way they stood at the postern. Every one of them is holding an empty bowl.', objectives: [{ id: 'clans', text: 'Bring the Outland clans out of the Legion', interact: 'obj:warden-clan-ranks', marker: { landmark: 'landmark:legion-camp' } }], next: 'thyri' },
      {
        id: 'thyri', journal: 'Thyri Coldbrook has come up from the Gloamwood behind the bearers. She turned back from the march, and her daughter didn’t. She is somewhere in the crowd coming out of the Legion.',
        objectives: [{ id: 'thyri', text: 'Find Thyri among the freed clans', talk: 'npc:thyri-coldbrook', marker: { landmark: 'landmark:legion-camp' } }],
        next: 'supper',
      },
      {
        id: 'supper', journal: 'Torvald promised them a table. There isn’t one. There are trestles and boards on the Legion’s supply carts, though, and a Warden who knows what a gate is for.',
        objectives: [{ id: 'table', text: 'Lay a table for the clans at the Heart camp', interact: 'obj:warden-heart-table', marker: { landmark: 'landmark:heart-camp' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:warden-the-goat-who-crosses-walls', name: 'The Goat Who Crosses Walls', type: 'side', region: 'region:heart', giver: 'npc:old-gubbins-heart',
    summary: 'Old Gubbins has followed you through every gate between the Wardwall and the Heart. Nobody saw him come through the Weeping Wall. Nobody ever sees him.',
    requires: req(done('quest:heart-wall')), autoStart: true, firstStage: 'goat',
    stages: [
      { id: 'goat', journal: 'There is a goat in the Heart camp. It is eating Sela’s map.', objectives: [{ id: 'gubbins', text: 'Find Old Gubbins at the Heart camp', talk: 'npc:old-gubbins-heart', marker: { landmark: 'landmark:heart-camp' } }], next: 'path' },
      { id: 'path', journal: 'Old Gubbins has found a way round the Legion that nobody is watching, because nobody ever watches goats. Follow him.', objectives: [{ id: 'banner', text: 'Follow Old Gubbins behind the Legion’s lines', interact: 'obj:warden-gubbins-banner', marker: { landmark: 'landmark:legion-camp' } }], next: 'cairn' },
      {
        id: 'cairn', journal: 'A road nobody watches is a road somebody should mark. Sela’s map is inside a goat, so it will have to be a cairn, Wardwall fashion, at the mouth of the gully.',
        objectives: [{ id: 'cairn', text: 'Raise a patrol cairn at the mouth of the goat’s gully', interact: 'obj:warden-goat-cairn', marker: { landmark: 'landmark:legion-camp' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
];

export default quests;
