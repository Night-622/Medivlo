/** Hollow Crown, HUNTSMAN Act I main dialogues (Antlerford). Owner: Claude 4. */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const BN = 'npc:ulric-bannock' as const, CO = 'npc:corva-ashby' as const;

const dialogues: DialogueDef[] = [
  // ---------- I-1 The Bell in the Antlers
  {
    id: 'dialogue:huntsman-bell-night', name: 'I-1 the Bell rings over Antlerford', scope: 'party',
    entries: [{ node: 'smoke' }],
    nodes: {
      smoke: { speaker: 'narrator', text: 'Midnight in the Lodge Yards. You are on smokehouse watch, which means sitting on an upturned bucket and keeping the foxes off the hams. The foxes have not come. Nothing has come for weeks.', next: 'bell' },
      bell: { speaker: 'narrator', text: 'Somewhere very far away a bell rings once. Every antler on every wall in Antlerford hums the same note at the same moment, hundreds of them, like a held breath. On the smokehouse rafters the hams begin to swing, though there is no wind.', next: 'kennels' },
      kennels: { speaker: 'narrator', text: 'In the kennels forty hounds begin to howl at once. Doors bang open all along the Lodge Yards. Somebody shouts for Jem Furlong. Jem shouts back that he can hear them, thank you.', next: 'song' },
      song: {
        speaker: 'narrator', text: 'Something under your ribs hums back. It is warm, and it is patient, and it would like you to get up off the bucket and walk.',
        choices: [
          { text: '(Get up and follow it.)', to: 'follow' },
          { text: '(Stay at your post. The hams are your watch.)', to: 'stay' },
          { text: '(Stand still and find which way it pulls, the way you’d find a wind.)', to: 'scent', school: 'hunt' },
        ],
      },
      follow: { speaker: 'narrator', text: 'You are up and walking before the bucket has finished rolling. The humming tugs you out of the Yards and up the lane, gently, like a hand on your sleeve.', next: 'yards' },
      stay: { speaker: 'narrator', text: 'You stay on the bucket for a whole minute, out of loyalty to the hams. The humming does not mind. It waits, warm and patient, until you notice that your feet are already walking.', next: 'yards' },
      scent: { speaker: 'narrator', text: 'You shut your eyes and turn slowly, the way the Lodge teaches its children to find a wind. The pull is strongest uphill, towards the Tannery Lanes and the great dark roof above them.', next: 'yards' },
      yards: { speaker: 'narrator', text: 'Nobody stops you. Half of Antlerford is out in its nightshirt, staring east with the hounds. You go the other way, uphill, towards the Trophy Hall, where hundreds of glass eyes are catching the moon and something inside is singing back.', next: null },
    },
  },
  {
    id: 'dialogue:huntsman-bannock-bell', name: 'I-1 Bannock at the Trophy Hall gates', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: BN, text: '(A very large man in a nightshirt and a hunting coat is standing behind you. An old grey deerhound leans on his leg.) Evening. You left the hams.',
        choices: [
          { text: 'Something is singing in my chest.', to: 'sing' },
          { text: 'Master Bannock. I can explain.', to: 'explain' },
        ],
      },
      explain: { speaker: BN, text: 'No need. I heard it too. Not in my chest. In the antlers. Everyone did.', next: 'sing' },
      sing: {
        speaker: BN, text: '(He looks at the locked gates for a long moment, and then at you.) It’s late. Biscuit wants her bed, and so do I. Walk back with us.',
        choices: [
          { text: 'Aren’t you going to ask what I was doing here?', to: 'ask' },
          { text: '(Walk back with him.)', to: 'walk', trust: 1 },
        ],
      },
      ask: { speaker: BN, text: 'No. If you want to tell me, you will. That’s the old law, near enough. You take what’s given.', next: 'walk' },
      walk: { speaker: BN, text: 'It’s cold, and the kettle’s on, and Biscuit is already halfway home. Walk back with us. (Biscuit sneezes on your boots, by way of agreement.)', next: null },
    },
  },
  // ---------- I-2 Count the Herd
  {
    id: 'dialogue:huntsman-bannock-herd', name: 'I-2 the count that wasn’t', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: BN, mood: 'sad', text: 'Four elk. Four. And they weren’t crossing, they were waiting. My grandfather counted eleven thousand at that stone. I wrote down four, and then I couldn’t leave it written.',
        choices: [
          { text: 'They had black tears in their eyes.', to: 'tears' },
          { text: 'Where have the rest gone?', to: 'gone' },
          { text: 'Their tracks went round and round, where a cairn used to stand.', to: 'cairn', when: { flag: 'huntsman.elk_circle' } },
        ],
      },
      cairn: { speaker: BN, mood: 'afraid', text: '(He stops with the pencil in the air.) You saw that. Yes. They walk round where it stood, like a dog round a grave. You’ve a good eye. We’ll talk about the cairns one day, you and I, when I’m braver.', next: 'gone' },
      tears: { speaker: BN, text: 'I saw. They don’t run from you when they’ve got the black in them. They wait until you turn your back. That isn’t a beast. That’s a grudge.', next: 'gone' },
      gone: { speaker: BN, text: 'Off their road. Thirty years now, a little further off it every autumn. And someone has strung snares across what’s left of it. Lodge hunters found three lines this morning.', next: 'snares' },
      snares: { speaker: BN, text: 'Cut them. Then follow the cord. Snare-cord tells you who tied it, if you’re patient. Take your crossbow. Take Biscuit, if you like. She won’t help.', next: null },
    },
  },
  // ---------- I-3 The Poachers' Camp
  {
    id: 'dialogue:obj-poacher-pelt-store', name: 'I-3 the pelt store', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-poachers-camp', 'pelts'), node: 'pelts' }, { node: 'empty' }],
    nodes: {
      pelts: { speaker: 'narrator', text: 'Pelts to the rafters: elk, fox, boar, a wolf, every one damp and black along the hair. Nailed to the door is a bill of sale, paid in advance, in gold, for every tear-stained hide the camp can bring in. The buyer has not signed it. The buyer did not need to.', next: null },
      empty: { speaker: 'narrator', text: 'The empty store-shed. It still smells of salt and something sadder.', next: null },
    },
  },
  {
    id: 'dialogue:huntsman-bannock-pelts', name: 'I-3 report on the camp', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: BN, text: 'The Poacher Chief. I knew him when he was a beater for the Barons, thirty years back. He always did set his lines too low. Calf height. What was in the shed?',
        choices: [
          { text: 'Weeping pelts, bought in advance. Paid in gold.', to: 'gold' },
          { text: 'Lusk’s back room takes them. The cart comes in before dawn from the Old Snares.', to: 'lusk', insight: 'pelts_traced', when: { flag: 'huntsman.back_room', value: 'followed' } },
        ],
      },
      gold: { speaker: BN, text: 'In gold. Nobody in Antlerford has gold except the Barons, and the Barons don’t pay in advance. They don’t have to.', next: 'end' },
      lusk: { speaker: BN, mood: 'afraid', text: 'Griselda’s back room, and somebody paying her. The Poacher Chief never had two coins of his own to rub together. Someone was bankrolling him.', next: 'end' },
      end: { speaker: BN, text: 'There’s a commotion down the Tannery Lanes. Smoke. Somebody’s lit a fire in the street and half the town has gone to watch. Go and see. I’ll stay and get my breath.', next: null },
    },
  },
  // ---------- I-4 The Baron's Bonfire
  {
    id: 'dialogue:huntsman-corva-bonfire', name: 'I-4 meeting Lady Corva', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: CO, text: '(A tall woman in a green riding coat is feeding pelts onto the bonfire one at a time, very neatly.) You must be the Lodge’s tracker. The one who found the Poacher Chief’s stockade when the Lodge had been looking for a year. I’m Corva Ashby.',
        choices: [
          { text: 'You’re burning them.', to: 'burn' },
          { text: 'How do you know who I am?', to: 'know' },
        ],
      },
      know: { speaker: CO, text: 'I asked. I always ask. People are very good at telling you things, if you pay for the drinks.', next: 'burn' },
      burn: {
        speaker: CO, text: 'Every one I could buy. A weeping pelt hollows whoever wears it, slowly, and the Tannery Lanes have been selling them as winter coats. I’ve bought the lot. I’ve also paid the Lodge’s debts. All of them, to the penny.',
        choices: [
          { text: 'Why would you do that?', to: 'why' },
          { text: 'Nobody pays a debt they don’t owe without wanting something.', to: 'want' },
        ],
      },
      why: { speaker: CO, text: 'Because somebody has to put this right, and the Lodge can’t afford to. Now it can. I would like it to stay afloat long enough to listen to me.', next: 'want' },
      want: {
        speaker: CO, text: 'I want a tracker. I’m taking a hunting party up the Elkway after the hollow herd, and I want the best. You’re the best. That isn’t flattery, I don’t flatter. I checked.',
        choices: [
          { text: 'I’ll think about it.', to: 'end' },
          { text: 'The Lodge hunts by the old law. Does your party?', to: 'law', school: 'hunt' },
        ],
      },
      law: { speaker: CO, text: 'The old law says take only what the hunt gives. The hunt gives nothing now. It weeps and it charges. I take what I can carry. Think about it.', next: 'end' },
      end: { speaker: CO, text: 'Ride out to my hide on the Elkway at dusk. Watch me hunt once, and then decide whether you would like to. That is fairer than any offer I could make you here.', next: null },
    },
  },
  {
    id: 'dialogue:huntsman-bannock-debts', name: 'I-4 Bannock on the paid debts', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: BN, text: 'Paid. All of it. The roof, the hounds’ meat, the farrier, the arrow-maker, forty years of tally. (He holds the receipt as if it might bite.) And she wants to talk about the charter.',
        choices: [
          { text: 'What is the charter?', to: 'charter' },
          { text: 'She wants to buy the Lodge.', to: 'buy' },
        ],
      },
      charter: { speaker: BN, text: 'The old law of the chase, written down. What may be hunted, and when, and by whom. The Lodge has kept it since before the Concord. Whoever holds the charter says what’s legal in these woods.', next: 'buy' },
      buy: { speaker: BN, mood: 'sad', text: 'She doesn’t want the Lodge. She wants the law. The Barons have offered to buy it. The Lodge meets in the hall tonight to say yes or no, and I’d like you to speak. You’ve a stone singing in you. They’ll listen to that.', next: null },
    },
  },
  // ---------- I-5 The Old Law (the faction choice; a party vote)
  {
    id: 'dialogue:huntsman-old-law', name: 'I-5 the Lodge votes on the charter', scope: 'party',
    entries: [{ when: { not: { flag: 'huntsman.charter' } }, node: 'hall' }, { node: 'after' }],
    nodes: {
      hall: { speaker: 'narrator', text: 'The Great Lodge hall, smelling of wet dog and woodsmoke. Two hundred hunters on the benches. The charter hangs in its case above the hearth, three short paragraphs in very old ink. Lady Corva sits at the back with her gloves in her lap.', next: 'motion' },
      motion: { speaker: BN, text: 'The Barons will buy the charter. With it they’ll license a cull of every hollowed beast in the Greywilds, and pay the Lodge to help. Without it we stay poor, and they hunt anyway. That’s all of it.', next: 'corva' },
      corva: { speaker: CO, text: '(She stands, and the hall goes quiet for her as it never quite does for Bannock.) I will be plain, because I always am. The herd is sick, and sick beasts trample villages. My Barons will put down every hollowed animal in the Greywilds within a year. I need the charter to make it lawful.', next: 'debate' },
      debate: { speaker: 'narrator', text: 'The hall argues. A young hunter shouts that a wage is a wage. Grandfer Lumm shouts that he remembers when the herd took three days to cross the Elkway. Somebody’s hound gets up on the table. Bannock lets it all run until it stops by itself.', next: 'ask' },
      ask: {
        speaker: BN, text: 'Our tracker has a voice. Ask what you need to ask, and then speak.',
        choices: [
          { text: 'Lady Ashby, what happens to the charter after the cull?', to: 'after_cull' },
          { text: 'Master Bannock, what would you do?', to: 'bn' },
          { text: 'Grandfer Lumm, what has the old law ever cost you?', to: 'lumm', school: 'hunt' },
        ],
      },
      after_cull: { speaker: CO, text: 'It hangs in my Hall, in a better case than this one, and I take very good care of it. (A pause.) And the Barons say what may be hunted, and when. I will not pretend otherwise. You would know if I did.', next: 'choose' },
      bn: { speaker: BN, mood: 'sad', text: 'Me? I’m too old to be poor much longer, and too stubborn to be anything else. I’ll abide by what the Lodge says. Don’t look at me. Look at the woods.', next: 'choose' },
      lumm: { speaker: 'npc:grandfer-lumm', text: 'Cost me? A boar, once, in the calving moon, that I could have eaten. (The hall laughs. He does not.) I let it go. Best thing I ever did, and I’ve told it wrong for sixty years. That’s what the old law costs. A boar, and a good story.', next: 'choose' },
      choose: {
        speaker: BN, text: 'Well? What may a hunter take?',
        choices: [
          { text: 'Sell it. The herd is sick and we can’t afford to save it alone. Let the Barons pay for the cull.', to: 'sold', quest: true, trustNpc: BN, trust: -1, effects: [{ setFlag: 'huntsman.charter', value: 'sold' }] },
          { text: 'Keep the old law. Take only what the hunt gives, even now. Especially now.', to: 'kept', quest: true, effects: [{ setFlag: 'huntsman.charter', value: 'kept' }] },
          { text: 'The herds didn’t lose their road. The cairns were pulled down. Put them back, and the herd will find its own way home.', to: 'road', quest: true, insight: 'cairns_rebuilt', when: { insight: 'cairns_pulled' }, effects: [{ setFlag: 'huntsman.charter', value: 'road' }] },
        ],
      },
      sold: { speaker: CO, text: '(She stands, and signs, and pays, all in under a minute.) Thank you. The cull begins at dawn. (At the hearth, Bannock takes the charter down from its case and hands it over without a word.)', next: null },
      kept: { speaker: BN, text: '(The hall stamps its boots on the boards, and keeps on stamping.) Kept, then. We stay poor and we stay honest. (At the back, Corva puts her gloves on, finger by finger, and leaves.)', next: null },
      road: {
        speaker: 'narrator', text: 'Nobody speaks. Then Grandfer Lumm stands up, ninety years old, and says he helped build the eighth cairn as a boy and he can very well help build it again. The whole Lodge goes out onto the Elkway with torches. At the back of the hall, Corva Ashby watches them go.',
        next: null,
      },
      after: { speaker: BN, text: 'The Lodge has spoken. Now we see what it costs.', next: null },
    },
  },
  {
    id: 'dialogue:obj-elkway-cairn-1', name: 'The first antler-cairn', scope: 'party',
    entries: [
      { when: stage('quest:huntsman-the-herd-road-cairns', 'cairn'), node: 'mentor' },
      { when: stage('quest:huntsman-the-old-law', 'cairns'), node: 'torch' },
      { node: 'cairn' },
    ],
    nodes: {
      mentor: { speaker: 'narrator', text: 'You set the stones back one by one, and the old elk antler on top, points north. Bannock does the heavy ones without being asked and pretends he isn’t out of breath. The cairn is waist high, and it looks as if it has always been there.', next: null },
      torch: { speaker: 'narrator', text: 'By torchlight the Lodge sets the first cairn back where the Elkway leaves the town. Somebody starts the old counting song. Nobody remembers the second verse, so they sing the first one again.', next: null },
      cairn: { speaker: 'narrator', text: 'An antler-cairn on the Elkway, stone and old elk antler, pointing the herd road north.', next: null },
    },
  },
  {
    id: 'dialogue:obj-elkway-cairn-6', name: 'The last antler-cairn', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-old-law', 'cairns'), node: 'last' }, { node: 'cairn' }],
    nodes: {
      last: { speaker: 'narrator', text: 'The sixth cairn goes up at the edge of the Old Snares, a little before dawn. Down the Elkway in the half-light, four Great Elk lift their heads together, turn, and walk north along the road, the right way, for the first time in thirty years.', next: 'corva' },
      corva: { speaker: CO, text: '(From the trees, very quietly, as if to herself.) Oh. Oh, that’s clever. That’s very clever.', next: null },
      cairn: { speaker: 'narrator', text: 'The last antler-cairn on the Elkway, at the edge of the Old Snares.', next: null },
    },
  },
  // ---------- I-6 The Swollen Queen
  {
    id: 'dialogue:huntsman-tick-hollows', name: 'I-6 into the Tick Hollows', scope: 'party',
    entries: [
      { when: { flag: 'huntsman.charter', value: 'sold' }, node: 'cull' },
      { when: { flag: 'huntsman.charter', value: 'road' }, node: 'road' },
      { node: 'kept' },
    ],
    nodes: {
      cull: { speaker: 'narrator', text: 'The Barons’ cull drove every sick beast off the Elkway in a single night, with horns and dogs and fire. They all ran the same way: down into the Tick Hollows, where the ground is soft and the trees drip.', next: 'queen' },
      kept: { speaker: 'narrator', text: 'The Lodge’s hunters are hungry, and they went out in the night without a licence or a plan. Every sick beast on the Elkway ran from them the same way: down into the Tick Hollows, where the ground is soft and the trees drip.', next: 'queen' },
      road: { speaker: 'narrator', text: 'The rebuilt cairns turned the herd north. But the sickest of them could not turn, and they stumbled off the road the other way: down into the Tick Hollows, where the ground is soft and the trees drip.', next: 'queen' },
      queen: { speaker: 'narrator', text: 'At the bottom something the size of a haystack shifts in the mud. It is grey, and pink, and it is swollen so tight with black that it shines.', next: null },
    },
  },
  {
    id: 'dialogue:obj-hunting-party-tags', name: 'I-6 the brass tags', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-swollen-queen', 'tags'), node: 'tags' }, { node: 'mud' }],
    nodes: {
      tags: {
        speaker: 'narrator', text: 'Brass collar-tags off hunting dogs, dozens of them, trodden into the mud where the herd was driven in. Every one is stamped with the same crest: a raven over a stag’s skull. The Ashby arms.',
        choices: [
          { text: 'Sort them by the dates on the backs.', to: 'dates', school: 'hunt', effects: [{ setFlag: 'huntsman.tags_counted', value: true }] },
          { text: 'Pocket them for Bannock.', to: null },
        ],
      },
      dates: { speaker: 'narrator', text: 'Forty tags, forty dates. Each one is the night a beast on the Elkway first turned black. Whoever was driving them in here was there every time, on the very night.', next: null },
      mud: { speaker: 'narrator', text: 'Trampled mud, and the long flat shape where the Swollen Queen lay.', next: null },
    },
  },
  // ---------- I-7 The Empty Wall
  {
    id: 'dialogue:huntsman-bannock-tags', name: 'I-7 Bannock reads the tags', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: BN, text: 'Raven over a skull. Ashby. (He turns one over in his huge fingers.) Her parties have been driving the hollow herd into the Hollows. Feeding the Queen, or hiding something from the rest of us.', next: 'wall' },
      wall: {
        speaker: BN, mood: 'afraid', text: 'And she’s had a new bracket put up in the Trophy Hall this week. On the end wall. My cousin did the ironwork. He says it’s the biggest bracket he’s ever made, and nothing on it.',
        choices: [
          { text: 'What would hang on a bracket that size?', to: 'what' },
          { text: 'I’ll ask her.', to: 'ask' },
          { text: 'Somebody has been stringing the Old Snares again with silk. With silver nails.', to: 'silk', when: { flag: 'huntsman.silk_snare' } },
        ],
      },
      silk: { speaker: BN, mood: 'angry', text: 'Silver. (His hand closes round the tags.) Every Baron in the Greywilds shoes with silver. But only one of them has been feeding hollow beasts into a hole. Ask her about that too.', next: 'what' },
      what: { speaker: BN, text: 'Only one thing in the Greywilds has antlers that wide. And it doesn’t have a head you can mount, because it isn’t an animal. It’s the hunt itself.', next: 'ask' },
      ask: { speaker: BN, text: 'Ask her, then. Politely. She’s always polite. But read her game book first: Quentin Snipe writes down every kill her parties make, and he has never told a lie in his life. Mind that she’s always armed, as well.', next: null },
    },
  },
  {
    id: 'dialogue:huntsman-corva-wall', name: 'I-7 Corva at the Trophy Hall', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: CO, text: 'You found my tags. Good. I hoped it would be you. (She is standing under the empty bracket, very straight.) Ask, then. I’ll answer. I always do.',
        choices: [
          { text: 'What is the bracket for?', to: 'hunt' },
          { text: 'You drove the herd into the Hollows.', to: 'hollows' },
        ],
      },
      hollows: { speaker: CO, text: 'Somewhere they couldn’t trample a village. Somewhere I could find them again. I’m not cruel. I’m tidy.', next: 'hunt' },
      hunt: {
        speaker: CO, text: 'The Great Hunt. The spirit of the chase, the thing the herds have followed since before there were Lodges. It’s hollowed, and it’s circling the Antler Gate with a black herd at its heels, trampling anything that moves. Someone has to put it down.',
        choices: [
          { text: 'And you mean to hang it here.', to: 'stone' },
          { text: 'Your last forty trophies were all hollowed. Every one killed on the night it turned.', to: 'tally', insight: 'corva_tally', when: { any: [{ flag: 'huntsman.tags_counted' }, { flag: 'huntsman.game_book' }, { flag: 'huntsman.first_night' }, { questCompleted: 'quest:huntsman-the-gamekeepers-notice' }] } },
        ],
      },
      tally: { speaker: CO, mood: 'sad', text: '(For the first time her voice is not quite level.) The first night. Before it forgets what it was. If you leave it a second night, it’s just a thing with teeth. On the first night it still knows it’s being killed. That’s the kindest night.', next: 'stone' },
      stone: {
        speaker: CO, text: 'Up there, in that stag’s brow, is half a stone. It won’t sing for me. It’ll sing for you. And when it sings, the Great Hunt will come to the song, under my roof, and I’ll shoot it. One bolt. I never miss.',
        choices: [
          { text: 'That isn’t hunting. That’s a trap with a roof.', to: 'end' },
          { text: 'The old law says you may only take what the hunt gives.', to: 'law', school: 'hunt' },
        ],
      },
      law: { speaker: CO, text: 'The hunt gives nothing. The Lodge has waited thirty years for it to give, and look at the Lodge. Someone has to put it down. The Lodge won’t. I will, and I’ll keep what I take.', next: 'end' },
      end: { speaker: CO, text: 'Come back tonight. Bring the song with you. I’d rather you stood beside me than in front of me, but I’ll take whichever you give.', next: null },
    },
  },
  // ---------- I-8 The Trophy Hall
  {
    id: 'dialogue:obj-hunt-capital-halfstone', name: 'I-8 the Lodge half', scope: 'party',
    entries: [{ when: stage('quest:huntsman-the-trophy-hall', 'stone'), node: 'claim' }, { node: 'brow' }],
    nodes: {
      claim: { speaker: 'narrator', text: 'The stag’s head on the end wall is the oldest in the Hall, its glass eyes cracked with age. Set in its brow is half of a crystal, cracked clean across, singing. It comes free into your hand as if it had been waiting for you to ask.', next: 'heads' },
      heads: {
        speaker: 'narrator', text: 'All down the Hall the mounted heads turn their glass eyes towards you with a soft creak of old leather, a thousand of them. Black tears are running from every one, down the fur and onto the floor.',
        choices: [
          { text: '(Look the old stag in the eye.)', to: 'stag' },
          { text: '(Count them, the Lodge way: what was taken.)', to: 'count', school: 'hunt' },
        ],
      },
      stag: { speaker: 'narrator', text: 'Behind the cracks in its glass eyes, for a moment, you see a forest in autumn sun, and a beast of light running at the head of a herd that takes three days to cross a road, and the Lodge hounds running beside it, not behind.', next: 'corva' },
      count: { speaker: 'narrator', text: 'Three hundred years of Ashby heads. You stop counting at four hundred. Not one of them was given. Every one was taken, and every one is weeping now that the stone has gone.', next: 'corva' },
      corva: {
        speaker: CO, text: '(From the yard, already in the saddle, her voice perfectly calm.) Keep it singing. I’ll be waiting at the Antler Gate. It will come to you there, and I’ll be on the ridge. I never miss.',
        choices: [
          { text: 'Quentin left you a basket at your hide.', to: 'basket', when: { flag: 'huntsman.snipe_basket' } },
          { text: 'Corva. You don’t have to do this.', to: 'have' },
          { text: '(Let her go.)', to: null },
        ],
      },
      basket: { speaker: CO, mood: 'sad', text: '(A pause, long enough to hear the horse breathe.) I found it. The bread was stale. Tell him I ate every crumb of it anyway.', next: null },
      have: { speaker: CO, text: 'No. Nobody has to do anything. That is the trouble with the world, tracker. Somebody has to choose to. (Silver rings on the cobbles, going away.)', next: null },
      brow: { speaker: 'narrator', text: 'An old stag’s head with an empty socket in its brow.', next: null },
    },
  },
  // ---------- I-9 The Last Count (mentor farewell; trust check)
  {
    id: 'dialogue:huntsman-bannock-farewell', name: 'I-9 Bannock’s last count', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: BN, text: '(He has the tally book open on the stone.) Two elk. A fox. (Biscuit sits down on his foot.) And Biscuit. Four. Same as before. I’d hoped for five.',
        choices: [
          { text: 'Come with me to the gate.', to: 'stay' },
          { text: 'Thank you, Master Bannock. For the count, and the law, and the walk home.', to: 'four', trust: 1 },
        ],
      },
      stay: { speaker: BN, text: 'I’m too big to run and too old to chase. And somebody has to be here, counting, when they come back. If they come back.', next: 'four' },
      four: {
        speaker: BN, text: 'My grandfather counted eleven thousand at this stone. I was eight, holding the book, and I thought that was what the world was: too many to count.',
        choices: [
          { text: 'There’ll be more, when the gate opens.', to: 'more' },
          { text: 'Count what you leave as well as what you take. What are you leaving?', to: 'leave', school: 'hunt' },
        ],
      },
      more: { speaker: BN, text: 'Maybe. If there are, I’ll be here to count them. That’s a promise I can keep, which is the only kind I make.', next: 'law' },
      leave: { speaker: BN, mood: 'sad', text: '(He looks at you for a long time.) You. I’m leaving you, at the gate road. I’ll put it in the book.', next: 'law' },
      law: { speaker: BN, text: 'When you get to the gate she’ll be on the ridge, and it will come at you black, and every part of you will want to kill it. Don’t. Run it till it stops. Then see what it gives.', next: 'gifts' },
      gifts: {
        speaker: BN, text: 'I’ve something for you. I’m not good at this part.',
        choices: [
          { text: '(Take what he holds out.)', to: 'horn', when: { trust: BN, value: 'friendly' } },
          { text: '(Shake his enormous hand.)', to: 'hand', when: { not: { trust: BN, value: 'friendly' } } },
        ],
      },
      horn: { speaker: BN, text: 'My horn. Elk-bone, older than the Lodge. Blow it anywhere in the Greywilds and every Lodge hunter who hears it will come. Blow it anywhere else and, well. Somebody might.', effects: [{ giveItem: 'i_bannock_horn' }, { setFlag: 'huntsman.bannock_horn', value: true }, { setFlag: 'huntsman.bannock_farewell', value: true }], next: 'biscuit' },
      biscuit: {
        speaker: BN, mood: 'sad', text: '(Biscuit has got up and gone to stand beside you. She looks back at him once.) Ah. Well. She’s decided. She’s never decided anything in her life.',
        choices: [
          { text: 'I’ll look after her.', to: 'end', when: { trust: BN, value: 'trusted' }, effects: [{ setFlag: 'huntsman.biscuit_pet', value: true }] },
          { text: 'She belongs here, with you.', to: 'end' },
        ],
      },
      hand: { speaker: BN, text: 'Mind the ridge. Mind her bolts. And don’t kill it. Whatever she says. Run it to a standstill and let it go.', effects: [{ setFlag: 'huntsman.bannock_farewell', value: true }], next: null },
      end: { speaker: BN, text: 'Go on, then. I’ll put you down in the tally. I’ve never written down a hunter before. Only what they hunted.', next: null },
    },
  },
];

export default dialogues;
