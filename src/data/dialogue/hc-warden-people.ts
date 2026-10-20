/**
 * Hollow Crown, WARDEN: Wardwall people (general talk), the eight side quests, the mentor thread and the bounties,
 * plus the Act II class-thread, featured-bearer and hook scenes. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const offer = (q: Q, text: string, to: string, extra?: NarrativeCondition): DialogueChoice =>
  ({ text, to, quest: true, when: extra ? { all: [fresh(q), extra] } : fresh(q), effects: [{ startQuest: q }] });
const bye: DialogueChoice = { text: 'Farewell.', to: null, tag: 'leave' };
const NIGHT: NarrativeCondition = { hour: [21, 4] };
const WD: NarrativeCondition = { heroClass: 'warden' };
const DO = 'npc:dagny-orr' as const, HK = 'npc:grandam-hekla' as const;

const dialogues: DialogueDef[] = [
  // ---------- Dagny (general + mentor thread)
  {
    id: 'dialogue:warden-dagny', name: 'Dagny (general)',
    entries: [
      { when: { all: [stage('quest:warden-the-watch-fires', 'fires'), { not: { flag: 'warden.delight.trousers' } }] }, node: 'trousers' },
      { node: 'start' },
    ],
    nodes: {
      trousers: { speaker: DO, text: 'WHAT? Oh, it’s you. You’re wearing trousers. Good. That’s already an improvement on last night. (She points along the Rampart.) Fires. That way. Speak UP when you find out.', effects: [{ setFlag: 'warden.delight.trousers', value: true }], next: null },
      start: {
        speaker: DO, text: 'WHAT? Oh, it’s you. Speak up. Shield’s crooked. Go on.',
        choices: [
          offer('quest:warden-the-long-horn', 'How did you go deaf, Captain?', 'horn', { trust: DO, value: 'friendly' }),
          offer('quest:warden-a-captains-sister', 'Grandam Hekla at the steading. She has your laugh.', 'sister', { all: [{ trust: DO, value: 'trusted' }, { questCompleted: 'quest:warden-the-steading-oven' }] }),
          { text: 'How long have you held the wall?', to: 'long' },
          bye,
        ],
      },
      horn: { speaker: DO, text: 'You want THAT story. Hm. Sit down, then. Not here. In my quarters, with the door shut, where Kettil can’t hear me being soft.', next: null },
      sister: {
        speaker: DO, mood: 'sad', text: '(For once she hears you perfectly.) …She has my laugh because I had it first. Thirty years. Thirty years, pup, and I can see her chimney smoke from the Rampart every single morning. (A long breath.) Fine. I’ll come. Don’t tell her I said fine.',
        next: null,
      },
      long: {
        speaker: DO, text: 'Twenty-eight years as Captain. Forty-six on the wall. My mother held it before me and her father before her. The wall doesn’t change. That’s what it’s for. That’s what I tell myself.',
        choices: [
          { text: 'And when you’re off the wall, Captain?', to: 'off', when: { trust: DO, value: 'friendly' } },
          { text: 'Yes, Captain.', to: 'start' },
        ],
      },
      off: { speaker: DO, text: 'Off it? (She looks at you as if you had asked what she does when she is off the ground.) …Come up on the Gatehouse roof. Don’t tell Kettil.', next: 'roof' },
      roof: { speaker: 'narrator', text: 'Behind the chimney stack on the Gatehouse roof, in six old ration boxes full of earth, Dagny Orr is growing cabbages. They are small and blue and fierce, and they are the only green thing on the Wardwall.', next: 'cabbages' },
      cabbages: {
        speaker: DO, text: 'Forty years I’ve grown them. I talk to them. Loudly, so they can hear. They don’t mind. (She tucks a sack round the smallest.) Look which way they lean.',
        choices: [
          { text: 'North. Towards the Jarlsfell.', to: 'north' },
          { text: 'They look very well disciplined.', to: 'drill' },
        ],
      },
      north: { speaker: DO, mood: 'sad', text: 'North. Every one of them, every year. It’s where the light comes from, up here, over the wall. Everything that grows leans that way in the end. (She stands up.) Right. You never saw this.', next: 'start' },
      drill: { speaker: DO, mood: 'happy', text: 'They are the best-drilled cabbages in Frostmere. They have never once broken ranks. (She very nearly smiles.) Right. You never saw this.', next: 'start' },
    },
  },
  {
    id: 'dialogue:warden-dagny-long-horn', name: 'Mentor: the Long Horn', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: DO, text: 'C. 1012. The night the gates shut, the cold came down like a lid. The old charter said: when the great cold comes, the Captain blows the Long Horn to call the clan grandmothers in from the Jarlsfell. So I blew it.',
        choices: [{ text: 'You weren’t Captain then.', to: 'captain' }, { text: 'What happened?', to: 'what' }],
      },
      captain: { speaker: DO, text: 'No. I was a horn-girl of nineteen with lungs like a forge-bellows. The Captain of the day was Haldor Brisk, and he’d gone to bed. So I blew it anyway.', next: 'what' },
      what: {
        speaker: DO, mood: 'sad', text: 'Three nights I blew it. The grandmothers came. Haldor kept the postern shut and countermanded the charter, and they stood at the wall in the snow, listening to me blow, and the postern stayed shut. I blew until I couldn’t hear it any more. I never got that ear back.',
        choices: [{ text: 'Where is the charter now?', to: 'chest', trust: 1 }, { text: 'I’m sorry, Captain.', to: 'chest' }],
      },
      chest: { speaker: DO, text: 'Haldor took it to his grave out of spite. He’s in the Wraith Barrows, with a sealed chest at his feet. I’ve never had the stomach to open it. You have a stronger stomach. Go and read me what it says.', next: null },
    },
  },
  {
    id: 'dialogue:obj-wall-charter-chest', name: 'Mentor: the old Captain’s chest', scope: 'party',
    entries: [{ when: stage('quest:warden-the-long-horn', 'chest'), node: 'open' }, { node: 'shut' }],
    nodes: {
      open: { speaker: 'narrator', text: 'A sealed iron chest at the foot of a barrow marked HALDOR BRISK, CAPTAIN, WHO KEPT THE WALL. Inside, wrapped in oilcloth, the founding charter of the Wardwall, in the Hundredth Warden’s square hand.', next: 'read' },
      read: { speaker: 'narrator', text: '“This wall is raised against the winter, and against nothing else. Its gates shall stand open for anyone who comes in from the cold.” Someone, long ago, has underlined “anyone” twice.', next: null },
      shut: { speaker: 'narrator', text: 'An empty iron chest in the Wraith Barrows.', next: null },
    },
  },
  {
    id: 'dialogue:warden-dagny-charter', name: 'Mentor: the Wall Charter', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: DO, text: 'Read it. No, LOUD. (You read it to her, loud.) …Again. (You read it again.) “Anyone who comes in from the cold.” Underlined. Twice.', next: 'charter' },
      charter: {
        speaker: DO, mood: 'sad', text: 'I was right. I was nineteen and I was right, and I went deaf for it, and I spent thirty years telling myself I was wrong so the wall would make sense. (She folds the charter very carefully.) Thank you, pup.',
        choices: [{ text: 'The wall was always meant to have gates.', to: 'end', insight: 'wall_charter', trust: 1 }],
      },
      end: { speaker: DO, text: 'Remember that, if anybody ever puts the postern to a moot.', next: null },
    },
  },
  {
    id: 'dialogue:warden-sisters', name: 'Mentor: A Captain’s Sister', scope: 'party',
    entries: [{ when: { not: { flag: 'warden.sisters_laughed' } }, node: 'meet' }, { node: 'after' }],
    nodes: {
      meet: { speaker: 'narrator', text: 'The steading oven, glowing. Grandam Hekla in the doorway, arms folded. Dagny at the gate, arms folded. They look exactly alike, which neither of them would thank you for saying. Nobody speaks for a very long time.', next: 'hekla' },
      hekla: { speaker: HK, text: 'Dagny.', next: 'dagny' },
      dagny: { speaker: DO, text: 'WHAT?', next: 'stand' },
      stand: {
        speaker: 'narrator', text: 'Hekla’s mouth twitches. Dagny’s jaw sets. You are standing exactly between them, like a postern.',
        choices: [
          { text: 'She said your name, Captain.', to: 'name' },
          { text: 'Grandam, she’s deaf in that ear. Try the other one.', to: 'ear' },
          { text: '(Say nothing. Hold your ground.)', to: 'hold' },
        ],
      },
      name: { speaker: DO, text: 'I heard her. I always hear her. I heard her from the Rampart for thirty years, shouting at the goats.', next: 'laugh' },
      ear: { speaker: HK, text: 'The other one? Which one is the other one? (She leans to the left and bellows.) DAGNY!', next: 'laugh' },
      hold: { speaker: 'narrator', text: 'You stand there. They stand there. The oven ticks. A clan child walks between all three of you with a bowl of porridge, looks up, and says: “Are you two the same lady?”', next: 'laugh' },
      laugh: {
        speaker: 'narrator', text: 'And Hekla laughs. It is Dagny’s laugh, the one you can hear from the Wardwall, and it goes on and on, and then Dagny is laughing too, and holding on to the gatepost, and then they are holding on to each other.',
        effects: [{ setFlag: 'warden.sisters_laughed', value: true }], next: 'end',
      },
      end: { speaker: DO, mood: 'happy', text: '(Wiping her eyes.) Thirty years. Thirty years, over a postern. Go away, pup. Go on. You did well. I’ll walk home in the morning. Maybe.', effects: [{ trust: DO, delta: 1 }], next: null },
      after: { speaker: HK, mood: 'happy', text: 'She’s staying for supper. She’s eaten three bowls. She says she can’t hear me telling her she’s had enough.', next: null },
    },
  },
  // ---------- Torvald (general)
  {
    id: 'dialogue:warden-torvald', name: 'Torvald (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:torvald-wallbreaker', mood: 'sad', text: 'One sledge, pup. That’s all I ever wanted. One sledge, and nobody standing in the snow. Feet. Mind your feet.', next: null } },
  },
  // ---------- the Gatehouse: Clemmie, Ebbe, Kettil
  {
    id: 'dialogue:warden-clemmie', name: 'Clemmie Briggs (the Misheard Orders)',
    entries: [{ when: stage('quest:warden-the-misheard-orders', 'clemmie'), node: 'sorted' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:clemmie-briggs', text: 'You’ve got to help. Nobody asks the Captain to say it again. Nobody. Not for twenty years. And there’s a squad behind the stables digging a moat.',
        choices: [offer('quest:warden-the-misheard-orders', 'Why are they digging a moat?', 'moat'), bye],
      },
      moat: { speaker: 'npc:clemmie-briggs', mood: 'afraid', text: 'Because she asked for a boat! For the ice-fishing! And Olaf’s lot are baking a cake shaped like the cook, because she said “wake the cook”. And somebody’s polishing the hedge. I don’t even know what she said for that one.', next: null },
      sorted: {
        speaker: 'npc:clemmie-briggs', mood: 'happy', text: 'A boat! A woken cook! And it was “polish the horns”, not the thorns, which makes so much more sense now I hear it. She didn’t notice. She didn’t notice any of it!',
        choices: [{ text: 'Next time, ask her to say it again.', to: 'again' }, { text: 'Our secret.', to: 'first' }],
      },
      again: { speaker: 'npc:clemmie-briggs', text: 'Ask her to… (She goes pale.) I’d sooner dig the moat.', next: 'first' },
      first: {
        speaker: 'npc:clemmie-briggs', text: 'Only… on my first day, the Captain looked at me and said something. Either “You’ll do well, Briggs”, or “You’ll do the wells, Briggs.” I’ve cleaned the wells every morning for a year. Would you ask her? You’re not frightened of her.',
        choices: [{ text: 'I’ll ask her.', to: null, quest: true }, { text: 'I am a bit frightened of her.', to: 'bit' }],
      },
      bit: { speaker: 'npc:clemmie-briggs', mood: 'happy', text: 'Everybody is. That’s how you know she’s the Captain. Ask her anyway. Please. The wells are very deep.', next: null },
    },
  },
  {
    id: 'dialogue:obj-misheard-moat', name: 'Misheard Orders: the moat',
    entries: [{ when: stage('quest:warden-the-misheard-orders', 'orders'), node: 'moat' }, { node: 'hole' }],
    nodes: {
      moat: { speaker: 'narrator', text: 'Six Wardens up to their waists in a trench behind the stables. “Captain wants a moat,” says the sergeant, proudly. You explain about the boat. The sergeant looks at the trench, and then at the frozen lake, and sits down in the snow.', next: null },
      hole: { speaker: 'narrator', text: 'A half-dug moat behind the stables. Someone has put a small boat in it.', next: null },
    },
  },
  {
    id: 'dialogue:obj-misheard-cake', name: 'Misheard Orders: the cake',
    entries: [{ when: stage('quest:warden-the-misheard-orders', 'orders'), node: 'cake' }, { node: 'crumbs' }],
    nodes: {
      cake: { speaker: 'narrator', text: 'In the mess kitchen, a cake the size of a man, iced to look exactly like the cook, who is asleep in the corner. You wake the cook. The cook sees the cake. There is a short silence, and then the cook asks for a slice of himself.', next: null },
      crumbs: { speaker: 'narrator', text: 'The remains of a cake shaped like the cook. The cook has eaten his own head.', next: null },
    },
  },
  {
    id: 'dialogue:obj-misheard-hedge', name: 'Misheard Orders: the hedge',
    entries: [{ when: stage('quest:warden-the-misheard-orders', 'orders'), node: 'hedge' }, { node: 'shine' }],
    nodes: {
      hedge: { speaker: 'narrator', text: 'Two Wardens are polishing a frozen bramble hedge with goose-grease, thorn by thorn. They have been at it since Tuesday. The horns hanging on the Gatehouse wall, which the Captain asked to be polished, are green with neglect.', next: null },
      shine: { speaker: 'narrator', text: 'The shiniest hedge in Frostmere, and beside it, a row of gleaming horns.', next: null },
    },
  },
  {
    id: 'dialogue:warden-ebbe', name: 'Ebbe Strand (the Ration Ledger)',
    entries: [
      { when: { all: [stage('quest:warden-the-ration-ledger', 'ebbe'), { flag: 'warden.ebbe', value: 'helped' }] }, node: 'helped' },
      { when: { all: [stage('quest:warden-the-ration-ledger', 'ebbe'), { flag: 'warden.ebbe', value: 'reported' }] }, node: 'reported' },
      { when: stage('quest:warden-the-ration-ledger', 'ebbe'), node: 'undecided' },
      { node: 'start' },
    ],
    nodes: {
      start: {
        speaker: 'npc:ebbe-strand', text: 'Sums are fine. Sums are always fine. Don’t look at the ledger. There’s nothing in the ledger. It’s a very boring ledger.',
        choices: [offer('quest:warden-the-ration-ledger', 'Then you won’t mind if I look at it.', 'look'), bye],
      },
      look: { speaker: 'npc:ebbe-strand', mood: 'afraid', text: '(A long pause.) It’s on the shelf. Behind the barrel. The barrel I didn’t want you to look in. You’ll want to look in that too.', next: null },
      undecided: { speaker: 'npc:ebbe-strand', text: 'You’ve read it, then. A sack a night, over the wall. Well? What are you going to do?', next: null },
      helped: {
        speaker: 'npc:ebbe-strand', mood: 'happy', text: 'You cooked it. You actually cooked it. “Spoiled by damp, forty loaves.” Nobody ever questions damp. I owe you, Warden. If it ever comes to a moot, I’ll stand up and say it out loud.',
        choices: [{ text: 'Keep the bread going over.', to: 'rope', trust: 1 }],
      },
      reported: { speaker: 'npc:ebbe-strand', mood: 'sad', text: 'You told the Captain. Course you did. That’s the job. (He takes his keys off his belt, slowly.) She only docked my pay. She didn’t look at me while she did it. I think she was glad somebody had.', next: 'rope' },
      rope: { speaker: 'npc:ebbe-strand', text: 'There’s a rope at the foot of the Rampart, east of the bowyers’ post. A sack goes down it after dark, and somebody on the other side is always waiting. Tonight, somebody will be waiting either way. Go and see who, would you? I never have. I couldn’t look.', next: null },
    },
  },
  {
    id: 'dialogue:obj-ration-ledger', name: 'The Ration Ledger', scope: 'party',
    entries: [{ when: { all: [stage('quest:warden-the-ration-ledger', 'ledger'), { not: { flag: 'warden.ebbe' } }] }, node: 'read' }, { node: 'book' }],
    nodes: {
      read: {
        speaker: 'narrator', text: 'Columns of figures in a careful hand, and every night, one sack of bread that goes nowhere. On the last page, pressed flat, a child’s drawing of a Warden on the wall, throwing a loaf. Underneath: THANK YOU EBBY.',
        choices: [
          { text: '(Help him. Write “spoiled by damp” against every sack.)', to: 'damp', effects: [{ setFlag: 'warden.ebbe', value: 'helped' }] },
          { text: '(Take the ledger to the Captain.)', to: 'captain', effects: [{ setFlag: 'warden.ebbe', value: 'reported' }] },
        ],
      },
      damp: { speaker: 'narrator', text: 'Forty loaves, spoiled by damp. Damp is a terrible thing on the Wardwall. Everybody knows that.', next: null },
      captain: { speaker: 'narrator', text: 'You close the ledger and tuck it under your arm. The child’s drawing slides out, and you put it back in, carefully.', next: null },
      book: { speaker: 'narrator', text: 'The Wardwall’s ration ledger. The sums add up now, one way or another.', next: null },
    },
  },
  {
    id: 'dialogue:warden-kettil', name: 'Kettil Rask (bounties)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:kettil-rask', text: 'Bounties on the board. Read them. I’m not reading them to you. Your shield’s crooked.',
        choices: [
          offer('quest:warden-bounty-wolfrun-pack', 'The Wolfrun pack.', 'pack', { questCompleted: 'quest:warden-the-watch-fires' }),
          offer('quest:warden-bounty-rampart-sentry', 'The Rampart Sentry.', 'sentry', { questCompleted: 'quest:warden-the-watch-fires' }),
          bye,
        ],
      },
      pack: { speaker: 'npc:kettil-rask', text: 'Hollow wolves, six of them, taking sledge-ponies in the passes. Gatehouse pays by the pelt. Bring me pelts. Not ponies.', next: null },
      sentry: { speaker: 'npc:kettil-rask', text: 'An Ice Sentry gone hollow, walking the Rampart, shoving Wardens off it. Four so far. The two that landed in snow are fine. The other two are also fine, but annoyed.', next: null },
    },
  },
  // ---------- the Long Rampart: Ingrith, Tilda
  {
    id: 'dialogue:warden-ingrith', name: 'Ingrith Halfmile (the Last Watch-Fire)',
    entries: [{ when: stage('quest:warden-the-last-watch-fire', 'ingrith'), node: 'dawn' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ingrith-halfmile', text: 'Forty years on this fire. Never once relieved. Not that I’m counting. I’m counting.',
        choices: [offer('quest:warden-the-last-watch-fire', 'I’ll relieve you. Go and sleep in a bed.', 'bed'), { text: 'Forty years? Alone?', to: 'alone' }, bye],
      },
      alone: { speaker: 'npc:ingrith-halfmile', text: 'I’ve the fire for company, and every light in the Jarlsfell. You get to know them. That one’s the Hekla steading. That one goes out early; somebody’s a good sleeper.', next: 'start' },
      bed: { speaker: 'npc:ingrith-halfmile', mood: 'happy', text: 'A bed. (She stares at you.) A bed. Right. Keep it fed. Watch the dark. Count the lights, they like that. I’ll be back at dawn, if I can remember the way down.', next: null },
      dawn: {
        speaker: 'npc:ingrith-halfmile', mood: 'happy', text: 'I slept. In a bed. On my side. I dreamed about nothing at all. (She looks at the fire, then at you.) Did you count them?',
        choices: [
          { text: 'The lamp under the wall went out before dawn. I went over and lit it again.', to: 'lamp', when: { flag: 'warden.lamp_relit' }, trust: 1, trustNpc: 'npc:ingrith-halfmile' },
          { text: 'Every one. They all stayed lit.', to: 'lit' },
          { text: 'I lost count around two hundred.', to: 'lost' },
        ],
      },
      lamp: { speaker: 'npc:ingrith-halfmile', mood: 'sad', text: '(She is quiet a long while.) Forty years that lamp’s been lit the minute mine is. I never knew who. I told myself it was a shepherd. (She sits down on the step.) “So she knows somebody sees her.” Well. I do now.', next: 'lit' },
      lit: { speaker: 'npc:ingrith-halfmile', text: 'Good. Good. That’s the job, you know. Not the dark. The lights. Nobody tells you that.', next: null },
      lost: { speaker: 'npc:ingrith-halfmile', text: 'Two hundred and eleven. I’ve had forty years. Thank you, Warden. Truly.', next: null },
    },
  },
  {
    id: 'dialogue:obj-ingrith-fire', name: 'The last watch-fire',
    entries: [
      { when: { all: [stage('quest:warden-the-last-watch-fire', 'watch'), NIGHT] }, node: 'night' },
      { when: stage('quest:warden-the-last-watch-fire', 'watch'), node: 'day' },
      { node: 'fire' },
    ],
    nodes: {
      fire: { speaker: 'narrator', text: 'Ingrith’s watch-fire, the furthest on the Long Rampart, and the best kept.', next: null },
      day: { speaker: 'narrator', text: 'The fire burns low and pale in the daylight. The watch is a night watch. Come back after dark.', next: null },
      night: {
        speaker: 'narrator', text: 'You keep the fire through the long dark, and from up here you can see the whole Jarlsfell, and every light in it: steadings, cooking-fires, a lantern swinging across a yard. Hundreds of them. On the wall side, behind you, there are rather fewer.',
        effects: [{ setFlag: 'warden.watch_kept', value: true }], next: 'out',
      },
      out: { speaker: 'narrator', text: 'Just before dawn one light goes out: a single lamp, low down, close under the far side of the wall, the first one Ingrith pointed to. Every other light is still burning. That one should not have gone out first.', next: null },
    },
  },
  {
    id: 'dialogue:warden-tilda', name: 'Tilda Quarrel (Letters Over the Wall)',
    entries: [{ when: stage('quest:warden-letters-over-the-wall', 'tilda'), node: 'letters' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:tilda-quarrel', text: 'We don’t shoot letters over the wall. Officially. Unofficially, half the Rampart has a cousin in the Jarlsfell, and the replies come back tied to stones, and they always land short.',
        choices: [offer('quest:warden-letters-over-the-wall', 'I’ll fetch them in.', 'fetch'), bye],
      },
      fetch: { speaker: 'npc:tilda-quarrel', text: 'In the drifts below the Rampart. Four stones, I reckon, since the last thaw. Don’t read them. Read them a bit. Don’t tell anyone you read them.', next: null },
      letters: {
        speaker: 'npc:tilda-quarrel', mood: 'happy', text: 'That’s my cousin’s hand. And that’s Brisk’s mother. And that one… that’s for the Captain, and it’s not signed, and I am not going to be the one who gives it to her.',
        choices: [
          { text: 'One of them mentions a man with a flag that has an empty crown on it.', to: 'crown', insight: 'empty_crown_letters' },
          { text: 'There are a lot more of these than anyone admits.', to: 'more' },
        ],
      },
      crown: { speaker: 'npc:tilda-quarrel', text: '“A big man with a sad face and a flag with an empty crown on it, saying there’s a table for everyone.” Huh. I don’t like that. Nobody gives away a table for nothing.', next: 'unsigned' },
      more: { speaker: 'npc:tilda-quarrel', text: 'There are. Half the Wall writes to the other half of the Wall. The stones in between are just the bit nobody talks about.', next: 'unsigned' },
      unsigned: { speaker: 'npc:tilda-quarrel', text: '(She holds out the unsigned one, at arm’s length, as if it might go off.) You take this. You’re her favourite. Don’t tell me you’re not, everybody knows, she shouts at you less.', next: null },
    },
  },
  {
    id: 'dialogue:obj-frozen-reply-1', name: 'Letters Over the Wall: a reply',
    entries: [{ node: 'stone' }],
    nodes: { stone: { speaker: 'narrator', text: 'A stone with a letter tied round it, frozen into the drift. “Dear Tilly. We are all well except the goat. Thank you for the socks. Tell the tall one at the fourth fire that my sister says yes.”', next: null } },
  },
  // ---------- the Wolfrun: the White Alpha, Signy
  {
    id: 'dialogue:warden-white-alpha', name: 'The White Alpha (the White Pack)',
    entries: [{ when: stage('quest:warden-the-white-pack', 'alpha'), node: 'after' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:white-pack-alpha', text: '(A Snow Wolf, white to the eyes, at the mouth of a den. She growls, but past you, not at you. Out on the snow, wolves with black in their eyes are circling. Behind her, something small yips.)',
        choices: [offer('quest:warden-the-white-pack', '(Set your shield beside her.)', 'shield'), bye],
      },
      shield: { speaker: 'narrator', text: 'She looks at the shield, and at you, and moves half a step over, the way a Warden makes room on a line.', next: null },
      after: {
        speaker: 'npc:white-pack-alpha', text: '(The hollow wolves are gone. The alpha looks at you a long moment. Then she turns and goes into the den, and a moment later three pups tumble out of it and fall over your boots.)',
        choices: [{ text: '(Stay very still.)', to: 'pups' }, { text: '(Back away slowly.)', to: null }],
      },
      pups: { speaker: 'narrator', text: 'One of them chews your bootlace. The alpha watches from the den mouth and does not mind. These are not hunting wolves. You will remember the difference. (The smallest one, you will discover later, does not stop at the bootlace.)', next: null },
    },
  },
  {
    id: 'dialogue:warden-signy', name: 'Signy Frosk (Out of the Hour)',
    entries: [{ when: stage('quest:warden-out-of-the-hour', 'home'), node: 'home' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:signy-frosk', text: 'Warden! Thank the Spire. We walked out of Glacierhome three days ago, and the passes snowed us in, and my daughter won’t stop telling me what to do. She’s sixty. I’m forty-one. Don’t make a fuss about it.',
        choices: [offer('quest:warden-out-of-the-hour', 'I’ll get you to the Gatehouse.', 'go'), { text: 'You’re younger than your daughter?', to: 'young' }, bye],
      },
      young: { speaker: 'npc:signy-frosk', text: 'I stayed in the hold twenty years after she left. Nobody ages in the hold. When I walked out, I was the same age as the day the clocks stopped, and she was grey. She cried for an hour. Then she sent me to bed.', next: 'start' },
      go: { speaker: 'npc:signy-frosk', text: 'There are wolves on the road. Clear them, and we’ll follow your shield. Slowly. My daughter has a knee.', next: null },
      home: {
        speaker: 'npc:signy-frosk', mood: 'happy', text: 'Walls! A fire! Somebody’s porridge! (Behind her, an old woman with a stick is already telling the Gatehouse cook how to do it.) Thank you, Warden. Thirty years in a minute, and three days in the snow, and the three days were longer.',
        choices: [{ text: 'Welcome to the Wardwall.', to: 'orm', trust: 1 }],
      },
      orm: {
        speaker: 'npc:signy-frosk', mood: 'sad', text: 'One more thing, and then I’ll stop asking. My Leif walked out of the hour the year our girl did, and took the shield. He died nine winters ago, at seventy. I’m forty-one. He’s in the cairn-field below the Wolfrun. Would you tell him I came? I can’t face the walk back up.',
        choices: [{ text: 'I’ll tell him.', to: null, quest: true }],
      },
    },
  },
  // ---------- the Jarlsfell: Hekla, Old Gubbins
  {
    id: 'dialogue:warden-hekla', name: 'Grandam Hekla (general, the Steading Oven)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: HK, text: 'Wardens. Hmph. Come in, then, you’re letting the weather out. Mind the children. Mind the goat. Mind me, mostly.',
        choices: [
          offer('quest:warden-the-steading-oven', 'Your oven’s cracked.', 'oven'),
          { text: 'You remind me of someone.', to: 'someone', when: { questCompleted: 'quest:warden-the-steading-oven' } },
          bye,
        ],
      },
      oven: { speaker: HK, mood: 'sad', text: 'Cracked in the cold a month since. The children haven’t had a hot meal in all that time. There’re firestones in the old cairns up the fell, the kind that hold heat all night. Bring me three and I’ll show you how a Jarlsfell oven’s mended.', next: null },
      someone: { speaker: HK, text: 'I remind everybody of someone. I’ve the kind of face that gets around. (She looks at the Wardwall on the skyline for a long moment.) Go on with you.', next: null },
    },
  },
  {
    id: 'dialogue:warden-hekla-oven', name: 'The Steading Oven: mended', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: HK, mood: 'happy', text: 'Firestones, all three! In with them, mud the crack, and now we wait. (The oven ticks, and warms, and the children crowd in close as cats.) There. Hot porridge by dark. You’ve fed forty children, Warden. Don’t let it go to your head.',
        choices: [
          { text: 'The wall should have done this.', to: 'wall' },
          { text: 'Why does the clan hate the wall so much?', to: 'hate' },
        ],
      },
      hate: { speaker: HK, text: 'We don’t hate the wall. We hate the door in it that never opens. Different thing.', next: 'wall' },
      wall: {
        speaker: HK, text: 'My grandmother used to say the wall had a charter once. That its gates were for anyone who came in from the cold. Then the Wardens forgot, or decided to. You tell your Captain that, Warden. Tell her loud. She’s deaf, I hear.',
        choices: [
          { text: 'For anyone who comes in from the cold.', to: 'cold', insight: 'wall_charter', trust: 1, trustNpc: HK },
          { text: 'I’ll tell her.', to: 'loaf' },
        ],
      },
      cold: { speaker: HK, text: 'That’s it. Say it like that. Now eat something. You look like a Warden, and Wardens always look like they haven’t eaten.', next: 'loaf' },
      loaf: {
        speaker: HK, text: '(She wraps the first loaf out of the oven in a cloth, still steaming.) Not for you. Somebody on that wall has been sending a sack of bread down a rope every night for a year. The clans pay their debts. Give this to your quartermaster, and tell him it’s a loan, repaid.',
        choices: [{ text: 'I’ll carry it.', to: null, quest: true }],
      },
    },
  },
  {
    id: 'dialogue:obj-oven-firestone-1', name: 'The Steading Oven: a firestone',
    entries: [{ node: 'stone' }],
    nodes: { stone: { speaker: 'narrator', text: 'A red-veined stone at the foot of an old clan cairn, warm to the touch in the snow, the way a hearthstone is warm the morning after.', next: null } },
  },
  {
    id: 'dialogue:warden-gubbins', name: 'Old Gubbins',
    entries: [{ when: stage('quest:warden-the-goat-that-crosses-walls', 'gubbins'), node: 'top' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:old-gubbins', text: '(A clan goat with one horn and a duty roster in his mouth. He looks at you with the flat contempt of a goat who has crossed more walls than you have.)',
        choices: [offer('quest:warden-the-goat-that-crosses-walls', '(Follow him when he goes.)', 'follow'), { text: '(Take back the duty roster.)', to: 'roster' }, bye],
      },
      roster: { speaker: 'npc:old-gubbins', text: '(He swallows it. Then he looks at you as if you had been very rude.)', next: 'start' },
      follow: { speaker: 'narrator', text: 'Old Gubbins finishes the roster, belches, and sets off along the foot of the wall without a backward glance. He is not going towards the postern.', next: null },
      top: {
        speaker: 'npc:old-gubbins', text: '(Old Gubbins is standing at the top of the Wardwall on a foothold no wider than your hand, eating a Warden’s scarf. Below him, a stair of footholds runs down the far side, close by the Breach.)',
        choices: [{ text: 'You’ve been doing this for years.', to: 'years' }, { text: '(Make a note of the stair.)', to: 'note' }],
      },
      years: { speaker: 'npc:old-gubbins', text: '(He looks at you as if to say: obviously. Then he goes down the other side, and is home in time for supper.)', next: 'note' },
      note: { speaker: 'narrator', text: 'A stair cut into the wall a hundred years ago and forgotten by everyone except a goat. If you ever need to reach the Breach without going through the front of it, this is the way.', next: null },
    },
  },

  // ======================= ACT II
  {
    id: 'dialogue:warden-ingeborg', name: 'C-1 Wardenhold: Wardenmother Ingeborg', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ingeborg-tull', text: 'A Warden! A Wardwall Warden, with a fin crest! (The whole drill yard stops.) Thirty years we’ve drilled at this gate, dawn and dusk, facing north. Nothing’s ever come down the pass. Nothing’s been able to.',
        choices: [
          { text: 'I need to find Rime’s Sentinel.', to: 'colossus', quest: true },
          { text: 'Ebbe Strand came through with me. He’s already in your stores.', to: 'ebbe', when: { flag: 'warden.ebbe', value: 'helped' } },
          { text: 'The clans came through with me. They’re hungry.', to: 'clans', when: { not: { flag: 'warden.postern', value: 'hold' } } },
        ],
      },
      ebbe: { speaker: 'npc:ingeborg-tull', mood: 'happy', text: 'The little quartermaster? He found three months of food in a ledger that said we had none. I’ve made him quartermaster. He cried. I think that was gratitude.', next: 'colossus' },
      clans: { speaker: 'npc:ingeborg-tull', text: 'Then they’re fed. That’s the first rule of a gate, whatever your Captain told you. Grandam Hekla’s people have already taken over my kitchen. I’ve let them. I didn’t have much choice.', next: 'colossus' },
      colossus: {
        speaker: 'npc:ingeborg-tull', text: 'The Rimeheart Colossus stands at the top of the pass. It held the road open for the crown, every Turning. Now it holds it shut. No patrol has gone up in thirty years. I’d like the first one to have a real Warden at the front of it.',
        choices: [{ text: 'Give me a patrol.', to: null }, { text: 'Why haven’t you gone up?', to: 'why' }],
      },
      why: { speaker: 'npc:ingeborg-tull', mood: 'sad', text: 'Because we’re Wardens, and it was holding the line. You don’t charge a thing for doing your job. Even when you should.', next: null },
    },
  },
  {
    id: 'dialogue:warden-ebbe-wardenhold', name: 'Ebbe at Wardenhold',
    entries: [{ node: 'hi' }],
    nodes: { hi: { speaker: 'npc:ebbe-strand-wardenhold', mood: 'happy', text: 'The sums add up here. It’s unsettling. I keep checking the barrels for clan children and there aren’t any, because the clan children are all in the kitchen, eating, on the books.', next: null } },
  },
  {
    id: 'dialogue:obj-warden-pass-cairn-1', name: 'C-2 the first patrol cairn', scope: 'party',
    entries: [
      { when: { all: [WD, stage('quest:warden-the-shut-pass', 'cairns'), { flag: 'warden.postern', value: 'hold' }] }, node: 'wardens' },
      { when: { all: [WD, stage('quest:warden-the-shut-pass', 'cairns')] }, node: 'clans' },
      { node: 'cairn' },
    ],
    nodes: {
      wardens: { speaker: 'narrator', text: 'You relight the beacon on the first cairn. Behind you, a dozen Wardenhold Wardens in a tight line raise their shields at the flame, the old salute, and for the first time in thirty years a patrol goes up Frostmere Pass.', next: null },
      clans: { speaker: 'narrator', text: 'You relight the beacon on the first cairn. Behind you, Grandam Hekla’s clan-folk and a handful of Wardenhold Wardens cheer together, badly, in two accents. A clan girl who knows the snow better than any of you goes ahead to find the next cairn.', next: null },
      cairn: { speaker: 'narrator', text: 'An old patrol cairn on the pass road, its beacon lit.', next: null },
    },
  },
  {
    id: 'dialogue:warden-thyri', name: 'C-4 the clanswoman who turned back', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:thyri-coldbrook', text: 'You’re a Warden. I know the crest. (She doesn’t get up from the fire.) I followed him through the White Gate. Everyone did. He said there was a table on the other side, with a place laid for everyone who was ever kept out.',
        choices: [{ text: 'Was there a table?', to: 'table' }, { text: 'Where is he now?', to: 'where' }],
      },
      table: { speaker: 'npc:thyri-coldbrook', mood: 'sad', text: 'There was walking. Every night, walking, deeper into this wood. And more people every night: wolves’ leavings, marsh-folk, hollowed things that used to be people. He never turns any of them away. That’s the worst of it. He’s kind to all of them.', next: 'where' },
      where: { speaker: 'npc:thyri-coldbrook', text: 'He follows the white deer that weeps. Down the old road, he says, the procession road, into the Heart. His last camp was on the road by the deep glade. I turned round there. I’m the only one who did.', next: 'take' },
      take: { speaker: 'npc:thyri-coldbrook', mood: 'afraid', text: '(She stands up anyway.) I’ll take you. I don’t want to go back down that road. But somebody has to know which way he went, and I’m the only one who does.', next: null },
    },
  },
  {
    id: 'dialogue:warden-thyri-general', name: 'Thyri Coldbrook (general)',
    entries: [{ node: 'hi' }],
    nodes: { hi: { speaker: 'npc:thyri-coldbrook', text: 'I keep thinking I can hear them walking. It’s only the wind. It’s always only the wind, until it isn’t.', next: null } },
  },
  {
    id: 'dialogue:obj-warden-torvald-gloam-table', name: 'C-4 Torvald’s empty table', scope: 'party',
    entries: [{ when: { all: [WD, stage('quest:warden-the-kept-out', 'camp')] }, node: 'table' }, { node: 'cold' }],
    nodes: {
      table: { speaker: 'narrator', text: 'On the old procession road through the Gloamwood: a trestle table, impossibly long, running away between the trees. Hundreds of places are laid at it, with bowls and spoons. Every bowl is empty and full of black rain.', next: 'banner' },
      banner: { speaker: 'narrator', text: 'At the head of the table, propped on a chair nobody sits in, the empty-crown banner. Hoofprints lead away from it down the road towards the deep glade, and after them, thousands of footprints, all walking the same way.', next: null },
      cold: { speaker: 'narrator', text: 'A long trestle table on the procession road, its places laid for nobody.', next: null },
    },
  },
  // ---------- C-6 A Horn from the North
  {
    id: 'dialogue:obj-rime-arch-horn', name: 'C-6 the horn through the Rime arch', scope: 'party',
    entries: [
      { when: { all: [WD, stage('quest:warden-a-horn-from-the-north', 'horn'), NIGHT] }, node: 'night' },
      { when: { all: [WD, stage('quest:warden-a-horn-from-the-north', 'horn')] }, node: 'day' },
      { node: 'arch' },
    ],
    nodes: {
      arch: { speaker: 'narrator', text: 'A cleft in the frost at the foot of the Rime arch, where the wind from Frostmere comes through.', next: null },
      day: { speaker: 'narrator', text: 'Wind through the Rime arch, and the noise of Brindlecross going about its day. Whatever you heard last night, you won’t hear it now.', next: null },
      night: {
        speaker: 'narrator', text: 'Faint, very faint, through the Rime arch and all the miles of Frostmere behind it: a horn. One long note, two short. The oldest call on the Wardwall. Come home when you’re done.',
        next: 'dagny',
      },
      dagny: {
        speaker: 'narrator', text: 'Somebody is blowing the Long Horn on the Wardwall, at the top of their lungs, from a hundred miles away, and they cannot possibly hear it themselves. You know exactly who.',
        choices: [{ text: '(Answer on your own horn, if you have one, or with your shield.)', to: null, quest: true, effects: [{ setFlag: 'warden.horn_heard', value: true }] }],
      },
    },
  },
  {
    id: 'dialogue:warden-shield-chord', name: 'C-6 the two Rime halves', scope: 'party',
    entries: [{ node: 'chord' }],
    nodes: {
      chord: { speaker: 'narrator', text: 'In the Stone Court the Wall half and the Spire half sing together, and it is a sound like a door that has been shut for thirty years being opened, slowly, from the inside.', next: 'go' },
      go: { speaker: 'narrator', text: 'You stand with your shield grounded and let the chord go past you, like travellers through a gate. You do not hold it. You only make sure it gets through.', next: null },
    },
  },
  // ---------- featured bearers (hooks on the bearer NPCs)
  {
    id: 'dialogue:warden-featured-juggernaut', name: 'Featured: Under the Pass', scope: 'party',
    entries: [
      { when: stage('quest:warden-under-the-pass', 'back'), node: 'back' },
      { when: { all: [stage('quest:warden-under-the-pass', 'tunnel'), { not: { flag: 'warden.hamm_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-juggernaut', text: 'Climb it? Climb a mountain? No. Where I come from, if there’s a mountain in the way, you go through it. I’ve made a start. (They have made a hole about the size of a dog.) Want to hold the lamp?',
        choices: [
          { text: 'The Wardens of old cut tunnels here. Let’s find one.', to: null, quest: true, effects: [{ setFlag: 'warden.hamm_asked', value: true }] },
          { text: 'Or we could take the road like everyone else.', to: null, quest: true, effects: [{ setFlag: 'warden.hamm_asked', value: true }] },
        ],
      },
      back: {
        speaker: 'npc:bearer-juggernaut', mood: 'happy', text: 'A tunnel! A proper one, with proper props! Your lot dug that by hand, a thousand years back, and it’s still standing. I’ve never been so impressed by anybody I wasn’t related to. When we go to the Heart, I’m in front of you. You can hold the lamp.',
        effects: [{ setFlag: 'warden.hamm_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-warden-old-tunnel', name: 'Under the Pass: the old tunnel', scope: 'party',
    entries: [{ when: { all: [WD, stage('quest:warden-under-the-pass', 'tunnel')] }, node: 'find' }, { node: 'mouth' }],
    nodes: {
      find: { speaker: 'narrator', text: 'Behind a fall of snow, a doorway in the rock, framed in grey stone and carved with a tower shield and a fin crest: a Warden tunnel, a thousand years old, its props still sound. The Juggernaut bearer puts a hand on the stone and goes quiet.', next: null },
      mouth: { speaker: 'narrator', text: 'The mouth of an old Warden tunnel under Frostmere Pass.', next: null },
    },
  },
  {
    id: 'dialogue:warden-featured-falconer', name: 'Featured: The Hooded Glade', scope: 'party',
    entries: [
      { when: stage('quest:warden-the-hooded-glade', 'back'), node: 'back' },
      { when: { all: [stage('quest:warden-the-hooded-glade', 'perch'), { not: { flag: 'warden.perrin_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-falconer', text: 'She won’t fly. Not within a mile of that glade. She sits on my glove and shivers. Something in there is grieving so hard the air’s gone heavy with it, and a hawk can’t climb heavy air.',
        choices: [
          { text: 'Then she needs somewhere to stand that the grief can’t reach. A wall.', to: null, quest: true, effects: [{ setFlag: 'warden.perrin_asked', value: true }] },
          { text: 'Show me the glade.', to: null, quest: true, effects: [{ setFlag: 'warden.perrin_asked', value: true }] },
        ],
      },
      back: {
        speaker: 'npc:bearer-falconer', mood: 'happy', text: 'She flew. Off your shield, straight up, as if nothing was wrong at all. I didn’t know a wall could do that. I thought walls only kept things out. Whatever’s at the Heart, I’ll be over your shoulder, and so will she.',
        effects: [{ setFlag: 'warden.perrin_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-warden-hooded-glade-perch', name: 'The Hooded Glade: the perch', scope: 'party',
    entries: [{ when: { all: [WD, stage('quest:warden-the-hooded-glade', 'perch')] }, node: 'shield' }, { node: 'post' }],
    nodes: {
      shield: {
        speaker: 'narrator', text: 'You plant your tower shield at the edge of the glade, rim up, and brace it, the way you would against a blizzard. In its lee the air is lighter. The Falconer bearer’s hawk hops from glove to shield-rim, and sits, and looks around.',
        choices: [{ text: '(Hold the shield steady.)', to: 'fly', school: 'rime' }, { text: '(Wait.)', to: 'fly' }],
      },
      fly: { speaker: 'narrator', text: 'Then she goes up, straight up off the rim of your shield, into the heavy air over the glade, and does not come down until she is called.', next: null },
      post: { speaker: 'narrator', text: 'A scuffed patch of moss at the glade’s edge, where a shield once stood.', next: null },
    },
  },
  // ---------- class hooks on the Brindlecross people
  {
    id: 'dialogue:hook-warden-rook', name: 'Hook: Rook and the Warden',
    entries: [{ when: { all: [{ not: { flag: 'warden.rook_met' } }, { flag: 'story.act', op: '>=', value: 2 }] }, node: 'crest' }],
    nodes: {
      crest: {
        speaker: 'npc:rook', text: 'That’s a Wardwall fin crest. My grandfather said the Wardens held a wall a hundred miles long with four hundred shields. I hold a village with eleven farmers and a halberd. Any advice?',
        effects: [{ setFlag: 'warden.rook_met', value: true }],
        choices: [
          { text: 'Speak up. Feet forward. And find out who your wall is for.', to: 'for' },
          { text: 'Get more farmers.', to: 'more' },
        ],
      },
      for: { speaker: 'npc:rook', text: 'Who it’s for. (She looks out over Brindlecross for a moment.) That’s easy. It’s for them. Everyone in it. Huh. That’s better advice than I expected.', next: null },
      more: { speaker: 'npc:rook', mood: 'happy', text: 'Ha! I’ll put it on the board. “Wanted: farmers. Must bring own halberd.”', next: null },
    },
  },
  // ======================= ACT III
  {
    id: 'dialogue:warden-herald-fate', name: 'III-4 the Herald of the Wall: Torvald’s fate', scope: 'party',
    entries: [{ when: { flag: 'warden.postern', value: 'hold' }, node: 'held' }, { node: 'kneel' }],
    nodes: {
      kneel: { speaker: 'npc:torvald-wallbreaker', mood: 'hollow', text: 'Pup. (He is on his knees, the ice bell in his lap.) There’s a table in there, pup, for everyone who was ever left in the snow. He promised. All you had to do was not be a wall.', next: 'choose' },
      held: { speaker: 'npc:torvald-wallbreaker', mood: 'hollow', text: 'Pup. You kept the postern shut. I watched them turn away from it in the snow, with the children. You kept them out too. So tell me which of us is the Herald.', next: 'choose' },
      choose: {
        speaker: 'npc:torvald-wallbreaker', mood: 'sad', text: '(He holds out his shield hand, open. The tears run down it and will not freeze.) Go on, then. Set your feet. You always forgot your feet.',
        choices: [
          {
            text: '(Set your feet, and read him the charter.) “For anyone who comes in from the cold.”', to: 'charter', quest: true,
            when: { any: [{ flag: 'warden.postern', value: 'charter' }, { trust: DO, value: 'trusted' }] },
            lockedLabel: 'You need the Wall’s founding charter, or Dagny’s whole trust',
            effects: [{ setFlag: 'warden.nemesis_fate', value: 'spared' }],
          },
          { text: 'No more walls, you said. Then no more Wallbreaker. (Finish it.)', to: 'end', quest: true, effects: [{ setFlag: 'warden.nemesis_fate', value: 'destroyed' }] },
        ],
      },
      charter: { speaker: 'narrator', text: 'You set your feet the way he taught you, and say it loud, the way Dagny asked to hear it: the Wardwall was built to keep out the winter, with gates for anyone who comes in from the cold.', next: 'charter2' },
      charter2: { speaker: 'narrator', text: 'Torvald bows his head. The snow slides off his robe. His tears run down his face onto the stone of the Twelve Stairs, and there, for the first time, they thaw.', next: 'charter3' },
      charter3: { speaker: 'npc:torvald-wallbreaker', mood: 'sad', text: 'A gate. Not a table. Just a gate, and somebody on it who’ll open it. (He laughs, wet.) That’s all it ever was, pup. I had a hammer, and I forgot.', next: null },
      end: { speaker: 'narrator', text: 'He doesn’t lift the shield. One blow, and the Herald of the Wall goes down on the Twelve Stairs, and the ice bell rolls away down the Rime stair, ringing, until you can’t hear it any more.', next: null },
    },
  },
  {
    id: 'dialogue:warden-dagny-heart', name: 'Dagny’s Last Watch: the Captain at the Heart', scope: 'party',
    entries: [{ when: stage('quest:warden-dagnys-last-watch', 'orders'), node: 'start' }, { node: 'later' }],
    nodes: {
      start: { speaker: DO, text: 'There you are. Don’t salute, I can’t hear it. (Wall-Captain Dagny Orr, at the Heart camp, in her mail with the Long Horn on her back.) You read that charter loud enough for me to hear. Thought I’d better come and see where it went.', next: 'orders' },
      orders: {
        speaker: DO, text: 'Orders. One watch, on the last wall there is. That one. (She jerks her thumb at the Weeping Wall.) Stand it till it parts, then blow. Long, two short. Anyone in there who was ever a Warden will know what it means.',
        choices: [
          { text: 'Come home when you’re done.', to: 'yes', quest: true, effects: [{ setFlag: 'warden.last_watch_ordered', value: true }] },
          { text: 'Yes, Captain.', to: 'yes', quest: true, effects: [{ setFlag: 'warden.last_watch_ordered', value: true }] },
        ],
      },
      yes: { speaker: DO, mood: 'happy', text: 'Good. Take the Long Horn; nothing else is loud enough. (She hands it over.) Feet. I’ll be by the fire, not hearing anything. Wake me if the world ends.', next: null },
      later: { speaker: DO, text: 'I’m by the fire. Not hearing anything. Go on.', next: null },
    },
  },
  {
    id: 'dialogue:warden-clemmie-heart', name: 'Dagny’s Last Watch: the Captain’s runner', scope: 'party',
    entries: [{ when: stage('quest:warden-dagnys-last-watch', 'orders'), node: 'start' }, { node: 'later' }],
    nodes: {
      start: { speaker: 'npc:clemmie-briggs-heart', text: 'Runner Briggs, from the Captain! I ran. Well, I came through the White Gate behind a cart, and then I ran. (She salutes, then salutes again in case the first one didn’t count.) I’ve said her orders over every mile so I wouldn’t get them wrong.', next: 'orders' },
      orders: {
        speaker: 'npc:clemmie-briggs-heart', text: '“One watch, on the last wall there is. Stand it till it parts, then blow. Long, two short.” (She looks up at the Weeping Wall.) She said boat, first. I asked her to say it again. I’ve never asked her to say it again before.',
        choices: [
          { text: 'You did right, Briggs.', to: 'right', quest: true, effects: [{ setFlag: 'warden.last_watch_ordered', value: true }] },
          { text: 'Long, two short. Come home when you’re done.', to: 'right', quest: true, effects: [{ setFlag: 'warden.last_watch_ordered', value: true }] },
        ],
      },
      right: { speaker: 'npc:clemmie-briggs-heart', mood: 'happy', text: '(She hands you a horn: Dagny’s oldest, the cracked one she learned on.) She said to tell you, and I quote, “Tell the pup I heard that horn.” She can’t have. She can’t hear anything.', next: null },
      later: { speaker: 'npc:clemmie-briggs-heart', text: 'I’m to wait and run the answer back. The Captain said not to hurry. I’m going to hurry.', next: null },
    },
  },
  {
    id: 'dialogue:obj-warden-weeping-watch', name: 'Dagny’s Last Watch: the watch at the Weeping Wall', scope: 'party',
    entries: [
      { when: { all: [WD, stage('quest:warden-dagnys-last-watch', 'watch'), NIGHT, { flag: 'warden.dagny_devotable' }] }, node: 'devoted' },
      { when: { all: [WD, stage('quest:warden-dagnys-last-watch', 'watch'), NIGHT] }, node: 'night' },
      { when: { all: [WD, stage('quest:warden-dagnys-last-watch', 'watch')] }, node: 'day' },
      { node: 'wall' },
    ],
    nodes: {
      wall: { speaker: 'narrator', text: 'The edge of the Heart camp, facing the Weeping Wall. Somebody stood a watch here all night, and didn’t sit down.', next: null },
      day: { speaker: 'narrator', text: 'The Weeping Wall, in what passes for daylight at the Heart. A watch is stood at night. Come back when the camp is asleep.', next: null },
      night: { speaker: 'narrator', text: 'You stand the watch at the edge of the camp with your shield on your arm, facing the Weeping Wall. It hangs there all night like black rain that has forgotten how to fall. Nothing comes out. You don’t sit down.', next: 'parts' },
      parts: { speaker: 'narrator', text: 'Near dawn it parts, a slow tear down the middle, the way it parts for every bearer. You put the horn to your lips. Long, two short. Come home when you’re done.', effects: [{ setFlag: 'warden.last_watch_kept', value: true }], next: 'answer' },
      answer: { speaker: 'narrator', text: 'Far inside, in the Legion’s ranks, somebody who was once a Warden lifts their head.', next: null },
      devoted: { speaker: 'narrator', text: 'You stand the watch at the edge of the camp with your shield on your arm, facing the Weeping Wall. It hangs there all night like black rain that has forgotten how to fall. Nothing comes out. You don’t sit down.', next: 'parts-d' },
      'parts-d': { speaker: 'narrator', text: 'Near dawn it parts, a slow tear down the middle, the way it parts for every bearer. You put the horn to your lips. Long, two short. Come home when you’re done.', effects: [{ setFlag: 'warden.last_watch_kept', value: true }, { trust: DO, set: 5 }], next: 'answer-d' },
      'answer-d': { speaker: 'narrator', mood: 'happy', text: 'Far inside, in the Legion’s ranks, somebody who was once a Warden lifts their head. And somewhere behind you Dagny Orr, who cannot hear a thing, sits bolt upright out of a sound sleep and says to nobody, very loudly, “I heard that.”', next: null },
    },
  },
  {
    id: 'dialogue:obj-warden-clan-ranks', name: 'The Clans in the Camp', scope: 'party',
    entries: [{ when: { all: [WD, stage('quest:warden-the-clans-in-the-camp', 'table')] }, node: 'ranks' }, { node: 'gone' }],
    nodes: {
      ranks: { speaker: 'narrator', text: 'The Outland clans stand in their own rank in the Legion, grandmothers and children at the front, the way they stood in the snow at the postern. Each of them holds an empty bowl. They are waiting to be called in to a table that isn’t there.', next: 'call' },
      call: {
        speaker: 'narrator', text: 'You can’t give them a table. You have a shield, and a gate’s worth of Warden in you.',
        choices: [
          { text: '(Plant your shield like a gatepost, and stand aside.) Come in from the cold.', to: 'in', quest: true },
          { text: '(Take the nearest bowl, and fill it from your own pack.)', to: 'bowl', quest: true },
        ],
      },
      in: { speaker: 'narrator', text: 'One by one they step past your shield, the way people step through a gate: a little warily, then all at once. On the far side they blink, and look at each other, and someone starts crying ordinary tears and can’t stop.', next: 'after' },
      bowl: { speaker: 'narrator', text: 'It is only hard bread and a bit of cheese. The grandmother holding the bowl looks at it for a long time. Then she passes it to the child beside her and steps out of the line, and the rest follow her.', next: 'after' },
      after: {
        speaker: 'narrator', text: 'Out of the Legion, they stand about in the dust, not sure what to do with their hands.',
        choices: [
          { text: '(Watch them go.)', to: 'hekla', when: { flag: 'warden.hekla_met' } },
          { text: '(Watch them go.)', to: 'home', when: { not: { flag: 'warden.hekla_met' } } },
        ],
      },
      hekla: { speaker: HK, text: '(From the edge of the camp, louder than the wind.) There you are, you daft lot! I came all this way to shout at you. Home. It’s further than the Wardwall, and there’s soup at the end of it.', next: 'hekla2' },
      hekla2: { speaker: 'narrator', mood: 'happy', text: 'Grandam Hekla stumps off towards the Heart camp without looking back, and the clans go after her, arguing. You have never heard a better sound in the Heart.', next: null },
      home: { speaker: 'narrator', text: 'Somebody will have to walk them home. It is a long way, and the passes are cold, and that is what Wardens are for.', next: null },
      gone: { speaker: 'narrator', text: 'Where the clans stood, a stack of empty bowls, piled neatly, the way a grandmother would leave them.', next: null },
    },
  },
  {
    id: 'dialogue:warden-gubbins-heart', name: 'The Goat Who Crosses Walls: Old Gubbins at the Heart', scope: 'party',
    entries: [{ when: stage('quest:warden-the-goat-who-crosses-walls', 'goat'), node: 'start' }, { node: 'later' }],
    nodes: {
      start: { speaker: 'npc:old-gubbins-heart', text: '(Old Gubbins is standing on a supply crate at the Heart camp, eating Sela Moth’s second-best map. He looks at you with the flat contempt of a goat who has crossed more walls than you have, and now one more.)', next: 'how' },
      how: {
        speaker: 'narrator', text: 'Nobody saw him come through the Weeping Wall. Nobody saw him come through the White Gate either, or the Gate Circle, or the Wardwall twice a day for years.',
        choices: [
          { text: 'Show me how you got in, Gubbins.', to: 'show', quest: true },
          { text: '(Offer him a ration biscuit.)', to: 'biscuit', quest: true },
        ],
      },
      show: { speaker: 'narrator', text: 'He finishes the map, unhurried. Then he jumps down and trots off into the Heart, not at the Legion but round it, along a gully you hadn’t seen, the way he used to go up the Wardwall: as if it were obvious.', next: null },
      biscuit: { speaker: 'narrator', text: 'He eats the biscuit, the wrapper and a little of your sleeve. Then he trots off round the Legion, along a gully you hadn’t seen, without once looking back to see if you are following. You are.', next: null },
      later: { speaker: 'npc:old-gubbins-heart', text: '(Old Gubbins is chewing something. You decide not to ask what.)', next: null },
    },
  },
  {
    id: 'dialogue:obj-warden-gubbins-banner', name: 'The Goat Who Crosses Walls: the banner', scope: 'party',
    entries: [{ when: { all: [WD, stage('quest:warden-the-goat-who-crosses-walls', 'path')] }, node: 'banner' }, { node: 'pole' }],
    nodes: {
      banner: { speaker: 'narrator', text: 'The gully comes out behind the Legion’s lines, right beside a hollow captain’s standard: the empty-crown banner, black and gold, the same as the one on Torvald’s parley-flag.', next: 'eat' },
      eat: { speaker: 'narrator', text: 'Old Gubbins looks at it. Then he takes the corner in his teeth and pulls, steadily, with enormous dignity, until the whole thing comes down. He begins to eat it.', next: 'legion' },
      legion: { speaker: 'narrator', mood: 'happy', text: 'The hollow captain turns to look at its banner, and at the goat, and stands there puzzled: the first expression you have seen on any of them that isn’t weeping. Nobody in the Legion has ever had a goat eat their banner. It seems to help.', next: null },
      pole: { speaker: 'narrator', text: 'An empty banner-pole behind the Legion’s lines, chewed at the top.', next: null },
    },
  },
];

export default dialogues;
