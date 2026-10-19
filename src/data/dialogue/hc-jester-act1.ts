/** Hollow Crown, JESTER Act I main dialogues (Velvet Harbour). Owner: Claude 4. */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const FE = 'npc:fennick-pantaloon' as const, SO = 'npc:harlequin-sorrow' as const;

const dialogues: DialogueDef[] = [
  // ---------- I-1 The Bell at the Masque
  {
    id: 'dialogue:jester-bell-night', name: 'I-1 the Bell rings under Velvet Harbour', scope: 'party',
    entries: [{ node: 'masque' }],
    nodes: {
      masque: { speaker: 'narrator', text: 'Midnight on the Velvet Docks. The court’s barge-masque is coming ashore in a blaze of lanterns, and you are an apprentice fool at the end of the gangplank with a tray of sugared figs, trying not to drop any.', next: 'bell' },
      bell: { speaker: 'narrator', text: 'Somewhere under the harbour a bell rings once. Every bell on every fool’s cap on the Docks answers it, all together, and for one heartbeat the whole of Velvet Harbour stops laughing. You have never heard it silent before.', next: 'silent' },
      silent: { speaker: 'narrator', text: 'In that one heartbeat you can hear things nobody hears on the Docks: water slapping the piles, a child asking a question, a courtier’s stays creaking. Then somebody drops a goblet.', next: 'song' },
      song: {
        speaker: 'narrator', text: 'And under your ribs something starts to sing, clear and high, towards the palace on the hill. You are standing very still with your mouth open and a tray of figs in your hands.',
        choices: [
          { text: '(Hold the tray very, very still.)', to: 'tray' },
          { text: '(Look up at the palace.)', to: 'look' },
          { text: '[Guile] (Pretend the silence was your cue, and bow.)', to: 'bow', school: 'guile' },
        ],
      },
      tray: { speaker: 'narrator', text: 'Not one fig moves. The singing goes on, patient and bright, as if it has waited a very long time for you and can wait a little longer while you finish your shift.', next: 'notice' },
      look: { speaker: 'narrator', text: 'Every window of the palace on the hill is dark but one, high up, and the singing is coming from somewhere under it, the way warmth comes up through a floor.', next: 'notice' },
      bow: { speaker: 'narrator', text: 'You bow, deeply, to nobody. Two courtiers applaud on reflex. It buys you exactly one breath, and then the singing pulls at you again, towards the hill.', next: 'notice' },
      notice: { speaker: 'narrator', text: 'The masque starts laughing again all at once, too loudly. A lady in a peacock mask is staring at you. So is a page. So, worse, is a tall fool in a white mask at the barge rail, who does not laugh at all.', next: null },
    },
  },
  {
    id: 'dialogue:jester-fennick-masque', name: 'I-1 Fennick on the gangplank', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: FE, text: '(An old fool is lying flat across the gangplank where he has just fallen over, very loudly, into the figs. The whole masque is laughing at him.) Help me up. Slowly. Smile. Keep smiling. Nobody’s looking at you now.',
        choices: [
          { text: 'Fennick, something is singing in my chest.', to: 'sing' },
          { text: 'You did that on purpose.', to: 'purpose' },
        ],
      },
      purpose: { speaker: FE, mood: 'happy', text: 'I do everything on purpose. Except the knee. The knee was a surprise. Now, the singing.', next: 'sing' },
      sing: {
        speaker: FE, text: '(He brushes a fig off his collar.) I heard it. Not in my chest, in my bones, and my bones are old enough to remember the last time. That’s half of a Concord Stone, calling you from the palace. The Court half.',
        choices: [
          { text: 'What do I do?', to: 'do', trust: 1 },
          { text: 'You’re joking.', to: 'joke' },
        ],
      },
      joke: { speaker: FE, text: 'I am always joking. That doesn’t mean I’m not right. Fools are paid not to be right, which is why we usually are.', next: 'do' },
      do: { speaker: FE, text: 'Tonight? Smile, finish your figs, and walk me home. Slowly. The knee is still a surprise. We’ll talk in my attic, where nobody listens but the gulls, and the gulls never repeat anything.', next: null },
    },
  },
  // ---------- I-2 Fennick's Pawn Ticket
  {
    id: 'dialogue:jester-tuttle-ticket', name: 'I-2 Tuttle and the ticket', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:tuttle', text: '(He takes the ticket with tongs, holds it to his glass, and sniffs.) Pantaloon. Cap-bells, silver, one set, eleven years. Redeemable. In pearls.',
        choices: [
          { text: 'I have coin.', to: 'coin' },
          { text: 'Pearls? Since when?', to: 'when' },
        ],
      },
      coin: { speaker: 'npc:tuttle', text: 'Coin is a promise from the King. The King is not keeping his promises this year. Pearls are a promise from the sea, and the sea always pays.', next: 'when' },
      when: { speaker: 'npc:tuttle', text: 'Since last winter. Everybody wants them, and everybody sells them, and the ones who sell the most sit outside on the bollards afterwards and smile at nothing. (He nods at the window.) Bring me a purse of pearls. The Cutpurses on the Docks have plenty, if you can catch one.', next: null },
    },
  },
  {
    id: 'dialogue:jester-tuttle-redeem', name: 'I-2 paying Tuttle', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:tuttle', text: '(He counts the pearls through his glass, one by one, and his hand is not quite steady.) Cold, these. Always cold. Here. Bells. Tell Pantaloon he still owes me for the bag.',
        choices: [
          { text: '[Guile] (Read his ledger upside down while he wraps them.)', to: 'ledger', school: 'guile', effects: [{ setFlag: 'jester.tuttle_ledger', value: true }] },
          { text: 'Thank you, Mister Tuttle.', to: null },
        ],
      },
      ledger: { speaker: 'narrator', text: 'Thirty years of the Docks in a small cramped hand. You catch three names: Pantaloon, cap-bells; Pellam, wedding ring; and Gudgeon, slate settled, C. 1019, and again, slate settled, C. 1031.', next: null },
    },
  },
  {
    id: 'dialogue:jester-fennick-bells', name: 'I-2 Fennick gets his bells back', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: FE, mood: 'happy', text: '(He puts the cap on and shakes his head. The bells ring, a little flat.) There. Now I’m a fool again, and not just a man in a silly hat. You paid in pearls?',
        choices: [
          { text: 'The dockers who sell them sit and smile at nothing.', to: 'dockers' },
          { text: 'Tuttle says you owe him for the bag.', to: 'bag' },
        ],
      },
      bag: { speaker: FE, text: 'I owe everyone for everything. It’s how I stay popular. But the pearls.', next: 'dockers' },
      dockers: {
        speaker: FE, mood: 'sad', text: 'I know. Black tears, hardened on our shore, and the realm sells them like any other catch. You can sell your grief in Velvet Harbour now. Somebody will always buy it.',
        choices: [{ text: 'Who?', to: 'masks' }],
      },
      masks: { speaker: FE, text: 'One thing at a time. The Masquerade Quarter is losing its masks. Faces and all. People wake up bare and can’t remember who they were. Go and see. Follow the ribbons.', next: null },
    },
  },
  // ---------- I-3 The Phantom Theatre
  {
    id: 'dialogue:obj-mask-ribbon-3', name: 'I-3 the last ribbon', scope: 'party',
    entries: [{ when: stage('quest:jester-the-phantom-theatre', 'ribbons'), node: 'ribbon' }, { node: 'plain' }],
    nodes: {
      ribbon: { speaker: 'narrator', text: 'The last ribbon is caught on a nail under the boarded door of the Phantom Theatre. Through a crack in the boards you can see a stage, and masks hung all round it, and every one of them is turned towards you.', next: null },
      plain: { speaker: 'narrator', text: 'A loose nail by the Phantom Theatre door.', next: null },
    },
  },
  {
    id: 'dialogue:obj-phantom-mask-rack', name: 'I-3 the stolen masks', scope: 'party',
    entries: [{ when: stage('quest:jester-the-phantom-theatre', 'masks'), node: 'masks' }, { node: 'plain' }],
    nodes: {
      masks: {
        speaker: 'narrator', text: 'Backstage, a rack of stolen masks, hundreds of them, gold and feather and porcelain, every one weeping black pearls from its eyeholes. They roll across the boards like marbles. When you lift them down, they are only masks.',
        choices: [
          { text: '[Guile] Hang them back on the Quarter’s doors before dawn, so nobody wakes up bare.', to: 'doors', school: 'guile' },
          { text: 'Carry them out into the square.', to: 'square' },
        ],
      },
      doors: { speaker: 'narrator', text: 'You run the Quarter all night with an armful of masks, hanging each one on the door it came from. At dawn the Masquerade Quarter wakes up, puts its face on, and has no idea anything happened. That is the trick of it.', next: null },
      square: { speaker: 'narrator', text: 'You pile them in the fountain square. By noon the whole Quarter is there, trying them on, arguing, laughing, finding themselves. One woman bursts into tears and says she’d forgotten she was ever so beautiful.', next: null },
      plain: { speaker: 'narrator', text: 'An empty mask-rack backstage.', next: null },
    },
  },
  // ---------- I-4 The King's Fool
  {
    id: 'dialogue:jester-sorrow-indenture', name: 'I-4 Harlequin Sorrow on the Exchange', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: SO, text: '(A tall fool in a white mask and black-and-white diamonds is standing in the middle of the Exchange Floor, and the whole Floor has gone quiet for him.) There you are. The apprentice who unmasked the Phantom. Harlequin Sorrow, fool to His Majesty. How much is your indenture?',
        choices: [
          { text: 'Seven more years.', to: 'years' },
          { text: 'I’m not for sale.', to: 'sale' },
        ],
      },
      sale: { speaker: SO, text: 'Everyone in Tidecourt is for sale. It’s the law, more or less. But I’m not buying you. I’m buying the paper.', next: 'years' },
      years: {
        speaker: SO, text: '(A broker hands him your indenture. He signs for it without looking, holds it up so the whole Floor can see, and tears it in half.) There. You’re free. Fools should be free. Free fools are so much cheaper.',
        choices: [
          { text: 'Why?', to: 'why' },
          { text: '(Laugh.)', to: 'laugh' },
        ],
      },
      laugh: { speaker: SO, text: 'Good. Laugh. That’s what you’re for. (He does not laugh with you. He watches you laugh, carefully, the way a merchant watches a scale.)', next: 'cap' },
      why: { speaker: SO, text: 'Because the court has too few fools and too many debts. Because I liked what you did in the Quarter. Because it amuses me. Pick one.', next: 'cap' },
      cap: { speaker: SO, text: 'There’s a cap for you at court, whenever you want it. The Jubilee is coming, and His Majesty will need a fool to tell the jest. Walk up to the palace steps with me. The pages are expecting me, and they hate it when I’m late.', next: null },
    },
  },
  {
    id: 'dialogue:jester-fennick-sorrow', name: 'I-4 Fennick on Sorrow', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: FE, text: 'He tore it up? In front of the whole Floor? (He is quiet for a moment.) That’s Sorrow all over. Generous. Funny. Kind to the pages. And in thirty years I have never once seen him laugh.',
        choices: [
          { text: 'He watched me laugh like he was weighing it.', to: 'weigh' },
          { text: 'He offered me a cap at court.', to: 'cap' },
        ],
      },
      weigh: { speaker: FE, mood: 'afraid', text: 'Did he. Hm. Hm. (He does not fall over, which is how you know he is worried.) Be careful with him. He owns half the debts in this realm, and debts are just jokes nobody’s finished telling.', next: 'cap' },
      cap: { speaker: FE, text: 'And now the Jubilee. The King has bought back the Pawned Gate, the old fool, and declared every debt in Tidecourt forgiven by royal jest. Somebody has to tell the jest. It sounds as if it might be you.', next: null },
    },
  },
  // ---------- I-5 The Jubilee Jest (the faction choice; a party vote)
  {
    id: 'dialogue:jester-jubilee-jest', name: 'I-5 the Jubilee jest', scope: 'party',
    entries: [{ when: { not: { flag: 'jester.jest' } }, node: 'balcony' }, { node: 'after' }],
    nodes: {
      balcony: { speaker: 'narrator', text: 'Noon, on the Exchange balcony. Below you the whole Floor, and the whole Docks behind it, a sea of faces turned up. The Velvet King sits in a gilded chair at your shoulder, smiling. Sorrow stands behind him. Fennick is somewhere in the crowd, holding his breath.', next: 'king' },
      king: { speaker: SO, text: '(He presses a folded paper into your hand.) His Majesty’s jest. Read it as written. It will make them laugh, and the laughing is the forgiving. That’s how a Jubilee works.', next: 'vex' },
      vex: { speaker: 'npc:guildmaster-vex', text: '(A man in a dark coat at the balcony rail, not looking at you, murmurs.) Or tell them the truth, child. The King is broke. Say it in a way they’ll laugh at, and I’ll make it worth your while.', next: 'crowd' },
      crowd: {
        speaker: 'narrator', text: 'Below you are all of them: Mother Gudgeon with her arms folded, Augustin Drabb at a Counting House window, the dockers on the bollards smiling at nothing. Somewhere among them, Fennick.',
        choices: [
          { text: '(Look for Fennick in the crowd.)', to: 'fennick' },
          { text: '(Look at the King.)', to: 'king2' },
          { text: '[Guile] (Weigh the two papers in your hands.)', to: 'weigh', school: 'guile' },
        ],
      },
      fennick: { speaker: 'narrator', text: 'You find him at the back, by the fountain, a little apart. He does not wave. He taps his own chest twice, where a fool keeps his licence, and then pretends he was scratching.', next: 'choose' },
      king2: { speaker: 'narrator', text: 'The Velvet King is very old, very magnificent and very frightened. His crown is crusted with black pearls. He is smiling at his people the way a man smiles at his creditors.', next: 'choose' },
      weigh: { speaker: 'narrator', text: 'The King’s jest is on heavy gilded paper. Vex’s is on the back of a betting slip. The heavy one is lighter. You have been on the Exchange long enough to know what that means.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'The crowd is waiting. The King is waiting. You clear your throat.',
        choices: [
          { text: '(Read the King’s jest.) “His Majesty forgives every debt in Tidecourt, for how could anyone owe a King who owes so much to his people’s love?”', to: 'kingjest', quest: true, trustNpc: FE, trust: -1, effects: [{ setFlag: 'jester.jest', value: 'king' }] },
          { text: '(Tell the Exchange’s jest.) “His Majesty forgives every debt in Tidecourt. Mostly his own.”', to: 'exchange', quest: true, effects: [{ setFlag: 'jester.jest', value: 'exchange' }] },
          { text: '(Turn to the King and use the Fool’s Licence.) “Majesty, you can’t forgive a debt on a gate you never owned. It was never yours to pawn. It was everybody’s.”', to: 'licence', quest: true, insight: 'licence_used', when: { insight: 'fools_licence' }, effects: [{ setFlag: 'jester.jest', value: 'licence' }] },
        ],
      },
      kingjest: { speaker: 'narrator', text: 'The harbour laughs, on cue, because a paid claque in the gallery laughs first. The Jubilee holds. Nobody’s debts go anywhere at all. Somewhere in the crowd, Fennick turns away.', next: null },
      exchange: { speaker: 'narrator', text: 'One beat of silence, then the whole Floor roars, and then the whole Floor panics. Brokers run for the doors. By sunset Guildmaster Vex has bought half the realm’s debts for pennies, and he tips his hat to you as he leaves.', next: null },
      licence: {
        speaker: 'narrator', text: 'The King stares at you. Then he begins to laugh, a real laugh, helpless, an old man’s laugh, and he laughs until he cries, and the tears on his face are clear, not black. The crowd does not know what to do. Behind the King’s chair, Sorrow has gone very still.',
        next: null,
      },
      after: { speaker: SO, text: 'The jest is told. Debts, I’m afraid, are not so easily amused.', next: null },
    },
  },
  // ---------- I-6 The Counting House
  {
    id: 'dialogue:jester-auditor-wakes', name: 'I-6 the Auditor wakes', scope: 'party',
    entries: [
      { when: { flag: 'jester.jest', value: 'exchange' }, node: 'exchange' },
      { when: { flag: 'jester.jest', value: 'licence' }, node: 'licence' },
      { node: 'king' },
    ],
    nodes: {
      king: { speaker: 'narrator', text: 'The Jubilee forgave every debt in Tidecourt with a joke. The Counting House did not find it funny. In the treasury, something enormous made of ledgers and brass sits up and opens a book.', next: 'auditor' },
      exchange: { speaker: 'narrator', text: 'Vex bought half the realm’s debts by sunset, and the Counting House woke to collect the other half before he could. In the treasury, something enormous made of ledgers and brass sits up and opens a book.', next: 'auditor' },
      licence: { speaker: 'narrator', text: 'The King laughed, and the gate’s debt was laughed away, and the Counting House woke to find its biggest account gone. In the treasury, something enormous made of ledgers and brass sits up, outraged, and opens a book.', next: 'auditor' },
      auditor: { speaker: 'narrator', text: 'Its ink runs pearl-black. In a voice like a till drawer, it reads your name, and your debts, and the interest on them, which is considerable.', next: null },
    },
  },
  {
    id: 'dialogue:obj-sorrow-pearl-jar', name: 'I-6 the jars in the strongroom', scope: 'party',
    entries: [{ when: stage('quest:jester-the-counting-house', 'jar'), node: 'jars' }, { node: 'plain' }],
    nodes: {
      jars: { speaker: 'narrator', text: 'Thousands of jars, floor to ceiling, each with a single black pearl in it and a neat paper label: “One sorrow, received with thanks. H.S.” The writing is the same on every one. Some of the jars are very old.', next: 'seven' },
      seven: {
        speaker: 'narrator', text: 'On the lowest shelf, at the very back, one jar is older than all the rest, its label brown with age. The pearl inside is no bigger than a lentil. The label says: “H. Sorrow, aged seven.”',
        choices: [
          { text: '(Take it. Keep it safe.)', to: 'keep' },
          { text: '[Guile] (Pocket it, and leave an empty jar in its place so nobody notices.)', to: 'swap', school: 'guile' },
        ],
      },
      keep: { speaker: 'narrator', text: 'You wrap it in your handkerchief. It is very light, and very cold, and it seems to be the only thing in the whole strongroom that anybody ever forgot to sell.', next: null },
      swap: { speaker: 'narrator', text: 'One empty jar, one neat label, one pearl in your pocket. Nobody will notice. Nobody has looked at that shelf in years.', next: null },
      plain: { speaker: 'narrator', text: 'Shelves of jars, and one gap at the back of the lowest shelf.', next: null },
    },
  },
  // ---------- I-7 Sorrow's Laughing Shop
  {
    id: 'dialogue:jester-sorrow-shop', name: 'I-7 the Laughing Shop', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: SO, text: '(Behind the counter, in his white mask, a jeweller’s scale at his elbow. A woman in front of you weeps into a cup, and he takes the cup, and gives her a slip of paper, and she leaves laughing.) Ah. Come in. You found the jars. I wondered when you would.',
        choices: [
          { text: 'You buy people’s grief.', to: 'buy' },
          { text: 'What did you give her?', to: 'give' },
        ],
      },
      give: { speaker: SO, text: 'Laughter. On credit. She’ll laugh for a month, and then she’ll come back, and we’ll do business again. Everyone comes back.', next: 'buy' },
      buy: {
        speaker: SO, text: 'I buy it, and they weep it into a pearl, and I pay them in laughter, and nobody has to carry it any more. The Court half of the stone is under the King’s cushion. Set it in my bauble and I’ll have a joke that never fails. Nobody in Tidecourt will ever have to cry again.',
        choices: [
          { text: 'You’ve never once laughed at your own jokes.', to: 'never', insight: 'sorrow_never_laughs', when: { any: [{ questCompleted: 'quest:jester-the-lamplighters-wife' }, { questCompleted: 'quest:jester-the-worst-joke-in-tidecourt' }, { insight: 'licence_used' }, { flag: 'jester.sorrow_watched' }, { flag: 'jester.queue_heard' }] } },
          { text: '[Guile] Your sleeves clink when you move.', to: 'sleeves', school: 'guile', insight: 'sorrow_sleeves' },
          { text: 'And where does all the grief go?', to: 'where' },
        ],
      },
      never: { speaker: SO, mood: 'sad', text: '(A long pause.) A merchant doesn’t eat his own stock. (Then, lightly.) You’re funny. You should be careful. Funny is very valuable here.', next: 'where' },
      sleeves: { speaker: SO, text: '(He folds his hands, very slowly, so that they don’t.) Loose change. Good afternoon.', next: 'where' },
      where: { speaker: SO, text: 'Into jars. Into me. Somewhere it can’t hurt anybody. (He bows.) Come to court on Jubilee night. Bring a joke. I’ll bring the laughter.', next: null },
    },
  },
  {
    id: 'dialogue:jester-fennick-shop', name: 'I-7 Fennick on the Laughing Shop', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: FE, mood: 'sad', text: 'A joke that never fails. (He sits down on a cushion, carefully, and does not fall off it.) That’s the oldest dream a fool has, and the worst. A joke that never fails isn’t a joke. It’s a sentence.',
        choices: [
          { text: 'I found a jar labelled “H. Sorrow, aged seven”.', to: 'seven' },
          { text: 'He’ll take the half-stone on Jubilee night.', to: 'night' },
        ],
      },
      seven: { speaker: FE, text: 'Seven. (He takes the jar and holds it up to the light, and gives it back.) Keep that. Keep that very safe. I don’t know what it will be good for, but I know it will be good for something.', next: 'night' },
      night: { speaker: FE, text: 'Then you go to court on Jubilee night, and you take it first. And you make them laugh, properly, off his cue. A claque laughs on cue. People laugh when it’s funny. He’s forgotten the difference. Don’t you.', next: null },
    },
  },
  // ---------- I-8 The Velvet Court
  {
    id: 'dialogue:obj-guile-capital-halfstone', name: 'I-8 the Court half', scope: 'party',
    entries: [{ when: stage('quest:jester-the-velvet-court', 'stone'), node: 'claim' }, { node: 'cushion' }],
    nodes: {
      claim: { speaker: 'narrator', text: 'Under the cushion of the empty throne, wrapped in a pawn ticket thirty years old, lies half a crystal, cracked clean across, singing. It sounds, faintly, like someone trying not to laugh in church.', next: 'claque' },
      claque: {
        speaker: 'narrator', text: 'Up in the gallery the paid claque is still laughing, on cue, at nothing, because nobody has told them to stop. The empty throne room rings with it.',
        choices: [
          { text: '(Laugh with them, once, for real.)', to: 'real' },
          { text: '[Guile] (Give them the cue: raise one hand, and stop them dead.)', to: 'cue', school: 'guile' },
        ],
      },
      real: { speaker: 'narrator', text: 'You laugh, alone, at the sheer nonsense of it: a hundred people paid to be merry in an empty room. One by one the claque stop and look at you, and then they are laughing too, properly, off cue, and it sounds completely different.', next: 'sorrow' },
      cue: { speaker: 'narrator', text: 'You raise one hand the way Sorrow does. The claque stops mid-laugh, a hundred mouths open. In the silence the Court half sings, very clearly, and every soul in the gallery hears it.', next: 'sorrow' },
      sorrow: {
        speaker: SO, text: '(From the King’s private tunnel, already half gone, a bow you can hear.) Encore. I’ll see you at the Pawned Gate. Everyone has to pay the toll.',
        choices: [
          { text: 'You never laughed, Sorrow. Not once, in all those years.', to: 'never', when: { any: [{ flag: 'jester.queue_heard' }, { insight: 'sorrow_never_laughs' }] } },
          { text: 'I have your jar. “H. Sorrow, aged seven.”', to: 'jar', when: { flag: 'jester.pearl_jar' } },
          { text: '(Let him go.)', to: null },
        ],
      },
      never: { speaker: SO, mood: 'sad', text: '(A pause, somewhere in the dark of the tunnel.) It isn’t mine to spend. Everything I have belongs to somebody else. (Quieter.) Encore.', next: null },
      jar: { speaker: SO, text: '(Silence. Then, very lightly.) Keep it. I don’t remember what’s in it. That was rather the point.', next: null },
      cushion: { speaker: 'narrator', text: 'The throne’s velvet cushion, a little flatter than it was.', next: null },
    },
  },
  // ---------- I-9 Exit, Pursued by a Fool (mentor farewell; trust check)
  {
    id: 'dialogue:jester-fennick-farewell', name: 'I-9 Fennick’s farewell', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: FE, text: '(He walks you to the first milestone on the toll road, with a bag of cushions over his shoulder, and falls over at it, magnificently.) Ow. There. Now it’s a proper goodbye.',
        choices: [
          { text: 'Come with me.', to: 'stay' },
          { text: 'You taught me to fall over. Thank you.', to: 'first', trust: 1 },
        ],
      },
      stay: { speaker: FE, text: 'To the Pawned Gate? At my age? I’d fall over every hundred yards and we’d never get there. No. Somebody has to stay and keep the Docks honest, or at least funny.', next: 'first' },
      first: {
        speaker: FE, text: 'Do you know why I taught you to fall before I taught you to juggle? Because a crowd is always waiting for you to fall. Once you have, they relax. Then you can tell them anything.',
        choices: [
          { text: 'Even the truth?', to: 'truth' },
          { text: '[Guile] So the fall is the set-up.', to: 'setup', school: 'guile' },
        ],
      },
      truth: { speaker: FE, text: 'Especially the truth. The truth is the punchline nobody sees coming, because they’re still laughing at the fall.', next: 'warn' },
      setup: { speaker: FE, mood: 'happy', text: 'The fall is the set-up, the joke is the delivery, and the truth is what they find in their pockets on the way home. You’ll be all right.', next: 'warn' },
      warn: { speaker: FE, text: 'At the gate the King will try to sell you something. Don’t buy it. Make him laugh instead. A man who’s laughing can’t haggle.', next: 'gifts' },
      gifts: {
        speaker: FE, text: 'I’ve something for you. Don’t laugh. Well, do laugh. That’s the point of it.',
        choices: [
          { text: '(Take what he holds out.)', to: 'marotte', when: { trust: FE, value: 'friendly' } },
          { text: '(Help him up instead.)', to: 'hand', when: { not: { trust: FE, value: 'friendly' } } },
        ],
      },
      marotte: { speaker: FE, mood: 'happy', text: 'Little Fennick. My marotte, birchwood, carved with my own face, forty years ago. He heckles. Mostly me. Hold him up when you’re frightened, and he’ll say something rude, and you won’t be.', effects: [{ giveItem: 'w_little_fennick' }, { setFlag: 'jester.little_fennick', value: true }, { setFlag: 'jester.fennick_farewell', value: true }], next: 'pratfall' },
      pratfall: {
        speaker: FE, text: '(He looks up and down the empty road, very seriously.) And one more thing. The Pantaloon Pratfall. I swore I’d take it to my grave. I’m getting close enough to the grave that I can see it’s overrated.',
        choices: [
          { text: 'Teach me.', to: 'teach', when: { trust: FE, value: 'trusted' }, effects: [{ setFlag: 'jester.pratfall', value: true }] },
          { text: 'Keep it, Fennick. It’s yours.', to: 'end' },
        ],
      },
      teach: { speaker: FE, mood: 'happy', text: '(He shows you. It takes four minutes, two bruises and a great deal of laughing. It looks like an accident. It is not an accident. Nothing ever lands where it was aimed again.) There. Now it’s yours. Don’t waste it on anybody who deserves it.', next: 'end' },
      hand: { speaker: FE, text: 'Mind the toll road. Mind the King. Mind Sorrow. And when it’s all too much, fall over. It’s amazing how much it helps.', effects: [{ setFlag: 'jester.fennick_farewell', value: true }], next: null },
      end: { speaker: FE, text: 'Go on, then. Exit, pursued by a fool. That’s me, by the way. I’ll be pursuing you in spirit. My knees won’t manage the rest.', next: null },
    },
  },
];

export default dialogues;
