/**
 * Hollow Crown, HUNTSMAN: Antlerford people (general talk), the eight side quests, the mentor thread and the
 * bounties, plus the Act II class-thread, featured-bearer and hook scenes. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const offer = (q: Q, text: string, to: string, extra?: NarrativeCondition): DialogueChoice =>
  ({ text, to, quest: true, when: extra ? { all: [fresh(q), extra] } : fresh(q), effects: [{ startQuest: q }] });
const bye: DialogueChoice = { text: 'Farewell.', to: null, tag: 'leave' };
const NIGHT: NarrativeCondition = { hour: [21, 4] };
const BN = 'npc:ulric-bannock' as const, CO = 'npc:corva-ashby' as const;

const dialogues: DialogueDef[] = [
  // ---------- Bannock (general + mentor thread)
  {
    id: 'dialogue:huntsman-bannock', name: 'Bannock (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: BN, text: 'Sit, if you like. Mind Biscuit, she’s under the bench. She’s always under the bench.',
        choices: [
          offer('quest:huntsman-the-herd-road-cairns', 'What happened to the cairns on the Elkway?', 'cairns', { trust: BN, value: 'friendly' }),
          offer('quest:huntsman-biscuits-hunt', 'Has Biscuit ever caught anything?', 'biscuit', { all: [{ trust: BN, value: 'trusted' }, { questCompleted: 'quest:huntsman-the-barons-bonfire' }] }),
          { text: 'What does the old law actually say?', to: 'law' },
          { text: 'Why does the Master of the Lodge never speak at the feasts?', to: 'quiet', when: { all: [{ trust: BN, value: 'trusted' }, { questCompleted: 'quest:huntsman-biscuits-hunt' }] } },
          bye,
        ],
      },
      quiet: { speaker: BN, text: '(He turns his cup round in his hands for a while.) I had a stammer, as a boy. A bad one. The Lodge laughed, the way a Lodge does, not unkindly. I stopped talking in the hall when I was nine.', next: 'book' },
      book: {
        speaker: BN, text: 'My grandfather gave me the tally book to hold at the count, so I’d have something to do with my mouth. Numbers don’t laugh. You can say a number all the way to the end.',
        choices: [
          { text: 'You read the count aloud every year.', to: 'aloud' },
          { text: 'You don’t stammer now.', to: 'now' },
        ],
      },
      aloud: { speaker: BN, mood: 'happy', text: 'Every autumn feast. I stand up in the hall and read the count, every beast, and nobody laughs and nobody interrupts. It’s the only speech I make. It gets shorter every year.', next: 'start' },
      now: { speaker: BN, mood: 'happy', text: 'Only with you, and Biscuit, and the butcher. (He smiles into his cup.) And with numbers. Never with numbers.', next: 'start' },
      cairns: { speaker: BN, text: 'My grandfather built the first one, where the Elkway leaves the town. It’s in the ditch now. Help me put it back, and I’ll tell you something I’ve never told the Lodge.', next: null },
      biscuit: { speaker: BN, mood: 'sad', text: 'Never. Not a rabbit, not a rat. Fourteen years. She’s too kind, or too slow, or both. I’d like her to catch one thing before she can’t run. Just once. Would you help me set it up?', next: null },
      law: { speaker: BN, text: 'Three lines. Take only what the hunt gives. Take nothing in the calving moon. Count what you leave as well as what you take. That’s it. A thousand years, and it still fits on a door.', next: 'start' },
    },
  },
  {
    id: 'dialogue:huntsman-bannock-cairns', name: 'Mentor: the Herd-Road Cairns', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: BN, text: '(He sits on the verge with his back against the new cairn.) There used to be thirty of these from here to the Antler Gate. The herds walked from one to the next. They don’t need to see them. They smell the old antler.', next: 'pulled' },
      pulled: {
        speaker: BN, mood: 'sad', text: 'The herds didn’t lose their road. The Barons pulled the cairns down, thirty years ago, so the herds would wander and be easier to drive into a killing ground. I saw the carts. I was young, and I said nothing, and I’ve said nothing since.',
        choices: [{ text: 'Then the road can be put back.', to: 'end', insight: 'cairns_pulled', trust: 1 }],
      },
      end: { speaker: BN, text: 'Six of them, at least, from the town to the Snares. One night’s work, if the whole Lodge turned out. Remember that, if anybody ever asks what the old law is for.', next: null },
    },
  },
  {
    id: 'dialogue:huntsman-bannock-biscuit', name: 'Mentor: Biscuit’s Hunt', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: BN, text: '(He is sitting on the paddock fence, very still, with his hat in his hands.) She caught it. She caught it. Fourteen years. And then she looked at it, and she put it down, and it ran off, and she came and sat on my foot.', next: 'end' },
      end: { speaker: BN, mood: 'sad', text: 'That’s the old law, isn’t it. That’s all of it, in one old dog. You’ve shown me something I’d stopped believing I’d see, and I haven’t the words. Thank you.', effects: [{ trust: BN, delta: 1 }], next: null },
    },
  },
  {
    id: 'dialogue:huntsman-bannock-gloves', name: 'Side: measuring Bannock', scope: 'party',
    entries: [{ when: { not: { flag: 'huntsman.bannock_measured' } }, node: 'start' }, { node: 'done' }],
    nodes: {
      start: {
        speaker: BN, text: 'Gloves? For me? (He puts both hands behind his back like a boy caught at the larder.) Mistress Pockle has been after me for forty years. I don’t like being measured. It makes me feel like a horse.',
        choices: [
          { text: 'Then don’t be measured. Shake my hand, that’s all.', to: 'shake', effects: [{ setFlag: 'huntsman.bannock_measured', value: 'shake' }] },
          { text: 'Put your hand down in the mud by the door. I’ll read it like a track.', to: 'track', school: 'hunt', effects: [{ setFlag: 'huntsman.bannock_measured', value: 'track' }] },
          { text: 'She’s eighty-one, Master Bannock. She wants to finish her work.', to: 'kind', trust: 1, effects: [{ setFlag: 'huntsman.bannock_measured', value: 'asked' }] },
        ],
      },
      shake: { speaker: BN, text: '(He shakes your hand. You hold on a moment longer than is polite and count the span against your own.) …Was that a measurement? That was a measurement, wasn’t it.', next: null },
      track: { speaker: BN, text: '(He presses one great palm into the mud by the hearth door, very carefully, as if it might break.) There. A track. That’s different. Hunters leave tracks.', next: null },
      kind: { speaker: BN, mood: 'sad', text: '(A long pause.) Eighty-one. I didn’t know. (He holds out both hands, palms up, and looks at the ceiling while you measure.) Don’t tell anyone the size.', next: null },
      done: { speaker: BN, text: 'You’ve got the size. Don’t say it out loud. Biscuit will tell everyone.', next: null },
    },
  },
  // ---------- Biscuit
  {
    id: 'dialogue:huntsman-biscuit', name: 'Biscuit',
    entries: [{ node: 'lean' }],
    nodes: { lean: { speaker: 'npc:biscuit', text: '(Biscuit leans her whole weight against your legs, which is a good deal of weight, and looks up at you as if you might know where the herd went.)', next: null } },
  },
  {
    id: 'dialogue:huntsman-biscuit-hare', name: 'Mentor: Biscuit catches something', scope: 'party',
    entries: [{ node: 'hare' }],
    nodes: {
      hare: { speaker: 'npc:biscuit', text: '(Biscuit is standing in the long grass with a hare in her mouth, very gently, as if it were an egg. She looks at you. She looks at the hare. Then she puts it down, and it bolts, and she watches it go with her ears up and her tail going.)', next: 'sit' },
      sit: { speaker: 'narrator', text: 'She trots back past you to the fence, where Bannock has had to sit down, and sits on his foot.', next: null },
    },
  },
  {
    id: 'dialogue:obj-biscuit-hare-run', name: 'Mentor: setting up Biscuit’s hunt', scope: 'party',
    entries: [{ when: stage('quest:huntsman-biscuits-hunt', 'run'), node: 'run' }, { node: 'paddock' }],
    nodes: {
      run: {
        speaker: 'narrator', text: 'The paddock behind the Lodge. A short run, a low fence and a hare from the warren that is fat, lazy and in no hurry. Biscuit is lying in the sun with her eyes shut.',
        choices: [
          { text: 'Lay the scent downwind of her, so she finds it herself.', to: 'scent', school: 'hunt' },
          { text: 'Clap your hands and let the hare go.', to: 'go' },
        ],
      },
      scent: { speaker: 'narrator', text: 'One of Biscuit’s ears goes up. Then the other. Then, slowly, all of her goes up, and she is off across the paddock like a grey flag in the wind.', next: null },
      go: { speaker: 'narrator', text: 'The hare sits up and considers its options. Biscuit opens one eye. Then something very old wakes in her, and she is off across the paddock like a grey flag in the wind.', next: null },
      paddock: { speaker: 'narrator', text: 'The paddock behind the Lodge, where Biscuit once caught a hare and let it go.', next: null },
    },
  },
  // ---------- Corva (general, the Gamekeeper's Notice)
  {
    id: 'dialogue:huntsman-corva', name: 'Corva (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: CO, text: 'Tracker. Did you want something? Ask. I always answer.',
        choices: [
          { text: 'Why do you hunt alone?', to: 'alone' },
          { text: 'Have you ever missed?', to: 'miss' },
          bye,
        ],
      },
      alone: { speaker: CO, text: 'Because then the only person who can make a mistake is me, and I don’t.', next: null },
      miss: { speaker: CO, text: 'No. Not once. It isn’t a boast. I would much rather have missed something, once, and known what it felt like.', next: null },
    },
  },
  {
    id: 'dialogue:huntsman-corva-notice', name: 'Side: Quentin’s notice', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: CO, text: '(She reads the letter. Then she reads it again, every word.) Twenty years. He has written this nine times. I have found four of them in the bins. Tell him I accept.', effects: [{ setFlag: 'huntsman.notice_given', value: true }], next: 'eat' },
      eat: {
        speaker: CO, text: 'And tell him to eat properly. He never eats when I’m out hunting. He waits up.',
        choices: [
          { text: 'He says you weep after every kill.', to: 'weep', when: { flag: 'huntsman.snipe_told' } },
          { text: 'I’ll tell him.', to: null },
        ],
      },
      weep: { speaker: CO, text: '(She folds the letter very small.) Then he was a better gamekeeper than I knew. You may go.', next: null },
    },
  },
  // ---------- the Lodge Yards: Grandfer Lumm, Jem Furlong, the bounty board
  {
    id: 'dialogue:huntsman-lumm', name: 'Grandfer Lumm (Grandfer Lumm’s Hat)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:grandfer-lumm', text: 'Did I ever tell you about the boar? In my hat? A boar, in my hat, and I had the hat on at the time.',
        choices: [
          offer('quest:huntsman-grandfer-lumms-hat', 'Every feast, Grandfer. The Lodge wants proof.', 'proof'),
          { text: 'How big was the herd, when you were young?', to: 'herd' },
          bye,
        ],
      },
      proof: { speaker: 'npc:grandfer-lumm', mood: 'angry', text: 'Proof! The hat’s in the loft, where it’s always been, in its place of honour. Go and look at it. Then come and tell me I’m a liar to my face. I’m ninety. I can take it.', next: null },
      herd: { speaker: 'npc:grandfer-lumm', mood: 'sad', text: 'Three days to cross the Elkway. Three days. You could hear them in your sleep. You can’t hear anything now.', next: 'start' },
    },
  },
  {
    id: 'dialogue:obj-lumm-hat', name: 'Side: the famous hat',
    entries: [{ when: stage('quest:huntsman-grandfer-lumms-hat', 'hat'), node: 'hat' }, { node: 'plain' }],
    nodes: {
      hat: { speaker: 'narrator', text: 'On a velvet cushion in the loft, under a little painted sign that says THE HAT, sits a leather hunting cap about the size of a pudding basin. Caught in the band are three short, stiff, ginger bristles.', next: null },
      plain: { speaker: 'narrator', text: 'THE HAT, on its cushion.', next: null },
    },
  },
  {
    id: 'dialogue:huntsman-lumm-verdict', name: 'Side: settling Grandfer Lumm’s boar', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:grandfer-lumm', text: 'Well? You’ve seen it. Was it a boar or wasn’t it?',
        choices: [
          { text: 'Those bristles are a boar’s. A piglet, in the calving moon. It would just about fit.', to: 'piglet', school: 'hunt', effects: [{ setFlag: 'huntsman.lumm_settled', value: 'piglet' }] },
          { text: 'It was a boar. I’ll tell the whole Lodge I’ve seen the proof.', to: 'boar', trust: 1, effects: [{ setFlag: 'huntsman.lumm_settled', value: 'boar' }] },
          { text: 'Those are hedgehog prickles, Grandfer.', to: 'hog', effects: [{ setFlag: 'huntsman.lumm_settled', value: 'hedgehog' }] },
        ],
      },
      piglet: { speaker: 'npc:grandfer-lumm', mood: 'happy', text: 'A piglet. Well. Yes. Technically. I never said how big. I never once said how big. (He is beaming.) A boar is a boar.', next: null },
      boar: { speaker: 'npc:grandfer-lumm', mood: 'happy', text: 'Ha! You hear that? You lot? A boar! (He leans in and whispers.) It was very small. Thank you.', next: null },
      hog: { speaker: 'npc:grandfer-lumm', mood: 'angry', text: 'A hedgehog. A hedgehog! (A long pause.) …It was a very fierce hedgehog. Don’t you dare tell them.', next: null },
    },
  },
  {
    id: 'dialogue:huntsman-jem', name: 'Jem Furlong (Hounds Facing East)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:jem-furlong', text: 'Forty hounds, and not one will take a scent. Look at them. All facing east, every one, like compass needles.',
        choices: [offer('quest:huntsman-hounds-facing-east', 'What are they waiting for?', 'wait'), bye],
      },
      wait: { speaker: 'npc:jem-furlong', text: 'That’s what I’d like to know. They stand up after dark and stare at the Antler Gate. Walk them out to the east milestone tonight. If they see whatever it is, maybe they’ll let it go.', next: null },
    },
  },
  {
    id: 'dialogue:obj-lodge-east-milestone', name: 'Side: the east milestone',
    entries: [
      { when: { all: [stage('quest:huntsman-hounds-facing-east', 'walk'), NIGHT] }, node: 'night' },
      { when: stage('quest:huntsman-hounds-facing-east', 'walk'), node: 'day' },
      { node: 'stone' },
    ],
    nodes: {
      stone: { speaker: 'narrator', text: 'An old milestone on the east road: ANTLER GATE, and a number worn too smooth to read.', next: null },
      day: { speaker: 'narrator', text: 'The hounds flop down round the milestone, all facing east, and go to sleep. Jem said they stand up after dark.', next: null },
      night: {
        speaker: 'narrator', text: 'At midnight, far off over the forest, a light like a burning tree moves past the Antler Gate, slow and gold and smoking black at the edges. Forty hounds stand up at once and do not make a sound. They know it. They are waiting for it to call them.',
        effects: [{ setFlag: 'huntsman.hounds_heard', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:huntsman-jem-hounds', name: 'Side: what the hounds saw', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:jem-furlong', text: 'A light? Past the gate? (He goes very quiet.) My grandmother used to say that when the Great Hunt ran, the Lodge hounds ran with it. Not after it. With it.',
        choices: [
          { text: 'Then they’re waiting for it to run again.', to: 'run', trust: 1 },
          { text: 'It’s hollowed, Jem. It isn’t calling anything.', to: 'hollow' },
        ],
      },
      run: { speaker: 'npc:jem-furlong', mood: 'happy', text: 'Then when you go to that gate, they go with you. I won’t hold them, and I couldn’t if I tried. Here, for the road.', next: 'old' },
      hollow: { speaker: 'npc:jem-furlong', text: 'Maybe. They don’t think so. When you go to that gate, they’ll go with you whether I like it or not. Here, for the road.', next: 'old' },
      old: { speaker: 'npc:jem-furlong', text: 'And go and look at the old kennels on your way, out past the milestone, where my grandmother kept the pack before they burned. She had a word carved over the door. I was too little to read it.', next: null },
    },
  },
  {
    id: 'dialogue:huntsman-ruddock', name: 'Tallykeeper Ruddock (bounties)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:hesketh-ruddock', text: 'Bounties on the board. Paid by the head, heads counted twice. Which one?',
        choices: [
          offer('quest:huntsman-bounty-tick-swarm', 'The tick swarm.', 'ticks'),
          offer('quest:huntsman-bounty-old-broadhead', 'Old Broadhead.', 'broad'),
          bye,
        ],
      },
      ticks: { speaker: 'npc:hesketh-ruddock', text: 'Six, minimum. They drop out of the trees in the Old Snares onto anything warm. Bring me the count and don’t bring me the ticks.', next: null },
      broad: { speaker: 'npc:hesketh-ruddock', mood: 'sad', text: 'Led the herd eleven autumns. I tallied him every one. Now he stands in the road and gores carters. Put him down kindly. I’ll tally that too.', next: null },
    },
  },
  // ---------- the Tannery Lanes: the Back Room, Gloves for a Giant
  {
    id: 'dialogue:huntsman-dabney', name: 'Dabney Flinders (the Back Room)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:dabney-flinders', text: 'Don’t tell the Mistress I talked to you. Please.',
        choices: [offer('quest:huntsman-the-back-room', 'What’s wrong?', 'wrong'), bye],
      },
      wrong: { speaker: 'npc:dabney-flinders', mood: 'afraid', text: 'The back room. She sells pelts out of it that nobody else will touch, and the people who buy them stop coming in to chat. Old Mister Harle hasn’t said a word in a month. I’ve left the back door on the latch.', next: null },
    },
  },
  {
    id: 'dialogue:obj-lusk-back-room', name: 'Side: Lusk’s back room', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-back-room', 'room'), node: 'room' }, { node: 'shut' }],
    nodes: {
      room: { speaker: 'narrator', text: 'Pelts on hooks in rows, dozens of them, each with a price on a string. Every one is dripping black onto the flagstones, slowly, like a cellar after rain. On the bench is a ledger of customers, and beside half the names someone has written: quiet now.', next: 'lusk' },
      lusk: { speaker: 'npc:griselda-lusk', mood: 'angry', text: '(From the doorway.) The front of the shop is for looking. The back of the shop is for nobody.', next: null },
      shut: { speaker: 'narrator', text: 'Lusk’s back room, emptier now.', next: null },
    },
  },
  {
    id: 'dialogue:huntsman-lusk-back-room', name: 'Side: dealing with Griselda Lusk', scope: 'party',
    entries: [{ when: { not: { flag: 'huntsman.back_room' } }, node: 'start' }, { node: 'after' }],
    nodes: {
      start: {
        speaker: 'npc:griselda-lusk', text: 'Business is business. Coats are coats. If people want to wear a sad coat, who am I to stop them?',
        choices: [
          { text: 'Those pelts are hollowing your customers. Shut the room, or I’ll shut it.', to: 'shut', effects: [{ setFlag: 'huntsman.back_room', value: 'shut' }] },
          { text: 'Who sells them to you?', to: 'who', effects: [{ setFlag: 'huntsman.back_room', value: 'followed' }] },
          { text: 'You’re a tanner. You can smell it on them. You knew.', to: 'knew', school: 'hunt', effects: [{ setFlag: 'huntsman.back_room', value: 'shut' }] },
        ],
      },
      shut: { speaker: 'npc:griselda-lusk', text: '(She looks at you, and at the pelts, and at her own black-stained hands.) …Fine. Fine. Burn them. I’ll find the coin somewhere else.', next: null },
      knew: { speaker: 'npc:griselda-lusk', mood: 'sad', text: 'Course I knew. Business was dying. Then it wasn’t. (She takes the first pelt off its hook.) Help me get them in the yard. We’ll burn them tonight.', next: null },
      who: { speaker: 'npc:griselda-lusk', text: 'A cart, before dawn, from the Old Snares. The driver never gets down and I never ask. Paid in coin. Not my coin. Somebody else pays him, and he pays me back a cut. Follow the ruts, if you’re so curious.', next: null },
      after: { speaker: 'npc:griselda-lusk', text: 'You’ve had your look. Go on.', next: null },
    },
  },
  {
    id: 'dialogue:obj-pelt-cart-tracks', name: 'Side: the pelt cart’s tracks', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-back-room', 'cart'), node: 'ruts' }, { node: 'plain' }],
    nodes: {
      ruts: { speaker: 'narrator', text: 'Deep cart ruts, coming and going on the old track to the Old Snares, with black drips between them. They lead to the edge of a stockade in the deep forest: the Poachers’ Camp. Beside the gate, in the mud, is a hoofprint shod with silver. Only the Barons’ stables shoe their horses with silver.', next: null },
      plain: { speaker: 'narrator', text: 'Old cart ruts in the Old Snares track.', next: null },
    },
  },
  {
    id: 'dialogue:huntsman-dabney-done', name: 'Side: the Back Room settled',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:dabney-flinders', mood: 'happy', text: 'Mister Harle came in this morning and talked for an hour about tallow. An hour! The Mistress listened to all of it. She’s been thinking-quiet since. Here. She said you should have this, and then she said don’t tell anyone she said so.', next: null },
    },
  },
  {
    id: 'dialogue:huntsman-lusk', name: 'Griselda Lusk (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:griselda-lusk', text: 'Hides, leathers, tack. Front of the shop only. Buying or breathing?', next: null } },
  },
  {
    id: 'dialogue:huntsman-pockle', name: 'Aldith Pockle (Gloves for a Giant)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:aldith-pockle', text: 'Give me your hand, dear. (She feels it all over.) Huntsman. Crossbow, right-handed, and you bite your nails. Sixty years I’ve fitted hands. Every hand in Antlerford but one.',
        choices: [offer('quest:huntsman-gloves-for-a-giant', 'Whose?', 'whose'), bye],
      },
      whose: { speaker: 'npc:aldith-pockle', text: 'Ulric Bannock’s. Forty years he’s hidden his hands from me at every feast. I am eighty-one, and I would like to make that man a pair of gloves before I die. Bring me his measure. However you get it.', next: null },
    },
  },
  {
    id: 'dialogue:huntsman-pockle-gloves', name: 'Side: the feast gloves', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:aldith-pockle', text: 'You got it? Tell me. No, write it down. No, whisper it. (You whisper it.) …Oh my. Oh, my word. I’ll need a second hide.',
        choices: [{ text: 'He made me promise not to say it aloud.', to: 'end', trust: 1 }, { text: 'Will you finish them in time for the feast?', to: 'end' }],
      },
      end: { speaker: 'npc:aldith-pockle', mood: 'happy', text: '(She sews while she talks, without once looking down.) Forty years. There. Take them to him and watch him put them on. And take a pair of mine for your trouble. They’re ordinary-sized. You’re an ordinary-sized person. That’s a compliment.', next: null },
    },
  },
  // ---------- the Elkway: Quentin Snipe, the Last Calf
  {
    id: 'dialogue:huntsman-snipe', name: 'Quentin Snipe (the Gamekeeper’s Notice, the Last Calf)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:quentin-snipe', text: 'Huntsman. Mind where you walk. There’s a calf in the bracken and nobody is to touch it.',
        choices: [
          offer('quest:huntsman-the-gamekeepers-notice', 'You look like a man holding a letter he’s afraid of.', 'notice', { all: [{ questCompleted: 'quest:huntsman-the-barons-bonfire' }, { not: { flag: 'huntsman.halfstone' } }] }),
          offer('quest:huntsman-the-last-calf', 'A calf? Alone?', 'calf'),
          { text: 'What is Lady Ashby like, to work for?', to: 'corva', when: { questCompleted: 'quest:huntsman-the-barons-bonfire' } },
          bye,
        ],
      },
      notice: { speaker: 'npc:quentin-snipe', mood: 'afraid', text: 'My notice. Twenty years with her, and I’ve written it nine times. I can’t hand it in. I go to, and she asks if I’ve eaten, and I lose my nerve. Would you? She reads everything twice.', next: null },
      calf: { speaker: 'npc:quentin-snipe', text: 'Newborn, and not a drop of black on it. I daren’t go near. The old law says you may lead a calf home to cover, but you mustn’t touch it, not once, or the mother won’t take it back. If there’s a mother.', next: null },
      corva: {
        speaker: 'npc:quentin-snipe', text: 'Exact. Fair. Pays on the day. (He lowers his voice.) And after every kill, every single one, she goes into the trees on her own and weeps. Then she comes back and asks if I’ve eaten.',
        choices: [{ text: 'Does she know you know?', to: 'know', effects: [{ setFlag: 'huntsman.snipe_told', value: true }] }],
      },
      know: { speaker: 'npc:quentin-snipe', text: 'I’ve never asked. You don’t ask her things. You answer them.', next: 'start' },
    },
  },
  {
    id: 'dialogue:huntsman-snipe-free', name: 'Side: Quentin is free', scope: 'party',
    entries: [{ when: { flag: 'huntsman.notice_given' }, node: 'start' }, { node: 'gone' }],
    nodes: {
      start: { speaker: 'npc:quentin-snipe', text: 'She accepted? Just like that? (He sits down on a stump.) Twenty years. I don’t know what I’ll do. I don’t know what she’ll do. Who’ll wait up?', next: 'end' },
      gone: { speaker: 'npc:quentin-snipe', mood: 'sad', text: 'Gone? Rode for the gate, and the Hall left standing open? Then she’ll find it when she comes home, if she comes home. (He sits down on a stump.) Twenty years. Who’ll wait up now?', next: 'end' },
      end: {
        speaker: 'npc:quentin-snipe', mood: 'sad', text: 'She weeps after every kill, you know. Every one. I’ve never told anyone that. Somebody ought to know, in case. In case of what, I couldn’t tell you.',
        effects: [{ setFlag: 'huntsman.snipe_told', value: true }],
        choices: [{ text: 'I’ll remember it.', to: 'basket', trust: 1 }, { text: 'Eat something, Quentin.', to: 'basket' }],
      },
      basket: { speaker: 'npc:quentin-snipe', text: '(He holds out a covered basket.) I packed it out of habit. I always pack her one. Would you leave it at her hide on the Elkway? I can’t take it myself. I’d only stay.', next: null },
    },
  },
  {
    id: 'dialogue:obj-elkway-calf', name: 'Side: the last calf', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-last-calf', 'calf'), node: 'calf' }, { node: 'bracken' }],
    nodes: {
      calf: {
        speaker: 'narrator', text: 'In the bracken below the tally stone, a newborn elk calf, all legs and ears, without a speck of black on it. It looks at you with enormous dark eyes and takes one wobbly step closer.',
        choices: [
          { text: '(Turn your back and walk slowly away, the way the old law says.)', to: 'law' },
          { text: '(Crouch and hold out your hand.)', to: 'hand' },
        ],
      },
      law: { speaker: 'narrator', text: 'You hear it come after you through the bracken, stopping when you stop. Walk, and don’t look round, and it will follow.', next: null },
      hand: { speaker: 'narrator', text: 'It comes almost close enough to touch, then shies, and stands trembling. You remember the old law, put your hands in your pockets, and walk away. After a moment it follows.', next: null },
      bracken: { speaker: 'narrator', text: 'Flattened bracken where a calf lay.', next: null },
    },
  },
  {
    id: 'dialogue:obj-calf-cover-3', name: 'Side: the calf in cover', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-last-calf', 'lead'), node: 'home' }, { node: 'plain' }],
    nodes: {
      home: { speaker: 'narrator', text: 'In the deepest thicket by the Elkway, where the herd used to rest, the calf folds up its legs one at a time and lies down. You never touched it once. Somewhere north, very faintly, something answers it.', next: null },
      plain: { speaker: 'narrator', text: 'A deep thicket by the Elkway.', next: null },
    },
  },
  // ---------- the Old Snares: Hedda Crake, Unstringing, the First Letter
  {
    id: 'dialogue:huntsman-hedda', name: 'Hedda Crake (Unstringing, the First Letter)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:hedda-crake', text: 'Thirty years I’ve burned charcoal out here and never once been snared. I look where I put my feet. Other folk don’t.',
        choices: [
          offer('quest:huntsman-unstringing', 'Do you want the old snares cut?', 'cut', { questCompleted: 'quest:huntsman-the-poachers-camp' }),
          offer('quest:huntsman-the-first-letter', 'Whose bones are in the snare-tree?', 'tree'),
          bye,
        ],
      },
      cut: { speaker: 'npc:hedda-crake', text: 'Three left. Each one’s got something in it. The last one’s been swearing at me since Tuesday. I don’t like to go near a snare that swears.', next: null },
      tree: { speaker: 'npc:hedda-crake', text: 'A hunter. Been up there since before I came. There’s a letter in his coat, sealed with the Lodge’s seal. Nobody’s been brave enough to read it. I’m not brave. I’m busy.', next: null },
    },
  },
  {
    id: 'dialogue:obj-old-snare-1', name: 'Unstringing: the first snare', scope: 'party',
    entries: [{ when: stage('quest:huntsman-unstringing', 'snares'), node: 'hound' }, { node: 'plain' }],
    nodes: {
      hound: { speaker: 'narrator', text: 'A Baron’s hound, a lean grey lurcher in a raven collar, caught by the hind leg and too tired to growl. You cut the line. It limps three steps, looks back at you, and then runs, the wrong way, towards the Lodge kennels.', next: null },
      plain: { speaker: 'narrator', text: 'A cut snare-line.', next: null },
    },
  },
  {
    id: 'dialogue:obj-old-snare-2', name: 'Unstringing: the second snare', scope: 'party',
    entries: [{ when: stage('quest:huntsman-unstringing', 'snares'), node: 'hare' }, { node: 'plain' }],
    nodes: {
      hare: { speaker: 'narrator', text: 'A hare, quite still in the noose, its eyes running black. It does not struggle. When you cut it free it sits where it is for a long moment, and then, slowly, it shakes the black off its whiskers like rain and goes.', next: null },
      plain: { speaker: 'narrator', text: 'A cut snare-line.', next: null },
    },
  },
  {
    id: 'dialogue:obj-old-snare-3', name: 'Unstringing: the third snare', scope: 'party',
    entries: [{ when: stage('quest:huntsman-unstringing', 'snares'), node: 'boot' }, { node: 'plain' }],
    nodes: {
      boot: { speaker: 'narrator', text: 'Hanging upside down from the last snare by one boot, which is the Poacher Chief’s own boot, is a short man in a poacher’s coat. He has been here since the camp fell. He has a great deal to say about it.', next: 'skeets' },
      skeets: {
        speaker: 'narrator', mood: 'angry', text: '“Second-in-command, I was! Second! And he ran off and left me in his spare boot! Cut me down and I’ll tell you everything. Cut me down and I’ll tell you things I don’t even know!”',
        choices: [
          { text: '(Cut him down.)', to: 'down' },
          { text: 'Who paid the Chief for the pelts?', to: 'paid' },
        ],
      },
      paid: { speaker: 'narrator', text: '“A lady! Never saw her face! Silver shoes on her horse! Now cut me DOWN!” You cut him down. He lands on his head, gets up, and runs off with one bare foot.', next: null },
      down: { speaker: 'narrator', text: 'He lands on his head, gets up, says “thank you” in a very surprised voice, and runs off into the Snares with one bare foot.', next: null },
      plain: { speaker: 'narrator', text: 'A cut snare-line, and a boot.', next: null },
    },
  },
  {
    id: 'dialogue:huntsman-hedda-snares', name: 'Unstringing: done',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:hedda-crake', mood: 'happy', text: 'No more swearing. Lovely. I can hear the birds again. Well, the bird. There’s one. (She takes the cut line from the third snare and rolls it between her black fingers.) Hold on.', next: 'cord' },
      cord: {
        speaker: 'npc:hedda-crake', text: 'That isn’t poacher hemp. That’s silk. Stable cord, the sort Barons’ grooms use for halters. And somebody’s strung a new line since the camp fell, down by the old cart track. I heard it go in.',
        choices: [
          { text: 'A Baron is setting snares?', to: 'baron' },
          { text: 'I’ll find it.', to: 'end' },
        ],
      },
      baron: { speaker: 'npc:hedda-crake', text: 'Somebody with a Baron’s stable is. I burn charcoal; I don’t ask whose. You’re a Lodge hunter. You ask.', next: 'end' },
      end: { speaker: 'npc:hedda-crake', text: 'Here, something for your trouble. Mind your feet on the way. Especially by the cart track.', next: null },
    },
  },
  {
    id: 'dialogue:obj-snare-tree-letter', name: 'The First Letter', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-first-letter', 'tree'), node: 'letter' }, { node: 'tree' }],
    nodes: {
      letter: {
        speaker: 'narrator', text: '“To the Master of the Lodge, from Osric Fallow, Elkway warden, in the autumn of C. 1013. The herd did not come down the road this year. They came through the trees in a rabble, lost. The cairns on the Elkway are down, every one, and there are cart tracks where they stood.”',
        choices: [
          { text: 'Read the rest.', to: 'rest' },
          { text: 'Cart tracks where the cairns stood. Somebody pulled them down.', to: 'pulled', school: 'hunt', insight: 'cairns_pulled' },
        ],
      },
      rest: { speaker: 'narrator', text: '“I mean to go into the Snares and see who drives the carts. If I am not home by the calving moon, someone else must count the herd. Count what is left as well as what is taken.” The letter was never delivered.', next: null },
      pulled: { speaker: 'narrator', text: 'Somebody pulled the cairns down on purpose, the very first autumn after the Hollowing, and drove carts through where they stood. Osric Fallow went to find out who. He did not come home.', next: 'rest' },
      tree: { speaker: 'narrator', text: 'The snare-tree. Someone has taken the hunter down and laid him under a cairn of stones.', next: null },
    },
  },
  {
    id: 'dialogue:huntsman-hedda-letter', name: 'The First Letter: Osric Fallow', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:hedda-crake', text: 'Osric Fallow. The Elkway warden. They said he ran off to Concordia with a debt. (She is quiet a moment.) Help me get him down. He’s been up there long enough.',
        choices: [{ text: '(Help her lay him under a cairn.)', to: 'end', trust: 1 }, { text: 'Someone in Concordia will want this letter.', to: 'end' }],
      },
      end: { speaker: 'npc:hedda-crake', text: 'Keep the letter. Somebody somewhere keeps records of things like this. And if he went to watch the carts, he watched from the wardens’ hide, up in the rocks over the old cart track. Nobody’s climbed to it since. Mind your feet.', next: null },
    },
  },

  // ======================= ACT II
  {
    id: 'dialogue:huntsman-thaddeus', name: 'C-1 Hollis Lodge: Thaddeus Hollis', scope: 'party',
    entries: [{ when: { flag: 'huntsman.charter', value: 'sold' }, node: 'cold' }, { node: 'start' }],
    nodes: {
      cold: {
        speaker: 'npc:thaddeus-hollis', mood: 'angry', text: 'Antlerford, is it? Word comes through the arches with the tears, you know. The Lodge sold its charter to the Barons. So you’re a Baron’s hound now. Well. Sit down anyway. We don’t turn hounds away.',
        choices: [
          { text: 'I voted to sell it. I thought it would save the herd.', to: 'honest' },
          { text: 'I need to find the Hunt’s Sentinel.', to: 'stag', quest: true },
        ],
      },
      honest: { speaker: 'npc:thaddeus-hollis', text: '(He looks at you a long time.) Honest, at least. That’s a start. The old law says count what you leave as well as what you take. You left a lot.', next: 'stag' },
      start: {
        speaker: 'npc:thaddeus-hollis', mood: 'happy', text: 'A Lodge hunter, from Antlerford, here! Sit. Sit by the fire. Thirty years we’ve kept this lodge and nobody left who could teach us the old law. We hunt by guesswork. We hunt badly.',
        choices: [
          { text: 'I need to find the Hunt’s Sentinel.', to: 'stag', quest: true },
          { text: 'Take only what the hunt gives. That’s the first line.', to: 'line', trust: 1 },
        ],
      },
      line: { speaker: 'npc:thaddeus-hollis', mood: 'happy', text: '(He closes his eyes.) Take only what the hunt gives. My father said it every morning. I’d forgotten the words and kept the habit. Thank you.', next: 'stag' },
      stag: { speaker: 'npc:thaddeus-hollis', mood: 'sad', text: 'The White Stag. The Turning procession followed it through the Gloamwood every twelve years. Now it stands in its glade and weeps, and the wood is sick with it. You can follow its trail, but only if you take nothing on the way. Nothing at all. The trail knows.', next: null },
    },
  },
  {
    id: 'dialogue:obj-huntsman-stag-trail-1', name: 'C-2 the first trail-mark', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-stags-road', 'trail'), node: 'mark' }, { node: 'plain' }],
    nodes: {
      mark: {
        speaker: 'narrator', text: 'A hoofprint in the moss, rimmed with white frost, and the faint black stain of a tear. Beside it, shed and perfect, lies a red fox pelt, as if something had left it there for you.',
        choices: [
          { text: '(Leave it.)', to: 'leave' },
          { text: '(Take the pelt. It’s only a pelt.)', to: 'take', effects: [{ setFlag: 'huntsman.trail_cold', value: true }] },
        ],
      },
      leave: { speaker: 'narrator', text: 'You step past it. A little further on, there is another hoofprint, fresher.', next: null },
      take: { speaker: 'narrator', text: 'You roll it up and put it in your pack. When you look down, the frost has gone out of the hoofprint.', next: null },
      plain: { speaker: 'narrator', text: 'An old hoofprint in the moss.', next: null },
    },
  },
  {
    id: 'dialogue:obj-huntsman-stag-trail-2', name: 'C-2 the second trail-mark', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-stags-road', 'trail'), node: 'mark' }, { node: 'plain' }],
    nodes: {
      mark: {
        speaker: 'narrator', text: 'A birch with its bark rubbed white at stag height. At its foot, a ring of glowcaps, the most valuable thing in the Gloamwood, enough to buy a month at the Gilded Goose.',
        choices: [
          { text: '(Leave them.)', to: 'leave' },
          { text: '(Leave them, and brush the moss back over them so nobody else finds them.)', to: 'hide', school: 'hunt' },
          { text: '(Pick a few. Just a few.)', to: 'take', effects: [{ setFlag: 'huntsman.trail_cold', value: true }] },
        ],
      },
      leave: { speaker: 'narrator', text: 'You leave them. A little further on, a white hair is caught on a bramble.', next: null },
      hide: { speaker: 'narrator', text: 'You cover them over. Somewhere ahead, very softly, something steps nearer through the trees.', next: null },
      take: { speaker: 'narrator', text: 'You pick five. The glow goes out of them in your hand.', next: null },
      plain: { speaker: 'narrator', text: 'A birch rubbed white at stag height.', next: null },
    },
  },
  {
    id: 'dialogue:obj-huntsman-stag-trail-3', name: 'C-2 the third trail-mark', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-stags-road', 'trail'), node: 'mark' }, { node: 'plain' }],
    nodes: {
      mark: {
        speaker: 'narrator', text: 'A hollowed wolf, lying across the trail, asleep. It is old, and it is the easiest shot you have ever been offered.',
        choices: [
          { text: '(Walk round it.)', to: 'leave' },
          { text: '(Take the shot.)', to: 'take', effects: [{ setFlag: 'huntsman.trail_cold', value: true }] },
        ],
      },
      leave: { speaker: 'narrator', text: 'You walk round it in a wide circle. It does not wake. Ahead the trees open, and the air smells of frost.', next: null },
      take: { speaker: 'narrator', text: 'One bolt. It doesn’t wake. The wood goes very quiet around you, the way a room does when you have said the wrong thing.', next: null },
      plain: { speaker: 'narrator', text: 'The place where the old wolf slept.', next: null },
    },
  },
  {
    id: 'dialogue:huntsman-thaddeus-cold', name: 'C-2 the trail goes cold', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:thaddeus-hollis', text: 'Cold, is it. I told you, the trail knows. Take what you took to the glade, and leave it where the Stag can see. Then say sorry. Out loud. I don’t know if that part works, but my father always did it.', next: null } },
  },
  {
    id: 'dialogue:obj-huntsman-stag-offering', name: 'C-2 giving it back', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-stags-road', 'cold'), node: 'give' }, { node: 'plain' }],
    nodes: {
      give: { speaker: 'narrator', text: 'You lay what you took on the moss at the edge of the glade and step back. For a long time, nothing. Then, between the far trees, a pale shape lifts its head, looks at you, and walks on, slowly enough to follow.', next: null },
      plain: { speaker: 'narrator', text: 'The moss at the edge of the Stag’s glade.', next: null },
    },
  },
  {
    id: 'dialogue:huntsman-joss', name: 'C-4 Joss Amblin on the Baron', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:joss-amblin', text: 'Tall. Green coat. Silver shoes on her horse. Bought every heavy bolt I had and forty yards of silk rope, paid on the nail, and said thank you. Nobody says thank you in this trade.',
        choices: [
          { text: 'Where did she go?', to: 'where', quest: true },
          { text: 'What did she want the rope for?', to: 'rope' },
        ],
      },
      rope: { speaker: 'npc:joss-amblin', text: 'Said she was going somewhere deep, and something down there spun webs. I said it was a daft idea. She said yes, probably, and paid extra.', next: 'where' },
      where: { speaker: 'npc:joss-amblin', mood: 'afraid', text: 'Down under the roots, where the ground opens up past the willow. She had a list, too. Pinned inside her coat. I only saw the top of it, and I wish I hadn’t. It said “Sentinels”.', next: null },
    },
  },
  {
    id: 'dialogue:obj-huntsman-corva-camp', name: 'C-4 Corva’s camp', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-barons-list', 'camp'), node: 'camp' }, { node: 'plain' }],
    nodes: {
      camp: { speaker: 'narrator', text: 'A neat camp at the lip of a root-cave: a bedroll squared at the corners, a fire buried properly, and a sheet of heavy paper weighted down with a stone. It is a list in a careful, flourishing hand: the twelve Sentinels of the Turning Road, each with a bounty written beside it, and the seal of the Hollow King at the foot.', next: 'list' },
      list: { speaker: 'narrator', text: 'The White Stag is crossed through, with a note: “taken by another.” The second name is the Spinner Below. Under it, in Corva’s own hand: “The smiths came again tonight to measure me. I let them. It is easier to aim when someone else is holding you still.”', next: null },
      plain: { speaker: 'narrator', text: 'A cold camp at the lip of the root-cave.', next: null },
    },
  },
  {
    id: 'dialogue:huntsman-sorrel-letter', name: 'C-6 a letter by hawk', scope: 'party',
    entries: [{ when: { flag: 'huntsman.biscuit_pet' }, node: 'biscuit' }, { node: 'hawk' }],
    nodes: {
      biscuit: { speaker: 'narrator', text: 'A goshawk with Hawkmoor jesses sits on the Hunt arch with a letter on its leg. Biscuit walks up to it, sniffs the letter all over with enormous interest, and is hissed at. She sits down, offended, and does not move for the rest of the scene.', next: 'letter' },
      hawk: { speaker: 'npc:sorrel', text: '(A goshawk with Hawkmoor jesses sits on the Hunt arch and holds out one foot, with a letter tied to it, as if it has been holding it out for some time.)', next: 'letter' },
      letter: {
        speaker: 'npc:ulric-bannock', text: '“The herd came down the Elkway this week. Not many. Some. I counted them and didn’t cross it out. Mistress Pockle has finished my gloves and I have to wear them now. Biscuit sends her regards, from wherever she is lying down. Take only what the hunt gives. U. B.”',
        choices: [{ text: '(Fold the letter away.)', to: 'court', quest: true, effects: [{ setFlag: 'huntsman.bannock_letter', value: true }] }],
      },
      court: { speaker: 'narrator', text: 'The Falconer bearer comes up the road at a run to fetch their hawk, and at the Stone Court that evening the Lodge half and the Moor half hum together under the table. The hawk and the hound do not get on. They will not be getting on. They have agreed on that much.', next: null },
    },
  },
  // ---------- featured bearers (hooks on the bearer NPCs)
  {
    id: 'dialogue:huntsman-featured-ranger', name: 'Featured: What the Wild Gives', scope: 'party',
    entries: [
      { when: stage('quest:huntsman-what-the-wild-gives', 'back'), node: 'back' },
      { when: { all: [stage('quest:huntsman-what-the-wild-gives', 'trail'), { not: { flag: 'huntsman.rowan_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-ranger', text: 'You’re the Lodge hunter. Good. Thaddeus won’t argue with me any more, he just sighs. Everything dies to feed something else, Huntsman. That’s the wild. There’s a fresh kill on the Stag’s trail. Come and tell me I’m wrong.',
        choices: [{ text: 'Show me the kill.', to: null, quest: true, effects: [{ setFlag: 'huntsman.rowan_asked', value: true }] }],
      },
      back: {
        speaker: 'npc:bearer-ranger', text: 'I’ve been thinking about that wolf all day. About who took what, and who was owed. I still think everything feeds something. But I think the feeding has rules, and I don’t know them, and you do. When we go to the Heart, walk at the front with me.',
        effects: [{ setFlag: 'huntsman.rowan_thanked', value: true }],
        choices: [{ text: 'Count what you leave as well as what you take.', to: null }, { text: 'At the front, then.', to: null }],
      },
    },
  },
  {
    id: 'dialogue:obj-huntsman-wild-gives-kill', name: 'Featured: the kill on the Stag’s trail', scope: 'party',
    entries: [{ when: stage('quest:huntsman-what-the-wild-gives', 'trail'), node: 'kill' }, { node: 'plain' }],
    nodes: {
      kill: {
        speaker: 'narrator', text: 'A hollowed wolf has brought down a hind on the Stag’s trail and eaten almost none of it. It killed, and left. The Ranger bearer crouches by it, frowning. “There. Death feeding life. Isn’t it?”',
        choices: [
          { text: 'It didn’t feed. It killed and walked away. That isn’t the wild. That’s the tears.', to: 'hunt', school: 'hunt' },
          { text: 'Something will eat it. The crows. The foxes. You’re not wrong.', to: 'crows' },
          { text: 'What did the hind owe the wolf?', to: 'owe' },
        ],
      },
      hunt: { speaker: 'narrator', text: 'Rowan looks at the hind for a long time. “It didn’t eat,” they say at last. “It didn’t even eat.” They stand up and walk back towards the lodge without another word.', next: null },
      crows: { speaker: 'narrator', text: '“Exactly,” says Rowan, and then, more slowly, looking at the untouched hind: “Except that it didn’t. Did it. It didn’t even eat.” They walk back towards the lodge, thinking.', next: null },
      owe: { speaker: 'narrator', text: 'Rowan opens their mouth, and shuts it again. “Nothing,” they say. “It owed it nothing. It was just there.” They walk back towards the lodge without another word.', next: null },
      plain: { speaker: 'narrator', text: 'The place on the Stag’s trail where the hind fell.', next: null },
    },
  },
  {
    id: 'dialogue:huntsman-featured-duskweaver', name: 'Featured: The Unwoven Hunt', scope: 'party',
    entries: [
      { when: stage('quest:huntsman-the-unwoven-hunt', 'back'), node: 'back' },
      { when: { all: [stage('quest:huntsman-the-unwoven-hunt', 'trails'), { not: { flag: 'huntsman.lune_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-duskweaver', text: 'The Spinner is unpicking the records of every Turning hunt, every procession through the Gloamwood, back to the founding. When they’re gone, nobody will know where the road ran. Except a hunter, maybe. Do you know the old trails?',
        choices: [
          { text: 'I know how trails go. Walk them with me and write.', to: null, quest: true, effects: [{ setFlag: 'huntsman.lune_asked', value: true }] },
          { text: 'A trail is never lost. It’s only waiting for feet.', to: null, quest: true, school: 'hunt', effects: [{ setFlag: 'huntsman.lune_asked', value: true }] },
        ],
      },
      back: {
        speaker: 'npc:bearer-duskweaver', text: 'Three pages. Three roads the Turning walked, written down where the Spinner can’t reach them. I read them back to myself every night. When we go to the Heart, I’ll have them in my coat, and you at my side.',
        effects: [{ setFlag: 'huntsman.lune_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-huntsman-unwoven-trail-1', name: 'Featured: the first old trail', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-unwoven-hunt', 'trails'), node: 't' }, { node: 'plain' }],
    nodes: {
      t: { speaker: 'narrator', text: 'Under the bracken the ground is worn into a long shallow dip, the way a road is worn by a thousand years of feet and hooves. You walk it and say where it bends. Lune Ashgrey writes: the Turning came in from the Gate Circle, here, by the white birches.', next: null },
      plain: { speaker: 'narrator', text: 'An old procession trail, worn into the forest floor.', next: null },
    },
  },
  {
    id: 'dialogue:obj-huntsman-unwoven-trail-2', name: 'Featured: the second old trail', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-unwoven-hunt', 'trails'), node: 't' }, { node: 'plain' }],
    nodes: {
      t: { speaker: 'narrator', text: 'A stream-crossing with flat stones set in it on purpose, too regular for nature. The procession waded here. You find the far bank by the crushed reed-roots of a thousand years ago. Lune writes it down, and underlines it twice.', next: null },
      plain: { speaker: 'narrator', text: 'Old stepping-stones across a Gloamwood stream.', next: null },
    },
  },
  {
    id: 'dialogue:obj-huntsman-unwoven-trail-3', name: 'Featured: the third old trail', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-unwoven-hunt', 'trails'), node: 't' }, { node: 'plain' }],
    nodes: {
      t: { speaker: 'narrator', text: 'The trail ends at the deep glade, at a single stone with the Hunt mark worn almost smooth. The Stag waited here for the crown, every Turning. Lune stops writing. “I knew that,” they say. “I didn’t know I knew it until you walked it.”', next: null },
      plain: { speaker: 'narrator', text: 'A worn stone with the Hunt mark, at the edge of the deep glade.', next: null },
    },
  },
  // ---------- class hooks on the Brindlecross fourteen
  {
    id: 'dialogue:hook-huntsman-maren', name: 'Hook: Maren and the Lodge hunter', scope: 'party',
    entries: [
      { when: { all: [{ flag: 'huntsman.charter', value: 'kept' }, { questCompleted: 'quest:cc-wolves' }, { not: { flag: 'huntsman.maren_honoured' } }] }, node: 'law' },
      { when: stage('quest:huntsman-hollis-lodge', 'lodge'), node: 'uncle' },
    ],
    nodes: {
      law: {
        speaker: 'npc:maren', text: 'Uncle Thaddeus says the Antlerford Lodge kept its charter. Wouldn’t sell the old law to the Barons, not even poor. (She looks at you differently.) My mother would have liked that.',
        choices: [{ text: 'Take only what the hunt gives.', to: null, trust: 1, effects: [{ setFlag: 'huntsman.maren_honoured', value: true }] }],
      },
      uncle: { speaker: 'npc:maren', text: 'Hollis Lodge? That’s my family. Uncle Thaddeus keeps it. East through the Gloamwood. Tell him I’m eating. I’m not, but tell him.', next: null },
    },
  },
  {
    id: 'dialogue:hook-huntsman-ysolde', name: 'Hook: Ysolde and the First Letter', scope: 'party',
    entries: [{ when: { all: [{ flag: 'huntsman.first_letter' }, { flag: 'story.act', op: '>=', value: 2 }, { not: { flag: 'huntsman.letter_given' } }] }, node: 'letter' }],
    nodes: {
      letter: {
        speaker: 'npc:ysolde', text: 'Is that a Lodge seal? From the Greywilds? Give it here. Gently. (She reads.) C. 1013. The first year. The herds left their roads the very first autumn, and someone was pulling the cairns. This goes in the chronicle. On the first page.',
        choices: [{ text: 'His name was Osric Fallow. Put that in too.', to: null, trust: 1, effects: [{ setFlag: 'huntsman.letter_given', value: true }] }],
      },
    },
  },
];

export default dialogues;
