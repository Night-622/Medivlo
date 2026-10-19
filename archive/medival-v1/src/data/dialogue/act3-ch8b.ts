/** Dialogue: Act III Chapter 8 "The Hollow Sea" (docs/lore/14-act3-spec.md), part 2: the Pale Saint. Owner: Claude 4.
 *  - dialogue:ch8-ysolde: the confrontation in the Drowned Cathedral, from npc:ysolde’s route.
 *    She turns iff act2.ysolde_doubt >= 2 and (Sable saved, or the Wardens’ archive published, or Hesta alive and here).
 *    The decision is made on the crux choice: act3.ysolde_fate = 'turned', or act3.ysolde_fight = true.
 *  - dialogue:ch8-ysolde-fallen: after the boss, opened by the stage and reopenable from her route.
 *    act3.ysolde_fate = 'slain' | 'spared' on the choice.
 *  - The seventh Ember (world.embers_held = 7, ashmark.rank = 5, act3.embers_complete, lore:the-seven-embers#lantern)
 *    lives on one node per dialogue, reachable only through a choice gated on NOT act3.embers_complete. */
import type { DialogueDef, DialogueNode, NarrativeCondition, NarrativeEffect, NpcId } from '@/core';

const Q = 'quest:into-the-dreaming' as const;
const Y = 'npc:ysolde' as const, NHAL = 'npc:nhal' as const;
const MAREN = 'npc:maren-hollis' as const, SABLE = 'npc:sable' as const, HESTA = 'npc:hesta-corrow' as const;

const f = (flag: string): NarrativeCondition => ({ flag });
const is = (flag: string, value: string): NarrativeCondition => ({ flag, op: '==', value });
const all = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: c });
const any = (...c: NarrativeCondition[]): NarrativeCondition => ({ any: c });
const not = (c: NarrativeCondition): NarrativeCondition => ({ not: c });
const fol = (npc: NpcId) => f(`companion.${npc.slice(4)}.following`);

// ----- the turn
const FATE = 'act3.ysolde_fate', DONE = 'act3.embers_complete';
const doubt2: NarrativeCondition = { flag: 'act2.ysolde_doubt', op: '>=', value: 2 };
const doubt3: NarrativeCondition = { flag: 'act2.ysolde_doubt', op: '>=', value: 3 };
const sableSaved = is('companion.sable.fate', 'saved');
const published = is('act2.warden_archive', 'published');
const hestaAlive = f('act1.hesta_alive');
const hestaHere = all(hestaAlive, fol(HESTA));
const TURNS = all(doubt2, any(sableSaved, published, hestaHere));

const MET: NarrativeEffect = { setFlag: 'act3.ysolde_met', value: true };
const TURNED: NarrativeEffect = { setFlag: FATE, value: 'turned' };
const FIGHT: NarrativeEffect = { setFlag: 'act3.ysolde_fight', value: true };
const SLAIN: NarrativeEffect = { setFlag: FATE, value: 'slain' };
const SPARED: NarrativeEffect = { setFlag: FATE, value: 'spared' };
/** The seventh Ember. Only ever entered through a choice gated on not(DONE). */
const EMBER: NarrativeEffect[] = [
  { setFlag: 'world.embers_held', value: 7 },
  { setFlag: 'ashmark.rank', value: 5 },
  { setFlag: DONE, value: true },
  { unlockLore: 'lore:the-seven-embers', section: 'lantern' },
  { unlockLore: 'lore:the-seventh-ember' },
];
const emberText = 'It is very small. It is white, and only white, the white of the Brand before it went dark, and when it touches your palm it goes into you like a stone into a pond: the seventh, the last. Every Ember you carry turns toward it at once, like a congregation turning to the altar, and the mark runs up your arm in lines of light. For one moment you can feel the whole world: every hearth still lit in it, every lantern, every candle in every window; and under all of it, very far down, a red heart beating too slowly.';
/** guard: take the Ember only if it has not been taken */
const take = (to: string, after: string, text = '[Take the seventh Ember]') => [
  { text, to, when: not(f(DONE)) },
  { text: '[The seventh Ember already burns in your hand]', to: after, when: f(DONE) },
];

// =============================================================== the confrontation
const CONFRONT: Record<string, DialogueNode> = {
  idle: { speaker: 'narrator', text: 'The nave is wet stone and silence. Nobody is kneeling at the altar.' },
  start: {
    speaker: 'narrator', effects: [MET, { unlockLore: 'lore:ysolde-maerin' }],
    text: 'The Drowned Cathedral is the Cathedral of the Brand, remembered. Every pillar of Solenne is here, every arch and gilded boss, built of black water standing upright; the great windows are panes of rain falling upward, and through them comes a grey light from nowhere. The pews are full. Hollowed sit in every one of them, hundreds, shoulder to shoulder, heads bowed, breathing slow: asleep, and smiling. At the far end of the nave, where the Brand once burned on its altar, there is a basin of black water. A woman in white kneels before it, keeping the hours.',
    next: 'rise',
  },
  rise: {
    speaker: 'narrator',
    text: 'She hears you on the threshold. She gets up without hurry, the way a nurse gets up from a bedside when someone comes in softly so as not to wake the patient: tall, white-robed, her skin gone almost to glass. Water runs from her eyes and her hair and never reaches the floor. Round her head the halo of black water turns, slow as a mill-wheel.',
    next: 'greet',
  },
  greet: {
    speaker: Y, mood: 'hollow',
    text: 'Hush. They’re sleeping. (She comes down the nave between the pews to meet you, and stops an arm’s length away, as she did under the water.) You came. Of course you came. I watched you all the way along the unmade road: {flag:world.embers_held} little fires, walking up my nave. They have been lighting my windows since the shore.',
    choices: [
      { text: '[She does not quite meet your eyes]', to: 'd-cold', when: not(doubt2) },
      { text: '[Her hands are shaking]', to: 'd-shaken', when: all(doubt2, not(doubt3)) },
      { text: '[She has been weeping]', to: 'd-wept', when: doubt3 },
    ],
  },
  'd-cold': { speaker: Y, mood: 'hollow', next: 'why', text: 'I said I would not be angry, and I am not. Sit with me a while, little spark. You look so tired. Everyone who comes here looks so tired, at first.' },
  'd-shaken': { speaker: Y, mood: 'afraid', next: 'why', text: 'It has not spoken to me since the parley. Not once. In six years it has never been quiet so long. I have sat here in its house and listened, and listened, and there is nothing, as though it were waiting to hear what you would say.' },
  'd-wept': { speaker: Y, mood: 'sad', next: 'why', text: 'I said: show me. Here, where it is thin and has to show its face. I swore it by the fire I used to keep. (She tries to smile.) I have been so frightened that you would come, and so frightened that you would not.' },
  why: {
    speaker: Y, mood: 'sad',
    text: 'Look at them. (She turns to the pews.) That one was a carter’s boy in the Grey Lung wards at Solenne. I sat with him three nights, and he lived, and grew up, and went to the black water at Varn when his own children sickened. That one kept a lighthouse. That one nobody knows; she came walking up out of the marsh in a wedding dress. They do not dream of anything. They do not hurt. This is all I ever wanted for anyone.',
    next: 'hub',
  },
  again: { speaker: Y, mood: 'hollow', next: 'hub', text: '(She is kneeling at the basin again, and gets up when she hears you.) You came back. Mistress always came back too, to finish an argument.' },
  hub: {
    speaker: Y, mood: 'hollow',
    text: 'So. You came all this way down. Tell me what you came to tell me, little spark. I promise I will listen. I have always been very good at listening. It is what went wrong.',
    choices: [
      { text: '“Why you? Not the reasons, Ysolde. You.”', to: 'you', once: true },
      { text: '[Maren] Maren is staring at her.', to: 'maren', when: fol(MAREN), once: true },
      { text: '[Sable] “There’s someone here who wants a word with you.”', to: 'sable', when: all(fol(SABLE), sableSaved), once: true },
      { text: '[Sable’s message] “A thief from Haldren asked me to tell you something.”', to: 'sable-word', when: all(sableSaved, not(fol(SABLE))), once: true },
      { text: '[The Wardens’ archive] “They printed your slips, Ysolde. And Hesta’s figures. All of it.”', to: 'archive', when: published, once: true },
      { text: '[Hesta] Hesta steps past you.', to: 'hesta', when: hestaHere, once: true },
      { text: '[Lastlight] Lay Hesta’s sword on the water between you.', to: 'lastlight', when: not(hestaAlive), once: true },
      { text: '[Haldren] “Haldren lit every lantern it had.”', to: 'lanterns-held', when: is('act3.siege_outcome', 'held'), once: true },
      { text: '[Haldren] “Haldren fell. They carried their lanterns all the way to Cinderhold.”', to: 'lanterns-fallen', when: is('act3.siege_outcome', 'fallen'), once: true },
      { text: '[Oathbound] “You were Lightsworn. So am I. Keep the vigil with me.”', to: 'oath', when: { classIs: 'class:oathbound' }, tag: 'class', once: true },
      { text: '“Let me show you. Here, where it’s thin. With my own hand.”', to: 'show' },
    ],
  },
  you: { speaker: Y, mood: 'sad', next: 'hub', text: 'Because I was the one who could. (She says it simply.) In the Grey Lung year I went from ward to ward with my hands lit, and I saved them, hundreds, and the ones I did not reach I wrote down. I have the list still: three hundred and eleven names in my own hand. And then I looked into the Brand and saw that the whole world was on the list, and I could not, I could not write it all down. So I thought: let nobody be on it. Let nobody be the one I did not reach.' },
  maren: { speaker: MAREN, mood: 'angry', next: 'maren2', text: 'Hollis. Brindlecross. (Her voice is very steady.) My mam died of the Grey Lung at Candlemas, the year you came north. You were at Haldren by Lady Day. Six weeks.' },
  'maren2': { speaker: Y, mood: 'sad', next: 'hub', text: '(She closes her eyes.) Hollis, of Brindlecross. Two hundred and six. I remember the name; I remember all of them. (She opens them.) I am so sorry. I was six weeks too late, and so I tried to be early for everyone at once, for ever. That is all this is. You can see it, can’t you? The same mistake, made very large.' },
  sable: { speaker: SABLE, next: 'sable2', text: '(She steps out from behind you with her warm hands in her sleeves.) Hello, lady. You were singing in my reeds. I heard you every night for a month. You were sorry the whole time; I could tell.' },
  'sable2': { speaker: Y, mood: 'afraid', next: 'sable3', text: '(She stares.) You. The thief by the black pool. I had you. You were nearly home, and then the fire… (Softly.) Your eyes are grey.' },
  'sable3': { speaker: SABLE, next: 'sable4', text: 'They are, aren’t they? Nobody told me. (A crooked grin.) Here’s what I came to say, and then I’ll stop. It hurt. It hurt like anything, being burned back out. I miss the quiet, some nights; I won’t lie to you. But I came back out of the water, lady, the whole way, and I’d do it again. Somebody ought to tell you it can be done. So I’m telling you.' },
  'sable-word': { speaker: 'player', next: 'sable4', text: 'She said: tell her a thief from Haldren came back out of the water, and it hurt like anything, and it was worth it. Somebody ought to tell her it can be done.' },
  'sable4': { speaker: Y, mood: 'sad', next: 'hub', text: '(For a long time she says nothing. The water running from her eyes runs faster.) It can be done. (As if testing the words for weight.) Half gone, and it can be done.' },
  archive: { speaker: 'player', next: 'archive2', text: 'Aurelian printed the Wardens’ archive. Every ledger. Two hundred years of the leys cooling, in Hesta’s figures. And your slips. They read them aloud in the markets from Solenne to Haldren. “If the fire is dying, it should not die alone.” It isn’t, Ysolde. Everyone knows now. Nobody is pretending any more.' },
  'archive2': { speaker: Y, mood: 'afraid', next: 'archive3', text: 'They… printed it? (She puts a hand to her mouth, and water runs out between her fingers.) I wrote that at two in the morning in the Keeper’s rooms, by a guttering candle. I thought nobody would ever read it but Mistress. (Barely a whisper.) And they did not lie down? They read it, and they did not lie down?' },
  'archive3': { speaker: 'narrator', next: 'hub', text: 'You tell her: the Church split down the middle, priests arguing in the street, Lanternmass lanterns lit in villages that hold no licence to light them. A world that knows its fire is dying, quarrelling about what to do. Ysolde listens as though to news of a family she had believed dead.' },
  hesta: { speaker: 'narrator', next: 'hesta2', text: 'Hesta steps past you, leaning on Lastlight, which steams in the wet. She does not draw it. She walks up the nave between the sleepers until she is close enough to touch, and stops, and for a moment the two of them only look at each other: the old woman burned to the elbow, and the saint made of water.' },
  'hesta2': {
    speaker: Y, mood: 'afraid',
    text: 'Mistress. (Her voice cracks clean in half.) You’re late.',
    choices: [
      { text: '[Listen]', to: 'hesta-faced', when: is('act3.dream.hesta-corrow', 'faced') },
      { text: '[Listen]', to: 'hesta-plain', when: not(is('act3.dream.hesta-corrow', 'faced')) },
    ],
  },
  'hesta-faced': { speaker: HESTA, mood: 'sad', next: 'hesta4', text: 'I am. I always was. (She breathes carefully round the cough.) I had a dream on the way in, girl. You were twelve, with frost in your hair, asking me should you listen harder. And for once in thirty years I told you the truth. I was frightened of it. It sang to me first. I never said, because a Warden is meant to know, and I could not bear you to see me not knowing. That was the lie. Not the box. That.' },
  'hesta-plain': { speaker: HESTA, mood: 'sad', next: 'hesta4', text: 'I am. I always was. (She breathes carefully round the cough.) You thought I put the reports back in the box because I was a coward. You were half right. I was frightened. It sang to me first, girl, long before you. I never told you, because a Warden is meant to know, and I could not bear you to see me not knowing. That was the lie. Not the box. That.' },
  'hesta4': { speaker: Y, mood: 'sad', next: 'hesta5', text: '(She is shaking.) You were frightened. (As though it were the strangest thing she had ever heard.) All those years. And I thought: if Mistress is not frightened, it cannot be so bad. It must be safe to look.' },
  'hesta5': { speaker: HESTA, next: 'hesta6', text: 'Well, I was, and it wasn’t, and here we are. (Roughly.) There’s a fire at Cinderhold. I keep it lit. You can come home to it or not; I’ll not drag you. But I came down here to say it to your face once, without a brazier in between. Eat something, girl.' },
  'hesta6': { speaker: Y, mood: 'sad', next: 'hub', text: '(A sound comes out of her that is half a laugh and half something much older.) Eat something. You signed every letter with it. Every one.' },
  lastlight: { speaker: 'narrator', next: 'lastlight2', text: 'You draw Lastlight and lay it flat on the black water between you. It does not sink. It steams softly where the water touches the blade, as it steamed in the snow on the shore of Wennamere, and Ysolde goes down on her knees beside it as if it were a body.' },
  'lastlight2': {
    speaker: Y, mood: 'sad',
    text: 'Her sword. (She does not touch it.) I watched her burn at Varn. I screamed; did you hear me? I did not know I still could. (Softly.) She never told you what to tell me, at the end. She ran out of breath. I have thought about it every night since: what she would have said.',
    choices: [
      { text: '“I think she would have said: come home.”', to: 'lastlight3' },
      { text: '“I think she would have told you to stand up straight.”', to: 'lastlight4' },
    ],
  },
  'lastlight3': { speaker: Y, mood: 'sad', next: 'hub', text: 'Come home. (She lays her wet hand flat on the blade at last, and it hisses, and she does not take it away.) Yes. She would. She always did, as though home were a place I had wandered away from, and not a place that was ending.' },
  'lastlight4': { speaker: Y, mood: 'sad', next: 'hub', text: '(And she laughs, startled, a girl’s laugh.) Oh, she would. Shoulders back. Don’t gape, it’s undignified. (The laugh breaks.) She said it to you too. She said it to everyone.' },
  'lanterns-held': { speaker: Y, mood: 'sad', next: 'hub', text: '(Softly.) I know. I saw. From down here the cities of the world look like coals in a grate, and on Lanternmass night Haldren went up so bright I could see it through the floor of the sea. Every window. Every wall. (She is quiet a while.) I thought they had nothing left to burn. I thought everyone was as tired as I was.' },
  'lanterns-fallen': { speaker: Y, mood: 'sad', next: 'hub', text: 'I saw that too. A string of little lights going east along the road in the snow, all night, like a necklace somebody had dropped. They lost the city and they kept the lanterns. (She shakes her head, slowly.) Why would anyone do that? Why would anyone carry a lantern out of a burning city?' },
  oath: { speaker: 'narrator', next: 'hub', text: 'You kneel on the black water and say the Lightsworn’s vigil, the one every novice of the Lantern learns: By the Seventh Light, let me be a lamp, and not the fire. After a moment her lips begin to move with yours. She knows it better than you do. She has not said it in six years.' },
  // --- the showing
  show: { speaker: 'narrator', next: 'show2', text: 'You open your hand. Every Ember in you wakes at once, {flag:world.embers_held} small fires calling to one another, and you let Embersight go out of you like breath, and hold the mark up to the Drowned Cathedral, and look. Ysolde looks with you. She cannot help it; she is standing too close to the light.' },
  'show2': { speaker: 'narrator', mood: 'afraid', next: 'show3', text: 'It is not a cathedral. It is a throat. The pillars are its ribs and the vault is its palate, and it is swallowing, very slowly, as it has been swallowing since before the sun was lit. The sleepers in the pews are not dreaming. In every one of them, behind the smile, a small warm light is being drunk a sip at a time, and the light knows. Every one of them is awake in there. Every one of them is watching it happen.' },
  'show3': { speaker: 'narrator', next: 'show4', text: 'And under the altar, under the basin, at the bottom of everything, something has made itself a chamber. It is the shape of a heart. It is empty. Round its walls, in a ring, are seven hollows, each exactly the size of an Ember.' },
  'show4': { speaker: Y, mood: 'afraid', next: 'nhal', text: 'No. (She is looking at the carter’s boy in his pew, at the little light behind his smile, guttering.) No, they are asleep. I sat with them. I sat with every one of them. They are asleep. (She turns, not to you, but to the basin.) You said.' },
  nhal: { speaker: NHAL, mood: 'hollow', next: 'nhal2', text: '(The basin speaks, and the pews, and the rain in the windows, and the inside of your own ears.) Hush, little saint. Hush now. The warm one is showing you shadows. They are held. Isn’t that what you asked of us? That no one should be cold. That no one should be the one you did not reach. We will reach them all. We will hold every one of them for ever, and they will be awake to be held.' },
  'nhal2': { speaker: Y, mood: 'afraid', next: 'nhal3', text: 'Awake. (The word comes out of her like a splinter.) You said they would dream. You said it would be like frost going off a window. You said it would be gentle.' },
  'nhal3': { speaker: NHAL, mood: 'hollow', next: 'crux', text: 'It will be gentle for us. (Fondly. So fondly.) Bring us the Embers, little saint. Bring us the warm one’s hand. We will set them where a heart goes, and we will beat, and the whole world will be our body, and nothing will ever, ever leave. You will be so happy. We have never lied to you. We only let you hear what you could bear.' },
  crux: {
    speaker: 'narrator',
    text: 'Ysolde goes down on her knees on the black water. Her halo is turning so fast it hums. The rain in the windows has begun to fall faster, upward, with a roar like a weir; the sleepers stir in their pews; and somewhere under everything, very large, something opens its mouth. She is not looking at the basin any more. She is looking at you. At your hand.',
    choices: [
      { text: '[Hold out your hand to her]', to: 'turn', when: TURNS, effects: [TURNED] },
      { text: '[Hold out your hand to her]', to: 'refuse', when: not(TURNS), effects: [FIGHT] },
      { text: '“It ends here, Ysolde.” [Draw your weapon]', to: 'strike', tag: 'aggressive', effects: [FIGHT] },
    ],
  },
  // --- she turns
  turn: {
    speaker: 'narrator', effects: [TURNED],
    text: 'You hold out your hand: the marked one, burning, {flag:world.embers_held} Embers bright in it. You say nothing. There is nothing left to say that the light has not said. Ysolde Maerin looks at it for a long time, kneeling on the water, with the whole drowned weight of the Mire leaning on her shoulders and whispering hush.',
    choices: [
      { text: '[She looks past you, at Hesta]', to: 'turn-hesta', when: hestaHere },
      { text: '[She is thinking of a thief with grey eyes]', to: 'turn-sable', when: all(not(hestaHere), sableSaved) },
      { text: '[She is thinking of a city reading her words aloud]', to: 'turn-archive', when: all(not(hestaHere), not(sableSaved), published) },
    ],
  },
  'turn-hesta': { speaker: Y, mood: 'sad', effects: [{ loyalty: HESTA, delta: 10 }], next: 'turn2', text: 'Mistress was frightened. (Wonderingly.) All those years she was frightened too, and she kept the candle lit anyway. (She looks up at you.) Then I may be frightened. Mayn’t I? I may be frightened, and come home anyway.' },
  'turn-sable': { speaker: Y, mood: 'sad', next: 'turn2', text: 'Half gone. Half gone, with her feet in the water, singing with me, and she came back. It hurt her, and she came back, and she says she would do it again. (She looks up at you.) Then it can be done. Even from here, it can be done.' },
  'turn-archive': { speaker: Y, mood: 'sad', next: 'turn2', text: 'They read it, and they did not lie down. The whole world knows the fire is dying, and it is arguing in the streets about what to do, like a family round a bed. (She looks up at you.) It is not dying alone. I was so sure it would die alone. I was so sure I was the only one sitting up with it.' },
  'turn2': { speaker: 'narrator', next: 'turn3', text: 'She puts her hand in yours. It is cold as the bottom of a well, and weighs nothing at all, and it closes on your fingers as if it were drowning. The Mire screams. Not a sound: a pressure, the whole sea at once, as if every fathom of it had leaned on this one place. The halo of black water round her head stops. Hangs. Breaks, and falls; and for the first time since you came down into the Mirelands, the rain falls down.' },
  'turn3': { speaker: NHAL, mood: 'hollow', next: 'turn4', text: '(From everywhere, and for the first time it is not fond.) Ours. She is ours. She was ours before you were born, little cup. She said yes. She is the only one who ever said yes—' },
  'turn4': { speaker: Y, mood: 'sad', next: 'turn5', text: '(She does not let go of your hand. She does not look round.) I take it back. (Quite quietly.) I take it back.' },
  'turn5': { speaker: 'narrator', next: 'turn6', text: 'The water goes out of the cathedral like a tide out of a harbour, all at once, sucking at the pillars, and leaves them standing: not black water any more but grey stone, wet and real and very old, the memory of Solenne set hard at last. In the pews the sleepers sigh. One or two of them, the carter’s boy among them, begin to cough, the way the drowned cough when they are pulled out.' },
  'turn6': { speaker: Y, mood: 'sad', next: 'gift', text: '(She is shivering. She looks down at her own hands as if she had never seen them before.) Oh. Oh, little spark. I’m cold. (She laughs, and it breaks in the middle, and the tears running down her face are warm; you can see them steam.) I remember this. It hurts. It hurts so much. I had forgotten it was meant to.' },
  'ember-again': { speaker: 'narrator', next: 'gift', text: 'Ysolde is sitting on the altar step, shivering in her wet robe, both hands pressed to her breastbone, where something under the thin skin is shining white. She looks up when you come in.' },
  gift: {
    speaker: Y, mood: 'sad',
    text: '(She presses her hand flat over her heart, and under the thin skin something shines white.) There is one thing more. I told it the seventh fell into the sea. It was the only lie I ever told it. When the Brand broke in my hands at Lanternmass, the heart of it, the white coal Saint Solenne carried up out of the deep, came to me, the way yours came to you. I could not give it away. I kept it under my ribs for a year, and it was the only warm thing in me. I think it is the only reason there is any of me left to be cold.',
    choices: take('ember', 'parting'),
  },
  ember: { speaker: 'narrator', effects: EMBER, next: 'ember2', text: `She takes it out of herself the way one takes out a splinter: carefully, wincing, without fuss, and lays it in your palm. ${emberText}` },
  'ember2': {
    speaker: Y, mood: 'sad',
    text: 'There. Seven. All of them, in one small warm hand. (She sits back on her heels on the wet stone: a tired woman in a soaked white robe.) It was never mine to give to it. I know that now. It is yours to carry the rest of the way. I don’t know what you will do with it, down at the Heart. I don’t think I am owed the knowing.',
    choices: [
      { text: '“Come with me. See it done.”', to: 'come' },
      { text: '“What will you do now?”', to: 'now' },
      { text: '“Thank you, Ysolde.”', to: 'thanks' },
    ],
  },
  come: { speaker: Y, next: 'parting', text: 'Yes. (At once, as though she had been afraid you would not ask.) Not to stop you. Not to help it. Only to see. I owe them that. (She looks at the pews.) I owe all of them that.' },
  now: { speaker: Y, mood: 'sad', next: 'parting', text: 'Sit with them. (She nods at the pews.) Some of them are waking, and waking hurts; you saw. Somebody should sit with them while it does, and I know how. It is the one thing I always knew how to do. (A breath.) And when you go down to the Heart, I will come after you. Not to stop you. To see.' },
  thanks: { speaker: Y, next: 'parting', text: '(She looks at you as if nobody has said it to her in a very long time, which is true.) Mistress used to say it as though it cost her a tooth. You say it as though it costs nothing. (Almost a smile.) When you go down to the Heart, I will come after you. Not to stop you. To see.' },
  parting: { speaker: 'narrator', text: 'Ysolde Maerin gets up off the stones of the cathedral she drowned, and goes down the nave to the first pew, where the carter’s boy is coughing, and sits beside him and takes his hand, and very softly begins to hum. It is not the Mire’s tune. It is a ward-song from the Grey Lung year, a nurse’s song, to keep a child breathing through the night.' },
  'post-turned': { speaker: 'narrator', next: 'post2', text: 'Ysolde moves among the waking. She goes from pew to pew with a wet cloth and a cup of water, the way she once went from bed to bed in the Grey Lung wards, and the drowned cough and weep and clutch at her sleeves, and she lets them. She looks up as you pass, and nods.' },
  'post2': { speaker: Y, text: 'Not yet, little spark. When you go down to the Heart, I will come. Go on. I have patients.' },
  // --- she fights
  refuse: {
    speaker: 'narrator', effects: [FIGHT],
    text: 'Ysolde looks at your hand. You watch her want it. You watch her lift her own hand from the water, an inch, two, and stop, and close it.',
    choices: [
      { text: '[She cannot]', to: 'refuse-cold', when: not(doubt2) },
      { text: '[She will not]', to: 'refuse-broken', when: doubt2 },
    ],
  },
  'refuse-cold': { speaker: Y, mood: 'hollow', next: 'rise-up', text: 'Shadows. It is right, you know: you are only showing me shadows, with a little fire held up behind them. (Gently.) I have looked into the Brand for longer than you have been alive, little spark. I know what I saw. I will not be talked out of mercy by a frightened child with a lamp.' },
  'refuse-broken': { speaker: Y, mood: 'sad', next: 'stop-me', text: 'I believe you. (She says it to the floor.) That is the dreadful thing. I believe you, and I can’t. If it lied, then I put out every hearth in the world for a mouth. I drowned Varn for a mouth. And there is no road back from that, little spark. Nobody comes back from so far down. Nobody ever has.' },
  'stop-me': { speaker: Y, mood: 'sad', next: 'rise-up', text: '(She rises, and the water of the whole cathedral rises behind her.) So stop me. Please. Stop me before it talks me round again; it is so very good at it. Mistress always said that everything worth doing hurts.' },
  strike: { speaker: Y, mood: 'sad', effects: [FIGHT], next: 'rise-up', text: '(She sees the steel, and smiles the tired smile of a nurse at the end of a long night.) Yes. That is how it always ends, isn’t it? With somebody’s hand. (She rises, and the water rises with her.) Very well, little spark. Let it hurt.' },
  'fight-again': { speaker: Y, mood: 'hollow', text: '(She stands at the altar with the water lifted behind her like a wave that has decided not to fall.) Still here? Then come, little spark. Let us not make it slower than it has to be.' },
  'rise-up': { speaker: 'narrator', text: 'The water of the whole Drowned Cathedral stands up behind her like a wave that has decided not to fall. Her halo spins until it is a black wheel, a mill-race, a drain. The sleepers in the pews lift their faces, smiling, and open their eyes, and their eyes are black. The Pale Saint comes down the nave toward you, and the rain comes up.' },
};

// =============================================================== the fallen saint
const FALLEN: Record<string, DialogueNode> = {
  idle: { speaker: 'narrator', text: 'The nave is ankle-deep in still water. Nobody kneels at the altar.' },
  start: { speaker: 'narrator', next: 'f1', text: 'The wave falls. It comes down over the whole nave at once, and when it has gone the Drowned Cathedral is ankle-deep and quiet, and the sleepers are asleep again in their pews, and Ysolde Maerin is lying in the shallows by the altar step with her white robe spread round her on the water. Her halo has broken into drops. They hang above her, not falling, not rising, like beads on a snapped string.' },
  f1: {
    speaker: Y, mood: 'sad',
    text: 'Little spark. (Her voice is very small.) You’re bleeding. I’m sorry. I am always sorry. It never seems to be enough.',
    choices: [
      { text: '[Hesta kneels beside her]', to: 'f-hesta', when: hestaHere },
      { text: '[Kneel beside her]', to: 'f-thanks', when: all(not(hestaHere), doubt2) },
      { text: '[Kneel beside her]', to: 'f-cold', when: all(not(hestaHere), not(doubt2)) },
    ],
  },
  'f-hesta': { speaker: HESTA, mood: 'sad', next: 'f-hesta2', text: '(Hesta goes down on her knees in the water, which costs her a great deal, and takes the wet white hand in her burned one.) Girl.' },
  'f-hesta2': { speaker: Y, mood: 'sad', next: 'f-hesta3', text: 'Mistress. (A small, cracked smile.) I’m late home.' },
  'f-hesta3': { speaker: HESTA, mood: 'sad', next: 'f-choice', text: 'You always were. (Roughly.) I left the candle lit.' },
  'f-thanks': { speaker: Y, mood: 'sad', next: 'f-choice', text: 'You stopped me. (She breathes out, long and slow: the first breath you have seen her take.) Thank you. It was talking to me the whole time we fought, you know. Hush, hush, let it have them. It has gone very quiet now. I think it has found I am no more use to it.' },
  'f-cold': { speaker: Y, mood: 'sad', next: 'f-choice', text: 'It isn’t speaking. (She sounds puzzled, like a child whose mother has left the room.) It always spoke to me. Hush, little saint. And now there is nothing. (She turns her head on the water and looks at the basin on the altar, a long time.) …Oh. Oh, I see. I was only ever the hand that carried. And the hand is broken, so.' },
  'f-choice': {
    speaker: 'narrator',
    text: 'Under her breastbone, through skin gone thin as paper, something burns white: the seventh Ember, the last, the heart of the Brand. She sees you looking. She does not cover it. Her eyes still run, but slower, and what runs from them now is only water.',
    choices: [
      { text: '“What do you want, Ysolde?”', to: 'want', once: true },
      { text: '[End it, gently]', to: 'slain', effects: [SLAIN] },
      { text: '“Live.” [Spare her]', to: 'spared', effects: [SPARED] },
    ],
  },
  want: { speaker: Y, mood: 'sad', next: 'f-choice', text: 'Want. (She tries the word.) Nobody has asked me that since I was twelve. (A long pause.) I want it to stop hurting. I only ever wanted it to stop hurting. Not for me; for all of them. (She looks at you.) It doesn’t, does it. It never does. That is what Mistress meant.' },
  // --- slain
  slain: { speaker: 'narrator', effects: [SLAIN], next: 'slain2', text: 'You kneel in the shallows and do it gently, as gently as such a thing can be done. She does not flinch. At the last she turns her face toward the altar where the Brand once burned, as if there were still a light there.' },
  'slain2': { speaker: Y, mood: 'sad', next: 'slain3', text: '(Barely a breath.) Leave a candle in the window. Somebody will be late.' },
  'slain3': {
    speaker: 'narrator',
    text: 'Then she is water, and the water is only water, and it falls. Where she lay there is nothing but a white robe on the wet stones, and burning in its folds a coal no bigger than a child’s heart.',
    choices: take('ember', 'slain-end'),
  },
  'slain-again': { speaker: 'narrator', text: 'A white robe lies on the wet stones by the altar step. Something in its folds is still burning white.', choices: take('ember', 'slain-end') },
  'slain-end': { speaker: 'narrator', text: 'The white robe sinks into the shallows, slowly, and is gone. The cathedral is very quiet. In the pews the sleepers go on sleeping, and smiling, and nobody kneels at the altar any more to keep the hours.' },
  // --- spared
  spared: {
    speaker: 'narrator', effects: [SPARED],
    text: 'You lay your hand on her breastbone, over the white light, and you do not burn her, and you do not strike. You only wait. After a long moment she understands. Her face does something terrible and human, and she reaches into herself with both hands, the way one takes out a splinter, and holds it up to you.',
    choices: take('ember', 'spared-end'),
  },
  'spared-again': { speaker: 'narrator', text: 'Ysolde is sitting on the altar step in her soaked robe, shaking, both hands cupped against her breastbone round something that still shines. She holds it out to you without looking up.', choices: take('ember', 'spared-end') },
  'spared-end': { speaker: 'narrator', next: 'spared-end2', text: 'Without it she is only a woman: forty, perhaps, white-haired, soaked to the skin, shaking with a cold she has not felt in six years. The water has stopped running from her eyes. She cannot stand. She looks up at you from the wet stones as though you had done the cruellest thing anyone has ever done to her.' },
  'spared-end2': { speaker: Y, mood: 'sad', next: 'spared-end3', text: 'Alive. (She says it the way one names an illness.) You have left me alive, with all of it. Every name on the list, and Varn, and the Brand, and nobody to say hush. (A long, shuddering breath.) …Yes. That is fair. That is only fair. Somebody should have to remember it, and it had better be me.' },
  'spared-end3': { speaker: 'narrator', text: 'You leave her sitting on the altar step of the cathedral she drowned, wrapped in her own wet arms among the sleepers. When you look back from the door she has not moved. She is watching them breathe.' },
  // --- the Ember (shared by both endings of the fight)
  ember: {
    speaker: 'narrator', effects: EMBER, text: emberText,
    choices: [
      { text: '[Look at what is left of her]', to: 'slain-end', when: is(FATE, 'slain') },
      { text: '[Look at Ysolde]', to: 'spared-end', when: is(FATE, 'spared') },
    ],
  },
  'after-slain': { speaker: 'narrator', text: 'Only wet stone by the altar step now, where a white robe lay. The sleepers sleep on.' },
  'after-spared': { speaker: 'narrator', text: 'Ysolde sits among the sleepers with her knees drawn up, very still, watching them breathe. She does not look up when you pass. Once, very quietly, you hear her say a name; and then another; and then another.' },
};

const dialogues: DialogueDef[] = [
  {
    id: 'dialogue:ch8-ysolde', name: 'Ysolde: The Drowned Cathedral',
    entries: [
      { when: all(is(FATE, 'turned'), f(DONE)), node: 'post-turned' },
      { when: is(FATE, 'turned'), node: 'ember-again' },
      { when: any(is(FATE, 'slain'), is(FATE, 'spared')), node: 'idle' },   // npc:ysolde routes these to ch8-ysolde-fallen
      { when: f('act3.ysolde_fight'), node: 'fight-again' },
      { when: f('act3.ysolde_met'), node: 'again' },
      { when: { questStage: Q, stage: 'ysolde' }, node: 'start' },
      { node: 'idle' },
    ],
    nodes: CONFRONT,
  },
  {
    id: 'dialogue:ch8-ysolde-fallen', name: 'Ysolde: The fallen saint',
    entries: [
      { when: all(is(FATE, 'slain'), f(DONE)), node: 'after-slain' },
      { when: all(is(FATE, 'spared'), f(DONE)), node: 'after-spared' },
      { when: is(FATE, 'slain'), node: 'slain-again' },
      { when: is(FATE, 'spared'), node: 'spared-again' },
      { when: { questStage: Q, stage: 'fallen' }, node: 'start' },
      { node: 'idle' },
    ],
    nodes: FALLEN,
  },
];

export default dialogues;
