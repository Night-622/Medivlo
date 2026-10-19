/**
 * Hollow Crown, BRAWLER Act I depth pass (10-campaign-style.md §8, docs/PACING.md): the new stages' scenes,
 * investigation clues, travel banter, optional finds and the third parts of the side quests. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const offer = (q: Q, text: string, to: string): DialogueChoice => ({ text, to, quest: true, when: fresh(q), effects: [{ startQuest: q }] });
/** a stage scene that takes over an NPC's talk must still let them give their own quests */
const more = (...offers: DialogueChoice[]): DialogueChoice[] => [...offers, { text: 'Thanks.', to: null }];
const TK = 'npc:tobiah-knuckle' as const, SL = 'npc:saffie-lint' as const, AT = 'npc:abigail-tuck' as const;
const PURSE: Q = 'quest:brawler-whose-purse';
const MT = 'npc:moll-treadwell' as const, TI = 'npc:tilly-concordia' as const;
const BC1: Q = 'quest:brawler-the-cellar-ring', BC5: Q = 'quest:brawler-ashmaw';
const STOCKQ: Q = 'quest:brawler-pops-stock', NAMESQ: Q = 'quest:brawler-calling-the-names';

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
/** a one-node find (optional areas) that unlocks a codex entry */
const find = (id: string, name: string, text: string, lore: `lore:${string}`): DialogueDef => ({
  id: `dialogue:obj-${id}`, name, scope: 'party',
  entries: [{ node: 'find' }],
  nodes: { find: { speaker: 'narrator', text, effects: [{ unlockLore: lore }], next: null } },
});

const dialogues: DialogueDef[] = [
  // ======================= I-1 The Bell in Round Three: pushing the cart home, the midnight bowl
  {
    id: 'dialogue:area-brawler-cart-home', name: 'I-1 banter: pushing the cart home', bark: true,
    entries: [{ when: stage('quest:brawler-the-bell-in-round-three', 'cart'), node: 'b' }],
    nodes: { b: { speaker: TK, text: '(Pushing his side, puffing.) Turned for your corner. In round three. For a bell. (Squeak.) I’ve seen fighters go down for a lot of things. Never for a bell. (Squeak.) Push harder, you’re young.', next: null } },
  },
  {
    id: 'dialogue:brawler-pops-midnight', name: 'I-1 the midnight bowl', scope: 'party',
    entries: [{ node: 'alley' }],
    nodes: {
      alley: { speaker: 'narrator', text: 'Pops’s noodle cart, parked for the night in the alley behind the Knuckletown ring, under a lantern. The stock-pot is still simmering on its little stove, as it has every night since C. 1003. He ladles two bowls, number nine, the beef, and sits on an upturned bucket.', next: 'eat' },
      eat: { speaker: TK, text: 'Eat. Don’t talk. Talking with your mouth full is how fighters lose teeth. (He watches you eat for a while.) Now talk. The singing. Still going?', next: 'sing' },
      sing: {
        speaker: TK, text: 'Tell me what it sounds like. Not what you think it is. What it sounds like.',
        choices: [
          { text: 'Like a crowd, very far off. Chanting my name to get up.', to: 'crowd', trust: 1 },
          { text: 'Like a bell. Over and over. Round after round.', to: 'bell' },
          { text: '[Fist] (Put your fist on the counter. Let him feel it hum through the wood.)', to: 'fist', school: 'fist' },
        ],
      },
      crowd: { speaker: TK, mood: 'sad', text: '(He goes very still.) That’s it. That’s exactly it. I heard that once, round six, flat on my back in the Grand Pit with Doran Kell standing over me. Four thousand people. And under them, something else. Get up, it said.', next: 'kell' },
      bell: { speaker: TK, text: 'A bell. Course it is. The round bell is the only bell anybody in the Lowfold listens to. Something up there knows how to talk to us. (He stirs the pot.) I heard it once, myself. Long time ago. Flat on my back.', next: 'kell' },
      fist: { speaker: 'narrator', text: 'The counter hums. The bowls ring. The stock-pot gives a little bubble, and Pops looks at it as if it had said something rude. Then he puts his own old fist beside yours, all knuckles and scars, and leaves it there.', next: 'kell' },
      kell: {
        speaker: TK, text: 'That’s the Fist stone. Or half of it. It fell somewhere in the Lowfold when the crown broke. The monks up the mountain have the other half and never stop telling us. Ours never sang for anybody. Not even me.',
        choices: [
          { text: 'Where is it?', to: 'where' },
          { text: 'You wanted it to sing for you.', to: 'wanted' },
        ],
      },
      where: { speaker: TK, text: 'Down, I should think. Everything in the Lowfold ends up down. The quarries, the outlaw rings, the cheap seats. Don’t go looking yet. You’ve a farmer to apologise to and a town that owes me money.', next: 'deal' },
      wanted: { speaker: TK, mood: 'sad', text: 'Every fighter in the Lowfold wanted it to sing for them, kid. That’s why it didn’t. (He takes your empty bowl.) You never wanted anything in your life except to get up. Maybe that’s the trick.', next: 'deal' },
      deal: {
        speaker: TK, text: 'Right. Here’s the deal. One bowl of noodles a week, and I corner you. Not for the stone. Not for the purse. Because you got up. Do we shake?',
        choices: [
          { text: '(Shake his hand.)', to: 'shake' },
          { text: 'Two bowls a week.', to: 'two' },
        ],
      },
      shake: { speaker: TK, mood: 'happy', text: 'Good. That’s binding in the Lowfold, a handshake over noodles. Worse than a contract. Tomorrow you deliver my noodles round Knuckletown and collect on my little book. Don’t lose the book. The book is my pension.', next: null },
      two: { speaker: TK, mood: 'happy', text: 'Two! (He laughs until he coughs.) You’re a terrible negotiator. One and a half. Shake. Tomorrow you deliver my noodles round Knuckletown and collect on my little book. Don’t lose the book.', next: null },
    },
  },

  // ======================= I-2 Noodles and Debts: the three locked doors
  clue('brawler-door-clue-1', 'I-2 a locked door (1)', stage('quest:brawler-noodles-and-debts', 'look'),
    'Under the first door, along with the black, a fight-bill: a quarry ring, no name, three nights ago. Somebody has written across it in pencil: “LOST. NOBODY CAME.” The fighter who lives here lost, and was not collected by his corner.', 'brawler.door_1',
    'A locked door in Knuckletown, the step scrubbed.'),
  clue('brawler-door-clue-2', 'I-2 a locked door (2)', stage('quest:brawler-noodles-and-debts', 'look'),
    'The second door has a little clay token wedged in its letter-slot, the kind dojos give their students. It is stamped with a fist with two fingers bent the wrong way. The Broken Fist.', 'brawler.dojo_token',
    'A locked door with an empty letter-slot.'),
  clue('brawler-door-clue-3', 'I-2 a locked door (3)', stage('quest:brawler-noodles-and-debts', 'look'),
    'Through the window of the third, you can see the fighter who lives there: sitting at his own table, perfectly still, hands folded, looking at the door. He does not hear you knock. He is waiting to be told what to do.', 'brawler.door_3',
    'A shuttered window.', 'Pops will want to hear this. Pops will not want to hear this.'),

  // ======================= I-4 The Promoter’s Offer: the crowd at the Grand Pit
  ...[
    'A knot of young fighters by the Grand Pit gate, all holding tickets for Silas’s bouts, all talking at once. “He paid my mam’s rent.” “He paid my doctor.” “He paid for my brother’s funeral.” Nobody says what they paid back.',
    'An old woman selling hot chestnuts, who will not look at the gate. Her son signed with Silas last spring. “Paid in advance,” she says. “Lovely purse. He sends his regards, Mr Gaunt does. Every week. My boy doesn’t.”',
    'A poster on the Grand Pit wall: SILAS GAUNT PRESENTS. Under it, a hundred names have been chalked up and crossed off, one by one, the way a promoter keeps a card. The crossings are very neat.',
  ].map((text, i): DialogueDef => clue(`brawler-pit-talk-${i + 1}`, `I-4 the crowd at the Grand Pit (${i + 1})`, stage('quest:brawler-the-promoters-offer', 'crowd'),
    text, `brawler.pit_talk_${i + 1}`, 'The crowd at the Grand Pit gate, thinning out.')),

  // ======================= I-5 Whose Purse: the cutwoman and the bookie, and dawn at the Grand Pit
  {
    id: 'dialogue:brawler-doc-canvass', name: 'I-5 Doc Lint on what a purse costs', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: SL, text: 'What does a purse cost? (She holds up a needle.) This many stitches, usually. I’ve stitched for the League and I’ve stitched for the outlaw rings, and I’ll tell you the difference. In the League they pay me. In the rings they don’t let me in.', next: 'cost' },
      cost: {
        speaker: SL, text: 'The League wants a champion. The Climbers want the rings shut. Silas wants you sold. Nobody’s asked what the fighter wants. Fighters never get asked. They get stitched.',
        choices: [
          { text: 'What would you have me do?', to: 'do' },
          { text: 'You never stop working, do you?', to: 'work', trust: 1, trustNpc: SL },
        ],
      },
      do: { speaker: SL, text: 'Fight for whoever gets you out of my tent quickest. That’s my professional opinion. My other opinion is: fight for somebody who’ll still be in your corner when you lose.', choices: more(offer('quest:brawler-doc-lints-thread', 'You said you’re out of silk.', 'silk')) },
      work: { speaker: SL, mood: 'happy', text: 'I stopped once. In C. 1020. For an afternoon. Somebody bled. (She threads the needle without looking.) That’s my rule. Nobody bleeds in my corner for longer than they have to.', choices: more(offer('quest:brawler-doc-lints-thread', 'You said you’re out of silk.', 'silk')) },
      silk: { speaker: SL, text: 'The only silk in the valley is in the saddlebags of a smuggler’s goat, which has gone to eat the Grand Pit’s posters. Fetch it. Ask the goat nicely.', next: null },
    },
  },
  {
    id: 'dialogue:brawler-abigail-canvass', name: 'I-5 Abigail on what a purse costs', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: AT, text: 'What does a purse cost? Forty years on a book, love, I can give you the odds on anything. (She licks her pencil.) League purse: honest, small, slow. Climbers: no purse, plenty of prayers. Silas: big, early and wet.', next: 'wet' },
      wet: {
        speaker: AT, text: 'Wet. Yes. Every coin he pays out comes back to my stall damp, in somebody’s winnings. I dry them on the stove. They don’t dry. I’ve a whole tin of them I won’t spend.',
        choices: [
          { text: 'Which would you back?', to: 'back' },
          { text: 'Why have you never bet against a local?', to: 'local', trust: 1, trustNpc: AT },
        ],
      },
      back: { speaker: AT, text: 'I don’t back purses. I back fighters. Always have. If you want my odds on you, love, they’re good, whichever purse. Your odds on getting up are the best in the Lowfold.', choices: more(offer('quest:brawler-honest-abigails-book', 'Put me on your book.', 'book')) },
      local: { speaker: AT, mood: 'sad', text: 'My husband was a local. I bet against him once, as a joke, the night he lost his last bout. I won four coppers. (She looks at her pencil.) I’ve still got them. Never again.', choices: more(offer('quest:brawler-honest-abigails-book', 'Put me on your book.', 'book')) },
      book: { speaker: AT, text: 'Three bouts, three village rings. If you win all three my book stays open, and his runners go home with empty pockets. If you lose I am going to be extremely honest about it.', next: null },
    },
  },
  {
    id: 'dialogue:obj-brawler-purse-dawn', name: 'I-5 dawn at the Grand Pit gate', scope: 'party',
    entries: [
      { when: { all: [stage(PURSE, 'dawn'), { flag: 'brawler.purse', value: 'climbers' }] }, node: 'climbers' },
      { when: { all: [stage(PURSE, 'dawn'), { flag: 'brawler.purse', value: 'names' }] }, node: 'names' },
      { when: stage(PURSE, 'dawn'), node: 'league' },
      { node: 'plain' },
    ],
    nodes: {
      league: { speaker: 'narrator', text: 'Dawn at the Grand Pit gate. The League’s bill is already up, in red and gold: TITLE BOUT. BIG MOTHER OX AGAINST THE KNUCKLETOWN BRAWLER. CORNER: T. KNUCKLE. Somebody has added under his name, in chalk: “THE ONE WHO KNOCKED DOWN KELL.”', next: 'league2' },
      league2: { speaker: 'narrator', text: 'Across the square, a man in a silk scarf is reading the bill. He reads it twice. Then he takes out a little book and writes something in it, and smiles at the corner stool’s name, and goes away.', effects: [{ setFlag: 'brawler.dawn_seen', value: 'league' }], next: null },
      climbers: { speaker: 'narrator', text: 'Dawn at the Grand Pit gate, and it is shut, and the Climbers are sitting in front of it in rows, in grey, very still. Overnight they have closed two outlaw rings. Seven sold fighters are sitting among them, blinking, wrapped in Climbers’ blankets.', next: 'climbers2' },
      climbers2: { speaker: 'narrator', text: 'One of the freed fighters sees you, and lifts a hand. He does not know your name. Neither of you minds. Behind him, Pops’s cart is not at its usual corner this morning.', effects: [{ setFlag: 'brawler.dawn_seen', value: 'climbers' }], next: null },
      names: { speaker: 'narrator', text: 'Dawn at the Grand Pit gate. There is a bill up for the title bout, and it has no purse on it at all. Instead, in your handwriting, there is a list of names: every fighter you know of who went into the outlaw rings and did not come back.', next: 'names2' },
      names2: { speaker: 'narrator', text: 'All morning, people stop and read it. Some of them take out a pencil and add a name. By noon there are forty more. Somewhere a man in a silk scarf has bought a front-row seat.', effects: [{ setFlag: 'brawler.dawn_seen', value: 'names' }], next: null },
      plain: { speaker: 'narrator', text: 'The Grand Pit gate, plastered with bills.', next: null },
    },
  },

  // ======================= I-7 Sold by the Head: the missing fighters’ trail, and telling Pops
  clue('brawler-fighter-trail-1', 'I-7 the missing fighters’ trail (1)', stage('quest:brawler-sold-by-the-head', 'trail'),
    'A hand-wrap, dropped on the quarry steps, still knotted the Knuckletown way. Somebody wrapped this for a fighter who was proud of it. The end of it has been cut, cleanly, with a knife.', 'brawler.trail_1',
    'Worn quarry steps going down.'),
  clue('brawler-fighter-trail-2', 'I-7 the missing fighters’ trail (2)', stage('quest:brawler-sold-by-the-head', 'trail'),
    'A glove on a ledge, with a name stitched inside the cuff by a mother: HAL BRUNT. Under it, on the rock, a tally in chalk, the kind a ringmaster keeps: one stroke for every fighter brought down this way. You stop counting at a hundred.', 'brawler.trail_2',
    'A ledge in the quarry wall.'),
  clue('brawler-fighter-trail-3', 'I-7 the missing fighters’ trail (3)', stage('quest:brawler-sold-by-the-head', 'trail'),
    'At the bottom of the steps, a ticket, torn in half, the kind Silas gives his fighters for their first bout. On the back, in neat clerk’s writing, where a seat number should be: “SOLD. ONE HEAD. PAID WET.”', 'brawler.trail_sold',
    'The bottom of the quarry steps.', 'Further down, where the quarry runs under the mountain, the rock is weeping black.'),
  {
    id: 'dialogue:brawler-pops-silas', name: 'I-7 telling Pops about Silas', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: TK, text: '(He has put the shutters up on the cart in the middle of the afternoon, which he has never done. He is sitting on his bucket, not cooking.) Doc Lint came by. Said you’d gone down the quarry. Said I’d want to sit down. I’m sitting.', next: 'tell' },
      tell: {
        speaker: 'narrator', text: 'You tell him: the tunnel, the ledger, the heads, the Hollow Legion, the wet coin. Pops listens with his hands flat on his knees and does not move once.',
        choices: [
          { text: 'He said a very good teacher taught him nobody fights for you.', to: 'teacher' },
          { text: 'There was a ticket at the bottom of the steps. “Sold. One head. Paid wet.”', to: 'ticket', when: { flag: 'brawler.trail_sold' } },
        ],
      },
      ticket: { speaker: TK, mood: 'angry', text: 'One head. (He takes the ticket from you and turns it over, and over.) He writes them down. He always wrote everything down, that boy. Kept a book of his bouts at sixteen, neater than mine. I used to laugh at him for it.', next: 'teacher' },
      teacher: {
        speaker: TK, mood: 'sad', text: 'Sixteen. Juniors final. His eye was going, and he wouldn’t go down, so I threw in the towel. Only time in forty years. Next morning his promoter sold his contract because he’d lost, and nobody stood up for him. Not even me. I was ashamed I’d thrown it.',
        choices: [
          { text: 'You saved his eye, Pops.', to: 'eye', trust: 1 },
          { text: 'So he decided nobody would ever fight for anyone.', to: 'nobody' },
        ],
      },
      eye: { speaker: TK, text: 'I saved his eye and lost him the rest of him. That’s a bad trade, kid, by Lowfold arithmetic. (He wipes his face with the corner towel round his neck.) I should have gone after him with the towel still in my hand.', next: 'go' },
      nobody: { speaker: TK, text: 'And then he made a business of it. Course he did. He was always good with a ledger. (He stands up, knees cracking.) Well. I taught him that. Somebody should teach him the other thing.', next: 'go' },
      go: { speaker: TK, text: 'Go down and take the stone off his chair. Push his fighters out of the ring, don’t knock them down, they’re the ones you’re there for. And if he ends up on the canvas, kid, you don’t walk away. You hold out your hand.', next: null },
    },
  },

  // ======================= I-9 In Your Corner: the Last Corner (codex find)
  {
    id: 'dialogue:obj-brawler-last-corner', name: 'I-9 the Last Corner', scope: 'party',
    entries: [{ when: stage('quest:brawler-in-your-corner', 'corner'), node: 'bench' }, { node: 'plain' }],
    nodes: {
      bench: { speaker: 'narrator', text: 'Halfway up the Stair Gate road, a stone bench worn into two hollows, one for a fighter, one for a cornerman. The Lowfold’s champions sat here to have their hands wrapped before they went up to fight at the Turning, in Concordia. The stone is carved with their names, and their cornermen’s.', next: 'names' },
      names: { speaker: 'narrator', text: 'The last pair of names is dated C. 1000. Pops parks his cart, sits down in the cornerman’s hollow as if it had been kept for him, and takes a roll of wraps out of his apron. He holds out his hand for yours.', next: 'wrap' },
      wrap: {
        speaker: 'narrator', text: 'He wraps them the old way: over the knuckles, round the wrist, a twist between every finger, slow, the way you would tie a child’s shoe.',
        choices: [
          { text: '(Hold still and let him wrap them.)', to: 'still', effects: [{ unlockLore: 'lore:hc-brawler-last-corner' }] },
          { text: '(Carve your name, and his, under the last pair.)', to: 'carve', effects: [{ unlockLore: 'lore:hc-brawler-last-corner' }] },
        ],
      },
      still: { speaker: 'narrator', text: 'When he has finished he taps each knuckle once, the way cornermen do, for luck. “There,” he says. “Now you’re going up properly.” His hands are shaking, a little. Yours are not.', next: null },
      carve: { speaker: 'narrator', text: 'You cut them with the point of his ladle, because it is the only thing to hand: your name, and under it, CORNER: T. KNUCKLE. He looks at it a long time. “Spelt it right,” he says. “Nobody spells it right.” He does not say anything else.', next: null },
      plain: { speaker: 'narrator', text: 'The Last Corner, a stone bench on the gate road, carved with fighters and their cornermen.', next: null },
    },
  },
  {
    id: 'dialogue:area-brawler-gate-road', name: 'I-9 banter: up the gate road', bark: true,
    entries: [{ when: stage('quest:brawler-in-your-corner', 'road'), node: 'b' }],
    nodes: { b: { speaker: TK, text: '(Behind you, pushing the cart uphill, squeak, squeak.) Don’t look back. I’m fine. Squeak. I’m not out of breath. I’m breathing on purpose. Squeak. Keep going, champ.', next: null } },
  },

  // ======================= Side: Honest Abigail’s Book (the runners’ board)
  {
    id: 'dialogue:obj-brawler-runner-booth', name: 'Honest Abigail’s Book: the runners’ board', scope: 'party',
    entries: [{ when: stage('quest:brawler-honest-abigails-book', 'runners'), node: 'booth' }, { node: 'plain' }],
    nodes: {
      booth: { speaker: 'narrator', text: 'Silas’s runners’ booth across the square: a striped awning, a board of odds and two young men in silk scarves like their master’s, counting coins that will not dry. You pin Abigail’s card in the middle of their board. It says, in letters a hand high: “LOCALS. ALWAYS.”', next: 'runners' },
      runners: {
        speaker: 'narrator', text: 'The runners read it. One of them laughs. The other one does not. He is looking at the wet coins in his hands, and then across the square at Abigail’s stall, where people are queuing.',
        choices: [
          { text: '“She dries her coin on the stove. Yours never dry. Think about it.”', to: 'think', effects: [{ setFlag: 'brawler.runners', value: 'think' }] },
          { text: '(Say nothing. Walk back to Abigail’s queue and join it.)', to: 'queue', effects: [{ setFlag: 'brawler.runners', value: 'queue' }] },
        ],
      },
      think: { speaker: 'narrator', text: 'The quiet one puts his coins down on the counter, one by one, very carefully, the way you put down something that might go off. By the evening his scarf is gone and he is standing behind Abigail’s stall, learning to keep a book honestly.', next: null },
      queue: { speaker: 'narrator', text: 'You join the queue. After a while, so does the quiet runner, without his scarf, holding a single copper he has dried on his sleeve. Abigail takes his bet on a local without blinking.', next: null },
      plain: { speaker: 'narrator', text: 'The runners’ booth. A card on its board reads LOCALS. ALWAYS.', next: null },
    },
  },

  // ======================= Side: the Bunting Committee (the old bunting)
  {
    id: 'dialogue:obj-brawler-old-bunting', name: 'The Bunting Committee: the championship bunting', scope: 'party',
    entries: [{ when: stage('quest:brawler-the-bunting-committee', 'attic'), node: 'attic' }, { node: 'plain' }],
    nodes: {
      attic: { speaker: 'narrator', text: 'The Crouch attic, under the eaves, smelling of lavender and old rope. In a trunk, in tissue, a string of bunting: red, yellow, red, yellow, faded soft as petals, and sewn on every flag, in tiny stitches, the same two letters: T. K.', next: 'hang' },
      hang: {
        speaker: 'narrator', text: 'Pinned to the tissue is a note in three different hands: “Not to be hung until there is a champion worth it. P. Crouch.” “Agreed. V.” “Under protest. I.”',
        choices: [
          { text: '(Hang it across the main street over the title-bout bill.)', to: 'street', effects: [{ setFlag: 'brawler.old_bunting', value: 'street' }] },
          { text: '(Hang it over Pops’s noodle cart instead.)', to: 'cart', effects: [{ setFlag: 'brawler.old_bunting', value: 'cart' }] },
        ],
      },
      street: { speaker: 'narrator', text: 'You hang it across the main street of Knuckletown. Three windows open at once. Three old women look at it for a very long time. Then, one after the other, without a word, they close the windows, and you are almost sure one of them is crying.', next: null },
      cart: { speaker: 'narrator', text: 'You hang it over Pops’s cart. He comes back from the market, sees it, puts down his basket and stands in the street with his hands on his hips. “Who did that?” he says. “Who did that?” He does not take it down.', next: null },
      plain: { speaker: 'narrator', text: 'An old trunk in the Crouch attic, full of tissue paper.', next: null },
    },
  },

  // ======================= Side: Doc Lint’s Thread (the first stitch)
  {
    id: 'dialogue:obj-brawler-doc-patient', name: 'Doc Lint’s Thread: the first stitch', scope: 'party',
    entries: [{ when: stage('quest:brawler-doc-lints-thread', 'stitch'), node: 'cut' }, { node: 'plain' }],
    nodes: {
      cut: { speaker: 'narrator', text: 'In the practice ring a big young fighter sits on the stool with a cut over his eye, bleeding cheerfully. Doc Lint hands you the needle, threaded with smuggler’s silk. “In at the top,” she says. “Out at the bottom. Talk to him. They bleed less when you talk.”', next: 'stitch' },
      stitch: {
        speaker: 'narrator', text: 'Your hands are made for hitting things. They are not made for this. The fighter is watching you with his good eye.',
        choices: [
          { text: '(Talk to him about anything but the needle.)', to: 'talk', effects: [{ setFlag: 'brawler.doc_stitch', value: 'talk' }] },
          { text: '(Say nothing. Just be quick and careful.)', to: 'quick', effects: [{ setFlag: 'brawler.doc_stitch', value: 'quick' }] },
        ],
      },
      talk: { speaker: 'narrator', text: 'You tell him about Pops’s noodles, and the turnip in the Harvest Ring, and number eleven, which does not exist. By the time he has stopped laughing, it is done. Five stitches. Doc Lint inspects them. “Ugly,” she says. “Honest. Good.”', next: null },
      quick: { speaker: 'narrator', text: 'Four stitches, quick and careful. He does not flinch once. Doc Lint inspects them for a long time. “Nobody bled in your corner longer than they had to,” she says. From her, it is a medal.', next: null },
      plain: { speaker: 'narrator', text: 'The practice ring. There is a little blood on the stool, and none on the canvas.', next: null },
    },
  },

  // ======================= Side: Tin-Can Tilly (her first corner)
  {
    id: 'dialogue:obj-brawler-tilly-bout', name: 'Tin-Can Tilly: her first corner', scope: 'party',
    entries: [{ when: stage('quest:brawler-tin-can-tilly', 'bout'), node: 'ring' }, { node: 'plain' }],
    nodes: {
      ring: { speaker: 'narrator', text: 'The Knuckletown village ring at dusk. Big Hob from the tannery is losing, slowly and bravely, to a farmer twice his age. In his corner, between rounds, Tilly works like a clock: bucket, stool, water, one true thing in his ear. You watch from the ropes.', next: 'third' },
      third: { speaker: 'narrator', text: 'Round three. Hob goes down, and gets up, and goes down. His eye is closing. He looks at his corner. Tilly has the towel in her hand. She is twelve. She looks at you across the ring.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'Nobody in the crowd knows what she is about to decide. You do. You know exactly what Pops would say. You know what it cost him to say it.',
        choices: [
          { text: '(Nod to her. Just once.)', to: 'nod', effects: [{ setFlag: 'brawler.tilly_towel', value: 'thrown' }] },
          { text: '(Do nothing. It is her corner.)', to: 'wait', effects: [{ setFlag: 'brawler.tilly_towel', value: 'hers' }] },
        ],
      },
      nod: { speaker: 'narrator', text: 'She throws it. The towel lands in the middle of the ring, and the crowd groans, and Hob sits down with relief on his face. Afterwards Tilly comes and finds you, white as a sheet. “He’d have lost the eye,” she says. “Wouldn’t he.” You say yes.', next: null },
      wait: { speaker: 'narrator', text: 'For a long moment she does nothing. Then she throws the towel, on her own, before Hob can get up again. Afterwards she does not come and find you. She sits with Hob, holding a wet cloth over his eye, telling him one true thing at a time.', next: null },
      plain: { speaker: 'narrator', text: 'The village ring. A towel hangs over the ropes in one corner, drying.', next: null },
    },
  },

  // ======================= Side: Old Nob’s Goats (the Climbers’ tent)
  {
    id: 'dialogue:obj-brawler-climbers-tent', name: 'Old Nob’s Goats: the Climbers’ tent', scope: 'party',
    entries: [{ when: stage('quest:brawler-old-nobs-goats', 'tent'), node: 'tent' }, { node: 'plain' }],
    nodes: {
      tent: { speaker: 'narrator', text: 'The Climbers’ recruiting tent at the foot of the Goat Paths: grey canvas, a teapot, two monks in grey, and a sign that says COME UP THE MOUNTAIN AND BE STILL. Speckle the goat walks in ahead of you and eats the sign.', next: 'letter' },
      letter: {
        speaker: 'narrator', text: 'You put the letter on their table. The elder monk reads it, and goes the colour of porridge. “We were told,” he says quietly, “that the fighters were volunteers. That Mr Gaunt was finding the Mountain King an army of the willing.”',
        choices: [
          { text: '“They were sold. Like the rest. You paid for them.”', to: 'sold', effects: [{ setFlag: 'brawler.climbers_know', value: 'sold' }] },
          { text: '“Then send them home. All forty.”', to: 'home', effects: [{ setFlag: 'brawler.climbers_know', value: 'home' }] },
        ],
      },
      sold: { speaker: 'narrator', text: 'The elder monk puts the letter down and sits very still, which is what monks do instead of crying. Then he takes down the sign, what is left of it, and folds up the tent. “We will go up and ask the King,” he says, “what we have been doing in his name.”', next: null },
      home: { speaker: 'narrator', text: '“Home,” says the elder monk, as if it were a word in another language. Then he nods, and writes a letter of his own, fast, and gives it to the younger monk, who runs up the Goat Paths with it as if the mountain were on fire.', next: null },
      plain: { speaker: 'narrator', text: 'A patch of flattened grass where a grey tent stood.', next: null },
    },
  },

  // ======================= Side: One Coat (the Harvest Ring rematch)
  {
    id: 'dialogue:obj-brawler-coat-bout', name: 'One Coat: the rematch at the Harvest Ring', scope: 'party',
    entries: [{ when: stage('quest:brawler-one-coat', 'rematch'), node: 'ring' }, { node: 'plain' }],
    nodes: {
      ring: { speaker: 'narrator', text: 'The Harvest Ring, a square of rope in a stubble field, with half of Lowfold Under and half of Thrush’s village on opposite sides. Gert Haddow and Rufus Thrush step into the ring. They are still wearing the coat. One sleeve each. Neither will take it off first.', next: 'bout' },
      bout: {
        speaker: 'narrator', text: 'You are the referee. The rules of the Harvest Ring do not cover this. The crowd waits.',
        choices: [
          { text: '“Fight in the coat, then. First one out of it loses.”', to: 'coat', effects: [{ setFlag: 'brawler.coat_bout', value: 'coat' }] },
          { text: '(Inspect the ring for turnips first. Thoroughly.)', to: 'turnip', effects: [{ setFlag: 'brawler.coat_bout', value: 'turnip' }] },
        ],
      },
      coat: { speaker: 'narrator', text: 'It is the strangest bout ever fought in the Lowfold: two champions in one coat, circling, swinging, getting tangled, falling over together, getting up together. After ten minutes they are both laughing too hard to stand. You call it a draw. Nobody argues.', next: null },
      turnip: { speaker: 'narrator', text: 'You find three turnips, solemnly, and throw them out of the ring one by one. The crowd cheers each turnip. By the third, Gert and Rufus are laughing too hard to fight. They shake hands, still in the coat. You call it a draw.', next: null },
      plain: { speaker: 'narrator', text: 'The Harvest Ring, a square of rope in a stubble field. There are no turnips in it.', next: null },
    },
  },

  // ======================= Side: Names on the Wall (the fight-board)
  {
    id: 'dialogue:obj-brawler-fight-board', name: 'Names on the Wall: the fight-board', scope: 'party',
    entries: [{ when: stage('quest:brawler-names-on-the-wall', 'board'), node: 'board' }, { node: 'plain' }],
    nodes: {
      board: { speaker: 'narrator', text: 'The Knuckletown fight-board, by the village ring, where the night’s bouts are chalked up. You wipe it clean and start writing: Hal Brunt. Peg Shaw. Young Halloran. Two hundred and twelve names, in the biggest letters you can, until the board is white with them.', next: 'town' },
      town: {
        speaker: 'narrator', text: 'People stop to read. A woman finds her nephew. A fighter finds his old sparring partner. Somebody brings more chalk.',
        choices: [
          { text: '(Write a heading over them: SOLD. COMING HOME.)', to: 'home', effects: [{ setFlag: 'brawler.fight_board', value: 'home' }] },
          { text: '(Write no heading. Let the names say it.)', to: 'names', effects: [{ setFlag: 'brawler.fight_board', value: 'names' }] },
        ],
      },
      home: { speaker: 'narrator', text: 'SOLD. COMING HOME. By morning, somebody has rubbed out SOLD. Nobody will say who. Nobody rubs out COMING HOME, and nobody chalks a bout on the board for a week.', next: null },
      names: { speaker: 'narrator', text: 'No heading. Just the names. By morning, somebody has drawn a little boxing glove beside Young Halloran’s, the way his mother used to sign his letters, and nobody chalks a bout on the board for a week.', next: null },
      plain: { speaker: 'narrator', text: 'The Knuckletown fight-board, covered in names.', next: null },
    },
  },

  // ======================= Optional areas (Claude 2): finds in the Lowfold’s ruin, cave and viewpoint
  find('fist-frontier-ruin-find', 'Lowfold ruin: the first ring',
    'In the ruin, among fallen fence-posts, a square of four standing stones: the first ring in the Lowfold, older than the Leagues. Cut into the corner-stone, worn almost away: “TWO GO IN. TWO COME OUT. THAT IS THE ONLY RULE.” Someone has chalked under it, recently: “NOT ANY MORE.”',
    'lore:hc-fist-frontier-ruin'),
  find('fist-frontier-cave-find', 'Lowfold cave: the cornermen’s marks',
    'At the end of the cave, where fighters hid between bouts in the old outlaw days, the wall is covered in cornermen’s marks: a little towel, scratched small, once for every fighter whose corner threw it in to save them. Hundreds of towels. The newest is very old.',
    'lore:hc-fist-frontier-cave'),
  find('fist-frontier-cave-codex', 'The Corner Cave: a cornerman’s rules',
    'A slate on a nail, in a cornerman’s hand: “One. Water, not too much. Two. Look at the eyes. Three. Tell them one thing, and make it true. Four. Throw the towel before they would. Five. Be there when they wake up.” Under five, a different hand has written: “The hard one.”',
    'lore:hc-fist-frontier-tally'),
  find('fist-frontier-view-find', 'Lowfold viewpoint: the rings',
    'From the viewpoint you can see every ring in the Lowfold at once: the village rings like coins in the fields, the Grand Pit in the middle like a crater, and down in the quarries the outlaw rings, lit at all hours. A tunnel mouth in the deepest quarry runs straight towards the Stair Gate.',
    'lore:hc-fist-frontier-view'),
  {
    id: 'dialogue:area-fist-frontier-view', name: 'Lowfold viewpoint banter',
    bark: true, entries: [{ when: { heroClass: 'brawler' }, node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'From up here you can hear three different round bells, two crowds and one very small dog, all at once. Somewhere down there, a noodle cart wheel is squeaking.', next: null } },
  },
  // ======================= ACT II, C-1 The Cellar Ring: Moll at the bog’s edge
  {
    id: 'dialogue:area-brawler-briar-road', name: 'C-1 banter: the road into Briar Hollow', bark: true,
    entries: [{ when: stage(BC1, 'cellar'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Briar Hollow is very quiet. Nobody is shouting odds, nobody is selling chestnuts, nobody is hitting anybody. Then, faint, from under a teahouse, you hear it: the slap of a glove on a bag, and somebody yelling “Chin DOWN!”', next: null } },
  },
  {
    id: 'dialogue:brawler-moll-bog', name: 'C-1 Moll watches the slimes spar', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: MT, text: '(She watches a slime in a fighting crouch fall slowly over sideways.) Look at that. Crane stance. On a thing with no legs. I’ve trained farm-boys, I’ve trained a blacksmith with one eye, and I have never once seen anything that bad.', next: 'watch' },
      watch: {
        speaker: MT, text: 'And that’s a monk’s form, that is, done by something that has watched a monk and never been told off. They’re learning off whatever’s in the pool.',
        choices: [
          { text: 'So what’s in the pool?', to: 'pool' },
          { text: '[Fist] (Square up to the nearest slime, just to see.)', to: 'square', school: 'fist' },
          { text: 'Thanks for coming out, Moll.', to: 'thanks', trustNpc: MT, trust: 1 },
        ],
      },
      pool: { speaker: MT, text: 'A thing that ate a monk, and now thinks it is one. Fights by the book, every move. Which means it’s never once been hit by somebody who hasn’t read the book.', next: 'end' },
      square: { speaker: 'narrator', text: 'You raise your gloves. The slime raises a lump of itself in what is clearly meant to be a guard, considers you for a long moment, and then, with enormous dignity, bows.', next: 'end' },
      thanks: { speaker: MT, mood: 'happy', text: 'Thirty years in a cellar. A walk does a body good. Even a walk into a bog full of idiots.', next: 'end' },
      end: { speaker: MT, text: 'Right. Spar your way through. Don’t read the book. Hit them with the bits that aren’t in it. Then come back and tell me, because I’ve got two shillings on you, and so has the whole cellar.', next: null },
    },
  },

  // ======================= ACT II, C-3 The Ooze Sovereign: the result for the cellar
  {
    id: 'dialogue:brawler-moll-abbot', name: 'C-3 Moll hears the result', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'The cellar under the Briar & Kettle has gone completely silent. Forty Lowfold fighters are sitting on the benches with their tickets in their fists, looking at the stairs, and at you coming down them.', next: 'result' },
      result: {
        speaker: MT, text: 'Well? Don’t make a speech. Result.',
        choices: [
          { text: 'The Abbot walked out of it and asked how gloves go on.', to: 'gloves' },
          { text: '(Hold up one glove, slime to the elbow.)', to: 'glove' },
        ],
      },
      gloves: { speaker: MT, mood: 'happy', text: '(The cellar erupts.) He asked how GLOVES go on? A monk? (She is wiping her eyes.) Somebody fetch him a pair. Somebody fetch him two. We’ll have a Saturday ring with an Abbot in it.', next: 'pay' },
      glove: { speaker: 'narrator', mood: 'happy', text: 'The cellar erupts. Forty people cheer a glove covered in slime as if it had won a championship, which, in a way, it has.', next: 'pay' },
      pay: { speaker: MT, text: '(She hands you a damp fistful of shillings.) Your purse. Two shillings a head, forty heads. Cellar rules: the fighter gets the pot. Now, there’s word from the Ashfall you’ll want, and I don’t like it.', next: 'silas' },
      silas: { speaker: MT, mood: 'angry', text: 'Posters. All over Kilnmouth. SILAS GAUNT PRESENTS. He’s put the beast under the kilns on a fight card, and he’s selling the losers on. That’s your promoter, isn’t it? He always did spell “unbeatable” wrong.', effects: [{ setFlag: 'brawler.cellar_purse', value: true }], next: null },
    },
  },

  // ======================= ACT II, C-5 Ashmaw: Silas’s ringside under the kilns
  clue('brawler-ringside-stool', 'C-5 Silas’s ringside under the kilns', stage(BC5, 'stool'),
    'Under the oldest kiln, round the place where Ashmaw lay, Silas has set out a ringside: a dozen stools, a bell on a post, and a chalkboard reading MAIN EVENT, THE UNBEATABEL BEAST. SOLD OUT. The front-row stool has a card on it: “Reserved. Complimentary.”', 'brawler.ringside_found',
    'Silas’s empty ringside under the kilns.', 'On the back of the card, in Silas’s looping promoter’s hand: “For our guest of honour, the Hollow King, with the compliments of the house. Percentage as agreed.” The stool is still warm. Somebody was sitting in it, watching you fight.'),

  // ======================= ACT II, C-6 A Menu with a Message: Tilly takes the answer
  {
    id: 'dialogue:brawler-tilly-reply', name: 'C-6 an answer for Pops, by Tilly', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: TI, mood: 'happy', text: 'I’m going home. Pops said not to come, so he’ll be wanting me back to tell me off properly. (She holds out the menu and a stub of pencil.) Write on the back. Small. He’s got bad eyes and good opinions.', next: 'write' },
      write: {
        speaker: 'narrator', text: 'What do you write on the back of Pops’s noodle menu?',
        choices: [
          { text: '“Hands up. Chin down. Still standing. Number nine, when I’m home.”', to: 'sent', effects: [{ setFlag: 'brawler.reply', value: 'nine' }] },
          { text: '“Tilly came. Don’t be cross with her. Be cross with me.”', to: 'tilly', effects: [{ setFlag: 'brawler.reply', value: 'tilly' }] },
          { text: '“Keep the stock on. I’m bringing a crowd.”', to: 'sent', when: { flag: 'brawler.pops_devotable' }, effects: [{ setFlag: 'brawler.reply', value: 'crowd' }] },
        ],
      },
      tilly: { speaker: TI, mood: 'happy', text: '(She reads it upside down, which is how she reads everything.) He’ll be cross with both of us. That’s fine. He’s best when he’s cross. He makes extra.', next: 'sent' },
      sent: { speaker: 'narrator', text: 'Tilly folds the menu into her shirt, pats it twice, and marches back through the Fist arch without looking round once, a tin can on each fist, a corner going home.', effects: [{ setFlag: 'brawler.tilly_home', value: true }], next: null },
    },
  },

  // ======================= ACT III, Pops’s Stock: embers from the bearers’ fires
  {
    id: 'dialogue:obj-brawler-camp-embers', name: 'Pops’s Stock: embers from the bearers’ fires', scope: 'party',
    entries: [{ when: stage(STOCKQ, 'embers'), node: 'fire' }, { node: 'plain' }],
    nodes: {
      fire: {
        speaker: 'narrator', text: 'The bearers’ fires at the Heart camp have burned all week on whatever would burn. You will need a shovelful of embers, and something to carry them in that is not your hands.',
        choices: [
          { text: '(Carry them in Pops’s ladle, very carefully.)', to: 'ladle' },
          { text: '[Fist] (Carry them in your glove, quickly, the way Pops takes a pot off the flame.)', to: 'glove', school: 'fist' },
        ],
      },
      ladle: { speaker: 'narrator', text: 'The ladle holds about a mouthful of embers. You make the trip several times. Tilly, following you with a bucket, counts each trip out loud, like rounds.', effects: [{ setFlag: 'brawler.embers', value: true }], next: null },
      glove: { speaker: 'narrator', mood: 'happy', text: 'It is very hot and very fast, and you do not drop any. Tilly is enormously impressed. A bearer from another school asks whether that is a Lowfold technique. It is now.', effects: [{ setFlag: 'brawler.embers', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The bearers’ fires, burning low.', next: null },
    },
  },

  // ======================= ACT III, Calling the Names: faces and ticket-stubs
  {
    id: 'dialogue:obj-brawler-sold-ranks', name: 'Calling the Names: the sold fighters', scope: 'party',
    entries: [{ when: stage(NAMESQ, 'faces'), node: 'faces' }, { node: 'plain' }],
    nodes: {
      faces: { speaker: 'narrator', text: 'In the Legion’s ranks, a block of Lowfold fighters in their wraps, fists up, faces wrapped too, the way Silas sent them out to the undercard. You have Pops’s list of names. You do not know which name goes with which pair of fists.', next: 'turn' },
      turn: {
        speaker: 'narrator', text: 'Call the wrong name to the wrong fighter, and nobody turns round. A name has to land on its owner.',
        choices: [
          { text: '(Try one anyway, quietly.)', to: 'try' },
          { text: '[Fist] (Watch their stances. Every Lowfold fighter stands like the person who taught them.)', to: 'stance', school: 'fist' },
        ],
      },
      try: { speaker: 'narrator', text: 'You say “Peg Shaw?” to the nearest fighter. Nothing. A name thrown into a crowd is just a noise. You need to know who is who. A promoter always knows.', effects: [{ setFlag: 'brawler.faces_seen', value: true }], next: null },
      stance: { speaker: 'narrator', text: 'One stands like Moll’s cellar. One stands like Big Mother Ox, who taught half the Lowfold. It is not enough to put a name to. Silas kept a book of who was who. He always did.', effects: [{ setFlag: 'brawler.faces_seen', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'Lowfold fighters in the Legion’s ranks.', next: null },
    },
  },
  clue('brawler-ticket-stubs', 'Calling the Names: Silas’s ticket-stubs', stage(NAMESQ, 'stubs'),
    'At the foot of the Twelve Stairs, scattered where the Chimera trod them down: a promoter’s book of ticket-stubs, every fighter Silas ever sold, one to a stub. Ring-name, weight, a mark to know them by. “Peg Shaw. Left-handed. Scar through the eyebrow.”', 'brawler.stubs_found',
    'Torn ticket-stubs at the foot of the Twelve Stairs.', '“Young Halloran. Glove tattoo, left wrist.” Stub after stub. He wrote them down so the Legion would know what it was buying. Now you know what you are giving back.'),
];

export default dialogues;
