/**
 * Hollow Crown, HUNTSMAN Act I depth pass (10-campaign-style.md §8, docs/PACING.md): the new stages' scenes,
 * investigation clues, travel banter, optional finds and the third parts of the side quests. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const NIGHT: NarrativeCondition = { hour: [21, 4] };
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const offer = (q: Q, text: string, to: string): DialogueChoice => ({ text, to, quest: true, when: fresh(q), effects: [{ startQuest: q }] });
/** a stage scene that takes over an NPC's talk must still let them give their own quests */
const more = (...offers: DialogueChoice[]): DialogueChoice[] => [...offers, { text: 'Thank you.', to: null }];
const BN = 'npc:ulric-bannock' as const, CO = 'npc:corva-ashby' as const, JF = 'npc:jem-furlong' as const;
const GL = 'npc:griselda-lusk' as const, HR = 'npc:hesketh-ruddock' as const;

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
  // ======================= I-1 The Bell in the Antlers: the walk home, Bannock’s hearth
  {
    id: 'dialogue:area-huntsman-yard-walk', name: 'I-1 banter: through the Lodge Yards', bark: true,
    entries: [{ when: stage('quest:huntsman-the-bell-in-the-antlers', 'home'), node: 'b' }],
    nodes: { b: { speaker: BN, text: 'Left at the smokehouse. Mind the gutter, it’s mostly hound. Biscuit, heel. Biscuit. Well. Near enough.', next: null } },
  },
  {
    id: 'dialogue:huntsman-bannock-hearth', name: 'I-1 Bannock’s hearth', scope: 'party',
    entries: [{ node: 'in' }],
    nodes: {
      in: { speaker: 'narrator', text: 'Bannock’s hearth is one low room: an enormous chair worn into the shape of him, a smaller chair nobody sits in, and Biscuit already flat on the rug as if she had never left it. Over the fire, a set of old antlers is still humming, very faintly.', next: 'kettle' },
      kettle: { speaker: BN, text: 'Sit. That one. It was my grandfather’s, and it’s the only chair in Antlerford that won’t complain. (He puts the kettle on very carefully, as if it might startle.) Tea. Then bed. Then the count.', next: 'hum' },
      hum: { speaker: 'narrator', text: 'When you sit down, the antlers over the fire hum louder. When Bannock looks at them, they stop. He looks at you instead, and then, quickly, at the kettle.', next: 'ask' },
      ask: {
        speaker: BN, text: 'I said I wouldn’t ask, and I won’t. But if a thing were singing in me, I’d want somebody to know where it was taking me. In case it led me off.',
        choices: [
          { text: 'It wants the Trophy Hall. Something in there is singing back.', to: 'hall', effects: [{ setFlag: 'huntsman.told_bannock', value: true }] },
          { text: 'I don’t know what it is.', to: 'dunno' },
          { text: '[Hunt] It’s like a scent. It pulls the way a trail pulls.', to: 'scent', school: 'hunt' },
        ],
      },
      hall: { speaker: BN, mood: 'afraid', text: 'The Hall. (He sets his cup down.) The Ashbys have hung heads on those walls for three hundred years. Whatever’s in there was bought, and the Barons don’t sell back. Don’t go knocking at her gates at night again. Not yet.', next: 'count' },
      dunno: { speaker: BN, text: 'No. Neither do I. That’s honest, at least. Honest is a good start. Most of the Lodge never gets past it.', next: 'count' },
      scent: { speaker: BN, mood: 'happy', text: '(He very nearly smiles.) Then you’ll follow it whatever I say. Good. A hunter who can be talked off a trail isn’t one. Only mind whose land it crosses.', next: 'count' },
      count: {
        speaker: BN, text: 'Tomorrow the Lodge walks the Elkway to count the herd, as it has every autumn for a thousand years. I’ve walked it fifty times. I’d like you with me this year.',
        choices: [
          { text: 'Why me?', to: 'why' },
          { text: 'I’ll be there.', to: 'end', trust: 1 },
        ],
      },
      why: { speaker: BN, mood: 'sad', text: 'Because the count goes down every year, and I’ve stopped wanting to do it on my own. And because Biscuit likes you. She has never liked anyone but me and the butcher.', next: 'end' },
      end: { speaker: 'narrator', text: 'He gives you a blanket that smells of dog and woodsmoke. Biscuit climbs onto the end of your cot, sighs like a bellows and goes to sleep on your feet. Under your ribs the humming goes on, warm and patient, all night.', next: null },
    },
  },

  // ======================= I-2 Count the Herd: the tally stone, the elk tracks
  {
    id: 'dialogue:huntsman-tally-stone', name: 'I-2 the tally stone', scope: 'party',
    entries: [{ node: 'stone' }],
    nodes: {
      stone: { speaker: 'narrator', text: 'The tally stone stands where the Elkway crosses the ford: a standing stone scored from top to bottom with a thousand years of notches, one row for every autumn’s count. The newest rows are very short.', next: 'book' },
      book: { speaker: BN, text: '(He opens the tally book on the stone and licks a pencil.) My grandfather’s line: eleven thousand. My father’s: eight. Mine, last autumn: three hundred and twelve. We stand here, and they come down out of the trees, and we count. That’s all it is.', next: 'wait' },
      wait: {
        speaker: 'narrator', text: 'You wait. The ford runs. Nothing comes down out of the trees. Then, among the birches, something very large stands up that was lying down.',
        choices: [
          { text: '[Hunt] (Read the wind before you move.)', to: 'wind', school: 'hunt' },
          { text: 'Master Bannock. In the trees.', to: 'trees' },
        ],
      },
      wind: { speaker: 'narrator', text: 'The wind is at your back, carrying your scent straight into the birches. A herd would have run. These have not run. They are coming closer, one slow step at a time, and their eyes are wet and black.', next: 'trees' },
      trees: { speaker: BN, mood: 'afraid', text: '(Very quietly.) Elk. Four. Standing wrong. Don’t turn your back on them. Whatever you do, don’t look away.', next: null },
    },
  },
  clue('huntsman-elk-track-1', 'I-2 the elk tracks (1)', stage('quest:huntsman-count-the-herd', 'tracks'),
    'The elk did not come down the Elkway. Their tracks come in from the side, out of the deep wood, where the leaf-mould is churned in a wide ring, round and round, as if a herd had walked in circles here for days.', 'huntsman.elk_track_1',
    'Churned leaf-mould under the birches.'),
  clue('huntsman-elk-track-2', 'I-2 the elk tracks (2)', stage('quest:huntsman-count-the-herd', 'tracks'),
    'At the middle of the ring the tracks bunch and stop and turn back, again and again, like water against a weir. Something here once told the herd which way to go, and it is not here now.', 'huntsman.elk_track_2',
    'A place where many hooves turned back.'),
  clue('huntsman-elk-track-3', 'I-2 the elk tracks (3)', stage('quest:huntsman-count-the-herd', 'tracks'),
    'In the ditch at the heart of the ring lies a tumble of grey stones and one old elk antler, half sunk in the moss, its points turned up at the sky. Stones laid by hands, and pulled down by them.', 'huntsman.elk_circle',
    'A tumble of grey stones in a ditch.', 'The herd has been walking round the place where a cairn stood, waiting for it to tell them where north is.'),

  // ======================= I-4 The Baron’s Bonfire: Corva’s hide on the Elkway
  {
    id: 'dialogue:area-huntsman-hide-ride', name: 'I-4 banter: riding out to the hide', bark: true,
    entries: [{ when: stage('quest:huntsman-the-barons-bonfire', 'hide'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Silver horseshoes ring on the Elkway stones somewhere ahead of you. Corva Ashby rides the way she does everything else: at exactly the speed she means to.', next: null } },
  },
  {
    id: 'dialogue:huntsman-corva-hide', name: 'I-4 Corva hunts', scope: 'party',
    entries: [{ node: 'up' }],
    nodes: {
      up: { speaker: 'narrator', text: 'Corva’s hide is a platform in an oak above a clearing, swept clean, with a cushion on it and a second cushion beside it, set out for you. At the far edge of the clearing a boar is rooting in the leaves.', next: 'look' },
      look: {
        speaker: CO, text: '(Without looking round.) Quietly. Look at its eyes. The left one is still brown. The right one began to run at dusk. By morning both will be black, and it will go for the first thing that moves.',
        choices: [
          { text: 'How do you know it turned tonight?', to: 'how' },
          { text: '[Hunt] It’s still rooting. It still thinks it’s a boar.', to: 'still', school: 'hunt' },
          { text: 'Let me drive it off the road instead.', to: 'drive' },
        ],
      },
      how: { speaker: CO, text: 'Because I watch for it. Every night, for a year now. You learn the hour. It is always the first night, tracker. The first night is the only one that matters.', effects: [{ setFlag: 'huntsman.first_night', value: true }], next: 'shot' },
      still: { speaker: CO, mood: 'sad', text: 'Yes. It does. On the first night they still know what they are. (Her voice does not change at all.) That is why it has to be tonight.', effects: [{ setFlag: 'huntsman.first_night', value: true }], next: 'shot' },
      drive: { speaker: CO, text: 'Off the road to where? The next village? Your Lodge’s kennels? No. It goes nowhere. It ends here, cleanly, while it can still feel clean.', next: 'shot' },
      shot: { speaker: 'narrator', text: 'She lifts the crossbow, breathes out and shoots. One bolt. The boar lies down in the leaves as if it had decided to, and does not get up.', next: 'kneel' },
      kneel: {
        speaker: 'narrator', text: 'Corva climbs down, kneels by it and closes the brown eye with one gloved finger. She says something too quietly to hear. Then she stands, says “Wait here,” and walks off into the trees alone.',
        choices: [
          { text: '(Wait, as she asked.)', to: 'wait' },
          { text: '(Follow her, quietly.)', to: 'follow' },
        ],
      },
      wait: { speaker: 'narrator', text: 'She is gone a long minute. When she comes back her face is dry, her gloves are on, and she is already counting the bolts in her quiver.', next: 'end' },
      follow: { speaker: 'narrator', text: 'She is standing with her forehead against a birch, quite still, her shoulders shaking. You step on a twig. Without turning round she says, perfectly level, “I asked you to wait, tracker.” You go back and wait.', effects: [{ setFlag: 'huntsman.corva_wept', value: true }], next: 'end' },
      end: { speaker: CO, text: 'That is how I hunt. Quickly, alone, and never twice. Now go and tell Master Bannock his debts are paid, and that I would be glad to talk to him about the charter. He will know what that means.', next: null },
    },
  },

  // ======================= I-5 The Old Law: canvassing the kennels and the Tannery Lanes
  {
    id: 'dialogue:huntsman-jem-canvass', name: 'I-5 Jem on the charter', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: JF, text: 'The charter? I’ll tell you what the charter is, from where I stand. It’s forty hounds’ meat. Lady Ashby paid the butcher. First time in three years these dogs have eaten every day.',
        choices: [
          { text: 'So you’d sell it.', to: 'sell' },
          { text: 'And if the Barons hold the law?', to: 'law' },
        ],
      },
      sell: { speaker: JF, text: 'I didn’t say that. (He scratches a hound behind the ear.) I said they’re eating. A full dog’s a lovely thing. A full dog that’s been sold is something else.', next: 'end' },
      law: { speaker: JF, mood: 'afraid', text: 'Then they say what a hound is for. A Baron’s hound is for driving. I’ve seen Baron hounds after a season. They don’t lie on your feet. They don’t lie anywhere.', next: 'end' },
      end: { speaker: JF, text: 'Say what you think in the hall. The dogs will forgive you either way. That’s the thing about dogs.', choices: more(offer('quest:huntsman-hounds-facing-east', 'Why are they all lying facing east?', 'east')) },
      east: { speaker: JF, text: 'That’s what I’d like to know. They stand up after dark and stare at the Antler Gate. Walk them out to the east milestone tonight, and see what they’re waiting for.', next: null },
    },
  },
  {
    id: 'dialogue:huntsman-lusk-canvass', name: 'I-5 Lusk on the charter', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: GL, text: 'The charter. (She doesn’t stop scraping.) Here’s the Lanes’ view. Barons with a licence means a cull. A cull means hides. Hides mean the Lanes eat this winter. The Lodge’s old law never fed anybody in this street.',
        choices: [
          { text: 'Even weeping hides?', to: 'weep' },
          { text: 'What would the old law cost you?', to: 'cost' },
          { text: 'You stopped selling the back-room pelts. That already costs you.', to: 'stopped', when: { flag: 'huntsman.back_room' } },
        ],
      },
      weep: { speaker: GL, mood: 'angry', text: 'Clean ones, if they burn the bad. I’m not a fool. I just like eating.', next: 'end' },
      cost: { speaker: GL, mood: 'sad', text: 'My father’s yard, and his father’s. There were thirty tanners in the Lanes when the herd came down the road. There are six. You can’t eat a law.', next: 'end' },
      stopped: { speaker: GL, text: '(She looks at her black-stained hands.) Yes. It does. So I’d like the next lot of hides to come from somewhere honest, and I don’t much care whose law that is, as long as it’s honest.', next: 'end' },
      end: { speaker: GL, text: 'Vote how you like. The Lanes will tan whatever the woods give them. We always have.', next: null },
    },
  },

  // ======================= I-6 The Swollen Queen: the herd’s flight
  {
    id: 'dialogue:area-huntsman-elkway-flight', name: 'I-6 banter: on the herd’s trail', bark: true,
    entries: [{ when: stage('quest:huntsman-the-swollen-queen', 'trail'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Broken bracken, a dropped bolt, the smell of frightened elk. All of it running south and downhill, the way water goes when it has given up.', next: null } },
  },
  clue('huntsman-flight-sign-1', 'I-6 the herd’s flight (1)', stage('quest:huntsman-the-swollen-queen', 'trail'),
    'A birch with the bark torn off at shoulder height, still wet. Something big ran into it in the dark and did not stop. Black hairs are caught in the wound.', 'huntsman.flight_1',
    'A birch with its bark torn away.'),
  clue('huntsman-flight-sign-2', 'I-6 the herd’s flight (2)', stage('quest:huntsman-the-swollen-queen', 'trail'),
    'Hoofprints, dozens of them, all pointing downhill, so close together that they overlap. These animals were not grazing or wandering. They were all running from the same thing at the same time.', 'huntsman.flight_2',
    'Old hoofprints, all pointing downhill.'),
  {
    id: 'dialogue:obj-huntsman-flight-sign-3', name: 'I-6 the herd’s flight (3)', scope: 'party',
    entries: [
      { when: { all: [stage('quest:huntsman-the-swollen-queen', 'trail'), { flag: 'huntsman.charter', value: 'sold' }] }, node: 'sold' },
      { when: { all: [stage('quest:huntsman-the-swollen-queen', 'trail'), { flag: 'huntsman.charter', value: 'road' }] }, node: 'road' },
      { when: stage('quest:huntsman-the-swollen-queen', 'trail'), node: 'kept' },
      { node: 'plain' },
    ],
    nodes: {
      sold: { speaker: 'narrator', text: 'A Baron’s hunting horn, dropped in the bracken, its silver mouth dented. Round it, the prints of a whole pack of raven-collared hounds, driving everything ahead of them towards the Hollows. The cull is lawful now. It looks like this.', effects: [{ setFlag: 'huntsman.flight_3', value: true }], next: null },
      road: { speaker: 'narrator', text: 'Three sets of tracks that tried to turn north at a new cairn, turned, stumbled and fell away south. The road called them, and they were too sick to answer it.', effects: [{ setFlag: 'huntsman.flight_3', value: true }], next: null },
      kept: { speaker: 'narrator', text: 'A Lodge arrow, fletched in Lodge grey, buried in a stump. Some hungry Lodge hunter shot at shadows in the night, with no licence and no lantern, and everything ran from the noise.', effects: [{ setFlag: 'huntsman.flight_3', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'Trampled bracken at the lip of the Tick Hollows.', next: null },
    },
  },

  // ======================= I-7 The Empty Wall: Corva’s game book
  {
    id: 'dialogue:obj-huntsman-game-book', name: 'I-7 Corva’s game book', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-empty-wall', 'book'), node: 'book' }, { node: 'plain' }],
    nodes: {
      book: { speaker: 'narrator', text: 'Quentin Snipe’s lodge is empty and the door is on the latch. On the table, square to the edge, lies Lady Ashby’s game book, open, with a clean cup on one corner to hold the page. He has left it where you would see it, and gone out.', next: 'read' },
      read: {
        speaker: 'narrator', text: 'A year of kills in Quentin’s neat hand: date, beast, place, one bolt. Beside each, in Corva’s own hand, the same two words: “first night.” Forty entries. Forty first nights.',
        effects: [{ setFlag: 'huntsman.game_book', value: true }],
        choices: [
          { text: '[Hunt] (Turn back to the start of the book.)', to: 'back', school: 'hunt' },
          { text: '(Leave the cup where it was.)', to: 'last' },
        ],
      },
      back: { speaker: 'narrator', text: 'The early pages are another kind of hunt altogether: stags in their prime, a white wolf, boars, all taken in daylight, all for the wall. Then, a year ago, the entries change, as if somebody had decided what hunting was for.', next: 'last' },
      last: { speaker: 'narrator', text: 'At the foot of the last page, in Corva’s hand, there is a new line with no date beside it yet: “The Great Hunt. End wall. One bolt.”', next: null },
      plain: { speaker: 'narrator', text: 'Quentin Snipe’s lodge, as tidy as a drawer.', next: null },
    },
  },

  // ======================= I-9 The Last Count: the Counting Post on the gate road
  {
    id: 'dialogue:area-huntsman-gate-road', name: 'I-9 banter: up the gate road', bark: true,
    entries: [{ when: stage('quest:huntsman-the-last-count', 'post'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'A long way back down the Elkway someone very large is still standing at the tally stone, with an old dog sitting on his foot. You can tell without looking round, from the shape of the quiet.', next: null } },
  },
  {
    id: 'dialogue:obj-huntsman-counting-post', name: 'I-9 the Counting Post', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-last-count', 'post'), node: 'post' }, { node: 'plain' }],
    nodes: {
      post: { speaker: 'narrator', text: 'The Counting Post stands at the side of the gate road, an oak trunk taller than Bannock, cut all over with notches in pairs: one for each Lodge hunter who ran the Turning road beside the Great Hunt, and one beside it for each who came home. Nearly every pair is whole.', next: 'last' },
      last: {
        speaker: 'narrator', text: 'The last row is single notches. Twelve Lodge hunters went up this road for the Turning of C. 1012, and the gate shut behind them, and nobody came back to cut the second.',
        choices: [
          { text: '(Cut a notch of your own, and leave room beside it.)', to: 'cut', effects: [{ unlockLore: 'lore:hc-huntsman-counting-post' }] },
          { text: '(Run your thumb along the last row.)', to: 'row', effects: [{ unlockLore: 'lore:hc-huntsman-counting-post' }] },
        ],
      },
      cut: { speaker: 'narrator', text: 'Your knife goes in clean. You leave a thumb’s width of good oak beside it, for the second notch. Count what you leave as well as what you take.', next: null },
      row: { speaker: 'narrator', text: 'Twelve cuts, gone grey. Under the last one somebody has scratched, much later and very small, “Still counting. U. B.” You walk on north with the shape of it under your thumb.', next: null },
      plain: { speaker: 'narrator', text: 'The Counting Post on the gate road, with one new notch and room beside it.', next: null },
    },
  },

  // ======================= Side: Grandfer Lumm’s Hat (the tally)
  {
    id: 'dialogue:huntsman-ruddock-boar', name: 'Grandfer Lumm’s Hat: the boar in the tally', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: HR, text: 'Enter a boar? For Grandfer Lumm? In the tally? (He takes off his spectacles, polishes them and puts them back on.) Heads counted twice. Where is the head?',
        choices: [
          { text: 'It’s a long story. It’s mostly hat.', to: 'story' },
          { text: 'There are bristles. I’ve seen them.', to: 'story' },
        ],
      },
      story: { speaker: HR, text: 'Every story in this Lodge is mostly hat. (He turns the great tally book back, and back, sixty years, licking his thumb at every page.) Wait. Wait, now.', next: 'found' },
      found: { speaker: 'narrator', text: 'In the tally for a calving moon sixty years ago, in a young man’s careful hand: “One boar, small. Caught in hat. Let go, it being the calving moon. Lumm.”', next: 'turn' },
      turn: {
        speaker: HR, mood: 'happy', text: 'He let it go. Sixty years he’s told that story at every feast, and he has never once told the end of it.',
        choices: [
          { text: 'Then enter it again. In ink, before witnesses.', to: 'enter' },
          { text: 'Don’t tell him we found it.', to: 'keep', trust: 1, trustNpc: 'npc:grandfer-lumm' },
        ],
      },
      enter: { speaker: HR, text: '(He writes under the old line, in the same brown ink as sixty years of everything: “Seen, and counted twice. H. Ruddock.”) There. Now it’s true twice.', next: null },
      keep: { speaker: HR, text: 'Wouldn’t dream of it. A man who lets a boar go and then brags about catching it for sixty years has earned his secret. (He writes “seen” very small in the margin.)', next: null },
    },
  },

  // ======================= Side: Hounds Facing East (the old kennels)
  {
    id: 'dialogue:obj-huntsman-old-kennel-lintel', name: 'Hounds Facing East: the old kennel lintel', scope: 'party',
    entries: [{ when: stage('quest:huntsman-hounds-facing-east', 'lintel'), node: 'lintel' }, { node: 'plain' }],
    nodes: {
      lintel: { speaker: 'narrator', text: 'The old kennels are a burned shell among nettles, out past the east milestone. Over the doorway, charred but whole, an oak lintel is carved with a running stag, and beside it, not behind it, a line of running hounds.', next: 'word' },
      word: {
        speaker: 'narrator', text: 'Under the carving there is one word, cut deep enough to come through a fire: WITH.',
        choices: [
          { text: '[Hunt] (Lay your hand on the carved hounds.)', to: 'hand', school: 'hunt' },
          { text: '(Brush the soot off the word.)', to: 'brush' },
        ],
      },
      hand: { speaker: 'narrator', text: 'The wood is warm under your palm, warmer than the morning. Back in Antlerford, you will hear later, forty hounds stood up in their runs at that moment, and Jem Furlong dropped a bucket.', next: 'brush' },
      brush: { speaker: 'narrator', text: 'It comes up pale and clean. WITH. Not after. Not at. The Lodge hounds never hunted the Great Hunt. They ran beside it, and they are waiting to be asked again.', next: null },
      plain: { speaker: 'narrator', text: 'A burned kennel among the nettles, and a carved lintel that says WITH.', next: null },
    },
  },

  // ======================= Side: the Back Room (Mister Harle’s coat)
  {
    id: 'dialogue:obj-huntsman-harle-door', name: 'The Back Room: Mister Harle’s coat', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-back-room', 'harle'), node: 'door' }, { node: 'plain' }],
    nodes: {
      door: { speaker: 'narrator', text: 'Old Mister Harle is sitting on his own doorstep in a fine new winter coat, with his hands in his lap, watching the Lanes and seeing none of it. The coat is dripping, very slowly, onto his boots.', next: 'girl' },
      girl: {
        speaker: 'narrator', text: 'He does not answer when you speak. His granddaughter, in the doorway behind him, says he hasn’t said a word since he bought it, and he won’t let anybody take it off him.',
        choices: [
          { text: '[Hunt] (Kneel, and talk to him the way you’d talk to a frightened hound.)', to: 'hound', school: 'hunt' },
          { text: '(Take the coat off him, gently, whether he likes it or not.)', to: 'take' },
          { text: 'Mister Harle. Your granddaughter is cold. Lend her your coat.', to: 'lend' },
        ],
      },
      hound: { speaker: 'narrator', text: 'You talk low and slow about nothing: the weather, the herd, the price of tallow. After a long while his hands begin to move. He undoes his own buttons, one at a time, and lets the coat fall off his shoulders.', next: 'after' },
      take: { speaker: 'narrator', text: 'He holds on to the collar with surprising strength, then lets go all at once. The coat lands on the step with a wet sound. He shivers, and keeps shivering, and it looks like the best thing that has happened to him in a month.', next: 'after' },
      lend: { speaker: 'narrator', text: 'He looks at the girl for the first time, really looks. Then he takes the coat off and holds it out to her, and you catch it before she can.', next: 'after' },
      after: { speaker: 'narrator', text: '“Cold,” says Mister Harle, in a voice like a rusty gate, surprised by it. “Cold out. Who let it get so cold?” His granddaughter bursts into tears and puts her own shawl round him.', effects: [{ setFlag: 'huntsman.harle_woken', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'Mister Harle’s doorstep. He waves, these days, and tells you about tallow.', next: null },
    },
  },

  // ======================= Side: Gloves for a Giant (the fitting)
  {
    id: 'dialogue:huntsman-bannock-fitting', name: 'Gloves for a Giant: the fitting', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: BN, text: '(He looks at the gloves in your hands as if they were a summons.) She’s made them. Of course she has. Forty years, and that woman has never once let a thing go.', next: 'on' },
      on: {
        speaker: 'narrator', text: 'He works one enormous hand into the left glove. It goes on as far as the knuckles and stops. He tries the right. The same.',
        choices: [
          { text: 'They’re too small.', to: 'small' },
          { text: '[Hunt] She measured true. She made them small on purpose.', to: 'purpose', school: 'hunt' },
        ],
      },
      small: { speaker: BN, text: 'Too small. (A long pause.) She measured off your whisper, and she has never once been wrong in sixty years. Which means she meant it.', next: 'shop' },
      purpose: { speaker: BN, mood: 'happy', text: '(He stares at them, and then he laughs, a great helpless boom that wakes Biscuit.) On purpose. So I’d have to come in for a fitting. Forty years she’s been after me, and now she’s got me.', next: 'shop' },
      shop: {
        speaker: BN, text: 'Well. I’ll have to go to her shop, then. In daylight. And hold out my hands like a horse at the farrier’s.',
        choices: [
          { text: 'I’ll come with you.', to: 'with', trust: 1 },
          { text: 'You could just not go.', to: 'not' },
        ],
      },
      with: { speaker: BN, mood: 'happy', text: 'Would you? (He looks enormously relieved, and then embarrassed to be.) Tomorrow, then. Early. Before anybody’s about.', next: null },
      not: { speaker: BN, text: 'No. She’s eighty-one, and she sewed them with her eyes shut. A man doesn’t say no to that. A man goes and gets measured.', next: null },
    },
  },

  // ======================= Side: the Gamekeeper’s Notice (the last basket)
  {
    id: 'dialogue:obj-huntsman-snipe-basket', name: 'The Gamekeeper’s Notice: the last basket', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-gamekeepers-notice', 'basket'), node: 'leave' }, { node: 'plain' }],
    nodes: {
      leave: { speaker: 'narrator', text: 'Corva’s hide is empty, the cushions put away, the platform swept. You set Quentin’s basket on the step at the foot of the oak: bread, cold pheasant, a flask, and a napkin folded into a very exact square.', next: 'note' },
      note: {
        speaker: 'narrator', text: 'Tucked under the napkin is a note in Quentin’s hand. It says only: “Eat something.”',
        choices: [
          { text: '(Leave it just as it is.)', to: null },
          { text: '[Hunt] (Brush out your tracks, so it seems to have simply appeared.)', to: 'brush', school: 'hunt' },
        ],
      },
      brush: { speaker: 'narrator', text: 'You walk backwards to the road, sweeping leaves over your prints. Let it be a mystery. She has had too few of those.', next: null },
      plain: { speaker: 'narrator', text: 'The foot of Corva’s oak. Somebody has taken the basket in.', next: null },
    },
  },

  // ======================= Side: the Last Calf (the night watch)
  {
    id: 'dialogue:obj-huntsman-calf-thicket', name: 'The Last Calf: the night watch', scope: 'party',
    entries: [
      { when: { all: [stage('quest:huntsman-the-last-calf', 'night'), NIGHT] }, node: 'night' },
      { when: stage('quest:huntsman-the-last-calf', 'night'), node: 'day' },
      { node: 'plain' },
    ],
    nodes: {
      day: { speaker: 'narrator', text: 'The calf is asleep in the thicket, folded up like a deckchair. Whatever answered it will come after dark. Come back then, and keep still.', next: null },
      night: { speaker: 'narrator', text: 'Near midnight something comes down through the birches towards the thicket: an elk cow, thin as a rake, with black running from both eyes. She stops at the edge of the cover and calls, low. The calf lifts its head.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'The calf gets up on its long legs and looks at her, and then at you. The old law says you may not touch it.',
        choices: [
          { text: '(Step out between them, without touching either.)', to: 'stand', effects: [{ setFlag: 'huntsman.calf_watched', value: 'stood' }] },
          { text: '(Keep still. Let the calf decide.)', to: 'still', effects: [{ setFlag: 'huntsman.calf_watched', value: 'chose' }] },
          { text: '[Hunt] (Lay a false trail away from the thicket, for the cow to follow.)', to: 'trail', school: 'hunt', effects: [{ setFlag: 'huntsman.calf_watched', value: 'trail' }] },
        ],
      },
      stand: { speaker: 'narrator', text: 'You step out between them with your hands at your sides. The cow lowers her head, and for a long moment you think she will charge. Then she turns and goes back into the dark, calling. The calf lies down again.', next: null },
      still: { speaker: 'narrator', text: 'The calf takes one step towards her, then stops, and sniffs, and backs away into the thicket. Somehow it knows. The cow calls once more, and goes.', next: null },
      trail: { speaker: 'narrator', text: 'You crush bracken and drag a branch away north-east, upwind, and the cow, sick and slow, follows the smell of it out of the birches. When you come back, the calf is asleep.', next: null },
      plain: { speaker: 'narrator', text: 'A deep thicket by the Elkway, with a small flattened bed in the middle of it.', next: null },
    },
  },

  // ======================= Side: Unstringing (the silk snare)
  clue('huntsman-silk-snare', 'Unstringing: the silk snare', stage('quest:huntsman-unstringing', 'silk'),
    'By the old cart track, strung low across a deer-path at the height of a calf’s neck: a fresh snare of silk cord, the knots new and tight. Snagged on the stake is a horseshoe nail, and the nail is silver.', 'huntsman.silk_snare',
    'A cut stake by the old cart track.', 'You cut it, coil the cord and pocket the nail. Somebody has been stringing the Old Snares again since the camp fell, and they ride a silver-shod horse.'),

  // ======================= Side: the First Letter (Osric Fallow’s hide)
  {
    id: 'dialogue:obj-huntsman-osric-hide', name: 'The First Letter: Osric Fallow’s hide', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-first-letter', 'hide'), node: 'hide' }, { node: 'plain' }],
    nodes: {
      hide: { speaker: 'narrator', text: 'A warden’s hide in the rocks above the old cart track, roofed with turf and thirty years untouched. Inside: a cold pipe, a blanket gone to lace, and a tally stick notched in fives.', next: 'stick' },
      stick: {
        speaker: 'narrator', text: 'Osric Fallow counted carts, not elk. Thirty-one notches, and burned into the end of the stick with a hot nail, three small crests: a raven over a skull, a boar’s head and a silver horseshoe.',
        choices: [
          { text: '[Hunt] (Read it the Lodge way: what was taken, and what was left.)', to: 'read', school: 'hunt' },
          { text: '(Wrap the stick in the blanket for the Lodge.)', to: 'take' },
        ],
      },
      read: { speaker: 'narrator', text: 'Thirty-one carts, one cairn to a cart, and the Elkway had thirty cairns. Somebody came back for the first one twice.', next: 'take' },
      take: { speaker: 'narrator', text: 'The Barons pulled the cairns down on purpose, the first autumn after the Hollowing, and Osric Fallow sat up here in the cold and counted every cart.', effects: [{ insight: 'cairns_pulled' }, { setFlag: 'huntsman.osric_tally', value: true }, { unlockLore: 'lore:hc-huntsman-osric-tally' }], next: null },
      plain: { speaker: 'narrator', text: 'An old warden’s hide in the rocks, swept out now.', next: null },
    },
  },

  // ======================= Optional areas (Claude 2): finds in the Antlerford ruin, cave and viewpoint
  {
    id: 'dialogue:obj-hunt-capital-ruin-find', name: 'Antlerford ruin: the first Lodge hearth', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'Under a roof long gone stands the hearth of the first Lodge-house, and over it a feast-board cut with notches, one for every Turning the Lodge ran beside the Great Hunt. Eighty-five notches. An eighty-sixth has been begun and not finished: a single cut, half as deep as the rest.', effects: [{ unlockLore: 'lore:hc-hunt-capital-ruin' }], next: null } },
  },
  {
    id: 'dialogue:obj-hunt-capital-cave-find', name: 'Antlerford cave: the shed antlers', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'The floor of the cave is antler, nothing but antler, shed by the herd every spring for a thousand years and packed down like autumn leaves. The top layer is grey and thirty years old. On top of it, by itself, lies one antler that is new this spring.', effects: [{ unlockLore: 'lore:hc-hunt-capital-cave' }], next: null } },
  },
  {
    id: 'dialogue:obj-hunt-capital-cave-codex', name: 'The Shedding Cave: an apprentice’s slate', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'A Lodge apprentice’s slate, wedged in a crack: the cave’s new antlers counted every spring, a different hand each generation, every one signed at the foot. The last count is for C. 1012: “four hundred and six.” Under it, in chalk gone faint: “None. None. None.” Then nothing at all.', effects: [{ unlockLore: 'lore:hc-hunt-capital-slate' }], next: null } },
  },
  {
    id: 'dialogue:obj-hunt-capital-view-find', name: 'Antlerford viewpoint: the Elkway from above', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'From the top of the hill the whole Elkway lies below you, a pale thread through the olive forest from Antlerford to the Antler Gate, with the cairns along it like beads on a string. Most of the beads are missing. Carved into the bench: “Sit here in the calving moon and count them by their breath.”', effects: [{ unlockLore: 'lore:hc-hunt-capital-view' }], next: null } },
  },
  // ======================= ACT II, C-1 Hollis Lodge: the old-law board
  {
    id: 'dialogue:obj-huntsman-old-law-board', name: 'C-1 the old-law board in the lodge hall', scope: 'party',
    entries: [{ when: stage('quest:huntsman-hollis-lodge', 'law'), node: 'board' }, { node: 'plain' }],
    nodes: {
      board: { speaker: 'narrator', text: 'A board of black oak, six feet long, carved in the Greywilds hand, hung over the hall fire so long the smoke has eaten half of it. TAKE ONLY WHAT THE HUNT GIVES. COUNT WHAT YOU LEAVE. Then a gap where the words have gone. Then: AND NEVER TOUCH THE CALF.', next: 'gap' },
      gap: {
        speaker: 'npc:thaddeus-hollis', text: '(At your shoulder.) There were seven lines. We remember three. The rest we do by habit, and habit goes wrong when nobody says why. You’re from the Great Lodge. Do you know the middle?',
        choices: [
          { text: '“Name what you kill, aloud, before you skin it.”', to: 'name', effects: [{ setFlag: 'huntsman.law_line', value: 'name' }] },
          { text: '“Leave the cairns standing, so the herd can find its road.”', to: 'cairns', when: { insight: 'cairns_pulled' }, effects: [{ setFlag: 'huntsman.law_line', value: 'cairns' }] },
          { text: 'I don’t know. Nobody at Antlerford says the middle any more either.', to: 'none' },
        ],
      },
      name: { speaker: 'npc:thaddeus-hollis', mood: 'happy', text: 'Name what you kill. (He says it twice, slowly, as if fitting a key.) Yes. That’s why we always went quiet over a carcass. We thought it was manners. It was a law. I’ll have it cut in again by the Turning. Whenever that is.', next: 'end' },
      cairns: { speaker: 'npc:thaddeus-hollis', mood: 'happy', text: '(He stares at the gap.) The cairns. Of course. Every herd-road in the Greywilds had them and we never knew who kept them up. We did. The law did. (He takes a knife out of his belt.) I’m not waiting for the Turning.', next: 'end' },
      none: { speaker: 'npc:thaddeus-hollis', mood: 'sad', text: '(A long breath.) No. Thirty years on both sides of the arches, and the middle of the law fell out of everybody at once. (He touches the gap.) Then it’ll have to be found again. That’s a hunt, too.', next: 'end' },
      end: { speaker: 'npc:thaddeus-hollis', text: 'Go on, then. The Stag’s trail. I’ll show you where it starts. I’m coming with you as far as the head of it, and you can argue all you like.', next: null },
      plain: { speaker: 'narrator', text: 'The old-law board over the hall fire at Hollis Lodge.', next: null },
    },
  },

  // ======================= ACT II, C-2 The Stag’s Road: Thaddeus to the trail-head
  {
    id: 'dialogue:area-huntsman-lodge-path', name: 'C-2 banter: Thaddeus on the lodge path', bark: true,
    entries: [{ when: { any: [stage('quest:huntsman-the-stags-road', 'escort'), stage('quest:huntsman-the-stags-road', 'regroup')] }, node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Thaddeus stumps along the lodge path with his stick, naming every tree as he passes it, aloud, the way he must have been taught as a boy. “Beech. Beech. Oak, and a bad-tempered one. Beech.” When a hollowed thing moves in the bracken he names that too, and keeps walking.', next: null } },
  },
  {
    id: 'dialogue:huntsman-thaddeus-trail', name: 'C-2 Thaddeus at the head of the Stag’s trail', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:thaddeus-hollis', text: '(Leaning on his stick at the head of the trail, looking at the ground.) There. See it? A print in the frost. I haven’t seen one of those since the last Turning. I was sure I’d remembered it wrong. I hadn’t.', next: 'boy' },
      boy: {
        speaker: 'npc:thaddeus-hollis', mood: 'sad', text: 'My father brought me over from the Greywilds for a Turning when I was a boy, and walked me down this trail behind the procession. The Stag in front, the crown behind it, and every hunter in the Gloamwood with empty hands. Nobody carried a bow. You don’t, behind the Stag.',
        choices: [
          { text: 'Why didn’t you go home, when the arches shut?', to: 'home' },
          { text: 'Walk it with me.', to: 'walk', trust: 1, trustNpc: 'npc:thaddeus-hollis' },
        ],
      },
      home: { speaker: 'npc:thaddeus-hollis', text: 'I was courting a Brindlecross girl, and she said she’d come over with me after the Turning. Then there was no after. She’s in Hobb’s churchyard now, and I’ve kept the lodge, and Maren comes and goes. A man can be at home in two places. It’s just harder.', next: 'rule' },
      walk: { speaker: 'npc:thaddeus-hollis', mood: 'happy', text: '(He laughs.) With these knees? No. This far was the gift. The rest is yours. (He taps the frost-print with his stick, very gently.) But I’ll stand here till you come back. That’s allowed.', next: 'rule' },
      rule: { speaker: 'npc:thaddeus-hollis', text: 'Remember. Nothing. Not a pelt, not a mushroom, not a shot, however easy it looks. The trail will offer. That’s how it asks who you are.', next: null },
    },
  },

  // ======================= ACT II, C-3 The White Stag: telling Thaddeus
  {
    id: 'dialogue:huntsman-thaddeus-stag', name: 'C-3 Thaddeus hears the Stag is at rest', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:thaddeus-hollis', text: '(In the lodge doorway, both hands on his stick.) The wood stopped weeping an hour ago. Every bird in the Gloamwood went quiet, and then they all started again at once. Tell me.', next: 'tell' },
      tell: {
        speaker: 'narrator', text: 'You tell him: the deep glade, the long run, the kneeling, the mark. And the way the Stag looked at you at the end, as if it were counting you.',
        choices: [
          { text: 'It knelt in the moss. It wasn’t afraid.', to: 'knelt' },
          { text: 'I named it, before the end. Aloud.', to: 'named', when: { flag: 'huntsman.law_line', value: 'name' } },
        ],
      },
      knelt: { speaker: 'npc:thaddeus-hollis', mood: 'sad', text: 'No. It wouldn’t be. It walked in front of a crown for a thousand years. It knew what being followed was for. (He wipes his eyes, crossly.) Smoke. The hall chimney draws badly.', next: 'end' },
      named: { speaker: 'npc:thaddeus-hollis', mood: 'happy', text: '(He is quiet for a long time.) Then it went the old way. Named, and counted. That’s more than most of us will get. (He wipes his eyes, crossly.) Smoke. The hall chimney draws badly.', next: 'end' },
      end: { speaker: 'npc:thaddeus-hollis', text: 'Joss has been looking for you. Something about a woman in a Baron’s coat. He’s been very quiet all week, and Joss is never quiet. Go and see him before he bursts.', next: null },
    },
  },

  // ======================= ACT II, C-4 The Baron’s List: Corva’s sign
  ...[
    'A hoofprint in the soft ground by the lodge ford, shod in silver. Joss was right. Nobody in the Gloamwood shoes a horse in silver, except somebody who wants to be tracked by people who know what silver costs.',
    'A camp-fire site at a crossing of the deer-paths, buried the Lodge way, turf cut and set back, so tidily you would never find it unless you had been taught by the same people. Somebody taught Corva Ashby the old law. She uses it to hide.',
    'Pinned to a birch with a crossbow bolt, at exactly head height, a card in a flourishing hand: “To whoever the Lodge sends. Turn back. I would very much rather not. — C. A.” The bolt has gone clean through the tree.',
  ].map((text, i): DialogueDef => clue(`huntsman-corva-sign-${i + 1}`, `C-4 Corva’s sign (${i + 1})`, stage('quest:huntsman-the-barons-list', 'sign'),
    text, `huntsman.corva_sign_${i + 1}`, 'Old sign on the deer-paths of the Gloamwood.')),

  // ======================= ACT II, C-5 The Spinner Below: the end of Corva’s rope
  {
    id: 'dialogue:obj-huntsman-corva-rope', name: 'C-5 the end of Corva’s rope', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-spinner-below', 'rope'), node: 'rope' }, { node: 'plain' }],
    nodes: {
      rope: { speaker: 'narrator', text: 'Forty yards of silk rope from Joss’s stall, hanging from the roof of the web, cut clean through ten feet from the floor. Below it, a heavy bolt buried in the Spinner’s silk, a hand’s breadth from where its heart was. She missed. She has never missed.', next: 'tape' },
      tape: {
        speaker: 'narrator', text: 'Caught in the silk beside the bolt, a tailor’s measuring tape of black tears, still damp, marked off in inches up to the length of a woman’s arm. Somebody was holding her still to take her measurements when she fired. That is why she missed.',
        choices: [
          { text: '(Pull the bolt out of the web.)', to: 'bolt', effects: [{ setFlag: 'huntsman.corva_bolt', value: true }] },
          { text: '(Cut the tape and let it fall into the dark.)', to: 'tape_cut' },
        ],
      },
      bolt: { speaker: 'narrator', text: 'It comes out hard. Her mark is on the fletching: a crow on an antler. You put it in your quiver. If you meet her again, you can give it back to her, and tell her where it went.', next: null },
      tape_cut: { speaker: 'narrator', text: 'You cut it. It falls away into the dark below the web without a sound, the inches running off it like water. Whoever is measuring Corva Ashby for the Heart will have to start again.', next: null },
      plain: { speaker: 'narrator', text: 'A cut silk rope, hanging from the roof of the Spinner’s web.', next: null },
    },
  },

  // ======================= ACT II, C-6 A Letter by Hawk: the reply
  {
    id: 'dialogue:obj-huntsman-reply-sorrel', name: 'C-6 a reply for Bannock', scope: 'party',
    entries: [{ when: stage('quest:huntsman-a-letter-by-hawk', 'reply'), node: 'hawk' }, { node: 'plain' }],
    nodes: {
      hawk: { speaker: 'narrator', text: 'Sorrel is on the old milestone by the Gate Circle with one foot held out, empty, the way a toll-keeper holds out a hand. You have the back of Bannock’s letter and a stub of charcoal. There is room for about a dozen words.', next: 'write' },
      write: {
        speaker: 'narrator', text: 'What do you send the Master of the Great Lodge?',
        choices: [
          { text: '“The White Stag is at rest. I counted it. I didn’t cross it out.”', to: 'sent', effects: [{ setFlag: 'huntsman.reply', value: 'counted' }] },
          { text: '“Hollis Lodge stands. Thaddeus says the middle of the law fell out. Send it.”', to: 'sent', effects: [{ setFlag: 'huntsman.reply', value: 'law' }] },
          { text: '“Wear the gloves.”', to: 'gloves', effects: [{ setFlag: 'huntsman.reply', value: 'gloves' }] },
        ],
      },
      gloves: { speaker: 'narrator', text: 'Two words. You think of Mistress Pockle measuring his hands by touch for forty years, and of Bannock pulling them on at the tally stone with that face he makes when he is being kind on purpose. It is the most Lodge letter you have ever written.', next: 'sent' },
      sent: { speaker: 'npc:sorrel', text: '(The goshawk lets you tie it on without biting, which is a great honour, looks at you down its beak, and goes: up off the milestone, once round the Gate Circle to make a point, and away north towards the Antler Gate and home.)', next: null },
      plain: { speaker: 'narrator', text: 'The old milestone by the Gate Circle, splashed white.', next: null },
    },
  },

  // ======================= ACT III, the Homeward Call: the banner, the count
  {
    id: 'dialogue:obj-huntsman-stair-banner', name: 'The Homeward Call: the Lodge’s banner on the Hunt stair', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-homeward-call', 'banner'), node: 'banner' }, { node: 'plain' }],
    nodes: {
      banner: { speaker: 'narrator', text: 'Halfway up the Hunt stair, on an iron arm, the Great Lodge’s Turning banner: an elk in white on green, faded to the colour of moss. Every twelve years the Master of the Lodge carried it up these steps behind the Stag. The last hand to set it in this socket was Ulric Bannock’s.', next: 'knot' },
      knot: {
        speaker: 'narrator', text: 'Tied to the pole, under the banner, a strip of tally-cord with knots in it: one knot for every Turning the Lodge came to. Eighty-four. The last knot is tied very tight, by somebody with big hands, in a hurry, the night it all went wrong.',
        choices: [
          { text: '(Tie the eighty-fifth knot.)', to: 'tie', effects: [{ setFlag: 'huntsman.banner_knot', value: true }] },
          { text: '(Leave the cord as it is. That knot is his to tie.)', to: 'leave' },
        ],
      },
      tie: { speaker: 'narrator', text: 'You tie it, the Lodge way, one turn and a tuck. Eighty-five. The banner stirs on its pole, though there is no wind on the Hunt stair, and the elk on it lifts its head an inch, the way the herd lifts its head at the first note of a call.', next: null },
      leave: { speaker: 'narrator', text: 'You leave it. When he comes up these stairs again, if he does, he can tie it himself, with his new gloves on, and swear at how fiddly it is. You find you would very much like to see that.', next: null },
      plain: { speaker: 'narrator', text: 'The Great Lodge’s banner on the Hunt stair, an elk on green.', next: null },
    },
  },
  {
    id: 'dialogue:obj-huntsman-heart-tally', name: 'The Homeward Call: the count at the Heart camp', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-homeward-call', 'tally'), node: 'board' }, { node: 'plain' }],
    nodes: {
      board: { speaker: 'narrator', text: 'The side-board of a supply cart at the Heart camp, scrubbed, with a knife to cut it. At the end of a count the Lodge writes down what answered, and does not cross it out. You heard the bellow come back over the Weeping Wall: one deep voice, and then many.', next: 'count' },
      count: {
        speaker: 'narrator', text: 'How many?',
        choices: [
          { text: '(Cut the number you counted, exactly. Every voice.)', to: 'exact', effects: [{ setFlag: 'huntsman.heart_count', value: 'exact' }] },
          { text: '[Hunt] (Cut “ENOUGH”, the old word for a herd that will survive.)', to: 'enough', school: 'hunt', effects: [{ setFlag: 'huntsman.heart_count', value: 'enough' }] },
        ],
      },
      exact: { speaker: 'narrator', text: 'You cut it deep, every notch, and do not round it. A bearer from the Iron stair stops to read it, counts the notches under her breath, and goes off looking thoughtful. Numbers are a kind of hope, if you leave them standing.', next: null },
      enough: { speaker: 'narrator', mood: 'happy', text: 'ENOUGH, in the Greywilds letters off the old-law board. It is a word that has not been cut on a tally in thirty years. In the morning someone has drawn an elk beside it, badly, and someone else has drawn a calf.', next: null },
      plain: { speaker: 'narrator', text: 'A cart-board at the Heart camp, cut with a Lodge count.', next: null },
    },
  },

  // ======================= ACT III, the Gamekeeper: the tenth notice
  {
    id: 'dialogue:obj-huntsman-tenth-notice', name: 'The Gamekeeper: the tenth notice', scope: 'party',
    entries: [
      { when: { all: [stage('quest:huntsman-the-gamekeeper', 'notice'), { flag: 'huntsman.nemesis_fate', value: 'spared' }] }, node: 'spared' },
      { when: stage('quest:huntsman-the-gamekeeper', 'notice'), node: 'cairn' },
      { node: 'plain' },
    ],
    nodes: {
      spared: { speaker: 'narrator', text: 'Quentin’s pack at the camp’s edge, open: nine folded notices, every one addressed “To Lady Ashby, with respect”. The tenth is half written, in pencil, and the pencil has stopped at the end of a sentence: “I find I am not able to leave your service, because”.', next: 'sparedQ' },
      sparedQ: {
        speaker: 'npc:quentin-snipe', text: '(Behind you, with two buckets.) I couldn’t think how to finish it. Twenty years, and she’s never once asked me anything but whether I’d eaten. (He sets the buckets down.) What would you put?',
        choices: [
          { text: '“…because somebody has to ask you that, too.”', to: 'ask', trust: 1, trustNpc: 'npc:quentin-snipe' },
          { text: '“…because I don’t want to.” That’s enough.', to: 'want' },
        ],
      },
      ask: { speaker: 'npc:quentin-snipe', mood: 'happy', text: '(He writes it, slowly, and reads it over, and his ears go red.) She’ll hate that. She’ll keep it. (He folds it in with the other nine.) Ten. I can stop writing them now.', next: null },
      want: { speaker: 'npc:quentin-snipe', text: '(He writes it, and looks at it.) Because I don’t want to. (He laughs, a little shakily.) Twenty years, and that’s the whole of it. I’ll give her this one. The first one I’ve ever handed in.', next: null },
      cairn: { speaker: 'narrator', text: 'Quentin’s pack at the camp’s edge, open: nine folded notices, every one addressed “To Lady Ashby, with respect”. The tenth is finished. It is addressed to nobody. It says: “Notice is hereby given that I have done the last thing. Q. Snipe, Gamekeeper.”', next: 'cairnQ' },
      cairnQ: {
        speaker: 'npc:quentin-snipe', mood: 'sad', text: '(Behind you, with two buckets.) I wrote it at the cairn. I don’t know who to give it to. The Lodge, I suppose. Somebody should know a gamekeeper finished his work.',
        choices: [
          { text: 'Give it to me. I’ll take it to Bannock.', to: 'take', effects: [{ setFlag: 'huntsman.snipe_notice', value: true }] },
          { text: 'Put it on the cairn, with the crossbow.', to: 'cairnput' },
        ],
      },
      take: { speaker: 'npc:quentin-snipe', text: '(He hands it over, carefully, as if it might break.) Tell him she shot straight to the end. She’d want that said. She’d want it said exactly.', next: null },
      cairnput: { speaker: 'npc:quentin-snipe', text: 'Under the top stone, then, where it won’t blow away. (He squares it, very exactly.) She always did read everything I gave her. Even the notices. Especially those.', next: null },
      plain: { speaker: 'narrator', text: 'Quentin Snipe’s pack at the edge of the Heart camp, buckled shut.', next: null },
    },
  },

  // ======================= ACT III, the Calf on the Stair: the night watch
  {
    id: 'dialogue:obj-huntsman-calf-watch', name: 'The Calf on the Stair: the night watch', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-calf-on-the-stair', 'watch'), node: 'sit' }, { node: 'plain' }],
    nodes: {
      sit: { speaker: 'narrator', text: 'You sit with your back to a wagon wheel at the far end of the line, bow across your knees, facing the dark. Behind you the calf breathes slow and even. Out past the last fire, things that used to be deer drift along the edge of the light, black and dripping, and look in.', next: 'come' },
      come: {
        speaker: 'narrator', text: 'One comes closer than the rest: a hollowed doe, by its shape, nosing at the air where the calf’s smell is. It does not attack. It only looks, the way a mother looks along a line of strangers.',
        choices: [
          { text: '(Stand up, slowly, between it and the calf.)', to: 'stand' },
          { text: '[Hunt] (Name it aloud, the old way, so it is counted.)', to: 'name', school: 'hunt', effects: [{ setFlag: 'huntsman.doe_named', value: true }] },
        ],
      },
      stand: { speaker: 'narrator', text: 'You stand. It looks at you for a long time, black water running off its muzzle, and then turns and goes back into the dark with the others. You do not sit down again until the sky over the Heart goes grey.', next: 'dawn' },
      name: { speaker: 'narrator', text: '“Doe of the Elkway, counted.” It lifts its head at the sound of the old words, and stands quite still, and then it lies down, at the very edge of the light, and stays there all night, facing the calf, like a watch of its own.', next: 'dawn' },
      dawn: { speaker: 'narrator', mood: 'happy', text: 'At dawn the calf gets up, stretches every one of its knees, and walks straight past you to the edge of the camp, to the place where the dark things stood, and sniffs the ground there for a long time. Then it comes back, and waits to be led.', next: null },
      plain: { speaker: 'narrator', text: 'The far end of the wagon line, where somebody sat up all night.', next: null },
    },
  },

];

export default dialogues;
