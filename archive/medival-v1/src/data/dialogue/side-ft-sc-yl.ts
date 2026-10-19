/**
 * Dialogue for regional side quests, part 1: Ironspine Foothills (ft) and Saltreach Coast (sc).
 * Spec: docs/lore/15-side-content.md. Owner: Claude 4. Ylwen is in side-ft-sc-yl-b.ts.
 * Hard rule: every decision flag is set on the choice node itself (node effects), never on a last node.
 */
import type { DialogueDef } from '@/core';

type Q = `quest:${string}`;
const MINE: Q = 'quest:side-ft-mine-nine', PILGRIM: Q = 'quest:side-ft-rust-pilgrim';
const WRECK: Q = 'quest:side-sc-wreckers-lantern', TITHE: Q = 'quest:side-sc-saelas-tithe';
const SIDE = { flag: 'content.side' };
const at = (q: Q, stage: string) => ({ questStage: q, stage });
const is = (flag: string, value: string) => ({ flag, op: '==' as const, value });
const notStarted = (q: Q) => ({ not: { any: [{ questActive: q }, { questCompleted: q }] } });
const offer = (q: Q) => ({ all: [SIDE, notStarted(q)] });
const done = (q: Q, flag: string, value: string) => ({ all: [{ questCompleted: q }, is(flag, value)] });

const EDWY = 'npc:edwy-delver', HOB = 'npc:hob-delver', ORRIK = 'npc:orrik-coalheart', HEDDA = 'npc:hedda-stonebrow';
const PIKE = 'npc:leofric-pike', EDITH = 'npc:edith-skerry', ELS = 'npc:elswyth', WREN = 'npc:wren-tallow';

const dialogues: DialogueDef[] = [
  // ===================== MINE NINE =====================
  {
    id: 'dialogue:side-ft-mine-nine-edwy', name: 'Edwy Delver: Mine Nine',
    entries: [
      { when: { all: [at(MINE, 'return'), is('side.ft.mine-nine.choice', 'purged')] }, node: 'ret-purged' },
      { when: { all: [at(MINE, 'return'), is('side.ft.mine-nine.choice', 'sealed')] }, node: 'ret-sealed' },
      { when: at(MINE, 'choice'), node: 'choice' },
      { when: { questActive: MINE }, node: 'going' },
      { when: done(MINE, 'side.ft.mine-nine.choice', 'purged'), node: 'after-purged' },
      { when: done(MINE, 'side.ft.mine-nine.choice', 'sealed'), node: 'after-sealed' },
      { when: offer(MINE), node: 'offer' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: EDWY, text: 'Slagwick’s shut for the day. Shut for the winter, if you ask the pumps.' },
      offer: {
        speaker: EDWY, mood: 'afraid',
        text: 'You’re the one with the hand. Aye, I’ve heard. Listen. Nine’s flooding. Not the way a pit floods. It comes up from the sump, right enough, but it doesn’t stop at the sump. It climbs. Rung by rung up the ladders, against the drip, like it wants the daylight. My lad Hob went down on Vorsday with two hewers to shore the north gallery, and the water came up behind them.',
        next: 'ask',
      },
      ask: {
        speaker: EDWY,
        text: 'I’ve powder packed at the gallery mouth. If I fire it, Nine comes down and whatever’s climbing stops climbing. And so does anything else down there. I’ve not fired it. Will you go down first?',
        choices: [
          { text: '“I’ll go down.”', to: 'accept', effects: [{ startQuest: MINE }] },
          { text: '[Intellect 15] “Water doesn’t climb.”', to: 'climb', tag: 'lore', once: true, check: { stat: 'intellect', dc: 15, failTo: 'climb-fail' } },
          { text: '[Warden] “Who’s holding the pithead while you stand here?”', to: 'warden', when: { classIs: 'class:warden' }, tag: 'class', once: true },
          { text: '[Hollow-touched] “I can hear it from here. Something down there is singing.”', to: 'hollow', when: { dialogueTag: 'hollow-touched' }, tag: 'trait', once: true },
          { text: '“Not now.”', to: null, tag: 'leave' },
        ],
      },
      climb: { speaker: EDWY, text: 'No. It doesn’t. I dropped a stone down Nine on Vorsday and counted, and heard it hit water. Next morning I dropped another, and it hit three fathoms sooner. The water doesn’t freeze, neither, and it’s not warm. It’s just black. The Orrun at the Exchange say the same of their deep holds and won’t look at me when they say it.', next: 'ask' },
      'climb-fail': { speaker: EDWY, mood: 'angry', text: 'Go and tell it that, then. I’ll hold your coat.', next: 'ask' },
      warden: { speaker: EDWY, text: 'Nobody. That’s the truth of it. The men won’t go near, and I can’t stand there and stand here both. Things came up out of it at dawn, like frogspawn with teeth. I put a pick through one and it went into two.', next: 'ask' },
      hollow: { speaker: EDWY, mood: 'afraid', text: '…You can hear that? From up here? Seven keep us. I thought it was only me. I thought I was going soft in the head.', next: 'ask' },
      accept: { speaker: EDWY, text: 'Hearth and kin keep you. Clear the pithead first; the things that come up out of it don’t like daylight, but they like lamps. And if you see my Hob… tell him his mam’s keeping his supper warm. She is. Every night.' },
      going: { speaker: EDWY, text: 'Nine’s the last pithead on the high road, past the slag-tip. You’ll know it. It’s the one nobody’s standing near.' },
      choice: {
        speaker: EDWY, mood: 'afraid',
        text: 'You’ve been down. I can see it on you. Is he…? Alive. On a ledge. Seven be thanked. And the water? Still coming. Aye. So it’s the powder or it’s your hand, then. I’ll not curse you whichever. I might curse the Seven.',
        choices: [
          { text: '“I’ll go back down. I can burn it back.”', to: null },
          { text: '“Fire the charge, Edwy. I’m sorry.”', to: 'seal' },
          { text: '“Give me time.”', to: null, tag: 'leave' },
        ],
      },
      seal: {
        speaker: EDWY, mood: 'sad', effects: [{ setFlag: 'side.ft.mine-nine.choice', value: 'sealed' }],
        text: 'He walks to the fuse-box without a word. His hands are steady. That’s the worst of it, you think afterwards: how steady they are. Nine comes down with a sound like the whole hill clearing its throat, and the slag-tip slides, and then there is only the wind.',
      },
      'ret-purged': {
        speaker: EDWY, mood: 'happy', effects: [{ giveGold: 40 }],
        text: 'He’s home. He’s home and he’s eating, and his mam’s not let go of his sleeve since. Will and Cuth are abed and swearing they never sang a note. Take this. It’s not what it’s worth. Nothing would be.',
        next: 'ret-purged2',
      },
      'ret-purged2': {
        speaker: EDWY, mood: 'sad',
        text: 'One thing. He weeps black, sometimes, out of the one eye. He wipes it and says it’s coal-dust. I’ve been fifty years a collier. I know coal-dust. …We’ll open Nine again come spring, if there is a spring. The seam’s too good to leave. I know. I know.',
      },
      'ret-sealed': {
        speaker: EDWY, mood: 'sad', effects: [{ giveGold: 40 }],
        text: 'Slagwick’s wells are clean. The pumps in Seven and Eight are drawing water that’s only water. You did right by the town. I keep saying it. I’ll keep saying it till I believe it. Take this. Don’t thank me for it.',
      },
      'after-purged': { speaker: EDWY, text: 'Hob’s on the pumps in Eight now. Won’t go near Nine. Won’t sleep without a lamp lit, neither. Can’t say I blame him.' },
      'after-sealed': { speaker: EDWY, mood: 'sad', text: 'His mam goes up to the rubble of an evening and sits. I let her. Somebody ought to.' },
    },
  },
  {
    id: 'dialogue:obj-ft-mine-nine-gallery', name: 'Object: Mine Nine gallery',
    entries: [
      { when: is('side.ft.mine-nine.choice', 'purged'), node: 'dry' },
      { when: is('side.ft.mine-nine.choice', 'sealed'), node: 'rubble' },
      { when: at(MINE, 'choice'), node: 'decide' },
      { when: at(MINE, 'gallery'), node: 'down' },
      { when: at(MINE, 'pithead'), node: 'early' },
      { node: 'boarded' },
    ],
    nodes: {
      boarded: { speaker: 'narrator', text: 'The mouth of Mine Nine, boarded across with pit-props. Chalked on the boards: NINE SHUT. KEEP OUT. HEARTH AND KIN.' },
      early: { speaker: 'narrator', text: 'Something wet slaps against the boards from the inside, and slaps again. Clear the pithead before you go down.' },
      down: {
        speaker: 'narrator', effects: [{ setFlag: 'side.ft.mine-nine.seen', value: true }],
        text: 'You go down the ladders by lamplight. Twenty rungs. Forty. The drip runs down the rock as it should, and the water below runs up. It comes over each rung like oil over a lip, black and glossy, and does not ripple when the drip strikes it. Below, the Haldish gallery breaks into an older cut, square as a ledger and wide as a church door, that no Haldish pick ever made. On its sill, a man’s height above the water, are three men. Two are singing. One is shouting at them to stop.',
        next: 'hob',
      },
      hob: {
        speaker: HOB, mood: 'afraid',
        text: 'Up there! Have you a rope? No, don’t come down, it likes it when you come down! Listen to them. Will and Cuth have been singing since the lamp went out, and every verse it comes up a rung. I’ve hit them. I’ve begged them. They just smile at me.',
        next: 'decide',
      },
      decide: {
        speaker: 'narrator',
        text: 'The water laps a rung higher. At the gallery mouth Edwy’s powder-kegs sit packed and fused. Your marked hand has begun to ache, the way it aches near a seep.',
        choices: [
          { text: '[Will 15] Go down to the waterline and burn it back with the Ashmark.', to: 'purge', check: { stat: 'will', dc: 15, failTo: 'purge-fail' } },
          { text: '[Reaver] Open your palm on the rung, and give the mark blood to burn with.', to: 'purge', when: { classIs: 'class:reaver' }, tag: 'class' },
          { text: '[Hollow-touched] Sing with the hewers, and lead the song somewhere else.', to: 'hollow', when: { dialogueTag: 'hollow-touched' }, tag: 'trait' },
          { text: 'Climb out, and fire the charge.', to: 'seal' },
          { text: 'Not yet. Climb out.', to: null, tag: 'leave' },
        ],
      },
      hollow: {
        speaker: 'narrator',
        text: 'You know the tune. You have always known it, a little. You take it up, softly, and the hewers turn their heads toward you as sleepers turn toward a warm wall, and you walk the song away from the water, up and up, till they are singing to you and not to it. The water stops. It waits. And then your hand is on it.',
        next: 'purge',
      },
      purge: {
        speaker: 'narrator', effects: [{ setFlag: 'side.ft.mine-nine.choice', value: 'purged' }],
        text: 'You put your marked hand flat on the black water. It is not cold. It is not anything. Then the Ashmark wakes, and fire goes out of your palm across the water like a flame across spilt spirit, and the water flinches. It goes down. Rung by rung, all the way down, hissing, the way it came; and the singing stops in the middle of a word.',
        next: 'purge2',
      },
      purge2: {
        speaker: HOB,
        text: 'It’s gone down. It’s gone down! Will? Cuth? Come on, you daft beggars, climb, before it changes its mind. …Ashmarked. I don’t know your name. I’ll find it out, and I’ll name a son after you, I swear it.',
      },
      'purge-fail': {
        speaker: 'narrator', mood: 'afraid',
        text: 'You put your hand to the water and the Ashmark wakes, and the water does not flinch. It comes up your arm to the elbow, soft and weightless, and for a moment you want very much to sing. You tear your arm free and fall back against the ladder. The water is two rungs higher. Below, Hob is shouting your name, or a name.',
        choices: [
          { text: 'Climb out, and fire the charge.', to: 'seal' },
          { text: 'Climb out and gather yourself. Come back stronger.', to: null, tag: 'leave' },
        ],
      },
      seal: {
        speaker: 'narrator', mood: 'sad', effects: [{ setFlag: 'side.ft.mine-nine.choice', value: 'sealed' }],
        text: 'You call down to Hob that you are going to fire it. For a long moment he says nothing. Then: “Mam’s in Slagwick. Do it. Do it before I ask you not to.” You climb. You light the fuse. You run.',
        next: 'seal2',
      },
      seal2: { speaker: 'narrator', mood: 'sad', text: 'Mine Nine comes down with a sound like the hill clearing its throat. When the dust settles you put your ear to the rubble and listen a long time. Nothing sings. Nothing climbs.' },
      dry: { speaker: 'narrator', text: 'Mine Nine is dry to the sump, and silent. Far down, past the last rung, something black lies still at the bottom of the shaft, the way a dog lies still by a door it means to scratch at later.' },
      rubble: { speaker: 'narrator', mood: 'sad', text: 'Nine is a heap of broken props and fallen rock. On the one board left standing someone has chalked three names: HOB. WILL. CUTH. And under them, smaller: SUPPER’S WARM.' },
    },
  },
  {
    id: 'dialogue:side-ft-mine-nine-hob', name: 'Hob Delver: after Mine Nine',
    entries: [{ node: 'n' }],
    nodes: {
      n: {
        speaker: HOB,
        text: 'It wasn’t angry, you know. The water. I keep thinking that. When it came over my boots it felt like… like a dog that’s been shut out all night. It just wanted in. (He wipes his eye with the heel of his hand. It comes away dark.) Coal-dust. Don’t tell Mam.',
      },
    },
  },

  // ===================== THE RUST PILGRIM =====================
  {
    id: 'dialogue:side-ft-rust-pilgrim-orrik', name: 'Orrik Coalheart: The Rust Pilgrim',
    entries: [
      { when: at(PILGRIM, 'gate'), node: 'gate' },
      { when: at(PILGRIM, 'father'), node: 'summit' },
      { when: at(PILGRIM, 'stair'), node: 'stair' },
      { when: done(PILGRIM, 'side.ft.rust-pilgrim.choice', 'returned'), node: 'after' },
      { when: offer(PILGRIM), node: 'offer' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: ORRIK, text: 'Mind the step, human. Everything here is older than you, and most of it is heavier.' },
      offer: {
        speaker: ORRIK,
        text: 'Human. You have the look of someone who goes where they are told not to. Sit. I am Orrik, of Coalheart Deep. Ledger-clerk. A hundred and forty years at the pen. I am going up to the Father on Watch Ridge. We do not climb up to the Fathers. We sing to them from the road, once a year, so they know they are not forgotten. I have a thing to say to him that will not carry from the road.',
        next: 'ask',
      },
      ask: {
        speaker: ORRIK,
        text: 'The Pilgrims’ Stair has rust on it these days. The walking kind. I would like company. I can pay in coin, or in the knowledge of who in the gate-town owes what to whom, which is worth more.',
        choices: [
          { text: '“I’ll walk with you.”', to: 'accept', effects: [{ startQuest: PILGRIM }] },
          { text: '“What do you need to say to him?”', to: 'why', once: true },
          { text: '[Intellect 15] “Your knees have already turned to stone. You’re not planning to come back down.”', to: 'stop', tag: 'lore', once: true, check: { stat: 'intellect', dc: 15, failTo: 'stop-fail' } },
          { text: '[Oathbound] “A confession wants a priest, not a statue.”', to: 'oath', when: { classIs: 'class:oathbound' }, tag: 'class', once: true },
          { text: '[Scholar] “Your Hold-Song says the Fathers climbed up out of the deep and stopped. Are you following them?”', to: 'scholar', when: { dialogueTag: 'scholar' }, tag: 'trait', once: true },
          { text: '“Not today.”', to: null, tag: 'leave' },
        ],
      },
      why: { speaker: ORRIK, text: 'That I kept a ledger that lied by keeping quiet. That is all you will have from me at the bottom of the hill. The rest is his.', next: 'ask' },
      stop: { speaker: ORRIK, text: 'Hm. Sharp. No, I am not planning to come down. Not to die, mind. To stop. It is different for us. Your people go out like a candle. Ours set, like mortar. I would rather set somewhere with a view.', next: 'ask' },
      'stop-fail': { speaker: ORRIK, text: 'You are looking at my knees. Everyone looks at my knees. Look at the road instead; it is where we are going.', next: 'ask' },
      oath: { speaker: ORRIK, text: 'Your priests forgive in Ithren’s name, and Ithren is a lamp. I do not want a lamp. I want the one who was there when the iron was poured.', next: 'ask' },
      scholar: { speaker: ORRIK, text: 'You have read the Hold-Song. In translation, I expect; it loses the weight. Yes. They climbed up and stood in the wind and stopped. I have wondered all my life what they were waiting for. I am going to ask.', next: 'ask' },
      accept: { speaker: ORRIK, text: 'Good. I have been working up to the first step since autumn. Go ahead of me on the stair, and walk slowly. My knees are older than your kingdom.' },
      stair: { speaker: ORRIK, text: 'Go on, go on. I will be along. I have been along, at this pace, for a hundred and forty years.' },
      summit: {
        speaker: 'narrator',
        text: 'The Father on Watch Ridge is twice the height of the gate at Korrath: iron gone to rust, rust gone to grey stone. Its hands hang at its sides. Its face is turned to the south, and snow lies on its shoulders like a mantle. Orrik sits at its feet with his back against one great heel, getting his breath.',
        next: 'song',
      },
      song: {
        speaker: ORRIK, effects: [{ unlockLore: 'lore:the-rusting' }],
        text: '(He sings, low, in the Orrun tongue, and then again in yours, for your sake.) “And the heat went into them. And the iron of them went red. And they climbed back up the long stair, slower and slower, and came out upon the ridges, and stood in the wind with their faces to the south, and stopped.” …There. Now he knows who is speaking.',
        next: 'confess',
      },
      confess: {
        speaker: ORRIK, mood: 'sad',
        text: 'Father. I am Orrik, of Coalheart Deep, who kept the clan-ledger. When word came down the stair that two of the Nine had gone grenn, the Thane said: enter nothing. What is not written was never promised. So I wrote nothing. A whole season of nothing, with my best pen. And then a runesmith of Ironsong stood at the gate and said it aloud, in front of humans, and the Thane said: enter her name. Oath-breaker. So I did. It was the only thing I wrote that year that looked true. It was the lie.',
        next: 'stay',
      },
      stay: {
        speaker: ORRIK,
        text: '(He lays his hand on the Father’s heel, as one lays a hand on a sleeping horse.) I am not going down again, human. My knees went last winter and my hips are going now. Let me sit here with him till it takes the rest. It is a better place to stop than a ledger-hall.',
        choices: [
          { text: '“Then stay. I’ll keep you company a while.”', to: 'let-stay' },
          { text: '[Will 15] “Iron can’t forgive you. The living can. Say it again at the gate.”', to: 'persuaded', tag: 'persuade', check: { stat: 'will', dc: 15, failTo: 'refuse' } },
          { text: '[Warden] “A wall that hides its crack falls on the people behind it. Come down and show them the crack.”', to: 'persuaded', when: { classIs: 'class:warden' }, tag: 'class' },
          { text: '[Oathbound] “Confession without amends is only talk, clerk. Come and make amends.”', to: 'persuaded', when: { classIs: 'class:oathbound' }, tag: 'class' },
          { text: '“Grimma has something to say to you.”', to: 'grimma', when: { flag: 'companion.grimma-ironsong.following' } },
          { text: '“She already said it aloud at the gate, and it was heard. Go and stand beside it.”', to: 'persuaded', when: { flag: 'act1.nails_exposed' }, tag: 'persuade' },
        ],
      },
      grimma: {
        speaker: 'npc:grimma-ironsong', mood: 'angry',
        text: 'Orrik Coalheart. You wrote my name. I watched your pen do it. (A long breath.) And here you are, up a hill no Orrun climbs, telling it to a statue, because a statue cannot answer back. Come down, old man. Say it where I can hear it. Then we’ll see what I forgive.',
        next: 'persuaded',
      },
      refuse: {
        speaker: ORRIK,
        text: 'No. You are young. You think every word wants an audience. Some words want only to be said once, to the right ear, and then put down.',
        choices: [
          { text: '“Then stay. I’ll keep you company a while.”', to: 'let-stay' },
          { text: '“Think on it. I’ll come back.”', to: null, tag: 'leave' },
        ],
      },
      persuaded: {
        speaker: ORRIK, effects: [{ setFlag: 'side.ft.rust-pilgrim.choice', value: 'returned' }],
        text: '…Hm. (For a long while he looks up at the Father’s face.) He did not stop, you know. Not really. He walked up out of the fire with the heat in him and stood here so the rest of them could see which way was out. That is not stopping. That is keeping a door. Help me up, then. Slowly. If I fall, I fall like a millstone, and you are below me.',
      },
      'let-stay': {
        speaker: ORRIK, mood: 'sad', effects: [{ setFlag: 'side.ft.rust-pilgrim.choice', value: 'stayed' }],
        text: 'Korr nagh. (He shuts the ledger on his knees and folds his hands on it.) Go down before dark, human. Tell nobody. No. Tell whoever asks. I find I no longer mind.',
        next: 'let-stay2',
      },
      'let-stay2': { speaker: 'narrator', mood: 'sad', text: 'You sit with him until the light goes red along the ridges. When you leave he is humming the Hold-Song, very slowly, and the snow has begun to settle on his shoulders the way it settles on the Father’s, and does not melt.' },
      gate: {
        speaker: 'narrator', effects: [{ setFlag: 'side.ft.rust-pilgrim.spoke', value: true }],
        text: 'Orrik stands on the gate-steps of Dun Korrath with his ledger open in both hands, and waits until the gate-town notices. It takes a while. Then it is very quiet: smiths with their hammers lowered, Orrun factors at the Exchange door, a human carter holding his horse’s nose.',
        next: 'speech',
      },
      speech: {
        speaker: ORRIK,
        text: 'I am Orrik, of Coalheart Deep, ledger-clerk. I kept a season of empty pages at the Thane’s word, so that a thing that was true would never have been promised. And I wrote the name of Grimma Ironsong beside the word oath-breaker, for saying it. That is my hand. Here. (He holds the page up.) I enter it now: the clerk lied. Let the ledger carry it.',
        choices: [
          { text: 'Stand beside him on the step.', to: 'hedda', when: { flag: 'act1.nails_kept' }, effects: [{ reputation: 'faction:iron-concord', delta: -5 }] },
          { text: 'Stand beside him on the step.', to: 'hedda', when: { not: { flag: 'act1.nails_kept' } } },
        ],
      },
      hedda: {
        speaker: HEDDA,
        text: '(The Thane-Speaker has come out onto the threshold. She looks at the page for a long time.) Clerk. You will be summoned. (Then, more quietly, so the gate-town does not hear:) I will bring you a stool myself.',
      },
      after: { speaker: ORRIK, text: 'I have taken a stool at the Exchange. I write down what humans owe us, and what we owe them. Both columns. It is very restful. My knees have not got any better, but I find I do not mind them so much.' },
    },
  },
  {
    id: 'dialogue:side-ft-rust-pilgrim-hedda', name: 'Hedda: after the Rust Pilgrim',
    entries: [
      { when: is('side.ft.rust-pilgrim.choice', 'returned'), node: 'returned' },
      { node: 'stayed' },
    ],
    nodes: {
      returned: {
        speaker: HEDDA, effects: [{ setFlag: 'side.ft.rust-pilgrim.hedda_heard', value: true }],
        text: 'The Thane has had Orrik’s page read to him twice. He has not said what he will do. He has not had it cut out, either. In my office, human, that is what we call a great event.',
      },
      stayed: {
        speaker: HEDDA, mood: 'sad', effects: [{ setFlag: 'side.ft.rust-pilgrim.hedda_heard', value: true }],
        text: 'Old Orrik climbed to the Father. You went with him. (She does not ask what he said.) We will sing to two of them from the road this year, then. Korr nagh. Go carefully.',
      },
    },
  },

  // ===================== THE WRECKERS’ LANTERN =====================
  {
    id: 'dialogue:side-sc-wreckers-lantern-pike', name: 'Leofric Pike: The Wreckers’ Lantern',
    entries: [
      { when: { all: [at(WRECK, 'pike'), is('side.sc.wreckers-lantern.choice', 'hanged')] }, node: 'ret-hanged' },
      { when: { all: [at(WRECK, 'pike'), is('side.sc.wreckers-lantern.choice', 'spared')] }, node: 'ret-spared' },
      { when: { all: [at(WRECK, 'pike'), is('side.sc.wreckers-lantern.choice', 'lightkeepers')] }, node: 'ret-keepers' },
      { when: { questActive: WRECK }, node: 'going' },
      { when: { questCompleted: WRECK }, node: 'after' },
      { when: offer(WRECK), node: 'offer' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: PIKE, text: 'A captain without a ship is a man standing on a quay. Don’t mind me. I’m standing.' },
      offer: {
        speaker: PIKE, mood: 'angry',
        text: 'Thirty years a League captain and I never put a keel on the Gull Rocks. Then a clear night in Saela’s Moon, flat sea, and her light on Wrecker’s Point as plain as a church window, and I steered by it as my father did, and the Cormorant opened like a herring. Four men drowned. The light was low. I’d swear it on my mother. A cable’s length lower than it’s stood my whole life.',
        next: 'ask',
      },
      ask: {
        speaker: PIKE,
        text: 'The Exchange says I was drunk. The tide-priests say Saela was angry. I say somebody moved that lamp. Go up the point and look, and I’ll pay you what I have, which is less than I had.',
        choices: [
          { text: '“I’ll go and look.”', to: 'accept', effects: [{ startQuest: WRECK }] },
          { text: '[Intellect 15] “A shrine-lamp doesn’t walk by itself. Who goes up the point at night?”', to: 'who', tag: 'lore', once: true, check: { stat: 'intellect', dc: 15, failTo: 'who-fail' } },
          { text: '[Shade] “Wreckers. You know it as well as I do.”', to: 'shade', when: { classIs: 'class:shade' }, tag: 'class', once: true },
          { text: '“Not now.”', to: null, tag: 'leave' },
        ],
      },
      who: { speaker: PIKE, text: 'Nobody. That’s the trouble. Nobody but the tide-priests, and the gulls, and the hamlet under the point. Skerrow. Fifteen houses and a slip, iced in since midwinter. Poor as limpets.', next: 'ask' },
      'who-fail': { speaker: PIKE, text: 'If I knew who, I’d not be asking you, would I.', next: 'ask' },
      shade: { speaker: PIKE, mood: 'angry', text: 'I know it. I’ll not say it on the quay. You say “wreckers” in Brackhaven and every second man looks at his boots, because his grandfather was one. League law is the old law: a wrecker goes to the sea. I don’t much like the old law. I like it better than four men drowned.', next: 'ask' },
      accept: { speaker: PIKE, text: 'Wrecker’s Point is north of the harbour, past the Gull Steps. There’s a shrine-niche cut in the cliff where Saela’s lamp has always stood. Look at where it stands now.' },
      going: { speaker: PIKE, text: 'Find the lamp. Find the hand that moved it. I’ll be here. I’ve nowhere better.' },
      'ret-hanged': {
        speaker: PIKE, effects: [{ reputation: 'faction:salt-league', delta: 10 }, { giveGold: 60 }],
        text: 'She walked into Brackhaven on her own feet and gave herself to the harbour-watch. Didn’t weep. Asked them to see her children fed. League law. The sea gets her tomorrow at the ebb. (He holds out a purse.) Here. I thought I’d feel better than this.',
      },
      'ret-spared': {
        speaker: PIKE, mood: 'angry', effects: [{ reputation: 'faction:salt-league', delta: -5 }],
        text: 'The lamp’s back in its niche, you say, and nobody to answer for it. Four men, Ashmarked. Four. Get off my quay. …No. Wait. (A long breath.) Skerrow’s iced in and starving. I know it. Get off my quay anyway.',
      },
      'ret-keepers': {
        speaker: PIKE, effects: [{ reputation: 'faction:salt-league', delta: 5 }, { giveGold: 30 }],
        text: 'A wrecker, keeping the light. Paid in herring to keep it true. (He laughs, short, like a cough.) It’s mad. It’s what the third article says, if you squint: what’s taken from the sea belongs to them that take it, and they’ll take a wage now instead. I’ll put it to the Exchange. Wren Tallow will love it; it costs her nothing.',
      },
      after: { speaker: PIKE, text: 'The League’s found me a berth as mate on a salt-buss. Mate. At my age. I steer by the stars now, and I check them twice.' },
    },
  },
  {
    id: 'dialogue:obj-sc-wreckers-lantern', name: 'Object: the false light',
    entries: [
      { when: is('side.sc.wreckers-lantern.choice', 'lightkeepers'), node: 'kept' },
      { when: { flag: 'side.sc.wreckers-lantern.choice' }, node: 'restored' },
      { when: { flag: 'side.sc.wreckers-lantern.found' }, node: 'found' },
      { when: at(WRECK, 'headland'), node: 'find' },
      { node: 'niche' },
    ],
    nodes: {
      niche: { speaker: 'narrator', text: 'A shrine-niche cut into the cliff above the Gull Rocks, its back blackened by a thousand years of lamp-smoke. Salt has crusted the cupped hand carved over it.' },
      find: {
        speaker: 'narrator', effects: [{ setFlag: 'side.sc.wreckers-lantern.found', value: true }],
        text: 'Saela’s niche is empty. Below it, down a goat-path no priest would take, a lamp stands on a ledge behind a pane of scraped horn, hooded with tin on the landward side so that no one on the cliff-road would see it lit. From the sea it would look exactly like the shrine-light. A cable’s length low. The wick-tin is stamped with a boat-mark: a gull over three waves.',
        choices: [
          { text: 'Douse it.', to: 'doused' },
          { text: '[Intellect 15] Work out where it was aimed.', to: 'aim', tag: 'lore', check: { stat: 'intellect', dc: 15, failTo: 'aim-fail' } },
          { text: 'Leave it, for now.', to: null, tag: 'leave' },
        ],
      },
      doused: { speaker: 'narrator', text: 'You pinch the wick. Out at sea, nothing changes; there is no ship tonight. The gull-and-waves mark is Skerrow’s, the hamlet under the point. You can see its roofs from here, white with frost, and no smoke from any chimney.' },
      aim: { speaker: 'narrator', text: 'Line the low light up with the high niche, as a pilot would, and the course runs straight onto the inner Gull Rock, where the water breaks white even in a calm. Whoever set it knew the coast as well as any League pilot. Better. The tin bears Skerrow’s boat-mark.' },
      'aim-fail': { speaker: 'narrator', text: 'You squint out to sea and see only sea. The tin bears a boat-mark, though: a gull over three waves. Skerrow’s, by the look of it.' },
      found: { speaker: 'narrator', text: 'The false light sits dark on its ledge. Skerrow lies below, under the frost.' },
      restored: { speaker: 'narrator', text: 'The shrine-lamp stands in its niche again, where it has always stood. The ledge below is bare.' },
      kept: { speaker: 'narrator', text: 'Saela’s lamp burns true in its niche, trimmed and bright. Someone has scratched a gull over three waves beside it, very small, like a signature.' },
    },
  },
  {
    id: 'dialogue:side-sc-wreckers-lantern-edith', name: 'Edith Skerry: The Wreckers’ Lantern',
    entries: [
      { when: is('side.sc.wreckers-lantern.choice', 'lightkeepers'), node: 'after-keepers' },
      { when: is('side.sc.wreckers-lantern.choice', 'spared'), node: 'after-spared' },
      { when: at(WRECK, 'skerrow'), node: 'confront' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: EDITH, text: 'Skerrow’s iced in. We’ve nothing to sell you, and nothing to buy with.' },
      confront: {
        speaker: EDITH,
        text: 'You found the lamp. I can see it on you. Sit, then. There’s no fire to sit by, but sit. (She is a big, raw-handed woman with salt-sores at her wrists.) The cove froze at midwinter and hasn’t thawed. No boat out, no catch in. The Exchange bought our boat-debts in the autumn, cheap, and called them in at Lanternmass. Nobody buys herring from a cove that can’t land any.',
        next: 'tithe',
      },
      tithe: {
        speaker: EDITH, mood: 'angry',
        text: 'You know what they say on the quay. The tide takes its tithe from everyone. Well. It took ours. My man, last winter. Two boys off the slip this. So we took our tithe back. What’s taken from the sea belongs to the ship that takes it: that’s League law. We’re just the shore that takes it.',
        next: 'judge',
      },
      judge: {
        speaker: EDITH,
        text: 'There’s fourteen children in Skerrow, and they’ve eaten this winter, and I’d light the lamp again tomorrow. So. What are you going to do?',
        choices: [
          { text: '“How many ships?”', to: 'count', once: true },
          { text: '“Captain Pike will want names. I’ll give him yours.”', to: 'hang' },
          { text: '“Put Saela’s lamp back in its niche, and I never found Skerrow.”', to: 'spare' },
          { text: '[Silver-tongue] “The League needs a light on that point it can trust. Nobody knows it better than you. You could be paid to keep it.”', to: 'keepers', when: { dialogueTag: 'silver-tongue' }, tag: 'trait' },
          { text: '[Will 15] “Keep the true light, and I’ll make Pike pay you for it. Swear it, and I’ll stand behind you.”', to: 'keepers', tag: 'persuade', once: true, check: { stat: 'will', dc: 15, failTo: 'keepers-fail' } },
          { text: '[Shade] “A thief who can be bought is a thief who can be trusted. The League knows that better than anyone.”', to: 'keepers', when: { classIs: 'class:shade' }, tag: 'class' },
        ],
      },
      count: { speaker: EDITH, mood: 'sad', text: 'Three keels. Eleven men. I know every name. I lit them in, and then I went down on the shingle with the others and took what came ashore, and some of what came ashore was them. Don’t think I don’t know.', next: 'judge' },
      hang: {
        speaker: EDITH, mood: 'sad', effects: [{ setFlag: 'side.sc.wreckers-lantern.choice', value: 'hanged' }],
        text: 'Aye. I thought you might be that sort. Honest. (She stands, and takes her shawl from the peg.) I’ll walk to Brackhaven myself. I’ll not be dragged past my own door. Tell them it was me, only me. The rest just carried.',
      },
      spare: {
        speaker: EDITH, effects: [{ setFlag: 'side.sc.wreckers-lantern.choice', value: 'spared' }],
        text: 'You’d do that? (She looks at you a long while, as if weighing a catch.) Then I’ll carry it back up myself, tonight, and trim it, and set it right. And when the children are hungry again, I’ll remember your face. I don’t know yet if that’s a thanks or a warning.',
      },
      keepers: {
        speaker: EDITH, effects: [{ setFlag: 'side.sc.wreckers-lantern.choice', value: 'lightkeepers' }],
        text: 'Paid. To keep it true. (She laughs, and it turns into something else halfway.) My gran kept that light, before the League took the shrine-lamps for the priests. Aye. Aye, we’ll keep it. Tell your captain a gull over three waves on the lamp means Skerrow’s watching it, and if his ship comes in safe, he can send us a barrel.',
      },
      'keepers-fail': { speaker: EDITH, text: 'Pike? Pay a wrecker? You don’t know the League, love. They’d sooner pay the sea.', next: 'judge' },
      'after-keepers': { speaker: EDITH, mood: 'happy', text: 'First barrel came yesterday. Salt herring, League stamp. The children think it’s Lanternmass. I trimmed the lamp twice last night out of sheer spite.' },
      'after-spared': { speaker: EDITH, text: 'The lamp’s in its niche. I go up and look at it some nights, and I don’t touch it. Not yet.' },
    },
  },
  {
    id: 'dialogue:side-sc-wreckers-lantern-wren', name: 'Wren Tallow: after the Wreckers’ Lantern',
    entries: [
      { when: is('side.sc.wreckers-lantern.choice', 'hanged'), node: 'hanged' },
      { when: is('side.sc.wreckers-lantern.choice', 'spared'), node: 'spared' },
      { node: 'keepers' },
    ],
    nodes: {
      hanged: {
        speaker: WREN, mood: 'sad', effects: [{ setFlag: 'side.sc.wreckers-lantern.wren_heard', value: true }],
        text: 'Skerrow’s boat-debts are in my book. I’ve struck them through this morning. The dead can’t pay, and the living there have nothing. (She closes the ledger, gently.) It balances. I hate it when things balance like that.',
      },
      spared: {
        speaker: WREN, effects: [{ setFlag: 'side.sc.wreckers-lantern.wren_heard', value: true }],
        text: 'Leofric Pike has been in here shouting about you. Skerrow lit three keels onto the rocks, and you let them keep the lamp. (She dips her pen.) I’ve forgiven their boat-debts for the winter. Don’t tell the Admiral. And don’t think it makes me kind.',
      },
      keepers: {
        speaker: WREN, mood: 'happy', effects: [{ setFlag: 'side.sc.wreckers-lantern.wren_heard', value: true }],
        text: 'A wrecker, paid by the League to keep the light true. It’s the most League thing I’ve heard all winter. I’ve entered it as “harbour safety, sundry”. The Admiral laughed for a full minute.',
      },
    },
  },

  // ===================== SAELA’S TITHE =====================
  {
    id: 'dialogue:side-sc-saelas-tithe-elswyth', name: 'Mother Elswyth: Saela’s Tithe',
    entries: [
      { when: { all: [at(TITHE, 'farewell'), is('side.sc.saelas-tithe.choice', 'ebb')] }, node: 'fare-ebb' },
      { when: { all: [at(TITHE, 'farewell'), is('side.sc.saelas-tithe.choice', 'burned')] }, node: 'fare-burned' },
      { when: { all: [at(TITHE, 'deed'), is('side.sc.saelas-tithe.choice', 'ebb')] }, node: 'deed-ebb' },
      { when: { all: [at(TITHE, 'deed'), is('side.sc.saelas-tithe.choice', 'burned')] }, node: 'deed-burned' },
      { when: at(TITHE, 'counsel'), node: 'counsel' },
      { when: at(TITHE, 'ice'), node: 'ice' },
      { when: done(TITHE, 'side.sc.saelas-tithe.choice', 'ebb'), node: 'after-ebb' },
      { when: done(TITHE, 'side.sc.saelas-tithe.choice', 'burned'), node: 'after-burned' },
      { when: offer(TITHE), node: 'offer' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: ELS, text: 'Cold water and a Rime-word, for any keel that asks. Saela doesn’t mind what flag it flies.' },
      offer: {
        speaker: ELS,
        text: 'They’ll have told you on the quay that I’m a thief. (She is small and very old, wrapped in grey, with frost in her eyebrows that never quite melts.) I took double tithe this winter from every captain in Brackhaven, and the harbour still freezes every night. Both true. If you want to know what the money is for, go down to the harbour after dark. Lie on the ice. Put your ear to it.',
        choices: [
          { text: '“I’ll go and listen.”', to: 'accept', effects: [{ startQuest: TITHE }] },
          { text: '[Devout] “Saela doesn’t sell her favours, Mother.”', to: 'devout', when: { dialogueTag: 'devout' }, tag: 'trait', once: true },
          { text: '[Arcanist] “You’re a Rime mage. Couldn’t you keep the harbour open yourself?”', to: 'arcanist', when: { classIs: 'class:arcanist' }, tag: 'class', once: true },
          { text: '“Not tonight.”', to: null, tag: 'leave' },
        ],
      },
      devout: { speaker: ELS, text: 'No, child. She doesn’t. She has never asked a coin of anyone, living or dead. The tithe was never for her. It was for the people who keep her doors open. Go and listen, and you’ll see which door.', next: 'offer2' },
      arcanist: { speaker: ELS, text: 'Rime is the art of holding still, child. I could freeze that harbour to the bottom if I liked. I could not thaw it by a finger. It is the wrong art for this. Go and listen.', next: 'offer2' },
      offer2: {
        speaker: ELS, text: 'Well?',
        choices: [
          { text: '“I’ll go and listen.”', to: 'accept', effects: [{ startQuest: TITHE }] },
          { text: '“Not tonight.”', to: null, tag: 'leave' },
        ],
      },
      accept: { speaker: ELS, text: 'After dark, mind. And lie flat. Ice that will hold a man standing will hold a woman lying, and a fool kneeling. I’ve been all three on it.' },
      ice: { speaker: ELS, text: 'Not yet? The ice is at the foot of the quay, by the old mooring-posts. After dark. Lie flat. Listen.' },
      counsel: {
        speaker: ELS, mood: 'sad',
        text: 'You heard them. Forty-one. Fishers, a pilot, a boy off a herring-buss, the whole crew of the Kittiwake. This winter’s drowned. When the sea takes someone in Brackhaven, the old rite is that on the first ebb the harbour boom is let down, and the dead go out with the tide to meet her boat. The sea is only the River Under’s mouth, child. Every harbour is a door.',
        next: 'counsel2',
      },
      counsel2: {
        speaker: ELS,
        text: 'Since the Quench the League keeps the boom up all night, against corsairs and floe-ice and whatever else comes in on the dark. My tithe paid the chainman to let it down an hour at the ebb. At the turn of the year the League found out, changed the chainman, and put a lock on the winch. So they are still under there, waiting for a tide they cannot reach. And the ice is thickest over them.',
        choices: [
          { text: '“The River Under is frozen. Even if they go out, there may be no boat.”', to: 'frozen', once: true },
          { text: '“At the King-Barrows the river ran again, a little. It may run for them.”', to: 'river', when: { flag: 'act1.river_truth' }, once: true },
          { text: '“I’ll get the boom down at the ebb.”', to: 'ebb' },
          { text: '“They’re Restless. I can burn them out, where they lie.”', to: 'burn-warn' },
          { text: '“I need to think.”', to: null, tag: 'leave' },
        ],
      },
      frozen: { speaker: ELS, text: 'I know it. I’m not a fool. They may go out and find no boat. But the sea is wider than a harbour, and quieter, and I will not leave them knocking under the keels like something shut in a cellar. Out there they can wait in the open. Out there, she might find them.', next: 'counsel2' },
      river: { speaker: ELS, mood: 'happy', text: '…Did it. Did it, now. (She sits down on the shrine-step quite suddenly.) Then she’s trying. Saela’s trying. Then there’s a chance there’s a boat at the end of it.', next: 'counsel2' },
      'burn-warn': {
        speaker: ELS, mood: 'afraid',
        text: 'That isn’t a crossing. That’s an end. You’d not send them anywhere; you’d put them out, like candles, and the harbour would be warmer and the captains would cheer. (She is quiet a moment.) I can’t forbid you. If you do it, do it gently.',
        choices: [
          { text: '“I’ll burn them. It’s quicker, and it’s certain.”', to: 'burn' },
          { text: '“No. The boom, then.”', to: 'ebb' },
        ],
      },
      ebb: {
        speaker: ELS, effects: [{ setFlag: 'side.sc.saelas-tithe.choice', value: 'ebb' }],
        text: 'Saela keep you. The winch is out on the mole, at the harbour mouth. The lock is League iron. Go after midnight, when the ebb turns and the watch is at the brazier warming its hands.',
      },
      burn: {
        speaker: ELS, mood: 'sad', effects: [{ setFlag: 'side.sc.saelas-tithe.choice', value: 'burned' }],
        text: 'Then go down tonight. I’ll not watch. I’ll be up here, saying their names. Somebody should.',
      },
      'deed-ebb': { speaker: ELS, text: 'The winch on the mole. After midnight, on the ebb. Go.' },
      'deed-burned': { speaker: ELS, mood: 'sad', text: 'You’ve not done it yet. Good. No. Not good. Only… slow.' },
      'fare-ebb': {
        speaker: ELS, mood: 'happy', effects: [{ giveGold: 50 }],
        text: 'I heard them go. Did you? Like a lot of feet on a shingle beach, going down to the water, all together. The ice was thinner this morning by a finger. Here. Every copper of the tithe I could not spend. The captains can have it back from you, if they ask nicely.',
      },
      'fare-burned': {
        speaker: ELS, mood: 'sad',
        text: 'The harbour didn’t freeze last night. The captains are delighted. Two of them came up and paid me single tithe, to show there were no hard feelings. (She looks at the sea.) I’ll keep your name in my prayers. I don’t yet know what to ask for you.',
      },
      'after-ebb': { speaker: ELS, text: 'The League put a new lock on the winch. Somebody keeps tying white wool to it. I couldn’t possibly say who.' },
      'after-burned': { speaker: ELS, text: 'Cold water and a Rime-word, for any keel that asks. And a name, now and then, for any that don’t.' },
    },
  },
  {
    id: 'dialogue:obj-sc-tithe-ice', name: 'Object: the harbour ice',
    entries: [
      { when: { flag: 'side.sc.saelas-tithe.done' }, node: 'quiet' },
      { when: { all: [at(TITHE, 'deed'), is('side.sc.saelas-tithe.choice', 'burned')] }, node: 'burn' },
      { when: { all: [at(TITHE, 'deed'), is('side.sc.saelas-tithe.choice', 'ebb')] }, node: 'ebb-hint' },
      { when: at(TITHE, 'ice'), node: 'listen' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'narrator', text: 'Grey harbour ice, rotten at the edges where the morning tide has chewed it. It will be whole again by midnight.' },
      listen: {
        speaker: 'narrator', effects: [{ setFlag: 'side.sc.saelas-tithe.seen', value: true }],
        text: 'You wait on the quay until the last light goes. Then you lie down on the ice by the old mooring-posts, as Elswyth said, and put your ear to it. At first there is nothing but the creak of the hulls. Then: knocking. Not a hammer. Knuckles.',
        next: 'faces',
      },
      faces: {
        speaker: 'narrator', mood: 'afraid',
        text: 'A hand’s depth under your cheek, a face is looking up at you. Then another. The whole harbour floor is a crowd of them, pale and patient, as many as a congregation, knocking softly on the underside of the ice as if on a door they are too polite to break. One of them has a copper coin between his teeth.',
        choices: [
          { text: 'Get off the ice.', to: null },
          { text: '[Will 15] Lay your marked hand flat on the ice above them.', to: 'warm', check: { stat: 'will', dc: 15, failTo: 'cold' } },
        ],
      },
      warm: { speaker: 'narrator', text: 'The Ashmark warms, and the ice under your palm goes soft and clear as glass. Every face turns toward the warmth, as flowers turn. The knocking stops. They are not angry. They are waiting, and they think you might be what they are waiting for.' },
      cold: { speaker: 'narrator', mood: 'afraid', text: 'The cold comes up through your palm and into your teeth, and for a moment you are under the ice with them, looking up at a stranger lying on the roof of the world. You scramble back onto the quay. Something grey and wet is climbing out of a hole by the mooring-posts.' },
      'ebb-hint': { speaker: 'narrator', text: 'The faces under the ice are still waiting. Out on the mole, at the harbour mouth, the boom-winch stands locked against the sky.' },
      burn: {
        speaker: 'narrator', mood: 'sad', effects: [{ setFlag: 'side.sc.saelas-tithe.done', value: true }],
        text: 'You kneel and set your marked hand to the ice. Fire runs out under it the way fire runs under paper, a red line spreading through the grey. The faces do not cry out. One by one, as the warmth reaches them, they go out: not into the dark, but into nothing at all, the way breath goes off a window.',
        next: 'burn2',
      },
      burn2: { speaker: 'narrator', mood: 'sad', text: 'When it is done the harbour ice is thin and clear, and through it you can see the sand of the harbour floor, and a copper coin lying on it.' },
      quiet: { speaker: 'narrator', text: 'The harbour ice is thin tonight. Nothing knocks.' },
    },
  },
  {
    id: 'dialogue:obj-sc-harbour-boom', name: 'Object: the harbour boom',
    entries: [
      { when: { all: [{ flag: 'side.sc.saelas-tithe.done' }, is('side.sc.saelas-tithe.choice', 'ebb')] }, node: 'after' },
      { when: { all: [at(TITHE, 'deed'), is('side.sc.saelas-tithe.choice', 'ebb')] }, node: 'winch' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'narrator', text: 'The harbour boom: a chain of black iron, each link the size of a cartwheel hub, slung from the mole to the foot of the Gull Steps. Its winch is locked with League iron.' },
      winch: {
        speaker: 'narrator',
        text: 'Past midnight. The tide has turned, and you can feel the whole harbour leaning seaward against the boom like a crowd against a rope. At the far end of the mole the watch stand round their brazier with their backs to you.',
        choices: [
          { text: '[Finesse 15] Pick the League lock.', to: 'lower', check: { stat: 'finesse', dc: 15, failTo: 'noise' } },
          { text: '[Shade] Pick it the way the Quiet Hand taught you: slowly, and humming.', to: 'lower', when: { classIs: 'class:shade' }, tag: 'class' },
          { text: '[Might 15] Kick the pawl out of the ratchet and let the chain run.', to: 'lower', check: { stat: 'might', dc: 15, failTo: 'noise' } },
          { text: 'Come back later.', to: null, tag: 'leave' },
        ],
      },
      noise: {
        speaker: 'narrator', mood: 'afraid',
        text: 'Iron rings on iron, loud as a bell. At the brazier one of the watch turns, and comes down the mole with his lantern up: an old man, bow-legged, with a boat-hook. He looks at you, and at the winch, and at the harbour ice.',
        next: 'watchman',
      },
      watchman: {
        speaker: 'narrator',
        text: '“For the drowned, is it,” he says. It is not a question. “My brother’s under there. Off the Kittiwake.” He sets down the lantern, takes a key from his belt that he should not have, and opens the lock himself. “I never saw you,” he says. “I never saw him, neither. Go on.”',
        next: 'lower',
      },
      lower: {
        speaker: 'narrator', effects: [{ setFlag: 'side.sc.saelas-tithe.done', value: true }, { reputation: 'faction:salt-league', delta: -5 }],
        text: 'The chain runs out with a roar and goes down into the black water at the harbour mouth. The ice there groans and splits, and the ebb takes hold. Under the grey ice, all across the harbour, shapes begin to move seaward, slowly, like leaves along a gutter after rain. As the last of them passes under the mole, it lifts a hand.',
        next: 'lower2',
      },
      lower2: { speaker: 'narrator', text: 'Then there is only the tide going out, and the stars, and far off past the Gull Rocks, so faint you may have imagined it, the sound of oars.' },
      after: { speaker: 'narrator', text: 'The boom is up again, its winch locked with new League iron. Someone has tied a twist of white wool to the pawl.' },
    },
  },
];

export default dialogues;
