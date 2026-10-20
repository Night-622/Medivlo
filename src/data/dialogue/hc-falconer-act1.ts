/** Hollow Crown, FALCONER Act I main dialogues (the Hawkmoor). Owner: Claude 4. */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const WR = 'npc:old-wren' as const, TE = 'npc:hooded-man' as const;

const dialogues: DialogueDef[] = [
  // ---------- I-1 The Bell over the Moor
  {
    id: 'dialogue:falconer-bell-night', name: 'I-1 the Bell rings over the Hawkmoor', scope: 'party',
    entries: [{ node: 'cliffs' }],
    nodes: {
      cliffs: { speaker: 'narrator', text: 'Midnight on the Mews Cliffs. The perches are full and quiet, every bird asleep on one leg, hooded or not. Your own hawk is a warm weight on the perch beside your bunk.', next: 'bell' },
      bell: { speaker: 'narrator', text: 'Somewhere very far away a bell rings once. Every bird on the cliffs wakes at the same moment and goes up, all at once, ten thousand wings in the dark, so loud you feel it in your teeth. Your hawk goes with them.', next: 'grab' },
      grab: {
        speaker: 'narrator', text: 'You grab for its jesses and catch nothing. Down the cliff, bunk doors bang open; somebody’s hood comes off in the wind and tumbles past you, end over end, into the dark.',
        choices: [
          { text: '(Run for the perches.)', to: 'run' },
          { text: '(Shout its name into the dark.)', to: 'shout' },
          { text: '(Stand still and listen for which way the wings go.)', to: 'listen', school: 'hunt' },
        ],
      },
      run: { speaker: 'narrator', text: 'You take the cliff stair three steps at a time in your nightshirt. Falconers are tumbling out of every door, some with lanterns, some with boots, nobody with both.', next: 'song' },
      shout: { speaker: 'narrator', text: 'Your voice goes nowhere in that noise. Then, for one moment, a single bird answers, far off and high: yours. It is not coming back yet. It is going somewhere, and it wants you to know.', next: 'song' },
      listen: { speaker: 'narrator', text: 'Under the roar there is a direction, the way there is a direction in a river. All of them are going north and east, up off the cliffs and out over the moor, towards the highest hill.', next: 'song' },
      song: { speaker: 'narrator', text: 'They fly the same way, every one of them, towards the high hill the Mews calls the Moor’s Crown. And something under your ribs, which has never made a sound before, starts to sing after them.', next: 'up' },
      up: { speaker: 'narrator', text: 'High above you, on the topmost ledge of the cliffs, somebody is laughing.', next: null },
    },
  },
  {
    id: 'dialogue:obj-mews-lure-post', name: 'I-1 calling the hawk home', scope: 'party',
    entries: [{ when: stage('quest:falconer-the-bell-over-the-moor', 'lure'), node: 'call' }, { node: 'post' }],
    nodes: {
      call: {
        speaker: 'narrator', text: 'You swing the lure in a long circle over your head, the way Wren taught you when you were small enough to need two hands for it. Nothing. Then, out of the dark over the moor, one shape turns and comes back.',
        choices: [
          { text: '(Hold out your fist.)', to: 'fist' },
          { text: '(Whistle the call you gave it as a fledgling.)', to: 'whistle' },
        ],
      },
      fist: { speaker: 'narrator', text: 'It lands hard and grips harder. Its feathers are cold from the high air, and caught in them, impossibly, is a sound: one clear note, ringing faintly, like a glass someone has just put down.', next: null },
      whistle: { speaker: 'narrator', text: 'It comes in low and fast and lands on your fist as if it had never left. Caught in its feathers, impossibly, is a sound: one clear note, ringing faintly, like a glass someone has just put down.', next: null },
      post: { speaker: 'narrator', text: 'The lure post on the cliff perches, worn smooth by a thousand years of falconers.', next: null },
    },
  },
  {
    id: 'dialogue:falconer-wren-bell', name: 'I-1 Wren on her ledge', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: WR, mood: 'happy', text: '(Old Wren is sitting on her ledge in her nightgown with Pibb on her shoulder, laughing so hard she has to hold on.) Ten thousand birds! All at once! Did you see it? I saw it. Pibb saw it, so I saw it.',
        choices: [
          { text: 'My hawk came back with a song in its feathers.', to: 'song' },
          { text: 'Wren, something is singing in my chest.', to: 'chest' },
        ],
      },
      song: { speaker: WR, text: 'I know. Pibb heard it. He’s sulking, because it wasn’t for him. Come here. Let me hear it from you.', next: 'chest' },
      chest: {
        speaker: WR, text: '(She leans close, and goes quiet, and stops laughing.) Oh. Oh, my dear. That’s half a stone. The Hunt stone, or half of it. It fell on the Moor’s Crown when the crown broke, and it’s been waiting up there thirty years for somebody, and it’s you.',
        choices: [
          { text: 'What do I do?', to: 'do', trust: 1 },
          { text: 'Why me?', to: 'why' },
        ],
      },
      why: { speaker: WR, text: 'Why not you? You’re the only falconer I ever taught who held a bird like it was holding them back. Stones notice that sort of thing, I expect.', next: 'do' },
      do: { speaker: WR, text: 'Tonight? Go up the cliff stair to the very top, and watch where they went, so you know what you’re asking me about. Then sleep. In the morning, count the wild hawks for me from the tors. I want to know how many come down.', next: null },
    },
  },
  // ---------- I-2 The Falling Birds
  {
    id: 'dialogue:falconer-wren-count', name: 'I-2 the count', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: WR, mood: 'sad', text: 'Half. Half the wild hawks gone, and the rest falling. Pibb won’t fly over the Featherfall. He says it smells wrong. Pibb has never said anything smelled wrong in his life, and he eats mice.',
        choices: [
          { text: 'The ones that fell got up again. With black tears on their wings.', to: 'tears' },
          { text: 'Where are they falling to?', to: 'where' },
          { text: 'One that fell was wearing a hood. A soft one. Not a Mews hood.', to: 'softhood', when: { flag: 'falconer.fall_hood' } },
        ],
      },
      softhood: { speaker: WR, mood: 'afraid', text: '(She goes very still. Pibb stops preening.) A soft hood. On a wild bird. (A long pause.) No. It can’t be. Never mind. Tell me where the rest fell.', next: 'where' },
      tears: { speaker: WR, text: 'Black tears. On the moor. Thirty years they’ve been at the edges, and now they’re here, falling out of the sky. Well. Everything comes home in the end.', next: 'where' },
      where: { speaker: WR, text: 'The Featherfall. They always fall there, sick birds, old birds. But not this many. And there’s a worse thing first: the Alpha Bear’s come off the moor. It tore open our hen-run last night. Go and look, and mind your eyes.', next: null },
    },
  },
  {
    id: 'dialogue:obj-mews-hen-run', name: 'I-3 the raided hen-run', scope: 'party',
    entries: [{ when: stage('quest:falconer-the-bear-cave', 'run'), node: 'run' }, { node: 'plain' }],
    nodes: {
      run: { speaker: 'narrator', text: 'The Mews hen-run, torn open like a letter. Feathers everywhere, and tracks the size of dinner plates leading out onto the moor. There are black drips in the tracks, and the bear did not stop to eat any of the hens. It ate the fence.', next: null },
      plain: { speaker: 'narrator', text: 'The Mews hen-run, newly mended.', next: null },
    },
  },
  {
    id: 'dialogue:falconer-wren-bear', name: 'I-3 the bear is down', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: WR, text: 'Down? Good. It was a fine old bear, before. It used to sit on the tor in summer and let the young hawks mob it for practice. Didn’t mind at all.',
        choices: [{ text: 'It couldn’t stop eating. Even when it was full.', to: 'full' }, { text: 'Your hen-run is safe.', to: 'stranger' }],
      },
      full: { speaker: WR, mood: 'sad', text: 'That’s the tears. They don’t take things away. They take away the knowing when to stop.', next: 'stranger' },
      stranger: { speaker: WR, text: 'And now there’s a stranger on the perches. Came up the cliff path an hour ago with a falcon screaming on his fist, and hooded it, and it went quiet as a stone. The whole Mews is giving him supper. Go and see. I’ll watch.', next: null },
    },
  },
  // ---------- I-4 The Gentle Stranger
  {
    id: 'dialogue:falconer-teodor-stranger', name: 'I-4 the gentle stranger', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: TE, text: '(A man in a soft leather hood that covers his eyes is sitting on the perches with a bowl of the Mews’ soup and a quiet falcon on his fist.) Hello. Sit, if you like. They’ve given me far too much soup. Your hawk is frightened.',
        choices: [
          { text: 'How can you tell, with that hood on?', to: 'hood' },
          { text: 'Everyone’s frightened. Birds are falling out of the sky.', to: 'falling' },
        ],
      },
      hood: { speaker: TE, text: 'You can hear it. The way its feet grip. (He smiles.) I’ve worn a hood a long time. You stop needing your eyes for the important things.', next: 'falling' },
      falling: {
        speaker: TE, text: 'I know. I’ve been walking the moor for weeks, and everywhere I go things are terrified. So I hood them. Just until it passes. A hooded bird can’t see what frightens it. It sits, and it’s calm, and it’s safe.',
        choices: [
          { text: 'And when you take the hood off?', to: 'off' },
          { text: 'A hooded bird can’t see what’s coming either.', to: 'coming', school: 'hunt' },
        ],
      },
      off: { speaker: TE, text: 'Then it’s passed, and it’s fine. That’s the idea. (He doesn’t say whether it has ever happened.)', next: 'offer' },
      coming: { speaker: TE, text: 'No. That’s rather the point. (He says it very kindly.)', next: 'offer' },
      offer: {
        speaker: TE, text: '(Your hawk shifts on your fist, rousing at a gull overhead.) Would you like me to hood yours? It would only take a moment. I have a spare. I always have a spare.',
        choices: [
          { text: 'No. Thank you.', to: 'no' },
          { text: '(Put your hand over your hawk’s eyes yourself.)', to: 'hand' },
        ],
      },
      no: { speaker: TE, text: 'Of course. Of course. Another time. (He goes back to his soup. Up on her ledge, very far away, Wren has gone quite still.)', next: null },
      hand: { speaker: TE, text: '(He tilts his head, as if he can see what you did.) That works too. For a moment. Another time, perhaps. (Up on her ledge, very far away, Wren has gone quite still.)', next: null },
    },
  },
  {
    id: 'dialogue:falconer-wren-stranger', name: 'I-4 Wren on the stranger', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: WR, text: 'I watched. Pibb sat on the chapel bell and watched the whole time. (She is not laughing.) He holds a bird the way you hold a cup you’re afraid of dropping. I knew someone who held them like that.',
        choices: [
          { text: 'Who?', to: 'who' },
          { text: 'He offered to hood my hawk.', to: 'offer' },
          { text: 'The birds he hooded are weeping under the hoods.', to: 'weep', when: { flag: 'falconer.hood_tear' } },
        ],
      },
      weep: { speaker: WR, mood: 'angry', text: '(Pibb fluffs up to twice his size.) Then he isn’t taking the fear away. He’s only taking away the seeing of it. I knew someone once who thought that was the same thing.', next: 'vote' },
      who: { speaker: WR, text: 'Long ago. Doesn’t matter. (It plainly matters.) The Mews wants to vote on him tomorrow night. He’s offered to hood every bird on the cliffs until the tears pass.', next: 'vote' },
      offer: { speaker: WR, mood: 'angry', text: 'Did he. Did he indeed. (Pibb fluffs up to twice his size.) Well, he’s made the same offer to the whole Mews. They vote on it tomorrow night.', next: 'vote' },
      vote: { speaker: WR, text: 'And there’s a lad up from Antlerford, from the Lodge, wanting our hawks to hunt the hollow herd. So it’s hood them, or lend them, or something else. You’ll have a voice. Before you use it, ask the lad, and ask Swithun, whose post-hawks are already hooded.', next: null },
    },
  },
  // ---------- I-5 The Hooding (the faction choice; a party vote)
  {
    id: 'dialogue:falconer-hooding-vote', name: 'I-5 the Mews votes', scope: 'party',
    entries: [{ when: { not: { flag: 'falconer.hooding' } }, node: 'perches' }, { node: 'after' }],
    nodes: {
      perches: { speaker: 'narrator', text: 'Every falconer of the Mews on the perches at dusk, a bird on every fist, and the wind coming up off the moor. The Hooded Man sits at the back with a hooded falcon. The Lodge’s envoy is holding onto a rock. Old Wren is on her ledge above, with Pibb.', next: 'motion' },
      motion: { speaker: 'npc:agatha-spurling', text: 'Order! Two motions. One: we let the gentleman hood every bird on the cliffs until the tears pass. Two: we lend our best hawks to the Great Lodge, to hunt the hollow herd at Antlerford. Movers first. Order!', next: 'teodor' },
      teodor: { speaker: TE, text: '(He stands, and the perches go quiet for him.) I don’t want anything. I only want them not to be frightened. Let me hood them, all of them, just until it passes. I promise you nothing on these cliffs will fall.', next: 'hamo' },
      hamo: { speaker: 'npc:hamo-pickering', text: '(Clinging to his rock.) And the Lodge would like to borrow some. Hawks. To hunt the hollow herd. Master Bannock says please. He said it twice, which for him is a speech.', next: 'debate' },
      debate: { speaker: 'narrator', text: 'The Mews argues, as the Mews has argued for a thousand years. Somebody’s merlin bites somebody’s ear. The Mews-Mother bangs a stone on a rock for order and gets none. High above, Pibb is screaming at a gull.', next: 'ask' },
      ask: {
        speaker: 'npc:agatha-spurling', text: 'Order! Our young falconer with the singing chest will ask what they need to ask, and then speak.',
        choices: [
          { text: 'Stranger, when do the hoods come off?', to: 'te_off' },
          { text: 'Wren, what would you do?', to: 'wren' },
          { text: 'Mews-Mother, what does the Mews’ oldest saying mean?', to: 'saying', school: 'hunt' },
        ],
      },
      te_off: { speaker: TE, text: 'When it’s safe. When nothing out there can frighten them any more. (He smiles, very kindly.) I’ll know when. I always know.', next: 'choose' },
      wren: { speaker: WR, text: '(From her ledge above, not loudly.) I’ve said what I think for fifty years, and they’ve voted against me for forty-nine of them. Don’t look at me, my dear. Look at your bird.', next: 'choose' },
      saying: { speaker: 'npc:agatha-spurling', text: 'A frightened bird is a bird that’s paying attention. (She lowers the stone.) It means you don’t blindfold the sentry because he’s shouting. Everybody knows what it means. Nobody likes it.', next: 'choose' },
      choose: {
        speaker: 'npc:agatha-spurling', text: 'Well? Hood them, or lend them?',
        choices: [
          { text: 'Hood them. Better a quiet bird than a dead one.', to: 'hood', quest: true, trustNpc: WR, trust: -1, effects: [{ setFlag: 'falconer.hooding', value: 'hooded' }] },
          { text: 'Lend them to the Lodge. A hawk is for hunting. Let them hunt what’s hurting us.', to: 'lend', quest: true, effects: [{ setFlag: 'falconer.hooding', value: 'lent' }] },
          { text: 'Neither. A hawk sees the tears as a colour and steers round them. A hooded bird can’t. Cut every jess and fly them free.', to: 'free', quest: true, insight: 'flown_free', when: { insight: 'hawks_see_tears' }, effects: [{ setFlag: 'falconer.hooding', value: 'free' }] },
        ],
      },
      hood: { speaker: TE, text: '(He stands, and bows, and begins.) Thank you. You won’t regret it. Nothing here will ever be frightened again. (One by one the cliffs go quiet. Up on her ledge, Wren turns her back.)', next: null },
      lend: { speaker: 'npc:hamo-pickering', mood: 'happy', text: 'Oh, thank you. Thank you. Master Bannock will be so pleased. He’ll probably not say so, but he’ll be pleased. (The best birds go down the cliff path at dawn. The Mews is half empty.)', next: null },
      free: { speaker: 'narrator', text: 'Silence on the perches. Then Wren, on her ledge, cuts the jesses on her own old goshawk and lets it go, and everybody watches it climb the wind and turn, neatly, round a black smudge in the air that nobody else can see. The Hooded Man watches it too, and does not understand.', next: null },
      after: { speaker: 'npc:agatha-spurling', text: 'The Mews has voted. For once, it has even agreed. Don’t get used to it.', next: null },
    },
  },
  {
    id: 'dialogue:obj-mews-free-perch-3', name: 'I-5 the last bird flown free', scope: 'party',
    entries: [{ when: stage('quest:falconer-the-hooding', 'free'), node: 'free' }, { node: 'plain' }],
    nodes: {
      free: { speaker: 'narrator', text: 'The last jess on the cliffs. You cut it, and the bird looks at you, and at the sky, and goes. Out over the moor the whole Mews is flying free in a great loose wheel, and every bird in it swerves, together, round the places where the air is black.', next: null },
      plain: { speaker: 'narrator', text: 'An empty perch with a cut jess hanging from it.', next: null },
    },
  },
  // ---------- I-6 Grandmother Talon
  {
    id: 'dialogue:falconer-eyrie-call', name: 'I-6 the call from the Eyrie', scope: 'party',
    entries: [
      { when: { flag: 'falconer.hooding', value: 'hooded' }, node: 'hooded' },
      { when: { flag: 'falconer.hooding', value: 'lent' }, node: 'lent' },
      { node: 'free' },
    ],
    nodes: {
      hooded: { speaker: 'narrator', text: 'All the way up the Featherfall the hooded Mews birds are walking, on foot, in a long patient line, towards the Hollow Eyrie. They cannot see where they are going. They go anyway.', next: 'talon' },
      lent: { speaker: 'narrator', text: 'Over the Featherfall the Lodge’s borrowed hawks are flying wrong, wide of Antlerford, drifting back towards the Hollow Eyrie as if a string were pulling them. The Huntsmen below are shouting and waving their hats.', next: 'talon' },
      free: { speaker: 'narrator', text: 'Over the Featherfall the free birds of the Mews are circling the Hollow Eyrie, crying, keeping well clear of it. They will not go in. They are waiting for someone who will.', next: 'talon' },
      talon: { speaker: 'narrator', text: 'In the great nest at the top, the oldest hawk in the Greywilds lifts her head. She is the size of a pony, and a hood of black tears is drawn down over her eyes, and she is calling, calling, every bird on the moor home.', next: null },
    },
  },
  {
    id: 'dialogue:obj-hollow-eyrie-nest', name: 'I-6 Grandmother Talon’s nest', scope: 'party',
    entries: [{ when: stage('quest:falconer-grandmother-talon', 'nest'), node: 'nest' }, { node: 'plain' }],
    nodes: {
      nest: {
        speaker: 'narrator', text: 'Grandmother Talon sits on the rim of her nest with clear eyes, preening, as if nothing had happened. The nest is lined, deep and soft, with hoods: dozens of little leather hoods, all the same make, as if she had been collecting them.',
        choices: [
          { text: 'Turn one over and look at the stitching.', to: 'stitch', school: 'hunt', effects: [{ setFlag: 'falconer.hood_stitch_seen', value: true }] },
          { text: 'Leave them. Let her keep her nest.', to: null },
        ],
      },
      stitch: { speaker: 'narrator', text: 'Inside every one, very small, the same two letters in the Mews’ old apprentice stitch: T.T. And every one of them is damp on the inside, as if whoever made them had worn them first.', next: null },
      plain: { speaker: 'narrator', text: 'Grandmother Talon’s nest. She watches you, and lets you look.', next: null },
    },
  },
  // ---------- I-7 What the Hood Holds
  {
    id: 'dialogue:obj-hooded-steading-1', name: 'I-7 the first hooded steading', scope: 'party',
    entries: [{ when: stage('quest:falconer-what-the-hood-holds', 'steadings'), node: 'family' }, { node: 'plain' }],
    nodes: {
      family: { speaker: 'narrator', text: 'A shepherd, his wife and their old mother, side by side on the doorstep in the wind, all three hooded with soft black leather that glistens. They are smiling. The fire inside has gone out, and nobody has minded.', next: null },
      plain: { speaker: 'narrator', text: 'A quiet steading on the Windscour Plain.', next: null },
    },
  },
  {
    id: 'dialogue:falconer-teodor-steading', name: 'I-7 the Hooded Man on the Windscour', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: TE, text: 'Ah. You found them. Aren’t they peaceful? Nobody on this plain has been frightened in a week. Nobody has been hungry, or sad, or in pain. (He strokes the hawk on his fist.) Hello again, by the way. And hello, Wren. I know you’re watching.',
        choices: [
          { text: 'You hooded people.', to: 'people' },
          { text: 'How do you know Wren?', to: 'wren' },
        ],
      },
      wren: { speaker: TE, text: 'She taught me. She taught you too, I can tell, the way you hold your fist. I left the Mews in C. 1030. I was the frightened one, always. She never hooded me. I wished she would.', next: 'people' },
      people: {
        speaker: TE, text: 'Birds first. Then I learned to hood the tears themselves, and put them over minds, very gently. Nobody I hood is ever frightened again. With the Moor half I could hood the whole of the Greywilds. The Great Hunt too. Nothing would ever be afraid again.',
        choices: [
          { text: 'They aren’t calm. They’re just not there.', to: 'there' },
          { text: 'Your own hood is wet. On the inside.', to: 'wet', insight: 'teodor_hooded_himself', when: { any: [{ flag: 'falconer.hood_stitch_seen' }, { flag: 'falconer.hood_tear' }, { flag: 'falconer.fall_hood' }, { questCompleted: 'quest:falconer-the-moorland-post' }] } },
        ],
      },
      wet: { speaker: TE, mood: 'sad', text: '(He goes very still. Then he touches his hood, the way you would touch a bruise.) Well. Yes. It works on the outside. It’s the inside that’s slow. Thirty years, and it’s still slow.', next: 'there' },
      there: { speaker: TE, text: 'Shh. You’re frightened. I can hear it. That’s all right. I’ll be on the Moor’s Crown tonight, where the stone sleeps. Come and stop me, if you like. I won’t hurt you. I’ll just make it stop hurting.', next: null },
    },
  },
  {
    id: 'dialogue:falconer-wren-teodor', name: 'I-7 Wren on Teodor', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: WR, mood: 'sad', text: 'Teodor Tanager. My last apprentice. He came to the Mews at eight, frightened of everything, the wind, the dark, the birds. Especially the birds. He was the gentlest falconer I ever taught.', next: 'left' },
      left: {
        speaker: WR, text: 'He left in C. 1030, in the night, and I wrote him a letter and never knew where to send it. I thought he’d gone to Antlerford. He went into the dark and learned to hood it instead.',
        choices: [
          { text: 'He said you never hooded him. He wished you would.', to: 'wish' },
          { text: 'I’ll stop him, Wren.', to: 'stop', trust: 1 },
        ],
      },
      wish: { speaker: WR, mood: 'sad', text: 'I know. He asked me once. I said a frightened bird is a bird that’s paying attention. I was right, and I lost him anyway. His bunk is still in the old mews; I never could clear it. Look at it, and then go up to the Crown.', next: null },
      stop: { speaker: WR, text: 'Stop him. Don’t hurt him more than you have to. He hurts enough already, under there. Go down to the old mews first and look at his bunk. Know who you’re stopping. Then go up to the Crown.', next: null },
    },
  },
  // ---------- I-8 The Moor's Crown
  {
    id: 'dialogue:obj-hunt-frontier-halfstone', name: 'I-8 the Moor half', scope: 'party',
    entries: [{ when: stage('quest:falconer-the-moors-crown', 'stone'), node: 'claim' }, { node: 'ring' }],
    nodes: {
      claim: { speaker: 'narrator', text: 'In the centre of the stone ring, on a flat rock worn smooth by wind, lies half of a crystal, cracked clean across, singing. Your hawk drops off your fist and stands beside it, head on one side, listening. It is warm in your hand, the way a bird is warm.', next: 'wings' },
      wings: {
        speaker: 'narrator', text: 'For a moment you are high above the Hawkmoor, and below you the Great Hunt runs north along a road of light with the herd behind it and every bird of the moor above it, and nobody is hooded, and nobody is afraid. Then you are back in the ring.',
        choices: [
          { text: '(Let your hawk sit with it a moment longer.)', to: 'sit' },
          { text: '(Hold it up into the wind, the way you would cast a bird.)', to: 'cast', school: 'hunt' },
        ],
      },
      sit: { speaker: 'narrator', text: 'Your hawk leans its head against the crystal, eyes half shut, the way it leans against your cheek when it is tired. The song goes quiet, as if it were resting too.', next: 'teodor' },
      cast: { speaker: 'narrator', text: 'The wind takes the note and carries it out over the moor, and across the whole Hawkmoor every hooded bird lifts its head at once, the way you do when somebody far off says your name.', next: 'teodor' },
      teodor: {
        speaker: TE, text: '(From far above, on a cloud of hooded wings, his voice, gentle as ever.) Keep it safe for me. I’ll be at the Antler Gate. The Great Hunt is so frightened. Someone ought to help it.',
        choices: [
          { text: 'Teodor! I read your list. The bottom of it.', to: 'list', when: { flag: 'falconer.teodor_list' } },
          { text: 'Teodor, come down. Wren wants you home.', to: 'home' },
          { text: '(Let him go.)', to: null },
        ],
      },
      list: { speaker: TE, mood: 'sad', text: '(The cloud of wings slows, and for a moment almost turns back.) …That was a long time ago. She was the only thing. (The birds lift him higher.) I’ll hood that too, one day. Then it won’t hurt either.', next: null },
      home: { speaker: TE, text: 'Home. (He laughs, very gently.) I am going home. Everyone is, once the gate opens. And nobody will ever be frightened in it.', next: null },
      ring: { speaker: 'narrator', text: 'The stone ring on the Moor’s Crown, open to the sky.', next: null },
    },
  },
  // ---------- I-9 Cut Jesses (mentor farewell; trust check)
  {
    id: 'dialogue:falconer-wren-farewell', name: 'I-9 Wren’s farewell', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: WR, text: 'So you have it, and he’s gone for the gate with half the birds on the moor, and you’re off after him. (Pibb walks down her arm and looks at you.) I always said you’d fly further than me. I meant it as a joke.',
        choices: [
          { text: 'Come with me.', to: 'stay' },
          { text: 'You taught me to fly my first bird. Thank you.', to: 'first', trust: 1 },
        ],
      },
      stay: { speaker: WR, mood: 'happy', text: 'Down a cliff, across a moor and through a gate, at my age, with my eyes? I’d love to. I’m not going to. Somebody has to keep the Mews from voting on its own breakfast.', next: 'first' },
      first: {
        speaker: WR, text: 'Do you remember your first bird? A little sparrowhawk. You cried when it flew off, and it came back, and you cried again. I thought: that one will do.',
        choices: [
          { text: 'I remember.', to: 'remember' },
          { text: 'You taught me to let go first.', to: 'letgo', school: 'hunt' },
        ],
      },
      remember: { speaker: WR, mood: 'happy', text: 'Of course you do. Nobody forgets the first one. Teodor never did. That was rather the trouble.', next: 'warn' },
      letgo: { speaker: WR, text: 'I taught you to let go so that it could come back. That’s the whole of falconry. It took me forty years to say it that short.', next: 'warn' },
      warn: { speaker: WR, text: 'At the gate the Great Hunt will be blind, and so will he, in his way. Don’t hood anything. Not your bird, not your fear. Fly.', next: 'gifts' },
      gifts: {
        speaker: WR, text: 'Hold out your hand. No, the other one. Your fist.',
        choices: [
          { text: '(Hold out your fist.)', to: 'glove', when: { trust: WR, value: 'friendly' } },
          { text: '(Hold out your hand to shake hers.)', to: 'hand', when: { not: { trust: WR, value: 'friendly' } } },
        ],
      },
      glove: { speaker: WR, text: '(She pulls a glove onto your fist, old, cracked, shaped by fifty years of talons.) My old glove. Every bird that ever sat on it came back. Every one. Mind you bring it back too.', effects: [{ giveItem: 'a_wren_glove' }, { setFlag: 'falconer.wren_glove', value: true }, { setFlag: 'falconer.wren_farewell', value: true }], next: 'pibb' },
      pibb: {
        speaker: WR, mood: 'sad', text: '(Pibb hops from her shoulder onto your glove, and stays there.) Ah. Well. I’ve seen enough. You go and see the rest. He can show me, now and then, if he feels like it.',
        choices: [
          { text: 'I’ll bring him back to you.', to: 'end', when: { trust: WR, value: 'trusted' }, effects: [{ setFlag: 'falconer.pibb_pet', value: true }] },
          { text: 'Wren, he’s your eyes. He stays with you.', to: 'end' },
        ],
      },
      hand: { speaker: WR, text: 'Mind the wind on the gate road. Mind the Great Hunt. Mind Teodor. Don’t let him hood your bird, whatever happens.', effects: [{ setFlag: 'falconer.wren_farewell', value: true }], next: null },
      end: { speaker: WR, text: 'Go on. Cut the jesses. That’s what we say, when a falconer leaves the Mews. It means go and fly. It doesn’t mean don’t come back.', next: null },
    },
  },
  // ---------- First-hour delights (Claude 5): one-time lines when the player does something optional
  {
    id: 'dialogue:falconer-delight-count', name: 'Delight: Wren and the unfinished count',
    entries: [{ node: 'count' }],
    nodes: {
      count: { speaker: WR, text: 'Back already? Pibb says you haven’t finished counting. (Pibb says nothing at all, very smugly.) He counts faster than you. He counts faster than everybody, and he is unbearable about it. Go on. Three tors.', effects: [{ setFlag: 'falconer.delight.count', value: true }], next: null },
    },
  },
  {
    id: 'dialogue:falconer-delight-pibb', name: 'Delight: Pibb reports again',
    entries: [{ node: 'again' }],
    nodes: {
      again: { speaker: 'npc:pibb', text: '(Pibb looks at you with one eye. He has seen this one before. He does not trouble the other eye, and turns his head almost all the way round to report to Wren: only you again.)', effects: [{ setFlag: 'falconer.delight.pibb-again', value: true }], next: null },
    },
  },
];

export default dialogues;
