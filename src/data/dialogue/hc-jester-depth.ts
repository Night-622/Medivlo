/**
 * Hollow Crown, JESTER Act I depth pass (10-campaign-style.md §8, docs/PACING.md): the new stages' scenes,
 * investigation clues, travel banter, optional finds and the third parts of the side quests. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const offer = (q: Q, text: string, to: string): DialogueChoice => ({ text, to, quest: true, when: fresh(q), effects: [{ startQuest: q }] });
/** a stage scene that takes over an NPC's talk must still let them give their own quests */
const more = (...offers: DialogueChoice[]): DialogueChoice[] => [...offers, { text: 'Thank you.', to: null }];
const FE = 'npc:fennick-pantaloon' as const, SO = 'npc:harlequin-sorrow' as const;
const MG = 'npc:mother-gudgeon' as const, AD = 'npc:augustin-drabb' as const;

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
  // ======================= I-1 The Bell at the Masque: walking Fennick home, the attic
  {
    id: 'dialogue:area-jester-dock-walk', name: 'I-1 banter: along the Docks', bark: true,
    entries: [{ when: stage('quest:jester-the-bell-at-the-masque', 'attic'), node: 'b' }],
    nodes: { b: { speaker: FE, text: 'Mind the bollard. Mind the rope. Mind the gull, it bites. Don’t mind me, I always fall here. (He does.) See? Always.', next: null } },
  },
  {
    id: 'dialogue:jester-fennick-cushions', name: 'I-1 Fennick’s attic', scope: 'party',
    entries: [{ node: 'in' }],
    nodes: {
      in: { speaker: 'narrator', text: 'Fennick’s attic is the top of an old sail-loft, and it is made entirely of cushions: cushions on the floor, cushions on the walls, cushions stuffed into the rafters. A fool’s cap with no bells on it hangs from a nail.', next: 'sit' },
      sit: { speaker: FE, text: 'Sit anywhere. Fall anywhere. Everything here has been fallen on, by experts. (He lowers himself onto a heap with a long theatrical groan.) Now. The singing. Is it still going?', next: 'hum' },
      hum: {
        speaker: 'narrator', text: 'It is. Up here it is louder, as if the palace on the hill were leaning towards the window to listen.',
        choices: [
          { text: 'It wants the palace.', to: 'palace' },
          { text: 'It frightens me.', to: 'afraid' },
          { text: '[Guile] (Make a joke of it. Hum along, badly.)', to: 'hum2', school: 'guile' },
        ],
      },
      palace: { speaker: FE, text: 'Of course it does. Everything worth having in Tidecourt is in that palace, and most of it is pawned. The Court half is under the King’s cushion, if my bones are right. My bones are always right about cushions.', next: 'why' },
      afraid: { speaker: FE, mood: 'sad', text: 'Good. Fear is a fool’s best friend. It tells you where the edge is, so you know where to fall. Never let anybody in this town buy it off you.', next: 'why' },
      hum2: { speaker: FE, mood: 'happy', text: '(He joins in, worse, and for a moment the whole attic hums out of tune, and the singing in your chest sounds almost amused.) There. Now it knows you’re a fool. Stones like to know who they’re dealing with.', next: 'why' },
      why: {
        speaker: FE, text: 'The last time a stone sang in Tidecourt I was a young fool at court, and the King was a young King, and he pawned the gate that same year. (He looks at the cap on the nail.)',
        choices: [
          { text: 'What happened to your bells?', to: 'bells' },
          { text: 'Why did he pawn it?', to: 'pawn' },
        ],
      },
      bells: { speaker: FE, text: 'Pawned them. Eleven years ago, to Tuttle, to mend the roof. A fool without bells is just a man in a silly hat, so I’ve been a man in a silly hat. Tomorrow you can fetch them back for me.', next: 'end' },
      pawn: { speaker: FE, mood: 'sad', text: 'Because he was frightened, and somebody offered to buy the fright off him. That’s Tidecourt. Tomorrow, an errand: my cap-bells are at Tuttle’s Pawn. Fetch them, and we’ll see about the rest.', next: 'end' },
      end: { speaker: 'narrator', text: 'He throws you a cushion that smells of oranges and old greasepaint. You sleep under the rafters with the Court half humming in your chest and the gulls walking about on the roof like landlords.', next: null },
    },
  },

  // ======================= I-4 The King’s Fool: the palace steps
  {
    id: 'dialogue:area-jester-palace-walk', name: 'I-4 banter: up to the palace steps', bark: true,
    entries: [{ when: stage('quest:jester-the-kings-fool', 'steps'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Ahead of you Sorrow tips a page boy a silver penny for holding open a door he could perfectly well have opened himself. The boy bows so low his cap falls off.', next: null } },
  },
  {
    id: 'dialogue:jester-sorrow-steps', name: 'I-4 Sorrow on the palace steps', scope: 'party',
    entries: [{ node: 'in' }],
    nodes: {
      in: { speaker: 'narrator', text: 'The palace steps above the Exchange, at the hour the pages come down with the King’s letters. Sorrow is sitting on the third step from the top with a page boy on either side of him, teaching them a card trick.', next: 'trick' },
      trick: { speaker: SO, text: 'Pick a card. No, not that one, that one’s for the King. (The boy picks, and it is a queen, and he shrieks with delight.) There. Run along. Tell nobody how it’s done, especially me.', next: 'you' },
      you: {
        speaker: SO, text: 'You came. I hoped you might. Sit. Ask what you like. A fool should always be asked things. It is the only time anybody listens to the answer.',
        choices: [
          { text: 'Why are you so kind to the pages?', to: 'pages' },
          { text: 'What is the cap at court, really?', to: 'cap' },
          { text: '[Guile] (Do the card trick back to him, better.)', to: 'trick2', school: 'guile' },
        ],
      },
      pages: { speaker: SO, text: 'Because nobody else is. Because they are seven, and frightened, and the palace is very big. I was a page here myself, once. (A pause.) A long time ago.', next: 'laugh' },
      cap: { speaker: SO, text: 'A bell, a stool, a seat at the King’s left hand, and the right to say anything you like, so long as it is funny. It is the best job in Tidecourt. It is also the loneliest.', next: 'laugh' },
      trick2: { speaker: SO, text: '(He watches the card come out of his own sleeve, and something in the white mask moves. Not a smile. The place where one would be.) Oh, very good. Very good indeed. Who taught you that?', next: 'laugh' },
      laugh: { speaker: 'narrator', text: 'A page boy runs past, giggling, and trips on the step, and everyone on the steps laughs, you included. Sorrow watches all of you laugh. He does not laugh. His sleeves clink, very faintly, as he folds his hands.', effects: [{ setFlag: 'jester.sorrow_watched', value: true }], next: 'end' },
      end: { speaker: SO, text: 'Think about the cap. And give old Pantaloon my regards. Tell him I still have his stool. He’ll know which one.', next: null },
    },
  },

  // ======================= I-5 The Jubilee Jest: canvassing the Docks and the Counting House
  {
    id: 'dialogue:jester-gudgeon-canvass', name: 'I-5 Mother Gudgeon on the Jubilee', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: MG, text: 'The Jubilee? Every debt forgiven by a joke? (She guts a herring with great violence.) Dear, I’ve heard that joke. My mother heard it. You know what you get when a King forgives your debts? A new slate, by Tuesday.',
        choices: [
          { text: 'Then what should I say?', to: 'say' },
          { text: 'Would it help, if it were true?', to: 'true' },
        ],
      },
      say: { speaker: MG, text: 'Something that makes them laugh and makes them think, and if you can only do one, make them laugh. A frightened harbour does stupid things. A laughing one does fewer.', next: 'end' },
      true: { speaker: MG, mood: 'sad', text: 'If it were true I’d shut the stall for a day and sit on the end of the pier and cry, dear, like a fishwife ought. And I’d not sell one drop of it. Not to anyone.', next: 'end' },
      end: { speaker: MG, text: 'Go on, then. Make it a good one. The Docks will be listening, and the Docks never forget a bad joke.', choices: more(offer('quest:jester-mother-gudgeons-tab', 'Has Sorrow bought your slate?', 'slate')) },
      slate: { speaker: MG, mood: 'angry', text: 'Bought the whole street’s tab this morning, cash, and sent a clerk round to say it’s due by the Jubilee. Thirty years I’ve run on that slate. I’ve never once been short. Well. Once. Maybe twice.', next: null },
    },
  },
  {
    id: 'dialogue:jester-drabb-canvass', name: 'I-5 Drabb on the Jubilee', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: AD, text: '(He does not look up.) A royal jest that forgives every debt. Column A: what is owed. Column B: what is paid. There is no column for jokes. I have looked.',
        choices: [
          { text: 'What happens to the debts?', to: 'debts' },
          { text: 'Did you ever laugh at a Jubilee?', to: 'laugh' },
        ],
      },
      debts: { speaker: AD, text: 'They stay in the book. A debt forgiven is still a debt written down, and everything written down in this House is read, eventually, by something. (The faintest pause.) The Counting House does not sleep well.', next: 'end' },
      laugh: { speaker: AD, mood: 'sad', text: 'At the last one, in C. 1012. Pantaloon fell over in front of the throne and I stood perfectly still beside him, and the court cried laughing. Then the King signed the deed. I came here the next morning.', next: 'end' },
      end: { speaker: AD, text: 'Tell your jest. I shall enter it. Column C. I have just invented it.', next: null },
    },
  },

  // ======================= I-6 The Counting House: the walking coins
  {
    id: 'dialogue:area-jester-coin-gutters', name: 'I-6 banter: the gutters of the Exchange', bark: true,
    entries: [{ when: stage('quest:jester-the-counting-house', 'coins'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'All along the Exchange gutters coins are rolling uphill in single file, like ants, towards the Counting House. Brokers are stamping on them. The coins go round the brokers.', next: null } },
  },
  clue('jester-walking-coin-1', 'I-6 a walking coin (1)', stage('quest:jester-the-counting-house', 'coins'),
    'A copper coin rolling along the gutter by itself, uphill, as purposeful as a beetle. When you pick it up, it struggles. Stamped very small on its face are a date and a debtor’s name.', 'jester.coin_1',
    'A gutter on the Exchange Floor, with nothing in it.'),
  clue('jester-walking-coin-2', 'I-6 a walking coin (2)', stage('quest:jester-the-counting-house', 'coins'),
    'A purse on a broker’s stall, unopened, its strings undoing themselves one knot at a time. The coins inside are queueing to get out. Every one of them owes something, and every one of them knows where to go.', 'jester.coin_2',
    'An empty purse on a broker’s stall.'),
  clue('jester-walking-coin-3', 'I-6 a walking coin (3)', stage('quest:jester-the-counting-house', 'coins'),
    'At the Counting House steps the coins pour in under the door in a bright stream. One has stuck in a crack: a black pearl stamped with the King’s face, warm, and round its rim in tiny royal lettering: OWED.', 'jester.coin_pearl',
    'The Counting House steps.', 'The King has been paying his debts in tears.'),

  // ======================= I-7 Sorrow’s Laughing Shop: the queue at the red door
  clue('jester-shop-queue-1', 'I-7 the queue (1)', stage('quest:jester-sorrows-laughing-shop', 'queue'),
    'A docker in the queue, his cap in his hands. “My brother,” he says. “Drowned in the spring. I can’t sleep for it. He gives you a month of laughing for it. A month!” He looks at the red door the way a cold man looks at an inn.', 'jester.queue_1',
    'The Crooked Stairs below the red door.'),
  clue('jester-shop-queue-2', 'I-7 the queue (2)', stage('quest:jester-sorrows-laughing-shop', 'queue'),
    'A girl of about twelve, holding her mother’s hand. The mother is smiling at nothing; she has been here before. The girl is not smiling. “She sold Dad,” she says. “Now she doesn’t remember to be sad. Or to make supper.”', 'jester.queue_2',
    'A step on the Crooked Stairs, worn by waiting.'),
  clue('jester-shop-queue-3', 'I-7 the queue (3)', stage('quest:jester-sorrows-laughing-shop', 'queue'),
    'An old woman at the very back, who has been coming for years. “Lovely man,” she says. “Always a joke. Never laughs at them, mind. Not once. I asked him why, once. He said it wasn’t his to spend.”', 'jester.queue_heard',
    'The back of a queue that is not there any more.'),

  // ======================= I-9 Exit, Pursued by a Fool: the Jest House on the toll road
  {
    id: 'dialogue:area-jester-toll-road', name: 'I-9 banter: up the toll road', bark: true,
    entries: [{ when: stage('quest:jester-exit-pursued-by-a-fool', 'toll'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Behind you Velvet Harbour falls away down its cliff, all lanterns and bad debts, and for the first time in your life you cannot hear it laughing.', next: null } },
  },
  {
    id: 'dialogue:obj-jester-toll-slate', name: 'I-9 the Jest House slate', scope: 'party',
    entries: [{ when: stage('quest:jester-exit-pursued-by-a-fool', 'toll'), node: 'house' }, { node: 'plain' }],
    nodes: {
      house: { speaker: 'narrator', text: 'Halfway up the toll road stands the Jest House, where the toll was once a joke: every traveller to the Turning told one to the toll-keeper, and if he laughed, they passed. The booth is empty, but its slate is still on the wall, chalked with the last jokes anybody told.', next: 'slate' },
      slate: {
        speaker: 'narrator', text: 'The last line on the slate is dated C. 1012, in a hand you know: “Why did the fool fall over? To stop a King. Did it work?” And under it, in the toll-keeper’s chalk: “Did not laugh. Pass anyway.”',
        choices: [
          { text: '(Chalk a joke of your own under his.)', to: 'chalk', effects: [{ unlockLore: 'lore:hc-jester-jest-house' }] },
          { text: '[Guile] (Rub out “Did not laugh”, and write “Laughed”.)', to: 'rub', school: 'guile', effects: [{ unlockLore: 'lore:hc-jester-jest-house' }] },
        ],
      },
      chalk: { speaker: 'narrator', text: 'You chalk the worst joke you know under his. Nobody laughs; the booth is empty. But the road ahead looks a little less like a debt, and a little more like a road.', next: null },
      rub: { speaker: 'narrator', text: 'You rub out three words with your sleeve and chalk one. It is a lie, of course. It is also, the way Fennick would tell it, the truth with the ending fixed.', next: null },
      plain: { speaker: 'narrator', text: 'The Jest House slate, with new chalk on it.', next: null },
    },
  },

  // ======================= Side: Mother Gudgeon’s Tab (the bait)
  {
    id: 'dialogue:obj-jester-tab-book', name: 'Mother Gudgeon’s Tab: Sorrow’s tab-book', scope: 'party',
    entries: [{ when: stage('quest:jester-mother-gudgeons-tab', 'book'), node: 'book' }, { node: 'plain' }],
    nodes: {
      book: { speaker: 'narrator', text: 'Sorrow’s clerk keeps the tab-book on a stand outside the red door, for customers to sign. On Mother Gudgeon’s page, under the sum, in Sorrow’s neat hand: “Gudgeon, M. Has never sold. Has never wept in public. Buy the street’s slate. She will come.”', next: 'turn' },
      turn: {
        speaker: 'narrator', text: 'The debt was never meant to be paid. It was bait: a whole street bought, so that one stubborn fishwife would climb the Crooked Stairs and sell him thirty years of tears to settle it.',
        choices: [
          { text: '(Tear the page out.)', to: 'tear', effects: [{ setFlag: 'jester.gudgeon_page', value: 'torn' }] },
          { text: '[Guile] (Write SETTLED, TWICE across it, in his own ink.)', to: 'write', school: 'guile', effects: [{ setFlag: 'jester.gudgeon_page', value: 'settled' }] },
          { text: '(Leave it, and remember every word.)', to: 'leave', effects: [{ setFlag: 'jester.gudgeon_page', value: 'seen' }] },
        ],
      },
      tear: { speaker: 'narrator', text: 'It comes out with a very satisfying rip. Nobody notices. Nobody ever notices a page torn out of a book of debts; everyone assumes it was theirs.', next: null },
      write: { speaker: 'narrator', text: 'You copy his hand well enough. SETTLED, TWICE, in Sorrow’s own ink, with a flourish. Let him puzzle over that.', next: null },
      leave: { speaker: 'narrator', text: 'You leave it, and remember every word. Some things are better carried back than torn out.', next: null },
      plain: { speaker: 'narrator', text: 'Sorrow’s tab-book on its stand by the red door.', next: null },
    },
  },
  {
    id: 'dialogue:jester-gudgeon-bait', name: 'Mother Gudgeon’s Tab: the bait', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: MG, text: 'Bait? Me? (She puts down the herring.) He bought the street to get at me. The whole street. Thirty families.',
        choices: [
          { text: 'He wanted your tears. You’ve never sold them.', to: 'never' },
          { text: 'You’d never have gone up those Stairs.', to: 'stairs' },
        ],
      },
      never: { speaker: MG, mood: 'sad', text: 'No. And I’ve had cause. Three husbands and a boat, dear. I cried for every one of them on the end of the pier, in front of everybody, and I’d do it again. Nobody gets to buy that.', next: 'end' },
      stairs: { speaker: MG, mood: 'angry', text: 'I’d have gone up them with a herring in each hand. (A pause.) And he knew that, didn’t he. He knew I’d go up angry and come down lighter. Clever man. Clever, sad man.', next: 'end' },
      end: { speaker: MG, mood: 'happy', text: 'Well. The slate’s settled, the street’s safe and the bait’s gone off, which bait does. Have some cod. Tell your Fennick I’ve never once sold a tear, and he can put that in a joke.', next: null },
    },
  },

  // ======================= Side: the Worst Joke in Tidecourt (why Fennick kept entering)
  {
    id: 'dialogue:jester-fennick-worst', name: 'The Worst Joke in Tidecourt: why Fennick entered', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: FE, text: '(He is sitting on a cushion in the attic with nothing on his head at all, which looks wrong.) The cap honks for you now. Good. It was getting tired of me.',
        choices: [
          { text: 'You lost on purpose.', to: 'purpose' },
          { text: 'Eleven years running. Why keep entering?', to: 'why' },
        ],
      },
      purpose: { speaker: FE, mood: 'happy', text: 'I did not! (A pause.) I told the herring one. Everybody knows the herring one. A man doesn’t tell the herring one to win.', next: 'keep' },
      why: { speaker: FE, text: 'Because after the gate was pawned, nobody in this town wanted to tell a bad joke in public. Bad jokes are brave. You have to stand there while it dies. So I stood there. Eleven years.', next: 'keep' },
      keep: {
        speaker: FE, mood: 'sad', text: 'The contest only runs if somebody enters. I kept it running until somebody better turned up. Somebody worse, I mean. (He pats your knee.) Keep it running. Promise me.',
        choices: [
          { text: 'I promise.', to: 'end', trust: 1, effects: [{ setFlag: 'jester.worst_promise', value: 'promised' }] },
          { text: 'Only if you enter next year.', to: 'next', effects: [{ setFlag: 'jester.worst_promise', value: 'rematch' }] },
        ],
      },
      end: { speaker: FE, text: 'Good. Then I can retire with dignity. I won’t. But I could.', next: null },
      next: { speaker: FE, mood: 'happy', text: 'Next year, then. I’ve been saving one about a goose. There’s no goose. There is never any goose.', next: null },
    },
  },

  // ======================= Side: A Promise, Slightly Used (the wedding)
  {
    id: 'dialogue:obj-jester-wedding-altar', name: 'A Promise, Slightly Used: the wedding', scope: 'party',
    entries: [{ when: stage('quest:jester-a-promise-slightly-used', 'wedding'), node: 'in' }, { node: 'plain' }],
    nodes: {
      in: { speaker: 'narrator', text: 'Saturday, in the little harbour chapel, with gulls on the roof and half the Exchange in the pews. Rosamund is at the altar with her vow unfolded in her hand, and beside her stands her groom, Tolliver Bindle, as white as a sail.', next: 'groom' },
      groom: {
        speaker: 'narrator', text: 'When his turn comes he opens his mouth and nothing comes out. He sold his own vow last month, on the same stall, to pay for the wedding, and he has been too ashamed to tell her.',
        choices: [
          { text: '[Guile] (Feed him the words from the back pew, the way a prompter does.)', to: 'prompt', school: 'guile' },
          { text: '(Hold up the old “lightly worn” label from her vow, so they both see it.)', to: 'label' },
          { text: '(Stand up and say: a vow you make today can’t have been sold yesterday.)', to: 'new' },
        ],
      },
      prompt: { speaker: 'narrator', text: 'You whisper from the back pew, line by line, the way the theatre prompters do. He repeats it, shaking, and by the third line he is not repeating you any more. He is saying his own.', next: 'end' },
      label: { speaker: 'narrator', text: 'He looks at the label, and at her, and laughs, and so does she, and then he says his vow so plainly and so well that the broker in the third pew takes his hat off.', next: 'end' },
      new: { speaker: 'narrator', text: 'The chapel goes quiet. Then Rosamund takes his hand and says, “Then make one now, Tolly,” and he does, badly and beautifully, and nobody in Tidecourt will ever be able to buy it.', next: 'end' },
      end: { speaker: 'narrator', text: 'They are married. On the way out Rosamund presses a slice of cake into your hand and says that if anybody ever offers to buy this vow, you are to set the gull on them.', effects: [{ setFlag: 'jester.wedding', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The harbour chapel, swept, with confetti still in the cracks of the floor.', next: null },
    },
  },

  // ======================= Side: Futures in Weather (delivering the sunshine)
  {
    id: 'dialogue:obj-jester-solarian-berth', name: 'Futures in Weather: one fine day, delivered', scope: 'party',
    entries: [{ when: stage('quest:jester-futures-in-weather', 'delivery'), node: 'berth' }, { node: 'plain' }],
    nodes: {
      berth: { speaker: 'narrator', text: 'At the end of the Docks a tall Solarian merchant in white sits on a sea-chest under a parasol, holding a receipt from Lionel Mizzle: ONE FINE DAY, DELIVERABLE SATURDAY. It is Saturday. It is raining on him, specifically.', next: 'ask' },
      ask: {
        speaker: 'narrator', text: '“I have paid,” he says, with tremendous dignity, “for sunshine. I should like it delivered.”',
        choices: [
          { text: '[Guile] (Sell him a sunny painting from Clementine Daub’s studio, and call it delivery in the Velvet Harbour manner.)', to: 'paint', school: 'guile', effects: [{ setFlag: 'jester.sunshine', value: 'painting' }] },
          { text: '(Hold one of Mizzle’s umbrellas over him and call it a fine day, underneath.)', to: 'brolly', effects: [{ setFlag: 'jester.sunshine', value: 'umbrella' }] },
          { text: '(Tell him a joke so warm he forgets the weather.)', to: 'joke', effects: [{ setFlag: 'jester.sunshine', value: 'joke' }] },
        ],
      },
      paint: { speaker: 'narrator', text: 'He studies the painting for a long time. “This is not sunshine,” he says. “No,” you agree. “It’s better. It will still be sunny in the winter.” He pays Daub double and sails home delighted.', next: null },
      brolly: { speaker: 'narrator', text: 'Under the umbrella it is perfectly dry. He considers this. “Technically,” he says, “it is fine under here.” “Technically,” you agree. He signs the receipt as delivered and laughs, which in Solaria they do not do in the rain.', next: null },
      joke: { speaker: 'narrator', text: 'You tell him the one about the pawnbroker who sold the road. He laughs so hard he drops the parasol, and stands in the rain laughing, and signs the receipt with a wet pen.', next: null },
      plain: { speaker: 'narrator', text: 'An empty berth at the end of the Docks, with a parasol left on it.', next: null },
    },
  },

  // ======================= Side: the Chest That Bites Back (Smallbone’s refunds)
  clue('jester-refund-door-1', 'The Chest That Bites Back: a refund (1)', stage('quest:jester-the-chest-that-bites-back', 'refunds'),
    'A door on the third landing. You hand back four pennies Smallbone collected from inside the slime. The woman who opens it stares at the pennies, then at you, and says nobody in the history of the Stairs has ever had money back from the Counting House.', 'jester.refund_1',
    'A door on the third landing, freshly painted with the refund.'),
  clue('jester-refund-door-2', 'The Chest That Bites Back: a refund (2)', stage('quest:jester-the-chest-that-bites-back', 'refunds'),
    'A boy on the fifth landing, owed one marble. Smallbone has it entered as “one sphere, glass, taken in error.” The boy takes it back very solemnly, and offers you a different marble as interest.', 'jester.refund_2',
    'A step on the fifth landing, with a chalk ring for marbles.'),
  clue('jester-refund-door-3', 'The Chest That Bites Back: a refund (3)', stage('quest:jester-the-chest-that-bites-back', 'refunds'),
    'A retired sailor on the seventh landing, refunded one shilling. He bites it, pockets it, and asks whether the slime is hiring. He would happily be swallowed for a week if he could collect from his brother.', 'jester.refund_3',
    'A sailor’s door on the seventh landing.'),

  // ======================= Optional areas (Claude 2): finds in the Velvet Harbour ruin, cave and viewpoint
  {
    id: 'dialogue:obj-guile-capital-ruin-find', name: 'Velvet Harbour ruin: the first trade', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'Half sunk in the harbour mud, the pillars of the first Exchange, and on the one still standing a trading slate older than the Concord, its single line cut deep: “One joke, for one fish. Both parties satisfied.”', effects: [{ unlockLore: 'lore:hc-guile-capital-ruin' }], next: null } },
  },
  {
    id: 'dialogue:obj-guile-capital-cave-find', name: 'Velvet Harbour cave: the counterfoil', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'At the back of the cave, on a pawnbroker’s spike, hangs a counterfoil as big as a tablecloth: “Pledge: one Gate. Pledged by: the Crown. Redeemable on payment in full.” The line for the buyer’s name has been scratched out so hard the paper is torn.', effects: [{ unlockLore: 'lore:hc-guile-capital-cave' }], next: null } },
  },
  {
    id: 'dialogue:obj-guile-capital-cave-codex', name: 'The Pawn Cave: Old Tuttle’s ledger', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'A pawnbroker’s ledger in a tarred box, the first Tuttle’s, two hundred years old. Every pledge in it was redeemed, and on the flyleaf, in his hand: “Never sell what somebody is coming back for. They are always coming back. Some of them are only slow.”', effects: [{ unlockLore: 'lore:hc-guile-capital-ledger' }], next: null } },
  },
  {
    id: 'dialogue:obj-guile-capital-view-find', name: 'Velvet Harbour viewpoint: the Fool’s Leap', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'From the top of the cliff the whole of Velvet Harbour lies below you: the Docks, the Quarter, the Exchange and the palace, glittering and in debt. On a brass plaque by the edge: “From this spot Fennick Pantaloon fell into the harbour for a bet, C. 1003, and won.”', effects: [{ unlockLore: 'lore:hc-guile-capital-view' }], next: null } },
  },
];

export default dialogues;
