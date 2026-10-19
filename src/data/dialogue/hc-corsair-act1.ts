/** Hollow Crown, CORSAIR Act I main dialogues (Gallows Reef). Owner: Claude 4. */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const DB = 'npc:dot-brine' as const, SA = 'npc:saltmarsh' as const;
/** the Captain Nobody fight (I-6) */
const FIGHT = stage('quest:corsair-the-merry-widow', 'nobody');

const dialogues: DialogueDef[] = [
  // ---------- I-1 The Bell over the Water
  {
    id: 'dialogue:corsair-bell-night', name: 'I-1 the Bell rings under Gallows Reef', scope: 'party',
    entries: [{ node: 'market' }],
    nodes: {
      market: { speaker: 'narrator', text: 'Night in the Brine Market, a hundred ships lashed together into one swaying town. Captain Dot Brine is slipping the Overdraft’s moorings very quietly, because a creditor is coming along the planks with a lantern and six friends.', next: 'bell' },
      bell: { speaker: 'narrator', text: 'Somewhere under the sea a bell rings once. Every ship’s bell in the market rings back, all together, a hundred bells. In the Overdraft’s hold the black pearls hum one long note, and under your ribs, something hums with them.', next: 'pearls' },
      pearls: {
        speaker: 'narrator', text: 'Through the open hatch you can see down into the hold, where Dot keeps the pearls she swears she hasn’t got. They are glowing faintly, every one, like eyes. Along the planks the creditor’s lantern has stopped, and turned your way.',
        choices: [
          { text: '(Grab a belaying pin.)', to: 'pin' },
          { text: '(Look down into the hold.)', to: 'hold' },
          { text: '[Guile] (Cut the nearest line while everyone is staring at the sky.)', to: 'cut', school: 'guile' },
        ],
      },
      pin: { speaker: 'narrator', text: 'You have a belaying pin in your hand before you know why. Along the planks the lanterns are swinging towards the Overdraft, and they are not friendly lanterns.', next: 'creditor' },
      hold: { speaker: 'narrator', text: 'There are more pearls down there than Dot has ever admitted to, and every one of them is humming the note under your ribs, as if they had known it first.', next: 'creditor' },
      cut: { speaker: 'narrator', text: 'One stroke, and a line slaps into the water. The Overdraft drifts a yard from the planks, which would have been very clever if the creditor’s friends could not jump.', next: 'creditor' },
      creditor: { speaker: 'narrator', text: 'The creditor is a small man in a large coat, and his six friends are Cutpurses hired by the hour. “Dorothea Brine!” he shouts. “I have a paper!” “Everybody has a paper!” Dot shouts back.', next: 'dot' },
      dot: { speaker: DB, mood: 'angry', text: 'Well, that’s torn it. Everybody’s awake. (The creditor’s friends are coming over the rail with knives.) Cutpurses! Hired ones! Throw them in the harbour, and mind the paintwork, I haven’t paid for it!', next: null },
    },
  },
  {
    id: 'dialogue:corsair-dot-bell', name: 'I-1 Dot after the boarding', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: DB, text: '(Dot is sitting on the capstan with her hat pushed back, counting her teeth with her tongue.) All there. Good. You fight like a sailor and you hum like a hold full of pearls. Why are you humming?',
        choices: [
          { text: 'Something is singing in my chest.', to: 'sing' },
          { text: 'Captain, about my wages.', to: 'wages' },
        ],
      },
      wages: { speaker: DB, mood: 'happy', text: 'Wages! Ha! Next week. Next month. When the ship comes in, which is never, because I am the ship. Now. The humming.', next: 'sing' },
      sing: {
        speaker: DB, text: '(She goes quiet, and leans close, and listens.) Oh, you poor lamb. That’s half a Concord Stone, that is. The Reef half. My grandmother said it hung on the Gallows when the crown broke, and that it’d call somebody home one day. I didn’t think it’d be somebody I owe money.',
        choices: [
          { text: 'What do I do?', to: 'do', trust: 1 },
          { text: 'Can you sell it?', to: 'sell' },
        ],
      },
      sell: { speaker: DB, text: 'Sell it? (She looks genuinely shocked, which is rare.) There are things a free captain doesn’t sell, sweetheart. Not many. But that’s one.', next: 'do' },
      do: { speaker: DB, text: 'Tonight? First we cast off, before that creditor comes back with more friends: the bow line, the stern line, and the one I tied in a temper. Then come down to the hold. There’s something down there you ought to hear.', next: null },
    },
  },
  // ---------- I-2 Dot's Creditors
  {
    id: 'dialogue:obj-creditor-barrel-1', name: 'I-2 the first creditor', scope: 'party',
    entries: [{ when: stage('quest:corsair-dots-creditors', 'creditors'), node: 'c' }, { node: 'plain' }],
    nodes: {
      c: { speaker: 'narrator', text: 'Behind a barrel of salt herring you overhear the sailmaker telling his wife that Dot Brine owes him for three sails and a lie. He wants paying in black pearls, he says. Everybody does now. You stay behind the barrel. That is renegotiation.', next: null },
      plain: { speaker: 'narrator', text: 'A barrel of salt herring. A good barrel. Excellent cover.', next: null },
    },
  },
  {
    id: 'dialogue:obj-market-edge-divers', name: 'I-2 the divers', scope: 'party',
    entries: [{ when: stage('quest:corsair-dots-creditors', 'divers'), node: 'divers' }, { node: 'plain' }],
    nodes: {
      divers: { speaker: 'narrator', text: 'At the edge of the market, on the outermost planks, a row of pearl-divers sits with their feet in the water. They are smiling at the sea. When you speak to them they turn and smile at you, kindly, and do not answer. There is nothing behind their eyes but the sea.', next: null },
      plain: { speaker: 'narrator', text: 'The outermost planks of the Brine Market, and the sea beyond.', next: null },
    },
  },
  {
    id: 'dialogue:corsair-dot-creditors', name: 'I-2 Dot on the pearl-price', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: DB, text: 'Pearls! Everyone wants pearls! Thirty years I’ve owed people perfectly good money and now money isn’t good enough for them. And the divers?',
        choices: [{ text: 'Empty. Smiling at the sea.', to: 'empty' }, { text: 'Every creditor in the market wants paying in pearls.', to: 'pearls' }],
      },
      empty: { speaker: DB, mood: 'sad', text: 'That’s what the pearls cost, then. You dive for somebody else’s tears and you come up a bit less every time. (She is quiet.) Right. Never mind my debts. Worse news.', next: 'vex' },
      pearls: { speaker: DB, text: 'And they won’t get them from me, because I haven’t got any, because I’ve got principles. Also no pearls. Never mind. Worse news.', next: 'vex' },
      vex: { speaker: DB, mood: 'angry', text: 'While you were behind the herring, Guildmaster Vex of the Thieves’ Exchange bought every scrap of my paper in one morning, called it all in, and towed the Overdraft off to his sea-fort. My ship. My home. My unpaid paintwork. We’re stealing her back. Tonight.', next: null },
    },
  },
  // ---------- I-3 Vex's Guildhold
  {
    id: 'dialogue:obj-overdraft-tow-line', name: 'I-3 the tow-line', scope: 'party',
    entries: [{ when: stage('quest:corsair-vexs-guildhold', 'line'), node: 'line' }, { node: 'plain' }],
    nodes: {
      line: {
        speaker: 'narrator', text: 'A tow-line as thick as your leg runs from the fort’s ring-bolt to the Overdraft’s bow. Vex’s ledger lies open on the rampart beside it, pages fluttering: every debt on Gallows Reef, in a tiny hand, and the cannon-shot beside each one is a black pearl.',
        choices: [
          { text: '(Cut the line.)', to: 'cut' },
          { text: '[Guile] (Cut the line, and take the ledger, and throw it in the sea.)', to: 'ledger', school: 'guile' },
        ],
      },
      cut: { speaker: 'narrator', text: 'Three strokes and the line parts with a crack. The Overdraft swings free on the tide and drifts away from the fort, slowly, magnificently, with you running along her deck to catch the wheel.', next: null },
      ledger: { speaker: 'narrator', text: 'Three strokes, and the line parts; one throw, and every debt on Gallows Reef goes down into the harbour, page by page, like gulls settling. The Overdraft swings free on the tide with you running for the wheel.', next: null },
      plain: { speaker: 'narrator', text: 'A cut tow-line hanging from the Guildhold’s ring-bolt.', next: null },
    },
  },
  {
    id: 'dialogue:corsair-dot-overdraft', name: 'I-3 the Overdraft comes home', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: DB, mood: 'happy', text: '(She runs her hand along the rail, very gently, the way you would stroke a cat.) There she is. There’s my girl. Not a scratch on her that wasn’t there before. Well done, sweetheart. I may even pay you.',
        choices: [{ text: 'May?', to: 'may' }, { text: 'Vex loaded his cannon with his debtors’ pearls.', to: 'pearls' }],
      },
      may: { speaker: DB, text: 'May. It’s a lovely word. It’s nearly a promise. Here, have this, it was in the captain’s cabin and it isn’t mine.', next: 'flag' },
      pearls: { speaker: DB, mood: 'afraid', text: 'His debtors’ pearls. Their grief, fired back at them. That’s the Exchange all over. Here, take this, it was in the cabin and it isn’t mine.', next: 'flag' },
      flag: { speaker: DB, text: '(Out past the reef, a white sail is coming in on the evening wind, the biggest ship you have ever seen.) Oh, now what. Who sails into Gallows Reef in white? It’s like wearing a wedding dress to a fight.', next: null },
    },
  },
  // ---------- I-4 The Pearl Admiral
  {
    id: 'dialogue:corsair-saltmarsh-flagship', name: 'I-4 the Admiral aboard his flagship', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: SA, text: '(A weathered man in white, with a black pearl in one ear, pours you a cup of something hot. The cabin smells of lavender.) You’re the Overdraft’s new hand. The one who took her back from Vex. Sit, sit. Drink. I’m Saltmarsh. I’ve just bought all of your captain’s debts.',
        choices: [
          { text: 'All of them?', to: 'all' },
          { text: 'What do you want with them?', to: 'want' },
        ],
      },
      all: { speaker: SA, text: 'All of them. It took an afternoon. She owes a great many people a great deal, and I owe nobody anything, which means I can afford to be generous.', next: 'want' },
      want: {
        speaker: SA, text: '(He takes a bundle of papers from his desk, and tears them in half, and drops them out of the window.) Nothing. They’re forgiven. Tell her she’s free. And tell her I have honest work for the Fleet, if the Fleet wants it, at an honest price.',
        choices: [
          { text: 'Nobody’s that generous.', to: 'generous' },
          { text: '[Guile] (Watch the pearl in his ear while he talks.)', to: 'pearl', school: 'guile' },
        ],
      },
      generous: { speaker: SA, text: 'I was a wharf-boy on this reef once, with nothing, not even a name worth having. Now I can afford anything. Even kindness. Especially kindness. It’s cheap, if you buy it in bulk.', next: 'end' },
      pearl: { speaker: 'narrator', text: 'When he says “forgiven”, the black pearl in his ear seems, for a moment, to catch the lamplight and grow. You blink, and it is only a pearl.', next: 'end' },
      end: { speaker: SA, text: 'Go and tell her. She’ll want to shout at somebody, and I’d rather it was you than me. Call on her creditors on the way, if you like. I paid them all this afternoon. They’ll want to tell you how.', next: null },
    },
  },
  {
    id: 'dialogue:corsair-dot-admiral', name: 'I-4 Dot on the forgiven debts', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: DB, mood: 'angry', text: 'FORGIVEN? Forgiven! Who asked him? Thirty years I’ve owed those debts! I’ve nursed them. I knew all their names. (She takes her hat off and throws it on the deck, and picks it up again at once, very carefully.)',
        choices: [
          { text: 'He offers the Fleet honest work.', to: 'work' },
          { text: 'Careful with the hat, Captain.', to: 'hat' },
        ],
      },
      hat: { speaker: DB, text: '(She puts it back on and pats the crown.) There’s more in this hat than hair. Never mind. What else did he say?', next: 'work' },
      work: { speaker: DB, text: 'Honest work. On Gallows Reef. (She snorts.) And now the Velvet Court’s sent letters of marque round the Fleet as well, to raid his barges legal. Everybody wants to buy the Fleet this week. The captains meet under the gibbets at sunset to argue about it. You’re coming. You hum. They’ll listen to somebody who hums.', next: null },
    },
  },
  // ---------- I-5 The Pearl Charter (the faction choice; a party vote)
  {
    id: 'dialogue:corsair-pearl-charter', name: 'I-5 the Fleet moot', scope: 'party',
    entries: [{ when: { not: { flag: 'corsair.charter' } }, node: 'gibbets' }, { node: 'after' }],
    nodes: {
      gibbets: { speaker: 'narrator', text: 'Sunset under the hat-gibbets, a hundred empty hats swinging overhead for a hundred lost captains. The free captains of the Brine Fleet sit on upturned boats. Saltmarsh’s charter is pinned to one post. The King’s letters of marque are pinned to another.', next: 'motion' },
      motion: { speaker: DB, text: 'Two offers. Carry the Admiral’s pearls, safe and paid. Or take the King’s marque and raid those same pearls, legal, for a cut. Either way somebody buys the Fleet. I’ve said my piece: a privateer at least chooses her targets.', next: 'admiral' },
      admiral: { speaker: SA, text: '(He stands at the back, in white, and the moot goes quiet.) I won’t make a speech. Carry my cargo and you will be paid on the day, every day, and nobody will ever buy your paper again, because I will own it. Kindly.', next: 'herald' },
      herald: { speaker: 'narrator', text: 'A Velvet Court herald in a damp tabard reads out the King’s letters of marque, in a voice that has clearly been told to sound confident: any free captain who signs may raid the Admiral’s barges, legally, for a royal cut of one third.', next: 'debate' },
      debate: { speaker: 'narrator', text: 'The moot argues. Merrin Tusk shouts that he’d rather be poor than owned. Netty Hawser shouts that she’d rather be paid than drowned. Salvage Sal tries to sell somebody a plank. Interest screams “COMPOUND!” until someone throws a biscuit.', next: 'ask' },
      ask: {
        speaker: DB, text: 'Our new hand has a question or two, by the look of them. Ask, then speak.',
        choices: [
          { text: 'Admiral, what happens to a captain who stops carrying for you?', to: 'stop' },
          { text: 'Captain Dot, what would your mother have done?', to: 'mother' },
          { text: '[Guile] (Count how many captains are watching the Admiral’s purse instead of his face.)', to: 'count', school: 'guile' },
        ],
      },
      stop: { speaker: SA, text: 'Nothing at all. They are free to go. (He smiles.) Nobody ever has, mind. Once you are paid on the day, every day, you forget how to want anything else.', next: 'choose' },
      mother: { speaker: DB, mood: 'happy', text: 'My mother? Sunk the charter-ship, stolen the marque and sold it back to the King. (A pause.) She also died owing everyone, so take that how you like.', next: 'choose' },
      count: { speaker: 'narrator', text: 'Nearly all of them. The Admiral sees you counting, and smiles at you the way a man smiles at a rival bidder.', next: 'choose' },
      choose: {
        speaker: DB, text: 'Well, sweetheart? What can’t be bought?',
        choices: [
          { text: 'Sign the charter. The Fleet’s been poor for thirty years. Let it be rich and safe for once.', to: 'signed', quest: true, trustNpc: DB, trust: -1, effects: [{ setFlag: 'corsair.charter', value: 'signed' }] },
          { text: 'Take the King’s marque. Raid his barges, legally, and choose our own targets.', to: 'marque', quest: true, effects: [{ setFlag: 'corsair.charter', value: 'marque' }] },
          { text: '(Read out Article One.) “No free captain may be bought, nor sold, nor sell another.” Neither, then.', to: 'free', quest: true, insight: 'article_read', when: { insight: 'first_article' }, effects: [{ setFlag: 'corsair.charter', value: 'free' }] },
        ],
      },
      signed: { speaker: SA, text: '(He signs at the head of the list, in a neat white hand, and the captains queue up behind him.) Thank you. You’ll never want for anything again. (Dot does not sign. She walks back to the Overdraft and does not look round.)', next: null },
      marque: { speaker: DB, mood: 'happy', text: 'Marque it is! Privateers! Legal, at last! My mother would be horrified. (She signs with a flourish.) The Fleet raids at dawn, and the Crown gets its cut, and the Admiral can whistle.', next: null },
      free: {
        speaker: 'narrator', text: 'The moot goes silent. Dot takes off her hat, turns it over, and holds up the rest of the old articles, sewn into its lining. One by one the captains stand up, and nobody signs anything. At the back, Saltmarsh smiles, very gently, and the pearl in his ear seems to swell.',
        next: null,
      },
      after: { speaker: DB, text: 'The Fleet’s chosen. Now we find out what it costs.', next: null },
    },
  },
  // ---------- I-6 The Wreck of the Merry Widow
  {
    id: 'dialogue:corsair-widow-fog', name: 'I-6 the Merry Widow in the fog', scope: 'party',
    entries: [
      { when: { flag: 'corsair.charter', value: 'signed' }, node: 'signed' },
      { when: { flag: 'corsair.charter', value: 'marque' }, node: 'marque' },
      { node: 'free' },
    ],
    nodes: {
      signed: { speaker: 'narrator', text: 'The false lights are out, and the Admiral’s pearl barges are safe behind you, which is your job now. Out of the fog ahead comes the Merry Widow, under black rags of sail, for the cargo you are paid to guard.', next: 'widow' },
      marque: { speaker: 'narrator', text: 'The false lights are out, and the pearl barges are drifting loose in the coves, legal prey under the King’s marque. Out of the fog comes the Merry Widow, under black rags of sail, racing you for them.', next: 'widow' },
      free: { speaker: 'narrator', text: 'The false lights are out. You have no charter and no marque, only the Overdraft and a bad feeling. Out of the fog comes the Merry Widow, under black rags of sail, for the pearl barges, and you are in her way.', next: 'widow' },
      widow: { speaker: 'narrator', text: 'She runs aground in the biggest cove with a groan you feel in your teeth. Her rigging drips black. Her crew stand at the rails, hollow-eyed, and among them is a captain with no face at all.', next: null },
    },
  },
  {
    id: 'dialogue:obj-false-lantern-3', name: 'I-6 the last false lantern', scope: 'party',
    entries: [{ when: stage('quest:corsair-the-merry-widow', 'lights'), node: 'light' }, { node: 'plain' }],
    nodes: {
      light: { speaker: 'narrator', text: 'The last false lantern burns with a cold pearl-light. Scratched into its brass foot, very small, is the mark of the lantern-hirer in the coves, and under it a little drawing of a flag. A white one.', next: null },
      plain: { speaker: 'narrator', text: 'A dead lantern on a cove rock.', next: null },
    },
  },
  {
    id: 'dialogue:obj-nobody-contract', name: 'I-6 Captain Nobody’s contract', scope: 'party',
    entries: [{ when: stage('quest:corsair-the-merry-widow', 'contract'), node: 'man' }, { node: 'plain' }],
    nodes: {
      man: { speaker: 'narrator', text: 'For a moment, kneeling on his own deck, Captain Nobody has a face: a young captain’s face, frightened and very tired. He holds out a paper with both hands, as if it were the only thing he had left. It is.', next: 'paper' },
      paper: { speaker: 'narrator', text: 'A contract, forty years old. “I sell my name, all of it, for a ship of my own. Signed: (a blank where a name was). Bought by: a wharf-boy of Gallows Reef, who has none.” Under that, in a boy’s laborious capitals, the name the boy took: SALTMARSH.', next: 'gone' },
      gone: { speaker: 'narrator', text: 'When you look up, the face is gone again, and the Merry Widow is only a wreck, and her crew are climbing down her sides into the shallows, blinking, as if waking.', next: null },
      plain: { speaker: 'narrator', text: 'The Merry Widow’s empty quarterdeck.', next: null },
    },
  },
  // ---------- I-7 What the Admiral Sells
  {
    id: 'dialogue:obj-crow-pearl-hoard', name: 'I-7 the Thief Crows’ hoard', scope: 'party',
    entries: [{ when: stage('quest:corsair-what-the-admiral-sells', 'hoard'), node: 'hoard' }, { node: 'plain' }],
    nodes: {
      hoard: { speaker: 'narrator', text: 'A Thief Crow’s nest the size of a rowing boat, built on a sea-stack, crammed with black pearls. Every pearl is stamped with a tiny white flag. The crows have been stealing them from somewhere, and that somewhere is directly below.', next: null },
      plain: { speaker: 'narrator', text: 'An empty crows’ nest on a sea-stack.', next: null },
    },
  },
  {
    id: 'dialogue:corsair-saltmarsh-huts', name: 'I-7 the Admiral at the grief-ration huts', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: SA, text: '(He is walking down the row of huts with a ledger, kindly collecting bowls. Every bowl has a black pearl in the bottom.) Ah. You found the Crow Islands. I hoped you wouldn’t. Grief rations. They weep, I pay them, they sleep. Nobody is hurt.',
        choices: [
          { text: 'You’re farming them.', to: 'farm' },
          { text: 'Captain Nobody sold his name to a wharf-boy. The name was Saltmarsh.', to: 'name', when: { flag: 'corsair.nobodys_name' } },
          { text: '“Do not let them heal.” That’s your ledger, in your ink.', to: 'heal', when: { flag: 'corsair.ration_ledger' } },
        ],
      },
      heal: { speaker: SA, text: '(He doesn’t deny it.) Healed people stop weeping. Then they are hungry, and frightened, and poor. I give them supper. Who else ever has?', next: 'farm' },
      name: { speaker: SA, mood: 'sad', text: '(He stops. For the first time he looks old.) I was nine. I had nothing. He had a name and wanted a ship. It was a fair trade. Everything I have, I bought fairly. Even me.', next: 'farm' },
      farm: {
        speaker: SA, text: 'The pearls hollow people, yes. Too many, too close. With the Reef half I could fix that: tears that don’t hollow. Grief, farmed safely, sold to all twelve realms when the gates open. Do you know how much grief there is in the world? I would never run out.',
        choices: [
          { text: 'The pearl in your ear grows when you lie.', to: 'pearl', insight: 'saltmarsh_pearl', when: { any: [{ flag: 'corsair.pearl_weeper' }, { flag: 'corsair.colley_payer' }, { flag: 'corsair.earring_seen' }, { trust: DB, value: 'trusted' }] } },
          { text: 'Nobody is hurt? Look at them.', to: 'look' },
        ],
      },
      pearl: { speaker: SA, mood: 'angry', text: '(His hand goes to his ear before he can stop it. The pearl is the size of a cherry now, and it was the size of a pea.) …It’s an old pearl. It does what it likes. (He turns away.) I’ll be at the Gallows tonight. I’ve paid for the Reef half already.', next: null },
      look: { speaker: SA, text: 'I have. I do. Every day. That’s why I want to make it safe. (He turns away.) I’ll be at the Gallows tonight. I’ve paid for the Reef half already. I always pay.', next: null },
    },
  },
  // ---------- I-8 The Gallows
  {
    id: 'dialogue:obj-guile-frontier-halfstone', name: 'I-8 the Reef half', scope: 'party',
    entries: [{ when: stage('quest:corsair-the-gallows', 'stone'), node: 'claim' }, { node: 'cage' }],
    nodes: {
      claim: { speaker: 'narrator', text: 'In the topmost cage of the Gallows, swinging over the rising sea, lies half a crystal, cracked clean across, singing. It sounds like a ship’s bell heard from a long way off, the way it sounds when you are nearly home.', next: 'tide' },
      tide: {
        speaker: 'narrator', text: 'Below you the tide is still rising, tier by tier, swallowing the lower cages one at a time. Every one of them has a hat in it now. The Fleet hung more than hats here, once.',
        choices: [
          { text: '(Ring the topmost cage like a bell.)', to: 'ring' },
          { text: '[Guile] (Take the stone, and leave a black pearl in its place.)', to: 'swap', school: 'guile' },
        ],
      },
      ring: { speaker: 'narrator', text: 'The cage rings like a ship’s bell, one clear note, and far below, all along the reef, the Fleet’s ships ring back one after another, the way they did on Bell night.', next: 'saltmarsh' },
      swap: { speaker: 'narrator', text: 'Old habits. You leave one black pearl in the empty cage, to keep the books straight. In there it looks like something waiting to be collected.', next: 'saltmarsh' },
      saltmarsh: {
        speaker: SA, text: '(From the water below, by his flagship, his voice carries up perfectly.) Keep it for me. I’ve paid for it. I’ll collect at the Pawned Gate. Everything gets collected in the end.',
        choices: [
          { text: 'Your name was Wenlock’s. Give it back.', to: 'name', when: { flag: 'corsair.nobody_named' } },
          { text: 'You can’t buy the sea, Saltmarsh.', to: 'sea' },
          { text: '(Let him go.)', to: null },
        ],
      },
      name: { speaker: SA, mood: 'sad', text: '(A long silence from the water.) I bought it fairly. I was nine. (Then, quieter, almost to himself.) Wenlock. I had forgotten how it sounded, said aloud.', next: null },
      sea: { speaker: SA, text: 'I don’t need to buy the sea. I only need to buy everyone who sails on it. (Below, the flagship’s anchor chain begins to rattle up.) Collect at the gate.', next: null },
      cage: { speaker: 'narrator', text: 'The topmost cage of the Gallows, empty, creaking in the wind.', next: null },
    },
  },
  // ---------- I-9 Dot's Reckoning (mentor farewell; trust check)
  {
    id: 'dialogue:corsair-dot-farewell', name: 'I-9 Dot’s reckoning', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: DB, text: '(She has the wheel in both hands and Interest on her shoulder.) So. He’s running for the water-arch, and you’ve got the stone, and I’ve got a ship. I’ll get you to the gate. After that, sweetheart, you’re on your own. I don’t do gates.',
        choices: [
          { text: 'Come through with me.', to: 'stay' },
          { text: 'You never did pay me, Captain. Thank you anyway. For all of it.', to: 'owe', trust: 1 },
        ],
      },
      stay: { speaker: DB, text: 'Through a gate into somewhere I don’t owe anybody? I’d go mad in a week. No. The Fleet needs somebody to owe it things.', next: 'owe' },
      owe: {
        speaker: DB, text: 'Do you know what I owe most, sweetheart? Not the sailmaker. Not the King. (She glances at the compass on her wrist.) Quill. A leg. You can’t pay back a leg.',
        choices: [
          { text: 'Have you asked him what he’d take?', to: 'asked' },
          { text: '[Guile] Then owe it him. Some debts are how you stay friends.', to: 'friends', school: 'guile' },
        ],
      },
      asked: { speaker: DB, mood: 'sad', text: 'Every year. He says nothing. He says it with his whole face. (She sniffs.) Never mind Quill.', next: 'gifts' },
      friends: { speaker: DB, mood: 'happy', text: '(She stares at you, then laughs so hard Interest falls off her shoulder.) Oh, that’s good. That’s Fleet. Some debts are how you stay friends. I’ll tell him that, and he’ll throw a net at me.', next: 'gifts' },
      gifts: {
        speaker: DB, text: 'Here. Before I come over sentimental and have to throw myself overboard.',
        choices: [
          { text: '(Take what she offers.)', to: 'compass', when: { trust: DB, value: 'friendly' } },
          { text: '(Shake her hand.)', to: 'hand', when: { not: { trust: DB, value: 'friendly' } } },
        ],
      },
      compass: { speaker: DB, text: 'My compass, on its old copper band. It doesn’t point north. It points at whatever you owe most. Mine’s pointed at Barnaby Quill for twenty years. See where yours goes.', effects: [{ giveItem: 'i_dot_compass' }, { setFlag: 'corsair.dot_compass', value: true }, { setFlag: 'corsair.dot_farewell', value: true }], next: 'interest' },
      interest: {
        speaker: DB, mood: 'sad', text: '(Interest walks down her arm onto yours, and looks at you, and says “PAY UP” very quietly.) Ah. Well. He’s decided. He compounds, mind. Every day you keep him, you owe him more.',
        choices: [
          { text: 'I’ll pay him back with interest.', to: 'end', when: { trust: DB, value: 'trusted' }, effects: [{ setFlag: 'corsair.interest_pet', value: true }] },
          { text: 'He’s yours, Dot. He stays with you.', to: 'end' },
        ],
      },
      hand: { speaker: DB, text: 'Mind the King. Mind the Admiral. Mind the water-arch, it’s shallow on the left. And don’t sell anything you can’t buy back.', effects: [{ setFlag: 'corsair.dot_farewell', value: true }], next: 'blockade' },
      end: { speaker: DB, text: 'Right. Enough of that.', next: 'blockade' },
      blockade: {
        speaker: DB, text: '(Ahead, across the channel, a line of boats.) And there’s our trouble.',
        choices: [
          { text: 'Saltmarsh’s barges, come to turn us back.', to: 'barges', when: { flag: 'corsair.charter', value: 'signed' } },
          { text: 'The King’s customs cutters.', to: 'cutters', when: { flag: 'corsair.charter', value: 'marque' } },
          { text: 'Whoever they are, they’re in the way.', to: 'way', when: { flag: 'corsair.charter', value: 'free' } },
        ],
      },
      barges: { speaker: DB, mood: 'angry', text: 'The Fleet signed his charter, and now his barges think they own the channel. Well, they don’t own me. Boarders away!', next: null },
      cutters: { speaker: DB, mood: 'angry', text: 'Customs! Wanting their cut of a privateer’s last run. Well, they can have it, in the teeth. Boarders away!', next: null },
      way: { speaker: DB, mood: 'happy', text: 'Free captains, the lot of us, and everyone wants a piece. Lovely. Boarders away!', next: null },
    },
  },
  // ---------- I-6 the fight's set piece (ARENA_HAZARDS §5): Captain Nobody can't be struck until corsair.nobody_named.
  // He sold his name, "all of it", but the people who loved him kept the one they called him by: Wenlock.
  {
    id: 'dialogue:obj-corsair-widow-bell', name: 'I-6 the Merry Widow’s bell', scope: 'party',
    entries: [{ when: FIGHT, node: 'bell' }, { node: 'plain' }],
    nodes: {
      bell: { speaker: 'narrator', text: 'The ship’s bell, green with forty years of sea. Somebody has scratched round the rim, the way sailors do for luck: “Wen’s bell. Ring it twice for supper.”', effects: [{ setFlag: 'corsair.clue_bell', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'A ship’s bell, green with the sea.', next: null },
    },
  },
  {
    id: 'dialogue:obj-corsair-widow-log', name: 'I-6 the Merry Widow’s log', scope: 'party',
    entries: [{ when: FIGHT, node: 'log' }, { node: 'plain' }],
    nodes: {
      log: { speaker: 'narrator', text: 'The log, swollen with seawater. Every master’s name has been scraped out of it, page after page. Except one, in the cook’s hand, in the margin of a supper list: “Lock says no more eels.”', effects: [{ setFlag: 'corsair.clue_log', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'A swollen ship’s log with every name scraped out.', next: null },
    },
  },
  {
    id: 'dialogue:obj-corsair-widow-letter', name: 'I-6 the letter in the Merry Widow’s cabin', scope: 'party',
    entries: [{ when: FIGHT, node: 'letter' }, { node: 'plain' }],
    nodes: {
      letter: { speaker: 'narrator', text: 'A letter, never sent, pinned under the cabin lamp. “Dear Mam. I have a ship. She is mine. I sold something for her, but not the name you gave me, I don’t think. Your loving son, W—” The rest has run in the wet.', effects: [{ setFlag: 'corsair.clue_letter', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'A letter pinned under a cabin lamp, the ink long run.', next: null },
    },
  },
  {
    id: 'dialogue:obj-corsair-widow-wheel', name: 'I-6 the Merry Widow’s wheel: calling Captain Nobody by name', scope: 'party',
    entries: [
      { when: { all: [FIGHT, { not: { flag: 'corsair.nobody_named' } }, { flag: 'corsair.clue_bell' }, { flag: 'corsair.clue_log' }, { flag: 'corsair.clue_letter' }] }, node: 'call' },
      { when: { all: [FIGHT, { not: { flag: 'corsair.nobody_named' } }] }, node: 'unknown' },
      { node: 'plain' },
    ],
    nodes: {
      call: {
        speaker: 'narrator', text: 'The faceless captain drifts past the wheel with his lantern, and the dark moves with him. Wen. Lock. W—. Not the name he sold. The one his mother gave him, that his crew wore smooth.',
        choices: [
          { text: '(Shout it across the deck.) Wenlock!', to: 'named', quest: true, effects: [{ setFlag: 'corsair.nobody_named', value: true }] },
          { text: '(Not yet.)', to: null },
        ],
      },
      named: { speaker: 'narrator', text: 'He stops. For one breath the lantern shows a face: young, tired, astonished that anyone remembers. Then it is gone again, but now he has edges, and edges can be struck.', next: null },
      unknown: { speaker: 'narrator', text: 'Your blade passes through the captain like fog through rigging. You cannot strike a man with no name. Somewhere on this wreck, somebody wrote down what they called him.', next: null },
      plain: { speaker: 'narrator', text: 'The Merry Widow’s wheel, lashed and rotten.', next: null },
    },
  },
];

export default dialogues;
