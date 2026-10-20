/**
 * Hollow Crown, FALCONER: Hawkmoor people (general talk), the eight side quests, the mentor thread and the
 * bounties, plus the Act II class-thread, featured-bearer and hook scenes. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const offer = (q: Q, text: string, to: string, extra?: NarrativeCondition): DialogueChoice =>
  ({ text, to, quest: true, when: extra ? { all: [fresh(q), extra] } : fresh(q), effects: [{ startQuest: q }] });
const bye: DialogueChoice = { text: 'Farewell.', to: null, tag: 'leave' };
const WR = 'npc:old-wren' as const, TE = 'npc:hooded-man' as const;

const dialogues: DialogueDef[] = [
  // ---------- Wren (general + mentor thread)
  {
    id: 'dialogue:falconer-wren', name: 'Wren (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: WR, text: 'Sit down. You’re blocking my kestrel. What is it?',
        choices: [
          offer('quest:falconer-pibb-wont-come-down', 'Where’s Pibb?', 'pibb', { not: { flag: 'falconer.pibb_pet' } }),
          offer('quest:falconer-pibbs-eyes', 'What does Pibb see that we don’t?', 'eyes', { all: [{ trust: WR, value: 'friendly' }, { questCompleted: 'quest:falconer-the-falling-birds' }] }),
          offer('quest:falconer-the-first-hood', 'Did you ever hood Teodor’s birds?', 'hood', { all: [{ trust: WR, value: 'trusted' }, { questCompleted: 'quest:falconer-what-the-hood-holds' }] }),
          { text: 'Wren, how did you lose your eyes?', to: 'lost', when: { all: [{ trust: WR, value: 'trusted' }, { questCompleted: 'quest:falconer-the-first-hood' }] } },
          bye,
        ],
      },
      lost: { speaker: WR, text: 'The left one? A goshawk, when I was twelve. My own fault. I unhooded her too fast in a crowded yard, and she hadn’t seen any of it coming, and she was frightened. She wasn’t cruel. She was only looking.', next: 'right' },
      right: {
        speaker: WR, text: 'The right one just got old, the way things do. By the time it went, Pibb’s great-great-grandmother had already decided to sit on my shoulder. Kestrels are very decided birds.',
        choices: [
          { text: 'Do you miss seeing for yourself?', to: 'miss' },
          { text: 'Is that why you never hood a frightened bird?', to: 'why' },
        ],
      },
      miss: { speaker: WR, mood: 'happy', text: 'Through these? I saw sheep, and weather, and the Mews arguing. Through Pibb I see every mouse on the moor and the colour of the wind. I’d only like them back for a day, to see your face. That’s all.', next: 'start' },
      why: { speaker: WR, mood: 'sad', text: 'That’s exactly why. She paid for my lesson with her own fright, and I paid with an eye, and I thought it a fair price. I’ve spent fifty years making sure nobody else has to pay it.', next: 'start' },
      pibb: { speaker: WR, mood: 'angry', text: 'On the chapel roof, sulking, because I put up a new perch-ledge and he doesn’t like the wood. And while he’s up there I can’t see a thing. I walked into the water butt this morning. Get him down. Bribe him, flatter him, I don’t care.', next: null },
      eyes: { speaker: WR, text: 'Everything, my dear. And some things we haven’t got words for. Close your eyes here on the ledge and I’ll lend you his for a while. You’ll have a headache after. Worth it.', next: null },
      hood: { speaker: WR, mood: 'sad', text: 'Once. His very first bird, a little merlin, when he was eight and it was screaming and so was he. I put my first hood on it, the one I made as a girl. He never quite took it off again, inside. It’s still on a nail in the old mews. Fetch it for me.', next: null },
    },
  },
  {
    id: 'dialogue:falconer-wren-pibb-back', name: 'Side: Pibb comes down',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: WR, mood: 'happy', text: 'There you are, you vain little beast. (Pibb settles on her shoulder and looks away from her, pointedly.) I can see again. I can see you, and you’ve got moss on your knees. Thank you. Here, for your trouble.', next: null },
    },
  },
  {
    id: 'dialogue:falconer-wren-eyes', name: 'Mentor: Pibb’s Eyes', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: WR, text: 'Well? (She is grinning.) Your head’s splitting, isn’t it. Mine did too, the first time. What did you see?', next: 'colour' },
      colour: {
        speaker: WR, text: 'The black tears. You saw them as a colour, didn’t you, out over the moor. Hanging in the air in smudges. And Pibb flew round every one without thinking about it.',
        choices: [{ text: 'A hawk sees the tears and steers round them. A hooded bird can’t.', to: 'end', insight: 'hawks_see_tears', trust: 1 }],
      },
      end: { speaker: WR, text: 'There. Now you know the one thing I know that nobody else on these cliffs believes. A frightened bird is a bird that’s looking. Remember it, the next time someone offers you a hood.', next: null },
    },
  },
  {
    id: 'dialogue:obj-pibb-flight-1', name: 'Mentor: Pibb’s eyes, the first pass', scope: 'party',
    entries: [{ when: stage('quest:falconer-pibbs-eyes', 'fly'), node: 'fly' }, { node: 'plain' }],
    nodes: {
      fly: { speaker: 'narrator', text: 'You open your eyes and you are falling, and then you are not falling, you are flying, low and fast over the heather, and every mouse on the Hawkmoor is a small bright warm shape. It is the best thing that has ever happened to you.', next: null },
      plain: { speaker: 'narrator', text: 'Wren’s ledge, high over the moor.', next: null },
    },
  },
  {
    id: 'dialogue:obj-pibb-flight-2', name: 'Mentor: Pibb’s eyes, the second pass', scope: 'party',
    entries: [{ when: stage('quest:falconer-pibbs-eyes', 'fly'), node: 'fly' }, { node: 'plain' }],
    nodes: {
      fly: { speaker: 'narrator', text: 'Higher. Over the Windscour Plain the air is full of colours you have no names for, and in among them hang smudges of something like soot, here and there, like stains on a window. Pibb’s wings tilt, and you go round them without deciding to.', next: null },
      plain: { speaker: 'narrator', text: 'Wren’s ledge, high over the moor.', next: null },
    },
  },
  {
    id: 'dialogue:obj-pibb-flight-3', name: 'Mentor: Pibb’s eyes, the third pass', scope: 'party',
    entries: [{ when: stage('quest:falconer-pibbs-eyes', 'fly'), node: 'fly' }, { node: 'plain' }],
    nodes: {
      fly: { speaker: 'narrator', text: 'Over the Featherfall the soot-smudges are everywhere, thick as fog, and below them birds are falling: hooded birds, flying blind, straight through. Pibb turns for home. Then you are on the ledge with your own eyes and a headache like a hammer.', next: null },
      plain: { speaker: 'narrator', text: 'Wren’s ledge, high over the moor.', next: null },
    },
  },
  {
    id: 'dialogue:obj-wren-first-hood', name: 'Mentor: the first hood', scope: 'party',
    entries: [{ when: stage('quest:falconer-the-first-hood', 'hood'), node: 'hood' }, { node: 'nail' }],
    nodes: {
      hood: { speaker: 'narrator', text: 'In the old mews at the foot of the cliff, on a rusted nail by the door, hangs a hood no bigger than an egg, red leather gone brown, stitched by a girl who was still learning. The nail has worn a groove in the leather. Nobody has touched it in thirty years.', next: null },
      nail: { speaker: 'narrator', text: 'A rusted nail by the door of the old mews.', next: null },
    },
  },
  {
    id: 'dialogue:falconer-wren-hood', name: 'Mentor: burning the first hood', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: WR, mood: 'sad', text: '(She turns it over and over in her fingers, though she can hardly see it.) I was so proud of this. I made it for my first bird, and I put it on his first bird, and I told him it would make her brave. It didn’t make her brave. It made her quiet. I couldn’t tell the difference then.', next: 'burn' },
      burn: { speaker: WR, text: '(She drops it in the brazier. It curls up and burns very quickly, as if it had been waiting.) There. Thirty years. You’ve given me something I didn’t know I could put down, and I’m too old to say it properly. Thank you.', effects: [{ trust: WR, delta: 1 }], next: null },
    },
  },
  // ---------- Pibb
  {
    id: 'dialogue:falconer-pibb', name: 'Pibb',
    entries: [{ node: 'look' }],
    nodes: { look: { speaker: 'npc:pibb', text: '(Pibb looks at you with one eye, then the other, then turns his head almost all the way round to report to Wren.)', next: null } },
  },
  {
    id: 'dialogue:falconer-pibb-roof', name: 'Side: coaxing Pibb down', scope: 'party',
    entries: [{ when: { not: { flag: 'falconer.pibb_down' } }, node: 'roof' }, { node: 'down' }],
    nodes: {
      roof: {
        speaker: 'npc:pibb', text: '(Pibb is on the ridge of the chapel roof with his back to the world. When you call him he fluffs up to twice his size and does not turn round.)',
        choices: [
          { text: '(Hold up a strip of the good beef from Wren’s larder.)', to: 'beef', effects: [{ setFlag: 'falconer.pibb_down', value: 'beef' }] },
          { text: 'Pibb, the new perch is oak. Old oak. From the chapel beams. Your chapel.', to: 'oak', effects: [{ setFlag: 'falconer.pibb_down', value: 'oak' }] },
          { text: '(Turn your back on him and pretend to be very interested in a beetle.)', to: 'beetle', school: 'hunt', effects: [{ setFlag: 'falconer.pibb_down', value: 'beetle' }] },
        ],
      },
      beef: { speaker: 'npc:pibb', text: '(He considers the beef for a long and dignified time. Then he drops onto your glove, takes it, and stays there eating, as if he had meant to come down anyway.)', next: null },
      oak: { speaker: 'npc:pibb', text: '(One small head turns. A long, suspicious kek. Then he drops down onto your shoulder to go and inspect the perch himself, very slowly, so it is clear that this is his own idea.)', next: null },
      beetle: { speaker: 'npc:pibb', text: '(A short silence. A flutter. Pibb lands beside the beetle, looks at it, looks at you, and eats it. Then he climbs onto your sleeve as if nothing had happened.)', next: null },
      down: { speaker: 'npc:pibb', text: '(Pibb is on your shoulder, ready to be carried home in state.)', next: null },
    },
  },
  // ---------- Teodor, the Mews council, the Lodge envoy
  {
    id: 'dialogue:falconer-teodor', name: 'The Hooded Man (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: TE, text: 'Hello again. You’re still frightened. I can hear it in your boots.',
        choices: [
          { text: 'Where did you learn to hood like that?', to: 'learn' },
          { text: 'Does it ever come off?', to: 'off' },
          bye,
        ],
      },
      learn: { speaker: TE, text: 'From someone very wise who would never do it to me. So I learned the rest myself.', next: null },
      off: { speaker: TE, mood: 'sad', text: 'The hood? Oh, yes. Whenever you like. (He does not take his off.)', next: null },
    },
  },
  {
    id: 'dialogue:falconer-spurling', name: 'Mews-Mother Spurling (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:agatha-spurling', text: 'Order! Oh, it’s you. Sorry. Habit. The Mews has voted on everything for a thousand years, falconer, and never once agreed. Don’t let it put you off.', next: null } },
  },
  {
    id: 'dialogue:falconer-pickering', name: 'Hamo Pickering (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:hamo-pickering', text: '(He is holding onto a rock.) Hamo Pickering, of the Great Lodge. Master Bannock sends his regards, and a request for hawks. Mostly the request. Is it always this windy? Is it always this high?', next: null } },
  },
  // ---------- the Mews Cliffs: the Jess-Maker's Knots, the post-loft and bounties
  {
    id: 'dialogue:falconer-odile', name: 'Odile Thistlewood (the Jess-Maker’s Knots)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:odile-thistlewood', text: 'Every bird a different knot. Every knot a different bird. (She holds up her hands. They shake.) My hands have started forgetting. The knots haven’t, yet.',
        choices: [offer('quest:falconer-the-jess-makers-knots', 'Teach them to me.', 'teach'), bye],
      },
      teach: { speaker: 'npc:odile-thistlewood', mood: 'happy', text: 'Would you? Oh, would you. Three on the board. The falcon’s, the hawk’s, and the last one, which I’ll name when you’ve tied the other two. It’s the only one that matters.', next: null },
    },
  },
  {
    id: 'dialogue:obj-jess-knot-3', name: 'Side: the third knot', scope: 'party',
    entries: [{ when: stage('quest:falconer-the-jess-makers-knots', 'knots'), node: 'knot' }, { node: 'plain' }],
    nodes: {
      knot: { speaker: 'narrator', text: 'The third knot is the hardest. It holds fast under every tug you give it, however hard, until you pull it the one way a bird would pull if it truly meant to go. Then it opens all at once, like a hand.', next: null },
      plain: { speaker: 'narrator', text: 'Odile’s knot-board, with three practice jesses on it.', next: null },
    },
  },
  {
    id: 'dialogue:falconer-odile-knot', name: 'Side: the knot that lets go', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:odile-thistlewood', text: 'There. You’ve got it. That one’s the falconer’s knot. Holds a bird as long as it wants holding. Lets it go when it truly pulls. Most falconers never learn it. They don’t want to.',
        choices: [{ text: 'Does it work on anything but jesses?', to: 'more', trust: 1 }, { text: 'Thank you, Odile.', to: 'end' }],
      },
      more: { speaker: 'npc:odile-thistlewood', text: 'On anything that’s holding something it oughtn’t. Hoods, jesses, people. Especially people. Don’t believe me? Swithun’s post-hawks are sitting hooded in his loft. Tie it on one of them. Here, take a coil of my good cord.', next: null },
      end: { speaker: 'npc:odile-thistlewood', text: 'Take a coil of my good cord, and try the knot on one of Swithun’s hooded post-hawks before you believe it. My hands won’t need the cord much longer, and yours will.', next: null },
    },
  },
  {
    id: 'dialogue:falconer-swithun', name: 'Swithun Jessop (the Moorland Post, bounties)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:swithun-jessop', text: 'Post by hawk, bounties by hand. Mind the droppings.',
        choices: [
          offer('quest:falconer-the-moorland-post', 'Your post-hawks are all hooded.', 'post'),
          offer('quest:falconer-bounty-featherfall-cast', 'The Featherfall cast.', 'cast'),
          offer('quest:falconer-bounty-tick-hill', 'Tick Hill?', 'tick'),
          bye,
        ],
      },
      post: { speaker: 'npc:swithun-jessop', mood: 'sad', text: 'Every one. The gentleman did them last night, very kindly, and now they sit there and won’t fly. Three steadings waiting on letters. Would you fly the round? Your bird’s still got its eyes.', next: null },
      cast: { speaker: 'npc:swithun-jessop', text: 'Five hollowed Hunting Hawks, hunting as a cast, in the Featherfall. They took a goat yesterday. The goat’s owner has opinions. Bounty’s on the board.', next: null },
      tick: { speaker: 'npc:swithun-jessop', text: 'Two shepherds, separately, reported a new hill on the Windscour. Hills don’t turn up new. This one’s a Giant Tick. It’s grazing. I didn’t know they grazed.', next: null },
    },
  },
  {
    id: 'dialogue:obj-mews-dead-letter', name: 'Side: the oldest dead letter', scope: 'party',
    entries: [{ when: stage('quest:falconer-the-moorland-post', 'unsent'), node: 'letter' }, { node: 'plain' }],
    nodes: {
      letter: { speaker: 'narrator', text: 'At the very bottom of the dead-letter bag, a letter in a careful old hand, addressed only to “Teodor, wherever he is,” and dated C. 1030. Through the thin paper you can read one line: “You were never too frightened. You were only paying attention. Come home.”', next: null },
      plain: { speaker: 'narrator', text: 'The dead-letter bag, a little lighter.', next: null },
    },
  },
  {
    id: 'dialogue:falconer-swithun-letter', name: 'Side: Wren’s letter to Teodor', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:swithun-jessop', text: 'That one. My father kept it, and I kept it after him. Wren wrote it the week her last apprentice went off in the night. Teodor Tanager. Nice lad. Frightened of his own shadow. Nobody knew where to send it.',
        choices: [
          { text: 'I think I know where he is now.', to: 'know' },
          { text: 'Keep it a while longer.', to: 'keep', trust: 1 },
        ],
      },
      know: { speaker: 'npc:swithun-jessop', text: 'Do you? Then take it. A letter’s no good in a bag. Here, and here’s the post fee back for the round. You earned it.', next: null },
      keep: { speaker: 'npc:swithun-jessop', text: 'I will. Thirty years more if I have to. Here’s the post fee for the round. You earned it.', next: null },
    },
  },
  // ---------- the Hawkmoor: Shepherd Coyle's Dog
  {
    id: 'dialogue:falconer-coyle', name: 'Shepherd Coyle (Shepherd Coyle’s Dog)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:amos-coyle', text: 'Thirty sheep, one dog, nineteen hawks. That isn’t the right way round.',
        choices: [offer('quest:falconer-shepherd-coyles-dog', 'Why have you got nineteen hawks?', 'why'), bye],
      },
      why: { speaker: 'npc:amos-coyle', text: 'I haven’t. Wimble has. She’s gone off sheep. She brings in hawks now, off the moor, and pens them in my fold, and they let her. You’re a falconer. Look at them, and tell me I’m not going mad.', next: null },
    },
  },
  {
    id: 'dialogue:obj-coyle-fold', name: 'Side: the fold full of hawks', scope: 'party',
    entries: [{ when: stage('quest:falconer-shepherd-coyles-dog', 'fold'), node: 'fold' }, { node: 'plain' }],
    nodes: {
      fold: { speaker: 'narrator', text: 'Nineteen wild hawks standing in Coyle’s fold in a neat bunch, being herded in tidy circles by a small black-and-white sheepdog. Up on the hillside the sheep watch with interest. Out on the moor beyond the fold wall, black smudges drift in the air, and not one of them comes near the dog.', next: null },
      plain: { speaker: 'narrator', text: 'Coyle’s fold, with sheep in it, as is proper.', next: null },
    },
  },
  {
    id: 'dialogue:falconer-coyle-sort', name: 'Side: sorting out Wimble', scope: 'party',
    entries: [{ when: { not: { flag: 'falconer.coyle_sorted' } }, node: 'start' }, { node: 'after' }],
    nodes: {
      start: {
        speaker: 'npc:amos-coyle', text: 'Well? Am I mad?',
        choices: [
          { text: 'The hawks are hiding. Your dog keeps the tears off them, so they let her pen them. Let them go once the moor is clean.', to: 'safe', school: 'hunt', effects: [{ setFlag: 'falconer.coyle_sorted', value: 'safe' }] },
          { text: 'Swap them. Give the hawks to the Mews, and give Wimble her sheep back.', to: 'swap', effects: [{ setFlag: 'falconer.coyle_sorted', value: 'swap' }] },
          { text: 'You’ve got a hawk-dog, Master Coyle. There isn’t another one in the Greywilds. Keep her.', to: 'keep', trust: 1, effects: [{ setFlag: 'falconer.coyle_sorted', value: 'keep' }] },
        ],
      },
      safe: { speaker: 'npc:amos-coyle', text: 'Hiding. In my fold. Behind my dog. (He looks at Wimble with new respect.) Well, I never. Here, take some cheese. It’s good cheese. The sheep were on holiday, so they’ve been very relaxed.', next: 'gone' },
      swap: { speaker: 'npc:amos-coyle', text: 'Wimble won’t like it. Wimble doesn’t like anything. Still. Sheep are sheep. Take some cheese for your trouble.', next: 'gone' },
      keep: { speaker: 'npc:amos-coyle', mood: 'happy', text: 'A hawk-dog. (He tries the words out.) Coyle and his hawk-dog. That has a ring. Take some cheese. Take two.', next: 'gone' },
      gone: { speaker: 'npc:amos-coyle', text: '(Far up the tor behind the steading, a dog starts barking.) There she goes. Every evening, up the tor, barking at nothing for an hour. Would you go and see what nothing is? I’ve stopped liking the sound of it.', next: null },
      after: { speaker: 'npc:amos-coyle', text: 'Wimble says hello. Well, she doesn’t. She looks at you. That’s hello, for her.', next: null },
    },
  },
  // ---------- the Windscour Plain: Bones of the Herd, the Quiet Steading
  {
    id: 'dialogue:falconer-ketterick', name: 'Ma Ketterick (Bones of the Herd)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ma-ketterick', text: 'Bones don’t lie. They don’t say much either. These have been trying to tell me something for thirty years and my knees won’t carry me out to hear it.',
        choices: [offer('quest:falconer-bones-of-the-herd', 'I’ll go and listen for you.', 'go'), bye],
      },
      go: { speaker: 'npc:ma-ketterick', text: 'Three big drifts on the plain. Don’t count them. Tell me which way the skulls are facing. That’s the whole sentence, in bones.', next: null },
    },
  },
  {
    id: 'dialogue:obj-herd-bones-3', name: 'Side: the last drift of bones', scope: 'party',
    entries: [{ when: stage('quest:falconer-bones-of-the-herd', 'bones'), node: 'bones' }, { node: 'plain' }],
    nodes: {
      bones: { speaker: 'narrator', text: 'The third drift is the biggest: hundreds of elk, fallen in heaps where they ran, legs still stretched out in the gallop. Every skull points the same way, north and a little east, straight at the Antler Gate.', next: null },
      plain: { speaker: 'narrator', text: 'A drift of old herd bones, white as chalk.', next: null },
    },
  },
  {
    id: 'dialogue:falconer-ketterick-bones', name: 'Side: the bones speak', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ma-ketterick', text: 'All facing the gate? All of them? (She sits down slowly on her stool.) Then they died the same night, running the same way. And I know which night. The frost-cracks on the old ones are all from one winter.',
        choices: [{ text: 'Which night?', to: 'night' }],
      },
      night: { speaker: 'npc:ma-ketterick', mood: 'sad', text: 'The night the Turning should have come, in C. 1012. The herds ran to meet it, the way they always had. All the way to the gate. And there was nothing at the gate. They ran to a Turning that never came, and they kept running until they dropped.', next: 'one' },
      one: { speaker: 'npc:ma-ketterick', text: '(She squints out at the plain.) Except one. There’s a small set of bones at the far edge of the last drift that I could never get to, and from here it faces the wrong way. Home. Go and see who turned back, would you?', next: null },
    },
  },
  {
    id: 'dialogue:falconer-edwy', name: 'Edwy Pollard (the Quiet Steading)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:edwy-pollard', text: 'Mam’s asleep with her eyes open. That isn’t right, is it? Dad too. And Gran. I made the tea myself.',
        choices: [offer('quest:falconer-the-quiet-steading', 'Let me try and wake her.', 'try'), bye],
      },
      try: { speaker: 'npc:edwy-pollard', text: 'A man came with a bag of soft hats. I was out with the goats. When I got back they were all sitting like that and smiling. Please wake her up. She’s missed two days of shouting at me.', next: null },
    },
  },
  {
    id: 'dialogue:obj-pollard-doorstep', name: 'Side: Aldith Pollard on her doorstep', scope: 'party',
    entries: [{ when: stage('quest:falconer-the-quiet-steading', 'mother'), node: 'mother' }, { node: 'plain' }],
    nodes: {
      mother: { speaker: 'narrator', text: 'Aldith Pollard sits on her doorstep with her hands folded, a soft black hood over her eyes that glistens like wet slate. You try to lift it. It does not lift. It is not tied on. It is part of her, the way a shadow is. She smiles at nothing, very kindly.', next: null },
      plain: { speaker: 'narrator', text: 'The Pollards’ doorstep, and their tea, going cold.', next: null },
    },
  },
  {
    id: 'dialogue:falconer-edwy-promise', name: 'Side: a promise to Edwy', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:edwy-pollard', text: 'Is she awake? (He looks past you at her, and sees she isn’t.) Oh.',
        choices: [
          { text: 'Not yet. But I know who did it, and I promise I’ll make him take it off.', to: 'promise', trust: 1 },
          { text: 'I can’t, Edwy. Not yet. I’m sorry.', to: 'sorry' },
        ],
      },
      promise: { speaker: 'npc:edwy-pollard', text: 'Promise properly. Spit and everything. (You do.) All right. I’ll wait. I’m good at waiting. I’ll do the goats.', next: null },
      sorry: { speaker: 'npc:edwy-pollard', text: '“Not yet” isn’t “no”. Gran says that. Gran says a lot of things. Well, she did. I’ll wait, then. I’ll do the goats.', next: null },
    },
  },
  {
    id: 'dialogue:falconer-edwy-wake', name: 'Side: the steading wakes', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:edwy-pollard', mood: 'happy', text: '(He is standing at the top of the gate road with a goat on a string, as if he had been waiting there for days. He has.) She woke up! They all did! The hoods just fell off, all at once, like leaves. Mam shouted at me for an hour. It was brilliant.', next: 'end' },
      end: { speaker: 'npc:edwy-pollard', text: 'She said to say thank you, and that you’re to come for supper when you’re back, and you’re not to bring the hawk inside. I’ve kept the goat for you. You don’t have to take the goat. Mam says don’t take the goat.', next: null },
    },
  },
  // ---------- the Featherfall: the Feather-Counter, Fledglings
  {
    id: 'dialogue:falconer-elias', name: 'Elias Downe (the Feather-Counter, Fledglings)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:elias-downe', text: 'Eleven thousand, four hundred and six. Seven. Oh. Seven. (A feather drifts down past him.) Every one gets a name. It’s the least anyone can do.',
        choices: [
          offer('quest:falconer-the-feather-counter', 'Can I help you count?', 'count'),
          offer('quest:falconer-fledglings', 'Whose nest is that in the thorn tree?', 'nest'),
          bye,
        ],
      },
      count: { speaker: 'npc:elias-downe', text: 'Bless you. Three fell this morning and my knees fell with them. Find them and look at them properly, and bring me their names. You’ll know their names when you see them. Everybody does, if they look.', next: null },
      nest: { speaker: 'npc:elias-downe', mood: 'sad', text: 'Four fledglings, and not a tear on them. Their mother fell last week. I named her Margery. I’ve been feeding them on worms and good intentions, but they need raising by somebody who can fly. Don’t hood them. Whatever you do.', next: null },
    },
  },
  {
    id: 'dialogue:obj-featherfall-bird-3', name: 'Side: the bird with the ring', scope: 'party',
    entries: [{ when: stage('quest:falconer-the-feather-counter', 'count'), node: 'bird' }, { node: 'plain' }],
    nodes: {
      bird: { speaker: 'narrator', text: 'A grey old falcon, lying in the heather as if asleep. Unlike the others it has no black on it at all. It simply died of age. On its leg is a brass ring, worn thin, stamped CLIFFSTAIR, and a Concordia date thirty years old. It flew here across the closed gate somehow, or before it closed, and waited.', next: null },
      plain: { speaker: 'narrator', text: 'A flattened place in the heather, with a stone on it.', next: null },
    },
  },
  {
    id: 'dialogue:falconer-elias-ring', name: 'Side: the names, and the ring', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:elias-downe', text: 'A Cliffstair ring. From Concordia. (He holds it up to the light.) Fancy that. Came all that way to fall here. I’ll name her Wanderer. Did you see the others? Were they hooded, or caged, before?',
        choices: [
          { text: 'Every one I found was hooded or jessed.', to: 'hooded' },
          { text: 'You know something about the fallen, don’t you?', to: 'know' },
        ],
      },
      hooded: { speaker: 'npc:elias-downe', text: 'Every one. Thirty years, eleven thousand birds, and every one that fell had a hood on, or a jess, or a cage. Not one free bird. Not one.', next: 'insight' },
      know: { speaker: 'npc:elias-downe', text: 'Only what I’ve counted. Eleven thousand birds, thirty years. And every one that fell had a hood on, or a jess, or a cage. Not one free bird. Not one.', next: 'insight' },
      insight: {
        speaker: 'npc:elias-downe', text: 'The free ones fly round something. I watch them do it. They swerve, out there, at nothing. I’ve never known what at.',
        choices: [{ text: 'They can see the tears, and steer round them. The hooded ones can’t.', to: 'end', insight: 'hawks_see_tears', trust: 1 }, { text: 'Keep counting, Elias.', to: 'end' }],
      },
      end: { speaker: 'npc:elias-downe', text: 'Take a feather. Margery’s. She’d have wanted somebody to have one. And take that ring up to Swithun at the post-loft. The Mews keeps a ring-book. I should like to know who she was before she was Wanderer.', next: null },
    },
  },
  {
    id: 'dialogue:obj-falconer-fledgling-nest', name: 'Side: the fledglings’ nest', scope: 'party',
    entries: [{ when: stage('quest:falconer-fledglings', 'nest'), node: 'nest' }, { node: 'plain' }],
    nodes: {
      nest: { speaker: 'narrator', text: 'Four fledgling hawks in a nest of thorn twigs, all beak and fury, without a speck of black on any of them. The biggest one bites your glove. The smallest one bites the biggest one.', next: null },
      plain: { speaker: 'narrator', text: 'An empty nest in a thorn tree. They have flown.', next: null },
    },
  },
  {
    id: 'dialogue:obj-fledgling-perch-3', name: 'Side: the fledglings fly', scope: 'party',
    entries: [{ when: stage('quest:falconer-fledglings', 'raise'), node: 'go' }, { node: 'plain' }],
    nodes: {
      go: { speaker: 'narrator', text: 'The third lesson is the hard one: to go. You lift your fist and the four of them go up together, untidy, shrieking, unhooded, into the Featherfall’s grey air, and every one of them swerves round the black places as if it had always known how.', next: null },
      plain: { speaker: 'narrator', text: 'A training perch in the Featherfall, scratched with small talons.', next: null },
    },
  },

  // ======================= ACT II
  {
    id: 'dialogue:falconer-prudence', name: 'C-1 the cormorant boats', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:prudence-gannet', text: '(A broad old woman in oilskins is sitting in a flat boat under the ferry, with a row of cormorants along the gunwale.) A hawk on a fist, out of the Hawkmoor? Get in. Mind the birds. They bite, and they’re right to.',
        choices: [
          { text: 'You’re from the Mews?', to: 'mews' },
          { text: 'I need to find the Hunt’s Sentinel.', to: 'stag', quest: true },
        ],
      },
      mews: { speaker: 'npc:prudence-gannet', text: 'Was. Came down for the Turning fair in C. 1011 and never got back up. Fished with birds instead. Never hooded one in my life. A hooded cormorant can’t see the fish, and neither can a hooded anything else.', next: 'stag' },
      stag: {
        speaker: 'npc:prudence-gannet', mood: 'sad', text: 'The White Stag. It weeps in the Gloamwood, and no bird will fly over the place where it stands. My cormorants won’t fish the Wend where it runs out of the wood. Where nothing sings, the Stag has wept. Follow the silence.',
        choices: [
          { text: 'I voted to hood the Mews.', to: 'hooded', when: { flag: 'falconer.hooding', value: 'hooded' } },
          { text: 'I’ll follow it.', to: null },
        ],
      },
      hooded: { speaker: 'npc:prudence-gannet', text: '(She looks at you for a long time.) Then you know what silence sounds like. That’s some use, at least. Follow it.', next: null },
    },
  },
  {
    id: 'dialogue:obj-falconer-silent-canopy-1', name: 'C-2 the first silence', scope: 'party',
    entries: [{ when: stage('quest:falconer-the-silent-canopy', 'fly'), node: 'fly' }, { node: 'plain' }],
    nodes: {
      fly: { speaker: 'narrator', text: 'Your hawk goes up over the Gloamwood edge and the woods below sing: thrush, wren, a jay complaining. Then, ahead, a patch of canopy where nothing sings at all. Your hawk will not fly over it. It circles the edge and comes back.', next: null },
      plain: { speaker: 'narrator', text: 'The edge of the Gloamwood, singing.', next: null },
    },
  },
  {
    id: 'dialogue:obj-falconer-silent-canopy-2', name: 'C-2 the second silence', scope: 'party',
    entries: [{ when: stage('quest:falconer-the-silent-canopy', 'fly'), node: 'fly' }, { node: 'plain' }],
    nodes: {
      fly: { speaker: 'narrator', text: 'From the second place, the silence is bigger, and you can see its shape from the sky: a long grey stain through the trees, the shape of a road, as if something walked through the wood weeping and the birds have kept away from its path ever since.', next: null },
      plain: { speaker: 'narrator', text: 'A gap in the Gloamwood canopy.', next: null },
    },
  },
  {
    id: 'dialogue:obj-falconer-silent-canopy-3', name: 'C-2 the third silence', scope: 'party',
    entries: [{ when: stage('quest:falconer-the-silent-canopy', 'fly'), node: 'fly' }, { node: 'plain' }],
    nodes: {
      fly: { speaker: 'narrator', text: 'The third flight. The silent road through the trees ends in a hollow past the Stag’s glade, where the canopy closes over like a lid. Your hawk comes down onto your fist and presses itself against your arm, and is quiet.', next: null },
      plain: { speaker: 'narrator', text: 'A hollow in the Gloamwood where no bird sings.', next: null },
    },
  },
  {
    id: 'dialogue:falconer-bartle', name: 'C-4 Bartle Crisp on the quiet', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:bartle-crisp', text: 'Thirty years that crow’s screamed over my roof. Thirty years. My customers drink to it. Then three nights ago, stopped. Like someone put a sack over it.',
        choices: [
          { text: 'Someone did. A man in a hood.', to: 'man', quest: true },
          { text: 'Did a stranger come through?', to: 'man', quest: true },
        ],
      },
      man: { speaker: 'npc:bartle-crisp', text: 'Soft-spoken. Hood over his eyes. Bought a bowl of soup and a lot of rope and asked the way up the cliff. Lovely manners. Two strangers with him in grey, who measured him while he ate, like tailors. He let them. Up the cliff path, the lot of them.', next: 'hooded' },
      hooded: {
        speaker: 'npc:bartle-crisp', text: 'And every bird on the cliff path’s been sitting very still since. You’ll see.',
        choices: [
          { text: 'The Mews birds I brought won’t fly for me here.', to: 'mews', when: { flag: 'falconer.hooding', value: 'hooded' } },
          { text: 'Thank you, Master Crisp.', to: null },
        ],
      },
      mews: { speaker: 'npc:bartle-crisp', text: 'Hooded ones? No. Nor would I, if I couldn’t see. You’ll have to climb it yourself, with your own bird. Mind the third ledge, it’s loose.', next: null },
    },
  },
  {
    id: 'dialogue:falconer-bartle-general', name: 'Bartle Crisp (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:bartle-crisp', text: 'The Lightning Jar. Best ale on the Stormcliffs, and the only ale. Mind your head on the beam, it’s been struck twice.', next: null } },
  },
  {
    id: 'dialogue:obj-falconer-hooded-ledge', name: 'C-4 the hooded ledges', scope: 'party',
    entries: [
      { when: { all: [stage('quest:falconer-the-hooded-crow', 'hoods'), { flag: 'falconer.hooding', value: 'lent' }] }, node: 'lent' },
      { when: stage('quest:falconer-the-hooded-crow', 'hoods'), node: 'ledge' },
      { node: 'plain' },
    ],
    nodes: {
      lent: { speaker: 'narrator', text: 'Hooded gulls and choughs in silent rows on every ledge of the cliff path. Halfway up, a flight of hawks comes in off the sea, Lodge-flown, Mews-bred, with Antlerford jesses, and settles on the rocks around you. A Lodge runner panting up behind says Master Bannock sent them after you, with his regards.', next: 'top' },
      ledge: { speaker: 'narrator', text: 'Hooded gulls and choughs in silent rows on every ledge of the cliff path, quite still in the wind, like a congregation waiting for a sermon.', next: 'top' },
      top: { speaker: 'narrator', text: 'At the top, under a sky going purple with storm, something enormous is screaming through a hood, and the hood is not quite big enough. Below it, on a rope, a small figure is pulling it tighter.', next: null },
      plain: { speaker: 'narrator', text: 'The Stormcliff path, and birds on every ledge.', next: null },
    },
  },
  {
    id: 'dialogue:falconer-pibb-letter', name: 'C-6 Wren’s letter, by Pibb', scope: 'party',
    entries: [{ node: 'pibb' }],
    nodes: {
      pibb: { speaker: 'npc:pibb-courier', text: '(Pibb is sitting on the Hunt arch, holding out one foot with a letter tied to it, very grandly. When you take it he looks at you hard, for a long moment. Wren is looking too.)', next: 'letter' },
      letter: {
        speaker: WR, text: '“Pibb found you. I knew he would. The Mews is quieter than I like. Edwy Pollard brings me eggs. Odile has started teaching the knot to the children. I can see you now, through him: you look tired, and your boots want mending. Fly well. Cut jesses. W.”',
        choices: [{ text: '(Wave to Wren, through Pibb.)', to: 'court', quest: true, effects: [{ setFlag: 'falconer.wren_letter', value: true }] }],
      },
      court: { speaker: 'narrator', text: 'At the Stone Court that evening the Huntsman bearer sits down across from you, and the Moor half and the Lodge half hum together under the table. The bearer’s deerhound sniffs at your hawk. Your hawk tells it, at length, what it thinks of deerhounds.', next: null },
    },
  },
  {
    id: 'dialogue:falconer-plumley-letter', name: 'C-6 Wren’s letter, by pigeon', scope: 'party',
    entries: [{ node: 'pigeon' }],
    nodes: {
      pigeon: { speaker: 'npc:moor-pigeon', text: '(A plump moor pigeon is standing on the Hunt arch with his chest puffed out and a letter on his leg, extremely pleased with himself. Pibb, on your shoulder, regards him with contempt.)', next: 'letter' },
      letter: {
        speaker: WR, text: '“Sending this by Captain Plumley, since my eyes are with you. Mind him, he thinks he’s a hawk. The Mews is quieter than I like. Edwy Pollard brings me eggs, and reads me the sky. Tell Pibb he’s a good boy, and don’t let him hear you. Fly well. Cut jesses. W.”',
        choices: [{ text: '(Tell Pibb he’s a good boy, quietly.)', to: 'court', quest: true, effects: [{ setFlag: 'falconer.wren_letter', value: true }] }],
      },
      court: { speaker: 'narrator', text: 'At the Stone Court that evening the Huntsman bearer sits down across from you, and the Moor half and the Lodge half hum together under the table. The bearer’s deerhound sniffs at your hawk. Your hawk tells it, at length, what it thinks of deerhounds.', next: null },
    },
  },
  // ---------- featured bearers (hooks on the bearer NPCs)
  {
    id: 'dialogue:falconer-featured-skald', name: 'Featured: The Stag’s Saga', scope: 'party',
    entries: [
      { when: stage('quest:falconer-the-stags-saga', 'back'), node: 'back' },
      { when: { all: [stage('quest:falconer-the-stags-saga', 'verses'), { not: { flag: 'falconer.sigrid_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-skald', text: 'A falconer! Good. The White Stag’s saga is carved in the Gloamwood, on the highest branches, where the old Hunt carvers could only reach by climbing. Three verses up there I can’t read from the ground. Your bird can. Will it?',
        choices: [{ text: 'It will. Drum me the first verse while I look.', to: null, quest: true, effects: [{ setFlag: 'falconer.sigrid_asked', value: true }] }],
      },
      back: {
        speaker: 'npc:bearer-skald', text: '(She drums it through for you, the whole saga, three verses longer than it was this morning.) There. Now it can’t be lost. When we go to the Heart I’ll drum us in, and your bird can fly ahead of the drum.',
        effects: [{ setFlag: 'falconer.sigrid_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-saga-verse-1', name: 'Featured: the first high verse', scope: 'party',
    entries: [{ when: stage('quest:falconer-the-stags-saga', 'verses'), node: 'v' }, { node: 'plain' }],
    nodes: {
      v: { speaker: 'narrator', text: 'Your hawk lands high in an old oak, and through its eyes for a moment you see the carving in the bark: a stag, and a crown carried behind it, and the words “It went first, so they would not be lost.” You call it down to the drum.', next: null },
      plain: { speaker: 'narrator', text: 'An old oak, carved very high up.', next: null },
    },
  },
  {
    id: 'dialogue:obj-saga-verse-2', name: 'Featured: the second high verse', scope: 'party',
    entries: [{ when: stage('quest:falconer-the-stags-saga', 'verses'), node: 'v' }, { node: 'plain' }],
    nodes: {
      v: { speaker: 'narrator', text: 'The second verse is in a beech, half grown over: “Every twelve years it waited at the stone. Every twelve years they came.” Below, Sigrid Drumhallow drums it into the ground, slow, like footsteps.', next: null },
      plain: { speaker: 'narrator', text: 'A beech with old carving in its upper branches.', next: null },
    },
  },
  {
    id: 'dialogue:obj-saga-verse-3', name: 'Featured: the third high verse', scope: 'party',
    entries: [{ when: stage('quest:falconer-the-stags-saga', 'verses'), node: 'v' }, { node: 'plain' }],
    nodes: {
      v: { speaker: 'narrator', text: 'The last verse is newer than the others, cut by a shakier hand: “Then they did not come. It waited anyway. It is waiting still.” Your hawk sits by the words a long time before it comes down.', next: null },
      plain: { speaker: 'narrator', text: 'A high carving in a Gloamwood ash.', next: null },
    },
  },
  {
    id: 'dialogue:falconer-featured-sparkwright', name: 'Featured: Spark and Feather', scope: 'party',
    entries: [
      { when: stage('quest:falconer-spark-and-feather', 'back'), node: 'back' },
      { when: { all: [stage('quest:falconer-spark-and-feather', 'cage'), { not: { flag: 'falconer.fizz_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-sparkwright', text: 'You’re the bird person! Brilliant. I’ve built a cage. For the Stormcrow. It’s got copper bars and a lightning trap and a door that shuts on its own. Come and tell me it’ll hold. Please say it’ll hold.',
        choices: [{ text: 'Show me.', to: null, quest: true, effects: [{ setFlag: 'falconer.fizz_asked', value: true }] }],
      },
      back: {
        speaker: 'npc:bearer-sparkwright', text: 'I’ve been thinking about cages. About how they’re just hoods with more corners. I’ve taken the door off. It’s a perch now. A really, really good perch. When we go to the Heart, I’m bringing it, in case anything needs somewhere to sit.',
        effects: [{ setFlag: 'falconer.fizz_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-falconer-cage-machine', name: 'Featured: the cage-machine', scope: 'party',
    entries: [{ when: stage('quest:falconer-spark-and-feather', 'cage'), node: 'cage' }, { node: 'plain' }],
    nodes: {
      cage: {
        speaker: 'narrator', text: 'A cage the size of a barn, copper-barred, humming with trapped lightning, with a door rigged to slam on a spring. Fizz Copperpot is polishing a bar with their sleeve. “Well? Will it hold the Stormcrow?”',
        choices: [
          { text: 'It will hold it. And it will scream in there until it dies. You can’t keep a thing that carries news in a box.', to: 'hunt', school: 'hunt' },
          { text: 'Can you hold something without a cage?', to: 'hold' },
          { text: 'It’ll hold. Then what?', to: 'then' },
        ],
      },
      hunt: { speaker: 'narrator', text: 'Fizz stops polishing. They look at the cage for a long time, and then at your hawk, sitting loose on your glove with nothing holding it there at all. “Oh,” they say. “Oh. That’s annoying. Give me an hour.”', next: null },
      hold: { speaker: 'narrator', text: '“I don’t know,” says Fizz. “Can you?” You lift your fist and your hawk goes up, and circles, and comes back to you because it wants to. Fizz watches it all the way. “Give me an hour,” they say.', next: null },
      then: { speaker: 'narrator', text: '“Then it’s caught!” says Fizz, and then, slower: “And then it sits in a box. For ever. And never carries anything again.” They put the rag down. “Give me an hour.”', next: null },
      plain: { speaker: 'narrator', text: 'Fizz Copperpot’s perch-machine. The door has been taken off.', next: null },
    },
  },
  // ---------- class hooks on the Brindlecross fourteen
  {
    id: 'dialogue:hook-falconer-tamsin', name: 'Hook: Tamsin and the cormorant boats',
    entries: [{ when: stage('quest:falconer-the-cormorant-boats', 'boats'), node: 'boats' }],
    nodes: {
      boats: { speaker: 'npc:tamsin', text: 'A hawk! You’ll want Prudence and her lot, then. Under the ferry, in the flat boats, with the black birds. Don’t mind the smell. Don’t mind Prudence, either. That’s a copper, and a story about the hawk, later.', next: null },
    },
  },
  {
    id: 'dialogue:hook-falconer-maren', name: 'Hook: Maren and the Lodge hawks', scope: 'party',
    entries: [{ when: { all: [{ flag: 'falconer.hooding', value: 'lent' }, { questCompleted: 'quest:cc-wolves' }, { not: { flag: 'falconer.maren_hawks' } }] }, node: 'lent' }],
    nodes: {
      lent: {
        speaker: 'npc:maren', text: 'Word came through the arch with a Lodge runner: the Mews lent its hawks to Antlerford, to hunt beside the Huntsmen. Hawk and hound on the same hunt. My mother always said it could be done. Nobody believed her.',
        choices: [{ text: 'It took a Turning that never came to make us try.', to: null, trust: 1, effects: [{ setFlag: 'falconer.maren_hawks', value: true }] }],
      },
    },
  },
];

export default dialogues;
