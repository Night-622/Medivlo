/** Dialogue: Act I Ch1, Harrow (quest:a-queen-in-winter), quest:the-quiet-hand, Kingsvale ambient. Owner: Claude 4. */
import type { DialogueDef, NarrativeEffect } from '@/core';

const Q2 = 'quest:a-queen-in-winter' as const, Q3 = 'quest:the-quiet-hand' as const;
const at = (quest: `quest:${string}`, stage: string) => ({ questStage: quest, stage });
const O = 'npc:osric-harrow' as const, S = 'npc:sable' as const, P = 'npc:prior-benedek' as const;
const TAKE: NarrativeEffect[] = [
  { setFlag: 'act1.wick_ledger_taken', value: true },
  { giveItem: 'item:wick-ledger' },
  { unlockLore: 'lore:wick-licence' },
];

const dialogues: DialogueDef[] = [
  // ----- quest:a-queen-in-winter (harrow stage)
  {
    id: 'dialogue:harrow-first', name: 'Harrow: A word in private',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'Lord Harrow’s solar is the only warm room in the Keep. Maps of Greywater cover the table, weighted with daggers. A letter lies face-down beside the inkwell.', next: 'wine' },
      wine: {
        speaker: O,
        text: 'Sit. Wine? It is Solenni, and very poor, and the last of it. (He pours for you regardless.) I held the line at Ashby Ford when the Hrothi came south. There are songs. They leave out how many I buried.',
        next: 'measure',
      },
      measure: {
        speaker: O,
        text: 'So I know what an army costs, and I know what the Emberwarden is asking our Queen to spend. Tell me honestly, then. What are you?',
        choices: [
          { text: '"A villager with a burned hand who has seen too many drowned faces."', to: 'honest' },
          { text: '"The one who can take Varn back."', to: 'boast' },
          { text: '[Intellect 15] (Study the letter by the inkwell. Its seal is the wrong colour.)', to: 'notice', once: true, tag: 'lore', check: { stat: 'intellect', dc: 15, failTo: 'notice-fail' } },
          { text: '[Shade] (Watch his hand move to cover the letter before he has decided to.)', to: 'notice', when: { classIs: 'class:shade' }, tag: 'class' },
        ],
      },
      honest: { speaker: O, text: 'Good. Honest men are rare at court, and useful, and they die young. Let me see if I can spare you the last.', next: 'table' },
      boast: { speaker: O, text: 'Mm. Many have told me that about many towns. Some were right. Most of them are under the turf at Ashby Ford.', next: 'table' },
      notice: {
        speaker: 'narrator', effects: [{ setFlag: 'act1.harrow_suspected', value: true }],
        text: 'You glimpse it a moment before his sleeve covers it: the wax is not the Crown’s red, nor the Church’s gold, but a dull green-black, the colour of water under reeds. He sees you see it, and smiles.',
        next: 'table',
      },
      'notice-fail': { speaker: 'narrator', text: 'There is a letter by the inkwell, but the light is poor, and Harrow is watching your face rather than the table.', next: 'table' },
      table: { speaker: O, text: 'I will tell you what I have told no one else in this Keep. I do not think Varn can be retaken. Not this winter. Perhaps not ever. And I think there are worse things than losing a town.', next: 'table2' },
      table2: {
        speaker: O,
        text: 'Some wars are better ended at a table than in a marsh. The Choir want something. Everyone wants something. If what they want costs less than ten thousand dead Haldishmen, I would hear the price.',
        choices: [
          { text: '"You would bargain with the people who drowned Varn?"', to: 'sword', effects: [{ setFlag: 'act1.harrow_view', value: 'sword' }] },
          { text: '"There may be sense in that. If the price is right."', to: 'sense', effects: [{ setFlag: 'act1.harrow_view', value: 'table' }] },
          { text: '[Will 15] "You’re not asking me, my lord. You’re telling me you have already begun."', to: 'probe', once: true, tag: 'intimidate', check: { stat: 'will', dc: 15, failTo: 'probe-fail' } },
        ],
      },
      sword: { speaker: O, text: 'I would bargain with the Drowned Spark itself if it brought my people to spring. That is what a Lord Protector is for. The Queen has the luxury of being good. I do not.', next: 'dismiss' },
      sense: { speaker: O, mood: 'happy', effects: [{ setFlag: 'npc.osric-harrow.favour', value: true }], text: 'Ah. Someone in this city who can count. How refreshing.', next: 'dismiss' },
      'probe-fail': { speaker: O, text: '(He smiles, quite unbothered.) You mistake me. I am a soldier thinking aloud, and soldiers think all manner of things.', next: 'dismiss' },
      probe: {
        speaker: O, mood: 'angry', effects: [{ setFlag: 'act1.harrow_suspected', value: true }, { setFlag: 'act1.harrow_view', value: 'sword' }],
        text: '(For a moment the courtesy goes out of his face, and what is beneath it is steel.) You have a good ear. Keep what it hears to yourself, and we shall be friends. Do not, and we shall still be courteous.',
        next: 'dismiss',
      },
      dismiss: {
        speaker: O,
        text: 'Go and open your doors, then: the Thornwise, the Orrun, the Grey Monks. If you can make the dead and the deepwood fight for Haldren, I will kneel to you myself. And if you cannot, come back to me, and we shall talk about tables.',
      },
    },
  },
  // ----- quest:the-quiet-hand
  {
    id: 'dialogue:ch1-sable-market', name: 'Sable: The purse (bark)', bark: true,
    entries: [{ node: 'n' }],
    nodes: {
      n: {
        speaker: S, effects: [{ setFlag: 'npc.sable.met', value: true }, { startQuest: Q3 }],
        text: 'You dropped your purse, friend. You didn’t, I took it, but I’m giving it back, so now we’re friends. Come and find me under the Tanners’ Steps. Ask for Sable.',
      },
    },
  },
  {
    id: 'dialogue:sable-den', name: 'Sable: The Quiet Hand',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'narrator',
        text: 'Beneath the Tanners’ Steps an old drain opens into a vaulted cellar that was a chapel once, before the city was built over it. Unlicensed lanterns. Stolen carpets. A dozen people at dice, who stop when you come in. On a broken altar sits a young woman with cropped red hair, swinging her heels and eating an apple.',
        next: 'sable',
      },
      sable: {
        speaker: S, mood: 'happy',
        text: 'You came! I said to Cobb, they’ll come, they’ve an honest face, and honest faces always come back for their purses. Cobb owes me a penny. Sit, sit. Mind the carpet, it was a bishop’s.',
        next: 'hand',
      },
      hand: {
        speaker: S, effects: [{ unlockLore: 'lore:the-quiet-hand' }],
        text: 'Now. You’re the one with the hand. Don’t look at the door, love, nobody here will sell you to the Wick. We’re the Quiet Hand. Selling folk to the Wick is the one thing we don’t do.',
        choices: [
          { text: 'How did you know about my hand?', to: 'how', once: true },
          { text: '[Shade] (Answer with the Hand’s sign: two fingers folded, thumb across.)', to: 'kin', when: { classIs: 'class:shade' }, tag: 'class' },
          { text: 'What do you want from me?', to: 'want' },
        ],
      },
      how: {
        speaker: S,
        text: 'You kept your glove on at the gate, under the Wick’s nose. Nobody keeps a glove on at that gate unless there’s something under it. That, or chilblains, and you don’t walk like the chilblains sort.',
        next: 'want',
      },
      kin: {
        speaker: S, mood: 'happy', effects: [{ setFlag: 'npc.sable.kin', value: true }, { loyalty: S, delta: 5 }],
        text: 'Oh! One of ours! Which den, Brackhaven? No, don’t tell me, it’s rude to ask. Well, that saves us a deal of trust-building, doesn’t it?',
        next: 'want',
      },
      want: {
        speaker: S,
        text: 'Simple. The Wick keeps a ledger. Every soul they’ve marked, every name they’ve carted to Valcastre, every village that informed. It’s in the cathedral vestry, in the Prior’s press, because they think nobody would rob a cathedral.',
        next: 'want2',
      },
      want2: {
        speaker: S,
        text: 'We would. With that book the Hand can warn the families and move folk before the cart comes. Without it we’re guessing, and when we guess wrong someone goes south. I’d do it myself, but the Prior knows my face. Long story. There’s a candlestick in it.',
        next: 'offer',
      },
      offer: {
        speaker: S, text: 'So?',
        choices: [
          { text: 'I’ll do it.', to: 'yes' },
          { text: '[Will 15] "And what does the Hand pay for a cathedral burglary?"', to: 'haggle', once: true, tag: 'persuade', check: { stat: 'will', dc: 15, failTo: 'haggle-fail' } },
          { text: '[Intellect 15] "That isn’t the whole reason. Why do you really want it?"', to: 'why', once: true, check: { stat: 'intellect', dc: 15, failTo: 'why-fail' } },
        ],
      },
      haggle: { speaker: S, mood: 'happy', effects: [{ setFlag: 'npc.sable.haggled', value: true }], text: 'Ha! Forty silver and my undying affection. The affection’s worth more, but you’ll not get a better offer.', next: 'yes' },
      'haggle-fail': { speaker: S, text: 'Pay? Love, I gave you your purse back. That was the payment.', next: 'offer' },
      'why-fail': { speaker: S, mood: 'happy', text: 'Because I’m a public-spirited citizen. Next question.', next: 'offer' },
      why: {
        speaker: S, mood: 'hollow', effects: [{ setFlag: 'npc.sable.suspected', value: true }],
        text: 'Families. Carts. I told you. (Her grin goes a little too wide.) …And maybe I want to know who’s in it. Everyone in Haldren wants to know who’s in it. (She rubs one eye hard with the heel of her hand.) Smoke in here. Terrible smoke.',
        next: 'offer',
      },
      yes: {
        speaker: S, mood: 'happy',
        text: 'Lovely. Vestry’s off the north aisle. The Prior’s fussy but kind, and he’s been frightened of his own shadow since the Lord-Inquisitor wrote to him. Distract him, or be quick, or be clever. All three, if you’re showing off.',
      },
    },
  },
  {
    id: 'dialogue:ch1-sable-waiting', name: 'Sable: Waiting',
    entries: [{ node: 'n' }],
    nodes: { n: { speaker: S, text: 'Vestry. North aisle. The Prior’s press. Go at the evening bell, when the Wick changes its guard and the Prior has his soup.' } },
  },
  {
    id: 'dialogue:obj-wick-ledger', name: 'Object: the Wick’s ledger',
    entries: [
      { when: { flag: 'act1.wick_ledger_taken' }, node: 'empty' },
      { when: at(Q3, 'ledger'), node: 'press' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'narrator', text: 'A locked oak press in the cathedral vestry, carved with the Wick’s scissors and candle. The Prior’s spectacles sit on top of it.' },
      empty: { speaker: 'narrator', text: 'The Wick’s press stands locked again, a little lighter than it was.' },
      press: {
        speaker: 'narrator',
        text: 'The vestry smells of beeswax and wet wool. The press stands against the far wall, black oak banded with iron, scissors and candle carved on its doors. Through the door to the nave you can hear Prior Benedek fretting at a sacristan about the price of tallow.',
        choices: [
          { text: '[Shade] (Slip the lock with a bent pin, the way the Quiet Hand teaches.)', to: 'pick', when: { classIs: 'class:shade' }, tag: 'class' },
          { text: '[Finesse 15] (Wait until the Prior turns his back, and work the lock quickly.)', to: 'pick', once: true, check: { stat: 'finesse', dc: 15, failTo: 'caught' } },
          { text: '[Scholar] (Ask the Prior about a disputed reading in the Charter of 870. He’ll be an hour at least.)', to: 'scholar', when: { dialogueTag: 'scholar' }, tag: 'trait' },
          { text: '(Go out to the Prior and ask to see the Charter rolls in the library.)', to: 'distract' },
          { text: 'Leave it.', to: null, tag: 'leave' },
        ],
      },
      pick: {
        speaker: 'narrator', effects: TAKE,
        text: 'The lock gives with a click no louder than a beetle. Inside, among the candle-tallies, lies a thick ledger bound in black calf, its pages ruled in red. You slide it under your coat.',
        next: 'read',
      },
      scholar: {
        speaker: P, mood: 'happy', effects: [{ unlockLore: 'lore:charter-of-haldren' }],
        text: 'The ninth clause? Oh, my dear, my dear, nobody has asked me about the ninth clause in twenty years! There are three readings, and two of them are heresy, and the third is mine. Wait here. Touch nothing. I shall fetch the Aurevine gloss.',
        next: 'alone',
      },
      distract: { speaker: P, text: 'The rolls? The Charter rolls? Nobody asks for those, nobody. Come, they’re up in the— no, wait here, the library stair is dreadful. I shan’t be a moment.', next: 'alone2' },
      alone: { speaker: 'narrator', effects: TAKE, text: 'He bustles off up the stair with a candle, talking happily to himself. The press has a simple lock and you have a knife. When he returns, puffing, with an armful of vellum, the ledger is under your coat and you are admiring the windows.', next: 'read' },
      alone2: {
        speaker: 'narrator', effects: [...TAKE, { setFlag: 'npc.prior-benedek.deceived', value: true }],
        text: 'He hurries away up the stair. The press has a simple lock and you have a knife. When he comes back with the rolls, you are looking at the windows and the ledger is under your coat. He glances once at the press, and then, very carefully, does not glance at it again.',
        next: 'read',
      },
      caught: {
        speaker: 'narrator',
        text: 'The lock is stiffer than it looked. You are still working at it when a voice behind you says, very faintly, "Oh, dear." Prior Benedek stands in the doorway with a candle in his hand.',
        next: 'caught2',
      },
      caught2: {
        speaker: P, mood: 'afraid',
        text: 'You are robbing the Wick. In my vestry. In my— (He looks over his shoulder at the empty nave. Then, astonishingly, he takes a key from his belt and holds it out.) Take it, and I never saw you, and Ithren forgive me. Three of my own parish went south in that book. A cooper, and two of his children.',
        next: 'caught3',
      },
      caught3: {
        speaker: P, effects: [...TAKE, { setFlag: 'npc.prior-benedek.complicit', value: true }],
        text: 'If the Lord-Inquisitor ever learns of this I shall be burned in my own nave. So please, I beg you. Do not be caught with it.',
        next: 'read',
      },
      read: {
        speaker: 'narrator',
        text: 'Later, by a guttering lamp, you turn the pages. Hundreds of names, and by each a village and a crime: unlicensed ember, Mire-taint, harbouring, suspicion. Many end in the same word, written in red: VALCASTRE. The Order’s fortress in the south, where the marked are held to be examined.',
        choices: [
          { text: '[Look for Brindlecross]', to: 'anselm', when: { flag: 'prologue.anselm_betrayed' } },
          { text: '[Look for Brindlecross]', to: 'hale', when: { all: [{ not: { flag: 'prologue.anselm_betrayed' } }, { flag: 'npc.garrick-hale.let_go' }] } },
          { text: '[Look for Brindlecross]', to: 'self', when: { all: [{ not: { flag: 'prologue.anselm_betrayed' } }, { not: { flag: 'npc.garrick-hale.let_go' } }] } },
        ],
      },
      anselm: {
        speaker: 'narrator', mood: 'sad', effects: [{ setFlag: 'act1.anselm_in_ledger', value: true }],
        text: '"Brindlecross, Aldermoor. Anselm Pryde, priest. Heretic books (Emberwarden). Informed against by the Ashmarked. Removed to Valcastre for examination." Beneath, in a tidier and colder hand: "Keep him alive. He may be useful. C.V."',
      },
      hale: {
        speaker: 'narrator',
        text: '"Brindlecross, Aldermoor. The Ashmarked." A description follows, accurate to the scar. Beside it, Hale’s "presumed dead", and beside that, in a tidier and colder hand, one word: "No." And beneath: "Not to be harmed. To be brought to me. C.V."',
      },
      self: { speaker: 'narrator', text: '"Brindlecross, Aldermoor. The Ashmarked." A description follows, accurate to the scar. Beneath it, in a tidier and colder hand: "Not to be harmed. To be brought to me. C.V."' },
    },
  },
  {
    id: 'dialogue:sable-return', name: 'Sable: The ledger',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: S, mood: 'happy', text: 'You’re alive! And not on fire! Give it here, give it— (She takes the ledger and turns the pages so fast they tear.)', next: 'read' },
      read: {
        speaker: 'narrator',
        text: 'She runs a finger down the columns, lips moving. Tanners’ Row. She stops. You read it upside down: "Girl, about twenty, red hair, Quiet Hand. Black at the eyes. Suspected Mire-taint. To be taken at the next sweep."',
        next: 'laugh',
      },
      laugh: {
        speaker: S, mood: 'hollow',
        text: 'Ha! "Black at the eyes." That’s soot, that is. I sweep chimneys when trade is slow. (She laughs, and turns her face away, and wipes her cheek with her sleeve. The sleeve comes away with a smear on it, dark as ink.)',
        choices: [
          { text: '"Sable. Your eyes."', to: 'eyes' },
          { text: '[Hollow-touched] (You know that stain. You saw it on the drowned faithful of Wennamere.)', to: 'hollow', when: { dialogueTag: 'hollow-touched' }, tag: 'trait' },
          { text: '[Will 15] (Say nothing. Hold her gaze, and let her decide whether to tell you.)', to: 'hollow', once: true, check: { stat: 'will', dc: 15, failTo: 'silent' } },
          { text: '(Look away, and let her keep her secret.)', to: 'silent' },
        ],
      },
      eyes: { speaker: S, effects: [{ setFlag: 'npc.sable.tear_seen', value: true }], text: '(Brightly.) My eyes are lovely, thank you, everyone says so. (A pause. Quieter.) Don’t. Please. Not today.', next: 'join' },
      hollow: {
        speaker: S, mood: 'sad', effects: [{ setFlag: 'npc.sable.tear_seen', value: true }, { setFlag: 'npc.sable.confided', value: true }, { loyalty: S, delta: 10 }],
        text: '…You know what it is. Course you do, you’ve the hand. It started at Lanternmass, a little, in the mornings. I don’t want to go in the water. I don’t hear singing. Much. Can you— no. Don’t tell me. If you can’t, I don’t want to know.',
        next: 'join',
      },
      silent: {
        speaker: 'narrator', effects: [{ loyalty: S, delta: 5 }],
        text: 'You look at the lamp instead. Sable folds the ledger, and her hands are quite steady, and she does not thank you, which is how you know she noticed.',
        next: 'join',
      },
      join: {
        speaker: S,
        text: 'Right! The Hand will have every family on this list warned by Lanternmass. Some will thank you, and most will never know your name, which is the best sort of thanks. I’ll have the book copied tonight and back in your pack by morning. You’ll want it, if you ever go to Valcastre.',
        next: 'join2',
      },
      join2: {
        speaker: S,
        text: '(She hops down off the altar.) You’re going to Varn, everyone says. Varn’s full of locks, and the Choir has the keys. You’ll want a thief.',
        choices: [
          { text: '"Come, then."', to: 'yes', when: { not: { flag: 'npc.sable.haggled' } } },
          { text: '"Come, then. And I’ll have my forty silver."', to: 'pay', when: { flag: 'npc.sable.haggled' } },
          { text: '"It will be dangerous."', to: 'danger', once: true },
        ],
      },
      danger: { speaker: S, text: 'Love, I’ve just read my own description in the Wick’s ledger. Dangerous is staying here.', next: 'join2' },
      pay: { speaker: S, effects: [{ giveGold: 40 }], text: '(She counts it into your palm, coin by coin, with great ceremony.) Thirty-eight, thirty-nine… forty. My undying affection you’ll have to take on credit.', next: 'yes' },
      yes: { speaker: S, mood: 'happy', text: 'Lovely! I’ll fetch my good knives.' },
    },
  },
  {
    id: 'dialogue:ch1-sable-general', name: 'Sable: General',
    entries: [{ node: 'n' }],
    nodes: { n: { speaker: S, mood: 'happy', text: 'Haldren in winter. Everyone’s pockets are empty. It’s very discouraging for an honest thief.' } },
  },
  // ----- Kingsvale ambient
  {
    id: 'dialogue:ch1-aldith-general', name: 'Aldith: General',
    entries: [{ when: { flag: 'act1.sworn_to_aldith' }, node: 'sworn' }, { node: 'n' }],
    nodes: {
      n: { speaker: 'npc:queen-aldith', text: 'We have a war council at the eleventh bell, a famine council at the twelfth, and a funeral at the first. Be brief, please.' },
      sworn: { speaker: 'npc:queen-aldith', mood: 'happy', text: 'Our sworn sword. (She almost smiles.) A Queen’s champion should be given a cloak, we are told. We have none to spare. You must make do with our regard.' },
    },
  },
  {
    id: 'dialogue:ch1-harrow-general', name: 'Harrow: General',
    entries: [{ node: 'n' }],
    nodes: { n: { speaker: O, text: 'Every door you open is a door I must guard afterwards. Do carry on.' } },
  },
  {
    id: 'dialogue:ch1-bryce-general', name: 'Bryce: General',
    entries: [{ when: { flag: 'act1.gate_passed' }, node: 'after' }, { node: 'n' }],
    nodes: {
      n: { speaker: 'npc:bryce-aldmere', text: 'Gate’s a sieve and a cattle-pen both. If you’ve come for sense, try the tavern.' },
      after: {
        speaker: 'npc:bryce-aldmere', text: '(He nods at your hand.) Glove still on? Good. Keep it.',
        choices: [
          { text: 'Why do you let the Wick stay on your gate?', to: 'why', once: true },
          { text: 'Seven keep you, Ser Bryce.', to: null, tag: 'leave' },
        ],
      },
      why: { speaker: 'npc:bryce-aldmere', mood: 'angry', text: 'Because the Lord Protector signed a paper, and I’m a knight, and knights do what papers say. I tell my lads what I’ll tell you. A man can obey and still spit.' },
    },
  },
  {
    id: 'dialogue:ch1-corin-general', name: 'Corin: Hearth-knots',
    entries: [{ node: 'n' }],
    nodes: { n: { speaker: 'npc:corin-vale', mood: 'happy', text: 'Hearth-knots! Warm your house, warm your heart! (He drops his voice.) Not licensed, mind. Don’t tell.' } },
  },
  {
    id: 'dialogue:ch1-benedek-general', name: 'Benedek: The cathedral',
    entries: [
      { when: { all: [{ flag: 'npc.prior-benedek.licence_questioned' }, { not: { flag: 'npc.prior-benedek.licence_talked' } }] }, node: 'licence' },
      { when: { flag: 'npc.prior-benedek.complicit' }, node: 'complicit' },
      { node: 'n' },
    ],
    nodes: {
      n: {
        speaker: P,
        text: 'Welcome, welcome. Mind the third step, it is cracked, and the candles, I am afraid, are rationed. One in seven! We light one in seven. The saints would weep.',
        choices: [
          { text: 'You seem frightened, Prior.', to: 'afraid', once: true },
          { text: 'Lux manet, Prior.', to: null, tag: 'leave' },
        ],
      },
      afraid: {
        speaker: P, mood: 'afraid',
        text: 'Frightened? I am a Prior of the Lanternate in the Long Winter, with a Wick envoy in my vestry and a letter from the Lord-Inquisitor in my desk that I have not dared open for nine days. Of course I am frightened. Do have a candle. Well. Not a whole one.',
      },
      complicit: { speaker: P, mood: 'sad', text: '(He will not quite meet your eye.) I have said a great many prayers this week. None has been answered, which is, I am told, a sign of grace.' },
      licence: {
        speaker: P, mood: 'angry',
        text: 'You. You are the one with my licence! Don’t deny it, the Wick’s clerk brought it to me, waving it about. My name! My hand, he said! I have never written so badly in my life.',
        next: 'licence2',
      },
      licence2: {
        speaker: P, effects: [{ setFlag: 'npc.prior-benedek.licence_talked', value: true }],
        text: '…I told him it was mine. (He looks at his own hands as though they had betrayed him.) I don’t know why. I suppose I am tired of watching carts go south. Whoever forged it, tell him to practise his capitals.',
        choices: [
          { text: '"His name is Anselm Pryde."', to: 'anselm', when: { flag: 'prologue.forged_licence' } },
          { text: 'I’ll tell him.', to: null },
        ],
      },
      anselm: { speaker: P, mood: 'happy', text: 'Pryde? Anselm Pryde? We were novices together at Solenne! He was dreadful at capitals even then. (His face falls.) Oh, the poor fool. Tell him I said so. Tell him kindly.' },
    },
  },
  {
    id: 'dialogue:ch1-goody-marl', name: 'Goody Marl: The refugee camp',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'Beneath Haldren’s walls the refugee camp is a town of rag tents and cook-smoke under the snow. An old woman sits on an upturned eel-trap, mending a net no one will use.', next: 'marl' },
      marl: {
        speaker: 'npc:goody-marl',
        text: 'Sit down, sit down. No chairs, sit on the snow like everybody. Marl. Goody Marl, of Fenwick, that’s on the stilts, out past Varn. Or it was.',
        choices: [
          { text: 'What happened at Varn?', to: 'varn', once: true },
          { text: 'Why did you leave Fenwick?', to: 'fenwick', once: true },
          { text: '[Outlander] "I’m a stranger to the fen. What do your people say about the Choir?"', to: 'choir', when: { dialogueTag: 'outlander' }, tag: 'trait', once: true },
          { text: 'Keep warm, Goody.', to: null, tag: 'leave' },
        ],
      },
      varn: {
        speaker: 'npc:goody-marl', effects: [{ unlockLore: 'lore:varn' }],
        text: 'Night the stars fell, Lord Aldwin opened the floodgates himself. Stood on the wheel and wound it with his own two hands. The sea came up the river and the marsh came in after it, and half the town drowned in their beds. The other half got up again after.',
        next: 'varn2',
      },
      varn2: {
        speaker: 'npc:goody-marl', mood: 'afraid', effects: [{ unlockLore: 'lore:the-grey-lung' }],
        text: 'There’s lights in the Lord’s hall of a night. My cousin rowed close. Saw Lady Varn at the window, he said, and the little girl beside her, and them both in the churchyard since the Grey Lung. Dancing, they were.',
        next: 'marl',
      },
      fenwick: {
        speaker: 'npc:goody-marl', mood: 'sad', effects: [{ unlockLore: 'lore:fenwick' }],
        text: 'Fenwick pays the Choir. A tithe of eels, and a tithe of young ones for the singing. Not to kill, love, to sing. They come home after. Different. My Aldo went to sing and came home with black water in his eyes and walked into the reeds. So I left. Agna Fenn keeps the village dry, she says. She’s a hard woman. She isn’t wrong.',
        next: 'marl',
      },
      choir: {
        speaker: 'npc:goody-marl',
        text: 'They say it softly, like a mother at a cradle. "Ooluun ae Nhal." Below is Nhal. They say there’s no cold down there and no hunger, and nobody you love is dead. (She knots the net.) It’s the kindest thing anyone’s offered the fen in a hundred years. That’s what frightens me.',
        next: 'marl',
      },
    },
  },
  // ----- existing NPCs (routes listed in the Claude 4 report for aldermoor.ts)
  {
    id: 'dialogue:ch1-hesta-cinderhold', name: 'Hesta: Cinderhold',
    entries: [{ when: { questActive: Q2 }, node: 'court' }, { node: 'n' }],
    nodes: {
      court: { speaker: 'npc:hesta-corrow', text: 'Haldren’s a day down the King’s Way. Glove on, head down, and don’t argue with anyone carrying scissors.' },
      n: { speaker: 'npc:hesta-corrow', text: 'The fire’s holding. So am I, more or less. (She coughs ash into her sleeve.) Go on. The Embers won’t find themselves.' },
    },
  },
  {
    id: 'dialogue:ch1-anselm-cinderhold', name: 'Anselm: The Primer comes home',
    entries: [{ when: { not: { flag: 'npc.anselm-pryde.came_cinderhold' } }, node: 'arrive' }, { node: 'n' }],
    nodes: {
      arrive: {
        speaker: 'npc:anselm-pryde', mood: 'happy',
        text: 'I walked. All the way from Brindlecross, in these shoes. (He holds up the red book with the ember in an open hand.) I brought the Primer. It belongs here more than behind my altar. I think it always did.',
        choices: [
          { text: '"Stay. Cinderhold needs a scholar."', to: 'stay', effects: [{ loyalty: 'npc:anselm-pryde', delta: 5 }] },
          { text: '"The Church will burn you for this, Brother."', to: 'burn' },
        ],
      },
      stay: { speaker: 'npc:anselm-pryde', effects: [{ setFlag: 'npc.anselm-pryde.came_cinderhold', value: true }], text: 'Then I shall stay, and read, and keep out of Hesta’s way. She has already called me a "tallow-headed Lantern-licker". I believe it was affectionate.' },
      burn: { speaker: 'npc:anselm-pryde', effects: [{ setFlag: 'npc.anselm-pryde.came_cinderhold', value: true }], text: 'Very likely. But I have spent thirty years being careful, and look where careful has brought us all.' },
      n: { speaker: 'npc:anselm-pryde', text: 'The tables at the back of the Primer, look: ley-draws, hall by hall, falling year on year. Ithren help us. It was all written down, and we were taught it was sin.' },
    },
  },
  {
    id: 'dialogue:ch1-hale-cathedral', name: 'Hale: Envoy of the Wick',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:garrick-hale',
        text: '(Inquisitor Hale rises from the altar rail. He looks older than he did on the green.) You’re dead. I wrote it to Solenne in my own hand. The Lord-Inquisitor sent me north to Haldren regardless, which tells me what he thought of my handwriting.',
        choices: [
          { text: 'Why did you let me go?', to: 'why', once: true },
          { text: 'Are you here for me?', to: 'here', once: true },
          { text: '[Oathbound] "Brother, what does Valcastre do with the marked?"', to: 'valcastre', when: { classIs: 'class:oathbound' }, tag: 'class', once: true },
          { text: 'Lux manet, Inquisitor.', to: null, tag: 'leave' },
        ],
      },
      why: { speaker: 'npc:garrick-hale', text: 'I’ve tested two hundred and buried most of them, and you were the first that made the Wick sing. I want to know what you are before Vellane decides it for me.', next: 'start' },
      here: { speaker: 'npc:garrick-hale', text: 'I’m here for the Prior. The Lord-Inquisitor thinks him soft. He is soft. So am I, perhaps. Keep your glove on in this nave and we need not find out how soft.', next: 'start' },
      valcastre: { speaker: 'npc:garrick-hale', mood: 'sad', text: '"Examined." That’s the word. I’ve put three people in those carts since the Quench, and I believed in it. Most days I still do. (He looks at the unlit candles.) Most days.', next: 'start' },
    },
  },
];

export default dialogues;
