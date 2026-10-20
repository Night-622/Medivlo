/**
 * Hollow Crown: the STORMLANCER campaign (docs/lore/hollow-crown/06-outlines/storm.md). Act I on the Thunderclap
 * Heights (area:storm-frontier) and the Act II class thread in Concordia. Owner: Claude 4.
 */
import type { NarrativeCondition, QuestDef } from '@/core';

const SL: NarrativeCondition = { heroClass: 'stormlancer' };
const done = (q: `quest:${string}`): NarrativeCondition => ({ questCompleted: q });
const req = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: [SL, ...c] });
const A1 = { act: 'act1' as const, campaign: 'stormlancer', chapter: 'The Thunderclap Heights' };
const A2 = { act: 'act2' as const, campaign: 'stormlancer', chapter: 'Concordia' };
const A3 = { act: 'act3' as const, campaign: 'stormlancer', chapter: 'The Heart' };
const Z1 = 'zone:storm-frontier-1' as const, Z2 = 'zone:storm-frontier-2' as const, Z3 = 'zone:storm-frontier-3' as const, Z4 = 'zone:storm-frontier-4' as const;
const L1 = 'inst:storm-frontier-lair-1' as const, L2 = 'inst:storm-frontier-lair-2' as const, L3 = 'inst:storm-frontier-lair-3' as const;
const OG = 'npc:odran-gale' as const, CV = 'npc:cass-vantor' as const;

const quests: QuestDef[] = [
  // ======================= ACT I: main (I-1 … I-10)
  {
    ...A1, id: 'quest:stormlancer-the-bell-in-the-chimes', name: 'The Bell in the Chimes', type: 'main', region: Z1, giver: OG,
    summary: 'Night on the Ram Pastures. Somewhere far away a bell rang, every wind-chime on the Heights rang with it, and the Storm Rams stampeded.',
    requires: SL, autoStart: true, firstStage: 'stampede',
    stages: [
      {
        id: 'stampede', journal: 'The whole herd is running for the edge of the Heights in the dark. Catch a ram, any ram, and turn them before the Chime Yard.',
        onEnter: [{ openDialogue: 'dialogue:stormlancer-chimes-night' }],
        objectives: [{ id: 'herd', text: 'Turn the herd at the Chime Yard', reach: 'landmark:chime-yard', marker: { landmark: 'landmark:chime-yard' } }],
        next: 'odran',
      },
      {
        id: 'odran', journal: 'The herd has turned. Something in your chest is singing, and Lancemaster Odran Gale is arriving, last, on foot, at a stroll.',
        objectives: [{ id: 'odran', text: 'Talk to Odran Gale at the Chime Yard', talk: OG, marker: { landmark: 'landmark:chime-yard' } }],
        onComplete: [{ setFlag: 'stormlancer.bell_heard', value: true }],
        next: 'strays',
      },
      {
        id: 'strays', journal: 'Three rams broke from the herd at the first chime and ran the wrong way, towards the storm. Odran wants them home before they find the edge of the Heights.',
        objectives: [{ id: 'strays', text: 'Bring back the three stray rams before they reach the edge of the Heights', interact: 'obj:stormlancer-stray-ram-*', count: 3, marker: { place: Z1 } }],
        next: 'steading',
      },
      {
        id: 'steading', journal: 'Three rams home, and one of them was wearing something it shouldn’t. Odran is back at his steading with the kettle on, taking his time over it.',
        objectives: [{ id: 'odran', text: 'Sit up with Odran at his steading', talk: OG, marker: { landmark: 'landmark:odran-gale-steading' } }],
        onComplete: [{ startQuest: 'quest:stormlancer-reading-the-sky' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-thunderreach', 'lore:hc-lance-clans'] },
  },
  {
    ...A1, id: 'quest:stormlancer-reading-the-sky', name: 'Reading the Sky', type: 'main', region: Z2, giver: OG,
    summary: 'The lightning on the Heights falls in patterns every lancer learns as a child. Odran says the patterns have changed, and he would like you to read them, since he can’t get up.',
    requires: req(done('quest:stormlancer-the-bell-in-the-chimes')), firstStage: 'stones',
    stages: [
      {
        id: 'stones', journal: 'The pattern-stones on the open Heights show where the strikes have fallen for a thousand years. Read them.',
        objectives: [{ id: 'stones', text: 'Read the lightning pattern-stones on the open Heights', interact: 'obj:lightning-pattern-stones', marker: { place: Z2 } }],
        next: 'wisps',
      },
      {
        id: 'wisps', journal: 'The strikes are coming down black, and they fall where the herds graze. Static Wisps ride them down.',
        objectives: [{ id: 'wisps', text: 'Drive the wisps off the grazing', kill: 'bx_storm_1', count: 3, marker: { place: Z2 } }],
        next: 'strikes',
      },
      {
        id: 'strikes', journal: 'The black strikes don’t walk across the Heights like the old ones. Follow the fresh scorches and see where they are going.',
        objectives: [{ id: 'scorch', text: 'Follow the black strike-scorches', interact: 'obj:stormlancer-black-strike-*', count: 3, marker: { place: Z2 } }],
        next: 'report',
      },
      {
        id: 'report', journal: 'The pattern is a pattern of hunting. The storm is going for the herds.',
        objectives: [{ id: 'odran', text: 'Report to Odran', talk: OG, marker: { landmark: 'landmark:odran-gale-steading' } }],
        onComplete: [{ startQuest: 'quest:stormlancer-the-ram-kings-crag' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:stormlancer-the-ram-kings-crag', name: 'The Ram King’s Crag', type: 'main', region: Z1, giver: OG,
    summary: 'The herd-king has gone hollow, and every night he leads more rams off the crag into the storm. The clan wants him killed. He is still fighting for his herd, just the wrong way.',
    requires: req(done('quest:stormlancer-reading-the-sky')), firstStage: 'crag',
    stages: [
      {
        id: 'crag', journal: 'The Ram King’s Crag rises over the Pastures. The herd-king stands on top of it, lightning in his horns.',
        objectives: [{ id: 'enter', text: 'Ride up the Ram King’s Crag', reach: L1, marker: { place: Z1 } }],
        next: 'ram',
      },
      {
        id: 'ram', journal: 'A joust on the crag. Meet his charge lance-first, and drive the herd back from the edge between passes.',
        objectives: [{ id: 'ram', text: 'Face the Storm Ram', kill: 'bx_storm_3', count: 1 }],
        next: 'herd',
      },
      {
        id: 'herd', journal: 'The Ram King is down. His herd is standing at the very edge of the crag, waiting for someone to lead them.',
        objectives: [{ id: 'herd', text: 'Lead the herd down off the crag', interact: 'obj:crag-herd-edge' }],
        next: 'report',
      },
      {
        id: 'report', journal: 'The herd is safe in the Pastures.',
        objectives: [{ id: 'odran', text: 'Report to Odran', talk: OG, marker: { landmark: 'landmark:odran-gale-steading' } }],
        onComplete: [{ setFlag: 'stormlancer.herd_saved', value: true }, { startQuest: 'quest:stormlancer-catch-her' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 80, hcItems: [{ item: 'i_st', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:stormlancer-catch-her', name: 'Catch Her', type: 'main', region: Z2, giver: CV,
    summary: 'Something crossed the Heights at dawn faster than any ram. The herders swear it was a woman, on foot, laughing.',
    requires: req(done('quest:stormlancer-the-ram-kings-crag')), firstStage: 'streak',
    stages: [
      {
        id: 'streak', journal: 'The streak keeps stopping at the start of the Thunderclap Run, as if it is waiting for someone.',
        objectives: [{ id: 'cass', text: 'Find whoever is waiting at the Thunderclap Run', talk: CV, marker: { landmark: 'landmark:thunderclap-run-start' } }],
        next: 'run',
      },
      {
        id: 'run', journal: 'Cass Vantor is alive, and hollow, and she has accepted your challenge. The Thunderclap Run: out round the three posts and back.',
        objectives: [{ id: 'posts', text: 'Run the Thunderclap Run against Cass', interact: 'obj:thunderclap-run-post-*', count: 3, marker: { place: Z2 } }],
        next: 'cass',
      },
      {
        id: 'cass', journal: 'She won by a mile. She is waiting at the finish, not even out of breath.',
        objectives: [{ id: 'cass', text: 'Talk to Cass at the finish', talk: CV, marker: { landmark: 'landmark:thunderclap-run-start' } }],
        onComplete: [{ setFlag: 'stormlancer.cass_back', value: true }, { startQuest: 'quest:stormlancer-the-great-charge' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-cass-vantor', 'lore:hc-thunderclap-run'] },
  },
  {
    ...A1, id: 'quest:stormlancer-the-great-charge', name: 'The Great Charge', type: 'main', region: Z1, giver: OG,
    summary: 'By old clan law, when a storm won’t pass the clans charge it. The young lancers want to charge Skyrender’s storm, and Cass has said she will ride at their head.',
    requires: req(done('quest:stormlancer-catch-her')), firstStage: 'canvass',
    stages: [
      {
        id: 'canvass', journal: 'Before the muster, hear the two people who will live with whatever the clans decide: Tamar Mallory, who wants to charge, and Herdmistress Gwenna Fold, who has to keep three hundred rams alive whatever happens.',
        objectives: [
          { id: 'tamar', text: 'Hear Tamar Mallory out', talk: 'npc:tamar-mallory', marker: { landmark: 'landmark:cowards-cairn' } },
          { id: 'gwenna', text: 'Hear Gwenna Fold out', talk: 'npc:gwenna-fold', marker: { landmark: 'landmark:chime-yard' } },
        ],
        next: 'muster',
      },
      {
        id: 'muster', journal: 'The clans are mustering at the Chime Yard. Everyone who rides gets a voice.',
        objectives: [{ id: 'muster', text: 'Speak at the clan muster', when: { flag: 'stormlancer.charge' }, marker: { landmark: 'landmark:chime-yard' } }],
        next: [
          { when: { flag: 'stormlancer.charge', value: 'charged' }, to: 'charge' },
          { when: { flag: 'stormlancer.charge', value: 'sheltered' }, to: 'gorge' },
          { to: 'after' },
        ],
      },
      {
        id: 'charge', journal: 'The clans are charging the edge of the storm. Ride with them, and break the Thunderbirds that dive out of it.',
        objectives: [{ id: 'charge', text: 'Charge the storm’s edge', kill: 'bx_storm_0', count: 3, marker: { place: Z2 } }],
        next: 'after',
      },
      {
        id: 'gorge', journal: 'The clans are bringing the herds down into Skyfall Gorge to shelter. Lead them down.',
        objectives: [{ id: 'gorge', text: 'Bring the herds down into Skyfall Gorge', reach: Z3, marker: { place: Z3 } }],
        next: 'after',
      },
      {
        id: 'after', journal: 'Whatever the clans did, they all ended up under the Thunderbird Aerie, and something up there is dropping fledglings.',
        objectives: [],
        onComplete: [{ startQuest: 'quest:stormlancer-old-clatterwing' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A1, id: 'quest:stormlancer-old-clatterwing', name: 'Old Clatterwing', type: 'main', region: Z3, giver: OG,
    summary: 'The Thunderbird matriarch of the Aerie has gone hollow, and she is dropping her own fledglings into Skyfall Gorge.',
    requires: req(done('quest:stormlancer-the-great-charge')), firstStage: 'aerie',
    stages: [
      {
        id: 'aerie', journal: 'The Thunderbird Aerie hangs off the side of Skyfall Gorge like a wasps’ nest made of lightning.',
        objectives: [{ id: 'enter', text: 'Climb into the Thunderbird Aerie', reach: L2, marker: { place: Z3 } }],
        next: 'clatterwing',
      },
      {
        id: 'clatterwing', journal: 'Catch the fledglings she drops, and she will dive low enough to strike.',
        objectives: [{ id: 'bird', text: 'Defeat Old Clatterwing', kill: 'cb_old-clatterwing', count: 1 }],
        next: 'fledglings',
      },
      {
        id: 'fledglings', journal: 'The fledglings you caught are huddled in your cloak, sparking, furious and fine.',
        objectives: [{ id: 'nest', text: 'Put the fledglings back in the nest', interact: 'obj:aerie-fledglings' }],
        onComplete: [{ startQuest: 'quest:stormlancer-faster-than-grief' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 120 },
  },
  {
    ...A1, id: 'quest:stormlancer-faster-than-grief', name: 'Faster Than Grief', type: 'main', region: Z4, giver: CV,
    summary: 'Cass is waiting for you on the Eyrie Steps. For once she is standing still, which seems to be costing her something.',
    requires: req(done('quest:stormlancer-old-clatterwing')), firstStage: 'steps',
    stages: [
      {
        id: 'steps', journal: 'High on the Eyrie Steps, over the whole of the Heights, Cass wants to tell you what she wants.',
        objectives: [{ id: 'cass', text: 'Talk to Cass on the Eyrie Steps', talk: CV, marker: { landmark: 'landmark:eyrie-stair' } }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'The Brave Stone stands halfway across the Heights, carved with the names of every first rider. Cass went there the day before she rode into the storm. Go and see what she left.',
        objectives: [{ id: 'stone', text: 'Look at the Brave Stone', interact: 'obj:stormlancer-brave-stone', marker: { landmark: 'landmark:stormlancer-brave-stone' } }],
        next: 'odran',
      },
      {
        id: 'odran', journal: 'She wants the Eye half, and she can’t get into the Eye to take it, because the Eye only opens to someone who can stop.',
        objectives: [{ id: 'odran', text: 'Tell Odran what Cass wants', talk: OG, marker: { landmark: 'landmark:odran-gale-steading' } }],
        onComplete: [{ setFlag: 'stormlancer.cass_known', value: true }, { startQuest: 'quest:stormlancer-the-eye-of-the-storm' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A1, id: 'quest:stormlancer-the-eye-of-the-storm', name: 'The Eye of the Storm', type: 'main', region: L3, giver: OG,
    summary: 'The Eye half lies at the still centre of Skyrender’s storm. Only someone who can stop can enter the Eye. Cass will follow you in.',
    requires: req(done('quest:stormlancer-faster-than-grief')), firstStage: 'eye',
    stages: [
      {
        id: 'eye', journal: 'Ride into the storm, and when you reach the middle of it, stop.',
        objectives: [{ id: 'enter', text: 'Ride into the Eye of the Storm, and stop', reach: L3, marker: { place: Z4 } }],
        onComplete: [{ openDialogue: 'dialogue:stormlancer-eye-words' }],
        next: 'cass',
      },
      {
        id: 'cass', journal: 'She is too fast to chase. Brace your lance, stand your ground, and let her come to you.',
        objectives: [{ id: 'cass', text: 'Stand against Cass Vantor', kill: 'cb_cass-vantor', count: 1 }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'Cass has fallen back to the edge of the Eye. The Eye half is lying in the silent centre, where nothing moves.',
        objectives: [{ id: 'stone', text: 'Take the Eye half', interact: 'obj:storm-frontier-halfstone' }],
        onComplete: [{ setFlag: 'stormlancer.halfstone', value: true }, { startQuest: 'quest:stormlancer-the-long-ride-down' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, skillPoints: 1, lore: ['lore:hc-half-stones'] },
  },
  {
    ...A1, id: 'quest:stormlancer-the-long-ride-down', name: 'The Long Ride Down', type: 'main', region: Z1, giver: OG,
    summary: 'Cass is running for the Copper Gate. Odran means to ride down with you, which will take a while.',
    requires: req(done('quest:stormlancer-the-eye-of-the-storm')), firstStage: 'farewell',
    stages: [
      {
        id: 'farewell', journal: 'Odran is saddling Old Biddy at his steading, very slowly. Old Biddy is resisting, very slowly.',
        objectives: [{ id: 'odran', text: 'Ride down with Odran', talk: OG, marker: { landmark: 'landmark:odran-gale-steading' } }],
        next: 'cairn',
      },
      {
        id: 'cairn', journal: 'Halfway down the cliff road the clans keep a riders’ cairn, where every lancer who leaves the Heights ties a thread from their pennant. Nobody has tied one in thirty years.',
        objectives: [{ id: 'cairn', text: 'Stop at the riders’ cairn on the cliff road', interact: 'obj:stormlancer-riders-cairn', marker: { landmark: 'landmark:stormlancer-riders-cairn' } }],
        next: 'road',
      },
      {
        id: 'road', journal: 'Down off the Heights by the cliff road to the Copper Gate. Cass’s tracks are scorched into the turf.',
        objectives: [{ id: 'gate', text: 'Ride to the Copper Gate', reach: 'area:storm-gate', marker: { place: 'area:storm-gate' } }],
        onComplete: [{ startQuest: 'quest:stormlancer-the-copper-gate' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:stormlancer-the-copper-gate', name: 'The Copper Gate (Heights side)', type: 'main', region: 'area:storm-gate', giver: OG,
    summary: 'Skyrender, the storm-bird whose wings make the weather, wheels over the cliffs above the Copper Gate, hollow, beating black weather.',
    requires: req(done('quest:stormlancer-the-long-ride-down')), firstStage: 'skyrender',
    stages: [
      {
        id: 'skyrender', journal: 'Charge along the cliff-tops and strike when it dives. When it comes low enough, jump.',
        objectives: [{ id: 'skyrender', text: 'Joust Skyrender over the cliffs', kill: 'bx_storm_5', count: 1 }],
        next: 'gate',
      },
      {
        id: 'gate', journal: 'Skyrender bowed its head to your lance and carried you the last mile on its back. The gate is weeping black tears down its face.',
        objectives: [{ id: 'seal', text: 'Open the Copper Gate with the Eye half', interact: 'obj:storm-gate-seal' }],
        onComplete: [{ setFlag: 'story.gate_open', value: true }, { setFlag: 'story.act', value: 2 }, { setFlag: 'stormlancer.act1_done', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 200, lore: ['lore:hc-realm-gates', 'lore:hc-skyrender'] },
  },

  // ======================= ACT I: side quests (2 per zone)
  {
    ...A1, id: 'quest:stormlancer-thistle-wont-eat', name: 'Thistle Won’t Eat', type: 'side', region: Z1, giver: 'npc:thistle',
    summary: 'Cass’s ram Thistle has stood in her stall facing the door since she came home alone, and she will not eat.',
    requires: req(done('quest:stormlancer-the-bell-in-the-chimes')), firstStage: 'blanket',
    stages: [
      {
        id: 'blanket', journal: 'Something that smells of Cass might help. Her old saddle-blanket is still in her empty steading.',
        objectives: [{ id: 'blanket', text: 'Fetch Cass’s old saddle-blanket', interact: 'obj:cass-saddle-blanket', marker: { landmark: 'landmark:thistles-stall' } }],
        next: 'thistle',
      },
      {
        id: 'thistle', journal: 'A worn blue blanket, and it smells of Cass: hay, lightning, and oranges.',
        objectives: [{ id: 'thistle', text: 'Bring the blanket to Thistle', talk: 'npc:thistle', marker: { landmark: 'landmark:thistles-stall' } }],
        onComplete: [{ setFlag: 'stormlancer.thistle_fed', value: true }],
        next: 'edge',
      },
      {
        id: 'edge', journal: 'Thistle has eaten, a little, and now she will not stop pushing at the stall door. She wants to go and look. Walk her out to the edge of the Heights, where you can see the storm.',
        objectives: [{ id: 'edge', text: 'Walk Thistle to the storm’s edge', interact: 'obj:stormlancer-thistle-lookout', marker: { landmark: 'landmark:stormlancer-storm-edge' } }],
        onComplete: [{ setFlag: 'stormlancer.thistle_called', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 30 },
  },
  {
    ...A1, id: 'quest:stormlancer-the-chime-maker', name: 'The Chime-Maker', type: 'side', region: Z1, giver: 'npc:wendeline-chyme',
    summary: 'Wendeline Chyme’s wind-chimes tell the clans which way a storm is coming. Since the Bell, every one of them rings the same note.',
    requires: req(done('quest:stormlancer-the-bell-in-the-chimes')), firstStage: 'chimes',
    stages: [
      {
        id: 'chimes', journal: 'Four great chimes hang in the Chime Yard. Retune each one with a tap of your lance-butt, high, low, high, low.',
        objectives: [{ id: 'chimes', text: 'Retune the Chime Yard chimes', interact: 'obj:wind-chime-*', count: 4, marker: { landmark: 'landmark:chime-yard' } }],
        next: 'wendeline',
      },
      {
        id: 'wendeline', journal: 'Four notes again, and the wind is from the north-east.',
        objectives: [{ id: 'wendeline', text: 'Tell Wendeline the chimes are true', talk: 'npc:wendeline-chyme', marker: { landmark: 'landmark:chime-yard' } }],
        next: 'bellnote',
      },
      {
        id: 'bellnote', journal: 'One small chime would not retune. It rings the Bell’s note and nothing else. Wendeline says it belongs on a door where somebody will listen to it properly. She has a door in mind.',
        objectives: [{ id: 'odran', text: 'Take the Bell-note chime to Odran', talk: OG, marker: { landmark: 'landmark:odran-gale-steading' } }],
        onComplete: [{ setFlag: 'stormlancer.bell_chime', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50 },
  },
  {
    ...A1, id: 'quest:stormlancer-learn-the-pattern', name: 'Learn the Pattern', type: 'side', region: Z2, giver: 'npc:osric-quell',
    summary: 'Strike-Reader Osric Quell runs the clans’ oldest trial: cross the open Heights in a lightning storm by stepping where it won’t strike. He insists it’s perfectly safe.',
    requires: req(done('quest:stormlancer-reading-the-sky')), firstStage: 'steps',
    stages: [
      {
        id: 'steps', journal: 'Four strike-stones across the open Heights. Step on each one between strikes. Don’t step anywhere else.',
        objectives: [{ id: 'steps', text: 'Cross the Heights by the strike-stones', interact: 'obj:strike-step-*', count: 4, marker: { place: Z2 } }],
        next: 'osric',
      },
      {
        id: 'osric', journal: 'You crossed. Your boots are only slightly on fire.',
        objectives: [{ id: 'osric', text: 'Report to Osric', talk: 'npc:osric-quell', marker: { landmark: 'landmark:thunderclap-run-start' } }],
        next: 'wake',
      },
      {
        id: 'wake', journal: 'Osric has never crossed the oldest pattern on the Heights. It isn’t a crossing at all. It runs off the edge of his map, behind where storms go, to one stone nobody visits.',
        objectives: [{ id: 'stone', text: 'Find the oldest pattern-stone', interact: 'obj:stormlancer-wake-stone', marker: { landmark: 'landmark:stormlancer-wake-stone' } }],
        onComplete: [{ setFlag: 'stormlancer.wake_stone', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_scroll_storm' }] },
  },
  {
    ...A1, id: 'quest:stormlancer-the-cowards-cairn', name: 'The Coward’s Cairn', type: 'side', region: Z2, giver: 'npc:tamar-mallory',
    summary: 'Across the plain from the Brave Stone stands the Coward’s Cairn, stacked with the names of lancers who turned back. Tamar Mallory dares you to read the oldest name.',
    requires: req(done('quest:stormlancer-reading-the-sky')), firstStage: 'cairn',
    stages: [
      {
        id: 'cairn', journal: 'The oldest name is at the very bottom of the cairn, worn nearly smooth.',
        objectives: [{ id: 'cairn', text: 'Read the oldest name on the Coward’s Cairn', interact: 'obj:cowards-cairn-names', marker: { landmark: 'landmark:cowards-cairn' } }],
        next: 'odran',
      },
      {
        id: 'odran', journal: 'ODRAN GALE. Ask him why.',
        objectives: [{ id: 'odran', text: 'Ask Odran about his name on the cairn', talk: OG, marker: { landmark: 'landmark:odran-gale-steading' } }],
        onComplete: [{ setFlag: 'stormlancer.cairn_asked', value: true }],
        next: 'tamar',
      },
      {
        id: 'tamar', journal: 'Tamar dared you to read the oldest name. Her own nan is on the third row. She ought to hear why Odran Gale turned back.',
        objectives: [{ id: 'tamar', text: 'Tell Tamar why Odran turned back', talk: 'npc:tamar-mallory', marker: { landmark: 'landmark:cowards-cairn' } }],
        onComplete: [{ setFlag: 'stormlancer.tamar_told', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-cowards-cairn'] },
  },
  {
    ...A1, id: 'quest:stormlancer-the-fallen-fledgling', name: 'The Fallen Fledgling', type: 'side', region: Z3, giver: 'npc:gorge-fledgling',
    summary: 'A Thunderbird fledgling has fallen into Skyfall Gorge. It isn’t hollow. It’s only small, and cold, and very angry.',
    requires: req(done('quest:stormlancer-the-ram-kings-crag')), firstStage: 'static',
    stages: [
      {
        id: 'static', journal: 'Thunderbird chicks eat static. The Static Wisps in the gorge are full of it.',
        objectives: [{ id: 'wisps', text: 'Gather static from the gorge wisps', kill: 'bx_storm_1', count: 3, marker: { place: Z3 } }],
        next: 'nest',
      },
      {
        id: 'nest', journal: 'Your hands are crackling. Feed the fledgling, and build up its nest out of the wind.',
        objectives: [{ id: 'nest', text: 'Feed the fledgling and warm its nest', interact: 'obj:stormlancer-fledgling-nest', marker: { landmark: 'landmark:gorge-rockfall' } }],
        onComplete: [{ setFlag: 'stormlancer.fledgling_raised', value: true }],
        next: 'updraft',
      },
      {
        id: 'updraft', journal: 'Fat, crackling and bored, the fledgling keeps flapping at the sky. There is an updraft ledge halfway up the gorge path where the young Thunderbirds learn. Carry it up and let it try.',
        objectives: [{ id: 'ledge', text: 'Let the fledgling try its wings at the updraft ledge', interact: 'obj:stormlancer-updraft-ledge', marker: { landmark: 'landmark:stormlancer-updraft-ledge' } }],
        onComplete: [{ setFlag: 'stormlancer.fledgling_flew', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:stormlancer-the-rockfall-wager', name: 'The Rockfall Wager', type: 'side', region: Z3, giver: 'npc:rory-gust',
    summary: 'Rory Gust’s gorge-riders dare each other to ride under Skyfall Gorge’s falling rocks. The first one through wins. Somebody always has to go second.',
    requires: req(done('quest:stormlancer-the-ram-kings-crag')), firstStage: 'wager',
    stages: [
      {
        id: 'wager', journal: 'The riders are lined up at the mouth of the rockfall. Ride it, or talk them out of it.',
        objectives: [{ id: 'start', text: 'Face the rockfall run', interact: 'obj:rockfall-start', marker: { landmark: 'landmark:gorge-rockfall' } }],
        next: 'rory',
      },
      {
        id: 'rory', journal: 'However it went, Rory wants a word.',
        objectives: [{ id: 'rory', text: 'Talk to Rory Gust', talk: 'npc:rory-gust', marker: { landmark: 'landmark:gorge-rockfall' } }],
        next: 'post',
      },
      {
        id: 'post', journal: 'At the top of the gorge path stands the wager-post, with the name of every rider who ever went through first. Rory says there is something on the back nobody reads.',
        objectives: [{ id: 'post', text: 'Read the back of the wager-post', interact: 'obj:stormlancer-wager-post', marker: { landmark: 'landmark:stormlancer-wager-post' } }],
        onComplete: [{ setFlag: 'stormlancer.wager_post', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50 },
  },
  {
    ...A1, id: 'quest:stormlancer-the-stair-counter', name: 'The Stair-Counter', type: 'side', region: Z4, giver: 'npc:tally-rowe',
    summary: 'Old Tally Rowe has counted the Eyrie Steps every morning for forty years. Since the Bell there has been one more step than there used to be, and it is warm.',
    requires: req(done('quest:stormlancer-old-clatterwing')), firstStage: 'step',
    stages: [
      {
        id: 'step', journal: 'Between the two hundred and eleventh step and the two hundred and twelfth, there is another one.',
        objectives: [{ id: 'step', text: 'Find the extra step on the Eyrie Steps', interact: 'obj:warm-step', marker: { landmark: 'landmark:eyrie-stair' } }],
        next: 'tally',
      },
      {
        id: 'tally', journal: 'It’s there. It’s warm. It hums.',
        objectives: [{ id: 'tally', text: 'Tell Tally about the warm step', talk: 'npc:tally-rowe', marker: { landmark: 'landmark:eyrie-stair' } }],
        next: 'book',
      },
      {
        id: 'book', journal: 'Tally dropped her first counting-book off the bottom of the Steps thirty years ago, in a temper, and never went down for it. She thinks it might say something about the extra step. She will not say what.',
        objectives: [{ id: 'book', text: 'Find Tally’s old counting-book below the Eyrie Steps', interact: 'obj:stormlancer-tally-book', marker: { landmark: 'landmark:stormlancer-steps-foot' } }],
        onComplete: [{ setFlag: 'stormlancer.tally_book', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-warm-step'] },
  },
  {
    ...A1, id: 'quest:stormlancer-feathers-for-the-pennant', name: 'Feathers for the Pennant', type: 'side', region: Z4, giver: 'npc:nessa-plume',
    summary: 'Nessa Plume, the clans’ pennant-maker, has run out of clean Thunderbird feathers. Black ones won’t take a stitch.',
    requires: req(done('quest:stormlancer-old-clatterwing')), firstStage: 'nests',
    stages: [
      {
        id: 'nests', journal: 'The old Thunderbird nests on the Eyrie Steps are full of moulted feathers. Find the clean ones.',
        objectives: [{ id: 'nests', text: 'Search the Thunderbird nests for clean feathers', interact: 'obj:thunderbird-nest-*', count: 3, marker: { place: Z4 } }],
        next: 'nessa',
      },
      {
        id: 'nessa', journal: 'A fistful of feathers, blue-grey and crackling, not a black one among them.',
        objectives: [{ id: 'nessa', text: 'Bring the feathers to Nessa', talk: 'npc:nessa-plume', marker: { landmark: 'landmark:eyrie-stair' } }],
        onComplete: [{ setFlag: 'stormlancer.pennant_feathers', value: true }],
        next: 'matriarch',
      },
      {
        id: 'matriarch', journal: 'Every feather is clean but one: the long one for the pennant’s tip. Nessa says it must come from the oldest bird on the Heights, given, not taken. Old Clatterwing is clean now. Ask her.',
        objectives: [{ id: 'feather', text: 'Ask Old Clatterwing for a feather', interact: 'obj:stormlancer-matriarch-feather', marker: { place: Z3 } }],
        onComplete: [{ setFlag: 'stormlancer.matriarch_feather', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 60 },
  },

  // ======================= ACT I: mentor thread (2) and bounties (2)
  {
    ...A1, id: 'quest:stormlancer-why-odran-falls-off', name: 'Why Odran Falls Off', type: 'side', region: Z1, giver: OG,
    summary: 'Odran Gale has fallen off more rams than anyone alive. He says he does it on purpose. He has offered to demonstrate.',
    requires: req({ trust: OG, value: 'friendly' }, done('quest:stormlancer-reading-the-sky')), firstStage: 'watch',
    stages: [
      {
        id: 'watch', journal: 'Odran is riding at the practice post behind his steading. Watch closely. Watch him fall.',
        objectives: [{ id: 'watch', text: 'Watch Odran at the practice post', interact: 'obj:odran-practice-post', marker: { landmark: 'landmark:odran-gale-steading' } }],
        next: 'odran',
      },
      {
        id: 'odran', journal: 'He fell off four times, each time a little further downwind. That can’t be an accident.',
        objectives: [{ id: 'odran', text: 'Ask Odran what he was doing', talk: OG, marker: { landmark: 'landmark:odran-gale-steading' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, skillPoints: 1, lore: ['lore:hc-ride-the-wake'] },
  },
  {
    ...A1, id: 'quest:stormlancer-maudies-lance', name: 'Maudie’s Lance', type: 'side', region: Z4, giver: OG,
    summary: 'Odran has a lance he never rides with. It was Maudie’s. She always said where she wanted it, and he has never been able to carry it up there.',
    requires: req({ trust: OG, value: 'trusted' }, done('quest:stormlancer-the-cowards-cairn')), firstStage: 'plant',
    stages: [
      {
        id: 'plant', journal: 'Carry Maudie’s lance up the Eyrie Steps to the high ledge, where she always said she wanted to watch the storm from.',
        objectives: [{ id: 'lance', text: 'Plant Maudie’s lance on the Eyrie Steps', interact: 'obj:maudie-lance', marker: { landmark: 'landmark:eyrie-stair' } }],
        next: 'odran',
      },
      {
        id: 'odran', journal: 'The lance is standing on the high ledge, its pennant out straight in the wind, watching the storm.',
        objectives: [{ id: 'odran', text: 'Tell Odran', talk: OG, marker: { landmark: 'landmark:odran-gale-steading' } }],
        onComplete: [{ setFlag: 'stormlancer.odran_devotable', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:stormlancer-bounty-pasture-wisps', name: 'Bounty: the Pasture Wisps', type: 'bounty', region: Z1, giver: 'npc:gwenna-fold',
    summary: 'Hollow Static Wisps have been spooking the herds on the Ram Pastures every night. Gwenna Fold pays by the wisp.',
    requires: req(done('quest:stormlancer-the-bell-in-the-chimes')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'They come at dusk, crackling in the long grass.', objectives: [{ id: 'wisps', text: 'Defeat the pasture wisps', kill: 'bx_storm_1', count: 6, marker: { place: Z1 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 150 },
  },
  {
    ...A1, id: 'quest:stormlancer-bounty-gorge-thunderbirds', name: 'Bounty: the Gorge Thunderbirds', type: 'bounty', region: Z3, giver: 'npc:gwenna-fold',
    summary: 'Hollow Thunderbirds are diving on the herds sheltering in Skyfall Gorge. Gwenna Fold pays by the bird.',
    requires: req(done('quest:stormlancer-the-ram-kings-crag')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'Six of them, nesting in the gorge walls.', objectives: [{ id: 'birds', text: 'Defeat the gorge Thunderbirds', kill: 'bx_storm_0', count: 6, marker: { place: Z3 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 120 },
  },

  // ======================= ACT II: the class thread (C-1 … C-6) + featured bearers
  // depth pass (wave 2): the dare-board, Hamlin following you up the cliff, telling him, Cass's trail on the pass,
  // the lance she left at the top, and an answer sent home
  {
    ...A2, id: 'quest:stormlancer-cliffstair', name: 'The Lancers of Cliffstair', type: 'class', region: 'vil:cliff', giver: 'npc:hamlin-crake',
    summary: 'Somewhere in Concordia, Morvane’s Stormlancers train in a Wind Yard on the Stormcliffs. Nobody can tell you what they ride.',
    requires: req(done('quest:cc-through-the-arch')), autoStart: true, firstStage: 'crake',
    stages: [
      {
        id: 'crake', journal: 'Ysolde says the Storm-folk of Concordia keep a village called Cliffstair on the Stormcliffs, with a Wind Yard where lancers train.',
        objectives: [{ id: 'hamlin', text: 'Find the lancers of the Wind Yard', talk: 'npc:hamlin-crake', marker: { landmark: 'landmark:cliff-wind-yard' } }],
        next: 'board',
      },
      {
        id: 'board', journal: 'By the Wind Yard gate hangs the dare-board: thirty years of names, and how far up the Stormcliffs each of them got. The top line is blank.',
        objectives: [{ id: 'board', text: 'Read the Wind Yard’s dare-board', interact: 'obj:stormlancer-dare-board', marker: { landmark: 'landmark:cliff-wind-yard' } }],
        onComplete: [{ startQuest: 'quest:stormlancer-the-cliff-charge' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-storm-cliffstair'] },
  },
  {
    ...A2, id: 'quest:stormlancer-the-cliff-charge', name: 'The Cliff Charge', type: 'class', region: 'region:storm', giver: 'npc:hamlin-crake',
    summary: 'The Wind Yard dares you to ride up the Stormcliffs first, all the way to the Stormcrow’s nest. Nobody has done it in thirty years. Nobody has had a ram.',
    requires: req(done('quest:stormlancer-cliffstair')), firstStage: 'flags',
    stages: [
      {
        id: 'flags', journal: 'Three old charge-flags mark the way up the Stormcliffs. Take each one, going up.',
        objectives: [{ id: 'flags', text: 'Take the charge-flags up the Stormcliffs', interact: 'obj:stormlancer-cliff-charge-flag-*', count: 3, marker: { region: 'region:storm' } }],
        next: 'lip',
      },
      {
        id: 'lip', journal: 'Somebody is coming up the cliff behind you, at a steady scramble, on a goat. At the lip, under the last flag, wait for them.',
        objectives: [{ id: 'hamlin', text: 'Wait for whoever is following you up the cliff', talk: 'npc:hamlin-crake', marker: { landmark: 'landmark:stormlancer-cliff-lip' } }],
        next: 'up',
      },
      {
        id: 'up', journal: 'The last flag is at the lip of the nest. The Stormcrow is screaming.',
        objectives: [{ id: 'lair', text: 'Ride into the Stormcrow’s nest', reach: 'inst:sentinel-storm' }],
        onComplete: [{ startQuest: 'quest:stormlancer-the-stormcrow' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:stormlancer-the-stormcrow', name: 'The Stormcrow', type: 'class', region: 'region:storm', giver: 'npc:hamlin-crake',
    summary: 'The Stormcrow was always first with the news. For thirty years it has been first with the same news, about a Turning that never came.',
    requires: req(done('quest:stormlancer-the-cliff-charge')), firstStage: 'fight',
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
        id: 'tell', journal: 'The cliffs are quiet. Down in the Wind Yard twenty goats are looking up with their ears forward, and Hamlin wants to know what the bird said.',
        objectives: [{ id: 'hamlin', text: 'Tell Hamlin what the Stormcrow said', talk: 'npc:hamlin-crake', marker: { landmark: 'landmark:cliff-wind-yard' } }],
        onComplete: [{ startQuest: 'quest:stormlancer-the-race-on-the-pass' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-stormcrow'] },
  },
  {
    ...A2, id: 'quest:stormlancer-the-race-on-the-pass', name: 'The Race on the Pass', type: 'class', region: 'region:frost', giver: 'npc:gudrun-hailstone',
    summary: 'Somebody runs Frostmere Pass at night, racing the avalanches, with hollow runners behind her. The Wardenhold watchman has logged her every night for a month.',
    requires: req(done('quest:stormlancer-the-stormcrow')), firstStage: 'trail',
    stages: [
      {
        id: 'trail', journal: 'Heights colours on the pass, the watchman wrote to the Wind Yard. Laughing. If it’s who you think, she will have left a trail. She never could go anywhere quietly.',
        objectives: [{ id: 'trail', text: 'Find the runner’s trail at the foot of Frostmere Pass', interact: 'obj:stormlancer-cass-sign-*', count: 3, marker: { region: 'region:frost' } }],
        next: 'gudrun',
      },
      {
        id: 'gudrun', journal: 'The night watchman of the Wardenhold watchtower keeps an avalanche log. Lately it has another column.',
        objectives: [{ id: 'gudrun', text: 'Ask the Wardenhold watchman', talk: 'npc:gudrun-hailstone', marker: { landmark: 'landmark:warden-watchtower' } }],
        next: 'race',
      },
      {
        id: 'race', journal: 'She runs the pass after dark. Wait at the race-line on the pass road, and watch.',
        objectives: [{ id: 'race', text: 'Watch the pass road at night', when: { flag: 'stormlancer.saw_race' }, marker: { region: 'region:frost' } }],
        onComplete: [{ startQuest: 'quest:stormlancer-rimeheart-colossus' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:stormlancer-rimeheart-colossus', name: 'The Rimeheart Colossus', type: 'class', region: 'region:frost', giver: 'npc:gudrun-hailstone',
    summary: 'The Rimeheart Colossus holds Frostmere Pass shut. It is the one thing in Morvane Cass can’t get past, and she has been trying every night.',
    requires: req(done('quest:stormlancer-the-race-on-the-pass')), firstStage: 'pass',
    stages: [
      {
        id: 'pass', journal: 'Up Frostmere Pass to the High Pass, where the Colossus stands.',
        objectives: [{ id: 'lair', text: 'Ride to the High Pass', reach: 'inst:sentinel-rime', marker: { region: 'region:frost' } }],
        next: 'colossus',
      },
      {
        id: 'colossus', journal: 'The Colossus is the Sentinel of the Rime school. The Rime bearers cannot win their mark while it holds the pass.',
        objectives: [{ id: 'colossus', text: 'Defeat the Rimeheart Colossus', kill: 'bx_colossus', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-rime' }, { setFlag: 'story.bearer.rimecaller', value: true }],
        next: 'lance',
      },
      {
        id: 'lance', journal: 'The pass is open, and the snow on the far side hasn’t settled yet. Somebody has already gone over it. Something is standing upright at the top of the road.',
        objectives: [{ id: 'lance', text: 'See what was left at the top of the pass', interact: 'obj:stormlancer-cass-lance' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-colossus'] },
  },
  {
    ...A2, id: 'quest:stormlancer-old-biddy-brings-word', name: 'Old Biddy Brings Word', type: 'class', region: 'vil:brind', giver: OG,
    summary: 'Someone has come through the Storm arch from the Thunderclap Heights with a message from Odran, and is waiting at the Gate Circle.',
    requires: req(done('quest:stormlancer-rimeheart-colossus')), autoStart: true, firstStage: 'word',
    stages: [
      {
        id: 'word', journal: 'Word from the Heights is waiting at the Gate Circle, by the Storm arch.',
        objectives: [{ id: 'word', text: 'Collect Odran’s message at the Gate Circle', when: { flag: 'stormlancer.odran_word' }, marker: { landmark: 'landmark:gate-circle' } }],
        next: 'chord',
      },
      {
        id: 'chord', journal: 'The Eye half is very quiet, the way the Eye was quiet, and something at the Stone Court is crackling towards it.',
        objectives: [{ id: 'court', text: 'Hear the two Storm halves together at the Stone Court', when: { questCompleted: 'quest:cc-stone-court' }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ openDialogue: 'dialogue:stormlancer-eye-and-tower' }],
        next: 'reply',
      },
      {
        id: 'reply', journal: 'Whoever brought Odran’s word is still at the Gate Circle, waiting to carry an answer back up the Copper Road. Slowly.',
        objectives: [{ id: 'reply', text: 'Send Odran an answer from the Gate Circle', when: { flag: 'stormlancer.reply' }, marker: { landmark: 'landmark:gate-circle' } }],
        onComplete: [{ setFlag: 'story.act2_ready', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:stormlancer-the-shield-on-the-pass', name: 'The Shield on the Pass', type: 'side', region: 'region:frost', giver: 'npc:bearer-warden',
    summary: 'The Warden bearer means to hold Frostmere Pass against whatever comes down it while you charge up it. One of you has to go first.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'line',
    stages: [
      {
        id: 'line', journal: 'Aled Holloway has planted a tower shield across the pass road and is waiting for you to agree on the order of things.',
        objectives: [{ id: 'line', text: 'Settle who goes first with the Warden bearer', interact: 'obj:stormlancer-pass-shield-line', marker: { region: 'region:frost' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'It is settled. Aled wants a word at the Stone Court.',
        objectives: [{ id: 'bram', text: 'Talk to the Warden bearer', when: { any: [{ flag: 'stormlancer.bram_thanked' }, { partyHasClass: 'warden' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.warden', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A2, id: 'quest:stormlancer-first-blood', name: 'First Blood', type: 'side', region: 'vil:cliff', giver: 'npc:bearer-swordsman',
    summary: 'The Swordsman bearer has challenged the Stormcrow to a duel on the cliff-top, and won’t hear of help.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'duel',
    stages: [
      {
        id: 'duel', journal: 'Gaspard Lisle has drawn a duelling circle in the turf at the top of the Stormcliffs and is waiting for a bird to step into it.',
        objectives: [{ id: 'ring', text: 'Find the Swordsman bearer’s duelling circle', interact: 'obj:stormlancer-stormcliff-duel-ring', marker: { landmark: 'landmark:cliff-wind-yard' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Nobody got hurt, which Gaspard considers a disgrace. He wants a word at the Stone Court.',
        objectives: [{ id: 'gaspard', text: 'Talk to the Swordsman bearer', when: { any: [{ flag: 'stormlancer.gaspard_thanked' }, { partyHasClass: 'swordsman' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.swordsman', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  // ======================= ACT III: class quests (III-4 + 3 side)
  {
    ...A3, id: 'quest:stormlancer-the-swift-herald', name: 'The Swift Herald', type: 'class', region: 'region:heart', giver: 'npc:casimir',
    summary: 'At the top of the Twelve Stairs a bell rings a moment before anything arrives. Then she arrives: the Hollow King’s Herald, in a robe that streams behind her like a storm’s tail. It is Cass.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'herald',
    stages: [
      { id: 'herald', journal: 'Cass has become the Swift Herald: so fast that nothing will ever catch her, not even an ending.', objectives: [{ id: 'herald', text: 'Face the Swift Herald', kill: 'cb_swift-herald', count: 1, marker: { landmark: 'landmark:twelve-stairs-top' } }], onComplete: [{ openDialogue: 'dialogue:stormlancer-herald-fate' }], next: 'fate' },
      { id: 'fate', journal: 'Cass is down on one knee on the stair, shaking, because she cannot stop.', objectives: [{ id: 'fate', text: 'Decide Cass’s fate', when: { flag: 'stormlancer.nemesis_fate' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 3 },
  },
  {
    ...A3, id: 'quest:stormlancer-ride-second', name: 'Ride Second', type: 'side', region: 'region:heart', giver: OG,
    summary: '“Don’t go first through the last gate. Wait. Bring someone in with you.” Somewhere in the Legion camp is the slowest lancer who ever rode into the Heart.',
    requires: req({ flag: 'stormlancer.odran_word' }, done('quest:heart-legion')), autoStart: true, firstStage: 'last',
    stages: [
      { id: 'last', journal: 'At the very back of the Legion, a long way behind everyone, stands an old lancer with a broken lance.', objectives: [{ id: 'wynn', text: 'Find the last lancer in the Legion camp', talk: 'npc:wynn-tarry', marker: { landmark: 'landmark:legion-camp' } }], next: 'stairs' },
      {
        id: 'stairs', journal: 'Wynn Tarry will climb the Twelve Stairs, if somebody waits for her. She is slow, and the hollowed on the stair are not. Ride second, and keep her alive.',
        onEnter: [{ escort: 'npc:wynn-tarry', to: 'landmark:twelve-stairs-top' }],
        objectives: [{ id: 'top', text: 'Bring Wynn Tarry safely up the Twelve Stairs', when: { any: [{ flag: 'escort.wynn-tarry', op: '==', value: 'arrived' }, { flag: 'escort.wynn-tarry', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:twelve-stairs-top' } }],
        next: [{ when: { flag: 'escort.wynn-tarry', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'top' }],
      },
      {
        id: 'regroup', journal: 'Wynn went down on the stair, and the camp’s bearers carried her back to the Legion’s edge. She says she has been last before, and she can be last again. Start her up again.',
        onEnter: [{ escort: 'npc:wynn-tarry', to: 'landmark:twelve-stairs-top' }],
        objectives: [{ id: 'top', text: 'Try again: bring Wynn up the Twelve Stairs', when: { any: [{ flag: 'escort.wynn-tarry', op: '==', value: 'arrived' }, { flag: 'escort.wynn-tarry', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:twelve-stairs-top' } }],
        next: [{ when: { flag: 'escort.wynn-tarry', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'top' }],
      },
      {
        id: 'top', journal: 'Wynn Tarry is at the top of the Twelve Stairs, leaning on her broken lance, getting her breath.',
        objectives: [{ id: 'wynn', text: 'See Wynn Tarry in at the top of the stairs', talk: 'npc:wynn-tarry', marker: { landmark: 'landmark:twelve-stairs-top' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:stormlancer-thistle', name: 'Thistle', type: 'side', region: 'region:heart', giver: 'npc:thistle-heart',
    summary: 'Thistle has walked all the way from the Thunderclap Heights and into the Heart behind you, at a walk, the whole way. She is standing at the top of the Storm stair.',
    requires: req({ flag: 'stormlancer.nemesis_fate' }), autoStart: true, firstStage: 'tracks',
    stages: [
      {
        id: 'tracks', journal: 'There are ram’s tracks at the edge of the Heart camp, a Storm Ram’s, and they are walking.',
        objectives: [{ id: 'tracks', text: 'Follow the ram’s tracks at the edge of the Heart camp', interact: 'obj:stormlancer-thistle-tracks', marker: { landmark: 'landmark:heart-camp' } }],
        next: 'thistle',
      },
      { id: 'thistle', journal: 'Cass’s ram is waiting at the top of the Storm stair, where the Swift Herald came to a stop.', objectives: [{ id: 'thistle', text: 'Go to Thistle at the top of the Storm stair', talk: 'npc:thistle-heart', marker: { landmark: 'landmark:twelve-stairs-top' } }], next: 'hay' },
      {
        id: 'hay', journal: '“Cass’s ram eats now,” Odran wrote. Thistle has walked hundreds of miles on whatever she found by the road. The supply carts at the Heart camp have hay.',
        objectives: [{ id: 'hay', text: 'Bring Thistle some hay from the camp carts', interact: 'obj:stormlancer-hay-cart', marker: { landmark: 'landmark:heart-camp' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A3, id: 'quest:stormlancer-the-ones-who-came-back-fast', name: 'The Ones Who Came Back Fast', type: 'side', region: 'region:heart', giver: OG,
    summary: 'The lancers who came back hollow and fast from the storm are standing in the Legion camp, twitching to run.',
    requires: req(done('quest:heart-legion')), autoStart: true, firstStage: 'fast',
    stages: [
      { id: 'fast', journal: 'The Legion is making them stand still, and it is the one thing they cannot do.', objectives: [{ id: 'fast', text: 'Bring back the lancers who came back fast', interact: 'obj:stormlancer-fast-ones', marker: { landmark: 'landmark:legion-camp' } }], next: 'walk' },
      {
        id: 'walk', journal: 'They have stopped. Now they can’t start again: they only know flat out, or not at all. Somebody has to teach them to walk.',
        objectives: [{ id: 'walk', text: 'Walk the fast ones out of the Legion', interact: 'obj:stormlancer-walking-line', marker: { landmark: 'landmark:legion-camp' } }],
        next: 'fire',
      },
      {
        id: 'fire', journal: 'They came in at a walk. Lancers sit together after a race, and somebody always asks the same question.',
        objectives: [{ id: 'fire', text: 'Sit with the fast ones at their fire', interact: 'obj:stormlancer-lancers-fire', marker: { landmark: 'landmark:heart-camp' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
];

export default quests;
