/**
 * Hollow Crown, SHADE Act I depth pass (10-campaign-style.md §8, docs/PACING.md): the new stages' scenes,
 * investigation clues, travel banter, optional finds round the Veilwarrens and the third parts of the side quests.
 * The hero casts no shadow from I-1, so every scene here is written for someone who does not. Owner: Claude 4.
 */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const GM = 'npc:grey-mab' as const, IP = 'npc:isidore-pale' as const, MQ = 'npc:madam-quince' as const;
const WS = 'npc:wilhelmina-spool' as const, CG = 'npc:constance-gentle' as const;

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
  // ======================= I-1 The Bell on the Bridges: the note on the bunk
  {
    id: 'dialogue:obj-shade-bunk-note', name: 'I-1 the note on your bunk', scope: 'party',
    entries: [{ when: stage('quest:shade-the-bell-on-the-bridges', 'bunk'), node: 'bunk' }, { node: 'plain' }],
    nodes: {
      bunk: { speaker: 'narrator', text: 'Your bunk in the Veil hall: the blanket folded the way you never fold it, the pillow plumped. On the pillow, a scrap of ledger-paper, and on the paper, in your own handwriting, a note.', next: 'note' },
      note: {
        speaker: 'narrator', text: '“Sorry. Back soon. Don’t wait up. — Me.” Under it, drawn very quickly, a little figure with no shadow, waving.',
        choices: [
          { text: '(Turn it over.)', to: 'back' },
          { text: '(Screw it up and throw it at the wall.)', to: 'throw' },
          { text: '(Fold it up small and keep it.)', to: 'keep', effects: [{ setFlag: 'shade.note_kept', value: true }] },
        ],
      },
      back: { speaker: 'narrator', text: 'On the back, crossed out three times so hard the pen went through: “I’ve always wanted to go first.” Then, not crossed out at all: “You’ll understand. You always do, in the end. It’s very annoying.”', next: 'lamp' },
      throw: { speaker: 'narrator', text: 'It hits the wall and drops. The lantern by the door throws a shadow of the screwed-up paper on the boards, round and small. Yours would have thrown one too, flinging. Nothing does.', next: 'lamp' },
      keep: { speaker: 'narrator', text: 'You fold it in four and put it in the pocket where you keep the first coin you ever lifted. It is the only thing you own, now, that knows what you look like from behind.', next: 'lamp' },
      lamp: { speaker: 'narrator', text: 'Across the hall, Mab’s lamp is still burning. It burns until very late, and in the morning she says she slept like a stone, and nobody believes her.', next: null },
      plain: { speaker: 'narrator', text: 'Your bunk in the Veil hall.', next: null },
    },
  },
  {
    id: 'dialogue:area-shade-deeps-descent', name: 'I-2 banter: down into the Webbed Deeps', bark: true,
    entries: [{ when: stage('quest:shade-mabs-toll', 'spool'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'On the way down the ladders, every lantern you pass throws the shadows of the rungs across the wall, and the shadows of the people climbing up past you, and nothing for you at all. A small boy stops on his rung to stare, and his mother pulls him on without looking.', next: null } },
  },

  // ======================= I-2 Mab’s Toll: the black pools
  clue('shade-tear-pool-1', 'I-2 a black pool (1)', stage('quest:shade-mabs-toll', 'pools'),
    'A pool of black, no bigger than a dinner plate, on the boards outside a cutter’s tent. It is the exact shape of the shadow of a woman sitting on a stool. The stool is still there. The woman is inside, crying, and saying she does not know why.',
    'shade.pool_1', 'A dry dark stain on the boards outside a cutter’s tent.'),
  clue('shade-tear-pool-2', 'I-2 a black pool (2)', stage('quest:shade-mabs-toll', 'pools'),
    'Two pools side by side under a washing line: two children, holding hands. When you crouch to look, there is something floating in each one, very small, as if seen down a well: a skipping rope, a red ball.',
    'shade.pool_2', 'Two dark stains under a washing line.', 'Shadows keep what their people put down. When the shadows went, the keeping spilled.'),
  clue('shade-tear-pool-3', 'I-2 a black pool (3)', stage('quest:shade-mabs-toll', 'pools'),
    'The last pool is outside the oldest tent, the shadow of a bent old cutter with her shears in her hand. Old Oonagh Kittering, sitting in her doorway with a perfectly good shadow behind her, watches you look at it. “That’s not mine,” she says. “Mine’s here. That’s my sister’s. Sixty years she’s been dead, and her shadow stayed on with me, and now the bell’s rung, and it’s run out.”',
    'shade.pool_3', 'Outside the oldest tent, a dark stain the shape of a woman with shears.'),

  // ======================= I-5 Pasts for Sale: Isidore and Madam Quince first
  {
    id: 'dialogue:shade-isidore-canvass', name: 'I-5 Isidore Pale before the stall', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: IP, text: 'You’re Mab’s shadowless one. (He bows, carefully, as if you might be catching.) Isidore Pale, for the Keepers. I have followed that Cult stall down every ladder in the warrens, and I am too polite to rob it and too frightened to ask you to.', next: 'list' },
      list: {
        speaker: IP, text: 'I have the Keepers’ list. Every past cut out of Duskmere this year, with a name beside it. “A happy childhood.” That one is a glove-maker’s, on Linden Row. She has stopped smiling at children and cannot think why.',
        choices: [
          { text: 'And if the owners don’t want them back?', to: 'want' },
          { text: 'Why are you frightened of the Veil?', to: 'afraid' },
        ],
      },
      want: { speaker: IP, mood: 'sad', text: 'Then I have failed, and I go back up the ladders and tell the Mnemosarch so, and he looks at me the way he looks at a misfiled card. Most of them do not want them back, you know. They have got used to the hole. A hole is very easy to carry.', next: 'end' },
      afraid: { speaker: IP, text: 'Because when I was a boy in Duskmere the Veil lifted my father’s shadow and hid it from the tax-men, and kept it a year, and gave it back, and he was never quite the same after. He said it smelled of somebody else’s house. (He straightens his cuffs.) I am being unfair. They meant well.', next: 'end' },
      end: { speaker: IP, text: 'The stall opens when the moon is over the shaft. I shall be there, saying my piece. You will do whatever Mab says. Everyone does.', effects: [{ setFlag: 'shade.isidore_asked', value: true }], next: null },
    },
  },
  {
    id: 'dialogue:shade-quince-canvass', name: 'I-5 Madam Quince before the stall', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: MQ, text: '(She makes the bad-luck sign at your feet and gets on with polishing a teapot that is not hers.) That stall. Yes. Undercutting me. Thirty for a happy childhood. I couldn’t get thirty for a happy childhood in a good year.', next: 'fit' },
      fit: {
        speaker: MQ, text: 'Here’s the thing nobody tells them, dearie. A past is cut to fit one person. You put on somebody else’s and it pinches. They come to me after, wanting to sell it back. I give them two. They cry.',
        choices: [
          { text: 'Then why do you sell pasts at all?', to: 'why' },
          { text: 'You could tell the queue that.', to: 'tell' },
        ],
      },
      why: { speaker: MQ, text: 'I don’t. I sell names, and spoons, and the odd candlestick. Pasts I only buy back, from fools, so they’re off the street. (She sniffs.) Somebody has to. The Keepers never come down this far, except Pale, and Pale apologises to the ladders.', next: 'end' },
      tell: { speaker: MQ, mood: 'happy', text: 'Me? Tell people not to buy something? I’d be struck off. (She puts the teapot down.) But if somebody asks me, nice and loud, in front of everybody, I suppose I’d have to answer.', next: 'end' },
      end: { speaker: MQ, text: 'Go on. I’ll be at my stall, minding my own business, which is everybody’s.', effects: [{ setFlag: 'shade.quince_asked', value: true }], next: null },
    },
  },

  // ======================= I-7 Two of You: the Shadow’s parcel on the Dusk road
  {
    id: 'dialogue:obj-shade-shadow-parcel', name: 'I-7 the Shadow’s parcel at the Veil’s drop', scope: 'party',
    entries: [{ when: stage('quest:shade-two-of-you', 'parcel'), node: 'tree' }, { node: 'plain' }],
    nodes: {
      tree: { speaker: 'narrator', text: 'The Veil’s drop: a hollow oak halfway along the Dusk road, where the Veil leave what is too hot to carry home. Inside, wrapped in a cutter’s silk and tied with your own bootlace, a parcel addressed in your hand: “To the gate. To wait.”', next: 'open' },
      open: {
        speaker: 'narrator', text: 'Inside: the wooden spoon Mab used to rap your knuckles with. The first purse you ever lifted, still with its one copper. A drawing of the Veil hall, very bad, done when you were six. Everything you ever kept. Your Shadow kept it too.',
        choices: [
          { text: '(Take it all back.)', to: 'take', effects: [{ setFlag: 'shade.parcel', value: 'taken' }] },
          { text: '(Wrap it up again and leave it for the Shadow.)', to: 'leave', effects: [{ setFlag: 'shade.parcel', value: 'left' }] },
        ],
      },
      take: { speaker: 'narrator', text: 'You put them in your pack. The parcel is lighter, and so, somehow, are you, and you feel like a thief, which you are, but not usually to yourself.', next: 'note' },
      leave: { speaker: 'narrator', text: 'You tie the bootlace again, the way it was tied: badly, in your knot. If it means to go somewhere and be somebody, it should not have to go with nothing.', next: 'note' },
      note: { speaker: 'narrator', text: 'Tucked in the fold of the silk, a slip of ledger-paper in your hand: “For when I’m somebody. So I remember who I was first.” It has not occurred to it, you realise, that who it was first was you.', next: null },
      plain: { speaker: 'narrator', text: 'The Veil’s drop, a hollow oak on the Dusk road.', next: null },
    },
  },

  // ======================= I-9 Mab’s Last Lesson: crossing the moor
  {
    id: 'dialogue:area-shade-moor-path', name: 'I-9 banter: Mab on the moor', bark: true,
    entries: [{ when: { any: [stage('quest:shade-mabs-last-lesson', 'walk'), stage('quest:shade-mabs-last-lesson', 'regroup')] }, node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Mab stumps on a step ahead through the heather, complaining that it gets in her stockings and has no pockets. She does not look round. “Keep up, petal. If you fall behind I shan’t be able to tell, and I’ll have to keep stopping to check.”', next: null } },
  },

  // ======================= Side: Rope Toll (Fen Doyle’s bridge)
  {
    id: 'dialogue:obj-shade-fen-bridge', name: 'Rope Toll: Fen Doyle’s bridge', scope: 'party',
    entries: [
      { when: { all: [stage('quest:shade-rope-toll', 'fen'), { flag: 'shade.nettle', value: 'truce' }] }, node: 'truce' },
      { when: { all: [stage('quest:shade-rope-toll', 'fen'), { flag: 'shade.nettle', value: 'letters' }] }, node: 'letters' },
      { node: 'plain' },
    ],
    nodes: {
      truce: { speaker: 'narrator', text: 'Fen Doyle’s bridge, two crossings along. The goat-sized hole has been mended with planks of three different colours and a door. Fen Doyle, a boy of about eleven, is sitting on the door with a toll-box, sulking magnificently.', next: 'fen_t' },
      fen_t: { speaker: 'narrator', text: '“She made me put a door in. A DOOR. She says it’s her half. She says I have to say “Nettle’s half, mind the door” to everybody who crosses. (He scowls.) We’re making twice what we did. I hate it.”', next: null },
      letters: { speaker: 'narrator', text: 'Fen Doyle’s bridge, two crossings along, hole and all. Across the hole somebody has painted, in letters a foot high, still wet, very nearly straight: FEN DOYLE OWES NETTLE CROOK 6. Under it, smaller, with the N backwards: AND HIS HOLE IS RUBISH.', next: 'fen_l' },
      fen_l: { speaker: 'narrator', text: 'Fen Doyle, a boy of about eleven, is staring up at it. “She can write. When did she learn to write? (He looks at you, horrified.) Can you teach me? I can’t have her writing about me and me not able to write back.”', next: null },
      plain: { speaker: 'narrator', text: 'Fen Doyle’s bridge, two crossings along from Nettle’s.', next: null },
    },
  },

  // ======================= Side: the Puppet Show (the lost hero)
  {
    id: 'dialogue:obj-shade-hero-puppet', name: 'The Puppet Show: the lost hero', scope: 'party',
    entries: [{ when: stage('quest:shade-the-puppet-show', 'puppet'), node: 'find' }, { node: 'plain' }],
    nodes: {
      find: { speaker: 'narrator', text: 'On the third step of the Moonwell, tucked against the wall, a bundle in a handkerchief: Ludo’s hero puppet, chipped nose and all, with its little sword. Its shadow is lying on the step beside it, exactly where a hand set it down, very neatly.', next: 'tag' },
      tag: {
        speaker: 'narrator', text: 'Pinned to the handkerchief, a scrap of ledger-paper in your own handwriting: “Borrowed. Wanted to see what it was like to be the hero. It’s quite heavy. Sorry.”',
        choices: [
          { text: '(Take the puppet and its shadow back to Ludo.)', to: 'back' },
          { text: '(Keep the note.)', to: 'note', effects: [{ setFlag: 'shade.puppet_note', value: true }] },
        ],
      },
      note: { speaker: 'narrator', text: 'You pocket the note. Your Shadow writes exactly like you, except that it dots its i’s with little circles, which you gave up at nine because Mab laughed. It never gave them up.', next: 'back' },
      back: { speaker: 'npc:ludo-fingle', mood: 'happy', text: '(At the booth, holding it up to the lamp so it casts a shadow on the screen.) Oh, there you are. There you ARE. Look at that nose. (The puppet’s shadow takes a little bow on the screen, by itself.) Did it do that before? I don’t think it did that before.', next: null },
      plain: { speaker: 'narrator', text: 'The Moonwell steps.', next: null },
    },
  },

  // ======================= Side: Agnes in the Silk (the Cutter-Mother says sorry)
  {
    id: 'dialogue:shade-spool-sorry', name: 'Agnes in the Silk: the Cutter-Mother says sorry', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: WS, mood: 'angry', text: 'Sorry? To Agnes? Agnes went into the low silk on her own after I told her not to, and hung there three days out of spite, and now she wants an apology for it. (She cuts a yard of silk so hard the shears ring.)', next: 'owed' },
      owed: {
        speaker: WS, text: 'Well? Go on. Tell me what she’s owed. You’re going to anyway.',
        choices: [
          { text: 'She could hear you arguing whose turn it was. For three days.', to: 'heard' },
          { text: 'You came to look for her yourself. On the second night. I saw your marks in the silk.', to: 'marks', school: 'umbral' },
          { text: 'You’re not angry with Agnes. You were frightened.', to: 'afraid', trust: 1, trustNpc: WS },
        ],
      },
      heard: { speaker: WS, mood: 'sad', text: '(The shears stop.) She heard that? (A long breath.) We were arguing because nobody wanted to go down and find her dead. That’s what whose-turn means, in the Deeps. She’s not to know that. She’s twenty.', next: 'go' },
      marks: { speaker: WS, mood: 'sad', text: '(She looks at you very hard.) Nobody saw me. (A pause.) I got as far as the second web and my knees went. Forty years in the Deeps and my knees went. I never told a soul. Don’t you.', next: 'go' },
      afraid: { speaker: WS, mood: 'sad', text: '(She puts the shears down.) Course I was frightened. I’ve buried eleven cutters in forty years. I wasn’t going to make it twelve by sending another one in after her.', next: 'go' },
      go: { speaker: 'narrator', text: 'The Cutter-Mother wipes her hands on her apron, twice, and walks across the camp to Agnes’s tent, and goes in. The cutters stop cutting. After a while, from inside, both of them can be heard shouting, and then neither of them, and then the kettle.', next: null },
    },
  },

  // ======================= Side: Echoes for Sale (the whistle-post)
  {
    id: 'dialogue:obj-shade-whistle-post', name: 'Echoes for Sale: the whistle-post', scope: 'party',
    entries: [{ when: stage('quest:shade-echoes-for-sale', 'call'), node: 'post' }, { node: 'plain' }],
    nodes: {
      post: { speaker: 'narrator', text: 'The old whistle-post of the Deeps: an iron pipe in the rock, worn smooth by a hundred years of mouths. Put your ear to it and it gives back the last call blown into it, faint, over and over, the way a shell keeps the sea.', next: 'call' },
      call: {
        speaker: 'narrator', text: 'Come quick. Come quick. Come quick. A woman’s whistle, not very good at it, getting weaker. And then, very softly, between calls, a voice, not meaning to be heard: “Please. Anybody.”',
        choices: [
          { text: '(You know that voice. Agnes, three days in the silk.)', to: 'agnes', when: { questCompleted: 'quest:shade-agnes-in-the-silk' } },
          { text: '(Listen to the end.)', to: 'end' },
        ],
      },
      agnes: { speaker: 'narrator', text: 'Agnes Threadneedle. She whistled the long call from the low silk with her arms bound, and the quiet ate it on the way up, and nobody heard it but Silvan’s jar. She never told anyone she had called. She thought nobody came because nobody cared.', next: 'end' },
      end: { speaker: 'narrator', text: 'The call stops in the middle, bitten off, as the jar had it. It has been calling like that for weeks, waiting for an answer that never came. You put your mouth to the cold iron and give it the Veil’s two short notes: coming. Far down in the Deeps, the pipe goes quiet at last.', next: null },
      plain: { speaker: 'narrator', text: 'The old whistle-post of the Webbed Deeps.', next: null },
    },
  },

  // ======================= Side: A Fair Price (the drawer of names)
  {
    id: 'dialogue:obj-shade-quince-drawer', name: 'A Fair Price: Madam Quince’s drawer', scope: 'party',
    entries: [
      { when: { all: [stage('quest:shade-a-fair-price', 'drawer'), { flag: 'shade.quince', value: 'sold' }] }, node: 'sold' },
      { when: stage('quest:shade-a-fair-price', 'drawer'), node: 'drawer' },
      { node: 'plain' },
    ],
    nodes: {
      sold: { speaker: 'narrator', text: 'Madam Quince’s drawer, full of slips. Yours is on top, still crisp: your kept name, the one only Mab knows, in Quince’s hand, with 20 and then 40 beside it.', next: 'look' },
      drawer: { speaker: 'narrator', text: 'Madam Quince’s drawer, full of slips: hundreds of kept names, sold in hard winters, each with two prices beside it, the one she paid and the one she will take. Nobody, it seems, has ever bought one back.', next: 'look' },
      look: {
        speaker: 'narrator', text: 'Under the top layer, the slips are older, and the second price on them has been crossed out. Under that, the oldest ones, yellow and soft, have no second price at all. Just a word, in the same hand: KEPT.',
        choices: [
          { text: '(Read the oldest slip.)', to: 'old' },
          { text: '(Shut the drawer before she comes back.)', to: 'shut' },
        ],
      },
      old: { speaker: 'narrator', text: '“Mabyn.” Sold forty years ago by a girl just down from Duskmere with nothing in her pockets. Twenty shards. Second price: KEPT. Underlined twice.', next: 'quince' },
      shut: { speaker: 'narrator', text: 'You slide it shut. It sticks, and you have to lift it, and one of the oldest slips catches in the runner, face up: “Mabyn.” Twenty shards, forty years ago. Second price: KEPT.', next: 'quince' },
      quince: { speaker: MQ, text: '(Behind you, with the lamp.) Everybody looks. (She sets the lamp down.) I don’t sell the old ones. Never have. People think a fence is somebody who sells things. A good fence is somebody who knows what not to.', next: null },
      plain: { speaker: 'narrator', text: 'A drawer behind Madam Quince’s counter, shut.', next: null },
    },
  },

  {
    id: 'dialogue:shade-mab-mabyn', name: 'A Fair Price: Mab on the name in the drawer', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: GM, text: '(She does not look up from her seam.) You’ve been in Quince’s drawer. Everybody goes in Quince’s drawer. It’s how she finds out who’s honest: the honest ones put the slips back in order.', next: 'name' },
      name: {
        speaker: 'narrator', text: 'You say the name. Mab’s needle stops halfway through the cloth and stays there.',
        choices: [
          { text: 'You sold it.', to: 'sold' },
          { text: '(Say nothing. Sit down next to her.)', to: 'sit' },
        ],
      },
      sold: { speaker: GM, text: 'The night I came down the ladders, not young even then, with nothing in my pockets but a quarrel. Quince was hardly more than a girl, with a stall made of a door. Twenty shards. I ate for a fortnight on my own name.', next: 'year' },
      sit: { speaker: GM, mood: 'sad', text: '(After a while.) The night I came down the ladders, with nothing in my pockets but a quarrel. Quince gave me twenty shards for it, which was robbery, and fed me for a fortnight, which wasn’t.', next: 'year' },
      year: {
        speaker: GM, text: 'Every year since, Quince has offered it back at forty. Every year I hadn’t forty. Then one year I had, and I found I didn’t want it. It’s the name my sister called me. It’d only have wanted to go home.',
        choices: [
          { text: 'I could buy it back for you.', to: 'buy' },
          { text: 'Quince never sold it on. She wrote KEPT.', to: 'kept', trust: 1, trustNpc: GM },
        ],
      },
      buy: { speaker: GM, mood: 'angry', text: 'You will not. (She jabs the needle through.) A thing you put down on purpose isn’t lost, petal. It’s put down. You pick it up when you’ve somewhere to carry it to. I haven’t. Not yet.', next: 'end' },
      kept: { speaker: GM, mood: 'happy', text: '(She looks at you over her spectacles for a long moment.) Did she. The old cheat. Forty years. (She sniffs, hard.) Well. There’s one thing in the warrens that’s safe, then. Don’t you dare tell her I said so.', next: 'end' },
      end: { speaker: GM, text: 'Now. Hold this end, and don’t pull. And if you ever say that name out loud in this hall, I shall lift your shadow, and you haven’t got one, so think how hard I’ll have to try.', effects: [{ setFlag: 'shade.mabyn', value: true }], next: null },
    },
  },

  // ======================= Side: Seen from Below (Mam’s door)
  {
    id: 'dialogue:obj-shade-twins-door', name: 'Seen from Below: the green door', scope: 'party',
    entries: [{ when: stage('quest:shade-seen-from-below', 'mam'), node: 'door' }, { node: 'plain' }],
    nodes: {
      door: { speaker: 'narrator', text: 'The green door at the bottom of the Moonwell shaft, with a slate nailed to it: GONE TO WORK. BACK AT FIRST BELL. IF YOU ARE TWIG OR MOSS GO TO BED. On the step, a saucer with a candle-end in it, unlit.', next: 'pebble' },
      pebble: {
        speaker: 'narrator', text: 'Moss’s pebble from the moonrise rock is cold and pale and very slightly sparkly. Twig said Mam had never seen the moon either. She works the night shift at the Moonwell lamps, and sleeps in the day, and the shaft is too narrow for anything but a coin of it.',
        choices: [
          { text: '(Put the pebble in the saucer by the candle, and light it.)', to: 'light' },
          { text: '(Write on the slate, under her message.)', to: 'slate' },
        ],
      },
      light: { speaker: 'narrator', text: 'You light the candle-end. The pebble catches it and throws a tiny moon onto the green door, round and pale and shivering. When Mam comes home at first bell she will see it before she sees anything else.', next: null },
      slate: { speaker: 'narrator', text: 'Under GO TO BED you write: THEY DID. THEY SAW THE MOON FIRST. THIS IS FOR YOU. You set the pebble on the step where she will tread on it. She will pick it up, and look at it, and look up the shaft.', next: null },
      plain: { speaker: 'narrator', text: 'A green door at the bottom of the Moonwell shaft.', next: null },
    },
  },

  // ======================= Side: the Shepherd’s Shadow (the stone by the burn)
  {
    id: 'dialogue:obj-shade-bryn-shadow-mark', name: 'The Shepherd’s Shadow: the stone by the burn', scope: 'party',
    entries: [{ when: stage('quest:shade-the-shepherds-shadow', 'mark'), node: 'rock' }, { node: 'plain' }],
    nodes: {
      rock: { speaker: 'narrator', text: 'A flat rock by the burn on the high moor. In the soft ground leading up to it, a line of man-sized footprints, filled with dark, that come from Bryn’s fold and stop dead at the rock, as if whoever made them stepped off the world there.', next: 'stone' },
      stone: {
        speaker: 'narrator', text: 'There are loose stones in the burn. You find a flat one, and a sharper one to cut with.',
        choices: [
          { text: '(Carve it as Bryn asked: GOOD RIDDANCE, AND GOOD LUCK.)', to: 'carve' },
          { text: '(Carve it as Bryn asked, and add: COME BACK FOR TEA.)', to: 'tea', effects: [{ setFlag: 'shade.bryn_tea', value: true }] },
        ],
      },
      carve: { speaker: 'narrator', text: 'GOOD RIDDANCE, AND GOOD LUCK. It takes most of the evening. When you stand the stone up at the end of the footprints, the dark in the last print quivers, the way water does when something passes over it a long way up.', next: null },
      tea: { speaker: 'narrator', text: 'GOOD RIDDANCE, AND GOOD LUCK. COME BACK FOR TEA. When you tell him, Bryn laughs until he has to sit down on the wall, and then says, “Well, it might,” and puts an extra cup out, and goes on putting it out.', next: null },
      plain: { speaker: 'narrator', text: 'A flat rock by the burn on the high moor.', next: null },
    },
  },

  // ======================= Side: Cairn of the Unshadowed (Mab on the Unlisted)
  {
    id: 'dialogue:shade-mab-founder', name: 'Cairn of the Unshadowed: Mab on the Unlisted', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: GM, text: 'The Unlisted? Never heard of her. (She goes on unpicking a seam.) Bryn sent you, didn’t he. Bryn’s got too much moor and not enough to do with it.', next: 'her' },
      her: {
        speaker: 'narrator', text: 'You notice she said her.',
        choices: [
          { text: 'You said her.', to: 'said' },
          { text: '(Wait. Mab hates a silence more than a question.)', to: 'wait' },
        ],
      },
      said: { speaker: GM, mood: 'angry', text: 'I did not. (She did.) Oh, rot it. You lift purses with those ears.', next: 'tell' },
      wait: { speaker: GM, mood: 'angry', text: '(The silence goes on for some time. Mab’s needle goes faster and faster.) Oh, all right. All right. You’re worse than Hushweb.', next: 'tell' },
      tell: { speaker: GM, text: 'Every Thief-mother is told it by the last one, and swears not to tell. The Concord counted people by their shadows, for the tax. When the first of us lost hers, the census men struck her off the roll. No shadow, no person. Unlisted.', next: 'name' },
      name: {
        speaker: GM, text: 'So she took them at their word. Somebody who wasn’t on any list walked into the counting-house, and walked out with the roll, and hid two hundred families from the tax that winter, and none of it could be put down to anyone. That’s the Veil. That’s what we were for.',
        choices: [
          { text: 'And her real name?', to: 'real' },
          { text: 'Then I’m unlisted too.', to: 'count', trust: 1, trustNpc: GM },
        ],
      },
      real: { speaker: GM, text: 'The Unlisted. That was her real name. She chose it. The one she was born with she gave away, and the Veil’s never asked for it back. (She bites the thread.) Some things you put down on purpose, petal.', next: null },
      count: { speaker: GM, mood: 'happy', text: '(She looks at you over the seam for a long moment.) Yes. You are. Mind you use it for something better than avoiding your chores.', next: null },
    },
  },

  // ======================= Optional areas (Claude 2): finds round the Veilwarrens
  {
    id: 'dialogue:obj-umbral-frontier-ruin-find', name: 'Veilwarrens ruin: the counting-house', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'A roofless stone building half sunk in the warren rock: the Concord’s old counting-house. Over the door, carved: EVERY SHADOW A SOUL, EVERY SOUL A SHARE. Inside, the shelves where the rolls were kept are empty. On the floor somebody has painted, very neatly, a person-shaped outline with nothing in it.', effects: [{ unlockLore: 'lore:hc-umbral-frontier-ruin' }], next: null } },
  },
  {
    id: 'dialogue:obj-umbral-frontier-cave-find', name: 'Veilwarrens cave: the hiding-hole', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'A low cave behind a fall of silk, its walls lined with little iron hooks, hundreds of them, in rows. On a few still hangs a scrap of dark cloth that is not cloth: an old lifted shadow, forgotten, gone thin as cobweb. They stir when you come in, all together, the way a room of sleepers turns over.', effects: [{ unlockLore: 'lore:hc-umbral-frontier-cave' }], next: null } },
  },
  {
    id: 'dialogue:obj-umbral-frontier-cave-codex', name: 'Veilwarrens cave: the hook-tally', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'Chalked on the cave wall, a tally: rows of names, and against each a hook number and two dates, IN and OUT. Every line has its OUT except the last seven, in a cramped old hand, from the year the crown fell. Below them: “Families didn’t come back for these. Keep them anyway. — G. G.”', effects: [{ unlockLore: 'lore:hc-umbral-frontier-tally' }], next: null } },
  },
  {
    id: 'dialogue:obj-umbral-frontier-view-find', name: 'Veilwarrens viewpoint: the Top Rung', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'The top rung of the highest ladder in the warrens, where the rock opens onto sky. Below, the whole Veilwarrens: bridges strung across the dark like washing, a thousand lanterns, a thousand shadows swinging on the walls. One gap in all of them, where you are standing.', effects: [{ unlockLore: 'lore:hc-umbral-frontier-view' }], next: null } },
  },
  // ======================= ACT II, C-1 The Drowned Rat: the hiding-hole under the back room
  {
    id: 'dialogue:obj-shade-rat-hiding-hole', name: 'C-1 the hiding-hole under the Drowned Rat', scope: 'party',
    entries: [{ when: stage('quest:shade-the-drowned-rat', 'room'), node: 'hole' }, { node: 'plain' }],
    nodes: {
      hole: { speaker: 'narrator', text: 'Constance lifts two floorboards with a knife and there it is: a cellar the size of a wardrobe, lined with hooks like the Hiding-Hole at home. On the hooks, a christening gown. A soldier’s letters tied with string. A child’s shoe. Everything somebody on the Morvane Road asked the Veil to keep safe.', next: 'label' },
      label: {
        speaker: CG, text: '(Holding the lamp down for you.) Thirty years since the arches shut, and the Rat’s been the Veil this side of them. We can’t lift shadows. Never learned. So we keep the next best thing. People come back for them. Mostly.',
        choices: [
          { text: 'What about the ones nobody comes back for?', to: 'nobody' },
          { text: '(Read the tag on the child’s shoe.)', to: 'shoe' },
        ],
      },
      nobody: { speaker: CG, mood: 'sad', text: 'We keep them anyway. That’s the oath, isn’t it? Give it back warm. Grizel Gall came over the gate road to teach us that, the last year it was open. (She drops the boards back.) Mab never wrote. We assumed it was manners.', next: null },
      shoe: { speaker: 'narrator', text: 'A brown paper tag in a careful hand: “Lorcan’s first shoe. Keep till he asks.” Constance takes it out of your fingers, gently, and hangs it back up. “My brother,” she says. “He won’t ask now. Not without his shadow.”', effects: [{ setFlag: 'shade.lorcan_shoe', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'Two loose floorboards in the back room of the Drowned Rat.', next: null },
    },
  },

  // ======================= ACT II, C-2 The Spinner’s Silk: escorting Constance, what she saw
  {
    id: 'dialogue:area-shade-root-caves', name: 'C-2 banter: Constance under the roots', bark: true,
    entries: [{ when: { any: [stage('quest:shade-the-spinners-silk', 'escort'), stage('quest:shade-the-spinners-silk', 'regroup')] }, node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Constance picks her way down through the root-caves with a lamp in one hand and a marked card in the other, for luck. “Mind the left fork,” she says. “Lorcan went down the left fork once on a dare. He came back with a beard of cobweb and wouldn’t say what he saw. I gave him a lot of trouble about it.”', next: null } },
  },
  {
    id: 'dialogue:shade-constance-web', name: 'C-2 Constance at the edge of the web', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: CG, text: '(At the edge of the web, her lamp turned low.) Twenty-two. I counted them running. That’s Hobb’s twenty-two, every one of them gone home up the root-caves to Brindlecross. (She swallows.) The big one with the pipe. The one that lifted its hat to you.', next: 'lorcan' },
      lorcan: {
        speaker: CG, mood: 'sad', text: 'That was Lorcan’s. Thirty-eight years old and he still lifts his hat to strangers. It ran straight past me. Didn’t know me. Why would it? It was looking for him.',
        choices: [
          { text: 'Then it’ll find him, Constance.', to: 'find' },
          { text: 'You came all this way for a shadow that didn’t know you.', to: 'came', trust: 1, trustNpc: CG },
        ],
      },
      find: { speaker: CG, text: 'It will. Shadows always go to their own. That’s the one thing about them you can trust. (She wipes her face on her sleeve, briskly.) There are more down there. The web goes on down. I’m not going further. That’s for you.', next: 'down' },
      came: { speaker: CG, mood: 'happy', text: '(A short laugh.) I did, didn’t I. Mab would say I’ve gone soft this side of the arches. Mab would be right. (She wipes her face on her sleeve, briskly.) There are more down there. That’s for you.', next: 'down' },
      down: { speaker: CG, text: 'Whatever is spinning that web has been at it a long time, cousin. It wove the Concord’s records. It’ll know where yours went. Mind its legs. It has a lot of them, and it knows where every one is.', next: null },
    },
  },

  // ======================= ACT II, C-3 The Spinner Below: telling Constance
  {
    id: 'dialogue:shade-constance-tell', name: 'C-3 Constance hears the web is down', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: CG, text: '(The back room of the Rat. She is dealing a hand of patience and losing on purpose.) Well? You’ve cobweb in your hair and a thread round your finger. Sit. Tell it in order. The cousins like things in order.', next: 'tell' },
      tell: {
        speaker: 'narrator', text: 'You tell her: the Spinner, the web of records, the mark, and the grey thread round your finger that pulls towards Stag’s Rest and beyond it, to the Heart.',
        choices: [
          { text: 'It gave me a thread of my shadow. It’s pulling south.', to: 'south' },
          { text: 'Lorcan’s shadow will be home by now.', to: 'lorcan', when: { flag: 'shade.lorcan_shoe' } },
        ],
      },
      lorcan: { speaker: CG, mood: 'happy', text: 'It is. He came in at noon. Sat down at that table, ordered a pint, and lifted his hat to the barmaid twice, which he hasn’t done since the Bell. (She turns a card.) He asked for his first shoe. I gave it him. He doesn’t know why he wanted it.', next: 'south' },
      south: { speaker: CG, text: 'South is the Gloamwood, and Stag’s Rest, where the big willow is. Folk on the road have been seeing a figure in a hood walking that way, alone, who casts nothing on the ground. They thought it was you. (She looks at you.) It isn’t, is it?', next: 'end' },
      end: { speaker: CG, text: 'Go on, then. The Rat will keep your seat warm. That’s the oath.', next: null },
    },
  },

  // ======================= ACT II, C-4 The Shadow at Stag’s Rest: the Shadow’s camp
  ...[
    'A fire-ring of stones by the stream at Stag’s Rest, built badly, too close to the water: the way you always build them, and Mab always kicks apart. The ashes are cold. Somebody has sat beside them with their knees drawn up, for a long time.',
    'A scrap of ledger-paper pinned under a stone, in your handwriting, a list headed THINGS TO SAY. “Thank you, Mab.” “I was frightened on the bridge.” “I didn’t mean it about the goose.” Each one ticked off, as if it had been practised aloud.',
  ].map((text, i): DialogueDef => clue(`shade-shadow-camp-${i + 1}`, `C-4 your Shadow’s camp (${i + 1})`, stage('quest:shade-the-shadow-at-stags-rest', 'camp'),
    text, `shade.camp_${i + 1}`, 'A cold camp by the stream at Stag’s Rest.')),
  {
    id: 'dialogue:obj-shade-shadow-camp-3', name: 'C-4 your Shadow’s camp (3): the lantern', scope: 'party',
    entries: [{ when: stage('quest:shade-the-shadow-at-stags-rest', 'camp'), node: 'lantern' }, { node: 'plain' }],
    nodes: {
      lantern: {
        speaker: 'narrator', text: 'A Veil lantern hung on a low branch, still burning, turned down to a bead. As you lift it, its light swings across the willow trunks, and on the nearest trunk, for one moment, a shadow the shape of you stands with its head on one side, listening for your footsteps. Then it is not there.',
        effects: [{ setFlag: 'shade.listening_pose', value: 'listen' }, { setFlag: 'shade.listening', value: 'obj:shade-shadow-camp-3' }, { setFlag: 'shade.camp_3', value: true }],
        choices: [
          { text: '(Turn the lantern up, so it can see you’re here.)', to: 'up' },
          { text: '(Blow it out. It left it lit for you to find.)', to: 'out' },
        ],
      },
      up: { speaker: 'narrator', text: 'The light grows. Beyond the trunks, under the great Willow, something stops moving to look. Two tall wet figures turn their heads too. You have been seen, and so, at last, has it.', next: null },
      out: { speaker: 'narrator', text: 'You pinch the wick. In the dark the stream is very loud, and the Willow is weeping, steadily, and under the weeping you can just hear a voice, very like yours, practising the first thing on its list.', next: null },
      plain: { speaker: 'narrator', text: 'A Veil lantern on a low branch at Stag’s Rest.', next: null },
    },
  },

  // ======================= ACT II, C-5 The Weeping Willow: what was left between the roots
  {
    id: 'dialogue:obj-shade-willow-roots', name: 'C-5 between the Willow’s roots', scope: 'party',
    entries: [
      { when: { all: [stage('quest:shade-the-weeping-willow', 'roots'), { flag: 'shade.parcel', value: 'left' }] }, node: 'parcel' },
      { when: stage('quest:shade-the-weeping-willow', 'roots'), node: 'silk' },
      { node: 'plain' },
    ],
    nodes: {
      parcel: { speaker: 'narrator', text: 'Between the Willow’s roots, in the dry hollow where the shade was deepest: a parcel in cutter’s silk, tied with your own bootlace in your own bad knot. The one you left at the Veil’s drop on the Dusk road, for it. It carried it all the way here.', next: 'open' },
      open: {
        speaker: 'narrator', text: 'Mab’s wooden spoon. The first purse, with its one copper. The drawing of the Veil hall. And a new thing, on top: the Herald’s robe pin, the first one the tailors put in, pulled out again and laid down neatly. It did not take your things into the Heart. It left them where you would find them.',
        choices: [
          { text: '(Keep the pin with the rest.)', to: 'keep', effects: [{ setFlag: 'shade.robe_pin', value: true }] },
          { text: '(Leave the pin, and take only what was yours.)', to: 'leave' },
        ],
      },
      keep: { speaker: 'narrator', text: 'A pin of black glass, cold as a tear. You put it in with the spoon and the purse. If you meet it at the top of the stairs, you will have something of its own to give back.', next: null },
      leave: { speaker: 'narrator', text: 'You leave the pin in the hollow. The rest you put in your pack. The Willow, quiet now, lets a single green leaf fall on the place where it was, which is more than most trees would do.', next: null },
      silk: { speaker: 'narrator', text: 'Between the Willow’s roots, in the dry hollow where the shade was deepest: a square of cutter’s silk, folded, and on it the first pin from the Herald’s robe, pulled out again and laid down neatly, the way you lay down a thing you have decided against. It changed its mind once, at least.', next: 'silk2' },
      silk2: {
        speaker: 'narrator', text: 'A pin of black glass, cold as a tear.',
        choices: [
          { text: '(Keep it.)', to: 'keep', effects: [{ setFlag: 'shade.robe_pin', value: true }] },
          { text: '(Leave it for the Willow.)', to: 'leave' },
        ],
      },
      plain: { speaker: 'narrator', text: 'A dry hollow between the Willow’s roots.', next: null },
    },
  },

  // ======================= ACT II, C-6 A Parcel from Mab: the reply
  {
    id: 'dialogue:obj-shade-reply-to-mab', name: 'C-6 a reply for Mab', scope: 'party',
    entries: [{ when: stage('quest:shade-a-parcel-from-mab', 'reply'), node: 'bridge' }, { node: 'plain' }],
    nodes: {
      bridge: { speaker: 'narrator', text: 'Nettle is sitting in the middle of the toll-free bridge with a slate on her knees, charging nobody, very loudly. She has drawn a toll-box on the slate, and a bridge, and a very cross face, and she holds it out to you with the chalk. “Go on. Mab’s answer. I’ll carry it. One copper.”', next: 'write' },
      write: {
        speaker: 'narrator', text: 'There is room on the slate for about six words.',
        choices: [
          { text: '“Got the hood. Coming home. Warm.”', to: 'sent', effects: [{ setFlag: 'shade.reply', value: 'warm' }] },
          { text: '“It’s gone in. I’m going after it.”', to: 'sent', effects: [{ setFlag: 'shade.reply', value: 'after' }] },
          { text: '“Your shadow says hello. Crossly.”', to: 'sent', when: { flag: 'shade.mab_shadow' }, effects: [{ setFlag: 'shade.reply', value: 'shadow' }] },
          { text: '(Draw the Veil’s mark, a hood and a key, and nothing else.)', to: 'mark', school: 'umbral', effects: [{ setFlag: 'shade.reply', value: 'mark' }] },
        ],
      },
      mark: { speaker: 'narrator', text: 'Nettle looks at it with deep respect: the best message, it turns out, has no letters in it at all. “She’ll know that,” she says. “That’s the safe-house sign. That means somebody’s holding the door.”', next: 'sent' },
      sent: { speaker: 'npc:nettle-crook-gate', mood: 'happy', text: '(She wraps the slate in her shawl and tucks it under her arm.) No charge. That was a good one. (She stands up on the bridge.) I’m going home in the morning. Don’t you dare get killed in that Heart. I’ve only just learned your name, and it took ages.', next: null },
      plain: { speaker: 'narrator', text: 'The toll-free bridge, with a chalked complaint on its rail.', next: null },
    },
  },

  // ======================= ACT III, Send Mab’s Shadow Home: the chalk on the stair, the thread home
  {
    id: 'dialogue:obj-shade-stair-chalk', name: 'Send Mab’s Shadow Home: the Veil’s chalk on the stair', scope: 'party',
    entries: [{ when: stage('quest:shade-send-mabs-shadow-home', 'chalk'), node: 'chalk' }, { node: 'plain' }],
    nodes: {
      chalk: { speaker: 'narrator', text: 'On the riser of the ninth step of the Umbral stair, faint as breath, the Veil’s chalk-sign: a hood and a key. Safe this way. Someone has been holding the door. Under it, older still, a row of the same sign, one for every Turning the Veil came to, washed nearly away.', next: 'fresh' },
      fresh: {
        speaker: 'narrator', text: 'The newest one is fresh, the chalk still crumbling, drawn in a hand you know because it is yours. Your Shadow came up this stair before you, and as it went, it left you the safe-house sign.',
        choices: [
          { text: '(Put your hand flat on it.)', to: 'hand' },
          { text: '(Draw the answering mark beside it: the key, without the hood. Coming.)', to: 'answer', school: 'umbral', effects: [{ setFlag: 'shade.chalk_answered', value: true }] },
        ],
      },
      hand: { speaker: 'narrator', text: 'It comes off on your palm, grey, and does not quite feel like chalk. It feels like the inside of a hood, in the warrens, on a cold night, with somebody you trust holding the other end of the rope.', next: 'up' },
      answer: { speaker: 'narrator', text: 'You chalk the key beside the hood: coming. The Veil’s oldest conversation. Above you on the stair, very faintly, as if from the top of a long ladder, something stops climbing to listen.', next: 'up' },
      up: { speaker: 'narrator', text: 'The signs go on up, a step apart, to the head of the stair, where the Veil’s old banner hangs.', next: null },
      plain: { speaker: 'narrator', text: 'The Veil’s chalk-signs on the Umbral stair, a hood and a key.', next: null },
    },
  },
  {
    id: 'dialogue:obj-shade-thread-home', name: 'Send Mab’s Shadow Home: one more thing along the thread', scope: 'party',
    entries: [{ when: stage('quest:shade-send-mabs-shadow-home', 'thread'), node: 'thread' }, { node: 'plain' }],
    nodes: {
      thread: { speaker: 'narrator', text: 'At the Heart camp the Spinner’s grey thread runs off the tent-pole where you tied it, out over the camp fire, away across the dark towards Morvane and the gate road and the Veilwarrens, humming. It will carry one more thing, if it is small.', next: 'tie' },
      tie: {
        speaker: 'narrator', text: 'What do you send her?',
        choices: [
          { text: '(The lock-pick from your hood. She will know you got in.)', to: 'pick', effects: [{ setFlag: 'shade.thread_gift', value: 'pick' }] },
          { text: '(A copper from the first purse you ever lifted. Toll paid.)', to: 'copper', effects: [{ setFlag: 'shade.thread_gift', value: 'copper' }] },
          { text: '(A note: “Mabyn. Kept.”)', to: 'name', when: { flag: 'shade.mabyn' }, effects: [{ setFlag: 'shade.thread_gift', value: 'name' }] },
        ],
      },
      pick: { speaker: 'narrator', text: 'You knot the pick to the thread. It goes off along it into the dark, turning and glinting, like a very small thief on a very long bridge. Mab will find it on her pillow and say “Hm,” and keep it in her apron for the rest of her life.', next: 'end' },
      copper: { speaker: 'narrator', text: 'You knot the copper to the thread. It goes off along it into the dark, spinning. Toll paid, Mab. One copper. The first one. You always owed it her; she always said so.', next: 'end' },
      name: { speaker: 'narrator', text: 'You fold the note very small and knot it on. It goes off along the thread into the dark, a little white speck. In a nest with two loose boards, somebody very old is going to read one word in your handwriting and sit down rather suddenly.', next: 'end' },
      end: { speaker: 'narrator', text: 'The thread hums a while, and then goes slack, and lies down along the ground like a shadow at evening, pointing home.', next: null },
      plain: { speaker: 'narrator', text: 'A grey thread tied to a tent-pole at the Heart camp, slack now.', next: null },
    },
  },

  // ======================= ACT III, the Weeping Shades: the small one at the edge of the light
  {
    id: 'dialogue:obj-shade-small-shadow', name: 'The Weeping Shades: the small one', scope: 'party',
    entries: [
      { when: { all: [stage('quest:shade-the-weeping-shades', 'small'), { flag: 'shade.twins_pebble' }] }, node: 'moss' },
      { when: stage('quest:shade-the-weeping-shades', 'small'), node: 'small' },
      { node: 'plain' },
    ],
    nodes: {
      moss: { speaker: 'narrator', text: 'A small shadow sitting by the supply crates at the edge of the lantern-light, a child of seven or so, holding the shadow of a pebble in both hands as if it were the moon. You know that grip. Moss held a pebble like that, all the way down the long ladder from the moors.', next: 'moss2' },
      moss2: {
        speaker: 'narrator', text: 'Moss, who never talks. This is the shadow that did her talking for her, the way a shadow does on a wall when a child is too shy: waving, pointing, pulling faces. The Bell called it all the way here. It has nobody to talk for.',
        choices: [
          { text: '(Tug the Spinner’s thread: short, short, long. Home.)', to: 'home' },
          { text: '(Sit beside it, and tell it about the green door, and the pebble, and Mam.)', to: 'tell', effects: [{ setFlag: 'shade.moss_shadow', value: true }] },
        ],
      },
      tell: { speaker: 'narrator', text: 'You tell it: the moonrise, the pebble, the green door at the bottom of the shaft, and Mam coming home to it at first bell. The shadow listens with its head on one side. Then it stands up, puts its pebble carefully on the ground by your boot, and goes.', next: 'gone' },
      home: { speaker: 'narrator', text: 'Short, short, long. It looks up at once, the way Moss looks up when her name is called and she pretends it wasn’t. Then it stands, tucks its pebble under its arm, and goes off along the ground, home, at a run.', next: 'gone' },
      gone: { speaker: 'narrator', mood: 'happy', text: 'Far away, at the bottom of the Moonwell, a small girl in bed is going to sit up and wave at the wall, and the wall is going to wave back, and Twig will say she is making it up, and she will not answer, and she will not need to.', next: null },
      small: { speaker: 'narrator', text: 'A small shadow sitting by the supply crates at the edge of the lantern-light, a child of seven or so, holding the shadow of a pebble in both hands as if it were the moon. When you crouch down it does not run. It holds the pebble out to you to look at.', next: 'small2' },
      small2: {
        speaker: 'narrator', text: 'A moon-pebble, from the rock on the Stalker Moors. Somebody in the Veilwarrens has a child who went up the long ladder once to see the moon properly, and came down with her shadow still holding on to it.',
        choices: [
          { text: '(Tug the Spinner’s thread: short, short, long. Home.)', to: 'home' },
          { text: '(Admire the pebble properly. It deserves it.)', to: 'admire' },
        ],
      },
      admire: { speaker: 'narrator', text: 'You hold the shadow of the pebble up to the lantern and turn it this way and that and say it is the best pebble you have ever seen. The shadow is enormously pleased. Then it takes the pebble back, and stands, and goes off along the ground, home.', next: null },
      plain: { speaker: 'narrator', text: 'The edge of the lantern-light by the supply crates, empty now.', next: null },
    },
  },

];

export default dialogues;
