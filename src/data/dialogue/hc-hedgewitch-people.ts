/**
 * Hollow Crown, HEDGEWITCH: Rootholme people (general talk), the eight side quests, the mentor thread and the
 * bounties, plus the Act II class-thread and featured-bearer scenes. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const offer = (q: Q, text: string, to: string, extra?: NarrativeCondition): DialogueChoice =>
  ({ text, to, quest: true, when: extra ? { all: [fresh(q), extra] } : fresh(q), effects: [{ startQuest: q }] });
const bye: DialogueChoice = { text: 'Farewell.', to: null, tag: 'leave' };
const NIGHT: NarrativeCondition = { hour: [21, 4] };
const YA = 'npc:mother-yarrow' as const;

/** one object scene per numbered set piece: the quest-stage text, then a plain line afterwards */
const objs = (slug: string, q: Q, st: string, texts: string[], after: string): DialogueDef[] =>
  texts.map((text, i) => ({
    id: `dialogue:obj-${slug}-${i + 1}` as const, name: `${slug} ${i + 1}`,
    entries: [{ when: stage(q, st), node: 'now' }, { node: 'after' }],
    nodes: { now: { speaker: 'narrator', text, next: null }, after: { speaker: 'narrator', text: after, next: null } },
  }));

const dialogues: DialogueDef[] = [
  // ---------- Mother Yarrow (general + mentor thread)
  {
    id: 'dialogue:hedgewitch-yarrow', name: 'Yarrow (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: YA, text: 'Hello, dear. I was just telling the tree about you. Nothing bad. Mostly nothing bad.',
        choices: [
          offer('quest:hedgewitch-yarrows-tree-diary', 'What are all these little books?', 'diary', { trust: YA, value: 'friendly' }),
          offer('quest:hedgewitch-what-the-tree-said-back', 'Has the tree ever answered you?', 'answer', { all: [{ trust: YA, value: 'trusted' }, { questCompleted: 'quest:hedgewitch-yarrows-tree-diary' }] }),
          { text: 'What do you tell it, all day?', to: 'tell' },
          { text: 'Why did you start talking to the tree, Mother Yarrow?', to: 'lane', when: { trust: YA, value: 'trusted' } },
          bye,
        ],
      },
      lane: { speaker: YA, text: 'Oh, now. Nobody’s asked me that in sixty years. I was born on Cobble Lane, dear, the youngest of nine, and in a house of nine nobody can hear you. So I went out on the bough and told the tree instead.', next: 'lane2' },
      lane2: {
        speaker: YA, mood: 'sad', text: 'My mother said it was a phase. Then she said it was a habit. Then she said it was a calling, and gave me her shears, and that was that. These shears, as it happens. Second-best. She had better ones, and lost them in the river.',
        choices: [
          { text: 'And the tree listened.', to: 'lane3' },
          { text: 'Do you miss them? Your family?', to: 'lane4', trust: 1 },
        ],
      },
      lane3: { speaker: YA, mood: 'happy', text: 'It never interrupted. You’ve no idea what a gift that is, to the youngest of nine. Now go on with you. I’ve a tree to talk to.', next: null },
      lane4: { speaker: YA, text: 'Every day, dear. They’re all in the compost now, every one of them, and the compost feeds the tree, and I talk to the tree. So in a way I never stopped talking to them. Don’t tell the Circle. They’ll make it a doctrine.', next: null },
      diary: { speaker: YA, text: 'My tree-diary. Everything I’ve said to the tree for sixty years, written down, in case it wants to check. Only I can’t read the early ones. I wrote like a hedge in a high wind. The oldest are stuffed in the roots somewhere.', next: null },
      answer: {
        speaker: YA, mood: 'sad', text: '(A long pause.) No, dear. Not once. Not in sixty years. I talk to it anyway. It seemed rude to stop. They say there’s a knot in the canopy where it still speaks, at night. I’ve never dared go and listen.',
        next: null,
      },
      tell: {
        speaker: YA, text: 'The weather. Who’s courting. What the Circle said, and what I wish I’d said back. It’s a good listener. It never interrupts, and it’s never once told anybody.',
        choices: [{ text: 'Tell it I said hello.', to: 'hello', trust: 1 }, { text: 'Doesn’t it get boring?', to: 'boring' }],
      },
      hello: { speaker: YA, mood: 'happy', text: '(She pats the bark.) They say hello. Yes. I know. I like them too.', next: null },
      boring: { speaker: YA, text: 'For the tree? Probably. It’s polite about it.', next: null },
    },
  },
  {
    id: 'dialogue:hedgewitch-yarrow-diary', name: 'Mentor: Yarrow’s Tree-Diary', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: YA, text: 'Read it out, dear, my eyes are worse than my writing. Start anywhere.', next: 'read' },
      read: { speaker: 'narrator', text: '“Snow tonight. Told the tree goodnight. The Concordant’s gardener came by and we sang the Stone to it, and all the leaves came down together, and it slept. Back in the spring, I said. It always is.”', next: 'winter' },
      winter: {
        speaker: YA, mood: 'sad', text: 'It slept. I’d forgotten. Every winter, in the Concord days, the Stone sang it to sleep, and it rested, and in the spring it woke up and grew a sensible amount. It hasn’t slept in thirty years. No wonder it’s frightened. It’s exhausted.',
        choices: [{ text: 'Then the half-stone could sing it to sleep again.', to: 'end', insight: 'hedgewitch_winter', trust: 1 }],
      },
      end: { speaker: YA, text: 'For a winter, perhaps. Wouldn’t that be something. Hold on to that, dear, if the Circle ever asks you what the tree needs.', next: null },
    },
  },
  {
    id: 'dialogue:obj-listening-knot', name: 'The Listening Knot',
    entries: [
      { when: { all: [stage('quest:hedgewitch-what-the-tree-said-back', 'knot'), NIGHT] }, node: 'night' },
      { when: stage('quest:hedgewitch-what-the-tree-said-back', 'knot'), node: 'day' },
      { node: 'knot' },
    ],
    nodes: {
      knot: { speaker: 'narrator', text: 'A great whorled knot in the bark of the canopy, shaped a little like an ear.', next: null },
      day: { speaker: 'narrator', text: 'Wind, birds, children shrieking at the kite-race. If the tree is saying anything, it cannot be heard over Rootholme. Come back at night.', next: null },
      night: {
        speaker: 'narrator', text: 'You put your ear to the knot. For a long time there is only sap, moving. Then, slowly, like a seed opening, a sound shapes itself in the wood: Yarrow. Yarrow. As if it has been practising.',
        effects: [{ setFlag: 'hedgewitch.knot_heard', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:hedgewitch-yarrow-knot', name: 'Mentor: What the Tree Said Back', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: YA, text: 'You went. At night, up all those boughs. Well? Did it… was there anything?', next: 'said' },
      said: {
        speaker: YA, mood: 'sad', text: 'My name. It said my name. (She sits down on the root, quite suddenly.) Sixty years. I thought it never heard a word. It was learning them. It was learning mine.',
        choices: [{ text: 'It’s been listening all along.', to: 'end' }, { text: '(Sit with her.)', to: 'end' }],
      },
      end: { speaker: YA, mood: 'happy', text: 'Well. Well, I never. (To the tree, with great dignity.) You might have said. Thank you, dear. You’ve given an old woman back sixty years of conversation.', effects: [{ trust: YA, delta: 1 }], next: null },
    },
  },
  ...objs('yarrow-diary', 'quest:hedgewitch-yarrows-tree-diary', 'volumes', [
    'A little book wedged under a root, green with moss. The first page says “Diary, to the Tree, volume one” in very large, very wobbly letters.',
    'A second volume, used as a wedge under the bower’s table leg. The table wobbles the moment you take it.',
    'The third volume is inside a teapot. You do not ask.',
  ], 'Yarrow’s old diary, back on the shelf where it can be forgotten properly.'),
  // ---------- Ostara (general) and the Root Circle
  {
    id: 'dialogue:hedgewitch-ostara', name: 'Ostara (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ostara', text: 'Hello, love. Hungry? I’ve sap-cakes. Everything’s got sap in.',
        choices: [
          { text: 'Why do they call you Bramblewife?', to: 'bramble' },
          { text: 'Do you ever lose a patient?', to: 'lose', when: { flag: 'hedgewitch.ostara_met' } },
          bye,
        ],
      },
      bramble: { speaker: 'npc:ostara', mood: 'happy', text: 'Because I married a bramble patch when I was nine, and nobody let me forget it. It was a very good marriage. It never once argued.', next: null },
      lose: { speaker: 'npc:ostara', mood: 'sad', text: 'I lost my mother, when I was a girl. Fever. The Circle said it was her time, and put her in the compost, and sang. I’ve never lost anyone since. Not one. Run along now.', next: null },
    },
  },
  {
    id: 'dialogue:hedgewitch-cicely', name: 'Eldest Cicely Rue (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:cicely-rue', text: 'The Circle has met, and disagreed, and will meet again to disagree about the disagreeing. Was there something?', next: null } },
  },
  ...objs('ostara-ward-bed', 'quest:hedgewitch-the-bramblewifes-garden', 'rounds', [
    'A sap-tapper with a fever. One spoonful, and the fever goes out of him like a candle. He smiles at you and closes his eyes, and does not say thank you, or anything else.',
    'A girl with a broken arm in a splint of green willow. One spoonful, and the bone knits under your hand, quiet as a root. She smiles, and smiles, and does not stop.',
  ], 'An empty cot under the sap-pipes, still warm.'),
  {
    id: 'dialogue:obj-ostara-ward-bed-3', name: 'Ostara’s third bed',
    entries: [{ when: stage('quest:hedgewitch-the-bramblewifes-garden', 'rounds'), node: 'bed' }, { node: 'after' }],
    nodes: {
      bed: {
        speaker: 'narrator', text: 'An old man, one of Ostara’s earliest patients, “just for a top-up”. He opens his mouth for the spoon like a fledgling. Close to, he does not smell like an old man at all.',
        choices: [
          { text: '(Lean closer.) He smells of sap. Not skin. Sap.', to: 'sap', insight: 'hedgewitch_sap_smell' },
          { text: '(Give him his spoonful.)', to: null },
        ],
      },
      sap: { speaker: 'narrator', text: 'Warm, green, sweet: the smell of a tapped well. His fingernails are green at the roots. He smiles at you, very kindly, and says nothing at all.', next: null },
      after: { speaker: 'narrator', text: 'The old man is asleep, smiling.', next: null },
    },
  },
  // ---------- Bough Markets: Too Many Cats, the Compost Debate, bounties
  {
    id: 'dialogue:hedgewitch-prudence', name: 'Prudence Coddle (Too Many Cats)',
    entries: [{ when: stage('quest:hedgewitch-too-many-cats', 'prudence'), node: 'count' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:prudence-coddle', text: 'Nineteen. Nineteen cats on Lantern Row, and the Row’s under bark, and I can hear them. I can hear Admiral. Admiral is very cross.',
        choices: [offer('quest:hedgewitch-too-many-cats', 'I’ll get them out.', 'out'), bye],
      },
      out: { speaker: 'npc:prudence-coddle', text: 'Bless you. They’re in the new wood, in the knot-holes, up the branches. One of them got into a bench. Don’t ask me how, it was a very small bench.', next: null },
      count: {
        speaker: 'npc:prudence-coddle', mood: 'happy', text: 'Seventeen, eighteen… nineteen? That one’s a rose-hip.',
        choices: [{ text: 'It says it’s a cat.', to: 'cat', trust: 1 }, { text: 'Close enough.', to: 'cat' }],
      },
      cat: { speaker: 'npc:prudence-coddle', text: '(She looks at the Bloomkin. The Bloomkin looks at her, then washes its face with a leaf.) Well. It’s got the manners for it. Nineteen. Thank you, witch. Have some cheese.', next: 'book' },
      book: { speaker: 'npc:prudence-coddle', text: 'Only it must go in the register, properly, like the other eighteen. Beadle Wort keeps the Circle’s register of Lantern Row cats at the notice-bough. Name, colour and temper. Tibbs. Red. Dignified.', next: null },
    },
  },
  {
    id: 'dialogue:hedgewitch-tibbs', name: 'Tibbs, who is a cat',
    entries: [{ when: stage('quest:hedgewitch-too-many-cats', 'tibbs'), node: 'stubborn' }, { node: 'purr' }],
    nodes: {
      stubborn: {
        speaker: 'npc:tibbs', text: '(A Bloomkin the size of a loaf, round and red as a rose-hip, sitting in a knot-hole with its paws tucked in. It looks at you. It says, with enormous dignity:) Mrow.',
        choices: [
          { text: 'You’re not a cat. You’re a Bloomkin.', to: 'no' },
          { text: 'Come on, puss. Prudence has cheese.', to: 'yes' },
          { text: '[Verdant] (Hum to it the way you’d hum to a seedling.)', to: 'yes', school: 'verdant' },
        ],
      },
      no: { speaker: 'npc:tibbs', mood: 'angry', text: 'MROW. (It turns its back on you, which is the most cat-like thing it has done yet.)', next: null },
      yes: { speaker: 'npc:tibbs', mood: 'happy', text: '(It hops down, winds once round your ankles, and trots off towards Prudence’s, tail-stalk high.)', next: null },
      purr: { speaker: 'npc:tibbs', text: '(It is sitting in a patch of sun, purring. It cannot purr. It is doing it anyway.)', next: null },
    },
  },
  ...objs('lantern-cat', 'quest:hedgewitch-too-many-cats', 'cats', [
    'Four cats in one knot-hole, wedged in like peas. They come out in order of age, and the oldest one looks at you as if this is all your fault.',
    'Six cats up a fresh branch, meowing at the drop. You coax them down one at a time. The sixth will only come down if carried, and if told it is handsome.',
    'A hollow bench, much larger inside than out, full of five cats and a ham bone nobody remembers losing.',
    'Three cats asleep in a new bird’s nest, and one very confused bird. Admiral is among them, and he is extremely cross.',
  ], 'A knot-hole with a lot of cat hair in it.'),
  {
    id: 'dialogue:hedgewitch-hepzibah', name: 'Hepzibah Marl (the Compost Debate)',
    entries: [{ when: stage('quest:hedgewitch-the-compost-debate', 'hepzibah'), node: 'verdict' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:hepzibah-marl', text: 'Leaves, eggshells, a good handful of nettles, turned every Tuesday. That is compost. Whatever HE does over there is a crime against the soil.',
        choices: [offer('quest:hedgewitch-the-compost-debate', 'Shall I settle it?', 'settle'), bye],
      },
      settle: { speaker: 'npc:hepzibah-marl', text: 'Forty years we’ve argued across this bough. Look at both heaps, and the Market’s, and then tell him he’s wrong. Loudly. He’s deaf in the ear that faces me.', next: null },
      verdict: {
        speaker: 'npc:hepzibah-marl', text: 'Well? Mine, isn’t it. Say it’s mine.',
        choices: [
          { text: 'Neither. None of the heaps are rotting at all.', to: 'neither', trust: 1 },
          { text: 'Yours, Mistress Marl. Obviously.', to: 'yours' },
        ],
      },
      neither: { speaker: 'npc:hepzibah-marl', mood: 'afraid', text: 'Not rotting? (She plunges an arm into her heap, elbow-deep, and pulls out a cabbage leaf as fresh as the day she threw it in.) Forty years. Forty years, and I never once looked. Oh, Fennimore.', next: 'oldheap' },
      yours: { speaker: 'npc:hepzibah-marl', mood: 'happy', text: 'HA! Did you hear that, Fennimore Clay? Forty years! (Across the bough, Old Fennimore waves his stick and shouts something rude about nettles.)', next: 'oldheap' },
      oldheap: { speaker: 'npc:fennimore-clay', text: '(Across the bough, at the top of his voice.) THE OLD HEAP! The Circle’s Old Heap, under the cellars! It was laid down the last winter the tree slept! If anything in this city still rots, it’ll be that!', next: 'leaf' },
      leaf: { speaker: 'npc:hepzibah-marl', text: 'He’s right. Don’t tell him I said so. (She hands you the fresh cabbage leaf.) Take it down to the Old Heap and see if it’ll have it. Then come back and tell us both. Both of us. At the same time. Mind.', next: null },
    },
  },
  {
    id: 'dialogue:hedgewitch-fennimore', name: 'Old Fennimore Clay',
    entries: [{ when: stage('quest:hedgewitch-the-compost-debate', 'fennimore'), node: 'side' }, { node: 'start' }],
    nodes: {
      start: { speaker: 'npc:fennimore-clay', text: 'Nettles! She puts NETTLES in. In my day you put in what the tree dropped and you let the winter do the rest.', next: null },
      side: {
        speaker: 'npc:fennimore-clay', text: 'Rotting? No. Course it isn’t. Nothing’s rotted properly in thirty years. Hasn’t been a winter, has there. Not a proper one.',
        choices: [
          { text: 'What do you mean, a proper winter?', to: 'winter' },
          { text: 'She says her heap is better.', to: 'better' },
        ],
      },
      better: { speaker: 'npc:fennimore-clay', text: 'She would. She’s said it since the Concord was a lad. Ask me what I mean by winter, go on.', next: 'winter' },
      winter: {
        speaker: 'npc:fennimore-clay', text: 'When I was a boy the whole tree went to sleep every winter. Every leaf came down in one night, like a curtain. The heaps rotted under the snow, sweet as you like, and the tree woke up in spring and had a nice sensible stretch. It hasn’t slept since the crown broke.',
        choices: [{ text: 'The tree can’t rest. That’s why it can’t stop growing.', to: 'end', insight: 'hedgewitch_winter' }, { text: 'Thank you, Master Clay.', to: null }],
      },
      end: { speaker: 'npc:fennimore-clay', text: 'Course it can’t. Ever tried growing tired? Go and tell Hepzibah. She won’t listen to me, but she might listen to a witch with a glow on.', next: null },
    },
  },
  ...objs('bough-compost', 'quest:hedgewitch-the-compost-debate', 'heaps', [
    'Hepzibah’s heap: leaves, eggshells, nettles, turned every Tuesday. It is tidy. It is warm. It is not rotting at all. An apple core on top is as white as the day it was bitten.',
    'Fennimore’s heap: whatever the tree dropped, piled up and left. It is not rotting either. You find a leaf from last spring, still green.',
    'The Market heap, enormous, three years of cabbage. Not a bit of it has turned. The whole heap smells faintly of black sap.',
  ], 'A compost heap. Nothing in it is rotting.'),
  {
    id: 'dialogue:hedgewitch-thaddeus', name: 'Beadle Thaddeus Wort (bounties)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:thaddeus-wort', text: 'The Circle’s notice-bough. Bounties pinned up, paid out in coin or jam, depending on the budget. This week it’s coin. Don’t get used to it.',
        choices: [
          offer('quest:hedgewitch-bounty-cellar-beetles', 'The Cellar Beetles.', 'beetles'),
          offer('quest:hedgewitch-bounty-sap-well-bloomtraps', 'The Sap Well Bloomtraps.', 'traps'),
          bye,
        ],
      },
      beetles: { speaker: 'npc:thaddeus-wort', text: 'A Thorn Beetle nest under the old cider-press, eating the stairs. Six of them, and the stairs are paid for. Mostly.', next: null },
      traps: { speaker: 'npc:thaddeus-wort', text: 'Bloomtraps along the Sap Wells. They’ve had two buckets and a hat. The tapper was still under the hat, briefly.', next: null },
    },
  },
  // ---------- Sap Wells: A Sticky Situation, Gran Hasn't Said a Word
  {
    id: 'dialogue:hedgewitch-dunstan', name: 'Dunstan Treacle (A Sticky Situation)',
    entries: [{ when: stage('quest:hedgewitch-a-sticky-situation', 'dunstan'), node: 'free' }, { when: { questCompleted: 'quest:hedgewitch-a-sticky-situation' }, node: 'later' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:dunstan-treacle', text: '(A tapper with both hands, one knee and most of his beard set fast to a sap-tap.) Afternoon. No, don’t mind me. Three days. Mustn’t grumble.',
        choices: [offer('quest:hedgewitch-a-sticky-situation', 'You’re stuck to the tap.', 'stuck'), bye],
      },
      stuck: { speaker: 'npc:dunstan-treacle', text: 'Am I? I hadn’t noticed. (A pause.) Hot water does it. The tappers’ kettle’s on the far side of the Well. I’d fetch it myself, only.', next: null },
      free: {
        speaker: 'npc:dunstan-treacle', mood: 'happy', text: '(He is lying on his back, waggling his fingers at the sky.) Oh, that’s lovely. Oh, I can feel my knee. Three days. Funny thing, mind: it wasn’t the sap that held me. The tap was pulling, like something down the line was drinking. And I was very brave, wasn’t I.',
        choices: [{ text: 'Extremely brave.', to: 'brave', trust: 1 }, { text: 'Don’t lean on the tap again.', to: 'lean' }],
      },
      brave: { speaker: 'npc:dunstan-treacle', text: 'I was. I didn’t cry once. Well, once. Have a cake. Don’t lick it, it’s mostly tap.', next: null },
      lean: { speaker: 'npc:dunstan-treacle', text: 'No. No, I shan’t. (He immediately puts his hand on it, and has to be told.)', next: null },
      later: { speaker: 'npc:dunstan-treacle', text: 'Keeping well clear of the tap. Mostly.', next: null },
    },
  },
  {
    id: 'dialogue:obj-sap-well-kettle', name: 'The tappers’ kettle',
    entries: [{ when: stage('quest:hedgewitch-a-sticky-situation', 'kettle'), node: 'k' }, { node: 'after' }],
    nodes: {
      k: { speaker: 'narrator', text: 'A great dented copper kettle on a sap-fire, singing to itself. You lift it carefully. It is heavier than it looks, and hotter.', next: null },
      after: { speaker: 'narrator', text: 'The tappers’ kettle, back on its fire.', next: null },
    },
  },
  {
    id: 'dialogue:obj-treacle-tap', name: 'Dunstan’s tap',
    entries: [{ when: stage('quest:hedgewitch-a-sticky-situation', 'tap'), node: 'pour' }, { node: 'after' }],
    nodes: {
      pour: {
        speaker: 'narrator', text: 'You pour. The sap sighs and lets go, a little at a time: one hand, then the other hand, then the knee, then, with a sound like a boot coming out of mud, the beard.',
        choices: [{ text: '[Verdant] (Ask the tap nicely to let him go.)', to: 'ask', school: 'verdant' }, { text: '(Keep pouring.)', to: null }],
      },
      ask: { speaker: 'narrator', text: 'The tap gurgles, and the last of the sap slides off Dunstan like a cat off a lap. He falls over backwards, delighted.', next: null },
      after: { speaker: 'narrator', text: 'Dunstan’s tap, dripping innocently.', next: null },
    },
  },
  {
    id: 'dialogue:hedgewitch-ned', name: 'Ned Burdock (Gran Hasn’t Said a Word)',
    entries: [{ when: stage('quest:hedgewitch-gran-hasnt-said-a-word', 'ned'), node: 'tell' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ned-burdock', text: 'Are you a witch? A proper one? Is my Gran better? The Bramblewife says she’s better. She was dying and now she isn’t. But she hasn’t said a word. Not one, in a month.',
        choices: [offer('quest:hedgewitch-gran-hasnt-said-a-word', 'I’ll go and sit with her.', 'sit'), bye],
      },
      sit: { speaker: 'npc:ned-burdock', text: 'She’s outside the ward, in the sun. She used to tell me off for everything. I’d give anything to be told off.', next: null },
      tell: {
        speaker: 'npc:ned-burdock', text: 'Well? Is she better?',
        choices: [
          { text: 'She isn’t sick any more, Ned. But she isn’t well, either.', to: 'truth', trust: 1 },
          { text: 'She’s resting. Give her time.', to: 'time' },
        ],
      },
      truth: { speaker: 'npc:ned-burdock', mood: 'sad', text: 'I knew it. I knew it, ’cause she smells wrong. She used to smell of peppermints. (He wipes his nose on his sleeve.) Will you find out what’s wrong with her? Promise?', next: 'mints' },
      time: { speaker: 'npc:ned-burdock', text: 'That’s what the Bramblewife says. Everyone says that. All right.', next: 'mints' },
      mints: { speaker: 'npc:ned-burdock', text: 'She always had peppermints in her apron. A twist of them, for me, if I was good. The sweet-seller up on the Markets makes them. If she smelled them, maybe she’d remember. Will you? I haven’t any money. I’ve got a conker.', next: null },
    },
  },
  {
    id: 'dialogue:hedgewitch-gran', name: 'Gran Burdock',
    entries: [{ when: stage('quest:hedgewitch-gran-hasnt-said-a-word', 'gran'), node: 'sit' }, { node: 'smile' }],
    nodes: {
      sit: {
        speaker: 'npc:gran-burdock', text: '(An old woman in a shawl, in the sun outside the ward, smiling at a wall. She lets you hold her hand. It is cool, and the nails are green at the roots.)',
        choices: [
          { text: 'Ned misses you, Gran.', to: 'ned' },
          { text: '(Breathe in.) You smell of sap.', to: 'sap', insight: 'hedgewitch_sap_smell' },
          { text: '(Say nothing. Sit with her.)', to: 'sun' },
        ],
      },
      ned: { speaker: 'npc:gran-burdock', mood: 'hollow', text: '(At the name, her smile does not change. But her fingers close round yours, very slowly, the way a root closes round a stone.)', next: null },
      sap: { speaker: 'npc:gran-burdock', mood: 'hollow', text: '(Warm and green and sweet. Not peppermints. Not skin. She goes on smiling, and a single black bead runs down from the corner of one eye, like sap from a tap.)', next: null },
      sun: { speaker: 'narrator', text: 'You sit in the sun together for a long time. She does not move. You are not sure she is breathing, until you are sure she is not needing to.', next: null },
      smile: { speaker: 'npc:gran-burdock', mood: 'hollow', text: '(She smiles at the wall.)', next: null },
    },
  },
  // ---------- Root Cellars: Moving Day, What Is Thistledown For?
  {
    id: 'dialogue:hedgewitch-hester', name: 'Hester Mudlark (Moving Day)',
    entries: [{ when: stage('quest:hedgewitch-moving-day', 'hester'), node: 'settled' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:hester-mudlark', text: 'Eight children, one goat and a dresser my mother left me, and the roots are coming through the walls. Agnes, put that DOWN. Witch! Are you any good at carrying?',
        choices: [offer('quest:hedgewitch-moving-day', 'I can carry.', 'carry'), bye],
      },
      carry: { speaker: 'npc:hester-mudlark', text: 'Up a level, to my sister’s. The bed, the dresser, and Duchess. Duchess is the goat. Duchess does not like to be carried, so carry her like you mean it.', next: null },
      settled: {
        speaker: 'npc:hester-mudlark', text: 'There. All of us, all of it, and the goat’s eaten my sister’s curtains, so that’s her settled in. You went back down, didn’t you. To the door.',
        choices: [{ text: 'The roots closed over it. Gently.', to: 'gently', trust: 1 }, { text: 'It’s just a house.', to: 'house' }],
      },
      gently: { speaker: 'npc:hester-mudlark', mood: 'sad', text: 'Gently. Well. That’s something. My gran was born in that house. (She sniffs, once.) Agnes, the GOAT. Thank you, witch. Here, for your trouble.', next: 'count' },
      house: { speaker: 'npc:hester-mudlark', text: 'It is. It was. Agnes! Thank you, witch. Here, for your trouble.', next: 'count' },
      count: { speaker: 'npc:hester-mudlark', mood: 'afraid', text: '(She counts heads, out of habit.) Five, six, seven. Seven. AGNES? (A small Mudlark tugs her skirt.) “She took the bread knife, Mam. She said she was going back for the door.” Oh, that child. The roots. Witch, please.', next: null },
    },
  },
  ...objs('mudlark-bundle', 'quest:hedgewitch-moving-day', 'carry', [
    'The bed, which comes apart in four pieces, and then in a fifth piece nobody expected.',
    'The dresser that Hester’s mother left her. A drawer slides open on the stairs and three hundred buttons go everywhere. The children are delighted.',
    'Duchess the goat, who goes up the stairs on your shoulders like a queen in a procession, eating your hair.',
  ], 'Stacked up in the sister’s parlour, out of the roots’ way.'),
  {
    id: 'dialogue:obj-mudlark-door', name: 'The Mudlarks’ door', scope: 'party',
    entries: [{ when: stage('quest:hedgewitch-moving-day', 'door'), node: 'door' }, { node: 'after' }],
    nodes: {
      door: {
        speaker: 'npc:hester-mudlark', text: '(She is standing in the empty doorway with her hand on the frame.) Silly. It’s only a door. It’s only a house. Only every one of mine was born in it.',
        choices: [
          { text: '(Stand with her until she’s ready.)', to: 'ready' },
          { text: '[Verdant] (Ask the roots to close over it gently.)', to: 'gentle', school: 'verdant' },
        ],
      },
      ready: { speaker: 'narrator', text: 'After a while she takes her hand off the frame and walks up the stairs without looking back. Behind you, the roots slide across the doorway, slow as a blanket being drawn up.', next: null },
      gentle: { speaker: 'narrator', text: 'The roots come across the doorway as softly as a hand across a sleeping face. Hester watches it all the way, and then nods, and goes up.', next: null },
      after: { speaker: 'narrator', text: 'Smooth new bark where the Mudlarks’ door used to be.', next: null },
    },
  },
  {
    id: 'dialogue:hedgewitch-thistledown', name: 'Thistledown (What Is Thistledown For?)', scope: 'party',
    entries: [
      { when: stage('quest:hedgewitch-what-is-thistledown-for', 'answer'), node: 'answer' },
      { when: { questCompleted: 'quest:hedgewitch-what-is-thistledown-for' }, node: 'later' },
      { node: 'start' },
    ],
    nodes: {
      start: {
        speaker: 'npc:thistledown', text: '(A Bloomkin the height of your knee, a stalk with a great soft puff for a head. It looks up at you very seriously.) Hello. I woke up last week. I would like to know what I am for. Do you know what you are for?',
        choices: [offer('quest:hedgewitch-what-is-thistledown-for', 'Let’s find out together.', 'together'), bye],
      },
      together: { speaker: 'npc:thistledown', text: 'Good. I have made a list of things to look at. A lantern. A compost heap. A cradle. They are all for something. If I see what they are for, perhaps I will know.', next: null },
      answer: {
        speaker: 'npc:thistledown', text: 'The lantern is for seeing. The compost is for becoming something else. The cradle is for keeping someone safe while they grow. I am not any of those. What am I for?',
        choices: [
          { text: 'You’re for whatever you choose.', to: 'choose', effects: [{ setFlag: 'hedgewitch.thistledown_answer', value: 'choose' }] },
          { text: 'You’re for spreading. Thistledown goes where nothing grows yet.', to: 'spread', effects: [{ setFlag: 'hedgewitch.thistledown_answer', value: 'spread' }] },
          { text: 'I don’t know. I don’t know what I’m for, either.', to: 'dunno', trust: 1, effects: [{ setFlag: 'hedgewitch.thistledown_answer', value: 'unknown' }] },
        ],
      },
      choose: { speaker: 'npc:thistledown', text: 'That is a very big answer for a very small Bloomkin. I will think about it somewhere with more room. I will go and find somewhere with more room.', next: 'go' },
      spread: { speaker: 'npc:thistledown', mood: 'happy', text: 'Where nothing grows yet. Yes. Yes, I felt that, when you said it. In my fluff. I will go and look for where nothing grows yet.', next: 'go' },
      dunno: { speaker: 'npc:thistledown', text: 'Oh. (It considers you for a long time.) Then we will both have to keep looking. That is something to be for, I think. Looking.', next: 'go' },
      go: { speaker: 'narrator', text: 'Thistledown nods to you, gravely, and sets off along the Root Cellars, and up, and out, in no particular hurry, towards the edge of the world.', next: null },
      later: { speaker: 'npc:thistledown', text: 'I am still looking. It is going well.', next: null },
    },
  },
  ...objs('thistledown-sight', 'quest:hedgewitch-what-is-thistledown-for', 'sights', [
    'A lantern hung at a cellar crossroads. Thistledown stands under it a long while, its fluff lit gold. “It is for seeing,” it says. “But it cannot see anything itself.”',
    'A compost heap behind the cider-press. Thistledown pokes it with a leaf. “It is for becoming something else. It is not doing it.” It sounds worried for the heap.',
    'A cradle in a cellar window, empty, rocking a little in the draught. Thistledown does not say anything at all for some time. Then: “That one is for keeping. I understand that one.”',
  ], 'Thistledown has seen this one, and made a note.'),
  // ---------- Canopy Hollows: Kite Weather, the Topmost Leaf
  {
    id: 'dialogue:hedgewitch-hyssop', name: 'Hyssop Haws (Kite Weather)',
    entries: [{ when: stage('quest:hedgewitch-kite-weather', 'hyssop'), node: 'kites' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:hyssop-haws', text: 'They took my kite! Briarlings! They took three kites, and one was mine, and it was the BEST one, and it had a face on it!',
        choices: [offer('quest:hedgewitch-kite-weather', 'I’ll get them back.', 'back'), bye],
      },
      back: { speaker: 'npc:hyssop-haws', mood: 'angry', text: 'They’re up in the high boughs wearing them like capes. Hit them. Not too hard. Quite hard.', next: null },
      kites: {
        speaker: 'npc:hyssop-haws', mood: 'happy', text: 'My kite! With its face! There’s a bite out of its ear but that makes it look fierce. Are you entering the race?',
        choices: [{ text: 'Only if I can fly yours.', to: 'fly', trust: 1 }, { text: 'Too old for kites.', to: 'old' }],
      },
      fly: { speaker: 'narrator', text: 'Hyssop lets you hold the string for exactly four seconds. The kite with the bitten ear goes up and up, above the canopy, and for those four seconds you are winning.', next: null },
      old: { speaker: 'npc:hyssop-haws', text: 'Nobody’s too old for kites. Grandmother Sloe is a hundred and she still says she could beat me. Here. Have an apple.', next: null },
    },
  },
  ...objs('canopy-kite', 'quest:hedgewitch-kite-weather', 'kites', [
    'A blue kite with a long tail, tangled round three twigs and a sparrow. You free all four.',
    'A kite shaped like a fish, with a Briarling’s tooth-marks in the tail. It flaps happily in your hands like it knows it’s going home.',
    'A red kite with a face painted on it, scowling. One ear has been bitten clean off. It is clearly the best one.',
  ], 'Bare twigs where a kite used to be.'),
  {
    id: 'dialogue:hedgewitch-wenna-sloe', name: 'Grandmother Wenna Sloe (the Topmost Leaf)',
    entries: [{ when: stage('quest:hedgewitch-the-topmost-leaf', 'wenna'), node: 'saw' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:wenna-sloe', text: 'When I was a girl, I climbed to the topmost leaf on a dare. You could see the whole of Wildheart. I’d like to see it once more before I go, but the tree has grown past the clouds, and I’ve grown past climbing.',
        choices: [offer('quest:hedgewitch-the-topmost-leaf', 'I’ll climb it for you, and tell you everything.', 'climb'), bye],
      },
      climb: { speaker: 'npc:wenna-sloe', mood: 'happy', text: 'Everything, mind. Leave nothing out. Up past the kite-boughs and keep going. You’ll know it when you see it. It’s always the newest leaf.', next: null },
      saw: {
        speaker: 'npc:wenna-sloe', text: 'Well? Tell me. What could you see?',
        choices: [
          { text: 'All of Wildheart, and the Thornwilds, and past them the grey Rotwood.', to: 'wild' },
          { text: 'Far away, past everything, a willow in Morvane, weeping.', to: 'willow' },
        ],
      },
      wild: { speaker: 'npc:wenna-sloe', text: 'The Rotwood’s grey, is it. It was green when I was up there. Go on. What else?', next: 'willow' },
      willow: {
        speaker: 'npc:wenna-sloe', mood: 'sad', text: 'The willow. My grandmother told me about that willow. The Elder Tree’s daughter, a cutting, planted in Concordia the day the Concord was sworn. Weeping, you say. Poor thing. So far from its mother.',
        choices: [{ text: 'Thank you for sending me up.', to: 'end', trust: 1 }, { text: 'Maybe one day it can come home.', to: 'end' }],
      },
      end: { speaker: 'npc:wenna-sloe', mood: 'happy', text: 'Thank you, young witch. That’s me seen it twice. Not many can say that.', next: 'confess' },
      confess: {
        speaker: 'npc:wenna-sloe', text: '(She is quiet a moment.) Not even me, as it happens. I never got to the top. I got to a fork halfway up, and looked down, and sat there till dark. Then I came down and told everyone I’d touched it. Ninety years I’ve been telling them.',
        choices: [
          { text: 'You could still see the willow from the fork.', to: 'fork' },
          { text: 'Ninety years is a long time to keep a lie.', to: 'lie' },
        ],
      },
      fork: { speaker: 'npc:wenna-sloe', mood: 'happy', text: 'I could! That’s the joke of it. The best view in Wildheart, and I was ashamed of it. Go up to the fork and cut my initials there, W. S., where I really stopped. I’d like one true thing up that tree with my name on.', next: null },
      lie: { speaker: 'npc:wenna-sloe', mood: 'sad', text: 'It got heavier every year, and the tree got taller, so the lie got bigger without my doing a thing. Go up to the fork and cut my initials, W. S., where I really stopped. I’d like to put it down before I go.', next: null },
    },
  },
  {
    id: 'dialogue:obj-topmost-leaf', name: 'The topmost leaf', scope: 'party',
    entries: [{ when: stage('quest:hedgewitch-the-topmost-leaf', 'leaf'), node: 'leaf' }, { node: 'after' }],
    nodes: {
      leaf: { speaker: 'narrator', text: 'The topmost leaf of the Elder Tree, small and new and pale green, turning in a wind that has come a long way. Below you the clouds. Below them, all of Wildheart.', next: 'far' },
      far: { speaker: 'narrator', text: 'And far off, past the Thorn Gate, past the edge of everything, a single willow on a green hill in Morvane, weeping black into a wood. Your half-stone gives one small sad note, like recognising a face.', next: null },
      after: { speaker: 'narrator', text: 'The topmost leaf. A newer one has already grown above it.', next: null },
    },
  },

  // ======================= ACT II
  {
    id: 'dialogue:hedgewitch-teasel', name: 'C-1 the Hedge House: Teasel Gammon', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:teasel-gammon', text: 'Leaf-mould on your boots and a Circle knot in your hair. Rootholme? Truly? Come in, come in, mind the seedlings. Thirty years we’ve been stuck this side of the arch, keeping a little bit of Wildheart going in pots.',
        choices: [
          { text: 'I need to find the Verdant Sentinel.', to: 'willow', quest: true },
          { text: 'Mother Yarrow sends her love. Probably.', to: 'yarrow' },
        ],
      },
      yarrow: { speaker: 'npc:teasel-gammon', mood: 'happy', text: 'Yarrow! Is she still talking to that tree? Course she is. She’ll be talking to it at her own funeral. Now then.', next: 'willow' },
      willow: { speaker: 'npc:teasel-gammon', text: 'The Weeping Willow, at Stag’s Rest in the Gloamwood. It was planted the day the Concord was sworn, and it’s weeping black into the whole wood. If you want to know more, ask Nan Briar at the cottage. Take her something for the kettle. She bites if you don’t.', next: null },
    },
  },
  {
    id: 'dialogue:hook-hedgewitch-nanbriar', name: 'Hook: Nan Briar for the Hedgewitch', scope: 'party',
    // only while C-1 or C-3 wants her, and never in the way of Tears of the Stag
    entries: [
      { when: { all: [stage('quest:hedgewitch-thornhollow', 'nan'), { not: { questActive: 'quest:cc-tears' } }] }, node: 'start' },
      { when: { all: [stage('quest:hedgewitch-the-weeping-willow', 'tell'), { not: { questActive: 'quest:cc-tears' } }] }, node: 'willow' },
    ],
    nodes: {
      start: {
        speaker: 'npc:nanbriar', text: 'Yarrow’s? You’re one of Yarrow’s. I can tell by the way you looked at my kettle like it might have feelings. How is that girl?',
        choices: [
          { text: 'Girl? She’s ancient.', to: 'girl' },
          { text: 'She talks to the tree all day.', to: 'tree' },
          { text: '(Hand her the Lantern Row mint.)', to: 'mint', when: { flag: 'hedgewitch.nan_mint' }, trust: 1 },
        ],
      },
      mint: { speaker: 'npc:nanbriar', mood: 'happy', text: '(She sniffs it, and her whole face changes.) Lantern Row. There were cats asleep on this. That Gammon boy’s kept it going in a pot, hasn’t he? (It goes straight in the kettle.) You can stay.', next: 'pruned' },
      girl: { speaker: 'npc:nanbriar', text: 'She was a slip of a thing when I last saw her, up a ladder in the Elder Tree, telling it a story about a goose. Ancient. Well. I’m older, and don’t you dare ask by how much.', next: 'pruned' },
      tree: { speaker: 'npc:nanbriar', mood: 'happy', text: 'Still? Good girl. Somebody ought to. It used to answer me, you know. In my day. Now then.', next: 'pruned' },
      pruned: {
        speaker: 'npc:nanbriar', text: 'The Willow. I planted its mother’s cutting with my own hands, three Turnings back, for the Concordant. It’s weeping because it can’t stop. Same as yours at home, I shouldn’t wonder. What did your Circle do about it?',
        choices: [
          { text: 'We pruned it back.', to: 'cut', when: { flag: 'hedgewitch.pruning', value: 'prune' }, effects: [{ trust: 'npc:nanbriar', set: 2 }] },
          { text: 'We let it grow.', to: 'grew', when: { flag: 'hedgewitch.pruning', value: 'grow' } },
          { text: 'I sang it a winter.', to: 'winter', when: { flag: 'hedgewitch.pruning', value: 'winter' } },
        ],
      },
      cut: { speaker: 'npc:nanbriar', text: 'Good. A gardener cuts. Nobody likes it, and that’s how you know you’re a gardener. Go on to the Willow. Talk to it before you cut it. It was always a talker.', next: null },
      grew: { speaker: 'npc:nanbriar', text: 'Soft. Soft-hearted, like Yarrow. Well, the Bloomkin will thank you, and the streets won’t. Go on to the Willow, and don’t be soft with that.', next: null },
      winter: { speaker: 'npc:nanbriar', mood: 'sad', text: '(She puts her cup down.) A winter. Nobody’s done that since the crown broke. You’ll want to sing that to the Willow, child. It’ll know the tune.', next: null },
      // C-3: telling Nan the Willow is at rest
      willow: { speaker: 'npc:nanbriar', text: '(She is at the door before you reach it, with Parson the cat under one arm.) It stopped. I felt it in my knees an hour ago, like weather turning. Well? Come in and tell me, and don’t you dare make it pretty.', next: 'told' },
      told: {
        speaker: 'narrator', text: 'You tell her: the black, the weeping, the fight in the roots, and the Willow at the end, asking whether it might finally let its leaves fall.',
        choices: [
          { text: 'It asked if it could. I said yes.', to: 'yes' },
          { text: 'It dropped every leaf at once. It looked relieved.', to: 'relieved' },
          { text: '[Verdant] I sang it the winter. It knew the tune.', to: 'sung', school: 'verdant', when: { flag: 'hedgewitch.pruning', value: 'winter' }, trust: 1, trustNpc: 'npc:nanbriar' },
        ],
      },
      yes: { speaker: 'npc:nanbriar', text: '(Very quietly.) Good. Thirty years it held on, because nobody came to tell it that it could stop. Nobody tells trees anything. That’s why your Yarrow is worth ten of any Circle.', next: 'ostara' },
      relieved: { speaker: 'npc:nanbriar', text: 'Relieved. Yes. Trees do. You’d look relieved too, if you’d been holding your breath since the Concord was sworn.', next: 'ostara' },
      sung: { speaker: 'npc:nanbriar', mood: 'sad', text: '(She puts the cat down.) Oh, child. I sang it that tune myself, the night after the gates shut, so it wouldn’t be frightened of the dark. It was too frightened to listen. It listened to you.', next: 'ostara' },
      ostara: {
        speaker: 'npc:nanbriar', text: 'Now, then. There’s a woman in my bog. Sticky hands, lovely bows, sings at the deep water every night. Jennet Wadeley’s seen her, and Jennet doesn’t frighten. Don’t tell me she’s one of yours.',
        choices: [{ text: 'She’s one of ours.', to: 'ours', quest: true }, { text: 'Her name is Ostara. She’s a healer.', to: 'ours', quest: true }],
      },
      ours: { speaker: 'npc:nanbriar', mood: 'angry', text: 'Course she is. Go and ask Jennet at her hut, by the bramble. Take a spear. Take two.', next: null },
    },
  },
  {
    id: 'dialogue:hedgewitch-thistledown-thornhollow', name: 'Thistledown at the Greenbriar Nursery',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:thistledown-thornhollow', mood: 'happy', text: 'It is you. I walked a very long way. I came through the gate behind you, very quietly, because I am mostly fluff. They let me sleep in the nursery here. Everything here grows in pots.',
        choices: [
          { text: 'Have you found out what you’re for?', to: 'for' },
          { text: 'I’m glad you came.', to: 'glad' },
        ],
      },
      for: { speaker: 'npc:thistledown-thornhollow', text: 'Not yet. But there is a great deal of Concordia where nothing grows. I am keeping a list.', next: null },
      glad: { speaker: 'npc:thistledown-thornhollow', text: 'So am I. I think. I am still learning the feelings. That one is warm.', next: null },
    },
  },
  ...objs('hedgewitch-willow-root', 'quest:hedgewitch-the-willows-roots', 'roots', [
    'A root as thick as a barrel, breaking up out of the Gloamwood floor and weeping black from every crack. You touch it, and your half-stone gives a little cry, as if it has bumped into family.',
    'Here the Willow’s root has grown round an old Wayfarer’s waymark and swallowed it. The bark on this root is the same bark as the Elder Tree’s. You would know it anywhere. You grew up inside it.',
    'The roots all bend one way, like hair in a current, towards a hill with a great weeping shape on top of it. The black runs down them like rain down a window.',
  ], 'The Willow’s root, quiet now, and only damp.'),
  {
    id: 'dialogue:obj-hedgewitch-sap-pail-1', name: 'C-4 the first pail',
    entries: [{ when: stage('quest:hedgewitch-the-bramblewifes-graft', 'pails'), node: 'now' }, { node: 'after' }],
    nodes: {
      now: { speaker: 'narrator', text: 'An empty sap-pail at the edge of the bog, black to the brim-mark. Someone has tied a ribbon round its handle in a neat bow. Ostara always did tie a lovely bow.', next: null },
      after: { speaker: 'narrator', text: 'An empty pail with a ribbon on it.', next: null },
    },
  },
  {
    id: 'dialogue:obj-hedgewitch-sap-pail-2', name: 'C-4 the second pail',
    entries: [{ when: stage('quest:hedgewitch-the-bramblewifes-graft', 'pails'), node: 'now' }, { node: 'after' }],
    nodes: {
      now: { speaker: 'narrator', text: 'A second pail, half full, beside a channel cut through the bramble to the deep bog. The black sap has run down the channel. Something at the end of it has drunk every drop and wants more.', next: null },
      after: { speaker: 'narrator', text: 'A half-empty pail by a dry channel.', next: null },
    },
  },
  {
    id: 'dialogue:obj-hedgewitch-sap-pail-3', name: 'C-4 the third pail',
    entries: [{ when: stage('quest:hedgewitch-the-bramblewifes-graft', 'pails'), node: 'now' }, { node: 'after' }],
    nodes: {
      now: { speaker: 'narrator', text: 'The third pail is labelled in sticky green ink: “For the Sovereign, with love. It is always hungry, poor lamb. So is everything.”', next: null },
      after: { speaker: 'narrator', text: 'A labelled pail. The ink has run.', next: null },
    },
  },
  {
    id: 'dialogue:obj-hedgewitch-seed-pot', name: 'C-4 the stolen seed', scope: 'party',
    entries: [{ when: stage('quest:hedgewitch-the-bramblewifes-graft', 'seed'), node: 'pot' }, { node: 'after' }],
    nodes: {
      pot: { speaker: 'narrator', text: 'A clay planting-pot under a bell of glass, and in it, in black soil, a seed the size of your fist: the Elder Tree’s own seed, out of the vault. A fine grey thread of slime runs from the pot to the deep bog.', next: 'note' },
      note: { speaker: 'npc:ostara', text: '(A note tucked under the glass, in her hand.) “Love, if it’s you: the Sovereign eats and eats and never dies. The tree grows and grows and never dies. Put them together and nothing ends, ever. Isn’t that kind? Don’t be cross. O.”', next: null },
      after: { speaker: 'narrator', text: 'An empty pot under a glass bell. The seed is gone.', next: null },
    },
  },
  {
    id: 'dialogue:hedgewitch-sovereign-bog', name: 'C-5 the Ooze Sovereign’s bog', scope: 'party',
    entries: [{ when: { flag: 'hedgewitch.pruning', value: 'grow' }, node: 'bloomkin' }, { node: 'bog' }],
    nodes: {
      bog: { speaker: 'narrator', text: 'The deepest part of Briar Hollow, where the bog is warm and the bubbles are slow. The Ooze Sovereign rises out of it, enormous and calm, and inside its body, like a fly in jelly, a stone figure sits cross-legged. It settles into a fighting stance. It is very good at it.', next: null },
      bloomkin: { speaker: 'narrator', text: 'Behind you, rustling, a band of Bloomkin come up out of the bramble: the ones who woke in the growth you let them keep, with Thistledown at the front holding a twig like a sword. They have walked all the way from Rootholme. They have come to help.', next: 'bog' },
    },
  },
  // ---------- featured bearers (hooks on the bearer NPCs)
  {
    id: 'dialogue:hedgewitch-featured-monk', name: 'Featured: The Abbot in the Ooze', scope: 'party',
    entries: [
      { when: stage('quest:hedgewitch-the-abbot-in-the-ooze', 'back'), node: 'back' },
      { when: { all: [stage('quest:hedgewitch-the-abbot-in-the-ooze', 'cairn'), { not: { flag: 'hedgewitch.sefu_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-monk', text: 'The Ooze Sovereign ate the Stone Abbot. I mean to bring him out whole, as he went in. I am building him a cairn at Thornhollow, so he has somewhere to come back to. What do we owe the ones we bring back, witch?',
        choices: [
          { text: 'A place to rest. I’ll help with the cairn.', to: null, quest: true, effects: [{ setFlag: 'hedgewitch.sefu_asked', value: true }] },
          { text: 'How much bringing-back is too much, Brother?', to: 'much', quest: true, effects: [{ setFlag: 'hedgewitch.sefu_asked', value: true }] },
        ],
      },
      much: { speaker: 'npc:bearer-monk', text: '(He thinks about it for a long, steady breath.) A good question. A Hedgewitch question. Help me with the stones, and we will both think about it.', next: null },
      back: {
        speaker: 'npc:bearer-monk', text: 'The cairn stands. Whatever is left of the Abbot when we are done, he will have a place. You asked how much is too much. I think the answer is: when they can no longer choose to stay. When we go to the Heart, I stand with you.',
        effects: [{ setFlag: 'hedgewitch.sefu_thanked', value: true }],
        choices: [{ text: 'That’s Ostara’s whole mistake, in one sentence.', to: null }, { text: 'Thank you, Brother.', to: null }],
      },
    },
  },
  {
    id: 'dialogue:obj-hedgewitch-abbot-cairn', name: 'The Stone Abbot’s cairn', scope: 'party',
    entries: [
      { when: { all: [stage('quest:hedgewitch-the-abbot-in-the-ooze', 'cairn'), { partyHasClass: 'monk' }] }, node: 'player' },
      { when: stage('quest:hedgewitch-the-abbot-in-the-ooze', 'cairn'), node: 'stones' },
      { node: 'after' },
    ],
    nodes: {
      stones: { speaker: 'narrator', text: 'Behind the Greenbriar Nursery, the Monk bearer is setting flat stones one on another without a sound. You find the right stones by the brook. He puts each one where it wants to go. Neither of you speaks until the cairn is as tall as a kneeling man.', next: null },
      player: { speaker: 'narrator', text: 'You and your Monk companion raise a cairn for the Stone Abbot behind the Greenbriar Nursery, one flat stone at a time, without a word, until it is as tall as a kneeling man.', next: null },
      after: { speaker: 'narrator', text: 'A cairn of flat stones, as tall as a kneeling man.', next: null },
    },
  },
  {
    id: 'dialogue:hedgewitch-featured-bard', name: 'Featured: The Willow’s Song', scope: 'party',
    entries: [
      { when: stage('quest:hedgewitch-the-willows-song', 'back'), node: 'back' },
      { when: { all: [stage('quest:hedgewitch-the-willows-song', 'boughs'), { not: { flag: 'hedgewitch.lark_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-bard', text: 'The Willow at Stag’s Rest is singing. Not well, not in tune, but it’s the oldest song in Concordia and nobody has ever written it down. Three verses, in three boughs. You talk to trees, don’t you? Hedgewitches talk to trees.',
        choices: [{ text: 'I’ll find the boughs. You bring the ink.', to: null, quest: true, effects: [{ setFlag: 'hedgewitch.lark_asked', value: true }] }],
      },
      back: {
        speaker: 'npc:bearer-bard', mood: 'happy', text: 'All three verses! It’s a lullaby. Did you know? The oldest song in Concordia is a lullaby, for a tree, from its mother. I’ve wept on the page twice. When we go to the Heart I’ll be singing it beside you.',
        effects: [{ setFlag: 'hedgewitch.lark_thanked', value: true }], next: null,
      },
    },
  },
  ...objs('hedgewitch-song-bough', 'quest:hedgewitch-the-willows-song', 'boughs', [
    'A low bough of the Willow, humming. You lay your hand on it, and the hum shapes into words, very old and very slow: “Sleep, little cutting, so far from the tree.”',
    'A bough that dips into the stream, and the stream carries the second verse: “The roots will remember the way you came home.” Somewhere behind you, a quill is scratching very fast.',
    'The highest bough, almost too faint to hear: “And spring, when it comes, will come back for you too.” The Willow’s song stops there, as if it has forgotten the rest, or never needed it.',
  ], 'A quiet bough of the Willow. The song has been written down.'),
  // ---------- C-6 A Letter from Yarrow
  {
    id: 'dialogue:obj-hedgewitch-yarrow-leaf', name: 'C-6 a letter from Yarrow', scope: 'party',
    entries: [{ when: stage('quest:hedgewitch-a-letter-from-yarrow', 'leaf'), node: 'leaf' }, { node: 'after' }],
    nodes: {
      leaf: { speaker: 'narrator', text: 'A leaf of the Elder Tree the size of a dinner plate, caught against the foot of the Verdant arch. It is covered on both sides in Mother Yarrow’s handwriting, the hedge-in-a-high-wind kind. The tree must have carried it.', next: 'letter' },
      letter: {
        speaker: YA, text: '“Dear, the tree is sulking, because you have gone. I have told it you will be back. The Circle is arguing, the cats are well, and Tibbs is a cat. Whatever you find at the Heart, remember: everything needs a winter. Even the crown. Eat something green. Y.”',
        choices: [
          { text: '(Fold the leaf away.)', to: null, quest: true, effects: [{ setFlag: 'hedgewitch.yarrow_letter', value: true }] },
          { text: '(Read the postscript, in the very smallest writing.)', to: 'ps', when: { flag: 'hedgewitch.yarrow_devotable' } },
        ],
      },
      ps: { speaker: YA, text: '“P.S. It said your name this morning. Clear as a bell. I nearly fell out of the bower.”', effects: [{ setFlag: 'hedgewitch.yarrow_letter', value: true }], next: null },
      after: { speaker: 'narrator', text: 'The Verdant arch, wound with briar. A few small leaves are caught in it.', next: null },
    },
  },
];

export default dialogues;
