/**
 * Hollow Crown, Concordia: the Brindlecross fourteen's general dialogues, their side quests (the handoff's, all
 * portable) and the side-quest objects. Lines in quotes are the handoff's own (Screens NPCS). Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const fresh = (q: Q): NarrativeCondition => ({ all: [{ flag: 'story.act', op: '>=', value: 2 }, { not: { questActive: q } }, { not: { questCompleted: q } }] });
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const offer = (q: Q, text: string, to: string): DialogueChoice => ({ text, to, quest: true, when: fresh(q), effects: [{ startQuest: q }] });
const bye: DialogueChoice = { text: 'Farewell.', to: null, tag: 'leave' };
const NIGHT: NarrativeCondition = { hour: [20, 5] };

const dialogues: DialogueDef[] = [
  // ---------- Maren Hollis (Hunt)
  {
    id: 'dialogue:cc-maren', name: 'Maren (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:maren', text: 'Something is driving them. I want to know what.',
        choices: [
          { text: 'Tell me about the Gloamwood.', to: 'wood' },
          { text: 'Your mother carried a stone.', to: 'mother', when: { insight: 'maren-mother' }, trust: 1 },
          { text: 'Teach me to read a trail.', to: 'train', when: { trust: 'npc:maren', value: 'friendly' } },
          bye,
        ],
      },
      wood: { speaker: 'npc:maren', text: 'Old forest. Teal and glowing at night, which is pretty until you remember why. The wolves come from there, and so does the Stag.', next: 'start' },
      mother: { speaker: 'npc:maren', mood: 'sad', text: 'Ottilie Hollis. Hunt bearer, C. 1012. She said she was taking it home to the crown. I was nine. If you get to the Heart, look for a woman with my nose.', effects: [{ setFlag: 'cc.maren_mother_asked', value: true }], next: 'start' },
      train: { speaker: 'npc:maren', text: 'Look where it’s been, not where it’s going. Everything that walks leaves an argument behind it.',
        choices: [{ text: 'And the pelt on your shoulders?', to: null, effects: [{ openDialogue: 'dialogue:cc-maren-confide' }] }, { text: 'Thanks.', to: 'start' }],
      },
    },
  },
  // ---------- Elder Godric (Radiance)
  {
    id: 'dialogue:cc-godric', name: 'Godric (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:godric', text: 'I do not like magic. I like wolves less.',
        choices: [
          { text: 'What is Brindlecross?', to: 'village' },
          { text: 'You were in the Citadel, once.', to: 'citadel', when: { flag: 'cc.godric_seed' } },
          { text: 'Why do you stop in the road at dusk?', to: null, when: { trust: 'npc:godric', value: 'friendly' }, effects: [{ openDialogue: 'dialogue:cc-godric-confide' }] },
          bye,
        ],
      },
      village: { speaker: 'npc:godric', text: 'The last village before the Heart that still keeps its own sheep. Folk of every school, stuck here since the arches shut. We manage.', next: 'start' },
      citadel: { speaker: 'npc:godric', mood: 'sad', text: 'I was a guard. Young, and proud of the tabard. That is all I will say today. Ask me again when you are standing at its door.', next: 'start' },
    },
  },
  // ---------- Nan Briar (Verdant)
  {
    id: 'dialogue:cc-nan', name: 'Nan Briar (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:nanbriar', text: 'Mind the cat. He bites clergy and anyone in red.',
        choices: [
          { text: 'What do you know about the Slime King?', to: 'slime' },
          { text: 'You knew the Citadel gardens.', to: 'garden', when: { insight: 'tears_seed' }, trust: 1 },
          { text: 'Why is he called Parson?', to: null, when: { trust: 'npc:nanbriar', value: 'friendly' }, effects: [{ openDialogue: 'dialogue:cc-nan-confide' }] },
          bye,
        ],
      },
      slime: { speaker: 'npc:nanbriar', text: 'Wears a crown it found in the bog. Thinks it’s important. It’s only the herald, dear. The thing that sent it is under the hollow, and it fights like a monk.', next: 'start' },
      garden: { speaker: 'npc:nanbriar', mood: 'happy', text: 'I was the Verdant Concordant’s gardener. Three Turnings back. Nobody remembers me young because I wasn’t here to be young in. There. Now you know.', next: 'start' },
    },
  },
  // ---------- Odo Vance (Iron): Hollow Iron
  {
    id: 'dialogue:cc-odo', name: 'Odo (general, Hollow Iron)',
    entries: [{ when: stage('quest:cc-hollow-iron', 'odo'), node: 'turnin' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:odo', text: 'That blade’s seen better days. So have I.',
        choices: [
          offer('quest:cc-hollow-iron', 'You look like a man with a problem.', 'iron'),
          { text: 'Did you ever want to make anything but swords?', to: null, when: { trust: 'npc:odo', value: 'friendly' }, effects: [{ openDialogue: 'dialogue:cc-odo-confide' }] },
          bye,
        ],
      },
      iron: { speaker: 'npc:odo', text: 'Bring me Hollow iron. It rings different. Like it remembers being something else. Five pieces, off the Hollowed, and I will pay you in good steel.', next: null },
      turnin: {
        speaker: 'npc:odo', text: '(He strikes a piece on the anvil. It rings two notes at once.) There. Hear that? It’s carrying something. Grief, I’d say, if iron grieved. Here: steel that only rings once.',
        choices: [
          { text: 'Where does it come from?', to: 'engine', insight: 'hollow_iron_engine' },
          { text: 'Thanks, Odo.', to: null },
        ],
      },
      engine: { speaker: 'npc:odo', text: 'The best of it rings like the old Gilded Engine, the one that made the crown’s settings. My grandfather heard it run. Settings made to hold song, and grief, both.', next: null },
    },
  },
  // ---------- Wil Crane (Song): A Warm Bed
  {
    id: 'dialogue:cc-wil', name: 'Wil (general, A Warm Bed)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:wil', text: 'Room’s two shards. Stew’s free if you kill whatever’s howling.',
        choices: [
          { text: 'A room, please. And the stew.', to: 'room', when: stage('quest:cc-warm-bed', 'wil') },
          { text: 'Any rumours?', to: 'rumour' },
          { text: 'Pell owes you money?', to: 'pell' },
          { text: 'What about you, Wil? Do you sing?', to: null, when: { all: [{ trust: 'npc:wil', value: 'trusted' }, { not: stage('quest:cc-warm-bed', 'wil') }] }, effects: [{ openDialogue: 'dialogue:cc-wil-confide' }] },
          bye,
        ],
      },
      room: { speaker: 'npc:wil', mood: 'happy', text: 'Top of the stairs, second door. The bed’s good and the window sticks. Eat first. You look like a person who forgets.', next: null },
      rumour: { speaker: 'npc:wil', text: 'Rook’s posted a bounty on a wolf the size of a horse. Hobb’s been digging at night. And Ysolde has started talking to strangers, which she never does.', next: 'start' },
      pell: { speaker: 'npc:wil', text: 'Nine shards. Tell him I said so. Tell him Tuesday won’t do.', next: 'start' },
    },
  },
  // ---------- Pell Odd (Guile)
  {
    id: 'dialogue:cc-pell', name: 'Pell (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:pell', text: 'Everything’s for sale. Some of it’s even mine.',
        choices: [
          { text: 'Wil says you owe her nine shards.', to: 'wil', trust: 1 },
          { text: 'Are those black pearls?', to: 'pearls', school: 'guile', when: { partyHasSchool: 'guile' } },
          { text: 'Why haven’t you ever paid Wil?', to: null, when: { trust: 'npc:pell', value: 'friendly' }, effects: [{ openDialogue: 'dialogue:cc-pell-confide' }] },
        ],
      },
      wil: { speaker: 'npc:pell', text: 'Tell Wil I’ll pay her Tuesday. Don’t say which Tuesday.', next: null },
      pearls: { speaker: 'npc:pell', text: 'Pearls? What pearls? These are, ah, marbles. Very dark marbles. From a very sad lake. Don’t tell the Velvet King.', effects: [{ setFlag: 'cc.pell_pearls', value: true }], next: null },
    },
  },
  // ---------- Brother Aldous (Radiance)
  {
    id: 'dialogue:cc-aldous', name: 'Aldous (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:aldous', text: 'I hear the choir some nights. I know they are gone. I hear them anyway.',
        choices: [
          { text: 'A blessing, Brother?', to: 'bless' },
          { text: 'Tell me about the night the Abbey sank.', to: 'night' },
          { text: 'Why did the Abbey take you, Brother?', to: null, when: { trust: 'npc:aldous', value: 'friendly' }, effects: [{ openDialogue: 'dialogue:cc-aldous-confide' }] },
          bye,
        ],
      },
      bless: { speaker: 'npc:aldous', text: 'Bless you. It is free. It is also not very strong.', next: null },
      night: { speaker: 'npc:aldous', mood: 'sad', text: 'The Bell began to ring by itself and would not stop. The Abbess took the rope and held it, and the lake came up over all of us in one night. I swam. I do not know why I was allowed to.', next: 'start' },
    },
  },
  // ---------- Captain Rook Harrow (Blade): Hold the North Road, bounties
  {
    id: 'dialogue:cc-rook', name: 'Rook (general, road and bounties)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:rook', text: 'Eleven farmers, one halberd and me. We could use a twelfth.',
        choices: [
          offer('quest:cc-north-road', 'What’s wrong with the north road?', 'road'),
          offer('quest:cc-bounty-alpha', 'Read me the wolf bounty.', 'alpha'),
          offer('quest:cc-bounty-slime', 'Read me the slime bounty.', 'slime'),
          { text: 'What else is on the board?', to: 'board' },
          { text: 'How did you lose the eye?', to: null, when: { all: [{ trust: 'npc:rook', value: 'friendly' }, { questCompleted: 'quest:cc-north-road' }] }, effects: [{ openDialogue: 'dialogue:cc-rook-confide' }] },
        ],
      },
      road: { speaker: 'npc:rook', text: 'Bandits stopping carts past the Old Coach Inn. Their captain is Mags the Knife. She vanishes in smoke and comes at you from behind. Stay moving.', next: null },
      alpha: { speaker: 'npc:rook', text: 'Wolf. Bigger than a horse. Leads the packs. It howls before it leaps, which is the only polite thing about it.', next: null },
      slime: { speaker: 'npc:rook', text: 'Something wearing a crown is gathering the slimes in Briar Hollow. I would like it to stop wearing the crown.', next: null },
      board: { speaker: 'npc:rook', text: 'Bounties are on the board. Pay is honest. The work is not. The big names at the bottom are the Sentinels. Nobody’s collected on one in thirty years.', next: null },
    },
  },
  // ---------- Tamsin Reed (Hunt): Something in the Reeds
  {
    id: 'dialogue:cc-tamsin', name: 'Tamsin (general, Something in the Reeds)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:tamsin', text: 'One copper and a story. The story better be good.',
        choices: [
          offer('quest:cc-reeds', 'What’s wrong with the river?', 'reeds'),
          { text: 'A crossing, please.', to: 'cross' },
          { text: 'What do you do with all those coppers?', to: null, when: { trust: 'npc:tamsin', value: 'friendly' }, effects: [{ openDialogue: 'dialogue:cc-tamsin-confide' }] },
          bye,
        ],
      },
      reeds: { speaker: 'npc:tamsin', text: 'Something swims under my boat at night. Big. Slow. Pale. Fish are leaving the river. Fish know things. Watch from the ferry rail after dark, if you’ve the nerve.', next: null },
      cross: { speaker: 'npc:tamsin', text: 'Sit in the middle. Don’t trail your hand.', next: null },
    },
  },
  {
    id: 'dialogue:obj-shore-ferry-rail', name: 'Reeds: watching from the ferry',
    entries: [
      { when: { all: [stage('quest:cc-reeds', 'watch'), NIGHT] }, node: 'night' },
      { when: stage('quest:cc-reeds', 'watch'), node: 'day' },
      { node: 'rail' },
    ],
    nodes: {
      rail: { speaker: 'narrator', text: 'The ferry rail, worn smooth by Tamsin’s hands.', next: null },
      day: { speaker: 'narrator', text: 'The Wend runs brown and ordinary in the daylight. Whatever swims here waits for dark.', next: null },
      night: { speaker: 'narrator', text: 'Under the black water, pale shapes slide past the ferry, slow, in a line. They are the size of people. They are singing, very faintly, the way the Bell sings.', effects: [{ setFlag: 'cc.reeds_seen', value: true }], next: null },
    },
  },
  {
    id: 'dialogue:obj-shore-reed-bed', name: 'Reeds: the reed bed',
    entries: [{ when: stage('quest:cc-reeds', 'follow'), node: 'choir' }, { node: 'reeds' }],
    nodes: {
      reeds: { speaker: 'narrator', text: 'Tall reeds at the river’s mouth, where the Wend meets the Abbey lake.', next: null },
      choir: { speaker: 'narrator', text: 'At the reed bed the shapes rise just under the surface: drowned monks in choir robes, going home to the Bell. One of them turns its face up to you and bows.', next: 'tamsin' },
      tamsin: { speaker: 'npc:tamsin', text: '(She has followed in the ferry.) The choir. All this time, the choir. Here: trout, smoked. You’ve earned a story and a supper.', next: null },
    },
  },
  // ---------- Old Hobb (Umbral): Empty Graves
  {
    id: 'dialogue:cc-hobb', name: 'Hobb (general, Empty Graves)',
    entries: [
      { when: { questStage: 'quest:reaver-the-muster-of-the-dead', stage: 'hobb' }, node: 'muster' },
      { when: stage('quest:cc-empty-graves', 'report'), node: 'report' },
      { node: 'start' },
    ],
    nodes: {
      muster: { speaker: 'npc:hobb', text: 'Walking dead with axes, you say? Then they’re not mine. Mine walk to the barrow on the moor, Varric’s barrow, and lately there’s a big lad at the door, laughing, letting them in.', next: null },
      start: {
        speaker: 'npc:hobb', text: 'Dug that one twice. Nobody stays put any more.',
        choices: [
          offer('quest:cc-empty-graves', 'What’s wrong with the graves?', 'graves'),
          { text: 'Whose is the tidy grave by the yew?', to: null, when: { trust: 'npc:hobb', value: 'friendly' }, effects: [{ openDialogue: 'dialogue:cc-hobb-confide' }] },
          bye,
        ],
      },
      graves: { speaker: 'npc:hobb', text: 'Three empty graves. Don’t tell Godric. Not yet. Look at night; that’s when they go.', next: null },
      report: {
        speaker: 'npc:hobb', text: 'A barrow, you say. On the moor. With a door that wasn’t there last year.',
        choices: [{ text: 'They’re walking to a muster.', to: 'home', insight: 'graves_muster' }, { text: 'I’ll keep an eye on it.', to: 'home' }],
      },
      home: { speaker: 'npc:hobb', text: 'The Hollowed walk home, you know. They always walk home. That barrow is Varric’s. The first duellist. Seems he’s calling his own back. Take this charm. It keeps the dead polite.', next: null },
    },
  },
  {
    id: 'dialogue:obj-brind-empty-grave', name: 'Graves: the empty grave',
    entries: [
      { when: { all: [stage('quest:cc-empty-graves', 'search'), NIGHT] }, node: 'night' },
      { when: stage('quest:cc-empty-graves', 'search'), node: 'day' },
      { node: 'grave' },
    ],
    nodes: {
      grave: { speaker: 'narrator', text: 'A grave, neatly kept. Hobb’s work.', next: null },
      day: { speaker: 'narrator', text: 'The earth is turned but the graves are filled again by day. Hobb said to look at night.', next: null },
      night: { speaker: 'narrator', text: 'The grave stands open. Bare footprints lead out of it, through the lychgate, and away over the moor in a straight line, as if the walker knew exactly where it was going.', effects: [{ setFlag: 'cc.graves_searched', value: true }], next: null },
    },
  },
  {
    id: 'dialogue:obj-barrow-door', name: 'Graves: the barrow door', scope: 'party',
    entries: [
      { when: { questStage: 'quest:reaver-duel-at-the-barrow', stage: 'door' }, node: 'duel' },
      { node: 'door' },
    ],
    nodes: {
      // Reaver featured thread: the Swordsman bearer at the door
      duel: {
        speaker: 'npc:bearer-swordsman', text: 'Varric ended the Schools’ War with one duel. I mean to end him with one more. Alone. It’s the only honourable way.',
        choices: [
          { text: 'Then I’ll hold the door, and nobody interrupts.', to: 'held', effects: [{ setFlag: 'reaver.gaspard_door', value: 'held' }] },
          { text: 'He has a whole muster down there. Honour won’t count them. We go together.', to: 'together', effects: [{ setFlag: 'reaver.gaspard_door', value: 'together' }] },
        ],
      },
      held: { speaker: 'npc:bearer-swordsman', text: '(He salutes with the blade.) Thank you. If I don’t come up, tell the Ladder I won.', next: null },
      together: { speaker: 'npc:bearer-swordsman', mood: 'sad', text: 'Together. My maestra would hate it. My maestra isn’t here. All right.', next: null },
      door: { speaker: 'narrator', text: 'An old barrow on the moor with a door of stone that was not there last year. The footprints go in. From inside comes the sound of many people standing to attention.', next: null },
    },
  },
  // ---------- Ysolde Fenn (Rime)
  {
    id: 'dialogue:cc-ysolde', name: 'Ysolde (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ysolde', text: 'Every record since the founding. Some are even legible.',
        choices: [
          { text: 'Tell me about the Concord.', to: 'concord' },
          { text: 'The Stag in your chronicle.', to: 'stag' },
          { text: 'Do you have family, Ysolde?', to: null, when: { trust: 'npc:ysolde', value: 'friendly' }, effects: [{ openDialogue: 'dialogue:cc-ysolde-confide' }] },
          bye,
        ],
      },
      concord: { speaker: 'npc:ysolde', text: 'Twelve schools, twelve stones, one crown, and a Bell to say when it passes. It held a thousand years. Then it didn’t. I would like very much to know why.', next: 'start' },
      stag: { speaker: 'npc:ysolde', text: 'Drawn in the margin of a chronicle three hundred years old, weeping. Whoever drew it knew. Whatever is weeping now has been weeping a long while.', effects: [{ setFlag: 'cc.ysolde_stag', value: true }], next: 'start' },
    },
  },
  // ---------- Pip (Song): Pip's Big Adventure
  {
    id: 'dialogue:cc-pip', name: 'Pip (general, Pip’s Big Adventure)',
    entries: [{ when: stage('quest:cc-pip', 'home'), node: 'home' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:pip', text: 'I’m your squire now. I decided.',
        choices: [
          offer('quest:cc-pip', 'All right, squire. Where to?', 'adventure'),
          { text: 'Can you hear the stones sing?', to: 'unsung', when: { questCompleted: 'quest:cc-pip' } },
          { text: 'What’s in your boot, Pip?', to: null, when: { trust: 'npc:pip', value: 'trusted' }, effects: [{ openDialogue: 'dialogue:cc-pip-confide' }] },
          bye,
        ],
      },
      adventure: { speaker: 'npc:pip', mood: 'happy', text: 'The well! I’m not allowed near the well. That’s why it’s an adventure.', next: null },
      home: {
        speaker: 'npc:pip', text: 'That was the best adventure. Here, you can have my lucky stone. I’ll find another one. I always find them.',
        choices: [{ text: 'Thank you, squire.', to: null }],
      },
      unsung: { speaker: 'npc:pip', text: 'No. Everybody can, a bit, except me. Ysolde says I’m Unsung. She says that’s allowed. I just listen harder.', effects: [{ insight: 'pip_unsung' }], next: null },
    },
  },
  {
    id: 'dialogue:obj-brind-well', name: 'Pip: the well',
    entries: [
      { when: stage('quest:cc-pip', 'well'), node: 'drop' },
      { when: stage('quest:cc-pip', 'drop'), node: 'fetch' },
      { node: 'well' },
    ],
    nodes: {
      well: { speaker: 'narrator', text: 'The village well. A bucket, a rope and a sign that says NO PIP.', next: null },
      drop: { speaker: 'npc:pip', text: 'Oops. (He drops something shiny down the well, very much on purpose.) Now we HAVE to have an adventure.', next: null },
      fetch: {
        speaker: 'narrator', text: 'You haul up the bucket. In it is an old coin, stamped with twelve marks in a ring and a crown in the middle: a Concord coin, from before the Hollowing.',
        effects: [{ setFlag: 'cc.pip_coin', value: true }], next: null,
      },
    },
  },
  // ---------- Corwin Hale (Ash): Rebuild the Mill
  {
    id: 'dialogue:cc-corwin', name: 'Corwin (general, Rebuild the Mill)',
    entries: [{ when: stage('quest:cc-mill', 'corwin'), node: 'turnin' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:corwin', text: 'The mill burned the night the wolves came. Not a coincidence.',
        choices: [
          offer('quest:cc-mill', 'Can I help rebuild it?', 'timber'),
          { text: 'That’s my staff. Your old hearth-beam.', to: 'beam', when: { heroClass: 'arcanist' }, trust: 1 },
          { text: 'Were the Hales always Brindlecross folk?', to: null, when: { trust: 'npc:corwin', value: 'friendly' }, effects: [{ openDialogue: 'dialogue:cc-corwin-confide' }] },
          bye,
        ],
      },
      timber: { speaker: 'npc:corwin', text: 'Bring me timber and I’ll bring you bread. Ten good lengths of oak, and clear the wolves off the mill road while you’re at it.', next: null },
      beam: { speaker: 'npc:corwin', mood: 'happy', text: 'That staff of yours. That’s my old hearth-beam, that is. Gave it to an Arcanist who asked nicely. Thirty years and it’s come home.', next: 'start' },
      turnin: { speaker: 'npc:corwin', mood: 'happy', text: 'That’s the last of it. She’ll grind by spring. When she does, the bakery’s doing honey cakes, and you’re first in the queue.', next: null },
    },
  },
  // ---------- Sela Moth (Storm): Wake the Waystones
  {
    id: 'dialogue:cc-sela', name: 'Sela (general, Wake the Waystones)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:sela', text: 'Every waystone you wake, I can send you back to.',
        choices: [
          offer('quest:cc-waystones', 'Teach me to wake them.', 'wake'),
          { text: 'Your compass points at the Heart.', to: 'compass' },
          { text: 'Do the storms bother you?', to: null, when: { trust: 'npc:sela', value: 'friendly' }, effects: [{ openDialogue: 'dialogue:cc-sela-confide' }] },
          bye,
        ],
      },
      wake: { speaker: 'npc:sela', text: 'Put your hand on it and think of somewhere you’d like to be. Start with the circle here. Then three more, out in the Gloamwood and on the Briar path.', next: null },
      compass: { speaker: 'npc:sela', text: 'Whatever way I hold it. I’ve never asked it why. The stones hum before a storm, you know. They’re humming now.', next: null },
    },
  },
];

export default dialogues;
