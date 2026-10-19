/** Hollow Crown, HEDGEWITCH Act I main dialogues (Rootholme). Owner: Claude 4. */
import type { DialogueDef } from '@/core';

type Q = `quest:${string}`;
const YA = 'npc:mother-yarrow' as const, OS = 'npc:ostara' as const, CR = 'npc:cicely-rue' as const;
const PRUNE: Q = 'quest:hedgewitch-pruning-day';

/** one object scene per numbered set piece: the quest-stage text, then a plain line afterwards */
const objs = (slug: string, q: Q, stage: string, texts: string[], after: string): DialogueDef[] =>
  texts.map((text, i) => ({
    id: `dialogue:obj-${slug}-${i + 1}` as const, name: `${slug} ${i + 1}`,
    entries: [{ when: { questStage: q, stage }, node: 'now' }, { node: 'after' }],
    nodes: { now: { speaker: 'narrator', text, next: null }, after: { speaker: 'narrator', text: after, next: null } },
  }));

const dialogues: DialogueDef[] = [
  // ---------- I-1 The Bell in the Boughs
  {
    id: 'dialogue:hedgewitch-bell-night', name: 'I-1 the Bell rings over Rootholme', scope: 'party',
    entries: [{ node: 'bell' }],
    nodes: {
      bell: { speaker: 'narrator', text: 'Night on the Bough Markets. The lanterns are low and the cats are out. Somewhere very far away a bell rings once, and every leaf on the Elder Tree turns over, silver side up, all at the same moment.', next: 'ring' },
      ring: { speaker: 'narrator', text: 'Then the tree breathes in, and grows. A whole ring, in one breath. Bark groans, a stall slides sideways, and the rope bridge under your feet goes twang and then goes nowhere at all.', next: 'song' },
      song: { speaker: 'narrator', text: 'You land in a tangle of brand-new branches, and in your chest something has started to sing. It is warm and green and very old, and it sounds like it has been waiting for you.', next: null },
    },
  },
  {
    id: 'dialogue:hedgewitch-yarrow-bell', name: 'I-1 Yarrow on the next bough', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: YA, text: 'Hush now. Hush, you great lummox, you’ll have the market in the river. (She is talking to the tree.) Oh, there you are, dear. In one piece? Good. Mind the Briarlings, they’re all elbows tonight.',
        choices: [
          { text: 'Something in my chest is singing, Mother Yarrow.', to: 'sing' },
          { text: 'Are you talking to the tree?', to: 'tree' },
        ],
      },
      tree: { speaker: YA, text: 'I’m always talking to the tree, dear. Somebody has to. It’s had a fright. So have you, by the look of you. Now, what’s that glow?', next: 'sing' },
      sing: {
        speaker: YA, text: 'Let me listen. (She puts her ear to your chest, as she did when you had croup at six.) Well, I never. That’s the Heartwood half, that is. The Verdant Stone’s own song, calling for you from inside the tree.',
        choices: [
          { text: 'The Verdant Stone? From the old crown?', to: 'crown' },
          { text: 'Why me?', to: 'why' },
        ],
      },
      crown: { speaker: YA, text: 'The very same. It fled the crown thirty years ago and cracked as it fell, and half of it came home to the Elder Tree. The tree’s been growing like a weed ever since. Haven’t you, dear? (To the tree.) Yes, you have.', next: 'end' },
      why: { speaker: YA, text: 'Because it likes you, I should think. I’ve taught you since you were knee-high to a Briarling, and I’ve always liked you. There’s no accounting for taste.', next: 'end' },
      end: {
        speaker: YA, text: 'Not bed yet, though. I want a word with this great baby at the trunk, where it can’t pretend it hasn’t heard me. Come along, and say sorry to the tree for landing on it.',
        choices: [
          { text: 'Sorry, tree.', to: 'night', trust: 1 },
          { text: 'I’m not apologising to a tree.', to: 'rude' },
        ],
      },
      night: { speaker: YA, mood: 'happy', text: 'There. It heard you. You can always tell, the leaves go soft. Along the bough-road, now. Mind the gap where the bridge was.', next: null },
      rude: { speaker: YA, text: 'It’s heard worse. It heard what the Circle said about my jam. Along the bough-road, now. Mind the gap where the bridge was.', next: null },
    },
  },
  // ---------- I-2 Pruning Day
  ...objs('verdant-stall', PRUNE, 'stalls', [
    'The cheesemonger’s stall, wrapped in a fat green shoot like a parcel. You snip it free. The cheesemonger thanks you, then thanks the tree, to be on the safe side.',
    'A lantern-seller’s stall, with a branch grown clean through the middle of it. Every lantern is still lit. You prune round them very carefully, and nobody catches fire.',
    'A fortune-teller’s booth under a heap of leaves. “I saw this coming,” she says, from inside. “I just didn’t see what to do about it.”',
    'The sap-sweet stall. The new growth here is weeping, but not sap. It is thick and black and it does not smell of anything at all. The sweet-seller has gone very pale.',
    'A hat stall, every hat now worn by a twig. The hatter is weighing up whether this is a disaster or a new fashion.',
  ], 'The stall is open again, more or less.'),
  {
    id: 'dialogue:hedgewitch-yarrow-lantern', name: 'I-2 report on Lantern Row', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: YA, text: 'All five? Not a single finger lost? Good. And your face says Lantern Row. I know. I heard it go, last night. Like a door closing.',
        choices: [
          { text: 'The tree swallowed a whole street.', to: 'frightened' },
          { text: 'And one of the stalls was weeping black.', to: 'black' },
        ],
      },
      frightened: { speaker: YA, mood: 'sad', text: 'It’s not wicked, dear. It’s frightened. It can’t stop growing, and it doesn’t know why, and when you’re frightened you hold on to things. Streets, mostly.', next: 'black' },
      black: { speaker: YA, mood: 'afraid', text: 'Black? In the sap? (She puts a hand flat on the bark.) Oh, you poor thing. That’s the tears. They’re in Rootholme, then. Not just out in the wilds.', next: 'cellars' },
      cellars: { speaker: YA, text: 'And now Spindle Street in the Root Cellars has gone to sleep, all of it, mid-supper. Something is breathing spores up through their floor. Go and look, would you? Take a hanky.', next: null },
    },
  },
  // ---------- I-3 The Sleeping Cellars
  ...objs('cellar-sleeper', 'quest:hedgewitch-the-sleeping-cellars', 'sleepers', [
    'An old man asleep at his table, spoon in hand, a bowl of soup gone cold. He is breathing, slowly. There is a fine black dust on his eyelashes.',
    'Two children asleep on the stairs in the middle of a game of jacks. You check them both. They are warm, and quite peaceful, and they are not dreaming anything at all.',
    'A woman asleep standing up, leaning on her broom. The black dust is thickest here, by a crack in the floor. Under it, something very large breathes in.',
  ], 'Spindle Street, waking slowly and wondering where the evening went.'),
  {
    id: 'dialogue:hedgewitch-yarrow-spores', name: 'I-3 report on the Puffcap', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: YA, text: 'Spindle Street is awake and complaining about cold soup, which is how I know they’re well. What was down there?',
        choices: [
          { text: 'A mushroom the size of a cottage. Its spores were black.', to: 'black' },
          { text: 'The sleepers didn’t dream. Not at all.', to: 'dream', insight: 'hedgewitch_no_dreams' },
        ],
      },
      dream: { speaker: YA, mood: 'afraid', text: 'No dreams? Everything that sleeps dreams, dear. Seeds dream. The tree dreams, or it used to. Sleep without dreaming isn’t rest. It’s just stopping.', next: 'black' },
      black: { speaker: YA, text: 'Black spores, black sap. It’s spreading inside the tree. (To the tree.) I know, I know. We’ll find it. Hush.', next: 'ostara' },
      ostara: { speaker: YA, text: 'Ostara’s asked after you, by the way. Bramblewife Ostara, down in the Sap Wells. She heard about the Puffcap. She wants to meet the young witch who stamped on it. You’ll like her. Everybody does.', next: null },
    },
  },
  // ---------- I-4 The Bramblewife's Garden
  {
    id: 'dialogue:hedgewitch-ostara-garden', name: 'I-4 meeting Ostara', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: OS, mood: 'happy', text: 'Is this the Puffcap-stamper? Come here, come here, I’d hug you but I’m sticky to the elbows. Mind the bucket. Mind that one too. Ostara. Bramblewife, they call me, because I’m prickly when I’m crossed.',
        choices: [
          { text: 'Yarrow says nobody in your ward has died in a year.', to: 'ward' },
          { text: 'What do you grow here?', to: 'grow' },
        ],
      },
      grow: { speaker: OS, text: 'Medicine, love. Sap from the deep wells, warm off the heart of the tree. A spoonful of it and a fever breaks. Two and a broken leg knits. I’ve not found what three does yet. Watch.', next: 'heal' },
      ward: { speaker: OS, text: 'A year and a month. I don’t say it to boast. Well, a bit. Watch this, now.', next: 'heal' },
      heal: { speaker: 'narrator', text: 'An old woman lies on a cot under the sap-pipes, grey and rattling. Ostara tips one warm spoonful of sap between her lips. The rattle stops. The grey goes green, then pink. The old woman opens her eyes and smiles.', next: 'keep' },
      keep: {
        speaker: OS, text: 'There. Nobody goes into the compost on my watch. Not one. I want to keep everyone, love. All of them. Will you help me with my rounds? Three beds. A spoonful each.',
        choices: [
          { text: 'Of course.', to: 'ladle', quest: true },
          { text: 'Everyone has to go into the compost some day.', to: 'compost', quest: true },
        ],
      },
      compost: { speaker: OS, mood: 'sad', text: 'Do they? Who says? Yarrow? Yarrow’s a dear and she talks to a tree. I talk to people, and none of them want to rot. Here’s the ladle.', next: null },
      ladle: { speaker: OS, mood: 'happy', text: 'Good witch. Here’s the ladle. Don’t lick it.', next: null },
    },
  },
  {
    id: 'dialogue:hedgewitch-ostara-tea', name: 'I-4 tea with Ostara', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: OS, mood: 'happy', text: 'Three beds, three smiles. You’ve a good hand with a ladle. Here, tea. It’s got sap in. Everything I make has sap in, I can’t help it.',
        choices: [
          { text: 'They didn’t say anything, after. Any of them.', to: 'quiet' },
          { text: 'Thank you. It was good work.', to: 'good', trust: 1 },
        ],
      },
      quiet: { speaker: OS, text: 'Resting, love. Healing takes it out of you. They’ll talk when they’ve something to say. Most people talk far too much anyway. Look at me.', next: 'vote' },
      good: { speaker: OS, mood: 'happy', text: 'It is, isn’t it? It’s the best work there is. Keeping people.', next: 'vote' },
      vote: { speaker: OS, text: 'Now. The Circle meets tonight about the Great Pruning. They want to burn back a year of the tree. My grafts are in that year, and so are the Bloomkin. You’ll speak, won’t you? Speak for keeping things.', next: null },
    },
  },
  // ---------- I-5 The Ring Vote (the faction choice; a party vote)
  {
    id: 'dialogue:hedgewitch-ring-vote', name: 'I-5 the Root Circle votes', scope: 'party',
    entries: [{ when: { not: { flag: 'hedgewitch.pruning' } }, node: 'ring' }, { node: 'after' }],
    nodes: {
      ring: { speaker: 'narrator', text: 'The Root Circle’s ring: thirty witches on thirty roots, arguing before anyone has said anything. At the edge stand the Bloomkin who woke this year, holding leaves and holding hands. Ostara sits among them, sticky and smiling.', next: 'motion' },
      motion: { speaker: CR, text: 'Order. ORDER. The motion: the Great Pruning. We burn back this year’s growth, and the swallowed streets come back. The Bloomkin who woke in that growth go back to seed. All in favour, disagree in the usual way.', next: 'yarrow' },
      yarrow: { speaker: YA, text: 'Before they start, the young one has a stone singing in them, and I’d like the tree to hear what they think. Go on, dear. Loudly. It’s a bit deaf on this side.', next: 'floor' },
      floor: {
        speaker: 'narrator', text: 'Thirty witches turn on their roots to look at you. The Bloomkin at the edge hold hands a little tighter. By the custom of the ring, whoever speaks first may give the floor to anyone.',
        choices: [
          { text: 'Let the Bloomkin speak first. It’s their year.', to: 'campion' },
          { text: 'Eldest, say why it has to be the Pruning.', to: 'cicely' },
          { text: 'Ostara. You keep people. What would you keep?', to: 'ostara' },
        ],
      },
      campion: { speaker: 'npc:campion', text: '(The ragged-robin Bloomkin steps into the ring with its lantern held up, and its petals shaking.) I woke up in a street. I did not ask to. But I am awake now, and I like it, and I would like to stay awake. That is all. Thank you for the floor.', next: 'choose' },
      cicely: { speaker: CR, mood: 'sad', text: 'Because a city is its streets. Three are gone this year, and three more by spring. I have chaired this ring for twenty years and I have never once wanted to win a vote less.', next: 'choose' },
      ostara: { speaker: OS, mood: 'happy', text: 'Everything, love. Every leaf and every Bloomkin and every street. Why should anything have to go? (Several witches look at their feet. Yarrow looks at Ostara for a long moment.)', next: 'choose' },
      choose: {
        speaker: CR, text: 'Well, witch? The year, or the streets?',
        choices: [
          { text: 'Prune it. Give Rootholme its streets back.', to: 'prune', quest: true, effects: [{ setFlag: 'hedgewitch.pruning', value: 'prune' }] },
          { text: 'Let it grow. The Bloomkin woke up. They get to stay awake.', to: 'grow', quest: true, trustNpc: YA, trust: -1, effects: [{ setFlag: 'hedgewitch.pruning', value: 'grow' }] },
          { text: 'Neither. The tree used to sleep every winter. Let me sing it one.', to: 'winter', quest: true, insight: 'hedgewitch_winter_sung', when: { insight: 'hedgewitch_winter' }, effects: [{ setFlag: 'hedgewitch.pruning', value: 'winter' }] },
        ],
      },
      prune: { speaker: CR, text: 'Carried, for once. The fires go round at dawn. (The Bloomkin let go of each other’s hands. Ostara stands up and walks out of the ring without a word.)', next: 'prune2' },
      prune2: { speaker: YA, mood: 'sad', text: 'It’s right, dear. It is. It doesn’t have to feel right as well. (To the tree, very quietly.) I’m sorry. I am.', next: null },
      grow: { speaker: CR, mood: 'angry', text: 'Then the motion falls, and three more streets go under bark by spring. Write that down, somebody. (The Bloomkin cheer, a sound like wind in a hedge. Ostara claps the loudest.)', next: 'grow2' },
      grow2: { speaker: YA, text: 'Well. They’re very sweet. I hope they’re worth Cobble Lane. I was born on Cobble Lane.', next: null },
      winter: { speaker: 'narrator', text: 'You hold the half-stone and sing it something slow and cold, a winter’s night. The leaves above the ring go gold, then brown, and then they let go, all together, like a held breath. The Bloomkin yawn, and curl up, and sleep.', next: 'winter2' },
      winter2: { speaker: YA, mood: 'happy', text: '(Very softly.) Oh. Oh, look. It’s stopped. For the first time in thirty years it’s stopped growing. (Across the ring, Ostara is staring at the falling leaves, and she looks frightened.)', next: null },
      after: { speaker: YA, text: 'The ring has spoken, dear, and it will go on speaking about it for years. That’s what rings are for.', next: null },
    },
  },
  // ---------- I-6 The Seed Vault
  {
    id: 'dialogue:hedgewitch-seed-vault', name: 'I-6 into the Seed Vault', scope: 'party',
    entries: [
      { when: { flag: 'hedgewitch.pruning', value: 'grow' }, node: 'grow' },
      { when: { flag: 'hedgewitch.pruning', value: 'winter' }, node: 'winter' },
      { node: 'prune' },
    ],
    nodes: {
      prune: { speaker: 'narrator', text: 'The Circle needs seed to replant what the Pruning burns. The Seed Vault smells of dust and dry summers. Somewhere among the drawers, a pair of enormous shears goes snip.', next: 'gardener' },
      grow: { speaker: 'narrator', text: 'The Bloomkin need seed from the vault to wake their kin before the growth crowds them out. Thistle-headed children follow you to the acorn door and no further. Inside, a pair of enormous shears goes snip.', next: 'gardener' },
      winter: { speaker: 'narrator', text: 'The tree is asleep, and when it wakes it will want its spring, and spring is in the Seed Vault. Inside, among the drawers, a pair of enormous shears goes snip, and snip, and snip.', next: 'gardener' },
      gardener: { speaker: 'narrator', text: 'A topiary giant rises between the shelves, clipped into the shape of a gardener, holding shears as long as a cart. It has been pruning this vault for thirty years. It looks at you the way a gardener looks at a weed.', next: null },
    },
  },
  {
    id: 'dialogue:obj-seed-vault-ledger', name: 'I-6 the seed-ledger', scope: 'party',
    entries: [{ when: { questStage: 'quest:hedgewitch-the-seed-vault', stage: 'ledger' }, node: 'read' }, { node: 'after' }],
    nodes: {
      read: { speaker: 'narrator', text: 'The Gardener’s seed-ledger, written on pressed leaves in a tiny, careful hand. Every drawer in the vault is listed, and every one is full but one: the drawer of the Elder Tree’s own seed.', next: 'signed' },
      signed: { speaker: 'narrator', text: 'Beside it, in sticky green ink: “Signed out, one seed, Elder, for safe keeping. O.” The leaf has a thumbprint on it. It smells of warm sap.', next: null },
      after: { speaker: 'narrator', text: 'The seed-ledger, closed. One drawer is still empty.', next: null },
    },
  },
  // ---------- I-7 What the Bramblewife Planted
  ...objs('canopy-graft', 'quest:hedgewitch-what-the-bramblewife-planted', 'grafts', [
    'A graft of grafts: dozens of cuttings bound into the bark with green twine, each one fat and pulsing. Something warm is being fed up into the tree through them. It is not sap.',
    'Higher up, a graft as thick as your arm. Under the twine the bark has gone black and shining, and it keeps growing as you watch. A new leaf unfolds, and then another, and then another, and does not stop.',
    'The grafts run into a little hollow, and in the hollow are pots of black-tear sap, stacked, labelled in sticky green ink. “For the crown of the tree.” “For the roots.” “For everyone.”',
  ], 'Ostara’s grafts, cut and dry now.'),
  {
    id: 'dialogue:hedgewitch-ostara-reveal', name: 'I-7 Ostara at the crown', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: OS, text: 'Oh, love. You’ve found my grafts. I did want to tell you myself. Sit down, it’s a long way to fall. Isn’t it beautiful up here? Look at it grow.',
        choices: [
          { text: 'You’ve been feeding the tree black tears.', to: 'tears' },
          { text: 'Your patients smell of sap, Ostara. Not skin.', to: 'held', insight: 'hedgewitch_sap', when: { any: [{ insight: 'hedgewitch_sap_smell' }, { flag: 'hedgewitch.gran_seen' }] } },
        ],
      },
      tears: { speaker: OS, text: 'For a year. A spoonful at a time, same as my patients. The tears make things grow, love. They make things grow and grow and never stop. Isn’t that what medicine is for?', next: 'held' },
      held: {
        speaker: OS, mood: 'sad', text: 'They’re not healed. I know they’re not. They’re held. Rooted, like the tree. They can’t get worse, and they can’t die. Isn’t that better? Isn’t it better than the compost?',
        choices: [
          { text: 'What do you want the half-stone for?', to: 'want' },
          { text: 'Gran Burdock hasn’t said a word in a month.', to: 'gran', when: { flag: 'hedgewitch.gran_seen' } },
        ],
      },
      gran: { speaker: OS, mood: 'angry', text: 'Gran Burdock was dying! Now she isn’t, and never will be. Ned has his Gran forever. You tell me which of those he’d choose.', next: 'want' },
      want: { speaker: OS, mood: 'happy', text: 'The Heartwood half, set in the heart of the tree, with the tears behind it. Then the tree covers everything. Rootholme, the wilds, the whole round world. Nothing will ever have to rot again. I’ll keep everyone.', next: 'go' },
      go: { speaker: OS, text: 'I’m going down to the Heartwood now, love. Don’t follow me. I like you. I’d hate to have to keep you.', next: null },
    },
  },
  // ---------- I-8 The Heartwood
  {
    id: 'dialogue:obj-verdant-capital-halfstone', name: 'I-8 the Heartwood half', scope: 'party',
    entries: [{ when: { questStage: 'quest:hedgewitch-the-heartwood', stage: 'stone' }, node: 'claim' }, { node: 'knot' }],
    nodes: {
      claim: { speaker: 'narrator', text: 'In a knot of living wood that beats, slowly, like a sleeping heart, lies half of a green crystal, cracked clean across. It comes away into your hand as if the tree were giving it to you. It is warm, the way a hand is warm.', next: 'beat' },
      beat: { speaker: 'narrator', text: 'Round you the Heartwood keeps on beating, but slower now, and slower, like a runner who has been told the race is over. Ostara’s grafts hang from the walls, cut and dripping black.', next: 'vision' },
      vision: { speaker: 'narrator', text: 'For a moment you are not in the tree. You are standing on a hill at night in a ring of twelve stones, each singing its own note, and in the middle there is a crown that nobody is wearing. Then the ring cracks, all at once, and the song breaks.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'You are back in the dark with the half-stone in your hand. The tree is listening to you. You can feel it listening, all the way up, from the roots to the topmost leaf.',
        choices: [
          { text: '(Hum to it, the way Yarrow hums. A slow tune for a tired thing.)', to: 'hum' },
          { text: '(Lay your hand on the wood.) “I’ve got it. You can let go now.”', to: 'letgo' },
          { text: '“Where is your other half?”', to: 'other' },
        ],
      },
      hum: { speaker: 'narrator', text: 'The half-stone takes up the tune before you do. High overhead a single leaf comes loose and drifts all the way down the heart of the tree, turning, and lands on your boot. The first leaf the Elder Tree has let fall in thirty years.', next: 'ostara' },
      letgo: { speaker: 'narrator', text: 'Under your palm the wood goes slack, very slightly, the way a hand goes slack in sleep. Somewhere far above, a bough that has been creaking for thirty years stops creaking.', next: 'ostara' },
      other: { speaker: 'narrator', text: 'It hums, low and green, and you know without knowing how that the other half is out in the wilds, in something dead and soft, waiting for a Ranger who smells of leaf-mould to carry it home.', next: 'ostara' },
      ostara: { speaker: OS, mood: 'angry', text: '(From somewhere far down a root-tunnel, her voice, and the sound of digging.) Keep it watered, love! I’ll be waiting at the Thorn Gate. Everything has to go through the gate in the end.', next: 'dark' },
      dark: { speaker: 'narrator', text: 'Then only the digging, going away, and the beat of the Heartwood, and the half-stone singing in your hand as if it has been waiting thirty years to be held. Perhaps it has.', next: null },
      knot: { speaker: 'narrator', text: 'The empty knot in the Heartwood, still beating.', next: null },
    },
  },
  // ---------- I-9 The Root Road (mentor farewell; trust check)
  {
    id: 'dialogue:hedgewitch-yarrow-farewell', name: 'I-9 Yarrow’s farewell', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: YA, text: 'Sit down, dear. The tea’s just right, and so are you. So you have it, and she’s gone for the gate, and you’ll follow. (To the tree.) Don’t look at me like that. I always knew they’d go.',
        effects: [{ setFlag: 'hedgewitch.yarrow_farewell', value: true }],
        choices: [
          { text: 'Come with me.', to: 'stay' },
          { text: 'Thank you, Mother Yarrow. For all of it.', to: 'gifts', trust: 1 },
        ],
      },
      stay: { speaker: YA, text: 'And leave this great lummox on its own? It’d have the market in the river by Tuesday. No. Somebody has to talk to it.', next: 'gifts' },
      gifts: {
        speaker: YA, text: 'Now, I’ve something for you. Two somethings, if you’ve been good.',
        choices: [
          { text: '(Hold out your hand.)', to: 'acorn', when: { trust: YA, value: 'friendly' } },
          { text: '(Kiss her on the cheek.)', to: 'kiss', when: { not: { trust: YA, value: 'friendly' } } },
        ],
      },
      acorn: { speaker: YA, text: 'An acorn, from the tree’s last winter, thirty-one years ago. I’ve carried it on this cord ever since. It’s still warm. Plant it somewhere that needs a word from home.', effects: [{ giveItem: 'i_yarrow_acorn' }, { setFlag: 'hedgewitch.yarrow_acorn', value: true }], next: 'name' },
      name: {
        speaker: YA, text: 'And the other thing.',
        choices: [
          { text: '(Wait.)', to: 'tell', when: { trust: YA, value: 'trusted' } },
          { text: '(Wait.)', to: 'end', when: { not: { trust: YA, value: 'trusted' } } },
        ],
      },
      tell: {
        speaker: YA, mood: 'happy', text: '(She puts both hands on the bark and says your name to the tree, slowly, three times, the way you’d teach a child a word.) There. Now it knows you. The roots on the gate road will move for you, dear. It may grumble. Let it.',
        effects: [{ setFlag: 'hedgewitch.roots_part', value: true }], next: 'end',
      },
      kiss: { speaker: YA, text: 'Oh, get on with you. Mind the road. Mind the Grove. Mind yourself.', next: null },
      end: { speaker: YA, mood: 'sad', text: 'Go on, then. Before I start talking to you like you’re the tree.', next: null },
    },
  },
];

export default dialogues;
