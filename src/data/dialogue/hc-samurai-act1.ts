/**
 * Hollow Crown, SAMURAI Act I main dialogues (the Hushpine Terraces). Kanemori speaks only single words; each one
 * he spends is counted in samurai.kanemori_words (the journal word-counter). Owner: Claude 4.
 */
import type { DialogueDef, NarrativeEffect } from '@/core';

const HK = 'npc:haru-kanemori' as const, IS = 'npc:ikeda-shun' as const, FS = 'npc:fumiko-sora' as const;
/** Kanemori spends a word */
const WORD: NarrativeEffect = { addFlag: 'samurai.kanemori_words', amount: 1 };

const dialogues: DialogueDef[] = [
  // ---------- I-1 The Bell in the Pines
  {
    id: 'dialogue:samurai-vigil-night', name: 'I-1 the night vigil', scope: 'party',
    entries: [{ node: 'vigil' }],
    nodes: {
      vigil: { speaker: 'narrator', text: 'A night vigil on the Hushpine Temple Road. A year of silence: no word spoken, no foot set down louder than snow. You have learned to hear the pines breathe. You have learned to hear your own heart, and to wish you couldn’t.', next: 'bell' },
      bell: { speaker: 'narrator', text: 'Somewhere very far away a bell rings once. Every pine on the mountain lets go of every needle at the same moment, and they come down round you like brown rain, hissing.', next: 'song' },
      song: { speaker: 'narrator', text: 'In your chest something begins to sing. It is the first loud thing you have heard in a year, and it is so loud you nearly speak. Down the road, through the falling needles, Revenants are walking up towards the temple with their swords drawn.', next: null },
    },
  },
  {
    id: 'dialogue:samurai-kanemori-bell', name: 'I-1 Kanemori on the steps', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'narrator', text: 'Sensei Haru Kanemori, abbot of Hushpine, stands at the top of the temple steps with his hands in his sleeves and pine needles in his hair. He has spoken eleven words this year. He looks at the glow in your chest for a long time.',
        choices: [
          { text: '(Say nothing.)', to: 'come', trust: 1, trustNpc: HK },
          { text: 'Sensei, something is singing in me.', to: 'speak' },
        ],
      },
      speak: { speaker: 'narrator', text: 'Your voice is enormous on the silent mountain. A crow leaves a tree in a hurry. Kanemori does not frown. He does not need to.', next: 'come' },
      come: { speaker: HK, text: 'Come.', effects: [{ setFlag: 'samurai.kanemori_words', value: 12 }], next: 'cell' },
      cell: { speaker: 'narrator', text: 'His twelfth word of the year. He turns, and does not go into his cell. He goes up the Temple Road, into the dark and the falling needles, towards the Lantern Shrine, without looking back to see whether you are following. You are.', next: null },
    },
  },
  // ---------- I-2 Tea Before Steel
  {
    id: 'dialogue:obj-hushpine-dojo-1', name: 'I-2 the first dojo yard',
    entries: [{ when: { questStage: 'quest:samurai-tea-before-steel', stage: 'tea' }, node: 'now' }, { node: 'after' }],
    nodes: {
      now: { speaker: 'narrator', text: 'The first dojo yard. Raked gravel, practice posts, and nobody. A novice’s sandals are lined up neatly by the gate, as if their owner meant to come straight back. You leave the tea on the step to go cold.', next: null },
      after: { speaker: 'narrator', text: 'An empty dojo yard, raked.', next: null },
    },
  },
  {
    id: 'dialogue:obj-hushpine-dojo-2', name: 'I-2 the second dojo yard',
    entries: [{ when: { questStage: 'quest:samurai-tea-before-steel', stage: 'tea' }, node: 'now' }, { node: 'after' }],
    nodes: {
      now: { speaker: 'narrator', text: 'The second yard is empty, and on the wall, in a novice’s best brush-hand, a notice that should not be there: “Gone to the Camps. The Ronin pay in silver. Sorry, Sensei.” The ink has run.', next: null },
      after: { speaker: 'narrator', text: 'An empty dojo yard, and an apology on the wall.', next: null },
    },
  },
  {
    id: 'dialogue:obj-hushpine-dojo-3', name: 'I-2 the third dojo yard',
    entries: [{ when: { questStage: 'quest:samurai-tea-before-steel', stage: 'tea' }, node: 'now' }, { node: 'after' }],
    nodes: {
      now: { speaker: 'narrator', text: 'The third yard is empty. Below it the tea-terraces step down the mountain, and the water in their channels is running dark. The tea-bushes nearest the channel are curling at the leaf, black at the edges, like burnt paper.', next: null },
      after: { speaker: 'narrator', text: 'An empty dojo yard above the tea-terraces.', next: null },
    },
  },
  {
    id: 'dialogue:obj-hushpine-dojo-4', name: 'I-2 the fourth dojo yard',
    entries: [{ when: { questStage: 'quest:samurai-tea-before-steel', stage: 'tea' }, node: 'now' }, { node: 'after' }],
    nodes: {
      now: { speaker: 'narrator', text: 'The fourth yard is empty but for a cat asleep on the instructor’s mat. It opens one eye, considers your tea, and closes the eye again. It too has taken a vow of silence, apparently.', next: null },
      after: { speaker: 'narrator', text: 'An empty dojo yard, and a cat.', next: null },
    },
  },
  {
    id: 'dialogue:obj-hushpine-dojo-5', name: 'I-2 the fifth dojo yard',
    entries: [{ when: { questStage: 'quest:samurai-tea-before-steel', stage: 'tea' }, node: 'now' }, { node: 'after' }],
    nodes: {
      now: { speaker: 'narrator', text: 'In the fifth yard, one small boy is practising cuts against a post, alone, in perfect silence, frowning hard. He stops when he sees you, bows very low, takes the tea in both hands and drinks it in one go. Then he goes back to his post.', next: null },
      after: { speaker: 'narrator', text: 'The fifth dojo yard. Somebody is still practising here.', next: null },
    },
  },
  {
    id: 'dialogue:samurai-kanemori-gone', name: 'I-2 the cold cups', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'narrator', text: 'You set the tray down in front of Kanemori: four cold cups, and one empty one. He looks at them for a long time.',
        choices: [
          { text: '(Say nothing.)', to: 'gone', trust: 1, trustNpc: HK },
          { text: 'The novices have gone to the Ronin Camps. And the channels are running black.', to: 'tell' },
        ],
      },
      tell: { speaker: 'narrator', text: 'He nods once, as if you have told him something he already knew and hoped was not true.', next: 'gone' },
      gone: { speaker: HK, mood: 'sad', text: 'Gone.', effects: [WORD], next: 'camps' },
      camps: { speaker: 'narrator', text: 'Then he raises one hand and points, down the mountain, to the valley where the smoke of the Ronin Camps hangs. And from somewhere down there, very faintly, a man is shouting.', next: null },
    },
  },
  // ---------- I-3 The Ronin Fort
  {
    id: 'dialogue:obj-ronin-fort-stockade', name: 'I-3 the press-ganged pilgrims', scope: 'party',
    entries: [{ when: { questStage: 'quest:samurai-the-ronin-fort', stage: 'pilgrims' }, node: 'rope' }, { node: 'after' }],
    nodes: {
      rope: {
        speaker: 'narrator', text: 'A dozen pilgrims roped together in the stockade yard, still in their travelling hats. Not one of them made a sound the whole time they were held. They look at you, and at the rope, and wait.',
        choices: [
          { text: '(Cut the rope, and say nothing.)', to: 'cut' },
          { text: 'You’re free. Go home.', to: 'speak' },
        ],
      },
      cut: { speaker: 'narrator', text: 'One cut. The rope falls. The pilgrims bow to you, all together, and walk out of the gate in single file, back up to the Temple Road, as quiet as they came.', next: null },
      speak: { speaker: 'narrator', text: 'They flinch at the sound of your voice, then smile, and bow, and file out of the gate back up to the Temple Road. One of them mouths “thank you”, very carefully, without breath.', next: null },
      after: { speaker: 'narrator', text: 'An empty stockade yard, and a cut rope.', next: null },
    },
  },
  {
    id: 'dialogue:samurai-kanemori-good', name: 'I-3 report on the Captain', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'narrator', text: 'Kanemori is sweeping his step. He stops, and looks at you: at the bruises, at the sword, at the dust of the Camps on your hem.',
        choices: [
          { text: '(Bow.)', to: 'good' },
          { text: 'He was very loud, Sensei.', to: 'loud' },
        ],
      },
      loud: { speaker: 'narrator', text: 'The corner of Kanemori’s mouth moves, very slightly, for about the length of a breath.', next: 'good' },
      good: { speaker: HK, text: 'Good.', effects: [WORD], next: 'ikeda' },
      ikeda: { speaker: 'narrator', text: 'He goes back to sweeping. On the step beside him lies a folded paper with a red seal on it, a rider’s sash tied round it. A Ronin seal. Somebody in the Camps would like to meet you.', next: null },
    },
  },
  // ---------- I-4 The Lord of No Master
  {
    id: 'dialogue:samurai-ikeda-pavilion', name: 'I-4 meeting Ikeda', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: IS, mood: 'happy', text: 'There you are. Come in, sit, the cushions are good, I stole them from a lord. Ikeda Shun. You beat my captain. Thank you. He served me badly. He shouted at pilgrims. I don’t like shouting. Drink?',
        choices: [
          { text: '(Say nothing. Take the cup.)', to: 'cup' },
          { text: 'You’re not angry?', to: 'angry' },
        ],
      },
      cup: { speaker: IS, text: 'Ha! A Hushpine novice. I could tell by the knees. Kanemori teaches you to sit like a rock and hear everything. Good. Hear this, then.', next: 'free' },
      angry: { speaker: IS, text: 'Angry? He was press-ganging pilgrims for the General. I’d have done it myself, only I was busy. Drink.', next: 'free' },
      free: { speaker: IS, text: 'The pilgrims are free. Your novices down in the Camps are paid fairly now, in silver, by me, and nobody shouts at them. A sword should serve no one. Not a lord, not a marshal, not an abbot. Serve no one, as I do.', next: 'hand' },
      hand: {
        speaker: 'narrator', text: 'He is honest, and generous, and very easy to like. He pours the wine with his left hand. His right hand rests on the hilt of his sword the whole time, and never once leaves it.',
        choices: [
          { text: '(Notice that he has no sheath.)', to: 'sheath', effects: [{ setFlag: 'samurai.no_sheath_noticed', value: true }] },
          { text: 'Then whom does your sword serve?', to: 'serve' },
        ],
      },
      sheath: { speaker: 'narrator', text: 'His sword hangs bare from a ring at his belt. There is no sheath for it at all. He sees you see, and smiles, and refills your cup.', next: 'serve' },
      serve: { speaker: IS, mood: 'happy', text: 'Itself. The only honest master. Come and see me again, novice. And tell Kanemori… no. Tell him nothing. He likes nothing.', next: null },
    },
  },
  // ---------- I-5 The Call to Muster (faction choice; a party vote)
  {
    id: 'dialogue:samurai-call-to-muster', name: 'I-5 the Elders’ Yard', scope: 'party',
    entries: [{ when: { not: { flag: 'samurai.oath' } }, node: 'yard' }, { node: 'after' }],
    nodes: {
      yard: { speaker: 'narrator', text: 'The Elders’ Yard: six old elders on six old mats, and behind them the novices who have come back up from the Camps, standing very straight. At the gate, leaning on a post with a cup of wine, Lord Ikeda smiles at everybody.', next: 'call' },
      call: { speaker: FS, text: '(Elder Fumiko Sora speaks, which in this yard is like a bell.) The Thousand-Edge General calls every blade in Steelvale to the Edge Gate. A sword answers its realm’s marshal. That is the oath. The Order will march.', next: 'ikeda' },
      ikeda: { speaker: IS, text: 'Or it won’t. My Companies serve nobody, and nobody serves us. Cut your topknots, novices, and come down to the Camps, and nobody will ever call you to a muster again.', next: 'floor' },
      floor: {
        speaker: 'narrator', text: 'Every face in the yard turns to you: the elders, the novices, Ikeda at the gate. Before anyone can choose, someone may still be heard.',
        choices: [
          { text: '(Look at Kenta, at the back of the novices.)', to: 'kenta' },
          { text: '(Look at Ikeda, and wait for him to say more.)', to: 'more' },
          { text: '(Say nothing. Let the yard be quiet a moment.)', to: 'quiet', trust: 1, trustNpc: HK },
        ],
      },
      kenta: { speaker: 'npc:kenta', text: '(He goes scarlet, and steps forward, and whispers, which in this yard carries like a shout:) I just want everyone to come home. The ones who went down. That’s all. (He steps back very fast.)', next: 'kanemori' },
      more: { speaker: IS, mood: 'happy', text: '(He raises his cup to you.) You see? You want to hear me. Everybody does, in the end. I’m the only one on this mountain who says what he means. (Elder Sora does not look at him. Kanemori does.)', next: 'kanemori' },
      quiet: { speaker: 'narrator', text: 'You stand in the middle of the yard and say nothing at all. The silence spreads out from you like rings on a pond, until even Ikeda stops smiling and the pines can be heard breathing again.', next: 'kanemori' },
      kanemori: { speaker: HK, text: 'Choose.', effects: [WORD], next: 'choose' },
      choose: {
        speaker: FS, text: 'Kanemori has given you his word. Whom does a sword serve?',
        choices: [
          { text: 'Its realm. We answer the muster.', to: 'answer', quest: true, effects: [{ setFlag: 'samurai.oath', value: 'answered' }] },
          { text: 'No one. Cut the oath.', to: 'cut', quest: true, trustNpc: HK, trust: -1, effects: [{ setFlag: 'samurai.oath', value: 'cut' }] },
          { text: '(Lay your sword before the elders, sheathed. Then point to the pilgrims’ road.)', to: 'sheath', quest: true, insight: 'samurai_served_the_sheath', when: { insight: 'samurai_sheath' }, effects: [{ setFlag: 'samurai.oath', value: 'sheathed' }] },
        ],
      },
      answer: { speaker: 'narrator', text: 'The novices bow to the elders and go down the mountain to the Edge Gate in a long silent line. At the gate, Ikeda laughs, not unkindly, and raises his cup to you. “The General’s dog,” he says. “Well. Somebody has to be.”', next: null },
      cut: { speaker: 'narrator', text: 'One by one, the novices draw their swords and cut off their own topknots and drop them in the gravel. The elders do not move. Ikeda is delighted. Kanemori looks at you, once, and then looks away.', next: null },
      sheath: { speaker: 'narrator', text: 'You lay your sword before the elders, still in its sheath, and point to the pilgrims’ road. The novices understand before the elders do. They take their swords, sheathed, and go and stand along the road, guarding it. At the gate, Ikeda has gone very quiet.', next: 'sheath2' },
      sheath2: { speaker: FS, text: '(Very softly.) The sheath, not the edge. We used to say that. I had forgotten we used to say that.', next: null },
      after: { speaker: FS, text: 'It is decided. The yard is quiet again.', next: null },
    },
  },
  // ---------- I-6 The Sheathed Blade
  {
    id: 'dialogue:samurai-shrine', name: 'I-6 into the Shrine of the Sheathed Blade', scope: 'party',
    entries: [
      { when: { flag: 'samurai.oath', value: 'cut' }, node: 'cut' },
      { when: { flag: 'samurai.oath', value: 'sheathed' }, node: 'sheathed' },
      { node: 'answered' },
    ],
    nodes: {
      answered: { speaker: 'narrator', text: 'The elders sent a novice to fetch the shrine’s old blessing for the march, and the novice broke the seal by accident. The novice is sitting outside in the shallows, crying, very quietly.', next: 'spirit' },
      cut: { speaker: 'narrator', text: 'Ikeda’s Ronin went to loot the shrine for the Companies. The seal is cut clean through, a sword-cut. Whoever did it ran.', next: 'spirit' },
      sheathed: { speaker: 'narrator', text: 'The novices went to the shrine to lay their sheathed swords before it, and found the seal already broken, from the inside.', next: 'spirit' },
      spirit: { speaker: 'narrator', text: 'In the dark of the shrine, a sword turns in the air by itself, with nothing holding it, cutting and cutting at nothing. It has never been put away. It does not know how. Its edge drips black.', next: null },
    },
  },
  {
    id: 'dialogue:obj-shrine-empty-sheath', name: 'I-6 the empty sheath', scope: 'party',
    entries: [{ when: { questStage: 'quest:samurai-the-sheathed-blade', stage: 'sheath' }, node: 'sheath' }, { node: 'after' }],
    nodes: {
      sheath: { speaker: 'narrator', text: 'On the shrine’s altar, beside the place where the Unsheathed now rests, lies a second sheath: old lacquer, black and red, plain and very fine. It is empty. Its sword was taken from it thirty years ago, and never brought back.', next: 'carved' },
      carved: {
        speaker: 'narrator', text: 'Carved small inside the mouth of the sheath, where only the blade would ever touch it: a student’s name, and his teacher’s. KANEMORI. SHUN.',
        choices: [
          { text: '(Take the empty sheath.)', to: 'take', effects: [{ setFlag: 'samurai.sheath_taken', value: true }] },
          { text: '(Leave it on the altar.)', to: 'leave' },
        ],
      },
      take: { speaker: 'narrator', text: 'You wrap it in your sleeve and carry it with you. It weighs almost nothing. It feels as if it is waiting.', next: null },
      leave: { speaker: 'narrator', text: 'You leave it where it lies, on the altar of a shrine with its seal broken, waiting for a sword that is somewhere out in the world.', next: null },
      after: { speaker: 'narrator', text: 'The Shrine of the Sheathed Blade, quiet now.', next: null },
    },
  },
  // ---------- I-7 A Blade with No Master
  {
    id: 'dialogue:samurai-ikeda-reveal', name: 'I-7 Ikeda on the Temple Road', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: IS, mood: 'happy', text: 'Novice! You’ve been cutting up my dancers. They don’t mind. There’s nobody in them to mind. I gave them the tears, you know, and the tears took the dancers out and left the swords. Swords with no masters. Aren’t they lovely?',
        choices: [
          { text: 'You talk a great deal on a silent road.', to: 'talk' },
          { text: 'You have no sheath, and your hand has never once left the hilt.', to: 'bare', insight: 'samurai_bare_blade', when: { any: [{ flag: 'samurai.no_sheath_noticed' }, { questCompleted: 'quest:samurai-the-whetstone-stall' }] } },
        ],
      },
      talk: { speaker: IS, text: 'Silence is a kind of obedience. I don’t do obedience. Listen.', next: 'want' },
      bare: { speaker: IS, mood: 'angry', text: '(The smile stays, but the eyes do not.) A sheath is a cage. A hand on the hilt is a hand that is free. I took my sword out of its sheath thirty years ago, and I have never once put it back.', next: 'want' },
      want: {
        speaker: IS, text: 'The Terrace half is up in the High Terrace shrine. I’ll set it in myself. Then I’m the blade, and nobody holds me. Not the General, not Kanemori, not the Hollow King, if he’s out there. A sword with no master, that serves no one, forever.',
        choices: [
          { text: 'A sword with no master just cuts.', to: 'cuts' },
          { text: '(Say nothing.)', to: 'silent' },
        ],
      },
      cuts: { speaker: IS, mood: 'happy', text: 'Yes! Exactly! Finally somebody understands!', next: 'go' },
      silent: { speaker: IS, mood: 'sad', text: '(He looks at you for a long time.) You have his silence. I could never learn it. He said I was too loud inside. He was right.', next: 'go' },
      go: { speaker: IS, text: 'Come up to the High Terrace, novice, and stop me if you can. Bring your sheath. You’ll want somewhere to put your sword when I’ve finished with it.', next: null },
    },
  },
  // ---------- I-8 The High Terrace
  {
    id: 'dialogue:obj-blade-frontier-halfstone', name: 'I-8 the Terrace half', scope: 'party',
    entries: [{ when: { questStage: 'quest:samurai-the-high-terrace', stage: 'stone' }, node: 'claim' }, { node: 'shrine' }],
    nodes: {
      claim: { speaker: 'narrator', text: 'In the High Terrace shrine, above the clouds, on a stand made for a sword, lies half of a crystal, cracked clean across, singing. It is the only sound in the whole sky. It is warm in your hand, the way a hand is warm.', next: 'cloud' },
      cloud: { speaker: 'narrator', text: 'All round the terrace the cloud stirs, and parts, and for the first time in thirty years you can see down the whole mountain at once: the shrine, the Terraces, the Camps, the Shallows, and the Temple Road winding through bare pines.', next: 'vision' },
      vision: { speaker: 'narrator', text: 'For a moment you are not on the mountain. You stand on a hill at night in a ring of twelve stones, each singing its own note, round a crown that nobody is wearing. Then the ring cracks, all at once, without a sound, and the song breaks.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'You are back on the High Terrace with the half-stone in your hand. The stand where it lay was made for a sword. It is empty now.',
        choices: [
          { text: '(Lay your own sword on the stand, sheathed, for a moment.)', to: 'lay' },
          { text: '(Sit, and listen to the stone sing, until you can hear the pines under it.)', to: 'listen' },
          { text: '“Where is your other half?”', to: 'other' },
        ],
      },
      lay: { speaker: 'narrator', text: 'Your sheathed sword fits the stand exactly, as if the stand had been waiting for something that knew how to rest. The half-stone hums, approving. You take the sword back. It feels lighter.', next: 'ikeda' },
      listen: { speaker: 'narrator', text: 'You sit. The stone sings. Slowly, under its song, you begin to hear the mountain again: a bird, the wind in bare branches, very far down, Old Gama’s choir. It is the first time silence has felt like company in a year.', next: 'ikeda' },
      other: { speaker: 'narrator', text: 'It hums, clear and high, and you know without knowing how that the other half is west, under a fencing hall full of lamps, waiting for a swordsman with terrible feet to carry it home.', next: 'ikeda' },
      ikeda: { speaker: IS, mood: 'happy', text: '(From below the edge of the terrace, out of the cloud, his voice, falling away.) Keep it sharp for me, novice! I’ll be with the General’s muster, at the Edge Gate! Everybody goes through the gate in the end!', next: 'after' },
      after: { speaker: 'narrator', text: 'Then nothing. The cloud closes over the place where he fell, smooth as a sheet drawn over a bed, and the High Terrace is the quietest place in the world again.', next: null },
      shrine: { speaker: 'narrator', text: 'The High Terrace shrine, and an empty stand made for a sword.', next: null },
    },
  },
  // ---------- I-9 The Pilgrim Road Down (mentor farewell; trust check)
  {
    id: 'dialogue:samurai-kanemori-farewell', name: 'I-9 Kanemori’s farewell', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'narrator', text: 'Kanemori sits on the top step of the pilgrim road with his hands in his sleeves, looking down the mountain to where the road disappears into the pines. He moves over, a little, to make room.',
        effects: [{ setFlag: 'samurai.kanemori_farewell', value: true }],
        choices: [
          { text: '(Sit beside him. Say nothing.)', to: 'gift', trust: 1, trustNpc: HK },
          { text: 'Come with me, Sensei.', to: 'stay' },
        ],
      },
      stay: { speaker: 'narrator', text: 'He shakes his head, once, and looks back at the temple: at the novices, the pilgrims, the empty yards, the tea. Someone has to keep it quiet enough to hear.', next: 'gift' },
      gift: {
        speaker: 'narrator', text: 'After a while he takes something from beside him and holds it out.',
        choices: [
          { text: '(Take it in both hands.)', to: 'hat', when: { trust: HK, value: 'friendly' } },
          { text: '(Bow.)', to: 'bow', when: { not: { trust: HK, value: 'friendly' } } },
        ],
      },
      hat: { speaker: HK, text: 'Yours.', effects: [WORD, { giveItem: 'a_kanemori_hat' }, { setFlag: 'samurai.kanemori_hat', value: true }], next: 'hat2' },
      hat2: { speaker: 'narrator', text: 'His straw hat, the one he has worn on the Temple Road for forty years, mended at the brim in three places. He puts it on your head himself, and ties it, and looks at you under it.', next: 'more' },
      more: {
        speaker: 'narrator', text: 'He opens his mouth, and closes it, and opens it again.',
        choices: [
          { text: '(Wait for as long as it takes.)', to: 'sentence', when: { trust: HK, value: 'trusted' } },
          { text: '(Wait.)', to: 'end', when: { not: { trust: HK, value: 'trusted' } } },
        ],
      },
      sentence: {
        speaker: HK, text: 'A sword serves whoever it protects. Go and protect someone.',
        effects: [{ addFlag: 'samurai.kanemori_words', amount: 10 }, { setFlag: 'samurai.kanemori_sentence', value: true }], next: 'after',
      },
      after: { speaker: 'narrator', text: 'Ten words, all at once, to you: more than he has said in one breath in all the years you have known him. He looks surprised at himself, and then, for the first time you can remember, he smiles all the way.', next: 'end' },
      bow: { speaker: 'narrator', text: 'He returns the bow, exactly as deep. Then he looks down the road, and so do you.', next: null },
      end: { speaker: 'narrator', text: 'He nods at the road. You go down it. When you look back from the first bend, he is still there, and he raises one hand.', next: null },
    },
  },
  // ---------- I-10 the novices at the Edge Gate
  {
    id: 'dialogue:samurai-edge-gate-novices', name: 'I-10 the novices at the Edge Gate', scope: 'party',
    entries: [
      { when: { flag: 'samurai.oath', value: 'cut' }, node: 'cut' },
      { when: { flag: 'samurai.oath', value: 'sheathed' }, node: 'sheathed' },
      { node: 'answered' },
    ],
    nodes: {
      answered: { speaker: 'narrator', text: 'The General’s muster fills the road before the gate: a thousand swords turned outward. In its ranks, in their grey robes, stand the Hushpine novices who answered him. As you come down the road, one by one, without a word, they lower their swords.', next: null },
      cut: { speaker: 'narrator', text: 'The General’s muster fills the road before the gate. Out of the pines on either side, topknots cut, come the novices who refused it. They do not speak. They take the flanks, and wait for you.', next: null },
      sheathed: { speaker: 'narrator', text: 'The General’s muster fills the road before the gate. Behind you, on the pilgrims’ road, the novices stand in a line with their swords sheathed, guarding the pilgrims who have come down to watch. Nobody will pass them. Nobody will need to.', next: null },
    },
  },
];

export default dialogues;
