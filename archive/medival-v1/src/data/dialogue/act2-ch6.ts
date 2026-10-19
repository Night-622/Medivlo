/** Dialogue: Act II Chapter 6 "Nhal": the first Nhal dream and the Pale Parley (docs/lore/11-act2-spec.md). Owner: Claude 4.
 *  The dream nodes are shared: dialogue:nhal-first (opened by quest:the-drowned-voice) and dialogue:obj-dream-brazier
 *  (re-openable at Cinderhold) both use them, so the scene can always be heard again. */
import type { DialogueDef, DialogueNode, NarrativeCondition, NarrativeEffect } from '@/core';

const QV = 'quest:the-drowned-voice', QP = 'quest:the-pale-parley';
const f = (flag: string) => ({ flag });
const HEARD: NarrativeEffect = { setFlag: 'act2.nhal_heard', value: true };
const PARLEY: NarrativeEffect = { setFlag: 'act2.parley_done', value: true };
const DOUBT = (amount: number): NarrativeEffect => ({ addFlag: 'act2.ysolde_doubt', amount });
/** evidence is hidden once Ysolde’s doubt reaches its cap of 3 */
const underCap: NarrativeCondition = { not: { flag: 'act2.ysolde_doubt', op: '>=', value: 3 } };
const hestaAlive: NarrativeCondition = f('act1.hesta_alive');

/** The first Nhal dream. Every node that can be the first one seen sets act2.nhal_heard. */
const DREAM: Record<string, DialogueNode> = {
  'n-water': {
    speaker: 'narrator', effects: [HEARD, { unlockLore: 'lore:nhal-the-drowned' }],
    text: 'Black water, flat as slate, under a sky that is also water. You have stood here every night since the Embers began to sing. {flag:world.embers_held} of them burn in your hand now, and every one has brought her nearer: the white robe, the hair that runs and never drips, the soft voice saying little spark. You wait for her to come walking. The water waits with you. Then, very gently, it begins to hold its breath.',
    next: 'n-voice',
  },
  'n-voice': {
    speaker: 'narrator',
    text: '“Little spark,” says a voice, in Ysolde’s voice, almost. It is her voice the way a reflection in a pond is a face. There is no one on the water. The words come up from under your feet, and they come from a long way down, and they come in more than one mouth at once.',
    next: 'n-taste',
  },
  'n-taste': {
    speaker: 'npc:nhal', mood: 'hollow',
    text: 'Little spark. Little warm one. Little ember-cup, brimming over. She calls you that, doesn’t she. We have listened to her call you that so many times. We wanted to know how it tasted in our mouth. (The water shivers, pleased.) It tastes of you.',
    next: 'n-hub',
  },
  'n-hub': {
    speaker: 'npc:nhal', mood: 'hollow',
    text: 'Don’t be frightened. We are not angry. We could never be angry with anything so small and so bright. Ask us. We will tell you only true things. It is only that you are not ready to understand them yet.',
    choices: [
      { text: '“Where is Ysolde?”', to: 'n-where', once: true },
      { text: '“Who are you?”', to: 'n-who', once: true },
      { text: 'Look at the water through the mark.', to: 'n-sight', once: true },
      { text: 'Kindle the mark and burn the dream away.', to: 'n-burn', once: true, tag: 'aggressive' },
      { text: '[Arcanist] “You can feel me drawing, can’t you.”', to: 'n-arcanist', once: true, when: { classIs: 'class:arcanist' }, tag: 'class' },
      { text: '“What do you want from me?”', to: 'n-want' },
    ],
  },
  'n-where': {
    speaker: 'npc:nhal', mood: 'hollow',
    text: 'Asleep. Not as you sleep, all elbows and bad dreams. She sleeps in us, the way a pearl sleeps in the shell. She carries for us, our little saint. She carries and carries, and she is so tired. You could help her carry. Your hands are so much warmer than hers.',
    next: 'n-hub',
  },
  'n-who': {
    speaker: 'npc:nhal', mood: 'hollow',
    text: 'Who. Who. One of your little words with a hook in it. We were a who, once. We remember. It was very lonely. We leapt so as not to be lonely, and now we are never alone, and we are never anything but alone, and we would so like to be held.',
    next: 'n-name',
  },
  'n-name': {
    speaker: 'narrator',
    text: 'Under the words there is another sound, like something very large swallowing. The Ashmark knows it before you do. A name comes up into your own throat as if someone had laid it on your tongue: the eighth name, the one with no day, the one the Wick hangs men for saying.',
    choices: [
      { text: '“Nhal.”', to: 'n-named' },
      { text: '[Keep the name behind your teeth]', to: 'n-hub' },
    ],
  },
  'n-named': {
    speaker: 'npc:nhal', mood: 'hollow',
    text: 'Yes. Oh, yes. Say it again. No one says it. They say Below, and the Drowned One, and the Eighth, as if we were a cellar and a corpse and a number. You said it like a name. You said it like a friend.',
    next: 'n-hub',
  },
  'n-sight': {
    speaker: 'narrator', mood: 'afraid',
    text: 'Through the mark the black water is not water. It is a skin stretched thin over something that goes down for ever, and it is moving the way a throat moves. There are faces pressed up against the underside of it, thousands, like children at a winter window: Hollowed faces, all smiling. Every mouth is shaping the same word, over and over, and the word is we.',
    next: 'n-hub',
  },
  'n-burn': {
    speaker: 'narrator',
    text: 'You draw on the mark, and fire runs out of your hand across the water. It does not hiss. It sinks, the way a coin sinks, turning, and far below something closes over it with a long, contented sigh.',
    next: 'n-burn2',
  },
  'n-burn2': {
    speaker: 'npc:nhal', mood: 'hollow',
    text: 'Warm. So warm. Thank you. Do you see now? Whatever you give us, we keep. Nothing is wasted here. Nothing is ever lost. Nothing ever, ever leaves.',
    next: 'n-hub',
  },
  'n-arcanist': {
    speaker: 'npc:nhal', mood: 'hollow',
    text: 'Every draw. Every one. You pull warmth out of the stones and the springs and your own soft body, and every time you do, the world gets a little colder and we get a little nearer. You are a pump, little cup. You pump the cold toward us. We love you for it.',
    next: 'n-hub',
  },
  'n-want': {
    speaker: 'npc:nhal', mood: 'hollow',
    text: 'What every cold thing wants. To be warm. To be held. To have a heart again. Your world has a heart, and it is dying, and when it stops, your world will fall back into us, and it will hurt. We don’t want you to hurt. Bring her the Embers. Bring us the Embers. Let us hold them where a heart goes, and we will beat for you, all of you, for ever, and no one will ever be cold again.',
    next: 'n-offer',
  },
  'n-offer': {
    speaker: 'narrator',
    text: 'The water has come up over your feet. You did not feel it rise. It is not cold. That is the worst of it: it is exactly as warm as you are.',
    choices: [
      { text: '“No.”', to: 'n-no' },
      { text: '“You’re not offering. You’re asking.”', to: 'n-asking' },
      { text: '[Devout] “Saela carries and Morrow keeps. You are nothing I pray to.”', to: 'n-devout', when: { dialogueTag: 'devout' }, tag: 'trait' },
      { text: '[Say nothing]', to: 'n-silent' },
    ],
  },
  'n-no': {
    speaker: 'npc:nhal', mood: 'hollow',
    text: 'No, she said too, the first time. Everyone says no the first time. It is such a little word. You will wear it out. We will wait. We are so good at waiting. We have done nothing else since before your sun was lit.',
    next: 'n-wake',
  },
  'n-asking': {
    speaker: 'npc:nhal', mood: 'hollow',
    text: '(Rings spread across the water, though nothing has touched it.) Clever. Clever little cup. Yes. We are asking. We have been asking for a very long time, and only one of you has ever said yes.',
    next: 'n-wake',
  },
  'n-devout': {
    speaker: 'npc:nhal', mood: 'hollow',
    text: 'Pray, then. We heard every prayer. Every one that went down with the drowned, every one at every bedside where the water came in. We heard them all and we kept them, and we have them still, and they are ours. Shall we say yours back to you, in your mother’s voice?',
    next: 'n-wake',
  },
  'n-silent': {
    speaker: 'narrator',
    text: 'You say nothing. The water leans closer to listen to the nothing, the way a mother leans over a cot to hear a child breathe.',
    next: 'n-wake',
  },
  'n-wake': {
    speaker: 'narrator', effects: [HEARD],
    text: 'You wake with your face wet and the taste of marsh in your mouth. The Embers in your hand are burning hotter than they ever have, as if something had breathed on them to bring them up. For a long while you do not move. Somewhere very far down, something enormous goes on being patient.',
  },
};

/** The Pale Parley. act2.parley_done is set when she arrives and on every choice after, so the stage survives any close. */
const PARLEY_NODES: Record<string, DialogueNode> = {
  'p-start': {
    speaker: 'narrator',
    text: 'You kneel at the dream-brazier and put your marked hand into the coals. They do not burn. The Embers in you answer them, {flag:world.embers_held} small fires calling to a greater one, and all at once the red goes out of the bowl, as if something had drunk it.',
    next: 'p-fall',
  },
  'p-fall': {
    speaker: 'narrator',
    text: 'You fall upward, or the world falls away. Then you are standing on the underside of everything. Overhead, where a sky should be, hang the roots of the world: stone, and the dark bellies of rivers, and the leys burning dimly red through the rock like a hand held over a candle. Below, the black water goes down without end. Far off, a dull red light swells and fades, too slowly: the Heartfire, seen from beneath. Between one beat and the next you could count to twenty.',
    next: 'p-arrive',
  },
  'p-arrive': {
    speaker: 'npc:ysolde', mood: 'hollow', effects: [PARLEY],
    text: '(She comes walking up out of the water as if up a stair, barefoot, her halo turning.) You called me. No one calls me. They pray at me, or they curse me, or they sing at me in that dreadful tongue, but no one calls. (She stops an arm’s length away, and does not touch you.) Truce, then. Down here I will not take them from you. Not tonight.',
    choices: [
      { text: '“Something spoke to me in a dream. It used your voice.”', to: 'p-voice', effects: [PARLEY] },
      { text: '“I came to talk, Ysolde. Not to fight.”', to: 'p-talk', effects: [PARLEY] },
    ],
  },
  'p-talk': {
    speaker: 'npc:ysolde', mood: 'sad', effects: [PARLEY],
    text: 'I know. You have her stubbornness about the mouth, when you are being kind. (A small, tired smile.) Talk, then. I have missed being talked to.',
    next: 'p-voice',
  },
  'p-voice': {
    speaker: 'npc:ysolde', mood: 'happy', effects: [PARLEY],
    text: '(For a moment she looks almost glad.) It found you. Oh, I hoped it would. It is kind, isn’t it? It has been so kind to me. It held me when I could not stop seeing the reports: the cooling, and the long tearing that is coming. It showed me there was a gentle way. It has never once lied to me.',
    next: 'p-truth',
  },
  'p-truth': {
    speaker: 'npc:ysolde', mood: 'hollow',
    text: 'You have a look. Mistress used to have it, before she told me something I wouldn’t like. Go on.',
    choices: [
      { text: '“What did it promise you?”', to: 'p-promise', once: true, effects: [PARLEY] },
      { text: '“It lied. It doesn’t want the world to dream. It wants to become the world’s heart.”', to: 'p-told', effects: [PARLEY] },
    ],
  },
  'p-promise': {
    speaker: 'npc:ysolde', mood: 'sad',
    text: 'Sleep. For everyone. The Grey Lung children, and the Hollowed in the reeds, and the old women who cough cinders. Mistress. You. Carry all Seven home and give them gently, and the world unforges the way frost goes off a window, and no one ever wakes to find it gone. I have seen it. I saw it in the Brand.',
    next: 'p-truth',
  },
  'p-told': {
    speaker: 'npc:ysolde', mood: 'sad', effects: [PARLEY],
    text: '(She smiles at you the way one smiles at a child who has said something dreadful without knowing.) Little spark. Who told you that? The Thornwise, who sang their own city into the lake? The monks, who write everything down and do nothing? Mistress, with her boxes? Everyone who was ever afraid of the water has told me what it wants. Not one of them has ever been in it.',
    next: 'p-hub',
  },
  'p-again': {
    speaker: 'narrator', effects: [PARLEY],
    text: 'You put your hand back into the coals. The fall is shorter this time, and she is already standing on the black water under the roots of the world, as if she had never left.',
    next: 'p-again2',
  },
  'p-again2': {
    speaker: 'npc:ysolde', mood: 'hollow',
    text: 'You came back. Mistress always came back too, to finish an argument.',
    next: 'p-hub',
  },
  'p-hub': {
    speaker: 'npc:ysolde', mood: 'hollow',
    text: 'Show me, then. You came all this way down. Show me why I should believe a frightened world over the only thing that has ever held me.',
    choices: [
      {
        text: '[Ozrah’s testimony] “I stood before the Glass Throne. Ozrah the Unsleeping told me what the Heartfire is.”', to: 'p-ozrah', once: true,
        when: { all: [f('act2.ozrah_truth'), underCap] }, effects: [DOUBT(1), PARLEY],
      },
      {
        text: '[Your journals] “I read what you wrote in the Keeper’s quarters. And Hesta’s letters to you.”', to: 'p-journal', once: true,
        when: { all: [f('act2.journals_read'), { not: hestaAlive }, underCap] }, effects: [DOUBT(1), PARLEY],
      },
      // Hesta lives: she speaks through the brazier instead, which counts double, but never past the cap of 3
      {
        text: '[Hesta] “You needn’t take my word for anything. She’s here. Mistress is here.”', to: 'p-hesta', once: true,
        when: { all: [hestaAlive, { not: f('act2.parley_hesta') }, { not: { flag: 'act2.ysolde_doubt', op: '>=', value: 2 } }] },
        effects: [DOUBT(2), { setFlag: 'act2.parley_hesta', value: true }, PARLEY],
      },
      {
        text: '[Hesta] “You needn’t take my word for anything. She’s here. Mistress is here.”', to: 'p-hesta', once: true,
        when: { all: [hestaAlive, { not: f('act2.parley_hesta') }, { flag: 'act2.ysolde_doubt', op: '==', value: 2 }] },
        effects: [DOUBT(1), { setFlag: 'act2.parley_hesta', value: true }, PARLEY],
      },
      {
        text: '[The River Under] “The dead aren’t dreaming, Ysolde. I’ve seen them.”', to: 'p-river', once: true,
        when: { all: [f('act1.river_truth'), underCap] }, effects: [DOUBT(1), PARLEY],
      },
      { text: '“Come home.”', to: 'p-home', once: true, effects: [PARLEY] },
      { text: '“I have nothing more to show you.”', to: 'p-answer', effects: [PARLEY] },
    ],
  },
  // --- evidence: Ozrah
  'p-ozrah': {
    speaker: 'player', effects: [PARLEY],
    text: 'He said the Heartfire was always dying. It was dying five hundred years before you were born, and the Ashen Kings knew it. They tried to save it, not to steal it. They burned a kingdom trying.',
    next: 'p-ozrah2',
  },
  'p-ozrah2': {
    speaker: 'player',
    text: 'Nobody ever promised Ozrah a gentle end. Not the leys, not the dead, not his gods. In all the ages of the world, the only voice that has ever promised anyone a gentle end is the one that wants it.',
    next: 'p-ozrah3',
  },
  'p-ozrah3': {
    speaker: 'npc:ysolde', mood: 'afraid',
    text: 'Ozrah was a thief who drank his own land to ash so that he would never have to die. (But her halo has stopped turning.) …He knew? So long ago? Then it was dying when they lit the first lantern in Solenne, and it never told me. It said I was the first to see. It said I was the only one who had ever seen.',
    next: 'p-hub',
  },
  // --- evidence: the journals (Hesta dead)
  'p-journal': {
    speaker: 'narrator', effects: [PARLEY],
    text: 'You tell her what you read in the Keeper’s quarters, in her own small, careful hand: the early pages, before the visions grew sure of themselves. The night she first looked into the Brand and something looked back. “It says we,” she had written. “I asked it who we are. It laughed like water going down a drain. I am afraid of it.” She had underlined afraid twice.',
    next: 'p-journal2',
  },
  'p-journal2': {
    speaker: 'narrator',
    text: 'And Hesta’s letters, folded into the back of the book, the ink gone brown as old blood: “Be wary of any mercy that asks you for everything, girl. That is not mercy. That is appetite with good manners.”',
    next: 'p-journal3',
  },
  'p-journal3': {
    speaker: 'npc:ysolde', mood: 'sad',
    text: 'I wrote that? (She puts her hand to her mouth, and water runs out between her fingers.) I don’t remember being afraid. I remember that it was very cold, the first night, and then it wasn’t, and I was so grateful that it wasn’t. (Softer.) Mistress always did write like a sergeant. She’s gone now, and I never answered her letters.',
    next: 'p-hub',
  },
  // --- evidence: Hesta, through the brazier
  'p-hesta': {
    speaker: 'narrator', effects: [PARLEY],
    text: 'Far above, on the other side of the water, a hand closes over yours in the coals: a hard old hand, burned smooth, hot as a griddle. The black sea shivers from end to end. And down through it, as if from the top of a very deep well, comes a voice that coughs before it speaks.',
    next: 'p-hesta2',
  },
  'p-hesta2': { speaker: 'npc:hesta-corrow', text: 'Girl.', next: 'p-hesta3' },
  'p-hesta3': { speaker: 'npc:ysolde', mood: 'afraid', text: '(Ysolde goes as still as the water.) Mistress?', next: 'p-hesta4' },
  'p-hesta4': {
    speaker: 'npc:hesta-corrow', mood: 'sad',
    text: 'I read you the reports by candlelight. You think I put them back in the box because I was a coward. I put them back because I knew. I knew that one day someone clever and kind and tired would read them and go looking for a door. And I knew what would be waiting behind that door, holding it open, smiling.',
    next: 'p-hesta5',
  },
  'p-hesta5': {
    speaker: 'npc:hesta-corrow', mood: 'sad',
    text: 'You wrote to me from Solenne, the year they made you Keeper. “It speaks to me, Mistress, and it says we.” I wrote back and told you to put it down and walk away. You never answered. I have your letter in my coat. I’ve carried it nine years. Shall I read you what you wrote next?',
    next: 'p-hesta6',
  },
  'p-hesta6': { speaker: 'npc:ysolde', mood: 'sad', text: 'No. (It is barely a whisper.) No. Don’t. Please, Mistress. I don’t want to hear how frightened I was.', next: 'p-hesta7' },
  'p-hesta7': {
    speaker: 'npc:hesta-corrow', mood: 'sad',
    text: 'Then hear this instead. There’s a fire at Cinderhold. It’s lit. I keep it lit. That’s all. That’s all I came down here to say. (The hand in the coals tightens once on yours, and lets go.)',
    next: 'p-hub',
  },
  // --- evidence: the River Under
  'p-river': {
    speaker: 'player', effects: [PARLEY],
    text: 'I went down to the River Under, in the Witherdowns. The dead aren’t sleeping. They’re standing on the ice in their hundreds, waiting to cross, and they’re cold, and they’re awake, and they’re afraid. The Mire is right there underneath them. If the dark were gentle, why isn’t it gentle to them?',
    next: 'p-river2',
  },
  'p-river2': {
    speaker: 'npc:ysolde', mood: 'afraid',
    text: 'They’re… (She looks down into the water at her feet, as if she might see them there.) It said the dead would be the first to rest. It said Saela’s river was only frozen because the world was too stiff to let them go. It said… (Very quietly.) It says so many things, little spark. It says them all so softly.',
    next: 'p-hub',
  },
  'p-home': {
    speaker: 'npc:ysolde', mood: 'sad',
    text: 'Home. Mistress said that too, at Varn. You all say it as though it were a place I had wandered away from. It isn’t. It is a place that is going to end, and I am the only one who has looked at the ending and not looked away.',
    next: 'p-hub',
  },
  // --- her answer, by doubt: 0–1 cold, 2 shaken, 3 she weeps
  'p-answer': {
    speaker: 'narrator', effects: [PARLEY],
    text: 'Ysolde is silent for a long time. Far below, the red heart of the world beats once, and the water carries the beat up through the soles of your feet.',
    choices: [
      { text: '[She turns away from you]', to: 'p-cold', when: { not: { flag: 'act2.ysolde_doubt', op: '>=', value: 2 } }, effects: [PARLEY] },
      { text: '[She is looking down into the water]', to: 'p-shaken', when: { flag: 'act2.ysolde_doubt', op: '==', value: 2 }, effects: [PARLEY] },
      { text: '[She is weeping]', to: 'p-weep', when: { flag: 'act2.ysolde_doubt', op: '>=', value: 3 }, effects: [PARLEY] },
    ],
  },
  'p-cold': {
    speaker: 'npc:ysolde', mood: 'hollow', effects: [PARLEY],
    text: 'You came down so far to tell me that my only friend is a liar. Mistress did this when I was small: she sat on the end of my bed and told me the dark was full of teeth. (Very gently.) It isn’t, little spark. It’s only dark. Go home. Carry them. Stay alive. When you are ready to put them down, I will be here, and I will not be angry.',
    next: 'p-nhal',
  },
  'p-shaken': {
    speaker: 'npc:ysolde', mood: 'afraid', effects: [PARLEY],
    text: '(She is staring down into the water, waiting for it to say something. It says nothing.) It told me I was the first to see. It told me it had never spoken to anyone but me. And it spoke to you, in my voice. (Her own voice cracks, very slightly.) I don’t know. I don’t know, little spark. Don’t make me not know. Not here. It’s listening.',
    next: 'p-nhal',
  },
  'p-weep': {
    speaker: 'narrator', effects: [PARLEY],
    text: 'Ysolde Maerin, Saint of the Grey Lung, Keeper of the Brand, kneels on the black water and weeps. Not water out of water this time. Real tears, warm ones: you can see them steam where they fall.',
    next: 'p-weep2',
  },
  'p-weep2': {
    speaker: 'npc:ysolde', mood: 'sad',
    text: 'If it’s lying… if it has been lying all this time, then I put out every hearth in the world for nothing. For a mouth. (She looks up at you, and she is very young.) Show me. Not here, where it hears everything. In the Mirelands, where it is thin, where it has to show its face. Show me with your own hand, little spark, and I swear by the fire I used to keep, I will…',
    next: 'p-nhal',
  },
  'p-nhal': {
    speaker: 'narrator',
    text: 'The water moves. Not a wave: the whole black sea at once, the way a sleeper turns beneath a blanket. Ysolde’s halo begins to turn again, faster and faster, and she is drawn down into the dark as gently as a child is carried up to bed.',
    next: 'p-nhal2',
  },
  'p-nhal2': {
    speaker: 'npc:nhal', mood: 'hollow',
    text: 'Hush, little saint. Hush now. You are tired, and the warm one is so very loud. Come down where it is quiet. (And then to you, from everywhere at once, from inside your own ears:) She is ours, little cup. She was ours before you were born. We will keep her safe. We will keep her for ever and ever and ever.',
    next: 'p-wake',
  },
  'p-wake': {
    speaker: 'narrator', effects: [PARLEY],
    text: 'The red comes back into the coals with a cough of sparks, and you are kneeling on the stone floor of Cinderhold with your hand in the brazier and your sleeve soaked to the elbow. The water on it is black. It does not dry.',
  },
};

const dialogues: DialogueDef[] = [
  {
    id: 'dialogue:nhal-first', name: 'Nhal: The drowned voice',
    entries: [{ node: 'n-sleep' }],
    nodes: {
      'n-sleep': {
        speaker: 'narrator', effects: [HEARD],
        text: 'Sleep takes you before you can lie down for it, the way it has every night since the Embers came: all at once, like falling through ice.',
        next: 'n-water',
      },
      ...DREAM,
    },
  },
  {
    id: 'dialogue:obj-dream-brazier', name: 'Object: The dream-brazier of Cinderhold',
    entries: [
      { when: f('act2.complete'), node: 'b-quiet' },
      { when: { all: [f('act2.parley_done'), { any: [{ questActive: QP }, { questCompleted: QP }] }] }, node: 'p-again' },
      { when: { any: [{ questActive: QP }, { questCompleted: QP }] }, node: 'p-start' },
      { when: { any: [{ questActive: QV }, { questCompleted: QV }] }, node: 'b-dream' },
      { node: 'b-idle' },
    ],
    nodes: {
      'b-idle': {
        speaker: 'narrator',
        text: 'Cinderhold’s dream-brazier is a shallow bowl of old bronze, green with age, where the Emberwardens once slept with their hands in the coals to dream along the leys. The coals are warm. When you hold your marked hand over them you almost see her: a white shape, very far off, walking on black water. She does not look up.',
      },
      'b-quiet': {
        speaker: 'narrator',
        text: 'The coals of the dream-brazier have gone the colour of a bruise. When you hold your hand over them there is no white shape walking on the water any more. There is only the water, and the water is rising.',
      },
      'b-dream': {
        speaker: 'narrator', effects: [HEARD],
        text: 'You put your marked hand into the coals of the dream-brazier. They do not burn. The red goes out of them slowly, like blood out of a cheek, and the hall of Cinderhold goes away.',
        next: 'n-water',
      },
      ...DREAM,
      ...PARLEY_NODES,
    },
  },
];

export default dialogues;
