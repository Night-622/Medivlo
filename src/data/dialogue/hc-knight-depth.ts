/**
 * Hollow Crown, KNIGHT Act I depth pass (10-campaign-style.md §8, docs/PACING.md): the new stages' scenes,
 * investigation clues, travel banter, optional finds and the third parts of the side quests. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const offer = (q: Q, text: string, to: string): DialogueChoice => ({ text, to, quest: true, when: fresh(q), effects: [{ startQuest: q }] });
/** a stage scene that takes over an NPC's talk must still let them give their own quests */
const more = (...offers: DialogueChoice[]): DialogueChoice[] => [...offers, { text: 'Thank you.', to: null }];
const GM = 'npc:gideon-marke' as const, MB = 'npc:marit-blum' as const, OJ = 'npc:old-jarek' as const;
const VOTE: Q = 'quest:knight-the-colossus-vote';
const PS = 'npc:perpetua-stannard' as const, JA = 'npc:joss-ashlar' as const, BS = 'npc:blank-shield' as const;
const KC1: Q = 'quest:knight-the-iron-embassy', KC4: Q = 'quest:knight-the-princes-plate', KC5: Q = 'quest:knight-ashmaw', KC6: Q = 'quest:knight-gideons-letter';
const SPURS: Q = 'quest:knight-spurs-on-the-stair', REGIMENT: Q = 'quest:knight-the-regents-regiment', BLANK: Q = 'quest:knight-the-blank-shields-crest';

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
  // ======================= I-1 The Vigil: the breach at dawn, Gideon’s quarters
  {
    id: 'dialogue:area-knight-dawn-wards', name: 'I-1 banter: through the Wards at dawn', bark: true,
    entries: [{ when: stage('quest:knight-the-vigil', 'breach'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Anvilgate at dawn: every toll-keeper out on their step, staring at the holes, and every one of them still holding out a hand for the penny. Gideon pays for both of you at every gate without breaking stride.', next: null } },
  },
  {
    id: 'dialogue:knight-gideon-morning', name: 'I-1 the morning in Gideon’s quarters', scope: 'party',
    entries: [{ node: 'room' }],
    nodes: {
      room: { speaker: 'narrator', text: 'At the breach he looked through three holes at the Colossus for a long time, then walked you home. His quarters are one bare room: a cot, a cold hearth, a sword on a peg, a pot of paint gone thick. He puts the kettle on, and sets out two cups.', next: 'sit' },
      sit: { speaker: GM, text: 'Sit. (You sit.) You walked out of your vigil after a song. Every anvil in the city rang. And the thing we have spent thirty years building walked out through three walls and stopped at the gate. Tell me about the song.', next: 'song' },
      song: {
        speaker: GM, text: 'Leave nothing out. I am old, and I have heard most things, and I would rather hear this one properly.',
        choices: [
          { text: 'It’s under the Forge. It’s calling me there.', to: 'forge' },
          { text: 'It sounds like a hammer on an anvil, very far off. Patient.', to: 'hammer', trust: 1 },
          { text: '[Iron] (Put your hand flat on the table. Let him feel it hum.)', to: 'hum', school: 'iron' },
        ],
      },
      forge: { speaker: GM, text: 'The Forge half. Of course. It fell under the Regency’s throne when the crown broke, and it has never come out for any of them. They have tried. Konrad has tried hardest.', next: 'colossus' },
      hammer: { speaker: GM, mood: 'sad', text: 'Patient. Yes. That is the Iron song. My mother said it was the sound of something being made slowly and properly. Ironhold has not made anything slowly or properly in thirty years. Only walls.', next: 'colossus' },
      hum: { speaker: 'narrator', text: 'The table hums. The cups on it ring, faintly, the same note. Gideon lays his own hand flat beside yours and keeps it there a long moment, his eyes shut. When he takes it away, it is shaking a little.', next: 'colossus' },
      colossus: {
        speaker: GM, text: 'The Colossus heard it too. That is why it walked. It went to the gate and turned round, and it is waiting. For a king, the Regency will say. I do not think it is waiting for a king.',
        choices: [
          { text: 'Then what is it waiting for?', to: 'what' },
          { text: 'For me?', to: 'me' },
        ],
      },
      what: { speaker: GM, text: 'Something that can hear what it hears. That narrows the field a good deal. (He pours the tea.) Drink that. It is terrible. It is supposed to be.', next: 'letter' },
      me: { speaker: GM, text: 'Perhaps. Do not say that out loud in the Chapterhouse. They will either knight you or hang you, and the paperwork is the same for both. (He pours the tea.) Drink that.', next: 'letter' },
      letter: { speaker: GM, text: '(He takes a sheet of paper, writes three lines very fast, folds it, seals it with his thumb in the wax, and holds it out.) For the Chapter-Master, at the Chapterhouse. Across the Wards. You will need the toll-pennies. All of them.', next: 'pennies' },
      pennies: {
        speaker: GM, text: '(He counts out a purse of pennies onto the table. A great many pennies.) Forty gates. Do not open the letter. It is about you.',
        choices: [
          { text: 'Yes, ser.', to: 'yes' },
          { text: 'What does it say about me?', to: 'say' },
        ],
      },
      yes: { speaker: GM, text: 'Good. Hold the line. Mind the Sentries at the inner gates; they have been ringing wrong for a month. Go.', next: null },
      say: { speaker: GM, text: '(The corner of his mouth moves, perhaps a quarter of an inch.) That you ask too many questions. Go. Mind the Sentries at the inner gates. They have been ringing wrong for a month.', next: null },
    },
  },

  // ======================= I-4 The Prince-Regent’s Purse: the squires’ new horses
  clue('knight-new-horse-1', 'I-4 a new horse (1)', stage('quest:knight-the-prince-regents-purse', 'stables'),
    'A bay mare, young and handsome, already eating Wat Mudge’s hat. Wat does not mind. Wat is in love. “Mine,” he says. “Mine. I shall call her Mother, so that Father has to say it every time he asks about her.”', 'knight.horse_1',
    'A bay mare in the Order’s stables, wearing what is left of a hat.'),
  clue('knight-new-horse-2', 'I-4 a new horse (2)', stage('quest:knight-the-prince-regents-purse', 'stables'),
    'A grey colt, nervous, with a new saddle. Stamped into the leather, where a squire’s own arms should go one day, are the arms of Queen Berenika. Every saddle in the row is the same. The Prince-Regent has bought every squire in the Order a horse with his grandmother’s name on it.', 'knight.horse_2',
    'A grey colt with a new saddle.'),
  clue('knight-new-horse-3', 'I-4 a new horse (3)', stage('quest:knight-the-prince-regents-purse', 'stables'),
    'In the last stall, a saddlebag with the dealer’s receipt still in it: “Twelve horses, saddled. Paid in full, in new coin.” The coin is in the bag too, the dealer’s change, bright and new. It is heavier than it should be, and slightly wet. Stamped on it: M. RUHL.', 'knight.purse_hollow',
    'An empty saddlebag in the last stall.', 'Your half-stone gives one low, unhappy note, the way a struck bell rings when it is cracked.'),

  // ======================= I-5 The Colossus Vote: the Forge and the Wall, and dawn on the wall-walk
  {
    id: 'dialogue:knight-blum-canvass', name: 'I-5 Blum on what the Forge made', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: MB, text: 'What did the Forge make? (She puts down her hammer.) Thirty years of it, young knight. Every plate of that thing was hammered on these benches. My mother riveted its left foot. I riveted its heart-socket, though nobody told me that was what it was.', next: 'why' },
      why: {
        speaker: MB, text: 'We were told it was for the hand-over. Then for the defence of the realm. Then for the Regency’s pride, which is not a thing you can rivet. Nobody told us it would get up and walk.',
        choices: [
          { text: 'What would the Brotherhood have done with it?', to: 'brotherhood' },
          { text: 'Do you want it walled in?', to: 'wall' },
        ],
      },
      brotherhood: { speaker: MB, mood: 'sad', text: 'Taken it apart. Made something useful. Bridges. Pots. A really good gate that opens. (She smiles, briefly.) Nobody ever asks the people who make a thing what it is for. Vote however you like. Just do not make us build another.', choices: more(offer('quest:knight-hollow-rivets', 'Your riveters are going quiet, you said.', 'quiet'), offer('quest:knight-the-replica-crown', 'Is there anything old in the Forge?', 'crown')) },
      wall: { speaker: MB, text: 'Wall it in? With more of our iron? (She snorts.) That is the Order’s answer to everything. A wall round the problem, and a plaque saying sorry. I would rather it were taken apart. But I would rather it were walled than marched.', choices: more(offer('quest:knight-hollow-rivets', 'Your riveters are going quiet, you said.', 'quiet'), offer('quest:knight-the-replica-crown', 'Is there anything old in the Forge?', 'crown')) },
      quiet: { speaker: MB, text: 'They stop singing at the bench. Then they stop talking. Then they just rivet, very neatly, and look at the wall. It is always the benches nearest the new crates.', next: null },
      crown: { speaker: MB, text: 'There is one thing in the oldest hall. A practice crown, for the hand-over in C. 1012. It belongs with Ser Gideon. He will not come and get it.', next: null },
    },
  },
  {
    id: 'dialogue:knight-jarek-canvass', name: 'I-5 Jarek on what the Wall cost', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: OJ, text: 'What did the Wall cost? (He pats the stone beside him.) Four hundred masons, eleven years, and every one of us cutting a little sorry into our stone because the Regency said so. It cost us the habit of building things we were proud of.', next: 'cost' },
      cost: {
        speaker: OJ, text: 'And look at her. Cracking. Thirty years and she’s cracking already. You can’t build a wall out of sorry, young one. Sorry’s not a mortar. It doesn’t set.',
        choices: [
          { text: 'They want to build another, round the Colossus.', to: 'another' },
          { text: 'What would you build instead?', to: 'instead', trust: 1, trustNpc: OJ },
        ],
      },
      another: { speaker: OJ, mood: 'sad', text: 'Course they do. That’s Ironhold. (He shakes his head.) If they ask me to cut another sorry, I shan’t. I’m eighty. I shall cut my granddaughter’s name and tell them it means “contrition” in Old Haldish.', choices: more(offer('quest:knight-the-masons-marks', 'Is your own stone on this stretch?', 'mine')) },
      instead: { speaker: OJ, mood: 'happy', text: 'A bridge. I always wanted to build a bridge. You can’t be sorry on a bridge. You’re too busy getting to the other side. (He laughs.) Go and vote, young one. Vote for a bridge.', choices: more(offer('quest:knight-the-masons-marks', 'Is your own stone on this stretch?', 'mine')) },
      mine: { speaker: OJ, text: 'A hook and a star. That’s me. Somewhere on the cracked stretch. My eyes won’t do the soot any more.', next: null },
    },
  },
  {
    id: 'dialogue:obj-knight-council-dawn', name: 'I-5 dawn from the wall-walk', scope: 'party',
    entries: [
      { when: { all: [stage(VOTE, 'dawn'), { flag: 'knight.colossus_vote', value: 'march' }] }, node: 'march' },
      { when: { all: [stage(VOTE, 'dawn'), { flag: 'knight.colossus_vote', value: 'writ' }] }, node: 'writ' },
      { when: stage(VOTE, 'dawn'), node: 'wall' },
      { node: 'plain' },
    ],
    nodes: {
      march: { speaker: 'narrator', text: 'Dawn from the wall-walk. Down the gate road the Regency’s regiments are drawing up in gold and black, banners new, every banner Berenika’s. Below you, in the Forge, the shifts have doubled overnight, and the smoke of it lies on the city like a lid.', next: 'march2' },
      march2: { speaker: 'narrator', text: 'At the gate the Colossus stands with its back to all of it, facing Concordia, and does not turn round. Fenna Tock is sitting on the parapet with her chin on her knees. “They’re going without me,” she says.', effects: [{ setFlag: 'knight.dawn_seen', value: 'march' }], next: null },
      wall: { speaker: 'narrator', text: 'Dawn from the wall-walk. Down at the Iron Gate, the masons are already at work, laying the first course of a new wall in a ring round the Colossus’s feet. They are cutting a little sorry into every stone. Old Jarek is not among them.', next: 'wall2' },
      wall2: { speaker: 'narrator', text: 'The Colossus stands inside the rising ring with its back to the city. It does not move. It does not need to. The wall will take years to reach its knees.', effects: [{ setFlag: 'knight.dawn_seen', value: 'wall' }], next: null },
      writ: { speaker: 'narrator', text: 'Dawn from the wall-walk. Below you the heralds are walking through the Wards with a new proclamation, reading it aloud at every gate: three lines in a dead queen’s hand. At every gate, people stop to listen. Some of them take their hats off.', next: 'writ2' },
      writ2: { speaker: 'narrator', text: 'Down at the Iron Gate, the Colossus has turned its great head and is looking back up the road at the city. Not at the Forge. Not at the throne. At the voices.', effects: [{ setFlag: 'knight.dawn_seen', value: 'writ' }], next: null },
      plain: { speaker: 'narrator', text: 'The wall-walk, and the long view down to the Iron Gate.', next: null },
    },
  },

  // ======================= I-7 A King for the Colossus: the Colossus’s bay
  clue('knight-cradle-clue-1', 'I-7 the Colossus’s bay (1)', stage('quest:knight-a-king-for-the-colossus', 'forge'),
    'Konrad’s plans, pinned along the bay wall in his golden hand. The Colossus walking, the Colossus at the Citadel door, the Colossus kneeling to a small figure holding out a crown. In every drawing the small figure is Konrad. In none of them is anyone else there to see it.', 'knight.cradle_1',
    'A bay wall, with pin-holes where plans were.'),
  clue('knight-cradle-clue-2', 'I-7 the Colossus’s bay (2)', stage('quest:knight-a-king-for-the-colossus', 'forge'),
    'A heap of delivery tags by the cradle rails, thirty years of them, every one the same: “Hollow Lode. M. Ruhl.” Under them, older, a single tag from the year the Colossus was begun: “Honest iron. Brotherhood of the Deepworks. With our compliments.”', 'knight.cradle_2',
    'Delivery tags swept into a heap.'),
  clue('knight-cradle-clue-3', 'I-7 the Colossus’s bay (3)', stage('quest:knight-a-king-for-the-colossus', 'forge'),
    'A mould the size of a cart, cast for a single thing: a cradle for a half-stone, ringed with the arms of Berenika. Scratched inside it, small, in a child’s hand, years old: “KONRAD WILL BE KING OF THE BIG MAN.”', 'knight.cradle_3',
    'A great empty mould, cold.', 'At the end of the bay, sitting on the Colossus’s empty footplate with his chin in his hands, is the Prince-Regent.'),

  // ======================= I-9 The Dubbing on the Wall: the Last Toll (codex find)
  {
    id: 'dialogue:obj-knight-last-toll', name: 'I-9 the Last Toll', scope: 'party',
    entries: [{ when: stage('quest:knight-the-dubbing-on-the-wall', 'toll'), node: 'gate' }, { node: 'plain' }],
    nodes: {
      gate: { speaker: 'narrator', text: 'Halfway down the gate road, the forty-first gate: a single iron arch with no walls on either side of it at all, and a toll-box on a post. You could walk round it. Nobody ever has. A painted board says: KNIGHTS LEAVING IRONHOLD. ONE PENNY. FOR THE ROAD HOME.', next: 'box' },
      box: { speaker: 'narrator', text: 'The box is full of pennies, centuries of them, green and black and bright, every one paid by a knight riding out to the Turning, so that the road would be paid for when they came back. The newest penny is thirty years old.', next: 'pay' },
      pay: {
        speaker: 'narrator', text: 'You have one penny left from the forty gates.',
        choices: [
          { text: '(Pay the toll.)', to: 'paid', effects: [{ unlockLore: 'lore:hc-knight-last-toll' }] },
          { text: '(Pay it, and a second penny for Ser Gideon.)', to: 'two', effects: [{ unlockLore: 'lore:hc-knight-last-toll' }] },
        ],
      },
      paid: { speaker: 'narrator', text: 'It drops in with a small, final clink. Something in you settles. The road home is paid for. You walk through the arch, though you could have walked round it, because that is what the arch is for.', next: null },
      two: { speaker: 'narrator', text: 'You find a second penny at the bottom of your purse and drop it in after the first: one for you, one for an old knight who paid this toll thirty years ago and never felt he had the right to use the road home. Two clinks, very close together.', next: null },
      plain: { speaker: 'narrator', text: 'The Last Toll, an arch with no walls, and a box full of pennies.', next: null },
    },
  },
  {
    id: 'dialogue:area-knight-gate-road', name: 'I-9 banter: the gate road', bark: true,
    entries: [{ when: stage('quest:knight-the-dubbing-on-the-wall', 'road'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Your new arms catch the light on the gate road. Ahead, the Colossus has turned its head to watch you come, and on its shoulder a small golden figure is waving.', next: null } },
  },

  // ======================= Side: Hilde’s Tenth Key (Corisande’s penny)
  {
    id: 'dialogue:obj-knight-brack-oven', name: 'Hilde’s Tenth Key: Corisande’s penny', scope: 'party',
    entries: [{ when: stage('quest:knight-hildes-tenth-key', 'bakery'), node: 'oven' }, { node: 'plain' }],
    nodes: {
      oven: { speaker: 'narrator', text: 'The front of Corisande Brack’s bakery, which nobody uses, because the gate is round the back. Corisande opens the door in a cloud of flour, delighted to have a customer at the right end for once. You ask her about the penny.', next: 'why' },
      why: {
        speaker: 'narrator', text: '“Why did I never complain?” She goes pink under the flour. “Because every morning Hilde Ninelocks comes out to take it. Every morning for eleven years. And she says, ‘Morning, Corisande.’ And I say, ‘Morning, Hilde.’ It’s the best penny I spend.”',
        choices: [
          { text: '“You could just ask her in for breakfast.”', to: 'ask', effects: [{ setFlag: 'knight.corisande', value: 'breakfast' }] },
          { text: '“I’ll tell her it was worth it.”', to: 'tell', effects: [{ setFlag: 'knight.corisande', value: 'told' }] },
        ],
      },
      ask: { speaker: 'narrator', text: 'Corisande stares at you as if you had suggested she fly. Then she looks at the loaf in her hands, and at the gate, and at the toll-house across the street, where a light is on. “Do you know,” she says slowly, “I don’t think there’s a toll for that.”', next: null },
      tell: { speaker: 'narrator', text: '“Don’t you dare,” says Corisande, and shoves a warm loaf into your arms, and then, as you go, calls after you: “Tell her the penny’s still on. Gate or no gate. Tell her that.”', next: null },
      plain: { speaker: 'narrator', text: 'Corisande Brack’s bakery, smelling of bread.', next: null },
    },
  },

  // ======================= Side: the Office of Public Contrition (letter number one)
  {
    id: 'dialogue:obj-knight-bray-first-letter', name: 'The Office of Public Contrition: letter number one', scope: 'party',
    entries: [{ when: stage('quest:knight-the-office-of-public-contrition', 'first'), node: 'basket' }, { node: 'plain' }],
    nodes: {
      basket: { speaker: 'narrator', text: 'At the bottom of the Chapterhouse post-basket, under thirty years of circulars, a single letter, its seal unbroken, addressed in a shaking hand: “To Concordia. Number one.” Inside, no flourishes, no verse, no semicolons. Four lines.', next: 'read' },
      read: { speaker: 'narrator', text: '“To whoever is there. I am a clerk in Ironhold and I do not know what happened last night, only that it was our fault. I am sorry. Please write back, so that I know someone is there. Absalom Bray.”', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'Ten thousand, nine hundred and fifty letters since, and none of them asked for an answer.',
        choices: [
          { text: '(Take it back to Bray.)', to: 'back', effects: [{ setFlag: 'knight.bray_first', value: 'returned' }] },
          { text: '(Put it with his newest letter, to carry through the gate.)', to: 'carry', effects: [{ setFlag: 'knight.bray_first', value: 'carried' }] },
        ],
      },
      back: { speaker: 'narrator', text: 'Bray reads his own letter twice, standing very still among his shelves. “I had forgotten,” he says. “I had forgotten I wanted an answer.” He puts it on the empty space on the first shelf, where it belongs.', next: null },
      carry: { speaker: 'narrator', text: 'You fold it in with number ten thousand, nine hundred and fifty-one. When you tell Bray, he sits down very suddenly on a box of the spring of C. 1027, and does not get up for some time.', next: null },
      plain: { speaker: 'narrator', text: 'The Chapterhouse post-basket, full of circulars nobody reads.', next: null },
    },
  },

  // ======================= Side: the Dented Lance (Wat’s father)
  {
    id: 'dialogue:obj-knight-mudge-father', name: 'The Dented Lance: Wat’s father', scope: 'party',
    entries: [{ when: stage('quest:knight-the-dented-lance', 'father'), node: 'stands' }, { node: 'plain' }],
    nodes: {
      stands: { speaker: 'narrator', text: 'Gilbert Mudge is a farrier, broad as a door, with a face like a closed gate. He is holding a long bundle wrapped in sacking across his knees. He does not look at you when you sit down. He is looking at the empty lists.', next: 'lance' },
      lance: { speaker: 'narrator', text: '“I was a squire once,” he says. “Worst jouster in the Order. Never hit the quintain once. Left before my dubbing.” He unwraps the sacking. Inside is a lance, dented in a dozen places, older than Wat. “Thought he’d be like me. He isn’t. He hit it.”', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'Down in the yard, Wat is pretending very hard to see to his horse.',
        choices: [
          { text: '“Give it to him yourself.”', to: 'give', effects: [{ setFlag: 'knight.wat_father', value: 'given' }] },
          { text: '“Tell him you were the worst jouster in the Order.”', to: 'tell', effects: [{ setFlag: 'knight.wat_father', value: 'told' }] },
        ],
      },
      give: { speaker: 'narrator', text: 'Gilbert gets up, slowly, and goes down into the yard with the lance, and holds it out. Wat takes it in both hands. Neither of them says anything. Then Wat drops it, and Gilbert laughs, a huge surprised laugh, the good kind.', next: null },
      tell: { speaker: 'narrator', text: 'Gilbert goes down and tells him. Wat stares at his father as if he has never seen him before. Then he says, “Worse than me?” and Gilbert says, “Much worse,” and Wat is so happy he has to sit down on the horse.', next: null },
      plain: { speaker: 'narrator', text: 'The empty stands above the lists.', next: null },
    },
  },

  // ======================= Side: Hollow Rivets (the cage-lift ledger)
  clue('knight-lift-ledger', 'Hollow Rivets: the cage-lift ledger', stage('quest:knight-hollow-rivets', 'lift'),
    'The cage-lift’s loading ledger, thick with grease. Hollow Lode iron, for a year: rivets for the Forge; plates for the Colossus’s heart; coin, fresh-struck, for the Regency’s treasury; and, last week, twelve crates marked “Saddlery and harness. Order of the Anvil. Paid by the Prince-Regent.”', 'knight.lift_ledger',
    'The cage-lift, groaning on its chains.', 'It went everywhere. Blum was right. Everything new in Ironhold this year has the same black in its seams.'),

  // ======================= Side: the Replica Crown (the chapel altar)
  {
    id: 'dialogue:obj-knight-chapel-altar', name: 'The Replica Crown: on the altar rail', scope: 'party',
    entries: [{ when: stage('quest:knight-the-replica-crown', 'altar'), node: 'altar' }, { node: 'plain' }],
    nodes: {
      altar: { speaker: 'narrator', text: 'The Order’s chapel by daylight, empty. You set the replica crown on its grey cushion on the altar rail, exactly where your unpainted shield leaned on the night of the Bell. Twelve empty settings catch the light from the window.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'Under the cushion, in chalk, the old smiths’ warning: PRACTICE. DO NOT BOW TO.',
        choices: [
          { text: '(Don’t bow. Light a candle beside it instead.)', to: 'candle', effects: [{ setFlag: 'knight.crown_altar', value: 'candle' }] },
          { text: '(Kneel, and keep a short vigil beside it.)', to: 'kneel', effects: [{ setFlag: 'knight.crown_altar', value: 'vigil' }] },
        ],
      },
      candle: { speaker: 'narrator', text: 'One candle, beside one practice crown. When you look back from the chapel door you see that someone else has come in by the side door: an old knight in a grey cloak, standing well back, with his hands behind him, looking at it.', next: null },
      kneel: { speaker: 'narrator', text: 'You kneel. After a while you hear the side door, and slow footsteps, and someone sits down on the back pew behind you. He does not say anything. When you get up he has gone, but the candle by the crown has been lit.', next: null },
      plain: { speaker: 'narrator', text: 'A practice crown of painted iron on the chapel altar rail, a candle beside it.', next: null },
    },
  },

  // ======================= Side: the Masons’ Marks (Ilka’s door)
  {
    id: 'dialogue:obj-knight-ilka-door', name: 'The Masons’ Marks: Ilka’s door', scope: 'party',
    entries: [{ when: stage('quest:knight-the-masons-marks', 'ilka'), node: 'door' }, { node: 'plain' }],
    nodes: {
      door: { speaker: 'narrator', text: 'A green door on Lamp Lane, and behind it a woman of forty with flour on her apron and three children hanging off her. Ilka. You hold out her father’s rubbing: the hook, the star, and the four letters.', next: 'read' },
      read: {
        speaker: 'narrator', text: 'She reads it. Then she reads it again. “He told me it meant ‘regret’,” she says. “When I was little and asked. He said it was Old Haldish for ‘regret’, and I cried, because I thought he regretted me.”',
        choices: [
          { text: '“He cut it the week you were born. He wasn’t sorry about anything that week.”', to: 'week', effects: [{ setFlag: 'knight.ilka', value: true }] },
          { text: '(Say nothing. Let her read it.)', to: 'quiet', effects: [{ setFlag: 'knight.ilka', value: true }] },
        ],
      },
      week: { speaker: 'narrator', text: 'Ilka puts her hand over her mouth. Then she puts on her shawl, children and all, and goes out past you towards the Wall, at a pace that suggests an eighty-year-old mason is about to be told off, and then hugged, for a very long time.', next: null },
      quiet: { speaker: 'narrator', text: 'She reads it a long time. Then she pins it to the inside of her green door, at a child’s eye height, and says to the smallest child, “That’s your grandad’s. That’s the best thing on the whole Wall.”', next: null },
      plain: { speaker: 'narrator', text: 'A green door on Lamp Lane. There is a charcoal rubbing pinned inside it.', next: null },
    },
  },

  // ======================= Optional areas (Claude 2): finds in Anvilgate’s ruin, cave and viewpoint
  find('iron-capital-ruin-find', 'Anvilgate ruin: the first forge',
    'In the ruin, under fallen beams, an anvil no higher than your knee, black with a thousand years, and beside it a hammer worn to a stub. Cut into the anvil’s face, so small you have to brush it with your sleeve: “Made slowly. Made properly. Made for somebody.”',
    'lore:hc-iron-capital-ruin'),
  find('iron-capital-cave-find', 'Anvilgate cave: the drowned crypt',
    'Deep in the cave the water is knee-high and still, and under it lie the old Order’s grave-slabs, each carved with a knight and their horse. On every slab the knight is lying down and the horse is standing over them, on guard. In Ironhold, it seems, the horses kept the vigil.',
    'lore:hc-iron-capital-cave'),
  find('iron-capital-cave-codex', 'The Drowned Crypt: a squire’s vigil-card',
    'A card in a tin, left on a ledge by a squire on vigil, the old custom: write down the one thing you are afraid of, and leave it in the dark. “I am afraid I will be good at this and not know what for. Sq. Gideon Marke, C. 990.”',
    'lore:hc-iron-capital-tally'),
  find('iron-capital-view-find', 'Anvilgate viewpoint: the walls',
    'From the viewpoint you can count Anvilgate’s walls: walls round the Wards, walls round the walls, nineteen rings of them, and Berenika’s Wall last and highest. Somebody has scratched a tally on the rail of how many were built after C. 1012. It is seventeen.',
    'lore:hc-iron-capital-view'),
  {
    id: 'dialogue:area-iron-capital-view', name: 'Anvilgate viewpoint banter',
    bark: true, entries: [{ when: { heroClass: 'knight' }, node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'From up here Anvilgate looks like a dropped bag of iron rings. Somewhere down there, very faintly, a toll-keeper is shouting “One penny!” at somebody who is clearly arguing.', next: null } },
  },
  // ======================= ACT II, C-1 The Iron Embassy: the road in, the gold stair
  {
    id: 'dialogue:area-knight-gildport-road', name: 'C-1 banter: the road to Gildport', bark: true,
    entries: [{ when: stage(KC1, 'envoy'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Everything in Gildport is gold, or wants you to think so: the rails, the doorknobs, a dog’s collar. Your tabard is the only plain thing in the street, and people keep looking at it as if it were the expensive one.', next: null } },
  },
  {
    id: 'dialogue:knight-perpetua-stair', name: 'C-1 the Envoy at the head of the gold stair', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: PS, text: '(She has taken off one glove and laid her bare palm flat on the gilded wall, the way you would feel a horse’s flank.) Thirty years I have heard it from my window. I have never once been close enough to count.', next: 'count' },
      count: {
        speaker: PS, text: 'Listen. Three strokes and a rest. Three and a rest. That is not a machine, Ser Knight. That is the old Ironhold forge-rhythm. Every smith in the Fortress Forge was taught it as a child.',
        choices: [
          { text: 'Then something down there was taught by Ironhold.', to: 'taught' },
          { text: 'You came all this way to count hammer-strokes?', to: 'why' },
          { text: '[Iron] (Lay your gauntlet on the wall beside her hand, and count with her.)', to: 'together', school: 'iron', trustNpc: PS, trust: 1 },
        ],
      },
      taught: { speaker: PS, text: 'Or it taught us. The embassy papers call it the Crown-Smith. I always assumed the clerk was being poetic. Clerks so rarely are.', next: 'stay' },
      why: { speaker: PS, mood: 'happy', text: 'I came all this way to be sure I had not imagined it. When you are the only person in a building for thirty years, you begin to check things.', next: 'stay' },
      together: { speaker: 'narrator', text: 'Three and a rest. Three and a rest. Your half-stone keeps the count with you both. The Envoy’s mouth moves on the numbers, and you realise she has done this every night, alone, at the embassy window.', next: 'stay' },
      stay: {
        speaker: PS, text: 'I shall stay here and listen while you go down. If the hammering stops, I shall know that you got there. If it does not, I shall know something else, and write a very stern letter about it.',
        choices: [{ text: 'I’ll stop it, Envoy.', to: null, quest: true }, { text: 'Keep the count for me.', to: null, quest: true }],
      },
    },
  },

  // ======================= ACT II, C-3 The Gilded Engine: telling the Envoy
  {
    id: 'dialogue:knight-perpetua-engine', name: 'C-3 the Envoy hears the hammering has stopped', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: PS, text: '(She is at the embassy window, with the lamp unlit beside her for the first time in thirty years.) It stopped. Mid-stroke. Three, and then two, and then nothing. I have been standing here ever since in case it changed its mind.', next: 'tell' },
      tell: {
        speaker: 'narrator', text: 'You tell her: the gold running off it, the tired iron underneath, the anvil, and the question it asked at the end, about whether anyone knew it had done its work.',
        choices: [
          { text: 'It made the settings to hold the grief as well as the song.', to: 'grief' },
          { text: 'It only wanted to know its work was good.', to: 'good', trust: 1, trustNpc: PS },
        ],
      },
      grief: { speaker: PS, mood: 'sad', text: '(She sits down.) Then the crown was never meant to be carried by one person. It was built to share the weight. And we let one tired queen carry it down there alone.', next: 'lamp' },
      good: { speaker: PS, mood: 'sad', text: 'Of course it did. So did we all. (She looks at the unlit lamp.) I shall write it into the embassy record: the Crown-Smith’s work was good. Somebody ought to.', next: 'lamp' },
      lamp: { speaker: PS, text: 'Now. There is word from Kilnmouth, by a smith who walked all night. A golden-haired man in old royal plate, walking into the kilns of his own accord, with the Hollow King’s smiths around him like a guard of honour.', next: 'konrad' },
      konrad: {
        speaker: PS, text: 'I knew his grandmother, Ser Knight. I should like very much not to have to write to Anvilgate about him.',
        choices: [{ text: 'Then I’ll bring him home.', to: 'home', quest: true }, { text: 'I’ll go to Kilnmouth.', to: 'home', quest: true }],
      },
      home: { speaker: PS, text: 'Do. And light my lamp on your way out. It is the protocol. An embassy with its lamp out is a declaration of war, and I have quite enough to apologise for.', next: null },
    },
  },

  // ======================= ACT II, C-4 The Prince’s Plate: the road south
  {
    id: 'dialogue:area-knight-kiln-road', name: 'C-4 banter: the road to the Ashfall', bark: true,
    entries: [{ when: stage(KC4, 'trail'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'The road to the Ashfall is black with soot and lined with smiths’ shrines. Somebody has hung a gold-and-black ribbon on every one of them for the last mile. Konrad’s colours. He always did like an entrance.', next: null } },
  },

  // ======================= ACT II, C-5 Ashmaw: what Konrad left on the forge-stone
  clue('knight-konrad-signet', 'C-5 Konrad’s signet on the forge-stone', stage(KC5, 'signet'),
    'On the smiths’ forge-stone, set down squarely in the middle where nobody could miss it: the Regent’s signet ring, gold, with Berenika’s anvil cut into it. Under it, a strip of black-and-gold ribbon, knotted, the way a squire knots a favour.', 'knight.konrad_signet',
    'The smiths’ forge-stone, cold now that Ashmaw breathes no more.', 'Scratched into the stone beside it with the point of a dagger, in a large, untidy, cheerful hand: “For Anvilgate. I do not need it where I am going. Tell Gran I was magnificent. K.”'),

  // ======================= ACT II, C-6 Gideon’s Letter: the answer
  {
    id: 'dialogue:obj-knight-reply-letter', name: 'C-6 an answer for Gideon', scope: 'party',
    entries: [
      { when: { all: [stage(KC6, 'reply'), { flag: 'knight.duty_walked' }] }, node: 'duty' },
      { when: stage(KC6, 'reply'), node: 'joss' },
      { node: 'plain' },
    ],
    nodes: {
      duty: { speaker: 'narrator', text: 'Duty is still under the Iron arch, saddled, with an empty girth where the letter was. He looks at you, and at the arch, and stamps once. He is going home, and he would like to take something.', next: 'write' },
      joss: { speaker: JA, text: 'Ready when you are, ser. Forty gates back, and I’ve still got one penny. I can carry an answer for nothing. Mind, Ser Gideon will read it a hundred times, so make it a good one.', next: 'write' },
      write: {
        speaker: 'narrator', text: 'He took a month over three lines. You have one sheet and a stub of pencil.',
        choices: [
          { text: '“The line holds. I am bringing it home. Keep riding, badly.”', to: 'sent', effects: [{ setFlag: 'knight.reply', value: 'line' }] },
          { text: '“I found Konrad’s signet. I mean to find Konrad.”', to: 'sent', effects: [{ setFlag: 'knight.reply', value: 'konrad' }] },
          { text: '“Thank you for the spurs. I have never once asked why.”', to: 'sent', when: { flag: 'knight.gideon_devotable' }, effects: [{ setFlag: 'knight.reply', value: 'spurs' }] },
        ],
      },
      sent: { speaker: 'narrator', text: 'You fold it in four, the Order’s way, and send it home under the Iron arch. You are fairly sure Ser Gideon will keep it in his tabard until it falls to pieces.', next: null },
      plain: { speaker: 'narrator', text: 'The Iron arch, shut again, with a hoof-print or a boot-print in the dust beneath it.', next: null },
    },
  },

  // ======================= ACT III, Spurs on the Stair: the vigil
  {
    id: 'dialogue:obj-knight-stair-vigil', name: 'Spurs on the Stair: the vigil at the foot of the Stairs', scope: 'party',
    entries: [{ when: stage(SPURS, 'vigil'), node: 'card' }, { node: 'plain' }],
    nodes: {
      card: { speaker: 'narrator', text: 'Wrapped with the spurs is a small card, soft with handling: Gideon’s vigil-card, dated C. 990. “Kneel at the foot, with the road before you. Say what you carry.” He kept his vigil at the foot of his first long walk. This is his last.', next: 'kneel' },
      kneel: {
        speaker: 'narrator', text: 'You kneel at the foot of the Twelve Stairs, with the spurs before you on the black stone. What do you carry?',
        choices: [
          { text: 'The line. Everyone behind me.', to: 'line' },
          { text: 'Gideon’s spurs, and the walk he could not finish.', to: 'spurs' },
          { text: '[Iron] (Say nothing. Hold your shield before you until your arms ache, as a wall would.)', to: 'wall', school: 'iron' },
        ],
      },
      line: { speaker: 'narrator', text: 'You say it aloud, and a bearer on the way past stops, and kneels beside you without a word, and then another. It is not a long vigil. It does not need to be.', next: 'rise' },
      spurs: { speaker: 'narrator', text: 'You say it aloud. The spurs lie very still on the stone, green with well-water, waiting to finish the climb.', next: 'rise' },
      wall: { speaker: 'narrator', text: 'Your arms shake, then stop shaking. Somewhere behind your ribs the Forge half rings once, like a smith’s hammer at the end of a good day.', next: 'rise' },
      rise: { speaker: 'narrator', text: 'You stand, and pick up the spurs. Now they can go up.', effects: [{ setFlag: 'knight.vigil_kept', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The foot of the Twelve Stairs. There are two knee-marks in the black grit.', next: null },
    },
  },

  // ======================= ACT III, The Regent’s Regiment: the colour-case
  clue('knight-regiment-case', 'The Regent’s Regiment: the colour-case', stage(REGIMENT, 'case'),
    'At the foot of the Twelve Stairs, half under the grit, lies a regiment’s colour-case in gold and black, its strap cut. Inside, rolled round the staff where every Ironhold regiment keeps it, is the roll of arms: every knight who rode out after Konrad, each with a little painted crest.', 'knight.regiment_roll',
    'An empty colour-case at the foot of the Twelve Stairs.', 'At the foot of the roll, in a clerk’s hand: “Horses and squires found at the Regent’s charge, by the courtesy of M. Ruhl.” Even this was bought. The crests are still bright.'),

  // ======================= ACT III, The Blank Shield’s Crest: a sword for the watch
  {
    id: 'dialogue:obj-knight-shield-sword', name: 'The Blank Shield’s Crest: a sword for the watch', scope: 'party',
    entries: [{ when: stage(BLANK, 'sword'), node: 'pile' }, { node: 'plain' }],
    nodes: {
      pile: {
        speaker: 'narrator', text: 'At the edge of the Legion camp the freed have laid down their weapons in heaps: pikes, picks, a ladle, a great many swords. Most are black with tears. A few are not.',
        choices: [
          { text: '(Take a plain sword with no crest on the pommel.)', to: 'plain-sword' },
          { text: '[Iron] (Find the oldest one, and polish it on your tabard first.)', to: 'old', school: 'iron' },
        ],
      },
      'plain-sword': { speaker: 'narrator', text: 'A plain, honest Ironhold sword, the kind every squire is issued and nobody remembers. No crest. No name. It will do very well for something that has neither.', effects: [{ setFlag: 'knight.shield_sword', value: true }], next: 'give' },
      old: { speaker: 'narrator', text: 'Old Ironhold steel under the black, and a maker’s mark you know from the Fortress Forge: Blum’s grandmother’s. It comes up bright after a minute’s work. Somebody, once, was very proud of this.', effects: [{ setFlag: 'knight.shield_sword', value: true }], next: 'give' },
      give: { speaker: BS, mood: 'happy', text: '(When you hold it out, the Blank Shield takes it in both hands, and holds it up to the light, and then grounds it, point to the stone, so carefully you can hear it breathe out, though it has nothing to breathe with.)', next: null },
      plain: { speaker: 'narrator', text: 'Heaps of laid-down weapons at the edge of the Legion camp.', next: null },
    },
  },
];

export default dialogues;
