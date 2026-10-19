/**
 * Dialogue: companion quests part 1 (docs/lore/13-companions.md §1): quest:the-hunters-oath (Maren) and
 * quest:a-lantern-for-the-road (Anselm). Hesta’s quest is in companions-1b.ts. Owner: Claude 4.
 * Quest-critical flags are set on the choice or the first node after it; every scene a stage waits on
 * reopens from an NPC route or an obj: dialogue.
 */
import type { DialogueDef, NarrativeCondition } from '@/core';

const QM = 'quest:the-hunters-oath' as const, QA = 'quest:a-lantern-for-the-road' as const;
const at = (quest: `quest:${string}`, stage: string) => ({ questStage: quest, stage });
const f = (flag: string) => ({ flag });
const eq = (flag: string, value: string) => ({ flag, op: '==' as const, value });
const M = 'npc:maren-hollis' as const, S = 'npc:brother-sallow' as const, AG = 'npc:agna-fenn' as const;
const A = 'npc:anselm-pryde' as const, W = 'npc:saint-wenna' as const;
const OATH = 'companion.maren-hollis.oath', PATH = 'companion.anselm-pryde.path';
const oath = (value: 'blood' | 'justice' | 'hers') => ({ setFlag: OATH, value });
const path = (value: 'reform' | 'inquisitor' | 'heretic') => ({ setFlag: PATH, value });

// ----- Tobin’s fate, in four mutually exclusive cases
const tobinHome: NarrativeCondition = { any: [f('act1.tobin_saved'), eq('prologue.tobin_fate', 'saved')] };
const tobinLost: NarrativeCondition = f('act1.tobin_lost');
const tobinDead: NarrativeCondition = { all: [eq('prologue.tobin_fate', 'dead'), { not: tobinHome }, { not: tobinLost }] };
const tobinReeds: NarrativeCondition = { all: [{ not: tobinHome }, { not: tobinLost }, { not: tobinDead }] };
/** Maren’s own choice turns to killing only if the water took Tobin and she does not yet trust you enough to stop */
const marenKills: NarrativeCondition = {
  all: [{ any: [f('npc.maren-hollis.vengeance'), tobinLost] }, { flag: 'companion.maren-hollis.loyalty', op: '<=', value: 59 }],
};

// ----- Anselm’s history
const betrayed = f('prologue.anselm_betrayed');
const pledged = eq('act2.church_stance', 'pledged');
const ansCell: NarrativeCondition = betrayed;
const ansWrit: NarrativeCondition = { all: [{ not: betrayed }, pledged] };
const ansPlain: NarrativeCondition = { all: [{ not: betrayed }, { not: pledged }] };

const dialogues: DialogueDef[] = [
  // ================================================================ THE HUNTER’S OATH
  {
    id: 'dialogue:oath-word', name: 'Maren: A name in a tavern',
    entries: [{ when: f('companion.maren-hollis.sallow_word'), node: 'again' }, { node: 'start' }],
    nodes: {
      again: { speaker: M, text: 'Fenwick. Agna Fenn will know where he’s gone to ground. I’m going whether you come or not, so you may as well come.' },
      start: {
        speaker: 'narrator', effects: [{ setFlag: 'companion.maren-hollis.sallow_word', value: true }],
        text: 'Maren finds you at dusk. She has her bow unstrung across her knees and she is restringing it, slowly, the way she does when her hands need something to do that is not hitting someone.',
        next: 'name',
      },
      name: {
        speaker: M,
        text: 'A fen-trader at the Causeway End was drinking to the Reed-Mother’s death, and he let a name slip. Sallow. Brother Sallow. (She pulls the string tight.) I know that name. Oswin used to say it at the mill, when he thought nobody was listening. “Brother Sallow says she’s only sleeping.”',
        next: 'who',
      },
      who: {
        speaker: M,
        text: 'He was the one on the shore, {player.name}. All that autumn before the Night of Falling Ash: a reed-priest up the River Grey in a punt, singing at the edge of Wennamere after dark. Tobin used to slip out to listen. I thought it was a girl. I teased him about it. I teased him.',
        choices: [
          { text: '[Listen]', to: 'home', when: tobinHome },
          { text: '[Listen]', to: 'lost', when: tobinLost },
          { text: '[Listen]', to: 'dead', when: tobinDead },
          { text: '[Listen]', to: 'reeds', when: tobinReeds },
        ],
      },
      home: {
        speaker: M,
        text: 'Tobin’s home. He eats like a plough-horse and he wakes up screaming twice a week. (She touches her quiver, where something folded is tucked among the fletchings.) He wrote me a letter. Elder Godric’s been teaching him his letters. I’ve read it once. I can’t make myself read it twice.',
        next: 'want',
      },
      lost: {
        speaker: M, mood: 'angry',
        text: 'The water has my brother. You were there. You saw his face when the reeds closed. (Her voice does not shake at all, which is worse.) I made a promise in those reeds. I’ve kept a list ever since. Sallow’s name was always going to be at the top of it. I just didn’t know it yet.',
        next: 'want',
      },
      dead: {
        speaker: M, mood: 'sad',
        text: 'Tobin’s in the ground at Brindlecross, next to Mam. I go and sit with him. I tell him what we’ve been doing. I never tell him how he got there. (She looks at you, then away.) That’s between you and me, and we’ll have it out one day. But who put him in that crypt is between me and Sallow.',
        next: 'want',
      },
      reeds: {
        speaker: M, mood: 'angry',
        text: 'Tobin’s still out there in the reeds, singing with a dead woman’s voice, and every day I don’t go and drag him out is a day I’ll answer for. But Sallow’s the one who taught him the song. Sallow first.',
        next: 'want',
      },
      want: {
        speaker: M,
        text: 'He’s been seen at Fenwick since the Reed-Mother fell. I’m going. I’d like you to come. I’d like that very much. But I’m going either way.',
        choices: [
          { text: '“I’m with you. What do you mean to do when we find him?”', to: 'mean' },
          { text: '“Maren. Killing him won’t bring anyone back.”', to: 'back' },
          { text: '“Then let’s go hunting.”', to: 'go', effects: [{ loyalty: M, delta: 3 }] },
        ],
      },
      mean: {
        speaker: M,
        text: 'I don’t know. That’s the honest answer. I know what I want to do. I’ve wanted to do it every night for a year. (She strings the bow and tests it.) Ask me again when he’s in front of me.',
        next: 'go',
      },
      back: {
        speaker: M, mood: 'angry',
        text: 'I know that. You think I don’t know that? Nothing brings anyone back. That’s the whole lie of the Choir; they say it does. (Quieter.) It isn’t about bringing back. It’s about him not doing it again to somebody else’s brother.',
        next: 'go',
      },
      go: {
        speaker: 'narrator',
        text: 'She slings the bow and stands. “Fenwick, then. Nothing moves in those reeds without Agna Fenn knowing about it, and charging it a toll.”',
      },
    },
  },
  {
    id: 'dialogue:oath-agna', name: 'Agna Fenn: Where Sallow hides',
    entries: [{ when: f('companion.maren-hollis.sallow_found'), node: 'again' }, { node: 'start' }],
    nodes: {
      again: { speaker: AG, text: 'The old smokehouse, end of the landing. Mind the third rung. And mind her; she’s got the look my second husband had before he went at a pike with his bare hands.' },
      start: {
        speaker: 'narrator',
        text: 'There are no black candles in the windows of Fenwick now. Agna Fenn is at her gutting-board with her sleeves rolled, and she looks up at Maren’s strung bow before she looks at you.',
        next: 'agna',
      },
      agna: {
        speaker: AG,
        text: 'You again. And a girl with a bow, looking at my reeds like she means to set them alight. What is it this time?',
        choices: [
          { text: '“Brother Sallow. Where is he?”', to: 'sallow' },
          { text: '[Intimidate] “Don’t make us ask the reeds instead.”', to: 'sallow', tag: 'intimidate' },
        ],
      },
      sallow: {
        speaker: AG, effects: [{ setFlag: 'companion.maren-hollis.sallow_found', value: true }],
        text: 'Ah. (She sets the knife down.) He came back after the Reed-Mother died. Half-starved, singing to himself. He lives under the old smokehouse at the end of the landing, where the water’s deepest, and we leave him eels. Don’t look at me like that, girl. He took the tithe off us every new moon, and when he took more than eels, we let him. Two of ours went singing into the reeds. My sister’s boy was one.',
        choices: [
          { text: '“And you still feed him?”', to: 'feed' },
          { text: '(Look at Maren.)', to: 'maren-asks' },
        ],
      },
      'maren-asks': { speaker: M, mood: 'angry', text: 'Then why’s he still breathing?', next: 'feed' },
      feed: {
        speaker: AG,
        text: 'Because he’s the last of them hereabouts, and while he’s fed and quiet the reeds are quiet too. Because nobody in Fenwick has the stomach for it. And because when somebody’s law finally comes down that causeway, I want them to find him here, and know that Fenwick kept him for them.',
        next: 'law',
      },
      law: {
        speaker: AG,
        text: 'If you take him, bring him to me. Fenwick has the right. We’ll try him at the fen-moot, in front of every mother he sang a child away from. That’s justice the old way. (She picks the knife up again.) Or don’t. I’m not your mother either.',
        next: 'maren',
      },
      maren: { speaker: M, text: '(Very quietly.) The smokehouse. Right.' },
    },
  },
  // ----- the trail (obj:sallow-trail-1..3, around landmark:fenwick-stilts)
  {
    id: 'dialogue:obj-sallow-trail-1', name: 'Object: A black candle stub',
    entries: [{ when: at(QM, 'track'), node: 'n' }, { node: 'idle' }],
    nodes: {
      idle: { speaker: 'narrator', text: 'A stilt-post, black with tar and old weed.' },
      n: { speaker: 'narrator', text: 'A stub of black candle has been pressed into the tar of a stilt-post, under a window. The wax is still soft. Maren crouches and smells it.', next: 'm' },
      m: { speaker: M, text: 'Tallow and bog-myrtle. Choir candles. Lit last night, right under where the children sleep. He’s been up the ladders, singing at the windows. (She stands.) Close, then.' },
    },
  },
  {
    id: 'dialogue:obj-sallow-trail-2', name: 'Object: A reed-pipe',
    entries: [{ when: at(QM, 'track'), node: 'n' }, { node: 'idle' }],
    nodes: {
      idle: { speaker: 'narrator', text: 'Eel-traps of woven willow, swaying under the landing.' },
      n: { speaker: 'narrator', text: 'Caught in the mouth of an eel-trap is a pipe of cut reed, fresh-cut, seven holes burned through it with a hot nail. Maren turns it over in her fingers and puts it to her lips without blowing.', next: 'm' },
      m: { speaker: M, mood: 'angry', text: 'This is what he played on the shore. I’d know the note anywhere; I heard it through the shutters every night that autumn and thought it was pretty. (She snaps it in two, carefully, and drops it in the water.) Not any more.' },
    },
  },
  {
    id: 'dialogue:obj-sallow-trail-3', name: 'Object: A punt under the smokehouse',
    entries: [{ when: at(QM, 'track'), node: 'n' }, { node: 'idle' }],
    nodes: {
      idle: { speaker: 'narrator', text: 'An old punt, tied off beneath the smokehouse landing.' },
      n: { speaker: 'narrator', text: 'A punt is tied beneath the smokehouse landing, half full of rainwater. In the bottom, where the water has not reached it, lies a little wooden whistle carved in the shape of a hare.', next: 'm' },
      m: { speaker: M, mood: 'sad', text: '(She picks it up and does not say anything for a long time.) That’s Tobin’s. Da carved it, the winter before he went. Tobin lost it that autumn. I gave him a hiding for losing it. (She closes her fist round it.) He didn’t lose it.', next: 'song' },
      song: { speaker: 'narrator', text: 'From below the smokehouse, where the water is deepest, someone has begun to sing.' },
    },
  },
  // ----- the confrontation (npc:brother-sallow, present at stage `sallow`)
  {
    id: 'dialogue:oath-sallow', name: 'Brother Sallow: The singer',
    entries: [{ when: f(OATH), node: 'done' }, { node: 'start' }],
    nodes: {
      done: { speaker: 'narrator', text: 'The water under the smokehouse is black and still, and nobody is singing.' },
      start: {
        speaker: 'narrator',
        text: 'Beneath the smokehouse the water stands black under the boards. A thin man in a robe of woven reed sits on a sunken jetty with his feet in it, singing to himself. It is a cradle-song. It is the cradle-song: the one Maren sang to Tobin when there was no one left to sing it to either of them.',
        next: 'maren1',
      },
      maren1: { speaker: M, mood: 'angry', text: 'Stop it. STOP IT. That’s ours. That was Mam’s.', next: 'sallow1' },
      sallow1: {
        speaker: S,
        text: 'I know, child. She sings it to me. The Sleeper lends me the voice of whoever is missed the most, and your mother is missed very much. (He turns. Black water stands in his eyes and does not fall.) You are Tobin’s sister. Of course you are. You have his hair.',
        choices: [
          { text: '[Listen]', to: 's-home', when: tobinHome },
          { text: '[Listen]', to: 's-lost', when: tobinLost },
          { text: '[Listen]', to: 's-dead', when: tobinDead },
          { text: '[Listen]', to: 's-reeds', when: tobinReeds },
        ],
      },
      's-home': { speaker: S, text: 'He came back up, they say. The only one who ever came back up. I have wondered about that boy. Is he warm? Does he sleep?', next: 'm-home' },
      'm-home': { speaker: M, mood: 'angry', text: 'He wakes up screaming. He’s fourteen years old and he wakes up screaming twice a week, because of you.', next: 'plead' },
      's-lost': { speaker: S, mood: 'happy', text: 'He is below now, and he is not alone. I hear him some nights when the water is still. He is with her, child. Isn’t that what he wanted? Isn’t that what you wanted, all those nights you lay awake?', next: 'm-lost' },
      'm-lost': { speaker: M, mood: 'angry', text: 'Don’t. Don’t you dare tell me what I wanted.', next: 'plead' },
      's-dead': { speaker: S, mood: 'sad', text: 'He never came down. Someone burned the water out of him in the abbey, they say, and the fire went too deep. (Softly.) I am sorry for that. He was so near.', next: 'm-dead' },
      'm-dead': { speaker: M, mood: 'angry', text: 'Sorry. You’re sorry. (Her laugh is not a laugh.) Everybody’s sorry.', next: 'plead' },
      's-reeds': { speaker: S, mood: 'happy', text: 'He is in the reeds still, in between. He comes to the landing some nights and we sing together. He has a lovely voice now. Hers.', next: 'm-reeds' },
      'm-reeds': { speaker: M, mood: 'afraid', text: 'He comes here? He comes HERE, and you sing to him?', next: 'plead' },
      plead: {
        speaker: S,
        text: 'I never hurt anyone. I only sang. They came because they wanted to; nobody walks into cold water unless something in them is already drowning. Kill me if you like. I will go down, and it will be warm, and I will see them all again.',
        next: 'bow',
      },
      bow: {
        speaker: 'narrator',
        text: 'Maren has an arrow on the string. The bow is drawn to her ear and her arm does not shake. She does not loose. She is waiting, you realise, for you.',
        choices: [
          { text: '[Tobin’s letter] “Maren. Read me Tobin’s letter first.”', to: 'letter', when: tobinHome, once: true },
          {
            text: '(Draw steel.) “He dies here.”', to: 'blood', tag: 'aggressive',
            effects: [oath('blood'), { setFlag: 'npc.brother-sallow.dead', value: true }, { reputation: 'faction:drowned-choir', delta: -5 }],
          },
          {
            text: '“Agna Fenn has a right to him. Let Fenwick judge him.”', to: 'justice',
            effects: [oath('justice'), { setFlag: 'companion.maren-hollis.sallow_spared', value: true }, { loyalty: M, delta: 3 }],
          },
          {
            text: '“This is yours, Maren. Whatever you choose, I’ll stand by it.”', to: 'hers-kill', when: marenKills,
            effects: [oath('hers'), { setFlag: 'npc.brother-sallow.dead', value: true }, { loyalty: M, delta: 10 }],
          },
          {
            text: '“This is yours, Maren. Whatever you choose, I’ll stand by it.”', to: 'hers-spare', when: { not: marenKills },
            effects: [oath('hers'), { setFlag: 'companion.maren-hollis.sallow_spared', value: true }, { loyalty: M, delta: 10 }],
          },
        ],
      },
      // --- Tobin’s letter (only if he came home)
      letter: {
        speaker: 'narrator',
        text: 'For a moment you think she will not. Then she lets the string down, a little, and takes the folded paper from among the fletchings with two fingers, and reads it aloud in a flat voice, as if it were a list of chores.',
        next: 'letter2',
      },
      letter2: {
        speaker: M, mood: 'sad',
        text: '“Mar. Elder Godric says to write what I mean, so here it is. I know you are going after the singing man. I would too. But I don’t want you to kill anybody for me. I don’t want to be a thing people die for. I want to be a thing people come home to. Come home. Bring {player.name}. Your brother, Tobin. P.S. The hens are all right.”',
        next: 'letter3',
      },
      letter3: {
        speaker: 'narrator',
        text: 'She reads the postscript twice. Her mouth does something complicated. The arrow is still on the string, but the bow is no longer drawn.',
        choices: [
          {
            text: '(Draw steel.) “He dies here, letter or no.”', to: 'blood', tag: 'aggressive',
            effects: [oath('blood'), { setFlag: 'npc.brother-sallow.dead', value: true }, { loyalty: M, delta: -10 }, { reputation: 'faction:drowned-choir', delta: -5 }],
          },
          {
            text: '“Let Fenwick judge him. Then go home.”', to: 'justice',
            effects: [oath('justice'), { setFlag: 'companion.maren-hollis.sallow_spared', value: true }, { loyalty: M, delta: 5 }],
          },
          {
            text: '“It was always yours to decide, Maren. It still is.”', to: 'hers-letter',
            effects: [oath('hers'), { setFlag: 'companion.maren-hollis.sallow_spared', value: true }, { loyalty: M, delta: 15 }],
          },
        ],
      },
      // --- blood
      blood: {
        speaker: 'narrator',
        text: 'You go down onto the jetty. Sallow does not run. He looks up at you as though you had brought him a present, and he is still singing when the steel goes in, and then he is not. The black water closes over the place where his feet were and goes still.',
        next: 'blood-m',
      },
      'blood-m': { speaker: M, mood: 'sad', text: '(She lowers the bow, very slowly. She looks at the water for a long time.) …I thought it would feel like something. I thought I’d feel it, here. (She touches her breastbone.) I don’t feel anything at all.' },
      // --- justice
      justice: {
        speaker: M,
        text: 'Fenwick. (A long breath through her teeth.) …All right. All right. Let the mothers have him. They’ve more right than I have. Some of them have more right than the Seven.',
        next: 'justice2',
      },
      justice2: {
        speaker: 'narrator',
        text: 'You bind his wrists with his own reed-cord. He comes quietly, humming. On the landing Agna Fenn is waiting with three women and a boat-hook, and none of them says a word. Maren watches them take him, and she does not unstring her bow until the eel-house door has shut.',
      },
      // --- hers: she kills him
      'hers-kill': {
        speaker: 'narrator',
        text: 'Maren looks at you once, to be sure. Then she looses. It is a clean shot; she was always the best on the green. Sallow folds over his own knees with a small surprised sound, and the singing stops.',
        next: 'hers-kill2',
      },
      'hers-kill2': {
        speaker: M, mood: 'sad',
        text: 'I’m not sorry. (Her voice cracks straight down the middle.) I’m not. I’m only tired. I’ve been carrying him a year, {player.name}, and I’m so tired. …Thank you for letting it be me. And don’t ever let me do a thing like that again. Promise. Even if I ask.',
      },
      // --- hers: she spares him
      'hers-spare': {
        speaker: 'narrator',
        text: 'Maren holds the draw until her arm begins to tremble. Then she lets out her breath, and the arrow goes into the black water a hand’s breadth from Sallow’s foot, and the singing stops.',
        next: 'hers-spare2',
      },
      'hers-spare2': {
        speaker: M, mood: 'angry',
        text: 'Tobin used to cry when I wrung a hen’s neck. Did you know that? Big lad, and he cried. He’d never forgive me. (She lowers the bow.) Get up. Get up and walk. Walk to Brindlecross and stand on the green and tell them what you did, and then keep walking, and if I ever hear you sing again I will find you. That’s my oath. Not yours. Mine.',
      },
      // --- hers, after the letter
      'hers-letter': {
        speaker: 'narrator',
        text: 'Maren takes the arrow off the string and puts it back in the quiver, next to the letter, very carefully. Then she unstrings the bow altogether.',
        next: 'hers-letter2',
      },
      'hers-letter2': {
        speaker: M,
        text: 'My brother asked me not to turn into you. So I won’t. (To Sallow, quite gently, which frightens him more than the bow did.) Go home. Wherever home was, before them. Find out if anyone’s still there. And if they are, you sit with them, and you don’t sing. You listen.',
      },
    },
  },
  // ----- the aftermath (Maren route while the quest is active and the oath is set)
  {
    id: 'dialogue:oath-after', name: 'Maren: After Sallow',
    entries: [
      { when: eq(OATH, 'blood'), node: 'blood' },
      { when: eq(OATH, 'justice'), node: 'justice' },
      { when: { all: [eq(OATH, 'hers'), f('npc.brother-sallow.dead')] }, node: 'hers-kill' },
      { when: eq(OATH, 'hers'), node: 'hers-spare' },
      { node: 'end' },
    ],
    nodes: {
      blood: {
        speaker: M,
        text: 'I keep waiting to feel better. Like when a fever breaks. (She turns Tobin’s hare whistle over in her fingers.) Thank you for doing it so I didn’t have to. Or… I don’t know if that’s a thank-you. Ask me in a year.',
        choices: [
          { text: '“You don’t have to feel anything yet.”', to: 'gentle', effects: [{ loyalty: M, delta: 3 }] },
          { text: '“He had it coming.”', to: 'coming' },
        ],
      },
      coming: { speaker: M, text: 'He did. That’s the trouble. He did, and it’s still not enough, and it never would have been. (She puts the whistle away.) Mam used to say vengeance is a coat with no lining. Warm for a mile.', next: 'end' },
      justice: {
        speaker: M,
        text: 'They’ll put him in the water on a rope at the fen-moot, I expect, and pull him out, and put him in again until he names every child he sang off. Or they’ll let him go. Either way it’s not on me. (She sounds surprised.) That’s lighter than I thought it would be.',
        choices: [{ text: '“You chose well.”', to: 'gentle', effects: [{ loyalty: M, delta: 2 }] }, { text: '(Say nothing.)', to: 'gentle' }],
      },
      'hers-kill': {
        speaker: M, mood: 'sad',
        text: 'Don’t look at me like you’re worried. I’m all right. I’m not all right. Both. (She sits down on the landing with her feet over the water, then pulls them up sharply.) You let me choose. Nobody’s ever let me choose anything; it was always Mam’s illness, or Tobin, or the winter. You let me. I’ll not forget it.',
        next: 'gentle',
      },
      'hers-spare': {
        speaker: M,
        text: 'I had him. I had him the whole time, right on the string. (She laughs, and it is a real laugh, wet round the edges.) And I thought about Tobin crying over the hens, and I couldn’t. Isn’t that stupid? A whole year of wanting it, and a hen stopped me.',
        next: 'gentle',
      },
      gentle: {
        speaker: M, mood: 'happy',
        text: 'Come on. (She knocks her shoulder into yours, the way she did when you were both nine.) The light’s going, I’m starving, and you still owe me a drink from Lanternmass. I haven’t forgotten. I never forget a debt.',
      },
      end: { speaker: M, text: 'Let’s get out of the reeds. I’ve had enough water for one lifetime.' },
    },
  },

  // ================================================================ A LANTERN FOR THE ROAD
  {
    id: 'dialogue:lantern-ask', name: 'Anselm: A favour',
    entries: [{ when: f('companion.anselm-pryde.lantern_asked'), node: 'again' }, { node: 'start' }],
    nodes: {
      again: { speaker: A, text: 'The abbey, whenever you are ready. I have packed the salt twice and the oil three times. I am told this is what nerves look like in a scholar.' },
      start: {
        speaker: A, effects: [{ setFlag: 'companion.anselm-pryde.lantern_asked', value: true }],
        text: 'Ah. There you are. Sit, sit. No, not there, that is a book. (He clears a stool.) I have a favour to ask, and I have been rehearsing it, which means it will come out badly.',
        choices: [
          { text: '[Listen]', to: 'cell', when: ansCell },
          { text: '[Listen]', to: 'plain', when: { not: ansCell } },
        ],
      },
      cell: {
        speaker: A,
        text: 'A year in a cell at Valcastre gives a man time to think about holy places: which of them were holy, and which merely had good roofs. I thought about one in particular. I used to see its bell-tower from the chapel road, before the Night. Then I used to see the water where it had been.',
        next: 'abbey',
      },
      plain: {
        speaker: A,
        text: 'I have been thinking about Saint Wenna’s. I could see its bell-tower from the chapel road, you know, before the Night. Then I could see the water where it had been. And now I cannot see anything at all, because I have stopped looking.',
        next: 'abbey',
      },
      abbey: {
        speaker: A,
        text: 'The mere is drained. The Ember is out of it. And the sisters are lying in the mud of their own nave with nobody to say the words over them. No priest has gone down; the Wick will not license one, and the Church has… mislaid them. I should like to go. I should like to reconsecrate it, if I still can.',
        choices: [
          { text: '“If you still can?”', to: 'can' },
          { text: '“Of course I’ll come.”', to: 'yes', effects: [{ loyalty: A, delta: 3 }] },
        ],
      },
      can: {
        speaker: A,
        text: 'A reconsecration wants a priest in good standing who believes what he is saying. (A small smile.) I am not certain I am either of those things any more. I thought I might go and find out.',
        choices: [
          { text: '[Listen]', to: 'can-j', when: f('act2.journals_read') },
          { text: '“Then let’s find out.”', to: 'yes' },
        ],
      },
      'can-j': {
        speaker: A, mood: 'sad',
        text: 'You read the Pale Saint’s daybooks. You told me what was in them. She took her figures to the Hierophant, and he held her hands and told her to pray and say nothing. (He takes off his spectacles.) I have said that to frightened people for thirty years. Pray, and say nothing. I meant it kindly every time.',
        next: 'yes',
      },
      yes: {
        speaker: A, mood: 'happy',
        text: 'Thank you. I shall bring oil, and salt, and the little book. And you will bring… (he nods at your hand) …that. I am afraid I shall need it. The old rite wants water made clean and a light by the door, and there is no Brand-fire left to light a lamp with. Not anywhere. Not any more.',
      },
    },
  },
  // ----- the three rites (obj:abbey-rite-font, obj:abbey-rite-roll, obj:abbey-rite-lamp in landmark:abbey-nave)
  {
    id: 'dialogue:obj-abbey-rite-font', name: 'Object: Saint Wenna’s font',
    entries: [{ when: at(QA, 'rites'), node: 'start' }, { node: 'idle' }],
    nodes: {
      idle: { speaker: 'narrator', text: 'A stone font carved with reeds and herons.' },
      start: {
        speaker: 'narrator',
        text: 'The font by the west door is carved with reeds and herons. It is full to the brim with black water, quite still, that did not drain with the rest of the mere. Anselm stands over it with his little book open, and does not read.',
        next: 'ask',
      },
      ask: {
        speaker: A,
        text: 'Holy water. Or it was. The rite says I am to bless it, and I do not think a blessing is what it needs. (He looks at your hand.) Would you?',
        choices: [
          { text: '(Lay your marked hand on the water.)', to: 'burn' },
          { text: '“Bless it first, Brother. Then I’ll burn it.”', to: 'both' },
        ],
      },
      both: {
        speaker: 'narrator',
        text: 'Anselm raises his palm and prays, and Radiance comes, thin and slow, as if through a wall. It lies on the black water like moonlight on tar and does nothing at all. He lowers his hand. “Go on,” he says.',
        next: 'burn',
      },
      burn: {
        speaker: 'narrator',
        text: 'The Ashmark wakes. White-gold fire runs over the water without touching it, and the black goes up as steam that smells of the sea. Underneath, at the bottom of the font, there is clean water: a hand’s depth, cold and clear.',
        next: 'after',
      },
      after: {
        speaker: A,
        text: 'Heretic fire in a Lantern font. (He laughs, not steadily.) Forgive me. I was taught a thing could not be both. …It is clean. It is cleaner than anything I ever blessed.',
      },
    },
  },
  {
    id: 'dialogue:obj-abbey-rite-roll', name: 'Object: The sisters’ roll',
    entries: [{ when: at(QA, 'rites'), node: 'start' }, { node: 'idle' }],
    nodes: {
      idle: { speaker: 'narrator', text: 'A board of names above the choir-stalls, the paint gone soft with water.' },
      start: {
        speaker: 'narrator',
        text: 'Above the choir-stalls hangs a board of names, painted, the paint gone soft and blistered. The newest names are in a fresh, careful hand. Anselm wipes the mud from it with his sleeve and begins to read, slowly, as the rite requires, one name to each breath.',
        next: 'names',
      },
      names: {
        speaker: A,
        text: 'Sister Aldreda. Sister Jocasta. Sister Maud the elder, Sister Maud the younger. Sister Hildith, infirmarian. Sister Wynn, who had the bees. (His voice goes on, steady.) …and Mother Morwen, Abbess, who kept the hours. (He stops.) How did she die? You were there.',
        choices: [
          { text: '“She asked whether it was Lanternmass.”', to: 'lanternmass' },
          { text: '“Ringing the bells. She never stopped.”', to: 'bells' },
        ],
      },
      lanternmass: {
        speaker: A, mood: 'sad',
        text: 'Lanternmass. (He takes a stub of chalk from his pocket and writes beside her name, very small.) She asked whether Wenna’s lamp was lit, I expect. Every abbess of this house was asked that at her profession. “Do you keep the lamp?” Tonight, Mother, someone shall.',
      },
      bells: {
        speaker: A, mood: 'sad',
        text: 'Of course she didn’t. (He takes a stub of chalk from his pocket and writes beside her name, very small: She kept the hours.) It is the sort of faith I used to envy, the kind that cannot stop. Now I think it is only the kind that does not know how.',
      },
    },
  },
  {
    id: 'dialogue:obj-abbey-rite-lamp', name: 'Object: Saint Wenna’s lamp',
    entries: [
      { when: f('companion.anselm-pryde.abbey_lamp'), node: 'lit' },
      { when: at(QA, 'rites'), node: 'start' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'narrator', text: 'An iron lamp in a niche by the west door, cold, its glass furred with silt.' },
      lit: { speaker: 'narrator', text: 'Saint Wenna’s lamp burns in its niche by the door, small and steady, white-gold at the heart.' },
      start: {
        speaker: 'narrator',
        text: 'In a niche by the west door, where travellers on the moor road could see it through the arch, hangs an iron lamp no bigger than a man’s two fists. WENNA KEPT A LAMP is cut in the stone above it. Its glass is furred with silt, and there is oil in it still.',
        next: 'ask',
      },
      ask: {
        speaker: A,
        text: 'The Wick-Edict says only Brand-fire is holy fire, and that a lamp of the Lantern must be lit from a flame lit from the Brand. (He looks at the cold wick.) The Brand is a cinder in Solenne. So either nothing can ever be holy again, or the Edict is wrong. I find I would rather the Edict were wrong.',
        choices: [
          { text: '(Light it with the Ashmark.)', to: 'kindle' },
          { text: '“Cup your hands round the wick, Brother. We’ll light it together.”', to: 'together', effects: [{ loyalty: A, delta: 3 }] },
        ],
      },
      together: {
        speaker: 'narrator',
        text: 'He cups his ink-stained hands round the wick, the way you shield a candle on a windy night. You put a fingertip to the gap between them. His palms glow faintly, Radiance answering the Ashmark like a struck bell answering another.',
        next: 'kindle',
      },
      kindle: {
        speaker: 'narrator', effects: [{ setFlag: 'companion.anselm-pryde.abbey_lamp', value: true }],
        text: 'The flame takes at once. It is small and white-gold at the heart, and it throws the shape of the arch out across the mud of the drained mere, the way it must have done every night for four hundred years for anyone on the road.',
        next: 'after',
      },
      after: { speaker: A, mood: 'happy', text: 'There. (He wipes his eyes and pretends it is the smoke.) There. Somebody on the moor road tonight will see that, and not know why, and walk a little faster.' },
    },
  },
  // ----- the vigil (obj:abbey-altar; also npc:saint-wenna and Anselm’s route at stage `vigil`)
  {
    id: 'dialogue:obj-abbey-altar', name: 'Saint Wenna: The vigil',
    entries: [
      { when: f(PATH), node: 'after' },
      { when: at(QA, 'vigil'), node: 'start' },
      { when: at(QA, 'rites'), node: 'early' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'narrator', text: 'A plain stone altar at the east end of the nave, scrubbed of mud.' },
      early: { speaker: A, text: 'Not yet. The water, the names and the lamp first. Then the vigil. The old books are very firm about the order, and I have never once got it right.' },
      after: { speaker: 'narrator', text: 'The altar is bare and clean. By the west door, Saint Wenna’s lamp is still burning.' },
      start: {
        speaker: 'narrator',
        text: 'Anselm kneels at the altar, and you sit on the step beside him, and the night goes on. He says the hours under his breath. The mud ticks as it dries. Towards the fourth hour the lamp by the door brightens, though nobody has touched it.',
        next: 'wenna1',
      },
      wenna1: {
        speaker: 'narrator',
        text: 'A woman is standing in the nave. She is not white, as the Pale Saint is white; she is lit the way horn is lit with a candle behind it, warm and a little brown. She is small and plain-faced, sleeves rolled to the elbow as if she had come straight from the infirmary, and she is wet to the knee, as if she had walked up out of the mere. The water on her shines.',
        next: 'anselm1',
      },
      anselm1: { speaker: A, mood: 'afraid', text: '(He does not get up. He does not seem able to.) …Saint Wenna.', next: 'wenna2' },
      wenna2: {
        speaker: W, mood: 'happy',
        text: 'Just Wenna, love. Nobody called me saint while I had chilblains. (She comes up the nave without hurry and sits on the altar step, beside Anselm, like a neighbour at a wake.) You lit my lamp. Thank you. It has been dark a long while.',
        next: 'wenna3',
      },
      wenna3: {
        speaker: W,
        text: 'My Morwen kept the bells going after the water came, poor lamb. She never could leave a thing half done. (She looks at you, and at your hand, very kindly.) And you brought the fire back with you. The little coal from my reliquary. It knew you, didn’t it? It was waiting.',
        choices: [
          { text: '“Are you real?”', to: 'real', once: true },
          { text: '“Is Morwen at peace?”', to: 'morwen', once: true },
          { text: '“He has something to ask you, Mother.”', to: 'ask' },
        ],
      },
      real: { speaker: W, text: 'As real as a lamp is. You cannot hold it, and it is still there. (She smiles.) I would not lean on me. But you may warm your hands.', next: 'wenna3' },
      morwen: { speaker: W, mood: 'happy', text: 'She is asleep, and it is the right kind. Not the kind under the water. The kind after a long day, with the bell rung for the last time and somebody else to ring it in the morning. You did that.', next: 'wenna3' },
      ask: {
        speaker: W,
        text: 'No, love. I have something to ask him. (She turns to Anselm.) You have said the words all night, Brother. Good words; I wrote some of them. But I did not come up out of the mere to hear my own words back. What do you believe, now? Not the book. You.',
        choices: [
          { text: '[Listen]', to: 'doubt-cell', when: ansCell },
          { text: '[Listen]', to: 'doubt-writ', when: ansWrit },
          { text: '[Listen]', to: 'doubt-plain', when: ansPlain },
        ],
      },
      'doubt-cell': {
        speaker: A, mood: 'sad',
        text: 'I… (He looks at his hands.) The Church put me in a cell for owning a book, Mother. A good book. A true one. The priest who brought me bread every morning blessed it first, every morning, and never once asked my name. I do not know what I believe. I know what I cannot believe any more.',
        next: 'turn',
      },
      'doubt-writ': {
        speaker: A,
        text: 'I… (He looks at you.) My friend here carries the Lord-Inquisitor’s writ. The Wick is the only part of the Church that still does anything at all, Mother. It is cruel, and it is awake. The rest of us are only saying the hours with the water rising.',
        next: 'turn',
      },
      'doubt-plain': {
        speaker: A,
        text: 'I… (He looks at the lamp.) I have been a priest for thirty years and a coward for all of them, Mother. I kept a heretic’s book under my floor and lied to my bishop and told myself it was faith. The Church I serve buried the truth to keep its windows warm. I still love it. I do not know what that makes me.',
        next: 'turn',
      },
      turn: {
        speaker: A,
        text: '(He turns to you, helplessly.) You have seen what I have seen. More. What should I tell her?',
        choices: [
          { text: '[Ysolde’s daybooks] “Tell her the Pale Saint went to the Church with the truth, and was told to pray.”', to: 'journals', when: f('act2.journals_read'), once: true },
          { text: '“That the Church can be mended. It’s made of people like you.”', to: 'reform', effects: [path('reform'), { loyalty: A, delta: 3 }] },
          { text: '“That it must be remade, by force if need be, by someone with clean hands.”', to: 'inquisitor', effects: [path('inquisitor'), { loyalty: A, delta: 3 }] },
          { text: '“That the light never needed a church. Only someone to carry it.”', to: 'heretic', effects: [path('heretic'), { loyalty: A, delta: 3 }] },
          { text: '“Tell her what you believe, Anselm. Not what I do.”', to: 'self-heretic', when: ansCell, effects: [path('heretic'), { loyalty: A, delta: 10 }] },
          { text: '“Tell her what you believe, Anselm. Not what I do.”', to: 'self-inquisitor', when: ansWrit, effects: [path('inquisitor'), { loyalty: A, delta: 10 }] },
          { text: '“Tell her what you believe, Anselm. Not what I do.”', to: 'self-reform', when: ansPlain, effects: [path('reform'), { loyalty: A, delta: 10 }] },
        ],
      },
      journals: {
        speaker: W, mood: 'sad',
        text: 'I know, love. She came here once, as a novice, on pilgrimage. She knelt and put her hands flat on my floor before she prayed, and I thought: that one is listening for something under the stone. (She sighs.) Somebody should have listened to her. That is not the question, though. The question is still his.',
        next: 'turn',
      },
      // --- counsel taken
      reform: {
        speaker: A,
        text: '(He takes a breath and faces her.) I believe it can be mended, Mother. The way a net is mended: knot by knot, by people who mean to go on fishing. I believe there are good priests in it still, and that they are frightened, and that frightened people can be brave if someone goes first.',
        next: 'w-reform',
      },
      'w-reform': { speaker: W, mood: 'happy', text: 'Then mend it, love. Start small. Start with the lamp. That is how I started; I had nothing else.', next: 'bless' },
      inquisitor: {
        speaker: A,
        text: '(He takes a breath and faces her.) I believe it must be remade, Mother. Not mended. The rot goes too deep for mending. The Wick has the knives already; it is only holding them by the wrong end. Someone who has read the Wardens’ books ought to pick them up.',
        next: 'w-inquisitor',
      },
      'w-inquisitor': { speaker: W, mood: 'sad', text: 'Be careful, Brother. Fire has no eyes. Whoever carries it must look twice as hard as other people, and forgive twice as often, or it will see for him.', next: 'bless' },
      heretic: {
        speaker: A,
        text: '(He takes a breath and faces her.) I believe in the Lantern, Mother. I do not think it ever lived in Solenne. I think it lived in lamps like yours, in doors like this one, for anyone who happened to be on the road. I think the Church only stood near it, and was warm, and called that ours.',
        next: 'w-heretic',
      },
      'w-heretic': { speaker: W, mood: 'happy', text: '(She laughs, a real laugh, and the lamp by the door flares with it.) Oh, that is the one I would have said. Don’t tell the Hierophant.', next: 'bless' },
      // --- his own answer
      'self-heretic': {
        speaker: A,
        text: '(He is quiet for a long time.) …I believe in the Lantern still, Mother. I found I did, in the cell, in the dark, when there was nothing else to believe in. But I do not believe it needs a cathedral, or a Hierophant, or a Wick, or me in a cassock. It needs a lamp by a door. That is all. That is the whole of it.',
        next: 'w-heretic',
      },
      'self-inquisitor': {
        speaker: A,
        text: '(He is quiet for a long time.) …I believe the Church is dying, Mother, and that it deserves to, and that people will freeze if it does. So it must be remade, hard and fast, by people who know what it hid. If that means the Wick, then the Wick. Lantern forgive me. I think I should be good at it.',
        next: 'w-inquisitor',
      },
      'self-reform': {
        speaker: A,
        text: '(He is quiet for a long time.) …I believe it can be mended, Mother. Not because it deserves to be. Because the people in it do. The parish priests writing from the starving north. The sisters in this nave. Old Benedek, terrified, paying hedge-mages’ fines from the poor-box. Me. It is made of us. We can be mended.',
        next: 'w-reform',
      },
      bless: {
        speaker: W,
        text: '(She lays a hand on his head, and one, lightly, on yours. It is warm, the way a lamp-glass is warm.) Keep a lamp for travellers, the both of you. That is all any of us were ever for. The rest is only arguing about the wick.',
        next: 'dawn',
      },
      dawn: {
        speaker: 'narrator', effects: [{ unlockLore: 'lore:saint-wenna' }],
        text: 'She does not vanish. She simply grows less necessary, the way a lamp does when the sun comes up, until there is grey dawn in the nave and only the small flame by the door, still burning. Anselm is asleep against the altar with his book open on his knees.',
      },
    },
  },
  {
    id: 'dialogue:lantern-dawn', name: 'Anselm: Dawn at Saint Wenna’s',
    entries: [
      { when: eq(PATH, 'reform'), node: 'reform' },
      { when: eq(PATH, 'inquisitor'), node: 'inquisitor' },
      { when: eq(PATH, 'heretic'), node: 'heretic' },
      { node: 'plain' },
    ],
    nodes: {
      plain: { speaker: A, text: 'Morning already. (He rubs his eyes.) I dreamt a woman with chilblains told me off. It was the best sleep I have had in a year.' },
      reform: {
        speaker: A,
        text: 'I shall write to the Hierophant. He will not answer. I shall write again. (He closes his book.) Whatever the Church is, after all this, it ought to be the kind of thing that comes down to an abbey in the mud and reads out the names. I can be that much of it, at least.',
        choices: [
          { text: '[Listen]', to: 'unforgiven', when: { all: [betrayed, { not: f('npc.anselm-pryde.forgave') }] } },
          { text: '“The Church is lucky to have you.”', to: 'close' },
        ],
      },
      inquisitor: {
        speaker: A,
        text: 'When we are next in Solenne, I mean to ask for the Lord-Inquisitor. (He sees your face.) Don’t. I know what the Wick is. I know what Valcastre is; better than you, perhaps. That is exactly why it ought to have someone in it who has read the Warden’s Primer, and who remembers what bread tastes like when it has been blessed by a man who will not ask your name.',
        choices: [
          { text: '[Listen]', to: 'unforgiven', when: { all: [betrayed, { not: f('npc.anselm-pryde.forgave') }] } },
          { text: '“Be careful, Anselm. You heard what she said about fire.”', to: 'close' },
        ],
      },
      heretic: {
        speaker: A,
        text: 'I have taken off my stole. (He holds it out: an old strip of white and gold, darned at the ends.) I shall keep my vows, all but obedience. That one I gave back to her last night, I think, and she did not seem to mind. The Lantern is still lit. (He nods towards the door.) There. You lit it.',
        choices: [
          { text: '[Listen]', to: 'unforgiven', when: { all: [betrayed, { not: f('npc.anselm-pryde.forgave') }] } },
          { text: '“Keep the stole, Brother. Wear it for her.”', to: 'close' },
        ],
      },
      unforgiven: {
        speaker: A,
        text: '(He looks at you for a while.) I have not forgiven you yet, you know. For the green, for Valcastre. I thought I might, last night, kneeling there. I did not. (He stands, stiffly.) But I am still walking with you. That is a kind of mending too. The slow kind.',
        next: 'close',
      },
      close: {
        speaker: A, mood: 'happy',
        text: 'Come. Leave the lamp. Somebody ought to find this place lit when they come down the moor road, and I should like it to be a surprise.',
      },
    },
  },
];

export default dialogues;
