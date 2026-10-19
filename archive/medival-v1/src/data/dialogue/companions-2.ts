/**
 * Dialogue: companion personal quests, part 2 (docs/lore/13-companions.md §1).
 * quest:the-unsung-verse (Cadoc) and quest:iron-remembers (Grimma). Sable is in companions-2b.ts. Owner: Claude 4.
 */
import type { DialogueDef, NarrativeCondition } from '@/core';

const QV = 'quest:the-unsung-verse', QI = 'quest:iron-remembers';
const C = 'npc:cadoc-ap-ynys' as const, E = 'npc:eluned-of-ys' as const, R = 'npc:rhiannon-ys-caer' as const;
const G = 'npc:grimma-ironsong' as const, U = 'npc:ulka-ironsong' as const;

const f = (flag: string): NarrativeCondition => ({ flag });
const is = (flag: string, value: string): NarrativeCondition => ({ flag, op: '==', value });
const verseIs = (v: 'sung' | 'left') => is('companion.cadoc-ap-ynys.verse', v);
const ringIs = (v: 'old' | 'new' | 'none') => is('companion.grimma-ironsong.ring', v);
const grimmaHere = f('companion.grimma-ironsong.following');
const ringIron = f('npc.grimma-ironsong.ring_iron');
const restored = f('act2.grimma_restored');
const hasTrueIron: NarrativeCondition = { hasItem: 'item:true-iron' };
const moved = f('npc.ulka-ironsong.moved');

const dialogues: DialogueDef[] = [
  // =====================================================================
  // quest:the-unsung-verse
  // =====================================================================
  {
    id: 'dialogue:uv-cadoc-word', name: 'Cadoc: The bells',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'Cadoc is sitting a little apart from the fire with his thornbow across his knees, not stringing it, not mending it, only holding it. The new leaves on it have curled up tight against the cold. He has been like this for three days. For Cadoc, silence is a kind of shouting.', next: 'bells' },
      bells: { speaker: C, text: 'Ah. You have come to ask what is wrong, and I have been preparing something witty, and it has gone completely. (He turns the bow over.) I have been hearing bells, spark. In my sleep. I have never heard them awake in my life, and I know every one of them by its note.', next: 'bells2' },
      bells2: {
        speaker: C, mood: 'sad',
        text: 'They are the bells of Ys Aerwen. They are at the bottom of a lake, and they are ringing. And under the bells, very faint, someone is singing the Lullaby, and she does not stop where it stops. She goes on. There is a last verse, and somebody down there still has it.',
        choices: [
          { text: '“Someone? Who?”', to: 'who', once: true },
          { text: '“Your people swore never to sing to the water again.”', to: 'oath', once: true },
          { text: '“Is this about the seep you sang closed?”', to: 'seep', once: true, when: f('act1.cadoc_secret_known') },
          { text: '“The third way needs the Lullaby. All of it.”', to: 'third', once: true, when: f('act2.third_way_known'), tag: 'lore' },
          { text: '“What do you want to do?”', to: 'want' },
        ],
      },
      who: { speaker: C, text: 'I do not know. That is a lie; I have a guess, and I do not like it. It is a woman’s voice and it is very old, and it calls me by a name nobody has called me since my mother died. (He clears his throat.) Cadi. You will not use that. I will know.', next: 'bells2' },
      oath: { speaker: C, mood: 'sad', text: 'We did. On the drowned. Every child in Ylwen swears it at seven, before they know what a lake is, let alone a sea under one. I swore it with a mouthful of honey-cake. (A dry pause.) I would like to say that I have kept it. I have kept it in the sense that a sieve keeps water.', next: 'bells2' },
      seep: { speaker: C, text: 'Everything is about the seep. I sang the whole song to a hole in the ground, and the hole closed, and for one breath the sea under the world sighed in its sleep like something whose hand you have taken. I have spent two hundred years being told it was the worst thing an Aelthi had done since Ys. (Quietly.) The voice in my sleep says it heard me.', next: 'bells2' },
      third: { speaker: C, text: 'Yes. Rhiannon told you, and then she told me, and then she went and stood very still under a tree for a day, which is how the Archdruid weeps. The Lullaby without its last verse is a door with no latch, spark. We know what happens when you open it. Ys happens.', next: 'bells2' },
      want: { speaker: C, text: 'I want to go down and fetch it. The court of Ys Aerwen is under its own lake, in the deep of the wood, and there is a stair of white stone that still goes down into the water. Nobody has walked it since the night it was a stair. I can sing us breath. You can keep us warm. Between the two of us we are very nearly one competent diver.', next: 'want2' },
      want2: {
        speaker: C,
        text: 'And then, when we have heard the verse, somebody will have to decide whether to bring it up. I would rather that were not me. I have never once made that sort of decision well. Will you come?',
        choices: [
          { text: '“I’ll come.”', to: 'yes' },
          { text: '“Why me?”', to: 'why', once: true },
          { text: '“Is it the Mire calling you down, Cadoc? It lies.”', to: 'lies', once: true },
        ],
      },
      why: { speaker: C, text: 'Because you burn, and the rest of us only sing. Because Rhiannon looked at your hand when she talked about what failed at Ys, and then looked away, and I saw her do it. And because you are the only person in three hundred years who has asked me what I want and then waited for the answer.', next: 'want2' },
      lies: { speaker: C, mood: 'sad', text: 'Very possibly. The sea under the world is a great liar, and it lies mostly by being kind. But the voice does not sound kind, spark. It sounds tired. In my experience lies are never tired. They have far too much to do.', next: 'want2' },
      yes: { speaker: C, mood: 'happy', text: '(He stands, all at once, and strings the bow, and the curled leaves on it open a little.) Good. Splendid. Terrible. We go to the shore of Ys. If my great-grandmother hears of this, I was kidnapped by humans. Do try to look the sort.' },
    },
  },
  {
    id: 'dialogue:uv-rhiannon', name: 'Rhiannon: The colour of the roofs',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'The Archdruid is standing in the Grove of Antlers with her hand flat against a white tree, as if listening to it. She does not turn round when you come. She knows who it is, and why.', next: 'know' },
      know: { speaker: R, mood: 'sad', text: 'You are going down the stair. The wood told me, and Cadoc’s face told me, and the bells have told me every night this month. I hear them too, Ashmarked. I have heard them since I was a child, sitting on the shore with my feet in the water, waiting for my mother to come up.', next: 'know2' },
      know2: {
        speaker: R,
        text: 'I swore the oath on the drowned. So did Cadoc, when he was too small to know what he was swearing. You did not swear it. I will not forbid what I cannot forbid.',
        choices: [
          { text: '“Will you come with us?”', to: 'come', once: true },
          { text: '“Who is singing down there?”', to: 'who', once: true },
          { text: '“Is there anything you want brought up?”', to: 'roofs' },
        ],
      },
      come: { speaker: R, text: 'No. If I went down that stair I should not come up it. I should sit down on the bottom step and wait for my mother, and I am too old to be told she is not coming.', next: 'know2' },
      who: { speaker: R, text: 'Eluned. Loremaster of Ys Aerwen. She made the song. She sang me to sleep with the first verse of it, the night before they sang it on the lake, to see if it worked on children. It did. I woke on the shore, in the wood, alone, and the city was gone, and she was singing under the water.', next: 'know2' },
      roofs: { speaker: R, mood: 'sad', effects: [{ setFlag: 'npc.rhiannon-ys-caer.uv_roofs', value: true }], text: 'Nothing can be brought up from there. But if you hear her, tell her the roofs were blue. Everyone says they were white, because the towers were white, and the songs say white. They were blue, the blue of a wren’s egg. I am the only one left who knows. Tell her somebody remembers.' },
    },
  },
  {
    id: 'dialogue:obj-ys-aerwen-stair', name: 'Object: The drowned stair of Ys Aerwen',
    entries: [
      { when: verseIs('sung'), node: 'after-sung' },
      { when: verseIs('left'), node: 'after-left' },
      { when: f('companion.cadoc-ap-ynys.dived'), node: 'again' },
      { when: { questStage: QV, stage: 'shore' }, node: 'start' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'narrator', text: 'A stair of white stone goes down from the shore into the lake, its treads worn hollow by feet that walked them when they were dry. The water at the edge is warm as breath. It is the only water in the deepwood that has not frozen.' },
      'after-sung': { speaker: 'narrator', text: 'The mist has gone off the lake of Ys. For the first time in anyone’s memory a skin of ice is creeping out from the shore over the black-green water, thin as a held breath. Far down, nothing is ringing. It sounds like a house where everyone has finally gone to sleep.' },
      'after-left': { speaker: 'narrator', text: 'Mist lies on the lake of Ys, warm as breath. If you stand very still on the bottom step you can feel the bells through the stone, slow, never quite making a tune, and under them a single voice that does not stop where the song stops.' },
      // --- the shore
      start: {
        speaker: 'narrator', effects: [{ companion: C, following: true }],
        text: 'Every water in the deepwood is iron-hard with the Long Winter: the streams, the pools, the mere at Caer Ylwen. This lake is not. Mist lies on it. It breathes, slow and warm, like a sleeper’s breath on a cold window, and from the shore a stair of white stone goes down into it, step after step, until the steps are green and then dark and then gone. Cadoc is already at the water’s edge, as if he came on ahead in the night.',
        next: 'shore',
      },
      shore: { speaker: C, text: 'Well. There it is. The most beautiful city in the history of the world, and I have only ever seen the roof of it from here, on still days, when my mother brought me to cry. Aelthi children are brought here to cry. It is considered educational.', next: 'shore2' },
      shore2: {
        speaker: C,
        text: 'You will want to know about breathing. It is a reasonable thing to want to know about.',
        choices: [
          { text: '“How do we breathe down there?”', to: 'breath' },
          { text: '[Arcanist] “The lake is warm. Is there a ley under it?”', to: 'ley', when: { classIs: 'class:arcanist' }, tag: 'class', once: true },
          { text: '[Ranger] “No birds. No tracks. Nothing comes to drink here.”', to: 'birds', when: { classIs: 'class:ranger' }, tag: 'class', once: true },
        ],
      },
      ley: { speaker: C, text: 'No ley. Look with your hand if you like; I would rather you did not. It is warmed from underneath, spark. By the sleeper. It has been breathing on this lake since the night the lake closed. Some of my people find that a comfort.', next: 'shore2' },
      birds: { speaker: C, text: 'No. Even the deer know. My great-aunt says the beasts of the wood have a better memory than we do and a great deal more sense. She says it at me, mostly.', next: 'shore2' },
      breath: { speaker: C, text: 'A small song. Children learn it for swimming: it holds a pocket of air about the mouth for as long as the singer keeps singing. So you will want me to keep singing. Please bear that in mind before you say anything wounding. (He looks at your hand.) And keep that lit. The cold down there is not the cold of water.', next: 'descend' },
      descend: { speaker: 'narrator', text: 'You go down the stair. The water comes to your knees warm, to your chest warm, and closes over your head warm, and then, a few steps further, it is not warm at all but very, very still. Cadoc’s song is a small sound beside your ear, like a kettle in another room. Your marked hand is the only light. Your breath comes, and goes, and comes, inside the song.', next: 'bells' },
      bells: { speaker: 'narrator', text: 'Then the towers of Ys Aerwen rise out of the dark below you. They are white, and they have slumped like candles left too near a fire, leaning on one another, their windows drawn long; and they are still standing. In every belfry a bell swings. There is no wind to swing them. The water dreams that it is wind. Each bell rings one note, slow, and the notes go out through the water and never quite make a tune.', next: 'cadoc-bells' },
      'cadoc-bells': { speaker: C, mood: 'sad', text: '(Between breaths of the song.) I know these. I have never heard them and I know them. My great-grandmother hums them when she thinks nobody is listening. …Keep walking. If I stop to weep, the air goes.', next: 'dream' },
      dream: {
        speaker: 'narrator', mood: 'afraid',
        text: 'The nearer you come to the court, the more the water shows you. A garden of flowers nobody ever planted, opening in the dark. A road you did not take. Your own door in Brindlecross, standing open, and someone you lost inside, laying the table for two. None of it pulls at you. It only waits, kindly, the way a warm bed waits.',
        choices: [
          { text: '[Will 15] Keep your eyes on the light in your hand, and walk.', to: 'court', tag: 'persuade', check: { stat: 'will', dc: 15, failTo: 'dream-fail' } },
          { text: '[Hollow-touched] “I know this voice. It isn’t the bells. It’s under the bells.”', to: 'hollow', when: { dialogueTag: 'hollow-touched' }, tag: 'trait' },
          { text: 'Look at the open door. Only for a moment.', to: 'dream-fail' },
        ],
      },
      hollow: { speaker: 'narrator', text: 'You have heard it before, in the water at Wennamere and in your own sleep: something vast and patient, talking through every pretty thing as a man talks through a mask. You do not answer it. It does not seem to mind. You keep walking, and the open door is only a door, and then it is only water.', next: 'court' },
      'dream-fail': { speaker: 'narrator', mood: 'afraid', effects: [{ setFlag: 'companion.cadoc-ap-ynys.pulled_back', value: true }], text: 'You have stopped walking. Somebody inside the door is saying your name the way they used to. Then a hand closes on your collar and hauls, and for an instant Cadoc’s song breaks and black water is in your mouth, cold beyond any cold, cold like the inside of a word nobody has said.', next: 'dream-cadoc' },
      'dream-cadoc': { speaker: C, mood: 'angry', text: '(The song comes back, ragged.) Not that door. Never that door. It is very lovely, and there is nobody behind it. There is never anybody behind it. (Softer.) I am sorry. I grabbed. I was raised better. Come on.', next: 'court' },
      court: { speaker: 'narrator', text: 'The singing-hall of Ys Aerwen is round, and its roof has fallen in, so that it stands open to the dark like a cupped hand. In it, in rows, as they stood on the night of the Lullaby, are the drowned of Ys. Robed. Faces lifted. Mouths open. Their hair drifts. They are singing; you cannot hear it, but you feel it in your teeth. Some of them are children. None of them are dead the way the dead are dead. Saela’s boat never found them.', next: 'voice' },
      voice: {
        speaker: 'narrator', effects: [{ setFlag: 'companion.cadoc-ap-ynys.dived', value: true }],
        text: 'On the singers’ dais at the centre stands one woman who is not singing. She is robed in weed, and her eyes have the faint inner light that all Aelthi eyes have, and she is the only one in the whole hall who is looking at you.',
        next: 'eluned',
      },
      eluned: { speaker: E, text: 'Cadoc. Little Cadoc ap Ynys. You have grown so long. You were knee-high to a birch when you sang to me. You had a scab on your knee from the hedge, and you sang the fourth line flat, and you sang every word of it to a hole in the ground no wider than a cart-wheel. I put my hand up through the water to touch your face. You were so frightened you were sick on your shoes.', next: 'cadoc-crack' },
      'cadoc-crack': {
        speaker: 'narrator', text: 'Cadoc’s song falters. The water presses closer, then eases as he catches it again.',
        choices: [
          { text: '“The seep on the Thornwall. Rhiannon told me.”', to: 'known', when: f('act1.cadoc_secret_known') },
          { text: '“Cadoc? What is she talking about?”', to: 'unknown', when: { not: f('act1.cadoc_secret_known') }, effects: [{ setFlag: 'act1.cadoc_secret_known', value: true }] },
        ],
      },
      known: { speaker: C, text: 'Of course you know. Everybody knows. It is the only thing I have ever done that anyone remembers. (Between breaths.) I was not a child. I was a hundred years old.', next: 'eluned2' },
      unknown: { speaker: C, text: 'Ah. Yes. That. When I was a hundred I sang the whole Lullaby to a seep on the Thornwall, alone, to see what would happen. It closed. I was sick for a year and in disgrace for two hundred, and I have never once dined out on either. (Between breaths.) I was not a child. I was a hundred years old.', next: 'eluned2' },
      eluned2: { speaker: E, text: 'You were a child. You are a child now. Everyone above the water is a child to me. I heard you, Cadi. You were the only one, in all the long dark since the lake closed, who sang it to the end of what the living know. I have been waiting for you to come down and fetch the rest.', next: 'cadoc-name' },
      'cadoc-name': { speaker: C, mood: 'sad', text: '(Very quietly, almost forgetting the song.) You are her. Eluned. My mother never called it the Lullaby. She called it Eluned’s song, as if it were a cradle she had borrowed and meant to give back.', next: 'why' },
      why: {
        speaker: E,
        text: 'I made it. We sang every verse but one that night, on the lake, all of us together. The last we did not sing. It is the only verse that asks anything of the singer, and when it came to it, nobody would give what it asks. So the sea under the lake came up to see who would stay awake with it. And found nobody. And took us all, to keep it company.',
        choices: [
          { text: '“What does it ask?”', to: 'asks' },
          { text: '“Someone stays below. A keeper.”', to: 'keeper', when: f('act2.third_way_known'), tag: 'lore', once: true },
          { text: '“Is this the Mire talking, or you?”', to: 'whose', once: true },
          { text: '“The Archdruid asked me to tell you the roofs were blue.”', to: 'roofs', when: f('npc.rhiannon-ys-caer.uv_roofs'), once: true },
        ],
      },
      asks: { speaker: E, text: 'A watch. It is a lullaby, little spark. Every lullaby has a mother in it, sitting up by the bed so the child can sleep. The verses sing the sleeper down. The last verse is the one who sits up. It says: I will not sleep. I will keep the fire while you dream. Sung by voices alone it is a lie, because voices sleep. Sung with something that burns… (She looks at your hand, the way Rhiannon did, and does not look away.)', next: 'ask' },
      keeper: { speaker: E, text: 'Yes. You have been told, then. Somebody up there has been reading the old songs properly at last. It is not asked of Cadoc, and it is not asked today. It is asked of whoever sings it last, when the last of it is sung. Today it only asks to be remembered.', next: 'why' },
      whose: { speaker: E, text: 'Both, and neither. I have been down here a long time, and the water dreams through me as it dreams through everything. But I made this song before I drowned. It is mine. And the sea has never once been able to sing it. Listen: it cannot even hum it. (Around the hall, for one moment, the bells falter.)', next: 'why' },
      roofs: { speaker: E, mood: 'happy', text: 'Were they? Oh, they were. The blue of a wren’s egg. I had forgotten, and I made songs about those roofs. (She laughs, and it goes up through the water in a string of light.) Tell her I remember her. Small Rhiannon, who would not go to sleep. Tell her she can stop waiting on the shore.', next: 'why' },
      ask: {
        speaker: E,
        text: 'So. I will give it to you, if you will have it. Or you can go back up the stair, and let the Aelthi keep their oath, and I will go on singing it alone down here where it cannot hurt anyone. That is a kindness too. I have had a long while to think about kindnesses.',
        choices: [
          { text: '“Cadoc. It’s your people’s oath. What do you want?”', to: 'cadoc-want', once: true },
          { text: '“Teach it to us.”', to: 'sung', effects: [{ setFlag: 'companion.cadoc-ap-ynys.verse', value: 'sung' }, { unlockLore: 'lore:the-lullaby', section: 'last-verse' }] },
          { text: '“Keep it. Let it stay drowned.”', to: 'left', effects: [{ setFlag: 'companion.cadoc-ap-ynys.verse', value: 'left' }] },
        ],
      },
      again: {
        speaker: 'narrator',
        text: 'You go down the stair again, inside Cadoc’s song, past the slumped white towers and the bells, past the open door that waits, into the singing-hall where the drowned stand in their rows. Eluned is still on the dais, looking at you.',
        next: 'ask',
      },
      'cadoc-want': { speaker: C, text: 'What I want. Nobody has ever asked me that in a lake. (A breath of song.) I want to hear the end of it. I have wanted to hear the end of it since I was a hundred and had a scab on my knee. That is not a reason, spark. That is an appetite. My people drowned for an appetite very like it. You decide. You have the hand that burns. I only have the voice.', next: 'ask' },
      // --- sung
      sung: {
        speaker: 'narrator',
        text: 'She sings it. Not in the voice of the hall; quietly, close to your ear, the way you would sing to one child in a room full of sleeping children. Hun, Ae’Hun, ys hun; mi gwyl, mi gwyl, ni hun. Sleep, Dreaming, sleep below; I keep the watch, I keep the watch, I do not sleep. Tân yn caer, gwyn aer; hiraeth-ys, ni hun. Fire in the hold, bright song; grieving for the drowned, I do not sleep. And then the rest, which is not long, and which you will remember for the rest of your life.',
        next: 'sung2',
      },
      sung2: { speaker: C, text: '(He stops the breath-song. The water closes on your mouth and you hold what air you have.) Forgive me. I cannot sing both, and I find I am not willing to sing only the small one. Keep your hand lit. This will not take long. It is not a long verse. It was only ever a long time coming.', next: 'sung3' },
      sung3: { speaker: 'narrator', text: 'Cadoc sings the last verse of the Lullaby, under the lake, to the drowned of Ys Aerwen. Your marked hand burns in the dark like a coal in a hearth, and the song goes through the light and comes out the other side of it changed, warm, as if it had something in it at last that would not melt. One by one the bells of Ys stop ringing. It sounds like a house at night, as the doors close one after another and the last lamp is turned down. In their rows the drowned close their mouths, and lower their faces, and sleep.', next: 'sung4' },
      sung4: { speaker: E, mood: 'happy', text: 'There. There. That is how it ends. (She is fading, gently, like breath off a glass.) Go up now, Cadi. Tell your great-grandmother the bells have stopped. She will know what it means. (To you:) And you, little spark. Keep it lit. That is all the verse has ever asked. Keep it lit.', next: 'sung5' },
      sung5: { speaker: 'narrator', text: 'You come up the stair half drowned, and lie on the shore coughing water into the snow, and Cadoc lies beside you and does not make a single joke. The mist is already lifting off the lake. When at last he speaks, his voice is wrecked.', next: 'sung6' },
      sung6: {
        speaker: C, mood: 'sad',
        text: 'I sang the fourth line flat. (He laughs, and it turns over halfway into something else, and he puts his arm across his eyes.) All this time. Every grief my people have, and the very end of the song, and I still sing the fourth line flat.',
        choices: [
          { text: '(Sit with him until he is finished.)', to: 'sung-sit' },
          { text: '“She didn’t mind. She never minded.”', to: 'sung-mind' },
        ],
      },
      'sung-sit': { speaker: 'narrator', text: 'You sit in the snow beside him while the light goes. Once he begins to hum, and stops, and begins again, and this time goes all the way to the end. It is the first time anyone above the water has heard it.' },
      'sung-mind': { speaker: C, text: '(After a while.) No. She did not, did she. (He takes his arm from his face.) Thank you, spark. For going down. For bringing me up. I am going to be quite insufferable about the second one for a century or two. You may as well know now.' },
      // --- left
      left: { speaker: E, text: 'Then I will keep it. (She smiles, and it is not a sad smile, quite.) It is no hardship. Somebody has to sit up with the sea. Go up, Cadi. Go up into the cold, where things end. It is a better place than this, for all its winters.', next: 'left2' },
      left2: { speaker: C, mood: 'sad', text: '(The song holds, just.) It is the right thing. I am almost certain it is the right thing. My people would be proud, if they ever spoke to me. (A breath.) I wish it felt like something other than drowning.', next: 'left3' },
      left3: { speaker: 'narrator', text: 'You climb the stair together. Behind you and below you the bells of Ys Aerwen go on ringing, slow, never making a tune, and under them one voice goes on singing past the place where the song ends, alone, for no one, so that it cannot hurt anyone at all.' },
    },
  },
  {
    id: 'dialogue:uv-cadoc-after', name: 'Cadoc: After the lake',
    entries: [{ when: verseIs('sung'), node: 'sung' }, { node: 'left' }],
    nodes: {
      sung: {
        speaker: C, effects: [{ setFlag: 'npc.cadoc-ap-ynys.uv_after', value: true }],
        text: 'I sent word to my great-grandmother. Four words: the bells have stopped. She sent one back. I had to ask Rhiannon what it meant; it is an old word, older than the deepwood. It means the hour when a child finally sleeps and the mother can put down the lamp.',
        next: 'sung2',
      },
      sung2: {
        speaker: C,
        text: 'The verse is in me now, spark. In you too; I watched you learn it. It sits under the breastbone like a swallowed coal. I do not know what it is for, yet. I am fairly sure I am going to find out at the worst possible moment.',
        choices: [
          { text: '“Are you all right, Cadoc?”', to: 'right' },
          { text: '“Whatever it’s for, we’ll sing it together.”', to: 'together', effects: [{ loyalty: C, delta: 5 }] },
        ],
      },
      right: { speaker: C, text: 'No. Yes. I have been grieving for a city I never saw, on behalf of people who will not speak to me, and it turns out I was quite good at it all along. (A thin smile.) I shall be insufferable again by Calunday. Ask me then.' },
      together: { speaker: C, mood: 'happy', text: 'You cannot sing. I have heard you. (He looks away, pleased.) Yes. All right. Together, then. You keep the fire. I shall keep the tune.' },
      left: {
        speaker: C, mood: 'sad', effects: [{ setFlag: 'npc.cadoc-ap-ynys.uv_after', value: true }],
        text: 'I still hear the bells. I expect I always shall. It is not so bad. It is like living near the sea: after a while one only notices when they stop.',
        next: 'left2',
      },
      left2: {
        speaker: C,
        text: 'Rhiannon thanked me. The Archdruid of the Thornwise, in front of the whole Grove, thanked me for keeping an oath. Two hundred years in disgrace and that is how they mend it: for the one thing I did not do.',
        choices: [
          { text: '“Do you regret it?”', to: 'regret' },
          { text: '“You chose kindness. Eluned said so.”', to: 'kind', effects: [{ loyalty: C, delta: 5 }] },
        ],
      },
      regret: { speaker: C, text: 'Every night, a little, at about the fourth line. Then I remember the hall, and the children in their rows with their mouths open, and I do not. Ask me again when the world is ending. I suspect the answer will change.' },
      kind: { speaker: C, text: 'She did. She also said the cold is where things end, and that it is a better place. I have decided to believe her about both. It is the sort of thing one decides, I find, rather than knows.' },
    },
  },

  // =====================================================================
  // quest:iron-remembers
  // =====================================================================
  {
    id: 'dialogue:ir-grimma-ring', name: 'Grimma: The cut ring',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'Grimma has taken the cord from round her neck, the one she never takes off, and laid it on the table between you. On it hang two halves of a plain iron ring, dark and heavy, each with half a rune cut into it. The cut is clean as a cut loaf.', next: 'ring' },
      ring: { speaker: G, text: 'Ironsong ring. Every Ironsong gets one at the naming. Clan iron, the clan rune, and the words sung into it while it’s hot: what the hold knows, the hold keeps. I was forty. I’d worn it a hundred and twenty years.', next: 'ring2' },
      ring2: {
        speaker: G,
        text: 'When they wrote grenn against me, Ulka cut it. Clan-mother. My mother’s sister. She held me at my naming, and she held the chisel at my unnaming, and her hand didn’t shake either time. I’ll give her that.',
        choices: [
          { text: '“Why keep the pieces?”', to: 'keep', once: true },
          { text: '“You want to go back.”', to: 'back', once: true },
          { text: '“Brannoch wrote your name back in the High Ledger.”', to: 'thane', when: restored, once: true },
          { text: '“The lower holds are under black water.”', to: 'flooded', when: f('act2.korrath_flooded'), once: true },
          { text: '“The Ninth Nail stands.”', to: 'nail', when: f('act2.new_nail'), once: true },
          { text: '“What would it take to mend it?”', to: 'take' },
        ],
      },
      keep: { speaker: G, text: 'Iron remembers. Cut a ring and the halves still want each other. Hold them close and you can feel it, a little pull, like a lodestone. Throw them in a river and they’d lie at the bottom wanting. (She shrugs.) Seemed unkind.', next: 'ring2' },
      back: { speaker: G, text: 'Want’s a strong word. (She turns one half over with her thumb.) I want it mended. Whether I want it mended as it was is another sum, and I haven’t finished counting.', next: 'ring2' },
      thane: { speaker: G, text: 'That’s the Thane’s book. Hold business. The ring’s clan business. Brannoch can write me into every ledger under the mountain and I’m still a cut ring to Ulka. (A pause.) He gave me something, after. In the hall, when you weren’t looking. I didn’t say.', next: 'thane2' },
      thane2: { speaker: 'narrator', effects: [{ setFlag: 'npc.grimma-ironsong.ring_iron', value: true }], text: 'From inside her jerkin she takes a lump of black metal the size of a thumb, and sets it beside the ring. It is warm. True-iron is given by the High Thane, for a deed the ledger thinks worth it, and then you owe for it, and so do your children. Grimma looks at it as if it might bite.', next: 'ring2' },
      flooded: { speaker: G, mood: 'sad', text: 'Aye. Ironsong’s ledger-hall is one of them. The old book, with my name scratched out of it, is sitting in black water with the rest. (She laughs, not kindly.) So there’s no ledger left to write me back into. Only Ulka, and whatever Ulka remembers. That’s what Orrun are, at the bottom. What we remember.', next: 'ring2' },
      nail: { speaker: G, text: 'It does. I swore korr nagh on it while the hammer fell; I will hold. Ulka will have heard by now. The whole mountain’s heard. Whether a new Nail weighs anything against an old silence, in her scales… (She shakes her head.) I don’t know her scales. Never have.', next: 'ring2' },
      take: { speaker: G, text: 'True-iron for the weld. Nothing else holds a cut a clan-mother made. And a hearing: the clan-mother at the anvil, to strike the first blow, or to refuse it. A ring forged without her is jewellery. I’d sooner wear nothing.', next: 'iron' },
      iron: {
        speaker: G,
        text: 'So. Iron, and Ulka.',
        choices: [
          { text: '“I have true-iron. From the Vault.”', to: 'give', when: { all: [hasTrueIron, { not: ringIron }] }, effects: [{ takeItem: 'item:true-iron' }, { setFlag: 'npc.grimma-ironsong.ring_iron', value: true }] },
          { text: '“Brannoch honoured you in his hall. Was there iron in it?”', to: 'thane2', when: { all: [restored, { not: ringIron }] } },
          { text: '“Where do we find true-iron?”', to: 'father', when: { not: ringIron } },
          { text: '“You have Brannoch’s iron. Send for her.”', to: 'send', when: ringIron },
        ],
      },
      give: { speaker: G, text: '(She takes it out of your palm very carefully, as you would take an egg from a nest.) Vault iron. Cut with your own hand, I’ll wager, and it let you. (She closes her fist on it.) I’ll owe you for this. I’ll write it down. Don’t argue.', next: 'send' },
      father: { speaker: G, text: 'The Kneeling Father. An Orrin, down the valley from the gate, rusted on his knees with his hands open, the way you’d hold out water to somebody thirsty. Clan Ironsong comes from him. That’s the story, and I believe it on good days. There’s true-iron in his breast, where Orr put the heart. Nobody takes from him. (A pause.) We ask.', next: 'send' },
      send: { speaker: G, text: 'I’ll send word up to Ulka. She’ll come down or she won’t, and if she won’t, I’ll know, and that’s an answer too. (She knots the cord back round her neck, and the halves clink.) Iron remembers, Ember-hand. Let’s see what my clan does.' },
    },
  },
  {
    id: 'dialogue:ir-grimma-waiting', name: 'Grimma: Before the hearing',
    entries: [
      { when: { questStage: QI, stage: 'hearing' }, node: 'hearing' },
      { node: 'iron' },
    ],
    nodes: {
      iron: {
        speaker: G, text: 'The Father’s down the valley. Mind the rust-wraiths; they cling to him the way flies cling to a horse. And keep your boots off him.',
        choices: [
          { text: '“Use Brannoch’s iron.”', to: 'thane', when: { all: [restored, { not: ringIron }] } },
          { text: '“Take this true-iron instead.”', to: 'give', when: { all: [hasTrueIron, { not: ringIron }] }, effects: [{ takeItem: 'item:true-iron' }, { setFlag: 'npc.grimma-ironsong.ring_iron', value: true }] },
          { text: '“Let’s go.”', to: null, tag: 'leave' },
        ],
      },
      thane: { speaker: G, effects: [{ setFlag: 'npc.grimma-ironsong.ring_iron', value: true }], text: '(She takes the thumb of black iron out of her jerkin and looks at it.) Aye. Brannoch’s. I was keeping it for something that mattered. (She snorts.) Listen to me. Fine. We’ll leave the Father be.' },
      give: { speaker: G, text: 'Vault iron. (She closes her fist on it.) Then the Father can keep his heart. Good. I never liked the thought of asking him.' },
      hearing: { speaker: G, text: 'She’s coming. I can feel it in my teeth. Or that’s the cold. Stand where she can see you, and for Orr’s sake don’t call her madam. The last human who called her madam is still in the ledger.' },
    },
  },
  {
    id: 'dialogue:obj-kneeling-father-heart', name: 'Object: The Kneeling Father',
    entries: [
      { when: f('npc.grimma-ironsong.father_asked'), node: 'after' },
      { when: ringIron, node: 'spared' },
      { when: { questStage: QI, stage: 'iron' }, node: 'start' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'narrator', text: 'An Orrin kneels in the snow, as tall kneeling as a watchtower, rusted red from crown to knee. His hands are held out before him, palms up, full of snow.' },
      spared: { speaker: 'narrator', text: 'The Kneeling Father holds his hands out to the snow. Behind the split plate of his chest something dark and unrusted is faintly, very faintly, warm. You leave it where it is.' },
      after: { speaker: 'narrator', text: 'The Kneeling Father holds his empty hands out to the snow. Someone has brushed them clean.' },
      start: {
        speaker: 'narrator',
        text: 'He kneels in the snow at the head of the valley, as tall kneeling as a watchtower: an Orrin, one of the Fathers, rusted red from crown to knee, his great head bowed, his hands held out before him, palms up, the way you would offer water to someone thirsty. The plate of his chest has split. Behind it, where a heart would be, is a knot of black metal that has not rusted at all. When you come close it is warm, the way a stone is warm an hour after the sun has gone.',
        choices: [
          { text: '“Grimma. Ask him.”', to: 'ask', when: grimmaHere },
          { text: 'Lay your marked hand on the iron, and ask.', to: 'mark' },
          { text: '[Might 15] Break a piece of the heart-iron free.', to: 'might', once: true, check: { stat: 'might', dc: 15, failTo: 'might-fail' } },
        ],
      },
      ask: { speaker: 'narrator', text: 'Grimma takes off her gloves and kneels in the snow in front of him, small as a child at his knee, and puts both bare hands on his rusted fingers. Then she sings. It has no words. It is low and rough and it goes on a long time, and the iron of the Father hums under it, one deep note, like a bell struck under the earth. That is what an Ironsong is, you understand at last. Not a name. A thing her clan does.', next: 'ask2' },
      ask2: { speaker: 'narrator', effects: [{ setFlag: 'npc.grimma-ironsong.ring_iron', value: true }, { setFlag: 'npc.grimma-ironsong.father_asked', value: true }, { loyalty: G, delta: 5 }], text: 'In the Father’s open palm the snow sinks, and steams, and is gone, and lying in the hollow of his hand is a lump of black true-iron the size of a hen’s egg, as if it had always been there and the snow had only hidden it.', next: 'ask3' },
      ask3: { speaker: G, mood: 'sad', text: '(She does not pick it up at once.) …He’s never done that. Not in any story. Not once. (She takes it, and then she touches the great rusted finger, gently, the way you touch a sleeping face.) Korr nagh, Father. I’ll make it worth it.' },
      mark: { speaker: 'narrator', effects: [{ setFlag: 'npc.grimma-ironsong.ring_iron', value: true }, { setFlag: 'npc.grimma-ironsong.father_asked', value: true }], text: 'You lay your hand against the heart-iron. The Ashmark warms it, and it softens under your palm like wax near a flame, and a piece the size of a hen’s egg comes away into your hand, heavy and black. For a moment, through your palm, you feel the whole Father: cold, enormous, patient. Then a little less warm than he was.', next: 'mark2' },
      mark2: {
        speaker: 'narrator', text: 'The valley is very quiet.',
        choices: [
          { text: '[Grimma] Look at Grimma.', to: 'mark-g', when: grimmaHere },
          { text: 'Take the iron back to the forge.', to: null },
        ],
      },
      'mark-g': { speaker: G, text: 'You asked him. With the hand. (She is quiet a moment.) …Aye. Aye, I suppose that’s asking, of a kind. Your kind. Come on. He’s given what he’s given.' },
      might: { speaker: 'narrator', effects: [{ setFlag: 'npc.grimma-ironsong.ring_iron', value: true }, { setFlag: 'npc.grimma-ironsong.father_asked', value: true }, { setFlag: 'npc.grimma-ironsong.father_struck', value: true }], text: 'You set your feet and strike the heart-iron with everything you have. It does not ring. It cracks, with a sound like a bell breaking, and a jagged piece the size of a hen’s egg drops into the snow at the Father’s knee. Rust sifts down from his bowed head like red snow.', next: 'might2' },
      might2: {
        speaker: 'narrator', text: 'The echo goes a long way down the valley.',
        choices: [
          { text: '[Grimma] Look at Grimma.', to: 'might-g', when: grimmaHere },
          { text: 'Take the iron back to the forge.', to: null },
        ],
      },
      'might-g': { speaker: G, mood: 'angry', effects: [{ loyalty: G, delta: -5 }], text: '(She does not speak for a long time.) We don’t do that. (She picks up the iron herself, and brushes the rust off the Father’s knee with her sleeve.) We don’t do that, human. Not to him. I’ll weld with it, because it’s cut now and wasting it’s worse. But don’t you ever.' },
      'might-fail': { speaker: 'narrator', text: 'You strike the heart-iron and your arm goes numb to the shoulder. The iron does not care how hard you hit it. It has not cared about anything for three thousand years.', next: 'start' },
    },
  },
  {
    id: 'dialogue:ir-ulka-hearing', name: 'Ulka Ironsong: The hearing',
    entries: [
      { when: ringIs('old'), node: 'after-old' },
      { when: ringIs('new'), node: 'after-new' },
      { when: ringIs('none'), node: 'after-none' },
      { when: f('npc.ulka-ironsong.heard'), node: 'verdict' },
      { when: f('act2.korrath_flooded'), node: 'start-flooded' },
      { node: 'start' },
    ],
    nodes: {
      // --- arrival
      start: {
        speaker: 'narrator', effects: [{ setFlag: 'npc.ulka-ironsong.heard', value: true }],
        text: 'She comes down the mountain road on foot, though the road is ice and she is a hundred and ninety, with two hold-wardens behind her carrying lanterns and a third carrying the Ironsong ledger on his back in its iron covers, bent under it like a man under a millstone. She is smaller than Grimma. She takes up the whole forge. Her knuckles and temples have gone to granite, and her white hair, braided to the knee, is hung with iron rings, one for every Ironsong she has named. She sits down on Grimma’s stool by the anvil without being asked.',
        next: 'greet',
      },
      'start-flooded': {
        speaker: 'narrator', effects: [{ setFlag: 'npc.ulka-ironsong.heard', value: true }],
        text: 'She comes down the mountain road on foot, though the road is ice and she is a hundred and ninety, with two hold-wardens behind her carrying lanterns. Nobody carries a ledger. The Ironsong ledger is under black water, with the old halls. She is smaller than Grimma. She takes up the whole forge. Her knuckles and temples have gone to granite, and her white hair, braided to the knee, is hung with iron rings, one for every Ironsong she has named. Some of the rings, you notice, have been threaded on a black cord. She sits down on Grimma’s stool by the anvil without being asked, and does not look at you at all.',
        next: 'greet-flooded',
      },
      greet: { speaker: U, text: 'Grimma. (Grimma says, “Clan-mother.”) You asked for a hearing. Exiles do not ask for hearings. They ask for nothing; that is why we call them exiles. But you always did count what you were not told to count.', next: 'human' },
      'greet-flooded': { speaker: U, mood: 'angry', text: 'Grimma. (Grimma says, “Clan-mother.”) You will forgive me if I do not greet your human. Forty-one of my clan came up the stair out of the old halls with what they could carry on their backs. Eleven did not. The human knows why. Let it stand there and know it while I talk to you.', next: 'charge' },
      human: {
        speaker: U,
        text: 'And this is the human. The one with the shard at the gate, who held it up over its head like a fishwife with a mackerel. (She looks you up and down, and it takes a while.) Well?',
        choices: [
          { text: '“I’d do it again.”', to: 'again' },
          { text: '“Korr nagh, clan-mother.”', to: 'korr' },
          { text: '“Madam.”', to: 'madam', once: true },
          { text: '(Say nothing. Let her look.)', to: 'silent' },
        ],
      },
      again: { speaker: U, text: 'Of course you would. Humans always would. It is the one thing about you that never needs saying, and you say it anyway. (But the corner of her mouth moves.)', next: 'charge' },
      korr: { speaker: U, text: 'Iron-oath, from a mouth that lives sixty years. (She weighs it.) Either nothing, or more than it knows. We will see which.', next: 'charge' },
      madam: { speaker: U, mood: 'angry', text: '(A long silence. Behind you, Grimma makes a small noise of pure despair.) There was a human called me that, once. He is in the ledger. Do not join him.', next: 'charge' },
      silent: { speaker: U, text: 'Hm. It can hold its tongue. Somebody should have taught that to you, Grimma, a hundred years ago. I tried.', next: 'charge' },
      // --- the charge
      charge: { speaker: U, text: 'Hear the charge, then, since it has been asked for. Grimma of Ironsong was given her ring at her naming with the words: what the hold knows, the hold keeps. She went down into the Vault on the hold’s business and came up with the hold’s shame, and she did not keep it. She shouted it at a gate full of carters and refugees. I cut her ring with my own chisel. I would cut it again.', next: 'defence' },
      defence: { speaker: G, text: 'I counted true.', next: 'aloud' },
      aloud: {
        speaker: U,
        text: 'You counted aloud. There is a difference, and the difference is the whole of what it is to be Orrun. (She turns her coal-dark eyes on you at last.) Who stands for her?',
        choices: [
          { text: '“She told the truth. An oath to keep a lie is rust from the first day.”', to: 'stand-ok', tag: 'persuade', check: { stat: 'will', dc: 15, failTo: 'stand-fail' } },
          { text: '“The Ninth Nail stands because she counted.”', to: 'nail', when: f('act2.new_nail'), effects: [{ setFlag: 'npc.ulka-ironsong.moved', value: true }] },
          { text: '“I took the fire out of the Deep, and your halls drowned for it. I’ll answer for that before I speak for her.”', to: 'answer', when: f('act2.korrath_flooded'), effects: [{ setFlag: 'npc.ulka-ironsong.moved', value: true }] },
          { text: '“The High Thane wrote her back into his ledger, before his whole hall.”', to: 'thane', when: restored, once: true },
          { text: '[Warden] “A hold is kept by the ones who watch it. She watched.”', to: 'warden', when: { classIs: 'class:warden' }, tag: 'class', effects: [{ setFlag: 'npc.ulka-ironsong.moved', value: true }] },
          { text: '“Grimma can stand for herself.”', to: 'herself', effects: [{ setFlag: 'npc.ulka-ironsong.moved', value: true }] },
          { text: '“I stand for her. Korr nagh.”', to: 'oath' },
        ],
      },
      'stand-ok': { speaker: U, effects: [{ setFlag: 'npc.ulka-ironsong.moved', value: true }], text: '(She is quiet a long while. One of the wardens shifts on the ice.) …Rust from the first day. That is an old Ironsong saying. My grandmother had it. (Sharply, to Grimma:) You taught it that.', next: 'verdict' },
      'stand-fail': { speaker: U, text: 'Humans say truth the way they say weather: as though it costs nothing to say. It cost her a ring. It cost me a niece. Say it again when it has cost you something.', next: 'verdict' },
      nail: { speaker: U, text: 'The Ninth. Aye. We heard it on the mountain, the night it went in: the whole rock rang, hold to hold, like a struck anvil. Old Dhurm wept at the table and would not say why. (She looks at Grimma.) You swore on it while the hammer fell. I heard that too.', next: 'verdict' },
      answer: { speaker: U, mood: 'sad', text: '(For the first time she looks straight at you.) …So you know what you did. Good. Most do not. Most say the world needed it, as if the world were a person who could come and stand in my hall and count my dead. (A breath.) I hear you. It is in my ledger now, the one I carry in my head. It will not come out.', next: 'answer2' },
      answer2: { speaker: G, mood: 'angry', text: 'They took it because the world needed it, clan-mother. Same sum I did at the gate. Same sum you did when you cut me. Somebody’s always under the water when the sum comes out.', next: 'verdict' },
      thane: { speaker: U, text: 'Deepforge’s book is not my book. (A pause.) In front of the whole hall? With the stylus? (Grimma nods.) Hm. Brannoch has never in his life admitted to a mistake before witnesses. He must be dying.', next: 'aloud' },
      warden: { speaker: U, text: 'You talk like a hold-warden. Somebody taught you to stand at a gate. (She considers.) Watched, aye. That is a word with more than one edge. I will think on it.', next: 'verdict' },
      herself: { speaker: G, text: 'I went down to sing the runes and I found two Nails gone to grenn and black water round their heads, and I came up and told the Thane, and the Thane said keep it. And I thought of every child in every hold sleeping over that water, trusting nine. And I could not, Ulka. I could not keep it. That’s the whole of it. I’ve no better words.', next: 'herself2' },
      herself2: { speaker: U, mood: 'sad', text: '(Very low.) No. You never did have better words. Only true ones. It was always the worst thing about you.', next: 'verdict' },
      oath: { speaker: U, text: 'Then it is in my ledger, human, the one in my head. (She taps her temple, granite on granite.) If she breaks faith again, you broke it. Remember that I told you.', next: 'verdict' },
      // --- the verdict and the choice (reopenable)
      verdict: { speaker: U, text: 'Here is my word. I will strike your ring, Grimma, if you will have it struck. As it was: the old iron, the old words. What the hold knows, the hold keeps. The silence you broke is broken and cannot be mended; but the next one you will keep, as an Ironsong keeps it. That is what I offer. I have offered nothing to an exile in a hundred and ninety years.', next: 'look' },
      look: {
        speaker: G,
        text: '(She looks at the halves on the anvil, and then at you.) …Well, Ember-hand? You’ve stood for me. Stand next to me a minute longer. Tell me what you’d do.',
        choices: [
          { text: '“Take it as it was, Grimma. You’ve earned your way home.”', to: 'old', effects: [{ setFlag: 'companion.grimma-ironsong.ring', value: 'old' }] },
          { text: '“Forge it new. Clan iron, true-iron and my fire, and new words in it.”', to: 'new-moved', when: moved, effects: [{ setFlag: 'companion.grimma-ironsong.ring', value: 'new' }] },
          { text: '“Forge it new. Clan iron, true-iron and my fire, and new words in it.”', to: 'new-cold', when: { not: moved }, effects: [{ setFlag: 'companion.grimma-ironsong.ring', value: 'new' }] },
          { text: '“You don’t need their ring. Refuse it.”', to: 'none', effects: [{ setFlag: 'companion.grimma-ironsong.ring', value: 'none' }] },
          { text: '“It’s your ring, Grimma. What do you want?”', to: 'wants', once: true },
        ],
      },
      wants: { speaker: G, text: 'What I want. (She laughs, short.) I want to have been wrong in the Vault. I want my mother alive to shout at me. I want to sit at the Ironsong table and be passed the salt. None of that’s on the anvil. What’s on the anvil is two halves of a ring, and you, and her. Tell me.', next: 'look' },
      // --- old
      old: { speaker: 'narrator', text: 'Ulka rises. She takes up Grimma’s hammer, weighs it, and grunts approval. The halves go into the fire with the true-iron between them, and when they are white she draws them out and strikes the first blow herself, once, hard, and the forge rings like a hall-bell. Then she hands the hammer to Grimma, and Grimma strikes the rest, and between the blows the two of them sing the old words into the iron, one low voice and one rough one: what the hold knows, the hold keeps.', next: 'old2' },
      old2: { speaker: U, effects: [{ setFlag: 'npc.ulka-ironsong.left', value: true }], text: '(She watches Grimma push the ring onto her finger, still warm.) Ironsong. (Just the name, given back, as if it were a coin.) Come up the mountain on Vorsday. Your cousins want to shout at you in person. I have told them they may.', next: 'old3' },
      old3: { speaker: G, text: '(When the lanterns have gone up the road, she turns the ring on her finger.) Silence. Aye. I’ll keep the next one. (A pause.) I’ll choose it careful, though. That’s the part she didn’t say, and she didn’t say it on purpose. That’s Ulka.' },
      // --- new
      'new-moved': { speaker: U, text: 'New words. (She looks into the fire a long while.) The first Ironsong was a smith who heard the Father’s iron humming in the rock, and sang back to it. Nobody had done that. They called her mad, and then they called her clan-mother. (She rises.) Ironsong was a new song once. Put your hand in, human, since you have such a hot one.', next: 'new-forge' },
      'new-cold': { speaker: U, mood: 'angry', text: 'A ring with a human’s fire in it. That is not an Ironsong ring. (Grimma says, “No. It’s mine.”) …Then it had better hold. (She rises, and takes the hammer.) Put your hand in, human. Let us see what you are worth.', next: 'new-forge' },
      'new-forge': { speaker: 'narrator', text: 'You lay your marked hand over the weld. The Ashmark goes into the true-iron like a coal sinking into snow, and the iron runs between the halves like honey, bright as a forge on the first morning. Grimma strikes, and strikes, and sings, and the words she sings are not the old words. What is true, I will say. And I will say it careful. When she draws the ring out of the water it has a thin seam of light all the way round, like a crack in a door with a fire behind it.', next: 'new-ulka' },
      'new-ulka': { speaker: U, effects: [{ setFlag: 'npc.ulka-ironsong.left', value: true }], text: 'That is not an Ironsong ring. (She takes the hammer out of Grimma’s hand and strikes the ring once on the anvil, the clan-mother’s blow, so that it rings.) It is now. Come up the mountain when you like, Grimma. Bring your human. Wipe its boots.', next: 'new-g' },
      'new-g': { speaker: G, mood: 'happy', text: '(She holds her hand up to the forge-light, and the seam glows.) Look at that. Look at it. Grenn take me, I’ve made a thing nobody’s made before. (Gruffly.) We made it. It’s got your fire in. You’d better not go out, Ember-hand. I’d take it personal.' },
      // --- none
      none: { speaker: G, text: '(She is still a long moment. Then, very quietly:) …Aye. (She lifts the cord from round her neck, slides the two halves off it, and drops them into her own forge. They lie in the coals and begin, slowly, to glow. Ulka watches. She does not stop her.)', next: 'none2' },
      none2: { speaker: G, text: 'I’ll keep my own ledger, clan-mother. First page is already written.', next: 'none3' },
      none3: { speaker: U, text: 'And what is on it?', next: 'none4' },
      none4: { speaker: G, text: '(She jerks her head at you.) Debts. Mostly to that one.', next: 'none5' },
      none5: { speaker: U, mood: 'sad', effects: [{ setFlag: 'npc.ulka-ironsong.left', value: true }], text: 'A clan of one is a stubborn thing to be. You always were. (She rises, and at the door of the forge she stops, without turning round.) The chisel is still in my belt, Grimma. I have never cleaned it. Make of that what you like.', next: 'none6' },
      none6: { speaker: G, mood: 'sad', text: '(When the lanterns are gone up the road she sits down on the stool Ulka left, and watches the halves go soft in the coals.) Never cleaned it. (She wipes her face with a sooty glove and makes it worse.) Grenn take her. Grenn take the old stone. …Pass me that tongs. I’m not letting good iron go to waste. I’ll make you something.' },
      // --- reopened after the choice
      'after-old': { speaker: U, effects: [{ setFlag: 'npc.ulka-ironsong.left', value: true }], text: 'It is struck. Vorsday, Grimma. Do not make me come down this road again; my knees are older than your Concord.' },
      'after-new': { speaker: U, effects: [{ setFlag: 'npc.ulka-ironsong.left', value: true }], text: 'It is struck, and it is hers, and it is not ours, and it is. Do not ask me to make sense of it. I am a hundred and ninety. I do not have to.' },
      'after-none': { speaker: U, effects: [{ setFlag: 'npc.ulka-ironsong.left', value: true }], text: 'I have nothing more to say to an exile. (A pause.) Keep her warm, human. She feels the cold more than she lets on. She always did.' },
    },
  },
  {
    id: 'dialogue:ir-grimma-after', name: 'Grimma: After the hearing',
    entries: [
      { when: ringIs('old'), node: 'old' },
      { when: ringIs('new'), node: 'new' },
      { node: 'none' },
    ],
    nodes: {
      old: {
        speaker: G, effects: [{ setFlag: 'npc.grimma-ironsong.ir_after', value: true }],
        text: 'Vorsday, then. Up the mountain. They’ll shout at me for three hours, and then some cousin will pass me the salt without being asked, and I’ll have to go outside for a bit. I know exactly how it’ll go. I’ve known for a hundred years. (She turns the ring.) Don’t say anything. You’ll only say it wrong.',
        choices: [
          { text: '(Say nothing.)', to: 'old-quiet', effects: [{ loyalty: G, delta: 5 }] },
          { text: '“Welcome home, Grimma.”', to: 'old-home' },
        ],
      },
      'old-quiet': { speaker: G, text: '…Good. You’re learning. There’s hope for you yet, human.' },
      'old-home': { speaker: G, text: 'See. Said it wrong. (But she is smiling into her beard-braids, which you did not know was possible.)' },
      new: {
        speaker: G, effects: [{ setFlag: 'npc.grimma-ironsong.ir_after', value: true }],
        text: 'Every smith in the gate-town will be up this road by morning to look at it. At my hand, as if I were a shrine. One of them will ask me to make him one. (She snorts.) I’ll say, go and get yourself exiled for telling the truth, and find a human with a burning hand, and then we’ll talk.',
        choices: [{ text: '“Does it feel like yours?”', to: 'new2' }, { text: '[Leave]', to: null, tag: 'leave' }],
      },
      new2: { speaker: G, text: 'It feels like a ring that doesn’t know what it is yet. (She flexes her hand; the seam glows and fades.) Suits me. Neither do I. Neither do you, I reckon, under all that fire. Korr nagh, Ember-hand: what is true, I’ll say. Starting with this. You did right by me.' },
      none: {
        speaker: G, effects: [{ setFlag: 'npc.grimma-ironsong.ir_after', value: true }],
        text: 'Made you something, from the halves. (She holds out a plain iron clasp, dark and heavy, with half a rune on either side that do not quite meet.) It’s nothing. Holds a cloak. Iron remembers, so it’ll keep wanting to close. Seemed fitting.',
        choices: [
          { text: '“I’ll wear it.”', to: 'none-wear', effects: [{ loyalty: G, delta: 5 }] },
          { text: '“Grimma. Are you all right?”', to: 'none-right' },
        ],
      },
      'none-wear': { speaker: G, text: 'Course you will. It’s good work. (She looks away.) First line in my ledger, that. Paid.' },
      'none-right': { speaker: G, mood: 'sad', text: 'No. Aye. Ask me in fifty years. (She pushes the clasp into your hand and closes your fingers on it.) Take it. I’d sooner it was wanting to close on you than lying in the coals wanting.' },
    },
  },
];

export default dialogues;
