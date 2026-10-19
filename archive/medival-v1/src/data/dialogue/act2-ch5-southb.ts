/** Dialogue: Act II Chapter 5 (south), part b: quest:the-glass-throne (Zahrun, the Ash Road, Qadir), Vesper Qadri’s
 *  recruitment and companion scenes, and Samir at Zahrun. docs/lore/11-act2-spec.md. Owner: Claude 4.
 *  act2.ozrah_truth is set on the first revelation node of dialogue:ozrah-throne; every Vesper decision at the
 *  Ember of the Glass is recorded in act2.glass_vesper_choice the moment it is made. */
import type { DialogueChoice, DialogueDef, NarrativeEffect } from '@/core';

const QG = 'quest:the-glass-throne';
const f = (flag: string) => ({ flag });
const is = (flag: string, value: string) => ({ flag, op: '==' as const, value });
const at = (stage: string) => ({ questStage: QG, stage });
const set = (flag: string, value: boolean | string = true): NarrativeEffect => ({ setFlag: flag, value });
const VESPER = 'npc:vesper-qadri' as const;
const RUQAYA = 'npc:ruqaya-al-nar' as const;
const OZRAH = 'npc:ozrah' as const;
const following = f('companion.vesper-qadri.following');

const JOIN: NarrativeEffect[] = [{ companion: VESPER, following: true }, set('act2.vesper_joined'), { loyalty: VESPER, delta: 10 }];
/** The Ember of the Glass. Guarded by act2.ember_glass_claimed: the object’s entries route to 'empty' once it is set. */
const GLASS_CLAIM: NarrativeEffect[] = [
  set('act2.ember_glass_claimed'),
  { addFlag: 'world.embers_held', amount: 1 },
  { setFlag: 'ashmark.rank', value: 4 },
  { unlockLore: 'lore:the-seven-embers', section: 'glass' },
];
const glassChoice = (v: string): NarrativeEffect => set('act2.glass_vesper_choice', v);

const OFFER_CHOICES: DialogueChoice[] = [
  { text: '“Come, then.”', to: 'joined', effects: JOIN },
  { text: '“What do you want from me?”', to: 'want', once: true },
  { text: '[Oathbound] “I wear the Lantern. You would walk beside it?”', to: 'oath', once: true, when: { classIs: 'class:oathbound' }, tag: 'class' },
  { text: '[Reaver] “I burn my own blood for fire. Does that frighten you?”', to: 'reaver', once: true, when: { classIs: 'class:reaver' }, tag: 'class' },
  { text: '“Not now.”', to: 'notnow', tag: 'leave' },
];

const dialogues: DialogueDef[] = [
  // ----- Vesper: recruitment (after the auction, or at the Creed’s camp) and companion talk
  {
    id: 'dialogue:ch5s-vesper-general', name: 'Vesper: The Red Abbess',
    entries: [
      { when: f('act2.vesper_betrayed'), node: 'chains' },
      { when: f('act2.vesper_left'), node: 'left' },
      { when: following, node: 'companion' },
      { when: f('act2.vesper_joined'), node: 'waiting' },
      { when: { all: [f('npc.vesper-qadri.met'), f('act2.ember_tide_claimed')] }, node: 'offer-tide' },
      { when: { all: [f('npc.vesper-qadri.met'), { questActive: 'quest:the-ember-auction' }, f('act2.auction_outcome')] }, node: 'tonight' },
      { when: f('npc.vesper-qadri.met'), node: 'offer' },
      { node: 'meet' },
    ],
    nodes: {
      chains: { speaker: 'narrator', text: 'She is not here. The Wick took her to Valcastre in chains.' },
      tonight: { speaker: VESPER, text: 'Kestrel’s star is still in its cage, and I can’t think about anything else while it hums. Ask me again when it’s gone somewhere.' },
      meet: { speaker: 'narrator', text: 'The Ashen Creed’s camp is a ring of black tents pitched inside the shell of a glass-domed bathhouse on the edge of Qadir. By a fire that burns with no fuel, a Qasiri woman in a burnt-red habit is reading a breviary. Her head is shaved, and ash-scars run in neat lines from her temples to her jaw. When she looks up, her eyes catch the firelight and keep it.', next: 'meet2' },
      meet2: {
        speaker: VESPER, effects: [set('npc.vesper-qadri.met'), { unlockLore: 'lore:vesper-qadri' }, { unlockLore: 'lore:the-red-abbess' }],
        text: 'You’re the one with the hand. I wondered when you would come; everyone with that mark ends up in the Wastes in the end. Vesper Qadri. The Church calls me the Red Abbess. Sit, if you like. The fire won’t bite unless I ask it to.',
        next: 'offer',
      },
      offer: {
        speaker: VESPER,
        text: 'I’ll be plain, because the desert makes liars of everyone who isn’t. The Glass Ember is in the throne-hall of Qadir, with an Ashwyrm asleep on it. The Creed has camped here thirty years, waiting for a fire that belongs to no Church. I can’t take it alone. Neither can you, I think. Let me come with you.',
        choices: OFFER_CHOICES,
      },
      'offer-tide': {
        speaker: VESPER,
        text: 'So. It is in you now. I watched you take it out of Kestrel’s cage, and I kept waiting to feel robbed, and I didn’t. (She sits down on an upturned crate.) The Creed can go on without me for a while; it is very good at that. I want to see what you do with the Embers. If you mean to give them back to a Church, I want to be there to argue. Let me come with you.',
        choices: OFFER_CHOICES,
      },
      ask: { speaker: VESPER, text: 'Well?', choices: OFFER_CHOICES },
      want: { speaker: VESPER, text: 'To see what you do with them. And if you don’t mean to hand them to a Church, you will need someone who can set a fire without asking permission. That is the whole of my usefulness. It is quite a lot.', next: 'ask' },
      oath: { speaker: VESPER, text: 'I walked beside it for eleven years. I can manage a few more weeks. Only don’t try to trim me.', next: 'ask' },
      reaver: { speaker: VESPER, mood: 'sad', effects: [{ loyalty: VESPER, delta: 5 }], text: '(She looks at the burn-lines on your wrists for a long time.) No. It makes me sad. The Church would hang you for it and the Choir would love you for it, and neither of them would ever ask why you had to.', next: 'ask' },
      joined: { speaker: VESPER, mood: 'happy', text: 'Good. I’ll warn you now: I pray at night, I snore, and I set fire to things when I am frightened. Two of those you’ll grow used to.' },
      notnow: { speaker: VESPER, text: 'Then I shall be at the Creed’s camp in the Wastes, by the gates of Qadir. The fire isn’t going anywhere, and neither, for the moment, am I.' },
      companion: {
        speaker: VESPER, text: 'Still here. Still burning. What do you need?',
        choices: [
          { text: '“Tell me about the Lamp-house.”', to: 'lamp', once: true },
          { text: '“What will you do, when this is over?”', to: 'over', once: true },
          { text: '“What Ozrah said. Does it change things for you?”', to: 'ozrah', once: true, when: f('act2.ozrah_truth') },
          { text: '“Wait for me at the Creed’s camp.”', to: 'dismiss', effects: [{ companion: VESPER, following: false }] },
          { text: '“Nothing. Walk on.”', to: null, tag: 'leave' },
        ],
      },
      lamp: { speaker: VESPER, text: 'Valcastre. Cold stone, warm lamps. We trimmed the wicks at the third bell and sang the Canticle of the Anvil at the sixth. I was very good at the high part. (She hums two notes, and stops.) I still know every word. I can’t sing it any more. It isn’t mine.', next: 'companion' },
      over: { speaker: VESPER, text: 'Sleep for a week. Then go back to Valcastre with three hundred hedge-witches, light every lamp in the Lamp-house without a licence, and see what the Prior says. (Softer.) And then, perhaps, sing.', next: 'companion' },
      ozrah: { speaker: VESPER, mood: 'sad', text: 'It changes everything. For sixteen hundred years my people have said his name like a curse. My mother spat when she said it. And he was trying to save us. (She looks at her hands.) I want to be angry at someone. There isn’t anyone left.', next: 'companion' },
      dismiss: { speaker: VESPER, text: 'As you like. I’ll keep the fire.' },
      waiting: {
        speaker: VESPER, mood: 'happy', text: 'Need me again? I knew you would. Nobody else sets fire to things on request.',
        choices: [
          { text: '“Come with me.”', to: 'rejoin', effects: [{ companion: VESPER, following: true }] },
          { text: '“Not yet.”', to: null, tag: 'leave' },
        ],
      },
      rejoin: { speaker: VESPER, text: 'Good. My feet were getting cold, and in the Wastes that takes some doing.' },
      left: { speaker: VESPER, mood: 'sad', text: 'You told me no, in Qadir. You were probably right. That’s the worst of it. (She does not look up from the fire.) Go on. I’m not following anyone just now.' },
    },
  },
  // ----- Samir at Zahrun
  {
    id: 'dialogue:ch5s-samir-zahrun', name: 'Samir: Zahrun',
    entries: [
      { when: f('act2.samir_promise_broken'), node: 'broken' },
      { when: f('npc.ruqaya-al-nar.told'), node: 'truth' },
      { when: f('act2.samir_promise'), node: 'kin' },
      { node: 'host' },
    ],
    nodes: {
      host: { speaker: 'npc:samir-ibn-ruqaya', text: 'Peace on your road. Zahrun turns nobody away who comes in peace. My mother’s tent is the one with the brass lamp. You cannot miss it; many have tried.' },
      kin: { speaker: 'npc:samir-ibn-ruqaya', mood: 'happy', text: 'Salt-kin! Peace on your road. My mother is waiting for you. She says she has been waiting since before you were born, though she says that of everyone. And the vow holds, Mark-bearer. I can see it on you, like a lamp.' },
      broken: { speaker: 'npc:samir-ibn-ruqaya', mood: 'sad', text: 'You let the Red Abbess hold it. A night in the hands of the Creed, and you had sworn on salt. (He does not raise his voice.) I will not call you oath-breaker in my mother’s city. But I will not eat with you again.' },
      truth: { speaker: 'npc:samir-ibn-ruqaya', mood: 'sad', text: 'My mother told us what the king said. She lit the lamp. I have never seen it lit. (He touches the glass beads in his beard.) I was taught to spit after his name. I do not know what I am meant to do now. Perhaps learn it again, properly.' },
    },
  },
  // ----- Ruqaya al-Nar: the salt and the road
  {
    id: 'dialogue:ch5s-ruqaya-salt', name: 'The Cindermother: Salt and the road',
    entries: [{ when: f('act2.ashroad_known'), node: 'again' }, { node: 'tent' }],
    nodes: {
      again: { speaker: RUQAYA, text: 'The cairns of glass, child of the coal. East, where the sand turns black. Go with water.' },
      tent: { speaker: 'narrator', text: 'The Cindermother’s tent is the largest in Zahrun and the darkest inside. A brass lamp hangs from the ridge-pole, unlit. Beneath it on cushions sits a very old woman whose face is a map of ash-scars, so many and so fine they look like lace. Her eyes are milk-white. She is smiling at the exact place where you stand.', next: 'ruqaya' },
      ruqaya: {
        speaker: RUQAYA, effects: [{ unlockLore: 'lore:ruqaya-al-nar' }],
        text: 'There you are. I saw you in the smoke while my son was still at sea, and in the smoke before that, when you were a child asleep in a village of sheep. You were always carrying a coal. Come in out of the sun, child of the coal. Sit.',
        choices: [
          { text: '[Sit]', to: 'salt' },
          { text: '[Outlander] Sit, touch your heart, and wait to be offered salt.', to: 'salt', when: { dialogueTag: 'outlander' }, tag: 'trait', effects: [{ reputation: 'faction:qasiri', delta: 5 }] },
          { text: '“Your son and I have shared salt.”', to: 'kin', once: true, when: f('npc.samir-ibn-ruqaya.salt_shared') },
          { text: '“I’ve come for the road to Qadir.”', to: 'blunt', once: true },
        ],
      },
      blunt: { speaker: RUQAYA, text: 'Of course you have. Everyone comes for it in the end, and most of them are dead. You will have it. But in the Sunscar a road is a gift, and a gift is given to a guest, and a guest has eaten. Sit.', next: 'salt' },
      kin: { speaker: RUQAYA, mood: 'happy', effects: [{ reputation: 'faction:qasiri', delta: 10 }], text: 'I know. He wrote to me by pigeon, which he hates; they bite him. Then you are kin of the tent already, and my salt is only a second helping. Sit, sit.', next: 'salt' },
      salt: { speaker: 'narrator', text: 'A girl brings a copper plate: flatbread, a dish of grey salt from the Zahrun pans, a cup of water so cold it mists. The Cindermother breaks the bread with fingers that never hesitate, salts it, and holds it out on her open palm.', next: 'salt2' },
      salt2: {
        speaker: RUQAYA,
        text: 'Salt shared is a vow. While it is in you, you are my guest, and no Qasiri blade will be drawn on you under any sky; and you in turn will do my people no harm. It is a very old law. It is older than Qadir. It is the only thing in the Sunscar that Qadir did not burn.',
        choices: [
          { text: '[Eat]', to: 'eat', effects: [set('act2.salt_shared'), { reputation: 'faction:qasiri', delta: 5 }, { unlockLore: 'lore:qasiri-salt-law' }] },
          { text: '[Devout] Say the hearth-blessing over the bread, then eat.', to: 'blessing', when: { dialogueTag: 'devout' }, tag: 'trait', effects: [set('act2.salt_shared'), { reputation: 'faction:qasiri', delta: 5 }, { unlockLore: 'lore:qasiri-salt-law' }] },
          { text: '“I can’t make a vow I may have to break.”', to: 'refuse' },
        ],
      },
      blessing: { speaker: RUQAYA, mood: 'happy', text: 'Hearth and kin. My grandmother said it in just that way, in a tongue nobody speaks any more.', next: 'eat' },
      eat: { speaker: 'narrator', text: 'The bread is hard and the salt is sharp, and the water hurts your teeth. The old woman listens to you eat as though it were music.', next: 'road' },
      refuse: { speaker: RUQAYA, text: '(She sets the bread down, quite unoffended.) That is the most honest thing a northerner has said in this tent in forty years. Then you are not my guest, and I shall tell you the road as one tells it to a stranger: with fewer kindnesses, and no promise that you will come back.', next: 'road' },
      road: {
        speaker: RUQAYA, effects: [set('act2.ashroad_known'), { unlockLore: 'lore:the-ash-road' }],
        text: 'Listen, then. East of Zahrun the sand turns black. Follow the cairns of glass, one every mile; every one was set by a Qasiri who did not come back. Where the cairns end the road is paved with fused ash, and it will burn your feet through your boots. At its end are the gates of Qadir, and the throne-hall, and on the throne a king who has not slept for sixteen hundred years.',
        choices: [
          { text: '“Ozrah.”', to: 'name' },
          { text: '“What do you see for me there?”', to: 'see' },
        ],
      },
      name: { speaker: RUQAYA, mood: 'sad', effects: [{ unlockLore: 'lore:burning-of-qadir' }], text: '(Every Qasiri in the tent spits, softly, at the floor. The Cindermother does not.) Yes. We teach our children his name before their own, so that they will never give it to a son. He drank the fire of the world, and the world burned: that is the story, and I have told it ten thousand times. (She tilts her head.) Lately the smoke has been telling me it is the wrong story. I do not know the right one. You will.', next: 'see' },
      see: { speaker: RUQAYA, text: 'I see a wyrm asleep on a coal, and a crown of glass on a head of ash. I see you weeping, and I cannot tell for whom. I see a woman with red eyes reaching for your hand, and I cannot see whether you take it. The smoke is never kind enough to finish its sentences.', next: 'farewell' },
      farewell: { speaker: RUQAYA, text: 'Go with water, child of the coal. And when you come back, come to this tent first, and tell me what the king said. I am old. I should like to know, before I die, whether I have been telling the story wrong.' },
    },
  },
  // ----- Ruqaya: general (the king’s testimony brought home)
  {
    id: 'dialogue:ch5s-ruqaya-general', name: 'The Cindermother: General',
    entries: [
      { when: f('npc.ruqaya-al-nar.told'), node: 'lit' },
      { when: f('act2.ozrah_truth'), node: 'truth' },
      { when: f('act2.ashroad_known'), node: 'road' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: RUQAYA, text: 'Sit, child of the coal. The smoke is quiet today.' },
      road: { speaker: RUQAYA, text: 'East, where the sand turns black. Follow the cairns. Go with water.' },
      truth: {
        speaker: 'narrator', text: 'The Cindermother is sitting exactly where you left her, under the unlit lamp. “Well?” she says, before you have said a word. “Tell me what the king said.”',
        choices: [
          { text: 'Tell her everything.', to: 'tell', effects: [set('npc.ruqaya-al-nar.told'), { reputation: 'faction:qasiri', delta: 10 }] },
          { text: '“Not yet.”', to: null, tag: 'leave' },
        ],
      },
      tell: { speaker: 'narrator', text: 'You tell her: the dying fire, the Ashen Kings at their wells, the nexus the Heart would not take back, the king on his throne holding the wound shut for sixteen hundred years. Halfway through, the women at the back of the tent stop spinning. At the end nobody says anything for a long time.', next: 'tell2' },
      tell2: { speaker: RUQAYA, mood: 'sad', text: 'Sixteen hundred years. (She reaches up and, for the first time in your sight, lights the brass lamp with one touch of her finger. It burns small and gold.) We carried the shame of a thief. We should have carried the grief of a family that lost a child down a well. It is a different weight. It is lighter. I did not expect that.', next: 'tell3' },
      tell3: { speaker: RUQAYA, text: 'I will tell my son, and the caravans. It is my story to have told wrong; I shall tell it right. Go with water, child of the coal. You have brought me something I did not know I was waiting for.' },
      lit: { speaker: RUQAYA, text: 'The lamp is lit. The children are learning a different story. Some of them do not like it; children prefer villains. Sit, child of the coal.' },
    },
  },
  // ----- The gates of Qadir
  {
    id: 'dialogue:ch5s-qadir-gates', name: 'The gates of Qadir',
    entries: [{ node: 'gates' }],
    nodes: {
      gates: {
        speaker: 'narrator',
        text: 'The Ash Road ends at a wall of black glass a hundred feet high, cracked like a dropped plate. The gates of Qadir stand open. They were glass too, and they melted where they stood: two long tongues poured out onto the road and frozen in mid-flow. Beyond them is a city of glass towers, every one leaning away from the same point at its heart, like grass in a wind that blew sixteen centuries ago and never stopped.',
        choices: [
          { text: '[Vesper] Look at her.', to: 'vesper', when: following },
          { text: 'Go in.', to: null },
        ],
      },
      vesper: { speaker: VESPER, mood: 'sad', text: 'Every Qasiri child dreams this gate. We wake with ash in our mouths. (She lays her palm on the glass, and draws it back.) It’s still warm. After all this time, it is still warm.' },
    },
  },
  // ----- Ozrah the Unsleeping: the testimony
  {
    id: 'dialogue:ozrah-throne', name: 'Ozrah: The testimony of the glass throne',
    entries: [{ when: f('act2.ozrah_truth'), node: 'return' }, { node: 'rise' }],
    nodes: {
      rise: { speaker: 'narrator', text: 'The Ashwyrm’s body is cooling, ticking like a hearth at night. Beyond it, at the heart of the throne-hall where all the towers lean, a throne of black glass stands on a dais of fused stone. Someone is sitting on it. He is made of ash held together by nothing at all, and he wears a circlet of clear glass. When he lifts his head, the ash of the whole hall stirs.', next: 'speak' },
      speak: {
        speaker: OZRAH,
        text: 'You have killed my wyrm. She was the last of them, and very old, and she was only keeping the coal warm. No matter. I have outlived everything else; I shall outlive her. (His voice is dry and enormous, like a fire heard from the next room.) Kneel or do not. I have been knelt to by better and spat at by more. You carry coals of the world’s heart in your hand, warden, and you have come for the last of mine. Stand at my feet, and I will tell you why.',
        choices: [
          { text: '“You’re Ozrah. The king who burned Qadir.”', to: 'burned' },
          { text: '[Kneel]', to: 'kneel' },
          { text: '[Scholar] “The histories say you drew a whole ley-nexus to make yourself undying.”', to: 'burned', when: { dialogueTag: 'scholar' }, tag: 'trait' },
          { text: '[Reaver] “You burned a land for power. I know that hunger.”', to: 'reaver', when: { classIs: 'class:reaver' }, tag: 'class' },
        ],
      },
      kneel: { speaker: OZRAH, text: '(The ash of his face moves in something like surprise.) Courtesy. In my hall, after all this time. Stand up, warden. I have not been a king in any way that matters for longer than your Church has had a name.', next: 'burned' },
      reaver: { speaker: OZRAH, text: 'Do you? Then you know nothing yet. Hunger is for the self. What I did was not hunger.', next: 'burned' },
      burned: {
        speaker: OZRAH,
        effects: [set('act2.ozrah_truth'), { unlockLore: 'lore:ozrah-the-unsleeping' }, { unlockLore: 'lore:the-ashen-kings' }],
        text: 'That is the story. That I drank the leys like a drunkard at a well, to live for ever. Hear the truth, then, from the one mouth left that knows it. (The hall goes very still.) The Heartfire is dying. It has always been dying. It was dying on the day your smith-god lay down and gave it up. A coal pulled from a dead chest does not burn for ever. It only burns for a long time.',
        next: 'kings',
      },
      kings: { speaker: OZRAH, text: 'We saw it first, we Ashen Kings. We were the first to drink from the leys, so we were the first to taste them thinning. My grandmother’s grandmother measured the warmth of the wells of Qadir and wrote it on glass, every year for two hundred years, and every year it was less.', next: 'save' },
      save: {
        speaker: OZRAH,
        text: 'So we did what any household does when the hearth is failing in midwinter. We gathered the warmth. Every well in Qadir, every ley under the Sunscar, drawn up into one great nexus beneath this throne. Not to keep. To give back. We meant to pour it down into the Heart all at once and bank it, as your grandmothers bank a fire at night so that it lives till morning.',
        choices: [
          { text: '“You were trying to save it.”', to: 'yes' },
          { text: '“What went wrong?”', to: 'wrong' },
          { text: '[Arcanist] “Ember can’t be pushed back down a ley. It only flows one way.”', to: 'oneway', when: { classIs: 'class:arcanist' }, tag: 'class' },
        ],
      },
      yes: { speaker: OZRAH, text: 'We were trying to save it. Thieves, they call us. Ash-drinkers. Children in the Sunscar spit after my name. (A sound like a log settling in a grate.) We were children blowing on a coal. That is all we ever were.', next: 'wrong' },
      oneway: { speaker: OZRAH, text: 'Yes. You know it now, because we taught it to you, in the worst way anything has ever been taught. We did not know it then. We were the first. The first to do anything always pays for the lesson.', next: 'wrong' },
      wrong: { speaker: OZRAH, text: 'The Heart would not take it back. A dying thing cannot be fed on its own blood. The fire we had gathered had nowhere to go, and so it came up instead of down: through the wells, through the streets, through my people. Qadir burned in a night. The sky burned for a year.', next: 'hold' },
      hold: {
        speaker: OZRAH,
        text: 'I was on this throne, at the heart of the nexus, when it turned. I could not stop it. I could only hold it. I took the wound into myself and closed my hands over it, so that the fire would burn Qadir and not the whole of the south. I have held it closed for sixteen hundred years. That is why they call me Unsleeping. If I slept, I would let go.',
        choices: [
          { text: '“The Qasiri think you are a monster.”', to: 'monster' },
          { text: '[Devout] “Which of the gods let this happen?”', to: 'gods', when: { dialogueTag: 'devout' }, tag: 'trait' },
          { text: '[Oathbound] “The Lanternate built its whole law on your crime.”', to: 'law', when: { classIs: 'class:oathbound' }, tag: 'class' },
          { text: '“Why tell me?”', to: 'why' },
        ],
      },
      monster: { speaker: OZRAH, mood: 'sad', text: 'Let them. A monster is a lighter thing to carry than a failure. My children’s children have walked the Sunscar for sixteen centuries ashamed of a theft, and I could not reach them to say it was only grief. (He is quiet.) Tell them, if you will. Tell the old woman in the tent with the lamp. She has listened for me in the smoke these sixty years. I have heard her listening.', next: 'why' },
      gods: { speaker: OZRAH, text: 'None let it. None stopped it. The Sparks are the smith’s children too, and children cannot rekindle a dead father. I prayed to Ashvar on this throne for a year while the sky burned. She wept. It was all she could do.', next: 'why' },
      law: { speaker: OZRAH, text: 'Of course it did. Your licences, your Wick, your Brand in its cathedral: all of it says never again, never the leys, never the Heart. It is a wise law built on a lie. The lie is that the Heart would burn for ever, if only men would leave it be.', next: 'why' },
      why: { speaker: OZRAH, text: 'Because you carry the Embers, and someone will tell you that you can save the Heart by giving them back to it. Someone else will tell you it is kinder to let it die. Hear a king who tried the first. The Heart cannot be fed. It can only be let die, or be made into something new. I do not know how the second is done. I was not wise enough. Perhaps you will be.', next: 'sea' },
      sea: {
        speaker: OZRAH,
        text: 'Hear this also. At the end, when the fire was coming up through the floor, the sea under the world spoke to me. It was very gentle. It said it would take the burning away, if only I would let go of the wound and come down into the water. Everyone would sleep, it said, and nobody would hurt. (The glass circlet catches the light.) I did not believe it. I have had sixteen hundred years to wonder whether I was right.',
        choices: [
          { text: '“The Pale Saint believes it.”', to: 'ysolde' },
          { text: '“You were right.”', to: 'right' },
          { text: '“What happens to you, once I take the Ember?”', to: 'gone' },
        ],
      },
      ysolde: { speaker: OZRAH, text: 'Then she has seen what I saw, and heard what I heard, and chosen the other way. I do not hate her for it. I only know the sea was too kind. Nothing that has waited as long as the sea is ever that kind.', next: 'gone' },
      right: { speaker: OZRAH, text: 'Perhaps. It is a comfort, from a stranger. I shall take it with me.', next: 'gone' },
      gone: { speaker: OZRAH, text: 'Your Ember is the last coal of my nexus, the last warmth I am holding shut. When you take it there will be nothing left in the wound to hold, and I may let go at last. (He lifts the circlet of glass from his head of ash and sets it on the arm of the throne.) I was crowned in that to hold the fire of a city. For a long while it has held nothing but my grief. When I am gone, take it. Let it hold something better.', next: 'last' },
      last: { speaker: OZRAH, text: 'Go to the coal, warden. And if one day you sit where I sat, as I think you may: do not hold on so long.' },
      return: {
        speaker: OZRAH, text: 'You are still here. Ask, then. I have nothing left but time, and not much of that.',
        choices: [
          { text: '“Tell me again. The Heart is dying?”', to: 'burned' },
          { text: '“What did the sea promise you?”', to: 'sea' },
          { text: '“Nothing. Rest, king.”', to: null, tag: 'leave' },
        ],
      },
    },
  },
  // ----- The Ember of the Glass (and Vesper’s want)
  {
    id: 'dialogue:obj-ember-of-the-glass', name: 'Object: The Ember of the Glass',
    entries: [
      { when: f('act2.ember_glass_claimed'), node: 'empty' },
      { when: { all: [at('ember'), is('act2.glass_vesper_choice', 'night')] }, node: 'dawn' },
      { when: { all: [at('ember'), following, { not: f('act2.glass_vesper_choice') }] }, node: 'vesper' },
      { when: at('ember'), node: 'coal' },
      { when: at('ozrah'), node: 'king' },
      { node: 'sleep' },
    ],
    nodes: {
      sleep: { speaker: 'narrator', text: 'Behind the throne, in a socket of black glass, something burns the colour of a desert noon. Between you and it, something enormous is asleep.' },
      king: { speaker: 'narrator', text: 'The ghost on the throne lifts one hand of ash, and the coal behind him dims, as if it too were listening. Hear the king first.' },
      empty: { speaker: 'narrator', text: 'The socket behind the throne is dark. The towers of Qadir still lean, but now they lean towards nothing.' },
      coal: {
        speaker: 'narrator', text: 'Behind the throne, in a socket of black glass, the Ember of the Glass burns the colour of a desert noon. The air above it shimmers. Every leaning tower in Qadir leans towards it.',
        choices: [
          { text: 'Take the Ember.', to: 'claim' },
          { text: 'Not yet.', to: null, tag: 'leave' },
        ],
      },
      vesper: { speaker: 'narrator', text: 'You reach for the Ember, and Vesper’s hand closes on your wrist. Her hand is very hot.', next: 'vesper2' },
      vesper2: {
        speaker: VESPER, mood: 'afraid',
        text: 'Wait. Please. Only wait. (Her eyes have gone pure gold, and they are wet.) Thirty years the Creed has camped outside those gates. My mother died on the Ash Road trying to reach this hall. This is the one Ember that ought to belong to no Church, and you are going to close your hand on it and carry it off like all the rest. Let the Creed have it. Let me have it. I would guard it with my life. You know I would.',
        choices: [
          { text: '“We carry it together. Your hand on it with mine, every step of the way.”', to: 'share', effects: [glassChoice('share'), set('act2.vesper_trust'), { loyalty: VESPER, delta: 20 }] },
          { text: '[Samir’s vow] “I swore on salt that no one would use this Ember. Not the Church, not the Creed. Not me.”', to: 'vow', when: f('act2.samir_promise'), effects: [glassChoice('refuse'), { loyalty: VESPER, delta: 5 }] },
          { text: '“No. It comes with me.”', to: 'refuse', check: { stat: 'will', dc: 15, failTo: 'leaves' } },
          { text: '“Hold it tonight. Only tonight. Give it back to me at dawn.”', to: 'night', when: { not: f('act2.samir_promise') }, effects: [glassChoice('night'), set('act2.vesper_held_glass'), { reputation: 'faction:ashen-creed', delta: 20 }, { loyalty: VESPER, delta: 10 }] },
          {
            text: '“Hold it tonight. Only tonight. Give it back to me at dawn.” (You swore to Samir on salt.)', to: 'night', when: f('act2.samir_promise'),
            effects: [
              glassChoice('night'), set('act2.vesper_held_glass'), set('act2.samir_promise_broken'),
              { reputation: 'faction:ashen-creed', delta: 20 }, { reputation: 'faction:qasiri', delta: -15 }, { loyalty: VESPER, delta: 10 },
            ],
          },
        ],
      },
      share: { speaker: VESPER, mood: 'sad', text: '(She stares at you. Then, slowly, she takes her hand from your wrist and lays it over yours instead, on the coal.) Together. All right. Together. (Her voice cracks on it.) Nobody ever offered me that. The Church offered me obedience and the Creed offered me a war. Nobody ever simply… offered.', next: 'claim' },
      vow: { speaker: VESPER, text: '(Her hand goes still.) On salt. (She lets go, very slowly.) My mother would have boxed my ears for touching it after that. You don’t argue with salt. Not in the Sunscar; not anywhere. (A wet laugh.) Take it. I’m not going anywhere.', next: 'claim' },
      refuse: { speaker: VESPER, effects: [glassChoice('refuse')], text: '(For a long moment the heat of her hand grows worse. Then it goes out.) …You’re right. I hate that you’re right. If I took it I would be the Ashen Kings all over again, telling myself it was for everyone. (She lets go.) Take it. I’ll stay. Don’t make me sorry.', next: 'claim' },
      leaves: {
        speaker: VESPER, mood: 'angry',
        effects: [glassChoice('left'), set('act2.vesper_left'), { companion: VESPER, following: false }, { loyalty: VESPER, delta: -30 }],
        text: '(She lets go of your wrist as if it had burned her, which perhaps it did.) Then you are the Church after all, only with a kinder face. (She steps back, and back again, into the ash.) Take it, then. Take them all. I hope they are heavy. I am going back to my own people.',
        next: 'leaves2',
      },
      leaves2: { speaker: 'narrator', text: 'She walks out of the throne-hall without looking back. Her footprints in the ash go on smoking long after she has gone.', next: 'claim' },
      night: { speaker: VESPER, text: '(She takes the coal into her two bare hands, and it does not burn her. For a moment, in its light, she looks like a girl of nine.) Thank you. I’ll give it back. I swear on the Seven Lights, on my mother, on whatever you like. One night. I only want to know what it is like, to hold the fire and not be afraid.', next: 'nightfall' },
      nightfall: { speaker: 'narrator', text: 'You make camp in the throne-hall. Vesper sits up all night by the throne with the Ember in her lap, not sleeping, and once, very quietly, you hear her singing the high part of the Canticle of the Anvil.', next: 'dawn' },
      dawn: { speaker: VESPER, text: '(At dawn she wakes you by putting the Ember into your hand and closing your fingers over it.) There. I said I would. (Her eyes are red-rimmed and very calm.) I could have run. I wanted you to see that I didn’t.', next: 'claim' },
      claim: {
        speaker: 'narrator', effects: GLASS_CLAIM,
        text: 'The Ember of the Glass sinks into the Ashmark like a stone into hot sand. Heat runs up your arm, dry and enormous, and for one moment you see Qadir as it was: glass towers full of lamplight, children at the wells, and a young king on a throne with a clear circlet on his brow, looking anxiously down at the floor beneath his feet.',
        next: 'ozrah-goes',
      },
      'ozrah-goes': { speaker: 'narrator', text: 'Behind you there is a sigh, very long and very tired, like a fire going out in a grate after a long night. When you turn, the throne of black glass is empty but for the circlet on its arm. A little drift of grey ash lies on the seat, and the wind through the broken towers is carrying it away, gently, a little at a time.' },
    },
  },
];

export default dialogues;
