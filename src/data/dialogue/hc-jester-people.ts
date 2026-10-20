/**
 * Hollow Crown, JESTER: Velvet Harbour people (general talk), the eight side quests, the mentor thread and the
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
const FE = 'npc:fennick-pantaloon' as const, SO = 'npc:harlequin-sorrow' as const;

const dialogues: DialogueDef[] = [
  // ---------- Fennick (general + mentor thread)
  {
    id: 'dialogue:jester-fennick', name: 'Fennick (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: FE, text: 'Mind the cushion. No, the other cushion. No. Ow. What can an old fool do for you?',
        choices: [
          offer('quest:jester-the-fools-licence', 'Why do you fall over, Fennick? Really?', 'licence', { trust: FE, value: 'friendly' }),
          offer('quest:jester-the-pantaloon-act', 'Who was the other half of the Pantaloon Act?', 'act', { all: [{ trust: FE, value: 'trusted' }, { questCompleted: 'quest:jester-the-counting-house' }] }),
          { text: 'Tell me a joke.', to: 'joke' },
          { text: 'Who taught you to fall over, Fennick?', to: 'mother', when: { all: [{ questCompleted: 'quest:jester-the-pantaloon-act' }, { questCompleted: 'quest:jester-the-fools-licence' }] } },
          bye,
        ],
      },
      mother: { speaker: FE, text: 'My mother. She walked the high rope over the Docks on feast days. (He settles into the cushions.) One Jubilee the rope went slack and she came down, right into the fish barrels, in front of the whole harbour.', next: 'up' },
      up: {
        speaker: FE, mood: 'happy', text: 'And she climbed out, covered in sprats, and bowed. The harbour laughed for a week. She said to me that night: a fall is only a failure if you don’t finish it.',
        choices: [
          { text: 'Did she ever walk the rope again?', to: 'rope' },
          { text: 'Is that why you always get up so slowly?', to: 'slow' },
        ],
      },
      rope: { speaker: FE, mood: 'sad', text: 'Every feast day until she was seventy. She never fell again, and people stopped coming to watch. She said that was the worst thing about getting good. I’ve made sure never to.', next: 'start' },
      slow: { speaker: FE, text: 'Slowly is how you finish a fall. Get up too fast and they think you’re hurt. Get up slowly, with a bow, and they think you meant it. After long enough, you did.', next: 'start' },
      licence: { speaker: FE, mood: 'sad', text: 'Really? (He sits down, on purpose, for once.) The short version is in the palace archive, in a drawer marked FOOLS, NOT TO BE OPENED. Open it. Then I’ll tell you the long one.', next: null },
      act: { speaker: FE, mood: 'sad', text: 'Augustin Drabb. The finest straight man Tidecourt ever saw. He could stand perfectly still while the stage burned down around him. He quit in C. 1012 to clerk in the Counting House, and he hasn’t smiled since. I’d like one more night with him. Ask him for me. He won’t say yes to me.', next: null },
      joke: { speaker: FE, mood: 'happy', text: 'A man walks into the Counting House and asks for a loan. They say, what for? He says, to pay back the last one. They give it to him. That isn’t a joke, that’s the economy of Tidecourt. (He falls over.) That was the joke.', next: 'start' },
    },
  },
  {
    id: 'dialogue:obj-palace-fools-drawer', name: 'Mentor: the FOOLS drawer', scope: 'party',
    entries: [{ when: stage('quest:jester-the-fools-licence', 'archive'), node: 'drawer' }, { node: 'plain' }],
    nodes: {
      drawer: { speaker: 'narrator', text: 'A long drawer at the bottom of the palace archive, sealed with wax and a fool’s bell. Inside, on vellum gone the colour of tea: THE FOOL’S LICENCE. “A fool may tell the crown one truth in each reign, unpunished, so long as it is funny.” In the margin, very small, someone has drawn a man falling over.', next: null },
      plain: { speaker: 'narrator', text: 'The FOOLS drawer, open, and nobody has been punished for it.', next: null },
    },
  },
  {
    id: 'dialogue:jester-fennick-licence', name: 'Mentor: the Fool’s Licence', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: FE, text: '(He unrolls it on his knees and looks at it for a long time.) C. 1012. The King had the pawn deed for the gate in front of him and the pen in his hand. The court was silent. So I fell down. Right in front of the throne. Flat. The whole court laughed.', next: 'signed' },
      signed: {
        speaker: FE, mood: 'sad', text: 'And the King laughed with them, and wiped his eyes, and signed it anyway. I fell over to stop him and all I did was make it easier. I’ve been falling over ever since. I suppose I’m still trying to stop him. A fool gets one truth a reign. I spent mine on a pratfall.',
        choices: [{ text: 'This reign hasn’t had its truth yet.', to: 'end', insight: 'fools_licence', trust: 1 }],
      },
      end: { speaker: FE, text: '(He looks at you over the top of the vellum.) No. No, it hasn’t, has it. Remember that, if they ever hand you a jest to read.', next: null },
    },
  },
  {
    id: 'dialogue:jester-drabb-asked', name: 'Mentor: asking Augustin Drabb', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:augustin-drabb', text: '(He does not look up from his ledger.) Pantaloon sent you. Column A, column B. I am a clerk now. Clerks do not do double acts.',
        choices: [
          { text: 'He says nobody ever stood still like you.', to: 'still' },
          { text: '(Fall over his desk, very slowly, taking his inkwell with you.)', to: 'fall', school: 'guile' },
          { text: 'He’s old, Master Drabb. He wants one more night.', to: 'old' },
        ],
      },
      still: { speaker: 'npc:augustin-drabb', text: '(His pen stops.) …I did stand very still. People used to cry, I stood so still. (A long pause.) Tell him tonight. Tell him I want the blue chair, not the red one. He knows.', next: null },
      fall: { speaker: 'npc:augustin-drabb', text: '(He watches the ink spread across his ledger without moving a muscle. It is magnificent. It is the most perfectly still face you have ever seen.) …Tell him tonight. Tell him I want the blue chair.', next: null },
      old: { speaker: 'npc:augustin-drabb', mood: 'sad', text: 'We are all old. He was old when we started. (He closes the ledger.) Tonight, then. Tell him I want the blue chair, not the red one. He knows why.', next: null },
    },
  },
  {
    id: 'dialogue:obj-pantaloon-stage', name: 'Mentor: setting the stage', scope: 'party',
    entries: [{ when: stage('quest:jester-the-pantaloon-act', 'stage'), node: 'stage' }, { node: 'plain' }],
    nodes: {
      stage: { speaker: 'narrator', text: 'You sweep the boards, lay the cushions where Fennick will fall, and set out two chairs: a red one, and a blue one. By sunset the Masquerade Quarter is queueing round the square. Somebody has painted a sign: THE PANTALOON ACT, ONE NIGHT, AGAIN.', next: null },
      plain: { speaker: 'narrator', text: 'The little stage in the Quarter, with two chairs on it.', next: null },
    },
  },
  {
    id: 'dialogue:jester-fennick-act', name: 'Mentor: the Pantaloon Act', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: FE, mood: 'happy', text: '(Backstage, still out of breath, with his cap on crooked.) Did you see? Did you see him? Forty minutes of me falling over and him not moving a muscle, and then at the very end, the very end, he smiled. Once. The whole Quarter screamed.', next: 'end' },
      end: { speaker: FE, mood: 'sad', text: 'Thirty years. You’ve given me back something I thought I’d pawned for good, and I’m a fool, and I still haven’t got a line good enough to thank you with. So: thank you.', effects: [{ trust: FE, delta: 1 }], next: null },
    },
  },
  // ---------- Sorrow and Vex (general)
  {
    id: 'dialogue:jester-sorrow', name: 'Sorrow (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: SO, text: 'Little fool. Have you come to sell me something? Everybody does, in the end.',
        choices: [
          { text: 'What do you do with all the laughter?', to: 'laugh' },
          { text: 'Have you ever laughed, Sorrow?', to: 'ever' },
          bye,
        ],
      },
      laugh: { speaker: SO, text: 'I give it away. On credit. It’s the only thing I sell that I don’t keep.', next: null },
      ever: { speaker: SO, text: 'Once, I think. A long time ago. I didn’t care for it. Good afternoon.', next: null },
    },
  },
  {
    id: 'dialogue:jester-vex', name: 'Guildmaster Vex (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:guildmaster-vex', text: 'Everything has a price, child, and the Exchange knows all of them. The King’s is very low just now. Say so in public, in a way that makes them laugh, and I’ll pay you more than he ever has.', next: null } },
  },
  // ---------- the Velvet Docks: Tuttle, Prigg, Gull Number Nine, Mother Gudgeon
  {
    id: 'dialogue:jester-tuttle', name: 'Tuttle (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:tuttle', text: 'Pearls only. Everything in this shop belongs to somebody who is coming back for it. Some of them are taking their time.', next: null } },
  },
  {
    id: 'dialogue:jester-prigg', name: 'Constable Prigg (Gull Number Nine, bounties)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:constable-prigg', text: 'Harbour Watch. Bounties on the board. And at dawn, justice. (He gestures proudly at a gibbet about the size of a hatbox.)',
        choices: [
          offer('quest:jester-gull-number-nine', 'Is that gibbet for a gull?', 'gull'),
          offer('quest:jester-bounty-velvet-fingers', 'The Velvet Fingers.', 'fingers', { questCompleted: 'quest:jester-fennicks-pawn-ticket' }),
          offer('quest:jester-bounty-old-grin', 'Old Grin, the wishing-well.', 'grin', { questCompleted: 'quest:jester-the-counting-house' }),
          bye,
        ],
      },
      gull: { speaker: 'npc:constable-prigg', text: 'Gull Number Nine. Forty-one counts of chip theft. Three stalls robbed last night alone. Never mind that it was in my cells for two of them. A gull is a gull. Unless you can prove otherwise, at dawn it swings.', next: null },
      fingers: { speaker: 'npc:constable-prigg', text: 'Cutpurses. Six of them, in matching lilac gloves, working the Docks as a team. I admire the coordination. I would like it to stop.', next: null },
      grin: { speaker: 'npc:constable-prigg', mood: 'afraid', text: 'The wishing-well at the top of the Stairs. People throw a coin in, make a wish, and the well smiles. Three wishers this month have not come back up. Do not make a wish.', next: null },
    },
  },
  {
    id: 'dialogue:obj-chip-stall-3', name: 'Side: the third chip stall', scope: 'party',
    entries: [{ when: stage('quest:jester-gull-number-nine', 'scenes'), node: 'stall' }, { node: 'plain' }],
    nodes: {
      stall: { speaker: 'narrator', text: 'The third robbed chip stall. Salt everywhere, the paper cones torn open with something sharp and neat, and on the counter a single feather: long, glossy, and black as tar. No gull ever grew a feather like that.', next: null },
      plain: { speaker: 'narrator', text: 'A chip stall, open for business, keeping a close eye on the sky.', next: null },
    },
  },
  {
    id: 'dialogue:jester-prigg-gull', name: 'Side: the gull acquitted', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:constable-prigg', text: 'Forty-one chips. In a Thief Crow’s nest. Forty-one exactly. (He looks at the tiny gibbet, and at the gull, for a long time.) The Watch withdraws its charges. The Watch is not happy about it.',
        choices: [
          { text: 'Justice is done, Constable.', to: 'done', trust: 1 },
          { text: 'You could hang the crow.', to: 'crow' },
        ],
      },
      done: { speaker: 'npc:constable-prigg', text: 'Justice is done. Chips are not. (The gull, released, walks out of the cell, looks at you, and follows you out of the door.) Oh, and it’s yours now, apparently. Good luck.', next: null },
      crow: { speaker: 'npc:constable-prigg', text: 'The crow is in the river and has, I am told, no regrets. (The gull, released, walks out of the cell and follows you out of the door.) Oh, and it’s yours now, apparently.', next: null },
    },
  },
  {
    id: 'dialogue:jester-gull', name: 'Gull Number Nine',
    entries: [{ when: { flag: 'jester.gull_saved' }, node: 'free' }, { node: 'cell' }],
    nodes: {
      cell: { speaker: 'npc:gull-number-nine', text: '(The gull, in a very small cell, fixes you with one yellow eye and says something that sounds extremely like “innocent”.)', effects: [{ setFlag: 'jester.delight.gull-met', value: true }], next: null },
      free: { speaker: 'npc:gull-number-nine', text: '(Gull Number Nine is following you. It is looking at your pockets. It has always been looking at your pockets. It is not sorry.)', next: null },
    },
  },
  {
    id: 'dialogue:jester-gudgeon', name: 'Mother Gudgeon (Mother Gudgeon’s Tab)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:mother-gudgeon', text: 'Fresh cod! Fresh-ish cod! Oh, it’s you, dear. Come to tell me Sorrow’s bought my slate as well?',
        choices: [offer('quest:jester-mother-gudgeons-tab', 'Has he?', 'slate', { questCompleted: 'quest:jester-fennicks-pawn-ticket' }), bye],
      },
      slate: { speaker: 'npc:mother-gudgeon', mood: 'angry', text: 'Bought the whole street’s tab this morning, cash, and sent a clerk round to say it’s due by the Jubilee. Thirty years I’ve run on that slate. I’ve never once been short. Well. Once. Maybe twice.', next: null },
    },
  },
  {
    id: 'dialogue:jester-gudgeon-tab', name: 'Side: settling the tab', scope: 'party',
    entries: [{ when: { not: { flag: 'jester.tab_settled' } }, node: 'start' }, { node: 'after' }],
    nodes: {
      start: {
        speaker: 'npc:mother-gudgeon', text: '(She unrolls the slate. It is as long as the stall.) There. Every herring, every sprat, every half-pint since the year of the Hollowing. Sorrow’s clerk says pay, or he takes the stall.',
        choices: [
          { text: 'I’ll take it to the Exchange and haggle it down.', to: 'haggle', effects: [{ setFlag: 'jester.tab_settled', value: 'haggled' }] },
          { text: 'Mother, this slate was settled twice. C. 1019 and C. 1031. It’s in Tuttle’s ledger.', to: 'twice', insight: 'gudgeon_paid_twice', when: { flag: 'jester.tuttle_ledger' }, effects: [{ setFlag: 'jester.tab_settled', value: 'proved' }] },
          { text: '(Tell the clerk a joke so long he forgets what he came for.)', to: 'joke', school: 'guile', effects: [{ setFlag: 'jester.tab_settled', value: 'joked' }] },
        ],
      },
      haggle: { speaker: 'npc:mother-gudgeon', text: 'Down to what? (You tell her.) Half of a herring a week. For thirty years. (She does the sum on her fingers, and then on yours.) I can do that. Here, have some cod. Fresh-ish.', next: null },
      twice: { speaker: 'npc:mother-gudgeon', mood: 'happy', text: 'Twice? TWICE? (She rolls up the slate and hits the clerk with it, gently, all the way to the end of the street.) Thirty years I paid that slate off twice and nobody told me! Have some cod. Have all the cod.', next: null },
      joke: { speaker: 'npc:mother-gudgeon', mood: 'happy', text: '(Twenty minutes later the clerk wanders off, laughing, with no slate, no ledger and one shoe.) I don’t know what you said to him, dear, and I don’t want to. Have some cod.', next: null },
      after: { speaker: 'npc:mother-gudgeon', text: 'Fresh cod! For you, dear, very fresh. Well. Fresh-ish.', next: null },
    },
  },
  // ---------- the Masquerade Quarter: Squibb and Daub, the Worst Joke
  {
    id: 'dialogue:jester-squibb', name: 'Ottoline Squibb (the Man Who Forgot His Face)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ottoline-squibb', text: 'Is my nose large? Under here? I think it might be large. I put this on for one night, for one masque, in the year of the Hollowing, and I can’t remember what I look like.',
        choices: [offer('quest:jester-the-man-who-forgot-his-face', 'Take it off and see.', 'off'), bye],
      },
      off: { speaker: 'npc:ottoline-squibb', mood: 'afraid', text: 'And what if there’s nobody there? No. No. Somebody painted me once, when I was twenty. Old Clementine Daub, I think. Find the picture first. Then I’ll know what I’m looking for.', next: null },
    },
  },
  {
    id: 'dialogue:jester-daub', name: 'Side: Clementine Daub', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:clementine-daub', text: 'Squibb? Ottoline Squibb? (She laughs.) Oh, I painted him. He came in with his mask in his hand and a laugh you could hear on the Docks. It’s in the back, face to the wall. They all are. Nobody ever comes back for their faces.', next: null },
    },
  },
  {
    id: 'dialogue:jester-daub-general', name: 'Clementine Daub (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:clementine-daub', text: 'Everyone in this Quarter is masked. I paint what’s under the mask. That’s why I’m poor, and why I sleep well.', next: null } },
  },
  {
    id: 'dialogue:obj-squibb-portrait-canvas', name: 'Side: Squibb at twenty', scope: 'party',
    entries: [{ when: stage('quest:jester-the-man-who-forgot-his-face', 'portrait'), node: 'face' }, { node: 'plain' }],
    nodes: {
      face: { speaker: 'narrator', text: 'You turn the canvas round. A young man of twenty with a large nose, a crooked grin and a laugh so wide the painter had to make the canvas bigger. He is holding his gold mask in his hand as if he has only just taken it off and cannot think why he ever put it on.', next: null },
      plain: { speaker: 'narrator', text: 'A portrait, facing the room now.', next: null },
    },
  },
  {
    id: 'dialogue:jester-squibb-face', name: 'Side: Squibb’s face', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ottoline-squibb', text: 'Well? Well? Large nose?',
        choices: [
          { text: 'Enormous. And the best laugh in the Quarter.', to: 'laugh', trust: 1 },
          { text: 'You were holding your mask in your hand, like you didn’t need it.', to: 'hand' },
        ],
      },
      laugh: { speaker: 'npc:ottoline-squibb', mood: 'happy', text: 'Enormous! (He touches the mask where his nose would be, wonderingly.) I think, at the Jubilee, I might take it off. In public. Just to see if the laugh is still under there.', next: null },
      hand: { speaker: 'npc:ottoline-squibb', text: 'Like I didn’t need it. (A long breath behind the gold.) At the Jubilee, then. I’ll take it off at the Jubilee. Everyone else will be too busy laughing to look.', next: null },
    },
  },
  {
    id: 'dialogue:jester-hortense', name: 'Dame Hortense (the Worst Joke in Tidecourt)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:hortense-quibble', text: 'Eleven years. Eleven years Fennick Pantaloon has won the Worst Joke in Tidecourt, and I have heard every one of them. I cannot take a twelfth. You. You’re a fool. Enter.',
        choices: [offer('quest:jester-the-worst-joke-in-tidecourt', 'How bad does it have to be?', 'bad', { questCompleted: 'quest:jester-the-phantom-theatre' }), bye],
      },
      bad: { speaker: 'npc:hortense-quibble', text: 'Worse than his. Read the rules on the stage first. Nobody ever reads the rules. That’s why Fennick keeps winning: he wrote half of them.', next: null },
    },
  },
  {
    id: 'dialogue:obj-worst-joke-charter', name: 'Side: the contest charter', scope: 'party',
    entries: [{ when: stage('quest:jester-the-worst-joke-in-tidecourt', 'charter'), node: 'charter' }, { node: 'plain' }],
    nodes: {
      charter: {
        speaker: 'narrator', text: 'The contest rules, nailed to the stage: no puns about fish before noon; no jokes about the King unless they are true; the judge’s decision is final unless she is laughing. At the very top, a preamble in older ink.',
        choices: [
          { text: 'Read the preamble.', to: 'preamble' },
          { text: 'Skip to the prizes.', to: 'prize' },
        ],
      },
      preamble: {
        speaker: 'narrator', text: '“This contest is held under the Fool’s Licence, granted by the first Concordant of Tidecourt: that a fool may tell the crown one truth in each reign, unpunished, so long as it is funny. The worst joke is held each year to keep the fools in practice.”',
        choices: [{ text: 'One truth a reign. So long as it’s funny.', to: null, insight: 'fools_licence' }, { text: 'Interesting.', to: null }],
      },
      prize: { speaker: 'narrator', text: 'The prize is a cap that honks when you nod. It has been on Fennick’s head for eleven years and smells of him.', next: null },
      plain: { speaker: 'narrator', text: 'The Worst Joke rules, nailed to the stage.', next: null },
    },
  },
  {
    id: 'dialogue:jester-hortense-contest', name: 'Side: the worst joke', scope: 'party',
    entries: [{ when: { not: { flag: 'jester.worst_joke' } }, node: 'start' }, { node: 'after' }],
    nodes: {
      start: {
        speaker: 'npc:hortense-quibble', text: 'Fennick told the one about the herring and the Concordant again. Three people fainted. A dog left. Your turn. Make it worse.',
        choices: [
          { text: '“Why did the pawnbroker cross the road? He didn’t. He sold the road.”', to: 'road', effects: [{ setFlag: 'jester.worst_joke', value: 'road' }] },
          { text: '“What’s the difference between a fool and a King? About forty years of compound interest.”', to: 'king', effects: [{ setFlag: 'jester.worst_joke', value: 'king' }] },
          { text: '(Begin a joke about a goose, and keep going for twenty minutes without ever reaching the end.)', to: 'goose', school: 'guile', effects: [{ setFlag: 'jester.worst_joke', value: 'goose' }] },
        ],
      },
      road: { speaker: 'npc:hortense-quibble', mood: 'happy', text: '(Total silence across the square. Somebody coughs. A gull leaves.) …Dreadful. Truly dreadful. That is the worst thing I have heard in forty years. The cap is yours.', next: 'fennick' },
      king: { speaker: 'npc:hortense-quibble', text: '(Silence, and then, very slowly, the whole square starts to laugh, and cannot stop.) No. No, that was good! That was funny! You’re disqualified. (Pause.) Oh, give them the cap anyway. Fennick, sit down.', next: 'fennick' },
      goose: { speaker: 'npc:hortense-quibble', mood: 'happy', text: '(Twenty minutes later half the square is asleep and the other half is weeping.) There was no goose. There was never any goose. That is the worst joke in the history of Tidecourt. The cap is yours.', next: 'fennick' },
      fennick: { speaker: FE, mood: 'happy', text: '(From the front row, handing over the cap, which honks.) Eleven years. I’m so proud I could fall over. (He does.)', next: null },
      after: { speaker: 'npc:hortense-quibble', text: 'The reigning champion of the Worst Joke in Tidecourt. Don’t let it go to your head. The cap will, if you nod.', next: null },
    },
  },
  // ---------- the Exchange Floor: A Promise, Slightly Used; Futures in Weather
  {
    id: 'dialogue:jester-rosamund', name: 'Rosamund Hake (A Promise, Slightly Used)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:rosamund-hake', text: 'Saturday. The wedding is Saturday. I have a dress, and a groom, and no vow.',
        choices: [offer('quest:jester-a-promise-slightly-used', 'Where is it?', 'where', { questCompleted: 'quest:jester-the-kings-fool' }), bye],
      },
      where: { speaker: 'npc:rosamund-hake', mood: 'sad', text: 'On a stall on the Floor, under glass, marked “lightly worn”. I sold it to pay my father’s debts. You can sell anything on the Exchange, even a promise you haven’t made yet. I didn’t think anyone would buy it.', next: null },
    },
  },
  {
    id: 'dialogue:obj-promise-stall', name: 'Side: the promise stall', scope: 'party',
    entries: [{ when: stage('quest:jester-a-promise-slightly-used', 'stall'), node: 'stall' }, { node: 'plain' }],
    nodes: {
      stall: {
        speaker: 'narrator', text: 'A broker’s stall of second-hand promises: a box of oaths, “barely sworn”; an apology, “never accepted, as new”; and under glass, a small folded paper labelled ROSAMUND’S VOW, LIGHTLY WORN. The broker eyes you over his spectacles.',
        choices: [
          { text: 'Point out that a vow isn’t worn until it’s said, so it’s new, and he’s mislabelled it, and that’s fraud.', to: 'fraud', school: 'guile' },
          { text: 'Buy it. Whatever he asks.', to: 'buy' },
          { text: 'Tell him it’s cursed. Every vow is, a bit.', to: 'curse' },
        ],
      },
      fraud: { speaker: 'narrator', text: 'The broker opens his mouth, shuts it, looks at the label, and goes pale. He hands you the vow very quickly, and asks you very politely not to mention it to the Exchange.', next: null },
      buy: { speaker: 'narrator', text: 'He names a price. You pay it. He wraps the vow in tissue, a little sadly, and says it was the only new thing on the stall.', next: null },
      curse: { speaker: 'narrator', text: 'He laughs, and then he looks at the box of oaths, and stops laughing, and gives you the vow for half its price.', next: null },
      plain: { speaker: 'narrator', text: 'A stall of used promises. There is a gap under the glass.', next: null },
    },
  },
  {
    id: 'dialogue:jester-rosamund-vow', name: 'Side: the vow returned', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:rosamund-hake', mood: 'happy', text: '(She holds it to her chest.) It’s warm. I didn’t know they were warm. Come on Saturday. Come and stand at the back and hear me say it, all of it, out loud, so nobody can ever sell it again.', next: null },
    },
  },
  {
    id: 'dialogue:jester-mizzle', name: 'Lionel Mizzle (Futures in Weather)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:lionel-mizzle', text: 'Fine tomorrow! Fine tomorrow, going cheap! (Quietly, to you.) Please. Please. I’ve sold fine weather for Saturday to the entire market, and the Bell has spoiled the sky.',
        choices: [offer('quest:jester-futures-in-weather', 'What happens if it rains?', 'rain', { questCompleted: 'quest:jester-the-kings-fool' }), bye],
      },
      rain: { speaker: 'npc:lionel-mizzle', mood: 'afraid', text: 'I owe everyone a fine day. You can’t pay back a fine day. I’ve looked into it. Cover my position: buy up the umbrellas, sell the sunshine, and put a bet against me. Three desks. Go.', next: null },
    },
  },
  {
    id: 'dialogue:jester-mizzle-covered', name: 'Side: Mizzle is covered', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:lionel-mizzle', mood: 'happy', text: '(Outside it has begun, very gently, to rain.) Covered! Every penny! I own every umbrella in Velvet Harbour, I’ve sold the sunshine to a man from Solaria, and I’ve won a bet against myself. Here. Your commission.', next: 'solarian' },
      solarian: { speaker: 'npc:lionel-mizzle', mood: 'afraid', text: '(He reads a note a runner has just handed him, and goes pale.) Ah. The man from Solaria would like his sunshine delivered. Today. He’s at the end of the Docks, under a parasol, in the rain. Would you?', next: null },
    },
  },
  // ---------- the Crooked Stairs: Smallbone, Wick Pellam
  {
    id: 'dialogue:jester-wick', name: 'Wick Pellam (the Chest That Bites Back, the Lamplighter’s Wife)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:wick-pellam', text: 'Every night I climb the Stairs and light the lamp at the top. Every night. I couldn’t tell you why. My hands know. I don’t.',
        choices: [
          offer('quest:jester-the-lamplighters-wife', 'Let me watch you light it tonight.', 'watch', { questCompleted: 'quest:jester-the-counting-house' }),
          offer('quest:jester-the-chest-that-bites-back', 'Why is that chest shouting?', 'chest', { questCompleted: 'quest:jester-the-counting-house' }),
          bye,
        ],
      },
      watch: { speaker: 'npc:wick-pellam', text: 'If you like. After dark. I start when the bells on the Docks stop. It’s the only time the Stairs are quiet.', next: null },
      chest: { speaker: 'npc:wick-pellam', text: 'Fourth landing. It’s a Mimic Slime. It ate a debt-collector last week, and he’s still in there, collecting. He’s collected from me twice. I don’t owe anybody anything. I think.', next: null },
    },
  },
  {
    id: 'dialogue:obj-pellam-lamp', name: 'Side: Wick lights the lamp',
    entries: [
      { when: { all: [stage('quest:jester-the-lamplighters-wife', 'lamp'), NIGHT] }, node: 'night' },
      { when: stage('quest:jester-the-lamplighters-wife', 'lamp'), node: 'day' },
      { node: 'lamp' },
    ],
    nodes: {
      lamp: { speaker: 'narrator', text: 'An old iron lamp at the top of the Crooked Stairs, looking out over the harbour.', next: null },
      day: { speaker: 'narrator', text: 'The lamp is cold. Wick lights it after dark, when the Dock bells stop.', next: null },
      night: {
        speaker: 'narrator', text: 'Wick climbs the last step, lights the lamp, and stands with his hand on the post looking out to sea, the way you would stand at a window waiting for somebody to come home. Then he blinks, and does not know why he is standing there. At the lamp’s foot is a little tin box.',
        effects: [{ setFlag: 'jester.lamp_watched', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-pellam-receipt', name: 'Side: the receipt in the tin', scope: 'party',
    entries: [{ when: stage('quest:jester-the-lamplighters-wife', 'receipt'), node: 'receipt' }, { node: 'plain' }],
    nodes: {
      receipt: { speaker: 'narrator', text: 'In the tin: a woman’s wedding ring, worn thin, and a receipt on good paper. “One grief, for the late Mrs Pellam, received with thanks. Paid in laughter, on credit. H.S.” It is dated nine years ago. The handwriting is the same as on every jar in the Counting House.', next: null },
      plain: { speaker: 'narrator', text: 'An empty tin box at the foot of the lamp.', next: null },
    },
  },
  {
    id: 'dialogue:jester-wick-receipt', name: 'Side: what Wick sold', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:wick-pellam', text: '(He reads it three times, and turns the ring over in his fingers.) Mrs Pellam. Ada. She used to watch for my boat from the top of the Stairs. I lit the lamp so she could see the steps. I sold her. I sold missing her, at a shop with a red door.',
        choices: [
          { text: 'You kept lighting the lamp anyway.', to: 'lamp', trust: 1 },
          { text: 'He paid you in laughter. Was it worth it?', to: 'worth' },
        ],
      },
      lamp: { speaker: 'npc:wick-pellam', mood: 'sad', text: 'I did, didn’t I. The hands remember what the heart sells. (He puts the ring on his little finger.) Take the old lantern. I’ll light this one myself, tonight, knowing why.', next: null },
      worth: { speaker: 'npc:wick-pellam', mood: 'sad', text: 'I laughed for a month. I don’t remember at what. (He puts the ring on his little finger.) Take the old lantern. I’ll light this one myself, tonight, knowing why.', next: null },
    },
  },
  {
    id: 'dialogue:jester-smallbone', name: 'Side: Collector Smallbone', scope: 'party',
    entries: [{ when: stage('quest:jester-the-chest-that-bites-back', 'smallbone'), node: 'start' }, { node: 'after' }],
    nodes: {
      start: {
        speaker: 'npc:collector-smallbone', text: '(A damp man in a damp coat, with a dry ledger, emerges from the slime and straightens his collar.) Thank you. One week. One week in a slime, and I collected from eleven passers-by, which is a personal best. You, I notice, owe nothing. Most irregular.',
        choices: [
          { text: 'You could take the rest of the week off.', to: 'off' },
          { text: 'Actually, the slime owes me for the rescue. Collect from it.', to: 'slime', school: 'guile' },
        ],
      },
      off: { speaker: 'npc:collector-smallbone', text: 'Off? The Counting House does not believe in off. (He thinks about it.) …A half-day. Perhaps. Here, your finder’s fee. It is entered in the ledger.', next: 'refund' },
      slime: { speaker: 'npc:collector-smallbone', mood: 'happy', text: '(He turns to the remains of the slime, opens his ledger and begins, with real joy, to read it its arrears.) Your finder’s fee, with my compliments. Entered in the ledger.', next: 'refund' },
      refund: { speaker: 'npc:collector-smallbone', mood: 'afraid', text: 'One more matter. From inside the slime I collected from three people on the Stairs who owed nothing. Irregular. The refunds are in this envelope. I have never given money back in my life, and I find that I cannot. Would you?', next: null },
      after: { speaker: 'npc:collector-smallbone', text: 'Arrears, accruals, adjustments. Good day. You still owe nothing. It troubles me.', next: null },
    },
  },
  {
    id: 'dialogue:jester-drabb', name: 'Augustin Drabb (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:augustin-drabb', text: 'Column A. Column B. There is nothing funny about columns. I have checked.', next: null } },
  },

  // ======================= ACT II
  {
    id: 'dialogue:jester-hester', name: 'C-1 Lanternford: Hester Glimmer', scope: 'party',
    entries: [{ when: { flag: 'jester.jest', value: 'king' }, node: 'double' }, { node: 'start' }],
    nodes: {
      double: {
        speaker: 'npc:hester-glimmer', text: 'A fool with a Court cap. Oh, I know you. Word comes through the arches with the pearls. You told the King’s jest at the Jubilee, and nobody’s debts went anywhere. Sit down. Drinks are double for the King’s fool.',
        choices: [
          { text: 'It wasn’t my jest. It was his.', to: 'his' },
          { text: 'I need to find the Guile Sentinel.', to: 'queen', quest: true },
        ],
      },
      his: { speaker: 'npc:hester-glimmer', text: 'They always are. Double, all the same. Now. You’ll be after the Queen.', next: 'queen' },
      start: {
        speaker: 'npc:hester-glimmer', mood: 'happy', text: 'A fool! From Velvet Harbour! In a marsh! Sit down. Thirty years we’ve been stuck out here selling lanterns that lead you only slightly into the water, and nobody tells a decent joke.',
        choices: [
          { text: 'I need to find the Guile Sentinel.', to: 'queen', quest: true },
          { text: 'What’s the difference between a lantern and a liar? One of them goes out.', to: 'joke', trust: 1 },
        ],
      },
      joke: { speaker: 'npc:hester-glimmer', mood: 'happy', text: '(She laughs so hard she has to put the jug down.) Oh, that’s dreadful. Lovely. Drinks are on the house. Well, on the slate. You’ll be after the Queen, then.', next: 'queen' },
      queen: { speaker: 'npc:hester-glimmer', text: 'The Lantern Queen. Business rival. Terrible woman. Lovely lamps. She sold the crown’s road safe passage over the marsh for a thousand years, and now she sells lights that lead into the water and charges a memory a time. Cross to the old embassy and she’ll find you.', next: null },
    },
  },
  {
    id: 'dialogue:jester-winnie', name: 'C-4 Winnifred Sprat on the bell-ropes', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:winnifred-sprat', text: 'A fool in a white mask, yes. Very polite. Bought every bell-rope in the loft, the old Abbey ropes we hauled up out of the lake. Paid in black pearls. Who pays for rope in pearls?',
        choices: [
          { text: 'What did he want them for?', to: 'want', quest: true },
          { text: 'Was anyone with him?', to: 'with' },
        ],
      },
      with: { speaker: 'npc:winnifred-sprat', text: 'Two in grey. Tailors, I thought. They kept measuring him while he paid. He let them, like a horse lets the farrier. Odd.', next: 'want' },
      want: { speaker: 'npc:winnifred-sprat', mood: 'afraid', text: 'He said, so the Bell can never be rung. Nicely, like he was doing us all a kindness. And out on the lake that night, under the water, I heard singing, and it sounded pleased. There’s one rope he left. It’s in the loft.', next: null },
    },
  },
  {
    id: 'dialogue:jester-winnie-general', name: 'Winnifred Sprat (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:winnifred-sprat', text: 'Ropes, nets, old bells, older fish. Everything the lake gives up, I keep. Mind the eels.', next: null } },
  },
  {
    id: 'dialogue:obj-jester-bell-rope', name: 'C-4 the last bell-rope', scope: 'party',
    entries: [{ when: stage('quest:jester-sorrow-buys-the-silence', 'ropes'), node: 'rope' }, { node: 'plain' }],
    nodes: {
      rope: { speaker: 'narrator', text: 'One rope left in the loft, swollen with thirty years of lake. Pinned to it is a card in a hand you know: “For the fool from Velvet Harbour. I’ve bought the Bell’s silence. Come and hear it. H.S.” On the back, in pencil, someone else has written: “chest 40, shoulder 22, mask to be the face.”', next: null },
      plain: { speaker: 'narrator', text: 'An empty peg in the Old Fish Mill loft.', next: null },
    },
  },
  {
    id: 'dialogue:jester-choir-laughs', name: 'C-5 the drowned choir laughs', scope: 'party',
    entries: [{ node: 'nave' }],
    nodes: {
      nave: { speaker: 'narrator', text: 'The drowned nave, green and silent. The choir stands in its stalls, a hundred drowned brothers and sisters with their mouths open on a note they stopped singing thirty years ago. Sorrow’s bell-ropes are coiled at the Abbess’s feet like an offering.', next: 'joke' },
      joke: {
        speaker: 'narrator', text: 'Nobody has made them laugh in thirty years. Somebody ought to.',
        choices: [
          { text: '(Fall over, flat, in the middle of the nave.)', to: 'fall' },
          { text: '“How many monks does it take to ring a bell? None. It does it by itself. That’s the whole problem.”', to: 'bell' },
          { text: '(Do the Abbess’s voice, very badly.)', to: 'voice', school: 'guile' },
        ],
      },
      fall: { speaker: 'narrator', text: 'You go down like a sack of flour, the way Fennick taught you. For a long moment, nothing. Then, from the third stall, one small bubble rises. Then another. Then the whole choir is laughing, in bubbles, silver, streaming up to the light.', next: 'rise' },
      bell: { speaker: 'narrator', text: 'Silence in the nave. Then a brother in the back row snorts, and a bubble comes out of his nose, and then the whole choir is laughing, in bubbles, silver, streaming up to the light.', next: 'rise' },
      voice: { speaker: 'narrator', text: '“It shall not be rung,” you say, in a voice like a drain. The choir looks at the Abbess. The Abbess looks at you. And then the whole choir is laughing, in bubbles, silver, streaming up to the light.', next: 'rise' },
      rise: { speaker: 'narrator', text: 'Abbess Morwen rises from her stall, furious, her hands closed on a bell-rope that is not there. Laughter, in her nave. She will not have it. She will not have any of it.', next: null },
    },
  },
  {
    id: 'dialogue:jester-gull-letter', name: 'C-6 a letter by gull', scope: 'party',
    entries: [{ node: 'gull' }],
    nodes: {
      gull: { speaker: 'npc:gull-number-nine-concordia', text: '(Gull Number Nine is sitting on the Guile arch with a letter in its beak and a chip it has stolen from somebody in Brindlecross. It drops the letter at your feet and eats the chip, looking you in the eye.)', next: 'letter' },
      letter: {
        speaker: FE, text: '(The letter is mostly drawings: Fennick falling over a gull; Fennick falling over a cushion; Fennick falling over nothing at all. At the bottom, in a shaky hand:) “Velvet Harbour misses you. I am teaching the gulls to fall over. They are better at it than you were. F.”',
        choices: [{ text: '(Laugh, and fold the letter away.)', to: 'court', quest: true, effects: [{ setFlag: 'jester.fennick_letter', value: true }] }],
      },
      court: { speaker: 'narrator', text: 'At the Stone Court that evening the Corsair bearer shakes your hand, and you find your purse missing, and the Corsair finds their watch missing, and you both laugh. Under the table the Court half and the Reef half hum a sea-shanty together, in a minor key.', next: null },
    },
  },
  {
    id: 'dialogue:jester-pigeon-letter', name: 'C-6 a letter by court pigeon', scope: 'party',
    entries: [{ node: 'pigeon' }],
    nodes: {
      pigeon: { speaker: 'npc:court-pigeon', text: '(A Velvet Court pigeon in a tiny velvet ribbon is standing on the Guile arch with a letter on its leg and an air of enormous ceremony. It bows. It actually bows.)', next: 'letter' },
      letter: {
        speaker: FE, text: '(The letter is mostly drawings: Fennick falling over a pigeon; Fennick falling over a cushion; Fennick falling over nothing at all. At the bottom, in a shaky hand:) “Velvet Harbour misses you. The court pigeons are very grand now. I fall over them for practice. F.”',
        choices: [{ text: '(Laugh, and fold the letter away.)', to: 'court', quest: true, effects: [{ setFlag: 'jester.fennick_letter', value: true }] }],
      },
      court: { speaker: 'narrator', text: 'At the Stone Court that evening the Corsair bearer shakes your hand, and you find your purse missing, and the Corsair finds their watch missing, and you both laugh. Under the table the Court half and the Reef half hum a sea-shanty together, in a minor key.', next: null },
    },
  },
  // ---------- featured bearers (hooks on the bearer NPCs)
  {
    id: 'dialogue:jester-featured-oathbound', name: 'Featured: The Knight Who Wouldn’t Laugh', scope: 'party',
    entries: [
      { when: stage('quest:jester-the-knight-who-wouldnt-laugh', 'back'), node: 'back' },
      { when: { all: [stage('quest:jester-the-knight-who-wouldnt-laugh', 'choir'), { not: { flag: 'jester.aldric_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-oathbound', text: '(Ser Aldric Vow, very straight, very grave.) Fool. I have sworn not to smile until the Concord is restored. At Abbeyshore the drowned choir heard the oath, and now they hold me to it. Every time I come near a smile, the water sings. Come with me. You are the most dangerous person I could bring.',
        choices: [{ text: 'I’ll be on my worst behaviour.', to: null, quest: true, effects: [{ setFlag: 'jester.aldric_asked', value: true }] }],
      },
      back: {
        speaker: 'npc:bearer-oathbound', text: '(Perfectly straight-faced.) I have considered what happened on the chapel steps. I find I am glad of it. When we go to the Heart, I want a fool at my side. Somebody has to be able to tell the King the truth, and it will not be me. I am terrible at it.',
        effects: [{ setFlag: 'jester.aldric_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-jester-oath-steps', name: 'Featured: the chapel steps', scope: 'party',
    entries: [{ when: stage('quest:jester-the-knight-who-wouldnt-laugh', 'choir'), node: 'steps' }, { node: 'plain' }],
    nodes: {
      steps: {
        speaker: 'narrator', text: 'On the Shore Chapel steps the drowned choir’s singing comes up through the stone, very solemn, very heavy. Ser Aldric stands at the top, rigid, the corners of his mouth held down by an oath and thirty drowned voices.',
        choices: [
          { text: 'Help him keep it. Stand beside him, perfectly still, like Augustin Drabb.', to: 'keep' },
          { text: '(Fall down the steps, all of them, one at a time.)', to: 'break', school: 'guile' },
          { text: 'An oath to make yourself unhappy isn’t an oath to the Concord. Smile, Ser Aldric.', to: 'smile' },
        ],
      },
      keep: { speaker: 'narrator', text: 'You stand beside him, motionless, so still that a gull lands on your head. The choir sings on. Ser Aldric does not smile. But his shoulders come down, very slightly, as if someone had taken half the weight.', next: null },
      break: { speaker: 'narrator', text: 'Bump. Bump. Bump. Bump. At the ninth step there is a sound from Ser Aldric like a kettle coming to the boil, and he smiles, enormously, helplessly, and under the water the drowned choir stops singing and, in a stream of bubbles, laughs.', next: null },
      smile: { speaker: 'narrator', text: 'He looks at you for a long time. Then, slowly, as if it hurt, he smiles. The choir’s note falters, and holds, and changes, and becomes something lighter. Ser Aldric wipes his eyes and says it is the spray.', next: null },
      plain: { speaker: 'narrator', text: 'The Shore Chapel steps, wet with spray.', next: null },
    },
  },
  {
    id: 'dialogue:jester-featured-duskweaver', name: 'Featured: Remember the Punchline', scope: 'party',
    entries: [
      { when: stage('quest:jester-remember-the-punchline', 'back'), node: 'back' },
      { when: { all: [stage('quest:jester-remember-the-punchline', 'jokes'), { not: { flag: 'jester.lune_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-duskweaver', text: 'I’ve paid the Queen’s toll four times. Four memories. I don’t know which ones, which is the worst part. But I noticed something. I can’t remember my mother’s birthday. I can remember every joke she ever told. Jokes stick. Will you lend me some?',
        choices: [{ text: 'I’ll lend you my worst ones. They stick hardest.', to: null, quest: true, effects: [{ setFlag: 'jester.lune_asked', value: true }] }],
      },
      back: {
        speaker: 'npc:bearer-duskweaver', text: '(They are laughing quietly at nothing.) The way home through the marsh is a joke about a frog now. My name is a joke about a spoon. I know it’s mine because I can’t stop laughing at it. When we go to the Heart, walk with me. I’ll need someone to remind me of the punchlines.',
        effects: [{ setFlag: 'jester.lune_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-jester-punchline-lantern-1', name: 'Featured: the first joke-lantern', scope: 'party',
    entries: [{ when: stage('quest:jester-remember-the-punchline', 'jokes'), node: 'j' }, { node: 'plain' }],
    nodes: {
      j: { speaker: 'narrator', text: 'Lune hangs the first lantern on the Lantern Shop porch. Into it you tell the way home across the marsh, as a joke about a frog who kept turning left. Lune laughs, and the lantern flickers, and the joke stays put.', next: null },
      plain: { speaker: 'narrator', text: 'A lantern on the Lantern Shop porch. If you hold it close, it smells faintly of frog.', next: null },
    },
  },
  {
    id: 'dialogue:obj-jester-punchline-lantern-2', name: 'Featured: the second joke-lantern', scope: 'party',
    entries: [{ when: stage('quest:jester-remember-the-punchline', 'jokes'), node: 'j' }, { node: 'plain' }],
    nodes: {
      j: { speaker: 'narrator', text: 'The second lantern holds Lune’s own name, as a joke about a spoon that went to a ball. It is a very bad joke. Lune laughs until they have to sit down on the step.', next: null },
      plain: { speaker: 'narrator', text: 'A lantern on the Lantern Shop porch, glowing slightly spoon-shaped.', next: null },
    },
  },
  {
    id: 'dialogue:obj-jester-punchline-lantern-3', name: 'Featured: the third joke-lantern', scope: 'party',
    entries: [{ when: stage('quest:jester-remember-the-punchline', 'jokes'), node: 'j' }, { node: 'plain' }],
    nodes: {
      j: { speaker: 'narrator', text: 'The third is the hardest. Lune wants to keep why they are fighting. You tell it as the oldest joke in Velvet Harbour, the one with no punchline, where the King asks the fool what he’s for. Lune does not laugh at this one. They nod.', next: null },
      plain: { speaker: 'narrator', text: 'A lantern on the Lantern Shop porch, burning steadily.', next: null },
    },
  },
  // ---------- class hooks on the Brindlecross fourteen
  {
    id: 'dialogue:hook-jester-pell', name: 'Hook: Pell and the fool', scope: 'party',
    entries: [{ when: { all: [{ flag: 'jester.jest', value: 'exchange' }, { not: { flag: 'jester.pell_shortcut' } }, { flag: 'story.act', op: '>=', value: 2 }] }, node: 'vex' }],
    nodes: {
      vex: {
        speaker: 'npc:pell', text: 'Hold on. Hold on. You’re Vex’s fool! The one who told the Exchange the King was broke! Word gets through the arches, you know, with the pearls. (He lowers his voice.) For Vex’s fool, a bargain: there’s a straight way through the Marsh that skips the Queen’s pretty lights. Cheap.',
        choices: [{ text: 'How cheap?', to: 'cheap', effects: [{ setFlag: 'jester.pell_shortcut', value: true }] }, { text: 'I’m nobody’s fool, Pell.', to: 'nobody' }],
      },
      cheap: { speaker: 'npc:pell', text: 'For you? Free. Vex would want me to. Well, he’d want me to charge you double, but he isn’t here. Go straight past the first light, keep the willow on your left, and you’re at the toll before the Queen’s noticed.', next: null },
      nobody: { speaker: 'npc:pell', text: 'Everybody’s somebody’s fool, friend. That’s how a market works. Offer stands.', next: null },
    },
  },
];

export default dialogues;
