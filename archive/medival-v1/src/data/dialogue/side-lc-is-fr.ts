/** Dialogue: Act II side quests, Lantern Coast. Ironspine and Frostreach are in side-lc-is-frb.ts. docs/lore/15-side-content.md. Owner: Claude 4. */
import type { DialogueDef, NarrativeCondition } from '@/core';

const VINES = 'quest:side-lc-snow-on-the-vines', CANDLE = 'quest:side-lc-pilgrims-candle';
const f = (flag: string) => ({ flag });
const eq = (flag: string, value: string) => ({ flag, op: '==' as const, value });
const not = (c: NarrativeCondition) => ({ not: c });
const at = (quest: `quest:${string}`, stage: string) => ({ questStage: quest, stage });
const notStarted = (q: `quest:${string}`) => not({ any: [{ questActive: q }, { questCompleted: q }] });
const offer = (q: `quest:${string}`, ...more: NarrativeCondition[]): NarrativeCondition => ({ all: [f('content.side'), f('content.act2'), f('act1.complete'), notStarted(q), ...more] });
const V = (k: string) => `side.lc.vines.${k}`, C = (k: string) => `side.lc.candle.${k}`;

const dialogues: DialogueDef[] = [
  // ===== Snow on the Vines
  {
    id: 'dialogue:side-lc-vines-fulvio', name: 'Brother Fulvio: Snow on the Vines',
    entries: [
      { when: eq(V('outcome'), 'exposed'), node: 'after-exposed' },
      { when: eq(V('outcome'), 'licensed'), node: 'after-licensed' },
      { when: eq(V('outcome'), 'unproven'), node: 'after-unproven' },
      { when: eq(V('outcome'), 'kept'), node: 'after-kept' },
      { when: at(VINES, 'verdict'), node: 'verdict' },
      { when: { questActive: VINES }, node: 'progress' },
      { when: offer(VINES, eq('act2.church_stance', 'defiant')), node: 'offer-defiant' },
      { when: offer(VINES), node: 'offer' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'npc:brother-fulvio', text: 'I am waiting for someone braver than I am to tell me what I think. It is most of my work, if I am honest, and in my office one is obliged to be.' },
      'offer-defiant': { speaker: 'npc:brother-fulvio', mood: 'afraid', text: '(He looks up and down the lane before he speaks.) You are the one who told the Lord-Inquisitor no, in his own court. Everyone has heard. I would rather nobody saw us talking. But I would rather that than the other thing, so.', next: 'offer' },
      offer: {
        speaker: 'npc:brother-fulvio',
        text: 'Forgive me: the Ashmarked? Then you know about fire, which is more than I do. Brother Fulvio, of the Curia’s Office of Miracles. One row of vines in this village has stayed green under the snow since the Quench, and pilgrims are walking out from the city to kneel in it. The Hierophant wishes to know whether it is the saint’s doing. The Lord-Inquisitor wishes to know whether it is anyone else’s.',
        choices: [
          { text: '“What do you want from me?”', to: 'offer2' },
          { text: '[Oathbound] “The Office of Miracles. We read its canons in the Lightsworn house. Forty days’ watch, and three witnesses not of the parish.”', to: 'oathbound', when: { classIs: 'class:oathbound' }, tag: 'class' },
          { text: '“Not now.”', to: null, tag: 'leave' },
        ],
      },
      oathbound: { speaker: 'npc:brother-fulvio', mood: 'happy', text: 'You have read the canons! Nobody reads the canons. Then you know the forty days are up tomorrow, and I have two witnesses, and one of them is the vintner who sells the leaves. Which is not, strictly, disinterested.', next: 'offer2' },
      offer2: {
        speaker: 'npc:brother-fulvio',
        text: 'Look at it for me. Walk the row. Touch the stone at the head of it; the village calls it the Saint’s Rest. Then tell me what you find, before I have to write anything. If I write “miracle” and it is not, I shall be examined. If I write “fraud” and it is not, I shall have to live with it. And if the Wick read the row before you do, nobody will ask me to write anything at all.',
        choices: [
          { text: '“I’ll look at your row.”', to: 'thanks', effects: [{ startQuest: VINES }] },
          { text: '“Find someone else.”', to: null, tag: 'leave' },
        ],
      },
      thanks: { speaker: 'npc:brother-fulvio', mood: 'happy', text: 'Bless you. Forty-one miracles I have examined in fifteen years. Forty-one frauds. I am praying very hard for forty-two, and I am praying in the other direction as well, to be safe.' },
      progress: {
        speaker: 'npc:brother-fulvio', text: 'Well? No, do not tell me until you are certain. “Certain” is the word canon law likes best. It uses it eleven times on a single page.',
        choices: [
          { text: '“What is the Saint’s Rest?”', to: 'rest', once: true, tag: 'lore' },
          { text: '“What happens to the vintners if it’s a fraud?”', to: 'fraud', once: true },
          { text: '“I’m still looking.”', to: null },
        ],
      },
      rest: { speaker: 'npc:brother-fulvio', text: 'The village says Saint Solenne sat on it to rest on her walk south, with the Brand in her lap, and that the hollow on top is where she set it down. Every village on this coast has a stone where Solenne sat. I have examined nine. Vaudrac’s is the only one that is warm.', next: 'progress' },
      fraud: { speaker: 'npc:brother-fulvio', mood: 'sad', text: 'For selling false relics, a fine, and the leaves burned. That is the canon. But the leaves are not what keeps a row green in the snow, are they? Something is doing that. If that something is a someone, it is not the Curia that will want to speak to them.', next: 'progress' },
      // --- the decision (re-openable: Fulvio’s route stays on this node until the outcome is set)
      verdict: {
        speaker: 'npc:brother-fulvio', text: 'You have been out in the row at night. I can smell the smoke on your coat. Please. What do I write?',
        choices: [
          { text: '“Fraud. Livia’s son Iacopo has been drawing ember into the roots every night, without a licence.”', to: 'exposed', effects: [{ setFlag: V('outcome'), value: 'exposed' }, { setFlag: V('iacopo_taken'), value: true }] },
          { text: '[Wick papers] “Write that the boy was examined under the Lord-Inquisitor’s writ, and found fit for licence. I will answer for him.”', to: 'licensed', when: { all: [eq('act2.church_stance', 'pledged'), { hasItem: 'item:wick-writ' }] }, tag: 'persuade', effects: [{ setFlag: V('outcome'), value: 'licensed' }, { setFlag: V('iacopo_licensed'), value: true }] },
          { text: '“Put your hand on the Saint’s Rest yourself, Brother. Then write what you feel.”', to: 'unproven', when: f(V('stone_warmed')), effects: [{ setFlag: V('outcome'), value: 'unproven' }] },
          { text: '“It’s a miracle. Write it so.”', to: 'kept', tag: 'deceive', check: { stat: 'will', dc: 15, failTo: 'lie-fail' } },
          { text: '[Silver-tongue] “I watched the row all night, Brother, and no living hand touched those roots.” (Not quite a lie: a dying one did.)', to: 'kept', when: { dialogueTag: 'silver-tongue' }, tag: 'trait' },
          { text: '[Oathbound] “I am Lightsworn. I attest it, under my vows, as the canons allow.”', to: 'kept-oath', when: { classIs: 'class:oathbound' }, tag: 'class', effects: [{ setFlag: V('outcome'), value: 'kept' }] },
          { text: '“Give me a little longer.”', to: null, tag: 'leave' },
        ],
      },
      'lie-fail': { speaker: 'npc:brother-fulvio', mood: 'sad', text: 'You looked at your boots when you said it. Everyone looks at their boots. Forty-one times, everyone has looked at their boots. Try again, and look at me.', next: 'verdict' },
      exposed: { speaker: 'npc:brother-fulvio', mood: 'sad', text: '(He writes it, very slowly, and does not blot it.) Fraud. Forty-two. The Wick will take him to Valcastre to be examined. They are not cruel, mostly. Most of the ones they take come home, in the end. (He puts the pen down.) I have never once been glad to be right. You would think, after fifteen years, I would have got the knack of it.' },
      licensed: { speaker: 'npc:brother-fulvio', mood: 'happy', text: 'A licence! Under the writ! Then he is not a fraud, he is a candidate, and a candidate is a thing the Church is permitted to be pleased about. He will go up to Solenne to be taught. They will feed him. (He hesitates.) They will also teach him that the row was never his to keep green. That is the price, you understand. It always is.' },
      unproven: { speaker: 'narrator', effects: [{ unlockLore: 'lore:book-canon-of-miracles' }], text: 'Brother Fulvio walks out to the head of the row with you, and takes off his glove, and lays his soft hand in the hollow of the Saint’s Rest. He keeps it there a long time. When he takes it away his eyes are wet. “Warm,” he says. “Warm as bread.” That night he writes, in his best hand, the three words canon law keeps for the cases it cannot close: cause not determined.' },
      kept: { speaker: 'npc:brother-fulvio', mood: 'happy', effects: [{ setFlag: V('outcome'), value: 'kept' }], text: '(He writes it with great care, and blots it, and looks at it.) Miracle. I have waited fifteen years to write that word. I thought it would feel different. (He rolls the page.) The Hierophant will be glad. He needs one. We all do.' },
      'kept-oath': { speaker: 'npc:brother-fulvio', text: 'Under your vows. Then it is on your soul and not on mine, and you will forgive me if that is a relief. (He writes.) Miracle. Attested by a Lightsworn of the Lantern. Thank you. I mean that more than I ought to.' },
      'after-exposed': { speaker: 'npc:brother-fulvio', mood: 'sad', text: 'I am going back to Solenne tomorrow. I do not think I shall ask for another village. I shall ask for the archive, where the frauds are all dead already.' },
      'after-licensed': { speaker: 'npc:brother-fulvio', text: 'He has been entered on the rolls of the Studium. Iacopo Marrou, of Vaudrac, candidate in Ash. It looks well on the page. Most things do.' },
      'after-unproven': { speaker: 'npc:brother-fulvio', mood: 'happy', text: 'Cause not determined. A beautiful phrase. I may have it cut on my tomb.' },
      'after-kept': { speaker: 'npc:brother-fulvio', text: 'The Curia has entered Vaudrac on the roll of miracles. Forty-two. I keep reading the page, to be sure it still says so.' },
    },
  },
  {
    id: 'dialogue:side-lc-vines-livia', name: 'Livia Marrou: The Saint’s Row',
    entries: [
      { when: eq(V('outcome'), 'exposed'), node: 'after-exposed' },
      { when: eq(V('outcome'), 'licensed'), node: 'after-licensed' },
      { when: eq(V('outcome'), 'unproven'), node: 'after-unproven' },
      { when: { all: [eq(V('outcome'), 'kept'), f(V('stone_warmed'))] }, node: 'after-kept-warm' },
      { when: eq(V('outcome'), 'kept'), node: 'after-kept' },
      { when: { any: [at(VINES, 'night'), at(VINES, 'verdict')] }, node: 'pressed' },
      { when: at(VINES, 'row'), node: 'row' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'npc:livia-marrou', text: 'A leaf for a copper, a cutting for a silver. Blessed by the saint, every one. No, you may not walk in the row. Nobody walks in the row.' },
      row: {
        speaker: 'npc:livia-marrou', text: 'You have come about the row. Everyone comes about the row. My family has worked it for eleven generations, and when every vine on this coast went black in a night, this one did not. The saint provides. Will you buy a leaf?',
        choices: [
          { text: '“Why this row, and no other?”', to: 'saint' },
          { text: '“Who buys the leaves?”', to: 'leaves', once: true },
          { text: '“The stone at the head of the row isn’t warm enough to keep two hundred paces green. Someone is helping it.”', to: 'pressed-ok', tag: 'persuade', check: { stat: 'will', dc: 15, failTo: 'pressed-fail' } },
          { text: '[Ranger] “Those scorch-marks at the roots were made by a pair of hands. Small ones.”', to: 'pressed-ok', when: { classIs: 'class:ranger' }, tag: 'class' },
          { text: '“Good day, Livia.”', to: null, tag: 'leave' },
        ],
      },
      saint: { speaker: 'npc:livia-marrou', text: 'Because she sat at the head of it. Because she set the Brand down in that stone, eleven hundred years ago, and the stone remembers. What other reason does a vine need?', next: 'row' },
      leaves: { speaker: 'npc:livia-marrou', mood: 'sad', text: 'Pilgrims. Thousands of them, out of the city with their dead lanterns, and every one wants something green to carry home. The coppers go to a man at the shore who knows a man in the Saltreach who still has grain. There were eleven children under five in Vaudrac at Lanternmass. There are eleven still. Count the chimneys on your way down the hill.', next: 'row' },
      'pressed-fail': { speaker: 'npc:livia-marrou', mood: 'angry', text: 'Someone is helping it. Yes. The saint. Buy a leaf or go back to your priest.' },
      'pressed-ok': { speaker: 'npc:livia-marrou', mood: 'afraid', text: '(Her hands go still on the basket.) …If you must know, come at night. Come and see. And then decide whether you are the village’s friend, or the Curia’s, because you cannot be both. I have tried.' },
      pressed: {
        speaker: 'npc:livia-marrou', mood: 'afraid', text: 'You have been out in the row. (It is not a question.) He is sixteen. He is all the winter has left me. If you are going to the priest, go. But walk through the village on your way, and count the chimneys that smoke.',
        choices: [
          { text: '“Does he know what it’s doing to him?”', to: 'cough', once: true },
          { text: '“I haven’t decided anything yet.”', to: null },
        ],
      },
      cough: { speaker: 'npc:livia-marrou', mood: 'sad', text: 'He coughs. I hear him through the wall. Grey, in the mornings. I tell myself it is the cold. (She looks at you.) Do not tell me what it is. I know what it is. I am his mother, not a fool.' },
      'after-exposed': { speaker: 'npc:livia-marrou', mood: 'angry', text: 'Get off my land. The row is black. My son is in Valcastre. The pilgrims have gone back to the city with nothing in their hands, and so shall we, by spring. Get off my land.' },
      'after-licensed': { speaker: 'npc:livia-marrou', text: 'He writes. From Solenne. He says they feed him, and the masters are kind, and he is not allowed to tell me what they teach. (She folds the letter very small.) The row is going black from the bottom, a vine at a time. I am letting it.' },
      'after-unproven': { speaker: 'npc:livia-marrou', mood: 'happy', text: 'A season. You gave us a season. He sleeps at night now. I had forgotten what he looks like asleep. Like his father. Exactly like.' },
      'after-kept-warm': { speaker: 'npc:livia-marrou', text: 'The stone has been warmer since you touched it. He does not kneel so long. He coughs less. The saint provides. (Very quietly.) With help.' },
      'after-kept': { speaker: 'npc:livia-marrou', mood: 'sad', text: 'The saint provides. (She does not look at you.) He coughs worse. The saint provides.' },
    },
  },
  {
    id: 'dialogue:obj-lc-saints-rest', name: 'Object: The Saint’s Rest',
    entries: [
      { when: f(V('stone_warmed')), node: 'warmed' },
      { when: { all: [at(VINES, 'verdict'), f(V('caught'))] }, node: 'warm-offer' },
      { when: at(VINES, 'row'), node: 'examine' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'narrator', text: 'A waist-high block of the white coast stone at the head of a row of vines, worn into a hollow on top like a cupped palm. Letters are cut into its face, nearly rubbed away by hands: HIC SEDIT SOLENNA CVM IGNE. Here Solenne sat, with the fire.' },
      examine: { speaker: 'narrator', effects: [{ setFlag: V('stone_seen'), value: true }], text: 'A waist-high block of white stone, worn into a hollow on top like a cupped palm: HIC SEDIT SOLENNA CVM IGNE. You lay your marked hand in the hollow. It is warm, faintly, like a hearthstone the morning after, and the Ashmark aches in answer: the same ache as at the dead Brand, but very small and very far away. Something was set down here once, and the stone has not forgotten it.', next: 'examine2' },
      examine2: { speaker: 'narrator', text: 'But the warmth is gone a pace from the stone, and the row runs two hundred paces down the hill, green to the last vine. In the snow between the vines, at the foot of every root, there is a small black scorch-mark, the size and shape of two hands pressed side by side.' },
      'warm-offer': {
        speaker: 'narrator', text: 'The hollow is as faintly warm as it was. The stone has been doing what it can on its own. A boy has been doing the rest, and paying for it with his chest. You could give the stone more than either of them has.',
        choices: [
          { text: '[Ashmark] Lay your marked hand in the hollow, and let the heat go out of you into the stone.', to: 'warming', effects: [{ setFlag: V('stone_warmed'), value: true }] },
          { text: 'Leave it be.', to: null, tag: 'leave' },
        ],
      },
      warming: { speaker: 'narrator', text: 'The heat goes out of your palm the way water goes out of a cracked jug, steadily, without hurry. The Ashmark throbs, and then aches, and then is quiet. When you lift your hand the stone is as warm as a loaf from the oven, and all along the row the snow slumps off the vines in soft wet falls. It will not last for ever. It will last a season.' },
      warmed: { speaker: 'narrator', text: 'The Saint’s Rest is warm to the touch, and the snow will not lie on it.' },
    },
  },
  {
    // also the route for npc:iacopo-marrou, who is only in the row at night
    id: 'dialogue:obj-lc-vine-row', name: 'Object: The Saint’s Row (Iacopo)',
    entries: [
      { when: f(V('iacopo_taken')), node: 'taken' },
      { when: eq(V('outcome'), 'unproven'), node: 'after-unproven' },
      { when: eq(V('outcome'), 'licensed'), node: 'after-licensed' },
      { when: eq(V('outcome'), 'kept'), node: 'after-kept' },
      { when: { all: [f(V('caught')), { questActive: VINES }] }, node: 'again' },
      { when: { all: [at(VINES, 'night'), { hour: [20, 6] }] }, node: 'catch' },
      { when: at(VINES, 'night'), node: 'day' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'narrator', text: 'A row of vines running down the terrace, staked and tied in the old way. Every other row on the hillside is black under the snow. This one is green.' },
      day: { speaker: 'narrator', text: 'By day the Saint’s Row is full of pilgrims kneeling in the snow, and Livia Marrou’s girls going up and down among them selling leaves at a copper each. Whatever keeps the row green, it does not do it where anyone can see. Come back after dark.' },
      catch: { speaker: 'narrator', effects: [{ setFlag: V('caught'), value: true }], text: 'Halfway down the row, in the dark, there is a light where no lamp is. A boy is kneeling in the snow between the vines with both hands pressed flat to the earth at a root, and the snow around his hands is steaming. He is coughing, quietly, into his shoulder, so as not to be heard from the house.', next: 'iacopo' },
      iacopo: { speaker: 'npc:iacopo-marrou', mood: 'afraid', text: 'Don’t, please, don’t shout. If I stop in the middle it goes out, and I have to start the root again.', next: 'hub' },
      again: { speaker: 'npc:iacopo-marrou', mood: 'afraid', text: 'You came back. Have you told him? The priest? (He does not take his hands off the root.)', next: 'hub' },
      hub: {
        speaker: 'npc:iacopo-marrou', text: 'Ask, then. I can talk and do it. I’ve had practice.',
        choices: [
          { text: '“How long have you been doing this?”', to: 'how', once: true },
          { text: '“Who taught you?”', to: 'taught', once: true },
          { text: '“You’re drawing ember without a licence. You know what the Wick does.”', to: 'wick', once: true },
          { text: '[Arcanist] “You’re drawing it through your own chest, not the ground. That cough is cinderlung.”', to: 'lung', when: { classIs: 'class:arcanist' }, tag: 'class', once: true, effects: [{ unlockLore: 'lore:cinderlung' }] },
          { text: '[Reaver] “You’re feeding it from yourself. I know that price. It doesn’t get cheaper.”', to: 'blood', when: { classIs: 'class:reaver' }, tag: 'class', once: true },
          { text: '“Stop for tonight. Go home and sleep.”', to: 'home' },
        ],
      },
      how: { speaker: 'npc:iacopo-marrou', text: 'Since the night the star fell. Every vine went black in a night, and Mother sat in the kitchen and would not speak. I went out to the stone to pray. I put my hands in the hollow, and it was warm. Not much. Like it was trying. And I thought, if I help it…', next: 'hub' },
      taught: { speaker: 'npc:iacopo-marrou', mood: 'afraid', text: 'No one. It is just there, when I am cold enough, like something under the ice. Is that wrong? Is it the Mire? Brother Fulvio says the Mire comes in through the cold.', next: 'hub' },
      wick: { speaker: 'npc:iacopo-marrou', mood: 'afraid', text: 'I know. Everyone knows. There was a man down the coast, when my mother was a girl, who called fire to bring rain and burned the whole harvest, and half the houses. They still say it at Lanternmass to frighten children. I am not like him. I am careful. I only ever do one root at a time.', next: 'hub' },
      lung: { speaker: 'npc:iacopo-marrou', mood: 'sad', text: 'I know what it is. I am not stupid. (He coughs, and looks at his sleeve, and wipes it on his breeches.) There are eleven children in the village under five. I counted. I am only one.', next: 'hub' },
      blood: { speaker: 'npc:iacopo-marrou', mood: 'sad', text: 'You do it too? (He looks at your hands, then his.) Does it ever stop feeling like you are pouring yourself into a crack in the floor?', next: 'hub' },
      home: { speaker: 'npc:iacopo-marrou', mood: 'sad', text: '(He looks at the green row, and the black hillside beyond it, and does not move.) When this root is done. Just this one. Then I will.' },
      taken: { speaker: 'narrator', text: 'The Saint’s Row is as black as every other row on the hillside now. At the foot of each root the old scorch-marks are still there in the snow, the size of a boy’s two hands.' },
      'after-unproven': { speaker: 'narrator', text: 'The Saint’s Row is green under the snow, and at night no one kneels in it. The scorch-marks at the roots have been snowed over.' },
      'after-licensed': { speaker: 'narrator', text: 'The Saint’s Row is going black from the bottom of the hill up, a vine at a time. No one is in it at night.' },
      'after-kept': { speaker: 'npc:iacopo-marrou', mood: 'sad', text: 'The priest wrote “miracle”. Did you know? (He coughs.) So now I cannot stop. If it goes black, everyone will know there never was one.' },
    },
  },
  // ===== The Pilgrim’s Candle
  {
    id: 'dialogue:side-lc-candle-eydis', name: 'Eydis Long-Road: The Pilgrim’s Candle',
    entries: [
      { when: { all: [{ questCompleted: CANDLE }, eq('act2.moot_outcome', 'stolen')] }, node: 'after-stolen' },
      { when: { all: [{ questCompleted: CANDLE }, eq('act2.moot_outcome', 'allied')] }, node: 'after-allied' },
      { when: { questCompleted: CANDLE }, node: 'after' },
      { when: { all: [at(CANDLE, 'farewell'), eq(C('flame'), 'wick')] }, node: 'farewell' },
      { when: { questActive: CANDLE }, node: 'waiting' },
      { when: offer(CANDLE), node: 'offer' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'npc:eydis-long-road', text: 'Sit, if you are cold. I am not praying. I have finished with that for today.' },
      offer: { speaker: 'narrator', text: 'At the very end of a row of kneeling pilgrims sits an old woman in Hrothi furs, with a pilgrim’s grey scarf wound over them and a lantern of northern bronze in her lap. She is the only one in the row who is not facing the cathedral. She is facing north.', next: 'offer2' },
      offer2: {
        speaker: 'npc:eydis-long-road', text: 'You are not praying either. Good. I am tired of the sound of it. I walked from Skelvik, southerner. Over the Ironspine in the snow, down through your Haldmarch, along the Pilgrim’s Road. Eighteen months. I set out the spring before the star fell. And I came to the gate, and a boy in white told me the fire was dead.',
        choices: [
          { text: '“Why did you come so far?”', to: 'why' },
          { text: '“I’m sorry.” (Leave her be.)', to: null, tag: 'leave' },
        ],
      },
      why: { speaker: 'npc:eydis-long-road', text: 'My son Thrain went south with Hrolf Frostbeard when he was nineteen, to the Northern Pass. Three hundred went. Forty came home. Not Thrain. A priest of yours, a Haldish priest who followed Harrow’s army, buried our dead on the pass with his own hands, every one, under a cairn, and set a lamp on it, lit from his lantern, lit from your Brand.', next: 'why2' },
      why2: { speaker: 'npc:eydis-long-road', text: 'Then he walked north over the pass alone, in winter, to tell the mothers where their sons were. He sat in my hall and wept for my son, whom his people had killed. I took his Lantern for that. Not for the Church. For him.', next: 'why3' },
      why3: {
        speaker: 'npc:eydis-long-road', mood: 'sad', text: 'The lamp on the cairn went out long ago. When my husband was dead and there was no one left to promise anything, I promised Thrain I would bring a new flame from the place the priest’s came from. (She lifts the cold lantern a little.) And now there is no place.',
        choices: [
          { text: '“I’ll find you a flame.”', to: 'promise', effects: [{ startQuest: CANDLE }] },
          { text: '[Ashmark] “The Brand isn’t gone. It broke. Part of it is in my hand.”', to: 'ashmark', effects: [{ startQuest: CANDLE }, { setFlag: C('flame'), value: 'ashmark' }] },
          { text: '“I can’t help you.”', to: null, tag: 'leave' },
        ],
      },
      promise: { speaker: 'npc:eydis-long-road', text: 'They say the Lord-Inquisitor has gathered every lamp the Brand ever lit that still burns, up in the black fortress on the road. I went to the gate and asked. They laughed. Perhaps they will not laugh at you.' },
      waiting: {
        speaker: 'npc:eydis-long-road', text: 'Have you a flame for me?',
        choices: [
          { text: '[Ashmark] Hold your marked hand to the lantern’s wick.', to: 'ashmark', when: not(f(C('flame'))), effects: [{ setFlag: C('flame'), value: 'ashmark' }] },
          { text: '[Devout] “Ithren is the lamp by the door, not the lamp in the cathedral. Any fire that brings a traveller home is his.”', to: 'hearth', when: { all: [not(f(C('flame'))), { dialogueTag: 'devout' }] }, tag: 'trait', effects: [{ setFlag: C('flame'), value: 'hearth' }] },
          { text: '[Oathbound] “I am Lightsworn. I may bless a fire in Ithren’s name, and I will bless yours.”', to: 'hearth', when: { all: [not(f(C('flame'))), { classIs: 'class:oathbound' }] }, tag: 'class', effects: [{ setFlag: C('flame'), value: 'hearth' }] },
          { text: '“Your priest didn’t carry the Brand up to the pass. He carried a lamp, and himself. Light yours at the pilgrims’ fire, where everyone who walked here has laid a stick.”', to: 'hearth-ok', when: not(f(C('flame'))), tag: 'persuade', check: { stat: 'will', dc: 15, failTo: 'hearth-fail' } },
          { text: '“Not yet.”', to: null, tag: 'leave' },
        ],
      },
      'hearth-fail': { speaker: 'npc:eydis-long-road', mood: 'angry', text: 'You talk like the boys at the gate. Words are cold, southerner. I did not walk eighteen months for words.' },
      'hearth-ok': { speaker: 'npc:eydis-long-road', effects: [{ setFlag: C('flame'), value: 'hearth' }], text: '(She is quiet for a long time.) …He did, didn’t he. He carried himself. Up a pass full of dead men who would have killed him a day before.', next: 'hearth' },
      hearth: { speaker: 'narrator', effects: [{ setFlag: C('lit'), value: true }], text: 'She gets up, stiffly, and walks with you to the great fire in the middle of the camp, the one every pilgrim feeds with a stick on the day they arrive. She lights a spill at it, and lights the lantern from the spill, and shuts the little bronze door with a click.', next: 'hearth2' },
      hearth2: { speaker: 'npc:eydis-long-road', mood: 'happy', text: 'Everyone who walked here is in that fire. From every road. That is better than one coal in a gold box, I think. Thrain would like it. He never could sit still, either. (She settles the lantern under her cloak.) North, then. It is a long way. I know exactly how long.' },
      ashmark: { speaker: 'narrator', effects: [{ setFlag: C('lit'), value: true }], text: 'You open the lantern’s little door and hold your marked hand to the wick. For a moment nothing. Then the Ashmark burns, and a flame stands up on the wick, small and steady and white-gold: the colour the old lamps are in the paintings, the colour no lamp has been for a year.', next: 'ashmark2' },
      ashmark2: {
        speaker: 'npc:eydis-long-road', text: '(She does not touch it. She does not breathe on it.) …Is it the Brand’s fire?',
        choices: [
          { text: '“It’s the Brand’s fire. What’s left of it.”', to: 'ashmark-yes' },
          { text: '“I don’t know what it is. It’s mine.”', to: 'ashmark-mine' },
        ],
      },
      'ashmark-yes': { speaker: 'npc:eydis-long-road', mood: 'happy', text: 'Then I will tell them at the pass that the fire did not die. That it broke, and walked north in a stranger’s hand. They will not believe me. They never believe old women. They will come to look anyway.' },
      'ashmark-mine': { speaker: 'npc:eydis-long-road', mood: 'happy', text: 'Then it is better. The priest’s was his, too. That was the whole of it. (She shuts the little door.) North, then.' },
      farewell: { speaker: 'narrator', effects: [{ setFlag: C('lit'), value: true }], text: 'You have shielded the taper from Valcastre all the way down the Pilgrim’s Road. Eydis opens the lantern’s little door with hands that shake, and you touch the taper to the wick. The flame stands up, white-gold, and leans, very slightly, north.', next: 'farewell2' },
      farewell2: { speaker: 'npc:eydis-long-road', mood: 'happy', text: 'North. It knows. (She laughs, the first time you have heard her laugh.) Of course it knows. It came up from the bottom of the world; it can find a pass.' },
      after: { speaker: 'npc:eydis-long-road', text: 'It burns on the cairn. Look. (She lays her hand on the stones.) Thrain. Nineteen. The priest’s name was Wystan. I never knew the rest of it. I suppose I never needed it.' },
      'after-allied': { speaker: 'npc:eydis-long-road', text: 'The young ones came down from the Moot singing that the clans had kept the peace. I lit the lamp on the cairn the same night. Thrain would have been angry. He wanted the south. Then, later, he would have been glad.' },
      'after-stolen': { speaker: 'npc:eydis-long-road', mood: 'sad', text: 'The war-horns came over the pass three days after I did. They say a southerner stole Calun’s Eye off the Moot-stones. I tell them a southerner carried fire north as well. They do not want to hear it. (She keeps the lantern under her cloak, out of sight of the road.)' },
    },
  },
  {
    id: 'dialogue:obj-lc-last-wicks', name: 'Object: The Lantern Room, Valcastre',
    entries: [
      { when: f(C('flame')), node: 'done' },
      { when: { questActive: CANDLE }, node: 'door' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'narrator', text: 'A narrow iron door high in the fortress, with the Wick’s scissors stamped in the middle of it. Warmth comes through the keyhole, and a thread of gold light, and the smell of good oil. An old Lightsworn on a stool beside it watches you until you walk on.' },
      door: {
        speaker: 'narrator', text: 'The old Lightsworn on the stool by the iron door gets to his feet. “No one goes in but the Lord-Inquisitor and the bell-founder,” he says. “Those are his lamps. Every one of them is counted, morning and night. I count them.”',
        choices: [
          { text: '[Wick papers] “Under the Lord-Inquisitor’s writ. One taper, for a pilgrim.”', to: 'writ', when: { hasItem: 'item:wick-writ' }, effects: [{ setFlag: C('flame'), value: 'wick' }, { setFlag: C('vellane_knows'), value: true }] },
          { text: '“A Hrothi widow walked eighteen months to light one lamp. One taper. He will never miss it.”', to: 'persuaded', when: not(f('act2.wick_hostile')), tag: 'persuade', check: { stat: 'will', dc: 15, failTo: 'refused' } },
          { text: '[Shade] Wait until he dozes on his stool, and open the lock.', to: 'picked', when: { classIs: 'class:shade' }, tag: 'class', effects: [{ setFlag: C('flame'), value: 'wick' }, { setFlag: C('stolen'), value: true }] },
          { text: 'Wait until he dozes, and try the lock.', to: 'picked-ok', check: { stat: 'finesse', dc: 15, failTo: 'caught' } },
          { text: 'Walk on.', to: null, tag: 'leave' },
        ],
      },
      writ: { speaker: 'narrator', text: 'He reads the writ twice, holding it to the keyhole’s light, and his mouth goes thin. “He will know,” he says. “I write down every taper.” He unlocks the door.', next: 'room' },
      persuaded: { speaker: 'narrator', effects: [{ setFlag: C('flame'), value: 'wick' }], text: 'He looks at you a long while. “My mother was a pilgrim,” he says at last. “She walked from Aurenac with a lamp. One taper. I will write that it guttered.” He unlocks the door.', next: 'room' },
      refused: { speaker: 'narrator', text: '“I am sorry for her,” the old man says, and sits back down on his stool in front of the door. “I am sorry for all of them. Walk on.”' },
      'picked-ok': { speaker: 'narrator', effects: [{ setFlag: C('flame'), value: 'wick' }, { setFlag: C('stolen'), value: true }], text: 'You wait in the stair-turn until his chin is on his chest, and then a while longer. The lock is good Orrun work, and stiff with cold, and it takes you a long time.', next: 'room' },
      picked: { speaker: 'narrator', text: 'You wait in the stair-turn until his chin is on his chest. The lock is good Orrun work. You have opened better.', next: 'room' },
      caught: { speaker: 'narrator', effects: [{ reputation: 'faction:order-of-the-wick', delta: -5 }], text: 'The lock is stiff with cold, and it squeals. The old man is on his feet with his mace out before you have your pick back. “Out,” he says. “Out, before I ring. I will say I saw nothing. I am too old for the paperwork.”' },
      room: { speaker: 'narrator', effects: [{ unlockLore: 'lore:castor-vellane', section: 'lanterns' }], text: 'Inside is a small, warm, white room, and in it, on shelves and on the floor, stand a dozen lanterns of every make: a chapel lamp from the Haldmarch, a ship’s lantern, a little tin pilgrim’s lamp with a dent in it. Every one is burning, and every flame leans the same way, toward the same point in the wall, as plants lean toward a window. You light a taper from the tin pilgrim’s lamp. Its flame leans with the others.' },
      done: { speaker: 'narrator', text: 'Behind the iron door the last Brand-lit lamps burn on, all leaning the same way.' },
    },
  },
];

export default dialogues;
