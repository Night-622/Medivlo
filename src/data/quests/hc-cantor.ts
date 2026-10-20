/**
 * Hollow Crown: the CANTOR campaign (docs/lore/hollow-crown/06-outlines/radiance.md). Act I in Dawnspire
 * (area:radiance-capital) and the Act II class thread in Concordia. Dawnspire has no night (08 R19): its night
 * beats happen in the Hour of Lamps. Act III class quests land with the Heart. Owner: Claude 4.
 */
import type { NarrativeCondition, QuestDef } from '@/core';

const CAN: NarrativeCondition = { heroClass: 'cantor' };
const done = (q: `quest:${string}`): NarrativeCondition => ({ questCompleted: q });
const req = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: [CAN, ...c] });
const A1 = { act: 'act1' as const, campaign: 'cantor', chapter: 'Dawnspire' };
const A2 = { act: 'act2' as const, campaign: 'cantor', chapter: 'Concordia' };
const A3 = { act: 'act3' as const, campaign: 'cantor', chapter: 'The Heart' };
const Z1 = 'zone:radiance-capital-1' as const, Z2 = 'zone:radiance-capital-2' as const, Z3 = 'zone:radiance-capital-3' as const, Z4 = 'zone:radiance-capital-4' as const;
const L1 = 'inst:radiance-capital-lair-1' as const, L2 = 'inst:radiance-capital-lair-2' as const, L3 = 'inst:radiance-capital-lair-3' as const;
const CH = 'npc:celestine-hale' as const, LU = 'npc:lucan-brightwater' as const, AM = 'npc:sister-amabel' as const, OB = 'npc:osgood-bellamy' as const;

const quests: QuestDef[] = [
  // ======================= ACT I: main (I-1 … I-10)
  {
    ...A1, id: 'quest:cantor-the-hour-of-no-night', name: 'The Hour of No Night', type: 'main', region: Z1, giver: CH,
    summary: 'In the Hour of Lamps, when the Sun Cathedral turns its light down one notch, a bell rang from very far away. For one heartbeat Dawnspire went dark, and the whole city saw a star.',
    requires: CAN, autoStart: true, firstStage: 'steps',
    stages: [
      {
        id: 'steps', journal: 'You dozed off mid-hymn on the Close steps, and woke saying something you should not have said. Something in your chest is still singing.',
        onEnter: [{ openDialogue: 'dialogue:cantor-hour-of-lamps' }],
        objectives: [{ id: 'steps', text: 'Take your place again on the Close steps', reach: 'landmark:close-steps', marker: { landmark: 'landmark:close-steps' } }],
        next: 'lamps',
      },
      {
        id: 'lamps', journal: 'The Bell blew out three of the Close lamps. In Dawnspire an unlit lamp is a confession. Sing them alight before anyone notices.',
        objectives: [{ id: 'lamps', text: 'Sing the guttered lamps on the Close steps alight', interact: 'obj:close-lamp-*', count: 3, marker: { landmark: 'landmark:close-steps' } }],
        next: 'celestine',
      },
      {
        id: 'celestine', journal: 'Mother Celestine, the Choir-mistress, is coming down the steps very fast, and so is a sergeant of the Brightwatch.',
        objectives: [{ id: 'celestine', text: 'Speak to Mother Celestine', talk: CH, marker: { landmark: 'landmark:close-steps' } }],
        onComplete: [{ setFlag: 'cantor.bell_heard', value: true }],
        next: 'cell',
      },
      {
        id: 'cell', journal: 'The Hour of Lamps is over, and so is Lauds. Celestine told you to come to her cell in the Choir Cloisters, with your mouth shut and your collar done up.',
        objectives: [{ id: 'celestine', text: 'Go to Mother Celestine’s cell in the Choir Cloisters', talk: CH, marker: { landmark: 'landmark:celestine-cell' } }],
        onComplete: [{ startQuest: 'quest:cantor-the-sleepers-census' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-solaria', 'lore:hc-hour-of-lamps'] },
  },
  {
    ...A1, id: 'quest:cantor-the-sleepers-census', name: 'The Sleepers’ Census', type: 'main', region: Z1, giver: CH,
    summary: 'Sleeping in the Hours of Light is forbidden. Mother Celestine wants the novices who have nodded off round the Close woken before the Brightwatch counts them.',
    requires: req(done('quest:cantor-the-hour-of-no-night')), firstStage: 'novices',
    stages: [
      {
        id: 'novices', journal: 'Six novices are asleep in corners of the Cathedral Close. Wake them gently. Wake them quickly.',
        objectives: [{ id: 'novices', text: 'Wake the sleeping novices round the Cathedral Close', interact: 'obj:sleeping-novice-*', count: 6, marker: { place: Z1 } }],
        next: 'lightbearers',
      },
      {
        id: 'lightbearers', journal: 'They were not asleep. They were weeping black in their sleep. And the Lightbearers of the squares have gone hollow, looking for anyone who is not singing.',
        objectives: [{ id: 'lightbearers', text: 'Put down the hollow Lightbearers', kill: 'bx_radiance_0', count: 4, marker: { place: Z1 } }],
        next: 'book',
      },
      {
        id: 'book', journal: 'Every sleeper the Brightwatch catches goes into the Book of Sleepers, chained in the porch of the Brightwatch House. If your six are in it, Celestine will want to know before the Brightwatch comes for them.',
        objectives: [{ id: 'book', text: 'Read the Brightwatch’s Book of Sleepers', interact: 'obj:cantor-sleepers-book', marker: { landmark: 'landmark:brightwatch-house' } }],
        next: 'report',
      },
      {
        id: 'report', journal: 'The novices are awake, and frightened, and singing. Celestine will want to know what you saw.',
        objectives: [{ id: 'celestine', text: 'Report to Mother Celestine in her cell', talk: CH, marker: { landmark: 'landmark:celestine-cell' } }],
        onComplete: [{ startQuest: 'quest:cantor-the-bell-loft' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40, lore: ['lore:hc-cathedral-choir'] },
  },
  {
    ...A1, id: 'quest:cantor-the-bell-loft', name: 'The Bell Loft', type: 'main', region: Z2, giver: CH,
    summary: 'The Cathedral’s great bell is rung every minute to keep Dawnspire awake. Since the Drowned Bell it has not stopped at all, and the Choir is falling over on its feet.',
    requires: req(done('quest:cantor-the-sleepers-census')), firstStage: 'stair',
    stages: [
      {
        id: 'stair', journal: 'Two hundred and twelve steps to the Bell Loft. The bell is ringing so hard the stair is shaking.',
        objectives: [{ id: 'enter', text: 'Climb the Bell Loft stair', reach: L1, marker: { landmark: 'landmark:bell-loft-stair' } }],
        next: 'seraph',
      },
      {
        id: 'seraph', journal: 'Something with six wings is swinging the bell. Hide in the shadow the bell throws, and cut the ropes.',
        objectives: [{ id: 'seraph', text: 'Defeat the Seraph of the Last Light', kill: 'bx_radiance_4', count: 1 }],
        next: 'muffle',
      },
      {
        id: 'muffle', journal: 'The ropes are cut, but the bell is still swinging on its own weight.',
        objectives: [{ id: 'muffle', text: 'Muffle the great bell', interact: 'obj:great-bell-muffle' }],
        next: 'report',
      },
      {
        id: 'report', journal: 'For the first time in thirty years, the great bell of Dawnspire is quiet.',
        objectives: [{ id: 'celestine', text: 'Tell Mother Celestine', talk: CH, marker: { landmark: 'landmark:celestine-cell' } }],
        onComplete: [{ setFlag: 'cantor.bell_loft_quiet', value: true }, { startQuest: 'quest:cantor-the-inquisitors-kindness' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 80, hcItems: [{ item: 'i_scroll_radiance', qty: 2 }], lore: ['lore:hc-sun-cathedral'] },
  },
  {
    ...A1, id: 'quest:cantor-the-inquisitors-kindness', name: 'The Inquisitor’s Kindness', type: 'main', region: Z3, giver: LU,
    summary: 'The Brightwatch is raiding the sleep-draught sellers of the Sunward Market. Its Inquisitor would like to thank the Cantor who quieted the bell.',
    requires: req(done('quest:cantor-the-bell-loft')), firstStage: 'market',
    stages: [
      {
        id: 'market', journal: 'A Brightwatch summons, very politely worded: Inquisitor Lucan Brightwater, at the Sunward Market Cross.',
        objectives: [{ id: 'lucan', text: 'Meet the Inquisitor at the Market Cross', talk: LU, marker: { landmark: 'landmark:sunward-market-cross' } }],
        onComplete: [{ setFlag: 'cantor.lucan_met', value: true }],
        next: 'raid',
      },
      {
        id: 'raid', journal: 'The Brightwatch is packing up the draught-stalls along the Market’s back row. Before you go looking for the stair, look at what they are taking away.',
        objectives: [{ id: 'stalls', text: 'Look over the raided draught-stalls', interact: 'obj:cantor-draught-stall-*', count: 3, marker: { place: Z3 } }],
        next: 'way',
      },
      {
        id: 'way', journal: 'Lucan says the night-sellers get their draughts from somewhere under the Cathedral. There is a stair behind the Market that nobody admits to.',
        objectives: [{ id: 'door', text: 'Find the way down into the Undercroft', interact: 'obj:undercroft-door', marker: { landmark: 'landmark:undercroft-stair' } }],
        onComplete: [{ startQuest: 'quest:cantor-the-jars-of-night' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-brightwatch'] },
  },
  {
    ...A1, id: 'quest:cantor-the-jars-of-night', name: 'The Jars of Night', type: 'main', region: Z4, giver: AM,
    summary: 'Under the Cathedral the forbidden night is kept in jars, and Sister Amabel keeps the jars. The Brightwatch wants them broken in the sun. The Choir wants one opened, so the novices can sleep.',
    requires: req(done('quest:cantor-the-inquisitors-kindness')), firstStage: 'canvass',
    stages: [
      {
        id: 'canvass', journal: 'Everyone will want something done with the jars of night. Before you go down, hear the two who will ask hardest: Brother Lambert for the Choir, and Sergeant Bellamy for the Brightwatch.',
        objectives: [
          { id: 'lambert', text: 'Hear Brother Lambert out', talk: 'npc:lambert-dewhurst', marker: { landmark: 'landmark:moonflower-bed' } },
          { id: 'bellamy', text: 'Hear Sergeant Bellamy out', talk: 'npc:osgood-bellamy', marker: { landmark: 'landmark:brightwatch-house' } },
        ],
        next: 'jars',
      },
      {
        id: 'jars', journal: 'Shelf after shelf of stoppered jars, each labelled in a neat hand: a night, and the year it was kept. Everyone wants something done with them, and they are looking at you.',
        objectives: [{ id: 'jars', text: 'Decide what becomes of the jars of night', when: { flag: 'cantor.night_jars' }, marker: { landmark: 'landmark:undercroft-jar-shelves' } }],
        next: 'jar',
      },
      {
        id: 'jar', journal: 'The decision is made. Now somebody has to pick up a jar.',
        objectives: [{ id: 'jar', text: 'Take up the night-jar', interact: 'obj:night-jar', marker: { landmark: 'landmark:undercroft-jar-shelves' } }],
        onComplete: [{ startQuest: 'quest:cantor-the-reliquary-of-hours' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-undercroft'] },
  },
  {
    ...A1, id: 'quest:cantor-the-reliquary-of-hours', name: 'The Reliquary of Hours', type: 'main', region: Z2, giver: CH,
    summary: 'Whatever was done with the jars, someone is going down into the Reliquary of Hours. It holds every relic the Cathedral was ever sold, and most of them are lies.',
    requires: req(done('quest:cantor-the-jars-of-night')), firstStage: 'celestine',
    stages: [
      {
        id: 'celestine', journal: 'Celestine has heard about the Undercroft. She would like a word, in her cell, with the door shut.',
        objectives: [{ id: 'celestine', text: 'Speak to Mother Celestine', talk: CH, marker: { landmark: 'landmark:celestine-cell' } }],
        next: 'vault',
      },
      {
        id: 'vault', journal: 'The Reliquary door is under the Cloisters, behind a curtain nobody has drawn back in years.',
        objectives: [{ id: 'enter', text: 'Go down into the Reliquary of Hours', reach: L2, marker: { landmark: 'landmark:reliquary-door' } }],
        next: 'saint',
      },
      {
        id: 'saint', journal: 'The false relics have got up and put themselves together. It is mostly pigs’ knuckles, and it is very angry.',
        objectives: [{ id: 'saint', text: 'Defeat the Saint Who Wasn’t', kill: 'cb_saint-who-wasnt', count: 1 }],
        next: 'box',
      },
      {
        id: 'box', journal: 'In the ribcage of the thing, where the fakes fell away, is the one true relic in the vault: a Brightwatch evidence box.',
        objectives: [{ id: 'box', text: 'Open the evidence box', interact: 'obj:reliquary-evidence-box' }],
        onComplete: [{ setFlag: 'cantor.night_candle', value: true }, { startQuest: 'quest:cantor-the-last-night' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 120, lore: ['lore:hc-reliquary-of-hours'] },
  },
  {
    ...A1, id: 'quest:cantor-the-last-night', name: 'The Last Night', type: 'main', region: Z3, giver: LU,
    summary: 'A child’s night-candle in an evidence box, labelled “L. B., C. 1012”. Dawnspire’s last night was C. 1012. Somebody has kept this candle for thirty years.',
    requires: req(done('quest:cantor-the-reliquary-of-hours')), firstStage: 'celestine',
    stages: [
      {
        id: 'celestine', journal: 'Celestine will know whose initials those are. Celestine knows everyone’s.',
        objectives: [{ id: 'celestine', text: 'Show Celestine the night-candle', talk: CH, marker: { landmark: 'landmark:celestine-cell' } }],
        next: 'stall',
      },
      {
        id: 'stall', journal: 'Lucan’s mother sang alto in the Choir. Celestine says her stall in the Cloister quire has never been given to anyone else, and that somebody keeps it polished.',
        objectives: [{ id: 'stall', text: 'Look at the empty alto stall in the quire', interact: 'obj:cantor-alto-stall', marker: { landmark: 'landmark:cantor-alto-stall' } }],
        next: 'lucan',
      },
      {
        id: 'lucan', journal: 'L. B. is Lucan Brightwater. He is at the Brightwatch House. He is always at the Brightwatch House.',
        objectives: [{ id: 'lucan', text: 'Take the candle to Lucan Brightwater', talk: LU, marker: { landmark: 'landmark:brightwatch-house' } }],
        onComplete: [{ setFlag: 'cantor.lucan_known', value: true }, { startQuest: 'quest:cantor-the-high-altar' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-lucans-candle'] },
  },
  {
    ...A1, id: 'quest:cantor-the-high-altar', name: 'The High Altar', type: 'main', region: L3, giver: CH,
    summary: 'Lucan means to set the Altar half in the great lens of the Sun Cathedral and make the light permanent: no Dimming, no Undercroft, no dark anywhere in Solaria, ever.',
    requires: req(done('quest:cantor-the-last-night')), firstStage: 'altar',
    stages: [
      {
        id: 'altar', journal: 'Through the great doors of the Sun Cathedral, to the High Altar, where the lens burns. Your half-stone is singing so loudly it hurts your teeth.',
        objectives: [{ id: 'enter', text: 'Go up to the High Altar', reach: L3, marker: { landmark: 'landmark:cathedral-great-doors' } }],
        next: 'lucan',
      },
      {
        id: 'lucan', journal: 'He has turned the great lens on you. The only safe ground is shadow, and he is burning the shadows away one by one.',
        objectives: [{ id: 'lucan', text: 'Stop Inquisitor Lucan Brightwater', kill: 'cb_lucan-brightwater', count: 1 }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'Lucan went out along a beam of his own light. The Altar half is still on the High Altar, singing to you.',
        objectives: [{ id: 'stone', text: 'Lift the Altar half', interact: 'obj:radiance-capital-halfstone', marker: { landmark: 'landmark:great-lens' } }],
        onComplete: [{ setFlag: 'cantor.halfstone', value: true }, { startQuest: 'quest:cantor-the-dawn-road' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, skillPoints: 1, lore: ['lore:hc-half-stones', 'lore:hc-lucan-brightwater'] },
  },
  {
    ...A1, id: 'quest:cantor-the-dawn-road', name: 'The Dawn Road', type: 'main', region: Z2, giver: CH,
    summary: 'Lucan is running for the Dawn Gate, where the Fallen Hierarch waits behind his mask. The Altar half can open it. Mother Celestine wants to see you before you go.',
    requires: req(done('quest:cantor-the-high-altar')), firstStage: 'farewell',
    stages: [
      {
        id: 'farewell', journal: 'Celestine is waiting in her cell, sitting very straight, the way people sit when they are trying not to fall asleep.',
        objectives: [{ id: 'celestine', text: 'Say goodbye to Mother Celestine', talk: CH, marker: { landmark: 'landmark:celestine-cell' } }],
        onComplete: [{ setFlag: 'cantor.celestine_farewell', value: true }],
        next: 'sundial',
      },
      {
        id: 'sundial', journal: 'Halfway down the Dawn Road stands the pilgrims’ sundial, which has not told the time in thirty years, because nothing in Solaria casts a shadow that moves.',
        objectives: [{ id: 'dial', text: 'Stop at the pilgrims’ sundial on the Dawn Road', interact: 'obj:cantor-road-sundial', marker: { landmark: 'landmark:cantor-road-sundial' } }],
        next: 'road',
      },
      {
        id: 'road', journal: 'The Dawn Road runs east out of the city, white and straight, to the gate where the light is brightest.',
        objectives: [{ id: 'gate', text: 'Take the Dawn Road to the gate', reach: 'area:radiance-gate', marker: { place: 'area:radiance-gate' } }],
        onComplete: [{ startQuest: 'quest:cantor-the-dawn-gate' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:cantor-the-dawn-gate', name: 'The Dawn Gate', type: 'main', region: 'area:radiance-gate', giver: CH,
    summary: 'The Fallen Hierarch has shut himself in the light at the Dawn Gate, weeping black behind his golden mask. Beyond the gate is Concordia, and Lucan, and whatever rang the Bell.',
    requires: req(done('quest:cantor-the-dawn-road')), firstStage: 'hierarch',
    stages: [
      {
        id: 'hierarch', journal: 'He blazes. Sing the light down between his fires until you can reach his mask.',
        onEnter: [{ openDialogue: 'dialogue:cantor-hierarch' }],
        objectives: [{ id: 'hierarch', text: 'Sing down the Fallen Hierarch', kill: 'bx_radiance_5', count: 1 }],
        next: 'gate',
      },
      {
        id: 'gate', journal: 'The Hierarch is on his knees with his mask in his hands. Behind him the gate is weeping black tears down its white face.',
        objectives: [{ id: 'seal', text: 'Open the Dawn Gate with the half-stone', interact: 'obj:radiance-gate-seal' }],
        onComplete: [{ setFlag: 'story.gate_open', value: true }, { setFlag: 'story.act', value: 2 }, { setFlag: 'cantor.act1_done', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 200, lore: ['lore:hc-realm-gates', 'lore:hc-fallen-hierarch'] },
  },

  // ======================= ACT I: side quests (2 per zone)
  {
    ...A1, id: 'quest:cantor-the-word-for-it', name: 'The Word for It', type: 'side', region: Z1, giver: OB,
    summary: 'Sergeant Osgood Bellamy must fine anyone who says the word for it, and he fines himself every morning for dreaming. He would like a word for it that isn’t illegal.',
    requires: req(done('quest:cantor-the-hour-of-no-night')), firstStage: 'ask',
    stages: [
      {
        id: 'ask', journal: 'Ask round Dawnspire what people call it, quietly. Bellamy will not fine you for asking. He will fine you for answering.',
        objectives: [
          { id: 'lambert', text: 'Ask the gardener in the Cloisters', talk: 'npc:lambert-dewhurst', marker: { landmark: 'landmark:moonflower-bed' } },
          { id: 'tobit', text: 'Ask a novice in the Cloisters', talk: 'npc:tobit-lark', marker: { landmark: 'landmark:choir-dormitory' } },
          { id: 'albin', text: 'Ask the grocer in the Sunward Market', talk: 'npc:albin-mote', marker: { landmark: 'landmark:mote-stall' } },
        ],
        next: 'bellamy',
      },
      {
        id: 'bellamy', journal: 'You have three candidates and a sergeant with a fine-book.',
        objectives: [{ id: 'word', text: 'Give Sergeant Bellamy his word', when: { flag: 'cantor.bellamy_word' }, marker: { landmark: 'landmark:brightwatch-house' } }],
        next: 'book',
      },
      {
        id: 'book', journal: 'Bellamy has torn this morning’s page out of his own fine-book. The book itself is on the Brightwatch House steps, thirty years thick. He says you may as well see what he has been paying for.',
        objectives: [{ id: 'book', text: 'Read Sergeant Bellamy’s own fine-book', interact: 'obj:cantor-fine-book', marker: { landmark: 'landmark:cantor-fine-book-desk' } }],
        onComplete: [{ setFlag: 'cantor.fine_book', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:cantor-the-pilgrim-who-saw-stars', name: 'The Pilgrim Who Saw Stars', type: 'side', region: Z1, giver: 'npc:prue-haverlock',
    summary: 'Prue Haverlock walked all the way from the Gilded March to report a miracle: the Dimming has stars in it. The Brightwatch would like her to stop saying so.',
    requires: req(done('quest:cantor-the-sleepers-census')), firstStage: 'robe',
    stages: [
      {
        id: 'robe', journal: 'Nobody looks twice at a novice. Find Prue a spare robe in the Choir vestry.',
        objectives: [{ id: 'robe', text: 'Borrow a novice’s robe from the vestry', interact: 'obj:choir-spare-robe', marker: { place: Z2 } }],
        next: 'postern',
      },
      {
        id: 'postern', journal: 'The Close postern is watched in every hour but one. In the Hour of Lamps the watch trims its lamp, and looks at the lamp.',
        objectives: [{ id: 'postern', text: 'Slip Prue out of the postern in the Hour of Lamps', when: { flag: 'cantor.prue_home' }, marker: { landmark: 'landmark:close-postern' } }],
        next: 'stars',
      },
      {
        id: 'stars', journal: 'At the bend in the March road Prue pointed at the sky and mouthed “salt”. The highest window in Dawnspire is in the Bell Loft. In the Hour of Lamps, when the light dips, go up and look where she pointed.',
        objectives: [{ id: 'stars', text: 'Look for Prue’s stars from the Bell Loft window, in the Hour of Lamps', when: { flag: 'cantor.salt_stars' }, marker: { landmark: 'landmark:bell-loft-stair' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_bread', qty: 3 }] },
  },
  {
    ...A1, id: 'quest:cantor-nodding-off', name: 'Nodding Off', type: 'side', region: Z2, giver: 'npc:tobit-lark',
    summary: 'Novice Tobit Lark keeps falling asleep in the middle of hymns. If he does it once more at Lauds, the Brightwatch will have him for it.',
    requires: req(done('quest:cantor-the-sleepers-census')), firstStage: 'lauds',
    stages: [
      {
        id: 'lauds', journal: 'Stand next to Tobit at Lauds and sing his part as well as yours. Both parts. All of Lauds.',
        objectives: [{ id: 'lauds', text: 'Sing Lauds for two', interact: 'obj:lauds-lectern', marker: { place: Z2 } }],
        next: 'tobit',
      },
      {
        id: 'tobit', journal: 'Lauds is sung. Tobit slept through most of it, standing up, with his mouth moving.',
        objectives: [{ id: 'tobit', text: 'Wake Tobit gently', talk: 'npc:tobit-lark', marker: { landmark: 'landmark:choir-dormitory' } }],
        onComplete: [{ setFlag: 'cantor.tobit_covered', value: true }],
        next: 'jar',
      },
      {
        id: 'jar', journal: 'Tobit doesn’t nap because he’s lazy. He has a jar under his mattress, borrowed from the Undercroft: “a quiet night, C. 1011”. He opens it a crack every evening. He would like it taken back before anyone finds it.',
        objectives: [{ id: 'amabel', text: 'Return Tobit’s jar to Sister Amabel', talk: AM, marker: { landmark: 'landmark:undercroft-jar-shelves' } }],
        onComplete: [{ setFlag: 'cantor.tobit_jar', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 30 },
  },
  {
    ...A1, id: 'quest:cantor-the-moonflower', name: 'The Moonflower', type: 'side', region: Z2, giver: 'npc:lambert-dewhurst',
    summary: 'The Cloister garden has a bed of moonflowers that has not bloomed in thirty years, because moonflowers only open at night. Brother Lambert has never stopped watering them.',
    requires: req(done('quest:cantor-the-inquisitors-kindness')), firstStage: 'cut',
    stages: [
      {
        id: 'cut', journal: 'Take a cutting from the moonflower bed. Brother Lambert says to be gentle; it is older than both of you put together.',
        objectives: [{ id: 'cut', text: 'Take a moonflower cutting', interact: 'obj:moonflower-cutting', marker: { landmark: 'landmark:moonflower-bed' } }],
        next: 'dark',
      },
      {
        id: 'dark', journal: 'There is one dark place in Dawnspire. Plant the cutting there.',
        objectives: [{ id: 'plant', text: 'Plant the moonflower in the Undercroft’s dark', interact: 'obj:undercroft-dark-bed', marker: { place: Z4 } }],
        next: 'lambert',
      },
      {
        id: 'lambert', journal: 'It opened. It opened in your hands, white as a held breath.',
        objectives: [{ id: 'lambert', text: 'Tell Brother Lambert it bloomed', talk: 'npc:lambert-dewhurst', marker: { landmark: 'landmark:moonflower-bed' } }],
        onComplete: [{ setFlag: 'cantor.moonflower', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_herb', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:cantor-madame-lulls-draughts', name: 'Madame Lull’s Draughts', type: 'side', region: Z3, giver: 'npc:dovina-lull',
    summary: 'Madame Dovina Lull sells sleep-draughts from a cart that never stays in one place. The Brightwatch is two streets behind her, and closing.',
    requires: req(done('quest:cantor-the-inquisitors-kindness')), firstStage: 'cart',
    stages: [
      {
        id: 'cart', journal: 'The cart has moved again. Follow the wheel-ruts and the little blue bottles she drops on purpose for her regulars.',
        objectives: [{ id: 'trail', text: 'Follow Madame Lull’s cart', interact: 'obj:lull-cart-trail-*', count: 3, marker: { landmark: 'landmark:lull-cart' } }],
        next: 'choice',
      },
      {
        id: 'choice', journal: 'You have found the cart. So, very nearly, has the Brightwatch.',
        objectives: [{ id: 'lull', text: 'Decide what to do about Madame Lull', when: { flag: 'cantor.lull' }, marker: { landmark: 'landmark:lull-cart' } }],
        next: 'infirmary',
      },
      {
        id: 'infirmary', journal: 'Whatever became of Madame Lull, one crate of her draughts is left over, and somebody has put it in your hands. The Cloister infirmary has forty novices who have never slept. Brother Lambert keeps its herbs.',
        objectives: [{ id: 'lambert', text: 'Take the last crate of draughts to Brother Lambert', talk: 'npc:lambert-dewhurst', marker: { landmark: 'landmark:moonflower-bed' } }],
        onComplete: [{ setFlag: 'cantor.lull_crate', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 60 },
  },
  {
    ...A1, id: 'quest:cantor-closed-for-one-hour', name: 'Closed for One Hour', type: 'side', region: Z3, giver: 'npc:albin-mote',
    summary: 'Grocer Albin Mote would like to close his stall for one hour, just once, before he dies. The Market Charter forbids it.',
    requires: req(done('quest:cantor-the-inquisitors-kindness')), firstStage: 'charter',
    stages: [
      {
        id: 'charter', journal: 'The Market Charter is nailed to the Market Cross, all forty clauses of it. Somewhere in there is a way out.',
        objectives: [{ id: 'charter', text: 'Read the Market Charter', interact: 'obj:market-charter', marker: { landmark: 'landmark:sunward-market-cross' } }],
        next: 'albin',
      },
      {
        id: 'albin', journal: 'Clause thirty-nine: a stall may close “for reasons of darkness”. There is one hour a day with a reason of darkness in it.',
        objectives: [{ id: 'albin', text: 'Tell Albin about clause thirty-nine', talk: 'npc:albin-mote', marker: { landmark: 'landmark:mote-stall' } }],
        next: 'shutters',
      },
      {
        id: 'shutters', journal: 'Albin will close in the Hour of Lamps. He would like a witness, and help with the shutters, which have never been shut.',
        objectives: [{ id: 'shutters', text: 'Close Albin’s shutters in the Hour of Lamps', when: { flag: 'cantor.albin_closed' }, marker: { landmark: 'landmark:mote-stall' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_apple', qty: 4 }, { item: 'i_cheese', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:cantor-rain-at-night', name: 'Rain at Night', type: 'side', region: Z4, giver: 'npc:orla-penwright',
    summary: 'Old Orla Penwright is nearly blind and very nearly done. She would like to hear one jar on the Undercroft shelves before she goes: “rain at night, C. 1009”.',
    requires: req(done('quest:cantor-the-inquisitors-kindness')), firstStage: 'jar',
    stages: [
      {
        id: 'jar', journal: 'Somewhere among ten thousand nights on the shelves is a jar marked “rain at night, C. 1009”.',
        objectives: [{ id: 'jar', text: 'Find the jar of rain at night', interact: 'obj:jar-rain-1009', marker: { landmark: 'landmark:undercroft-jar-shelves' } }],
        next: 'orla',
      },
      {
        id: 'orla', journal: 'You have it. It is heavier than a jar of nothing ought to be.',
        objectives: [{ id: 'orla', text: 'Open the jar for Orla', talk: 'npc:orla-penwright', marker: { landmark: 'landmark:orla-alcove' } }],
        next: 'keep',
      },
      {
        id: 'keep', journal: 'When the rain ran dry, Orla asked for one more thing: that this hour, the one she spent listening, be kept on Amabel’s shelves, so that somebody will know it happened.',
        objectives: [{ id: 'amabel', text: 'Ask Sister Amabel to keep Orla’s hour', talk: AM, marker: { landmark: 'landmark:undercroft-jar-shelves' } }],
        onComplete: [{ setFlag: 'cantor.orla_kept', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:cantor-the-hierarchs-shadow', name: 'The Hierarch’s Shadow', type: 'side', region: Z4, giver: AM,
    summary: 'The Undercroft holds the only shadows in Dawnspire, and one of them belongs to nobody in the city. Sister Amabel knows whose it is.',
    requires: req(done('quest:cantor-the-jars-of-night')), firstStage: 'shadow',
    stages: [
      {
        id: 'shadow', journal: 'A tall shadow in a mitre, standing by itself against the far wall of the Undercroft. It has been waiting thirty years for its man.',
        objectives: [{ id: 'shadow', text: 'Bottle the Hierarch’s shadow', interact: 'obj:hierarchs-shadow', marker: { place: Z4 } }],
        onComplete: [{ setFlag: 'cantor.hierarch_shadow', value: true }],
        next: 'amabel',
      },
      {
        id: 'amabel', journal: 'It went into the jar the way a dog goes into a kennel: reluctantly, and looking back.',
        objectives: [{ id: 'amabel', text: 'Show Sister Amabel', talk: AM, marker: { landmark: 'landmark:undercroft-jar-shelves' } }],
        next: 'portrait',
      },
      {
        id: 'portrait', journal: 'The shadow keeps pressing against the glass towards the Cloisters. Amabel says there is a portrait of the Hierarch there, painted before he shut himself in the light: the only picture in Dawnspire with a shadow in it.',
        objectives: [{ id: 'portrait', text: 'Show the shadow the Hierarch’s old portrait', interact: 'obj:cantor-hierarch-portrait', marker: { landmark: 'landmark:cantor-hierarch-portrait' } }],
        onComplete: [{ setFlag: 'cantor.portrait_seen', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50 },
  },

  // ======================= ACT I: mentor thread (2) and bounties (2)
  {
    ...A1, id: 'quest:cantor-compline', name: 'Compline', type: 'side', region: Z3, giver: CH,
    summary: 'The Choir used to sing Compline, the evening hymn that sang the light down gently each day, until the Hierarch banned it. Celestine remembers the first line and nothing else.',
    requires: req({ trust: CH, value: 'friendly' }, done('quest:cantor-the-inquisitors-kindness')), firstStage: 'crate',
    stages: [
      {
        id: 'crate', journal: 'Celestine thinks the last copy was used to line a crate. Madame Lull’s crates, in particular. Madame Lull’s crates are old.',
        objectives: [{ id: 'crate', text: 'Search Madame Lull’s draught-crates', interact: 'obj:lull-draught-crate', marker: { landmark: 'landmark:lull-cart' } }],
        next: 'celestine',
      },
      {
        id: 'celestine', journal: 'Pasted inside the lid, under thirty years of spilt draught: Compline, every verse.',
        objectives: [{ id: 'celestine', text: 'Bring Compline to Celestine', talk: CH, marker: { landmark: 'landmark:celestine-cell' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, skillPoints: 1, lore: ['lore:hc-compline'] },
  },
  {
    ...A1, id: 'quest:cantor-six-years-awake', name: 'Six Years Awake', type: 'side', region: Z4, giver: CH,
    summary: 'Mother Celestine has not slept for six years. She has never said why, and you have never asked, and today she looks as if she might tell you.',
    requires: req({ trust: CH, value: 'trusted' }, done('quest:cantor-the-jars-of-night')), firstStage: 'why',
    stages: [
      {
        id: 'why', journal: 'Sit with Celestine in her cell, and ask.',
        objectives: [{ id: 'celestine', text: 'Ask Celestine why she does not sleep', talk: CH, marker: { landmark: 'landmark:celestine-cell' } }],
        next: 'amabel',
      },
      {
        id: 'amabel', journal: 'The Brightwatch took Sister Amabel six years ago. Celestine thinks she is dead. You know exactly where she is.',
        objectives: [{ id: 'amabel', text: 'Tell Sister Amabel that Celestine is asking for her', talk: AM, marker: { landmark: 'landmark:undercroft-jar-shelves' } }],
        next: 'together',
      },
      {
        id: 'together', journal: 'Amabel will not come up into the light. So Celestine is coming down.',
        objectives: [{ id: 'together', text: 'Bring Celestine down to the jar shelves', talk: CH, marker: { landmark: 'landmark:undercroft-jar-shelves' } }],
        onComplete: [{ setFlag: 'cantor.celestine_devotable', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:cantor-bounty-overzealous-acolytes', name: 'Bounty: the Overzealous Acolytes', type: 'bounty', region: Z1, giver: OB,
    summary: 'A knot of Zealous Acolytes has gone hollow in the Close and is fining people with sticks. The Brightwatch would like this to be somebody else’s problem.',
    requires: req(done('quest:cantor-the-sleepers-census')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'They sing the noon hymn at people until they fall over. Six of them.', objectives: [{ id: 'acolytes', text: 'Defeat the hollow Zealous Acolytes', kill: 'bx_radiance_1', count: 6, marker: { place: Z1 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 150 },
  },
  {
    ...A1, id: 'quest:cantor-bounty-lantern-lightbearers', name: 'Bounty: the Lantern Lightbearers', type: 'bounty', region: Z3, giver: OB,
    summary: 'The Lightbearers who light the Sunward Market’s lanterns have gone hollow, and are lighting the market instead.',
    requires: req(done('quest:cantor-the-inquisitors-kindness')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'Five of them, carrying lanterns full of black flame between the stalls.', objectives: [{ id: 'lightbearers', text: 'Defeat the hollow Lantern Lightbearers', kill: 'bx_radiance_0', count: 5, marker: { place: Z3 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 120 },
  },

  // ======================= ACT II: the class thread (C-1 … C-6) + featured bearers
  // depth pass (wave 2): Ysmay walked out along the old causeway, telling her, three scorched oaks that say who,
  // what Lucan left behind at Stag’s Rest, and an answer sent home
  {
    ...A2, id: 'quest:cantor-abbeyshore', name: 'The Shore Chapel', type: 'class', region: 'vil:shore', giver: 'npc:ysmay-penhallow',
    summary: 'There are Radiance folk in Concordia, stranded since the arches shut. They keep a little chapel at Abbeyshore that sings the hours towards the lake, and the lake sings back.',
    requires: req(done('quest:cc-through-the-arch')), autoStart: true, firstStage: 'chapel',
    stages: [
      {
        id: 'chapel', journal: 'Ysolde says the Radiance diaspora keeps the Shore Chapel at Abbeyshore, on the edge of the drowned Abbey’s lake.',
        objectives: [{ id: 'ysmay', text: 'Find the Shore Chapel at Abbeyshore', talk: 'npc:ysmay-penhallow', marker: { landmark: 'landmark:shore-chapel' } }],
        next: 'escort',
      },
      {
        id: 'escort', journal: 'Mother Ysmay wants you to hear the choir properly, from the end of the Abbey’s old causeway, before you go out over them. She has not dared walk it alone for years: things come up out of the shallows now. Keep her alive.',
        onEnter: [{ escort: 'npc:ysmay-penhallow', to: 'landmark:cantor-causeway-end' }],
        objectives: [{ id: 'ysmay', text: 'Bring Mother Ysmay safely to the end of the causeway', when: { any: [{ flag: 'escort.ysmay-penhallow', op: '==', value: 'arrived' }, { flag: 'escort.ysmay-penhallow', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:cantor-causeway-end' } }],
        next: [{ when: { flag: 'escort.ysmay-penhallow', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'listen' }],
      },
      {
        id: 'regroup', journal: 'Ysmay went down in the shallows, and the congregation carried her back to the chapel, dripping and scolding. She has wrung out her habit and is waiting at the door to try again.',
        onEnter: [{ escort: 'npc:ysmay-penhallow', to: 'landmark:cantor-causeway-end' }],
        objectives: [{ id: 'ysmay', text: 'Try again: bring Ysmay to the end of the causeway', when: { any: [{ flag: 'escort.ysmay-penhallow', op: '==', value: 'arrived' }, { flag: 'escort.ysmay-penhallow', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:cantor-causeway-end' } }],
        next: [{ when: { flag: 'escort.ysmay-penhallow', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'listen' }],
      },
      {
        id: 'listen', journal: 'Ysmay is standing at the very end of the causeway, where the stones go down under the water, with her eyes shut. The hour is about to turn.',
        objectives: [{ id: 'ysmay', text: 'Listen to the choir with Ysmay', talk: 'npc:ysmay-penhallow', marker: { landmark: 'landmark:cantor-causeway-end' } }],
        onComplete: [{ startQuest: 'quest:cantor-the-drowned-choir' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-radiance-abbeyshore'] },
  },
  {
    ...A2, id: 'quest:cantor-the-drowned-choir', name: 'The Drowned Choir', type: 'class', region: 'region:abbey', giver: 'npc:ysmay-penhallow',
    summary: 'Abbess Morwen holds the drowned nave, and her choir sings anyone who swims near to sleep, for good. A Cantor might sing against them. Or with them.',
    requires: req(done('quest:cantor-abbeyshore')), firstStage: 'ferry',
    stages: [
      {
        id: 'ferry', journal: 'Tamsin Reed’s ferry is the only boat on the lake that goes near the Abbey on purpose.',
        objectives: [{ id: 'tamsin', text: 'Ask Tamsin to take you out over the Abbey', talk: 'npc:tamsin', marker: { landmark: 'landmark:shore-ferry-house' } }],
        next: 'choir',
      },
      {
        id: 'choir', journal: 'Out over the drowned Abbey, the water is singing. Tamsin has stopped poling and is starting to nod.',
        objectives: [{ id: 'choir', text: 'Answer the drowned choir', when: { flag: 'cantor.drowned_choir' }, marker: { landmark: 'landmark:shore-boat' } }],
        next: 'nave',
      },
      {
        id: 'nave', journal: 'The song has let you through. Under the water, the north door of the Abbey stands open.',
        objectives: [{ id: 'nave', text: 'Go down into the drowned nave', reach: 'inst:drowned-abbey', marker: { landmark: 'landmark:abbey-north-door' } }],
        onComplete: [{ startQuest: 'quest:cantor-abbess-morwen' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:cantor-abbess-morwen', name: 'Abbess Morwen', type: 'class', region: 'region:abbey', giver: 'npc:ysmay-penhallow',
    summary: 'Abbess Morwen kept the Turning Bell for a thousand years. It rang without her leave, and she will not let it ring again.',
    requires: req(done('quest:cantor-the-drowned-choir')), firstStage: 'fight',
    stages: [
      {
        id: 'fight', journal: 'Abbess Morwen is the Sentinel of the Radiance school, and of Song. Win her mark.',
        objectives: [{ id: 'morwen', text: 'Defeat Abbess Morwen', kill: 'bx_morwen', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-morwen' }],
        next: 'release',
      },
      {
        id: 'release', journal: 'The Abbess is sinking down in the drowned nave, and her choir has fallen silent.',
        objectives: [{ id: 'mark', text: 'Hear the Abbess out', when: { flag: 'story.sentinel.radiance' } }],
        onComplete: [{ openDialogue: 'dialogue:cantor-morwen-question' }],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'At the turn of the hour the Shore Chapel sang to the lake, and for the first time in thirty years the lake did not sing back. Ysmay has gone out to the end of the causeway to listen. She will want to hear it from you.',
        objectives: [{ id: 'ysmay', text: 'Tell Ysmay why the lake is quiet', talk: 'npc:ysmay-penhallow', marker: { landmark: 'landmark:cantor-causeway-end' } }],
        onComplete: [{ startQuest: 'quest:cantor-the-light-in-the-wood' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-radiance-morwen'] },
  },
  {
    ...A2, id: 'quest:cantor-the-light-in-the-wood', name: 'The Light in the Wood', type: 'class', region: 'region:gloam', giver: 'npc:ysmay-penhallow',
    summary: 'There is a light in the Gloamwood that does not go out when the sun does. The Shore Chapel knows only one man who keeps a light like that.',
    requires: req(done('quest:cantor-abbess-morwen')), firstStage: 'ysmay',
    stages: [
      {
        id: 'ysmay', journal: 'Mother Ysmay has been watching a light in the Gloamwood from the chapel roof.',
        objectives: [{ id: 'ysmay', text: 'Ask Mother Ysmay about the light', talk: 'npc:ysmay-penhallow', marker: { landmark: 'landmark:shore-chapel' } }],
        next: 'trail',
      },
      {
        id: 'trail', journal: 'Somebody has been burning holes in the Gloamwood with a lens. The scorched trees lead west, towards Stag’s Rest.',
        objectives: [{ id: 'oaks', text: 'Follow the scorched oaks', interact: 'obj:cantor-scorched-oak-*', count: 3, marker: { region: 'region:gloam' } }],
        next: 'lucan',
      },
      {
        id: 'lucan', journal: 'At Stag’s Rest, the Weeping Willow is weeping harder than ever. In front of her, a man in smoked spectacles is holding up a lens.',
        objectives: [{ id: 'lucan', text: 'Face Lucan at the Willow', talk: 'npc:lucan-in-the-wood', marker: { landmark: 'landmark:sentinel-verdant' } }],
        onComplete: [{ startQuest: 'quest:cantor-the-weeping-willow' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:cantor-the-weeping-willow', name: 'The Weeping Willow', type: 'class', region: 'region:gloam', giver: 'npc:ysmay-penhallow',
    summary: 'The Willow planted at the Concord’s founding weeps black tears into the Gloamwood, and Lucan’s light has only made her weep harder. The Verdant bearers cannot win her mark while she weeps.',
    requires: req(done('quest:cantor-the-light-in-the-wood')), firstStage: 'hollow',
    stages: [
      {
        id: 'hollow', journal: 'Down under the Willow’s branches, into the deepest shade in Morvane.',
        objectives: [{ id: 'lair', text: 'Go in under the Weeping Willow', reach: 'inst:sentinel-verdant', marker: { landmark: 'landmark:sentinel-verdant' } }],
        onComplete: [{ openDialogue: 'dialogue:cantor-willow-approach' }],
        next: 'willow',
      },
      {
        id: 'willow', journal: 'The Weeping Willow is the Sentinel of the Verdant school. Free her, and the Hedgewitch bearer can claim the mark.',
        objectives: [{ id: 'willow', text: 'Free the Weeping Willow', kill: 'bx_willow', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-verdant' }, { setFlag: 'story.bearer.hedgewitch', value: true }],
        next: 'tripod',
      },
      {
        id: 'tripod', journal: 'The Willow has stopped weeping. At the edge of her shade, where Lucan stood, the grass is burned in a ring, and he has left something behind.',
        objectives: [{ id: 'tripod', text: 'See what Lucan left at Stag’s Rest', interact: 'obj:cantor-lucan-tripod', marker: { landmark: 'landmark:sentinel-verdant' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-cantor-willow'] },
  },
  {
    ...A2, id: 'quest:cantor-celestines-lullaby', name: 'Celestine’s Lullaby', type: 'class', region: 'vil:brind', giver: CH,
    summary: 'A letter from Dawnspire has come through the Radiance arch, carried by somebody who looks as if they have not slept for the whole of the Dawn Road.',
    requires: req(done('quest:cantor-the-weeping-willow')), autoStart: true, firstStage: 'letter',
    stages: [
      {
        id: 'letter', journal: 'There is a letter for you at the Gate Circle, by the Radiance arch.',
        objectives: [{ id: 'letter', text: 'Collect Celestine’s letter at the Gate Circle', when: { flag: 'cantor.celestine_letter' }, marker: { landmark: 'landmark:gate-circle' } }],
        next: 'reply',
      },
      {
        id: 'reply', journal: 'Whoever brought Celestine’s letter is still at the Gate Circle, and will carry an answer back up the Dawn Road. She wrote you a lullaby. It would be rude not to sing back.',
        objectives: [{ id: 'reply', text: 'Send Celestine an answer from the Gate Circle', when: { flag: 'cantor.reply' }, marker: { landmark: 'landmark:gate-circle' } }],
        onComplete: [{ setFlag: 'story.act2_ready', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:cantor-a-duet-for-the-drowned', name: 'A Duet for the Drowned', type: 'side', region: 'vil:shore', giver: 'npc:bearer-bard',
    summary: 'The Bard bearer wants to write the drowned choir a song worth waking up for, and says a Cantor is the only person in Morvane who knows what the choir used to sing.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'duet',
    stages: [
      {
        id: 'duet', journal: 'The Shore Chapel keeps the Abbey’s old psalter, with the choir’s parts in it. Write the new song into the margins.',
        objectives: [{ id: 'psalter', text: 'Write the duet into the Shore Chapel psalter', interact: 'obj:cantor-chapel-psalter', marker: { landmark: 'landmark:shore-chapel' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'The ink is still wet. Lark Ellery is humming it under her breath, and keeps getting to the end and starting again.',
        // co-op: if a party member plays the Bard, they ARE this bearer (the NPC is hidden)
        objectives: [{ id: 'lark', text: 'Talk to the Bard bearer', when: { any: [{ flag: 'cantor.lark_thanked' }, { partyHasClass: 'bard' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.bard', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A2, id: 'quest:cantor-what-the-willow-feeds', name: 'What the Willow Feeds', type: 'side', region: 'region:gloam', giver: 'npc:bearer-ranger',
    summary: 'The Ranger bearer thinks the Weeping Willow should be let die, so the wood under her can grow. They want you to come and look at the saplings before you argue.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'saplings',
    stages: [
      {
        id: 'saplings', journal: 'Under the Willow’s skirts, where no light reaches, a ring of saplings is trying to grow.',
        objectives: [{ id: 'saplings', text: 'Look at the saplings under the Willow', interact: 'obj:cantor-willow-saplings', marker: { landmark: 'landmark:sentinel-verdant' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Rowan Thornbury has not said a word since. That is how Rangers argue.',
        objectives: [{ id: 'rowan', text: 'Talk to the Ranger bearer', when: { any: [{ flag: 'cantor.rowan_thanked' }, { partyHasClass: 'ranger' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.ranger', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  // ======================= ACT III: class quests (III-4 + 3 side)
  {
    ...A3, id: 'quest:cantor-the-herald-of-noon', name: 'The Herald of Noon', type: 'class', region: 'region:heart', giver: 'npc:casimir',
    summary: 'At the top of the Twelve Stairs stands the Hollow King’s Herald, in a robe of white fire and a crown of rays, ringing a bell that rings noon and never stops. It is Lucan Brightwater, and he has brought too many loaves.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'herald',
    stages: [
      { id: 'herald', journal: 'Lucan has become the Herald of Noon: a light that never sets, so that nobody ever has to grieve.', objectives: [{ id: 'herald', text: 'Face the Herald of Noon', kill: 'cb_herald-of-noon', count: 1, marker: { landmark: 'landmark:twelve-stairs-top' } }], onComplete: [{ openDialogue: 'dialogue:cantor-herald-fate' }], next: 'fate' },
      { id: 'fate', journal: 'Lucan is kneeling on the stair, blazing, with his hands pressed over his eyes.', objectives: [{ id: 'fate', text: 'Decide Lucan’s fate', when: { flag: 'cantor.nemesis_fate' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 3 },
  },
  {
    ...A3, id: 'quest:cantor-compline-at-the-citadel', name: 'Compline at the Citadel', type: 'side', region: 'region:heart', giver: CH,
    summary: '“Sing Compline at the Citadel,” Celestine wrote at the very bottom, under the lullaby, “so that I’ll hear it, wherever I am, and can sleep.”',
    requires: req({ flag: 'cantor.celestine_letter' }, done('quest:heart-stairs')), autoStart: true, firstStage: 'candle',
    stages: [
      {
        id: 'candle', journal: 'Compline is sung by one candle, and the candle is put out at the amen: that is how the dark is let in, gently. There is not a candle on you. The Heart camp’s stores might run to one.',
        objectives: [{ id: 'candle', text: 'Find a candle for Compline at the Heart camp', interact: 'obj:cantor-compline-candle', marker: { landmark: 'landmark:heart-camp' } }],
        next: 'compline',
      },
      { id: 'compline', journal: 'Compline is the evening hymn, sung when the light goes down. Sing it on the Citadel steps, at night.', objectives: [{ id: 'compline', text: 'Sing Compline on the Citadel steps at night', when: { flag: 'cantor.compline_sung' }, marker: { landmark: 'landmark:twelve-stairs-top' } }], next: 'amen' },
      {
        id: 'amen', journal: 'You sang it for Celestine. The hymn went further than that: all the way down the stairs, and into the Legion camp, where nobody has been let grieve in thirty years.',
        objectives: [{ id: 'amen', text: 'See who heard Compline in the Legion camp', interact: 'obj:cantor-legion-compline', marker: { landmark: 'landmark:legion-camp' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:cantor-the-brightwatch-recruits', name: 'The Brightwatch Recruits', type: 'side', region: 'region:heart', giver: OB,
    summary: 'Lucan’s young inquisitors followed him into the Heart. They stand hollow in the Legion camp in their white tabards, still saluting a sun that isn’t there.',
    requires: req(done('quest:heart-legion')), autoStart: true, firstStage: 'salute',
    stages: [
      { id: 'salute', journal: 'A rank of Brightwatch recruits, none of them older than twenty, holding a salute they were never told to drop.', objectives: [{ id: 'recruits', text: 'Bring back the Brightwatch recruits', interact: 'obj:cantor-brightwatch-recruits', marker: { landmark: 'landmark:legion-camp' } }], next: 'roll' },
      {
        id: 'roll', journal: 'The recruits have drifted to the Heart camp and formed up in a line, because nobody has told them what else to do. The youngest carried the roll-book out of the Legion in his tabard. Somebody should call it.',
        objectives: [{ id: 'roll', text: 'Call the recruits’ roll at the Heart camp', interact: 'obj:cantor-recruits-roll', marker: { landmark: 'landmark:heart-camp' } }],
        next: 'loaves',
      },
      {
        id: 'loaves', journal: 'Lucan always brought too many loaves. At the top of the Twelve Stairs, where the Herald of Noon stood, there is a sack of them. The recruits have not eaten since Dawnspire.',
        objectives: [{ id: 'loaves', text: 'Fetch the Herald’s loaves from the top of the stairs', interact: 'obj:cantor-herald-loaves', marker: { landmark: 'landmark:twelve-stairs-top' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A3, id: 'quest:cantor-tobit-lark-falls-asleep', name: 'Tobit Lark Falls Asleep', type: 'side', region: 'region:heart', giver: 'npc:tobit-lark-heart',
    summary: 'Tobit Lark snuck through the Dawn Gate after you, followed you all the way to the Heart, and has fallen asleep in the Legion camp. The hollowed have tucked him in.',
    requires: req(done('quest:heart-legion')), autoStart: true, firstStage: 'tucked',
    stages: [
      { id: 'tucked', journal: 'Somewhere in the middle of the Hollow Legion a fifteen-year-old tenor is fast asleep under a pile of borrowed cloaks. Get him out without waking him.', objectives: [{ id: 'tobit', text: 'Carry Tobit out of the Legion camp, asleep', talk: 'npc:tobit-lark-heart', marker: { landmark: 'landmark:legion-camp' } }], next: 'camp' },
      { id: 'camp', journal: 'Tobit is on a bedroll at the Heart camp, still asleep. He will wake when he wakes.', objectives: [{ id: 'wake', text: 'See Tobit wake at the Heart camp', talk: 'npc:tobit-lark-heart', marker: { landmark: 'landmark:heart-camp' } }], next: 'stairs' },
      {
        id: 'stairs', journal: 'Tobit’s bedroll is empty. He has walked up the Twelve Stairs in his sleep, humming, with a blanket round his shoulders like a cope, and is sitting at the top.',
        objectives: [{ id: 'tobit', text: 'Find Tobit at the top of the Twelve Stairs', talk: 'npc:tobit-lark-heart', marker: { landmark: 'landmark:twelve-stairs-top' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
];

export default quests;
