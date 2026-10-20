/** Hollow Crown, ARCANIST Act I main dialogues (Kilnhold). Owner: Claude 4. */
import type { DialogueDef } from '@/core';

const TH = 'npc:coalby-thrane' as const, MO = 'npc:ignace-morrow' as const;

const dialogues: DialogueDef[] = [
  // ---------- I-1 The Bell in the Kiln
  {
    id: 'dialogue:arcanist-bell-night', name: 'I-1 the Bell rings over Kilnhold', scope: 'party',
    entries: [{ node: 'bell' }],
    nodes: {
      bell: { speaker: 'narrator', text: 'Midnight in Kilnhold. Somewhere very far away a bell rings once, and every pane of glass in the Kiln Ward cracks at the same moment.', next: 'song' },
      song: { speaker: 'narrator', text: 'Something in your chest begins to sing back. It is warm, and it is pulling, gently, like a hand on your sleeve. Towards the Great Kiln.', next: 'street' },
      street: { speaker: 'narrator', text: 'You are in the street before you have decided to be. All along the Kiln Ward, people are standing at their cracked windows in their nightclothes, holding candles, looking north. Nobody speaks. A dog is barking at the sky.', next: 'ward' },
      ward: {
        speaker: 'narrator', text: 'A watchman passes you at a run, then stops, and looks at you, and looks again. “You’re…” he says. “Your hands are glowing.” They are, faintly, like coals under ash.',
        choices: [
          { text: '(Hide your hands in your sleeves and keep walking.)', to: 'hide' },
          { text: '“It’s nothing. A trick of the light.”', to: 'lie' },
          { text: '(Show him. Let the glow brighten.)', to: 'show', school: 'ash' },
        ],
      },
      hide: { speaker: 'narrator', text: 'He watches you go. You can feel him watching. The singing pulls you on, down the Ward, past the shuttered shops, towards the great black shape of the Kiln against the stars.', next: null },
      lie: { speaker: 'narrator', text: '“Right,” he says, slowly, in the voice of a man deciding not to have seen something. “Right. A trick of the light. Mind how you go.” You go.', next: null },
      show: { speaker: 'narrator', text: 'The glow climbs your wrists, gold as the Kiln’s mouth. The watchman takes a step back, then a step forward, as if he wanted to warm his hands. “Go on,” he whispers. “Whatever it is, it’s calling you. Go on.”', next: null },
    },
  },
  {
    id: 'dialogue:arcanist-thrane-bell', name: 'I-1 Thrane at the Kiln gate', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: TH, text: 'Psst! Here. Behind the coal-cart. Quickly, before the Watch comes round. You’re glowing, did you know? Right here.',
        choices: [
          { text: 'Something is singing in my chest.', to: 'sing' },
          { text: 'Who are you?', to: 'who' },
        ],
      },
      who: { speaker: TH, text: 'Coalby Thrane. Magister of the Conclave, for my sins, which are mostly paperwork. Now. The singing.', next: 'sing' },
      sing: {
        speaker: TH, text: 'That is a Concord Stone, or half of one, calling for you from somewhere under this Kiln. I have read about it all my life. I never thought I’d see it walk up to the gate in its nightclothes.',
        choices: [
          { text: 'A Concord Stone? The ones from the crown?', to: 'crown', insight: 'arcanist_stone_named' },
          { text: 'What do I do?', to: 'do' },
        ],
      },
      crown: { speaker: TH, text: 'The very ones. Thirty years ago they fled the crown and cracked as they fell. Ours came home to the Kiln. Half of it, anyway.', next: 'do' },
      do: {
        speaker: TH, text: 'Not here. If the Conclave sees you glowing they’ll lock you in a jar for study. Come home with me, by the back lanes, and I’ll tell you what I can. Then you can do me a small, slightly illegal favour. Agreed?',
        choices: [
          { text: 'Agreed.', to: 'end', trust: 1 },
          { text: 'How illegal?', to: 'illegal' },
        ],
      },
      illegal: { speaker: TH, text: 'Permit-illegal. Not prison-illegal. Mostly. Here: one burning permit, signed by me, stamped by somebody who owes me a favour. Don’t let anyone read it closely.', next: 'end' },
      end: { speaker: TH, text: 'Keep to the shadows and keep up. And mind the slime on the way in. He’s called Pudding and he bites only paper.', next: null },
    },
  },
  // ---------- I-2 A Permit to Burn
  {
    id: 'dialogue:arcanist-thrane-braziers', name: 'I-2 report on the braziers', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: TH, text: 'All five? And nobody asked to see the permit? Splendid. What’s that face for?',
        choices: [
          { text: 'There are black tears in the gutters.', to: 'tears' },
          { text: 'The tears come in with the smoke, don’t they?', to: 'smoke', insight: 'arcanist_smoke', when: { questCompleted: 'quest:arcanist-the-sweeps-strike' } },
          { text: 'They run uphill, to a grate by the Kiln. The grate has the Provost’s seal.', to: 'seal', when: { flag: 'arcanist.gutter_seal' } },
        ],
      },
      tears: { speaker: TH, mood: 'afraid', text: 'In Kilnhold? Not on the borders, not in the Fields, here? Then it’s coming from inside. Oh, I don’t like that at all.', next: 'orsolya' },
      smoke: { speaker: TH, mood: 'afraid', text: 'With the smoke. From the Kiln. Then whatever the Kiln is burning… No. I won’t say it until I can prove it.', next: 'orsolya' },
      seal: { speaker: TH, mood: 'afraid', text: 'His seal. On a grate that drinks tears. (He takes his spectacles off, and puts them on again, and takes them off.) There will be a sensible explanation. Ignace is always sensible. I will find it before I believe anything else.', next: 'orsolya' },
      orsolya: { speaker: TH, text: 'One thing at a time. Orsolya Glaze on the Row has lost three apprentices, and someone painted black tears on her door. Go and see her. Take Pudding’s regards.', next: null },
    },
  },
  // ---------- I-3 The Zealots' Furnace
  {
    id: 'dialogue:arcanist-orsolya-missing', name: 'I-3 Orsolya’s missing apprentices', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:orsolya-glaze', text: 'Thrane sent you? Good. Three of my apprentices, gone in a month. Last night someone painted this on my door. Black tears. The Zealots’ mark.',
        choices: [
          { text: 'Who are the Ashen Zealots?', to: 'who' },
          { text: 'Where do they meet?', to: 'where', quest: true },
        ],
      },
      who: { speaker: 'npc:orsolya-glaze', text: 'A cult. They think the tears are dirt, and dirt can be burned clean, and so can people. They’ve taken over the old chapel under the Row and turned it into a furnace.', next: 'where' },
      where: { speaker: 'npc:orsolya-glaze', text: 'Under the Row, through the chapel cellar, if I had to guess. Look at their benches first. All three were hiding something from me lately, and I was too proud to ask. Then bring them back. With their eyebrows, if you can.', next: null },
    },
  },
  {
    id: 'dialogue:obj-zealot-cages', name: 'I-3 the cages',
    entries: [{ when: { questStage: 'quest:arcanist-the-zealots-furnace', stage: 'cages' }, node: 'free' }, { node: 'empty' }],
    nodes: {
      free: { speaker: 'narrator', text: 'Three apprentices, sooty and furious, in cages of hot iron. The locks melt at a touch of your fire. They run for the stairs without saying thank you, which is fair.', next: null },
      empty: { speaker: 'narrator', text: 'Empty cages, still warm.', next: null },
    },
  },
  {
    id: 'dialogue:arcanist-orsolya-freed', name: 'I-3 apprentices home', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:orsolya-glaze', mood: 'happy', text: 'All three, with all their eyebrows. I won’t forget it. Here, take these, they keep the black fire off. And… the Provost sent a pigeon for you. The Provost. Mind yourself up there.',
        choices: [{ text: 'Why mind myself?', to: 'why' }, { text: 'Thank you.', to: null, trust: 1 }],
      },
      why: { speaker: 'npc:orsolya-glaze', text: 'Because he’s kept the Kiln burning when nobody else could, and nobody knows how. That’s all. That’s all I’ll say.', next: null },
    },
  },
  // ---------- I-4 The Provost's Favour
  {
    id: 'dialogue:arcanist-morrow-favour', name: 'I-4 meeting Provost Morrow', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: MO, mood: 'happy', text: 'There you are. The Arcanist who walked into the Zealots’ Furnace and walked out again. Come in, come in, stand by the fire. You have an unusual warmth about you. I noticed it from across the hall.',
        choices: [
          { text: 'Thank you, Provost.', to: 'kiln' },
          { text: 'Unusual how?', to: 'warmth' },
        ],
      },
      warmth: { speaker: MO, text: 'Oh, the way a hearthstone is warm after the fire’s out. You carry heat. I study heat. Forgive an old scholar’s curiosity. Well, a young scholar’s. I was very young for a provost.', next: 'kiln' },
      kiln: {
        speaker: MO, text: 'Here is my trouble. The Great Kiln is failing. It has been failing for thirty years and I have kept it alive with my own hands. Tonight the Conclave votes on what to feed it next. I would like you there.',
        choices: [
          { text: 'What will they feed it?', to: 'archive' },
          { text: 'Why me?', to: 'why' },
        ],
      },
      why: { speaker: MO, text: 'Because you have no stake in the old quarrels, and because people listen to someone who has walked out of a furnace. And because I like you. Is that so strange?', next: 'archive' },
      archive: { speaker: MO, mood: 'sad', text: 'The Glass Archive. Every record since the Concord. It breaks my heart. But a city can live without its memory. It cannot live without its fire. Walk with me. I’ll show you what she keeps warm. Meet me at the top of the Terraces.', next: null },
    },
  },
  // ---------- I-5 The Last Library (the faction choice; a party vote)
  {
    id: 'dialogue:arcanist-last-library', name: 'I-5 the Conclave vote', scope: 'party',
    entries: [{ when: { not: { flag: 'arcanist.library' } }, node: 'hall' }, { node: 'after' }],
    nodes: {
      hall: { speaker: 'narrator', text: 'The Conclave Hall, packed and hot. Forty masters in soot-black robes. Thrane is at the back, arms folded, shaking his head at you very slightly.', next: 'motion' },
      motion: { speaker: MO, text: 'The motion is that the Glass Archive be given to the Great Kiln, so that Kilnhold may keep its fire. I will be brief: I have kept her burning for a year with my own hands, and I can do it no longer with what we have.', next: 'debate' },
      debate: { speaker: 'narrator', text: 'The hall erupts. A Magister of the Row shouts that the glass trade will die without the old recipes. A Magister of the Roots shouts back that the glass trade will die faster in the cold. Somebody throws a shoe. It is, apparently, a Conclave tradition.', next: 'thrane' },
      thrane: { speaker: TH, text: '(From the back, not loudly, and the hall goes quiet to hear him.) Six hundred years of what we learned, and why. If we burn it, we will still have a fire. We will just no longer know what it is for.', next: 'reply' },
      reply: { speaker: MO, mood: 'happy', text: 'Beautifully put, as always, Coalby. Coalby taught me everything I know. Including, I think, that sentiment does not keep children warm. Our young guest will speak next.', next: 'choose' },
      choose: {
        speaker: MO, text: 'Well, Arcanist? What is fire for?',
        choices: [
          { text: 'Burn it. A city lives on fire, not paper.', to: 'burned', quest: true, trustNpc: TH, trust: -1, effects: [{ setFlag: 'arcanist.library', value: 'burned' }] },
          { text: 'No. Fire is for making, not unmaking. Save the books.', to: 'saved', quest: true, effects: [{ setFlag: 'arcanist.library', value: 'saved' }] },
          { text: 'Neither. The Kiln was never meant to burn wood or books. It burned the stone’s song. Let me sing to it.', to: 'sung', quest: true, insight: 'arcanist_sang_kiln', when: { insight: 'kiln_song' }, effects: [{ setFlag: 'arcanist.library', value: 'sung' }] },
        ],
      },
      burned: { speaker: MO, mood: 'happy', text: 'Wisdom, from one so young. Carried. The Archive burns tonight. (At the back of the hall, Thrane turns and walks out.)', next: null },
      saved: { speaker: MO, text: 'Sentiment. Lovely, useless sentiment. The motion falls, and Kilnhold will be cold this winter. (Thrane catches your eye, and taps the side of his nose.)', next: null },
      sung: { speaker: MO, mood: 'afraid', text: '(You sing, and the half-stone in you sings, and through the floor the whole Kiln roars up bright and gold.) …Interesting. Very interesting. The motion is withdrawn.', next: null },
      after: { speaker: MO, text: 'The Conclave has spoken. I hope you can live with it. I can live with almost anything.', next: null },
    },
  },
  // ---------- I-6 The Ledger Flame
  {
    id: 'dialogue:obj-ledger-page', name: 'I-6 the page that did not burn', scope: 'party',
    entries: [{ when: { questStage: 'quest:arcanist-the-ledger-flame', stage: 'page' }, node: 'page' }, { node: 'gone' }],
    nodes: {
      page: { speaker: 'narrator', text: 'A single page, unburned in all that fire. A Conclave fuel ledger, in the Provost’s own neat hand. The columns say what the Great Kiln has been fed this year. None of the entries are wood.', next: 'why' },
      why: { speaker: 'narrator', text: 'It will not burn because it is wet. The ink has run in places, and where it has run it is black, and the black is very slightly warm, and moving, as if it were trying to get back to wherever it came from.', next: null },
      gone: { speaker: 'narrator', text: 'Ash, and the shape of a page where a page used to be.', next: null },
    },
  },
  // ---------- I-7 What the Provost Burned
  {
    id: 'dialogue:arcanist-thrane-page', name: 'I-7 Thrane reads the ledger', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: TH, text: 'Let me see. Hm. “Tincture, black, forty measures.” “Tincture, black, sixty.” Every week, more. There is no such thing as black tincture. There is only one black thing that burns like that.', next: 'tears' },
      tears: {
        speaker: TH, mood: 'afraid', text: 'He has been feeding the Great Kiln black tears. They burn hot. Hotter than anything. And the smoke carries them over the whole city. Down every gutter you lit.',
        choices: [
          { text: 'Why would he do that?', to: 'why' },
          { text: 'He wants the half-stone, doesn’t he?', to: 'stone', insight: 'arcanist_morrow_wants', when: { any: [{ insight: 'arcanist_smoke' }, { flag: 'arcanist.pigeon_letter' }] } },
        ],
      },
      why: { speaker: TH, text: 'To keep it burning. Because he promised it would never go out. Because when it does, everyone will see what he is. Go down into the Roots and find where the tincture goes in. I need to be sure.', next: null },
      stone: { speaker: TH, mood: 'sad', text: 'The letter Dilly showed you. “A heart that never cools.” Yes. He wants the Kiln half in his own chest. He wants to be the Kiln. Go down into the Roots, and find where it goes in.', next: null },
    },
  },
  {
    id: 'dialogue:obj-kiln-flue-tears', name: 'I-7 the black fuel', scope: 'party',
    entries: [{ when: { questStage: 'quest:arcanist-what-the-provost-burned', stage: 'roots' }, node: 'tears' }, { node: 'flue' }],
    nodes: {
      tears: { speaker: 'narrator', text: 'Behind a false wall in the Roots: barrels stacked to the ceiling, each one stamped with the Provost’s seal, each one full of black tears. A pipe runs from them straight into the Kiln’s heart.', next: 'down' },
      down: { speaker: 'narrator', text: 'Somewhere below, past the pipe, your half-stone is singing. And someone is already walking towards it.', next: null },
      flue: { speaker: 'narrator', text: 'The empty barrel-room behind the false wall.', next: null },
    },
  },
  // ---------- I-8 The Heart of the Kiln
  {
    id: 'dialogue:obj-ash-capital-halfstone', name: 'I-8 the Kiln half', scope: 'party',
    entries: [{ when: { questStage: 'quest:arcanist-the-heart-of-the-kiln', stage: 'stone' }, node: 'claim' }, { node: 'cradle' }],
    nodes: {
      claim: { speaker: 'narrator', text: 'In a cradle of white fire lies half of a crystal, cracked clean across, singing. It does not burn your hand. It feels like holding someone’s hand.', next: 'vision' },
      vision: { speaker: 'narrator', text: 'For a moment you are not in the Kiln. You are standing in a ring of twelve stones on a hill at night, and every stone is singing a different note, and the notes make one sound together, and in the middle of the ring there is a crown that nobody is wearing.', next: 'crack' },
      crack: {
        speaker: 'narrator', text: 'Then the ring cracks, all twelve stones at once, and the sound breaks into a thousand pieces, and you are back in the heat with the half-stone in your hand and tears on your face that are not black.',
        choices: [
          { text: '(Hold it tighter.)', to: 'morrow' },
          { text: '“Where is your other half?”', to: 'other' },
        ],
      },
      other: { speaker: 'narrator', text: 'It hums, low and patient, and you know without knowing how that the other half is north, through the gate, waiting for someone of the other Ash school to carry it home.', next: 'morrow' },
      morrow: { speaker: MO, mood: 'angry', text: '(From far up the flue, his voice.) Keep it warm for me, Arcanist. I’ll be waiting at the gate. Everyone has to go through the gate.', next: null },
      cradle: { speaker: 'narrator', text: 'The empty cradle, still bright.', next: null },
    },
  },
  // ---------- I-9 The Cinder Road (mentor farewell; trust check)
  {
    id: 'dialogue:arcanist-thrane-farewell', name: 'I-9 Thrane’s farewell', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: TH, text: 'So. You have it. And he has gone for the gate, and you have to follow, and I have to stay and keep this city from freezing without its tincture. Sit a moment. Just a moment.',
        choices: [
          { text: 'Come with me.', to: 'stay' },
          { text: 'Thank you, Magister. For all of it.', to: 'memory', trust: 1 },
        ],
      },
      stay: { speaker: TH, text: 'I’m sixty-eight and I get winded on stairs. No. Kilnhold needs someone who remembers what fire is for.', next: 'memory' },
      memory: { speaker: TH, mood: 'sad', text: 'Do you know, the night the stones fled, thirty years ago, I was up on the Terraces with Ignace. He was twelve. We watched the Kiln go dim, like an eye closing. He held my hand, and he said, “I won’t let it go out, Magister. I promise.” And he didn’t.', next: 'promise' },
      promise: {
        speaker: TH, text: 'A promise like that is a terrible thing to give a child. I should have told him that the Kiln was not his to keep. I should have told him a lot of things.',
        choices: [
          { text: 'You can still tell him. When I bring him back.', to: 'back', trust: 1 },
          { text: 'It wasn’t your fault.', to: 'fault' },
        ],
      },
      back: { speaker: TH, text: '(He laughs, wetly.) When. Not if. You’ve been listening to me for too long. All right. When.', next: 'gifts' },
      fault: { speaker: TH, text: 'No. But it was my watch. A teacher is always on watch. Remember that, if you ever have one of your own.', next: 'gifts' },
      gifts: {
        speaker: TH, text: 'I have something for you.',
        choices: [
          { text: '(Take what he offers.)', to: 'lantern', when: { trust: TH, value: 'friendly' } },
          { text: '(Shake his hand.)', to: 'hand', when: { not: { trust: TH, value: 'friendly' } } },
        ],
      },
      lantern: { speaker: TH, text: 'My lantern. It has hung on my hat for forty years. It lights in places nothing else will. Bring it back to me one day, lit.', effects: [{ giveItem: 'i_thrane_lantern' }, { setFlag: 'arcanist.thrane_lantern', value: true }], next: 'pudding' },
      pudding: {
        speaker: TH, mood: 'sad', text: 'And… Pudding wants to go with you. Don’t look at me like that. He told me.',
        choices: [
          { text: 'I’ll look after him.', to: 'end', when: { trust: TH, value: 'trusted' }, effects: [{ setFlag: 'arcanist.pudding_pet', value: true }] },
          { text: 'He should stay with you.', to: 'end' },
        ],
      },
      hand: { speaker: TH, text: 'Well. Mind the road. Mind the Pyrelord. Mind yourself.', next: null },
      end: { speaker: TH, text: 'Go on, then. Before I say something sentimental.', next: null },
    },
  },
];

export default dialogues;
