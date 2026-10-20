/** Hollow Crown, HUNTSMAN Act III: the nemesis remade, the mentor’s last request and the Heart side quests. Owner: Claude 4. */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const BN = 'npc:ulric-bannock' as const, CO = 'npc:corva-ashby' as const, QS = 'npc:quentin-snipe' as const;
// the call, or the call missed (the stage was ticked while another scene was open): it can still be sounded once
const CALL: NarrativeCondition = { any: [stage('quest:huntsman-the-homeward-call', 'call'), { all: [{ questCompleted: 'quest:huntsman-the-homeward-call' }, { not: { flag: 'huntsman.homeward_call' } }] }] };
const HORN: NarrativeCondition = { flag: 'huntsman.bannock_horn' };
const DEVOTABLE: NarrativeCondition = { flag: 'huntsman.bannock_devotable' };
const SPARED: NarrativeCondition = { flag: 'huntsman.nemesis_fate', op: '==', value: 'spared' };

const dialogues: DialogueDef[] = [
  // ---------- III-4 The Antlered Chimera
  {
    id: 'dialogue:huntsman-herald-fate', name: 'III-4 the Antlered Chimera: Corva’s fate', scope: 'party',
    entries: [
      { when: { flag: 'huntsman.charter', op: '==', value: 'sold' }, node: 'sold' },
      { when: { flag: 'huntsman.charter', op: '==', value: 'kept' }, node: 'kept' },
      { node: 'road' },
    ],
    nodes: {
      sold: { speaker: CO, mood: 'hollow', text: '(The black antlers have fallen from her. She sits on the top stair, crossbow across her knees.) Every bolt I loosed for him, I loosed under your licence. The Lodge’s charter. All quite legal.', next: 'missed' },
      kept: { speaker: CO, mood: 'hollow', text: '(The black antlers have fallen from her. She sits on the top stair, crossbow across her knees.) The last honest fool in the Greywilds. You kept the old law, and it has brought you up a stair with nothing in your hands.', next: 'missed' },
      road: { speaker: CO, mood: 'hollow', text: '(The black antlers have fallen from her. She sits on the top stair, crossbow across her knees.) You put the cairns back. I watched from the trees. Nobody had to die for it. I have thought about it every night since.', next: 'missed' },
      missed: { speaker: CO, text: 'And I missed. Just now, on the stair. Once. (She looks at the crossbow.) I always wanted to know what it felt like. It feels like nothing much.', next: 'choose' },
      choose: {
        speaker: CO, mood: 'sad', text: 'Go on, then. One bolt, while I still know what I am. The first night is the kindest. I told you that.',
        choices: [
          {
            text: 'I’m not taking anything from you, Corva. I’m giving you something.', to: 'give', quest: true,
            when: { any: [{ flag: 'huntsman.tine', op: '==', value: 'taken' }, { flag: 'huntsman.charter', op: '==', value: 'road' }, { trust: BN, value: 'trusted' }] },
            lockedLabel: 'You need the Great Hunt’s gift, the herd road, or Bannock’s trust',
            effects: [{ setFlag: 'huntsman.nemesis_fate', value: 'spared' }],
          },
          { text: '(Raise your crossbow. One bolt, clean, the old way.)', to: 'destroy', quest: true, effects: [{ setFlag: 'huntsman.nemesis_fate', value: 'destroyed' }] },
        ],
      },
      give: {
        speaker: 'narrator', text: 'She watches your hands, very still, the way a hind watches a hunter. Nobody has ever given Corva Ashby anything she did not kill first.',
        choices: [
          { text: '(Hold out the Great Hunt’s tine.)', to: 'tine', when: { flag: 'huntsman.tine', op: '==', value: 'taken' } },
          { text: '(Point north, down the Hunt stair, to the road home.)', to: 'cairn', when: { flag: 'huntsman.charter', op: '==', value: 'road' } },
          { text: '(Hold out your empty hand, the way Bannock held his out to you.)', to: 'hand', when: { trust: BN, value: 'trusted' } },
        ],
      },
      tine: { speaker: 'narrator', text: 'The tine is still warm, still faintly gold at the tip. Corva looks at it a long time without moving. Then she takes it in both hands, carefully, as if somebody might come and count it.', next: 'tine2' },
      tine2: { speaker: CO, mood: 'sad', text: 'It gave you this? It simply gave it? (Her voice is not level at all.) I always paid. I paid for everything. I didn’t know you could just be given a thing.', next: 'weep' },
      cairn: { speaker: 'narrator', text: 'Far below, where the old road runs out of the Heart, stands the little cairn you built on the way in, out of habit, pointing home.', next: 'cairn2' },
      cairn2: { speaker: CO, mood: 'sad', text: 'Oh. That’s clever. I said so at the time. (She lets the crossbow slide off her knees.) Will you show me how? I only ever learned to pull them down.', next: 'weep' },
      hand: { speaker: 'narrator', text: 'There is nothing in it. That is the whole of the gift.', next: 'hand2' },
      hand2: { speaker: CO, mood: 'sad', text: '(She looks at it a long time. Then she puts her own gloved hand in it, exactly, and holds on.) I don’t know what this is for. I think I should like to find out.', next: 'weep' },
      weep: { speaker: 'narrator', text: 'Corva Ashby weeps on the top stair of the Heart, in front of everyone, and for once she does not go into the trees to do it.', next: null },
      destroy: { speaker: CO, text: '(She nods, once, exactly.) Thank you. On the first night, while it still knows what it is. That’s the kind one.', next: 'destroy2' },
      destroy2: { speaker: 'narrator', text: 'One bolt, clean, the old way. The last of the black drips off her like rain off antler. Corva Ashby lies on the top stair with her eyes open, and for the first time since you met her, she is not aiming at anything.', next: null },
    },
  },
  // ---------- The Homeward Call (mentor’s last request)
  {
    id: 'dialogue:obj-huntsman-hunt-stair-head', name: 'The Homeward Call: the head of the Hunt stair', scope: 'party',
    entries: [
      { when: { all: [CALL, HORN, DEVOTABLE] }, node: 'hornD' },
      { when: { all: [CALL, HORN] }, node: 'horn' },
      { when: { all: [CALL, DEVOTABLE] }, node: 'whistleD' },
      { when: CALL, node: 'whistle' },
      { node: 'head' },
    ],
    nodes: {
      horn: { speaker: 'narrator', text: 'Bannock’s horn, elk-bone and older than the Lodge. Blow it anywhere else, he said, and somebody might come. You put it to your lips and blow the homeward call: three long notes, and a short one, like a door closing.', next: 'answer' },
      hornD: { speaker: 'narrator', text: 'Bannock’s horn, elk-bone and older than the Lodge. Blow it anywhere else, he said, and somebody might come. You put it to your lips and blow the homeward call: three long notes, and a short one, like a door closing.', next: 'devoted' },
      whistle: { speaker: 'narrator', text: 'You never had Bannock’s horn. You put two fingers in your mouth instead and whistle the homeward call, the way he whistled Biscuit in across the paddock: three long notes, and a short one, like a door closing.', next: 'answer' },
      whistleD: { speaker: 'narrator', text: 'You never had Bannock’s horn. You put two fingers in your mouth instead and whistle the homeward call, the way he whistled Biscuit in across the paddock: three long notes, and a short one, like a door closing.', next: 'devoted' },
      answer: {
        speaker: 'narrator', text: 'For a long moment, nothing. Then, very far off, past the Weeping Wall and the arches and the Antler Gate, something answers: one deep bellow, and then many. A herd, turning for home.',
        effects: [{ setFlag: 'huntsman.homeward_call', value: true }], next: null,
      },
      devoted: {
        speaker: 'narrator', text: 'Far off, past the Weeping Wall and the Antler Gate, something answers: one deep bellow, then many. In Antlerford every antler on every wall hums one note, and at the tally stone a very large man in feast gloves stands up.',
        effects: [{ setFlag: 'huntsman.homeward_call', value: true }, { trust: BN, set: 5 }], next: 'devoted2',
      },
      devoted2: { speaker: BN, mood: 'happy', text: '(Very far away, as if through the antlers, a voice you would know anywhere.) That’s the call. That’s my call. (A pause, and the scratch of a pencil.) Five. I’ll write down five, and I’ll leave it written.', next: null },
      head: { speaker: 'narrator', text: 'The head of the Hunt stair, looking out over the Citadel and every road in Concordia.', next: null },
    },
  },
  // ---------- The Gamekeeper
  {
    id: 'dialogue:huntsman-snipe-heart', name: 'The Gamekeeper: Quentin at the Heart camp', scope: 'party',
    entries: [
      { when: stage('quest:huntsman-the-gamekeeper', 'snipe'), node: 'arrive' },
      { when: stage('quest:huntsman-the-gamekeeper', 'corva'), node: 'collar' },
      { when: stage('quest:huntsman-the-gamekeeper', 'cairn'), node: 'stones' },
      { node: 'later' },
    ],
    nodes: {
      arrive: {
        speaker: QS, text: '(Quentin Snipe is sitting on his pack at the edge of the camp, thinner than ever, with a spade strapped to it.) I wrote my notice nine times, and then I followed her anyway. I brought a spade. In case.',
        choices: [
          { text: 'She’s alive, Quentin. She’s here, at the camp.', to: 'alive', quest: true, when: SPARED },
          { text: 'She’s gone, Quentin. I’m sorry.', to: 'dead', quest: true, when: { not: SPARED } },
        ],
      },
      alive: { speaker: QS, mood: 'happy', text: 'Alive? (He looks at the spade as if it has insulted him.) I’ll leave that here, then. Has she eaten? She won’t have eaten. Take me to her. No, wait. Yes. Take me to her.', next: null },
      dead: { speaker: QS, mood: 'sad', text: '(He nods for a long time.) Then I’ll do the last thing a gamekeeper does. The stone here won’t take a spade. A cairn, then, the Lodge way. She’d want it square at the corners.', next: null },
      collar: { speaker: QS, text: 'Is my collar straight? It doesn’t matter. It does. Go on. I’m right behind you.', next: null },
      stones: { speaker: QS, text: 'At the head of the Hunt stair, I thought, where she can see the road home. I’ll fetch the stones. You know how the Lodge does it.', next: null },
      later: { speaker: QS, text: 'Twenty years I waited up. I think I’ll sleep tonight.', next: null },
    },
  },
  {
    id: 'dialogue:huntsman-corva-heart', name: 'The Gamekeeper: Corva and Quentin', scope: 'party',
    entries: [{ when: { flag: 'huntsman.notice_given' }, node: 'fireN' }, { node: 'fire' }],
    nodes: {
      fire: { speaker: 'narrator', text: 'Corva is sitting at the edge of the camp fire with her hands in her lap and nothing in them. Quentin stops a few paces off, holding his spade, and clears his throat.', next: 'see' },
      see: { speaker: CO, text: 'Quentin. You are in the Heart of Morvane, with a spade. (She looks at it.) Was that for me?', next: 'case' },
      case: { speaker: QS, text: 'In case, my lady.', next: 'eat' },
      fireN: { speaker: 'narrator', text: 'Corva is sitting at the edge of the camp fire with her hands in her lap and nothing in them. Quentin stops a few paces off, holding his spade and, for some reason, a copy of his notice.', next: 'seeN' },
      seeN: { speaker: CO, text: 'Quentin. You are in the Heart of Morvane, with a spade and your notice. (She looks at the spade.) Was that for me?', next: 'caseN' },
      caseN: { speaker: QS, text: 'In case, my lady. And I’m working out my month. It says a month. I thought I’d work it here.', next: 'eat' },
      eat: { speaker: CO, text: '(A long pause.) Have you eaten?', next: 'eat2' },
      eat2: { speaker: QS, text: 'Have you?', next: 'laugh' },
      laugh: {
        speaker: 'narrator', mood: 'happy', text: 'Lady Corva Ashby laughs, out loud, for the first time anyone at the camp has ever heard, and cannot stop, and has to put her face in her hands.',
        choices: [
          { text: '(Leave them to it.)', to: null },
          { text: '(Fetch them both a bowl from the stewpot.)', to: 'bowls', school: 'hunt' },
        ],
      },
      bowls: { speaker: 'narrator', text: 'You bring two bowls. Neither of them has eaten in days, and neither of them says so. They eat side by side by the fire, exact and careful, and nobody counts anything.', next: null },
    },
  },
  {
    id: 'dialogue:obj-huntsman-corva-cairn', name: 'The Gamekeeper: Corva’s cairn', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-gamekeeper', 'cairn'), node: 'build' }, { node: 'cairn' }],
    nodes: {
      build: { speaker: 'narrator', text: 'You and Quentin build it at the head of the Hunt stair, stone on stone, the Lodge way, until it stands waist high. He unstrings her crossbow and lays it on top, pointing north, the way a cairn points the herd home.', next: 'square' },
      square: {
        speaker: QS, mood: 'sad', text: 'She always asked if I’d eaten. Nobody ever asked her. (He squares the top stone, very exactly.) There. Square at the corners.',
        effects: [{ setFlag: 'huntsman.corva_cairn', value: true }], next: null,
      },
      cairn: { speaker: 'narrator', text: 'A cairn at the head of the Hunt stair, with an unstrung crossbow on top, pointing north.', next: null },
    },
  },
  // ---------- The Calf on the Stair
  {
    id: 'dialogue:obj-huntsman-stair-calf', name: 'The Calf on the Stair', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-calf-on-the-stair', 'stair'), node: 'calf' }, { node: 'step' }],
    nodes: {
      calf: {
        speaker: 'narrator', text: 'A few steps below the top of the Hunt stair stands the calf from the Elkway, taller now and all knees, without a speck of black on it. It followed the Great Hunt’s old road all this way, and the road ran out at a staircase.',
        choices: [
          { text: '(Turn your back on it and walk slowly down, the way the old law says.)', to: 'law' },
          { text: '(Scuff the dust as you go, so it has a track to follow.)', to: 'track', school: 'hunt' },
          { text: '(Hold out your hand.)', to: 'hand' },
        ],
      },
      law: { speaker: 'narrator', text: 'You hear it come after you, one careful step at a time, stopping when you stop. Don’t look round.', next: null },
      track: { speaker: 'narrator', text: 'It puts its nose down to your track, snorts, and follows it with enormous seriousness, one step at a time.', next: null },
      hand: { speaker: 'narrator', text: 'It stretches its neck towards your fingers, almost close enough, then shies. You remember the old law, put your hands in your pockets and start down. After a moment it follows.', next: null },
      step: { speaker: 'narrator', text: 'The Hunt stair, its banner bright again, and small hoofprints in the dust.', next: null },
    },
  },
  {
    id: 'dialogue:obj-huntsman-calf-cover', name: 'The Calf on the Stair: cover at the camp', scope: 'party',
    entries: [
      { when: { all: [stage('quest:huntsman-the-calf-on-the-stair', 'cover'), { flag: 'huntsman.biscuit_pet' }] }, node: 'biscuit' },
      { when: stage('quest:huntsman-the-calf-on-the-stair', 'cover'), node: 'down' },
      { node: 'plain' },
    ],
    nodes: {
      biscuit: { speaker: 'narrator', text: 'At the camp, Biscuit gets up from the fire, walks over to the calf, sniffs it all over for news of the Elkway, and lies down beside it with a groan, as if somebody had asked her to.', next: 'down' },
      down: {
        speaker: 'narrator', text: 'In the lee of the supply carts, out of the wind, the calf folds its legs one at a time and lies down. You never touched it once. When this is over and you take the road home, it will follow.',
        effects: [{ setFlag: 'huntsman.calf_led', value: true }], next: null,
      },
      plain: { speaker: 'narrator', text: 'The calf, asleep behind the supply carts, one ear twitching.', next: null },
    },
  },
];

export default dialogues;
