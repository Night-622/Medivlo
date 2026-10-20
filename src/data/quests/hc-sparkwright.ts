/**
 * Hollow Crown: the SPARKWRIGHT campaign (docs/lore/hollow-crown/06-outlines/storm.md). Act I in Spirehold
 * (area:storm-capital) and the Act II class thread in Concordia. Act III class quests land with the Heart. Owner: Claude 4.
 */
import type { NarrativeCondition, QuestDef } from '@/core';

const SW: NarrativeCondition = { heroClass: 'sparkwright' };
const done = (q: `quest:${string}`): NarrativeCondition => ({ questCompleted: q });
const req = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: [SW, ...c] });
const A1 = { act: 'act1' as const, campaign: 'sparkwright', chapter: 'Spirehold' };
const A2 = { act: 'act2' as const, campaign: 'sparkwright', chapter: 'Concordia' };
const A3 = { act: 'act3' as const, campaign: 'sparkwright', chapter: 'The Heart' };
const Z1 = 'zone:storm-capital-1' as const, Z2 = 'zone:storm-capital-2' as const, Z3 = 'zone:storm-capital-3' as const, Z4 = 'zone:storm-capital-4' as const;
const L1 = 'inst:storm-capital-lair-1' as const, L2 = 'inst:storm-capital-lair-2' as const, L3 = 'inst:storm-capital-lair-3' as const;
const TA = 'npc:tess-ampery' as const, VS = 'npc:volta-sterne' as const;

const quests: QuestDef[] = [
  // ======================= ACT I: main (I-1 … I-10)
  {
    ...A1, id: 'quest:sparkwright-every-workshop-at-once', name: 'Every Workshop at Once', type: 'main', region: Z1, giver: TA,
    summary: 'On Coil Street the workshops explode on the hour, politely, one at a time. Tonight a bell rang somewhere far away, and every one of them went off at once.',
    requires: SW, autoStart: true, firstStage: 'rubble',
    stages: [
      {
        id: 'rubble', journal: 'You are lying in the rubble of your workshop with a song in your chest and no eyebrows. Somebody is shouting your name from the door of the Guildmother’s workshop.',
        onEnter: [{ openDialogue: 'dialogue:sparkwright-bell-night' }],
        objectives: [{ id: 'out', text: 'Climb out of the rubble to the Guildmother’s workshop', reach: 'landmark:tess-ampery-workshop', marker: { landmark: 'landmark:tess-ampery-workshop' } }],
        next: 'tess',
      },
      {
        id: 'tess', journal: 'Guildmother Tess Ampery is standing in her doorway in a smoking apron, beaming at you.',
        objectives: [{ id: 'tess', text: 'Talk to Tess Ampery', talk: TA, marker: { landmark: 'landmark:tess-ampery-workshop' } }],
        onComplete: [{ setFlag: 'sparkwright.bell_heard', value: true }],
        next: 'street',
      },
      {
        id: 'street', journal: 'Tess wants a head count before tea. Three workshops on Coil Street went up harder than the rest. Go and see that everyone in them still has most of their eyebrows.',
        objectives: [{ id: 'blasts', text: 'Check on the worst-hit workshops on Coil Street', interact: 'obj:sparkwright-blast-site-*', count: 3, marker: { place: Z1 } }],
        next: 'tea',
      },
      {
        id: 'tea', journal: 'Nobody hurt, one hat lost, and every scorch on the street pointing the same way. Kettle Twenty has made tea. Tess is waiting.',
        objectives: [{ id: 'tess', text: 'Have tea with Tess in her workshop', talk: TA, marker: { landmark: 'landmark:tess-ampery-workshop' } }],
        onComplete: [{ startQuest: 'quest:sparkwright-rod-duty' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-thunderreach', 'lore:hc-coil-guild'] },
  },
  {
    ...A1, id: 'quest:sparkwright-rod-duty', name: 'Rod Duty', type: 'main', region: Z1, giver: TA,
    summary: 'Five lightning rods feed Coil Street’s workshops. Tess wants them reset before the street runs out of explosions, which would be a disaster of a different kind.',
    requires: req(done('quest:sparkwright-every-workshop-at-once')), firstStage: 'rods',
    stages: [
      {
        id: 'rods', journal: 'Five rods on the Coil Street rooftops, every one of them knocked crooked by the Bell.',
        objectives: [{ id: 'rods', text: 'Reset the lightning rods on the Coil Street rooftops', interact: 'obj:coil-rod-*', count: 5, marker: { place: Z1 } }],
        next: 'wisps',
      },
      {
        id: 'wisps', journal: 'The storm came down the rods black, and the Static Wisps riding it came out hollow and biting.',
        objectives: [{ id: 'wisps', text: 'Drive off the hollow Static Wisps', kill: 'bx_storm_1', count: 4, marker: { place: Z1 } }],
        next: 'glass',
      },
      {
        id: 'glass', journal: 'From the last rod you can see the storm over the Copper Gate. The Guild’s old storm-glass stands on the lookout past the end of Coil Street. It will say how long that storm has sat there.',
        objectives: [{ id: 'glass', text: 'Read the Guild storm-glass on the lookout', interact: 'obj:sparkwright-storm-glass', marker: { landmark: 'landmark:sparkwright-rod-lookout' } }],
        next: 'report',
      },
      {
        id: 'report', journal: 'The storm over the Copper Gate hasn’t moved in a year, and the storm-glass says it isn’t stuck. It is being held.',
        objectives: [{ id: 'tess', text: 'Report to Tess', talk: TA, marker: { landmark: 'landmark:tess-ampery-workshop' } }],
        onComplete: [{ startQuest: 'quest:sparkwright-the-witchs-belfry' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:sparkwright-the-witchs-belfry', name: 'The Witch’s Belfry', type: 'main', region: Z2, giver: TA,
    summary: 'Every night a bell rings in an old belfry among the Copper Spires, and the storm comes down on whichever tower is tallest. A Tempest Coven witch is calling it.',
    requires: req(done('quest:sparkwright-rod-duty')), firstStage: 'belfry',
    stages: [
      {
        id: 'belfry', journal: 'The belfry stands among the fallen towers of the Copper Spires. Its door has been nailed shut from the inside.',
        objectives: [{ id: 'enter', text: 'Break into the Witch’s Belfry', reach: L1, marker: { landmark: 'landmark:witchs-belfry-door' } }],
        next: 'witch',
      },
      {
        id: 'witch', journal: 'Every time she rings, the lightning hits the tallest thing in the room. Make sure that’s her.',
        objectives: [{ id: 'witch', text: 'Defeat the Tempest Witch', kill: 'bx_storm_4', count: 1 }],
        next: 'bell',
      },
      {
        id: 'bell', journal: 'The witch is down. Her bell is still swinging, very slightly, and still black.',
        objectives: [{ id: 'bell', text: 'Silence the belfry bell', interact: 'obj:belfry-bell' }],
        next: 'report',
      },
      {
        id: 'report', journal: 'The Copper Spires are quiet tonight. Tess will want to hear every detail, twice.',
        objectives: [{ id: 'tess', text: 'Report to Tess', talk: TA, marker: { landmark: 'landmark:tess-ampery-workshop' } }],
        onComplete: [{ setFlag: 'sparkwright.belfry_quiet', value: true }, { startQuest: 'quest:sparkwright-the-chancellors-tour' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 80, hcItems: [{ item: 'i_scroll_storm', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:sparkwright-the-chancellors-tour', name: 'The Chancellor’s Tour', type: 'main', region: Z3, giver: VS,
    summary: 'The Chancellor of the Coil Guild has heard about the belfry, and has invited the young Sparkwright on a private tour of the Dynamo Halls. She does not usually give tours.',
    requires: req(done('quest:sparkwright-the-witchs-belfry')), firstStage: 'summons',
    stages: [
      {
        id: 'summons', journal: 'A Chancellery invitation, on stiff card, with no scorch-marks on it at all. The Chancellery, in the Dynamo Halls.',
        objectives: [{ id: 'volta', text: 'Meet the Chancellor at the Chancellery', talk: VS, marker: { landmark: 'landmark:chancellery' } }],
        next: 'wheel',
      },
      {
        id: 'wheel', journal: 'The Chancellor wants you to see the Number Three wheel. She says it is her favourite. She says it the way other people talk about dogs.',
        objectives: [{ id: 'wheel', text: 'Walk the Dynamo Halls with the Chancellor', reach: 'landmark:dynamo-wheel-three', marker: { landmark: 'landmark:dynamo-wheel-three' } }],
        onComplete: [{ setFlag: 'sparkwright.volta_met', value: true }],
        next: 'three',
      },
      {
        id: 'three', journal: 'Number Three, turning. Marjorie Watt is at the handles, and the Chancellor is standing exactly where Marjorie can’t see her.',
        objectives: [{ id: 'volta', text: 'Hear the Chancellor out at the Number Three wheel', talk: VS, marker: { landmark: 'landmark:dynamo-wheel-three' } }],
        onComplete: [{ startQuest: 'quest:sparkwright-tower-fifteen' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-volta-sterne', 'lore:hc-lightning-tower'] },
  },
  {
    ...A1, id: 'quest:sparkwright-tower-fifteen', name: 'Tower Fifteen', type: 'main', region: Z2, giver: VS,
    summary: 'Tower Fifteen, the tower that will not fall, needs a coil. The Guild is voting to fill it with Spirehold’s Static Wisps, the little sparks every child keeps one of.',
    requires: req(done('quest:sparkwright-the-chancellors-tour')), firstStage: 'canvass',
    stages: [
      {
        id: 'canvass', journal: 'Tess says nobody should vote on the wisps without asking the people who keep them, and the people who build the towers they’re for. Juniper Gauss has a jar by her bed. Wilf Farraday has buried apprentices under fallen towers.',
        objectives: [
          { id: 'juniper', text: 'Ask Juniper Gauss about her wisp', talk: 'npc:juniper-gauss', marker: { landmark: 'landmark:patent-office' } },
          { id: 'wilf', text: 'Ask Wilf Farraday about the towers', talk: 'npc:wilf-farraday', marker: { landmark: 'landmark:tower-fifteen' } },
        ],
        next: 'vote',
      },
      {
        id: 'vote', journal: 'The Guild meets at the foot of Tower Fifteen, in the Copper Spires. The cages are already built.',
        objectives: [{ id: 'vote', text: 'Speak at the Guild vote', when: { flag: 'sparkwright.wisps' }, marker: { landmark: 'landmark:tower-fifteen' } }],
        next: [{ when: { flag: 'sparkwright.wisps', value: 'caged' }, to: 'after' }, { to: 'cages' }],
      },
      {
        id: 'cages', journal: 'The wisp-cages are standing open at the foot of the tower. Somebody has to unlatch the last of them.',
        objectives: [{ id: 'cages', text: 'Open the wisp-cages', interact: 'obj:wisp-cage', marker: { landmark: 'landmark:tower-fifteen' } }],
        next: 'after',
      },
      {
        id: 'after', journal: 'Whatever the Guild decided, Tower Fifteen needs a heart. The Chancellor knows where to find one.',
        objectives: [],
        onComplete: [{ startQuest: 'quest:sparkwright-the-grand-patent-vault' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A1, id: 'quest:sparkwright-the-grand-patent-vault', name: 'The Grand Patent Vault', type: 'main', region: Z3, giver: VS,
    summary: 'Volta wants the plans of the Perpetual Engine from the Grand Patent Vault. The Perpetual Engine Mk. XII has refused to stop for forty years, and now it refuses to be fetched.',
    requires: req(done('quest:sparkwright-tower-fifteen')), firstStage: 'vault',
    stages: [
      {
        id: 'vault', journal: 'The Grand Patent Vault, where the Guild locks away every invention it was afraid of.',
        objectives: [{ id: 'enter', text: 'Enter the Grand Patent Vault', reach: L2, marker: { place: Z3 } }],
        next: 'engine',
      },
      {
        id: 'engine', journal: 'It can’t be destroyed, only stopped. Jam its gears in the right order.',
        objectives: [{ id: 'engine', text: 'Stop the Perpetual Engine Mk. XII', kill: 'cb_perpetual-engine', count: 1 }],
        next: 'sheet',
      },
      {
        id: 'sheet', journal: 'The Engine has stopped. Something is jammed in its last gear: a sheet of paper, folded very small.',
        objectives: [{ id: 'sheet', text: 'Pull the paper out of the gears', interact: 'obj:jammed-patent-sheet' }],
        onComplete: [{ setFlag: 'sparkwright.patent_sheet', value: true }, { startQuest: 'quest:sparkwright-patent-pending' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 120 },
  },
  {
    ...A1, id: 'quest:sparkwright-patent-pending', name: 'Patent Pending', type: 'main', region: Z4, giver: TA,
    summary: 'The sheet jammed in the Engine’s gears is a patent application in the Chancellor’s own neat hand. It is for a tower, and the tower is a cage.',
    requires: req(done('quest:sparkwright-the-grand-patent-vault')), firstStage: 'tess',
    stages: [
      {
        id: 'tess', journal: 'Tess will know how to read a patent. Tess has filed nineteen.',
        objectives: [{ id: 'tess', text: 'Show Tess the patent', talk: TA, marker: { landmark: 'landmark:tess-ampery-workshop' } }],
        next: 'clerk',
      },
      {
        id: 'clerk', journal: 'A patent application leaves a trail at the Patent Office: a filing date, a fee, a clerk’s stamp. Mortimer Sneddon has stamped everything in Spirehold for thirty years.',
        objectives: [{ id: 'mortimer', text: 'Ask Mortimer about the Perpetual Tower’s filing', talk: 'npc:mortimer-sneddon', marker: { landmark: 'landmark:patent-office' } }],
        next: 'rods',
      },
      {
        id: 'rods', journal: 'If the patent is true, the Chancellor has already started. Look for her anchor-rods in the Tower Foundations.',
        objectives: [{ id: 'rods', text: 'Find the Chancellor’s anchor-rods', interact: 'obj:volta-anchor-rod-*', count: 4, marker: { landmark: 'landmark:root-tuning-chamber' } }],
        onComplete: [{ setFlag: 'sparkwright.volta_known', value: true }],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'Four rods, thick as a waist, holding the storm over the Copper Gate like a kite on a peg. Tess has to hear it from you.',
        objectives: [{ id: 'tess', text: 'Tell Tess what holds the storm', talk: TA, marker: { landmark: 'landmark:tess-ampery-workshop' } }],
        onComplete: [{ startQuest: 'quest:sparkwright-the-tower-crown' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-perpetual-tower'] },
  },
  {
    ...A1, id: 'quest:sparkwright-the-tower-crown', name: 'The Tower Crown', type: 'main', region: L3, giver: TA,
    summary: 'Volta has built her cage around the Tower half at the crown of the Lightning Tower, and is waiting for the one person who can lift the stone into it.',
    requires: req(done('quest:sparkwright-patent-pending')), firstStage: 'climb',
    stages: [
      {
        id: 'climb', journal: 'Up the Lightning Tower to its crown. The half-stone in your chest is crackling like a kettle on the boil.',
        objectives: [{ id: 'enter', text: 'Climb to the Tower Crown', reach: L3, marker: { place: Z4 } }],
        onComplete: [{ openDialogue: 'dialogue:sparkwright-crown-words' }],
        next: 'volta',
      },
      {
        id: 'volta', journal: 'She routes the lightning between pylons from her harness. Rewire the pylons and send it back at her.',
        objectives: [{ id: 'volta', text: 'Stop Chancellor Volta Sterne', kill: 'cb_volta-sterne', count: 1 }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'Volta has fallen back to the edge of the crown. The Tower half is still in its cage, singing, and only you can lift it out.',
        objectives: [{ id: 'stone', text: 'Lift the Tower half out of the cage', interact: 'obj:storm-capital-halfstone' }],
        onComplete: [{ setFlag: 'sparkwright.halfstone', value: true }, { startQuest: 'quest:sparkwright-the-copper-road' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, skillPoints: 1, lore: ['lore:hc-half-stones'] },
  },
  {
    ...A1, id: 'quest:sparkwright-the-copper-road', name: 'The Copper Road', type: 'main', region: Z1, giver: TA,
    summary: 'Volta rode a lightning-line all the way down to the Copper Gate. The half-stone in your hand can open it. Tess wants to see you first.',
    requires: req(done('quest:sparkwright-the-tower-crown')), firstStage: 'farewell',
    stages: [
      {
        id: 'farewell', journal: 'Tess is in her workshop, and for the first time anyone can remember, nothing in it is on fire.',
        objectives: [{ id: 'tess', text: 'Say goodbye to Tess', talk: TA, marker: { landmark: 'landmark:tess-ampery-workshop' } }],
        next: 'pylon',
      },
      {
        id: 'pylon', journal: 'Halfway up the Copper Road the old lightning-line comes down to a Guild pylon. Volta rode the line from the Tower Crown. This is where she touched the ground.',
        objectives: [{ id: 'pylon', text: 'Stop at the line pylon on the Copper Road', interact: 'obj:sparkwright-line-pylon', marker: { landmark: 'landmark:sparkwright-line-pylon' } }],
        next: 'road',
      },
      {
        id: 'road', journal: 'The Copper Road runs north to the gate, under the storm that has not moved in a year.',
        objectives: [{ id: 'gate', text: 'Take the Copper Road to the gate', reach: 'area:storm-gate', marker: { place: 'area:storm-gate' } }],
        onComplete: [{ startQuest: 'quest:sparkwright-the-copper-gate' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:sparkwright-the-copper-gate', name: 'The Copper Gate', type: 'main', region: 'area:storm-gate', giver: TA,
    summary: 'Skyrender, the storm-bird whose wings make the weather, stands hollow over the Copper Gate, pinned there by four of Volta’s anchor-rods.',
    requires: req(done('quest:sparkwright-the-copper-road')), firstStage: 'skyrender',
    stages: [
      {
        id: 'skyrender', journal: 'Shoot out the anchor-rods to cut the bird loose, and ground its hollow lightning through the Tower half.',
        objectives: [{ id: 'skyrender', text: 'Cut Skyrender loose', kill: 'bx_storm_5', count: 1 }],
        next: 'gate',
      },
      {
        id: 'gate', journal: 'Skyrender beat its wings once, and the storm moved on. The gate is weeping black tears down its face.',
        objectives: [{ id: 'seal', text: 'Open the Copper Gate with the Tower half', interact: 'obj:storm-gate-seal' }],
        onComplete: [{ setFlag: 'story.gate_open', value: true }, { setFlag: 'story.act', value: 2 }, { setFlag: 'sparkwright.act1_done', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 200, lore: ['lore:hc-realm-gates', 'lore:hc-skyrender'] },
  },

  // ======================= ACT I: side quests (2 per zone)
  {
    ...A1, id: 'quest:sparkwright-the-quiet-workshop', name: 'The Quiet Workshop', type: 'side', region: Z1, giver: 'npc:pim-joule',
    summary: 'Pim Joule’s workshop hasn’t exploded in nine days, and the whole of Coil Street is worried sick.',
    requires: req(done('quest:sparkwright-every-workshop-at-once')), firstStage: 'toaster',
    stages: [
      {
        id: 'toaster', journal: 'There is a smell of toast coming from under Pim’s door. Toast, on Coil Street, is deeply suspicious.',
        objectives: [{ id: 'toaster', text: 'Find out what Pim is hiding', interact: 'obj:pim-toaster', marker: { landmark: 'landmark:pim-joule-workshop' } }],
        next: 'pim',
      },
      {
        id: 'pim', journal: 'It’s a toaster. It works. It has worked every time, for nine days. Pim is terrified.',
        objectives: [{ id: 'pim', text: 'Talk to Pim about the toaster', talk: 'npc:pim-joule', marker: { landmark: 'landmark:pim-joule-workshop' } }],
        onComplete: [{ setFlag: 'sparkwright.pim_toaster', value: true }],
        next: 'toast',
      },
      {
        id: 'toast', journal: 'Nine days of perfect toast, stacked to the ceiling, and Pim can’t bear to throw away a slice. Marjorie Watt’s wheel keeps the orphanage warm. Perhaps the orphanage would like breakfast.',
        objectives: [{ id: 'marjorie', text: 'Take Pim’s toast to Marjorie at Wheel Three', talk: 'npc:marjorie-watt', marker: { landmark: 'landmark:dynamo-wheel-three' } }],
        onComplete: [{ setFlag: 'sparkwright.toast_delivered', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_bread', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:sparkwright-patent-rejected', name: 'Patent Rejected', type: 'side', region: Z1, giver: 'npc:mortimer-sneddon',
    summary: 'Clerk Mortimer Sneddon has thirty years of rejection letters and no pigeon. He would like some of them delivered before he retires, which he would also like to do.',
    requires: req(done('quest:sparkwright-every-workshop-at-once')), firstStage: 'deliver',
    stages: [
      {
        id: 'deliver', journal: 'Two letters on top of the pile: one for Wilf Farraday in the Copper Spires, and one for Juniper Gauss, aged nine.',
        objectives: [
          { id: 'wilf', text: 'Deliver a rejection to Wilf Farraday', talk: 'npc:wilf-farraday', marker: { landmark: 'landmark:tower-fifteen' } },
          { id: 'juniper', text: 'Deliver a rejection to Juniper Gauss', talk: 'npc:juniper-gauss', marker: { landmark: 'landmark:patent-office' } },
        ],
        next: 'mortimer',
      },
      {
        id: 'mortimer', journal: 'Juniper’s application was for a tower that hums instead of catches. Somebody should tell Mortimer what he rejected.',
        objectives: [{ id: 'mortimer', text: 'Go back to Mortimer', talk: 'npc:mortimer-sneddon', marker: { landmark: 'landmark:patent-office' } }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'Mortimer swears he has seen Juniper’s drawing before, years ago, somewhere he was not supposed to be: on the foundation stone of the Lightning Tower, down in the Foundations.',
        objectives: [{ id: 'stone', text: 'Find the Lightning Tower’s foundation stone', interact: 'obj:sparkwright-founding-stone', marker: { landmark: 'landmark:sparkwright-founding-stone' } }],
        onComplete: [{ setFlag: 'sparkwright.founding_stone', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:sparkwright-tower-seven-leans', name: 'Tower Seven Leans', type: 'side', region: Z2, giver: 'npc:ada-henry',
    summary: 'Old Bert and Effie Henry live at the top of Tower Seven, which leans a little further every day. They refuse to leave. Tea is at four.',
    requires: req(done('quest:sparkwright-rod-duty')), firstStage: 'scrap',
    stages: [
      {
        id: 'scrap', journal: 'The fallen towers of the Copper Spires are full of good copper scrap. A counterweight needs a lot of it.',
        objectives: [{ id: 'scrap', text: 'Gather scrap from the fallen towers', interact: 'obj:tower-scrap-*', count: 3, marker: { place: Z2 } }],
        next: 'weight',
      },
      {
        id: 'weight', journal: 'Hang the counterweight off the high side of Tower Seven before teatime.',
        objectives: [{ id: 'weight', text: 'Rig the counterweight on Tower Seven', interact: 'obj:tower-seven-counterweight', marker: { landmark: 'landmark:tower-seven' } }],
        next: 'tea',
      },
      {
        id: 'tea', journal: 'Tower Seven has stopped leaning. Nearly. It is four o’clock.',
        objectives: [{ id: 'ada', text: 'Have tea with Effie and Bert', talk: 'npc:ada-henry', marker: { landmark: 'landmark:tower-seven' } }],
        onComplete: [{ setFlag: 'sparkwright.tower_seven', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_cake', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:sparkwright-the-spire-jumpers', name: 'The Spire-Jumpers', type: 'side', region: Z2, giver: 'npc:wilf-farraday',
    summary: 'Wilf Farraday’s apprentices leap between the leaning towers on glide-cloaks for fun. They want a race. They want to go first. You would just like to land.',
    requires: req(done('quest:sparkwright-rod-duty')), firstStage: 'race',
    stages: [
      {
        id: 'race', journal: 'Four hoops strung between four leaning towers. Through all four, and down alive.',
        objectives: [{ id: 'hoops', text: 'Glide through the jump-hoops', interact: 'obj:jump-ring-*', count: 4, marker: { place: Z2 } }],
        next: 'wilf',
      },
      {
        id: 'wilf', journal: 'You landed. On your feet, even. The apprentices are furious.',
        objectives: [{ id: 'wilf', text: 'Hear Wilf’s verdict', talk: 'npc:wilf-farraday', marker: { landmark: 'landmark:tower-fifteen' } }],
        next: 'tree',
      },
      {
        id: 'tree', journal: 'Three of Wilf’s apprentices went first, and are still in a tree on the far side of the Spires. Wilf says they will come down when they are ready. They have been ready since lunch.',
        objectives: [{ id: 'tree', text: 'Get the apprentices down out of the tree', interact: 'obj:sparkwright-apprentice-tree', marker: { landmark: 'landmark:sparkwright-apprentice-tree' } }],
        onComplete: [{ setFlag: 'sparkwright.apprentices_down', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50 },
  },
  {
    ...A1, id: 'quest:sparkwright-wheel-three', name: 'Wheel Three', type: 'side', region: Z3, giver: 'npc:marjorie-watt',
    summary: 'Marjorie Watt has run the Number Three wheel for thirty years to keep the orphanage warm. The haywire Coil Sentries have decided to replace her.',
    requires: req(done('quest:sparkwright-the-chancellors-tour')), firstStage: 'sentries',
    stages: [
      {
        id: 'sentries', journal: 'Four Coil Sentries are trying to take Marjorie’s place at the wheel. Help her finish her shift.',
        objectives: [{ id: 'sentries', text: 'Stop the Sentries replacing Marjorie', kill: 'bx_storm_2', count: 4, marker: { landmark: 'landmark:dynamo-wheel-three' } }],
        next: 'shift',
      },
      {
        id: 'shift', journal: 'The shift bell is ringing. Number Three is still turning, and the orphanage is still warm.',
        objectives: [{ id: 'marjorie', text: 'See Marjorie off her shift', talk: 'npc:marjorie-watt', marker: { landmark: 'landmark:dynamo-wheel-three' } }],
        next: 'orphanage',
      },
      {
        id: 'orphanage', journal: 'Thirty years Marjorie has kept the orphanage warm, and she has never once been inside it. She grew up there. Somebody ought to go and look, and tell her it’s still standing.',
        objectives: [{ id: 'door', text: 'Visit the orphanage below the Dynamo Halls', interact: 'obj:sparkwright-orphanage-door', marker: { landmark: 'landmark:sparkwright-orphanage' } }],
        onComplete: [{ setFlag: 'sparkwright.orphanage_seen', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 60 },
  },
  {
    ...A1, id: 'quest:sparkwright-sentry-sixty-one', name: 'Sentry Sixty-One', type: 'side', region: Z3, giver: 'npc:sentry-sixty-one',
    summary: 'A haywire Coil Sentry in the Dynamo Halls has decided it is a pigeon. It is due to be scrapped on Thursday. It is Wednesday.',
    requires: req(done('quest:sparkwright-the-chancellors-tour')), firstStage: 'crumbs',
    stages: [
      {
        id: 'crumbs', journal: 'Pigeons like breadcrumbs. Marjorie keeps her lunch in a tin by the wheel, and she always leaves the crusts.',
        objectives: [{ id: 'crumbs', text: 'Borrow some crusts from Marjorie’s lunch tin', interact: 'obj:dynamo-lunch-tin', marker: { landmark: 'landmark:dynamo-wheel-three' } }],
        next: 'feed',
      },
      {
        id: 'feed', journal: 'A pocketful of crusts. Approach slowly. Coo, if you must.',
        objectives: [{ id: 'sixty', text: 'Win Sentry Sixty-One’s trust', talk: 'npc:sentry-sixty-one', marker: { landmark: 'landmark:dynamo-wheel-three' } }],
        onComplete: [{ setFlag: 'sparkwright.sixty_one_saved', value: true }],
        next: 'filed',
      },
      {
        id: 'filed', journal: 'The scrapping order still stands, tag or no tag, chalk or no chalk. Paperwork made it a Sentry. Only paperwork can make it a pigeon. Mortimer Sneddon has a stamp.',
        objectives: [{ id: 'mortimer', text: 'Ask Mortimer to re-file Sentry Sixty-One', talk: 'npc:mortimer-sneddon', marker: { landmark: 'landmark:patent-office' } }],
        onComplete: [{ setFlag: 'sparkwright.sixty_one_filed', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:sparkwright-the-root-tuner', name: 'The Root-Tuner', type: 'side', region: Z4, giver: 'npc:ma-ohmsworth',
    summary: 'Ma Ohmsworth tunes the Lightning Tower’s copper roots like harp strings. The Chancellor has told her to stop. She has six roots left.',
    requires: req(done('quest:sparkwright-rod-duty')), firstStage: 'roots',
    stages: [
      {
        id: 'roots', journal: 'Six copper roots in the Tower Foundations, each one a little flat. Tap them true.',
        objectives: [{ id: 'roots', text: 'Tune the last six roots', interact: 'obj:copper-root-*', count: 6, marker: { landmark: 'landmark:root-tuning-chamber' } }],
        next: 'ma',
      },
      {
        id: 'ma', journal: 'The roots are humming. Your half-stone is humming with them, on exactly the same note.',
        objectives: [{ id: 'ma', text: 'Tell Ma Ohmsworth what you heard', talk: 'npc:ma-ohmsworth', marker: { landmark: 'landmark:root-tuning-chamber' } }],
        next: 'tess',
      },
      {
        id: 'tess', journal: 'Ma says the roots’ note is the one the Tower sang when she was a girl. Tess has spent forty years and nineteen kettles chasing a note. She should hear this.',
        objectives: [{ id: 'tess', text: 'Hum Tess the roots’ note', talk: TA, marker: { landmark: 'landmark:tess-ampery-workshop' } }],
        onComplete: [{ setFlag: 'sparkwright.tess_heard_roots', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_em_s', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:sparkwright-the-wisp-nursery', name: 'The Wisp Nursery', type: 'side', region: Z4, giver: 'npc:juniper-gauss',
    summary: 'Juniper Gauss’s wisp has gone down to the Foundations, where the Static Wisps breed. The hollow ones down there are eating the young sparks.',
    requires: req(done('quest:sparkwright-rod-duty')), firstStage: 'nest',
    stages: [
      {
        id: 'nest', journal: 'The wisp nursery is deep in the Tower Foundations. Clear out the hollow wisps.',
        objectives: [{ id: 'wisps', text: 'Clear the hollow wisps from the nursery', kill: 'bx_storm_1', count: 5, marker: { place: Z4 } }],
        next: 'baby',
      },
      {
        id: 'baby', journal: 'Somewhere in the nest, very faint, something small is still sparking.',
        objectives: [{ id: 'baby', text: 'Search the wisp nest', interact: 'obj:wisp-nursery-nest', marker: { place: Z4 } }],
        next: 'juniper',
      },
      {
        id: 'juniper', journal: 'A baby wisp is riding on your shoulder, and won’t get off.',
        objectives: [{ id: 'juniper', text: 'Go back to Juniper', talk: 'npc:juniper-gauss', marker: { landmark: 'landmark:patent-office' } }],
        onComplete: [{ setFlag: 'sparkwright.baby_wisp', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_lantern' }] },
  },

  // ======================= ACT I: mentor thread (2) and bounties (2)
  {
    ...A1, id: 'quest:sparkwright-the-nineteenth-kettle', name: 'The Nineteenth Kettle', type: 'side', region: Z3, giver: TA,
    summary: 'Tess holds nineteen patents for the same kettle. She has never said why. Today, for some reason, she would like you to find out.',
    requires: req({ trust: TA, value: 'friendly' }, done('quest:sparkwright-rod-duty')), firstStage: 'annexe',
    stages: [
      {
        id: 'annexe', journal: 'Patent No. 1 of the kettle line is in the Vault annexe, under the Dynamo Halls, filed under Coincidence.',
        objectives: [{ id: 'patent', text: 'Find the first kettle patent in the Vault annexe', interact: 'obj:first-kettle-patent', marker: { place: Z3 } }],
        next: 'tess',
      },
      {
        id: 'tess', journal: 'Filed in C. 961 by Winifred Ampery, Tess’s grandmother. There is a note in the margin from the clerk.',
        objectives: [{ id: 'tess', text: 'Bring the first patent to Tess', talk: TA, marker: { landmark: 'landmark:tess-ampery-workshop' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, skillPoints: 1, lore: ['lore:hc-nineteenth-kettle'] },
  },
  {
    ...A1, id: 'quest:sparkwright-tess-eyebrows', name: 'Tess’s Eyebrows', type: 'side', region: Z4, giver: TA,
    summary: 'On the night of C. 1012 Tess was in the Tower Crown, and she tried to catch the Storm Stone as it fled. She has never grown her eyebrows back, on principle.',
    requires: req({ trust: TA, value: 'trusted' }, done('quest:sparkwright-the-witchs-belfry')), firstStage: 'scorch',
    stages: [
      {
        id: 'scorch', journal: 'Where the Storm Stone struck the Foundations on its way out of Spirehold, there is a scorch-mark, and Tess dropped her notebook beside it.',
        objectives: [
          { id: 'scorch', text: 'Find the scorch where the Storm Stone struck', interact: 'obj:storm-stone-scorch', marker: { landmark: 'landmark:root-tuning-chamber' } },
          { id: 'book', text: 'Find Tess’s notebook', interact: 'obj:tess-notebook', marker: { place: Z4 } },
        ],
        next: 'tess',
      },
      {
        id: 'tess', journal: 'The notebook is open at a drawing of a stone she couldn’t hold.',
        objectives: [{ id: 'tess', text: 'Give Tess back her notebook', talk: TA, marker: { landmark: 'landmark:tess-ampery-workshop' } }],
        onComplete: [{ setFlag: 'sparkwright.tess_devotable', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:sparkwright-bounty-belfry-thunderbirds', name: 'Bounty: the Belfry Thunderbirds', type: 'bounty', region: Z2, giver: 'npc:bunty-pyle',
    summary: 'A flock of hollow Thunderbirds roosts in the bell-towers of the Copper Spires and dives on anybody tall. Everybody in the Spires is tall, from below.',
    requires: req(done('quest:sparkwright-rod-duty')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'They nest in the belfries and strike in pairs.', objectives: [{ id: 'birds', text: 'Defeat the belfry Thunderbirds', kill: 'bx_storm_0', count: 6, marker: { place: Z2 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 150 },
  },
  {
    ...A1, id: 'quest:sparkwright-bounty-haywire-sentries', name: 'Bounty: the Haywire Sentries', type: 'bounty', region: Z3, giver: 'npc:bunty-pyle',
    summary: 'A gang of Coil Sentries has gone haywire in the Dynamo Halls and is arresting the wheels for being too round.',
    requires: req(done('quest:sparkwright-the-chancellors-tour')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'Six of them, marching in step, very confident.', objectives: [{ id: 'sentries', text: 'Defeat the haywire Sentries', kill: 'bx_storm_2', count: 6, marker: { place: Z3 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 120 },
  },

  // ======================= ACT II: the class thread (C-1 … C-6) + featured bearers
  // depth pass (wave 2): the kit-built Spire, escorting Prudence up the lightning-ladder, telling her, Volta's black sparks
  // round Gildport, the seat in the Engine's crown, and a reply down the wire
  {
    ...A2, id: 'quest:sparkwright-cliffstair', name: 'Cliffstair', type: 'class', region: 'vil:cliff', giver: 'npc:prudence-spindle',
    summary: 'Somewhere in Concordia there are Storm-folk who were stranded here when the arches shut. They will know where Storm’s Sentinel nests.',
    requires: req(done('quest:cc-through-the-arch')), autoStart: true, firstStage: 'spindle',
    stages: [
      {
        id: 'spindle', journal: 'Ysolde says the Storm-folk of Concordia keep a village on the Stormcliffs, called Cliffstair, under a Storm Spire that has never been switched on.',
        objectives: [{ id: 'prudence', text: 'Find the Storm-folk of Cliffstair', talk: 'npc:prudence-spindle', marker: { landmark: 'landmark:cliff-storm-spire' } }],
        next: 'spire',
      },
      {
        id: 'spire', journal: 'Parts one to five and seven to eleven, beautifully built. Prudence would very much like a Spirehold Sparkwright to look at the gap.',
        objectives: [{ id: 'spire', text: 'Look at the gap in the Cliffstair Storm Spire', interact: 'obj:sparkwright-kit-spire', marker: { landmark: 'landmark:cliff-storm-spire' } }],
        onComplete: [{ startQuest: 'quest:sparkwright-the-news-that-never-came' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-storm-cliffstair'] },
  },
  {
    ...A2, id: 'quest:sparkwright-the-news-that-never-came', name: 'The News That Never Came', type: 'class', region: 'region:storm', giver: 'npc:prudence-spindle',
    summary: 'The Stormcrow screams the news of a Turning that never came, and nobody at Cliffstair has climbed to its nest in thirty years. You will need a ladder. A lightning one.',
    requires: req(done('quest:sparkwright-cliffstair')), firstStage: 'ladder',
    stages: [
      {
        id: 'ladder', journal: 'Three old anchor-points on the Stormcliffs. Rig a lightning-ladder between them and ride the strikes up.',
        objectives: [{ id: 'ladder', text: 'Rig the lightning-ladder up the Stormcliffs', interact: 'obj:sparkwright-lightning-ladder-*', count: 3, marker: { region: 'region:storm' } }],
        next: 'escort',
      },
      {
        id: 'escort', journal: 'Prudence has heard the Stormcrow from the bottom of the cliff every evening since she was twelve. She wants to hear it from the top. The ladder holds, mostly, and the cliff is full of hollow things. Get her up alive.',
        onEnter: [{ escort: 'npc:prudence-spindle', to: 'landmark:sparkwright-ladder-head' }],
        objectives: [{ id: 'prudence', text: 'Bring Prudence safely up to the ladder-head', when: { any: [{ flag: 'escort.prudence-spindle', op: '==', value: 'arrived' }, { flag: 'escort.prudence-spindle', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:sparkwright-ladder-head' } }],
        next: [{ when: { flag: 'escort.prudence-spindle', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'read' }],
      },
      {
        id: 'regroup', journal: 'Prudence came off the ladder, and Cliffstair caught her in a tarpaulin they had been saving for exactly this. She has had a cup of tea and is ready to go up again.',
        onEnter: [{ escort: 'npc:prudence-spindle', to: 'landmark:sparkwright-ladder-head' }],
        objectives: [{ id: 'prudence', text: 'Try again: bring Prudence up to the ladder-head', when: { any: [{ flag: 'escort.prudence-spindle', op: '==', value: 'arrived' }, { flag: 'escort.prudence-spindle', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:sparkwright-ladder-head' } }],
        next: [{ when: { flag: 'escort.prudence-spindle', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'read' }],
      },
      {
        id: 'read', journal: 'Prudence is sitting on the ledge under the nest, singed and delighted, listening to the Stormcrow scream from close enough to hear the words.',
        objectives: [{ id: 'prudence', text: 'Hear what Prudence hears in the scream', talk: 'npc:prudence-spindle', marker: { landmark: 'landmark:sparkwright-ladder-head' } }],
        next: 'up',
      },
      {
        id: 'up', journal: 'The ladder holds. At the top of the cliffs, the Stormcrow is screaming.',
        objectives: [{ id: 'lair', text: 'Climb to the Stormcrow’s nest', reach: 'inst:sentinel-storm' }],
        onComplete: [{ startQuest: 'quest:sparkwright-the-stormcrow' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:sparkwright-the-stormcrow', name: 'The Stormcrow', type: 'class', region: 'region:storm', giver: 'npc:prudence-spindle',
    summary: 'The Stormcrow carried the Turning news across the ring for a thousand years. The tears found it first, and it has been screaming the same news ever since.',
    requires: req(done('quest:sparkwright-the-news-that-never-came')), firstStage: 'fight',
    stages: [
      {
        id: 'fight', journal: 'The Stormcrow is the Sentinel of the Storm school. Win its mark.',
        objectives: [{ id: 'crow', text: 'Defeat the Stormcrow', kill: 'bx_stormcrow', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-storm' }],
        next: 'release',
      },
      {
        id: 'release', journal: 'In its last breath the Stormcrow spoke to you.',
        objectives: [{ id: 'mark', text: 'Hear the Stormcrow out', when: { flag: 'story.sentinel.storm' } }],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'The Stormcliffs are quiet for the first time in thirty years. All of Cliffstair is out in the lane, looking up. Prudence will want the news.',
        objectives: [{ id: 'prudence', text: 'Tell Prudence what the Stormcrow said', talk: 'npc:prudence-spindle', marker: { landmark: 'landmark:cliff-storm-spire' } }],
        onComplete: [{ startQuest: 'quest:sparkwright-the-machine-age' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-stormcrow'] },
  },
  {
    ...A2, id: 'quest:sparkwright-the-machine-age', name: 'The Machine Age', type: 'class', region: 'vil:gild', giver: 'npc:clement-penhallow',
    summary: 'The old Sparkwright Works under Gildport have started running at night, very hot, on something black. A Chancellor’s harness has been seen on the clocktower.',
    requires: req(done('quest:sparkwright-the-stormcrow')), firstStage: 'sparks',
    stages: [
      {
        id: 'sparks', journal: 'Black sparks over Gildport at night, the Works-Clerk wrote, in eleven parts. Where there are sparks there are marks. Look before you ask.',
        objectives: [{ id: 'sparks', text: 'Find the marks of the black sparks round Gildport', interact: 'obj:sparkwright-black-spark-*', count: 3, marker: { region: 'region:gilded' } }],
        next: 'clement',
      },
      {
        id: 'clement', journal: 'The clerk of the Gildport Works keeps the ledgers, and the ledgers have started keeping themselves.',
        objectives: [
          { id: 'clement', text: 'Ask at the Sparkwright Works in Gildport', talk: 'npc:clement-penhallow', marker: { landmark: 'landmark:gild-sparkwright-works' } },
          { id: 'sixty', text: 'Ask Sentry Sixty-One what it has seen', talk: 'npc:sentry-sixty-one-gild', optional: true, marker: { landmark: 'landmark:gild-clocktower' } },
        ],
        next: 'furnace',
      },
      {
        id: 'furnace', journal: 'Under the Works, the oldest furnace of the buried city is burning black tears for fuel.',
        objectives: [{ id: 'furnace', text: 'Find the furnace under the Works', interact: 'obj:sparkwright-volta-tear-furnace', marker: { region: 'region:gilded' } }],
        onComplete: [{ startQuest: 'quest:sparkwright-the-gilded-engine' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:sparkwright-the-gilded-engine', name: 'The Gilded Engine', type: 'class', region: 'region:gilded', giver: 'npc:clement-penhallow',
    summary: 'Volta has promised the Gilded Engine, the forge that made the crown’s settings, a new crown to forge, with a seat in it for her.',
    requires: req(done('quest:sparkwright-the-machine-age')), firstStage: 'ruins',
    stages: [
      {
        id: 'ruins', journal: 'The Engine still runs, buried in the gold of the old Sparkwright city, and Volta is feeding it.',
        objectives: [{ id: 'lair', text: 'Go down into the Gilded Ruins', reach: 'inst:sentinel-iron', marker: { region: 'region:gilded' } }],
        next: 'engine',
      },
      {
        id: 'engine', journal: 'The Gilded Engine is the Sentinel of the Iron school. The Iron bearers cannot win its mark while Volta’s tears keep it burning.',
        objectives: [{ id: 'engine', text: 'Stop the Gilded Engine', kill: 'bx_engine', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-iron' }, { setFlag: 'story.bearer.juggernaut', value: true }],
        next: 'seat',
      },
      {
        id: 'seat', journal: 'The Engine is still. In its forge-bed lies the crown Volta ordered, half made, and there is a chair inside it.',
        objectives: [{ id: 'seat', text: 'Look at the crown Volta ordered', interact: 'obj:sparkwright-volta-seat' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-engine'] },
  },
  {
    ...A2, id: 'quest:sparkwright-stop-proud-of-you-stop', name: 'Telegram', type: 'class', region: 'vil:brind', giver: TA,
    summary: 'A copper wire runs out of the Storm arch into the grass of the Gate Circle. Late at night, it has started to clack.',
    requires: req(done('quest:sparkwright-the-gilded-engine')), autoStart: true, firstStage: 'wire',
    stages: [
      {
        id: 'wire', journal: 'Somebody has strung a telegraph wire through the Copper Gate. Listen at the end of it, at night, when the line is quiet.',
        objectives: [{ id: 'wire', text: 'Read the telegraph at the Storm arch, at night', when: { flag: 'sparkwright.telegram' }, marker: { landmark: 'landmark:gate-circle' } }],
        next: 'chord',
      },
      {
        id: 'chord', journal: 'The Tower half is crackling towards the Stone Court, and something there is crackling back.',
        objectives: [{ id: 'court', text: 'Hear the two Storm halves together at the Stone Court', when: { questCompleted: 'quest:cc-stone-court' }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ openDialogue: 'dialogue:sparkwright-tower-and-eye' }],
        next: 'reply',
      },
      {
        id: 'reply', journal: '“STOP” is not much of an answer to a telegram from home. The key by the Storm arch is still on the line.',
        objectives: [{ id: 'reply', text: 'Tap a proper reply to Tess at the Storm arch', interact: 'obj:sparkwright-tess-telegraph', marker: { landmark: 'landmark:gate-circle' } }],
        onComplete: [{ setFlag: 'story.act2_ready', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:sparkwright-spark-and-ember', name: 'Spark and Ember', type: 'side', region: 'vil:gild', giver: 'npc:bearer-arcanist',
    summary: 'The Arcanist bearer has built a furnace at Gildport that won’t catch, and you have built a tower-machine that won’t start. It may be the same problem from opposite ends.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'furnace',
    stages: [
      {
        id: 'furnace', journal: 'Ottoline Pyre’s furnace stands cold beside the Gildport Works. It wants a spark at the exact moment it gets an ember.',
        objectives: [{ id: 'furnace', text: 'Light the furnace with the Arcanist bearer', interact: 'obj:sparkwright-ottoline-furnace', marker: { landmark: 'landmark:gild-sparkwright-works' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'The furnace roared and the tower hummed. Ottoline wants a word at the Stone Court.',
        objectives: [{ id: 'ottoline', text: 'Talk to the Arcanist bearer', when: { any: [{ flag: 'sparkwright.ottoline_thanked' }, { partyHasClass: 'arcanist' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.arcanist', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A2, id: 'quest:sparkwright-the-long-way-up', name: 'The Long Way Up', type: 'side', region: 'region:storm', giver: 'npc:bearer-monk',
    summary: 'The Monk bearer means to climb the Stormcliffs with no machines at all, no ladder, no rope, and a pot of tea.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'ledges',
    stages: [
      {
        id: 'ledges', journal: 'Brother Sefu is already halfway up the first pitch, barefoot, with a teapot on his back. Keep up, or carry the tea.',
        objectives: [{ id: 'ledges', text: 'Climb the Stormcliffs with the Monk bearer', interact: 'obj:sparkwright-sefu-tea-ledge-*', count: 3, marker: { region: 'region:storm' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'At the top, Sefu poured the tea, and it was still hot. He wants a word at the Stone Court.',
        objectives: [{ id: 'sefu', text: 'Talk to the Monk bearer', when: { any: [{ flag: 'sparkwright.sefu_thanked' }, { partyHasClass: 'monk' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.monk', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  // ======================= ACT III: class quests (III-4 + 3 side)
  {
    ...A3, id: 'quest:sparkwright-the-copper-herald', name: 'The Copper Herald', type: 'class', region: 'region:heart', giver: 'npc:casimir',
    summary: 'At the top of the Twelve Stairs stands the Hollow King’s Herald, in a robe of copper wire and a crown of coils, ringing a bell that is a dynamo and never stops turning. It is Volta Sterne, and her cuffs are still clean.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'herald',
    stages: [
      { id: 'herald', journal: 'Volta has become the Copper Herald: a switch held down for ever, so that nothing she loves will ever fall again.', objectives: [{ id: 'herald', text: 'Face the Copper Herald', kill: 'cb_copper-herald', count: 1, marker: { landmark: 'landmark:twelve-stairs-top' } }], onComplete: [{ openDialogue: 'dialogue:sparkwright-herald-fate' }], next: 'fate' },
      { id: 'fate', journal: 'The dynamo bell is winding down. Volta is on her knees with her hand still clamped round the switch.', objectives: [{ id: 'fate', text: 'Decide Volta’s fate', when: { flag: 'sparkwright.nemesis_fate' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 3 },
  },
  {
    ...A3, id: 'quest:sparkwright-tess-last-patent', name: 'Tess’s Last Patent', type: 'side', region: 'region:heart', giver: TA,
    summary: 'The copper wire from the Storm arch has followed you all the way to the edge of the Heart, somehow, and the key at the end of it is clacking.',
    requires: req({ flag: 'sparkwright.telegram' }, done('quest:heart-citadel')), autoStart: true, firstStage: 'wire',
    stages: [
      { id: 'wire', journal: 'Tess is sending something down the wire. It sounds long.', objectives: [{ id: 'wire', text: 'Take down Tess’s telegram at the Heart camp', interact: 'obj:sparkwright-heart-telegraph', marker: { landmark: 'landmark:heart-camp' } }], next: 'witness' },
      { id: 'witness', journal: 'Tess’s last design: a crown that hums instead of holds. Every patent needs a witness, and she wants this one witnessed by the crown itself.', objectives: [{ id: 'witness', text: 'Have the patent witnessed in sight of the crown', interact: 'obj:sparkwright-patent-witness', marker: { landmark: 'landmark:twelve-stairs-top' } }], next: 'file' },
      {
        id: 'file', journal: 'A patent isn’t a patent until it’s filed, and the Patent Office is at the other end of a very long wire.',
        objectives: [{ id: 'file', text: 'Send the witnessed patent home down the wire', interact: 'obj:sparkwright-heart-telegraph', marker: { landmark: 'landmark:heart-camp' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:sparkwright-the-chancellors-engineers', name: 'The Chancellor’s Engineers', type: 'side', region: 'region:heart', giver: TA,
    summary: 'Volta’s loyal Guild engineers followed her into the Heart. They are standing hollow in the Legion camp in their good cuffs, taking measurements of nothing.',
    requires: req(done('quest:heart-legion')), autoStart: true, firstStage: 'measure',
    stages: [
      { id: 'measure', journal: 'A neat rank of Coil Guild engineers, measuring the empty air, over and over.', objectives: [{ id: 'engineers', text: 'Bring back the Chancellor’s engineers', interact: 'obj:sparkwright-guild-engineers', marker: { landmark: 'landmark:legion-camp' } }], next: 'ask' },
      {
        id: 'ask', journal: 'The engineers are awake, and they won’t leave. The Chancellor’s last order was “hold until relieved”, and only a master of the Guild can relieve them. The eldest master is at the end of the wire.',
        objectives: [{ id: 'ask', text: 'Ask the Guildmother to relieve them, by telegraph', interact: 'obj:sparkwright-heart-telegraph', marker: { landmark: 'landmark:heart-camp' } }],
        next: 'relieve',
      },
      {
        id: 'relieve', journal: 'You have the Guildmother’s order. Read it to them.',
        objectives: [{ id: 'relieve', text: 'Relieve the Chancellor’s engineers', interact: 'obj:sparkwright-guild-engineers', marker: { landmark: 'landmark:legion-camp' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A3, id: 'quest:sparkwright-sixty-one-flies-home', name: 'Sixty-One Flies Home', type: 'side', region: 'region:heart', giver: 'npc:sentry-sixty-one-heart',
    summary: 'Sentry Sixty-One has decided it is a homing pigeon, and it has decided that home is the crown.',
    requires: req(done('quest:heart-legion'), done('quest:sparkwright-sentry-sixty-one')), autoStart: true, firstStage: 'coo',
    stages: [
      { id: 'coo', journal: 'A Coil Sentry the size of a wardrobe is roosting on the Heart camp’s cook-tent, looking at the Citadel the way pigeons look at a loft.', objectives: [{ id: 'sixty', text: 'Find Sentry Sixty-One at the Heart camp', talk: 'npc:sentry-sixty-one-heart', marker: { landmark: 'landmark:heart-camp' } }], next: 'chase' },
      { id: 'chase', journal: 'Sixty-One is off up the Twelve Stairs, and it is not stopping for anybody. Catch it before it reaches the throne.', objectives: [{ id: 'catch', text: 'Catch Sentry Sixty-One at the top of the stairs', interact: 'obj:sparkwright-sixty-one-perch', marker: { landmark: 'landmark:twelve-stairs-top' } }], next: 'home' },
      {
        id: 'home', journal: 'Sixty-One is back on the cook-tent, which has given up. The tag on its leg still asks where home is. Somebody ought to answer it.',
        objectives: [{ id: 'sixty', text: 'Answer the tag on Sixty-One’s leg', talk: 'npc:sentry-sixty-one-heart', marker: { landmark: 'landmark:heart-camp' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
];

export default quests;
