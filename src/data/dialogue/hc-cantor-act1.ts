/** Hollow Crown, CANTOR Act I main dialogues (Dawnspire). Owner: Claude 4. */
import type { DialogueDef } from '@/core';

const CH = 'npc:celestine-hale' as const, LU = 'npc:lucan-brightwater' as const, AM = 'npc:sister-amabel' as const;
const OB = 'npc:osgood-bellamy' as const, LD = 'npc:lambert-dewhurst' as const;

const dialogues: DialogueDef[] = [
  // ---------- I-1 The Hour of No Night
  {
    id: 'dialogue:cantor-hour-of-lamps', name: 'I-1 the Hour of Lamps', scope: 'party',
    entries: [{ node: 'lamps' }],
    nodes: {
      lamps: { speaker: 'narrator', text: 'The Hour of Lamps in Dawnspire: the one hour in the day when the Sun Cathedral turns its light down a single notch, so the lamps can be trimmed. The novices sing it on the Close steps, swaying. You are swaying more than most.', next: 'bell' },
      bell: { speaker: 'narrator', text: 'Somewhere very far away a bell rings once. The great light of the Cathedral flickers, for one heartbeat, and goes out. Above the Close, in a sky nobody has seen for thirty years, there is a star.', next: 'wake' },
      wake: { speaker: 'narrator', text: 'Then the light is back, and the whole Close is staring upwards, and you have woken up on the steps with something singing in your chest. You hear yourself say it, out loud, in front of everyone: “It went dark.”', next: null },
    },
  },
  {
    id: 'dialogue:obj-close-lamp-1', name: 'I-1 the first guttered lamp',
    entries: [{ when: { questStage: 'quest:cantor-the-hour-of-no-night', stage: 'lamps' }, node: 'sing' }, { node: 'lamp' }],
    nodes: {
      sing: { speaker: 'narrator', text: 'A brass lamp on the Close steps, blown out cold. You sing the first line of Prime at it, the way every novice is taught, and the wick catches as if it had been waiting to be asked.', next: null },
      lamp: { speaker: 'narrator', text: 'A brass lamp on the Close steps, burning steadily. Every lamp in Dawnspire burns steadily. It is the law.', next: null },
    },
  },
  {
    id: 'dialogue:cantor-celestine-bell', name: 'I-1 Celestine covers for you', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: OB, text: 'I heard it. Somebody on these steps used the word. I’ll need a name for the fine-book, Mother, I’m sorry, it’s the law.', next: 'cover' },
      cover: { speaker: CH, text: 'What you heard, Sergeant, was a novice saying “it went, Mark”. Novice Mark. He sang flat through the whole of the Bell, and somebody had to tell him. Write that down, if you must write something.', next: 'gone' },
      gone: {
        speaker: CH, text: '(The sergeant goes, unhappily.) Well. You fell asleep on the Close steps during the Hour of Lamps and woke up talking about the dark, in front of the Brightwatch. I am almost impressed. Are you hurt?',
        choices: [
          { text: 'Something is singing in my chest, Mother.', to: 'sing' },
          { text: 'There was a star. Everyone saw it.', to: 'star' },
          { text: 'Thank you for lying for me.', to: 'lie', trust: 1 },
        ],
      },
      lie: { speaker: CH, text: 'I didn’t lie. There is a Novice Mark, and he does sing flat. I simply moved him to a more useful moment. Now: what is that light coming out of your collar?', next: 'sing' },
      star: { speaker: CH, mood: 'sad', text: 'Everyone saw it, and by Terce everyone will have agreed that they didn’t. That is how Dawnspire works. Never mind the star. What is that light coming out of your collar?', next: 'sing' },
      sing: {
        speaker: CH, text: 'Oh. Oh, my dear. That is a Concord Stone. Half of one. The Altar half has slept on the High Altar for thirty years, and it has just woken up and chosen a novice who naps.',
        choices: [
          { text: 'What do I do?', to: 'do' },
          { text: 'Chosen me? Why me?', to: 'why' },
        ],
      },
      why: { speaker: CH, text: 'I haven’t the faintest idea. Perhaps it likes people who can still fall asleep. There are not many of us left.', next: 'do' },
      do: { speaker: CH, text: 'Tonight, if Dawnspire had a tonight, you would go to bed. Instead, you will finish the Hour of Lamps with your mouth closed, and come to my cell in the Choir Cloisters after Lauds. Keep your collar done up.', next: null },
    },
  },
  // ---------- I-2 The Sleepers' Census
  {
    id: 'dialogue:obj-sleeping-novice-1', name: 'I-2 the first sleeping novice', scope: 'party',
    entries: [{ when: { questStage: 'quest:cantor-the-sleepers-census', stage: 'novices' }, node: 'weep' }, { node: 'empty' }],
    nodes: {
      weep: { speaker: 'narrator', text: 'A novice curled up behind a pillar, asleep, her hymnal open on her chest. She is weeping in her sleep, and the tears running into her ears are black.', next: 'wake' },
      wake: { speaker: 'narrator', text: 'You shake her, and she wakes all at once, and tries to sing before she is properly awake. “Sorry, sorry, I wasn’t, I was only resting my eyes,” she says, and wipes her face, and looks at her hand.', next: null },
      empty: { speaker: 'narrator', text: 'A cold patch on the stone behind a pillar, where someone was sleeping.', next: null },
    },
  },
  {
    id: 'dialogue:obj-sleeping-novice-6', name: 'I-2 the last sleeping novice', scope: 'party',
    entries: [{ when: { questStage: 'quest:cantor-the-sleepers-census', stage: 'novices' }, node: 'dream' }, { node: 'empty' }],
    nodes: {
      dream: { speaker: 'narrator', text: 'The smallest novice of all, asleep sitting up in a window seat. When you wake him he grabs your sleeve. “I was dreaming about the dark,” he whispers. “It was soft. Is that wicked?”', next: null },
      empty: { speaker: 'narrator', text: 'An empty window seat, warm in the sun. Everything in Dawnspire is warm in the sun.', next: null },
    },
  },
  {
    id: 'dialogue:cantor-celestine-census', name: 'I-2 report on the sleepers', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: CH, text: 'Six? I counted four this morning. It is getting worse by the hour, and we have nothing but hours. What did you see?',
        choices: [
          { text: 'They were weeping black in their sleep.', to: 'tears' },
          { text: 'The Lightbearers have gone hollow. They were hunting anyone who wasn’t singing.', to: 'hollow' },
          { text: 'The Book of Sleepers. Somebody has struck out every child’s name in it and written “Let her sleep. L. B.”', to: 'book', when: { flag: 'cantor.lucan_mercy' } },
        ],
      },
      book: { speaker: CH, mood: 'afraid', text: 'L. B. (She sits down on her cot.) The Inquisitor lets the children sleep, and arrests their mothers for selling them draughts. Oh, Lucan. You poor, kind, terrible boy. What are you so frightened of?', next: 'tears' },
      hollow: { speaker: CH, mood: 'afraid', text: 'Then the Brightwatch will say it is the singers’ fault for stopping. They will make the novices sing louder. That is their answer to everything.', next: 'tears' },
      tears: {
        speaker: CH, mood: 'sad', text: 'Black tears. People who can neither sleep nor grieve fill up with something, I suppose. Thirty years of things nobody was allowed to cry about at night, because there wasn’t one.',
        choices: [
          { text: 'Then let them sleep.', to: 'sleep', trust: 1 },
          { text: 'What can we do?', to: 'bell' },
        ],
      },
      sleep: { speaker: CH, text: 'You are a dangerous child. I like you very much. But first there is the bell.', next: 'bell' },
      bell: { speaker: CH, text: 'The great bell is rung once a minute to keep this city awake. Since your Bell rang, it has not stopped at all. The Choir is falling asleep on its feet. Go up to the Bell Loft and make it stop.', next: null },
    },
  },
  // ---------- I-3 The Bell Loft
  {
    id: 'dialogue:obj-great-bell-muffle', name: 'I-3 muffling the great bell', scope: 'party',
    entries: [{ when: { questStage: 'quest:cantor-the-bell-loft', stage: 'muffle' }, node: 'muffle' }, { node: 'quiet' }],
    nodes: {
      muffle: { speaker: 'narrator', text: 'You catch the clapper on its backswing and bind it in a novice’s cloak, then another, then your own. The great bell of Dawnspire swings once more, and makes a sound like a cushion falling over.', next: 'silence' },
      silence: { speaker: 'narrator', text: 'Then nothing. Far below, through the loft boards, you hear the whole Choir sit down at once.', next: null },
      quiet: { speaker: 'narrator', text: 'The great bell hangs still, wrapped in cloaks, like a very large and very important parcel.', next: null },
    },
  },
  {
    id: 'dialogue:cantor-celestine-loft', name: 'I-3 the bell is quiet', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: CH, mood: 'happy', text: 'Listen. Do you hear that? Nothing. Thirty years and I had forgotten what nothing sounded like. Brother Lambert has gone to sleep in the herb bed with a trowel in his hand.',
        choices: [
          { text: 'Something was ringing it. Something with six wings, weeping.', to: 'seraph' },
          { text: 'Will the Brightwatch mind?', to: 'mind' },
        ],
      },
      seraph: { speaker: CH, mood: 'sad', text: 'The Seraph of the Last Light. It used to ring the hours, gently, when there were hours to ring. Even the Seraphs are weeping now. Well.', next: 'mind' },
      mind: { speaker: CH, text: 'Oh, the Brightwatch minds. There is a summons for you already, in their very best handwriting. The Inquisitor himself would like to thank you, at the Sunward Market Cross.', next: 'warn' },
      warn: {
        speaker: CH, text: 'Lucan Brightwater is the kindest man in this city. I want you to remember that he is also the most dangerous.',
        choices: [
          { text: 'How can he be both?', to: 'both' },
          { text: 'I’ll be careful.', to: null, trust: 1 },
        ],
      },
      both: { speaker: CH, text: 'Easily. He wants everyone to be safe, and he is willing to do anything at all to make them so. Go. Be polite. Don’t yawn.', next: null },
    },
  },
  // ---------- I-4 The Inquisitor's Kindness
  {
    id: 'dialogue:cantor-lucan-market', name: 'I-4 meeting Lucan Brightwater', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'The Brightwatch is raiding the Sunward Market. Draught-sellers are being led away from their stalls, and every one of them is carrying a loaf and a folded blanket, handed to them by a thin man in smoked spectacles.', next: 'lucan' },
      lucan: {
        speaker: LU, mood: 'happy', text: 'You’re the Cantor who quieted the bell. Thank you. Truly. I’ve signed a petition against that bell every year for twelve years and nobody reads them. Would you like a loaf? I always bring too many.',
        choices: [
          { text: 'Why give bread to the people you arrest?', to: 'bread' },
          { text: 'Thank you, Inquisitor.', to: 'help' },
          { text: '(Look at his eyes, behind the spectacles.)', to: 'eyes', insight: 'cantor_lucan_eyes' },
          { text: 'You struck the children out of the Book of Sleepers.', to: 'struck', when: { flag: 'cantor.lucan_mercy' } },
        ],
      },
      struck: { speaker: LU, mood: 'sad', text: '(The smile goes, just for a breath.) Children should sleep. Children should always be allowed to sleep. It’s only when you grow up that it gets dangerous. Please don’t tell anyone. They’d make me stop.', next: 'bread' },
      eyes: { speaker: 'narrator', text: 'The glass is dark, but not dark enough. His eyes are red to the rims, and they never quite close when he blinks.', next: 'bread' },
      bread: { speaker: LU, text: 'Because they’re tired. Everyone’s so tired. They sell sleep because people are desperate for it, and I take them away because sleep is how the dark gets in. It isn’t their fault. It isn’t anyone’s fault. So: bread.', next: 'help' },
      help: {
        speaker: LU, text: 'Now help me keep the light, quietly. The draughts come from somewhere under the Cathedral. There’s a stair behind this market that nobody will admit to. Would you find it for me?',
        choices: [
          { text: 'I’ll find it.', to: 'end', quest: true },
          { text: 'And if I find the dark down there?', to: 'dark', quest: true },
        ],
      },
      dark: { speaker: LU, mood: 'sad', text: 'Then tell me, and I’ll deal with it, gently, so that you never have to. That’s what the Brightwatch is for.', next: 'end' },
      end: { speaker: LU, text: 'Thank you. Truly. Mind the glare out there; it’s worse in the afternoon.', next: null },
    },
  },
  {
    id: 'dialogue:obj-undercroft-door', name: 'I-4 the Undercroft door', scope: 'party',
    entries: [{ when: { questStage: 'quest:cantor-the-inquisitors-kindness', stage: 'way' }, node: 'find' }, { node: 'door' }],
    nodes: {
      find: { speaker: 'narrator', text: 'Behind the oldest drain in the Sunward Market, a stair, and at the bottom of the stair a door with no lamp over it. When you open it, there is no light beyond. None at all.', next: 'dark' },
      dark: { speaker: 'narrator', text: 'You have never stood in the dark before. Nobody your age in Dawnspire has. It is cool, and quiet, and the half-stone in your chest stops singing for a moment, as if it is listening too.', next: null },
      door: { speaker: 'narrator', text: 'The door to the Undercroft, the only door in Dawnspire with no lamp over it.', next: null },
    },
  },
  // ---------- I-5 The Jars of Night (faction choice; a party vote)
  {
    id: 'dialogue:cantor-jars-of-night', name: 'I-5 the jars of night', scope: 'party',
    entries: [{ when: { not: { flag: 'cantor.night_jars' } }, node: 'shelves' }, { node: 'after' }],
    nodes: {
      shelves: { speaker: 'narrator', text: 'Shelves to the vault of the Undercroft, and on every shelf a stoppered jar with a label in a neat round hand: “night, C. 998”, “a very still night, C. 1003”, “the night of the long frost, C. 1010”.', next: 'amabel' },
      amabel: { speaker: AM, text: 'Mind the bottom shelf, those are the windy ones. I’m Amabel. I keep the nights. Somebody had to, when they stopped happening. And now everyone has come down my stair at once.', next: 'bellamy' },
      bellamy: { speaker: OB, text: 'Inquisitor’s orders, Sister, I’m sorry, I truly am. Every jar to be carried up to the Close and broken in the sun. Every last one. He says it’s the only kind thing to do.', next: 'lambert' },
      lambert: { speaker: LD, text: 'And the Choir asks for one. Only one, Sister. Opened in the Cloisters, for an hour. The novices haven’t slept in years. Some of them never have.', next: 'listen' },
      listen: {
        speaker: 'narrator', text: 'They all look at you. On the nearest shelf a jar marked “a very still night, C. 1003” sits in your eyeline, and in the hush you could swear you hear it breathe.',
        choices: [
          { text: '(Ask Amabel what she would choose.)', to: 'ask' },
          { text: '(Lift the stopper of the nearest jar, just a crack.)', to: 'crack' },
          { text: '(Choose.)', to: 'choose' },
        ],
      },
      ask: { speaker: AM, mood: 'sad', text: 'Me? Nobody’s asked me that in six years. (She touches a label.) I’d want them kept, love. Not broken, not spent. Kept, the way you keep letters. But I’m only the one who dusts them.', next: 'choose' },
      crack: { speaker: 'narrator', text: 'A thread of cool dark comes out of the jar and lies across the back of your hand, soft as a cat’s tail. Bellamy flinches. Lambert closes his eyes. Then you put the stopper back, and the room is bright again, and somehow smaller.', next: 'choose' },
      choose: {
        speaker: AM, text: 'Well, Cantor? You found my door. You may as well choose what goes through it.',
        choices: [
          { text: 'Break them in the sun. Lucan is right: the dark only hurts people.', to: 'broken', quest: true, trustNpc: CH, trust: -1, effects: [{ setFlag: 'cantor.night_jars', value: 'broken' }] },
          { text: 'Give the Choir its jar. Let the novices sleep.', to: 'opened', quest: true, effects: [{ setFlag: 'cantor.night_jars', value: 'opened' }, { setFlag: 'cantor.night_speaker', value: true }] },
          { text: 'Neither. Let me sing Compline, and open them only as far as people need.', to: 'compline', quest: true, insight: 'cantor_sang_compline', when: { insight: 'compline' }, effects: [{ setFlag: 'cantor.night_jars', value: 'compline' }] },
        ],
      },
      broken: { speaker: AM, mood: 'sad', text: 'All of them. Very well. I’ll write the labels out again for the record, so somebody remembers what was in them. (She turns away to the shelves, and does not turn back.)', next: null },
      opened: { speaker: OB, mood: 'afraid', text: 'You know I have to report this. You know they’ll put your face on the doors. (He writes something, very slowly, and crosses it out, and writes it again.) I’m sorry. It’s the law.', next: null },
      compline: { speaker: AM, mood: 'happy', text: 'Compline. Nobody has sung that down here in thirty years. Go on, then. I’ll take the stoppers out as you sing, one at a time, and we’ll see how dark people want it.', next: null },
      after: { speaker: AM, text: 'It’s decided. The nights will go where you sent them. Pick up the jar, love; it won’t carry itself, though some of the windy ones try.', next: null },
    },
  },
  {
    id: 'dialogue:obj-night-jar', name: 'I-5 the night-jar', scope: 'party',
    entries: [
      { when: { all: [{ questStage: 'quest:cantor-the-jars-of-night', stage: 'jar' }, { flag: 'cantor.night_jars', value: 'broken' }] }, node: 'broken' },
      { when: { all: [{ questStage: 'quest:cantor-the-jars-of-night', stage: 'jar' }, { flag: 'cantor.night_jars', value: 'opened' }] }, node: 'opened' },
      { when: { all: [{ questStage: 'quest:cantor-the-jars-of-night', stage: 'jar' }, { flag: 'cantor.night_jars', value: 'compline' }] }, node: 'compline' },
      { node: 'jar' },
    ],
    nodes: {
      broken: { speaker: 'narrator', text: 'You carry the jars up into the Close by the cartload, and the Brightwatch breaks them on the steps in the full light of noon. Each one lets out a breath of cool dark that lasts no longer than a sigh, and then is burned away.', next: 'broken2' },
      broken2: { speaker: 'narrator', text: 'By the last jar the Close is bright and dry and perfectly safe. Somewhere below your feet, very quietly, Sister Amabel is crying.', next: null },
      opened: { speaker: 'narrator', text: 'In the Cloister garth, with the novices sitting in a ring on the grass, you take the stopper out of “a mild night, C. 1007”. The dark comes out of it slowly, like water filling a bowl, until you cannot see your own hands.', next: 'opened2' },
      opened2: { speaker: 'narrator', text: 'For an hour the Cloisters sleep. Some of the novices wake up crying, and their tears are clear and ordinary and warm, and they do not know what to do with them, so they hold each other.', next: null },
      compline: { speaker: 'narrator', text: 'You sing Compline in the Undercroft, and Amabel lifts the stoppers one by one. The dark comes up the stair as far as people need it and no further. All across the Close the light softens to dusk, for one hour, for the first time in thirty years.', next: 'compline2' },
      compline2: { speaker: 'narrator', text: 'In the Sunward Market, they will tell you later, a thin man in smoked spectacles stopped dead in the middle of the square with a loaf in his hands, and stood there listening until the hymn was done.', next: null },
      jar: { speaker: 'narrator', text: 'A stoppered jar of night. It is cool to the touch, and very slightly heavier than it looks.', next: null },
    },
  },
  // ---------- I-6 The Reliquary of Hours
  {
    id: 'dialogue:cantor-celestine-reliquary', name: 'I-6 Celestine sends you to the Reliquary', scope: 'party',
    entries: [
      { when: { flag: 'cantor.night_jars', value: 'broken' }, node: 'broken' },
      { when: { flag: 'cantor.night_jars', value: 'opened' }, node: 'opened' },
      { node: 'compline' },
    ],
    nodes: {
      broken: {
        speaker: CH, mood: 'angry', text: 'The jars are broken. I heard them, every one. (A long breath.) Lucan is pleased with you. So pleased that he would like you to fetch him the Saint of Noon’s relic from the Reliquary of Hours, to bless his light.',
        choices: [{ text: 'You’re angry with me.', to: 'angry' }, { text: 'What’s in the Reliquary?', to: 'vault' }],
      },
      angry: { speaker: CH, text: 'I am tired, which looks the same from outside. Go, and look at everything down there, not just the relic he wants.', next: 'vault' },
      opened: {
        speaker: CH, mood: 'happy', text: 'They slept. Forty-one novices slept for an hour, and woke up crying like children, and I have never been so proud of anyone. Your face is on every Brightwatch door in the Close. Not a good likeness. Too awake.',
        choices: [{ text: 'Where do I hide?', to: 'hide' }],
      },
      hide: { speaker: CH, text: 'The one place the Brightwatch never searches is the Reliquary of Hours, because they are embarrassed by it. Go down there until they get bored.', next: 'vault' },
      compline: {
        speaker: CH, mood: 'happy', text: 'You sang Compline in my Close. Out loud. All of it. I stood at my window and wept like a fool, and I have not cried in six years. The Brightwatch is turning the Reliquary over looking for whoever taught it to you.',
        choices: [{ text: 'Then I’d better get there first.', to: 'vault', trust: 1 }],
      },
      vault: { speaker: CH, text: 'Every relic the Cathedral was ever sold is in that vault, and most of them are lies. Three heads of the Saint of Noon, as I recall, and none of them match. Something down there has started moving about. Be careful.', next: null },
    },
  },
  {
    id: 'dialogue:obj-reliquary-evidence-box', name: 'I-6 the one true relic', scope: 'party',
    entries: [{ when: { questStage: 'quest:cantor-the-reliquary-of-hours', stage: 'box' }, node: 'box' }, { node: 'empty' }],
    nodes: {
      box: { speaker: 'narrator', text: 'A plain grey box with a Brightwatch seal, wedged in the Saint’s ribcage where a heart would go. Inside, wrapped in a child’s nightshirt, a stub of candle: a night-candle, the kind children were given before C. 1012 so they wouldn’t be afraid.', next: 'label' },
      label: { speaker: 'narrator', text: 'The label on the box is in careful, grown-up writing: “Evidence. L. B., C. 1012. Not to be destroyed.” Somebody underlined “not” three times.', next: null },
      empty: { speaker: 'narrator', text: 'The empty evidence box, among a heap of pigs’ knuckles that were once a saint.', next: null },
    },
  },
  // ---------- I-7 The Last Night
  {
    id: 'dialogue:cantor-celestine-candle', name: 'I-7 Celestine reads the label', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: CH, mood: 'sad', text: 'L. B. Lucan Brightwater. His mother sang alto in this Choir. She died on the last night Dawnspire ever had, in C. 1012. He was nine.', next: 'night' },
      night: {
        speaker: CH, text: 'The next morning the Hierarch decreed that night must never come again. I always thought it was grief. I never thought about who else was grieving.',
        choices: [
          { text: 'He kept the candle for thirty years.', to: 'kept' },
          { text: 'Has he slept since?', to: 'slept', when: { any: [{ insight: 'cantor_never_dreams' }, { insight: 'cantor_lucan_eyes' }] } },
        ],
      },
      slept: { speaker: CH, mood: 'afraid', text: 'I don’t know. I have never once seen him yawn. Not once, in all the years I’ve been awake, and I have been awake a great deal.', next: 'kept' },
      kept: { speaker: CH, text: 'Take it back to him. Gently. And watch his face when you do; that is where the truth will be.', next: null },
    },
  },
  {
    id: 'dialogue:cantor-lucan-last-night', name: 'I-7 Lucan and the candle', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: LU, text: 'You found the Saint, I hear. Pigs’ knuckles. I always suspected. What have you got there?', next: 'candle' },
      candle: { speaker: LU, mood: 'sad', text: '(He goes very still.) Where did you… I lit that. The night my mother died. I held it all night so she wouldn’t be in the dark, and in the morning she was gone anyway, and the candle wasn’t even half burned down.', next: 'plan' },
      plan: {
        speaker: LU, text: 'Do you see now? The dark takes people. It always has. The Altar half has woken for you. Set it in the great lens of the Cathedral and the light will never fail again. No Dimming. No Undercroft. Nobody has to lose anyone in the night, ever again.',
        choices: [
          { text: 'And nobody will ever sleep again.', to: 'sleep' },
          { text: 'When did you last sleep, Lucan?', to: 'awake', insight: 'lucan_awake', when: { any: [{ insight: 'cantor_never_dreams' }, { insight: 'cantor_lucan_eyes' }] } },
          { text: 'Grief needs the dark. That’s what the dark is for.', to: 'grief', school: 'radiance' },
          { text: 'Somebody polishes her stall in the quire every morning, Lucan.', to: 'stall', when: { flag: 'cantor.alto_stall' } },
        ],
      },
      stall: { speaker: LU, mood: 'sad', text: '(His hand goes to the cuff of his coat, where there is a smear of beeswax.) Every morning, before Prime. Somebody has to. If it gets dusty, people will think she isn’t coming back. (A pause.) I know she isn’t coming back.', next: 'sleep' },
      awake: { speaker: LU, text: 'Last… (He opens his mouth to answer, and nothing comes. He tries again.) I’m sure it was recently. It doesn’t matter. I don’t need it. I haven’t needed it since…', next: 'awake2' },
      awake2: { speaker: 'narrator', text: 'He stops, because he has worked out the end of the sentence. Behind the smoked glass, his eyes are wet and black.', next: 'sleep' },
      grief: { speaker: LU, mood: 'angry', text: 'Then grief can do without it. Better nobody grieves than somebody grieves alone in the dark, holding a candle that isn’t enough.', next: 'sleep' },
      sleep: {
        speaker: LU, text: 'I’m going up to the High Altar now. I’d hoped you’d bring the stone yourself. If you won’t, I’ll take it, as gently as I can.',
        choices: [
          { text: '(Give him back the candle.)', to: 'give', effects: [{ setFlag: 'cantor.candle', value: 'returned' }] },
          { text: '(Keep the candle.) I’ll hold it for you until you want it.', to: 'keep', effects: [{ setFlag: 'cantor.candle', value: 'kept' }] },
        ],
      },
      give: { speaker: LU, mood: 'sad', text: '(He holds it the way you would hold something that might wake.) Thank you. Truly. I’m sorry about what comes next.', next: null },
      keep: { speaker: LU, text: 'Keep it, then. It was never enough anyway. (He turns towards the Cathedral, and the light seems to lean after him.) I’m sorry about what comes next.', next: null },
    },
  },
  // ---------- I-8 The High Altar
  {
    id: 'dialogue:obj-radiance-capital-halfstone', name: 'I-8 the Altar half', scope: 'party',
    entries: [{ when: { questStage: 'quest:cantor-the-high-altar', stage: 'stone' }, node: 'claim' }, { node: 'altar' }],
    nodes: {
      claim: { speaker: 'narrator', text: 'On the High Altar, in a pool of light so white it rings, lies half of a crystal, cracked clean across, singing. Above it the great lens burns, and in the lens, very small, you can see Lucan, getting his breath, watching you.', next: 'hand' },
      hand: {
        speaker: 'narrator', text: 'The light here is so bright that you have no shadow at all. Nobody in this room has had a shadow for thirty years.',
        choices: [
          { text: '(Lift it.)', to: 'lift' },
          { text: '(Cup your hands round it first, and make a little dark.)', to: 'dark', school: 'radiance' },
          { text: '(Look up at Lucan in the lens.)', to: 'look' },
        ],
      },
      dark: { speaker: 'narrator', text: 'You cup your hands round the half-stone, and between your palms there is a small, perfect dark, the size of a held breath. In it the stone sings softer, and slower, the way a child sings when it is nearly asleep.', next: 'lift' },
      look: { speaker: LU, mood: 'sad', text: '(From the lens, quite gently.) Don’t. Please. Leave it in the light. If you take it out, the lens will cloud, and the Dimming will come in through the windows, and somebody, somewhere, will be alone in the dark tonight.', next: 'lift' },
      lift: { speaker: 'narrator', text: 'It lifts for you like a bird coming to a hand. It is not hot. It feels like holding someone’s hand in the dark. And all round you, for the first time in thirty years, the great lens of the Sun Cathedral begins, very slowly, to cloud.', next: 'lucan' },
      lucan: {
        speaker: LU, mood: 'sad', text: '(His voice, from somewhere up in the great lens, already far away along a beam of light.) Keep it bright for me, Cantor. I’ll be at the Dawn Gate. Everyone has to go through the gate in the end.',
        choices: [
          { text: '(Watch the lens dim.)', to: 'dim' },
          { text: '(Look down. You have a shadow.)', to: 'shadow' },
        ],
      },
      dim: { speaker: 'narrator', text: 'The white goes out of the great lens like milk out of a glass, and the Cathedral fills with an ordinary afternoon light, gold and slanting. Somewhere below you, a novice yawns, enormously, and nobody fines her.', next: null },
      shadow: { speaker: 'narrator', text: 'There, on the floor of the High Altar, stretching away from your feet, faint and grey and entirely yours: a shadow. You have never had one. It moves when you move. You find you are laughing.', next: null },
      altar: { speaker: 'narrator', text: 'The High Altar of the Sun Cathedral, bare. The great lens above it has gone cloudy for the first time in thirty years.', next: null },
    },
  },
  // ---------- I-9 The Dawn Road (mentor farewell; trust check)
  {
    id: 'dialogue:cantor-celestine-farewell', name: 'I-9 Celestine’s farewell', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: CH, text: 'So. You have it, and he has gone for the gate, and you will have to follow him through. I would come, but someone must keep this Choir singing, and singing is the only thing I have ever been any good at.',
        choices: [
          { text: 'Come with me anyway.', to: 'stay' },
          { text: 'Thank you, Mother. For all of it.', to: 'gifts', trust: 1 },
        ],
      },
      stay: { speaker: CH, text: 'I would fall asleep on the road and you would have to carry me, and I am heavier than I look. No. Dawnspire needs someone who remembers what the dark was for.', next: 'gifts' },
      gifts: {
        speaker: CH, text: 'I have something for you.',
        choices: [
          { text: '(Take what she holds out.)', to: 'censer', when: { trust: CH, value: 'friendly' } },
          { text: '(Bow to her, the way the Choir bows.)', to: 'bow', when: { not: { trust: CH, value: 'friendly' } } },
        ],
      },
      censer: { speaker: CH, text: 'The little sun off the lid of my censer. I unscrewed it this morning. They say it stays warm in the dark. I wouldn’t know. You can tell me.', effects: [{ giveItem: 'i_celestine_sun' }, { setFlag: 'cantor.celestine_censer', value: true }], next: 'more' },
      more: {
        speaker: CH, mood: 'sad', text: 'Is there anything else you want from an old woman before you go?',
        choices: [
          { text: 'Sing me Compline, Mother. The way it used to go.', to: 'compline', when: { all: [{ trust: CH, value: 'trusted' }, { insight: 'compline' }] } },
          { text: 'Sing me something. Anything.', to: 'hymn', when: { all: [{ trust: CH, value: 'trusted' }, { not: { insight: 'compline' } }] } },
          { text: 'Only that you rest.', to: 'end' },
        ],
      },
      compline: { speaker: 'narrator', text: 'She sings Compline, the whole of it, very softly, the way it was sung when the Choir still sang the light down. At the second verse her voice slows. At the third her head goes down on your shoulder, and she is asleep.', next: 'pin' },
      hymn: { speaker: 'narrator', text: 'She sings you the first line of Compline, which is all of it she remembers, and then hums the rest, and makes it up. Halfway through her own farewell she falls asleep sitting up, with her hand on your sleeve.', next: 'pin' },
      pin: { speaker: CH, text: '(When she wakes, she is mortified, and pretends she isn’t.) I was resting my eyes. Here. My halo-pin. Don’t argue, I have another, it’s only gold. Put it on when you get somewhere dark.', effects: [{ setFlag: 'cantor.halo_pin', value: true }], next: 'end' },
      bow: { speaker: CH, text: 'Well. Mind the road. Mind the Hierarch. Mind your collar.', next: null },
      end: { speaker: CH, text: 'Go on. The Dawn Road is straight and the light is behind you. That is the only time it’s any use.', next: null },
    },
  },
  // ---------- I-10 The Dawn Gate
  {
    id: 'dialogue:cantor-hierarch', name: 'I-10 the Fallen Hierarch', scope: 'party',
    entries: [
      { when: { all: [{ flag: 'cantor.hierarch_shadow' }, { not: { flag: 'cantor.shadow_returned' } }] }, node: 'shadow' },
      { node: 'blaze' },
    ],
    nodes: {
      blaze: { speaker: 'narrator', text: 'The Fallen Hierarch stands in the Dawn Gate with his arms spread, in a golden mask with a face of perfect calm, and the light pours off him like heat off a road. Black tears are running out from under the mask.', next: null },
      shadow: {
        speaker: 'narrator', text: 'The Fallen Hierarch blazes in the Dawn Gate. In the jar at your belt, his shadow has pressed itself flat against the glass, towards him, the way a dog strains at a lead.',
        choices: [
          { text: '(Uncork the jar.)', to: 'give', effects: [{ setFlag: 'cantor.shadow_returned', value: true }] },
          { text: '(Not yet.)', to: 'blaze' },
        ],
      },
      give: { speaker: 'narrator', text: 'The shadow pours out across the road and runs to his feet, and lies down there, where a shadow should be. For the first time in thirty years the Hierarch has something behind him. His first blaze comes out half as bright, and he staggers.', next: null },
    },
  },
];

export default dialogues;
