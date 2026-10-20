/**
 * Hollow Crown, STORMLANCER: Thunderclap Heights people (general talk), the eight side quests, the mentor thread and
 * the bounties, plus the Act II class-thread, featured-bearer and hook scenes. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const offer = (q: Q, text: string, to: string, extra?: NarrativeCondition): DialogueChoice =>
  ({ text, to, quest: true, when: extra ? { all: [fresh(q), extra] } : fresh(q), effects: [{ startQuest: q }] });
const bye: DialogueChoice = { text: 'Farewell.', to: null, tag: 'leave' };
const NIGHT: NarrativeCondition = { hour: [21, 4] };
const SL: NarrativeCondition = { heroClass: 'stormlancer' };
const OG = 'npc:odran-gale' as const;

const dialogues: DialogueDef[] = [
  // ---------- Odran (general + mentor thread)
  {
    id: 'dialogue:stormlancer-odran', name: 'Odran (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: OG, text: '(He is lying in the grass beside his doorstep, looking at the sky.) No hurry. Sit down. Ground’s comfortable. Never throws you.',
        choices: [
          offer('quest:stormlancer-why-odran-falls-off', 'Why do you fall off so much?', 'falls', { trust: OG, value: 'friendly' }),
          offer('quest:stormlancer-maudies-lance', 'Whose is the lance over your door?', 'lance', { all: [{ trust: OG, value: 'trusted' }, { questCompleted: 'quest:stormlancer-the-cowards-cairn' }] }),
          { text: 'Why are you lying in the grass?', to: 'grass' },
          bye,
        ],
      },
      falls: { speaker: OG, text: 'On purpose, mostly. (He gets up. It takes a while.) I’ll show you. Come round to the practice post. Bring a cushion, if you like. Not for you.', next: null },
      lance: {
        speaker: OG, mood: 'sad', text: 'Maudie’s. My wife. She died last winter. She always said she wanted it planted on the high ledge of the Eyrie Steps, where she used to watch the storm from. I’ve never got up there with it. My knees, I tell people. (He takes it down and puts it in your hands.) Would you?',
        next: null,
      },
      grass: {
        speaker: OG, text: 'Thinking. You can’t think on a ram. Ram does the thinking. Down here, it’s just me and the clouds, and the clouds don’t argue.',
        choices: [
          { text: 'Why do you always let everyone else go first?', to: 'first', when: { trust: OG, value: 'friendly' } },
          { text: '(Lie down in the grass beside him.)', to: 'start' },
        ],
      },
      first: { speaker: OG, mood: 'happy', text: 'I was first, once. Fastest boy on the Thunderclap Run, three summers running. Won it by a mile, every time. (He chews a grass stem.) Nobody to talk to at the finish. Just me and the post, waiting for everyone else.', next: 'post' },
      post: {
        speaker: OG, text: 'Fourth summer I came in last, on purpose, with my cousin, who had a bad leg. Best race I ever ran. We talked the whole way round. Took us an hour and a half.',
        choices: [
          { text: 'Did they laugh at you?', to: 'laugh' },
          { text: 'So you gave everybody time instead.', to: 'time', trust: 1 },
        ],
      },
      laugh: { speaker: OG, text: 'Course they did. Laughed all the way to the finish, the two of us, and then everyone else was laughing too, and nobody could remember who’d won. That’s a good race. Lie down, pup. The clouds are doing something.', next: 'start' },
      time: { speaker: OG, text: 'It’s the only thing I’m any good at giving. (He points at a cloud.) That one looks like Biddy. Don’t tell her.', next: 'start' },
    },
  },
  {
    id: 'dialogue:obj-odran-practice-post', name: 'Mentor: Odran at the practice post', scope: 'party',
    entries: [{ when: stage('quest:stormlancer-why-odran-falls-off', 'watch'), node: 'watch' }, { node: 'post' }],
    nodes: {
      watch: { speaker: 'narrator', text: 'Odran rides at the practice post on Old Biddy. He falls off. He gets up, slowly, and rides at it again. He falls off. Four times. Each time he lands a little further downwind, and each time he lands rolling, and each time he is laughing.', next: 'wind' },
      wind: { speaker: 'narrator', text: 'And each time, by the time he has got up, the gust that knocked him off has gone past, and he is standing in the calm behind it.', next: null },
      post: { speaker: 'narrator', text: 'The practice post behind Odran’s steading, and around it, a great many Odran-shaped dents in the turf.', next: null },
    },
  },
  {
    id: 'dialogue:stormlancer-odran-falls', name: 'Mentor: Why Odran Falls Off', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: OG, text: 'Saw it, did you? The oldest lancers’ trick. Before the clans ever charged a storm. You don’t ride into it. You let it knock you down, and you get up behind it.', next: 'wake' },
      wake: {
        speaker: OG, mood: 'happy', text: 'A storm goes home to its eye in the end. Always does. The old riders rode in its wake: wind at your back, lightning already fallen, nothing in front of you but the way it’s going. Nobody charges a storm and wins. You follow it home.',
        choices: [{ text: 'Then the bravest place to ride is second.', to: 'end', insight: 'ride_the_wake', trust: 1 }],
      },
      end: { speaker: OG, text: 'Second. Aye. Remember that, if anybody ever shouts “charge” at you in a yard full of chimes.', next: null },
    },
  },
  {
    id: 'dialogue:stormlancer-odran-cairn', name: 'The Coward’s Cairn: Odran’s name', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: OG, text: 'Read the bottom stone, did you. Aye. That’s me. Forty years ago, the clans charged a storm off the north end. I was at the front. I was going to be on the Brave Stone.',
        choices: [{ text: 'What happened?', to: 'what' }],
      },
      what: {
        speaker: OG, mood: 'sad', text: 'Somebody behind me went down. Her ram threw her in the rain. And I turned round. Rode back, against everyone, and picked her up out of the mud, and the charge went on without us. They put my name on the cairn that night.',
        choices: [{ text: 'Who was she?', to: 'maudie', trust: 1 }],
      },
      maudie: { speaker: OG, mood: 'happy', text: 'Maudie. She lived another forty years, and married me, and laughed at that cairn every time we rode past it. Never asked them to take my name down. I like it there. It’s the best thing I ever did, written on a stone.', next: 'tamar' },
      tamar: { speaker: OG, text: 'Who sent you to read it? Tamar? (He laughs.) Her nan’s on the third row. Turned back to carry her own brother out of a charge. Go and tell Tamar that, pup. She spits at that cairn very carefully, and now she’ll know why.', next: null },
    },
  },
  {
    id: 'dialogue:obj-maudie-lance', name: 'Mentor: Maudie’s lance', scope: 'party',
    entries: [{ when: stage('quest:stormlancer-maudies-lance', 'plant'), node: 'plant' }, { node: 'lance' }],
    nodes: {
      plant: {
        speaker: 'narrator', text: 'The high ledge of the Eyrie Steps, with the whole of the Heights below and the storm walking across them. You set the butt of Maudie’s lance in a crack in the rock. Its faded pennant streams out in the wind, pointing at the storm, watching it.',
        choices: [{ text: '(Stand with it a while.)', to: 'stand' }, { text: '(Go back down.)', to: null }],
      },
      stand: { speaker: 'narrator', text: 'You stand beside it until the storm has gone over. It is a very good place to watch from. She was right.', next: null },
      lance: { speaker: 'narrator', text: 'Maudie’s lance, planted on the high ledge of the Eyrie Steps, its pennant out in the wind.', next: null },
    },
  },
  {
    id: 'dialogue:stormlancer-odran-maudie', name: 'Mentor: Maudie’s Lance', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: OG, text: 'It’s up there? On the high ledge? (He looks up at the Eyrie Steps for a long time. You can’t see the lance from here. He looks anyway.) She’ll be pleased. She hated it over the door. Said it made the house look like a barracks.', next: 'end' },
      end: { speaker: OG, mood: 'sad', text: 'Thirty years I said I’d carry it up. My knees, I said. It wasn’t my knees. Thank you, pup. You went up so I didn’t have to go first.', effects: [{ trust: OG, delta: 1 }], next: null },
    },
  },
  {
    id: 'dialogue:stormlancer-old-biddy', name: 'Old Biddy',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:old-biddy', text: '(Old Biddy looks at you, decides you are not worth throwing today, and goes back to eating a glove.)', next: null } },
  },
  {
    id: 'dialogue:stormlancer-cass', name: 'Cass (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:cass-vantor', mood: 'happy', text: 'Can’t stop! Can’t talk! Catch me if you want to talk! (She is already a hundred yards away.)', next: null } },
  },
  // ---------- the Ram Pastures: Thistle, Wendeline, Gwenna
  {
    id: 'dialogue:stormlancer-thistle', name: 'Thistle',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:thistle', text: '(Cass’s ram, standing in her stall, facing the door. Her trough is full. It has been full for a month. When you come in, her ears go up, and then, slowly, down.)',
        choices: [offer('quest:stormlancer-thistle-wont-eat', '(Stroke her nose.) You’re waiting for her.', 'wait'), bye],
      },
      wait: { speaker: 'narrator', text: 'She leans her forehead against your chest and stays there. She is waiting for someone who smells of hay and lightning and oranges, and you are only you. Something of Cass’s might help.', next: null },
    },
  },
  {
    id: 'dialogue:obj-cass-saddle-blanket', name: 'Thistle: Cass’s blanket',
    entries: [{ node: 'blanket' }],
    nodes: { blanket: { speaker: 'narrator', text: 'Cass’s old saddle-blanket, hanging on a peg in her empty steading, faded blue and worn thin in the middle. It still smells of her. On the peg beside it, there is no bridle: just the shape where one used to hang.', next: null } },
  },
  {
    id: 'dialogue:stormlancer-thistle-eats', name: 'Thistle eats', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:thistle', text: '(You lay the blanket over Thistle’s back. She turns her head and smells it for a long time. Then she turns round, away from the door, for the first time in a month, and puts her nose in the trough.)',
        choices: [{ text: 'Good girl.', to: 'eat', trust: 1 }, { text: '(Leave her to it.)', to: 'eat' }],
      },
      eat: { speaker: 'narrator', text: 'She eats a little. Not much. Enough. Then she lifts her head and butts the stall door, once, twice, and looks at you. She doesn’t want to wait any more. She wants to go and look.', next: null },
    },
  },
  {
    id: 'dialogue:stormlancer-wendeline', name: 'Wendeline Chyme (the Chime-Maker)',
    entries: [{ when: stage('quest:stormlancer-the-chime-maker', 'wendeline'), node: 'true' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:wendeline-chyme', text: 'Hear that? Every chime on the Heights, the same note. Since the Bell. A chime that tells you nothing is just noise with a hook on it.',
        choices: [offer('quest:stormlancer-the-chime-maker', 'Can they be retuned?', 'tune'), bye],
      },
      tune: { speaker: 'npc:wendeline-chyme', text: 'The four great chimes in the yard can, and the rest follow them. Tap each with the butt of your lance. High, low, high, low. You’ve the right sort of ear. I can tell by the way you’re wincing.', next: null },
      true: {
        speaker: 'npc:wendeline-chyme', mood: 'happy', text: 'Four notes! Four! Wind from the north-east, storm coming in on the third note, gone by the fourth. (She is nearly dancing.) I could kiss you. I could kiss your lance.',
        choices: [{ text: 'What was the note they were all ringing?', to: 'note' }, { text: 'The lance would be honoured.', to: 'small', trust: 1 }],
      },
      note: { speaker: 'npc:wendeline-chyme', text: 'The Bell’s. Whatever rang far away that night, every chime I ever made learned its note in one go and wouldn’t forget it. They’re still humming it, very quietly, under the new ones. Listen.', next: 'small' },
      small: {
        speaker: 'npc:wendeline-chyme', text: '(She unhooks a little chime from her belt, no bigger than a spoon, ringing on its own.) This one won’t retune. Only rings the Bell. It wants a door where somebody lies in the grass and listens. You know the door.',
        choices: [{ text: 'Odran’s.', to: null, quest: true }],
      },
    },
  },
  {
    id: 'dialogue:obj-wind-chime-1', name: 'The Chime-Maker: a great chime',
    entries: [{ node: 'chime' }],
    nodes: { chime: { speaker: 'narrator', text: 'A great wind-chime of copper tubes, taller than you, ringing one flat note over and over. You tap the longest tube with your lance-butt. It shivers, and slides down a step, and rings true.', next: null } },
  },
  {
    id: 'dialogue:stormlancer-gwenna', name: 'Gwenna Fold (bounties)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:gwenna-fold', text: 'Bounties on the post. Herds first. Glory after, if there’s any left over.',
        choices: [
          offer('quest:stormlancer-bounty-pasture-wisps', 'The pasture wisps.', 'wisps'),
          offer('quest:stormlancer-bounty-gorge-thunderbirds', 'The gorge Thunderbirds.', 'birds', { questCompleted: 'quest:stormlancer-the-ram-kings-crag' }),
          bye,
        ],
      },
      wisps: { speaker: 'npc:gwenna-fold', text: 'Hollow Static Wisps in the long grass at dusk, spooking the herds. Six of them. A spooked ram runs till it hits something, and the something is usually me.', next: null },
      birds: { speaker: 'npc:gwenna-fold', text: 'Thunderbirds diving on the herds down in Skyfall Gorge. Six. Paid by the bird. Don’t bring me the bird.', next: null },
    },
  },
  // ---------- the Thunderclap Heights: Osric, Tamar
  {
    id: 'dialogue:stormlancer-osric', name: 'Osric Quell (Learn the Pattern)',
    entries: [{ when: stage('quest:stormlancer-learn-the-pattern', 'osric'), node: 'done' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:osric-quell', text: 'The clans’ oldest trial. Cross the Heights in a lightning storm by stepping where it won’t strike. Perfectly safe. Perfectly. (Every one of his boots is scorched.)',
        choices: [offer('quest:stormlancer-learn-the-pattern', 'I’ll take the trial.', 'trial'), { text: 'Your boots are on fire.', to: 'boots' }, bye],
      },
      boots: { speaker: 'npc:osric-quell', text: 'Smouldering. Not on fire. There’s a difference, and the difference is about a minute. Now: the trial.', next: 'start' },
      trial: { speaker: 'npc:osric-quell', text: 'Four strike-stones across the open Heights. Step on each one between strikes. Never step anywhere else. And don’t run. Running is how you get a scorch-mark somewhere you can’t sit on.', next: null },
      done: {
        speaker: 'npc:osric-quell', mood: 'happy', text: 'Across! On the stones! And barely smouldering! You’ve the knack. Do you know, the very oldest pattern on the stones isn’t a crossing at all? It runs behind the storm. Always behind.',
        choices: [
          { text: 'Behind it. Riding the wake, where the lightning’s already fallen.', to: 'wake', insight: 'ride_the_wake', trust: 1, trustNpc: 'npc:osric-quell' },
          { text: 'I’ll stick to crossing.', to: 'map' },
        ],
      },
      wake: { speaker: 'npc:osric-quell', text: 'The wake! That’s the word the old riders used! Nobody’s done it in a hundred years. The young ones want to go first. Going first is how I got these boots.', next: 'map' },
      map: { speaker: 'npc:osric-quell', mood: 'afraid', text: 'There’s one stone I’ve never been to. The oldest pattern runs off the edge of my map, behind where storms go, to a stone on its own on the far side of the Heights. I’ve always meant to. I keep meaning to. Would you?', next: null },
    },
  },
  {
    id: 'dialogue:obj-strike-step-1', name: 'Learn the Pattern: a strike-stone',
    entries: [{ node: 'step' }],
    nodes: { step: { speaker: 'narrator', text: 'A flat stone in the open grass, glassy from old strikes. You wait for the flash, count three, and step. The lightning hits the grass a yard to your left, exactly where you would have been if you had run.', next: null } },
  },
  {
    id: 'dialogue:stormlancer-tamar', name: 'Tamar Mallory (the Coward’s Cairn)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:tamar-mallory', text: 'Know what that is? The Coward’s Cairn. Every lancer who ever turned back from a charge. (She spits, carefully, so as not to hit it.) Bet you can’t read the oldest name. It’s right at the bottom. Go on. I dare you.',
        choices: [offer('quest:stormlancer-the-cowards-cairn', 'I’ll read it.', 'read'), { text: 'Why spit at it, if you won’t hit it?', to: 'spit' }, bye],
      },
      spit: { speaker: 'npc:tamar-mallory', text: 'My nan’s on it. Third row. Don’t tell anyone.', next: 'start' },
      read: { speaker: 'npc:tamar-mallory', mood: 'happy', text: 'Go on, then. And when you’ve read it, you’ll want to have a word with somebody. Ha!', next: null },
    },
  },
  {
    id: 'dialogue:obj-cowards-cairn-names', name: 'The Coward’s Cairn: the oldest name',
    entries: [{ node: 'name' }],
    nodes: { name: { speaker: 'narrator', text: 'Hundreds of flat stones, each with a name scratched in it. At the very bottom, worn almost smooth by forty years of rain and spit, the oldest: ODRAN GALE. Someone has scratched a small heart next to it, much more recently.', next: null } },
  },
  // ---------- Skyfall Gorge: the fledgling, Rory
  {
    id: 'dialogue:stormlancer-fledgling', name: 'The fallen fledgling',
    entries: [{ when: { flag: 'stormlancer.fledgling_raised' }, node: 'raised' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:gorge-fledgling', text: '(A Thunderbird fledgling at the foot of the rockfall, the size of a goose and furious about it. It is not hollow. It is only small, and cold, and its feathers are sparking feebly.) Kreeee.',
        choices: [offer('quest:stormlancer-the-fallen-fledgling', '(Kneel down. Hold out your hand.)', 'hand'), bye],
      },
      hand: { speaker: 'narrator', text: 'It bites your hand, which gives you a small electric shock, which seems to cheer it up. It needs feeding, and Thunderbird chicks eat static. The wisps in the gorge are full of it.', next: null },
      raised: { speaker: 'npc:gorge-fledgling', mood: 'happy', text: '(The fledgling is sitting in its rebuilt nest, fat and crackling, and screams at you with great affection.)', next: null },
    },
  },
  {
    id: 'dialogue:obj-stormlancer-fledgling-nest', name: 'The Fallen Fledgling: the nest', scope: 'party',
    entries: [{ when: stage('quest:stormlancer-the-fallen-fledgling', 'nest'), node: 'feed' }, { node: 'nest' }],
    nodes: {
      feed: { speaker: 'narrator', text: 'You hold your crackling hands out to the fledgling, and it eats the static off your fingers with a noise like frying. Then you build up its nest out of the wind with fallen rocks and moss, and it settles into it, and glows.', next: null },
      nest: { speaker: 'narrator', text: 'A fledgling’s nest in the lee of the rockfall, warm and crackling.', next: null },
    },
  },
  {
    id: 'dialogue:stormlancer-rory', name: 'Rory Gust (the Rockfall Wager)',
    entries: [
      { when: { all: [stage('quest:stormlancer-the-rockfall-wager', 'rory'), { flag: 'stormlancer.rockfall', value: 'rode' }] }, node: 'rode' },
      { when: stage('quest:stormlancer-the-rockfall-wager', 'rory'), node: 'talked' },
      { node: 'start' },
    ],
    nodes: {
      start: {
        speaker: 'npc:rory-gust', text: 'First one through the rockfall wins! Rocks come down every couple of minutes. You go when you hear the crack. Fancy it?',
        choices: [offer('quest:stormlancer-the-rockfall-wager', 'I’ll face the rockfall.', 'face'), bye],
      },
      face: { speaker: 'npc:rory-gust', text: 'Lovely. Line up at the mouth with the others. When you hear the crack, go. Or don’t, and be second, and nobody ever remembers second.', next: null },
      rode: { speaker: 'npc:rory-gust', mood: 'happy', text: 'First through! You were first through! (He is jumping up and down.) Nobody’s ever been first through with that face on. Like you were bored. Teach me the face.', next: 'back' },
      talked: { speaker: 'npc:rory-gust', text: 'You stopped them. All of them. (He looks at the rocks still coming down.) Nell would’ve gone under that last one. She’s faster than me. (A long pause.) Second’s not so bad, I suppose.', next: 'back' },
      back: { speaker: 'npc:rory-gust', text: 'There’s a wager-post at the top of the gorge path, with every first-through carved on the front. Nobody reads the back. I read the back once. Go and read it. Then tell me first is the only thing worth being.', next: null },
    },
  },
  {
    id: 'dialogue:obj-rockfall-start', name: 'The Rockfall Wager: the mouth of the gorge', scope: 'party',
    entries: [{ when: stage('quest:stormlancer-the-rockfall-wager', 'wager'), node: 'line' }, { node: 'rocks' }],
    nodes: {
      line: {
        speaker: 'narrator', text: 'Six young riders on six young rams at the mouth of the rockfall, trembling, waiting for the crack. Above, a slab the size of a cart is beginning to lean. Someone always has to go second. Someone, today, is going to go first into that.',
        choices: [
          { text: '(Go on the crack, and go first, so nobody else has to.)', to: 'rode', effects: [{ setFlag: 'stormlancer.rockfall', value: 'rode' }] },
          { text: '(Turn your ram across the mouth of the gorge.) Not today. Nobody goes.', to: 'talk', effects: [{ setFlag: 'stormlancer.rockfall', value: 'talked' }] },
        ],
      },
      rode: { speaker: 'narrator', text: 'Crack. You go. The slab comes down behind your ram’s heels with a sound like the end of the world, and you are through, and alive, and the others are cheering on the far side of a wall of dust.', next: null },
      talk: { speaker: 'narrator', text: 'They shout. They call you slow. Then the slab comes down, right across the mouth where the first of them would have been, and nobody says anything for a long time.', next: null },
      rocks: { speaker: 'narrator', text: 'The mouth of the rockfall in Skyfall Gorge, littered with fallen stone.', next: null },
    },
  },
  // ---------- the Eyrie Steps: Tally, Nessa
  {
    id: 'dialogue:stormlancer-tally', name: 'Tally Rowe (the Stair-Counter)',
    entries: [{ when: stage('quest:stormlancer-the-stair-counter', 'tally'), node: 'warm' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:tally-rowe', text: 'Three hundred and four. Three hundred and FOUR. For forty years, every morning, three hundred and three. And since the night the Bell rang: three hundred and four.',
        choices: [offer('quest:stormlancer-the-stair-counter', 'Where’s the extra one?', 'where'), bye],
      },
      where: { speaker: 'npc:tally-rowe', text: 'Between two hundred and eleven and two hundred and twelve. I don’t step on it. I step over it. It’s warm. Steps aren’t warm. Go and look, and tell me I’m mad.', next: null },
      warm: {
        speaker: 'npc:tally-rowe', text: 'Well? Am I mad?',
        choices: [
          { text: 'It’s there. It’s warm, and it hums like a half-stone.', to: 'hum' },
          { text: 'You’re not mad. You’re just the only one counting.', to: 'count', trust: 1 },
        ],
      },
      hum: { speaker: 'npc:tally-rowe', text: 'Hums. Like your chest does. (She looks at you narrowly.) Then something came home the night the Bell rang, and made itself a step to sit on. I’ll count it. I’ll count it, but I won’t like it.', next: 'book' },
      count: { speaker: 'npc:tally-rowe', mood: 'happy', text: 'The only one counting. Ha! That’s the truest thing anyone’s said to me on these Steps. Three hundred and four, then. I’ll put it in the book.', next: 'book' },
      book: { speaker: 'npc:tally-rowe', mood: 'afraid', text: 'The book. Hm. My first book went off the bottom of the Steps thirty years ago, when I threw it, in a temper, the morning after a very odd night. I never went down for it. It might say something. Fetch it, would you? Don’t read the swearing.', next: null },
    },
  },
  {
    id: 'dialogue:obj-warm-step', name: 'The Stair-Counter: the warm step', scope: 'party',
    entries: [{ node: 'step' }],
    nodes: { step: { speaker: 'narrator', text: 'Between the two hundred and eleventh step and the two hundred and twelfth, there is another one. It is the same slate as the rest, worn the same, but it is warm through your boot, and when you crouch and lay your palm on it, it hums the Eye half’s note back at you.', next: null } },
  },
  {
    id: 'dialogue:stormlancer-nessa', name: 'Nessa Plume (Feathers for the Pennant)',
    entries: [{ when: stage('quest:stormlancer-feathers-for-the-pennant', 'nessa'), node: 'sew' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:nessa-plume', text: 'A pennant’s a promise you can see from a mile off. I can’t make one without clean feathers, and every Thunderbird on the Heights is moulting black. Black feathers won’t take a stitch. They weep through it.',
        choices: [offer('quest:stormlancer-feathers-for-the-pennant', 'Where would clean ones be?', 'where', { questCompleted: 'quest:stormlancer-old-clatterwing' }), bye],
      },
      where: { speaker: 'npc:nessa-plume', text: 'The old nests on the Eyrie Steps, from before the tears. Feathers last. Bring me a fistful, and I know whose pennant they’re going in.', next: null },
      sew: {
        speaker: 'npc:nessa-plume', mood: 'happy', text: 'Blue-grey, and crackling, and not a black one among them. (She is already sewing.) These are going in the Lancemaster’s old pennant. He doesn’t know. Don’t tell him. If he ever gives it away, it should be worth getting.',
        choices: [{ text: 'He’ll never give it away.', to: 'never' }, { text: 'Our secret.', to: 'tip' }],
      },
      never: { speaker: 'npc:nessa-plume', text: 'He will. He gives everything away eventually. Slowly, but he gets there.', next: 'tip' },
      tip: { speaker: 'npc:nessa-plume', text: 'One thing more. The long feather at the tip of a pennant has to come from the oldest bird on the Heights, given, not taken. That’s Old Clatterwing. She’s clean now, they say. Ask her nicely. Bring a fish.', next: null },
    },
  },
  {
    id: 'dialogue:obj-thunderbird-nest-1', name: 'Feathers for the Pennant: an old nest',
    entries: [{ node: 'nest' }],
    nodes: { nest: { speaker: 'narrator', text: 'An old Thunderbird nest on a ledge of the Eyrie Steps, abandoned before the tears. Woven into the bottom of it, a dozen moulted feathers, blue-grey and still crackling faintly, clean as the day they fell.', next: null } },
  },

  // ======================= ACT II
  {
    id: 'dialogue:stormlancer-hamlin', name: 'C-1 the Wind Yard: Goatmaster Hamlin', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:hamlin-crake', text: 'A Stormlancer! A Heights lancer, with a proper swept plume! (Behind him, twenty lancers on twenty goats, lances up, come to a perfect halt.) No rams in Concordia, see. So: goats. Don’t laugh. The goats can hear you.',
        choices: [
          { text: 'They’re magnificent goats.', to: 'goats', trust: 1 },
          { text: 'Word of the Charge reached you, then.', to: 'charged', when: { flag: 'stormlancer.charge', value: 'charged' } },
          { text: 'You’ve a Storm Ram here.', to: 'ram', when: { flag: 'stormlancer.charge', value: 'sheltered' } },
        ],
      },
      goats: { speaker: 'npc:hamlin-crake', mood: 'happy', text: 'They are. Finest lance-goats in the world. Only lance-goats in the world. Now.', next: 'crow' },
      charged: { speaker: 'npc:hamlin-crake', mood: 'happy', text: 'Reached us? A herder came through the arch singing about it! Charged the storm at the head of the young lancers! (Twenty goats bleat approval.) The Wind Yard’s yours, lancer. Anything you want.', next: 'crow' },
      ram: { speaker: 'npc:hamlin-crake', text: 'One. Old Thunder. Came through the arches as a lamb in C. 1012, the only Storm Ram in Morvane. The herders say the lancer who brought the herds down safe can ride him up the cliffs, if anybody can. That’s you, I hear.', next: 'crow' },
      crow: {
        speaker: 'npc:hamlin-crake', text: 'The Stormcrow nests on top of the Stormcliffs, screaming. The Wind Yard has a dare, and it’s thirty years old: first to ride up the cliffs to the nest. Nobody’s done it. Nobody’s had a ram.',
        choices: [{ text: 'Then I’ll go first.', to: 'first' }, { text: 'Is there a way to go second?', to: 'second', when: { insight: 'ride_the_wake' } }],
      },
      first: { speaker: 'npc:hamlin-crake', text: 'Ha! There’s the Heights. Take the charge-flags as you go, so we know where you got to, if you don’t come back.', next: null },
      second: { speaker: 'npc:hamlin-crake', text: 'Second? (He looks at you, and then up at the storm over the cliffs, and slowly starts to grin.) Ride up behind the next strike, you mean. Huh. Take the charge-flags as you go.', next: null },
    },
  },
  {
    id: 'dialogue:obj-stormlancer-cliff-charge-flag-1', name: 'C-2 the first charge-flag', scope: 'party',
    entries: [
      { when: { all: [SL, stage('quest:stormlancer-the-cliff-charge', 'flags'), { flag: 'stormlancer.fledgling_raised' }] }, node: 'bird' },
      { when: { all: [SL, stage('quest:stormlancer-the-cliff-charge', 'flags')] }, node: 'flag' },
      { node: 'pole' },
    ],
    nodes: {
      flag: { speaker: 'narrator', text: 'A tattered charge-flag on an iron pole, a third of the way up the Stormcliffs, left by the last lancer who tried, thirty years ago. You take it. Below you, the whole Wind Yard is cheering, and twenty goats are bleating.', next: null },
      bird: { speaker: 'narrator', text: 'You take the first charge-flag, and a shriek comes down out of the storm: a young Thunderbird, fat and crackling, the fledgling from Skyfall Gorge. It has nested here. It drops onto the ledge beside you and screams at you to hurry up, and shows you the way.', next: null },
      pole: { speaker: 'narrator', text: 'An empty iron flagpole on the Stormcliffs.', next: null },
    },
  },
  {
    id: 'dialogue:stormlancer-gudrun', name: 'C-4 the Wardenhold watchman', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:gudrun-hailstone', text: 'Twenty years I’ve logged the avalanches on Frostmere Pass. Nobody reads the log. This month, I’ve had to add a column. “Runner.” (She shows you.) Half past two: avalanche. Twenty-five past two: runner, ahead of it.',
        choices: [
          { text: 'A woman, laughing, with tears that don’t fall.', to: 'cass' },
          { text: 'Where does she run to?', to: 'where' },
        ],
      },
      cass: { speaker: 'npc:gudrun-hailstone', mood: 'afraid', text: 'You know her, then. Aye. And there’s others behind her now, fast and hollow, all racing the snow. Every night they get a little higher up the pass.', next: 'where' },
      where: { speaker: 'npc:gudrun-hailstone', text: 'The top. Always the top. And every night the Colossus is standing there, holding the pass shut, and she can’t get past it. Wait on the race-line after dark if you want to see. Wrap up warm.', next: null },
    },
  },
  {
    id: 'dialogue:obj-stormlancer-pass-race-line', name: 'C-4 the race on the pass',
    entries: [
      { when: { all: [SL, stage('quest:stormlancer-the-race-on-the-pass', 'race'), NIGHT] }, node: 'night' },
      { when: { all: [SL, stage('quest:stormlancer-the-race-on-the-pass', 'race')] }, node: 'day' },
      { node: 'line' },
    ],
    nodes: {
      line: { speaker: 'narrator', text: 'A line of old cairns across the pass road, where the Wardens used to start their races, long ago.', next: null },
      day: { speaker: 'narrator', text: 'Snow, sun and silence on the pass road. Gudrun said after dark.', next: null },
      night: {
        speaker: 'narrator', text: 'Half past two. The crack of an avalanche high up, and down the snow ahead of it, a streak of black lightning: Cass, laughing, with a dozen hollow runners behind her. She goes past you so close you feel the wind, and up, and up, until a shape the size of a hill stands in the road and she breaks against it and falls back.',
        effects: [{ setFlag: 'stormlancer.saw_race', value: true }], next: 'night2',
      },
      night2: { speaker: 'narrator', text: 'She doesn’t stop. She turns and runs it again. And for the first time, it occurs to you that she may never stop at all, unless something stops her.', next: null },
    },
  },
  // ---------- C-6 Old Biddy Brings Word
  {
    id: 'dialogue:stormlancer-biddy-word', name: 'C-6 Old Biddy at the Gate Circle', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:old-biddy-gate', text: '(Old Biddy is standing by the Storm arch, eating the Gate Circle, very slowly, starting with the grass. A roll of paper is tied to her horn with a bootlace. She lets you take it, after some negotiation.)', next: 'msg' },
      msg: {
        speaker: OG, text: '“Pup. Sent Biddy. She knows the way, and she won’t hurry, so this will be old news by the time you get it. That’s all right. The Heights are quiet. Cass’s ram eats now. Don’t go first through the last gate. Wait. Bring someone in with you. O.”',
        choices: [{ text: '(Scratch Old Biddy behind the horn, and fold the message away.)', to: null, quest: true, effects: [{ setFlag: 'stormlancer.odran_word', value: true }] }],
      },
    },
  },
  {
    id: 'dialogue:stormlancer-lob-word', name: 'C-6 Odran’s runner', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:lob-ferris', text: 'Ran the whole Copper Road. Walked the last bit. Don’t tell the Lancemaster. He said you’ve got Biddy, so he sent me, and he said to say it in his words, slowly. (He clears his throat, and slows right down.)', next: 'msg' },
      msg: {
        speaker: OG, text: '“Pup. Sent the lad, since Biddy’s with you. Hope she’s thrown you. The Heights are quiet. Cass’s ram eats now. Don’t go first through the last gate. Wait. Bring someone in with you. O.”',
        choices: [{ text: '(Fold the message away.)', to: null, quest: true, effects: [{ setFlag: 'stormlancer.odran_word', value: true }] }],
      },
    },
  },
  {
    id: 'dialogue:stormlancer-eye-and-tower', name: 'C-6 the Eye and the Tower', scope: 'party',
    entries: [{ node: 'chord' }],
    nodes: {
      chord: { speaker: 'narrator', text: 'In the Stone Court the Eye half and the Tower half sing together: a crackle of lightning round one perfectly still note, like a storm with its eye open, looking at you.', next: 'go' },
      go: { speaker: 'narrator', text: 'You do not hurry it. For once in your life you let something else go first, and stand in the quiet behind it, and listen.', next: null },
    },
  },
  // ---------- featured bearers (hooks on the bearer NPCs)
  {
    id: 'dialogue:stormlancer-featured-warden', name: 'Featured: The Shield on the Pass', scope: 'party',
    entries: [
      { when: stage('quest:stormlancer-the-shield-on-the-pass', 'back'), node: 'back' },
      { when: { all: [stage('quest:stormlancer-the-shield-on-the-pass', 'line'), { not: { flag: 'stormlancer.bram_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-warden', text: 'You’re the Stormlancer. Good. I hold the pass, you charge up it, that’s the plan. Except we can’t both be first, and I’m not moving my shield. Come up to the line. We’ll settle it.',
        choices: [
          { text: 'Let’s settle it.', to: null, quest: true, effects: [{ setFlag: 'stormlancer.bram_asked', value: true }] },
          { text: 'You could just let me go first.', to: null, quest: true, effects: [{ setFlag: 'stormlancer.bram_asked', value: true }] },
        ],
      },
      back: {
        speaker: 'npc:bearer-warden', mood: 'happy', text: 'Settled. Took long enough. Shield and lance, and one of us goes second, and it turns out the world doesn’t end. Whatever’s at the Heart, I’ll hold, and you’ll ride, and we’ll both get there.',
        effects: [{ setFlag: 'stormlancer.bram_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-stormlancer-pass-shield-line', name: 'The Shield on the Pass: the line', scope: 'party',
    entries: [{ when: { all: [SL, stage('quest:stormlancer-the-shield-on-the-pass', 'line')] }, node: 'line' }, { node: 'mark' }],
    nodes: {
      line: {
        speaker: 'narrator', text: 'A tower shield planted across the pass road, and behind it the Warden bearer, arms folded. In front of it, you, on whatever you are riding. Somebody has to go first.',
        choices: [
          { text: '(Ride first. The shield holds the road behind you.)', to: 'first', effects: [{ setFlag: 'stormlancer.pass_order', value: 'lance' }] },
          { text: '(Let the shield go first, and ride in its wake.)', to: 'second', effects: [{ setFlag: 'stormlancer.pass_order', value: 'shield' }] },
        ],
      },
      first: { speaker: 'narrator', text: 'You go up the road at a gallop, and behind you the Warden bearer walks the shield up after, step by step, holding every yard you take. It works. It works annoyingly well.', next: null },
      second: { speaker: 'narrator', text: 'The Warden bearer walks the shield up the road, and you ride in its lee, out of the wind, and the snow breaks on the shield and never touches you. Going second is very restful. You will not tell Cass.', next: null },
      mark: { speaker: 'narrator', text: 'Two marks in the snow of the pass road: a shield’s rim, and hoofprints.', next: null },
    },
  },
  {
    id: 'dialogue:stormlancer-featured-swordsman', name: 'Featured: First Blood', scope: 'party',
    entries: [
      { when: stage('quest:stormlancer-first-blood', 'back'), node: 'back' },
      { when: { all: [stage('quest:stormlancer-first-blood', 'duel'), { not: { flag: 'stormlancer.gaspard_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-swordsman', text: 'I have challenged the Stormcrow to single combat. In writing. I left it at the foot of the cliff. It hasn’t replied, which is very poor form. I don’t want help. I want a second, which is different. You look like a second.',
        choices: [
          { text: 'I’ve never been anyone’s second.', to: null, quest: true, effects: [{ setFlag: 'stormlancer.gaspard_asked', value: true }] },
          { text: 'I’ll be your second. Just this once.', to: null, quest: true, effects: [{ setFlag: 'stormlancer.gaspard_asked', value: true }] },
        ],
      },
      back: {
        speaker: 'npc:bearer-swordsman', text: 'The bird never stepped into the circle. Not once. I stood there for an hour with my blade up and it just screamed the news at me. Most humiliating afternoon of my life. Thank you for standing second. At the Heart, I’ll do the same for you.',
        effects: [{ setFlag: 'stormlancer.gaspard_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-stormlancer-stormcliff-duel-ring', name: 'First Blood: the duelling circle', scope: 'party',
    entries: [{ when: { all: [SL, stage('quest:stormlancer-first-blood', 'duel')] }, node: 'ring' }, { node: 'turf' }],
    nodes: {
      ring: {
        speaker: 'narrator', text: 'A neat circle cut in the turf at the top of the Stormcliffs, and in it the Swordsman bearer, blade raised, waiting for a bird the size of a storm to come down and be fair about it. You stand at the edge, as a second does.',
        choices: [{ text: '(Stand second, and say nothing.)', to: 'wait' }, { text: '(Tell him the Stormcrow is first with the news, not first in a fight.)', to: 'news' }],
      },
      wait: { speaker: 'narrator', text: 'An hour goes by. The Stormcrow screams the news overhead and does not come down. Eventually the Swordsman bearer lowers his blade with enormous dignity and asks you not to mention this to anyone in Edgewater.', next: null },
      news: { speaker: 'narrator', text: 'He considers it. “So it wants to be listened to, not fought.” He sheathes his blade, sits down in the circle, and listens to the Stormcrow scream for an hour, which is also very dignified, in its way.', next: null },
      turf: { speaker: 'narrator', text: 'A duelling circle cut in the turf of the cliff-top, empty.', next: null },
    },
  },
  // ---------- class hooks on the Brindlecross people
  {
    id: 'dialogue:hook-stormlancer-pip', name: 'Hook: Pip and the lance',
    entries: [{ when: { all: [{ not: { flag: 'stormlancer.pip_met' } }, { flag: 'story.act', op: '>=', value: 2 }] }, node: 'lance' }],
    nodes: {
      lance: {
        speaker: 'npc:pip', text: 'Is that a real lance? Have you charged anything? What’s the biggest thing you’ve charged? Can I go first next time? I’m very brave. Everybody says so. Mostly they say “Pip, that isn’t brave”, but I know what they mean.',
        effects: [{ setFlag: 'stormlancer.pip_met', value: true }],
        choices: [
          { text: 'Going first isn’t the brave part, Pip. Coming back for the last one is.', to: 'back' },
          { text: 'A storm. The biggest thing I charged was a storm.', to: 'storm' },
        ],
      },
      back: { speaker: 'npc:pip', text: 'Coming back for the last one. (He thinks about this harder than you have ever seen him think about anything.) Then I’ll go last. Last is the new first. I’m going to tell everyone.', next: null },
      storm: { speaker: 'npc:pip', mood: 'happy', text: 'A STORM. Did it fall over? Did you win? Don’t tell me. Tell me. No, don’t.', next: null },
    },
  },
  // ======================= ACT III
  {
    id: 'dialogue:stormlancer-herald-fate', name: 'III-4 the Swift Herald: Cass’s fate', scope: 'party',
    entries: [{ when: { flag: 'stormlancer.charge', value: 'charged' }, node: 'charged' }, { node: 'kneel' }],
    nodes: {
      kneel: { speaker: 'npc:cass-vantor', mood: 'hollow', text: '(She is on one knee on the stair, and even now she can’t keep still: hands, feet, the streaming robe, all of it trembling to be gone.) You caught me. Nobody catches me. Get up. Race me. Please. If I stop, it catches me.', next: 'choose' },
      charged: { speaker: 'npc:cass-vantor', mood: 'hollow', text: 'You charged. I saw. The whole clan into the storm’s edge, and three of them came back like me. (She laughs, shaking.) I was right, wasn’t I? You went too. You went first.', next: 'choose' },
      choose: {
        speaker: 'npc:cass-vantor', mood: 'sad', text: 'Go on, then. You’re the one with the lance. Do it fast. Everything’s better fast.',
        choices: [
          {
            text: '(Mount up and ride behind her, in her wake, until she tires.)', to: 'wake', quest: true,
            when: { any: [{ flag: 'stormlancer.charge', value: 'wake' }, { trust: OG, value: 'trusted' }] },
            lockedLabel: 'You need to know how to ride the wake',
            effects: [{ setFlag: 'stormlancer.nemesis_fate', value: 'spared' }],
          },
          { text: 'Fast, then. (Brace the lance.)', to: 'destroy', quest: true, effects: [{ setFlag: 'stormlancer.nemesis_fate', value: 'destroyed' }] },
        ],
      },
      wake: { speaker: 'narrator', text: 'She bolts, the way you knew she would, round the top of the Twelve Stairs and down and round again. You don’t chase her. You ride behind her, in her wake, the old way, Odran’s way, and you don’t try to catch up.', next: 'wake2' },
      wake2: { speaker: 'narrator', text: 'It takes a long time. Every lap the bell rings a moment before her, then a little less, then with her. Then she slows, and slows, and stops in the middle of the stair with her back to you.', next: 'wake3' },
      wake3: { speaker: 'npc:cass-vantor', mood: 'sad', text: 'I’m tired. (She turns round. Her tears are running down her face, and for the first time they land.) I’m so tired. I haven’t been tired in a year. Is that what it was? Was I only running from being tired?', next: null },
      destroy: { speaker: 'narrator', text: 'She comes at you like lightning, and you stop, and brace, and let her come, the way you did in the Eye. The lance takes her. The bell rings once, a moment after her, for the first time. Then it doesn’t ring again.', next: null },
    },
  },
  {
    id: 'dialogue:stormlancer-wynn', name: 'Ride Second: Wynn Tarry', scope: 'party',
    entries: [
      { when: stage('quest:stormlancer-ride-second', 'last'), node: 'last' },
      { when: { all: [stage('quest:stormlancer-ride-second', 'top'), { flag: 'stormlancer.odran_devotable' }] }, node: 'top-d' },
      { when: stage('quest:stormlancer-ride-second', 'top'), node: 'top' },
      { node: 'later' },
    ],
    nodes: {
      last: { speaker: 'narrator', text: 'At the very back of the Legion, a long way behind everyone, an old woman in a Lance Clan coat stands with a broken lance across her shoulders. She is weeping, slowly. Even her weeping is slow.', next: 'wynn' },
      wynn: {
        speaker: 'npc:wynn-tarry', mood: 'hollow', text: 'Go on. Go on ahead, young ’un. Everyone does. I rode last in the Turning escort in ’twelve, on the slowest ram on the Heights. They all went in ahead of me, and by the time I came, the doors were shut.',
        choices: [
          { text: 'Not today. Today I ride second.', to: 'second', quest: true },
          { text: 'Lean on me. We’ll go up together.', to: 'second', quest: true },
        ],
      },
      second: { speaker: 'npc:wynn-tarry', mood: 'sad', text: '(She looks at you for a long time, as if you were a long way off.) Second. Nobody’s ever ridden second to me. (The broken lance slides off her shoulders.) It’ll take all day. I’m very slow.', next: 'odran' },
      odran: { speaker: 'narrator', text: 'You think of an old man lying in the grass beside a ram, looking at the sky. No hurry.', next: null },
      top: { speaker: 'npc:wynn-tarry', mood: 'happy', text: '(At the top of the Twelve Stairs, a long time later, Wynn Tarry stops, and leans on you, and gets her breath.) Well. I came in last. (She laughs, and the black runs out of her eyes.) Came in, though. Didn’t I? Came in.', next: null },
      'top-d': {
        speaker: 'npc:wynn-tarry', mood: 'happy', text: '(At the top of the Twelve Stairs, a long time later, Wynn Tarry stops, and leans on you, and gets her breath.) Well. I came in last. (She laughs, and the black runs out of her eyes.) Came in, though. Didn’t I? Came in.',
        effects: [{ trust: OG, set: 5 }], next: 'odran-d',
      },
      'odran-d': { speaker: 'narrator', mood: 'happy', text: 'Far away on the Thunderclap Heights, at the top of the Eyrie Steps where Maudie’s lance stands in the wind, an old lancer sits up in the grass beside his ram as if someone had called his name. He smiles, and lies back down. No hurry.', next: null },
      later: { speaker: 'npc:wynn-tarry', text: 'Go on, young ’un. I’ll be along.', next: null },
    },
  },
  {
    id: 'dialogue:stormlancer-thistle-heart', name: 'Thistle at the top of the Storm stair', scope: 'party',
    entries: [
      { when: { all: [stage('quest:stormlancer-thistle', 'thistle'), { flag: 'stormlancer.nemesis_fate', value: 'spared' }] }, node: 'spared' },
      { when: stage('quest:stormlancer-thistle', 'thistle'), node: 'alone' },
      { node: 'stays' },
    ],
    nodes: {
      spared: { speaker: 'narrator', text: 'Thistle is standing at the top of the Storm stair, the way she stood facing her stall door for a month. Cass is sitting on the step beside her with her face buried in the ram’s neck. She has been sitting very still for an hour.', next: 'cass' },
      cass: {
        speaker: 'npc:cass-vantor', mood: 'sad', text: 'She walked. All the way. (She laughs into the wool.) Hundreds of miles, at a walk, and she got here. I never once let her walk. I never let her do anything but run.',
        choices: [
          { text: 'Ride her home, Cass. At a walk.', to: 'home', quest: true },
          { text: '(Give Cass a leg up.)', to: 'home', quest: true },
        ],
      },
      home: { speaker: 'narrator', mood: 'happy', text: 'Cass climbs onto Thistle’s back slowly, like somebody learning how, and takes up the bridle she has worn at her belt for a year. Thistle turns and starts down the Storm stair at a walk. Cass doesn’t ask her to go faster. Not once.', next: null },
      alone: {
        speaker: 'narrator', text: 'Thistle is standing at the top of the Storm stair, facing the place where Cass fell, the way she stood facing her stall door for a month. Her saddle is empty. She will not move.',
        choices: [
          { text: '(Stand with her a while.)', to: 'stand', quest: true },
          { text: '(Lay your hand on the empty saddle.)', to: 'saddle', quest: true },
        ],
      },
      stand: { speaker: 'narrator', mood: 'sad', text: 'You stand with her. Neither of you says anything. After a long time she leans her heavy head against your shoulder and leaves it there, and that is all right.', next: null },
      saddle: { speaker: 'narrator', mood: 'sad', text: 'She lowers her head and stays exactly where she is. You understand. Somebody has to wait at the place where the fast ones go. It may as well be someone who knows how.', next: null },
      stays: { speaker: 'npc:thistle-heart', text: '(Thistle is standing at the top of the Storm stair, facing the place where Cass fell. She is not going anywhere.)', next: null },
    },
  },
  {
    id: 'dialogue:obj-stormlancer-fast-ones', name: 'The Ones Who Came Back Fast', scope: 'party',
    entries: [
      { when: { all: [SL, stage('quest:stormlancer-the-ones-who-came-back-fast', 'fast'), { flag: 'stormlancer.charge', value: 'charged' }] }, node: 'charge' },
      { when: { all: [SL, stage('quest:stormlancer-the-ones-who-came-back-fast', 'fast')] }, node: 'racers' },
      { node: 'gone' },
    ],
    nodes: {
      charge: { speaker: 'narrator', text: 'Three lancers from your own Charge stand in the Legion in their clan coats: the three who rode into the storm’s edge beside you and came back hollow and fast, like Cass. The Legion is making them stand still. It is killing them.', next: 'still' },
      racers: { speaker: 'narrator', text: 'Cass’s racers from Frostmere Pass stand in the Legion in a ragged line, still in their racing colours. The Legion is making them stand still, and every one of them is trembling with it.', next: 'still' },
      still: {
        speaker: 'narrator', text: 'The black tears streak back off their faces and never land.',
        choices: [
          { text: '(Stand in front of them, and don’t move. Let them come to you.)', to: 'come', quest: true },
          { text: '(Fall off on purpose: the oldest lancers’ trick.)', to: 'fall', quest: true, school: 'storm' },
        ],
      },
      come: { speaker: 'narrator', text: 'You stand there. It is the hardest thing in the Heart. One by one they stop trembling, and look at you, and their tears land on the ground at last, ordinary and wet.', next: null },
      fall: { speaker: 'narrator', mood: 'happy', text: 'You fall off, flat on your back in the dust, and lie there looking at the black sky. The nearest lancer stares at you. Then, slowly, she sits down beside you, and then the rest do. Somebody laughs. The tears are landing now.', next: null },
      gone: { speaker: 'narrator', text: 'Hoofprints and bootprints in the dust, all going back the way they came, at a walk.', next: null },
    },
  },
];

export default dialogues;
