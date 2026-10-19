/** Companion loyalty beats (docs/lore/13-companions.md §2). For each companion:
 *  - `dialogue:loyalty-<slug>`: a one-time heart-to-heart at loyalty >= 70. Every entry node sets
 *    `companion.<slug>.beat_70` and gives +5 loyalty, so the beat is spent the moment it opens.
 *  - `dialogue:loyalty-<slug>-low`: at loyalty <= 20 they consider leaving. A [Will 15] check keeps them (+10 loyalty,
 *    lifting them clear of the threshold); failing, or letting them go, stops them following and sets
 *    `companion.<slug>.left` on the first node after the decision.
 *  Both are reached from the first dialogue routes on each companion’s NpcDef. Owner: Claude 4. */
import type { DialogueChoice, DialogueDef, NarrativeCondition, NarrativeEffect, NpcId } from '@/core';

const MAREN = 'npc:maren-hollis' as const;
const ANSELM = 'npc:anselm-pryde' as const;
const HESTA = 'npc:hesta-corrow' as const;
const CADOC = 'npc:cadoc-ap-ynys' as const;
const GRIMMA = 'npc:grimma-ironsong' as const;
const SABLE = 'npc:sable' as const;
const VESPER = 'npc:vesper-qadri' as const;

const f = (flag: string): NarrativeCondition => ({ flag });
const is = (flag: string, value: string): NarrativeCondition => ({ flag, op: '==', value });
const all = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: c });
const any = (...c: NarrativeCondition[]): NarrativeCondition => ({ any: c });
const not = (c: NarrativeCondition): NarrativeCondition => ({ not: c });
const love = (npc: NpcId, delta: number): NarrativeEffect => ({ loyalty: npc, delta });
const slugOf = (npc: NpcId) => npc.slice(4);

/** Effects for every entry node of a loyalty beat: spend the beat, +5 loyalty. */
const beat = (npc: NpcId): NarrativeEffect[] => [{ setFlag: `companion.${slugOf(npc)}.beat_70`, value: true }, love(npc, 5)];
/** Effects for the node after a failed or refused low-loyalty plea. */
const leave = (npc: NpcId): NarrativeEffect[] => [{ companion: npc, following: false }, { setFlag: `companion.${slugOf(npc)}.left`, value: true }];
/** Effects for the node after a kept companion. */
const kept = (npc: NpcId): NarrativeEffect[] => [love(npc, 10)];
/** The low-loyalty choice pair: a [Will 15] plea (fail → 'leave'), or letting them go. */
const plea = (text: string, letGo: string): DialogueChoice[] => [
  { text: `[Will 15] ${text}`, to: 'stay', tag: 'persuade', check: { stat: 'will', dc: 15, failTo: 'leave' } },
  { text: letGo, to: 'leave', tag: 'leave' },
];

const tobinHome = any(is('prologue.tobin_fate', 'saved'), f('act1.tobin_saved'));
const tobinGone = any(is('prologue.tobin_fate', 'dead'), f('act1.tobin_lost'));
const pledged = is('act2.church_stance', 'pledged');
const wickRules = is('act1.ruler', 'wick');

const dialogues: DialogueDef[] = [
  // =============================== MAREN ===============================
  {
    id: 'dialogue:loyalty-maren-hollis', name: 'Maren: Heart-to-heart',
    entries: [
      { when: tobinHome, node: 'home' },
      { when: tobinGone, node: 'gone' },
      { node: 'open' },
    ],
    nodes: {
      home: { speaker: MAREN, effects: beat(MAREN), next: 'ford', text: 'Sit down a minute. No, sit. I’ve been meaning to say something since Tobin wrote, and if I don’t say it now I’ll lose my nerve and shoot something instead.' },
      gone: { speaker: MAREN, effects: beat(MAREN), mood: 'sad', next: 'ford', text: 'Sit down a minute. I’m not going to cry. I’ve done my crying; there’s none left in the barrel. I just want to say something, and I want you to let me get to the end of it.' },
      open: { speaker: MAREN, effects: beat(MAREN), next: 'ford', text: 'Sit down a minute. You never sit down any more. You used to sit on the wall by the ford for whole afternoons doing nothing at all, and now you’re always going somewhere.' },
      ford: { speaker: MAREN, mood: 'happy', next: 'warm', text: 'Do you remember the ford, when we were eight? You went in after my shoe. My shoe. In March. And the water took your feet out and I had to haul you up the bank by your hair. You cried all the way home and said you’d drowned.' },
      warm: {
        speaker: MAREN, mood: 'afraid',
        text: 'You’re getting warmer. Did you know that? Standing by you now is like standing by a hearth. At night I can feel it from across the fire. (She doesn’t look at you.) I’m frightened that one day I’ll turn round and you’ll just be fire, and nobody left inside it to haul up the bank.',
        choices: [
          { text: '“I’m still me, Maren. Still the idiot who went in after your shoe.”', to: 'me', effects: [love(MAREN, 2)] },
          { text: '“If I start to change, tell me. Promise me you’ll tell me.”', to: 'promise', effects: [love(MAREN, 3)] },
          { text: '“I don’t know what I’m becoming. I won’t lie to you.”', to: 'honest', effects: [love(MAREN, 2)] },
        ],
      },
      me: { speaker: MAREN, mood: 'happy', next: 'arrow', text: 'Idiot’s the word. All right. Good. Stay an idiot. It suits you.' },
      promise: { speaker: MAREN, next: 'arrow', text: 'I’ll tell you. I’ll tell you so loud they’ll hear it in Solenne. Hearth and kin, I swear it.' },
      honest: { speaker: MAREN, mood: 'sad', next: 'arrow', text: '(A long breath.) Thank you. Everyone else lies to me to be kind. You never could. Your ears go red.' },
      arrow: {
        speaker: 'narrator',
        text: 'She takes an arrow from the bottom of her quiver: old, heron-fletched, the shaft dark with handling. She has never shot it. She puts it in your hand and closes your fingers round it.',
        next: 'end',
      },
      end: { speaker: MAREN, text: 'Mam’s. Last one she ever fletched. You keep it. Then you’ll have to come home, because I’ll want it back. And if you lose it, I’ll shoot you with a worse one.' },
    },
  },
  {
    id: 'dialogue:loyalty-maren-hollis-low', name: 'Maren: Considering leaving',
    entries: [
      { when: f('act1.tobin_lost'), node: 'lost' },
      { when: wickRules, node: 'wick' },
      { node: 'open' },
    ],
    nodes: {
      lost: { speaker: MAREN, mood: 'angry', next: 'ask', text: 'You swore to me in Brindlecross. You swore again in the reeds. Two oaths, and my brother’s in the water, and you’ve not once looked like it cost you anything.' },
      wick: { speaker: MAREN, mood: 'angry', next: 'ask', text: 'You gave Haldren to the Wick. The same men who stood on our green with torches and called it mercy. I keep waiting for a reason. You’ve never given me one.' },
      open: { speaker: MAREN, mood: 'angry', next: 'ask', text: 'I don’t know you any more. I keep looking for the one who sat on the ford wall with me, and there’s just this… person with a burning hand, doing whatever’s quickest.' },
      ask: {
        speaker: MAREN, mood: 'sad',
        text: 'I’m going home. What’s left of it. Someone should be there when the snow melts. Give me one reason not to.',
        choices: plea('“The ford, Maren. You hauled me out once. I need you to do it again.”', '“Go home, then. Hearth and kin.”'),
      },
      stay: { speaker: MAREN, effects: kept(MAREN), mood: 'sad', text: '(She is quiet a long while.) …Damn you. That’s not fair, using the ford. (She shoulders her bow.) One more stretch of road. I’m watching you. I’m always watching you; I just used to like what I saw.' },
      leave: { speaker: MAREN, effects: leave(MAREN), mood: 'sad', next: 'gone', text: 'Look after yourself. Somebody ought to, and it’s not going to be me any more.' },
      gone: { speaker: 'narrator', text: 'She goes west without looking back, the way she used to walk off a quarrel when you were children. This time she does not come back round the corner to see if you are following.' },
    },
  },

  // =============================== ANSELM ===============================
  {
    id: 'dialogue:loyalty-anselm-pryde', name: 'Anselm: Heart-to-heart',
    entries: [
      { when: all(f('prologue.anselm_betrayed'), f('npc.anselm-pryde.forgave')), node: 'forgave' },
      { when: f('prologue.anselm_betrayed'), node: 'unforgiven' },
      { node: 'open' },
    ],
    nodes: {
      forgave: { speaker: ANSELM, effects: beat(ANSELM), next: 'prayer', text: 'May I tell you something? I find I can tell you things now. Which is odd, considering. In Valcastre I swore I would never trust you with so much as a hymn number.' },
      unforgiven: { speaker: ANSELM, effects: beat(ANSELM), next: 'prayer', text: 'I have not forgiven you. I want to say that first, so you don’t think this is that. But I have found I would rather talk to you than to anyone else, and I have stopped pretending otherwise.' },
      open: { speaker: ANSELM, effects: beat(ANSELM), next: 'prayer', text: 'May I tell you something? I have been carrying it since Brindlecross, and it is getting heavy, and you look as if you have strong arms.' },
      prayer: { speaker: ANSELM, next: 'listen', text: 'Last night I said the office, as I always do. And afterwards, for the first time in my life, I stopped and listened. Properly. Not for words; I gave up expecting words years ago. Just listened.' },
      listen: {
        speaker: ANSELM,
        text: 'I think the god I was taught about may not be there. Not the one with the Lantern and the ledgers and the Wick. But something is. Something warm, under everything, that is very tired. (He looks at your hand.) It sounds a little like you.',
        choices: [
          { text: '“The Church can still be mended, Anselm.”', to: 'mend', effects: [love(ANSELM, 2)] },
          { text: '“Then the Church is wrong, and someone should say so.”', to: 'wrong', effects: [love(ANSELM, 2)] },
          { text: '“Perhaps faith never needed a church.”', to: 'none', effects: [love(ANSELM, 2)] },
          { text: '[Devout] “Then pray with me. Now. To whatever is listening.”', to: 'pray', when: { dialogueTag: 'devout' }, tag: 'trait', effects: [love(ANSELM, 4)] },
        ],
      },
      mend: { speaker: ANSELM, next: 'end', text: 'Perhaps. A roof can be mended if enough of the walls are standing. I keep counting the walls. Some days there are more than I feared.' },
      wrong: { speaker: ANSELM, mood: 'afraid', next: 'end', text: 'Someone should. And I am a curate from a village nobody has heard of, with a bad cough and a forged licence on my conscience. (A small smile.) Which is, now I say it, exactly the sort of man the saints usually were.' },
      none: { speaker: ANSELM, mood: 'sad', next: 'end', text: 'That is a heresy, you know. A very old one. I have always rather liked it, in the way one likes a dangerous dog through a fence.' },
      pray: { speaker: 'narrator', next: 'end', text: 'You kneel together in the snow. Neither of you says anything aloud. After a while you notice that the Ashmark has grown warm, and that Anselm is weeping, quite quietly, and smiling.' },
      end: { speaker: ANSELM, mood: 'happy', text: 'Thank you. I feel lighter. I have decided to keep my vow of poverty, at least. It is the one vow the world makes easy.' },
    },
  },
  {
    id: 'dialogue:loyalty-anselm-pryde-low', name: 'Anselm: Considering leaving',
    entries: [
      { when: all(f('prologue.anselm_betrayed'), not(f('npc.anselm-pryde.forgave'))), node: 'cell' },
      { when: pledged, node: 'pledged' },
      { node: 'open' },
    ],
    nodes: {
      cell: { speaker: ANSELM, mood: 'sad', next: 'ask', text: 'I told you in Valcastre I would come, because someone ought to watch what you choose next. (He folds his hands.) I have watched. I find I have seen enough.' },
      pledged: { speaker: ANSELM, mood: 'sad', next: 'ask', text: 'You carry Vellane’s papers. I know what is done in that man’s name; I have the marks to show for it. I cannot walk under that seal. Not even beside you.' },
      open: { speaker: ANSELM, mood: 'sad', next: 'ask', text: 'I have prayed about this, which you will think is a joke, and it is not. I came with you because I thought you might be the answer to something. I no longer know what the question was.' },
      ask: {
        speaker: ANSELM,
        text: 'There are refugees at Haldren with no priest. I can be useful there. I think perhaps I should go and be useful somewhere I can bear to look at.',
        choices: plea('“You told me to keep my eyes open. I need yours open beside me, Anselm.”', '“Go with the light, Brother.”'),
      },
      stay: { speaker: ANSELM, effects: kept(ANSELM), text: '(He closes his eyes.) That is my own sermon, thrown back at me. Very well. It was a good sermon. I will stay, and keep my eyes open, and you will not always like what they see.' },
      leave: { speaker: ANSELM, effects: leave(ANSELM), mood: 'sad', next: 'gone', text: 'And with you. Always with you. That is the trouble with blessings: you cannot take them back.' },
      gone: { speaker: 'narrator', text: 'He makes the sign of the Lantern over you, and you let him, and then he is walking north with his satchel on his shoulder and his breath going up white, small and smaller, and then gone.' },
    },
  },

  // =============================== HESTA ===============================
  {
    id: 'dialogue:loyalty-hesta-corrow', name: 'Hesta: Heart-to-heart',
    entries: [
      { when: f('act1.complete'), node: 'after' },
      { node: 'open' },
    ],
    nodes: {
      after: { speaker: HESTA, effects: beat(HESTA), next: 'candle', text: 'I should have died at Varn. I felt it go past me like a cart in a lane. So I’m living on borrowed time, and I’d best spend some of it telling you the truth. Sit.' },
      open: { speaker: HESTA, effects: beat(HESTA), next: 'candle', text: 'Sit. I’ve something to say and my lungs won’t take it standing. No, don’t help. I’m old, not furniture.' },
      candle: { speaker: HESTA, mood: 'sad', next: 'look', text: 'Ysolde used to be late home from the leys. Always. She’d lose track of the hours, sitting by some ley-stone, listening. So I put a candle in the window for her. Every night. She always came.' },
      look: {
        speaker: HESTA, mood: 'sad',
        text: 'When she became Keeper, she wrote to me. Every Lanternmass. “The Brand is cold at its heart, Hesta. What do I do?” And I wrote back: look into it. Look properly. See where it comes from. (She stops.) I told her where to look. She looked. And something looked back.',
        choices: [
          { text: '“You couldn’t have known what she’d find.”', to: 'known', effects: [love(HESTA, 1)] },
          { text: '“Then help me bring her back.”', to: 'back', effects: [love(HESTA, 3)] },
          { text: '(Say nothing. Let her finish.)', to: 'finish', effects: [love(HESTA, 2)] },
        ],
      },
      known: { speaker: HESTA, mood: 'angry', next: 'warden', text: 'I knew. I’m a Warden. Knowing is the whole job. I didn’t want to know, which is not the same thing, and don’t you dare let me off with it.' },
      back: { speaker: HESTA, next: 'warden', text: 'Bring her— (She laughs, and the laugh goes to a cough.) You ridiculous child. Yes. Yes, all right. If there’s anything of her left to bring, we’ll bring it. I’ll put the candle in the window myself.' },
      finish: { speaker: HESTA, next: 'warden', text: 'The letters stopped in eighty. Six years of nothing. Then the Brand went out, and I knew. (She wipes her face, roughly.) That’s all. That’s the whole of it. Now you know what I am.' },
      warden: {
        speaker: HESTA, effects: [{ unlockLore: 'lore:the-emberwardens', section: 'last-warden' }],
        text: 'I’d make you a Warden, if there were an order to make you one of. (A pause.) There is one, I suppose. Two of us now. Don’t let it go to your head. And don’t you ever, ever go looking where I tell you to without asking me what I’m afraid of first.',
      },
    },
  },
  {
    id: 'dialogue:loyalty-hesta-corrow-low', name: 'Hesta: Considering leaving',
    entries: [
      { when: wickRules, node: 'wick' },
      { when: pledged, node: 'pledged' },
      { node: 'open' },
    ],
    nodes: {
      wick: { speaker: HESTA, mood: 'angry', next: 'ask', text: 'You handed the kingdom to the Wick. The Wick. The men who went up my crag with torches and came down with our archive under the Hierophant’s seal. And you did it with my teaching in your hand.' },
      pledged: { speaker: HESTA, mood: 'angry', next: 'ask', text: 'You knelt to Vellane. You’ve his papers in your pack. I can smell the lamp-oil on them from here. Did you think I wouldn’t notice, or did you think I wouldn’t mind?' },
      open: { speaker: HESTA, mood: 'angry', next: 'ask', text: 'I’ve watched you, child. Every choice. Clever, quick, and not one of them made carefully. I’ve seen that before. I taught that before.' },
      ask: {
        speaker: HESTA, mood: 'sad',
        text: 'I buried one apprentice already, in everything but earth. I’ll not stand by and watch it happen twice. I’m going back to Cinderhold to keep the fire in. Somebody should.',
        choices: plea('“You said to keep my eyes open. Then don’t close yours on me. Not yet.”', '“Keep the fire in, Warden.”'),
      },
      stay: { speaker: HESTA, effects: kept(HESTA), text: '(She stares at you over the fire for a long, long time.) …Hm. That one was carefully made. First I’ve seen. (She sits back down, slowly.) One more chance, child. I’m too old for a third.' },
      leave: { speaker: HESTA, effects: leave(HESTA), mood: 'sad', next: 'gone', text: 'I will. I’ll leave a candle in the window. You won’t come. They never do, after a while.' },
      gone: { speaker: 'narrator', text: 'She goes slowly, leaning on the sword that steams in the snow, and she does not cough until she thinks she is out of earshot. She is wrong.' },
    },
  },

  // =============================== CADOC ===============================
  {
    id: 'dialogue:loyalty-cadoc-ap-ynys', name: 'Cadoc: Heart-to-heart',
    entries: [
      { when: f('act1.cadoc_secret_known'), node: 'known' },
      { node: 'open' },
    ],
    nodes: {
      known: { speaker: CADOC, effects: beat(CADOC), next: 'mother', text: 'You know about the seep already; Rhiannon saw to that. But you don’t know why. Would you like to? I appear to be in a confiding mood. It will pass. Seize it.' },
      open: { speaker: CADOC, effects: beat(CADOC), next: 'mother', text: 'You asked me once why I am in disgrace. I said, ask me when we know each other better, or when I am drunk. I am not drunk.' },
      mother: { speaker: CADOC, mood: 'sad', next: 'hum', text: 'My mother kept the Lullaby, against the oath. When she was dying, she hummed it. Not the words; the words would have drowned the room. Just the tune, under her breath, for nine days. On the tenth day she taught me the words, and then she stopped.' },
      hum: { speaker: CADOC, next: 'name', effects: [{ unlockLore: 'lore:cadoc-ap-ynys', section: 'what-he-did' }], text: 'So I was two hundred, and grieving, and carrying the most dangerous song in the world, and I told someone. Because I could not bear to be the only one who knew it. That is the whole of my disgrace. Loneliness, with a good tune.' },
      name: {
        speaker: CADOC,
        text: 'I have decided something, {player.name}. (He has never used your name before. He seems to notice it in the same moment you do.) Humans are sparks. Sparks go out. I have decided, against the evidence of three centuries, to mind.',
        choices: [
          { text: '“Teach me the Lullaby, Cadoc.”', to: 'teach', effects: [love(CADOC, 2)] },
          { text: '“You called me by my name.”', to: 'named', effects: [love(CADOC, 3)] },
        ],
      },
      teach: { speaker: CADOC, next: 'line', text: 'One line. Only one. A line is not a door; it is the shape of a door, drawn on a wall. Listen.' },
      line: { speaker: 'narrator', effects: [{ unlockLore: 'lore:the-lullaby' }], next: 'end', text: 'He sings it very low: five notes, going down, and a word in Aelthi that is mostly breath. Somewhere far below the ground, something turns over in its sleep. Your Ashmark goes cool for a moment, as if a hand had been laid on it.' },
      named: { speaker: CADOC, mood: 'happy', next: 'end', text: 'A slip. I shall go back to “spark” immediately. (He does not.) It is a good name. Short. It will be easy to remember, afterwards.' },
      end: { speaker: CADOC, text: 'Don’t tell my mother— (He stops.) Ah. Three hundred years, and I still do that. Never mind. Go to sleep. I’ll keep watch. I am, as you know, very good at sitting at the edge of things.' },
    },
  },
  {
    id: 'dialogue:loyalty-cadoc-ap-ynys-low', name: 'Cadoc: Considering leaving',
    entries: [
      { when: f('act2.korrath_flooded'), node: 'flood' },
      { node: 'open' },
    ],
    nodes: {
      flood: { speaker: CADOC, mood: 'sad', next: 'ask', text: 'I watched you pull the Ember out of Korrath and the sea come up after it. My people did that once, with a song, and we have been sorry for a thousand years. You did not even look sorry.' },
      open: { speaker: CADOC, mood: 'sad', next: 'ask', text: 'Three hundred years teaches one when to leave a party. Usually just before somebody sets the curtains alight. I have been watching the curtains.' },
      ask: {
        speaker: CADOC,
        text: 'The Thornwall needs a watcher, and I am a very good watcher. I think I shall go and sit at the edge of things again. It is where I was put, after all.',
        choices: plea('“You decided to mind, once. Mind now. Stay.”', '“Go well, Cadoc.”'),
      },
      stay: { speaker: CADOC, effects: kept(CADOC), text: '(A long silence.) That is unkind. Effective, but unkind. (He sits back down.) Very well. I shall stay and watch the curtains from closer. Do try not to set them alight.' },
      leave: { speaker: CADOC, effects: leave(CADOC), mood: 'sad', next: 'gone', text: 'Go well, spark. I will remember you. That is the curse of my people, and today it is yours.' },
      gone: { speaker: 'narrator', text: 'He is gone between one breath and the next, the way the Aelthi go, and the only sign he was ever there is a thornbow leaf lying on the snow, very green.' },
    },
  },

  // =============================== GRIMMA ===============================
  {
    id: 'dialogue:loyalty-grimma-ironsong', name: 'Grimma: Heart-to-heart',
    entries: [
      { when: f('act2.new_nail'), node: 'nail' },
      { when: f('act2.korrath_flooded'), node: 'flood' },
      { node: 'open' },
    ],
    nodes: {
      nail: { speaker: GRIMMA, effects: beat(GRIMMA), next: 'ledger', text: 'Sit. I’ve something for you. Don’t look so frightened, it’s not a hammer. Not this time. A new Nail in the deep, with my mark on its head, and you there holding the tongs. That wants writing down.' },
      flood: { speaker: GRIMMA, effects: beat(GRIMMA), next: 'ledger', text: 'Sit. You’re still in my ledger as owing, for Korrath. That’s not going anywhere. But a ledger’s got two columns, human, and I’ve been keeping the other one too.' },
      open: { speaker: GRIMMA, effects: beat(GRIMMA), next: 'ledger', text: 'Sit. I’ve something to say and I’ll only say it once, so you’d best listen with both ears and whatever else you’ve got.' },
      ledger: {
        speaker: 'narrator', effects: [{ unlockLore: 'lore:grimma-ironsong', section: 'truth' }],
        text: 'She takes out a small book bound in iron plates, her own ledger, the one she has kept since the Concord struck her name. On the last written page, in square Orrun runes, is your name. Beneath it, a single line.',
        next: 'reads',
      },
      reads: { speaker: GRIMMA, next: 'oath', text: '“Owed: one name, given back.” They wrote grenn on me, and you stood up at the gate and made them hear it was the truth. That’s a debt. Biggest in this book. I’ll not pay it off in a lifetime. Orrun lifetimes are long. That’s a threat.' },
      oath: {
        speaker: GRIMMA,
        text: '(She holds out a small iron ring, rough-forged.) Don’t put it on your finger, you’ll be married. Braid it in your hair. It says you’ve an Orrun at your back. Korr nagh.',
        choices: [
          { text: '“Korr nagh, Grimma.”', to: 'sworn', effects: [love(GRIMMA, 3)] },
          { text: '“I don’t make oaths I can’t be sure I’ll keep.”', to: 'careful', effects: [love(GRIMMA, 2)] },
        ],
      },
      sworn: { speaker: GRIMMA, mood: 'happy', next: 'end', text: 'Hah. Said like a human: too fast and with your whole heart. That’ll do. That’ll do.' },
      careful: { speaker: GRIMMA, next: 'end', text: 'Good. That’s the only sort who ought to be swearing. (She presses the ring into your palm anyway.) Keep it till you’re sure. Iron’s patient.' },
      end: { speaker: GRIMMA, text: 'Now go away. I’ve had more feelings tonight than I’ve had since the Rusting, and I need to hit something with a hammer till they stop.' },
    },
  },
  {
    id: 'dialogue:loyalty-grimma-ironsong-low', name: 'Grimma: Considering leaving',
    entries: [
      { when: f('act2.korrath_flooded'), node: 'flood' },
      { node: 'open' },
    ],
    nodes: {
      flood: { speaker: GRIMMA, mood: 'angry', next: 'ask', text: 'I’ve tallied it. The holds. Korrath. Every choice since. The owing column runs off the page, human, and I’ve started on the cover.' },
      open: { speaker: GRIMMA, mood: 'angry', next: 'ask', text: 'I told the truth at the gate and lost everything for it. I’ll not walk behind someone who tells it only when it’s cheap.' },
      ask: {
        speaker: GRIMMA,
        text: 'My forge is still in the snow at the gate. Cold, by now. I’m going back to light it. Grenn on me, they said. Well. I know what holds and what doesn’t.',
        choices: plea('“You told the truth when no one would hear it. Tell it to me now, to my face, and stay to see me answer it.”', '“Light your forge, Grimma.”'),
      },
      stay: { speaker: GRIMMA, effects: kept(GRIMMA), text: '(She looks at you like a smith looks at a blade that has just failed the quench and somehow not cracked.) …Hm. Holding. Just. (She shoulders her hammer.) I’m watching the seams, human.' },
      leave: { speaker: GRIMMA, effects: leave(GRIMMA), mood: 'angry', next: 'gone', text: 'Grenn. (She does not shout it. It is worse that she does not shout it.) Strike my name off your list. I’ve struck yours.' },
      gone: { speaker: 'narrator', text: 'She goes north toward the mountains without a backward look, and you hear her for a long while after you can no longer see her: the clink of iron rings in her braid, steady as a hammer, going away.' },
    },
  },

  // =============================== SABLE ===============================
  {
    id: 'dialogue:loyalty-sable', name: 'Sable: Heart-to-heart',
    entries: [
      { when: f('npc.sable.confided'), node: 'told' },
      { when: f('npc.sable.tear_seen'), node: 'seen' },
      { node: 'open' },
    ],
    nodes: {
      told: { speaker: SABLE, effects: beat(SABLE), next: 'singing', text: 'You remember in the den, when I said I didn’t hear singing? Much? (She tries a smile.) I was rounding down, love.' },
      seen: { speaker: SABLE, effects: beat(SABLE), next: 'singing', text: 'You saw. In the den, with the ledger. You saw, and you never asked again, and I’ve been grateful every day and it’s making me itch. So. I’m telling you.' },
      open: { speaker: SABLE, effects: beat(SABLE), mood: 'hollow', next: 'singing', text: '(She wipes her cheek, and this time she holds the sleeve out so you can see the black on it.) There. I’m tired of hiding it from the one person who might actually do something.' },
      singing: { speaker: SABLE, mood: 'hollow', next: 'ask', text: 'It sings at night now. Ever so soft. Like a mam humming on the other side of a wall. And it’s… nice. That’s the frightening part. It’s ever so nice. Some nights my feet are cold and wet when I wake, and I don’t remember walking.' },
      ask: {
        speaker: SABLE, mood: 'afraid',
        text: 'So I want a promise. If I start walking to the water and I don’t stop, don’t let me go in smiling. Make me angry. Insult my knives. I don’t want to go happy, love. I want to go kicking.',
        choices: [
          { text: '“You won’t go at all. I’ll find a way to burn it out of you.”', to: 'burn', effects: [love(SABLE, 3)] },
          { text: '“I promise. I’ll make you furious.”', to: 'promise', effects: [love(SABLE, 2)] },
        ],
      },
      burn: { speaker: SABLE, mood: 'sad', next: 'gifts', text: '(She looks at your hand for a long moment.) Don’t promise that one. I’ll believe you, and then where will we be. (Softer.) …Promise it anyway.' },
      promise: { speaker: SABLE, mood: 'happy', next: 'gifts', text: 'Good. Start practising. My knives are lovely, but you could have a go at my hair. I’m very vain about my hair.' },
      gifts: {
        speaker: SABLE, mood: 'happy',
        text: '(She turns out her pockets onto your bedroll.) Right. Honesty, while I’m at it. Your second-best knife. Your lucky copper. A button off your good coat. Maren’s flint, don’t tell her. (She pauses over the button.) Can I keep the button? I’m quite fond of the button.',
        next: 'end',
      },
      end: { speaker: SABLE, text: 'There. Clean hands. First time since I was nine. (She tucks them, cold as ever, into your sleeve.) Don’t get used to it.' },
    },
  },
  {
    id: 'dialogue:loyalty-sable-low', name: 'Sable: Considering leaving',
    entries: [
      { when: wickRules, node: 'wick' },
      { node: 'open' },
    ],
    nodes: {
      wick: { speaker: SABLE, next: 'ask', text: 'The Wick runs Haldren now. Thanks to you. They’ve my description in their book, love: “black at the eyes”. Every day I walk beside you I’m walking beside the one who handed them the keys.' },
      open: { speaker: SABLE, next: 'ask', text: 'The Hand has a rule. It pays its debts. You saved me in the den, I’ve watched your back since. I reckon we’re square, by my sums.' },
      ask: {
        speaker: SABLE, mood: 'sad',
        text: '(Brightly, too brightly.) So I thought I’d go back to the city. Pick some pockets. Hum a bit. There’s worse ways to go than doing what you’re good at.',
        choices: plea('“You asked me once not to let you go in smiling. You’re smiling, Sable.”', '“The Hand pays its debts. We’re square.”'),
      },
      stay: { speaker: SABLE, effects: kept(SABLE), mood: 'sad', text: '(The smile falls off her face. Under it she looks very young.) …That’s dirty, that is. That’s a proper thief’s trick. (She sits down.) Fine. Fine. I’ll stay. But you owe me now.' },
      leave: { speaker: SABLE, effects: leave(SABLE), mood: 'hollow', next: 'gone', text: 'Square, then. Mind your purse. (A wink, and a black tear, and she does not wipe it away.)' },
      gone: { speaker: 'narrator', text: 'You check your purse after she has gone. It is all there, and something has been added: a single button, polished bright.' },
    },
  },

  // =============================== VESPER ===============================
  {
    id: 'dialogue:loyalty-vesper-qadri', name: 'Vesper: Heart-to-heart',
    entries: [
      { when: f('act2.vesper_held_glass'), node: 'held' },
      { when: f('act2.vesper_trust'), node: 'trust' },
      { node: 'open' },
    ],
    nodes: {
      held: { speaker: VESPER, effects: beat(VESPER), next: 'aurenac', text: 'You let me hold the Glass Ember for a night. Nobody has ever trusted me with fire. They trust me to set it, or they hang me for it. Holding is different. So I owe you the truth, and here it is.' },
      trust: { speaker: VESPER, effects: beat(VESPER), next: 'aurenac', text: 'At the Glass Throne you said we’d carry it together. I keep turning the word over. Together. I have led three hundred heretics and never once carried anything with any of them. So. A confession, from one bearer to another.' },
      open: { speaker: VESPER, effects: beat(VESPER), next: 'aurenac', text: 'I have a confession, and no confessor. You will have to do. Don’t look so alarmed; I shan’t ask you to absolve me. I’m not sure you’re licensed.' },
      aurenac: { speaker: VESPER, next: 'stay', text: 'You know about the novice at Aurenac. The candle in her finger, the Wick at dawn, the fire in the chapel. Everyone knows that part; it’s on the notices. What isn’t on the notices is that I meant to stay behind.' },
      stay: {
        speaker: VESPER, mood: 'sad',
        text: 'I got her to the wall. I meant to go back in and burn with the abbey. I had it all decided; it felt very clean. And she turned round on top of the wall, fourteen years old, covered in soot, and held out her hand. And I am not strong enough to refuse a child.',
        choices: [
          { text: '“I’m glad you weren’t strong enough.”', to: 'glad', effects: [love(VESPER, 3)] },
          { text: '“Is that why you fight? Because you were meant to die?”', to: 'why', effects: [love(VESPER, 2)] },
        ],
      },
      glad: { speaker: VESPER, mood: 'happy', next: 'sing', text: 'So is she. She tells me so in every letter. In red thread, tied to my tent-pole. She has dreadful handwriting.' },
      why: { speaker: VESPER, next: 'sing', text: 'No. I fight because I lived, and the living have to be useful or they go sour. (She considers.) Also I enjoy it. I would be a very poor heretic if I lied to you about that.' },
      sing: { speaker: 'narrator', next: 'end', text: 'She is quiet. Then, very softly, so softly you almost lose it under the fire, she sings two lines of the Canticle of the Anvil. The high part. Her voice is rough from disuse, and quite beautiful, and she stops before the end.' },
      end: { speaker: VESPER, mood: 'happy', text: 'First time in twenty years. (She clears her throat, fiercely.) Don’t tell anyone. I have a reputation. It is mostly arson.' },
    },
  },
  {
    id: 'dialogue:loyalty-vesper-qadri-low', name: 'Vesper: Considering leaving',
    entries: [
      { when: pledged, node: 'pledged' },
      { node: 'open' },
    ],
    nodes: {
      pledged: { speaker: VESPER, mood: 'angry', next: 'ask', text: 'You carry Wick papers. Vellane’s seal, in the same pack as the Embers. Every day I tell myself you’ll burn them. Every day you don’t.' },
      open: { speaker: VESPER, mood: 'angry', next: 'ask', text: 'I have been watching what you do with the fire you carry, and you are turning into a Church. One person deciding for everyone. Oh, you are kinder about it. They were kind, too, at Aurenac, right up to dawn.' },
      ask: {
        speaker: VESPER,
        text: 'The Creed is waiting at the gates of Qadir. They need someone who still believes the fire belongs to everyone. I am not sure you do any more. I am going back to them.',
        choices: plea('“Then stay and argue with me. You said no one is lost who is still arguing.”', '“Go back to the Creed, Vesper.”'),
      },
      stay: { speaker: VESPER, effects: kept(VESPER), text: '(She stares at you, and then she laughs, despite herself.) My own saying. You wretch. (She sits.) Very well. I shall stay, and argue, constantly. You will regret this enormously.' },
      leave: { speaker: VESPER, effects: leave(VESPER), mood: 'sad', next: 'gone', text: 'I will pray for you. Properly, not the office. I don’t know to whom. That makes two of us.' },
      gone: { speaker: 'narrator', text: 'She goes south toward the Wastes, a red habit against the snow, and the little flame she always keeps in her palm goes with her until the dark takes it.' },
    },
  },
];

export default dialogues;
