/**
 * Hollow Crown, CORSAIR: Gallows Reef people (general talk), the eight side quests, the mentor thread and the
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
const DB = 'npc:dot-brine' as const, SA = 'npc:saltmarsh' as const;

const dialogues: DialogueDef[] = [
  // ---------- Dot (general + mentor thread)
  {
    id: 'dialogue:corsair-dot', name: 'Dot (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: DB, text: 'If anybody asks, I’m not here, and the Overdraft is a fishing boat. What is it, sweetheart?',
        choices: [
          offer('quest:corsair-the-first-article', 'What’s in your hat, Captain?', 'hat', { all: [{ trust: DB, value: 'friendly' }, { questCompleted: 'quest:corsair-vexs-guildhold' }] }),
          offer('quest:corsair-quills-price', 'Who’s the one-legged man who won’t look at you?', 'quill', { all: [{ trust: DB, value: 'trusted' }, { questCompleted: 'quest:corsair-the-pearl-admiral' }] }),
          { text: 'How much do you owe, all told?', to: 'owe' },
          { text: 'Who was your mother, Dot?', to: 'mother', when: { all: [{ questCompleted: 'quest:corsair-quills-price' }, { questCompleted: 'quest:corsair-the-first-article' }] } },
          bye,
        ],
      },
      mother: { speaker: DB, text: '(She is quiet for long enough that Interest looks at her.) Annis Brine, of the Underpaid. The worst captain on Gallows Reef and the best sailor. She could steer through a hole in a fog and argue with it the whole way.', next: 'night' },
      night: {
        speaker: DB, mood: 'sad', text: 'The night the King pawned the gate, she sailed out to see who had bought it. Rang the Last Bell on her way past the buoy. She never came back. I stole the articles off the Exchange the next morning, so nobody could ever sell the Fleet the way he sold that gate.',
        choices: [
          { text: 'You’ve been keeping her promise ever since.', to: 'promise' },
          { text: 'Do you think she found out who bought it?', to: 'found' },
        ],
      },
      promise: { speaker: DB, mood: 'sad', text: '(She puts her hat back on, carefully, with both hands.) Somebody had to. That’s all a free captain is, sweetheart: somebody who keeps a promise nobody can make her keep.', next: 'start' },
      found: { speaker: DB, text: 'I think she found out, and didn’t like the price, and tried to haggle. That would be just like her. (A small laugh.) I hope she haggled them down to nothing before the end.', next: 'start' },
      hat: { speaker: DB, text: '(She takes it off and shows you the lining: page after page of old handwriting, sewn in.) The Brine Fleet’s articles. The originals. I stole them off the Exchange in C. 1012 so nobody could ever sell them. Only the first page went missing. Vex had it, last I heard. Framed. As a joke.', next: null },
      quill: { speaker: DB, mood: 'sad', text: 'Barnaby Quill. My first mate, twenty years. He went into the sea after me in a storm and came out with one leg. He won’t take my money. I’ve tried. It’s the only debt I’ve got that I actually want to pay. Ask him what he will take. He won’t tell me.', next: null },
      owe: { speaker: DB, mood: 'happy', text: 'All told? Sweetheart, nobody’s ever told it all. It would take a week. Roughly a ship and a half, three reputations, and a goat I borrowed in C. 1009.', next: 'start' },
    },
  },
  {
    id: 'dialogue:obj-first-article-page', name: 'Mentor: the first page', scope: 'party',
    entries: [{ when: stage('quest:corsair-the-first-article', 'page'), node: 'page' }, { node: 'plain' }],
    nodes: {
      page: { speaker: 'narrator', text: 'Among Vex’s confiscated things hung up on the gibbets for auction, a frame with one sheet in it, water-stained, the ink brown. THE ARTICLES OF THE BRINE FLEET. ARTICLE ONE: No free captain may be bought, nor sold, nor sell another. Somebody has written “HA” in the margin.', next: null },
      plain: { speaker: 'narrator', text: 'An empty frame on the gibbet beam.', next: null },
    },
  },
  {
    id: 'dialogue:corsair-dot-article', name: 'Mentor: the First Article', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: DB, text: '(She takes the frame and breaks it over her knee, quite calmly, and slides the page out.) “HA”. That’s Vex. Thirty years he had this on his wall, laughing at it. You know why he laughed?', next: 'one' },
      one: {
        speaker: DB, mood: 'sad', text: 'Because we stopped believing it. Every captain on the reef owes somebody. Owing’s just being bought slowly. The Fleet was founded on one idea, and it’s been selling itself by the pound ever since.',
        choices: [{ text: 'No free captain may be bought, nor sold, nor sell another.', to: 'end', insight: 'first_article', trust: 1 }],
      },
      end: { speaker: DB, text: '(She sews it into the front of her hat while you watch, with a sailmaker’s needle.) There. Right where I can feel it. Remember it, if anybody ever offers the Fleet a price.', next: null },
    },
  },
  {
    id: 'dialogue:corsair-quill-price', name: 'Mentor: Barnaby Quill’s price', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:barnaby-quill', text: '(He does not look up from his net.) She sent you. Money? Don’t want her money. Never wanted it. Took a leg off me, the sea did, not her. She didn’t owe me for the sea.',
        choices: [
          { text: 'Then what would you take?', to: 'what' },
          { text: '[Guile] Everybody has a price. Even you.', to: 'price', school: 'guile' },
        ],
      },
      price: { speaker: 'npc:barnaby-quill', text: '(He laughs, short and gruff.) Everybody. Aye. Go on, then. You want mine.', next: 'what' },
      what: { speaker: 'npc:barnaby-quill', mood: 'sad', text: '(He puts the net down.) One more voyage. One. Round the reef at night, her at the wheel and me at the bow, calling the rocks, the way we used to. I’ve not been on the water since. She’s never asked. I’ve never said.', next: null },
    },
  },
  {
    id: 'dialogue:obj-overdraft-helm', name: 'Mentor: one more voyage', scope: 'party',
    entries: [{ when: stage('quest:corsair-quills-price', 'voyage'), node: 'sail' }, { node: 'plain' }],
    nodes: {
      sail: { speaker: 'narrator', text: 'You get Quill aboard with a great deal of swearing on everybody’s part. Dot takes the wheel without a word. All night the Overdraft runs round the reef with Quill at the bow on his one good leg, calling every rock by name, and Dot answering him, and both of them arguing about every single knot.', next: null },
      plain: { speaker: 'narrator', text: 'The Overdraft’s wheel, worn smooth by Dot’s hands.', next: null },
    },
  },
  {
    id: 'dialogue:corsair-dot-quill', name: 'Mentor: Quill’s Price paid', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: DB, mood: 'sad', text: '(She is at the rail at dawn with her hat off and her hair everywhere.) Twenty years. Twenty years I thought he hated me, and all he wanted was to call the rocks once more. I never asked. I’m a fool. Don’t tell anyone I said so.', next: 'end' },
      end: { speaker: DB, text: 'That’s the only debt I ever wanted to pay, and you paid it for me, and I can’t pay you back for it, and I don’t mind. That’s a new feeling. Thank you.', effects: [{ trust: DB, delta: 1 }], next: null },
    },
  },
  {
    id: 'dialogue:corsair-interest', name: 'Interest',
    entries: [{ node: 'pay' }],
    nodes: { pay: { speaker: 'npc:interest', text: '(The parrot looks you up and down and says “PAY UP.” A moment later, louder: “PAY UP! PAY UP WITH INTEREST!”)', next: null } },
  },
  {
    id: 'dialogue:corsair-saltmarsh', name: 'Saltmarsh (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: SA, text: 'Ah, the Overdraft’s hand. Lavender tea? It helps with the smell of the hold.',
        choices: [
          { text: 'Why lavender?', to: 'lavender' },
          { text: 'Where did you get your name, Admiral?', to: 'name' },
          bye,
        ],
      },
      lavender: { speaker: SA, text: 'Because pearls smell of the sea, and the sea smells of everything that ever went into it. Lavender smells of nothing but itself. It’s restful.', next: null },
      name: { speaker: SA, text: 'I bought it. (He smiles.) Everything I have, I bought. It’s the only honest way to have anything.', next: null },
    },
  },
  // ---------- the Brine Market: Everything Must Go, the Thousand Knot, the bounty board
  {
    id: 'dialogue:corsair-sal', name: 'Salvage Sal (Everything Must Go)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:salvage-sal', text: 'Everything must go! Including, eventually, me! You’re standing on a lovely bit of hull, by the way. Make me an offer.',
        choices: [offer('quest:corsair-everything-must-go', 'What’s left to sell?', 'left'), bye],
      },
      left: { speaker: 'npc:salvage-sal', text: 'The mast and the rigging, the deck, and the plank I’m standing on. The plank I’m keeping. Find me a buyer for the rest before I have to start selling the water underneath.', next: null },
    },
  },
  {
    id: 'dialogue:corsair-netty-rigging', name: 'Side: selling Netty the rigging',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:netty-hawser', text: 'Sal’s rigging? Good hemp, that. Old hemp. I’ll have it, every yard, for the Knot. Tell her a fair price and a cup of tea, and tell her I’ll come and fetch it, so she doesn’t fall in.', next: null } },
  },
  {
    id: 'dialogue:corsair-gilly-deck', name: 'Side: selling Gilly the deck',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:gilly-rackham', text: 'Sal’s deck? (He considers.) I could do with a new bounty board. A big one. With a bit of deck under it to stand on. Done. Coin, mind. Not pearls.', next: null } },
  },
  {
    id: 'dialogue:corsair-sal-done', name: 'Side: Sal sold out', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:salvage-sal', mood: 'happy', text: '(She is standing on one plank and a barrel, beaming.) Sold out! Completely sold out! First time in my life! (The plank creaks.) I’ll have to sell the barrel next. Here, your commission. Don’t spend it on boats.', next: 'plank' },
      plank: { speaker: 'npc:salvage-sal', text: '(She steps off the plank onto the barrel and lifts it.) Not this. This came off the Underpaid, the Overdraft’s sister. My mum bought her for salvage. I’d like it to keep sailing. Dot’s starboard rail has always been one board short.', next: null },
    },
  },
  {
    id: 'dialogue:corsair-netty', name: 'Netty Hawser (the Thousand Knot)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:netty-hawser', text: 'Over, under, round and through. Nobody left behind. (She is glaring up at a row of Thief Crows on the rigging.) And those beggars are unpicking it.',
        choices: [offer('quest:corsair-the-thousand-knot', 'The knot is coming apart?', 'knot'), bye],
      },
      knot: { speaker: 'npc:netty-hawser', mood: 'angry', text: 'Three strands already. The night the gate shut, every ship in the market got lashed to every other with one knot, so nobody would be left behind when the bad times came. If the crows unpick it, the market drifts apart, a ship at a time. Shift the crows. Then help me retie it, saying the words.', next: null },
    },
  },
  {
    id: 'dialogue:obj-thousand-knot-strand-3', name: 'Side: the last strand', scope: 'party',
    entries: [{ when: stage('quest:corsair-the-thousand-knot', 'retie'), node: 'tie' }, { node: 'plain' }],
    nodes: {
      tie: { speaker: 'narrator', text: 'The last strand, over, under, round and through, with Netty saying the words beside you: “Bound to each and each to all, none to buy and none to sell.” The market creaks, all together, like a ship settling on its moorings.', next: null },
      plain: { speaker: 'narrator', text: 'A strand of the Thousand Knot, tight and true.', next: null },
    },
  },
  {
    id: 'dialogue:corsair-netty-knot', name: 'Side: the knot holds', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:netty-hawser', text: 'It holds. Thirty years and it holds. You know the words come from somewhere? “None to buy and none to sell.” From the old articles. The very first. Before anyone had a price.',
        choices: [{ text: 'What’s the first article?', to: 'article' }, { text: 'Thank you, Netty.', to: 'end' }],
      },
      article: {
        speaker: 'npc:netty-hawser', text: '“No free captain may be bought, nor sold, nor sell another.” My mother taught it me with the knot. Folk forget it. They remember the knot.',
        choices: [{ text: 'No free captain may be bought, nor sold, nor sell another.', to: 'end', insight: 'first_article', trust: 1 }],
      },
      end: { speaker: 'npc:netty-hawser', text: 'Take a coil of the good rope. You’ll want something to tie, where you’re going.', next: null },
    },
  },
  {
    id: 'dialogue:corsair-gilly', name: 'Bosun Gilly Rackham (bounties)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:gilly-rackham', text: 'Bounties on the board. Paid in coin, not pearls. I’m old-fashioned.',
        choices: [
          offer('quest:corsair-bounty-parliament-of-pockets', 'The Parliament of Pockets.', 'crows', { questCompleted: 'quest:corsair-dots-creditors' }),
          offer('quest:corsair-bounty-barnacle-mimic', 'The Barnacle Mimic.', 'mimic', { questCompleted: 'quest:corsair-the-pearl-admiral' }),
          bye,
        ],
      },
      crows: { speaker: 'npc:gilly-rackham', text: 'Thief Crows on the Crow Islands, six of them at least, working pockets in formation. One holds your hat, one holds your coat, four go through your purse. Very professional. Very annoying.', next: null },
      mimic: { speaker: 'npc:gilly-rackham', text: 'Mimic Slime in a wreck’s strongbox in the coves, grown barnacles on it so it looks the part. Three salvagers have opened it. They are owed new hands. I am owed a strongbox.', next: null },
    },
  },
  // ---------- Gallows Reef: the Hat on the Gibbet, A Message in a Pearl
  {
    id: 'dialogue:corsair-tusk', name: 'Merrin Tusk (the Hat on the Gibbet)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:merrin-tusk', text: 'A week to memorial night and my hat’s gone! My hat! Stolen off the gibbet in broad daylight!',
        choices: [offer('quest:corsair-the-hat-on-the-gibbet', 'You hung your own hat up? You’re not lost.', 'lost', { questCompleted: 'quest:corsair-dots-creditors' }), bye],
      },
      lost: { speaker: 'npc:merrin-tusk', text: 'Not yet. I’m seventy-eight. I put it up early, to save everybody the trouble. It’s considerate. And now a crow’s got it. The Thief Crows on the reef have been taking hats all month. Get it back before memorial night, or I’ll be lost without a hat, which is unthinkable.', next: null },
    },
  },
  {
    id: 'dialogue:obj-tusk-hat', name: 'Side: Tusk’s hat', scope: 'party',
    entries: [{ when: stage('quest:corsair-the-hat-on-the-gibbet', 'hat'), node: 'hat' }, { node: 'plain' }],
    nodes: {
      hat: { speaker: 'narrator', text: 'A crow’s nest on the gibbet beam, lined with stolen hats: a fisherman’s cap, two bonnets, a bishop’s mitre nobody can explain, and a battered captain’s tricorne with a little brass tusk on the band. It is a bit pecked. It is very much his.', next: null },
      plain: { speaker: 'narrator', text: 'A crow’s nest of hats, one hat lighter.', next: null },
    },
  },
  {
    id: 'dialogue:corsair-tusk-hat', name: 'Side: the hat returned', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:merrin-tusk', mood: 'happy', text: '(He puts it on, then takes it off, then hangs it reverently back on its hook on the gibbet.) There. Now I can be lost in peace. Come to memorial night. We drink to every hat. It takes a while.',
        choices: [{ text: 'I’ll drink to yours early.', to: null, trust: 1 }, { text: 'Try not to get lost, Captain.', to: null }],
      },
    },
  },
  {
    id: 'dialogue:corsair-ione', name: 'Ione Sculpin (A Message in a Pearl)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ione-sculpin', text: 'Down and up, down and up. Every pearl’s a little colder than the last. (She holds one out on her palm.) Except this one. This one talks.',
        choices: [offer('quest:corsair-a-message-in-a-pearl', 'Talks?', 'talks', { questCompleted: 'quest:corsair-dots-creditors' }), bye],
      },
      talks: { speaker: 'npc:ione-sculpin', mood: 'afraid', text: 'Hold it to your ear. It says: “Just one more, and they’ll let me sleep.” Over and over. Somebody wept that, somewhere, and I want to know who, and I want to know who “they” are. I don’t sell the ones that talk.', next: null },
    },
  },
  {
    id: 'dialogue:obj-whispering-pearl', name: 'Side: the whispering pearl', scope: 'party',
    entries: [{ when: stage('quest:corsair-a-message-in-a-pearl', 'listen'), node: 'listen' }, { node: 'plain' }],
    nodes: {
      listen: { speaker: 'narrator', text: '“Just one more, and they’ll let me sleep.” An old man’s voice, very tired. And under it, faintly, the cries of a great many crows, the bang of a hut door in the wind, and somebody saying “rations” in a kind, patient voice that smells, somehow, of lavender.', next: null },
      plain: { speaker: 'narrator', text: 'A black pearl in a dish, quiet now.', next: null },
    },
  },
  {
    id: 'dialogue:corsair-ruel-weeper', name: 'Side: Ruel Tregaskis', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ruel-tregaskis', text: '(An old man in a hut on the Crow Islands, a bowl in his lap with a black pearl in the bottom.) That’s my voice. That’s mine. One more, I said. They bring the bowl, I weep, they take it, they let me sleep. Kind men. In white.',
        choices: [
          { text: 'What do you weep about?', to: 'about' },
          { text: 'You don’t have to weep for them, Ruel.', to: 'stop', trust: 1 },
        ],
      },
      about: { speaker: 'npc:ruel-tregaskis', mood: 'sad', text: 'I don’t remember now. I had a wife, I think. A boat. They gave me something to be sad about, the first week, and after that I just was. It comes easier every day. That’s the rations.', next: null },
      stop: { speaker: 'npc:ruel-tregaskis', mood: 'sad', text: 'Don’t I? (He looks at the bowl as if he has never seen it before.) Then what would I do with my evenings?', next: null },
    },
  },
  {
    id: 'dialogue:corsair-ione-weeper', name: 'Side: telling Ione', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:ione-sculpin', mood: 'angry', text: 'Grief rations. The Admiral’s men in white, on the Crow Islands, making people weep to order. (She closes her fist on the pearl.) I’m done diving for him. Here. Take your share. Take all the shares. I don’t want his money in my house.', next: null },
    },
  },
  {
    id: 'dialogue:corsair-ruel', name: 'Ruel Tregaskis (the Crow Who Stole a Crown)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ruel-tregaskis', text: 'That crow on the tall stack’s got a crown. A real one. Little. Gold. Nobody believes me. Nobody believes anybody on rations.',
        choices: [offer('quest:corsair-the-crow-who-stole-a-crown', 'I believe you. Show me the stack.', 'stack', { questCompleted: 'quest:corsair-the-merry-widow' }), bye],
      },
      stack: { speaker: 'npc:ruel-tregaskis', mood: 'happy', text: 'The tall one. Out past the huts. It sits on its nest and wears it, the cheek of it. Bring it here and I’ll show you something about crowns I learned before I forgot everything else.', next: null },
    },
  },
  {
    id: 'dialogue:obj-crow-nest-crown', name: 'Side: the tiny crown', scope: 'party',
    entries: [{ when: stage('quest:corsair-the-crow-who-stole-a-crown', 'crown'), node: 'crown' }, { node: 'plain' }],
    nodes: {
      crown: { speaker: 'narrator', text: 'Between a spoon and a button: a little gold crown, the size of a bracelet, made for a child. Inside the band three names are engraved, one after another, with three dates. The first says SOLD.', next: null },
      plain: { speaker: 'narrator', text: 'A crow’s nest, a spoon, a button, and a sulking crow.', next: null },
    },
  },
  {
    id: 'dialogue:corsair-ruel-crown', name: 'Side: the thrice-sold crown', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ruel-tregaskis', text: '(He reads the band with his nose almost touching it.) Oh, I know this. Every child on the reef knows this, or did. A Tidecourt Concordant sold the little princess’s crown twice in C. 384, to two different lords, on the same day. And both of them paid.',
        choices: [{ text: 'And the third name?', to: 'third' }],
      },
      third: { speaker: 'npc:ruel-tregaskis', mood: 'happy', text: 'The third buyer. The Concord. Bought it back off both of them and gave it to the princess, and fined the Concordant a year of silence. That’s the joke, see. The only thing in Tidecourt nobody could sell was what the Concord gave away. (He laughs. It surprises him.) I remembered that.', next: null },
    },
  },
  // ---------- the Wreckers' Coves: the Wrecker's Daughter, Ma Colley's Lights
  {
    id: 'dialogue:corsair-nell', name: 'Nell Gant (the Wrecker’s Daughter)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:nell-gant', text: 'I keep it lit so he can find the cove. He’s just late. He’s always late. Mam says he’d be late to his own funeral, but he hasn’t had one, so.',
        choices: [offer('quest:corsair-the-wreckers-daughter', 'Can I help with the lantern?', 'help', { questCompleted: 'quest:corsair-the-pearl-admiral' }), bye],
      },
      help: { speaker: 'npc:nell-gant', text: 'It’s on the high rock. I could reach it when I was seven. I’ve grown and the rock hasn’t, which isn’t fair, it should go up as well. Fill it for me? There’s oil in the jar.', next: null },
    },
  },
  {
    id: 'dialogue:obj-nell-lantern', name: 'Side: Nell’s lantern', scope: 'party',
    entries: [{ when: stage('quest:corsair-the-wreckers-daughter', 'lantern'), node: 'lamp' }, { node: 'plain' }],
    nodes: {
      lamp: { speaker: 'narrator', text: 'You fill the lantern on the high rock and it burns up warm and yellow, nothing like the cold pearl-light of the false ones. Out in the fog, in the biggest cove, the Merry Widow lies aground, and along her rail stand a crew who are not quite there. One of them is looking straight at the light.', next: null },
      plain: { speaker: 'narrator', text: 'Nell’s lantern on the high rock, burning steadily.', next: null },
    },
  },
  {
    id: 'dialogue:corsair-nell-father', name: 'Side: Nell’s father', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:nell-gant', text: 'Did you see him? You saw him. You’ve got a face like Mam when she saw the bill for the roof. He’s on that ship, isn’t he. The grey one that doesn’t sail.',
        choices: [
          { text: 'He’s on her. And I’ll get him off.', to: 'promise', trust: 1 },
          { text: 'Somebody was looking at your lantern, Nell.', to: 'looking' },
        ],
      },
      promise: { speaker: 'npc:nell-gant', text: 'Promise? (You do.) All right. I’ll keep it lit, then. I was going to anyway. I was going to keep it lit till I was ninety.', next: null },
      looking: { speaker: 'npc:nell-gant', mood: 'happy', text: 'Then it’s working. I knew it was working. I’ll keep it lit. You get him off that ship.', next: null },
    },
  },
  {
    id: 'dialogue:corsair-abel-home', name: 'Side: the wrecker walks home', scope: 'party',
    entries: [{ when: stage('quest:corsair-the-wreckers-daughter', 'home'), node: 'home' }, { node: 'after' }],
    nodes: {
      home: { speaker: 'npc:abel-gant', text: '(A big man, wet through, sitting on the doorstep with Nell in his lap, though she is much too big for it.) I saw a light. I don’t know how long I was on that ship. I saw a light, and I knew whose it was, and then a captain said his own name and I could walk again. So I walked.', next: 'nell' },
      nell: { speaker: 'npc:nell-gant', mood: 'happy', text: 'He’s late! Four years late! I TOLD you he was always late!', next: null },
      after: { speaker: 'npc:abel-gant', text: '(He has not let go of Nell’s hand.) Thank you. That’s all I’ve got. Thank you.', next: null },
    },
  },
  {
    id: 'dialogue:corsair-colley', name: 'Ma Colley (Ma Colley’s Lights)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ma-colley', text: 'Lanterns by the hour! Honest lights! Mostly! (Quieter.) You’re off the Overdraft. Dot’s lot. You’ve a straight face, for a Brine girl’s crew. I’ve a question needs a straight face.',
        choices: [offer('quest:corsair-ma-colleys-lights', 'Ask it.', 'ask', { questCompleted: 'quest:corsair-the-pearl-admiral' }), bye],
      },
      ask: { speaker: 'npc:ma-colley', mood: 'afraid', text: 'Someone’s paying me in black pearls to keep a row of my lanterns lit all night, every night, on the cove rocks. Good money. And the barges keep going on the rocks under my lights. I rent the lantern, I don’t ask. Only now I’m asking. Who?', next: null },
    },
  },
  {
    id: 'dialogue:obj-colley-hire-ledger', name: 'Side: Ma Colley’s ledger', scope: 'party',
    entries: [{ when: stage('quest:corsair-ma-colleys-lights', 'ledger'), node: 'ledger' }, { node: 'plain' }],
    nodes: {
      ledger: { speaker: 'narrator', text: 'Three months of hires in Ma Colley’s round hand. Fishermen, smugglers, a wedding. And every night, the same order: twelve lanterns, all night, the outer rocks, paid in pearls, left on the counter after dark. Signed with a little drawing of a flag.', next: null },
      plain: { speaker: 'narrator', text: 'Ma Colley’s hire ledger.', next: null },
    },
  },
  {
    id: 'dialogue:obj-colley-stall-counter', name: 'Side: who leaves the pearls',
    entries: [
      { when: { all: [stage('quest:corsair-ma-colleys-lights', 'watch'), NIGHT] }, node: 'night' },
      { when: stage('quest:corsair-ma-colleys-lights', 'watch'), node: 'day' },
      { node: 'counter' },
    ],
    nodes: {
      counter: { speaker: 'narrator', text: 'Ma Colley’s stall counter, scarred with forty years of lantern-oil.', next: null },
      day: { speaker: 'narrator', text: 'Nobody leaves anything on the counter by day. Ma Colley says the pearls come after dark.', next: null },
      night: {
        speaker: 'narrator', text: 'Close to midnight a young deckhand in spotless white comes along the cove path, puts a purse of black pearls on the counter, and a paper beside it: twelve lights, outer rocks. He smells faintly of lavender. He is gone before Ma Colley’s door opens.',
        effects: [{ setFlag: 'corsair.colley_payer', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:corsair-colley-payer', name: 'Side: Ma Colley’s answer', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ma-colley', text: 'White. From the white ship. (She sits down hard on a lantern-crate.) The Admiral. Lighting the barges onto the rocks, his own barges, so the Merry Widow comes for them, and everyone blames the ghost.',
        choices: [{ text: 'Why would he wreck his own cargo?', to: 'why' }],
      },
      why: { speaker: 'npc:ma-colley', mood: 'angry', text: 'Wreck it, claim it, sell it twice. Every wreck’s a fresh lot of grief, too, for the Crow Islands. (She blows out the nearest lantern.) No more of mine on those rocks. Here, take a lantern. An honest one. I’ve a few of those.', next: null },
    },
  },
  // ---------- the Crow Islands: Pennywhistle's Map
  {
    id: 'dialogue:corsair-penny', name: 'Captain Pennywhistle (Pennywhistle’s Map)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:pennywhistle', text: 'X marks the spot! Well. A sort of wobbly cross marks the spot. And my back marks the end of my digging career. You look young and bendy.',
        choices: [offer('quest:corsair-pennywhistles-map', 'Where’s the spot?', 'spot', { questCompleted: 'quest:corsair-dots-creditors' }), bye],
      },
      spot: { speaker: 'npc:pennywhistle', text: 'Seven paces from the dead tree, three from the rock that looks like a duck. You’ll know the duck. Everybody knows the duck. Dig, and whatever’s in it, we split it, sixty forty. Sixty to me. I had the map.', next: null },
    },
  },
  {
    id: 'dialogue:obj-pennywhistle-x', name: 'Side: digging', scope: 'party',
    entries: [{ when: stage('quest:corsair-pennywhistles-map', 'dig'), node: 'dig' }, { node: 'plain' }],
    nodes: {
      dig: { speaker: 'narrator', text: 'Seven paces from the dead tree. Three from the rock, which does, from the right angle, look very much like a duck. Four feet down, your spade hits wood. A chest, iron-bound, very old. It is breathing.', next: null },
      plain: { speaker: 'narrator', text: 'A hole, near a duck-shaped rock.', next: null },
    },
  },
  {
    id: 'dialogue:obj-pennywhistle-chest', name: 'Side: the sorry chest', scope: 'party',
    entries: [{ when: stage('quest:corsair-pennywhistles-map', 'chest'), node: 'chest' }, { node: 'plain' }],
    nodes: {
      chest: {
        speaker: 'narrator', text: 'The lid lifts by itself. Inside there are teeth, and a long pink tongue, and a Mimic Slime looking up at you with enormous wet eyes. It burps up a gold coin, very politely, and then another. It seems to be apologising. It has been down here a long time, and it has eaten the treasure, and it is very sorry.',
        choices: [
          { text: '(Let it go.)', to: 'go' },
          { text: '[Guile] Negotiate: it keeps the gold, you keep the map it’s lying on.', to: 'map', school: 'guile' },
        ],
      },
      go: { speaker: 'narrator', text: 'It slides out of its hole, bows as well as a slime can bow, burps up one last coin for you, and goes off down the beach in the direction of the sea, looking much happier. Under where it lay is another map.', next: null },
      map: { speaker: 'narrator', text: 'It thinks about it, burps in agreement, and wobbles off down the beach. Under where it lay is another map, older than the first. It is a map of where Pennywhistle’s map came from.', next: null },
      plain: { speaker: 'narrator', text: 'An empty chest, with tooth-marks on the inside of the lid.', next: null },
    },
  },
  {
    id: 'dialogue:corsair-penny-chest', name: 'Side: telling Pennywhistle', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:pennywhistle', mood: 'happy', text: 'A slime! Ate it all! And it said sorry? (He laughs so hard he has to hold his back.) Forty years I’ve hunted that chest. Best story I’ve ever had. Sixty forty on the story, then. And you have the map. Maps are for the young.', next: null },
    },
  },
  {
    id: 'dialogue:corsair-quill', name: 'Barnaby Quill (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:barnaby-quill', text: '(He does not look up from his net.) One leg, one net, one opinion. That’s plenty, thank you.', next: null } },
  },

  // ======================= ACT II
  {
    id: 'dialogue:corsair-hester', name: 'C-1 Lanternford: the smugglers', scope: 'party',
    entries: [{ when: { flag: 'corsair.charter', value: 'signed' }, node: 'signed' }, { node: 'start' }],
    nodes: {
      signed: {
        speaker: 'npc:hester-glimmer', text: 'Off the Brine Fleet, with the Admiral’s charter on you. I can smell it. Lavender. (She pours you a drink anyway.) His agents go through here every week with pearls for the Bog Market. They’ll wave you through anywhere in this marsh.',
        choices: [{ text: 'Who buys his pearls here?', to: 'pell', quest: true }],
      },
      start: {
        speaker: 'npc:hester-glimmer', mood: 'happy', text: 'A bicorne! A Brine Fleet bicorne, in my bar! Sit down, captain, or whatever you are this week. Drink? It’s marsh gin. It’s mostly marsh.',
        choices: [
          { text: 'Black pearls are lying in the lee of the Guile arch. Who’s raking them?', to: 'pell', quest: true },
          { text: 'Dot Brine sends her regards.', to: 'dot', trust: 1 },
        ],
      },
      dot: { speaker: 'npc:hester-glimmer', mood: 'happy', text: 'Dot Brine! She owes me eleven shards and a dance from C. 1010! Tell her I want the dance. Now. Pearls.', next: 'pell' },
      pell: { speaker: 'npc:hester-glimmer', text: 'The Bog Market runs on them. They come through Pell Odd, mostly, the peddler, who swears blind he’s never seen a pearl in his life. And Pell buys his from a man with a white flag. He’s in Brindlecross this week. He’s always somewhere this week.', next: 'market' },
      market: { speaker: 'npc:hester-glimmer', text: 'But go and look at the Bog Market first, out on the punts, so you know what you’re asking him about. Pell can smell a guess at forty paces.', next: null },
    },
  },
  {
    id: 'dialogue:corsair-rosie', name: 'C-4 Rosie Mossop on the pearl barges', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:rosie-mossop', text: 'Pearls in, nothing out. Barge after barge, up the gold-silt, black pearls by the ton, and we unload them into carts and the carts go down into the Ruins and come back empty. I don’t like a cargo that only goes one way.',
        choices: [
          { text: 'Who sells them?', to: 'who', quest: true },
          { text: '[Guile] What’s the paperwork say?', to: 'paper', school: 'guile', quest: true },
        ],
      },
      paper: { speaker: 'npc:rosie-mossop', text: 'Paperwork! Ha! Bills of lading all signed with a little drawing of a flag. Payment on delivery. In Engine-gold. Hot, it is, when they pay you. Too hot.', next: 'who' },
      who: { speaker: 'npc:rosie-mossop', mood: 'afraid', text: 'An old sea-dog in white, smells of lavender, very polite. Comes up on the last barge every evening to watch it unloaded. Two tailors in grey go everywhere with him, measuring him. The last barge is tied up below the Row now.', next: null },
    },
  },
  {
    id: 'dialogue:corsair-rosie-general', name: 'Rosie Mossop (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:rosie-mossop', text: 'Lift with your knees! Not you. Them. You can lift however you like, you’re not on my gang.', next: null } },
  },
  {
    id: 'dialogue:obj-corsair-pearl-barge', name: 'C-4 the pearl barge', scope: 'party',
    entries: [{ when: stage('quest:corsair-the-admirals-cargo', 'barge'), node: 'barge' }, { node: 'plain' }],
    nodes: {
      barge: { speaker: 'narrator', text: 'The barge’s hold is full to the hatches with black pearls, and cold as a winter sea. Pinned to the mast is a bill of sale: “To the Gilded Engine, for the forging of the Black Concord, in the Hollow King’s name. Supplied by Saltmarsh, merchant to the Crown.” Under it, a tailor’s card: “Final fitting tonight.”', next: 'rosie' },
      rosie: { speaker: 'npc:rosie-mossop', text: '(Rosie reads it over your shoulder, lips moving.) Final fitting. Of what? (She pulls her gloves on.) A month I’ve shifted this muck and never once seen where it goes. I’m coming with you to the cart-head, and you’re keeping me alive, because I know the way and you don’t.', next: null },
      plain: { speaker: 'narrator', text: 'An empty barge below Gilded Row, its hold still cold.', next: null },
    },
  },
  {
    id: 'dialogue:corsair-interest-letter', name: 'C-6 a letter by parrot', scope: 'party',
    entries: [{ node: 'parrot' }],
    nodes: {
      parrot: { speaker: 'npc:interest-courier', text: '(Interest is sitting on the Guile arch with a letter in his claws, shouting “PAY UP!” at the wolves. He drops it in your hand and says, very quietly, “paid.” It is the first time he has ever said anything else.)', next: 'letter' },
      letter: {
        speaker: DB, text: '(The letter is written on the back of an IOU.) “Sweetheart. The Fleet is poor and free and furious with me, which is how I like it. Quill comes out on the water every Tuesday now. I have paid four debts this month on purpose. I feel unwell. Mind your purse. Love, D.”',
        choices: [{ text: '(Fold the IOU away.)', to: 'court', quest: true, effects: [{ setFlag: 'corsair.dot_letter', value: true }] }],
      },
      court: { speaker: 'narrator', text: 'At the Stone Court that evening the Jester bearer sits down across from you with a pack of cards, and you play for who buys the drinks, and you both cheat, and you both catch each other, and you both pay. Under the table the Reef half and the Court half hum a sea-shanty in a minor key.', next: null },
    },
  },
  {
    id: 'dialogue:obj-corsair-dot-bottle', name: 'C-6 a bottle from Dot', scope: 'party',
    entries: [
      { when: { all: [stage('quest:corsair-a-bottle-from-dot', 'letter'), { not: { flag: 'corsair.interest_pet' } }] }, node: 'bottle' },
      { node: 'plain' },
    ],
    nodes: {
      bottle: { speaker: 'narrator', text: 'A green bottle has rolled out of the lee of the Guile arch, among the pearls, as if the gate itself had washed it up. It is corked with wax and stamped with the Overdraft’s mark. Inside, rolled up, is an IOU.', next: 'letter' },
      letter: {
        speaker: DB, text: '(On the back of the IOU.) “Sweetheart. The Fleet is poor and free and furious with me, which is how I like it. Quill comes out on the water every Tuesday now. Interest sends his regards and his bill. I have paid four debts this month on purpose. I feel unwell. Love, D.”',
        choices: [{ text: '(Fold the IOU away.)', to: 'court', quest: true, effects: [{ setFlag: 'corsair.dot_letter', value: true }] }],
      },
      court: { speaker: 'narrator', text: 'At the Stone Court that evening the Jester bearer sits down across from you with a pack of cards, and you play for who buys the drinks, and you both cheat, and you both catch each other, and you both pay. Under the table the Reef half and the Court half hum a sea-shanty in a minor key.', next: null },
      plain: { speaker: 'narrator', text: 'An empty green bottle among the pearls in the lee of the Guile arch.', next: null },
    },
  },
  // ---------- featured bearers (hooks on the bearer NPCs)
  {
    id: 'dialogue:corsair-featured-rimecaller', name: 'Featured: The Lantern Bargain', scope: 'party',
    entries: [
      { when: stage('quest:corsair-the-lantern-bargain', 'back'), node: 'back' },
      { when: { all: [stage('quest:corsair-the-lantern-bargain', 'shop'), { not: { flag: 'corsair.ilse_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-rimecaller', text: 'You’re from Tidecourt. You can haggle. I can’t. There’s a lantern in the shop at Lanternford, one of the Queen’s, and there’s a memory frozen in it. My mother, laughing, in the Hall of Held Hours. I want it. I don’t know what it costs. I don’t know how to ask.',
        choices: [{ text: 'Leave the asking to me.', to: null, quest: true, effects: [{ setFlag: 'corsair.ilse_asked', value: true }] }],
      },
      back: {
        speaker: 'npc:bearer-rimecaller', text: 'I’ve been thinking about what it cost, and about what it was worth, and whether those are the same. They aren’t. I learned that today. When we go to the Heart, I want someone beside me who knows the difference.',
        effects: [{ setFlag: 'corsair.ilse_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-corsair-mother-lantern', name: 'Featured: the lantern with a memory in it', scope: 'party',
    entries: [{ when: stage('quest:corsair-the-lantern-bargain', 'shop'), node: 'shop' }, { node: 'plain' }],
    nodes: {
      shop: {
        speaker: 'narrator', text: 'On the top shelf of the Lantern Shop, a lantern with a light in it like frost, and in the light a woman laughing, very small, over and over. Peregrine Tolley takes it down. “One of the Queen’s,” he says. “Price is a memory. Hers, or yours, or somebody’s.”',
        choices: [
          { text: '[Guile] Haggle. A memory of a memory is worth half a memory, by any market.', to: 'haggle', school: 'guile' },
          { text: 'Tell Ilse the truth: it costs a memory, and it might be one of her mother.', to: 'truth' },
          { text: 'Pay it yourself. You’ve plenty of memories of Dot. You can spare one.', to: 'pay' },
        ],
      },
      haggle: { speaker: 'narrator', text: 'Peregrine opens his mouth, closes it, and does the sum on the counter with his finger. “Half,” he says faintly. “Half a memory.” Ilse pays it, and forgets half of a bad winter, and takes the lantern home in both hands.', next: null },
      truth: { speaker: 'narrator', text: 'Ilse is quiet a long time. Then she puts the lantern back on the shelf. “Then I’d be swapping her for her,” she says. “No.” She looks at the little laughing light once more, carefully, so that she remembers it the ordinary way.', next: null },
      pay: { speaker: 'narrator', text: 'You hold the lantern and let it take one: Dot teaching you to splice rope, the first week, swearing. It goes out of you like a tide. Ilse looks at you as if you have done something nobody in Glacierhome would ever do, and takes the lantern home.', next: null },
      plain: { speaker: 'narrator', text: 'A space on the Lantern Shop’s top shelf.', next: null },
    },
  },
  {
    id: 'dialogue:corsair-featured-juggernaut', name: 'Featured: Union Rates', scope: 'party',
    entries: [
      { when: stage('quest:corsair-union-rates', 'back'), node: 'back' },
      { when: { all: [stage('quest:corsair-union-rates', 'ledger'), { not: { flag: 'corsair.hamm_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-juggernaut', text: 'You read ledgers? Pirate ledgers? Good. I’ve got the Gildport dock office ledger and I can’t make it say anything except numbers. The dockers want to down tools. Before they do, I want to know who we’re downing them on.',
        choices: [{ text: 'Give it here. The right way up.', to: null, quest: true, effects: [{ setFlag: 'corsair.hamm_asked', value: true }] }],
      },
      back: {
        speaker: 'npc:bearer-juggernaut', mood: 'happy', text: 'They’ve downed tools. All of them. Not one barge unloaded since noon. The Engine’s going hungry. Magda’s iron and that Admiral’s pearls, one book, one lie. When we go to the Heart, I’m bringing the whole gang, and you’re the only one who gets to read the books.',
        effects: [{ setFlag: 'corsair.hamm_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-corsair-dock-ledger', name: 'Featured: the dock ledger', scope: 'party',
    entries: [{ when: stage('quest:corsair-union-rates', 'ledger'), node: 'ledger' }, { node: 'plain' }],
    nodes: {
      ledger: {
        speaker: 'narrator', text: 'Two columns, side by side, in one hand. On the left, Deepworks iron, “hollow, smelted, Ruhl”. On the right, black pearls, “Saltmarsh, by the ton”. Both going down into the Gilded Ruins to the same account. Both paid at the same rate. The dockers’ wages are in a third column, much smaller.',
        choices: [
          { text: '[Guile] Point out that the Engine pays them less per ton than the pearls cost to weep.', to: 'rate', school: 'guile' },
          { text: 'Read it all out loud, slowly, to the whole gang.', to: 'aloud' },
        ],
      },
      rate: { speaker: 'narrator', text: 'Hamm Ironsides does the sum twice on his fingers, and then the whole dock gang does it, and then somebody throws a pearl into the gold-silt, and then everybody does.', next: null },
      aloud: { speaker: 'narrator', text: 'By the time you reach the third column, the gang has gone very quiet. Rosie Mossop takes off her gloves. One by one, so does everyone else.', next: null },
      plain: { speaker: 'narrator', text: 'The Gildport dock ledger, closed.', next: null },
    },
  },
  // ---------- class hooks on the Brindlecross fourteen
  {
    id: 'dialogue:hook-corsair-pell', name: 'Hook: Pell and the Corsair', scope: 'party',
    entries: [
      { when: { all: [stage('quest:corsair-lanternford', 'pell'), { flag: 'corsair.charter', value: 'marque' }] }, node: 'marque' },
      { when: stage('quest:corsair-lanternford', 'pell'), node: 'pearls' },
    ],
    nodes: {
      marque: { speaker: 'npc:pell', mood: 'angry', text: 'Oh no. Oh no, no. That’s a King’s commission in your hat. A privateer! I don’t trade with privateers, they confiscate things. (He lowers his voice anyway.) White flag. Comes to the Bog Market every week. That’s all you get, and you didn’t get it from me.', next: null },
      pearls: {
        speaker: 'npc:pell', text: 'Pearls? What pearls? These are marbles. Very dark marbles. (He sees your bicorne, and sighs.) Fine. Fine. I rake the lee of the arch, everybody does, and I buy the rest from a fellow in white with a white flag on his boat. Smells of lavender. Pays too well. I don’t like people who pay too well.',
        choices: [{ text: 'Neither do I.', to: null, trustNpc: 'npc:pell', trust: 1 }, { text: 'Thank you, Pell.', to: null }],
      },
    },
  },
];

export default dialogues;
