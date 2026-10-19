/**
 * Dialogue: companion personal quests, part 2b (docs/lore/13-companions.md §1): quest:the-quiet-hollowing (Sable).
 * The scene at the water is the test case for redeeming Ysolde. Owner: Claude 4.
 */
import type { DialogueDef, NarrativeCondition } from '@/core';

const QH = 'quest:the-quiet-hollowing';
const S = 'npc:sable' as const, Y = 'npc:ysolde' as const, M = 'npc:maren-hollis' as const;

const f = (flag: string): NarrativeCondition => ({ flag });
const not = (c: NarrativeCondition): NarrativeCondition => ({ not: c });
const fateIs = (v: 'saved' | 'gone' | 'bound') => ({ flag: 'companion.sable.fate', op: '==' as const, value: v });
const tobinP = (v: 'saved' | 'dead' | 'hollowed') => ({ flag: 'prologue.tobin_fate', op: '==' as const, value: v });
const tobinSaved = f('act1.tobin_saved'), tobinLost = f('act1.tobin_lost');
const strongMark = { flag: 'ashmark.rank', op: '>=' as const, value: 4 };
const salve: NarrativeCondition = { hasItem: 'item:briar-salve' };
const maren = f('companion.maren-hollis.following');
const tobinHome: NarrativeCondition = { any: [tobinSaved, tobinP('saved')] };
const tobinGone: NarrativeCondition = { any: [tobinLost, tobinP('dead')] };
const plainTobin: NarrativeCondition = { not: { any: [tobinSaved, tobinLost, tobinP('saved'), tobinP('dead')] } };

const dialogues: DialogueDef[] = [
  {
    id: 'dialogue:qh-sable-signs', name: 'Sable: Cold hands',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'Sable is sitting as close to the fire as she can get without being in it, with her knees drawn up and her hands held out to the flames. She has stopped wiping her eyes. The tears run black down both cheeks to her jaw and drip, and where they drip the snow does not melt.', next: 'hello' },
      hello: {
        speaker: S, mood: 'happy',
        text: 'Evening! Don’t mind the face. I’ve decided it’s a look. Very fashionable in Greywater, I hear; all the best drowned people are wearing it. (Her teeth are chattering.) Sit down, love. You’re letting the warm out.',
        choices: [
          { text: '“Your hands. Let me see.”', to: 'hands', once: true },
          { text: '“What do you hear, Sable?”', to: 'hear', once: true },
          { text: '[Hollow-touched] “I can hear it too. The singing.”', to: 'hollow', when: { dialogueTag: 'hollow-touched' }, tag: 'trait', once: true },
          { text: '“Let me burn it out of you. Tonight.”', to: 'burn', once: true },
          { text: '“How long have you got?”', to: 'long', once: true },
          { text: '“Get some sleep.”', to: 'night' },
        ],
      },
      hands: { speaker: 'narrator', text: 'She holds them out, palms up, with a showman’s flourish. They are white to the wrist, the nails gone the grey of pond-ice, and when you take them they are colder than the snow. She closes her fingers round your marked hand and holds on, hard, and for a moment she does not say anything clever at all.', next: 'hands2' },
      hands2: { speaker: S, text: 'Ooh, that’s nice. You’re like a hot brick in a bed. (She lets go, quickly.) Don’t tell anyone I did that. I’ve a reputation for being unhandleable.', next: 'hello' },
      hear: { speaker: S, mood: 'hollow', text: '(She tilts her head, as if it were playing now.) A lady singing. A cradle-song, very low, like somebody’s mam in the next room. She sings so kindly, love. She says she’s sorry. She says it every time: I’m sorry, little thief, it will stop hurting soon. Nobody’s ever said sorry to me that often. I’ve grown quite fond of her.', next: 'hear2' },
      hear2: { speaker: S, text: '(Brightly.) She says it’ll be like falling asleep in a warm kitchen with the bread in. I’ve never had a warm kitchen. It’s a very good offer. I’m only telling you so you know what the competition is.', next: 'hello' },
      hollow: { speaker: S, mood: 'sad', text: 'Do you? (She looks at you properly, for the first time tonight.) Oh, love. I’m sorry. I wouldn’t wish her on anyone, and I’d not have wished anyone on me either, and here we both are, listening. (She shuffles closer, so your shoulders touch.) There. Now it’s a choir.', next: 'hello' },
      burn: {
        speaker: S, mood: 'afraid',
        text: 'No. (Too fast. She laughs to cover it.) Not tonight. Not here, with everyone watching and me in my second-best face. I’ve seen you do it, love. I’ve seen what it costs, the one doing it and the one it’s done to.',
        next: 'burn2',
      },
      burn2: { speaker: S, text: 'Give me a bit. I want to think about it somewhere quiet. I’ve never once in my life made a decision in front of an audience. Ruins the trick.', next: 'hello' },
      long: { speaker: S, text: 'Long enough to know I’ve not got long. (She shrugs.) A few days of me. Then I expect it’ll still walk about with my face on, and say lovely, and pick locks, and it won’t be me at all. That’s the bit I mind. Not the going. The something else staying.', next: 'hello' },
      night: { speaker: S, mood: 'happy', text: 'Goodnight, love. Wake me if anything interesting happens. Or if anyone leaves a purse lying about. (She curls up by the fire with her cold hands tucked under her arms, and smiles at you over her knees, black-cheeked, until you look away.)' },
    },
  },
  // ----- the scene at the water (obj:quiet-water, and Sable's route during the stage)
  {
    id: 'dialogue:obj-quiet-water', name: 'Object: Sable at the water',
    entries: [
      { when: fateIs('saved'), node: 'after-saved' },
      { when: fateIs('gone'), node: 'after-gone' },
      { when: fateIs('bound'), node: 'after-bound' },
      { when: f('npc.sable.qh_found'), node: 'again' },
      { when: { questStage: QH, stage: 'water' }, node: 'start' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'narrator', text: 'A pool of black water among the frozen reeds. Everything else in the marsh is iron-grey with ice. This does not freeze.' },
      'after-saved': { speaker: 'narrator', text: 'The black pool among the reeds has gone grey and dull, and a skin of ice is creeping out across it from the edges. Somebody has dropped a penny on the ice. It has not sunk.' },
      'after-gone': { speaker: 'narrator', text: 'Her boots are still on the bank, side by side, toes together. Someone has put a penny in each. The black water lies perfectly still, and the reeds do not sing.' },
      'after-bound': { speaker: 'narrator', text: 'The reeds are broken and trampled where she fought you. The black water lies still, waiting, and nobody comes.' },
      again: { speaker: S, mood: 'hollow', text: 'Still here, love. Still me, mostly. The water’s not going anywhere and neither am I, not till you’ve said your piece. (She pats the frozen bank beside her.)', next: 'choice' },
      start: {
        speaker: 'narrator', effects: [{ setFlag: 'npc.sable.qh_found', value: true }],
        text: 'The marsh is frozen grey from one end to the other, every reed sheathed in ice. Except here. In a hollow among the reeds lies a pool of black water that smokes faintly in the cold and does not freeze, and on its bank a pair of boots stands side by side, toes together, the way a tidy guest leaves them at the door. Sable sits beside them with her feet in the water to the shin. She is singing, very softly, along with something you cannot hear.',
        next: 'found',
      },
      found: {
        speaker: S, mood: 'happy',
        text: 'Oh! Oh, you came. Did you not read the note? It said don’t follow. I underlined it. Twice, I think; my hand was shaking. (She does not take her feet out of the water.) Well. Since you’re here. Sit, if you like. The bank’s cold, but the water’s lovely.',
        choices: [
          { text: '“Why here?”', to: 'why-saved', when: tobinSaved },
          { text: '“Why here?”', to: 'why-lost', when: tobinLost },
          { text: '“Why here?”', to: 'why-dead', when: { all: [tobinP('dead'), not(tobinSaved), not(tobinLost)] } },
          { text: '“Why here?”', to: 'why-home', when: { all: [tobinP('saved'), not(tobinSaved), not(tobinLost)] } },
          { text: '“Why here?”', to: 'why-plain', when: plainTobin },
        ],
      },
      'why-saved': { speaker: S, text: 'Because this is where you brought the Hollis boy back. Maren told me the whole of it, three times, and cried every time, and then pretended she had a cold. I thought: if it’s going to go one way or the other, I’d like it to be somewhere it went right once.', next: 'singing' },
      'why-lost': { speaker: S, mood: 'sad', text: 'Because this is where it took him. Maren’s brother. (She looks at the water.) I thought he’d have someone. Isn’t that stupid? I thought, if there was somebody waiting down there who knew the way, it mightn’t be so lonely for him. Or for me.', next: 'singing' },
      'why-dead': { speaker: S, mood: 'sad', text: 'Because the singing comes up strongest here; it’s like standing by an oven. And because Maren told me about her brother, in the abbey. How you put your hand on him and the fire wouldn’t stay small. I don’t blame you. I want you to know I don’t. But you’ll understand if I came where you wouldn’t have to try.', next: 'singing' },
      'why-home': { speaker: S, text: 'Because the singing’s loudest here. And because I’ve been thinking about Maren’s brother. You put your hand on him in the abbey, and he cried, and he lived, and now he’s back in Brindlecross eating everyone’s bread. I’ve thought about that a great deal lately. I wanted somewhere quiet to think about it a bit more.', next: 'singing' },
      'why-plain': { speaker: S, text: 'Because the singing’s loudest here. It comes up out of the water like heat off a road. And because nobody else comes here, and I didn’t want an audience. Present company excepted. You were never an audience. You were always the mark.', next: 'singing' },
      singing: {
        speaker: S, mood: 'hollow',
        text: 'She’s singing now. The lady. Can you not hear her at all? She sounds like somebody’s mam who’s been crying in the scullery so the children won’t hear. She keeps saying she’s sorry. I believe her, you know. That’s the worst of it. She means every word.',
        choices: [
          { text: '“That’s Ysolde. The Pale Saint.”', to: 'ysolde', once: true },
          { text: '[Hollow-touched] “I can hear her. She’s sorry. She’s still lying.”', to: 'lying', when: { dialogueTag: 'hollow-touched' }, tag: 'trait', once: true },
          { text: '“Come away from the water, Sable.”', to: 'dignity' },
        ],
      },
      ysolde: { speaker: S, text: 'Is it? (She considers.) She doesn’t sound like a saint. Saints in windows always look so pleased with themselves. She sounds like she’s been up all night with a sick child, and the child died anyway, and she’s still sitting there holding the cloth.', next: 'singing' },
      lying: { speaker: S, mood: 'sad', text: 'Course she is. Sorry and lying, both at once. I’ve done it myself a hundred times, love; it’s the easiest thing in the world. (A small laugh.) Takes one to know one. I think that’s why I like her.', next: 'singing' },
      dignity: {
        speaker: S,
        text: 'Here’s the thing, love. I’ve about a day of me left. Maybe two. I can feel it going, like a candle down to the dish. And I’d like to choose. That’s the one thing a thief owns at the end: her way out. I’ve always picked my own door. I’d like to pick this one. Or have it picked by someone I trust, which is very nearly the same.',
        next: 'choice',
      },
      choice: {
        speaker: S,
        text: 'So. What’ll it be? I warn you, I’m in a mood to be talked round. That’s the cold. Normally I’m dreadfully stubborn.',
        choices: [
          { text: '“Let me burn it out of you.”', to: 'burn-ask' },
          { text: '[Maren] Look at Maren.', to: 'maren-home', when: { all: [maren, tobinHome] }, once: true },
          { text: '[Maren] Look at Maren.', to: 'maren-gone', when: { all: [maren, tobinGone, not(tobinHome)] }, once: true },
          { text: '“I won’t burn you and I won’t let you go. Let me bind you, and take you to the Thornwise.”', to: 'bound', effects: [{ setFlag: 'companion.sable.fate', value: 'bound' }] },
          { text: '“Then choose it. I’ll stay with you until you do.”', to: 'gone', effects: [{ setFlag: 'companion.sable.fate', value: 'gone' }] },
        ],
      },
      'maren-home': { speaker: M, text: '(She has been standing in the reeds with her bow unstrung, saying nothing. Now she crouches by Sable on the bank.) He screamed the whole time, Tobin did. Screamed and called the fire every name he knew, and some I didn’t know he knew. And then he was himself, and hungry, and complaining. (Roughly.) It hurt. It was worth it. Let them try, Sable.', next: 'choice' },
      'maren-gone': { speaker: M, mood: 'sad', text: '(She has been standing in the reeds with her bow unstrung, saying nothing. Now she crouches by Sable on the bank, and takes her cold hand, and does not let go.) I’ve lost one to the water. I’m not giving it another without a fight. That’s all. That’s all I’ve got. Don’t make me watch it twice.', next: 'choice' },
      // --- the Purge
      'burn-ask': {
        speaker: S, mood: 'afraid',
        text: '(For a long moment she only looks at your hand.) …Will it hurt?',
        choices: [
          { text: '[Will 15] “Yes. Hold on to me.” (Lay your marked hand on her.)', to: 'burn-ok', when: not(strongMark), once: true, check: { stat: 'will', dc: 15, failTo: 'burn-fail' } },
          { text: '[Will 10] “Yes. But the mark is stronger now. I can hold it to a thread.”', to: 'burn-ok', when: strongMark, once: true, check: { stat: 'will', dc: 10, failTo: 'burn-fail' } },
          { text: '[Briar-salve] “Less than it would have.” (Rub Nan Briar’s salve on her skin first.)', to: 'salve', when: salve },
          { text: '“Let’s not, yet.”', to: 'choice' },
        ],
      },
      'burn-fail': {
        speaker: 'narrator', mood: 'afraid', effects: [{ setFlag: 'npc.sable.qh_burn_failed', value: true }],
        text: 'The fire catches, and she screams: a real scream, not a joke, the first thing you have ever heard from her that was not a joke. The black boils up against your palm and the fire wants to follow it down, deeper than she goes, the way a flame follows oil. You tear your hand away before it can.',
        next: 'burn-fail2',
      },
      'burn-fail2': { speaker: S, mood: 'afraid', text: '(She is shaking all over.) Well. That’s. That was. Ow. (A laugh, broken in the middle.) Sorry. Give me a minute. Don’t do that again, love. Please. Not that way. I felt it go looking for the bottom of me, and there wasn’t one.', next: 'choice' },
      salve: { speaker: 'narrator', effects: [{ takeItem: 'item:briar-salve' }, { setFlag: 'companion.sable.fate', value: 'saved' }], text: 'Nan Briar’s salve smells of thorn and honey. It smokes where it touches Sable’s skin, and the black comes up through her like ink through paper, gathering under the surface, pooling at the wrists and temples, ready. You lay your marked hand flat over her heart.', next: 'purge' },
      'burn-ok': { speaker: 'narrator', effects: [{ setFlag: 'companion.sable.fate', value: 'saved' }], text: 'You lay your marked hand flat over her heart, and hold the fire back to a thread, as narrow as you have ever held it, and let it in.', next: 'purge' },
      purge: { speaker: 'narrator', text: 'It hurts her. There is no other way to tell it. She grips your coat in both fists and screams into your shoulder, and the fire goes down into her a hair at a time, finding the black and burning it, finding the next and burning that. The Mire comes out of her eyes in long black ropes, out of her mouth, out of the ends of her hair, and falls into the pool and hisses. Somewhere in the reeds the singing stops in the middle of a word.', next: 'voice' },
      voice: { speaker: Y, mood: 'sad', text: '(From the black water, a woman’s voice, very close and very tired.) Oh. Oh, you took her back. (A pause, as if listening.) Did it hurt her? …It did. I can hear that it did. (Softer.) I’m glad. I’m glad she can still be hurt. I had forgotten that was a thing one could be glad of.', next: 'still' },
      still: { speaker: 'narrator', text: 'Then the water is only water: black, and cold, and with a skin of ice already forming at its edge. Sable is lying across your knees, breathing in great ragged gulps. When she opens her eyes they are grey. You had not known they were grey.', next: 'saved' },
      saved: {
        speaker: S, effects: [{ companion: S, following: true }],
        text: 'Is it… ow. Ow, ow, ow. Everything’s so loud. Is it always this loud? I’d forgotten. (She holds up her hands and stares at them.) They’re warm. Look at them. They’re horrible and red and warm.',
        next: 'saved2',
      },
      saved2: {
        speaker: S,
        text: '(She wipes her eyes with her sleeve, out of habit, and the sleeve comes away clean, and she looks at it for a long time.) She was sorry, you know. The lady. Right up to the end. If you ever get near her, tell her. Tell her a thief from Haldren came back out of the water, and it hurt like anything, and it was worth it. Somebody ought to tell her it can be done.',
        choices: [
          { text: '“I’ll tell her.”', to: 'tell', effects: [{ setFlag: 'npc.sable.message_for_ysolde', value: true }] },
          { text: '“Tell her yourself. You’re coming with me.”', to: 'yourself', effects: [{ setFlag: 'npc.sable.message_for_ysolde', value: true }] },
        ],
      },
      tell: { speaker: S, mood: 'happy', text: 'Good. Tell her nicely. She’s had a hard time of it. (She struggles up, staggers, and catches your arm.) Now. Where are my boots? I’m not walking out of Greywater barefoot. I have standards. I have, very nearly, one standard.' },
      yourself: { speaker: S, mood: 'happy', text: 'Ha! I will, then. I’ll pick her pocket and leave a note in it. (She struggles up, staggers, and catches your arm.) Where are my boots? I am not walking out of Greywater barefoot. I have standards. I have, very nearly, one standard.' },
      // --- the water
      gone: { speaker: S, mood: 'sad', text: 'Oh. (She lets out a long breath, and it smokes black in the cold.) Oh, thank you. Thank you. Everyone’s always trying to save me. It’s ever so tiring. You’re the first who’s asked.', next: 'gone2' },
      gone2: {
        speaker: S,
        text: 'Three things, then, and I’ll go. One: Cobb owes me a penny. Don’t let him forget. Two: my good knives are yours. They’re the only honest things I ever owned. Three: hold my hand till I’m in to the knee. Then let go. Don’t come in after me. I mean it. Underlined.',
        choices: [
          { text: '(Hold her hand.)', to: 'gone3' },
          { text: '“Sable…”', to: 'gone-word' },
        ],
      },
      'gone-word': { speaker: S, mood: 'happy', text: 'Don’t. You’ll only say it wrong, and then you’ll feel bad about it for years, and I won’t be there to tell you it was fine. (She grins at you, black-cheeked.) It was fine. There. Now you don’t have to say it.', next: 'gone3' },
      gone3: { speaker: 'narrator', text: 'She stands up in the water and you hold her hand. It is very cold. She walks in, to the shin, to the knee, and there she lets go, and you let her. To the waist. At the last she looks back once, and lifts her hand, and makes the little sign of the Quiet Hand: two fingers folded, thumb across. Then she goes on, and down. For a moment the singing in the reeds has two voices. Then one. Then none.', next: 'gone4' },
      gone4: { speaker: Y, mood: 'sad', text: '(From the still water, a woman’s voice, very gently.) I have her. She isn’t cold any more. She was so cold, little spark, for so long. (A pause.) I’m sorry. I am always sorry. It never seems to be enough.', next: 'gone5' },
      gone5: { speaker: 'narrator', text: 'The water lies flat and black and does not freeze. On the bank her boots stand side by side, toes together, the way a tidy guest leaves them at the door.' },
      // --- bound
      bound: { speaker: 'narrator', effects: [{ companion: S, following: true }], text: 'You take her wrists. She fights you, at once and silently, with a strength no slight woman should have, and the black water heaves in the pool as if something under it had rolled over. Then she stops. You bind her wrists with cord and wind a sprig of thorn through the knot, the way the hedge-witches do, and lift her out of the water, and her feet are so white they look carved.', next: 'bound2' },
      bound2: { speaker: S, mood: 'sad', text: '(She is laughing, or sobbing, or both.) Tied up by a mark. The Hand will never let me hear the end of it. (Then, very quietly.) Don’t let go of the cord. If I ask you to, love, that’s not me asking. Promise.', next: 'bound3' },
      bound3: {
        speaker: S,
        text: 'Thornwise, is it? Singing hedge-folk. All right. All right. But if they make me drink anything green, I’m biting someone.',
        choices: [{ text: '“I promise. I won’t let go.”', to: 'bound4' }, { text: '“You can bite me. I’m used to it.”', to: 'bound4' }],
      },
      bound4: { speaker: 'narrator', text: 'Behind you, as you lead her out of the reeds, the singing goes on in the black water, patient, kind and sorry. Sable does not look back. You notice that she has to try very hard not to.' },
    },
  },
  // ----- bound: delivered to the Thornwise
  {
    id: 'dialogue:qh-thornwise-keep', name: 'Thornwise: Keeping Sable',
    entries: [
      { when: { questStage: QH, stage: 'ylwen' }, node: 'rhiannon' },
      { when: { questStage: QH, stage: 'briar' }, node: 'nan' },
      { node: 'done' },
    ],
    nodes: {
      done: { speaker: 'narrator', text: 'Sable sleeps in the Thornwise way, under thorn and song, with her hands crossed on her chest and the cord still knotted round her wrists. She is smiling at something.' },
      rhiannon: { speaker: 'npc:rhiannon-ys-caer', text: '(She lays her long hand on Sable’s brow, and Sable stops shivering.) Another the water wants. We cannot burn it out of her, Ashmarked; we have no fire for that. We can sing it to sleep, so that she may stay awake. It is the same song, turned round. We have been practising it for a very long time.', next: 'farewell' },
      nan: { speaker: 'npc:nan-briar', text: 'Bring her in, bring her in, mind the cat. (She peers into Sable’s eyes.) The Old Sleeper’s got its thumb on her. I can’t lift it. I can keep it still, with thorn and honey and a song my own nan had off hers. And when your hand’s stronger, you come back, and we’ll try the fire again. Slow, mind. Slow as a winter.', next: 'farewell' },
      farewell: { speaker: S, text: '(From the bed, drowsily.) Visit. Bring gossip. Bring a lock; I’ll go mad without a lock. And don’t you dare go and get yourself drowned while I’m lying here being good. I’d never forgive you. I’d come and haunt you, and I’d be dreadful at it.', next: 'farewell2' },
      farewell2: { speaker: 'narrator', text: 'Her eyes close. The black has stopped running from them, though it has not gone. Above her the thorn-sprigs on the cord put out, very slowly, one white flower.' },
    },
  },
  // ----- afterwards (one-time, if she came back)
  {
    id: 'dialogue:qh-sable-after', name: 'Sable: Warm hands',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: S, effects: [{ setFlag: 'npc.sable.qh_after', value: true }],
        text: 'I keep laughing at things that aren’t funny, and then remembering I don’t have to. It’s very strange. I’ve been doing it so long I’m not sure what my face does otherwise. (She pulls one.) Is that it? That feels wrong.',
        next: 'start2',
      },
      start2: {
        speaker: S,
        text: 'Here’s a question, and you needn’t answer it. Do you think she can come back? The lady in the water. If a thief can, I mean. I was only a little bit gone. She’s gone all the way to the bottom. But she was sorry, love. You can’t be sorry if there’s nobody left in there to be it.',
        choices: [
          { text: '“If you could, she can.”', to: 'can', effects: [{ setFlag: 'npc.sable.ysolde_hope', value: true }, { loyalty: S, delta: 5 }] },
          { text: '“I don’t know. I hope so.”', to: 'hope' },
          { text: '“She chose the water. You didn’t.”', to: 'chose' },
        ],
      },
      can: { speaker: S, mood: 'happy', text: 'That’s what I think. (She nods, firmly, as if it were settled.) It’ll hurt her worse than anything. That’s all right. It’s meant to. It’s how you know you’re still there.' },
      hope: { speaker: S, text: 'Hope’s good. Hope’s a lock you haven’t tried yet. (She flexes her warm hands.) I’ve never yet met a lock I couldn’t try.' },
      chose: { speaker: S, mood: 'sad', text: 'I did choose it, love. For a day and a half, sitting on that bank, I chose it every minute. You just asked me again, that’s all. (She looks at you.) Maybe nobody ever asked her again.' },
    },
  },
];

export default dialogues;
