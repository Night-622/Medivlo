/**
 * Hollow Crown, CANTOR Act I depth pass (10-campaign-style.md §8, docs/PACING.md): the new stages' scenes,
 * investigation clues, travel banter, optional finds and the third parts of the side quests. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const done = (q: Q): NarrativeCondition => ({ questCompleted: q });
const offer = (q: Q, text: string, to: string, extra?: NarrativeCondition): DialogueChoice =>
  ({ text, to, quest: true, when: extra ? { all: [fresh(q), extra] } : fresh(q), effects: [{ startQuest: q }] });
/** a stage scene that takes over an NPC's talk must still let them give their own quests */
const more = (...offers: DialogueChoice[]): DialogueChoice[] => [...offers, { text: 'Thank you.', to: null }];
/** Dawnspire has no night: its night beats happen in the Hour of Lamps (08 R19) */
const LAMPS: NarrativeCondition = { hour: [22, 23] };
const CH = 'npc:celestine-hale' as const, AM = 'npc:sister-amabel' as const, OB = 'npc:osgood-bellamy' as const;
const LD = 'npc:lambert-dewhurst' as const, YS = 'npc:ysmay-penhallow' as const;

/** a clue object: one scene while its stage runs (sets its flag), a plain line otherwise */
function clue(id: string, name: string, when: NarrativeCondition, text: string, flag: string, plain: string, more?: string): DialogueDef {
  return {
    id: `dialogue:obj-${id}`, name, scope: 'party',
    entries: [{ when, node: 'clue' }, { node: 'plain' }],
    nodes: {
      clue: { speaker: 'narrator', text, effects: [{ setFlag: flag, value: true }], next: more ? 'more' : null },
      ...(more ? { more: { speaker: 'narrator', text: more, next: null } } : {}),
      plain: { speaker: 'narrator', text: plain, next: null },
    },
  };
}

const dialogues: DialogueDef[] = [
  // ======================= I-1 The Hour of No Night: Celestine’s cell after Lauds
  {
    id: 'dialogue:cantor-celestine-cell', name: 'I-1 Celestine’s cell after Lauds', scope: 'party',
    entries: [{ node: 'in' }],
    nodes: {
      in: { speaker: 'narrator', text: 'Celestine’s cell: a cot she plainly never uses, a lectern, a censer on a hook, and a single window with a heavy curtain drawn across it, which in Dawnspire is very nearly a crime. She shuts the door and leans on it.', next: 'curtain' },
      curtain: {
        speaker: CH, text: 'Don’t look at the curtain. Everybody looks at the curtain. It’s for the glare. (It is not for the glare.) Sit. Let me see it.',
        choices: [
          { text: '(Undo your collar.)', to: 'collar' },
          { text: 'Mother, what is the curtain for, really?', to: 'really' },
        ],
      },
      really: { speaker: CH, mood: 'sad', text: 'For about four minutes a day, when the light comes round the Cathedral at a slant, it makes the corner of this room nearly dim. I sit in it. That is the whole of my wickedness, and now you know it. Collar.', next: 'collar' },
      collar: { speaker: 'narrator', text: 'You undo your collar, and the half-stone’s light comes out across the cell, soft and gold, and for a moment the corner behind the curtain is lit too, and Celestine closes her eyes as if someone had touched her face.', next: 'stone' },
      stone: {
        speaker: CH, text: 'The Altar half. It has lain on the High Altar for thirty years in the brightest place in the world, and it chose a novice who falls asleep on the steps. I find that very funny, and also very frightening.',
        choices: [
          { text: 'Why frightening?', to: 'why' },
          { text: 'It went dark, Mother. For a heartbeat. I saw a star.', to: 'star' },
          { text: '(Hum the Prime tune to it, softly.)', to: 'hum', school: 'radiance' },
        ],
      },
      why: { speaker: CH, text: 'Because the Brightwatch thinks the dark is a sickness, and the stone is singing about the dark. If Lucan Brightwater hears you, he will be very kind to you, and you will never be allowed to be tired again.', next: 'sleep' },
      star: { speaker: CH, mood: 'happy', text: 'So did I. One star, over the Cathedral roof, like a pin in a cushion. Thirty years, and I had forgotten they were small. You remember them enormous, as a child. They are tiny. I wept on the steps and pretended it was the incense.', next: 'sleep' },
      hum: { speaker: 'narrator', text: 'You hum the first bars of Prime. The stone hums them back, slower, lower, and somehow at the end it turns the tune downwards, the wrong way, the way no hymn in Dawnspire has gone for thirty years. Celestine goes very still.', next: 'sleep' },
      sleep: {
        speaker: CH, text: 'Listen to me. In this city, sleep is a confession, and grief is a crime, because grief wants the dark and there isn’t any. So people do neither, and they fill up. You have seen their faces at Lauds.',
        choices: [
          { text: 'Then what do we do?', to: 'do' },
          { text: 'When did you last sleep, Mother?', to: 'last', trust: 1 },
        ],
      },
      last: { speaker: CH, text: '(A pause that goes on rather too long.) I rest my eyes. During the psalms, and in the corner behind the curtain. A Precentrix is permitted to rest her eyes. It is in the Rule. I may have written that part of the Rule.', next: 'do' },
      do: { speaker: CH, text: 'Tomorrow, which in Dawnspire means in an hour, the Brightwatch counts the sleepers. Novices nod off in every corner of the Close. Go round before they do, and wake ours gently. Gently. Some of them have not slept in years.', next: 'end' },
      end: { speaker: CH, text: 'And do your collar up. You glow when you are worried. It is very sweet, and it will get you arrested.', next: null },
    },
  },
  {
    id: 'dialogue:area-cantor-close-round', name: 'I-2 banter: round the Close', bark: true,
    entries: [{ when: stage('quest:cantor-the-sleepers-census', 'novices'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Every corner of the Close is full of light, and in every corner somebody is trying very hard not to close their eyes. A Brightwatch sergeant is walking the far side, ringing a little bell, saying “Awake, awake,” in a voice that badly wants to lie down.', next: null } },
  },

  // ======================= I-2 The Sleepers’ Census: the Book of Sleepers
  clue('cantor-sleepers-book', 'I-2 the Book of Sleepers', stage('quest:cantor-the-sleepers-census', 'book'),
    'The Book of Sleepers, chained in the Brightwatch porch: thirty years of names, every one caught nodding off. Your six are in it, from this morning. But all down the margins, every child under twelve has been struck through, neatly, and beside each strike, in a small careful hand: “Let her sleep. L. B.”',
    'cantor.lucan_mercy', 'The Book of Sleepers, chained in the Brightwatch porch.', 'Hundreds of them. “Let him sleep. L. B.” “Let them sleep. L. B.” The Inquisitor himself has been quietly forgiving every child in Dawnspire for thirty years.'),

  // ======================= I-3 The Bell Loft: the stair
  {
    id: 'dialogue:area-cantor-loft-stair', name: 'I-3 banter: up the Bell Loft stair', bark: true,
    entries: [{ when: stage('quest:cantor-the-bell-loft', 'stair'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'The stair shakes with every stroke of the bell. Someone has scratched a tally on the wall at every landing, once a minute, for thirty years, and at the top somebody has given up and written: A GREAT MANY.', next: null } },
  },

  // ======================= I-4 The Inquisitor’s Kindness: the raided stalls
  clue('cantor-draught-stall-1', 'I-4 a raided stall (1)', stage('quest:cantor-the-inquisitors-kindness', 'raid'),
    'A draught-stall, packed into crates by the Brightwatch with enormous care, every bottle wrapped in straw. On top of the crates, a loaf and a folded blanket, waiting for the seller to come back from the Brightwatch House.',
    'cantor.stall_1', 'An empty pitch on the Market’s back row.'),
  clue('cantor-draught-stall-2', 'I-4 a raided stall (2)', stage('quest:cantor-the-inquisitors-kindness', 'raid'),
    'The seller’s order-book, left open on the counter. Every name in it is a mother or a grandmother, and every order is the same: “Three drops, for a child who cries in the night.” There is no night. They cry anyway.',
    'cantor.stall_2', 'A counter swept clean.'),
  clue('cantor-draught-stall-3', 'I-4 a raided stall (3)', stage('quest:cantor-the-inquisitors-kindness', 'raid'),
    'Behind the last stall, missed by the Brightwatch, one bottle on its own with a label in the seller’s hand: “For the Inquisitor. On the house. He looks like he needs it.” The seal has never been broken.',
    'cantor.lucan_bottle', 'A gap behind the last stall where a bottle stood.', 'It has been sitting there a long time. Nobody has dared deliver it.'),

  // ======================= I-5 The Jars of Night: Lambert and Bellamy before the Undercroft
  {
    id: 'dialogue:cantor-lambert-canvass', name: 'I-5 Lambert before the jars', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: LD, text: 'Jars of night? Under the Market? (He puts his trowel down very carefully, as if it might go off.) Then the Choir will want one. Only one. I’ll ask for it myself, if nobody braver does.', next: 'why' },
      why: {
        speaker: LD, text: 'There are forty novices in the infirmary who have never slept a whole night in their lives. Not one. They don’t know what it is. I’ve tried describing it. It’s like describing a moonflower to someone who’s only ever seen it shut.',
        choices: [
          { text: 'And if the Brightwatch says no?', to: 'no' },
          { text: 'What would one hour of dark do?', to: 'hour' },
        ],
      },
      no: { speaker: LD, mood: 'sad', text: 'Then they’ll say no, gently, and give us all a loaf. That’s how it goes here. Nobody shouts. Everybody just gets more tired.', choices: more(offer('quest:cantor-the-moonflower', 'Could your moonflowers bloom down there?', 'where', done('quest:cantor-the-inquisitors-kindness'))) },
      hour: { speaker: LD, mood: 'happy', text: 'I don’t know. That’s rather the point. Nobody alive in the Choir knows. I would very much like to find out before I’m dead, which I am getting on with.', choices: more(offer('quest:cantor-the-moonflower', 'Could your moonflowers bloom down there?', 'where', done('quest:cantor-the-inquisitors-kindness'))) },
      where: { speaker: LD, text: 'You’ve been down the stair, then. Real dark. (He hands you a little knife.) Take a cutting. One leaf and a node. Be gentle; it’s older than both of us put together.', next: null },
    },
  },
  {
    id: 'dialogue:cantor-bellamy-canvass', name: 'I-5 Bellamy before the jars', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: OB, text: 'The jars. Yes. The Inquisitor’s told me. Every one to be carried up and broken in the sun on the Close steps, and I’m to do the carrying. (He looks at his hands.) I’ve a bad back. It’s not the back.', next: 'law' },
      law: {
        speaker: OB, text: 'It’s the law, and I keep the law. But I’ve seen the labels. “A very still night.” “The night of the long frost.” Somebody wrote those down so they’d be remembered. Breaking them feels like burning a letter you haven’t read.',
        choices: [
          { text: 'Then don’t break them.', to: 'dont' },
          { text: 'Why does Lucan want them gone so badly?', to: 'lucan' },
        ],
      },
      dont: { speaker: OB, mood: 'afraid', text: 'I didn’t hear that. I’m fining myself for hearing it. (He writes something, and doesn’t.) Say what you like down there. I’ll carry whatever I’m told to carry.', choices: more(offer('quest:cantor-the-word-for-it', 'What are you writing in your own fine-book?', 'self', done('quest:cantor-the-hour-of-no-night'))) },
      lucan: { speaker: OB, mood: 'sad', text: 'His mother died in the last night we had. Everybody knows. Nobody says. He thinks the dark took her. (A pause.) My dad died at noon, Cantor. Nobody broke the noon.', choices: more(offer('quest:cantor-the-word-for-it', 'What are you writing in your own fine-book?', 'self', done('quest:cantor-the-hour-of-no-night'))) },
      self: { speaker: OB, mood: 'sad', text: 'My own fine. For dreaming. Every morning, two shards. Help me find a word for it that isn’t illegal, would you?', next: null },
    },
  },

  // ======================= I-7 The Last Night: the alto stall
  clue('cantor-alto-stall', 'I-7 the empty alto stall', stage('quest:cantor-the-last-night', 'stall'),
    'An alto stall in the Cloister quire, the brass plate polished to a mirror: SISTER HELENA BRIGHTWATER. The cushion is new. The hymnal on the ledge is open at Compline, the hymn nobody is allowed to sing, and a candle-stub stands beside it, unlit, waiting.',
    'cantor.alto_stall', 'An alto stall in the quire, very well polished.', 'There is beeswax in the grain of the wood, fresh this morning. Somebody comes here before Prime, every day, and sits for a moment, and goes.'),

  // ======================= I-9 The Dawn Road: the pilgrims’ sundial, the road
  {
    id: 'dialogue:obj-cantor-road-sundial', name: 'I-9 the pilgrims’ sundial', scope: 'party',
    entries: [{ when: stage('quest:cantor-the-dawn-road', 'sundial'), node: 'dial' }, { node: 'plain' }],
    nodes: {
      dial: { speaker: 'narrator', text: 'A pilgrims’ sundial halfway down the Dawn Road, its bronze face polished by thirty years of hands. It has not told the time since C. 1012: in Solaria the sun stands still, and a shadow that does not move is no use to anybody.', next: 'shadow' },
      shadow: {
        speaker: 'narrator', text: 'But behind you the great lens has clouded, and the light has shifted, a hair. On the bronze face, faint and grey, the gnomon’s shadow has begun, very slowly, to move.',
        choices: [
          { text: '(Read the hour.)', to: 'hour', effects: [{ unlockLore: 'lore:hc-radiance-road-sundial' }] },
          { text: '(Set a pilgrim’s candle at its foot, the old way.)', to: 'candle', effects: [{ unlockLore: 'lore:hc-radiance-road-sundial' }] },
        ],
      },
      hour: { speaker: 'narrator', text: 'It says a quarter past four. It is the first time anybody in Dawnspire has known what time it is in thirty years. You suspect it is wrong. It is lovely anyway.', next: null },
      candle: { speaker: 'narrator', text: 'Pilgrims used to leave a candle at the dial for the walk home, so they would have something for the dark. You leave one. For the first time in thirty years, somebody might need it.', next: null },
      plain: { speaker: 'narrator', text: 'The pilgrims’ sundial on the Dawn Road, telling the time again, slightly wrong.', next: null },
    },
  },
  {
    id: 'dialogue:area-cantor-dawn-road', name: 'I-9 banter: down the Dawn Road', bark: true,
    entries: [{ when: stage('quest:cantor-the-dawn-road', 'road'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'For the first time in your life the light is behind you, and in front of you, long and thin on the white road, walks your own shadow, a little ahead, as if it knows the way.', next: null } },
  },

  // ======================= Side: the Word for It (Bellamy’s fine-book)
  clue('cantor-fine-book', 'The Word for It: Bellamy’s own fine-book', stage('quest:cantor-the-word-for-it', 'book'),
    'Thirty years of mornings, two shards each, in Bellamy’s square hand. “For dreaming: a boat.” “For dreaming: my mother, shelling peas.” “For dreaming: the dark, and it was not frightening, and I am very sorry.” The total at the bottom of the last page is enormous.',
    'cantor.bellamy_book', 'Sergeant Bellamy’s fine-book, closed, on the porch desk.', 'Every shard of it, the receipts show, has been paid into the orphans’ box at the Close gate. Nobody ever told the orphans why.'),

  // ======================= Side: the Pilgrim Who Saw Stars (the Bell Loft window)
  {
    id: 'dialogue:obj-cantor-loft-window', name: 'The Pilgrim: the Bell Loft window', scope: 'party',
    entries: [
      { when: { all: [stage('quest:cantor-the-pilgrim-who-saw-stars', 'stars'), LAMPS] }, node: 'lamps' },
      { when: stage('quest:cantor-the-pilgrim-who-saw-stars', 'stars'), node: 'day' },
      { node: 'plain' },
    ],
    nodes: {
      plain: { speaker: 'narrator', text: 'The highest window in Dawnspire, at the top of the Bell Loft, looking east over the Gilded March.', next: null },
      day: { speaker: 'narrator', text: 'Nothing but white sky, from edge to edge. Prue saw her stars in the Dimming, where the light is lowest. Come back in the Hour of Lamps.', next: null },
      lamps: {
        speaker: 'narrator', text: 'The Cathedral dips. Far out east, over the March, where the Dimming lies along the edge of the world like a grey shore, there are stars. Tiny ones. Hundreds. Exactly like somebody spilled the salt on a black cloth and didn’t clear it up.',
        effects: [{ setFlag: 'cantor.salt_stars', value: true }],
        choices: [
          { text: '(Count them.)', to: 'count' },
          { text: '(Wave, in case she’s looking.)', to: 'wave' },
        ],
      },
      count: { speaker: 'narrator', text: 'You get to forty-one before the light comes back up and takes them. Forty-one more than anybody in Dawnspire has seen in thirty years. You write the number on the window-ledge with your finger, in the dust, for Tobit to find.', next: null },
      wave: { speaker: 'narrator', text: 'You wave at the March. It is nine miles away and she cannot possibly see you. Down the Bell Loft stair, very faintly, someone else is laughing, and it might be Tobit, and it might be you.', next: null },
    },
  },

  // ======================= Side: Nodding Off (Tobit’s jar)
  {
    id: 'dialogue:cantor-amabel-tobit', name: 'Nodding Off: returning Tobit’s jar', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: AM, text: '“A quiet night, C. 1011.” (She takes it and turns it to read the level.) Down a good third. Somebody’s been sniffing it. (She looks at you over the jar.) The Lark boy. It’s always the Lark boy. He’s been borrowing my nights since he was ten.', next: 'shelf' },
      shelf: {
        speaker: AM, mood: 'happy', text: 'I let him. I count them back in. Don’t tell him I know. A boy who’s never slept has got to start somewhere, and a quiet one’s the best to start on.',
        choices: [
          { text: 'He was frightened you’d be angry.', to: 'angry' },
          { text: 'Could he borrow another one, sometimes?', to: 'another', trust: 1, trustNpc: AM },
        ],
      },
      angry: { speaker: AM, text: 'Angry? With the only person in Dawnspire who still visits? Bless him. Tell him the shelf will notice if he stops.', next: null },
      another: { speaker: AM, text: '(She takes down “a mild night, C. 1007”, and puts it in your hands without a word.) Under his mattress. Not a word. And tell him the stopper goes back in before Lauds, or I’ll come up there myself.', next: null },
    },
  },

  // ======================= Side: Madame Lull’s Draughts (the last crate)
  {
    id: 'dialogue:cantor-lambert-crate', name: 'Madame Lull: the last crate for the infirmary', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: LD, text: 'A crate of Lull’s Lulling Draughts? In the Cloister? (He lifts the lid, and sniffs.) Chamomile. Valerian. A great deal of sincerity. That woman never once lied about what was in a bottle.', next: 'use' },
      use: {
        speaker: LD, text: 'Forty novices in my infirmary who have never slept a night. Three drops each. (He hesitates.) It’s against the Rule. Everything kind in this city is against the Rule.',
        choices: [
          { text: 'Use them. One drop each, tonight. I’ll answer for it.', to: 'use2', trust: 1 },
          { text: 'Keep them for the worst, the ones who can’t stop crying.', to: 'worst' },
        ],
      },
      use2: { speaker: LD, mood: 'happy', text: 'One drop. One night. (He puts the crate under the potting-bench, behind the slug-pots, where no Brightwatch sergeant would ever look.) I shall be up all night watching them sleep. It will be the best night of my life.', next: null },
      worst: { speaker: LD, mood: 'sad', text: 'The worst. Yes. There are always one or two. (He sets the crate on the high shelf.) That’s a kind thought, and a sad one. Most kind thoughts in Dawnspire are.', next: null },
    },
  },

  // ======================= Side: Rain at Night (keeping Orla’s hour)
  {
    id: 'dialogue:cantor-amabel-orla', name: 'Rain at Night: keeping Orla’s hour', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: AM, text: 'Orla wants her hour kept? (She is already reaching for an empty jar.) Of course she does. Orla always did know what was worth keeping. She kept her husband forty-one years on a seamstress’s wage.', next: 'label' },
      label: {
        speaker: AM, text: 'Now. A label. What shall I write?',
        choices: [
          { text: '“The hour Orla heard the rain again, C. 1042.”', to: 'again' },
          { text: '“Only the rain.”', to: 'only' },
        ],
      },
      again: { speaker: AM, mood: 'happy', text: '(She writes it in her round hand, and sets the jar on the fourth shelf, between 1009 and 1010, where the rain used to be.) There. In the right place. She’ll like that; she always said the shelves were out of order.', next: null },
      only: { speaker: AM, mood: 'sad', text: '(She writes it, and holds it a moment before she shelves it.) “Only the rain.” That’s the best label I’ve ever written, and I didn’t write it. Thank you, love.', next: null },
    },
  },

  // ======================= Side: the Hierarch’s Shadow (the portrait)
  {
    id: 'dialogue:obj-cantor-hierarch-portrait', name: 'The Hierarch’s Shadow: the portrait', scope: 'party',
    entries: [{ when: stage('quest:cantor-the-hierarchs-shadow', 'portrait'), node: 'portrait' }, { node: 'plain' }],
    nodes: {
      portrait: { speaker: 'narrator', text: 'In a dim corner of the Cloisters, half behind a pillar, a portrait of the Hierarch as a young man, painted before he shut himself in the light: a thin, worried face, a mitre too big for him, and behind him on the wall, painted with great care, his own shadow.', next: 'jar' },
      jar: {
        speaker: 'narrator', text: 'In the jar at your belt, the shadow presses itself flat against the glass towards the picture, very still, the way a dog sits in front of a door it knows.',
        choices: [
          { text: '(Hold the jar up to the portrait.)', to: 'hold' },
          { text: '(Read the painter’s note on the frame.)', to: 'note' },
        ],
      },
      hold: { speaker: 'narrator', text: 'For a long moment the shadow in the jar and the shadow in the painting are exactly the same shape. Then the one in the jar lowers its arms, slowly, as if it had remembered something, and sits down in the bottom of the glass, and waits to go home.', next: null },
      note: { speaker: 'narrator', text: 'A brass plate on the frame: “The Hierarch, in his first year, at his own request painted with his shadow, so that he might remember he was a man.” Somebody has hung a curtain beside it, very recently, to keep the glare off.', next: null },
      plain: { speaker: 'narrator', text: 'A portrait of a young Hierarch with a shadow behind him, half hidden by a pillar.', next: null },
    },
  },

  // ======================= Optional areas (Claude 2): finds round Dawnspire
  {
    id: 'dialogue:obj-radiance-capital-ruin-find', name: 'Dawnspire ruin: the Compline belfry', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'A little ruined belfry outside the walls, roofless, its bell gone. Carved on the lintel: THIS BELL RINGS THE LIGHT DOWN. Somebody has chiselled out the word DOWN, very thoroughly, and somebody else has chalked it back in, very small, many times.', effects: [{ unlockLore: 'lore:hc-radiance-capital-ruin' }], next: null } },
  },
  {
    id: 'dialogue:obj-radiance-capital-cave-find', name: 'Dawnspire cave: the cool dark', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'Far enough into the cave, the light from the Cathedral gives up. It is the first true dark outside the Undercroft for thirty miles. On the floor, in a neat circle, are a dozen worn hollows in the stone, the size of a person lying curled. People have been coming here to sleep for a very long time.', effects: [{ unlockLore: 'lore:hc-radiance-capital-cave' }], next: null } },
  },
  {
    id: 'dialogue:obj-radiance-capital-cave-codex', name: 'Dawnspire cave: a sleeper’s note', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'A note tucked in a crack above one of the hollows: “If you are reading this you have found the dark. Lie down. Nobody will fine you. Nobody will wake you. When you go, leave the note for the next one.” It is signed with forty different initials, in forty different hands.', effects: [{ unlockLore: 'lore:hc-radiance-capital-sleepers' }], next: null } },
  },
  {
    id: 'dialogue:obj-radiance-capital-view-find', name: 'Dawnspire viewpoint: the Glare Steps', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'From the Glare Steps the whole of Dawnspire lies below, white on white, every roof shining, and in the middle the Sun Cathedral, too bright to look at. Somebody has scratched a line on the rail: LOOK AWAY NOW. Under it, a smaller line: THANK YOU FOR LOOKING AWAY.', effects: [{ unlockLore: 'lore:hc-radiance-capital-view' }], next: null } },
  },

  // ======================= ACT II (wave 2 depth): C-1 The Shore Chapel, Ysmay at the end of the causeway
  {
    id: 'dialogue:cantor-ysmay-causeway', name: 'C-1 Ysmay listens from the causeway', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'The Abbey’s old causeway runs out from the shore in a line of worn stones and simply stops, where the lake came up over it in one night. Ysmay stands on the last dry stone with her eyes shut, holding her breath the way a chorister does before the down-beat.', next: 'here' },
      here: { speaker: YS, text: 'This is where the pilgrims came in, the night of the 85th Turning. The Abbey was right there; you could hear the hours from the road. (She opens one eye.) Hush now. It’s None.', next: 'hour' },
      hour: {
        speaker: 'narrator', text: 'She sings the ninth hour alone, thin and true, out over the water. For a moment, nothing. Then from far down forty voices take it up, and the hymn comes back to you through the lake, every note in place and every rest taken out.',
        choices: [
          { text: '(Sing the hour with her.)', to: 'with', school: 'radiance', effects: [{ setFlag: 'cantor.causeway', value: 'sang' }] },
          { text: '(Listen. Only listen.)', to: 'listen', effects: [{ setFlag: 'cantor.causeway', value: 'listened' }] },
        ],
      },
      with: { speaker: 'narrator', text: 'You come in on the second line. Ysmay’s voice wobbles, and steadies, and leans on yours. Under the water the choir falters, as if it has heard something new, and then sings louder to keep up.', next: 'gap' },
      listen: { speaker: 'narrator', text: 'You listen. It is very beautiful, and something is wrong with it, the way a staircase is wrong when one step is missing and your foot finds air.', next: 'gap' },
      gap: {
        speaker: YS, text: 'You heard it. Up high, in the trebles. There’s a part nobody sings.',
        choices: [
          { text: 'Whose part is it?', to: 'whose' },
          { text: 'Why haven’t you sung it?', to: 'why' },
        ],
      },
      why: { speaker: YS, mood: 'sad', text: 'I tried, the first winter. All forty stopped dead and didn’t sing again for a week. It isn’t mine. (She sniffs, briskly.) I’m a contralto anyway. It would have been a dreadful mess.', next: 'whose' },
      whose: { speaker: YS, text: 'A novice’s. The boy who swam out the night the lake came up: Brother Aldous, who walks over from Brindlecross some evenings to listen. They’ve kept his part empty for thirty years. In case.', next: 'ferry' },
      ferry: { speaker: YS, text: 'If you mean to go down to Morwen, ask Tamsin for the ferry, and sing the whole way. And if you find you can reach that note, Cantor, I shouldn’t think anyone down there would mind.', next: null },
    },
  },

  // ======================= ACT II, C-3 Abbess Morwen: telling Ysmay why the lake is quiet
  {
    id: 'dialogue:cantor-ysmay-quiet', name: 'C-3 Ysmay hears why the lake is quiet', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'Ysmay is on the last stone of the causeway, and the whole congregation is on the shore behind her, holding their hymn-books over their heads like umbrellas. The lake is flat and grey and silent.', next: 'ys' },
      ys: {
        speaker: YS, text: 'We sang Vespers at the turn of the hour, as we have every day for thirty years. Nothing came back. Not a note. (She doesn’t turn round.) Tell me.',
        choices: [
          { text: 'They’re asleep. The Abbess, and all forty. They’re resting.', to: 'asleep' },
          { text: 'She asked me whether the Bell will ring for a Turning or a funeral.', to: 'asked' },
        ],
      },
      asleep: { speaker: YS, mood: 'sad', text: 'Asleep. (A breath.) Thirty years of forty brothers singing back at me every hour. I didn’t know I was listening for them until they stopped.', next: 'after' },
      asked: { speaker: YS, mood: 'sad', text: '(She is quiet a long time.) For thirty years we sang to a funeral and called it the hours. Whatever you told her, I hope it was kind. She’d had a very long day.', next: 'after' },
      after: {
        speaker: YS, text: 'So. What does a chapel do, when the lake stops answering?',
        choices: [
          { text: 'Keep singing. Somebody’s still listening.', to: 'still', trust: 1 },
          { text: 'Sing them Compline. It’s the hymn for going to sleep.', to: 'compline', when: { insight: 'compline' } },
          { text: 'Sing for the living, for a change.', to: 'living' },
        ],
      },
      still: { speaker: YS, mood: 'happy', text: 'Then we keep singing. (She turns round at last, to the congregation.) Well? Don’t stand there dripping. It’s nearly the hour.', next: 'light' },
      compline: { speaker: YS, text: 'Compline. Dawnspire lost it before I was born. (She makes you sing her the verse you know, twice, and writes it on her cuff.) We’ll have it by the next hour. They’ll sleep the better for it.', effects: [{ setFlag: 'cantor.shore_compline', value: true }], next: 'light' },
      living: { speaker: YS, text: 'The living. Yes. We may be rusty. We may be appalling. (She very nearly smiles.) The fish won’t mind.', next: 'light' },
      light: { speaker: YS, mood: 'afraid', text: 'There’s something else. Come up to the chapel when you’ve dried off. From the roof I’ve been watching a light in the Gloamwood, and it is entirely the wrong colour.', next: null },
    },
  },

  // ======================= ACT II, C-4 The Light in the Wood: the way in, the second and third oaks
  {
    id: 'dialogue:area-cantor-gloam-edge', name: 'C-4 banter: into the Gloamwood', bark: true,
    entries: [{ when: stage('quest:cantor-the-light-in-the-wood', 'trail'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Under the Gloamwood’s leaves it is dark, the ordinary kind, and your halo makes a small warm room of it. Somewhere ahead, white and steady and wrong, a light is shining that does not flicker when the wind moves the branches.', next: null } },
  },
  clue('cantor-scorched-oak-2', 'C-4 the second scorched oak', stage('quest:cantor-the-light-in-the-wood', 'trail'),
    'A second oak, burned through at exactly the height of a tall man’s eye. In the ash at its foot lies a heel of good white bread, the kind they bake in Dawnspire for the Brightwatch, left as if by someone who always brings too many.',
    'cantor.oak_2', 'A scorched oak, with crumbs at its foot that the birds have not dared touch.'),
  clue('cantor-scorched-oak-3', 'C-4 the third scorched oak', stage('quest:cantor-the-light-in-the-wood', 'trail'),
    'The third oak has not been burned through. Someone started, and stopped. Hanging from a twig at the height of the scorch mark is a spare pair of smoked spectacle-lenses, cracked across, as if they were taken off to rub tired eyes and forgotten.',
    'cantor.oak_3', 'An oak with a scorch mark on it, half done.',
    'He will have been looking straight into his own light for a while. Nobody can do that for long. The scorched trail goes on west, towards Stag’s Rest, a little crookeder after this.'),

  // ======================= ACT II, C-5 The Weeping Willow: what Lucan left at Stag’s Rest
  clue('cantor-lucan-tripod', 'C-5 Lucan’s tripod', stage('quest:cantor-the-weeping-willow', 'tripod'),
    'Lucan’s tripod, folded and left in the burned ring at the edge of the Willow’s shade, the cartwheel lens gone from its cradle. Tucked under the brass screw is a list in his neat Brightwatch hand: THINGS THAT WEEP. The Willow. The drowned choir (later). Everyone (eventually).',
    'cantor.lucan_list', 'A ring of burned grass at the edge of the Willow’s shade.',
    'At the bottom, underlined twice: A lens that never clouds. Promised. Collect at the top of the Twelve Stairs. And under that, much smaller, as if he hoped nobody would read it: sleep after.'),

  // ======================= ACT II, C-6 Celestine’s Lullaby: the answer
  {
    id: 'dialogue:cantor-reply-tobit', name: 'C-6 an answer for Celestine, by Tobit', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'Tobit is asleep again against the Radiance arch, with his satchel for a pillow and a daisy behind one ear that somebody else must have put there. You say his name. He sits bolt upright.', next: 'tobit' },
      tobit: {
        speaker: 'npc:tobit-lark-gate', text: 'I’m awake! Have you got an answer? I’ll take it back up the Dawn Road. I know all the good hedges now. What shall I tell her?',
        choices: [
          { text: '“The Abbess sleeps. Hold the Close. Sleep a third time; that’s an order.”', to: 'go', effects: [{ setFlag: 'cantor.reply', value: 'third' }] },
          { text: '(Sing him the lullaby back, with a second verse of your own, until he has it.)', to: 'go', effects: [{ setFlag: 'cantor.reply', value: 'verse' }] },
          { text: '“Compline. Every word. So she can sing it to herself.”', to: 'go', when: { insight: 'compline' }, effects: [{ setFlag: 'cantor.reply', value: 'compline' }] },
        ],
      },
      go: { speaker: 'npc:tobit-lark-gate', mood: 'happy', text: '(He says it back to you twice, gets it right the second time, and sets off through the Radiance arch at a march. Ten paces past it he lies down in the grass. Then he gets up, very firmly, and goes on.)', next: null },
    },
  },
  {
    id: 'dialogue:cantor-reply-lull', name: 'C-6 an answer for Celestine, by Madame Lull', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:dovina-lull-shore', text: 'An answer? Darling, of course. It goes at the bottom of a crate of draughts, under the chamomile. The Brightwatch never digs past the chamomile; they’re frightened of what they’ll find. What am I hiding?',
        choices: [
          { text: '“The Abbess sleeps. Hold the Close. Sleep a third time; that’s an order.”', to: 'go', effects: [{ setFlag: 'cantor.reply', value: 'third' }] },
          { text: '(Write out the lullaby, with a second verse of your own.)', to: 'go', effects: [{ setFlag: 'cantor.reply', value: 'verse' }] },
          { text: '“Compline. Every word. So she can sing it to herself.”', to: 'go', when: { insight: 'compline' }, effects: [{ setFlag: 'cantor.reply', value: 'compline' }] },
        ],
      },
      go: { speaker: 'npc:dovina-lull-shore', mood: 'happy', text: '(She folds it very small and tucks it under the chamomile.) It’ll be on her lectern by Lauds. If anyone asks, darling, it’s a receipt.', next: null },
    },
  },

  // ======================= ACT III, Compline at the Citadel: the candle, and who else heard
  {
    id: 'dialogue:obj-cantor-compline-candle', name: 'Compline at the Citadel: the candle', scope: 'party',
    entries: [
      { when: { all: [stage('quest:cantor-compline-at-the-citadel', 'candle'), { flag: 'cantor.candle', op: '==', value: 'kept' }] }, node: 'kept' },
      { when: stage('quest:cantor-compline-at-the-citadel', 'candle'), node: 'tallow' },
      { node: 'plain' },
    ],
    nodes: {
      tallow: { speaker: 'narrator', text: 'The camp stores run to one stub of tallow in a tin lid. The quartermaster hands it over with a look that says it was the last one. “Evensong,” you tell her. She looks up at the black sky over the Heart and decides not to ask which evening.', effects: [{ setFlag: 'cantor.compline_candle', value: 'tallow' }], next: null },
      kept: {
        speaker: 'narrator', text: 'There is a stub of tallow in the camp stores. There is also, in your pack, wrapped in a Brightwatch evidence label, the candle with L. B., C. 1012 scratched into its wax: the one that burned on the last night Dawnspire had.',
        choices: [
          { text: '(Take Lucan’s candle. It should finish the night it started.)', to: 'lucan', effects: [{ setFlag: 'cantor.compline_candle', value: 'lucan' }] },
          { text: '(Take the camp’s tallow. Lucan’s candle has been through enough.)', to: 'spare', effects: [{ setFlag: 'cantor.compline_candle', value: 'tallow' }] },
        ],
      },
      lucan: { speaker: 'narrator', text: 'You unwrap it. The wick is still bent where his mother pinched it out thirty years ago. It will light. It has been waiting to.', next: null },
      spare: { speaker: 'narrator', text: 'You leave Lucan’s candle wrapped, and take the tallow. Some things should be carried a while longer before anybody lights them.', next: null },
      plain: { speaker: 'narrator', text: 'The Heart camp’s stores: hard bread, bandages, and no candles to speak of.', next: null },
    },
  },
  {
    id: 'dialogue:obj-cantor-legion-compline', name: 'Compline at the Citadel: who else heard', scope: 'party',
    entries: [
      { when: { all: [stage('quest:cantor-compline-at-the-citadel', 'amen'), { flag: 'cantor.compline_candle', op: '==', value: 'lucan' }] }, node: 'lit' },
      { when: stage('quest:cantor-compline-at-the-citadel', 'amen'), node: 'start' },
      { node: 'plain' },
    ],
    nodes: {
      lit: { speaker: 'narrator', text: 'Lucan’s candle is in your pocket, pinched out at the amen as it should have been thirty years ago, and still warm. Down in the Legion camp, something has changed.', next: 'start' },
      start: { speaker: 'narrator', text: 'The hollowed have stopped standing in ranks. Here and there one has sat down, and then lain down, the way people lie down at the end of a day that went on far too long.', next: 'snore' },
      snore: { speaker: 'narrator', mood: 'happy', text: 'One of them is snoring: a great, wet, rattling snore. The hollowed either side of him wear the faces of people who have shared a dormitory before.', next: 'weep' },
      weep: {
        speaker: 'narrator', text: 'Nearer the middle an old woman of the Legion is weeping, the ordinary way, clear, and saying a name over and over: someone she lost thirty years ago and was never let grieve.',
        choices: [
          { text: '(Sit with her until she sleeps.)', to: 'sit', effects: [{ setFlag: 'cantor.legion_compline', value: 'sat' }] },
          { text: '(Sing the last verse again, quietly, for the whole camp.)', to: 'verse', school: 'radiance', effects: [{ setFlag: 'cantor.legion_compline', value: 'verse' }] },
        ],
      },
      sit: { speaker: 'narrator', text: 'You sit with her. She doesn’t know you, and it doesn’t matter. When she sleeps her hand is still holding your sleeve, and the black on her cheeks has run off into the dust and stayed there.', next: null },
      verse: { speaker: 'narrator', mood: 'sad', text: 'You sing the verse that goes down at the end, and all across the Legion camp heads go down with it. Celestine asked you to sing so that she could sleep. She was not the only one waiting.', next: null },
      plain: { speaker: 'narrator', text: 'The Legion camp, quieter than it was. Somebody is snoring.', next: null },
    },
  },

  // ======================= ACT III, The Brightwatch Recruits: the roll, and the loaves
  {
    id: 'dialogue:obj-cantor-recruits-roll', name: 'The Brightwatch Recruits: the roll-book', scope: 'party',
    entries: [{ when: stage('quest:cantor-the-brightwatch-recruits', 'roll'), node: 'book' }, { node: 'plain' }],
    nodes: {
      book: { speaker: 'narrator', text: 'The recruits stand in a line by the Heart camp’s fire, waiting. Their roll-book came out of the Legion in the youngest one’s tabard. Every name in it has a note beside it, in Lucan’s neat hand.', next: 'names' },
      names: { speaker: 'narrator', text: 'BEDE GORRINGE: tired. EDONY WICKHAM: very tired; her father, C. 1039. OSWY MARRABLE: has not slept since his sister. Not one note says brave, or zealous, or good with a lantern. He chose them for being tired.', next: 'call' },
      call: {
        speaker: 'narrator', text: 'They are waiting for their names.',
        choices: [
          { text: '(Call the roll the Brightwatch way: name, and “present”.)', to: 'present', effects: [{ setFlag: 'cantor.recruits_roll', value: 'present' }] },
          { text: '(Call each name, and then ask each of them who they lost.)', to: 'lost', effects: [{ setFlag: 'cantor.recruits_roll', value: 'lost' }] },
        ],
      },
      present: { speaker: 'narrator', text: 'You call it. “Present,” says each of them, and straightens, and is a little less hollow for having been counted. Oswy Marrable says “present”, and then, after a moment: “He picked me because I couldn’t sleep either.”', next: null },
      lost: { speaker: 'narrator', mood: 'sad', text: 'You call each name, and ask. It takes a long time. Edony Wickham says her father’s name aloud for the first time in three years and sits down on the ground, and Bede Gorringe sits down beside her without being told.', next: null },
      plain: { speaker: 'narrator', text: 'A Brightwatch roll-book, every name ticked.', next: null },
    },
  },
  {
    id: 'dialogue:obj-cantor-herald-loaves', name: 'The Brightwatch Recruits: the Herald’s loaves', scope: 'party',
    entries: [
      { when: { all: [stage('quest:cantor-the-brightwatch-recruits', 'loaves'), { flag: 'cantor.nemesis_fate', op: '==', value: 'spared' }] }, node: 'spared' },
      { when: { all: [stage('quest:cantor-the-brightwatch-recruits', 'loaves'), { flag: 'cantor.nemesis_fate', op: '==', value: 'destroyed' }] }, node: 'gone' },
      { when: stage('quest:cantor-the-brightwatch-recruits', 'loaves'), node: 'early' },
      { node: 'plain' },
    ],
    nodes: {
      spared: { speaker: 'narrator', text: 'The sack is at the head of the stair, and Lucan is asleep beside it with his head on his arm. You lift it as quietly as you can. Without waking he says, very clearly, “Two each. I always bring too many.”', next: 'carry' },
      gone: { speaker: 'narrator', mood: 'sad', text: 'The sack is at the head of the stair, beside a pair of smoked spectacles nobody has dared to move. Twelve white loaves, somehow still warm. He always brought too many. For once it is exactly enough.', next: 'carry' },
      early: { speaker: 'narrator', text: 'The sack sits at the head of the stair, in the glare where the Herald of Noon rings and rings. He does not stop you taking it. The loaves were always for whoever needed them; that much of him is still in there.', next: 'carry' },
      carry: { speaker: 'narrator', mood: 'happy', text: 'You carry the sack down the Twelve Stairs. The recruits eat standing in line until somebody tells them to sit, and then they sit and eat, and two of them fall asleep with the bread still in their hands.', effects: [{ setFlag: 'cantor.recruits_fed', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The head of the stair, with a ring of breadcrumbs on the top step.', next: null },
    },
  },

  // ======================= ACT III, Tobit Lark Falls Asleep: the good bit
  {
    id: 'dialogue:cantor-tobit-stairs', name: 'Tobit Lark Falls Asleep: the good bit', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'Tobit Lark is sitting on the top step of the Twelve Stairs with a camp blanket round his shoulders like a cope, looking out over the whole black Heart. He is awake. You can tell, because he isn’t humming.', next: 'good' },
      good: { speaker: 'npc:tobit-lark-heart', text: 'Is this the good bit? It looks like the good bit. I came up in my sleep. I do that. Once I sleepwalked into the Bell Loft and rang Terce, and everybody came.', next: 'why' },
      why: {
        speaker: 'npc:tobit-lark-heart', text: 'Can I tell you something? Mother Celestine didn’t send me. She said you’d be singing at the end of the world, and I thought somebody ought to sing you the amen. She says the amen is the important part. It’s where you’re allowed to stop.',
        choices: [
          { text: 'Then sing it, Tobit.', to: 'amen' },
          { text: 'You walked all this way to sing two notes?', to: 'way' },
        ],
      },
      way: { speaker: 'npc:tobit-lark-heart', mood: 'happy', text: 'And to sleep in a hedge again. But mostly the amen.', next: 'amen' },
      amen: { speaker: 'narrator', text: 'Tobit Lark stands up at the top of the Twelve Stairs, fifteen years old, in a borrowed blanket, and sings an amen, two notes long and perfectly in tune. It goes out over the Heart and does not come back. He sits down again, very pleased.', effects: [{ setFlag: 'cantor.tobit_amen', value: true }], next: 'end' },
      end: { speaker: 'npc:tobit-lark-heart', mood: 'happy', text: 'There. Now you’re allowed to stop, whenever you want to. (He yawns enormously.) Wake me for the next good bit.', next: null },
    },
  },
];

export default dialogues;
