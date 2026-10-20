/**
 * Hollow Crown: the RIMECALLER campaign (docs/lore/hollow-crown/06-outlines/rime.md). Act I in Glacierhome
 * (area:rime-capital) and the Act II class thread in Concordia. Act III class quests land with the Heart. Owner: Claude 4.
 */
import type { NarrativeCondition, QuestDef } from '@/core';

const RC: NarrativeCondition = { heroClass: 'rimecaller' };
const done = (q: `quest:${string}`): NarrativeCondition => ({ questCompleted: q });
const req = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: [RC, ...c] });
const A1 = { act: 'act1' as const, campaign: 'rimecaller', chapter: 'Glacierhome' };
const A2 = { act: 'act2' as const, campaign: 'rimecaller', chapter: 'Concordia' };
const A3 = { act: 'act3' as const, campaign: 'rimecaller', chapter: 'The Heart' };
const Z1 = 'zone:rime-capital-1' as const, Z2 = 'zone:rime-capital-2' as const, Z3 = 'zone:rime-capital-3' as const, Z4 = 'zone:rime-capital-4' as const;
const L1 = 'inst:rime-capital-lair-1' as const, L2 = 'inst:rime-capital-lair-2' as const, L3 = 'inst:rime-capital-lair-3' as const;
const HV = 'npc:halla-vint' as const, SC = 'npc:seraphine-cold' as const;

const quests: QuestDef[] = [
  // ======================= ACT I: main (I-1 … I-10)
  {
    ...A1, id: 'quest:rimecaller-the-first-tick', name: 'The First Tick', type: 'main', region: Z1, giver: HV,
    summary: 'The same night it has been for thirty years. Then a bell rang somewhere very far away, and every stopped clock in Glacierhome ticked once.',
    requires: RC, autoStart: true, firstStage: 'tick',
    stages: [
      {
        id: 'tick', journal: 'Every clock in the city ticked, once, and something in your chest ticked with them. Down the Spire Stair, the frozen lamplighter has moved.',
        onEnter: [{ openDialogue: 'dialogue:rimecaller-first-tick' }],
        objectives: [{ id: 'lamp', text: 'Look at the lamplighter on the Spire Stair', interact: 'obj:frozen-lamplighter', marker: { place: Z1 } }],
        next: 'halla',
      },
      {
        id: 'halla', journal: 'Your mentor, Archivist-Superior Halla Vint, is standing behind you in her dressing-gown and night-cap, looking more delighted than you have ever seen her.',
        objectives: [{ id: 'halla', text: 'Talk to Halla Vint by the lamp post', talk: HV, marker: { landmark: 'landmark:spire-stair-lamplighter' } }],
        onComplete: [{ setFlag: 'rimecaller.bell_heard', value: true }],
        next: 'stair',
      },
      {
        id: 'stair', journal: 'Your hour-pin cracked when the clocks ticked. Halla has gone up the Spire Stair ahead of you to cut a new one before the old one fails.',
        objectives: [{ id: 'study', text: 'Follow Halla up the Spire Stair to her study', reach: 'landmark:halla-vint-study', marker: { landmark: 'landmark:halla-vint-study' } }],
        next: 'pin',
      },
      {
        id: 'pin', journal: 'Halla’s study: a desk, a lathe for cutting ice, and a great many labelled drawers. One of them is marked NEW.',
        objectives: [{ id: 'halla', text: 'Let Halla cut you a new hour-pin', talk: HV, marker: { landmark: 'landmark:halla-vint-study' } }],
        onComplete: [{ startQuest: 'quest:rimecaller-the-hold-gauges' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-frostmere', 'lore:hc-held-hour'] },
  },
  {
    ...A1, id: 'quest:rimecaller-the-hold-gauges', name: 'The Hold-Gauges', type: 'main', region: Z1, giver: HV,
    summary: 'Halla wants the five hold-gauges on the Spire Stair read, tonight, while the city is still ticking. They show how firmly the hour is held.',
    requires: req(done('quest:rimecaller-the-first-tick')), firstStage: 'gauges',
    stages: [
      {
        id: 'gauges', journal: 'Five ice hourglasses stand on the Spire Stair. Each should be dry. Read them all.',
        objectives: [{ id: 'gauges', text: 'Read the hold-gauges on the Spire Stair', interact: 'obj:hold-gauge-*', count: 5, marker: { place: Z1 } }],
        next: 'wraiths',
      },
      {
        id: 'wraiths', journal: 'All five are dripping, and the meltwater runs black. Something is rising out of the puddles.',
        objectives: [{ id: 'wraiths', text: 'Drive off the Frost Wraiths', kill: 'bx_rime_1', count: 4, marker: { place: Z1 } }],
        next: 'melt',
      },
      {
        id: 'melt', journal: 'The black meltwater isn’t pooling. It is running away down the Stair, as if it knows where it is going. Follow it.',
        objectives: [{ id: 'melt', text: 'Follow the black melt down the Spire Stair', interact: 'obj:rimecaller-melt-run-*', count: 3, marker: { place: Z1 } }],
        next: 'report',
      },
      {
        id: 'report', journal: 'The wraiths had faces, and the melt runs all the way down to the Undercrypt. Halla will want to know.',
        objectives: [{ id: 'halla', text: 'Report to Halla', talk: HV, marker: { landmark: 'landmark:halla-vint-study' } }],
        onComplete: [{ startQuest: 'quest:rimecaller-the-melt-cisterns' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:rimecaller-the-melt-cisterns', name: 'The Melt Cisterns', type: 'main', region: Z4, giver: HV,
    summary: 'Thirty years of meltwater has run downhill into the city’s reservoir under the Undercrypt. The cistern-keepers went down to see why, and did not come back.',
    requires: req(done('quest:rimecaller-the-hold-gauges')), firstStage: 'hut',
    stages: [
      {
        id: 'hut', journal: 'The cistern-keepers kept a hut at the top of the Undercrypt steps, halfway down from the city. If they left word of where they were going, it will be there.',
        objectives: [{ id: 'log', text: 'Read the cistern-keepers’ log in their hut', interact: 'obj:rimecaller-keepers-log', marker: { landmark: 'landmark:rimecaller-keepers-hut' } }],
        next: 'down',
      },
      {
        id: 'down', journal: 'The Melt Cisterns lie under the Undercrypt. Follow the black water down.',
        objectives: [{ id: 'enter', text: 'Go down into the Melt Cisterns', reach: L1, marker: { place: Z4 } }],
        next: 'blob',
      },
      {
        id: 'blob', journal: 'Something has drunk thirty years of meltwater and is still thirsty. Freeze it whole, or freeze its pieces apart.',
        objectives: [{ id: 'blob', text: 'Defeat the Glacier Blob', kill: 'bx_rime_4', count: 1 }],
        next: 'keepers',
      },
      {
        id: 'keepers', journal: 'Where the Blob was, there are shapes in the ice. They are wearing cistern-keepers’ boots.',
        objectives: [{ id: 'keepers', text: 'Free the cistern-keepers', interact: 'obj:cistern-keepers' }],
        next: 'report',
      },
      {
        id: 'report', journal: 'The keepers are cold, cross and alive.',
        objectives: [{ id: 'halla', text: 'Return to Halla', talk: HV, marker: { landmark: 'landmark:halla-vint-study' } }],
        onComplete: [{ setFlag: 'rimecaller.blob_down', value: true }, { startQuest: 'quest:rimecaller-the-regents-key' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 80, hcItems: [{ item: 'i_scroll_rime', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:rimecaller-the-regents-key', name: 'The Regent’s Key', type: 'main', region: Z2, giver: SC,
    summary: 'Regent Seraphine Cold, the only person allowed to wind the held clocks, has come down to the Hall of Held Hours to meet the hour-walker who heard the tick.',
    requires: req(done('quest:rimecaller-the-melt-cisterns')), firstStage: 'regent',
    stages: [
      {
        id: 'regent', journal: 'The Regent is waiting for you among the stopped clocks of the Hall of Held Hours.',
        objectives: [{ id: 'regent', text: 'Meet the Regent in the Hall of Held Hours', talk: SC, marker: { landmark: 'landmark:hall-of-held-hours' } }],
        onComplete: [{ setFlag: 'rimecaller.regent_met', value: true }],
        next: 'ticked',
      },
      {
        id: 'ticked', journal: 'The Regent wants to know which clocks moved, and how far. Three great clocks stand where the hold runs thinnest, on the long way down to the Frozen Market.',
        objectives: [{ id: 'clocks', text: 'Read the three clocks that ticked', interact: 'obj:rimecaller-ticked-clock-*', count: 3, marker: { place: Z3 } }],
        next: 'report',
      },
      {
        id: 'report', journal: 'Every clock that ticked has been set back, very carefully, to the same minute. The Regent is waiting in the Hall to hear it.',
        objectives: [{ id: 'regent', text: 'Tell the Regent what the clocks said', talk: SC, marker: { landmark: 'landmark:hall-of-held-hours' } }],
        onComplete: [{ startQuest: 'quest:rimecaller-the-conduit-vote' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-archive-of-the-spire'] },
  },
  {
    ...A1, id: 'quest:rimecaller-the-conduit-vote', name: 'The Conduit Vote', type: 'main', region: Z2, giver: SC,
    summary: 'The hold is failing. The Regent has put a motion to the Archive: open the old Rime Conduits and draw the Wardwall’s cold up into the city.',
    requires: req(done('quest:rimecaller-the-regents-key')), firstStage: 'canvass',
    stages: [
      {
        id: 'canvass', journal: 'Halla says a vote cast without asking is only a guess with a hand up. The Wardens’ envoy has waited thirty years to be asked, and the Conduits run past Gunnhild Tapp’s drip-counters in the Undercrypt.',
        objectives: [
          { id: 'aud', text: 'Ask the Wardens’ envoy what the cold is for', talk: 'npc:aud-fellmark', marker: { landmark: 'landmark:hall-of-held-hours' } },
          { id: 'gunnhild', text: 'Ask Gunnhild Tapp what the Conduits would do', talk: 'npc:gunnhild-tapp', marker: { landmark: 'landmark:rime-conduits' } },
        ],
        next: 'vote',
      },
      {
        id: 'vote', journal: 'The Archive sits in the Hall of Held Hours. Every hour-walker has a vote, and there are not many hour-walkers.',
        objectives: [{ id: 'vote', text: 'Speak at the Archive’s vote', when: { flag: 'rimecaller.conduits' }, marker: { landmark: 'landmark:hall-of-held-hours' } }],
        next: [
          { when: { flag: 'rimecaller.conduits', value: 'opened' }, to: 'conduits' },
          { when: { flag: 'rimecaller.conduits', value: 'kept' }, to: 'envoy' },
          { to: 'after' },
        ],
      },
      {
        id: 'conduits', journal: 'The Archive has voted to open the Rime Conduits. Someone has to turn the wheel in the Undercrypt.',
        objectives: [{ id: 'wheel', text: 'Open the Rime Conduits', reach: 'landmark:rime-conduits', marker: { landmark: 'landmark:rime-conduits' } }],
        next: 'after',
      },
      {
        id: 'envoy', journal: 'The Wall keeps its cold. The Wardens’ envoy has waited thirty years to hear that.',
        objectives: [{ id: 'aud', text: 'Tell the Wardens’ envoy', talk: 'npc:aud-fellmark', marker: { landmark: 'landmark:hall-of-held-hours' } }],
        next: 'after',
      },
      {
        id: 'after', journal: 'Whatever the Archive decided, the whole hold shuddered when it did. The shudder came from the Mirror Gallery.',
        objectives: [],
        onComplete: [{ startQuest: 'quest:rimecaller-the-mirror-gallery' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A1, id: 'quest:rimecaller-the-mirror-gallery', name: 'The Mirror Gallery', type: 'main', region: Z3, giver: HV,
    summary: 'The hold’s working is focused in the Mirror Gallery off the Frozen Market, where the mirrors keep whatever looks into them.',
    requires: req(done('quest:rimecaller-the-conduit-vote')), firstStage: 'gallery',
    stages: [
      {
        id: 'gallery', journal: 'Halla says not to look into the mirrors. Halla says it the way people say it when they know you will.',
        objectives: [{ id: 'enter', text: 'Enter the Mirror Gallery', reach: L2, marker: { landmark: 'landmark:mirror-gallery-door' } }],
        next: 'reflection',
      },
      {
        id: 'reflection', journal: 'Your reflection froze, and stepped out of the glass. It only moves when you stand still.',
        objectives: [{ id: 'reflection', text: 'Defeat the Still Reflection', kill: 'cb_still-reflection', count: 1 }],
        next: 'shard',
      },
      {
        id: 'shard', journal: 'One shard of the Reflection is still showing something. It is not your face.',
        objectives: [{ id: 'shard', text: 'Look into the last shard', interact: 'obj:reflection-shard' }],
        onComplete: [{ setFlag: 'rimecaller.mirror_seen', value: true }, { startQuest: 'quest:rimecaller-the-next-room' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 120 },
  },
  {
    ...A1, id: 'quest:rimecaller-the-next-room', name: 'The Next Room', type: 'main', region: Z3, giver: HV,
    summary: 'The mirrors have watched a room beside the Regent’s for thirty years. In it an old man sits in a chair, one breath from the end of his life.',
    requires: req(done('quest:rimecaller-the-mirror-gallery')), firstStage: 'halla',
    stages: [
      {
        id: 'halla', journal: 'Tell Halla what the shard showed you. She will know whose room it is.',
        objectives: [{ id: 'halla', text: 'Tell Halla about the next room', talk: HV, marker: { landmark: 'landmark:halla-vint-study' } }],
        next: 'physician',
      },
      {
        id: 'physician', journal: 'The Regent’s physician was called up to the Spire at eleven fifty-two, and never came down. His surgery on the Market Steps is exactly as he left it.',
        objectives: [{ id: 'daybook', text: 'Search the physician’s surgery', interact: 'obj:rimecaller-physician-daybook', marker: { landmark: 'landmark:rimecaller-physician-surgery' } }],
        next: 'clocks',
      },
      {
        id: 'clocks', journal: 'If Halla is right, the proof is on the clock wall in the Hall of Held Hours, where every clock in the city is copied.',
        objectives: [{ id: 'clocks', text: 'Read the held clock wall', interact: 'obj:held-clock-wall', marker: { landmark: 'landmark:hall-of-held-hours' } }],
        onComplete: [{ setFlag: 'rimecaller.regent_known', value: true }],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'A pipe of black ice, threaded through every clock in the city, up to the crown of the Spire. Halla has to hear it from you.',
        objectives: [{ id: 'halla', text: 'Tell Halla what holds the hour', talk: HV, marker: { landmark: 'landmark:halla-vint-study' } }],
        onComplete: [{ startQuest: 'quest:rimecaller-the-crown-of-the-spire' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-anselm-cold'] },
  },
  {
    ...A1, id: 'quest:rimecaller-the-crown-of-the-spire', name: 'The Crown of the Spire', type: 'main', region: L3, giver: HV,
    summary: 'Seraphine means to set the Spire half into the hold so that the hour never moves again. She has gone up to the Crown of the Spire to wait for the one person who can lift it.',
    requires: req(done('quest:rimecaller-the-next-room')), firstStage: 'climb',
    stages: [
      {
        id: 'climb', journal: 'Up the Ice Spire to its crown. Your half-stone is ticking like a pocket-watch.',
        objectives: [{ id: 'enter', text: 'Climb to the Crown of the Spire', reach: L3, marker: { place: Z1 } }],
        onComplete: [{ openDialogue: 'dialogue:rimecaller-crown-words' }],
        next: 'regent',
      },
      {
        id: 'regent', journal: 'She holds time in patches across the floor. Let the half-stone tick them forward.',
        objectives: [{ id: 'regent', text: 'Stop Regent Seraphine Cold', kill: 'cb_seraphine-cold', count: 1 }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'Seraphine has fallen back towards the next room. The Spire half is waiting in the crown of the tower, and it will only lift for you.',
        objectives: [{ id: 'stone', text: 'Lift the Spire half', interact: 'obj:rime-capital-halfstone' }],
        onComplete: [{ setFlag: 'rimecaller.halfstone', value: true }, { startQuest: 'quest:rimecaller-the-thaw-road' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, skillPoints: 1, lore: ['lore:hc-half-stones', 'lore:hc-ice-spire'] },
  },
  {
    ...A1, id: 'quest:rimecaller-the-thaw-road', name: 'The Thaw Road', type: 'main', region: Z1, giver: HV,
    summary: 'The hold is broken and Glacierhome has woken all at once. Seraphine is running for the White Gate with Anselm’s chair on a sledge. Halla wants a word first.',
    requires: req(done('quest:rimecaller-the-crown-of-the-spire')), firstStage: 'farewell',
    stages: [
      {
        id: 'farewell', journal: 'Every clock in the city is striking. Halla is waiting in her study, and for once she has not got a pen in her hand.',
        onEnter: [{ openDialogue: 'dialogue:rimecaller-the-thaw' }],
        objectives: [{ id: 'halla', text: 'Say goodbye to Halla', talk: HV, marker: { landmark: 'landmark:halla-vint-study' } }],
        next: 'milestone',
      },
      {
        id: 'milestone', journal: 'Halfway down the Thaw Road the Archive set a mile-clock, to tell travellers how long they had walked. Something has fallen off the Regent’s sledge beside it.',
        objectives: [{ id: 'clock', text: 'Stop at the mile-clock on the Thaw Road', interact: 'obj:rimecaller-mile-clock', marker: { landmark: 'landmark:rimecaller-mile-clock' } }],
        next: 'road',
      },
      {
        id: 'road', journal: 'Sledge-tracks run down the glacier towards the White Gate, with the prints of Ice Sentries either side.',
        objectives: [{ id: 'gate', text: 'Follow the sledge to the White Gate', reach: 'area:rime-gate', marker: { place: 'area:rime-gate' } }],
        onComplete: [{ startQuest: 'quest:rimecaller-the-white-gate' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:rimecaller-the-white-gate', name: 'The White Gate', type: 'main', region: 'area:rime-gate', giver: HV,
    summary: 'The Winter Tyrant, the ice-king the Archive built to hold back the cold, stands hollow at the White Gate. The Archive built it, so the Archive’s apprentice can read it.',
    requires: req(done('quest:rimecaller-the-thaw-road')), firstStage: 'tyrant',
    stages: [
      {
        id: 'tyrant', journal: 'The Archive’s founding charge is cut into its chest. Read one line aloud in every stun, and its hollow armour comes loose.',
        objectives: [{ id: 'tyrant', text: 'Unmake the Winter Tyrant', kill: 'bx_rime_5', count: 1 }],
        next: 'gate',
      },
      {
        id: 'gate', journal: 'The Tyrant has sat down in the snow beside the road. The gate is weeping black tears down its face.',
        objectives: [{ id: 'seal', text: 'Open the White Gate with the Spire half', interact: 'obj:rime-gate-seal' }],
        onComplete: [{ setFlag: 'story.gate_open', value: true }, { setFlag: 'story.act', value: 2 }, { setFlag: 'rimecaller.act1_done', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 200, lore: ['lore:hc-realm-gates', 'lore:hc-winter-tyrant'] },
  },

  // ======================= ACT I: side quests (2 per zone)
  {
    ...A1, id: 'quest:rimecaller-the-longest-loaf', name: 'The Longest Loaf', type: 'side', region: Z1, giver: 'npc:pomfrey-dunn',
    summary: 'Mistress Pomfrey Dunn has watched the same loaf rise for thirty years. When it finally bakes, she means to have a fire under it that isn’t frozen.',
    requires: req(done('quest:rimecaller-the-first-tick')), firstStage: 'wood',
    stages: [
      {
        id: 'wood', journal: 'Every log in Glacierhome is frozen solid. The only dry wood is in the Undercrypt, where the hold is thinnest.',
        objectives: [{ id: 'wood', text: 'Gather unfrozen firewood in the Undercrypt', interact: 'obj:dry-firewood-*', count: 3, marker: { place: Z4 } }],
        next: 'bake',
      },
      {
        id: 'bake', journal: 'An armful of wood that smells of wood, which in Glacierhome is a miracle.',
        objectives: [{ id: 'pomfrey', text: 'Bring the firewood to Pomfrey', talk: 'npc:pomfrey-dunn', marker: { landmark: 'landmark:pomfrey-bakery' } }],
        onComplete: [{ setFlag: 'rimecaller.pomfrey_helped', value: true }],
        next: 'order',
      },
      {
        id: 'order', journal: 'The loaf was never Pomfrey’s. It is a black rye, ordered at half past eleven on the last night by a footman from the Spire, for somebody’s supper. Somebody ought to tell the Spire it is nearly ready.',
        objectives: [{ id: 'regent', text: 'Tell the Regent her order is nearly ready', talk: SC, marker: { landmark: 'landmark:hall-of-held-hours' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_bread', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:rimecaller-mid-step', name: 'Mid-Step', type: 'side', region: Z1, giver: 'npc:wendel-fross',
    summary: 'Wendel Fross has been frozen mid-stride on the Spire Stair for thirty years, holding out a letter. Read through the frost, it is a proposal.',
    requires: req(done('quest:rimecaller-the-first-tick')), firstStage: 'greta',
    stages: [
      {
        id: 'greta', journal: 'The letter is for Greta Lind, who is frozen mid-laugh at her glass-bird stall in the Frozen Market. Get it to her before the hour moves.',
        objectives: [{ id: 'greta', text: 'Put the letter in Greta Lind’s hand', talk: 'npc:greta-lind', marker: { landmark: 'landmark:frozen-market-stalls' } }],
        onComplete: [{ setFlag: 'rimecaller.letter_delivered', value: true }],
        next: 'enquiry',
      },
      {
        id: 'enquiry', journal: 'Greta’s other hand was already holding a letter of her own, addressed to Wendel. Both of them say “I asked the Archive.” The Archive’s Enquiries Book is in the Hall of Held Hours.',
        objectives: [{ id: 'book', text: 'Look up the enquiries in the Archive’s Enquiries Book', interact: 'obj:rimecaller-enquiries-book', marker: { landmark: 'landmark:hall-of-held-hours' } }],
        next: 'wendel',
      },
      {
        id: 'wendel', journal: 'Two enquiries, one minute apart, the same question, the same answer. Greta’s letter belongs in Wendel’s empty hand.',
        objectives: [{ id: 'wendel', text: 'Put Greta’s letter in Wendel’s hand', talk: 'npc:wendel-fross', marker: { landmark: 'landmark:pomfrey-bakery' } }],
        onComplete: [{ setFlag: 'rimecaller.letters_crossed', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 30 },
  },
  {
    ...A1, id: 'quest:rimecaller-the-weather-clerk', name: 'The Weather Clerk', type: 'side', region: Z2, giver: 'npc:cornelius-teal',
    summary: 'Clerk Cornelius Teal has written “cold; still” in the weather register for 10,950 days running. He would give a great deal for one new reading.',
    requires: req(done('quest:rimecaller-the-hold-gauges')), firstStage: 'reading',
    stages: [
      {
        id: 'reading', journal: 'The Undercrypt is the one place in Glacierhome where it is warmer than it should be. There is an old thermometer down there.',
        objectives: [{ id: 'temp', text: 'Take a reading in the warm Undercrypt', interact: 'obj:undercrypt-thermometer', marker: { place: Z4 } }],
        next: 'teal',
      },
      {
        id: 'teal', journal: 'Two degrees above freezing, and rising. It is the first new weather in thirty years.',
        objectives: [{ id: 'teal', text: 'Bring the reading to Cornelius', talk: 'npc:cornelius-teal', marker: { landmark: 'landmark:hall-of-held-hours' } }],
        onComplete: [{ setFlag: 'rimecaller.teal_helped', value: true }],
        next: 'witness',
      },
      {
        id: 'witness', journal: 'Regulations: a new kind of weather must be witnessed by the Archivist-Superior before it can be entered. Cornelius has never needed a witness. He has torn the page out for you to carry, very carefully.',
        objectives: [{ id: 'halla', text: 'Have Halla countersign the new reading', talk: HV, marker: { landmark: 'landmark:halla-vint-study' } }],
        onComplete: [{ setFlag: 'rimecaller.reading_witnessed', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-weather-register'] },
  },
  {
    ...A1, id: 'quest:rimecaller-the-thirteenth-line', name: 'The Thirteenth Line', type: 'side', region: Z2, giver: 'npc:mabyn-frane',
    summary: 'Under-Archivist Maudlin Frane has re-catalogued the treaty stacks four times in thirty years, and has finally found the one thing she can’t file.',
    requires: req(done('quest:rimecaller-the-hold-gauges')), firstStage: 'treaty',
    stages: [
      {
        id: 'treaty', journal: 'The Rime copy of the Concord’s founding treaty, in the deepest stack, under glass.',
        objectives: [{ id: 'treaty', text: 'Read the last page of the founding treaty', interact: 'obj:rime-treaty-copy', marker: { landmark: 'landmark:hall-of-held-hours' } }],
        next: 'mabyn',
      },
      {
        id: 'mabyn', journal: 'Twelve signatures, and a thirteenth line, ruled, and left blank.',
        objectives: [{ id: 'mabyn', text: 'Tell Maudlin what you found', talk: 'npc:mabyn-frane', marker: { landmark: 'landmark:hall-of-held-hours' } }],
        onComplete: [{ setFlag: 'rimecaller.treaty_seen', value: true }],
        next: 'minute',
      },
      {
        id: 'minute', journal: 'If the founders ruled a line on purpose, they will have voted on it first. Their minute-book is chained to a lectern in the old Reading Room, halfway up the Spire Stair.',
        objectives: [{ id: 'minute', text: 'Read the founders’ minute in the old Reading Room', interact: 'obj:rimecaller-founders-minute', marker: { landmark: 'landmark:rimecaller-reading-room' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-thirteenth-line'] },
  },
  {
    ...A1, id: 'quest:rimecaller-the-thief-who-never-got-away', name: 'The Thief Who Never Got Away', type: 'side', region: Z3, giver: 'npc:nim-larkspur',
    summary: 'Nim Larkspur has been caught mid-snatch in the Frozen Market for thirty years, and he has been awake for every minute of it.',
    requires: req(done('quest:rimecaller-the-regents-key')), firstStage: 'thaw',
    stages: [
      {
        id: 'thaw', journal: 'Thaw his face, carefully, so that he can talk. Only his face.',
        objectives: [{ id: 'thaw', text: 'Thaw the thief’s face', interact: 'obj:frozen-thief', marker: { landmark: 'landmark:frozen-market-stalls' } }],
        next: 'nim',
      },
      {
        id: 'nim', journal: 'Nim Larkspur can talk again, and has thirty years of things to say.',
        objectives: [{ id: 'nim', text: 'Hear Nim out', talk: 'npc:nim-larkspur', marker: { landmark: 'landmark:frozen-market-stalls' } }],
        next: 'tin',
      },
      {
        id: 'tin', journal: 'Nim says the purse was not the worst of it. Under the ninth step down to the Undercrypt there is a tin of everything he ever took, and he would like it gone before the hour moves.',
        objectives: [{ id: 'tin', text: 'Find Nim’s tin under the Undercrypt steps', interact: 'obj:rimecaller-nim-tin', marker: { landmark: 'landmark:rimecaller-keepers-hut' } }],
        next: 'osgar',
      },
      {
        id: 'osgar', journal: 'A tin of buttons, ribbons and keys, none of them worth a farthing. The Archive keeps a lost-property shelf. Osgar Rusk keeps the Archive’s shelves.',
        objectives: [{ id: 'osgar', text: 'Hand the tin in to Osgar Rusk', talk: 'npc:osgar-rusk', marker: { landmark: 'landmark:spire-stair-board' } }],
        onComplete: [{ setFlag: 'rimecaller.nim_tin', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:rimecaller-the-thirty-year-haggle', name: 'The Thirty-Year Haggle', type: 'side', region: Z3, giver: 'npc:brannoc-hulle',
    summary: 'Brannoc Hulle and Widow Saffi Tern have been frozen mid-haggle over a sugar bowl for thirty years. Somebody ought to settle it before they wake.',
    requires: req(done('quest:rimecaller-the-regents-key')), firstStage: 'price',
    stages: [
      {
        id: 'price', journal: 'The Archive records the price of everything. Somewhere in the Hall of Held Hours is the fair price of a sugar bowl in C. 1012.',
        objectives: [{ id: 'ledger', text: 'Look up the price in the Archive’s market ledger', interact: 'obj:market-price-ledger', marker: { landmark: 'landmark:hall-of-held-hours' } }],
        next: 'saffi',
      },
      {
        id: 'saffi', journal: 'Two shillings and a farthing. Chalk it on the stall between them.',
        objectives: [{ id: 'saffi', text: 'Settle the haggle at the stall', talk: 'npc:saffi-tern', marker: { landmark: 'landmark:frozen-market-stalls' } }],
        onComplete: [{ setFlag: 'rimecaller.haggle_settled', value: true }],
        next: 'lid',
      },
      {
        id: 'lid', journal: '“With lid.” The sugar bowl on the stall has no lid. Thirty years ago it rolled off down the Market Steps, and a small boy halfway down them caught it.',
        objectives: [{ id: 'lid', text: 'Find the sugar bowl’s lid on the Market Steps', interact: 'obj:rimecaller-sugar-lid', marker: { place: Z3 } }],
        onComplete: [{ setFlag: 'rimecaller.lid_found', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 60 },
  },
  {
    ...A1, id: 'quest:rimecaller-the-drip-counters', name: 'The Drip-Counters', type: 'side', region: Z4, giver: 'npc:gunnhild-tapp',
    summary: 'Gunnhild Tapp measures the hold’s failure drop by drop. She says the drips have a rhythm, and you can only hear it at night.',
    requires: req(done('quest:rimecaller-the-hold-gauges')), firstStage: 'listen',
    stages: [
      {
        id: 'listen', journal: 'Listen at the drip-counter station in the Undercrypt, at night, when the city is quietest.',
        objectives: [{ id: 'drips', text: 'Listen to the drip-counters, at night', when: { flag: 'rimecaller.drips_heard' }, marker: { place: Z4 } }],
        next: 'gunnhild',
      },
      {
        id: 'gunnhild', journal: 'Slow, stubborn, and very faint. It isn’t water keeping that time.',
        objectives: [{ id: 'gunnhild', text: 'Tell Gunnhild what you heard', talk: 'npc:gunnhild-tapp', marker: { landmark: 'landmark:rime-conduits' } }],
        next: 'pipe',
      },
      {
        id: 'pipe', journal: 'Gunnhild has always assumed the drips came up from below, like everything else in the Undercrypt. If they come down instead, the old ice-pipe on the climb to the Hall will carry the same beat.',
        objectives: [{ id: 'pipe', text: 'Listen at the old ice-pipe on the way up to the Hall', interact: 'obj:rimecaller-drip-pipe', marker: { landmark: 'landmark:rimecaller-drip-pipe' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_em_s', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:rimecaller-the-wraith-who-wanted-its-hat', name: 'The Wraith Who Wanted Its Hat', type: 'side', region: Z4, giver: 'npc:hatless-wraith',
    summary: 'One Frost Wraith in the Undercrypt doesn’t attack anyone. It keeps drifting back to the same spot in the tunnel wall, where a hat is frozen in the ice.',
    requires: req(done('quest:rimecaller-the-hold-gauges')), firstStage: 'hat',
    stages: [
      {
        id: 'hat', journal: 'A good felt hat, with a feather, frozen in the tunnel wall at about head height.',
        objectives: [{ id: 'hat', text: 'Cut the hat out of the ice', interact: 'obj:frozen-hat', marker: { place: Z4 } }],
        next: 'give',
      },
      {
        id: 'give', journal: 'The hat is cold and slightly squashed, but it is a hat.',
        objectives: [{ id: 'wraith', text: 'Give the wraith its hat', talk: 'npc:hatless-wraith', marker: { landmark: 'landmark:rime-conduits' } }],
        onComplete: [{ setFlag: 'rimecaller.hat_returned', value: true }],
        next: 'halla',
      },
      {
        id: 'halla', journal: 'B. Hollin, Glacierhome. If found, please return. Halla once signed out an hour-walker called Bertil, who wanted to see his sister in the Wolfrun. She ought to know where he got to.',
        objectives: [{ id: 'halla', text: 'Tell Halla whose hat it was', talk: HV, marker: { landmark: 'landmark:halla-vint-study' } }],
        onComplete: [{ setFlag: 'rimecaller.bertil_known', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50 },
  },

  // ======================= ACT I: mentor thread (2) and bounties (2)
  {
    ...A1, id: 'quest:rimecaller-the-first-keeping', name: 'The First Keeping', type: 'side', region: Z2, giver: HV,
    summary: 'Halla has a key to the Archive’s oldest vault, which she has never used, because nobody has ever asked her what is in it.',
    requires: req({ trust: HV, value: 'friendly' }, done('quest:rimecaller-the-hold-gauges')), firstStage: 'vault',
    stages: [
      {
        id: 'vault', journal: 'The oldest vault lies under the Hall of Held Hours, behind a door older than the Concord.',
        objectives: [{ id: 'vault', text: 'Open the Archive’s oldest vault', reach: 'landmark:archive-oldest-vault', marker: { landmark: 'landmark:archive-oldest-vault' } }],
        next: 'keeping',
      },
      {
        id: 'keeping', journal: 'One shelf, one book, one page. The first keeping.',
        objectives: [{ id: 'keeping', text: 'Read the first keeping', interact: 'obj:first-keeping' }],
        next: 'halla',
      },
      {
        id: 'halla', journal: 'A sunrise from C. 3, written so completely that you can feel it on your face.',
        objectives: [{ id: 'halla', text: 'Bring the first keeping to Halla', talk: HV, marker: { landmark: 'landmark:halla-vint-study' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, skillPoints: 1, lore: ['lore:hc-first-keeping'] },
  },
  {
    ...A1, id: 'quest:rimecaller-something-new', name: 'Something New', type: 'side', region: Z4, giver: HV,
    summary: 'Halla has admitted, very drily, that she has not seen anything new in thirty years and would like to. She has a drawer ready for it.',
    requires: req({ trust: HV, value: 'trusted' }, done('quest:rimecaller-the-melt-cisterns')), firstStage: 'new',
    stages: [
      {
        id: 'new', journal: 'Three new things: a snowflake that formed in the thaw, a curse-word nobody in Glacierhome has heard, and a spell nobody has ever cast.',
        objectives: [
          { id: 'flake', text: 'Catch a new snowflake in the Undercrypt thaw', interact: 'obj:thaw-snowflake', marker: { place: Z4 } },
          { id: 'curse', text: 'Ask the Wardens’ envoy for a new curse-word', talk: 'npc:aud-fellmark', marker: { landmark: 'landmark:hall-of-held-hours' } },
        ],
        next: 'drawer',
      },
      {
        id: 'drawer', journal: 'Two new things. The third you will have to make up yourself, in front of Halla.',
        objectives: [{ id: 'halla', text: 'Fill Halla’s drawer', talk: HV, marker: { landmark: 'landmark:halla-vint-study' } }],
        onComplete: [{ setFlag: 'rimecaller.halla_devotable', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:rimecaller-bounty-cistern-wraiths', name: 'Bounty: the Cistern Wraiths', type: 'bounty', region: Z4, giver: 'npc:osgar-rusk',
    summary: 'A pack of Frost Wraiths has come up out of the cisterns and into the Undercrypt tunnels. The Archive pays by the wraith, in silver, after an inquiry.',
    requires: req(done('quest:rimecaller-the-hold-gauges')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'They gather where the meltwater pools black.', objectives: [{ id: 'wraiths', text: 'Defeat the cistern wraiths', kill: 'bx_rime_1', count: 6, marker: { place: Z4 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 150 },
  },
  {
    ...A1, id: 'quest:rimecaller-bounty-sentry-seventeen', name: 'Bounty: Sentry Seventeen', type: 'bounty', region: Z1, giver: 'npc:osgar-rusk',
    summary: 'Ice Sentry Seventeen has gone hollow and is arresting everyone on the Spire Stair for loitering. Everyone on the Spire Stair is loitering.',
    requires: req(done('quest:rimecaller-the-first-tick')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'It has arrested the lamplighter four times.', objectives: [{ id: 'sentry', text: 'Stand Sentry Seventeen down', kill: 'bx_rime_2', count: 1, marker: { place: Z1 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 120 },
  },

  // ======================= ACT II: the class thread (C-1 … C-6) + featured bearers
  // depth pass (wave 2): the Remembering Slate, escorting Mina up to the held road, telling her, the Regent's trail through
  // Lanternford, the half-built lantern, and a footnote sent home
  {
    ...A2, id: 'quest:rimecaller-wardenhold', name: 'Wardenhold', type: 'class', region: 'vil:warden', giver: 'npc:mina-snell',
    summary: 'Somewhere in Concordia there are Rime-folk who were stranded here when the arches shut. They will know where Rime’s Sentinel stands: one of the old guardians of the crown’s Turning Road.',
    requires: req(done('quest:cc-through-the-arch')), autoStart: true, firstStage: 'snell',
    stages: [
      {
        id: 'snell', journal: 'You came through the White Gate with the Spire half singing in your chest and Glacierhome’s clocks ticking again behind you. Ysolde Fenn, the archivist in Brindlecross, says the Rime-folk keep a village at the foot of Frostmere Pass, called Wardenhold.',
        objectives: [{ id: 'mina', text: 'Find the Rime-folk of Wardenhold', talk: 'npc:mina-snell', marker: { landmark: 'landmark:warden-wardenhold-keep' } }],
        next: 'slate',
      },
      {
        id: 'slate', journal: 'Wardenhold kept no archive. It kept a wall of slate by the keep door instead, where the Rime-folk chalk up what they remember, and rub out what everyone else remembers.',
        objectives: [{ id: 'slate', text: 'Read the Remembering Slate at Wardenhold Keep', interact: 'obj:rimecaller-remembering-slate', marker: { landmark: 'landmark:warden-wardenhold-keep' } }],
        onComplete: [{ startQuest: 'quest:rimecaller-the-held-pass' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-rime-wardenhold'] },
  },
  {
    ...A2, id: 'quest:rimecaller-the-held-pass', name: 'The Held Pass', type: 'class', region: 'region:frost', giver: 'npc:mina-snell',
    summary: 'Nobody from Wardenhold has gone up the pass in thirty years. The road is held, the way Glacierhome was held, with travellers stopped mid-step under the snow.',
    requires: req(done('quest:rimecaller-wardenhold')), firstStage: 'escort',
    stages: [
      {
        id: 'escort', journal: 'Mina’s brother took his cart up the pass on the morning the arches shut. She has never gone up to look. With an hour-walker beside her, she will. The pass is full of things that have gone hollow in the cold: keep her alive.',
        onEnter: [{ escort: 'npc:mina-snell', to: 'landmark:rimecaller-held-road' }],
        objectives: [{ id: 'mina', text: 'Bring Mina Snell safely up to the held road', when: { any: [{ flag: 'escort.mina-snell', op: '==', value: 'arrived' }, { flag: 'escort.mina-snell', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:rimecaller-held-road' } }],
        next: [{ when: { flag: 'escort.mina-snell', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'read' }],
      },
      {
        id: 'regroup', journal: 'Mina went down in the snow, and the Wardens carried her home, where she is telling everyone it happened quite differently. She is ready to go up again.',
        onEnter: [{ escort: 'npc:mina-snell', to: 'landmark:rimecaller-held-road' }],
        objectives: [{ id: 'mina', text: 'Try again: bring Mina up to the held road', when: { any: [{ flag: 'escort.mina-snell', op: '==', value: 'arrived' }, { flag: 'escort.mina-snell', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:rimecaller-held-road' } }],
        next: [{ when: { flag: 'escort.mina-snell', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'read' }],
      },
      {
        id: 'read', journal: 'Mina is standing on the held road in front of a cart and a mule, very still herself.',
        objectives: [{ id: 'mina', text: 'Hear what Mina sees on the held road', talk: 'npc:mina-snell', marker: { landmark: 'landmark:rimecaller-held-road' } }],
        next: 'travellers',
      },
      {
        id: 'travellers', journal: 'Read the frost on the held travellers. Whatever is holding them, you know the shape of it.',
        objectives: [{ id: 'travellers', text: 'Read the held travellers on the pass', interact: 'obj:rimecaller-held-traveller-*', count: 3, marker: { region: 'region:frost' } }],
        next: 'up',
      },
      {
        id: 'up', journal: 'This hold is not the Regent’s. It is older, and colder, and it comes from the top of the pass.',
        objectives: [{ id: 'lair', text: 'Climb to the High Pass', reach: 'inst:sentinel-rime' }],
        onComplete: [{ startQuest: 'quest:rimecaller-rimeheart-colossus' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:rimecaller-rimeheart-colossus', name: 'The Rimeheart Colossus', type: 'class', region: 'region:frost', giver: 'npc:mina-snell',
    summary: 'The Rimeheart Colossus held the northern pass open for the crown’s road for a thousand years. Now it holds it shut.',
    requires: req(done('quest:rimecaller-the-held-pass')), firstStage: 'fight',
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
        onComplete: [{ openDialogue: 'dialogue:rimecaller-travellers-walk' }],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'The held travellers are walking on over the pass. Mina was on the held road when they started. She will want to know why.',
        objectives: [{ id: 'mina', text: 'Tell Mina what the Colossus said', talk: 'npc:mina-snell', marker: { landmark: 'landmark:rimecaller-held-road' } }],
        onComplete: [{ startQuest: 'quest:rimecaller-the-regents-lanterns' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-colossus'] },
  },
  {
    ...A2, id: 'quest:rimecaller-the-regents-lanterns', name: 'The Regent’s Lanterns', type: 'class', region: 'vil:ford', giver: 'npc:hepsie-fenny',
    summary: 'A grey-eyed woman with a chair on a sledge has been seen at Lanternford, buying lights off the marsh. Every one of them is someone’s held moment.',
    requires: req(done('quest:rimecaller-rimeheart-colossus')), firstStage: 'trail',
    stages: [
      {
        id: 'trail', journal: 'A sledge leaves a trail, and a held hour leaves frost on it. Find out where the Regent has been in Lanternford before you go asking.',
        objectives: [{ id: 'trail', text: 'Follow the Regent’s trail through Lanternford', interact: 'obj:rimecaller-sledge-trail-*', count: 3, marker: { region: 'region:marsh' } }],
        next: 'fenny',
      },
      {
        id: 'fenny', journal: 'The lantern-wife at Lanternford sold the Regent an honest lantern, once. She has not stopped worrying about it.',
        objectives: [
          { id: 'hepsie', text: 'Ask at the Lanternford Lantern Shop', talk: 'npc:hepsie-fenny', marker: { landmark: 'landmark:ford-lantern-shop' } },
          { id: 'nim', text: 'Find Nim Larkspur, who knows the marsh', talk: 'npc:nim-larkspur-ford', optional: true, marker: { landmark: 'landmark:ford-lantern-shop' } },
        ],
        onComplete: [{ startQuest: 'quest:rimecaller-the-lantern-queen' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:rimecaller-the-lantern-queen', name: 'The Lantern Queen', type: 'class', region: 'region:marsh', giver: 'npc:hepsie-fenny',
    summary: 'Seraphine is building a lantern that never goes out, around her husband’s last breath, out of lights she buys from the Lantern Queen.',
    requires: req(done('quest:rimecaller-the-regents-lanterns')), firstStage: 'marsh',
    stages: [
      {
        id: 'marsh', journal: 'Out over the black water, where the drowned lights are thickest.',
        objectives: [{ id: 'lair', text: 'Go out to the Drowned Lights', reach: 'inst:sentinel-guile', marker: { region: 'region:marsh' } }],
        next: 'queen',
      },
      {
        id: 'queen', journal: 'The Lantern Queen is the Sentinel of the Guile school. The Guile bearers cannot win their mark while she keeps selling.',
        objectives: [{ id: 'queen', text: 'Defeat the Lantern Queen', kill: 'bx_lanternqueen', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-guile' }, { setFlag: 'story.bearer.corsair', value: true }],
        next: 'lantern',
      },
      {
        id: 'lantern', journal: 'The Queen’s lights are going out one by one. In the middle of her hoard stands a thing that isn’t hers: a lantern-frame, half built, in Glacierhome silver.',
        objectives: [{ id: 'lantern', text: 'Look at the lantern the Regent was building', interact: 'obj:rimecaller-regent-lantern' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-lantern-queen'] },
  },
  {
    ...A2, id: 'quest:rimecaller-halla-writes', name: 'Halla’s Footnotes', type: 'class', region: 'vil:brind', giver: HV,
    summary: 'A letter has come through the Rime arch from Glacierhome. It is fourteen pages long, and most of it is footnotes.',
    requires: req(done('quest:rimecaller-the-lantern-queen')), autoStart: true, firstStage: 'letter',
    stages: [
      {
        id: 'letter', journal: 'A thick envelope is wedged in the ice at the foot of the Rime arch, addressed in Halla’s smallest hand.',
        objectives: [{ id: 'letter', text: 'Collect Halla’s letter at the Gate Circle', interact: 'obj:rime-arch-letter', marker: { landmark: 'landmark:gate-circle' } }],
        next: 'chord',
      },
      {
        id: 'chord', journal: 'The Spire half is singing towards the Stone Court, and something there is singing back.',
        objectives: [{ id: 'court', text: 'Hear the two Rime halves together at the Stone Court', when: { questCompleted: 'quest:cc-stone-court' }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ openDialogue: 'dialogue:rimecaller-held-chord' }],
        next: 'reply',
      },
      {
        id: 'reply', journal: 'Fourteen pages deserve an answer, and the Archive answers in footnotes. The ice at the foot of the Rime arch carries post north.',
        objectives: [{ id: 'reply', text: 'Leave Halla a reply in the ice of the Rime arch', interact: 'obj:rimecaller-arch-reply', marker: { landmark: 'landmark:gate-circle' } }],
        onComplete: [{ setFlag: 'story.act2_ready', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:rimecaller-the-charge-on-the-pass', name: 'The Charge on the Pass', type: 'side', region: 'region:frost', giver: 'npc:bearer-stormlancer',
    summary: 'The Stormlancer bearer means to charge up Frostmere Pass at whatever is holding it, head down and lance first.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'marks',
    stages: [
      {
        id: 'marks', journal: 'Kit Skyward is walking a borrowed goat up and down the Wardenhold road, working up to a charge. Show them what the frost on the pass is really saying.',
        objectives: [{ id: 'marks', text: 'Read the hold-marks on the pass with the Stormlancer bearer', interact: 'obj:rimecaller-pass-hold-mark-*', count: 3, marker: { region: 'region:frost' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Kit has put the lance down for once. They want a word at the Stone Court.',
        objectives: [{ id: 'kit', text: 'Talk to the Stormlancer bearer', when: { any: [{ flag: 'rimecaller.kit_thanked' }, { partyHasClass: 'stormlancer' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.stormlancer', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A2, id: 'quest:rimecaller-a-fool-in-the-marsh', name: 'A Fool in the Marsh', type: 'side', region: 'vil:ford', giver: 'npc:bearer-jester',
    summary: 'The Jester bearer is trying to out-bargain the Lantern Queen from the jetty at Lanternford, and is losing, cheerfully, at a terrible rate.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'lanterns',
    stages: [
      {
        id: 'lanterns', journal: 'Tumble has bought three of the Queen’s lights already. Each one is a held moment. Find out whose, before they buy a fourth.',
        objectives: [{ id: 'lanterns', text: 'Read the lanterns Tumble has bought', interact: 'obj:rimecaller-tumble-lantern-*', count: 3, marker: { landmark: 'landmark:ford-lantern-shop' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Tumble has stopped bargaining, which may be a first. They want a word at the Stone Court.',
        objectives: [{ id: 'tumble', text: 'Talk to the Jester bearer', when: { any: [{ flag: 'rimecaller.tumble_thanked' }, { partyHasClass: 'jester' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.jester', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  // ======================= ACT III: class quests (III-4 + 3 side)
  {
    ...A3, id: 'quest:rimecaller-the-herald-of-the-held-hour', name: 'The Herald of the Held Hour', type: 'class', region: 'region:heart', giver: 'npc:casimir',
    summary: 'At the top of the Twelve Stairs stands the Hollow King’s Herald, in a robe of hoarfrost and a crown of icicles, ringing a bell of clear ice that tolls one note and never lets it end. It is Seraphine Cold.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'herald',
    stages: [
      { id: 'herald', journal: 'Seraphine, the Regent who wanted the Spire half set in the hold to keep her husband one breath from the end, has become the Herald of the Held Hour: one note, held for ever, so that nothing after it can begin.', objectives: [{ id: 'herald', text: 'Face the Herald of the Held Hour at the top of the Twelve Stairs', kill: 'cb_herald-of-the-held-hour', count: 1, marker: { landmark: 'landmark:twelve-stairs-top' } }], onComplete: [{ openDialogue: 'dialogue:rimecaller-herald-fate' }], next: 'fate' },
      { id: 'fate', journal: 'The Herald kneels on the stair. The note has stopped, and she is listening for the next one, terrified.', objectives: [{ id: 'fate', text: 'Decide Seraphine’s fate', when: { flag: 'rimecaller.nemesis_fate' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 3 },
  },
  {
    ...A3, id: 'quest:rimecaller-hallas-first-new-entry', name: 'Halla’s First New Entry', type: 'side', region: 'region:heart', giver: HV,
    summary: 'Pinned to the last of Halla’s fourteen pages was a slip marked, in capitals, NOT TO BE READ BEFORE THE HEART. You have reached the Heart.',
    requires: req({ flag: 'rimecaller.halla_letter' }, done('quest:heart-stairs')), autoStart: true, firstStage: 'reading',
    stages: [
      {
        id: 'reading', journal: 'Halla wants the date, the temperature in the Heart, and one new thing. Archive Thermometer No. 3 came folded in the slip. Take the reading somewhere out of the wind.',
        objectives: [{ id: 'reading', text: 'Take the temperature at the edge of the Heart camp', interact: 'obj:rimecaller-heart-reading', marker: { landmark: 'landmark:heart-camp' } }],
        next: 'find',
      },
      {
        id: 'find', journal: '“One new thing,” underlined twice. Nothing new has happened in the Heart for thirty years. Look anyway: that is what the Archive is for.',
        objectives: [{ id: 'new', text: 'Find one new thing in the Heart', interact: 'obj:rimecaller-heart-snowdrop', marker: { landmark: 'landmark:legion-camp' } }],
        next: 'entry',
      },
      { id: 'entry', journal: 'Halla wants the Archive’s first new entry in thirty years written at the Citadel: the date, the temperature in the Heart, and one new thing.', objectives: [{ id: 'entry', text: 'Write the first new entry on the Citadel steps', interact: 'obj:rimecaller-first-entry', marker: { landmark: 'landmark:twelve-stairs-top' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:rimecaller-anselm', name: 'Anselm', type: 'side', region: 'region:heart', giver: 'npc:anselm-cold-heart',
    summary: 'Anselm Cold’s chair stands in the middle of the Legion camp, where the Hollow King has kept him: one breath from the end, still breathing out.',
    requires: req({ flag: 'rimecaller.nemesis_fate' }), autoStart: true, firstStage: 'ring',
    stages: [
      {
        id: 'ring', journal: 'The hollowed stand round Anselm’s chair in a ring, so close that you can’t get through. They are not guarding him. They are listening to something.',
        objectives: [{ id: 'ring', text: 'Listen with the hollowed round Anselm’s chair', interact: 'obj:rimecaller-anselm-ring', marker: { landmark: 'landmark:legion-camp' } }],
        next: 'chair',
      },
      { id: 'chair', journal: 'The last of the held hour is the size of one room, and Anselm is sitting in it.', objectives: [{ id: 'anselm', text: 'Let the hour go around Anselm Cold', talk: 'npc:anselm-cold-heart', marker: { landmark: 'landmark:legion-camp' } }], next: 'cup' },
      {
        id: 'cup', journal: 'The cup on the table beside his chair was held hot for thirty years. Now it is only a cup of tea, going cold, and somebody should decide what happens to it.',
        objectives: [{ id: 'cup', text: 'See to Anselm’s cup', interact: 'obj:rimecaller-anselm-cup', marker: { landmark: 'landmark:legion-camp' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:rimecaller-the-still-one', name: 'The Still One', type: 'side', region: 'region:heart', giver: HV,
    summary: 'In the Legion camp the hollowed have gathered round the stillest thing in the Heart: a shard of mirror-ice, standing on its point, with your face in it.',
    requires: req(done('quest:heart-legion')), autoStart: true, firstStage: 'gazers',
    stages: [
      {
        id: 'gazers', journal: 'A crowd of the hollowed stands round something in the Legion camp, perfectly quiet. Look over their shoulders before you push through.',
        objectives: [{ id: 'gazers', text: 'See what the hollowed are looking at', interact: 'obj:rimecaller-still-gazers', marker: { landmark: 'landmark:legion-camp' } }],
        next: 'shard',
      },
      { id: 'shard', journal: 'The last shard of the Still Reflection followed you all the way from the Mirror Gallery. It would like you to stand still with it.', objectives: [{ id: 'shard', text: 'Deal with the Still Reflection’s last shard', interact: 'obj:rimecaller-still-one', marker: { landmark: 'landmark:legion-camp' } }], next: 'faces' },
      {
        id: 'faces', journal: 'The crowd that was gazing at the shard is still standing there, not sure what to do with its faces.',
        objectives: [{ id: 'faces', text: 'See to the hollowed who were gazing', interact: 'obj:rimecaller-still-gazers', marker: { landmark: 'landmark:legion-camp' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
];

export default quests;
