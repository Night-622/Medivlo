/** Hollow Crown, RANGER Act I main dialogues (the Thornwilds). Owner: Claude 4. */
import type { DialogueDef } from '@/core';

type Q = `quest:${string}`;
const HB = 'npc:holt-barrow' as const, AM = 'npc:aldo-mire' as const, PV = 'npc:primula-vetch' as const;

/** one object scene per numbered set piece: the quest-stage text, then a plain line afterwards */
const objs = (slug: string, q: Q, stage: string, texts: string[], after: string): DialogueDef[] =>
  texts.map((text, i) => ({
    id: `dialogue:obj-${slug}-${i + 1}` as const, name: `${slug} ${i + 1}`,
    entries: [{ when: { questStage: q, stage }, node: 'now' }, { node: 'after' }],
    nodes: { now: { speaker: 'narrator', text, next: null }, after: { speaker: 'narrator', text: after, next: null } },
  }));

const dialogues: DialogueDef[] = [
  // ---------- I-1 The Bell in the Thorns
  {
    id: 'dialogue:ranger-watch-night', name: 'I-1 night watch at Wayfarer’s Rest', scope: 'party',
    entries: [{ node: 'watch' }],
    nodes: {
      watch: { speaker: 'narrator', text: 'Night watch on the lookout above Wayfarer’s Rest. Pine-smoke, owls, and the whole dark Thornwilds below. Holt Barrow is sitting beside you with his knees up, which means he is about to tell the joke.', next: 'joke' },
      joke: { speaker: HB, text: 'So. A beetle, a boar and a Circle witch walk into the Thornwilds. And the beetle says to the boar…', next: 'bell' },
      bell: { speaker: 'narrator', text: 'Somewhere very far away a bell rings once. Below you every path in the Thornwilds moves at once, with a sound like a rug being shaken out. Trees step sideways. A trail that ran north now runs east. And up the camp’s rope-ladders come the Thorn Beetles, hundreds of them, clicking.', next: 'holt' },
      holt: { speaker: HB, mood: 'angry', text: 'Every time. Every single time. Ladders! Knock them off the ladders!', next: null },
    },
  },
  {
    id: 'dialogue:ranger-bell-rings', name: 'I-1 the song wakes', scope: 'party',
    entries: [{ node: 'song' }],
    nodes: {
      song: { speaker: 'narrator', text: 'The last beetle drops off the ladder and goes clicking away into a forest that is no longer where it was. In the quiet, something under your ribs has started to sing. It is low and brown and patient, and it smells of leaf-mould after rain.', next: null },
    },
  },
  {
    id: 'dialogue:ranger-holt-bell', name: 'I-1 Holt on the lookout', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: HB, text: 'Paths moved. All of them. Haven’t moved like that since I was a lad. (He sniffs.) You smell of leaf-mould. More than usual.',
        choices: [
          { text: 'Something is singing in my chest.', to: 'sing' },
          { text: 'What did the beetle say to the boar?', to: 'joke' },
        ],
      },
      joke: { speaker: HB, text: 'Later. It needs a run-up. (He looks at you properly.) You’re glowing.', next: 'sing' },
      sing: {
        speaker: HB, text: 'Rot half. My grandad said half the Verdant Stone fell in the Rotwood when the crown broke. Said it’d call a Wayfarer one day. Didn’t say it’d be one I taught to tie their boots.',
        choices: [
          { text: 'What do I do?', to: 'do' },
          { text: 'You taught me well.', to: 'well', trust: 1 },
        ],
      },
      well: { speaker: HB, text: 'Hm. (This is, for Holt, a speech of great emotion.)', next: 'do' },
      do: { speaker: HB, text: 'Same as always. Walk the ways. But first I want to see how bad it is. (He is already on the steps.) Map-stone. Come on. Bring the lantern.', next: null },
    },
  },
  // ---------- I-2 Walk the Ways
  ...objs('wayfarer-blaze', 'quest:ranger-walk-the-ways', 'blazes', [
    'The first waymark: an old pine with the Wayfarer blaze cut at shoulder height, an arrow over three notches. The path it pointed down now points at a pond. You cut it fresh, pointing the right way, and the pond looks embarrassed.',
    'The second waymark has walked fifty paces overnight and is standing in a bramble patch, looking innocent. You cut it fresh. The bramble shuffles away.',
    'The third waymark is on a birch that has fallen across the trail. You blaze the stump instead, and leave the birch where it lies, to rot honestly, the way Holt taught you.',
    'The fourth waymark is fine. Absolutely fine. It is the only thing in the Thornwilds that did not move last night. You cut it fresh anyway, out of respect.',
    'The fifth waymark stands at the edge of a grey place. The bramble here is the colour of ash, brittle, dead without having died. On every thorn hangs a bead of black, like dew that forgot to be water. You cut the blaze and the bark weeps black around the knife.',
  ], 'A fresh Wayfarer blaze, still pale where the knife went in.'),
  {
    id: 'dialogue:ranger-holt-blight', name: 'I-2 report on the blight', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: HB, text: 'All five? Good. (He reads your face.) Not good.',
        choices: [
          { text: 'There’s grey blight past the fifth mark. And black tears on the thorns.', to: 'blight' },
          { text: 'The blight isn’t rotting anything. It’s just dead.', to: 'dead', insight: 'ranger_dead_blight' },
        ],
      },
      dead: { speaker: HB, text: 'Rot’s a living thing. Rot eats. If it’s not eating, it’s not rot. (He doesn’t like that. You can tell because he stops whittling.)', next: 'blight' },
      blight: { speaker: HB, mood: 'afraid', text: 'Tears. Out here. Thought they were a Concordia thing. Thought the gate kept them off.', next: 'carts' },
      carts: { speaker: HB, text: 'And something’s been eating the supply carts on the trail. Whole. Wheels and all. Go and look. Take the good bow.', next: null },
    },
  },
  // ---------- I-3 The Wallow
  ...objs('eaten-cart', 'quest:ranger-the-wallow', 'carts', [
    'A supply cart turned on its side, one wheel bitten clean through. The sacks have been torn open and the flour eaten, and the sacks eaten, and most of the cart. Tusk-marks as wide as your hand.',
    'The second cart is mostly a memory. Around it, hoofprints the size of dinner plates, and tufts of moss gone grey-black, leading away downhill to a wallow that steams in the cold.',
  ], 'A wrecked cart on the supply trail.'),
  {
    id: 'dialogue:obj-mossback-carcass', name: 'I-3 the Mossback Boar', scope: 'party',
    entries: [{ when: { questStage: 'quest:ranger-the-wallow', stage: 'carcass' }, node: 'boar' }, { node: 'after' }],
    nodes: {
      boar: {
        speaker: 'narrator', text: 'The Mossback Boar lies in its wallow, enormous and still. Under the grey moss it is all ribs. It ate the carts because it was starving: whatever the tears did to it, they made it hungry and gave it nothing.',
        choices: [
          { text: 'Dress it. It’ll feed the camp all winter.', to: 'dress', effects: [{ setFlag: 'ranger.boar', value: 'dressed' }] },
          { text: 'Leave it for the forest. Let it feed what it should.', to: 'leave', effects: [{ setFlag: 'ranger.boar', value: 'left' }] },
        ],
      },
      dress: { speaker: 'narrator', text: 'It takes you the rest of the day. Most of the meat is clean, under the grey. The camp will eat well this winter, and Dunmore will be unbearable about it.', next: null },
      leave: { speaker: 'narrator', text: 'You leave it where it lies. By evening the crows have come, and the beetles, and a fox, and the forest is starting, slowly, to eat. That, at least, is honest.', next: null },
      after: { speaker: 'narrator', text: 'The Mossback Wallow, steaming in the cold.', next: null },
    },
  },
  {
    id: 'dialogue:ranger-holt-wallow', name: 'I-3 report on the boar', scope: 'party',
    entries: [{ when: { flag: 'ranger.boar', value: 'left' }, node: 'left' }, { node: 'dressed' }],
    nodes: {
      dressed: {
        speaker: HB, text: 'Dunmore says you brought him a whole boar. Dunmore has not stopped talking since. (A pause.) Was it sick?',
        choices: [{ text: 'Starving. It ate and ate and got nothing from it.', to: 'starve' }, { text: 'It’ll feed the camp.', to: 'feed', trust: 1 }],
      },
      left: {
        speaker: HB, text: 'Left it for the forest. (He nods slowly.) Good. Was it sick?',
        choices: [{ text: 'Starving. It ate and ate and got nothing from it.', to: 'starve' }, { text: 'It’ll feed the forest.', to: 'feed', trust: 1 }],
      },
      feed: { speaker: HB, text: 'That’s what things are for, in the end. Feeding something.', next: 'starve' },
      starve: { speaker: HB, mood: 'sad', text: 'Eating and getting nothing. Like the blight. (He looks out at the grey edge of the Rotwood, far off.) Aldo used to say the Rotwood was the hungriest place he knew. He’d know.', next: 'shout' },
      shout: { speaker: 'narrator', text: 'Down in the camp somebody is shouting, and then a lot of people are shouting, and then somebody is laughing. A big, warm, cracked laugh you have not heard for a year. Holt goes white.', next: null },
    },
  },
  // ---------- I-4 The Rotking Returns
  {
    id: 'dialogue:ranger-aldo-home', name: 'I-4 Aldo comes home', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: AM, mood: 'happy', text: 'There’s Holt’s pup! Look at you! Taller, and you’ve learned to scowl like him. Come here. Sit. Have a mushroom. I’ve brought supper.',
        choices: [
          { text: 'Aldo. We thought you were dead.', to: 'dead' },
          { text: 'Where have you been for a year?', to: 'where' },
        ],
      },
      dead: { speaker: AM, text: 'So did I, a bit, round about midsummer. Then I wasn’t. The Rotwood does that, if you let it. Here. Try one.', next: 'basket' },
      where: { speaker: AM, text: 'Out in the Rotwood. Deep. Deeper than any Wayfarer’s walked. And I’ll tell you what I found. Here, try one.', next: 'basket' },
      basket: {
        speaker: 'narrator', text: 'He holds out a basket of mushrooms: pale, perfect, plump, every one of them the same. They are grown from the blight. Around the fire the camp is eating them and saying they are the best thing they have ever tasted.',
        choices: [
          { text: '(Take one.)', to: 'eat' },
          { text: 'These are grown on the blight, Aldo.', to: 'blight' },
        ],
      },
      eat: { speaker: 'narrator', text: 'It tastes wonderful. Nutty and rich and deep, like autumn. You eat it in two bites and want another. Afterwards your tongue feels very slightly numb.', next: 'cook' },
      blight: { speaker: AM, mood: 'happy', text: 'Course they are! That’s the beauty of it! Grey as old bones out there, and look what it gives you.', next: 'cook' },
      cook: { speaker: AM, mood: 'happy', text: 'The rot’s not the enemy. Holt’s been fighting it fifty years and he’s never once asked it what it wants. It wants to cook. Everything falls down and the rot makes it into supper. Isn’t that grand?', next: 'garden' },
      garden: { speaker: AM, text: 'Now. Give an old man your arm, pup, and walk me out to my plot. I want to see if my leeks missed me. Holt’s gone off somewhere to have a feeling. He’ll be a while. He always is.', next: null },
    },
  },
  {
    id: 'dialogue:ranger-aldo', name: 'Aldo (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: AM, mood: 'happy', text: 'Mushroom? No? More for Holt, then. He’s too thin. He’s always been too thin.',
        choices: [
          { text: 'What happened to you in the Rotwood?', to: 'rot' },
          { text: 'Did you ever finish Holt’s joke?', to: 'joke' },
          { text: 'Farewell.', to: null, tag: 'leave' },
        ],
      },
      rot: { speaker: AM, text: 'I got quiet. That’s all. Out there it’s so quiet you can hear things falling down, slowly, all round you, for miles. It’s the most peaceful sound there is.', next: null },
      joke: { speaker: AM, mood: 'happy', text: 'Finish it? I’ve heard the beginning four hundred times. Nobody’s ever heard the end. I don’t think there is one. Don’t tell him.', next: null },
    },
  },
  {
    id: 'dialogue:ranger-holt-aldo-home', name: 'I-4 Holt on Aldo', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: HB, text: '(He is on the lookout with his back to the camp, very still.) He’s back.',
        choices: [
          { text: 'He’s back, Holt.', to: 'back' },
          { text: 'He brought mushrooms. Grown on the blight.', to: 'mush' },
        ],
      },
      back: { speaker: HB, mood: 'sad', text: 'A year. I walked every trail in the Rotwood for him. Twice. (A long pause.) I thought I’d have to carve him on the tree.', next: 'mush' },
      mush: { speaker: HB, text: 'Mushrooms. Off the grey. He always could cook. (He doesn’t sound happy about it. He sounds like a man listening for something in the dark.) The Circle’s sending an envoy about the blight. To the Bloomfen. Be there.', next: null },
    },
  },
  // ---------- I-5 The Burning Line (faction choice)
  {
    id: 'dialogue:ranger-vetch-envoy', name: 'I-5 the Circle’s envoy', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: PV, text: 'Primula Vetch, envoy of the Root Circle, with the Circle’s compliments and the Circle’s order. You have mud on you. Everyone out here has mud on them. Is it compulsory?',
        choices: [
          { text: 'What’s the order?', to: 'order' },
          { text: 'It’s the Thornwilds. Everything here is mud or thorn.', to: 'mud' },
        ],
      },
      mud: { speaker: PV, text: 'Charming. The order.', next: 'order' },
      order: { speaker: PV, text: 'The blight is coming down the Rotwood towards Rootholme at a mile a month. The Circle requires a firebreak burned through the Bloomfen, here, before it reaches the city. One line of fire, and the city is safe.', next: 'bloomkin' },
      bloomkin: { speaker: PV, mood: 'sad', text: 'Yes, the Bloomkin live in the fen. Yes, I know. I have been told by four bulrushes already, very slowly. The Circle regrets it. The Circle regrets it from a great distance.', next: null },
    },
  },
  {
    id: 'dialogue:ranger-burning-line', name: 'I-5 the line at the Bloomfen', scope: 'party',
    entries: [{ when: { not: { flag: 'ranger.line' } }, node: 'line' }, { node: 'after' }],
    nodes: {
      line: { speaker: 'narrator', text: 'The edge of the Bloomfen at dusk: the Wayfarers with their bows, the envoy with her torch, and in the reeds the Bloomkin, hundreds of them, lilies and bulrushes and things like walking moss, watching.', next: 'census' },
      census: { speaker: 'narrator', text: 'Holt stands between them all, and doesn’t say anything. Then he looks at you.', next: 'floor' },
      floor: {
        speaker: 'narrator', text: 'Everyone is waiting for the one with the stone in their chest. Before you say anything, there is one more thing you want to know.',
        choices: [
          { text: 'Holt. Have you ever burned a line?', to: 'holtburn' },
          { text: 'Envoy, what does the city lose if we don’t?', to: 'vetchlose' },
          { text: '(Look back along the red-flagged stakes.)', to: 'stakes', when: { flag: 'ranger.stakes_walked' } },
        ],
      },
      holtburn: { speaker: HB, mood: 'sad', text: 'Once. I was twenty. A line through the Elkwood, for a blight that turned out to be beetles. (A long pause.) I can still hear it. Your stone. Your word.', next: 'choose' },
      vetchlose: { speaker: PV, mood: 'sad', text: 'The Long Bough first. Then Thimble Steps. Then, by midsummer, the Bough Markets. (She looks at the reeds.) My mother keeps a hat stall on the Bough Markets. I did not volunteer for this, Wayfarer. I was told.', next: 'choose' },
      stakes: { speaker: 'narrator', text: 'The little red flags run away into the dusk in a dead-straight line: through the Bloomkin nursery-beds, across Dilys Marram’s wedding green, over the ferry crossing. A line on a map in Rootholme. It looks different from here.', next: 'cattail' },
      cattail: { speaker: HB, text: 'Your stone. Your word. Go on.', next: 'choose' },
      choose: {
        speaker: PV, text: 'Well, Wayfarer? The fire, or the city?',
        choices: [
          { text: 'Burn the break. Rootholme can’t be lost.', to: 'burn', quest: true, effects: [{ setFlag: 'ranger.line', value: 'burn' }] },
          { text: 'Hold the line. No fire. We fight the blight tree by tree.', to: 'hold', quest: true, effects: [{ setFlag: 'ranger.line', value: 'hold' }] },
          { text: 'Neither. Let me make the rot honest again.', to: 'honest', quest: true, insight: 'ranger_rot_made_honest', when: { insight: 'ranger_old_rot' }, effects: [{ setFlag: 'ranger.line', value: 'honest' }] },
          { text: 'Let the Bloomkin speak first. I counted them.', to: 'count', when: { all: [{ flag: 'ranger.census_counted' }, { not: { flag: 'ranger.cattail_spoke' } }] }, effects: [{ setFlag: 'ranger.cattail_spoke', value: true }] },
        ],
      },
      count: { speaker: 'npc:old-cattail', text: 'Four hundred… and twelve. Four hundred and twelve of us. We have been counted, so we are a people. A people has a say. (He bends, very slowly, in the wind.) Our say is: please do not set us on fire. Thank you.', next: 'choose' },
      burn: { speaker: PV, text: 'Thank you. The Circle thanks you. (The torches go in. The fen goes up gold and roaring, and the Bloomkin run, or don’t. Holt watches it burn, and says nothing, and goes on saying nothing for a whole day.)', next: null },
      hold: { speaker: HB, text: 'Right. (He unslings his bow.) Tree by tree, then. Wayfarers! On the line! (Out of the reeds, slowly, the Bloomkin come and stand beside you.)', next: 'hold2' },
      hold2: { speaker: PV, mood: 'angry', text: 'The Circle will hear of this. The Circle will hear of it at length.', next: null },
      honest: { speaker: 'narrator', text: 'You hold out the Rot half and let it sing, low and brown. Along the grey line the blight shivers, and turns, and becomes rot: honest rot. The dead wood softens and falls. The living wood stands. From the Rotwood’s edge Aldo Mire watches, and for the first time since he came home, he looks afraid.', next: 'honest2' },
      honest2: { speaker: HB, mood: 'happy', text: '(Very quietly.) There. That’s what it’s meant to look like. That’s what it always looked like.', next: null },
      after: { speaker: HB, text: 'It’s done. Now we live with it.', next: null },
    },
  },
  // ---------- I-6 The Beetle Mound
  {
    id: 'dialogue:ranger-beetle-mound', name: 'I-6 into the Beetle Mound', scope: 'party',
    entries: [
      { when: { flag: 'ranger.line', value: 'burn' }, node: 'burn' },
      { when: { flag: 'ranger.line', value: 'hold' }, node: 'hold' },
      { node: 'honest' },
    ],
    nodes: {
      burn: { speaker: 'narrator', text: 'The fire drove the Thorn Beetles out of the fen in a clicking flood, and they have all gone home to the Mound. It is the size of a hill, and it hums.', next: 'queen' },
      hold: { speaker: 'narrator', text: 'The beetles have been swarming the line every night, eating the living wood you are trying to save. They all come from the Mound, the size of a hill, humming.', next: 'queen' },
      honest: { speaker: 'narrator', text: 'Thorn Beetles eat dead wood. These have been eating living wood, gnawing green trees to the heart. They come from the Mound, the size of a hill, humming.', next: 'queen' },
      queen: { speaker: 'narrator', text: 'Deep inside, in a chamber of black lacquer, the Carapace Queen lifts herself off her eggs. She is as big as a cart. Her shell is weeping.', next: null },
    },
  },
  {
    id: 'dialogue:obj-beetle-mound-spores', name: 'I-6 the spores in the Mound', scope: 'party',
    entries: [{ when: { questStage: 'quest:ranger-the-beetle-mound', stage: 'spores' }, node: 'rows' }, { node: 'after' }],
    nodes: {
      rows: { speaker: 'narrator', text: 'Where the Queen’s eggs lay, grey fungus is growing in neat straight rows, each one a hand apart, the way a man plants leeks. You have seen rows like that before: in Aldo Mire’s garden behind the camp, every spring of your childhood.', next: 'black' },
      black: { speaker: 'narrator', text: 'The fungus weeps a little black at every gill. The eggs it grew on hatched hollow. Somebody sowed these here, on purpose, and walked away.', next: null },
      after: { speaker: 'narrator', text: 'Grey rows, pulled up and trampled.', next: null },
    },
  },
  // ---------- I-7 The Rotking's Crown
  {
    id: 'dialogue:ranger-aldo-crown', name: 'I-7 the Rotking', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: AM, mood: 'happy', text: 'You found my rows! Weren’t they neat? Holt always said I planted like a fussy old woman. Do you like my crown? (It is a ring of shelf-fungus, grown straight out of his scalp.)',
        choices: [
          { text: 'You’ve been seeding the blight. With black tears.', to: 'tears' },
          { text: 'Nothing in your basket ever had a spore, Aldo. Your rot doesn’t make anything.', to: 'barren', insight: 'ranger_barren', when: { any: [{ flag: 'ranger.mushrooms_barren' }, { insight: 'ranger_dead_blight' }] } },
        ],
      },
      tears: { speaker: AM, text: 'A drop at a time, for a year. They make rot hungry. Hungry rot eats anything. Not just the dead and the done with. Everything.', next: 'want' },
      barren: {
        speaker: AM, mood: 'angry', text: '(For a moment the laugh goes out of him entirely.) It doesn’t need to make anything. It only needs to finish things. Something will grow after. Something always grows after.',
        next: 'want',
      },
      want: {
        speaker: AM, mood: 'happy', text: 'The Rot half. That’s what I want. Set it in the Rotwood and let everything fall at once. The trees, the camps, Rootholme, the whole round world. All of it, down, together. Then we see what grows. Even out of the Hollow King’s tears, something will.',
        choices: [
          { text: 'Holt walked every trail in the Rotwood looking for you.', to: 'holt' },
          { text: 'You’ll kill everything.', to: 'kill' },
        ],
      },
      holt: { speaker: AM, mood: 'sad', text: 'I know. I heard him. I lay very still under the leaves and let him walk past. Twice. Tell him… no. I’ll tell him myself, after.', next: 'go' },
      kill: { speaker: AM, text: 'Everything dies, pup. I’m only asking it to hurry up, so we can get to the interesting part.', next: 'go' },
      go: { speaker: AM, mood: 'happy', text: 'I’m going into the Glade now. Come and stop me if you like. Bring Holt. No. Don’t bring Holt.', next: null },
    },
  },
  {
    id: 'dialogue:ranger-holt-turned', name: 'I-7 telling Holt', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: HB, text: 'Tell me.',
        choices: [
          { text: 'He’s been seeding the blight. He wants the Rot half, to make everything fall.', to: 'tell' },
          { text: 'He heard you looking for him. He hid.', to: 'hid', trust: 1 },
        ],
      },
      hid: { speaker: HB, mood: 'sad', text: '(He closes his eyes.) Thought I heard breathing. Under the leaves. Told myself it was a badger.', next: 'tell' },
      tell: { speaker: HB, mood: 'sad', text: 'Fifty years. Fifty years, and I never once knew what he was thinking. I thought that was just Aldo.', next: 'go' },
      go: { speaker: HB, text: 'Go and take the stone. If you can bring him back, bring him. If you can’t… (He doesn’t finish. For once it isn’t because something interrupts him.)', next: null },
    },
  },
  // ---------- I-8 The Rotting Glade
  {
    id: 'dialogue:obj-verdant-frontier-halfstone', name: 'I-8 the Rot half', scope: 'party',
    entries: [{ when: { questStage: 'quest:ranger-the-rotting-glade', stage: 'stone' }, node: 'claim' }, { node: 'grey' }],
    nodes: {
      claim: { speaker: 'narrator', text: 'In the grey leaf-mould where Aldo sat lies half of a brown-green crystal, cracked clean across, singing low. Where your hand closes round it, the leaf-mould turns dark and soft and smells, at last, of honest rot.', next: 'glade' },
      glade: { speaker: 'narrator', text: 'All round the glade the dead trees that have been standing out of habit give a long creak, all together, like old men getting out of chairs. One by one, gently, they begin to lie down.', next: 'vision' },
      vision: { speaker: 'narrator', text: 'For a moment you are not in the Rotwood. You stand on a hill at night in a ring of twelve stones, each singing its own note, round a crown that nobody is wearing. Then the ring cracks, all at once, and the song breaks, and the pieces fall like leaves.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'You are back in the glade with the half-stone warm in your fist. Where you knelt, a single green shoot has come up through the grey, the first in thirty years.',
        choices: [
          { text: '(Cut a blaze on the nearest fallen trunk, so the next Wayfarer can find this.)', to: 'blaze' },
          { text: '(Leave the shoot alone. Let it grow out of the dead, the way it should.)', to: 'shoot' },
          { text: '“Where is your other half?”', to: 'other' },
        ],
      },
      blaze: { speaker: 'narrator', text: 'An arrow over three notches, cut deep in the soft wood. It weeps a little, but not black. Somewhere far off under the roots, someone laughs, as if they had seen it.', next: 'aldo' },
      shoot: { speaker: 'narrator', text: 'You step round it carefully. It is a birch, by the look of it, and it has not the faintest idea how lucky it is. Nothing round it is grey any more.', next: 'aldo' },
      other: { speaker: 'narrator', text: 'It hums, low and brown, and you know without knowing how that the other half is in Rootholme, in something alive and warm that cannot stop growing, waiting for a witch who smells of sap to carry it home.', next: 'aldo' },
      aldo: { speaker: AM, mood: 'happy', text: '(From somewhere under the roots, muffled, as if through a great deal of soil.) Look after it, pup! I’ll see you at the gate! Everything falls through the gate in the end!', next: 'quiet' },
      quiet: { speaker: 'narrator', text: 'Then it is quiet, the real quiet, the kind Aldo loved: things falling down, slowly, all round you, for miles. Only now, for the first time in thirty years, they are falling down so something else can grow.', next: null },
      grey: { speaker: 'narrator', text: 'A dark patch of honest leaf-mould in the middle of the grey.', next: null },
    },
  },
  // ---------- I-9 The Last Waymark (mentor farewell; trust check)
  {
    id: 'dialogue:ranger-holt-farewell', name: 'I-9 Holt’s farewell', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: HB, text: 'Gate road. Aldo’s ahead of you, under the roots. (He puts the whetstone down.) Sit a minute.',
        effects: [{ setFlag: 'ranger.holt_farewell', value: true }],
        choices: [
          { text: 'Come with me, Holt.', to: 'stay' },
          { text: 'Thank you. For teaching me the ways.', to: 'gift', trust: 1 },
        ],
      },
      stay: { speaker: HB, text: 'Somebody has to keep the paths. They’ll be moving all winter. No.', next: 'gift' },
      gift: {
        speaker: HB, text: 'Here.',
        choices: [
          { text: '(Take what he holds out.)', to: 'knife', when: { trust: HB, value: 'friendly' } },
          { text: '(Shake his hand.)', to: 'hand', when: { not: { trust: HB, value: 'friendly' } } },
        ],
      },
      knife: { speaker: HB, text: 'My waymark knife. Cut every blaze in the Thornwilds with it, near enough. Cut one where you go. So somebody can follow.', effects: [{ giveItem: 'w_holt_waymark_knife' }, { setFlag: 'ranger.holt_knife', value: true }], next: 'walk' },
      walk: {
        speaker: HB, text: 'And…',
        choices: [
          { text: '(Wait.)', to: 'walks', when: { trust: HB, value: 'trusted' } },
          { text: '(Wait.)', to: 'joke', when: { not: { trust: HB, value: 'trusted' } } },
        ],
      },
      walks: { speaker: HB, text: '(He stands up and shoulders his pack.) I’ll walk you to the gate. Roots’ll be thick. I’ll hold them. Don’t argue.', effects: [{ setFlag: 'ranger.holt_walks', value: true }], next: 'joke' },
      hand: { speaker: HB, text: 'Mind the roots. Mind the Grove. Mind yourself.', next: 'joke' },
      joke: { speaker: HB, text: 'Right. Before you go. A beetle, a boar and a Circle witch walk into the Thornwilds. And the beetle says to the boar…', next: 'interrupt' },
      interrupt: { speaker: 'narrator', text: 'Far up the road, the Thorn Gate groans like a tree in a gale, and every bird in the Thornwilds goes up at once. Holt closes his mouth. He looks at the gate for a long moment, the way you look at somebody who has done it on purpose.', next: 'end' },
      end: { speaker: HB, text: 'Later, then.', next: null },
    },
  },
];

export default dialogues;
