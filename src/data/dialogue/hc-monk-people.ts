/**
 * Hollow Crown, MONK: Stonecloister people (general talk), the eight side quests, the mentor thread and the
 * bounties, plus the Act II class-thread and featured-bearer scenes. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, DialogueNode, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const offer = (q: Q, text: string, to: string, extra?: NarrativeCondition): DialogueChoice =>
  ({ text, to, quest: true, when: extra ? { all: [fresh(q), extra] } : fresh(q), effects: [{ startQuest: q }] });
const bye: DialogueChoice = { text: 'Farewell.', to: null, tag: 'leave' };
const NIGHT: NarrativeCondition = { hour: [21, 4] };
const ST = 'npc:shirin-tal' as const;

/** C-6: Shirin's move and the Stone Court, shared by the Vespers and the Climber-runner versions. */
const LETTER: Record<string, DialogueNode> = {
  letter: { speaker: ST, text: '“The cloister is quiet. Kell has not replied. I enclose my move: white stone, the fourth point from the corner. If you look at the board carefully you will see that it is not a legal move. Play it anyway. They never check. S.”', next: 'court' },
  court: {
    speaker: 'narrator', text: 'A stones move, by post, across half the world, and a cheating one. Later, at the Stone Court, your Summit half and the Brawler’s Pit half ring together like two bowls struck at once.',
    choices: [
      { text: '(Talk to the Brawler bearer.)', to: 'kat', when: { not: { partyHasClass: 'brawler' } } },
      { text: '(Turn to your Brawler, whose half is ringing with yours.)', to: 'coop', when: { partyHasClass: 'brawler' } },
    ],
  },
  kat: {
    speaker: 'npc:bearer-brawler', mood: 'happy', text: 'Listen to that! Summit and Pit. Right, monk. Gloves on. One round. I want to know what all that standing still is for.',
    choices: [
      { text: '(Spar with her.)', to: 'spar', effects: [{ setFlag: 'monk.shirin_letter', value: true }, { setFlag: 'monk.sparred', value: true }] },
      { text: '(Bow, and decline.)', to: 'decline', effects: [{ setFlag: 'monk.shirin_letter', value: true }] },
    ],
  },
  coop: {
    speaker: 'narrator', text: 'Summit and Pit, ringing together. Your Brawler is already holding up a pair of gloves, hopefully.',
    choices: [
      { text: '(Spar.)', to: 'spar', effects: [{ setFlag: 'monk.shirin_letter', value: true }, { setFlag: 'monk.sparred', value: true }] },
      { text: '(Bow, and decline.)', to: 'decline', effects: [{ setFlag: 'monk.shirin_letter', value: true }] },
    ],
  },
  spar: { speaker: 'narrator', text: 'She comes at you like a door slamming. You stand still, and she goes past you, and comes again, and goes past again. After a minute she is laughing so hard she has to sit down. Nobody has landed a blow. Everybody had a lovely time.', next: null },
  decline: { speaker: 'narrator', text: 'You bow. The Brawler looks at you, then bows back, clumsily, gloves and all. Fine, she says. Next time. There is always a next time. She seems entirely delighted by this.', next: null },
};

const dialogues: DialogueDef[] = [
  // ---------- Shirin (general + mentor thread)
  {
    id: 'dialogue:monk-shirin', name: 'Shirin (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: ST, text: 'Sit. Tea? It is very good tea. I cheated a pilgrim out of it.',
        choices: [
          offer('quest:monk-stones-with-the-abbess', 'Will you play me at stones, Mother?', 'stones', { trust: ST, value: 'friendly' }),
          offer('quest:monk-the-thirtieth-move', 'Who are your letters to, every winter?', 'move', { trust: ST, value: 'trusted' }),
          { text: 'What does the Fist school teach, really?', to: 'fist' },
          { text: 'How did you become Abbess, Mother?', to: 'abbess', when: { trust: ST, value: 'trusted' } },
          bye,
        ],
      },
      abbess: { speaker: ST, mood: 'happy', text: 'At stones. (She sips her tea.) The old Abbot could not choose between me and Brother Halvard, so he had us play for it. Best of seven. I cheated in every game. Halvard knew. He let me.', next: 'abbess2' },
      abbess2: {
        speaker: ST, text: 'Afterwards I asked him why. He said, “Because you want to look after them more than I do, and you are better at lying to children about where the sweets are.” Then he went to run the kitchen, and he has been happy ever since.',
        choices: [
          { text: 'Does Brother Halvard still know you cheat?', to: 'abbess3' },
          { text: 'He was right about you.', to: 'abbess4', trust: 1 },
        ],
      },
      abbess3: { speaker: ST, text: 'Everybody knows I cheat. That is the whole secret of cheating, little one. If everyone knows, it becomes a kind of honesty. Drink your tea.', next: null },
      abbess4: { speaker: ST, mood: 'sad', text: '(She is quiet a moment.) About the children, yes. About the sweets, also yes. About me being good at it, I am still deciding, thirty years on. Drink your tea.', next: null },
      stones: { speaker: ST, mood: 'happy', text: 'At last. Sit at the board. I warn you that I am going to cheat, and that I am going to enjoy it. If you can catch me three times in one game, I will concede, and I have never once conceded.', next: null },
      move: { speaker: ST, text: 'To Doran Kell. A game of stones by messenger, one move a year, for thirty years. He has never replied. This year’s move is ready. Would you carry it up to his throne? I think he should have it in person, even if he is not in.', next: null },
      fist: { speaker: ST, text: 'That the self is the only weapon you cannot drop. Which means it is also the only weapon you cannot put down when you are tired. We teach the putting down. Nobody listens to that part.', next: 'start' },
    },
  },
  {
    id: 'dialogue:obj-shirin-stones-board', name: 'Mentor: the stones game', scope: 'party',
    entries: [{ when: stage('quest:monk-stones-with-the-abbess', 'game'), node: 'set' }, { node: 'plain' }],
    nodes: {
      set: { speaker: ST, text: '(She sets out the board, pours two cups of tea and puts the pot down very carefully exactly beside her elbow.) White to begin. You are white. I am everything else.', next: 'm1' },
      m1: {
        speaker: 'narrator', text: 'She plays. Something about the board is different from a moment ago.',
        choices: [
          { text: '(Watch her left sleeve.)', to: 'c1' },
          { text: '(Watch the board.)', to: 'x1' },
        ],
      },
      x1: { speaker: ST, mood: 'happy', text: 'You are watching the board. The board is not where the game is. (There are two more of her stones on it than there were.) Your move.', next: 'm1' },
      c1: { speaker: 'narrator', text: 'A black stone slides out of her left sleeve onto the board, gently, like a cat getting off a lap. You put your finger on it. “Goodness,” says the Abbess. “So there is.” One.', next: 'm2' },
      m2: {
        speaker: 'narrator', text: 'She sips her tea. The game goes on. She is winning, somehow, again.',
        choices: [
          { text: '(Watch the teapot.)', to: 'c2' },
          { text: '(Watch her face.)', to: 'x2' },
        ],
      },
      x2: { speaker: ST, text: 'My face is the one thing in this room that is not cheating. (When you look down there is a stone on the board where there was no stone.) Your move.', next: 'm2' },
      c2: { speaker: 'narrator', text: 'You lift the teapot lid. Inside, nestled in the tea leaves, three black stones, perfectly dry. The Abbess looks out of the window as though she has just noticed a bird. Two.', next: 'm3' },
      m3: {
        speaker: 'narrator', text: 'One move left in the game. She has both hands flat on the table, in plain sight, which is the most suspicious thing she has done all evening.',
        choices: [
          { text: '(Look under the table.)', to: 'c3' },
          { text: '(Watch her hands.)', to: 'x3' },
        ],
      },
      x3: { speaker: ST, mood: 'happy', text: 'They are only hands. Very old ones. (A stone moves on the board by itself. You did not see how.) Your move.', next: 'm3' },
      c3: { speaker: 'narrator', text: 'Under the table, her bare toes are carefully nudging a black stone up through a knot-hole in the board. You catch her foot. She laughs out loud, a real laugh, the first you have heard from her since the Bell. Three.', next: 'won' },
      won: { speaker: ST, text: 'I concede. (She tips over her stones, all forty-one of them, including the ones she was not supposed to have.) I have never conceded. That deserves a true story. Come and sit with me afterwards.', effects: [{ setFlag: 'monk.stones_won', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The Abbess’s stones board, a little worn at one corner, where a knot-hole has been very carefully widened.', next: null },
    },
  },
  {
    id: 'dialogue:monk-shirin-stones', name: 'Mentor: Stones with the Abbess', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: ST, text: 'A true story, for a won game. You know the one they tell. Doran Kell, champion of Fist, on the road to Concordia in C. 1012 to be crowned, and the gates shut in front of him, and he was robbed.', next: 'truth' },
      truth: {
        speaker: ST, mood: 'sad', text: 'I was on that road. I was his second. We heard the gates begin to close, far ahead, like a great door swinging. He could have run for them. He turned round and ran home instead, before they closed. He has called it a robbery for thirty years because the other word was harder.',
        choices: [{ text: 'He turned back.', to: 'end', insight: 'kell_turned_back', trust: 1 }],
      },
      end: { speaker: ST, text: 'He turned back. And I let him call it a robbery, because I loved him, and because I was frightened too. Keep it. Use it if you must. Gently, if you can.', next: null },
    },
  },
  {
    id: 'dialogue:obj-kell-throne-arm', name: 'Mentor: the Mountain King’s throne', scope: 'party',
    entries: [{ when: stage('quest:monk-the-thirtieth-move', 'throne'), node: 'throne' }, { node: 'plain' }],
    nodes: {
      throne: { speaker: 'narrator', text: 'A throne carved straight out of the summit, empty, its seat worn into the shape of a large man sitting very still for a very long time. You lay Shirin’s move on its arm: a white stone, wrapped in a note.', next: 'replies' },
      replies: { speaker: 'narrator', text: 'Scratched into the stone of the arm, in rows, with something sharp: thirty moves. One for every year. The last is fresh, the dust still in it. It answers the move you have just put down, which Kell cannot possibly have seen. Nobody ever carried any of them down the mountain.', next: null },
      plain: { speaker: 'narrator', text: 'The Mountain King’s empty throne, and thirty moves scratched into its arm.', next: null },
    },
  },
  {
    id: 'dialogue:monk-shirin-thirtieth', name: 'Mentor: The Thirtieth Move', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: ST, text: 'Thirty? He answered thirty? (She sets up the board from memory, while you read them out, and plays every one.) Oh, you old cheat. He has been cheating. He has been cheating for thirty years, and it is beautiful.', next: 'end' },
      end: { speaker: ST, mood: 'sad', text: 'He answered every one, and left them on his chair, and never sent a single move down. Of course he didn’t. He would have had to come down with them. (She is laughing and crying at once.) Thank you, child. You have given me back my game.', effects: [{ trust: ST, delta: 1 }], next: null },
    },
  },
  // ---------- Kestrel (general)
  {
    id: 'dialogue:monk-kestrel', name: 'Kestrel (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:kestrel', mood: 'happy', text: 'Little one. Have you eaten? You haven’t. You never do. Here, a sweet. It’s the King’s. He won’t miss it.',
        choices: [
          { text: 'What is the King like, Kestrel?', to: 'king' },
          { text: 'Do you remember the basket?', to: 'basket' },
          bye,
        ],
      },
      king: { speaker: 'npc:kestrel', text: 'Big. Tired. He sits very still. You’d like him. He reminds me of you, actually, except you don’t frighten the goats.', next: null },
      basket: { speaker: 'npc:kestrel', mood: 'sad', text: 'I remember the cold. I remember holding on to somebody’s foot. Mother says it was yours. I believe her about almost everything.', next: null },
    },
  },
  // ---------- the Thousand Stairs: Gelek, Yuen, Pema
  {
    id: 'dialogue:monk-gelek', name: 'Night-Porter Gelek Amble (bounties)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:gelek-amble', text: 'Night-porter. Day-porter too, now half the porters are up the mountain. Bounties are on the post. Do not play stones with the Abbess.',
        choices: [
          offer('quest:monk-bounty-terrace-goats', 'The Terrace Goats.', 'goats'),
          offer('quest:monk-bounty-great-stone-slime', 'The Great Stone Slime?', 'slime'),
          bye,
        ],
      },
      goats: { speaker: 'npc:gelek-amble', text: 'Hollow goats on the Prayer Terraces. Black-eyed, leaping, knocking novices off the edges. Six of them. The cloister pays by the goat.', next: null },
      slime: { speaker: 'npc:gelek-amble', text: 'In the Cloud Kitchen cellar. Halvard says it is a Stone Slime. I say it is a heap of rice that has learned to sulk. Either way it ate a ladder.', next: null },
    },
  },
  {
    id: 'dialogue:monk-yuen', name: 'Auntie Yuen (Auntie Yuen’s Last Pot)',
    entries: [{ when: stage('quest:monk-auntie-yuens-last-pot', 'yuen'), node: 'customers' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:auntie-yuen', text: 'Sixty years I have kept this stall. Sixty years, a pot on the boil from dawn to dark. And now nobody comes. They have all gone up the mountain to look at a man sitting on a step. I am not closing.',
        choices: [offer('quest:monk-auntie-yuens-last-pot', 'I’ll bring you customers, Auntie.', 'bring'), bye],
      },
      bring: { speaker: 'npc:auntie-yuen', text: 'One from each landing above mine. Not the porter. The porter drinks it too fast. Off you go. And tell them it is very good tea, because it is.', next: null },
      customers: {
        speaker: 'npc:auntie-yuen', mood: 'happy', text: '(Three pilgrims sit on her bench, being told off for slouching.) Customers! Look at them. Terrible posture, all three. Sit up. Drink. You. More sugar. You look like a person who needs more sugar.',
        choices: [{ text: 'Is it the last pot, Auntie?', to: 'last' }, { text: 'It is very good tea.', to: 'good', trust: 1 }],
      },
      last: { speaker: 'npc:auntie-yuen', text: 'Last pot? This pot has been on the boil since my mother lit it. I will carry it to Concordia myself, if that is where everybody is going. Somebody there will want tea. Somebody always wants tea.', next: 'bush' },
      good: { speaker: 'npc:auntie-yuen', mood: 'happy', text: 'Of course it is very good tea. Here. For the climb. If you are going wherever everybody is going, I will see you there with the pot.', next: 'bush' },
      bush: { speaker: 'npc:auntie-yuen', text: 'Only a pot that is going on a journey wants fresh leaves. From my mother’s bush, at the very foot of the Stairs. She planted it the year she lit the pot. I cannot do the Stairs down and back in a day any more. You can. You are young and you have nothing better to do.', next: null },
    },
  },
  {
    id: 'dialogue:obj-landing-customer-3', name: 'Auntie Yuen’s customers: the last landing',
    entries: [{ node: 'c' }],
    nodes: { c: { speaker: 'narrator', text: 'A pilgrim on the seventh landing, sitting with her pack on her knees, staring up the mountain. You mention Auntie Yuen’s tea. She has heard of Auntie Yuen’s tea. Everybody has heard of Auntie Yuen’s tea. She gets up.', next: null } },
  },
  {
    id: 'dialogue:monk-pema', name: 'Novice Pema Lightfoot (Misprayers)',
    entries: [{ when: stage('quest:monk-misprayers', 'pema'), node: 'flags' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:pema-lightfoot', mood: 'afraid', text: 'The wind tore all the prayer flags and we sewed them back up and we got the words wrong and the Abbess reads them aloud at dusk. Listen to this one. “May my enemies have very pleasant weather.”',
        choices: [offer('quest:monk-misprayers', 'Where are the originals?', 'where'), bye],
      },
      where: { speaker: 'npc:pema-lightfoot', text: 'They blew off down the Stairs! Three of them. “May my teachers know peace” is one. I sewed that one as “May my teachers know pies.” Please hurry.', next: null },
      flags: {
        speaker: 'npc:pema-lightfoot', mood: 'happy', text: 'You found them! “May my teachers know peace.” “May the stairs be kind to the old.” And… “May my enemies have very pleasant weather.” Oh. That one was right all along.',
        choices: [{ text: 'It’s a good prayer.', to: 'good' }, { text: 'Leave the pies one up, too.', to: 'pies', trust: 1 }],
      },
      good: { speaker: 'npc:pema-lightfoot', text: 'It is, isn’t it? If your enemies have nice weather they’re probably in a better mood. I’m going to tell the Abbess I meant it.', next: 'dusk' },
      pies: { speaker: 'npc:pema-lightfoot', mood: 'happy', text: 'Both? Peace AND pies? The Abbess will laugh. The Abbess never laughs at dusk. That’s the whole point of dusk.', next: 'dusk' },
      dusk: { speaker: 'npc:pema-lightfoot', mood: 'afraid', text: 'She reads them out at dusk, from the prayer-pole on the Terraces. All of them. Out loud. I can’t watch. Will you go and watch for me, and tell me afterwards if she laughed? Or if she didn’t. Mostly if she didn’t.', next: null },
    },
  },
  {
    id: 'dialogue:obj-prayer-flag-2', name: 'Misprayers: a torn flag',
    entries: [{ node: 'f' }],
    nodes: { f: { speaker: 'narrator', text: 'Caught on a juniper below the third landing: a torn prayer flag in very old thread. “May the stairs be kind to the old.” Somebody has walked on it. The boot-print is not part of the prayer. Probably.', next: null } },
  },
  // ---------- the Prayer Terraces: Brother Wyn, Matins, Sop
  {
    id: 'dialogue:monk-wyn', name: 'Brother Wyn Orchard (Matins Ate the Sutras)',
    entries: [{ when: stage('quest:monk-matins-ate-the-sutras', 'wyn'), node: 'shrine' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:wyn-orchard', text: 'Brother Wyn. I keep the goats. Or the goats keep me. It is an open question in the cloister. Matins has eaten the novices’ sutras and gone up on the meditation hall roof to digest them.',
        choices: [offer('quest:monk-matins-ate-the-sutras', 'I’ll get her down.', 'down'), bye],
      },
      down: { speaker: 'npc:wyn-orchard', text: 'You will not get her down. You will chase her, and she will go somewhere else, and that is the most any of us can hope for with Matins. Mind your sleeves. She likes sleeves.', next: null },
      shrine: {
        speaker: 'npc:wyn-orchard', text: 'A shrine? Up the old goat path? Nobody has been up there in… (He stops.) I don’t think anybody has been up there at all. Except the goats.',
        choices: [{ text: 'It has a goat carved on the door.', to: 'goat' }],
      },
      goat: { speaker: 'npc:wyn-orchard', mood: 'happy', text: 'Of course it has. Of course it does. The goats have had a shrine on this mountain longer than we have, and they never once mentioned it. That is exactly like a goat. Matins is Vespers’s mother, did you know? It runs in the family.', next: null },
    },
  },
  {
    id: 'dialogue:obj-matins-roof', name: 'Matins on the meditation hall roof',
    entries: [{ when: stage('quest:monk-matins-ate-the-sutras', 'roof'), node: 'chase' }, { node: 'plain' }],
    nodes: {
      chase: { speaker: 'narrator', text: 'Matins, a large white goat with a scroll hanging out of the side of her mouth, regards you from the ridge of the meditation hall roof. She finishes the scroll. Then she leaps off the far end of the roof, lands on a path you did not know was there, and trots away up it.', next: null },
      plain: { speaker: 'narrator', text: 'The meditation hall roof, with a goat-shaped absence on the ridge.', next: null },
    },
  },
  {
    id: 'dialogue:obj-forgotten-goat-shrine', name: 'Matins’s shrine',
    entries: [{ node: 's' }],
    nodes: { s: { speaker: 'narrator', text: 'At the top of the goat path: a tiny stone shrine, older than the cloister, with a goat carved on its door and a hollow worn in its step where something has been lying down in the sun for a thousand years. Matins is lying in it now, chewing. She does not get up.', next: null } },
  },
  {
    id: 'dialogue:monk-sop', name: 'Little Brother Sop',
    entries: [{ when: stage('quest:monk-little-brother-sop', 'sop'), node: 'dream' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:little-brother-sop', text: '(A very small novice in a robe several sizes too big, yawning.) I’m not lazy. Everyone says I’m lazy. I fell asleep in Crane Form again. The crane fell asleep too, I think.',
        choices: [offer('quest:monk-little-brother-sop', 'Why are you so tired, Sop?', 'why'), bye],
      },
      why: { speaker: 'npc:little-brother-sop', text: 'Because I keep dreaming. Every night since the big bell. Somebody’s singing at the top of the mountain and I have to listen all night, and then it’s morning.', next: null },
      dream: {
        speaker: 'npc:little-brother-sop', text: 'Did I talk in my sleep? Brother Wyn says I talk to goats in my sleep. Did I say anything good?',
        choices: [
          { text: 'You were humming. The same song I hear.', to: 'same', trust: 1 },
          { text: 'You said “more rice”.', to: 'rice' },
        ],
      },
      same: { speaker: 'npc:little-brother-sop', mood: 'happy', text: 'The same? You hear it too? Then I’m not lazy. I’m listening. (He thinks about this, very seriously.) Can I still have a nap, though?', next: 'walk' },
      rice: { speaker: 'npc:little-brother-sop', text: 'That does sound like me. But there’s a song as well. Isn’t there? You hear it. I can tell. You go still like I do when it starts.', next: 'walk' },
      walk: { speaker: 'npc:little-brother-sop', text: 'Gelek the porter says I walk in my sleep. Every night. Down the Stairs. And I always sit on the same step, and he has to carry me back up. Step six hundred and eleven. The one with the crack. Why that one, do you think?', next: null },
    },
  },
  {
    id: 'dialogue:obj-sop-sleeping-mat', name: 'Sop’s sleeping-mat',
    entries: [
      { when: { all: [stage('quest:monk-little-brother-sop', 'dream'), NIGHT] }, node: 'night' },
      { when: stage('quest:monk-little-brother-sop', 'dream'), node: 'day' },
      { node: 'mat' },
    ],
    nodes: {
      mat: { speaker: 'narrator', text: 'A small sleeping-mat in the novice dormitory, very neatly rolled, with a toy goat on top.', next: null },
      day: { speaker: 'narrator', text: 'Sop is out on the terraces, falling asleep in a form. Come back at night, when he is asleep on purpose.', next: null },
      night: {
        speaker: 'narrator', text: 'Sop is asleep, curled round his toy goat, and he is humming. You know the tune. It is the one that has been singing under your ribs since the night of the Bell, from the very top of the mountain.',
        effects: [{ setFlag: 'monk.sop_dream', value: true }], next: null,
      },
    },
  },
  // ---------- the Bell Courts: Agnetha, Rosamund
  {
    id: 'dialogue:monk-agnetha', name: 'Sister Agnetha Hume (the Ringer’s Arms)',
    entries: [{ when: stage('quest:monk-the-ringers-arms', 'agnetha'), node: 'scold' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:agnetha-hume', text: 'Forty years I have rung the great bell at dawn, every dawn, and I shall ring it for forty more. My arms are perfectly well. Stop looking at my arms.',
        choices: [offer('quest:monk-the-ringers-arms', '(Look at her arms anyway.)', 'arms'), bye],
      },
      arms: { speaker: 'npc:agnetha-hume', mood: 'angry', text: 'I said stop. (She rubs her shoulder when she thinks you have turned away.) Be in the Bell Courts before dawn tomorrow if you want to learn how it is done properly. Not that you will.', next: null },
      scold: {
        speaker: 'npc:agnetha-hume', mood: 'angry', text: 'That was YOU. That was the worst dawn bell in four hundred years. You rang it like a goat falling down a well. The whole cloister woke up and laughed. You pulled on the up-stroke!',
        choices: [
          { text: 'Teach me, then. Properly.', to: 'teach', trust: 1 },
          { text: 'Your arms needed a morning off.', to: 'arms2' },
        ],
      },
      teach: { speaker: 'npc:agnetha-hume', text: '(A long silence.) Tomorrow. Before dawn. You pull, I count. (She looks at her arms, then at you.) And the day after. And possibly the day after that.', next: 'rope' },
      arms2: { speaker: 'npc:agnetha-hume', mood: 'sad', text: '(Very quietly.) They did. Don’t tell anyone. And never, ever pull on the up-stroke again.', next: 'rope' },
      rope: { speaker: 'npc:agnetha-hume', text: 'And the rope is going. Forty years in my hands. (She will not look at it.) There is a new one, in the chest in the ringers’ loft. My mother plaited it for me the year I took the bell. I have never had the heart to hang it. Fetch it. Before I change my mind.', next: null },
    },
  },
  {
    id: 'dialogue:obj-great-bell-rope', name: 'The great bell rope',
    entries: [
      { when: { all: [stage('quest:monk-the-ringers-arms', 'ring'), NIGHT] }, node: 'night' },
      { when: stage('quest:monk-the-ringers-arms', 'ring'), node: 'day' },
      { node: 'rope' },
    ],
    nodes: {
      rope: { speaker: 'narrator', text: 'The rope of Stonecloister’s great bell, worn smooth by four hundred years of ringers’ hands.', next: null },
      day: { speaker: 'narrator', text: 'Broad day. Agnetha rings the dawn bell in the last dark before dawn. Come back while it is still night.', next: null },
      night: {
        speaker: 'narrator', text: 'The last dark before dawn. You take the rope, plant your feet, and pull. The great bell answers you, enormously, wrongly, like a goat falling down a well, and across the whole cloister lamps start coming on.',
        effects: [{ setFlag: 'monk.bell_rung', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:monk-rosamund', name: 'Sister Rosamund Inch (Half the Cells)',
    entries: [{ when: stage('quest:monk-half-the-cells', 'rosamund'), node: 'count' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:rosamund-inch', text: 'The cell-roll does not add up. It has added up for three hundred years and now it does not. Somebody has to count the empty cells, and read the notes, and it should not be me, because I will cry on the roll.',
        choices: [offer('quest:monk-half-the-cells', 'I’ll count them.', 'count-q'), bye],
      },
      'count-q': { speaker: 'npc:rosamund-inch', text: 'Every leaver leaves a note on their mat. That is the rule. Read them, so that somebody has. Then bring me the number.', next: null },
      count: {
        speaker: 'npc:rosamund-inch', mood: 'sad', text: 'One hundred and four. One hundred and four empty cells. (She writes it down very small.) And the notes?',
        choices: [
          { text: 'One was Kestrel’s. From three years ago. It was addressed to me.', to: 'kestrel', when: { flag: 'monk.kestrel_note' } },
          { text: 'Most of them just said sorry.', to: 'sorry' },
        ],
      },
      kestrel: { speaker: 'npc:rosamund-inch', mood: 'sad', text: 'To you? Then why was it on the mat and not with you? (She stops.) Oh. Oh, I see. He wanted it found. He just didn’t want to be there when it was.', next: 'answer' },
      sorry: { speaker: 'npc:rosamund-inch', text: 'They always do. Thank you. I will put the number on the roll, and the sorries in a box, and keep both.', next: 'answer' },
      answer: { speaker: 'npc:rosamund-inch', text: 'One more rule, since you are counting rules. A note left on a mat is waiting for an answer. Nobody ever leaves one. Kestrel’s cell is at the end of the north cloister. Still empty. You could.', next: null },
    },
  },
  {
    id: 'dialogue:obj-empty-cell-3', name: 'Half the Cells: Kestrel’s cell', scope: 'party',
    entries: [{ when: stage('quest:monk-half-the-cells', 'count'), node: 'note' }, { node: 'plain' }],
    nodes: {
      note: {
        speaker: 'narrator', text: 'The last cell on the north cloister. Kestrel’s, once. The note on his mat is three years old and addressed in his hand to you. It was never delivered.',
        choices: [{ text: '(Read it.)', to: 'read', effects: [{ setFlag: 'monk.kestrel_note', value: true }] }],
      },
      read: { speaker: 'narrator', text: '“Little one. I counted my beads this morning and one of them was wet. I don’t know what it means. I’m going up the mountain to find out. If I don’t come back, don’t come after me. If I do, don’t let me stay. K.”', next: null },
      plain: { speaker: 'narrator', text: 'An empty cell, its mat rolled, its note taken.', next: null },
    },
  },
  // ---------- the Cloud Kitchen: Halvard, Bodhan
  {
    id: 'dialogue:monk-halvard', name: 'Cook-Brother Halvard Pottage (Slime Stew, the King’s Rice)',
    entries: [{ when: stage('quest:monk-slime-stew', 'halvard'), node: 'clean' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:halvard-pottage', text: 'Cook-Brother Halvard. Don’t lift that lid. Don’t lift that one either. One of them is soup and the rest are sitting very still and waiting to be lifted.',
        choices: [
          offer('quest:monk-slime-stew', 'Which ones are soup?', 'soup'),
          offer('quest:monk-the-kings-rice', 'Why are the novices’ bowls so thin?', 'rice'),
          bye,
        ],
      },
      soup: { speaker: 'npc:halvard-pottage', text: 'That is the question, isn’t it. The Stone Slimes have learned to sit in the pots and look like stew. Last Tuesday I served one. The novice said it was the best thing I had ever made. I have not recovered.', next: null },
      rice: { speaker: 'npc:halvard-pottage', mood: 'angry', text: 'Because the Climbers take our rice up to the King, sack after sack, and the King does not eat it, because he is sitting on a step. Three sacks left in the store. Do what you think is right with them. I am too cross to think.', next: null },
      clean: { speaker: 'npc:halvard-pottage', mood: 'happy', text: 'No slime! No slime in any pot! I can lift a lid without fear for the first time in a month! Here. Soup. Actual soup. I checked it twice.', next: null },
    },
  },
  {
    id: 'dialogue:obj-kitchen-pot-2', name: 'Slime Stew: the second pot',
    entries: [{ when: stage('quest:monk-slime-stew', 'pots'), node: 'slime' }, { node: 'plain' }],
    nodes: {
      slime: { speaker: 'narrator', text: 'You lift the lid. A Stone Slime looks up at you out of the pot, perfectly still, wearing a bay leaf. For a long moment neither of you moves. Then it remembers it has been found.', next: null },
      plain: { speaker: 'narrator', text: 'A pot of actual soup. You checked.', next: null },
    },
  },
  {
    id: 'dialogue:obj-rice-sacks', name: 'The King’s Rice: the last sacks', scope: 'party',
    entries: [{ when: stage('quest:monk-the-kings-rice', 'sacks'), node: 'sacks' }, { node: 'plain' }],
    nodes: {
      sacks: {
        speaker: 'narrator', text: 'Three sacks of rice, the last in the store. The novices are hungry. Up on the summit road, the Climbers are hungry too, and they are the cloister’s own children in grey.',
        choices: [
          { text: '(Shoulder the sacks and carry them up to the Climbers.)', to: 'up', effects: [{ setFlag: 'monk.rice', value: 'carried' }] },
          { text: '(Leave the rice for the novices.)', to: 'keep', effects: [{ setFlag: 'monk.rice', value: 'kept' }] },
        ],
      },
      up: { speaker: 'narrator', text: 'Three sacks, up a hundred stairs. At the top, an old porter in grey takes the last one off your shoulder without a word, and looks at you for a long time.', next: null },
      keep: { speaker: 'narrator', text: 'You leave the sacks where they are. At the top of the summit road, an old porter in grey has been watching. He comes down the stairs towards you, slowly, with his hands open.', next: null },
      plain: { speaker: 'narrator', text: 'An empty rice store, swept.', next: null },
    },
  },
  {
    id: 'dialogue:monk-bodhan', name: 'Bodhan Kreel (the King’s Rice)',
    entries: [{ when: stage('quest:monk-the-kings-rice', 'bodhan'), node: 'rice' }, { node: 'start' }],
    nodes: {
      start: { speaker: 'npc:bodhan-kreel', text: 'Porter. Was a porter for the King before he was a king. Carry things up. Carry things down. Mostly up, these days.', next: null },
      rice: {
        speaker: 'npc:bodhan-kreel', text: 'You chose. Good. Most people up here just stand in the middle and wait to be told. (He sits on a step, which creaks.) I carried his pack on the road, in C. 1012. To Concordia, for the crowning.',
        choices: [
          { text: 'What happened on the road?', to: 'road' },
          { text: 'Did the gates really shut in his face?', to: 'road' },
        ],
      },
      road: {
        speaker: 'npc:bodhan-kreel', mood: 'sad', text: 'We heard them closing. Far off. Like a barn door in a wind. And he stood very still, the way they teach you up here, and then he turned round, and ran. Home. Before they shut. I ran after him with his pack. Nobody ever asked me.',
        choices: [{ text: 'He turned back.', to: 'end', insight: 'kell_turned_back' }, { text: 'Thank you for telling me.', to: 'end' }],
      },
      end: { speaker: 'npc:bodhan-kreel', text: 'Don’t tell him I said. Or do. I’m old. I carried that a long way. You carry it now.', next: 'pot' },
      pot: { speaker: 'npc:bodhan-kreel', text: 'And one more thing to carry, while you’re carrying. The Climbers’ pot on the cloud-side’s been empty three days. Half of them were novices a month ago. They won’t come down and ask. Take them a sack. Don’t say who sent it.', next: null },
    },
  },

  // ======================= ACT II
  {
    id: 'dialogue:monk-faraj', name: 'C-1 the Welcome Hall: Brother Faraj', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:faraj-stillwater', text: '(An old monk with a broom, sweeping a doorstep that is half under the bog. Five others behind him, also sweeping.) Welcome. Welcome, welcome. We came ahead in C. 1012 to prepare Master Kell’s crowning. We have swept the welcome hall every morning since. He is late.',
        choices: [
          { text: 'I come from Stonecloister. I stood with the Abbess.', to: 'stay', when: { flag: 'monk.cells', value: 'stay' }, trust: 1 },
          { text: 'Auntie Yuen sent tea.', to: 'tea', when: { flag: 'monk.yuen_pot' } },
          { text: 'He isn’t coming, Brother.', to: 'late' },
        ],
      },
      stay: { speaker: 'npc:faraj-stillwater', mood: 'happy', text: 'Shirin’s child! Then you are Stonecloister’s own, and so this is your hall. Sisters, brothers, put the brooms down. One of ours has come. (Six brooms are set down at once, very gently.)', next: 'abbot' },
      tea: { speaker: 'npc:faraj-stillwater', mood: 'happy', text: 'Yuen’s pot? Still on the boil? (He smells the flask, and closes his eyes.) Sixty years. It tastes exactly as it did on landing four hundred. Thank you. Thank you.', next: 'abbot' },
      late: { speaker: 'npc:faraj-stillwater', text: 'No. We know. We knew after the first ten years. We sweep anyway. It is a very good doorstep, and somebody may yet come up it.', next: 'abbot' },
      abbot: {
        speaker: 'npc:faraj-stillwater', mood: 'sad', text: 'You will be wanting our Sentinel. The Stone Abbot, who walked ahead of every crown and kept the road still. He sat down in the bog when the tears came, and something ate him. Now the slimes of Briar Hollow are doing his forms.',
        choices: [{ text: 'Then I’ll go and fetch him.', to: 'go', quest: true }],
      },
      go: { speaker: 'npc:faraj-stillwater', text: 'Follow the forms. They are very bad forms. You will know them anyway.', next: null },
    },
  },
  {
    id: 'dialogue:obj-monk-slime-form-3', name: 'C-2 the slime-forms', scope: 'party',
    entries: [{ when: stage('quest:monk-the-bog-forms', 'forms'), node: 'form' }, { node: 'plain' }],
    nodes: {
      form: {
        speaker: 'narrator', text: 'A bog-slime in a clearing in the bramble, doing Mountain Rising Slowly. It does the first half correctly and then falls over, wobbles, gets up and starts again. It is, unmistakably, the Stone Abbot’s form. Every slime you have passed was facing the same way.',
        choices: [
          { text: '[Fist] (Do the form beside it, slowly, correctly.)', to: 'show', school: 'fist' },
          { text: '(Follow the way it is facing.)', to: null },
        ],
      },
      show: { speaker: 'narrator', text: 'The slime watches you. On its next attempt it gets nearly all the way through. You both stand there afterwards, pleased. Then it points, with most of itself, deeper into the bramble.', next: null },
      plain: { speaker: 'narrator', text: 'A clearing in the bramble where a slime was doing forms.', next: null },
    },
  },
  {
    id: 'dialogue:monk-sovereign-forms', name: 'C-3 the Ooze Sovereign rises', scope: 'party',
    entries: [{ when: { flag: 'monk.cells', value: 'stay' }, node: 'hall' }, { node: 'rise' }],
    nodes: {
      hall: { speaker: 'narrator', text: 'Behind you, on the bank of the pool, six old monks from the Welcome Hall set down their brooms, sit, and begin to breathe in time. You can feel it: a stillness, laid across the bog like a plank across water. Stonecloister’s own does not stand alone.', next: 'rise' },
      rise: { speaker: 'narrator', text: 'The black pool rises into a vast slow shape of ooze and bramble, and settles into a perfect stance. It bows to you, exactly as the Stone Abbot used to bow. It fights like a monk, because it ate one.', next: null },
    },
  },
  {
    id: 'dialogue:obj-monk-climber-cairn', name: 'C-4 the Climbers’ signal cairn', scope: 'party',
    entries: [{ when: stage('quest:monk-the-news-that-never-came', 'exiles'), node: 'light' }, { node: 'plain' }],
    nodes: {
      light: { speaker: 'narrator', text: 'You light the cairn the way the Climbers taught you in your week in grey: three handfuls of juniper and a whistle. Within the hour there are Climbers coming along the cliff path, exiles who followed Kestrel through the gate and lost him. They have been waiting for someone to call.', next: null },
      plain: { speaker: 'narrator', text: 'A cold signal cairn on the cliff path, ringed with juniper ash.', next: null },
    },
  },
  {
    id: 'dialogue:obj-monk-kestrel-bead', name: 'C-4 Kestrel’s broken bead', scope: 'party',
    entries: [{ when: stage('quest:monk-the-news-that-never-came', 'bead'), node: 'bead' }, { node: 'plain' }],
    nodes: {
      bead: { speaker: 'narrator', text: 'A single prayer bead on the cliff path, cracked in half, black and wet. Further up, another. He is shedding them as he climbs. Beside the second, in the mud, the marks of many iron-shod feet, and a long thing dragged: something being made, and carried to the Heart, in pieces.', next: 'arms' },
      arms: { speaker: 'narrator', text: 'Scratched on a rock above the beads, in Kestrel’s hand: THEY SAY I WILL BE ITS ARMS. I HAVE ALWAYS WANTED TO BE GOOD AT SOMETHING.', next: null },
      plain: { speaker: 'narrator', text: 'The cliff path, and the place where the beads were.', next: null },
    },
  },
  // ---------- C-6 A Move by Post (Vespers, or a Climber runner)
  {
    id: 'dialogue:monk-shirin-letter', name: 'C-6 a move by post', scope: 'party',
    entries: [{ when: { flag: 'monk.vespers_pet' }, node: 'vespers' }, { node: 'runner' }],
    nodes: {
      vespers: { speaker: 'npc:vespers', text: '(Vespers trots out of the Fist arch with a letter in her collar, eats the corner of it, and presents you with the rest. You did not see her leave. She has been to Stonecloister and back. Nobody knows how. Nobody ever knows how, with goats.)', next: 'letter' },
      runner: { speaker: 'npc:yeshe-highstep', text: 'Yeshe Highstep, Climber runner. I ran the whole Stair Gate road, and the Abbess gave me tea at the top and made me run it again. One letter. She said you’d know what it was.', next: 'letter' },
      ...LETTER,
    },
  },
  // ---------- featured bearers (hooks on the bearer NPCs)
  {
    id: 'dialogue:monk-featured-hedgewitch', name: 'Featured: The Patient Bog', scope: 'party',
    entries: [
      { when: stage('quest:monk-the-patient-bog', 'back'), node: 'back' },
      { when: { all: [stage('quest:monk-the-patient-bog', 'pool'), { not: { flag: 'monk.bryony_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-hedgewitch', mood: 'happy', text: 'You’re the monk! Lovely. I’m going to compost the Ooze Sovereign’s pool. All of it. Turn the whole bog into something that grows. Come and help me dig. Bring a spade. Bring two.',
        choices: [{ text: 'Have you asked the bog?', to: null, quest: true, effects: [{ setFlag: 'monk.bryony_asked', value: true }] }],
      },
      back: {
        speaker: 'npc:bearer-hedgewitch', text: 'I’ve been a Hedgewitch twenty years and nobody ever told me to ask the bog first. It was owed some quiet. That was all. When we go to the Heart, I’m standing next to you, and I’m going to try very hard to stand still.',
        effects: [{ setFlag: 'monk.bryony_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-monk-pool-edge', name: 'The Patient Bog: the pool’s edge', scope: 'party',
    entries: [
      { when: { all: [stage('quest:monk-the-patient-bog', 'pool'), { flag: 'story.sentinel.fist' }] }, node: 'empty' },
      { when: stage('quest:monk-the-patient-bog', 'pool'), node: 'full' },
      { node: 'plain' },
    ],
    nodes: {
      empty: { speaker: 'narrator', text: 'The Sovereign’s pool, empty of its Sovereign, black and still. The Hedgewitch bearer has a spade in one hand and a sack of seed in the other. Before they dig, you ask: what is the bog owed?', next: 'ask' },
      full: { speaker: 'narrator', text: 'The Sovereign’s pool, black and still, with something vast asleep at the bottom of it. The Hedgewitch bearer has a spade in one hand and a sack of seed in the other. Before they dig, you ask: what is the bog owed?', next: 'ask' },
      ask: {
        speaker: 'narrator', text: 'They look at you as if you have asked what a spoon wants for its birthday. Then, slowly, they put the spade down.',
        choices: [
          { text: '(Sit down on the bank, and listen to the bog for a while, together.)', to: 'listen' },
          { text: 'Plant one thing. Only one. And see if it wants more.', to: 'one' },
        ],
      },
      listen: { speaker: 'narrator', text: 'Frogs. Water moving under moss. Something bubbling, contentedly, a long way down. After an hour the Hedgewitch says, very quietly, that the bog does not want to be anything else. It wants to be left to be a bog. It had only been waiting for someone to ask.', next: null },
      one: { speaker: 'narrator', text: 'One willow-slip, at the edge, where it can choose. The Hedgewitch bearer pats the earth down and does not plant anything else, which is clearly costing them a great deal. The bog seems, somehow, to settle.', next: null },
      plain: { speaker: 'narrator', text: 'The edge of the Sovereign’s pool. A single willow-slip, perhaps, at the edge.', next: null },
    },
  },
  {
    id: 'dialogue:monk-featured-stormlancer', name: 'Featured: One Breath First', scope: 'party',
    entries: [
      { when: stage('quest:monk-one-breath-first', 'back'), node: 'back' },
      { when: { all: [stage('quest:monk-one-breath-first', 'ledge'), { not: { flag: 'monk.kit_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-stormlancer', mood: 'happy', text: 'Monk! Good, you can watch. I’m going to charge the Stormcrow. Alone. Right now. Off the wind ledge, at a run, lance first. It’ll be magnificent. I’m going now. I’m going in a minute. Watch.',
        choices: [{ text: 'Wait for me at the ledge.', to: null, quest: true, effects: [{ setFlag: 'monk.kit_asked', value: true }] }],
      },
      back: {
        speaker: 'npc:bearer-stormlancer', text: 'One breath. One! I’ve been doing it all week. I wait one breath and the lightning goes somewhere else. It’s infuriating. It’s wonderful. When we go to the Heart I’ll charge first, but I’ll breathe before I do it. Probably.',
        effects: [{ setFlag: 'monk.kit_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-monk-wind-ledge', name: 'One Breath First: the wind ledge', scope: 'party',
    entries: [{ when: stage('quest:monk-one-breath-first', 'ledge'), node: 'ledge' }, { node: 'plain' }],
    nodes: {
      ledge: {
        speaker: 'narrator', text: 'The Stormlancer bearer is on the wind ledge above the Wind Yard, lance up, weight on the front foot, about to jump into a sky full of lightning. Far above, the Stormcrow is screaming.',
        choices: [
          { text: 'One breath first. Just one. Breathe with me.', to: 'breath' },
          { text: '[Fist] (Stand beside them, perfectly still, until they notice.)', to: 'still', school: 'fist' },
        ],
      },
      breath: { speaker: 'narrator', text: 'They roll their eyes. They breathe, once, with you. In that one breath, lightning strikes the exact place on the cliff where they would have landed. Neither of you says anything for a while. Then they breathe again, without being asked.', next: null },
      still: { speaker: 'narrator', text: 'It takes them nearly a minute to notice you. When they do, they jump, and swear, and in that minute three bolts have struck the ledge below, one after another, exactly where they would have been. They look at the ledge. They look at you. They sit down.', next: null },
      plain: { speaker: 'narrator', text: 'The wind ledge above the Wind Yard, scorched in three places.', next: null },
    },
  },
];

export default dialogues;
