/** Hollow Crown, MONK Act I main dialogues (Stonecloister). Owner: Claude 4. */
import type { DialogueDef } from '@/core';

const ST = 'npc:shirin-tal' as const, KS = 'npc:kestrel' as const;
const stage = (q: `quest:${string}`, s: string) => ({ questStage: q, stage: s });

const dialogues: DialogueDef[] = [
  // ---------- I-1 The Bell on the Stair
  {
    id: 'dialogue:monk-bell-night', name: 'I-1 the Bell on the Thousand Stairs', scope: 'party',
    entries: [{ node: 'sweep' }],
    nodes: {
      sweep: { speaker: 'narrator', text: 'The night-sweep of the Thousand Stairs. One novice, one broom, one lantern, and step six hundred and eleven, which has a crack in it that every novice for three hundred years has been told to mind. You mind it.', next: 'bell' },
      bell: { speaker: 'narrator', text: 'Far away, a bell rings once. Then, high above you in the Bell Courts, the great bell of Stonecloister answers it. Nobody is on the rope. Nobody has been on the rope since vespers.', next: 'song' },
      song: { speaker: 'narrator', text: 'Something under your breastbone begins to sing back. It is coming from straight up the mountain, from the very top, and it is in no hurry at all. Below you, on landing six hundred, a lantern is still lit.', next: null },
    },
  },
  {
    id: 'dialogue:monk-shirin-bell', name: 'I-1 the Abbess on landing six hundred', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: ST, text: '(Abbess Shirin Tal is sitting cross-legged at the shuttered tea stall, playing stones with the night porter by lantern-light. She has, by your count, eleven more stones on the board than she started with.) Ah. My night-sweeper. Did you hear the bell, or did the bell hear you?',
        choices: [
          { text: 'Mother Abbess, something is singing in my chest.', to: 'sing' },
          { text: 'You have eleven stones too many on that board.', to: 'stones' },
        ],
      },
      stones: { speaker: ST, mood: 'happy', text: 'Twelve. You missed the one under the teapot. (The night porter puts his head in his hands.) You always did watch the board instead of the player. Sit. Breathe. Now. The singing.', next: 'sing' },
      sing: {
        speaker: ST, text: 'From straight up, yes? From the summit. (She looks up the dark stair for a long moment.) Then it is the Fist stone, or half of it, and it has chosen a novice who still cannot sweep step six hundred and eleven without tripping.',
        choices: [
          { text: 'I didn’t trip.', to: 'trip' },
          { text: 'What do I do?', to: 'do' },
        ],
      },
      trip: { speaker: ST, text: 'You did not trip tonight. Tonight is the first night. I am very proud of you. I was also watching.', next: 'do' },
      do: {
        speaker: ST, text: 'What we always do. Stand still until you know which way to move. (She gets up, slowly; her knees click like stones.) Show me your stillness. No. Stiller. There. Now tomorrow you will carry my tea up the Stairs, as novices always have.',
        choices: [
          { text: '(Stand perfectly still.)', to: 'still', trust: 1 },
          { text: 'Tea? The great bell rang on its own, Mother.', to: 'tea' },
        ],
      },
      still: { speaker: ST, mood: 'happy', text: 'Good. Hold that. You will need it. Not bed yet, though. I want to look at a bell that rang itself, before the whole cloister wakes up and tells me what it means. Bring the lantern. Mind the step.', next: null },
      tea: { speaker: ST, text: 'And tomorrow somebody will still want tea. The end of the world is no excuse for an empty cup. But first, the bell. I want to look at it before anybody tells me what it means. Bring the lantern.', next: null },
    },
  },
  // ---------- I-2 Tea on Every Landing
  {
    id: 'dialogue:obj-landing-cup-1', name: 'I-2 the first landing',
    entries: [{ when: stage('quest:monk-tea-on-every-landing', 'cups'), node: 'pour' }, { node: 'plain' }],
    nodes: {
      pour: { speaker: 'narrator', text: 'You pour a cup and leave it on the landing’s tea stall, steaming. The stall is shuttered. Chalked on the shutter: GONE UP TO THE KING. BACK WHEN HE IS. The tea goes cold without anyone drinking it.', next: null },
      plain: { speaker: 'narrator', text: 'A shuttered tea stall, and a cold cup of tea on its counter.', next: null },
    },
  },
  {
    id: 'dialogue:obj-landing-cup-6', name: 'I-2 the sixth landing',
    entries: [{ when: stage('quest:monk-tea-on-every-landing', 'cups'), node: 'pour' }, { node: 'plain' }],
    nodes: {
      pour: { speaker: 'narrator', text: 'Black tears are trickling down the steps from above, one stair at a time, like very slow rain. Coming down to meet you through them, in the cloister’s grey, are three monks you know. Their eyes are wet and black and very calm.', next: null },
      plain: { speaker: 'narrator', text: 'The sixth landing, and the stain where the black tears ran.', next: null },
    },
  },
  {
    id: 'dialogue:monk-shirin-urn', name: 'I-2 the empty urn', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: ST, text: 'Empty. Good. Who drank it?',
        choices: [
          { text: 'Nobody. Half the stalls are shut, and the monks on the Stairs were ours.', to: 'ours' },
          { text: 'Brother Tamsk and Sister Lio. They came at me with their staffs, Mother.', to: 'names' },
        ],
      },
      names: { speaker: ST, mood: 'sad', text: 'Tamsk, who could never hold a form for longer than a sneeze. Lio, who used to feed the goats her breakfast. (She is quiet.) They were going down. Towards the King.', next: 'guardian' },
      ours: { speaker: ST, mood: 'sad', text: 'Ours. They are all ours. That is the difficult part.', next: 'guardian' },
      guardian: { speaker: ST, text: 'And now the Temple Guardian has stopped letting anyone up the mountain. It lets everyone down. Nine hundred years it has judged the worthy, and now it judges everyone unworthy but the King. Go and see why. Move only when it is not looking.', next: null },
    },
  },
  // ---------- I-3 The Guardian Hall
  {
    id: 'dialogue:monk-guardian-sees', name: 'I-3 the Temple Guardian', scope: 'party',
    entries: [{ node: 'hall' }],
    nodes: {
      hall: { speaker: 'narrator', text: 'A long stone hall, and at its end a stone warden three times your height, its great head turning slowly from side to side. Its eye-sockets are full of black tears. Every novice who has climbed the mountain looks unworthy to eyes like that.', next: 'still' },
      still: { speaker: 'narrator', text: 'It strikes only at what moves. Somewhere behind you, a frightened novice sniffs, and the Guardian’s head stops turning.', next: null },
    },
  },
  {
    id: 'dialogue:obj-guardian-hall-novices', name: 'I-3 the novices at the far door', scope: 'party',
    entries: [{ when: stage('quest:monk-the-guardian-hall', 'novices'), node: 'lead' }, { node: 'plain' }],
    nodes: {
      lead: {
        speaker: 'narrator', text: 'Six novices, the youngest perhaps nine, huddled at the far door with their bowls and bedrolls. They will not go past the still Guardian on their own.',
        choices: [
          { text: '(Walk them through, one step at a time, in stillness between each.)', to: 'walk' },
          { text: '[Fist] (Sit down in front of the Guardian, so they can see it is safe.)', to: 'sit', school: 'fist' },
        ],
      },
      walk: { speaker: 'narrator', text: 'Step, and stop. Step, and stop. The novices copy you exactly, giggling by the end. When the last one is through, the Guardian’s cracked head turns, very slowly, and watches them go up the mountain.', next: null },
      sit: { speaker: 'narrator', text: 'You sit in front of the great stone warden and breathe. After a while the youngest novice comes and sits beside you. Then all of them are sitting, and then they are all walking past it, laughing, and the Guardian does nothing at all.', next: null },
      plain: { speaker: 'narrator', text: 'The Temple Guardian, still at last, facing up the mountain.', next: null },
    },
  },
  // ---------- I-4 Kestrel Comes Down
  {
    id: 'dialogue:monk-kestrel-home', name: 'I-4 Kestrel on the Prayer Terraces', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: KS, mood: 'happy', text: 'Little one! Look at you. Look at you! You got taller and you didn’t ask me first. (Brother Kestrel is in the Mountain King’s grey, with a sack of sweets over his shoulder and a goat on a lead. The goat is eating a prayer flag.) This is Turnip. She’s a present. Not for you. For the abbot. He’ll hate her.',
        choices: [
          { text: 'Kestrel. You came home.', to: 'home' },
          { text: '(Watch his hands as he hands out the sweets.)', to: 'hands', effects: [{ setFlag: 'monk.beads_noticed', value: true }] },
        ],
      },
      hands: { speaker: 'narrator', text: 'He gives every novice a sweet, and remembers every name. Round his left wrist, his old prayer beads, the ones Shirin gave you both on the same morning. They have gone black. Between sweets, without looking, his thumb still counts them.', next: 'home' },
      home: {
        speaker: KS, text: 'Home. Is that what this is? (He laughs, and it is a good laugh, and then it isn’t.) We were robbed, little one. The crown should have come to Fist. You know we were. Everybody up here knows it, and everybody up here sweeps the stairs anyway.',
        choices: [
          { text: 'I know the story.', to: 'story' },
          { text: 'Does Mother Shirin know you’re here?', to: 'shirin' },
        ],
      },
      story: { speaker: KS, text: 'It isn’t a story. It’s a debt. Thirty years overdue, with interest. The King has been patient. I haven’t. Go and tell Mother I’m home. Tell her I brought a goat. She’ll pretend to be cross.', next: null },
      shirin: { speaker: KS, mood: 'sad', text: 'Mother always knows. Go and tell her anyway. Tell her I brought a goat. She’ll pretend to be cross.', next: null },
    },
  },
  {
    id: 'dialogue:monk-shirin-kestrel', name: 'I-4 the Abbess hears Kestrel is home', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: ST, text: 'A goat. Of course he brought a goat. When he was six he brought me a frog, because he said I looked lonely. (She pours two cups of tea and pushes one across to an empty cushion, out of habit.) Is he well?',
        choices: [
          { text: 'He’s funnier than he used to be.', to: 'funny' },
          { text: 'He’s sadder than he used to be.', to: 'sad', trust: 1 },
        ],
      },
      funny: { speaker: ST, mood: 'sad', text: 'Then he is sadder. He was always funniest when he was frightened. You two were left on the same stair in the same winter, did you know that? I found you both in one basket. He was holding your foot.', next: 'vote' },
      sad: { speaker: ST, mood: 'sad', text: 'Yes. He hides it in the jokes. He always did. You two were left on the same stair in the same winter. I found you both in one basket. He was holding your foot.', next: 'vote' },
      vote: { speaker: ST, text: 'He has brought the King’s Climbers to the Bell Courts. They will ask the cloister to come up the mountain. Tomorrow the cloister will vote with its feet. Be there. Stand where you mean to stand.', next: null },
    },
  },
  // ---------- I-5 The Empty Cells (the faction choice; a party vote)
  {
    id: 'dialogue:monk-empty-cells', name: 'I-5 the cloister votes with its feet', scope: 'party',
    entries: [{ when: { not: { flag: 'monk.cells' } }, node: 'courts' }, { node: 'after' }],
    nodes: {
      courts: { speaker: 'narrator', text: 'The Bell Courts at dawn, under the great bell. Kestrel and forty Climbers in grey on the east side, by the summit road. Shirin alone on the west side, by the cloister gate, holding her tea. Two hundred monks between them, and nobody has moved.', next: 'kestrel' },
      kestrel: { speaker: KS, text: 'Fist was owed the crown. We were robbed of it on the road, and the King has kept his throne for thirty years waiting to be paid. Come up the mountain with us. Stand with what is owed.', next: 'shirin' },
      shirin: { speaker: ST, text: '(She sips her tea.) I am not going to make a speech. I am going to stand here. You all know where the cells are.', next: 'floor' },
      floor: {
        speaker: 'narrator', text: 'Two hundred monks between the two sides, and every one of them is watching you, because Kestrel is. Before you move, you may still hear one more voice.',
        choices: [
          { text: '(Look at Sister Agnetha, up in the bell-frame.)', to: 'agnetha' },
          { text: '(Look at the Climbers. Find the youngest.)', to: 'young' },
          { text: '(Close your eyes and stand still, the way she taught you.)', to: 'still', trust: 1, trustNpc: ST },
        ],
      },
      agnetha: { speaker: 'npc:agnetha-hume', text: '(From the bell-frame, with her bad arms folded.) Forty years I’ve rung this bell for whoever was here to hear it. Not for a king. Not for a debt. For whoever was here. That’s all I have to say. I have to ring it at dusk regardless.', next: 'choose' },
      young: { speaker: 'narrator', text: 'The youngest Climber is a girl of perhaps thirteen, one of Wyn’s goat-girls, in a grey robe too big for her. She is looking across the courts at the cloister gate the way you look at a door you might not come back through.', next: 'choose' },
      still: { speaker: 'narrator', text: 'You close your eyes. You breathe. Under your breastbone the Summit half’s song is very quiet and very clear, and it is not pulling you up the mountain or down it. It is waiting, the way Shirin waits. You open your eyes.', next: 'choose' },
      choose: {
        speaker: KS, text: 'Little one. They’re all watching you. They always watched you. Which side?',
        choices: [
          { text: '(Cross to the west side and stand beside Shirin.) The cloister stays.', to: 'stay', quest: true, effects: [{ setFlag: 'monk.cells', value: 'stay' }] },
          { text: '(Cross to the east side and take the grey.) Fist was owed. I’ll climb.', to: 'climb', quest: true, trustNpc: ST, trust: -1, effects: [{ setFlag: 'monk.cells', value: 'climb' }] },
          { text: '(Stay in the middle.) Doran Kell wasn’t robbed. He turned back on the road. He ran home before the gates shut.', to: 'turned', quest: true, insight: 'monk_told_courts', when: { insight: 'kell_turned_back' }, effects: [{ setFlag: 'monk.cells', value: 'turned' }] },
        ],
      },
      stay: { speaker: 'narrator', text: 'You cross the courts and stand beside her. Half the monks come with you, and the cloister gate is barred behind them. Kestrel bows to you, very deeply, and walks up the summit road with forty novices behind him. He does not look back.', next: null },
      climb: { speaker: 'narrator', text: 'You cross to the east side, and Kestrel throws a grey robe round your shoulders and laughs like a boy. Across the courts, Shirin finishes her tea, puts the cup down, and goes in through the cloister gate alone.', next: null },
      turned: { speaker: 'narrator', text: 'Silence. The Climbers look at one another. One of them puts down her staff. Kestrel has gone white, all at once, like snow falling off a roof. On the west side, Shirin closes her eyes.', next: 'turned2' },
      turned2: { speaker: KS, mood: 'angry', text: 'That’s a lie. That is a lie. (His thumb is counting his beads very fast.) Somebody tell me that is a lie. (Nobody does. He turns and goes up the summit road alone, almost running.)', next: null },
      after: { speaker: ST, text: 'The cloister has voted with its feet. Now we see where the feet go.', next: null },
    },
  },
  // ---------- I-6 The Ninefold Abbot
  {
    id: 'dialogue:obj-ninefold-cushion', name: 'I-6 the Abbot, whole again', scope: 'party',
    entries: [{ when: stage('quest:monk-the-ninefold-abbot', 'whole'), node: 'sit' }, { node: 'plain' }],
    nodes: {
      sit: {
        speaker: 'narrator', text: 'One old man on a meditation cushion, very small now that there is only one of him. He is crying, quietly, the way you cry when you have been putting it off for thirty years. The black has gone out of his tears.',
        choices: [
          { text: '(Sit down beside him and breathe.)', to: 'breathe' },
          { text: 'What were you meditating on, Father Abbot?', to: 'what' },
        ],
      },
      what: { speaker: 'narrator', text: 'What Fist was owed, he says. For thirty years. I thought about it so hard there came to be nine of me, and we all disagreed, and the ninth one only cried. I should have listened to the ninth one first.', next: 'breathe' },
      breathe: { speaker: 'narrator', text: 'After a while he wipes his face on his sleeve, stands, and unlocks the summit door behind the cushion with a key he has been sitting on since C. 1012. Go on up, he says. I am going to have something to eat.', next: null },
      plain: { speaker: 'narrator', text: 'An empty meditation cushion in a cell that is, at last, silent.', next: null },
    },
  },
  // ---------- I-7 What Is Owed
  {
    id: 'dialogue:monk-kestrel-kitchen', name: 'I-7 Kestrel in the Cloud Kitchen', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: KS, text: '(He is stirring a pot of rice big enough to bathe in, above the clouds, with a paddle.) Sit. It needs another hour. Everything up here needs another hour. Do you want the truth? You always wanted the truth. You were very annoying about it.',
        choices: [
          { text: 'Tell me.', to: 'truth' },
          { text: 'Your beads are black, Kestrel. And you still count them.', to: 'beads', insight: 'kestrel_beads', when: { any: [{ flag: 'monk.beads_noticed' }, { flag: 'monk.kestrel_note' }] } },
        ],
      },
      beads: { speaker: KS, mood: 'sad', text: '(His thumb stops on a bead. He looks at it as if it belongs to somebody else.) Habit. Mother gave us these on the same morning. Mine wept first. I don’t know what yours are waiting for.', next: 'truth' },
      truth: { speaker: KS, text: 'The King is tired, little one. He sits on his stair and waits to be paid, and nobody is coming to pay him. But somebody else listens. The Hollow King sends word down the tears. Bring him the Fist stone, he says, and the crown will pass to Fist at last. To whoever carries it.', next: 'him' },
      him: {
        speaker: KS, text: 'I mean that to be me. I’ve swept the Stairs for thirty years for a debt nobody paid. I’d like to be paid. Is that so terrible? Is that so much to be owed?',
        choices: [
          { text: 'It isn’t yours to be paid, Kestrel. It never was.', to: 'yours' },
          { text: 'It was never owed, Kestrel. It was only ever going to be given.', to: 'gift' },
        ],
      },
      yours: { speaker: KS, mood: 'angry', text: 'Then whose? Yours? You can’t hear it either, not really. You just stand still and let the song come to you. I always had to go and get things.', next: 'go' },
      gift: { speaker: KS, mood: 'sad', text: '(For a moment he looks about six years old.) Mother says that. Mother says that about everything. It sounded better from her.', next: 'go' },
      go: {
        speaker: KS, text: 'The Summit half is at the top. It won’t come out for me, the stones never do. It’ll come out for you. So I’ll be waiting for you up there, little one. Don’t keep me. The rice will burn.',
        choices: [{ text: '(Let him go up.)', to: null, quest: true }],
      },
    },
  },
  // ---------- I-8 The Summit Shrine
  {
    id: 'dialogue:obj-fist-capital-halfstone', name: 'I-8 the Summit half', scope: 'party',
    entries: [{ when: stage('quest:monk-the-summit-shrine', 'stone'), node: 'claim' }, { node: 'empty' }],
    nodes: {
      claim: { speaker: 'narrator', text: 'In a niche at the very top of the world, above the clouds, lies half of a crystal, cracked clean across, singing. It is warm, and very still, and it fits your hand as if your hand had been carved around it.', next: 'beads' },
      beads: { speaker: 'narrator', text: 'On the stone where Kestrel stood, his prayer beads lie in a little heap, the string broken. They are not black any more. They are only wood, worn smooth by a thumb that counted them every day for thirty years.', next: 'vision' },
      vision: { speaker: 'narrator', text: 'For a moment you are not on the summit. You stand on a hill at night in a ring of twelve stones, each singing its own note, round a crown that nobody is wearing. Then the ring cracks, all at once, like ice on a pond, and the song breaks.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'You are back above the clouds with the Summit half in one hand. The other hand is empty.',
        choices: [
          { text: '(Gather up Kestrel’s beads and keep them.)', to: 'gather', effects: [{ setFlag: 'monk.kestrel_beads', value: true }] },
          { text: '(Stand still and let the stone sing until the wind drops.)', to: 'still' },
          { text: '“Where is your other half?”', to: 'other' },
        ],
      },
      gather: { speaker: 'narrator', text: 'You thread them back on to their string, one by one, and count them as you go, the way he did. Forty-one. You tie the knot Shirin taught you both on the same morning, and put them round your own wrist, next to yours.', next: 'kestrel' },
      still: { speaker: 'narrator', text: 'You stand. The stone sings. Slowly the wind drops, and the clouds below you go flat and white as a sheet, and for one breath the whole of Mountainreach is perfectly still, and so are you.', next: 'kestrel' },
      other: { speaker: 'narrator', text: 'It hums, deep and patient, and you know without knowing how that the other half is far below, at the bottom of a quarry, in a pit-fighters’ ring, waiting for somebody who gets up every time they are knocked down.', next: 'kestrel' },
      kestrel: { speaker: KS, mood: 'sad', text: '(From the edge of the summit, where he stepped backwards into the cloud, his voice comes up out of the white.) Keep it warm, little one! I’ll see you at the Stair Gate! Everybody has to go down the Stairs in the end!', next: 'gone' },
      gone: { speaker: 'narrator', text: 'His voice goes down and down into the cloud and is gone. Above you there is nothing at all but sky, for the first time in your life.', next: null },
      empty: { speaker: 'narrator', text: 'An empty niche at the top of the world. The wind goes through it, and does not sing.', next: null },
    },
  },
  // ---------- I-9 The Long Descent (mentor farewell; trust check)
  {
    id: 'dialogue:monk-shirin-farewell', name: 'I-9 the long descent', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: ST, text: '(The Abbess is waiting at the foot of the Thousand Stairs in travelling sandals that have not been worn for thirty years. They squeak.) I am walking you down. Do not argue. I am the Abbess, and also I have never seen the gate road, and I am curious.',
        choices: [
          { text: 'You haven’t left Stonecloister in thirty years.', to: 'thirty' },
          { text: '(Walk beside her, in step.)', to: 'walk', trust: 1 },
        ],
      },
      thirty: { speaker: ST, text: 'Thirty. The last time was the road to Concordia, and I came back up it at a run. Since then there was always somebody to raise, or a game to cheat at. Walk.', next: 'walk' },
      walk: { speaker: 'narrator', text: 'You walk down the gate road together, very slowly, because she stops to look at everything: a beetle, a bad wall, a view she says she was told about once. At the last bend before the gate, she sits down on a rock.', next: 'gift' },
      gift: {
        speaker: ST, text: 'This is as far as I go. I have something for you.',
        choices: [
          { text: '(Hold out your hands.)', to: 'bowl', when: { trust: ST, value: 'friendly' } },
          { text: '(Bow to her.)', to: 'bow', when: { not: { trust: ST, value: 'friendly' } } },
        ],
      },
      bowl: {
        speaker: ST, mood: 'happy', text: 'My stones bowl. Forty years. And yes, the loaded stone is still in it, the black one, there. It always lands face up. Do not tell anybody, and do not use it on anybody who deserves to win.',
        effects: [{ giveItem: 'i_shirin_stones_bowl' }, { setFlag: 'monk.stones_bowl', value: true }],
        next: 'goat',
      },
      goat: {
        speaker: ST, text: '(Behind her, something small and white is chewing the hem of her robe.) And this is Vespers. Matins’s kid. She has no respect for anything, including me. She followed me down. I think she followed you.',
        choices: [
          { text: 'She can come with me.', to: 'end', when: { trust: ST, value: 'trusted' }, effects: [{ setFlag: 'monk.vespers_pet', value: true }] },
          { text: 'Take her home, Mother. Someone should eat your prayer flags.', to: 'end' },
        ],
      },
      bow: { speaker: ST, text: 'Stand still until you know which way to move. Then move. Go on.', next: null },
      end: { speaker: ST, text: 'Go on, then. Go down. I am going to sit on this rock for a while and look at the road. I have been meaning to for thirty years.', next: null },
    },
  },
  // ---------- I-10 The Stair Gate
  {
    id: 'dialogue:monk-king-on-the-stair', name: 'I-10 the Mountain King on the last stair', scope: 'party',
    entries: [{ when: { flag: 'monk.cells', value: 'turned' }, node: 'weeps' }, { node: 'king' }],
    nodes: {
      weeps: { speaker: 'narrator', text: 'Before you reach the last stair, the Mountain King looks up and sees you, and knows you, and knows what you said in the Bell Courts. The black ice in his beard creaks. He is weeping before you have taken a step.', next: 'king' },
      king: { speaker: 'narrator', text: 'Master Doran Kell sits on the last stair before the Stair Gate, huge, grey, his beard frozen into a black crown of icicles. He has sat there since the night of the Bell. Behind him, Kestrel is a grey shape at the gate, waiting.', next: 'stand' },
      stand: { speaker: 'narrator', text: 'The King stands. The stair cracks under him. He does not ask who you are. He lifts his fists and the mountain comes with them, and you understand that you cannot out-hit him. You will have to out-still him.', next: null },
    },
  },
];

export default dialogues;
