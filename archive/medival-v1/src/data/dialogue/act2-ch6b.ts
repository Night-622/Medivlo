/** Dialogue: Act II Chapter 6 "Nhal": the counsel scenes, the news from Greywater and the Breach (docs/lore/11-act2-spec.md). Owner: Claude 4. */
import type { DialogueDef, NarrativeCondition, NarrativeEffect } from '@/core';

const QB = 'quest:the-breach';
const f = (flag: string) => ({ flag });
const following = (id: string) => ({ flag: `companion.${id}.following` });
/** Set the moment the counsel names Nhal’s purpose (Hard rule: never only on a last node). */
const REVEAL: NarrativeEffect[] = [
  { setFlag: 'act2.nhal_revealed', value: true },
  { unlockLore: 'lore:the-mire', section: 'nhal' },
  { unlockLore: 'lore:the-forging', section: 'truth' },
];
const THIRD: NarrativeEffect[] = [{ setFlag: 'act2.third_way_known', value: true }, { unlockLore: 'lore:the-third-way' }];
const BREACH: NarrativeEffect[] = [
  { setFlag: 'act2.complete', value: true },
  { setFlag: 'act3.breach_open', value: true },
  { setFlag: 'world.mire_level', value: 4 },
  { unlockLore: 'lore:the-breach' },
];
const tobinHome: NarrativeCondition = { any: [f('act1.tobin_saved'), { flag: 'prologue.tobin_fate', op: '==', value: 'saved' }] };
const tobinGone: NarrativeCondition = { any: [f('act1.tobin_lost'), { flag: 'prologue.tobin_fate', op: '==', value: 'dead' }] };

const dialogues: DialogueDef[] = [
  // ----- counsel: Rhiannon (the Ylwen pact)
  {
    id: 'dialogue:ch6-rhiannon-counsel', name: 'Rhiannon: The Eighth Spark',
    entries: [{ when: f('act2.nhal_revealed'), node: 'again' }, { node: 'start' }],
    nodes: {
      again: { speaker: 'npc:rhiannon-ys-caer', mood: 'sad', text: 'You have heard all of it, spark, and you have not run. Ask what you still need to ask.', next: 'hub' },
      start: { speaker: 'narrator', text: 'The Grove of Antlers is quiet under the snow. Rhiannon Ys-Caer sits among the roots of the great horned oak with her eyes closed, as though listening to something underground. She opens them before you can speak.', next: 'hello' },
      hello: { speaker: 'npc:rhiannon-ys-caer', mood: 'sad', text: 'You have heard it. No, do not tell me; I can see it on you. It leaves a tidemark.', next: 'tell' },
      tell: { speaker: 'player', text: 'It came into the dream in Ysolde’s place. It used her voice, and then it didn’t. It called itself “we”. It said it wanted to be held.', next: 'reveal' },
      reveal: {
        speaker: 'npc:rhiannon-ys-caer', mood: 'sad', effects: REVEAL,
        text: 'Then it has a name, and you know it, and so do I. Nhal. The Eighth. The Spark that did not fall. (She says it the way one touches a bruise.) Our oldest songs remember: the one god who looked down into the sea that Orr had robbed of a world, and pitied it, and leapt. It drowned for love. Ys sang that verse for a thousand years and called it beautiful.',
        next: 'reveal2',
      },
      reveal2: { speaker: 'npc:rhiannon-ys-caer', text: 'But a thought alone in a sea without a bottom does not stay a thought. Age upon age of dark has worn it down to one want, as water wears a stone to one shape. It is not pity any more. It is hunger, wearing pity like a stolen cloak.', next: 'reveal3' },
      reveal3: {
        speaker: 'npc:rhiannon-ys-caer', mood: 'afraid',
        text: 'Hear me now, because this is what Ysolde does not know. Nhal does not want the world to dream. The Dreaming has no one in it, and Nhal is so tired of being no one. When the Heartfire goes out, Nhal means to climb into the empty place where it burned, and beat there. A heart of black water at the centre of the world, and everything that lives living on its pulse: Hollowed, and smiling, and its own. That is the gentle ending your Pale Saint is carrying the Embers home to.',
        next: 'third',
      },
      third: {
        speaker: 'npc:rhiannon-ys-caer', effects: THIRD,
        text: 'There is another way. There has always been another way, and it has always been too dear. The Lullaby, sung whole: not to chain the Mire, nor to drown the world, but to sing it into true sleep. The Embers, all seven, to give the song a fire to burn in. And your mark, spark, a thread straight down to the Heartfire, the only hand that can hold all three at once. Together they could reforge the heart itself. Not Orr’s chain. Not Nhal’s mouth. A new pact, between the made world and the dreaming one.',
        next: 'price',
      },
      price: { speaker: 'npc:rhiannon-ys-caer', mood: 'sad', text: 'And it has a price, as every song has. A heart must be kept. Someone must go down with it and stay, and sing it to sleep each night until the end of the world. They do not come back up. (She looks at your hand, and then at your face.) The song does not care whose voice it is. Only that someone stays.', next: 'hub' },
      hub: {
        speaker: 'npc:rhiannon-ys-caer', text: 'Ask. You have earned all my answers today, and I have so few left that are not sad.',
        choices: [
          { text: '“Does Ysolde know any of this?”', to: 'ysolde', once: true },
          { text: '“Why didn’t you tell me before?”', to: 'before', once: true },
          { text: '“Ys Aerwen. Was that Nhal?”', to: 'ys', once: true, tag: 'lore' },
          { text: '“I carry {flag:world.embers_held} Embers. How many does it need?”', to: 'embers', once: true },
          { text: '[Cadoc] “Cadoc. You’ve been very quiet.”', to: 'cadoc', once: true, when: following('cadoc-ap-ynys') },
          { text: '“Then I know what I have to do.”', to: 'go' },
        ],
      },
      ysolde: { speaker: 'npc:rhiannon-ys-caer', mood: 'sad', text: 'She looked into the Brand and it looked back, and it spoke to her in the voice she most wished to hear: someone who had seen the end and was not afraid of it. She thinks it is the Dreaming that speaks. It is not. The Dreaming does not speak; it only dreams. (Quietly.) She is not wicked, spark. She is drowning, and she thinks the water is a friend’s arms.', next: 'hub' },
      before: { speaker: 'npc:rhiannon-ys-caer', text: 'Because I did not know it was awake. We sang to the Mire for an age and it never once answered in words. If Nhal has begun to speak to the Ashmarked, it is because it can hear the Embers coming home. It is near the top of the water now. Nearer than it has been since Ys.', next: 'hub' },
      ys: { speaker: 'npc:rhiannon-ys-caer', mood: 'sad', text: '(A long silence.) We thought the Mire loved our song and came up to listen. Perhaps it did. Or perhaps something in it heard a thousand voices singing on a lake and thought, there, there is warmth, and reached for it. I have never let myself follow that thought to its end. I am following it now.', next: 'hub' },
      embers: { speaker: 'npc:rhiannon-ys-caer', text: 'You hold {flag:world.embers_held} of them in one hand, and the hand is still yours. No mortal has held so much fire since Saint Solenne climbed out of the deep. The song needs all seven. So does Nhal. And the last is the one she kept from the Brand, and she will not give it up for words.', next: 'hub' },
      cadoc: { speaker: 'npc:cadoc-ap-ynys', text: '(He is sitting on a root, turning a leaf over and over in his long fingers.) I was thinking about the price. I sang the whole of it once, you know, to a seep on the Thornwall. When it closed I felt it settle, like a child going quiet in another room. I have wondered for two hundred years what it would be like to stay in that room.', next: 'cadoc2' },
      cadoc2: { speaker: 'npc:rhiannon-ys-caer', mood: 'afraid', text: 'Cadoc.', next: 'cadoc3' },
      cadoc3: { speaker: 'npc:cadoc-ap-ynys', text: 'I said wondered, Archdruid. I did not say volunteered. (A small, dry smile, for you.) Though I should mention I have never been so frightened of anything in my life, and I have travelled with you.', next: 'hub' },
      go: { speaker: 'npc:rhiannon-ys-caer', mood: 'sad', text: 'Do you? I do not. (She takes your marked hand in both of hers, cold as river-stones.) Go to her, then. She will not listen to me, or to the monks, or to old letters in boxes. She may listen to someone who has heard the voice and did not say yes. Gwyn aer, spark. Bright song to you.' },
    },
  },
  // ----- counsel: Brother Ossory (no pact, or as well)
  {
    id: 'dialogue:ch6-ossory-counsel', name: 'Ossory: The heartbeat in the ledgers',
    entries: [{ when: f('act2.nhal_revealed'), node: 'again' }, { node: 'start' }],
    nodes: {
      again: { speaker: 'npc:brother-ossory', mood: 'sad', text: 'Back again? I have told you the worst of it. I can tell you the rest of it, if you like. The rest is only slightly better.', next: 'hub' },
      start: { speaker: 'narrator', text: 'Brother Ossory is in the lowest gallery of the Ossuary, where the oldest skulls sit in their niches like loaves in an oven. He is reading aloud to one of them by candlelight. When he sees your face he closes the book on his finger.', next: 'hello' },
      hello: { speaker: 'npc:brother-ossory', mood: 'sad', text: 'Ah. You’ve had the dream. Don’t look so startled; we keep a mirror at the top of the stairs, remember. You have the face of the ones who come down here after they’ve had the dream.', next: 'tell' },
      tell: { speaker: 'player', text: 'It came into the dream in Ysolde’s place. It used her voice, and then it didn’t. It called itself “we”. It said it wanted to be held.', next: 'reveal' },
      reveal: {
        speaker: 'npc:brother-ossory', mood: 'sad', effects: REVEAL,
        text: 'Then I shall say a name, and you will kindly not tell the Wick I said it. Nhal. The Eighth Spark. (The skull in the niche beside him seems to be listening.) The Canticle says the hammer slipped. Morrow’s ledgers are older than Solenne, and they say otherwise. They say the Eighth looked down into the sea that Orr had robbed of a world, and pitied it, and leapt. For love. Gods are not careful with their love.',
        next: 'reveal2',
      },
      reveal2: { speaker: 'npc:brother-ossory', text: 'The Grey Monks keep dreams as we keep bones. Every Hollowed soul ever carried into our cells to die, we sat beside, and wrote down what they dreamed. Six hundred years of it. The dreams all begin differently. They all end the same: a heartbeat. Enormous, slow, underneath everything. Not the Heartfire’s. We used to think it was the Mire dreaming of the heart it lost.', next: 'reveal3' },
      reveal3: {
        speaker: 'npc:brother-ossory', mood: 'afraid',
        text: 'It isn’t. It’s practising. Nhal does not want the world to sleep, my friend. Sleep is all Nhal has had since before the Lantern, and it has gone quite mad of it. When the Heartfire dies, Nhal means to climb into the place where it burned and beat there instead. A heart of black water. Every living thing living on its pulse, Hollowed and happy, every one of them the same thought. Your Pale Saint thinks she is carrying the world to bed. She is carrying it to a mouth.',
        next: 'third',
      },
      third: {
        speaker: 'npc:brother-ossory', effects: THIRD,
        text: 'There is a book. The Emberwardens gave it to us to keep the year before the Purge, and we have kept it. It describes what they called the third way. The Aelthi Lullaby, sung whole, to put the Mire into true sleep instead of chains. The Seven Embers, to give the song a fire. And a thread running straight down to the Heartfire, which nobody had, so they shelved the whole matter as theoretical. (He looks at your hand.) It isn’t very theoretical now, is it.',
        next: 'price',
      },
      price: { speaker: 'npc:brother-ossory', mood: 'sad', text: 'With all three, a heart could be reforged: neither Orr’s chain nor Nhal’s mouth, but a new pact between them. The last chapter is very short. A heart must have a keeper. Someone goes down with it and stays, singing, for as long as there is a world. They do not come back. The Emberwardens did not record a volunteer. They were brave, not foolish.', next: 'hub' },
      hub: {
        speaker: 'npc:brother-ossory', text: 'Ask. I shall answer, Morrow help me.',
        choices: [
          { text: '“Did Ysolde read that book?”', to: 'ysolde', once: true },
          { text: '“The Lullaby. Where would I find the whole of it?”', to: 'song-pact', once: true, when: f('act1.ylwen_pact') },
          { text: '“The Lullaby. Where would I find the whole of it?”', to: 'song-nopact', once: true, when: { not: f('act1.ylwen_pact') } },
          { text: '“I carry {flag:world.embers_held} Embers.”', to: 'embers', once: true },
          { text: '“Thank you, Brother.”', to: 'go' },
        ],
      },
      ysolde: { speaker: 'npc:brother-ossory', mood: 'sad', text: 'No. She asked for the Forging, and the leys, and the Mire, and everything we had on the ending of things. She never once asked for the book about the way out. (He turns the candle in his fingers.) I have wondered since whether something told her not to.', next: 'hub' },
      'song-pact': { speaker: 'npc:brother-ossory', text: 'From your Thornwise friends, I should think, and in particular from that disgraceful young fellow of three hundred who has been seen singing to ponds. Ask the Archdruid. She will say no first. Everyone says no first.', next: 'hub' },
      'song-nopact': { speaker: 'npc:brother-ossory', mood: 'sad', text: 'From the Aelthi, who swore at the drowning of Ys never to sing it again, and who have kept that oath for eleven hundred years. Without them it is half a song. Half a song sank a city. I would not try it.', next: 'hub' },
      embers: { speaker: 'npc:brother-ossory', text: 'So many? You must be very warm. (He does not smile.) And very loud, down there in the dark. Be careful whom you dream of.', next: 'hub' },
      go: { speaker: 'npc:brother-ossory', text: 'Go and tell her, if you can find her. And remember: Morrow keeps. Even when there is nothing left to keep, Morrow keeps.' },
    },
  },
  // ----- the news from Greywater (Hesta if she lives, else Maren)
  {
    id: 'dialogue:ch6-breach-word', name: 'Hesta or Maren: Greywater is falling',
    entries: [{ when: f('act1.hesta_alive'), node: 'h-start' }, { node: 'm-start' }],
    nodes: {
      'h-start': {
        speaker: 'narrator', effects: [{ setFlag: 'act2.breach_word', value: true }],
        text: 'There is shouting in the yard of Cinderhold. A boy from Fenwick is kneeling in the snow by the gate, soaked black to the waist, and Hesta is holding him up by the collar with one hand and pouring brandy into him with the other.',
        next: 'h-news',
      },
      'h-news': { speaker: 'npc:hesta-corrow', mood: 'angry', text: 'Greywater. It’s going. Tell them, boy. No: slowly. Breathe first, then talk. That’s the proper order.', next: 'h-boy' },
      'h-boy': { speaker: 'narrator', text: 'The boy says that at moonrise the Black Seep opened. Not overflowed: opened, like an eye. The marsh began to run into it the way water runs to a drain. The stilts of Fenwick leaned, and Agna Fenn got the children into the eel-boats and poled them out over ground gone soft as porridge. He says the reed temples are singing, every one, all at once. He says there were people in white standing on the water, and the water held them up.', next: 'h-choir' },
      'h-choir': {
        speaker: 'npc:hesta-corrow', mood: 'sad',
        text: 'Her Choir. That’s her Choir, standing on the water and singing the door open. (She coughs, long and grey.) Perhaps she knew. Perhaps she was in a dream with you and didn’t. It doesn’t matter tonight.',
        choices: [
          { text: '“Did the parley do this?”', to: 'h-fault' },
          { text: '“I’m going.”', to: 'h-go' },
        ],
      },
      'h-fault': { speaker: 'npc:hesta-corrow', text: 'No. Don’t you dare pick that up and carry it, child; you’ve enough to carry. Nobody opens a door like that in a night. They’ve been digging at it since Varn. Since long before. You only made it hurry.', next: 'h-go' },
      'h-go': { speaker: 'npc:hesta-corrow', text: 'Go to the Seep. I’ll keep the fire here, and the road open for whoever comes up it. And if you find her at the bottom of that hole, tell her from me: this is not gentle. Make her look at it. This is not gentle.' },
      'm-start': {
        speaker: 'narrator', effects: [{ setFlag: 'act2.breach_word', value: true }],
        text: 'Someone is shaking you by the shoulder, hard. It is Maren. Her hair is wet through, there is black mud to her knees, and her bow is already strung.',
        next: 'm-news',
      },
      'm-news': { speaker: 'npc:maren-hollis', mood: 'afraid', text: 'Get up. Greywater’s falling in. I’ve come straight from the Varn road. The Black Seep’s opened. Not flooding: opened. The whole marsh is running into it like a bath down a drain.', next: 'm-news2' },
      'm-news2': {
        speaker: 'npc:maren-hollis', mood: 'angry',
        text: 'Fenwick’s gone over sideways. Agna got the children out in the eel-boats. The reed temples are all singing at once, and there are people in white out there, standing on the water and singing, and the water’s holding them up. Her people. The Choir.',
        next: 'm-ask',
      },
      'm-ask': {
        speaker: 'npc:maren-hollis', text: 'Well? Don’t just sit there with your mouth open.',
        choices: [
          { text: '“Is anyone still out there?”', to: 'm-left', once: true },
          { text: '“Tobin?”', to: 'm-tobin', once: true, when: tobinHome },
          { text: '“Maren…”', to: 'm-tobin-gone', once: true, when: tobinGone },
          { text: '“I’m going.”', to: 'm-go' },
        ],
      },
      'm-left': { speaker: 'npc:maren-hollis', mood: 'sad', text: 'Everyone who couldn’t run. Everyone who heard the singing and walked into it smiling. I saw a man carry his goats in, one under each arm. (Her jaw sets.) I couldn’t stop him. I couldn’t even make him look at me.', next: 'm-ask' },
      'm-tobin': { speaker: 'npc:maren-hollis', text: 'Safe, and furious I wouldn’t let him come. He heard the singing too, from a mile off. He put his hands over his ears and screamed until it stopped. He remembers what it’s like in there.', next: 'm-ask' },
      'm-tobin-gone': { speaker: 'npc:maren-hollis', mood: 'sad', text: 'Don’t. (She looks away.) I listened, out there. In case one of the voices was his. I couldn’t tell. They all sound the same. That’s the worst of it.', next: 'm-ask' },
      'm-go': { speaker: 'npc:maren-hollis', mood: 'angry', text: 'Then I’m coming with you. Don’t argue. Whatever’s at the bottom of that hole, I want to put an arrow in it.' },
    },
  },
  // ----- the Breach (Act II finale)
  {
    id: 'dialogue:obj-black-seep-heart', name: 'Object: The heart of the Black Seep',
    entries: [
      { when: f('act2.complete'), node: 'after' },
      { when: { questStage: QB, stage: 'heart' }, node: 'start' },
      { node: 'wait' },
    ],
    nodes: {
      wait: { speaker: 'narrator', text: 'The Black Seep breathes. Deep under the water a dull light comes and goes, slow as a sleeper’s pulse, and the shapes in the water between you and it are not asleep.' },
      after: { speaker: 'narrator', text: 'The Breach yawns where the Black Seep was, its falls pouring for ever into the dark. Far below, something beats. It is nearer than it was.' },
      start: {
        speaker: 'narrator', effects: BREACH,
        text: 'There is no bottom to the Black Seep any more. Where the water should be deepest it simply stops being water and goes on down, black and clear as glass, and you can see a very long way. You can see the underside of the world.',
        next: 'falls',
      },
      falls: { speaker: 'narrator', text: 'The marsh pours over the lip of it in a ring of slow black falls, wider than the Varn causeway is long. The last of Fenwick’s stilts lean out over the edge. A reed temple tips, gently, like a man bowing, and slides away still singing. All round the rim, on the falling water, the Choir stand in their white, hand in hand, and the water holds them, and they are smiling.', next: 'beat' },
      beat: {
        speaker: 'narrator', mood: 'afraid',
        text: 'And down in the clear black, far below, something beats. Not the Heartfire’s slow red pulse. This is darker, and nearer, and quicker, like a heart that has run a very long way and has nearly arrived. Every time it beats, the edge of the world crumbles a little further in.',
        choices: [
          { text: 'Look down through the mark.', to: 'sight', once: true },
          { text: 'Call her name. “Ysolde!”', to: 'call', once: true },
          { text: 'Kindle the mark. Close it.', to: 'burn' },
        ],
      },
      sight: { speaker: 'narrator', mood: 'afraid', text: 'Through the mark the falling water is threaded with light, thin and red: every ley in Greywater, bent down into the Breach like reeds in a current, draining. And in the deep, under the beating, there is a shape. It is too large to be a shape. It is turned up toward you the way a face is turned up to the rain.', next: 'beat' },
      call: { speaker: 'narrator', text: 'Your voice goes down into the dark and does not echo. Then the answer comes back from everywhere at once, from the falls and the reeds and the mouths of the smiling Choir: a thousand voices that are all one voice.', next: 'call2' },
      call2: { speaker: 'npc:nhal', mood: 'hollow', text: 'She is resting, little cup. She worked so hard. Her Choir opened the door for us, singing her name, and she does not know yet. We will tell her when we are home. We are coming up the stair now. Can you hear us on the stair?', next: 'beat' },
      burn: { speaker: 'narrator', text: 'You plunge your marked hand into the falling water and pour the Embers out through it, all {flag:world.embers_held} of them, every scrap of fire you own. The Breach lights white from the rim to the floor you cannot see. For one breath it is like looking into the sun. The falls hang still in the air.', next: 'burn2' },
      burn2: { speaker: 'narrator', mood: 'afraid', text: 'Then the dark closes over your fire the way water closes over a dropped coin: without effort, without anger, almost tenderly. The beating does not slow. You cannot close it. Nothing that walks on the world could close it. It is not a wound any more. It is a door, and something has its hand on the other side.', next: 'nhal' },
      nhal: {
        speaker: 'npc:nhal', mood: 'hollow',
        text: 'Thank you. Thank you, warm one; that was lovely. Keep your little fires. Keep them all, every one, and bring them down to us when you come. You will come. Everyone comes, in the end. The water is rising, and it is so patient, and it loves you.',
        choices: [
          { text: '“Not today.”', to: 'pull' },
          { text: '[Say nothing. Tear your hand free.]', to: 'pull' },
        ],
      },
      pull: { speaker: 'narrator', text: 'You tear your hand out of the water. It comes away black to the wrist, and the black does not dry. Around you the Choir are still singing; under your boots the ground has gone soft; and from one edge of the sky to the other, Greywater is sliding, slow as a glacier and as certain, down into the dark. The Mirelands have come up into the world. Far behind you, across the snow, the bells of Haldren begin to ring.' },
    },
  },
];

export default dialogues;
