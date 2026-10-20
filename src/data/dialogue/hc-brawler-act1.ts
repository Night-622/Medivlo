/** Hollow Crown, BRAWLER Act I main dialogues (the Lowfold Pits). Owner: Claude 4. */
import type { DialogueDef } from '@/core';

const TK = 'npc:tobiah-knuckle' as const, SG = 'npc:silas-gaunt' as const;
const stage = (q: `quest:${string}`, s: string) => ({ questStage: q, stage: s });

const dialogues: DialogueDef[] = [
  // ---------- I-1 The Bell in Round Three
  {
    id: 'dialogue:brawler-bout-night', name: 'I-1 round three', scope: 'party',
    entries: [{ node: 'ring' }],
    nodes: {
      ring: { speaker: 'narrator', text: 'A village ring in Knuckletown, lit by lanterns on poles. Forty people on the benches, two goats, one very old referee. Round three, and you are ahead on points against a farmer called Big Corran, who is tiring.', next: 'bell' },
      bell: { speaker: 'narrator', text: 'Then a bell rings. You turn for your corner, the way you have turned a thousand times. But it is not the round bell. It is very far away, and it is ringing somewhere under your ribs, and Big Corran has not turned.', next: null },
    },
  },
  {
    id: 'dialogue:obj-village-ring-corner', name: 'I-1 turning for the corner', scope: 'party',
    entries: [{ when: stage('quest:brawler-the-bell-in-round-three', 'bout'), node: 'turn' }, { node: 'plain' }],
    nodes: {
      turn: { speaker: 'narrator', text: 'You are halfway to your corner when Big Corran’s right hand arrives, a little late and extremely sincere. The lanterns swing. The canvas comes up to meet you, the way it always does, like an old friend who has had a drink.', next: 'down' },
      down: { speaker: 'narrator', text: 'Lying there, you notice two things. One is that something in your chest is singing, loud and stubborn, like it wants you to get up. The other is a small old man kneeling over you, fanning you with a noodle menu.', next: null },
      plain: { speaker: 'narrator', text: 'Your corner of the village ring. A stool, a bucket, and a noodle menu someone has left on the post.', next: null },
    },
  },
  {
    id: 'dialogue:brawler-pops-bell', name: 'I-1 Pops in your corner', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: TK, text: '(“Pops” Tobiah Knuckle, retired champion of the Lowfold, fans you with a menu. Number nine is the beef.) You turned your back on a farmer. On a FARMER. In round three. What did I tell you about bells?',
        choices: [
          { text: 'It wasn’t the round bell, Pops. It was in my chest.', to: 'chest' },
          { text: 'You said you weren’t my cornerman.', to: 'corner' },
        ],
      },
      corner: { speaker: TK, text: 'I’m not. I was walking past with a menu. (He is not walking past. He has a bucket.) Fine. One bowl of noodles a week and I’ll corner you. That’s my price. It’s a very good price. Ask anybody.', next: 'chest' },
      chest: {
        speaker: TK, text: 'In your chest. (He stops fanning.) Something singing? Keeps telling you to get up? (He sits back on his heels.) I knew a fellow had that once. Long time ago. Never mind. Can you stand?',
        choices: [
          { text: '(Get up.)', to: 'up', trust: 1 },
          { text: 'Give me a minute.', to: 'minute' },
        ],
      },
      minute: { speaker: TK, text: 'Take two. The canvas is the only thing in the Lowfold that won’t charge you for lying on it. Then get up. That’s the whole sport, kid. Getting up.', next: 'up' },
      up: { speaker: TK, text: 'Good. That’s the bit people forget to train. Right. Help me push the cart home. The left wheel squeaks. Don’t oil it, it’s the only thing in Knuckletown that tells the truth. Then you’re getting a bowl, and then we’ll talk.', next: null },
    },
  },
  // ---------- I-2 Noodles and Debts
  {
    id: 'dialogue:obj-noodle-door-1', name: 'I-2 the first delivery',
    entries: [{ when: stage('quest:brawler-noodles-and-debts', 'round'), node: 'door' }, { node: 'plain' }],
    nodes: {
      door: { speaker: 'narrator', text: 'Number four Sweat Lane: one bowl of the beef, owes Pops two coppers since the spring. The door is locked. You knock. Nobody comes. Under the door, the step is wet and black, and it is not rain.', next: null },
      plain: { speaker: 'narrator', text: 'A locked door on Sweat Lane. The bowl of noodles you left is still on the step.', next: null },
    },
  },
  {
    id: 'dialogue:obj-noodle-door-3', name: 'I-2 the last delivery',
    entries: [{ when: stage('quest:brawler-noodles-and-debts', 'round'), node: 'door' }, { node: 'plain' }],
    nodes: {
      door: { speaker: 'narrator', text: 'The last name in Pops’s book: Hal Brunt, a ladle and one copper. You know Hal. He lost in the outlaw rings last month, everybody said, and went home quiet. His door is locked too. Black tears have run out under it and dried in a line.', next: null },
      plain: { speaker: 'narrator', text: 'Hal Brunt’s locked door, and a dried black line across the step.', next: null },
    },
  },
  {
    id: 'dialogue:brawler-pops-doors', name: 'I-2 Pops hears about the doors', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: TK, text: 'Locked? All three? (He turns the pages of his little book.) Hal. Peg. Young Halloran. All three lost in the outlaw rings last month. All three came home quiet.',
        choices: [
          { text: 'There were black tears under the doors.', to: 'tears' },
          { text: 'Where did they fight?', to: 'where' },
        ],
      },
      tears: { speaker: TK, mood: 'afraid', text: 'Under the doors. In Knuckletown. (He puts the book away.) I don’t like that. I don’t like that the way I don’t like a southpaw who smiles.', next: 'where' },
      where: { speaker: TK, mood: 'angry', text: 'Lost, then went up to the Broken Fist Dojo. The Master takes in young ones who’ve been beaten. Gives them a mat and a bowl. They come out very polite. I always thought that was odd, for the Lowfold. Go and have a look. Keep your hands up.', next: null },
    },
  },
  // ---------- I-3 The Broken Fist Dojo
  {
    id: 'dialogue:brawler-master-bows', name: 'I-3 the Master of the Broken Fist', scope: 'party',
    entries: [{ node: 'dojo' }],
    nodes: {
      dojo: { speaker: 'narrator', text: 'A long dojo of polished boards, and young fighters kneeling in rows, perfectly still, eyes wet and black. At the end, an old master with his right hand held against his chest, crooked, never set.', next: 'bow' },
      bow: { speaker: 'narrator', text: 'He bows to you with his good hand. As he straightens, you see the sand already in his fist. Twenty years ago he threw a Lowfold final for a bag of coin, and he has been throwing fights ever since. Including this one.', next: null },
    },
  },
  {
    id: 'dialogue:obj-dojo-students', name: 'I-3 the Master’s students', scope: 'party',
    entries: [{ when: stage('quest:brawler-the-broken-fist-dojo', 'students'), node: 'send' }, { node: 'plain' }],
    nodes: {
      send: {
        speaker: 'narrator', text: 'The young fighters kneel in their rows, waiting for an order. Hal Brunt is in the second row. So is young Halloran. They do not know you.',
        choices: [
          { text: '(Clap your hands, like a round bell.) Time. Go home. All of you.', to: 'home' },
          { text: '(Kneel in front of Hal and hold out your gloves, the way you would to touch them before a bout.)', to: 'gloves', school: 'fist' },
        ],
      },
      gloves: { speaker: 'narrator', text: 'Hal looks at your gloves for a long time. Then, slowly, he raises his own fists and touches them to yours. Something comes back into his face, not all of it. He gets up. The others get up behind him.', next: 'home' },
      home: { speaker: 'narrator', text: 'They file out into the snow and down the Goat Paths, towards Knuckletown, slowly. Some of them are crying. That seems like a good sign.', next: null },
      plain: { speaker: 'narrator', text: 'Empty mats in rows, on polished boards.', next: null },
    },
  },
  // ---------- I-4 The Promoter's Offer
  {
    id: 'dialogue:brawler-silas-offer', name: 'I-4 the Promoter’s offer', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: SG, mood: 'happy', text: '(A thin man in a silk scarf with very kind eyes takes your hand in both of his, in front of the entire Pits.) There you are. The fighter who closed the Broken Fist. I have paid for the damage, every board. No, no, don’t thank me. Silas Gaunt. I promote.',
        choices: [
          { text: 'Why pay for it?', to: 'why' },
          { text: 'What do you want, Mr Gaunt?', to: 'want' },
        ],
      },
      why: { speaker: SG, text: 'Because somebody should, and nobody else was going to. That is the Lowfold. Everybody watches. Nobody pays.', next: 'want' },
      want: {
        speaker: SG, text: 'I want you in the Grand Pit. A title shot against Big Mother Ox, and the purse in advance. Here. (A heavy purse.) Nobody fights for free. Not while I’m around.',
        choices: [
          { text: '(Take the purse.)', to: 'take', effects: [{ setFlag: 'brawler.purse_taken', value: true }] },
          { text: 'I’ll take it after the fight. If I win.', to: 'after' },
        ],
      },
      take: { speaker: 'narrator', text: 'It is heavy, and cold, and slightly damp, the way a coin purse is after a long walk in the rain. It has not rained in a week. The crowd cheers. Silas Gaunt pats your cheek, very gently, like a man checking fruit.', next: 'end' },
      after: { speaker: SG, mood: 'happy', text: 'Afterwards! A fighter with principles. You are going to sell so many tickets. (He tucks the purse away.) It will be here when you want it. Everything I have is always here when you want it.', next: 'end' },
      end: { speaker: SG, text: 'Talk to your cornerman. Pops, isn’t it? Lovely old man. Lovely noodles. I knew him when I was young. Give him my regards.', next: null },
    },
  },
  {
    id: 'dialogue:brawler-pops-offer', name: 'I-4 Pops hears about the Promoter', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: TK, text: 'Silas Gaunt. (He stops ladling.) He sent his regards? Course he did. He always sends his regards. That boy has sent his regards to half the graves in the Lowfold.',
        choices: [
          { text: 'You know him.', to: 'know' },
          { text: 'It’s a title shot, Pops.', to: 'title' },
        ],
      },
      know: { speaker: TK, mood: 'sad', text: 'I knew him. Different thing. Eat your noodles. (He doesn’t say any more, and he stirs the pot for a long time.)', next: 'title' },
      title: { speaker: TK, text: 'It’s a title shot. And the League stewards were here this morning wanting you to fight it for the belt. And a pair of Climbers were here at lunch wanting you to march on the outlaw rings with them instead. Everybody wants you, kid. Make your mind up.', next: null },
    },
  },
  // ---------- I-5 Whose Purse (the faction choice; a party vote)
  {
    id: 'dialogue:brawler-whose-purse', name: 'I-5 whose purse', scope: 'party',
    entries: [{ when: { not: { flag: 'brawler.purse' } }, node: 'cart' }, { node: 'after' }],
    nodes: {
      cart: { speaker: 'narrator', text: 'Pops’s noodle cart, after closing. A League steward in a blazer on one stool. Two of the King’s Climbers in grey on the other, refusing noodles on principle and looking at them a great deal. Pops, ladling, pretending not to listen.', next: 'league' },
      league: { speaker: 'npc:bess-plummet', text: 'Fight for the League. For the belt, and the League’s good name. A title bout under League rules, a League purse, and a corner stool with your cornerman’s name on it.', next: 'climbers' },
      climbers: { speaker: 'narrator', text: 'The elder Climber puts his hands together. The outlaw rings sell people, he says. Rings do not need belts. They need closing. March with us for the Mountain King and close them by force.', next: 'floor' },
      floor: {
        speaker: 'narrator', text: 'Everybody at the cart is looking at you, even the ones pretending to look at the noodles. You have one more question in you before you choose.',
        choices: [
          { text: 'Pops. What would you do?', to: 'pops' },
          { text: '(To the Climbers.) What happens to the fighters you free?', to: 'freed' },
          { text: '(To the steward.) What does the League do about the outlaw rings?', to: 'league2' },
        ],
      },
      pops: { speaker: TK, text: '(Not looking up from the pot.) Me? I’d have a bowl of noodles and think about it for forty years, and by then you’d be grey. Don’t ask me, kid. I picked my fights once. Look where it got me. A cart.', next: 'choose' },
      freed: { speaker: 'narrator', text: 'The younger Climber answers, very seriously: they come up the mountain, and are given grey robes, and sweep the Stairs, and are at peace. The elder Climber looks at his noodles. Pops snorts so hard he has to put the ladle down.', next: 'choose' },
      league2: { speaker: 'npc:bess-plummet', mood: 'sad', text: 'Writes to them. (She sees your face.) Formally. Every month. They don’t write back, because they don’t exist, officially. I know it isn’t enough. A belt is what the League has. It’s not nothing.', next: 'choose' },
      choose: {
        speaker: TK, text: '(He puts the ladle down.) Well, kid? Who are you fighting for?',
        choices: [
          { text: 'The League. For the belt, and for Pops’s stool.', to: 'league-yes', quest: true, effects: [{ setFlag: 'brawler.purse', value: 'league' }] },
          { text: 'The Climbers. Let’s go and close the outlaw rings.', to: 'climb', quest: true, trustNpc: TK, trust: -1, effects: [{ setFlag: 'brawler.purse', value: 'climbers' }] },
          { text: 'Neither. I’m fighting for the ones he sold. No purse. Just the names.', to: 'names', quest: true, insight: 'brawler_for_the_names', when: { insight: 'silas_towel' }, effects: [{ setFlag: 'brawler.purse', value: 'names' }] },
        ],
      },
      'league-yes': { speaker: 'npc:bess-plummet', mood: 'happy', text: 'Splendid. The League sponsors the title shot. (She writes on a card.) Corner stool: T. Knuckle. Painted, I think. In gold. (Pops goes very quiet and very red.)', next: null },
      climb: { speaker: TK, mood: 'angry', text: 'Climbers. Monks. (He picks up the ladle again, very hard.) Monks hit people for nothing and call it virtue. Fine. Fine! Go and march. Mind they don’t make you meditate.', next: null },
      names: { speaker: 'narrator', text: 'The steward and the Climbers both look at you. Pops puts the ladle down and does not pick it up again. For the names, he says. No purse. (Somewhere across the Pits, a man in a silk scarf has just been told, and has cancelled his supper to come and watch.)', next: null },
      after: { speaker: TK, text: 'You’ve chosen. Now eat. You can’t fight on a choice.', next: null },
    },
  },
  // ---------- I-6 Big Mother Ox
  {
    id: 'dialogue:obj-ox-corner-stool', name: 'I-6 catching Big Mother Ox', scope: 'party',
    entries: [{ when: stage('quest:brawler-big-mother-ox', 'catch'), node: 'catch' }, { node: 'plain' }],
    nodes: {
      catch: {
        speaker: 'narrator', text: 'The tears under her feet have let go at last, and Big Mother Ox, nineteen years unbeaten, is toppling like a tree. She has not been allowed to fall down in a very long time. She looks frightened of the floor.',
        choices: [
          { text: '(Stop hitting. Catch her, and hold her up.)', to: 'hold' },
          { text: '(Get your shoulder under her and walk her to her corner.)', to: 'walk', school: 'fist' },
        ],
      },
      hold: { speaker: 'narrator', text: 'You catch her. She is enormous. You hold her up anyway, both arms, knees shaking, until she can stand on her own, and the whole Grand Pit goes completely silent.', next: 'stool' },
      walk: { speaker: 'narrator', text: 'You get your shoulder under her arm and walk her, one step at a time, to her own corner. The crowd starts counting the steps out loud, the way they count a knockdown. You make it in nine.', next: 'stool' },
      stool: { speaker: 'narrator', text: 'She sits down on her stool. She has not sat down in a bout for nineteen years. “I was so tired,” she says. “And I was frightened. You don’t know what he does to the ones who lose. He sells them. By the head. Down the quarry.”', next: null },
      plain: { speaker: 'narrator', text: 'Big Mother Ox’s corner stool, reinforced with iron bands, worn smooth.', next: null },
    },
  },
  // ---------- I-7 Sold by the Head
  {
    id: 'dialogue:obj-quarry-tunnel-mouth', name: 'I-7 the quarry tunnel', scope: 'party',
    entries: [{ when: stage('quest:brawler-sold-by-the-head', 'tunnel'), node: 'tunnel' }, { node: 'plain' }],
    nodes: {
      tunnel: { speaker: 'narrator', text: 'In the deepest quarry, behind an outlaw ring, a tunnel mouth seeping black. Fresh boot-prints go in, many of them, in a line, close together, as if roped. None come out. The tunnel runs straight towards the Stair Gate.', next: null },
      plain: { speaker: 'narrator', text: 'The quarry tunnel, boarded up now, still seeping.', next: null },
    },
  },
  {
    id: 'dialogue:brawler-silas-tunnel', name: 'I-7 Silas at the tunnel', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: SG, text: '(He is sitting on a crate at the tunnel mouth with a ledger on his knee, writing down heads as they go in.) You found my little door. Clever. Come and sit. You look like you want to shout. Shouting is cheaper sitting down.',
        choices: [
          { text: 'You’re selling them.', to: 'selling' },
          { text: 'Your coin is wet, Silas. Wet with tears.', to: 'wet', insight: 'wet_purse', when: { any: [{ flag: 'brawler.purse_taken' }, { flag: 'brawler.climber_letter' }] } },
        ],
      },
      wet: { speaker: SG, mood: 'happy', text: 'You noticed. Nobody notices. It’s the Hollow Legion’s coin. They pay very well and they pay in tears. Everybody who takes it goes a little quieter. It’s much easier to promote a quiet fighter.', next: 'selling' },
      selling: {
        speaker: SG, text: 'By the head, to the Hollow Legion, through this tunnel under the Stair Gate. Every beaten fighter in the Lowfold. Somebody was always going to sell them, kid. The rings never cared. At least I write their names down.',
        choices: [
          { text: 'What do you want the Pit half for?', to: 'half' },
          { text: 'Nobody fights for you, so you sell everybody.', to: 'nobody' },
        ],
      },
      nobody: { speaker: SG, mood: 'sad', text: '(For a moment the kind eyes are not kind, they are only tired.) I learned that young. From a very good teacher. Anyway.', next: 'half' },
      half: {
        speaker: SG, text: 'A half-stone stops the tears where it lies. Put it under my Quarry Throne and mine is the only ring in the whole Lowfold where nobody goes hollow. Everyone will pay to stand in it. Everyone. Forever. It’s the best promotion in history.',
        choices: [{ text: 'Not with that stone.', to: 'end', quest: true }],
      },
      end: { speaker: SG, mood: 'happy', text: 'Then come and take it off my chair. Main event. Tonight. I’ll sell tickets.', next: null },
    },
  },
  // ---------- I-8 The Quarry Throne
  {
    id: 'dialogue:obj-fist-frontier-halfstone', name: 'I-8 the Pit half', scope: 'party',
    entries: [{ when: stage('quest:brawler-the-quarry-throne', 'stone'), node: 'claim' }, { node: 'empty' }],
    nodes: {
      claim: { speaker: 'narrator', text: 'On the seat of the Quarry Throne, on a cushion, under glass, with a price-tag: half of a crystal, cracked clean across, singing. You break the glass with your glove. The stone is warm, and it fits your fist like it was waiting to be a fist.', next: 'tag' },
      tag: { speaker: 'narrator', text: 'The price-tag is in Silas’s neat hand. It does not have a price on it. It says: NOT FOR SALE. Under that, crossed out and written again and crossed out: EVERYTHING IS FOR SALE.', next: 'vision' },
      vision: { speaker: 'narrator', text: 'For a moment you are not in the quarry. You stand on a hill at night in a ring of twelve stones, each singing its own note, round a crown nobody is wearing. Then the ring cracks, all at once, like a jaw taking a punch, and the song breaks.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'You are back in the quarry with the Pit half in your fist. Round the Quarry Throne, the fighters Silas sent into the ring are sitting up, holding their heads, very confused.',
        choices: [
          { text: '(Hold up the stone, so they can see it. Then help the nearest one up.)', to: 'up' },
          { text: '(Tear the price-tag in half.)', to: 'tear' },
          { text: '“Where is your other half?”', to: 'other' },
        ],
      },
      up: { speaker: 'narrator', text: 'The nearest one is a girl you sparred with once, two winters ago. She takes your hand and you haul her up, and she says your name, and then her own, very carefully, as if she had nearly forgotten it.', next: 'silas' },
      tear: { speaker: 'narrator', text: 'It tears easily. Everything Silas made out of paper does. Down on the quarry floor somebody laughs, a croaky, surprised laugh, the first in that place for a very long time.', next: 'silas' },
      other: { speaker: 'narrator', text: 'It hums, low and steady, and you know without knowing how that the other half is high above you, at the top of the world, waiting for a monk who has learned to stand very still.', next: 'silas' },
      silas: { speaker: SG, mood: 'happy', text: '(From the crane-lift, rising out of the quarry, his scarf blowing.) Keep it warm for me, champion! The Stair Gate, main event! Everybody pays to get through a gate eventually!', next: 'bell' },
      bell: { speaker: 'narrator', text: 'Somewhere in the outlaw rings above, somebody rings a round bell, out of habit. This time, for once, nobody gets up to fight.', next: null },
      empty: { speaker: 'narrator', text: 'An empty cushion on the Quarry Throne, under broken glass, with its price-tag still attached.', next: null },
    },
  },
  // ---------- I-9 In Your Corner (mentor farewell; trust check)
  {
    id: 'dialogue:brawler-pops-corner', name: 'I-9 in your corner', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: TK, text: '(Pops is pushing his noodle cart up the Stair Gate road behind you, and has been for an hour, and is very out of breath, and will not stop.) Don’t. Don’t say it. A cornerman goes to the corner. The corner is wherever the fight is.',
        choices: [
          { text: 'Let me push it, Pops.', to: 'push' },
          { text: 'You only agreed to a bowl of noodles a week.', to: 'week', trust: 1 },
        ],
      },
      push: { speaker: TK, text: 'You? You’ve got a title bout at the top of this. Save your legs. A cornerman carries the bucket. That’s the job.', next: 'gift' },
      week: { speaker: TK, mood: 'sad', text: 'I lied. I’d have done it for nothing. Don’t tell anybody. I’ve got a reputation for meanness to look after.', next: 'gift' },
      gift: {
        speaker: TK, text: '(At the last bend before the gate, he stops the cart.) Here. Before you go up.',
        choices: [
          { text: '(Take what he gives you.)', to: 'towel', when: { trust: TK, value: 'friendly' } },
          { text: '(Shake his hand.)', to: 'hand', when: { not: { trust: TK, value: 'friendly' } } },
        ],
      },
      towel: {
        speaker: TK, text: 'My corner towel. Forty years in a corner. Wipe your face with it between rounds and you’ll find your second wind, I don’t know why, it just works. And if you ever have to throw it in for somebody, you throw it. Don’t wait.',
        effects: [{ giveItem: 'i_pops_towel' }, { setFlag: 'brawler.pops_towel', value: true }],
        next: 'belt',
      },
      belt: {
        speaker: TK, text: '(He reaches under the noodle pots and brings out something wrapped in an old apron.) And this. I haven’t looked at it in thirty-three years.',
        choices: [
          { text: '(Unwrap it.)', to: 'unwrap', when: { trust: TK, value: 'trusted' }, effects: [{ setFlag: 'brawler.pops_belt', value: true }] },
          { text: 'Keep it, Pops. It’s yours.', to: 'end' },
        ],
      },
      unwrap: { speaker: TK, mood: 'sad', text: 'Lowfold championship belt. C. 1009. The night I knocked down Doran Kell, the only man who ever went down to me and got up meaning it. Never wore it after. Didn’t feel right. You wear it. Up there. He’ll know it.', next: 'end' },
      hand: { speaker: TK, text: 'Hands up. Chin down. Get up every time. That’s all I ever taught anybody. Go on.', next: null },
      end: { speaker: TK, text: 'Go on, kid. I’ll be right behind you. I’ll be the one shouting.', next: null },
    },
  },
  // ---------- I-10 The Stair Gate (Lowfold side)
  {
    id: 'dialogue:brawler-king-bout', name: 'I-10 the Mountain King’s title bout', scope: 'party',
    entries: [{ node: 'crowd' }],
    nodes: {
      crowd: { speaker: 'narrator', text: 'Half of Knuckletown has followed you up the Stair Gate road with blankets and a picnic. Mrs Crouch has brought bunting. On the last landing before the gate sits the Mountain King, huge and grey, his fists gloved in black tears frozen hard as stone. Silas is a silk scarf at the gate behind him.', next: 'king' },
      king: { speaker: 'narrator', text: 'The King looks down at you. I do not fight pit-rats, he says, and closes his eyes.', next: 'pops' },
      pops: { speaker: TK, mood: 'angry', text: '(From the back of the crowd, very loud.) DORAN KELL! LOWFOLD CHAMPIONSHIP, C. 1009! WHO PUT YOU ON THE CANVAS IN THE FOURTH? WHO WAS IT, DORAN?', next: 'up' },
      up: { speaker: 'narrator', text: 'The Mountain King’s eyes open. He looks over your head at a small old man beside a noodle cart. Then he stands, and the landing cracks under him, and he lifts his frozen fists. Knuckletown cheers. Get knocked down. Get up. Keep getting up.', next: null },
    },
  },
];

export default dialogues;
