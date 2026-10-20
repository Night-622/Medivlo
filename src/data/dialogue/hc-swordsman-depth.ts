/**
 * Hollow Crown, SWORDSMAN Act I depth pass (10-campaign-style.md §8, docs/PACING.md): the new stages' scenes,
 * investigation clues, travel banter, optional finds and the third parts of the side quests. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const offer = (q: Q, text: string, to: string): DialogueChoice => ({ text, to, quest: true, when: fresh(q), effects: [{ startQuest: q }] });
/** a stage scene that takes over an NPC's talk must still let them give their own quests */
const more = (...offers: DialogueChoice[]): DialogueChoice[] => [...offers, { text: 'Thank you.', to: null }];
const LF = 'npc:lucia-ferro' as const, CS = 'npc:celandine-sallow' as const, PT = 'npc:percy-thimble' as const;
const BS = 'npc:bettina-sarto' as const, CB = 'npc:cosimo-bracca' as const;
const VOTE: Q = 'quest:swordsman-the-ladder-vote';
const PC = 'npc:percy-thimble-concordia' as const;
const SC1: Q = 'quest:swordsman-the-watch-house-ladder', SC4: Q = 'quest:swordsman-the-champions-climb', SC5: Q = 'quest:swordsman-the-stormcrow';
const SC6: Q = 'quest:swordsman-a-letter-from-ferro', KEPT: Q = 'quest:swordsman-the-kept-opponents', PERCY: Q = 'quest:swordsman-percys-thousandth';

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
  // ======================= I-1 The Bell on the Ladder: the back alleys, Ferro’s salle at night
  {
    id: 'dialogue:area-swordsman-back-alleys', name: 'I-1 banter: the back alleys', bark: true,
    entries: [{ when: stage('quest:swordsman-the-bell-on-the-ladder', 'alleys'), node: 'b' }],
    nodes: { b: { speaker: LF, text: 'Left. Left. Duck. Not that duck, the other duck. (A Revenant lunges out of a doorway. She trips it without breaking stride.) Feet!', next: null } },
  },
  {
    id: 'dialogue:swordsman-ferro-salle-night', name: 'I-1 Ferro’s salle at night', scope: 'party',
    entries: [{ node: 'room' }],
    nodes: {
      room: { speaker: 'narrator', text: 'Ferro’s salle is a long cold room of bare boards, one lamp, a rack of practice blades and a great deal of dust. It has not been swept in years, except for one strip of floor down the middle, worn pale by somebody pacing it every night. She bolts the door.', next: 'sword' },
      sword: { speaker: LF, text: '(She takes a practice blade off the rack and puts it in your hands, hilt first.) Hold that. Not like that. Like a person, not a heron. Now. Listen to it.', next: 'listen' },
      listen: {
        speaker: 'narrator', text: 'The blade is humming. Very faint, the same note every sword in Edgewater sang when the Bell rang, and under it, from your chest, your own song, answering.',
        choices: [
          { text: 'It’s singing the same note as me.', to: 'note' },
          { text: '(Hold the blade up to the lamp and sight down the edge.)', to: 'edge', school: 'blade' },
          { text: 'Why did every sword stop, Maestra?', to: 'stop' },
        ],
      },
      edge: { speaker: 'narrator', text: 'Down the length of the steel, faint as frost, a line of black runs from the hilt to the point and back again, like something looking for a way out. You lower the blade. Ferro has seen it too. She does not say anything about it.', next: 'note' },
      stop: { speaker: LF, text: 'Because something reminded them what they were for. For one heartbeat every blade in this city remembered that a bout is supposed to end. (She sits down on the bench, hard.) It didn’t last.', next: 'note' },
      note: { speaker: LF, mood: 'afraid', text: 'The Hall half is under the Fencing Hall floor, three streets from here. Every swordsman in Edgewater has fenced over it for thirty years, and tonight it sang for you. Somebody else will have heard it sing. Somebody who listens for that sort of thing.', next: 'who' },
      who: {
        speaker: LF, text: 'So. For now you are my student. Nobody looks twice at Ferro’s student. Ferro’s students are a joke.',
        choices: [
          { text: 'How many students do you have?', to: 'none' },
          { text: 'Who is the somebody?', to: 'somebody' },
        ],
      },
      none: { speaker: LF, mood: 'happy', text: 'Counting you? One. Not counting you, the same. (It is very nearly a smile.) That is the joke. Now. One useful thing, before morning.', next: 'lesson' },
      somebody: { speaker: LF, text: '(She looks at the bolted door.) Ask me again when you have met him. You will meet him. Everybody does. Now. One useful thing, before morning.', next: 'lesson' },
      lesson: {
        speaker: LF, text: 'En garde. (She does not pick up a blade. She stands in front of you with her hands behind her back.) Lunge at me.',
        choices: [
          { text: '(Lunge.)', to: 'lunge' },
          { text: '(Don’t. She has no sword.)', to: 'dont', trust: 1 },
        ],
      },
      lunge: { speaker: 'narrator', text: 'She steps aside half an inch and your lunge goes past her into the dark, and she taps your back foot with her toe, and you sit down very suddenly on the boards. “Feet,” she says. “Again. No. Not again. That is the lesson. Go to bed.”', next: 'end' },
      dont: { speaker: LF, mood: 'happy', text: 'Good. A sword against no sword is not a bout, it is a butcher’s. Half of Edgewater has forgotten that. (She takes the blade back, gently.) That was the lesson. You passed it. Don’t let it go to your head.', next: 'end' },
      end: { speaker: LF, text: 'There is a cot behind the rack. Sleep with your boots on. In the morning, the Ladder board, and a favour. (She blows out the lamp.) Goodnight, student.', next: null },
    },
  },

  // ======================= I-2 Strike Them Off: following the black chalk
  clue('swordsman-chalk-clue-1', 'I-2 the black chalk (1)', stage('quest:swordsman-strike-them-off', 'chalk'),
    'At the foot of the Ladder board the black has pooled in the gutter, thick as ink, and it is not lying still. It runs off across the square in a thin line, against the slope of the cobbles, the way no water runs.', 'swordsman.chalk_1',
    'A gutter at the foot of the Ladder board, scrubbed.'),
  clue('swordsman-chalk-clue-2', 'I-2 the black chalk (2)', stage('quest:swordsman-strike-them-off', 'chalk'),
    'The line of black goes past the duel-graves. Every grave the Revenants climbed out of has a little black runnel coming out of it to join the line, like streams into a river. All of it running the same way.', 'swordsman.chalk_2',
    'Open duel-graves round the square.'),
  clue('swordsman-chalk-clue-3', 'I-2 the black chalk (3)', stage('quest:swordsman-strike-them-off', 'chalk'),
    'The black ends at a grating in the foundations of the Fencing Hall, and drips through it, down into the dark under the floor. From down there, very faint, you can hear something sing your note back to you.', 'swordsman.chalk_hall',
    'A grating in the foundations of the Fencing Hall.', 'Whatever is under the Hall floor, the tears of the whole Quarter are running to it.'),

  // ======================= I-4 The Champion’s Salute: the autograph book, Madame Sallow’s best customer
  {
    id: 'dialogue:obj-swordsman-autograph-book', name: 'I-4 Vellacourt’s autograph book', scope: 'party',
    entries: [{ when: stage('quest:swordsman-the-champions-salute', 'book'), node: 'book' }, { node: 'plain' }],
    nodes: {
      book: { speaker: 'narrator', text: 'A fat book bound in white calf, dropped on the bridge and trodden on. Not autographs given: autographs taken. Every opponent he has ever beaten has signed it, under their bout, in thirty years. Hundreds of names. Pinned into every page is a small printed card.', next: 'cards' },
      cards: { speaker: 'narrator', text: 'The cards are insults, beautifully printed: “Sir, your guard is a garden gate.” “Madam, I have seen better footwork on a table.” Each one bought, each one used, to make the beaten challenge him again. Each card is stamped: C. SALLOW, INSULTS.', next: 'ferro' },
      ferro: {
        speaker: 'narrator', text: 'One page near the front has no signature, only a name in his hand, L. FERRO, and under it, in the same hand, the same word over and over in columns, filling the page and the next and the next: “Again. Again. Again.”',
        choices: [
          { text: '(Close the book and keep it.)', to: 'keep', effects: [{ setFlag: 'swordsman.autograph_book', value: true }] },
          { text: '(Close it, and leave it on the bridge for him.)', to: 'leave', effects: [{ setFlag: 'swordsman.autograph_book', value: true }] },
        ],
      },
      keep: { speaker: 'narrator', text: 'You put it inside your coat. It is heavier than a book has any right to be.', next: null },
      leave: { speaker: 'narrator', text: 'You set it on the parapet, closed. By the time you look back, one of his admirers has picked it up and run after him with it, shouting his name.', next: null },
      plain: { speaker: 'narrator', text: 'The Champion’s Bridge, scuffed with the boots of a crowd.', next: null },
    },
  },
  {
    id: 'dialogue:swordsman-sallow-customer', name: 'I-4 Madame Sallow’s best customer', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: CS, text: 'Insults! Fresh today! Nobody buys them… (She sees your face.) Oh. Oh, you’ve been at the Champion’s Bridge, haven’t you. Darling, sit. Everybody who has met him needs to sit.', next: 'who' },
      who: {
        speaker: CS, text: 'Yes, he buys from me. He is the only one who still does. Every week, twenty cards, the best I have. He pays in gold and he never haggles and he always says the same thing: “Something to make them want it again.”',
        choices: [
          { text: 'You know what he uses them for.', to: 'know' },
          { text: 'Why do you keep selling to him?', to: 'why' },
        ],
      },
      know: { speaker: CS, mood: 'sad', text: 'I know. To make the beaten fight him again, when they’re too tired to want to. I write the cruellest things I can think of, and he pins them on beaten men. (She straightens a card that does not need straightening.) Business is business.', next: 'end' },
      why: { speaker: CS, mood: 'sad', text: 'Because he is the last customer I have, and because he is so very charming, and because when I said no once he looked at me as if I had cut his hand. Nobody says no to Auguste. He doesn’t know what it is for.', next: 'end' },
      end: { speaker: CS, text: 'Ask Lucia Ferro. She said no to him once. Only person in Edgewater who ever has. Look what it cost her.', choices: more(offer('quest:swordsman-the-insult-broker', 'You need new customers. Shall I try some insults out?', 'try')) },
      try: { speaker: CS, mood: 'happy', text: 'Would you? Bless you. Three tired duellists, three fresh insults. If one of them reaches for a sword, I’m saved from that man’s gold. Be cruel, darling. Be quick.', next: null },
    },
  },

  // ======================= I-5 The Ladder Vote: the two ends of the Ladder, and dawn under the board
  {
    id: 'dialogue:swordsman-percy-canvass', name: 'I-5 Percy on the bottom rung', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: PT, mood: 'happy', text: 'The vote? Oh, I’ll be there! I’ve made a rosette. (He shows you: it says RUNG 4,012 in tiny careful stitches.) What does the Ladder mean to me? Gosh. Nobody’s asked me that. Nobody asks rung 4,012 anything.', next: 'mean' },
      mean: {
        speaker: PT, text: 'It means I’m on it. Do you see? I’m a tailor. Nobody in Edgewater looks at a tailor. But I’m on the Ladder, same as Ser Auguste, just a bit further down. If they close it, I’m just a tailor again.',
        choices: [
          { text: 'You’ve lost nine hundred and ninety-nine bouts on it, Percy.', to: 'lost' },
          { text: 'You’d still be Percy.', to: 'percy', trust: 1, trustNpc: PT },
        ],
      },
      lost: { speaker: PT, text: 'I know! But I was in every one of them! (He thinks.) Mind you, some days I’d like to be in a bout that wasn’t the Ladder’s. Just a bout. For fun. Is that allowed?', choices: more(offer('quest:swordsman-rung-4012', 'Would you like to win one?', 'win')) },
      percy: { speaker: PT, mood: 'happy', text: 'I would! I would, wouldn’t I. Percy Thimble, tailor. (He tries it out, and looks surprised to like it.) Well. Vote how you like. I’ll wear the rosette either way.', choices: more(offer('quest:swordsman-rung-4012', 'Would you like to win one?', 'win')) },
      win: { speaker: PT, mood: 'happy', text: 'Win one? Oh, would I! There’s a dummy in the back. I made it myself. It’s very well dressed.', next: null },
    },
  },
  {
    id: 'dialogue:swordsman-bettina-canvass', name: 'I-5 Bettina on what it cost', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: BS, text: 'What has the Ladder cost me? (She does not look away from the bridge.) My sister, child. And thirty years of sitting on this bank. And every Tuesday, when somebody comes by to ask whether I would like to challenge on her behalf.', next: 'cost' },
      cost: {
        speaker: BS, text: 'They mean it kindly. That is how the Ladder works. Everybody means it kindly, and nothing ever stops. If you close it, child, I will be glad. And I will not know what to do with my Tuesdays.',
        choices: [
          { text: 'Would you speak at the Council?', to: 'speak' },
          { text: '(Sit with her a while, looking at the bridge.)', to: 'sit', trust: 1, trustNpc: BS },
        ],
      },
      speak: { speaker: BS, text: 'At my age? In front of all those salles in their colours? (She laughs.) No. But you may tell them a Sarto said: a thing that cannot end is not a tradition. It is a wound that has learned to talk.', choices: more(offer('quest:swordsman-the-sisters-bridge', 'Could I go out to her? To Rosa?', 'go')) },
      sit: { speaker: 'narrator', text: 'You sit. The river goes by under the closed bridge. Out in the middle, a young woman stands en garde against nobody, as she has for thirty years. After a while Bettina pats your hand, once, and lets go.', choices: more(offer('quest:swordsman-the-sisters-bridge', 'Could I go out to her? To Rosa?', 'go')) },
      go: { speaker: BS, text: 'Not with your sword, please. Everyone goes out with a sword. She’s had enough swords.', next: null },
    },
  },
  {
    id: 'dialogue:obj-swordsman-ladder-dawn', name: 'I-5 dawn under the Ladder board', scope: 'party',
    entries: [
      { when: { all: [stage(VOTE, 'dawn'), { flag: 'swordsman.ladder', value: 'closed' }] }, node: 'closed' },
      { when: { all: [stage(VOTE, 'dawn'), { flag: 'swordsman.ladder', value: 'yielded' }] }, node: 'yielded' },
      { when: stage(VOTE, 'dawn'), node: 'kept' },
      { node: 'plain' },
    ],
    nodes: {
      kept: { speaker: 'narrator', text: 'Dawn under the Ladder board. It stands, every chalk line on it, and already somebody is up a ladder with fresh chalk, writing new challenges in over the old. Round the square the duel-graves stand open, and in the early light, very quietly, two more Revenants climb out.', next: 'kept2' },
      kept2: { speaker: 'narrator', text: 'On the bottom of the board, in a neat new hand, somebody has chalked: “RUNG 4,012 CHALLENGES ALL COMERS. TEA PROVIDED.” Percy, by the look of it. Of course it is.', effects: [{ setFlag: 'swordsman.dawn_seen', value: 'kept' }], next: null },
      closed: { speaker: 'narrator', text: 'Dawn under the Ladder board, and the board is coming down. The Council’s carpenters lower it on ropes, a thousand years of names going down into the square face first. Nobody cheers. A few old duellists take their hats off.', next: 'closed2' },
      closed2: { speaker: 'narrator', text: 'Where it stood, the wall behind is pale and clean, the only clean wall in the Quarter. Ferro is standing at the edge of the square in her coat. She watches it all the way down, and then she goes home without speaking to anyone.', effects: [{ setFlag: 'swordsman.dawn_seen', value: 'closed' }], next: null },
      yielded: { speaker: 'narrator', text: 'Dawn under the Ladder board, and it is a different board. All night, duellists have come to it with chalk-cloths. Half the challenges are gone, rubbed out by the people who made them, and beside each smudge, in a hundred different hands, one word: “Yielded.”', next: 'yielded2' },
      yielded2: { speaker: 'narrator', text: 'Round the square, the duel-graves are closing over by themselves, slowly, like eyes. Somebody has left a bunch of white lilies on the bottom rung with no card at all.', effects: [{ setFlag: 'swordsman.dawn_seen', value: 'yielded' }], next: null },
      plain: { speaker: 'narrator', text: 'The Ladder board, under the morning sun.', next: null },
    },
  },

  // ======================= I-6 The Grand Salle: the practice rooms (one per salle room)
  clue('swordsman-salle-piste-1', 'I-6 a practice room (1)', stage('quest:swordsman-the-grand-salle', 'pistes'),
    'A practice room with its touch-board still on the wall, a thousand years of scores in tiny chalk. Every line ends with the same mark, a little crossed sword: the old sign for a bout that was finished, saluted and done.', 'swordsman.piste_1',
    'An empty practice room, the touch-board wiped.'),
  clue('swordsman-salle-piste-2', 'I-6 a practice room (2)', stage('quest:swordsman-the-grand-salle', 'pistes'),
    'In the second room, the last bouts on the board are dated C. 1012. After that, nothing is finished. The scores go on and on and on, the same pairs of names, hundreds of rematches, and not one crossed sword after them.', 'swordsman.piste_2',
    'A practice room, its touch-board crowded with chalk.'),
  clue('swordsman-salle-piste-3', 'I-6 a practice room (3)', stage('quest:swordsman-the-grand-salle', 'pistes'),
    'The third room has a single line on its board, very old, in a clerk’s best hand: “The Perfect Parry against all comers. Untouched.” Below it, in a thousand years of different chalks, every challenger who tried. The list stops at the wall’s edge. There was no room left.', 'swordsman.piste_3',
    'A practice room with a very long list on its wall.', 'From the next room, steady as a heartbeat, you hear a blade parrying nothing.'),

  // ======================= I-7 The Unended: walking the gallery
  clue('swordsman-unended-face-1', 'I-7 the Unended Gallery (1)', stage('quest:swordsman-the-unended', 'faces'),
    'A Revenant in the colours of the Salle Orsi, fencing the empty air with great care: the founder whose challenge you struck off the board, a hundred years dead. Vellacourt beat him in C. 1014, the plaque at his feet says, and kept him.', 'swordsman.face_1',
    'A Revenant of the Salle Orsi, fencing nobody.'),
  clue('swordsman-unended-face-2', 'I-7 the Unended Gallery (2)', stage('quest:swordsman-the-unended', 'faces'),
    'A young Revenant in a watchman’s coat, still fencing, still getting better: you can see it, a little sharper with every lunge. Thirty years of practice against nobody. He is the finest swordsman in the gallery. He will never know.', 'swordsman.face_2',
    'A young Revenant in a watchman’s coat.'),
  clue('swordsman-unended-face-3', 'I-7 the Unended Gallery (3)', stage('quest:swordsman-the-unended', 'faces'),
    'At the very end of the gallery, under the best of the light, there is an empty space on the boards, swept clean. A brass plaque at its edge, polished bright: “L. FERRO. Reserved.”', 'swordsman.ferro_reserved',
    'An empty space at the end of the gallery.', 'Behind you, very close, somebody laughs, delighted. “You found it! Isn’t it the best place?”'),

  // ======================= I-9 The Last Lesson: the Salute Stone (codex find)
  {
    id: 'dialogue:obj-swordsman-salute-stone', name: 'I-9 the Salute Stone', scope: 'party',
    entries: [{ when: stage('quest:swordsman-the-last-lesson', 'stone'), node: 'stone' }, { node: 'plain' }],
    nodes: {
      stone: { speaker: 'narrator', text: 'Halfway up the silver-grass road, a waist-high stone with a hollow worn into its top, where a thousand years of duellists have rested a sword-point. Below you lies the whole of Edgewater: the Quarter, the Bridges, the river, the Hall. The custom is to salute it before you go.', next: 'names' },
      names: { speaker: 'narrator', text: 'Cut into the stone’s face, small, are the names of the duellists who went out from here to fence for the Concord at the Turnings, and came back. The last is dated C. 1000. Nobody has left Edgewater by this road since the gate shut.', next: 'salute' },
      salute: {
        speaker: 'narrator', text: 'Your half-stone hums. Down in the city, very faint, a bell is ringing for the end of the morning bouts. Nobody in Edgewater has rung it in thirty years.',
        choices: [
          { text: '(Rest your point in the hollow, and give the closing salute to the city.)', to: 'give', effects: [{ unlockLore: 'lore:hc-swordsman-salute-stone' }] },
          { text: '(Salute it without drawing. A hand to the brow, and down.)', to: 'hand', effects: [{ unlockLore: 'lore:hc-swordsman-salute-stone' }] },
        ],
      },
      give: { speaker: 'narrator', text: 'Point in the hollow, blade to face, and down. Below you, too far away to be sure, something flashes on the Duelling Bridges: a blade, raised and lowered, answering. Then another. You walk on up the road with your sword sheathed.', next: null },
      hand: { speaker: 'narrator', text: 'Hand to brow, and down: the salute without a sword, the one Rosa Sarto gave you back. The wind comes up the road off the river and turns all the silver grass the same way at once, like a crowd bowing.', next: null },
      plain: { speaker: 'narrator', text: 'The Salute Stone, with a sword-point’s hollow in its top.', next: null },
    },
  },
  {
    id: 'dialogue:area-swordsman-silver-grass', name: 'I-9 banter: the silver-grass road', bark: true,
    entries: [{ when: stage('quest:swordsman-the-last-lesson', 'road'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Up ahead, where the road meets the sky, the grass stops being silver and starts being steel: a thousand blades stuck point-down in the earth in ranks, and one in white walking among them, laughing.', next: null } },
  },

  // ======================= Side: Rung 4,012 (the rematch)
  {
    id: 'dialogue:obj-swordsman-rival-tailor', name: 'Rung 4,012: the rematch', scope: 'party',
    entries: [{ when: stage('quest:swordsman-rung-4012', 'rematch'), node: 'shop' }, { node: 'plain' }],
    nodes: {
      shop: { speaker: 'narrator', text: 'Orsola Nappi’s tailoring shop, across the square from Percy’s. Orsola, rung 4,011 no longer, is waiting in the doorway with her sword and a bandage on her elbow, looking very much as though she would like her rung back.', next: 'ask' },
      ask: {
        speaker: 'narrator', text: '“Rematch,” she says. “By law.” Percy looks at her, and at his sword, and at you. Edgewater law says he must answer. It does not say how.',
        choices: [
          { text: '“Tell her no, Percy. You’d like to keep this one.”', to: 'keep', effects: [{ setFlag: 'swordsman.percy_rematch', value: 'kept' }] },
          { text: '“Fence her. Win or lose, then shake hands and stop.”', to: 'fence', effects: [{ setFlag: 'swordsman.percy_rematch', value: 'fenced' }] },
        ],
      },
      keep: { speaker: 'narrator', text: 'Percy takes a deep breath. “No, thank you,” he says, very politely. “I’d like to keep this one. But I’ll take you to lunch.” Orsola stares. Nobody in Edgewater has refused a rematch in thirty years. Then, slowly, she puts her sword down and says she would like soup.', next: null },
      fence: { speaker: 'narrator', text: 'They fence. Orsola wins, three touches to nil, with ease. Then Percy holds out his hand, and she looks at it as if it were a strange fish, and shakes it. “Ended?” she says. “Ended,” says Percy. They go and have soup.', next: null },
      plain: { speaker: 'narrator', text: 'Orsola Nappi’s tailoring shop, with a sign in the window: SOUP WEDNESDAYS.', next: null },
    },
  },

  // ======================= Side: the Insult Broker (the apology)
  {
    id: 'dialogue:swordsman-cosimo-apology', name: 'The Insult Broker: the first apology', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: CB, text: 'A card? From Madame Sallow? (He holds it at arm’s length, the way a man holds a wasp.) Forty years that woman has owed me a duel. She would not fence me. She called my hat “a pie that has given up”.', next: 'read' },
      read: {
        speaker: 'narrator', text: 'He reads the card. It says, in her beautiful printing: “Sir, I withdraw the matter of your hat. It was a very good hat. I was jealous of it. C. S.” Cosimo reads it twice. Then he takes his hat off and looks at it.',
        choices: [
          { text: 'It is a very good hat, Maestro.', to: 'hat', trust: 1, trustNpc: CB },
          { text: 'She wants it ended. Will you end it?', to: 'end' },
        ],
      },
      hat: { speaker: CB, mood: 'happy', text: 'It is. It was my father’s. (He puts it back on, at a slightly jauntier angle.) Forty years. Tell Madame Sallow I accept. And that I have a waistcoat she is welcome to be jealous of, on Sundays.', next: 'close' },
      end: { speaker: CB, text: 'Ended. (He tries the word, like a man trying a step he has not danced in years.) Tell her it is ended. And tell her she may write me a card about my waistcoat, if she likes. I should like to know what she thinks of it.', next: 'close' },
      close: { speaker: CB, text: 'An apology, pre-written. In Edgewater. (He shakes his head.) It will never catch on. Ask her to send me a dozen.', next: null },
    },
  },

  // ======================= Side: the Sisters’ Bridge (the Sarto plot)
  {
    id: 'dialogue:obj-swordsman-sarto-plot', name: 'The Sisters’ Bridge: the Sarto plot', scope: 'party',
    entries: [{ when: stage('quest:swordsman-the-sisters-bridge', 'plot'), node: 'plot' }, { node: 'plain' }],
    nodes: {
      plot: { speaker: 'narrator', text: 'The old duellists’ cemetery on the hill above the river, every stone carved with a crossed pair of swords. In the Sarto plot, between a grandmother and a great-uncle, there is a place that has been waiting for thirty years. Bettina has brought a spade, and a sheet, and Rosa.', next: 'sword' },
      sword: {
        speaker: 'narrator', text: '“Duellists are buried with their swords,” Bettina says. “Drawn. In case.” She holds Rosa’s blade, black at the point, and looks at you. “I don’t want her to be in case of anything any more.”',
        choices: [
          { text: '(Lay the sword across Rosa’s chest, point down, like Varric’s statue.)', to: 'down', effects: [{ setFlag: 'swordsman.rosa_buried', value: 'down' }] },
          { text: '(Break the blade over your knee, and bury it beside her.)', to: 'break', effects: [{ setFlag: 'swordsman.rosa_buried', value: 'broken' }] },
          { text: '(Wrap the blade in the sheet, as if it were sheathed.)', to: 'wrap', effects: [{ setFlag: 'swordsman.rosa_buried', value: 'sheathed' }] },
        ],
      },
      down: { speaker: 'narrator', text: 'Point to her feet, hilt under her hands, the way Varric holds his on the river wall. Bettina nods. “Both swords down,” she says, and starts to fill in the grave herself, slowly, and will not let you help.', next: 'end' },
      break: { speaker: 'narrator', text: 'It breaks cleanly, as if it had been waiting to. Bettina puts both halves in the grave and laughs, shocked at herself. “Our grandmother would have had a fit. Good. She can have it with Rosa. They’ve a lot to catch up on.”', next: 'end' },
      wrap: { speaker: 'narrator', text: 'You wrap the blade in the sheet, round and round, until no edge shows. It is the nearest thing to a scabbard in Edgewater. Bettina lays it beside her sister like a sleeping cat.', next: 'end' },
      end: { speaker: BS, text: '(When it is done, she sits on the grandmother’s stone, out of breath.) There. Late for thirty years, and I got her here in an afternoon. Thank you, child. Go on. I want to sit with my family a bit.', next: null },
      plain: { speaker: 'narrator', text: 'The Sarto plot, above the river. The newest stone is ROSA. Someone has carved the swords on it pointing down.', next: null },
    },
  },

  // ======================= Side: Lunch Is a Challenge (Fosco’s Bridge)
  {
    id: 'dialogue:obj-swordsman-courting-note', name: 'Lunch Is a Challenge: the note to Fosco’s Bridge', scope: 'party',
    entries: [{ when: stage('quest:swordsman-lunch-is-a-challenge', 'note'), node: 'bridge' }, { node: 'plain' }],
    nodes: {
      bridge: { speaker: 'narrator', text: 'Fosco’s Bridge, the next one down the river. Gemma Fosco holds it, by law, against all comers: a tall girl with a sword and a very stern face. “Halt!” she says. Then she sees the note in your hand, and her face stops being stern at all.', next: 'read' },
      read: {
        speaker: 'narrator', text: 'She reads it. It is a poem. It rhymes “Gemma” with “dilemma” twice. She folds it very carefully into her sleeve. “He can’t leave his bridge,” she says, “and I can’t leave mine. It’s the law.”',
        choices: [
          { text: '“The law says ‘a contest of skill’. Challenge him. To lunch. In the middle of the river.”', to: 'lunch', effects: [{ setFlag: 'swordsman.bridge_lunch', value: true }] },
          { text: '“Write back. I’ll carry it.”', to: 'write' },
        ],
      },
      lunch: { speaker: 'narrator', text: 'Gemma stares at you, then at the water, then at the little island halfway between the two bridges. That afternoon, two duellists row out to it from opposite banks, each with a sword and a basket, and hold their island against all comers together.', next: null },
      write: { speaker: 'narrator', text: 'She writes back on the back of his. It rhymes “Tommaso” with nothing at all, and is all the better for it. You carry it up the river, and Tommaso reads it, and has to sit down on his own bridge.', effects: [{ setFlag: 'swordsman.bridge_lunch', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'Fosco’s Bridge. Its holder keeps looking upriver.', next: null },
    },
  },

  // ======================= Side: the Empty Salle (the first lesson)
  {
    id: 'dialogue:obj-swordsman-first-lesson', name: 'The Empty Salle: Percy’s first lesson', scope: 'party',
    entries: [{ when: stage('quest:swordsman-the-empty-salle', 'lesson'), node: 'lesson' }, { node: 'plain' }],
    nodes: {
      lesson: { speaker: 'narrator', text: 'Eight sharp. The Salle Grisi, swept for the first time in thirty years. Master Grisi in his best coat, Percy in a new one, a packed lunch on the bench and a pincushion beside it. Grisi clears his throat. “Lesson one,” he says.', next: 'one' },
      one: {
        speaker: 'narrator', text: 'Grisi does not teach the guard. He does not teach the lunge. He raises his blade to his face and sweeps it down, slowly. “The closing salute. We learn the end first, Signor Thimble, so that you will always know where you are going.” Percy copies it. Badly.',
        choices: [
          { text: '(Stand at the back and give the salute with them.)', to: 'join' },
          { text: '(Stay quiet. It is their lesson.)', to: 'quiet' },
        ],
      },
      join: { speaker: 'narrator', text: 'Three blades rise and fall in the empty salle: an old master, a tailor and you. Grisi pretends not to notice. His eyes are wet. “Again,” says Percy, eagerly, and then claps his hand over his mouth. Grisi laughs out loud.', effects: [{ setFlag: 'swordsman.grisi_lesson', value: true }], next: null },
      quiet: { speaker: 'narrator', text: 'You stay at the back. Percy salutes eleven times, and on the twelfth it is nearly right, and Grisi says “Good,” and Percy goes so red he has to sit down. It is the first time anyone has said good to him about a sword.', effects: [{ setFlag: 'swordsman.grisi_lesson', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The Salle Grisi, swept. A pincushion has been left on the bench.', next: null },
    },
  },

  // ======================= Side: Varric’s Statue (the second statue)
  {
    id: 'dialogue:obj-swordsman-second-statue', name: 'Varric’s Statue: the second statue', scope: 'party',
    entries: [{ when: stage('quest:swordsman-varrics-statue', 'second'), node: 'mud' }, { node: 'plain' }],
    nodes: {
      mud: { speaker: 'narrator', text: 'In the river shallows below the far bank, half sunk in silt, lies a stone duellist on its back, face to the sky. Weed has grown in its hair. Its sword is held exactly as Varric’s is: down and out, point to the ground, offered.', next: 'plinth' },
      plinth: { speaker: 'narrator', text: 'You clear the silt from its base. The inscription is short: SER ODO OF THE SCHOOL OF ASH, WHO PUT HIS SWORD DOWN SECOND. Across the river, on the wall, Varric is facing this way. He has been facing an empty plinth for thirty years.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'It is far too heavy to move alone.',
        choices: [
          { text: '(Turn its face towards Varric, at least.)', to: 'turn', effects: [{ unlockLore: 'lore:hc-swordsman-two-swords' }, { setFlag: 'swordsman.second_statue', value: true }] },
          { text: '(Leave a marker on the bank, so Grisi can bring help.)', to: 'mark', effects: [{ unlockLore: 'lore:hc-swordsman-two-swords' }, { setFlag: 'swordsman.second_statue', value: true }] },
        ],
      },
      turn: { speaker: 'narrator', text: 'It takes all your strength and most of your temper, but the stone head comes round in the mud until it looks across the water at Varric. On the river wall, just for a moment, the black stops running down Varric’s cheek.', next: null },
      mark: { speaker: 'narrator', text: 'You drive a practice blade into the bank, point down, as a marker. By the time you are back across the river, Master Grisi has already gone down to the water with three of his old students and a great deal of rope.', next: null },
      plain: { speaker: 'narrator', text: 'Ser Odo, in the shallows, looking across the river at Varric.', next: null },
    },
  },

  // ======================= Side: A Sheath for Once (Ferro’s scabbard)
  {
    id: 'dialogue:swordsman-ferro-scabbard', name: 'A Sheath for Once: Ferro’s scabbard', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: LF, text: 'What is that. (She knows what it is. She has gone very still.) Dulcie Bellows made a scabbard? A Bellows? Gods. Her grandmother will be spinning like a whetstone.', next: 'give' },
      give: {
        speaker: LF, text: 'And you have brought it to me. Because you think you know which sword in Edgewater most needs putting away.',
        choices: [
          { text: 'The one you beat him with. In the cupboard.', to: 'cupboard', trust: 1 },
          { text: 'Dulcie said the first one should go to the right sword.', to: 'right' },
        ],
      },
      cupboard: { speaker: LF, mood: 'sad', text: '(She goes to the cupboard and takes out a long bundle wrapped in an old coat, and unwraps it, and for a moment simply looks at the blade.) Thirty years in a coat. As if it were cold.', next: 'sheathe' },
      right: { speaker: LF, text: 'Dulcie Bellows has opinions. Her grandmother had them too. (She goes to the cupboard and takes out a long bundle wrapped in an old coat.) Thirty years in a coat. As if it were cold.', next: 'sheathe' },
      sheathe: { speaker: 'narrator', text: 'She slides the sword into the scabbard. It goes home with a small, final sound, like a door closing on a warm room. Ferro stands holding it for a long while. Her hand is not shaking.', next: 'end' },
      end: { speaker: LF, text: 'Tell Dulcie it fits. Tell her it fits as if it had been waiting. (She puts it back in the cupboard, sheathed, and does not wrap it in the coat.) And get out before I have to say something about it.', next: null },
    },
  },

  // ======================= Side: the Armoury Roll (the Drill Yard)
  {
    id: 'dialogue:obj-swordsman-drill-yard', name: 'The Armoury Roll: the Drill Yard', scope: 'party',
    entries: [{ when: stage('quest:swordsman-the-armoury-roll', 'yard'), node: 'yard' }, { node: 'plain' }],
    nodes: {
      yard: { speaker: 'narrator', text: 'Behind the Armoury, the old Drill Yard, open to the sky. The automatons have been busy. All across the cobbles, swords lie in pairs, hilt to hilt, hundreds of them, laid out with terrible neatness. Every pair has a label tied on: two names, and a date.', next: 'pairs' },
      pairs: { speaker: 'narrator', text: 'You read some. Rematches. Every one a bout somebody lost, laid out ready for the morning, for the loser to come and fight again. The automatons have been setting up Edgewater’s grudges for it, every night, for thirty years. Nobody asked them to stop.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'An automaton is standing at the edge of the yard with a sword in each hand, waiting to lay out the next pair.',
        choices: [
          { text: '(Take its two swords and lay them down crossed: the old mark of a bout that is over.)', to: 'cross', effects: [{ setFlag: 'swordsman.drill_yard', value: 'crossed' }] },
          { text: '(Leave it. Tell Strop. This is the Armoury’s business.)', to: 'tell', effects: [{ setFlag: 'swordsman.drill_yard', value: 'told' }] },
        ],
      },
      cross: { speaker: 'narrator', text: 'You lay them down crossed. The automaton looks at the crossed swords for a long time, ticking. Then it picks up the next pair from the yard and lays those crossed too, and the next, and the next. You leave it working. It is working a good deal faster than before.', next: null },
      tell: { speaker: 'narrator', text: 'Strop comes out and looks at the yard for a long time. Then he takes out his roll and begins, in a small fierce hand, to write down every pair. “If they are going to be fought,” he says, “they are going to be counted.”', next: null },
      plain: { speaker: 'narrator', text: 'The old Drill Yard behind the Armoury.', next: null },
    },
  },

  // ======================= Optional areas (Claude 2): finds in Edgewater’s ruin, cave and viewpoint
  find('blade-capital-ruin-find', 'Edgewater ruin: the old lists',
    'In the ruin, among fallen benches round a sunken square of sand, stands a board older than the Ladder: the Lists, where Edgewater fenced before there was a Ladder at all. Its chalk has long gone. What is left is carved: two columns, BEGUN and ENDED, and every line has a mark in both.',
    'lore:hc-blade-capital-ruin'),
  find('blade-capital-cave-find', 'Edgewater cave: the seconds’ wall',
    'At the end of the cave, in the cellars where duellists used to come to settle things out of the Watch’s sight, the walls are covered in seconds’ marks: little scratched pairs of swords, crossed, one for every quarrel ended down here. Thousands of them. None newer than C. 1012.',
    'lore:hc-blade-capital-cave'),
  find('blade-capital-cave-codex', 'The Duel Cellars: a second’s notebook',
    'A second’s notebook, fallen behind a barrel: the duties of the man who stands beside a duellist. “See that the blades are equal. See that the ground is fair. And when it is over, take your friend’s sword from his hand before he can lift it again. That is the whole of the job.”',
    'lore:hc-blade-capital-tally'),
  find('blade-capital-view-find', 'Edgewater viewpoint: the bridges',
    'From the viewpoint you can see all nineteen Duelling Bridges at once, and on every one a figure en garde, holding it against all comers. Somebody has cut a tally into the rail for each bridge: how many years since anybody crossed it without a fight. The highest is thirty.',
    'lore:hc-blade-capital-view'),
  {
    id: 'dialogue:area-blade-capital-view', name: 'Edgewater viewpoint banter',
    bark: true, entries: [{ when: { heroClass: 'swordsman' }, node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'From up here the Fencing Quarter is a tiny clatter, like cutlery. Somebody on the nearest bridge has just shouted “Again!” and somebody on the next one has shouted back “Oh, give it a rest!”', next: null } },
  },
  // ======================= ACT II, C-1 The Watch House Ladder: your name in chalk
  {
    id: 'dialogue:area-swordsman-green', name: 'C-1 banter: across the Brindlecross green', bark: true,
    entries: [{ when: stage(SC1, 'watch'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'From across the green you can hear it before you see it: chalk on a wall, and somebody saying “That was never a touch,” and somebody else saying “It was a touch in Edgewater.” Home, nearly.', next: null } },
  },
  {
    id: 'dialogue:obj-swordsman-watch-ladder', name: 'C-1 the Watch House Ladder', scope: 'party',
    entries: [{ when: stage(SC1, 'ladder'), node: 'wall' }, { node: 'plain' }],
    nodes: {
      wall: { speaker: 'narrator', text: 'The Watch House Ladder is chalked on the whitewash by the door, twelve rungs, rubbed out and rewritten so often the wall has gone grey. “1. Mattie Tupper. Best bunk.” “7. Hal Furrow. Snores.” “8 and 9. The Dunnow brothers. Disputed.”', next: 'chalk' },
      chalk: {
        speaker: 'narrator', text: 'At the bottom, in Basilio’s old-fashioned hand: “12. Ser B. Trento, rung 61 (Edgewater), retired.” The chalk hangs on a string by the door.',
        choices: [
          { text: '(Chalk your name where Rook told you.)', to: 'name' },
          { text: '(Chalk Ferro’s name above the Ladder, small, where nobody will rub it out.)', to: 'ferro' },
          { text: '(Chalk the closing salute beside your name, the Edgewater way.)', to: 'salute', school: 'blade' },
        ],
      },
      name: { speaker: 'narrator', text: 'You chalk it in. A farmer leaning on the doorpost reads it, nods, and goes inside to tell the others that the new one can spell.', next: 'rook' },
      ferro: { speaker: 'narrator', text: 'You chalk “L. Ferro” in the corner above the top rung, very small. Then your own name where Rook said. Nobody asks. Basilio sees it, and goes quiet, and buys you a pint.', next: 'rook' },
      salute: { speaker: 'narrator', text: 'Your name, and beside it the little crossed stroke that means a bout was ended, not won. Basilio sees it and laughs out loud, the first time anybody on the green has heard him laugh.', next: 'rook' },
      rook: { speaker: 'npc:rook', text: '(From inside.) If you’ve finished decorating my wall, the graveyard’s that way. Take Hobb’s lantern. Bring my Ladder back a name, not a gap.', effects: [{ setFlag: 'swordsman.watch_ladder', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The Watch House Ladder, chalked on the whitewash. Your name is on it.', next: null },
    },
  },

  // ======================= ACT II, C-4 The Champion’s Climb: the Lightning Jar
  {
    id: 'dialogue:area-swordsman-cliff-road', name: 'C-4 banter: the road to the Stormcliffs', bark: true,
    entries: [{ when: stage(SC4, 'jar'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'The wind off the Stormcliffs smells of rain and lamp-oil. Somewhere above it all a bird is screaming the same news over and over, and nobody on the road looks up any more.', next: null } },
  },
  {
    id: 'dialogue:obj-swordsman-jar-slate', name: 'C-4 the slate at the Lightning Jar', scope: 'party',
    entries: [{ when: stage(SC4, 'jar'), node: 'slate' }, { node: 'plain' }],
    nodes: {
      slate: { speaker: 'narrator', text: 'Behind the bar of the Lightning Jar hangs a slate, and across the top, in a beautiful flowing hand: “ON A. VELLACOURT, CHAMPION. EVERYONE. AGAIN.” Under it, in the landlady’s square capitals: “HE NEVER PAID.”', next: 'sword' },
      sword: {
        speaker: 'narrator', text: 'Over the slate, nailed to the wall like a trophy, is a cheap tavern sword snapped in two. A card is tucked in the crack: “Settled, with thanks. A fair touch. A. V.” He challenged the landlady over the bill. He won.',
        choices: [
          { text: '(Pay his bill.)', to: 'pay', effects: [{ setFlag: 'swordsman.jar_paid', value: true }] },
          { text: '(Read the card again.)', to: 'card' },
          { text: '(Look at the break in the blade.)', to: 'break', school: 'blade' },
        ],
      },
      pay: { speaker: 'narrator', mood: 'happy', text: 'You put your coin on the bar. The landlady looks at it, and at you, and rubs out “HE NEVER PAID” with her thumb. “You’re not him,” she says. “Good. He went up the Spire stair singing.”', next: null },
      card: { speaker: 'narrator', text: '“A fair touch.” It is the kind thing he says to every opponent, the one he said to you on the bridges. He means it every time. That is the worst of him.', next: 'up' },
      break: { speaker: 'narrator', text: 'A clean break, one finger’s width from the hilt. He chose the spot. He could have taken her hand off, and he took the sword instead, and then he bought everybody a drink. Then he did not pay for it.', next: 'up' },
      up: { speaker: 'narrator', text: 'Out of the window you can see the Storm Spire stair going up into the lightning. There is chalk on the first step.', next: null },
      plain: { speaker: 'narrator', text: 'The slate at the Lightning Jar, and a broken tavern sword nailed above it.', next: null },
    },
  },

  // ======================= ACT II, C-5 The Stormcrow: Vellacourt’s glove
  clue('swordsman-spire-glove', 'C-5 Vellacourt’s glove on the Spire rail', stage(SC5, 'glove'),
    'Snagged on the iron rail at the edge of the Spire top, where he went over laughing: a white kid glove, Vellacourt’s sword-hand. The fingers are stained black inside, as if the tears had started at his fingertips and were working their way up his arm.', 'swordsman.glove_found',
    'The iron rail at the top of the Storm Spire, bare now.', 'Tucked in the cuff, as always, is one of his challenge cards: “A. Vellacourt challenges whoever finds this. Again!” On the back, in a hand much less steady than the front: “It will not stop. Why will it not stop?”'),

  // ======================= ACT II, C-6 A Letter from Ferro: the answer
  {
    id: 'dialogue:obj-swordsman-reply-arch', name: 'C-6 your answer in the Blade arch', scope: 'party',
    entries: [{ when: stage(SC6, 'reply'), node: 'slot' }, { node: 'plain' }],
    nodes: {
      slot: { speaker: 'narrator', text: 'In the keystone of the Blade arch is the slot where you pulled out the old challenge sword. A Ladder challenge always went in the keystone. So does an answer, if it is short enough.', next: 'write' },
      write: {
        speaker: 'narrator', text: 'Ferro wrote you two words. On the back of her letter, in the same number, you write:',
        choices: [
          { text: '“Ending it.”', to: 'sent', effects: [{ setFlag: 'swordsman.reply', value: 'ending' }] },
          { text: '“Not alone.”', to: 'sent', effects: [{ setFlag: 'swordsman.reply', value: 'alone' }] },
          { text: '“Teach Percy.”', to: 'percy', effects: [{ setFlag: 'swordsman.reply', value: 'percy' }] },
          { text: '“Thank you.”', to: 'sent', when: { trust: LF, value: 'trusted' }, effects: [{ setFlag: 'swordsman.reply', value: 'thanks' }] },
        ],
      },
      percy: { speaker: 'narrator', mood: 'happy', text: 'Somewhere in Edgewater, one day soon, a retired champion is going to read that, say a word Percy is not allowed to hear, and go and unlock her salle.', next: 'sent' },
      sent: { speaker: 'narrator', text: 'You fold the letter small and push it into the keystone. The stone takes it with a sound like a sword going home. Two words there, two words back. She will approve of the economy.', next: null },
      plain: { speaker: 'narrator', text: 'The keystone of the Blade arch, with a folded paper in the old challenge slot.', next: null },
    },
  },

  // ======================= ACT III, Ferro’s Ribbon: Percy mends the banner
  {
    id: 'dialogue:swordsman-percy-banner', name: 'Ferro’s Ribbon: Percy and the banner', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: PC, text: 'A banner? The Blade banner? Rotten? With HER ribbon going on it? (He has his coat off before you finish.) Give me an hour and the lining of my good coat. No. Give me the hour. I’ll give the lining.', next: 'sew' },
      sew: {
        speaker: 'narrator', text: 'He sits cross-legged by the fire with the banner across his knees and darns it with green Edgewater silk out of his coat, very fast, talking the whole time, with pins in his mouth.',
        choices: [
          { text: 'Percy, that was your best coat.', to: 'coat' },
          { text: '(Hold the lamp for him.)', to: 'lamp', trust: 1, trustNpc: PC },
        ],
      },
      coat: { speaker: PC, text: 'It was! And now it’s a banner! That’s a promotion, for a coat. (Through the pins.) Hold still. I’m not talking to you, I’m talking to the swords.', next: 'done' },
      lamp: { speaker: PC, mood: 'happy', text: 'Thank you. A tailor’s second holds the lamp. You’re very good at it. Rung one, for lamp-holding.', next: 'done' },
      done: { speaker: PC, mood: 'happy', text: '(He bites off the thread.) There. It’ll hold till the next Turning, and the one after, and if it doesn’t, tell them who sewed it, and I’ll come and do it again.', effects: [{ setFlag: 'swordsman.banner_mended', value: true }], next: null },
    },
  },

  // ======================= ACT III, The Kept Opponents: the boy from rung 400
  {
    id: 'dialogue:obj-swordsman-kept-boy', name: 'The Kept Opponents: the boy at the foot of the Stairs', scope: 'party',
    entries: [
      { when: { all: [stage(KEPT, 'boy'), { flag: 'swordsman.nemesis_fate', op: '==', value: 'spared' }] }, node: 'spared' },
      { when: { all: [stage(KEPT, 'boy'), { flag: 'swordsman.nemesis_fate', op: '==', value: 'destroyed' }] }, node: 'destroyed' },
      { when: stage(KEPT, 'boy'), node: 'boy' },
      { node: 'plain' },
    ],
    nodes: {
      boy: { speaker: 'narrator', text: 'At the foot of the Twelve Stairs stands a boy in a rung-400 sash, dead these thirty years, in guard, facing up the steps. He is waiting for the champion to come down and say “again”, or anything at all.', next: 'ask' },
      spared: { speaker: 'narrator', text: 'At the foot of the Twelve Stairs stands a boy in a rung-400 sash, dead these thirty years, in guard, facing up the steps. Somewhere up there a tired man in white is sitting with his sword laid down. The boy cannot see him.', next: 'ask' },
      destroyed: { speaker: 'narrator', text: 'At the foot of the Twelve Stairs stands a boy in a rung-400 sash, dead these thirty years, in guard, facing up the steps, waiting for a champion who is not coming down again.', next: 'ask' },
      ask: {
        speaker: 'narrator', text: 'He does not look round. Very quietly, as if he were not allowed to ask, he says: “Is it over?”',
        choices: [
          { text: 'Nearly. Come back to your line, and I’ll tell all of you at once.', to: 'line' },
          { text: '(Lower your sword in front of him, point to the ground.)', to: 'lower' },
        ],
      },
      line: { speaker: 'narrator', text: 'He thinks about it for a long time, the way boys do who have been told off too often. Then he turns, and walks back to the Legion camp beside you, in guard the whole way.', effects: [{ setFlag: 'swordsman.kept_boy', value: true }], next: null },
      lower: { speaker: 'narrator', text: 'He looks at your sword on the ground. His own comes down an inch, and goes up again, as if it had been caught doing something wrong. But he follows you back to the line.', effects: [{ setFlag: 'swordsman.kept_boy', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'Small boot-prints at the foot of the Twelve Stairs, going back.', next: null },
    },
  },

  // ======================= ACT III, Percy’s Thousandth: the Heart Ladder
  {
    id: 'dialogue:obj-swordsman-percy-chalk', name: 'Percy’s Thousandth: the Heart Ladder', scope: 'party',
    entries: [{ when: stage(PERCY, 'chalk'), node: 'step' }, { node: 'plain' }],
    nodes: {
      step: { speaker: 'narrator', text: 'On the first step of the Twelve Stairs, in large and loving chalk: “THE HEART LADDER. 1. P. THIMBLE, Edgewater, ONE TOUCH (a pin).” Percy is standing beside it with the chalk held out to you, glowing.', next: 'chalk' },
      chalk: {
        speaker: PC, mood: 'happy', text: 'A Ladder needs two rungs at least, or it’s only a boast. Go on. Put yourself second. You’ve earned it. Nearly.',
        choices: [
          { text: '(Chalk your name at rung two.)', to: 'two', effects: [{ setFlag: 'swordsman.heart_ladder', value: 'two' }] },
          { text: '(Chalk “2. A Hollow Legionnaire. Very sporting.”)', to: 'sport', effects: [{ setFlag: 'swordsman.heart_ladder', value: 'legionnaire' }] },
          { text: '(Chalk the closing salute under his name instead.)', to: 'salute', school: 'blade', effects: [{ setFlag: 'swordsman.heart_ladder', value: 'salute' }] },
        ],
      },
      two: { speaker: PC, text: 'Second! Under me! Ferro will never believe it. Nobody in Edgewater will believe it. I’m going to have it drawn.', next: null },
      sport: { speaker: PC, mood: 'happy', text: 'Oh, that’s right, that’s only fair. He was very sporting. (He adds a smiling face beside it, then rubs it out hurriedly, because that was Vellacourt’s.)', next: null },
      salute: { speaker: PC, mood: 'sad', text: '(He looks at it for a long while.) The bout’s ended, not won. Yes. That’s better. That’s what she would have chalked. (He blows his nose.)', next: null },
      plain: { speaker: 'narrator', text: 'The Heart Ladder, chalked on the first step of the Twelve Stairs. It has two rungs.', next: null },
    },
  },
];

export default dialogues;
