/**
 * Hollow Crown, CANTOR: Dawnspire people (general talk), the eight side quests, the mentor thread and the
 * bounties, plus the Act II class-thread, Brindlecross hooks and featured-bearer scenes. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const done = (q: Q): NarrativeCondition => ({ questCompleted: q });
const offer = (q: Q, text: string, to: string, extra?: NarrativeCondition): DialogueChoice =>
  ({ text, to, quest: true, when: extra ? { all: [fresh(q), extra] } : fresh(q), effects: [{ startQuest: q }] });
const bye: DialogueChoice = { text: 'Farewell.', to: null, tag: 'leave' };
/** Dawnspire has no night (08 R19): its "night" is the Hour of Lamps, when the Cathedral's light is trimmed. */
const LAMPS: NarrativeCondition = { hour: [22, 23] };
const CH = 'npc:celestine-hale' as const, LU = 'npc:lucan-brightwater' as const, AM = 'npc:sister-amabel' as const;
const OB = 'npc:osgood-bellamy' as const;

const dialogues: DialogueDef[] = [
  // ---------- Celestine (general + mentor thread)
  {
    id: 'dialogue:cantor-celestine', name: 'Celestine (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: CH, text: 'Sit, if you can do it without nodding off. I’m told it’s contagious.',
        choices: [
          offer('quest:cantor-compline', 'You hum the same line over and over. What is it?', 'compline', { all: [{ trust: CH, value: 'friendly' }, done('quest:cantor-the-inquisitors-kindness')] }),
          offer('quest:cantor-six-years-awake', 'Mother, why don’t you sleep?', 'awake', { all: [{ trust: CH, value: 'trusted' }, done('quest:cantor-the-jars-of-night')] }),
          { text: 'What was Dawnspire like, before?', to: 'before' },
          bye,
        ],
      },
      compline: { speaker: CH, text: 'Compline. The evening hymn. We sang the light down with it, gently, every day, until the Hierarch banned it. I remember the first line and nothing else, which is worse than remembering nothing. I think the last copy was used to line a crate.', next: null },
      awake: { speaker: CH, mood: 'sad', text: 'Not here. Not with the door open. Come back when you have an hour, and shut the door behind you.', next: null },
      before: {
        speaker: CH, text: 'The sun never quite set over the Cathedral. It went down behind it, like a cat behind a sofa, and everyone slept. Then the crown was emptied, and the Hierarch was frightened, and he nailed the sun to the sky.',
        choices: [
          { text: 'What were you like, Mother, when you were a novice?', to: 'novice', when: { trust: CH, value: 'friendly' } },
          { text: 'Thank you, Mother.', to: 'start' },
        ],
      },
      novice: { speaker: CH, mood: 'happy', text: 'Dreadful. I sang sharp, I talked through the psalms, and I was the best napper in the Choir. (She smiles.) Yes. Tobit Lark is a great comfort to me. He is the only novice I have ever had who is worse than I was.', next: 'amabel' },
      amabel: {
        speaker: CH, text: 'I had a friend who used to wake me for Lauds by putting a cold spoon on my neck. Every morning, for eleven years. I have never once since woken up without expecting it.',
        choices: [
          { text: 'What happened to her?', to: 'gone' },
          { text: 'Shall I find you a spoon?', to: 'spoon', trust: 1 },
        ],
      },
      gone: { speaker: CH, mood: 'sad', text: 'She went somewhere I couldn’t follow. (She straightens her veil.) That is a story for when I have an hour and the door is shut. Ask me again, one day.', next: 'start' },
      spoon: { speaker: CH, mood: 'happy', text: 'Don’t you dare. (She is laughing, properly, for the first time you can remember.) Don’t you dare. Go and sing something.', next: 'start' },
    },
  },
  {
    id: 'dialogue:cantor-celestine-compline', name: 'Mentor: Compline', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: CH, text: 'Inside a draught-crate. Of course it was. (She smooths the page flat on her knee with both hands.) Oh. Oh, there it is. The second verse. I had the tune wrong for thirty years. It goes down, not up.', next: 'sing' },
      sing: {
        speaker: CH, mood: 'happy', text: 'Listen to the words. It doesn’t ask the dark to go away. It asks it to come in gently and keep watch. We sang the night in, every evening. That’s what we lost.',
        choices: [{ text: 'Teach it to me.', to: 'end', insight: 'compline', trust: 1 }],
      },
      end: { speaker: CH, text: 'Gladly. Quietly. And if you ever sing it where the Brightwatch can hear, sing it properly. They deserve to hear it done well.', next: null },
    },
  },
  {
    id: 'dialogue:cantor-celestine-awake', name: 'Mentor: Six Years Awake (why)', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: CH, mood: 'sad', text: 'Six years ago the Brightwatch took my dearest friend for singing Compline in the Undercroft. Sister Amabel. They came at Lauds and she went quietly, and I have never seen her since.', next: 'why' },
      why: {
        speaker: CH, text: 'So I sing every hour. Every one. If the Choir is never silent, they will never have cause to come for anyone else. I have not missed an hour in six years. I am very good at it, and it is going to kill me.',
        choices: [
          { text: 'Amabel isn’t dead. She keeps the jars in the Undercroft.', to: 'alive' },
          { text: 'You’ve kept them safe, Mother.', to: 'safe' },
        ],
      },
      safe: { speaker: CH, text: 'I have kept them awake. That isn’t the same thing, and you know it. (She looks at you properly.) You know something. Out with it.', next: 'alive' },
      alive: { speaker: CH, mood: 'afraid', text: 'Under my feet. All this time, under my feet, keeping the nights. (She is gripping the chair.) Go to her. Ask her if she wants to see me. If she says no, don’t tell me what her face did.', next: null },
    },
  },
  {
    id: 'dialogue:cantor-celestine-together', name: 'Mentor: Six Years Awake (together)', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: AM, text: 'Celie. You came down the stair. You hate stairs.', next: 'cel' },
      cel: { speaker: CH, mood: 'sad', text: 'I sang every hour. Every single hour, Amabel, so they’d never come back for anyone. I thought if I stopped for one breath…', next: 'sleep' },
      sleep: { speaker: 'narrator', text: 'Amabel takes her hand, and Celestine sits down on the bottom step, and is asleep before she has finished the sentence, sitting up, still holding on. Amabel does not move. She nods at you to go, and mouths: thank you.', effects: [{ trust: CH, delta: 1 }], next: null },
    },
  },
  // ---------- Lucan (general)
  {
    id: 'dialogue:cantor-lucan', name: 'Lucan (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: LU, text: 'Mind the glare. Did you want something? I have bread, if you’re hungry. Everyone’s always hungry when they’re tired.',
        choices: [
          { text: 'What does the Brightwatch do?', to: 'watch' },
          { text: 'Do you ever dream, Inquisitor?', to: 'dream', when: { flag: 'cantor.lucan_met' } },
          bye,
        ],
      },
      watch: { speaker: LU, text: 'We keep the light. That’s all. Quietly, kindly, all the time. Somebody has to keep watch so the rest can rest. Well. Not rest. You know what I mean.', next: null },
      dream: { speaker: LU, mood: 'sad', text: 'Dream? (A small, puzzled laugh.) You have to sleep to dream. Run along, Cantor. Drink some water.', next: null },
    },
  },
  // ---------- Sister Amabel (general, the Hierarch's Shadow, Six Years Awake)
  {
    id: 'dialogue:cantor-amabel', name: 'Sister Amabel (general)',
    entries: [
      { when: stage('quest:cantor-six-years-awake', 'amabel'), node: 'celie' },
      { when: stage('quest:cantor-the-hierarchs-shadow', 'amabel'), node: 'jarred' },
      { node: 'start' },
    ],
    nodes: {
      start: {
        speaker: AM, text: 'Mind the windy ones. What can I do for you, love? I’ve a fine selection of nights. Very little call for them lately.',
        choices: [
          offer('quest:cantor-the-hierarchs-shadow', 'Whose is that tall shadow by the far wall?', 'shadow', done('quest:cantor-the-jars-of-night')),
          { text: 'How long have you been down here?', to: 'long' },
          bye,
        ],
      },
      long: { speaker: AM, text: 'Six years, give or take a Tuesday. The Brightwatch brought me down for singing out of turn, and then forgot me, which is the Brightwatch all over. Somebody had to keep the nights. Don’t tell anyone upstairs I’m here.', next: null },
      shadow: { speaker: AM, text: 'The Hierarch’s. He left it here the day he shut himself in the light; a shadow can’t follow a man into that much brightness. It’s waited thirty years. If you’re going to the gate, take it with you. Bottle it gently.', next: null },
      jarred: { speaker: AM, mood: 'happy', text: 'Look at it, pressed up against the glass. Faithful old thing. Carry it to the gate, love, and give it back to him. A man without a shadow can’t lie down.', next: 'portrait' },
      portrait: { speaker: AM, text: 'See how it leans towards the Cloisters? There’s a portrait of him up there, painted before he went into the light. The only picture in Dawnspire with a shadow in it. Show it, love. It wants to remember what it belonged to.', next: null },
      celie: {
        speaker: AM, mood: 'afraid', text: 'Celestine? Celie Hale is asking for me? (She sits down on a crate of windy nights.) Six years. She thought I was dead, didn’t she. Of course she did. I let her.',
        choices: [
          { text: 'She hasn’t slept since they took you.', to: 'slept', trust: 1 },
          { text: 'Will you see her?', to: 'see' },
        ],
      },
      slept: { speaker: AM, mood: 'sad', text: 'The silly, stubborn, beautiful woman. Of course she hasn’t.', next: 'see' },
      see: { speaker: AM, text: 'I can’t go up. The light’s too much now; I’d be in the Brightwatch House by Terce. But she can come down. Tell her to mind the bottom shelf.', next: null },
    },
  },
  // ---------- Cathedral Close: Bellamy (the Word for It, bounties), Prue
  {
    id: 'dialogue:cantor-bellamy', name: 'Sergeant Bellamy (the Word for It, bounties)',
    entries: [{ when: stage('quest:cantor-the-word-for-it', 'bellamy'), node: 'word' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: OB, text: 'Morning. It’s always morning. Fines on the left, bounties on the right, confessions to the Inquisitor.',
        choices: [
          offer('quest:cantor-the-word-for-it', 'What are you writing in your own fine-book?', 'self', done('quest:cantor-the-hour-of-no-night')),
          offer('quest:cantor-bounty-overzealous-acolytes', 'The acolytes in the Close?', 'acolytes', done('quest:cantor-the-sleepers-census')),
          offer('quest:cantor-bounty-lantern-lightbearers', 'The Lantern Lightbearers?', 'lanterns', done('quest:cantor-the-inquisitors-kindness')),
          bye,
        ],
      },
      self: { speaker: OB, mood: 'sad', text: 'My own fine. For dreaming. Every morning, two shards. The trouble is I can’t say what I dreamed about without saying the word for when you dream, and then I have to fine myself again. Help me find a word for it that isn’t illegal.', next: 'never' },
      never: {
        speaker: OB, text: 'The Inquisitor has never fined himself once. Never dreams, he says.',
        choices: [{ text: 'Never dreams, or never sleeps?', to: 'sleeps', insight: 'cantor_never_dreams' }, { text: 'I’ll ask around.', to: null }],
      },
      sleeps: { speaker: OB, mood: 'afraid', text: 'I didn’t say that. I didn’t say anything. Two shards, please, for the question.', next: null },
      acolytes: { speaker: OB, text: 'They’ve gone hollow and they’re fining people with sticks. That’s my job. I use a book. Six of them, and the Brightwatch would very much like it to be somebody else’s problem.', next: null },
      lanterns: { speaker: OB, text: 'The Market’s lamplighters. Hollow, every one, and lighting the stalls instead of the lamps. Five. Bring a bucket.', next: null },
      word: {
        speaker: OB, text: 'Well? What have you got? Quickly, before I hear myself think it.',
        choices: [
          { text: '“The long dusk.” It’s only a long dusk. Nothing illegal about a dusk.', to: 'dusk', effects: [{ setFlag: 'cantor.bellamy_word', value: 'long-dusk' }] },
          { text: '“The soft hour.” Who would fine a soft hour?', to: 'soft', effects: [{ setFlag: 'cantor.bellamy_word', value: 'soft-hour' }] },
          { text: '“Tuesday.” Just call it Tuesday.', to: 'tuesday', effects: [{ setFlag: 'cantor.bellamy_word', value: 'tuesday' }] },
        ],
      },
      dusk: { speaker: OB, mood: 'happy', text: 'The long dusk. Last long dusk I dreamed I was a boat. That’s… that’s legal. I can say that. (He tears the morning’s page out of his own fine-book.) Thank you, Cantor.', next: 'pages' },
      soft: { speaker: OB, mood: 'happy', text: 'The soft hour. In the soft hour I dreamed my mother was shelling peas. (He is quiet for a moment.) Thank you. That’s worth more than two shards.', next: 'pages' },
      tuesday: { speaker: OB, mood: 'happy', text: 'Tuesday. Every Tuesday I dream about cheese. (He considers.) It will be confusing on Tuesdays. I can live with confusing. Here: no fine today.', next: 'pages' },
      pages: { speaker: OB, text: 'Thirty years of mornings in that book, every one a fine. It’s on the desk in the Brightwatch porch, if you want to see what a sergeant dreams about. I’ve never let anybody look. I think I’d like somebody to.', next: null },
    },
  },
  {
    id: 'dialogue:cantor-prue', name: 'Prue Haverlock (the Pilgrim Who Saw Stars)',
    entries: [
      { when: stage('quest:cantor-the-pilgrim-who-saw-stars', 'postern'), node: 'wait' },
      { node: 'start' },
    ],
    nodes: {
      start: {
        speaker: 'npc:prue-haverlock', text: 'Three weeks I walked, from the March, to tell the Cathedral. The Dimming’s got stars in it. Little ones, like salt. Nobody here will let me finish the sentence.',
        choices: [
          offer('quest:cantor-the-pilgrim-who-saw-stars', 'The Brightwatch is watching you. You need to hide.', 'hide', done('quest:cantor-the-sleepers-census')),
          { text: 'What are stars like?', to: 'stars' },
          bye,
        ],
      },
      stars: { speaker: 'npc:prue-haverlock', mood: 'happy', text: 'Like somebody spilled the salt on a black cloth and didn’t clear it up. You’d like them. You’ve got a stargazing sort of face.', next: null },
      hide: { speaker: 'npc:prue-haverlock', text: 'Hide? I came to tell them, not hide from them. (She looks at the Brightwatch House.) All right. All right. I’ve a husband on the March who’ll want me home in one piece. What do I do?', next: null },
      wait: { speaker: 'npc:prue-haverlock', text: 'I’m a novice now, apparently. I keep forgetting which way to bow. Tell me when it’s the Hour of Lamps and I’ll be off like a hare.', next: null },
    },
  },
  {
    id: 'dialogue:obj-choir-spare-robe', name: 'The vestry robes',
    entries: [{ when: stage('quest:cantor-the-pilgrim-who-saw-stars', 'robe'), node: 'robe' }, { node: 'rack' }],
    nodes: {
      robe: { speaker: 'narrator', text: 'A rack of spare novices’ robes in the vestry, each with a little bell sewn into the hem so the sleepers can be found. You take the longest one, and cut the bell off.', next: null },
      rack: { speaker: 'narrator', text: 'Novices’ robes in a row, bells sewn into every hem.', next: null },
    },
  },
  {
    id: 'dialogue:obj-close-postern', name: 'The Close postern (Hour of Lamps)', scope: 'party',
    entries: [
      { when: { all: [stage('quest:cantor-the-pilgrim-who-saw-stars', 'postern'), LAMPS] }, node: 'lamps' },
      { when: stage('quest:cantor-the-pilgrim-who-saw-stars', 'postern'), node: 'day' },
      { node: 'gate' },
    ],
    nodes: {
      gate: { speaker: 'narrator', text: 'The little postern gate at the back of the Close, with a Brightwatch lamp over it and a Brightwatch sergeant under the lamp.', next: null },
      day: { speaker: 'narrator', text: 'The watch is wide awake and staring straight at the gate. Wait for the Hour of Lamps, when the Cathedral turns its light down and every watchman in Dawnspire looks at his wick.', next: null },
      lamps: {
        speaker: 'narrator', text: 'The Cathedral dims a notch. The sergeant at the postern takes down his lamp to trim it, frowning at the wick. Prue walks past behind him in a novice’s robe, very slowly, the way novices walk, and is gone onto the March road.',
        effects: [{ setFlag: 'cantor.prue_home', value: true }], next: 'wave',
      },
      wave: { speaker: 'narrator', text: 'At the bend she turns and points, very definitely, at the sky, and mouths a word you can read from here: salt.', next: null },
    },
  },
  // ---------- Choir Cloisters: Tobit (Nodding Off), Lambert (the Moonflower)
  {
    id: 'dialogue:cantor-tobit', name: 'Novice Tobit Lark (Nodding Off)',
    entries: [
      { when: stage('quest:cantor-the-word-for-it', 'ask'), node: 'word' },
      { when: stage('quest:cantor-nodding-off', 'tobit'), node: 'woken' },
      { node: 'start' },
    ],
    nodes: {
      start: {
        speaker: 'npc:tobit-lark', text: 'I’m awake. I’m awake! I was only… what were we singing?',
        choices: [
          offer('quest:cantor-nodding-off', 'You’ll be caught if you sleep through Lauds again.', 'lauds', done('quest:cantor-the-sleepers-census')),
          { text: 'How long since you slept, Tobit?', to: 'slept' },
          bye,
        ],
      },
      slept: { speaker: 'npc:tobit-lark', text: 'Properly? Never. I’m fifteen. I nap, though. I’m the best napper in the Choir. I can nap between the amen and the next hymn and nobody notices except the hymn.', next: null },
      lauds: { speaker: 'npc:tobit-lark', mood: 'afraid', text: 'Sergeant Bellamy said one more time and it’s the Brightwatch House. Would you stand next to me? If I go, you could sing my part. Nobody listens to the tenors anyway.', next: null },
      woken: {
        speaker: 'npc:tobit-lark', mood: 'happy', text: '…and the amen. Is it the amen? Did I do the amen? You sang both parts! All of Lauds! I dreamed I was singing it and I was, sort of, through you. That’s the nicest thing anyone’s ever done for me.',
        choices: [{ text: 'Go and have a proper nap.', to: 'nap' }, { text: 'Next time, stay awake.', to: 'next' }],
      },
      nap: { speaker: 'npc:tobit-lark', mood: 'happy', text: 'A proper one? On purpose? I’ll do it in the bell loft. Nobody goes up there now you’ve stopped the bell. I owe you one, Cantor. I always pay back. Eventually. When I wake up.', next: 'jar' },
      next: { speaker: 'npc:tobit-lark', text: 'I’ll try. I always try. Trying’s the bit I’m good at. I owe you one, Cantor.', next: 'jar' },
      jar: {
        speaker: 'npc:tobit-lark', mood: 'afraid', text: '(Very quietly.) Can I tell you why I nap? I’ve got a jar. Under my mattress. “A quiet night, C. 1011.” I took it from the Undercroft. I open it a crack before Lauds, just to smell it, and then I can’t keep my eyes open. Would you take it back? Before they find it?',
        choices: [{ text: 'I’ll take it back to Amabel.', to: null, quest: true }],
      },
      word: { speaker: 'npc:tobit-lark', text: 'In the dormitory we call it the soft hour, when the light dips for the lamps. Everybody’s soft in the soft hour. Even Sergeant Bellamy.', next: null },
    },
  },
  {
    id: 'dialogue:obj-lauds-lectern', name: 'Nodding Off: Lauds for two', scope: 'party',
    entries: [{ when: stage('quest:cantor-nodding-off', 'lauds'), node: 'first' }, { node: 'lectern' }],
    nodes: {
      lectern: { speaker: 'narrator', text: 'The great brass lectern of the Choir, with Lauds open on it at the place where the tenors come in.', next: null },
      first: {
        speaker: 'narrator', text: 'Lauds begins. Tobit’s eyes close at the first psalm. You take your own line, and then his, an octave down, and the precentor’s head comes round.',
        choices: [
          { text: '(Keep both lines going, steady as a clock.)', to: 'second' },
          { text: '(Swap between them so fast it sounds like two people.)', to: 'second' },
        ],
      },
      second: {
        speaker: 'narrator', text: 'The canticle. Tobit has started to snore, very softly, in tune. The precentor is frowning at the tenors.',
        choices: [
          { text: '(Sing over the snore.)', to: 'end', effects: [{ setFlag: 'cantor.lauds', value: 'clean' }] },
          { text: '(Fold the snore into the harmony.)', to: 'snore', school: 'radiance', effects: [{ setFlag: 'cantor.lauds', value: 'harmony' }] },
        ],
      },
      snore: { speaker: 'narrator', text: 'It turns out a snore, held carefully, is a perfectly good drone. The precentor stops frowning and starts nodding along. Nobody has heard the tenors sound so full in years.', next: 'end' },
      end: { speaker: 'narrator', text: 'Amen. Tobit is still asleep on his feet, his mouth moving with the words he didn’t sing.', next: null },
    },
  },
  {
    id: 'dialogue:cantor-lambert', name: 'Brother Lambert (the Moonflower)',
    entries: [
      { when: stage('quest:cantor-the-word-for-it', 'ask'), node: 'word' },
      { when: stage('quest:cantor-the-moonflower', 'lambert'), node: 'bloomed' },
      { node: 'start' },
    ],
    nodes: {
      word: { speaker: 'npc:lambert-dewhurst', text: 'What did we call it? The old gardeners called it the long dusk: when the light went off the beds and the moonflowers opened. I haven’t said that aloud in thirty years. It tastes of soil.', next: null },
      start: {
        speaker: 'npc:lambert-dewhurst', text: 'Mind the moonflowers. They’re resting. They’ve been resting for thirty years, poor things, waiting for a night.',
        choices: [
          offer('quest:cantor-the-moonflower', 'Could they bloom anywhere in Dawnspire?', 'where', done('quest:cantor-the-inquisitors-kindness')),
          { text: 'Why do you still water them?', to: 'water' },
          bye,
        ],
      },
      water: { speaker: 'npc:lambert-dewhurst', text: 'A gardener waters what’s there, not what’s flowering. Most of gardening is waiting. The rest is slugs.', next: null },
      where: { speaker: 'npc:lambert-dewhurst', text: 'You’ve been down the stair, then. Under the Market. I’ve heard there’s dark down there. Real dark. (He hands you a little knife.) Take a cutting. One leaf and a node. Be gentle; it’s older than both of us put together.', next: null },
      bloomed: {
        speaker: 'npc:lambert-dewhurst', mood: 'happy', text: 'It opened? White? Oh, it does open white. I’d forgotten. I’d forgotten I’d forgotten. Thank you. Keep a seed of it about you, Cantor. A thing that only opens in the dark is a comfort to some creatures.',
        choices: [{ text: 'I’ll keep it close.', to: null, trust: 1 }],
      },
    },
  },
  {
    id: 'dialogue:obj-moonflower-cutting', name: 'The moonflower bed',
    entries: [{ when: stage('quest:cantor-the-moonflower', 'cut'), node: 'cut' }, { node: 'bed' }],
    nodes: {
      cut: { speaker: 'narrator', text: 'Grey-green leaves, folded shut like hands at prayer. You take one leaf and a node, as gently as you can, and the plant does not seem to mind.', next: null },
      bed: { speaker: 'narrator', text: 'The moonflower bed, closed tight in the endless noon, watered every morning by a man who has never seen it bloom.', next: null },
    },
  },
  {
    id: 'dialogue:obj-undercroft-dark-bed', name: 'The Moonflower: planting in the dark', scope: 'party',
    entries: [{ when: stage('quest:cantor-the-moonflower', 'dark'), node: 'plant' }, { node: 'bed' }],
    nodes: {
      plant: { speaker: 'narrator', text: 'A crack in the Undercroft floor where a little earth has gathered. You press the cutting into it in the perfect dark, and before you have taken your hand away the leaves unfold against your palm, and something opens, white as a held breath.', next: null },
      bed: { speaker: 'narrator', text: 'In the dark of the Undercroft floor, a white moonflower, open, entirely pleased with itself.', next: null },
    },
  },
  // ---------- Sunward Market: Madame Lull, Albin Mote
  {
    id: 'dialogue:cantor-lull', name: 'Madame Lull (Madame Lull’s Draughts)',
    entries: [{ when: stage('quest:cantor-madame-lulls-draughts', 'choice'), node: 'found' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:dovina-lull', text: 'Draughts, darling? Lull’s Lulling Draughts, three drops and you’ll sleep like a stone in a well. I’m not here. You haven’t seen me. That’ll be one shard for the not-seeing.',
        choices: [
          offer('quest:cantor-madame-lulls-draughts', 'The Brightwatch is two streets behind you.', 'behind', done('quest:cantor-the-inquisitors-kindness')),
          { text: 'Do the draughts actually work?', to: 'work' },
          bye,
        ],
      },
      work: { speaker: 'npc:dovina-lull', text: 'Mostly chamomile, a little valerian, a great deal of sincerity. They work if you let them, which is more than you can say for most things in this city.', next: null },
      behind: { speaker: 'npc:dovina-lull', mood: 'afraid', text: 'Two? It was four this morning. Darling, I’m going to move the cart, and you’re going to lose me, and then you’re going to find me again before they do. Follow the little blue bottles. I drop them for the regulars.', next: null },
      found: {
        speaker: 'npc:dovina-lull', text: 'You found me. Well done. So have they, nearly; I can hear the Sergeant apologising to someone round the corner. So. What’s it to be?',
        choices: [
          { text: 'Get the cart down the Undercroft stair. I’ll keep them talking.', to: 'help', trust: 1, effects: [{ setFlag: 'cantor.lull', value: 'helped' }] },
          { text: 'I’m sorry. Lucan will treat you kindly. He gives everyone bread.', to: 'turned', effects: [{ setFlag: 'cantor.lull', value: 'turned_in' }] },
        ],
      },
      help: { speaker: 'npc:dovina-lull', mood: 'happy', text: 'Down the dark stair! Oh, I like you. If you’re ever anywhere that wants sleeping, darling, look for the cart. I always turn up where I’m needed. It’s my only virtue.', next: 'crate' },
      turned: { speaker: 'npc:dovina-lull', mood: 'sad', text: 'Bread. Yes. He does give everyone bread. (She takes off her hat and holds it in front of her.) Tell him I’ll come quietly. I always do. It’s my only virtue.', next: 'crate' },
      crate: {
        speaker: 'npc:dovina-lull', text: '(She pushes one small crate into your arms.) The last of the good batch. It won’t fit, and I won’t have it smashed on the Close steps. There are forty novices in that infirmary who’ve never slept a night. Give it to the gardener. He’ll know.',
        choices: [{ text: 'I’ll take it to Brother Lambert.', to: null, quest: true }],
      },
    },
  },
  {
    id: 'dialogue:obj-lull-cart-trail-1', name: 'Madame Lull’s blue bottles',
    entries: [{ when: stage('quest:cantor-madame-lulls-draughts', 'cart'), node: 'bottle' }, { node: 'rut' }],
    nodes: {
      bottle: { speaker: 'narrator', text: 'A little blue bottle sitting upright in a wheel-rut, exactly where nobody would tread on it. On the label, in Madame Lull’s hand: “Sweet dreams, Mrs Pargeter. This way.” An arrow.', next: null },
      rut: { speaker: 'narrator', text: 'A cart-rut in the market dust, going round a corner in a hurry.', next: null },
    },
  },
  {
    id: 'dialogue:obj-lull-draught-crate', name: 'Compline: the draught-crate', scope: 'party',
    entries: [
      { when: { all: [stage('quest:cantor-compline', 'crate'), { flag: 'cantor.lull', value: 'turned_in' }] }, node: 'evidence' },
      { when: stage('quest:cantor-compline', 'crate'), node: 'crate' },
      { node: 'lid' },
    ],
    nodes: {
      crate: { speaker: 'narrator', text: 'Madame Lull’s oldest crate, much mended, smelling of chamomile and spilt sincerity. Pasted inside the lid, brown with thirty years of draught, is a sheet of music: Compline, every verse, with “do not throw away” pencilled at the top.', next: null },
      evidence: { speaker: 'narrator', text: 'Madame Lull’s cart stands impounded behind the Brightwatch House, with an evidence ticket on every crate. Nobody stops you looking. Pasted inside the oldest lid is a sheet of music: Compline, every verse, with “do not throw away” pencilled at the top.', next: null },
      lid: { speaker: 'narrator', text: 'An empty draught-crate, with a pale square inside the lid where a page used to be.', next: null },
    },
  },
  {
    id: 'dialogue:cantor-albin', name: 'Albin Mote (Closed for One Hour)',
    entries: [
      { when: stage('quest:cantor-the-word-for-it', 'ask'), node: 'word' },
      { when: stage('quest:cantor-closed-for-one-hour', 'albin'), node: 'clause' },
      { when: stage('quest:cantor-closed-for-one-hour', 'shutters'), node: 'wait' },
      { node: 'start' },
    ],
    nodes: {
      start: {
        speaker: 'npc:albin-mote', text: 'Apples, cheese, onions, the usual. Forty-one years at this stall and I’ve never once shut it. Not once. Not for a wedding. Not for my own.',
        choices: [
          offer('quest:cantor-closed-for-one-hour', 'Would you like to close it?', 'close', done('quest:cantor-the-inquisitors-kindness')),
          { text: 'Two apples, please.', to: 'apples' },
          bye,
        ],
      },
      apples: { speaker: 'npc:albin-mote', text: 'Two apples. They’re a bit tired. Everything’s a bit tired. Mind the bruise.', next: null },
      close: { speaker: 'npc:albin-mote', mood: 'sad', text: 'One hour. Just once, before I die, I’d like to put the shutters up and sit behind them and eat a whole onion. The Market Charter forbids it. Forty clauses. Nailed to the Cross. I’ve never read past the fourth; they’re very long.', next: null },
      clause: {
        speaker: 'npc:albin-mote', text: 'Clause thirty-nine? “For reasons of darkness”? (He reads it three times, moving his lips.) There’s only one hour with any darkness in it.',
        choices: [{ text: 'The Hour of Lamps.', to: 'lamps' }],
      },
      lamps: { speaker: 'npc:albin-mote', mood: 'happy', text: 'The Hour of Lamps! The light dips! Darkness, technically! Oh, I could kiss the clerk who wrote that. He’s been dead three hundred years. I’ll kiss you instead. No? Come and help me with the shutters when it comes. They’ve never been shut. They’ll argue.', next: null },
      wait: { speaker: 'npc:albin-mote', text: 'Not yet, not yet. When the Cathedral dips. I’ve got my onion ready.', next: null },
      word: { speaker: 'npc:albin-mote', text: 'What do I call it? Tuesday. Every day in this market is Tuesday. Nothing happens and it never ends. Nobody fines a man for saying Tuesday.', next: null },
    },
  },
  {
    id: 'dialogue:obj-market-charter', name: 'The Market Charter',
    entries: [{ when: stage('quest:cantor-closed-for-one-hour', 'charter'), node: 'read' }, { node: 'charter' }],
    nodes: {
      read: { speaker: 'narrator', text: 'Forty clauses, in letters a finger high, about weights, measures, cats and the proper height of an onion-heap. Clause thirty-nine, half hidden by a nail: “No stall shall close, save for reasons of darkness.” Whoever wrote it never imagined there wouldn’t be any.', next: null },
      charter: { speaker: 'narrator', text: 'The Market Charter, nailed to the Cross. Clause seventeen is entirely about cats.', next: null },
    },
  },
  {
    id: 'dialogue:obj-albin-stall-shutters', name: 'Albin’s shutters (Hour of Lamps)', scope: 'party',
    entries: [
      { when: { all: [stage('quest:cantor-closed-for-one-hour', 'shutters'), LAMPS] }, node: 'lamps' },
      { when: stage('quest:cantor-closed-for-one-hour', 'shutters'), node: 'day' },
      { node: 'stall' },
    ],
    nodes: {
      stall: { speaker: 'narrator', text: 'Albin Mote’s stall, open, as it has been for forty-one years. The shutters are painted with apples, and the paint has never been scratched.', next: null },
      day: { speaker: 'narrator', text: 'Full light over the Market. Albin is serving a customer and looking at the Cathedral every few seconds. Not yet. Come back in the Hour of Lamps.', next: null },
      lamps: {
        speaker: 'narrator', text: 'The Cathedral dips. You and Albin heave the shutters round on hinges that scream like gulls, and drop the bar. Inside, in the first shade of his life, Albin sits down on a crate and eats a whole raw onion, weeping, entirely happy.',
        effects: [{ setFlag: 'cantor.albin_closed', value: true }], next: null,
      },
    },
  },
  // ---------- the Undercroft: Orla Penwright (Rain at Night), the Hierarch's Shadow
  {
    id: 'dialogue:cantor-orla', name: 'Orla Penwright (Rain at Night)',
    entries: [{ when: stage('quest:cantor-rain-at-night', 'orla'), node: 'open' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:orla-penwright', text: 'Who’s that? Young. Smells of incense and not enough sleep. A Cantor. Come here where I can not-see you.',
        choices: [
          offer('quest:cantor-rain-at-night', 'Is there something you want from the shelves?', 'jar', done('quest:cantor-the-inquisitors-kindness')),
          { text: 'Why do you live down here?', to: 'why' },
          bye,
        ],
      },
      why: { speaker: 'npc:orla-penwright', text: 'My eyes went, and the glare upstairs went on without them. Down here it’s dark, which is the same for me as light, only quieter. Amabel brings me soup.', next: null },
      jar: { speaker: 'npc:orla-penwright', mood: 'sad', text: 'One jar. “Rain at night, C. 1009.” I was forty. I lay awake under the eaves and listened to it with my husband, and we didn’t say a word all night. I’d like to hear it once more before I go.', next: null },
      open: { speaker: 'narrator', text: 'You set the jar in her lap and lift the stopper. Out comes the sound of rain on a slate roof, at night, steady and soft, the most ordinary sound in the world. Orla puts her head back and closes her eyes.', next: 'listen' },
      listen: {
        speaker: 'npc:orla-penwright', text: 'There. That’s it. That’s the gutter on the corner, it always overflowed. (A long pause.) Can you hear it, under the rain? Far off?',
        choices: [
          { text: 'Singing. Far off. A hymn.', to: 'compline', insight: 'compline' },
          { text: 'Only the rain.', to: 'rain', trust: 1 },
        ],
      },
      compline: { speaker: 'npc:orla-penwright', mood: 'happy', text: 'Compline. The Choir sang it every evening, and the sound came across the roofs. Listen, it goes down at the end, not up. (She sings it, in a cracked old voice, every word.) Remember that, Cantor. Somebody should.', next: 'keep' },
      rain: { speaker: 'npc:orla-penwright', mood: 'happy', text: 'Only the rain. Yes. That was the whole of it. Thank you. Leave the stopper out; I’ll listen till it runs dry.', next: 'keep' },
      keep: {
        speaker: 'npc:orla-penwright', text: 'One more thing, and then I’ll let you go. This hour. Me, the rain, you sitting there smelling of incense. Ask Amabel to keep it. On the shelf, with a label. So somebody knows it happened.',
        choices: [{ text: 'I’ll ask her.', to: null, quest: true }],
      },
    },
  },
  {
    id: 'dialogue:obj-jar-rain-1009', name: 'Rain at Night: the jar',
    entries: [{ when: stage('quest:cantor-rain-at-night', 'jar'), node: 'find' }, { node: 'shelf' }],
    nodes: {
      find: { speaker: 'narrator', text: 'Halfway up the fourth shelf, between “a windless night, C. 1008” and “the night the river froze, C. 1010”: “rain at night, C. 1009”. When you tilt it, something inside goes patter.', next: null },
      shelf: { speaker: 'narrator', text: 'A gap on the fourth shelf, between C. 1008 and C. 1010, where a jar of rain used to be.', next: null },
    },
  },
  {
    id: 'dialogue:obj-hierarchs-shadow', name: 'The Hierarch’s shadow', scope: 'party',
    entries: [{ when: stage('quest:cantor-the-hierarchs-shadow', 'shadow'), node: 'bottle' }, { node: 'wall' }],
    nodes: {
      bottle: { speaker: 'narrator', text: 'A tall shadow in a mitre, standing against the far wall by itself, its arms a little raised, as if it had been blessing something when its man walked away. You hold out an empty jar. After a long moment it comes, folding itself small, looking back at the wall the whole way.', next: null },
      wall: { speaker: 'narrator', text: 'A pale patch on the far wall of the Undercroft, shaped like a tall man in a mitre, where a shadow stood for thirty years.', next: null },
    },
  },

  // ======================= ACT II
  {
    id: 'dialogue:cantor-ysmay', name: 'C-1/C-4 Mother Ysmay Penhallow', scope: 'party',
    entries: [
      { when: stage('quest:cantor-the-light-in-the-wood', 'ysmay'), node: 'light' },
      { node: 'start' },
    ],
    nodes: {
      start: {
        speaker: 'npc:ysmay-penhallow', text: 'A Cantor. A real Dawnspire Cantor, with the halo and everything, standing in my chapel. Sit down before I cry on you. We’ve sung the hours at this window for thirty years, towards the lake, and every hour the lake sings back.',
        choices: [
          { text: 'The drowned choir sings back?', to: 'choir', quest: true },
          { text: 'Madame Lull is here?', to: 'lull', when: { flag: 'cantor.lull', value: 'helped' } },
          { text: 'I carry Brightwatch letters of passage.', to: 'letters', when: { flag: 'cantor.night_jars', value: 'broken' } },
        ],
      },
      letters: { speaker: 'npc:ysmay-penhallow', mood: 'afraid', text: 'The Inquisitor’s own seal. (She holds the letter at arm’s length, as if it might be hot.) Then the chapel is yours to command, I suppose. We’ve not seen that seal in thirty years. We hoped we never would. Sit. You’ll want to hear about the choir anyway.', next: 'choir' },
      lull: { speaker: 'npc:ysmay-penhallow', mood: 'happy', text: 'Turned up in a cart a fortnight ago, out of nowhere, and set up outside the Tide Kettle selling lullabies to the drowned. She says they’re her best customers. They never complain.', next: 'choir' },
      choir: { speaker: 'npc:ysmay-penhallow', text: 'The Abbey’s choir, under the water. Abbess Morwen still leads them. Brother Aldous comes out from Brindlecross to listen some nights. Anyone who swims too near, they sing to sleep, and nobody wakes them.', next: 'morwen' },
      morwen: { speaker: 'npc:ysmay-penhallow', text: 'Morwen kept the Turning Bell for a thousand years, and it rang without her leave. She won’t forgive it. Before you go anywhere near her, come and hear them properly, from the end of the Abbey’s old causeway. I haven’t walked it alone in years. Things come up out of the shallows now.', next: null },
      light: { speaker: 'npc:ysmay-penhallow', text: 'There’s a light in the Gloamwood. I’ve watched it from the chapel roof three nights running. It doesn’t go out when the sun does. It doesn’t flicker. It just burns, white, like something nailed up.', next: 'who' },
      who: {
        speaker: 'npc:ysmay-penhallow', mood: 'afraid', text: 'I’ve only ever seen a light like that in Dawnspire. Somebody has brought the Cathedral into the wood.',
        choices: [{ text: 'Lucan.', to: null, quest: true }],
      },
    },
  },
  {
    id: 'dialogue:hook-cantor-tamsin', name: 'Hook: Tamsin rows a Cantor out (C-2)', scope: 'party',
    entries: [{ when: stage('quest:cantor-the-drowned-choir', 'ferry'), node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:tamsin', text: 'Out over the Abbey? On purpose? One copper and a story, and the story had better keep me awake, because they sing out there, and I nod.',
        choices: [
          { text: 'A Cantor fell asleep on the Close steps and woke up saying “dark”.', to: 'story' },
          { text: 'I’ll sing you awake the whole way.', to: 'sing', school: 'radiance', trust: 1 },
        ],
      },
      story: { speaker: 'npc:tamsin', mood: 'happy', text: 'And the whole city heard? Ha! That’ll do. That’ll keep me up. In you get.', next: null },
      sing: { speaker: 'npc:tamsin', text: 'A song for a song. Fair. In you get, then, and don’t stop.', next: null },
    },
  },
  {
    id: 'dialogue:obj-cantor-drowned-choir', name: 'C-2 answering the drowned choir', scope: 'party',
    entries: [{ when: { all: [stage('quest:cantor-the-drowned-choir', 'choir'), { not: { flag: 'cantor.drowned_choir' } }] }, node: 'water' }, { node: 'calm' }],
    nodes: {
      water: { speaker: 'narrator', text: 'Out over the drowned Abbey the water is singing: forty voices, from very far down, a hymn of the hours with the rests all taken out. Tamsin’s pole has stopped. Her eyes are closing. So, nearly, are yours.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'Sing.',
        choices: [
          { text: '(Sing against them: the noon hymn, as loud as you can.)', to: 'against', effects: [{ setFlag: 'cantor.drowned_choir', value: 'against' }] },
          { text: '(Sing with them. Find the part they lost, and take it.)', to: 'with', effects: [{ setFlag: 'cantor.drowned_choir', value: 'with' }] },
          { text: '(Sing them the sleeping hymn the novices learned in the dark.)', to: 'sleeping', when: { flag: 'cantor.night_jars', value: 'opened' }, effects: [{ setFlag: 'cantor.drowned_choir', value: 'sleeping' }] },
          { text: '(Sing Compline.)', to: 'compline', when: { insight: 'compline' }, effects: [{ setFlag: 'cantor.drowned_choir', value: 'compline' }] },
        ],
      },
      against: { speaker: 'narrator', text: 'The noon hymn goes out over the lake like a slap. Below, the choir falters, and comes back angry, and you sing louder, and louder, until something under the water gives way and the north door of the Abbey swings open in the dark.', next: null },
      with: { speaker: 'narrator', text: 'Under the hymn there is a gap where a voice should be. You find it and fill it. For a whole verse the drowned choir sings complete, and then, very gently, the song lets you go, and the north door of the Abbey stands open below.', next: null },
      sleeping: { speaker: 'narrator', text: 'You sing them the hymn forty-one novices learned in an hour of dark. The drowned choir hushes. One by one the voices below go quiet, the way a dormitory goes quiet, and the north door of the Abbey stands open under the still water.', next: null },
      compline: { speaker: 'narrator', text: 'You sing Compline over the drowned Abbey. Below, after a long silence, forty voices pick up the second verse, the one that goes down at the end. They sing it with you, all the way to the amen. Then the north door stands open, and the lake is quiet.', next: null },
      calm: { speaker: 'narrator', text: 'Still water over the drowned Abbey. Far down, the choir is humming to itself.', next: null },
    },
  },
  {
    id: 'dialogue:cantor-morwen-question', name: 'C-3 Morwen’s question', scope: 'party',
    entries: [{ node: 'ask' }],
    nodes: {
      ask: {
        speaker: 'narrator', mood: 'sad', text: 'As the marks settle on the altar step, the Abbess speaks once more, through the water, to you alone: I kept the Bell a thousand years, Cantor. When they ring it again, will they ring it for a Turning, or for a funeral?',
        choices: [
          { text: 'For a Turning.', to: 'turning', effects: [{ setFlag: 'cantor.morwen_answer', value: 'turning' }] },
          { text: 'For a funeral. Somebody has to grieve properly.', to: 'funeral', effects: [{ setFlag: 'cantor.morwen_answer', value: 'funeral' }] },
          { text: 'Both. That’s what Compline is: it sings the day out and the night in.', to: 'both', when: { insight: 'compline' }, effects: [{ setFlag: 'cantor.morwen_answer', value: 'both' }] },
        ],
      },
      turning: { speaker: 'narrator', text: 'Then I will hear it, she says, and closes her eyes.', next: null },
      funeral: { speaker: 'narrator', text: 'Then let it be a good one, she says. Sung all the way through. And she closes her eyes.', next: null },
      both: { speaker: 'narrator', text: 'Both, she says, as if tasting the word. Yes. That is how it was, once. And for the first time in a thousand years the Abbess of the Drowned Bell lies down and sleeps.', next: null },
    },
  },
  {
    id: 'dialogue:obj-cantor-scorched-oak-1', name: 'C-4 the first scorched oak',
    entries: [{ when: stage('quest:cantor-the-light-in-the-wood', 'trail'), node: 'oak' }, { node: 'scar' }],
    nodes: {
      oak: { speaker: 'narrator', text: 'An old oak with a hole burned clean through its trunk, the edges glassy, as if someone had held up a lens to the sun and kept it there for a very long time. The black tears on its bark have boiled, and run, and are still running.', next: null },
      scar: { speaker: 'narrator', text: 'A scorched oak with a hole you can see daylight through.', next: null },
    },
  },
  {
    id: 'dialogue:cantor-lucan-wood', name: 'C-4 Lucan at the Willow', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'At Stag’s Rest the Weeping Willow hangs over the water, her branches black and dripping. In front of her, on a tripod, is a great lens the size of a cartwheel, and behind it a thin man in smoked spectacles is turning the screw.', next: 'lucan' },
      lucan: {
        speaker: 'npc:lucan-in-the-wood', text: 'Cantor! You came through. I knew you would. Look at her, the poor thing. Weeping into the whole wood. I’m burning it out of her. A little more light and she’ll be clean.',
        choices: [
          { text: 'You’re hurting her. She’s weeping harder.', to: 'harder' },
          { text: 'Put the lens down, Lucan.', to: 'down' },
          { text: 'I still have your candle.', to: 'candle', when: { flag: 'cantor.candle', value: 'kept' } },
        ],
      },
      harder: { speaker: 'npc:lucan-in-the-wood', mood: 'sad', text: 'Harder before better. That’s how it works. That’s how it has to work. (Behind the lens the Willow’s branches shudder, and black runs down them in sheets.) She just needs more.', next: 'go' },
      down: { speaker: 'npc:lucan-in-the-wood', text: 'And let the dark have her? No. I’ve seen what the dark does to people it holds. I won’t put anything down ever again.', next: 'go' },
      candle: { speaker: 'npc:lucan-in-the-wood', mood: 'sad', text: '(For a moment his hand comes off the screw.) Do you? Still? (Then it goes back.) It was never enough. Nothing is ever enough. That’s why I need the whole stone.', next: 'go' },
      go: { speaker: 'npc:lucan-in-the-wood', text: 'Someone in the Heart has promised me a lens that never clouds. I’m going to fetch it. Look after her for me until I’m back, would you? Keep her in the light. (He folds the tripod under his arm and walks into the wood, and the white glow goes with him.)', next: null },
    },
  },
  {
    id: 'dialogue:cantor-willow-approach', name: 'C-5 under the Willow', scope: 'party',
    entries: [{ when: { flag: 'cantor.moonflower' }, node: 'flower' }, { node: 'shade' }],
    nodes: {
      shade: { speaker: 'narrator', text: 'Under the Willow’s branches it is darker than the Undercroft, and wet, and the black tears fall like rain. Lucan’s lens has burned pale scars into her bark. She shudders when your halo catches her, and the branches start to move.', next: null },
      flower: {
        speaker: 'narrator', text: 'Under the Willow’s branches it is darker than the Undercroft. In your pocket, something has opened: the moonflower seed you kept from Brother Lambert’s cutting has bloomed in the dark, white as a held breath.',
        choices: [
          { text: '(Hold out the moonflower to her.)', to: 'calm', effects: [{ setFlag: 'cantor.willow_calmed', value: true }] },
          { text: '(Put it away. This isn’t the time.)', to: 'shade' },
        ],
      },
      calm: { speaker: 'narrator', text: 'The nearest branches stop. They come down, slowly, and touch the flower, the way a hand finds a face in the dark. For a long moment the Willow is very still. Then the black comes back into her, but slower, and more sorry about it.', next: null },
    },
  },
  {
    id: 'dialogue:cantor-lullaby-tobit', name: 'C-6 Tobit brings the letter', scope: 'party',
    entries: [{ when: stage('quest:cantor-celestines-lullaby', 'letter'), node: 'asleep' }, { node: 'hello' }],
    nodes: {
      asleep: { speaker: 'narrator', text: 'Novice Tobit Lark is asleep sitting against the Radiance arch, with a letter held to his chest in both hands. When you take it, he wakes all at once and tries to sing.', next: 'tobit' },
      tobit: { speaker: 'npc:tobit-lark-gate', mood: 'happy', text: 'I’m awake! Mother Celestine said give it to you and nobody else. I walked the whole Dawn Road. I slept in a hedge. A real hedge! It was wonderful.', next: 'letter' },
      letter: {
        speaker: CH, text: '“A lullaby, with words, which I have finally written down, so that you will have one. Sing it to whatever needs it. The Close is very quiet without you, and the Brightwatch is very confused without the bell.” (At the bottom, in a smaller hand:) “I slept. Twice. C. H.”',
        choices: [
          { text: '(Fold the letter away.)', to: 'end', quest: true, effects: [{ setFlag: 'cantor.celestine_letter', value: true }] },
          { text: 'She slept, Tobit.', to: 'slept', quest: true, effects: [{ setFlag: 'cantor.celestine_letter', value: true }] },
        ],
      },
      slept: { speaker: 'npc:tobit-lark-gate', mood: 'happy', text: 'She did! In the garth, both times, and Sister Amabel sat with her and nobody dared say a word. Even Sergeant Bellamy. He called it a soft hour.', next: 'end' },
      end: { speaker: 'npc:tobit-lark-gate', text: 'I’m going to have a look round. I might have a nap first. Just a little one. Over there, out of the way.', next: null },
      hello: { speaker: 'npc:tobit-lark-gate', text: '(He is asleep against the arch with his mouth open, very peacefully.)', next: null },
    },
  },
  {
    id: 'dialogue:cantor-lullaby-lull', name: 'C-6 Madame Lull smuggles the letter', scope: 'party',
    entries: [{ when: stage('quest:cantor-celestines-lullaby', 'letter'), node: 'start' }],
    nodes: {
      start: { speaker: 'npc:dovina-lull-shore', text: 'Darling. Don’t look so surprised. Your face is on every Brightwatch door in Dawnspire, and letters with your name on them get read. So Mother Celestine sent it to me, at the bottom of a crate of draughts, through the arch. I always turn up where I’m needed.', next: 'letter' },
      letter: {
        speaker: CH, text: '“A lullaby, with words, which I have finally written down, so that you will have one. Sing it to whatever needs it. They have taken your face off the Choir door; I have put it back.” (At the bottom, in a smaller hand:) “I slept. Twice. C. H.”',
        choices: [{ text: '(Fold the letter away.)', to: 'end', quest: true, effects: [{ setFlag: 'cantor.celestine_letter', value: true }] }],
      },
      end: { speaker: 'npc:dovina-lull-shore', mood: 'happy', text: 'Twice! I’d like to think a draught was involved. It wasn’t, she’s far too proud. Off you go, darling. The drowned are waiting for their lullabies.', next: null },
    },
  },
  {
    id: 'dialogue:cantor-lull-shore', name: 'Madame Lull at Abbeyshore',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:dovina-lull-shore', mood: 'happy', text: 'Lullabies for the drowned, darling, one shard a verse. They’re the best customers I’ve ever had. They never complain and they always fall asleep before the end.', next: null },
    },
  },
  // ---------- Brindlecross hooks
  {
    id: 'dialogue:hook-cantor-corwin', name: 'Hook: Corwin Hale meets a Cantor',
    entries: [{ when: { all: [{ flag: 'cantor.celestine_farewell' }, { not: { flag: 'cantor.corwin_told' } }] }, node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:corwin', text: 'Dawnspire, eh? My family came out of Solaria four generations back. There’s a cousin there I’ve never met. A Hale. Something in the Cathedral, my gran said.',
        choices: [
          { text: 'Mother Celestine Hale. She taught me to sing.', to: 'cousin', effects: [{ setFlag: 'cantor.corwin_told', value: true }] },
          { text: 'There are a lot of Hales in Dawnspire.', to: 'lot', effects: [{ setFlag: 'cantor.corwin_told', value: true }] },
        ],
      },
      cousin: { speaker: 'npc:corwin', mood: 'happy', text: 'Taught you? Well, I’ll be. A singer. We’re millers, the rest of us. Can’t hold a tune in a sack. If you write to her, tell her the Concordia Hales send their regards, and a loaf.', next: null },
      lot: { speaker: 'npc:corwin', text: 'Aye, I suppose there would be. Well, if you meet a Hale who never sleeps and can’t abide a draught, that’ll be family.', next: null },
    },
  },
  // ---------- featured bearers (hooks on the bearer NPCs)
  {
    id: 'dialogue:cantor-featured-bard', name: 'Featured: A Duet for the Drowned', scope: 'party',
    entries: [
      { when: stage('quest:cantor-a-duet-for-the-drowned', 'back'), node: 'back' },
      { when: { all: [stage('quest:cantor-a-duet-for-the-drowned', 'duet'), { not: { flag: 'cantor.lark_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-bard', text: 'A Cantor! Thank the Concord. I want to write the drowned choir a song worth waking up for, and every hymn I know is opera with the jokes taken out. You know what they used to sing. Come to the Shore Chapel and help me steal it.',
        choices: [{ text: 'It isn’t stealing if they get it back.', to: null, quest: true, effects: [{ setFlag: 'cantor.lark_asked', value: true }] }],
      },
      back: {
        speaker: 'npc:bearer-bard', mood: 'happy', text: 'I can’t stop humming it. I get to the end and it starts again by itself; that’s how you know. Whatever happens at the Heart, I want you singing the other part.',
        effects: [{ setFlag: 'cantor.lark_thanked', value: true }],
        choices: [{ text: 'The low part. You take the tune.', to: null }, { text: 'Gladly.', to: null }],
      },
    },
  },
  {
    id: 'dialogue:obj-cantor-chapel-psalter', name: 'Featured: the Shore Chapel psalter', scope: 'party',
    entries: [{ when: stage('quest:cantor-a-duet-for-the-drowned', 'duet'), node: 'open' }, { node: 'psalter' }],
    nodes: {
      psalter: { speaker: 'narrator', text: 'The old Abbey psalter, swollen with damp, the choir’s parts in faded red. Someone has written a new song in the margins.', next: null },
      open: {
        speaker: 'narrator', text: 'The Abbey’s old psalter, the choir’s parts in faded red. Lark Ellery has a pencil behind each ear and a third in her mouth. What do you write for forty voices who have been singing under a lake for thirty years?',
        choices: [
          { text: 'A hymn with a rest in it. Somewhere for them to breathe.', to: 'rest', effects: [{ setFlag: 'cantor.duet', value: 'rest' }] },
          { text: 'A lullaby. They’ve been singing everyone else to sleep.', to: 'lullaby', effects: [{ setFlag: 'cantor.duet', value: 'lullaby' }] },
          { text: 'A drinking song. They’re monks. Trust me.', to: 'drinking', effects: [{ setFlag: 'cantor.duet', value: 'drinking' }] },
        ],
      },
      rest: { speaker: 'narrator', text: 'Four bars of hymn, and then a bar with nothing in it at all, marked with a little curl. Lark stares at it for a long time and says that is the best thing anyone has ever written in front of her.', next: null },
      lullaby: { speaker: 'narrator', text: 'You write it low and slow, a lullaby with the choir’s own hymn hidden in the bass. Lark sings it back to you under her breath, and Mother Ysmay, in the doorway, has to sit down.', next: null },
      drinking: { speaker: 'narrator', text: 'It turns out the Abbey’s choir had a drinking song, in the back of the psalter, in a different hand, with a great many verses about a brother and a goose. Lark adds three more. From the lake, faintly, something laughs.', next: null },
    },
  },
  {
    id: 'dialogue:cantor-featured-ranger', name: 'Featured: What the Willow Feeds', scope: 'party',
    entries: [
      { when: stage('quest:cantor-what-the-willow-feeds', 'back'), node: 'back' },
      { when: { all: [stage('quest:cantor-what-the-willow-feeds', 'saplings'), { not: { flag: 'cantor.rowan_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-ranger', text: 'You’re the one who sings at things. Before you sing at the Willow, come and look at what’s growing underneath her. Then tell me she should live forever.',
        choices: [{ text: 'Show me.', to: null, quest: true, effects: [{ setFlag: 'cantor.rowan_asked', value: true }] }],
      },
      back: {
        speaker: 'npc:bearer-ranger', text: 'I still think things should be let die when it’s their time. I just don’t think I get to say when that is, any more than you do. That’s new. I don’t like it. When we go to the Heart, I’ll walk on your dark side.',
        effects: [{ setFlag: 'cantor.rowan_thanked', value: true }],
        choices: [{ text: 'I haven’t got a dark side.', to: 'side' }, { text: 'Thank you, Rowan.', to: null }],
      },
      side: { speaker: 'npc:bearer-ranger', mood: 'happy', text: 'Everyone’s got one. Yours has just never been allowed out.', next: null },
    },
  },
  {
    id: 'dialogue:obj-cantor-willow-saplings', name: 'Featured: the saplings under the Willow', scope: 'party',
    entries: [
      { when: { all: [stage('quest:cantor-what-the-willow-feeds', 'saplings'), { flag: 'story.sentinel.verdant' }] }, node: 'freed' },
      { when: stage('quest:cantor-what-the-willow-feeds', 'saplings'), node: 'weeping' },
      { node: 'ring' },
    ],
    nodes: {
      weeping: { speaker: 'narrator', text: 'A ring of saplings in the deep shade under the Willow, thin and pale, black tears dripping on them from above. Every one of them is leaning outwards, towards the light beyond her skirts. Rowan says nothing at all. Rowan does not need to.', next: 'think' },
      freed: { speaker: 'narrator', text: 'Under the Willow, now that she has stopped weeping, a ring of saplings has started to green. They still lean outwards, towards the light. The Willow’s branches are lifting, slowly, to let it in. Nobody asked her to.', next: 'think' },
      think: {
        speaker: 'narrator', text: 'Rowan Thornbury crouches by the nearest sapling and waits for you to say something.',
        choices: [
          { text: 'She’s been keeping them in the dark too long. So was I.', to: null },
          { text: 'Then she’ll lift her branches. Trees can do that. So can people.', to: null },
        ],
      },
      ring: { speaker: 'narrator', text: 'A ring of young trees under the Willow, leaning towards the light.', next: null },
    },
  },
  // ======================= ACT III
  {
    id: 'dialogue:cantor-herald-fate', name: 'III-4 the Herald of Noon: Lucan’s fate', scope: 'party',
    entries: [{ when: { flag: 'cantor.night_jars', value: 'broken' }, node: 'burned' }, { node: 'kneel' }],
    nodes: {
      kneel: { speaker: LU, mood: 'hollow', text: '(He kneels in his robe of white fire, hands pressed over his smoked spectacles.) Don’t let it get dark. Please. It was dark when Mother died. If it’s dark, I’ll have to think about it.', next: 'choose' },
      burned: { speaker: LU, mood: 'hollow', text: 'You broke the jars in the sun. I watched you. Every night Dawnspire had left, gone. (He kneels, blazing.) You burned it too. You know why. Don’t let it get dark.', next: 'choose' },
      choose: {
        speaker: LU, mood: 'sad', text: 'Thirty years, Cantor. I haven’t slept in thirty years. I’m so tired. Please don’t make me close my eyes.',
        choices: [
          {
            text: '(Take off his spectacles, gently, and sing the light down.)', to: 'sleep', quest: true,
            when: { any: [{ flag: 'cantor.night_jars', value: 'compline' }, { trust: CH, value: 'trusted' }] },
            lockedLabel: 'You need the hymn that sang the light down',
            effects: [{ setFlag: 'cantor.nemesis_fate', value: 'spared' }],
          },
          { text: 'Then don’t close them. (Put out the light.)', to: 'destroy', quest: true, effects: [{ setFlag: 'cantor.nemesis_fate', value: 'destroyed' }] },
        ],
      },
      sleep: { speaker: 'narrator', text: 'You take off his spectacles. His eyes are red and raw and very young. You sing the light down, the way the Choir sang it down at the end of every day before the Hierarch forbade it, and the Heart’s dark comes in round the two of you like a blanket.', next: 'sleep2' },
      sleep2: { speaker: 'narrator', text: 'The white fire goes out of his robe a ray at a time. The bell rings noon, and then it does not ring at all. Lucan Brightwater lies down on the Twelve Stairs with his head on his arm, like a boy, and sleeps.', next: 'sleep3' },
      sleep3: { speaker: LU, mood: 'sad', text: '(Very quietly, not awake.) …Mother? It’s dark. It’s all right. It’s only dark.', next: null },
      destroy: { speaker: 'narrator', text: 'You put the light out, all of it, all at once, the way you would pinch a wick. The Herald of Noon goes dark on the stair, and in the dark there is nothing left but a pair of smoked spectacles and a loaf.', next: null },
    },
  },
  {
    id: 'dialogue:obj-cantor-compline-steps', name: 'Compline at the Citadel', scope: 'party',
    entries: [
      { when: { all: [{ heroClass: 'cantor' }, stage('quest:cantor-compline-at-the-citadel', 'compline'), { hour: [21, 4] }, { flag: 'cantor.celestine_devotable' }] }, node: 'devoted' },
      { when: { all: [{ heroClass: 'cantor' }, stage('quest:cantor-compline-at-the-citadel', 'compline'), { hour: [21, 4] }] }, node: 'night' },
      { when: { all: [{ heroClass: 'cantor' }, stage('quest:cantor-compline-at-the-citadel', 'compline')] }, node: 'day' },
      { node: 'steps' },
    ],
    nodes: {
      steps: { speaker: 'narrator', text: 'The top of the Twelve Stairs, where Compline was sung. It is quieter here than anywhere else in the Heart.', next: null },
      day: { speaker: 'narrator', text: 'The Citadel steps. Compline is the evening hymn; it belongs to the end of the day. Come back at night.', next: null },
      night: {
        speaker: 'narrator', text: 'Night at the top of the Twelve Stairs, with the Citadel doors open behind you and the whole black Heart below. No sun anywhere. You open your mouth to sing.',
        effects: [{ setFlag: 'cantor.compline_sung', value: true }],
        choices: [
          { text: '(Sing Compline, the hymn Celestine remembered one line of.)', to: 'compline', when: { insight: 'compline' } },
          { text: '(Sing Celestine’s lullaby, the one she wrote down for you.)', to: 'lullaby' },
        ],
      },
      compline: { speaker: 'narrator', text: 'You sing it all the way through, the hymn the Hierarch banned: the one that sings the light down gently, and lets the dark in, and calls it rest. Down on the stairs, one by one, the bearers stop talking to listen.', next: null },
      lullaby: { speaker: 'narrator', text: 'You sing her lullaby, the one she wrote down for you with words. It was always Compline, really. She just couldn’t remember the tune, so she made one. Down on the stairs, one by one, the bearers stop talking to listen.', next: null },
      devoted: {
        speaker: 'narrator', text: 'Night at the top of the Twelve Stairs, with the Citadel doors open behind you and the whole black Heart below. No sun anywhere. You open your mouth to sing.',
        effects: [{ setFlag: 'cantor.compline_sung', value: true }, { trust: CH, set: 5 }],
        choices: [
          { text: '(Sing Compline, the hymn Celestine remembered one line of.)', to: 'compline-d', when: { insight: 'compline' } },
          { text: '(Sing Celestine’s lullaby, the one she wrote down for you.)', to: 'lullaby-d' },
        ],
      },
      'compline-d': { speaker: 'narrator', text: 'You sing it all the way through, the hymn the Hierarch banned: the one that sings the light down gently, and lets the dark in, and calls it rest. Down on the stairs, one by one, the bearers stop talking to listen.', next: 'asleep' },
      'lullaby-d': { speaker: 'narrator', text: 'You sing her lullaby, the one she wrote down for you with words. It was always Compline, really. She just couldn’t remember the tune, so she made one. Down on the stairs, one by one, the bearers stop talking to listen.', next: 'asleep' },
      asleep: { speaker: 'narrator', mood: 'happy', text: 'And far away in Dawnspire, in the middle of the Choir stalls, with her mouth still open on the next hour’s psalm, Mother Celestine Hale puts her head down on Sister Amabel’s shoulder, and sleeps.', next: null },
    },
  },
  {
    id: 'dialogue:obj-cantor-brightwatch-recruits', name: 'The Brightwatch Recruits', scope: 'party',
    entries: [{ when: { all: [{ heroClass: 'cantor' }, stage('quest:cantor-the-brightwatch-recruits', 'salute')] }, node: 'recruits' }, { node: 'gone' }],
    nodes: {
      recruits: { speaker: 'narrator', text: 'A rank of Brightwatch recruits in the Legion, in white tabards gone grey, none of them older than twenty. Every one has a hand raised to the brow, saluting the place in the black sky where the sun ought to be. Their arms are shaking.', next: 'arm' },
      arm: {
        speaker: 'narrator', text: 'They have been holding it a long time. Nobody has told them they may put their arms down.',
        choices: [
          { text: 'At ease. (Say it the way a sergeant says it.)', to: 'ease', quest: true },
          { text: '(Sing the light down for them, softly, the way you would for the novices.)', to: 'sing', quest: true, school: 'radiance' },
        ],
      },
      ease: { speaker: 'narrator', text: 'Arms come down all along the rank like wheat in a wind. The youngest sits straight down on the ground and bursts into tears, ordinary tears, and says he is sorry, he is so sorry, he only wanted to be useful.', next: null },
      sing: { speaker: 'narrator', mood: 'happy', text: 'You sing the light down, very softly, and their arms come down with it, one by one. By the end of the hymn half of them are asleep on their feet, leaning on each other, like novices between the amen and the next psalm.', next: null },
      gone: { speaker: 'narrator', text: 'A neat row of white tabards, folded, in the dust of the Legion camp.', next: null },
    },
  },
  {
    id: 'dialogue:cantor-tobit-heart', name: 'Tobit Lark Falls Asleep', scope: 'party',
    entries: [
      { when: stage('quest:cantor-tobit-lark-falls-asleep', 'tucked'), node: 'tucked' },
      { when: stage('quest:cantor-tobit-lark-falls-asleep', 'camp'), node: 'wake' },
      { node: 'later' },
    ],
    nodes: {
      tucked: { speaker: 'narrator', text: 'In a little clear space in the middle of the Legion, Novice Tobit Lark is fast asleep under eleven borrowed cloaks. The hollowed stand round him in a ring, weeping very quietly, so as not to wake him.', next: 'how' },
      how: {
        speaker: 'narrator', text: 'If he wakes here, he will scream. If he screams, the whole Legion will turn round.',
        choices: [
          { text: '(Lift him, cloaks and all, very slowly.)', to: 'lift', quest: true },
          { text: '(Hum the psalm he always falls asleep in, and carry him out on it.)', to: 'hum', quest: true, school: 'radiance' },
        ],
      },
      lift: { speaker: 'narrator', text: 'He weighs nothing. He mumbles “Is it the amen yet?” into your collar, and you say “Not yet,” and he goes back to sleep. The hollowed part to let you through, as gently as if you were carrying one of their own.', next: null },
      hum: { speaker: 'narrator', mood: 'happy', text: 'You hum it low and lift him, and he settles into it the way he settles into every psalm. The hollowed hum it too, under their breath, all the way to the edge of the camp. You didn’t know the hollowed could hum.', next: null },
      wake: {
        speaker: 'npc:tobit-lark-heart', text: '(On a bedroll at the Heart camp, Tobit Lark opens one eye.) Is it the amen yet? (He sits up.) Wait. Where am I? Did I miss it? Did I miss the end of the world?',
        choices: [
          { text: 'Not yet. Go back to sleep.', to: 'sleep', quest: true },
          { text: 'You slept through the Hollow Legion, Tobit.', to: 'legion', quest: true },
        ],
      },
      sleep: { speaker: 'npc:tobit-lark-heart', mood: 'happy', text: 'Oh, good. (He lies straight back down.) Wake me for the good bit.', next: null },
      legion: { speaker: 'npc:tobit-lark-heart', mood: 'happy', text: 'Did I? I slept in a hedge on the way here, too. I’m getting very good at it. (He yawns enormously.) Mother Celestine says it’s a gift. Wake me for the good bit.', next: null },
      later: { speaker: 'npc:tobit-lark-heart', text: '(Tobit is asleep again, smiling.)', next: null },
    },
  },
];

export default dialogues;
