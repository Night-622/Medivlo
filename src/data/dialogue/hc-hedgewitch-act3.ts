/** Hollow Crown, HEDGEWITCH Act III: the nemesis remade, the mentor’s last request and the Heart side quests. Owner: Claude 4. */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const YA = 'npc:mother-yarrow' as const, OS = 'npc:ostara' as const, GB = 'npc:gran-burdock' as const, TD = 'npc:thistledown-thornhollow' as const;
const DEVOTABLE: NarrativeCondition = { flag: 'hedgewitch.yarrow_devotable' };

const dialogues: DialogueDef[] = [
  // ======================= ACT III
  {
    id: 'dialogue:hedgewitch-herald-fate', name: 'III-4 the Herald of Bloom: Ostara’s fate', scope: 'party',
    entries: [
      { when: { flag: 'hedgewitch.pruning', value: 'grow' }, node: 'agreed' },
      { when: { flag: 'hedgewitch.pruning', value: 'prune' }, node: 'pruned' },
      { node: 'kneel' },
    ],
    nodes: {
      kneel: { speaker: OS, mood: 'hollow', text: 'Don’t shake hands, love. I’m sticky to the elbows. I’m sticky all the way up now. (Leaves are still unfolding out of her sleeves, one after another.) Look at it all grow.', next: 'tired' },
      agreed: { speaker: OS, mood: 'hollow', text: 'You stood up in the ring and said let it grow, love. I clapped the loudest. You agreed with me. (Leaves are still unfolding out of her sleeves.) So why have you come up here with shears?', next: 'tired' },
      pruned: { speaker: OS, mood: 'hollow', text: 'You voted to burn my year, love. I walked out of that ring and I kept on walking, all the way here. (Leaves are still unfolding out of her sleeves.) I’m not going in the compost. Not for you.', next: 'tired' },
      tired: { speaker: OS, mood: 'sad', text: 'I only wanted to keep everyone. Now nothing in me will stop. I’m so tired, love. Make it stop. Only not the compost. Please. Not the compost.', next: 'choose' },
      choose: {
        speaker: OS, text: 'Well, witch? What does a gardener do with a thing that won’t stop growing?',
        choices: [
          {
            text: '(Hold the half-stone to her, and sing her a winter.)', to: 'winter', quest: true,
            when: { any: [{ flag: 'hedgewitch.pruning', value: 'winter' }, { trust: YA, value: 'trusted' }] },
            lockedLabel: 'You need the tree’s winter song, or Mother Yarrow’s trust',
            effects: [{ setFlag: 'hedgewitch.nemesis_fate', value: 'spared' }],
          },
          { text: 'Everything goes to the compost, Ostara. (Cut the last graft.)', to: 'compost', quest: true, effects: [{ setFlag: 'hedgewitch.nemesis_fate', value: 'destroyed' }] },
        ],
      },
      winter: { speaker: 'narrator', text: 'You sing her the slow, cold song you sang the tree. The hedge of her robe goes gold, then brown, and then it lets go, all together, like a held breath. Ostara yawns like a child, curls up among her own leaves on the stair, and sleeps.', next: 'winter2' },
      winter2: { speaker: OS, mood: 'sad', text: '(When she wakes her hair is white, and her hands are only hands, wrinkled and clean.) Oh. I’m old, love. Look at me. I’m old. (She laughs, and cries, and cannot stop either for a while.)', next: null },
      compost: { speaker: 'narrator', text: 'The graft parts, and the hedge lets go of her at last. She settles into her own leaves like a gardener lying down at the end of a long day. “Oh,” she says. “It’s warm.” By the time you kneel beside her she is earth, dark and sweet and good.', next: null },
    },
  },
  {
    id: 'dialogue:obj-hedgewitch-stair-acorn', name: 'Yarrow’s Acorn: the head of the Verdant stair', scope: 'party',
    entries: [
      { when: { all: [stage('quest:hedgewitch-yarrows-acorn', 'plant'), { flag: 'hedgewitch.yarrow_acorn' }] }, node: 'acorn' },
      { when: stage('quest:hedgewitch-yarrows-acorn', 'plant'), node: 'leaf' },
      { node: 'shoot' },
    ],
    nodes: {
      acorn: { speaker: 'narrator', text: 'At the head of the Verdant stair, a crack in the black stone, just wide enough. You take Yarrow’s acorn off its cord. Thirty-one years on, it is warm again, the way a hand is warm.', next: 'soil' },
      leaf: { speaker: 'narrator', text: 'At the head of the Verdant stair, a crack in the black stone. You have no acorn, but you have Yarrow’s leaf, the letter the tree carried all the way to the Gate Circle. You fold it small, hedge-writing and all.', next: 'soil' },
      soil: { speaker: 'narrator', text: 'You pack Nan Briar’s old garden earth into the crack first, dark and sweet and three Turnings old. The black stone does not like it. The black stone is not being asked.', next: 'plant' },
      plant: {
        speaker: 'narrator', text: 'You press it into the crack and sing it one low note. Nothing. Then a single green shoot comes up through the black, unfolds one leaf, and stops, as if it has said what it came to say.',
        // the beat completes the quest only once the scene has played (so the Devoted node cannot be skipped)
        effects: [{ setFlag: 'hedgewitch.acorn_planted', value: true }],
        choices: [
          { text: '(Tell it Mother Yarrow sends her love.)', to: 'devoted', when: DEVOTABLE },
          { text: '(Tell it Mother Yarrow sends her love.)', to: 'plain', when: { not: DEVOTABLE } },
        ],
      },
      devoted: {
        speaker: 'narrator', mood: 'happy', text: 'Far away in Rootholme every leaf on the Elder Tree turns silver side up at once, and Mother Yarrow, on the bower step in her slippers, puts down her tea. “There,” she tells the tree. “I said they’d write.”',
        effects: [{ trust: YA, set: 5 }], next: null,
      },
      plain: { speaker: 'narrator', text: 'The leaf turns, very slightly, towards home. The tree has a word in the Heart now. It is a small word, and green, and it will do.', next: null },
      shoot: { speaker: 'narrator', text: 'A single green shoot in a crack at the head of the Verdant stair. Its one leaf is turned towards home.', next: null },
    },
  },
  {
    id: 'dialogue:hedgewitch-gran-heart', name: 'Gran Burdock’s Rest', scope: 'party',
    entries: [
      { when: stage('quest:hedgewitch-gran-burdocks-rest', 'gran'), node: 'find' },
      { when: stage('quest:hedgewitch-gran-burdocks-rest', 'pail'), node: 'waiting' },
      { when: stage('quest:hedgewitch-gran-burdocks-rest', 'choose'), node: 'back' },
      { node: 'later' },
    ],
    nodes: {
      find: { speaker: GB, mood: 'hollow', text: '(Gran Burdock, in her shawl, in the Legion’s front rank, her feet grown down into the black ground. Her nails are green to the knuckle now. She is still smiling.)', next: 'tried' },
      tried: { speaker: 'narrator', text: 'The bearers have tried to move her three times. A very large one tried to lift her bodily, and is now lying down with a wet cloth on his back. She has not noticed any of it.', next: 'hand' },
      hand: {
        speaker: 'narrator', text: 'Her fingers close round yours, slow as a root closing round a stone. She walked all this way behind Ostara, one step a day. Under her the black ground is wet, as if somebody has been watering it.', next: null,
      },
      waiting: { speaker: GB, mood: 'hollow', text: '(She smiles at the place where her roots go down. Every root runs the same way, towards the Stairs.)', next: null },
      back: { speaker: 'narrator', text: 'You set Ostara’s pail down beside her. Gran’s head turns towards it, slowly, the way a flower turns to a window, and her green fingers open for the handle. She knows the smell. She has been waiting for it every night.', next: 'decide' },
      decide: {
        speaker: 'narrator', text: 'Ostara kept her alive all this way, a pail at a time, because she could not bear to let her go. Gran is still waiting for somebody to tell her what happens now.',
        choices: [
          { text: '(Sing her to sleep. Gently. Let her go.)', to: 'sleep', effects: [{ setFlag: 'hedgewitch.gran_fate', value: 'rest' }] },
          { text: '(Dig her out, roots and all, and take her home to Ned.)', to: 'home', effects: [{ setFlag: 'hedgewitch.gran_fate', value: 'home' }] },
        ],
      },
      sleep: { speaker: 'narrator', text: 'You sing low, and the sap in her slows, and slows. Her roots let go of the black ground one by one. Then she looks at you, properly, for the first time in a year.', next: 'ned' },
      ned: { speaker: GB, mood: 'happy', text: '(Her voice is cracked from not being used.) You tell our Ned to stop wiping his nose on his sleeve. (She closes her eyes, and smells, very faintly, of peppermints.)', next: null },
      home: { speaker: 'narrator', text: 'It takes an hour and a borrowed spade. You lift her, roots and all, into the biggest pot in the Heart camp, and she goes on smiling at nothing, warm and green and never, ever going to die.', next: 'home2' },
      home2: { speaker: 'narrator', mood: 'sad', text: 'Ned will have his Gran forever. All the way back down the Legion road, you hope it is what he would choose.', next: null },
      later: { speaker: GB, mood: 'hollow', text: '(She smiles at the side of her pot.)', next: null },
    },
  },
  {
    id: 'dialogue:hedgewitch-thistledown-heart', name: 'Thistledown’s Answer', scope: 'party',
    entries: [
      { when: { all: [stage('quest:hedgewitch-thistledowns-answer', 'edge'), { flag: 'hedgewitch.thistledown_answer', value: 'spread' }] }, node: 'spread' },
      { when: { all: [stage('quest:hedgewitch-thistledowns-answer', 'edge'), { flag: 'hedgewitch.thistledown_answer', value: 'unknown' }] }, node: 'unknown' },
      { when: stage('quest:hedgewitch-thistledowns-answer', 'edge'), node: 'choose' },
      { when: stage('quest:hedgewitch-thistledowns-answer', 'spots'), node: 'busy' },
      { when: stage('quest:hedgewitch-thistledowns-answer', 'root'), node: 'found' },
      { node: 'later' },
    ],
    nodes: {
      choose: { speaker: TD, text: 'It is you. I walked from Thornhollow. It took a long time, because I am mostly fluff and the wind kept disagreeing. You said I was for whatever I chose. I have chosen.', next: 'list' },
      spread: { speaker: TD, text: 'It is you. I walked from Thornhollow. It took a long time, because I am mostly fluff and the wind kept disagreeing. You said thistledown goes where nothing grows yet. I have found the place.', next: 'list' },
      unknown: { speaker: TD, text: 'It is you. I walked from Thornhollow. It took a long time, because I am mostly fluff and the wind kept disagreeing. You said you did not know what you were for. I have found mine. I am sorry I have not found yours yet.', next: 'list' },
      list: { speaker: TD, mood: 'happy', text: 'I am for growing where nothing has. (It looks out at the black ground of the Heart with enormous satisfaction.) There is a great deal of nothing here. But it must be the right nothing. Will you help me look? I have brought my list.', next: null },
      busy: { speaker: TD, text: 'I am still looking. Nothing comes in a great many kinds. Please keep inspecting.', next: null },
      found: { speaker: TD, mood: 'happy', text: '(It is standing in the exact middle of its chosen patch, very straight.) This one. Nothing has ever grown here. Not once. I am going to be very busy.', next: 'roots' },
      roots: {
        speaker: 'narrator', text: 'Thistledown sits down in its patch of nothing and roots, with tremendous dignity. One seed lifts off its head and drifts away towards the Citadel.',
        choices: [{ text: 'Good luck, Thistledown.', to: 'bye', trustNpc: TD, trust: 1 }, { text: '(Bow to it, gravely.)', to: 'bye' }],
      },
      bye: { speaker: TD, mood: 'happy', text: 'Thank you. Please do not step on me on the way back.', next: null },
      later: { speaker: TD, text: 'I am growing. It is going well.', next: null },
    },
  },
];

export default dialogues;
