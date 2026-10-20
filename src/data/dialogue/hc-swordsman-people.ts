/**
 * Hollow Crown, SWORDSMAN: Edgewater people (general talk), the eight side quests, the mentor thread and the
 * bounties, plus the Act II class-thread and featured-bearer scenes. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const offer = (q: Q, text: string, to: string, extra?: NarrativeCondition): DialogueChoice =>
  ({ text, to, quest: true, when: extra ? { all: [fresh(q), extra] } : fresh(q), effects: [{ startQuest: q }] });
const bye: DialogueChoice = { text: 'Farewell.', to: null, tag: 'leave' };
const LF = 'npc:lucia-ferro' as const, AV = 'npc:auguste-vellacourt' as const, PC = 'npc:percy-thimble-concordia' as const;

/** one object scene per numbered set piece: the quest-stage text, then a plain line afterwards */
const objs = (slug: string, q: Q, st: string, texts: string[], after: string): DialogueDef[] =>
  texts.map((text, i) => ({
    id: `dialogue:obj-${slug}-${i + 1}` as const, name: `${slug} ${i + 1}`,
    entries: [{ when: stage(q, st), node: 'now' }, { node: 'after' }],
    nodes: { now: { speaker: 'narrator', text, next: null }, after: { speaker: 'narrator', text: after, next: null } },
  }));

const dialogues: DialogueDef[] = [
  // ---------- Ferro (general + mentor thread)
  {
    id: 'dialogue:swordsman-ferro', name: 'Ferro (general)',
    entries: [{ when: { all: [stage('quest:swordsman-strike-them-off', 'challenges'), { not: { flag: 'swordsman.delight.salle' } }] }, node: 'salle' }, { node: 'start' }],
    nodes: {
      salle: { speaker: LF, text: 'Five challenges on the Ladder board, and you are standing in my salle. I have looked. The Ladder board is not in my salle. (You turn to go.) Hm. That turn was better. Go.', effects: [{ setFlag: 'swordsman.delight.salle', value: true }], next: null },
      start: {
        speaker: LF, text: 'Feet. Show me your feet. Hm. Better. Not good. Better.',
        choices: [
          offer('quest:swordsman-ferros-last-bout', 'What’s in the bottom drawer you never open?', 'drawer', { all: [{ trust: LF, value: 'friendly' }, { questCompleted: 'quest:swordsman-the-champions-salute' }] }),
          offer('quest:swordsman-the-hand-that-quit', 'Your hand is shaking, Maestra.', 'hand', { all: [{ trust: LF, value: 'trusted' }, { questCompleted: 'quest:swordsman-the-grand-salle' }] }),
          { text: 'Teach me something.', to: 'teach' },
          { text: 'Who taught you, Maestra?', to: 'nonna', when: { trust: LF, value: 'trusted' } },
          bye,
        ],
      },
      nonna: { speaker: LF, text: 'My grandmother. She sold eels on the Duelling Bridges and fenced anyone who tried to cross without buying one, with a gutting knife. She was never once challenged twice. People bought eels.', next: 'nonna2' },
      nonna2: {
        speaker: LF, mood: 'happy', text: 'She taught me on the fish-cart. Feet first. Always feet. “A blade only goes where your feet have already been, Lucia.” I was champion at twenty-six. She came to the bout with a bucket of eels and sold the lot.',
        choices: [
          { text: 'She sounds terrifying.', to: 'nonna3' },
          { text: 'Did she ever see you quit?', to: 'nonna4', trust: 1 },
        ],
      },
      nonna3: { speaker: LF, text: 'She was. I adored her. When I am being impossible, which is always, I am being her. Now go away and do your feet.', next: null },
      nonna4: { speaker: LF, mood: 'sad', text: 'Retire. We say retire. (A pause.) No. She was gone five years by then. (She is quiet a moment.) I think she would have understood. She never once let a quarrel over an eel last past supper. Go and do your feet.', next: null },
      drawer: { speaker: LF, text: 'Bills, mostly. And the bout-sheet from the last duel I ever fenced. (A pause.) Go on, then. You’ll only look when I’m out.', next: null },
      hand: { speaker: LF, mood: 'sad', text: 'It has shaken for thirty years. Since I put the sword down. (She holds it out, flat, and watches it tremble.) I want to fence one bout. To the first touch. And I want it to end. Will you?', next: null },
      teach: {
        speaker: LF, text: 'Very well. Lesson. Anyone can start a fight. Children start fights. The whole art of the sword is in the other end.',
        choices: [
          { text: 'Ending them.', to: 'ending', trust: 1 },
          { text: 'Winning them.', to: 'winning' },
        ],
      },
      ending: { speaker: LF, text: 'Good. Go away before I say something kind.', next: null },
      winning: { speaker: LF, text: 'Winning is the middle. Go away and think about the end.', next: null },
    },
  },
  {
    id: 'dialogue:obj-ferro-bout-record', name: 'Ferro’s last bout-sheet', scope: 'party',
    entries: [{ when: stage('quest:swordsman-ferros-last-bout', 'record'), node: 'sheet' }, { node: 'after' }],
    nodes: {
      sheet: { speaker: 'narrator', text: 'Under the bills, a bout-sheet. “Fencing Hall, C. 1012, the night of the Hollowing. Ferro against Vellacourt. Five touches to three. Ferro.” Under it, in the same clerk’s hand, a second line: “Vellacourt challenges again. Ferro yields.” And then, in Ferro’s own writing: “Ended.”', next: null },
      after: { speaker: 'narrator', text: 'Ferro’s bottom drawer, shut again.', next: null },
    },
  },
  {
    id: 'dialogue:swordsman-ferro-yield', name: 'Mentor: Ferro’s Last Bout', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: LF, text: 'You read it. Of course you read it. Well?', next: 'q' },
      q: {
        speaker: LF, text: 'I won. Five to three, and it was beautiful. Then he said “Again”, and the Bell didn’t ring, and I saw it would never end. So I yielded. To the man I had just beaten. And I wrote one word on the sheet, because nobody else was going to.',
        choices: [
          { text: 'A yield is an ending too.', to: 'end', insight: 'swordsman_ferro_yield', trust: 1 },
          { text: 'They think you lost your nerve.', to: 'nerve' },
        ],
      },
      nerve: { speaker: LF, text: 'They do. Let them. A yield is an ending too, you know. The only kind he can’t say “Again” to.', effects: [{ insight: 'swordsman_ferro_yield' }], next: 'end' },
      end: { speaker: LF, mood: 'sad', text: 'It is the only one he could never take from me. Remember that, if they ever ask you how a fight should end.', next: null },
    },
  },
  {
    id: 'dialogue:obj-grand-salle-piste', name: 'One bout with Ferro', scope: 'party',
    entries: [{ when: stage('quest:swordsman-the-hand-that-quit', 'piste'), node: 'bout' }, { node: 'after' }],
    nodes: {
      bout: { speaker: LF, text: '(She is on the piste in shirtsleeves, sword up, and it is not shaking.) First touch. Salute.', next: 'fence' },
      fence: {
        speaker: 'narrator', text: 'For a moment she is thirty years younger and the best there has ever been. Then she is an old woman in an empty salle, a step too slow. You see the opening.',
        choices: [
          { text: '(Take the touch.)', to: 'touch' },
          { text: '(Let her take it.)', to: 'let' },
        ],
      },
      touch: { speaker: 'narrator', text: 'Your point finds her shoulder, light as a hand. She stops. She salutes you, the closing salute, and puts the sword down on the boards, and her hand is still.', next: null },
      let: { speaker: 'narrator', text: 'You let your guard open half an inch. She sees it, and you see her see it, and she takes the touch, and then she laughs, out loud, for the first time you can remember. She salutes, and lays the sword down. Her hand is still.', next: null },
      after: { speaker: 'narrator', text: 'The empty piste of the Grand Salle. A sword lies on the boards, laid down.', next: null },
    },
  },
  {
    id: 'dialogue:swordsman-ferro-steps', name: 'Mentor: The Hand That Quit', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: LF, text: '(On the salle steps, looking at her hand.) Thirty years it shook. And now it doesn’t. Because the bout ended. Gods, is that all it ever was?',
        choices: [{ text: 'Ended.', to: 'end' }, { text: '(Sit with her.)', to: 'end' }],
      },
      end: { speaker: LF, mood: 'happy', text: 'Ended. (She says it like a word she had forgotten the taste of.) Thank you. You are a terrible fencer and a good student. I would not have it the other way round.', effects: [{ trust: LF, delta: 1 }], next: null },
    },
  },
  // ---------- Vellacourt and the Council (general)
  {
    id: 'dialogue:swordsman-vellacourt', name: 'Vellacourt (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:auguste-vellacourt', mood: 'happy', text: 'My favourite challenger! Again?',
        choices: [
          { text: 'Do you ever stop?', to: 'stop' },
          { text: 'What happened to everyone you beat?', to: 'beat', when: { flag: 'swordsman.vellacourt_met' } },
          bye,
        ],
      },
      stop: { speaker: 'npc:auguste-vellacourt', text: 'Stop? Why would anyone stop? Stopping is just losing slowly. Again!', next: null },
      beat: { speaker: 'npc:auguste-vellacourt', text: 'Oh, I keep them. Somewhere safe. Somewhere they can keep practising. Wouldn’t you want to be kept?', next: null },
    },
  },
  {
    id: 'dialogue:swordsman-cosimo', name: 'Maestro Cosimo Bracca (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:cosimo-bracca', text: 'The Salles’ Council sits when it must and argues when it can. Was there a motion you wished to raise? Please don’t.', next: null } },
  },
  // ---------- the Fencing Quarter: Rung 4,012, the Insult Broker, bounties
  {
    id: 'dialogue:swordsman-percy', name: 'Percy Thimble',
    entries: [
      { when: stage('quest:swordsman-rung-4012', 'percy'), node: 'won' },
      { when: stage('quest:swordsman-the-empty-salle', 'student'), node: 'student' },
      { node: 'start' },
    ],
    nodes: {
      start: {
        speaker: 'npc:percy-thimble', mood: 'happy', text: 'Percy Thimble, tailor, rung 4,012! The very bottom! Nine hundred and ninety-nine bouts, nine hundred and ninety-nine losses. Next one’s my thousandth. I’d love to win one. Just the one.',
        choices: [offer('quest:swordsman-rung-4012', 'I’ll train you.', 'train'), bye],
      },
      train: { speaker: 'npc:percy-thimble', mood: 'happy', text: 'Would you? Oh, would you! I’ve a dummy in the back of the shop. I made it myself. It’s very well dressed.', next: null },
      won: {
        speaker: 'npc:percy-thimble', mood: 'happy', text: 'I WON! Did you see? By a pin! An actual pin! It was in my sleeve! Is that allowed? Nobody said it wasn’t allowed!',
        choices: [{ text: 'A touch is a touch, Percy.', to: 'touch', trust: 1 }, { text: 'Best not to do it again.', to: 'again' }],
      },
      touch: { speaker: 'npc:percy-thimble', text: 'A touch is a touch! I’m going to have that embroidered on something. Here. I made you gloves. Fencing gloves, with a little pin-pocket.', next: 'chalk' },
      again: { speaker: 'npc:percy-thimble', text: 'I won’t. Probably. Here, I made you gloves. There’s a pin-pocket. In case.', next: 'chalk' },
      chalk: { speaker: 'npc:percy-thimble', mood: 'afraid', text: 'Oh. Oh no. (Through the window, across the square, someone is chalking on the Ladder board.) Orsola Nappi. Rung 4,011. She’s challenged me again. Already. Of course she has. Everybody does. Come with me? I’ll want a second.', next: null },
      student: {
        speaker: 'npc:percy-thimble', text: 'A master? Wants me? To teach properly, from the beginning? (He sits down on a bolt of cloth.) Nobody has ever wanted to teach me properly. They always just wanted to beat me.',
        choices: [{ text: 'Master Grisi wants a student. You want to learn. Eight sharp.', to: 'yes' }],
      },
      yes: { speaker: 'npc:percy-thimble', mood: 'happy', text: 'Eight sharp! I’ll bring a packed lunch. And a pincushion. And a notebook. Oh, I shall need a new coat for this.', next: null },
    },
  },
  {
    id: 'dialogue:obj-percy-practice-dummy', name: 'Percy’s practice dummy', scope: 'party',
    entries: [{ when: stage('quest:swordsman-rung-4012', 'drill'), node: 'drill' }, { node: 'after' }],
    nodes: {
      drill: {
        speaker: 'narrator', text: 'Percy’s dummy is wearing a waistcoat finer than anything you own. Percy lunges at it with his eyes shut. He has been doing this for nine hundred and ninety-nine bouts.',
        choices: [
          { text: 'Eyes open, Percy.', to: 'eyes' },
          { text: 'Fix his feet. Then fix his feet again.', to: 'feet', school: 'blade' },
        ],
      },
      eyes: { speaker: 'narrator', text: 'He opens his eyes, and lunges, and hits the dummy, and screams with joy. Then he does it again. Then he apologises to the dummy.', next: null },
      feet: { speaker: 'narrator', text: 'You move his back foot two inches. He lunges, and the lunge is suddenly a real one, and he stares at his own feet as if they belong to somebody much more impressive.', next: null },
      after: { speaker: 'narrator', text: 'Percy’s dummy, in its waistcoat, with a small hole in it.', next: null },
    },
  },
  {
    id: 'dialogue:obj-percy-bout-ring', name: 'Percy’s thousandth bout', scope: 'party',
    entries: [{ when: stage('quest:swordsman-rung-4012', 'bout'), node: 'bout' }, { node: 'after' }],
    nodes: {
      bout: { speaker: 'narrator', text: 'Rung 4,012 against rung 4,011, under the Ladder board, at noon. Both are tailors. The crowd is three cats and you. They salute. They fence, badly and bravely.', next: 'pin' },
      pin: { speaker: 'narrator', text: 'Percy trips. His sword goes one way and he goes the other, and as he falls a pin flies out of his sleeve and pricks rung 4,011 on the elbow. Silence. “Touch,” says rung 4,011, with enormous dignity. Percy bursts into tears.', next: null },
      after: { speaker: 'narrator', text: 'Under the Ladder board, the chalk for rung 4,012 has been rubbed out and written in again, one rung higher.', next: null },
    },
  },
  {
    id: 'dialogue:swordsman-celandine', name: 'Madame Celandine Sallow (the Insult Broker)',
    entries: [{ when: stage('quest:swordsman-the-insult-broker', 'sallow'), node: 'report' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:celandine-sallow', text: 'Insults! Pre-written, freshly sharpened, guaranteed to start a duel or your money back! Nobody’s bought one in a month. Everyone’s too tired to be offended. Do you write?',
        choices: [offer('quest:swordsman-the-insult-broker', 'I could try some new ones out.', 'try'), bye],
      },
      try: { speaker: 'npc:celandine-sallow', text: 'Bless you. Three duellists, three fresh insults. If one of them reaches for a sword, I’m back in business. Be cruel, darling. Be inventive. Be quick.', next: null },
      report: {
        speaker: 'npc:celandine-sallow', text: 'Well? Did anyone draw?',
        choices: [
          { text: 'One laughed. One thanked me. One said he was too tired to care.', to: 'tired' },
          { text: 'Perhaps sell apologies instead.', to: 'apology', trust: 1 },
        ],
      },
      tired: { speaker: 'npc:celandine-sallow', mood: 'sad', text: 'Too tired to care. Thirty years of “again” and nobody has the strength left to be offended. That’s the saddest thing I ever heard, and I’ve heard all my own insults.', next: 'hat' },
      apology: { speaker: 'npc:celandine-sallow', mood: 'happy', text: 'Apologies! Pre-written! “Sir, I withdraw the matter of your hat.” Oh, that’s good. That’s very good. Nobody in Edgewater has the first idea how to say sorry. I’ll make a fortune.', next: 'hat' },
      hat: { speaker: 'npc:celandine-sallow', text: '(She takes out a card, already written, and looks at it a long time.) My first insult was about Cosimo Bracca’s hat. Forty years ago. He challenged me, I wouldn’t fence him, and we haven’t spoken since. This is my first apology. Take it to him? I’d only make it worse.', next: null },
    },
  },
  ...objs('insult-test', 'quest:swordsman-the-insult-broker', 'test', [
    'You tell a duellist from the Salle Orsi that his footwork looks like a goose on ice. He considers this. “It does,” he says, sadly. “It really does.” He thanks you and walks off, practising.',
    'You inform a duellist from rung 300 that her mother fences like a haddock. She laughs so hard she has to sit down. Then she tells you about her mother, at some length, fondly.',
    'You call an old duellist a coward to his face. He looks at you with eyes that have not slept properly in thirty years. “Probably,” he says. “I’ve been fighting the same man since I was twenty. I’m too tired to mind.”',
  ], 'A duellist who has already heard that one.'),
  {
    id: 'dialogue:swordsman-ugo', name: 'Watch-Sergeant Ugo Fiore (bounties)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ugo-fiore', text: 'Quarter Watch. Bounties on the post. We pay by the head, and by the Revenant, and by the automaton, and one week, memorably, by the goose.',
        choices: [
          offer('quest:swordsman-bounty-midnight-revenants', 'The Midnight Revenants.', 'rev'),
          offer('quest:swordsman-bounty-drill-sergeant', 'The Rusted Drill-Sergeant.', 'drill'),
          bye,
        ],
      },
      rev: { speaker: 'npc:ugo-fiore', text: 'Out of the duel-graves every midnight, challenging whoever’s passing. Six of them, and the night shift will kiss your boots.', next: null },
      drill: { speaker: 'npc:ugo-fiore', text: 'A Training Automaton got out of the Armoury and is drilling people on the Bridges. Old Signora Pesce has done four hundred lunges this week. She’s eighty. She’s never been fitter. She’s furious.', next: null },
    },
  },
  // ---------- the Duelling Bridges: the Sisters' Bridge, Lunch Is a Challenge
  {
    id: 'dialogue:swordsman-bettina', name: 'Bettina Sarto (the Sisters’ Bridge)',
    entries: [{ when: stage('quest:swordsman-the-sisters-bridge', 'bettina'), node: 'over' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:bettina-sarto', text: 'My sister Rosa. Thirty years ago, on this bridge, mid-duel, the Bell didn’t ring and her opponent’s blade did. Now she waits out there with her sword up. I come and sit on this bank every day. I’m eighty-one. I would like her to come home.',
        choices: [offer('quest:swordsman-the-sisters-bridge', 'I’ll go out to her.', 'go'), bye],
      },
      go: { speaker: 'npc:bettina-sarto', text: 'Not with your sword, please. Everyone goes out with a sword. She’s had enough swords.', next: null },
      over: {
        speaker: 'npc:bettina-sarto', text: '(She is standing up, for the first time in thirty years, watching her sister lie down on the bridge.) It’s over. Isn’t it. It’s over.',
        choices: [
          { text: 'You yielded for her. That ended it.', to: 'yield', insight: 'swordsman_ferro_yield', trust: 1, when: { flag: 'swordsman.bettina_yielded' } },
          { text: 'It’s over, Bettina.', to: 'home' },
        ],
      },
      yield: { speaker: 'npc:bettina-sarto', mood: 'sad', text: 'I did. Ha. A Sarto, yielding. Our grandmother would turn in her grave. (She wipes her eyes.) It was so easy. Thirty years, and it was one word.', next: 'home' },
      home: { speaker: 'npc:bettina-sarto', text: 'I’ll take her home now. There’s a place in the family plot she’s been late for. Thank you, child.', next: null },
    },
  },
  {
    id: 'dialogue:obj-rosa-sarto-revenant', name: 'Rosa Sarto on the bridge', scope: 'party',
    entries: [{ when: stage('quest:swordsman-the-sisters-bridge', 'rosa'), node: 'rosa' }, { node: 'after' }],
    nodes: {
      rosa: {
        speaker: 'narrator', text: 'In the middle of the Sisters’ Bridge, Rosa Sarto’s Revenant stands en garde, as she has stood for thirty years, facing an opponent nobody else can see. She is young. She will always be young. Her sword is weeping black from the point.',
        choices: [
          { text: '(Call to Bettina, and ask her to say the word.)', to: 'bettina', effects: [{ setFlag: 'swordsman.bettina_yielded', value: true }] },
          { text: '(Stand in front of her with empty hands.)', to: 'empty' },
          { text: '(Give her the closing salute.)', to: 'salute', school: 'blade' },
        ],
      },
      bettina: { speaker: 'narrator', text: 'From the far bank, in a voice that has not been raised in thirty years, Bettina calls: “Rosa! I yield! For you! The Sartos yield!” Rosa’s sword wavers. She turns her head, as if she heard her sister calling her in for supper, and lowers her blade, and lies down.', next: null },
      empty: { speaker: 'narrator', text: 'You stand in her line with your hands open and your sword left on the bank. She looks at you for a long time. There is nobody here to fight. Slowly, as if she were very tired, she lowers her blade, and lies down on the bridge.', next: null },
      salute: { speaker: 'narrator', text: 'You raise an empty hand to your face and sweep it down, the closing salute, without a sword. Rosa returns it. Then she puts her blade down on the boards and lies beside it, and the black runs out of her into the river.', next: null },
      after: { speaker: 'narrator', text: 'The Sisters’ Bridge, open again. Someone has left flowers in the middle.', next: null },
    },
  },
  {
    id: 'dialogue:swordsman-assunta', name: 'Signora Assunta Rill (Lunch Is a Challenge)',
    entries: [{ when: stage('quest:swordsman-lunch-is-a-challenge', 'assunta'), node: 'fed' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:assunta-rill', text: 'My Tommaso holds Rill’s Bridge against all comers. It’s the law, his father held it, his grandfather held it. All comers. Including his mother. Including his mother with his lunch. He hasn’t eaten since Thursday.',
        choices: [offer('quest:swordsman-lunch-is-a-challenge', 'I’ll get his lunch across.', 'across'), bye],
      },
      across: { speaker: 'npc:assunta-rill', text: 'Bread, cheese, a little sausage. If you have to beat him, don’t bruise his face. He’s courting.', next: null },
      fed: { speaker: 'npc:assunta-rill', mood: 'happy', text: 'He’s eating! Look at him, eating with one hand and holding the bridge with the other. My boy. Take some bread, please, I always make too much. It’s that or throw it at him.', next: 'gemma' },
      gemma: { speaker: 'npc:assunta-rill', text: 'And now he’s waving at you. He wants something carried. (She sighs.) Gemma Fosco, on the next bridge down. She holds it, he holds his, and the law says neither may leave. A year they’ve been courting at the tops of their voices. The whole river knows his poetry.', next: null },
    },
  },
  {
    id: 'dialogue:swordsman-tommaso', name: 'Tommaso Rill',
    entries: [{ when: stage('quest:swordsman-lunch-is-a-challenge', 'tommaso'), node: 'hold' }, { node: 'later' }],
    nodes: {
      hold: {
        speaker: 'npc:tommaso-rill', text: 'Halt! None shall pass Rill’s Bridge without first besting a Rill! By law! (His stomach rumbles, very loudly.) That wasn’t me.',
        choices: [
          { text: 'I challenge you. To lunch.', to: 'lunch' },
          { text: 'Fine. En garde.', to: 'fight' },
          { text: 'Does the law say what kind of bout?', to: 'law', school: 'blade' },
        ],
      },
      lunch: { speaker: 'npc:tommaso-rill', text: 'To… lunch? (He thinks about the law. He thinks about lunch.) The law doesn’t say a bout can’t be lunch. The law doesn’t say much. Pass, challenger, and bring your weapon.', next: null },
      fight: { speaker: 'narrator', text: 'He is fast and fierce and very, very hungry. You take a touch off him in the end because he gets distracted by the smell of sausage. He salutes, grumpily, and lets you pass.', next: null },
      law: { speaker: 'npc:tommaso-rill', text: 'The law says “a contest of skill”. (He goes pink.) Mother has been trying to get me to eat with a fork for nineteen years. Fine. Pass.', next: null },
      later: { speaker: 'npc:tommaso-rill', mood: 'happy', text: 'None shall pass! Unless they brought cheese.', next: null },
    },
  },
  {
    id: 'dialogue:obj-rill-lunch-basket', name: 'Tommaso’s lunch', scope: 'party',
    entries: [{ when: stage('quest:swordsman-lunch-is-a-challenge', 'basket'), node: 'basket' }, { node: 'after' }],
    nodes: {
      basket: { speaker: 'narrator', text: 'You set the basket down in the middle of the bridge. Tommaso eats with his sword in one hand and a sausage in the other, keeping one eye on the far bank in case another mother tries to cross.', next: null },
      after: { speaker: 'narrator', text: 'An empty lunch basket on Rill’s Bridge.', next: null },
    },
  },
  // ---------- the Riverside Salles: the Empty Salle, Varric's Statue
  {
    id: 'dialogue:swordsman-grisi', name: 'Master Ottavio Grisi',
    entries: [
      { when: stage('quest:swordsman-the-empty-salle', 'grisi'), node: 'student' },
      { when: stage('quest:swordsman-varrics-statue', 'grisi'), node: 'statue' },
      { node: 'start' },
    ],
    nodes: {
      start: {
        speaker: 'npc:ottavio-grisi', text: 'Eight sharp, every morning, for thirty years. I teach. The room listens. The room has learned a great deal. Good day.',
        choices: [
          offer('quest:swordsman-the-empty-salle', 'You want a student?', 'want', { questCompleted: 'quest:swordsman-rung-4012' }),
          offer('quest:swordsman-varrics-statue', 'The statue outside is weeping.', 'weep', { questCompleted: 'quest:swordsman-the-champions-salute' }),
          bye,
        ],
      },
      want: { speaker: 'npc:ottavio-grisi', text: 'One. Just one. Someone who wants to learn from the very beginning, slowly, properly, and is not in a hurry to beat anybody. There is nobody like that in Edgewater.', next: null },
      weep: { speaker: 'npc:ottavio-grisi', mood: 'sad', text: 'Varric. The first Concord duellist. I scrub him every morning before class. By noon he weeps again. There is an inscription under all that black. I have not been able to read it in years.', next: null },
      student: {
        speaker: 'npc:ottavio-grisi', text: 'A tailor. Rung 4,012. Who has lost nine hundred and ninety-nine bouts. (A very long pause.) Does he listen?',
        choices: [{ text: 'He listens like nobody you’ve ever met.', to: 'yes', trust: 1 }],
      },
      yes: { speaker: 'npc:ottavio-grisi', mood: 'happy', text: 'Then he is the first student I have had in thirty years worth the name. Eight sharp. Tell him not to be early. I will be early.', next: null },
      statue: {
        speaker: 'npc:ottavio-grisi', text: 'You read it? What does it say?',
        choices: [{ text: '“The fight is over when both swords are down.”', to: 'read' }],
      },
      read: { speaker: 'npc:ottavio-grisi', mood: 'sad', text: 'Both swords. Not one. Not the loser’s. Both. (He sits down on his own salle steps.) I have been teaching for fifty years, and I never taught that. Nobody taught me.', next: 'other' },
      other: { speaker: 'npc:ottavio-grisi', text: 'There was a second statue, you know. Across the river, facing him. The duellist Varric fought on the hill when the Schools’ War ended. The flood of C. 1013 took it off its plinth and into the shallows. Nobody went to look. Would you?', next: null },
    },
  },
  {
    id: 'dialogue:obj-varric-statue', name: 'Varric’s statue', scope: 'party',
    entries: [{ when: stage('quest:swordsman-varrics-statue', 'statue'), node: 'clean' }, { node: 'after' }],
    nodes: {
      clean: { speaker: 'narrator', text: 'The statue of Varric stands on the river wall: a tall duellist with his sword held down and out, point to the ground, as if offering it to someone. Black runs down its face. You scrub, and scrub, and the plinth comes clean.', next: 'read' },
      read: { speaker: 'narrator', text: 'Under the black, cut deep into the stone: VARRIC, FIRST OF THE CONCORD. THE FIGHT IS OVER WHEN BOTH SWORDS ARE DOWN. As you watch, a single black tear runs down the statue’s cheek and stops on its chin, as if it has changed its mind.', next: null },
      after: { speaker: 'narrator', text: 'Varric’s statue on the river wall, clean, for now.', next: null },
    },
  },
  // ---------- the Old Armoury: A Sheath for Once, the Armoury Roll
  {
    id: 'dialogue:swordsman-dulcie', name: 'Armourer Dulcie Bellows (A Sheath for Once)',
    entries: [{ when: stage('quest:swordsman-a-sheath-for-once', 'dulcie'), node: 'pattern' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:dulcie-bellows', text: 'Three generations of Bellows have sharpened every sword in Edgewater. Not one of us has ever made a scabbard. No call for them. Nobody puts their sword away. I want to make one. Just once. Before I die.',
        choices: [offer('quest:swordsman-a-sheath-for-once', 'Is there a pattern?', 'pattern-q'), bye],
      },
      'pattern-q': { speaker: 'npc:dulcie-bellows', text: 'There was. In the Armoury pattern-loft, from before the Hollowing. The automatons sit on it like hens. Get it for me and I’ll make you a sheath you could sleep in.', next: null },
      pattern: {
        speaker: 'npc:dulcie-bellows', mood: 'happy', text: 'C. 1009. Oiled linen. Look at the stitching! (She holds it up to the light like a christening gown.) My grandmother’s hand. She did make one. She never told us.',
        choices: [{ text: 'Make one for yourself first.', to: 'self', trust: 1 }, { text: 'Edgewater could do with a few.', to: 'few' }],
      },
      self: { speaker: 'npc:dulcie-bellows', text: 'For my own blade. And then I’ll hang it on the wall, sheathed, and see if anybody notices. Here. For your trouble.', next: 'first' },
      few: { speaker: 'npc:dulcie-bellows', text: 'It could. It could do with a great many. I’ll start tonight. Here. For your trouble.', next: 'first' },
      first: { speaker: 'npc:dulcie-bellows', text: 'Only the very first one has to go to the right sword. Grandmother would insist. The sword in Edgewater that most needs putting away. (She looks at you.) You know whose. Come back in the morning and take it to her.', next: null },
    },
  },
  {
    id: 'dialogue:obj-scabbard-pattern', name: 'The scabbard pattern', scope: 'party',
    entries: [{ when: stage('quest:swordsman-a-sheath-for-once', 'find'), node: 'find' }, { node: 'after' }],
    nodes: {
      find: { speaker: 'narrator', text: 'In a chest at the back of the pattern-loft, under a hundred patterns for blades and hilts and guards: one roll of oiled linen, a scabbard, drawn full size. In the corner, in faded ink: “For when it’s over. M. Bellows, C. 1009.”', next: null },
      after: { speaker: 'narrator', text: 'An empty chest in the pattern-loft.', next: null },
    },
  },
  {
    id: 'dialogue:swordsman-strop', name: 'Clerk Benedict Strop (the Armoury Roll)',
    entries: [{ when: stage('quest:swordsman-the-armoury-roll', 'strop'), node: 'count' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:benedict-strop', text: 'Count the swords, they said. Simple, they said. The automatons move them in the night. I have counted four thousand and ten swords, four thousand and twelve swords and, once, nine.',
        choices: [offer('quest:swordsman-the-armoury-roll', 'I’ll help you count.', 'help'), bye],
      },
      help: { speaker: 'npc:benedict-strop', text: 'Three racks. Count fast. They get restless when they’re looked at.', next: null },
      count: {
        speaker: 'npc:benedict-strop', text: 'Four thousand and eleven, and one empty slot. Labelled. Labelled! Nobody labels anything in here. What did it say?',
        choices: [{ text: '“Ferro: withdrawn, C. 1012.”', to: 'ferro' }],
      },
      ferro: { speaker: 'npc:benedict-strop', text: 'Withdrawn. Not lost, not broken, not stolen. Withdrawn. In thirty years of rolls that is the only sword in Edgewater that was ever taken out of service on purpose. I shall write that down twice.', next: 'night' },
      night: { speaker: 'npc:benedict-strop', text: 'And the others? Where do the automatons take them at night? There are scrape-marks on the floor going out the back, towards the old Drill Yard. I am a clerk. I do not go towards things. You might.', next: null },
    },
  },
  ...objs('armoury-rack', 'quest:swordsman-the-armoury-roll', 'racks', [
    'The first rack: duelling swords, hundreds of them, every one drawn and sharpened and none of them sheathed. You count one thousand four hundred and two. An automaton watches you count, and moves one, and you count again.',
    'The second rack: practice blades, chipped and hacked and still in use. One thousand three hundred and ninety. Three of them have names scratched on them, and the names have been crossed out and written again.',
    'The champions’ rack: every champion of the Ladder, a thousand years of them, each in its own slot. All full. All but one.',
  ], 'A sword-rack, counted.'),
  {
    id: 'dialogue:obj-ferro-empty-slot', name: 'The empty slot', scope: 'party',
    entries: [{ when: stage('quest:swordsman-the-armoury-roll', 'slot'), node: 'slot' }, { node: 'after' }],
    nodes: {
      slot: { speaker: 'narrator', text: 'In the champions’ rack, between the champion of C. 1000 and Vellacourt’s practice blade, one slot stands empty. A neat brass label: “Ferro: withdrawn, C. 1012.” The slot has been dusted. Somebody dusts it.', next: null },
      after: { speaker: 'narrator', text: 'An empty slot in the champions’ rack, dusted.', next: null },
    },
  },

  // ======================= ACT II
  {
    id: 'dialogue:swordsman-basilio', name: 'C-1 the Watch House: Ser Basilio Trento', scope: 'party',
    entries: [{ when: stage('quest:swordsman-the-watch-house-ladder', 'watch'), node: 'start' }, { node: 'later' }],
    nodes: {
      start: {
        speaker: 'npc:basilio-trento', text: 'Edgewater? You came out of the Blade arch? Sit down, sit down. Ser Basilio Trento, rung 61, once. I came through for a bout in C. 1012 and the arches shut behind me. I have been on the wrong side of a duel for thirty years.',
        choices: [
          { text: 'Where does Blade’s Sentinel lie?', to: 'rook', quest: true },
          { text: 'There’s a Ladder on that wall.', to: 'ladder' },
        ],
      },
      ladder: { speaker: 'npc:basilio-trento', mood: 'happy', text: 'The captain’s. Chalk, every man’s name, who’s on watch and who owes who a pint. It’s the only Ladder in the world where the bottom rung gets the best bunk. Very civilised.', next: 'rook' },
      rook: { speaker: 'npc:basilio-trento', text: 'The captain knows where Varric is: Bonelord Varric, our Sentinel. Captain Harrow, with the eye-patch. Ask her. Don’t mention the eye. She’ll only tell you it improved her looks, and she’ll be right.', next: null },
      later: { speaker: 'npc:basilio-trento', text: 'Thirty years on the wrong side of the arch. Still, the beer is good.', next: null },
    },
  },
  {
    id: 'dialogue:hook-swordsman-rook', name: 'Hook: Rook for the Swordsman', scope: 'party',
    entries: [{ when: stage('quest:swordsman-the-watch-house-ladder', 'rook'), node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:rook', text: 'A duellist out of Edgewater. I can tell by the feet. You stand like you’re waiting for somebody to say “begin”. Eleven farmers I’ve got, and a halberd, and a Ladder on the wall so they know who’s first up when the Hollowed come.',
        choices: [
          { text: 'We kept the Ladder in Edgewater.', to: 'kept', when: { flag: 'swordsman.ladder', value: 'kept' } },
          { text: 'We closed the Ladder in Edgewater.', to: 'closed', when: { flag: 'swordsman.ladder', value: 'closed' } },
          { text: 'I yielded my last challenge in Edgewater.', to: 'yielded', when: { flag: 'swordsman.ladder', value: 'yielded' } },
        ],
      },
      kept: { speaker: 'npc:rook', mood: 'happy', text: 'Kept it! Good. A Ladder means everybody knows their place, and their place is in front of my farmers. Your name’s going on mine. Top rung. Don’t get comfortable.', effects: [{ trust: 'npc:rook', delta: 1 }], next: 'varric' },
      closed: { speaker: 'npc:rook', text: 'Closed it. Hm. Brave, or daft. I’ll decide later. Your name goes on my Ladder anyway. Bottom rung. Best bunk.', next: 'varric' },
      yielded: { speaker: 'npc:rook', text: 'Yielded. (She looks at you a long while with her one eye.) I’ve never once heard a duellist say that word on purpose. Your name goes on the Ladder in red.', next: 'varric' },
      varric: { speaker: 'npc:rook', text: 'Varric. Hobb’s empty graves go down to his barrow, under the churchyard. His dead muster drills down there in the dark. You’ll want Hobb’s lantern. Nothing else stays lit.', next: null },
    },
  },
  {
    id: 'dialogue:hook-swordsman-hobb', name: 'Hook: Old Hobb for the Swordsman', scope: 'party',
    entries: [
      { when: stage('quest:swordsman-the-barrowdowns', 'lantern'), node: 'start' },
      { when: { all: [stage('quest:swordsman-bonelord-varric', 'tell'), { not: { questStage: 'quest:cc-empty-graves', stage: 'report' } }] }, node: 'back' },
    ],
    nodes: {
      back: { speaker: 'npc:hobb', text: '(He is standing on the turf over the barrow with his cap off, listening.) Stopped. An hour ago. Thirty years of click, click, like knitting, and then nothing at all. I thought I’d gone deaf.', next: 'lamp' },
      lamp: {
        speaker: 'narrator', text: 'You hold out his lantern. The candle that burned the same inch for thirty years has burned right down to the tin. It went out, you realise, when Varric put his sword down.',
        choices: [
          { text: 'Varric asked if anyone had yielded since his war.', to: 'yield' },
          { text: 'Your candle’s finished, Hobb. I’m sorry.', to: 'candle', trust: 1, trustNpc: 'npc:hobb' },
          { text: '(Give him the closing salute, over the turf.)', to: 'salute', school: 'blade' },
        ],
      },
      yield: { speaker: 'npc:hobb', text: 'Yielded. (He chews it over.) My wife yielded every argument we ever had, forty years, and won every one. Maybe that’s what he meant.', next: 'word' },
      candle: { speaker: 'npc:hobb', mood: 'happy', text: 'Finished? It’s done its job. That’s not the same thing. I’ll put a new one in. Ordinary. It can burn down like anybody else’s.', next: 'word' },
      salute: { speaker: 'npc:hobb', text: '(He watches, and then, awkwardly, puts his cap over his heart.) Never had a sword. Will that do?', next: 'word' },
      word: { speaker: 'npc:hobb', text: 'Here. Rook had a carter up from the coast this morning. A man in white, on the Stormcliffs, climbing the Storm Spire and chalking his name on every step. Friend of yours?', next: null },
      start: {
        speaker: 'npc:hobb', text: 'My lantern? For the Barrowdowns? (He holds it up: a battered tin thing with a candle that has burned the same inch for years.) Lights in the dark down there when nothing else will. Bring it back. I’ve only the one.',
        choices: [{ text: 'I’ll bring it back.', to: 'end', trust: 1 }, { text: 'What’s down there, Hobb?', to: 'down' }],
      },
      down: { speaker: 'npc:hobb', text: 'Duellists. Dead ones, in the old muster. Fencing in the dark. Hear them through the turf some nights. Click. Click. Like knitting.', next: 'end' },
      end: { speaker: 'npc:hobb', text: 'Mind the third step. It’s not a step.', next: null },
    },
  },
  ...objs('swordsman-endless-duel', 'quest:swordsman-the-barrowdowns', 'duels', [
    'In Hobb’s lantern-light, two dead duellists in armour a thousand years old are fencing in a ring of bones. Neither has scored in centuries. You step between them and lower your sword, and both stop, and look at you, and slowly lower theirs. Both swords down. They lie down together.',
    'A dead duellist fencing a wall. You salute him, the closing salute, and he turns, and returns it, and his sword goes down, and he sits against the wall he has been fighting, as if it were an old friend.',
    'A whole ring of the dead, all fencing each other, round and round. You stand in the middle and put your sword point to the floor, the way Varric’s statue holds his. One by one, the ring stops, and every sword goes down.',
  ], 'Bones lying quiet in the dark, swords beside them.'),
  {
    id: 'dialogue:swordsman-champions-climb', name: 'C-4 word from the Stormcliffs', scope: 'party',
    entries: [{ when: { flag: 'swordsman.ladder', value: 'yielded' }, node: 'yield' }, { node: 'start' }],
    nodes: {
      yield: { speaker: 'narrator', text: 'In the barrow, at the end, Varric asked whether anyone had yielded since the war. You had, in front of the whole Quarter. You told him. He laughed, a small dusty sound, and said: then it was not all for nothing. You think of that, all the way to the cliffs.', next: 'start' },
      start: { speaker: 'narrator', text: 'Cliffstair, on the Stormcliffs, in the wind. Chalked on the first step of the Storm Spire stair, in a beautiful flowing hand: “A. Vellacourt challenges the Stormcrow. Again, and again, and again.”', next: null },
    },
  },
  ...objs('swordsman-spire-challenge', 'quest:swordsman-the-champions-climb', 'stair', [
    'Halfway up the Spire stair, another challenge in chalk, and under it a little drawing of a sword and a crow, and a smiling face. He always did sign his autographs with a smiling face.',
    'A challenge chalked across a whole landing, and three Thunderbirds lying stunned around it. He has been fighting his way up. The chalk is smeared black where his blade wept on it.',
    'The last challenge, at the door to the top of the Spire: “Scream my name to the whole ring, crow. Again!” Above, in the lightning, something enormous screams back.',
  ], 'A smudge of chalk on the Spire stair.'),
  // ---------- featured bearers (hooks on the bearer NPCs)
  {
    id: 'dialogue:swordsman-featured-reaver', name: 'Featured: No Quarter', scope: 'party',
    entries: [
      { when: stage('quest:swordsman-no-quarter', 'back'), node: 'back' },
      { when: { all: [stage('quest:swordsman-no-quarter', 'stand'), { not: { flag: 'swordsman.garrow_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-reaver', text: 'Varric’s dead muster drills under that churchyard. Every one of them is a soldier who never got to stop. I mean to go down and stop them. All of them. Then Varric. Then whatever’s left. You coming, duellist?',
        choices: [
          { text: 'I’m coming. But we end it. We don’t just win it.', to: null, quest: true, effects: [{ setFlag: 'swordsman.garrow_asked', value: true }] },
          { text: 'Meet me at the barrow-mouth.', to: null, quest: true, effects: [{ setFlag: 'swordsman.garrow_asked', value: true }] },
        ],
      },
      back: {
        speaker: 'npc:bearer-reaver', text: 'Put my axe down. In a barrow. In front of the dead. (Garrow laughs, and it shakes.) In the Muster we’ve a motto, Until It Is Over. Nobody ever told us how you know. You did. I’ll stand with you at the Heart, and I’ll put it down again if I have to.',
        effects: [{ setFlag: 'swordsman.garrow_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-swordsman-reaver-stand', name: 'The Reaver’s stand at the barrow-mouth', scope: 'party',
    entries: [
      { when: { all: [stage('quest:swordsman-no-quarter', 'stand'), { partyHasClass: 'reaver' }] }, node: 'player' },
      { when: stage('quest:swordsman-no-quarter', 'stand'), node: 'stand' },
      { node: 'after' },
    ],
    nodes: {
      stand: {
        speaker: 'npc:bearer-reaver', text: '(A red war-banner planted at the barrow-mouth, and Garrow beside it with an axe across his shoulders.) Here they come. Up out of the dark, drilling. Look at them. They never got to stop. Not one of them.',
        choices: [
          { text: '(Put your own sword down first. Point to the ground.)', to: 'down' },
          { text: 'Yield to them, Garrow. Not to me. To them.', to: 'yield' },
        ],
      },
      down: { speaker: 'narrator', text: 'You lay your sword point-down in the turf. Garrow stares at you. The dead come up out of the barrow-mouth and halt, a whole rank of them, swords raised, waiting for an enemy. Slowly, with a sound like a door coming off its hinges, Garrow puts his axe down beside your sword. The rank lowers its blades.', next: null },
      yield: { speaker: 'narrator', text: '“To them?” Garrow says. Then he looks, properly, at the dead coming up out of the dark, drilling, tired, unfinished. “Aye,” he says, very quietly. “To them.” The axe goes down. The rank of the dead stops, and lowers its swords.', next: null },
      player: { speaker: 'narrator', text: 'Your Reaver companion plants a red war-banner at the barrow-mouth. When the dead muster comes up out of the dark, the two of you lay your weapons down in the turf, sword and axe, and the whole rank stops, and lowers its blades.', next: null },
      after: { speaker: 'narrator', text: 'A red war-banner at the barrow-mouth, an axe and a sword laid down beside it.', next: null },
    },
  },
  {
    id: 'dialogue:swordsman-featured-falconer', name: 'Featured: The Falcon and the Crow', scope: 'party',
    entries: [
      { when: stage('quest:swordsman-the-falcon-and-the-crow', 'back'), node: 'back' },
      { when: { all: [stage('quest:swordsman-the-falcon-and-the-crow', 'perch'), { not: { flag: 'swordsman.perrin_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-falconer', text: 'The Stormcrow is screaming the news of a Turning that never came. You hood a bird that’s frightened. I mean to hood it. You, I’m told, mean to fight it. We can argue halfway up the cliff. That’s where my perch is.',
        choices: [{ text: 'Halfway up, then. I’ll bring my arguments.', to: null, quest: true, effects: [{ setFlag: 'swordsman.perrin_asked', value: true }] }],
      },
      back: {
        speaker: 'npc:bearer-falconer', mood: 'happy', text: 'You fight like a hawk stoops. All at once and then not at all. I still say a hood would have done it. I’ll say it at the Heart, standing next to you.',
        effects: [{ setFlag: 'swordsman.perrin_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-swordsman-falcon-perch', name: 'The Falconer’s perch', scope: 'party',
    entries: [
      { when: { all: [stage('quest:swordsman-the-falcon-and-the-crow', 'perch'), { partyHasClass: 'falconer' }] }, node: 'player' },
      { when: stage('quest:swordsman-the-falcon-and-the-crow', 'perch'), node: 'perch' },
      { node: 'after' },
    ],
    nodes: {
      perch: {
        speaker: 'npc:bearer-falconer', text: '(A perch lashed to the cliff, a long line, and a hood the size of a barrel.) There. Look at it up there. It isn’t angry. It’s frightened. It’s been screaming news for thirty years and nobody’s come.',
        choices: [
          { text: 'Then it needs someone to answer it. Not a hood.', to: 'answer' },
          { text: 'We do both. You hood it, I hold it.', to: 'both' },
        ],
      },
      answer: { speaker: 'narrator', text: 'Perrin thinks about that for a long, windy minute. Then he puts the hood away. “Answer it, then,” he says. “I’ll hold the line, and you go up and answer it.”', next: null },
      both: { speaker: 'narrator', text: 'Perrin grins. “Now that’s a falconer’s answer.” He passes you the line. Neither of you is sure it will work. Both of you are sure you will try.', next: null },
      player: { speaker: 'narrator', text: 'You and your Falconer companion lash a perch to the Stormcliffs and argue about hoods all the way up. You do not settle it. The Stormcrow screams overhead the whole time, as if joining in.', next: null },
      after: { speaker: 'narrator', text: 'A falconer’s perch lashed to the Stormcliffs.', next: null },
    },
  },
  // ---------- C-6 A Letter from Ferro
  {
    id: 'dialogue:swordsman-percy-letter', name: 'C-6 a letter from Ferro', scope: 'party',
    entries: [
      { when: stage('quest:swordsman-a-letter-from-ferro', 'letter'), node: 'start' },
      { when: { any: [stage('quest:swordsman-a-letter-from-ferro', 'court'), stage('quest:swordsman-a-letter-from-ferro', 'reply')] }, node: 'arrived' },
      { node: 'later' },
    ],
    nodes: {
      start: { speaker: 'npc:percy-thimble-concordia', mood: 'happy', text: 'There you are! I came through the gate! Me! Percy Thimble, of the Ladder! The Maestra gave me this for you, and said if I read it she’d have my thumbs. I didn’t read it. I held it up to the light once. Only once.', next: 'letter' },
      letter: {
        speaker: LF, text: '(Two words, in her sharp hand, in the middle of a whole clean sheet.) “End it.”',
        choices: [
          { text: '(Fold the letter away.)', to: null, quest: true, effects: [{ setFlag: 'swordsman.ferro_letter', value: true }] },
          { text: '(Unfold the paper all the way.)', to: 'ribbon', when: { trust: LF, value: 'trusted' } },
        ],
      },
      ribbon: { speaker: 'narrator', text: 'Folded into the bottom of the sheet, pressed flat, is a faded red ribbon: her champion’s ribbon, the one she kept. Under it, smaller: “I don’t need it. You might. L. F.”', effects: [{ setFlag: 'swordsman.ferro_letter', value: true }, { setFlag: 'swordsman.ferro_ribbon_letter', value: true }], next: 'percy' },
      percy: { speaker: 'npc:percy-thimble-concordia', text: 'Is that a ribbon? Is that THE ribbon? Oh. Oh my. I shall have to sit down. Is there anywhere to sit down in Concordia?', next: null },
      arrived: { speaker: 'npc:percy-thimble-concordia', mood: 'happy', text: '(He is measuring Ser Basilio for a coat, and Basilio is letting him.) They have a Ladder here! I’m on it! Rung twelve, out of twelve! I have never been so high in my life!', next: null },
      later: { speaker: 'npc:percy-thimble-concordia', mood: 'happy', text: 'Concordian tailoring is a scandal. I’ve already had four commissions. I may never go home.', next: null },
    },
  },
  // ======================= ACT III
  {
    id: 'dialogue:swordsman-herald-fate', name: 'III-4 the Chimera’s Champion: Vellacourt’s fate', scope: 'party',
    entries: [{ when: { flag: 'swordsman.ladder', value: 'kept' }, node: 'rematch' }, { node: 'kneel' }],
    nodes: {
      rematch: { speaker: 'narrator', text: 'Even beaten, the Chimera’s sword-arm comes up once more, for a rematch nobody asked for. The Ladder you kept is still in him. You knock the blade down a fourth time.', next: 'kneel' },
      kneel: { speaker: AV, mood: 'hollow', text: '(He hangs from the Chimera’s shoulder like a sword from a rack, golden, smiling, bound in black to the elbow.) Splendid. Oh, splendid. You took a touch. You see? You can do it.', next: 'choose' },
      choose: {
        speaker: AV, mood: 'hollow', text: '(The binding drags his arm back up into guard. His blade weeps black from the tip.) Again.',
        choices: [
          {
            text: '(Lower your sword. Lay it on the stair. Yield.)', to: 'spare', quest: true,
            when: { any: [{ flag: 'swordsman.ladder', value: 'yielded' }, { trust: LF, value: 'trusted' }] },
            lockedLabel: 'You need to have yielded before the Council, or to have earned Ferro’s trust',
            effects: [{ setFlag: 'swordsman.nemesis_fate', value: 'spared' }],
          },
          { text: 'No. Not again. (End it.)', to: 'destroy', quest: true, effects: [{ setFlag: 'swordsman.nemesis_fate', value: 'destroyed' }] },
        ],
      },
      spare: { speaker: 'narrator', text: 'Your sword rings on the stone. The Chimera’s arm comes down at you and stops a hand away, as your blade stopped on the night of the Bell. He cannot fight someone who has yielded. Nobody ever taught him how.', next: 'spare2' },
      spare2: { speaker: 'narrator', text: 'The binding cracks along his arm and falls off him in black flakes. Ser Auguste Vellacourt drops to his knees on the stair and looks at his own sword as if somebody else had left it there.', next: 'spare3' },
      spare3: { speaker: AV, mood: 'sad', text: 'Ended. (He says it like a word in another language.) Is that what it feels like? Lucia never told me. It feels like putting something down.', next: 'percy' },
      destroy: { speaker: 'narrator', text: 'One touch, clean, and you do not say “again”. The sword falls out of the Chimera’s hand, and the binding goes slack round the man inside it.', next: 'destroy2' },
      destroy2: { speaker: AV, mood: 'sad', text: 'Ag… (He smiles, golden to the last.) No. Fair touch. Fair touch.', next: 'percy' },
      percy: {
        speaker: 'narrator', text: 'Someone is puffing up the last of the stair behind you, in his best coat, with one hand pressed to his side. It is Percy Thimble.',
        choices: [
          { text: 'Percy? What are you doing up here?', to: 'ribbon', when: { not: { flag: 'swordsman.ferro_ribbon_letter' } } },
          { text: 'Percy? What are you doing up here?', to: 'had', when: { flag: 'swordsman.ferro_ribbon_letter' } },
        ],
      },
      ribbon: {
        speaker: PC, text: 'Following you! I always miss the ends of things. (He holds out a faded red ribbon.) The Maestra gave me this with her letter, and said: not yet. Only if they reach the top. Well. This is the top.',
        effects: [{ setFlag: 'swordsman.ferro_ribbon_percy', value: true }], next: 'ribbon2',
      },
      ribbon2: { speaker: 'narrator', text: 'Ferro’s champion’s ribbon, faded to the colour of a rose pressed in a book. Somewhere at the head of the Blade stair, you think, there ought to be a banner.', next: null },
      had: { speaker: PC, text: 'Following you! I always miss the ends of things. Have you still got her ribbon? Oh, good. She’ll want it somewhere high. This is quite high.', next: null },
    },
  },
  {
    id: 'dialogue:obj-swordsman-blade-banner', name: 'Ferro’s Ribbon: the Blade banner', scope: 'party',
    entries: [
      { when: { all: [stage('quest:swordsman-ferros-ribbon', 'tie'), { flag: 'swordsman.ferro_devotable' }] }, node: 'devoted' },
      { when: stage('quest:swordsman-ferros-ribbon', 'tie'), node: 'tie' },
      { when: stage('quest:swordsman-ferros-ribbon', 'look'), node: 'rotten' },
      { node: 'banner' },
    ],
    nodes: {
      rotten: { speaker: 'narrator', text: 'The old banner of Steelvale, two crossed swords on grey, rotted almost to thread. When you lift the ribbon to its staff, a whole corner of cloth comes away in your hand like ash. Tie anything to this, and the first gust will take both.', next: 'rotten2' },
      rotten2: { speaker: 'narrator', text: 'It needs a needle and somebody who knows what to do with one. There is exactly one tailor in the Heart, and he is at the camp, pinning his sleeves.', next: null },
      tie: { speaker: 'narrator', text: 'The old banner of Steelvale hangs at the head of its stair, two crossed swords on grey, darned all over now in Percy’s green Edgewater silk. You tie Ferro’s ribbon to the staff, where a champion’s ribbon goes.', next: 'tie2' },
      tie2: { speaker: 'narrator', text: 'Nobody won it here. Somebody gave it back. It hangs very straight in a wind that only blows at the top of the world.', next: null },
      devoted: {
        speaker: 'narrator', text: 'You tie Ferro’s ribbon to the banner’s staff. Far away in Edgewater, in an empty salle, a grey-haired woman takes a plain sword down from the wall, and her hand does not shake.',
        effects: [{ trust: LF, set: 5 }], next: 'devoted2',
      },
      devoted2: { speaker: 'narrator', mood: 'happy', text: 'She gives the closing salute to an empty room, and smiles, and goes to unlock the door. In the morning she will teach somebody how to end a fight.', next: null },
      banner: { speaker: 'narrator', text: 'The old Blade banner of Steelvale, at the head of its stair, stirring in a wind that blows nowhere else.', next: null },
    },
  },
  {
    id: 'dialogue:obj-swordsman-kept-opponents', name: 'The Kept Opponents', scope: 'party',
    entries: [
      { when: stage('quest:swordsman-the-kept-opponents', 'kept'), node: 'kept' },
      { when: stage('quest:swordsman-the-kept-opponents', 'rank'), node: 'gap' },
      { when: stage('quest:swordsman-the-kept-opponents', 'boy'), node: 'wait' },
      { node: 'gone' },
    ],
    nodes: {
      kept: {
        speaker: 'narrator', text: 'In their own neat rank at the edge of the Legion camp stand the Revenants from Vellacourt’s gallery: everyone he ever beat, still in guard, still waiting for him to say the word.',
        choices: [
          { text: '(Give them the closing salute.)', to: 'salute' },
          { text: '(Go down the rank, and yield to each of them in turn.)', to: 'yield' },
        ],
      },
      gap: { speaker: 'narrator', text: 'In their own neat rank at the edge of the Legion camp stand the Revenants from Vellacourt’s gallery, still in guard. One place in the line is empty: a gap the width of a boy, and a pair of small boot-prints going off towards the Stairs.', next: 'gap2' },
      gap2: { speaker: 'narrator', text: 'Nobody in the rank looks round. In Vellacourt’s gallery nobody ever left the line, because he never once said they could.', next: null },
      wait: { speaker: 'narrator', text: 'The rank of kept opponents, still in guard, with a boy-sized gap in it.', next: null },
      salute: { speaker: 'narrator', text: 'You raise your blade to your face and bring it down: the salute for the end of a bout. All down the line, slowly, as if they had nearly forgotten, the old swords come up to answer it.', next: 'names' },
      yield: { speaker: 'narrator', text: 'To each of them in turn you say the word nobody in Edgewater says. It takes a long time. One by one, their guards come down.', next: 'names' },
      names: { speaker: 'narrator', text: 'Each says their name as they lay their sword down. Ser Tancredi Mole, rung 9. Agnese Vaunt, rung 30, who began this bout with black hair. A boy from rung 400 who only says, “Is it over?”', next: 'names2' },
      names2: { speaker: 'narrator', mood: 'sad', text: 'Forty-one swords lie on the ground in a straight line. The Revenants go out like lamps at the end of a long evening, politely, one after another.', next: null },
      gone: { speaker: 'narrator', text: 'A straight line of old swords, laid down at the edge of the Legion camp.', next: null },
    },
  },
  {
    id: 'dialogue:swordsman-percy-heart', name: 'Percy’s Thousandth: Percy at the Heart camp', scope: 'party',
    entries: [
      { when: { all: [stage('quest:swordsman-percys-thousandth', 'percy'), { flag: 'swordsman.percy_won' }] }, node: 'again' },
      { when: stage('quest:swordsman-percys-thousandth', 'percy'), node: 'first' },
      { when: stage('quest:swordsman-percys-thousandth', 'bout'), node: 'ready' },
      { node: 'later' },
    ],
    nodes: {
      first: { speaker: PC, mood: 'happy', text: 'There you are! I came through behind you, all the way into the Heart, in my good coat. Nine hundred and ninety-nine bouts, and I never had my thousandth. Every time I got close, something rang, or climbed out of a grave.', next: 'want' },
      again: { speaker: PC, mood: 'happy', text: 'There you are! I came through behind you. Nine hundred and ninety-nine losses and one win, by a pin. So this is my thousand-and-first. It doesn’t sound as good. I’m calling it my thousandth anyway.', next: 'want' },
      want: {
        speaker: PC, text: 'There’s a Hollow Legionnaire at the edge of the camp who has stood in guard all week, and nobody has challenged him once. It’s rude. Will you second me?',
        choices: [
          { text: 'I’ll second you, Percy.', to: 'yes', quest: true },
          { text: 'Percy, that is a Hollow Legionnaire.', to: 'rude', quest: true },
        ],
      },
      yes: { speaker: PC, mood: 'happy', text: 'Splendid! I’ve pinned my sleeves. I’ve pinned my hem. I have a pin for everything.', next: null },
      rude: { speaker: PC, text: 'Exactly! Nobody has ever been polite to him. I shall be very polite, and then I shall try to win. Come on.', next: null },
      ready: { speaker: PC, text: 'He’s still there. Still in guard. I’ve saluted him twice already, just to be safe. Shall we?', next: null },
      later: { speaker: PC, mood: 'happy', text: 'Concordian tailoring is a scandal, but tailoring in the Heart is worse. Everyone here is wearing tears.', next: null },
    },
  },
  {
    id: 'dialogue:obj-swordsman-percy-heart-bout', name: 'Percy’s Thousandth: the bout', scope: 'party',
    entries: [{ when: stage('quest:swordsman-percys-thousandth', 'bout'), node: 'bout' }, { node: 'ring' }],
    nodes: {
      bout: { speaker: 'narrator', text: 'At the edge of the camp Percy salutes a Hollow Legionnaire with enormous ceremony. After a long moment the Legionnaire salutes back. Half the camp has come to watch.', next: 'bout2' },
      bout2: { speaker: 'narrator', text: 'It is a terrible bout. Percy trips twice and apologises both times. Then the Legionnaire lunges, and Percy steps inside it, and there is a pin in his hand.', next: 'touch' },
      touch: { speaker: PC, mood: 'happy', text: 'TOUCH! A touch is a touch! (The Legionnaire looks down at the pin in its breastplate, and very slowly lowers its sword.)', next: 'end' },
      end: { speaker: 'narrator', mood: 'happy', text: 'The bearers cheer as if someone had won the war. Percy bows. The Legionnaire, with the black running out of its eyes, bows back.', next: null },
      ring: { speaker: 'narrator', text: 'A ring of boot-marks in the dust at the edge of the Heart camp, and one pin.', next: null },
    },
  },
];

export default dialogues;
