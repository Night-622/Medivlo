/** Hollow Crown, SWORDSMAN Act I main dialogues (Edgewater). Owner: Claude 4. */
import type { DialogueDef } from '@/core';

const LF = 'npc:lucia-ferro' as const, AV = 'npc:auguste-vellacourt' as const, CB = 'npc:cosimo-bracca' as const;
const STRIKE = 'quest:swordsman-strike-them-off' as const;
const CH = { questStage: STRIKE, stage: 'challenges' };

const dialogues: DialogueDef[] = [
  // ---------- I-1 The Bell on the Ladder
  {
    id: 'dialogue:swordsman-bell-night', name: 'I-1 the Bell rings over the Ladder', scope: 'party',
    entries: [{ node: 'square' }],
    nodes: {
      square: { speaker: 'narrator', text: 'Midnight in the Fencing Quarter, under the great Ladder board, lamps on poles and a small bored crowd. A challenge for rung 212: you, against a lanky duellist from rung 211 who has been waiting since supper. Salute. En garde.', next: 'bell' },
      bell: { speaker: 'narrator', text: 'Somewhere very far away a bell rings once. Every blade in Edgewater hums the same note at the same moment, and both your swords stop dead in the air, a hand apart, as if they had both remembered something.', next: 'song' },
      song: { speaker: 'narrator', text: 'In your chest something has begun to sing, clean and bright as a struck blade. Then the old duel-graves round the square crack open, and the dead climb out with their swords already drawn. Your opponent from rung 211 says something very rude and runs.', next: null },
    },
  },
  {
    id: 'dialogue:swordsman-ferro-bell', name: 'I-1 Ferro hauls you out', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: LF, text: 'Feet! Your FEET. You fence like a heron in a high wind. (She lets go of your collar.) Lucia Ferro. You know who I am. Everyone in this Quarter knows who I am and pretends they don’t.',
        choices: [
          { text: 'Maestra Ferro. The champion who quit.', to: 'quit' },
          { text: 'Something in my chest is singing.', to: 'sing' },
        ],
      },
      quit: { speaker: LF, text: 'The champion who retired. There is a difference, and I will thank you to learn it. Now. The singing.', next: 'sing' },
      sing: {
        speaker: LF, text: 'I heard it from across the square. Half of the Blade Stone lies under the Fencing Hall. It fell there when the crown broke. Every swordsman in Edgewater has walked over it for thirty years, and it never sang for one of them.',
        choices: [
          { text: 'Why me?', to: 'why' },
          { text: 'What do I do?', to: 'do' },
        ],
      },
      why: { speaker: LF, text: 'Gods know. Your feet are terrible. Perhaps it likes a challenge.', next: 'do' },
      do: {
        speaker: LF, text: 'Not here. Not with the dead coming up out of the cobbles. You come to my salle, now, by the back alleys, and I teach you one useful thing before morning, and tomorrow you do me a favour. Agreed?',
        choices: [
          { text: 'Agreed, Maestra.', to: 'end', trust: 1 },
          { text: 'What favour?', to: 'favour' },
        ],
      },
      favour: { speaker: LF, text: 'The Ladder board is a disgrace. Half the challenges on it are older than the people fighting them. You are going to strike some off. Agreed?', next: 'end' },
      end: { speaker: LF, text: 'Good. And stop saluting the dead. They don’t notice, and it puts you off your feet.', next: null },
    },
  },
  // ---------- I-2 Strike Them Off (five old challenges)
  {
    id: 'dialogue:obj-ladder-challenge-1', name: 'I-2 challenge one',
    entries: [{ when: CH, node: 'now' }, { node: 'after' }],
    nodes: {
      now: {
        speaker: 'narrator', text: 'Rung 1,880 challenges rung 1,879, “for the matter of the goose”. Both duellists are here, both seventy, neither can remember the goose.',
        choices: [{ text: 'Ask them if anyone still minds about the goose.', to: 'goose' }, { text: '[Blade] Referee it: one touch, and done.', to: 'touch', school: 'blade' }],
      },
      goose: { speaker: 'narrator', text: 'They think about it. Nobody minds about the goose. They shake hands, a little confused, and go for a drink. You rub out the chalk.', next: null },
      touch: { speaker: 'narrator', text: 'One touch, to rung 1,879. Rung 1,880 bows and says the goose was his anyway. You rub out the chalk.', next: null },
      after: { speaker: 'narrator', text: 'A smudge on the Ladder board where a challenge used to be.', next: null },
    },
  },
  {
    id: 'dialogue:obj-ladder-challenge-2', name: 'I-2 challenge two',
    entries: [{ when: CH, node: 'now' }, { node: 'after' }],
    nodes: {
      now: {
        speaker: 'narrator', text: 'A challenge from the Salle Brunetti to the Salle Orsi, made by their founders in C. 940. Two young fencers have been sent to fight it, and they are very obviously in love with each other.',
        choices: [{ text: 'Tell them to go and get married instead.', to: 'wed' }, { text: 'Let them fence it.', to: 'fence' }],
      },
      wed: { speaker: 'narrator', text: 'They go scarlet, and then they go, together. Somewhere a hundred years of salle feud is quietly dying of embarrassment. You rub out the chalk.', next: null },
      fence: { speaker: 'narrator', text: 'They fence it beautifully, and both miss on purpose for twenty minutes, and then they go off together anyway. You rub out the chalk.', next: null },
      after: { speaker: 'narrator', text: 'A smudge on the Ladder board where a challenge used to be.', next: null },
    },
  },
  {
    id: 'dialogue:obj-ladder-challenge-3', name: 'I-2 the duel of C. 1013', scope: 'party',
    entries: [{ when: CH, node: 'now' }, { node: 'after' }],
    nodes: {
      now: { speaker: 'narrator', text: 'Under this challenge, dated C. 1013, a Duelist Revenant is still fencing, all alone, against an empty patch of air. Beside it sits a tired middle-aged man with a sandwich.', next: 'matteo' },
      matteo: {
        speaker: 'narrator', text: '“Matteo Corvo,” says the man. “That’s Ser Gianni Pozzo. He was fighting my grandfather. My grandfather died in his bed in C. 1020. Pozzo didn’t. I come down and sit with him on Tuesdays. Can you make it stop?”',
        choices: [
          { text: '(Step into the grandfather’s place, and take the touch.)', to: 'take' },
          { text: '(Step in, and lower your sword.)', to: 'lower' },
          { text: '[Blade] (Salute the end of the duel.)', to: 'salute', school: 'blade' },
        ],
      },
      take: { speaker: 'narrator', text: 'Pozzo’s blade touches your shoulder, light as a fingertip. He freezes. Then he salutes, and puts his sword down, and lies down on the cobbles, and is still. Matteo finishes his sandwich, and cries a little.', next: null },
      lower: { speaker: 'narrator', text: 'You stand where the grandfather stood and let your point drop. Pozzo stops. He looks at you for a long moment, as if trying to remember what comes next. Then he lowers his sword too, and lies down. Matteo says thank you, three times.', next: null },
      salute: { speaker: 'narrator', text: 'You raise your blade to your face and sweep it down, the salute at the end of a bout. Pozzo returns it, perfectly. Then he lies down on the cobbles like a man going to bed. Matteo stands up, and shakes your hand, and goes home early.', next: null },
      after: { speaker: 'narrator', text: 'An old smudge on the Ladder board. Someone has left a sandwich crust beside it.', next: null },
    },
  },
  {
    id: 'dialogue:obj-ladder-challenge-4', name: 'I-2 challenge four',
    entries: [{ when: CH, node: 'now' }, { node: 'after' }],
    nodes: {
      now: {
        speaker: 'narrator', text: 'A challenge chalked by a duellist against himself, “for cowardice”. He is here, a young man with a bandaged arm, and he looks as if he would very much like someone to fight him so he doesn’t have to.',
        choices: [{ text: 'Being afraid isn’t a crime. Strike it off.', to: 'off' }, { text: 'Fence him, gently.', to: 'gently' }],
      },
      off: { speaker: 'narrator', text: 'He looks at you for a long time. Then he picks up the chalk-cloth and rubs it out himself, slowly. His hand is shaking. He looks better.', next: null },
      gently: { speaker: 'narrator', text: 'You fence him slowly and let him win. He knows. He laughs anyway, and rubs out the chalk himself.', next: null },
      after: { speaker: 'narrator', text: 'A smudge on the Ladder board where a challenge used to be.', next: null },
    },
  },
  {
    id: 'dialogue:obj-ladder-challenge-5', name: 'I-2 challenge five',
    entries: [{ when: CH, node: 'now' }, { node: 'after' }],
    nodes: {
      now: { speaker: 'narrator', text: 'The oldest challenge on the whole board, in chalk gone yellow: rung 1 challenges rung 2. Both have been dead for a hundred years. You rub at it, and it will not come off. Under your hand the chalk has begun to weep. It runs down the board in black lines, like tears down a face.', next: null },
      after: { speaker: 'narrator', text: 'The oldest challenge on the Ladder, weeping black.', next: null },
    },
  },
  {
    id: 'dialogue:swordsman-ferro-chalk', name: 'I-2 report on the board', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: LF, text: 'Five off the board in one day. The Quarter will be furious. It will be the most interesting thing that has happened here in years. Why the face?',
        choices: [
          { text: 'The chalk was weeping black.', to: 'black' },
          { text: 'Nobody wanted those duels. They just couldn’t stop.', to: 'stop', insight: 'swordsman_cannot_stop' },
          { text: 'The black runs across the square and down under the Fencing Hall.', to: 'hall', when: { flag: 'swordsman.chalk_hall' } },
        ],
      },
      hall: { speaker: LF, mood: 'afraid', text: 'Under the Hall. (She puts her cup down.) Then it’s going to the stone. All the tears of the Quarter, running to the one thing in Edgewater that still knows how a bout should end. As if they wanted to drown it.', next: 'black' },
      stop: { speaker: LF, mood: 'sad', text: 'No. They can’t. In Edgewater a duel doesn’t end when it’s won. The loser challenges again, and their children after them. It wasn’t always like this. Once, a win was a win.', next: 'black' },
      black: { speaker: LF, mood: 'afraid', text: 'Black. On the Ladder itself. (She is quiet a moment.) Then it’s here. Not just in the Revenants. In the Ladder.', next: 'saint' },
      saint: { speaker: LF, text: 'And there is worse. Duellists keep going down under the oldest bridge to challenge the Sword Saint in his tomb. They don’t come up again. Not as themselves. Go and see. Keep your feet.', next: null },
    },
  },
  // ---------- I-3 The Saint's Tomb
  {
    id: 'dialogue:obj-sword-saint-rest', name: 'I-3 the Sword Saint’s last duel', scope: 'party',
    entries: [{ when: { questStage: 'quest:swordsman-the-saints-tomb', stage: 'rest' }, node: 'kneel' }, { node: 'after' }],
    nodes: {
      kneel: {
        speaker: 'narrator', text: 'The Sword Saint is down on one knee, his blade grounded, black weeping from every old wound. He cannot fall. He is looking at you, very patiently, the way a master waits for a student to remember the last step of a form.',
        choices: [
          { text: '(Salute the end of the duel.)', to: 'salute', effects: [{ setFlag: 'swordsman.saint_saluted', value: true }] },
          { text: '(Bow to him, as he bowed to you.)', to: 'bow' },
        ],
      },
      salute: { speaker: 'narrator', text: 'You bring your blade up to your face and sweep it down: the salute at the end of a bout, that nobody in Edgewater has given in thirty years. The Saint returns it. Then he lies down in his tomb, and the black runs out of him, and he is only an old man, asleep.', next: 'learn' },
      learn: { speaker: 'narrator', text: 'Somewhere in the back of your head a thought settles, quiet as a sheathed sword: everyone salutes before a duel. Nobody here salutes after.', next: null },
      bow: { speaker: 'narrator', text: 'You bow. He bows back, and waits, and waits. Then, slowly, as if teaching you, he raises his own blade in the salute that ends a bout, and you copy him. Only then does he lie down and close his eyes.', effects: [{ setFlag: 'swordsman.saint_saluted', value: true }], next: null },
      after: { speaker: 'narrator', text: 'The Sword Saint’s tomb, quiet at last.', next: null },
    },
  },
  {
    id: 'dialogue:swordsman-ferro-saint', name: 'I-3 report on the Saint', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: LF, text: 'The Saint is down? He was old when my master was young. What did it take?',
        choices: [
          { text: 'A salute. At the end. He couldn’t fall until someone gave it.', to: 'salute', when: { flag: 'swordsman.saint_saluted' } },
          { text: 'A long fight.', to: 'fight' },
        ],
      },
      salute: { speaker: LF, mood: 'sad', text: '(She looks at you for a long moment.) The closing salute. I haven’t seen one given since… Well. Since. Remember it.', next: 'auguste' },
      fight: { speaker: LF, text: 'They always are, with masters.', next: 'auguste' },
      auguste: { speaker: LF, text: 'Now. Word’s got about. Somebody on the Bridges wants to meet the Saint-killer. Somebody in white. You’ll know him by the crowd. (Her mouth goes thin.) Don’t let him charm you. He charms everybody.', next: null },
    },
  },
  // ---------- I-4 The Champion's Salute
  {
    id: 'dialogue:swordsman-vellacourt-salute', name: 'I-4 meeting Vellacourt', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: AV, mood: 'happy', text: 'Is this the one? The Saint-killer? Oh, splendid. Splendid! Auguste Vellacourt. Do you want an autograph? Everybody wants an autograph. No? Then you want a bout. Here. Now. On the bridge.',
        choices: [
          { text: 'I challenge you, Ser Auguste.', to: 'bout' },
          { text: 'Maestra Ferro says not to let you charm me.', to: 'ferro' },
        ],
      },
      ferro: { speaker: AV, mood: 'happy', text: 'Lucia! You’re one of Lucia’s! Oh, that’s perfect. Then you want a bout even more. Salute!', next: 'bout' },
      bout: { speaker: 'narrator', text: 'He salutes, beautifully, and then he is everywhere at once. He is far, far better than you. He talks the whole time. Halfway through, he lets you take a touch, on purpose, and beams as if you had given him a present.', next: 'again' },
      again: {
        speaker: AV, mood: 'happy', text: 'There! A touch! You see? You can do it. Again.',
        choices: [
          { text: 'Again.', to: 'more' },
          { text: 'You let me take that.', to: 'let' },
          { text: '(Watch him. He saluted at the start. Will he at the end?)', to: 'watch' },
        ],
      },
      watch: { speaker: 'narrator', text: 'He does not salute at the end. He does not stop at the end. There is no end; he simply drifts on to the next bout, still smiling, sword still up. You find you have stopped fencing, and he has not noticed.', effects: [{ setFlag: 'swordsman.salute_noticed', value: true }], next: 'loss' },
      let: { speaker: AV, text: 'Of course I did. Where’s the fun in a bout you can’t win? Again.', next: 'loss' },
      more: { speaker: 'narrator', text: 'Again, and again, and again. He never tires. Eventually the crowd starts to drift off, and he looks almost hurt.', next: 'loss' },
      loss: { speaker: AV, text: 'Give Lucia my love. My only loss, you know. My one and only. The night of the Hollowing. I’ve asked her for a rematch every week since. She always says no. Tell her: again.', next: null },
    },
  },
  {
    id: 'dialogue:swordsman-ferro-only-loss', name: 'I-4 Ferro on Vellacourt', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: LF, text: 'You met him. I can tell. You have that look, as if you had been hit very charmingly by a carriage.',
        choices: [
          { text: 'He says you’re his only loss.', to: 'loss' },
          { text: 'He never saluted at the end.', to: 'salute', when: { flag: 'swordsman.salute_noticed' } },
        ],
      },
      salute: { speaker: LF, mood: 'afraid', text: 'No. He never has. Not since that night. (She turns her teacup round once on its saucer.) You notice things. Good.', next: 'loss' },
      loss: { speaker: LF, text: 'I am. I beat him on the night of the Hollowing, in the Fencing Hall, in front of the whole Quarter. And then the Bell didn’t ring, and nothing ended, and he said “Again.” He has been saying it for thirty years.', next: 'vote' },
      vote: { speaker: LF, text: 'And now the Salles’ Council wants to vote on closing the Ladder for good. Tonight. Under the board. They want the Saint-killer to speak. Gods help us all.', next: null },
    },
  },
  // ---------- I-5 The Ladder Vote (faction choice; a party vote)
  {
    id: 'dialogue:swordsman-ladder-vote', name: 'I-5 the Salles’ Council votes', scope: 'party',
    entries: [{ when: { not: { flag: 'swordsman.ladder' } }, node: 'square' }, { node: 'after' }],
    nodes: {
      square: { speaker: 'narrator', text: 'The Council benches under the Ladder board, lamps on poles, the whole Quarter crammed into the square. The masters of every salle in Edgewater, in their colours. Ferro stands at the back with her arms folded. On the front bench, in white, Vellacourt waves at you.', next: 'motion' },
      motion: { speaker: CB, text: 'The motion: that the Ladder be closed. Every challenge struck, the board taken down, and the duel-graves sealed. The masters are divided. The Saint-killer will speak first, since everyone is staring at them anyway.', next: 'floor' },
      floor: {
        speaker: 'narrator', text: 'By the custom of the Council, a speaker may call one voice from the square before they give their own. The whole Quarter waits to see whom you call.',
        choices: [
          { text: 'Maestra Ferro. You quit the Ladder. Say why.', to: 'ferro' },
          { text: 'Ser Auguste. You’ve won more on it than anyone.', to: 'auguste' },
          { text: 'Percy Thimble, rung 4,012.', to: 'percy' },
        ],
      },
      ferro: { speaker: LF, text: '(From the back, without unfolding her arms.) Retired. Because a ladder you can never climb down from is not a ladder. It is a well. That is all. Carry on.', next: 'choose' },
      auguste: { speaker: AV, mood: 'happy', text: '(Standing, to applause.) Close the Ladder? And then what would any of us be for? Every one of you is a bout I haven’t had yet. I love you all. Again! (He sits. Somebody at the back is crying, and it is not clear why.)', next: 'choose' },
      percy: { speaker: 'npc:percy-thimble', text: '(Very pink, standing on a bench.) I’ve been on the bottom rung for nine hundred and ninety-nine bouts. And I’d just like to say I’ve had a lovely time. Mostly. (He sits down, then stands up again.) Thank you. That’s all.', next: 'choose' },
      choose: {
        speaker: CB, text: 'Well, duellist? Does the Ladder stand?',
        choices: [
          { text: 'Keep it. The Ladder is Edgewater. Without it, every quarrel goes into the dark.', to: 'keep', quest: true, effects: [{ setFlag: 'swordsman.ladder', value: 'kept' }] },
          { text: 'Close it. Take the board down. Let the dead lie.', to: 'close', quest: true, trustNpc: LF, trust: 1, effects: [{ setFlag: 'swordsman.ladder', value: 'closed' }] },
          { text: '(Walk to the board, find your oldest challenge, and yield it, out loud.)', to: 'yield', quest: true, insight: 'swordsman_first_yield', when: { insight: 'swordsman_ferro_yield' }, effects: [{ setFlag: 'swordsman.ladder', value: 'yielded' }] },
        ],
      },
      keep: { speaker: CB, text: 'The Ladder stands. Every challenge stands. (Cheers, and boos, and somewhere a duel-grave cracks.) In the morning a great bunch of white lilies arrives at your door, with a card: “Again! A.”', next: null },
      close: { speaker: CB, mood: 'angry', text: 'Carried, by two votes. The board comes down at dawn. (The square erupts. Duellists shout, and push, and then, one by one, they walk off up the silver-grass road towards the Edge Gate.) Your name is struck from the Council roll. Good night.', next: 'close2' },
      close2: { speaker: LF, text: '(At the back, very quietly.) Well done. They’ll hate you for twenty years. Then they’ll put up a statue.', next: null },
      yield: { speaker: 'narrator', text: 'You walk to the board and find your own oldest challenge, rung 212, the duel the Bell stopped. You say, loudly, “I yield.” The square goes silent. Deep under the Fencing Hall, something hums, and the whole Quarter feels it through their boots.', next: 'yield2' },
      yield2: { speaker: 'narrator', text: 'Then, at the back, an old duellist rubs out his own chalk and says “I yield.” Then another. Then a hundred. On the front bench, Vellacourt has gone white to the lips, and is not smiling at all.', next: null },
      after: { speaker: CB, text: 'The Council has spoken. It will go on speaking about it for some time.', next: null },
    },
  },
  // ---------- I-6 The Grand Salle
  {
    id: 'dialogue:swordsman-grand-salle', name: 'I-6 into the Grand Salle', scope: 'party',
    entries: [
      { when: { flag: 'swordsman.ladder', value: 'closed' }, node: 'closed' },
      { when: { flag: 'swordsman.ladder', value: 'yielded' }, node: 'yielded' },
      { node: 'kept' },
    ],
    nodes: {
      kept: { speaker: 'narrator', text: 'The Council wants the Ladder’s original roll, to prove the Ladder’s right to stand. It lies in the Grand Salle, the oldest on the river, shut for thirty years.', next: 'parry' },
      closed: { speaker: 'narrator', text: 'Ferro wants the Ladder’s original roll, to burn it, so that nobody can ever chalk the board up again. It lies in the Grand Salle, the oldest on the river, shut for thirty years.', next: 'parry' },
      yielded: { speaker: 'narrator', text: 'A hundred duellists yielded in one night, and the Ladder’s original roll has to record it, or none of it counts. It lies in the Grand Salle, the oldest on the river, shut for thirty years.', next: 'parry' },
      parry: { speaker: 'narrator', text: 'In the middle of the floor stands a fencing automaton of brass and walnut, en garde, perfectly still. A plaque at its feet says it has never been touched. Not once, in a thousand years. Its joints are weeping black oil.', next: null },
    },
  },
  {
    id: 'dialogue:obj-ladder-original-roll', name: 'I-6 the Ladder’s original roll', scope: 'party',
    entries: [{ when: { questStage: 'quest:swordsman-the-grand-salle', stage: 'roll' }, node: 'roll' }, { node: 'after' }],
    nodes: {
      roll: { speaker: 'narrator', text: 'The Ladder’s original roll, a thousand years of bouts on a scroll as thick as a tree. Most lines end with one word, in an old clerk’s hand: “Ended.” Then, from C. 1012 on, almost none do.', next: 'auguste' },
      auguste: { speaker: 'narrator', text: 'Vellacourt’s line goes on for yard after yard. Thirty years of wins, against hundreds of names. Not one of them is marked “Ended”. Beside each name, where the clerk would write where the loser went, someone has written: “Kept.”', next: null },
      after: { speaker: 'narrator', text: 'The Ladder’s original roll, rolled up under its glass.', next: null },
    },
  },
  // ---------- I-7 The Unended
  {
    id: 'dialogue:swordsman-vellacourt-unended', name: 'I-7 the Unended Gallery', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: AV, mood: 'happy', text: 'You found my gallery! Isn’t it marvellous? Everyone I’ve ever beaten. Look at them. Still fencing, still trying, still getting better. Nobody I beat ever has to stop.',
        choices: [
          { text: 'You never let a duel end.', to: 'end' },
          { text: 'You salute at the start of a bout. Never at the end.', to: 'salute', insight: 'swordsman_salute', when: { any: [{ flag: 'swordsman.salute_noticed' }, { flag: 'swordsman.saint_saluted' }] } },
          { text: 'There’s an empty place at the end of your gallery. It has Ferro’s name on it.', to: 'reserved', when: { flag: 'swordsman.ferro_reserved' } },
        ],
      },
      reserved: { speaker: AV, mood: 'sad', text: '(He looks down the gallery at it, the way a man looks at a chair kept for somebody who is late for dinner.) It’s the best place. Nearest the light. She’ll like it. She always liked the light.', next: 'end' },
      salute: { speaker: AV, mood: 'angry', text: '(For the first time, his sword hand tightens.) The closing salute is for people who are finished. I am not finished. Nobody here is finished.', next: 'end' },
      end: { speaker: AV, text: 'Why would I end them? An ended duel is a dead thing. Lucia ended ours and walked out, and I have been standing in that Hall for thirty years with my sword up, waiting for her to come back.', next: 'want' },
      want: {
        speaker: AV, mood: 'happy', text: 'The Hall half is under the floor. I’ll set it in my sword. Then every duel I win stays won, and every quarrel in Steelvale comes to me, and I settle them all, and none of them ever stop. My first bout will be Lucia. Again.',
        choices: [
          { text: 'She won’t fight you.', to: 'wont' },
          { text: 'I’ll stop you.', to: 'stop' },
        ],
      },
      wont: { speaker: AV, mood: 'sad', text: 'She will. Everybody fights me in the end. You’ll see.', next: 'go' },
      stop: { speaker: AV, mood: 'happy', text: 'Oh, I do hope you’ll try. Again and again.', next: 'go' },
      go: { speaker: AV, text: 'The Fencing Hall. Tonight. Every lamp lit. Bring your feet.', next: null },
    },
  },
  // ---------- I-8 The Fencing Hall
  {
    id: 'dialogue:obj-blade-capital-halfstone', name: 'I-8 the Hall half', scope: 'party',
    entries: [{ when: { questStage: 'quest:swordsman-the-fencing-hall', stage: 'stone' }, node: 'claim' }, { node: 'floor' }],
    nodes: {
      claim: { speaker: 'narrator', text: 'Where you lowered your sword on the third “Again”, the Hall floor has cracked to the stone. You lever up a board. Underneath, in a cradle of old steel, lies half of a crystal, cracked clean across, singing like a struck blade. It is warm in your hand, the way a hand is warm.', next: 'lamps' },
      lamps: { speaker: 'narrator', text: 'All round the Fencing Hall the lamps gutter, as if somebody had opened every door at once. On the walls, the old bout-boards rattle on their nails, and the chalk on them, thirty years of unfinished scores, starts to run.', next: 'vision' },
      vision: { speaker: 'narrator', text: 'For a moment you are not in the Hall. You stand on a hill at night in a ring of twelve stones, each singing its own note, round a crown nobody is wearing. Then the ring cracks, all at once, like a blade on stone, and the song breaks.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'You are back on the cracked boards with the half-stone in your fist. The Hall is very quiet. It is the quiet at the end of a bout, before anybody claps.',
        choices: [
          { text: '(Give the closing salute, to the empty Hall.)', to: 'salute', effects: [{ setFlag: 'swordsman.hall_saluted', value: true }] },
          { text: '(Sheathe your sword. Slowly.)', to: 'sheathe' },
          { text: '“Where is your other half?”', to: 'other' },
        ],
      },
      salute: { speaker: 'narrator', text: 'Blade to face, and down. In the empty Hall it makes no sound at all. Then, along every wall, the bout-boards stop rattling, one after another, as if the Hall had been waiting thirty years for somebody to say it was over.', next: 'auguste' },
      sheathe: { speaker: 'narrator', text: 'The blade goes home with a soft click. The half-stone hums, approving, the way a master hums when a student does the simple thing right. It is the first sword sheathed in the Fencing Hall since the Hollowing.', next: 'auguste' },
      other: { speaker: 'narrator', text: 'It hums, clean and high, and you know without knowing how that the other half is out east, above the clouds on a silent terrace, waiting for a samurai to carry it home.', next: 'auguste' },
      auguste: { speaker: AV, mood: 'happy', text: '(From the river-gate, already halfway out, laughing.) Hold on to it for me! I’ll be at the Edge Gate, with the General’s muster! Everybody goes through the gate in the end! AGAIN!', next: 'gone' },
      gone: { speaker: 'narrator', text: 'The river-gate bangs shut behind him. For the first time since you came in, nobody in the Fencing Hall is saying “Again”.', next: null },
      floor: { speaker: 'narrator', text: 'A cracked board in the Hall floor, over an empty cradle.', next: null },
    },
  },
  // ---------- I-9 The Last Lesson (mentor farewell; trust check)
  {
    id: 'dialogue:swordsman-ferro-farewell', name: 'I-9 Ferro’s last lesson', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: LF, text: 'Walk with me to the edge of the grass. (She doesn’t speak again until the city is behind you.) You want to know why I quit.',
        effects: [{ setFlag: 'swordsman.ferro_farewell', value: true }],
        choices: [
          { text: 'Retired.', to: 'why', trust: 1 },
          { text: 'Yes.', to: 'why' },
        ],
      },
      why: { speaker: LF, mood: 'sad', text: 'I beat him. That night, in the Hall. The Bell should have rung for the end of the bout, the way it always rang somewhere in the back of your head. It didn’t. He said “Again.” And I understood that nothing was ever going to end again, unless someone chose to end it.', next: 'yield' },
      yield: { speaker: LF, text: 'So I yielded. A champion, yielding to the man she had just beaten. They thought I had lost my nerve. Maybe I had. But it was the last ended duel in Edgewater, and I ended it.', next: 'gifts' },
      gifts: {
        speaker: LF, text: 'Here.',
        choices: [
          { text: '(Take what she holds out.)', to: 'ribbon', when: { trust: LF, value: 'friendly' } },
          { text: '(Salute her.)', to: 'salute', when: { not: { trust: LF, value: 'friendly' } } },
        ],
      },
      ribbon: { speaker: LF, text: 'The Ladder’s gold signet, off my champion’s ribbon. I haven’t worn it since that night. The ribbon I’ll keep a little longer. The signet is yours. Try not to deserve it too quickly.', effects: [{ giveItem: 'i_ferro_signet' }, { setFlag: 'swordsman.ferro_ribbon', value: true }], next: 'sword' },
      sword: {
        speaker: LF, text: 'And…',
        choices: [
          { text: '(Wait.)', to: 'blade', when: { trust: LF, value: 'trusted' } },
          { text: '(Wait.)', to: 'end', when: { not: { trust: LF, value: 'trusted' } } },
        ],
      },
      blade: { speaker: LF, text: '(She unwraps a long bundle. Inside is a plain steel sword.) The blade I beat him with. Thirty years in a cupboard. Draw it once for me. And when it’s done, put it away.', effects: [{ giveItem: 'w_ferro_blade' }, { setFlag: 'swordsman.ferro_sword', value: true }], next: 'end' },
      salute: { speaker: LF, text: '(She returns it, crisp as a starched collar.) Feet. Mind your feet.', next: null },
      end: { speaker: LF, text: 'Go on. And end it, whatever it is. Somebody has to.', next: null },
    },
  },
  // ---------- I-7 the duel's set piece (ARENA_HAZARDS §5): the boss yields on swordsman.sword_lowered
  {
    id: 'dialogue:obj-swordsman-third-again', name: 'I-7 the duelling mark: the third “Again”', scope: 'party',
    entries: [
      { when: { all: [{ questStage: 'quest:swordsman-the-fencing-hall', stage: 'auguste' }, { not: { flag: 'swordsman.sword_lowered' } }] }, node: 'mark' },
      { node: 'plain' },
    ],
    nodes: {
      mark: {
        speaker: AV, text: '(He steps back onto the old duelling mark, breathing hard, and lifts his blade to the guard he taught half of Steelvale.) Again.',
        choices: [
          { text: '(Lower your sword, and stand on the mark with him.)', to: 'lower', quest: true, effects: [{ setFlag: 'swordsman.sword_lowered', value: true }] },
          { text: '(Raise your guard. Not yet.)', to: null },
        ],
      },
      lower: { speaker: AV, mood: 'afraid', text: 'Again. (You do not move.) Again! (His sword shakes.) You can’t. You can’t simply stop. Nobody simply stops.', next: 'crack' },
      crack: { speaker: 'narrator', text: 'He cannot fight someone who will not fight. Somewhere under the boards, something gives, and the Hall floor cracks from the mark to the walls with a sound like a bell.', next: null },
      plain: { speaker: 'narrator', text: 'An old duelling mark, worn into the boards by forty years of feet.', next: null },
    },
  },
];

export default dialogues;
