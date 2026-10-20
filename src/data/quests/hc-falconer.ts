/**
 * Hollow Crown: the FALCONER campaign (docs/lore/hollow-crown/06-outlines/hunt.md). Act I on the Hawkmoor
 * (area:hunt-frontier) and the Act II class thread in Concordia. Owner: Claude 4.
 */
import type { NarrativeCondition, QuestDef } from '@/core';

const FA: NarrativeCondition = { heroClass: 'falconer' };
const done = (q: `quest:${string}`): NarrativeCondition => ({ questCompleted: q });
const req = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: [FA, ...c] });
const A1 = { act: 'act1' as const, campaign: 'falconer', chapter: 'The Hawkmoor' };
const A2 = { act: 'act2' as const, campaign: 'falconer', chapter: 'Concordia' };
const A3 = { act: 'act3' as const, campaign: 'falconer', chapter: 'The Heart' };
const Z1 = 'zone:hunt-frontier-1' as const, Z2 = 'zone:hunt-frontier-2' as const, Z3 = 'zone:hunt-frontier-3' as const, Z4 = 'zone:hunt-frontier-4' as const;
const L1 = 'inst:hunt-frontier-lair-1' as const, L2 = 'inst:hunt-frontier-lair-2' as const, L3 = 'inst:hunt-frontier-lair-3' as const;
const WR = 'npc:old-wren' as const, TE = 'npc:hooded-man' as const;

const quests: QuestDef[] = [
  // ======================= ACT I: main (I-1 … I-10)
  {
    ...A1, id: 'quest:falconer-the-bell-over-the-moor', name: 'The Bell over the Moor', type: 'main', region: Z1, giver: WR,
    summary: 'In the middle of the night a bell rang over the Hawkmoor, and every bird on the Mews Cliffs took off at once, hooded or not. Yours went with them.',
    requires: FA, autoStart: true, firstStage: 'perches',
    stages: [
      {
        id: 'perches', journal: 'Ten thousand wings in the dark, all flying the same way: towards the Moor’s Crown, the highest hill on the moor. Your hawk is somewhere among them.',
        onEnter: [{ openDialogue: 'dialogue:falconer-bell-night' }],
        objectives: [{ id: 'perches', text: 'Go up to the cliff perches', reach: 'landmark:mews-cliff-perches', marker: { landmark: 'landmark:mews-cliff-perches' } }],
        next: 'lure',
      },
      {
        id: 'lure', journal: 'The perches are empty. Swing the lure and call your hawk home.',
        objectives: [{ id: 'lure', text: 'Call your hawk back with the lure at the cliff perches', interact: 'obj:mews-lure-post', marker: { landmark: 'landmark:mews-cliff-perches' } }],
        next: 'wren',
      },
      {
        id: 'wren', journal: 'Your hawk came back with something caught in its feathers: a sound. Up on her ledge, Old Wren, who taught you to fly your first bird, is laughing.',
        objectives: [{ id: 'wren', text: 'Go up to Old Wren’s ledge', talk: WR, marker: { landmark: 'landmark:wren-ledge' } }],
        onComplete: [{ setFlag: 'falconer.bell_heard', value: true }],
        next: 'clifftop',
      },
      {
        id: 'clifftop', journal: 'Wren wants you to climb to the top of the cliff stair and see where ten thousand birds went in the dark.',
        objectives: [{ id: 'top', text: 'Climb the cliff stair to the top of the Mews Cliffs', reach: 'landmark:falconer-cliff-top', marker: { landmark: 'landmark:falconer-cliff-top' } }],
        onComplete: [{ openDialogue: 'dialogue:falconer-cliff-top' }, { startQuest: 'quest:falconer-the-falling-birds' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-greywilds', 'lore:hc-the-mews'] },
  },
  {
    ...A1, id: 'quest:falconer-the-falling-birds', name: 'The Falling Birds', type: 'main', region: Z2, giver: WR,
    summary: 'Wren wants the wild hawks of the Hawkmoor counted, from the three high tors where the Mews has counted them for a thousand years.',
    requires: req(done('quest:falconer-the-bell-over-the-moor')), firstStage: 'count',
    stages: [
      {
        id: 'count', journal: 'Three tors, three counts. Send the hawk up from each and count what rises with it.',
        objectives: [{ id: 'tors', text: 'Count the wild hawks from the three tors on the Hawkmoor', interact: 'obj:hawkmoor-tor-*', count: 3, marker: { place: Z2 } }],
        next: 'fallen',
      },
      {
        id: 'fallen', journal: 'Half the wild hawks are gone. The rest are dropping out of the sky with black tears on their wings, and getting up again wrong.',
        objectives: [{ id: 'hawks', text: 'Deal with the hollowed Hunting Hawks', kill: 'bx_hunt_1', count: 4, marker: { place: Z2 } }],
        next: 'trail',
      },
      {
        id: 'trail', journal: 'Wren will want to know where they fell, not just how many. Follow the line of fallen feathers down off the moor, towards the Featherfall.',
        objectives: [{ id: 'feathers', text: 'Follow the fallen feathers towards the Featherfall', interact: 'obj:falconer-fall-feather-*', count: 3, marker: { place: Z4 } }],
        next: 'report',
      },
      {
        id: 'report', journal: 'Every hollowed bird fell the same way, towards the valley the Mews calls the Featherfall.',
        objectives: [{ id: 'wren', text: 'Tell Wren what you counted', talk: WR, marker: { landmark: 'landmark:wren-ledge' } }],
        onComplete: [{ startQuest: 'quest:falconer-the-bear-cave' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40, lore: ['lore:hc-hawkmoor'] },
  },
  {
    ...A1, id: 'quest:falconer-the-bear-cave', name: 'The Bear Cave', type: 'main', region: Z2, giver: WR,
    summary: 'The Alpha Bear has come down off the moor to raid the Mews’ hen-runs and the shepherds’ folds. Its eyes run black, and it cannot stop eating.',
    requires: req(done('quest:falconer-the-falling-birds')), firstStage: 'run',
    stages: [
      {
        id: 'run', journal: 'The Mews’ hen-run was torn open last night. Feathers everywhere, and tracks the size of dinner plates.',
        objectives: [{ id: 'run', text: 'Look at the raided hen-run', interact: 'obj:mews-hen-run', marker: { place: Z1 } }],
        next: 'fold',
      },
      {
        id: 'fold', journal: 'The bear’s tracks go out across the Hawkmoor, past Shepherd Coyle’s steading. Coyle was up at dawn. He will have seen which way it went.',
        objectives: [{ id: 'coyle', text: 'Ask Shepherd Coyle which way the bear went', talk: 'npc:amos-coyle', marker: { landmark: 'landmark:coyle-steading' } }],
        next: 'cave',
      },
      {
        id: 'cave', journal: 'The tracks lead out onto the Hawkmoor, to a cave under a tor.',
        objectives: [{ id: 'cave', text: 'Find the Bear Cave', reach: L1, marker: { landmark: 'landmark:bear-cave-mouth' } }],
        next: 'bear',
      },
      {
        id: 'bear', journal: 'It eats whatever it can reach and heals as it eats. Send the hawk to steal the food first, and strike its flanks.',
        objectives: [{ id: 'bear', text: 'Defeat the Alpha Bear', kill: 'bx_hunt_3', count: 1 }],
        next: 'report',
      },
      {
        id: 'report', journal: 'The Alpha Bear will raid no more folds.',
        objectives: [{ id: 'wren', text: 'Tell Wren the bear is down', talk: WR, marker: { landmark: 'landmark:wren-ledge' } }],
        onComplete: [{ setFlag: 'falconer.bear_down', value: true }, { startQuest: 'quest:falconer-the-gentle-stranger' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 80, hcItems: [{ item: 'i_hide', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:falconer-the-gentle-stranger', name: 'The Gentle Stranger', type: 'main', region: Z1, giver: TE,
    summary: 'A stranger in a soft leather hood has walked into the Mews Cliffs with a panicking falcon on his fist. He hooded it, and it settled. Now he is going round the cliffs hooding every frightened bird.',
    requires: req(done('quest:falconer-the-bear-cave')), firstStage: 'stranger',
    stages: [
      {
        id: 'stranger', journal: 'The Mews has given the stranger supper on the perches. Everyone is very grateful to him, and very quiet.',
        objectives: [{ id: 'stranger', text: 'Meet the hooded stranger on the perches', talk: TE, marker: { landmark: 'landmark:mews-cliff-perches' } }],
        next: 'perches',
      },
      {
        id: 'perches', journal: 'He has hooded a dozen birds along the perches since supper. Before you go up to Wren, look at them properly.',
        objectives: [{ id: 'birds', text: 'Look at the birds the stranger hooded', interact: 'obj:falconer-hooded-bird-*', count: 3, marker: { landmark: 'landmark:mews-cliff-perches' } }],
        next: 'wren',
      },
      {
        id: 'wren', journal: 'Wren watched the whole thing through Pibb’s eyes from her ledge, and did not come down.',
        objectives: [{ id: 'wren', text: 'Go up to Wren’s ledge', talk: WR, marker: { landmark: 'landmark:wren-ledge' } }],
        onComplete: [{ setFlag: 'falconer.hooded_man_met', value: true }, { startQuest: 'quest:falconer-the-hooding' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-hooding'] },
  },
  {
    ...A1, id: 'quest:falconer-the-hooding', name: 'The Hooding', type: 'main', region: Z1, giver: 'npc:agatha-spurling',
    summary: 'The Mews votes tonight. The Hooded Man would hood every bird on the cliffs until the tears pass. The Great Lodge’s envoy wants the Mews’ hawks for Antlerford, to hunt the hollow herd.',
    requires: req(done('quest:falconer-the-gentle-stranger')), firstStage: 'canvass',
    stages: [
      {
        id: 'canvass', journal: 'Wren said: before you speak, hear the two people who would carry the cost. The Lodge’s envoy, who wants the hawks, and Swithun Jessop, whose post-hawks are already hooded.',
        objectives: [
          { id: 'hamo', text: 'Hear Hamo Pickering out', talk: 'npc:hamo-pickering', marker: { landmark: 'landmark:mews-cliff-perches' } },
          { id: 'swithun', text: 'Hear Swithun Jessop out', talk: 'npc:swithun-jessop', marker: { landmark: 'landmark:mews-post-loft' } },
        ],
        next: 'vote',
      },
      {
        id: 'vote', journal: 'The whole Mews is on the perches, every falconer with a bird on their fist. Mews-Mother Spurling will hear you first.',
        objectives: [{ id: 'vote', text: 'Speak at the Mews vote', when: { flag: 'falconer.hooding' }, marker: { landmark: 'landmark:mews-cliff-perches' } }],
        next: [
          { when: { flag: 'falconer.hooding', value: 'free' }, to: 'free' },
          { to: 'after' },
        ],
      },
      {
        id: 'free', journal: 'Every jess on the cliffs is being cut. Go along the perches and slip the last birds free.',
        objectives: [{ id: 'perches', text: 'Fly the last Mews birds free', interact: 'obj:mews-free-perch-*', count: 3, marker: { landmark: 'landmark:mews-cliff-perches' } }],
        next: 'after',
      },
      {
        id: 'after', journal: 'Whatever the Mews decided, something in the Featherfall is calling every bird on the moor.',
        objectives: [],
        onComplete: [{ startQuest: 'quest:falconer-grandmother-talon' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A1, id: 'quest:falconer-grandmother-talon', name: 'Grandmother Talon', type: 'main', region: Z4, giver: WR,
    summary: 'The birds of the Hawkmoor are being pulled towards the Hollow Eyrie, above the Featherfall. Grandmother Talon, eldest of the great hawks, is calling every one of them home.',
    requires: req(done('quest:falconer-the-hooding')), firstStage: 'elias',
    stages: [
      {
        id: 'elias', journal: 'Old Elias Downe has watched every bird on the moor go past his cairn towards the Hollow Eyrie. He will know the way up the cliff.',
        objectives: [{ id: 'elias', text: 'Ask Elias Downe the way up to the Eyrie', talk: 'npc:elias-downe', marker: { landmark: 'landmark:feather-counter-cairn' } }],
        next: 'eyrie',
      },
      {
        id: 'eyrie', journal: 'Climb to the Hollow Eyrie on the cliff above the Featherfall. Your hawk does not want to go. It goes anyway.',
        objectives: [{ id: 'enter', text: 'Climb to the Hollow Eyrie', reach: L2, marker: { landmark: 'landmark:hollow-eyrie-cliff' } }],
        onComplete: [{ openDialogue: 'dialogue:falconer-eyrie-call' }],
        next: 'talon',
      },
      {
        id: 'talon', journal: 'A hood of black tears covers Grandmother Talon’s eyes, so she dives at sound. Send your hawk to tear it away.',
        objectives: [{ id: 'talon', text: 'Free Grandmother Talon', kill: 'cb_grandmother-talon', count: 1 }],
        next: 'nest',
      },
      {
        id: 'nest', journal: 'She can see again, and she has stopped. Her nest is lined with something that is not twigs.',
        objectives: [{ id: 'nest', text: 'Look in Grandmother Talon’s nest', interact: 'obj:hollow-eyrie-nest' }],
        onComplete: [{ setFlag: 'falconer.talon_freed', value: true }, { startQuest: 'quest:falconer-what-the-hood-holds' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 120 },
  },
  {
    ...A1, id: 'quest:falconer-what-the-hood-holds', name: 'What the Hood Holds', type: 'main', region: Z3, giver: WR,
    summary: 'On the Windscour Plain whole steadings sit calm and quiet in their doorways, hooded in black tears. The stranger has been out there, being kind.',
    requires: req(done('quest:falconer-grandmother-talon')), firstStage: 'steadings',
    stages: [
      {
        id: 'steadings', journal: 'Three steadings on the plain. Every door open, every family sitting on the step, smiling at nothing, with a soft black hood over their eyes.',
        objectives: [{ id: 'steadings', text: 'Visit the hooded steadings', interact: 'obj:hooded-steading-*', count: 3, marker: { place: Z3 } }],
        next: 'teodor',
      },
      {
        id: 'teodor', journal: 'The hooded stranger is sitting on the doorstep of the Pollards’ steading, with a hawk on his fist and a family asleep around him.',
        objectives: [{ id: 'teodor', text: 'Confront the Hooded Man', talk: TE, marker: { landmark: 'landmark:quiet-steading' } }],
        next: 'wren',
      },
      {
        id: 'wren', journal: 'He knew your hawk’s name. He knew Wren’s.',
        objectives: [{ id: 'wren', text: 'Ask Wren who he is', talk: WR, marker: { landmark: 'landmark:wren-ledge' } }],
        onComplete: [{ setFlag: 'falconer.teodor_turned', value: true }],
        next: 'bunk',
      },
      {
        id: 'bunk', journal: 'Teodor’s bunk is still in the old mews at the foot of the cliff, just as he left it in C. 1030. Wren never had the heart to clear it.',
        objectives: [{ id: 'bunk', text: 'Look at Teodor’s bunk in the old mews', interact: 'obj:falconer-teodor-bunk', marker: { landmark: 'landmark:wren-ledge' } }],
        onComplete: [{ startQuest: 'quest:falconer-the-moors-crown' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-hooded-man'] },
  },
  {
    ...A1, id: 'quest:falconer-the-moors-crown', name: 'The Moor’s Crown', type: 'main', region: L3, giver: WR,
    summary: 'The Moor half of the Hunt stone lies in the stone ring on the Moor’s Crown, the highest hill on the Hawkmoor. Teodor is already there, with every hooded bird on the moor.',
    requires: req(done('quest:falconer-what-the-hood-holds')), firstStage: 'climb',
    stages: [
      {
        id: 'climb', journal: 'Up to the stone ring on the Moor’s Crown. The air is thick with hooded birds that do not flinch and do not cry.',
        objectives: [{ id: 'enter', text: 'Climb to the Moor’s Crown', reach: L3, marker: { place: Z3 } }],
        next: 'teodor',
      },
      {
        id: 'teodor', journal: 'He drapes the ring in calm. Break the hood on each standing stone. If he hoods your hawk, call it back without a lure.',
        objectives: [{ id: 'teodor', text: 'Defeat the Hooded Man', kill: 'cb_the-hooded-man', count: 1 }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'A cloud of hooded birds lifted Teodor off the hill and carried him away towards the Antler Gate. In the middle of the ring, half a crystal is singing.',
        objectives: [{ id: 'stone', text: 'Take the Moor half', interact: 'obj:hunt-frontier-halfstone' }],
        onComplete: [{ setFlag: 'falconer.halfstone', value: true }, { startQuest: 'quest:falconer-cut-jesses' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, skillPoints: 1, lore: ['lore:hc-half-stones'] },
  },
  {
    ...A1, id: 'quest:falconer-cut-jesses', name: 'Cut Jesses', type: 'main', region: Z1, giver: WR,
    summary: 'Teodor has been carried to the Antler Gate, and the half-stone in your hand can open it. Old Wren wants to see you before you go.',
    requires: req(done('quest:falconer-the-moors-crown')), firstStage: 'wren',
    stages: [
      {
        id: 'wren', journal: 'Wren is on her ledge with Pibb on her shoulder, looking at nothing, seeing everything.',
        objectives: [{ id: 'wren', text: 'Say goodbye to Old Wren', talk: WR, marker: { landmark: 'landmark:wren-ledge' } }],
        next: 'post',
      },
      {
        id: 'post', journal: 'Halfway down the gate road stands the Leaving Post, where every falconer who leaves the Mews ties one cut jess.',
        objectives: [{ id: 'post', text: 'Tie a jess to the Leaving Post', interact: 'obj:falconer-leaving-post', marker: { landmark: 'landmark:falconer-leaving-post' } }],
        next: 'road',
      },
      {
        id: 'road', journal: 'The gate road runs down off the moor to the Antler Gate.',
        objectives: [{ id: 'gate', text: 'Take the gate road to the Antler Gate', reach: 'area:hunt-gate', marker: { place: 'area:hunt-gate' } }],
        onComplete: [{ startQuest: 'quest:falconer-the-antler-gate' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:falconer-the-antler-gate', name: 'The Antler Gate (Hawkmoor side)', type: 'main', region: 'area:hunt-gate', giver: WR,
    summary: 'The Great Hunt is running blind round the Antler Gate under a hood of black tears that Teodor drew over its eyes.',
    requires: req(done('quest:falconer-cut-jesses')), firstStage: 'hunt',
    stages: [
      {
        id: 'hunt', journal: 'Hold the high paths above the gate and keep the hollow herd off. Send your hawk at the hood, pass after pass, until it falls.',
        objectives: [{ id: 'hunt', text: 'Strike the hood from the Great Hunt', kill: 'bx_hunt_5', count: 1 }],
        next: 'gate',
      },
      {
        id: 'gate', journal: 'The hood fell. The Great Hunt looked up at the sky, and slowed, and walked away north. The Antler Gate is weeping.',
        objectives: [{ id: 'seal', text: 'Open the Antler Gate with the Moor half', interact: 'obj:hunt-gate-seal' }],
        onComplete: [{ setFlag: 'story.gate_open', value: true }, { setFlag: 'story.act', value: 2 }, { setFlag: 'falconer.act1_done', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 200, lore: ['lore:hc-realm-gates', 'lore:hc-great-hunt'] },
  },

  // ======================= ACT I: side quests (2 per zone)
  {
    ...A1, id: 'quest:falconer-pibb-wont-come-down', name: 'Pibb Won’t Come Down', type: 'side', region: Z1, giver: WR,
    summary: 'Pibb has taken against the new perch-ledge and is sulking on the chapel roof. Wren sees through Pibb’s eyes, so until he comes down she is blind, and furious.',
    requires: req(done('quest:falconer-the-bell-over-the-moor')), firstStage: 'coax',
    stages: [
      {
        id: 'coax', journal: 'Pibb is on the ridge of the Mews chapel roof with his back to the world.',
        objectives: [{ id: 'coax', text: 'Coax Pibb down off the chapel roof', when: { flag: 'falconer.pibb_down' }, marker: { landmark: 'landmark:mews-chapel-roof' } }],
        next: 'wren',
      },
      {
        id: 'wren', journal: 'Pibb is back on Wren’s shoulder, pretending none of it happened.',
        objectives: [{ id: 'wren', text: 'Go back to Wren', talk: WR, marker: { landmark: 'landmark:wren-ledge' } }],
        next: 'perch',
      },
      {
        id: 'perch', journal: 'Wren says Pibb sulked because of the wood. Pibb, on her shoulder, is not looking at the wood. He is glaring past the new perch-ledge at something out over the moor.',
        objectives: [{ id: 'perch', text: 'Find out what is wrong with the new perch-ledge', interact: 'obj:falconer-new-perch', marker: { landmark: 'landmark:wren-ledge' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 30 },
  },
  {
    ...A1, id: 'quest:falconer-the-jess-makers-knots', name: 'The Jess-Maker’s Knots', type: 'side', region: Z1, giver: 'npc:odile-thistlewood',
    summary: 'Odile Thistlewood ties a different knot for every bird on the cliffs, and her hands have started to shake. She wants someone to learn the knots before she forgets them.',
    requires: req(done('quest:falconer-the-bell-over-the-moor')), firstStage: 'knots',
    stages: [
      {
        id: 'knots', journal: 'Three knots on Odile’s practice board: the falcon’s, the hawk’s, and one she won’t name until you’ve tied the other two.',
        objectives: [{ id: 'knots', text: 'Tie the knots on Odile’s board', interact: 'obj:jess-knot-*', count: 3, marker: { landmark: 'landmark:jess-maker-hut' } }],
        next: 'odile',
      },
      {
        id: 'odile', journal: 'The third knot holds a bird fast, and lets it go when it truly pulls.',
        objectives: [{ id: 'odile', text: 'Show Odile the third knot', talk: 'npc:odile-thistlewood', marker: { landmark: 'landmark:jess-maker-hut' } }],
        onComplete: [{ setFlag: 'falconer.odile_knot', value: true }],
        next: 'hawk',
      },
      {
        id: 'hawk', journal: 'Odile says the falconer’s knot works on anything that is holding something it oughtn’t. Swithun Jessop’s post-hawks are sitting hooded in his loft. Try it on one.',
        objectives: [{ id: 'hawk', text: 'Tie the falconer’s knot on a hooded post-hawk', interact: 'obj:falconer-post-hawk', marker: { landmark: 'landmark:mews-post-loft' } }],
        onComplete: [{ setFlag: 'falconer.knot_tested', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_rope' }] },
  },
  {
    ...A1, id: 'quest:falconer-shepherd-coyles-dog', name: 'Shepherd Coyle’s Dog', type: 'side', region: Z2, giver: 'npc:amos-coyle',
    summary: 'Shepherd Amos Coyle’s sheepdog has started herding hawks instead of sheep, and the hawks have started letting her.',
    requires: req(done('quest:falconer-the-falling-birds')), firstStage: 'fold',
    stages: [
      {
        id: 'fold', journal: 'Coyle’s fold is full of hawks, standing in a neat bunch, being herded. The sheep are watching from the hill.',
        objectives: [{ id: 'fold', text: 'Look in Coyle’s fold', interact: 'obj:coyle-fold', marker: { landmark: 'landmark:coyle-steading' } }],
        next: 'coyle',
      },
      {
        id: 'coyle', journal: 'You have a fair idea why the hawks are letting her.',
        objectives: [{ id: 'coyle', text: 'Sort it out with Shepherd Coyle', when: { flag: 'falconer.coyle_sorted' }, marker: { landmark: 'landmark:coyle-steading' } }],
        next: 'tor',
      },
      {
        id: 'tor', journal: 'Wimble goes up the tor behind the steading every evening and stands there barking at nothing. Coyle would like to know what nothing is.',
        objectives: [{ id: 'tor', text: 'Follow Wimble up the tor', interact: 'obj:falconer-wimble-tor', marker: { place: Z2 } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_cheese', qty: 3 }] },
  },
  {
    ...A1, id: 'quest:falconer-the-moorland-post', name: 'The Moorland Post', type: 'side', region: Z2, giver: 'npc:swithun-jessop',
    summary: 'The moor steadings get their post by hawk, and Swithun Jessop’s post-hawks have all been hooded. Somebody has to fly the round.',
    requires: req(done('quest:falconer-the-falling-birds')), firstStage: 'round',
    stages: [
      {
        id: 'round', journal: 'Three post-boxes on three steadings. Fly a letter to each.',
        objectives: [{ id: 'boxes', text: 'Fly the post to the moor steadings', interact: 'obj:moor-post-box-*', count: 3, marker: { place: Z2 } }],
        next: 'unsent',
      },
      {
        id: 'unsent', journal: 'Swithun says there is one letter left in the dead-letter bag, and it has been there twelve years.',
        objectives: [{ id: 'letter', text: 'Look at the oldest letter in the dead-letter bag', interact: 'obj:mews-dead-letter', marker: { landmark: 'landmark:mews-post-loft' } }],
        next: 'swithun',
      },
      {
        id: 'swithun', journal: 'It is from Wren, to someone called Teodor, dated C. 1030. It was never sent, because nobody knew where he had gone.',
        objectives: [{ id: 'swithun', text: 'Talk to Swithun about the letter', talk: 'npc:swithun-jessop', marker: { landmark: 'landmark:mews-post-loft' } }],
        onComplete: [{ setFlag: 'falconer.wren_letter_read', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 60 },
  },
  {
    ...A1, id: 'quest:falconer-bones-of-the-herd', name: 'Bones of the Herd', type: 'side', region: Z3, giver: 'npc:ma-ketterick',
    summary: 'Ma Ketterick reads the old herd bones on the Windscour Plain the way other people read letters. She says the bones have been trying to tell her something for thirty years.',
    requires: req(done('quest:falconer-the-falling-birds')), firstStage: 'bones',
    stages: [
      {
        id: 'bones', journal: 'Three great drifts of elk bones on the plain, white as chalk. Ma Ketterick wants to know which way each one is facing.',
        objectives: [{ id: 'bones', text: 'Read the herd bones on the plain', interact: 'obj:herd-bones-*', count: 3, marker: { place: Z3 } }],
        next: 'ma',
      },
      {
        id: 'ma', journal: 'Every skeleton on the plain is facing the same way. Every one of them died running.',
        objectives: [{ id: 'ma', text: 'Tell Ma Ketterick which way they face', talk: 'npc:ma-ketterick', marker: { landmark: 'landmark:ketterick-camp' } }],
        next: 'turned',
      },
      {
        id: 'turned', journal: 'Every skull on the plain faces the gate but one. Ma Ketterick says one small set of bones at the far edge is facing home, and she wants to know who turned back.',
        objectives: [{ id: 'turned', text: 'Find the bones that face home', interact: 'obj:falconer-turned-bones', marker: { place: Z3 } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-herd-bones'] },
  },
  {
    ...A1, id: 'quest:falconer-the-quiet-steading', name: 'The Quiet Steading', type: 'side', region: Z3, giver: 'npc:edwy-pollard',
    summary: 'A family sits hooded and content on their doorstep on the Windscour Plain. Their boy, Edwy, wasn’t hooded. He wants you to wake his mother.',
    requires: req(done('quest:falconer-the-falling-birds')), firstStage: 'mother',
    stages: [
      {
        id: 'mother', journal: 'Aldith Pollard is sitting on her doorstep with her hands in her lap and a soft black hood over her eyes.',
        objectives: [{ id: 'mother', text: 'Try to wake Edwy’s mother', interact: 'obj:pollard-doorstep', marker: { landmark: 'landmark:quiet-steading' } }],
        next: 'promise',
      },
      {
        id: 'promise', journal: 'The hood will not come off. Not yet. Edwy is waiting to hear what you say.',
        objectives: [{ id: 'edwy', text: 'Talk to Edwy', talk: 'npc:edwy-pollard', marker: { landmark: 'landmark:quiet-steading' } }],
        next: 'wait',
      },
      {
        id: 'wait', journal: 'You promised. Whoever made the hood can take it off, or be made to.',
        objectives: [{ id: 'wait', text: 'Keep your promise to Edwy', when: { flag: 'falconer.halfstone' } }],
        next: 'wake',
      },
      {
        id: 'wake', journal: 'The hoods on the plain have fallen. Edwy will want to know.',
        objectives: [{ id: 'edwy', text: 'Find Edwy Pollard', talk: 'npc:edwy-pollard', marker: { landmark: 'landmark:quiet-steading' } }],
        onComplete: [{ setFlag: 'falconer.edwy_mother', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50 },
  },
  {
    ...A1, id: 'quest:falconer-the-feather-counter', name: 'The Feather-Counter', type: 'side', region: Z4, giver: 'npc:elias-downe',
    summary: 'Old Elias Downe counts and names every bird that falls in the Featherfall, and has done for thirty years. He could use a pair of younger knees for a day.',
    requires: req(done('quest:falconer-the-falling-birds')), firstStage: 'count',
    stages: [
      {
        id: 'count', journal: 'Three fallen birds since this morning. Find them, and bring Elias their names.',
        objectives: [{ id: 'birds', text: 'Find the birds that fell today', interact: 'obj:featherfall-bird-*', count: 3, marker: { place: Z4 } }],
        next: 'elias',
      },
      {
        id: 'elias', journal: 'The third bird had a ring on its leg, an old brass ring stamped CLIFFSTAIR.',
        objectives: [{ id: 'elias', text: 'Bring Elias the names, and the ring', talk: 'npc:elias-downe', marker: { landmark: 'landmark:feather-counter-cairn' } }],
        next: 'ring',
      },
      {
        id: 'ring', journal: 'The Mews has rung its birds for a thousand years, and Swithun Jessop keeps the ring-book. Elias wants to know who Wanderer was.',
        objectives: [{ id: 'swithun', text: 'Look the ring up in Swithun’s ring-book', talk: 'npc:swithun-jessop', marker: { landmark: 'landmark:mews-post-loft' } }],
        onComplete: [{ setFlag: 'falconer.wanderer_home', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_feather' }] },
  },
  {
    ...A1, id: 'quest:falconer-fledglings', name: 'Fledglings', type: 'side', region: Z4, giver: 'npc:elias-downe',
    summary: 'There is a nest of fledgling hawks in the Featherfall without a single black tear among them, and their mother has gone. Elias has been feeding them on worms and good intentions.',
    requires: req(done('quest:falconer-the-falling-birds')), firstStage: 'nest',
    stages: [
      {
        id: 'nest', journal: 'The nest is in a thorn tree at the bottom of the Featherfall. Four of them, all beak.',
        objectives: [{ id: 'nest', text: 'Find the fledglings’ nest', interact: 'obj:falconer-fledgling-nest', marker: { place: Z4 } }],
        next: 'raise',
      },
      {
        id: 'raise', journal: 'Raise them without hoods. Three lessons on three perches: to sit, to look, and to go.',
        objectives: [{ id: 'perches', text: 'Teach the fledglings on the Featherfall perches', interact: 'obj:fledgling-perch-*', count: 3, marker: { place: Z4 } }],
        onComplete: [{ setFlag: 'falconer.fledglings', value: true }],
        next: 'names',
      },
      {
        id: 'names', journal: 'They fly. Elias Downe has named eleven thousand birds in thirty years, and every one of them was dead. These four are not.',
        objectives: [{ id: 'elias', text: 'Tell Elias the fledglings have flown', talk: 'npc:elias-downe', marker: { landmark: 'landmark:feather-counter-cairn' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },

  // ======================= ACT I: mentor thread (2) and bounties (2)
  {
    ...A1, id: 'quest:falconer-pibbs-eyes', name: 'Pibb’s Eyes', type: 'side', region: Z1, giver: WR,
    summary: 'Wren has seen through Pibb’s eyes for twenty years. She thinks it is time you did, once, before she can’t lend them any more.',
    requires: req({ trust: WR, value: 'friendly' }, done('quest:falconer-the-falling-birds')), firstStage: 'fly',
    stages: [
      {
        id: 'fly', journal: 'Close your eyes on Wren’s ledge and open them in the sky. Three passes over the Hawkmoor, as a kestrel.',
        objectives: [{ id: 'fly', text: 'Fly the Hawkmoor through Pibb’s eyes', interact: 'obj:pibb-flight-*', count: 3, marker: { landmark: 'landmark:wren-ledge' } }],
        next: 'wren',
      },
      {
        id: 'wren', journal: 'You are back on the ledge with your own eyes and a headache. Wren is smiling.',
        objectives: [{ id: 'wren', text: 'Tell Wren what you saw', talk: WR, marker: { landmark: 'landmark:wren-ledge' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, skillPoints: 1 },
  },
  {
    ...A1, id: 'quest:falconer-the-first-hood', name: 'The First Hood', type: 'side', region: Z1, giver: WR,
    summary: 'Wren kept the first hood she ever made. She put it on Teodor’s first bird, when he was a frightened boy, and he never quite took it off again.',
    requires: req({ trust: WR, value: 'trusted' }, done('quest:falconer-what-the-hood-holds')), firstStage: 'hood',
    stages: [
      {
        id: 'hood', journal: 'The old mews, at the bottom of the cliff, where Wren trained her first apprentices. The hood is on a nail by the door.',
        objectives: [{ id: 'hood', text: 'Find Wren’s first hood in the old mews', interact: 'obj:wren-first-hood', marker: { landmark: 'landmark:wren-ledge' } }],
        next: 'burn',
      },
      {
        id: 'burn', journal: 'A tiny hood of red leather, cracked with age. Wren wants it burned, and she wants you there.',
        objectives: [{ id: 'wren', text: 'Burn the first hood with Wren', talk: WR, marker: { landmark: 'landmark:wren-ledge' } }],
        onComplete: [{ setFlag: 'falconer.wren_devotable', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:falconer-bounty-featherfall-cast', name: 'Bounty: the Featherfall Cast', type: 'bounty', region: Z4, giver: 'npc:swithun-jessop',
    summary: 'A cast of hollowed Hunting Hawks has taken the Featherfall and drops on anything that walks through it.',
    requires: req(done('quest:falconer-the-falling-birds')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'They hunt as a cast, five at once, and they never flinch.', objectives: [{ id: 'hawks', text: 'Defeat the Featherfall cast', kill: 'bx_hunt_1', count: 5, marker: { place: Z4 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 150 },
  },
  {
    ...A1, id: 'quest:falconer-bounty-tick-hill', name: 'Bounty: Tick Hill', type: 'bounty', region: Z3, giver: 'npc:swithun-jessop',
    summary: 'Two separate shepherds have reported a new hill on the Windscour Plain. It moves. It is a Giant Tick.',
    requires: req(done('quest:falconer-the-falling-birds')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'It is grey, and round, and grazing.', objectives: [{ id: 'tick', text: 'Defeat the tick that is not a hill', kill: 'bx_hunt_2', count: 1, marker: { place: Z3 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 120 },
  },

  // ======================= ACT II: the class thread (C-1 … C-6) + featured bearers
  {
    ...A2, id: 'quest:falconer-the-cormorant-boats', name: 'The Cormorant Boats', type: 'class', region: 'vil:shore', giver: 'npc:prudence-gannet',
    summary: 'Tamsin Reed says a few Hawkmoor folk fish the Wend from under her ferry with cormorants, and have done since the arches shut.',
    requires: req(done('quest:cc-through-the-arch')), autoStart: true, firstStage: 'boats',
    stages: [
      {
        id: 'boats', journal: 'Under the ferry at Abbeyshore, three flat boats, each with a line of black birds along the gunwale.',
        objectives: [{ id: 'prudence', text: 'Find the cormorant fishers under Tamsin’s ferry', talk: 'npc:prudence-gannet', marker: { landmark: 'landmark:shore-ferry-house' } }],
        next: 'perches',
      },
      {
        id: 'perches', journal: 'Along the mud-bank below the ferry the Hawkmoor exiles have built their birds a row of perches out of old oars, the Mews way. Prudence says to look at the rings.',
        objectives: [{ id: 'perches', text: 'Look at the cormorant perches on the mud-bank', interact: 'obj:falconer-cormorant-perches', marker: { landmark: 'landmark:falconer-cormorant-bank' } }],
        onComplete: [{ startQuest: 'quest:falconer-the-silent-canopy' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-hunt-cormorant-fishers'] },
  },
  {
    ...A2, id: 'quest:falconer-the-silent-canopy', name: 'The Silent Canopy', type: 'class', region: 'region:gloam', giver: 'npc:prudence-gannet',
    summary: 'No bird will fly over the deep Gloamwood. Where nothing sings, Prudence says, the White Stag has wept.',
    requires: req(done('quest:falconer-the-cormorant-boats')), firstStage: 'fly',
    stages: [
      {
        id: 'fly', journal: 'Send your hawk up from three places on the Gloamwood edge, and follow the silence.',
        objectives: [{ id: 'fly', text: 'Fly the hawk over the Gloamwood', interact: 'obj:falconer-silent-canopy-*', count: 3, marker: { region: 'region:gloam' } }],
        next: 'nest',
      },
      {
        id: 'nest', journal: 'At the edge of the silent road through the trees, low in a holly, there is a nest that has been left. Nothing leaves a nest in spring without a reason.',
        objectives: [{ id: 'nest', text: 'Look at the abandoned nest at the edge of the silence', interact: 'obj:falconer-silent-nest', marker: { landmark: 'landmark:falconer-silent-holly' } }],
        next: 'deep',
      },
      {
        id: 'deep', journal: 'All three silences point to the same place: a hollow past the Stag’s glade where the trees close over.',
        objectives: [{ id: 'lair', text: 'Follow the silence into the deep glade', reach: 'inst:sentinel-hunt', marker: { landmark: 'landmark:gloam-stag-glade' } }],
        onComplete: [{ startQuest: 'quest:falconer-the-white-stag' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:falconer-the-white-stag', name: 'The White Stag', type: 'class', region: 'region:gloam', giver: 'npc:prudence-gannet',
    summary: 'The White Stag walked ahead of the crown through the Gloamwood every Turning for a thousand years. It is frightened now, and weeping.',
    requires: req(done('quest:falconer-the-silent-canopy')), firstStage: 'fight',
    stages: [
      {
        id: 'fight', journal: 'The White Stag is the Sentinel of the Hunt school. Win its mark.',
        objectives: [{ id: 'stag', text: 'Bring down the White Stag', kill: 'bx_stag', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-hunt' }],
        next: 'release',
      },
      {
        id: 'release', journal: 'It knelt in the moss and looked at you, and at the sky.',
        objectives: [{ id: 'mark', text: 'Stay with the White Stag', when: { flag: 'story.sentinel.hunt' } }],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'The birds are singing over the Gloamwood again. Down at the ferry, Prudence’s cormorants will know before she does. Tell her anyway.',
        objectives: [{ id: 'prudence', text: 'Tell Prudence the White Stag is at rest', talk: 'npc:prudence-gannet', marker: { landmark: 'landmark:shore-ferry-house' } }],
        onComplete: [{ startQuest: 'quest:falconer-the-hooded-crow' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-stag'] },
  },
  {
    ...A2, id: 'quest:falconer-the-hooded-crow', name: 'The Hooded Crow', type: 'class', region: 'vil:cliff', giver: 'npc:bartle-crisp',
    summary: 'The Stormcrow has stopped screaming, all at once, and the whole of Cliffstair has noticed. Somebody has been seen climbing the cliffs with a hood big enough for a cart.',
    requires: req(done('quest:falconer-the-white-stag')), firstStage: 'bartle',
    stages: [
      {
        id: 'bartle', journal: 'Bartle Crisp keeps the Lightning Jar at Cliffstair, and he sold the stranger his supper.',
        objectives: [{ id: 'bartle', text: 'Ask at the Lightning Jar in Cliffstair', talk: 'npc:bartle-crisp', marker: { landmark: 'landmark:cliff-lightning-jar' } }],
        next: 'escort',
      },
      {
        id: 'escort', journal: 'Every Turning, the Lightning Jar carried the Stormcrow its supper up the cliff path: a whole fish, on a board. Bartle has not missed a night in thirty years, and he is not missing this one, hood or no hood. He is sixty and carries a lantern and a fish. Keep him alive.',
        onEnter: [{ escort: 'npc:bartle-crisp', to: 'landmark:falconer-supper-ledge' }],
        objectives: [{ id: 'bartle', text: 'See Bartle safely up to the supper ledge', when: { any: [{ flag: 'escort.bartle-crisp', op: '==', value: 'arrived' }, { flag: 'escort.bartle-crisp', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:falconer-supper-ledge' } }],
        next: [{ when: { flag: 'escort.bartle-crisp', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'hear' }],
      },
      {
        id: 'regroup', journal: 'Bartle went over on the third ledge, the loose one, and his potboy hauled him back down on a rope. He has a new fish and a sore elbow and is waiting at the Lightning Jar door.',
        onEnter: [{ escort: 'npc:bartle-crisp', to: 'landmark:falconer-supper-ledge' }],
        objectives: [{ id: 'bartle', text: 'Try again: see Bartle up to the supper ledge', when: { any: [{ flag: 'escort.bartle-crisp', op: '==', value: 'arrived' }, { flag: 'escort.bartle-crisp', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:falconer-supper-ledge' } }],
        next: [{ when: { flag: 'escort.bartle-crisp', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'hear' }],
      },
      {
        id: 'hear', journal: 'Bartle has set the fish down on the supper ledge, the way he always does, and is looking up at the top of the cliff.',
        objectives: [{ id: 'bartle', text: 'Hear what Bartle sees from the supper ledge', talk: 'npc:bartle-crisp', marker: { landmark: 'landmark:falconer-supper-ledge' } }],
        next: 'hoods',
      },
      {
        id: 'hoods', journal: 'On the cliff path, the birds of the Stormcliffs sit hooded in rows on the ledges, quite still.',
        objectives: [{ id: 'hoods', text: 'Climb the Stormcliff path', interact: 'obj:falconer-hooded-ledge', marker: { region: 'region:storm' } }],
        onComplete: [{ startQuest: 'quest:falconer-the-stormcrow' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:falconer-the-stormcrow', name: 'The Stormcrow', type: 'class', region: 'region:storm', giver: 'npc:bartle-crisp',
    summary: 'Teodor is hooding the Stormcrow so that it will stop screaming the news of a Turning that never came. Half hooded, it is screaming through the hood.',
    requires: req(done('quest:falconer-the-hooded-crow')), firstStage: 'nest',
    stages: [
      {
        id: 'nest', journal: 'Up to the Stormcrow’s nest at the top of the cliffs.',
        objectives: [{ id: 'lair', text: 'Climb to the Stormcrow’s nest', reach: 'inst:sentinel-storm', marker: { region: 'region:storm' } }],
        next: 'crow',
      },
      {
        id: 'crow', journal: 'The Stormcrow is the Sentinel of the Storm school. The Storm bearers cannot win their mark while it is hooded and screaming.',
        objectives: [{ id: 'crow', text: 'Defeat the Stormcrow', kill: 'bx_stormcrow', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-storm' }, { setFlag: 'story.bearer.stormlancer', value: true }],
        next: 'hood',
      },
      {
        id: 'hood', journal: 'The Stormcrow is at rest, and the great hood has fallen off it onto the rocks of the nest. Teodor has gone, and left his work behind.',
        objectives: [{ id: 'hood', text: 'Look at the great hood in the Stormcrow’s nest', interact: 'obj:falconer-great-hood' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300 },
  },
  {
    ...A2, id: 'quest:falconer-wrens-letter', name: 'Wren’s Letter', type: 'class', region: 'vil:brind', giver: WR,
    summary: 'Something small with feathers has come in over the Gate Circle with a letter tied to its leg, and is extremely pleased with itself.',
    requires: req(done('quest:falconer-the-stormcrow')), autoStart: true, firstStage: 'letter',
    stages: [
      {
        id: 'letter', journal: 'A letter from the Hawkmoor is waiting for you at the Gate Circle, on a bird.',
        objectives: [{ id: 'letter', text: 'Take the letter at the Gate Circle', when: { flag: 'falconer.wren_letter' }, marker: { landmark: 'landmark:gate-circle' } }],
        next: 'reply',
      },
      {
        id: 'reply', journal: 'The bird that brought Wren’s letter has gone up onto the dovecote behind the Gate Circle inn to rest, and will not leave until it has something to carry home.',
        objectives: [{ id: 'reply', text: 'Send a reply home to Wren', interact: 'obj:falconer-reply-to-wren', marker: { landmark: 'landmark:falconer-gate-dovecote' } }],
        // falconer.reply_open gates obj:falconer-reply-to-wren in the world (Claude 2): usable only during this stage
        onEnter: [{ setFlag: 'falconer.reply_open', value: true }],
        onComplete: [{ setFlag: 'story.act2_ready', value: true }, { setFlag: 'falconer.reply_open', value: false }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:falconer-the-stags-saga', name: 'The Stag’s Saga', type: 'side', region: 'region:gloam', giver: 'npc:bearer-skald',
    summary: 'The Skald bearer is in the Gloamwood, drumming the White Stag’s grief into a saga before it is lost. Three verses are missing, and the birds took them.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'verses',
    stages: [
      {
        id: 'verses', journal: 'Sigrid Drumhallow says the old saga was carved where only birds could read it. Fly the hawk up to the three high carvings.',
        objectives: [{ id: 'verses', text: 'Fly to the missing verses', interact: 'obj:saga-verse-*', count: 3, marker: { region: 'region:gloam' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Sigrid has the saga whole, and wants to drum it for you at the Stone Court.',
        objectives: [{ id: 'sigrid', text: 'Talk to the Skald bearer', when: { any: [{ flag: 'falconer.sigrid_thanked' }, { partyHasClass: 'skald' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.skald', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A2, id: 'quest:falconer-spark-and-feather', name: 'Spark and Feather', type: 'side', region: 'vil:cliff', giver: 'npc:bearer-sparkwright',
    summary: 'The Sparkwright bearer has built a cage-machine at Cliffstair to catch the Stormcrow. It is enormous, and it crackles, and they want a falconer to tell them it will work.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'cage',
    stages: [
      {
        id: 'cage', journal: 'Fizz Copperpot’s cage-machine stands in the Wind Yard at Cliffstair, humming.',
        objectives: [{ id: 'cage', text: 'Look at the Sparkwright bearer’s cage-machine', interact: 'obj:falconer-cage-machine', marker: { landmark: 'landmark:cliff-wind-yard' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Fizz has a great deal to say about cages, and wants to say it at the Stone Court.',
        objectives: [{ id: 'fizz', text: 'Talk to the Sparkwright bearer', when: { any: [{ flag: 'falconer.fizz_thanked' }, { partyHasClass: 'sparkwright' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.sparkwright', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  // ======================= ACT III: class quests (III-4 + 3 side)
  {
    ...A3, id: 'quest:falconer-the-eyes-of-the-chimera', name: 'The Eyes of the Chimera', type: 'class', region: 'region:heart', giver: 'npc:casimir',
    summary: 'At the top of the Twelve Stairs waits the Union Chimera, and its eyes are hooded in black tears. Under the hood, seeing for it, is Teodor Tanager.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'herald',
    stages: [
      { id: 'herald', journal: 'The Hollow King’s smiths fitted Teodor to the Chimera as its eyes. It sees everything he sees, and he has made sure it is never frightened.', objectives: [{ id: 'herald', text: 'Face the Eyes of the Chimera', kill: 'cb_eyes-of-the-chimera', count: 1, marker: { landmark: 'landmark:twelve-stairs-top' } }], onComplete: [{ openDialogue: 'dialogue:falconer-herald-fate' }], next: 'fate' },
      { id: 'fate', journal: 'The Chimera’s hooded eyes have gone dark. Teodor is sitting on the top stair, still hooded, very calm, waiting for you to decide.', objectives: [{ id: 'fate', text: 'Decide Teodor’s fate', when: { flag: 'falconer.nemesis_fate' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 3 },
  },
  {
    ...A3, id: 'quest:falconer-wrens-last-flight', name: 'Wren’s Last Flight', type: 'side', region: 'region:heart', giver: WR,
    summary: 'Old Wren has seen the Hawkmoor every day for twenty years through a kestrel’s eyes. She has never once seen the Citadel. A bird has come to the Heart camp with a letter.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'letter',
    stages: [
      { id: 'letter', journal: 'Something with feathers is sitting on the camp perch at the Heart camp, holding out one foot.', objectives: [{ id: 'letter', text: 'Take the letter on the Heart camp perch', interact: 'obj:falconer-camp-perch', marker: { landmark: 'landmark:heart-camp' } }], next: 'flight' },
      { id: 'flight', journal: 'Wren wants to see the Citadel, once. From the top of the Twelve Stairs a bird could fly right over it.', objectives: [{ id: 'flight', text: 'Fly a bird over the Citadel for Wren', interact: 'obj:falconer-citadel-cast', marker: { landmark: 'landmark:twelve-stairs-top' } }], next: 'jess' },
      { id: 'jess', journal: 'Wren has seen the Citadel. On the Mews, when a bird has made its last great flight, its falconer cuts its jesses and hangs them on the eyrie wall. The Heart camp has a perch-post. It will do.', objectives: [{ id: 'jess', text: 'Hang a jess on the perch-post at the Heart camp for Wren', interact: 'obj:falconer-jess-post', marker: { landmark: 'landmark:falconer-perch-post' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:falconer-the-hooded-steadings', name: 'The Hooded Steadings', type: 'side', region: 'region:heart', giver: WR,
    summary: 'Years ago, the hooded people of the Windscour Plain got up off their doorsteps and walked away east. They are standing in the Hollow Legion, still hooded, still smiling.',
    requires: req(done('quest:heart-legion')), autoStart: true, firstStage: 'unhood',
    stages: [
      { id: 'unhood', journal: 'Three Windscour folk in soft black hoods, standing together in the Legion camp. A hood comes off frightening. Stay with each one until it passes.', objectives: [{ id: 'steaders', text: 'Unhood the Windscour folk in the Legion camp, one by one', interact: 'obj:falconer-hooded-steader-*', count: 3, marker: { landmark: 'landmark:legion-camp' } }], next: 'hoods' },
      { id: 'hoods', journal: 'Three soft black hoods are lying in the dust of the Legion camp where they fell. Somebody will pick them up and use them, if nobody decides what to do with them first.', objectives: [{ id: 'hoods', text: 'Decide what to do with the three hoods', interact: 'obj:falconer-fallen-hoods', marker: { landmark: 'landmark:legion-camp' } }], next: 'road' },
      { id: 'road', journal: 'The Windscour folk want to start for home at first light, east, the way they came. See them off from the edge of the Heart camp.', objectives: [{ id: 'road', text: 'See the Windscour folk off at the camp’s east edge', interact: 'obj:falconer-windscour-road', marker: { landmark: 'landmark:falconer-camp-east' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:falconer-fledglings-grown', name: 'Fledglings Grown', type: 'side', region: 'region:heart', giver: 'npc:elias-downe',
    summary: 'Four young hawks have turned up at the Heart camp and taken over the biggest tent. They have no hoods, no jesses and no manners, and they are very pleased to see you.',
    requires: req({ flag: 'story.heart_open' }, done('quest:falconer-fledglings')), autoStart: true, firstStage: 'feathers',
    stages: [
      { id: 'feathers', journal: 'There are moulted hawk feathers in the dust of the Legion camp, barred brown, Featherfall-bred, in a trail that goes from tent to tent, stealing things.', objectives: [{ id: 'feathers', text: 'Follow the trail of young hawk feathers', interact: 'obj:falconer-fledgling-feathers', marker: { landmark: 'landmark:legion-camp' } }], next: 'camp' },
      { id: 'camp', journal: 'The Featherfall fledglings, grown, are sitting on the ridge-pole of a tent at the Heart camp, biting it.', objectives: [{ id: 'fledglings', text: 'Go to the hawks at the Heart camp', interact: 'obj:falconer-grown-fledglings', marker: { landmark: 'landmark:heart-camp' } }], next: 'count' },
      { id: 'count', journal: 'Old Elias Downe counts every feather that falls on the Featherfall. He would want these counted too. Gather the moulted ones at the tent-foot and count them, the Featherfall way, aloud.', objectives: [{ id: 'count', text: 'Count the fledglings’ feathers for Elias Downe', interact: 'obj:falconer-feather-count', marker: { landmark: 'landmark:falconer-tent-foot' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
];

export default quests;
